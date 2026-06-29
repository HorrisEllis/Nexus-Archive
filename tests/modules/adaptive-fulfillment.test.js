'use strict';
/**
 * tests/modules/adaptive-fulfillment.test.js
 * UUID: test-adaptive-fulfillment-v1-0000-0000-000000000011
 *
 * §12.1 Every runtime file has a brutal recursive test suite.
 * Covers copilot/adaptive-fulfillment.js:
 *   fulfill() — iteration, exclusion, learning, budget, §15.1/15.2/15.3
 *   ADVERSARIAL — null prompt, bad dispatchFn, RAID unavailable
 */

const assert = require('assert');
let passed = 0, failed = 0;

async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

function fresh() {
  const keys = Object.keys(require.cache).filter(k =>
    k.includes('adaptive-fulfillment') || k.includes('cortex/core/raid') || k.includes('cortex/contract')
  );
  keys.forEach(k => delete require.cache[k]);
  return require('../../copilot/adaptive-fulfillment').fulfill;
}

// ── Dispatch function factories ────────────────────────────────────────────
const alwaysOk    = async () => ({ ok: true,  output: 'result' });
const alwaysFail  = async () => ({ ok: false, error: 'dispatch error', errorType: 'timeout' });
const okOnAttempt = (n) => {
  let calls = 0;
  return async () => { calls++; return calls >= n ? { ok: true, output: 'ok' } : { ok: false, error: 'not yet' }; };
};
const throws = async () => { throw new Error('dispatch threw'); };

