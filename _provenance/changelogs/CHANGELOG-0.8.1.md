# Nexus 0.8.1

| | |
|---|---|
| Built | 2026-06-18 20:30:32 → 2026-06-18 21:15:38 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.8.1 |
| Tag | `v0.8.1` → snap-0117 |
| Full file ledger | [LEDGER-0.8.1.csv](../ledger/LEDGER-0.8.1.csv) |

## Ledger

### Build 0.8.1-r1 — snap-0115 — 2026-06-18 20:30:32

- Archive: `nexus-0115_2026-06-18_v0.8.1-r1_080-vnamed-0.8.1-uifix.zip` (was `nexus-080-v0_8_1-uifix.zip`)
- SHA-256: `f3cc51a7a9e54baa4479f2ea01952bffcbc268ce1d7cfc4cd4234004508b489d`, 7.1 MB, downloaded 2026-06-18 20:31:16
- Kind: full
- Commit: `6f76e3499c0d54ea9e91e42ad8bd036f6a3a0eda`, tag `snap-0115`
- Left out: node_modules (2567 files)
- Files in archive: 724. Changes against the build before it: **50 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 35 | 1 | 0 |
| cortex | 9 | 13 | 0 |
| guardian | 4 | 0 | 0 |
| architect | 2 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/backup_records.jsonl
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
M cortex/data/bep_patterns.jsonl
M cortex/data/cfr_state.json
A cortex/data/compartments.jsonl
A cortex/data/constitution_decisions.jsonl
M cortex/data/decay_log.jsonl
A cortex/data/decision_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/event_stats.json
M cortex/data/fix_map.jsonl
M cortex/data/gaps.jsonl
A cortex/data/invariant/baseline.json
A cortex/data/lattice_edges.jsonl
M cortex/data/memory_index.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
A cortex/data/snapshots.jsonl
A cortex/data/user_model_hypotheses.jsonl
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/diagnostic.pid
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/diagnostic/remediation.jsonl
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
M data/guardian/ledger/boot/events.ndjson
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
A data/ledger/event_stats.json
A data/ledger/orchestrator.jsonl
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
A data/snapshots/nex-38fc4c51.nex
A guardian/memory_store/cfr_state.json
A guardian/memory_store/event_log.jsonl
A guardian/memory_store/event_stats.json
A guardian/memory_store/settings.json
M ui/home/index.html
```

### Build 0.8.1-r2 — snap-0116 — 2026-06-18 20:43:16

- Archive: `nexus-0116_2026-06-18_v0.8.1-r2_080-vnamed-0.8.1-uifix-1.zip` (was `nexus-080-v0_8_1-uifix (1).zip`)
- SHA-256: `f036cae8c388f64f80d7122b9d0e2ba38a8167c1833a6d3fa2c893214508c87e`, 8.3 MB, downloaded 2026-06-18 20:54:04
- Kind: full
- Commit: `8ed11ea4cc326308e1b9168d77ccd8be3540d74c`, tag `snap-0116`
- Left out: node_modules (2567 files)
- Files in archive: 726. Changes against the build before it: **2 added, 35 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 19 | 0 |
| cortex | 0 | 11 | 0 |
| guardian | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
M architect/data/event_log.jsonl
M cli/boot-systems.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/backup_records.jsonl
M cortex/data/baseline-events.ndjson
M cortex/data/bep_patterns.jsonl
M cortex/data/decay_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/gaps.jsonl
M cortex/data/memory_index.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
M data/architect/baseline-events.ndjson
M data/bridge/baseline-events.ndjson
M data/bridge/ledger/cfr/event_log.jsonl
M data/bridge/ledger/requests.jsonl
M data/cobalt/ledger.truth.jsonl
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/remediation.jsonl
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/guardian/ledger/boot/events.ndjson
M data/idearium/baseline-events.ndjson
M data/ledger/event_log.jsonl
M data/ledger/event_stats.json
M data/ledger/orchestrator.jsonl
M data/orchestrator/baseline-events.ndjson
A data/snapshots/nex-2dc42757.nex
A data/snapshots/nex-451be4bf.nex
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/settings.json
M idearium/api/index.js
```

### Build 0.8.1-r3 — snap-0117 — 2026-06-18 21:15:38

- Archive: `nexus-0117_2026-06-18_v0.8.1-r3_080-vnamed-0.8.1-uifix-2.zip` (was `nexus-080-v0_8_1-uifix (2).zip`)
- SHA-256: `ff1d967a9c863b62b7606fd8b93f98dd82b3bba4a2a52c88418af3f34fad9b64`, 3.6 MB, downloaded 2026-06-18 21:18:11
- Kind: full
- Commit: `e42a27b0bfe4d9739fdcf356112e52cdbcffb75b`, tag `snap-0117`
- Files in archive: 674. Changes against the build before it: **0 added, 17 modified, 52 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 1 | 37 |
| cortex | 0 | 14 | 9 |
| guardian | 0 | 0 | 4 |
| (root) | 0 | 2 | 0 |
| architect | 0 | 0 | 2 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/backup_records.jsonl
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
M cortex/data/bep_patterns.jsonl
M cortex/data/cfr_state.json
D cortex/data/compartments.jsonl
D cortex/data/constitution_decisions.jsonl
M cortex/data/decay_log.jsonl
D cortex/data/decision_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/event_stats.json
M cortex/data/fix_map.jsonl
M cortex/data/gaps.jsonl
D cortex/data/invariant/baseline.json
D cortex/data/lattice_edges.jsonl
M cortex/data/memory_index.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
D cortex/data/snapshots.jsonl
D cortex/data/user_model_hypotheses.jsonl
M cortex/heartbeat/index.js
D data/architect/baseline-events.ndjson
D data/architect/baseline.json
D data/architect/invariant/baseline.json
D data/bridge/baseline-events.ndjson
D data/bridge/baseline.json
D data/bridge/invariant/baseline.json
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/cobalt/ledger.idea.jsonl
D data/cobalt/ledger.truth.jsonl
D data/diagnostic/baseline-events.ndjson
D data/diagnostic/baseline.json
D data/diagnostic/diagnostic.pid
D data/diagnostic/invariant/baseline.json
D data/diagnostic/ledger/boot/events.ndjson
D data/diagnostic/ledger/gaps/events.ndjson
D data/diagnostic/ledger/poll/events.ndjson
D data/diagnostic/remediation.jsonl
D data/emerge/baseline-events.ndjson
D data/emerge/baseline.json
D data/emerge/invariant/baseline.json
D data/guardian/baseline-events.ndjson
D data/guardian/baseline.json
D data/guardian/invariant/baseline.json
M data/guardian/ledger/boot/events.ndjson
D data/idearium/baseline-events.ndjson
D data/idearium/baseline.json
D data/idearium/invariant/baseline.json
D data/knowledge/facts.jsonl
D data/ledger/event_log.jsonl
D data/ledger/event_stats.json
D data/ledger/orchestrator.jsonl
D data/orchestrator/baseline-events.ndjson
D data/orchestrator/baseline.json
D data/orchestrator/invariant/baseline.json
D data/snapshots/nex-2dc42757.nex
D data/snapshots/nex-38fc4c51.nex
D data/snapshots/nex-451be4bf.nex
D guardian/memory_store/cfr_state.json
D guardian/memory_store/event_log.jsonl
D guardian/memory_store/event_stats.json
D guardian/memory_store/settings.json
M orchestrator.config.json
M orchestrator.js
```

