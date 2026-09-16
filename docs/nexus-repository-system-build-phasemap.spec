spec:
  meta:
    name:        nexus-repository-system-build
    version:     0.1.0-phasemap
    status:      "PHASEMAP 2026-09-15. MCO0 (audit) is DONE — real code
      found and grep-confirmed before any gap was assumed. MCO1 onward
      are NOT STARTED. Cross-references
      idearium-creative-repo-overhaul-phasemap.spec — MCO5 here and that
      spec's MCO-G are the same real work; see build_order_note."
    uuid:        nexus-repository-system-build-v0-0000-2026-0915-001
    author:      james-brooks
    compiled_by: claude
    created_at:  2026-09-15T00:00:00Z
    depends_on_specs:
      - nexus-repository-system.spec
      - idearium-creative-repo-overhaul-phasemap.spec   # shares MCO-B/MCO-G surface
    intent: >
      Turn nexus-repository-system.spec's 46 sections into a real build
      plan. MCO0 found substantially more already real than expected —
      idearium/repo/index.js + import-pipeline.js + agent-suite/index.js
      already implement layers L0-L5 and part of L7/§38. This phasemap
      scopes what's left: graph (§24-26), deeper verification tiers
      (§37 L4-L8), full snapshot compliance (§33), hooks/wires/flows/
      tools as first-class repository-domain nodes (§18-22), git
      push/pull + credentials (§30-31), and Compartment ownership (§5, §32).

  # ── MCO0: audit real coverage before scoping anything ────────────────
  MCO0_audit_real_coverage:
    depends_on: []
    status: "DONE 2026-09-15."
    method: >
      Grep'd the real codebase for each spec section's canonical
      terms/functions rather than assuming from the spec text alone —
      same discipline as the existing axiom-5-2-raid-routing-phasemap's
      MCO7.
    real_and_done:
      - "L0 SOURCE / L1 STRUCTURE: idearium/repo/index.js v2.0.0. A repo
        IS a spec-engine manifest (§1.1/§2.2 chunk verification), real
        identity via rootHash (SHA-256 over canonical chunk content,
        JAA's existing content-addressable convention) — matches §3
        identity rule almost exactly (repo UUID as logical identity,
        content hash for real dedup, not used as identity itself)."
      - "L2 PARSE / L3 CHUNKS / L4 ATLAS: idearium/repo/import-pipeline.js.
        Deterministic regex-based structural-boundary parsing per
        language family (§10 constraint: no LLM for ordinary syntax —
        honored). buildAtlas() produces compressed topology (§14-15).
        Chunk boundaries never cut mid-body (§11 boundary_constraint).
        Failed-parse files stay observable/indexable/non-chunkable
        (§10 on_failure — honored exactly)."
      - "§35 INCREMENTAL: import-pipeline.js diffs against its own
        previous chunks/index.json + indexes/files.json contentHash —
        one edited file re-chunks one file, not the whole repo. Matches
        §35's chain almost verbatim."
      - "§42 STATE MACHINE (partial): PARSING -> MAPPING -> CHUNKING ->
        VERIFYING -> INDEXING -> READY|FAULT implemented in run(). A
        throwing step logs the canonical failure event (§39) and
        returns with FAULT plus whatever completed earlier — §39's
        'nothing silently fails' honored."
      - "§37 VERIFY (partial, L0-L3 only): import-pipeline.js's verify()
        performs syntax + boundary + structural integrity, matching
        §37's import_should_perform list exactly. L4-L8 (semantic,
        dependency, runtime/test, integration, system contract) not
        built — see MCO2."
      - "§2 CORE AXIOM / §38 MUTATION -> MAP UPDATE (partial):
        idearium/agent-suite/index.js's listRepositories,
        getRepositoryMap, getRepositorySymbols, getRepositoryChunks/
        Chunk, editRepositoryFile give agents the real MAP -> UNDERSTAND
        -> ACT lifecycle NEXUS-001 requires. editRepositoryFile
        triggers repo/index.js's _materializeQuiet, which reruns the
        whole pipeline — REPO-018 ('mutation produces an updated map')
        is real, not aspirational."
    real_gaps_grep_confirmed_zero_hits:
      - "§24-26 GRAPH: relationship_graph / dependency_cone /
        graph.traverse — zero matches repo-wide. Symbols and chunks
        exist; edges between them (imports, calls, depends_on) do not."
      - "§30 GIT INTEGRATION: zero simple-git/nodegit/git-spawn tied to
        idearium-hosted repos. (The nexus meta-repo's own git is a
        separate, unrelated concern — scripts/precommit-check.js.)"
      - "§31 CREDENTIALS: no dedicated credential capability for
        repository git operations — moot until MCO5, but the
        constraint (agent must never receive key material) needs to be
        designed in from MCO5's first line, not retrofitted."
      - "§18-22 HOOKS/WIRES/FLOWS/TOOLS as repository-domain node types:
        nexus's general hooks/wires system exists (hooks/*.hooks.js)
        but nothing typed repository:hook / repository:wire / .flow /
        .tool. agent-suite's functions are real but not yet formalized
        as the spec's .tool node shape."
      - "§33 SNAPSHOTS full compliance: versionium commits exist and
        work (see idearium-creative-repo-overhaul-phasemap MCO-B) but
        don't yet record atlas_version / chunk_index_version /
        graph_version / dependency_state / test_state /
        verification_state alongside source hash + git commit — only a
        subset of §33's must_record list."
      - "§5/§32 COMPARTMENT OWNERSHIP: cos/compartment exists as its own
        subsystem; nothing wires 'a repo MUST belong to exactly one
        Compartment' or 'import creates/attaches to a Compartment,
        never a second parallel abstraction' (§5 constraint) — that
        constraint is currently unenforced, not violated, just absent."
    gate: "MET — every real item above is cited to a real file/function;
      every gap is a grep-confirmed zero-hit, not an assumption."

  # ── MCO1: graph layer ─────────────────────────────────────────────────
  MCO1_graph_layer:
    depends_on: [MCO0]
    status: "NOT STARTED"
    does: >
      Derive relationship edges from data import-pipeline.js already
      produces (symbols, imports it may already be scanning for
      language-family boundary detection) rather than re-parsing.
      Ships incrementally per §24's own constraint — unknown
      relationships MUST remain explicitly unknown, not invented to
      complete the graph.
    order:
      - imports / exports (cheapest — likely near-free extension of
        existing SYMBOL_PATTERNS regex work in import-pipeline.js)
      - contains / belongs_to (structural, derived from existing
        file->chunk->symbol containment already in the atlas)
      - depends_on / depended_on_by (derived from imports, one hop)
      - calls / called_by (harder — needs call-site detection, not
        just declaration detection; may stay "unresolved" longer)
    adds:
      - repository.graph.traverse.capability
      - repository.graph.dependencies.capability
      - repository.graph.affected.capability   # feeds MCO2's dependency cone
    gate: >
      MET when graph.traverse(start=<real chunk>, relation=depends_on,
      depth=N) returns a real edge set for an actual materialized repo,
      and any relationship the extractor can't determine is marked
      "unresolved" rather than omitted (§24 constraint, REPO-009).

  # ── MCO2: verification tiers L4-L8 ────────────────────────────────────
  MCO2_verification_deepening:
    depends_on: [MCO1]
    status: "NOT STARTED"
    does: >
      Extends the existing verify() (which already covers L0-L3) up
      the tier ladder. Per §37's own note, expensive tiers (L6 runtime/
      test, L7 integration) SHOULD run lazily against the affected
      cone MCO1 produces — not eagerly on every import.
    tiers_to_add:
      - { level: L4, name: "semantic consistency", basis: "existing symbol table" }
      - { level: L5, name: "dependency consistency", basis: "MCO1 graph" }
      - { level: L6, name: "targeted runtime/test", basis: "MCO1 affected cone, lazy" }
      - { level: L7, name: integration, basis: "lazy, cone-scoped" }
      - { level: L8, name: "system contract", basis: "existing interaction-contract.json files" }
    gate: >
      MET when a real mutation triggers L4-L5 synchronously (cheap) and
      L6-L8 lazily against exactly the affected cone MCO1 computes —
      not the whole repo — matching §37's note and §26's
      dependency_cone rule.

  # ── MCO3: full snapshot compliance ────────────────────────────────────
  MCO3_snapshot_compliance:
    depends_on: [MCO1, MCO2]
    status: "NOT STARTED"
    does: >
      Extends the versionium_commit metadata (real, existing — see
      idearium-creative-repo-overhaul-phasemap MCO-B) to also carry
      atlas_version, chunk_index_version, graph_version,
      dependency_state, environment, test_state, verification_state —
      the rest of §33's must_record list. No new commit mechanism;
      this is additive fields on the existing real one.
    gate: >
      MET when a real commit's metadata round-trips all of §33's
      must_record fields, verified against one real commit, not asserted.

  # ── MCO4: hooks/wires/flows/tools as first-class repository nodes ────
  MCO4_hooks_wires_flows_tools:
    depends_on: [MCO1]
    status: "NOT STARTED"
    does: >
      Wraps the real functions that already exist (agent-suite's
      listRepositories/getRepositoryMap/etc., import-pipeline's
      parse/verify) as formal .tool nodes per §22, rather than writing
      new logic. Adds repository:hook / repository:wire as typed nodes
      per §18-19. .flow (§21) is new — a general event-driven
      executable topology, explicitly distinct from clear-glass's
      .macro, which stays untouched.
    adds:
      - "repository.discover/.map/.parse/.index/.search/.traverse/
        .surface/.patch/.verify/.diff/.snapshot .tool nodes (§22 list),
        each wrapping an already-real function where one exists"
      - repository:hook / repository:wire typed nodes (§18-19)
      - ".flow schema (§21) — nodes, wires, entry, status"
    gate: >
      MET when every .tool node in §22's canonical list either wraps a
      cited real function or is explicitly marked not-yet-implemented —
      no .tool node claims capability without a real function behind it.

  # ── MCO5: git push/pull + credentials ─────────────────────────────────
  MCO5_git_integration_credentials:
    depends_on: [MCO3]
    status: "NOT STARTED — SAME WORK as
      idearium-creative-repo-overhaul-phasemap.spec's MCO-G. Build once,
      satisfy both gates. See build_order_note."
    does: >
      Real git clone/fetch/branch/checkout/diff/commit/tag/restore/
      push/pull against repository.source (§30 git_provides list).
      NEXUS continues owning semantic identity/atlas/chunks/
      relationships/verification/impact (§30 nexus_provides) — git
      integration does not replace any of MCO0-MCO4's real work, only
      persists it externally.
    constraint: >
      §31 CREDENTIALS — agent/copilot MUST NOT receive password/token/
      key contents as ordinary context. Same constraint idearium-
      creative-repo-overhaul-phasemap's MCO-G already states for
      ssh_key_path (copilot_writable:false there). One credential
      capability, one enforcement point, referenced by both phasemaps.
    gate: >
      MET when a real repository pushes a real commit to a real remote
      and a separate clone restores it byte-identical, with zero key
      material appearing in any event/chat/copilot context — identical
      bar to the other phasemap's MCO-G, because it is the same gate.

  # ── MCO6: Compartment ownership ────────────────────────────────────────
  MCO6_compartment_ownership:
    depends_on: [MCO0]
    status: "NOT STARTED"
    does: >
      Wires §5's ownership rule: repository import creates or attaches
      to an existing cos/ Compartment, never a second parallel
      "project compartment" abstraction. idearium's repo record (uuid,
      specUuid, rootHash, parent, forks, source, phase) gains a
      compartment_id field; cos/compartment owns execution state,
      idearium's repo record continues owning source/structure per
      §32's distinction (repository model describes source, Compartment
      describes execution).
    gate: >
      MET when every real idearium-imported repo has exactly one
      compartment_id, cos/compartment's own state confirms ownership
      both directions, and no second compartment-like abstraction
      exists anywhere in idearium's repo layer (grep-confirmed absence,
      same bar as MCO0).

  build_order: [MCO1, MCO2, MCO4, MCO3, MCO6, MCO5]
  build_order_note: >
    MCO5 (git+credentials) is intentionally last here, same reasoning
    as idearium-creative-repo-overhaul-phasemap's MCO-G: highest
    external-network/credential surface, wants its own security pass.
    Because MCO5 here and that spec's MCO-G are literally the same
    build, whichever phasemap reaches it first should implement once;
    the other phasemap's corresponding MCO should then be marked DONE
    by reference to this one's gate, not rebuilt.
