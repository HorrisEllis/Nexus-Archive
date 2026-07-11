---
chunk_uuid: ace6c012-24a7-4597-9bb9-d890ca2cd2df
spec_uuid: 43a8b111-795d-4b01-b1ad-b4dde860f392
section: integration
title: Integration Points
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:43a8b111:integration
contract_id: spec-contract:43a8b111:integration:ace6c012
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T08:42:46.326Z
---

Seeded deterministically from template `compartments` — no agent dispatched.

## Integration Points

**The map-first rule**: this spec is designed to be promoted
(`spec.promote`, `mode:'manual'`) the moment its meta/purpose/axioms/
integration chunks are seeded — before schema, api, events, or any
component code exists. That promotion creates the repository's real
folder skeleton (one folder per declared compartment, each holding a
`seam.json` stub and referencing the shared `gate-cross-compartment.js`)
with every other section marked TODO. Subsequent specs — one per
compartment, or one per component — promote INTO that same repository
(`parent: <this idea's uuid>`), filling in what the map only outlined.

Rules enforced at the gate, not just documented here:

- **GATE_BEFORE_CROSS** — no compartment reaches another except through
  `gate-cross-compartment.js`; a direct import across compartment
  folders is a violation to flag, not a shortcut to take.
- **NOTHING_INLINE** — no cross-compartment call is ever hand-wired.
- **SEAM_IS_DUMB** — a seam declares a boundary only: no ports, no
  direction, no methods of its own.
- Every cross-compartment call, pass or reject, emits an event — the
  gate is observable, not a silent pass-through.

> Source: idearium/spec-engine/templates/compartments.spec § integration