---
chunk_uuid: 03cbba15-0889-4416-ab7a-007190c950f6
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:event-model-temporal-model
contract_id: spec-contract:913256f6:event-model-temporal-model:03cbba15
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:24.098Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  