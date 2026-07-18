---
chunk_uuid: 713c400a-81a3-4724-a9d0-4d1b8df9d77c
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: modules-clip
title: modules — clip
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:modules-clip
contract_id: spec-contract:aaa8dfea:modules-clip:713c400a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:49.671Z
---

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
