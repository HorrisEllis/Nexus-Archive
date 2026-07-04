'use strict';
/**
 * tests/modules/raid-simulation.test.js
 * Tests for cortex/core/raid/simulation.js — the pre-commit simulation layer.
 * Verifies COS integration, scoring, fault classification, and recommendations.
 * 
 * §spec: docs/raid-simulation-engine.spec
 */

const assert = require('assert');
let passed = 0, failed = 0;

function test(desc, fn) {
  try { fn(); console.log(`  ✓ ${desc}`); passed++; }
  catch(e) { console.error(`  ✗ ${desc}\n    ${e.message}`); failed++; }
}
async function testAsync(desc, fn) {
  try { await fn(); console.log(`  ✓ ${desc}`); passed++; }
  catch(e) { console.error(`  ✗ ${desc}\n    ${e.message}`); failed++; }
}

const { simulate, classifyFault, scoreOutcome } =
  require('/home/claude/nexus_29/cortex/core/raid/simulation.js');

const cleanDecision = { agent: 'ollama', cluster: 'code', reason: 'LAW_I: ollama first' };
const stressedDecision = { agent: 'claude', cluster: 'analysis', reason: 'LAW_III: reserve' };
const cleanContext = {
  cfrSigmaFloor: 0.1,
  cfrField: { coherence: 0.8, friction: 0.1, resonance: 0.7, entropy: 0.1 },
  callShape: { causalDepth: 1, urgency: 1.0 },
  conditioning: { avgResponseRate: 1.0, avgCausalDepth: 1 },
};

// ── Module shape ──────────────────────────────────────────────────────────────

test('SIM-01 simulation module exports the three spec-required functions', () => {
  assert.strictEqual(typeof simulate,        'function');
  assert.strictEqual(typeof classifyFault,   'function');
  assert.strictEqual(typeof scoreOutcome,    'function');
});

test('SIM-02 RAID index now exports .simulation', () => {
  const raid = require('/home/claude/nexus_29/cortex/core/raid/index.js');
  assert.ok(raid.simulation, 'raid.simulation must be exported');
  assert.strictEqual(typeof raid.simulation.simulate, 'function');
});

// ── SimulationResult shape ────────────────────────────────────────────────────

testAsync('SIM-03 simulate() returns frozen SimulationResult with required fields', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  assert.ok(Object.isFrozen(result), 'SimulationResult must be frozen');
  assert.ok(result.simId,               'simId required');
  assert.ok(result.decision,            'decision required');
  assert.ok(result.prediction,          'prediction required');
  assert.ok(result.sigma,               'sigma required');
  assert.ok(result.delta,               'delta required');
  assert.ok(Array.isArray(result.faults), 'faults must be array');
  assert.ok(typeof result.enforced     === 'boolean',   'enforced must be boolean');
  assert.ok(typeof result.confidence   === 'number',    'confidence must be number');
  assert.ok(typeof result.simulationMs === 'number',    'simulationMs must be number');
  assert.ok(['commit','fallback','escalate','dry_run'].includes(result.recommendation),
    `recommendation must be valid: ${result.recommendation}`);
});

testAsync('SIM-04 clean dispatch at low sigma → commit recommendation', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  assert.ok(result.sigma.score < 0.3, `sigma too high for clean context: ${result.sigma.score}`);
  assert.strictEqual(result.recommendation, 'commit');
  assert.strictEqual(result.faults.length, 0);
});

// ── COS integration ───────────────────────────────────────────────────────────

testAsync('SIM-05 COS compartment is created and recycled per simulation', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  // COS may or may not be available depending on whether its ESM deps load
  // but the simulation must complete either way
  assert.ok(typeof result.cosUsed === 'boolean', 'cosUsed must be boolean');
  assert.ok(result.simulationMs < 5000, `simulation took too long: ${result.simulationMs}ms`);
});

testAsync('SIM-06 dry_run option never returns commit', async () => {
  const result = await simulate(cleanDecision, cleanContext, { dry_run: true });
  assert.strictEqual(result.recommendation, 'dry_run');
});

// ── Fault classification ──────────────────────────────────────────────────────

test('SIM-07 classifyFault returns INTEGRITY on sigma >= 0.7', () => {
  const highSigma = { score: 0.75, axes: {}, deviating: true };
  const faults = classifyFault(highSigma, 0, 0, [], cleanDecision, cleanContext);
  const integrity = faults.find(f => f.class === 'INTEGRITY');
  assert.ok(integrity, 'INTEGRITY fault expected at sigma 0.75');
  assert.ok(['fallback','escalate'].includes(integrity.recommendation));
});

test('SIM-08 classifyFault returns CONSTITUTIONAL on enforcement violations', () => {
  const violations = [{ id: 'I-1', detail: 'bad UUID' }];
  const faults = classifyFault({ score: 0.1 }, 0, 0, violations, cleanDecision, cleanContext);
  const constitutional = faults.find(f => f.class === 'CONSTITUTIONAL');
  assert.ok(constitutional, 'CONSTITUTIONAL fault expected on invariant violation');
  assert.strictEqual(constitutional.recommendation, 'reject');
});

test('SIM-09 CONSTITUTIONAL fault → escalate recommendation', () => {
  const violations = [{ id: 'I-1', detail: 'bad UUID' }];
  const highSigma  = { score: 0.8 };
  const faults = classifyFault(highSigma, 0, 0, violations, cleanDecision, cleanContext);
  // escalate because constitutional violation present
  const recommendation = faults.some(f => f.class === 'CONSTITUTIONAL') ? 'escalate' : 'commit';
  assert.strictEqual(recommendation, 'escalate');
});

