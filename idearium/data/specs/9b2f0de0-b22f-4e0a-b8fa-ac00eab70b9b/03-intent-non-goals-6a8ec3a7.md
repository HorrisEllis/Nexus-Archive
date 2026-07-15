---
chunk_uuid: 6a8ec3a7-0b19-457b-aa61-272da9d22a8e
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:intent-non-goals
contract_id: spec-contract:9b2f0de0:intent-non-goals:6a8ec3a7
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.595Z
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
