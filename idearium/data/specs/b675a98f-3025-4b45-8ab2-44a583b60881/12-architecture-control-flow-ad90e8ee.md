---
chunk_uuid: ad90e8ee-8288-4db2-9453-e0e9e44be144
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:architecture-control-flow
contract_id: spec-contract:b675a98f:architecture-control-flow:ad90e8ee
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:53:54.761Z
---

<!-- imported: architecture → control_flow -->


    control_flow:
      model: reactive
      orchestration: decentralized
      tick_driven: false
      tick_rate_note: >
        Event-driven only. No global timer. WAL flush triggered by event count.
        callto TTL expiry if calltoTtlTicks enabled.

    topology_notes: >
      GATE_DEPTH_MAX=20 prevents infinite gate chains. Dynamic import of compress inside
      persist avoids the circular dependency — the only dynamic import in the module graph.
      query._typeIndex coupling is the only _ access crossing a module boundary; documented
      and must be audited if kernel's internal typeIndex shape changes.

  # ════════════════════════════════════════════════════════════════
  