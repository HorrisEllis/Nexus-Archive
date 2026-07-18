---
chunk_uuid: 3e67a9d8-8a75-44f7-9d49-c7a4a3b41c77
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:event-model-ring-buffer
contract_id: spec-contract:b675a98f:event-model-ring-buffer:3e67a9d8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:01.017Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
