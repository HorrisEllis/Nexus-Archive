# Nexus 0.39.46

| | |
|---|---|
| Built | 2026-09-02 21:45:54 → 2026-09-05 16:29:52 |
| Builds on the main line | 12 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.46, 0.39.47 |
| Tag | `v0.39.46` → snap-0497 |
| Full file ledger | [LEDGER-0.39.46.csv](../ledger/LEDGER-0.39.46.csv) |

## Ledger

### Build 0.39.46-r1 — snap-0485 — 2026-09-02 21:45:54

- Archive: `nexus-0485_2026-09-02_v0.39.46-r1_vnamed-0.39.46-leading-token-match.zip` (was `nexus-v0_39_46-leading-token-match.zip`)
- SHA-256: `20606f92faed7340199ad41624431f351c1931f98e2e925d892696d34c5a80c9`, 10.4 MB, downloaded 2026-09-02 21:46:53
- Kind: full
- Commit: `71c3884a797d156992e436057bd6edf0156329ac`, tag `snap-0485`
- Files in archive: 2328. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 0 | 0 |

```
A cortex/core/raid/context-gate.js
```

### Build 0.39.46-r2 — snap-0486 — 2026-09-02 21:55:06

- Archive: `nexus-0486_2026-09-02_v0.39.46-r2_vnamed-0.39.46-leading-token-match-2.zip` (was `nexus-v0_39_46-leading-token-match (2).zip`)
- SHA-256: `cbc4cd8c89d7976a5a96ac57a30ce567455fb4f81f271c81a078925dc460a29e`, 43 MB, downloaded 2026-09-02 21:55:22
- Kind: full
- Commit: `1f79affb0a0bb257055f8967c7842930c437d538`, tag `snap-0486`
- Left out: embedded .git (3499 files, HEAD 16f512e95051bb1c6281a60102cf08dd308ae1b4 (master))
- Left out: node_modules (39 files)
- Files in archive: 2661. Changes against the build before it: **333 added, 34 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 333 | 29 | 0 |
| (root) | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M blueprint-index.json
M package-lock.json
```

365 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.46-r3 — snap-0487 — 2026-09-02 22:11:08

- Archive: `nexus-0487_2026-09-02_v0.39.46-r3_handoff.zip` (was `nexus-v0_39_46-handoff.zip`)
- SHA-256: `10d45e1bf888921418514a52f38c695f85598c044199bc3ab8ef2f0905d58303`, 41.9 MB, downloaded 2026-09-02 22:12:01
- Kind: full
- Commit: `6e22b5974c4088a3805f16b5c1676d50d5a8bfc7`, tag `snap-0487`
- Left out: embedded .git (3548 files, HEAD 827a72f19915c5fe28d6208e01aef6db973fbb22 (master))
- Files in archive: 2342. Changes against the build before it: **15 added, 48 modified, 334 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 30 | 333 |
| cortex | 10 | 2 | 0 |
| tests | 2 | 3 | 1 |
| guardian | 0 | 4 | 0 |
| (root) | 1 | 2 | 0 |
| clear-glass | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| _archive | 1 | 0 | 0 |
| architect | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A .gitignore
M clear-glass/src/ipc/bridge.js
M clear-glass/src/preload/index.js
M cortex/core/raid/contract-boundary.js
A docs/2026-09-03-session-handoff-2.md
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/version.js
M loom/maps/raid-events-and-tools-map.js
M orchestrator/lib/contract-handshake.js
M package-lock.json
M package.json
M tests/modules/run-all.js
D tests/modules/test-agent-mesh-guardian-connect.js
A tests/modules/test-contract-handshake-paths.js
M tests/modules/test-guardian-agent-registry.js
M tests/modules/test-raid-officiator.js
A tests/modules/test-userscript-mixed-content-fix.js
```

377 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.46-r4 — snap-0488 — 2026-09-02 23:16:22

