# Nexus 0.9.8

| | |
|---|---|
| Built | 2026-06-20 07:26:46 → 2026-07-04 14:22:56 |
| Builds on the main line | 96 |
| Other archives filed here | 8 |
| Versions the builds claimed | 0.9.8, 0.9.9, 1.0.0, 1.1.0, 1.2.0, 1.4.0 |
| Tag | `v0.9.8` → snap-0242 |
| Full file ledger | [LEDGER-0.9.8.csv](../ledger/LEDGER-0.9.8.csv) |

## Ledger

### Build 0.9.8-r1 — snap-0139 — 2026-06-20 07:26:46

- Archive: `nexus-0139_2026-06-20_v0.9.8-r1_integrated-14.zip` (was `nexus-integrated-14-v0_9_8.zip`)
- SHA-256: `8b45351c59c16f5027fc33f5ce65957ec4f565b5987c8d045198a99e3f116876`, 16 MB, downloaded 2026-06-20 07:53:04
- Kind: full
- Commit: `291957121f4abfed17f68f1de9630ceddb2ceeb2`, tag `snap-0139`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 686. Changes against the build before it: **1 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A CHANGELOG.md
M bridge/server.js
M guardian/server.js
M lib/ncp.js
M lib/sigma-writer.js
M lib/version.js
M package.json
```

### Build 0.9.8-r2 — snap-0140 — 2026-06-20 07:57:36

- Archive: `nexus-0140_2026-06-20_v0.9.8-r2_integrated-14-1.zip` (was `nexus-integrated-14-v0_9_8-1.zip`)
- SHA-256: `182072801d282415aaaf8537d3ec4351c766adb18ed2a588db7771f8fec01c0f`, 48 MB, downloaded 2026-06-20 08:00:27
- Kind: full
- Commit: `db0c21e3094d16ff0b404889b993ccb40c5a7aaf`, tag `snap-0140`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Left out (50 MB or more): `nexus-integrated-13/cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `nexus-integrated-13/cortex/data/memory_index.jsonl (52 MB)`
- Left out (50 MB or more): `nexus-v0_9_8/cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `nexus-v0_9_8/cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 2057. Changes against the build before it: **1367 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-v0_9_8 | 684 | 0 | 0 |
| nexus-integrated-13 | 683 | 0 | 0 |

```
A nexus-integrated-13/MANIFEST.json
A nexus-integrated-13/PATCH-NOTES.md
A nexus-integrated-13/README.md
A nexus-integrated-13/START.md
A nexus-integrated-13/TUTORIAL.md
A nexus-integrated-13/architect/compile-route.js
A nexus-integrated-13/architect/docs/ARCHITECT-SPEC-v1.1.0.md
A nexus-integrated-13/architect/package.json
A nexus-integrated-13/architect/service.js
A nexus-integrated-13/architect/src/hooks/Registry.js
A nexus-integrated-13/architect/src/hooks/sync-from-component-registry.js
A nexus-integrated-13/architect/src/spec/Blueprint.js
A nexus-integrated-13/architect/src/ui/alk-lattice.html
A nexus-integrated-13/architect/src/ui/arch-builder.html
A nexus-integrated-13/architect/src/ui/architect_universe.svg
A nexus-integrated-13/architect/src/ui/layered-snr-gates-axioms.svg
A nexus-integrated-13/architect/src/ui/spec-builder.html
A nexus-integrated-13/auth/client.js
A nexus-integrated-13/auth/index.js
A nexus-integrated-13/auth/keys/nexus-private.pem
A nexus-integrated-13/auth/keys/nexus-public.pem
A nexus-integrated-13/auth/policy.json
A nexus-integrated-13/autopilot.js
A nexus-integrated-13/bridge/causal/graph.js
A nexus-integrated-13/bridge/causal/ledger.js
A nexus-integrated-13/bridge/causal/projections.js
A nexus-integrated-13/bridge/causal/schema.js
A nexus-integrated-13/bridge/causal/server.js
A nexus-integrated-13/bridge/identity.js
A nexus-integrated-13/bridge/index.js
A nexus-integrated-13/bridge/ledger.js
A nexus-integrated-13/bridge/registry.js
A nexus-integrated-13/bridge/router.js
A nexus-integrated-13/bridge/server.js
A nexus-integrated-13/bridge/types.js
A nexus-integrated-13/cli/boot-systems.js
A nexus-integrated-13/cli/cfr-debug.js
A nexus-integrated-13/cli/diagnose.js
A nexus-integrated-13/cli/nexus-cli.js
A nexus-integrated-13/cli/nexus-repl.js
A nexus-integrated-13/cli/nexus.js
A nexus-integrated-13/cli/run-supervised.js
A nexus-integrated-13/cli/session.js
A nexus-integrated-13/cockpit/cli.js
A nexus-integrated-13/cockpit/cockpit.spec
A nexus-integrated-13/cockpit/core.js
A nexus-integrated-13/cockpit/forge.js
A nexus-integrated-13/cockpit/pipeline.js
A nexus-integrated-13/contracts/SYSTEM-CONTRACTS.js
A nexus-integrated-13/contracts/nexus-interaction-contract.js
A nexus-integrated-13/cortex/agent-tools/index.js
A nexus-integrated-13/cortex/agents/chatgpt/index.js
A nexus-integrated-13/cortex/agents/claude/index.js
A nexus-integrated-13/cortex/agents/gemini/index.js
A nexus-integrated-13/cortex/agents/index.js
A nexus-integrated-13/cortex/automation/engine.js
A nexus-integrated-13/cortex/automation/queue-manager.js
A nexus-integrated-13/cortex/behavioral-boundary/index.js
A nexus-integrated-13/cortex/boot.js
A nexus-integrated-13/cortex/cobalt.manifest.json
A nexus-integrated-13/cortex/contract/index.js
A nexus-integrated-13/cortex/core/raid/index.js
A nexus-integrated-13/cortex/core/raid/intelligence-bridge.js
A nexus-integrated-13/cortex/core/raid/snr-filter.js
A nexus-integrated-13/cortex/cortex-v2.js
A nexus-integrated-13/cortex/cortex.js
A nexus-integrated-13/cortex/ess-gap-engine.js
A nexus-integrated-13/cortex/flush-redundancy.js
A nexus-integrated-13/cortex/foundation/admin-server.js
A nexus-integrated-13/cortex/foundation/bus-log.js
A nexus-integrated-13/cortex/foundation/cobalt-core.js
A nexus-integrated-13/cortex/foundation/poll-registry.js
A nexus-integrated-13/cortex/foundation/store/FileRefs.js
A nexus-integrated-13/cortex/foundation/store/FileStore.js
A nexus-integrated-13/cortex/gap-loop.js
A nexus-integrated-13/cortex/gate/gap-finder.js
A nexus-integrated-13/cortex/healer/index.js
A nexus-integrated-13/cortex/heartbeat/index.js
A nexus-integrated-13/cortex/intelligence/index.js
A nexus-integrated-13/cortex/intelligence/macro-compiler.js
A nexus-integrated-13/cortex/interaction-contract.json
A nexus-integrated-13/cortex/lab/index.js
A nexus-integrated-13/cortex/liminal-space/index.js
A nexus-integrated-13/cortex/memory/agent-memory.js
A nexus-integrated-13/cortex/memory/data-poller.js
A nexus-integrated-13/cortex/memory/jaa-db.js
A nexus-integrated-13/cortex/memory/working-memory.js
A nexus-integrated-13/cortex/nas/router.js
A nexus-integrated-13/cortex/orion/policy.js
A nexus-integrated-13/cortex/orion/record.js
A nexus-integrated-13/cortex/orion/sensor.js
A nexus-integrated-13/cortex/orion/verify.js
A nexus-integrated-13/cortex/replay/index.js
A nexus-integrated-13/cortex/self-heal/escalation.js
A nexus-integrated-13/cortex/self-heal/index.js
A nexus-integrated-13/cortex/snapshot/divergence-watcher.js
A nexus-integrated-13/cortex/snapshot/index.js
A nexus-integrated-13/cortex/test/harness.js
A nexus-integrated-13/cortex/test/replay.test.js
A nexus-integrated-13/cortex/ui/index.html
A nexus-integrated-13/cortex/versionium/causality.js
A nexus-integrated-13/cortex/versionium/index.js
A nexus-integrated-13/cos/cli/commands/branch.js
A nexus-integrated-13/cos/cli/commands/compare.js
A nexus-integrated-13/cos/cli/commands/create.js
A nexus-integrated-13/cos/cli/commands/destroy.js
A nexus-integrated-13/cos/cli/commands/events.js
A nexus-integrated-13/cos/cli/commands/hooks.js
A nexus-integrated-13/cos/cli/commands/list.js
A nexus-integrated-13/cos/cli/commands/map.js
A nexus-integrated-13/cos/cli/commands/run.js
A nexus-integrated-13/cos/cli/commands/schema.js
A nexus-integrated-13/cos/cli/commands/start.js
A nexus-integrated-13/cos/cli/commands/status.js
A nexus-integrated-13/cos/cli/commands/stop.js
A nexus-integrated-13/cos/cli/index.js
A nexus-integrated-13/cos/compartment/process-runner.js
A nexus-integrated-13/cos/foundation/axioms.js
A nexus-integrated-13/cos/foundation/cli-detector.js
A nexus-integrated-13/cos/foundation/compiler-enum.js
A nexus-integrated-13/cos/foundation/constants.js
A nexus-integrated-13/cos/foundation/event-contracts.js
A nexus-integrated-13/cos/foundation/file-browser.js
A nexus-integrated-13/cos/foundation/fs-layer.js
A nexus-integrated-13/cos/foundation/hook-schema.js
A nexus-integrated-13/cos/foundation/runtime-enum.js
A nexus-integrated-13/cos/foundation/snapshot.js
A nexus-integrated-13/cos/foundation/types.js
A nexus-integrated-13/cos/host/event-bus.js
A nexus-integrated-13/cos/host/gates/compartment.js
A nexus-integrated-13/cos/host/gates/process.js
A nexus-integrated-13/cos/host/index.js
A nexus-integrated-13/cos/host/state-store.js
A nexus-integrated-13/cos/host/system-map.js
A nexus-integrated-13/cos/kernel.js
A nexus-integrated-13/cos/manager.js
A nexus-integrated-13/cos/package.json
A nexus-integrated-13/cos/playground/branch.js
A nexus-integrated-13/cos/playground/compare.js
A nexus-integrated-13/cos/playground/index.js
A nexus-integrated-13/cos/playground/sandbox.js
A nexus-integrated-13/cos/siso/Event.js
A nexus-integrated-13/cos/siso/Gate.js
A nexus-integrated-13/cos/siso/Stream.js
A nexus-integrated-13/cos/siso/StreamLog.js
A nexus-integrated-13/cos/siso/index.js
A nexus-integrated-13/cos/test.js
A nexus-integrated-13/docs/ARCHITECTURE.md
A nexus-integrated-13/docs/AXIOMS-v1.0.md
A nexus-integrated-13/docs/AXIOMS-v2.0.md
```

1217 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r3 — snap-0141 — 2026-06-20 08:15:46

- Archive: `nexus-0141_2026-06-20_v0.9.8-r3_updated.zip` (was `nexus-v0_9_8-updated.zip`)
- SHA-256: `bbb4bee3e4ea2a87af33419b336047ed478ffcf58fdd2f7ff874a1a5e47b4a44`, 16 MB, downloaded 2026-06-20 08:42:40
- Kind: full
- Commit: `096ecefd919f1d2e9379ec098efcbd26f2395407`, tag `snap-0141`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 686. Changes against the build before it: **0 added, 10 modified, 1367 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-v0_9_8 | 0 | 0 | 684 |
| nexus-integrated-13 | 0 | 0 | 683 |
| guardian | 0 | 5 | 0 |
| (root) | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |

```
M CHANGELOG.md
M bridge/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-orchestrator.js
M guardian/userscript-perplexity.js
M lib/sigma-writer.js
M lib/version.js
D nexus-integrated-13/MANIFEST.json
D nexus-integrated-13/PATCH-NOTES.md
D nexus-integrated-13/README.md
D nexus-integrated-13/START.md
D nexus-integrated-13/TUTORIAL.md
D nexus-integrated-13/architect/compile-route.js
D nexus-integrated-13/architect/docs/ARCHITECT-SPEC-v1.1.0.md
D nexus-integrated-13/architect/package.json
D nexus-integrated-13/architect/service.js
D nexus-integrated-13/architect/src/hooks/Registry.js
D nexus-integrated-13/architect/src/hooks/sync-from-component-registry.js
D nexus-integrated-13/architect/src/spec/Blueprint.js
D nexus-integrated-13/architect/src/ui/alk-lattice.html
D nexus-integrated-13/architect/src/ui/arch-builder.html
D nexus-integrated-13/architect/src/ui/architect_universe.svg
D nexus-integrated-13/architect/src/ui/layered-snr-gates-axioms.svg
D nexus-integrated-13/architect/src/ui/spec-builder.html
D nexus-integrated-13/auth/client.js
D nexus-integrated-13/auth/index.js
D nexus-integrated-13/auth/keys/nexus-private.pem
D nexus-integrated-13/auth/keys/nexus-public.pem
D nexus-integrated-13/auth/policy.json
D nexus-integrated-13/autopilot.js
D nexus-integrated-13/bridge/causal/graph.js
D nexus-integrated-13/bridge/causal/ledger.js
D nexus-integrated-13/bridge/causal/projections.js
D nexus-integrated-13/bridge/causal/schema.js
D nexus-integrated-13/bridge/causal/server.js
D nexus-integrated-13/bridge/identity.js
D nexus-integrated-13/bridge/index.js
D nexus-integrated-13/bridge/ledger.js
D nexus-integrated-13/bridge/registry.js
D nexus-integrated-13/bridge/router.js
D nexus-integrated-13/bridge/server.js
D nexus-integrated-13/bridge/types.js
D nexus-integrated-13/cli/boot-systems.js
D nexus-integrated-13/cli/cfr-debug.js
D nexus-integrated-13/cli/diagnose.js
D nexus-integrated-13/cli/nexus-cli.js
D nexus-integrated-13/cli/nexus-repl.js
D nexus-integrated-13/cli/nexus.js
D nexus-integrated-13/cli/run-supervised.js
D nexus-integrated-13/cli/session.js
D nexus-integrated-13/cockpit/cli.js
D nexus-integrated-13/cockpit/cockpit.spec
D nexus-integrated-13/cockpit/core.js
D nexus-integrated-13/cockpit/forge.js
D nexus-integrated-13/cockpit/pipeline.js
D nexus-integrated-13/contracts/SYSTEM-CONTRACTS.js
D nexus-integrated-13/contracts/nexus-interaction-contract.js
D nexus-integrated-13/cortex/agent-tools/index.js
D nexus-integrated-13/cortex/agents/chatgpt/index.js
D nexus-integrated-13/cortex/agents/claude/index.js
D nexus-integrated-13/cortex/agents/gemini/index.js
D nexus-integrated-13/cortex/agents/index.js
D nexus-integrated-13/cortex/automation/engine.js
D nexus-integrated-13/cortex/automation/queue-manager.js
D nexus-integrated-13/cortex/behavioral-boundary/index.js
D nexus-integrated-13/cortex/boot.js
D nexus-integrated-13/cortex/cobalt.manifest.json
D nexus-integrated-13/cortex/contract/index.js
D nexus-integrated-13/cortex/core/raid/index.js
D nexus-integrated-13/cortex/core/raid/intelligence-bridge.js
D nexus-integrated-13/cortex/core/raid/snr-filter.js
D nexus-integrated-13/cortex/cortex-v2.js
D nexus-integrated-13/cortex/cortex.js
D nexus-integrated-13/cortex/ess-gap-engine.js
D nexus-integrated-13/cortex/flush-redundancy.js
D nexus-integrated-13/cortex/foundation/admin-server.js
D nexus-integrated-13/cortex/foundation/bus-log.js
D nexus-integrated-13/cortex/foundation/cobalt-core.js
D nexus-integrated-13/cortex/foundation/poll-registry.js
D nexus-integrated-13/cortex/foundation/store/FileRefs.js
D nexus-integrated-13/cortex/foundation/store/FileStore.js
D nexus-integrated-13/cortex/gap-loop.js
D nexus-integrated-13/cortex/gate/gap-finder.js
D nexus-integrated-13/cortex/healer/index.js
D nexus-integrated-13/cortex/heartbeat/index.js
D nexus-integrated-13/cortex/intelligence/index.js
D nexus-integrated-13/cortex/intelligence/macro-compiler.js
D nexus-integrated-13/cortex/interaction-contract.json
D nexus-integrated-13/cortex/lab/index.js
D nexus-integrated-13/cortex/liminal-space/index.js
D nexus-integrated-13/cortex/memory/agent-memory.js
D nexus-integrated-13/cortex/memory/data-poller.js
D nexus-integrated-13/cortex/memory/jaa-db.js
D nexus-integrated-13/cortex/memory/working-memory.js
D nexus-integrated-13/cortex/nas/router.js
D nexus-integrated-13/cortex/orion/policy.js
D nexus-integrated-13/cortex/orion/record.js
D nexus-integrated-13/cortex/orion/sensor.js
D nexus-integrated-13/cortex/orion/verify.js
D nexus-integrated-13/cortex/replay/index.js
D nexus-integrated-13/cortex/self-heal/escalation.js
D nexus-integrated-13/cortex/self-heal/index.js
D nexus-integrated-13/cortex/snapshot/divergence-watcher.js
D nexus-integrated-13/cortex/snapshot/index.js
D nexus-integrated-13/cortex/test/harness.js
D nexus-integrated-13/cortex/test/replay.test.js
D nexus-integrated-13/cortex/ui/index.html
D nexus-integrated-13/cortex/versionium/causality.js
D nexus-integrated-13/cortex/versionium/index.js
D nexus-integrated-13/cos/cli/commands/branch.js
D nexus-integrated-13/cos/cli/commands/compare.js
D nexus-integrated-13/cos/cli/commands/create.js
D nexus-integrated-13/cos/cli/commands/destroy.js
D nexus-integrated-13/cos/cli/commands/events.js
D nexus-integrated-13/cos/cli/commands/hooks.js
D nexus-integrated-13/cos/cli/commands/list.js
D nexus-integrated-13/cos/cli/commands/map.js
D nexus-integrated-13/cos/cli/commands/run.js
D nexus-integrated-13/cos/cli/commands/schema.js
D nexus-integrated-13/cos/cli/commands/start.js
D nexus-integrated-13/cos/cli/commands/status.js
D nexus-integrated-13/cos/cli/commands/stop.js
D nexus-integrated-13/cos/cli/index.js
D nexus-integrated-13/cos/compartment/process-runner.js
D nexus-integrated-13/cos/foundation/axioms.js
D nexus-integrated-13/cos/foundation/cli-detector.js
D nexus-integrated-13/cos/foundation/compiler-enum.js
D nexus-integrated-13/cos/foundation/constants.js
D nexus-integrated-13/cos/foundation/event-contracts.js
D nexus-integrated-13/cos/foundation/file-browser.js
D nexus-integrated-13/cos/foundation/fs-layer.js
D nexus-integrated-13/cos/foundation/hook-schema.js
D nexus-integrated-13/cos/foundation/runtime-enum.js
D nexus-integrated-13/cos/foundation/snapshot.js
D nexus-integrated-13/cos/foundation/types.js
D nexus-integrated-13/cos/host/event-bus.js
D nexus-integrated-13/cos/host/gates/compartment.js
D nexus-integrated-13/cos/host/gates/process.js
D nexus-integrated-13/cos/host/index.js
D nexus-integrated-13/cos/host/state-store.js
D nexus-integrated-13/cos/host/system-map.js
D nexus-integrated-13/cos/kernel.js
D nexus-integrated-13/cos/manager.js
D nexus-integrated-13/cos/package.json
D nexus-integrated-13/cos/playground/branch.js
D nexus-integrated-13/cos/playground/compare.js
D nexus-integrated-13/cos/playground/index.js
D nexus-integrated-13/cos/playground/sandbox.js
```

1227 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r4 — snap-0142 — 2026-06-20 15:08:30

- Archive: `nexus-0142_2026-06-20_v0.9.8-r4_updated-1-copy.zip` (was `nexus-v0_9_8-updated-1 - Copy.zip`)
- SHA-256: `b029dd40d04795433e973ebf0052a6e5d34d3c2aeb0e1ef30dd997b46ed56ba3`, 16 MB, downloaded 2026-06-20 15:23:45
- Kind: full
- Commit: `de4b3a223bc13f7d010eb9bcad16282d471fcf71`, tag `snap-0142`
- Identical copy: `nexus-0142_2026-06-20_v0.9.8-r4_updated-1_dup1.zip` (was `nexus-v0_9_8-updated-1.zip`)
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 686. Changes against the build before it: **0 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M cortex/core/raid/index.js
M cortex/foundation/admin-server.js
M guardian/server.js
M lib/component-registry.js
M package.json
```

### Build 0.9.8-r5 — snap-0143 — 2026-06-20 18:33:10

- Archive: `nexus-0143_2026-06-20_v0.9.8-r5_updated-2.zip` (was `nexus-v0_9_8-updated-2.zip`)
- SHA-256: `c8c068e150f87c34390b004949982274474fb9c1f8ed402a7dc8973a3593240a`, 16 MB, downloaded 2026-06-20 18:44:33
- Kind: full
- Commit: `ebd2778e02d7c078d32043fae57f717ae7881aff`, tag `snap-0143`
- Identical copy: `nexus-0143_2026-06-20_v0.9.8-r5_updated-4-copy_dup1.zip` (was `nexus-v0_9_8-updated-4 - Copy.zip`)
- Identical copy: `nexus-0143_2026-06-20_v0.9.8-r5_updated-4_dup2.zip` (was `nexus-v0_9_8-updated-4.zip`)
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 691. Changes against the build before it: **5 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 2 | 7 | 0 |
| (root) | 0 | 3 | 0 |
| lib | 2 | 1 | 0 |
| cortex | 0 | 2 | 0 |
| tests | 1 | 0 | 0 |

```
M cortex/core/raid/index.js
M cortex/self-heal/index.js
M docs/blueprint.spec
A docs/cfr.spec
M docs/cli.spec
M docs/grammar-engine.spec
M docs/home-ui.spec
M docs/raid-snr-filter.spec
M docs/raid.spec
A docs/seam-component-registry.spec
M docs/spec-drift.spec
A lib/grammar-misfire-tracker.js
A lib/nexus-config.js
M lib/request-handler.js
M nexus-heal-loop.js
M orchestrator.config.json
M orchestrator.js
A tests/modules/grammar-misfire-tracker.test.js
```

### Build 0.9.8-r6 — snap-0144 — 2026-06-20 22:17:22

- Archive: `nexus-0144_2026-06-20_v0.9.8-r6_updated-5.zip` (was `nexus-v0_9_8-updated-5.zip`)
- SHA-256: `a3865973fd93ed6808eaa3d3501d3c0b407d5116cce95fd51ac2ce480e54a106`, 16 MB, downloaded 2026-06-20 22:20:34
- Kind: full
- Commit: `548015003a119e93e52ee2e7a2beacb90399d9de`, tag `snap-0144`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 695. Changes against the build before it: **4 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 2 | 2 | 0 |
| cli | 1 | 2 | 0 |
| docs | 0 | 3 | 0 |
| lib | 1 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cli/nexus-cli.js
A cli/nexus-repl-descriptors.js
M cli/nexus-repl.js
M docs/cli.spec
M docs/grammar-engine.spec
M docs/home-ui.spec
M lib/component-registry.js
M lib/grammar-engine.js
A lib/quick-notes.js
M orchestrator.js
A tests/modules/nexus-repl-descriptors.test.js
A tests/modules/quick-notes.test.js
M tests/modules/test-component-registry.js
M tests/modules/test-grammar-engine.js
M ui/agents/chatgpt/index.html
```

### Build 0.9.8-r7 — snap-0145 — 2026-06-20 22:52:10

- Archive: `nexus-0145_2026-06-20_v0.9.8-r7_updated-6.zip` (was `nexus-v0_9_8-updated-6.zip`)
- SHA-256: `99a1fb29d4ba2ea4a16e7944b38b24bea035629a4de24bd8e4f49e07133cc41b`, 16 MB, downloaded 2026-06-20 22:53:09
- Kind: full
- Commit: `21d222ee9fdb35e7c5f0b7084a9cdb1934272845`, tag `snap-0145`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 700. Changes against the build before it: **5 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |
| cli | 0 | 2 | 0 |
| docs | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| ui | 0 | 2 | 0 |
| data | 1 | 0 | 0 |
| lib | 1 | 0 | 0 |
| scripts | 1 | 0 | 0 |

```
M CHANGELOG.md
M cli/nexus-repl-descriptors.js
M cli/nexus-repl.js
A data/changelog-snapshot.json
M docs/cli.spec
A docs/nexus-roadmap-combined.html
A lib/changelog.js
M orchestrator.js
A scripts/import-spec.js
A tests/modules/changelog.test.js
M tests/modules/nexus-repl-descriptors.test.js
M ui/agents/chatgpt/index.html
M ui/home/index.html
```

### Build 0.9.8-r8 — snap-0146 — 2026-06-20 23:38:08

- Archive: `nexus-0146_2026-06-20_v0.9.8-r8_vnamed-0.9.8-updated-1_declared-0.9.9.zip` (was `nexus-v0_9_8-updated (1).zip`)
- SHA-256: `6318791a81e4ff13a01ccb3bcb5eea947fac3e796af0359abfd58ce84af61787`, 16.1 MB, downloaded 2026-06-20 23:43:12
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.9, file name 0.9.8); filed under 0.9.8 to keep the line in order
- Commit: `551ce4eddb77c2d68a9fdfc1264f7a56bb868029`, tag `snap-0146`
- Identical copy: `nexus-0146_2026-06-20_v0.9.8-r8_vnamed-0.9.8-updated-2_dup1_declared-0.9.9.zip` (was `nexus-v0_9_8-updated (2).zip`)
- Identical copy: `nexus-0146_2026-06-20_v0.9.8-r8_vnamed-0.9.8-updated-3_dup2_declared-0.9.9.zip` (was `nexus-v0_9_8-updated (3).zip`)
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 703. Changes against the build before it: **3 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 2 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M idearium/api/index.js
M idearium/repo/watcher.js
A lib/spec-container.js
M lib/version.js
M package-lock.json
M package.json
M scripts/import-spec.js
A tests/modules/idearium-repo-watcher.test.mjs
M tests/modules/run-all.js
A tests/modules/spec-container.test.js
```

### Build 0.9.8-r9 — snap-0147 — 2026-06-21 02:32:00

- Archive: `nexus-0147_2026-06-21_v0.9.8-r9_updated-7.zip` (was `nexus-v0_9_8-updated-7.zip`)
- SHA-256: `73776d0bc972da6faa4e33c82744cd207cbbd3f0a8e713b3f092b54a49b66d19`, 16 MB, downloaded 2026-06-21 02:38:00
- Kind: full
- Commit: `e85b089331ba0b50bd74b8808f2849de14765ad8`, tag `snap-0147`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 707. Changes against the build before it: **5 added, 22 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 2 | 4 | 0 |
| (root) | 0 | 4 | 0 |
| docs | 1 | 3 | 0 |
| tests | 2 | 2 | 0 |
| cli | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| data | 0 | 2 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| scripts | 0 | 0 | 1 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
M cli/nexus-repl-descriptors.js
M cli/nexus-repl.js
M cortex/contract/index.js
M cortex/core/raid/index.js
M data/changelog-snapshot.json
M data/guardian/ledger/boot/events.ndjson
M docs/cli.spec
A docs/copilot.spec
M docs/raid.spec
M docs/roadmap/NEXUS-ROADMAP.md
A guardian/agents/co-pilot/index.js
A guardian/memory_store/event_log.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/ledger.json
M guardian/memory_store/settings.json
M guardian/server.js
M idearium/api/index.js
M lib/version.js
M orchestrator.js
M package-lock.json
M package.json
D scripts/import-spec.js
A tests/modules/copilot.test.js
M tests/modules/nexus-repl-descriptors.test.js
A tests/modules/raid-approve-tool.test.js
M tests/modules/run-all.js
M ui/agents/chatgpt/index.html
```

### Build 0.9.8-r10 — snap-0148 — 2026-06-21 03:22:54

