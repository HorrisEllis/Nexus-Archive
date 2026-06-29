spec:
  meta:
    name:        versionium
    version:     1.0.0
    status:      proposed
    uuid:        nexus-versionium-v1-0000-2026-0629-jamesbrooks-001
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
