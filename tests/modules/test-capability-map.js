'use strict';
/**
 * tests/modules/test-capability-map.js
 * The capability/consumer graph is DECLARED by each system about itself. §1.1 —
 * a declaration is a claim. These tests exist to keep the claim and the check
 * from ever collapsing into each other again.
 */
const assert = require('assert');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const { loadAll, verifyRoutes, resolveWires, SYSTEMS } =
  require(path.join(ROOT, 'loom/scanners/capability-map'));

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); console.log(`  ✓ ${id} ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${id} ${name}\n    ${e.message}`); failed++; }
}

const decls = loadAll();

test('T-001', 'every declared system is loaded and every capability has an id and a route', () => {
  assert.ok(decls.length > 200, `expected 200+ capabilities, got ${decls.length}`);
  for (const c of decls) {
    assert.ok(c.id && c.namespace && c.version, `incomplete declaration: ${JSON.stringify(c).slice(0, 80)}`);
    assert.ok(c.route && c.route.path && c.route.method, `${c.id} has no route`);
  }
});

test('T-002', 'ids are unique AFTER dedupe, and every collision is reported not swallowed', () => {
  const seen = new Set();
  for (const c of decls) {
    assert.ok(!seen.has(c.id), `duplicate id survived dedupe: ${c.id}`);
    seen.add(c.id);
  }
  assert.ok(Array.isArray(decls.duplicates), 'duplicates must be reported');
  for (const d of decls.duplicates) {
    assert.ok(d.kept && d.dropped && d.kept !== d.dropped, `unusable duplicate record for ${d.id}`);
  }
});

test('T-003', 'route verification does NOT read the declaration file back to itself', () => {
  // The circularity that would make this check worthless: if the verifier
  // concatenated registry-components.js into the source it searches, every
  // route would trivially "verify" against its own declaration.
  const src = require('fs').readFileSync(
    path.join(ROOT, 'loom/scanners/capability-map.js'), 'utf8');
  assert.ok(/registry-components/.test(src) && /continue/.test(src),
    'the verifier must explicitly skip registry-components.js');
  const { served } = verifyRoutes(decls);
  const unservedCount = [...served.values()].filter(v => !v).length;
  assert.ok(unservedCount > 0,
    'if EVERY declared route verifies, the check is almost certainly circular');
});

test('T-004', 'a capability with no served route gets no .in hook', () => {
  const { served } = verifyRoutes(decls);
  const { edges } = resolveWires(decls, served);
  for (const e of edges) {
    if (!e.to.endsWith('.in')) continue;
    const target = e.to.slice(0, -3);
    assert.ok(served.get(target) === true,
      `wire ${e.from} -> ${e.to} targets a capability whose route is served by nothing`);
  }
});

test('T-005', 'unresolvable consumer wires are reported, never invented', () => {
  const { served } = verifyRoutes(decls);
  const { edges, dangling } = resolveWires(decls, served);
  const declaredTargets = new Set();
  for (const c of decls) for (const h of (c.hooks && c.hooks.in) || []) declaredTargets.add(h.id);
  for (const c of decls) if (served.get(c.id)) declaredTargets.add(`${c.id}.in`);
  for (const e of edges) {
    assert.ok(declaredTargets.has(e.to), `invented wire target: ${e.to}`);
  }
  assert.ok(dangling.length > 0, 'this tree has known unresolvable wires — a zero means the check broke');
  for (const d of dangling) assert.ok(d.why, `dangling wire ${d.from}->${d.target} has no stated reason`);
});

test('T-006', 'the reversed-direction case is detected, not lumped in with "missing"', () => {
  // Four systems declare that their dispatch-completion hook wires TO
  // cortex.raid.feedback, which cortex declares as an OUT hook. A wire cannot
  // terminate on an emitter. Collapsing this into "target not found" would hide
  // that the target exists and the DIRECTION is what is wrong.
  const { served } = verifyRoutes(decls);
  const { dangling } = resolveWires(decls, served);
  const reversed = dangling.filter(d => /DIRECTION REVERSED/.test(d.why));
  assert.ok(reversed.length > 0, 'the reversed-direction classification produced nothing');
  assert.ok(reversed.some(d => d.target === 'cortex.raid.feedback'),
    'cortex.raid.feedback should be classified as reversed, not as absent');
});

test('T-007', 'capability ids stay OUT of the file-graph namespace', () => {
  // Two graphs, two id spaces. If a capability ever gets a nexus.* id it will
  // collide with the source scanner and one of the two graphs loses records.
  for (const c of decls) {
    assert.ok(!c.id.startsWith('nexus.'),
      `${c.id} is in the file-graph namespace; capability ids must stay native`);
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
