'use strict';
/**
 * loom/maps/copilot-capability-map.js — maps the schedule_task/register_trigger/
 * nexus_heal/loom_scan/raid_snr/rewind_replay tool session (docs/
 * copilot-full-capability-phasemap.spec, P2/P4/P8 + the shipped-not-phasemapped
 * batch) into LOOM's component/hook/wire registry, one component per FILE,
 * wired only by REAL require() edges — mirroring loom/maps/observability-map.js
 * and loom/maps/warp-map.js exactly.
 * comp_id: nexus.loom.maps.copilot-capability
 * UUID: nexus-loom-map-copilot-capability-v1-0000-2026-0812-001
 *
 * WHY THIS FILE EXISTS — CLAUDE.md rule 3 flagged every file below across
 * three commits this session (e4fbebd, 910450a, 3b599a7): each was a real,
 * live-verified component with zero loom wires, an isolated dot in the
 * registry's own connection graph. Closing that now, honestly — some edges
 * point to ids that already existed in loom/data/registry.json before this
 * session (nexus.lib.scheduler, nexus.lib.triggers, nexus.copilot.
 * adaptive-fulfillment, nexus.copilot.capability-extend, nexus.cortex.core.raid.*,
 * nexus.clear-glass.src.rewind.engine, nexus.guardian.clear-glass-bridge) —
 * checked against registry.json directly, not assumed present.
 *
 * §NOTE ON ID DRIFT — this session's own file docblocks (schedule-task.js
 * etc.) used comp_id: nexus.lib.agent-tools.<name>, but the REAL registered
 * convention (confirmed against loom/data/registry.json's existing entries
 * for browser-action, capability-tools, etc.) is nexus.lib.agent-tools.
 * tools.<name> — with .tools. in the middle. This map uses the real
 * convention; the docblock comments in those files are now slightly
 * inconsistent with the registry and worth fixing next time those files
 * are touched, not silently left to look authoritative.
 */

const FILES = [
  ['lib/agent-tools/index.js',                      'nexus.lib.agent-tools',
    ['nexus.cortex.core.raid', 'nexus.lib.agent-tools.tools.browser-action', 'nexus.lib.agent-tools.tools.capability-tools',
     'nexus.lib.agent-tools.tools.diagnose', 'nexus.lib.agent-tools.tools.faculty-tools', 'nexus.lib.agent-tools.tools.forge-tool',
     'nexus.lib.agent-tools.tools.loom-scan', 'nexus.lib.agent-tools.tools.nexus-heal', 'nexus.lib.agent-tools.tools.nexus-status',
     'nexus.lib.agent-tools.tools.query-recall', 'nexus.lib.agent-tools.tools.raid-snr', 'nexus.lib.agent-tools.tools.register-trigger',
     'nexus.lib.agent-tools.tools.rewind-replay', 'nexus.lib.agent-tools.tools.schedule-task', 'nexus.lib.agent-tools.tools.ui-tools']],
     // §2026-08-12 — registers 6 new tools this session (raid-snr, rewind-replay, schedule-task,
     // register-trigger, nexus-heal, loom-scan) alongside the pre-existing 22; edge list trimmed to
     // the load-bearing/new ones, not all 28 — matches observability-map's own non-exhaustive convention.

  ['lib/agent-tools/tool-guide.js',                  'nexus.lib.agent-tools.tool-guide',
    ['nexus.lib.agent-tools']],   // requires ./index.js's TOOLS map for _forgedNote's coverage check

  ['lib/agent-tools/tools/schedule-task.js',         'nexus.lib.agent-tools.tools.schedule-task',
    ['nexus.lib.scheduler']],   // thin wrapper — all scheduling/governance/persistence logic stays in lib/scheduler.js

  ['lib/agent-tools/tools/register-trigger.js',      'nexus.lib.agent-tools.tools.register-trigger',
    ['nexus.lib.triggers']],    // thin wrapper — same shape as schedule-task, reactive twin

  ['lib/agent-tools/tools/nexus-heal.js',            'nexus.lib.agent-tools.tools.nexus-heal',
    []],   // HTTP-only to nexus-healer :3753 (propose/list/evaluate) — no internal require edge, real network wire not a code wire

  ['lib/agent-tools/tools/loom-scan.js',             'nexus.lib.agent-tools.tools.loom-scan',
    ['nexus.loom.scanners.phasemap-map']],   // in-process requires of capability-map/dangling-report/spec-map/source-map/closed-door
     // (those four scanners are not yet individually loom-mapped themselves — phasemap-map is, reused here as the one real edge)

  ['lib/agent-tools/tools/raid-snr.js',              'nexus.lib.agent-tools.tools.raid-snr',
    ['nexus.cortex.core.raid.snr-filter', 'nexus.cortex.core.raid.tunables', 'nexus.cortex.jaa-db']],

  ['lib/agent-tools/tools/rewind-replay.js',         'nexus.lib.agent-tools.tools.rewind-replay',
    ['nexus.clear-glass.src.rewind.engine']],   // via clear-glass's direct HTTP /rewind routes, not the gate path

  ['lib/agent-tools/tools/browser-action.js',        'nexus.lib.agent-tools.tools.browser-action',
    ['nexus.guardian.clear-glass-bridge', 'nexus.clear-glass.src.driver.url-listener']],
     // §2026-08-12 — REAL_ACTIONS event-type strings fixed this session (5 of 6 didn't match any real
     // clear-glass gate signature — see the file's own header); url_listen/url_unlisten added (P5),
     // reaching url-listener.js's real, already-registered gates for the first time.

  ['copilot/server.js',                              'nexus.copilot.server',
    ['nexus.copilot.adaptive-fulfillment', 'nexus.copilot.capability-extend', 'nexus.lib.scheduler', 'nexus.lib.triggers',
     'nexus.copilot.nexus-awareness', 'nexus.copilot.self-model', 'nexus.copilot.tool-runtime', 'nexus.cortex.jaa-db']],
     // §2026-08-12 — two edges added to the ALREADY-registered nexus.copilot.server this session:
     // capability-extend (P2, wired as adaptive-fulfillment's true last resort) and scheduler/triggers
     // (boot-time .start() call, commit e4fbebd — the fix for tasks/triggers persisting but never firing).
  ['lib/agent-tools/tools/copilot-identity.js',      'nexus.lib.agent-tools.tools.copilot-identity',
    ['nexus.copilot.self-model']],   // getIdentityName/setIdentityName — new this session, same commit

  ['lib/agent-tools/tools/resource-monitor.js',      'nexus.lib.agent-tools.tools.resource-monitor',
    []],   // os builtin (no internal edge) + cos/watchdog/{proc-stats,monitor}.js in-process + ollama :3749/health over HTTP — no code edge into RAID's _fitness on purpose, see file header

  ['lib/agent-tools/tools/agent-chat-search.js',     'nexus.lib.agent-tools.tools.agent-chat-search',
    ['nexus.cortex.jaa-db']],   // reads chat_log + guardian_chat_log directly — deliberately NOT wired to push-recall (see file header)

  ['lib/agent-tools/tools/nexus-help.js',            'nexus.lib.agent-tools.tools.nexus-help',
    ['nexus.copilot.nexus-awareness']],   // rundown/diagnose/ask wrap nexus-awareness; search_docs is new, no internal edge (fs only)

  ['lib/agent-tools/tools/cos-compartment.js',       'nexus.lib.agent-tools.tools.cos-compartment',
    []],   // reuses cos/cli/commands/{create,start,stop,destroy,list,status}.js's real programmatic functions in-process, cos/ has no registered component yet

  ['lib/agent-tools/tools/cos-simulate.js',          'nexus.lib.agent-tools.tools.cos-simulate',
    ['nexus.cortex.jaa-db']],   // in-process require of cos/playground/llm-lab.js (unregistered) + guardian :7820/command over HTTP (real network wire, not a code edge)

  ['lib/agent-tools/tools/meta-query.js',            'nexus.lib.agent-tools.tools.meta-query',
    []],   // in-process requires of 7 meta/ subsystems (alk, alk-perception, bda, cfr, gap, lattice, liminal), none registered as loom components yet — rfr2 deliberately excluded, see file header

  ['lib/nerve-ollama-bridge.js',                     'nexus.lib.nerve-ollama-bridge',
    ['nexus.lib.nerve', 'nexus.ollama.server']],   // P7c — reads Nerve's snapshot, PUTs to ollama's new context route
];

