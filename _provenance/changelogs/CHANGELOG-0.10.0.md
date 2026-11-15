# Nexus 0.10.0

| | |
|---|---|
| Built | 2026-08-01 10:09:56 → 2026-08-01 10:40:06 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.10.0 |
| Tag | `v0.10.0` → snap-0322 |
| Full file ledger | [LEDGER-0.10.0.csv](../ledger/LEDGER-0.10.0.csv) |

## Ledger

### Build 0.10.0-r1 — snap-0321 — 2026-08-01 10:09:56

- Archive: `nexus-0321_2026-08-01_v0.10.0-r1_schema-usermodel-um2.zip` (was `nexus-schema-usermodel-um2.zip`)
- SHA-256: `2b95289db99dcb1bafe5c83502f7626e211ebe7e557f776660ae9a941404ba3e`, 32.3 MB, downloaded 2026-08-01 10:11:46
- Kind: full
- Commit: `88af8eeba969ee9a793e51f57337b97acf33c092`, tag `snap-0321`
- Left out: embedded .git (5168 files, HEAD bb075ebebe4b5777db39fc1141e80882642f4129 (master))
- Files in archive: 3502. Changes against the build before it: **11 added, 36 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 24 | 0 |
| tests | 6 | 1 | 0 |
| docs | 1 | 5 | 0 |
| copilot | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |

```
M copilot/lib/user-model.js
M copilot/server.js
M cortex/core/raid/index.js
M cortex/memory/jaa-db.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/p3_test.json
M data/cortex/memory/raid_decisions.json
A data/cortex/memory/schema_drift.json
A data/cortex/memory/schemas.json
M data/cortex/memory/user_model_hypotheses.json
M data/ledger/cortex/cortex.gaps.list/2026-08-01.jsonl
M data/ledger/forge/forge.old/2026-08-01.jsonl
M data/ledger/forge/forge.patch/2026-08-01.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-01.jsonl
M data/ledger/reflection/reflection.engine/2026-08-01.jsonl
M data/ledger/test/test.echo.ping/2026-08-01.jsonl
M data/ledger/test/test.event.check/2026-08-01.jsonl
M data/ledger/test/test.widget.panel/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-01.jsonl
M docs/SPEC-REGISTRY.md
M docs/bda.spec
M docs/cfr.spec
A docs/cortex-schema-registry-phasemap.spec
M docs/raid-warp-verification-phasemap.spec
M docs/raid.spec
A lib/schema-registry.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-raid-drift-score.js
A tests/modules/test-raid-isolation-verify.js
A tests/modules/test-schema-observe-write.js
A tests/modules/test-schema-registry.js
A tests/modules/test-user-model-everywhere.js
A tests/modules/test-user-model-schema.js
```

### Build 0.10.0-r2 — snap-0322 — 2026-08-01 10:40:06

- Archive: `nexus-0322_2026-08-01_v0.10.0-r2_raid-p6-full.zip` (was `nexus-raid-p6-full.zip`)
- SHA-256: `af649e9abb6fca08fc1d25ff56eda0e3805709a50b879956a5e3cbf6356cca58`, 32.5 MB, downloaded 2026-08-01 10:48:31
- Kind: full
- Commit: `fbf91331b706b27268235cebad4730449e2275de`, tag `snap-0322`
- Left out: embedded .git (5214 files, HEAD 507d8a0b5690875c919ee769c059ff41ebf7f68b (master))
- Files in archive: 3507. Changes against the build before it: **5 added, 32 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 25 | 0 |
| tests | 4 | 1 | 0 |
| docs | 0 | 3 | 0 |
| copilot | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |

```
M copilot/lib/user-model.js
M copilot/server.js
M cortex/core/raid/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/raid_decisions.json
M data/cortex/memory/schema_drift.json
A data/cortex/memory/snapshots.json
M data/cortex/memory/user_model_hypotheses.json
M data/ledger/cortex/cortex.gaps.list/2026-08-01.jsonl
M data/ledger/forge/forge.old/2026-08-01.jsonl
M data/ledger/forge/forge.patch/2026-08-01.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-01.jsonl
M data/ledger/reflection/reflection.engine/2026-08-01.jsonl
M data/ledger/test/test.echo.ping/2026-08-01.jsonl
M data/ledger/test/test.event.check/2026-08-01.jsonl
M data/ledger/test/test.widget.panel/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-01.jsonl
M docs/cortex-schema-registry-phasemap.spec
M docs/raid-warp-verification-phasemap.spec
M docs/raid.spec
M tests/modules/run-all.js
A tests/modules/test-raid-compare-gate.js
A tests/modules/test-raid-rewind.js
A tests/modules/test-user-model-capture.js
A tests/modules/test-user-model-editable.js
```

