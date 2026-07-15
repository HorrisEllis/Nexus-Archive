---
chunk_uuid: 9496aff8-76ca-4e59-a03d-141a18e8a7be
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:event-model-delivery
contract_id: spec-contract:17172635:event-model-delivery:9496aff8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.855Z
---

<!-- imported: event model → delivery -->


    delivery:
      default_guarantee: at_least_once
      default_ordering: strict
      max_retries: 3
      retry_backoff_ms: 100
      dead_letter_table: dead_letter_events
      failure_handling:
        on_subscriber_crash: continue
        on_timeout_ms: 5000
