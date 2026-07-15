---
chunk_uuid: 41a766d2-16a4-418d-b282-6612c55b255d
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:event-model-ring-buffer
contract_id: spec-contract:a851a5dc:event-model-ring-buffer:41a766d2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.590Z
---

<!-- imported: event model → ring_buffer -->

ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true