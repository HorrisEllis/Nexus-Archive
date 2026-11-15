# Nexus 0.60.167

**0.60.167 — 2026-10-19 — a phase that is already done no longer loops forever on test-first**

| | |
|---|---|
| Built | 2026-10-19 06:38:20 → 2026-10-19 06:38:20 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.167 |
| Tag | `v0.60.167` → snap-0766 |
| Full file ledger | [LEDGER-0.60.167.csv](../ledger/LEDGER-0.60.167.csv) |

## Release notes — `CHANGELOG-0.60.167.md`

Copied unchanged from the build.

### 0.60.167 — 2026-10-19 — a phase that is already done no longer loops forever on test-first

James, 2026-10-19: "been stuck on that phase for hours." (SP5_title, looking-glass-bundle-v0.4.)

#### The cause
SP5_title is a trivial "title" phase, and `lib/title.js` **already existed and worked**. But `routing.test_first = require`
demands a test that **fails first** — and a phase whose code already exists can never produce one. Every attempt came back
`passes-already` ("it passes before any code is written, so it proves nothing"), or the writer made tool calls instead of
writing a test ("the reply had no code block"), and the build **refused each time** — for hours. The log's own hint:
"routing.test_first is require; prefer builds without it."

#### The fix
- **`lib/test-first.js decide(verdict, { alreadyDone })`** → `accept` | `accept-already` | `reject`:
  - `fails-as-expected` / `not-run` → **accept** (unchanged);
  - `passes-already` **and the phase's files already exist** → **accept-already** — the passing test is a valid regression
    test and the phase is already satisfied;
  - otherwise → **reject** (fail-first is still enforced for genuinely new code).
