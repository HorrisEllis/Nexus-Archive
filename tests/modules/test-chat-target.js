'use strict';
// §WIRED 2026-08-14 — "switch to Claude (or any agent) and add a chat url to use."
//
// Real http server on a real port speaking guardian's real /providers shape,
// exactly as test-ncp-availability.js does. Nothing stubbed.
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
const ct   = require(path.join(ROOT, 'lib/chat-target'));

let _state = {
  providers: { claude:'null', chatgpt:'null', gemini:'null', perplexity:'null', ollama:'null' },
  channels:  {},
};
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, ...JSON.parse(JSON.stringify(_state)) }));
});

async function main() {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  process.env.GUARDIAN_URL = `http://127.0.0.1:${server.address().port}`;
  const ncp = require(path.join(ROOT, 'lib/ncp-availability'));

  // ── parse: the four real providers ─────────────────────────────────────────
  // Each expectation matches that provider's own userscript chatId() regex.
  await test('T-001', 'parses a real conversation URL for all four NCP providers', () => {
    assert.deepStrictEqual(
      ['https://claude.ai/chat/abc-123',
       'https://chatgpt.com/c/xyz789',
       'https://gemini.google.com/app/g1',
       'https://www.perplexity.ai/search/some-slug'].map(u => {
        const p = ct.parse(u); return [p.provider, p.chatId];
      }),
      [['claude','abc-123'], ['chatgpt','xyz789'], ['gemini','g1'], ['perplexity','some-slug']]
    );
  });

  await test('T-002', 'an alternate host for the same provider still resolves (chat.openai.com)', () => {
    const p = ct.parse('https://chat.openai.com/c/aaa');
    assert.strictEqual(p.provider, 'chatgpt');
    assert.strictEqual(p.chatId, 'aaa');
  });

  await test('T-003', 'a provider root is isNewChat, not a parse failure — userscripts call this "home"', () => {
    const p = ct.parse('https://claude.ai/');
    assert.strictEqual(p.ok, true);
    assert.strictEqual(p.isNewChat, true);
    assert.strictEqual(p.chatId, 'home');
  });

  await test('T-004', 'perplexity slugs truncate at 80 — matching its own userscript, not a rounder number', () => {
    const long = 'x'.repeat(200);
    assert.strictEqual(ct.parse(`https://www.perplexity.ai/search/${long}`).chatId.length, 80);
  });

  await test('T-005', 'a non-provider host is refused and names the hosts it does know', () => {
    const p = ct.parse('https://example.com/chat/x');
    assert.strictEqual(p.ok, false);
    assert.ok(p.reason.includes('claude.ai'), 'must name the real known hosts, not just refuse');
  });

  await test('T-006', 'garbage is refused without throwing', () => {
    assert.strictEqual(ct.parse('not a url').ok, false);
    assert.strictEqual(ct.parse('').ok, false);
    assert.strictEqual(ct.parse(null).ok, false);
  });

  // ── validate: the mistake actually worth catching ──────────────────────────
  await test('T-007', 'a chatgpt URL bound to claude is refused AT BIND TIME, not at dispatch', () => {
    const v = ct.validate('https://chatgpt.com/c/xyz', 'claude');
    assert.strictEqual(v.ok, false);
    assert.ok(v.reason.includes('chatgpt') && v.reason.includes('claude'));
  });

  await test('T-008', 'a matching provider passes, and "auto" does not constrain the URL', () => {
    assert.strictEqual(ct.validate('https://claude.ai/chat/a1', 'claude').ok, true);
    assert.strictEqual(ct.validate('https://claude.ai/chat/a1', 'auto').ok, true);
  });

  // ── compare: four-valued, unknown is not offline ───────────────────────────
  await test('T-009', 'compare is honest: match / elsewhere / new / unknown are four different answers', () => {
    const t = ct.parse('https://claude.ai/chat/abc');
    assert.strictEqual(ct.compare(t, 'abc'), 'match');
    assert.strictEqual(ct.compare(t, 'other'), 'elsewhere');
    assert.strictEqual(ct.compare(t, null), 'unknown', 'no live id is NOT the same as a different chat');
    assert.strictEqual(ct.compare(ct.parse('https://claude.ai/'), 'anything'), 'new');
  });

  // ── the regression this suite exists for ───────────────────────────────────
  await test('T-010', 'REGRESSION: ncp-availability carries chatId through from guardian', async () => {
    ncp._reset();
    _state.providers.claude = 'connected';
    _state.channels.claude = {
      tabId: 'tab-claude', connectedAt: Date.now(), lastHeartbeat: Date.now(),
      usage: { limited: false }, chatId: 'abc-123', claimed: false, recentDisconnects: 0,
    };
    await ncp.refresh();
    const p = ncp.snapshot().providers.claude;
    // This was silently dropped in the first implementation. Guardian sends it
    // on every /providers response; the parser simply did not copy it, and the
    // only symptom was compare() answering 'unknown' about a tab whose chat id
    // was in the same HTTP response.
    assert.strictEqual(p.chatId, 'abc-123', 'chatId must survive the snapshot parse');
  });

  await test('T-011', 'end to end: a live tab in the bound chat produces NO warning', async () => {
    ncp._reset(); await ncp.refresh();
    const t = ct.parse('https://claude.ai/chat/abc-123');
    const live = ncp.snapshot().providers.claude.chatId;
    assert.strictEqual(ct.compare(t, live), 'match');
    assert.strictEqual(ct.describe(t, live), null, 'a match should say nothing at all');
  });

  await test('T-012', 'end to end: a live tab in a DIFFERENT chat warns, and says where the job will actually land', async () => {
    ncp._reset(); await ncp.refresh();
    const t = ct.parse('https://claude.ai/chat/zzz-999');
    const live = ncp.snapshot().providers.claude.chatId;
    const msg = ct.describe(t, live);
    assert.ok(msg.includes('zzz-999') && msg.includes('abc-123'),
      'must name BOTH the chat asked for and the chat the job will really go to');
    assert.ok(/cannot navigate/i.test(msg), 'must state the real limitation, not imply it will navigate');
  });

  await test('T-013', 'an offline tab is "unknown", never a confident "elsewhere"', async () => {
    ncp._reset();
    _state.providers.claude = 'null';
    delete _state.channels.claude;
    await ncp.refresh();
    const p = ncp.snapshot().providers.claude;
    assert.strictEqual(ct.compare(ct.parse('https://claude.ai/chat/abc-123'), p.chatId), 'unknown');
  });

  await new Promise(r => server.close(r));
  _log(`\n  ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { _log('FATAL', e); process.exit(1); });
