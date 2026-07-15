---
chunk_uuid: 01fb4b44-3dca-4642-9822-abcac379eff0
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: architecture-communication
title: architecture — communication
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:architecture-communication
contract_id: spec-contract:d9ee9fa1:architecture-communication:01fb4b44
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.182Z
---

<!-- imported: architecture → communication -->

# BLOCK 3 — ARCHITECTURE
  # ════════════════════════════════════════════════════════════════
  architecture:
    type: modular
    description: >
      causal-nexus is organized as a strict DAG of 21 modules across 5 layers.
      No circular imports permitted. Lower layers (foundation, causality) have zero imports.
      All inter-module communication is via the kernel ring buffer and gate system.
      Guardian (external browser extension) communicates via the adapter bridge bus.
      One deliberate exception: persist uses dynamic import of compress at flush time (TRDE-003).

    communication:
      mechanisms:
        - kernel_ring_buffer
        - gate_system
        - adapter_bridge_bus
        - observer_bus
        - cql_query
        - anthropic_api
      primary: kernel_ring_buffer
      fallback: observer_bus
      prohibited:
        - mechanism: direct_import_across_layers
          reason: Cross-layer direct imports violate the DAG. CONS-001.
        - mechanism: ingest_inside_gate
          reason: Gates must not call kernel.ingest() directly (A-2, CONS-002).
