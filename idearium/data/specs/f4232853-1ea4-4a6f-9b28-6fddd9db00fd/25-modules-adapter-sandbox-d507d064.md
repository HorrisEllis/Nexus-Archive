---
chunk_uuid: d507d064-bed1-4481-8bcd-a2163d7474c7
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: modules-adapter-sandbox
title: modules — adapter-sandbox
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:modules-adapter-sandbox
contract_id: spec-contract:f4232853:modules-adapter-sandbox:d507d064
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.326Z
---

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
