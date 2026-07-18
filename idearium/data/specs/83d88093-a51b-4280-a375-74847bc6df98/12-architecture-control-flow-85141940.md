---
chunk_uuid: 85141940-d736-4e47-9ba0-60a6a26a012a
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:architecture-control-flow
contract_id: spec-contract:83d88093:architecture-control-flow:85141940
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:45.492Z
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
  