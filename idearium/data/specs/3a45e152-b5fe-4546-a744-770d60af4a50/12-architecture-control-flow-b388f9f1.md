---
chunk_uuid: b388f9f1-635d-481e-962c-85ae1c5aa873
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:architecture-control-flow
contract_id: spec-contract:3a45e152:architecture-control-flow:b388f9f1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:12.976Z
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
  