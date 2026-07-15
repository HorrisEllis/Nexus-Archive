---
chunk_uuid: 185aae6c-8a5d-4dce-b0cf-23ec11acbc66
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:event-model-delivery
contract_id: spec-contract:a851a5dc:event-model-delivery:185aae6c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.607Z
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