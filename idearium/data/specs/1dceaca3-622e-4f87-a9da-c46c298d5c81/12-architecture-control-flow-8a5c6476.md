---
chunk_uuid: 8a5c6476-33ec-4c9b-b702-32f8fa1dbb03
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:architecture-control-flow
contract_id: spec-contract:1dceaca3:architecture-control-flow:8a5c6476
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:01:49.970Z
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
  