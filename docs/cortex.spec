spec:
  meta:
    name:        cortex
    version:     3.2.0
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

  # ══════════════════════════════════════════════════════════════════════════
  # ADDENDUM M1 — decay is MEASURED, not ticked          (2026-08-10, v0.36.1)
  # ══════════════════════════════════════════════════════════════════════════
  addendum_M1_relevance_decay:
    status: BUILT (instrument) / OPEN (enforcement)

    premise_this_spec_had_wrong: >
      MEMORY_TIERS has declared working/short/long since v3.2.0, and
      cortex/memory/decay.js implements it correctly — halflife, evictAfterMs,
      tombstone-not-delete (§7.4). What neither states is that the whole model
      rests on a BACKGROUND TICKER, and a ticker is a liveness dependency.

    measured_2026_08_10:
      - "decay_log holds 32 cycles, ALL dated 2026-07-16, ALL { evicted: {}, totalEvicted: 0 }. The ticker has not run in 24 days."
      - "boot.js:1261 starts it inside a try/catch that only console.warn()s. A start failure boots clean and memory silently stops ageing."
      - "event_log: 11,393 rows, oldest 713h. Tier `short`, evictAfterMs 24h. 100% of the table is past its deadline."
      - "gaps: 99 rows, tier `short`. Enforced, that deletes the open-gap list DAILY."
      - "9 of 16 tier-managed tables are empty, including working_memory — the tier built for 'this session, right now' has never held anything."
      - "memory_unified — the corpus push-recall actually searches, 163 rows — is NOT in TABLE_TIERS. tierFor() returns null. The memory that gets USED is governed by nothing."

    M1a_read_time_expiry:   # BUILT
      premise: >
        James: "every memory is supposed to be stored with a timestamp, by date
        and exact time, so that the case still works without the ticker."
        Verified: ts coverage is 100% on every populated tier-managed table.
        Only settings and components lack one, and both are never-decay infra.
      built: >
        cortex/memory/decay.js gains isExpired / liveRows / expiryReport. Pure,
        no clock of its own, no state. A row with NO timestamp is UNDATABLE and
        never expires — deleting on a guessed age is worse than keeping it.
      not_enforced: >
        Against the live store the predicate hides 11,492 rows — 100% of the
        short tier including all 99 gaps. That is not memory ageing correctly,
        it is the TIER MAPPING being wrong and never once exercised. Enforcing
        it converts a finding into an outage (§17.10). RX-8 fails if anyone
        wires it into jaa-db before the mapping is corrected.

    M1b_relevance_over_age:   # BUILT (instrument)
      premise: >
        James: "could use sigmas or deltas to measure the distance as a more
        quantifiable and measurable method for decay." Right. RELEVANCE IS NOT
        AGE — a 30-day-old event that is the ROOT of a live causal chain matters
        more than a one-hour-old heartbeat with no edges. Clock decay evicts the
        root and keeps the noise.
      built: >
        cortex/memory/relevance.js — four measured terms: causal (descendants,
        chain-root), sigma (anomaly), recurrence (crystallised pattern), rarity
        (reconstructability). Age is a TIEBREAKER at 0.10 weight, never the
        criterion. score() reports its terms and its reasons; pressure() ranks
        what a capacity-bounded eviction would drop and compares that against
        what clock decay would drop. It cannot evict — RV-8 pins that.
      the_shape_already_existed: >
        meta/rfr2/kernel evicts by CAPACITY, not clock, and prunes edges on
        eviction (H-1) so the graph stays bounded and coherent. What it does not
        do is choose WHICH event leaves — it takes the oldest. This gives that
        choice a measurement.

    M1c_BLOCKER_causedby_is_not_causal:   # OPEN — gates M1b entirely
      finding: >
        event_log holds 11,393 events. 753 carry `causedBy`, and those point at
        exactly THREE distinct values: "liminal" (564), "guardian" (188),
        "intelligence" (1). SYSTEM NAMES, not event ids. Not one resolves.
      consequence: >
        meta/cfr/graph.js turns each into a `causal` edge and
        meta/cfr/kernel-surface.js asserts each as EDGE_CAUSAL_EXPLICIT. 753
        declared causal edges refer to something that is not an event. The field
        is holding provenance-of-source where the graph reads causation.
      why_it_gates_everything: >
        relevance.js measures 0 resolvable edges. With the causal term — 40% of
        the weight — dead, nothing scores above 0.28 and clock decay and measured
        relevance "agree", TRIVIALLY, because relevance has nothing to measure.
        The mechanism is right and cannot work until the measurement is real.
        relevance.js counts these as unresolvableRefs and refuses to score them
        as descendants: centrality on system-name edges would make a chatty
        system's heartbeats look like causal hubs, and those are exactly what a
        relevance-based decay would then protect.
      does: "Find every writer putting a source name in causedBy. Either it writes a real event id, or the provenance moves to a `source` field and causedBy is left for causation."
      gate: "pressure('event_log').causal.resolvableEdges > 0, and its warning field absent."

    M1d_tier_mapping:   # OPEN
      does: >
        gaps must not be short/24h — an OPEN gap should never expire; a resolved
        one may. event_log is the causal record: either long, or compacted the
        way sigma_rollups already is (that table is `long` precisely because it
        is 'compressed, not destroyed'). memory_unified must be in TABLE_TIERS
        or explicitly declared exempt.
      gate: "expiryReport() shows a live count that is not zero for every short-tier table, and read-time expiry can then be switched on with its cost known in advance."
