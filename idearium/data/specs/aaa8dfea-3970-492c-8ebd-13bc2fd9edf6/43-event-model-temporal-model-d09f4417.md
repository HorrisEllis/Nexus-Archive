---
chunk_uuid: d09f4417-c36f-4907-a4f9-d2463490bc67
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:event-model-temporal-model
contract_id: spec-contract:aaa8dfea:event-model-temporal-model:d09f4417
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:53.076Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  