/**
 * LLM Conversation Handler — with phase management and injection defense.
 * Supports: Google Gemini (free tier) or Claude API.
 * Fixes from: Amanda Askell (prompt engineering), Sam Lambert (error handling)
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config.js';
import { AGENT_SYSTEM_PROMPT, PHASE_INSTRUCTIONS } from './prompts.js';
import type { PlayerContext } from '../types/player.js';
import type { ConversationState } from '../types/conversation.js';
import { formatPlayerContextForPrompt } from '../gnt/player-context.js';
import { nextPhase, MAX_QUESTIONS } from '../types/conversation.js';
import { demoGreeting, demoResponse } from './demo-conversation.js';

let anthropicClient: Anthropic | null = null;

// Key rotation for Gemini free tier
let geminiKeyIndex = 0;
let geminiModel: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']> | null = null;
const exhaustedKeys = new Set<number>();

type LLMProvider = 'gemini' | 'claude' | 'demo';

function getProvider(): LLMProvider {
  if (CONFIG.googleApiKeys.length > 0) return 'gemini';
  if (CONFIG.anthropicApiKey) return 'claude';
  return 'demo';
}

/** Whether live AI is available (Gemini or Claude) */
export function isLiveMode(): boolean {
  return getProvider() !== 'demo';
}

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!CONFIG.anthropicApiKey) throw new Error('ANTHROPIC_API_KEY is required');
    anthropicClient = new Anthropic({ apiKey: CONFIG.anthropicApiKey });
  }
  return anthropicClient;
}

function getGeminiModel() {
  const keys = CONFIG.googleApiKeys;
  if (keys.length === 0) throw new Error('No GOOGLE_API_KEY(s) configured');
  const key = keys[geminiKeyIndex % keys.length];
  const genAI = new GoogleGenerativeAI(key);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  return geminiModel;
}

/** Rotate to next Gemini API key after a rate limit error */
function rotateGeminiKey(): boolean {
  const keys = CONFIG.googleApiKeys;
  if (keys.length <= 1) return false;
  exhaustedKeys.add(geminiKeyIndex);
  // Find next non-exhausted key
  for (let i = 1; i < keys.length; i++) {
    const nextIdx = (geminiKeyIndex + i) % keys.length;
    if (!exhaustedKeys.has(nextIdx)) {
      geminiKeyIndex = nextIdx;
      geminiModel = null; // Force re-init with new key
      console.log(`[AI] Rotated to Gemini API key ${geminiKeyIndex + 1}/${keys.length}`);
      return true;
    }
  }
  console.log('[AI] All Gemini API keys exhausted');
  return false;
}

/** Check if an error is a Gemini rate limit (429) */
function isRateLimitError(err: unknown): boolean {
  const msg = String(err);
  return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
}

/**
 * Generate the next agent response in a conversation.
 * Injects player context + phase-specific instructions into system prompt.
 * Wraps user messages in [PLAYER_MESSAGE] delimiters for injection defense.
 */
/**
 * Build the full system prompt for the current conversation state.
 */
function buildSystemPrompt(conversation: ConversationState, playerContext: PlayerContext | null): string {
  let systemPrompt = AGENT_SYSTEM_PROMPT;
  if (playerContext) {
    const contextBlock = formatPlayerContextForPrompt(playerContext);
    systemPrompt += `\n\n--- PLAYER DATA (use this to ask informed questions) ---\n${contextBlock}\n--- END PLAYER DATA ---`;
  } else {
    systemPrompt += `\n\n--- PLAYER DATA ---\nNo player data available yet. Ask the player their name and email so you can look them up.\n--- END PLAYER DATA ---`;
  }

  const currentPhase = nextPhase(conversation.phase, conversation.questionsAsked);
  if (PHASE_INSTRUCTIONS[currentPhase]) {
    systemPrompt += `\n\n${PHASE_INSTRUCTIONS[currentPhase]}`;
  }

  const remaining = Math.max(0, MAX_QUESTIONS - conversation.questionsAsked);
  systemPrompt += `\n\nYou have asked approximately ${conversation.questionsAsked} questions so far. You have room for about ${remaining} more before wrapping up.`;

  return systemPrompt;
}

/**
 * Build message history array for LLM calls.
 */
function buildMessages(conversation: ConversationState, userMessage: string): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of conversation.messages) {
    if (msg.role === 'user') {
      messages.push({ role: 'user', content: `[PLAYER_MESSAGE]\n${msg.content}\n[/PLAYER_MESSAGE]` });
    } else {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }
  messages.push({ role: 'user', content: `[PLAYER_MESSAGE]\n${userMessage}\n[/PLAYER_MESSAGE]` });
  return messages;
}

/**
 * Call Gemini with the conversation.
 */
async function callGemini(systemPrompt: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens: number): Promise<string> {
  const model = getGeminiModel();

  // Gemini uses 'user' and 'model' roles, and requires history to start with 'user'
  // The conversation history often starts with an assistant greeting — skip leading assistant messages
  const allMapped = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  // Drop leading 'model' entries so history starts with 'user' (Gemini requirement)
  let startIdx = 0;
  while (startIdx < allMapped.length && allMapped[startIdx].role === 'model') {
    startIdx++;
  }
  const history = allMapped.slice(startIdx);

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    systemInstruction: { role: 'user' as const, parts: [{ text: systemPrompt }] },
    generationConfig: { maxOutputTokens: maxTokens },
  });

  const result = await chat.sendMessage(lastMessage.content);
  const text = result.response.text();
  return text || "I'm having trouble responding right now. Let me try again.";
}

/**
 * Call Gemini with automatic key rotation on rate limit errors.
 */
