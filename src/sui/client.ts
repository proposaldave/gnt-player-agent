/**
 * Sui Client — Connects to Sui testnet for on-chain operations.
 * Uses Sui SDK v2 (CoreClient + BaseClient + extensions).
 */

import { CoreClient, BaseClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { requestSuiFromFaucetV2, getFaucetHost } from '@mysten/sui/faucet';
import { CONFIG } from '../config.js';

let _coreClient: any = null;
let _suiClient: any = null;
let _keypair: Ed25519Keypair | null = null;

function getCoreClient(): any {
  if (!_coreClient) {
    const url = CONFIG.network === 'testnet'
      ? 'https://fullnode.testnet.sui.io:443'
      : 'https://fullnode.mainnet.sui.io:443';
    _coreClient = new (CoreClient as any)({ url });
  }
  return _coreClient;
}

export function getSuiClient(): any {
  if (!_suiClient) {
    const core = getCoreClient();
    const base = new (BaseClient as any)(core);
    _suiClient = base.$extend({ name: 'core', register: () => core });
  }
  return _suiClient;
}

/** Get Seal-compatible client */
export function getSealCompatibleClient(): any {
  return getSuiClient();
}

export function getAgentKeypair(): Ed25519Keypair {
  if (!_keypair) {
    if (!CONFIG.suiPrivateKey) {
      throw new Error('SUI_PRIVATE_KEY not set');
    }
    _keypair = Ed25519Keypair.fromSecretKey(CONFIG.suiPrivateKey);
  }
  return _keypair;
}

export function getAgentAddress(): string {
  return getAgentKeypair().toSuiAddress();
}

/** Create a player agent on-chain */
export async function createPlayerAgent(
  displayName: string,
  skillRating: number,
  playStyleCode: number,
): Promise<{ agentId: string; adminCapId: string; digest: string }> {
  const client = getSuiClient();
  const keypair = getAgentKeypair();

  const tx = new Transaction();
  tx.moveCall({
    target: `${CONFIG.packageId}::player_agent::mint_agent`,
    arguments: [
      tx.pure.string(displayName),
      tx.pure.u8(Math.min(Math.round(skillRating * 10), 50)),
      tx.pure.u8(playStyleCode),
      tx.pure.vector('u8', [4]),
      tx.object('0x6'),
    ],
  });

  const result = await client.core.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showObjectChanges: true, showEffects: true },
  });

  let agentId = '';
  let adminCapId = '';
  for (const change of result.objectChanges || []) {
    if (change.type === 'created') {
      if (change.objectType.includes('PlayerAgent')) agentId = change.objectId;
      else if (change.objectType.includes('AgentAdminCap')) adminCapId = change.objectId;
    }
  }
  return { agentId, adminCapId, digest: result.digest };
}

/** Store encrypted signal on-chain */
export async function storeSealedSignal(
  agentId: string,
  adminCapId: string,
  signalTypeCode: number,
  confidence: number,
  nonce: Uint8Array,
  encryptedData: Uint8Array,
): Promise<{ signalId: string; digest: string }> {
  const client = getSuiClient();
  const keypair = getAgentKeypair();

  const tx = new Transaction();
  tx.moveCall({
    target: `${CONFIG.packageId}::sealed_signals::store_sealed_signal`,
    arguments: [
      tx.object(agentId),
      tx.object(adminCapId),
      tx.pure.u8(signalTypeCode),
      tx.pure.u8(confidence),
      tx.pure.vector('u8', Array.from(nonce)),
      tx.pure.vector('u8', Array.from(encryptedData)),
      tx.object('0x6'),
    ],
  });

  const result = await client.core.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showObjectChanges: true },
  });

  let signalId = '';
  for (const change of result.objectChanges || []) {
    if (change.type === 'created' && change.objectType?.includes('SealedSignal')) {
      signalId = change.objectId;
    }
  }
  return { signalId, digest: result.digest };
}

/** Get object from Sui */
export async function getObject(objectId: string): Promise<unknown> {
  return getSuiClient().core.getObject({
    id: objectId,
    options: { showContent: true, showType: true },
  });
}

/** Request testnet tokens */
export async function requestTestnetTokens(address?: string): Promise<void> {
  const addr = address || getAgentAddress();
  await requestSuiFromFaucetV2({ host: getFaucetHost('testnet'), recipient: addr });
  console.log(`[Sui] Requested testnet tokens for ${addr}`);
}
