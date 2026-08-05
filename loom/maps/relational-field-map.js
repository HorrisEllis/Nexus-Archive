'use strict';
/**
 * loom/maps/relational-field-map.js — maps the TWO causal substrates
 * (meta/cfr/ and meta/rfr2/) and the intelligence system into LOOM's
 * component/hook/wire registry, one component per FILE, wired only by REAL
 * require() edges verified against the actual source — mirroring
 * loom/maps/warp-map.js and loom/maps/observability-map.js exactly.
 * comp_id: nexus.loom.maps.relational-field
 * UUID: nexus-loom-map-relational-field-v1-0000-2026-0804-001
 *
 * WHY (James, 2026-08-04): "RFR2 and CFR are not supposed to overlap — they're
 * supposed to click together." CFR is the Constraint Field Runtime: it gives
 * shape to the field. RFR2 reads relation and meaning across it. The registry
 * is how the system stays aware of itself, and until now it could not see this
 * relationship at all: not one file under meta/cfr/ or meta/rfr2/ was a
 * declared component, so the single most important structural question in the
 * codebase was invisible to every consumer of the registry — the diagnostic
 * wire-integrity scan, the movement map, the bottleneck detector, gap-hunter.
 *
 * The map does not take a side. It declares what is true today so the overlap
 * becomes a thing the system can reason over instead of a thing only James can
 * see. What it makes visible, once loaded:
 *
 *   - meta/rfr2/kernel/index.js (570 lines) is an append-only event ring with
 *     its own causal graph. meta/cfr/graph.js (284 lines) is a causal graph.
 *     Both are declared. Their duplication is now a fact in the registry.
 *   - 12 of RFR2's 17 sub-engines have no consumer outside meta/rfr2/ itself.
 *     In this graph they are reachable only from rfr2/index.js — the shape of
 *     a library nothing calls, which is exactly what the registry should show.
 *   - CFR reaches 26 real require() sites across NEXUS. RFR2 reaches 4.
 *
 * EDGE RULE (same as warp-map and observability-map): node builtins don't
 * count; only real internal NEXUS require() edges are wires. Every edge below
 * was extracted from source with comments and template literals stripped
 * first — an earlier pass without that stripping produced four phantom edges
 * from `require()` calls that appear inside docblocks and inside generated-code
 * strings (meta/cfr/index.js's usage example, meta/rfr2/compress/index.js's
 * emitted module text). None of those four are in this map. That failure mode
 * is the whole reason this file exists, so it is recorded rather than tidied.
 *
 * NOT REPRESENTED HERE, deliberately:
 *   cortex/boot.js:119 constructs mastermind with an INJECTED causal-graph
 *   class (`getCausalGraphClass: _getCausalGraphClass`, boot.js:97). That is a
 *   real dependency and it is how intelligence actually reaches CFR — but it
 *   is not a require() edge, and this registry's edge rule is require-only.
 *   Inventing a wire for it would be the same error as the one corrected in
 *   observability-map.js this session. It is tracked as RF-6 in
 *   docs/RELATIONAL-FIELD-PHASEMAP.spec: the registry cannot currently express
 *   injected dependencies at all, and that is a gap in the registry, not in
 *   the code it is describing.
 */

