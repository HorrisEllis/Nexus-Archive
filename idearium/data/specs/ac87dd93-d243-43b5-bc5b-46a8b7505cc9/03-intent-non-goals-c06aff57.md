---
chunk_uuid: c06aff57-a09a-4e5f-8757-64c00b56e0d9
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:intent-non-goals
contract_id: spec-contract:ac87dd93:intent-non-goals:c06aff57
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.662Z
---

<!-- imported: intent → non_goals -->

    non_goals:
      - causal-nexus is not a message broker. It does not route events between services.
      - causal-nexus is not a database. Persistence is a WAL + archive, not ACID.
      - causal-nexus is not an AI model. forge dispatches to Anthropic API — it does not train.
      - causal-nexus does not replace version control. Blueprints supplement git, not replace it.
      - causal-nexus does not manage UI state. The ring is the source of truth, not a component store.
      - causal-nexus does not enforce application-level business logic. Gates are structural only.
      - nexus-topo (SISO/SNR) is a separate package. causal-nexus has no dependency on it.