- Archive: `nexus-0488_2026-09-02_v0.39.46-r4.zip` (was `nexus.zip`)
- SHA-256: `7376677c3f3ad752a7cb1b4fb2cf57bead5586fb616eed092040cd52b6fdb5c5`, 44.1 MB, downloaded 2026-09-02 23:19:24
- Kind: full
- Commit: `ebe28d7e70b7c110a523d23572a4a6dfef33eb11`, tag `snap-0488`
- Left out: embedded .git (3605 files, HEAD 60465c79913ed4387ae82e3050d619c02f15704e (master))
- Files in archive: 2639. Changes against the build before it: **297 added, 21 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 262 | 0 | 0 |
| data | 29 | 17 | 0 |
| guardian | 6 | 1 | 0 |
| loom | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
M docs/2026-09-02-nexus-vision-master-phasemap.spec
A guardian/lib/dispatch-pool-bridge.js
A guardian/lib/dispatcher.js
A guardian/lib/index.js
A guardian/lib/jobs.js
A guardian/lib/ncp-handler.js
A guardian/lib/provider-routing.js
M guardian/server.js
M loom/maps/session-2026-08-14-map.js
```

309 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.46-r5 — snap-0489 — 2026-09-03 01:02:22

- Archive: `nexus-0489_2026-09-03_v0.39.46-r5_merged-1.zip` (was `nexus-merged-1.zip`)
- SHA-256: `7c4325ea3d368c2415356def5db3956d59561c87f9f3e25a972be132419405cc`, 12.3 MB, downloaded 2026-09-03 01:05:26
- Kind: full
- Commit: `ac9fca01fce7fa7b0aee98a01907ffaba1a374d7`, tag `snap-0489`
- Files in archive: 2656. Changes against the build before it: **17 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| mesh | 14 | 0 | 0 |
| lib | 1 | 2 | 0 |
| guardian | 2 | 1 | 0 |

```
A guardian/routes/autonomous-loop.js
A guardian/routes/mesh.js
M guardian/server.js
M lib/autonomous-loop.js
M lib/intake.js
A lib/project-compartment.js
A mesh/README.md
A mesh/config.js
A mesh/daemons.js
A mesh/install.js
A mesh/lib/canvas-persistence.js
A mesh/lib/crypto-engine.js
A mesh/lib/ddns.js
A mesh/lib/dns-server.js
A mesh/lib/firewall.js
A mesh/lib/host-rotation.js
A mesh/lib/key-manager.js
A mesh/lib/mesh-snr-filter.js
A mesh/lib/port-registry.js
A mesh/lib/reverse-proxy.js
```

### Build 0.39.46-r6 — snap-0490 — 2026-09-03 03:16:18

- Archive: `nexus-0490_2026-09-03_v0.39.46-r6_merged-with-git.zip` (was `nexus-merged-with-git.zip`)
- SHA-256: `f28f4082f9e545a65694552949853d494b64d1ac8dc2a6592ea1ba1e740515f0`, 44.5 MB, downloaded 2026-09-03 03:21:07
- Kind: full
- Commit: `c57e0dac45902670d9e57562c7d478e46bb2e229`, tag `snap-0490`
- Left out: embedded .git (3605 files, HEAD 60465c79913ed4387ae82e3050d619c02f15704e (master))
- Left out: node_modules (53 files)
- Files in archive: 2664. Changes against the build before it: **8 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 3 | 0 | 0 |
| ui | 3 | 0 | 0 |
| guardian | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| lib | 2 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A docs/brainos-live-control-panel.spec
A docs/command-index-per-system.spec
A docs/universal-block-primitive.spec
M guardian/server.js
M guardian/spec/guardian.spec
M idearium/api/index.js
M idearium/spec/idearium.spec
A lib/dynamic-project-parser.js
A lib/spec-from-markdown.js
M ollama/spec/ollama.spec
M orchestrator/spec/orchestrator.spec
M package.json
A ui/import-project/import-project.css
A ui/import-project/import-project.html
A ui/lib/repo-ingest.js
```

### Build 0.39.46-r7 — snap-0491 — 2026-09-03 03:21:58

