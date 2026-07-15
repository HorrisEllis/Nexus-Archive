---
chunk_uuid: 51db66a2-b31c-411d-a77c-5557052ee4b1
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:event-model-temporal-model
contract_id: spec-contract:9b2f0de0:event-model-temporal-model:51db66a2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.960Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  