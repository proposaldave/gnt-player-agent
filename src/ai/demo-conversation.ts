/**
 * Demo Conversation Engine — Smart scripted conversations that work
 * with ZERO external credentials. No API key needed.
 *
 * Uses player context data to generate realistic, data-informed responses.
 * Extended conversation supports 20+ turns for endless demo engagement.
 * Returns graph update hints for the interactive community visualization.
 */

import type { PlayerContext } from '../types/player.js';
import type { ConversationState } from '../types/conversation.js';
import type { PreferenceProfile } from '../types/signals.js';

/** Graph visualization update hint */
export interface GraphUpdate {
  action: 'reveal' | 'highlight' | 'dim' | 'pulse';
  nodeIndex: number; // -1 = self node, 0+ = frequentPartners index
  color?: string;
}

/** Demo response with graph update data */
export interface DemoResult {
  text: string;
  graphUpdates: GraphUpdate[];
}

/**
 * Generate a demo greeting. Short, ownership language (not encryption jargon).
 */
export function demoGreeting(ctx: PlayerContext): DemoResult {
  const topPartner = ctx.frequentPartners?.[0];
  const partnerLine = topPartner
    ? `I see you and ${topPartner.playerName} have played ${topPartner.timesPlayed} times together — is ${topPartner.playerName.split(' ')[0]} your go-to partner?`
    : 'Tell me about the people you love playing with — who makes a session great?';
  return {
    text: `Hey ${ctx.firstName}! What you share here is yours — nobody sees it. ${partnerLine}`,
    graphUpdates: [{ action: 'reveal', nodeIndex: -1 }],
  };
}

/**
 * Generate contextual demo responses. Never repeats. Each turn advances
 * the conversation naturally and updates the community graph.
 */
export function demoResponse(
  convo: ConversationState,
  ctx: PlayerContext,
  userMessage: string,
): DemoResult {
  const turn = convo.questionsAsked;
  const msg = userMessage.toLowerCase();
  const graphUpdates: GraphUpdate[] = [];

  // === TURN 1: Respond to schedule, surface play history ===
  if (turn === 1) {
    graphUpdates.push({ action: 'reveal', nodeIndex: 0 });
    if (ctx.frequentPartners.length >= 1) {
      const p1 = ctx.frequentPartners[0];
      return {
        text: `Got it. Looking at your history — ${ctx.totalEventsPlayed} sessions. And ${p1.playerName} keeps showing up — you two have played ${p1.timesPlayed} times. Is that someone you'd want to keep being matched with?`,
        graphUpdates,
      };
    }
    return {
      text: `Got it. I can see ${ctx.totalEventsPlayed} sessions in your history. How have those been going — mostly great, or a mixed bag?`,
      graphUpdates,
    };
  }

  // === TURN 2: Surface more partners (DIFFERENT from turn 1) ===
  if (turn === 2) {
    graphUpdates.push({ action: 'reveal', nodeIndex: 1 });
    if (msg.includes('yes') || msg.includes('love') || msg.includes('great') || msg.includes('definitely') || msg.includes('absolutely')) {
      graphUpdates.push({ action: 'highlight', nodeIndex: 0, color: '#34d399' });
    }
    if (ctx.frequentPartners.length >= 2) {
      const p2 = ctx.frequentPartners[1];
      return {
        text: `Nice. ${p2.playerName} also comes up ${p2.timesPlayed} times. That's a solid crew forming. Are these your go-to people, or did that just happen organically?`,
        graphUpdates,
      };
    }
    return {
      text: `Thanks for that. When you think about your best sessions, what made them work — the people, the format, or the time of day?`,
      graphUpdates,
    };
  }

  // === TURN 3: Positive anchoring — best sessions ===
  if (turn === 3) {
    if (ctx.frequentPartners.length >= 3) graphUpdates.push({ action: 'reveal', nodeIndex: 2 });
    const top = ctx.frequentPartners[0];
    return {
      text: top
        ? `That makes sense. Think about your best session recently — the one where you walked off feeling great. Who was there? I'm guessing ${top.playerName} was in the mix?`
        : `That makes sense. Think about your best session recently — the one where everything clicked. Who was on the court?`,
      graphUpdates,
    };
  }

  // === TURN 4: Build on positivity ===
  if (turn === 4) {
    if (ctx.frequentPartners.length >= 4) graphUpdates.push({ action: 'reveal', nodeIndex: 3 });
    if (msg.includes('love') || msg.includes('great') || msg.includes('awesome') || msg.includes('best') || msg.includes('fun')) {
      graphUpdates.push({ action: 'highlight', nodeIndex: 0, color: '#34d399' });
      if (ctx.frequentPartners.length >= 2) graphUpdates.push({ action: 'highlight', nodeIndex: 1, color: '#2dd4bf' });
    }
    return {
      text: `You clearly light up talking about those sessions. Do all your sessions feel that way, or are some a mixed bag? What makes the difference?`,
      graphUpdates,
    };
  }

  // === TURN 5: Gently probe avoidance ===
  if (turn === 5) {
    if (ctx.frequentPartners.length >= 5) graphUpdates.push({ action: 'reveal', nodeIndex: 4 });
    const avoidHint = msg.includes('not') || msg.includes("don't") || msg.includes('intense') || msg.includes('aggressive') || msg.includes('mixed');
    return {
      text: avoidHint
        ? `Totally fair. Most people have a few folks whose energy doesn't match theirs. If I'm building your ideal group, anyone I should NOT pair you with? This is just between us — you own this data.`
        : `Makes sense. Most players have a few people whose energy doesn't quite match. If I'm building your dream group, anyone to keep off the list? Totally between us.`,
      graphUpdates,
    };
  }

  // === TURN 6: Experience texture ===
  if (turn === 6) {
    if (msg.includes('avoid') || msg.includes("don't") || msg.includes('rather not')) {
      const lastIdx = ctx.frequentPartners.length - 1;
      if (lastIdx >= 0) graphUpdates.push({ action: 'dim', nodeIndex: lastIdx });
    }
    return {
      text: `Really helpful. When you walk off after a great session, what is it about that one — the competition, the social energy, the workout, or something else?`,
      graphUpdates,
    };
  }

  // === TURN 7: Dream week ===
  if (turn === 7) {
    return {
      text: `Love that. If you could design your perfect pickleball week — partners, days, times, intensity — what would it look like?`,
      graphUpdates,
    };
  }

  // === TURN 8: Summary + invite to continue ===
  if (turn === 8) {
    const p1 = ctx.frequentPartners[0];
    const p2 = ctx.frequentPartners[1];
    graphUpdates.push({ action: 'pulse', nodeIndex: -1 });
    return {
      text: `Great stuff, ${ctx.firstName}. Here's what I'm learning: ${p1 ? p1.playerName + ' is a clear yes' : 'you value good energy'}${p2 ? ', ' + p2.playerName + ' is solid too' : ''}, and you prefer ${ctx.favoriteDay || 'your usual'} ${ctx.favoriteTimeSlot || 'morning'}s. The more we talk, the better your groups get — want to keep going?`,
      graphUpdates,
    };
  }

  // === EXTENDED CONVERSATION (Turn 9+) ===
  return extendedResponse(turn, ctx, msg, graphUpdates);
}

