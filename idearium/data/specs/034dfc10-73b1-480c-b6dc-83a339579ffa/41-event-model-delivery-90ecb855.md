---
chunk_uuid: 90ecb855-d834-4f61-8982-56c9ee714918
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: event-model-delivery
title: event model — delivery
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:event-model-delivery
contract_id: spec-contract:034dfc10:event-model-delivery:90ecb855
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.861Z
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