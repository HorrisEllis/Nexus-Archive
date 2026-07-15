---
chunk_uuid: 7acd5b37-f622-40f3-9312-fed8a8ed4b09
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:event-model-temporal-model
contract_id: spec-contract:1da21c43:event-model-temporal-model:7acd5b37
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.898Z
---

<!-- imported: event model → temporal_model -->

temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════