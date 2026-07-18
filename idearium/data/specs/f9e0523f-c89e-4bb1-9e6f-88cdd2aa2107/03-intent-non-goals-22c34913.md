---
chunk_uuid: 22c34913-7f09-4fa8-b9ec-02dca014fa94
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:intent-non-goals
contract_id: spec-contract:f9e0523f:intent-non-goals:22c34913
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:08.015Z
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
