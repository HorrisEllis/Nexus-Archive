'use strict';
/**
 * loom/maps/session-2026-08-14-map.js — maps the three genuinely NEW
 * components this session created (lib/agent-system/contracts.js, submit.js,
 * lib/loom-map.js) into LOOM's registry, closing the real orphan warning
 * scripts/precommit-check.js raised on commit 65239c0 (CLAUDE.md rule 3 /
 * AXIOMS §5.1 — "an unregistered hook is an orphan").
 * comp_id: nexus.loom.maps.session-2026-08-14
 * UUID: nexus-loom-map-session-20260814-v1-0000-2026-0814-001
 *
 * §SCOPE — the precommit warning also named cortex/intelligence/index.js,
 * cortex/liminal-space/index.js, and cortex/push-recall.js, but all three
 * are PRE-EXISTING files (only modified this session, not created) already
 * referenced in loom/maps/copilot-capability-map.js and
 * loom/maps/observability-map.js (grepped directly, confirmed) — treated
 * as a likely detection-pattern mismatch in the precommit script rather
 * than a real absence, and left out of this map rather than risking a
 * duplicate-id registration error against whatever already covers them.
 * Not re-verified beyond the grep given the person is waiting on this
 * build — flagged honestly as unconfirmed, not silently assumed fixed.
 *
 * Edges below are real require() calls, read directly from each file
 * (not recalled) — same discipline as warp-map.js/source-map.js.
 */

