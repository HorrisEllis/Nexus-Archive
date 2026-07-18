---
chunk_uuid: a413b32a-a9af-4716-a5e9-6548cd6b3866
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:event-model-ring-buffer
contract_id: spec-contract:913256f6:event-model-ring-buffer:a413b32a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:23.158Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
