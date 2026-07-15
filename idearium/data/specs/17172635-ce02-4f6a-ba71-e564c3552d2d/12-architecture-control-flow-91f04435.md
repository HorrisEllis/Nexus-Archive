---
chunk_uuid: 91f04435-759d-426b-9e4e-83c4a6bb604f
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:architecture-control-flow
contract_id: spec-contract:17172635:architecture-control-flow:91f04435
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.521Z
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
  