- Archive: `nexus-0491_2026-09-03_v0.39.46-r7_merged-with-git-1.zip` (was `nexus-merged-with-git-1.zip`)
- SHA-256: `836dd7e686db61c8b20377fce7a95608c30e4101d310d745416673f52843861f`, 44.5 MB, downloaded 2026-09-03 03:23:42
- Kind: full
- Commit: `7a8d9a3ad91a2684a0e25a1bdfbc8012fb2e8450`, tag `snap-0491`
- Left out: embedded .git (3605 files, HEAD 60465c79913ed4387ae82e3050d619c02f15704e (master))
- Left out: node_modules (53 files)
- Files in archive: 2664. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M docs/universal-block-primitive.spec
M lib/agent-tools/tools/execution/run-closed-loop.js
```

### Build 0.39.46-r8 — snap-0492 — 2026-09-03 03:28:02

- Archive: `nexus-0492_2026-09-03_v0.39.46-r8_merged-with-git-2.zip` (was `nexus-merged-with-git-2.zip`)
- SHA-256: `6e71bacb887ff8a6356e3f7c205102de6b0ccdb077a2709fea4964ce574de150`, 44.8 MB, downloaded 2026-09-03 03:29:41
- Kind: full
- Commit: `0665f8e346efd2b87201e2aeb02dcea892bf10d4`, tag `snap-0492`
- Left out: embedded .git (3605 files, HEAD 60465c79913ed4387ae82e3050d619c02f15704e (master))
- Left out: node_modules (53 files)
- Files in archive: 2721. Changes against the build before it: **57 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 57 | 2 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M docs/command-index-per-system.spec
M idearium/api/index.js
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/00-brainos-main-brainos-v2-html-7cf7d3fa.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/01-brainos-main-brainos-html-e503bf18.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/02-brainos-main-changelog-md-13c4d754.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/03-brainos-main-manifest-json-d5776de5.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/04-brainos-main-readme-investor-md-d058d005.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/05-brainos-main-readme-technical-md-615913ad.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/06-brainos-main-readme-md-c3ce9722.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/07-brainos-main-roadmap-md-038ab3ce.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/08-brainos-main-account-manager-js-21979425.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/09-brainos-main-adapters-js-8851e421.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/10-brainos-main-agent-factory-js-8bdf0e8f.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/11-brainos-main-agent-registry-js-40c4a2a8.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/12-brainos-main-bootloader-js-c2dc5c67.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/13-brainos-main-bridge-canvas-persistence-js-da91353f.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/14-brainos-main-bus-js-1f2c731e.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/15-brainos-main-crypto-engine-js-a5113494.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/16-brainos-main-ddns-js-0955d322.md
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/78a72e70-56a9-4c94-987f-c7285f1b1de2.spec
A idearium/data/specs/78a72e70-56a9-4c94-987f-c7285f1b1de2/manifest.json
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/00-brainos-main-brainos-v2-html-5056f7bd.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/01-brainos-main-brainos-html-d894c1fa.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/02-brainos-main-changelog-md-5c4b7c3c.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/03-brainos-main-manifest-json-3fec9a1a.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/04-brainos-main-readme-investor-md-0747e06d.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/05-brainos-main-readme-technical-md-8b4faf38.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/06-brainos-main-readme-md-4c3b13fc.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/07-brainos-main-roadmap-md-2bf98ac3.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/08-brainos-main-account-manager-js-ddf0f871.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/09-brainos-main-adapters-js-7d3dbb84.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/10-brainos-main-agent-factory-js-22506523.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/11-brainos-main-agent-registry-js-3771b6dc.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/12-brainos-main-bootloader-js-ab776b67.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/13-brainos-main-bridge-canvas-persistence-js-7e5f2775.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/14-brainos-main-bus-js-d6afabda.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/15-brainos-main-crypto-engine-js-b3da16b1.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/16-brainos-main-ddns-js-8c408b75.md
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/a434ae13-9e53-4e45-be1b-7d31929df2d4.spec
A idearium/data/specs/a434ae13-9e53-4e45-be1b-7d31929df2d4/manifest.json
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/00-brainos-main-brainos-v2-html-466fcd6a.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/01-brainos-main-brainos-html-1f2800b1.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/02-brainos-main-changelog-md-2d13b930.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/03-brainos-main-manifest-json-99e3cdee.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/04-brainos-main-readme-investor-md-21644aa7.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/05-brainos-main-readme-technical-md-3e218635.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/06-brainos-main-readme-md-851d5511.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/07-brainos-main-roadmap-md-02838549.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/08-brainos-main-account-manager-js-31678243.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/09-brainos-main-adapters-js-f2c96899.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/10-brainos-main-agent-factory-js-35d1eeb3.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/11-brainos-main-agent-registry-js-31067c81.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/12-brainos-main-bootloader-js-788ae62f.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/13-brainos-main-bridge-canvas-persistence-js-6209a763.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/14-brainos-main-bus-js-0a400455.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/15-brainos-main-crypto-engine-js-fe0c317c.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/16-brainos-main-ddns-js-958ee399.md
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/ac80119a-2d63-420f-86f4-e9d5ef674c12.spec
A idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/manifest.json
M idearium/spec/idearium.spec
M lib/agent-tools/tools/execution/run-closed-loop.js
```

