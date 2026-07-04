spec:
  meta:
    name:        loom
    version:     0.1.0
    status:      proposed
    uuid:        nexus-loom-v1-0000-2026-0702-jamesbrooks-001
    phase:       131
    axioms:      [§2.1, §2.3, §5.7, §5.8, §6.2]
    depends_on:  [hooks/index.js, cortex/registry-components.js, idearium, cos/kernel.js,
                  nexus-query-surface.spec, cortex-intelligence.spec]
    purpose: >
      LOOM is Idearium forked and scoped to the entire NEXUS mesh.
      Where Idearium tracks ideas → specs → repos (one project's lifecycle),
      LOOM tracks components → contracts → hooks → resolutions (the whole system's
      knowledge of what it can do and what it has figured out).

      LOOM answers one question: "Is this known? And if so — to which component?"
      It is the resolution layer between a question arriving at co-pilot and that
      question being dispatched or escalated. Without LOOM, keyword resolution
      in the query surface is string matching against table columns. With LOOM,
      it is a typed lookup against a living component registry with causal lineage.

  what_loom_is_not:
    not_idearium: >
      Idearium owns ideas. LOOM owns capability declarations. An idea in Idearium
      is something that might become a system. A component in LOOM is something
      that already exists and has declared what it can handle. They share data
      shapes (the branch/compartment pattern) but have different lifecycles.
    not_the_component_registry: >
      Each system's registry-components.js declares components for that system.
      LOOM is the federated index that reads all eleven registries, tracks their
      contract states, and exposes a unified lookup surface. The component
      registry is the source; LOOM is the living view over all sources.
    not_the_query_surface: >
      The query surface (nexus-query-surface.spec) answers "what's happening with X?"
      LOOM answers "which component handles X?" — a prerequisite for the query
      surface's keyword resolution to be accurate rather than guess-based.

  the_four_loom_concepts:

    registry:
      what: >
        The federated index of all declared components across all 11 sovereign
        systems. At boot, reads every registry-components.js and hooks file,
        builds a unified component map keyed by componentId, tagged by cluster,
        annotated with the hooks that connect it to other systems.
      source:    "hooks/index.js (82 hooks) + 11 registry-components.js files"
      index_key: componentId (e.g. 'guardian.dispatch', 'cortex.nerve.snapshot')
      lookup: >
        LOOM REGISTRY resolves: "which component is this about?"
        Input: keyword or natural-language intent.
        Output: { componentId, systemId, cluster, hooks: [...] }
        Mechanism: exact match first (componentId), then cluster match (hooks.type),
        then intent classification via intelligence engine intuition().

    contracts:
      what: >
        Per-component interaction records. When co-pilot dispatches to a component,
        LOOM opens a contract: component_id, attempt_id, input, opened_at.
        When the dispatch resolves, LOOM closes it: outcome, resolution, closed_at.
        The contract record IS the causal bridge between "co-pilot asked about X"
        and "system Y handled it and here's what happened."
      lifecycle:  OPEN → IN_FLIGHT → PASS | FAIL | ESCALATED
      jaa_table:  loom_contracts
      schema:
        id:           UUID
        componentId:  from registry
        attemptId:    this specific attempt
        input:        what was asked (truncated)
        outcome:      'pass' | 'fail' | 'escalated' | null (open)
        resolution:   what the system returned (truncated)
        openedAt:     ts
        closedAt:     ts | null
        causedBy:     event_id that triggered this contract
        handoffTo:    idearium idea UUID if resolution became permanent knowledge

    hooks:
      what: >
        The hook graph from hooks/index.js, surfaced as a LOOM-queryable layer.
        LOOM makes hooks searchable by: from-surface, to-surface, type, seam status,
        cluster affinity. A question about "guardian ↔ cortex" resolves to the
        hooks that declare that relationship — coherence, friction, seam tracking.
      extends:   hooks/index.js (already 82 hooks, 10 systems, real data)
      adds: >
        Cluster affinity tags on each hook: which RAID cluster is this hook
        relevant to? Allows LOOM to answer "which hooks handle analysis requests?"
        without string matching against hook names.

    idearium_handoff:
      what: >
        When a LOOM contract closes with outcome='pass' and the resolution is
        genuinely novel — something the system hadn't done before — LOOM hands
        off to Idearium to make it permanent knowledge.
        A LOOM contract record becomes an Idearium idea in 'tensioned' phase:
        the question was asked, the system figured it out, now it can be tracked,
        specced, and eventually built into the system permanently.
      trigger:    contract.outcome === 'pass' AND conditioning_log.isNovel === true
      creates:    { title: resolution_summary, phase: 'tensioned', loomContractId }
      never: >
        Idearium is not called for every LOOM contract. Only for resolutions that
        represent new capability, not routine dispatch. "What is guardian's sigma?"
        is routine — it resolves to existing components, no Idearium entry.
        "Guardian could handle X but only if Y is added" is novel — Idearium entry.

  the_branching_decision_loop:
    description: >
      From nexus-branching-decision-loop-spec.md: the full path a question takes
      from co-pilot through LOOM into the system and back.

    steps:
      "1. Question arrives at co-pilot":
            Co-pilot reads query surface (what's happening with X).
            Co-pilot checks conditioning_log (has this been answered before?).
      "2. LOOM REGISTRY resolves": >
            If conditioning_log has no record: LOOM looks up componentId for X.
            Returns: { componentId, systemId, cluster, hooks }.
            If LOOM finds nothing: escalate to intelligence engine intuition().
      "3. LOOM CONTRACTS opens": >
            One contract for this componentId + this attempt.
            Bound to a COS compartment (from cos/kernel.js) for isolation.
            The compartment's axioms = the component's constitutional constraints.
      "4. Dispatch through RAID simulation": >
            RAID _decide() + simulation.js pre-commit check.
            The COS compartment is the simulation sandbox.
            LOOM contract receives the simulation result.
      "5. Resolution": >
            If RAID simulation → commit: dispatch, record outcome.
            If RAID simulation → fallback: LOOM tries next candidate componentId.
            If RAID simulation → escalate: LOOM closes contract as 'escalated',
            emits loom.contract.escalated for human attention.
      "6. LOOM CONTRACTS closes": >
            outcome, resolution, closed_at written.
            conditioning_log updated with outcome.
            If novel: Idearium handoff triggered.
      "7. LOOM REGISTRY learns": >
            Successful resolutions update the registry's cluster affinity tags.
            Over time, LOOM gets better at knowing "guardian handles this cluster
            for this type of question" without re-resolving every time.

  data_model:
    jaa_tables:
      loom_contracts:
        columns: [id, componentId, systemId, cluster, attemptId, input, outcome,
                  resolution, openedAt, closedAt, causedBy, handoffTo, ts]
      loom_registry_cache:
        columns: [componentId, systemId, cluster, clusterAffinity, hookIds,
                  successRate, lastUsed, lastUpdated]
        note: >
          This is a materialized view over hooks/index.js + registry-components.js.
          Rebuilt at boot and on any hook/registry change event. Not a source of
          truth — the source files are. The cache is for fast lookup.

  http_surface:
    base_port: 4810  # new sovereign port — LOOM is a sovereign service
    routes:
      "GET  /contract":              "LOOM interaction contract"
      "GET  /registry":              "Full component + hook index"
      "GET  /registry/resolve?q=":  "Resolve keyword to componentId"
      "GET  /contracts":             "Recent LOOM contracts (last 100)"
      "POST /contracts":             "Open a new LOOM contract"
      "PUT  /contracts/:id":         "Close a LOOM contract with outcome"
      "GET  /contracts/:id":         "Single contract detail"
      "GET  /status":                "LOOM health + registry stats"

  relation_to_existing_systems:
    query_surface: >
      nexus-query-surface.spec's keyword resolution currently does string matching.
      When LOOM exists, the query surface calls GET /loom/registry/resolve?q=about
      instead. Resolution is accurate, typed, and causally tracked.
    raid_simulation: >
      LOOM opens a contract before RAID simulates. The COS compartment created
      for the simulation IS the compartment bound to the contract. When the
      simulation resolves, LOOM receives the result directly.
    copilot: >
      Co-pilot calls LOOM before dispatching. If LOOM's registry has a record
      for this question type, co-pilot skips the full context assembly and uses
      the cached resolution. If not, co-pilot runs the full path and the result
      feeds LOOM's registry for next time.
    idearium: >
      LOOM is not a replacement for Idearium. Idearium owns the idea lifecycle.
      LOOM owns the knowledge that a specific system can handle a specific class
      of questions. They are complementary: LOOM says "cortex handles this,"
      Idearium says "we should build more of this capability."

  what_it_replaces:
    string_matching: >
      Every `(g.system||'').toLowerCase().includes(about)` in the query surface.
      Every `keywords.includes(w)` in copilot's query surface enrichment.
      These are correct but untyped — they match text, not capability declarations.
      LOOM replaces them with a typed, causal, learning lookup.
    implicit_routing: >
      The implicit assumption that "guardian" in a prompt means route to guardian.
      LOOM makes this explicit: the component registry declares what guardian
      handles, LOOM resolves the match, RAID dispatches to it.

  build_order:
    "1. loom/registry.js": >
        Boot reader: reads all 11 registry-components.js + hooks/index.js,
        builds componentId → {systemId, cluster, hooks} map,
        writes to loom_registry_cache JAA table.
    "2. loom/resolver.js": >
        GET /registry/resolve?q= — exact match, cluster match, intuition fallback.
        Returns { componentId, systemId, cluster, confidence }.
    "3. loom/contracts.js": >
        POST /contracts + PUT /contracts/:id lifecycle.
        COS compartment bound to each contract.
    "4. loom/server.js": >
        HTTP server at :4810. Registers with orchestrator.
        Emits loom.* events to nexus-bus.
    "5. Wire query surface → LOOM resolver".
    "6. Wire co-pilot context assembly → LOOM registry before dispatch".
    "7. Wire RAID simulation → LOOM contract open/close".
    "8. Wire Idearium handoff → novel resolution".

  honest_gaps:
    loom_registry_cache_table: >
      loom_registry_cache is not yet in jaa/schema.sql. Must be added before build.
    loom_contracts_table: >
      loom_contracts is not yet in jaa/schema.sql. Must be added before build.
    cos_compartment_binding: >
      Binding a COS compartment to a LOOM contract requires cos/kernel.js to be
      wired into LOOM's contract lifecycle — the compartment must be recycled
      when the contract closes. This wiring exists in design; code to write.
    cluster_affinity_tags: >
      hooks/index.js has no cluster affinity tags yet. LOOM needs to either add
      them to hooks declarations or derive them from hook type + from/to system
      mapping. The latter is inferrable from existing data; the former is cleaner.
