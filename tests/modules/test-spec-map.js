'use strict';
/**
 * tests/modules/test-spec-map.js
 * The spec layer is the third kind of claim in this registry. These tests exist
 * mostly to keep ONE property true: that the checker never reports a gap in its
 * own knowledge as a defect in the system.
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const {
  parseSpecs, listSpecs, checkRegistryCoverage, checkRoutesServed,
  joinToCapabilities, divergentPairs,
} = require(path.join(ROOT, 'loom/scanners/spec-map'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); console.log(`  ✓ ${id} ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${id} ${name}\n    ${e.message}`); failed++; }
}

const specs = parseSpecs();

test('T-001', 'authored specs only — runtime and template specs are excluded', () => {
  assert.ok(specs.length > 100, `expected 100+ authored specs, got ${specs.length}`);
  for (const s of specs) {
    assert.ok(!s.file.includes('idearium/data/specs/'),
      `${s.file} is user-generated runtime content, not a claim about NEXUS`);
    assert.ok(!s.file.includes('spec-engine/templates/'),
      `${s.file} is a template, not a spec of this system`);
  }
});

test('T-002', 'spec ids are path-derived, so two copies of a name stay two components', () => {
  const ids = new Set();
  for (const s of specs) {
    assert.ok(!ids.has(s.id), `duplicate spec id ${s.id} — a basename id would hide the second copy`);
    ids.add(s.id);
  }
  const dupes = divergentPairs(specs);
  assert.ok(dupes.length > 0, 'this tree has same-named specs in two locations — a zero means the check broke');
  for (const d of dupes) assert.ok(typeof d.identical === 'boolean',
    `${d.name} must be classified as identical or diverged, not merely "duplicated"`);
});

test('T-003', '§6.3 coverage is checked against SPEC-REGISTRY.md, and it is not vacuous', () => {
  const untracked = checkRegistryCoverage(specs);
  assert.ok(Array.isArray(untracked));
  assert.ok(untracked.length < specs.length / 2,
    'more than half untracked means the matcher is broken, not the registry');
  for (const u of untracked) assert.ok(fs.existsSync(path.join(ROOT, u)), `${u} does not exist`);
});

test('T-004', 'route-served check is layer-agnostic — it asks only whether ANYTHING serves it', () => {
  const { total, unserved } = checkRoutesServed(specs);
  assert.ok(total > 100, `expected 100+ declared spec routes, got ${total}`);
  assert.ok(unserved.length > 0, 'a zero here would mean the source search is matching everything');
  assert.ok(unserved.length < total / 2, 'more than half unserved means the search is matching nothing');
});

test('T-005', 'UNJOINED is never reported as drift', () => {
  // The property this whole file is protecting. cortex.spec declares
  // /api/cortex/gaps (orchestrator level) while cortex/registry-components.js
  // declares /api/gaps (system level). Both are real. NOTHING declares which
  // convention applies where, so an unmatched route is a gap in what can be
  // KNOWN — not evidence of a defect. A checker that called this drift would
  // emit ~100 false findings and train everyone to ignore its output.
  const { unjoined } = joinToCapabilities(specs);
  for (const u of unjoined) {
    assert.ok(u.why, `unjoined route ${u.route} carries no stated reason`);
    assert.ok(!/drift|violation|error|broken/i.test(u.why),
      `unjoined route ${u.route} is described as a defect: "${u.why}"`);
  }
  const src = fs.readFileSync(path.join(ROOT, 'loom/scanners/spec-map.js'), 'utf8');
  assert.ok(/RF-20/.test(src),
    'the missing prefix convention must stay recorded as an open item, not become folklore');
});

test('T-006', 'a spec only wires to a capability whose route is actually served', () => {
  const { joins } = joinToCapabilities(specs);
  assert.ok(joins.length > 0, 'no spec joined to any capability — the exact-match join broke');
  const { loadAll, verifyRoutes } = require(path.join(ROOT, 'loom/scanners/capability-map'));
  const { served } = verifyRoutes(loadAll());
  for (const j of joins) {
    assert.strictEqual(served.get(j.capability), true,
      `spec ${j.spec} wires to ${j.capability}, whose route is served by nothing`);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
