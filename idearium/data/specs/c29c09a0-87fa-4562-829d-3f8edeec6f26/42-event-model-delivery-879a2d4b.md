---
chunk_uuid: 879a2d4b-b22b-430b-8f74-936780968c9a
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:event-model-delivery
contract_id: spec-contract:c29c09a0:event-model-delivery:879a2d4b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:40.910Z
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
