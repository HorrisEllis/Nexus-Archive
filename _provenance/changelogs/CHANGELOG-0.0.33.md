# Nexus 0.0.33

| | |
|---|---|
| Built | 2026-06-05 14:49:36 → 2026-06-05 14:49:36 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.33` → snap-0035 |
| Full file ledger | [LEDGER-0.0.33.csv](../ledger/LEDGER-0.0.33.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.33 — snap-0035 — 2026-06-05 14:49:36

- Archive: `nexus-0035_2026-06-05_v0.0.33_vnamed-3.2.0_declared-1.0.0.zip` (was `nexus-v3.2.0.zip`)
- SHA-256: `1e00ed64dd70708daff53831b4f5175c92521f50f8ecb33e058f7327e8a8ed03`, 1.2 MB, downloaded 2026-06-05 15:01:32
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name 3.2.0); filed under 0.0.33 to keep the line in order
- Commit: `c91061c1fa71f791b11bd8fbc8590daf14d5f3d8`, tag `snap-0035`
- Files in archive: 421. Changes against the build before it: **56 added, 12 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 43 | 1 | 0 |
| data | 5 | 5 | 0 |
| service | 5 | 0 | 0 |
| (root) | 2 | 1 | 0 |
| tests | 1 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| cli | 0 | 1 | 0 |

```
M cli/diagnose.js
M cortex/core/raid/index.js
A cortex/data/active_traces.jsonl
A cortex/data/agent_calls.jsonl
A cortex/data/agent_signatures.jsonl
A cortex/data/artifacts.jsonl
A cortex/data/backup_records.jsonl
A cortex/data/bep_patterns.jsonl
A cortex/data/boot_records.jsonl
A cortex/data/bridge_messages.jsonl
A cortex/data/causality_nodes.jsonl
A cortex/data/cli_history.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/event_log.jsonl
A cortex/data/failures.jsonl
A cortex/data/feedback_scores.jsonl
A cortex/data/fix_map.jsonl
A cortex/data/gaps.jsonl
A cortex/data/healer_log.jsonl
A cortex/data/ime_profiles.jsonl
A cortex/data/intent_nodes.jsonl
A cortex/data/law_violations.jsonl
A cortex/data/memory_index.jsonl
A cortex/data/memory_queries.jsonl
A cortex/data/orion_sessions.jsonl
A cortex/data/poll_log.jsonl
A cortex/data/project_registry.jsonl
A cortex/data/requests.jsonl
A cortex/data/schedules.jsonl
A cortex/data/seam_records.jsonl
A cortex/data/self_model.jsonl
A cortex/data/shape_samples.jsonl
A cortex/data/sigma_records.jsonl
A cortex/data/snr_records.jsonl
A cortex/data/toasts.jsonl
A cortex/data/trust_scores.jsonl
A cortex/data/versionium_branches.jsonl
A cortex/data/versionium_calendar.jsonl
A cortex/data/versionium_commits.jsonl
A cortex/data/versionium_file_index.jsonl
A cortex/data/versionium_objects.jsonl
A cortex/data/workflow_runs.jsonl
A data/bridge/events.jsonl
A data/bridge/handshakes.jsonl
A data/bridge/requests.jsonl
A data/bridge/tags.jsonl
M data/cobalt/ledger.truth.jsonl
A data/guardian/ledger/boot/events.ndjson
M data/idearium.json
M data/idearium/event_log.jsonl
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
M guardian/server.js
M guardian/userscript-chatgpt.js
M nexus-connect.js
A ollama-runtime.js
A service/bridge-service.js
A service/cortex-service.js
A service/guardian-service.js
A service/idearium-service.js
A service/nexus-diagnostic.js
A siso.js
A tests/full.test.js
M tests/kernel-test-results.json
M tests/pipeline-results.json
```

