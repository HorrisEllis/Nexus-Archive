# Nexus 0.60.200

**0.60.200 — what Idearium needed to work on MASTERMIND**

| | |
|---|---|
| Built | 2026-10-21 15:50:22 → 2026-10-21 15:50:22 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.200 |
| Tag | `v0.60.200` → snap-0774 |
| Full file ledger | [LEDGER-0.60.200.csv](../ledger/LEDGER-0.60.200.csv) |

## Release notes — `CHANGELOG-0.60.200.md`

Copied unchanged from the build.

### 0.60.200 — what Idearium needed to work on MASTERMIND

James, 2026-10-21: "i just want you to add what idearium needs to work on mastermind."

#### How the list was made
His MASTERMIND-v0_1_50 zip was driven through Idearium's real API in the test sandbox, with Versionium's real routes up: import → index →
roadmap → registry → dependency graph → build. Each place it stopped is one fix below. Nothing was guessed (§0.1).

#### What the run found, and what changed
1. **Every path began `mm9/`.** The zip holds the project inside one folder, so a build, an agent and MASTERMIND's own scripts would
   never meet at the same paths. This is the same mismatch behind SP5's title.js.
   Fixed: the project imports drop a lone wrapping folder and say so (`wrapper`). It is off for other zip paths.
2. **Nine "roadmaps", and the import refused to choose.** MASTERMIND also has docs/PHASEMAP.md and archived Roadmap.md files.
   Fixed: each is counted. The ones with no phases are left out and listed. The one backed by phases.json is primary and is taken by
   default.
3. **P1's graph said it changes `phasemap/phases.json`.** The importer's own evidence lines named the roadmap by path, and the file
   mapper read that as a file P1 builds. Fixed: the evidence names the file by its bare name; the full paths sit once in the map's
   header.
4. **P1 then had no graph without a model.** File mapping needs Ollama, which is not always up.
   Fixed: the files PHASEMAP.md names under each phase are carried as `named_in_source`, 8 of the 16 phases. P1 now maps to
   `schemas/node.schema.json` and `schemas/edge.schema.json` with no model.
5. **Proof could not run its tests.** MASTERMIND has no `npm test` script; its suites run as `node tests/run-all.js`, which here gives
   51 run, 3 skipped for Electron, exit 0. Fixed: the project's own runner is used, and named.
6. **Its integrity notes never landed.** One note was over the 20,000-character limit, and that stopped every note.
   Fixed: lines and bodies are cut, pointing at the full list, and one failed note no longer stops the rest. On MASTERMIND: 3 notes,
   the largest 5,854 characters.

#### Where MASTERMIND stands now (the real run)
- 1,371 files at the repo root (5 omitted: 4 git history bundles under dist/, and build/installer.nsh, because `build` is a skipped
  folder by the import config).
- Indexed in about 18 s: 1,357 components, 5,919 wires, 714 events, 95 routes.
- 16 phases, DAG clean. P1 has a dependency graph and is on the critical path.
- A build of P1 takes a Versionium snapshot, plans, and reaches the agent ladder. Here no agent is reachable, so it stops there; on his
  machine the agents take it from there.
- P0 ("one clean hardware cycle") names no files: it is his to mark done.

#### Proof
- tests/modules/test-mastermind-ready.test.js 4/4 (MR-01..04, fixtures in MASTERMIND's shape).
- tests/modules/test-roadmap-import.test.js 5/5, with RI-01 extended.
- Unchanged: proof-run 7/7, phase-proof 7/7, repo-git 11/11, gates-solid 7/7, repo-history 20/20, opportunity 28/28,
  release-version 5/5, contract-phase-build 14/14, approval-chain 6/6, history-import-job 18/18, mcoc-import-baseline 25/25.

#### Said, not changed
- `build/` is a skipped folder in the import config, so MASTERMIND's NSIS installer script (build/installer.nsh) is not imported.
  That is listed in the import's omitted files.
- 3 of its suites need Electron (npm install), which this environment does not have.

## Ledger

### Build 0.60.200 — snap-0774 — 2026-10-21 15:50:22

- Archive: `nexus-0774_2026-10-21_v0.60.200.zip` (was `nexus-0.60.200.zip`)
- SHA-256: `09d2f88a3a61720b014eb65bc02ef912e6a67fb4869dcac9e824944242a40bb9`, 25.2 MB, downloaded 2026-10-21 15:56:20
- Kind: full
- Commit: `f2abe0957c12d5ea5eeb29cd1cc327184af0766c`, tag `snap-0774`
- Files in archive: 6679. Changes against the build before it: **5 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 1 | 7 | 0 |
| (root) | 2 | 2 | 0 |
| docs | 0 | 3 | 0 |
| lib | 0 | 3 | 0 |
| tests | 2 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A CHANGELOG-0.60.199.md
A CHANGELOG-0.60.200.md
M VERSION
M docs/2026-10-10-idearium-solid-phasemap.spec
M docs/2026-10-17-system-drawbridge-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/repo/proof-run.js
A idearium/repo/roadmap-import.js
M idearium/spec-engine/templates.js
M idearium/spec-engine/templates/genesis-sandboxed.spec
M idearium/spec/idearium.spec
M idearium/ui/js/phases.js
M lib/import-checks.js
M lib/version.js
M lib/zip-ingest.js
M loom/maps/one-idearium-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-mastermind-ready.test.js
A tests/modules/test-roadmap-import.test.js
```

