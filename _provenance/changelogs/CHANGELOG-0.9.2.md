# Nexus 0.9.2

| | |
|---|---|
| Built | 2026-06-20 05:10:50 → 2026-06-20 05:10:50 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.9.2 |
| Tag | `v0.9.2` → snap-0135 |
| Full file ledger | [LEDGER-0.9.2.csv](../ledger/LEDGER-0.9.2.csv) |

## Ledger

### Build 0.9.2 — snap-0135 — 2026-06-20 05:10:50

- Archive: `nexus-0135_2026-06-20_v0.9.2_integrated-13.zip` (was `nexus-integrated-13-v0.9.2.zip`)
- SHA-256: `26407ab820a60dd3aceca7a3ac942ba51e8e3f9ef5f167ab1c329cee2334ba90`, 15.9 MB, downloaded 2026-06-20 05:41:49
- Kind: full
- Commit: `0770c08185ee235df52ae06d51fb0d3b35caab2f`, tag `snap-0135`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 684. Changes against the build before it: **17 added, 63 modified, 5 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 9 | 21 | 1 |
| cortex | 0 | 18 | 1 |
| guardian | 2 | 9 | 0 |
| lib | 2 | 6 | 0 |
| tests | 2 | 3 | 0 |
| ui | 1 | 1 | 3 |
| (root) | 1 | 2 | 0 |
| architect | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
M architect/data/event_log.jsonl
M cli/nexus-repl.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/active_traces.jsonl
M cortex/data/agent_calls.jsonl
M cortex/data/agent_messages.jsonl
M cortex/data/backup_records.jsonl
M cortex/data/bep_patterns.jsonl
M cortex/data/cortex_memory.jsonl
M cortex/data/decay_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/event_stats.json
M cortex/data/fix_map.jsonl
M cortex/data/gaps.jsonl
D cortex/data/memory_index.jsonl
M cortex/data/orion_sessions.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
M cortex/data/sigma_records.jsonl
M cortex/data/working_memory.jsonl
M data/.poller-cursors.json
M data/architect/baseline-events.ndjson
M data/architect/event_log.jsonl
M data/bridge/baseline-events.ndjson
A data/chat-logs/2026-06-20T08-27-57-17ff76dc.jsonl
A data/chat-logs/2026-06-20T08-50-05-04fcef9c.jsonl
M data/cobalt/ledger.truth.jsonl
M data/diagnostic/baseline-events.ndjson
D data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/remediation.jsonl
M data/emerge/baseline-events.ndjson
M data/gap-ledger/gaps.jsonl
M data/guardian/baseline-events.ndjson
A data/guardian/conversations/0d461042-a3f3-42f7-ab3e-1031b000a9a2/conversation.jsonl
A data/guardian/conversations/494da1d5-3024-4803-b77b-f0eda1cb3eff/conversation.jsonl
A data/guardian/conversations/cb6908f3-49f8-486b-9a2e-403f5a66b5cc/conversation.jsonl
A data/guardian/input/57c68060-ddcc-4742-96f7-98b4eff4159e.done.spec
M data/guardian/ledger/baseline-events.ndjson
M data/guardian/ledger/boot/events.ndjson
A data/guardian/queue/57c68060-ddcc-4742-96f7-98b4eff4159e.json
M data/idearium/baseline-events.ndjson
M data/ledger/cfr_state.json
M data/ledger/event_log.jsonl
M data/ledger/event_stats.json
M data/ledger/orchestrator.jsonl
M data/orchestrator/baseline-events.ndjson
A data/snapshots/nex-6ddeb964.nex
A data/snapshots/nex-c9cab976.nex
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/jobs.json
M guardian/memory_store/ledger.json
A guardian/memory_store/queue_compartments.json
A guardian/memory_store/seam_sessions.json
M guardian/memory_store/settings.json
M guardian/server.js
M idearium/ui/index.html
M lib/component-registry.js
M lib/grammar-engine.js
A lib/grammar-fallback.js
A lib/mutation-contract.js
M lib/reflection.js
M lib/replay-engine.js
M lib/request-handler.js
M lib/version.js
A nexus-roadmap-combined.html
M orchestrator.js
M package.json
M tests/modules/reflection.test.js
M tests/modules/run-all.js
M tests/modules/test-grammar-engine.js
A tests/modules/test-grammar-fallback.js
A tests/modules/test-mutation-contract.js
D ui/forge-shell.html
A ui/forge-shell/index.html
D ui/idearium.html
M ui/idearium/index.html
D ui/orchestrator.config.json
```