- Archive: `nexus-0148_2026-06-21_v0.9.8-r10_updated-8.zip` (was `nexus-v0_9_8-updated-8.zip`)
- SHA-256: `0d3d5a2ffe5f5d926e8dde481391ccfd503b520d07b0d1578fe97153a6f47edc`, 16.1 MB, downloaded 2026-06-21 03:24:53
- Kind: full
- Commit: `490e0d6b14893ff5fcd37ec149966d3d7dfde738`, tag `snap-0148`
- Identical copy: `nexus-0148_2026-06-21_v0.9.8-r10_updated-10_dup1.zip` (was `nexus-v0_9_8-updated-10.zip`)
- Identical copy: `nexus-0148_2026-06-21_v0.9.8-r10_updated-9_dup2.zip` (was `nexus-v0_9_8-updated-9.zip`)
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 710. Changes against the build before it: **3 added, 21 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 7 | 0 |
| data | 2 | 2 | 0 |
| (root) | 0 | 3 | 0 |
| cortex | 0 | 3 | 0 |
| lib | 0 | 3 | 0 |
| docs | 1 | 1 | 0 |
| ui | 0 | 2 | 0 |

```
M CHANGELOG.md
M cortex/contract/index.js
M cortex/core/raid/index.js
M cortex/core/raid/snr-filter.js
M data/changelog-snapshot.json
A data/guardian/input/51d3f06d-3ac9-4025-8df4-ddbf6b89f9bd.pending.spec
M data/guardian/ledger/boot/events.ndjson
A data/guardian/queue/51d3f06d-3ac9-4025-8df4-ddbf6b89f9bd.json
M docs/nexus-roadmap-combined.html
A docs/seam-queue.spec
M guardian/cli.js
M guardian/memory_store/event_log.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/queue_compartments.json
M guardian/memory_store/seam_sessions.json
M guardian/memory_store/settings.json
M guardian/server.js
M lib/grammar-engine.js
M lib/spec-drift.js
M lib/version.js
M nexus-roadmap-combined.html
M orchestrator.js
M ui/agents/chatgpt/index.html
M ui/home/index.html
```

### Build 0.9.8-r11 — snap-0149 — 2026-06-21 17:48:34

- Archive: `nexus-0149_2026-06-21_v0.9.8-r11_wired.zip` (was `nexus-v0_9_8-wired.zip`)
- SHA-256: `31951fb19c51d9ff06ce7a5c77538cbd9f2cb24002f5eb1a0898210cd6628438`, 74.3 MB, downloaded 2026-06-21 17:55:02
- Kind: full
- Commit: `f5091b1b9c693e8ae54281c4490877e4cbb20a27`, tag `snap-0149`
- Files in archive: 762. Changes against the build before it: **58 added, 74 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 50 | 25 | 4 |
| cortex | 2 | 26 | 0 |
| guardian | 1 | 18 | 0 |
| (root) | 3 | 1 | 0 |
| lib | 1 | 1 | 0 |
| ui | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| cli | 1 | 0 | 0 |

```
M architect/data/event_log.jsonl
A cli/co-pilot.js
M cortex/agent-tools/index.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/active_traces.jsonl
M cortex/data/agent_calls.jsonl
M cortex/data/agent_messages.jsonl
M cortex/data/artifacts.jsonl
M cortex/data/backup_records.jsonl
A cortex/data/baseline-events.ndjson
M cortex/data/bep_patterns.jsonl
M cortex/data/cortex_memory.jsonl
M cortex/data/decay_log.jsonl
M cortex/data/escalation_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/event_stats.json
M cortex/data/fault_taxonomy.jsonl
M cortex/data/fix_map.jsonl
M cortex/data/gaps.jsonl
A cortex/data/memory_index.jsonl
M cortex/data/orion_sessions.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
M cortex/data/reuse_index.jsonl
M cortex/data/sigma_records.jsonl
M cortex/data/working_memory.jsonl
M cortex/foundation/admin-server.js
M cortex/intelligence/index.js
M cortex/liminal-space/index.js
M data/.poller-cursors.json
M data/architect/baseline-events.ndjson
M data/architect/event_log.jsonl
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/bridge/ledger/cfr/event_log.jsonl
M data/bridge/ledger/requests.jsonl
A data/chat-logs/2026-06-21T21-44-01-238cf46d.jsonl
M data/cobalt/ledger.truth.jsonl
A data/cortex/ledger/raid-weights.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/remediation.jsonl
M data/emerge/baseline-events.ndjson
M data/gap-ledger/gaps.jsonl
M data/guardian/baseline-events.ndjson
A data/guardian/conversations/00696f69-b079-4293-b330-bf7b352ce153/conversation.jsonl
A data/guardian/conversations/2494173a-cdc7-4116-baaf-c9cb46c87d63/conversation.jsonl
A data/guardian/conversations/33e56c57-9cce-42c9-8487-cb1f62db105c/conversation.jsonl
A data/guardian/conversations/34f9cf1d-502e-4344-b430-abf7829e949c/conversation.jsonl
A data/guardian/conversations/46d7b66b-fbdb-42d1-a9a7-9f0e69aca2ed/conversation.jsonl
A data/guardian/conversations/5280ca59-498d-4754-9196-8e0bdc7caaf2/conversation.jsonl
A data/guardian/conversations/579e9f58-981a-448b-b12b-a9f09e5b55e8/conversation.jsonl
A data/guardian/conversations/6348b265-9aa0-4e83-8de6-e19261989b10/conversation.jsonl
A data/guardian/conversations/6d1bd256-7a0f-4039-87b8-79421fc68c0d/conversation.jsonl
A data/guardian/conversations/a0d9f398-d308-4bd1-816a-e63526af882e/conversation.jsonl
A data/guardian/conversations/aa045540-c62b-485d-baee-21356e9bbb67/conversation.jsonl
A data/guardian/conversations/c6de2765-5800-43c6-9e54-9c0f968773b6/conversation.jsonl
A data/guardian/conversations/d32e700a-ec20-4e52-bf88-5ab46e43f95a/conversation.jsonl
A data/guardian/conversations/db1f2576-6ec3-4402-a4b4-74efc8afa02c/conversation.jsonl
A data/guardian/input/05b25fc0-0498-4887-9cca-636264b4a522.done.spec
A data/guardian/input/51d3f06d-3ac9-4025-8df4-ddbf6b89f9bd.done.spec
D data/guardian/input/51d3f06d-3ac9-4025-8df4-ddbf6b89f9bd.pending.spec
A data/guardian/input/83036522-0d5c-4cf4-a424-2918e58fbb3d.done.spec
A data/guardian/input/e119b236-85fb-412a-a91d-123bb7a39410.done.spec
M data/guardian/invariant/baseline.json
M data/guardian/ledger/baseline-events.ndjson
A data/guardian/ledger/baseline.json
M data/guardian/ledger/boot/events.ndjson
A data/guardian/queue/05b25fc0-0498-4887-9cca-636264b4a522.json
A data/guardian/queue/83036522-0d5c-4cf4-a424-2918e58fbb3d.json
A data/guardian/queue/e119b236-85fb-412a-a91d-123bb7a39410.json
M data/idearium/baseline-events.ndjson
M data/ledger/cfr_state.json
M data/ledger/event_log.jsonl
M data/ledger/event_stats.json
M data/ledger/orchestrator.jsonl
M data/orchestrator/baseline-events.ndjson
A data/output/2026-06-21/00696f69/ollama-1782078265957-1.txt
A data/output/2026-06-21/00696f69/ollama-1782078265960-1.txt
A data/output/2026-06-21/2494173a/ollama-1782078243955-1.plaintext
A data/output/2026-06-21/2494173a/ollama-1782078243993-1.plaintext
A data/output/2026-06-21/33e56c57/ollama-1782078243317-1.json
A data/output/2026-06-21/33e56c57/ollama-1782078243321-1.json
A data/output/2026-06-21/34f9cf1d/ollama-1782078266505-1.txt
A data/output/2026-06-21/34f9cf1d/ollama-1782078266508-1.txt
A data/output/2026-06-21/46d7b66b/ollama-1782078241394-1.emerge
A data/output/2026-06-21/46d7b66b/ollama-1782078241444-1.emerge
A data/output/2026-06-21/5280ca59/ollama-1782078268246-1.plaintext
A data/output/2026-06-21/5280ca59/ollama-1782078268249-1.plaintext
A data/output/2026-06-21/579e9f58/ollama-1782078264832-1.json
A data/output/2026-06-21/579e9f58/ollama-1782078264836-1.json
A data/output/2026-06-21/6348b265/ollama-1782078267121-1.txt
A data/output/2026-06-21/6348b265/ollama-1782078267123-1.txt
A data/output/2026-06-21/6d1bd256/ollama-1782078262578-1.txt
A data/output/2026-06-21/6d1bd256/ollama-1782078262585-1.txt
A data/output/2026-06-21/a0d9f398/ollama-1782078268832-1.emerge
A data/output/2026-06-21/a0d9f398/ollama-1782078268835-1.emerge
A data/output/2026-06-21/aa045540/ollama-1782078267684-1.txt
A data/output/2026-06-21/aa045540/ollama-1782078267687-1.txt
A data/output/2026-06-21/c6de2765/ollama-1782078265399-1.plaintext
A data/output/2026-06-21/c6de2765/ollama-1782078265403-1.plaintext
A data/output/2026-06-21/d32e700a/ollama-1782078263223-1.txt
A data/output/2026-06-21/d32e700a/ollama-1782078263226-1.txt
D data/snapshots/nex-6ddeb964.nex
D data/snapshots/nex-733cd9f2.nex
D data/snapshots/nex-c9cab976.nex
M guardian/cli.js
M guardian/lib/detector.js
M guardian/lib/gap-hunter.js
A guardian/lib/seam-mode-reducer.js
M guardian/lib/seam-queue.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/ledger.json
M guardian/memory_store/queue_compartments.json
M guardian/memory_store/seam_sessions.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
A lib/meta/confidence.js
M lib/meta/liminal/index.js
A nexus-v0_9_8 - 1.zip.tmp
A nexus-v0_9_8.zip
A nexus.zip
M orchestrator.js
M ui/agents/chatgpt/index.html
M ui/home/index.html
```

### Build 0.9.8-r12 — snap-0150 — 2026-06-21 17:48:56

- Archive: `nexus-0150_2026-06-21_v0.9.8-r12_confidence-fix-1.zip` (was `nexus-confidence-fix (1).zip`)
- SHA-256: `e6fe7f351c05dfa6c52a0b150f876076ab31382101df7964fb622c73f8f38780`, 0.1 MB, downloaded 2026-06-21 17:50:44
- Kind: overlay (a patch laid over the build before it)
- Commit: `1a9db9fe0858a55b0d0eba901e850572744b4672`, tag `snap-0150`
- Files in archive: 9. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |

```
A PATCH-confidence-fix.diff
```

### empty — 0151 — 2026-06-21 19:54:19

- Archive: `nexus-0151_2026-06-21_v0.9.8_wired-3_empty.zip` (was `nexus-v0_9_8-wired (3).zip`)
- SHA-256: `7da708cacfedf87dbbd2a8fcac7b035505caf17b63cc82611df9f275ed00c542`, 0 MB, downloaded 2026-06-21 19:54:19
- Kind: empty (no commit)

### Build 0.9.8-r13 — snap-0152 — 2026-06-22 01:19:36

- Archive: `nexus-0152_2026-06-22_v0.9.8-r13_remove-openai-key-1.zip` (was `nexus-v0_9_8-remove-openai-key (1).zip`)
- SHA-256: `73d137ebed70b8f698dd70fc2ff49cf71a6cfef20dad55e1b447e6c6ce8de917`, 0.1 MB, downloaded 2026-06-22 01:51:43
- Kind: overlay (a patch laid over the build before it)
- Commit: `469c85ca0035958e1cb53e7d7e26102181d9fb2e`, tag `snap-0152`
- Files in archive: 5. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| docs | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
A MANIFEST.md
M docs/copilot.spec
M guardian/agents/co-pilot/index.js
M guardian/server.js
M tests/modules/copilot.test.js
```

### Build 0.9.8-r14 — snap-0153 — 2026-06-23 16:49:42

- Archive: `nexus-0153_2026-06-23_v0.9.8-r14_gap-lifecycle-phase23.7.zip` (was `nexus-gap-lifecycle-phase23.7.zip`)
- SHA-256: `05b534510c5f9ae829f1b516e7682e5b809f45c48b02d5c9f7ba1b91bf8519dd`, 0.1 MB, downloaded 2026-06-23 22:21:19
- Kind: overlay (a patch laid over the build before it)
- Commit: `3e6f8f0b08ce5004bf4f482707f01fe97168568b`, tag `snap-0153`
- Files in archive: 9. Changes against the build before it: **3 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 3 | 0 |
| (root) | 2 | 0 | 0 |
| lib | 1 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A DEPLOY.md
M cortex/core/raid/index.js
M cortex/gap-loop.js
M cortex/memory/jaa-db.js
A gap-lifecycle.spec
M guardian/server.js
A lib/gap-predicate.js
M lib/open-loop-taxonomy.js
M service/nexus-diagnostic.js
```

### Build 0.9.8-r15 — snap-0154 — 2026-06-23 18:06:36

- Archive: `nexus-0154_2026-06-23_v0.9.8-r15_integrated-1.zip` (was `nexus-v0_9_8-integrated-1.zip`)
- SHA-256: `4cf5a7defe27e7b55808706f6722057a94094fe5fd4e20ce013f3ace4af02155`, 57.1 MB, downloaded 2026-06-23 19:58:21
- Kind: full
- Commit: `a3338155f1955efee6ca6cffd2424bd5e924e21e`, tag `snap-0154`
- Files in archive: 589. Changes against the build before it: **2 added, 21 modified, 180 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 106 |
| cortex | 0 | 2 | 69 |
| guardian | 0 | 12 | 0 |
| (root) | 0 | 2 | 5 |
| docs | 1 | 1 | 0 |
| lib | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 1 | 0 | 0 |

```
D DEPLOY.md
D MANIFEST.md
M PATCH-NOTES.md
D PATCH-confidence-fix.diff
M cortex/foundation/admin-server.js
M cortex/intelligence/index.js
M docs/copilot.spec
A docs/gap-lifecycle.spec
D gap-lifecycle.spec
M guardian/agents/co-pilot/index.js
M guardian/lib/gap-hunter.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M guardian/userscript-chatgpt.js
M lib/meta/liminal/index.js
M lib/reflection.js
D nexus-v0_9_8 - 1.zip.tmp
M orchestrator.js
M tests/modules/copilot.test.js
A ui/agents/mistral/index.html
```

177 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r16 — snap-0155 — 2026-06-23 22:43:00

- Archive: `nexus-0155_2026-06-23_v0.9.8-r16_vnamed-0.9.9.zip` (was `nexus-v0_9_9.zip`)
- SHA-256: `7dfefccc7acfbc2dba2865b499fd561cb22edf089387caedc2f2e2a7bcc65a5c`, 57.2 MB, downloaded 2026-06-23 22:44:27
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `7d53ba657701d327d796cb4486eec79b789017b8`, tag `snap-0155`
- Files in archive: 594. Changes against the build before it: **5 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 4 | 0 |
| docs | 4 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
M MANIFEST.json
M PATCH-NOTES.md
A docs/AXIOMS-PHASE-MAP.md
A docs/SESSION-2026-06-24.md
A docs/SYSTEM-MAP.md
A docs/WIRES.md
M docs/copilot.spec
M guardian/agents/co-pilot/index.js
A nexus-v0_9_8 - 1.zip.tmp
M package.json
M ui/home/index.html
```

### Build 0.9.8-r17 — snap-0156 — 2026-06-23 22:46:48

- Archive: `nexus-0156_2026-06-23_v0.9.8-r17_vnamed-0.9.9-1.zip` (was `nexus-v0_9_9-1.zip`)
- SHA-256: `41aa942c0e15b77590b719066e83b6a3ebd9a37ee0e2cd292058c73e34a4f776`, 57.2 MB, downloaded 2026-06-23 22:47:18
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `6cc632d92440acbcc152553343bc6dc4db96f1d9`, tag `snap-0156`
- Files in archive: 594. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M guardian/agents/co-pilot/index.js
M orchestrator.js
```

### Build 0.9.8-r18 — snap-0157 — 2026-06-24 00:54:14

- Archive: `nexus-0157_2026-06-24_v0.9.8-r18_1_declared-1.0.0.zip` (was `nexus-v1.0.0 (1).zip`)
- SHA-256: `ed96f2de3d7a924bb2a1e80845c16121f9f683016d288b2f7f65af35f3d08468`, 39.6 MB, downloaded 2026-06-24 00:57:59
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name 1.0.0); filed under 0.9.8 to keep the line in order
- Commit: `2f362120d80c2aa95e2281e2fb5af270e656e960`, tag `snap-0157`
- Identical copy: `nexus-0157_2026-06-24_v0.9.8-r18_2_dup1_declared-1.0.0.zip` (was `nexus-v1.0.0 (2).zip`)
- Files in archive: 706. Changes against the build before it: **123 added, 36 modified, 11 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 113 | 0 | 0 |
| guardian | 0 | 12 | 1 |
| cortex | 7 | 5 | 0 |
| docs | 1 | 3 | 5 |
| lib | 1 | 5 | 2 |
| (root) | 0 | 5 | 2 |
| tests | 1 | 2 | 0 |
| ui | 0 | 1 | 1 |
| architect | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M CHANGELOG.md
M MANIFEST.json
M cli/nexus-repl.js
M cortex/core/raid/index.js
M cortex/foundation/admin-server.js
M cortex/gap-loop.js
M cortex/liminal-space/index.js
M cortex/memory/jaa-db.js
D docs/AXIOMS-PHASE-MAP.md
D docs/SESSION-2026-06-24.md
D docs/SYSTEM-MAP.md
D docs/WIRES.md
M docs/copilot.spec
D docs/gap-lifecycle.spec
M docs/nexus-roadmap-combined.html
M docs/phase-map.spec
A docs/raid-integration.spec
M guardian/agents/co-pilot/index.js
M guardian/lib/gap-hunter.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
A lib/component-descriptor.js
D lib/gap-predicate.js
D lib/meta/confidence.js
M lib/meta/liminal/index.js
M lib/open-loop-taxonomy.js
M lib/reflection.js
M lib/request-handler.js
M lib/version.js
M nexus-heal-loop.js
D nexus-v0_9_8 - 1.zip.tmp
D nexus-v0_9_8.zip
M orchestrator.js
M package.json
M service/nexus-diagnostic.js
M tests/modules/admin-server-routes.test.js
A tests/modules/component-descriptor.test.js
M tests/modules/run-all.js
D ui/agents/mistral/index.html
M ui/home/index.html
```

122 more (mostly data, logs and archived files) are in the ledger file.

### empty — 0158 — 2026-06-24 01:10:27

- Archive: `nexus-0158_2026-06-24_v0.9.8_declared-1.0.0_empty.zip` (was `nexus-v1.0.0.zip`)
- SHA-256: `5926296458c176a2afbee413c68241d0cc94f8bd98c56d35e6a77a66d85da156`, 0 MB, downloaded 2026-06-24 01:10:27
- Kind: empty (no commit)
- Claimed version: 1.0.0 (registry none, file name 1.0.0); filed under 0.9.8 to keep the line in order

### Build 0.9.8-r19 — snap-0159 — 2026-06-24 04:32:06

- Archive: `nexus-0159_2026-06-24_v0.9.8-r19_declared-1.2.0.zip` (was `nexus-v1.2.0.zip`)
- SHA-256: `345dd32ca87e7643e5a622f7ca53302195e2479b520a8ae96a19c4f469b643a7`, 40.1 MB, downloaded 2026-06-24 04:35:02
- Kind: full
- Claimed version: 1.2.0 (registry 1.2.0, file name 1.2.0); filed under 0.9.8 to keep the line in order
- Commit: `9e8b7627e210db8bc49680d0c273b488351e8a7a`, tag `snap-0159`
- Identical copy: `nexus-0159_2026-06-24_v0.9.8-r19_1_dup1_declared-1.2.0.zip` (was `nexus-v1.2.0 (1).zip`)
- Files in archive: 845. Changes against the build before it: **139 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 137 | 0 | 0 |
| idearium | 0 | 4 | 0 |
| lib | 1 | 2 | 0 |
| tests | 1 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
A data/idearium/specs/bg_1782300724957_hirh8y/build-group.json
A data/idearium/specs/bg_1782300724973_i1cd69/build-group.json
A data/idearium/specs/bg_1782300724979_bhwfq8/build-group.json
A data/idearium/specs/bg_1782300724983_iyspnu/build-group.json
A data/idearium/specs/bg_1782300724987_o9acuv/build-group.json
A data/idearium/specs/bg_1782300724992_0w35gn-expanded/build-group.json
A data/idearium/specs/bg_1782300724992_0w35gn-expanded/manual-note.txt
A data/idearium/specs/bg_1782300724992_0w35gn.zip
A data/idearium/specs/bg_1782300724992_0w35gn/build-group.json
A data/idearium/specs/bg_1782300724992_0w35gn/manual-note.txt
A data/idearium/specs/bg_1782300725002_lszvmd/build-group.json
A data/idearium/specs/bg_1782300725005_lao411/build-group.json
A data/snapshots/nex-00da84e9.nex
A data/snapshots/nex-01203b6b.nex
A data/snapshots/nex-09bc5ea1.nex
A data/snapshots/nex-0c3f1360.nex
A data/snapshots/nex-0dba05b8.nex
A data/snapshots/nex-10ec3d46.nex
A data/snapshots/nex-119ad4b5.nex
A data/snapshots/nex-127cffb5.nex
A data/snapshots/nex-13459302.nex
A data/snapshots/nex-15f039a4.nex
A data/snapshots/nex-17f2e2be.nex
A data/snapshots/nex-1ada038b.nex
A data/snapshots/nex-1eaadb6a.nex
A data/snapshots/nex-1f97c6b4.nex
A data/snapshots/nex-20dd051a.nex
A data/snapshots/nex-2299f8ed.nex
A data/snapshots/nex-2a2c6e25.nex
A data/snapshots/nex-2d727039.nex
A data/snapshots/nex-2efa78e4.nex
A data/snapshots/nex-30a5f0e2.nex
A data/snapshots/nex-319ffe19.nex
A data/snapshots/nex-324f1ac7.nex
A data/snapshots/nex-32bdb3c9.nex
A data/snapshots/nex-3410a140.nex
A data/snapshots/nex-341e6a36.nex
A data/snapshots/nex-3437966e.nex
A data/snapshots/nex-34a7d36c.nex
A data/snapshots/nex-350b21cb.nex
A data/snapshots/nex-35853485.nex
A data/snapshots/nex-37e03a50.nex
A data/snapshots/nex-37e981c7.nex
A data/snapshots/nex-388b479b.nex
A data/snapshots/nex-3a028c77.nex
A data/snapshots/nex-3a752fd5.nex
A data/snapshots/nex-3b957b60.nex
A data/snapshots/nex-430ce259.nex
A data/snapshots/nex-449c01ad.nex
A data/snapshots/nex-455e2af8.nex
A data/snapshots/nex-4609f0bc.nex
A data/snapshots/nex-46b3ddc2.nex
A data/snapshots/nex-4e422bc1.nex
A data/snapshots/nex-4f4e204a.nex
A data/snapshots/nex-5070725b.nex
A data/snapshots/nex-52aef094.nex
A data/snapshots/nex-5392bc11.nex
A data/snapshots/nex-56b5f1c8.nex
A data/snapshots/nex-5709ddd5.nex
A data/snapshots/nex-57dae84d.nex
A data/snapshots/nex-59f4cf8b.nex
A data/snapshots/nex-5b5aa49d.nex
A data/snapshots/nex-5fbff023.nex
A data/snapshots/nex-62e99ad3.nex
A data/snapshots/nex-6468a707.nex
A data/snapshots/nex-68223c00.nex
A data/snapshots/nex-69d2d3e7.nex
A data/snapshots/nex-6a17fd47.nex
A data/snapshots/nex-6e01768f.nex
A data/snapshots/nex-7299c005.nex
A data/snapshots/nex-73759fb1.nex
A data/snapshots/nex-73fec895.nex
A data/snapshots/nex-775ad3a7.nex
A data/snapshots/nex-78552a38.nex
A data/snapshots/nex-78ab4bda.nex
A data/snapshots/nex-7acf9280.nex
A data/snapshots/nex-7c16c602.nex
A data/snapshots/nex-7c653983.nex
A data/snapshots/nex-7e4dd17b.nex
A data/snapshots/nex-80d4aa94.nex
A data/snapshots/nex-83796f81.nex
A data/snapshots/nex-89064bbf.nex
A data/snapshots/nex-8a8f67f3.nex
A data/snapshots/nex-8d7ef7a7.nex
A data/snapshots/nex-8dbd4b8b.nex
A data/snapshots/nex-96987afa.nex
A data/snapshots/nex-9771abb6.nex
A data/snapshots/nex-9951df10.nex
A data/snapshots/nex-9badeac8.nex
A data/snapshots/nex-a1b2ed54.nex
A data/snapshots/nex-a4a96001.nex
A data/snapshots/nex-a621c780.nex
A data/snapshots/nex-a6ce790d.nex
A data/snapshots/nex-ab765f1d.nex
A data/snapshots/nex-abe98a8b.nex
A data/snapshots/nex-ace9dd19.nex
A data/snapshots/nex-ad5fed67.nex
A data/snapshots/nex-ae3bd314.nex
A data/snapshots/nex-aef6e939.nex
A data/snapshots/nex-afcb93d8.nex
A data/snapshots/nex-b2ebb014.nex
A data/snapshots/nex-b3a3373a.nex
A data/snapshots/nex-b6789ddb.nex
A data/snapshots/nex-b91edae2.nex
A data/snapshots/nex-ba3c1eb3.nex
A data/snapshots/nex-bbe86c0a.nex
A data/snapshots/nex-bc57ad1f.nex
A data/snapshots/nex-be8f975f.nex
A data/snapshots/nex-bee895f9.nex
A data/snapshots/nex-bf359f8f.nex
A data/snapshots/nex-c3f02966.nex
A data/snapshots/nex-c80d231d.nex
A data/snapshots/nex-c8e9b164.nex
A data/snapshots/nex-ccd84b32.nex
A data/snapshots/nex-ce815406.nex
A data/snapshots/nex-d1db12b8.nex
A data/snapshots/nex-d8a3abef.nex
A data/snapshots/nex-d8f5d4f9.nex
A data/snapshots/nex-d9693785.nex
A data/snapshots/nex-d98fce6b.nex
A data/snapshots/nex-db295aa3.nex
A data/snapshots/nex-df6ab82a.nex
A data/snapshots/nex-e3145957.nex
A data/snapshots/nex-e891d6a4.nex
A data/snapshots/nex-e8bca529.nex
A data/snapshots/nex-e9c8fe1e.nex
A data/snapshots/nex-ec8b65f7.nex
A data/snapshots/nex-ed56a4aa.nex
A data/snapshots/nex-ed651b5c.nex
A data/snapshots/nex-eed3232d.nex
A data/snapshots/nex-ef2c3152.nex
A data/snapshots/nex-f13e06b2.nex
A data/snapshots/nex-f23b5ab1.nex
A data/snapshots/nex-f4edddc2.nex
A data/snapshots/nex-f6cfdc5c.nex
A data/snapshots/nex-f98ce232.nex
A data/snapshots/nex-fedaeedb.nex
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/schemas/interaction-contract.json
M idearium/ui/index.html
M lib/component-descriptor.js
A lib/spec-build-group.js
M lib/version.js
M package.json
M tests/modules/component-descriptor.test.js
M tests/modules/run-all.js
A tests/modules/spec-build-group.test.js
M ui/idearium/index.html
```

### Build 0.9.8-r20 — snap-0160 — 2026-06-24 05:02:58

