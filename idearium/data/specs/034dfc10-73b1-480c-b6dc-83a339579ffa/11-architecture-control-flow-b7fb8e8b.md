---
chunk_uuid: b7fb8e8b-7979-493a-a058-12a3d968ffa8
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:architecture-control-flow
contract_id: spec-contract:034dfc10:architecture-control-flow:b7fb8e8b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.612Z
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