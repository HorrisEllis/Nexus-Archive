---
chunk_uuid: fd776ee8-bca1-4fa6-b3d1-de157551cd29
spec_uuid: d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0
section: schema
title: Data Schema
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d6b942ea:schema
contract_id: spec-contract:d6b942ea:schema:fd776ee8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-11T01:10:28.645Z
---

<!-- imported block: modules -->

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