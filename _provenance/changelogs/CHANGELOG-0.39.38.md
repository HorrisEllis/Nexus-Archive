# Nexus 0.39.38

| | |
|---|---|
| Built | 2026-08-29 22:53:20 → 2026-09-02 15:48:30 |
| Builds on the main line | 19 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.38 |
| Tag | `v0.39.38` → snap-0481 |
| Full file ledger | [LEDGER-0.39.38.csv](../ledger/LEDGER-0.39.38.csv) |

## Ledger

### Build 0.39.38-r1 — snap-0463 — 2026-08-29 22:53:20

- Archive: `nexus-0463_2026-08-29_v0.39.38-r1.zip` (was `nexus-v0.39.38.zip`)
- SHA-256: `b7a946a4e5d9b27218ceb0baed1402704dbd903f7b9605f8d91e05bae09e6d99`, 36.5 MB, downloaded 2026-08-30 11:04:17
- Kind: full
- Commit: `4fd963bcf98d590c49e773769aa8a1b3b424a540`, tag `snap-0463`
- Left out: embedded .git (2891 files, HEAD 017201377ffe65283c4be5341253db9fde1d209a (master))
- Files in archive: 2058. Changes against the build before it: **15 added, 30 modified, 62 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 59 |
| ollama | 10 | 1 | 0 |
| clear-glass | 1 | 8 | 0 |
| cortex | 1 | 3 | 3 |
| docs | 0 | 5 | 0 |
| lib | 1 | 3 | 0 |
| (root) | 0 | 3 | 0 |
| copilot | 1 | 2 | 0 |
| guardian | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| idearium | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/copilot/wake-relay.js
A clear-glass/src/history/store.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/providers/host.js
M clear-glass/wire/nexus-wire.js
M copilot/lifeline.js
A copilot/routes/person-model.js
M copilot/server.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/routing-ir.js
A cortex/core/raid/worker.js
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/invariant/baseline.json
M cortex/self-heal/index.js
D data/architect/baseline-events.ndjson
D data/architect/baseline.json
D data/architect/invariant/baseline.json
D data/bridge/baseline-events.ndjson
D data/bridge/baseline.json
D data/bridge/invariant/baseline.json
D data/clear-glass/baseline-events.ndjson
D data/clear-glass/baseline.json
D data/clear-glass/invariant/baseline.json
D data/copilot/baseline-events.ndjson
D data/copilot/baseline.json
D data/copilot/invariant/baseline.json
D data/cortex/memory/bep_patterns.json
D data/cortex/memory/cfr_tension_history.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/event_log.json
D data/cortex/memory/gaps.json
D data/cortex/memory/guardian_settings.json
D data/cortex/memory/interstitial_spaces.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/settings.json
D data/diagnostic/baseline-events.ndjson
D data/diagnostic/baseline.json
D data/diagnostic/invariant/baseline.json
D data/diagnostic/ledger/boot/events.ndjson
D data/diagnostic/ledger/gaps/events.ndjson
D data/diagnostic/ledger/poll/events.ndjson
D data/emerge/baseline-events.ndjson
D data/emerge/baseline.json
D data/emerge/invariant/baseline.json
D data/eravos/baseline-events.ndjson
D data/eravos/baseline.json
D data/eravos/invariant/baseline.json
D data/guardian/baseline-events.ndjson
D data/guardian/baseline.json
D data/guardian/invariant/baseline.json
D data/guardian/ledger/boot/events.ndjson
D data/guardian/ledger/cfr/event_log.jsonl
D data/idearium/baseline-events.ndjson
D data/idearium/baseline.json
D data/idearium/invariant/baseline.json
D data/intelligence/baseline-events.ndjson
D data/intelligence/baseline.json
D data/intelligence/invariant/baseline.json
D data/knowledge/facts.jsonl
D data/ledger/diagnostic/diagnostic.service.boot/2026-08-29.jsonl
D data/ledger/diagnostic/diagnostic.service.gaps/2026-08-29.jsonl
D data/ledger/diagnostic/diagnostic.service.poll/2026-08-29.jsonl
D data/ledger/event_log.jsonl
D data/ledger/orchestrator.jsonl
D data/loom/baseline-events.ndjson
D data/loom/baseline.json
D data/loom/invariant/baseline.json
D data/ollama/baseline-events.ndjson
D data/ollama/baseline.json
D data/ollama/invariant/baseline.json
D data/orchestrator/baseline-events.ndjson
D data/orchestrator/baseline.json
D data/orchestrator/invariant/baseline.json
M docs/2026-08-23-backlog-phasemap.spec
M docs/NEXUS-PHASE-MAP.md
M docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
M docs/copilot-awareness-routing-phasemap.spec
M docs/raid-routing-fidelity-phasemap.spec
A guardian/routes/settings.js
M guardian/server.js
M idearium/api/index.js
M lib/account-registry.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/command-index.js
M lib/version.js
M loom/maps/ledger-wire-person-model-map.js
M loom/maps/session-2026-08-14-map.js
M nexus-connect.js
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
M orchestrator/orchestrator.js
M package-lock.json
M package.json
```

### Build 0.39.38-r2 — snap-0464 — 2026-08-30 16:28:42

- Archive: `nexus-0464_2026-08-30_v0.39.38-r2_d.zip` (was `nexus-v0.39.38-d.zip`)
- SHA-256: `bcbc2852412a42ee743bc84983e08efd53fccc8c8ef48a867b66897c190c2ae0`, 36.9 MB, downloaded 2026-08-30 16:38:42
- Kind: full
- Commit: `343bc474fcb8bd4298108ba3bcfd4add59a5d449`, tag `snap-0464`
- Left out: embedded .git (2964 files, HEAD 89269470b891cda17fa9fe6947f7cc56c761e7d7 (master))
- Files in archive: 2060. Changes against the build before it: **2 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 2 | 0 |
| clear-glass | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M cli/diagnose.js
M cortex/core/raid/contract-intake.js
A docs/2026-08-30-interaction-contract-context-phasemap.spec
M docs/SPEC-REGISTRY.md
M docs/raid-routing-fidelity-phasemap.spec
A tests/modules/contract-intake-dependency-graph.test.js
M tests/modules/run-all.js
```

