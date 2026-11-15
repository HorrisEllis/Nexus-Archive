# Nexus 0.39.37

| | |
|---|---|
| Built | 2026-08-29 19:21:04 → 2026-08-29 19:21:04 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.37 |
| Tag | `v0.39.37` → snap-0462 |
| Full file ledger | [LEDGER-0.39.37.csv](../ledger/LEDGER-0.39.37.csv) |

## Ledger

### Build 0.39.37 — snap-0462 — 2026-08-29 19:21:04

- Archive: `nexus-0462_2026-08-29_v0.39.37.zip` (was `nexus-0.39.37.zip`)
- SHA-256: `3b10bc343fedbe86ccd7405c4ffecb52ddaa51d3a430e67b068d910d11331102`, 36.2 MB, downloaded 2026-08-30 11:05:25
- Kind: full
- Commit: `fdb6bc11116866a8d04e909e104dbf2b13460882`, tag `snap-0462`
- Left out: embedded .git (2809 files, HEAD 790e17d1551b527727ba622b5ccf844b4ee674a5 (master))
- Files in archive: 2105. Changes against the build before it: **67 added, 35 modified, 13 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 59 | 0 | 0 |
| clear-glass | 1 | 11 | 0 |
| ollama | 0 | 1 | 10 |
| cortex | 3 | 4 | 1 |
| docs | 0 | 5 | 0 |
| guardian | 1 | 2 | 1 |
| (root) | 0 | 3 | 0 |
| copilot | 0 | 2 | 1 |
| lib | 1 | 2 | 0 |
| loom | 1 | 2 | 0 |
| orchestrator | 1 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M clear-glass/registry-components.js
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/copilot/wake-relay.js
A clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/providers/host.js
M clear-glass/wire/nexus-wire.js
M copilot/lifeline.js
D copilot/routes/person-model.js
M copilot/server.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/routing-ir.js
D cortex/core/raid/worker.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
M cortex/self-heal/index.js
M cortex/versionium/index.js
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/clear-glass/baseline-events.ndjson
A data/clear-glass/baseline.json
A data/clear-glass/invariant/baseline.json
A data/copilot/baseline-events.ndjson
A data/copilot/baseline.json
A data/copilot/invariant/baseline.json
A data/cortex/memory/bep_patterns.json
A data/cortex/memory/cfr_tension_history.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
A data/cortex/memory/guardian_settings.json
A data/cortex/memory/interstitial_spaces.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/settings.json
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/eravos/baseline-events.ndjson
A data/eravos/baseline.json
A data/eravos/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
A data/guardian/ledger/boot/events.ndjson
A data/guardian/ledger/cfr/event_log.jsonl
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/intelligence/baseline-events.ndjson
A data/intelligence/baseline.json
A data/intelligence/invariant/baseline.json
A data/knowledge/facts.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-29.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-29.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-29.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
A data/loom/baseline-events.ndjson
A data/loom/baseline.json
A data/loom/invariant/baseline.json
A data/ollama/baseline-events.ndjson
A data/ollama/baseline.json
A data/ollama/invariant/baseline.json
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
M docs/2026-08-23-backlog-phasemap.spec
M docs/NEXUS-PHASE-MAP.md
M docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
M docs/copilot-awareness-routing-phasemap.spec
M docs/raid-routing-fidelity-phasemap.spec
A guardian/event-taxonomy.js
D guardian/routes/settings.js
M guardian/server.js
M guardian/userscript-claude.js
M idearium/api/index.js
M lib/account-registry.js
A lib/sigma-gate.js
M lib/version.js
M loom/maps/ledger-wire-person-model-map.js
M loom/maps/session-2026-08-14-map.js
A loom/scanners/event-taxonomy-map.js
M nexus-connect.js
D ollama/lib/dispatch.js
D ollama/lib/http-utils.js
D ollama/lib/ollama-client.js
D ollama/lib/state.js
D ollama/routes/jobs.js
D ollama/routes/models.js
D ollama/routes/queue.js
D ollama/routes/stream.js
D ollama/routes/system.js
D ollama/routes/uploads.js
M ollama/server.js
A orchestrator/event-taxonomy.js
M orchestrator/orchestrator.js
M package-lock.json
M package.json
M service/nexus-diagnostic.js
```

