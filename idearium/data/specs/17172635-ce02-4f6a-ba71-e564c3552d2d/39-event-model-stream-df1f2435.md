---
chunk_uuid: df1f2435-e2e1-428d-a816-c693cc707b32
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:event-model-stream
contract_id: spec-contract:17172635:event-model-stream:df1f2435
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.822Z
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
