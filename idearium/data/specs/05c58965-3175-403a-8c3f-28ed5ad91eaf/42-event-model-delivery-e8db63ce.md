---
chunk_uuid: e8db63ce-780d-4f89-bb6b-b9757b0ed7bc
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:event-model-delivery
contract_id: spec-contract:05c58965:event-model-delivery:e8db63ce
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:39.634Z
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
