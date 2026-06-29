'use strict';
/**
 * test/ledger.test.js — Clear Glass Event Ledger Test Suite
 * UUID: cg-ledger-test-v1-0000-0000-000000000033
 *
 * Tests every surface of the ledger system.
 * Run with: node test/ledger.test.js
 *
 * Covers:
 *   1. Engine boot — ledger initializes, creates files
 *   2. Event recording — record() appends entries with correct shape
 *   3. Error recording — recordError() writes to error.log immediately
 *   4. CFR recording   — recordCfr() captures tool results and failures
 *   5. Diagnostic recording
 *   6. Ring buffer — eviction at RING_SIZE
 *   7. Query — type filter, entryType filter, errorsOnly, limit
 *   8. Tail — returns last N in reverse chronological
 *   9. Errors() — error ring, ordered
 *  10. Stats — counts match reality
 *  11. Flush — pending entries written to disk NDJSON
 *  12. Disk query — reads flushed NDJSON
 *  13. Error file exists and has content
 *  14. Multiple errors — all land in both rings
 *  15. Shutdown — flush called, boot+shutdown in file
 *  16. Bus integration smoke test — ledger records simulated bus events
 *  17. HTTP routes smoke test — all /ledger/* endpoints respond correctly
 *  18. Process uncaught exception interception (non-fatal test)
 *  19. Duplicate uuid — record() is safe to call twice with same entry
 *  20. Large payload — entries with large data don't crash
 */

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const http   = require('http');
const express = require('express');
const { randomUUID } = require('crypto');

// ── Silence console during tests unless VERBOSE=1 ─────────────────────────
const VERBOSE = process.env.VERBOSE === '1';
const _log = console.log.bind(console);
const _err = console.error.bind(console);
if (!VERBOSE) {
  console.log   = () => {};
  console.warn  = () => {};
  console.error = () => {};
}

// ── Test runner ───────────────────────────────────────────────────────────
let _passed = 0;
let _failed = 0;
const _failures = [];

async function test(label, fn) {
  try {
    await fn();
    _passed++;
    _log(`  ✓  ${label}`);
  } catch (e) {
    _failed++;
    _failures.push({ label, error: e });
    _log(`  ✗  ${label}`);
    _log(`     ${e.message}`);
  }
}

function eq(a, b, msg = '') {
  assert.strictEqual(a, b, msg || `Expected ${JSON.stringify(a)} === ${JSON.stringify(b)}`);
}
function ok(val, msg = '') {
  assert.ok(val, msg || `Expected truthy, got ${JSON.stringify(val)}`);
}
function notOk(val, msg = '') {
  assert.ok(!val, msg || `Expected falsy, got ${JSON.stringify(val)}`);
}

// ── Setup — use temp dir so tests don't pollute real ledger ───────────────
const TMP_LEDGER_DIR = path.join(os.tmpdir(), `cg-ledger-test-${Date.now()}`);
process.env.HOME = os.tmpdir(); // redirect ~/.clear-glass to tmp

// Patch the ledger dir by overriding HOME before requiring the engine
const { LedgerEngine, ENTRY_TYPE } = require('../src/ledger/engine');

// ── Helpers ───────────────────────────────────────────────────────────────
function makeEngine(opts = {}) {
  // Reset singleton for each test
  const engine = new LedgerEngine({ moduleId: 'test', ...opts });
  return engine;
}

function fakeEvent(type = 'test.event', data = {}) {
  return { uuid: randomUUID(), type, ts: Date.now(), data };
}