### Build 0.39.38-r3 — snap-0465 — 2026-08-30 16:54:52

- Archive: `nexus-0465_2026-08-30_v0.39.38-r3_f.zip` (was `nexus-v0.39.38-f.zip`)
- SHA-256: `064926f24e2aacb38980d52cd6e1a3de045f732a81fe65e742fd6c3c144af569`, 36.9 MB, downloaded 2026-08-30 16:55:51
- Kind: full
- Commit: `b7a3b932a3fecfadf3b83c5963262fd77734f24d`, tag `snap-0465`
- Left out: embedded .git (2974 files, HEAD 7da8ff8ef7c57123a95d81fe8b920908b5d9c417 (master))
- Files in archive: 2060. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M lib/agent-chat.js
M ui/agents/chatgpt/index.html
```

### Build 0.39.38-r4 — snap-0466 — 2026-08-30 17:20:14

- Archive: `nexus-0466_2026-08-30_v0.39.38-r4_g.zip` (was `nexus-v0.39.38-g.zip`)
- SHA-256: `8da96d0343239105ccdfbedea23d513c46ef09f728d8c54f9c480f334526231a`, 37 MB, downloaded 2026-08-30 17:22:23
- Kind: full
- Commit: `27defc3602c82d383cc41f53834f7d356039f3e4`, tag `snap-0466`
- Identical copy: `nexus-0466_2026-08-30_v0.39.38-r4_g-1_dup1.zip` (was `nexus-v0.39.38-g-1.zip`)
- Left out: embedded .git (2983 files, HEAD 02c75a4a615909748b6668f4ea292caf2fce8d51 (master))
- Files in archive: 2060. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 2 | 0 |

```
M copilot/lib/self-model.js
M copilot/server.js
```

### Build 0.39.38-r5 — snap-0467 — 2026-08-31 17:36:52

- Archive: `nexus-0467_2026-08-31_v0.39.38-r5_h.zip` (was `nexus-v0.39.38-h.zip`)
- SHA-256: `6932a2e5012cbe0ce22f138492e68fd7d93900bd8fc98fbe1bbba72df398d8b8`, 37 MB, downloaded 2026-09-01 14:27:24
- Kind: full
- Commit: `c090bbff1a7ca2562dcc9ad0400da0049640d200`, tag `snap-0467`
- Left out: embedded .git (2990 files, HEAD a05630e992039ced9cc258f566429a9b15797868 (master))
- Files in archive: 2061. Changes against the build before it: **1 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 1 | 0 |

```
M cortex/core/raid/contract-intake.js
A cortex/core/raid/event-taxonomy.js
```

### Build 0.39.38-r6 — snap-0468 — 2026-09-01 14:58:50

- Archive: `nexus-0468_2026-09-01_v0.39.38-r6_i.zip` (was `nexus-v0.39.38-i.zip`)
- SHA-256: `b8bdab52c597ab326a0ce0e34b56bd677a6907bf3fc3a182c1445e933f1effc7`, 37.3 MB, downloaded 2026-09-01 15:08:06
- Kind: full
- Commit: `237610f6dd9694415d7a79f808470fb0e7ec5946`, tag `snap-0468`
- Left out: embedded .git (3009 files, HEAD 1d0a2de00e5132c6017d59b7cc45e7e713deb86c (master))
- Files in archive: 2063. Changes against the build before it: **2 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 6 | 0 |
| loom | 1 | 2 | 0 |
| lib | 1 | 0 | 0 |

```
M guardian/ask.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
A lib/agent-tool-call.js
M loom/bootstrap.js
M loom/data/registry.json
A loom/maps/raid-events-and-tools-map.js
```

### Build 0.39.38-r7 — snap-0469 — 2026-09-01 15:53:30

- Archive: `nexus-0469_2026-09-01_v0.39.38-r7_j.zip` (was `nexus-v0.39.38-j.zip`)
- SHA-256: `9879ed2e67ada3bb9c2252b260f0adb90c20959d9ce12d066c2041ff325f124a`, 38.4 MB, downloaded 2026-09-01 15:56:23
- Kind: full
- Commit: `a290bbc3257d72251e449d394d33a5ffea933747`, tag `snap-0469`
- Left out: embedded .git (3077 files, HEAD 796b8438f8fa2c337ef0c2e84056871b816c1c8f (master))
- Files in archive: 2101. Changes against the build before it: **38 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 37 | 1 | 0 |
| docs | 1 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
A _archive/unintegrated/2026-09-01-uploaded-batch/apk-builder/README.md
A _archive/unintegrated/2026-09-01-uploaded-batch/apk-builder/apk.js
A _archive/unintegrated/2026-09-01-uploaded-batch/apk-builder/manifest.json
A _archive/unintegrated/2026-09-01-uploaded-batch/brainos-agents/ai-agent.js
A _archive/unintegrated/2026-09-01-uploaded-batch/brainos-agents/automation-agent.js
A _archive/unintegrated/2026-09-01-uploaded-batch/brainos-agents/base-agent.js
A _archive/unintegrated/2026-09-01-uploaded-batch/brainos-agents/system-agent.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/index.html
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/nexus-coder.html
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/nexus-compiler.html
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/nexus-spec.html
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/nexus-testenv.html
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-auth.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-boot.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-builder.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-console-cli.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-core.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-diag.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-forge-engine.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-forge-ui.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-guardian.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-home.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-identity.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-patch-modular.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-patches.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-phase1.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-phase2.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-phase3.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-phase4.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-phase5.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-siso-fw.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-siso-health.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-testenv.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-tests-ui.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-uce.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus-uuid.js
A _archive/unintegrated/2026-09-01-uploaded-batch/nexus-pages/src/ui/nexus.css
M _archive/unintegrated/README.md
M copilot/server.js
A docs/2026-09-01-living-model-and-autonomous-pipeline-phasemap.spec
M docs/SPEC-REGISTRY.md
M scripts/precommit-check.js
```

