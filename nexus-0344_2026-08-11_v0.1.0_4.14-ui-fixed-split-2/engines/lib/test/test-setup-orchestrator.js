'use strict';
const assert = require('assert');
const { runSteps, createIpDebouncer } = require('../setup-orchestrator');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ok  — ${name}`); }
  catch (e) { fail++; console.log(`FAIL  — ${name}\n        ${e.stack}`); }
}
async function atest(name, fn) {
  try { await fn(); pass++; console.log(`  ok  — ${name}`); }
  catch (e) { fail++; console.log(`FAIL  — ${name}\n        ${e.stack}`); }
}

function mkStep(key, ok = true, calls) {
  return { key, run: async () => { if (calls) calls.push(key); return { ok, detail: ok ? 'done' : 'boom' }; } };
}

console.log('setup-orchestrator.js — tests\n');

(async () => {

await atest('fresh run: all steps execute in order, state marks success', async () => {
  const calls = [];
  const steps = [mkStep('upnp', true, calls), mkStep('sysfw', true, calls), mkStep('glue', true, calls), mkStep('tls', true, calls)];
  const state = {};
  const r = await runSteps(steps, state, { currentIp: '1.2.3.4' }, () => {});
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(calls, ['upnp', 'sysfw', 'glue', 'tls']);
  assert.strictEqual(state.lastSuccessfulRun.ok, true);
  assert.strictEqual(state.lastKnownIp, '1.2.3.4');
  assert.strictEqual(state.currentStep, null);
});

await atest('re-run on the SAME ip skips already-succeeded steps (idempotency)', async () => {
  const calls = [];
  const steps = [mkStep('upnp', true, calls), mkStep('sysfw', true, calls)];
  // realistic fixture: a real run stores the FULL result object per step,
  // not a bare boolean — this shape mismatch is exactly what slipped past
  // an earlier, looser version of this test and caused a live bug.
  const state = { lastSuccessfulRun: { ip: '1.2.3.4', ok: true, steps: { upnp: { ok: true, detail: 'done' }, sysfw: { ok: true, detail: 'done' } } } };
  const r = await runSteps(steps, state, { currentIp: '1.2.3.4' }, () => {});
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(calls, [], 'nothing should have actually run — both already succeeded for this IP');
  assert.strictEqual(r.results.upnp.skipped, true);
});

await atest('re-run on a DIFFERENT ip does NOT skip — new IP means steps need re-verification', async () => {
  const calls = [];
  const steps = [mkStep('glue', true, calls), mkStep('tls', true, calls)];
  const state = { lastSuccessfulRun: { ip: '1.2.3.4', ok: true, steps: { glue: { ok: true }, tls: { ok: true } } } };
  const r = await runSteps(steps, state, { currentIp: '9.9.9.9' }, () => {});
  assert.deepStrictEqual(calls, ['glue', 'tls'], 'IP changed — must actually re-run, not trust stale success');
});

await atest('force=true re-runs everything even on the same IP', async () => {
  const calls = [];
  const steps = [mkStep('upnp', true, calls)];
  const state = { lastSuccessfulRun: { ip: '1.2.3.4', ok: true, steps: { upnp: { ok: true } } } };
  await runSteps(steps, state, { currentIp: '1.2.3.4', force: true }, () => {});
  assert.deepStrictEqual(calls, ['upnp']);
});

await atest('a failing step halts the run and does NOT cascade into later steps', async () => {
  const calls = [];
  const steps = [mkStep('upnp', true, calls), mkStep('glue', false, calls), mkStep('tls', true, calls)];
  const state = {};
  const r = await runSteps(steps, state, { currentIp: '1.2.3.4' }, () => {});
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.failedAt, 'glue');
  assert.deepStrictEqual(calls, ['upnp', 'glue'], 'tls must never have been attempted after glue failed');
  assert.strictEqual(state.currentStep, 'glue', 'currentStep must point at the failure for resume');
  assert.strictEqual(state.lastSuccessfulRun.ok, false);
});

await atest('resume (startFrom) picks up exactly at the failed step, does not redo earlier work', async () => {
  const calls = [];
  const steps = [mkStep('upnp', true, calls), mkStep('glue', true, calls), mkStep('tls', true, calls)];
  // simulate: upnp already ran in a prior crashed attempt, currentStep left at 'glue'
  const state = { currentStep: 'glue', lastSuccessfulRun: null };
  const r = await runSteps(steps, state, { currentIp: '1.2.3.4', startFrom: 'glue' }, () => {});
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(calls, ['glue', 'tls'], 'upnp must be skipped on resume — it already ran before the crash');
});

await atest('an exception thrown inside a step is caught and treated as a normal failure, not a crash', async () => {
  const steps = [{ key: 'glue', run: async () => { throw new Error('network exploded'); } }];
  const state = {};
  const r = await runSteps(steps, state, { currentIp: '1.2.3.4' }, () => {});
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.results.glue.detail, 'network exploded');
});

await atest('persist() is called after every step, not just at the end — crash mid-run has a recent snapshot', async () => {
  const persistCalls = [];
  const steps = [mkStep('a'), mkStep('b'), mkStep('c')];
  await runSteps(steps, {}, { currentIp: '1.2.3.4' }, (s) => persistCalls.push(s.currentStep));
  assert.deepStrictEqual(persistCalls, ['a', 'b', 'c', null]);
});

// ─── debouncer ────────────────────────────────────────────────────────────────

await atest('debouncer only fires once after the IP has been stable, not on every flap', async () => {
  let settledWith = null, settledCount = 0;
  const d = createIpDebouncer(30, ip => { settledWith = ip; settledCount++; });
  d.notify('1.1.1.1');
  await new Promise(r => setTimeout(r, 10));
  d.notify('2.2.2.2'); // flap before settling — should reset the timer
  await new Promise(r => setTimeout(r, 10));
  d.notify('3.3.3.3'); // flap again
  await new Promise(r => setTimeout(r, 50)); // now let it actually settle
  assert.strictEqual(settledCount, 1, 'must fire exactly once despite 3 rapid changes');
  assert.strictEqual(settledWith, '3.3.3.3', 'must fire with the LAST (settled) ip, not an intermediate flap');
});

await atest('debouncer cancel() prevents a pending fire', async () => {
  let fired = false;
  const d = createIpDebouncer(20, () => { fired = true; });
  d.notify('1.1.1.1');
  d.cancel();
  await new Promise(r => setTimeout(r, 40));
  assert.strictEqual(fired, false);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
})();
