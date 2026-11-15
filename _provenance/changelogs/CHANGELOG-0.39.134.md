# Nexus 0.39.134

| | |
|---|---|
| Built | 2026-09-13 10:35:02 → 2026-09-15 01:26:44 |
| Builds on the main line | 11 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.134, 0.39.135, 0.39.137, 0.39.138 |
| Tag | `v0.39.134` → snap-0580 |
| Full file ledger | [LEDGER-0.39.134.csv](../ledger/LEDGER-0.39.134.csv) |

## Ledger

### Build 0.39.134-r1 — snap-0570 — 2026-09-13 10:35:02

- Archive: `nexus-0570_2026-09-13_v0.39.134-r1_mco15-track-c.zip` (was `nexus-v0_39_134-mco15-track-c.zip`)
- SHA-256: `e884ab535b5f6e6502a2ae1dbcc9a7174bf9c74ae1dda083450055274da71d27`, 60.1 MB, downloaded 2026-09-13 10:43:47
- Kind: full
- Commit: `397c2638d650e4390b63c4997480db97cf9d99bc`, tag `snap-0570`
- Left out: embedded .git (6497 files, HEAD 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master))
- Files in archive: 3453. Changes against the build before it: **54 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 20 | 1 | 0 |
| data | 12 | 7 | 0 |
| idearium | 12 | 6 | 0 |
| lib | 3 | 3 | 0 |
| guardian | 5 | 0 | 0 |
| tests | 2 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
M cortex/core/raid/contract-intake.js
A cortex/data/snapshots/0c16ba28-812c-40a8-8473-c2c5ee7c3539.nex
A cortex/data/snapshots/2a70943a-3296-46a5-9b5a-d7b446b6749e.nex
A cortex/data/snapshots/2d78f0ed-d476-4370-a76c-f63368da803e.nex
A cortex/data/snapshots/34e643e8-ba86-4595-b172-fe624c43e3a7.nex
A cortex/data/snapshots/4b73291d-ab06-4a22-9a2f-a6e110851a37.nex
A cortex/data/snapshots/56d6d0aa-e2ff-438f-820f-435d86858d0e.nex
A cortex/data/snapshots/5cc607d9-8bb9-452d-a898-5c573b11574c.nex
A cortex/data/snapshots/6f835a2d-dde5-49ef-b8a3-5282dfdcf411.nex
A cortex/data/snapshots/7094cf81-b498-4b25-bf5a-6c76a082efb0.nex
A cortex/data/snapshots/8ed18d8c-9637-465d-8451-d3e44c74a4a3.nex
A cortex/data/snapshots/921b2cbc-9eb4-4131-81d1-d3d45a2e3fc7.nex
A cortex/data/snapshots/aeb87d84-503a-4e1e-9f54-560632bc006e.nex
A cortex/data/snapshots/af3cd61c-7ead-4de9-9481-0458df3535ca.nex
A cortex/data/snapshots/b3738512-402a-441a-bdad-f337cf180894.nex
A cortex/data/snapshots/ce37e1e9-ef63-4ab2-a339-f591720ca78c.nex
A cortex/data/snapshots/e09289e1-d780-4823-827d-2186578459d7.nex
A cortex/data/snapshots/e85f6866-3fca-4de3-896a-86ec313efe7c.nex
A cortex/data/snapshots/f2e80926-da21-404d-9885-0698424dc153.nex
A cortex/data/snapshots/f97b87ce-8763-4f6c-8190-0cf893b7db10.nex
A cortex/data/snapshots/f9d2f5ea-3229-4095-9d63-2c9d59f33b52.nex
M data/cortex/memory/cfr_tension_history.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/component_projections.json
A data/cortex/memory/components.json
M data/cortex/memory/event_log.json
A data/cortex/memory/idearium_ideas.json
A data/cortex/memory/idearium_repos.json
M data/cortex/memory/idearium_spec_chunk_events.json
A data/cortex/memory/idearium_spec_chunks.json.lock
A data/cortex/memory/idearium_spec_manifests.json
M data/cortex/memory/raid_contract_queue.json
A data/guardian/ledger/boot/events.ndjson
A data/guardian/ledger/cfr/event_log.jsonl
A data/guardian/memory/settings.json
M data/idearium/event_log.jsonl
M data/lattice/relationship_lattice.buffer.jsonl
A data/ledger/guardian/guardian.health/2026-09-13.jsonl
A data/raid/input/dddd6da0-5027-4de5-9c03-7f71e063d5b9.contract
M data/raid/ledger/cfr/event_log.jsonl
M docs/2026-09-13-axiom-5-2-raid-routing-phasemap.spec
A guardian/input/38214f9b-381e-457c-a760-a34c6065b778.contract
A guardian/input/3d66e369-e2c5-415a-a35f-46a3f5bb062a.contract
A guardian/input/6861fada-0c44-455c-b9af-21bf6bcf467f.contract
A guardian/input/c12624c0-870e-4415-9489-765e4373c3a1.contract
A guardian/input/dc183a7f-653c-4ebf-9bdb-961592ef2cd5.contract
A idearium/data/projects/nexus-id-repo-956b011e/00-contract-md.md
A idearium/data/projects/nexus-id-repo-956b011e/01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9.md
A idearium/data/specs/18e47204-b11f-4689-af6f-6ff34fa36219/04-api-a8bb9cf3.md
M idearium/data/specs/18e47204-b11f-4689-af6f-6ff34fa36219/manifest.json
A idearium/data/specs/24478305-8a62-438b-ba47-f3b04c7d07f3/05-events-78595326.md
M idearium/data/specs/24478305-8a62-438b-ba47-f3b04c7d07f3/manifest.json
A idearium/data/specs/2afd0854-b9a7-41f2-8af6-977204afd144/05-events-4833fbc4.md
M idearium/data/specs/2afd0854-b9a7-41f2-8af6-977204afd144/manifest.json
A idearium/data/specs/51e26753-c339-404f-9e69-399a09faef36/05-events-79c755a4.md
M idearium/data/specs/51e26753-c339-404f-9e69-399a09faef36/manifest.json
A idearium/data/specs/ae44a65d-578a-47ec-ad5f-14208c07312e/05-events-f6eb91e3.md
M idearium/data/specs/ae44a65d-578a-47ec-ad5f-14208c07312e/manifest.json
A idearium/data/specs/b91469e2-e515-4e69-9d0c-7913d883ae3b/04-api-6a370af8.md
M idearium/data/specs/b91469e2-e515-4e69-9d0c-7913d883ae3b/manifest.json
A idearium/data/specs/c9276ac2-e37a-4419-a187-c4ecfa2b884a/00-contract-md-8c143488.md
A idearium/data/specs/c9276ac2-e37a-4419-a187-c4ecfa2b884a/01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9-023443e0.md
A idearium/data/specs/c9276ac2-e37a-4419-a187-c4ecfa2b884a/c9276ac2-e37a-4419-a187-c4ecfa2b884a.spec
A idearium/data/specs/c9276ac2-e37a-4419-a187-c4ecfa2b884a/manifest.json
M lib/account-registry.js
A lib/component-boundary-check.js
A lib/component-exec-test.js
M lib/component-registry.js
A lib/require-graph.js
M lib/version.js
A tests/modules/mco15-component-boundary-check.test.js
A tests/modules/mco15-component-exec-test.test.js
M tests/modules/run-all.js
M tests/modules/test-account-registry.js
```

### Build 0.39.134-r2 — snap-0571 — 2026-09-13 15:53:56

- Archive: `nexus-0571_2026-09-13_v0.39.134-r2_final_declared-0.39.138.zip` (was `nexus-v0_39_138-FINAL.zip`)
- SHA-256: `c9f6264b40aa0544e1dd5f0f3eef66c44cc8f38490796886f0320f6d534f4c6e`, 60.1 MB, downloaded 2026-09-13 15:55:23
- Kind: full
- Claimed version: 0.39.138 (registry 0.39.138, file name 0.39.138); filed under 0.39.134 to keep the line in order
- Commit: `9252065fc5a8f9995e061c909a6fa2cc1202c284`, tag `snap-0571`
- Left out: embedded .git (6497 files, HEAD 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master))
- Files in archive: 3473. Changes against the build before it: **20 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 12 | 3 | 0 |
| clear-glass | 1 | 3 | 0 |
| guardian | 3 | 0 | 0 |
| contracts | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| copilot | 1 | 0 | 0 |
| data | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| orchestrator | 1 | 0 | 0 |

```
M architect/interaction-contract.json
A clear-glass/input/.gitkeep
M clear-glass/src/dom/archaeology.js
M clear-glass/src/gates/index.js
M clear-glass/src/main/index.js
M contracts/nexus-interaction-contract.js
M contracts/nodes/events.node.js
A copilot/interaction-contract.json
M cortex/boot.js
M cortex/core/raid/contract-intake.js
A cortex/data/snapshots/08cfa84d-5b3e-4170-b019-8e4511cd2810.nex
A cortex/data/snapshots/0fd34aa9-ec4d-4b7e-8494-e24976255ffe.nex
A cortex/data/snapshots/2ac95cc8-65d1-49ec-8640-70fcc5c83758.nex
A cortex/data/snapshots/55a55491-1ba8-44fe-85d8-9be7c01e128f.nex
A cortex/data/snapshots/6c02f8d2-fa0c-42ff-96f9-31c03736853c.nex
A cortex/data/snapshots/81be8ceb-59bf-4bf8-84e9-743255f31e92.nex
A cortex/data/snapshots/8aa39aea-6fbd-4b46-bdc0-659868c5e041.nex
A cortex/data/snapshots/ba15a69b-d535-43ce-ac7d-4df74c17bca6.nex
A cortex/data/snapshots/be59e37a-3410-42ec-ac1d-9d449079a4c3.nex
A cortex/data/snapshots/bf63dffb-17a8-465c-b881-db3c7ee8dfe3.nex
A cortex/data/snapshots/e554982d-5000-41d8-ad77-369d0937c0cc.nex
A cortex/data/snapshots/fa54366a-3126-4b81-922e-ccc23a815f1c.nex
M cortex/interaction-contract.json
M data/raid/ledger/cfr/event_log.jsonl
A docs/2026-09-13-track-b-sovereignty-phasemap.spec
A guardian/input/43e3c367-7f24-4814-8267-6eca61180111.contract
A guardian/input/757a7719-723f-4916-b54b-95c912e2b747.contract
A guardian/input/cd1262af-279a-4e29-bad9-e079e602a103.contract
M idearium/interaction-contract.json
M lib/version.js
A orchestrator/interaction-contract.json
A tests/modules/mco19-clearglass-dispatch.test.js
M tests/modules/run-all.js
```

### Build 0.39.134-r3 — snap-0572 — 2026-09-13 18:00:48

- Archive: `nexus-0572_2026-09-13_v0.39.134-r3_idearium-wired_declared-0.39.138.zip` (was `nexus-v0_39_138-idearium-wired.zip`)
- SHA-256: `e36efe29fae83f86b070189a7cd6779de7c1cda61c3efda01bcd4edc4e0048a2`, 60.4 MB, downloaded 2026-09-13 18:02:57
- Kind: full
- Claimed version: 0.39.138 (registry 0.39.138, file name 0.39.138); filed under 0.39.134 to keep the line in order
- Commit: `c683a17c5624ab3bb7300bed0c49b1a29746fc20`, tag `snap-0572`
- Identical copy: `nexus-0572_2026-09-13_v0.39.134-r3_idearium-wired-1_dup1_declared-0.39.138.zip` (was `nexus-v0_39_138-idearium-wired-1.zip`)
- Left out: embedded .git (6512 files, HEAD c0910326aca66c61c42fc443d0f9376d80009aa1 (master))
- Files in archive: 3474. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 1 | 0 |
| idearium | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A docs/IDEARIUM-PHASE-MAP-v2.md
M docs/specs/IDEARIUM.spec.md
M idearium/index.js
M idearium/spec/idearium.spec
M lib/version.js
```

