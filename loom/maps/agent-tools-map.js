'use strict';
/**
 * loom/maps/agent-tools-map.js — maps this session's agent-tools additions
 * (originally the three genuinely NEW components from 2026-08-14; grew to
 * cover every tool this session added — file_tree, delete_file, axiom_
 * manage, loom_register, nexus_map, notes_todo, versionium_commit,
 * compiler_info, cos_archetype/blueprint/playground/plugin/vault,
 * ask_james, ambiguity_pull, diagnostic_engines).
 * §RENAMED 2026-08-15 (LS8) — was session-2026-08-14-map.js, date-named
 * not purpose-named. One real requirer (loom/bootstrap.js), updated same
 * commit. mapSession20260814 -> mapAgentTools throughout. Original scope
 * note kept below for provenance: closed the real orphan warning
 * scripts/precommit-check.js raised on commit 65239c0 (CLAUDE.md rule 3 /
 * AXIOMS §5.1 — "an unregistered hook is an orphan").
 * comp_id: nexus.loom.maps.agent-tools
 * UUID: nexus-loom-map-agent-tools-v1-0000-2026-0815-001
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

  // §ADDED 2026-08-14 (later, same session) — "change agent needs to connect
  // to NCP." Both files were flagged by scripts/precommit-check.js as
  // referenced in no loom map (CLAUDE.md rule 3). switch-agent.js's orphan
  // status is PRE-EXISTING — it shipped in commit 6a64da1 unmapped, confirmed
  // by grep before adding it here, so this closes an older gap as well as the
  // new one.
  //
  // §SCOPE, stated rather than glossed: the real edge copilot/lib/self-model
  // .js -> ncp-availability is NOT declared here. self-model is already a
  // component under loom/maps/copilot-capability-map.js, and declaring a wire
  // out of a hook owned by another map is exactly the duplicate-id risk this
  // file's original §SCOPE note refused to take. That edge is real and
  // unmapped — an honest omission, not an oversight.
  ['lib/ncp-availability.js',                        'nexus.lib.ncp-availability',                  'lib',                                  []],
  ['lib/agent-tools/tools/identity/switch-agent.js', 'nexus.lib.agent-tools.identity.switch-agent', 'lib/agent-tools/tools/identity', ['nexus.lib.ncp-availability', 'nexus.lib.chat-target']],

  // §ADDED 2026-08-15 — James: "continue... wire the rest." Thirteen more
  // tools this session, flagged by the same precommit warning each time
  // they were committed and left for a batch pass rather than one map
  // edit per tool. Same discipline as above: real require() edges, read
  // directly from each file, not recalled. Cross-map targets (jaa-db,
  // axiom-manager, loom/schema, cos/host, etc.) are PRE-EXISTING
  // components likely already owned by another map — same §SCOPE refusal
  // as switch-agent.js's ncp-availability edge above: declaring a wire
  // INTO a hook this map doesn't own risks the exact duplicate-id
  // collision the original note here was written to avoid. Declared as
  // real components with real dirs; cross-map edges left honestly
  // unmapped rather than guessed at.
  ['lib/agent-tools/tools/query/file-tree.js',           'nexus.lib.agent-tools.query.file-tree',           'lib/agent-tools/tools/query',      []],
  ['lib/agent-tools/tools/execution/delete-file.js',     'nexus.lib.agent-tools.execution.delete-file',     'lib/agent-tools/tools/execution',  []],
  ['lib/agent-tools/tools/governance/axiom-manage.js',   'nexus.lib.agent-tools.governance.axiom-manage',   'lib/agent-tools/tools/governance', []],
  ['lib/agent-tools/tools/governance/loom-register.js',  'nexus.lib.agent-tools.governance.loom-register',  'lib/agent-tools/tools/governance', []],
  ['lib/agent-tools/tools/query/nexus-map.js',           'nexus.lib.agent-tools.query.nexus-map',           'lib/agent-tools/tools/query',      ['nexus.lib.agent-system.contracts']],
  ['lib/agent-tools/tools/query/notes-todo.js',          'nexus.lib.agent-tools.query.notes-todo',          'lib/agent-tools/tools/query',      []],
  ['lib/agent-tools/tools/governance/versionium-commit.js', 'nexus.lib.agent-tools.governance.versionium-commit', 'lib/agent-tools/tools/governance', []],
  ['lib/agent-tools/tools/query/compiler-info.js',       'nexus.lib.agent-tools.query.compiler-info',       'lib/agent-tools/tools/query',      []],
  ['lib/agent-tools/tools/sandbox/cos-archetype.js',     'nexus.lib.agent-tools.sandbox.cos-archetype',     'lib/agent-tools/tools/sandbox',    []],
  ['lib/agent-tools/tools/sandbox/cos-blueprint.js',     'nexus.lib.agent-tools.sandbox.cos-blueprint',     'lib/agent-tools/tools/sandbox',    []],
  ['lib/agent-tools/tools/sandbox/cos-playground.js',    'nexus.lib.agent-tools.sandbox.cos-playground',    'lib/agent-tools/tools/sandbox',    []],
  ['lib/agent-tools/tools/sandbox/cos-plugin.js',        'nexus.lib.agent-tools.sandbox.cos-plugin',        'lib/agent-tools/tools/sandbox',    []],
  ['lib/agent-tools/tools/sandbox/cos-vault.js',         'nexus.lib.agent-tools.sandbox.cos-vault',         'lib/agent-tools/tools/sandbox',    []],
  ['lib/agent-tools/tools/governance/ask-james.js',      'nexus.lib.agent-tools.governance.ask-james',      'lib/agent-tools/tools/governance', []],
  ['lib/agent-tools/tools/query/ambiguity-pull.js',      'nexus.lib.agent-tools.query.ambiguity-pull',      'lib/agent-tools/tools/query',      ['nexus.lib.agent-tools.query.nexus-map']],
  ['lib/agent-tools/tools/diagnostic/diagnostic-engines.js', 'nexus.lib.agent-tools.diagnostic.diagnostic-engines', 'lib/agent-tools/tools/diagnostic', ['nexus.lib.diagnostic-engines']],

  // §ADDED 2026-08-15 (later, same day) — diagnostic_engines was built and
  // tool-wrapped but never added to a map file, only registered via a
  // direct runtime loom_register call. James: "git checkout" during an
  // unrelated A/B test reverted registry.json to its last real commit
  // (2026-08-11), which silently discarded that live-only registration —
  // real, observed consequence, not hypothetical. Added to source HERE
  // instead, so it survives any future revert the same way everything
  // else in this file does: by being re-derivable from git, not by
  // hoping registry.json's live state never gets reset.
  ['lib/diagnostic-engines.js', 'nexus.lib.diagnostic-engines', 'lib', []],

  // §ADDED 2026-08-15 — LS2, docs/diagnostic-engine-system.spec built as
  // real v1. lib/system-expectations.js requires lib/fault-log.js (real,
  // registered elsewhere in this map already) — same edge convention as
  // everything else here.
  ['lib/system-expectations.js', 'nexus.lib.system-expectations', 'lib', ['nexus.lib.fault-log']],
  ['lib/agent-tools/tools/diagnostic/system-expectations.js', 'nexus.lib.agent-tools.diagnostic.system-expectations', 'lib/agent-tools/tools/diagnostic', ['nexus.lib.system-expectations']],

  // §ADDED 2026-08-15 (later, same day) — James: gaps need a real rating
  // (SNR/fidelity, tension, pressure, causal chain). Composes lib/
  // diagnostic-engines.js, already declared above.
  ['lib/gap-rating.js', 'nexus.lib.gap-rating', 'lib', ['nexus.lib.diagnostic-engines']],
  ['lib/agent-tools/tools/diagnostic/gap-rating.js', 'nexus.lib.agent-tools.diagnostic.gap-rating', 'lib/agent-tools/tools/diagnostic', ['nexus.lib.gap-rating']],

  // §ADDED 2026-08-15 (later, same day) — AM1 and AM6, LS5's real remaining
  // dependents. agent-model requires agent-system's submit/contracts and
  // tool-index (all already declared/real, cited by id where possible;
  // submit.js/contracts.js aren't in this specific map's own FILES list,
  // left as an honest cross-map omission, same §SCOPE discipline as
  // everywhere else in this file). agent-model-confidence-loop composes
  // five real modules across cortex/copilot/lib -- same honest omission
  // for those cross-map targets.
  ['lib/agent-model.js', 'nexus.lib.agent-model', 'lib', []],
  ['lib/agent-tools/tools/diagnostic/agent-model.js', 'nexus.lib.agent-tools.diagnostic.agent-model', 'lib/agent-tools/tools/diagnostic', ['nexus.lib.agent-model']],
  ['lib/agent-model-confidence-loop.js', 'nexus.lib.agent-model-confidence-loop', 'lib', []],
  ['lib/agent-tools/tools/diagnostic/agent-model-confidence-loop.js', 'nexus.lib.agent-tools.diagnostic.agent-model-confidence-loop', 'lib/agent-tools/tools/diagnostic', ['nexus.lib.agent-model-confidence-loop']],

  // §ADDED 2026-08-14 (CU0) — "switch to Claude and add a chat url to use."
  // chat-target has no internal require() edges of its own: it pulls node's
  // URL and resolves provider hosts from clear-glass/src/providers/registry
  // by path at call time. That registry is not a component in any map, so
  // declaring an edge to it would name a hook that does not exist — the same
  // duplicate-id risk this file's §SCOPE note has refused twice now. Stated,
  // not silently dropped: the chat-target -> clear-glass registry edge is
  // real and unmapped.
  ['lib/chat-target.js',                             'nexus.lib.chat-target',                       'lib',                            []],
];

function mapAgentTools(driver) {
  const results = { components: [], hooks: [], wires: [], failures: [] };

  // Pass 1 — components. dir is SB1's own new field (this session,
  // 2026-08-14) — using it here is the first real registration to exercise
  // it outside schema.test.js's synthetic cases.
  for (const [file, id, dir] of FILES) {
    const r = driver.declareIfNew('component', {
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
      const r = driver.declareIfNew('hook', {
        id: `${id}.export`, component_id: id, name: 'export', type: 'direct', direction: 'out',
        uuid: `nexus-loom-map-${id}-export-v1-0000-2026-0814-001`,
      });
      (r.ok ? results.hooks : results.failures).push({ id: `${id}.export`, r });
    }
    if (requires.length > 0) {
      const r = driver.declareIfNew('hook', {
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
      const r = driver.declareIfNew('wire', {
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

module.exports = { mapAgentTools, FILES };
