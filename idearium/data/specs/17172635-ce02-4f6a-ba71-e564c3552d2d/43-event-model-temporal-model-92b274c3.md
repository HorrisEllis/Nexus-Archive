---
chunk_uuid: 92b274c3-adbc-4c86-bb82-95d05cd2f008
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:event-model-temporal-model
contract_id: spec-contract:17172635:event-model-temporal-model:92b274c3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.866Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  