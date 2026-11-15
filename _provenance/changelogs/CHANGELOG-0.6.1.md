# Nexus 0.6.1

| | |
|---|---|
| Built | 2026-06-16 05:50:08 → 2026-06-16 06:44:28 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.6.1 |
| Tag | `v0.6.1` → snap-0089 |
| Full file ledger | [LEDGER-0.6.1.csv](../ledger/LEDGER-0.6.1.csv) |

## Ledger

### Build 0.6.1-r1 — snap-0088 — 2026-06-16 05:50:08

- Archive: `nexus-0088_2026-06-16_v0.6.1-r1_system-24.zip` (was `nexus-system-24.zip`)
- SHA-256: `5324db3082ab6236f85c19b2af843ade976b11cc162edfb789a45814ef83d7d6`, 2.9 MB, downloaded 2026-06-16 06:17:38
- Kind: full
- Commit: `d07f81ff432eff6729169d213e4363bd086903ec`, tag `snap-0088`
- Files in archive: 751. Changes against the build before it: **24 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 16 | 0 | 0 |
| cortex | 3 | 2 | 0 |
| tests | 3 | 1 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 1 | 0 | 0 |

```
A cli/nexus-cli.js
M cortex/boot.js
M cortex/core/raid/index.js
A cortex/core/raid/intelligence-bridge.js
A cortex/core/raid/snr-filter.js
A cortex/liminal-space/index.js
A docs/autonomous-loop.spec
A docs/cli-reasoning.spec
A docs/constitutional-ai.spec
A docs/guardian-user-understanding.spec
A docs/guides/tutorial-build-first-spec.guide
A docs/hot-module-loader.spec
A docs/intelligence-bridge.spec
A docs/liminal-space.spec
A docs/nexus-cli.spec
A docs/nexus-shell-ui.spec
A docs/phase-map.spec
A docs/raid-snr-filter.spec
A docs/reflection-engine.spec
A docs/replay-engine.spec
A docs/request-handler.spec
A docs/user-model.spec
A lib/cli-reasoning.js
M lib/version.js
M package.json
M tests/brutal-results.json
A tests/modules/test-intelligence-bridge.js
A tests/modules/test-liminal-space.js
A tests/modules/test-snr-filter.js
```

### Build 0.6.1-r2 — snap-0089 — 2026-06-16 06:44:28

- Archive: `nexus-0089_2026-06-16_v0.6.1-r2_self-repair-loop-v2.zip` (was `nexus-self-repair-loop-v2.zip`)
- SHA-256: `e75dee8c10292e5daf77842a4bc42d46586381d65320f7c8799bb1ee374ad39d`, 0 MB, downloaded 2026-06-16 06:48:36
- Kind: overlay (a patch laid over the build before it)
- Commit: `eb74ab87558d46f56ff1af3767fe90e2d076e7e0`, tag `snap-0089`
- Files in archive: 11. Changes against the build before it: **5 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 5 | 5 | 0 |
| cli | 0 | 1 | 0 |

```
M cli/diagnose.js
A cortex/data/escalation_log.jsonl
A cortex/data/failure_modes.jsonl
A cortex/data/fault_taxonomy.jsonl
A cortex/data/fix_map.jsonl
A cortex/data/forge_patches.jsonl
M cortex/foundation/admin-server.js
M cortex/gate/gap-finder.js
M cortex/healer/index.js
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
```

