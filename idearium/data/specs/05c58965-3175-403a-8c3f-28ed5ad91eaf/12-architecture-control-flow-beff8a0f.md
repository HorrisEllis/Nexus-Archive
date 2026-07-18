---
chunk_uuid: beff8a0f-b401-45ca-bb47-457ba4de3236
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:architecture-control-flow
contract_id: spec-contract:05c58965:architecture-control-flow:beff8a0f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:23.395Z
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
  