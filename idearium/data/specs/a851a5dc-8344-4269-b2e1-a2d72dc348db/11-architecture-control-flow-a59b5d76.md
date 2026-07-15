---
chunk_uuid: a59b5d76-a9ae-4c6b-abe9-38089e3e3955
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: architecture-control-flow
title: architecture — control_flow
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:architecture-control-flow
contract_id: spec-contract:a851a5dc:architecture-control-flow:a59b5d76
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.373Z
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