/**
 * Slack message templates for the Player Agent.
 */

import type { PreferenceProfile } from '../types/signals.js';
import type { MatchmakingOutput } from '../types/player.js';

/** Welcome message when a user first DMs the bot */
export function welcomeMessage(): string {
  return [
    ':wave: *Welcome to GnT Player Agent*',
    '',
    'I\'m your private matchmaking assistant for New England Pickleball Club.',
    '',
    '*How this works:*',
    '1. We have a short conversation about your pickleball preferences',
    '2. Everything you tell me is encrypted — only YOU can ever see the raw conversation',
    '3. I extract structured signals to help match you with great partners',
    '4. Your data is stored on Sui blockchain with Seal encryption',
    '',
    '*Choose your mode:*',
    '• Type `real` + your email to use your actual NEPC history',
    '• Type `demo` to try it as a simulated NEPC player',
    '• Type `demo 1`, `demo 2`, or `demo 3` to pick a specific persona',
  ].join('\n');
}

/** Mode selection confirmation */
export function modeConfirmation(mode: 'real' | 'demo', playerName: string): string {
  if (mode === 'real') {
    return `:white_check_mark: Found you! Playing as *${playerName}* with your real NEPC history.`;
  }
  return `:video_game: Demo mode! You\'re playing as *${playerName}*. Your simulated history is loaded.`;
}

/** Player not found message */
export function playerNotFound(email: string): string {
  return `:x: Couldn't find an NEPC player with email \`${email}\`. Try \`demo\` mode instead, or check the email and try again.`;
}

/** Signal extraction complete message */
export function signalsExtracted(profile: PreferenceProfile): string {
  const counts = [
    profile.affinities.length > 0 ? `${profile.affinities.length} affinities` : '',
    profile.avoids.length > 0 ? `${profile.avoids.length} avoidances` : '',
    profile.stylePreferences.length > 0 ? `${profile.stylePreferences.length} style prefs` : '',
    profile.schedulePreferences.length > 0 ? `${profile.schedulePreferences.length} schedule prefs` : '',
    profile.growthGoals.length > 0 ? `${profile.growthGoals.length} growth goals` : '',
    profile.dealbreakers.length > 0 ? `${profile.dealbreakers.length} dealbreakers` : '',
  ].filter(Boolean);

  return [
    ':lock: *Preferences captured and encrypted!*',
    '',
    `Signals extracted: ${counts.join(', ')}`,
    '',
    'Your raw conversation has been encrypted with Seal — only your wallet can read it.',
    'The matchmaking engine can read your structured preferences (not the raw conversation).',
  ].join('\n');
}

/** Matchmaking recommendation message */
export function matchmakingRecommendation(output: MatchmakingOutput): string {
  const group = output.recommendedGroup
    .map((p, i) => `  ${i + 1}. *${p.playerName}* — ${p.reason} (${p.confidence}% confidence)`)
    .join('\n');

  return [
    ':dart: *Your Ideal Group*',
    '',
    `Based on ${output.basedOnSignals} preference signals:`,
    '',
    group,
    '',
    `:calendar_spiral: Best time: *${output.preferredDay} ${output.preferredTime}*`,
    `:round_pushpin: Location: *${output.location}*`,
  ].join('\n');
}

/** On-chain proof message */
export function onChainProof(data: {
  walrusBlobId?: string;
  sealedSignalIds: string[];
  suiExplorerBase: string;
  digest?: string;
}): string {
  const lines = [
    ':chains: *On-Chain Proof*',
    '',
  ];

  if (data.walrusBlobId) {
    lines.push(`Encrypted conversation stored on Walrus: \`${data.walrusBlobId}\``);
  }

  if (data.sealedSignalIds.length > 0) {
    lines.push(`Sealed signals on Sui: ${data.sealedSignalIds.length} objects`);
    for (const id of data.sealedSignalIds.slice(0, 3)) {
      lines.push(`  • <${data.suiExplorerBase}/object/${id}|${id.slice(0, 16)}...>`);
    }
  }

  if (data.digest) {
    lines.push('');
    lines.push(`Transaction: <${data.suiExplorerBase}/txblock/${data.digest}|View on Sui Explorer>`);
  }

  lines.push('');
  lines.push(':shield: _Only your wallet can decrypt the raw conversation. The matchmaking engine sees structured signals only._');

  return lines.join('\n');
}

/** Privacy demo message — showing access denied */
export function privacyDemo(wrongAddress: string): string {
  return [
    ':no_entry: *Privacy Verification*',
    '',
    `Attempted decryption with address \`${wrongAddress.slice(0, 16)}...\``,
    '',
    ':x: *ACCESS DENIED* — Seal key servers verified the on-chain access policy and rejected the request.',
    '',
    ':white_check_mark: This proves only the player\'s wallet can read their raw conversation.',
    'The encryption is enforced by smart contracts, not by GnT servers.',
  ].join('\n');
}
