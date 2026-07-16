---
chunk_uuid: d17bafed-9838-49eb-861f-546cd6104fcf
spec_uuid: 3bbafe9b-0323-4ea8-adb2-df82e2b21024
section: purpose
title: Purpose & Intent
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3bbafe9b:purpose
contract_id: spec-contract:3bbafe9b:purpose:d17bafed
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T10:02:48.641Z
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