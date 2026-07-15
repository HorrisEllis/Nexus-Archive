---
chunk_uuid: 0fe25efd-608e-47c5-9b30-6aae291c1d75
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: architecture-communication
title: architecture — communication
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:architecture-communication
contract_id: spec-contract:f4232853:architecture-communication:0fe25efd
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.222Z
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