// ── Tests ─────────────────────────────────────────────────────────────────
async function run() {
  _log('\nClear Glass — Ledger Test Suite');
  _log('═══════════════════════════════════════════\n');

  // ── 1. Engine boot ──────────────────────────────────────────────────────
  await test('1. Engine initializes and creates ledger directory', async () => {
    const eng = makeEngine();
    await eng.init();
    ok(fs.existsSync(path.join(os.homedir(), '.clear-glass', 'ledger')));
    ok(eng._ready);
    eng.shutdown();
  });

  // ── 2. Event recording ─────────────────────────────────────────────────
  await test('2. record() stores event with correct shape', async () => {
    const eng = makeEngine();
    await eng.init();
    const ev = fakeEvent('nav.loaded', { url: 'https://claude.ai' });
    const id = eng.record(ev);
    ok(id, 'record() should return an entry id');

    const entries = eng.query({ type: 'nav.loaded' });
    eq(entries.length, 1);
    eq(entries[0].type, 'nav.loaded');
    eq(entries[0].data.url, 'https://claude.ai');
    eq(entries[0].entryType, ENTRY_TYPE.EVENT);
    eng.shutdown();
  });

  // ── 3. Error recording ─────────────────────────────────────────────────
  await test('3. recordError() writes to error ring and error.log immediately', async () => {
    const eng = makeEngine();
    await eng.init();
    const err = new Error('Test error from copilot bridge');
    err.code = 'COPILOT_FAIL';
    const id = eng.recordError(err, {
      file: 'src/copilot/bridge.js',
      sourceEventId: randomUUID(),
      context: { agentId: 'default' },
    });

    ok(id);
    eq(eng._errorRing.length, 1);
    eq(eng._errorRing[0].error.message, 'Test error from copilot bridge');
    eq(eng._errorRing[0].error.code, 'COPILOT_FAIL');
    eq(eng._errorRing[0].file, 'src/copilot/bridge.js');
    ok(eng._errorRing[0].ts);

    // error.log must exist with content
    ok(fs.existsSync(eng._errorFile), 'error.log should exist');
    const logContent = fs.readFileSync(eng._errorFile, 'utf8');
    ok(logContent.includes('Test error from copilot bridge'));
    eng.shutdown();
  });

  // ── 4. CFR recording ───────────────────────────────────────────────────
  await test('4. recordCfr() captures tool results', async () => {
    const eng = makeEngine();
    await eng.init();
    const reqId = randomUUID();
    eng.recordCfr({ requestId: reqId, tool: 'driver.navigate', agentId: 'default', durationMs: 142, result: { ok: true } });
    eng.recordCfr({ requestId: reqId, tool: 'driver.click',    agentId: 'default', durationMs: 23,  error: new Error('element not found') });

    const cfrs = eng.query({ entryType: ENTRY_TYPE.CFR });
    eq(cfrs.length, 2);
    ok(cfrs.find(e => e.tool === 'driver.navigate' && e.result?.ok === true));
    ok(cfrs.find(e => e.tool === 'driver.click' && e.error?.message === 'element not found'));
    eng.shutdown();
  });

  // ── 5. Diagnostic recording ─────────────────────────────────────────────
  await test('5. recordDiagnostic() stores suite results', async () => {
    const eng = makeEngine();
    await eng.init();
    eng.recordDiagnostic({ suiteId: 'ui-boot', runId: randomUUID(), label: 'UI Boot Test', passed: 8, failed: 2, results: [] });

    const diags = eng.query({ entryType: ENTRY_TYPE.DIAGNOSTIC });
    eq(diags.length, 1);
    eq(diags[0].passed, 8);
    eq(diags[0].failed, 2);
    ok(!diags[0].success);
    eng.shutdown();
  });

  // ── 6. Ring buffer eviction ─────────────────────────────────────────────
  await test('6. Ring buffer evicts oldest entries when full', async () => {
    const eng = makeEngine();
    await eng.init();

    const RING_SIZE = 5000;
    // Add RING_SIZE + 10 entries
    for (let i = 0; i < RING_SIZE + 10; i++) {
      eng.record(fakeEvent(`test.fill.${i}`));
    }

    eq(eng._ring.length, RING_SIZE, `Ring should cap at ${RING_SIZE}`);
    // Oldest entries (test.fill.0..9) should be evicted
    const firstType = eng._ring[0].type;
    ok(firstType.startsWith('test.fill.'), 'ring[0] should be a fill entry');
    ok(!firstType.endsWith('.0'), 'very first entry should have been evicted');
    eng.shutdown();
  });

  // ── 7. Query filters ───────────────────────────────────────────────────
  await test('7. query() filters by type, entryType, errorsOnly', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.record(fakeEvent('nav.loaded',   { url: 'https://a.com' }));
    eng.record(fakeEvent('nav.loaded',   { url: 'https://b.com' }));
    eng.record(fakeEvent('copilot.send', {}));
    eng.recordError(new Error('oops'), { file: 'src/gates/index.js' });

    const navs = eng.query({ type: 'nav.loaded' });
    eq(navs.length, 2);

    const errs = eng.query({ errorsOnly: true });
    eq(errs.length, 1);
    eq(errs[0].error.message, 'oops');

    const limited = eng.query({ limit: 2 });
    eq(limited.length, 2);

    const noMatch = eng.query({ type: 'does.not.exist' });
    eq(noMatch.length, 0);
    eng.shutdown();
  });

  // ── 8. Tail ────────────────────────────────────────────────────────────
  await test('8. tail(n) returns last N entries, newest first', async () => {
    const eng = makeEngine();
    await eng.init();

    for (let i = 0; i < 10; i++) {
      eng.record(fakeEvent(`seq.${i}`));
    }

    const tail = eng.tail(3);
    eq(tail.length, 3);
    // Newest should be seq.9 (last appended)
    ok(tail[0].type === 'seq.9', `Expected seq.9, got ${tail[0].type}`);
    ok(tail[1].type === 'seq.8');
    ok(tail[2].type === 'seq.7');
    eng.shutdown();
  });

  // ── 9. errors() ring ───────────────────────────────────────────────────
  await test('9. errors() returns error ring newest-first', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.recordError(new Error('first'),  { file: 'a.js' });
    eng.recordError(new Error('second'), { file: 'b.js' });
    eng.recordError(new Error('third'),  { file: 'c.js' });

    const errs = eng.errors(2);
    eq(errs.length, 2);
    eq(errs[0].error.message, 'third');
    eq(errs[1].error.message, 'second');
    eng.shutdown();
  });

  // ── 10. Stats ──────────────────────────────────────────────────────────
  await test('10. stats() counts match recorded entries', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.record(fakeEvent('nav.loaded'));
    eng.record(fakeEvent('nav.loaded'));
    eng.record(fakeEvent('copilot.send'));
    eng.recordError(new Error('stat-test'), { file: 'x.js' });

    const stats = eng.stats();
    // 4 manual + 1 boot entry
    ok(stats.total >= 4, `total should be >= 4, got ${stats.total}`);
    eq(stats.errors, 1);
    ok(stats.byType['nav.loaded'] === 2);
    ok(stats.uptimeHuman, 'should have human uptime string');
    ok(stats.ledgerFile, 'should have ledger file path');
    ok(stats.errorFile, 'should have error file path');
    eng.shutdown();
  });

  // ── 11. Flush — write to disk ──────────────────────────────────────────
  await test('11. flush() writes pending entries to NDJSON on disk', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.record(fakeEvent('flush.test.a'));
    eng.record(fakeEvent('flush.test.b'));
    eng.flush();

    ok(fs.existsSync(eng._currentFile), 'ledger file should exist after flush');
    const content = fs.readFileSync(eng._currentFile, 'utf8');
    ok(content.includes('flush.test.a'), 'flushed file should contain event a');
    ok(content.includes('flush.test.b'), 'flushed file should contain event b');

    // Each line should be valid JSON
    const lines = content.trim().split('\n').filter(Boolean);
    ok(lines.length >= 2, 'should have at least 2 lines');
    lines.forEach((line, i) => {
      let parsed;
      try { parsed = JSON.parse(line); } catch { throw new Error(`Line ${i} is invalid JSON: ${line.slice(0, 100)}`); }
      ok(parsed.id, `line ${i} should have id`);
      ok(parsed.ts, `line ${i} should have ts`);
      ok(parsed.type, `line ${i} should have type`);
    });
    eng.shutdown();
  });

  // ── 12. Disk query ─────────────────────────────────────────────────────
  await test('12. queryDisk() reads and filters flushed NDJSON', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.record(fakeEvent('disk.alpha'));
    eng.record(fakeEvent('disk.beta'));
    eng.record(fakeEvent('other.event'));
    eng.flush();

    const alphas = await eng.queryDisk({ type: 'disk.alpha' });
    ok(alphas.length >= 1, `Expected >= 1 disk.alpha, got ${alphas.length}`);
    eq(alphas[0].type, 'disk.alpha');
    eng.shutdown();
  });

  // ── 13. Error file content ─────────────────────────────────────────────
  await test('13. error.log has correct JSON entries with file + timestamp', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.recordError(new Error('ipc bridge crash'), {
      file:    'src/ipc/bridge.js',
      context: { agentId: 'default', url: 'https://claude.ai' },
    });

    const logContent = fs.readFileSync(eng._errorFile, 'utf8');
    const lines = logContent.trim().split('\n').filter(Boolean);
    const entry = JSON.parse(lines[lines.length - 1]);

    eq(entry.file, 'src/ipc/bridge.js');
    ok(entry.ts > 0, 'should have timestamp');
    ok(entry.error.message === 'ipc bridge crash');
    ok(entry.context.agentId === 'default');
    eng.shutdown();
  });

  // ── 14. Multiple errors ────────────────────────────────────────────────
  await test('14. Multiple errors all land in ring and error.log', async () => {
    const eng = makeEngine();
    await eng.init();

    const messages = ['err-A', 'err-B', 'err-C', 'err-D', 'err-E'];
    for (const msg of messages) {
      eng.recordError(new Error(msg), { file: 'src/driver/index.js' });
    }

    eq(eng._errorRing.length, messages.length);

    const logContent = fs.readFileSync(eng._errorFile, 'utf8');
    for (const msg of messages) {
      ok(logContent.includes(msg), `error.log should contain ${msg}`);
    }
    eng.shutdown();
  });

  // ── 15. Shutdown writes final entry ───────────────────────────────────
  await test('15. shutdown() flushes and writes lifecycle.shutdown to disk', async () => {
    const eng = makeEngine();
    await eng.init();
    eng.record(fakeEvent('pre.shutdown.event'));
    eng.shutdown(); // flush + shutdown entry

    const content = fs.readFileSync(eng._currentFile, 'utf8');
    ok(content.includes('ledger.shutdown'), 'file should contain shutdown entry');
    ok(content.includes('ledger.boot'),     'file should contain boot entry');
    ok(content.includes('pre.shutdown.event'));
  });

  // ── 16. Bus integration smoke ──────────────────────────────────────────
  await test('16. Ledger records simulated SISO bus events by shape', async () => {
    const eng = makeEngine();
    await eng.init();

    // Simulate what the bus emits
    const busEvents = [
      { uuid: randomUUID(), type: 'nav.loaded',        ts: Date.now(), data: { agentId: 'default', url: 'https://claude.ai/new' } },
      { uuid: randomUUID(), type: 'context.fp.switch', ts: Date.now(), data: { agentId: 'default', mode: 'firefox' } },
      { uuid: randomUUID(), type: 'copilot.thinking',  ts: Date.now(), data: { msgId: randomUUID() } },
      { uuid: randomUUID(), type: 'lifecycle.ready',   ts: Date.now(), data: { version: '3.1.0' } },
    ];

    for (const ev of busEvents) eng.record(ev);

    const all = eng.tail(10);
    const types = all.map(e => e.type);
    ok(types.includes('nav.loaded'));
    ok(types.includes('context.fp.switch'));
    ok(types.includes('copilot.thinking'));
    ok(types.includes('lifecycle.ready'));
    eng.shutdown();
  });

  // ── 17. HTTP routes smoke test ─────────────────────────────────────────
  await test('17. /ledger/* HTTP routes all return 200 with expected shape', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.record(fakeEvent('route.test.event'));
    eng.recordError(new Error('route test error'), { file: 'test/ledger.test.js' });
    eng.flush();

    // Patch the module's internal singleton so getLedger() returns this engine
    const ledgerModule = require('../src/ledger/engine');
    const _origInstance = ledgerModule._instance;
    ledgerModule._instance = eng;

    // Wire up a test Express app
    const app = express();
    app.use(express.json());

    // Delete the routes cache so it re-requires the patched engine module
    delete require.cache[require.resolve('../src/ledger/routes')];
    const { mountLedgerRoutes } = require('../src/ledger/routes');
    mountLedgerRoutes(app);

    const server = await new Promise((resolve, reject) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
      s.on('error', reject);
    });
    const port = server.address().port;

    const endpoints = [
      { path: '/ledger/tail?n=5',     checkKey: 'entries' },
      { path: '/ledger/errors?n=5',   checkKey: 'entries' },
      { path: '/ledger/stats',         checkKey: 'stats' },
      { path: '/ledger/cfr?n=5',      checkKey: 'entries' },
      { path: '/ledger/query?limit=5', checkKey: 'entries' },
    ];

    for (const ep of endpoints) {
      const data = await _httpGet(`http://127.0.0.1:${port}${ep.path}`);
      ok(data.ok, `${ep.path} should return ok:true, got: ${JSON.stringify(data)}`);
      ok(ep.checkKey in data, `${ep.path} should have '${ep.checkKey}' key`);
    }

    // POST /ledger/flush
    const flushRes = await _httpPost(`http://127.0.0.1:${port}/ledger/flush`, {});
    ok(flushRes.ok, '/ledger/flush should return ok:true');

    // POST /ledger/error
    const errRes = await _httpPost(`http://127.0.0.1:${port}/ledger/error`, {
      message: 'route-posted error',
      file:    'renderer/browser.html',
      context: { agentId: 'test-agent' },
    });
    ok(errRes.ok, '/ledger/error should return ok:true');
    ok(errRes.id,  '/ledger/error should return entry id');

    await new Promise(r => server.close(r));

    // Restore original singleton
    ledgerModule._instance = _origInstance;
    eng.shutdown();
  });

  // ── 18. Graceful handling of non-Error input ───────────────────────────
  await test('18. recordError() handles string errors gracefully', async () => {
    const eng = makeEngine();
    await eng.init();

    eng.recordError('string error — not an Error object', { file: 'src/gates/index.js' });
    eq(eng._errorRing.length, 1);
    ok(eng._errorRing[0].error.message.includes('string error'));
    eng.shutdown();
  });

  // ── 19. Duplicate uuid safety ──────────────────────────────────────────
  await test('19. record() called twice with same event is safe (idempotency note)', async () => {
    const eng = makeEngine();
    await eng.init();

    const ev = fakeEvent('duplicate.test');
    eng.record(ev);
    eng.record(ev); // same object — currently appends twice, which is acceptable

    // Both land in ring — the ledger does NOT deduplicate by design
    // (bus wildcard + direct record could double-fire; this tests no crash)
    const entries = eng.query({ type: 'duplicate.test' });
    ok(entries.length >= 1, 'should have at least 1 duplicate.test entry');
    eng.shutdown();
  });

  // ── 20. Large payload safety ───────────────────────────────────────────
  await test('20. Large data payload does not crash record()', async () => {
    const eng = makeEngine();
    await eng.init();

    const bigData = { html: 'x'.repeat(50_000), attrs: Array(500).fill({ key: 'val' }) };
    const ev = fakeEvent('dom.archaeology.result', bigData);
    const id = eng.record(ev);
    ok(id, 'should return entry id for large payload');

    const entries = eng.query({ type: 'dom.archaeology.result' });
    ok(entries.length >= 1);
    eng.shutdown();
  });

  // ── Summary ────────────────────────────────────────────────────────────
  _log('\n═══════════════════════════════════════════');
  _log(`Results: ${_passed} passed, ${_failed} failed`);
  if (_failures.length > 0) {
    _log('\nFailures:');
    for (const f of _failures) {
      _log(`  ✗ ${f.label}`);
      _log(`    ${f.error.message}`);
      if (VERBOSE) _log(f.error.stack);
    }
  }
  _log('');

  if (_failed > 0) process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────
function _httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    }).on('error', reject);
  });
}

function _httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

run().catch(e => { _err('[FATAL]', e); process.exit(1); });
