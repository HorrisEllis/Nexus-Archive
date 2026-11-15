# Nexus 0.60.6

**0.60.6 — 2026-10-13**

| | |
|---|---|
| Built | 2026-10-12 18:17:14 → 2026-10-12 18:58:20 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.6 |
| Tag | `v0.60.6` → snap-0747 |
| Full file ledger | [LEDGER-0.60.6.csv](../ledger/LEDGER-0.60.6.csv) |

## Release notes — `CHANGELOG-0.60.6.md`

Copied unchanged from the build.

### 0.60.6 — 2026-10-13

James asked for all of the following:
- "here is two huge ones. i have more. this is what i mean by i need to be able to log these somewhere, its too much. like can we have a notes or something section for the repos so i can note all of this down? im out of ideas"
- "can you add to claude.md to quote me and my decisions, with context to establish credibility. what aboiut 34000 lines? can you check that for me? remember that i want nexus to be able to parse, import, map, and i want you to build anything nexus needs to completely manage a project. past, present and future."
- "you're mapping all of this right. here is some more. remember not just the components. importing them as repositories, so i can continue, expand, fix, manage, and test them."

#### Notes (`lib/repo-notes.js`, the Notes tab)

Every repo has a **Notes** tab:
- **Writing:** type, Enter saves, Shift+Enter starts a new line. Choose a kind: note · idea · decision · todo · question · quote. Tags are optional.
- **Each note** can be pinned (★), marked done (✓), edited in place, or archived. An archived note is kept and can be brought back; nothing is deleted.
- **Finding:** search, filter by kind, and switch between "this repo" and "every repo". Notes can also sit on no repo.

Wiring:
- **Routes:** `GET`/`POST /api/repos/:uuid/notes`, `GET`/`POST /api/notes`, `PATCH /api/notes/:id`.
- **Commands** (every agent has them): `repo notes`, `repo note`, `notes`, `note`, `note done`.
- **Search:** the context atlas includes notes, so agents find them.
- **Events and loom:** two new events are declared, and the module is mapped in loom.

#### His decisions, quoted with context (`docs/CLAUDE.md`, new root `CLAUDE.md`)

`docs/CLAUDE.md` has a new rule for every decision he makes:
- It is recorded verbatim and dated, with what was being decided and the choices on the table.
- The coder's recommendation and the coder's reading are named as the coder's, and a reading is marked "to confirm" when there is another one.
- A later decision supersedes an earlier one through an addendum that quotes both; nothing is rewritten.

A root `CLAUDE.md` imports `docs/CLAUDE.md`, so the agreement loads in every session.

#### The 34,000 lines, checked

