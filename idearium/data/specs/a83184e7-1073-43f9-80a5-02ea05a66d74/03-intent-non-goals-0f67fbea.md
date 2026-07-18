---
chunk_uuid: 0f67fbea-0e34-4d59-8884-13fa7bdf9aa6
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:intent-non-goals
contract_id: spec-contract:a83184e7:intent-non-goals:0f67fbea
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:40.632Z
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
