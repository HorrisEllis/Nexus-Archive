---
chunk_uuid: 4173fa49-49d0-4d1e-a895-aa3eb08f47b0
spec_uuid: 92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651
section: purpose
title: Purpose & Intent
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:92a8bf9c:purpose
contract_id: spec-contract:92a8bf9c:purpose:4173fa49
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-12T06:58:46.812Z
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