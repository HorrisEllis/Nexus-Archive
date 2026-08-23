'use strict';
/**
 * loom/maps/agent-primer-map.js — the primer + registry-aggregation path
 *
 * comp_id: nexus.loom.maps.agent-primer
 * UUID: nexus-loom-map-agent-primer-v1-0000-2026-0823-001
 *
 * WHY THIS FILE EXISTS — the pre-commit hook (CLAUDE.md rule 3) flagged
 * lib/agent-primer.js and lib/blueprint-index.js as unreferenced by any loom
 * map. That is the same condition this session has been closing everywhere
 * else: real, tested components with zero wires, invisible in the registry's
 * own connection graph.
 *
 * It also closes a miss James named directly. He asked to "map all of this in
 * detail ... to the phasemap FOR LOOM"; the phasemap written on 2026-08-23
 * carried `target_registry: loom` as a FIELD and was never actually registered
 * here. A declared target that nothing reads is §6.1 — an intention recorded
 * as a fact.
 *
 * §EDGES ARE REAL — every dependency below is an actual require() in the named
 * file, verified by reading it. lib/agent-primer.js reads warp/spec/warp.spec
 * and docs/AXIOMS-v3.1.md from DISK rather than requiring them, so those are
 * recorded as `reads`, NOT as component wires. A file read is not a module
 * edge, and recording it as one would fabricate a dependency the graph would
 * then treat as real (§1.1).
 */

const FILES = [
  ['lib/agent-primer.js', 'nexus.lib.agent-primer', []],
  // blueprint-index is the AGGREGATOR — the registry's real ingestion path.
  // It requires nothing from this session's additions; its edges are outward,
  // to the 14 per-system registry-components.js files it loads dynamically by
  // path string. Those are NOT require() edges and are not claimed as wires.
  ['lib/blueprint-index.js', 'nexus.lib.blueprint-index', []],
  // buildmanual DELEGATES to agent-primer — a real require(), so a real wire.
  ['lib/agent-tools/tools/query/build-manual.js', 'nexus.lib.agent-tools.build-manual',
    ['nexus.lib.agent-primer', 'nexus.lib.blueprint-index']],
  // logical-clock wraps rfr2/time rather than reimplementing it — a real
  // require(), so a real wire. It tries each location rfr2 has occupied and
  // REFUSES if none resolve, so the edge is genuine at every one of them.
  ['lib/logical-clock.js', 'nexus.lib.logical-clock', ['nexus.intelligence.rfr2.time']],
];

/**
 * Non-module dependencies, recorded so they are not lost, and deliberately NOT
 * declared as wires. A wire implies a component-to-component contract; these
 * are file reads against paths that may not exist, which agent-primer handles
 * by reporting the section MISSING rather than throwing.
 */
const READS = [
  ['nexus.lib.agent-primer', 'warp/spec/warp.spec',     'five primitives block, extracted by key not indentation'],
  ['nexus.lib.agent-primer', 'docs/AXIOMS-v3.1.md',     'presence-checked; the digest is curated, not extracted'],
  ['nexus.lib.agent-primer', 'lib/agent-tools/tools/',  'presence-checked; 8 of 67 tools named'],
  ['nexus.lib.blueprint-index', '<system>/registry-components.js x14', 'dynamic path load, not require()'],
  ['nexus.lib.agent-tools.build-manual', '<system>/registry-components.js', 'read DIRECTLY for the system-level events:{emits,handles} block, which blueprint-index does not carry through'],
];

/**
 * Consumers that already exist under their own ids. Only the WIRES are new.
 * A refusal here is informative rather than a failure — it means the consumer's
 * id is not what this map assumed, which is worth seeing (collected in
 * `skipped`, not `failures`, so a real failure stays legible).
 */
const CONSUMER_EDGES = [
  ['nexus.lib.agent-primer',    'nexus.copilot.server'],   // GET /api/primer
  ['nexus.lib.logical-clock',   'nexus.lib.component-ledger'],  // eventTs stamped at the one chokepoint
  ['nexus.lib.agent-tools.build-manual', 'nexus.copilot.server'],  // POST /api/primer/manual
  ['nexus.lib.blueprint-index', 'nexus.copilot.server'],
  ['nexus.lib.blueprint-index', 'nexus.orchestrator'],
];

function mapAgentPrimer(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [], skipped: [], reads: READS };

  for (const [file, id] of FILES) {
    const r = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0823-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  const requiredBy = new Set();
  for (const [, , requires] of FILES) for (const dep of requires) requiredBy.add(dep);
  for (const [dep] of CONSUMER_EDGES) requiredBy.add(dep);

  for (const [, id, requires] of FILES) {
    if (requiredBy.has(id)) {
      const r = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0823-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length) {
      const r = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0823-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r });
    }
  }

  let n = 0;
  for (const [dep, consumer] of CONSUMER_EDGES) {
    n++;
    const r = driver.declare('wire', {
      id: `agent-primer.wire.${n}.${dep}--${consumer}`,
      from_hook_id: `${dep}.export`, to_hook_id: `${consumer}.import`,
      uuid: `nexus-loom-map-ap-wire-${n}-v1-0000-2026-0823-001`,
    });
    if (r.ok) results.wires.push({ from: dep, to: consumer, r });
    else results.skipped.push({ from: dep, to: consumer, reason: r.error || 'consumer hook not registered', r });
  }

  return results;
}

module.exports = { mapAgentPrimer, FILES, CONSUMER_EDGES, READS };
