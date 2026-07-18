---
chunk_uuid: ba545212-0113-4c40-99c2-0989b7599aba
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:intent-non-goals
contract_id: spec-contract:b675a98f:intent-non-goals:ba545212
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:53:52.825Z
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
