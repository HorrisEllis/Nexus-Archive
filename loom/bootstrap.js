'use strict';
/**
 * loom/bootstrap.js — seeds loom/data/registry.json.
 * v2: replaces the earlier monolithic 'nexus.warp' single-component
 * registration with the real per-file map (loom/maps/warp-map.js) —
 * that first attempt had the wrong surface area, corrected here.
 *
 * Run: node loom/bootstrap.js
 */
const { LoomDriver } = require('./schema/index');
const { mapWarp } = require('./maps/warp-map');

const driver = new LoomDriver(); // default dataDir = loom/data/

// ── LOOM and the Architect — one component each, they aren't Warp files ────
const seed = [];
seed.push(['component', driver.declare('component', {
  id: 'nexus.loom', namespace: 'loom', name: 'LOOM', version: '0.1.0',
  uuid: 'nexus-loom-v1-0000-2026-0701-jamesbrooks-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.architect', namespace: 'architect', name: 'The Architect', version: '1.1.0',
  uuid: 'architect-spec-0000-2026-0530-rheon-002',
})]);

// §PHASEMAP observability/tablet (2026-07-30) — register the tablet + diagnostic
// components built this session, so loom's registry reflects them (§always-update).
seed.push(['component', driver.declare('component', {
  id: 'nexus.tablet', namespace: 'tablet', name: 'NEXUS Tablet', version: '2.0.0',
  uuid: 'nexus-tablet-homepage-v2-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.copilot.diagnostics', namespace: 'copilot', name: 'Live Diagnostics (OB1)', version: '1.0.0',
  uuid: 'nexus-copilot-diagnostics-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.copilot.diagnostic-sweep', namespace: 'copilot', name: 'Diagnostic Sweep (OB2)', version: '1.0.0',
  uuid: 'nexus-copilot-diagnostic-sweep-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.sigma-roles', namespace: 'meta', name: 'Sigma Roles (OB10)', version: '1.0.0',
  uuid: 'nexus-sigma-roles-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.pattern-leverage', namespace: 'meta', name: 'Pattern Leverage (OB8)', version: '1.0.0',
  uuid: 'nexus-pattern-leverage-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.edge-cases', namespace: 'meta', name: 'Edge Cases (OB11)', version: '1.0.0',
  uuid: 'nexus-edge-cases-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.tablet.map3d', namespace: 'tablet', name: '3D Map (OB9)', version: '1.0.0',
  uuid: 'nexus-tablet-map3d-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.copilot.optimizer', namespace: 'copilot', name: 'Optimizer (OB7)', version: '1.0.0',
  uuid: 'nexus-copilot-optimizer-v1-0000-2026-0730-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.copilot.movement-map', namespace: 'copilot', name: 'Movement Map + Bottlenecks (OB3/OB4)', version: '1.0.0',
  uuid: 'nexus-copilot-movement-map-v1-0000-2026-0730-001',
})]);
seed.push(['hook', driver.declare('hook', {
  id: 'loom.hook.declare', component_id: 'nexus.loom', name: 'declare',
  type: 'callto', direction: 'in',
  uuid: 'nexus-loom-hook-declare-v1-0000-2026-0701-jamesbrooks-001',
})]);
seed.push(['component', driver.declare('component', {
  id: 'nexus.loom.agent-suite', namespace: 'loom', name: 'LOOM Agent Suite', version: '0.1.0',
  uuid: 'nexus-loom-agent-suite-v1-0000-2026-0701-jamesbrooks-001',
})]);
seed.push(['hook', driver.declare('hook', {
  id: 'loom.agent-suite.hook.declare-via-agent', component_id: 'nexus.loom.agent-suite',
  name: 'declare-via-agent', type: 'callto', direction: 'in',
  uuid: 'nexus-loom-agent-suite-hook-declare-v1-0000-2026-0701-jamesbrooks-001',
})]);
seed.push(['wire', driver.declare('wire', {
  id: 'wire.agent-suite-uses-loom-declare', from_hook_id: 'loom.hook.declare',
  to_hook_id: 'loom.agent-suite.hook.declare-via-agent',
  uuid: 'nexus-loom-wire-agent-suite-v1-0000-2026-0701-jamesbrooks-001',
})]);

let failures = 0;
for (const [kind, r] of seed) {
  if (r.ok) console.log(`  OK    ${kind}: ${r.stored.id}`);
  else { failures++; console.log(`  FAIL  ${kind}: ${JSON.stringify(r)}`); }
}

// ── Warp — 17 real components (one per file), per-file hooks, real-require wires ──
console.log('\nmapping warp/ (17 files, real require() edges only)...\n');
const mapped = mapWarp(driver);
console.log(`  components: ${mapped.components.length} ok`);
console.log(`  hooks:      ${mapped.hooks.length} ok`);
console.log(`  wires:      ${mapped.wires.length} ok`);
if (mapped.failures.length) {
  console.log(`  FAILURES:`);
  for (const f of mapped.failures) console.log(`    ${JSON.stringify(f)}`);
  failures += mapped.failures.length;
}

console.log(`\nWritten to: loom/data/registry.json\n`);
if (failures > 0) process.exit(1);
