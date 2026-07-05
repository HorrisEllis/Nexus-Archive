'use strict';
/**
 * guardian/ncp/server.js — NCP hub (Guardian's browser-tab bridge)
 * UUID: nexus-guardian-ncp-server-v1-0000-2026-0705-001
 * Version: 1.0.0
 * Port: 7820
 *
 * Rebuilt from scratch — this file was absent from the uploaded archive,
 * even though every other module references it (guardian/userscript-
 * perplexity.js as NCP_URL, cortex/core/raid/index.js as GD_URL,
 * idearium/agent-suite/index.js as GUARDIAN_PORT). Routes below are
 * inferred entirely from those callers — same method cortex/boot.js's
 * header used when it was reconstructed the same way.
 *
 * Routes (inferred):
 *   GET  /health                — liveness + per-provider tab counts
 *   GET  /channel?tabId&provider — SSE stream a browser tab holds open;
 *                                  server pushes GUARDIAN_JOB / _CLAIM / _RELEASE
 *   POST /command                — { provider, prompt, meta } → { jobId }
 *                                  (queues + dispatches via the warp pipeline)
 *   POST /result                 — tab → hub: GUARDIAN_REGISTER, _CLAIM_ACK,
 *                                  _COMPLETE, _ERROR, _ARTIFACT, _CHUNK, _GAPS,
 *                                  _LEDGER_WRITE, _LEDGER_EVENT, _DELIVERED, _REPLAY
 *   POST /heartbeat              — { provider, tabId, ts, usage, chatId, claimed }
 *
 * ── §PRIVACY / §CORS ─────────────────────────────────────────────────────────
 * This hub receives full prompt/response text from whatever the user is
 * chatting about on chatgpt.com / claude.ai / perplexity.ai / gemini —
 * that is live personal data, not build telemetry. Two defaults this file
 * deliberately does NOT inherit from guardian/memory_store/settings.json:
 *
 *   1. lan_host in settings.json defaults to '0.0.0.0'. That setting is
 *      fine for something like a UI dashboard; it is not fine for the NCP
 *      hub, which would then accept chat payloads from any device on the
 *      same LAN/WiFi. This server binds 127.0.0.1 unless NCP_ALLOW_LAN=1
 *      is explicitly set, and logs a loud warning if it is.
 *
 *   2. cortex/boot.js sets Access-Control-Allow-Origin: '*'. That is
 *      reasonable for cortex (no chat content, mostly internal telemetry
 *      reads). It is not reasonable here: a wildcard means *any* open tab
 *      in the user's browser — not just the intended chat surfaces — could
 *      fetch() this hub and read/inject jobs. CORS below is checked against
 *      dispatch-pipeline.js's KNOWN_ORIGINS allowlist, per request, and
 *      only ever echoes back the exact origin that's actually allowed —
 *      never '*'.
 */

const http   = require('http');
const crypto = require('crypto');
const path   = require('path');

const { buildPipeline, KNOWN_ORIGINS } = require('./dispatch-pipeline');

const PORT        = parseInt(process.env.NCP_PORT || '7820');
const ALLOW_LAN   = process.env.NCP_ALLOW_LAN === '1';
const HOST        = ALLOW_LAN ? '0.0.0.0' : '127.0.0.1';
const MEMORY_DIR  = process.env.GUARDIAN_MEMORY_DIR || path.join(__dirname, '..', 'memory_store');
const VERSION     = '1.0.0';

if (ALLOW_LAN) {
  console.warn(
    '[ncp] NCP_ALLOW_LAN=1 — binding 0.0.0.0. Chat payloads from ' +
    'chatgpt/claude/perplexity/gemini tabs will be reachable from other ' +
    'devices on this network. Only set this if you specifically need it.'
  );
}

const ALL_ALLOWED_ORIGINS = Object.values(KNOWN_ORIGINS).flat();

// ── State ──────────────────────────────────────────────────────────────────
// tabs: provider -> Map(tabId -> { res, lastSeen, claimed, usage })
const tabs = new Map(Object.keys(KNOWN_ORIGINS).map(p => [p, new Map()]));
// pending jobs: jobId -> { resolve, reject, provider, timer }
const pendingJobs = new Map();
const JOB_TIMEOUT_MS = parseInt(process.env.NCP_JOB_TIMEOUT_MS || '300000');

function sendToBrowser({ provider, prompt, meta }) {
  return new Promise((resolve) => {
    const jobId = crypto.randomUUID();
    const providerTabs = tabs.get(provider);
    const claimedEntry = providerTabs && [...providerTabs.values()].find(t => t.claimed);
    const anyEntry = providerTabs && [...providerTabs.values()][0];
    const target = claimedEntry || anyEntry;

    if (!target) {
      resolve({ ok: false, output: '', error: `no connected tab for provider '${provider}'` });
      return;
    }

    const timer = setTimeout(() => {
      pendingJobs.delete(jobId);
      resolve({ ok: false, output: '', error: `job ${jobId} timed out after ${JOB_TIMEOUT_MS}ms` });
    }, JOB_TIMEOUT_MS);

    pendingJobs.set(jobId, { resolve, timer, provider });
    target.res.write(`data: ${JSON.stringify({ type: 'GUARDIAN_JOB', jobId, command: meta.command || 'chat', prompt })}\n\n`);
  });
}

