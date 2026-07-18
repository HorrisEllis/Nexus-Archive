---
chunk_uuid: c740ad08-18e4-4e92-9da0-d38ab8a9b835
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:event-model-delivery
contract_id: spec-contract:a83184e7:event-model-delivery:c740ad08
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:52.390Z
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
