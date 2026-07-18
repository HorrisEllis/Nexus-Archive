---
chunk_uuid: 3c472013-7ae2-4eac-8812-d728670821bb
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:architecture-control-flow
contract_id: spec-contract:c29c09a0:architecture-control-flow:3c472013
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:34.473Z
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
  