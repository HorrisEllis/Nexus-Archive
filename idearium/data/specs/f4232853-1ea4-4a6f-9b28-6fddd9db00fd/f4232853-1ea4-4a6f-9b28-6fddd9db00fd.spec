spec:
  name: causal-nexus-e2e
  uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
  version: 0.1.0
  type: system
  phase: 40
  status: complete
  agent: ollama
  completed_at: 2026-07-15T06:55:14.782Z

# preamble

<!-- imported block: preamble -->

spec:

  # ════════════════════════════════════════════════════════════════
  

---

# meta

<!-- imported block: meta -->

# BLOCK 1 — META
  # ════════════════════════════════════════════════════════════════
  meta:
    name:           causal-nexus
    version:        6.0.0
    author:         james-brooks
    created_at:     2025-01-01T00:00:00Z
    last_modified:  2026-05-24T04:00:00Z
    status:         complete
    uuid:           spec-causal-nexus-eecaa718c6a644330b0211ecbefd4740
    checksum:       7f3a1c9b4e2d0f8a6c5e3b1d9f7a2c0e4b8d6f1a3c7e5b2d0f4a8c6e3b9d1f
    target_os:      [linux, mac, windows, container]
    execution_mode: hybrid
    paradigm:       [modular, event-driven, reactive]
    language_stack: [javascript, typescript]
    runtime_deps:
      - name:     node
        version:  ">=18.0.0"
        required: true
        purpose:  ES module runtime. EventEmitter, crypto.
      - name:     guardian-extension
        version:  "5.0.0"
        required: false
        purpose:  Browser-side bridge. Injects causal events from DOM, AI tabs, callto elements.
    constraints:
      - id: CONS-001
        description: >
          No circular imports across module layers. Foundation modules (identity, time) have
          zero imports and must remain so. DAG must be acyclic at the layer level.
        type: hard
        source: Architecture DAG — stated in barrel export and README.
        enforced_by: [GATE-001]
      - id: CONS-002
        description: >
          Gates return GateOutput[] — they never call kernel.ingest() directly (A-2).
          Gate output is collected atomically and ingested after gate phase completes.
        type: hard
        source: Law A-2.
        enforced_by: [GATE-002]
      - id: CONS-003
        description: >
          macro:detected events are never kernel events — projection-only (C-2).
          No component may emit macro:detected via kernel.ingest().
        type: hard
        source: Law C-2.
        enforced_by: [GATE-003]
      - id: CONS-004
        description: >
          Version Gate Axiom (VM-1): all .nex artifacts must be validated by version-gate
          before parsing, migration, or hydration. No component bypasses this gate.
        type: hard
        source: version-gate module — VM-1.
        enforced_by: [GATE-007]
      - id: CONS-005
        description: >
          Ledger Separation (L-2): UpgradeLedger and IdeaLedger must never be mixed.
          Idea entries have zero enforcement surface — cannot affect runtime state (L-3).
        type: hard
        source: ledger module — invariants L-1..L-4.
        enforced_by: [GATE-008]
    supersedes:     ""
    notes: >
      v6.0.0 adds: ledger (dual upgrade/idea), enforcement (29 invariants BoundaryIndex),
      observer, sigma, clip, adapter-sandbox, context (CI-1..CI-6), version-gate (VM-1..VM-6).
      Total 21 modules. Guardian extension (v5.0.0) is an optional external bridge.
      nexus-topo (SISO/SNR) is a related standalone signal-filtering package — not a dependency.

  # ════════════════════════════════════════════════════════════════
  

---

# intent — stakeholders

<!-- imported: intent → stakeholders -->

# BLOCK 2 — INTENT
  # ════════════════════════════════════════════════════════════════
  intent:
    purpose: >
      causal-nexus is a real-time causal event engine for Node.js and browser environments.
      It provides a bounded ring buffer with a built-in gate system, explicit causal graph,
      delta analytics, CQL query, persistence (WAL + archive), and AI-powered self-modification
      (forge). Every event carries a declared causal edge type — causality is declared at
      ingestion, never inferred post-hoc. The engine is designed to be embedded in any project
      as a dependency with zero runtime dependencies of its own.

    problem_statement: >
      Most event systems lose causal context: they emit events but cannot answer "what caused
      this?" or "what will break if this changes?". Replay is undirected. Snapshots are opaque
      blobs. Memory is unbounded. Gate logic is scattered and untestable. causal-nexus solves
      all of these by making causality first-class, bounding memory via ring eviction, and
      making gate logic declarative, composable, and AI-writable.

    stakeholders:
      - name: library-consumer
        role: >
          Imports causal-nexus as a dependency. Uses kernel, adapter, query, persist, forge.
          Expects zero runtime deps, ES module API, Node >= 18.
      - name: guardian-operator
        role: >
          Runs Guardian browser extension (v5.0.0). Injects DOM, AI-tab, and callto events
          into a host application via the bridge bus. Expects reliable calltoMap linkage and
          session boundary detection.
      - name: ai-agent
        role: >
          Uses forge module to autonomously modify causal-nexus modules.
          Expects stable law registry and atomic loader output.
      - name: spec-pipeline
        role: >
          Reads and patches this spec via masteravos-pipeline. Expects machine-parseable
          schema, causal_map, and enforcement block with BoundaryIndex coverage.


---

# intent — non_goals

<!-- imported: intent → non_goals -->


    non_goals:
      - causal-nexus is not a message broker. It does not route events between services.
      - causal-nexus is not a database. Persistence is a WAL + archive, not ACID.
      - causal-nexus is not an AI model. forge dispatches to Anthropic API — it does not train.
      - causal-nexus does not replace version control. Blueprints supplement git, not replace it.
      - causal-nexus does not manage UI state. The ring is the source of truth, not a component store.
      - causal-nexus does not enforce application-level business logic. Gates are structural only.
      - nexus-topo (SISO/SNR) is a separate package. causal-nexus has no dependency on it.


---

# intent — invariants

