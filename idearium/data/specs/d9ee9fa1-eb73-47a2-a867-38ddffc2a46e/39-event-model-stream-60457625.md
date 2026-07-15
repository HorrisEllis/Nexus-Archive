---
chunk_uuid: 60457625-94a9-49eb-ac4a-80f560745cc8
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:event-model-stream
contract_id: spec-contract:d9ee9fa1:event-model-stream:60457625
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.535Z
---

<!-- imported: event model → stream -->

# BLOCK 6 — EVENT MODEL
  # ════════════════════════════════════════════════════════════════
  event_model:
    stream:
      type: ring_buffer
      capacity: 5000000
      ordered: true
      durable: false
      replay_enabled: true
      overflow_policy: drop_oldest
      index_type: logical_tick
