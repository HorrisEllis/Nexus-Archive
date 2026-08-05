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
const { mapRelationalField, mapBoundary } = require('./maps/relational-field-map');

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
seed.push(['hook', driver.declare('hook', {
  id: 'nexus.loom.agent-suite.export', component_id: 'nexus.loom.agent-suite',
  name: 'export', type: 'direct', direction: 'out',
  uuid: 'nexus-loom-agent-suite-hook-export-v1-0000-2026-0804-001',
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

// ── Boundary components — MUST precede every map that wires into them ─────
// §2026-08-04 — see loom/maps/relational-field-map.js's BOUNDARY block: 11 of
// the observability map's 18 wires have been hard-rejected on every bootstrap
// since 0.19.1 because their endpoint components were never declared. Declared
// first so both maps' cross-boundary wires can actually resolve.
console.log('\ndeclaring boundary components (endpoints for cross-map wires)...\n');
const mappedBoundary = mapBoundary(driver);
console.log(`  components: ${mappedBoundary.components.length} ok`);
console.log(`  hooks:      ${mappedBoundary.hooks.length} ok`);
if (mappedBoundary.failures.length) {
  console.log(`  FAILURES:`);
  for (const f of mappedBoundary.failures) console.log(`    ${JSON.stringify(f)}`);
  failures += mappedBoundary.failures.length;
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

// §ORDER 2026-08-04 — this block runs BEFORE the observability map on purpose.
// The observability map wires into nexus.meta.cfr.field, nexus.meta.cfr.delta
// and nexus.cortex.intelligence.mastermind; those components are declared here,
// and loom.wire-endpoints-exist hard-rejects a wire whose endpoint does not yet
// exist. Declared-before-wired is the ordering the axiom requires.
// ── CFR + RFR2 + intelligence — the two causal substrates, side by side ──
// §2026-08-04 — until now not one file under meta/cfr/ or meta/rfr2/ was a
// declared component, so the overlap between them was invisible to the
// registry and to every consumer that reads it. Mapped with real require()
// edges only; see loom/maps/relational-field-map.js for what this makes
// visible and for the one dependency (boot.js's injected causal-graph class)
// deliberately NOT represented as a wire.
console.log('\nmapping cfr + rfr2 + intelligence (real require() edges only)...\n');
const mappedRF = mapRelationalField(driver);
console.log(`  components: ${mappedRF.components.length} ok`);
console.log(`  hooks:      ${mappedRF.hooks.length} ok`);
console.log(`  wires:      ${mappedRF.wires.length} ok`);
if (mappedRF.failures.length) {
  console.log(`  FAILURES:`);
  for (const f of mappedRF.failures) console.log(`    ${JSON.stringify(f)}`);
  failures += mappedRF.failures.length;
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

// ── WHOLE TREE — scanned from source, not hand-listed ─────────────────────
// §2026-08-04 (James: "update the registry — that's the whole point, so that
// this doesn't happen"). The four passes above are hand-authored and between
// them describe 65 files. The tree has ~860. A hand-written map can only cover
// what its author was looking at, which is why this registry held 68 components
// while 280 were declared in the per-system registry-components.js files. The
// scanner reads the tree instead. Files already declared above are excluded by
// PATH so nothing is declared twice.
const { scanTree, mapSource } = require('./scanners/source-map');
const handMapped = [
  ...require('./maps/warp-map').FILES.map(f => f[0]),
  ...require('./maps/observability-map').FILES.map(f => f[0]),
  ...require('./maps/relational-field-map').FILES.map(f => f[0]),
  ...require('./maps/relational-field-map').BOUNDARY.map(f => f[0]),
  // Hand-seeded above with the id nexus.loom.agent-suite; the scanner derives
  // the same id from its path, and loom.unique-id (correctly) hard-rejects the
  // second declaration. Excluded by path rather than letting it fail.
  'loom/agent-suite/index.js',
];
console.log('\nscanning whole tree from source (real require/import edges only)...\n');
const scan = scanTree({ excludePaths: handMapped });
console.log(`  files scanned:   ${scan.stats.scanned} (${scan.stats.excluded} already hand-mapped)`);
console.log(`  files with edges: ${scan.stats.withEdges}`);
console.log(`  edges found:      ${scan.stats.totalEdges}`);
console.log(`  NOT captured:     ${scan.stats.dynamicRequiresNotCaptured} dynamic require()/import() — no static reader can resolve these`);
console.log(`  unresolved specs: ${scan.stats.unresolvedSpecifiers} (relative requires pointing at nothing on disk — see loom/scanners/dangling-report.js)`);
const mappedSrc = mapSource(driver, scan.FILES);
console.log(`  components: ${mappedSrc.components.length} ok`);
console.log(`  hooks:      ${mappedSrc.hooks.length} ok`);
console.log(`  wires:      ${mappedSrc.wires.length} ok`);
if (mappedSrc.failures.length) {
  console.log(`  FAILURES:   ${mappedSrc.failures.length}`);
  for (const f of mappedSrc.failures.slice(0, 20)) console.log(`    ${JSON.stringify(f).slice(0, 220)}`);
  if (mappedSrc.failures.length > 20) console.log(`    ... and ${mappedSrc.failures.length - 20} more`);
  failures += mappedSrc.failures.length;
}

// ── CAPABILITY / CONSUMER registry — the OTHER graph ──────────────────────
// §2026-08-04 (James: "I want this all mapped to the component and consumer
// registry"). The scan above is the FILE graph — who requires whom. This is the
// CAPABILITY graph — who consumes whom across service boundaries, declared by
// each system in its own registry-components.js. 280 declarations that have
// never been in loom, in a separate id namespace so neither graph is corrupted
// by the other. Routes are verified against real source before being treated
// as surfaces (§1.1); wires that cannot resolve are reported, not invented.
const { mapCapabilities } = require('./scanners/capability-map');
console.log('\nmapping capability/consumer registry (13 registry-components.js files)...\n');
const mappedCap = mapCapabilities(driver);
console.log(`  capabilities declared: ${mappedCap.total}`);
console.log(`  components: ${mappedCap.components.length} ok`);
console.log(`  hooks:      ${mappedCap.hooks.length} ok`);
console.log(`  wires:      ${mappedCap.wires.length} ok`);
console.log(`  DUPLICATE IDS resolved by version: ${mappedCap.duplicates.length}`);
for (const d of mappedCap.duplicates.slice(0, 3)) console.log(`    ${d.id} — kept ${d.kept}, dropped ${d.dropped}${d.sameRoute ? ' (same route — stale copy)' : ' (ROUTES DIFFER)'}`);
if (mappedCap.duplicates.length > 3) console.log(`    ... and ${mappedCap.duplicates.length - 3} more, all the same two files`);
console.log(`  ROUTES DECLARED BUT SERVED BY NOTHING: ${mappedCap.unserved.length}`);
for (const u of mappedCap.unserved) console.log(`    ${u.id.padEnd(30)} ${u.route}   (declared in ${u.declaredIn})`);
console.log(`  CONSUMER WIRES THAT DO NOT RESOLVE: ${mappedCap.dangling.length}`);
for (const d of mappedCap.dangling) console.log(`    ${d.from} -> ${d.target}\n      ${d.why}`);
if (mappedCap.failures.length) {
  console.log(`  FAILURES:   ${mappedCap.failures.length}`);
  for (const f of mappedCap.failures.slice(0, 15)) console.log(`    ${JSON.stringify(f).slice(0, 200)}`);
  failures += mappedCap.failures.length;
}

// ── SPEC layer — checked against the registry AND against source ──────────
// §2026-08-04 (James: "make sure the specs are also checked in relation to the
// registry and the consumers"). Three layers, three kinds of claim: SPEC what
// it is supposed to be, CAPABILITY what each system declares it provides,
// SOURCE what actually runs. Joined only on EXACT route match — see the long
// note in spec-map.js on why the obvious spec-vs-registry diff is NOT done and
// would produce ~100 false findings.
const { mapSpecs } = require('./scanners/spec-map');
console.log('\nmapping spec layer (authored .spec files)...\n');
const mappedSpec = mapSpecs(driver);
console.log(`  specs: ${mappedSpec.specs}  routes declared: ${mappedSpec.routes}`);
console.log(`  components: ${mappedSpec.components.length} ok`);
console.log(`  hooks:      ${mappedSpec.hooks.length} ok`);
console.log(`  wires:      ${mappedSpec.wires.length} ok (spec -> capability, exact route match)`);
console.log(`  SAME SPEC IN TWO PLACES: ${mappedSpec.duplicates.length}`);
for (const d of mappedSpec.duplicates) console.log(`    ${d.name.padEnd(12)} ${d.a} vs ${d.b} — ${d.identical ? 'byte-identical (pure duplication)' : `DIVERGED (${d.lines[0]} vs ${d.lines[1]} lines)`}`);
console.log(`  §6.3 SPECS NOT TRACKED IN SPEC-REGISTRY.md: ${mappedSpec.untracked.length}`);
for (const u of mappedSpec.untracked) console.log(`    ${u}`);
console.log(`  SPEC ROUTES SERVED BY NOTHING: ${mappedSpec.unserved.length}`);
for (const u of mappedSpec.unserved) console.log(`    ${u.spec.padEnd(34)} ${u.route}`);
console.log(`  UNJOINED (stated gap, NOT drift — see RF-20): ${mappedSpec.unjoined.length}`);
if (mappedSpec.failures.length) {
  console.log(`  FAILURES:   ${mappedSpec.failures.length}`);
  for (const f of mappedSpec.failures.slice(0, 15)) console.log(`    ${JSON.stringify(f).slice(0, 200)}`);
  failures += mappedSpec.failures.length;
}

console.log(`\nWritten to: loom/data/registry.json\n`);
if (failures > 0) process.exit(1);
