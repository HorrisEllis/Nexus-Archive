---
chunk_uuid: 4a5dacd9-26f1-4c15-b854-bdb6e7ca56d1
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:architecture-control-flow
contract_id: spec-contract:ac87dd93:architecture-control-flow:4a5dacd9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.717Z
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