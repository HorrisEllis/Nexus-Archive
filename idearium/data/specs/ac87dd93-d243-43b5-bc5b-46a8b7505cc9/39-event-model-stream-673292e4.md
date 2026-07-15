---
chunk_uuid: 673292e4-9f37-4996-9bfd-58c66dd04c7b
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:event-model-stream
contract_id: spec-contract:ac87dd93:event-model-stream:673292e4
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.917Z
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