### Build 0.39.38-r8 — snap-0470 — 2026-09-01 21:28:26

- Archive: `nexus-0470_2026-09-01_v0.39.38-r8_k.zip` (was `nexus-v0_39_38-k.zip`)
- SHA-256: `0212ed8752190a947fb52e5a0c4c1b73bcd015475fdb3d19f12ad3da76929f03`, 38.4 MB, downloaded 2026-09-01 21:29:01
- Kind: full
- Commit: `e576f12f17046d0191545d4f6a1d786cfb27a47e`, tag `snap-0470`
- Left out: embedded .git (3096 files, HEAD 171b428b7757f701b40d7b1c686f4f69b770d83d (master))
- Files in archive: 2109. Changes against the build before it: **8 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 6 | 1 | 0 |
| clear-glass | 1 | 0 | 0 |
| loom | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |

```
A clear-glass/spec/clear-glass.spec
M docs/SPEC-REGISTRY.md
A docs/gap-finder.spec
A docs/grammar-fallback.spec
A docs/loop-topology.spec
A docs/mutation-contract.spec
A docs/nexus-system-foundation-addendum-v1.3.0.spec
A docs/open-loop-taxonomy.spec
A loom/spec/loom.spec
M ollama/spec/ollama.spec
```

### Build 0.39.38-r9 — snap-0471 — 2026-09-01 21:59:42

