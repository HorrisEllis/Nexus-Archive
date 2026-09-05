spec:
  meta:
    name:        cortex
    version:     3.5.0
    foundation:  nexus-system-foundation@1.0.0
    port:        3748
    uuid:        nexus-cortex-v3-0000-2026-0615-jamesbrooks-001
    purpose: >
      The memory and brain of NEXUS. Everything that needs to be
      remembered, learned, healed, or routed passes through Cortex.
      Six organs boot in sequence. The event bus connects them all.

  core:
    schemas:
      - Gap:           "{ uuid, type, severity, status, friction, path, body, source, ts }"
      - Artifact:      "{ uuid, jobId, provider, content, gapScore, usage, ts }"
      - CortexMemory:  "{ uuid, key, value, tags, source, tier, ts }"
      - FaultTaxonomy: "{ uuid, faultClass, friction, count, lastSeen, failureMode }"
      - FailureMode:   "{ uuid, faultClass, friction, humanAction, escalationHistory, ts }"
      - ChatLog:       "{ uuid, sessionId, role, provider, content, intent, outcome, gapScore, bdaSignals, ts }"
      - Component:     "imported from component-registry"
      - InterstitialSpace: "{ id, focalPoint, items, velocity, lastCrystallised }"
    axioms: [AX-001, AX-002, AX-003, AX-005]
    constants:
      MEMORY_TIERS:       "{ working: 30min, short: 6hr, long: permanent }"
      FRICTION_NOMINAL:   0.0
      FRICTION_ELEVATED:  0.4
      FRICTION_HIGH:      0.7
      FRICTION_FAILURE:   1.0
      SNR_THRESHOLD:      0.72
      VECTOR_DIM:         768
      HB_HEALTH_MS:       10000
      HB_PULSE_MS:        30000
      HB_TELEMETRY_MS:    60000

  events:
    emits:
      - "cortex.booted"
      - "cortex.gap.found"
      - "cortex.gap.resolved"
      - "cortex.gap.escalated"
      - "cortex.heal.requested"
      - "cortex.heal.applied"
      - "cortex.heal.failed"
      - "cortex.memory.written"
      - "cortex.memory.forgotten"
      - "cortex.intelligence.pattern_crystallised"
      - "cortex.raid.decided"
      - "cortex.snapshot.created"
      - "cortex.escalation.friction_increased"
      - "cortex.escalation.failure_mode"
      - "escalation.level_0 through escalation.level_4"
      - "component.registered / component.updated (from component-registry)"
    handles:
      - "guardian.job.complete    → memory.ingest"
      - "guardian.job.failed      → gap.open"
      - "HEAL_REQUESTED           → self-heal.escalate"
      - "bridge.relay.failed      → gap.open"
      - "system.booted            → heartbeat.reset"

  organs:
    description: >
      Six organs boot in sequence. Each organ subscribes to events
      and emits events. No organ calls another directly.
    sequence:
      - order: 1
        id: gap-finder
        purpose: "Watches event stream for stale modules, axiom violations, recurring failures"
        subscribes: ["*"]
        emits: ["cortex.gap.found"]

      - order: 2
        id: healer
        purpose: "Prescribes fixes for open gaps using diagnostic engine results"
        subscribes: ["cortex.gap.found"]
        emits: ["cortex.heal.requested"]

      - order: 3
        id: self-heal
        purpose: "5-level escalation ladder with friction ledger"
        subscribes: ["cortex.heal.requested", "HEAL_REQUESTED"]
        emits: ["cortex.heal.applied", "cortex.heal.failed", "cortex.escalation.*"]

      - order: 4
        id: orion
        purpose: "Sensor + policy. Classifies requests, routes to context."
        subscribes: ["*"]
        emits: ["cortex.orion.classified"]

      - order: 5
        id: raid
        purpose: "Provider selection. 9 clusters, 5 NCP providers, Ollama primary."
        subscribes: ["cortex.orion.classified"]
        emits: ["cortex.raid.decided"]

      - order: 6
        id: heartbeat
        purpose: "3-tier: health probe (10s), API pulse (30s), telemetry frame (60s)"
        subscribes: []
        emits: ["cortex.health", "heartbeat.tick", "heartbeat.pulse", "heartbeat.frame"]

  routes:
    internal:
      - "GET  /health"
      - "GET  /contract"
      - "GET  /events (SSE)"
    external:
      - "GET  /api/gaps?status="
      - "POST /api/gaps/resolve"
      - "GET  /api/memory/working"
      - "POST /api/memory/write"
      - "POST /api/memory/forget"
      - "GET  /api/failure-modes"
      - "GET  /api/friction"
      - "GET  /api/chat-log"
      - "GET  /api/search?q=&threshold="
      - "POST /api/search/context"
      - "GET  /api/search/status"
      - "GET  /api/raid/decide?intent="
      - "POST /api/meta/observe"
      - "GET  /api/meta/gaps"
      - "GET  /api/meta/bda"
      - "POST /api/meta/classify"
      - "GET  /api/engines"
      - "POST /api/event"
      - "POST /api/table/insert"
      - "GET  /api/self-heal/status"

  handshake:
    components:
      - id: "cortex.gaps.list"
        grammar: ["cortex gaps list", "gaps", "gaps list", "gl"]
        route: { method: GET, path: "/api/cortex/gaps" }
        description: "List open gaps with severity and friction"
        tags: [memory, healing, monitoring]

      - id: "cortex.gaps.resolve"
        grammar: ["cortex gaps resolve", "resolve gap", "gr"]
        route: { method: POST, path: "/api/cortex/gaps/resolve" }
        description: "Resolve an open gap"
        params: [{ name: uuid, type: string, required: true }]

      - id: "cortex.memory.write"
        grammar: ["cortex memory write", "mem write", "mw"]
        route: { method: POST, path: "/api/cortex/memory/write" }
        description: "Write to working memory"
        params: [{ name: key, type: string }, { name: value, type: string }]

      - id: "cortex.memory.list"
        grammar: ["cortex memory list", "mem list", "ml"]
        route: { method: GET, path: "/api/cortex/memory/working" }
        description: "Read working memory"

      - id: "cortex.search"
        grammar: ["cortex search", "search", "s"]
        route: { method: GET, path: "/api/cortex/search" }
        description: "Semantic search across memory"
        params: [{ name: q, type: string, required: true, cli: "--q" },
                 { name: threshold, type: number, default: 0.72 }]

      - id: "cortex.heal.trigger"
        grammar: ["cortex heal", "heal"]
        route: { method: POST, path: "/api/cortex/heal/trigger" }
        description: "Trigger self-heal escalation for a gap"
        params: [{ name: gapUuid, type: string, required: true }]

      - id: "cortex.friction.list"
        grammar: ["cortex friction", "friction", "fr"]
        route: { method: GET, path: "/api/cortex/friction" }
        description: "Fault class friction scores"

      - id: "cortex.failures.list"
        grammar: ["cortex failures", "failures", "fm"]
        route: { method: GET, path: "/api/cortex/failure-modes" }
        description: "Active failure modes requiring human action"

      - id: "cortex.raid.route"
        grammar: ["cortex raid route", "raid route", "rr"]
        route: { method: GET, path: "/api/cortex/raid/decide" }
        description: "Ask RAID which provider it would choose for an intent"
        params: [{ name: intent, type: string, required: true, cli: "--intent" }]

      - id: "cortex.engines.run"
        grammar: ["cortex engines", "engines", "diag"]
        route: { method: GET, path: "/api/cortex/engines" }
        description: "Run all 12 diagnostic engines"

  modules:
    - id: jaa-db
      version: "6.0.0"
      description: "Persistent storage. All tables. Disk-first."

    - id: vector-memory
      version: "1.0.0"
      description: "SNR-gated semantic search. nomic-embed-text via Ollama."

    - id: chat-logger
      version: "1.0.0"
      description: "AI exchange logging + context reinjection."

    - id: component-registry
      version: "1.0.0"
      description: "Self-describing kernel. All components registered here."

    - id: ui-registry
      version: "1.0.0"
      description: "UI session tracking. Heartbeat. SSE routing."

    - id: escalation
      version: "1.0.0"
      description: "5-level friction ladder with failure mode ledger."

    - id: meta/topo-kernel
      version: "1.0.0"
      description: "8-gate SNR pipeline."

    - id: meta/telemetry-codec
      version: "1.0.0"
      description: "Slope, stability, oscillation, drift engines."

    - id: meta/liminal
      version: "1.0.0"
      description: "12 gap detectors."

    - id: meta/alk-perception
      version: "1.0.0"
      description: "Composite behavioral state classifier."

    - id: meta/spatial
      version: "1.0.0"
      description: "Sigma engine + resonance lattice."

    - id: meta/bda
      version: "1.0.0"
      description: "Behavioral Drift Analyzer. 5-signal extraction."

    - id: diagnostic-engines
      version: "1.0.0"
      description: "12 cross-domain diagnostic methods."

  ui:
    type: "panel in nexus-shell"
    hotswap: true
    panels:
      - "GAPS — open gap list with severity, friction, heal button"
      - "MEMORY — working memory read/write/forget"
      - "RAID — routing decisions, provider health"
      - "HEAL — escalation state, friction table, failure modes"
      - "SEARCH — semantic memory search with SNR scores"
      - "ENGINES — 12 diagnostic engine results"

  tests:
    required_before_handshake:
      - "All 6 organs boot without error"
      - "JAA tables load or create cleanly"
      - "Vector memory init (SOFT — pass even if Ollama offline)"
      - "Component registry loads existing components from JAA"
      - "Health endpoint returns ok:true"
      - "Contract endpoint returns valid contract shape"

  # ── ADDENDUM 2026-07-20 (v3.3.0) — organ completion, spec catching up to code ──
  addendum_2026_07_20:
    summary: >
      All six organs now exist as real, bus-wired SISO gates, built bottom-up
      across Phases 0-6 (see docs_out/cortex-phase-map.md for the full audit
      trail including every bug found and fixed along the way).
    organs_built:
      - "self-heal/escalation — friction ledger. Subscribes anomaly.detected, HEAL_REQUESTED, nexus.resource.pressure. Emits escalation.friction.increased (exact name liminal-space listens for, payload field newFric) + escalation.failure_mode."
      - "self-heal — 5-level ladder. Level from fault_taxonomy count. L0 forge_patches/fix_map replay, L1 the 8 safe patterns, L2 propose-only (never auto-applies), L3 12-engine deep scan, L4 failure_modes + human action item. SEMANTIC_GAP_TYPES excluded (§7.2)."
      - "gap-finder — anomaly.detected (high/critical) + sigma.event.halt_risk → deduped cortex.gap.found ({gap: row} shape)."
      - "orion — pure classifier (§14.2): anomaly/sigma → cortex.orion.classified, shaped to RAID _decide()'s real contract."
      - "raid — bus-wired: cortex.orion.classified → same _decide() → cortex.raid.decided. KNOWN GAP (§10.3): boot.js's /api/raid/decide route still calls its own lighter _raidDecide, not this engine — two truth layers, tracked, not fixed."
    event_name_corrections: >
      Spec previously said cortex.escalation.friction_increased; deployed
      listener contract is escalation.friction.increased with payload field
      newFric. Code conformed to the deployed contract; spec now records it.
    foundation_fixes: >
      Three sibling bugs fixed at the source in guardian/jaa-store.js _matches():
      predicate-function where clauses silently matched ALL rows; string where
      clauses silently matched NONE. Plus jaa-db.js bare-number limit fix and
      the JaaDB class (JSONL journal, tier decay, queryWeighted) built against
      its pre-existing 52-test pinned contract. tc.drift.signal renamed +
      payload-remapped in liminal-space. _checkCrystallisation §14.4 loop guard.
      intelligence _patternScanCursor accumulation + monotonic crystallised
      latch (root cause of the infinite re-announce spam).
    pressure_reflex: >
      nexus.resource.pressure (resource-monitor, transitions only) now relayed
      orchestrator→cortex /api/event and consumed by escalation as the
      memory_pressure fault class: pressure→L1 (+0.20), critical→L3 (+0.50),
      ok→recordSuccess decay. Built from the 2026-07-20 live 0xC0000409
      double-crash log, where the event fired with zero consumers.

  # §ADDED 2026-09-03 — James: "update the living models." cortex.spec
  # had none of the real LM1/AX-013 fields despite being one of the two
  # most heavily touched systems this session (the other being
  # guardian, see its own matching new section). History starts from
  # what's genuinely verifiable this session (§1.1 — an honest, shorter
  # log beats a fabricated comprehensive one).
  history:
    - date: 2026-09-02
      summary: >
        The officiator — cortex/core/raid/officiator.js. Real, agent-
        synthesized contracts from staged artifacts (the_officiator hat,
        a real B1 schema — endState/conditions/warpPrimitives/axioms/
        compartmentUuid/fileDirectory/fileName), polling lib/intake.js's
        staged-artifact directory every 20s (the same proven pattern as
        cortex/core/raid/worker.js). synthesizeFromContext() added for
        direct, tool-triggered synthesis with a real submit:true/false
        separation between previewing and committing a real contract.
        Persisted dedup via a new lib/intake.js markOfficiated() — the
        module's own first version had only an in-memory Set, honestly
        documented as not surviving a restart; closed one commit later,
        verified by actually deleting the module from require.cache and
        re-requiring it fresh, not just resetting a variable by hand.
    - date: 2026-09-02
      summary: >
        lib/vector-memory.js's entire real embedding pipeline was dead
        code since it was built — onJaaInsert() was never called
        anywhere in this codebase, confirmed by grep before fixing
        anything. Wired into cortex/memory/jaa-db.js's one real insert()
        choke point (fire-and-forget, same non-blocking discipline as
        its sibling _observeWrite). Found and fixed a real, latent bug
        while live-testing this same fix: lib/local-vector-index.js's
        fallback index only did strict equality filtering, but vector-
        memory.js's own real assembleContext() already built $in/$eq
        operator filters — silently matching nothing on the fallback the
        whole time. New embedComponentRegistries() — a real, one-time
        scan across all 14 systems' own registry-components.js files.
    - date: 2026-09-02
      summary: >
        AM1's intent-contract gate made mandatory, not opt-in (see
        guardian.spec's own matching entry — the fix landed in this
        system's own cortex/core/raid/contract-intake.js).
    - date: 2026-09-03
      summary: >
        Merged a real parallel session's work: officiator's own two real
        sources registered in a new cortex/core/raid/contract-boundary.js
        (they were missing, so every officiator-synthesized contract
        logged "no registered boundary" on submission — not a hard
        failure, but a real, easy-to-close gap). New cortex/core/raid/
        context-gate.js + context-synthesis.js — the first real,
        honestly-scoped slice of primitive/invariant boundary checking
        (only primitive_match is actually evaluated today; invariants/
        principles carried as real unevaluated data, checked against
        warp/core/Axiom.js directly first rather than faking a call to
        it on data it was never shaped for).
    - date: 2026-09-05
      summary: "docs: update the living models — real history entries, plus a real pre-existing YAML bug found and fixed in 4 specs (1 real file touched)"
    - date: 2026-09-05
      summary: "chore: register the two orphans the new post-commit hook itself flagged (1 real file touched)"
    - sha: f66c6f434bd997c38ccef6de34109805a2767ee8
      date: 2026-09-05
      summary: "fix: real, tested merge safety for parallel-session history writes — found a genuine, silent data-loss risk before it could bite (1 real file touched)"

  gaps:
    as_of: 2026-09-03
    entries:
      - id: C1
        type: coverage
        summary: >
          This spec itself had zero real history/gaps/version_history
          fields until this pass — the exact class of staleness AX-013/
          LM1 exists to prevent, found only because "update the living
          models" was asked directly.
        opened: 2026-09-03
        status: CLOSED
        closed: 2026-09-03
        resolution: "This same pass — closed by writing the schema this gap describes as missing."
      - id: C2
        type: coverage
        summary: >
          This spec's own known KNOWN GAP (§10.3, above): boot.js's
          /api/raid/decide route still calls its own lighter _raidDecide,
          not the real RAID engine — two truth layers, still not
          reconciled as of this pass. Pre-existing, not touched here.
        opened: unknown
      - id: C3
        type: coverage
        summary: >
          context-gate.js's primitive/invariant boundary checking only
          evaluates primitive_match today — every real boundary row in
          contract-boundary.js's REGISTRY has invariants: [], so there is
          genuinely nothing to run yet regardless. Real follow-up once
          real invariants exist for at least one system.
        opened: 2026-09-03

  version_history:
    - version: 3.5.0
      date: 2026-09-03
      summary: "Retroactive first entry — living-model schema added for the first time, matching lib/version.js's own real, currently-tracked cortex version (checked, not assumed). No schema-only bump implied; this records the schema addition against the real version already in effect."
      versioniumCommitId: null
