---
chunk_uuid: 1f3d73b5-5c3b-4fda-bfd4-65ec5463269b
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:event-model-delivery
contract_id: spec-contract:1dceaca3:event-model-delivery:1f3d73b5
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:10.634Z
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
