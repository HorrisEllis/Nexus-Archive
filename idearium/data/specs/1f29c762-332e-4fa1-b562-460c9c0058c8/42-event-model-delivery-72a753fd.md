---
chunk_uuid: 72a753fd-4534-4153-ac62-bb1f793f08fa
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:event-model-delivery
contract_id: spec-contract:1f29c762:event-model-delivery:72a753fd
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:24.385Z
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