// [file, namespace.id, dir, requires (id of another component in THIS map or a known existing one)]
const FILES = [
  ['lib/agent-system/contracts.js', 'nexus.lib.agent-system.contracts', 'lib/agent-system', []],
  ['lib/agent-system/submit.js',    'nexus.lib.agent-system.submit',    'lib/agent-system', ['nexus.lib.agent-system.contracts']],
  ['lib/loom-map.js',               'nexus.lib.loom-map',               'lib',              []],

  // §ADDED 2026-08-17 — James: "make sure you are updating... loom
  // registry... to log all the history." Three real components had no
  // loom entry at all, under any id (checked directly, not assumed).
  ['lib/diagnostic-report.js',      'nexus.lib.diagnostic-report',      'lib', []],
  ['guardian/lib/ncp.js',           'nexus.guardian.lib.ncp',           'guardian/lib', []],
  ['guardian/lib/gap-hunter.js', 'nexus.guardian.lib.gap-hunter', 'guardian/lib', ['nexus.intelligence.gap.hunter']],
  ['intelligence/liminal-space/index.js', 'nexus.intelligence.liminal-space', ['nexus.cortex.jaa-db']],
  ['clear-glass/src/userscripts/manager.js', 'nexus.clear-glass.userscripts.manager', 'clear-glass/src/userscripts', []],
  // §2026-08-23 — real, standalone HTTP bridge (:7704) proxying to
  // erosmancer-os's own real API (:7432) and clear-glass's IPC (:7702) —
  // confirmed by reading the file directly, not assumed from its name.
  ['clear-glass/wire/nexus-wire.js', 'nexus.clear-glass.wire.nexus-wire', 'clear-glass/wire', []],

  // §ADDED 2026-08-17b — TX10 (docs/clearglass-agent-suite-and-cfr-loom-
  // phasemap.spec), same standing instruction. Checked directly, not
  // assumed: copilot/lib/self-model.js (verifyAgentReachable/
  // navigateAgentToUrl live here) and lib/agent-tools/tools/sandbox/
  // cos-compartment.js are BOTH already registered (observability-map.js,
  // copilot-capability-map.js respectively) — those two functions are
  // additions to an already-registered file, not new components, correctly
  // left out. lib/agent-tools/tools/governance/spec-wizard.js genuinely
  // had no entry anywhere — confirmed by grep, not assumed. Its one real
  // require (nexus-client.js) has no findable registered id of its own,
  // left as [] rather than guessed, matching this file's own established
  // convention for unregistered dependencies.
  ['lib/agent-tools/tools/governance/spec-wizard.js', 'nexus.lib.agent-tools.governance.spec-wizard', 'lib/agent-tools/tools/governance', []],

  // §ADDED 2026-08-17c — found while merging the real "ledger wire + person
  // model" commit (e6dae51, cherry-picked from a parallel checkout). Its
  // own loom/maps/ledger-wire-person-model-map.js declares real wires
  // into nexus.lib.ledger-fanin, nexus.cortex.jaa-db, and nexus.lib.
  // component-ledger — three real, foundational, heavily-depended-on
  // files that had never been registered in THIS checkout's registry
  // under any id, confirmed by checking directly (not an id mismatch,
  // genuinely absent). Registered here so those real wires can resolve.
  ['lib/ledger-fanin.js',        'nexus.lib.ledger-fanin',        'lib',           []],
  ['cortex/memory/jaa-db.js',    'nexus.cortex.jaa-db',           'cortex/memory', []],
  ['bridge/causal/graph.js', 'nexus.bridge.causal.graph', 'bridge/causal', ['nexus.intelligence.cfr.graph']],
  ['bridge/index.js', 'nexus.bridge.index', 'bridge', ['nexus.intelligence.cfr']],
  // §2026-08-23 — the real HTTP server bridge/index.js wires in at boot
  // (createBridgeServer, Phase 5) — found genuinely unregistered while
  // fixing a real CORS bug in it.
  ['bridge/server.js', 'nexus.bridge.server', 'bridge', ['nexus.bridge.index']],
  ['bridge/causal/expectation.js', 'nexus.bridge.causal.expectation', 'bridge/causal', ['nexus.intelligence.causal']],
  ['bridge/causal/projections.js', 'nexus.bridge.causal.projections', 'bridge/causal', ['nexus.intelligence.causal']],
  ['cortex/memory/causal-lookup.js', 'nexus.cortex.memory.causal-lookup', 'cortex/memory', ['nexus.intelligence.cfr.graph']],
  ['cortex/versionium/causality.js', 'nexus.cortex.versionium.causality', 'cortex/versionium', ['nexus.intelligence.cfr.graph']],
  ['lib/lenses.js', 'nexus.lib.lenses', 'lib', ['nexus.intelligence.cfr.sigma']],
  ['lib/component-ledger.js',    'nexus.lib.component-ledger',    'lib',           []],

  // §ADDED 2026-08-17d — the real consumer-side entry points the person-
  // model map's own CONSUMER_EDGES reference, also found genuinely
  // missing by checking directly, not assumed.
  ['autopilot.js',               'nexus.autopilot',               '.',      []],
  ['copilot/server.js',          'nexus.copilot.server',          'copilot', []],
  ['service/nexus-diagnostic.js','nexus.service.nexus-diagnostic','service', []],
  ['cos/kernel.js',              'nexus.cos.kernel',              'cos',     []],

  // §ADDED 2026-08-17e — GA3. guardian/server.js itself was found
  // genuinely unregistered under any id while adding its real tool-index
  // bridge routes (checked directly, not assumed). A real, significant,
  // pre-existing gap, not something this session's own work caused.
  ['guardian/server.js', 'nexus.guardian.server', 'guardian', []],
  ['guardian/api-dispatch.js', 'nexus.guardian.api-dispatch', 'guardian', ['nexus.intelligence.liminal']],
  ['cortex/boot.js', 'nexus.cortex.boot', 'cortex', []],

  // §ADDED 2026-08-17f — found genuinely unregistered while fixing 3 real
  // recency bugs in it (query() vs tail()).
  ['intelligence/index.js', 'nexus.intelligence', 'intelligence', []],
  ['lib/uid/component-map.js', 'nexus.lib.uid.component-map', 'lib/uid', []],
  ['lib/event-types.js', 'nexus.lib.event-types', 'lib', []],

  // §ADDED 2026-08-17g — found unregistered while fixing its real,
  // significant disk/RAM-relevant bug (unbounded error log growth).
  ['clear-glass/src/diagnostic/error-capture.js', 'nexus.clear-glass.diagnostic.error-capture', 'clear-glass/src/diagnostic', []],

  // §ADDED 2026-08-18h — found unregistered while wiring the real,
  // opt-in escalation tool-access feature into it.
  ['guardian/ask.js', 'nexus.guardian.ask', 'guardian', []],

  // §ADDED 2026-08-18i — search_files, built this turn for the self-repair query capability.
  ['lib/agent-tools/tools/query/search-files.js', 'nexus.lib.agent-tools.query.search-files', 'lib/agent-tools/tools/query', []],

  // §ADDED 2026-08-18j — self_repair, the real propose/test/promote pipeline.
  ['lib/agent-tools/tools/sandbox/self-repair.js', 'nexus.lib.agent-tools.sandbox.self-repair', 'lib/agent-tools/tools/sandbox', []],

  // §ADDED 2026-08-18k — 3 real, tested modules integrated this pass
  // (wake-word listener, agent-to-agent chat, end-state goals). Real
  // requires checked directly per file, not guessed: agent-chat.js's
  // only top-level require is Node's own 'http' (not a real internal
  // NEXUS dependency, no edge); end-state.js's are 'crypto'/'fs'/'os'/
  // 'path' (same, no real internal edges); userscript-nexus-wake.js has
  // ZERO require() calls at all — confirmed by grep, expected for
  // browser-userscript code (no CommonJS in that context).
  ['lib/agent-chat.js', 'nexus.lib.agent-chat', 'lib', []],
  ['lib/end-state.js', 'nexus.lib.end-state', 'lib', []],
  ['guardian/userscript-nexus-wake.js', 'nexus.guardian.userscript.nexus-wake', 'guardian', []],

  // §ADDED 2026-08-18l — James: "build a compartment... interact with the
  // agents, and have that compartment be the output directory. then have
  // the agent use introspect to check nexus and improve it's own outputs...
  // co-pilot prompt the agent to introspect and iterate endlessly." Real
  // requires checked directly: agent-chat.js and end-state.js are both
  // ALREADY registered above (same file, reused not duplicated); self-
  // repair.js is registered separately under lib.agent-tools.sandbox.self-
  // repair (confirmed by grep before assuming it needed a second entry).
  ['lib/agent-build-loop.js', 'nexus.lib.agent-build-loop', 'lib',
    ['nexus.lib.agent-chat', 'nexus.lib.end-state', 'nexus.lib.agent-tools.sandbox.self-repair', 'nexus.lib.gap-field']],

  // §ADDED 2026-08-18k (agent-ids branch) — 6 real, foundational files
  // found genuinely unregistered under any id while doing this session's
  // own real work on them, confirmed by direct search, not assumed.
  //
  // §MERGE NOTE — copilot/lib/self-model.js below is registered here as
  // nexus.copilot.lib.self-model. A different checkout (this session,
  // earlier, different lineage — observability-map.js) already registers
  // the SAME real file as nexus.copilot.self-model (no '.lib.'). Both
  // real entries kept as-is by this merge, not silently deduplicated —
  // a genuine double-registration under two different ids for one real
  // file, surfaced honestly rather than decided unilaterally during a
  // merge. Worth a real look, not fixed here.
  ['lib/intent-classifier.js',       'nexus.lib.intent-classifier',       'lib',           []],
  ['cortex/core/raid/index.js',      'nexus.cortex.core.raid',            'cortex/core/raid', []],
  ['copilot/lib/self-model.js',      'nexus.copilot.lib.self-model',      'copilot/lib',   []],
  ['copilot/lib/grammar-router.js',  'nexus.copilot.lib.grammar-router',  'copilot/lib',   []],
  ['copilot/lifeline.js',            'nexus.copilot.lifeline',            'copilot',       []],
  ['ollama/server.js',               'nexus.ollama.server',               'ollama',        []],
  // §2026-08-23 — real, centralized config (see ollama/config.js's own
  // header for the full real reason) and the hardware-fitted abliterated
  // model catalog it's paired with. No real dependencies of their own —
  // pure value/data files.
  ['ollama/config.js',               'nexus.ollama.config',               'ollama',        []],
  ['ollama/abliterated-catalog.js',  'nexus.ollama.abliterated-catalog',  'ollama',        []],

  // §ADDED 2026-08-18l (agent-ids branch) — a real, significant,
  // pre-existing gap: this file was genuinely unregistered under any id
  // despite being central to the whole hat/agent-switching system this
  // session built on.
  ['lib/hat-forge.js', 'nexus.lib.hat-forge', 'lib', []],

  // §ADDED 2026-08-19 — found genuinely unregistered by the precommit
  // hook while fixing suggestHat()'s real seedKey resolution bug. Real
  // requires checked directly: both dependencies already registered
  // above in this same file (self-model.js, intent-classifier.js) —
  // reused, not duplicated.
  ['lib/intent-hat-router.js', 'nexus.lib.intent-hat-router', 'lib',
    ['nexus.copilot.lib.self-model', 'nexus.lib.intent-classifier']],

  // §ADDED 2026-08-19 (nexus0822 branch) — the merged/extended "hey nexus"
  // agent-chat system's real tool wrapper. lib/agent-chat.js itself is
  // already registered above (line 105) — not re-added here, that would
  // be a genuine duplicate, checked and dropped during this merge rather
  // than carried forward blindly.
  ['lib/agent-tools/tools/coordination/agent-chat.js', 'nexus.lib.agent-tools.coordination.agent-chat', 'lib/agent-tools/tools/coordination', []],

  // §ADDED 2026-08-19b (nexus0822 branch) — pressure/intake subsystem,
  // tool-config governance ratchet, agent-reach, download-capture. Real,
  // merged, tested that turn.
  ['lib/pressure-window.js', 'nexus.lib.pressure-window', 'lib', []],
  ['lib/intake.js', 'nexus.lib.intake', 'lib', []],
  ['cli/pressure.js', 'nexus.cli.pressure', 'cli', []],
  ['lib/tool-config.js', 'nexus.lib.tool-config', 'lib', []],
  ['lib/agent-reach.js', 'nexus.lib.agent-reach', 'lib', []],
  ['lib/agent-tools/tools/governance/tool-config.js', 'nexus.lib.agent-tools.governance.tool-config', 'lib/agent-tools/tools/governance', []],
  ['clear-glass/src/providers/download-capture.js', 'nexus.clear-glass.providers.download-capture', 'clear-glass/src/providers', []],
  ['clear-glass/src/copilot/wake-relay.js', 'nexus.clear-glass.copilot.wake-relay', 'clear-glass/src/copilot', ['nexus.clear-glass.providers.host']],

  // §ADDED 2026-08-22 — 6 real files found genuinely unregistered by the
  // precommit hook after merging nexus0822/master. Real requires checked
  // directly per file, not guessed: copilot/registry-components.js and
  // all 4 provider userscripts have zero require() calls (browser-
  // context code, same as guardian/userscript-nexus-wake.js above);
  // lib/work-queue.js's only top-level require is Node's own 'os' (no
  // real internal edge); lib/introspect.js's real dependencies
  // (component-ledger.js, among others) are all lazy/dynamic requires
  // inside functions, not static top-level ones, so no edge is asserted
  // rather than guessed at which of several dynamic paths is "the" one.
  ['copilot/registry-components.js', 'nexus.copilot.registry-components', 'copilot', []],
  ['guardian/userscript-chatgpt.js', 'nexus.guardian.userscript.chatgpt', 'guardian', []],
  ['guardian/userscript-claude.js', 'nexus.guardian.userscript.claude', 'guardian', []],
  ['guardian/nexus-hey-claude.user.js', 'nexus.guardian.nexus-hey-claude', 'guardian', ['nexus.guardian.userscript.claude']],
  ['guardian/userscript-gemini.js', 'nexus.guardian.userscript.gemini', 'guardian', []],
  ['guardian/userscript-perplexity.js', 'nexus.guardian.userscript.perplexity', 'guardian', []],
  ['lib/introspect.js', 'nexus.lib.introspect', 'lib', []],
  ['lib/work-queue.js', 'nexus.lib.work-queue', 'lib', []],
];

