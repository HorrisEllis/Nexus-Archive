'use strict';

/**
 * tests/modules/mco23-guardian-response-abandoned-wiring.test.js
 *
 * §MCO23 2026-09-15 — James, live, watching a real dispatch fail in the
 * floating menu's CO-PILOT panel: "something is broken in the pipeline.
 * supposed to be events to make it more explicit in the backend."
 *
 * Traced two real, separate gaps in the same failure path:
 *
 *   1. guardian/lib/response-watchdog.js's terminal
 *      'guardian.response.abandoned' event (fired once retries are
 *      exhausted) was busEmit-only — nothing consumed it. It never
 *      flipped the job's own status (stayed 'delivered' forever, in
 *      memory AND in the persisted jaa jobs row), never fed RAID
 *      (_feedRaid only runs off 'guardian.job.error', which this never
 *      emitted), and no GET /stream/:jobId listener ever heard it.
 *      guardian/server.js's OTHER terminal-failure call sites (e.g.
 *      guardian/lib/ncp-handler.js's GUARDIAN_ERROR/NCP_ERROR case) all
 *      follow the same real 3-step convention — updateJob(status:'error')
 *      + bus.emit('guardian.job.error') + cockpitBroadcast — together;
 *      this is the one path that skipped all three.
 *
 *   2. copilot/tool-runtime.js's final NCP-no-response fallback captured
 *      the real, specific reason (guardian/ask.js's own timeout message,
 *      or now the watchdog's real diagnosis) in the gap's own meta, but
 *      the TEXT actually shown to the person only ever said the generic
 *      sentinel with a bare gap id — the real reason was recorded but
 *      never surfaced.
 *
 * Same real, established pattern this test suite already uses for
 * server.js-embedded fixes with heavy live side effects (see
 * tests/modules/copilot-provider-toggle.test.js) — a structural check
 * against the real shipped source, not a live boot of guardian's full
 * server (jaa store, NCP channel, cockpit broadcast, etc).
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const SERVER_SRC = fs.readFileSync(path.join(ROOT, 'guardian/server.js'), 'utf8');
const TOOL_RUNTIME_SRC = fs.readFileSync(path.join(ROOT, 'copilot/tool-runtime.js'), 'utf8');

test('T-001', "guardian/server.js registers a real listener for 'guardian.response.abandoned' after the watchdog starts", () => {
  const startIdx = SERVER_SRC.indexOf('_responseWatchdog.start();');
  assert.ok(startIdx > -1, 'expected the real _responseWatchdog.start() call site — has it moved?');
  const listenerIdx = SERVER_SRC.indexOf("bus.on('guardian.response.abandoned'", startIdx);
  assert.ok(listenerIdx > -1, "expected a real bus.on('guardian.response.abandoned', ...) registered after the watchdog starts");
});

test('T-002', "the abandoned-job listener calls the real updateJob(...,{status:'error'}) — the same terminal-status convention every other failure path uses", () => {
  const idx = SERVER_SRC.indexOf("bus.on('guardian.response.abandoned'");
  const block = SERVER_SRC.slice(idx, idx + 500);
  assert.ok(/updateJob\(data\.jobId,\s*\{\s*status:\s*'error'/.test(block), `expected updateJob(data.jobId, { status: 'error', ... }) in: ${block}`);
});

test('T-003', "the abandoned-job listener re-emits the real 'guardian.job.error' event — the one _feedRaid (RAID learning) and GET /stream/:jobId listeners actually consume", () => {
  const idx = SERVER_SRC.indexOf("bus.on('guardian.response.abandoned'");
  const block = SERVER_SRC.slice(idx, idx + 500);
  assert.ok(/bus\.emit\('guardian\.job\.error',/.test(block), `expected a real bus.emit('guardian.job.error', ...) in: ${block}`);
});

test('T-004', 'the abandoned-job listener also calls the real cockpitBroadcast — the third leg of the same convention (see ncp-handler.js GUARDIAN_ERROR case)', () => {
  const idx = SERVER_SRC.indexOf("bus.on('guardian.response.abandoned'");
  const block = SERVER_SRC.slice(idx, idx + 500);
  assert.ok(/cockpitBroadcast\(\{\s*type:\s*'job\.error'/.test(block), `expected cockpitBroadcast({ type: 'job.error', ... }) in: ${block}`);
});

test('T-005', "'guardian.job.error' already real-feeds RAID via _feedRaid(ok:false) — confirms the listener actually reaches a real consumer, not a dead end of its own", () => {
  const gateIdx = SERVER_SRC.indexOf("new SISOGate('guardian.job.error'");
  assert.ok(gateIdx > -1, "expected the real guardian.job.error SISOGate to still exist");
  const block = SERVER_SRC.slice(gateIdx, gateIdx + 200);
  assert.ok(/_feedRaid\(data\.provider \|\| 'claude', false, 0\)/.test(block), `expected the real _feedRaid(...,false,...) call in: ${block}`);
});

test('T-006', "the fix reads data.reason with a real fallback string, never assumes the watchdog payload always carries one", () => {
  const idx = SERVER_SRC.indexOf("bus.on('guardian.response.abandoned'");
  const block = SERVER_SRC.slice(idx, idx + 500);
  assert.ok(/data\.reason \|\| `no response after/.test(block), `expected a real fallback reason string in: ${block}`);
});

// ── copilot/tool-runtime.js — the other half: surfacing the real reason ──
test('T-007', 'the NCP no-response fallback now includes the real result.error detail in the visible text, not just in the gap meta', () => {
  const idx = TOOL_RUNTIME_SRC.indexOf('NCP dispatch failed — no response${detail}');
  assert.ok(idx > -1, 'expected the real fallback text to interpolate a computed `detail` string');
  const before = TOOL_RUNTIME_SRC.slice(Math.max(0, idx - 400), idx);
  assert.ok(/const detail = \(result && result\.error\)/.test(before), `expected detail to be computed from result.error before: ${before}`);
});

test('T-008', 'the gap-report branch (which already captures resultError in meta) still runs before the now-improved visible text is built — the detail is additive, not a replacement for the gap record', () => {
  const gapReportIdx = TOOL_RUNTIME_SRC.indexOf("type: 'copilot.ncp-dispatch-no-response'");
  const detailIdx = TOOL_RUNTIME_SRC.indexOf('const detail = (result && result.error)');
  assert.ok(gapReportIdx > -1 && detailIdx > -1 && gapReportIdx < detailIdx, 'expected the gap report to still be built before the visible detail string');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