/**
 * Extended conversation topics. Cycles through scheduling, format, competition,
 * social, and community topics. Each turn gives immediate value.
 */
function extendedResponse(
  turn: number,
  ctx: PlayerContext,
  _msg: string,
  graphUpdates: GraphUpdate[],
): DemoResult {
  if (turn === 9) {
    const top = ctx.frequentPartners[0];
    return { text: `Real talk — if I set you up next ${ctx.favoriteDay || 'week'}${top ? ' with ' + top.playerName : ''} at ${ctx.favoriteLocation || 'the club'}, ${ctx.favoriteTimeSlot || 'morning'} — perfect? Or would you change something?`, graphUpdates };
  }
  if (turn === 10) return { text: 'Do you prefer organized doubles or open play? Some love set teams, others love rotating in. Where do you land?', graphUpdates };
  if (turn === 11) return { text: 'How do you feel about playing with someone new? Some people love fresh energy. Others prefer their crew. If I mixed in one new person, exciting or stressful?', graphUpdates };
  if (turn === 12) return { text: 'On a scale of "just here to have fun" to "I want to WIN" — where do you honestly fall? Helps me match you with people at the same temperature.', graphUpdates };
  if (turn === 13) return { text: 'After you play — do you hang around? Grab coffee? Or more of a "great game, see you next time" person?', graphUpdates };
  if (turn === 14) return { text: 'How many times a week is ideal for you? Some want daily. Others are once-a-week and love it.', graphUpdates };
  if (turn === 15) return { text: 'Are you actively trying to improve, or happy where you are? If you\'re working on your game, I can pair you with people who\'ll push you.', graphUpdates };
  if (turn === 16) {
    const names = ctx.frequentPartners.slice(0, 3).map(p => p.playerName).join(', ');
    return { text: `Fun one — tournament next weekend, you need a doubles partner. Who are you calling? ${names ? 'Someone from ' + names + '?' : ''} Or someone else entirely?`, graphUpdates };
  }
  if (turn === 17) return { text: 'What frustrates you most about scheduling right now? Not knowing who\'s coming? Getting matched wrong? Something else?', graphUpdates };
  if (turn === 18) return { text: 'How far ahead do you like to know your schedule? Some people book a week out. Others decide day-of.', graphUpdates };
  if (turn === 19) return { text: `If you could change ONE thing about how ${ctx.favoriteLocation || 'the club'} runs pickleball, what would it be?`, graphUpdates };

  // Turn 20+: Cycling deep dives
  const cycle = [
    `You mentioned ${ctx.frequentPartners[0]?.playerName || 'your favorite partners'} earlier. What specifically makes playing with them great — skill level, attitude, pace?`,
    'If a brand new member asked you who to play with, what would you tell them?',
    'Is there a time of year when your pickleball is best? Summer outdoor? Or always the same for you?',
    'If every group was perfectly matched, every time — how much more would you play?',
    'What\'s the best moment you\'ve had on a pickleball court? The one that hooked you on this sport.',
    `Do you ever play at ${ctx.favoriteLocation === 'Rye' ? 'Middleton' : 'Rye'}? Or are you loyal to ${ctx.favoriteLocation || 'your spot'}?`,
    'Some players love variety — different partners every session. Others want the same crew. Which way do you lean?',
    'What would make you add an extra day per week? Better groups? Better scheduling? Or is time the real constraint?',
    'If AI matchmaking worked perfectly every time — what would that change about your relationship with the club?',
    'What\'s one thing about your play style that people might not guess from watching you?',
  ];
  return { text: cycle[(turn - 20) % cycle.length], graphUpdates };
}

