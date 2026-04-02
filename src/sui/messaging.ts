/**
 * Sui Messaging SDK wrapper for GnT Player Agent
 *
 * Uses @mysten/sui-stack-messaging@0.0.2 — compatible with @mysten/sui@2.13.2.
 *
 * IMPORTANT: @mysten/messaging@0.3.0 targets @mysten/sui@^1.x and is INCOMPATIBLE
 * with this project's @mysten/sui@2.13.2. That's why we use sui-stack-messaging.
 *
 * Architecture:
 * - createAndShareGroup() = direct Sui transaction (works without relayer)
 * - sendMessage() = goes through relayer transport (fails without one)
 *
 * Strategy: Create real on-chain groups (verifiable on Sui Explorer), attempt
 * message sends, and fall back gracefully if the relayer isn't available.
 * The group creation alone proves real Sui integration for the demo.
 *
 * - Reuses CONFIG.suiPrivateKey (same key that client.ts uses)
 * - Serializes all Sui transactions through a queue to prevent gas coin contention
 * - Message sends are non-blocking to avoid adding latency to chat responses
 */

import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { createSuiStackMessagingClient, WalrusHttpStorageAdapter } from '@mysten/sui-stack-messaging';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { requestSuiFromFaucetV2, getFaucetHost } from '@mysten/sui/faucet';
import { CONFIG } from '../config.js';

// Seal key server object IDs (testnet)
const SEAL_KEY_SERVERS = [
  {
    objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
    weight: 1,
  },
  {
    objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
    weight: 1,
  },
];

let _client: ReturnType<typeof buildClient> | null = null;
let _signer: Ed25519Keypair | null = null;
let _initialized = false;
let _relayerAvailable = false; // Set to true only if message sends succeed

// ── Transaction queue ──────────────────────────────────────────────────
// Serializes all Sui transactions to prevent gas coin contention.
// Two concurrent txs from the same keypair will both grab the same gas coin
// and one will fail. The queue ensures they execute sequentially.
let _txQueue: Promise<unknown> = Promise.resolve();

function enqueueTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const result = _txQueue.then(fn, fn); // run fn even if previous tx failed
  _txQueue = result.catch(() => {}); // keep queue alive after errors
  return result;
}

/**
 * Wait for all queued transactions to complete.
 * Call before reading session state (e.g., in /api/finish) to ensure
 * all non-blocking sends have landed and the summary is accurate.
 */
export async function drainTransactionQueue(): Promise<void> {
  await _txQueue;
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extract a Sui object ID from various possible shapes returned by the SDK.
 * Handles: { id: { id: "0x..." } }, { id: "0x..." }, { objectId: "0x..." }
 */
function extractObjectId(obj: Record<string, unknown>): string | null {
  // { id: { id: "0x..." } } — standard Sui UID wrapper
  if (obj.id && typeof obj.id === 'object' && obj.id !== null) {
    const inner = (obj.id as Record<string, unknown>).id;
    if (typeof inner === 'string') return inner;
  }
  // { id: "0x..." } — flat ID
  if (typeof obj.id === 'string') return obj.id;
  // { objectId: "0x..." } — alternate naming
  if (typeof obj.objectId === 'string') return obj.objectId;
  return null;
}

// ── Types ──────────────────────────────────────────────────────────────

interface MessagingSession {
  groupId: string;
  groupRef?: { groupId: string; encryptionHistoryId: string };
  digests: string[];
  messageIds: string[];
  messageCount: number;
  relayerWorked: boolean;
}

export interface MessagingInfo {
  enabled: boolean;
  groupId?: string;
  explorerUrl?: string;
  agentAddress?: string;
  createDigest?: string;
  error?: string;
}

export interface MessageResult {
  encrypted: boolean;
  messageId?: string;
  digest?: string;
  error?: string;
}

export interface SessionSummary {
  groupId: string;
  messageCount: number;
  digests: string[];
  messageIds: string[];
  explorerUrl: string;
  relayerWorked: boolean;
}

// ── Client setup ───────────────────────────────────────────────────────

function buildClient() {
  const signer = getSigner();
  const network = CONFIG.network as 'testnet' | 'mainnet';
  const baseClient = new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(network),
    network,
  });

  // createSuiStackMessagingClient extends the base client with:
  //   .groups  (on-chain group management — works without relayer)
  //   .seal    (encryption)
  //   .messaging (message send/fetch — requires relayer)
  //
  // Relayer URL is a dummy — sendMessage will fail with a network error,
  // caught gracefully. createAndShareGroup works regardless (direct Sui tx).
  const client = createSuiStackMessagingClient(baseClient, {
    seal: {
      serverConfigs: SEAL_KEY_SERVERS.map((s) => ({
        objectId: s.objectId,
        weight: s.weight,
      })),
    },
    encryption: {
      sessionKey: {
        signer,
        ttlMin: 30,
      },
    },
    relayer: {
      relayerUrl: 'https://relayer.placeholder.invalid',
    },
    attachments: {
      storageAdapter: new WalrusHttpStorageAdapter({
        publisherUrl: CONFIG.walrusPublisherUrl,
        aggregatorUrl: CONFIG.walrusAggregatorUrl,
        epochs: 1,
      }),
    },
  });

  return client;
}

