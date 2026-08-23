'use strict';
// tests/modules/test-build-manual.js
// Load-bearing: BM-004 (unknown system refused, not silently generic) and
// BM-006 (system-level events are read — 0 must mean 0, not "looked in the
// wrong place").
const assert = require('assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'query', 'build-manual'));

let passed = 0, failed = 0;
async function test(id, name, fn) {
  try { await fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

(async () => {
  console.log('\n\u2550\u2550 BUILDMANUAL \u2014 the primer as a tool call \u2550\u2550\n');

  await test('BM-001', 'it matches the agent-tools contract shape', () => {
    assert.strictEqual(T.name, 'buildmanual');
    assert.strictEqual(typeof T.description, 'string');
    assert.strictEqual(typeof T.execute, 'function');
    assert.ok(T.parameters && T.parameters.properties.agent && T.parameters.properties.system);
    assert.deepStrictEqual(T.parameters.required, [], 'both args optional — it must work with no arguments');
  });

  await test('BM-002', 'the bare manual carries all four framework sections', async () => {
    const r = await T.execute({});
    for (const s of ['WARP', 'AXIOMS', 'OUTPUT CONTRACT', 'TOOLBOX']) {
      assert.ok(r.manual.includes(s), `section ${s} missing`);
    }
    assert.deepStrictEqual(r.missingSections, []);
    assert.strictEqual(r.outputCeiling, 900, 'default agent is chatgpt');
  });

  await test('BM-003', 'it DELEGATES to agent-primer \u2014 no second copy of the axioms', () => {
    const src = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'query', 'build-manual.js'), 'utf8');
    assert.ok(/require\(path\.join\(ROOT, 'lib', 'agent-primer'\)\)/.test(src));
    assert.ok(!/\u00a71\.1  Nothing exists until proven/.test(src),
      '\u00a710.3 \u2014 a second copy of the digest would drift, and two agents would be primed differently, both confident');
  });

  await test('BM-004', 'AN UNKNOWN SYSTEM IS REFUSED, not answered generically', async () => {
    const r = await T.execute({ system: 'does-not-exist' });
    assert.ok(r.error, 'a generic manual for an unknown name lets the agent believe it was scoped');
    assert.ok(Array.isArray(r.knownSystems) && r.knownSystems.length > 5,
      'the refusal must list the real systems, or it is unactionable');
    assert.ok(!r.manual, 'no manual may be returned alongside the refusal');
  });

  await test('BM-005', '\u00a71.1 an unknown AGENT is refused too', async () => {
    const r = await T.execute({ agent: 'gpt-9' });
    assert.ok(r.error && /unknown agent/.test(r.error));
  });

  await test('BM-006', 'SYSTEM-LEVEL events are read \u2014 0 must mean 0, not "wrong place"', async () => {
    const r = await T.execute({ system: 'copilot' });
    assert.ok(r.systemInfo.emits > 0,
      'copilot declares a system-level events:{emits} block AND 11 hook outputs. ' +
      'Reading only per-component emits[] reported ZERO \u2014 unknown-vs-zero (\u00a71.2)');
    assert.ok(r.manual.includes('EVENTS IT EMITS'));
    assert.ok(r.manual.includes('EVENTS IT CONSUMES'), 'both directions, or the taxonomy is half a picture');
  });

  await test('BM-007', 'the scoped manual is a PROJECTION \u2014 counts match the live registry', async () => {
    const r = await T.execute({ system: 'copilot' });
    const reg = require(path.join(ROOT, 'copilot', 'registry-components'));
    assert.strictEqual(r.systemInfo.components, reg.components.length,
      '\u00a710.2 \u2014 derived at call time, so it cannot describe a component that no longer exists');
    const tags = new Set(reg.components.flatMap(c => c.tags || []));
    assert.strictEqual(r.systemInfo.tags, tags.size);
  });

  await test('BM-008', 'scoping ADDS to the framework, never replaces it', async () => {
    const bare = await T.execute({});
    const scoped = await T.execute({ system: 'copilot' });
    for (const s of ['WARP', 'AXIOMS', 'OUTPUT CONTRACT']) assert.ok(scoped.manual.includes(s));
    assert.ok(scoped.approxTokens > bare.approxTokens);
  });

  await test('BM-009', 'sections carry source hashes so a stale manual is detectable', async () => {
    const r = await T.execute({});
    assert.strictEqual(r.sections.length, 4);
    for (const s of r.sections) assert.ok(s.hash && s.hash.length === 12, `${s.name} has no hash`);
  });

  await test('BM-010', 'token counts are labelled ESTIMATES', async () => {
    const r = await T.execute({});
    assert.ok(/ESTIMATE/.test(r.estimateNote));
    assert.strictEqual(typeof r.approxTokens, 'number');
  });

  await test('BM-011', 'a system with genuinely no declared events reports 0 HONESTLY', async () => {
    const r = await T.execute({ system: 'cortex' });
    assert.strictEqual(r.systemInfo.emits, 0,
      'cortex really does declare none \u2014 verified after BM-006 fixed the extractor. ' +
      'This 0 is a measurement, and it is the event-taxonomy gap worth closing.');
    assert.ok(/none declared/.test(r.manual));
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})();
