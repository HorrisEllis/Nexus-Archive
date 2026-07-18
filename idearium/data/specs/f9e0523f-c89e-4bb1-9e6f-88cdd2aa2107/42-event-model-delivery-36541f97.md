---
chunk_uuid: 36541f97-82a0-4fad-bb7b-b472bbb50118
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:event-model-delivery
contract_id: spec-contract:f9e0523f:event-model-delivery:36541f97
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:27.649Z
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