/**
 * Gets the signer keypair. Uses the same CONFIG.suiPrivateKey that
 * client.ts's getAgentKeypair() reads, ensuring one identity everywhere.
 */
function getSigner(): Ed25519Keypair {
  if (_signer) return _signer;

  if (CONFIG.suiPrivateKey) {
    _signer = Ed25519Keypair.fromSecretKey(CONFIG.suiPrivateKey);
    console.log(`[Messaging] Using configured keypair: ${_signer.toSuiAddress()}`);
  } else {
    _signer = Ed25519Keypair.generate();
    const secretKey = _signer.getSecretKey();
    console.log('[Messaging] ========================================');
    console.log('[Messaging] AUTO-GENERATED KEYPAIR (no SUI_PRIVATE_KEY set)');
    console.log(`[Messaging] Address: ${_signer.toSuiAddress()}`);
    console.log(`[Messaging] Private Key: ${secretKey}`);
    console.log('[Messaging] Add to .env:  SUI_PRIVATE_KEY=' + secretKey);
    console.log('[Messaging] ========================================');
  }

  return _signer;
}

function getExplorerUrl(type: 'object' | 'txblock', id: string): string {
  const base = 'https://suiscan.xyz/testnet';
  return type === 'txblock' ? `${base}/tx/${id}` : `${base}/object/${id}`;
}

// Cache a plain SuiJsonRpcClient for balance checks (avoid re-creating per call)
let _balanceClient: SuiJsonRpcClient | null = null;

