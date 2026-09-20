spec:
  meta:
    name:        idearium-repository-overhaul
    version:     0.2.0-phasemap
    status:      "MERGE 2026-09-15 of idearium-creative-repo-overhaul-
      phasemap.spec (v0.1.0) and nexus-repository-system-build-
      phasemap.spec (v0.1.0). Reason: they shared one dependency
      (this file's MCO3 needs MCO-B) and one literal duplicate (the
      two specs' git+credentials MCOs were the same gate). The two
      source files should be marked SUPERSEDED, not deleted, per the
      existing docs/specs/IDEARIUM.spec.md precedent — kept as history,
      no longer the source of truth for this work."
    uuid:        nexus-idearium-repository-overhaul-v0-0000-2026-0915-002
    author:      james-brooks
    compiled_by: claude
    created_at:  2026-09-15T00:00:00Z
    supersedes:
      - idearium-creative-repo-overhaul-phasemap.spec  # v0.1.0, 2026-09-15
      - nexus-repository-system-build-phasemap.spec    # v0.1.0, 2026-09-15
    depends_on_specs:
      - nexus-repository-system.spec
      - versionium.spec
      - idearium.spec
      - loom.spec
    intent: >
      One phasemap, one build order, for turning idearium's spec
      library into a full creative-repo host on top of
      nexus-repository-system.spec's model. MCO0 stays first — it's the
      real-code audit that changed several downstream statuses (MCO-C
      in particular went from "not started" to "partially real" once
      the audit found idearium/repo/import-pipeline.js already does
      most of it).
    non_goals:
      - Re-implementing repository ingestion/chunking/atlas — real,
        already built (MCO0).
      - Reusing cortex's schema.sigma_record for file diffs (live
        707-row divergence-score table, different concept) — schema.file_delta instead (MCO-A).
      - Reusing clear-glass's cg.rewind.* for file rewind (browser-tab
        session rewind, different domain) — versionium.restore.read instead (MCO-B).

  # ── MCO0: audit real coverage ─────────────────────────────────────────
  MCO0_audit_real_coverage:
    depends_on: []
    status: "DONE 2026-09-15."
    real_and_done:
      - "L0/L1 SOURCE+STRUCTURE: idearium/repo/index.js v2.0.0 — repo IS
        a spec-engine manifest, real identity via rootHash."
      - "L2-L4 PARSE/CHUNKS/ATLAS + §35 INCREMENTAL: idearium/repo/
        import-pipeline.js — deterministic parse, boundary-safe chunks,
        incremental re-chunk on edit, matches §10/§11/§35 closely."
      - "§37 VERIFY (L0-L3 only): import-pipeline.js's verify() — syntax,
        boundary, structural integrity. L4-L8 not built (MCO2)."
      - "§2/§38 MAP-first agent surface: idearium/agent-suite/index.js —
        listRepositories/getRepositoryMap/getRepositorySymbols/
        getRepositoryChunks(Chunk)/editRepositoryFile. Real mutation
        re-triggers the pipeline via _materializeQuiet — REPO-018 is
        real, not aspirational."
      - "Practical effect on this merged phasemap: MCO-C (archive
        upload -> real files) is NOT starting from zero — ingest +
        materialize already write real files to disk. MCO-C's real
        remaining scope is narrower: hook MCO-B's per-file snapshot
        into the materialize step, nothing else."
    real_gaps_grep_confirmed_zero_hits:
      - "§24-26 GRAPH: zero relationship-edge extraction anywhere (MCO1)."
      - "§30/§31 GIT INTEGRATION + CREDENTIALS for idearium-hosted repos:
        zero (MCO-G, merged below — was MCO-G and MCO5 separately)."
      - "§18-22 HOOKS/WIRES/FLOWS/TOOLS as typed repository-domain
        nodes: real functions exist, not yet formalized as .tool nodes (MCO4)."
      - "§33 full SNAPSHOT compliance: versionium commits work but don't
        carry atlas/graph/test/verification state yet (MCO3)."
      - "§5/§32 COMPARTMENT OWNERSHIP: unenforced, not violated, just absent (MCO6)."
    gate: "MET — every real item cited to a real file; every gap grep-confirmed."

  # ── MCO-A: typed schemas ──────────────────────────────────────────────
  MCO-A_schemas:
    depends_on: [MCO0]
    status: "DONE 2026-09-15."
    does: Register schema.phase_node (idearium) and schema.file_delta (versionium) — drafts already written, not yet indexed.
    adds: [schema.phase_node, schema.file_delta]
    gate: MET when both are indexed in their systems' schemas/index.js and one real round-trip row passes each.
    gate_proof: >
      Both indexed (auto-loaded by each system's own schemas/index.js —
      confirmed live: versionium/schemas.list() and idearium/schemas.list()
      both return the new type). Both status: OPEN, not REAL — no
      production writer exists yet (MCO-B/MCO-E), per §1.1. Round-trip:
      tests/modules/test-mco-a-file-delta-schema.js (MCOA-001..003) and
      idearium/test/test-mco-a-phase-node-schema.js (MCOA-004..006), 6/6
      passing, each against a real, isolated instance of that system's
      real sovereign store (versionium/lib/store.js,
      idearium/lib/db.js -> cortex/memory/jaa-db.js) — not a mock.
      file_delta home confirmed versionium/ ahead of this MCO (recorded
      in docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md,
      D1), closing this phasemap's own first open_question.

  # ── MCO-B: versionium <-> idearium bridge ───────────────────────────
  MCO-B_versionium_bridge:
    depends_on: [MCO-A]
    status: "NOT STARTED"
    does: >
      Per-file snapshot/delta wrap around versionium's existing
      commit.create/history.list/restore.read/state.read/calendar.read
      (unchanged, reused as-is).
    adds: [versionium.file.snapshot.capability, versionium.file.delta.capability, versionium.idearium.bridge.capability]
    gate: MET when a file written through idearium produces a real commit row and restore.read reproduces it byte-identical.

  # ── MCO-C: archive upload hooks into real materialize ────────────────
  MCO-C_repo_materialize:
    depends_on: [MCO-B]
    status: "PARTIAL — real already (MCO0): ingest+materialize write
      real files to disk today. Remaining scope only: fire
      versionium.file.snapshot per materialized file once MCO-B exists."
    does: Add the MCO-B snapshot call into idearium/repo/index.js's existing materialize path — no new ingestion logic.
    gate: MET when every file an archive upload produces has triggered exactly one versionium.file.snapshot.

  # ── MCO1: graph layer ─────────────────────────────────────────────────
  MCO1_graph_layer:
    depends_on: [MCO0]
    status: "NOT STARTED"
    does: Derive edges from data import-pipeline.js already produces; ships incrementally (imports/exports first, calls/callers last), unresolved edges stay explicitly unresolved (§24).
    adds: [repository.graph.traverse.capability, repository.graph.dependencies.capability, repository.graph.affected.capability]
    gate: MET when graph.traverse returns real edges for a real repo and undetermined relationships are marked unresolved, not omitted.

  # ── MCO2: verification tiers L4-L8 ────────────────────────────────────
  MCO2_verification_deepening:
    depends_on: [MCO1]
    status: "NOT STARTED"
    does: Extends real verify() (L0-L3) with semantic (L4), dependency (L5, needs MCO1), and lazy runtime/integration/system-contract (L6-L8) tiers.
    gate: MET when L4-L5 run synchronously and L6-L8 run lazily against exactly MCO1's affected cone.

  # ── MCO-E: roadmap UI from .phase nodes ──────────────────────────────
  MCO-E_roadmap_ui:
    depends_on: [MCO-A]
    status: "NOT STARTED"
    does: Renders per-project roadmap from schema.phase_node rows, reusing loom.phasemap.capability for the scan — render layer only.
    adds: [idearium.roadmap.get.capability, idearium.roadmap.phase.update.capability]
    gate: MET when a real project's .phase nodes render as a dependency-respecting roadmap and edits update the same rows loom's scanner reads.

  # ── MCO4: hooks/wires/flows/tools as typed repository nodes ──────────
  MCO4_hooks_wires_flows_tools:
    depends_on: [MCO1]
    status: "NOT STARTED"
    does: Wraps existing real functions (agent-suite, import-pipeline) as formal .tool nodes per §22; adds repository:hook/repository:wire (§18-19) and .flow (§21, distinct from clear-glass's .macro).
    gate: MET when every §22 .tool node either wraps a cited real function or is explicitly marked not-yet-implemented.

  # ── MCO3: full snapshot compliance ────────────────────────────────────
  MCO3_snapshot_compliance:
    depends_on: [MCO-B, MCO1, MCO2]
    status: "NOT STARTED"
    does: Extends the real versionium_commit metadata with atlas_version/chunk_index_version/graph_version/dependency_state/test_state/verification_state — additive fields, no new commit mechanism.
    gate: MET when one real commit's metadata round-trips all of §33's must_record list.

  # ── MCO-F: adjustable config, copilot-writable ────────────────────────
  MCO-F_config:
    depends_on: [MCO0]
    status: "NOT STARTED"
    config_schema:
      idearium.config:
        chunk_cap:     { value: 500, min: 1, max: 5000, copilot_writable: true }
        zoom_levels:   { value: 4, copilot_writable: true }
        snapshot_mode: { value: delta, enum: [full, delta], copilot_writable: true }
        auto_phasemap: { value: true, copilot_writable: true }
        cicd:
          push_enabled: { value: false, copilot_writable: true }
          pull_enabled: { value: false, copilot_writable: true }
          ssh_key_path: { value: null, copilot_writable: false }
    adds: [idearium.config.get.capability, idearium.config.set.capability]
    gate: MET when chunk_cap changes the real 500-cap live, and a copilot write differs from a human write only in the event's actor field.

  # ── MCO-D: zoom / sub-repo model ─────────────────────────────────────
  MCO-D_zoom_subrepo:
    depends_on: [MCO-C]
    status: "NOT STARTED — highest-risk, net-new. Read-only zoom first; write-through sub-repo creation deferred."
    open_question: "Zoom level names still undecided — default count is 4 (MCO-F); candidate world->region->module->file, unconfirmed."
    adds: [idearium.repo.zoom.capability, idearium.repo.subrepo.create.capability]
    gate: MET (read-only phase) when a real multi-module project traverses cleanly at every configured depth.

  # ── MCO6: Compartment ownership ────────────────────────────────────────
  MCO6_compartment_ownership:
    depends_on: [MCO0]
    status: >
      DONE 2026-09-20. Real finding during the map: the gate was already
      being violated by code unrelated to repo-import — idea.phase→
      'building' (idearium/api/index.js) called lib/compartment-engine.js's
      spawn(), a second, fully independent id-space (JAA-backed,
      constraint_frame/trace_log) with no connection to cos/'s real
      compartment store. Migrated that call site to lib/cos-bridge.js
      (already the established real entry point per its own 2026-09-15
      header — this fixes the one caller its original migration missed).
      Separately, two of five real repo-creation paths (spec.promote,
      speceng.create's auto-repo) never attached any compartment at all
      — compartmentId was permanently null. Both now call cos-bridge.js's
      createCompartment()+uniqueName() via a shared _ensureCompartment()
      helper (idearium/api/index.js). lib/compartment-engine.js itself is
      untouched — its other real callers (RAID contract-intake,
      autonomous-loop, adversary-suite, case-library) use it for
      end-state PASS/FAIL evaluation, which cos-bridge.js's own header
      already names as the one thing COS has no equivalent of; not in
      scope here. gate_proof: tests/modules/test-mco6-repo-compartment.js,
      11/11, real HTTP against a real server — confirms non-null
      compartmentId on both previously-null repo paths, confirms idea and
      repo compartments now resolve in the SAME real COS store
      (cos-bridge.getCompartment), confirms dedup (same spec promoted
      after auto-create correctly returns the same repo/compartment, not
      a collision), confirms two distinct specs get two distinct
      compartments. Zero regressions: every existing test touching these
      paths (idearium-phase-compartment[-integration], spec-promote,
      idearium-auto-repo-creation, idearium-materialize-physical,
      idearium-phase-sync) still 44/44 total. NOT YET DONE: lib/
      project-container.js's own two COS call sites still hand-roll a
      direct cos/cli/commands/create.js call instead of going through
      cos-bridge.js, despite that module's own header claiming it already
      does ("uniqueName() ... project-container uses") — grep-confirmed
      false; a separate, smaller drift, not fixed here since it was
      already compartment-attached and outside MCO6's stated "does".
    does: Wires §5 — repo import attaches to an existing cos/ Compartment, never a second parallel abstraction. Adds compartment_id to idearium's repo record.
    gate: MET when every imported repo has exactly one compartment_id and no second compartment-like abstraction exists (grep-confirmed).

  # ── MCO-G: git push/pull + SSH + credentials (was MCO-G AND MCO5 — same gate, merged) ─
  MCO-G_git_cicd_credentials:
    depends_on: [MCO-C, MCO-F, MCO3]
    status: "NOT STARTED — deliberately last, only MCO with real
      external-network/credential surface. This was two separate MCOs
      (idearium-creative's MCO-G, repo-system's MCO5) before the merge
      — identical gate, now one MCO."
    does: Real git clone/fetch/branch/checkout/diff/commit/tag/restore/push/pull (§30 git_provides). NEXUS keeps owning semantic identity/atlas/chunks/graph/verification (§30 nexus_provides) — unchanged by this MCO.
    constraint: "§31 — agent/copilot MUST NOT receive key material. ssh_key_path stays copilot_writable:false (MCO-F). Copilot may trigger a push, never read/set the key."
    open_question: "Target remote — one of the repo's four real remotes (mine/nexus0822/other/person-model) or a new idearium-only remote. Not decided."
    gate: MET when a real project pushes a real commit and a separate clone pulls it byte-identical, with zero key material in any event/chat/copilot context.

  build_order: [MCO0, MCO-A, MCO1, MCO-F, MCO6, MCO-B, MCO-E, MCO4, MCO-C, MCO2, MCO3, MCO-D, MCO-G]
  build_order_note: >
    MCO0 first (already done). MCO-A/MCO1/MCO-F/MCO6 have no
    dependencies beyond MCO0 and can run in any order/parallel. MCO-C
    moved after MCO-B despite being "already partial" per MCO0 — its
    remaining scope (the snapshot hook) genuinely needs MCO-B to exist
    first. MCO-D and MCO-G stay last: MCO-D for its open zoom-naming
    question, MCO-G because it's the only MCO touching credentials.

  open_questions:
    - "zoom level names (MCO-D) — undecided."
    - "git remote target (MCO-G) — one of the four existing real remotes vs a new idearium-only remote."

  open_questions_resolved:
    - question: "file_delta home: versionium/ (recommended) vs cortex/."
      resolved: "versionium/ — confirmed 2026-09-15. See docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md, D1."
