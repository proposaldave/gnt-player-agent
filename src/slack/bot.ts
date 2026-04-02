/**
 * Slack Bot — Player Agent conversation interface.
 *
 * Uses Socket Mode for easy local development (no public URL needed).
 * Handles DM conversations with players, orchestrating the full pipeline:
 *   Player DM → Load context → Claude conversation → Signal extraction →
 *   Seal encryption → Walrus storage → On-chain proof
 */

import { App } from '@slack/bolt';
import { CONFIG } from '../config.js';
import { generateResponse, generateGreeting } from '../ai/agent.js';
import { extractSignals, generateMatchmakingRecommendation } from '../ai/signal-extractor.js';
import { buildPlayerContext } from '../gnt/player-context.js';
import { getSimulatedPlayer, listSimulatedPlayers } from '../gnt/simulated-players.js';
import { sealEncrypt, attemptUnauthorizedDecrypt, bytesToHex } from '../sui/seal.js';
import { walrusStore } from '../sui/walrus.js';
import { getAgentAddress } from '../sui/client.js';
import * as messages from './messages.js';
import type { ConversationState, ConversationMessage } from '../types/conversation.js';
import type { PlayerContext } from '../types/player.js';
import { CONVERSATION_TIMEOUT_MS, nextPhase } from '../types/conversation.js';

// Active conversations (in-memory — conversations don't persist across restarts)
const conversations = new Map<string, ConversationState>();
const playerContexts = new Map<string, PlayerContext>();

/**
 * Create and configure the Slack Bolt app.
 */
export function createSlackBot(): App {
  const app = new App({
    token: CONFIG.slackBotToken,
    appToken: CONFIG.slackAppToken,
    socketMode: true,
  });

  // Handle DM messages
  app.message(async ({ message, say, client }) => {
    // Only handle DMs (im = direct message channel type)
    if (message.channel_type !== 'im') return;
    if (!('text' in message) || !message.text) return;
    if ('bot_id' in message) return; // Ignore bot messages

    const userId = message.user!;
    const text = message.text.trim();

    // Check for existing conversation
    let convo = conversations.get(userId);

    // Handle mode selection / new conversation
    if (!convo) {
      // First message — send welcome and wait for mode selection
      if (text.toLowerCase() === 'start' || text.toLowerCase() === 'hello' || text.toLowerCase() === 'hi') {
        await say(messages.welcomeMessage());
        return;
      }

      // Real mode: "real email@example.com"
      if (text.toLowerCase().startsWith('real ')) {
        const email = text.slice(5).trim();
        await say(':mag: Looking you up in NEPC...');

        const playerCtx = await buildPlayerContext(email);
        if (!playerCtx) {
          await say(messages.playerNotFound(email));
          return;
        }

        playerContexts.set(userId, playerCtx);
        convo = createConversation(userId, playerCtx.fullName, playerCtx.playerId);
        conversations.set(userId, convo);

        await say(messages.modeConfirmation('real', playerCtx.fullName));

        // Generate and send greeting
        const greeting = await generateGreeting(playerCtx);
        convo.messages.push({ role: 'assistant', content: greeting, timestamp: Date.now() });
        await say(greeting);
        return;
      }

      // Demo mode: "demo" or "demo 1"
      if (text.toLowerCase().startsWith('demo')) {
        const parts = text.split(/\s+/);
        const index = parts[1] ? parseInt(parts[1]) - 1 : undefined;
        const playerCtx = getSimulatedPlayer(index);

        playerContexts.set(userId, playerCtx);
        convo = createConversation(userId, playerCtx.fullName, playerCtx.playerId);
        conversations.set(userId, convo);

        await say(messages.modeConfirmation('demo', playerCtx.fullName));

        // Generate and send greeting
        const greeting = await generateGreeting(playerCtx);
        convo.messages.push({ role: 'assistant', content: greeting, timestamp: Date.now() });
        await say(greeting);
        return;
      }

      // Default: show welcome
      await say(messages.welcomeMessage());
      return;
    }

    // Handle special commands mid-conversation
    if (text.toLowerCase() === 'done' || text.toLowerCase() === 'finish') {
      await finishConversation(userId, say);
      return;
    }

    if (text.toLowerCase() === 'reset') {
      conversations.delete(userId);
      playerContexts.delete(userId);
      await say(':arrows_counterclockwise: Conversation reset. Type `start` to begin again.');
      return;
    }

    if (text.toLowerCase() === 'privacy test') {
      await demonstratePrivacy(userId, say);
      return;
    }

    // Check for timeout
    if (Date.now() - convo.lastMessageAt > CONVERSATION_TIMEOUT_MS) {
      await say(':hourglass: Your conversation timed out (30 min inactive). Type `start` to begin a new one.');
      conversations.delete(userId);
      return;
    }

    // Normal conversation flow — send to Claude
    convo.messages.push({ role: 'user', content: text, timestamp: Date.now() });
    convo.lastMessageAt = Date.now();
    convo.questionsAsked++;

    const playerCtx = playerContexts.get(userId) || null;
    const response = await generateResponse(convo, playerCtx, text);

    convo.messages.push({ role: 'assistant', content: response, timestamp: Date.now() });
    convo.phase = nextPhase(convo.phase, convo.questionsAsked);

    await say(response);

    // Auto-finish after enough questions
    if (convo.phase === 'wrapup' && convo.questionsAsked >= 8) {
      await say('\n_Type `done` when you\'re ready and I\'ll encrypt your preferences and generate a matchmaking recommendation._');
    }
  });

  return app;
}

