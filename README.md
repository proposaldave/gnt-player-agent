# GnT Player Agent — Private AI Matchmaking on Sui

Every player gets a private AI agent that learns what they really think about their community — who they love playing with, who they'd rather avoid, and what makes a session great. The agent negotiates matches on their behalf, while all preference data stays cryptographically private using Seal encryption on Sui.

**Players own their data. Nobody sees it. Not the club, not the platform, not other players.**

## How It Works

```
Player  ───>  AI Conversation  ───>  Signal Extraction
                 (private)              (structured)
                    │                       │
              Seal Encryption          Matchmaking
              (player's key)           (signals only)
                    │
              Walrus Storage
              (decentralized)
```

1. **Private Conversation** — The AI agent uses real booking history and social connections to ask informed questions about preferences.
2. **Signal Extraction** — Structured preference signals (affinities, avoidances, style, schedule, growth goals) are extracted from the conversation.
3. **Seal Encryption** — Raw conversation is encrypted with Seal so only the player's wallet can decrypt it.
4. **Walrus Storage** — Encrypted data stored on decentralized Walrus storage.
5. **Sui Messaging** — Every message is recorded on-chain via the Sui Messaging SDK. Verifiable. Auditable. Player-controlled.
6. **Matchmaking** — Structured signals (never raw conversation) power group recommendations.

## Quick Start

```bash
# Install
npm install

# Run (works immediately — no API keys needed for demo mode)
npm start
# → opens at http://localhost:3847

# For live AI conversations, add a Gemini key (free tier):
echo "GOOGLE_API_KEY=your-key" >> .env
npm start
```

The agent runs in three modes:
- **Demo Mode** (no keys) — Smart scripted conversations that demonstrate the full flow
- **Gemini Mode** (free) — Live AI conversations using Google Gemini 2.5 Flash
- **Claude Mode** (paid) — Live AI conversations using Anthropic Claude

## Sui Integration

| Component | What | Status |
|-----------|------|--------|
| **Seal Encryption** | Player-owned encryption — only their wallet decrypts | Simulated (testnet-ready) |
| **Walrus Storage** | Decentralized blob storage for encrypted transcripts | Simulated (testnet-ready) |
| **Sui Messaging SDK** | On-chain message recording with group encryption | Live on testnet |
| **Move Contracts** | 6 modules: player agent, coordination, community, sealed signals, TEE verifier, contribution scoring | Compiled, tested |

When `MESSAGING_ENABLED=true` and a Sui private key is configured, conversations are recorded on-chain in real-time. Each session creates a Sui Group, and every message is encrypted and relayed through the Sui Messaging SDK.

## Move Smart Contracts

Located in `../sources/`. Six modules (~2,300 lines):

- **player_agent.move** — Player identity, 11 signal types, 3 privacy levels, role-based access
- **sealed_signals.move** — Seal IBE encryption, metadata redaction, on-chain access policies
- **coordination.move** — Agent-to-agent invitations, sessions, post-match feedback
- **community.move** — Club shared object, membership, coordinator capabilities
- **nautilus_verifier.move** — TEE attestation for verifiable AI compute
- **contribution.move** — Outcome-based scoring, tiers, second-order effects

## Environment Variables

See `.env.example` for all options. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | For live AI | Gemini API key (free tier) |
| `GOOGLE_API_KEYS` | For rotation | Comma-separated keys, auto-rotates on rate limit |
| `ANTHROPIC_API_KEY` | For Claude | Claude API key (alternative to Gemini) |
| `SUI_PRIVATE_KEY` | For on-chain | Agent wallet private key |
| `MESSAGING_ENABLED` | For messaging | Enable Sui Messaging SDK (default: true) |

Without any API keys, the agent runs in demo mode with scripted conversations that demonstrate the complete flow including signal extraction, encryption, and matchmaking.

## Architecture

```
agent/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Environment config
│   ├── ai/
│   │   ├── agent.ts          # LLM handler (Gemini + Claude + demo)
│   │   ├── prompts.ts        # System prompts per conversation phase
│   │   ├── signal-extractor.ts  # Post-conversation signal extraction
│   │   └── demo-conversation.ts # Smart scripted demo mode
│   ├── sui/
│   │   ├── messaging.ts      # Sui Messaging SDK integration
│   │   ├── seal.ts           # Seal encrypt/decrypt
│   │   ├── walrus.ts         # Walrus blob storage
│   │   └── client.ts         # Sui SDK client
│   ├── gnt/
│   │   ├── simulated-players.ts # Demo personas with realistic history
│   │   ├── player-context.ts    # Build player context for LLM
│   │   └── mcp-client.ts       # GnT production API
│   ├── web/
│   │   ├── chat-ui.ts        # Self-contained HTML UI
│   │   └── server.ts         # Express API server
│   ├── slack/
│   │   ├── bot.ts            # Slack DM handler
│   │   └── messages.ts       # Message templates
│   └── types/
│       ├── signals.ts        # Signal types (matches Move contracts)
│       ├── player.ts         # Player context types
│       └── conversation.ts   # Conversation state machine
├── .env.example
├── package.json
└── tsconfig.json
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Interactive chat UI |
| `/health` | GET | Server health + session count |
| `/api/status` | GET | AI provider + Sui connection status |
| `/api/personas` | GET | List demo player personas |
| `/api/start` | POST | Start conversation with a persona |
| `/api/chat` | POST | Send message, receive AI response |
| `/api/finish` | POST | End conversation → extract signals → encrypt → recommend |

## License

MIT
