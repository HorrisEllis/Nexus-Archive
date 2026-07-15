---
chunk_uuid: 90ecc228-c75c-43c0-8c89-8b8f9731b093
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:event-model-temporal-model
contract_id: spec-contract:034dfc10:event-model-temporal-model:90ecc228
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.872Z
---

<!-- imported: event model → temporal_model -->

temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════