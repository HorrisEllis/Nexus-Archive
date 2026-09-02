spec:
  meta:
    name:        versionium
    version:     2.0.0
    status:      active
    canonical_implementation: cortex/versionium/index.js
    canonical_http_surface:
      commit:   "POST /api/versionium/commit  { message, branch?, causedBy?, system? }"
      history:  "GET  /api/versionium/history?system=<name>"
      restore:  "GET  /api/versionium/restore/:commitId"
      calendar: "GET  /api/versionium/calendar/:date"
    reached_via: "lib/nexus-client.js (sovereign transport) — never a direct require() across a process boundary"
    uuid:        nexus-versionium-v2-0000-2026-0901-jamesbrooks-001
    status_change_2026_09_01: >
      James: "migrate to versionium completely." Real investigation before
      changing status: this spec's own build_order (below, kept for
      history) had been executed as FOUR SEPARATE PIECES scattered across
      THREE subsystems that never knew about each other —
      idearium's SnapshotGate (steps 1+4), cortex/versionium/index.js
      (step 2 — kernel-based temporal replay, 2026-08-30), and
      lib/file-integrity.js (step 3 — per-route hashing, 2026-08-28). Two
      of those (idearium's SnapshotGate, cortex/versionium) were both
      real, independently-built, NEVER-RECONCILED commit-graph
      implementations under the same "Versionium" name — a genuine §10.3
      competing-truth finding, not a naming quibble. A third, deeper bug
      found in the same pass: cortex/versionium's own internal sigma-gated
      auto-commit had been polling `shape_samples`, a table NOTHING in
      this codebase has ever written to — dead since it was built, the
      same "listening to a bus nothing emits on" failure class this
      codebase's own AX-011 finding already named once. Fixed this pass,
      all three: (1) cortex/versionium/index.js is now canonical — it
      already had the more complete real capability set (kernel replay,
      calendar, correctly branch-scoped commits from the start, no
      parentId bug to inherit); (2) its dead shape_samples poll replaced
      with a real, live read of cortex's own _field.entropy (fed
      cross-process from orchestrator via the already-real POST
      /cfr/field); (3) the one real agent-facing capability
      (lib/agent-tools/tools/governance/versionium-commit.js) no longer
      reaches cortex/versionium/index.js via a cross-process require()
      (a live AX-010 violation that silently gave every agent-issued
      commit its OWN separate, near-empty kernel instead of cortex's real
      one) — it now calls cortex's real HTTP routes via lib/nexus-client.js,
      same sovereign-transport pattern as every other cross-process
      capability in this codebase.
    purpose: >
      "Versionium" is referenced throughout this session's design
      conversations (Phase 32, the idearium-as-GitHub discussion) as
      causal version control — temporal replay, calendar playback,
      sigma-gated auto-commit. Checked directly, session 9: no
      implementation exists anywhere under that name. lib/version.js is a
      flat version-string registry — real, useful, not that. This spec is
      what Versionium would actually need to be, built from primitives
      already proven elsewhere this session rather than from nothing.

  current_state:
    lib_version_js: "single version string per system, no history, no replay, no per-file granularity"
    gap_vs_billing: "no temporal axis at all — it's a value, not a timeline"

  what_already_exists_to_build_on:
    - source: "idearium's SnapshotGate/SnapshotRestoreGate"
      gives: "commitId (vtm-<sha>), parentId, branch label, message, author, full-state snapshot, diffSnapshots(), restore-with-auto-stash"
      gap: "parentId always points at the most recent snapshot regardless of declared branch — linear chain with a label, not a real DAG (found session 9, still open)"
    - source: "lib/file-integrity.js"
      gives: "FNV-1a content hash per system's registry-components.js, boot-time check"
      gap: "one file per system, not per-component, not continuous (boot-time only, no watchdog)"
    - source: "unintegrated/rfr2-nexus/{compress,clip,context}"
      gives: "snapshot()/restore() full state, snapshotRange()/restoreClip() bounded fork, createLiveContext/createReplayContext suspend↔resume"
      gap: "staged, not integrated — and compress/clip/context still owe the diff against lib/replay-engine.js this spec keeps NOT skipping just because it's convenient"
    - source: "unintegrated/rfr2-nexus/version-gate"
      gives: ".nex artifact validation + migration — no existing NEXUS equivalent"
      gap: "same — staged, not integrated, not yet diffed against anything (nothing to diff against, this one's genuinely new)"

  proposed_shape:
    per_file_versioning: >
      Extend file-integrity's hash check from "one file per system" to
      "every file a component.file field points at" (Phase 116's mapping
      makes this addressable for the first time — Versionium has no
      per-file granularity today because nothing else did either).
    commit_graph: >
      Fix idearium's parentId-ignores-branch bug first — Versionium
      shouldn't inherit a known-broken DAG. Real branching needs a fork
      point recorded at branch-creation, not inferred from snapshot order.
    temporal_replay: >
      This is rfr2-nexus's context module, once diffed against
      replay-engine.js and actually integrated — not new work, the
      missing piece is the diff, already named as undone in
      unintegrated/README.md.
    sigma_gated_commit: >
      A real, small addition: CFR sigma crossing a threshold triggers an
      automatic snapshot via the mechanism above, tagged with the sigma
      event that caused it (causedBy, same pattern as this session's other
      causal chaining work) — proposed, not built, no existing analog found.

  build_order:
    - "1. Fix idearium's branch/parentId bug — Versionium inherits whatever idearium's commit graph does today"
    - "2. Diff rfr2-nexus's compress/clip/context against lib/replay-engine.js — still undone, blocking everything else here"
    - "3. Per-file hashing, once Phase 116 gives components a file to hash"
    - "4. Sigma-gated auto-commit last — depends on 1-3 actually working first"

  history:
    - date: 2026-06-29
      summary: "Original spec written — Versionium proposed, no implementation existed anywhere under that name."
    - date: 2026-08-28
      summary: "Step 1 (branch/parentId fix) built into idearium's SnapshotGate; step 4 (sigma-gated auto-commit) built as orchestrator/lib/versionium-auto-commit.js, targeting idearium."
    - date: 2026-08-30
      summary: "Step 2 (kernel-based temporal replay) built into cortex/versionium/index.js — restore()/calendar() real for the first time."
    - date: 2026-09-01
      summary: >
        Reconciliation (§VERSIONIUM MIGRATION). cortex/versionium made
        canonical; idearium's SnapshotGate un-conflated from the
        Versionium name and kept as idearium's own separate feature;
        orchestrator/lib/versionium-auto-commit.js repointed at cortex;
        dead shape_samples poll replaced with a real live-field trigger;
        the one real agent-facing tool migrated off a cross-process
        require() onto sovereign transport; real GET /api/versionium/history
        added so a system's commit history — and, going forward, LM1's
        version_history: spec section — has a live source instead of a
        hand-maintained one. A real bug found by this migration's own
        smoke test (tests/modules/test-versionium-migration.js, V-006):
        manual commit() never wrote to versionium_calendar — only
        _autoCommit() did, so "calendar playback" (one of the three
        capabilities this spec's own purpose section names) was silently
        blind to every manually-triggered commit, which via the agent
        tool is most of them. Fixed alongside — both paths now share one
        _writeCalendarEntry() helper. 7/7 real assertions pass against an
        isolated JAA_DATA_DIR, not production data.

  gaps:
    as_of: 2026-09-01
    entries:
      - id: V1
        type: coverage
        summary: >
          version_history: sections in individual system specs (per LM1)
          are still hand-written, not auto-populated from GET
          /api/versionium/history. Building that writer (watch commits,
          append to the right system's .spec) is real, additional scope —
          closer to LM2's watchdog territory — and is not done here.
        opened: 2026-09-01
      - id: V2
        type: design
        summary: >
          Real fork-point recording at branch-creation (named in this
          spec's original commit_graph section) is still not built in
          cortex/versionium — branches are correctly scoped by name, but
          there's no record of which branch/commit a new branch actually
          forked FROM. Pre-existing, not newly introduced.
        opened: unknown

  version_history:
    - version: 1.0.0
      date: 2026-06-29
      summary: "Original spec — proposed, nothing built."
      versioniumCommitId: null
    - version: 2.0.0
      date: 2026-09-01
      summary: "Reconciliation — cortex/versionium made canonical, dead trigger fixed, sovereign transport applied. Status changed proposed -> active."
      versioniumCommitId: null
