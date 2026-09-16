---
chunk_uuid: 1dd7f83f-5d7e-4351-92cb-30cc142d046c
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-452-nexus-loom-spec-loom-node-taxonomy-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/452-nexus-loom-spec-loom-node-taxonomy-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-452-nexus-loom-spec-loom-node-taxonomy-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-452-nexus-loom-spec-loom-node-taxonomy-md-md:1dd7f83f
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:18:08.716Z
---

# Node type → system map — Loom

Loom is different in kind from every other system mapped so far: it's not
a producer feeding into `component`/`hook`/`wire`/`node` via the scanner —
it **is** the scanner. Its own registry-components.js says it plainly:
"loom is THE registry authority (builds and maps NEXUS, owns the hook/wire/
component registry)."

## Legend
WRITES / READS / VIA LOOM / PARTICIPATES / NOT USED — same as Guardian/Versionium.

| Type | Status | Grounding |
|---|---|---|
| `component` | IS THE AUTHORITY, not "via" | `loom/schema/component.js`'s `COMPONENT_SCHEMA` is the real, central schema every other system's components are checked against. Loom doesn't get scanned into this — it defines it. |
| `hook` | IS THE AUTHORITY | `loom/schema/hook.js`'s `HOOK_SCHEMA`. |
| `wire` | IS THE AUTHORITY | `loom/schema/wire.js`'s `WIRE_SCHEMA`. |
| `node` | IS THE AUTHORITY | The generic component\|hook\|wire union itself is loom's own concept. |
| `capability` | WRITES — a real, notable fix | `loom/registry-components.js`'s own header: loom is "THE registry authority... and yet registered `components: []` and had no declaration file: 0 of its own capabilities in the registry. The mapmaker was not on the map." Fixed 2026-07-25 — loom now declares its own real routes into the same registry it authors for everyone else. |
| `command` | WRITES | Same registry, route-shaped entries (mirrored from loom's own `/health` route list). |
| `spec` | WRITES | `loom/spec/loom.spec`. |
| `system` | IS ONE | `loom` is a real, named system in `NEXUS_MAP.md` and `capability-map.js`'s `SYSTEMS` map — and simultaneously the thing that maintains that very map. |
| Everything else in the 32 | NOT CHECKED EXHAUSTIVELY | Loom's own scanner files (`source-map.js`, `spec-map.js`, `wiring-gaps.js`, `dangling-report.js`, `event-taxonomy-map.js`) weren't individually swept for every remaining type this pass. |