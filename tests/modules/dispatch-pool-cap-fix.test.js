'use strict';
/**
 * tests/modules/dispatch-pool-cap-fix.test.js — 2026-06-27 urgent fix
 *
 * Proves the actual claim: claude/chatgpt now cap at 1 in-flight request,
 * not 3 — the confirmed cause of the live NCP flapping (3 disconnects/60s,
 * repeating, observed in a real boot log) was 3 concurrent requests racing
 * one browser tab's single connection.
 */
const assert = require('assert');
const { DispatchPool } = require('../../lib/dispatch-pool');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

console.log('\n── Urgent fix: dispatch-pool concurrency cap (NCP flapping) ──\n');

test('DPC-01', 'claude caps at 1, not the old 3', () => {
  const pool = new DispatchPool();
  assert.strictEqual(pool.cap('claude'), 1, 'claude must cap at 1 — one tab, one generation at a time');
});

test('DPC-02', 'chatgpt caps at 1, not the old 3', () => {
  const pool = new DispatchPool();
  assert.strictEqual(pool.cap('chatgpt'), 1);
});

test('DPC-03', 'ollama is untouched — still 8, never the source of the flapping', () => {
  const pool = new DispatchPool();
  assert.strictEqual(pool.cap('ollama'), 8, 'ollama is a real local service, not a browser tab — should not have been capped down');
});

test('DPC-04', 'after one claude job dispatches, claude has zero slots available — proving the cap is actually enforced', () => {
  const pool = new DispatchPool();
  const r1 = pool.enqueue('claude', { id: 'job1', provider: 'claude' }, () => {});
  assert.strictEqual(r1.dispatched, true, 'first job should dispatch immediately — a fresh tab has a free slot');
  assert.strictEqual(pool.available('claude'), 0, 'with cap=1, claude must show zero availability the instant one job is in flight — this is what stops a second concurrent request from racing the same tab');
});

console.log(`\n  ${passed}/${passed + failed} passed\n`);
if (failed > 0) process.exit(1);
