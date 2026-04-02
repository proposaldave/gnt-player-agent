/**
 * Conversation state types — updated with Esther Perel's vulnerability gradient.
 */

export type ConversationPhase =
  | 'greeting'           // Warm hello, establish rapport, mention privacy
  | 'validate'           // Confirm/correct behavioral data inferences
  | 'positive_anchor'    // Best sessions, favorite partners — build positive foundation
  | 'social_prefs'       // The gold: earned through positive anchoring
  | 'experience_texture' // What makes a session FEEL great — deeper than logistics
  | 'future_prefs'       // Aspirational — wish questions bypass realism filter
  | 'wrapup'             // Actionable insight + return invitation
  | 'complete';          // Conversation done

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationState {
  slackUserId: string;
  gntPlayerId?: string;
  playerName: string;
  phase: ConversationPhase;
  messages: ConversationMessage[];
  questionsAsked: number;
  startedAt: number;
  lastMessageAt: number;
  signalsExtracted: boolean;
  walrusBlobId?: string;
  sealedSignalIds: string[];
}

/** Maximum questions per conversation (high limit — demo supports endless conversation) */
export const MAX_QUESTIONS = 100;

/** Conversation timeout (30 min of inactivity) */
export const CONVERSATION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Phase transition rules — follows Esther Perel's vulnerability gradient:
 * Facts → Preferences → Positive People → Comparative Quality →
 * Negative Experiences → Negative People (earned) → Wrap Up
 */
export function nextPhase(current: ConversationPhase, questionsAsked: number): ConversationPhase {
  if (questionsAsked >= MAX_QUESTIONS) return 'wrapup';

  switch (current) {
    case 'greeting': return 'validate';
    case 'validate': return questionsAsked >= 3 ? 'positive_anchor' : 'validate';
    case 'positive_anchor': return questionsAsked >= 4 ? 'social_prefs' : 'positive_anchor';
    case 'social_prefs': return questionsAsked >= 7 ? 'experience_texture' : 'social_prefs';
    case 'experience_texture': return questionsAsked >= 8 ? 'future_prefs' : 'experience_texture';
    case 'future_prefs': return 'wrapup';
    case 'wrapup': return 'complete';
    default: return 'complete';
  }
}
