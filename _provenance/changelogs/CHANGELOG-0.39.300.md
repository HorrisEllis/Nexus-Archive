# Nexus 0.39.300

**0.39.300 — 2026-10-02**

| | |
|---|---|
| Built | 2026-10-02 01:26:20 → 2026-10-02 01:26:20 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.300 |
| Tag | `v0.39.300` → snap-0723 |
| Full file ledger | [LEDGER-0.39.300.csv](../ledger/LEDGER-0.39.300.csv) |

## Release notes — `CHANGELOG-0.39.300.md`

Copied unchanged from the build.

### 0.39.300 — 2026-10-02

James: "make sure its enterprise grade, beautiful. need increments of zoom. like each system is a node, which zooming in has the components as nodes. also can you debug versionium. i need this all to be able to code what i need, expand it and make sure it all interconnects. find spec workshop. synthesize as much gaps as possible, and fill the highest amount of leverage first. and then we need to add that to the intelligence system. like synthesis needs to be expanded, immensly"
James: "make idearium full screen. its cluttered also" · "make this enterprise, remove the noise, this is for speccing"

Map: `docs/2026-10-02-synthesis-zoom-versionium-phasemap.spec` (built, with the LV1 record).

#### Versionium (VX1)
Versionium itself was healthy: all six of its suites passed. The fault was in its callers. `lib/nexus-client.js` throws when a service is unreachable, but idearium's snapshot calls checked for `{error}`. So with versionium down, every idearium page load threw an unhandled 500, and a missing snapshot came back as a 500 too.
- One adapter now turns that throw into a stated 502, and a missing snapshot into a 404.
- Versionium logs an outage once and the recovery once, instead of every 3 seconds.
- A port already in use is reported in a sentence, and the process exits with code 1.

#### The pipeline together (WS3)
- Create ▾ lists THE PIPELINE: The Void → Spec workshop → Architect. Each opens as its own page.
- The retired Spec Builder has left Build ▾.
- Architect opens without a repo.

#### Semantic zoom (AZ1)
The canvas zooms in steps: SYSTEMS, where each system is one node and the wires between systems are summed; then COMPONENTS inside their systems; then DETAIL. Use the buttons, the keys 1·2·3, or +/-. Double-click a system to open it.

#### Gap synthesis in intelligence (SY1, SY2)
`intelligence/synthesis/` reads these sources:
- every phasemap;
- the known-gap register;
- code markers;
- loom's unwired components;
- the gap table;
- gaps other systems push (the Architect pushes its gaps when it saves).

It clusters the same gap said in several places, follows what each gap blocks across maps, and ranks by leverage. Routes: `/api/intelligence/synthesis`, `/run`, `/ingest`, `/history`, `/fill`, `/themes`, `/gap/:id`. A run covers 579 raw gaps (567 after clustering) across 74 maps in about 0.5 s.

#### Filled by leverage (LV1)
- **Phasemaps made machine-readable:** 21 of 30, using `scripts/fix-phasemap-yaml.js`. It folds values without changing a word, and refuses any repair that would. Two maps were finished by hand, adding only quotes and list dashes. 9 still don't load: each is broken in its structure, so fixing it would mean rewording.
- **N0 census:** `lib/nexstore/census.js`. 303 data shapes in seven kinds, none unclassified, written to `docs/nexstore-type-catalogue.yaml`. Tables that are only written in code are now included, with their fields taken from the code.
- **N1 record and log:** `lib/nexstore/record.js` and `log.js`.
  - Each record is framed with a crc and linked into a hash chain, and is fsynced before the append returns.
  - The log is split into capped segments.
  - A torn tail is cut off, kept under `torn/` and reported; corruption anywhere else is refused.
  - One writer per log.
  - The proof: the writer was killed 25 times at random points mid-append, and every acknowledged record survived.
- **N2 types and gates:** `lib/nexstore/types.js`.
  - The type registry is read from the catalogue plus the node schemas.
  - Each type's gate is a list of warp `Axiom`s.
  - A refused record never reaches the log; its refusal does.
- **DT1 writer census (partial):** `lib/nexstore/writers.js` with `docs/nexstore-writers.yaml`.
  - It found 209 writers that persist data.
  - 60 have a type or a stated reason; every idearium table writer is typed.
  - 149 are listed as OWED, and that number can't grow.
  - Any new writer fails the test.

#### Idearium: one bar, full screen (UI1)
- The top bar is gone. Its logo, counters, settings and connection light now sit in the tab bar, alongside ⛶ for full screen (SHIFT+F).
- The welcome page has three actions: ENTER THE VOID, SPEC WORKSHOP and BRING IN ▾ (which holds the other six actions). Below them are the three pipeline stations.

#### The workshop as a work surface (WS4)
The workshop is now one bar (title · the six stations IDEA → SPEC → ARCHITECT → BLUEPRINT → REPO → COS · save) above the work. The starfield and the big title are gone.

