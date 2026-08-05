'use strict';
// RFR2 wired into the intelligence system (James). The Relational Field Reader:
// friction/tension → RFR2 causality.traceToRoot finds the CONDITIONS that caused
// it; RFR2 sigma.classify characterizes the deviation. Must be a real wire, in
// loom's connection graph, honest-degrade if RFR2 is unavailable.
const assert = require('assert');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}
const ROOT = path.join(__dirname, '../..');
const rf = require(path.join(ROOT, 'cortex/intelligence/relational-field'));

(async () => {
  await test('T-001', 'traces friction back to its causal ROOT condition (RFR2 causality)', async () => {
    const { loadRFR2Module } = require(path.join(ROOT, 'lib/rfr2-bridge.js'));
    const causality = await loadRFR2Module('causality');
    const store = causality.createCausalStore();
    store.addEdge(causality.createEdge('A', 'B', 'causal/explicit', 'r1', 1, 1.0));
    store.addEdge(causality.createEdge('B', 'C', 'causal/explicit', 'r2', 1, 1.0));
    const field = await rf.readFieldForFriction({ id: 'C', causalStore: store });
    assert.strictEqual(field.root, 'A', 'friction at C must trace to root condition A');
    assert.deepStrictEqual(field.conditions, ['A', 'B', 'C'], 'the causal path is the conditions');
    assert.strictEqual(field.available, true);
  });

  await test('T-002', 'characterizes the deviation from baseline (RFR2 sigma)', async () => {
    const { loadRFR2Module } = require(path.join(ROOT, 'lib/rfr2-bridge.js'));
    const causality = await loadRFR2Module('causality');
    const store = causality.createCausalStore();
    store.addEdge(causality.createEdge('A', 'B', 'causal/explicit', 'r1', 1, 1.0));
    const field = await rf.readFieldForFriction({ id: 'B', causalStore: store, kinematicWindow: [1, 2, 4, 8, 16] });
    assert.ok(field.deviation !== null, 'RFR2 sigma should classify a sufficient window');
  });

  await test('T-003', 'honest degrade — no event id returns a stated reason, never throws (§1.2)', async () => {
    const field = await rf.readFieldForFriction({});
    assert.strictEqual(field.available, false);
    assert.ok(field.reason, 'must state why it could not read the field');
  });

  await test('T-004', 'batch: trackFrictionConditions reads the field over many events', async () => {
    const { loadRFR2Module } = require(path.join(ROOT, 'lib/rfr2-bridge.js'));
    const causality = await loadRFR2Module('causality');
    const store = causality.createCausalStore();
    store.addEdge(causality.createEdge('X', 'Y', 'causal/explicit', 'r', 1, 1.0));
    const res = await rf.trackFrictionConditions([{ id: 'Y' }, { id: 'Z' }], { causalStore: store });
    assert.strictEqual(res.total, 2);
    assert.ok(res.traced >= 1, 'at least the wired event traces');
  });

  await test('T-005', 'registered as a first-class intelligence capability', () => {
    const idx = require('fs').readFileSync(path.join(ROOT, 'cortex/intelligence/index.js'), 'utf8');
    assert.ok(/relational-field/.test(idx), 'intelligence must expose the relational-field capability');
    assert.ok(/RFR2 wired into the intelligence/.test(idx), 'the wire is described');
  });

  await test('T-006', 'RFR2↔intelligence is in loom\'s connection graph (visible to the system)', () => {
    // §CORRECTED 2026-08-04 — this test used to read observability-map and
    // assert TWO edges, including one to mastermind. relational-field.js has
    // exactly one require() in the entire file. The test was not catching the
    // fabricated wire; it was holding it in place, which is the same failure
    // mode as copilot-handshake-dispatch.test.js asserting its own duplicated
    // copy of buggy logic (0.9.11). Ownership of this component moved to
    // loom/maps/relational-field-map.js; the assertion follows it.
    const { FILES } = require(path.join(ROOT, 'loom/maps/relational-field-map'));
    const relField = FILES.find(f => f[1] === 'nexus.cortex.intelligence.relational-field');
    assert.ok(relField, 'relational-field must be a mapped component');
    assert.deepStrictEqual(relField[2], ['nexus.lib.rfr2-bridge'],
      'exactly one wire — the RFR2 bridge — because that is the file\'s only require()');
  });

  await test('T-007', 'the mapped edges match the file\'s real require() calls, both directions', () => {
    // §0.1 — the map is not trusted because it looks right; it is checked
    // against source. Comments and template literals stripped first: an
    // unstripped pass produces phantom edges from require() calls that appear
    // inside docblocks and inside generated-code strings elsewhere in the set.
    const { FILES } = require(path.join(ROOT, 'loom/maps/relational-field-map'));
    const fs = require('fs');
    const strip = (s) => s
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/`(?:[^`\\]|\\[\s\S])*`/g, '``');
    const byPath = new Map(FILES.map(([file, id]) => [file, id]));
    let checked = 0;
    for (const [file, id, declared] of FILES) {
      const src = strip(fs.readFileSync(path.join(ROOT, file), 'utf8'));
      const real = new Set();
      for (const m of src.matchAll(/require\(\s*['"](\.[^'"]+)['"]/g)) {
        let rel = path.normalize(path.join(path.dirname(file), m[1]));
        if (!byPath.has(rel)) {
          if (byPath.has(rel + '.js')) rel = rel + '.js';
          else if (byPath.has(path.join(rel, 'index.js'))) rel = path.join(rel, 'index.js');
        }
        if (byPath.has(rel)) real.add(byPath.get(rel));
      }
      // Every declared edge to a component INSIDE this map must be a real
      // require. (Edges to boundary components are checked by T-008.)
      for (const dep of declared) {
        if (!new Set(FILES.map(f => f[1])).has(dep)) continue;
        assert.ok(real.has(dep), `${file} declares a wire to ${dep} it does not require`);
      }
      // And every real require inside this map must be a declared edge.
      for (const dep of real) {
        assert.ok(declared.includes(dep), `${file} really requires ${dep} but the map omits it`);
      }
      checked++;
    }
    assert.strictEqual(checked, FILES.length, 'every mapped file was checked against source');
  });

  await test('T-008', 'boundary components are real files on disk (endpoints, not inventions)', () => {
    const { BOUNDARY } = require(path.join(ROOT, 'loom/maps/relational-field-map'));
    const fs = require('fs');
    assert.ok(BOUNDARY.length > 0, 'boundary set is declared');
    for (const [file, id] of BOUNDARY) {
      assert.ok(fs.existsSync(path.join(ROOT, file)),
        `boundary component ${id} claims ${file}, which does not exist`);
    }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
