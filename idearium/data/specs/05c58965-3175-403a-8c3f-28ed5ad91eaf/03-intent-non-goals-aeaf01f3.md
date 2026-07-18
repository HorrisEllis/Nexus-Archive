---
chunk_uuid: aeaf01f3-7ca4-41fb-8f9f-d395e8e50ee0
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:intent-non-goals
contract_id: spec-contract:05c58965:intent-non-goals:aeaf01f3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:18.319Z
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
