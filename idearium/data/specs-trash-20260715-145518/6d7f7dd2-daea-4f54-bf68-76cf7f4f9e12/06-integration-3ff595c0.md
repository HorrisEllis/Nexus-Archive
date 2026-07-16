---
chunk_uuid: 3ff595c0-19f2-4b98-bcfb-2f362421b380
spec_uuid: 6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12
section: integration
title: Integration Points
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:6d7f7dd2:integration
contract_id: spec-contract:6d7f7dd2:integration:3ff595c0
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:56:57.698Z
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