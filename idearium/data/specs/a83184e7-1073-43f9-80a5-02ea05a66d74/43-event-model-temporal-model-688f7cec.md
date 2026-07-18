---
chunk_uuid: 688f7cec-ccc6-4666-abac-bd6b0d598c16
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:event-model-temporal-model
contract_id: spec-contract:a83184e7:event-model-temporal-model:688f7cec
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:52.692Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  