// nexus.copilot.self-model already exists (observability-map.js) — no
// component entry needed for it here, only the new wire above and the new
// copilot_identity component/hooks, both handled by PRE_EXISTING below.

module.exports = { mapCopilotCapability, FILES };

function mapCopilotCapability(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  // §FIXED after first live run 2026-08-12 — nexus.lib.agent-tools,
  // nexus.lib.agent-tools.tool-guide, nexus.lib.agent-tools.tools.browser-action,
  // and nexus.copilot.server already existed in the registry from before this
  // session (confirmed against loom/data/registry.json directly). The first
  // run of this map tried to re-declare them with fresh UUIDs and correctly
  // hit loom.unique-id — SISO's collision-is-hard-error law working as
  // designed, not a bug, but noisy and avoidable: skip component/hook
  // declares for ids that already exist, since re-declaring adds nothing.
  // Wires still cover every edge below regardless — those succeeded on the
  // first run precisely because the pre-existing hooks already satisfied
  // loom.wire-endpoints-exist.
  const PRE_EXISTING = new Set([
    'nexus.lib.agent-tools', 'nexus.lib.agent-tools.tool-guide',
    'nexus.lib.agent-tools.tools.browser-action', 'nexus.copilot.server',
  ]);

  // Pass 1 — components (one per file), skipping pre-existing ids.
  for (const [file, id] of FILES) {
    if (PRE_EXISTING.has(id)) continue;
    const r = driver.declare('component', {
      id, namespace: id.split('.').slice(0, 2).join('.'), name: file, version: '1.0.0',
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0812-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  const requiredBy = new Set();
  for (const [, , requires] of FILES) for (const dep of requires) requiredBy.add(dep);

  // Pass 2 — hooks, skipping pre-existing ids (they already have export/import hooks).
  for (const [, id, requires] of FILES) {
    if (PRE_EXISTING.has(id)) continue;
    if (requiredBy.has(id)) {
      const r = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0812-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length > 0) {
      const r = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0812-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r });
    }
  }

  // Pass 3 — wires: dependency's .export → dependant's .import (real require/HTTP edges)
  let wireN = 0;
  for (const [, id, requires] of FILES) {
    for (const dep of requires) {
      wireN++;
      const r = driver.declare('wire', {
        id: `copilot-capability.wire.${wireN}.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        uuid: `nexus-loom-map-cc-wire-${wireN}-v1-0000-2026-0812-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}
