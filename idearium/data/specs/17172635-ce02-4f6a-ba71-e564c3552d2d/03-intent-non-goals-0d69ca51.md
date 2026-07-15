---
chunk_uuid: 0d69ca51-6443-43fe-a20e-28006355c432
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:intent-non-goals
contract_id: spec-contract:17172635:intent-non-goals:0d69ca51
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.448Z
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
