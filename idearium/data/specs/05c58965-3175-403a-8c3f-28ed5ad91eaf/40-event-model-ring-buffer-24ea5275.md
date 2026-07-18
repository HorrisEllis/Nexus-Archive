---
chunk_uuid: 24ea5275-e95f-4343-99a2-f0f8ec0f9f0d
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:event-model-ring-buffer
contract_id: spec-contract:05c58965:event-model-ring-buffer:24ea5275
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:38.543Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
