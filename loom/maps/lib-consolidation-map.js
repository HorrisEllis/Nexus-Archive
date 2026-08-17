'use strict';
/**
 * loom/maps/lib-consolidation-map.js — maps the six nexus-*.js files moved
 * into lib/ under LS9 of docs/session-2026-08-14-and-15-living-schema-
 * phasemap.spec (2026-08-15): lib/heal-loop.js, lib/knowledge.js,
 * lib/query.js, lib/cfr-influence.js, lib/connect.js, lib/bus.js.
 * comp_id: nexus.loom.maps.lib-consolidation
 * UUID: nexus-loom-map-lib-consolidation-v1-0000-2026-0815-001
 *
 * WHY THIS FILE EXISTS (James, 2026-08-15): "log to loom's map as you go."
 * Each of the six moves so far fixed its OWN stale scanner-declared entry
 * directly in the live registry (name field corrected to the new path) —
 * real, but registry.json is state, not source (§2.2), and every commit
 * since has carried the same precommit warning: the moved file "is not
 * referenced in any loom/maps/*.js." Live patches don't close that. This
 * does — a real hand-map, in source, that any future bootstrap.js run
 * re-derives from scratch, not a one-time fixup that only this session's
 * live registry.json remembers.
 *
 * WIRING SCOPE — honest, not overstated: each of the six's OWN internal
 * require() edges are wired here, to REAL, ALREADY-EXISTING component ids
 * (verified via registry.has() before writing any of them, not guessed).
 * The REVERSE direction — the 30+ external files that require these six
 * (guardian/server.js, orchestrator.js, cortex/boot.js, etc.) — is
 * deliberately NOT wired here. Those are pre-existing components likely
 * already owned by other maps; declaring a wire INTO a hook this map
 * doesn't own risks the exact duplicate-id collision session-2026-08-14-
 * map.js's (now agent-tools-map.js's) original §SCOPE note was written to
 * avoid. A real next step, not guessed at in this pass.
 */
const FILES = [
  // [file, namespace.id, requires (real internal edges, verified against source)]
  ['lib/heal-loop.js',     'nexus.lib.heal-loop',     ['nexus.lib.nexus-config', 'nexus.cortex.core.raid']],
  ['lib/knowledge.js',     'nexus.lib.knowledge',     []],
  ['lib/query.js',         'nexus.lib.query',         []],
  ['lib/cfr-influence.js', 'nexus.lib.cfr-influence', []],
  ['lib/connect.js',       'nexus.lib.connect',       ['nexus.lib.heartbeat']],
  ['lib/bus.js',           'nexus.lib.bus',           []],
];

function mapLibConsolidation(driver) {
  const results = { components: [], hooks: [], failures: [], wires: [] };

  // Pass 1 — components.
  for (const [file, id] of FILES) {
    const r = driver.declareIfNew('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0815-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  // Pass 2 — hooks. Import for anything with real requires; export only if
  // something in THIS map's own requires lists points back at it (none do,
  // by design — see WIRING SCOPE above).
  for (const [, id, requires] of FILES) {
    if (requires.length > 0) {
      const r = driver.declareIfNew('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0815-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r });
    }
  }

  // Pass 3 — wires: this file's .import -> the real, pre-existing target's
  // .export. Targets are OUTSIDE this map's FILES set (nexus-config,
  // cortex/core/raid, lib/heartbeat) — checked real via registry.has()
  // before this file was written, same discipline as observability-map.js's
  // own "external-but-real targets" pattern.
  for (const [, id, requires] of FILES) {
    for (const dep of requires) {
      const r = driver.declareIfNew('wire', {
        id: `lib-consolidation.wire.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        uuid: `nexus-loom-map-lib-consolidation-wire-${dep}--${id}-v1-0000-2026-0815-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}

module.exports = { mapLibConsolidation, FILES };
