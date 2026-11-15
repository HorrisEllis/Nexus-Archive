# Nexus 0.39.277

**NEXUS 0.39.277: staging C0 + C1 in the full tree; the graph/build map revised for sovereignty**

| | |
|---|---|
| Built | 2026-09-29 01:34:56 → 2026-09-29 01:34:56 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.277 |
| Tag | `v0.39.277` → snap-0709 |
| Full file ledger | [LEDGER-0.39.277.csv](../ledger/LEDGER-0.39.277.csv) |

## Release notes — `CHANGELOG-0.39.277.md`

Copied unchanged from the build.

### NEXUS 0.39.277: staging C0 + C1 in the full tree; the graph/build map revised for sovereignty

**Date:** 2026-09-29 · base: 0.39.276 · PATCH: no new route

James: *"just know every system should be sovereign self contained."* · *"here current versions."* (0.39.276 plus the
C0 and C1 overlay zips)

#### Merged: staging-self-heal C0 and C1

C0 (cfr.collapse → a gap anchored to its ledger entry) and C1 (compound failure mode, chain-scoped, under its own
key) were delivered as overlays built on 0.39.274. Every code file they touch — orchestrator/orchestrator.js,
cortex/self-heal/index.js, cortex/self-heal/failure-mode-forensics.js, the failure_mode and debug_macro schemas
(cortex/schemas and lib/node-schemas), tests/modules/run-all.js — is byte-identical in 0.39.274 and 0.39.276, so
C1 (which contains C0) applies to 0.39.276 unchanged. C1's copy of docs/2026-09-28-staging-self-heal-phasemap.spec
(C0, C1 closed) replaces the mapped-only copy.

Proof in this tree: test-c0-cfr-collapse-anchor 3/3, test-c1-compound-failure-mode 12/12. The 14 existing test files
that touch self-heal, schemas, orchestrator or the roadmap give identical results before and after the merge. Their
pre-existing failures are unchanged and not caused here: test-node-schemas NS-003/NS-012 (failure_mode schema vs a
real lib/ico.js record), test-diagnostic-heal-path DHP-001/DHP-008 and healer.test.js (cortex/healer/index.js does
not exist).

#### Revised: docs/2026-09-28-graph-build-context-settings-memory-phasemap.spec → 1.1.0 (mapped, nothing built)

- **I12 sovereignty.** Every system owns its code, store, settings, lifecycle and atlas page, and crosses to another
  only through a declared contract (route, bus event, host SDK). No require() into another system's folder; no
  system opens another's store.
- **Measured on 0.39.276.** 263 system→system import edges (lib/ excluded). 582 imports into lib/, and 78 files in lib/
  require cortex/memory/jaa-db, so any system using lib/ opens cortex's whole store. That is the memory crash's
  mechanism: sovereignty and memory are one fix.
- **New phases SV0–SV3:** crosses_system edges in the graph as a standing number; an exposes/consumes contract per
  system (loom wires); data sovereignty (lib/ takes the caller's store; each system opens only its own; absorbs M2);
  code sovereignty (largest crossing first).
- **Rewritten to obey I12:** identity stays in idearium behind a route (was: moved into lib/ for cortex to import);
  per-repo settings move to idearium's own store (were: cortex's shared store); each system owns its high-volume
  tables (was: cortex writes for everyone).
- **Decisions opened:** D2 — 0.39.276's linked second code repo vs building in the original, uncommitted. D3 — lib/
  as a stateless versioned SDK (proposed) vs a copy per system.

#### Files

- orchestrator/orchestrator.js, cortex/self-heal/index.js, cortex/self-heal/failure-mode-forensics.js,
  cortex/schemas/schema.failure_mode, cortex/schemas/schema.debug_macro, lib/node-schemas/schema.failure_mode,
  lib/node-schemas/schema.debug_macro, tests/modules/run-all.js, tests/modules/test-c0-cfr-collapse-anchor.test.js,
  tests/modules/test-c1-compound-failure-mode.test.js — from C1, unchanged.
- docs/2026-09-28-staging-self-heal-phasemap.spec (from C1), docs/2026-09-28-graph-build-context-settings-memory-phasemap.spec
  (1.1.0), docs/SPEC-REGISTRY.spec, lib/version.js, package.json.

#### Fixed in passing

- docs/atlases/idearium-atlas.md — the 0.39.276 paragraph on the code repo wrote six identifiers as code spans
  (speceng.codegen, spec.codegen, promotedFromSpec, linkCoder, repo_agent_links, idearium.code_*), failing
  test-nexus-atlas-refs on 0.39.276 itself (48/1). Written as plain text, per the atlas rule; now 49/0.

## Ledger

### Build 0.39.277 — snap-0709 — 2026-09-29 01:34:56

- Archive: `nexus-0709_2026-09-29_v0.39.277_8.zip` (was `nexus-8.zip`)
- SHA-256: `dc7a765d4623efb5abf3fe6c65a015f4276ea3e882e9e83ff8cc72a6633db80e`, 11.2 MB, downloaded 2026-09-29 02:24:26
- Kind: full
- Commit: `cd1940d234d16215671ad84b6815381c9e0d09d0`, tag `snap-0709`
- Left out: node_modules (203 files)
- Files in archive: 2996. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.277.md
M docs/2026-09-28-graph-build-context-settings-memory-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/idearium-atlas.md
M lib/version.js
M package.json
```

