---
chunk_uuid: 14363096-4a99-4f79-b6d3-2d1a7f683937
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:event-model-ring-buffer
contract_id: spec-contract:3a45e152:event-model-ring-buffer:14363096
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.218Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
