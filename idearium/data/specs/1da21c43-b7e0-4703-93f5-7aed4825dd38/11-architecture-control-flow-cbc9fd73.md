---
chunk_uuid: cbc9fd73-a5d5-48ca-8f41-5b5a930c4899
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:architecture-control-flow
contract_id: spec-contract:1da21c43:architecture-control-flow:cbc9fd73
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.548Z
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