- **`idearium/api/index.js`** computes `alreadyDone` (every planned file exists on disk) and no longer **refuses** an
  already-satisfied phase under `require` — it builds without a new test, which completes because the files already pass
  (TF1 and the files' own checks still hold). A phase with no existing files is unchanged: fail-first still required.

#### Proof
`tests/modules/test-tf-already-done.test.js` — TD 4/4: accept paths unchanged; `passes-already` + files-exist → accept-already
(the unblock); `passes-already` with no files → reject (fail-first still enforced); invalid → reject.

#### Files
- `lib/test-first.js` — `decide`, exported.
- `idearium/api/index.js` — `alreadyDone`; `decide` in the verdict check; don't refuse an already-satisfied phase.
- `tests/modules/test-tf-already-done.test.js`, `run-all.js`; `lib/version.js`, `package.json` — 0.60.167.

#### Open (mapped next, from the same log)
Per-**chunk** retry (not just per-phase), and gating/DAG at every **gate · level · step** — James: "should be able to retry
per chunk, not just phase. we should do the gating for the pipeline, dag on every gates, level, step?"

## Ledger

### Build 0.60.167 — snap-0766 — 2026-10-19 06:38:20

- Archive: `nexus-0766_2026-10-19_v0.60.167.zip` (was `nexus-0.60.167.zip`)
- SHA-256: `65d119536594de0acf0637fe5033339559aa5e9ef02f12af264b480b803f3790`, 24.2 MB, downloaded 2026-10-19 06:39:29
- Kind: full
- Commit: `b11959a71343af383d396018cba92171ff9db22b`, tag `snap-0766`
- Files in archive: 6234. Changes against the build before it: **86 added, 112 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 7 | 33 | 0 |
| (root) | 21 | 8 | 0 |
| tests | 16 | 11 | 0 |
| lib | 16 | 10 | 0 |
| data | 17 | 1 | 0 |
| idearium | 2 | 14 | 0 |
| clear-glass | 2 | 9 | 0 |
| loom | 0 | 8 | 0 |
| cortex | 3 | 4 | 0 |
| guardian | 0 | 7 | 0 |
| cos | 1 | 2 | 0 |
| intelligence | 1 | 2 | 0 |
| diagnostic | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| versionium | 0 | 1 | 0 |

```
M .gitignore
M CHANGELOG-0.60.143.md
M CHANGELOG-0.60.144.md
M CHANGELOG-0.60.145.md
M CHANGELOG-0.60.146.md
A CHANGELOG-0.60.147.md
A CHANGELOG-0.60.148.md
A CHANGELOG-0.60.149.md
A CHANGELOG-0.60.150.md
A CHANGELOG-0.60.151.md
A CHANGELOG-0.60.152.md
A CHANGELOG-0.60.153.md
A CHANGELOG-0.60.154.md
A CHANGELOG-0.60.155.md
A CHANGELOG-0.60.156.md
A CHANGELOG-0.60.157.md
A CHANGELOG-0.60.158.md
A CHANGELOG-0.60.159.md
A CHANGELOG-0.60.160.md
A CHANGELOG-0.60.161.md
A CHANGELOG-0.60.162.md
A CHANGELOG-0.60.163.md
A CHANGELOG-0.60.164.md
A CHANGELOG-0.60.165.md
A CHANGELOG-0.60.166.md
A CHANGELOG-0.60.167.md
M README.md
M VERSION
M clear-glass/renderer/settings.html
A clear-glass/renderer/settings/sections/network.css
A clear-glass/renderer/settings/sections/network.js
M clear-glass/src/autofill/store.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/hat.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/driver/glass-host/main.js
M clear-glass/src/driver/glass.js
M clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/bridge.js
M cortex/core/raid/contract-gates.js
M cortex/event-taxonomy.js
M cortex/interaction-contract.json
M cos/event-taxonomy.js
M cos/runtime/run.js
A cos/testenv/run-target.js
M docs/2026-09-02-agent-mesh-full-map-phasemap.spec
M docs/2026-09-29-nex-node-store-phasemap.spec
M docs/2026-10-12-request-spine-phasemap.spec
M docs/2026-10-13-gates-that-learn-and-priorities-phasemap.spec
M docs/2026-10-13-nexus-memory-gates-and-contract-phasemap.spec
M docs/2026-10-13-projects-raid-and-gates-phasemap.spec
M docs/2026-10-15-gate-held-work-phasemap.spec
M docs/2026-10-16-durable-work-timeline-phasemap.spec
M docs/2026-10-17-debugging-product-phasemap.spec
M docs/2026-10-17-decisions-by-the-axioms.spec
M docs/2026-10-17-failure-mode-report-phasemap.spec
M docs/2026-10-17-pieces-not-order-phasemap.spec
M docs/2026-10-17-system-drawbridge-phasemap.spec
A docs/2026-10-18-compartment-environment-phasemap.spec
A docs/2026-10-18-debugging-product-phasemap.spec
A docs/2026-10-18-gate-memory-phasemap.spec
A docs/2026-10-18-gating-census-phasemap.spec
A docs/2026-10-19-gate-quality-checks-phasemap.spec
A docs/2026-10-19-gig-autofill-and-learn-phasemap.spec
A docs/2026-10-19-solid-build-foundation-phasemap.spec
M docs/CLAUDE.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/atlases/architect-atlas.md
M docs/atlases/clear-glass-atlas.md
M docs/atlases/components-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/core-atlas.md
M docs/atlases/cortex-atlas.md
M docs/atlases/cos-atlas.md
M docs/atlases/diagnostic-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/intelligence-atlas.md
M docs/atlases/loom-atlas.md
M docs/atlases/nexus-atlas.md
M docs/atlases/ollama-atlas.md
M docs/atlases/orchestrator-atlas.md
M docs/atlases/versionium-atlas.md
M docs/contracts/ct0-executable-contracts.contract
M guardian/lib/ncp-handler.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/interaction-contract.json
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/repo/nexus-self.js
M idearium/repo/spec-plan.js
M idearium/spec/idearium.spec
A idearium/ui/css/phase-graph-view.css
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/nexus-atlas.js
A idearium/ui/js/phase-graph-view.js
M idearium/ui/js/phases.js
M idearium/ui/js/plan-panel.js
A intelligence/lattice/node-lattice.js
M intelligence/registry-components.js
M intelligence/routes.js
M lib/atlas-generate.js
M lib/check-catalogue.js
A lib/checks/ck-231-half-states.js
A lib/checks/ck-237-verifiable.js
A lib/checks/ck-239-two-ends.js
A lib/checks/ck-252-primitive.js
A lib/context-sources.js
A lib/context-stream.js
A lib/gate-context.js
A lib/node-edges.js
M lib/node-export.js
A lib/node-schemas/schema.gate
A lib/node-schemas/schema.phase
A lib/phase-graph.js
A lib/pipeline-nodes.js
M lib/pipeline-routing.js
A lib/project-registry.js
A lib/readme-generate.js
M lib/repo-activity.js
M lib/repo-agent.js
M lib/run-watch.js
M lib/test-first.js
M lib/test-sandbox.js
M lib/version.js
A lib/work-journal.js
M loom/bootstrap.js
M loom/maps/build-surface-map.js
M loom/maps/economy-map.js
M loom/maps/run-state-map.js
M loom/scanners/phasemap-map.js
M loom/scanners/source-map.js
M package.json
M scripts/generate-atlases.js
M tests/modules/run-all.js
M tests/modules/test-agent-feed.test.js
A tests/modules/test-cg-gig-autofill.test.js
A tests/modules/test-cg-network-ui.test.js
M tests/modules/test-cg-settings-ui-files.test.js
M tests/modules/test-check-catalogue.test.js
```

48 more (mostly data, logs and archived files) are in the ledger file.

