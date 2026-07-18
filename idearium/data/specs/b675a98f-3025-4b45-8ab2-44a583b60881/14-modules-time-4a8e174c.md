---
chunk_uuid: 4a8e174c-8f38-45dd-9cc6-030bc4bcc365
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: modules-time
title: modules — time
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:modules-time
contract_id: spec-contract:b675a98f:modules-time:4a8e174c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:53:55.179Z
---

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