- Archive: `nexus-0160_2026-06-24_v0.9.8-r20_declared-1.4.0.zip` (was `nexus-v1.4.0.zip`)
- SHA-256: `071c47337f5a8ff4e4a06408dcdbf9059c33d480761ea9109495046869d62e9b`, 40.4 MB, downloaded 2026-06-24 05:11:25
- Kind: full
- Claimed version: 1.4.0 (registry 1.4.0, file name 1.4.0); filed under 0.9.8 to keep the line in order
- Commit: `0b300f5bddfc2f1978c103e8212433c21ed7bc62`, tag `snap-0160`
- Files in archive: 937. Changes against the build before it: **104 added, 14 modified, 12 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 102 | 0 | 12 |
| idearium | 0 | 5 | 0 |
| lib | 1 | 3 | 0 |
| tests | 1 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
D data/idearium/specs/bg_1782300724957_hirh8y/build-group.json
D data/idearium/specs/bg_1782300724973_i1cd69/build-group.json
D data/idearium/specs/bg_1782300724979_bhwfq8/build-group.json
D data/idearium/specs/bg_1782300724983_iyspnu/build-group.json
D data/idearium/specs/bg_1782300724987_o9acuv/build-group.json
D data/idearium/specs/bg_1782300724992_0w35gn-expanded/build-group.json
D data/idearium/specs/bg_1782300724992_0w35gn-expanded/manual-note.txt
D data/idearium/specs/bg_1782300724992_0w35gn.zip
D data/idearium/specs/bg_1782300724992_0w35gn/build-group.json
D data/idearium/specs/bg_1782300724992_0w35gn/manual-note.txt
D data/idearium/specs/bg_1782300725002_lszvmd/build-group.json
D data/idearium/specs/bg_1782300725005_lao411/build-group.json
A data/idearium/specs/bg_1782302578532_dzx5x1/build-group.json
A data/idearium/specs/bg_1782302578547_0j5gqk/build-group.json
A data/idearium/specs/bg_1782302578552_ygx1mv/build-group.json
A data/idearium/specs/bg_1782302578554_08fhsy/build-group.json
A data/idearium/specs/bg_1782302578559_7werq9/build-group.json
A data/idearium/specs/bg_1782302578563_q1p1n1-expanded/build-group.json
A data/idearium/specs/bg_1782302578563_q1p1n1-expanded/manual-note.txt
A data/idearium/specs/bg_1782302578563_q1p1n1.zip
A data/idearium/specs/bg_1782302578563_q1p1n1/build-group.json
A data/idearium/specs/bg_1782302578563_q1p1n1/manual-note.txt
A data/idearium/specs/bg_1782302578573_f3rpjt/build-group.json
A data/idearium/specs/bg_1782302578575_bfhaqt/build-group.json
A data/snapshots/nex-01e1d0da.nex
A data/snapshots/nex-07c62455.nex
A data/snapshots/nex-0dbbdb61.nex
A data/snapshots/nex-0ef25d56.nex
A data/snapshots/nex-0f10e7a3.nex
A data/snapshots/nex-125424d3.nex
A data/snapshots/nex-18a85b35.nex
A data/snapshots/nex-1cd5470f.nex
A data/snapshots/nex-1db1c901.nex
A data/snapshots/nex-276f9fd8.nex
A data/snapshots/nex-2d97ab3b.nex
A data/snapshots/nex-3089e65c.nex
A data/snapshots/nex-333b13dc.nex
A data/snapshots/nex-35372bdc.nex
A data/snapshots/nex-3aa57fbd.nex
A data/snapshots/nex-3c33d395.nex
A data/snapshots/nex-4147ad16.nex
A data/snapshots/nex-439c4e48.nex
A data/snapshots/nex-44449a54.nex
A data/snapshots/nex-44b35960.nex
A data/snapshots/nex-44e6dd2d.nex
A data/snapshots/nex-46f0fd7c.nex
A data/snapshots/nex-48d4309e.nex
A data/snapshots/nex-4a7cc8ec.nex
A data/snapshots/nex-4baaf747.nex
A data/snapshots/nex-520ec847.nex
A data/snapshots/nex-54989605.nex
A data/snapshots/nex-5c28450f.nex
A data/snapshots/nex-61cccb89.nex
A data/snapshots/nex-63935b58.nex
A data/snapshots/nex-65f60923.nex
A data/snapshots/nex-6617eee4.nex
A data/snapshots/nex-7068395e.nex
A data/snapshots/nex-7098e4e5.nex
A data/snapshots/nex-76260002.nex
A data/snapshots/nex-77380657.nex
A data/snapshots/nex-7bbab4be.nex
A data/snapshots/nex-80068860.nex
A data/snapshots/nex-80cacd03.nex
A data/snapshots/nex-81e3918b.nex
A data/snapshots/nex-82d38235.nex
A data/snapshots/nex-8315af93.nex
A data/snapshots/nex-8615481e.nex
A data/snapshots/nex-87c9f4d9.nex
A data/snapshots/nex-8be62fb1.nex
A data/snapshots/nex-8d433ab4.nex
A data/snapshots/nex-8f21f1c5.nex
A data/snapshots/nex-8fea4e27.nex
A data/snapshots/nex-93805c69.nex
A data/snapshots/nex-93a2d997.nex
A data/snapshots/nex-96ce2e48.nex
A data/snapshots/nex-999fd0ef.nex
A data/snapshots/nex-9a81db94.nex
A data/snapshots/nex-a1c9d71d.nex
A data/snapshots/nex-a2e69f8b.nex
A data/snapshots/nex-a765cfb9.nex
A data/snapshots/nex-aa3ee2db.nex
A data/snapshots/nex-aa5310b4.nex
A data/snapshots/nex-b26d5bc4.nex
A data/snapshots/nex-b586ff63.nex
A data/snapshots/nex-b8500368.nex
A data/snapshots/nex-b890c4f6.nex
A data/snapshots/nex-b8dd5a53.nex
A data/snapshots/nex-b92ae5c6.nex
A data/snapshots/nex-bbe4311d.nex
A data/snapshots/nex-bd901774.nex
A data/snapshots/nex-bfd2c1a3.nex
A data/snapshots/nex-c6bf10f6.nex
A data/snapshots/nex-cb5e27ef.nex
A data/snapshots/nex-cb624d88.nex
A data/snapshots/nex-cd1e0e90.nex
A data/snapshots/nex-d08cc23a.nex
A data/snapshots/nex-d0c4cfa7.nex
A data/snapshots/nex-d5b75ec2.nex
A data/snapshots/nex-d6a05522.nex
A data/snapshots/nex-d6b10a5e.nex
A data/snapshots/nex-d7f35954.nex
A data/snapshots/nex-dcefb009.nex
A data/snapshots/nex-dece40a3.nex
A data/snapshots/nex-e6ad14bb.nex
A data/snapshots/nex-e71dd428.nex
A data/snapshots/nex-e82aba44.nex
A data/snapshots/nex-e82d484a.nex
A data/snapshots/nex-ec43557f.nex
A data/snapshots/nex-ec63a8be.nex
A data/snapshots/nex-ef6b4eca.nex
A data/snapshots/nex-f04e2f3b.nex
A data/snapshots/nex-f3b7b63e.nex
A data/snapshots/nex-fbfe8d1c.nex
A data/snapshots/nex-fec66500.nex
M docs/nexus-roadmap-combined.html
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/repo/watcher.js
M idearium/schemas/interaction-contract.json
M idearium/ui/index.html
A lib/local-vector-index.js
M lib/spec-container.js
M lib/vector-memory.js
M lib/version.js
M package.json
A tests/modules/local-vector-index.test.js
M tests/modules/run-all.js
M tests/modules/spec-container.test.js
M ui/idearium/index.html
```

### Build 0.9.8-r21 — snap-0161 — 2026-06-24 05:30:12

- Archive: `nexus-0161_2026-06-24_v0.9.8-r21_real_declared-1.0.0.zip` (was `nexus-v1.0.0-real.zip`)
- SHA-256: `5dec669a3dfc596155a85ca71836b205592f100f53c8be1f9b64b4a8bd1c8ae4`, 16 MB, downloaded 2026-06-24 05:32:56
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name 1.0.0); filed under 0.9.8 to keep the line in order
- Commit: `a638df1f91bc39e11aa47753c44d90fa07fc0f8e`, tag `snap-0161`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 696. Changes against the build before it: **71 added, 73 modified, 314 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 5 | 22 | 288 |
| cortex | 61 | 9 | 1 |
| guardian | 1 | 15 | 3 |
| tests | 0 | 3 | 8 |
| lib | 0 | 5 | 5 |
| docs | 0 | 4 | 4 |
| (root) | 0 | 5 | 1 |
| idearium | 0 | 5 | 0 |
| ui | 0 | 2 | 3 |
| .archive-removed-ui-duplicates | 4 | 0 | 0 |
| cli | 0 | 2 | 1 |
| architect | 0 | 1 | 0 |

```
A .archive-removed-ui-duplicates/README.md
A .archive-removed-ui-duplicates/ui/cortex-index.html
A .archive-removed-ui-duplicates/ui/guardian-index.html
A .archive-removed-ui-duplicates/ui/idearium-index.html
M CHANGELOG.md
D cli/co-pilot.js
M cli/nexus-repl-descriptors.js
M cli/nexus-repl.js
M cortex/agent-tools/index.js
M cortex/contract/index.js
M cortex/core/raid/index.js
M cortex/core/raid/snr-filter.js
M cortex/foundation/admin-server.js
M cortex/gap-loop.js
M docs/cli.spec
D docs/copilot.spec
D docs/nexus-roadmap-combined.html
M docs/phase-map.spec
D docs/raid-integration.spec
M docs/raid.spec
M docs/roadmap/NEXUS-ROADMAP.md
D docs/seam-queue.spec
D guardian/agents/co-pilot/index.js
M guardian/cli.js
M guardian/lib/detector.js
D guardian/lib/seam-mode-reducer.js
M guardian/lib/seam-queue.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
D guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/ledger.json
M guardian/memory_store/queue_compartments.json
M guardian/memory_store/seam_sessions.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/repo/watcher.js
M idearium/schemas/interaction-contract.json
M idearium/ui/index.html
D lib/changelog.js
D lib/component-descriptor.js
M lib/grammar-engine.js
D lib/local-vector-index.js
M lib/request-handler.js
D lib/spec-build-group.js
D lib/spec-container.js
M lib/spec-drift.js
M lib/vector-memory.js
M lib/version.js
M nexus-heal-loop.js
M nexus-roadmap-combined.html
D nexus.zip
M orchestrator.js
M package.json
M tests/modules/admin-server-routes.test.js
D tests/modules/changelog.test.js
D tests/modules/component-descriptor.test.js
D tests/modules/copilot.test.js
D tests/modules/idearium-repo-watcher.test.mjs
D tests/modules/local-vector-index.test.js
M tests/modules/nexus-repl-descriptors.test.js
D tests/modules/raid-approve-tool.test.js
M tests/modules/run-all.js
D tests/modules/spec-build-group.test.js
D tests/modules/spec-container.test.js
M ui/agents/chatgpt/index.html
D ui/cortex/index.html
D ui/guardian/index.html
M ui/home/index.html
D ui/idearium/index.html
```

382 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r22 — snap-0162 — 2026-06-24 05:41:26

- Archive: `nexus-0162_2026-06-24_v0.9.8-r22_real_declared-1.1.0.zip` (was `nexus-v1.1.0-real.zip`)
- SHA-256: `428fea16d1cdf0ed80beeab331d24c1604e3332e0263e2571d2fd729eb6fd668`, 16 MB, downloaded 2026-06-24 05:44:04
- Kind: full
- Claimed version: 1.1.0 (registry 1.1.0, file name 1.1.0); filed under 0.9.8 to keep the line in order
- Commit: `cfa7f9b7e23b5dd4157375bd49507ca44f054451`, tag `snap-0162`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (81 MB)`
- Left out (50 MB or more): `cortex/data/memory_index.jsonl (52 MB)`
- Files in archive: 697. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
M lib/version.js
A tests/home-ui-asreply.test.js
M ui/home/index.html
```

### Build 0.9.8-r23 — snap-0163 — 2026-06-24 12:17:24

- Archive: `nexus-0163_2026-06-24_v0.9.8-r23_vnamed-0.9.9-2.zip` (was `nexus-v0_9_9-2.zip`)
- SHA-256: `6c5706b93344a44ade04e3f88f425a71bc423e8153d928936fd10e66640eca53`, 57.2 MB, downloaded 2026-06-24 12:19:39
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `c7e9541a2c5c5616c41e00fe6a025ae179ba07c1`, tag `snap-0163`
- Files in archive: 596. Changes against the build before it: **30 added, 48 modified, 129 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 8 | 67 |
| data | 0 | 0 | 57 |
| guardian | 3 | 17 | 0 |
| docs | 8 | 3 | 0 |
| lib | 4 | 6 | 0 |
| (root) | 3 | 5 | 0 |
| tests | 5 | 1 | 1 |
| ui | 4 | 2 | 0 |
| .archive-removed-ui-duplicates | 0 | 0 | 4 |
| idearium | 2 | 2 | 0 |
| cli | 1 | 2 | 0 |
| architect | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
D .archive-removed-ui-duplicates/README.md
D .archive-removed-ui-duplicates/ui/cortex-index.html
D .archive-removed-ui-duplicates/ui/guardian-index.html
D .archive-removed-ui-duplicates/ui/idearium-index.html
M CHANGELOG.md
M MANIFEST.json
A cli/co-pilot.js
M cli/nexus-repl-descriptors.js
M cli/nexus-repl.js
M cortex/agent-tools/index.js
M cortex/contract/index.js
M cortex/core/raid/index.js
M cortex/core/raid/snr-filter.js
M cortex/foundation/admin-server.js
M cortex/gap-loop.js
M cortex/liminal-space/index.js
M cortex/memory/jaa-db.js
A docs/AXIOMS-PHASE-MAP.md
A docs/SESSION-2026-06-24.md
A docs/SYSTEM-MAP.md
A docs/WIRES.md
M docs/cli.spec
A docs/copilot.spec
A docs/gap-lifecycle.spec
A docs/nexus-roadmap-combined.html
M docs/raid.spec
M docs/roadmap/NEXUS-ROADMAP.md
A docs/seam-queue.spec
A guardian/agents/co-pilot/index.js
M guardian/cli.js
M guardian/lib/detector.js
M guardian/lib/gap-hunter.js
A guardian/lib/seam-mode-reducer.js
M guardian/lib/seam-queue.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
A guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/ledger.json
M guardian/memory_store/queue_compartments.json
M guardian/memory_store/seam_sessions.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
A idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/repo/watcher.js
A idearium/spec-engine/index.js
A lib/changelog.js
A lib/gap-predicate.js
M lib/grammar-engine.js
A lib/meta/confidence.js
M lib/meta/liminal/index.js
M lib/open-loop-taxonomy.js
M lib/reflection.js
A lib/spec-container.js
M lib/spec-drift.js
M lib/version.js
M nexus-roadmap-combined.html
A nexus-v0_9_8 - 1.zip.tmp
A nexus-v0_9_8.zip
A nexus.zip
M orchestrator.js
M package.json
M service/nexus-diagnostic.js
D tests/home-ui-asreply.test.js
A tests/modules/changelog.test.js
A tests/modules/copilot.test.js
A tests/modules/idearium-repo-watcher.test.mjs
M tests/modules/nexus-repl-descriptors.test.js
A tests/modules/raid-approve-tool.test.js
A tests/modules/spec-container.test.js
M ui/agents/chatgpt/index.html
A ui/agents/mistral/index.html
A ui/cortex/index.html
A ui/guardian/index.html
M ui/home/index.html
A ui/idearium/index.html
```

126 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r24 — snap-0164 — 2026-06-24 12:26:52

- Archive: `nexus-0164_2026-06-24_v0.9.8-r24_vnamed-0.9.9-3.zip` (was `nexus-v0_9_9-3.zip`)
- SHA-256: `7ace7c1c347a375adfcd62fe08866a3cb96e7ba5d7676e6a065aa86365fa0b59`, 57.2 MB, downloaded 2026-06-24 12:29:48
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `aa6cabd3783de7439aa2424bbbe899708e40f1bd`, tag `snap-0164`
- Files in archive: 596. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |
| ui | 0 | 1 | 0 |

```
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M ui/agents/chatgpt/index.html
```

### Build 0.9.8-r25 — snap-0165 — 2026-06-24 12:42:22

- Archive: `nexus-0165_2026-06-24_v0.9.8-r25_vnamed-0.9.9-4.zip` (was `nexus-v0_9_9-4.zip`)
- SHA-256: `1144a5609161e9ed357e292372518d8c693a8b96bfbac702afa90d4fc479115f`, 57.2 MB, downloaded 2026-06-24 12:43:22
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `6ac29246dc33c5fd511c3bb25893c0b5d3c69058`, tag `snap-0165`
- Files in archive: 596. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |

```
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
```

### Build 0.9.8-r26 — snap-0166 — 2026-06-24 12:52:16

- Archive: `nexus-0166_2026-06-24_v0.9.8-r26_vnamed-0.9.9-5.zip` (was `nexus-v0_9_9-5.zip`)
- SHA-256: `03a5801ebe57b3dcde6629580e8201fc280bd55f786a2ad2bd57a0911160efe7`, 57.2 MB, downloaded 2026-06-24 12:57:17
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `a2268d14bfcbc78f57cd5a850a71e1664d7e58dc`, tag `snap-0166`
- Files in archive: 598. Changes against the build before it: **2 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 2 | 2 | 0 |

```
M ui/agents/chatgpt/index.html
A ui/agents/claude/index.html
A ui/agents/gemini/index.html
M ui/agents/mistral/index.html
```

### Build 0.9.8-r27 — snap-0167 — 2026-06-24 13:17:48

- Archive: `nexus-0167_2026-06-24_v0.9.8-r27_vnamed-0.9.9-6.zip` (was `nexus-v0_9_9-6.zip`)
- SHA-256: `1fccf33d7919977b1ba30e5dc09d4f734c7e2802d2aeb160dd6faa7a63a6209c`, 57.2 MB, downloaded 2026-06-24 13:20:25
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `ed92ae885411bd525ba8f0540b2de373a4e1e443`, tag `snap-0167`
- Files in archive: 598. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 5 | 0 |
| guardian | 0 | 2 | 0 |

```
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M ui/agents/chatgpt/index.html
M ui/agents/claude/index.html
M ui/agents/gemini/index.html
M ui/agents/mistral/index.html
M ui/home/index.html
```

### Build 0.9.8-r28 — snap-0168 — 2026-06-24 23:03:18

- Archive: `nexus-0168_2026-06-24_v0.9.8-r28_guardian-connect-23.16-23.17.zip` (was `nexus-guardian-connect-23.16-23.17.zip`)
- SHA-256: `2eacd12e4712660d13a3279ff26b9c9e6365de8e862026ad20e9ae3586a81aee`, 0.1 MB, downloaded 2026-06-24 23:21:44
- Kind: overlay (a patch laid over the build before it)
- Commit: `8fb4378dedc25e4d467962d3de81db43c3ccb717`, tag `snap-0168`
- Files in archive: 6. Changes against the build before it: **3 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |
| tests | 2 | 0 | 0 |
| (root) | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |

```
A MANIFEST.md
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M lib/reflection.js
A tests/connection-watchdog.test.js
A tests/seam-resume-dedup.test.js
```

### Build 0.9.8-r29 — snap-0169 — 2026-06-26 19:23:56

- Archive: `nexus-0169_2026-06-26_v0.9.8-r29_vnamed-0.9.9-complete.zip` (was `nexus-v0_9_9-complete.zip`)
- SHA-256: `602d8453a347423f3ef6105a11613640ae77467e841ae5e07b05ee65ba2938b6`, 11.6 MB, downloaded 2026-06-26 21:19:38
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `6afc4922abc3c02208233264b541e59935f9be9d`, tag `snap-0169`
- Files in archive: 926. Changes against the build before it: **333 added, 59 modified, 8 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 110 | 0 | 0 |
| cortex | 75 | 11 | 0 |
| ui | 72 | 5 | 0 |
| guardian | 46 | 12 | 0 |
| lib | 13 | 16 | 0 |
| (root) | 3 | 6 | 4 |
| tests | 9 | 4 | 0 |
| docs | 3 | 2 | 0 |
| emerge | 1 | 1 | 0 |
| tools | 0 | 0 | 2 |
| tutorial | 0 | 0 | 2 |
| architect | 0 | 1 | 0 |
| bridge | 1 | 0 | 0 |
| service | 0 | 1 | 0 |

```
A .mcp.json
A CHANGELOG-SESSION.md
M CHANGELOG.md
M MANIFEST.md
A bridge/causal/expectation.js
M cortex/core/raid/index.js
M cortex/cortex.js
M cortex/foundation/admin-server.js
M cortex/gap-loop.js
M cortex/gate/gap-finder.js
M cortex/healer/index.js
M cortex/intelligence/index.js
M cortex/memory/jaa-db.js
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
A cortex/self-heal/index.js.bak
M cortex/snapshot/index.js
M docs/architect.spec
M docs/copilot.spec
A docs/mcp-claude-desktop-config.json
A docs/mcp.spec
A docs/nexus-organisms.spec
M emerge/compiler/pipeline.js
A emerge/compiler/t2-gate.js
A guardian/New folder/New folder.zip
A guardian/New folder/agents/co-pilot/index.js
A guardian/New folder/agents/index.js
A guardian/New folder/agents/ollama.js
A guardian/New folder/api-dispatch.js
A guardian/New folder/cli.js
A guardian/New folder/dropzone-persist.js
A guardian/New folder/dropzone.js
A guardian/New folder/guardian-api.js
A guardian/New folder/guardian-cert.pem
A guardian/New folder/guardian-key.pem
A guardian/New folder/guardian.config.json
A guardian/New folder/interaction-contract.json
A guardian/New folder/jaa-store.js
A guardian/New folder/lab/lab.js
A guardian/New folder/lib/detector.js
A guardian/New folder/lib/gap-hunter.js
A guardian/New folder/lib/seam-mode-reducer.js
A guardian/New folder/lib/seam-queue.js
A guardian/New folder/lib/seam-watchdog.js
A guardian/New folder/lib/spec-bridge/index.js
A guardian/New folder/lib/spec-parser.js
A guardian/New folder/memory.js
A guardian/New folder/memory_store/artifacts.json
A guardian/New folder/memory_store/cfr_state.json
A guardian/New folder/memory_store/chat_log.json
A guardian/New folder/memory_store/event_log.json
A guardian/New folder/memory_store/event_stats.json
A guardian/New folder/memory_store/gaps.json
A guardian/New folder/memory_store/jobs.json
A guardian/New folder/memory_store/ledger.json
A guardian/New folder/memory_store/queue_compartments.json
A guardian/New folder/memory_store/seam_sessions.json
A guardian/New folder/memory_store/settings.json
A guardian/New folder/server.js
A guardian/New folder/spec-namer.js
A guardian/New folder/ui/index.html
A guardian/New folder/userscript-chatgpt.js
A guardian/New folder/userscript-claude.js
A guardian/New folder/userscript-gemini.js
A guardian/New folder/userscript-memory.js
A guardian/New folder/userscript-ollama.js
A guardian/New folder/userscript-orchestrator.js
A guardian/New folder/userscript-perplexity.js
M guardian/agents/co-pilot/index.js
A guardian/agents/co-pilot/index.js.v1.1.0.bak
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/ledger.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M lib/autonomous-loop.js
A lib/blueprint.js
A lib/causal/anomaly.js
M lib/cfr/sigma.js
A lib/cli-map.js
A lib/component-ledger.js
M lib/component-registry.js
M lib/context-builder.js
A lib/copilot-context.js
A lib/descriptor-projector.js
A lib/diagnostic-contract.js
A lib/engine-ledger.js
M lib/gap-predicate.js
M lib/grammar-engine.js
A lib/hot-loader.js
A lib/local-vector-index.js
A lib/mcp-server.js
A lib/mcp-stdio.js
M lib/meta/confidence.js
M lib/meta/telemetry-codec/adapter.js
M lib/meta/telemetry-codec/bus.js
M lib/meta/telemetry-codec/drift-engine.js
M lib/meta/telemetry-codec/engines.js
M lib/meta/telemetry-codec/latent-model.js
M lib/meta/telemetry-codec/runtime.js
A lib/meta/telemetry-codec/topology.js
M lib/ncp.js
M lib/user-model.js
M lib/vector-memory.js
M nexus-connect.js
A nexus-connect.js.bak
D nexus-v0_9_8 - 1.zip.tmp
D nexus-v0_9_8.zip
D nexus.zip
M orchestrator.js
M package-lock.json
M package.json
D powershell.exe
M service/nexus-diagnostic.js
A tests/audit-results.json
A tests/brutal-results.json
A tests/connection-generation-guard.test.js
A tests/create-job-meta.test.js
A tests/escalation-spam.test.js
M tests/full.test.js
A tests/infra-gap-priority.test.js
M tests/integration-results.json
M tests/kernel-test-results.json
M tests/kernel.test.js
A tests/local-vector-index.test.js
A tests/ncp-race.test.js
A tests/nexus-full-audit.js
D tools/gig-creator/generator.js
D tools/gig-creator/gigs.json
D tutorial/server.js
D tutorial/wizard.js
M ui/agents/chatgpt/index.html
A ui/agents/chatgpt/index.html.bak
M ui/agents/claude/index.html
A ui/agents/claude/index.html.bak
M ui/agents/gemini/index.html
A ui/agents/gemini/index.html.bak
A ui/agents/perplexity/index.html
A ui/diagnostics/index.html
M ui/emerge-ide.html
A ui/eravos/bridge/nexus-bridge.js
A ui/eravos/catalog/catalog-ui.js
A ui/eravos/catalog/catalog.css
A ui/eravos/catalog/catalog.js
A ui/eravos/index.html
```

250 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r30 — snap-0170 — 2026-06-27 00:47:22

- Archive: `nexus-0170_2026-06-27_v0.9.8-r30_vnamed-0.9.9-complete-1.zip` (was `nexus-v0_9_9-complete - 1.zip`)
- SHA-256: `830c2b2bd12bfbefb8d66413a626063e7fb47a3471a358cf70e426abe490fea7`, 15.1 MB, downloaded 2026-06-27 00:48:48
- Kind: full
- Claimed version: 0.9.9 (registry 0.9.8, file name 0.9.9); filed under 0.9.8 to keep the line in order
- Commit: `65e0141c418fc2157a48c494285d9ee34ffe9234`, tag `snap-0170`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (67 MB)`
- Files in archive: 942. Changes against the build before it: **91 added, 87 modified, 76 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 90 | 70 | 7 |
| cortex | 0 | 5 | 68 |
| guardian | 0 | 9 | 1 |
| (root) | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cortex/foundation/admin-server.js
M guardian/agents/co-pilot/index.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M orchestrator.js
A powershell.exe
M ui/home/index.html
```

241 more (mostly data, logs and archived files) are in the ledger file.

### artifact — 0171 — 2026-06-27 03:52:58

- Archive: `nexus-0171_2026-06-27_v0.9.8-side_patch-sovereign-systems.zip` (was `nexus-patch-sovereign-systems.zip`)
- SHA-256: `5ca8540610a15fa6a07ff93798096dc3c9a0e8b620c4e13161dc19be92672e04`, 0.2 MB, downloaded 2026-06-27 03:53:53
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `b8459ae79b5254261633bfbb59e92d2a0b42f4a4`, tag `snap-0171`
- Files in archive: 74. Changes against the build before it: **74 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0171_2026-06-27_unversioned_patch-sovereign-systems | 74 | 0 | 0 |

```
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/autopilot.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/copilot/registry-components.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/copilot/server.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/registry-components.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/server.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/bridge/nexus-bridge.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/catalog/catalog-ui.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/catalog/catalog.css
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/catalog/catalog.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/index.html
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/kernel/intake.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/kernel/kernel.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/manifest.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/acid-synth/acid-synth.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/acid-synth/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/bass-drop-builder/bass-drop-builder.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/bass-drop-builder/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/channel/channel.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/channel/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/contrast-analyser/contrast-analyser.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/contrast-analyser/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/edm-lab/edm-lab.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/edm-lab/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/lfo/lfo.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/lfo/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-architect/nexus-architect.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-architect/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-bridge/nexus-bridge.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-bridge/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-cortex/nexus-cortex.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-cortex/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-diagnostic/nexus-diagnostic.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-diagnostic/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-guardian/nexus-guardian.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-guardian/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-idearium/nexus-idearium.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-idearium/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-orchestrator/nexus-orchestrator.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-orchestrator/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/nexus-shared/nexus-node-core.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/pads/pads.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/pads/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/reese-bass/reese-bass.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/reese-bass/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/sample-player/sample-player.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/sample-player/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/sequencer/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/sequencer/sequencer.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/timeline/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/timeline/timeline.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/wobble-bass/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/wobble-bass/wobble-bass.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/xy-pad/schema/schema.json
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/organisms/xy-pad/xy-pad.engine.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/pack/pack-loader.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/alk-gl.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/canvas-cfr.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/canvas-wm.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/master-transport.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/organism-factory.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/precision-clock.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/precision-clock.worklet.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/runtime/wire-system.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/ERAVOS.kernel.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.genomes-ecosystems-behaviors.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.nexus.build-contract.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.organism.pads.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.organism.sample-player.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.organism.sequencer.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.organism.timeline.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/eravos/ui/specs/eravos.pack.format.spec
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/ollama/registry-components.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/ollama/server.js
A nexus-0171_2026-06-27_unversioned_patch-sovereign-systems/orchestrator.js
```

