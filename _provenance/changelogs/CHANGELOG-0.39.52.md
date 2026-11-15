# Nexus 0.39.52

| | |
|---|---|
| Built | 2026-09-06 05:45:08 → 2026-09-06 10:00:06 |
| Builds on the main line | 4 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.52 |
| Tag | `v0.39.52` → snap-0511 |
| Full file ledger | [LEDGER-0.39.52.csv](../ledger/LEDGER-0.39.52.csv) |

## Ledger

### Build 0.39.52-r1 — snap-0508 — 2026-09-06 05:45:08

- Archive: `nexus-0508_2026-09-06_v0.39.52-r1.zip` (was `nexus-v0.39.52.zip`)
- SHA-256: `558e10b3d858eb31a317819e99c15db0118883c4eb734a02c1926c41178e958f`, 67.2 MB, downloaded 2026-09-06 05:49:04
- Kind: full
- Commit: `2458c0059f65c7e23e6ab936f62f1aa6cd2c2f4b`, tag `snap-0508`
- Left out: embedded .git (4243 files, HEAD 18311db2128f82752e6b715023c07213367c88f3 (master))
- Files in archive: 3612. Changes against the build before it: **3 added, 18 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 7 | 2 |
| tests | 2 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| docs | 0 | 1 | 1 |
| lib | 0 | 2 | 0 |
| _archive | 1 | 0 | 0 |
| cortex | 0 | 1 | 0 |
| data | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A _archive/bridge-retired-2026-09-06/docs-bridge.spec
M autopilot.js
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
D clear-glass/renderer/mesh-picker.js
M clear-glass/src/api/settings.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/network/install.js
D clear-glass/src/network/pulse-registry.js
M clear-glass/src/network/routes.js
M cortex/self-heal/escalation.js
M data/alk/decisions.jsonl
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
D docs/bridge.spec
M guardian/event-taxonomy.js
M lib/queue.js
M lib/version.js
M package.json
A tests/copilot-bridge-direct-dispatch.test.js
A tests/modules/autopilot-status-server-eaddrinuse.test.js
M tests/modules/queue.test.js
M tests/modules/test-escalation.js
M tests/verify-ncp-agents.js
```

### Build 0.39.52-r2 — snap-0509 — 2026-09-06 05:54:44

- Archive: `nexus-0509_2026-09-06_v0.39.52-r2_consolidated.zip` (was `nexus-v0_39_52-consolidated.zip`)
- SHA-256: `ddd62d2eee01d3e97f031234c708aec0abec512c1c7e80da44c1c7583a4ad7db`, 67.2 MB, downloaded 2026-09-06 06:01:09
- Kind: full
- Commit: `88a2b6fbeda487f291a94d86c6c5dff651fe117d`, tag `snap-0509`
- Left out: embedded .git (4243 files, HEAD 18311db2128f82752e6b715023c07213367c88f3 (master))
- Files in archive: 3614. Changes against the build before it: **2 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 2 | 5 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/mesh-picker.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/network/install.js
A clear-glass/src/network/pulse-registry.js
M clear-glass/src/network/routes.js
```

### Build 0.39.52-r3 — snap-0510 — 2026-09-06 09:56:58

- Archive: `nexus-0510_2026-09-06_v0.39.52-r3_session-patch.zip` (was `nexus-session-2026-09-06-patch.zip`)
- SHA-256: `bd2c558c4d7cefa8b53e2079ca3b6f891fc86f139da46cd05c69f203c7c55ffc`, 0.2 MB, downloaded 2026-09-06 09:59:04
- Kind: overlay (a patch laid over the build before it)
- Commit: `f4351e29949abc5a6f325b8867e017d49d754e91`, tag `snap-0510`
- Files in archive: 17. Changes against the build before it: **8 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 5 | 1 | 0 |
| _archive | 2 | 0 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A _archive/2026-09-06-emerge-consumer-retired/README.md
A _archive/2026-09-06-emerge-consumer-retired/consumer.js
M architect/service.js
M autopilot.js
M clear-glass/src/providers/gm-shim.js
M copilot/module-builder.js
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M eravos/server.js
A lib/system-registry.js
M lib/version.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
A tests/modules/test-architect-pulse-migration.js
A tests/modules/test-emerge-direct-compile.js
A tests/modules/test-eravos-pulse-migration.js
A tests/modules/test-gm-shim-sse-streaming.js
A tests/modules/test-system-registry.js
```

### Build 0.39.52-r4 — snap-0511 — 2026-09-06 10:00:06

- Archive: `nexus-0511_2026-09-06_v0.39.52-r4_full.zip` (was `nexus-full-2026-09-06.zip`)
- SHA-256: `470b0ebb6b0e393929ddfa51c68d6b7b0f1b52fc4ab9a97abe0888771f01bae8`, 98 MB, downloaded 2026-09-06 10:01:05
- Kind: full
- Commit: `f5ced705fbe14156f414d799a9197eda8635ad76`, tag `snap-0511`
- Left out: embedded .git (4243 files, HEAD 18311db2128f82752e6b715023c07213367c88f3 (master))
- Left out: node_modules (39 files)
- Files in archive: 4021. Changes against the build before it: **400 added, 27 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 385 | 17 | 0 |
| cortex | 14 | 1 | 0 |
| idearium | 1 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| emerge | 0 | 0 | 1 |
| loom | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M blueprint-index.json
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
D emerge/consumer.js
M ollama/config.js
M package-lock.json
```

423 more (mostly data, logs and archived files) are in the ledger file.

