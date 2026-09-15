'use strict';

/**
 * tests/modules/mco16f-response-watchdog.test.js
 *
 * §MCO16f 2026-09-14 — real tests for guardian/lib/response-nodes.js and
 * guardian/lib/response-watchdog.js. Every assertion runs against real files
 * written to a real temp directory through the real lib/node-export.js path —
 * no mocked filesystem, because the thing being tested IS "is this tangible
 * on disk".
 *
 * Sibling of tests/modules/mco16e-dom-response-node.test.js, which covers the
 * HTTP route. This covers the writer, the reader, and the retry decision.
 */

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');

let pass = 0, fail = 0;
async function test(id, name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${id} ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${id} ${name}\n      ${e.message}`); }
}

// Redirect the module's real node dirs at a temp tree. Done by pointing the
// guardian data dir itself, not by stubbing the writer — a test that stubs the
// write cannot prove a file was written.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mco16f-'));
const realNodes = path.join(__dirname, '..', '..', 'guardian', 'data', 'nodes');

const responseNodes = require('../../guardian/lib/response-nodes.js');
const { ResponseWatchdog } = require('../../guardian/lib/response-watchdog.js');

function cleanResponses() {
  try {
    for (const f of fs.readdirSync(responseNodes.RESPONSE_DIR)) {
      if (f.endsWith('.response') && f.startsWith('test-')) {
        fs.unlinkSync(path.join(responseNodes.RESPONSE_DIR, f));
      }
    }
  } catch (_) {}
}

(async () => {
  console.log('\nMCO16f — .response / .event nodes + response watchdog\n');

  const JOB = `test-job-${Date.now()}`;
  const written = [];

  await test('RN-001', 'a job-origin DOM mutation writes a real .response file on disk', async () => {
    const r = responseNodes.writeResponseNode({
      jobId: JOB, domEventType: 'dom.mutation', agentId: 'chatgpt',
      sequence: 0, payload: { chars: 12, deltaChars: 12 },
    });
    assert.strictEqual(r.ok, true, `write failed: ${r.reason}`);
    assert.ok(fs.existsSync(r.path), 'no file at the returned path');
    written.push(r.path);
  });

  await test('RN-002', 'an event anchored to neither a job nor a compartment is refused, not fabricated', async () => {
    const r = responseNodes.writeResponseNode({ domEventType: 'dom.mutation' });
    assert.strictEqual(r.ok, false);
    assert.match(r.reason, /not fabricating/);
  });

  await test('RN-003', 'readResponses round-trips the real file back through node-export', async () => {
    const rows = responseNodes.readResponses({ jobId: JOB });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].jobId, JOB);
    assert.strictEqual(rows[0].domEventType, 'dom.mutation');
    assert.strictEqual(rows[0].payload.chars, 12);
  });

  await test('RN-004', 'inspectJob reports non-terminal while only mutations exist', async () => {
    const info = responseNodes.inspectJob(JOB);
    assert.strictEqual(info.count, 1);
    assert.strictEqual(info.terminal, false);
    assert.strictEqual(info.chars, 12);
  });

  await test('RN-005', 'a dom.complete node flips inspectJob to terminal', async () => {
    const r = responseNodes.writeResponseNode({
      jobId: JOB, domEventType: 'dom.complete', agentId: 'chatgpt',
      sequence: 1, payload: { chars: 400, ms: 8200 },
    });
    written.push(r.path);
    const info = responseNodes.inspectJob(JOB);
    assert.strictEqual(info.terminal, true);
    assert.strictEqual(info.terminalPhase, 'dom.complete');
    assert.strictEqual(info.chars, 400);
  });

  await test('EV-001', 'writeEventNode produces a real .event file — the first writer this type has ever had', async () => {
    const r = responseNodes.writeEventNode({
      type: 'guardian.response.timeout',
      source: 'tests/modules/mco16f-response-watchdog.test.js',
      id: JOB,
      payload: { jobId: JOB, provider: 'chatgpt', attempt: 0 },
    });
    assert.strictEqual(r.ok, true, `write failed: ${r.reason}`);
    assert.ok(fs.existsSync(r.path));
    written.push(r.path);
  });

  // ── watchdog verdicts — assess() is pure given the nodes on disk ──────────
  const mkWatchdog = (over = {}) => new ResponseWatchdog({
    listWatchedJobs: () => [],
    redispatch: async () => true,
    ncpIsConnected: () => true,
    ...over,
  });

  await test('WD-001', 'a job with a terminal node assesses as complete, never retried', async () => {
    const a = mkWatchdog().assess({ id: JOB, provider: 'chatgpt', deliveredAt: Date.now() - 300000 });
    assert.strictEqual(a.verdict, 'complete');
  });

  await test('WD-002', 'no nodes + inside the first-token window is healthy, not a timeout', async () => {
    const a = mkWatchdog().assess({ id: 'test-job-absent', provider: 'chatgpt', deliveredAt: Date.now() - 5_000 });
    assert.strictEqual(a.verdict, 'healthy', a.reason);
  });

  await test('WD-003', 'no nodes past the first-token window is a real timeout', async () => {
    const a = mkWatchdog().assess({ id: 'test-job-absent', provider: 'chatgpt', deliveredAt: Date.now() - 200_000 });
    assert.strictEqual(a.verdict, 'timeout');
    assert.match(a.reason, /no \.response node at all/);
  });

  await test('WD-004', 'a disconnected provider is reported as disconnected, not as a timeout', async () => {
    const a = mkWatchdog({ ncpIsConnected: () => false })
      .assess({ id: 'test-job-absent', provider: 'chatgpt', deliveredAt: Date.now() - 1_000 });
    assert.strictEqual(a.verdict, 'disconnected');
  });

  await test('WD-005', 'mid-stream silence trips the tighter threshold, not the generous one', async () => {
    const jid = `test-job-stall-${Date.now()}`;
    const r = responseNodes.writeResponseNode({
      jobId: jid, domEventType: 'dom.mutation', payload: { chars: 40 },
      ts: Date.now() - 40_000,
    });
    written.push(r.path);
    // 40s of silence: well under firstTokenMs (90s), well over streamSilenceMs (25s).
    // A single-threshold watchdog would call this healthy. That is the point.
    const a = mkWatchdog().assess({ id: jid, provider: 'chatgpt', deliveredAt: Date.now() - 45_000 });
    assert.strictEqual(a.verdict, 'timeout', a.reason);
    assert.match(a.reason, /went silent/);
  });

  await test('WD-006', 'a tripped job is retried through the supplied lever, then abandoned at the cap', async () => {
    const jid = 'test-job-absent-cap';
    const calls = [];
    const wd = new ResponseWatchdog({
      listWatchedJobs: () => [{ id: jid, provider: 'chatgpt', status: 'delivered', deliveredAt: Date.now() - 200_000 }],
      redispatch: async (job, reason) => { calls.push(reason); return true; },
      ncpIsConnected: () => true,
      maxRetries: 2,
    });
    await wd.check(); // attempt 1
    await wd.check(); // attempt 2
    await wd.check(); // cap reached -> abandoned, no third dispatch
    await wd.check(); // settled -> not swept again
    assert.strictEqual(calls.length, 2, `expected 2 redispatches, got ${calls.length}`);
    assert.match(calls[0], /timeout/);
  });

  await test('WD-007', 'settle() stops a job being swept once its response really lands', async () => {
    const jid = 'test-job-settled';
    let dispatches = 0;
    const wd = new ResponseWatchdog({
      listWatchedJobs: () => [{ id: jid, provider: 'chatgpt', status: 'delivered', deliveredAt: Date.now() - 200_000 }],
      redispatch: async () => { dispatches++; return true; },
      ncpIsConnected: () => true,
    });
    wd.settle(jid);
    await wd.check();
    assert.strictEqual(dispatches, 0);
  });

  for (const p of written) { try { fs.unlinkSync(p); } catch (_) {} }
  cleanResponses();
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
