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
const { mapObservability } = require('./maps/observability-map');
const { mapCopilotCapability } = require('./maps/copilot-capability-map');
const { mapUi } = require('./maps/ui-map');

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

// §PHASEMAP observability/tablet (2026-07-30) — these components are mapped WITH
// their real require() edges as wires by mapObservability() below (see
// loom/maps/observability-map.js), NOT as bare declarations here. The registry is
// the system's self-model of its connections (James): a component without its
// wires is an isolated dot the system can't reason over. Mapped, not just listed.
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

// ── WHOLE TREE — scanned from source, FIRST so later maps' wires resolve ────
// §2026-08-08. This tree carries loom/scanners/capability-map.js and
// spec-map.js but NOT source-map.js, and bootstrap never invoked any of the
// three. Result before this change, measured: 62 components with 195
// hard-rejected wires (loom.wire-endpoints-exist), because the hand maps wire
// into components no one declares. The scan runs FIRST and declares an .export
// hook per file, so the hand maps below have real endpoints to terminate on.
// Their own files are excluded by path so nothing is declared twice.
const { scanTree, mapSource } = require('./scanners/source-map');
const { mapCapabilities } = require('./scanners/capability-map');
const { mapSpecs } = require('./scanners/spec-map');
const handMapped = [
  ...require('./maps/warp-map').FILES.map(f => f[0]),
  ...require('./maps/observability-map').FILES.map(f => f[0]),
  ...require('./maps/copilot-capability-map').FILES.map(f => f[0]),
  ...require('./maps/ui-map').FILES.map(f => f[0]),
  'loom/agent-suite/index.js',
];
console.log('\nscanning whole tree from source (real require/import edges only)...\n');
const scan = scanTree({ excludePaths: handMapped });
console.log(`  files scanned:    ${scan.stats.scanned} (${scan.stats.excluded} hand-mapped, excluded)`);
console.log(`  edges found:      ${scan.stats.totalEdges}`);
console.log(`  NOT captured:     ${scan.stats.dynamicRequiresNotCaptured} dynamic require()/import() — no static reader resolves these`);
console.log(`  unresolved specs: ${scan.stats.unresolvedSpecifiers} (see loom/scanners/dangling-report.js)`);
// §BOUNDARY EXPORTS — a hand-mapped file that the scanned tree requires needs
// an .export hook, or every wire INTO it is hard-rejected. The hand maps only
// declare .export for ids inside their own requiredBy set, so cross-boundary
// consumers (jaa-db, meta/cfr/index, ...) had none. 69 wires died on this.
const { idFor } = require('./scanners/source-map');
const scannedTargets = new Set(scan.FILES.flatMap(f => f[2]));
let boundaryHooks = 0;
for (const file of handMapped) {
  const id = idFor(file);
  if (!scannedTargets.has(id)) continue;
  const r = driver.declare('hook', {
    id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
    uuid: `nexus-loom-boundary-${id}-export-v1-0000-2026-0808-001`,
  });
  if (r.ok) boundaryHooks++;
}
console.log(`  boundary .export hooks for hand-mapped files required by the tree: ${boundaryHooks}`);
const mappedSrc = mapSource(driver, scan.FILES);
console.log(`  components: ${mappedSrc.components.length} ok   hooks: ${mappedSrc.hooks.length} ok   wires: ${mappedSrc.wires.length} ok`);
if (mappedSrc.failures.length) {
  console.log(`  FAILURES: ${mappedSrc.failures.length}`);
  for (const f of mappedSrc.failures.slice(0, 6)) console.log(`    ${JSON.stringify(f).slice(0, 200)}`);
  failures += mappedSrc.failures.length;
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

// ── Observability/tablet arc — components mapped WITH real require() wires ──
console.log('\nmapping observability/tablet arc (real require() edges only)...\n');
const mappedObs = mapObservability(driver);
console.log(`  components: ${mappedObs.components.length} ok`);
console.log(`  hooks:      ${mappedObs.hooks.length} ok`);
console.log(`  wires:      ${mappedObs.wires.length} ok`);
if (mappedObs.failures.length) {
  console.log(`  FAILURES:`);
  for (const f of mappedObs.failures) console.log(`    ${JSON.stringify(f)}`);
  failures += mappedObs.failures.length;
}

// ── Copilot-capability tool session (2026-08-12) — real require/HTTP edges ──
console.log('\nmapping copilot-capability tools (real require()/HTTP edges only)...\n');
const mappedCC = mapCopilotCapability(driver);
console.log(`  components: ${mappedCC.components.length} ok`);
console.log(`  hooks:      ${mappedCC.hooks.length} ok`);
console.log(`  wires:      ${mappedCC.wires.length} ok`);

// ── UI files (2026-08-13) — plain UI, real HTTP-shaped edges only ──────────
console.log('\nmapping ui files...\n');
const mappedUi = mapUi(driver);
console.log(`  components: ${mappedUi.components.length} ok`);
console.log(`  hooks:      ${mappedUi.hooks.length} ok`);
console.log(`  wires:      ${mappedUi.wires.length} ok`);
if (mappedCC.failures.length) {
  console.log(`  FAILURES:`);
  for (const f of mappedCC.failures) console.log(`    ${JSON.stringify(f)}`);
  failures += mappedCC.failures.length;
}

// ── CAPABILITY / CONSUMER registry — the semantic graph ────────────────────
console.log('\nmapping capability/consumer registry...\n');
const mappedCap = mapCapabilities(driver);
console.log(`  capabilities: ${mappedCap.total}  components: ${mappedCap.components.length}  hooks: ${mappedCap.hooks.length}  wires: ${mappedCap.wires.length}`);
console.log(`  ROUTES DECLARED BUT SERVED BY NOTHING: ${mappedCap.unserved.length}`);
for (const u of mappedCap.unserved) console.log(`    ${u.id.padEnd(28)} ${u.route}`);
console.log(`  CONSUMER WIRES THAT DO NOT RESOLVE: ${mappedCap.dangling.length}`);
for (const d of mappedCap.dangling) console.log(`    ${d.from} -> ${d.target}  (${d.why})`);
if (mappedCap.failures.length) { console.log(`  FAILURES: ${mappedCap.failures.length}`); failures += mappedCap.failures.length; }

// ── SPEC layer ─────────────────────────────────────────────────────────────
console.log('\nmapping spec layer...\n');
const mappedSpec = mapSpecs(driver);
console.log(`  specs: ${mappedSpec.specs}  routes: ${mappedSpec.routes}  components: ${mappedSpec.components.length}  wires: ${mappedSpec.wires.length}`);
console.log(`  §6.3 SPECS NOT TRACKED IN SPEC-REGISTRY.md: ${mappedSpec.untracked.length}`);
console.log(`  SPEC ROUTES SERVED BY NOTHING: ${mappedSpec.unserved.length}`);
if (mappedSpec.failures.length) { console.log(`  FAILURES: ${mappedSpec.failures.length}`); failures += mappedSpec.failures.length; }

console.log(`\nWritten to: loom/data/registry.json\n`);
if (failures > 0) process.exit(1);

if (failures > 0) process.exit(1);
