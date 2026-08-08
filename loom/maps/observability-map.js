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
  ['lib/gemini-toolbox/injection.js', 'nexus.lib.gemini-injection',
    ['nexus.lib.gemini-toolbox', 'nexus.lib.gemini-agent-contracts', 'nexus.lib.fs-tree']],  // P2 — tree/parseAny/recall injection payload
  ['lib/gemini-toolbox/agent-contracts.js', 'nexus.lib.gemini-agent-contracts',
    ['nexus.lib.gemini-toolbox', 'nexus.lib.agent-router']],  // P1 — per-agent contracts (identity/axioms/scoped toolbox)
  ['lib/chunk-service.js',        'nexus.lib.chunk-service',
    ['nexus.lib.chunker']],  // chunking consolidated through RAID — canonical chunker as one capability
  ['lib/agent-pull.js',           'nexus.lib.agent-pull',
    ['nexus.lib.gemini-agent-contracts', 'nexus.lib.chunk-service', 'nexus.lib.schema-registry', 'nexus.lib.tool-index']],  // AP1 — agents pull schemas/contracts/chunks/capabilities, scoped
  ['lib/tool-index.js',           'nexus.lib.tool-index',
    []],  // living tool index in cortex — file/dir/consumer/intent/edge-cases populate over time
  ['lib/fs-tree.js',              'nexus.lib.fs-tree',
    []],  // agnostic file-structure tree — promoted from gemini injection, any system uses it
  ['lib/line-edit.js',            'nexus.lib.line-edit',
    []],  // agnostic line addressing + verified edits — promoted from gemini-toolbox
  ['lib/gemini-toolbox/index.js',  'nexus.lib.gemini-toolbox',
    ['nexus.lib.chunker', 'nexus.lib.line-edit']],  // the shared line-addressing backend for Gemini coding
  ['lib/gemini-toolbox/routes.js', 'nexus.lib.gemini-toolbox.routes',
    ['nexus.lib.gemini-toolbox']],  // HTTP surface, mounted on guardian /gemini-tool
  ['lib/ledger-fanin/index.js',   'nexus.lib.ledger-fanin',
    []],
  ['lib/activity-log/index.js',   'nexus.lib.activity-log',
    ['nexus.lib.ledger-fanin']],
  ['copilot/lib/self-model.js',   'nexus.copilot.self-model',
    ['nexus.copilot.user-model', 'nexus.copilot.nexus-awareness']],  // P5/P6 — identity + governance + agent-switch + nexus model, wired from lib/reflection, lib/constitutional-ai, lib/agent-router, lib/intent-classifier
  ['copilot/lib/grammar-router.js','nexus.copilot.grammar-router',
    ['nexus.lib.grammar-engine', 'nexus.copilot.capabilities']],  // P5 — dynamic grammar engine in the conversational path
  ['copilot/lib/nexus-awareness.js','nexus.copilot.nexus-awareness',
    ['nexus.copilot.capabilities', 'nexus.lib.diagnostic-causal', 'nexus.lib.ledger-fanin']],  // P4 — co-pilot's model of nexus
  ['copilot/lib/capabilities.js', 'nexus.copilot.capabilities',
    ['nexus.loom.scanners.capability-map']],  // P4 slice — co-pilot's real toolbox from loom
  ['lib/diagnostic-causal.js',    'nexus.lib.diagnostic-causal',
    ['nexus.cortex.intelligence.relational-field', 'nexus.lib.ledger-fanin', 'nexus.lib.snapshot-trigger']],  // P3 — conditions behind findings
  ['lib/snapshot-trigger.js',     'nexus.lib.snapshot-trigger',
    ['nexus.lib.replay-engine', 'nexus.cortex.intelligence.relational-field', 'nexus.lib.ledger-fanin']],  // P2 — snapshot on every sigma, tracing conditions via RFR2
  ['lib/ledger-fanin/boot.js',    'nexus.lib.ledger-fanin.boot',
    ['nexus.lib.ledger-fanin', 'nexus.lib.activity-log']],  // P1 — subscribes intelligence/autopilot/copilot/logging to the fan-in at boot  // subscribes the fan-in → persists all activity + errors to cortex  // the unified event fan-in — every system emits, every consumer subscribes once
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
