---
chunk_uuid: 7aaaab5e-1d68-48b2-b9d1-76e9e8ac3fbd
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:intent-non-goals
contract_id: spec-contract:aaa8dfea:intent-non-goals:7aaaab5e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:41.484Z
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
