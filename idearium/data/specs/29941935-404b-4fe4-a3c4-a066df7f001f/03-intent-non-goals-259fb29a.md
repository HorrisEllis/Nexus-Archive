---
chunk_uuid: 259fb29a-e639-4719-ad1c-2b63515013f9
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:intent-non-goals
contract_id: spec-contract:29941935:intent-non-goals:259fb29a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.620Z
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
