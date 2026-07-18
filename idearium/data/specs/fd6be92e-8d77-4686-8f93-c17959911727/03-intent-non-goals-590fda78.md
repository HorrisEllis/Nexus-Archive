---
chunk_uuid: 590fda78-88a3-456c-9b27-7f11daea9487
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:intent-non-goals
contract_id: spec-contract:fd6be92e:intent-non-goals:590fda78
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:21:36.792Z
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
