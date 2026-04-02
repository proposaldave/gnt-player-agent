/**
 * Walrus Storage — Decentralized blob storage for encrypted data.
 *
 * Walrus stores encrypted conversation transcripts and preference data.
 * Combined with Seal encryption, this means:
 * - Data is stored on Walrus (decentralized, not on any single server)
 * - Data is encrypted with Seal (only authorized wallets can decrypt)
 * - References are stored on Sui (ownership + access control on-chain)
 *
 * Flow:
 * 1. Encrypt data with Seal → ciphertext
 * 2. Store ciphertext on Walrus → blob_id
 * 3. Store blob_id reference on Sui → owned object
 * 4. To read: fetch blob from Walrus → decrypt with Seal (requires wallet)
 */

import { CONFIG } from '../config.js';

interface WalrusStoreResult {
  blobId: string;
  suiObjectId?: string;
  cost?: number;
  size: number;
}

interface WalrusRetrieveResult {
  data: Uint8Array;
  blobId: string;
}

/**
 * Store encrypted data on Walrus.
 *
 * @param data - Encrypted data (ciphertext from Seal)
 * @param epochs - Number of epochs to store (1 epoch ≈ 1 day on testnet)
 * @returns Blob ID for retrieval
 */
export async function walrusStore(
  data: Uint8Array,
  epochs: number = 5,
): Promise<WalrusStoreResult> {
  const publisherUrl = CONFIG.walrusPublisherUrl;

  try {
    const response = await fetch(`${publisherUrl}/v1/blobs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: data.buffer as ArrayBuffer,
    });

    if (!response.ok) {
      throw new Error(`Walrus store failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Walrus returns different shapes depending on whether blob is new or already exists
    const blobInfo = result.newlyCreated?.blobObject || result.alreadyCertified;

    return {
      blobId: blobInfo?.blobId || result.blobId || 'simulated-blob-id',
      suiObjectId: blobInfo?.id,
      cost: blobInfo?.cost,
      size: data.length,
    };
  } catch (error) {
    console.warn('[Walrus] Store failed, using simulated storage:', (error as Error).message);
    return simulatedStore(data);
  }
}

/**
 * Retrieve encrypted data from Walrus.
 *
 * @param blobId - Blob ID from previous store operation
 * @returns Encrypted data (still needs Seal decryption)
 */
export async function walrusRetrieve(blobId: string): Promise<WalrusRetrieveResult> {
  const aggregatorUrl = CONFIG.walrusAggregatorUrl;

  try {
    const response = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);

    if (!response.ok) {
      throw new Error(`Walrus retrieve failed: ${response.status} ${response.statusText}`);
    }

    const data = new Uint8Array(await response.arrayBuffer());
    return { data, blobId };
  } catch (error) {
    console.warn('[Walrus] Retrieve failed:', (error as Error).message);
    return simulatedRetrieve(blobId);
  }
}

/**
 * Check if a blob exists on Walrus.
 */
export async function walrusExists(blobId: string): Promise<boolean> {
  const aggregatorUrl = CONFIG.walrusAggregatorUrl;

  try {
    const response = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// =========================================================================
// Simulated storage for demo when Walrus testnet is unavailable
// Uses in-memory Map as a stand-in
// =========================================================================

const simulatedStorage = new Map<string, Uint8Array>();

function simulatedStore(data: Uint8Array): WalrusStoreResult {
  const blobId = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  simulatedStorage.set(blobId, data);
  console.log(`[Walrus:Simulated] Stored blob ${blobId} (${data.length} bytes)`);
  return {
    blobId,
    size: data.length,
  };
}

function simulatedRetrieve(blobId: string): WalrusRetrieveResult {
  const data = simulatedStorage.get(blobId);
  if (!data) {
    throw new Error(`[Walrus:Simulated] Blob not found: ${blobId}`);
  }
  return { data, blobId };
}

/** Get all simulated blob IDs (for demo inspection) */
export function getSimulatedBlobs(): string[] {
  return Array.from(simulatedStorage.keys());
}
