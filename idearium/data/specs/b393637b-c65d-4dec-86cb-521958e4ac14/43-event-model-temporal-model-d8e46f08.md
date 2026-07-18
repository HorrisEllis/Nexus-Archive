---
chunk_uuid: d8e46f08-9545-41ce-bae9-035184380220
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:event-model-temporal-model
contract_id: spec-contract:b393637b:event-model-temporal-model:d8e46f08
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:13.256Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  