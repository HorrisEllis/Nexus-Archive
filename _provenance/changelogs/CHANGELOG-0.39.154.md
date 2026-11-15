# Nexus 0.39.154

| | |
|---|---|
| Built | 2026-09-19 08:19:58 → 2026-09-19 08:19:58 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.154 |
| Tag | `v0.39.154` → snap-0612 |
| Full file ledger | [LEDGER-0.39.154.csv](../ledger/LEDGER-0.39.154.csv) |

## Ledger

### Build 0.39.154 — snap-0612 — 2026-09-19 08:19:58

- Archive: `nexus-0612_2026-09-19_v0.39.154.zip` (was `nexus-v0_39_154.zip`)
- SHA-256: `a656a6e5fa9afac1f392b51f3a2137dc4a88938c17ce47038e3916ae0c849344`, 115.8 MB, downloaded 2026-09-19 08:25:52
- Kind: full
- Commit: `40326ef68f513aad10fa1a0b10fa2b4787fbc219`, tag `snap-0612`
- Left out: embedded .git (4671 files, HEAD 572ed6598c1d03cf9df994541992f8cb2c719d98 (master))
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4243. Changes against the build before it: **9 added, 14 modified, 43 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 4 | 42 |
| guardian | 5 | 3 | 0 |
| clear-glass | 0 | 4 | 1 |
| docs | 2 | 0 | 0 |
| tests | 2 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M clear-glass/src/dom/archaeology.js
M clear-glass/src/driver/index.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
D clear-glass/src/mesh/custom-agent-driver.js
M cortex/boot.js
M data/autopilot/autopilot.log
D data/cortex/memory/bep_patterns.json
D data/cortex/memory/bus_subscriptions.json
D data/cortex/memory/cfr_tension_history.json
D data/cortex/memory/chat_log.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/component_projections.json
D data/cortex/memory/components.json
D data/cortex/memory/constitution_decisions.json
D data/cortex/memory/crystals.json
D data/cortex/memory/event_log.json
D data/cortex/memory/forged_hats.json
D data/cortex/memory/gaps.json
D data/cortex/memory/hooks.json
D data/cortex/memory/interstitial_spaces.json
M data/cortex/memory/loom_changelog.json
D data/cortex/memory/memory_unified.json
D data/cortex/memory/meta_observations.json
D data/cortex/memory/raid_contract_queue.json
D data/cortex/memory/relationship_lattice.json
D data/cortex/memory/scheduled_tasks.json
D data/cortex/memory/schema_drift.json
D data/cortex/memory/schemas.json
D data/cortex/memory/sigma_records.json
D data/cortex/memory/tool_index.json
D data/cortex/memory/triggers.json
D data/cortex/memory/user_model_hypotheses.json
M data/error.log
D data/guardian/memory/ledger.json
D data/guardian/memory/settings.json
D data/ledger/cg/cg.bus.log/2026-09-19.jsonl
D data/ledger/cortex/cortex.chat.log/2026-09-19.jsonl
D data/ledger/cortex/cortex.events.log/2026-09-19.jsonl
D data/ledger/cortex/cortex.versionium.log/2026-09-19.jsonl
D data/ledger/guardian/guardian.bus.log/2026-09-19.jsonl
D data/ledger/idearium/idearium.events.log/2026-09-19.jsonl
D data/raid/input/159621fb-000e-443c-b438-fe89244ca55c.contract
D data/raid/input/242e1655-3a10-4f7d-83e1-8373ed06ce81.contract
D data/raid/input/31ba47b2-5503-4d14-961a-d515cb8e88e6.contract
D data/raid/input/3e96f940-989a-4ac4-9449-3023ac6d31a7.contract
D data/raid/input/5ba74781-3406-45fb-8d95-abf1cf47b0ea.contract
D data/raid/input/8237b536-f8c3-4f22-a893-5666c2e27fac.contract
D data/raid/input/94aa4d6f-3b9b-4b6c-9121-3a05afe6b104.contract
D data/raid/input/99e79587-261b-4300-8693-5c3d130ca199.contract
D data/raid/input/e397d802-7b40-4780-a2eb-414a01ba959a.contract
M data/raid/ledger/cfr/event_log.jsonl
A docs/2026-09-19-guardian-mesh-first-dispatch-phasemap.spec
A docs/HANDOFF-2026-09-19-mesh-first-dispatch.md
A guardian/lib/agent-registry.js
A guardian/lib/agent-registry.seed.json
A guardian/lib/dispatch-ladder.js
M guardian/lib/dispatcher.js
M guardian/lib/index.js
A guardian/lib/mesh-client.js
A guardian/lib/raid-feedback.js
M guardian/server.js
M lib/version.js
M package.json
A tests/modules/test-guardian-dispatch-ladder.js
A tests/modules/test-guardian-raid-feedback.js
```

