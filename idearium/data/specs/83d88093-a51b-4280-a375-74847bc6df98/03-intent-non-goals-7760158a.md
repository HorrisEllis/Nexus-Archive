---
chunk_uuid: 7760158a-ba82-4a95-950d-a65d9e8875f8
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:intent-non-goals
contract_id: spec-contract:83d88093:intent-non-goals:7760158a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:43.914Z
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
