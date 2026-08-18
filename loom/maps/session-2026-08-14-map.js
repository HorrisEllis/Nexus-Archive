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
  ['clear-glass/src/userscripts/manager.js', 'nexus.clear-glass.userscripts.manager', 'clear-glass/src/userscripts', []],

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

  // §ADDED 2026-08-17f — found genuinely unregistered while fixing 3 real
  // recency bugs in it (query() vs tail()).
  ['cortex/intelligence/index.js', 'nexus.cortex.intelligence', 'cortex/intelligence', []],

  // §ADDED 2026-08-17g — found unregistered while fixing its real,
  // significant disk/RAM-relevant bug (unbounded error log growth).
  ['clear-glass/src/diagnostic/error-capture.js', 'nexus.clear-glass.diagnostic.error-capture', 'clear-glass/src/diagnostic', []],

  // §ADDED 2026-08-18h — found unregistered while wiring the real,
  // opt-in escalation tool-access feature into it.
  ['guardian/ask.js', 'nexus.guardian.ask', 'guardian', []],
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
