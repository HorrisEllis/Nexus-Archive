# Nexus 0.39.84

| | |
|---|---|
| Built | 2026-09-11 11:49:54 → 2026-09-11 12:47:52 |
| Builds on the main line | 4 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.84 |
| Tag | `v0.39.84` → snap-0546 |
| Full file ledger | [LEDGER-0.39.84.csv](../ledger/LEDGER-0.39.84.csv) |

## Ledger

### Build 0.39.84-r1 — snap-0543 — 2026-09-11 11:49:54

- Archive: `nexus-0543_2026-09-11_v0.39.84-r1_vnamed-0.39.84-1.zip` (was `nexus-v0_39_84-1.zip`)
- SHA-256: `58ffdee84214b9897c706dd9f9d5ced7d128433b7fba33fa8f79eee169b8eebf`, 76.6 MB, downloaded 2026-09-11 11:52:13
- Kind: full
- Commit: `4c8fce2c7a8efb3e84426e7cdedd6dfdb0626389`, tag `snap-0543`
- Left out: embedded .git (5293 files, HEAD c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master))
- Left out: node_modules (53 files)
- Files in archive: 4021. Changes against the build before it: **1602 added, 10 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1595 | 3 | 0 |
| data | 3 | 1 | 1 |
| tests | 1 | 3 | 0 |
| (root) | 2 | 0 | 0 |
| loom | 0 | 2 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M cortex/core/raid/index.js
M cortex/self-heal/escalation.js
M cortex/self-heal/fault-taxonomy.js
M idearium/api/index.js
A lib/agent-tools/generate-agent-nodes.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
A powershell.exe
M tests/modules/run-all.js
M tests/modules/test-escalation.js
M tests/modules/test-fault-taxonomy.js
A tests/modules/test-raid-agent-nodes.js
```

1601 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.84-r2 — snap-0544 — 2026-09-11 12:10:48

- Archive: `nexus-0544_2026-09-11_v0.39.84-r2_vnamed-0.39.84-fixed.zip` (was `nexus-v0_39_84-fixed.zip`)
- SHA-256: `78eeff95bd711030ef0f414cdf276ec4c4df1a335ba6b8ff68ac8947cc23b9c8`, 77.1 MB, downloaded 2026-09-11 12:14:32
- Kind: full
- Commit: `dc7244fc5e10f58486b7118430b3e0cb24386a62`, tag `snap-0544`
- Left out: embedded .git (5293 files, HEAD c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master))
- Left out: node_modules (53 files)
- Files in archive: 4021. Changes against the build before it: **0 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 3 | 0 |
| tests | 0 | 1 | 0 |

```
M clear-glass/renderer/settings.html
M clear-glass/src/copilot/wake-relay.js
M clear-glass/src/main/index.js
M tests/modules/test-wake-relay-real-endpoint.js
```

### Build 0.39.84-r3 — snap-0545 — 2026-09-11 12:17:42

- Archive: `nexus-0545_2026-09-11_v0.39.84-r3_vnamed-0.39.84-fixed-1.zip` (was `nexus-v0_39_84-fixed-1.zip`)
- SHA-256: `1d1f749c5aa18b0645f8443b937f0966ad9d81c148656f702c3acc652f8cf0d1`, 77.1 MB, downloaded 2026-09-11 12:22:22
- Kind: full
- Commit: `40f1509334871240c12881096a9672cdf5531ed7`, tag `snap-0545`
- Left out: embedded .git (5293 files, HEAD c20702354d38f53b7b0ebebf2c7e2efc61e2c185 (master))
- Left out: node_modules (53 files)
- Files in archive: 4022. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| warp | 0 | 1 | 0 |

```
M idearium/spec-engine/warp-build-dispatch.js
M lib/seam/adapters/warp-cascade.js
M tests/modules/run-all.js
A tests/modules/test-warp-cascade-provider-fallback.js
M warp/dispatch/cascade.js
```

### Build 0.39.84-r4 — snap-0546 — 2026-09-11 12:47:52

- Archive: `nexus-0546_2026-09-11_v0.39.84-r4_disconnect-recovery-files-2.zip` (was `nexus-disconnect-recovery-files (2).zip`)
- SHA-256: `4bd694fc95400266a01ce2f9f27615721a3a1671ece9b2d3aeca2f409b11c67e`, 0.2 MB, downloaded 2026-09-11 12:59:14
- Kind: overlay (a patch laid over the build before it)
- Commit: `afec43b3f268d433be50c003fac510edfdd3e2d5`, tag `snap-0546`
- Files in archive: 7. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 7 | 0 |

```
M guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
```

