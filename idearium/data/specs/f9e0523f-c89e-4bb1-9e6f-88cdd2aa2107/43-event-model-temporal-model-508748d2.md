---
chunk_uuid: 508748d2-b4e0-4376-98a8-c32d0356f1ee
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:event-model-temporal-model
contract_id: spec-contract:f9e0523f:event-model-temporal-model:508748d2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:28.386Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  