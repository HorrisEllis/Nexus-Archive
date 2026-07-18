---
chunk_uuid: a67730eb-5205-4a47-8748-e71cd3748a4b
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:event-model-delivery
contract_id: spec-contract:b675a98f:event-model-delivery:a67730eb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:01.515Z
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
