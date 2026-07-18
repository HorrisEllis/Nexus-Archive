---
chunk_uuid: 34eca5ac-98fc-463d-8a1c-847f07aa7c94
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:event-model-ring-buffer
contract_id: spec-contract:1f29c762:event-model-ring-buffer:34eca5ac
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:23.915Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
