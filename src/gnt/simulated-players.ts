/**
 * Simulated Players — For demos where the user isn't a real NEPC member.
 *
 * Creates realistic-but-fake player contexts based on the actual NEPC
 * community structure. Anyone can experience the agent conversation
 * by picking a simulated persona.
 */

import type { PlayerContext } from '../types/player.js';

/** Pre-built simulated personas for demo mode */
export const SIMULATED_PLAYERS: PlayerContext[] = [
  {
    playerId: 'sim-001',
    firstName: 'Alex',
    lastName: 'Rivera',
    fullName: 'Alex Rivera',
    email: 'alex.demo@gnt.ai',
    skillRating: 3.5,
    archetype: 'social',
    membershipStatus: 'Active',
    joinDate: '2025-06-15',
    location: 'Rye',
    totalEventsPlayed: 47,
    favoriteDay: 'Tuesday',
    favoriteTimeSlot: 'morning',
    favoriteLocation: 'Rye',
    eventHistory: [
      { eventId: 'sim-e1', date: '2026-03-25', time: '9:00 AM', locationName: 'Rye', categoryName: 'Open Play', playerCount: 8, otherPlayers: ['Sarah M.', 'Tom K.', 'Lisa P.'] },
      { eventId: 'sim-e2', date: '2026-03-22', time: '10:00 AM', locationName: 'Rye', categoryName: 'Doubles', playerCount: 4, otherPlayers: ['Sarah M.', 'Jeff B.', 'Mike D.'] },
      { eventId: 'sim-e3', date: '2026-03-18', time: '9:00 AM', locationName: 'Rye', categoryName: 'Open Play', playerCount: 8, otherPlayers: ['Tom K.', 'Nancy W.', 'Dave L.'] },
      { eventId: 'sim-e4', date: '2026-03-15', time: '6:00 PM', locationName: 'Middleton', categoryName: 'Doubles', playerCount: 4, otherPlayers: ['Lisa P.', 'Chris H.', 'Pat R.'] },
      { eventId: 'sim-e5', date: '2026-03-11', time: '9:00 AM', locationName: 'Rye', categoryName: 'Open Play', playerCount: 8, otherPlayers: ['Sarah M.', 'Jeff B.', 'Tom K.'] },
    ],
    socialConnections: [
      { playerId: 'sim-s1', playerName: 'Sarah M.', gamesShared: 12, gntScore: 8.5 },
      { playerId: 'sim-s2', playerName: 'Tom K.', gamesShared: 9, gntScore: 7.2 },
      { playerId: 'sim-s3', playerName: 'Jeff B.', gamesShared: 7, gntScore: 6.1 },
      { playerId: 'sim-s4', playerName: 'Lisa P.', gamesShared: 6, gntScore: 7.8 },
      { playerId: 'sim-s5', playerName: 'Mike D.', gamesShared: 4, gntScore: 3.2 },
      { playerId: 'sim-s6', playerName: 'Nancy W.', gamesShared: 3, gntScore: 5.5 },
      { playerId: 'sim-s7', playerName: 'Chris H.', gamesShared: 2, gntScore: 6.0 },
    ],
    frequentPartners: [
      { playerName: 'Sarah M.', playerId: 'sim-s1', timesPlayed: 12 },
      { playerName: 'Tom K.', playerId: 'sim-s2', timesPlayed: 9 },
      { playerName: 'Jeff B.', playerId: 'sim-s3', timesPlayed: 7 },
      { playerName: 'Lisa P.', playerId: 'sim-s4', timesPlayed: 6 },
      { playerName: 'Mike D.', playerId: 'sim-s5', timesPlayed: 4 },
    ],
  },
  {
    playerId: 'sim-002',
    firstName: 'Jordan',
    lastName: 'Chen',
    fullName: 'Jordan Chen',
    email: 'jordan.demo@gnt.ai',
    skillRating: 4.0,
    archetype: 'balanced',
    membershipStatus: 'Active',
    joinDate: '2024-11-01',
    location: 'Middleton',
    totalEventsPlayed: 83,
    favoriteDay: 'Thursday',
    favoriteTimeSlot: 'evening',
    favoriteLocation: 'Middleton',
    eventHistory: [
      { eventId: 'sim-e10', date: '2026-03-27', time: '6:00 PM', locationName: 'Middleton', categoryName: 'Competitive Play', playerCount: 4, otherPlayers: ['Brian T.', 'Stacy L.', 'Derek M.'] },
      { eventId: 'sim-e11', date: '2026-03-25', time: '6:00 PM', locationName: 'Middleton', categoryName: 'Doubles', playerCount: 4, otherPlayers: ['Stacy L.', 'Kevin R.', 'Amanda P.'] },
      { eventId: 'sim-e12', date: '2026-03-20', time: '7:00 PM', locationName: 'Middleton', categoryName: 'Competitive Play', playerCount: 4, otherPlayers: ['Brian T.', 'Derek M.', 'Rob S.'] },
      { eventId: 'sim-e13', date: '2026-03-18', time: '6:00 PM', locationName: 'Rye', categoryName: 'Open Play', playerCount: 8, otherPlayers: ['Amanda P.', 'Kevin R.', 'Lauren B.'] },
      { eventId: 'sim-e14', date: '2026-03-13', time: '6:00 PM', locationName: 'Middleton', categoryName: 'Doubles', playerCount: 4, otherPlayers: ['Stacy L.', 'Brian T.', 'Amanda P.'] },
    ],
    socialConnections: [
      { playerId: 'sim-s10', playerName: 'Stacy L.', gamesShared: 18, gntScore: 9.1 },
      { playerId: 'sim-s11', playerName: 'Brian T.', gamesShared: 15, gntScore: 8.3 },
      { playerId: 'sim-s12', playerName: 'Amanda P.', gamesShared: 11, gntScore: 7.6 },
      { playerId: 'sim-s13', playerName: 'Derek M.', gamesShared: 9, gntScore: 6.8 },
      { playerId: 'sim-s14', playerName: 'Kevin R.', gamesShared: 7, gntScore: 5.9 },
      { playerId: 'sim-s15', playerName: 'Rob S.', gamesShared: 4, gntScore: 4.5 },
    ],
    frequentPartners: [
      { playerName: 'Stacy L.', playerId: 'sim-s10', timesPlayed: 18 },
      { playerName: 'Brian T.', playerId: 'sim-s11', timesPlayed: 15 },
      { playerName: 'Amanda P.', playerId: 'sim-s12', timesPlayed: 11 },
      { playerName: 'Derek M.', playerId: 'sim-s13', timesPlayed: 9 },
      { playerName: 'Kevin R.', playerId: 'sim-s14', timesPlayed: 7 },
    ],
  },
  {
    playerId: 'sim-003',
    firstName: 'Taylor',
    lastName: 'Morgan',
    fullName: 'Taylor Morgan',
    email: 'taylor.demo@gnt.ai',
    skillRating: 3.0,
    archetype: 'competitive',
    membershipStatus: 'Active',
    joinDate: '2026-01-10',
    location: 'Rye',
    totalEventsPlayed: 11,
    favoriteDay: 'Saturday',
    favoriteTimeSlot: 'morning',
    favoriteLocation: 'Rye',
    eventHistory: [
      { eventId: 'sim-e20', date: '2026-03-22', time: '10:00 AM', locationName: 'Rye', categoryName: 'Competitive Round Robin', playerCount: 8, otherPlayers: ['Kim R.', 'Jason T.', 'Maria L.'], result: '1st Place', scores: '11-7, 11-5, 11-9' },
      { eventId: 'sim-e21', date: '2026-03-15', time: '10:00 AM', locationName: 'Rye', categoryName: 'Competitive Round Robin', playerCount: 6, otherPlayers: ['Kim R.', 'Paul D.'], result: '1st Place', scores: '11-8, 11-6, 9-11, 11-4' },
      { eventId: 'sim-e22', date: '2026-03-08', time: '9:00 AM', locationName: 'Rye', categoryName: 'Open Play', playerCount: 10, otherPlayers: ['Maria L.', 'Jason T.', 'Sue K.'] },
    ],
    socialConnections: [
      { playerId: 'sim-s20', playerName: 'Kim R.', gamesShared: 4, gntScore: 6.0 },
      { playerId: 'sim-s21', playerName: 'Jason T.', gamesShared: 3, gntScore: 5.5 },
      { playerId: 'sim-s22', playerName: 'Maria L.', gamesShared: 2, gntScore: 5.0 },
    ],
    frequentPartners: [
      { playerName: 'Kim R.', playerId: 'sim-s20', timesPlayed: 4 },
      { playerName: 'Jason T.', playerId: 'sim-s21', timesPlayed: 3 },
      { playerName: 'Maria L.', playerId: 'sim-s22', timesPlayed: 2 },
    ],
  },
];

/** Get a simulated player by index or random */
export function getSimulatedPlayer(index?: number): PlayerContext {
  if (index !== undefined && index >= 0 && index < SIMULATED_PLAYERS.length) {
    return SIMULATED_PLAYERS[index];
  }
  return SIMULATED_PLAYERS[Math.floor(Math.random() * SIMULATED_PLAYERS.length)];
}

/** List available simulated personas for selection (no ratings — GnT moves beyond ratings) */
export function listSimulatedPlayers(): Array<{ name: string; location: string; description: string; archetype: string }> {
  const labels: Record<string, string> = { social: '\u{1F91D} Social Player', balanced: '\u2696\uFE0F All-Around', competitive: '\u{1F3C6} Competitive' };
  return SIMULATED_PLAYERS.map((p) => ({
    name: p.fullName,
    location: p.favoriteLocation || 'Unknown',
    description: `${labels[p.archetype || 'balanced']} \u00B7 ${p.totalEventsPlayed} events \u00B7 ${p.frequentPartners.length} frequent partners`,
    archetype: p.archetype || 'balanced',
  }));
}
