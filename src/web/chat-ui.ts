/**
 * Chat UI — Three-panel layout: Chat + Invitation Feed + Community Graph
 * All panels interconnected: every action in one panel ripples through the others.
 */

export function chatPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Private Social Diary | Give Diary on Sui</title>
<meta name="description" content="Every player owns a private AI agent that learns their social preferences, negotiates perfect matches, and never shares a word. Built on Sui blockchain.">
<meta property="og:title" content="Your Private Social Diary | Give Diary">
<meta property="og:description" content="How do you really feel about the people you play with? Your AI agent knows — and never tells.">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Private Social Diary | Give Diary">
<meta name="twitter:description" content="A private AI agent that learns who you love playing with, who drains you, and never shares a word.">
<style>
  :root {
    --bg: #0a0e1a;
    --surface: #111827;
    --surface2: #1a2236;
    --accent: #6366f1;
    --accent2: #818cf8;
    --green: #34d399;
    --red: #f87171;
    --yellow: #fbbf24;
    --warm: #f59e0b;
    --warm-glow: rgba(245,158,11,0.12);
    --text: #e2e8f0;
    --text2: #a0aec0;
    --border: #1e293b;
    --radius: 12px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow-y: auto; }
  body { font-family: -apple-system, 'Inter', sans-serif; background: var(--bg); color: var(--text); }
  .container { max-width: 1500px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; }

  /* Header */
  .header { text-align: center; padding: 20px 0 16px; border-bottom: 1px solid var(--border); margin-bottom: 18px; flex-shrink: 0; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .header h1 span { color: var(--accent2); }

  /* Hero Animation (now inside comparison card) */
  .hero-canvas-wrap { position: relative; width: 100%; height: 200px; margin-bottom: 4px; overflow: hidden; display: none; }
  .hero-canvas-wrap canvas { width: 100%; height: 100%; display: block; }
  .new-world-canvas { width: 100%; height: 170px; margin-bottom: 8px; position: relative; }
  .new-world-canvas canvas { width: 100%; height: 100%; display: block; }
  .header .tagline { color: var(--text); font-size: 13px; line-height: 1.4; font-weight: 400; }
  .header .sub { color: var(--text2); font-size: 11px; margin-top: 4px; }
  .badges { display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap; }
  .badge { font-size: 12px; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); color: var(--text2); }
  .badge.active { border-color: #34d39966; color: var(--green); }
  .badge.simulated { border-color: rgba(245,158,11,0.4) !important; color: var(--warm) !important; }
  .badge.sui { border-color: #4da2ff44; color: #4da2ff; }
  .badge.sui.active { border-color: #34d39966; color: var(--green); }
  .badge.seal { border-color: #34d39944; color: var(--green); }
  .badge.claude { border-color: #d97f0a44; color: #d97f0a; }
  .badge.claude.active { border-color: #34d39966; color: var(--green); }
  .badge.messaging { background: transparent; color: #4da2ff; }
  .badge.messaging.active { border-color: #34d39966; color: var(--green); background: transparent; }

  /* Wallet Identity Bar */
  .wallet-bar { display: none; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; margin-bottom: 12px; align-items: center; gap: 10px; font-size: 11px; flex-shrink: 0; }
  .wallet-bar.visible { display: flex; }
  .wallet-bar .wallet-icon { font-size: 14px; }
  .wallet-bar .wallet-addr { font-family: monospace; color: var(--accent2); font-size: 11px; }
  .wallet-bar .wallet-label { color: var(--text2); }
  .wallet-bar .wallet-status { margin-left: auto; color: var(--green); font-weight: 600; font-size: 10px; display: flex; align-items: center; gap: 4px; }
  .wallet-bar .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; }

  /* Product Toggle (Come for the tool / Stay for the network) */
  .product-toggle { display: flex; justify-content: center; gap: 0; margin: 12px auto 16px; background: var(--surface); border-radius: 10px; border: 1px solid var(--border); overflow: hidden; max-width: 420px; }
  .product-opt { flex: 1; padding: 10px 14px; font-size: 13px; font-weight: 600; background: none; border: none; color: var(--text2); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .product-opt.active { background: var(--accent); color: #fff; }
  .product-opt:not(.active):hover { background: var(--surface2); }

  /* Tool section (diary topics + modules) */
  .tool-section { max-width: 700px; margin: 0 auto; }
  .diary-topics { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 16px; }
  .diary-topic-card { display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; }
  .diary-topic-card:hover { border-color: var(--accent); background: var(--surface2); transform: translateY(-1px); }
  .topic-icon { font-size: 24px; flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--surface2); border-radius: 10px; }
  .topic-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 2px; color: var(--text); }
  .topic-info p { font-size: 12px; color: var(--text2); line-height: 1.4; }
  .module-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .module-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; position: relative; overflow: hidden; }
  .module-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .module-card p { font-size: 11px; color: var(--text2); margin-bottom: 10px; line-height: 1.4; }
  .module-badge { position: absolute; top: 10px; right: 10px; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
  .module-badge.live { background: rgba(52,211,153,0.15); color: var(--green); border: 1px solid rgba(52,211,153,0.3); }
  .module-badge.soon { background: rgba(245,158,11,0.1); color: var(--warm); border: 1px solid rgba(245,158,11,0.25); }
  .module-play-btn { display: block; width: 100%; padding: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .module-play-btn:hover { background: var(--accent2); }
  @media (max-width: 750px) {
    .module-cards { grid-template-columns: 1fr; }
  }

  /* Persona picker */
  .persona-section { margin-bottom: 20px; flex-shrink: 0; overflow-y: auto; }
  .persona-section > p { color: var(--text2); font-size: 13px; margin-bottom: 10px; }
  .persona-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
  .persona { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; cursor: pointer; transition: all 0.2s; }
  .persona:hover { border-color: var(--accent); transform: translateY(-1px); }
  .persona.active { border-color: var(--green); background: var(--surface2); }
  .persona .name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
  .persona .meta { font-size: 11px; color: var(--text2); }
  .persona .avatar { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 8px; flex-shrink: 0; color: white; }
  .start-btn { width: 100%; padding: 12px; border-radius: 8px; margin-top: 12px; background: var(--accent); color: white; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
  .start-btn:hover { background: var(--accent2); }

  /* Mode toggle */
  .mode-toggle { display: flex; gap: 0; margin: 12px auto 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; width: fit-content; }
  .mode-opt { padding: 8px 18px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text2); border: none; background: transparent; }
  .mode-opt.active { background: var(--accent); color: white; }
  .mode-opt:not(.active):hover { background: var(--surface2); }
  .mode-hint { text-align: center; font-size: 10px; color: var(--text2); margin-top: 6px; }
  .mode-hint .encrypted { color: var(--green); font-weight: 600; }

  /* Three-panel app layout */
  .app-layout { display: none; grid-template-columns: 1fr 1.1fr 1fr; gap: 12px; flex: 1; min-height: 0; }
  .app-layout.visible { display: grid; }

  /* Chat-only layout */
  .chat-only-layout { display: none; flex: 1; min-height: 0; max-width: 520px; margin: 0 auto; width: 100%; }
  .chat-only-layout.visible { display: flex; flex-direction: column; }
  .chat-only-layout .messages { flex: 1; overflow-y: auto; margin-bottom: 8px; scroll-behavior: smooth; padding-right: 4px; }
  .chat-only-layout .privacy-bar { text-align: center; font-size: 10px; color: var(--green); padding: 4px 0 6px; display: flex; align-items: center; justify-content: center; gap: 5px; }
  .chat-only-layout .privacy-bar .lock { font-size: 12px; }

  /* Chat Panel */
  .chat-panel { display: flex; flex-direction: column; min-height: 0; }
  .panel-header { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; padding: 0 2px 8px; display: flex; align-items: center; gap: 6px; }
  .panel-header .panel-icon { font-size: 13px; }
  .player-info { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
  .player-info .name { font-weight: 600; font-size: 13px; }
  .player-info .details { font-size: 10px; color: var(--text2); }

  .messages { flex: 1; overflow-y: auto; margin-bottom: 8px; scroll-behavior: smooth; padding-right: 4px; min-height: 100px; }
  .msg { margin-bottom: 8px; padding: 8px 12px; border-radius: var(--radius); max-width: 92%; font-size: 12.5px; line-height: 1.5; animation: msgIn 0.3s ease; }
  @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .msg.agent { background: var(--surface); border: 1px solid var(--border); margin-right: auto; }
  .msg.agent .label { font-size: 9px; color: var(--accent2); margin-bottom: 2px; }
  .msg.user { background: var(--accent); color: white; margin-left: auto; }
  .msg.system { background: var(--surface2); border: 1px solid var(--border); font-size: 11px; color: var(--text2); max-width: 100%; text-align: center; }
  .msg.feed-event { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); margin-right: auto; max-width: 100%; font-size: 11px; color: var(--text2); }

  .typing-dots { display: flex; gap: 4px; padding: 6px 0; }
  .typing-dots span { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--accent2); animation: bounce 1.4s infinite; }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }

  .input-row { display: flex; gap: 6px; }
  .chat-input { flex: 1; padding: 8px 12px; border-radius: 8px; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 12px; outline: none; }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--text2); }
  .send-btn, .finish-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; }
  .send-btn { background: var(--accent); color: white; }
  .send-btn:hover { background: var(--accent2); }
  .finish-btn { background: var(--green); color: #0a0e1a; }
  .finish-btn:hover { opacity: 0.9; }
  .finish-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Feed Panel */
  .feed-panel { display: flex; flex-direction: column; min-height: 0; }
  .feed-scroll { flex: 1; overflow-y: auto; padding-right: 4px; }
  .feed-updating { text-align: center; font-size: 11px; color: var(--accent2); padding: 8px; animation: feedPulse 1.5s infinite; display: none; }
  .feed-updating.visible { display: block; }
  @keyframes feedPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

  /* Invitation Cards */
  .inv-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px; margin-bottom: 10px; transition: all 0.4s ease; position: relative; overflow: hidden; }
  .inv-card.warm-high { border-color: rgba(245,158,11,0.4); box-shadow: 0 0 12px rgba(245,158,11,0.06); }
  .inv-card.warm-med { border-color: rgba(245,158,11,0.2); }
  .inv-card.warm-low { border-color: var(--border); opacity: 0.75; }
  .inv-card.accepted { border-color: var(--green); background: rgba(52,211,153,0.05); }
  .inv-card.declined { opacity: 0.4; transform: scale(0.97); pointer-events: none; }
  .inv-card.highlight { box-shadow: 0 0 16px rgba(99,102,241,0.15); border-color: var(--accent); }

  .inv-card .inv-type { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .inv-card .inv-meta { font-size: 11px; color: var(--text2); margin-bottom: 6px; }
  .inv-card .inv-who { font-size: 11px; color: var(--text); margin-bottom: 6px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .inv-person { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px 2px 2px; border-radius: 14px; background: var(--surface2); }
  .inv-person.known { background: rgba(52,211,153,0.1); }
  .inv-person .p-avatar { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
  .inv-person .p-name { font-size: 11px; }
  .inv-person.known .p-name { color: var(--green); font-weight: 600; }
  .inv-person.unknown .p-name { color: var(--text2); }
  .inv-card .inv-source { font-size: 10px; color: var(--text2); margin-bottom: 6px; font-style: italic; }
  .inv-card .inv-compat { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .inv-compat-bar { height: 3px; flex: 1; background: var(--border); border-radius: 2px; overflow: hidden; }
  .inv-compat-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
  .inv-compat-label { font-size: 10px; color: var(--text2); white-space: nowrap; }
  .inv-card .inv-privacy { font-size: 9px; color: var(--text2); opacity: 0.7; display: flex; align-items: center; gap: 3px; margin-bottom: 6px; }

  .inv-actions { display: flex; gap: 6px; }
  .inv-accept { padding: 6px 14px; border-radius: 6px; background: var(--green); color: #0a0e1a; font-size: 11px; font-weight: 600; border: none; cursor: pointer; }
  .inv-accept:hover { opacity: 0.9; }
  .inv-decline { padding: 6px 14px; border-radius: 6px; background: transparent; color: var(--text2); font-size: 11px; border: 1px solid var(--border); cursor: pointer; }
  .inv-decline:hover { border-color: var(--red); color: var(--red); }
  .inv-status { font-size: 11px; font-weight: 600; padding: 4px 0; }
  .inv-status.accepted-label { color: var(--green); }
  .inv-status.declined-label { color: var(--text2); }

  .decline-reasons { display: none; margin-top: 8px; }
  .decline-reasons.visible { display: flex; flex-wrap: wrap; gap: 4px; }
  .decline-reason { font-size: 10px; padding: 4px 8px; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; transition: all 0.2s; }
  .decline-reason:hover { border-color: var(--red); color: var(--red); }

  /* Upcoming section */
  .feed-section-label { font-size: 10px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 0; }
  .feed-section-label.available { color: var(--text2); }

  /* Encryption animation */
  @keyframes encryptFlash { 0% { opacity: 1; } 30% { opacity: 0.3; filter: blur(2px); } 60% { opacity: 0.6; } 100% { opacity: 1; filter: none; } }
  .encrypt-flash { animation: encryptFlash 0.5s ease; }
  .seal-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; color: var(--green); opacity: 0.7; margin-left: 6px; vertical-align: middle; }

  /* Graph panel — split into sessions + graph */
  .graph-panel { display: flex; flex-direction: column; min-height: 0; }
  .recent-sessions { flex-shrink: 0; max-height: 45%; overflow-y: auto; padding: 0 0 4px; }
  .recent-sessions .section-label { font-size: 10px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; padding: 0 2px 6px; display: flex; align-items: center; gap: 5px; }
  .session-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s; }
  .session-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .session-card.expanded { border-color: var(--accent); background: var(--surface2); }
  .session-card .sc-header { display: flex; justify-content: space-between; align-items: center; }
  .session-card .sc-type { font-size: 12px; font-weight: 600; }
  .session-card .sc-date { font-size: 10px; color: var(--text2); }
  .session-card .sc-players { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .session-card .sc-player { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px 2px 4px; border-radius: 12px; background: var(--surface2); font-size: 10px; cursor: pointer; transition: all 0.15s; }
  .session-card .sc-player:hover { background: rgba(99,102,241,0.15); color: var(--accent2); }
  .session-card .sc-player .sp-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .session-card .sc-player .sp-dot.known { background: var(--green); }
  .session-card .sc-player .sp-dot.unknown { background: var(--text2); }
  .session-card .sc-detail { margin-top: 6px; font-size: 10px; color: var(--text2); display: none; }
  .session-card.expanded .sc-detail { display: block; }
  .session-card .sc-detail .sc-ask { display: inline-block; margin-top: 4px; padding: 3px 8px; border-radius: 6px; background: var(--accent); color: white; font-size: 10px; cursor: pointer; border: none; }
  .session-card .sc-detail .sc-ask:hover { background: var(--accent2); }
  .archetype-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; padding: 2px 7px; border-radius: 10px; font-weight: 600; }
  .archetype-badge.social { background: rgba(52,211,153,0.12); color: var(--green); }
  .archetype-badge.balanced { background: rgba(99,102,241,0.12); color: var(--accent2); }
  .archetype-badge.competitive { background: rgba(248,113,113,0.12); color: var(--red); }

  .graph-wrap { flex: 1; min-height: 180px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); position: relative; overflow: hidden; }
  .graph-wrap canvas { display: block; width: 100%; height: 100%; }
  .graph-title { position: absolute; top: 8px; left: 10px; font-size: 10px; font-weight: 600; color: var(--text2); z-index: 2; pointer-events: none; }
  .graph-completion { position: absolute; top: 8px; right: 10px; font-size: 10px; color: var(--accent2); font-weight: 600; z-index: 2; pointer-events: none; }
  .node-detail { position: absolute; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-size: 11px; opacity: 0; transition: opacity 0.2s; z-index: 10; max-width: 180px; pointer-events: none; }
  .node-detail.visible { opacity: 1; pointer-events: auto; }
  .node-detail button { background: var(--accent); color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 10px; cursor: pointer; margin-top: 4px; display: block; }
  .node-detail button:hover { background: var(--accent2); }

  /* Roadmap button + panel */
  .roadmap-btn { position: fixed; bottom: 16px; right: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; color: var(--text2); font-size: 11px; cursor: pointer; z-index: 100; transition: all 0.2s; display: flex; align-items: center; gap: 5px; }
  .roadmap-btn:hover { border-color: var(--accent); color: var(--accent2); }
  .roadmap-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; }
  .roadmap-overlay.visible { display: flex; align-items: center; justify-content: center; }
  .roadmap-panel { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; padding: 24px 28px; position: relative; }
  .roadmap-panel h1 { font-size: 18px; margin-bottom: 14px; color: var(--text); }
  .roadmap-panel h2 { font-size: 14px; color: var(--accent2); margin: 16px 0 8px; }
  .roadmap-panel p { font-size: 12.5px; color: var(--text2); line-height: 1.65; margin-bottom: 10px; }
  .roadmap-panel .close-x { position: absolute; top: 12px; right: 16px; background: none; border: none; color: var(--text2); font-size: 18px; cursor: pointer; }
  .roadmap-panel .close-x:hover { color: var(--text); }
  .roadmap-panel .phase { padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; }
  .roadmap-panel .phase-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .roadmap-panel .phase-label.active-phase { color: var(--green); }
  .roadmap-panel .phase-label.future-phase { color: var(--text2); }

  /* Results */
  .results { display: none; margin-top: 16px; }
  .results.visible { display: block; }
  .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin-bottom: 10px; opacity: 0; transform: translateY(16px); transition: all 0.5s ease; }
  .result-card.revealed { opacity: 1; transform: translateY(0); }
  .result-card h3 { font-size: 13px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .result-card .narrative { font-size: 12px; color: var(--accent2); margin-bottom: 6px; font-style: italic; }
  .result-card .detail { font-size: 12px; color: var(--text2); margin: 3px 0; }
  .result-card .value { color: var(--text); font-family: monospace; font-size: 11px; }
  .result-card .success { color: var(--green); }
  .result-card .denied { color: var(--red); font-weight: 700; font-size: 15px; letter-spacing: 1px; }
  .group-member { display: flex; justify-content: space-between; padding: 6px 10px; background: var(--surface2); border-radius: 8px; margin: 3px 0; }

  .pipeline { margin-top: 12px; }
  .pipeline-step { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px; color: var(--text2); }
  .pipeline-step .icon { width: 16px; text-align: center; }
  .pipeline-step.done { color: var(--green); }
  .pipeline-step.active { color: var(--text); }

  .cta-footer { text-align: center; margin-top: 16px; padding: 12px; border-top: 1px solid var(--border); }
  .cta-footer a { color: var(--accent2); text-decoration: none; font-size: 12px; }
  .cta-footer a:hover { text-decoration: underline; }

  /* Settings Panel */
  .settings-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: none; align-items: center; justify-content: center; }
  .settings-overlay.visible { display: flex; }
  .settings-panel { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; width: 380px; max-height: 80vh; overflow-y: auto; padding: 20px 24px; position: relative; }
  .settings-panel h2 { font-size: 15px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .settings-section { margin-bottom: 16px; }
  .settings-section .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text2); margin-bottom: 8px; }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
  .settings-row .row-label { display: flex; align-items: center; gap: 6px; }
  .settings-row .row-icon { font-size: 14px; }
  .settings-toggle { width: 36px; height: 20px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); position: relative; cursor: pointer; transition: all 0.2s; }
  .settings-toggle.on { background: var(--green); border-color: var(--green); }
  .settings-toggle::after { content: ''; position: absolute; width: 14px; height: 14px; border-radius: 50%; background: white; top: 2px; left: 2px; transition: all 0.2s; }
  .settings-toggle.on::after { left: 18px; }
  .settings-btn { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--surface2); color: var(--text); transition: all 0.2s; }
  .settings-btn:hover { border-color: var(--accent); }
  .settings-btn.linked { background: rgba(52,211,153,0.12); border-color: var(--green); color: var(--green); }
  .settings-select { padding: 4px 8px; border-radius: 6px; font-size: 11px; background: var(--surface2); border: 1px solid var(--border); color: var(--text); }
  .settings-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .settings-chip { padding: 4px 10px; border-radius: 12px; font-size: 10px; border: 1px solid var(--border); background: var(--surface2); color: var(--text2); cursor: pointer; transition: all 0.2s; }
  .settings-chip.active { border-color: var(--accent); color: var(--accent); background: rgba(99,102,241,0.1); }
  .gear-btn { font-size: 14px; padding: 3px 6px; border-radius: 6px; background: var(--surface2); border: 1px solid var(--border); color: var(--text2); cursor: pointer; transition: all 0.2s; line-height: 1; }
  .gear-btn:hover { border-color: var(--accent); color: var(--text); transform: rotate(30deg); }

  .error-banner { background: #7f1d1d; border: 1px solid var(--red); border-radius: 8px; padding: 8px 12px; font-size: 12px; margin-bottom: 10px; display: none; cursor: pointer; }
  .error-banner.visible { display: block; animation: msgIn 0.3s ease; }

  /* Data Comparison Panel */
  .data-compare { display: flex; gap: 24px; max-width: 920px; margin: 0 auto 22px; align-items: stretch; }
  .data-compare .compare-arrow { display: flex; align-items: center; justify-content: center; font-size: 36px; color: var(--text2); padding: 0 8px; }
  .data-card { flex: 1; border-radius: var(--radius); padding: 26px 30px; position: relative; }
  .data-card.old-world { background: #1a1a1a; border: 1px solid #333; }
  .data-card.new-world { background: var(--surface); border: 1px solid rgba(52,211,153,0.3); box-shadow: 0 0 20px rgba(52,211,153,0.06); }
  .data-card .card-label { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
  .data-card.old-world .card-label { color: #8a8a8a; }
  .data-card.new-world .card-label { color: var(--green); }
  .data-card .player-line { font-size: 17px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
  .data-card.old-world .rating-num { font-size: 48px; font-weight: 700; color: #7a7a7a; text-align: center; padding: 14px 0 10px; font-family: monospace; }
  .data-card.old-world .rating-stars { text-align: center; font-size: 28px; color: #7a7a7a; margin-bottom: 12px; }
  .data-card.old-world .empty-line { height: 12px; background: #2a2a2a; border-radius: 4px; margin: 10px 0; opacity: 0.6; }
  .data-card.old-world .thats-it { text-align: center; font-size: 15px; color: #8a8a8a; margin-top: 16px; font-style: italic; }
  .data-card.new-world .signal-row { display: flex; align-items: center; gap: 12px; padding: 7px 0; font-size: 16px; }
  .data-card.new-world .signal-icon { font-size: 20px; width: 26px; text-align: center; flex-shrink: 0; }
  .data-card.new-world .signal-text { color: var(--text2); }
  .data-card.new-world .signal-text strong { color: var(--text); font-weight: 600; }
  .data-card.new-world .signal-text .green { color: var(--green); }
  .data-card.new-world .signal-text .red { color: var(--red); }
  .data-card.new-world .signal-text .warm { color: var(--warm); }
  .compare-footer { text-align: center; font-size: 15px; color: var(--accent2); margin-bottom: 16px; font-weight: 500; }

  @media (max-width: 1100px) {
    .app-layout.visible { grid-template-columns: 1fr 1fr; }
    .graph-panel { display: none; }
  }
  @media (max-width: 750px) {
    .app-layout.visible { grid-template-columns: 1fr; height: auto; }
    .feed-panel { max-height: 50vh; }
    .container { padding: 10px; }
    .input-row { flex-wrap: wrap; }
    .finish-btn { width: 100%; margin-top: 4px; }
    .data-compare { flex-direction: column; gap: 12px; }
    .data-compare .compare-arrow { font-size: 24px; padding: 4px 0; }
    .data-card { padding: 18px 20px; }
    .badges { gap: 6px; }
    .badge { font-size: 12px; padding: 4px 10px; }
    .start-btn { padding: 14px; font-size: 15px; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="hero-canvas-wrap" id="hero-canvas-wrap"><canvas id="hero-canvas"></canvas></div>
    <p class="tagline" style="font-size:20px;font-weight:700;line-height:1.4;margin-bottom:4px;">How do you <em>really</em> feel about the people you play with?</p>
    <p class="sub" style="font-size:14px;color:var(--text2);margin-top:0;">Your private AI agent learns your preferences, negotiates perfect matches, and never shares a word.</p>
    <div class="badges">
      <span class="badge sui" id="badge-sui">Sui Testnet</span>
      <span class="badge messaging" id="messaging-badge" style="display:none">Sui Messaging SDK</span>
      <span class="badge claude" id="badge-ai">AI Agent</span>
      <span class="badge seal" id="badge-seal">Seal Encryption</span>
      <span class="badge" id="badge-memwal">MemWal</span>
    </div>
  </div>

  <!-- Wallet Identity Bar -->
  <div class="wallet-bar" id="wallet-bar">
    <span class="wallet-icon">\u{1F512}</span>
    <span class="wallet-label">Your Sui wallet:</span>
    <span class="wallet-addr" id="wallet-addr">0x319a...087d</span>
    <a id="wallet-explorer-link" href="#" target="_blank" style="font-size:10px;color:var(--accent);text-decoration:none;margin-left:4px;display:none">\u2197 Explorer</a>
    <span class="wallet-status"><span class="dot"></span> Your wallet. Your key. Your data.</span>
  </div>

  <div id="error-banner" class="error-banner" onclick="this.classList.remove('visible')"></div>

  <!-- Product Toggle -->
  <div class="product-toggle" id="product-toggle">
    <button class="product-opt" id="product-tool" onclick="setProduct('tool')">Come for the tool</button>
    <button class="product-opt active" id="product-network" onclick="setProduct('network')">Stay for the network</button>
  </div>

  <!-- TOOL SECTION: Diary + Academy -->
  <div id="tool-section" class="tool-section" style="display:none;">
    <div class="mode-toggle" id="tool-mode-toggle">
      <button class="mode-opt active" id="tool-mode-chat" onclick="setToolMode('chat')">Chat</button>
      <button class="mode-opt" id="tool-mode-gui" onclick="setToolMode('gui')">GUI</button>
    </div>
    <div id="tool-chat-content">
      <div class="diary-topics">
        <div class="diary-topic-card" onclick="startDiaryTopic('improve')">
          <div class="topic-icon">\u{1F4C8}</div>
          <div class="topic-info">
            <h3>My Game Improvement</h3>
            <p>Track what you\u2019re working on, get personalized tips, and see how far you\u2019ve come</p>
          </div>
        </div>
        <div class="diary-topic-card" onclick="startDiaryTopic('academy')">
          <div class="topic-icon">\u{1F393}</div>
          <div class="topic-info">
            <h3>Four Levels Academy</h3>
            <p>A structured path from beginner to advanced \u2014 four levels, each with specific skills to master</p>
          </div>
        </div>
      </div>
    </div>
    <div id="tool-gui-content" style="display:none;">
      <div class="module-cards">
        <div class="module-card">
          <span class="module-badge live">Playable</span>
          <h3>\u{1F3BE} Anticipating Out Balls</h3>
          <p>3D training game \u2014 learn to read the ball and make smarter decisions at the baseline</p>
          <button class="module-play-btn" onclick="window.open('outballs.html','_blank')">Play Now</button>
        </div>
        <div class="module-card">
          <span class="module-badge live">Playable</span>
          <h3>\u{1F3D3} Four Levels Curriculum</h3>
          <p>See the full academy progression \u2014 from first rally to tournament-ready</p>
          <button class="module-play-btn" onclick="window.open('four-levels.html','_blank')">Explore</button>
        </div>
      </div>
    </div>
  </div>

  <!-- NETWORK SECTION: Comparison Cards (existing) -->
  <div id="network-section">
    <div id="data-compare-section">
      <div class="data-compare">
        <div class="data-card old-world">
          <div class="card-label">Competitive Skill Rating</div>
          <div class="rating-num">3.5</div>
          <div class="rating-stars">\u2B50\u2B50\u2B50\u2BEA</div>
          <div class="empty-line"></div>
          <div class="empty-line" style="width:60%"></div>
          <div class="thats-it">Everyone in your club, reduced to one number.</div>
        </div>
        <div class="compare-arrow" style="flex-direction:column;gap:6px;text-align:center">\u2192<span style="font-size:14px;font-weight:600;color:var(--accent2)">What if you could?</span></div>
        <div class="data-card new-world">
          <div class="card-label">Give 'n Take Graph</div>
          <div class="new-world-canvas"><canvas id="compare-canvas" aria-label="Interactive social graph showing your connections to other players"></canvas></div>
          <div class="signal-row"><span class="signal-icon" style="font-size:0"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#34d399;color:#0a0e1a;font-size:10px;font-weight:700">SM</span></span><span class="signal-text"><strong class="green">Sarah M.</strong> \u2014 go-to partner \u00B7 always brings energy</span></div>
          <div class="signal-row"><span class="signal-icon" style="font-size:0"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#f59e0b;color:#0a0e1a;font-size:10px;font-weight:700">TK</span></span><span class="signal-text"><strong class="warm">Tom K.</strong> \u2014 most fun in the club \u00B7 pushes your game</span></div>
          <div class="signal-row"><span class="signal-icon" style="font-size:0"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#f87171;color:#0a0e1a;font-size:10px;font-weight:700">MD</span></span><span class="signal-text"><strong class="red">Mike D.</strong> \u2014 avoid \u00B7 reason stays private</span></div>
          <div class="signal-row"><span class="signal-icon">\u{1F512}</span><span class="signal-text">Your private diary. Nobody sees it but you.</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Start Section -->
  <div id="persona-section" class="persona-section">
    <div class="mode-toggle" id="mode-toggle">
      <button class="mode-opt" id="mode-chat" onclick="setMode('chat')">Chat</button>
      <button class="mode-opt active" id="mode-gui" onclick="setMode('gui')">GUI</button>
    </div>
    <div class="mode-hint" id="mode-hint"></div>
    <button class="start-btn" id="start-btn" onclick="startConversation()" aria-label="Start a private conversation with your AI agent">\u{1F512} Login to your Give Diary</button>

    <div class="persona-list" id="persona-list" style="display:none"></div>
  </div>

  <!-- Chat-Only Layout -->
  <div class="chat-only-layout" id="chat-only-layout">
    <div class="player-info" id="player-info-solo" style="margin-bottom:6px">
      <div>
        <div class="name" id="player-name-solo"></div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button onclick="setMode('gui');switchToGui()" style="font-size:9px;padding:3px 8px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);color:var(--text2);cursor:pointer;" title="Switch to dashboard view">\u{1F4CA} Dashboard</button>
      </div>
    </div>
    <div class="privacy-bar"><span class="lock">\u{1F512}</span> End-to-end encrypted \u00B7 Sui Messaging SDK \u00B7 Only you and your agent</div>
    <div class="messages" id="messages-solo"></div>
    <div class="input-row">
      <input type="text" class="chat-input" id="chat-input-solo" placeholder="Type your message..."
        onkeydown="if(event.key==='Enter'&&!sending)sendMessage()">
      <button class="send-btn" onclick="sendMessage()">Send</button>
      <button class="finish-btn" id="finish-btn-solo" onclick="finishConversation()" disabled>Done</button>
    </div>
  </div>

  <!-- Three-Panel Layout: Chat + Feed + Graph -->
  <div class="app-layout" id="app-layout">
    <!-- Panel 1: Chat -->
    <div class="chat-panel">
      <div class="panel-header"><span class="panel-icon">\u{1F4AC}</span> Private Chat</div>
      <div class="player-info" id="player-info">
        <div>
          <div class="name" id="player-name"></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="gear-btn" onclick="openSettings()" title="Settings">\u2699</button>
          <button onclick="switchToChat()" style="font-size:9px;padding:3px 8px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);color:var(--text2);cursor:pointer;" title="Switch to chat-only view">\u{1F4AC} Chat</button>
        </div>
      </div>
      <div class="messages" id="messages"></div>
      <div class="input-row">
        <input type="text" class="chat-input" id="chat-input" placeholder="Type your message..."
          onkeydown="if(event.key==='Enter'&&!sending)sendMessage()">
        <button class="send-btn" onclick="sendMessage()">Send</button>
        <button class="finish-btn" id="finish-btn" onclick="finishConversation()" disabled>Done</button>
      </div>
    </div>

    <!-- Panel 2: Invitation Feed -->
    <div class="feed-panel">
      <div class="panel-header"><span class="panel-icon">\u{1F4E8}</span> Your Invitations</div>
      <div class="feed-updating" id="feed-updating">Updating your feed based on preferences...</div>
      <div class="feed-scroll" id="feed-scroll"></div>
    </div>

    <!-- Panel 3: Sessions + Community Graph -->
    <div class="graph-panel" id="graph-panel">
      <div class="recent-sessions" id="recent-sessions">
        <div class="section-label"><span>\u{1F4C5}</span> Recent Sessions</div>
        <div id="session-list"></div>
      </div>
      <div class="graph-wrap" id="graph-wrap">
        <div class="graph-title">Your Community Graph</div>
        <canvas id="graph-canvas" aria-label="Your community graph showing player connections and relationship strength"></canvas>
        <div class="graph-completion" id="graph-completion"></div>
        <div class="node-detail" id="node-detail"></div>
      </div>
    </div>
  </div>

  <!-- Settings Overlay -->
  <div class="settings-overlay" id="settings-overlay" onclick="if(event.target===this)closeSettings()">
    <div class="settings-panel">
      <button class="close-x" onclick="closeSettings()" style="position:absolute;top:10px;right:14px;background:none;border:none;color:var(--text2);font-size:16px;cursor:pointer">\u2715</button>
      <h2>\u2699 Settings</h2>

      <div class="settings-section">
        <div class="section-title">Integrations</div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F4C5}</span> Google Calendar</div>
          <button class="settings-btn" id="gcal-btn" onclick="toggleGcal()">Link</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">\u{1F512} Agent Matching Permissions</div>
        <div style="font-size:11px;color:var(--text2);padding:0 0 8px;">Your agent only matches you where you authorize it. Toggle off to revoke access.</div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F3D3}</span> NEPC Rye</div>
          <div class="settings-toggle on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F3D3}</span> NEPC Middleton</div>
          <div class="settings-toggle" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">\u{1F310} Community Intelligence</div>
        <div style="font-size:11px;color:var(--text2);padding:0 0 8px;">Should your agent help improve matches for the whole community, or only for you?</div>
        <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:6px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px"><input type="radio" name="community" checked style="accent-color:var(--accent)"> <strong>\u{1F512} Private only</strong> \u2014 my agent matches only for me. No data leaves my agent.</label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px"><input type="radio" name="community" style="accent-color:var(--green)"> <strong>\u{1F91D} Community contributor</strong> \u2014 my agent shares anonymized patterns to improve matches for everyone. Your preferences, avoids, and reasons are never shared.</label>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">Notifications</div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F4F1}</span> SMS</div>
          <div class="settings-toggle on" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F4E7}</span> Email</div>
          <div class="settings-toggle" onclick="this.classList.toggle('on')"></div>
        </div>
        <div class="settings-row">
          <div class="row-label"><span class="row-icon">\u{1F514}</span> Match found alerts</div>
          <div class="settings-toggle on" onclick="this.classList.toggle('on')"></div>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">What your club coordinator sees</div>
        <div style="font-size:11px;color:var(--text2);padding:0 0 8px;">Your agent uses everything you share to find better matches. But you decide how much the coordinator sees.</div>
        <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:6px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px"><input type="radio" name="privacy" style="accent-color:var(--accent)"> <strong>Minimal</strong> \u2014 only that you're available</label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px"><input type="radio" name="privacy" checked style="accent-color:var(--accent)"> <strong>Standard</strong> \u2014 who you like playing with, not who you avoid or why</label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px"><input type="radio" name="privacy" style="accent-color:var(--accent)"> <strong>Open</strong> \u2014 full profile (still never shows your reasons)</label>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">Agent Personality</div>
        <div class="settings-chips" id="tone-chips">
          <span class="settings-chip" onclick="toggleChipGroup(this,'tone-chips')">Casual</span>
          <span class="settings-chip active" onclick="toggleChipGroup(this,'tone-chips')">Balanced</span>
          <span class="settings-chip" onclick="toggleChipGroup(this,'tone-chips')">Direct</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="section-title">Availability</div>
        <div style="font-size:10px;color:var(--text2);padding:0 0 6px;">Fallback if Google Calendar isn't linked</div>
        <div class="settings-chips" id="day-chips">
          <span class="settings-chip" onclick="toggleChip(this)">Mon</span>
          <span class="settings-chip active" onclick="toggleChip(this)">Tue</span>
          <span class="settings-chip" onclick="toggleChip(this)">Wed</span>
          <span class="settings-chip active" onclick="toggleChip(this)">Thu</span>
          <span class="settings-chip" onclick="toggleChip(this)">Fri</span>
          <span class="settings-chip active" onclick="toggleChip(this)">Sat</span>
          <span class="settings-chip" onclick="toggleChip(this)">Sun</span>
        </div>
        <div class="settings-chips" style="margin-top:6px" id="time-chips">
          <span class="settings-chip active" onclick="toggleChip(this)">Morning</span>
          <span class="settings-chip active" onclick="toggleChip(this)">Afternoon</span>
          <span class="settings-chip" onclick="toggleChip(this)">Evening</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Results -->
  <div class="results" id="results"></div>
</div>


<script>
var state = { personaIndex: 1, sessionId: null, questionsAsked: 0, playerName: '', connections: [], location: '', mode: 'gui', messaging: null, archetype: 'balanced', graphUpdates: null, productMode: 'network' };
var sending = false;
var avatarColors = ['#6366f1','#ec4899','#f59e0b','#10b981','#8b5cf6','#f97316','#06b6d4'];

/* ============ PRODUCT TOGGLE ============ */
function setProduct(p) {
  state.productMode = p;
  document.getElementById('product-tool').className = 'product-opt' + (p === 'tool' ? ' active' : '');
  document.getElementById('product-network').className = 'product-opt' + (p === 'network' ? ' active' : '');
  document.getElementById('tool-section').style.display = p === 'tool' ? '' : 'none';
  document.getElementById('network-section').style.display = p === 'network' ? '' : 'none';
  document.getElementById('mode-toggle').style.display = p === 'network' ? '' : 'none';
  /* Swap hero text */
  var tagline = document.querySelector('.header .tagline');
  var sub = document.querySelector('.header .sub');
  var badges = document.querySelector('.badges');
  var startBtn = document.getElementById('start-btn');
  if (p === 'tool') {
    tagline.innerHTML = 'Your private pickleball diary \\u2014 powered by AI.';
    sub.innerHTML = 'Talk to your diary about players, get advice on improving, and train with interactive academy modules.';
    badges.style.display = 'none';
    startBtn.innerHTML = '\\u{1F512} Login to your Give Diary';
  } else {
    tagline.innerHTML = 'How do you <em>really</em> feel about the people you play with?';
    sub.innerHTML = 'Your private AI agent learns your preferences, negotiates perfect matches, and never shares a word.';
    badges.style.display = '';
    startBtn.innerHTML = '\\u{1F512} Login to your Give Diary';
  }
}
function setToolMode(m) {
  document.getElementById('tool-mode-chat').className = 'mode-opt' + (m === 'chat' ? ' active' : '');
  document.getElementById('tool-mode-gui').className = 'mode-opt' + (m === 'gui' ? ' active' : '');
  document.getElementById('tool-chat-content').style.display = m === 'chat' ? '' : 'none';
  document.getElementById('tool-gui-content').style.display = m === 'gui' ? '' : 'none';
}
function startDiaryTopic(topic) {
  state.diaryTopic = topic;
  state.mode = 'chat';
  startConversation();
}

/* ============ DIARY TOPIC CONVERSATION ============ */
var diaryTopicGreetings = {
  community: "Hey! Let's talk about the people in your community. Think of someone you play with regularly \\u2014 who comes to mind first? Tell me their name and what it's like playing with them.",
  improve: "Let's check in on your game. What's one thing you've been working on lately? It could be a specific shot, your positioning, consistency \\u2014 whatever's on your mind.",
  academy: "Welcome to Four Levels Academy \\u2014 a structured path from beginner to advanced. There are four levels, each with specific skills to master.\\n\\n\\u{1F7E2} **Level 1 \\u2014 First Rally:** Learn the basics \\u2014 scoring, serving, the kitchen rule, and keeping the ball in play.\\n\\u{1F7E1} **Level 2 \\u2014 Court Awareness:** Positioning, shot selection, and reading your opponent.\\n\\u{1F7E2} **Level 3 \\u2014 Competitive Play:** Strategy, stacking, resets, and pressure management.\\n\\u{1F535} **Level 4 \\u2014 Tournament Ready:** Advanced patterns, mental game, and match preparation.\\n\\nWhich level are you curious about? Or tell me where you are in your game and I'll suggest where to start."
};

/* ============ MODE TOGGLE ============ */
function setMode(m) {
  state.mode = m;
  document.getElementById('mode-chat').className = 'mode-opt' + (m === 'chat' ? ' active' : '');
  document.getElementById('mode-gui').className = 'mode-opt' + (m === 'gui' ? ' active' : '');
}

function activeMessages() {
  return document.getElementById(state.mode === 'chat' ? 'messages-solo' : 'messages');
}
function activeInput() {
  return document.getElementById(state.mode === 'chat' ? 'chat-input-solo' : 'chat-input');
}
function activeFinishBtn() {
  return document.getElementById(state.mode === 'chat' ? 'finish-btn-solo' : 'finish-btn');
}

function switchToChat() {
  state.mode = 'chat';
  // Copy messages from main to solo
  var main = document.getElementById('messages');
  var solo = document.getElementById('messages-solo');
  solo.innerHTML = main.innerHTML;
  // Hide three-panel, show chat-only
  document.getElementById('app-layout').classList.remove('visible');
  document.getElementById('chat-only-layout').classList.add('visible');
  // Sync player info
  document.getElementById('player-name-solo').textContent = document.getElementById('player-name').textContent;
  // Enable finish button if needed
  if (state.questionsAsked >= 3) document.getElementById('finish-btn-solo').disabled = false;
  activeInput().focus();
}

function switchToGui() {
  state.mode = 'gui';
  // Copy messages from solo to main
  var solo = document.getElementById('messages-solo');
  var main = document.getElementById('messages');
  main.innerHTML = solo.innerHTML;
  // Hide chat-only, show three-panel
  document.getElementById('chat-only-layout').classList.remove('visible');
  document.getElementById('app-layout').classList.add('visible');
  // Sync player info
  document.getElementById('player-name').textContent = document.getElementById('player-name-solo').textContent;
  // Enable finish button if needed
  if (state.questionsAsked >= 3) document.getElementById('finish-btn').disabled = false;
  // Show wallet bar
  document.getElementById('wallet-bar').classList.add('visible');
  if (state.messaging && state.messaging.agentAddress) {
    var addr = state.messaging.agentAddress;
    var explorerUrl = 'https://suiscan.xyz/testnet/account/' + addr;
    var addrEl = document.getElementById('wallet-addr');
    addrEl.textContent = addr.slice(0, 8) + '...' + addr.slice(-4);
    addrEl.style.cursor = 'pointer';
    addrEl.title = 'View on Sui Explorer';
    addrEl.onclick = function() { window.open(explorerUrl, '_blank'); };
    var expLink = document.getElementById('wallet-explorer-link');
    expLink.href = explorerUrl;
    expLink.style.display = '';
  }
  // Init graph
  setTimeout(function() {
    graph.resize();
    graph.init(document.getElementById('graph-canvas'), state.playerName, state.connections);
    if (state.graphUpdates) graph.processUpdates(state.graphUpdates);
  }, 80);
  activeInput().focus();
}

/* ============ INVITATION FEED ENGINE ============ */
var feed = {
  invitations: [],
  preferences: { likedNames: [], dislikedNames: [], preferredTimes: [], preferredSize: null },

  generate: function(playerName, connections, location) {
    var invs = [];
    var connNames = connections.map(function(c) { return c.playerName; });
    var days = ['Mon, Apr 7','Tue, Apr 8','Wed, Apr 9','Thu, Apr 10','Fri, Apr 11','Sat, Apr 12'];
    var times = ['8:00 AM','9:00 AM','10:00 AM','6:00 PM','7:00 PM'];
    var types = ['Morning Doubles','Evening Open Play','Mixed Doubles','Competitive Doubles','Social Play'];

    // 2 HIGH compatibility — small groups with strong connections
    for (var h = 0; h < 2; h++) {
      var confirmed = [];
      var usedIdx = [];
      var numConfirmed = 2;
      for (var c = 0; c < numConfirmed && c < connNames.length; c++) {
        var idx;
        do { idx = Math.floor(Math.random() * connNames.length); } while (usedIdx.indexOf(idx) >= 0);
        usedIdx.push(idx);
        confirmed.push(connNames[idx]);
      }
      invs.push({
        id: 'inv-h' + h,
        eventType: types[h % types.length],
        date: days[h],
        time: times[h],
        location: location,
        confirmed: confirmed,
        totalSpots: 4,
        invitedBy: confirmed[0],
        compatibility: 0.85 + Math.random() * 0.12,
        status: 'pending',
        reason: null
      });
    }

    // 1 MEDIUM compatibility — some known, some unknown
    var unknowns = ['Pat R.','Chris H.','Sam B.','Lynn K.','Dana F.'];
    var mixConfirmed = [];
    if (connNames.length > 0) mixConfirmed.push(connNames[Math.floor(Math.random() * connNames.length)]);
    mixConfirmed.push(unknowns[Math.floor(Math.random() * unknowns.length)]);
    invs.push({
      id: 'inv-m0',
      eventType: 'Social Play',
      date: days[3],
      time: times[2],
      location: location,
      confirmed: mixConfirmed,
      totalSpots: 6,
      invitedBy: 'AI-matched',
      compatibility: 0.55 + Math.random() * 0.15,
      status: 'pending',
      reason: null
    });

    // 1 LOW compatibility — spray-and-pray large group
    var bigGroup = [];
    for (var b = 0; b < 5; b++) {
      bigGroup.push(unknowns[b % unknowns.length]);
    }
    invs.push({
      id: 'inv-l0',
      eventType: 'All-Levels Open Play',
      date: days[4],
      time: times[3],
      location: location === 'Rye' ? 'Middleton' : 'Rye',
      confirmed: bigGroup,
      totalSpots: 14,
      invitedBy: 'Club blast',
      compatibility: 0.2 + Math.random() * 0.15,
      status: 'pending',
      reason: null
    });

    // Pre-accept the top 1-2 invitations (high compatibility) so GUI mode shows upcoming sessions
    var preAccepted = 0;
    invs.sort(function(a, b) { return b.compatibility - a.compatibility; });
    invs.forEach(function(inv) {
      if (preAccepted < 1 && inv.compatibility > 0.8) {
        inv.status = 'accepted';
        preAccepted++;
      }
    });

    // Sort: accepted first, then pending by compatibility
    var accepted = invs.filter(function(i) { return i.status === 'accepted'; });
    var pending = invs.filter(function(i) { return i.status === 'pending'; });
    pending.sort(function(a, b) { return b.compatibility - a.compatibility; });
    this.invitations = accepted.concat(pending);
    this.preferences = { likedNames: [], dislikedNames: [], preferredTimes: [], preferredSize: null };
  },

  render: function() {
    var el = document.getElementById('feed-scroll');
    var accepted = this.invitations.filter(function(i) { return i.status === 'accepted'; });
    var pending = this.invitations.filter(function(i) { return i.status === 'pending'; });
    var declined = this.invitations.filter(function(i) { return i.status === 'declined'; });
    var html = '';

    if (accepted.length > 0) {
      html += '<div class="feed-section-label">\u2713 Upcoming (' + accepted.length + ')</div>';
      accepted.forEach(function(inv) { html += feed.renderCard(inv); });
    }

    if (pending.length > 0) {
      html += '<div class="feed-section-label available">Available invitations</div>';
      pending.forEach(function(inv) { html += feed.renderCard(inv); });
    }

    if (declined.length > 0) {
      declined.forEach(function(inv) { html += feed.renderCard(inv); });
    }

    el.innerHTML = html;
  },

  renderCard: function(inv) {
    var warmClass = inv.status === 'accepted' ? 'accepted' : inv.status === 'declined' ? 'declined' :
      inv.compatibility > 0.8 ? 'warm-high' : inv.compatibility > 0.5 ? 'warm-med' : 'warm-low';
    var connNames = state.connections.map(function(c) { return c.playerName; });

    var smileys = ['\u{1F60A}','\u{1F604}','\u{1F60E}','\u{1F917}','\u{1F609}','\u{1F60D}','\u{1F929}','\u{1F973}'];
    var confirmedHtml = inv.confirmed.map(function(name, ni) {
      var isKnown = connNames.indexOf(name) >= 0;
      var smiley = smileys[ni % smileys.length];
      return '<span class="inv-person ' + (isKnown ? 'known' : 'unknown') + '" style="cursor:pointer" data-pname="' + escapeHtml(name) + '" onclick="event.stopPropagation();playerClicked(this.dataset.pname)">'
        + '<span class="p-avatar">' + smiley + '</span>'
        + '<span class="p-name">' + escapeHtml(name) + '</span></span>';
    }).join('');

    var spotsLeft = inv.totalSpots - inv.confirmed.length - (inv.status === 'accepted' ? 1 : 0);
    if (spotsLeft < 0) spotsLeft = 0;
    var spotText = spotsLeft <= 1 ? "You'd complete the group!" : spotsLeft + ' spots left';
    if (inv.totalSpots > 8) spotText = inv.confirmed.length + ' of ' + inv.totalSpots + ' confirmed';

    var compatPct = Math.round(inv.compatibility * 100);
    var compatColor = inv.compatibility > 0.8 ? 'var(--warm)' : inv.compatibility > 0.5 ? 'var(--accent2)' : 'var(--text2)';
    var compatLabel = inv.compatibility > 0.8 ? 'Great fit' : inv.compatibility > 0.5 ? 'Good fit' : 'General invite';

    var h = '<div class="inv-card ' + warmClass + '" id="card-' + inv.id + '">';
    h += '<div class="inv-type">' + escapeHtml(inv.eventType) + '</div>';
    h += '<div class="inv-meta">' + escapeHtml(inv.date) + ' \u00B7 ' + escapeHtml(inv.time) + ' \u00B7 ' + escapeHtml(inv.location) + '</div>';
    h += '<div class="inv-who">' + confirmedHtml + '</div>';
    h += '<div class="inv-meta">' + spotText + '</div>';
    h += '<div class="inv-source">' + (inv.invitedBy === 'AI-matched' ? '\u{2728} AI-matched for you' : inv.invitedBy === 'Club blast' ? '\u{1F4E2} Club-wide invite' : 'Invited by ' + escapeHtml(inv.invitedBy)) + '</div>';
    h += '<div class="inv-compat"><div class="inv-compat-bar"><div class="inv-compat-fill" style="width:' + compatPct + '%;background:' + compatColor + '"></div></div><div class="inv-compat-label">' + compatLabel + '</div></div>';
    h += '<div class="inv-privacy">\u{1F6E1}\uFE0F Ranking based on your private preferences</div>';

    if (inv.status === 'pending') {
      h += '<div class="inv-actions">';
      h += '<button class="inv-accept" data-id="' + inv.id + '" onclick="feedAccept(this.dataset.id)">Accept</button>';
      h += '<button class="inv-decline" data-id="' + inv.id + '" onclick="feedDecline(this.dataset.id)">Decline</button>';
      h += '</div>';
      h += '<div class="decline-reasons" id="reasons-' + inv.id + '">';
      h += '<span class="decline-reason" data-id="' + inv.id + '" data-reason="time" onclick="feedDeclineReason(this.dataset.id,this.dataset.reason)">Can\\u0027t make this time</span>';
      h += '<span class="decline-reason" data-id="' + inv.id + '" data-reason="group" onclick="feedDeclineReason(this.dataset.id,this.dataset.reason)">Not the right group</span>';
      h += '<span class="decline-reason" data-id="' + inv.id + '" data-reason="already" onclick="feedDeclineReason(this.dataset.id,this.dataset.reason)">Already playing</span>';
      h += '<span class="decline-reason" data-id="' + inv.id + '" data-reason="skip" onclick="feedDeclineReason(this.dataset.id,this.dataset.reason)">Skip</span>';
      h += '</div>';
    } else if (inv.status === 'accepted') {
      h += '<div class="inv-status accepted-label">\u2713 Accepted</div>';
    } else {
      h += '<div class="inv-status declined-label">Declined' + (inv.reason ? ' \u2014 ' + escapeHtml(inv.reason) : '') + '</div>';
    }

    h += '</div>';
    return h;
  },

  resort: function() {
    var self = this;
    this.invitations.forEach(function(inv) {
      if (inv.status !== 'pending') return;
      var boost = 0;
      // Boost invitations with liked people
      self.preferences.likedNames.forEach(function(name) {
        if (inv.confirmed.indexOf(name) >= 0) boost += 0.15;
      });
      // Penalize invitations with disliked people
      self.preferences.dislikedNames.forEach(function(name) {
        if (inv.confirmed.indexOf(name) >= 0) boost -= 0.25;
      });
      inv.compatibility = Math.max(0.05, Math.min(0.99, inv.compatibility + boost));
    });
    var pending = this.invitations.filter(function(i) { return i.status === 'pending'; });
    pending.sort(function(a, b) { return b.compatibility - a.compatibility; });
    var accepted = this.invitations.filter(function(i) { return i.status === 'accepted'; });
    var declined = this.invitations.filter(function(i) { return i.status === 'declined'; });
    this.invitations = accepted.concat(pending).concat(declined);
  },

  getById: function(id) {
    for (var i = 0; i < this.invitations.length; i++) {
      if (this.invitations[i].id === id) return this.invitations[i];
    }
    return null;
  },

  highlightByPlayer: function(playerName) {
    // Briefly highlight cards containing this player
    this.invitations.forEach(function(inv) {
      var card = document.getElementById('card-' + inv.id);
      if (!card) return;
      if (inv.confirmed.indexOf(playerName) >= 0) {
        card.classList.add('highlight');
        setTimeout(function() { card.classList.remove('highlight'); }, 2000);
      }
    });
  }
};

/* ============ CROSS-PANEL: Feed Accept ============ */
function feedAccept(invId) {
  var inv = feed.getById(invId);
  if (!inv) return;
  inv.status = 'accepted';
  feed.resort();
  feed.render();

  // Encrypt animation
  var card = document.getElementById('card-' + invId);
  if (card) card.classList.add('encrypt-flash');

  // Feed -> Graph: strengthen edges to confirmed players
  var connNames = state.connections.map(function(c) { return c.playerName; });
  inv.confirmed.forEach(function(name) {
    var idx = connNames.indexOf(name);
    if (idx >= 0) {
      graph.processUpdates([
        { action: 'reveal', nodeIndex: idx },
        { action: 'highlight', nodeIndex: idx, color: '#34d399' }
      ]);
    }
  });

  // Feed -> Chat: agent acknowledges naturally
  var knownInGroup = inv.confirmed.filter(function(n) { return connNames.indexOf(n) >= 0; });
  var agentMsg = '';
  if (knownInGroup.length > 0) {
    agentMsg = 'Nice \u2014 that ' + inv.eventType + ' with ' + knownInGroup.join(' and ') + ' looks like a great fit for you. You always seem to have strong sessions with them.';
  } else {
    agentMsg = 'That ' + inv.eventType + ' on ' + inv.date + ' is booked! Could be a good chance to meet some new people.';
  }
  addMessage(agentMsg, 'feed-event');
}

/* ============ CROSS-PANEL: Feed Decline ============ */
function feedDecline(invId) {
  var reasonsEl = document.getElementById('reasons-' + invId);
  if (reasonsEl) reasonsEl.classList.add('visible');
  // Prompt in chat for freeform feedback
  var inv = feed.getById(invId);
  var label = inv ? inv.categoryName || 'this session' : 'this session';
  addMessage("You're declining " + label + ". Want to tell me why? Type below, or pick a quick reason above.", 'agent');
  var input = activeInput();
  input.value = 'Declining because: ';
  input.focus();
}

function feedDeclineReason(invId, reason) {
  var inv = feed.getById(invId);
  if (!inv) return;
  var labels = { time: "Can't make this time", group: 'Not the right group', already: 'Already playing', skip: '' };
  inv.status = 'declined';
  inv.reason = labels[reason] || '';
  feed.render();
  // Clear the chat input prompt since they picked a quick reason
  var input = activeInput();
  if (input.value.indexOf('Declining because') === 0) input.value = '';

  // Feed -> Chat: agent responds
  if (reason === 'group') {
    addMessage("No worries on passing. Want me to find you something with more of your usual crew?", 'agent');
  } else if (reason === 'time') {
    addMessage("Got it \u2014 timing doesn't work. I'll keep an eye out for " + (state.location || 'your location') + " sessions that fit better.", 'agent');
  } else if (reason === 'already') {
    addMessage("Got it \u2014 you're already booked. I'll remember your schedule.", 'agent');
  } else if (reason === 'skip') {
    addMessage("No problem. Skipped.", 'agent');
  }
}

/* ============ CROSS-PANEL: Chat -> Feed ============ */
function parseChatForFeedUpdate(text) {
  var lower = text.toLowerCase();
  var connNames = state.connections.map(function(c) { return c.playerName; });
  var changed = false;

  // Detect liked players
  var positiveWords = ['love','enjoy','great','awesome','favorite','best','fun','click','chemistry'];
  var negativeWords = ['avoid','dont like','rather not','skip','dont want','not pair','dont enjoy'];

  var graphOps = [];
  connNames.forEach(function(name, idx) {
    var firstName = name.toLowerCase().split(/[\\s.]+/)[0];
    if (lower.indexOf(firstName) >= 0) {
      var hasPositive = positiveWords.some(function(w) { return lower.indexOf(w) >= 0; });
      var hasNegative = negativeWords.some(function(w) { return lower.indexOf(w) >= 0; });
      if (hasPositive && !hasNegative) {
        if (feed.preferences.likedNames.indexOf(name) < 0) {
          feed.preferences.likedNames.push(name);
          changed = true;
        }
        graphOps.push({ action: 'reveal', nodeIndex: idx });
        graphOps.push({ action: 'highlight', nodeIndex: idx, color: '#34d399' });
      }
      if (hasNegative && !hasPositive) {
        if (feed.preferences.dislikedNames.indexOf(name) < 0) {
          feed.preferences.dislikedNames.push(name);
          changed = true;
        }
        graphOps.push({ action: 'reveal', nodeIndex: idx });
        graphOps.push({ action: 'flag', nodeIndex: idx });
      }
    }
  });
  if (graphOps.length > 0) graph.processUpdates(graphOps);

  // Detect time preferences
  if (lower.indexOf('morning') >= 0) { feed.preferences.preferredTimes.push('morning'); changed = true; }
  if (lower.indexOf('evening') >= 0) { feed.preferences.preferredTimes.push('evening'); changed = true; }

  // Detect small group preference
  if (lower.indexOf('small group') >= 0 || lower.indexOf('just 4') >= 0 || lower.indexOf('doubles') >= 0) {
    feed.preferences.preferredSize = 'small';
    changed = true;
  }

  if (changed) {
    // Show updating animation
    var updEl = document.getElementById('feed-updating');
    updEl.classList.add('visible');
    setTimeout(function() {
      feed.resort();
      feed.render();
      updEl.classList.remove('visible');
    }, 800);
  }
}

/* ============ GRAPH ENGINE ============ */
var graph = {
  canvas: null, ctx: null, nodes: [], edges: [],
  running: false, hovered: null, selected: null,
  w: 0, h: 0, clarity: 0.3,

  init: function(canvasEl, playerName, connections) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.nodes = []; this.edges = [];
    this.hovered = null; this.selected = null;
    this.clarity = 0.3;
    this.resize();

    this.nodes.push({
      id: 'self', name: playerName,
      x: this.w / 2, y: this.h / 2,
      vx: 0, vy: 0, r: 24,
      color: '#6366f1', revealed: true, fixed: true,
      times: 0, affinity: 0, scale: 1, pulse: 0
    });

    var self = this;
    connections.forEach(function(c, i) {
      var angle = (i / connections.length) * Math.PI * 2 - Math.PI / 2;
      var dist = 90 + Math.random() * 25;
      self.nodes.push({
        id: c.playerId, name: c.playerName,
        x: self.w / 2 + Math.cos(angle) * dist,
        y: self.h / 2 + Math.sin(angle) * dist,
        vx: 0, vy: 0,
        r: 10 + Math.min(c.timesPlayed * 0.6, 8),
        color: '#475569', revealed: false, fixed: false,
        times: c.timesPlayed, affinity: 0, scale: 0, pulse: 0
      });
      self.edges.push({
        src: 0, tgt: i + 1,
        strength: c.timesPlayed, revealed: false, affinity: 0
      });
    });

    canvasEl.addEventListener('mousemove', function(e) { self.onMouse(e); });
    canvasEl.addEventListener('click', function(e) { self.onClick(e); });
    if (!this.running) { this.running = true; this.animate(); }
  },

  resize: function() {
    if (!this.canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var p = this.canvas.parentElement;
    var w = p.clientWidth;
    var h = p.clientHeight - 2;
    this.w = w; this.h = h;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.nodes.length > 0) { this.nodes[0].x = w / 2; this.nodes[0].y = h / 2; }
  },

  processUpdates: function(updates) {
    var self = this;
    if (!updates) return;
    updates.forEach(function(u) {
      if (u.action === 'reveal') {
        var idx = u.nodeIndex === -1 ? 0 : u.nodeIndex + 1;
        if (idx >= 0 && idx < self.nodes.length && !self.nodes[idx].revealed) {
          self.nodes[idx].revealed = true;
          self.nodes[idx].scale = 0;
          self.nodes[idx].pulse = 60;
          if (idx > 0 && self.edges[idx - 1]) self.edges[idx - 1].revealed = true;
        }
      } else if (u.action === 'highlight' && u.nodeIndex >= 0) {
        var n = self.nodes[u.nodeIndex + 1];
        if (n) { n.color = u.color || '#34d399'; n.affinity = 8; n.pulse = 30; }
        var e = self.edges[u.nodeIndex];
        if (e) e.affinity = 8;
      } else if (u.action === 'flag' && u.nodeIndex >= 0) {
        var n = self.nodes[u.nodeIndex + 1];
        if (n) { n.color = '#f87171'; n.affinity = -8; n.pulse = 30; }
        var e = self.edges[u.nodeIndex];
        if (e) e.affinity = -8;
      } else if (u.action === 'dim' && u.nodeIndex >= 0) {
        var n = self.nodes[u.nodeIndex + 1];
        if (n) { n.color = '#64748b'; n.affinity = -5; }
        var e = self.edges[u.nodeIndex];
        if (e) e.affinity = -5;
      } else if (u.action === 'pulse') {
        self.nodes.forEach(function(n) { if (n.revealed) n.pulse = 40; });
      }
    });
    this.updateCompletion();
    this.clarity = Math.min(1, this.clarity + 0.1);
  },

  updateCompletion: function() {
    var revealed = 0;
    for (var i = 1; i < this.nodes.length; i++) { if (this.nodes[i].revealed) revealed++; }
    var total = this.nodes.length - 1;
    var pct = total > 0 ? Math.round(revealed / total * 100) : 0;
    var el = document.getElementById('graph-completion');
    if (el) el.textContent = revealed + '/' + total + ' connections';
  },

  animate: function() {
    if (!this.running) return;
    this.tick(); this.draw();
    var self = this;
    requestAnimationFrame(function() { self.animate(); });
  },

  tick: function() {
    var cx = this.w / 2, cy = this.h / 2;
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      if (!n.revealed || n.fixed) continue;
      n.vx += (cx - n.x) * 0.002;
      n.vy += (cy - n.y) * 0.002;
    }
    for (var i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].revealed) continue;
      for (var j = i + 1; j < this.nodes.length; j++) {
        if (!this.nodes[j].revealed) continue;
        var dx = this.nodes[j].x - this.nodes[i].x;
        var dy = this.nodes[j].y - this.nodes[i].y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var force = 400 / (dist * dist);
        if (!this.nodes[i].fixed) { this.nodes[i].vx -= dx / dist * force; this.nodes[i].vy -= dy / dist * force; }
        if (!this.nodes[j].fixed) { this.nodes[j].vx += dx / dist * force; this.nodes[j].vy += dy / dist * force; }
      }
    }
    for (var i = 0; i < this.edges.length; i++) {
      var e = this.edges[i];
      if (!e.revealed) continue;
      var s = this.nodes[e.src], t = this.nodes[e.tgt];
      if (!s.revealed || !t.revealed) continue;
      var dx = t.x - s.x, dy = t.y - s.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var ideal = 100 - e.strength * 2;
      var force = (dist - ideal) * 0.003;
      if (!s.fixed) { s.vx += dx / dist * force; s.vy += dy / dist * force; }
      if (!t.fixed) { t.vx -= dx / dist * force; t.vy -= dy / dist * force; }
    }
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      if (n.fixed) continue;
      n.vx *= 0.9; n.vy *= 0.9;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(n.r + 15, Math.min(this.w - n.r - 15, n.x));
      n.y = Math.max(n.r + 25, Math.min(this.h - n.r - 25, n.y));
      if (n.scale < 1) n.scale = Math.min(1, n.scale + 0.04);
      if (n.pulse > 0) n.pulse--;
    }
    var self = this.nodes[0];
    if (self && self.scale < 1) self.scale = Math.min(1, self.scale + 0.04);
    if (self && self.pulse > 0) self.pulse--;
  },

  draw: function() {
    var ctx = this.ctx, w = this.w, h = this.h, cl = this.clarity;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(100,116,139,' + (0.04 * cl) + ')';
    for (var gx = 20; gx < w; gx += 40) {
      for (var gy = 20; gy < h; gy += 40) { ctx.fillRect(gx, gy, 1, 1); }
    }

    for (var i = 0; i < this.edges.length; i++) {
      var e = this.edges[i];
      if (!e.revealed) continue;
      var s = this.nodes[e.src], t = this.nodes[e.tgt];
      if (!t.revealed) continue;
      var sc = t.scale;
      var tx = s.x + (t.x - s.x) * sc;
      var ty = s.y + (t.y - s.y) * sc;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      var alpha = cl * 0.4;
      if (e.affinity > 0) ctx.strokeStyle = 'rgba(52,211,153,' + (alpha + 0.2) + ')';
      else if (e.affinity < 0) { ctx.strokeStyle = 'rgba(248,113,113,' + alpha * 0.6 + ')'; ctx.setLineDash([4, 4]); }
      else ctx.strokeStyle = 'rgba(100,116,139,' + alpha + ')';
      ctx.lineWidth = Math.max(1, e.strength * 0.25);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      if (!n.revealed) continue;
      var r = n.r * (n.scale || 0);
      if (r < 1) continue;

      if (n.pulse > 0) {
        var pr = r + (60 - n.pulse) * 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99,102,241,' + (n.pulse / 60 * 0.3) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (n === this.hovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.12)';
        ctx.fill();
      }

      if (n.affinity > 5) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52,211,153,0.1)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (r > 7) {
        var parts = n.name.split(' ');
        var ini = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0];
        ctx.fillStyle = 'rgba(255,255,255,' + (0.6 + cl * 0.3) + ')';
        ctx.font = 'bold ' + Math.max(7, r * 0.55) + 'px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ini, n.x, n.y);
      }

      if ((n.scale || 0) > 0.5) {
        ctx.fillStyle = 'rgba(148,163,184,' + cl + ')';
        ctx.font = (n.id === 'self' ? 'bold ' : '') + '9px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(n.name, n.x, n.y + r + 3);
        if (n.times > 0 && n.id !== 'self') {
          ctx.fillStyle = 'rgba(100,116,139,' + cl * 0.8 + ')';
          ctx.font = '8px -apple-system, sans-serif';
          ctx.fillText(n.times + 'x', n.x, n.y + r + 13);
        }
      }
    }
    ctx.textBaseline = 'alphabetic';
  },

  onMouse: function(e) {
    var rect = this.canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    this.hovered = null;
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      if (!n.revealed) continue;
      var dx = mx - n.x, dy = my - n.y;
      if (dx * dx + dy * dy < (n.r + 5) * (n.r + 5)) {
        this.hovered = n;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.canvas.style.cursor = 'default';
  },

  onClick: function(e) {
    if (this.hovered) {
      if (this.hovered.id === 'self') {
        selfClicked();
        return;
      }
      playerClicked(this.hovered.name);
    }
  }
};

/* ============ NODE DETAIL ============ */
function showNodeDetail(node) {
  var el = document.getElementById('node-detail');
  if (!node) { el.classList.remove('visible'); return; }
  var html = '<div style="font-weight:600">' + escapeHtml(node.name) + '</div>';
  html += '<div style="color:var(--text2);margin-top:2px">' + node.times + ' sessions together</div>';
  if (node.affinity > 0) html += '<div style="color:var(--green);margin-top:2px">Strong connection</div>';
  if (node.affinity < 0) html += '<div style="color:#f87171;margin-top:2px">Flagged</div>';
  html += '<button data-name="' + escapeHtml(node.name) + '" onclick="askAbout(this.dataset.name)">Ask about ' + escapeHtml(node.name) + '</button>';
  el.innerHTML = html;
  el.style.left = Math.min(node.x + node.r + 8, graph.w - 170) + 'px';
  el.style.top = Math.max(8, node.y - 35) + 'px';
  el.classList.add('visible');
}

function askAbout(name) {
  var input = activeInput();
  input.value = 'What do you think about ' + name + '?';
  input.focus();
  showNodeDetail(null);
  graph.selected = null;
  // Graph -> Feed: highlight invitations with this player
  feed.highlightByPlayer(name);
}

/* ============ RECENT SESSIONS ENGINE ============ */
var sessions = {
  data: [],
  connections: [],
  archetype: 'balanced',

  render: function(sessionList, connections, archetype) {
    this.data = sessionList || [];
    this.connections = connections || [];
    this.archetype = archetype || 'balanced';
    var container = document.getElementById('session-list');
    if (!container || !this.data.length) return;
    container.innerHTML = '';

    var knownNames = {};
    this.connections.forEach(function(c) { knownNames[c.playerName] = c.timesPlayed; });

    var archetypeLabels = { social: '\u{1F91D} Social Player', balanced: '\u2696\uFE0F All-Around', competitive: '\u{1F3C6} Competitive' };
    var badge = document.getElementById('archetype-badge');
    if (badge) {
      badge.textContent = archetypeLabels[archetype] || archetypeLabels.balanced;
      badge.className = 'archetype-badge ' + archetype;
    }

    var self = this;
    this.data.forEach(function(s, idx) {
      var card = document.createElement('div');
      card.className = 'session-card';
      card.setAttribute('data-idx', idx);

      var dateStr = self.formatDate(s.date);
      var headerHtml = '<div class="sc-header">';
      headerHtml += '<span class="sc-type">' + escapeHtml(s.categoryName) + '</span>';
      headerHtml += '<span class="sc-date">' + dateStr + ' \u00B7 ' + s.time + ' \u00B7 ' + s.locationName + '</span>';
      headerHtml += '</div>';

      var playersHtml = '<div class="sc-players">';
      (s.otherPlayers || []).forEach(function(name) {
        var isKnown = knownNames[name] !== undefined;
        var times = knownNames[name] || 0;
        playersHtml += '<span class="sc-player" data-name="' + escapeHtml(name) + '" onclick="event.stopPropagation(); playerClicked(this.dataset.name)" title="' + (isKnown ? times + ' sessions together' : 'New face') + '">';
        playersHtml += '<span class="sp-dot ' + (isKnown ? 'known' : 'unknown') + '"></span>';
        playersHtml += escapeHtml(name);
        playersHtml += '</span>';
      });
      playersHtml += '</div>';

      var detailHtml = '<div class="sc-detail">';
      detailHtml += '<div>' + s.playerCount + ' players \u00B7 ' + escapeHtml(s.categoryName) + ' at ' + escapeHtml(s.locationName) + '</div>';
      if (s.result) {
        detailHtml += '<div style="margin-top:3px"><span style="font-weight:700;color:var(--green)">\u{1F3C6} ' + escapeHtml(s.result) + '</span></div>';
      }
      if (s.scores) {
        detailHtml += '<div class="sc-scores" style="margin-top:3px;font-size:10px;color:var(--text2);cursor:pointer;display:none" data-scores="' + escapeHtml(s.scores) + '">\u{1F4CA} Scores: ' + escapeHtml(s.scores) + '</div>';
      }
      detailHtml += '</div>';

      card.innerHTML = headerHtml + playersHtml + detailHtml;
      (function(sessionDate, sessionType) {
        card.onclick = function() {
          var wasExpanded = card.classList.contains('expanded');
          container.querySelectorAll('.session-card').forEach(function(c) {
            c.classList.remove('expanded');
            var sc = c.querySelector('.sc-scores');
            if (sc) sc.style.display = 'none';
          });
          if (!wasExpanded) {
            card.classList.add('expanded');
            var sc = card.querySelector('.sc-scores');
            if (sc) sc.style.display = 'block';
          }
          sessionClicked(sessionDate, sessionType);
        };
      })(s.date, s.categoryName);
      container.appendChild(card);
    });
  },

  formatDate: function(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
  }
};

/* ============ SETTINGS ============ */
function openSettings() {
  var overlay = document.getElementById('settings-overlay');
  overlay.classList.add('visible');
  // Populate wallet info if available
  if (state.messaging && state.messaging.agentAddress) {
    var addr = state.messaging.agentAddress;
    document.getElementById('settings-wallet-addr').textContent = addr.slice(0, 10) + '...' + addr.slice(-6);
    var link = document.getElementById('settings-explorer-link');
    link.href = 'https://suiscan.xyz/testnet/account/' + addr;
    link.style.display = '';
  }
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('visible');
}
function toggleGcal() {
  var btn = document.getElementById('gcal-btn');
  if (btn.classList.contains('linked')) {
    btn.classList.remove('linked');
    btn.textContent = 'Link';
  } else {
    btn.classList.add('linked');
    btn.textContent = '\u2713 Linked';
    addMessage('Google Calendar linked. I\\'ll check your availability before sending invitations.', 'agent');
  }
}
function toggleChip(el) { el.classList.toggle('active'); }
function toggleChipGroup(el, groupId) {
  document.getElementById(groupId).querySelectorAll('.settings-chip').forEach(function(c) { c.classList.remove('active'); });
  el.classList.add('active');
}

function selfClicked() {
  var input = activeInput();
  input.value = 'About myself: ';
  input.focus();
  // Pulse self node
  if (graph.nodes[0]) { graph.nodes[0].pulse = 40; }
}

function playerClicked(name) {
  var input = activeInput();
  input.value = 'About @' + name + ': ';
  input.focus();
  // Highlight in graph
  graph.nodes.forEach(function(n) {
    if (n.name === name) {
      n.pulse = 40;
      if (!n.revealed) { n.revealed = true; n.scale = 0; }
      graph.selected = n;
      showNodeDetail(n);
    }
  });
  // Highlight in feed
  feed.highlightByPlayer(name);
}

function sessionClicked(date, type) {
  var input = activeInput();
  input.value = 'About my ' + type + ' session on ' + date + ': ';
  input.focus();
}

/* ============ LOAD PERSONAS ============ */
fetch('/api/personas').then(function(r) { return r.json(); }).then(function(personas) {
  var list = document.getElementById('persona-list');
  personas.forEach(function(p, i) {
    var el = document.createElement('div');
    el.className = 'persona' + (i === 0 ? ' active' : '');
    el.onclick = function() { selectPersona(i); };
    var initials = p.name.split(' ').map(function(w) { return w[0]; }).join('');
    el.innerHTML = '<div style="display:flex;align-items:center">'
      + '<div class="avatar" style="background:' + avatarColors[i % 5] + '">' + initials + '</div>'
      + '<div><div class="name">' + escapeHtml(p.name) + '</div></div></div>';
    list.appendChild(el);
  });
}).catch(function() {});

/* ============ ACTIVATE BADGES ON LOAD ============ */
fetch('/api/status').then(function(r) { return r.json(); }).then(function(s) {
  if (s.isLive) { var b = document.getElementById('badge-ai'); b.textContent = '\u2713 AI Agent'; b.classList.add('active'); }
  if (s.messaging) { var b = document.getElementById('messaging-badge'); b.style.display = ''; b.textContent = '\u2713 Sui Messaging SDK'; b.classList.add('active'); }
  if (s.sui) { var b = document.getElementById('badge-sui'); b.textContent = '\u2713 Sui Testnet'; b.classList.add('active'); }
  if (s.seal === true) { var b = document.getElementById('badge-seal'); b.textContent = '\u2713 Seal Encryption'; b.classList.add('active'); }
  else if (s.seal === 'simulated') { var b = document.getElementById('badge-seal'); b.textContent = 'Seal Encryption (testnet-ready)'; b.classList.add('simulated'); }
  if (s.walrus === true) { var b = document.getElementById('badge-memwal'); b.textContent = '\u2713 MemWal'; b.classList.add('active'); }
  else if (s.walrus === 'simulated') { var b = document.getElementById('badge-memwal'); b.textContent = 'MemWal (testnet-ready)'; b.classList.add('simulated'); }
}).catch(function() {});

/* ============ COMPARISON CARD MINI-GRAPH ============ */
(function() {
  var canvas = document.getElementById('compare-canvas');
  var wrap = canvas ? canvas.parentElement : null;
  if (!canvas || !wrap) return;
  var dpr = window.devicePixelRatio || 1;
  var W, H, ctx;

  function resize() {
    var r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Mini-graph: You + Sarah + Tom + Mike ---
  var nodes = [];
  var edges = [];
  var frame = 0;

  function buildGraph() {
    nodes = []; edges = [];
    var cx = W / 2, cy = H / 2;
    var spread = Math.min(W, H) * 0.35;

    // You (center)
    nodes.push({ x: cx, y: cy, r: 10, label: 'You', color: 'rgba(99,102,241,0.9)' });
    // Sarah (top-left, green, strong)
    nodes.push({ x: cx - spread * 0.85, y: cy - spread * 0.5, r: 7, label: 'Sarah M.', color: 'rgba(52,211,153,0.9)' });
    // Tom (top-right, green, medium)
    nodes.push({ x: cx + spread * 0.85, y: cy - spread * 0.4, r: 6, label: 'Tom K.', color: 'rgba(52,211,153,0.7)' });
    // Mike (bottom, red, avoid)
    nodes.push({ x: cx + spread * 0.2, y: cy + spread * 0.65, r: 5, label: 'Mike D.', color: 'rgba(248,113,113,0.6)' });

    // Edges: You→Sarah (strong), You→Tom (medium), You→Mike (dashed/weak)
    edges.push({ from: 0, to: 1, width: 2.5, color: 'rgba(52,211,153,0.5)' });
    edges.push({ from: 0, to: 2, width: 1.5, color: 'rgba(52,211,153,0.3)' });
    edges.push({ from: 0, to: 3, width: 1, color: 'rgba(248,113,113,0.2)', dashed: true });
    // Sarah↔Tom connection
    edges.push({ from: 1, to: 2, width: 1, color: 'rgba(99,102,241,0.15)' });
  }

  buildGraph();

  function animate() {
    frame++;
    if (!ctx) { requestAnimationFrame(animate); return; }
    ctx.clearRect(0, 0, W, H);

    // Subtle center glow
    var grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.45);
    grad.addColorStop(0, 'rgba(99,102,241,0.06)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Draw edges
    edges.forEach(function(e) {
      var from = nodes[e.from], to = nodes[e.to];
      ctx.beginPath();
      if (e.dashed) ctx.setLineDash([3, 3]);
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = e.color;
      ctx.lineWidth = e.width;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes with breathing
    nodes.forEach(function(n, i) {
      var bx = n.x + Math.sin(frame * 0.008 + i * 1.5) * 1.2;
      var by = n.y + Math.cos(frame * 0.006 + i * 2.1) * 1.2;

      // Glow
      ctx.beginPath();
      ctx.arc(bx, by, n.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.08)';
      ctx.fill();

      // Node
      ctx.beginPath();
      ctx.arc(bx, by, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(226,232,240,0.85)';
      ctx.font = (i === 0 ? '600 ' : '') + '8px -apple-system, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.label, bx, by + n.r + 3);
    });

    requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener('resize', function() { resize(); buildGraph(); });
})();

/* ============ UI FUNCTIONS ============ */
function showError(msg) {
  var b = document.getElementById('error-banner');
  b.textContent = msg;
  b.classList.add('visible');
  setTimeout(function() { b.classList.remove('visible'); }, 6000);
}

function selectPersona(i) {
  state.personaIndex = i;
  document.querySelectorAll('.persona').forEach(function(p, j) { p.classList.toggle('active', j === i); });
}

function startConversation() {
  var btn = document.getElementById('start-btn');
  btn.disabled = true; btn.textContent = '\u{1F512} Connecting to Sui...';
  var body = { mode: 'demo', personaIndex: state.personaIndex };
  fetch('/api/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { showError(data.error); btn.disabled = false; btn.textContent = 'Login to your Give Diary'; return; }
      state.sessionId = data.sessionId;
      state.playerName = data.playerName;
      state.connections = data.connections || [];
      state.location = data.location || '';

      // Store data on state for mode switching
      state.messaging = data.messaging || null;
      state.archetype = data.archetype || 'balanced';
      state.graphUpdates = data.graphUpdates || null;

      document.getElementById('persona-section').style.display = 'none';
      document.getElementById('product-toggle').style.display = 'none';
      document.getElementById('tool-section').style.display = 'none';
      document.getElementById('network-section').style.display = 'none';
      document.getElementById('hero-canvas-wrap').style.display = 'none';
      document.querySelector('.tagline').style.fontSize = '13px';
      document.querySelector('.tagline').style.marginBottom = '2px';
      document.querySelector('.header').style.padding = '8px 0 8px';

      var modeLabel = data.isLive ? '\u{1F7E2} Live AI' : 'Scripted';
      var archetypeLabels = { social: '\u{1F91D} Social', balanced: '\u2696\uFE0F All-Around', competitive: '\u{1F3C6} Competitive' };
      var detailText = data.location + ' \u00B7 ' + (archetypeLabels[data.archetype] || '') + ' \u00B7 ' + modeLabel;

      if (state.mode === 'chat') {
        document.getElementById('chat-only-layout').classList.add('visible');
        document.getElementById('player-name-solo').textContent = data.playerName;
      } else {
        document.getElementById('app-layout').classList.add('visible');
        document.getElementById('player-name').textContent = data.playerName;
        // Show wallet bar with explorer link
        var walletBar = document.getElementById('wallet-bar');
        walletBar.classList.add('visible');
        if (data.messaging && data.messaging.agentAddress) {
          var addr = data.messaging.agentAddress;
          var explorerUrl = 'https://suiscan.xyz/testnet/account/' + addr;
          var addrEl = document.getElementById('wallet-addr');
          addrEl.textContent = addr.slice(0, 8) + '...' + addr.slice(-4);
          addrEl.style.cursor = 'pointer';
          addrEl.title = 'View on Sui Explorer';
          addrEl.onclick = function() { window.open(explorerUrl, '_blank'); };
          var expLink = document.getElementById('wallet-explorer-link');
          expLink.href = explorerUrl;
          expLink.style.display = '';
        }
      }

      addMessage(data.greeting, 'agent');
      window._messagingEnabled = !!(data.messaging && data.messaging.enabled);

      // Show Sui proof link when messaging is live
      if (data.messaging && data.messaging.enabled && data.messaging.explorerUrl) {
        window._explorerUrl = data.messaging.explorerUrl;
        window._groupId = data.messaging.groupId;
        addSystemMessage('On-chain messaging group created \u2014 <a href="' + data.messaging.explorerUrl + '" target="_blank" style="color:#4da2ff;text-decoration:none;">verify on Sui Explorer \u2197</a>');
      }

      // Generate and render invitation feed (always, for switching to gui later)
      feed.generate(data.playerName, data.connections || [], data.location || 'Rye');
      feed.render();

      // Render recent sessions + archetype badge
      sessions.render(data.recentSessions || [], data.connections || [], data.archetype || 'balanced');

      activeInput().focus();
      // Init graph after layout paint (gui mode only — chat mode inits on switch)
      if (state.mode === 'gui') {
        setTimeout(function() {
          graph.resize();
          graph.init(document.getElementById('graph-canvas'), data.playerName, data.connections || []);
          if (data.graphUpdates) graph.processUpdates(data.graphUpdates);
        }, 80);
      }
    })
    .catch(function(e) { showError('Failed to start: ' + e.message); btn.disabled = false; btn.textContent = 'Login to your Give Diary'; });
}

function sendMessage() {
  if (sending) return;
  var input = activeInput();
  var text = input.value.trim();
  if (!text || !state.sessionId) return;
  sending = true;
  input.value = '';
  addMessage(text, 'user', !!window._messagingEnabled);
  showTyping();

  // Chat -> Feed: parse user message for preference signals
  parseChatForFeedUpdate(text);

  fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId, message: text }) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      removeTyping();
      if (data.error) { showError(data.error); sending = false; return; }
      addMessage(data.response, 'agent', data.messaging && data.messaging.encrypted);
      state.questionsAsked = data.questionsAsked;

      // Chat -> Feed: parse AI response too
      parseChatForFeedUpdate(data.response);

      if (data.canFinish) activeFinishBtn().disabled = false;
      if (data.graphUpdates) graph.processUpdates(data.graphUpdates);
    })
    .catch(function(e) { removeTyping(); showError('Error: ' + e.message); });
  sending = false;
}

function finishConversation() {
  var btn = activeFinishBtn();
  btn.disabled = true; btn.textContent = 'Encrypting...';
  addPipeline();
  updatePipelineStep(0, 'active');
  fetch('/api/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.sessionId }) })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) { showError(data.error); btn.disabled = false; btn.textContent = 'Done'; return; }
      var steps = [0, 1, 2, 3];
      function animateStep(idx) {
        if (idx >= steps.length) { setTimeout(function() { showResults(data); }, 300); return; }
        updatePipelineStep(idx, 'done');
        if (idx + 1 < steps.length) updatePipelineStep(idx + 1, 'active');
        setTimeout(function() { animateStep(idx + 1); }, 400);
      }
      animateStep(0);
    })
    .catch(function(e) { showError('Processing failed: ' + e.message); btn.disabled = false; btn.textContent = 'Done'; });
}

function addMessage(text, type, encrypted) {
  var msgs = activeMessages();
  var div = document.createElement('div');
  div.className = 'msg ' + type;
  if (type === 'agent') {
    div.innerHTML = '<div class="label">Give Diary Agent</div>' + escapeHtml(text);
  } else if (type === 'feed-event') {
    div.innerHTML = '<div class="label" style="color:var(--green)">\u{1F4E8} Feed Update</div>' + escapeHtml(text);
  } else {
    div.textContent = text;
  }
  if (encrypted) {
    var seal = document.createElement('span');
    seal.className = 'seal-badge';
    seal.innerHTML = '\u{1F512} Sealed';
    div.appendChild(seal);
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addSystemMessage(html) {
  var msgs = activeMessages();
  var div = document.createElement('div');
  div.className = 'msg system';
  div.innerHTML = html;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  var msgs = activeMessages();
  var div = document.createElement('div');
  div.className = 'msg agent'; div.id = 'typing-indicator';
  div.innerHTML = '<div class="label">Give Diary Agent</div><div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  var el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function addPipeline() {
  var msgs = activeMessages();
  var div = document.createElement('div');
  div.className = 'msg system'; div.id = 'pipeline';
  div.innerHTML = '<div class="pipeline">'
    + '<div class="pipeline-step" id="ps-0"><span class="icon">-</span>Extracting preference signals...</div>'
    + '<div class="pipeline-step" id="ps-1"><span class="icon">-</span>Encrypting with Seal on Sui...</div>'
    + '<div class="pipeline-step" id="ps-2"><span class="icon">-</span>Storing on Walrus...</div>'
    + '<div class="pipeline-step" id="ps-3"><span class="icon">-</span>Building your matchmaking group...</div>'
    + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function updatePipelineStep(i, status) {
  var el = document.getElementById('ps-' + i);
  if (!el) return;
  el.className = 'pipeline-step ' + status;
  el.querySelector('.icon').textContent = status === 'done' ? '\\u2713' : status === 'active' ? '\\u2022' : '-';
}

function showResults(data) {
  var results = document.getElementById('results');
  results.classList.add('visible');
  var cards = [];

  var signalHtml = '<div class="result-card" id="rc-0">';
  signalHtml += '<h3>Preference Signals</h3>';
  signalHtml += '<div class="narrative">Your preferences are now structured data \\u2014 extracted from natural conversation, not a form.</div>';
  signalHtml += '<div class="detail">Total signals: <span class="value">' + data.signals.total + '</span></div>';
  if (data.signals.affinities > 0) signalHtml += '<div class="detail">People you love playing with: <span class="value success">' + data.signals.affinities + '</span></div>';
  if (data.signals.avoids > 0) signalHtml += '<div class="detail">People to avoid: <span class="value" style="color:var(--red)">' + data.signals.avoids + '</span></div>';
  if (data.signals.stylePreferences > 0) signalHtml += '<div class="detail">Play style signals: <span class="value">' + data.signals.stylePreferences + '</span></div>';
  signalHtml += '</div>';
  cards.push(signalHtml);

  var encHtml = '<div class="result-card" id="rc-1">';
  encHtml += '<h3>\u{1F512} Seal Encryption</h3>';
  encHtml += '<div class="narrative">Your conversation is locked. You own the key.</div>';
  encHtml += '<div class="detail">Encrypted size: <span class="value">' + data.encryption.ciphertextSize + ' bytes</span></div>';
  encHtml += '<div class="detail">Owner wallet: <span class="value" style="font-size:10px">' + data.encryption.ownerAddress.slice(0, 20) + '...</span></div>';
  encHtml += '<div class="detail">Stored on Walrus: <span class="value" style="font-size:10px">' + data.encryption.walrusBlobId + '</span></div>';
  if (data.messaging && data.messaging.enabled) {
    encHtml += '<div style="margin-top:6px; padding:6px; background:rgba(77,162,255,0.08); border-radius:6px; font-size:10px;">';
    encHtml += '<div style="color:#4da2ff; font-weight:600; margin-bottom:3px;">Sui Messaging SDK</div>';
    encHtml += '<div>Group: <code>' + data.messaging.groupId.slice(0,16) + '...</code></div>';
    encHtml += '<div>Transactions: ' + data.messaging.digests.length + '</div>';
    encHtml += '<div style="margin-top:3px;"><a href="' + data.messaging.explorerUrl + '" target="_blank" style="color:#4da2ff;">View on Explorer \u2197</a></div>';
    encHtml += '</div>';
  }
  encHtml += '</div>';
  cards.push(encHtml);

  var privHtml = '<div class="result-card" id="rc-2">';
  privHtml += '<h3>Privacy Proof</h3>';
  privHtml += '<div class="narrative">Another wallet tried to read your data and was rejected by Sui smart contracts.</div>';
  privHtml += '<div class="detail">Unauthorized wallet: <span class="value" style="font-size:10px">' + data.privacyProof.wrongAddress.slice(0, 20) + '...</span></div>';
  privHtml += '<div class="detail" style="margin:6px 0"><span class="denied">ACCESS DENIED</span></div>';
  privHtml += '<div class="detail" style="font-size:11px">' + data.privacyProof.explanation + '</div>';
  privHtml += '</div>';
  cards.push(privHtml);

  if (data.coordinatorView) {
    var coordHtml = '<div class="result-card" id="rc-3">';
    coordHtml += '<h3>What the Coordinator Sees</h3>';
    coordHtml += '<div class="narrative">Structured signals only \\u2014 never your raw conversation or reasons.</div>';
    coordHtml += '<div class="detail">Style: <span class="value">' + escapeHtml(data.coordinatorView.summary) + '</span></div>';
    coordHtml += '<div class="detail">Schedule: <span class="value">' + escapeHtml(data.coordinatorView.scheduleHint) + '</span></div>';
    coordHtml += '<div class="detail">Affinity partners: <span class="value success">' + data.coordinatorView.affinityCount + '</span></div>';
    if (data.coordinatorView.avoidCount > 0) {
      coordHtml += '<div class="detail" style="color:var(--yellow)">' + escapeHtml(data.coordinatorView.note) + '</div>';
    }
    coordHtml += '</div>';
    cards.push(coordHtml);
  }

  if (data.recommendation && data.recommendation.recommendedGroup) {
    var matchHtml = '<div class="result-card" id="rc-4">';
    matchHtml += '<h3>Your Ideal Group</h3>';
    matchHtml += '<div class="narrative">Based on YOUR preferences \\u2014 not a guess.</div>';
    matchHtml += '<div class="detail" style="margin-bottom:6px">' + data.recommendation.preferredDay + ' ' + data.recommendation.preferredTime + ' at ' + data.recommendation.location + '</div>';
    data.recommendation.recommendedGroup.forEach(function(p) {
      matchHtml += '<div class="group-member"><div><strong>' + escapeHtml(p.playerName) + '</strong></div><div style="font-size:11px;color:var(--text2)">' + escapeHtml(p.reason) + '</div></div>';
    });
    matchHtml += '</div>';
    cards.push(matchHtml);
  }

  results.innerHTML = cards.join('');
  cards.forEach(function(_, i) {
    setTimeout(function() {
      var el = document.getElementById('rc-' + i);
      if (el) el.classList.add('revealed');
    }, i * 500);
  });
  setTimeout(function() {
    var cta = document.createElement('div');
    cta.className = 'cta-footer';
    cta.innerHTML = '<a href="#" onclick="location.reload()">Start a new conversation</a>';
    results.appendChild(cta);
  }, cards.length * 500 + 300);
}

function escapeHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

window.addEventListener('resize', function() { if (graph.canvas) graph.resize(); });
</script>
</body>
</html>`;
}
