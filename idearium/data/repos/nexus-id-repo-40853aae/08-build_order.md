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