### Build 0.39.134-r4 — snap-0573 — 2026-09-13 22:27:26

- Archive: `nexus-0573_2026-09-13_v0.39.134-r4_mco19-clearglass_declared-0.39.137.zip` (was `nexus-v0_39_137-mco19-clearglass.zip`)
- SHA-256: `2dafa008c45f3c35024e795fdd739b9736b3dd897b9be53285179eeaf94042a0`, 60.1 MB, downloaded 2026-09-15 06:00:00
- Kind: full
- Claimed version: 0.39.137 (registry 0.39.137, file name 0.39.137); filed under 0.39.134 to keep the line in order
- Commit: `24eb0def2fe83f857af9307a54a88fb65dc45003`, tag `snap-0573`
- Left out: embedded .git (6497 files, HEAD 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master))
- Files in archive: 3468. Changes against the build before it: **0 added, 8 modified, 6 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 2 | 4 |
| docs | 0 | 1 | 1 |
| idearium | 0 | 2 | 0 |
| clear-glass | 0 | 1 | 0 |
| data | 0 | 1 | 0 |
| guardian | 0 | 0 | 1 |
| lib | 0 | 1 | 0 |

```
M clear-glass/src/gates/index.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
D cortex/data/snapshots/08cfa84d-5b3e-4170-b019-8e4511cd2810.nex
D cortex/data/snapshots/8aa39aea-6fbd-4b46-bdc0-659868c5e041.nex
D cortex/data/snapshots/bf63dffb-17a8-465c-b881-db3c7ee8dfe3.nex
D cortex/data/snapshots/e554982d-5000-41d8-ad77-369d0937c0cc.nex
M data/raid/ledger/cfr/event_log.jsonl
D docs/IDEARIUM-PHASE-MAP-v2.md
M docs/specs/IDEARIUM.spec.md
D guardian/input/757a7719-723f-4916-b54b-95c912e2b747.contract
M idearium/index.js
M idearium/spec/idearium.spec
M lib/version.js
```

