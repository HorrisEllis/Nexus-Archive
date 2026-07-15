---
chunk_uuid: 79e90ee5-ed86-405e-99a2-c0aace0dfbb5
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:architecture-control-flow
contract_id: spec-contract:d9ee9fa1:architecture-control-flow:79e90ee5
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.240Z
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
  