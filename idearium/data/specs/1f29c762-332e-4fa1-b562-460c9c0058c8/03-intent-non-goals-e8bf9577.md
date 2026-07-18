---
chunk_uuid: e8bf9577-87ba-4417-be2b-2f447bbbde65
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:intent-non-goals
contract_id: spec-contract:1f29c762:intent-non-goals:e8bf9577
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:14.798Z
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
