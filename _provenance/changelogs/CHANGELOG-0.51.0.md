# Nexus 0.51.0

**0.51.0 — 2026-10-08**

| | |
|---|---|
| Built | 2026-10-08 17:51:32 → 2026-10-08 17:51:32 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.51.0 |
| Tag | `v0.51.0` → snap-0741 |
| Full file ledger | [LEDGER-0.51.0.csv](../ledger/LEDGER-0.51.0.csv) |

## Release notes — `CHANGELOG-0.51.0.md`

Copied unchanged from the build.

### 0.51.0 — 2026-10-08

James: "okay now the phases with the spec workshop. needs to be rebuilt, enterprise grade. interconnected"

RS11 is done, built on the workshop the other session shipped (WS7) instead of building a second one. RS6 is re-mapped: its editor is WS7, and what's left of it is the macro timeline, which needs RS1 and RS2 first.

#### In the workshop: each section knows its phases

- **Reading the thread.** It reads the saved spec's thread on open, after save, plan and build, and when the window comes back into focus. There's no polling.
- **Each section shows a strip of its phases**, by key and state: planned, active, the run's state (e.g. ESCALATING), done or failed. Clicking one opens Idearium's Phases tab on this spec with that phase open.
- **The outline** shows a dot per phase.
- **A changed section.** A section changed since it was planned says ↻ CHANGED SINCE IT WAS PLANNED, and REPLAN opens the pipeline's replan.
- **Unsaved edits.** A planned section edited and not saved says SAVING THIS CHANGES N PLANNED PHASES.
- **Opening at a section.** `?block=<section>` opens the writer at that section.

#### In the Phases tab

- **Open in the workshop** opens the session that saved the spec, at the phase's block. The thread now names that session.

#### Found on the way, fixed

- **A click lost to a repaint.** Selecting a section repaints, and the phase strip was rewritten on every repaint, swapping its buttons under the pointer. A strip is now rewritten only when it changed.
- **A hand-off lost on a repo switch.** A spec and phase handed over by the workshop were wiped when the Phases tab switched to another repo. They now survive the reset.

#### Not built

- **Planning only the picked sections.** The pipeline plans the whole spec, and a replan does not carry the old map's statuses over. This is said here, not hidden.

#### Tests

- `test-workshop-thread` 4/4, driven in Clear Glass with the real workshop page and the real lib/workshop.js, spec-plan, spec-document and thread.
- `test-phases-tab` 5/5 (PT-05 is new).
- Unchanged and passing: thread, spec-document, plan-lands, code-tab, the contract tests.
- Main's `test-workshop-full` and `test-template-picker` (TP-03) flicker the same with and without this change. Three runs each way: workshop-full failed 2 of 3 without it and 0 of 3 with it; TP-03 failed either way. Main's changelog already recorded TP-03 as intermittent.

## Ledger

### Build 0.51.0 — snap-0741 — 2026-10-08 17:51:32

- Archive: `nexus-0741_2026-10-08_v0.51.0_main-40.zip` (was `Nexus-main-40.zip`)
- SHA-256: `b4972e25cfd6b01d6af38b274005b11a2c86ac8eb8edd759788d4d9d385b1bac`, 15.3 MB, downloaded 2026-10-09 11:38:56
- Kind: full
- Commit: `c3f0475b2071fe6bc37e02207e6b2b70c372a544`, tag `snap-0741`
- Files in archive: 5477. Changes against the build before it: **10 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 2 | 10 | 0 |
| docs | 0 | 6 | 0 |
| tests | 4 | 2 | 0 |
| loom | 0 | 5 | 0 |
| (root) | 3 | 1 | 0 |
| lib | 1 | 1 | 0 |

```
A CHANGELOG-0.49.0.md
A CHANGELOG-0.50.0.md
A CHANGELOG-0.51.0.md
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
M docs/2026-09-27-one-idearium-phases-living-spec-nodes-phasemap.spec
M docs/2026-09-30-idearium-coding-flow-phasemap.spec
M docs/2026-10-02-workshop-codex-rewind-phasemap.spec
M docs/2026-10-05-spec-workshop-rebuild-phasemap.spec
M docs/SPEC-REGISTRY.spec
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/registry-components.js
M idearium/repo/roadmap.js
M idearium/repo/spec-plan.js
A idearium/repo/thread.js
A idearium/ui/css/phases.css
M idearium/ui/css/workshop.css
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/phases.js
M idearium/ui/js/workshop.js
A lib/spec-document.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/build-surface-map.js
M loom/maps/verified-primitives-map.js
M loom/scanners/phasemap-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-phases-tab.test.js
M tests/modules/test-plan-lands.test.js
A tests/modules/test-spec-document.test.js
A tests/modules/test-thread.test.js
A tests/modules/test-workshop-thread.test.js
```

