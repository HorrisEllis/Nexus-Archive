---
chunk_uuid: be5d8a41-175a-4143-a71d-814d435e214c
spec_uuid: 92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651
section: build_order
title: Build Order
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:92a8bf9c:build_order
contract_id: spec-contract:92a8bf9c:build_order:be5d8a41
agent: ollama
model: unknown
status: complete
completed_at: 2026-07-12T06:58:46.818Z
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