- Archive: `nexus-0471_2026-09-01_v0.39.38-r9_m.zip` (was `nexus-v0_39_38-m.zip`)
- SHA-256: `f1dd9cc5bd22274e2240fc83d12074589495722a718aa6084520b0a0d121262a`, 38.7 MB, downloaded 2026-09-01 22:00:24
- Kind: full
- Commit: `595dcdac7a789ef0e62987881fcf233ccc858462`, tag `snap-0471`
- Identical copy: `nexus-0471_2026-09-01_v0.39.38-r9_m-1_dup1.zip` (was `nexus-v0_39_38-m-1.zip`)
- Left out: embedded .git (3134 files, HEAD 65476c9d2e6ea6584499d2e7b57a1b1241321172 (master))
- Files in archive: 2196. Changes against the build before it: **87 added, 10 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 48 | 0 | 0 |
| cortex | 38 | 2 | 0 |
| lib | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M clear-glass/wire/nexus-wire.js
M cortex/boot.js
A cortex/data/snapshots/0200c0a1-3b7d-42c4-b6fc-439246216f27.nex
A cortex/data/snapshots/0ad0faf2-5e74-47e1-99e6-137f688b727c.nex
A cortex/data/snapshots/1094c2e0-b8a1-4655-8f4a-59d01e1efc23.nex
A cortex/data/snapshots/1a434806-9248-4436-8597-1f62460c4ad1.nex
A cortex/data/snapshots/2619b344-2043-4f03-add3-4b77213ff017.nex
A cortex/data/snapshots/26dd500c-0ff4-4bc7-a217-13ede5967b59.nex
A cortex/data/snapshots/28889c01-6efe-4105-8583-93af3d2637e6.nex
A cortex/data/snapshots/340df64f-b15e-4929-9993-7c4fa399c615.nex
A cortex/data/snapshots/34be03ce-59ad-4fa7-b6f3-13027d8662ec.nex
A cortex/data/snapshots/3d99cea4-c501-438d-bb33-5c734ac7606c.nex
A cortex/data/snapshots/43a5567c-5bb3-4bec-9d5c-78033b5c4c2a.nex
A cortex/data/snapshots/4977e13a-c9fb-4c48-a32c-1aa16776932f.nex
A cortex/data/snapshots/4a34fbe8-9148-4040-b353-2f2f2788a373.nex
A cortex/data/snapshots/55fc31ae-47a8-4476-b0fb-f41077dd0e1c.nex
A cortex/data/snapshots/5a68fe49-b564-43b8-adc4-d4156d3887f9.nex
A cortex/data/snapshots/6b292f47-c1a4-48b4-8582-6f6c2e0658d5.nex
A cortex/data/snapshots/7c396c33-bbe8-465d-9394-e38888078f41.nex
A cortex/data/snapshots/827f9a11-a86b-4269-8b3a-d9c20ba1e8df.nex
A cortex/data/snapshots/8524f9d5-dbca-42e6-a049-48c5f7cd1078.nex
A cortex/data/snapshots/87289dad-1713-47d1-a1bd-270f4661aba9.nex
A cortex/data/snapshots/8e5c838f-6703-43c0-bb82-cce564e29e1d.nex
A cortex/data/snapshots/9e8836ea-f8d1-46a4-8bf2-41e45279df2a.nex
A cortex/data/snapshots/a204ea3b-0a2c-4ac1-a575-a93625fb4445.nex
A cortex/data/snapshots/a89108a7-c5bc-4f68-bf31-fa5e3dbc04fc.nex
A cortex/data/snapshots/b20e03b9-4394-4949-b17a-ebe8580b766a.nex
A cortex/data/snapshots/b4561663-7bdf-43c2-b7c4-fc705b38d880.nex
A cortex/data/snapshots/bcb7ed47-9f47-4cca-b7c6-b5d76584bf1b.nex
A cortex/data/snapshots/bf7770a8-2805-48ea-b22c-c59832f60cdd.nex
A cortex/data/snapshots/ca15dfa9-5acd-48b5-9731-493db46e2878.nex
A cortex/data/snapshots/cba2ed23-2446-4857-a5a8-e558cbb1e31d.nex
A cortex/data/snapshots/d172097c-0429-499e-b5ad-8c4909268473.nex
A cortex/data/snapshots/d5281daf-bb35-426a-b449-44ddaa987916.nex
A cortex/data/snapshots/d64bd34a-ae2e-4cdc-bdf0-9d12a329a254.nex
A cortex/data/snapshots/d68f30d3-fd00-477f-8bfd-0e4837ff01ad.nex
A cortex/data/snapshots/e970c2aa-a06c-4589-860e-3206944ce977.nex
A cortex/data/snapshots/f4ae589d-4128-4bea-9291-c015cf67384b.nex
A cortex/data/snapshots/f9729773-63e9-4d8d-b24f-f142704926fc.nex
A cortex/data/snapshots/fd51c375-e680-4a79-b7b0-e9937ceff499.nex
M cortex/versionium/index.js
A data/autopilot/autopilot.log
A data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/guardian_settings.json
A data/cortex/memory/intake_drops.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/cortex/memory/versionium_branches.json
A data/cortex/memory/versionium_calendar.json
A data/cortex/memory/versionium_commits.json
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_log.jsonl
A data/guardian/ledger/cfr/event_stats.json
A data/ledger/bridge/b.y/2026-09-02.jsonl
A data/ledger/bridge/b/2026-09-02.jsonl
A data/ledger/copilot/copilot.introspect/2026-09-02.jsonl
A data/ledger/copilot/copilot.person-model/2026-09-02.jsonl
A data/ledger/copilot/copilot.person-model/session-h1.jsonl
A data/ledger/copilot/copilot.person-model/session-h2.jsonl
A data/ledger/copilot/copilot.person-model/session-own.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
A data/ledger/copilot/copilot.person-model/session-x1.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-09-02.jsonl
A data/ledger/cortex/cortex.raid/2026-09-02.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-09-02.jsonl
A data/ledger/forge/forge.patch/2026-09-02.jsonl
A data/ledger/guardian/g.x/2026-09-02.jsonl
A data/ledger/guardian/g/2026-09-02.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-09-02.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-09-02.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-09-02.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-09-02.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-09-02.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-09-02.jsonl
A data/ledger/test/test.echo.ping/2026-09-02.jsonl
A data/ledger/test/test.event.check/2026-09-02.jsonl
A data/ledger/test/test.widget.panel/2026-09-02.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-09-02.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-09-02.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-09-02.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-09-02.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-09-02.jsonl
A data/raid/ledger/cfr/event_log.jsonl
M docs/versionium.spec
M idearium/index.js
M lib/agent-tools/index.js
M lib/agent-tools/tools/governance/versionium-commit.js
M loom/maps/session-2026-08-14-map.js
M orchestrator/lib/versionium-auto-commit.js
M tests/modules/run-all.js
A tests/modules/test-versionium-migration.js
```

### Build 0.39.38-r10 — snap-0472 — 2026-09-01 22:30:54

- Archive: `nexus-0472_2026-09-01_v0.39.38-r10_updated-1.zip` (was `nexus-updated-1.zip`)
- SHA-256: `65e30064a04ccf4d756dcafb5344df3ae62112d1ef64939ecbad9d3edef7e5b7`, 10.2 MB, downloaded 2026-09-01 22:53:14
- Kind: full
- Commit: `2e70fce1aab294903c5d5c7e84933f14b2637274`, tag `snap-0472`
- Files in archive: 2197. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| scripts | 0 | 1 | 0 |

```
M cortex/core/raid/index.js
M cortex/self-heal/index.js
M scripts/precommit-check.js
M tests/full.test.js
M tests/modules/healer.test.js
A tests/modules/test-self-heal-context.js
```

### Build 0.39.38-r11 — snap-0473 — 2026-09-01 22:30:54

- Archive: `nexus-0473_2026-09-01_v0.39.38-r11_updated.zip` (was `nexus-updated.zip`)
- SHA-256: `788ea6df2cab0d8ca5b6bfac5fa8884ace8173a81b6ca0fd83c8455a6fd87556`, 10.2 MB, downloaded 2026-09-01 22:53:44
- Kind: full
- Commit: `47631c3e6edf26f88756f1a1a611407acd6f7f66`, tag `snap-0473`
- Files in archive: 2182. Changes against the build before it: **0 added, 0 modified, 15 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| bridge | 0 | 0 | 15 |

```
D bridge/causal/expectation.js
D bridge/causal/graph.js
D bridge/causal/ledger.js
D bridge/causal/projections.js
D bridge/causal/schema.js
D bridge/causal/server.js
D bridge/config.js
D bridge/identity.js
D bridge/index.js
D bridge/interaction-contract.json
D bridge/registry-components.js
D bridge/registry.js
D bridge/router.js
D bridge/spec/bridge.spec
D bridge/types.js
```

### Build 0.39.38-r12 — snap-0474 — 2026-09-01 22:56:32

- Archive: `nexus-0474_2026-09-01_v0.39.38-r12_m-fixed.zip` (was `nexus-v0_39_38-m-fixed.zip`)
- SHA-256: `94cc99df8fb40928de4e0851f779a2f74d85a8ab727f485964c1cbaed5f2f422`, 38.6 MB, downloaded 2026-09-01 23:58:28
- Kind: full
- Commit: `3ae9590856639c8ccd2f3dc80fa4dc134090aa0e`, tag `snap-0474`
- Left out: embedded .git (3145 files, HEAD c258cf7fff26c75d9b6ad6e8da9450c0b594b764 (master))
- Files in archive: 2172. Changes against the build before it: **16 added, 6 modified, 26 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| bridge | 15 | 0 | 0 |
| intelligence | 0 | 0 | 15 |
| data | 0 | 0 | 10 |
| tests | 1 | 2 | 1 |
| cortex | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
A bridge/causal/expectation.js
A bridge/causal/graph.js
A bridge/causal/ledger.js
A bridge/causal/projections.js
A bridge/causal/schema.js
A bridge/causal/server.js
A bridge/config.js
A bridge/identity.js
A bridge/index.js
A bridge/interaction-contract.json
A bridge/registry-components.js
A bridge/registry.js
A bridge/router.js
A bridge/spec/bridge.spec
A bridge/types.js
M cortex/core/raid/index.js
M cortex/self-heal/index.js
D data/cortex/memory/component_ledger.json
D data/cortex/memory/event_log.json
D data/cortex/memory/guardian_settings.json
D data/cortex/memory/intake_drops.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/cortex/memory/versionium_branches.json
D data/cortex/memory/versionium_calendar.json
D data/cortex/memory/versionium_commits.json
M guardian/ask.js
D intelligence/adversarial.js
D intelligence/baseline.js
D intelligence/config.js
D intelligence/consumer.js
D intelligence/framework-builder.js
D intelligence/intuition.js
D intelligence/mastermind.js
D intelligence/registry-components.js
D intelligence/relational-field.js
D intelligence/rfr2/enforcement/index.js
D intelligence/rfr2/identity/index.js
D intelligence/rfr2/kernel/index.js
D intelligence/schemas.js
D intelligence/server.js
D intelligence/snapshot-trigger.js
M scripts/precommit-check.js
M tests/full.test.js
M tests/modules/healer.test.js
A tests/modules/test-ask-tools-shape.js
D tests/modules/test-self-heal-context.js
```

