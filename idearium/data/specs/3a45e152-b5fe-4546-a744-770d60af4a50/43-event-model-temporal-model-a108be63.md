---
chunk_uuid: a108be63-45f5-4b81-97f1-b80b82e3e805
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:event-model-temporal-model
contract_id: spec-contract:3a45e152:event-model-temporal-model:a108be63
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.252Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  