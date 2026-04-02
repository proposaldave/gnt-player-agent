/**
 * GnT MCP Client — Fetches player data from GnT production.
 *
 * Uses the same MCP endpoint available in the Cowork tools:
 *   - search-players
 *   - gnt-get-player-details
 *   - gnt-get-player-history
 *   - gnt-get-player-social-data
 *   - gnt-search-events
 *
 * This is a REST-style wrapper since we're calling from Node.js,
 * not from an MCP-aware client.
 */

import { CONFIG } from '../config.js';

interface McpToolCall {
  tool: string;
  params: Record<string, unknown>;
}

interface McpResponse {
  success: boolean;
  data: unknown;
  error?: string;
}

/**
 * Call a GnT MCP tool. The MCP endpoint expects tool name + params.
 */
async function callMcpTool(tool: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const url = CONFIG.gntMcpEndpoint;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(CONFIG.gntMcpApiKey ? { Authorization: `Bearer ${CONFIG.gntMcpApiKey}` } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: tool,
        arguments: params,
      },
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP call failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(`MCP error: ${JSON.stringify(result.error)}`);
  }

  // MCP returns result.result.content[0].text as JSON string
  const content = result?.result?.content;
  if (Array.isArray(content) && content.length > 0 && content[0].text) {
    try {
      return JSON.parse(content[0].text);
    } catch {
      return content[0].text;
    }
  }

  return result.result;
}

/** Search for players by keyword (name, email, phone) */
export async function searchPlayers(keyword: string): Promise<unknown> {
  return callMcpTool('search-players', { keyword });
}

/** Get detailed player profile */
export async function getPlayerDetails(playerId: string): Promise<unknown> {
  return callMcpTool('gnt-get-player-details', { playerId });
}

/** Get player event history */
export async function getPlayerHistory(
  playerId: string,
  eventType: 'upcoming' | 'past' | 'all' = 'past',
): Promise<unknown> {
  return callMcpTool('gnt-get-player-history', {
    playerId,
    eventType,
    includeAllEvents: true,
    includeEventsByDayOfWeek: true,
    includeEventsByTimeOfDay: true,
    includeEventsByLocation: true,
    perPage: '50',
  });
}

/** Get player social connections */
export async function getPlayerSocialData(playerId: string): Promise<unknown> {
  return callMcpTool('gnt-get-player-social-data', { playerId });
}

/** Search events by date range and location */
export async function searchEvents(params: {
  fromDate?: string;
  toDate?: string;
  locationId?: string;
  eventCategoryId?: string;
}): Promise<unknown> {
  return callMcpTool('gnt-search-events', params);
}

/** Get player preference answers */
export async function getPlayerPreferences(playerId: string): Promise<unknown> {
  return callMcpTool('gnt-get-player-preference-answers', { playerId });
}
