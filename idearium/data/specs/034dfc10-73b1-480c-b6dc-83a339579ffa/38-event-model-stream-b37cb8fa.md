---
chunk_uuid: b37cb8fa-cdf7-4323-8318-226907489cf6
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:event-model-stream
contract_id: spec-contract:034dfc10:event-model-stream:b37cb8fa
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.835Z
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