---
chunk_uuid: d09a86b3-eb87-4248-8cf0-7f681c2aec2f
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: intent-non-goals
title: intent — non_goals
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:intent-non-goals
contract_id: spec-contract:9d4b9a4e:intent-non-goals:d09a86b3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.635Z
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
