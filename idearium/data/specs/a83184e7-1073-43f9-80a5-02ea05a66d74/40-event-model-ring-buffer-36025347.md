---
chunk_uuid: 36025347-2043-4557-a1a6-f955424e1f37
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:event-model-ring-buffer
contract_id: spec-contract:a83184e7:event-model-ring-buffer:36025347
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:51.765Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
