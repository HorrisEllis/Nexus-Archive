'use strict';
// §WIRED 2026-08-14 — "change agent needs to connect to NCP."
//
// This test stands up a REAL http server on a real port speaking guardian's
// real GET /providers response shape (guardian/server.js:2374) and points
// lib/ncp-availability.js at it. Nothing is stubbed: the module does an actual
// socket read every time. The one thing it does NOT do is require guardian
// itself to be running, which is the whole reason the shape is pinned here.
const _log = console.log;
console.log = (...a) => { const s = a[0]; if (typeof s === 'string' && s.startsWith('[jaa]')) return; _log(...a); };

const assert = require('assert');
const http   = require('http');
const path   = require('path');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); _log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { _log(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');

// ── A real guardian stand-in ─────────────────────────────────────────────────
// Mirrors guardian/server.js:2374 exactly: providers flags are the STRING
// 'null' when down, 'connected' when up; channels carries live client detail.
let _state = {
  providers: { claude:'null', chatgpt:'null', gemini:'null', perplexity:'null', ollama:'null' },
  channels:  {},
};
let _hits = 0;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/providers')) {
    _hits++;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, ...JSON.parse(JSON.stringify(_state)) }));
  }
  res.writeHead(404); res.end();
});

function connect(name, extra = {}) {
  _state.providers[name] = 'connected';
  _state.channels[name] = {
    tabId: `tab-${name}`, connectedAt: Date.now(), lastHeartbeat: Date.now(),
    age: 0, usage: { limited:false }, chatId: null, claimed: false,
    recentDisconnects: 0, ...extra,
  };
}
function disconnect(name) {
  _state.providers[name] = 'null';
  delete _state.channels[name];
}

