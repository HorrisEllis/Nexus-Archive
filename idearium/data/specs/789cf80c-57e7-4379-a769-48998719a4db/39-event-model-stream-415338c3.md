---
chunk_uuid: 415338c3-a416-4ceb-90d6-0c3bdf6a1a88
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:event-model-stream
contract_id: spec-contract:789cf80c:event-model-stream:415338c3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:19.972Z
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