### Build 0.39.38-r13 — snap-0475 — 2026-09-01 23:38:40

- Archive: `nexus-0475_2026-09-01_v0.39.38-r13_m-fixed-2.zip` (was `nexus-v0_39_38-m-fixed (2).zip`)
- SHA-256: `52e709ae6fbb47766db4254241dd9644e9d5b01bcd49a831a0ca259e7068713f`, 42.2 MB, downloaded 2026-09-01 23:39:04
- Kind: full
- Commit: `f3b1496fec92b3708ca9ea4f5ac787841e85d12e`, tag `snap-0475`
- Left out: embedded .git (3145 files, HEAD c258cf7fff26c75d9b6ad6e8da9450c0b594b764 (master))
- Left out: node_modules (39 files)
- Files in archive: 2591. Changes against the build before it: **419 added, 18 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 400 | 8 | 0 |
| intelligence | 15 | 0 | 0 |
| cortex | 3 | 2 | 0 |
| (root) | 1 | 2 | 0 |
| idearium | 0 | 3 | 0 |
| architect | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M blueprint-index.json
M cortex/boot.js
M cortex/versionium/index.js
A diff for the .git and versionium spec.zip
M idearium/api/index.js
M idearium/cli/index.js
M idearium/index.js
A intelligence/adversarial.js
A intelligence/baseline.js
A intelligence/config.js
A intelligence/consumer.js
A intelligence/framework-builder.js
A intelligence/intuition.js
A intelligence/mastermind.js
A intelligence/registry-components.js
A intelligence/relational-field.js
A intelligence/rfr2/enforcement/index.js
A intelligence/rfr2/identity/index.js
A intelligence/rfr2/kernel/index.js
A intelligence/schemas.js
A intelligence/server.js
A intelligence/snapshot-trigger.js
M package-lock.json
M tests/modules/test-versionium-migration.js
```

413 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.38-r14 — snap-0476 — 2026-09-02 02:17:44

- Archive: `nexus-0476_2026-09-02_v0.39.38-r14_o.zip` (was `nexus-v0_39_38-o.zip`)
- SHA-256: `2af734bdfba063d43df790dc335934a828caedd9f43ac78d38b756ec033dd3fc`, 39.3 MB, downloaded 2026-09-02 02:31:55
- Kind: full
- Commit: `57c3070cd700e5b5dcfca3699bd57deebcdb882b`, tag `snap-0476`
- Left out: embedded .git (3201 files, HEAD ba8f2519fff84af7fabddb57878327f08b1fc38d (master))
- Files in archive: 2201. Changes against the build before it: **4 added, 31 modified, 394 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 16 | 389 |
| docs | 3 | 1 | 1 |
| guardian | 0 | 5 | 0 |
| (root) | 0 | 2 | 1 |
| cortex | 0 | 0 | 3 |
| loom | 0 | 3 | 0 |
| tests | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M blueprint-index.json
D diff for the .git and versionium spec.zip
A docs/2026-09-02-agent-mesh-full-map-phasemap.spec
A docs/2026-09-02-versionium-sovereign-and-cleanup-phasemap.spec
D docs/SPEC-REGISTRY.md
A docs/SPEC-REGISTRY.spec
M docs/versionium.spec
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/index.js
M loom/bootstrap.js
M loom/scanners/spec-map.js
M package-lock.json
M scripts/precommit-check.js
M tests/modules/run-all.js
A tests/modules/test-ack-injection-fix.js
```