### Build 0.39.134-r5 — snap-0574 — 2026-09-14 16:16:00

- Archive: `nexus-0574_2026-09-14_v0.39.134-r5_mco-track-c-session.zip` (was `nexus-v0_39_134-mco-track-c-session.zip`)
- SHA-256: `ebc563727797f1e9c3c3ed0bc22b84d8e77ef439fc46c1930aabbdea48e2d234`, 61.8 MB, downloaded 2026-09-14 22:07:40
- Kind: full
- Commit: `0e1e968efa84c103f69a984c01db7a0fe5361229`, tag `snap-0574`
- Left out: embedded .git (6738 files, HEAD bddfb954870d0d8ee5de01974e6c86ab94ff0e55 (master))
- Left out: node_modules (53 files)
- Files in archive: 3689. Changes against the build before it: **237 added, 94 modified, 16 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 127 | 10 | 1 |
| guardian | 7 | 54 | 2 |
| cortex | 31 | 3 | 8 |
| copilot | 28 | 2 | 1 |
| lib | 14 | 6 | 0 |
| tests | 15 | 2 | 1 |
| idearium | 12 | 2 | 0 |
| clear-glass | 0 | 4 | 1 |
| docs | 1 | 3 | 1 |
| loom | 2 | 2 | 0 |
| contracts | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| orchestrator | 0 | 0 | 1 |
| ui | 0 | 1 | 0 |

