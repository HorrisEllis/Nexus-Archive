---
chunk_uuid: 4f5d6fb5-2866-48ea-a5cd-259729e881d2
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:architecture-control-flow
contract_id: spec-contract:a83184e7:architecture-control-flow:4f5d6fb5
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:43.504Z
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
  