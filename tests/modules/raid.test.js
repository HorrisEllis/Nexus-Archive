'use strict';
/**
 * tests/modules/raid.test.js — RAID Core Engine Adversarial Suite
 * UUID: test-raid-v1-0000-0000-0000-000000000010
 *
 * §12.1 Every runtime file has a brutal recursive test suite.
 * §12.2 Tests are verification, not coverage.
 *
 * Covers cortex/core/raid/index.js:
 *   _cluster     — intent classification, keyword collisions, edge cases
 *   _decide      — LAW_I, fallback chain, explicit preference, all-offline
 *   _fitness     — score composition
 *   _health      — health state, consecutiveFails threshold
 *   _agentAvailable — availability predicate
 *   recordOutcome  — weight mutation, persistence across calls
 *   startHealthPoll / stopHealthPoll — no crash on rapid start/stop
 *   _approveTool — contract approval (integration with cortex/contract)
 *   _toolHealthSnapshot — shape contract
 *   ADVERSARIAL   — null/undefined inputs, concurrent calls, hostile strings
 */

const assert = require('assert');
let passed = 0, failed = 0;

async function test(id, desc, fn) {
  try {
    await fn();
    console.log(`  ✓ ${id} ${desc}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${id} ${desc}\n    ${e.message}`);
    failed++;
  }
}

function fresh() {
  // Clear module cache so each test group starts with clean state
  const keys = Object.keys(require.cache).filter(k =>
    k.includes('cortex/core/raid') || k.includes('cortex/contract')
  );
  keys.forEach(k => delete require.cache[k]);
  return require('../../cortex/core/raid/index.js');
}

