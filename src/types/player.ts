/**
 * Player types — data loaded from GnT MCP before conversations.
 */

export interface PlayerContext {
  playerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  skillRating?: number;
  membershipStatus?: string;
  joinDate?: string;
  location?: string;

  // Behavioral data from GnT MCP
  eventHistory: EventSummary[];
  socialConnections: SocialConnection[];
  totalEventsPlayed: number;
  favoriteDay?: string;
  favoriteTimeSlot?: string;
  favoriteLocation?: string;

  // Private booking data (who they choose to play with)
  frequentPartners: PartnerFrequency[];

  // Player archetype (drives UI emphasis)
  archetype?: 'social' | 'balanced' | 'competitive';
}

export interface EventSummary {
  eventId: string;
  date: string;
  time: string;
  locationName: string;
  categoryName: string;
  playerCount: number;
  otherPlayers: string[];
  result?: string;
  scores?: string;
}

export interface SocialConnection {
  playerId: string;
  playerName: string;
  gamesShared: number;
  gntScore?: number;
}

export interface PartnerFrequency {
  playerName: string;
  playerId: string;
  timesPlayed: number;
}

/** Minimal player info for matchmaking output */
export interface MatchRecommendation {
  playerName: string;
  playerId: string;
  reason: string;
  confidence: number; // 0-100
}

export interface MatchmakingOutput {
  playerName: string;
  recommendedGroup: MatchRecommendation[];
  preferredDay: string;
  preferredTime: string;
  location: string;
  basedOnSignals: number; // how many signals contributed
}
