'use strict';
/**
 * loom/maps/observability-map.js — maps the observability/tablet arc's components
 * into LOOM's component/hook/wire registry, one component per FILE, wired only by
 * REAL require() edges (verified against the actual source, not recalled) —
 * mirroring loom/maps/warp-map.js exactly.
 * comp_id: nexus.loom.maps.observability
 * UUID: nexus-loom-map-observability-v1-0000-2026-0730-001
 *
 * WHY (James, 2026-07-30): the registry is how the system stays aware of ITSELF —
 * "everything is connected to everything else". A component declared without its
 * wires is an isolated dot: the system can't see how it connects, so it can't
 * find friction, tension, or gaps in that wiring. The earlier bootstrap seed
 * added these components as bare declarations (id/name/uuid) with NO edges. This
 * map fixes that — every component here carries its real require() edges as wires,
 * so the connection graph is complete and the system can reason over it.
 *
 * Edge rule (same as warp-map): node builtins (fs/path/http/crypto/os) don't
 * count; only real internal NEXUS require() edges are wires. Edges to systems
 * OUTSIDE this set (cfr, mastermind, capability-registry, jaa-db) are declared as
 * wires to those existing component ids so the graph joins the rest of NEXUS.
 */

// [file, namespace.id, requires (real internal edges, verified against source)]
// Edges use the target's registry id. External-but-real targets (cfr/field,
// mastermind, capability-registry) are included so the graph connects to NEXUS.
const FILES = [
  ['copilot/diagnostics.js',       'nexus.copilot.diagnostics',
    ['nexus.copilot.system-status', 'nexus.meta.cfr.field', 'nexus.copilot.movement-map', 'nexus.cortex.jaa-db']],
  ['copilot/diagnostic-sweep.js',  'nexus.copilot.diagnostic-sweep',
    ['nexus.copilot.diagnostics', 'nexus.meta.gap.hunter']],
  ['copilot/movement-map.js',      'nexus.copilot.movement-map',
    ['nexus.lib.capability-registry', 'nexus.meta.cfr.field', 'nexus.meta.cfr.delta']],
  ['copilot/optimizer.js',         'nexus.copilot.optimizer',
    ['nexus.copilot.diagnostics', 'nexus.copilot.movement-map', 'nexus.lib.pattern-leverage', 'nexus.lib.sigma-roles', 'nexus.cortex.intelligence.mastermind']],
  ['lib/sigma-roles.js',           'nexus.lib.sigma-roles',
    ['nexus.cortex.jaa-db']],
  ['lib/pattern-leverage.js',      'nexus.lib.pattern-leverage', []],
  ['lib/edge-cases.js',            'nexus.lib.edge-cases',
    ['nexus.cortex.jaa-db']],
  ['tablet/homepage.html',         'nexus.tablet.homepage',
    ['nexus.copilot.diagnostics']],   // fetches copilot /api/prompt (diagnostics) + autopilot :7799
  ['tablet/map3d.html',            'nexus.tablet.map3d',
    ['nexus.copilot.diagnostics']],   // renders report.movement + report.bottlenecks
  ['cortex/intelligence/relational-field.js', 'nexus.cortex.intelligence.relational-field',
    ['nexus.lib.rfr2-bridge', 'nexus.cortex.intelligence.mastermind']],  // RFR2 wired into intelligence (causality + sigma)
  ['lib/gemini-toolbox/index.js',  'nexus.lib.gemini-toolbox',
    ['nexus.lib.chunker']],  // the shared line-addressing backend for Gemini coding
  ['lib/gemini-toolbox/routes.js', 'nexus.lib.gemini-toolbox.routes',
    ['nexus.lib.gemini-toolbox']],  // HTTP surface, mounted on guardian /gemini-tool
  ['ui/agents/gemini/code-suite.html', 'nexus.ui.gemini.code-suite',
    ['nexus.lib.gemini-toolbox.routes']],  // the code suite UI → toolbox over HTTP
];

function mapObservability(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  // Pass 1 — components (one per file)
  for (const [file, id] of FILES) {
    const r = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0730-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  // which ids are required by at least one file → need an .export hook
  const requiredBy = new Set();
  for (const [, , requires] of FILES) for (const dep of requires) requiredBy.add(dep);

  // Pass 2 — hooks (export if required elsewhere, import if this file requires others)
  for (const [, id, requires] of FILES) {
    if (requiredBy.has(id)) {
      const r = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0730-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length > 0) {
      const r = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0730-001`,
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
        id: `observability.wire.${wireN}.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        uuid: `nexus-loom-map-obs-wire-${wireN}-v1-0000-2026-0730-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}

module.exports = { mapObservability, FILES };
