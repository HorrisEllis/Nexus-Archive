---
chunk_uuid: 9c00a6fd-c964-4673-873d-e8b82e6ea2fd
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: modules-adapter
title: modules — adapter
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:modules-adapter
contract_id: spec-contract:ac87dd93:modules-adapter:9c00a6fd
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.745Z
---

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