async function main() {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  // Module reads GUARDIAN_URL at load — set it before the first require.
  process.env.GUARDIAN_URL = `http://127.0.0.1:${port}`;
  const ncp = require(path.join(ROOT, 'lib/ncp-availability'));

  // ── Cold state ─────────────────────────────────────────────────────────────
  await test('T-001', 'cold: an unread agent is "unknown", never falsely "offline"', () => {
    ncp._reset();
    assert.strictEqual(ncp.state('claude'), 'unknown');
    assert.strictEqual(ncp.isConnected('claude'), false, 'unknown must not report as connected');
  });

  await test('T-002', 'cold: the routing predicate fails OPEN so a down guardian cannot empty the fallback chain', () => {
    ncp._reset();
    const isUp = ncp.predicate();
    assert.strictEqual(isUp('claude'), true);
    assert.strictEqual(isUp('gemini'), true);
  });

  // ── Live read ──────────────────────────────────────────────────────────────
  await test('T-003', 'refresh() reads real NCP state over a real socket', async () => {
    ncp._reset();
    connect('gemini');
    const before = _hits;
    const snap = await ncp.refresh();
    assert.ok(_hits > before, 'must actually hit the wire');
    assert.strictEqual(snap.known, true);
    assert.strictEqual(snap.degraded, false);
    assert.strictEqual(ncp.state('gemini'), 'connected');
    assert.strictEqual(ncp.state('claude'), 'offline');
  });

  await test('T-004', 'the string "null" guardian actually sends is read as offline, not as truthy', async () => {
    ncp._reset();
    disconnect('gemini');
    await ncp.refresh();
    assert.strictEqual(ncp.state('gemini'), 'offline');
    assert.strictEqual(ncp.isConnected('gemini'), false);
  });

  await test('T-005', 'connected() lists only agents with a live channel', async () => {
    ncp._reset();
    connect('claude'); connect('perplexity');
    await ncp.refresh();
    assert.deepStrictEqual(ncp.connected(), ['claude', 'perplexity']);
  });

  await test('T-006', 'channel detail (tabId, heartbeat, flap count) survives the read', async () => {
    ncp._reset();
    connect('chatgpt', { recentDisconnects: 4, claimed: true });
    await ncp.refresh();
    const p = ncp.snapshot().providers.chatgpt;
    assert.strictEqual(p.tabId, 'tab-chatgpt');
    assert.strictEqual(p.recentDisconnects, 4);
    assert.strictEqual(p.claimed, true);
    assert.ok(typeof p.lastHeartbeat === 'number');
  });

  // ── ollama is not an NCP provider ──────────────────────────────────────────
  await test('T-007', 'ollama is "direct" — the local path is never gated on a browser-tab protocol', async () => {
    ncp._reset();
    await ncp.refresh();                       // ollama reported as 'null' by guardian
    assert.strictEqual(ncp.state('ollama'), 'direct');
    assert.strictEqual(ncp.predicate()('ollama'), true, 'ollama must survive the routing filter');
    assert.strictEqual(ncp.state('auto'), 'direct');
  });

  // ── The predicate is the thing routeAgent was always missing ───────────────
  await test('T-008', 'routeAgent fallback chain now excludes offline agents (was: excluded nothing)', async () => {
    ncp._reset();
    _state = { providers:{ claude:'null', chatgpt:'null', gemini:'null', perplexity:'null', ollama:'null' }, channels:{} };
    connect('gemini'); connect('claude');
    await ncp.refresh();

    const { routeAgent } = require(path.join(ROOT, 'lib/agent-router'));
    const withLive = routeAgent({ intent: 'data', available: ncp.predicate() });
    const without  = routeAgent({ intent: 'data' });

    assert.ok(without.fallbackChain.includes('chatgpt'),
      'baseline: with no predicate the chain includes everything — this is the bug being fixed');
    assert.ok(!withLive.fallbackChain.includes('chatgpt'),
      'chatgpt has no channel and must be filtered out of the chain');
    assert.ok(withLive.fallbackChain.includes('gemini') && withLive.fallbackChain.includes('claude'),
      'connected agents must survive');
  });

  await test('T-009', 'a chain filtered to empty still returns the chosen agent — routing never dead-ends', async () => {
    ncp._reset();
    _state = { providers:{ claude:'null', chatgpt:'null', gemini:'null', perplexity:'null', ollama:'null' }, channels:{} };
    await ncp.refresh();
    const { routeAgent } = require(path.join(ROOT, 'lib/agent-router'));
    const r = routeAgent({ intent: 'data', available: ncp.predicate() });
    assert.ok(Array.isArray(r.fallbackChain) && r.fallbackChain.length >= 1);
  });

  // ── Degradation is reported, never disguised ───────────────────────────────
  await test('T-010', 'guardian unreachable → degraded + reason, last known map kept, nothing invented', async () => {
    ncp._reset();
    connect('claude');
    await ncp.refresh();
    assert.strictEqual(ncp.state('claude'), 'connected');

    await new Promise(r => server.close(r));   // guardian goes away
    const snap = await ncp.refresh();
    assert.strictEqual(snap.degraded, true, 'must admit it is running blind');
    assert.ok(snap.error, 'must carry the real reason');

    // §REGRESSION — the first end-to-end run reported a confident 'offline'
    // here, off the retained map, which is "I asked and the tab is closed."
    // Guardian was unreachable; the honest answer is that we do not know.
    assert.strictEqual(ncp.state('claude'), 'unknown',
      'a degraded read must not launder a stale map into a confident offline');

    const rep = ncp.report('claude');
    assert.strictEqual(rep.degraded, true);
    assert.strictEqual(rep.live, false);
    assert.ok(rep.reason && rep.reason.length, 'reason must be stated, not empty');
  });

  await test('T-011', 'refresh() never throws — an unreachable guardian cannot fail a switch', async () => {
    ncp._reset();
    const snap = await ncp.refresh();          // server is closed at this point
    assert.strictEqual(snap.degraded, true);
    assert.strictEqual(snap.known, false);
  });

  _log(`\n  ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { _log('FATAL', e); process.exit(1); });
