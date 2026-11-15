# Nexus 0.12.0

| | |
|---|---|
| Built | 2026-08-01 17:58:36 → 2026-08-01 18:26:02 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.12.0 |
| Tag | `v0.12.0` → snap-0325 |
| Full file ledger | [LEDGER-0.12.0.csv](../ledger/LEDGER-0.12.0.csv) |

## Ledger

### Build 0.12.0-r1 — snap-0323 — 2026-08-01 17:58:36

- Archive: `nexus-0323_2026-08-01_v0.12.0-r1_bridge-complete.zip` (was `nexus-bridge-complete.zip`)
- SHA-256: `2edcd19f0961256ce095ec2a3091ff8a748786fbd21dc274fee8cdc738291974`, 32.8 MB, downloaded 2026-08-01 18:04:25
- Kind: full
- Commit: `14f9e7d34d249b7a9c91f7f9299f25ea378643a4`, tag `snap-0323`
- Left out: embedded .git (5260 files, HEAD 746969a99d9d5fb5079e65f8919b5eca912124ea (master))
- Files in archive: 3532. Changes against the build before it: **25 added, 34 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 17 | 26 | 0 |
| tests | 5 | 1 | 0 |
| lib | 1 | 3 | 0 |
| copilot | 2 | 0 | 0 |
| docs | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
A copilot/assist-loop.js
A copilot/repair-on-prompt.js
M cortex/core/raid/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/raid_decisions.json
M data/cortex/memory/schema_drift.json
M data/cortex/memory/snapshots.json
M data/ledger/cortex/cortex.gaps.list/2026-08-01.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-02.jsonl
M data/ledger/forge/forge.old/2026-08-01.jsonl
A data/ledger/forge/forge.old/2026-08-02.jsonl
M data/ledger/forge/forge.patch/2026-08-01.jsonl
A data/ledger/forge/forge.patch/2026-08-02.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-01.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-01.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-01.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-01.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-01.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-02.jsonl
M data/ledger/reflection/reflection.engine/2026-08-01.jsonl
A data/ledger/reflection/reflection.engine/2026-08-02.jsonl
M data/ledger/test/test.echo.ping/2026-08-01.jsonl
A data/ledger/test/test.echo.ping/2026-08-02.jsonl
M data/ledger/test/test.event.check/2026-08-01.jsonl
A data/ledger/test/test.event.check/2026-08-02.jsonl
M data/ledger/test/test.widget.panel/2026-08-01.jsonl
A data/ledger/test/test.widget.panel/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-01.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-01.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-01.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-01.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-01.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-02.jsonl
M docs/raid-warp-verification-phasemap.spec
M docs/raid.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/ui-tools.js
M lib/stream-digest.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-assist-loop.js
A tests/modules/test-raid-verify-fused.js
A tests/modules/test-relevance-classify.js
A tests/modules/test-repair-on-prompt.js
A tests/modules/test-ui-tools.js
```

### Build 0.12.0-r2 — snap-0324 — 2026-08-01 18:06:40

- Archive: `nexus-0324_2026-08-01_v0.12.0-r2_copilot-window.zip` (was `nexus-copilot-window.zip`)
- SHA-256: `75dce0e7970558279abab0867280e83e58c88275323c9a190f9d195b88578a6f`, 32.9 MB, downloaded 2026-08-01 18:12:02
- Kind: full
- Commit: `bdd581497db072a62c411fddfbe04edaa5b703fe`, tag `snap-0324`
- Identical copy: `nexus-0324_2026-08-01_v0.12.0-r2_copilot-window-1_dup1.zip` (was `nexus-copilot-window (1).zip`)
- Left out: embedded .git (5271 files, HEAD 85b5326734b10c6434b52e39661cf2f81bfff55f (master))
- Files in archive: 3534. Changes against the build before it: **2 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 22 | 0 |
| cli | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
A cli/copilot-window.js
M cli/nexus.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-08-02.jsonl
M data/ledger/forge/forge.old/2026-08-02.jsonl
M data/ledger/forge/forge.patch/2026-08-02.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-02.jsonl
M data/ledger/reflection/reflection.engine/2026-08-02.jsonl
M data/ledger/test/test.echo.ping/2026-08-02.jsonl
M data/ledger/test/test.event.check/2026-08-02.jsonl
M data/ledger/test/test.widget.panel/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-02.jsonl
M docs/SPEC-REGISTRY.md
M tests/modules/run-all.js
A tests/modules/test-copilot-window.js
```

### Build 0.12.0-r3 — snap-0325 — 2026-08-01 18:26:02

- Archive: `nexus-0325_2026-08-01_v0.12.0-r3_cli-consolidated.zip` (was `nexus-cli-consolidated.zip`)
- SHA-256: `333bc12078bb1b1059cb474271bec560a8410db4d874be61f36fd714efc81bf8`, 32.9 MB, downloaded 2026-08-01 18:27:09
- Kind: full
- Commit: `edcbfe2f29e82b28ac74f3e6f9c03b8b6c7a0e33`, tag `snap-0325`
- Left out: embedded .git (5281 files, HEAD 264edf91d4de5a17f952cb9ed22cd1ed484b4654 (master))
- Files in archive: 3535. Changes against the build before it: **1 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 22 | 0 |
| tests | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |

```
M cli/nexus-cli.js
M copilot/cli.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-08-02.jsonl
M data/ledger/forge/forge.old/2026-08-02.jsonl
M data/ledger/forge/forge.patch/2026-08-02.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-02.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-02.jsonl
M data/ledger/reflection/reflection.engine/2026-08-02.jsonl
M data/ledger/test/test.echo.ping/2026-08-02.jsonl
M data/ledger/test/test.event.check/2026-08-02.jsonl
M data/ledger/test/test.widget.panel/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-02.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-02.jsonl
M tests/modules/run-all.js
A tests/modules/test-cli-consolidation.js
```

