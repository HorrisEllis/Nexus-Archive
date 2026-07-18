---
chunk_uuid: e6ad2a28-b001-4c78-90d1-b47d823848c9
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:event-model-delivery
contract_id: spec-contract:aaa8dfea:event-model-delivery:e6ad2a28
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:52.743Z
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
