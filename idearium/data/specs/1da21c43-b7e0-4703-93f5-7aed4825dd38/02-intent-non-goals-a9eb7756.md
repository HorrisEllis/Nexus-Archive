---
chunk_uuid: a9eb7756-db27-43b8-97c0-421e5a4ed177
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:intent-non-goals
contract_id: spec-contract:1da21c43:intent-non-goals:a9eb7756
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.475Z
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