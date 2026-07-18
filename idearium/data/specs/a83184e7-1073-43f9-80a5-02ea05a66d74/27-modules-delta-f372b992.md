---
chunk_uuid: f372b992-7b29-4f0c-9791-adea574f356f
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: modules-delta
title: modules — delta
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:modules-delta
contract_id: spec-contract:a83184e7:modules-delta:f372b992
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:47.813Z
---

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
