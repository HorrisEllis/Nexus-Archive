---
chunk_uuid: 1df66243-c3b0-4c84-ba2a-01bc9e7a0cd2
spec_uuid: 2bb72761-023b-40fa-97c7-f33d0869c8c4
section: build_order
title: Build Order
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:2bb72761:build_order
contract_id: spec-contract:2bb72761:build_order:1df66243
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-11T07:53:14.727Z
---

Seeded deterministically from template `architecture` — no agent dispatched.

## Build Order

Bottom-up, §3.1 — each step must be PARSES-tier before the next starts:

1. `data/` schemas and fixtures — the shapes everything else is graded against
2. `lib/` shared utilities — zero dependency on anything above this line
3. `core/` kernel/runtime — boots on its own, no subsystem wired yet
4. Each subsystem module, one at a time, smallest unit first (§5.1)
5. `api/` routes — wires subsystems to HTTP, no UI dependency
6. `ui/` — talks only to `api/`, never reaches into `core/` or a subsystem directly
7. `docs/` — CHANGELOG and MANIFEST updated to match what was actually built,
   not what was planned

> Source: idearium/spec-engine/templates/architecture.spec § build_order