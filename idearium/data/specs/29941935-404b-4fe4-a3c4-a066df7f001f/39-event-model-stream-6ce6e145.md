---
chunk_uuid: 6ce6e145-574b-4f59-9d27-84c09c8e9663
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:event-model-stream
contract_id: spec-contract:29941935:event-model-stream:6ce6e145
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.867Z
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
