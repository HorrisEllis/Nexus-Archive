# Nexus 0.39.83

| | |
|---|---|
| Built | 2026-09-11 10:56:06 → 2026-09-11 11:42:48 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.83, 0.39.84 |
| Tag | `v0.39.83` → snap-0542 |
| Full file ledger | [LEDGER-0.39.83.csv](../ledger/LEDGER-0.39.83.csv) |

## Ledger

### Build 0.39.83-r1 — snap-0540 — 2026-09-11 10:56:06

- Archive: `nexus-0540_2026-09-11_v0.39.83-r1.zip` (was `nexus-v0_39_83.zip`)
- SHA-256: `25bc2d457bea3f6a95492c694b3f9bd8cd4db08d56970e1aefb371fd050efa6b`, 76.5 MB, downloaded 2026-09-11 11:08:08
- Kind: full
- Commit: `df2959de4965bb350b51d161ed331a7010738c14`, tag `snap-0540`
- Left out: embedded .git (5247 files, HEAD 73ad8d5b37b3c31fe2cada9efc54e9054cab7c46 (master))
- Left out: node_modules (53 files)
- Files in archive: 3995. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M guardian/lib/jobs.js
M guardian/server.js
M lib/node-export.js
M lib/version.js
M package.json
A tests/modules/guardian-job-persistence.test.js
```

### Build 0.39.83-r2 — snap-0541 — 2026-09-11 11:35:40

- Archive: `nexus-0541_2026-09-11_v0.39.83-r2_vnamed-0.39.84.zip` (was `nexus-v0_39_84.zip`)
- SHA-256: `c5c5a1b6b8b041fb01af67c9a37eda46be265f3c5805eec2f81dac59500e0a9a`, 76.4 MB, downloaded 2026-09-11 11:37:29
- Kind: full
- Claimed version: 0.39.84 (registry 0.39.83, file name 0.39.84); filed under 0.39.83 to keep the line in order
- Commit: `90a8f466304fba0e2c03ecc4a1c7bfa436388fe9`, tag `snap-0541`
- Left out: embedded .git (5285 files, HEAD 0ee477fe4e0cba972b12671cfa250f8519e10a3b (master))
- Left out: node_modules (53 files)
- Files in archive: 4013. Changes against the build before it: **18 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 11 | 3 | 0 |
| data | 4 | 0 | 0 |
| tests | 1 | 3 | 0 |
| loom | 0 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M cortex/core/raid/index.js
A cortex/data/snapshots/13e0fb85-b2d1-49f8-80fc-adb55d5c97c6.nex
A cortex/data/snapshots/66cb515c-1d0e-4097-96c4-50270ab8afe1.nex
A cortex/data/snapshots/7079e1f9-90ed-4aa7-a970-e4c31d978416.nex
A cortex/data/snapshots/70991c6a-076d-4efb-a3b7-305fe79970fa.nex
A cortex/data/snapshots/74355cc1-8fed-464b-b149-0a9c1a2afaf2.nex
A cortex/data/snapshots/9407c6ee-8ac9-4905-9043-2aa461cf3061.nex
A cortex/data/snapshots/956f7c72-d986-4047-a64a-671ceaf7bd67.nex
A cortex/data/snapshots/960af4c3-f706-42fc-876a-efa8c02071b9.nex
A cortex/data/snapshots/a7d28225-9b2c-4bd7-b009-07a7e0dd10c7.nex
A cortex/data/snapshots/d112436a-4b54-451c-bd99-7cf2a06b6bea.nex
A cortex/data/snapshots/f355056f-adfd-4e84-bdf8-ff96f39ba6b0.nex
M cortex/self-heal/escalation.js
M cortex/self-heal/fault-taxonomy.js
A data/cortex/memory/idearium_spec_chunks.json
A data/cortex/memory/idearium_spec_manifests.json
A data/cortex/memory/settings.json
A data/raid/ledger/cfr/event_log.jsonl
M idearium/api/index.js
A lib/agent-tools/generate-agent-nodes.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
M tests/modules/test-escalation.js
M tests/modules/test-fault-taxonomy.js
A tests/modules/test-raid-agent-nodes.js
A writeback-failures.jsonl
```

### Build 0.39.83-r3 — snap-0542 — 2026-09-11 11:42:48

- Archive: `nexus-0542_2026-09-11_v0.39.83-r3.zip` (was `nexus-v0.39.83.zip`)
- SHA-256: `4609b5b6c1f63c5adf4bba1595a4068472e571cec0a02d13bef5731f4b417bd0`, 53.6 MB, downloaded 2026-09-11 11:47:08
- Kind: full
- Commit: `2d9353ac5360db4ecff0e19bad2549cf778bb146`, tag `snap-0542`
- Identical copy: `nexus-0542_2026-09-11_v0.39.83-r3_1_dup1.zip` (was `nexus-v0.39.83 (1).zip`)
- Left out: embedded .git (5253 files, HEAD 729733d8dad9d45b836db2e71feafa3ab1efa473 (master))
- Left out: node_modules (53 files)
- Files in archive: 2420. Changes against the build before it: **1 added, 11 modified, 1594 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 3 | 1588 |
| data | 1 | 1 | 3 |
| tests | 0 | 3 | 1 |
| loom | 0 | 2 | 0 |
| (root) | 0 | 0 | 1 |
| clear-glass | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 0 | 1 |

```
M clear-glass/src/mesh/agent-mesh.js
M cortex/core/raid/index.js
M cortex/self-heal/escalation.js
M cortex/self-heal/fault-taxonomy.js
M idearium/api/index.js
D lib/agent-tools/generate-agent-nodes.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
M tests/modules/test-escalation.js
M tests/modules/test-fault-taxonomy.js
D tests/modules/test-raid-agent-nodes.js
```

1594 more (mostly data, logs and archived files) are in the ledger file.