### artifact — 0493 — 2026-09-03 07:12:34

- Archive: `nexus-0493_2026-09-03_v0.39.46-side_session-changes-1.zip` (was `nexus-session-changes (1).zip`)
- SHA-256: `3f403b167a78607a869133c62cd6fd6af425c5d9d50d65575b2fc2e9cbb5c223`, 0.1 MB, downloaded 2026-09-03 08:05:02
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `d2c872ff3152879599f109023d1521b5a2dbbbc3`, tag `snap-0493`
- Files in archive: 32. Changes against the build before it: **32 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0493_2026-09-03_unversioned_session-changes-1 | 32 | 0 | 0 |

```
A nexus-0493_2026-09-03_unversioned_session-changes-1/CHANGELOG-this-session.md
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/brainos/route-graph.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/clear-glass/src/network/canvas-persistence.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/clear-glass/src/network/routes.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/cli/commands/export.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/cli/commands/import.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/cli/index.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/foundation/event-contracts.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/foundation/snapshot.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/host/export.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/host/gates/compartment.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/cos/host/index.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/docs/brainos-live-control-panel.spec
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/node-export.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/node-schemas.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/agent.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/command.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/component.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/contract.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/cos.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/crystal.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/failure_mode.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/gap.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/hat.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/index.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/ledger.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/macro.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/model.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/node.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/pat.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/schema.js
A nexus-0493_2026-09-03_unversioned_session-changes-1/handoff/lib/schemas/tool.js
```

### Build 0.39.46-r9 — snap-0494 — 2026-09-03 12:42:12

- Archive: `nexus-0494_2026-09-03_v0.39.46-r9_full-named-3.3.0.zip` (was `nexus-full-3.3.0.zip`)
- SHA-256: `a5b1fe9bd00dd1d1fa51ea3ac57bf004d597a8d3b9c254145aa57d43e5027524`, 58.4 MB, downloaded 2026-09-03 12:48:11
- Kind: full
- Commit: `138b655060247d146fa7563be6c6772857a1e7ae`, tag `snap-0494`
- Left out: embedded .git (3907 files, HEAD 7ea8b496e18de9b1a4579451913419112765c8c1 (master))
- Left out: node_modules (39 files)
- Files in archive: 3845. Changes against the build before it: **1124 added, 105 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 626 | 2 | 0 |
| data | 363 | 68 | 0 |
| idearium | 99 | 10 | 0 |
| clear-glass | 18 | 5 | 0 |
| tests | 10 | 1 | 0 |
| guardian | 2 | 7 | 0 |
| lib | 6 | 2 | 0 |
| (root) | 0 | 3 | 0 |
| loom | 0 | 2 | 0 |
| ollama | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| mesh | 0 | 1 | 0 |