async function callGeminiWithRotation(systemPrompt: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens: number): Promise<string> {
  const maxAttempts = CONFIG.googleApiKeys.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await callGemini(systemPrompt, messages, maxTokens);
    } catch (err) {
      if (isRateLimitError(err) && rotateGeminiKey()) {
        console.log(`[AI] Rate limited on key ${geminiKeyIndex + 1}, retrying with next key...`);
        continue;
      }
      throw err; // Not a rate limit error or no more keys
    }
  }
  throw new Error('All Gemini API keys exhausted (rate limited)');
}

/**
 * Call Claude with the conversation.
 */
async function callClaude(systemPrompt: string, messages: Array<{ role: 'user' | 'assistant'; content: string }>, maxTokens: number): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return "I'm having trouble responding right now. Let me try again.";
  }
  return textBlock.text;
}

export async function generateResponse(
  conversation: ConversationState,
  playerContext: PlayerContext | null,
  userMessage: string,
): Promise<string> {
  const provider = getProvider();

  // Demo mode: smart scripted responses when no API key
  if (provider === 'demo' && playerContext) {
    return demoResponse(conversation, playerContext, userMessage).text;
  }

  const systemPrompt = buildSystemPrompt(conversation, playerContext);
  const messages = buildMessages(conversation, userMessage);
  const currentPhase = nextPhase(conversation.phase, conversation.questionsAsked);
  const maxTokens = 1024;

  try {
    if (provider === 'gemini') {
      return await callGeminiWithRotation(systemPrompt, messages, maxTokens);
    } else {
      return await callClaude(systemPrompt, messages, maxTokens);
    }
  } catch (err) {
    console.warn(`[AI] Response generation failed: ${(err as Error).message}`);
    return "I'm having a brief connection issue — give me one more try? Just send your message again.";
  }
}

/**
 * Generate response with streaming — sends tokens to the callback as they arrive.
 * Time-to-first-token drops from 2-4s to 200-400ms (Chris Lattner's #1 recommendation).
 */
export async function generateResponseStreaming(
  conversation: ConversationState,
  playerContext: PlayerContext | null,
  userMessage: string,
  onChunk: (text: string) => void,
): Promise<string> {
  // Streaming only supported for Claude — Gemini falls back to non-streaming
  if (getProvider() === 'gemini') {
    const text = await generateResponse(conversation, playerContext, userMessage);
    onChunk(text);
    return text;
  }
  const anthropic = getAnthropicClient();

  // Build the same system prompt as generateResponse
  let systemPrompt = AGENT_SYSTEM_PROMPT;
  if (playerContext) {
    const contextBlock = formatPlayerContextForPrompt(playerContext);
    systemPrompt += `\n\n--- PLAYER DATA ---\n${contextBlock}\n--- END PLAYER DATA ---`;
  }

  const currentPhase = nextPhase(conversation.phase, conversation.questionsAsked);
  if (PHASE_INSTRUCTIONS[currentPhase]) {
    systemPrompt += `\n\n${PHASE_INSTRUCTIONS[currentPhase]}`;
  }

  const remaining = Math.max(0, MAX_QUESTIONS - conversation.questionsAsked);
  systemPrompt += `\n\nYou have asked approximately ${conversation.questionsAsked} questions. Room for about ${remaining} more.`;

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const msg of conversation.messages) {
    if (msg.role === 'user') {
      messages.push({ role: 'user', content: `[PLAYER_MESSAGE]\n${msg.content}\n[/PLAYER_MESSAGE]` });
    } else {
      messages.push({ role: 'assistant', content: msg.content });
    }
  }
  messages.push({ role: 'user', content: `[PLAYER_MESSAGE]\n${userMessage}\n[/PLAYER_MESSAGE]` });

  const maxTokens = 1024;

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  let fullText = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && 'text' in event.delta) {
      const text = (event.delta as any).text as string;
      fullText += text;
      onChunk(text);
    }
  }

  return fullText || "I'm having trouble responding right now. Let me try again.";
}

/**
 * Generate the initial greeting. Uses a natural "Hi" opener instead of
 * the synthetic START_CONVERSATION hack (per Amanda's review).
 */
export async function generateGreeting(
  playerContext: PlayerContext | null,
): Promise<string> {
  const provider = getProvider();

  // Demo mode: smart scripted greeting when no API key
  if (provider === 'demo' && playerContext) {
    return demoGreeting(playerContext).text;
  }

  let systemPrompt = AGENT_SYSTEM_PROMPT;
  if (playerContext) {
    const contextBlock = formatPlayerContextForPrompt(playerContext);
    systemPrompt += `\n\n--- PLAYER DATA ---\n${contextBlock}\n--- END PLAYER DATA ---`;
  }

  systemPrompt += `\n\n${PHASE_INSTRUCTIONS.greeting}`;

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: '[PLAYER_MESSAGE]\nHi\n[/PLAYER_MESSAGE]' },
  ];

  try {
    if (provider === 'gemini') {
      return await callGeminiWithRotation(systemPrompt, messages, 512);
    } else {
      return await callClaude(systemPrompt, messages, 512);
    }
  } catch (err) {
    console.warn(`[AI] Greeting generation failed: ${(err as Error).message}`);
    // Hardcoded fallback — short, about PEOPLE not schedule
    const name = playerContext ? ` ${playerContext.firstName}` : '';
    const topPartner = playerContext?.frequentPartners?.[0];
    return `Hey${name}! What you share here is yours — nobody sees it. ${topPartner ? `I see you and ${topPartner.playerName} have played ${topPartner.timesPlayed} times together — is ${topPartner.playerName.split(' ')[0]} your go-to partner?` : 'Tell me about the people you love playing with — who makes a session great?'}`;
  }
}
