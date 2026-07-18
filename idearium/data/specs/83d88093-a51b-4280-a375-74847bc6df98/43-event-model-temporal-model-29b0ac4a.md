---
chunk_uuid: 29b0ac4a-2677-46f4-83af-3475820051d2
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:event-model-temporal-model
contract_id: spec-contract:83d88093:event-model-temporal-model:29b0ac4a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:51.035Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  