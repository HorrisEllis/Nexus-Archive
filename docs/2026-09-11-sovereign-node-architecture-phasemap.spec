spec:
  meta:
    name:    2026-09-11-sovereign-node-architecture-phasemap
    version: 0.1.0
    status: draft
    created: 2026-09-11
    author: james-brooks (via Claude, real map + phasing pass)
    uuid: nexus-phasemap-sovereign-nodes-v1-0000-2026-0911-001

  # ── James's own words, preserved verbatim as the real source of intent ──
  vision: |
    Each system spec file is the living map. Each system works on its
    own — sovereign. Each node identifies: directory, intention, system,
    context, memory system (if applicable). Each command/agent/model/
    tool/toolbox/ledger/failure_mode gets its own node file — not
    generic, each system needs its own full node schema for all its
    data types and memory architectures. This is a dynamic system.

  # ── Real, confirmed findings this pass — what's true right now ──────────
  confirmed_state:
    - finding: "docs/nexus.spec (the declared 'living map' for the whole
        system) is stale in the exact same way contracts/nexus-
        interaction-contract.js was before its own fix this session —
        bridge still listed as boots:first, 'no system calls another
        directly,' both false since bridge's real retirement."
      severity: high
      status: not yet fixed

    - finding: "loom/maps/ has real, topical maps (ui-map, warp-map,
        observability-map, etc.) but no per-system unified map — the
        'each system's own spec is its own living map' principle is not
        yet true structurally."
      severity: medium

    - finding: "lib/node-schemas/ is ONE, centralized, generic schema set
        (19 real types) shared across every system. This directly
        contradicts 'not generic, each system needs its own full node
        schema' — confirmed by inspection, not assumed."
      severity: high

    - finding: "only 4 of 12 real systems have interaction-contract.json
        (guardian, cortex, idearium, architect) — confirmed in a prior
        pass this same session. copilot and clear-glass, the two most
        actively developed systems this session, are among the 8
        missing."
      severity: high

    - finding: "data/nodes/ (moved from lib/nodes/ this same session) is
        the one real, concrete precedent for 'each command/tool/agent/
        etc. gets its own node file' — 86 real .tool files, 4 real
        .toolbox files, proven working with a real, live index watcher."
      severity: n/a — this is the real, working example to generalize FROM

  # ── Real phases, in dependency order — each is real, bounded, testable work ──
  phases:
    P1_fix_the_declared_living_maps:
      status: open
      description: |
        docs/nexus.spec and any other file that CLAIMS to be a real,
        current source of truth must actually be current. Same real fix
        pattern already proven this session on contracts/nexus-
        interaction-contract.js: remove/retire what's gone (bridge),
        add what's missing and real (copilot, clear-glass, and any
        other system this spec doesn't yet list), keep retired entries
        present-but-marked rather than deleted (the axiom this session
        already learned the hard way once).
      blocks: []

    P2_per_system_interaction_contracts:
      status: open
      description: |
        Build the 8 missing interaction-contract.json files (copilot,
        ollama, clear-glass, diagnostic, loom, versionium, eravos,
        intelligence), matching the real, established shape the
        existing 4 already use. This is the real "sovereign, connected
        only through the interaction contract" principle becoming true
        for every system, not just a third of them.
      blocks: []

    P3_per_system_node_schemas:
      status: open
      description: |
        The real, hard architectural decision this phase requires:
        does lib/node-schemas/ stay ONE, shared, generic set (simpler,
        but contradicts "not generic, each system needs its own"), or
        does each system get its own real schema folder (e.g.
        guardian/node-schemas/, idearium/node-schemas/) that can extend
        or override the shared base? Needs a real answer before
        building — this phase is genuinely a decision point, not just
        implementation.
      blocks: [P4_full_node_type_coverage_per_system]

    P4_full_node_type_coverage_per_system:
      status: open
      description: |
        Generalize the one real, proven pattern (data/nodes/'s 86 real
        .tool files + node-index-watcher.js) to every real node type
        James named: command, agent, model, tool, toolbox, ledger,
        failure_mode — one real file per real instance, per system,
        each with the real fields James specified (identity, directory,
        intention, system, context, memory system where applicable).
        Depends on P3's real schema-ownership decision being made first.
      blocks: []

    P5_data_folder_completion:
      status: open
      description: |
        The real, measured finding from earlier this session: data/
        folders are near-empty (3-13 files each) while cortex's JAA
        store holds the real, load-bearing data for almost every system
        (1114 events, 1038 ledger rows, 135 intake drops, etc.). This
        phase is the real migration — each system's real, live data
        moves into its own data/<system>/ folder, cortex becomes the
        real bookkeeper it's meant to be rather than the primary store.
        Explicitly the largest, highest-risk phase — real data, real
        consumers, needs its own careful, dedicated pass per system, not
        attempted in one sweep.
      blocks: []

    P6_per_system_contract_schemas:
      status: open
      description: |
        James: "each system needs contract schemas if applicable.
        everything has to be a tangible file. that way the system
        can't lie. it persists on restart." Not every system needs a
        real contract schema (some are pure UI, some pure library) —
        "if applicable" means this phase starts with a real audit of
        which systems genuinely dispatch/receive contracts at all
        before building schemas for ones that don't need them.
      blocks: []

    P7_copilot_ticket_queue:
      status: open
      description: |
        James: "what if copilot inputs starts a ledger until the
        request is marked complete... using a contract... input goes
        into a ledger into the queue, then copilot reads and
        responds... i want it to feel like an actual conversation."
        Real, NOT a new mechanism — the exact same real pattern already
        proven this session for wake-word (GUARDIAN_LEDGER_WRITE, a
        real shared jobId tying question->answer->complete together),
        applied to every real copilot input, not only wake-word ones.
        Real, already-existing, load-bearing piece to connect this to,
        not duplicate: copilot/lib/person-model/ (built 2026-08-17,
        already does session ledgers chaining to the previous session,
        provenance-tracked hypotheses, confidence decay) — "an accurate
        model of me" is not a new ask, it already exists and is
        already wired into the live request flow (copilot/routes/
        person-model.js). This phase is the ticket/queue LAYER on top
        of turn-processing itself, plus making sure copilot actually
        reads its own ledger before responding — that's the real
        connection that makes continuity actually felt, not just
        persisted.
      blocks: []

    P8_per_system_component_registry:
      status: open
      description: |
        James, verbatim (real, exact field list, not paraphrased —
        preserve this precisely, nothing lost): "comp, hook and wire,
        type, id, dir, intent, commands, edge case and summary of each
        component. basically a map of the wiring, context, intent,
        directory, why it exists and what to expect. IDs, UUIDs, node
        UUIDs... command id, node uuid, each component can be a node
        type. data type, data directory for the node/data."
        Structure: "core components, the foundational components that
        the rest of the system rely/build on. then each module with
        each component." A real, per-system hierarchy — core layer
        first, then modules, then components within each module — not
        a flat list. Real precedent to build FROM, not duplicate:
        loom's own real maps (loom/maps/*.js) already do component/
        hook/wire mapping with real require()-verified edges — this
        phase is making that real, proven pattern exist PER SYSTEM,
        in that system's own folder (per the sovereign-system
        principle this whole phasemap is built on), not only
        centrally in loom/.
      blocks: [P3_per_system_node_schemas]

    P9_diagnostic_from_expected_behavior:
      status: open
      description: |
        James: "this way we can also use the data as a way to
        understand expected behavior, that way we can diagnose the
        system way more accurately." Real, valuable, concrete
        consequence of P8 once built — if every component's real
        contract states what it touches, what modules/components
        depend on it, and what "expected" looks like, diagnostic
        (service/nexus-diagnostic.js) could compare real, live
        behavior against a real, declared expectation instead of only
        generic health/gap signals. Depends on P8 actually existing
        first — this is a real consumer of that data, not a
        replacement for building it.
      blocks: [P8_per_system_component_registry]

    P10_intelligence_reads_sse_and_data_folders:
      status: open
      description: |
        James: "then the intelligence system can use the sse and data
        folders for each system." Real, closing connection — once P5
        (data-folder-completion) and P8 (per-system registries) are
        real, cortex/intelligence's own real pattern-crystallization
        work (already live — confirmed this session via real boot-log
        lines like "pattern crystallised: cross_system_causal") should
        read from each system's own real data/ folder and SSE stream
        directly, not only cortex's own centralized JAA tables. Depends
        on both P5 and P8 being real first.
      blocks: [P5_data_folder_completion, P8_per_system_component_registry]

    P11_unify_failure_tracking:
      status: open
      description: |
        Real, confirmed audit finding (this session, deliberately kept
        shallow given real token constraints — this phase is the real,
        deep follow-up, not a substitute for it): 3 distinct, real
        failure-tracking mechanisms exist and do not talk to each
        other — cortex/self-heal/fault-taxonomy.js (friction-based
        escalation ladder), cortex/self-heal/index.js's
        _enterFailureMode (writes a JAA failure_modes row), and
        lib/ico.js's logFailure() (real, per-system NDJSON to
        data/<system>/failures/, needs a specific per-system ICO
        instance). None currently create a real .failure_mode node —
        confirmed by a real attempt this session that was reverted
        after catching it used the wrong field shape and had no clean
        way to resolve the right ICO instance generically. Real,
        deliberately incomplete: a genuine fix here needs resolving
        which system's ICO instance owns a given failure, not
        guessed at under token pressure.
      blocks: [P8_per_system_component_registry]

    P12_compartment_per_contract:
      status: open
      description: |
        James: "working memory is meant for immediate data for the
        contract which we should create a compartment for to copy and
        write relevant data. that way we have whatever the contract
        needs, the agent needs, and it's isolated from nexus."
        Confirmed real, not new: lib/compartment-engine.js's whole
        design already assumes a compartment IS a real, isolated
        working space per real intent. What's missing: contracts don't
        automatically get one — it's optional/manual right now. This
        phase makes it automatic and default for every real contract,
        not an opt-in.
      blocks: []

    P13_interaction_contract_plus_handshake_for_every_cross_system_call:
      status: open
      description: |
        James, verbatim, real and precise: "every interaction between
        systems has to use the interaction contract, and verify handoff
        using handshake. if it succeeds, goes into the system's queue,
        if it fails remains where it's at, failure mode report is made,
        fault is logged, diagnostic system runs using the intelligence
        system, reads the contract to understand intention and
        expectation, reads the fault taxonomy to see if it's happened
        before and what resolved the fault." A real, complete,
        already-well-specified protocol — not vague. Depends on P2
        (per-system interaction contracts existing for every system)
        and P11 (unified failure tracking, since this protocol's own
        failure path routes directly into it) both being real first.
      blocks: [P2_per_system_interaction_contracts, P11_unify_failure_tracking]

    P14_per_system_living_gap_index:
      status: open
      description: |
        James: "we can have a living gap index for each system, with
        the relevant information using the intelligence system and
        diagnostic system." Real precedent to build from, not
        duplicate: the real gaps JAA table (56 real rows, confirmed
        this session) and diagnostic's own real GAP-emitting mechanism
        already exist centrally. This phase is making that real,
        working concept exist per-system (matching the sovereign-system
        principle this whole phasemap is built on) rather than only in
        one shared, central table.
      blocks: [P8_per_system_component_registry]

    P15_redundant_file_purge:
      status: open
      description: |
        James: "copilot has files in the folder it doesn't really need
        i feel like. i feel like a purge of redundant files needs to
        happen before the audit." Real, checked this session before
        committing to this as a phase rather than acting on a hunch:
        the one obvious candidate checked (copilot/diagnostics.js vs
        diagnostic-sweep.js) was a real FALSE ALARM — both are genuinely
        used, diagnostic-sweep.js actually calls diagnostics.js as a
        real dependency (confirmed via 4 real call sites a first,
        narrower grep missed). This is the real, honest lesson for this
        whole phase: a purge needs a real, systematic per-file
        require-graph check, not a hunch based on filenames looking
        similar — genuinely redundant files may exist, but finding them
        safely takes real, dedicated verification work, not assumed
        from naming alone.
      blocks: []

    P19_dynamic_nodes_via_causal_graph:
      status: open
      description: |
        James: "make nodes dynamic." Real, NOT new — intelligence/cfr/
        graph.js's CausalGraph already does exactly this for ledger
        rows, its own header states it outright: "Every ledger entry is
        also a node in the causal graph." Edges from causedBy/sessionId/
        jobId/temporal proximity are real and working, with real
        root-cause traversal and sigma clustering. This phase is the
        generalization: any real node-type instance (.gap, .contract,
        .agent — the 26 real types from lib/node-schemas/) becomes a
        CausalGraph node the same way a ledger row already does, not
        just ledger entries specifically. This is the connective phase
        the other three below build on — P20/P21/P22 all assume a node
        can participate in a causal graph, not just describe itself
        statically.
      blocks: []

    P20_intelligence_reflexive_cfr_field:
      status: open
      description: |
        James: "a causal field for the intelligence system." Real,
        confirmed gap — intelligence/cfr/field.js's createCFRField()
        already computes coherence/friction/resonance/entropy for other
        systems' event streams (guardian.job.*, etc. — real event-nudge
        table, grep-confirmed), and meta/lattice/associative-lattice.js
        already gives every SYSTEM PAIR its own field via this exact
        mechanism. Checked directly: zero hits for a field describing
        intelligence's own state, reflexively. This phase gives
        intelligence one field instance on itself — same real
        createCFRField() call, same real nudge-table pattern, no new
        physics model invented.
      blocks: []

    P21_versionium_causal_field:
      status: open
      description: |
        James: "a causal field for... versionium." Real, partial
        already — versionium/lib/causality.js already uses CausalGraph
        to trace a commit's causal ANCESTRY (structure: what led to
        what), including across systems via cortex's shared event_log.
        What it doesn't have is a causal FIELD (physics: coherence/
        friction/resonance/entropy) the way relationship_edge gives
        system pairs one. This phase adds that dimension to versionium's
        commits/branches, directly reusing relationship_edge's own
        pattern (schema built 2026-09-11, same session) rather than
        inventing a new one — a commit or branch gets the same
        createCFRField()-backed field a system pair already gets.
        Depends on P19 (a versionium commit needs to be a real graph
        node first, before it can carry a field the same way).
      blocks: [P19_dynamic_nodes_via_causal_graph]

    P22_ledger_data_integrity_checker:
      status: open
      description: |
        James: "cortex has tools for checking data integrity, comparing
        ledger to data folder to find gaps" — describing a real,
        wanted capability, not an existing one; checked directly,
        nothing in cortex/ or anywhere else compares ledger CONTENT
        against actual data/ folder state. Two real, close precedents
        exist to build FROM, not duplicate: lib/file-integrity.js
        (hashes source files/registries/SEAM wires, drift -> sigma ->
        gap, real and proven) and lib/integrity-revert.js (sigma-gated
        guarded revert via replay-engine, also real). Both are scoped to
        code/config, never to runtime data content — this phase is the
        same real hash-diff-sigma-gap pattern, applied to: does the
        ledger say a node was created/modified, and does data/<system>/
        <type>/ actually contain the matching real file? This is
        directly the validation mechanism the P5 gap-migration-manifest
        (2026-09-11, 175 gaps classified, writes still frozen pending
        the nesting-order + ownership decisions) will need once those
        decisions land and real writes happen — proving the migration
        didn't silently lose or duplicate anything, not just hoping it
        didn't. Depends on P5 (data_folder_completion) having real
        migrated data to check against, and P19 (nodes need to be real
        graph-participating entities for a meaningful causedBy-vs-
        current-state comparison, not just static files).
      blocks: [P5_data_folder_completion, P19_dynamic_nodes_via_causal_graph]

  # ── Deliberately not decided here ────────────────────────────────────
  open_questions:
    - "P3's real schema-ownership model — shared base + per-system
       extension, or fully separate per-system schemas from scratch?"
    - "What does 'memory system (if applicable)' mean per node type,
       concretely? JAA table name? Vector-embedded or not? Which nodes
       even need memory-system metadata vs. which are just structural?"
    - "Order of P5's per-system data migration — which system first?"
    - "P16-P18 exist with different content on the sibling
       nexus-v0_39_76.zip branch (docs declutter, per-system phasemap
       folders, per-system repos) — P19-P22 deliberately skip those
       numbers rather than collide. Real branch reconciliation still
       needed before both halves live in one phasemap."