### Build 0.9.8-r31 — snap-0172 — 2026-06-27 03:55:54

- Archive: `nexus-0172_2026-06-27_v0.9.8-r31_complete-vnamed-1.0.0.zip` (was `nexus-complete-v1_0_0.zip`)
- SHA-256: `5150e758aa8508781ad3f87c38c20283ac620b7f4d58691eeda80ab3fc3c4a9d`, 10.4 MB, downloaded 2026-06-27 03:56:32
- Kind: full
- Commit: `80a592660dfe6c2a30e110a67a179174d74ac29d`, tag `snap-0172`
- Files in archive: 967. Changes against the build before it: **162 added, 104 modified, 136 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 7 | 82 | 90 |
| cortex | 68 | 4 | 0 |
| eravos | 68 | 0 | 0 |
| guardian | 9 | 9 | 45 |
| (root) | 1 | 3 | 1 |
| docs | 3 | 1 | 0 |
| copilot | 2 | 0 | 0 |
| ollama | 2 | 0 | 0 |
| ui | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| emerge | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M CHANGELOG-SESSION.md
A SYSTEM-MAP.md
M autopilot.js
A copilot/registry-components.js
A copilot/server.js
A docs/cfr-contract-wire.spec
M docs/copilot.spec
A docs/ollama.spec
A docs/ui-location.spec
A emerge/ui/index.html
A eravos/registry-components.js
A eravos/server.js
A eravos/ui/bridge/nexus-bridge.js
A eravos/ui/catalog/catalog-ui.js
A eravos/ui/catalog/catalog.css
A eravos/ui/catalog/catalog.js
A eravos/ui/index.html
A eravos/ui/kernel/intake.js
A eravos/ui/kernel/kernel.js
A eravos/ui/manifest.json
A eravos/ui/organisms/acid-synth/acid-synth.engine.js
A eravos/ui/organisms/acid-synth/schema/schema.json
A eravos/ui/organisms/bass-drop-builder/bass-drop-builder.engine.js
A eravos/ui/organisms/bass-drop-builder/schema/schema.json
A eravos/ui/organisms/channel/channel.engine.js
A eravos/ui/organisms/channel/schema/schema.json
A eravos/ui/organisms/contrast-analyser/contrast-analyser.engine.js
A eravos/ui/organisms/contrast-analyser/schema/schema.json
A eravos/ui/organisms/edm-lab/edm-lab.engine.js
A eravos/ui/organisms/edm-lab/schema/schema.json
A eravos/ui/organisms/lfo/lfo.engine.js
A eravos/ui/organisms/lfo/schema/schema.json
A eravos/ui/organisms/nexus-architect/nexus-architect.engine.js
A eravos/ui/organisms/nexus-architect/schema/schema.json
A eravos/ui/organisms/nexus-bridge/nexus-bridge.engine.js
A eravos/ui/organisms/nexus-bridge/schema/schema.json
A eravos/ui/organisms/nexus-cortex/nexus-cortex.engine.js
A eravos/ui/organisms/nexus-cortex/schema/schema.json
A eravos/ui/organisms/nexus-diagnostic/nexus-diagnostic.engine.js
A eravos/ui/organisms/nexus-diagnostic/schema/schema.json
A eravos/ui/organisms/nexus-guardian/nexus-guardian.engine.js
A eravos/ui/organisms/nexus-guardian/schema/schema.json
A eravos/ui/organisms/nexus-idearium/nexus-idearium.engine.js
A eravos/ui/organisms/nexus-idearium/schema/schema.json
A eravos/ui/organisms/nexus-orchestrator/nexus-orchestrator.engine.js
A eravos/ui/organisms/nexus-orchestrator/schema/schema.json
A eravos/ui/organisms/nexus-shared/nexus-node-core.js
A eravos/ui/organisms/pads/pads.engine.js
A eravos/ui/organisms/pads/schema/schema.json
A eravos/ui/organisms/reese-bass/reese-bass.engine.js
A eravos/ui/organisms/reese-bass/schema/schema.json
A eravos/ui/organisms/sample-player/sample-player.engine.js
A eravos/ui/organisms/sample-player/schema/schema.json
A eravos/ui/organisms/sequencer/schema/schema.json
A eravos/ui/organisms/sequencer/sequencer.engine.js
A eravos/ui/organisms/timeline/schema/schema.json
A eravos/ui/organisms/timeline/timeline.engine.js
A eravos/ui/organisms/wobble-bass/schema/schema.json
A eravos/ui/organisms/wobble-bass/wobble-bass.engine.js
A eravos/ui/organisms/xy-pad/schema/schema.json
A eravos/ui/organisms/xy-pad/xy-pad.engine.js
A eravos/ui/pack/pack-loader.js
A eravos/ui/runtime/alk-gl.js
A eravos/ui/runtime/canvas-cfr.js
A eravos/ui/runtime/canvas-wm.js
A eravos/ui/runtime/master-transport.js
A eravos/ui/runtime/organism-factory.js
A eravos/ui/runtime/precision-clock.js
A eravos/ui/runtime/precision-clock.worklet.js
A eravos/ui/runtime/wire-system.js
A eravos/ui/specs/ERAVOS.kernel.spec
A eravos/ui/specs/eravos.genomes-ecosystems-behaviors.spec
A eravos/ui/specs/eravos.nexus.build-contract.spec
A eravos/ui/specs/eravos.organism.pads.spec
A eravos/ui/specs/eravos.organism.sample-player.spec
A eravos/ui/specs/eravos.organism.sequencer.spec
A eravos/ui/specs/eravos.organism.timeline.spec
A eravos/ui/specs/eravos.pack.format.spec
D guardian/New folder/New folder.zip
D guardian/New folder/agents/co-pilot/index.js
D guardian/New folder/agents/index.js
D guardian/New folder/agents/ollama.js
D guardian/New folder/api-dispatch.js
D guardian/New folder/cli.js
D guardian/New folder/dropzone-persist.js
D guardian/New folder/dropzone.js
D guardian/New folder/guardian-api.js
D guardian/New folder/guardian-cert.pem
D guardian/New folder/guardian-key.pem
D guardian/New folder/guardian.config.json
D guardian/New folder/interaction-contract.json
D guardian/New folder/jaa-store.js
D guardian/New folder/lab/lab.js
D guardian/New folder/lib/detector.js
D guardian/New folder/lib/gap-hunter.js
D guardian/New folder/lib/seam-mode-reducer.js
D guardian/New folder/lib/seam-queue.js
D guardian/New folder/lib/seam-watchdog.js
D guardian/New folder/lib/spec-bridge/index.js
D guardian/New folder/lib/spec-parser.js
D guardian/New folder/memory.js
D guardian/New folder/memory_store/artifacts.json
D guardian/New folder/memory_store/cfr_state.json
D guardian/New folder/memory_store/chat_log.json
D guardian/New folder/memory_store/event_log.json
D guardian/New folder/memory_store/event_stats.json
D guardian/New folder/memory_store/gaps.json
D guardian/New folder/memory_store/jobs.json
D guardian/New folder/memory_store/ledger.json
D guardian/New folder/memory_store/queue_compartments.json
D guardian/New folder/memory_store/seam_sessions.json
D guardian/New folder/memory_store/settings.json
D guardian/New folder/server.js
D guardian/New folder/spec-namer.js
D guardian/New folder/ui/index.html
D guardian/New folder/userscript-chatgpt.js
D guardian/New folder/userscript-claude.js
D guardian/New folder/userscript-gemini.js
D guardian/New folder/userscript-memory.js
D guardian/New folder/userscript-ollama.js
D guardian/New folder/userscript-orchestrator.js
D guardian/New folder/userscript-perplexity.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M guardian/server.js
A guardian/ui/agents/chatgpt/index.html
A guardian/ui/agents/chatgpt/index.html.bak
A guardian/ui/agents/claude/index.html
A guardian/ui/agents/claude/index.html.bak
A guardian/ui/agents/gemini/index.html
A guardian/ui/agents/gemini/index.html.bak
A guardian/ui/agents/mistral/index.html
A guardian/ui/agents/perplexity/index.html
M lib/cfr/delta.js
A ollama/registry-components.js
A ollama/server.js
M orchestrator.js
D powershell.exe
M service/nexus-diagnostic.js
M tests/brutal-results.json
A ui/home/DECOMP.md
M ui/home/index.html
```

254 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r32 — snap-0173 — 2026-06-27 04:02:02

- Archive: `nexus-0173_2026-06-27_v0.9.8-r32_complete-vnamed-1.0.1.zip` (was `nexus-complete-v1_0_1.zip`)
- SHA-256: `b7f2499deddc6b2e37cafa769bb82079b1ae898782a6d8680614ad1a72094fe0`, 10.4 MB, downloaded 2026-06-27 04:05:48
- Kind: full
- Commit: `45b3d9bc94c718cb7e7f153f20b854c0e7cfee8e`, tag `snap-0173`
- Files in archive: 972. Changes against the build before it: **5 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| ui | 5 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
M tests/brutal-results.json
M ui/home/index.html
A ui/tv-shell/DECOMP.md
A ui/tv-shell/forge-shell/index.html
A ui/tv-shell/index.html
A ui/tv-shell/spotlight/spotlight.css
A ui/tv-shell/spotlight/spotlight.js
```

### Build 0.9.8-r33 — snap-0174 — 2026-06-27 04:15:38

- Archive: `nexus-0174_2026-06-27_v0.9.8-r33_complete-vnamed-1.0.2.zip` (was `nexus-complete-v1_0_2.zip`)
- SHA-256: `0ee940e86759398c4c73686fe7204b21c073a012a4934aa64c0313f9eb26d928`, 10.5 MB, downloaded 2026-06-27 04:22:38
- Kind: full
- Commit: `20d17eafc8d36ff2d3384a5c1631d64c028df4bc`, tag `snap-0174`
- Files in archive: 978. Changes against the build before it: **6 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| ui | 3 | 2 | 0 |
| eravos | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| skills | 2 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M copilot/server.js
M cortex/boot.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
M eravos/registry-components.js
M eravos/server.js
A lib/cortex-write.js
M lib/user-model.js
M ollama/server.js
A skills/james-brooks/SKILL.md
A skills/nexus-session-changelog/SKILL.md
M tests/brutal-results.json
A ui/forge-shell.html
M ui/home/index.html
A ui/themes/nexus-dark.css
A ui/themes/nexus-light.css
M ui/tv-shell/index.html
```

### Build 0.9.8-r34 — snap-0175 — 2026-06-27 04:29:12

- Archive: `nexus-0175_2026-06-27_v0.9.8-r34_complete-vnamed-1.0.3.zip` (was `nexus-complete-v1_0_3.zip`)
- SHA-256: `f20cbafed9248feeb0e0e5124fc5700cf42b955c956c03ed611843bacff94fcd`, 10.5 MB, downloaded 2026-06-27 05:13:11
- Kind: full
- Commit: `924a50814e8f925637688f6c71615634a3a67ee4`, tag `snap-0175`
- Files in archive: 985. Changes against the build before it: **7 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| copilot | 3 | 1 | 0 |
| lib | 2 | 1 | 0 |
| ui | 1 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
A copilot/adversarial.js
A copilot/analysis.js
A copilot/intuition.js
M copilot/server.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
A docs/contract-queue.spec
A lib/contract-poller.js
A lib/contract-queue.js
M lib/user-model.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
M ui/home/index.html
M ui/tv-shell/index.html
A ui/tv-shell/menu.js
```

### Build 0.9.8-r35 — snap-0176 — 2026-06-27 05:29:16

- Archive: `nexus-0176_2026-06-27_v0.9.8-r35_complete-vnamed-1.0.4.zip` (was `nexus-complete-v1_0_4.zip`)
- SHA-256: `cabfa86ca49f3be643978e80f5b4184569d2b362aa59c587a4c37167403b50de`, 10.5 MB, downloaded 2026-06-27 05:31:19
- Kind: full
- Commit: `37ac048b758e969ae8926ecb90258b102eecb3b9`, tag `snap-0176`
- Files in archive: 994. Changes against the build before it: **9 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| copilot | 3 | 1 | 0 |
| cortex | 3 | 0 | 0 |
| docs | 2 | 0 | 0 |
| cli | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |

```
A cli/axiom.js
A copilot/axiom-manager.js
A copilot/lifeline.js
A copilot/module-builder.js
M copilot/server.js
A cortex/intelligence/dedup.js
A cortex/intelligence/intuition.js
A cortex/intelligence/mastermind.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
A docs/copilot-expansion.spec
A docs/cortex-dual-cognition.spec
M tests/brutal-results.json
```

### Build 0.9.8-r36 — snap-0177 — 2026-06-27 05:41:52

- Archive: `nexus-0177_2026-06-27_v0.9.8-r36_complete-vnamed-1.0.4-1.zip` (was `nexus-complete-v1_0_4 - 1.zip`)
- SHA-256: `a8ba83367fba0c6a985c5453c0f48758f885119c81dc35b709b758dfffa6db67`, 78.1 MB, downloaded 2026-06-27 05:42:43
- Kind: full
- Commit: `b72cdb131750652799eb43e22cee343ec0f94c8c`, tag `snap-0177`
- Files in archive: 1081. Changes against the build before it: **161 added, 89 modified, 74 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 126 | 71 | 7 |
| cortex | 34 | 6 | 67 |
| guardian | 0 | 8 | 0 |
| (root) | 1 | 1 | 0 |
| architect | 0 | 2 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
M cortex/cortex.js
A cortex/cortex.js.backup-1782563576419
A cortex/cortex.js.backup-1782563589759
A cortex/cortex.js.backup-1782563599112
A cortex/cortex.js.backup-1782563614213
A cortex/cortex.js.backup-1782563629253
A cortex/cortex.js.backup-1782563649832
A cortex/cortex.js.backup-1782563659419
A cortex/cortex.js.backup-1782563674312
A cortex/cortex.js.backup-1782563689239
A cortex/cortex.js.backup-1782563709537
A cortex/cortex.js.backup-1782563719527
A cortex/cortex.js.backup-1782563734394
A cortex/cortex.js.backup-1782563749489
A cortex/cortex.js.backup-1782563771848
A cortex/cortex.js.backup-1782563779451
A cortex/cortex.js.backup-1782563794317
A cortex/cortex.js.backup-1782563809474
A cortex/cortex.js.backup-1782563825972
A cortex/cortex.js.backup-1782563839657
A cortex/cortex.js.backup-1782563854437
A cortex/cortex.js.backup-1782563869399
A cortex/cortex.js.backup-1782563884478
A cortex/cortex.js.backup-1782563899552
A cortex/cortex.js.backup-1782563914379
A cortex/cortex.js.backup-1782563929639
A cortex/cortex.js.backup-1782563944532
A cortex/cortex.js.backup-1782563959602
A cortex/cortex.js.backup-1782564006122
A cortex/cortex.js.backup-1782564019467
A cortex/cortex.js.backup-1782564034684
A cortex/cortex.js.backup-1782564049591
A cortex/cortex.js.backup-1782564064540
A cortex/cortex.js.backup-1782564079604
A cortex/cortex.js.backup-1782564094542
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
A powershell.exe
M ui/home/index.html
```

279 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r37 — snap-0178 — 2026-06-27 05:41:54

- Archive: `nexus-0178_2026-06-27_v0.9.8-r37_complete-vnamed-1.0.4-2.zip` (was `nexus-complete-v1_0_4 - 2.zip`)
- SHA-256: `50313db8ff3faf97a08c6de5a0490d67ee54ffe3a038622575813896b665d84f`, 82.3 MB, downloaded 2026-06-27 05:43:50
- Kind: full
- Commit: `1913b28107967630e18244385e606d4df34aea76`, tag `snap-0178`
- Files in archive: 1156. Changes against the build before it: **76 added, 5 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 68 | 0 | 0 |
| data | 8 | 5 | 1 |

```
A cortex/cortex.js.backup-1782564109609
A cortex/data/active_traces.jsonl
A cortex/data/agent_calls.jsonl
A cortex/data/agent_messages.jsonl
A cortex/data/agent_signatures.jsonl
A cortex/data/artifacts.jsonl
A cortex/data/autonomous_runs.jsonl
A cortex/data/backup_records.jsonl
A cortex/data/bep_patterns.jsonl
A cortex/data/boot_records.jsonl
A cortex/data/case_index.jsonl
A cortex/data/causality_nodes.jsonl
A cortex/data/chat_log.jsonl
A cortex/data/cli_history.jsonl
A cortex/data/closure_attempts.jsonl
A cortex/data/compartments.jsonl
A cortex/data/component_ledger.jsonl
A cortex/data/components.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/constitution_decisions.jsonl
A cortex/data/contract_audit.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/decay_log.jsonl
A cortex/data/decision_log.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/diagnostic_contracts.jsonl
A cortex/data/escalation_log.jsonl
A cortex/data/event_log.jsonl
A cortex/data/failure_modes.jsonl
A cortex/data/failures.jsonl
A cortex/data/fault_taxonomy.jsonl
A cortex/data/feedback_scores.jsonl
A cortex/data/fix_map.jsonl
A cortex/data/forge_patches.jsonl
A cortex/data/gap_predicates.jsonl
A cortex/data/gaps.jsonl
A cortex/data/healer_log.jsonl
A cortex/data/ime_profiles.jsonl
A cortex/data/intent_nodes.jsonl
A cortex/data/interstitial_spaces.jsonl
A cortex/data/lattice_edges.jsonl
A cortex/data/law_violations.jsonl
A cortex/data/memory_index.jsonl
A cortex/data/memory_queries.jsonl
A cortex/data/orion_sessions.jsonl
A cortex/data/poll_log.jsonl
A cortex/data/project_registry.jsonl
A cortex/data/reflection_contracts.jsonl
A cortex/data/requests.jsonl
A cortex/data/reuse_index.jsonl
A cortex/data/schedules.jsonl
A cortex/data/seam_records.jsonl
A cortex/data/self_model.jsonl
A cortex/data/shape_samples.jsonl
A cortex/data/sigma_records.jsonl
A cortex/data/snapshots.jsonl
A cortex/data/snr_records.jsonl
A cortex/data/toasts.jsonl
A cortex/data/trust_scores.jsonl
A cortex/data/user_model_hypotheses.jsonl
A cortex/data/versionium_branches.jsonl
A cortex/data/versionium_calendar.jsonl
A cortex/data/versionium_commits.jsonl
A cortex/data/versionium_file_index.jsonl
A cortex/data/versionium_objects.jsonl
A cortex/data/workflow_runs.jsonl
A cortex/data/working_memory.jsonl
M data/architect/baseline-events.ndjson
A data/architect/event_log.jsonl
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
A data/bridge/ledger/cfr/event_log.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
M data/diagnostic/baseline-events.ndjson
D data/diagnostic/diagnostic.pid
M data/idearium/baseline-events.ndjson
A data/idearium/event_log.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
A data/snapshots/nex-ec10bdf9.nex
```

### Build 0.9.8-r38 — snap-0179 — 2026-06-27 05:49:44

- Archive: `nexus-0179_2026-06-27_v0.9.8-r38_complete-vnamed-1.0.5.zip` (was `nexus-complete-v1_0_5.zip`)
- SHA-256: `875773e7a4e7fd06460d7cd880bde4a19abf737af8861fb693c4af02417dd404`, 10.5 MB, downloaded 2026-06-27 05:52:42
- Kind: full
- Commit: `88912f2342a0aa478936be48f7d63c7a38cf97f9`, tag `snap-0179`
- Files in archive: 995. Changes against the build before it: **2 added, 127 modified, 163 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 87 | 127 |
| cortex | 0 | 26 | 35 |
| guardian | 0 | 8 | 0 |
| (root) | 0 | 1 | 1 |
| architect | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG.md
M copilot/server.js
M cortex/cortex.js
D cortex/cortex.js.backup-1782563576419
D cortex/cortex.js.backup-1782563589759
D cortex/cortex.js.backup-1782563599112
D cortex/cortex.js.backup-1782563614213
D cortex/cortex.js.backup-1782563629253
D cortex/cortex.js.backup-1782563649832
D cortex/cortex.js.backup-1782563659419
D cortex/cortex.js.backup-1782563674312
D cortex/cortex.js.backup-1782563689239
D cortex/cortex.js.backup-1782563709537
D cortex/cortex.js.backup-1782563719527
D cortex/cortex.js.backup-1782563734394
D cortex/cortex.js.backup-1782563749489
D cortex/cortex.js.backup-1782563771848
D cortex/cortex.js.backup-1782563779451
D cortex/cortex.js.backup-1782563794317
D cortex/cortex.js.backup-1782563809474
D cortex/cortex.js.backup-1782563825972
D cortex/cortex.js.backup-1782563839657
D cortex/cortex.js.backup-1782563854437
D cortex/cortex.js.backup-1782563869399
D cortex/cortex.js.backup-1782563884478
D cortex/cortex.js.backup-1782563899552
D cortex/cortex.js.backup-1782563914379
D cortex/cortex.js.backup-1782563929639
D cortex/cortex.js.backup-1782563944532
D cortex/cortex.js.backup-1782563959602
D cortex/cortex.js.backup-1782564006122
D cortex/cortex.js.backup-1782564019467
D cortex/cortex.js.backup-1782564034684
D cortex/cortex.js.backup-1782564049591
D cortex/cortex.js.backup-1782564064540
D cortex/cortex.js.backup-1782564079604
D cortex/cortex.js.backup-1782564094542
D cortex/cortex.js.backup-1782564109609
A docs/NEXUS-PHASE-MAP.md
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
D powershell.exe
M tests/brutal-results.json
M ui/tv-shell/index.html
```

243 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r39 — snap-0180 — 2026-06-27 05:56:00

- Archive: `nexus-0180_2026-06-27_v0.9.8-r39_complete-vnamed-1.0.6.zip` (was `nexus-complete-v1_0_6.zip`)
- SHA-256: `856b9459cb0713c43fcb059482622af543971e198031a5cb7a2989f43133de37`, 10.5 MB, downloaded 2026-06-27 06:09:35
- Kind: full
- Commit: `5ec43bfccc704fd64801a045c5ab8efd1ff6e240`, tag `snap-0180`
- Files in archive: 1000. Changes against the build before it: **5 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| (root) | 0 | 2 | 0 |
| architect | 1 | 1 | 0 |
| bridge | 1 | 1 | 0 |
| cortex | 1 | 1 | 0 |
| guardian | 1 | 1 | 0 |
| emerge | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |

```
A architect/registry-components.js
M architect/service.js
M bridge/index.js
A bridge/registry-components.js
M cortex/boot.js
A cortex/registry-components.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
M emerge-ide.js
A emerge/registry-components.js
A guardian/registry-components.js
M guardian/server.js
M nexus-connect.js
M tests/brutal-results.json
```

### Build 0.9.8-r40 — snap-0181 — 2026-06-27 06:52:54

- Archive: `nexus-0181_2026-06-27_v0.9.8-r40_complete-fully-wired.zip` (was `nexus-complete-FULLY-WIRED.zip`)
- SHA-256: `66501c1734161112f876f4e0f8f43531600fcc2dfc0df792ce399b7a6b703cf7`, 10.7 MB, downloaded 2026-06-27 07:00:22
- Kind: full
- Commit: `9a428c2f906e46318095820bce6966d99fc6e405`, tag `snap-0181`
- Files in archive: 1012. Changes against the build before it: **13 added, 25 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 2 | 7 | 0 |
| lib | 3 | 4 | 0 |
| tests | 4 | 1 | 0 |
| cortex | 0 | 4 | 0 |
| data | 4 | 0 | 0 |
| (root) | 0 | 2 | 1 |
| cli | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
D .mcp.json
M cli/co-pilot.js
M cli/nexus-repl.js
M copilot/registry-components.js
M cortex/data/fix_map.jsonl
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
M cortex/snapshot/index.js
A data/snapshots/nex-0fd13d72.nex
A data/snapshots/nex-7ae3d663.nex
A data/snapshots/nex-7ccfd43f.nex
A data/snapshots/nex-8908eb78.nex
A docs/NEW-SYSTEM-TEMPLATE.md
M docs/architect.spec
M docs/cortex.spec
M docs/escalation.spec
M docs/grammar-engine.spec
M docs/guardian.spec
M docs/replay-engine.spec
M docs/snapshot.spec
A docs/t2-compartment-bridge.spec
M emerge/compiler/t2-gate.js
M lib/dispatch-pool.js
M lib/grammar-engine.js
A lib/hardware-budget.js
M lib/replay-engine.js
A lib/semantic-gap-types.js
A lib/t2-compartment-bridge.js
M lib/version.js
M ollama-runtime.js
M ollama/registry-components.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
A tests/modules/dispatch-pool-cap-fix.test.js
A tests/modules/hardware-budget.test.js
A tests/modules/semantic-gap-loop-fix.test.js
A tests/modules/t2-compartment-bridge.test.js
M ui/home/index.html
```

### Build 0.9.8-r41 — snap-0182 — 2026-06-27 08:25:12

- Archive: `nexus-0182_2026-06-27_v0.9.8-r41_complete-vnamed-1.0.7.zip` (was `nexus-complete-v1_0_7.zip`)
- SHA-256: `50d42956fd25e1e3d69183bc74b8eb655cb7558afa550312f1a0269626c80015`, 10.5 MB, downloaded 2026-06-27 08:26:10
- Kind: full
- Commit: `f91bf3846f46c0ba2c47bf7f4ca0ac5178a4c98e`, tag `snap-0182`
- Files in archive: 1002. Changes against the build before it: **3 added, 40 modified, 13 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 4 |
| docs | 0 | 7 | 2 |
| lib | 0 | 4 | 3 |
| tests | 0 | 1 | 4 |
| cortex | 0 | 4 | 0 |
| (root) | 1 | 2 | 0 |
| copilot | 1 | 2 | 0 |
| cli | 0 | 2 | 0 |
| ui | 1 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A .mcp.json
M cli/co-pilot.js
M cli/nexus-repl.js
A copilot/recursive-diagnose.js
M copilot/registry-components.js
M copilot/server.js
M cortex/data/fix_map.jsonl
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
M cortex/snapshot/index.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
D data/snapshots/nex-0fd13d72.nex
D data/snapshots/nex-7ae3d663.nex
D data/snapshots/nex-7ccfd43f.nex
D data/snapshots/nex-8908eb78.nex
D docs/NEW-SYSTEM-TEMPLATE.md
M docs/architect.spec
M docs/cortex.spec
M docs/escalation.spec
M docs/grammar-engine.spec
M docs/guardian.spec
M docs/replay-engine.spec
M docs/snapshot.spec
D docs/t2-compartment-bridge.spec
M emerge/compiler/t2-gate.js
M guardian/server.js
M lib/dispatch-pool.js
M lib/grammar-engine.js
D lib/hardware-budget.js
M lib/replay-engine.js
D lib/semantic-gap-types.js
D lib/t2-compartment-bridge.js
M lib/version.js
M ollama-runtime.js
M ollama/registry-components.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
D tests/modules/dispatch-pool-cap-fix.test.js
D tests/modules/hardware-budget.test.js
D tests/modules/semantic-gap-loop-fix.test.js
D tests/modules/t2-compartment-bridge.test.js
A ui/control-panel/index.html
M ui/home/index.html
```

### Build 0.9.8-r42 — snap-0183 — 2026-06-27 08:30:24

