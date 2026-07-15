---
chunk_uuid: 9aeb18a1-eca3-4c10-aeeb-36dd70f391a7
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:intent-non-goals
contract_id: spec-contract:f4232853:intent-non-goals:9aeb18a1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.157Z
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