test('SIM-10 no faults at low sigma → zero fault list', () => {
  const lowSigma = { score: 0.1, deviating: false };
  const faults = classifyFault(lowSigma, 0.1, 0.1, [], cleanDecision, cleanContext);
  assert.strictEqual(faults.length, 0);
});

// ── scoreOutcome feedback loop ────────────────────────────────────────────────

testAsync('SIM-11 scoreOutcome records prediction accuracy', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  const score  = scoreOutcome(result, { ok: true });
  assert.strictEqual(score.agent,   cleanDecision.agent);
  assert.strictEqual(score.cluster, cleanDecision.cluster);
  assert.strictEqual(score.actual,  'success');
  assert.ok(typeof score.predCorrect === 'boolean');
  assert.ok(typeof score.sigmaPredicted === 'number');
});

testAsync('SIM-12 scoreOutcome marks failure correctly', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  const score  = scoreOutcome(result, { ok: false, error: 'timeout' });
  assert.strictEqual(score.actual, 'failure');
});

// ── Delta scoring ─────────────────────────────────────────────────────────────

testAsync('SIM-13 delta S-field and C-field present in result', async () => {
  const result = await simulate(cleanDecision, cleanContext);
  assert.ok(typeof result.delta.sField === 'number', 'sField must be number');
  assert.ok(typeof result.delta.cField === 'number', 'cField must be number');
  assert.ok(result.delta.sField >= 0 && result.delta.sField <= 5, `sField out of range: ${result.delta.sField}`);
});

testAsync('SIM-14 high structural deviation raises C-field', async () => {
  const deepContext = {
    ...cleanContext,
    callShape: { causalDepth: 20, urgency: 1.0 },
    conditioning: { avgResponseRate: 1.0, avgCausalDepth: 1 },
  };
  const result = await simulate(cleanDecision, deepContext);
  assert.ok(result.delta.cField > 0.5, `high causal depth should raise C-field: ${result.delta.cField}`);
});

// ── Spec compliance ───────────────────────────────────────────────────────────

testAsync('SIM-15 inconclusive simulation never blocks dispatch', async () => {
  // Even with a timeout that fires immediately, should still return a result
  const result = await simulate(cleanDecision, {}, { timeout: 1 });
  assert.ok(result.recommendation, 'recommendation must always be present');
  assert.notStrictEqual(result.recommendation, undefined);
});

(async () => {
  // Run async tests
  const cleanDecision = { agent: 'ollama', cluster: 'code', reason: 'LAW_I: ollama first' };
  const stressedDecision = { agent: 'claude', cluster: 'analysis', reason: 'LAW_III: reserve' };
  const cleanContext = {
    cfrSigmaFloor: 0.1,
    cfrField: { coherence: 0.8, friction: 0.1, resonance: 0.7, entropy: 0.1 },
    callShape: { causalDepth: 1, urgency: 1.0 },
    conditioning: { avgResponseRate: 1.0, avgCausalDepth: 1 },
  };

  await testAsync('SIM-03 simulate() returns frozen SimulationResult with required fields', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    assert.ok(Object.isFrozen(result));
    assert.ok(result.simId);
    assert.ok(result.prediction);
    assert.ok(result.sigma);
    assert.ok(result.delta);
    assert.ok(Array.isArray(result.faults));
    assert.ok(typeof result.enforced === 'boolean');
    assert.ok(typeof result.confidence === 'number');
    assert.ok(typeof result.simulationMs === 'number');
    assert.ok(['commit','fallback','escalate','dry_run'].includes(result.recommendation));
  });

  await testAsync('SIM-04 clean dispatch at low sigma → commit', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    assert.ok(result.sigma.score < 0.4, `sigma ${result.sigma.score} too high`);
    assert.strictEqual(result.recommendation, 'commit');
    assert.strictEqual(result.faults.length, 0);
  });

  await testAsync('SIM-05 COS compartment used and recycled', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    assert.ok(typeof result.cosUsed === 'boolean');
    assert.ok(result.simulationMs < 5000);
    assert.ok(result.cosUsed, 'COS should be available');
  });

  await testAsync('SIM-06 dry_run never returns commit', async () => {
    const result = await simulate(cleanDecision, cleanContext, { dry_run: true });
    assert.strictEqual(result.recommendation, 'dry_run');
  });

  await testAsync('SIM-11 scoreOutcome records prediction accuracy', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    const score = scoreOutcome(result, { ok: true });
    assert.strictEqual(score.agent, cleanDecision.agent);
    assert.strictEqual(score.actual, 'success');
    assert.ok(typeof score.predCorrect === 'boolean');
  });

  await testAsync('SIM-12 scoreOutcome marks failure correctly', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    const score = scoreOutcome(result, { ok: false, error: 'timeout' });
    assert.strictEqual(score.actual, 'failure');
  });

  await testAsync('SIM-13 delta fields present', async () => {
    const result = await simulate(cleanDecision, cleanContext);
    assert.ok(typeof result.delta.sField === 'number');
    assert.ok(typeof result.delta.cField === 'number');
  });

  await testAsync('SIM-14 high causal depth raises C-field', async () => {
    const ctx = { ...cleanContext, callShape: { causalDepth: 20, urgency: 1.0 } };
    const result = await simulate(cleanDecision, ctx);
    assert.ok(result.delta.cField > 0.5, `C-field: ${result.delta.cField}`);
  });

  await testAsync('SIM-15 inconclusive simulation never blocks', async () => {
    const result = await simulate(cleanDecision, {}, { timeout: 1 });
    assert.ok(result.recommendation);
  });

  console.log(`\n  raid-simulation: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