- Archive: `nexus-0183_2026-06-27_v0.9.8-r42_complete-vnamed-1.0.8.zip` (was `nexus-complete-v1_0_8.zip`)
- SHA-256: `711c6787568009f5b6efdb8375b1af7f5f50337c86a71bbafbbc717fd72d6475`, 10.5 MB, downloaded 2026-06-27 08:31:23
- Kind: full
- Commit: `43d3c288d83b65f2b21361ef3e05aa5dbaba81e3`, tag `snap-0183`
- Files in archive: 1002. Changes against the build before it: **0 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| ollama | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M copilot/registry-components.js
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
M docs/NEXUS-PHASE-MAP.md
M eravos/registry-components.js
M guardian/server.js
M ollama/registry-components.js
M ollama/server.js
M tests/brutal-results.json
```

### Build 0.9.8-r43 — snap-0184 — 2026-06-27 08:34:36

- Archive: `nexus-0184_2026-06-27_v0.9.8-r43_complete-vnamed-1.0.9.zip` (was `nexus-complete-v1_0_9.zip`)
- SHA-256: `a2445ce79323293865594daf7fc92dae0df74ef81b35d7f67af95c5fe99828bf`, 10.5 MB, downloaded 2026-06-27 08:35:20
- Kind: full
- Commit: `ac36b3ee7c50c6fe4e6f310796f40a2dc876f6a8`, tag `snap-0184`
- Files in archive: 1002. Changes against the build before it: **0 added, 16 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 13 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M data/ledger/cortex/cortex.gaps.list/2026-06-27.jsonl
M data/ledger/cortex/cortex.intelligence/2026-06-27.jsonl
M data/ledger/forge/forge.old/2026-06-27.jsonl
M data/ledger/forge/forge.patch/2026-06-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-06-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-06-27.jsonl
M data/ledger/reflection/reflection.engine/2026-06-27.jsonl
M data/ledger/test/test.echo.ping/2026-06-27.jsonl
M data/ledger/test/test.event.check/2026-06-27.jsonl
M data/ledger/test/test.widget.panel/2026-06-27.jsonl
M lib/contract-handshake.js
M orchestrator.js
M tests/brutal-results.json
```

### Build 0.9.8-r44 — snap-0185 — 2026-06-27 10:10:20

- Archive: `nexus-0185_2026-06-27_v0.9.8-r44_complete-vnamed-1.0.9-1.zip` (was `nexus-complete-v1_0_9 - 1.zip`)
- SHA-256: `da88dddb73c6923dc0a9b6ac9472c578f64d425257b5f08ce12f2919ce6252c9`, 21.7 MB, downloaded 2026-06-27 10:15:59
- Kind: full
- Commit: `d313bec51fcd91f21081f46b882bbd22b0b2e8c7`, tag `snap-0185`
- Files in archive: 1248. Changes against the build before it: **254 added, 115 modified, 8 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 253 | 76 | 1 |
| cortex | 0 | 23 | 0 |
| guardian | 0 | 10 | 3 |
| copilot | 0 | 1 | 4 |
| (root) | 1 | 2 | 0 |
| architect | 0 | 2 | 0 |
| service | 0 | 1 | 0 |

```
M CHANGELOG.md
D copilot/adversarial.js
D copilot/analysis.js
D copilot/axiom-manager.js
D copilot/intuition.js
M copilot/server.js
D guardian/agents/co-pilot/index.js
D guardian/agents/co-pilot/index.js.v1.1.0.bak
D guardian/agents/ollama.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M guardian/server.js
M orchestrator.js
A powershell.exe
M service/nexus-diagnostic.js
```

356 more (mostly data, logs and archived files) are in the ledger file.

### artifact — 0186 — 2026-06-27 14:18:22

- Archive: `nexus-0186_2026-06-27_v0.9.8-side_session-complete.zip` (was `NEXUS-SESSION-COMPLETE.zip`)
- SHA-256: `0cfb2f086a5529f9a781ec4f2f189f0372bf2cfe400b7899b82e9de3cebf0ee4`, 0.4 MB, downloaded 2026-06-27 14:20:12
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `b4350334b24ceaf0e18a939f6eb3cc767747eff4`, tag `snap-0186`
- Identical copy: `nexus-0186_2026-06-27_v0.9.8-side_session-complete-1_dup1.zip` (was `NEXUS-SESSION-COMPLETE-1.zip`)
- Files in archive: 97. Changes against the build before it: **97 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0186_2026-06-27_unversioned_session-complete | 97 | 0 | 0 |

```
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/NEXUS-INTEGRATION-MAP.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/NEXUS-PHASE-MAP-CROSSREF.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/INDEX.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/_reference/Causal-Nexus-v5_0_0-Spec.docx
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/_reference/NEXUS-INTEGRATION-MAP.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/_reference/NEXUS-PHASE-MAP-CROSSREF.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-105-integrity-delta/delta-v5-standalone.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-105-integrity-delta/delta-v6.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-105-integrity-delta/identity-v5-standalone.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-105-integrity-delta/identity-v6.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/CHANGELOG.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/README.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/causal-nexus-v6.0.0.spec
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/package.json
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/adapter-sandbox/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/adapter/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/causality/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/clip/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/compress/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/context/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/delta/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/enforcement/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/identity/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/kernel/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/lazy/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/observer/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/persist/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/projection/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/query/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/sigma/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/time/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/src/version-gate/index.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/cross-domain/invariants.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/run-all.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/runner.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/adapter-sandbox.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/causality.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/clip.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/context.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/kernel.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/loader-context.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/modules.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/observer-enforcement.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/sigma.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-27-30-109-epistemic-branch-runtime/test/unit/version-gate.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-95-enforcement/enforcement.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-95-enforcement/observer-enforcement.test.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-99-query-cql/query-v5-README.md
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-99-query-cql/query-v5-standalone.js
A nexus-0186_2026-06-27_unversioned_session-complete/01-source-audit/nexus-needed-files/phase-99-query-cql/query-v6.js
A nexus-0186_2026-06-27_unversioned_session-complete/02-foundation-and-templates/nexus-analysis-module-foundation.spec
A nexus-0186_2026-06-27_unversioned_session-complete/02-foundation-and-templates/nexus-system-foundation-addendum-v1.1.0.spec
A nexus-0186_2026-06-27_unversioned_session-complete/03-new-modules/affect.js
A nexus-0186_2026-06-27_unversioned_session-complete/03-new-modules/ase.js
A nexus-0186_2026-06-27_unversioned_session-complete/03-new-modules/registry-components-affect.js
A nexus-0186_2026-06-27_unversioned_session-complete/03-new-modules/registry-components-ase.js
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/AUDIT-SUMMARY.md
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/architect.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/bridge.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/cortex.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/diagnostic.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/emerge.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/eravos.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/escalation.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/grammar-engine.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/guardian.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/idearium.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/replay-engine.spec
A nexus-0186_2026-06-27_unversioned_session-complete/04-sovereign-system-spec-fixes/snapshot.spec
A nexus-0186_2026-06-27_unversioned_session-complete/05-what-if-loops-and-improvements/NEXUS-IMPROVEMENT-MAP.md
A nexus-0186_2026-06-27_unversioned_session-complete/05-what-if-loops-and-improvements/NEXUS-WHAT-IF-LOOP-2.md
A nexus-0186_2026-06-27_unversioned_session-complete/05-what-if-loops-and-improvements/NEXUS-WHAT-IF-LOOP.md
A nexus-0186_2026-06-27_unversioned_session-complete/05-what-if-loops-and-improvements/nexus-improvement-roadmap.spec
A nexus-0186_2026-06-27_unversioned_session-complete/06-copilot-migration/copilot-migration-and-new-capabilities.spec
A nexus-0186_2026-06-27_unversioned_session-complete/07-master-index/MASTER-SESSION-SPEC.md
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/README.md
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-full-behavior-kernel/alk-wire.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-full-behavior-kernel/kernel.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/attractor-landscape.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/behavior-module.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/cfr-mesh-bridge.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/codec-v2.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/codec.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/expression-engine.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/field-portrait.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/latent-model.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/signal-topology.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/trajectory-recorder.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/video-module.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/alk-video-and-expression/video-module.server.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/kern-v2-l4-external/gate.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/kern-v2-l4-external/grammar.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/kern-v2-l4-external/handshake.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/kern-v2-l4-external/identity.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/kern-v2-l4-external/sigma.js
A nexus-0186_2026-06-27_unversioned_session-complete/08-additional-source-modules/relational-private-signal/relational.js
```

### artifact — 0187 — 2026-06-27 15:24:52

- Archive: `nexus-0187_2026-06-27_v0.9.8-side_wired-2_declared-1.0.0.zip` (was `nexus-wired-2.zip`)
- SHA-256: `7cc6abc0f4d55f010d175c20f051b21adb0e8b6089da5f62ba66efdc258d87b7`, 0.2 MB, downloaded 2026-06-27 15:27:49
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.9.8 to keep the line in order
- Commit: `5e0ef576b9bb3b0e6e181c86b2c54955ec0412a7`, tag `snap-0187`
- Files in archive: 66. Changes against the build before it: **66 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0187_2026-06-27_v1.0.0_wired-2 | 66 | 0 | 0 |

```
A nexus-0187_2026-06-27_v1.0.0_wired-2/README.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/README.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/docs/clear-glass-seam.spec.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/fix-orchestrator.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/package.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/renderer/browser.html
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/renderer/settings.html
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/seam/registry-components.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/seam/watchdog-gates.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/siso/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/api/settings.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/contexts/manager.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/cookies/vault.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/copilot/bridge.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/core/bus.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/diagnostic/engine.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/dom/archaeology.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/driver/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/driver/url-listener.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/fingerprint/engine.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/gates/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/ipc/bridge.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/main/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/mesh/agent-mesh.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/preload/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/seam/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/sse/server.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/src/tls/proxy.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/test/bus.test.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/clear-glass-v3/test/watchdog.test.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/cos/src/api/server.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/cos/src/cli/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/cos/src/compartments/drivers.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/cos/src/foundation/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/cos/src/kernel/index.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/CHANGELOG.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/MANIFEST.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/README.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/ROADMAP.md
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/package.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/adaptive/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/api/server.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/behavior/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/bridge/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/dispatcher/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/hostile/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/observer/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/registry/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/replay/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/routing/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/selector/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/telemetry/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/src/types/index.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/adaptive.test.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/hostile.test.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/integration.test.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/replay.test.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/run.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tests/suite.ts
A nexus-0187_2026-06-27_v1.0.0_wired-2/erosmancer-os/tsconfig.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/package-lock.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/package.json
A nexus-0187_2026-06-27_v1.0.0_wired-2/test/integration.test.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/wire/eros-registry-components.js
A nexus-0187_2026-06-27_v1.0.0_wired-2/wire/nexus-wire.js
```

### Build 0.9.8-r45 — snap-0188 — 2026-06-28 03:15:40

- Archive: `nexus-0188_2026-06-28_v0.9.8-r45_modified-v3.zip` (was `Nexus-modified-v3.zip`)
- SHA-256: `dc2fee856efc2aec5c67addf19ff5553b1bb635e7b23ee37494c808610d566d1`, 4.6 MB, downloaded 2026-06-28 06:34:03
- Kind: full
- Commit: `aea64dac9699e743ceaece673af5372053e09df7`, tag `snap-0188`
- Files in archive: 806. Changes against the build before it: **56 added, 20 modified, 498 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 362 |
| cortex | 0 | 0 | 131 |
| clear-glass | 45 | 0 | 0 |
| guardian | 3 | 8 | 3 |
| (root) | 1 | 5 | 0 |
| copilot | 4 | 1 | 0 |
| lib | 1 | 2 | 0 |
| architect | 0 | 2 | 0 |
| docs | 2 | 0 | 0 |
| ui | 0 | 2 | 0 |
| cockpit | 0 | 0 | 1 |
| erosmancer | 0 | 0 | 1 |

```
M CHANGELOG.md
M autopilot.js
A blueprint-index.json
A clear-glass/README.md
A clear-glass/docs/clear-glass-seam.spec.md
A clear-glass/fix-orchestrator.js
A clear-glass/package-lock.json
A clear-glass/package.json
A clear-glass/powershell.exe
A clear-glass/registry-components.js
A clear-glass/renderer/browser.html
A clear-glass/renderer/settings.html
A clear-glass/seam/registry-components.js
A clear-glass/seam/watchdog-gates.js
A clear-glass/siso/index.js
A clear-glass/src/api/settings.js
A clear-glass/src/bookmarks/store.js
A clear-glass/src/contexts/manager.js
A clear-glass/src/contexts/session-headers.js
A clear-glass/src/cookies/vault.js
A clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/tools.js
A clear-glass/src/core/bus.js
A clear-glass/src/diagnostic/engine.js
A clear-glass/src/dom/archaeology.js
A clear-glass/src/driver/index.js
A clear-glass/src/driver/url-listener.js
A clear-glass/src/fingerprint/engine.js
A clear-glass/src/gates/index.js
A clear-glass/src/ipc/bridge.js
A clear-glass/src/main/index.js
A clear-glass/src/main/index.pre-userscripts.js
A clear-glass/src/mesh/agent-mesh.js
A clear-glass/src/options/store.js
A clear-glass/src/preload/index.js
A clear-glass/src/providers/gm-shim.js
A clear-glass/src/providers/host.js
A clear-glass/src/providers/registry.js
A clear-glass/src/rewind/engine.js
A clear-glass/src/seam/index.js
A clear-glass/src/sse/server.js
A clear-glass/src/tls/proxy.js
A clear-glass/src/userscripts/manager.js
A clear-glass/test/bus.test.js
A clear-glass/test/phase2.test.js
A clear-glass/test/watchdog.test.js
A clear-glass/wire/eros-registry-components.js
A clear-glass/wire/nexus-wire.js
D cockpit/forge.js
A copilot/adversarial.js
A copilot/analysis.js
A copilot/axiom-manager.js
A copilot/intuition.js
M copilot/server.js
D cortex/agent-tools/index.js
D cortex/agents/chatgpt/index.js
D cortex/agents/claude/index.js
D cortex/agents/gemini/index.js
D cortex/agents/index.js
D cortex/automation/engine.js
D cortex/automation/queue-manager.js
D cortex/behavioral-boundary/index.js
D cortex/boot.js
D cortex/cobalt.manifest.json
D cortex/contract/index.js
D cortex/core/raid/index.js
D cortex/core/raid/intelligence-bridge.js
D cortex/core/raid/snr-filter.js
D cortex/cortex-v2.js
D cortex/cortex.js
D cortex/ess-gap-engine.js
D cortex/flush-redundancy.js
D cortex/foundation/admin-server.js
D cortex/foundation/bus-log.js
D cortex/foundation/cobalt-core.js
D cortex/foundation/poll-registry.js
D cortex/foundation/store/FileRefs.js
D cortex/foundation/store/FileStore.js
D cortex/gap-loop.js
D cortex/gate/gap-finder.js
D cortex/healer/index.js
D cortex/heartbeat/index.js
D cortex/intelligence/dedup.js
D cortex/intelligence/index.js
D cortex/intelligence/intuition.js
D cortex/intelligence/macro-compiler.js
D cortex/intelligence/mastermind.js
D cortex/interaction-contract.json
D cortex/lab/index.js
D cortex/liminal-space/index.js
D cortex/memory/agent-memory.js
D cortex/memory/data-poller.js
D cortex/memory/jaa-db.js
D cortex/memory/working-memory.js
D cortex/nas/router.js
D cortex/orion/policy.js
D cortex/orion/record.js
D cortex/orion/sensor.js
D cortex/orion/verify.js
D cortex/registry-components.js
D cortex/replay/index.js
D cortex/self-heal/escalation.js
D cortex/self-heal/index.js
D cortex/self-heal/index.js.bak
D cortex/snapshot/divergence-watcher.js
D cortex/snapshot/index.js
D cortex/test/harness.js
D cortex/test/replay.test.js
D cortex/ui/index.html
D cortex/versionium/causality.js
D cortex/versionium/index.js
A docs/NEXUS-IMPROVEMENT-MAP.md
A docs/nexus-improvement-roadmap.spec
D erosmancer/erosmancer-os/erosmancer-os.zip
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/ledger.json
M guardian/memory_store/settings.json
A guardian/powershell.exe
M guardian/server.js
D guardian/ui/index.html
D guardian/userscript-ollama.js
A guardian/userscript-ollama.js.deprecated
D guardian/userscript-orchestrator.js
A guardian/userscript-orchestrator.js.deprecated
A lib/blueprint-index.js
M lib/cfr/ledger.js
M lib/contract-handshake.js
M nexus-connect.js
M nexus-heal-loop.js
M orchestrator.js
M ui/diagnostics/index.html
M ui/home/index.html
```

439 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r46 — snap-0189 — 2026-06-28 03:15:40

- Archive: `nexus-0189_2026-06-28_v0.9.8-r46_modified-v3-fixed.zip` (was `nexus-modified-v3-fixed.zip`)
- SHA-256: `3e7312efd7d99584fa4e7a2c227f44c67615e76cc1ce92800e17b5704be6c7c9`, 4 MB, downloaded 2026-06-28 07:31:41
- Kind: full
- Commit: `62131a15a7535e4e34c5210e84f98fad3e5c33c1`, tag `snap-0189`
- Files in archive: 718. Changes against the build before it: **0 added, 0 modified, 88 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 0 | 44 |
| architect | 0 | 0 | 15 |
| bridge | 0 | 0 | 12 |
| cli | 0 | 0 | 11 |
| auth | 0 | 0 | 5 |
| cockpit | 0 | 0 | 1 |

```
D architect/compile-route.js
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
D architect/docs/ARCHITECT-SPEC-v1.1.0.md
D architect/package.json
D architect/registry-components.js
D architect/service.js
D architect/src/hooks/Registry.js
D architect/src/hooks/sync-from-component-registry.js
D architect/src/spec/Blueprint.js
D architect/src/ui/alk-lattice.html
D architect/src/ui/arch-builder.html
D architect/src/ui/architect_universe.svg
D architect/src/ui/layered-snr-gates-axioms.svg
D architect/src/ui/spec-builder.html
D auth/client.js
D auth/index.js
D auth/keys/nexus-private.pem
D auth/keys/nexus-public.pem
D auth/policy.json
D bridge/causal/expectation.js
D bridge/causal/graph.js
D bridge/causal/ledger.js
D bridge/causal/projections.js
D bridge/causal/schema.js
D bridge/causal/server.js
D bridge/identity.js
D bridge/index.js
D bridge/registry-components.js
D bridge/registry.js
D bridge/router.js
D bridge/types.js
D clear-glass/README.md
D clear-glass/docs/clear-glass-seam.spec.md
D clear-glass/fix-orchestrator.js
D clear-glass/package-lock.json
D clear-glass/package.json
D clear-glass/powershell.exe
D clear-glass/renderer/browser.html
D clear-glass/renderer/settings.html
D clear-glass/seam/registry-components.js
D clear-glass/seam/watchdog-gates.js
D clear-glass/siso/index.js
D clear-glass/src/api/settings.js
D clear-glass/src/bookmarks/store.js
D clear-glass/src/contexts/manager.js
D clear-glass/src/contexts/session-headers.js
D clear-glass/src/cookies/vault.js
D clear-glass/src/copilot/bridge.js
D clear-glass/src/copilot/tools.js
D clear-glass/src/core/bus.js
D clear-glass/src/diagnostic/engine.js
D clear-glass/src/dom/archaeology.js
D clear-glass/src/driver/index.js
D clear-glass/src/driver/url-listener.js
D clear-glass/src/fingerprint/engine.js
D clear-glass/src/gates/index.js
D clear-glass/src/ipc/bridge.js
D clear-glass/src/main/index.js
D clear-glass/src/main/index.pre-userscripts.js
D clear-glass/src/mesh/agent-mesh.js
D clear-glass/src/options/store.js
D clear-glass/src/preload/index.js
D clear-glass/src/providers/gm-shim.js
D clear-glass/src/providers/host.js
D clear-glass/src/providers/registry.js
D clear-glass/src/rewind/engine.js
D clear-glass/src/seam/index.js
D clear-glass/src/sse/server.js
D clear-glass/src/tls/proxy.js
D clear-glass/src/userscripts/manager.js
D clear-glass/test/bus.test.js
D clear-glass/test/phase2.test.js
D clear-glass/test/watchdog.test.js
D clear-glass/wire/eros-registry-components.js
D clear-glass/wire/nexus-wire.js
D cli/axiom.js
D cli/boot-systems.js
D cli/cfr-debug.js
D cli/co-pilot.js
D cli/diagnose.js
D cli/nexus-cli.js
D cli/nexus-repl-descriptors.js
D cli/nexus-repl.js
D cli/nexus.js
D cli/run-supervised.js
D cli/session.js
D cockpit/core.js
```

### empty — 0190 — 2026-06-28 07:35:14

- Archive: `nexus-0190_2026-06-28_v0.9.8_modified-v3-fixed-1_empty.zip` (was `nexus-modified-v3-fixed-1.zip`)
- SHA-256: `0c1e72e877a28ccf3c6058a6110293f35d9d33fc357ba4b2de11a85d19a5aa59`, 0.1 MB, downloaded 2026-06-28 07:35:14
- Kind: empty (no commit)
- Identical copy: `nexus-0190_2026-06-28_v0.9.8_modified-v3-fixed-2_dup1_empty.zip` (was `nexus-modified-v3-fixed-2.zip`)
- Identical copy: `nexus-0190_2026-06-28_v0.9.8_modified-v3-fixed-5_dup2_empty.zip` (was `nexus-modified-v3-fixed-5.zip`)

### Build 0.9.8-r47 — snap-0191 — 2026-06-28 07:52:16

- Archive: `nexus-0191_2026-06-28_v0.9.8-r47_modified-v3-fixed-3.zip` (was `nexus-modified-v3-fixed-3.zip`)
- SHA-256: `ac3a450a394fe6b401a6fbc45b57108f2615ee046545752cdfcbb959692199d5`, 4.6 MB, downloaded 2026-06-28 07:52:38
- Kind: full
- Commit: `94e3062a0efa11a6f7bf1bf9338f34b510941760`, tag `snap-0191`
- Files in archive: 806. Changes against the build before it: **88 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 44 | 0 | 0 |
| architect | 15 | 0 | 0 |
| bridge | 12 | 0 | 0 |
| cli | 11 | 0 | 0 |
| auth | 5 | 0 | 0 |
| cockpit | 1 | 0 | 0 |

```
A architect/compile-route.js
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
A architect/docs/ARCHITECT-SPEC-v1.1.0.md
A architect/package.json
A architect/registry-components.js
A architect/service.js
A architect/src/hooks/Registry.js
A architect/src/hooks/sync-from-component-registry.js
A architect/src/spec/Blueprint.js
A architect/src/ui/alk-lattice.html
A architect/src/ui/arch-builder.html
A architect/src/ui/architect_universe.svg
A architect/src/ui/layered-snr-gates-axioms.svg
A architect/src/ui/spec-builder.html
A auth/client.js
A auth/index.js
A auth/keys/nexus-private.pem
A auth/keys/nexus-public.pem
A auth/policy.json
A bridge/causal/expectation.js
A bridge/causal/graph.js
A bridge/causal/ledger.js
A bridge/causal/projections.js
A bridge/causal/schema.js
A bridge/causal/server.js
A bridge/identity.js
A bridge/index.js
A bridge/registry-components.js
A bridge/registry.js
A bridge/router.js
A bridge/types.js
A clear-glass/README.md
A clear-glass/docs/clear-glass-seam.spec.md
A clear-glass/fix-orchestrator.js
A clear-glass/package-lock.json
A clear-glass/package.json
A clear-glass/powershell.exe
A clear-glass/renderer/browser.html
A clear-glass/renderer/settings.html
A clear-glass/seam/registry-components.js
A clear-glass/seam/watchdog-gates.js
A clear-glass/siso/index.js
A clear-glass/src/api/settings.js
A clear-glass/src/bookmarks/store.js
A clear-glass/src/contexts/manager.js
A clear-glass/src/contexts/session-headers.js
A clear-glass/src/cookies/vault.js
A clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/tools.js
A clear-glass/src/core/bus.js
A clear-glass/src/diagnostic/engine.js
A clear-glass/src/dom/archaeology.js
A clear-glass/src/driver/index.js
A clear-glass/src/driver/url-listener.js
A clear-glass/src/fingerprint/engine.js
A clear-glass/src/gates/index.js
A clear-glass/src/ipc/bridge.js
A clear-glass/src/main/index.js
A clear-glass/src/main/index.pre-userscripts.js
A clear-glass/src/mesh/agent-mesh.js
A clear-glass/src/options/store.js
A clear-glass/src/preload/index.js
A clear-glass/src/providers/gm-shim.js
A clear-glass/src/providers/host.js
A clear-glass/src/providers/registry.js
A clear-glass/src/rewind/engine.js
A clear-glass/src/seam/index.js
A clear-glass/src/sse/server.js
A clear-glass/src/tls/proxy.js
A clear-glass/src/userscripts/manager.js
A clear-glass/test/bus.test.js
A clear-glass/test/phase2.test.js
A clear-glass/test/watchdog.test.js
A clear-glass/wire/eros-registry-components.js
A clear-glass/wire/nexus-wire.js
A cli/axiom.js
A cli/boot-systems.js
A cli/cfr-debug.js
A cli/co-pilot.js
A cli/diagnose.js
A cli/nexus-cli.js
A cli/nexus-repl-descriptors.js
A cli/nexus-repl.js
A cli/nexus.js
A cli/run-supervised.js
A cli/session.js
A cockpit/core.js
```

### Build 0.9.8-r48 — snap-0192 — 2026-06-28 07:54:44

- Archive: `nexus-0192_2026-06-28_v0.9.8-r48_modified-v3-fixed-4.zip` (was `nexus-modified-v3-fixed-4.zip`)
- SHA-256: `a04dad3519fcffa6afaaf9b0e50f08a971af4bbc719991df37baa29d976a6590`, 4.6 MB, downloaded 2026-06-28 07:55:44
- Kind: full
- Commit: `66e796df6dfc543656bf068bdc6ba217f3a5ac84`, tag `snap-0192`
- Files in archive: 806. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
```

### Build 0.9.8-r49 — snap-0193 — 2026-06-28 08:35:16

- Archive: `nexus-0193_2026-06-28_v0.9.8-r49_modified-v3-fixed-6.zip` (was `nexus-modified-v3-fixed-6.zip`)
- SHA-256: `a1508c561374a6d844ca862cf77ebcf277a329e2b94f698fc0acd76500d985be`, 4.6 MB, downloaded 2026-06-28 08:55:45
- Kind: full
- Commit: `1439cac701877e289295d6dc30ac1fb9a4c798de`, tag `snap-0193`
- Files in archive: 806. Changes against the build before it: **0 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 3 | 0 |
| bridge | 0 | 2 | 0 |
| service | 0 | 1 | 0 |

```
M bridge/identity.js
M bridge/registry.js
M clear-glass/src/api/settings.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M service/nexus-diagnostic.js
```

### Build 0.9.8-r50 — snap-0194 — 2026-06-28 09:57:00

- Archive: `nexus-0194_2026-06-28_v0.9.8-r50_modified-v3-fixed-1.zip` (was `nexus-modified-v3-fixed (1).zip`)
- SHA-256: `5a33a865a326ac1b24b43a1c373579a8fcefca4e2b4197dc5881353a310c938d`, 4.6 MB, downloaded 2026-06-28 10:16:07
- Kind: full
- Commit: `e205fc6f03acb43ff08ebe1cf1af124ea7dfc2bd`, tag `snap-0194`
- Files in archive: 810. Changes against the build before it: **4 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 1 | 2 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 1 | 0 | 0 |
| bridge | 0 | 1 | 0 |
| cortex | 1 | 0 | 0 |
| service | 0 | 1 | 0 |

```
M bridge/identity.js
A cortex/registry-components.js
M lib/cfr/field.js
A lib/file-integrity.js
A registry-components.cortex.js
M service/nexus-diagnostic.js
M ui/blueprint-builder/index.html
A ui/blueprint-builder/index.html.bak
M ui/tv-shell/index.html
```

### Build 0.9.8-r51 — snap-0195 — 2026-06-28 10:25:44

- Archive: `nexus-0195_2026-06-28_v0.9.8-r51_copilot-complete.zip` (was `nexus-copilot-complete.zip`)
- SHA-256: `a1690ac77e468048420c26ba95a4aa483b2217fcbfdeca8b77adfce0a1b304dd`, 4.3 MB, downloaded 2026-06-28 10:36:37
- Kind: full
- Commit: `6418138472fbb534237266211d805c6744975ee1`, tag `snap-0195`
- Identical copy: `nexus-0195_2026-06-28_v0.9.8-r51_copilot-complete-1_dup1.zip` (was `nexus-copilot-complete-1.zip`)
- Files in archive: 808. Changes against the build before it: **0 added, 9 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 5 | 0 |
| (root) | 0 | 1 | 1 |
| copilot | 0 | 2 | 0 |
| clear-glass | 0 | 0 | 1 |
| lib | 0 | 1 | 0 |

```
D clear-glass/powershell.exe
M copilot/registry-components.js
M copilot/server.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/request-handler.js
M orchestrator.js
D powershell.exe
```

### Build 0.9.8-r52 — snap-0196 — 2026-06-28 16:58:42

- Archive: `nexus-0196_2026-06-28_v0.9.8-r52_v4-complete.zip` (was `nexus-v4-complete.zip`)
- SHA-256: `cbbacf14a9fb65ddfe6135edb7e5491ac759b3be56f274a74959a719d74b6e99`, 3.7 MB, downloaded 2026-06-28 17:08:40
- Kind: full
- Commit: `f58579de9bf8eceaa5cea0fc8b2651ab118b270a`, tag `snap-0196`
- Files in archive: 803. Changes against the build before it: **7 added, 4 modified, 12 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 0 | 12 |
| cortex | 5 | 0 | 0 |
| clear-glass | 1 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A clear-glass/powershell.exe
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
M cli/co-pilot.js
A cortex/boot.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A cortex/memory/jaa-db.js
D guardian/memory_store/artifacts.json
D guardian/memory_store/cfr_state.json
D guardian/memory_store/chat_log.json
D guardian/memory_store/event_log.json
D guardian/memory_store/event_log.jsonl
D guardian/memory_store/event_stats.json
D guardian/memory_store/gaps.json
D guardian/memory_store/jobs.json
D guardian/memory_store/ledger.json
D guardian/memory_store/queue_compartments.json
D guardian/memory_store/seam_sessions.json
D guardian/memory_store/settings.json
A powershell.exe
M service/nexus-diagnostic.js
```

