---
chunk_uuid: 41d1350a-6839-4a6b-8dce-24df788cda5e
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:intent-non-goals
contract_id: spec-contract:3a45e152:intent-non-goals:41d1350a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:12.863Z
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