410 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.38-r15 — snap-0477 — 2026-09-02 02:29:32

- Archive: `nexus-0477_2026-09-02_v0.39.38-r15_p.zip` (was `nexus-v0_39_38-p.zip`)
- SHA-256: `85752899f35f0447ad46019df999d1e7573891cdea61bf134e28486d7810da8f`, 39.4 MB, downloaded 2026-09-02 06:44:20
- Kind: full
- Commit: `27655fb52e418e2faf51d8861a983e9f436dce6a`, tag `snap-0477`
- Left out: embedded .git (3225 files, HEAD 6ae0e8f9e377c02726ca55bf165a6ef99d82c0c1 (master))
- Files in archive: 2203. Changes against the build before it: **2 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 5 | 0 |
| lib | 1 | 3 | 0 |
| tests | 1 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M copilot/lifeline.js
M cortex/core/raid/contract-intake.js
M data/cortex/memory/cfr_tension_history.json
M data/cortex/memory/guardian_settings.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/raid/ledger/cfr/event_log.jsonl
M guardian/server.js
A lib/agent-intent-contract.js
M lib/hat-forge.js
M lib/hat-seed.js
M lib/intake.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
A tests/modules/test-am1-intent-contract.js
```

### Build 0.39.38-r16 — snap-0478 — 2026-09-02 07:09:18

- Archive: `nexus-0478_2026-09-02_v0.39.38-r16_r.zip` (was `nexus-v0_39_38-r.zip`)
- SHA-256: `9b46c99f8fe72707cc3973951c43be17589e658c248a30c2bb73a27af60e1a52`, 39.9 MB, downloaded 2026-09-02 07:10:11
- Kind: full
- Commit: `634ceacb98a13c0ef892ad90e749857fee95aaf9`, tag `snap-0478`
- Left out: embedded .git (3291 files, HEAD e549975fa1f440ea5b478825a61b191d61742369 (master))
- Files in archive: 2221. Changes against the build before it: **19 added, 20 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| versionium | 12 | 0 | 0 |
| data | 5 | 2 | 0 |
| clear-glass | 0 | 6 | 0 |
| tests | 2 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| orchestrator | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| docs | 0 | 0 | 1 |
| intelligence | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M autopilot.js
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/history/store.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/preload/index.js
M cli/diagnose.js
M cortex/boot.js
M cortex/snapshot/index.js
M data/cortex/memory/event_log.json
A data/cortex/memory/versionium_branches.json
A data/cortex/memory/versionium_calendar.json
A data/cortex/memory/versionium_commits.json
M data/raid/ledger/cfr/event_log.jsonl
A data/versionium/poll_log.json
A data/versionium/settings.json
D docs/versionium.spec
M intelligence/alk/index.js
M lib/agent-tools/tools/governance/versionium-commit.js
M lib/version.js
M loom/maps/session-2026-08-14-map.js
M orchestrator/lib/versionium-auto-commit.js
M orchestrator/orchestrator.config.json
M tests/brutal.test.js
M tests/modules/run-all.js
A tests/modules/test-snapshot-half-life-prune.js
A tests/modules/test-versionium-sovereign.js
A versionium/config.js
A versionium/event-taxonomy.js
A versionium/lib/causality.js
A versionium/lib/engine.js
A versionium/lib/http-utils.js
A versionium/lib/migrate-legacy-data.js
A versionium/lib/store.js
A versionium/registry-components.js
A versionium/routes/system.js
A versionium/routes/versionium.js
A versionium/server.js
A versionium/spec/versionium.spec
```