```
M architect/interaction-contract.json
D clear-glass/input/.gitkeep
M clear-glass/spec/clear-glass.spec
M clear-glass/src/dom/archaeology.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
M contracts/nexus-interaction-contract.js
A copilot/commands/get-api-axioms.command
A copilot/commands/get-api-diagnose-list.command
A copilot/commands/get-api-lifeline-health.command
A copilot/commands/get-api-sessions.command
A copilot/commands/get-api-stream.command
A copilot/commands/get-api-tools.command
A copilot/commands/post-api-axioms-add.command
A copilot/commands/post-api-axioms-remove.command
A copilot/commands/post-api-build.command
A copilot/commands/post-api-channel.command
A copilot/commands/post-api-diagnose.command
A copilot/commands/post-api-event.command
A copilot/commands/post-api-observe.command
A copilot/commands/post-api-prompt-fulfill.command
A copilot/commands/post-api-prompt-stream.command
A copilot/commands/post-api-prompt-tools.command
A copilot/commands/post-api-prompt.command
A copilot/commands/post-api-stream-ingest.command
A copilot/commands/post-bridge-deliver.command
D copilot/interaction-contract.json
A copilot/lib/command-index-extract.js
M copilot/registry-components.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
M cortex/interaction-contract.json
M docs/2026-09-13-axiom-5-2-raid-routing-phasemap.spec
D docs/2026-09-13-track-b-sovereignty-phasemap.spec
A docs/2026-09-14-idearium-enterprise-repo-phasemap.spec
M docs/specs/CORTEX.spec.md
M docs/specs/GUARDIAN.spec.md
M guardian/commands/get-alk-last.command
M guardian/commands/get-api-guardian-cfr-state.command
M guardian/commands/get-api-guardian-hooks-summary.command
M guardian/commands/get-api-guardian-nerve-snapshot.command
M guardian/commands/get-api-guardian-organism-queue.command
M guardian/commands/get-api-intake.command
A guardian/commands/get-api-responses.command
M guardian/commands/get-api-tools.command
M guardian/commands/get-artifacts.command
M guardian/commands/get-baseline.command
M guardian/commands/get-bus.command
M guardian/commands/get-channel.command
A guardian/commands/get-cockpit-.command
M guardian/commands/get-cockpit.command
M guardian/commands/get-commands.command
M guardian/commands/get-contract.command
M guardian/commands/get-events.command
M guardian/commands/get-gaps-summary.command
M guardian/commands/get-gaps.command
M guardian/commands/get-health.command
A guardian/commands/get-jobs-.command
M guardian/commands/get-jobs.command
A guardian/commands/get-ncp-clients.command
M guardian/commands/get-providers.command
M guardian/commands/get-queue-compartments.command
M guardian/commands/get-queue.command
M guardian/commands/get-root.command
M guardian/commands/get-seam-queues.command
M guardian/commands/get-seam-sessions.command
M guardian/commands/get-seam-status-cross-system.command
M guardian/commands/get-seam-watchdog-status.command
M guardian/commands/get-sessions.command
M guardian/commands/get-version.command
M guardian/commands/post-api-account-identity.command
M guardian/commands/post-api-copilot-prompt.command
M guardian/commands/post-api-guardian-cfr-event.command
M guardian/commands/post-api-intake-promote.command
M guardian/commands/post-api-intake-rollback.command
M guardian/commands/post-api-intake-verdict.command
M guardian/commands/post-api-intake.command
M guardian/commands/post-build.command
M guardian/commands/post-bus-emit.command
M guardian/commands/post-chatgpt-mode-query.command
M guardian/commands/post-cli-exec.command
M guardian/commands/post-command-tools.command
M guardian/commands/post-command.command
A guardian/commands/post-dom-event.command
M guardian/commands/post-heartbeat.command
M guardian/commands/post-queue-compartments.command
M guardian/commands/post-queue-enqueue.command
M guardian/commands/post-result.command
M guardian/commands/post-seam-retry.command
M guardian/commands/post-seam-sessions.command
M guardian/commands/post-wake-job-ack.command
D guardian/input/43e3c367-7f24-4814-8267-6eca61180111.contract
D guardian/input/cd1262af-279a-4e29-bad9-e079e602a103.contract
M guardian/lib/dispatcher.js
A guardian/lib/ncp-dispatch-target.js
M guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
M guardian/routes/autonomous-loop.js
A guardian/schemas/schema.response
M guardian/server.js
M idearium/interaction-contract.json
M idearium/repo/index.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/dom-mutate.js
A lib/agent-tools/tools/ncp/clients.js
A lib/agent-tools/tools/raid/submit-contract.js
A lib/agent-tools/tools/work-surface/create.js
A lib/agent-tools/tools/work-surface/get-chunk.js
M lib/autonomous-loop.js
A lib/clearglass-dispatch.js
M lib/compartment-engine.js
A lib/generate-command-nodes.js
M lib/node-export.js
A lib/node-schemas/schema.compartment
A lib/node-schemas/schema.handoff
A lib/node-schemas/schema.manifest
A lib/node-schemas/schema.response
A lib/node-schemas/schema.worksurface
M lib/project-compartment.js
A lib/repo-manifest.js
M lib/version.js
A lib/work-surface.js
M loom/contracts/index.js
M loom/test/contracts.test.js
M ollama/registry-components.js
D orchestrator/interaction-contract.json
M package.json
A tests/dispatcher-ncp-fanout.test.js
M tests/modules/compartment-engine.test.js
A tests/modules/mco16-clearglass-dispatch.test.js
A tests/modules/mco16-raid-submit-route.test.js
A tests/modules/mco16d-copilot-tool-parity.test.js
A tests/modules/mco16e-dom-response-node.test.js
A tests/modules/mco16f-loom-capability-registration.test.js
A tests/modules/mco18-tv-shell-cli.test.js
D tests/modules/mco19-clearglass-dispatch.test.js
A tests/modules/mco19-command-node-generation.test.js
A tests/modules/mco20-project-compartment-worksurface.test.js
A tests/modules/mco20-work-surface-tools.test.js
A tests/modules/mco20-work-surface.test.js
A tests/modules/mco21-autonomous-executor-tools.test.js
A tests/modules/mco22-idearium-repo-manifest.test.mjs
A tests/modules/mco22-repo-manifest.test.js
A tests/modules/ncp-dispatch-target.test.js
M tests/modules/run-all.js
M ui/tv-shell/index.html
```

