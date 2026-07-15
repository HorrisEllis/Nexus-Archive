---
chunk_uuid: f47940f5-c163-43cf-bf60-eeed96404ab1
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:event-model-delivery
contract_id: spec-contract:9b2f0de0:event-model-delivery:f47940f5
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.952Z
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
