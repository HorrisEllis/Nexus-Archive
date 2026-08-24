'use strict';
// tests/modules/test-system-check-api-layer.test.js — §BUGFIX 2026-08-23
// Found while investigating "look at the diagnostic system": lib/
// system-check.js's real api-layer probe only checked for a separate
// api/ folder or routes.js — a genuine false negative for every system
// whose real HTTP routes are defined inline in its own main entry file.
// Confirmed live: diagnostic has a real, working /health endpoint
// (booted it) despite the old check reporting api:false.
const assert = require('assert');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

console.log('\n\u2550\u2550 SYSTEM-CHECK API LAYER \u2014 \u00a7BUGFIX 2026-08-23 \u2550\u2550\n');

delete require.cache[require.resolve(path.join(ROOT, 'lib/system-check.js'))];
const systemCheck = require(path.join(ROOT, 'lib/system-check.js'));

test('SCA-001', 'run() completes and returns a real result for every known system', () => {
  const r = systemCheck.run();
  assert.ok(Array.isArray(r.results));
  assert.ok(r.results.length >= 12, `expected at least the 12 real, known systems, got ${r.results.length}`);
});

test('SCA-002', 'BUGFIX: diagnostic now correctly shows api:true (was a real false negative)', () => {
  const r = systemCheck.run();
  const diag = r.results.find(s => s.system === 'diagnostic');
  assert.ok(diag, 'diagnostic must be in the real results');
  assert.strictEqual(diag.layers.api, true, 'diagnostic has a real, confirmed-live /health endpoint — the detector must see it');
});

test('SCA-003', 'BUGFIX: bridge now correctly shows api:true via its real server.js, not its thin index.js wrapper', () => {
  const r = systemCheck.run();
  const bridge = r.results.find(s => s.system === 'bridge');
  assert.strictEqual(bridge.layers.api, true, 'bridge/server.js (not the index.js thin wrapper) has the real, inline routes');
});

test('SCA-004', 'BUGFIX: architect now correctly shows api:true (a third real path-variable naming convention, path_)', () => {
  const r = systemCheck.run();
  const architect = r.results.find(s => s.system === 'architect');
  assert.strictEqual(architect.layers.api, true);
});

test('SCA-005', 'idearium still correctly shows api:true via the ORIGINAL check (a real, separate api/ folder) — the fix is additive, not a replacement', () => {
  const r = systemCheck.run();
  const idearium = r.results.find(s => s.system === 'idearium');
  assert.strictEqual(idearium.layers.api, true);
});

test('SCA-006', 'HONEST: emerge correctly, still shows api:false \u2014 a real, accurate result, not a remaining bug', () => {
  const fs = require('fs');
  const src = fs.readFileSync(path.join(ROOT, 'emerge/consumer.js'), 'utf8');
  assert.ok(/no http\.createServer/.test(src), 'emerge\u2019s own real code comment must still say it is a library, not a service — confirms this is genuinely accurate, not a detector gap');
  const r = systemCheck.run();
  const emerge = r.results.find(s => s.system === 'emerge');
  assert.strictEqual(emerge.layers.api, false, 'a real system with no real HTTP server must not be reported as having one');
});

test('SCA-007', 'every real, known system now shows api:true EXCEPT the one genuinely, honestly library-only system', () => {
  const r = systemCheck.run();
  const falseApis = r.results.filter(s => s.layers.api === false).map(s => s.system);
  assert.deepStrictEqual(falseApis, ['emerge'], `expected only emerge to show api:false, got: ${JSON.stringify(falseApis)}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
