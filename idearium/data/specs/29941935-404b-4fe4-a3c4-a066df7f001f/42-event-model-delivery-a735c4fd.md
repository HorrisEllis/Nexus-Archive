---
chunk_uuid: a735c4fd-5dc2-44df-9840-cdf5d19896ab
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:event-model-delivery
contract_id: spec-contract:29941935:event-model-delivery:a735c4fd
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.891Z
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
