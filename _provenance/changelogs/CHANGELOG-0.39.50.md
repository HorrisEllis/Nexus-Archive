# Nexus 0.39.50

| | |
|---|---|
| Built | 2026-09-05 22:35:28 → 2026-09-05 22:38:58 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.50 |
| Tag | `v0.39.50` → snap-0502 |
| Full file ledger | [LEDGER-0.39.50.csv](../ledger/LEDGER-0.39.50.csv) |

## Ledger

### Build 0.39.50-r1 — snap-0501 — 2026-09-05 22:35:28

- Archive: `nexus-0501_2026-09-05_v0.39.50-r1.zip` (was `nexus-v0.39.50.zip`)
- SHA-256: `db37253370ef9f51dc3e5bbf77baffdd2df67654fcc9bf89a1bed9e8c43d67c8`, 66.4 MB, downloaded 2026-09-05 22:36:02
- Kind: full
- Commit: `8cdff2042713852f07c1e3f58a91d12a4fcc2409`, tag `snap-0501`
- Identical copy: `nexus-0501_2026-09-05_v0.39.50-r1_1_dup1.zip` (was `nexus-v0.39.50 (1).zip`)
- Left out: embedded .git (4101 files, HEAD 60656ad6cafc09303bf0110240514ee96bfe4a08 (master))
- Files in archive: 3853. Changes against the build before it: **62 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 35 | 0 | 0 |
| cortex | 24 | 0 | 0 |
| tests | 2 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| clear-glass | 0 | 2 | 0 |
| docs | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/providers/host.js
A cortex/data/snapshots/17f8615c-ccf6-4a0f-8e80-0088e5d48cef.nex
A cortex/data/snapshots/19841dd9-a076-4501-934e-2e16d8bc9076.nex
A cortex/data/snapshots/1d79ef95-3817-479b-adb0-ec8c72d307ea.nex
A cortex/data/snapshots/252e9e83-18b2-4a3d-9a78-0640f79bb502.nex
A cortex/data/snapshots/401d3269-4657-4657-8394-b19faaa857ef.nex
A cortex/data/snapshots/4fd50b98-26c9-4c0d-b4a1-4755f1eac896.nex
A cortex/data/snapshots/5023925c-e30a-466d-840d-8b3deb36e63a.nex
A cortex/data/snapshots/529aeeb8-0ede-47d2-bb0b-34c037a342d0.nex
A cortex/data/snapshots/54f7f8c8-2e44-4ac2-9e2e-d6818649ef10.nex
A cortex/data/snapshots/5733c776-b30f-44c0-b655-280e8b3daf79.nex
A cortex/data/snapshots/60af510d-05b6-4eb2-940c-561653398779.nex
A cortex/data/snapshots/6c5cce93-527f-4ccc-8191-2141de3b0e51.nex
A cortex/data/snapshots/7deb38bd-c51b-4a0d-a92b-a0e9f23843f2.nex
A cortex/data/snapshots/83beeaec-e490-4774-815d-e3d752d6e870.nex
A cortex/data/snapshots/87d2d9cb-0e04-4d63-8da7-7cc8721785fb.nex
A cortex/data/snapshots/9aaddb7f-b5df-4503-a7b1-fe3555c21cfc.nex
A cortex/data/snapshots/9ba38bb2-d98f-4581-acd9-7014e364d2cb.nex
A cortex/data/snapshots/9c0dcd6d-db1c-4690-8315-cc5509a97384.nex
A cortex/data/snapshots/b1778c0b-0dd9-4436-8f6e-056db68d0e2a.nex
A cortex/data/snapshots/b8c280e0-1eee-454d-acb9-6d73f5199eb4.nex
A cortex/data/snapshots/d165e916-7e9e-4e36-8d68-b2d5a0d9e32d.nex
A cortex/data/snapshots/d3fe5beb-ed69-4721-aa9d-37bda691fe33.nex
A cortex/data/snapshots/df86049b-f310-4fef-a3cc-4de00effb89c.nex
A cortex/data/snapshots/fc2d983a-82db-4143-a33a-e683acf3f6d7.nex
A data/autopilot/autopilot.log
A data/bridge/bridge_requests.buffer.jsonl
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/guardian_settings.json
A data/cortex/memory/settings.json
A data/guardian/ledger/boot/events.ndjson
A data/guardian/ledger/cfr/event_log.jsonl
A data/ledger/bridge/b.y/2026-09-06.jsonl
A data/ledger/bridge/b/2026-09-06.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-09-06.jsonl
A data/ledger/cortex/cortex.raid/2026-09-06.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-09-06.jsonl
A data/ledger/forge/forge.patch/2026-09-06.jsonl
A data/ledger/guardian/g.x/2026-09-06.jsonl
A data/ledger/guardian/g/2026-09-06.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-09-06.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-09-06.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-09-06.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-09-06.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-09-06.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-09-06.jsonl
A data/ledger/test/test.echo.ping/2026-09-06.jsonl
A data/ledger/test/test.event.check/2026-09-06.jsonl
A data/ledger/test/test.widget.panel/2026-09-06.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-09-06.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-09-06.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-09-06.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-09-06.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-09-06.jsonl
A data/raid/ledger/cfr/event_log.jsonl
A docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M guardian/clear-glass-bridge.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-agent-mesh-guardian-coverage.js
A tests/modules/test-provider-host-respawn.js
M tests/spawn-provider-tab.test.js
```

### Build 0.39.50-r2 — snap-0502 — 2026-09-05 22:38:58

- Archive: `nexus-0502_2026-09-05_v0.39.50-r2_2.zip` (was `nexus-v0.39.50 (2).zip`)
- SHA-256: `0a24108fb686f4c531311e1f8a920256207a630ae0a858dcf1583c63d5417ce5`, 66.4 MB, downloaded 2026-09-05 22:39:51
- Kind: full
- Commit: `5e4b62b46737e0cd569a7aebcb0905f3880b3bb0`, tag `snap-0502`
- Left out: embedded .git (4105 files, HEAD 630ea01f92ef1d695073e1d4107e11dd186c1b03 (master))
- Files in archive: 3854. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 0 | 0 |

```
A tests/verify-ncp-agents.js
```

