import 'dotenv/config';

export const CONFIG = {
  network: (process.env.SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet',
  suiPrivateKey: process.env.SUI_PRIVATE_KEY || '',
  packageId: process.env.SUI_PACKAGE_ID || '0x984960ebddd75c15c6d38355ac462621db0ffc7d6647214c802cd3b685e1af3d',
  sealPackageId: process.env.SEAL_PACKAGE_ID || '',
  walrusPublisherUrl: process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
  walrusAggregatorUrl: process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
  slackBotToken: process.env.SLACK_BOT_TOKEN || '',
  slackAppToken: process.env.SLACK_APP_TOKEN || '',
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  googleApiKeys: (process.env.GOOGLE_API_KEYS || process.env.GOOGLE_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean),
  gntMcpEndpoint: process.env.GNT_MCP_ENDPOINT || 'https://v2.gnt.ai/mcp/gnt',
  gntMcpApiKey: process.env.GNT_MCP_API_KEY || '',
  enokiSecretKey: process.env.ENOKI_SECRET_API_KEY || '',
  enokiPublicKey: process.env.ENOKI_PUBLIC_API_KEY || '',
  locations: {
    rye: '01jwpqstchv8hgd6tvn97n7r88',
    middleton: '01jwpqss8yvskc8y2ry8hj0k2g',
  },
  demoPlayerEmail: process.env.DEMO_PLAYER_EMAIL || '',
  // Messaging SDK config
  messagingEnabled: process.env.MESSAGING_ENABLED !== 'false', // default: enabled
} as const;

export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!CONFIG.slackBotToken) missing.push('SLACK_BOT_TOKEN');
  if (!CONFIG.slackAppToken) missing.push('SLACK_APP_TOKEN');
  if (!CONFIG.anthropicApiKey && !CONFIG.googleApiKey) missing.push('ANTHROPIC_API_KEY or GOOGLE_API_KEY');
  return missing;
}

export function validateFullConfig(): string[] {
  const missing = validateConfig();
  if (!CONFIG.suiPrivateKey) missing.push('SUI_PRIVATE_KEY');
  if (!CONFIG.packageId || CONFIG.packageId === '0x0') missing.push('SUI_PACKAGE_ID');
  return missing;
}
