'use strict';

/**
 * tests/modules/ncp-dispatch-target.test.js
 *
 * §MCO-NCP-FANOUT 2026-09-13 — real, pure tests for guardian/lib/
 * ncp-dispatch-target.js's selectDispatchTarget().
 */

const assert = require('assert');
const { selectDispatchTarget } = require('../../guardian/lib/ncp-dispatch-target.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

test('NCPT-001: zero clients is refused, not fabricated', () => {
  const r = selectDispatchTarget([]);
  assert.strictEqual(r.ok, false);
});

test('NCPT-002: null/undefined clients is handled without throwing', () => {
  assert.strictEqual(selectDispatchTarget(null).ok, false);
  assert.strictEqual(selectDispatchTarget(undefined).ok, false);
});

test('NCPT-003: a single connected client is picked directly', () => {
  const r = selectDispatchTarget([{ tabId: 't1', claimed: false, lastHeartbeat: 100 }]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't1');
  assert.strictEqual(r.ambiguous, undefined);
});

test('NCPT-004: exactly one claimed client among several unclaimed wins, not ambiguous', () => {
  const r = selectDispatchTarget([
    { tabId: 't1', claimed: false, lastHeartbeat: 300 },
    { tabId: 't2', claimed: true, lastHeartbeat: 100 },
    { tabId: 't3', claimed: false, lastHeartbeat: 200 },
  ]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't2');
  assert.strictEqual(r.ambiguous, undefined);
});

test('NCPT-005: multiple claimed clients picks the freshest heartbeat and flags ambiguous', () => {
  const r = selectDispatchTarget([
    { tabId: 't1', claimed: true, lastHeartbeat: 100 },
    { tabId: 't2', claimed: true, lastHeartbeat: 500 },
  ]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't2');
  assert.strictEqual(r.ambiguous, 'multiple_claimed');
  assert.strictEqual(r.candidateCount, 2);
});

test('NCPT-006: multiple unclaimed clients picks the freshest heartbeat and flags ambiguous', () => {
  const r = selectDispatchTarget([
    { tabId: 't1', claimed: false, lastHeartbeat: 900 },
    { tabId: 't2', claimed: false, lastHeartbeat: 100 },
    { tabId: 't3', claimed: false, lastHeartbeat: 500 },
  ]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't1');
  assert.strictEqual(r.ambiguous, 'multiple_unclaimed');
  assert.strictEqual(r.candidateCount, 3);
});

test('NCPT-007: a client with no real tabId is filtered out, never selected', () => {
  const r = selectDispatchTarget([{ claimed: true, lastHeartbeat: 100 }, { tabId: 't2', claimed: false, lastHeartbeat: 50 }]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't2');
});

test('NCPT-008: missing lastHeartbeat values are treated as 0, never throwing during sort', () => {
  const r = selectDispatchTarget([
    { tabId: 't1', claimed: false },
    { tabId: 't2', claimed: false, lastHeartbeat: 5 },
  ]);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.tabId, 't2');
});

console.log(`\n  ncp-dispatch-target: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
