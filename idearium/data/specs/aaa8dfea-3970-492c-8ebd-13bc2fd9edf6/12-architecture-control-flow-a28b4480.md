---
chunk_uuid: a28b4480-7d57-4884-9e50-c4d323646a99
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:architecture-control-flow
contract_id: spec-contract:aaa8dfea:architecture-control-flow:a28b4480
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:44.488Z
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
  