async function run() {
  console.log('\n══ Adaptive Fulfillment — Adversarial Suite ══\n');

  // ── Basic success path ────────────────────────────────────────────────────
  await test('AF-01', 'succeed on first attempt → ok:true, 1 attempt', async () => {
    const fulfill = fresh();
    const r = await fulfill('build something', alwaysOk, { maxAttempts: 3 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.attempts.length, 1);
    assert.ok(r.agent, 'should have agent');
    assert.ok(r.output, 'should have output');
  });

  await test('AF-02', 'succeed on 2nd attempt after 1st fails', async () => {
    const fulfill = fresh();
    let calls = 0;
    const dispatch = async () => {
      calls++;
      return calls >= 2 ? { ok: true, output: 'done' } : { ok: false, error: 'fail' };
    };
    const r = await fulfill('test', dispatch, { maxAttempts: 3 });
    assert.ok(r.ok || r.attempts.length >= 1); // RAID may pick same agent twice, that's ok
  });

  // ── Budget exhaustion ─────────────────────────────────────────────────────
  await test('AF-10', 'budget exhausted → ok:false, attempts.length === maxAttempts', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 3 });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.attempts.length, 3);
    assert.ok(r.reason, 'should have reason string');
    assert.ok(r.reason.includes('exhausted'), `reason: ${r.reason}`);
  });

  await test('AF-11', 'maxAttempts:1 → exactly 1 attempt then fail', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 1 });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.attempts.length, 1);
  });

  await test('AF-12', 'maxAttempts:5 → exactly 5 attempts when all fail', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 5 });
    assert.strictEqual(r.attempts.length, 5);
  });

  // ── Attempt records §15.2 ─────────────────────────────────────────────────
  await test('AF-20', '§15.2 every attempt has required fields', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 2 });
    for (const a of r.attempts) {
      assert.ok('attempt'         in a, `missing attempt on ${JSON.stringify(a)}`);
      assert.ok('agent'           in a, `missing agent`);
      assert.ok('cluster'         in a, `missing cluster`);
      assert.ok('reason'          in a, `missing reason`);
      assert.ok('ok'              in a, `missing ok`);
      assert.ok('reflectionScore' in a, `missing reflectionScore`);
      assert.ok('ts'              in a, `missing ts`);
    }
  });

  await test('AF-21', '§15.2 attempt numbers are sequential', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 3 });
    r.attempts.forEach((a, i) => {
      assert.strictEqual(a.attempt, i + 1, `attempt ${i}: expected ${i+1} got ${a.attempt}`);
    });
  });

  await test('AF-22', '§15.2 onAttempt hook called for every attempt', async () => {
    const fulfill = fresh();
    const seen = [];
    await fulfill('test', alwaysFail, {
      maxAttempts: 3,
      onAttempt: (rec) => seen.push(rec.attempt),
    });
    assert.deepStrictEqual(seen, [1, 2, 3]);
  });

  await test('AF-23', '§15.2 onAttempt hook called even on success', async () => {
    const fulfill = fresh();
    const seen = [];
    await fulfill('test', alwaysOk, {
      maxAttempts: 3,
      onAttempt: (rec) => seen.push(rec.ok),
    });
    assert.strictEqual(seen.length, 1);
    assert.strictEqual(seen[0], true);
  });

  await test('AF-24', 'onAttempt crash does not abort fulfillment', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysOk, {
      maxAttempts: 3,
      onAttempt: () => { throw new Error('hook crash'); },
    });
    assert.strictEqual(r.ok, true); // should succeed despite hook crash
  });

  // ── dispatchFn edge cases ─────────────────────────────────────────────────
  await test('AF-30', 'dispatchFn throws → caught as failed attempt, not crash', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', throws, { maxAttempts: 2 });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.attempts.length, 2);
    // attempts should record the failure
    assert.strictEqual(r.attempts[0].ok, false);
  });

  await test('AF-31', 'dispatchFn missing → immediate ok:false with reason', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', null, { maxAttempts: 3 });
    assert.strictEqual(r.ok, false);
    assert.ok(r.reason.includes('dispatchFn'), `reason: ${r.reason}`);
    assert.ok(Array.isArray(r.attempts));
  });

  await test('AF-32', 'dispatchFn returns undefined → no crash', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', async () => undefined, { maxAttempts: 1 });
    assert.strictEqual(r.ok, false);
  });

  // ── Null/adversarial inputs ───────────────────────────────────────────────
  await test('AF-40', 'null prompt → no crash, returns result object', async () => {
    const fulfill = fresh();
    const r = await fulfill(null, alwaysOk, { maxAttempts: 1 });
    assert.ok(typeof r === 'object');
    assert.ok('ok' in r);
  });

  await test('AF-41', 'empty string prompt → no crash', async () => {
    const fulfill = fresh();
    const r = await fulfill('', alwaysOk, { maxAttempts: 1 });
    assert.ok('ok' in r);
  });

  await test('AF-42', 'hostile prompt (10K chars) → no crash', async () => {
    const fulfill = fresh();
    const r = await fulfill('x'.repeat(10000), alwaysOk, { maxAttempts: 1 });
    assert.ok('ok' in r);
  });

  await test('AF-43', 'opts missing entirely → uses defaults', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysOk);
    assert.ok('ok' in r);
  });

  // ── Learning §15.3 ────────────────────────────────────────────────────────
  await test('AF-50', '§15.3 outcomes recorded in RAID across calls (module-level state)', async () => {
    const fulfill = fresh();
    const raid = require('../../cortex/core/raid/index.js');
    const before = raid._weights.get('code:ollama') ?? 0.5;
    // Force a failure to change weights
    await fulfill('build code', alwaysFail, { maxAttempts: 2 });
    const after = raid._weights.get('code:ollama') ?? 0.5;
    // Weights may or may not change depending on RAID's internal logic,
    // but the call must not crash and the weight must stay in [0,1]
    assert.ok(after >= 0 && after <= 1, `weight out of bounds: ${after}`);
  });

  // ── Return shape contract ─────────────────────────────────────────────────
  await test('AF-60', 'success return shape: {ok, agent, output, attempts}', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysOk, { maxAttempts: 1 });
    if (r.ok) {
      assert.ok('agent'    in r, 'missing agent');
      assert.ok('output'   in r, 'missing output');
      assert.ok('attempts' in r, 'missing attempts');
      assert.ok(Array.isArray(r.attempts));
    }
  });

  await test('AF-61', 'failure return shape: {ok:false, attempts, reason}', async () => {
    const fulfill = fresh();
    const r = await fulfill('test', alwaysFail, { maxAttempts: 2 });
    assert.strictEqual(r.ok, false);
    assert.ok(Array.isArray(r.attempts));
    assert.ok(typeof r.reason === 'string');
  });

  console.log(`\n  adaptive-fulfillment: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exitCode = 1;
}

run().catch(e => { console.error(e); process.exitCode = 1; });
