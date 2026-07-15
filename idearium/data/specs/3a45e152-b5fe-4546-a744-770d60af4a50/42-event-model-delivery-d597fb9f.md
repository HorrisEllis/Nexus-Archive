---
chunk_uuid: d597fb9f-330d-4f1a-b883-76039e4ad5f8
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:event-model-delivery
contract_id: spec-contract:3a45e152:event-model-delivery:d597fb9f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.240Z
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
