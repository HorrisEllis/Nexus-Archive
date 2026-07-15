---
chunk_uuid: b6e3834f-1377-427a-8d02-5a6ffc6425dd
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:intent-non-goals
contract_id: spec-contract:a851a5dc:intent-non-goals:b6e3834f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.327Z
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