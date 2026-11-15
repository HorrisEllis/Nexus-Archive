# Nexus 0.39.236

**NEXUS 0.39.236 — tests stop generating in Idearium**

| | |
|---|---|
| Built | 2026-09-25 10:16:30 → 2026-09-25 10:16:30 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.236 |
| Tag | `v0.39.236` → snap-0661 |
| Full file ledger | [LEDGER-0.39.236.csv](../ledger/LEDGER-0.39.236.csv) |

## Release notes — `CHANGELOG-0.39.236.md`

Copied unchanged from the build.

### NEXUS 0.39.236 — tests stop generating in Idearium

James, with the Idearium Repos tab showing only `inject-test-*`, `prov-*`, `phase-sync-test-*` and `phase-sync-standalone-*`: "the tests need to stop in idearium. they keep generating."

#### Why they kept coming back
- Tests wrote into the real stores: idearium/data, cortex memory, COMPARTMENT OS. Isolation was opt-in per test and most tests never opted in. COMPARTMENT OS had no override at all. `idearium/repo/repo-node.js` and `idearium/lib/chunk-nodes.js` ignored `IDEARIUM_DATA_DIR` even when a test set it.
- At boot, `_reconcileSpecRepos` adopted every leaked spec into a real compartment. The build queue built them, and the repo agent sent their prompt to ChatGPT (2026-09-25 log: job `0631e27a` for `inject-test-1790345265876`).
- One unpatched suite run here left 422 idearium node files, 29 spec files, 80 project files and 141 COS files.
- This is the third cleanup of the same class, so the cause is fixed, not the leftovers.

#### The fix: a test process cannot write real data
- **`lib/test-sandbox.js` (new).** A test process gets one temporary root, and every store's own override points into it: `IDEARIUM_DATA_DIR`, `JAA_DATA_DIR`, `COS_DATA_ROOT` (new), `NEXUS_INJECT_DIR`, `NEXUS_DATA_ROOT`. The root is set on `process.env`, so anything the test starts inherits it, and it is removed on exit. A test process is one whose entry script is under `tests/` or a `test/` directory, or is named `*.test.js`, or was marked by a runner.
- **The stores call it themselves**, so no test has to remember anything:
  - `idearium/lib/data-dir.cjs` (new) is the only Idearium data-path resolver. Eight files now use it, plus the event ledger.
  - `cortex/memory/jaa-db.js`, `cos/foundation/constants.js`, `lib/repo-inject.js`, `lib/ledger-writer.js` and `intelligence/alk` call `ensure()` before resolving their path.
- **Runners give each suite its own root:** `tests/modules/run-all.js`, autopilot's post-boot vitals check and test run, and the precommit `require()` probe. The precommit probe was starting real servers from the live tree.
- **27 tests that start NEXUS processes** call `ensure()` first.
- **`spec-list-merge.test.mjs` no longer uses port 4800.** It was posting a test spec to the live Idearium whenever one was running.
- **Two tests exist to read the live store** (tablet graph, ALK lattice). They now read a copy via `seedFromReal()`.
- **The boot vitals check** was killed at 30 s while running 9 suites of up to 30 s each. That produced "✗ VITALS CHECK FAILED — (no summary line captured)" on every boot. The limit is now 180 s.

#### Cleanup of what already leaked: `cli/clear-idearium.js` 0.2.0
The existing tool, extended rather than replaced. It now also covers:
- the repo-scoped tables
- `.inject` nodes
- `idearium-repo-*` and `idearium-idea-*` compartments
- guardian `.job` files that carry a cleared repo's project-agent prompt

Other guardian jobs and other compartments are not touched. It is a dry run by default, and `--apply` refuses while Idearium (:4800) or Guardian (:7820) answers.

The shipped `idearium/data` has been cleared of its test output: 25 repository nodes, 442 chunk nodes, 10 projects and 8 specs, each traced to the test that wrote it.

#### Tests
- **`test-test-sandbox` 28/28.** A test that sets nothing up, running as a real child process, creates a spec, a repo and a compartment. Nothing new or grown appears in the real stores, and no production entry point is mistaken for a test.
- **`test-clear-idearium` 14/14.** Runs against real stores in a sandbox. An unrelated job and an unrelated compartment survive, and `--apply` refuses while a live Idearium answers.
- **Mutation checks:** sandbox off → 9 fail; `repo-node.js` reverted → 1; old ledger path → 1; job filter removed → 2; live refusal removed → 1.
- **`version-sync-and-registry` 30/30**, re-pointed at Idearium 4.2.1.
- **Full suite in parallel against the unmodified tree:** identical, except two tests that only passed before because earlier tests had filled the real store. Against a populated store they match baseline and leave it byte-identical.
- **After the patched full run:** 0 new or changed files in `idearium/data` and 0 COS compartments.

