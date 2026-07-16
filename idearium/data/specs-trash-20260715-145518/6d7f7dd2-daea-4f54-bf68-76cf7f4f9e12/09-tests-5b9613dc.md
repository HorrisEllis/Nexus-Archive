---
chunk_uuid: 5b9613dc-ef8a-43ee-87bf-b4b086b3dd84
spec_uuid: 6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12
section: tests
title: Tests & Verification
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:6d7f7dd2:tests
contract_id: spec-contract:6d7f7dd2:tests:5b9613dc
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:56:57.700Z
---

Seeded deterministically from template `checklists` — no agent dispatched.

## Tests & Verification

Evidence tiers, in order — a component is only as done as its highest
PROVEN tier, not its highest claimed one:

- [ ] **PARSES** — the file loads without a syntax/import error
- [ ] **BOOTS** — the module initializes without throwing
- [ ] **SERVING** — it responds to at least one real call end-to-end
- [ ] **HEALTHY** — it responds correctly under its stated normal load
- [ ] **CONTRACT** — every claim in this spec's other sections (schema,
      API, events) has a passing test asserting it, not just a
      manual check

Per-component checklist:

- [ ] Every function/route has at least one test exercising it
- [ ] Every declared failure mode (see below) has a test that
      deliberately triggers it and asserts the failure is loud (§1.2)
- [ ] No stub, mock, or placeholder ships in the path marked production
      (§1.3)
- [ ] Test suite actually runs — a suite that fails to execute is not
      evidence of anything, tier PARSES included

> Source: idearium/spec-engine/templates/checklists.spec § tests