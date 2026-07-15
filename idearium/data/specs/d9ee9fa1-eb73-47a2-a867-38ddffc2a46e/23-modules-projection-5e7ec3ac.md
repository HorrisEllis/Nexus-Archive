---
chunk_uuid: 5e7ec3ac-8045-4552-b22e-427589917b05
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: modules-projection
title: modules — projection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:modules-projection
contract_id: spec-contract:d9ee9fa1:modules-projection:5e7ec3ac
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.330Z
---

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
