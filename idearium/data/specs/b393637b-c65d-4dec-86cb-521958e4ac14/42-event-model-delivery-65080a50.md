---
chunk_uuid: 65080a50-55f4-4afe-afda-4019658a6316
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:event-model-delivery
contract_id: spec-contract:b393637b:event-model-delivery:65080a50
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:13.062Z
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
