/**
 * Player Context Builder — Transforms raw MCP data into structured context
 * that gets injected into the Claude conversation system prompt.
 *
 * The agent uses this to ask SMART questions, not generic ones.
 * "I see you've played 12 Tuesday evenings at Rye" beats "What times do you prefer?"
 */

import type {
  PlayerContext,
  EventSummary,
  SocialConnection,
  PartnerFrequency,
} from '../types/player.js';
import {
  searchPlayers,
  getPlayerDetails,
  getPlayerHistory,
  getPlayerSocialData,
} from './mcp-client.js';

/**
 * Build a complete player context from GnT MCP data.
 * This is what gets injected into the Claude system prompt.
 */
export async function buildPlayerContext(
  identifier: string, // email, name, or player ID
): Promise<PlayerContext | null> {
  try {
    // Step 1: Find the player
    const searchResult = await searchPlayers(identifier) as any;
    if (!searchResult?.data?.length) {
      console.log(`[MCP] No player found for: ${identifier}`);
      return null;
    }

    const player = searchResult.data[0];
    const playerId = player.id;

    // Step 2: Get details, history, and social data in parallel
    const [details, history, social] = await Promise.all([
      getPlayerDetails(playerId).catch(() => null),
      getPlayerHistory(playerId, 'past').catch(() => null),
      getPlayerSocialData(playerId).catch(() => null),
    ]) as [any, any, any];

    // Step 3: Extract event summaries
    const events: EventSummary[] = [];
    if (history?.data?.allEvents) {
      for (const evt of history.data.allEvents.slice(0, 30)) {
        events.push({
          eventId: evt.id || '',
          date: evt.date || '',
          time: evt.time || '',
          locationName: evt.location_name || '',
          categoryName: evt.category_name || '',
          playerCount: evt.player_count || 0,
          otherPlayers: evt.players?.map((p: any) => p.name).filter((n: string) => n !== player.full_name) || [],
        });
      }
    }

    // Step 4: Extract social connections
    const connections: SocialConnection[] = [];
    if (social?.data?.connections) {
      for (const conn of social.data.connections.slice(0, 20)) {
        connections.push({
          playerId: conn.player_id || '',
          playerName: conn.player_name || '',
          gamesShared: conn.games_shared || 0,
          gntScore: conn.gnt_score,
        });
      }
    }

    // Step 5: Compute frequent partners (top 10 by games shared)
    const frequentPartners: PartnerFrequency[] = connections
      .sort((a, b) => b.gamesShared - a.gamesShared)
      .slice(0, 10)
      .map((c) => ({
        playerName: c.playerName,
        playerId: c.playerId,
        timesPlayed: c.gamesShared,
      }));

    // Step 6: Compute favorite day/time/location from history stats
    let favoriteDay: string | undefined;
    let favoriteTimeSlot: string | undefined;
    let favoriteLocation: string | undefined;

    if (history?.data?.eventsByDayOfWeek) {
      const days = history.data.eventsByDayOfWeek;
      const topDay = Object.entries(days).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0];
      if (topDay) favoriteDay = topDay[0];
    }

    if (history?.data?.eventsByTimeOfDay) {
      const times = history.data.eventsByTimeOfDay;
      const topTime = Object.entries(times).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0];
      if (topTime) favoriteTimeSlot = topTime[0];
    }

    if (history?.data?.eventsByLocation) {
      const locs = history.data.eventsByLocation;
      const topLoc = Object.entries(locs).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0];
      if (topLoc) favoriteLocation = topLoc[0];
    }

    return {
      playerId,
      firstName: details?.data?.first_name || player.first_name || '',
      lastName: details?.data?.last_name || player.last_name || '',
      fullName: details?.data?.full_name || player.full_name || '',
      email: details?.data?.email || player.email || '',
      phone: details?.data?.phone,
      skillRating: details?.data?.rating ? parseFloat(details.data.rating) : undefined,
      membershipStatus: details?.data?.membership_status,
      joinDate: details?.data?.join_date,
      location: favoriteLocation,
      eventHistory: events,
      socialConnections: connections,
      totalEventsPlayed: events.length,
      favoriteDay,
      favoriteTimeSlot,
      favoriteLocation,
      frequentPartners,
    };
  } catch (error) {
    console.error('[MCP] Failed to build player context:', error);
    return null;
  }
}

/**
 * Format player context as a concise string for injection into Claude's system prompt.
 * Keep it focused — Claude doesn't need every field, just what's useful for conversation.
 */
export function formatPlayerContextForPrompt(ctx: PlayerContext): string {
  const lines: string[] = [
    `PLAYER: ${ctx.fullName}`,
    // Skill rating intentionally omitted — demo focuses on people, not ratings
    ctx.membershipStatus ? `Membership: ${ctx.membershipStatus}` : '',
    ctx.joinDate ? `Member since: ${ctx.joinDate}` : '',
    `Total events played: ${ctx.totalEventsPlayed}`,
    ctx.favoriteDay ? `Most common day: ${ctx.favoriteDay}` : '',
    ctx.favoriteTimeSlot ? `Most common time: ${ctx.favoriteTimeSlot}` : '',
    ctx.favoriteLocation ? `Preferred location: ${ctx.favoriteLocation}` : '',
  ].filter(Boolean);

  if (ctx.frequentPartners.length > 0) {
    lines.push('');
    lines.push('FREQUENT PARTNERS (who they play with most):');
    for (const p of ctx.frequentPartners.slice(0, 5)) {
      lines.push(`  - ${p.playerName}: ${p.timesPlayed} games together`);
    }
  }

  if (ctx.socialConnections.length > 0) {
    lines.push('');
    lines.push('SOCIAL CONNECTIONS (broader network):');
    for (const c of ctx.socialConnections.slice(0, 8)) {
      const score = c.gntScore ? ` (GnT score: ${c.gntScore})` : '';
      lines.push(`  - ${c.playerName}: ${c.gamesShared} shared games${score}`);
    }
  }

  if (ctx.eventHistory.length > 0) {
    lines.push('');
    lines.push('RECENT EVENTS (last 5):');
    for (const e of ctx.eventHistory.slice(0, 5)) {
      const players = e.otherPlayers.length > 0 ? ` with ${e.otherPlayers.join(', ')}` : '';
      lines.push(`  - ${e.date} ${e.time} at ${e.locationName} (${e.categoryName})${players}`);
    }
  }

  return lines.join('\n');
}
