---
chunk_uuid: c57ebdbf-5a4f-4231-82f5-9089342a1234
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:event-model-ring-buffer
contract_id: spec-contract:c29c09a0:event-model-ring-buffer:c57ebdbf
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:40.493Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
