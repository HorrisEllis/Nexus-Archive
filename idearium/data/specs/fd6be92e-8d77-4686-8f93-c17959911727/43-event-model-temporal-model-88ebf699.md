---
chunk_uuid: 88ebf699-b894-4d88-95a3-665212190984
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:event-model-temporal-model
contract_id: spec-contract:fd6be92e:event-model-temporal-model:88ebf699
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:01.055Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  