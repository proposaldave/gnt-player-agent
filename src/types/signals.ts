/**
 * Signal types matching the Move smart contracts in ../sources/player_agent.move
 * These are the structured preference signals extracted from conversations.
 */

// Signal type codes matching player_agent.move SignalType enum
export const SignalTypeCode = {
  AVAILABILITY_RESPONSE: 0,
  PLAYER_RATING: 1,
  AVOIDANCE: 2,
  REFERRAL: 3,
  GROUP_SIZE_PREF: 4,
  PLAY_STYLE_PREF: 5,
  EXPLICIT_PREF: 6,
  MATCH_FEEDBACK: 7,
  BEHAVIORAL_INFERENCE: 8,
  RELATIONSHIP_NOTE: 9,
  COORDINATOR_OBSERVATION: 10,
} as const;

export type SignalTypeCode = (typeof SignalTypeCode)[keyof typeof SignalTypeCode];

// Privacy levels matching player_agent.move PrivacyLevel enum
export const PrivacyLevel = {
  OWNER_ONLY: 0,
  COORDINATION_VISIBLE: 1,
  COMMUNITY_VISIBLE: 2,
} as const;

export type PrivacyLevel = (typeof PrivacyLevel)[keyof typeof PrivacyLevel];

// Signals that MUST be OwnerOnly (privacy floor from player_agent.move)
export const PRIVACY_FLOOR_SIGNALS = new Set([
  SignalTypeCode.AVOIDANCE,
  SignalTypeCode.RELATIONSHIP_NOTE,
  SignalTypeCode.COORDINATOR_OBSERVATION,
]);

/** Structured affinity signal — who the player wants to play WITH */
export interface AffinitySignal {
  targetPlayerName: string; // Exact name from conversation (resolved to ID post-extraction)
  strength: number; // 1-10
  contextTag: string; // "encouraging", "fun energy", "great doubles partner"
}

/** Structured avoidance signal — who the player prefers to avoid */
export interface AvoidSignal {
  targetPlayerName: string; // Exact name from conversation
  severity: number; // 1=mild, 5=strong, 10=hard avoid
  // NO reason field — reason stays in raw conversation only
}

/** Play style preference on a dimension */
export interface StylePreference {
  dimension: string; // "intensity", "competitiveness", "social_energy"
  value: number; // 1-10
}

/** Schedule preference */
export interface SchedulePreference {
  dayOfWeek: number; // 0=Sun ... 6=Sat
  timeSlot: number; // 0=early_morning, 1=morning, 2=afternoon, 3=evening
  preferenceStrength: number; // 1-10
}

/** Growth goal */
export interface GrowthGoal {
  currentLevel: number; // e.g., 35 = 3.5
  targetLevel: number; // e.g., 40 = 4.0
  preferredLearningStyle: number; // 0=drills, 1=games, 2=mixed, 3=coaching
}

/** Dealbreaker */
export interface Dealbreaker {
  category: string; // "play_style", "reliability", "attitude"
  severity: number; // 1-10
}

/** Complete preference profile extracted from one or more conversations */
export interface PreferenceProfile {
  affinities: AffinitySignal[];
  avoids: AvoidSignal[];
  stylePreferences: StylePreference[];
  schedulePreferences: SchedulePreference[];
  growthGoals: GrowthGoal[];
  dealbreakers: Dealbreaker[];
  updatedAt: number; // epoch ms
  conversationCount: number;
}

/** Maps an extracted signal to the Move contract signal type code + privacy */
export function mapToMoveSignal(signal: AffinitySignal | AvoidSignal | StylePreference | SchedulePreference | GrowthGoal | Dealbreaker): {
  signalTypeCode: SignalTypeCode;
  privacyLevel: PrivacyLevel;
  confidence: number;
  value: number;
  textData: string;
} {
  if ('contextTag' in signal && 'strength' in signal) {
    // AffinitySignal → ExplicitPreference
    const s = signal as AffinitySignal;
    return {
      signalTypeCode: SignalTypeCode.EXPLICIT_PREF,
      privacyLevel: PrivacyLevel.COORDINATION_VISIBLE,
      confidence: Math.min(s.strength * 10, 100),
      value: s.strength,
      textData: `affinity:${s.targetPlayerName}:${s.contextTag}`,
    };
  }
  if ('severity' in signal && 'targetPlayerName' in signal) {
    // AvoidSignal → AvoidanceSignal (ALWAYS OwnerOnly)
    const s = signal as AvoidSignal;
    return {
      signalTypeCode: SignalTypeCode.AVOIDANCE,
      privacyLevel: PrivacyLevel.OWNER_ONLY,
      confidence: Math.min(s.severity * 10, 100),
      value: s.severity,
      textData: `avoid:${s.targetPlayerName}`,
    };
  }
  if ('dimension' in signal) {
    const s = signal as StylePreference;
    return {
      signalTypeCode: SignalTypeCode.PLAY_STYLE_PREF,
      privacyLevel: PrivacyLevel.COORDINATION_VISIBLE,
      confidence: 80,
      value: s.value,
      textData: `style:${s.dimension}`,
    };
  }
  if ('dayOfWeek' in signal) {
    const s = signal as SchedulePreference;
    return {
      signalTypeCode: SignalTypeCode.AVAILABILITY_RESPONSE,
      privacyLevel: PrivacyLevel.COMMUNITY_VISIBLE,
      confidence: Math.min(s.preferenceStrength * 10, 100),
      value: s.dayOfWeek * 10 + s.timeSlot,
      textData: `schedule:${s.dayOfWeek}:${s.timeSlot}`,
    };
  }
  if ('currentLevel' in signal) {
    const s = signal as GrowthGoal;
    return {
      signalTypeCode: SignalTypeCode.EXPLICIT_PREF,
      privacyLevel: PrivacyLevel.OWNER_ONLY,
      confidence: 90,
      value: s.targetLevel,
      textData: `growth:${s.currentLevel}->${s.targetLevel}:style${s.preferredLearningStyle}`,
    };
  }
  // Dealbreaker
  const s = signal as Dealbreaker;
  return {
    signalTypeCode: SignalTypeCode.RELATIONSHIP_NOTE,
    privacyLevel: PrivacyLevel.OWNER_ONLY,
    confidence: Math.min(s.severity * 10, 100),
    value: s.severity,
    textData: `dealbreaker:${s.category}`,
  };
}
