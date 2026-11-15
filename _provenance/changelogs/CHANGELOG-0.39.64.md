# Nexus 0.39.64

| | |
|---|---|
| Built | 2026-09-07 07:02:52 → 2026-09-07 07:02:52 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.64 |
| Tag | `v0.39.64` → snap-0521 |
| Full file ledger | [LEDGER-0.39.64.csv](../ledger/LEDGER-0.39.64.csv) |

## Ledger

### Build 0.39.64 — snap-0521 — 2026-09-07 07:02:52

- Archive: `nexus-0521_2026-09-07_v0.39.64.zip` (was `nexus-v0_39_64.zip`)
- SHA-256: `ad2d0afb2530b5e2b25d2418fc6503370be25e569ada65e14bdea224ca9cb32b`, 71.3 MB, downloaded 2026-09-07 07:14:36
- Kind: full
- Commit: `2604b15e2f6925bd71ba8b3ff65ddd4c7594d2ad`, tag `snap-0521`
- Left out: embedded .git (4537 files, HEAD 21eeee95cd950dce8d9f0cac6552fb2e60c0acba (master))
- Files in archive: 3990. Changes against the build before it: **33 added, 52 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 46 | 0 |
| cortex | 31 | 0 | 0 |
| (root) | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
A cortex/data/snapshots/094e0883-af68-4858-9b2a-927ac139d815.nex
A cortex/data/snapshots/0e242953-19b4-4e12-9947-5676f33ff9d4.nex
A cortex/data/snapshots/14906ae5-4a93-4747-a609-a09c89517819.nex
A cortex/data/snapshots/16625177-3eff-4648-8980-7b6d75379792.nex
A cortex/data/snapshots/1d490872-589a-4b9d-9119-1d26e0672f06.nex
A cortex/data/snapshots/33c70ec2-fb7b-4895-876d-884290f75bc8.nex
A cortex/data/snapshots/35c3af93-c94e-48cc-9387-8bdfec132275.nex
A cortex/data/snapshots/39de14d3-aaff-46d4-a3c5-ac3ceca6bb5a.nex
A cortex/data/snapshots/48751497-e4ed-4fe5-952e-96db710602a3.nex
A cortex/data/snapshots/4e164e56-a3fe-47c9-888c-6508e0b3ddd2.nex
A cortex/data/snapshots/68f02fc8-0e06-42f4-8db7-8cb4ac71b715.nex
A cortex/data/snapshots/71d4a55f-77f1-4a42-b65e-bbc07e26e59b.nex
A cortex/data/snapshots/87790cd0-d8be-4214-8de2-ad2e693888f8.nex
A cortex/data/snapshots/95b065f8-8a27-42a4-8d8f-480369b8056d.nex
A cortex/data/snapshots/96098b5c-732c-4863-846b-c98ac3d3f97b.nex
A cortex/data/snapshots/990b848e-4c06-4169-9cfe-39b2c89a1493.nex
A cortex/data/snapshots/9d2c9efb-8a59-44d5-8436-6a819e78b7ac.nex
A cortex/data/snapshots/a6ebe05d-ed8d-476a-a0e6-3ba08685a0c2.nex
A cortex/data/snapshots/ac449bc4-18a8-413e-9804-afa8e7b28b01.nex
A cortex/data/snapshots/ad5ed9d7-3e32-4231-b6ac-323383c5bc65.nex
A cortex/data/snapshots/ae52bf1a-ea36-4dc1-a8f1-7cf455ecdfe9.nex
A cortex/data/snapshots/b3959c48-25a3-4ba5-a855-4294426dab3a.nex
A cortex/data/snapshots/bb609dd4-9859-49f0-9b57-ad5465b0e428.nex
A cortex/data/snapshots/bf90aaa4-89f4-4015-a246-d683c0cd9ba7.nex
A cortex/data/snapshots/c06d77c2-76ce-4fc1-9b9f-2c9b98d2c4b2.nex
A cortex/data/snapshots/ce37497c-aa90-43d3-9df4-7caa42cbb9b9.nex
A cortex/data/snapshots/d17f62f1-1902-491a-b5ba-3b7d25da2aba.nex
A cortex/data/snapshots/df82206a-4ae9-4d4b-a114-37fc3f09b9e5.nex
A cortex/data/snapshots/e2bd8c8e-1e83-473f-b3ed-120593ac4301.nex
A cortex/data/snapshots/f11dd8a4-c907-4c72-81b5-02e1b0ddd530.nex
A cortex/data/snapshots/f1c19ffc-1dd1-4204-8e4a-401e6d50527c.nex
M data/autopilot/autopilot.log
A data/chat-logs/2026-09-07T14-01-52-8458cbc8.jsonl
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/intake_drops.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/guardian/memory/settings.json
M data/idearium/event_log.jsonl
M data/ledger/bridge/b.y/2026-09-07.jsonl
M data/ledger/bridge/b/2026-09-07.jsonl
M data/ledger/copilot/copilot.introspect/2026-09-07.jsonl
M data/ledger/copilot/copilot.person-model/2026-09-07.jsonl
M data/ledger/copilot/copilot.person-model/session-h1.jsonl
M data/ledger/copilot/copilot.person-model/session-h2.jsonl
M data/ledger/copilot/copilot.person-model/session-own.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
M data/ledger/copilot/copilot.person-model/session-x1.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-09-07.jsonl
M data/ledger/cortex/cortex.raid/2026-09-07.jsonl
M data/ledger/forge/forge.old/2026-09-07.jsonl
M data/ledger/forge/forge.patch/2026-09-07.jsonl
M data/ledger/guardian/g.x/2026-09-07.jsonl
M data/ledger/guardian/g/2026-09-07.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-09-07.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-unregistered.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-1.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-2.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-3.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-09-07.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-09-07.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-09-07.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-09-07.jsonl
M data/ledger/nexus/self-build-loop/2026-09-07.jsonl
M data/ledger/reflection/reflection.engine/2026-09-07.jsonl
M data/ledger/test/test.echo.ping/2026-09-07.jsonl
M data/ledger/test/test.event.check/2026-09-07.jsonl
M data/ledger/test/test.widget.panel/2026-09-07.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-09-07.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-09-07.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-09-07.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-09-07.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-09-07.jsonl
M data/raid/ledger/cfr/event_log.jsonl
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M lib/system-check.js
M lib/version.js
M package-lock.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-system-check-emerge-stale-entry.js
```

