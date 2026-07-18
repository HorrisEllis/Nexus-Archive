---
chunk_uuid: 2fd53cde-3695-4de9-a7b8-92fb0d96e8d1
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:event-model-temporal-model
contract_id: spec-contract:789cf80c:event-model-temporal-model:2fd53cde
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:20.898Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  