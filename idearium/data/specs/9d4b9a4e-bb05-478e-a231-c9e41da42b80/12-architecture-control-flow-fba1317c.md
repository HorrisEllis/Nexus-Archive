---
chunk_uuid: fba1317c-ed46-4506-b447-8d8631b89609
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:architecture-control-flow
contract_id: spec-contract:9d4b9a4e:architecture-control-flow:fba1317c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.688Z
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
  