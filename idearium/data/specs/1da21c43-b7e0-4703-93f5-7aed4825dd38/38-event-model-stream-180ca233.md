---
chunk_uuid: 180ca233-1884-407a-8dcb-09fb167d5728
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:event-model-stream
contract_id: spec-contract:1da21c43:event-model-stream:180ca233
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.860Z
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