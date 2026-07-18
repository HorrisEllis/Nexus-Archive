---
chunk_uuid: b3c8c84a-ab0d-499a-9ce5-139b8251928a
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:event-model-stream
contract_id: spec-contract:83d88093:event-model-stream:b3c8c84a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:50.270Z
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
