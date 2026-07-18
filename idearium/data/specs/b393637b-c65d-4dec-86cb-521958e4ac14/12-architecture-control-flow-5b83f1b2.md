---
chunk_uuid: 5b83f1b2-35f1-4369-a632-fcec973b63fa
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:architecture-control-flow
contract_id: spec-contract:b393637b:architecture-control-flow:5b83f1b2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:07.132Z
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
  