---
chunk_uuid: e66d0cd7-2714-47e6-a035-4070fdd5c5e9
spec_uuid: fa21d828-0e60-4516-9ca4-51c6056b1ff1
section: purpose
title: Purpose & Intent
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fa21d828:purpose
contract_id: spec-contract:fa21d828:purpose:e66d0cd7
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T10:02:57.566Z
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