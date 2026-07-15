---
chunk_uuid: 7808f46d-a0dc-4496-8181-341c5a013682
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: causal-map-version-gate-validate
title: causal map — version-gate.validate
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:causal-map-version-gate-validate
contract_id: spec-contract:ac87dd93:causal-map-version-gate-validate:7808f46d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.908Z
---

<!-- imported: causal map → version-gate.validate -->

    version-gate.validate:
      id: version-gate.validate
      type: trigger
      description: >
        VM-1 enforcement. All .nex hydration passes through here. validate() → migrate()
        must be called in sequence. GateValidationError thrown on mismatch. Hard stop.
      source: version-gate
      critical_path: true
      invariant_refs: [INV-VM1]
      causes:
        - target: version-gate
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: migrate() called immediately after validate().
        - target: context
          mechanism: direct
          latency: "< 5ms"
          certainty: likely
          condition: Validation passes. Version-compatible.
          description: kernel.createReplayContext(migratedArtifact) called. Replay begins.
      affects:
        - target: kernel_ring
          nature: creates
          reversible: false
          description: Hydrated events loaded into fresh kernel ring on restore.
      risks:
        - id: RISK-CAUSAL-005
          description: Component bypasses version-gate and hydrates raw artifact directly.
          probability: rare
          severity: critical
          mitigated_by: VM-1 documented as axiom. BoundaryIndex monitors VM-1 invariant.
      blast_radius:
        modules: [version-gate, context, kernel, persist]
        tables: []
        interfaces: []
        invariants: [INV-VM1]
        max_depth: 3
        recomputed_at: 2026-05-24T04:00:00Z

  # ════════════════════════════════════════════════════════════════