---
chunk_uuid: 9ecc1c1a-c100-4b00-b09c-c3c2925ed73b
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:event-model-stream
contract_id: spec-contract:9b2f0de0:event-model-stream:9ecc1c1a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.922Z
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
