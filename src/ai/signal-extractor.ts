/**
 * Signal Extractor — Runs a SECOND Claude call to extract structured
 * preference signals from a completed conversation transcript.
 *
 * This is the two-pass approach: Claude converses first, then a
 * separate call extracts structured data. Don't try to extract
 * signals mid-conversation — it degrades conversational quality.
 */

import Anthropic from '@anthropic-ai/sdk';
import { CONFIG } from '../config.js';
import { SIGNAL_EXTRACTION_PROMPT, MATCHMAKING_PROMPT } from './prompts.js';
import type { PreferenceProfile } from '../types/signals.js';
import type { ConversationMessage } from '../types/conversation.js';
import type { PlayerContext, MatchmakingOutput } from '../types/player.js';
import { formatPlayerContextForPrompt } from '../gnt/player-context.js';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: CONFIG.anthropicApiKey });
  }
  return client;
}

/**
 * Extract structured preference signals from a conversation transcript.
 *
 * Returns a PreferenceProfile with typed signals that can be stored
 * on-chain via the Move contracts.
 */
export async function extractSignals(
  messages: ConversationMessage[],
): Promise<PreferenceProfile> {
  const anthropic = getClient();

  // Format transcript as readable text
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'PLAYER' : 'AGENT'}: ${m.content}`)
    .join('\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SIGNAL_EXTRACTION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract all preference signals from this conversation:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return emptyProfile();
  }

  try {
    // Parse the JSON response — Claude should return valid JSON
    const raw = textBlock.text;
    // Extract JSON from potential markdown code blocks
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      affinities: parsed.affinities || [],
      avoids: parsed.avoids || [],
      stylePreferences: parsed.stylePreferences || [],
      schedulePreferences: parsed.schedulePreferences || [],
      growthGoals: parsed.growthGoals || [],
      dealbreakers: parsed.dealbreakers || [],
      updatedAt: Date.now(),
      conversationCount: 1,
    };
  } catch (error) {
    console.error('[SignalExtractor] Failed to parse extraction result:', error);
    return emptyProfile();
  }
}

/**
 * Generate a matchmaking recommendation from extracted signals + player context.
 */
export async function generateMatchmakingRecommendation(
  profile: PreferenceProfile,
  playerContext: PlayerContext,
): Promise<MatchmakingOutput> {
  const anthropic = getClient();

  const contextStr = formatPlayerContextForPrompt(playerContext);
  const signalsStr = JSON.stringify(profile, null, 2);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: MATCHMAKING_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Player context:\n${contextStr}\n\nPreference signals:\n${signalsStr}\n\nRecommend an ideal group of 4 for this player's next session.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return defaultRecommendation(playerContext);
  }

  try {
    const raw = textBlock.text;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const parsed = JSON.parse(jsonMatch[1]!.trim());

    return {
      playerName: playerContext.fullName,
      recommendedGroup: parsed.recommendedGroup || [],
      preferredDay: parsed.preferredDay || playerContext.favoriteDay || 'Tuesday',
      preferredTime: parsed.preferredTime || playerContext.favoriteTimeSlot || 'morning',
      location: parsed.location || playerContext.favoriteLocation || 'Rye',
      basedOnSignals:
        profile.affinities.length +
        profile.avoids.length +
        profile.stylePreferences.length +
        profile.schedulePreferences.length,
    };
  } catch (error) {
    console.error('[Matchmaker] Failed to parse recommendation:', error);
    return defaultRecommendation(playerContext);
  }
}

function emptyProfile(): PreferenceProfile {
  return {
    affinities: [],
    avoids: [],
    stylePreferences: [],
    schedulePreferences: [],
    growthGoals: [],
    dealbreakers: [],
    updatedAt: Date.now(),
    conversationCount: 0,
  };
}

function defaultRecommendation(ctx: PlayerContext): MatchmakingOutput {
  return {
    playerName: ctx.fullName,
    recommendedGroup: ctx.frequentPartners.slice(0, 3).map((p) => ({
      playerName: p.playerName,
      playerId: p.playerId,
      reason: `Played together ${p.timesPlayed} times`,
      confidence: 70,
    })),
    preferredDay: ctx.favoriteDay || 'Tuesday',
    preferredTime: ctx.favoriteTimeSlot || 'morning',
    location: ctx.favoriteLocation || 'Rye',
    basedOnSignals: 0,
  };
}