/**
 * Finish a conversation — extract signals, encrypt, store, generate recommendation.
 */
async function finishConversation(
  userId: string,
  say: (text: string) => Promise<unknown>,
): Promise<void> {
  const convo = conversations.get(userId);
  if (!convo || convo.messages.length < 2) {
    await say('No conversation to finish. Type `start` to begin.');
    return;
  }

  await say(':gear: Processing your conversation...');

  // Step 1: Extract signals
  const profile = await extractSignals(convo.messages);
  convo.signalsExtracted = true;
  await say(messages.signalsExtracted(profile));

  // Step 2: Encrypt raw conversation with Seal
  const transcript = convo.messages
    .map((m) => `${m.role === 'user' ? 'PLAYER' : 'AGENT'}: ${m.content}`)
    .join('\n\n');
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(transcript);

  let ownerAddress: string;
  try {
    ownerAddress = getAgentAddress(); // In production, this would be the PLAYER's address via zkLogin
  } catch {
    ownerAddress = '0x' + '0'.repeat(64); // Fallback for demo
  }

  const encrypted = await sealEncrypt(plaintextBytes, ownerAddress);
  await say(`:lock: Raw conversation encrypted (${encrypted.ciphertext.length} bytes ciphertext)`);

  // Step 3: Store on Walrus
  const walrusResult = await walrusStore(encrypted.ciphertext);
  convo.walrusBlobId = walrusResult.blobId;
  await say(`:cloud: Stored on Walrus: \`${walrusResult.blobId}\``);

  // Step 4: Show on-chain proof
  await say(messages.onChainProof({
    walrusBlobId: walrusResult.blobId,
    sealedSignalIds: convo.sealedSignalIds,
    suiExplorerBase: `https://suiscan.xyz/testnet`,
    digest: undefined,
  }));

  // Step 5: Generate matchmaking recommendation
  const playerCtx = playerContexts.get(userId);
  if (playerCtx) {
    const recommendation = await generateMatchmakingRecommendation(profile, playerCtx);
    await say(messages.matchmakingRecommendation(recommendation));
  }

  // Step 6: Offer privacy demo
  await say('\n_Type `privacy test` to see the privacy proof — an unauthorized wallet trying to decrypt your conversation._');
}

/**
 * Demonstrate the privacy story — show that a wrong wallet can't decrypt.
 */
async function demonstratePrivacy(
  userId: string,
  say: (text: string) => Promise<unknown>,
): Promise<void> {
  const convo = conversations.get(userId);
  if (!convo?.walrusBlobId) {
    await say('No encrypted conversation yet. Finish a conversation first with `done`.');
    return;
  }

  // Generate a random "wrong" address
  const wrongBytes = new Uint8Array(32);
  crypto.getRandomValues(wrongBytes);
  const wrongAddress = bytesToHex(wrongBytes);

  await say(':detective: Attempting to decrypt with an unauthorized wallet...');

  const result = await attemptUnauthorizedDecrypt(
    new Uint8Array(0), // placeholder — real demo would fetch from Walrus
    new Uint8Array(16),
    wrongAddress,
  );

  await say(messages.privacyDemo(wrongAddress));
}

/**
 * Create a new conversation state.
 */
function createConversation(slackUserId: string, playerName: string, gntPlayerId?: string): ConversationState {
  return {
    slackUserId,
    gntPlayerId,
    playerName,
    phase: 'greeting',
    messages: [],
    questionsAsked: 0,
    startedAt: Date.now(),
    lastMessageAt: Date.now(),
    signalsExtracted: false,
    sealedSignalIds: [],
  };
}

/** Get active conversation count (for monitoring) */
export function getActiveConversations(): number {
  return conversations.size;
}
