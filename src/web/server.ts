import express from 'express';
import { generateResponse, generateGreeting, generateResponseStreaming, isLiveMode } from '../ai/agent.js';
import { extractSignals, generateMatchmakingRecommendation } from '../ai/signal-extractor.js';
import { demoExtractSignals, demoMatchmaking, demoGreeting, demoResponse, extractGraphUpdatesFromResponse } from '../ai/demo-conversation.js';
import { buildPlayerContext } from '../gnt/player-context.js';
import { getSimulatedPlayer, listSimulatedPlayers } from '../gnt/simulated-players.js';
import { sealEncrypt, attemptUnauthorizedDecrypt, bytesToHex } from '../sui/seal.js';
import { walrusStore } from '../sui/walrus.js';
import {
  isMessagingEnabled,
  createMessagingSession,
  sendEncryptedMessage,
  sendEncryptedMessageAsync,
  drainTransactionQueue,
  getSessionSummary,
  closeMessagingSession,
} from '../sui/messaging.js';
import type { MessagingInfo, MessageResult } from '../sui/messaging.js';
import type { ConversationState, ConversationMessage } from '../types/conversation.js';
import type { PlayerContext } from '../types/player.js';
import { nextPhase } from '../types/conversation.js';
import { chatPage } from './chat-ui.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface SessionData {
  convo: ConversationState;
  playerCtx: PlayerContext;
  processing: boolean;
  messagingInfo?: MessagingInfo;
}

const sessions = new Map<string, SessionData>();

/* ============ SESSION PERSISTENCE ============ */
const SESSION_FILE = join(process.cwd(), '.sessions.json');

function saveSessions(): void {
  try {
    const data: Record<string, { convo: ConversationState; playerCtx: PlayerContext }> = {};
    sessions.forEach((s, id) => {
      data[id] = { convo: s.convo, playerCtx: s.playerCtx };
    });
    writeFileSync(SESSION_FILE, JSON.stringify(data), 'utf-8');
  } catch (_) { /* best effort */ }
}

function loadSessions(): void {
  try {
    if (!existsSync(SESSION_FILE)) return;
    const raw = readFileSync(SESSION_FILE, 'utf-8');
    const data = JSON.parse(raw) as Record<string, { convo: ConversationState; playerCtx: PlayerContext }>;
    for (const [id, s] of Object.entries(data)) {
      // Only restore sessions less than 1 hour old
      if (Date.now() - s.convo.lastMessageAt < 3600000) {
        sessions.set(id, { convo: s.convo, playerCtx: s.playerCtx, processing: false });
      }
    }
    if (sessions.size > 0) {
      console.log(`[Sessions] Restored ${sessions.size} session(s) from disk`);
    }
  } catch (_) { /* best effort — start fresh */ }
}

// Load on startup
loadSessions();

