---
chunk_uuid: 06357ecb-40df-4a7c-8a94-76424a20c4bd
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:event-model-ring-buffer
contract_id: spec-contract:3951dfb7:event-model-ring-buffer:06357ecb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.033Z
---

<!-- imported: event model → ring_buffer -->

    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
