---
chunk_uuid: 20402d1b-ebf2-4dfa-a87f-941ea4921a6e
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:event-model-stream
contract_id: spec-contract:a851a5dc:event-model-stream:20402d1b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.581Z
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