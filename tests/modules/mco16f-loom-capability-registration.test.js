'use strict';

/**
 * tests/modules/mco16f-loom-capability-registration.test.js
 *
 * §MCO16f 2026-09-13 — James: "copilot's tools and capabilities... pointed
 * to loom, the dynamic map registry." Real test: loom/scanners/
 * capability-map.js's own verifyRoutes() — the actual mechanism that
 * decides whether a declared capability is real or a dangling claim —
 * confirms both new routes (copilot's /api/tools, ollama's /commands)
 * are genuinely served by their real source files, not just declared.
 */

const assert = require('assert');
const { loadAll, verifyRoutes } = require('../../loom/scanners/capability-map.js');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.message}`); }
}

const decls = loadAll();
const { served, unserved } = verifyRoutes(decls);

test('LOOM-001: copilot.tools.list is declared in copilot/registry-components.js', () => {
  assert.ok(decls.some(d => d.id === 'copilot.tools.list'), 'copilot.tools.list must be a real declared component');
});

test('LOOM-002: copilot.tools.list is verified SERVED — GET /api/tools genuinely exists in copilot/server.js', () => {
  assert.strictEqual(served.get('copilot.tools.list'), true);
});

test('LOOM-003: ollama.commands is declared in ollama/registry-components.js', () => {
  assert.ok(decls.some(d => d.id === 'ollama.commands'), 'ollama.commands must be a real declared component');
});

test('LOOM-004: ollama.commands is verified SERVED — GET /commands genuinely exists in ollama/server.js', () => {
  assert.strictEqual(served.get('ollama.commands'), true);
});

test('LOOM-005: neither new declaration appears in the unserved (dangling-claim) list', () => {
  const danglingIds = unserved.map(u => u.id);
  assert.ok(!danglingIds.includes('copilot.tools.list'));
  assert.ok(!danglingIds.includes('ollama.commands'));
});

console.log(`\n  mco16f-loom-capability-registration: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