// [file, namespace.id, requires (real internal edges, verified against source
//  with comments + template literals stripped)]
// Edges to components OUTSIDE this set (jaa-db, self-register, nexus-bus,
// component-ledger, meta/causal/compound) are declared as wires to those
// existing ids so the graph joins the rest of NEXUS.
const FILES = [
  // ── CFR — Constraint Field Runtime (the field's shape) ──────────────────
  ['meta/cfr/index.js',              'nexus.meta.cfr.index',
    ['nexus.meta.cfr.contract-verifier', 'nexus.meta.cfr.delta', 'nexus.meta.cfr.field',
     'nexus.meta.cfr.graph', 'nexus.meta.cfr.ledger', 'nexus.meta.cfr.sigma']],
  ['meta/cfr/graph.js',              'nexus.meta.cfr.graph', []],
  ['meta/cfr/field.js',              'nexus.meta.cfr.field', []],
  ['meta/cfr/delta.js',              'nexus.meta.cfr.delta', []],
  ['meta/cfr/contract-verifier.js',  'nexus.meta.cfr.contract-verifier', []],
  ['meta/cfr/sigma.js',              'nexus.meta.cfr.sigma',
    ['nexus.lib.component-ledger']],
  ['meta/cfr/ledger.js',             'nexus.meta.cfr.ledger',
    ['nexus.meta.cfr.delta', 'nexus.meta.cfr.field', 'nexus.meta.cfr.graph',
     'nexus.meta.cfr.sigma', 'nexus.meta.causal.compound']],

  // ── RFR2 — the relational field reader (meaning across the field) ───────
  ['meta/rfr2/index.js',             'nexus.meta.rfr2.index',
    ['nexus.meta.rfr2.adapter', 'nexus.meta.rfr2.adapter-sandbox', 'nexus.meta.rfr2.causality',
     'nexus.meta.rfr2.clip', 'nexus.meta.rfr2.compress', 'nexus.meta.rfr2.context',
     'nexus.meta.rfr2.delta', 'nexus.meta.rfr2.enforcement', 'nexus.meta.rfr2.forge',
     'nexus.meta.rfr2.identity', 'nexus.meta.rfr2.kernel', 'nexus.meta.rfr2.observer',
     'nexus.meta.rfr2.query', 'nexus.meta.rfr2.sigma', 'nexus.meta.rfr2.time',
     'nexus.meta.rfr2.version-gate']],
  ['meta/rfr2/kernel/index.js',      'nexus.meta.rfr2.kernel',
    ['nexus.meta.rfr2.causality', 'nexus.meta.rfr2.identity', 'nexus.meta.rfr2.time']],
  ['meta/rfr2/causality/index.js',   'nexus.meta.rfr2.causality', []],
  ['meta/rfr2/sigma/index.js',       'nexus.meta.rfr2.sigma', []],
  ['meta/rfr2/identity/index.js',    'nexus.meta.rfr2.identity', []],
  ['meta/rfr2/time/index.js',        'nexus.meta.rfr2.time', []],
  ['meta/rfr2/lazy/index.js',        'nexus.meta.rfr2.lazy', []],
  ['meta/rfr2/delta/index.js',       'nexus.meta.rfr2.delta',
    ['nexus.meta.rfr2.identity', 'nexus.meta.rfr2.lazy']],
  ['meta/rfr2/adapter/index.js',     'nexus.meta.rfr2.adapter',
    ['nexus.meta.rfr2.causality']],
  ['meta/rfr2/adapter-sandbox/index.js', 'nexus.meta.rfr2.adapter-sandbox', []],
  ['meta/rfr2/compress/index.js',    'nexus.meta.rfr2.compress',
    ['nexus.meta.rfr2.adapter', 'nexus.meta.rfr2.kernel']],
  ['meta/rfr2/context/index.js',     'nexus.meta.rfr2.context',
    ['nexus.meta.rfr2.adapter-sandbox', 'nexus.meta.rfr2.compress', 'nexus.meta.rfr2.delta',
     'nexus.meta.rfr2.kernel', 'nexus.meta.rfr2.sigma']],
  ['meta/rfr2/clip/index.js',        'nexus.meta.rfr2.clip',
    ['nexus.meta.rfr2.causality', 'nexus.meta.rfr2.compress', 'nexus.meta.rfr2.context',
     'nexus.meta.rfr2.delta', 'nexus.meta.rfr2.identity', 'nexus.meta.rfr2.kernel',
     'nexus.meta.rfr2.sigma', 'nexus.meta.rfr2.version-gate']],
  ['meta/rfr2/enforcement/index.js', 'nexus.meta.rfr2.enforcement', []],
  ['meta/rfr2/query/index.js',       'nexus.meta.rfr2.query', []],
  ['meta/rfr2/observer/index.js',    'nexus.meta.rfr2.observer', []],
  ['meta/rfr2/version-gate/index.js','nexus.meta.rfr2.version-gate', []],
  ['meta/rfr2/forge/index.js',       'nexus.meta.rfr2.forge', []],

  // ── The bridge and the intelligence system ──────────────────────────────
  ['lib/rfr2-bridge.js',             'nexus.lib.rfr2-bridge', []],
  ['cortex/intelligence/index.js',   'nexus.cortex.intelligence.index',
    ['nexus.cortex.jaa-db', 'nexus.lib.self-register', 'nexus.meta.cfr.graph', 'nexus.nexus-bus']],
  ['cortex/intelligence/mastermind.js', 'nexus.cortex.intelligence.mastermind',
    ['nexus.lib.rfr2-bridge']],
  ['cortex/intelligence/relational-field.js', 'nexus.cortex.intelligence.relational-field',
    ['nexus.lib.rfr2-bridge']],
  ['cortex/intelligence/intuition.js',   'nexus.cortex.intelligence.intuition', []],
  ['cortex/intelligence/adversarial.js', 'nexus.cortex.intelligence.adversarial', []],
];