```
M blueprint-index.json
M clear-glass/package.json
M clear-glass/src/core/bus.js
A clear-glass/src/downloads/intake-bridge.js
M clear-glass/src/main/index.js
A clear-glass/src/network/canvas-persistence.js
A clear-glass/src/network/config.js
A clear-glass/src/network/crypto-engine.js
A clear-glass/src/network/daemons.js
A clear-glass/src/network/ddns.js
A clear-glass/src/network/dns-server.js
A clear-glass/src/network/firewall.js
A clear-glass/src/network/host-rotation.js
A clear-glass/src/network/install.js
A clear-glass/src/network/key-manager.js
A clear-glass/src/network/network-snr-filter.js
A clear-glass/src/network/port-registry.js
A clear-glass/src/network/reverse-proxy.js
A clear-glass/src/network/routes.js
M clear-glass/src/providers/host.js
M clear-glass/src/userscripts/manager.js
A clear-glass/test/downloads-intake-bridge.test.js
A clear-glass/test/network-install.test.js
A clear-glass/test/userscripts-manifest.test.js
M cortex/core/raid/contract-intake.js
M docs/2026-09-02-nexus-vision-master-phasemap.spec
M guardian/agents/index.js
A guardian/lib/artifact-namer.js
M guardian/lib/ncp-handler.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
A guardian/userscripts.yaml
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/index.js
A idearium/lib/guardian-stream.cjs
M idearium/package.json
M idearium/repo/index.js
A idearium/spec-engine/blocks.yaml
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M lib/hat-forge.js
M lib/intent-classifier.js
A lib/node-export.js
A lib/node-schemas.js
A lib/node-schemas/component.js
A lib/node-schemas/hat.js
A lib/node-schemas/node.js
A lib/self-build-loop.js
M loom/maps/session-2026-08-14-map.js
M mesh/README.md
M ollama/abliterated-catalog.js
M ollama/config.js
M package-lock.json
A tests/modules/idearium-agent-routing.test.mjs
A tests/modules/idearium-phase-compartment.test.mjs
A tests/modules/idearium-phase-sync.test.mjs
M tests/modules/run-all.js
A tests/modules/test-artifact-namer.js
A tests/modules/test-b1-synthesize-contract.js
A tests/modules/test-ncp-handler-sr3.js
A tests/modules/test-node-export.js
A tests/modules/test-node-schemas.js
A tests/modules/test-self-build-loop.js
A tests/modules/test-sr11-import-pipeline.js
```

1158 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.46-r10 — snap-0495 — 2026-09-03 12:49:52

- Archive: `nexus-0495_2026-09-03_v0.39.46-r10_vnamed-0.39.47.zip` (was `nexus-v0.39.47.zip`)
- SHA-256: `4ed11e9b3c03659f0270547b6dcc99f76ecc58a109b69b0eb23a2cb69d1d3e61`, 58.4 MB, downloaded 2026-09-03 12:52:50
- Kind: full
- Claimed version: 0.39.47 (registry 0.39.46, file name 0.39.47); filed under 0.39.46 to keep the line in order
- Commit: `c54c8fea08f05794ccdea459b7e3d182edf4b499`, tag `snap-0495`
- Identical copy: `nexus-0495_2026-09-03_v0.39.46-r10_vnamed-0.39.47-1_dup1.zip` (was `nexus-v0.39.47-1.zip`)
- Left out: embedded .git (3911 files, HEAD 0827333602d476799024c9b957bb73bef8259d58 (master))
- Left out: node_modules (39 files)
- Files in archive: 3845. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |

```
M CHANGELOG.md
M package.json
```

### Build 0.39.46-r11 — snap-0496 — 2026-09-03 15:02:02

- Archive: `nexus-0496_2026-09-03_v0.39.46-r11_merged-with-git-history.zip` (was `nexus-merged-with-git-history.zip`)
- SHA-256: `d580ce8245397ba93810ff9eb7bce1e0c6f1462f2d2b255b7364d21d77e9fe27`, 65.3 MB, downloaded 2026-09-03 15:05:29
- Kind: full
- Commit: `fe334372066a607144cb8204ae5a2521d15c431d`, tag `snap-0496`
- Left out: embedded .git (3978 files, HEAD c730bbdb30231f433f7efbbc99617d38b12fb5aa (master))
- Left out: node_modules (55 files)
- Files in archive: 4198. Changes against the build before it: **353 added, 113 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 238 | 2 | 0 |
| idearium | 91 | 9 | 0 |
| data | 8 | 75 | 0 |
| tests | 8 | 2 | 0 |
| ollama | 1 | 8 | 0 |
| guardian | 1 | 6 | 0 |
| (root) | 0 | 5 | 0 |
| nexus | 4 | 0 | 0 |
| bridge | 1 | 2 | 0 |
| loom | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |

