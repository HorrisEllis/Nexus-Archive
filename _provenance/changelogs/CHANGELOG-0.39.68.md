# Nexus 0.39.68

| | |
|---|---|
| Built | 2026-09-07 18:24:34 → 2026-09-07 21:22:32 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.68 |
| Tag | `v0.39.68` → snap-0526 |
| Full file ledger | [LEDGER-0.39.68.csv](../ledger/LEDGER-0.39.68.csv) |

## Ledger

### Build 0.39.68-r1 — snap-0525 — 2026-09-07 18:24:34

- Archive: `nexus-0525_2026-09-07_v0.39.68-r1.zip` (was `nexus-v0_39_68.zip`)
- SHA-256: `434b99471dd21201f82bdc787a84f689aac06c5ce70d65618819aa9f8872d727`, 73.5 MB, downloaded 2026-09-07 19:03:01
- Kind: full
- Commit: `40c364bc538db1c9f69fd96b6cc6b5db34c89428`, tag `snap-0525`
- Left out: embedded .git (4632 files, HEAD 0dd2b05fad12724a29fb9f99cb618f7406c05136 (master))
- Files in archive: 4113. Changes against the build before it: **32 added, 53 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 46 | 0 |
| cortex | 31 | 0 | 0 |
| (root) | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
A cortex/data/snapshots/0b619c1d-70e4-4780-9a25-221ce7872be7.nex
A cortex/data/snapshots/130b4d99-3a37-44de-a97b-07ab5edf9d4b.nex
A cortex/data/snapshots/142a6ed3-6df6-4c62-82de-b04cda400796.nex
A cortex/data/snapshots/15de788c-537f-4079-b90d-3d86dc631e42.nex
A cortex/data/snapshots/1f96b93a-e793-4e40-aaaf-975b81067bf8.nex
A cortex/data/snapshots/22ae84c0-25f0-4ffd-9487-7ecf5b2c7270.nex
A cortex/data/snapshots/2469df67-7904-45f4-9890-43c7ca217889.nex
A cortex/data/snapshots/2f300f68-5aca-45f3-ae13-6ff7535232ee.nex
A cortex/data/snapshots/3747058c-db25-49ea-a5e8-c0c66bd9eaf7.nex
A cortex/data/snapshots/424b2c32-1993-4a73-9e53-bff12385d7d3.nex
A cortex/data/snapshots/49e3772b-e461-4e20-8e43-9e0b6f0d1c48.nex
A cortex/data/snapshots/59f137b6-2d3b-4a90-91a5-5d3329196a21.nex
A cortex/data/snapshots/5caf2e06-04fe-4d91-9f46-02bfa787db97.nex
A cortex/data/snapshots/5fbc9ce3-d493-4732-8997-efc84015e061.nex
A cortex/data/snapshots/6ce852c0-7456-4849-91fe-e5965506b127.nex
A cortex/data/snapshots/7fa4cf35-155a-45e2-956a-10b237e69018.nex
A cortex/data/snapshots/8efd00ae-de9e-4a12-bdb3-607c3bd5df8c.nex
A cortex/data/snapshots/92dd16dc-3963-4053-b202-9efb1a05a219.nex
A cortex/data/snapshots/954b5615-c5a3-4ad1-8cd9-d4c96ada4b2e.nex
A cortex/data/snapshots/b2ccc327-3d0c-4534-924d-90043cd80f4a.nex
A cortex/data/snapshots/b5e5be93-85e4-493f-b507-ef7ae43f8294.nex
A cortex/data/snapshots/ba0893dc-a022-4ad9-9e77-6e9e89a0c7c6.nex
A cortex/data/snapshots/d0055884-e269-4c13-8344-71722e0d392c.nex
A cortex/data/snapshots/d0a5a911-7012-49ce-8fe1-a37d20616ce3.nex
A cortex/data/snapshots/d0b96c7c-bade-40db-9808-130d5b23f398.nex
A cortex/data/snapshots/dfefb009-50d3-41ad-87cb-262a2b522284.nex
A cortex/data/snapshots/e638aa08-9d9d-4087-902c-89722db05d65.nex
A cortex/data/snapshots/ed0581b9-7bc8-44e5-8503-41a835e721c5.nex
A cortex/data/snapshots/ee94cc89-c8c3-44bd-b79d-9012981dbcf4.nex
A cortex/data/snapshots/fa64e802-1885-4c57-8899-59ed57d84008.nex
A cortex/data/snapshots/fd57583e-3869-4be6-907c-129e5d02917c.nex
M data/autopilot/autopilot.log
A data/chat-logs/2026-09-08T01-23-05-40a9f20c.jsonl
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/intake_drops.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/guardian/memory/settings.json
M data/idearium/event_log.jsonl
M data/ledger/bridge/b.y/2026-09-08.jsonl
M data/ledger/bridge/b/2026-09-08.jsonl
M data/ledger/copilot/copilot.introspect/2026-09-08.jsonl
M data/ledger/copilot/copilot.person-model/2026-09-08.jsonl
M data/ledger/copilot/copilot.person-model/session-h1.jsonl
M data/ledger/copilot/copilot.person-model/session-h2.jsonl
M data/ledger/copilot/copilot.person-model/session-own.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
M data/ledger/copilot/copilot.person-model/session-x1.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-09-08.jsonl
M data/ledger/cortex/cortex.raid/2026-09-08.jsonl
M data/ledger/forge/forge.old/2026-09-08.jsonl
M data/ledger/forge/forge.patch/2026-09-08.jsonl
M data/ledger/guardian/g.x/2026-09-08.jsonl
M data/ledger/guardian/g/2026-09-08.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-09-08.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-unregistered.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-1.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-2.jsonl
M data/ledger/guardian/ncp-handler.artifact-introspect/session-job-with-artifacts-3.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-09-08.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-09-08.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-09-08.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-09-08.jsonl
M data/ledger/nexus/self-build-loop/2026-09-08.jsonl
M data/ledger/reflection/reflection.engine/2026-09-08.jsonl
M data/ledger/test/test.echo.ping/2026-09-08.jsonl
M data/ledger/test/test.event.check/2026-09-08.jsonl
M data/ledger/test/test.widget.panel/2026-09-08.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-09-08.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-09-08.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-09-08.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-09-08.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-09-08.jsonl
M data/raid/ledger/cfr/event_log.jsonl
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-nexus-wake.js
M lib/version.js
M package-lock.json
M package.json
M tests/modules/test-nexus-wake.js
```

### Build 0.39.68-r2 — snap-0526 — 2026-09-07 21:22:32

- Archive: `nexus-0526_2026-09-07_v0.39.68-r2.zip` (was `nexus-v0.39.68.zip`)
- SHA-256: `ad3aa97ba22ea0864d6d112831d5bdd3b9844e539f932c3bf6d8b8142791da74`, 73.6 MB, downloaded 2026-09-07 21:50:14
- Kind: full
- Commit: `f7cf720cb705149421d7a4d4e448deb72bfd9cd7`, tag `snap-0526`
- Identical copy: `nexus-0526_2026-09-07_v0.39.68-r2_1_dup1.zip` (was `nexus-v0.39.68-1.zip`)
- Left out: embedded .git (4638 files, HEAD fb769699867364ad88a88fadad5cd463b90b561e (master))
- Files in archive: 4113. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 5 | 0 |
| guardian | 0 | 2 | 0 |

```
M data/alk/decisions.jsonl
M data/cortex/memory/cfr_tension_history.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/guardian/memory/settings.json
M guardian/lib/ncp-handler.js
M guardian/server.js
```