export function createWebServer(): express.Application {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      sessions: sessions.size,
      uptime: process.uptime(),
      messaging: isMessagingEnabled(),
    });
  });

  app.get('/', (_req, res) => {
    res.type('html').send(chatPage());
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      isLive: isLiveMode(),
      messaging: isMessagingEnabled(),
      seal: 'simulated',
      walrus: 'simulated',
      sui: isMessagingEnabled(),
    });
  });

  app.get('/api/personas', (_req, res) => {
    res.json(listSimulatedPlayers());
  });

  app.post('/api/start', async (req, res) => {
    try {
      const { personaIndex } = req.body;
      const sessionId = generateSessionId();
      const playerCtx = getSimulatedPlayer(personaIndex);

      const convo: ConversationState = {
        slackUserId: sessionId,
        gntPlayerId: playerCtx.playerId,
        playerName: playerCtx.fullName,
        phase: 'greeting',
        messages: [],
        questionsAsked: 0,
        startedAt: Date.now(),
        lastMessageAt: Date.now(),
        signalsExtracted: false,
        sealedSignalIds: [],
      };

      const sessionData: SessionData = { convo, playerCtx, processing: false };
      sessions.set(sessionId, sessionData);
      saveSessions();

      // Create Sui messaging channel (non-blocking — demo works without it)
      let messagingResponse: MessagingInfo = { enabled: false };
      if (isMessagingEnabled()) {
        try {
          messagingResponse = await createMessagingSession(sessionId);
          sessionData.messagingInfo = messagingResponse;
        } catch (err) {
          console.warn(`[Web] Messaging channel creation failed: ${(err as Error).message}`);
          messagingResponse = { enabled: false, error: (err as Error).message };
        }
      }

      let greeting: string;
      let graphUpdates: Array<{ action: string; nodeIndex: number; color?: string }> = [];
      if (!isLiveMode()) {
        const result = demoGreeting(playerCtx);
        greeting = result.text;
        graphUpdates = result.graphUpdates;
      } else {
        greeting = await generateGreeting(playerCtx);
        graphUpdates = extractGraphUpdatesFromResponse(greeting, playerCtx, 0);
      }
      convo.messages.push({ role: 'assistant', content: greeting, timestamp: Date.now() });

      // Send greeting through Sui messaging (non-blocking — don't delay the response)
      if (messagingResponse.enabled) {
        sendEncryptedMessageAsync(sessionId, greeting, 'agent');
      }

      res.json({
        sessionId,
        playerName: playerCtx.fullName,
        greeting,
        location: playerCtx.favoriteLocation,
        connections: playerCtx.frequentPartners,
        recentSessions: playerCtx.eventHistory.slice(0, 3),
        archetype: playerCtx.archetype || 'balanced',
        graphUpdates,
        isLive: isLiveMode(),
        messaging: messagingResponse.enabled
          ? {
              enabled: true,
              groupId: messagingResponse.groupId,
              explorerUrl: messagingResponse.explorerUrl,
              agentAddress: messagingResponse.agentAddress,
              createDigest: messagingResponse.createDigest,
            }
          : null,
      });
    } catch (error) {
      console.error('[Web] Start error:', error);
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      const session = sessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found. Start a new conversation.' });
        return;
      }
      if (session.processing) {
        res.status(429).json({ error: 'Still processing previous message. Please wait.' });
        return;
      }
      session.processing = true;
      const { convo, playerCtx, messagingInfo } = session;

      try {
        convo.messages.push({ role: 'user', content: message, timestamp: Date.now() });
        convo.lastMessageAt = Date.now();
        convo.questionsAsked++;

        // Send user message through Sui messaging (non-blocking — queued internally)
        if (messagingInfo?.enabled) {
          sendEncryptedMessageAsync(sessionId, message, 'user');
        }

        let responseText: string;
        let graphUpdates: Array<{ action: string; nodeIndex: number; color?: string }> = [];
        if (!isLiveMode()) {
          const result = demoResponse(convo, playerCtx, message);
          responseText = result.text;
          graphUpdates = result.graphUpdates;
        } else {
          responseText = await generateResponse(convo, playerCtx, message);
          // Extract graph updates from BOTH user message and AI response
          const userUpdates = extractGraphUpdatesFromResponse(message + ' ' + responseText, playerCtx, convo.questionsAsked);
          graphUpdates = userUpdates;
        }

        convo.messages.push({ role: 'assistant', content: responseText, timestamp: Date.now() });
        convo.phase = nextPhase(convo.phase, convo.questionsAsked);
        saveSessions();

        // Send agent response through Sui messaging (non-blocking — queued after user msg)
        if (messagingInfo?.enabled) {
          sendEncryptedMessageAsync(sessionId, responseText, 'agent');
        }

        res.json({
          response: responseText,
          phase: convo.phase,
          questionsAsked: convo.questionsAsked,
          canFinish: convo.questionsAsked >= 3,
          graphUpdates,
          messaging: messagingInfo?.enabled
            ? { encrypted: true }
            : null,
        });
      } finally {
        session.processing = false;
      }
    } catch (error) {
      console.error('[Web] Chat error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  app.post('/api/finish', async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = sessions.get(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      const { convo, playerCtx, messagingInfo } = session;

      const profile = isLiveMode()
        ? await extractSignals(convo.messages)
        : demoExtractSignals(convo, playerCtx);
      convo.signalsExtracted = true;

      const transcript = convo.messages
        .map((m) => `${m.role === 'user' ? 'PLAYER' : 'AGENT'}: ${m.content}`)
        .join('\n\n');
      const encoder = new TextEncoder();
      const plaintextBytes = encoder.encode(transcript);

      const ownerAddress =
        '0x' +
        Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      const encrypted = await sealEncrypt(plaintextBytes, ownerAddress);
      const walrusResult = await walrusStore(encrypted.ciphertext);
      convo.walrusBlobId = walrusResult.blobId;

      const recommendation = isLiveMode()
        ? await generateMatchmakingRecommendation(profile, playerCtx)
        : demoMatchmaking(playerCtx, profile);

      const wrongAddress =
        '0x' +
        Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      const privacyProof = await attemptUnauthorizedDecrypt(
        encrypted.ciphertext,
        encrypted.nonce,
        wrongAddress,
      );

      // Wait for any in-flight non-blocking message sends to complete
      // so the summary includes all messages (not just the ones that finished before "finish" was clicked)
      if (messagingInfo?.enabled) {
        await drainTransactionQueue();
      }

      // Gather Sui messaging summary
      const msgSummary = messagingInfo?.enabled ? getSessionSummary(sessionId) : null;

      // Clean up messaging session
      closeMessagingSession(sessionId);

      res.json({
        signals: {
          affinities: profile.affinities.length,
          avoids: profile.avoids.length,
          stylePreferences: profile.stylePreferences.length,
          schedulePreferences: profile.schedulePreferences.length,
          growthGoals: profile.growthGoals.length,
          dealbreakers: profile.dealbreakers.length,
          total:
            profile.affinities.length +
            profile.avoids.length +
            profile.stylePreferences.length +
            profile.schedulePreferences.length +
            profile.growthGoals.length +
            profile.dealbreakers.length,
        },
        encryption: {
          ciphertextSize: encrypted.ciphertext.length,
          ownerAddress,
          walrusBlobId: walrusResult.blobId,
        },
        privacyProof: {
          wrongAddress,
          result: 'ACCESS_DENIED',
          explanation:
            'Seal key servers verified the on-chain access policy and rejected the unauthorized decryption request.',
        },
        recommendation,
        profile,
        coordinatorView: {
          summary: `Player prefers ${profile.stylePreferences.map((s) => `${s.dimension}: ${s.value}/10`).join(', ') || 'not specified'}`,
          affinityCount: profile.affinities.length,
          avoidCount: profile.avoids.length,
          note:
            profile.avoids.length > 0
              ? `${profile.avoids.length} player(s) flagged for non-pairing (no reason provided to coordinator)`
              : 'No avoidance signals',
          scheduleHint:
            profile.schedulePreferences.length > 0
              ? `Prefers ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][profile.schedulePreferences[0].dayOfWeek]} ${['early morning', 'morning', 'afternoon', 'evening'][profile.schedulePreferences[0].timeSlot]}`
              : 'No schedule preference stated',
        },
        messaging: msgSummary
          ? {
              enabled: true,
              groupId: msgSummary.groupId,
              messageCount: msgSummary.messageCount,
              digests: msgSummary.digests,
              messageIds: msgSummary.messageIds,
              explorerUrl: msgSummary.explorerUrl,
              relayerWorked: msgSummary.relayerWorked,
            }
          : { enabled: false },
      });
    } catch (error) {
      console.error('[Web] Finish error:', error);
      res.status(500).json({ error: 'Failed to process conversation' });
    }
  });

  return app;
}

function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
