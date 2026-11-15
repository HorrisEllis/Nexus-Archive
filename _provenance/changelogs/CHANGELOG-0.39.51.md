# Nexus 0.39.51

| | |
|---|---|
| Built | 2026-09-05 22:56:32 → 2026-09-06 05:37:02 |
| Builds on the main line | 5 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.46, 0.39.51 |
| Tag | `v0.39.51` → snap-0507 |
| Full file ledger | [LEDGER-0.39.51.csv](../ledger/LEDGER-0.39.51.csv) |

## Ledger

### Build 0.39.51-r1 — snap-0503 — 2026-09-05 22:56:32

- Archive: `nexus-0503_2026-09-05_v0.39.51-r1.zip` (was `nexus-v0.39.51.zip`)
- SHA-256: `415c34e98e3bd81c35c42b8adf0857f18bc79daa582b6605ed86e872e42f6679`, 66.5 MB, downloaded 2026-09-05 23:07:33
- Kind: full
- Commit: `7324da77703d4e54bd4bca4f06c40fc15868eb03`, tag `snap-0503`
- Left out: embedded .git (4126 files, HEAD c086065486c9635e2709d350a8acc97442d24e2a (master))
- Files in archive: 3856. Changes against the build before it: **2 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 2 | 0 |
| data | 1 | 1 | 0 |
| guardian | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A data/alk/decisions.jsonl
M data/cortex/memory/event_log.json
M guardian/lib/dispatcher.js
M guardian/lib/ncp.js
M lib/version.js
M package.json
A tests/dispatcher-stale-socket.test.js
M tests/spec-engine-yaml-import.test.js
M tests/verify-ncp-agents.js
```

### Build 0.39.51-r2 — snap-0504 — 2026-09-06 03:46:32

- Archive: `nexus-0504_2026-09-06_v0.39.51-r2_merged-wired-with-git-history_declared-0.39.46.zip` (was `nexus-merged-wired-with-git-history.zip`)
- SHA-256: `13b77112be3f8905ad6c518ee5a50eb1a0efe3807ff35f22ee86a04610286145`, 65.4 MB, downloaded 2026-09-06 03:50:25
- Kind: full
- Claimed version: 0.39.46 (registry 0.39.46, file name none); filed under 0.39.51 to keep the line in order
- Commit: `e0e700b698b4bb0eb57d32660209ad48b93c9387`, tag `snap-0504`
- Left out: embedded .git (4008 files, HEAD 6f317b8583242826797a253866ef33915e7663ec (master))
- Left out: node_modules (55 files)
- Files in archive: 4199. Changes against the build before it: **491 added, 48 modified, 148 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 490 | 13 | 23 |
| idearium | 0 | 7 | 67 |
| cortex | 0 | 0 | 28 |
| lib | 1 | 4 | 14 |
| tests | 0 | 2 | 10 |
| guardian | 0 | 9 | 0 |
| clear-glass | 0 | 7 | 0 |
| loom | 0 | 1 | 5 |
| (root) | 0 | 3 | 0 |
| erosmancer | 0 | 2 | 0 |
| docs | 0 | 0 | 1 |

```
M CHANGELOG.md
M autopilot.js
M clear-glass/plugins/adblocker/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/options/store.js
M clear-glass/src/providers/host.js
M clear-glass/wire/nexus-wire.js
D docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/hostile/index.ts
M guardian/clear-glass-bridge.js
M guardian/lib/dispatcher.js
M guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/ui/js/app.js
A lib/agent-tools/tools/clear-glass/eros-wire-client.js
M lib/agent-tools/tools/clear-glass/macro.js
M lib/node-export.js
M lib/node-schemas.js
D lib/node-schemas/agent.js
D lib/node-schemas/command.js
D lib/node-schemas/contract.js
D lib/node-schemas/cos.js
D lib/node-schemas/crystal.js
D lib/node-schemas/failure_mode.js
D lib/node-schemas/gap.js
D lib/node-schemas/idea.js
D lib/node-schemas/ledger.js
D lib/node-schemas/macro.js
D lib/node-schemas/model.js
D lib/node-schemas/pat.js
D lib/node-schemas/schema.js
D lib/node-schemas/tool.js
M lib/version.js
D loom/schema/component.js
D loom/schema/concern.js
M loom/schema/definitions.js
D loom/schema/hook.js
D loom/schema/seam.js
D loom/schema/wire.js
M package.json
D tests/dispatcher-stale-socket.test.js
D tests/loom-schema-split.test.js
M tests/modules/run-all.js
D tests/modules/test-agent-mesh-guardian-coverage.js
M tests/modules/test-ncp-handler-sr3.js
D tests/modules/test-provider-host-respawn.js
D tests/node-export-idea-tagged-query.test.js
D tests/node-schemas-split.test.js
D tests/spawn-provider-tab.test.js
D tests/spec-engine-yaml-import.test.js
D tests/stale-sweep-socket-close.test.js
D tests/verify-ncp-agents.js
```

621 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.51-r3 — snap-0505 — 2026-09-06 04:53:10

- Archive: `nexus-0505_2026-09-06_v0.39.51-r3_1.zip` (was `nexus-v0.39.51-1.zip`)
- SHA-256: `c431b6f4ca0e2c1cdfcca91adba1e5e625f668baff10b0dacfcb628970c23412`, 66.8 MB, downloaded 2026-09-06 05:00:40
- Kind: full
- Commit: `eaf8b708631d90d2f524d8011d684fa9d8c7ab47`, tag `snap-0505`
- Left out: embedded .git (4186 files, HEAD 3cfb330f3d6ef57b0fed3ae0a6b2da7d4bf04ab7 (master))
- Files in archive: 3610. Changes against the build before it: **109 added, 68 modified, 698 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 24 | 19 | 484 |
| idearium | 2 | 11 | 189 |
| cortex | 28 | 0 | 0 |
| _archive | 25 | 0 | 0 |
| lib | 14 | 7 | 1 |
| bridge | 0 | 0 | 18 |
| tests | 10 | 3 | 2 |
| guardian | 0 | 9 | 0 |
| clear-glass | 0 | 7 | 0 |
| loom | 5 | 1 | 0 |
| ui | 0 | 1 | 2 |
| (root) | 0 | 3 | 0 |
| hooks | 0 | 1 | 1 |
| docs | 1 | 1 | 0 |
| erosmancer | 0 | 2 | 0 |
| contracts | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| service | 0 | 0 | 1 |

```
M CHANGELOG.md
M autopilot.js
D bridge/causal/expectation.js
D bridge/causal/graph.js
D bridge/causal/ledger.js
D bridge/causal/projections.js
D bridge/causal/schema.js
D bridge/causal/server.js
D bridge/config.js
D bridge/identity.js
D bridge/index.js
D bridge/interaction-contract.json
D bridge/ledger.js
D bridge/lib/command-index-extract.js
D bridge/registry-components.js
D bridge/registry.js
D bridge/router.js
D bridge/server.js
D bridge/spec/bridge.spec
D bridge/types.js
M clear-glass/plugins/adblocker/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/options/store.js
M clear-glass/src/providers/host.js
M clear-glass/wire/nexus-wire.js
M cli/diagnose.js
M contracts/SYSTEM-CONTRACTS.js
A docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M docs/AXIOMS-v3.1.md
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/hostile/index.ts
M guardian/clear-glass-bridge.js
M guardian/lib/dispatcher.js
M guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
D hooks/bridge.hooks.js
M hooks/index.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/repo/watcher.js
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec-engine/warp-build-dispatch.js
M idearium/test/e2e-pipeline.test.js
A idearium/test/run-e2e-pipeline-isolated.cjs
M idearium/ui/js/app.js
D lib/agent-tools/tools/clear-glass/eros-wire-client.js
M lib/agent-tools/tools/clear-glass/macro.js
M lib/file-integrity.js
M lib/node-export.js
M lib/node-schemas.js
A lib/node-schemas/agent.js
A lib/node-schemas/command.js
A lib/node-schemas/contract.js
A lib/node-schemas/cos.js
A lib/node-schemas/crystal.js
A lib/node-schemas/failure_mode.js
A lib/node-schemas/gap.js
A lib/node-schemas/idea.js
A lib/node-schemas/ledger.js
A lib/node-schemas/macro.js
A lib/node-schemas/model.js
A lib/node-schemas/pat.js
A lib/node-schemas/schema.js
A lib/node-schemas/tool.js
M lib/system-check.js
M lib/uid/component-map.js
M lib/version.js
A loom/schema/component.js
A loom/schema/concern.js
M loom/schema/definitions.js
A loom/schema/hook.js
A loom/schema/seam.js
A loom/schema/wire.js
M package.json
M scripts/verify-wires.js
D service/bridge-service.js
M tests/brutal.test.js
A tests/dispatcher-stale-socket.test.js
A tests/loom-schema-split.test.js
D tests/modules/bridge-command-index.test.js
D tests/modules/bridge-response-survival.test.js
M tests/modules/run-all.js
A tests/modules/test-agent-mesh-guardian-coverage.js
M tests/modules/test-ncp-handler-sr3.js
A tests/modules/test-provider-host-respawn.js
A tests/node-export-idea-tagged-query.test.js
A tests/node-schemas-split.test.js
A tests/spawn-provider-tab.test.js
A tests/spec-engine-yaml-import.test.js
A tests/stale-sweep-socket-close.test.js
A tests/verify-ncp-agents.js
D ui/bridge/index.html
D ui/channels/bridge/bridge.html
M ui/tv-shell/index.html
```

770 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.51-r4 — snap-0506 — 2026-09-06 05:17:18

- Archive: `nexus-0506_2026-09-06_v0.39.51-r4_2.zip` (was `nexus-v0.39.51-2.zip`)
- SHA-256: `375d550135fd63976ce78232247f1fe69ad0b8a3312b75757ad0dbf57fd20ed4`, 67 MB, downloaded 2026-09-06 05:20:08
- Kind: full
- Commit: `65f81596cdedfff873e07cf3eb636c02fe39362f`, tag `snap-0506`
- Left out: embedded .git (4219 files, HEAD 6ece3181e270d7079892a609fea37e02d2295980 (master))
- Files in archive: 3611. Changes against the build before it: **1 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M cortex/self-heal/escalation.js
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M lib/queue.js
A tests/modules/autopilot-status-server-eaddrinuse.test.js
M tests/modules/queue.test.js
M tests/modules/test-escalation.js
```

### Build 0.39.51-r5 — snap-0507 — 2026-09-06 05:37:02

- Archive: `nexus-0507_2026-09-06_v0.39.51-r5_mesh-and-taxonomy.zip` (was `nexus-v0_39_51-mesh-and-taxonomy.zip`)
- SHA-256: `04f1fc409a3bbb6b714b6a97213996967976428d3349dc9ce50b2b3187a7bd48`, 32 MB, downloaded 2026-09-06 05:43:41
- Kind: full
- Commit: `b6617d57b28293b752fecaa33f8846e8b47e4a7e`, tag `snap-0507`
- Files in archive: 3612. Changes against the build before it: **2 added, 12 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 2 | 5 | 0 |
| tests | 0 | 2 | 1 |
| (root) | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/mesh-picker.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/network/install.js
A clear-glass/src/network/pulse-registry.js
M clear-glass/src/network/routes.js
M cortex/self-heal/escalation.js
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M guardian/event-taxonomy.js
M lib/queue.js
D tests/modules/autopilot-status-server-eaddrinuse.test.js
M tests/modules/queue.test.js
M tests/modules/test-escalation.js
```