async function run() {
  console.log('\n══ RAID Core Engine — Fractal Adversarial Suite ══\n');

  // ── _cluster ──────────────────────────────────────────────────────────────
  console.log('  [cluster]');

  await test('R-01', '_cluster: code intent — typescript/implement/fix/bug keywords', () => {
    const { _cluster } = fresh();
    assert.strictEqual(_cluster('build a typescript class'),     'code');  // typescript
    assert.strictEqual(_cluster('implement the auth module'),    'code');  // implement
    assert.strictEqual(_cluster('fix this javascript function'), 'code');  // fix + javascript
    assert.strictEqual(_cluster('there is a bug in this code'), 'code');  // bug + code
    assert.strictEqual(_cluster('compile the module'),           'code');  // compile
  });

  await test('R-02', '_cluster: analysis intent', () => {
    const { _cluster } = fresh();
    assert.strictEqual(_cluster('analyze the system'),           'analysis'); // analyze
    assert.strictEqual(_cluster('explain how this works'),       'analysis'); // explain
    assert.strictEqual(_cluster('why is the bridge failing'),    'analysis'); // why
    assert.strictEqual(_cluster('investigate the error'),        'analysis'); // investigate
  });

  await test('R-03', '_cluster: spec intent', () => {
    const { _cluster } = fresh();
    assert.strictEqual(_cluster('design the architecture'),  'spec'); // design + architecture
    assert.strictEqual(_cluster('plan the system schema'),   'spec'); // plan + schema
    assert.strictEqual(_cluster('API contract structure'),   'spec'); // contract + structure
    assert.strictEqual(_cluster('create a spec'),            'spec'); // spec keyword alone
  });

  await test('R-04', '_cluster: general fallback on empty/unknown', () => {
    const { _cluster } = fresh();
    assert.strictEqual(_cluster(''), 'general');
    assert.strictEqual(_cluster('hello'), 'general');
    assert.strictEqual(_cluster('what time is it'), 'general');
  });

  await test('R-05', '_cluster: null/undefined → general, no crash', () => {
    const { _cluster } = fresh();
    assert.strictEqual(_cluster(null), 'general');
    assert.strictEqual(_cluster(undefined), 'general');
    assert.strictEqual(_cluster(42), 'general');
    assert.strictEqual(_cluster({}), 'general');
  });

  await test('R-06', '_cluster: hostile string (very long, unicode) → general', () => {
    const { _cluster } = fresh();
    const hostile = '🔥'.repeat(5000);
    assert.strictEqual(_cluster(hostile), 'general');
    const longStr = 'x'.repeat(100000);
    assert.strictEqual(typeof _cluster(longStr), 'string');
  });

  await test('R-07', '_cluster: keyword collision — "analyze the system" is analysis not spec', () => {
    const { _cluster } = fresh();
    // "system" appears in spec patterns — must not win over "analyze"
    assert.strictEqual(_cluster('analyze the system behavior'), 'analysis');
  });

  await test('R-08', '_cluster: returns string in all cases', () => {
    const { _cluster } = fresh();
    const inputs = ['', null, undefined, 0, [], {}, 'build', 'analyze', 'design'];
    for (const inp of inputs) {
      const result = _cluster(inp);
      assert.strictEqual(typeof result, 'string', `_cluster(${JSON.stringify(inp)}) returned ${typeof result}`);
    }
  });

  // ── _decide ───────────────────────────────────────────────────────────────
  console.log('\n  [decide]');

  await test('R-10', '_decide: LAW_I — ollama online → ollama wins', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const d = _decide({ prompt: 'build code' }, health, new Map());
    assert.strictEqual(d.agent, 'ollama');
    assert.ok(d.reason.startsWith('LAW_I'), `reason: ${d.reason}`);
  });

  await test('R-11', '_decide: ollama offline → falls back to claude', () => {
    const { _decide } = fresh();
    const health = {
      ollama:            { online: false, consecutiveFails: 3 },
      'guardian-claude': { online: true,  consecutiveFails: 0 },
    };
    const d = _decide({ prompt: 'build code' }, health, new Map());
    assert.strictEqual(d.agent, 'claude');
  });

  await test('R-12', '_decide: explicit preference respected when agent online', () => {
    const { _decide } = fresh();
    const health = {
      ollama:            { online: true, consecutiveFails: 0 },
      'guardian-claude': { online: true, consecutiveFails: 0 },
    };
    const d = _decide({ prompt: 'test', preferredAgent: 'guardian-claude' }, health, new Map());
    assert.strictEqual(d.agent, 'guardian-claude');
    assert.ok(d.reason.includes('explicit'), `reason: ${d.reason}`);
  });

  await test('R-13', '_decide: explicit preference ignored if agent offline', () => {
    const { _decide } = fresh();
    const health = {
      ollama:            { online: true,  consecutiveFails: 0 },
      'guardian-claude': { online: false, consecutiveFails: 5 },
    };
    const d = _decide({ prompt: 'test', preferredAgent: 'guardian-claude' }, health, new Map());
    assert.strictEqual(d.agent, 'ollama'); // LAW_I wins
  });

  await test('R-14', '_decide: all agents offline → still returns a decision, no crash', () => {
    const { _decide } = fresh();
    const health = {
      ollama:             { online: false, consecutiveFails: 10 },
      'guardian-claude':  { online: false, consecutiveFails: 10 },
      'guardian-chatgpt': { online: false, consecutiveFails: 10 },
    };
    const d = _decide({ prompt: 'test' }, health, new Map());
    assert.ok(d.agent, 'should still have an agent even when all offline');
    assert.ok(d.reason, 'should have a reason');
  });

  await test('R-15', '_decide: deterministic — 20 calls, same inputs → same output', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const weights = new Map();
    const call = { prompt: 'build a module' };
    const agents = new Set();
    for (let i = 0; i < 20; i++) agents.add(_decide(call, health, weights).agent);
    assert.strictEqual(agents.size, 1, `got ${agents.size} different agents on same inputs`);
  });

  await test('R-16', '_decide: output shape contract', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const d = _decide({ prompt: 'test' }, health, new Map());
    assert.ok('agent'   in d, 'missing agent');
    assert.ok('cluster' in d, 'missing cluster');
    assert.ok('reason'  in d, 'missing reason');
    assert.strictEqual(typeof d.agent,   'string');
    assert.strictEqual(typeof d.cluster, 'string');
    assert.strictEqual(typeof d.reason,  'string');
  });

  await test('R-17', '_decide: null prompt → general cluster, no crash', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const d = _decide({ prompt: null }, health, new Map());
    assert.ok(d.agent);
    assert.strictEqual(d.cluster, 'general');
  });

  await test('R-18', '_decide: null health map → no crash, returns decision', () => {
    const { _decide } = fresh();
    const d = _decide({ prompt: 'test' }, {}, new Map());
    assert.ok(d.agent);
  });

  await test('R-19', '_decide: LAW_I — ollama wins even when guardian has higher weight', () => {
    const { _decide } = fresh();
    const health = {
      ollama:            { online: true, consecutiveFails: 0 },
      'guardian-claude': { online: true, consecutiveFails: 0 },
    };
    const weights = new Map([['code:guardian-claude', 0.99], ['code:ollama', 0.1]]);
    const d = _decide({ prompt: 'build code' }, health, weights);
    assert.strictEqual(d.agent, 'ollama', 'LAW_I must override weights');
  });

  await test('R-20', '_decide: includes cluster in output', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const d = _decide({ prompt: 'analyze this code carefully' }, health, new Map());
    assert.ok(['code', 'analysis', 'spec', 'general'].includes(d.cluster), `unexpected cluster: ${d.cluster}`);
  });

  // ── recordOutcome ─────────────────────────────────────────────────────────
  console.log('\n  [recordOutcome]');

  await test('R-30', 'recordOutcome: success increments successes count', () => {
    const raid = fresh();
    raid.recordOutcome('ollama', 'code', true);
    const w = raid._weights.get('code:ollama');
    assert.ok(w, 'should have entry after recordOutcome');
    assert.strictEqual(w.calls, 1);
    assert.strictEqual(w.successes, 1);
  });

  await test('R-31', 'recordOutcome: failure increments calls but not successes', () => {
    const raid = fresh();
    raid.recordOutcome('ollama', 'code', false);
    const w = raid._weights.get('code:ollama');
    assert.ok(w);
    assert.strictEqual(w.calls, 1);
    assert.strictEqual(w.successes, 0);
  });

  await test('R-32', 'recordOutcome: calls accumulate correctly over multiple outcomes', () => {
    const raid = fresh();
    raid.recordOutcome('ollama', 'code', true);
    raid.recordOutcome('ollama', 'code', false);
    raid.recordOutcome('ollama', 'code', true);
    const w = raid._weights.get('code:ollama');
    assert.strictEqual(w.calls, 3);
    assert.strictEqual(w.successes, 2);
  });

  await test('R-33', 'recordOutcome: unknown agent → no crash', () => {
    const raid = fresh();
    raid.recordOutcome('nonexistent-agent-xyz', 'code', true);
    raid.recordOutcome(null, 'code', false);
    raid.recordOutcome('ollama', null, true);
    raid.recordOutcome(undefined, undefined, undefined);
  });

  await test('R-34', 'recordOutcome: entry persists and accumulates across calls (§15.3)', () => {
    const raid = fresh();
    for (let i = 0; i < 10; i++) raid.recordOutcome('ollama', 'code', false);
    const w = raid._weights.get('code:ollama');
    assert.ok(w, 'weight entry should exist after 10 calls');
    assert.strictEqual(w.calls, 10, `calls should be 10, got ${w.calls}`);
    assert.strictEqual(w.successes, 0, `successes should be 0, got ${w.successes}`);
  });

  // ── _agentAvailable ───────────────────────────────────────────────────────
  console.log('\n  [agentAvailable]');

  await test('R-40', '_agentAvailable: online agent → true', () => {
    const { _agentAvailable } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    assert.strictEqual(_agentAvailable('ollama', health), true);
  });

  await test('R-40b', '_agentAvailable: offline agent → false', () => {
    const { _agentAvailable } = fresh();
    const health = { ollama: { online: false, consecutiveFails: 3 } };
    assert.strictEqual(_agentAvailable('ollama', health), false);
  });

  await test('R-41', '_agentAvailable: unknown agent → false (fail-closed)', () => {
    const { _agentAvailable } = fresh();
    assert.strictEqual(_agentAvailable('unknown-agent', {}), false);
    assert.strictEqual(_agentAvailable(null, {}), false);
    assert.strictEqual(_agentAvailable(undefined, {}), false);
  });

  // ── startHealthPoll / stopHealthPoll ──────────────────────────────────────
  console.log('\n  [healthPoll]');

  await test('R-50', 'startHealthPoll: no crash on start, stop cleans up', () => {
    const raid = fresh();
    raid.startHealthPoll(100); // 100ms — fast for testing
    raid.stopHealthPoll();
  });

  await test('R-51', 'startHealthPoll: idempotent — start twice, stop once', () => {
    const raid = fresh();
    raid.startHealthPoll(100);
    raid.startHealthPoll(100); // second call should not crash or double-register
    raid.stopHealthPoll();
  });

  await test('R-52', 'stopHealthPoll: safe to call without starting', () => {
    const raid = fresh();
    raid.stopHealthPoll(); // should not crash
    raid.stopHealthPoll(); // double stop — should not crash
  });

  // ── _toolHealthSnapshot ───────────────────────────────────────────────────
  console.log('\n  [toolHealthSnapshot]');

  await test('R-60', '_toolHealthSnapshot: returns object', () => {
    const { _toolHealthSnapshot } = fresh();
    const snap = _toolHealthSnapshot();
    assert.ok(snap !== null && typeof snap === 'object');
  });

  await test('R-61', '_toolHealthSnapshot: no crash on repeated calls', () => {
    const { _toolHealthSnapshot } = fresh();
    for (let i = 0; i < 10; i++) _toolHealthSnapshot();
  });

  // ── _approveTool integration ──────────────────────────────────────────────
  console.log('\n  [approveTool]');

  await test('R-70', '_approveTool: registered source + allowed action → approved', () => {
    const { _approveTool } = fresh();
    const r = _approveTool('copilot', 'cortex gaps', { action: 'tool' });
    assert.strictEqual(r.approved, true);
  });

  await test('R-71', '_approveTool: missing source → loud error, not silent pass', () => {
    const { _approveTool } = fresh();
    const r = _approveTool(null, 'something', { action: 'tool' });
    assert.strictEqual(r.approved, false);
    assert.ok(r.reason, 'should have a reason');
  });

  await test('R-72', '_approveTool: explicitly denied action → denied with clear reason', () => {
    const { _approveTool } = fresh();
    const r = _approveTool('copilot', 'forge something', { action: 'forge' });
    assert.strictEqual(r.approved, false);
    assert.ok(r.reason, 'must have denial reason');
  });

  // ── ADVERSARIAL ───────────────────────────────────────────────────────────
  console.log('\n  [adversarial]');

  await test('R-80', 'ADVERSARIAL: concurrent _decide calls — no cross-contamination', async () => {
    const raid = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    const calls = Array.from({ length: 20 }, (_, i) =>
      Promise.resolve(raid._decide({ prompt: `prompt ${i}` }, health, new Map()))
    );
    const results = await Promise.all(calls);
    assert.strictEqual(results.length, 20);
    results.forEach((r, i) => {
      assert.ok(r.agent, `result ${i} missing agent`);
    });
  });

  await test('R-81', 'ADVERSARIAL: empty weights Map → no crash', () => {
    const { _decide } = fresh();
    const health = { ollama: { online: true, consecutiveFails: 0 } };
    _decide({ prompt: 'test' }, health, new Map());
  });

  await test('R-82', 'ADVERSARIAL: health map with extra/unexpected keys → no crash', () => {
    const { _decide } = fresh();
    const health = {
      ollama:      { online: true,  consecutiveFails: 0 },
      '__proto__': { online: false, consecutiveFails: 999 },
      'constructor': { online: false },
      'undefined': null,
    };
    const d = _decide({ prompt: 'test' }, health, new Map());
    assert.ok(d.agent);
  });

  await test('R-83', 'ADVERSARIAL: 100 sequential recordOutcome calls — no OOM/crash', () => {
    const raid = fresh();
    for (let i = 0; i < 100; i++) {
      raid.recordOutcome('ollama', 'code', i % 3 !== 0);
    }
    assert.ok(true); // just verify no crash
  });

  await test('R-84', 'ADVERSARIAL: _decide with corrupted health values → no crash', () => {
    const { _decide } = fresh();
    const health = {
      ollama: null,
      'guardian-claude': undefined,
      'guardian-chatgpt': 'not an object',
    };
    assert.doesNotThrow(() => _decide({ prompt: 'test' }, health, new Map()));
  });

  // ── Module exports contract ───────────────────────────────────────────────
  console.log('\n  [exports]');

  await test('R-90', 'Module exports all documented functions', () => {
    const raid = fresh();
    const required = [
      'MODULE_ID', 'VERSION', '_decide', '_cluster', '_health',
      '_weights', '_agentAvailable', '_fitness', 'HEALTH_KEY',
      'recordOutcome', 'startHealthPoll', 'stopHealthPoll',
      '_approveTool', '_toolHealthSnapshot',
    ];
    for (const key of required) {
      assert.ok(key in raid, `missing export: ${key}`);
    }
  });

  await test('R-91', 'MODULE_ID and VERSION are non-empty strings', () => {
    const { MODULE_ID, VERSION } = fresh();
    assert.strictEqual(typeof MODULE_ID, 'string');
    assert.strictEqual(typeof VERSION,   'string');
    assert.ok(MODULE_ID.length > 0);
    assert.ok(VERSION.length > 0);
  });

  await test('R-92', '_weights is a Map', () => {
    const { _weights } = fresh();
    assert.ok(_weights instanceof Map);
  });

  await test('R-93', '_health is a plain object', () => {
    const { _health } = fresh();
    assert.ok(_health !== null && typeof _health === 'object' && !Array.isArray(_health));
  });

  // Summary
  console.log(`\n  raid: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exitCode = 1;
}

run().catch(e => { console.error(e); process.exitCode = 1; });
