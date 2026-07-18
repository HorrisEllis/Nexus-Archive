---
chunk_uuid: 1089efb1-5844-4cc5-a5a3-7c1fb9bafeea
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: causal-map-kernel-ingest
title: causal map — kernel.ingest
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:causal-map-kernel-ingest
contract_id: spec-contract:f9e0523f:causal-map-kernel-ingest:1089efb1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:23.332Z
---

<!-- imported: causal map → kernel.ingest -->

# BLOCK 5 — CAUSAL MAP
  # ════════════════════════════════════════════════════════════════
  causal_map:

    kernel.ingest:
      id: kernel.ingest
      type: trigger
      description: >
        Primary event ingestion. Runs the full 7-step pipeline: dedup → build+freeze →
        store+index → causal edge → macro projection → gates → listeners.
        Every event in the system originates here.
      source: kernel
      critical_path: true
      invariant_refs: [INV-I1, INV-I2, INV-C1, INV-C4, INV-A2]
      causes:
        - target: causality
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: Causal edge built and stored immediately after event freeze.
        - target: enforcement
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: BoundaryIndex checks all 29 invariants on every ingested event.
        - target: kernel
          mechanism: direct
          latency: "< 1ms"
          certainty: always
          condition: null
          description: All kernel.subscribe() callbacks notified after gate phase (C-4).
        - target: kernel
          mechanism: direct
          latency: "< 5ms"
          certainty: likely
          condition: At least one gate matches the event type.
          description: GateOutput[] collected atomically and re-ingested after gate phase (A-2).
        - target: persist
          mechanism: eventual
          latency: "< walFlushEvery events"
          certainty: always
          condition: null
          description: Event buffered to WAL. Flushed on walFlushEvery count.
      affects:
        - target: ring
          nature: creates
          reversible: false
          description: Event appended. Oldest evicted if at ringCap.
        - target: typeIndex
          nature: modifies
          reversible: false
          description: Event id added to typeIndex[type] Set.
        - target: causal_graph
          nature: creates
          reversible: false
          description: Edge created if causedBy provided.
        - target: macro_projection
          nature: modifies
          reversible: false
          description: Macro pattern count updated.
      risks:
        - id: RISK-CAUSAL-001
          description: Gate chain exceeds GATE_DEPTH_MAX=20. Recursive gate firing.
          probability: rare
          severity: critical
          mitigated_by: Kernel depth counter. At 20, throws with chain trace. Prevents infinite loop.
      blast_radius:
        modules: [kernel, causality, enforcement, persist, delta, query, compress, observer, ledger, projection]
        tables: []
        interfaces: [anthropic-api]
        invariants: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C4, INV-A2, INV-H1, INV-H6]
        max_depth: 4
        recomputed_at: 2026-05-24T04:00:00Z
