---
chunk_uuid: b833c947-1fed-42cf-b604-9e3244a17fc5
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:event-model-temporal-model
contract_id: spec-contract:9d4b9a4e:event-model-temporal-model:b833c947
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.917Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  