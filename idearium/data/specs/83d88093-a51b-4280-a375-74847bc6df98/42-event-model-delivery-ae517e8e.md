---
chunk_uuid: ae517e8e-d45d-4d62-980e-a7d17e66d714
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:event-model-delivery
contract_id: spec-contract:83d88093:event-model-delivery:ae517e8e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:50.822Z
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
