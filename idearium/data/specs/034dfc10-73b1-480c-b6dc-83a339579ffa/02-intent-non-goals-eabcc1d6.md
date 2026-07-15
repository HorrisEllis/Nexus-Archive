---
chunk_uuid: eabcc1d6-7908-4b8d-adf4-f4428fe611bb
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:intent-non-goals
contract_id: spec-contract:034dfc10:intent-non-goals:eabcc1d6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.567Z
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