200 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.134-r6 — snap-0575 — 2026-09-14 21:56:28

- Archive: `nexus-0575_2026-09-14_v0.39.134-r6_mco-track-c-session-updated.zip` (was `nexus-v0_39_134-mco-track-c-session-updated.zip`)
- SHA-256: `f7a238b16fc3e1bda4326c38d9e2c3bcb5efd3ac2bae30d42894ffcfc4470ea5`, 61.8 MB, downloaded 2026-09-14 22:08:32
- Kind: full
- Commit: `370da25f1d3f1aa080d5c3a8986e899ecca6815a`, tag `snap-0575`
- Left out: embedded .git (6753 files, HEAD 4f7e79b7d76f8370217b79de207d52017aad2b15 (master))
- Left out: node_modules (53 files)
- Files in archive: 3693. Changes against the build before it: **4 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 3 | 1 | 0 |
| data | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M data/cortex/memory/tool_index.json
M lib/agent-tools/index.js
A lib/agent-tools/tools/project/ingest.js
A lib/component-chunker.js
A lib/project-ingest.js
A tests/modules/test-component-chunker.js
```

### Build 0.39.134-r7 — snap-0576 — 2026-09-14 23:11:56

- Archive: `nexus-0576_2026-09-14_v0.39.134-r7_mco17-patched.zip` (was `nexus-v0_39_134-mco17-patched.zip`)
- SHA-256: `6c80b82cd37813e7aae2a53e737c2776e52f5931b9ce02c164859ffb6364bdc4`, 10.3 MB, downloaded 2026-09-14 23:14:36
- Kind: full
- Commit: `ac01b80559dfec6ed7dfe22bc1a0a12e805d9a91`, tag `snap-0576`
- Files in archive: 3718. Changes against the build before it: **25 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 16 | 6 | 0 |
| lib | 4 | 3 | 0 |
| clear-glass | 2 | 1 | 0 |
| docs | 1 | 1 | 0 |
| tests | 2 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M NODE-TAXONOMY.md
A clear-glass/data/nodes/dom/pick-abc.dom
A clear-glass/lib/dom-nodes.js
M clear-glass/src/dom/archaeology.js
M data/cortex/memory/tool_index.json
M docs/SPEC-REGISTRY.spec
A docs/nexus-node-index.spec
A guardian/data/node-index/nodes_intent.json
A guardian/data/node-index/nodes_intent_ledger.json
A guardian/data/nodes/event/4789d44f-93d5-48c3-8635-3a7a9fbef564.event
A guardian/data/nodes/event/4ee58751-d167-473b-99a4-6a4cc1d60ce5.event
A guardian/data/nodes/event/52e5af39-a3ee-40c0-bad8-5a54f39ceef7.event
A guardian/data/nodes/event/7dd1df23-2318-4d99-8fda-8b2777bb5d60.event
A guardian/data/nodes/event/83c5a559-23d2-4bc5-9e29-abdc5291250f.event
A guardian/data/nodes/event/851eca6c-6ec7-4c63-b28a-fab83fa36899.event
A guardian/data/nodes/event/8f7e3f9b-ae38-4904-97f1-1f3c46625992.event
A guardian/data/nodes/event/94a57edb-c382-47a6-b8dc-3d3a23be678a.event
A guardian/data/nodes/event/99f44c79-22d1-42a2-9074-32170f9fbbc5.event
A guardian/data/nodes/event/b6a348bb-c43c-47f7-aeb7-5c24a42eebf8.event
A guardian/data/nodes/event/b9dd33a1-e24c-4163-9677-41066edd92eb.event
A guardian/data/nodes/event/c0e30d87-13d7-47b2-a354-d3a27778bbed.event
M guardian/event-taxonomy.js
M guardian/jaa-store.js
M guardian/lib/node-registry.js
A guardian/lib/response-nodes.js
A guardian/lib/response-watchdog.js
M guardian/schemas/schema.response
M guardian/server.js
M guardian/userscript-chatgpt.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/query/query-nodes.js
M lib/node-export.js
A lib/node-schemas/schema.database
A lib/node-schemas/schema.dom
M lib/node-schemas/schema.response
A lib/system-db.js
A tests/modules/mco16f-response-watchdog.test.js
A tests/modules/mco17-system-db-and-dom-nodes.test.js
```

