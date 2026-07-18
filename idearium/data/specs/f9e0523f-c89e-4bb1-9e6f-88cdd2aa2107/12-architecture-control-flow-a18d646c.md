---
chunk_uuid: a18d646c-8b5d-4c35-acc2-1426bd3a3242
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:architecture-control-flow
contract_id: spec-contract:f9e0523f:architecture-control-flow:a18d646c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:12.487Z
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
  