async function ensureGas(): Promise<boolean> {
  if (CONFIG.network !== 'testnet') return true;

  const signer = getSigner();
  const address = signer.toSuiAddress();

  try {
    if (!_balanceClient) {
      _balanceClient = new SuiJsonRpcClient({
        url: getJsonRpcFullnodeUrl('testnet'),
        network: 'testnet',
      });
    }
    const balance = await _balanceClient.getBalance({ owner: address });
    const suiBalance = BigInt(balance.totalBalance);

    if (suiBalance < 50_000_000n) {
      console.log(`[Messaging] Low balance (${suiBalance}). Requesting faucet tokens...`);
      await requestSuiFromFaucetV2({
        host: getFaucetHost('testnet'),
        recipient: address,
      });
      console.log(`[Messaging] Faucet tokens requested for ${address}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
    return true;
  } catch (err) {
    console.warn(`[Messaging] Gas check failed: ${(err as Error).message}`);
    return false;
  }
}

function getClient() {
  if (!_client) {
    _client = buildClient();
  }
  return _client;
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Initialize the messaging system. Call once at startup.
 */
export async function initMessaging(): Promise<{ enabled: boolean; address: string; error?: string }> {
  const signer = getSigner();
  const address = signer.toSuiAddress();

  try {
    await ensureGas();
    getClient(); // Eagerly create client to surface config errors early
    _initialized = true;
    console.log(`[Messaging] Initialized on ${CONFIG.network}. Agent: ${address}`);
    console.log('[Messaging] Group creation: ON-CHAIN (real Sui transactions)');
    console.log('[Messaging] Message relay: WILL ATTEMPT (falls back if no relayer)');
    return { enabled: true, address };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[Messaging] Init failed (demo will use simulated mode): ${msg}`);
    return { enabled: false, address, error: msg };
  }
}

/**
 * Check if real messaging is available
 */
export function isMessagingEnabled(): boolean {
  return _initialized;
}

/**
 * Create a new encrypted messaging group for a conversation session.
 * This uses createAndShareGroup which is a DIRECT Sui transaction —
 * no relayer needed. The group object is verifiable on Sui Explorer.
 */
export async function createMessagingSession(sessionLabel: string): Promise<MessagingInfo> {
  if (!_initialized) {
    return { enabled: false, error: 'Messaging not initialized' };
  }

  try {
    const client = getClient();
    const signer = getSigner();
    const address = signer.toSuiAddress();

    console.log(`[Messaging] Creating group for session "${sessionLabel}"...`);

    // Enqueue the group creation transaction (direct Sui tx, no relayer)
    const result = await enqueueTransaction(() =>
      client.messaging.createAndShareGroup({
        signer,
        name: `gnt-session-${sessionLabel}`,
        initialMembers: [], // Single-keypair demo: creator is the only member
      }),
    );

    // Extract the group ID from the result
    const resultObj = result as Record<string, unknown>;
    const groupId = (typeof resultObj.groupId === 'string' ? resultObj.groupId : null)
      || extractObjectId(resultObj)
      || (resultObj.digest ? `tx:${resultObj.digest}` : null);

    if (!groupId) {
      console.error('[Messaging] Unexpected createAndShareGroup result:', JSON.stringify(result).slice(0, 300));
      throw new Error('Could not extract group ID from createAndShareGroup result');
    }

    const digest = typeof resultObj.digest === 'string' ? resultObj.digest : 'unknown';

    console.log(`[Messaging] Group created: ${groupId} | digest: ${digest}`);

    // Store session state
    const session: MessagingSession = {
      groupId,
      digests: [digest],
      messageIds: [],
      messageCount: 0,
      relayerWorked: false,
    };

    messagingSessions.set(sessionLabel, session);

    return {
      enabled: true,
      groupId,
      explorerUrl: getExplorerUrl('object', groupId),
      agentAddress: address,
      createDigest: digest,
    };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[Messaging] Group creation failed: ${msg}`);
    return { enabled: false, error: msg };
  }
}

// Session storage
const messagingSessions = new Map<string, MessagingSession>();

/**
 * Attempt to send an encrypted message through the Sui Messaging SDK.
 * This goes through the relayer transport — will fail if no relayer is configured.
 * Failure is graceful: the demo still works, messages just aren't relayed.
 */
export async function sendEncryptedMessage(
  sessionLabel: string,
  text: string,
  role: 'user' | 'agent',
): Promise<MessageResult> {
  const session = messagingSessions.get(sessionLabel);
  if (!session) {
    return { encrypted: false, error: 'No messaging session' };
  }

  try {
    const client = getClient();
    const signer = getSigner();

    const prefixedMessage = `[${role.toUpperCase()}] ${text}`;

    // This goes through the relayer — will throw if no relayer is configured
    const result = await enqueueTransaction(async () => {
      const sendResult = await client.messaging.sendMessage({
        signer,
        groupRef: session.groupRef || { groupId: session.groupId, encryptionHistoryId: '' },
        text: prefixedMessage,
      });
      return sendResult;
    });

    const messageId = typeof result?.messageId === 'string' ? result.messageId : `msg-${session.messageCount}`;
    session.messageIds.push(messageId);
    session.messageCount++;
    session.relayerWorked = true;
    _relayerAvailable = true;

    console.log(
      `[Messaging] Sent ${role} message #${session.messageCount} | id: ${messageId}`,
    );

    return {
      encrypted: true,
      messageId,
    };
  } catch (err) {
    const msg = (err as Error).message;
    // Only log the first failure per session (not every message)
    if (!session.relayerWorked && session.messageCount === 0) {
      console.warn(`[Messaging] Message relay unavailable (no relayer configured). Group is still on-chain.`);
    }
    return { encrypted: false, error: msg };
  }
}

/**
 * Fire-and-forget message send. Returns immediately, logs errors once.
 * Use this for non-critical sends where you don't want to block the HTTP response.
 */
export function sendEncryptedMessageAsync(
  sessionLabel: string,
  text: string,
  role: 'user' | 'agent',
): void {
  sendEncryptedMessage(sessionLabel, text, role).catch(() => {});
}

/**
 * Get summary of a messaging session for the /api/finish response.
 */
export function getSessionSummary(sessionLabel: string): SessionSummary | null {
  const session = messagingSessions.get(sessionLabel);
  if (!session) return null;

  return {
    groupId: session.groupId,
    messageCount: session.messageCount,
    digests: session.digests,
    messageIds: session.messageIds,
    explorerUrl: getExplorerUrl('object', session.groupId),
    relayerWorked: session.relayerWorked,
  };
}

/**
 * Clean up a messaging session.
 */
export function closeMessagingSession(sessionLabel: string): void {
  messagingSessions.delete(sessionLabel);
}