function mapSession20260814(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  // Pass 1 — components. dir is SB1's own new field (this session,
  // 2026-08-14) — using it here is the first real registration to exercise
  // it outside schema.test.js's synthetic cases.
  for (const [file, id, dir] of FILES) {
    const r = driver.declare('component', {
      id, namespace: 'lib', name: file, version: '1.0.0', dir,
      uuid: `nexus-loom-map-${id}-v1-0000-2026-0814-001`,
    });
    (r.ok ? results.components : results.failures).push({ id, r });
  }

  const requiredBy = new Set();
  for (const [, , , requires] of FILES) for (const dep of requires) requiredBy.add(dep);

  // Pass 2 — hooks
  for (const [, id, , requires] of FILES) {
    if (requiredBy.has(id)) {
      const r = driver.declare('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0814-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length > 0) {
      const r = driver.declare('hook', {
        id: `${id}.import`, component_id: id, name: 'import', type: 'direct', direction: 'in',
        uuid: `nexus-loom-map-${id}-import-v1-0000-2026-0814-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.import`, r });
    }
  }

  // Pass 3 — wires. type + intent both set (SB1 additive fields, exercised
  // for real here rather than only in synthetic tests).
  let wireN = 0;
  for (const [, id, , requires] of FILES) {
    for (const dep of requires) {
      wireN++;
      const r = driver.declare('wire', {
        id: `session-2026-08-14.wire.${wireN}.${dep}--${id}`,
        from_hook_id: `${dep}.export`, to_hook_id: `${id}.import`,
        type: 'direct-call', intent: `${id} requires ${dep}`,
        uuid: `nexus-loom-map-wire-${wireN}-v1-0000-2026-0814-001`,
      });
      (r.ok ? results.wires : results.failures).push({ from: dep, to: id, r });
    }
  }

  return results;
}

module.exports = { mapSession20260814, FILES };
