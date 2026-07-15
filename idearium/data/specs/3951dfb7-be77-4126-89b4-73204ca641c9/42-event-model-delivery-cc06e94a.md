---
chunk_uuid: cc06e94a-3972-4884-baac-f457df2655c5
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:event-model-delivery
contract_id: spec-contract:3951dfb7:event-model-delivery:cc06e94a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.051Z
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