#### Mapped, not built
`docs/2026-10-02-fractal-graph-any-size-agent-phasemap.spec`:
- FG1–FG6:
  - one tree from system down to symbol;
  - chunking by a token budget taken from the agent;
  - summaries up the tree;
  - context packed for any size of agent;
  - recursive build;
  - the missing graph relations, and fractals fed into the lattice.
- WS5: the whole spec workshop, "huge, not a little fragment".
- UV1: versioned UIs in compartments. An .html file opens in a popout, at any version.

#### Fixed along the way
My own drive scripts set `NEXUS_TEST_SANDBOX=1`, which disarmed the sandbox and leaked data into the tree. The leak was removed, and `lib/test-sandbox.js` now arms a real sandbox for any value that isn't a directory.

#### Known and not mine
The coding-flow probe W4 (the "∞Create" label) also fails on the base branch.

## Ledger

### Build 0.39.300 — snap-0723 — 2026-10-02 01:26:20

- Archive: `nexus-0723_2026-10-02_v0.39.300_main-18.zip` (was `Nexus-main-18.zip`)
- SHA-256: `a310e1f07bcbdeac9d1df373c3ba9aa42a00f2f9f65940ec81c0f27d53f82e04`, 14 MB, downloaded 2026-10-02 01:30:38
- Kind: full
- Commit: `8e5cc16fd2641200b2562075f704944f5fca8431`, tag `snap-0723`
- Files in archive: 5044. Changes against the build before it: **25 added, 43 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 4 | 25 | 0 |
| intelligence | 9 | 2 | 0 |
| idearium | 0 | 10 | 0 |
| lib | 5 | 2 | 0 |
| tests | 5 | 2 | 0 |
| (root) | 1 | 1 | 0 |
| scripts | 1 | 0 | 0 |
| versionium | 0 | 1 | 0 |

```
A CHANGELOG-0.39.300.md
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
M docs/2026-09-02-agent-mesh-full-map-phasemap.spec
M docs/2026-09-22-brainos-agent-suite-phasemap.spec
M docs/2026-09-22-clear-glass-tab-per-repo-and-ui-expansion-phasemap.spec
M docs/2026-09-25-spec-engine-manifest-first-phasemap.spec
M docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec
M docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
M docs/2026-09-27-clearglass-whole-copilot-learning-phasemap.spec
M docs/2026-09-27-idearium-codebase-toolkit-phasemap.spec
M docs/2026-09-29-nex-node-store-phasemap.spec
M docs/2026-10-01-idearium-agent-ready-master-phasemap.spec
A docs/2026-10-02-fractal-graph-any-size-agent-phasemap.spec
A docs/2026-10-02-synthesis-zoom-versionium-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/idearium-atlas.md
M docs/copilot-full-capability-phasemap.spec
M docs/copilot-omniscience-phasemap.spec
M docs/cortex-schema-registry-phasemap.spec
A docs/nexstore-type-catalogue.yaml
A docs/nexstore-writers.yaml
M docs/nexus-architecture-rebuild-phasemap.spec
M docs/nexus-observability-tablet-phasemap.spec
M docs/nexus-repo-compartment-and-rich-dispatch-phasemap.spec
M docs/nexus-system-standardization-phasemap.spec
M docs/raid-routing-fidelity-phasemap.spec
M docs/raid-warp-verification-phasemap.spec
M docs/rich-atlas-phasemap.spec
M docs/session-2026-08-18-axioms-governed-phasemap.spec
M docs/snapshot-trigger-phasemap.spec
M idearium/api/index.js
M idearium/index.js
M idearium/package.json
M idearium/spec/idearium.spec
M idearium/ui/architect.html
M idearium/ui/css/arch-canvas.css
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/arch-canvas.js
M idearium/ui/workshop.html
A intelligence/commands/get-api-intelligence-synthesis-fill.command
A intelligence/commands/get-api-intelligence-synthesis-history.command
A intelligence/commands/get-api-intelligence-synthesis-themes.command
A intelligence/commands/get-api-intelligence-synthesis.command
A intelligence/commands/post-api-intelligence-synthesis-ingest.command
A intelligence/commands/post-api-intelligence-synthesis-run.command
M intelligence/registry-components.js
M intelligence/routes.js
A intelligence/synthesis/engine.js
A intelligence/synthesis/index.js
A intelligence/synthesis/sources.js
A lib/nexstore/census.js
A lib/nexstore/log.js
A lib/nexstore/record.js
A lib/nexstore/types.js
A lib/nexstore/writers.js
M lib/test-sandbox.js
M lib/version.js
M package.json
A scripts/fix-phasemap-yaml.js
M tests/modules/run-all.js
A tests/modules/test-nexstore-census.test.js
A tests/modules/test-nexstore-log.test.js
A tests/modules/test-nexstore-types.test.js
A tests/modules/test-nexstore-writers.test.js
M tests/modules/test-spec-workshop.test.js
A tests/modules/test-synthesis-zoom-versionium.test.js
M versionium/server.js
```

