---
chunk_uuid: dcd85f16-2c55-40ed-aa3b-dd6609d117de
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:intent-non-goals
contract_id: spec-contract:c29c09a0:intent-non-goals:dcd85f16
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:32.538Z
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
