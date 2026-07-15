---
chunk_uuid: c45c42f6-e566-46f4-8f9e-e5758cf4cf5f
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:event-model-delivery
contract_id: spec-contract:f4232853:event-model-delivery:c45c42f6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.551Z
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
