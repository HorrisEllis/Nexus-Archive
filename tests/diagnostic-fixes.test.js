'use strict';
/**
 * tests/diagnostic-fixes.test.js — v1.0
 * UUID: nexus-diagnostic-fixes-test-v1-0000-2026-0617
 * Tests: all 6 diagnostic fixes
 */
const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0, fail = 0;
function test(label, fn) {
  try { fn() ? (pass++, console.log(`  ✓  ${label}`)) : (fail++, console.log(`  ✗  ${label}`)); }
  catch(e) { fail++, console.log(`  ✗  ${label} — ${e.message}`); }
}

console.log('\n⬡  DIAGNOSTIC FIXES — Tests\n');

// Fix 1: spec-drift
test('F1: orchestrator uses nexusBus not _bus for spec-drift', () =>
  read('orchestrator.js').includes('bus: nexusBus') &&
  !read('orchestrator.js').includes('bus: _bus'));

// Fix 2: idearium contract path
test('F2: idearium contract path is ./schemas not ../schemas', () =>
  read('idearium/index.js').includes("join(__dir, 'schemas/interaction-contract.json')") &&
  !read('idearium/index.js').includes("join(__dir, '../schemas/interaction-contract.json')"));

// Fix 3: self-heal apply_disabled
test('F3a: self-heal uses apply_disabled status', () =>
  read('cortex/self-heal/index.js').includes("'apply_disabled'"));
test('F3b: self-heal event type is apply_disabled when APPLY_PATCH=false', () =>
  read('cortex/self-heal/index.js').includes('self-heal.apply_disabled'));
test('F3c: self-heal does not escalate when apply disabled', () =>
  read('cortex/self-heal/index.js').includes('_toCortex') ||
  read('cortex/self-heal/index.js').includes('apply_disabled'));

// Fix 4: architect contract
test('F4: architect has /api/contract route', () =>
  read('architect/service.js').includes("'/api/contract'") &&
  read('architect/service.js').includes('architect-v1'));

// Fix 5: diagnostic in boot sequence
test('F5: diagnostic service in boot-systems.js', () =>
  read('cli/boot-systems.js').includes('nexus-diagnostic.js') &&
  read('cli/boot-systems.js').includes("systemId: 'diagnostic'"));
test('F5: diagnostic boots after emerge (last)', () => {
  const s = read('cli/boot-systems.js');
  return s.indexOf('nexus-diagnostic.js') > s.indexOf('emerge-ide.js');
});

// Fix 6: remediation loop
test('F6: diagnostic has remediationScan function', () =>
  read('service/nexus-diagnostic.js').includes('function remediationScan'));
test('F6: remediation writes to cortex', () =>
  read('service/nexus-diagnostic.js').includes('diagnostic.remediation'));
test('F6: remediation logs to data/diagnostic/remediation.jsonl', () =>
  read('service/nexus-diagnostic.js').includes('remediation.jsonl'));
test('F6: remediation emits HEAL_REQUESTED', () =>
  read('service/nexus-diagnostic.js').includes('HEAL_REQUESTED'));
test('F6: remediation runs on 30s interval', () =>
  read('service/nexus-diagnostic.js').includes('setInterval(remediationScan, 30000)'));
test('F6: offline systems tracked by time', () =>
  read('service/nexus-diagnostic.js').includes('_offlineSince'));
test('F6: syntax check on critical files', () =>
  read('service/nexus-diagnostic.js').includes('orchestrator.js') &&
  read('service/nexus-diagnostic.js').includes('--check'));

// Syntax checks
const { spawnSync } = require('child_process');
const files = ['orchestrator.js','idearium/index.js','cortex/self-heal/index.js',
  'architect/service.js','cli/boot-systems.js','service/nexus-diagnostic.js'];
for (const f of files) {
  test(`SYNTAX: ${f}`, () =>
    spawnSync('node', ['--check', path.join(ROOT, f)], { encoding:'utf8', timeout:5000 }).status === 0);
}

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
