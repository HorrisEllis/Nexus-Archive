---
chunk_uuid: e40bac87-c4aa-4d5e-b62b-a9a7d71e3ae0
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:event-model-delivery
contract_id: spec-contract:789cf80c:event-model-delivery:e40bac87
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:20.651Z
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
