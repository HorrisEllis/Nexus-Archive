---
chunk_uuid: 5938b521-4d30-4894-bdcd-860480fca8d9
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:event-model-stream
contract_id: spec-contract:fd6be92e:event-model-stream:5938b521
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:21:58.602Z
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
