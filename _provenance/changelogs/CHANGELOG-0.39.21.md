# Nexus 0.39.21

| | |
|---|---|
| Built | 2026-08-28 17:45:52 → 2026-08-29 04:10:40 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.21 |
| Tag | `v0.39.21` → snap-0460 |
| Full file ledger | [LEDGER-0.39.21.csv](../ledger/LEDGER-0.39.21.csv) |

## Ledger

### Build 0.39.21-r1 — snap-0459 — 2026-08-28 17:45:52

- Archive: `nexus-0459_2026-08-28_v0.39.21-r1.zip` (was `nexus-0.39.21.zip`)
- SHA-256: `3f4a38c5fa64c1caa556133f7c573127e323663f10455b153feb4c23f4c8d00c`, 34.7 MB, downloaded 2026-08-28 17:49:29
- Kind: full
- Commit: `01e0328cd9f16acbcffc9a928e719cf7a0739cd2`, tag `snap-0459`
- Left out: embedded .git (2682 files, HEAD f55866a349066acffa0969378b795b502e0f0f04 (master))
- Files in archive: 2078. Changes against the build before it: **40 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 37 | 0 | 0 |
| clear-glass | 0 | 4 | 0 |
| cortex | 3 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.js
M clear-glass/renderer/guardian-picker.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/providers/host.js
M cortex/boot.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/clear-glass/baseline-events.ndjson
A data/clear-glass/baseline.json
A data/clear-glass/invariant/baseline.json
A data/cortex/memory/bep_patterns.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
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
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-29.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-29.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-29.jsonl
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
M lib/version.js
M package.json
M service/nexus-diagnostic.js
```

### Build 0.39.21-r2 — snap-0460 — 2026-08-29 04:10:40

- Archive: `nexus-0460_2026-08-29_v0.39.21-r2_updated.zip` (was `nexus-0_39_21-updated.zip`)
- SHA-256: `29719682b90a7b9204c184c23e5ab95e7a60fcab96f2bf565f7a7351b9f80095`, 40.9 MB, downloaded 2026-08-29 04:11:51
- Kind: full
- Commit: `a2e9443d66f7033f66535d2c67785a3d72c695dd`, tag `snap-0460`
- Left out: embedded .git (2682 files, HEAD f55866a349066acffa0969378b795b502e0f0f04 (master))
- Left out: node_modules (39 files)
- Files in archive: 2433. Changes against the build before it: **355 added, 40 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 344 | 20 | 0 |
| clear-glass | 0 | 11 | 0 |
| ollama | 10 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| copilot | 1 | 1 | 0 |
| cortex | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M blueprint-index.json
M clear-glass/renderer/browser.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/copilot/wake-relay.js
M clear-glass/src/dom/archaeology.js
M clear-glass/src/driver/index.js
M clear-glass/src/gates/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/preload/index.js
A copilot/routes/person-model.js
M copilot/server.js
M cortex/core/raid/routing-ir.js
M lib/agent-tools/tools/clear-glass/macro.js
A ollama/lib/dispatch.js
A ollama/lib/http-utils.js
A ollama/lib/ollama-client.js
A ollama/lib/state.js
A ollama/routes/jobs.js
A ollama/routes/models.js
A ollama/routes/queue.js
A ollama/routes/stream.js
A ollama/routes/system.js
A ollama/routes/uploads.js
M ollama/server.js
M package-lock.json
```

367 more (mostly data, logs and archived files) are in the ledger file.

