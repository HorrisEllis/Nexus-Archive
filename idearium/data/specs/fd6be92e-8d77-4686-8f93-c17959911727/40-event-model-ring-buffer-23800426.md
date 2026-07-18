---
chunk_uuid: 23800426-d0d6-4d2e-abca-d18f4f5a9f9b
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:event-model-ring-buffer
contract_id: spec-contract:fd6be92e:event-model-ring-buffer:23800426
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:21:59.189Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
