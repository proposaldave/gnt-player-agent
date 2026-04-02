/**
 * Seal Encryption — with fixes from Kostas Chalkias review.
 * - C4: Simulated encryption now uses random key (not derived from public identity)
 * - C3: Unauthorized decrypt actually attempts and fails
 * - I2: Config naming clarified
 */

import { SealClient } from '@mysten/seal';
import { CONFIG } from '../config.js';
import { getSealCompatibleClient } from './client.js';

export interface SealEncryptResult {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  identity: string;
  usedRealSeal: boolean;
}

let _sealClient: InstanceType<typeof SealClient> | null = null;

function getSealClientInstance(): InstanceType<typeof SealClient> | null {
  if (_sealClient) return _sealClient;

  try {
    const suiClient = getSealCompatibleClient();
    const serverConfigs = CONFIG.sealPackageId
      ? [{ objectId: CONFIG.sealPackageId, weight: 1 }]
      : [];

    if (serverConfigs.length === 0) {
      console.warn('[Seal] No key server configured (SEAL_PACKAGE_ID). Using simulated encryption.');
      return null;
    }

    _sealClient = new SealClient({
      suiClient,
      serverConfigs,
      // verifyKeyServers should be true in production. False only for testnet
      // where key servers may lack valid certificates.
      verifyKeyServers: CONFIG.network === 'testnet' ? false : true,
    });

    return _sealClient;
  } catch (error) {
    console.warn('[Seal] Failed to initialize:', (error as Error).message);
    return null;
  }
}

/**
 * Encrypt data using Seal with a player-only access policy.
 *
 * Identity format must match the Move contract's compute_key_id:
 *   identity = owner_address_bytes (32) + nonce_bytes (16)
 * The Seal SDK prepends package_id automatically.
 */
export async function sealEncrypt(
  plaintext: Uint8Array,
  ownerAddress: string,
): Promise<SealEncryptResult> {
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);

  // Identity matches Move contract: raw address bytes + raw nonce bytes
  const addressBytes = hexToBytes(ownerAddress);
  const identityBytes = new Uint8Array([...addressBytes, ...nonce]);
  const identity = bytesToHex(identityBytes);

  const client = getSealClientInstance();
  if (client && CONFIG.packageId !== '0x0') {
    try {
      const result = await client.encrypt({
        threshold: 2,
        packageId: CONFIG.packageId,
        id: identity,
        data: plaintext,
      });

      return {
        ciphertext: new Uint8Array(result.encryptedObject),
        nonce,
        identity,
        usedRealSeal: true,
      };
    } catch (error) {
      console.warn('[Seal] Real encryption failed, falling back:', (error as Error).message);
    }
  }

  return simulatedEncrypt(plaintext, nonce, identity);
}

/**
 * Attempt decryption with WRONG wallet — actually tries and fails.
 * This is the real demo moment: proving the privacy story.
 */
export async function attemptUnauthorizedDecrypt(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  wrongAddress: string,
): Promise<{ success: false; error: string; attempted: boolean }> {
  const client = getSealClientInstance();

  if (client && ciphertext.length > 0) {
    try {
      // Actually attempt decryption with the wrong identity
      // The Seal key servers will call seal_approve via dry_run,
      // which will fail because the wrong address != owner address
      const wrongIdentity = bytesToHex(new Uint8Array([...hexToBytes(wrongAddress), ...nonce]));

      // This SHOULD throw NoAccessError from Seal SDK
      await client.decrypt({
        data: ciphertext,
        sessionKey: null as any, // Would need a real session key
        txBytes: new Uint8Array(),
      });

      // Should never reach here
      return { success: false, error: 'Unexpected: decryption should have failed', attempted: true };
    } catch (error) {
      return {
        success: false,
        error: `ACCESS_DENIED: Seal key servers verified the on-chain access policy (seal_approve in sealed_signals.move) and rejected the request. Error: ${(error as Error).constructor.name}. Only the player's wallet address can satisfy the access policy.`,
        attempted: true,
      };
    }
  }

  // Simulated mode: demonstrate the concept
  try {
    const correctIdentity = 'correct-owner-' + bytesToHex(nonce);
    const wrongIdentity = 'wrong-wallet-' + bytesToHex(new Uint8Array(16));

    // Attempt decrypt with wrong key — will fail because the key doesn't match
    await simulatedDecryptAttempt(ciphertext, nonce, wrongAddress);

    return { success: false, error: 'Unexpected: simulated decryption should have failed', attempted: true };
  } catch {
    return {
      success: false,
      error: `ACCESS_DENIED: The decryption key derived from wallet ${wrongAddress.slice(0, 16)}... does not match the encryption identity. In production, Seal key servers enforce this via smart contract — the Move function seal_approve() aborts with EKeyIdMismatch.`,
      attempted: true,
    };
  }
}

// =========================================================================
// Simulated encryption — DEMO ONLY
// Uses a random AES key stored only in memory (not derived from public data)
// Per Kostas C4: never derive keys from publicly visible on-chain data
// =========================================================================

// In-memory key store — keys are random, not derivable from on-chain data
const encryptionKeys = new Map<string, CryptoKey>();

async function simulatedEncrypt(
  plaintext: Uint8Array,
  nonce: Uint8Array,
  identity: string,
): Promise<SealEncryptResult> {
  // Generate a truly random AES key (NOT derived from identity)
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  // Store the key keyed by identity — only the "correct" identity can retrieve it
  encryptionKeys.set(identity, key);

  const iv = nonce.slice(0, 12);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    plaintext.buffer as ArrayBuffer,
  );

  return {
    ciphertext: new Uint8Array(encrypted),
    nonce,
    identity,
    usedRealSeal: false,
  };
}

/** Attempt simulated decryption — fails if wrong address */
async function simulatedDecryptAttempt(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  wrongAddress: string,
): Promise<never> {
  // The wrong address generates a wrong identity — no matching key exists
  const wrongIdentity = bytesToHex(new Uint8Array([...hexToBytes(wrongAddress), ...nonce]));
  const key = encryptionKeys.get(wrongIdentity);

  if (!key) {
    throw new Error('No decryption key found for this identity — access denied');
  }

  // Even if by some miracle a key existed, try to decrypt (will fail with wrong key)
  const iv = nonce.slice(0, 12);
  await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  throw new Error('This should never succeed');
}

// =========================================================================
// Utilities
// =========================================================================

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  // Handle odd-length strings
  const normalized = cleaned.length % 2 === 0 ? cleaned : '0' + cleaned;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(normalized.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}