<!-- imported: intent → invariants -->


    invariants:
      - id: INV-I1
        statement: >
          event.id is UUID v4 — never deterministic, never reused.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: enforcement.BoundaryIndex monitors every ingested event. Throws InvariantViolationError.
        consequence: Dedup, causal graph, and snapshot replay all break. Events become indistinguishable.

      - id: INV-I2
        statement: >
          contentHash is orthogonal to eventId — identical payloads produce the same hash
          but always different ids. contentHash must never be used as a dedup key for id assignment.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: enforcement.BoundaryIndex. Throws InvariantViolationError.
        consequence: Identical payloads become indistinguishable. Dedup incorrectly suppresses real events.

      - id: INV-C1
        statement: >
          Every causal edge has an explicitly declared edgeType at ingestion time.
          edgeType is never inferred post-hoc from event shape.
        criticality: fatal
        enforced_by: [GATE-003]
        detection: enforcement.BoundaryIndex checks edgeType on every edge creation.
        consequence: Causal traversal (traceToRoot, descendants) becomes unreliable.

      - id: INV-C2
        statement: >
          macro:detected is never a kernel event — projection-only. No component may call
          kernel.ingest('macro:detected', ...).
        criticality: fatal
        enforced_by: [GATE-003]
        detection: BoundaryIndex monitors ingest calls. Throws immediately on C-2 violation.
        consequence: Macro projection corrupts event ring with synthetic events.

      - id: INV-C3
        statement: >
          traceToRoot traverses only causal/* edges. Observational edges are never traversed
          in causal path queries.
        criticality: fatal
        enforced_by: [GATE-003]
        detection: causality.isCausalEdge() guards every traversal step.
        consequence: Causal chains include spurious observational hops. Root cause analysis breaks.

      - id: INV-C4
        statement: Gates execute before listeners. Listener callbacks never fire before gate phase completes.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: Kernel pipeline order is fixed. BoundaryIndex validates pipeline order on every ingest.
        consequence: Listeners observe events before gate-generated consequences exist. Race conditions.

      - id: INV-A2
        statement: >
          Gates return GateOutput[] — they never call kernel.ingest() directly.
          Gate output is collected atomically and ingested after the gate phase.
        criticality: fatal
        enforced_by: [GATE-002]
        detection: Kernel wraps gate execution. GATE_DEPTH_MAX=20 guards recursive gate chains.
        consequence: Recursive ingest inside gate phase causes infinite loops or ordering violations.

      - id: INV-VM1
        statement: >
          All .nex artifacts (SNAP, BP, CLIP) must pass version-gate validation before
          parsing, migration, or runtime hydration.
        criticality: fatal
        enforced_by: [GATE-007]
        detection: version-gate.validate() throws GateValidationError on mismatch.
        consequence: Stale or corrupt artifacts hydrate silently. Ring state is corrupted.

      - id: INV-L2
        statement: >
          UpgradeLedger and IdeaLedger are structurally separate. Mixing is a hard throw.
        criticality: fatal
        enforced_by: [GATE-008]
        detection: LedgerError thrown on any mixing attempt. validateSeparation() enforces.
        consequence: Speculative ideas contaminate the authoritative truth ledger.

      - id: INV-L4
        statement: >
          An idea becomes an upgrade only through explicit validation via promoteIdea().
          No bypass path exists.
        criticality: fatal
        enforced_by: [GATE-008]
        detection: promoteIdea() validates entry type. Throws LedgerError on invalid type.
        consequence: Unvalidated ideas enter the authoritative record. Truth ledger is contaminated.

      - id: INV-H1
        statement: >
          The causal edge graph is bounded. pruneEdgesFor() is called on every ring eviction.
        criticality: high
        enforced_by: [GATE-004]
        detection: BoundaryIndex monitors edge count vs ring capacity.
        consequence: Memory grows unbounded. Process OOM on long-running sessions.

      - id: INV-H6
        statement: >
          seenMap (dedup LRU) is bounded at MAX_SEEN_MAP=10,000 entries under replay flood.
        criticality: high
        enforced_by: [GATE-004]
        detection: BoundaryIndex monitors seenMap.size on every replay.
        consequence: Replay flood causes unbounded seenMap growth and eventual OOM.


---

# intent — tradeoffs

<!-- imported: intent → tradeoffs -->


    tradeoffs:
      - id: TRDE-001
        accepted: >
          Ring eviction loses event history. Events older than ringCap are gone from the ring.
        rationale: >
          Unbounded ring growth causes OOM on long-running processes. WAL + archive handles
          durability at the cost of query latency for cold data.
        revisit_condition: >
          Revisit when cold archive query latency exceeds 500ms for date-range queries,
          or when ring capacity requirements exceed 10M events.
        accepted_at: 2025-06-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-002
        accepted: >
          query accesses kernel._typeIndex directly for the O(1) fast path.
          Deliberate tight coupling to a _ prefixed internal field.
        rationale: >
          The typeIndex fast path reduces query latency from O(n) to O(1) for type-equality
          root conditions. Without this, every type query is a full ring scan.
        revisit_condition: >
          Revisit when a public query API stable enough to replace _typeIndex is added,
          or when _typeIndex shape changes break the query module.
        accepted_at: 2025-08-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-003
        accepted: >
          persist uses dynamic import of compress at flush/recover time to avoid a circular
          dependency (compress imports kernel; persist importing compress at load time cycles).
        rationale: >
          Dynamic import localizes the coupling to the call site and is cheaper than
          restructuring the module graph.
        revisit_condition: >
          Revisit when compress is decoupled from kernel (kernel passed as argument),
          making the circular dependency moot.
        accepted_at: 2025-09-01T00:00:00Z
        accepted_by: james-brooks

      - id: TRDE-004
        accepted: >
          forge requires Anthropic API access. No local-first fallback for AI self-modification.
        rationale: >
          Local model inference for module-level code rewriting at required quality is not
          available without significant infrastructure. forge is operator-invoked, not hot-path.
        revisit_condition: >
          Revisit when local code-generation models reach quality parity with claude-sonnet-4
          for module-level JS rewriting tasks.
        accepted_at: 2025-10-01T00:00:00Z
        accepted_by: james-brooks


---

# intent — success_conditions

<!-- imported: intent → success_conditions -->


    success_conditions:
      - Ring buffer O(1) ingest sustained at 100k events/s on Node 18 with ringCap=5_000_000.
      - traceToRoot returns correct root for chains of depth >= 50 without traversing observational edges.
      - Gate system fires before all listeners on every ingest (C-4 verified by cross-domain test suite).
      - 195 tests pass (node test/runner.js). Cross-domain invariant suite green on every release.
      - forge produces valid, loadable ES module patches for >= 80% of well-formed patch descriptions.
      - persist.recoverStore() replays WAL with zero data loss for clean shutdowns.
      - version-gate rejects major-version mismatched .nex artifacts with GateValidationError.
      - BoundaryIndex reports 29/29 invariants passing on a fresh kernel with no violations.


---

# intent — failure_conditions

<!-- imported: intent → failure_conditions -->


    failure_conditions:
      - InvariantViolationError thrown during normal operation (any invariant group).
      - Ring eviction does not call pruneEdgesFor — edge graph grows unbounded (H-1 violated).
      - query module accesses stale typeIndex after kernel.reset() without defensive copy (H-3 violated).
      - forge produces syntactically invalid ES module output that fails loader evaluation.
      - recoverStore() returns ok:false with errors for a WAL produced by a clean shutdown.
      - version-gate allows a major-version mismatched artifact to hydrate silently (VM-1 violated).
      - promoteIdea() succeeds without a valid entry type — unvalidated idea enters UpgradeLedger.


---

# intent — risk_assumptions

<!-- imported: intent → risk_assumptions -->


    risk_assumptions:
      - id: RISK-001
        assumption: Anthropic API remains available and stable for forge operations.
        confidence: high
        if_wrong: >
          forge becomes unavailable. AI self-modification halts. Manual patching required.
          No runtime impact — forge is not in the hot path.
        validation_method: >
          forge wraps all API calls in try/catch. On failure, returns { ok: false, error }.

      - id: RISK-002
        assumption: ringCap=5_000_000 is sufficient for production use without excessive eviction.
        confidence: medium
        if_wrong: >
          High eviction rates cause H-1 pressure. Cold archive queries increase in frequency.
        validation_method: >
          Monitor system:ring:evicted event rate. Alert if > 1% of ingest rate.

      - id: RISK-003
        assumption: Guardian extension (v5.0.0) bridge protocol is stable across Firefox updates.
        confidence: medium
        if_wrong: Bridge bus events stop arriving. Session boundary detection fails.
        validation_method: >
          Guardian handshake.js tests connection on every popup open. Adapter logs warning
          if no events received within 30s of session start.

  # ════════════════════════════════════════════════════════════════
  

---

# architecture — communication

<!-- imported: architecture → communication -->

# BLOCK 3 — ARCHITECTURE
  # ════════════════════════════════════════════════════════════════
  architecture:
    type: modular
    description: >
      causal-nexus is organized as a strict DAG of 21 modules across 5 layers.
      No circular imports permitted. Lower layers (foundation, causality) have zero imports.
      All inter-module communication is via the kernel ring buffer and gate system.
      Guardian (external browser extension) communicates via the adapter bridge bus.
      One deliberate exception: persist uses dynamic import of compress at flush time (TRDE-003).

    communication:
      mechanisms:
        - kernel_ring_buffer
        - gate_system
        - adapter_bridge_bus
        - observer_bus
        - cql_query
        - anthropic_api
      primary: kernel_ring_buffer
      fallback: observer_bus
      prohibited:
        - mechanism: direct_import_across_layers
          reason: Cross-layer direct imports violate the DAG. CONS-001.
        - mechanism: ingest_inside_gate
          reason: Gates must not call kernel.ingest() directly (A-2, CONS-002).


---

# architecture — structure

<!-- imported: architecture → structure -->


    structure:
      layers:
        - id: foundation
          order: 1
          purpose: UUID, hashing, dedup, clocks. Zero external imports.
          modules: [identity, time]
          may_import_from: []
          may_not_import_from: [causality, kernel-layer, analytics, ai]

        - id: causality
          order: 2
          purpose: Edge taxonomy, causal graph, CalltoMap, projection views.
          modules: [causality, projection, lazy]
          may_import_from: [foundation]
          may_not_import_from: [kernel-layer, analytics, ai]

        - id: kernel-layer
          order: 3
          purpose: Ring buffer, gate system, macro projection, adapter, enforcement.
          modules: [kernel, adapter, adapter-sandbox, observer, enforcement]
          may_import_from: [foundation, causality]
          may_not_import_from: [analytics, ai]

        - id: analytics
          order: 4
          purpose: Delta, CQL query, compress/snapshot, persist/WAL, version-gate, context, clip, sigma.
          modules: [delta, query, compress, persist, version-gate, context, clip, sigma]
          may_import_from: [foundation, causality, kernel-layer]
          may_not_import_from: [ai]

        - id: ai
          order: 5
          purpose: AI self-modification (forge), hot module loading (loader), dual ledger.
          modules: [forge, loader, ledger]
          may_import_from: [foundation, causality, kernel-layer, analytics]
          may_not_import_from: []

      entry_points:
        - id: kernel-ingest
          type: event
          description: kernel.ingest(type, payload, meta) — primary event ingestion.
        - id: adapter-handle
          type: event
          description: adapter.handle(bridgeType, payload) — bridge bus translation from Guardian.
        - id: cql-query
          type: api
          description: query(cqlString, kernel) — one-shot CQL execution against the ring.
        - id: forge-api
          type: api
          description: forgeModule/forgePatch/forgeGate/forgeHook — AI self-modification.

      exit_points:
        - id: subscriber-callbacks
          type: event
          description: kernel.subscribe(fn) callbacks. Fire after gate phase (C-4).
        - id: gate-outputs
          type: event
          description: GateOutput[] ingested atomically after gate phase.
        - id: persist-wal
          type: file
          description: "WAL file. Backend: memory | indexeddb | filesystem | auto."
        - id: snapshot-artifact
          type: file
          description: .nex artifact (SNAP/BP/CLIP). Validated by version-gate on restore.
        - id: forge-patch
          type: api
          description: Patch source string returned by forge. Loaded via loader.loadModule().
        - id: ledger-events
          type: event
          description: idea:recorded, idea:promoted, upgrade:committed, bottleneck.


---

# architecture — data_flow

<!-- imported: architecture → data_flow -->


    data_flow:
      direction: unidirectional
      model: push
      primary_store: kernel_ring_buffer


---

# architecture — control_flow

<!-- imported: architecture → control_flow -->


    control_flow:
      model: reactive
      orchestration: decentralized
      tick_driven: false
      tick_rate_note: >
        Event-driven only. No global timer. WAL flush triggered by event count.
        callto TTL expiry if calltoTtlTicks enabled.

    topology_notes: >
      GATE_DEPTH_MAX=20 prevents infinite gate chains. Dynamic import of compress inside
      persist avoids the circular dependency — the only dynamic import in the module graph.
      query._typeIndex coupling is the only _ access crossing a module boundary; documented
      and must be audited if kernel's internal typeIndex shape changes.

  # ════════════════════════════════════════════════════════════════
  

---

# modules — identity

<!-- imported: modules → identity -->

# BLOCK 4 — MODULES
  # ════════════════════════════════════════════════════════════════
  modules:

    identity:
      id:           identity
      uuid:         fabbc95c-0000-4000-0000-000000000001
      layer:        foundation
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/identity/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        UUID v4 generation, FNV-1a content hashing, and dedup key construction.
        Zero imports. Every other module that needs identity primitives imports from here.
      inputs:
        - id: IN-identity-001
          name: payload
          type: object
          required: true
          source: kernel
          description: Raw event payload passed to contentHash().
      outputs:
        - id: OUT-identity-001
          name: eventId
          type: string
          destination: kernel
          description: UUID v4 event identifier. Never deterministic. (I-1)
        - id: OUT-identity-002
          name: contentHash
          type: string
          destination: kernel
          description: FNV-1a hash of payload. Same payload = same hash, different id. (I-2)
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-identity-001
          scenario: crypto.randomUUID() not available (Node < 14.17 or restricted env).
          impact: fatal
          probability: rare
          detection: TypeError thrown on first kernel.ingest().
          mitigation: Runtime check at module load. Emit clear error with Node version.
          recovery: Upgrade to Node >= 18. No in-process recovery.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "1M ids/s"
        memory_budget_mb: 1
        notes: UUID v4 is the hot path. Must be < 1µs per call.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Deterministic UUID injection via mocked crypto.
            risk: I-1 violation. Dedup breaks.
            mitigated_by: enforcement.BoundaryIndex monitors I-1 on every event.
      behavioral_contract:
        summary: Produces cryptographically random unique event IDs and deterministic content hashes.
        success: newEventId() returns different UUID v4 on every call. contentHash() same for same payload.
        failure: Duplicate IDs produced, or contentHash() varies for identical payloads.
        sla_ms: 1
        invariant_refs: [INV-I1, INV-I2]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — time

<!-- imported: modules → time -->


    time:
      id:           time
      uuid:         ce9aac88-0000-4000-0000-000000000002
      layer:        foundation
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/time/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Kernel-instance-local logical clock and wall clock. No global state (T-1).
        Logical tick (eventTs) drives ordering. Wall ts is display-only (T-2).
      inputs: []
      outputs:
        - id: OUT-time-001
          name: eventTs
          type: number
          destination: kernel
          description: Monotone logical tick. Ordering axis.
        - id: OUT-time-002
          name: ts
          type: number
          destination: kernel
          description: Wall clock timestamp (Date.now()). Display only.
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-time-001
          scenario: Clock instance shared across kernel instances (global state leak).
          impact: fatal
          probability: rare
          detection: T-1 violation. Two kernels return same logical tick.
          mitigation: createClock() creates new closure per kernel instance. Never export singleton.
          recovery: Destroy affected kernel. Create fresh one.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: tick
            type: number
            persistence: memory
            description: Monotone integer. Incremented on every kernel.ingest() call.
        hot_path: in-memory closure
        truth_layer: kernel ring (event.eventTs persisted with each event)
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "1M ticks/s"
        memory_budget_mb: 1
        notes: Single integer increment per ingest.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Provides monotone logical clock per kernel instance. No global state.
        success: eventTs increments by 1 on every ingest. Two kernels have independent clocks.
        failure: eventTs goes backwards, or two kernels share a clock instance.
        sla_ms: 1
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — causality

<!-- imported: modules → causality -->


    causality:
      id:           causality
      uuid:         32a3f387-655c-4531-87a5-1b98641a8895
      layer:        causality
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/causality/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Causal edge taxonomy, causal graph store (DAG), and CalltoMap.
        H-1: pruneEdgesFor() on every ring eviction. C-1: edgeType declared at ingestion.
        C-3: only causal/* edges traversed in path queries.
      inputs:
        - id: IN-causality-001
          name: causedBy
          type: string
          required: false
          source: kernel
          description: Parent event ID. If provided, creates a causal edge.
        - id: IN-causality-002
          name: edgeType
          type: string
          required: true
          source: kernel
          description: >
            One of: causal/explicit | causal/rule | causal/adapter | observational.
            Required at ingestion. Never inferred. (C-1)
      outputs:
        - id: OUT-causality-001
          name: causal_edge
          type: object
          destination: kernel
          description: Immutable edge record { fromId, toId, edgeType, confidence, dtTicks }.
        - id: OUT-causality-002
          name: callto_resolution
          type: object
          destination: adapter
          description: Resolved calltoMap entry linking running→resolved/error. edgeType causal/adapter.
      dependencies:
        internal:
          - module_id: identity
            why: Uses dedupKey for CalltoMap keying.
            coupling: data
        external: []
      hooks_in: []
      hooks_out:
        - event: "system:diamond:rejected"
          trigger: DAG diamond parent detected.
          description: System event. No crash. Offending edge not stored.
      failure_modes:
        - id: FAIL-causality-001
          scenario: Diamond parent detected — event has two paths to same root.
          impact: recoverable
          probability: low
          detection: createCausalStore() checks on every addEdge(). Emits system event.
          mitigation: Reject duplicate edge. Emit system:diamond:rejected. Continue.
          recovery: Application must ensure unique causedBy chains.
          emits_gap: false
        - id: FAIL-causality-002
          scenario: pruneEdgesFor() not called on ring eviction. Edge graph grows unbounded.
          impact: fatal
          probability: rare
          detection: enforcement.BoundaryIndex monitors edge count vs ring size. H-1 alert.
          mitigation: kernel.ingest() calls pruneEdgesFor() on every eviction. H-1 guaranteed.
          recovery: Restart required if edge graph exceeds memory.
          emits_gap: true
          gap_type: H-1 hostile hardening violation
      state_model:
        type: stateful
        state_vars:
          - name: edges
            type: "Map<fromId, Set<toId>>"
            persistence: memory
            description: Causal graph. Pruned on eviction (H-1).
          - name: calltoMap
            type: "Map<calltoKey, runningEventId>"
            persistence: memory
            description: Pending callto lifecycle pairs awaiting resolution.
        hot_path: in-memory Map
        truth_layer: kernel ring (edges encoded in event meta fields)
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 2
        throughput_target: "500k edges/s"
        memory_budget_mb: 64
        notes: pruneEdgesFor() is O(E) where E = edges per evicted event — typically O(1).
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Forged causedBy claiming evicted event ID.
            risk: Dangling edge reference. traceToRoot returns partial chain.
            mitigated_by: Evicted event IDs pruned on eviction. traceToRoot handles tombstones gracefully.
      behavioral_contract:
        summary: Maintains bounded causal DAG. Every edge has declared type. traceToRoot uses only causal/* edges.
        success: traceToRoot(ev.id, 50) returns correct ancestor chain. calltoMap correctly links pairs.
        failure: traceToRoot traverses observational edge (C-3 violation) or edge graph grows unbounded (H-1).
        sla_ms: 2
        invariant_refs: [INV-C1, INV-C3, INV-H1]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — kernel

<!-- imported: modules → kernel -->


    kernel:
      id:           kernel
      uuid:         5d90c63d-c55f-43e8-bc2e-169b960fddd9
      layer:        kernel-layer
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/kernel/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        The single source of truth. Append-only ring buffer with bounded memory, causal graph
        integration, gate system (runs before listeners — C-4), macro projection, and typeIndex
        (O(1) type queries). All events pass through here.
      inputs:
        - id: IN-kernel-001
          name: ingest_call
          type: "{ type: string, payload: object, meta: IngestMeta }"
          required: true
          source: adapter
          description: >
            Primary ingestion. meta: { source, causedBy, edgeType, sessionId }.
            edgeType required (C-1). causedBy optional.
        - id: IN-kernel-002
          name: gate_registration
          type: "{ name: string, fn: GateFn, opts: { priority: number } }"
          required: false
          source: external
          description: Gate registration via kernel.registerGate(). Runs in priority order.
      outputs:
        - id: OUT-kernel-001
          name: frozen_event
          type: KernelEvent
          destination: subscriber-callbacks
          description: >
            Immutable: { id, type, payload, source, causedBy, edgeType, sessionId,
            eventTs, ts, contentHash }. Frozen after build.
        - id: OUT-kernel-002
          name: gate_outputs
          type: "GateOutput[]"
          destination: kernel
          description: Collected from all gates in priority order. Ingested atomically after gate phase.
        - id: OUT-kernel-003
          name: system_ring_evicted
          type: KernelEvent
          destination: persist
          description: >
            system:ring:evicted on every ring eviction. payload: { cap, evictedSeq }.
            Evicted object must be intercepted at application layer for archiveEvicted().
      dependencies:
        internal:
          - module_id: identity
            why: UUID generation, contentHash, dedupKey.
            coupling: data
          - module_id: time
            why: Logical clock (eventTs) and wall clock (ts).
            coupling: data
          - module_id: causality
            why: Edge creation, causal store, calltoMap, pruneEdgesFor on eviction.
            coupling: data
          - module_id: projection
            why: Macro projection update on every ingest.
            coupling: data
        external: []
      hooks_in:
        - event: "boot"
          handler: createKernel
          description: Instantiated by consumer. Synchronous constructor.
      hooks_out:
        - event: "system:ring:evicted"
          trigger: Ring at capacity. head wraps.
          description: Emitted with { cap, evictedSeq }. pruneEdgesFor called on same tick.
        - event: "system:diamond:rejected"
          trigger: Diamond parent detected in causal DAG.
          description: System event only. No crash.
        - event: "macro:detected"
          trigger: Macro projection detects pattern.
          description: NOT a kernel event (C-2). Projection artifact via observer bus only.
      failure_modes:
        - id: FAIL-kernel-001
          scenario: Gate throws uncaught exception during gate phase.
          impact: recoverable
          probability: low
          detection: Kernel wraps each gate call in try/catch. Failed gate logged. Others continue.
          mitigation: Isolate gate failure. Offending gate's output discarded.
          recovery: Gate failure does not crash ring. Offending gate output discarded.
          emits_gap: false
        - id: FAIL-kernel-002
          scenario: GATE_DEPTH_MAX=20 exceeded. Recursive gate chain.
          impact: fatal
          probability: rare
          detection: Depth counter in gate runner. At 20, throws with chain trace.
          mitigation: Throw immediately. Application must fix gate design.
          recovery: Fix the gate causing recursion. No in-process recovery.
          emits_gap: false
        - id: FAIL-kernel-003
          scenario: kernel.reset() called concurrently with ingest().
          impact: fatal
          probability: rare
          detection: Structural — reset() is non-concurrent. Document and test.
          mitigation: Document reset() as non-concurrent.
          recovery: Avoid concurrent reset + ingest. No in-process recovery.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: ring
            type: "RingBuffer<KernelEvent>"
            persistence: memory
            description: Circular array. Bounded at ringCap.
          - name: typeIndex
            type: "Map<type, Set<id>>"
            persistence: memory
            description: O(1) type index. Updated on ingest; deleted on eviction (H-2).
          - name: seenMap
            type: "Map<dedupKey, bool>"
            persistence: memory
            description: LRU-bounded dedup. Max 10,000 entries (H-6). Replay path only.
          - name: gates
            type: "Map<name, { fn, priority }>"
            persistence: memory
            description: Registered gates sorted by priority.
        hot_path: ring array + typeIndex Map
        truth_layer: persist WAL
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 5
        throughput_target: "100k events/s at ringCap=5_000_000"
        memory_budget_mb: 512
        notes: Ring pre-allocated. No GC pressure steady-state. Main cost is gate evaluation.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Untrusted gate registration injects malicious gate fn.
            risk: Gate observes all events. Cannot ingest directly (A-2 prevents).
            mitigated_by: adapter-sandbox provides null adapters for sandboxed environments.
      behavioral_contract:
        summary: Ingests events, runs gates before listeners, maintains bounded ring.
        success: >
          Every ingest: unique id (I-1), correct eventTs (T-2), declared edgeType (C-1).
          Gates fire before listeners (C-4). Ring stays bounded (H-1).
        failure: Duplicate id, gate fires after listener, ring grows unbounded, macro:detected ingested.
        sla_ms: 5
        invariant_refs: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C4, INV-A2, INV-H1, INV-H6]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — adapter

<!-- imported: modules → adapter -->


    adapter:
      id:           adapter
      uuid:         dc2cfbff-0000-4000-0000-000000000007
      layer:        kernel-layer
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/adapter/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Translates bridge bus events (from Guardian or dispatcher API) into typed kernel events
        with proper causal linkage (edgeType: causal/adapter). Handles callto lifecycle pairs
        (running→resolved/error) via calltoMap. Provides replayEvent() for deterministic replay.
      inputs:
        - id: IN-adapter-001
          name: bridge_event
          type: "{ type: string, payload: object }"
          required: true
          source: guardian-extension
          description: >
            Raw bridge bus event. Types: element:callto:running, element:callto:resolved,
            element:callto:error, page:navigated, dom:changed.
      outputs:
        - id: OUT-adapter-001
          name: kernel_event
          type: KernelEvent
          destination: kernel
          description: Translated and causally linked kernel event.
      dependencies:
        internal:
          - module_id: kernel
            why: kernel.ingest() for all translated events.
            coupling: runtime
          - module_id: causality
            why: CalltoMap for lifecycle pair resolution.
            coupling: data
        external: []
      hooks_in:
        - event: "element:callto:running"
          handler: handleCalltoRunning
          description: Registers pending callto in calltoMap. Ingests command:running.
        - event: "element:callto:resolved"
          handler: handleCalltoResolved
          description: Resolves calltoMap. Ingests command:success with causedBy=running.id.
        - event: "element:callto:error"
          handler: handleCalltoError
          description: Resolves calltoMap as error. Ingests command:failed.
        - event: "page:navigated"
          handler: handlePageNav
          description: Ingests page:navigated. Triggers session:boundary gate.
        - event: "dom:changed"
          handler: handleDomChanged
          description: Ingests dom:changed with observational edgeType.
      hooks_out:
        - event: "command:running"
          trigger: element:callto:running received.
          description: Kernel event. edgeType causal/adapter.
        - event: "command:success"
          trigger: element:callto:resolved and calltoMap resolves.
          description: causedBy = command:running.id. edgeType causal/adapter.
        - event: "command:failed"
          trigger: element:callto:error and calltoMap resolves.
          description: causedBy = command:running.id. edgeType causal/adapter.
        - event: "session:boundary"
          trigger: page:navigated ingested. Built-in gate fires.
          description: Gate-generated event. edgeType causal/rule.
      failure_modes:
        - id: FAIL-adapter-001
          scenario: calltoMap receives :resolved without prior :running. Orphaned resolution.
          impact: recoverable
          probability: low
          detection: calltoMap.resolve() returns null if no pending entry.
          mitigation: Log warning. Ingest command:success without causedBy. No crash.
          recovery: Application must ensure running→resolved ordering.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: calltoMap
            type: "Map<calltoKey, runningEventId>"
            persistence: memory
            description: Pending callto pairs. Cleared on TTL expiry (if enabled).
        hot_path: in-memory Map
        truth_layer: kernel ring (pairs reconstructable from command:running events)
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 3
        throughput_target: "50k bridge events/s"
        memory_budget_mb: 16
        notes: calltoMap bounded by active concurrent callto operations.
      security:
        trust_level: untrusted
        data_sensitivity: internal
        attack_surface:
          - vector: Malicious Guardian extension sends forged bridge events.
            risk: Fabricated causal chains enter kernel ring.
            mitigated_by: adapter-sandbox provides null adapters and policy registry for sandboxed environments.
      behavioral_contract:
        summary: Translates bridge bus events into causally-linked kernel events.
        success: command:success.causedBy === command:running.id for every matched callto pair.
        failure: command:success with no causedBy when matching running event exists.
        sla_ms: 3
        invariant_refs: [INV-C1]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — enforcement

<!-- imported: modules → enforcement -->


    enforcement:
      id:           enforcement
      uuid:         e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b
      layer:        kernel-layer
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/enforcement/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Runtime invariant enforcement. RuntimeGuard — single invariant, hard stop on violation.
        BoundaryIndex — registry and continuous monitor for all 29 system invariants.
        Neither component mutates external state. Both are observers only.
      inputs:
        - id: IN-enforcement-001
          name: kernel_events
          type: KernelEvent
          required: true
          source: kernel
          description: All ingested events monitored by BoundaryIndex.
      outputs:
        - id: OUT-enforcement-001
          name: invariant_violation_error
          type: InvariantViolationError
          destination: caller
          description: Thrown on any hard invariant violation. Never caught silently.
      dependencies:
        internal:
          - module_id: kernel
            why: Subscribes to all kernel events for continuous monitoring.
            coupling: event
        external: []
      hooks_in:
        - event: "*"
          handler: BoundaryIndex.onEvent
          description: Monitors every ingested event for invariant violations.
      hooks_out:
        - event: "invariant:violation"
          trigger: Any hard invariant violated.
          description: Throws InvariantViolationError before emitting. Hard stop.
      failure_modes:
        - id: FAIL-enforcement-001
          scenario: BoundaryIndex subscription missed — enforcement not active.
          impact: fatal
          probability: rare
          detection: Structural. BoundaryIndex.attach(kernel) must be called at kernel creation.
          mitigation: createKernel() factory automatically attaches BoundaryIndex.
          recovery: Recreate kernel via createKernel() factory. Never instantiate ring directly.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: invariantRegistry
            type: "Map<invariantId, InvariantRecord>"
            persistence: memory
            description: All 29 invariants. Status updated on each check.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "29 checks per event at 100k events/s"
        memory_budget_mb: 4
        notes: Each invariant check O(1). ~2.9M invariant checks/s at 100k ingest rate.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Monitors all 29 system invariants continuously. Throws hard on violation.
        success: BoundaryIndex reports 29/29 invariants passing on a fresh kernel.
        failure: Any hard invariant violated without InvariantViolationError thrown.
        sla_ms: 1
        invariant_refs: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C3, INV-C4, INV-A2, INV-H1, INV-H6, INV-VM1, INV-L2, INV-L4]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — ledger

<!-- imported: modules → ledger -->


    ledger:
      id:           ledger
      uuid:         a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      1.0.0
      file_ref:     modules/ledger/index.js
      created_at:   2026-05-24T03:42:00Z
      last_modified: 2026-05-24T04:24:00Z
      purpose: >
        Dual Ledger — UpgradeLedger (authoritative truth) and IdeaLedger (cognition/speculation).
        UpgradeLedger: append-only after commit. Replay reconstructs everything (§7.6).
        IdeaLedger: mutable, speculative, never affects runtime (L-3).
        Ideas become upgrades only via promoteIdea() cognition gate (L-4).
      inputs:
        - id: IN-ledger-001
          name: idea_entry
          type: IdeaEntry
          required: false
          source: forge
          description: Speculative hypothesis. Mutable until promoted or closed.
        - id: IN-ledger-002
          name: validation_result
          type: ValidationResult
          required: false
          source: loader
          description: Test result or proven diff. Required for promoteIdea().
      outputs:
        - id: OUT-ledger-001
          name: upgrade_entry
          type: UpgradeEntry
          destination: caller
          description: >
            Verified upgrade record. Types: passing_test | proven_diff | measurable_result |
            config_change | module_addition | bug_fix | phase_complete | feature | refactor |
            security_fix.
        - id: OUT-ledger-002
          name: ledger_events
          type: LedgerEvent
          destination: observer-bus
          description: idea:recorded, idea:closed, idea:promoted, upgrade:committed, bottleneck.
      dependencies:
        internal:
          - module_id: observer
            why: Emits ledger events to observer bus. Zero coupling via ledger.on() API.
            coupling: event
        external: []
      hooks_in: []
      hooks_out:
        - event: "idea:recorded"
          trigger: IdeaLedger.record() called.
          description: Fires with { idea }.
        - event: "idea:promoted"
          trigger: promoteIdea() gate passes.
          description: Fires with { idea, upgrade }. Idea moves to UpgradeLedger.
        - event: "upgrade:committed"
          trigger: UpgradeLedger.commit() called.
          description: Fires with { upgrade }. Authoritative record created.
        - event: "bottleneck"
          trigger: Unresolved idea count > BOTTLENECK_THRESHOLD=5.
          description: Fires with { metrics }. Operator alert.
      failure_modes:
        - id: FAIL-ledger-001
          scenario: promoteIdea() bypass attempted — idea promoted without validation gate.
          impact: fatal
          probability: rare
          detection: promoteIdea() validates entry.type against UPGRADE_TYPE enum. LedgerError on miss.
          mitigation: LedgerError is hard throw. Never caught silently.
          recovery: Fix entry type. Retry promoteIdea() with valid validation evidence.
          emits_gap: false
        - id: FAIL-ledger-002
          scenario: IdeaLedger entry committed to UpgradeLedger directly (L-2 bypass).
          impact: fatal
          probability: rare
          detection: validateSeparation() catches cross-contamination. LedgerError thrown.
          mitigation: Type-tagged entries. LedgerError on wrong-ledger commit.
          recovery: Remove contaminated entry. Reconstruct UpgradeLedger from clean entries.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: ideaLog
            type: "IdeaEntry[]"
            persistence: memory
            description: Mutable speculative ideas.
          - name: upgradeLog
            type: "UpgradeEntry[]"
            persistence: memory
            description: Append-only after commit. Source of truth for system evolution.
        hot_path: in-memory arrays
        truth_layer: upgradeLog
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 5
        throughput_target: "100 ledger operations/s"
        memory_budget_mb: 16
        notes: Not a hot path. Operator-triggered or AI-triggered only.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Forged validation result to bypass L-4 gate.
            risk: Unvalidated idea enters UpgradeLedger.
            mitigated_by: UPGRADE_TYPE enum frozen. LedgerError on any mismatch.
      behavioral_contract:
        summary: Dual ledger separating speculative ideas from verified upgrades. Gate-enforced promotion.
        success: Ideas in IdeaLedger (mutable). Upgrades in UpgradeLedger (append-only). promoteIdea() is the only path.
        failure: Any idea in UpgradeLedger without passing promoteIdea() (L-4), or ledger type mixing (L-2).
        sla_ms: 5
        invariant_refs: [INV-L2, INV-L4]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — persist

<!-- imported: modules → persist -->


    persist:
      id:           persist
      uuid:         fde4fdbd-0000-4000-0000-000000000012
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/persist/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        WAL + archive + recovery. Three backends: memory, indexeddb, filesystem, auto.
        Writes events to WAL every walFlushEvery events. recoverStore() replays WAL on startup.
        archiveEvicted() archives ring-evicted events for cold queryArchive() queries.
      inputs:
        - id: IN-persist-001
          name: kernel_events
          type: KernelEvent
          required: true
          source: kernel
          description: All events buffered for WAL flush.
        - id: IN-persist-002
          name: evicted_event
          type: KernelEvent
          required: false
          source: application-layer
          description: >
            Evicted event object passed to archiveEvicted(). Kernel emits system:ring:evicted
            with evictedSeq but NOT the object — application must intercept and pass directly.
      outputs:
        - id: OUT-persist-001
          name: wal_flush
          type: "KernelEvent[]"
          destination: backend
          description: Batch of events written to WAL backend.
        - id: OUT-persist-002
          name: recovery_result
          type: RecoveryResult
          destination: caller
          description: "{ ok, snapshotEvents, walReplayed, totalRecovered, errors[] }."
      dependencies:
        internal:
          - module_id: kernel
            why: Subscribes to all events for WAL buffering.
            coupling: runtime
          - module_id: compress
            why: Dynamic import at flush/recover time (TRDE-003 — avoids circular dep).
            coupling: data
        external: []
      hooks_in:
        - event: "system:ring:evicted"
          handler: archiveEvicted
          description: Application must pass evicted object explicitly.
      hooks_out: []
      failure_modes:
        - id: FAIL-persist-001
          scenario: WAL backend write fails (disk full, IndexedDB quota exceeded).
          impact: degraded
          probability: low
          detection: Backend write throws. persist wraps in try/catch. ok:false in result.
          mitigation: Buffer in memory. Alert caller. Retry on next flush.
          recovery: Free disk/quota. Flush resumes on next walFlushEvery trigger.
          emits_gap: false
        - id: FAIL-persist-002
          scenario: recoverStore() encounters corrupted WAL entries.
          impact: degraded
          probability: low
          detection: JSON parse error on WAL line. errors[] populated.
          mitigation: Skip corrupted entries. Log with line number. Return partial recovery.
          recovery: Manual WAL inspection. Partial recovery may lose events near corruption.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: walBuffer
            type: "KernelEvent[]"
            persistence: memory
            description: In-memory buffer before WAL flush. Size = walFlushEvery.
          - name: backend
            type: StorageBackend
            persistence: disk_file
            description: filesystem | indexeddb | memory. Selected at createStore() time.
        hot_path: in-memory walBuffer
        truth_layer: WAL backend file/store
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 10
        throughput_target: "10k events/s to filesystem backend"
        memory_budget_mb: 32
        notes: WAL flush is async. walFlushEvery=100 means max 100 events in memory before flush.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: WAL file tampered between shutdown and recovery.
            risk: Corrupted events replayed into fresh kernel.
            mitigated_by: recoverStore() validates each WAL entry. Corrupted entries skipped.
      behavioral_contract:
        summary: Durable WAL with recovery. Zero data loss for clean shutdowns.
        success: recoverStore() on fresh kernel after clean shutdown returns ok:true, no events lost.
        failure: recoverStore() returns ok:false or totalRecovered < expected after clean shutdown.
        sla_ms: 10
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — forge

<!-- imported: modules → forge -->


    forge:
      id:           forge
      uuid:         0091ce2c-0000-4000-0000-000000000010
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/forge/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        AI-powered self-modification of causal-nexus modules via Anthropic API.
        Four operations: forgeModule (full rewrite), forgePatch (targeted patch),
        forgeGate (gate function generation), forgeHook (hook addition).
        Produces ES module source strings — loader.loadModule() evaluates them.
      inputs:
        - id: IN-forge-001
          name: module_source
          type: string
          required: true
          source: loader
          description: Current module source. Context for AI rewriting.
        - id: IN-forge-002
          name: patch_description
          type: string
          required: true
          source: caller
          description: Natural language description of the desired change.
      outputs:
        - id: OUT-forge-001
          name: patch_record
          type: PatchRecord
          destination: loader
          description: "{ ok, src, durationMs, tokensUsed, laws[] }. src is modified ES module source."
      dependencies:
        internal:
          - module_id: loader
            why: Evaluation of produced source via loadModule(). Hot reload via hotReload().
            coupling: runtime
        external:
          - name: anthropic-api
            version: "claude-sonnet-4-20250514"
            why: AI code generation. No local fallback (TRDE-004).
            optional: false
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-forge-001
          scenario: Anthropic API returns non-200 or rate-limit error.
          impact: recoverable
          probability: medium
          detection: fetch() response.ok === false.
          mitigation: "Return { ok: false, error }. Caller decides to retry or skip."
          recovery: Wait for rate limit window. Retry with exponential backoff.
          emits_gap: false
        - id: FAIL-forge-002
          scenario: forge produces syntactically invalid ES module source.
          impact: recoverable
          probability: low
          detection: "loader.loadModule() returns { ok: false } with parse error."
          mitigation: "Return { ok: false, error }. Source discarded."
          recovery: Retry forgeModule with more specific description.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 30000
        throughput_target: "1 forge operation at a time"
        memory_budget_mb: 8
        notes: Latency dominated by Anthropic API round-trip (3-30s). Operator-invoked only.
      security:
        trust_level: untrusted
        data_sensitivity: sensitive
        attack_surface:
          - vector: Prompt injection via malicious module source sent to forge.
            risk: AI produces adversarial code loaded into runtime.
            mitigated_by: loader.loadModule() runs tests before returning. Human review recommended.
      behavioral_contract:
        summary: Produces valid, loadable ES module patches from natural language descriptions.
        success: "forgePatch() returns { ok: true, src } where src passes loader.loadModule() >= 80% of the time."
        failure: forgePatch() returns ok:true but src fails loader evaluation.
        sla_ms: 30000
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — version-gate

<!-- imported: modules → version-gate -->


    version-gate:
      id:           version-gate
      uuid:         a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/version-gate/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Single authoritative validation pass for all .nex artifacts (SNAP, BP, CLIP).
        VM-1: All artifacts must pass before parse, migration, or hydration.
        VM-2: Migration occurs immediately after validation, before hydration.
        Supports legacy (URCK-*) and canonical (NEX-*) magic strings.
        Major kernel version mismatch = GateValidationError. No silent corrupt restore.
      inputs:
        - id: IN-vg-001
          name: raw_artifact
          type: "{ magic: string, fmt: number, kernelVersion: string, ... }"
          required: true
          source: persist
          description: Raw .nex artifact before hydration.
      outputs:
        - id: OUT-vg-001
          name: validated_artifact
          type: NexArtifact
          destination: context
          description: Validated and migrated artifact ready for hydration.
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-vg-001
          scenario: Major kernel version mismatch. Artifact v4.x.x, runtime v5.x.x.
          impact: fatal
          probability: low
          detection: validate() checks major version. Mismatch throws GateValidationError.
          mitigation: Throw immediately. No hydration.
          recovery: Operator must produce new artifact from current runtime.
          emits_gap: false
        - id: FAIL-vg-002
          scenario: Unknown magic string. Not recognized as SNAP/BP/CLIP.
          impact: fatal
          probability: rare
          detection: validate() checks SUPPORTED_MAGICS set. Unknown magic throws GateValidationError.
          mitigation: Throw immediately. No hydration.
          recovery: Artifact is not a .nex file. Discard.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 5
        throughput_target: "1k validations/s"
        memory_budget_mb: 2
        notes: Single-pass JSON check. Negligible cost.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Artifact with forged major version string passes validation.
            risk: Incompatible artifact hydrates silently.
            mitigated_by: validate() parses kernelVersion as semver. Major field check, not string compare.
      behavioral_contract:
        summary: Validates .nex artifacts before hydration. Hard stop on version mismatch.
        success: Valid same-major artifact passes. GateValidationError on major mismatch or unknown magic.
        failure: Major-version mismatched artifact hydrates without GateValidationError.
        sla_ms: 5
        invariant_refs: [INV-VM1]
      cobalt:
        reads: []
        writes: []
        cli: []



---

# modules — projection

<!-- imported: modules → projection -->


    projection:
      id:           projection
      uuid:         aa000001-proj-4000-0000-000000000000
      layer:        causality
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/projection/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Macro pattern projection. Maintains macrosByPattern map. Emits macro:detected
        via observer bus (never via kernel.ingest — C-2). Updated on every ingest.
      inputs: []
      outputs:
        - id: OUT-proj-001
          name: macro_detected
          type: object
          destination: observer-bus
          description: "macro:detected observer event. NOT a kernel event (C-2)."
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out:
        - event: "macro:detected"
          trigger: Pattern threshold crossed in macrosByPattern map.
          description: "Projection artifact — observer bus only, never kernel.ingest()."
      failure_modes:
        - id: FAIL-proj-001
          scenario: Macro pattern emitted via kernel.ingest() instead of observer bus.
          impact: fatal
          probability: rare
          detection: BoundaryIndex catches C-2 violation immediately.
          mitigation: Structural — projection has no reference to kernel.ingest().
          recovery: Fix the call site. Restart kernel.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: macrosByPattern
            type: "Map<pattern, count>"
            persistence: memory
            description: Pattern frequency counter. Evicted with ring.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "100k updates/s"
        memory_budget_mb: 8
        notes: One map lookup + increment per ingest.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: "Maintains macro pattern projection. Never emits kernel events."
        success: "macro:detected fires via observer bus when pattern threshold crossed."
        failure: "macro:detected emitted via kernel.ingest() (C-2 violation)."
        sla_ms: 1
        invariant_refs: [INV-C2]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — lazy

<!-- imported: modules → lazy -->


    lazy:
      id:           lazy
      uuid:         aa000002-lazy-4000-0000-000000000000
      layer:        causality
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/lazy/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Lazy evaluation utilities for causal graph traversal. Provides deferred
        ancestor resolution and memoized traversal caches to avoid redundant graph walks.
      inputs: []
      outputs: []
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-lazy-001
          scenario: Memoized traversal cache not invalidated after ring eviction.
          impact: recoverable
          probability: low
          detection: Stale cache returns evicted event as ancestor. traceToRoot returns ghost.
          mitigation: Cache keyed on eventTs. Eviction clears relevant keys.
          recovery: Clear traversal cache. Retry query.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: traversalCache
            type: "Map<eventId, AncestorChain>"
            persistence: memory
            description: Memoized traversal results. Invalidated on eviction.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "500k lookups/s"
        memory_budget_mb: 16
        notes: Cache bounded by ring capacity.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Lazy traversal cache for causal graph. Bounded by ring capacity.
        success: Cache hit returns correct ancestor chain without re-traversal.
        failure: Stale cache returns evicted ancestor as live node.
        sla_ms: 1
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — adapter-sandbox

<!-- imported: modules → adapter-sandbox -->


    adapter-sandbox:
      id:           adapter-sandbox
      uuid:         aa000003-sbox-4000-0000-000000000000
      layer:        kernel-layer
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/adapter-sandbox/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Null adapter and policy registry for sandboxed environments. Wraps untrusted
        adapters with null-event policy. Prevents untrusted bridge events from reaching
        kernel in restricted deployments.
      inputs:
        - id: IN-sbox-001
          name: bridge_event
          type: object
          required: false
          source: guardian-extension
          description: Untrusted bridge event. Intercepted and nulled per policy.
      outputs:
        - id: OUT-sbox-001
          name: nulled_event
          type: null
          destination: kernel
          description: No-op output under sandbox policy. Event discarded.
      dependencies:
        internal:
          - module_id: adapter
            why: Wraps adapter with policy layer.
            coupling: runtime
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-sbox-001
          scenario: Sandbox policy misconfigured — untrusted events pass through.
          impact: recoverable
          probability: low
          detection: Policy registry audit log detects unexpected pass-through.
          mitigation: Default policy is deny-all. Explicit allowlist required.
          recovery: Reset policy registry to deny-all. Review allowlist.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: policyRegistry
            type: "Map<eventType, Policy>"
            persistence: memory
            description: Allowlist of permitted bridge event types.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "100k policy checks/s"
        memory_budget_mb: 4
        notes: Policy check is O(1) map lookup.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Policy registry poisoned with forged allowlist entry.
            risk: Untrusted event type passes sandbox.
            mitigated_by: Policy registry is write-once at init. No runtime mutation.
      behavioral_contract:
        summary: Null adapter for sandboxed deployments. Deny-all by default.
        success: Untrusted bridge events are discarded. Only allowlisted types pass through.
        failure: Untrusted event reaches kernel.ingest() without policy check.
        sla_ms: 1
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — observer

<!-- imported: modules → observer -->


    observer:
      id:           observer
      uuid:         aa000004-obsv-4000-0000-000000000000
      layer:        kernel-layer
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/observer/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Typed observer bus decoupled from the kernel ring. Delivers projection events
        (macro:detected), ledger events (idea:recorded, upgrade:committed), and system
        diagnostics without polluting the authoritative event ring.
      inputs:
        - id: IN-obsv-001
          name: observer_event
          type: object
          required: false
          source: projection
          description: Projection or ledger event arriving via observer.emit().
      outputs:
        - id: OUT-obsv-001
          name: observer_callback
          type: object
          destination: caller
          description: Typed callback delivered to observer.on() subscribers.
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-obsv-001
          scenario: Observer subscriber throws uncaught exception.
          impact: recoverable
          probability: low
          detection: Observer wraps subscriber calls in try/catch.
          mitigation: Isolate failing subscriber. Others continue.
          recovery: Fix subscriber. Re-attach.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: subscribers
            type: "Map<eventType, Set<fn>>"
            persistence: memory
            description: Registered observer callbacks by event type.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "500k dispatches/s"
        memory_budget_mb: 4
        notes: Fan-out to N subscribers per event. Each subscriber O(1).
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Typed observer bus for non-ring events. Zero coupling to kernel.
        success: "observer.emit(type, payload) delivers to all observer.on(type, fn) subscribers."
        failure: Subscriber not called, or kernel ring receives observer-bus event.
        sla_ms: 1
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — delta

<!-- imported: modules → delta -->


    delta:
      id:           delta
      uuid:         aa000005-delt-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/delta/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Delta analytics engine. Computes event deltas (latency, frequency, success rate)
        for command:running→command:success/failed pairs. Drives bottleneck detection and
        performance reporting.
      inputs:
        - id: IN-delta-001
          name: kernel_events
          type: KernelEvent
          required: true
          source: kernel
          description: All events. delta subscribes and filters command:* pairs.
      outputs:
        - id: OUT-delta-001
          name: delta_record
          type: DeltaRecord
          destination: caller
          description: "{ commandId, latencyMs, status, ts }. Queryable via CQL."
      dependencies:
        internal:
          - module_id: kernel
            why: Subscribes to kernel events for delta computation.
            coupling: event
        external: []
      hooks_in:
        - event: "command:success"
          handler: onCommandSuccess
          description: Computes latency from paired command:running event.
        - event: "command:failed"
          handler: onCommandFailed
          description: Records failure with latency from paired command:running.
      hooks_out: []
      failure_modes:
        - id: FAIL-delta-001
          scenario: command:running not in ring when command:success arrives (evicted).
          impact: recoverable
          probability: low
          detection: Delta lookup returns null for running event.
          mitigation: Log missing pair. Skip latency computation. Record as incomplete.
          recovery: No recovery needed. Future pairs compute normally.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: pendingPairs
            type: "Map<commandId, runningTs>"
            persistence: memory
            description: Pending command:running timestamps awaiting resolution.
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 2
        throughput_target: "50k deltas/s"
        memory_budget_mb: 16
        notes: Bounded by active concurrent commands.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Computes command latency deltas from running→success/failed pairs.
        success: Every command:success produces a delta_record with correct latencyMs.
        failure: command:success arrives with no delta_record produced.
        sla_ms: 2
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — query

<!-- imported: modules → query -->


    query:
      id:           query
      uuid:         aa000006-qury-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/query/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        CQL (Causal Query Language) execution engine. One-shot queries against the kernel
        ring. Uses kernel._typeIndex for O(1) type-equality root conditions (TRDE-002).
        Supports FIND, WHERE, LIMIT, ORDER BY, traceToRoot.
      inputs:
        - id: IN-query-001
          name: cql_string
          type: string
          required: true
          source: caller
          description: CQL query string. e.g. "FIND events WHERE type = 'command:success' LIMIT 10"
        - id: IN-query-002
          name: kernel_ref
          type: KernelInstance
          required: true
          source: caller
          description: Kernel instance to query. Accesses _typeIndex directly (TRDE-002).
      outputs:
        - id: OUT-query-001
          name: query_result
          type: "KernelEvent[]"
          destination: caller
          description: Matching events from the ring.
      dependencies:
        internal:
          - module_id: kernel
            why: "_typeIndex access for O(1) type queries (TRDE-002 documented coupling)."
            coupling: data
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-query-001
          scenario: "_typeIndex accessed after kernel.reset() — stale index returns wrong events."
          impact: recoverable
          probability: low
          detection: query must take defensive copy of _typeIndex at query start.
          mitigation: Defensive copy on every query execution. H-3 invariant.
          recovery: Re-execute query on fresh kernel reference.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 10
        throughput_target: "10k queries/s"
        memory_budget_mb: 8
        notes: O(1) type lookup via _typeIndex. WHERE filters are O(n) over the type set.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: CQL injection via malformed query string.
            risk: Unexpected ring scan behavior or parser crash.
            mitigated_by: CQL parser validates syntax before execution.
      behavioral_contract:
        summary: "CQL query engine. O(1) type queries via _typeIndex."
        success: "FIND events WHERE type = X LIMIT 10 returns correct events from ring."
        failure: Stale _typeIndex returns events already evicted from ring.
        sla_ms: 10
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — compress

<!-- imported: modules → compress -->


    compress:
      id:           compress
      uuid:         aa000007-cmpr-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/compress/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Snapshot (compress) and restore engine for .nex artifacts. Serializes kernel ring
        state to SNAP/BP/CLIP magic-string artifacts. Dynamically imported by persist to
        avoid circular dependency (TRDE-003). Imports kernel for ring access.
      inputs:
        - id: IN-cmpr-001
          name: kernel_ref
          type: KernelInstance
          required: true
          source: persist
          description: Kernel instance to snapshot. Accessed at flush/recover time via dynamic import.
      outputs:
        - id: OUT-cmpr-001
          name: nex_artifact
          type: NexArtifact
          destination: persist
          description: ".nex SNAP/BP/CLIP artifact. Validated by version-gate on restore."
      dependencies:
        internal:
          - module_id: kernel
            why: Ring access for snapshot serialization. This is why persist must dynamically import compress.
            coupling: data
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-cmpr-001
          scenario: Serialization produces artifact with wrong magic string.
          impact: fatal
          probability: rare
          detection: version-gate.validate() catches on restore. GateValidationError thrown.
          mitigation: Magic string constants are frozen enums. No runtime mutation.
          recovery: Discard artifact. Produce new snapshot from current ring state.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 100
        throughput_target: "10 snapshots/s"
        memory_budget_mb: 64
        notes: Snapshot cost is O(ringSize). Large rings take longer.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Serializes kernel ring to .nex artifact. Restores via version-gate validated artifact.
        success: snapshot() produces valid .nex artifact. restore() on same artifact reconstructs ring.
        failure: Artifact fails version-gate.validate() on restore.
        sla_ms: 100
        invariant_refs: [INV-VM1]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — context

<!-- imported: modules → context -->


    context:
      id:           context
      uuid:         aa000008-ctxt-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/context/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Context isolation for replay and multi-tenant kernel sessions (CI-1..CI-6).
        createReplayContext() produces an isolated kernel instance from a validated .nex
        artifact. No state crosses context boundaries (CI-4). Used by version-gate hydration
        path after validate() → migrate().
      inputs:
        - id: IN-ctxt-001
          name: validated_artifact
          type: NexArtifact
          required: true
          source: version-gate
          description: Validated and migrated .nex artifact. Never a raw artifact (VM-1).
      outputs:
        - id: OUT-ctxt-001
          name: isolated_kernel
          type: KernelInstance
          destination: caller
          description: Fresh kernel instance hydrated from artifact. CI-1..CI-6 isolation.
      dependencies:
        internal:
          - module_id: version-gate
            why: validate() must precede createReplayContext(). VM-1 enforcement.
            coupling: runtime
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-ctxt-001
          scenario: createReplayContext() called with raw (unvalidated) artifact.
          impact: fatal
          probability: rare
          detection: Context checks for VM-1 validation token on artifact. Throws if absent.
          mitigation: VM-1 validation token stamped by version-gate.validate(). Cannot be forged.
          recovery: Always call version-gate.validate() before createReplayContext().
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 50
        throughput_target: "100 contexts/s"
        memory_budget_mb: 32
        notes: Cost proportional to artifact ring size.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: VM-1 validation token forged on raw artifact.
            risk: Unvalidated artifact hydrates. Ring state corrupted.
            mitigated_by: Validation token is a non-transferable closure reference from version-gate.
      behavioral_contract:
        summary: "Isolated replay context from validated .nex artifact. CI-1..CI-6 enforced."
        success: "createReplayContext(validArtifact) returns isolated kernel matching artifact ring state."
        failure: Raw artifact hydrates without GateValidationError.
        sla_ms: 50
        invariant_refs: [INV-VM1]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — clip

<!-- imported: modules → clip -->


    clip:
      id:           clip
      uuid:         aa000009-clip-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/clip/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Clip extraction — produces CLIP .nex artifacts from a bounded window of ring events.
        Clips are time-bounded sub-snapshots useful for sharing causal chains without
        the full ring state. Validated by version-gate (VM-1) on restore like all .nex artifacts.
      inputs:
        - id: IN-clip-001
          name: clip_range
          type: "{ fromTs: number, toTs: number }"
          required: true
          source: caller
          description: Logical tick range to extract from ring.
      outputs:
        - id: OUT-clip-001
          name: clip_artifact
          type: NexArtifact
          destination: persist
          description: "CLIP magic-string .nex artifact. version-gate validated on restore."
      dependencies:
        internal:
          - module_id: kernel
            why: Ring access for clip window extraction.
            coupling: data
          - module_id: version-gate
            why: clip.restore() calls version-gate.validate() before hydration (VM-1).
            coupling: runtime
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-clip-001
          scenario: clip.restore() bypasses version-gate.validate().
          impact: fatal
          probability: rare
          detection: GATE-007 static analysis catches bypass. VM-1 violation.
          mitigation: clip.restore() calls version-gate.validate() as first step. Structural.
          recovery: Fix call site. Rerun GATE-007.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 50
        throughput_target: "100 clips/s"
        memory_budget_mb: 16
        notes: Cost proportional to clip window size.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: Extracts bounded ring window into CLIP .nex artifact. Version-gate validated on restore.
        success: "clip(fromTs, toTs) produces valid CLIP artifact. restore() reconstructs window correctly."
        failure: clip.restore() called without version-gate.validate() (VM-1 violation).
        sla_ms: 50
        invariant_refs: [INV-VM1]
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — sigma

<!-- imported: modules → sigma -->


    sigma:
      id:           sigma
      uuid:         aa000010-sigm-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/sigma/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Statistical classifier for ring event streams. Computes distribution signatures
        (sigma profiles) over event type frequencies, latency histograms, and causal
        depth. Used to detect anomalies and drift in event behavior over time.
      inputs:
        - id: IN-sigma-001
          name: kernel_events
          type: KernelEvent
          required: true
          source: kernel
          description: All events. sigma maintains rolling statistical windows.
      outputs:
        - id: OUT-sigma-001
          name: sigma_profile
          type: SigmaProfile
          destination: caller
          description: "{ typeFrequencies, latencyP50/P95/P99, causalDepthMean, anomalyScore }."
      dependencies:
        internal:
          - module_id: kernel
            why: Subscribes to all kernel events for statistical profiling.
            coupling: event
        external: []
      hooks_in:
        - event: "*"
          handler: onAnyEvent
          description: Updates rolling statistics on every ingest.
      hooks_out: []
      failure_modes:
        - id: FAIL-sigma-001
          scenario: Rolling window overflows available memory.
          impact: degraded
          probability: low
          detection: Window size monitor alerts at 80% of memory_budget_mb.
          mitigation: Evict oldest window bucket. Recompute from remaining buckets.
          recovery: Reduce window size or increase memory_budget_mb.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: windowBuckets
            type: "RingBuffer<StatBucket>"
            persistence: memory
            description: Rolling statistical windows. Bounded at configurable window count.
        hot_path: in-memory ring
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 2
        throughput_target: "100k stat updates/s"
        memory_budget_mb: 32
        notes: O(1) per event. Window compaction is O(buckets) — infrequent.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: "Rolling statistical profiler for ring event stream. Detects behavioral drift."
        success: "getSigmaProfile() returns accurate P50/P95/P99 latency for the window."
        failure: Profile lags reality by > 2 window periods.
        sla_ms: 2
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []


---

# modules — loader

<!-- imported: modules → loader -->


    loader:
      id:           loader
      uuid:         aa000011-load-4000-0000-000000000000
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/loader/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Hot ES module loader and evaluator. loadModule(src) evaluates forge-produced source
        strings in a sandboxed eval context, runs gate tests, and returns { ok, module } or
        { ok: false, error }. hotReload() replaces live module references without restart.
      inputs:
        - id: IN-load-001
          name: module_source
          type: string
          required: true
          source: forge
          description: ES module source string produced by forge. Evaluated in sandbox.
      outputs:
        - id: OUT-load-001
          name: load_result
          type: LoadResult
          destination: forge
          description: "{ ok, module } on success. { ok: false, error } on parse or gate failure."
      dependencies:
        internal:
          - module_id: forge
            why: Receives forge-produced source. Returns load result for forge to report.
            coupling: runtime
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-load-001
          scenario: Forge-produced source has syntax error. Eval throws SyntaxError.
          impact: recoverable
          probability: low
          detection: Eval wrapped in try/catch. SyntaxError caught and returned as error.
          mitigation: "Return { ok: false, error }. Source discarded. forge retries."
          recovery: forge retries with refined prompt.
          emits_gap: false
        - id: FAIL-load-002
          scenario: Hot-reloaded module has different export shape than expected.
          impact: recoverable
          probability: low
          detection: hotReload() validates export shape against expected interface.
          mitigation: Reject incompatible module. Keep old module live.
          recovery: forge produces compatible export shape. hotReload() retried.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: liveModules
            type: "Map<moduleId, Module>"
            persistence: memory
            description: Currently loaded live modules. Replaced atomically on hotReload().
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 100
        throughput_target: "10 loads/s"
        memory_budget_mb: 32
        notes: Eval cost varies by module size. Gate tests add ~50ms per load.
      security:
        trust_level: untrusted
        data_sensitivity: sensitive
        attack_surface:
          - vector: Forged module source with malicious eval payload.
            risk: Arbitrary code execution in runtime.
            mitigated_by: Eval in sandboxed context. Gate tests run before hotReload(). Human review recommended.
      behavioral_contract:
        summary: "Sandboxed ES module evaluator and hot-reloader for forge-produced source."
        success: "loadModule(validSrc) returns { ok: true, module } with correct exports."
        failure: "loadModule() returns { ok: true } but module has missing or incompatible exports."
        sla_ms: 100
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []

  # ════════════════════════════════════════════════════════════════
  

---

# causal map — kernel.ingest

<!-- imported: causal map → kernel.ingest -->

# BLOCK 5 — CAUSAL MAP
  # ════════════════════════════════════════════════════════════════
  causal_map:

    kernel.ingest:
      id: kernel.ingest
      type: trigger
      description: >
        Primary event ingestion. Runs the full 7-step pipeline: dedup → build+freeze →
        store+index → causal edge → macro projection → gates → listeners.
        Every event in the system originates here.
      source: kernel
      critical_path: true
      invariant_refs: [INV-I1, INV-I2, INV-C1, INV-C4, INV-A2]
      causes:
        - target: causality
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: Causal edge built and stored immediately after event freeze.
        - target: enforcement
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: BoundaryIndex checks all 29 invariants on every ingested event.
        - target: kernel
          mechanism: direct
          latency: "< 1ms"
          certainty: always
          condition: null
          description: All kernel.subscribe() callbacks notified after gate phase (C-4).
        - target: kernel
          mechanism: direct
          latency: "< 5ms"
          certainty: likely
          condition: At least one gate matches the event type.
          description: GateOutput[] collected atomically and re-ingested after gate phase (A-2).
        - target: persist
          mechanism: eventual
          latency: "< walFlushEvery events"
          certainty: always
          condition: null
          description: Event buffered to WAL. Flushed on walFlushEvery count.
      affects:
        - target: ring
          nature: creates
          reversible: false
          description: Event appended. Oldest evicted if at ringCap.
        - target: typeIndex
          nature: modifies
          reversible: false
          description: Event id added to typeIndex[type] Set.
        - target: causal_graph
          nature: creates
          reversible: false
          description: Edge created if causedBy provided.
        - target: macro_projection
          nature: modifies
          reversible: false
          description: Macro pattern count updated.
      risks:
        - id: RISK-CAUSAL-001
          description: Gate chain exceeds GATE_DEPTH_MAX=20. Recursive gate firing.
          probability: rare
          severity: critical
          mitigated_by: Kernel depth counter. At 20, throws with chain trace. Prevents infinite loop.
      blast_radius:
        modules: [kernel, causality, enforcement, persist, delta, query, compress, observer, ledger, projection]
        tables: []
        interfaces: [anthropic-api]
        invariants: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C4, INV-A2, INV-H1, INV-H6]
        max_depth: 4
        recomputed_at: 2026-05-24T04:00:00Z


---

# causal map — adapter.bridge

<!-- imported: causal map → adapter.bridge -->


    adapter.bridge:
      id: adapter.bridge
      type: trigger
      description: >
        Guardian sends bridge bus event to adapter. Adapter translates, resolves calltoMap pairs,
        and calls kernel.ingest() with proper edgeType. Entry point for all browser-side causal events.
      source: adapter
      critical_path: true
      invariant_refs: [INV-C1]
      causes:
        - target: kernel
          mechanism: direct
          latency: "< 3ms"
          certainty: always
          condition: null
          description: Translated event ingested to kernel via kernel.ingest().
        - target: session:boundary
          mechanism: conditional
          latency: "< 5ms"
          certainty: possible
          condition: event type is page:navigated and built-in gate active.
          description: Built-in gate fires and generates session:boundary kernel event.
      affects:
        - target: calltoMap
          nature: modifies
          reversible: false
          description: callto:running adds entry; callto:resolved/error removes it.
        - target: ring
          nature: creates
          reversible: false
          description: Translated kernel event added to ring.
      risks:
        - id: RISK-CAUSAL-002
          description: Guardian disconnects mid-session. calltoMap has pending running entries.
          probability: medium
          severity: minor
          mitigated_by: calltoTtlTicks expires stale entries if enabled. query FIND command:running for orphan detection.
      blast_radius:
        modules: [adapter, kernel, causality, enforcement, persist]
        tables: []
        interfaces: [guardian-bridge]
        invariants: [INV-C1]
        max_depth: 3
        recomputed_at: 2026-05-24T04:00:00Z


---

# causal map — ring.eviction

<!-- imported: causal map → ring.eviction -->


    ring.eviction:
      id: ring.eviction
      type: mutation
      description: >
        Ring buffer at capacity. Oldest event evicted. H-1: pruneEdgesFor() called immediately.
        system:ring:evicted emitted. Application must intercept and pass evicted object to archiveEvicted().
      source: kernel
      critical_path: false
      invariant_refs: [INV-H1]
      causes:
        - target: causality
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: pruneEdgesFor(evictedEvent.id) called. Edge graph stays bounded.
        - target: persist
          mechanism: conditional
          latency: "immediate"
          certainty: possible
          condition: Application wired archiveEvicted() to system:ring:evicted.
          description: Evicted event archived to cold storage.
        - target: query
          mechanism: indirect
          latency: "next query"
          certainty: always
          condition: null
          description: Evicted event no longer in typeIndex. Cold queries must use queryArchive().
      affects:
        - target: typeIndex
          nature: modifies
          reversible: false
          description: Event id removed from typeIndex[type] Set on eviction.
        - target: causal_graph
          nature: modifies
          reversible: false
          description: All edges for evicted event pruned. Ancestors become tombstones.
        - target: seenMap
          nature: modifies
          reversible: false
          description: Evicted event's dedupKey removed from seenMap LRU.
      risks:
        - id: RISK-CAUSAL-003
          description: High eviction rate. archiveEvicted() not wired. Evicted events permanently lost.
          probability: medium
          severity: major
          mitigated_by: Monitor system:ring:evicted rate. Alert > 1% of ingest. Wire archiveEvicted() in production.
      blast_radius:
        modules: [kernel, causality, persist, query, compress]
        tables: []
        interfaces: []
        invariants: [INV-H1]
        max_depth: 2
        recomputed_at: 2026-05-24T04:00:00Z


---

# causal map — ledger.promoteIdea

<!-- imported: causal map → ledger.promoteIdea -->


    ledger.promoteIdea:
      id: ledger.promoteIdea
      type: mutation
      description: >
        The cognition gate (L-4). An idea exits IdeaLedger and becomes UpgradeEntry in
        UpgradeLedger. The ONLY path between speculative and authoritative. Throws LedgerError
        if entry type invalid or ledgers are mixed.
      source: ledger
      critical_path: false
      invariant_refs: [INV-L2, INV-L4]
      causes:
        - target: ledger
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: UpgradeEntry appended to upgradeLog. idea:promoted emitted.
        - target: observer
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: idea:promoted observer event fires with { idea, upgrade }.
      affects:
        - target: ideaLog
          nature: modifies
          reversible: false
          description: Idea status set to PROMOTED. Entry closed.
        - target: upgradeLog
          nature: creates
          reversible: false
          description: UpgradeEntry appended. Append-only after commit.
      risks:
        - id: RISK-CAUSAL-004
          description: Forged validation result passed to promoteIdea() to bypass L-4 gate.
          probability: rare
          severity: critical
          mitigated_by: UPGRADE_TYPE enum frozen. LedgerError on any invalid type.
      blast_radius:
        modules: [ledger, observer, enforcement]
        tables: []
        interfaces: []
        invariants: [INV-L2, INV-L4]
        max_depth: 2
        recomputed_at: 2026-05-24T04:00:00Z


---

# causal map — version-gate.validate

<!-- imported: causal map → version-gate.validate -->


    version-gate.validate:
      id: version-gate.validate
      type: trigger
      description: >
        VM-1 enforcement. All .nex hydration passes through here. validate() → migrate()
        must be called in sequence. GateValidationError thrown on mismatch. Hard stop.
      source: version-gate
      critical_path: true
      invariant_refs: [INV-VM1]
      causes:
        - target: version-gate
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: migrate() called immediately after validate().
        - target: context
          mechanism: direct
          latency: "< 5ms"
          certainty: likely
          condition: Validation passes. Version-compatible.
          description: kernel.createReplayContext(migratedArtifact) called. Replay begins.
      affects:
        - target: kernel_ring
          nature: creates
          reversible: false
          description: Hydrated events loaded into fresh kernel ring on restore.
      risks:
        - id: RISK-CAUSAL-005
          description: Component bypasses version-gate and hydrates raw artifact directly.
          probability: rare
          severity: critical
          mitigated_by: VM-1 documented as axiom. BoundaryIndex monitors VM-1 invariant.
      blast_radius:
        modules: [version-gate, context, kernel, persist]
        tables: []
        interfaces: []
        invariants: [INV-VM1]
        max_depth: 3
        recomputed_at: 2026-05-24T04:00:00Z

  # ════════════════════════════════════════════════════════════════
  

---

# event model — stream

<!-- imported: event model → stream -->

# BLOCK 6 — EVENT MODEL
  # ════════════════════════════════════════════════════════════════
  event_model:
    stream:
      type: ring_buffer
      capacity: 5000000
      ordered: true
      durable: false
      replay_enabled: true
      overflow_policy: drop_oldest
      index_type: logical_tick


---

# event model — ring_buffer

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true


---

# event model — event_types

<!-- imported: event model → event_types -->


    event_types:
      - id: EVT-001
        name: command:running
        category: request
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Used as calltoMap key.
            - name: action
              type: string
              required: true
              description: Action being performed (e.g. click, submit).
          example:
            id: cmd-1
            action: click
        producers: [adapter]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-002
        name: command:success
        category: response
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Matches running entry.
            - name: status
              type: string
              required: true
              description: '"ok"'
          example:
            id: cmd-1
            status: ok
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-003
        name: command:failed
        category: error
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id.
            - name: error
              type: string
              required: true
              description: Error message or code.
          example:
            id: cmd-1
            error: "timeout"
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-004
        name: session:boundary
        category: state_change
        schema:
          fields:
            - name: ref
              type: string
              required: true
              description: ID of the page:navigated event that triggered this gate output.
          example:
            ref: evt-uuid-page-nav
        producers: [kernel]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: conditional
        idempotency_key: ref
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt

      - id: EVT-005
        name: system:ring:evicted
        category: system
        schema:
          fields:
            - name: cap
              type: number
              required: true
              description: Ring buffer capacity at eviction time.
            - name: evictedSeq
              type: number
              required: true
              description: Logical sequence of evicted event. Object NOT in payload.
          example:
            cap: 5000000
            evictedSeq: 4999999
        producers: [kernel]
        consumers: [persist, enforcement]
        retention_ms: 0
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: strict
          on_failure: discard

      - id: EVT-006
        name: invariant:violation
        category: error
        schema:
          fields:
            - name: invariantId
              type: string
              required: true
              description: "e.g. I-1, C-4, H-1."
            - name: message
              type: string
              required: true
              description: Human-readable violation description.
            - name: context
              type: object
              required: false
              description: Additional context for debugging.
          example:
            invariantId: I-1
            message: "event.id is not UUID v4: abc-123"
            context:
              eventType: command:running
        producers: [enforcement]
        consumers: [enforcement]
        retention_ms: 604800000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt


      - id: EVT-007
        name: macro:detected
        category: signal
        schema:
          fields:
            - name: pattern
              type: string
              required: true
              description: Pattern key that crossed threshold.
            - name: count
              type: number
              required: true
              description: Current pattern occurrence count.
          example:
            pattern: "command:success:sequential"
            count: 5
        producers: [projection]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-008
        name: system:diamond:rejected
        category: system
        schema:
          fields:
            - name: fromId
              type: string
              required: true
              description: Event ID that attempted a diamond parent edge.
            - name: toId
              type: string
              required: true
              description: Existing ancestor that would create the diamond.
          example:
            fromId: evt-abc-123
            toId: evt-root-001
        producers: [causality, kernel]
        consumers: [enforcement]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-009
        name: idea:recorded
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: IdeaEntry that was recorded.
          example:
            idea:
              id: idea-001
              type: hypothesis
              description: "Try reducing walFlushEvery to 50"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: idea.id
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-010
        name: idea:promoted
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: The IdeaEntry being promoted.
            - name: upgrade
              type: object
              required: true
              description: The resulting UpgradeEntry.
          example:
            idea:
              id: idea-001
            upgrade:
              id: upgrade-001
              type: passing_test
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-011
        name: upgrade:committed
        category: audit
        schema:
          fields:
            - name: upgrade
              type: object
              required: true
              description: The committed UpgradeEntry.
          example:
            upgrade:
              id: upgrade-001
              type: passing_test
              description: "195 tests passing after walFlushEvery reduction"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-012
        name: bottleneck
        category: signal
        schema:
          fields:
            - name: metrics
              type: object
              required: true
              description: "{ pendingIdeas: number, threshold: number, oldestIdea: IdeaEntry }."
          example:
            metrics:
              pendingIdeas: 6
              threshold: 5
              oldestIdea:
                id: idea-001
        producers: [ledger]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard


---

# event model — delivery

<!-- imported: event model → delivery -->


    delivery:
      default_guarantee: at_least_once
      default_ordering: strict
      max_retries: 3
      retry_backoff_ms: 100
      dead_letter_table: dead_letter_events
      failure_handling:
        on_subscriber_crash: continue
        on_timeout_ms: 5000


---

# event model — temporal_model

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  

---

# runtime model — concurrency

<!-- imported: runtime model → concurrency -->

# BLOCK 7 — RUNTIME MODEL
  # ════════════════════════════════════════════════════════════════
  runtime_model:
    concurrency:
      model: async
      max_concurrency: 1
      isolation: none
      async_model: >
        Node.js single-threaded event loop. Kernel ingest is synchronous (no await in hot path).
        Persist WAL flush and forge API calls are async. No worker threads in core.


---

# runtime model — process_model

<!-- imported: runtime model → process_model -->


    process_model:
      entry_point: modules/index.js
      worker_count: 1
      worker_type: static
      supervision: none


---

# runtime model — scheduling

<!-- imported: runtime model → scheduling -->


    scheduling:
      strategy: fifo
      preemptible: false
      tick_model: >
        Event-driven, not tick-driven. Ingestion is caller-driven.
        WAL flush triggered by event count. No global timer.
      poll_phases:
        - phase: 1
          layer: foundation
          modules: [identity, time]
          start_condition: Module import resolved.
        - phase: 2
          layer: causality
          modules: [causality, projection, lazy]
          start_condition: foundation loaded.
        - phase: 3
          layer: kernel-layer
          modules: [kernel, adapter, adapter-sandbox, observer, enforcement]
          start_condition: causality loaded.
        - phase: 4
          layer: analytics
          modules: [delta, query, compress, persist, version-gate, context, clip, sigma]
          start_condition: kernel-layer loaded.
        - phase: 5
          layer: ai
          modules: [forge, loader, ledger]
          start_condition: analytics loaded.


---

# runtime model — lifecycle

<!-- imported: runtime model → lifecycle -->


    lifecycle:
      startup_sequence:
        - phase: 0
          name: Node version check
          type: hard
          description: Node >= 18.0.0. crypto.randomUUID available. ES modules supported.
          on_failure: abort
        - phase: 1
          name: Foundation import
          type: hard
          description: identity, time modules imported. UUID + clock functional.
          on_failure: abort
        - phase: 2
          name: Causality import
          type: hard
          description: causality, projection, lazy modules imported. Edge taxonomy ready.
          on_failure: abort
        - phase: 3
          name: Kernel construction
          type: hard
          description: createKernel() called. BoundaryIndex attached. Built-in gates registered.
          on_failure: abort
        - phase: 4
          name: Persist + analytics
          type: soft
          description: createStore() if persistence enabled. version-gate, delta, query ready.
          on_failure: degrade
        - phase: 5
          name: AI layer (optional)
          type: soft
          description: forge, loader if Anthropic API accessible. ledger if dual-ledger enabled.
          on_failure: degrade
        - phase: 6
          name: Ready
          type: soft
          description: First event ingested. kernel.subscribe() active.
          on_failure: continue

      shutdown_sequence:
        - step: 1
          name: Flush WAL
          module_id: persist
          timeout_ms: 5000
          on_timeout: force_kill
        - step: 2
          name: Archive pending evictions
          module_id: persist
          timeout_ms: 2000
          on_timeout: force_kill
        - step: 3
          name: Snapshot kernel state
          module_id: compress
          timeout_ms: 3000
          on_timeout: escalate

      health_check:
        enabled: false
        endpoint: ""
        interval_ms: 0
        failure_threshold: 0
        recovery_threshold: 0

      crash_recovery:
        strategy: checkpoint
        max_restarts: 0
        restart_window_s: 0
        backoff: "n/a — library, not a process"
        crash_report: false


---

# runtime model — storage

<!-- imported: runtime model → storage -->


    storage:
      data_dir: user-configured
      log_dir:  user-configured
      tables:
        - name: wal
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 500
          compact_at_mb: 400
          description: Write-ahead log. Replayed on recoverStore().
        - name: archive
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 5000
          compact_at_mb: 4000
          description: Cold archive of ring-evicted events. Queried via queryArchive().
        - name: snapshot
          type: in_memory
          path: user-configured
          max_size_mb: 200
          compact_at_mb: 150
          description: .nex artifacts (SNAP/BP/CLIP). Validated by version-gate on restore.
        - name: dead_letter_events
          type: append_only_jsonl
          path: user-configured
          max_size_mb: 50
          compact_at_mb: 40
          description: Undeliverable events. on_failure dead_letter.


---

# runtime model — resource_limits

<!-- imported: runtime model → resource_limits -->


    resource_limits:
      memory_mb: 512
      cpu_cores: 1.0
      disk_mb: 6000
      open_files: 32
      network:
        allowed_hosts: ["api.anthropic.com"]
        allowed_ports: [443]

  # ════════════════════════════════════════════════════════════════
  

---

# interfaces — external

<!-- imported: interfaces → external -->

# BLOCK 8 — INTERFACES
  # ════════════════════════════════════════════════════════════════
  interfaces:
    external:
      - id: IFACE-001
        name: anthropic-api
        type: http_api
        direction: outbound
        protocol: HTTPS REST
        version: "claude-sonnet-4-20250514"
        auth:
          method: api_key
          location: header
          required: true
        schema_ref: https://docs.anthropic.com/api/messages
        sla:
          availability_pct: 99.5
          max_latency_ms: 30000
          rate_limit: "varies by plan"
        breaking_change_policy: >
          Model version pinned in forge module. On deprecation, forge returns
          { ok: false, error: 'model_deprecated' }. Operator updates model string.
        failure_contract: >
          Non-200: "forge returns { ok: false, error }. Timeout: { ok: false, error: 'timeout' }."
        consumers: [forge]
        mock_available: true

      - id: IFACE-002
        name: guardian-bridge
        type: websocket
        direction: inbound
        protocol: WebExtension message passing
        version: "5.0.0"
        auth:
          method: none
          location: none
          required: false
        schema_ref: Guardian/handshake.js
        sla:
          availability_pct: 95.0
          max_latency_ms: 100
          rate_limit: "browser-rate-limited"
        breaking_change_policy: >
          Adapter handles unknown bridge event types gracefully (logged, not crashed).
        failure_contract: >
          On Guardian disconnect: calltoMap retains pending entries until TTL expiry.
          Adapter continues. Kernel ring continues normally.
        consumers: [adapter]
        mock_available: true


---

# interfaces — internal

<!-- imported: interfaces → internal -->


    internal:
      - id: INT-001
        name: kernel → causality (edge ops)
        from_module: kernel
        to_module: causality
        type: function_call
        mechanism: createEdge(), pruneEdgesFor(), createCalltoMap() APIs
        contract: Synchronous in ingest pipeline steps 4 and H-1. Returns immutable edge records.
        failure_contract: causality throws on diamond. kernel catches and emits system:diamond:rejected.
        latency_budget_ms: 2
        mock_available: true

      - id: INT-002
        name: kernel → enforcement (BoundaryIndex)
        from_module: kernel
        to_module: enforcement
        type: event
        mechanism: kernel.subscribe() — BoundaryIndex attaches on createKernel()
        contract: BoundaryIndex receives every event synchronously before subscriber callbacks. 29 checks per event.
        failure_contract: InvariantViolationError thrown on hard invariant. Hard stop — never caught.
        latency_budget_ms: 1
        mock_available: false

      - id: INT-003
        name: persist → compress (dynamic import)
        from_module: persist
        to_module: compress
        type: function_call
        mechanism: dynamic import() at flush/recover time (TRDE-003)
        contract: Never imported at load time. compress provides snapshot(), restore() for flush/recover.
        failure_contract: "Dynamic import failure: { ok: false, error: 'compress_unavailable' }."
        latency_budget_ms: 10
        mock_available: true

      - id: INT-004
        name: version-gate → context (hydration)
        from_module: version-gate
        to_module: context
        type: function_call
        mechanism: kernel.createReplayContext(migratedArtifact)
        contract: validate() → migrate() → createReplayContext(). Always in this order. CI-1..CI-6 isolated.
        failure_contract: GateValidationError stops hydration. createReplayContext never called on invalid.
        latency_budget_ms: 5
        mock_available: true

      - id: INT-005
        name: ledger → observer (events)
        from_module: ledger
        to_module: observer
        type: event
        mechanism: ledger.on() / ledger.emit() — typed event subscription
        contract: Emits idea:recorded, idea:promoted, upgrade:committed, bottleneck. Zero bus coupling.
        failure_contract: If no observer wired — events silently dropped. Ledger continues normally.
        latency_budget_ms: 1
        mock_available: true


---

# interfaces — observability

<!-- imported: interfaces → observability -->


    observability:
      metrics:
        enabled: true
        format: custom
        endpoints: ["user-configured"]
        key_metrics:
          - name: ring_eviction_rate
            type: counter
            description: system:ring:evicted events per second. High rate = ring too small.
          - name: gate_execution_latency_ms
            type: histogram
            description: Time to run all gates per ingest. High = gate optimization needed.
          - name: invariant_violation_count
            type: counter
            description: InvariantViolationError throws per hour. Any > 0 = system failure.
          - name: forge_success_rate
            type: gauge
            description: Fraction of forge calls returning ok:true. < 0.8 = model/prompt issue.
          - name: wal_flush_latency_ms
            type: histogram
            description: WAL flush duration. > 100ms = backend I/O issue.
          - name: ledger_pending_ideas
            type: gauge
            description: Unresolved idea count. > 5 = bottleneck alert.
      tracing:
        enabled: false
        system: none
        sampling_rate: 0.0
      logging:
        format: json
        levels: [debug, info, warn, error]
        sink: [stdout]
        structured_fields:
          - ts
          - module
          - level
          - message
          - invariantId
          - eventId
      health:
        endpoint: ""
        response_schema:
          - field: ringSize
            type: number
            description: Current number of events in ring.
          - field: evictionRate
            type: number
            description: Evictions per second over last 60s.
          - field: invariantsPassing
            type: number
            description: Count of invariants passing (of 29).
          - field: ledgerPendingIdeas
            type: number
            description: Unresolved idea count.

  # ════════════════════════════════════════════════════════════════
  

---

# validation — gates

<!-- imported: validation → gates -->

# BLOCK 9 — VALIDATION
  # ════════════════════════════════════════════════════════════════
  validation:
    gates:
      - id: GATE-001
        name: no-circular-imports
        type: schema
        scope: full_spec
        trigger: on_patch
        severity: fatal
        enforces: [CONS-001]
        description: >
          Validates that no module imports from a higher layer. Foundation has zero imports.
          Causality imports only from foundation. Static analysis of import statements.
        check_logic: validation/no-circular-imports.js
        on_failure:
          action: rollback
          message_template: >
            LAYER VIOLATION: {module} in {layer} imports from {target_layer} (higher layer). DAG broken.
          log_to: [failures]

      - id: GATE-002
        name: ingest-pipeline-order
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-I1, INV-I2, INV-C4, INV-A2]
        description: >
          Continuously verifies: gates fire before listeners (C-4), no gate calls ingest() (A-2),
          every event has UUID v4 (I-1), contentHash stable for same payload (I-2).
          BoundaryIndex monitors all on every ingest.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: halt
          message_template: "INVARIANT VIOLATION {invariantId}: {message}. Hard stop."
          log_to: [failures, law_violations]

      - id: GATE-003
        name: causal-edge-declaration
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-C1, INV-C2, INV-C3]
        description: >
          Monitors C-1 (edgeType declared), C-2 (no macro:detected as kernel event),
          C-3 (traceToRoot uses only causal/* edges). BoundaryIndex on every event.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: halt
          message_template: "CAUSAL INVARIANT {invariantId}: {message}. edgeType: {edgeType}."
          log_to: [failures, law_violations]

      - id: GATE-004
        name: hostile-hardening-bounds
        type: invariant
        scope: continuous
        trigger: continuous
        severity: error
        enforces: [INV-H1, INV-H6]
        description: >
          H-1: edge graph bounded (edges <= ringCap * 2 after every eviction).
          H-6: seenMap bounded at MAX_SEEN_MAP=10,000. BoundaryIndex on every ingest and eviction.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: alert
          message_template: "MEMORY BOUND VIOLATION {invariantId}: edges={edgeCount} seenMap={seenMapSize}."
          log_to: [failures]

      - id: GATE-005
        name: test-suite-green
        type: coherence
        scope: full_spec
        trigger: on_patch
        severity: fatal
        enforces: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C3, INV-C4, INV-A2, INV-H1, INV-H6]
        description: >
          All 195 tests must pass after any patch. node test/runner.js exit code 0 required.
          Cross-domain invariant suite must be green.
        check_logic: test/runner.js
        on_failure:
          action: rollback
          message_template: "TEST SUITE FAILED: {failedCount}/195 failing after patch {patchId}. Rolled back."
          log_to: [failures]

      - id: GATE-006
        name: version-bump-semantic
        type: schema
        scope: patch_only
        trigger: on_patch
        severity: fatal
        enforces: [INV-VM1]
        description: >
          Every patch must include correct version bump: MAJOR for intent/invariant/interface changes,
          MINOR for new modules/invariants, PATCH for docs/notes.
        check_logic: validation/version-bump-semantic.js
        on_failure:
          action: rollback
          message_template: "VERSION BUMP MISMATCH: {change_type} requires {required_bump} not {actual_bump}."
          log_to: [failures]

      - id: GATE-007
        name: nex-artifact-validation
        type: invariant
        scope: affected_blocks
        trigger: on_patch
        severity: fatal
        enforces: [INV-VM1, CONS-004]
        description: >
          All .nex artifact hydration call sites must call versionGate.validate() first.
          Static analysis of restore, recoverStore, createReplayContext, clip.restore calls.
        check_logic: validation/nex-artifact-validation.js
        on_failure:
          action: rollback
          message_template: "VM-1 VIOLATION: {file}:{line} calls {hydrationFn} without version-gate. Rejected."
          log_to: [failures, law_violations]

      - id: GATE-008
        name: ledger-separation
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-L2, INV-L4, CONS-005]
        description: >
          L-2: UpgradeLedger and IdeaLedger never mixed. L-4: ideas promoted only via
          promoteIdea(). validateSeparation() after every promoteIdea(). LedgerError on violation.
        check_logic: modules/ledger/index.js (validateSeparation + promoteIdea gate)
        on_failure:
          action: halt
          message_template: "LEDGER INVARIANT {invariantId}: {message}. Truth ledger compromised. Halt."
          log_to: [failures, law_violations]


---

# validation — drift_detection

<!-- imported: validation → drift_detection -->


    drift_detection:
      enabled: true
      comparison_target: last_snapshot
      check_interval_s: 3600
      drift_threshold: 0.15
      auto_patch_proposal: false
      on_drift:
        below_threshold: log
        above_threshold: alert


---

# validation — static_analysis

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only


---

# validation — coverage

<!-- imported: validation → coverage -->


    coverage:
      min_module_gate_coverage: 0.95
      min_invariant_gate_coverage: 1.0
      warn_below: 0.90
      fail_below: 0.80

  # ════════════════════════════════════════════════════════════════
  

---

# snapshots

<!-- imported block: snapshots -->

# BLOCK 10 — SNAPSHOTS
  # ════════════════════════════════════════════════════════════════
  snapshots:
    - id: SNAP-001
      spec_version: 6.0.0
      timestamp: 2026-05-24T04:00:00Z
      trigger: manual
      state_hash: 7f3a1c9b4e2d0f8a6c5e3b1d9f7a2c0e4b8d6f1a3c7e5b2d0f4a8c6e3b9d1f
      prior_snapshot: ""
      delta_summary: >
        Initial spec encoding for causal-nexus v6.0.0. 21 modules declared across 5 layers.
        12 invariants declared and mapped to 8 gates. Guardian bridge interface declared.
        Ledger (v6 new) specified with L-1..L-4 coverage. nexus-topo identified as separate package.
      diff_ref: ""
      causal_delta:
        added: [kernel.ingest, adapter.bridge, ring.eviction, ledger.promoteIdea, version-gate.validate]
        removed: []
        modified: []
      modules_changed: [identity, time, causality, projection, lazy, kernel, adapter, adapter-sandbox, observer, enforcement, delta, query, compress, persist, version-gate, context, clip, sigma, forge, loader, ledger]
      invariants_status:
        - invariant_id: INV-I1
          status: passing
          gate_id: GATE-002
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-I2
          status: passing
          gate_id: GATE-002
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-C1
          status: passing
          gate_id: GATE-003
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-C2
          status: passing
          gate_id: GATE-003
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-C3
          status: passing
          gate_id: GATE-003
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-C4
          status: passing
          gate_id: GATE-002
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-A2
          status: passing
          gate_id: GATE-002
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-VM1
          status: passing
          gate_id: GATE-007
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-L2
          status: passing
          gate_id: GATE-008
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-L4
          status: passing
          gate_id: GATE-008
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-H1
          status: passing
          gate_id: GATE-004
          checked_at: 2026-05-24T04:00:00Z
        - invariant_id: INV-H6
          status: passing
          gate_id: GATE-004
          checked_at: 2026-05-24T04:00:00Z
      patch_ref: ""
      replay_tested: false
      replay_test_at: ""
      notes: >
        First machine-readable spec. Encoded from source code, README, module UUIDs,
        enforcement invariant registry, and ledger documentation.
        replay_tested:false is expected for the initial bootstrap snapshot — no prior
        WAL exists to replay against. First replay test will occur on SNAP-002.

  # ════════════════════════════════════════════════════════════════
  

---

# evolution log

<!-- imported block: evolution log -->

# BLOCK 11 — EVOLUTION LOG
  # ════════════════════════════════════════════════════════════════
  evolution_log:
    - id: EVOL-001
      timestamp: 2026-05-24T04:00:00Z
      spec_version_before: 0.0.0
      spec_version_after: 6.0.0
      change_type: [add_module, add_invariant, add_interface]
      author: claude-sonnet-4/spec-pipeline
      reason: >
        Initial .spec encoding for causal-nexus v6.0.0. Prior state: design documented only
        in source code comments, README, and enforcement module invariant registry.
        This spec makes all 12 declared invariants (from the 29 in enforcement), all 21 modules,
        the 5-layer DAG, the dual ledger (L-1..L-4), the version-gate axioms (VM-1..VM-6),
        and the Guardian bridge interface machine-readable, queryable, and pipeline-mutable.
        Blast radius is now computable without reading code.
      alternatives_considered:
        - option: Use README + JSDoc as the spec format.
          rejected_reason: >
            README covers narrative and API surface. JSDoc has no machine-parseable causal structure,
            no invariant declarations with enforcement gates, no blast radius computation.
        - option: OpenAPI for interfaces only.
          rejected_reason: >
            OpenAPI covers external HTTP only. causal-nexus's primary contracts are internal
            (kernel → causality, persist → compress dynamic import, ledger → observer).
            These require the internal interfaces block, not OpenAPI.
      affected_modules: [identity, time, causality, projection, lazy, kernel, adapter, adapter-sandbox, observer, enforcement, delta, query, compress, persist, version-gate, context, clip, sigma, forge, loader, ledger]
      affected_invariants: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C3, INV-C4, INV-A2, INV-VM1, INV-L2, INV-L4, INV-H1, INV-H6]
      causal_impact: >
        No runtime behavior change. Enables: pipeline-driven mutation, blast radius computation
        on any proposed change, drift detection against snapshots, invariant coverage verification
        (all 12 declared invariants have enforcing gates), machine-readable causal map.
      snapshot_ref: SNAP-001
      review_status: auto_approved
      reviewed_by: spec-schema-validator
      reviewed_at: 2026-05-24T04:00:00Z
