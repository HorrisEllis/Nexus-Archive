---
chunk_uuid: 2815cb01-2463-4718-a86a-2de6b71e5ceb
spec_uuid: 2bb72761-023b-40fa-97c7-f33d0869c8c4
section: purpose
title: Purpose & Intent
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:2bb72761:purpose
contract_id: spec-contract:2bb72761:purpose:2815cb01
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:53:14.719Z
---

Seeded deterministically from template `compartments` — no agent dispatched.

## Purpose & Intent

A compartment is the smallest sovereign boundary in the system: one
folder, one seam, one gate. This spec exists to declare that boundary
set BEFORE any component inside a compartment is written, so the repo's
folder structure — and the rule for how compartments may talk to each
other — is fixed and promotable on day one, not discovered by an agent
mid-build.

For each compartment this idea needs, declare:

```
compartment "<name>"
  intent      = <one sentence: what this compartment owns and nothing else>
  seam        = compartments/<name>/seam.json   // isolation boundary declaration only
  gate        = gate-cross-compartment.js        // sole authorized cross-compartment path
  mounts      = <what this compartment registers on boot>
  depends_on  = <other compartment names, or none>
```

A compartment with no stated `intent` is not yet a compartment — it's an
unscoped folder, and GATE_BEFORE_CROSS has nothing to enforce a boundary
around.

> Source: idearium/spec-engine/templates/compartments.spec § purpose