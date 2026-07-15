---
chunk_uuid: 24be5f34-ec80-4099-be09-9a3599e36e1e
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:event-model-delivery
contract_id: spec-contract:9d4b9a4e:event-model-delivery:24be5f34
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.909Z
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