### Build 0.9.8-r53 — snap-0197 — 2026-06-28 17:34:58

- Archive: `nexus-0197_2026-06-28_v0.9.8-r53_consolidated-2.zip` (was `nexus-consolidated (2).zip`)
- SHA-256: `026287e8baab1875b6b3b0aae37c8c8cd59d4358c67109e6771f264affa10e59`, 4.6 MB, downloaded 2026-06-28 22:58:13
- Kind: full
- Commit: `ecc74a71a6216b6a07bd8282a6f35278af3382e8`, tag `snap-0197`
- Files in archive: 822. Changes against the build before it: **19 added, 14 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 6 | 14 | 0 |
| guardian | 12 | 0 | 0 |
| (root) | 1 | 0 | 0 |

```
A CONSOLIDATION-NOTES.md
A docs/NEXUS-INTEGRATION-MAP.md
A docs/NEXUS-PHASE-MAP-CROSSREF.md
M docs/NEXUS-PHASE-MAP.md
M docs/SESSION-CHANGELOG.md
A docs/SOVEREIGN-SPEC-AUDIT-2026-06-28.md
M docs/architect.spec
M docs/bridge.spec
M docs/cortex.spec
M docs/diagnostic.spec
M docs/emerge.spec
A docs/eravos.spec
M docs/escalation.spec
M docs/grammar-engine.spec
M docs/guardian.spec
M docs/idearium.spec
A docs/nexus-analysis-module-foundation.spec
M docs/nexus-improvement-roadmap.spec
A docs/nexus-system-foundation-addendum-v1.1.0.spec
M docs/replay-engine.spec
M docs/snapshot.spec
A guardian/memory_store/artifacts.json
A guardian/memory_store/cfr_state.json
A guardian/memory_store/chat_log.json
A guardian/memory_store/event_log.json
A guardian/memory_store/event_log.jsonl
A guardian/memory_store/event_stats.json
A guardian/memory_store/gaps.json
A guardian/memory_store/jobs.json
A guardian/memory_store/ledger.json
A guardian/memory_store/queue_compartments.json
A guardian/memory_store/seam_sessions.json
A guardian/memory_store/settings.json
```

### Build 0.9.8-r54 — snap-0198 — 2026-06-28 23:01:30

- Archive: `nexus-0198_2026-06-28_v0.9.8-r54_consolidated-patched.zip` (was `nexus-consolidated-patched.zip`)
- SHA-256: `21eebf755b9fc726fe7e89cf17c117a7fae7e90c51a9b28551f1c7f44aa36e4f`, 4.6 MB, downloaded 2026-06-28 23:06:19
- Kind: full
- Commit: `d960065cb611569a8c8c5b79865a717194b782c6`, tag `snap-0198`
- Identical copy: `nexus-0198_2026-06-28_v0.9.8-r54_consolidated-patched-1_dup1.zip` (was `nexus-consolidated-patched-1.zip`)
- Identical copy: `nexus-0198_2026-06-28_v0.9.8-r54_consolidated-patched-2_dup2.zip` (was `nexus-consolidated-patched-2.zip`)
- Files in archive: 821. Changes against the build before it: **5 added, 26 modified, 6 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 14 | 6 |
| tests | 4 | 0 | 0 |
| clear-glass | 0 | 3 | 0 |
| cos | 0 | 3 | 0 |
| bridge | 0 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| eravos | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |

```
M bridge/index.js
M bridge/server.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/sse/server.js
M copilot/intuition.js
M copilot/server.js
M cos/host/event-bus.js
M cos/host/index.js
M cos/siso/Stream.js
D docs/NEXUS-INTEGRATION-MAP.md
D docs/NEXUS-PHASE-MAP-CROSSREF.md
M docs/NEXUS-PHASE-MAP.md
M docs/SESSION-CHANGELOG.md
D docs/SOVEREIGN-SPEC-AUDIT-2026-06-28.md
M docs/architect.spec
M docs/bridge.spec
M docs/cortex.spec
M docs/diagnostic.spec
M docs/emerge.spec
D docs/eravos.spec
M docs/escalation.spec
M docs/grammar-engine.spec
M docs/guardian.spec
M docs/idearium.spec
D docs/nexus-analysis-module-foundation.spec
M docs/nexus-improvement-roadmap.spec
D docs/nexus-system-foundation-addendum-v1.1.0.spec
M docs/replay-engine.spec
M docs/snapshot.spec
M eravos/server.js
A lib/error-log.js
M ollama/server.js
A tests/bridge-handshake-resilience.test.js
A tests/error-log.test.js
A tests/modules/bridge-handshake.test.js
A tests/modules/error-log.test.js
```

### Build 0.9.8-r55 — snap-0199 — 2026-06-29 05:34:20

- Archive: `nexus-0199_2026-06-29_v0.9.8-r55_consolidated-1.zip` (was `nexus-consolidated (1).zip`)
- SHA-256: `de1d7ff6e1a89342fa3f40775cbe1a84b2fd4f6d32113cef2b8b99c094010b52`, 4.7 MB, downloaded 2026-06-29 05:42:25
- Kind: full
- Commit: `1966e405263203ebc55726508fef81b5dd5f87ab`, tag `snap-0199`
- Files in archive: 833. Changes against the build before it: **17 added, 36 modified, 5 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 10 | 18 | 0 |
| hooks | 4 | 2 | 0 |
| copilot | 1 | 4 | 0 |
| tests | 0 | 0 | 4 |
| clear-glass | 0 | 3 | 0 |
| cortex | 2 | 1 | 0 |
| cos | 0 | 3 | 0 |
| bridge | 0 | 2 | 0 |
| lib | 0 | 1 | 1 |
| eravos | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M bridge/index.js
M bridge/server.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/sse/server.js
A copilot/adaptive-fulfillment.js
M copilot/intuition.js
M copilot/module-builder.js
M copilot/registry-components.js
M copilot/server.js
M cortex/boot.js
A cortex/contract/index.js
A cortex/core/raid/index.js
M cos/host/event-bus.js
M cos/host/index.js
M cos/siso/Stream.js
M docs/AXIOMS-PHASE-MAP.md
M docs/AXIOMS-v1.0.md
M docs/AXIOMS-v2.0.md
A docs/AXIOMS-v3.0.md
A docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md
A docs/NEXUS-INTEGRATION-MAP.md
A docs/NEXUS-PHASE-MAP-CROSSREF.md
M docs/NEXUS-PHASE-MAP.md
M docs/SESSION-CHANGELOG.md
A docs/SOVEREIGN-SPEC-AUDIT-2026-06-28.md
A docs/SPEC-REGISTRY.md
M docs/architect.spec
M docs/bridge.spec
A docs/copilot-migration-and-new-capabilities.spec
M docs/cortex.spec
M docs/diagnostic.spec
M docs/emerge.spec
A docs/eravos.spec
M docs/escalation.spec
M docs/grammar-engine.spec
M docs/guardian.spec
M docs/idearium.spec
A docs/nexus-analysis-module-foundation.spec
M docs/nexus-improvement-roadmap.spec
A docs/nexus-system-foundation-addendum-v1.1.0.spec
M docs/nexus-system-foundation.spec
M docs/replay-engine.spec
M docs/snapshot.spec
M eravos/server.js
A hooks/copilot.hooks.js
A hooks/emerge.hooks.js
A hooks/eravos.hooks.js
M hooks/idearium.hooks.js
M hooks/index.js
A hooks/ollama.hooks.js
D lib/error-log.js
M lib/request-handler.js
M ollama/server.js
D tests/bridge-handshake-resilience.test.js
D tests/error-log.test.js
D tests/modules/bridge-handshake.test.js
D tests/modules/error-log.test.js
```

### Build 0.9.8-r56 — snap-0200 — 2026-06-29 06:22:08

- Archive: `nexus-0200_2026-06-29_v0.9.8-r56_consolidated-final.zip` (was `nexus-consolidated-final.zip`)
- SHA-256: `3c7ae8123cc25ad262eafdf3736f8abbab149bdaf07143ef27282f8b01865207`, 4.8 MB, downloaded 2026-06-29 06:41:17
- Kind: full
- Commit: `83ecf9fce7735b24342627bc48de84751803b346`, tag `snap-0200`
- Identical copy: `nexus-0200_2026-06-29_v0.9.8-r56_consolidated-final-1_dup1.zip` (was `nexus-consolidated-final-1.zip`)
- Files in archive: 875. Changes against the build before it: **42 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 23 | 0 | 0 |
| clear-glass | 4 | 5 | 0 |
| tests | 7 | 1 | 0 |
| living-glass | 6 | 0 | 0 |
| copilot | 0 | 5 | 0 |
| cos | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| bridge | 0 | 2 | 0 |
| eravos | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |
| service | 1 | 0 | 0 |

```
M autopilot.js
M bridge/index.js
M bridge/server.js
M clear-glass/package.json
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
A clear-glass/src/ledger/causal.js
A clear-glass/src/ledger/engine.js
A clear-glass/src/ledger/routes.js
M clear-glass/src/main/index.js
M clear-glass/src/sse/server.js
A clear-glass/test/ledger.test.js
M copilot/adaptive-fulfillment.js
M copilot/intuition.js
M copilot/module-builder.js
M copilot/registry-components.js
M copilot/server.js
M cos/host/event-bus.js
M cos/host/index.js
M cos/siso/Stream.js
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/errors/error_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/copilot/errors/error_log.jsonl
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/settings.json
A data/eravos/errors/error_log.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-06-29.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-06-29.jsonl
A data/ledger/forge/forge.patch/2026-06-29.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-06-29.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-06-29.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-06-29.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-06-29.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-06-29.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-06-29.jsonl
A data/ledger/test/test.echo.ping/2026-06-29.jsonl
A data/ledger/test/test.event.check/2026-06-29.jsonl
A data/ledger/test/test.widget.panel/2026-06-29.jsonl
A data/ollama/errors/error_log.jsonl
M eravos/server.js
A lib/error-log.js
A living-glass/index.js
A living-glass/registry/components.js
A living-glass/src/autopilot-broadcast.js
A living-glass/src/diagnostic-fire-engine.js
A living-glass/src/event-ledger.js
A living-glass/src/field-monitor.js
M ollama/server.js
M orchestrator.js
A service/living-glass-service.js
A tests/bridge-handshake-resilience.test.js
A tests/error-log.test.js
A tests/modules/adaptive-fulfillment.test.js
A tests/modules/bridge-handshake.test.js
A tests/modules/error-log.test.js
A tests/modules/living-glass.test.js
A tests/modules/raid.test.js
M tests/modules/run-all.js
```

### Build 0.9.8-r57 — snap-0201 — 2026-06-29 12:35:04

- Archive: `nexus-0201_2026-06-29_v0.9.8-r57_consolidated-3.zip` (was `nexus-consolidated (3).zip`)
- SHA-256: `9fa2d0d231af7ecbc92020830ff64b15d8b46c857d37147b3f58ae0025286d48`, 4.7 MB, downloaded 2026-06-29 12:52:41
- Kind: full
- Commit: `e4212f8a2e555bd538d0890f6b3b414d5bfe3916`, tag `snap-0201`
- Identical copy: `nexus-0201_2026-06-29_v0.9.8-r57_consolidated-4_dup1.zip` (was `nexus-consolidated (4).zip`)
- Identical copy: `nexus-0201_2026-06-29_v0.9.8-r57_consolidated-5_dup2.zip` (was `nexus-consolidated (5).zip`)
- Identical copy: `nexus-0201_2026-06-29_v0.9.8-r57_consolidated-6_dup3.zip` (was `nexus-consolidated (6).zip`)
- Identical copy: `nexus-0201_2026-06-29_v0.9.8-r57_consolidated-7_dup4.zip` (was `nexus-consolidated (7).zip`)
- Files in archive: 847. Changes against the build before it: **14 added, 27 modified, 42 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 23 |
| unintegrated | 12 | 0 | 0 |
| clear-glass | 0 | 6 | 4 |
| tests | 0 | 1 | 7 |
| living-glass | 0 | 0 | 6 |
| copilot | 0 | 5 | 0 |
| docs | 1 | 3 | 0 |
| cos | 0 | 3 | 0 |
| lib | 1 | 0 | 1 |
| (root) | 0 | 2 | 0 |
| bridge | 0 | 2 | 0 |
| ui | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 0 | 1 |
| guardian | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |

```
M autopilot.js
M bridge/index.js
M bridge/server.js
M clear-glass/package.json
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
D clear-glass/src/ledger/causal.js
D clear-glass/src/ledger/engine.js
D clear-glass/src/ledger/routes.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
M clear-glass/src/sse/server.js
D clear-glass/test/ledger.test.js
M copilot/adaptive-fulfillment.js
M copilot/intuition.js
M copilot/module-builder.js
M copilot/registry-components.js
M copilot/server.js
M cortex/boot.js
M cos/host/event-bus.js
M cos/host/index.js
M cos/siso/Stream.js
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/errors/error_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/copilot/errors/error_log.jsonl
D data/cortex/memory/component_ledger.json
D data/cortex/memory/event_log.json
D data/cortex/memory/settings.json
D data/eravos/errors/error_log.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-06-29.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-06-29.jsonl
D data/ledger/forge/forge.patch/2026-06-29.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-06-29.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-06-29.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-06-29.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-06-29.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-06-29.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-06-29.jsonl
D data/ledger/test/test.echo.ping/2026-06-29.jsonl
D data/ledger/test/test.event.check/2026-06-29.jsonl
D data/ledger/test/test.widget.panel/2026-06-29.jsonl
D data/ollama/errors/error_log.jsonl
M docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md
M docs/NEXUS-PHASE-MAP.md
M docs/SPEC-REGISTRY.md
A docs/nexus-decomposition-architecture.spec
M eravos/server.js
M guardian/server.js
D lib/error-log.js
A lib/system-manifest.js
D living-glass/index.js
D living-glass/registry/components.js
D living-glass/src/autopilot-broadcast.js
D living-glass/src/diagnostic-fire-engine.js
D living-glass/src/event-ledger.js
D living-glass/src/field-monitor.js
M ollama/server.js
M orchestrator.js
D service/living-glass-service.js
D tests/bridge-handshake-resilience.test.js
D tests/error-log.test.js
D tests/modules/adaptive-fulfillment.test.js
D tests/modules/bridge-handshake.test.js
D tests/modules/error-log.test.js
D tests/modules/living-glass.test.js
D tests/modules/raid.test.js
M tests/modules/run-all.js
M ui/tv-shell/spotlight/spotlight.js
A unintegrated/README.md
A unintegrated/rfr2-nexus/adapter-sandbox/index.js
A unintegrated/rfr2-nexus/clip/index.js
A unintegrated/rfr2-nexus/compress/index.js
A unintegrated/rfr2-nexus/context/index.js
A unintegrated/rfr2-nexus/delta/index.js
A unintegrated/rfr2-nexus/enforcement/index.js
A unintegrated/rfr2-nexus/identity/index.js
A unintegrated/rfr2-nexus/observer/index.js
A unintegrated/rfr2-nexus/query/index.js
A unintegrated/rfr2-nexus/time/index.js
A unintegrated/rfr2-nexus/version-gate/index.js
```

### Build 0.9.8-r58 — snap-0202 — 2026-06-29 13:28:10

- Archive: `nexus-0202_2026-06-29_v0.9.8-r58_consolidated-8.zip` (was `nexus-consolidated (8).zip`)
- SHA-256: `d357146ca9d5a13583e2271cca56c1112bbaa083b77fec0e501ed9bdbb646cfb`, 4.7 MB, downloaded 2026-06-29 13:29:21
- Kind: full
- Commit: `83ea10bb1264dc46b9934524260afe14a241ed74`, tag `snap-0202`
- Files in archive: 848. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 0 | 0 |

```
A docs/eravos-agnostic-canvas.spec
```

### Build 0.9.8-r59 — snap-0203 — 2026-06-29 13:41:00

- Archive: `nexus-0203_2026-06-29_v0.9.8-r59_consolidated-9.zip` (was `nexus-consolidated (9).zip`)
- SHA-256: `85c14b23a6f954000b8b8b1b68004c7ee7b5d0849fb42ea4d7a0491d04c5e349`, 4.7 MB, downloaded 2026-06-29 13:41:37
- Kind: full
- Commit: `bfbc77f73b28e0afa9ca8d3e62ade4b9963292be`, tag `snap-0203`
- Identical copy: `nexus-0203_2026-06-29_v0.9.8-r59_consolidated-10_dup1.zip` (was `nexus-consolidated (10).zip`)
- Files in archive: 850. Changes against the build before it: **2 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 2 | 1 | 0 |

```
M docs/SPEC-REGISTRY.md
A docs/cortex-intelligence.spec
A docs/versionium.spec
```

### Build 0.9.8-r60 — snap-0204 — 2026-06-29 16:08:10

- Archive: `nexus-0204_2026-06-29_v0.9.8-r60_consolidated-11.zip` (was `nexus-consolidated (11).zip`)
- SHA-256: `e7a0a4003e0f9c24663284b7e979ac8272d24c82be3c97c72e947a30e6f4081a`, 4.8 MB, downloaded 2026-06-29 16:08:59
- Kind: full
- Commit: `a6074f5f09d26a9c38219e073c9fa5c4e8f5aa8e`, tag `snap-0204`
- Files in archive: 853. Changes against the build before it: **3 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 3 | 0 | 0 |
| docs | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M docs/NEXUS-PHASE-MAP.md
A tests/modules/clear-glass-pressure.test.js
A tests/modules/copilot-handshake-dispatch.test.js
A tests/modules/guardian-cfr-proxy.test.js
M ui/tv-shell/spotlight/spotlight.js
```

### Build 0.9.8-r61 — snap-0205 — 2026-06-29 16:09:34

- Archive: `nexus-0205_2026-06-29_v0.9.8-r61_consolidated-12.zip` (was `nexus-consolidated (12).zip`)
- SHA-256: `4bc7c0a8b30fab031dd91712db9330187bc7080ff6f7d8fb3f7405e6d9cb53d5`, 4.8 MB, downloaded 2026-06-29 16:27:44
- Kind: full
- Commit: `ddadd98f5bb49fa0f87736f1b29f9e86ab7294c9`, tag `snap-0205`
- Files in archive: 854. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| skills | 1 | 0 | 0 |

```
A skills/james-brooks.skill
```

### Build 0.9.8-r62 — snap-0206 — 2026-06-29 16:33:38

- Archive: `nexus-0206_2026-06-29_v0.9.8-r62_consolidated-13.zip` (was `nexus-consolidated (13).zip`)
- SHA-256: `27836678bf99dc379787561f23142caa5d53c7a0240de9b0c4dc3a9a53828622`, 4.8 MB, downloaded 2026-06-29 16:47:51
- Kind: full
- Commit: `9a3970e26e785e7784f83bd0b9af12e4c4a5919c`, tag `snap-0206`
- Identical copy: `nexus-0206_2026-06-29_v0.9.8-r62_consolidated-14_dup1.zip` (was `nexus-consolidated (14).zip`)
- Files in archive: 854. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/preload/index.js
M copilot/server.js
```

### empty — 0207 — 2026-06-29 16:51:36

- Archive: `nexus-0207_2026-06-29_v0.9.8_consolidated-15_empty.zip` (was `nexus-consolidated (15).zip`)
- SHA-256: `e663c7f3f3e9d9d1fcae1e48c3848d01976902f78c7069264cea64dac8184223`, 0 MB, downloaded 2026-06-29 16:51:36
- Kind: empty (no commit)

### Build 0.9.8-r63 — snap-0208 — 2026-06-29 20:15:58

- Archive: `nexus-0208_2026-06-29_v0.9.8-r63_consolidated-16.zip` (was `nexus-consolidated (16).zip`)
- SHA-256: `4877aa8c9007c5c8256181f7d5405a8400fd312f2c4f3575f6f3564c3289d922`, 4.8 MB, downloaded 2026-06-29 20:19:44
- Kind: full
- Commit: `39cbb4920ee3e72ab90c2c11844a3d69d0f98b86`, tag `snap-0208`
- Identical copy: `nexus-0208_2026-06-29_v0.9.8-r63_consolidated-18_dup1.zip` (was `nexus-consolidated (18).zip`)
- Identical copy: `nexus-0208_2026-06-29_v0.9.8-r63_consolidated-19_dup2.zip` (was `nexus-consolidated (19).zip`)
- Files in archive: 854. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M guardian/server.js
```

### empty — 0209 — 2026-06-29 21:09:23

- Archive: `nexus-0209_2026-06-29_v0.9.8_consolidated-17_empty.zip` (was `nexus-consolidated (17).zip`)
- SHA-256: `29db1e17b8a2018de7ae95a9823ba54d95d0dcd70dc320b4ad5487a48f36558f`, 0 MB, downloaded 2026-06-29 21:09:23
- Kind: empty (no commit)

### Build 0.9.8-r64 — snap-0210 — 2026-06-29 23:08:02

- Archive: `nexus-0210_2026-06-29_v0.9.8-r64_consolidated-20.zip` (was `nexus-consolidated (20).zip`)
- SHA-256: `737d2382031ff107915c368abcdc87be4a90d6576d942c31e8ed99ee45deccea`, 4.8 MB, downloaded 2026-06-29 23:09:05
- Kind: full
- Commit: `9bb429819f97e61d6597186ac89a7e2c6c48f374`, tag `snap-0210`
- Files in archive: 854. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
```

### Build 0.9.8-r65 — snap-0211 — 2026-06-29 23:11:40

- Archive: `nexus-0211_2026-06-29_v0.9.8-r65_consolidated-21.zip` (was `nexus-consolidated (21).zip`)
- SHA-256: `6bdf92391ab14cae89c4ebf592018c6d485e1c73c4d412d2b6d00d280147576f`, 4.8 MB, downloaded 2026-06-29 23:12:43
- Kind: full
- Commit: `849d43330f53b1877a174c7568ee136a557c3d65`, tag `snap-0211`
- Files in archive: 854. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |

```
M autopilot.js
M clear-glass/src/providers/host.js
```

### Build 0.9.8-r66 — snap-0212 — 2026-06-30 00:45:28

- Archive: `nexus-0212_2026-06-30_v0.9.8-r66_consolidated-23.zip` (was `nexus-consolidated (23).zip`)
- SHA-256: `5a0bf4078ee0ba5514cf892b67bc35117eb47efec3492eae2e11ff5b3256a7b5`, 4.8 MB, downloaded 2026-06-30 00:48:18
- Kind: full
- Commit: `4e058857d89cfb749f8747193b85ccc967df214a`, tag `snap-0212`
- Files in archive: 857. Changes against the build before it: **3 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 4 | 0 |
| data | 2 | 0 | 0 |
| tests | 1 | 0 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/preload/index.js
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A tests/modules/clear-glass-indicators.test.js
```

### Build 0.9.8-r67 — snap-0213 — 2026-06-30 11:24:22

- Archive: `nexus-0213_2026-06-30_v0.9.8-r67_consolidated-22.zip` (was `nexus-consolidated (22).zip`)
- SHA-256: `fac3a759215d188318f2ac39e034dfb7c5829f7287b3b72a7355975fe2773bcc`, 4.8 MB, downloaded 2026-06-30 11:25:45
- Kind: full
- Commit: `844bcb1a76798dca322e504166a49629390a2e95`, tag `snap-0213`
- Files in archive: 858. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 2 | 0 |
| clear-glass | 1 | 0 | 0 |

```
A clear-glass/siso/package.json
M docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md
M docs/NEXUS-PHASE-MAP.md
```

### Build 0.9.8-r68 — snap-0214 — 2026-06-30 11:29:44

- Archive: `nexus-0214_2026-06-30_v0.9.8-r68_consolidated-24.zip` (was `nexus-consolidated (24).zip`)
- SHA-256: `63ad85b483ac03391b5ddb3eb7b783d195131ce714eaaaec0259f2c3ada9fd2a`, 4.8 MB, downloaded 2026-06-30 11:33:58
- Kind: full
- Commit: `5e4535b1f14c86681f5a906a87c670cd39bc05d6`, tag `snap-0214`
- Files in archive: 858. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
M docs/NEXUS-PHASE-MAP.md
```

### Build 0.9.8-r69 — snap-0215 — 2026-06-30 11:39:10

- Archive: `nexus-0215_2026-06-30_v0.9.8-r69_consolidated-25.zip` (was `nexus-consolidated (25).zip`)
- SHA-256: `253054245f3757803be428db967b9aa5d243e2c3e4a47b950e869c3bd6a3c5ed`, 4.8 MB, downloaded 2026-06-30 11:39:48
- Kind: full
- Commit: `255d82a63aaac2ae4b96db54985c00cc37dd73c8`, tag `snap-0215`
- Files in archive: 859. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M autopilot.js
M clear-glass/src/main/index.js
M docs/NEXUS-PHASE-MAP.md
A tests/modules/autopilot-restart-delay.test.js
```

### Build 0.9.8-r70 — snap-0216 — 2026-06-30 11:43:40

- Archive: `nexus-0216_2026-06-30_v0.9.8-r70_consolidated-26.zip` (was `nexus-consolidated (26).zip`)
- SHA-256: `0c135e4f3747fabf9be4090099016e3d980f4c61697c7a9252c069f6cb712c73`, 4.8 MB, downloaded 2026-06-30 11:52:23
- Kind: full
- Commit: `7b154da90fa6f9bd6d8430e351985b3f5d57ac82`, tag `snap-0216`
- Files in archive: 861. Changes against the build before it: **2 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 3 | 0 |
| cortex | 0 | 1 | 0 |
| data | 1 | 0 | 0 |
| docs | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
M cortex/boot.js
A data/guardian/ledger/boot/events.ndjson
M docs/NEXUS-PHASE-MAP.md
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/settings.json
M guardian/server.js
A tests/modules/wire-pressure.test.js
M ui/tv-shell/spotlight/spotlight.js
```

### Build 0.9.8-r71 — snap-0217 — 2026-06-30 11:58:18

- Archive: `nexus-0217_2026-06-30_v0.9.8-r71_consolidated-27.zip` (was `nexus-consolidated (27).zip`)
- SHA-256: `b0451dfd36db555541caab2c5b3db30e84a4aa0dc0252f4686b696fa0b1494a8`, 4.8 MB, downloaded 2026-06-30 12:03:03
- Kind: full
- Commit: `0d87520e6f8424cdc45eb6989ca7296adedec546`, tag `snap-0217`
- Files in archive: 861. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/src/copilot/bridge.js
```

### Build 0.9.8-r72 — snap-0218 — 2026-06-30 12:10:08

