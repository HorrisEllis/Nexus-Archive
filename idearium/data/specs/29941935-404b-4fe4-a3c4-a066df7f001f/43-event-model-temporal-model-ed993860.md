---
chunk_uuid: ed993860-8815-4c59-aee3-4ec2f2572668
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:event-model-temporal-model
contract_id: spec-contract:29941935:event-model-temporal-model:ed993860
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.899Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  