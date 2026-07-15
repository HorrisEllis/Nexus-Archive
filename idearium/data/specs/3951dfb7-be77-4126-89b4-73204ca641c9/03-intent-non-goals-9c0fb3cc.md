---
chunk_uuid: 9c0fb3cc-68cc-4f36-a73b-d7d754bcaa05
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:intent-non-goals
contract_id: spec-contract:3951dfb7:intent-non-goals:9c0fb3cc
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:37.774Z
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
