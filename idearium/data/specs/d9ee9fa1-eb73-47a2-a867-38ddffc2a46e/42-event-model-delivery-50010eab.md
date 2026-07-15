---
chunk_uuid: 50010eab-03c8-469c-98b2-8ca55790fc00
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:event-model-delivery
contract_id: spec-contract:d9ee9fa1:event-model-delivery:50010eab
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.570Z
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
