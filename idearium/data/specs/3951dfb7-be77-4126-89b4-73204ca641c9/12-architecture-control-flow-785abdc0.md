---
chunk_uuid: 785abdc0-9564-4934-91cf-df179a393469
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:architecture-control-flow
contract_id: spec-contract:3951dfb7:architecture-control-flow:785abdc0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:37.826Z
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
  