---
chunk_uuid: 8fcb4236-3815-477e-8fea-0270e40612c2
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: modules-context
title: modules — context
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:modules-context
contract_id: spec-contract:1dceaca3:modules-context:8fcb4236
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:02.323Z
---

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