| Bootstrap | Lines changed in `registry.json` | Real change |
|---|---|---|
| From scratch | ~34k | +31 components, +40 wires — but ~125 real edges lost (115 unresolved export hooks, including 10 of Clear Glass main's requires) |
| Over the existing registry | ~95k | +31 components, +31 hooks, +40 wires, nothing removed — plus ~2300 duplicate wires under new ids |

Why: a wire's id carries its position in the scan, so one new file renumbers every wire after it.

Neither result was committed, and the registry is unchanged. The fix is phase LM0: ids built from a wire's endpoints, then one regeneration checked edge by edge.

#### His projects imported as repos

Five projects were imported through the real Import routes in a sandboxed Idearium, and also decomposed:
- **MASTERMIND**
- **ERAVOS**
- **Bridge-OS**
- **nexus 4.23**
- **update-system**

All five became repos. The only things not imported were `.git` folders: Bridge-OS's history, and the history of a repo nested inside nexus 4.23. That gap is phase PL2.

What decomposing found:
- **MASTERMIND:** 1026 components. 143 imports point at files that aren't in the project, mostly under `unintegrated/`. There are three copies of spatial-v2.
- **ERAVOS:** its scripts share code through `window` globals instead of imports, so it shows no links. That gap is CK-126 / PL6.

Two component-store bugs were found and fixed (`lib/component-store.js`):
- An import from a URL was recorded as the npm package `https:`.
- A required `.json` file was reported missing. It is now recorded as an asset, and URL imports as remote.

The import run itself wrote into the real `idearium/repo/repos/`, because repo storage is not one of the sandbox's stores. The test's five repos were removed, and the gap is named in PL1's proof.

#### The check catalogue (`cos/spec/check-catalogue.spec`)

- **96 checks**, built from 12 primitives: boundary, flow, state, transformation, invariant, feedback, identity, time, cause, evidence, meaning, composition. Each primitive was compared across many domains:
  - software, security and QA/QC
  - systems thinking, control theory and traversal
  - linguistics, communication and hermeneutics
  - medicine, aviation, lean manufacturing and law
  - Da Vinci's seven principles
- **86 of the 96 are deterministic**, so a gate can run them instead of an agent.
- **Each check states** what it checks, what it finds, how it runs, which stages it belongs to, and what already does it.
- **Stages:** gate · testenv · torture · debug · diagnostic · intelligence · import.

#### Mapped (`docs/2026-10-13-projects-raid-and-gates-phasemap.spec`)

**Done:**
- NT0 — notes
- PL0 — his projects imported
- CK0 — the check catalogue

**Open — projects:**
- PL1 — import many at once
- PL2 — keep `.git` history
- PL3 — versions of a project become its history
- PL4 — import reports what is already broken, as notes
- PL5 — a project's specs become its roadmap
- PL6 — global links seen

**Open — RAID:**
- RD0 — RAID gets its own contract and declared events
- RD1 — RAID commands: axioms, gates and checks, with system axioms his only
- RD2 — Idearium routes through RAID
- RD3 — the registry carries events, starting with one path
- RD4 — his "each chunk a block, synthesized into one contract file", recorded

**Open — other:**
- CK1 — the catalogue runs
- WF0 — workflows, internal and external
- LM0 — stable loom wires

**Also added:**
- His `docs/cocreation.spec`.
- Three entries registered in `docs/SPEC-REGISTRY.spec`.
- His `nexus-uri-clearglass-mesh-integration.spec` upload is older than the repo's copy, which has Thread 4 (Snowflake), so the repo's copy was kept.

#### Tests

- **New:** `test-repo-notes` 11/11 and `test-project-decompose` 15/15 (PD-11 is new).
- **Still passing:** component-store, cli-route-commands, nexus-command, atlas, event-contracts, nexstore-writers, idearium-theme and repo-toolbar.
- **Still failing:** `test-repo-settings-ui`, which already failed before these changes.

## Ledger

### Build 0.60.6-r1 — snap-0745 — 2026-10-12 18:17:14

- Archive: `nexus-0745_2026-10-12_v0.60.6-r1_main-44.zip` (was `Nexus-main-44.zip`)
- SHA-256: `9e8de1acebbf21a4cb20e448e5bb21595cda9065c336400b9bce8bb22c580be9`, 15.9 MB, downloaded 2026-10-12 18:17:46
- Kind: full
- Commit: `4a6d7a87eb98100a542efb5ee9afb867567a860b`, tag `snap-0745`
- Files in archive: 5627. Changes against the build before it: **52 added, 69 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 23 | 9 | 0 |
| clear-glass | 6 | 17 | 0 |
| guardian | 2 | 12 | 0 |
| idearium | 4 | 9 | 0 |
| lib | 2 | 10 | 0 |
| (root) | 7 | 1 | 0 |
| docs | 4 | 4 | 0 |
| tests | 3 | 4 | 0 |
| cortex | 0 | 2 | 0 |
| loom | 1 | 1 | 0 |

```
A CHANGELOG-0.60.1.md
A CHANGELOG-0.60.2.md
A CHANGELOG-0.60.3.md
A CHANGELOG-0.60.4.md
A CHANGELOG-0.60.5.md
A CHANGELOG-0.60.6.md
A CLAUDE.md
A clear-glass/docs/gigs/gig-template.gig
A clear-glass/docs/gigs/nodejs-automation-scraping.gig
A clear-glass/docs/gigs/nodejs-automation-scraping.gig.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/browser.html
A clear-glass/renderer/cos-theme.css
M clear-glass/renderer/gig-panel.js
M clear-glass/renderer/library.html
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/src/autofill/gig.js
M clear-glass/src/contexts/session-headers.js
M clear-glass/src/cookies/vault.js
M clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
A clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
M clear-glass/src/providers/host.js
M clear-glass/src/providers/registry.js
A clear-glass/test/gig-file.test.js
M cortex/core/raid/index.js
M cortex/core/raid/officiator.js
M cos/archetype/components/index.js
M cos/archetype/genesis-catalog.js
M cos/archetype/nexus-system.js
A cos/archetype/nexus-system/data/nodes/capability/{{slug}}.handoff.move.capability
A cos/archetype/nexus-system/data/nodes/capability/{{slug}}.modules.nest.capability
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.handoff.send.command
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.handoffs.command
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.module.new.command
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.modules.command
A cos/archetype/nexus-system/data/nodes/component/{{slug}}.handoff.component
A cos/archetype/nexus-system/data/nodes/component/{{slug}}.modules.component
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.handoff.queued.event
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.handoff.refused.event
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.handoffs.listed.event
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.module.created.event
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.modules.listed.event
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.handoff.send.route
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.handoffs.route
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.module.new.route
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.modules.route
A cos/archetype/nexus-system/done/.gitkeep
M cos/archetype/nexus-system/event-taxonomy.js
A cos/archetype/nexus-system/failed/.gitkeep
M cos/archetype/nexus-system/interaction-contract.json
A cos/archetype/nexus-system/lib/handoff.js
A cos/archetype/nexus-system/lib/modules.js
A cos/archetype/nexus-system/processing/.gitkeep
M cos/archetype/nexus-system/registry-components.js
M cos/archetype/nexus-system/server.js
M cos/archetype/nexus-system/skeleton.json
M cos/archetype/nexus-system/tests/skeleton.test.js
A cos/spec/check-catalogue.spec
A docs/2026-10-12-browser-providers-and-work-phasemap.spec
A docs/2026-10-12-request-spine-phasemap.spec
A docs/2026-10-13-projects-raid-and-gates-phasemap.spec
M docs/CLAUDE.md
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
A docs/cocreation.spec
M docs/nexstore-writers.yaml
M guardian/data/nodes/provider/chatgpt.provider
M guardian/event-taxonomy.js
A guardian/lib/account-routing.js
M guardian/lib/agent-registry.js
M guardian/lib/dispatcher.js
M guardian/lib/index.js
M guardian/lib/selector-map.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
A guardian/userscript-field-map.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/templates/architecture-spec.template.yaml
M idearium/spec-engine/templates/genesis.spec
M idearium/spec-engine/templates/system/schemas/schema.command
A idearium/spec-engine/templates/system/schemas/schema.handoff
A idearium/spec-engine/templates/system/schemas/schema.module
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/components-panel.js
A idearium/ui/js/repo-notes.js
M lib/agent-facts-hash.js
M lib/agent-providers.js
M lib/component-store.js
M lib/context-atlas.js
M lib/node-schemas/schema.provider
M lib/phase-plan.js
A lib/project-decompose.js
M lib/repo-agent.js
A lib/repo-notes.js
M lib/repo-prompt-blocks.js
M lib/test-sandbox.js
M lib/version.js
M loom/bootstrap.js
A loom/maps/component-intake-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-accounts-picker-cos.test.js
M tests/modules/test-plan-code-run-attention.test.js
A tests/modules/test-project-decompose.test.js
M tests/modules/test-repo-agent-provider.js
A tests/modules/test-repo-notes.test.js
M tests/modules/test-system-skeleton.test.js
```

### Build 0.60.6-r2 — snap-0746 — 2026-10-12 18:53:58

- Archive: `nexus-0746_2026-10-12_v0.60.6-r2_main-45.zip` (was `Nexus-main-45.zip`)
- SHA-256: `393650bc4c80b7a27d78a2eb2003b43001b2eb79d7a4235e8f63b94f7c4b9c97`, 16.2 MB, downloaded 2026-10-12 18:56:32
- Kind: full
- Commit: `1e19e3f9ddeb13d4effe26410eb5caa600ae825d`, tag `snap-0746`
- Files in archive: 5628. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |
| clear-glass | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A CHANGELOG-0.60.7.md
M clear-glass/src/providers/attention.js
M guardian/lib/provider-attention.js
```

### Build 0.60.6-r3 — snap-0747 — 2026-10-12 18:58:20

- Archive: `nexus-0747_2026-10-12_v0.60.6-r3_main-46.zip` (was `Nexus-main-46.zip`)
- SHA-256: `d2d209056d924d2de354d790e21266f7f52459f17a4cbe1800e6cba492205abe`, 16.2 MB, downloaded 2026-10-12 19:01:36
- Kind: full
- Commit: `81e0a28e74e485c3cedc10fff4744952f0984da1`, tag `snap-0747`
- Files in archive: 5628. Changes against the build before it: **0 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 3 | 0 |
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M CHANGELOG-0.60.7.md
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/cos-theme.css
M guardian/options.js
M idearium/api/index.js
M ollama/lib/ollama-client.js
M tests/modules/test-project-decompose.test.js
```

