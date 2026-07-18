---
chunk_uuid: c43815c0-d87d-43bd-8fae-c9de10386fc4
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:architecture-control-flow
contract_id: spec-contract:1f29c762:architecture-control-flow:c43815c0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:17.021Z
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
  