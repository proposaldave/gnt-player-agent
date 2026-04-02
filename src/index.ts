import { createSlackBot, getActiveConversations } from './slack/bot.js';
import { createWebServer } from './web/server.js';
import { validateConfig, CONFIG } from './config.js';
import { initMessaging, isMessagingEnabled } from './sui/messaging.js';

async function main() {
  console.log('='.repeat(60));
  console.log('  GnT Player Agent — Autonomous Social Coordination Demo');
  console.log('  Sui Testnet | Seal Encryption | Claude AI');
  console.log('='.repeat(60));
  console.log();

  if (CONFIG.googleApiKey) {
    console.log('[Mode] LIVE MODE — using Gemini 2.5 Pro for conversations');
  } else if (CONFIG.anthropicApiKey) {
    console.log('[Mode] LIVE MODE — using Claude API for conversations');
  } else {
    console.log('[Mode] DEMO MODE — using smart scripted conversations (no API key needed)');
    console.log('[Mode] Set GOOGLE_API_KEY or ANTHROPIC_API_KEY in .env for live AI');
  }

  // Initialize Sui Messaging SDK
  if (CONFIG.messagingEnabled) {
    const msgResult = await initMessaging();
    if (msgResult.enabled) {
      console.log(`[Mode] MESSAGING: Real Sui Messaging SDK on ${CONFIG.network}`);
      console.log(`[Mode] Agent address: ${msgResult.address}`);
    } else {
      console.log(`[Mode] MESSAGING: Initialization failed — ${msgResult.error || 'unknown'}`);
      console.log('[Mode] Demo will run with simulated encryption');
    }
  } else {
    console.log('[Mode] MESSAGING: Disabled (set MESSAGING_ENABLED=true to enable)');
  }

  const missing = validateConfig();
  if (missing.length > 0) {
    console.warn(`[Config] Optional env vars missing (features degraded): ${missing.join(', ')}`);
  }

  let slackStarted = false;
  if (CONFIG.slackBotToken && CONFIG.slackAppToken) {
    try {
      const slackApp = createSlackBot();
      await slackApp.start();
      slackStarted = true;
      console.log('[Slack] Bot started in Socket Mode — DM the bot to chat');
    } catch (error) {
      console.warn('[Slack] Bot failed to start:', (error as Error).message);
    }
  } else {
    console.log('[Slack] Skipped — set SLACK_BOT_TOKEN and SLACK_APP_TOKEN to enable');
  }

  const webPort = parseInt(process.env.PORT || '3847');
  try {
    const webServer = createWebServer();
    const server = webServer.listen(webPort);
    await new Promise<void>((resolve, reject) => {
      server.on('listening', () => resolve());
      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${webPort} is in use. Set PORT env var to a different port.`));
        } else {
          reject(err);
        }
      });
    });
    console.log(`[Web] Chat interface: http://localhost:${webPort}`);
  } catch (error) {
    console.error('[Web] Server failed:', (error as Error).message);
    if (!slackStarted) {
      console.error('[FATAL] Neither Slack nor web interface could start. Exiting.');
      process.exit(1);
    }
  }

  console.log();
  console.log('Ready! Interfaces:');
  if (slackStarted) console.log('  Slack: DM the bot with "start", "demo", or "real <email>"');
  console.log(`  Web:   http://localhost:${webPort}`);
  if (isMessagingEnabled()) {
    console.log('  Sui:   Messages encrypted via Sui Messaging SDK (testnet)');
  }
  console.log();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