```
M CHANGELOG.md
M blueprint-index.json
A bridge/lib/command-index-extract.js
M bridge/server.js
M bridge/spec/bridge.spec
M clear-glass/src/providers/host.js
M cortex/core/raid/contract-intake.js
A docs/nexus-nerve-design-philosophy.spec
A guardian/lib/command-index-extract.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M loom/maps/session-2026-08-14-map.js
A nexus/ui/brainos/brainos-canvas.js
A nexus/ui/brainos/brainos-interaction-contract.json
A nexus/ui/brainos/brainos.css
A nexus/ui/brainos/brainos.js
A ollama/lib/command-index.js
M ollama/routes/jobs.js
M ollama/routes/models.js
M ollama/routes/queue.js
M ollama/routes/stream.js
M ollama/routes/system.js
M ollama/routes/uploads.js
M ollama/server.js
M ollama/spec/ollama.spec
M package-lock.json
M package.json
A tests/modules/brainos-canvas.test.js
A tests/modules/brainos-panel-canvas-integration.test.js
A tests/modules/brainos-panel.test.js
A tests/modules/bridge-command-index.test.js
M tests/modules/contract-intake-dependency-graph.test.js
A tests/modules/guardian-command-index.test.js
A tests/modules/idearium-phase-compartment-integration.test.js
A tests/modules/ollama-command-index.test.js
A tests/modules/raid-retry-escalation.test.js
M tests/modules/run-all.js
```

416 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.46-r12 — snap-0497 — 2026-09-05 16:29:52

- Archive: `nexus-0497_2026-09-05_v0.39.46-r12_merge-safety.zip` (was `nexus-v0_39_46-merge-safety.zip`)
- SHA-256: `471800cf679d16d32d45583b3875e41a817888c2c6e92b28184c34b98c24efd9`, 42 MB, downloaded 2026-09-05 17:56:48
- Kind: full
- Commit: `ca8aba99c85a5ba5ef735a64bcb8ef3158eb9ae8`, tag `snap-0497`
- Left out: embedded .git (3645 files, HEAD f66c6f434bd997c38ccef6de34109805a2767ee8 (master))
- Files in archive: 2243. Changes against the build before it: **4 added, 44 modified, 1959 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 2 | 1126 |
| data | 0 | 0 | 503 |
| idearium | 0 | 4 | 247 |
| clear-glass | 0 | 5 | 18 |
| tests | 2 | 2 | 18 |
| lib | 0 | 6 | 9 |
| guardian | 0 | 3 | 11 |
| mesh | 0 | 0 | 14 |
| ollama | 0 | 10 | 1 |
| docs | 0 | 1 | 4 |
| nexus | 0 | 0 | 4 |
| (root) | 0 | 3 | 0 |
| ui | 0 | 0 | 3 |
| bridge | 0 | 2 | 1 |
| loom | 0 | 3 | 0 |
| versionium | 1 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |

