---
chunk_uuid: 3849b92f-65c1-47e0-84d2-3b94712eea66
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:event-model-ring-buffer
contract_id: spec-contract:17172635:event-model-ring-buffer:3849b92f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.833Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
