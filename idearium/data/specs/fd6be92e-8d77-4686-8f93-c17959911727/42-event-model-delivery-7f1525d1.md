---
chunk_uuid: 7f1525d1-892b-4ae3-af62-bb5a72045a1e
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:event-model-delivery
contract_id: spec-contract:fd6be92e:event-model-delivery:7f1525d1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:00.447Z
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