```
D bridge/lib/command-index-extract.js
M bridge/server.js
M bridge/spec/bridge.spec
M clear-glass/package.json
M clear-glass/spec/clear-glass.spec
M clear-glass/src/core/bus.js
D clear-glass/src/downloads/intake-bridge.js
M clear-glass/src/main/index.js
D clear-glass/src/network/canvas-persistence.js
D clear-glass/src/network/config.js
D clear-glass/src/network/crypto-engine.js
D clear-glass/src/network/daemons.js
D clear-glass/src/network/ddns.js
D clear-glass/src/network/dns-server.js
D clear-glass/src/network/firewall.js
D clear-glass/src/network/host-rotation.js
D clear-glass/src/network/install.js
D clear-glass/src/network/key-manager.js
D clear-glass/src/network/network-snr-filter.js
D clear-glass/src/network/port-registry.js
D clear-glass/src/network/reverse-proxy.js
D clear-glass/src/network/routes.js
M clear-glass/src/userscripts/manager.js
D clear-glass/test/downloads-intake-bridge.test.js
D clear-glass/test/network-install.test.js
D clear-glass/test/userscripts-manifest.test.js
M copilot/spec/copilot.spec
M cortex/core/raid/contract-intake.js
M cortex/spec/cortex.spec
M docs/2026-09-02-nexus-vision-master-phasemap.spec
D docs/brainos-live-control-panel.spec
D docs/command-index-per-system.spec
D docs/nexus-nerve-design-philosophy.spec
D docs/universal-block-primitive.spec
M guardian/agents/index.js
D guardian/lib/artifact-namer.js
D guardian/lib/command-index-extract.js
D guardian/lib/dispatch-pool-bridge.js
D guardian/lib/dispatcher.js
D guardian/lib/index.js
D guardian/lib/jobs.js
D guardian/lib/ncp-handler.js
D guardian/lib/provider-routing.js
D guardian/routes/autonomous-loop.js
D guardian/routes/mesh.js
M guardian/server.js
M guardian/spec/guardian.spec
D guardian/userscripts.yaml
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/index.js
D idearium/lib/guardian-stream.cjs
D idearium/spec-engine/blocks.yaml
M idearium/spec/idearium.spec
M lib/agent-tools/tools/execution/run-closed-loop.js
M lib/autonomous-loop.js
D lib/dynamic-project-parser.js
M lib/hat-forge.js
M lib/intake.js
M lib/intent-classifier.js
M lib/loom-map.js
D lib/node-export.js
D lib/node-schemas.js
D lib/node-schemas/component.js
D lib/node-schemas/hat.js
D lib/node-schemas/node.js
D lib/project-compartment.js
D lib/self-build-loop.js
D lib/spec-from-markdown.js
M loom/maps/session-2026-08-14-map.js
M loom/spec/loom.spec
D mesh/README.md
D mesh/config.js
D mesh/daemons.js
D mesh/install.js
D mesh/lib/canvas-persistence.js
D mesh/lib/crypto-engine.js
D mesh/lib/ddns.js
D mesh/lib/dns-server.js
D mesh/lib/firewall.js
D mesh/lib/host-rotation.js
D mesh/lib/key-manager.js
D mesh/lib/mesh-snr-filter.js
D mesh/lib/port-registry.js
D mesh/lib/reverse-proxy.js
D nexus/ui/brainos/brainos-canvas.js
D nexus/ui/brainos/brainos-interaction-contract.json
D nexus/ui/brainos/brainos.css
D nexus/ui/brainos/brainos.js
M ollama/abliterated-catalog.js
M ollama/config.js
D ollama/lib/command-index.js
M ollama/routes/jobs.js
M ollama/routes/models.js
M ollama/routes/queue.js
M ollama/routes/stream.js
M ollama/routes/system.js
M ollama/routes/uploads.js
M ollama/server.js
M ollama/spec/ollama.spec
M orchestrator/spec/orchestrator.spec
M package-lock.json
M package.json
A scripts/post-commit-history-writer.js
D tests/modules/brainos-canvas.test.js
D tests/modules/brainos-panel-canvas-integration.test.js
D tests/modules/brainos-panel.test.js
D tests/modules/bridge-command-index.test.js
M tests/modules/contract-intake-dependency-graph.test.js
D tests/modules/guardian-command-index.test.js
D tests/modules/idearium-agent-routing.test.mjs
D tests/modules/idearium-phase-compartment-integration.test.js
D tests/modules/idearium-phase-compartment.test.mjs
D tests/modules/idearium-phase-sync.test.mjs
D tests/modules/ollama-command-index.test.js
D tests/modules/raid-retry-escalation.test.js
M tests/modules/run-all.js
D tests/modules/test-artifact-namer.js
D tests/modules/test-b1-synthesize-contract.js
D tests/modules/test-ncp-handler-sr3.js
D tests/modules/test-node-export.js
D tests/modules/test-node-schemas.js
D tests/modules/test-self-build-loop.js
A tests/modules/test-spec-yaml-validity.js
D tests/modules/test-sr11-import-pipeline.js
A tests/modules/test-versionium-history-writer.js
D ui/import-project/import-project.css
D ui/import-project/import-project.html
D ui/lib/repo-ingest.js
A versionium/lib/history-writer.js
M versionium/spec/versionium.spec
```

1876 more (mostly data, logs and archived files) are in the ledger file.