### Build 0.39.134-r8 — snap-0577 — 2026-09-14 23:17:32

- Archive: `nexus-0577_2026-09-14_v0.39.134-r8_declared-0.39.135.zip` (was `nexus-0.39.135.zip`)
- SHA-256: `0d6705c0dc2a062d82d380e811e59daee6b6f8ce1eaf4813c2f4eedc262d0984`, 10.3 MB, downloaded 2026-09-14 23:34:06
- Kind: full
- Claimed version: 0.39.135 (registry 0.39.135, file name 0.39.135); filed under 0.39.134 to keep the line in order
- Commit: `10cbc48a332fc2b342b35c11e7516cc2be92caef`, tag `snap-0577`
- Files in archive: 3724. Changes against the build before it: **6 added, 65 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 6 | 56 | 0 |
| data | 0 | 6 | 0 |
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M clear-glass/data/nodes/dom/pick-abc.dom
M data/cortex/memory/cfr_tension_history.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/guardian/memory/settings.json
M data/lattice/relationship_lattice.buffer.jsonl
M guardian/commands/get-alk-last.command
M guardian/commands/get-api-guardian-cfr-state.command
M guardian/commands/get-api-guardian-hooks-summary.command
M guardian/commands/get-api-guardian-nerve-snapshot.command
M guardian/commands/get-api-guardian-organism-queue.command
M guardian/commands/get-api-intake.command
M guardian/commands/get-api-responses.command
M guardian/commands/get-api-tools.command
M guardian/commands/get-artifacts.command
M guardian/commands/get-baseline.command
M guardian/commands/get-bus.command
M guardian/commands/get-channel.command
M guardian/commands/get-cockpit-.command
M guardian/commands/get-cockpit.command
M guardian/commands/get-commands.command
M guardian/commands/get-contract.command
M guardian/commands/get-events.command
M guardian/commands/get-gaps-summary.command
M guardian/commands/get-gaps.command
M guardian/commands/get-health.command
M guardian/commands/get-jobs-.command
M guardian/commands/get-jobs.command
M guardian/commands/get-ncp-clients.command
M guardian/commands/get-providers.command
M guardian/commands/get-queue-compartments.command
M guardian/commands/get-queue.command
M guardian/commands/get-root.command
M guardian/commands/get-seam-queues.command
M guardian/commands/get-seam-sessions.command
M guardian/commands/get-seam-status-cross-system.command
M guardian/commands/get-seam-watchdog-status.command
M guardian/commands/get-sessions.command
M guardian/commands/get-version.command
M guardian/commands/post-api-account-identity.command
M guardian/commands/post-api-copilot-prompt.command
M guardian/commands/post-api-guardian-cfr-event.command
M guardian/commands/post-api-intake-promote.command
M guardian/commands/post-api-intake-rollback.command
M guardian/commands/post-api-intake-verdict.command
M guardian/commands/post-api-intake.command
M guardian/commands/post-build.command
M guardian/commands/post-bus-emit.command
M guardian/commands/post-chatgpt-mode-query.command
M guardian/commands/post-cli-exec.command
M guardian/commands/post-command-tools.command
M guardian/commands/post-command.command
M guardian/commands/post-dom-event.command
M guardian/commands/post-heartbeat.command
M guardian/commands/post-queue-compartments.command
M guardian/commands/post-queue-enqueue.command
M guardian/commands/post-result.command
M guardian/commands/post-seam-retry.command
M guardian/commands/post-seam-sessions.command
M guardian/commands/post-wake-job-ack.command
M guardian/data/node-index/nodes_command.json
M guardian/data/node-index/nodes_command_ledger.json
A guardian/data/nodes/event/2844f7f7-06a4-473d-b9de-41d31e178991.event
A guardian/data/nodes/event/4cc44286-4afa-41d9-b61a-74197b29dd15.event
A guardian/data/nodes/event/5a2301ae-6b2a-4020-8183-cfe0416620e1.event
A guardian/data/nodes/event/6a8d77ff-5566-4192-b6aa-ede125c8787d.event
A guardian/data/nodes/event/78423e99-ce4a-4e52-b6d9-d21a91ba4970.event
A guardian/data/nodes/event/f5293596-096d-47a7-8029-d3924391fe7b.event
M lib/version.js
M package.json
```

### Build 0.39.134-r9 — snap-0578 — 2026-09-14 23:46:22

- Archive: `nexus-0578_2026-09-14_v0.39.134-r9_vnamed-0.39.135-session.zip` (was `nexus-v0_39_135-session.zip`)
- SHA-256: `a7bde9f9bb5d8961cb6bfa08c42c4bd315571c6edc92d7461f9e0fadb86e9ab4`, 64.8 MB, downloaded 2026-09-14 23:48:38
- Kind: full
- Claimed version: 0.39.135 (registry 0.39.134, file name 0.39.135); filed under 0.39.134 to keep the line in order
- Commit: `e2b22b9516638dcbeb9bcfeb5ddc3f7ad1843b8d`, tag `snap-0578`
- Identical copy: `nexus-0578_2026-09-14_v0.39.134-r9_vnamed-0.39.135-session-1_dup1.zip` (was `nexus-v0_39_135-session-1.zip`)
- Left out: embedded .git (6776 files, HEAD d0daec39322ea3de2c8456095ad1a082f276f8b6 (master))
- Left out: node_modules (53 files)
- Files in archive: 4222. Changes against the build before it: **523 added, 68 modified, 25 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 512 | 0 | 0 |
| guardian | 6 | 56 | 20 |
| data | 1 | 8 | 0 |
| lib | 0 | 2 | 3 |
| copilot | 2 | 0 | 0 |
| loom | 2 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 0 | 0 | 1 |
| tests | 0 | 0 | 1 |

```
D docs/nexus-node-index.spec
M guardian/commands/get-alk-last.command
M guardian/commands/get-api-guardian-cfr-state.command
M guardian/commands/get-api-guardian-hooks-summary.command
M guardian/commands/get-api-guardian-nerve-snapshot.command
M guardian/commands/get-api-guardian-organism-queue.command
M guardian/commands/get-api-intake.command
M guardian/commands/get-api-responses.command
M guardian/commands/get-api-tools.command
M guardian/commands/get-artifacts.command
M guardian/commands/get-baseline.command
M guardian/commands/get-bus.command
M guardian/commands/get-channel.command
M guardian/commands/get-cockpit-.command
M guardian/commands/get-cockpit.command
M guardian/commands/get-commands.command
M guardian/commands/get-contract.command
M guardian/commands/get-events.command
M guardian/commands/get-gaps-summary.command
M guardian/commands/get-gaps.command
M guardian/commands/get-health.command
M guardian/commands/get-jobs-.command
M guardian/commands/get-jobs.command
M guardian/commands/get-ncp-clients.command
M guardian/commands/get-providers.command
M guardian/commands/get-queue-compartments.command
M guardian/commands/get-queue.command
M guardian/commands/get-root.command
M guardian/commands/get-seam-queues.command
M guardian/commands/get-seam-sessions.command
M guardian/commands/get-seam-status-cross-system.command
M guardian/commands/get-seam-watchdog-status.command
M guardian/commands/get-sessions.command
M guardian/commands/get-version.command
M guardian/commands/post-api-account-identity.command
M guardian/commands/post-api-copilot-prompt.command
M guardian/commands/post-api-guardian-cfr-event.command
M guardian/commands/post-api-intake-promote.command
M guardian/commands/post-api-intake-rollback.command
M guardian/commands/post-api-intake-verdict.command
M guardian/commands/post-api-intake.command
M guardian/commands/post-build.command
M guardian/commands/post-bus-emit.command
M guardian/commands/post-chatgpt-mode-query.command
M guardian/commands/post-cli-exec.command
M guardian/commands/post-command-tools.command
M guardian/commands/post-command.command
M guardian/commands/post-dom-event.command
M guardian/commands/post-heartbeat.command
M guardian/commands/post-queue-compartments.command
M guardian/commands/post-queue-enqueue.command
M guardian/commands/post-result.command
M guardian/commands/post-seam-retry.command
M guardian/commands/post-seam-sessions.command
M guardian/commands/post-wake-job-ack.command
M lib/agent-tools/index.js
D lib/agent-tools/tools/project/ingest.js
D lib/component-chunker.js
D lib/project-ingest.js
M lib/version.js
M package.json
D tests/modules/test-component-chunker.js
```

554 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.134-r10 — snap-0579 — 2026-09-15 00:05:10

- Archive: `nexus-0579_2026-09-15_v0.39.134-r10_guardian-abandoned-fix.zip` (was `nexus-guardian-abandoned-fix.zip`)
- SHA-256: `7c64232b9f70e7b2de2e0345631a1a076f31164e076998a5805ed2608c62eb54`, 64.9 MB, downloaded 2026-09-15 00:08:26
- Kind: full
- Commit: `557ffecdb0a3ba88a21668c7e66d31131be5e1c3`, tag `snap-0579`
- Left out: embedded .git (6776 files, HEAD d0daec39322ea3de2c8456095ad1a082f276f8b6 (master))
- Left out: node_modules (53 files)
- Files in archive: 4223. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M copilot/tool-runtime.js
M guardian/server.js
A tests/modules/mco23-guardian-response-abandoned-wiring.test.js
```

### Build 0.39.134-r11 — snap-0580 — 2026-09-15 01:26:44

- Archive: `nexus-0580_2026-09-15_v0.39.134-r11_guardian-phase0-4-integrated.zip` (was `nexus-guardian-phase0-4-integrated.zip`)
- SHA-256: `d6ca67a69a335fb82368b4b3e3e4b69c55423db81a66ef30e8f8ee14cb99290c`, 13.1 MB, downloaded 2026-09-15 01:29:54
- Kind: full
- Commit: `7703cd084ac227de8a125efd8adb7b4c189df59a`, tag `snap-0580`
- Left out: node_modules (53 files)
- Files in archive: 4223. Changes against the build before it: **0 added, 12 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 10 | 0 |
| lib | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
M guardian/lib/dispatcher.js
M guardian/lib/jobs.js
M guardian/lib/response-nodes.js
M guardian/schemas/schema.response
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/node-schemas/schema.response
M nexus/autopilot.js
```