const pipeline = buildPipeline({ memoryStoreDir: MEMORY_DIR, sendToBrowser });

// ── CORS ───────────────────────────────────────────────────────────────────
// Never '*'. Echo back the requesting origin only if it's on the known
// chat-surface allowlist; otherwise omit the header entirely (browser
// blocks the read). This does not stop non-browser tools (curl, GM_xmlhttpRequest
// bypasses page-context CORS by design) — it stops OTHER OPEN TABS in the
// same browser from using ordinary fetch()/XHR against this hub, which is
// the actual threat model for a service bound to localhost with sensitive payloads.
function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALL_ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 5_000_000) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// ── /result handlers — one per GUARDIAN_* type the userscript already sends ──
function handleResult(msg) {
  switch (msg.type) {
    case 'GUARDIAN_REGISTER': {
      const providerTabs = tabs.get(msg.provider);
      if (providerTabs && providerTabs.has(msg.tabId)) {
        providerTabs.get(msg.tabId).claimed = !!msg.claimed;
      }
      break;
    }
    case 'GUARDIAN_CLAIM_ACK': {
      const providerTabs = tabs.get(msg.provider);
      if (providerTabs && providerTabs.has(msg.tabId)) providerTabs.get(msg.tabId).claimed = true;
      break;
    }
    case 'GUARDIAN_COMPLETE': {
      const p = pendingJobs.get(msg.jobId);
      if (p) { clearTimeout(p.timer); pendingJobs.delete(msg.jobId); p.resolve({ ok: true, output: msg.text }); }
      break;
    }
    case 'GUARDIAN_ERROR': {
      const p = pendingJobs.get(msg.jobId);
      if (p) { clearTimeout(p.timer); pendingJobs.delete(msg.jobId); p.resolve({ ok: false, output: '', error: msg.error }); }
      break;
    }
    // Artifact / chunk / gap / ledger messages are audit-only from the
    // hub's point of view — they ride the same warp StreamLog as
    // everything else rather than a bespoke branch each.
    default:
      pipeline.log.record({ step: 'ncp.result', type: msg.type, jobId: msg.jobId || null });
  }
}

// ── HTTP + SSE server ──────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    const online = {};
    let total = 0;
    for (const [provider, m] of tabs) { online[provider] = m.size; total += m.size; }
    json(res, 200, { ok: true, online, total, uptime: process.uptime(), version: VERSION });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/channel') {
    const provider = url.searchParams.get('provider');
    const tabId = url.searchParams.get('tabId');
    if (!provider || !tabId || !tabs.has(provider)) { res.writeHead(400); res.end(); return; }

    // Origin check for the SSE connection itself — same allowlist, not a
    // wildcard, consistent with §CORS note above.
    const origin = req.headers.origin;
    if (origin && !ALL_ALLOWED_ORIGINS.includes(origin)) { res.writeHead(403); res.end(); return; }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    tabs.get(provider).set(tabId, { res, lastSeen: Date.now(), claimed: false, usage: null });
    res.write(`data: ${JSON.stringify({ type: 'NCP_READY' })}\n\n`);

    req.on('close', () => { tabs.get(provider)?.delete(tabId); });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/command') {
    try {
      const body = await readBody(req);
      const { provider, prompt, meta = {} } = body;
      if (!provider || !prompt) { json(res, 400, { error: 'provider and prompt required' }); return; }
      const result = await pipeline.dispatchCommand({ provider, prompt, origin: req.headers.origin, meta });
      if (!result.ok && result.error === 'axiom-rejected') { json(res, 403, result); return; }
      json(res, 200, { jobId: crypto.randomUUID(), ...result });
    } catch (e) {
      json(res, 400, { error: 'invalid JSON body' });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/result') {
    try {
      const msg = await readBody(req);
      handleResult(msg);
      json(res, 200, { ok: true });
    } catch { json(res, 400, { error: 'invalid JSON body' }); }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/heartbeat') {
    try {
      const msg = await readBody(req);
      const providerTabs = tabs.get(msg.provider);
      if (providerTabs && providerTabs.has(msg.tabId)) {
        const t = providerTabs.get(msg.tabId);
        t.lastSeen = Date.now();
        t.claimed = !!msg.claimed;
        t.usage = msg.usage || null;
      }
      json(res, 200, { ok: true });
    } catch { json(res, 400, { error: 'invalid JSON body' }); }
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, HOST, () => {
  console.log(`[ncp] guardian hub listening on http://${HOST}:${PORT} (v${VERSION})`);
});

module.exports = { server, pipeline, tabs };
