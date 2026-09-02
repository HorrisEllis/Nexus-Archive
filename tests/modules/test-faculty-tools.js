'use strict';
// P5 — faculty-as-tool adapters (docs/copilot-omniscience-phasemap.spec). The
// copilot faculties (module-builder, adversarial, axiom-manager, analysis) are
// now callable through the agentic loop as tools, WITHOUT moving them (§16.5).
// Both copilot's and Guardian's loops get them.

// Silence jaa store logging so the runner parses the result line.
const _log = console.log;
console.log = (...a) => { if (typeof a[0] === 'string' && a[0].startsWith('[jaa]')) return; _log(...a); };

const assert = require('assert');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); _log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { _log(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const at = require(path.join(ROOT, 'lib/agent-tools'));

(async () => {
  await test('T-001', 'all five faculty tools are registered alongside the base tools', () => {
    const names = at.getToolSchemas().map(s => (s.function ? s.function.name : s.name));
    for (const t of ['module_builder', 'run_adversarial', 'axiom_check', 'analyze', 'synthesize']) {
      assert.ok(names.includes(t), `${t} must be registered`);
    }
    assert.ok(at.TOOLS.size >= 15, `expected >=15 tools, got ${at.TOOLS.size}`);
  });

  await test('T-002', 'axiom_check executes through the loop and returns a real result', async () => {
    const r = await at.executeTool('axiom_check', { text: 'a proposed action to check' });
    assert.ok(r && (r.ok || r.result), 'axiom_check must return a real result');
  });

  await test('T-003', 'faculty tools validate their required params (fail loud, not silent)', async () => {
    const r = await at.executeTool('module_builder', {});
    assert.ok(r.error, 'missing description must error, not silently proceed');
  });

  await test('T-004', 'the faculties were WRAPPED, not moved — they still live in copilot/', () => {
    const fs = require('fs');
    for (const f of ['module-builder', 'adversarial', 'axiom-manager', 'analysis']) {
      assert.ok(fs.existsSync(path.join(ROOT, 'copilot', `${f}.js`)), `copilot/${f}.js must still exist (§16.5)`);
    }
    // and the adapter file is separate, in agent-tools
    assert.ok(fs.existsSync(path.join(ROOT, 'lib/agent-tools/tools/faculty/faculty-tools.js')), 'adapters live in agent-tools');
  });

  await test('T-005', 'synthesize is wired to the real officiator.synthesizeFromContext, not a stub', async () => {
    const r = await at.executeTool('synthesize', {});
    assert.ok(r.error && r.error.includes('contextText is required'), 'must validate params through the real function, not a fake success');
  });

  _log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