/**
 * Generate demo signal extraction results from the conversation.
 */
export function demoExtractSignals(
  convo: ConversationState,
  ctx: PlayerContext,
): PreferenceProfile {
  const signals: PreferenceProfile = {
    affinities: [],
    avoids: [],
    stylePreferences: [],
    schedulePreferences: [],
    growthGoals: [],
    dealbreakers: [],
    updatedAt: Date.now(),
    conversationCount: 1,
  };

  if (ctx.frequentPartners.length >= 1) {
    signals.affinities.push({
      targetPlayerName: ctx.frequentPartners[0].playerName,
      strength: 9,
      contextTag: 'strong positive energy, reliable partner',
    });
  }
  if (ctx.frequentPartners.length >= 2) {
    signals.affinities.push({
      targetPlayerName: ctx.frequentPartners[1].playerName,
      strength: 7,
      contextTag: 'good chemistry, frequent play partner',
    });
  }

  const allUserMsgs = convo.messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  if (allUserMsgs.includes('intense') || allUserMsgs.includes('aggressive') || allUserMsgs.includes('slam')) {
    const lastPartner = ctx.frequentPartners[ctx.frequentPartners.length - 1];
    if (lastPartner) {
      signals.avoids.push({
        targetPlayerName: lastPartner.playerName,
        severity: 6,
      });
    }
  }

  signals.stylePreferences.push(
    { dimension: 'competitiveness', value: ctx.totalEventsPlayed > 50 ? 7 : 5 },
    { dimension: 'social_energy', value: 7 },
    { dimension: 'intensity', value: ctx.frequentPartners.length > 4 ? 6 : 4 },
  );

  const dayMap: Record<string, number> = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6,
  };
  const timeMap: Record<string, number> = {
    'early_morning': 0, 'morning': 1, 'afternoon': 2, 'evening': 3,
  };
  if (ctx.favoriteDay && dayMap[ctx.favoriteDay] !== undefined) {
    signals.schedulePreferences.push({
      dayOfWeek: dayMap[ctx.favoriteDay],
      timeSlot: ctx.favoriteTimeSlot ? (timeMap[ctx.favoriteTimeSlot] ?? 1) : 1,
      preferenceStrength: 8,
    });
  }

  if (ctx.totalEventsPlayed > 10) {
    signals.growthGoals.push({
      currentLevel: 35,
      targetLevel: 40,
      preferredLearningStyle: 1,
    });
  }

  return signals;
}

/**
 * Extract graph updates from a LIVE Claude response by detecting partner name
 * mentions and sentiment. This makes the community graph animate even when
 * responses come from real Claude instead of the scripted engine.
 *
 * How it works:
 * 1. Scans Claude's response for mentions of the player's known partners
 * 2. Uses a sentiment window around each mention to detect affinity vs avoidance
 * 3. Progressively reveals nodes on early turns even if Claude doesn't name anyone
 * 4. Pulses all nodes on summary/milestone turns
 */