#### Not covered
Other systems' stores with their own hardcoded paths still take test writes:
- `data/guardian/ledger`
- code-artifacts
- `data/versionium`
- `intelligence/data/nodes`
- copilot person-model ledgers
- per-system `component_ledger` files

The same fix applies to them. It was not done in this release because it was not asked for.

#### Versions
- system 0.39.235 → 0.39.236
- idearium 4.2.0 → 4.2.1 (package.json, spec, `index.js`, `lib/version.js`)
- `docs/tests.spec` 1.1.0 (`test_data_isolation`)
- idearium atlas updated

## Ledger

### Build 0.39.236 — snap-0661 — 2026-09-25 10:16:30

- Archive: `nexus-0661_2026-09-25_v0.39.236.zip` (was `Nexus_v0_39_236.zip`)
- SHA-256: `a15c6e25ce9a06f047d7452e7060ca8b864fe89f07d705264ff761ef4e9dcd0c`, 97.2 MB, downloaded 2026-09-25 10:17:47
- Kind: full
- Commit: `63f3343ce3286e5e7642e71555fca835354af9ac`, tag `snap-0661`
- Left out: embedded .git (966 files, HEAD c45cf00df406d1018f2ca3a8ef84b53c77f0cec0 (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 3769. Changes against the build before it: **5 added, 55 modified, 650 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 1 | 10 | 650 |
| tests | 2 | 32 | 0 |
| lib | 1 | 3 | 0 |
| (root) | 1 | 2 | 0 |
| docs | 0 | 2 | 0 |
| cli | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| cos | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
A CHANGELOG-0.39.236.md
M cli/clear-idearium.js
M cortex/memory/jaa-db.js
M cos/foundation/constants.js
M docs/atlases/idearium-atlas.md
M docs/tests.spec
M idearium/api/index.js
M idearium/index.js
M idearium/lib/chunk-nodes.js
A idearium/lib/data-dir.cjs
M idearium/package.json
M idearium/repo/index.js
M idearium/repo/repo-node.js
M idearium/repo/watcher.js
M idearium/spec-engine/index.js
M idearium/spec-engine/warp-build-dispatch.js
M idearium/spec/idearium.spec
M intelligence/alk/index.js
M lib/ledger-writer.js
M lib/repo-inject.js
A lib/test-sandbox.js
M lib/version.js
M nexus/autopilot.js
M package-lock.json
M package.json
M scripts/precommit-check.js
M tests/diagnostic-fixes.test.js
M tests/integration.test.js
M tests/modules/guardian-command-index.test.js
M tests/modules/idearium-phase-compartment-integration.test.js
M tests/modules/idearium-phase-compartment.test.mjs
M tests/modules/mco15-component-exec-test.test.js
M tests/modules/orchestrator-cli.test.js
M tests/modules/run-all.js
M tests/modules/spec-list-merge.test.mjs
M tests/modules/spec-promote.test.mjs
M tests/modules/test-agent-mesh-guardian-coverage.js
M tests/modules/test-alk-lattice-live.js
M tests/modules/test-autopilot-boot-gates.js
M tests/modules/test-autopilot-warp-spine.js
M tests/modules/test-cg-accounts-portal-settings.test.js
M tests/modules/test-clear-glass-idle-vs-open.js
A tests/modules/test-clear-idearium.test.js
M tests/modules/test-cortex-heartbeat.js
M tests/modules/test-cos-testenv.js
M tests/modules/test-decompose.js
M tests/modules/test-emerge-direct-compile.js
M tests/modules/test-file-tree-plan.js
M tests/modules/test-lifeline-guardian-timeout.test.js
M tests/modules/test-moce-roadmap.js
M tests/modules/test-ncp-handler-sr3.js
M tests/modules/test-repo-toolbar-mode.js
M tests/modules/test-spawn-guard.js
M tests/modules/test-tablet-container-api.js
M tests/modules/test-tablet-graph-api.js
M tests/modules/test-tablet-homepage.js
M tests/modules/test-tablet-ledger-api.js
A tests/modules/test-test-sandbox.test.js
M tests/modules/version-sync-and-registry.test.js
M tests/nexus-full-audit.js
```

650 more (mostly data, logs and archived files) are in the ledger file.

