# Nexus 0.0.49

| | |
|---|---|
| Built | 2026-06-12 00:08:26 → 2026-06-12 00:08:26 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 3.0.0 |
| Tag | `v0.0.49` → snap-0053 |
| Full file ledger | [LEDGER-0.0.49.csv](../ledger/LEDGER-0.0.49.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.49 — snap-0053 — 2026-06-12 00:08:26

- Archive: `nexus-0053_2026-06-12_v0.0.49_work-patched-1_declared-3.0.0.zip` (was `nexus-work-patched-1.zip`)
- SHA-256: `0c1e9ab6be581d47d652c892d287199db16dd0de14953c02f09222378e054e6a`, 2.1 MB, downloaded 2026-06-12 00:15:05
- Kind: full
- Claimed version: 3.0.0 (registry 3.0.0, file name none); filed under 0.0.49 to keep the line in order
- Commit: `1a4a21a1a21c18a8ff18d11b0c42ceb0fece5e9f`, tag `snap-0053`
- Files in archive: 488. Changes against the build before it: **57 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 46 | 0 | 0 |
| bridge | 5 | 1 | 0 |
| data | 5 | 1 | 0 |
| guardian | 1 | 3 | 0 |
| (root) | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
A bridge/causal/graph.js
A bridge/causal/ledger.js
A bridge/causal/projections.js
A bridge/causal/schema.js
A bridge/causal/server.js
M bridge/server.js
A cortex/data/active_traces.jsonl
A cortex/data/agent_calls.jsonl
A cortex/data/agent_messages.jsonl
A cortex/data/agent_signatures.jsonl
A cortex/data/artifacts.jsonl
A cortex/data/backup_records.jsonl
A cortex/data/bep_patterns.jsonl
A cortex/data/boot_records.jsonl
A cortex/data/causality_nodes.jsonl
A cortex/data/cli_history.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/contract_audit.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/event_log.jsonl
A cortex/data/failures.jsonl
A cortex/data/feedback_scores.jsonl
A cortex/data/fix_map.jsonl
A cortex/data/forge_patches.jsonl
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
A cortex/data/working_memory.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
A data/idearium/event_log.jsonl
A data/ledger/event_log.jsonl
M data/ledger/event_stats.json
A data/ledger/orchestrator.jsonl
M guardian/memory_store/cfr_state.json
A guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/server.js
M idearium/api/index.js
M nexus-connect.js
```

