---
chunk_uuid: f0f509e9-4013-4da8-88ca-8df63ee3a331
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: modules-version-gate
title: modules — version-gate
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:modules-version-gate
contract_id: spec-contract:913256f6:modules-version-gate:f0f509e9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:17.578Z
---

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

