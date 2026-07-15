---
chunk_uuid: 0a4da930-2485-4ff1-b1fd-cf7bb0ae9bc3
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:event-model-ring-buffer
contract_id: spec-contract:29941935:event-model-ring-buffer:0a4da930
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.875Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
