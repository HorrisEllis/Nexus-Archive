# Nexus 0.13.0

| | |
|---|---|
| Built | 2026-08-01 21:09:58 → 2026-08-01 23:00:52 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.13.0 |
| Tag | `v0.13.0` → snap-0327 |
| Full file ledger | [LEDGER-0.13.0.csv](../ledger/LEDGER-0.13.0.csv) |

## Ledger

### Build 0.13.0-r1 — snap-0326 — 2026-08-01 21:09:58

- Archive: `nexus-0326_2026-08-01_v0.13.0-r1_awareness-routing-complete.zip` (was `nexus-awareness-routing-complete.zip`)
- SHA-256: `af10dfffa541d0060b49cd0eaa266afd458933f802431a4bd78b2ed1cd6c5bc3`, 33.4 MB, downloaded 2026-08-01 22:16:40
- Kind: full
- Commit: `fbc9e1d74d7811b1bee295096d6ad26733721187`, tag `snap-0326`
- Left out: embedded .git (5361 files, HEAD 323f5746c9a133e932295c6fe33d255a7910d81e (master))
- Files in archive: 3550. Changes against the build before it: **15 added, 31 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 22 | 0 |
| tests | 6 | 1 | 0 |
| copilot | 2 | 3 | 0 |
| lib | 4 | 1 | 0 |
| docs | 1 | 3 | 0 |
| (root) | 0 | 1 | 0 |

```
A copilot/capability-extend.js
M copilot/lifeline.js
M copilot/server.js
A copilot/system-status.js
M copilot/tool-runtime.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/provider_accounts.json
A data/cortex/memory/routing_config.json
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
A docs/copilot-awareness-routing-phasemap.spec
M docs/copilot.spec
M docs/raid.spec
A lib/account-registry.js
A lib/agent-router.js
A lib/agent-tools/tool-guide.js
A lib/routing-config.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-account-registry.js
A tests/modules/test-agent-routing.js
A tests/modules/test-capability-extend.js
A tests/modules/test-lifeline-ask.js
A tests/modules/test-system-status.js
A tests/modules/test-tool-guide.js
```

### Build 0.13.0-r2 — snap-0327 — 2026-08-01 23:00:52

- Archive: `nexus-0327_2026-08-01_v0.13.0-r2_observability-phasemap.zip` (was `nexus-observability-phasemap.zip`)
- SHA-256: `67838ea25ddbd88456b71046b6c790eb4df0a1737b3fba226535db5ed84664cb`, 33.4 MB, downloaded 2026-08-01 23:02:17
- Kind: full
- Commit: `6a8bc4e2d0427eae749fd9da1726de303ddf04bf`, tag `snap-0327`
- Left out: embedded .git (5372 files, HEAD d6ea9bbc1ad27db2b1e58f253b6692d57f3dc0eb (master))
- Files in archive: 3551. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 2 | 0 |

```
M docs/SPEC-REGISTRY.md
A docs/nexus-observability-tablet-phasemap.spec
M docs/raid.spec
```

