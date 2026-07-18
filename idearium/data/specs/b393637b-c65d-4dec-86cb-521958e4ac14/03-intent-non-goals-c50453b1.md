---
chunk_uuid: c50453b1-9d43-4780-8450-e4e9976512e9
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:intent-non-goals
contract_id: spec-contract:b393637b:intent-non-goals:c50453b1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:05.383Z
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
