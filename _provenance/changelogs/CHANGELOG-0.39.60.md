# Nexus 0.39.60

| | |
|---|---|
| Built | 2026-09-06 21:57:26 → 2026-09-06 21:57:26 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.60 |
| Tag | `v0.39.60` → snap-0517 |
| Full file ledger | [LEDGER-0.39.60.csv](../ledger/LEDGER-0.39.60.csv) |

## Ledger

### Build 0.39.60 — snap-0517 — 2026-09-06 21:57:26

- Archive: `nexus-0517_2026-09-06_v0.39.60.zip` (was `nexus-v0_39_60.zip`)
- SHA-256: `af88a266126145a2fe52f7f8cdeabbe255650bfc70b925dd8005cab036170954`, 69.5 MB, downloaded 2026-09-06 22:10:23
- Kind: full
- Commit: `dbe661cfd174b4aba21f28ce7a668cb021c9de46`, tag `snap-0517`
- Left out: embedded .git (4442 files, HEAD fdeeec38945e220f7d3ad3adc46941ab2bb4cb6c (master))
- Files in archive: 3876. Changes against the build before it: **34 added, 52 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 46 | 0 |
| cortex | 31 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M cortex/boot.js
A cortex/data/snapshots/04205780-a824-4435-8380-9ba40e9fa376.nex
A cortex/data/snapshots/06498df6-8d45-4637-9580-58f14b20b465.nex
A cortex/data/snapshots/09664842-eb24-4e36-b3d4-1cdfe0f4e3e1.nex
A cortex/data/snapshots/09f23d0a-d3bb-4493-bc07-be123ada479e.nex
A cortex/data/snapshots/0aeab0e8-3c99-401d-b9a5-baf4779ce785.nex
A cortex/data/snapshots/0f724b93-ed4c-4c72-88a7-e9957f3f7523.nex
A cortex/data/snapshots/162ec8ba-61e2-4f82-a65c-94c568bc871a.nex
A cortex/data/snapshots/19b5e59a-9f37-4ceb-8ba4-713a83906398.nex
A cortex/data/snapshots/1c1ee6e8-9cc4-4002-931f-a125af744ba5.nex
A cortex/data/snapshots/1e4d2944-2881-4d28-be3b-bd17b6d90f9e.nex
A cortex/data/snapshots/2c375cee-a0fb-4f16-a552-7a4759db2ccc.nex
A cortex/data/snapshots/2cc7c634-76d6-449e-a9f9-0fa4e6e07d2b.nex
A cortex/data/snapshots/2dbc315b-5a50-40e3-ad06-d0564b679a87.nex
A cortex/data/snapshots/45f7196c-eb21-48a4-a01f-42dc87074462.nex
A cortex/data/snapshots/61490658-c32a-406e-8446-83a9886174f4.nex
A cortex/data/snapshots/66afa727-f161-4fca-8a54-3aaf583d5f30.nex
A cortex/data/snapshots/73220add-4a46-48f0-bb87-dfbbc97d472a.nex
A cortex/data/snapshots/7fa045d4-7af6-428a-b6e1-11d8c3f28779.nex
A cortex/data/snapshots/8140b3a7-7438-44a2-b831-5df7df429c71.nex
A cortex/data/snapshots/8b738d80-64c5-485f-872e-113d4c4f98a8.nex
A cortex/data/snapshots/94433ab4-772d-44da-9e18-a958b843561d.nex
A cortex/data/snapshots/9a4e6d63-8c48-4398-b881-0fc18cfd21e1.nex
A cortex/data/snapshots/9e2c2b99-7b61-4de2-982a-accb3c0e3363.nex
A cortex/data/snapshots/a8f00434-ac28-4aa0-9f08-fcfbd33761a0.nex
A cortex/data/snapshots/acdf94ca-346a-481a-96a0-407ccc45bb30.nex
A cortex/data/snapshots/b88c37ba-e9d9-483e-a6f2-ef555b12d019.nex
A cortex/data/snapshots/c3162759-559e-4410-9b7c-9371f381368d.nex
A cortex/data/snapshots/cbaa6706-8584-4087-a38a-2d043bfacdfe.nex
A cortex/data/snapshots/dafe1ee8-bae5-4a0e-8e0a-bf823d977618.nex
A cortex/data/snapshots/e1a6f603-0ad1-4063-818c-a68df56bbe1a.nex
A cortex/data/snapshots/e39cb15d-241d-4fe7-bd75-66fec39057b0.nex
M data/autopilot/autopilot.log
A data/chat-logs/2026-09-07T04-55-37-47497faf.jsonl
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
A data/vector-index/index.json
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M lib/version.js
M package-lock.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-vsb1-versionium-split-brain-fix.js
```