// ── BOUNDARY components ───────────────────────────────────────────────────
// §FOUND 2026-08-04 — running loom/bootstrap.js and reading the FAILURES block
// instead of the summary line showed that 11 of the observability map's 18
// wires have been HARD-REJECTED on every bootstrap since 0.19.1, by
// loom.wire-endpoints-exist. The cause: both maps declare wires whose source
// is a component OUTSIDE their own FILES list (jaa-db, capability-registry,
// gap.hunter, ...), and neither map ever declares those components or their
// .export hooks. The axiom was working exactly as designed; nothing read its
// output. So 0.19.1's "9 components, 18 wires" is wrong — 8 wires landed. The
// claim that the graph "joins the rest of NEXUS" was the part that failed, and
// the join is the whole point.
//
// Among the rejected wires: nexus.lib.rfr2-bridge → relational-field. The one
// real RFR2-into-intelligence edge in the codebase has never been in the
// registry at all.
//
// These are declared as ENDPOINTS only: real files, verified present on disk,
// each given a component + an .export hook so wires into them resolve. Their
// OWN require() edges are deliberately not mapped here — mapping a file means
// reading it, and these have not been read for this purpose. They are honest
// boundary markers, not a claim to have mapped copilot, lib, or cortex/memory.
const BOUNDARY = [
  ['cortex/memory/jaa-db.js',    'nexus.cortex.jaa-db'],
  ['lib/self-register.js',       'nexus.lib.self-register'],
  ['nexus-bus.js',               'nexus.nexus-bus'],
  ['lib/component-ledger.js',    'nexus.lib.component-ledger'],
  ['meta/causal/compound.js',    'nexus.meta.causal.compound'],
  ['lib/capability-registry.js', 'nexus.lib.capability-registry'],
  ['copilot/system-status.js',   'nexus.copilot.system-status'],
  ['meta/gap/hunter.js',         'nexus.meta.gap.hunter'],
];

/**
 * mapBoundary(driver) — declare boundary components + their .export hooks.
 * MUST run before mapObservability() and mapRelationalField(), because both
 * declare wires that terminate on these ids.
 */
function mapBoundary(driver) {
  const results = { components: [], hooks: [], failures: [] };
  for (const [file, id] of BOUNDARY) {
    const c = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-boundary-${id}-v1-0000-2026-0804-001`,
    });
    (c.ok ? results.components : results.failures).push({ id, r: c });
    const h = driver.declare('hook', {
      id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
      uuid: `nexus-loom-boundary-${id}-export-v1-0000-2026-0804-001`,
    });
    (h.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r: h });
  }
  return results;
}

function mapRelationalField(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  // Pass 1 — components (one per file)
  for (const [file, id] of FILES) {
    const r = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0804-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  // Pass 2 — hooks. EVERY mapped file gets an .export hook, not only those
  // required by another file INSIDE this map.
  //
  // §DIVERGES FROM warp-map/observability-map ON PURPOSE 2026-08-04. Those two
  // declare .export only for ids in their own `requiredBy` set, which under-
  // declares: a file that has module.exports exports, whether or not this
  // particular map happens to contain one of its consumers. The concrete cost
  // was visible in the same bootstrap run that produced the BOUNDARY block
  // above — nexus.cortex.intelligence.mastermind is consumed by
  // nexus.copilot.optimizer over in the observability map, but nothing in the
  // CFR/RFR2 set requires it, so under the old rule it got no .export hook and
  // that cross-map wire was hard-rejected. An export hook asserts only "this
  // file exposes something", which is true of all 31 files here (checked:
  // every one has module.exports), so declaring them all adds no false claim.
  for (const [, id, requires] of FILES) {
    {
      const r = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0804-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length > 0) {
      const r = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0804-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r });
    }
  }

  // Pass 3 — wires: dependency's .export → dependant's .import (real require edges)
  let wireN = 0;
  for (const [, id, requires] of FILES) {
    for (const dep of requires) {
      wireN++;
      const r = driver.declare('wire', {
        id: `relational-field.wire.${wireN}.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        uuid: `nexus-loom-map-rf-wire-${wireN}-v1-0000-2026-0804-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}

module.exports = { mapRelationalField, mapBoundary, FILES, BOUNDARY };
