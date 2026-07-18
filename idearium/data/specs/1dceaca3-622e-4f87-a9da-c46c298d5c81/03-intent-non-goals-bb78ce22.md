---
chunk_uuid: bb78ce22-7a29-42d2-928e-22834b12e958
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:intent-non-goals
contract_id: spec-contract:1dceaca3:intent-non-goals:bb78ce22
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:01:44.050Z
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
