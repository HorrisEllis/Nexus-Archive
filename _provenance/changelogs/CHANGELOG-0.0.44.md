# Nexus 0.0.44

| | |
|---|---|
| Built | 2026-06-08 22:58:14 → 2026-06-09 19:48:56 |
| Builds on the main line | 1 |
| Other archives filed here | 1 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.44` → snap-0047 |
| Full file ledger | [LEDGER-0.0.44.csv](../ledger/LEDGER-0.0.44.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.44 — snap-0047 — 2026-06-08 22:58:14

- Archive: `nexus-0047_2026-06-08_v0.0.44_complete-6_declared-1.0.0.zip` (was `nexus-complete (6).zip`)
- SHA-256: `5a2edbe8bdcf4cd9078008ba504339dbaa8478a68bdfb5b7393825c814c67ce6`, 2.7 MB, downloaded 2026-06-08 22:59:46
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.44 to keep the line in order
- Commit: `3a7eda120e4d8e83f7171542bdf725f427005df2`, tag `snap-0047`
- Identical copy: `nexus-0047_2026-06-08_v0.0.44_complete-1_dup1_declared-1.0.0.zip` (was `nexus-complete-1.zip`)
- Files in archive: 647. Changes against the build before it: **2 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 2 | 5 | 0 |
| data | 0 | 2 | 0 |
| cli | 0 | 1 | 0 |

```
M cli/nexus-repl.js
M cortex/data/event_log.jsonl
M cortex/data/project_registry.jsonl
A cortex/data/resilience_log.jsonl
M cortex/foundation/admin-server.js
M cortex/foundation/poll-registry.js
M cortex/memory/jaa-db.js
A cortex/resilience/index.js
M data/bridge/events.jsonl
M data/cobalt/ledger.truth.jsonl
```

### artifact — 0048 — 2026-06-09 19:48:56

- Archive: `nexus-0048_2026-06-09_v0.0.44-side_cfr_declared-1.0.0.zip` (was `nexus-cfr.zip`)
- SHA-256: `f336f52057a6d0d250801f182ba54c2f89a3f4e9a57ba0db01537379679d7efe`, 0.1 MB, downloaded 2026-06-09 20:57:14
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.44 to keep the line in order
- Commit: `558fe92562b245cd5c765fb3a74efb19e18a36e3`, tag `snap-0048`
- Files in archive: 39. Changes against the build before it: **39 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0048_2026-06-09_v1.0.0_cfr | 39 | 0 | 0 |

```
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/create.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/destroy.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/events.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/hooks.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/list.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/map.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/run.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/schema.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/start.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/status.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/commands/stop.js
A nexus-0048_2026-06-09_v1.0.0_cfr/cli/index.js
A nexus-0048_2026-06-09_v1.0.0_cfr/compartment/process-runner.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/axioms.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/cli-detector.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/compiler-enum.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/constants.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/event-contracts.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/file-browser.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/fs-layer.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/hook-schema.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/runtime-enum.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/snapshot.js
A nexus-0048_2026-06-09_v1.0.0_cfr/foundation/types.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/event-bus.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/gates/compartment.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/gates/process.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/index.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/state-store.js
A nexus-0048_2026-06-09_v1.0.0_cfr/host/system-map.js
A nexus-0048_2026-06-09_v1.0.0_cfr/kernel.js
A nexus-0048_2026-06-09_v1.0.0_cfr/manager.js
A nexus-0048_2026-06-09_v1.0.0_cfr/package.json
A nexus-0048_2026-06-09_v1.0.0_cfr/siso/Event.js
A nexus-0048_2026-06-09_v1.0.0_cfr/siso/Gate.js
A nexus-0048_2026-06-09_v1.0.0_cfr/siso/Stream.js
A nexus-0048_2026-06-09_v1.0.0_cfr/siso/StreamLog.js
A nexus-0048_2026-06-09_v1.0.0_cfr/siso/index.js
A nexus-0048_2026-06-09_v1.0.0_cfr/test.js
```

