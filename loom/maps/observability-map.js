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
  ['loom/scanners/phasemap-map.js','nexus.loom.scanners.phasemap-map',
    []],  // the phasemap SECTION of loom — roadmap per system (what each is becoming)
  ['loom/server.js',              'nexus.loom.server',
    ['nexus.lib.gap-field', 'nexus.lib.connections', 'nexus.loom.scanners.phasemap-map']],  // §2026-08-09 — the process itself: /api/phasemap, /api/gaps, /api/friction, /api/tension — the last two proxy the real diagnostic kernel (:7825) live via CA4's connections.js, not a second computation
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
    ['nexus.copilot.user-model', 'nexus.copilot.nexus-awareness', 'nexus.lib.gap-field', 'nexus.copilot.intent-learning']],  // P5/P6 — identity + governance + agent-switch + nexus model, wired from lib/reflection, lib/constitutional-ai, lib/agent-router, lib/intent-classifier. §2026-08-09 — buildNexusModel() now includes gap-field's system+user-model gap summary AND intent-learning's per-pattern confidence — a model of NEXUS that only lists what it can do without also carrying how sure it is isn't actually self-aware.
  ['copilot/lib/grammar-router.js','nexus.copilot.grammar-router',
    ['nexus.lib.grammar-engine', 'nexus.copilot.capabilities']],  // P5 — dynamic grammar engine in the conversational path
  ['copilot/lib/autonomy-router.js','nexus.copilot.autonomy-router',
    ['nexus.lib.scheduler', 'nexus.lib.triggers', 'nexus.lib.system-control', 'nexus.lib.command-builder', 'nexus.lib.constant-autonomy', 'nexus.copilot.capabilities', 'nexus.copilot.intent-learning', 'nexus.copilot.user-model', 'nexus.lib.idea-provenance']],  // §2026-08-09 — the wire from co-pilot's actual conversation to CA1-CA7. Landed in the wrong route on the first attempt (/bridge/deliver, not /api/prompt — the primary entry); moved after a real HTTP call against the live server proved it wasn't reached. v2: propose-then-confirm for every state-changing action, confidence-gated via intent-learning, both models updated on outcome. §2026-08-11 — "log this idea" wired to idea-provenance.js, tagged origin:user (never origin:agent — that distinction is idea-provenance's whole reason for existing).
  ['copilot/lib/intent-learning.js','nexus.copilot.intent-learning',
    ['nexus.cortex.memory.jaa-db']],  // §2026-08-09 — Bayesian-ish confidence per intent-resolution PATTERN, not per claim about James (that's user-model.js's job) — co-pilot's model of its OWN understanding. +0.10 confirm, -0.15 reject, mirrors user-model.js's exact confirm/decay math rather than a new formula.
  ['lib/agent-build-learning.js', 'nexus.lib.agent-build-learning',
    ['nexus.cortex.memory.jaa-db', 'nexus.lib.agent-router']],  // §2026-08-11 — a THIRD Bayesian model, same math again: which agent tends to actually produce a working build. Seeded from agent-router's DEFAULT_FALLBACK as a real prior, not a blank 0.5 — James's own encoded judgment shouldn't be thrown away just because nothing's been recorded yet.
  ['lib/chunk-build-orchestrator.js', 'nexus.lib.chunk-build-orchestrator',
    ['nexus.lib.execution-pipeline', 'nexus.lib.agent-router', 'nexus.lib.agent-build-learning', 'nexus.lib.gap-field']],  // §2026-08-11 — James: "if a chunk fails to build, switch agents... try them all, unless it's a system failure." Exhausts the full roster before giving up (stronger evidence for "needs human review" than any partial attempt); a rate-limit/timeout is a skipped turn, not a failed one, and doesn't count. Full exhaustion reports through gap-field, same "what's open right now" view as everything else.
  ['copilot/lib/nexus-awareness.js','nexus.copilot.nexus-awareness',
    ['nexus.copilot.capabilities', 'nexus.lib.diagnostic-causal', 'nexus.lib.ledger-fanin']],  // P4 — co-pilot's model of nexus
  ['copilot/lib/capabilities.js', 'nexus.copilot.capabilities',
    ['nexus.loom.scanners.capability-map']],  // P4 slice — co-pilot's real toolbox from loom
  ['lib/diagnostic-causal.js',    'nexus.lib.diagnostic-causal',
    ['nexus.cortex.intelligence.relational-field', 'nexus.lib.ledger-fanin', 'nexus.lib.snapshot-trigger', 'nexus.lib.gap-field']],  // P3 — conditions behind findings; now defaults findings from gap-field (§2026-08-09 unification)
  ['lib/component-ledger.js',     'nexus.lib.component-ledger',
    ['nexus.cortex.memory.jaa-db']],  // §2026-08-12 — James: "i want everything you do logged to nexus... all history and decisions tracked in cortex." REAL, already written (15,472+ rows, 12+ real systems, a month of history) but never itself registered in loom's own map — found while making it locatable for a 13th real writer (this session's own commits, system:'claude', logged live tonight). Was flagging its own writes as "recorded but not locatable in the architecture" until this entry.
  ['lib/gap-field.js',            'nexus.lib.gap-field',
    ['nexus.cortex.memory.jaa-db', 'nexus.lib.resource-monitor', 'nexus.lib.diagnostic-causal']],  // §2026-08-09 — the single agnostic gap-report entry point: system anomalies + user-model contradictions, one dedup rule, one causal-wire convention. §R1 2026-08-12 — report() carries the full repair_contract_schema (requested/received/systemsInvolved/location/error/resourceState), resourceState auto-populated from lib/resource-monitor (cheap, real), why populated on-demand via explainWhy() -> diagnostic-causal.explainFinding() (real causal tracing, not run on every report — §0.5).
  ['copilot/lib/lifeline-contracts.js', 'nexus.copilot.lifeline-contracts',
    ['nexus.lib.gap-field']],  // §2026-08-12 — James: "each time it uses lifeline it needs to know what it's asking and how to receive it... a contract or schema, a way to interact with each agent." Per-intent (ask/build/yes_no/json/etc) validation of what a real provider response actually needs to look like — a mismatch is a real, logged gap, not a silently-accepted guess.
  ['copilot/lifeline.js',         'nexus.copilot.lifeline',
    ['nexus.copilot.lifeline-contracts', 'nexus.lib.gap-field']],  // §2026-08-12 — three real silent-failure paths fixed: _tryOllama's job-failed/timeout/thrown-error branches all `return null`ed with zero record; _tryGuardian's empty-response/thrown-error paths did the same. Every one now reports a real gap via gap-field before falling through, same cascade behavior, real record instead of silence.
  ['cortex/gap-finder/index.js',  'nexus.cortex.gap-finder',
    ['nexus.lib.gap-field']],  // system anomaly.detected + sigma.event.* → gap-field.report(); was writing directly to 'gaps' with its own inline dedup before the unification — that logic is now shared, not duplicated
  ['lib/intent-classifier.js',    'nexus.lib.intent-classifier',
    ['nexus.lib.gap-field']],  // §2026-08-09 — the SIXTH independent gap-writer found (James asked to verify "intention" was really wired in): _emitLowConfidenceGap() had a raw jaaDB.insert with no dedup, same bug class as user-model's checkContradictions. Now shares gap-field's dedup/occurrence treatment. Verified live: two identical low-confidence classifications bump occurrences 1->2, not two rows.
  ['lib/integrity-revert.js',     'nexus.lib.integrity-revert',
    ['nexus.lib.file-integrity', 'nexus.lib.snapshot-trigger', 'nexus.lib.replay-engine']],  // integrity sigma → guarded revert (only when broken)
  ['lib/snapshot-trigger.js',     'nexus.lib.snapshot-trigger',
    ['nexus.lib.replay-engine', 'nexus.cortex.intelligence.relational-field', 'nexus.lib.ledger-fanin']],  // P2 — snapshot on every sigma, tracing conditions via RFR2
  ['lib/scheduler.js',            'nexus.lib.scheduler',
    ['nexus.copilot.self-model', 'nexus.lib.ledger-fanin', 'nexus.lib.agent-pull']],  // CA1 — schedule tasks/jobs/alarms/timed payloads, RAID-gated
  ['lib/triggers.js',             'nexus.lib.triggers',
    ['nexus.copilot.self-model', 'nexus.lib.ledger-fanin', 'nexus.lib.agent-pull']],  // CA2 — fire an action WHEN a fan-in condition matches, RAID-gated (scheduler's reactive twin)
  ['lib/chains.js',               'nexus.lib.chains',
    ['nexus.copilot.self-model', 'nexus.lib.agent-pull', 'nexus.lib.ledger-fanin']],  // CA3 — sequential agent/command/http/fn steps, RAID-gated per step, halts on failure
  ['lib/connections.js',          'nexus.lib.connections',
    ['nexus.copilot.self-model', 'nexus.lib.ledger-fanin']],  // CA4 — scoped http/sse connection tool, default-deny domain allowlist, RAID-gated
  ['lib/system-control.js',       'nexus.lib.system-control',
    ['nexus.copilot.self-model', 'nexus.lib.ledger-fanin', 'nexus.guardian.clear-glass-bridge']],  // CA5 — governed settings (get/set/revert) + governed clear-glass incl. DOM storage
  ['lib/command-builder.js',      'nexus.lib.command-builder',
    ['nexus.copilot.self-model', 'nexus.copilot.capabilities', 'nexus.lib.tool-index', 'nexus.lib.chains']],  // CA6 — self-building commands: resolve a real capability, store in tool-index (loom-registered), run via CA3
  ['lib/constant-autonomy.js',    'nexus.lib.constant-autonomy',
    ['nexus.lib.scheduler', 'nexus.lib.autonomous-loop', 'nexus.lib.tool-index', 'nexus.lib.ledger-fanin', 'nexus.copilot.self-model']],  // CA7 — propose/govern/execute on a loop (CA1's scheduler), halts on ambiguity, every cycle traceable
  ['lib/nexus-cli-interface.js',  'nexus.lib.nexus-cli-interface',
    ['nexus.copilot.capabilities', 'nexus.copilot.nexus-awareness', 'nexus.copilot.self-model', 'nexus.copilot.grammar-router', 'nexus.loom.scanners.phasemap-map']],  // --cli interface routing to the co-pilot additions
  ['lib/autopilot-intelligence.js','nexus.lib.autopilot-intelligence',
    ['nexus.cortex.intelligence', 'nexus.cortex.intelligence.relational-field', 'nexus.lib.baseline', 'nexus.lib.snapshot-trigger', 'nexus.lib.ledger-fanin']],  // autopilot boot — wire+verify the whole intelligence substrate
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
