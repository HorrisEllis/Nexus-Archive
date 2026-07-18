---
chunk_uuid: dcf4609f-f3d6-4473-963a-bbe92e106027
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:architecture-control-flow
contract_id: spec-contract:789cf80c:architecture-control-flow:dcf4609f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:13.923Z
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
  