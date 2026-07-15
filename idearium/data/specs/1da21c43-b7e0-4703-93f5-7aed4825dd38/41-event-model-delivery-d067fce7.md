---
chunk_uuid: d067fce7-28c7-4917-b5fd-ced59c8c07d4
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:event-model-delivery
contract_id: spec-contract:1da21c43:event-model-delivery:d067fce7
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.888Z
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