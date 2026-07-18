---
chunk_uuid: 1473f814-bb0c-4ffc-bef4-e26395b93bb1
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: modules-kernel
title: modules — kernel
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:modules-kernel
contract_id: spec-contract:05c58965:modules-kernel:1473f814
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:25.622Z
---

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
