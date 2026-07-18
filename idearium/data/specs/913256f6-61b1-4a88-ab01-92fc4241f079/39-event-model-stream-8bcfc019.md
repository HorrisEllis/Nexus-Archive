---
chunk_uuid: 8bcfc019-44e8-482e-8ca3-7f84eb561050
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:event-model-stream
contract_id: spec-contract:913256f6:event-model-stream:8bcfc019
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:22.843Z
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
