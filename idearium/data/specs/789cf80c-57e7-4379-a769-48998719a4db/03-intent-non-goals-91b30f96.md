---
chunk_uuid: 91b30f96-d0df-418e-b5b0-7d7391b46c78
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:intent-non-goals
contract_id: spec-contract:789cf80c:intent-non-goals:91b30f96
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:11.946Z
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
