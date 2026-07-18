---
chunk_uuid: c996faf6-e118-4a20-b87a-2d1712df417c
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:event-model-delivery
contract_id: spec-contract:913256f6:event-model-delivery:c996faf6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:23.791Z
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