### Build 0.39.38-r17 — snap-0479 — 2026-09-02 07:18:20

- Archive: `nexus-0479_2026-09-02_v0.39.38-r17_s.zip` (was `nexus-v0_39_38-s.zip`)
- SHA-256: `df2fef1f9cf3dae6fe92c17b0ab2fdf1fd771c2891d5432a92892b6dbb420e1a`, 39.8 MB, downloaded 2026-09-02 08:01:29
- Kind: full
- Commit: `b966cbff6de9f17d14edd23c9700fb7eaf2250ba`, tag `snap-0479`
- Left out: embedded .git (3296 files, HEAD f5d98cc66cc62212adbd416468dfdbd72a30adda (master))
- Files in archive: 2221. Changes against the build before it: **1 added, 1 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 1 | 0 |
| guardian | 0 | 0 | 1 |

```
A docs/2026-09-02-nexus-vision-master-phasemap.spec
M docs/SPEC-REGISTRY.spec
D guardian/powershell.exe
```

### Build 0.39.38-r18 — snap-0480 — 2026-09-02 12:34:28

- Archive: `nexus-0480_2026-09-02_v0.39.38-r18_w.zip` (was `nexus-v0_39_38-w.zip`)
- SHA-256: `8aa682aa0ee3fde35eedf5f30794856260e024f3926087877bd3c9caf00023bd`, 40.5 MB, downloaded 2026-09-02 12:45:44
- Kind: full
- Commit: `79bf6c2915c09b216bd91809efc7cede7f16a16e`, tag `snap-0480`
- Left out: embedded .git (3372 files, HEAD e27acef5d859113283c27286db1200c596254d2e (master))
- Files in archive: 2297. Changes against the build before it: **76 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 49 | 8 | 0 |
| cortex | 24 | 1 | 0 |
| lib | 0 | 6 | 0 |
| tests | 2 | 4 | 0 |
| guardian | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M cortex/core/raid/contract-intake.js
A cortex/core/raid/officiator.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A cortex/data/snapshots/087543cb-4cb8-4631-ad1d-e2ad867d7555.nex
A cortex/data/snapshots/32914232-b220-4216-8985-807b569114e9.nex
A cortex/data/snapshots/487130ff-8196-4277-afa5-e114c2eb93dd.nex
A cortex/data/snapshots/61cd2d46-140f-4898-b071-4f63bdd9af42.nex
A cortex/data/snapshots/62c4e2df-f460-4024-91d3-0e8c4f7bc948.nex
A cortex/data/snapshots/6744704a-0d49-4fb6-987b-3753ac55c463.nex
A cortex/data/snapshots/6f45122d-2a69-4749-adbf-c6c328526b76.nex
A cortex/data/snapshots/7f2b6e5e-036c-4b22-8e33-30ce171c2580.nex
A cortex/data/snapshots/8459138f-0cde-40d8-8068-eb6f39b51656.nex
A cortex/data/snapshots/9a7a82bc-94d7-47d2-8596-2434910d7a97.nex
A cortex/data/snapshots/a8551e40-658b-42cb-ba55-b665b0ad545f.nex
A cortex/data/snapshots/a9c13cab-32d7-4585-865e-50b903ef4db4.nex
A cortex/data/snapshots/adad80df-d49a-4a06-a29a-984a710559c4.nex
A cortex/data/snapshots/cb38dbe9-be48-4428-9b1e-17653d34ea83.nex
A cortex/data/snapshots/ce225134-bdd9-44ad-9763-1fb126514d37.nex
A cortex/data/snapshots/e20babbe-9a6a-4969-8555-f7932b640eaa.nex
A cortex/data/snapshots/ef101737-7e8d-47de-bb00-ca5e681215ae.nex
A cortex/data/snapshots/f871ae10-c261-497a-9a84-a5752fea6670.nex
A cortex/data/snapshots/fa8e399b-4b27-4104-8e5c-c49a29c2ff83.nex
A cortex/data/snapshots/fbd705a8-3175-4758-bec1-2e0063e93511.nex
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
M data/cortex/memory/cfr_tension_history.json
A data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
M data/cortex/memory/guardian_settings.json
A data/cortex/memory/intake_drops.json
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
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/intelligence/baseline-events.ndjson
A data/intelligence/baseline.json
A data/intelligence/invariant/baseline.json
A data/knowledge/facts.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-09-02.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-09-02.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-09-02.jsonl
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
A data/loom/baseline-events.ndjson
A data/loom/baseline.json
A data/loom/invariant/baseline.json
A data/ollama/baseline-events.ndjson
A data/ollama/baseline.json
A data/ollama/invariant/baseline.json
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
M data/raid/ledger/cfr/event_log.jsonl
M docs/2026-09-02-nexus-vision-master-phasemap.spec
A guardian/powershell.exe
M guardian/server.js
M lib/account-registry.js
M lib/hat-forge.js
M lib/hat-seed.js
M lib/intake.js
M lib/intent-classifier.js
M lib/loom-map.js
M loom/maps/raid-events-and-tools-map.js
M loom/maps/session-2026-08-14-map.js
M orchestrator/orchestrator.js
M service/nexus-diagnostic.js
M tests/diagnostic-fixes.test.js
M tests/modules/run-all.js
M tests/modules/test-hat-forge.js
M tests/modules/test-loom-map.js
A tests/modules/test-raid-officiator.js
A tests/modules/test-raid-processnext-am1-gate.js
```

### Build 0.39.38-r19 — snap-0481 — 2026-09-02 15:48:30

- Archive: `nexus-0481_2026-09-02_v0.39.38-r19_merged.zip` (was `nexus-merged.zip`)
- SHA-256: `f954b261f5e356d52a3e0b65b1cf5c27202467a1b1d236cbe1f2926644726a5d`, 40.8 MB, downloaded 2026-09-02 15:49:07
- Kind: full
- Commit: `6650c79d485452184ac2f1a7379f549dd89287c6`, tag `snap-0481`
- Left out: embedded .git (3402 files, HEAD 37229770f96322be64a245ae11f05717191368cc (master))
- Files in archive: 2301. Changes against the build before it: **4 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 3 | 0 |
| docs | 3 | 0 | 0 |
| lib | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
M copilot/server.js
A cortex/core/raid/contract-boundary.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/officiator.js
M cortex/self-heal/index.js
A docs/contracts/context-candidate.spec
A docs/contracts/context-synthesis-pipeline.spec
A docs/contracts/synthesis-contract.spec
M idearium/api/index.js
M lib/agent-tools/tool-guide.js
M lib/agent-tools/tools/faculty/faculty-tools.js
M tests/modules/test-faculty-tools.js
M tests/modules/test-raid-officiator.js
```