- Archive: `nexus-0218_2026-06-30_v0.9.8-r72_consolidated-28.zip` (was `nexus-consolidated (28).zip`)
- SHA-256: `e287bdcf985c24a2aefc1ba0ed23bfcf1b8810110d0a765b27526bc0c667c934`, 4.8 MB, downloaded 2026-06-30 12:13:52
- Kind: full
- Commit: `b55825c8ce1a36f6b74dd2926a4a8a2e807faaca`, tag `snap-0218`
- Files in archive: 863. Changes against the build before it: **2 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 1 | 6 | 0 |
| docs | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
A clear-glass/src/diagnostic/error-capture.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
M docs/NEXUS-PHASE-MAP.md
A tests/modules/error-capture.test.js
```

### Build 0.9.8-r73 — snap-0219 — 2026-06-30 12:14:50

- Archive: `nexus-0219_2026-06-30_v0.9.8-r73_fixes-package.zip` (was `nexus-fixes-package.zip`)
- SHA-256: `cca64ae22d702aa7e683da0068226343a77bdcb3801d0def128736a2420427fb`, 0.5 MB, downloaded 2026-06-30 12:26:05
- Kind: overlay (a patch laid over the build before it)
- Commit: `53f66c54488f20ff6387e0935fa1b533e2d2f8a4`, tag `snap-0219`
- Files in archive: 145. Changes against the build before it: **0 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| docs | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |

```
M README.md
M cortex/core/raid/index.js
M docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md
M docs/NEXUS-PHASE-MAP.md
M lib/cfr/field.js
M lib/cfr/ledger.js
M lib/sigma-writer.js
M nexus-cfr-influence.js
```

### Build 0.9.8-r74 — snap-0220 — 2026-07-01 06:15:30

- Archive: `nexus-0220_2026-07-01_v0.9.8-r74_consolidated-29.zip` (was `nexus-consolidated (29).zip`)
- SHA-256: `6c87063fc9f554f0bb07bf659c7a9097a869ebbfe2cac32c7b75165b632898ef`, 4.8 MB, downloaded 2026-07-01 06:20:06
- Kind: full
- Commit: `35fb7d4480059359c3a14b63a394ad85354edf05`, tag `snap-0220`
- Files in archive: 867. Changes against the build before it: **4 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 3 | 1 | 0 |
| lib | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| docs | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M README.md
M cortex/core/raid/index.js
M docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md
M docs/NEXUS-PHASE-MAP.md
M lib/cfr/field.js
M lib/cfr/ledger.js
M lib/sigma-writer.js
M nexus-cfr-influence.js
A tests/modules/nexus-nerve.test.js
M ui/tv-shell/index.html
A ui/tv-shell/nerve/nerve.css
A ui/tv-shell/nerve/nerve.html
A ui/tv-shell/nerve/nerve.js
```

### Build 0.9.8-r75 — snap-0221 — 2026-07-01 06:48:42

- Archive: `nexus-0221_2026-07-01_v0.9.8-r75_consolidated-30.zip` (was `nexus-consolidated (30).zip`)
- SHA-256: `395cc85ef2e9c6f1936b7e3b5d76db4a896951a9b1b57bdd0a9f11184584968a`, 4.9 MB, downloaded 2026-07-01 08:27:52
- Kind: full
- Commit: `1505a624ebde3db14407772ccefc6f3b2702bf99`, tag `snap-0221`
- Files in archive: 914. Changes against the build before it: **47 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 40 | 0 | 0 |
| data | 3 | 0 | 0 |
| docs | 2 | 1 | 0 |
| hooks | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
M copilot/server.js
M cortex/boot.js
A cos/archetype/detector.js
A cos/archetype/index.js
A cos/archetype/registry.js
A cos/archetype/schema.js
A cos/blueprint/index.js
A cos/blueprint/registry.js
A cos/blueprint/schema.js
A cos/cli/commands/archetype.js
A cos/cli/commands/blueprint.js
A cos/cli/commands/playground.js
A cos/cli/commands/plugin.js
A cos/cli/commands/snapshot.js
A cos/cli/commands/vault.js
A cos/cli/commands/vaultd.js
A cos/foundation/enums.js
A cos/host/gates/archetype.js
A cos/host/gates/blueprint.js
A cos/host/gates/playgrounds.js
A cos/host/gates/plugin.js
A cos/host/gates/vault.js
A cos/playgrounds/cow-fs.js
A cos/playgrounds/factory.js
A cos/playgrounds/index.js
A cos/playgrounds/kernel.js
A cos/playgrounds/network-sim.js
A cos/plugin/host-api.js
A cos/plugin/index.js
A cos/plugin/installer.js
A cos/plugin/registry.js
A cos/plugin/schema.js
A cos/vault/audit-log.js
A cos/vault/crypto.js
A cos/vault/index.js
A cos/vault/store.js
A cos/vaultd/config.js
A cos/vaultd/daemon.js
A cos/vaultd/server.js
A cos/watchdog/actions.js
A cos/watchdog/monitor.js
A cos/watchdog/proc-stats.js
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-07-01.jsonl
A docs/NEXUS-LATTICE-COGNITION-ROADMAP-v0_1.md
M docs/SPEC-REGISTRY.md
A docs/nexus-nerve.spec
M guardian/server.js
M hooks/copilot.hooks.js
M hooks/ollama.hooks.js
A lib/nerve/index.js
M ollama/server.js
A tests/modules/nerve-phase0-phase1.test.js
M ui/tv-shell/nerve/nerve.js
```

### Build 0.9.8-r76 — snap-0222 — 2026-07-01 18:37:50

- Archive: `nexus-0222_2026-07-01_v0.9.8-r76_consolidated-30-refactored.zip` (was `nexus-consolidated__30_-refactored.zip`)
- SHA-256: `3998cd2c3884778de6498c2bda3621cf965ef7e4dcbc5b761472928b836efc75`, 4.9 MB, downloaded 2026-07-01 18:38:28
- Kind: full
- Commit: `9d0c5299c1726632a565c44c2b954f78b759aa72`, tag `snap-0222`
- Files in archive: 938. Changes against the build before it: **24 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 24 | 1 | 0 |

```
A clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
A clear-glass/renderer/src/agent-dropdown.js
A clear-glass/renderer/src/bookmarks.js
A clear-glass/renderer/src/cg-bridge.js
A clear-glass/renderer/src/context-menu.js
A clear-glass/renderer/src/copilot.js
A clear-glass/renderer/src/dom-panel.js
A clear-glass/renderer/src/gate-runtime.js
A clear-glass/renderer/src/injected-scripts.js
A clear-glass/renderer/src/main.js
A clear-glass/renderer/src/mesh-diag.js
A clear-glass/renderer/src/mesh-queue.js
A clear-glass/renderer/src/options-panel.js
A clear-glass/renderer/src/picker.js
A clear-glass/renderer/src/providers.js
A clear-glass/renderer/src/rewind.js
A clear-glass/renderer/src/spotlight.js
A clear-glass/renderer/src/sse.js
A clear-glass/renderer/src/state.js
A clear-glass/renderer/src/tabs.js
A clear-glass/renderer/src/toast.js
A clear-glass/renderer/src/userscripts.js
A clear-glass/renderer/src/webview-nav.js
A clear-glass/renderer/src/window-controls.js
```

### Build 0.9.8-r77 — snap-0223 — 2026-07-01 22:15:58

- Archive: `nexus-0223_2026-07-01_v0.9.8-r77_consolidated-30-refactored-2.zip` (was `nexus-consolidated__30_-refactored (2).zip`)
- SHA-256: `86ca93ba43073e404fa73b935d7811a58d098e57d333d951d4f1e60140a3802b`, 177.8 MB, downloaded 2026-07-01 23:13:01
- Kind: full
- Commit: `2208753547b96c39eaafdc958a7fede5eb59bd3d`, tag `snap-0223`
- Left out: node_modules (8003 files)
- Files in archive: 1218. Changes against the build before it: **281 added, 23 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 263 | 5 | 0 |
| copilot | 15 | 0 | 0 |
| clear-glass | 2 | 6 | 1 |
| guardian | 0 | 5 | 0 |
| (root) | 0 | 3 | 0 |
| architect | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| lib | 1 | 0 | 0 |

```
M CHANGELOG.md
M blueprint-index.json
D clear-glass/fix-orchestrator.js
M clear-glass/renderer/browser.html
A clear-glass/renderer/newtab.html
A clear-glass/src/extensions/manager.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
A copilot/intuition/handlers/awareness.js
A copilot/intuition/handlers/cli.js
A copilot/intuition/handlers/components.js
A copilot/intuition/handlers/crystals.js
A copilot/intuition/handlers/gaps.js
A copilot/intuition/handlers/greeting.js
A copilot/intuition/handlers/patterns.js
A copilot/intuition/handlers/route.js
A copilot/intuition/handlers/seam.js
A copilot/intuition/handlers/sigma.js
A copilot/intuition/handlers/status.js
A copilot/intuition/handlers/stream.js
A copilot/intuition/handlers/systems.js
A copilot/intuition/index.js
A copilot/intuition/shared.js
M cortex/memory/jaa-db.js
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M guardian/server.js
A lib/jaa-store.js
M orchestrator.js
```

272 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r78 — snap-0224 — 2026-07-02 00:08:46

- Archive: `nexus-0224_2026-07-02_v0.9.8-r78_consolidated-31.zip` (was `nexus-consolidated__31.zip`)
- SHA-256: `4d3dfd242855994ebb1db74aa260be47ca13c0ac0e849d169f8fc493d5e6b293`, 177.1 MB, downloaded 2026-07-02 03:41:07
- Kind: full
- Commit: `daf5f8d74efbe4dedf38d18a17dfd4ae03be5d68`, tag `snap-0224`
- Left out: node_modules (8003 files)
- Files in archive: 1046. Changes against the build before it: **37 added, 0 modified, 209 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 122 |
| cos | 0 | 0 | 40 |
| clear-glass | 0 | 0 | 28 |
| warp | 25 | 0 | 0 |
| copilot | 0 | 0 | 16 |
| loom | 12 | 0 | 0 |
| (root) | 0 | 0 | 3 |

```
D CONSOLIDATION-NOTES.md
D blueprint-index.json
D clear-glass/renderer/browser.css
D clear-glass/renderer/newtab.html
D clear-glass/renderer/src/agent-dropdown.js
D clear-glass/renderer/src/bookmarks.js
D clear-glass/renderer/src/cg-bridge.js
D clear-glass/renderer/src/context-menu.js
D clear-glass/renderer/src/copilot.js
D clear-glass/renderer/src/dom-panel.js
D clear-glass/renderer/src/gate-runtime.js
D clear-glass/renderer/src/injected-scripts.js
D clear-glass/renderer/src/main.js
D clear-glass/renderer/src/mesh-diag.js
D clear-glass/renderer/src/mesh-queue.js
D clear-glass/renderer/src/options-panel.js
D clear-glass/renderer/src/picker.js
D clear-glass/renderer/src/providers.js
D clear-glass/renderer/src/rewind.js
D clear-glass/renderer/src/spotlight.js
D clear-glass/renderer/src/sse.js
D clear-glass/renderer/src/state.js
D clear-glass/renderer/src/tabs.js
D clear-glass/renderer/src/toast.js
D clear-glass/renderer/src/userscripts.js
D clear-glass/renderer/src/webview-nav.js
D clear-glass/renderer/src/window-controls.js
D clear-glass/siso/package.json
D clear-glass/src/diagnostic/error-capture.js
D clear-glass/src/extensions/manager.js
D copilot/adaptive-fulfillment.js
D copilot/intuition/handlers/awareness.js
D copilot/intuition/handlers/cli.js
D copilot/intuition/handlers/components.js
D copilot/intuition/handlers/crystals.js
D copilot/intuition/handlers/gaps.js
D copilot/intuition/handlers/greeting.js
D copilot/intuition/handlers/patterns.js
D copilot/intuition/handlers/route.js
D copilot/intuition/handlers/seam.js
D copilot/intuition/handlers/sigma.js
D copilot/intuition/handlers/status.js
D copilot/intuition/handlers/stream.js
D copilot/intuition/handlers/systems.js
D copilot/intuition/index.js
D copilot/intuition/shared.js
D cos/archetype/detector.js
D cos/archetype/index.js
D cos/archetype/registry.js
D cos/archetype/schema.js
D cos/blueprint/index.js
D cos/blueprint/registry.js
D cos/blueprint/schema.js
D cos/cli/commands/archetype.js
D cos/cli/commands/blueprint.js
D cos/cli/commands/playground.js
D cos/cli/commands/plugin.js
D cos/cli/commands/snapshot.js
D cos/cli/commands/vault.js
D cos/cli/commands/vaultd.js
D cos/foundation/enums.js
D cos/host/gates/archetype.js
D cos/host/gates/blueprint.js
D cos/host/gates/playgrounds.js
D cos/host/gates/plugin.js
D cos/host/gates/vault.js
D cos/playgrounds/cow-fs.js
D cos/playgrounds/factory.js
D cos/playgrounds/index.js
D cos/playgrounds/kernel.js
D cos/playgrounds/network-sim.js
D cos/plugin/host-api.js
D cos/plugin/index.js
D cos/plugin/installer.js
D cos/plugin/registry.js
D cos/plugin/schema.js
D cos/vault/audit-log.js
D cos/vault/crypto.js
D cos/vault/index.js
D cos/vault/store.js
D cos/vaultd/config.js
D cos/vaultd/daemon.js
D cos/vaultd/server.js
D cos/watchdog/actions.js
D cos/watchdog/monitor.js
D cos/watchdog/proc-stats.js
A loom/agent-suite/index.js
A loom/bootstrap.js
A loom/maps/warp-map.js
A loom/schema/axioms.js
A loom/schema/definitions.js
A loom/schema/driver.js
A loom/schema/gates.js
A loom/schema/index.js
A loom/schema/registry.js
A loom/test/agent-suite.test.js
A loom/test/schema.test.js
D registry-components.cortex.js
A warp/LICENSE
A warp/MANIFEST.json
A warp/core/Axiom.js
A warp/core/Event.js
A warp/core/Gate.js
A warp/core/GateFusion.js
A warp/core/Stream.js
A warp/core/StreamLog.js
A warp/core/index.js
A warp/dispatch/benchmark.js
A warp/dispatch/canonicalize.js
A warp/dispatch/cascade.js
A warp/dispatch/deltaCache.js
A warp/dispatch/digest.js
A warp/dispatch/index.js
A warp/dispatch/population.js
A warp/dispatch/pregen.js
A warp/plugins/crystallizer-flatfile.js
A warp/plugins/scorer-default.js
A warp/test/core.test.js
A warp/test/digest-regression.test.js
A warp/test/dispatch.test.js
A warp/test/v1.1.0-additions.test.js
A warp/test/v1.4-additions.test.js
A warp/warp.spec
```

123 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r79 — snap-0225 — 2026-07-02 04:17:00

- Archive: `nexus-0225_2026-07-02_v0.9.8-r79_build-kit.zip` (was `nexus-build-kit.zip`)
- SHA-256: `02f84ae5f63faca8fba08e0212a0bd95c16c1ae23b3abef3f6b968fad3591068`, 0.5 MB, downloaded 2026-07-02 04:19:14
- Kind: overlay (a patch laid over the build before it)
- Commit: `8ea1cd2aa04ed9fa4e096d41faa0474488b07845`, tag `snap-0225`
- Files in archive: 155. Changes against the build before it: **4 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |
| contracts | 1 | 0 | 0 |
| docs | 0 | 1 | 0 |
| phase-map | 1 | 0 | 0 |
| session-specs | 1 | 0 | 0 |

```
A INDEX.md
A contracts/orchestrator-contract.json
M docs/emerge.spec
A phase-map/nexus_complete_phase_map_10.html
A session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md
```

### Build 0.9.8-r80 — snap-0226 — 2026-07-02 04:26:56

- Archive: `nexus-0226_2026-07-02_v0.9.8-r80_build-kit-1.zip` (was `nexus-build-kit (1).zip`)
- SHA-256: `e840d98091808267bf9a89bc9e3e5372bd1c24118ea13f6981c5ddfc9f0a520e`, 0.6 MB, downloaded 2026-07-02 04:30:37
- Kind: overlay (a patch laid over the build before it)
- Commit: `e09cab827d012c58cfa84264a6ac4b13c6918abd`, tag `snap-0226`
- Files in archive: 164. Changes against the build before it: **8 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom-registry | 4 | 0 | 0 |
| (root) | 2 | 1 | 0 |
| jaa-schema | 2 | 0 | 0 |

```
M INDEX.md
A MASTER-MAP.md
A blueprint-index.json
A jaa-schema/schema-full.sql
A jaa-schema/schema.sql
A loom-registry/definitions.js
A loom-registry/index.js
A loom-registry/registry.js
A loom-registry/registry.json
```

### Build 0.9.8-r81 — snap-0227 — 2026-07-02 04:31:18

- Archive: `nexus-0227_2026-07-02_v0.9.8-r81_system-kit.zip` (was `Nexus System Kit.zip`)
- SHA-256: `dfd31274b6c54c6106cd105a443f65eb4d0105f373776171390985ba9b8248ec`, 0.6 MB, downloaded 2026-07-02 05:01:28
- Kind: overlay (a patch laid over the build before it)
- Commit: `721b4146462de5264fc59270e38728285e436b0c`, tag `snap-0227`
- Files in archive: 165. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |

```
A COMPONENT-MAP-CFR-RFR2.md
```

### Build 0.9.8-r82 — snap-0228 — 2026-07-02 08:15:44

- Archive: `nexus-0228_2026-07-02_v0.9.8-r82_consolidated-36.zip` (was `nexus-consolidated__36.zip`)
- SHA-256: `aa9b12cfccc70e04f276efa44aaa76393acdcba95f4683848fb9d75237d57b8b`, 177.8 MB, downloaded 2026-07-23 19:16:19
- Kind: full
- Commit: `0b0c584267d0515a692a88a01371b4a60cb484f7`, tag `snap-0228`
- Left out: node_modules (8003 files)
- Files in archive: 1268. Changes against the build before it: **222 added, 15 modified, 13 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 122 | 0 | 0 |
| cos | 41 | 12 | 1 |
| clear-glass | 28 | 0 | 0 |
| copilot | 16 | 0 | 0 |
| loom | 7 | 2 | 0 |
| generated | 6 | 0 | 0 |
| (root) | 2 | 0 | 3 |
| loom-registry | 0 | 0 | 4 |
| jaa-schema | 0 | 0 | 2 |
| contracts | 0 | 0 | 1 |
| docs | 0 | 1 | 0 |
| phase-map | 0 | 0 | 1 |
| session-specs | 0 | 0 | 1 |

```
D COMPONENT-MAP-CFR-RFR2.md
A CONSOLIDATION-NOTES.md
D INDEX.md
D MASTER-MAP.md
A clear-glass/renderer/browser.css
A clear-glass/renderer/newtab.html
A clear-glass/renderer/src/agent-dropdown.js
A clear-glass/renderer/src/bookmarks.js
A clear-glass/renderer/src/cg-bridge.js
A clear-glass/renderer/src/context-menu.js
A clear-glass/renderer/src/copilot.js
A clear-glass/renderer/src/dom-panel.js
A clear-glass/renderer/src/gate-runtime.js
A clear-glass/renderer/src/injected-scripts.js
A clear-glass/renderer/src/main.js
A clear-glass/renderer/src/mesh-diag.js
A clear-glass/renderer/src/mesh-queue.js
A clear-glass/renderer/src/options-panel.js
A clear-glass/renderer/src/picker.js
A clear-glass/renderer/src/providers.js
A clear-glass/renderer/src/rewind.js
A clear-glass/renderer/src/spotlight.js
A clear-glass/renderer/src/sse.js
A clear-glass/renderer/src/state.js
A clear-glass/renderer/src/tabs.js
A clear-glass/renderer/src/toast.js
A clear-glass/renderer/src/userscripts.js
A clear-glass/renderer/src/webview-nav.js
A clear-glass/renderer/src/window-controls.js
A clear-glass/siso/package.json
A clear-glass/src/diagnostic/error-capture.js
A clear-glass/src/extensions/manager.js
D contracts/orchestrator-contract.json
A copilot/adaptive-fulfillment.js
A copilot/intuition/handlers/awareness.js
A copilot/intuition/handlers/cli.js
A copilot/intuition/handlers/components.js
A copilot/intuition/handlers/crystals.js
A copilot/intuition/handlers/gaps.js
A copilot/intuition/handlers/greeting.js
A copilot/intuition/handlers/patterns.js
A copilot/intuition/handlers/route.js
A copilot/intuition/handlers/seam.js
A copilot/intuition/handlers/sigma.js
A copilot/intuition/handlers/status.js
A copilot/intuition/handlers/stream.js
A copilot/intuition/handlers/systems.js
A copilot/intuition/index.js
A copilot/intuition/shared.js
A cos/archetype/detector.js
A cos/archetype/index.js
A cos/archetype/registry.js
A cos/archetype/schema.js
A cos/blueprint/index.js
A cos/blueprint/registry.js
A cos/blueprint/schema.js
A cos/cli/commands/archetype.js
A cos/cli/commands/blueprint.js
A cos/cli/commands/playground.js
A cos/cli/commands/plugin.js
A cos/cli/commands/snapshot.js
A cos/cli/commands/vault.js
A cos/cli/commands/vaultd.js
M cos/cli/index.js
M cos/compartment/process-runner.js
M cos/foundation/axioms.js
M cos/foundation/compiler-enum.js
M cos/foundation/constants.js
A cos/foundation/enums.js
M cos/foundation/event-contracts.js
M cos/foundation/runtime-enum.js
M cos/foundation/snapshot.js
M cos/foundation/types.js
A cos/host/gates/archetype.js
A cos/host/gates/blueprint.js
A cos/host/gates/playgrounds.js
A cos/host/gates/plugin.js
A cos/host/gates/vault.js
M cos/host/index.js
M cos/host/system-map.js
M cos/package.json
A cos/playgrounds/cow-fs.js
A cos/playgrounds/factory.js
A cos/playgrounds/index.js
A cos/playgrounds/kernel.js
A cos/playgrounds/network-sim.js
A cos/plugin/host-api.js
A cos/plugin/index.js
A cos/plugin/installer.js
A cos/plugin/registry.js
A cos/plugin/schema.js
D cos/test.js
A cos/test/test.js
A cos/vault/audit-log.js
A cos/vault/crypto.js
A cos/vault/index.js
A cos/vault/store.js
A cos/vaultd/config.js
A cos/vaultd/daemon.js
A cos/vaultd/server.js
A cos/watchdog/actions.js
A cos/watchdog/monitor.js
A cos/watchdog/proc-stats.js
M docs/emerge.spec
A generated/clearglass-accounts/api/index.js
A generated/clearglass-accounts/cli/index.js
A generated/clearglass-accounts/docs/clearglass-accounts.spec.md
A generated/clearglass-accounts/interaction-contract.json
A generated/clearglass-accounts/registry-components.js
A generated/clearglass-accounts/test/api.test.js
D jaa-schema/schema-full.sql
D jaa-schema/schema.sql
D loom-registry/definitions.js
D loom-registry/index.js
D loom-registry/registry.js
D loom-registry/registry.json
A loom/contracts/index.js
A loom/ingest/index.js
A loom/ingest/revisions.js
M loom/schema/registry.js
A loom/templates/system-scaffold.js
A loom/test/contracts.test.js
A loom/test/ingest.test.js
A loom/test/system-scaffold.test.js
D phase-map/nexus_complete_phase_map_10.html
A registry-components.cortex.js
D session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md
```

123 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r83 — snap-0229 — 2026-07-02 13:20:10

- Archive: `nexus-0229_2026-07-02_v0.9.8-r83_consolidated.zip` (was `nexus-consolidated.zip`)
- SHA-256: `71d6b1e08f25c3add921074c2051bf1d7ca00a2bad557986adfab4b0294c8703`, 5 MB, downloaded 2026-07-02 13:32:40
- Kind: full
- Commit: `182d5ef0fcec66a2c3e93a6d548d549c3b5633c8`, tag `snap-0229`
- Files in archive: 949. Changes against the build before it: **109 added, 70 modified, 428 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 5 | 263 |
| lib | 7 | 7 | 67 |
| meta | 56 | 0 | 0 |
| clear-glass | 1 | 6 | 26 |
| warp | 0 | 0 | 25 |
| copilot | 4 | 2 | 15 |
| loom | 0 | 0 | 19 |
| orchestrator | 18 | 0 | 0 |
| guardian | 3 | 7 | 6 |
| cos | 1 | 12 | 1 |
| tests | 2 | 10 | 0 |
| docs | 10 | 1 | 0 |
| generated | 0 | 0 | 6 |
| bridge | 1 | 5 | 0 |
| idearium | 2 | 3 | 0 |
| cortex | 1 | 3 | 0 |
| architect | 1 | 3 | 0 |
| (root) | 0 | 3 | 0 |
| ui | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M CHANGELOG.md
A architect/interaction-contract.json
M architect/service.js
M blueprint-index.json
M bridge/causal/expectation.js
M bridge/causal/graph.js
M bridge/causal/projections.js
M bridge/index.js
A bridge/interaction-contract.json
M bridge/server.js
A clear-glass/fix-orchestrator.js
D clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
D clear-glass/renderer/newtab.html
D clear-glass/renderer/src/agent-dropdown.js
D clear-glass/renderer/src/bookmarks.js
D clear-glass/renderer/src/cg-bridge.js
D clear-glass/renderer/src/context-menu.js
D clear-glass/renderer/src/copilot.js
D clear-glass/renderer/src/dom-panel.js
D clear-glass/renderer/src/gate-runtime.js
D clear-glass/renderer/src/injected-scripts.js
D clear-glass/renderer/src/main.js
D clear-glass/renderer/src/mesh-diag.js
D clear-glass/renderer/src/mesh-queue.js
D clear-glass/renderer/src/options-panel.js
D clear-glass/renderer/src/picker.js
D clear-glass/renderer/src/providers.js
D clear-glass/renderer/src/rewind.js
D clear-glass/renderer/src/spotlight.js
D clear-glass/renderer/src/sse.js
D clear-glass/renderer/src/state.js
D clear-glass/renderer/src/tabs.js
D clear-glass/renderer/src/toast.js
D clear-glass/renderer/src/userscripts.js
D clear-glass/renderer/src/webview-nav.js
D clear-glass/renderer/src/window-controls.js
D clear-glass/src/extensions/manager.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
M cli/cfr-debug.js
D copilot/intuition/handlers/awareness.js
D copilot/intuition/handlers/cli.js
D copilot/intuition/handlers/components.js
D copilot/intuition/handlers/crystals.js
D copilot/intuition/handlers/gaps.js
D copilot/intuition/handlers/greeting.js
D copilot/intuition/handlers/patterns.js
D copilot/intuition/handlers/route.js
D copilot/intuition/handlers/seam.js
D copilot/intuition/handlers/sigma.js
D copilot/intuition/handlers/status.js
D copilot/intuition/handlers/stream.js
D copilot/intuition/handlers/systems.js
D copilot/intuition/index.js
D copilot/intuition/shared.js
A copilot/lib/contract-queue.js
A copilot/lib/copilot-context.js
A copilot/lib/descriptor-projector.js
A copilot/lib/user-model.js
M copilot/module-builder.js
M copilot/server.js
M cortex/boot.js
A cortex/interaction-contract.json
M cortex/memory/jaa-db.js
M cos/cli/index.js
M cos/compartment/process-runner.js
M cos/foundation/axioms.js
M cos/foundation/compiler-enum.js
M cos/foundation/constants.js
M cos/foundation/event-contracts.js
M cos/foundation/runtime-enum.js
M cos/foundation/snapshot.js
M cos/foundation/types.js
M cos/host/index.js
M cos/host/system-map.js
M cos/package.json
A cos/test.js
D cos/test/test.js
A docs/NEXUS-INTELLIGENCE-LAYER-INDEX.md
M docs/SPEC-REGISTRY.md
A docs/alk-gl-intelligence-canvas-face.spec
A docs/alk-gl-intelligence-canvas.spec
A docs/copilot-system-programmer.spec
A docs/nexus-intelligence-system.spec
A docs/nexus-optimization-service.spec
A docs/nexus-project-flow.spec
A docs/nexus-query-surface.spec
A docs/nexus-relationship-shape.spec
A docs/raid-simulation-engine.spec
D generated/clearglass-accounts/api/index.js
D generated/clearglass-accounts/cli/index.js
D generated/clearglass-accounts/docs/clearglass-accounts.spec.md
D generated/clearglass-accounts/interaction-contract.json
D generated/clearglass-accounts/registry-components.js
D generated/clearglass-accounts/test/api.test.js
M guardian/api-dispatch.js
D guardian/lib/detector.js
A guardian/lib/dispatch-pool.js
M guardian/lib/gap-hunter.js
A guardian/lib/grammar-fallback.js
A guardian/lib/ncp.js
D guardian/lib/seam-mode-reducer.js
D guardian/lib/seam-queue.js
D guardian/lib/seam-watchdog.js
D guardian/lib/spec-bridge/index.js
D guardian/lib/spec-parser.js
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M guardian/server.js
M idearium/api/index.js
M idearium/index.js
A idearium/lib/event-ledger.js
A idearium/lib/spec-container.js
M idearium/repo/watcher.js
D lib/adversary-suite.js
D lib/alk/index.js
D lib/autonomous-loop.js
M lib/case-library.js
D lib/causal/anomaly.js
D lib/causal/compound.js
D lib/cfr/contract-verifier.js
D lib/cfr/delta.js
D lib/cfr/field.js
D lib/cfr/graph.js
D lib/cfr/index.js
D lib/cfr/ledger.js
D lib/cfr/sigma.js
D lib/changelog.js
M lib/chat-logger.js
M lib/compartment-engine.js
D lib/contract-handshake.js
D lib/contract-poller.js
D lib/contract-queue.js
D lib/copilot-context.js
D lib/crystal-lattice.js
D lib/descriptor-projector.js
D lib/dispatch-pool.js
D lib/event-ledger.js
D lib/file-push.js
D lib/gap-ledger.js
D lib/gap-predicate.js
D lib/grammar-fallback.js
D lib/grammar-misfire-tracker.js
D lib/hot-loader.js
D lib/intent-map.js
```

