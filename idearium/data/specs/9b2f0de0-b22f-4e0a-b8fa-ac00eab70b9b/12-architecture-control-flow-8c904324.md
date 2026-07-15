---
chunk_uuid: 8c904324-360a-4eb1-a947-91508caa8fe6
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:architecture-control-flow
contract_id: spec-contract:9b2f0de0:architecture-control-flow:8c904324
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.654Z
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
  