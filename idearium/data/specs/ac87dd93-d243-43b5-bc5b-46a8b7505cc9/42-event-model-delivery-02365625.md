---
chunk_uuid: 02365625-b5f9-485f-bba4-8cde6ff3b625
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:event-model-delivery
contract_id: spec-contract:ac87dd93:event-model-delivery:02365625
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.941Z
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