457 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r84 — snap-0230 — 2026-07-02 13:48:44

- Archive: `nexus-0230_2026-07-02_v0.9.8-r84_require-fixes-round2.zip` (was `nexus-require-fixes-round2.zip`)
- SHA-256: `9ab5442bff27d229ab1f2549773fac312a294b93c9f1227782ad8e681c05f966`, 0.1 MB, downloaded 2026-07-02 13:54:42
- Kind: overlay (a patch laid over the build before it)
- Commit: `d52ec1ad215e67118d71a34afccb8e78478696d6`, tag `snap-0230`
- Files in archive: 19. Changes against the build before it: **0 added, 19 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 0 | 9 | 0 |
| lib | 0 | 4 | 0 |
| idearium | 0 | 2 | 0 |
| meta | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |

```
M bridge/causal/expectation.js
M clear-glass/src/copilot/bridge.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M lib/blueprint.js
M lib/cli-map.js
M lib/component-registry.js
M lib/nexus-expansion-boot.js
M meta/cfr/sigma.js
M meta/gap/predicate.js
M tests/modules/autonomous-loop.test.js
M tests/modules/nexus-seam.test.js
M tests/modules/spec-container.test.js
M tests/modules/test-grammar-fallback.js
M tests/modules/test-mutation-contract.js
M tests/modules/test-ui-registry.js
M tests/modules/user-model.test.js
M tests/ncp-race.test.js
M tests/nexus-full-audit.js
```

### Build 0.9.8-r85 — snap-0231 — 2026-07-02 13:55:28

- Archive: `nexus-0231_2026-07-02_v0.9.8-r85_consolidated-wired.zip` (was `nexus-consolidated-wired.zip`)
- SHA-256: `d38019caf51d5699b3414698488b8a013b88fd7b95a695bc4e7c6709fb4b25a7`, 5 MB, downloaded 2026-07-02 13:57:56
- Kind: full
- Commit: `e7d81ae5eebf8407958d9d8a7682fe2e0d0386a5`, tag `snap-0231`
- Files in archive: 949. Changes against the build before it: **1 added, 12 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| orchestrator | 0 | 7 | 0 |
| copilot | 0 | 2 | 1 |
| guardian | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M autopilot.js
D copilot/lib/contract-queue.js
M copilot/lib/user-model.js
M copilot/module-builder.js
M guardian/lib/grammar-fallback.js
M guardian/lib/ncp.js
A lib/contract-queue.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/contract-poller.js
M orchestrator/lib/intent-map.js
M orchestrator/lib/mutation-contract.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/spec-drift.js
```

### Build 0.9.8-r86 — snap-0232 — 2026-07-02 16:31:10

- Archive: `nexus-0232_2026-07-02_v0.9.8-r86_consolidated-1.zip` (was `nexus-consolidated - 1.zip`)
- SHA-256: `055f81e622b510c669136804154f4e03643c7c8ba659a756af249590c01d67f8`, 42.8 MB, downloaded 2026-07-02 16:32:50
- Kind: full
- Commit: `63521a3a241b341749330595d812e4a726e38261`, tag `snap-0232`
- Left out: node_modules (9435 files)
- Files in archive: 1079. Changes against the build before it: **134 added, 37 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 132 | 1 | 3 |
| tests | 0 | 9 | 0 |
| orchestrator | 0 | 7 | 0 |
| lib | 0 | 4 | 1 |
| (root) | 0 | 3 | 0 |
| copilot | 1 | 2 | 0 |
| architect | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| meta | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| loom | 1 | 0 | 0 |

```
M autopilot.js
M blueprint-index.json
M bridge/causal/expectation.js
M clear-glass/src/copilot/bridge.js
A copilot/lib/contract-queue.js
M copilot/lib/user-model.js
M copilot/module-builder.js
M guardian/lib/grammar-fallback.js
M guardian/lib/ncp.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M lib/blueprint.js
M lib/cli-map.js
M lib/component-registry.js
D lib/contract-queue.js
M lib/nexus-expansion-boot.js
A loom/server.js
M meta/cfr/sigma.js
M meta/gap/predicate.js
M nexus-connect.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/contract-poller.js
M orchestrator/lib/intent-map.js
M orchestrator/lib/mutation-contract.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/spec-drift.js
M tests/modules/autonomous-loop.test.js
M tests/modules/nexus-seam.test.js
M tests/modules/spec-container.test.js
M tests/modules/test-grammar-fallback.js
M tests/modules/test-mutation-contract.js
M tests/modules/test-ui-registry.js
M tests/modules/user-model.test.js
M tests/ncp-race.test.js
M tests/nexus-full-audit.js
```

139 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r87 — snap-0233 — 2026-07-03 00:36:58

- Archive: `nexus-0233_2026-07-03_v0.9.8-r87_consolidated-full.zip` (was `nexus-consolidated-full.zip`)
- SHA-256: `2e7da54ffd2939cd57ce1efffe859a50e177d1a99118ff63cb716b311946e6f1`, 5.1 MB, downloaded 2026-07-04 07:05:22
- Kind: full
- Commit: `e135ff76d3a39de67a6647ea1067c38ee69bf70b`, tag `snap-0233`
- Identical copy: `nexus-0233_2026-07-03_v0.9.8-r87_consolidated-full-1_dup1.zip` (was `nexus-consolidated-full (1).zip`)
- Files in archive: 996. Changes against the build before it: **50 added, 38 modified, 133 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 1 | 132 |
| warp | 25 | 0 | 0 |
| loom | 20 | 0 | 0 |
| tests | 0 | 9 | 0 |
| orchestrator | 0 | 7 | 0 |
| lib | 1 | 4 | 0 |
| (root) | 1 | 3 | 0 |
| copilot | 0 | 2 | 1 |
| architect | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| meta | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M autopilot.js
M blueprint-index.json
M bridge/causal/expectation.js
M clear-glass/src/copilot/bridge.js
D copilot/lib/contract-queue.js
M copilot/lib/user-model.js
M copilot/module-builder.js
M docs/nexus-relationship-shape.spec
M guardian/lib/grammar-fallback.js
M guardian/lib/ncp.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M lib/blueprint.js
M lib/cli-map.js
M lib/component-registry.js
A lib/contract-queue.js
M lib/nexus-expansion-boot.js
A loom/agent-suite/index.js
A loom/bootstrap.js
A loom/contracts/index.js
A loom/ingest/index.js
A loom/ingest/revisions.js
A loom/maps/warp-map.js
A loom/schema/axioms.js
A loom/schema/cortex-sync.js
A loom/schema/definitions.js
A loom/schema/driver.js
A loom/schema/gates.js
A loom/schema/index.js
A loom/schema/registry.js
A loom/templates/system-scaffold.js
A loom/test/agent-suite.test.js
A loom/test/contracts.test.js
A loom/test/ingest.test.js
A loom/test/schema.test.js
A loom/test/system-scaffold.test.js
M meta/cfr/sigma.js
M meta/gap/predicate.js
M orchestrator.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/contract-poller.js
M orchestrator/lib/intent-map.js
M orchestrator/lib/mutation-contract.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/spec-drift.js
A phase_map_11.html
M tests/modules/autonomous-loop.test.js
M tests/modules/nexus-seam.test.js
M tests/modules/spec-container.test.js
M tests/modules/test-grammar-fallback.js
M tests/modules/test-mutation-contract.js
M tests/modules/test-ui-registry.js
M tests/modules/user-model.test.js
M tests/ncp-race.test.js
M tests/nexus-full-audit.js
A warp/LICENSE
A warp/MANIFEST.json
A warp/core/Axiom.js
A warp/core/Event.js
A warp/core/Gate.js
A warp/core/GateFusion.js
A warp/core/Stream.js
A warp/core/StreamLog.js
A warp/core/index.js
A warp/dispatch/benchmark.js
A warp/dispatch/canonicalize.js
A warp/dispatch/cascade.js
A warp/dispatch/deltaCache.js
A warp/dispatch/digest.js
A warp/dispatch/index.js
A warp/dispatch/population.js
A warp/dispatch/pregen.js
A warp/plugins/crystallizer-flatfile.js
A warp/plugins/scorer-default.js
A warp/test/core.test.js
A warp/test/digest-regression.test.js
A warp/test/dispatch.test.js
A warp/test/v1.1.0-additions.test.js
A warp/test/v1.4-additions.test.js
A warp/warp.spec
```

140 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r88 — snap-0234 — 2026-07-04 09:20:50

- Archive: `nexus-0234_2026-07-04_v0.9.8-r88_consolidated-1.zip` (was `nexus-consolidated-1.zip`)
- SHA-256: `b0bb73e6f7dbb5b14e96676ba89e928553878d610f81b7b911be186b690d0afb`, 5.1 MB, downloaded 2026-07-04 09:23:27
- Kind: full
- Commit: `f668b21a4e2c531b45b61510c9fa2d00d8788977`, tag `snap-0234`
- Files in archive: 969. Changes against the build before it: **29 added, 55 modified, 56 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| warp | 0 | 0 | 25 |
| loom | 0 | 0 | 21 |
| tests | 4 | 10 | 0 |
| guardian | 5 | 4 | 5 |
| orchestrator | 5 | 7 | 0 |
| lib | 3 | 6 | 1 |
| (root) | 0 | 4 | 4 |
| clear-glass | 2 | 4 | 0 |
| copilot | 1 | 3 | 0 |
| cortex | 1 | 3 | 0 |
| docs | 2 | 1 | 0 |
| service | 1 | 1 | 0 |
| meta | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| hooks | 0 | 2 | 0 |
| ui | 0 | 2 | 0 |
| data | 2 | 0 | 0 |
| cos | 1 | 1 | 0 |
| cli | 1 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| cockpit | 1 | 0 | 0 |

```
M autopilot.js
M blueprint-index.json
M bridge/causal/expectation.js
A clear-glass/cli.js
A clear-glass/src/api/wire.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/registry.js
M clear-glass/src/userscripts/manager.js
M cli/diagnose.js
A cli/forge.js
A cockpit/forge.js
A copilot/lib/contract-queue.js
M copilot/lib/user-model.js
M copilot/module-builder.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/index.js
A cortex/core/raid/simulation.js
M cortex/registry-components.js
M cos/test.js
A cos/test/test.js
A data/ledger/reflection/reflection.engine/2026-07-03.jsonl
A data/ledger/reflection/reflection.engine/2026-07-04.jsonl
A docs/forge-ide.spec
A docs/loom.spec
M docs/nexus-relationship-shape.spec
M guardian/interaction-contract.json
M guardian/lib/grammar-fallback.js
M guardian/lib/ncp.js
M guardian/server.js
D guardian/userscript-chatgpt.js
D guardian/userscript-claude.js
D guardian/userscript-gemini.js
D guardian/userscript-memory.js
D guardian/userscript-perplexity.js
A guardian/userscripts/chatgpt.js
A guardian/userscripts/claude.js
A guardian/userscripts/gemini.js
A guardian/userscripts/memory.js
A guardian/userscripts/perplexity.js
M hooks/cortex.hooks.js
M hooks/guardian.hooks.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M lib/blueprint-index.js
M lib/blueprint.js
M lib/cli-map.js
M lib/component-registry.js
D lib/contract-queue.js
A lib/forge-core.js
M lib/nexus-expansion-boot.js
A lib/pipeline/index.js
A lib/rfr2-bus-bridge.js
M lib/version.js
D loom/agent-suite/index.js
D loom/bootstrap.js
D loom/contracts/index.js
D loom/data/registry.json
D loom/ingest/index.js
D loom/ingest/revisions.js
D loom/maps/warp-map.js
D loom/schema/axioms.js
D loom/schema/cortex-sync.js
D loom/schema/definitions.js
D loom/schema/driver.js
D loom/schema/gates.js
D loom/schema/index.js
D loom/schema/registry.js
D loom/server.js
D loom/templates/system-scaffold.js
D loom/test/agent-suite.test.js
D loom/test/contracts.test.js
D loom/test/ingest.test.js
D loom/test/schema.test.js
D loom/test/system-scaffold.test.js
M meta/cfr/sigma.js
M meta/gap/predicate.js
M nexus-connect.js
D nexus-heal-loop.js
D nexus-knowledge.js
D nexus-query.js
M ollama/registry-components.js
M orchestrator.js
A orchestrator/interaction-contract.json
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/contract-poller.js
A orchestrator/lib/heal-loop.js
M orchestrator/lib/intent-map.js
A orchestrator/lib/knowledge.js
M orchestrator/lib/mutation-contract.js
A orchestrator/lib/query.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/spec-drift.js
A orchestrator/registry-components.js
D phase_map_11.html
A service/interaction-contract.json
M service/nexus-diagnostic.js
M tests/modules/autonomous-loop.test.js
A tests/modules/component-sse-uniqueness.test.js
A tests/modules/nexus-intelligence-wiring.test.js
A tests/modules/nexus-query-surface.test.js
M tests/modules/nexus-seam.test.js
A tests/modules/raid-simulation.test.js
M tests/modules/spec-container.test.js
M tests/modules/test-grammar-fallback.js
M tests/modules/test-mutation-contract.js
M tests/modules/test-ui-registry.js
M tests/modules/user-model.test.js
M tests/ncp-race.test.js
M tests/nexus-full-audit.js
M tests/userscript-adapter-consistency.test.js
M ui/eravos/runtime/canvas-intelligence.js
M ui/home/index.html
D warp/LICENSE
D warp/MANIFEST.json
D warp/core/Axiom.js
D warp/core/Event.js
D warp/core/Gate.js
D warp/core/GateFusion.js
D warp/core/Stream.js
D warp/core/StreamLog.js
D warp/core/index.js
D warp/dispatch/benchmark.js
D warp/dispatch/canonicalize.js
D warp/dispatch/cascade.js
D warp/dispatch/deltaCache.js
D warp/dispatch/digest.js
D warp/dispatch/index.js
D warp/dispatch/population.js
D warp/dispatch/pregen.js
D warp/plugins/crystallizer-flatfile.js
D warp/plugins/scorer-default.js
D warp/test/core.test.js
D warp/test/digest-regression.test.js
D warp/test/dispatch.test.js
D warp/test/v1.1.0-additions.test.js
D warp/test/v1.4-additions.test.js
D warp/warp.spec
```

### Build 0.9.8-r89 — snap-0235 — 2026-07-04 09:34:12

- Archive: `nexus-0235_2026-07-04_v0.9.8-r89_consolidated-2.zip` (was `nexus-consolidated-2.zip`)
- SHA-256: `35c790278eebfb331130b8bc853b935be382a5ae6632195f6a5b3a03c51e4d04`, 5.1 MB, downloaded 2026-07-04 09:35:11
- Kind: full
- Commit: `0b92e85350431658bfc5d5bef736c9211cee6af5`, tag `snap-0235`
- Files in archive: 970. Changes against the build before it: **1 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| hooks | 0 | 3 | 0 |
| (root) | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| data | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M copilot/registry-components.js
M cortex/registry-components.js
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M guardian/registry-components.js
M hooks/copilot.hooks.js
M hooks/cortex.hooks.js
M hooks/orchestrator.hooks.js
M orchestrator/registry-components.js
A test-live.js
```

### Build 0.9.8-r90 — snap-0236 — 2026-07-04 09:38:58

- Archive: `nexus-0236_2026-07-04_v0.9.8-r90_consolidated-3.zip` (was `nexus-consolidated-3.zip`)
- SHA-256: `00ec3e7f28a86024a7a00a4d504be3d9138a77da3d1fdf13d42ad76a2a7b0425`, 5.1 MB, downloaded 2026-07-04 09:39:10
- Kind: full
- Commit: `3baed80b442458fa15be336cd23f9600d0f3fd9a`, tag `snap-0236`
- Files in archive: 986. Changes against the build before it: **17 added, 12 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 15 | 6 | 0 |
| guardian | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| orchestrator | 1 | 1 | 0 |
| copilot | 0 | 0 | 1 |
| lib | 1 | 0 | 0 |

```
M blueprint-index.json
D copilot/lib/contract-queue.js
M data/bridge/ledger/cfr/event_log.jsonl
M data/bridge/ledger/requests.jsonl
A data/cortex/memory/component_ledger.json
A data/cortex/memory/components.json
A data/cortex/memory/event_log.json
A data/cortex/memory/settings.json
M data/guardian/ledger/boot/events.ndjson
A data/ledger/bridge/bridge.circuit.reset/2026-07-04.jsonl
A data/ledger/bridge/bridge.circuit.status/2026-07-04.jsonl
A data/ledger/bridge/bridge.contract/2026-07-04.jsonl
A data/ledger/bridge/bridge.events/2026-07-04.jsonl
A data/ledger/bridge/bridge.health/2026-07-04.jsonl
A data/ledger/bridge/bridge.identity.verify/2026-07-04.jsonl
A data/ledger/bridge/bridge.node.register/2026-07-04.jsonl
A data/ledger/bridge/bridge.node.trust/2026-07-04.jsonl
A data/ledger/bridge/bridge.nodes.list/2026-07-04.jsonl
A data/ledger/bridge/bridge.relay.request/2026-07-04.jsonl
A data/ledger/bridge/bridge.requests.list/2026-07-04.jsonl
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M guardian/lib/grammar-fallback.js
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/settings.json
A lib/contract-queue.js
M orchestrator.js
M orchestrator/lib/contract-poller.js
A orchestrator/lib/data/knowledge/facts.jsonl
```

### Build 0.9.8-r91 — snap-0237 — 2026-07-04 09:49:26

- Archive: `nexus-0237_2026-07-04_v0.9.8-r91_consolidated-4.zip` (was `nexus-consolidated-4.zip`)
- SHA-256: `1ca3f76b0e2801022a271ba3944f53cac7d50e4d7b5cef9fe87650894b6c737d`, 5.1 MB, downloaded 2026-07-04 09:49:44
- Kind: full
- Commit: `d27039de69e9f521d2ade247d133e9246c3a494a`, tag `snap-0237`
- Files in archive: 986. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |
| clear-glass | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| data | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/main/index.js
M copilot/module-builder.js
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M orchestrator.config.json
M orchestrator.js
M ui/tv-shell/index.html
```

### Build 0.9.8-r92 — snap-0238 — 2026-07-04 09:55:48

- Archive: `nexus-0238_2026-07-04_v0.9.8-r92_consolidated-5.zip` (was `nexus-consolidated-5.zip`)
- SHA-256: `a668a582fae5a524c7e34f8dd8a37f66972cab118a91eba05d1c5792fa153679`, 5.1 MB, downloaded 2026-07-04 09:56:40
- Kind: full
- Commit: `1c6cf9abb90042abdd78caced04641db618d74ad`, tag `snap-0238`
- Identical copy: `nexus-0238_2026-07-04_v0.9.8-r92_consolidated-6_dup1.zip` (was `nexus-consolidated-6.zip`)
- Files in archive: 986. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M copilot/server.js
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
```

### Build 0.9.8-r93 — snap-0239 — 2026-07-04 10:16:54

- Archive: `nexus-0239_2026-07-04_v0.9.8-r93_consolidated-7.zip` (was `nexus-consolidated-7.zip`)
- SHA-256: `8bacd6bcecadc2f29178dceeb5abe783e240fecfbba06af4e5113a201c2a151c`, 5.1 MB, downloaded 2026-07-04 10:17:16
- Kind: full
- Commit: `3e2d2f79c8c2b7c11852e7c962e2cf9d228d6f6e`, tag `snap-0239`
- Files in archive: 997. Changes against the build before it: **55 added, 69 modified, 44 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| warp | 25 | 0 | 0 |
| data | 0 | 6 | 16 |
| loom | 21 | 0 | 0 |
| guardian | 5 | 6 | 5 |
| tests | 0 | 10 | 4 |
| orchestrator | 0 | 6 | 6 |
| (root) | 4 | 5 | 1 |
| lib | 0 | 6 | 3 |
| clear-glass | 0 | 6 | 2 |
| copilot | 0 | 4 | 0 |
| cortex | 0 | 3 | 1 |
| hooks | 0 | 4 | 0 |
| docs | 0 | 1 | 2 |
| ui | 0 | 3 | 0 |
| service | 0 | 1 | 1 |
| idearium | 0 | 2 | 0 |
| cli | 0 | 1 | 1 |
| cos | 0 | 1 | 1 |
| meta | 0 | 2 | 0 |
| ollama | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| cockpit | 0 | 0 | 1 |

```
M autopilot.js
M blueprint-index.json
M bridge/causal/expectation.js
D clear-glass/cli.js
M clear-glass/renderer/browser.html
D clear-glass/src/api/wire.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/registry.js
M clear-glass/src/userscripts/manager.js
M cli/diagnose.js
D cli/forge.js
D cockpit/forge.js
M copilot/intuition.js
M copilot/lib/user-model.js
M copilot/registry-components.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/index.js
D cortex/core/raid/simulation.js
M cortex/registry-components.js
M cos/test.js
D cos/test/test.js
D docs/forge-ide.spec
D docs/loom.spec
M docs/nexus-relationship-shape.spec
M guardian/interaction-contract.json
M guardian/lib/ncp.js
M guardian/memory_store/settings.json
M guardian/registry-components.js
M guardian/server.js
A guardian/userscript-chatgpt.js
A guardian/userscript-claude.js
A guardian/userscript-gemini.js
A guardian/userscript-memory.js
A guardian/userscript-perplexity.js
D guardian/userscripts/chatgpt.js
D guardian/userscripts/claude.js
D guardian/userscripts/gemini.js
D guardian/userscripts/memory.js
D guardian/userscripts/perplexity.js
M hooks/copilot.hooks.js
M hooks/cortex.hooks.js
M hooks/guardian.hooks.js
M hooks/orchestrator.hooks.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M lib/blueprint-index.js
M lib/blueprint.js
M lib/cli-map.js
M lib/component-registry.js
D lib/forge-core.js
M lib/nexus-expansion-boot.js
D lib/pipeline/index.js
D lib/rfr2-bus-bridge.js
M lib/version.js
A loom/agent-suite/index.js
A loom/bootstrap.js
A loom/contracts/index.js
A loom/ingest/index.js
A loom/ingest/revisions.js
A loom/maps/warp-map.js
A loom/schema/axioms.js
A loom/schema/cortex-sync.js
A loom/schema/definitions.js
A loom/schema/driver.js
A loom/schema/gates.js
A loom/schema/index.js
A loom/schema/registry.js
A loom/server.js
A loom/templates/system-scaffold.js
A loom/test/agent-suite.test.js
A loom/test/contracts.test.js
A loom/test/ingest.test.js
A loom/test/schema.test.js
A loom/test/system-scaffold.test.js
M meta/cfr/sigma.js
M meta/gap/predicate.js
M nexus-connect.js
A nexus-heal-loop.js
A nexus-knowledge.js
A nexus-query.js
M ollama/registry-components.js
M orchestrator.config.json
M orchestrator.js
D orchestrator/interaction-contract.json
M orchestrator/lib/autonomous-loop.js
D orchestrator/lib/heal-loop.js
M orchestrator/lib/intent-map.js
D orchestrator/lib/knowledge.js
M orchestrator/lib/mutation-contract.js
D orchestrator/lib/query.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/spec-drift.js
D orchestrator/registry-components.js
A phase_map_11.html
D service/interaction-contract.json
M service/nexus-diagnostic.js
D test-live.js
M tests/modules/autonomous-loop.test.js
D tests/modules/component-sse-uniqueness.test.js
D tests/modules/nexus-intelligence-wiring.test.js
D tests/modules/nexus-query-surface.test.js
M tests/modules/nexus-seam.test.js
D tests/modules/raid-simulation.test.js
M tests/modules/spec-container.test.js
M tests/modules/test-grammar-fallback.js
M tests/modules/test-mutation-contract.js
M tests/modules/test-ui-registry.js
M tests/modules/user-model.test.js
M tests/ncp-race.test.js
M tests/nexus-full-audit.js
M tests/userscript-adapter-consistency.test.js
M ui/eravos/runtime/canvas-intelligence.js
M ui/home/index.html
M ui/tv-shell/index.html
A warp/LICENSE
A warp/MANIFEST.json
A warp/core/Axiom.js
A warp/core/Event.js
A warp/core/Gate.js
A warp/core/GateFusion.js
A warp/core/Stream.js
A warp/core/StreamLog.js
A warp/core/index.js
A warp/dispatch/benchmark.js
A warp/dispatch/canonicalize.js
A warp/dispatch/cascade.js
A warp/dispatch/deltaCache.js
A warp/dispatch/digest.js
A warp/dispatch/index.js
A warp/dispatch/population.js
A warp/dispatch/pregen.js
A warp/plugins/crystallizer-flatfile.js
A warp/plugins/scorer-default.js
A warp/test/core.test.js
A warp/test/digest-regression.test.js
A warp/test/dispatch.test.js
A warp/test/v1.1.0-additions.test.js
A warp/test/v1.4-additions.test.js
A warp/warp.spec
```

25 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.8-r94 — snap-0240 — 2026-07-04 10:20:42

- Archive: `nexus-0240_2026-07-04_v0.9.8-r94_consolidated-8.zip` (was `nexus-consolidated-8.zip`)
- SHA-256: `db815975207b8abb28abb34f26f472f10a970ad7a2482ead36a443d9e0783f1b`, 5.2 MB, downloaded 2026-07-04 10:21:55
- Kind: full
- Commit: `36c667652d6bcaa8544a781b8f0bbde7b0c57f03`, tag `snap-0240`
- Files in archive: 997. Changes against the build before it: **0 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/src/main/index.js
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M orchestrator.js
```

### Build 0.9.8-r95 — snap-0241 — 2026-07-04 11:18:42

- Archive: `nexus-0241_2026-07-04_v0.9.8-r95_tv-shell-uilog-fix-1.zip` (was `nexus-tv-shell-uilog-fix (1).zip`)
- SHA-256: `9ef6caacadbb9d950ee1a91dd6ec02354513904c1ce56e8e37aa2fa9b98f792e`, 0.1 MB, downloaded 2026-07-04 11:23:14
- Kind: overlay (a patch laid over the build before it)
- Commit: `7e16df881388246965403af8b6950901c182eba2`, tag `snap-0241`
- Files in archive: 1. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/tv-shell/index.html
```

### Build 0.9.8-r96 — snap-0242 — 2026-07-04 14:22:56

- Archive: `nexus-0242_2026-07-04_v0.9.8-r96_consolidated-8-1.zip` (was `nexus-consolidated-8 - 1.zip`)
- SHA-256: `153dad57002256ee84784a8a060aa22aad3d789ba078ee1b18ce749f0ec2116f`, 219.8 MB, downloaded 2026-07-04 14:25:55
- Kind: full
- Commit: `483876be3becdae1391e629ba2dafd917772f56f`, tag `snap-0242`
- Left out: node_modules (17438 files)
- Files in archive: 1261. Changes against the build before it: **264 added, 21 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 262 | 5 | 0 |
| guardian | 0 | 4 | 0 |
| ui | 2 | 2 | 0 |
| clear-glass | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| architect | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M blueprint-index.json
M bridge/types.js
M clear-glass/renderer/browser.html
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M orchestrator.js
M orchestrator/lib/contract-handshake.js
M ui/home/index.html
A ui/lib/api.js
A ui/lib/api.test.js
M ui/tv-shell/index.html
```

271 more (mostly data, logs and archived files) are in the ledger file.