export function extractGraphUpdatesFromResponse(
  responseText: string,
  playerCtx: PlayerContext,
  turnNumber: number,
): GraphUpdate[] {
  const updates: GraphUpdate[] = [];
  const text = responseText.toLowerCase();

  // First response always reveals self node
  if (turnNumber <= 1) {
    updates.push({ action: 'reveal', nodeIndex: -1 });
  }

  // Track which partners are mentioned
  const mentioned = new Set<number>();

  playerCtx.frequentPartners.forEach((partner, index) => {
    const nameParts = partner.playerName.toLowerCase().split(/[\s.]+/).filter(Boolean);
    const firstName = nameParts[0];
    if (!firstName) return;

    // Match first name or full name (handles "Sarah M.", "Sarah", "Stacy L.", etc.)
    if (text.includes(firstName) || text.includes(partner.playerName.toLowerCase())) {
      mentioned.add(index);

      // Always reveal a mentioned partner
      updates.push({ action: 'reveal', nodeIndex: index });

      // Sentiment detection: look at the ~80 char window around the name mention
      const namePos = text.indexOf(firstName);
      const windowStart = Math.max(0, namePos - 80);
      const windowEnd = Math.min(text.length, namePos + firstName.length + 80);
      const window = text.substring(windowStart, windowEnd);

      const positiveSignals = [
        'love', 'great', 'awesome', 'enjoy', 'favorite', 'best', 'solid', 'strong',
        'positive', 'chemistry', 'fun', 'amazing', 'keeps showing up', 'reliable',
        'go-to', 'definitely', 'click', 'good energy', 'want to play', 'yes please',
        'enthusiastic', 'excited', 'look forward',
      ];
      const negativeSignals = [
        'avoid', 'rather not', 'intense', 'aggressive', 'skip', 'mixed',
        "don't want", 'not pair', 'off the list', "energy doesn't", 'clash',
        'difficult', 'uncomfortable', 'not my', 'steer clear',
      ];

      const hasPositive = positiveSignals.some(w => window.includes(w));
      const hasNegative = negativeSignals.some(w => window.includes(w));

      if (hasPositive && !hasNegative) {
        updates.push({ action: 'highlight', nodeIndex: index, color: '#34d399' });
      } else if (hasNegative && !hasPositive) {
        updates.push({ action: 'dim', nodeIndex: index });
      }
    }
  });

  // Progressive reveal: if no known partner was mentioned and the text doesn't reference
  // an unknown person by name (e.g. "steve pio"), reveal the next partner node.
  // Detect capitalized name-like patterns that aren't known partners to avoid false reveals.
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z.]+)?\b/g;
  const allNames = responseText.match(namePattern) || [];
  const knownNames = new Set(
    playerCtx.frequentPartners.map(p => p.playerName.toLowerCase().split(/[\s.]+/)[0])
  );
  knownNames.add(playerCtx.firstName.toLowerCase());
  const hasUnknownName = allNames.some(n => !knownNames.has(n.toLowerCase().split(/\s+/)[0]));

  if (mentioned.size === 0 && !hasUnknownName && turnNumber > 0 && turnNumber <= playerCtx.frequentPartners.length) {
    const revealIdx = turnNumber - 1;
    if (revealIdx < playerCtx.frequentPartners.length) {
      updates.push({ action: 'reveal', nodeIndex: revealIdx });
    }
  }

  // Milestone pulse every 5 turns
  if (turnNumber > 0 && turnNumber % 5 === 0) {
    updates.push({ action: 'pulse', nodeIndex: -1 });
  }

  // Summary/recap language triggers a pulse
  const summaryPhrases = [
    "here's what i'm learning", "here's what i've learned", 'so far', 'based on what you',
    'to summarize', 'your ideal', 'putting it together', 'clear picture',
    'here\'s what i know', 'let me recap',
  ];
  if (summaryPhrases.some(w => text.includes(w))) {
    updates.push({ action: 'pulse', nodeIndex: -1 });
  }

  return updates;
}

/**
 * Generate demo matchmaking recommendation.
 */
export function demoMatchmaking(ctx: PlayerContext, profile: PreferenceProfile) {
  const group = ctx.frequentPartners.slice(0, 3).map((p, i) => ({
    playerName: p.playerName,
    playerId: p.playerId,
    reason: i === 0
      ? p.timesPlayed + ' shared sessions, strong mutual energy'
      : 'Compatible style, ' + p.timesPlayed + ' sessions together',
    confidence: Math.max(95 - i * 15, 60),
  }));

  return {
    playerName: ctx.fullName,
    recommendedGroup: group,
    preferredDay: ctx.favoriteDay || 'Tuesday',
    preferredTime: ctx.favoriteTimeSlot || 'morning',
    location: ctx.favoriteLocation || 'Rye',
    basedOnSignals: profile.affinities.length + profile.avoids.length +
      profile.stylePreferences.length + profile.schedulePreferences.length,
  };
}
