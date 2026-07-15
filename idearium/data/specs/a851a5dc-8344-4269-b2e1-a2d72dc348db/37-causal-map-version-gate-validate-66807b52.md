---
chunk_uuid: 66807b52-1f60-411e-987d-0344ba615f48
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: causal-map-version-gate-validate
title: causal map — version-gate.validate
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:causal-map-version-gate-validate
contract_id: spec-contract:a851a5dc:causal-map-version-gate-validate:66807b52
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.573Z
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