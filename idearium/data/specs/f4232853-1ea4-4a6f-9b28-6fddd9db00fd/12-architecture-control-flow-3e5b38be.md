---
chunk_uuid: 3e5b38be-0965-41ee-a4bb-65b36b6397cd
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:architecture-control-flow
contract_id: spec-contract:f4232853:architecture-control-flow:3e5b38be
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.242Z
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
  