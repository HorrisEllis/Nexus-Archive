# Nexus 0.39.98

| | |
|---|---|
| Built | 2026-09-11 21:08:34 → 2026-09-11 23:31:58 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.98 |
| Tag | `v0.39.98` → snap-0553 |
| Full file ledger | [LEDGER-0.39.98.csv](../ledger/LEDGER-0.39.98.csv) |

## Ledger

### Build 0.39.98-r1 — snap-0552 — 2026-09-11 21:08:34

- Archive: `nexus-0552_2026-09-11_v0.39.98-r1.zip` (was `nexus_v0_39_98.zip`)
- SHA-256: `07bc3921d8ea5e6764d575e562fea9f2b57efa838f233d9be1ce20e851cb9a93`, 90.2 MB, downloaded 2026-09-11 21:09:59
- Kind: full
- Commit: `05903f3012eff6d82f7f7255287036567b1c2f9f`, tag `snap-0552`
- Left out: embedded .git (5563 files, HEAD b72cab5ba5ed07326bddffc2b021f827a6a33a7f (master))
- Left out: node_modules (39 files)
- Files in archive: 4932. Changes against the build before it: **2 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 3 | 0 |
| ui | 0 | 4 | 0 |
| cortex | 0 | 2 | 0 |
| data | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M cortex/core/raid/index.js
M cortex/self-heal/index.js
M data/cortex/memory/event_log.json
A data/cortex/memory/raid_tunables.json
M lib/version.js
M package.json
M scripts/precommit-check.js
M tests/full.test.js
M tests/modules/healer.test.js
M tests/modules/run-all.js
A tests/modules/test-self-heal-context.js
M ui/brainos/brainos-app.css
M ui/brainos/brainos-app.js
M ui/brainos/brainos-automation.js
M ui/brainos/index.html
```

### Build 0.39.98-r2 — snap-0553 — 2026-09-11 23:31:58

- Archive: `nexus-0553_2026-09-11_v0.39.98-r2_reorg-final.zip` (was `nexus_v0_39_98_reorg-final.zip`)
- SHA-256: `47486cefc33ab53abde8d586381281da6235aecc3279577efd0408671c874a57`, 91.9 MB, downloaded 2026-09-11 23:33:43
- Kind: full
- Commit: `81feeb7d3b1eff1ab9dae939fb012004a9fe0788`, tag `snap-0553`
- Left out: embedded .git (5738 files, HEAD b0a5c1e6366effdd1d5c90ea0be0f533c1b7cadd (master))
- Files in archive: 4942. Changes against the build before it: **40 added, 72 modified, 30 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 0 | 20 | 0 |
| _archive | 18 | 0 | 0 |
| cos | 0 | 11 | 6 |
| (root) | 0 | 1 | 13 |
| siso | 0 | 0 | 10 |
| cortex | 8 | 2 | 0 |
| lib | 0 | 9 | 0 |
| nexus | 7 | 0 | 0 |
| data | 2 | 4 | 0 |
| docs | 5 | 1 | 0 |
| orchestrator | 0 | 5 | 0 |
| loom | 0 | 4 | 0 |
| intelligence | 0 | 4 | 0 |
| cli | 0 | 3 | 0 |
| guardian | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| tools | 0 | 0 | 1 |
| versionium | 0 | 1 | 0 |
| warp | 0 | 1 | 0 |

```
D ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-09-10.md
D CHANGELOG-SESSION.md
D CHANGELOG.md
D CLAUDE.md
D SESSION-PROTOCOL.md
D START.md
D SYSTEM-MAP.md
A _archive/cos-manager-dead-2026-09-11/manager.js
A _archive/cos-playgrounds-orphaned-2026-09-11/cow-fs.js
A _archive/cos-playgrounds-orphaned-2026-09-11/factory.js
A _archive/cos-playgrounds-orphaned-2026-09-11/index.js
A _archive/cos-playgrounds-orphaned-2026-09-11/kernel.js
A _archive/cos-playgrounds-orphaned-2026-09-11/network-sim.js
A _archive/root-siso-orphaned-2026-09-11/siso/Event.js
A _archive/root-siso-orphaned-2026-09-11/siso/Gate.js
A _archive/root-siso-orphaned-2026-09-11/siso/MANIFEST.json
A _archive/root-siso-orphaned-2026-09-11/siso/Stream.js
A _archive/root-siso-orphaned-2026-09-11/siso/StreamLog.js
A _archive/root-siso-orphaned-2026-09-11/siso/core/index.js
A _archive/root-siso-orphaned-2026-09-11/siso/core/package.json
A _archive/root-siso-orphaned-2026-09-11/siso/index.js
A _archive/root-siso-orphaned-2026-09-11/siso/package.json
A _archive/root-siso-orphaned-2026-09-11/siso/spec/siso.spec
A _archive/superseded-docs-2026-09-11/CHANGELOG-SESSION.md
A _archive/superseded-docs-2026-09-11/SYSTEM-MAP.md
M architect/service.js
D autopilot.js
M cli/boot-systems.js
M cli/diagnose.js
M cli/session.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
A cortex/data/snapshots/09aee1c3-5f0f-4e11-8989-2500c3c6e7fa.nex
A cortex/data/snapshots/12b95ced-ac5e-42f4-b121-a31f31b43221.nex
A cortex/data/snapshots/4d0edd40-c2c4-41f2-aacf-1c1b6e587cd2.nex
A cortex/data/snapshots/652cd7d4-4ddb-4fc2-9bb6-9431bc9df1a3.nex
A cortex/data/snapshots/95b35c69-a8ea-4854-870e-fc638ebfc6cb.nex
A cortex/data/snapshots/cec5ac00-c997-4b6a-b174-883f6f43cd73.nex
A cortex/data/snapshots/dd37ec71-571d-4569-82ae-c53da0505a10.nex
A cortex/data/snapshots/dea4e772-951d-4c5e-a0df-20bc3b0f0853.nex
M cos/cli/commands/create.js
M cos/compartment/process-runner.js
M cos/host/event-bus.js
M cos/host/gates/archetype.js
M cos/host/gates/blueprint.js
M cos/host/gates/compartment.js
M cos/host/gates/playgrounds.js
M cos/host/gates/plugin.js
M cos/host/gates/process.js
M cos/host/gates/vault.js
M cos/host/index.js
D cos/manager.js
D cos/playgrounds/cow-fs.js
D cos/playgrounds/factory.js
D cos/playgrounds/index.js
D cos/playgrounds/kernel.js
D cos/playgrounds/network-sim.js
M data/autopilot/autopilot.log
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/ledger/r4-loom-history-test-1789190682861/r4-loom-history-test-1789190682861.probe/2026-09-12.jsonl
A data/loom/loom_events.buffer.jsonl
A docs/2026-09-11-compartment-nodetype-and-reorg-phasemap.spec
M docs/2026-09-11-sovereign-node-architecture-phasemap.spec
A docs/CHANGELOG.md
A docs/CLAUDE.md
A docs/SESSION-PROTOCOL.md
A docs/START.md
M eravos/server.js
M guardian/server.js
M intelligence/alk/index.js
M intelligence/gap/predicate.js
M intelligence/index.js
M intelligence/server.js
M lib/agent-tools/tools/execution/run-pipeline.js
M lib/compartment-engine.js
M lib/component-ledger.js
M lib/constitutional-ai.js
M lib/contract-registry-writer.js
M lib/fault-log.js
M lib/reflection.js
M lib/system-registry.js
M lib/uid/component-map.js
M loom/scanners/source-map.js
M loom/server.js
M loom/templates/system-scaffold.js
M loom/test/system-scaffold.test.js
D nexus-bus.js
D nexus-cfr-influence.js
D nexus-connect.js
D nexus-knowledge.js
D nexus-query.js
A nexus/autopilot.js
A nexus/data/autopilot/autopilot.log
A nexus/nexus-bus.js
A nexus/nexus-cfr-influence.js
A nexus/nexus-connect.js
A nexus/nexus-knowledge.js
A nexus/nexus-query.js
M ollama/server.js
M orchestrator/lib/changelog.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M orchestrator/lib/versionium-auto-commit.js
M orchestrator/orchestrator.js
M package.json
M scripts/precommit-check.js
D siso/Event.js
D siso/Gate.js
D siso/MANIFEST.json
D siso/Stream.js
D siso/StreamLog.js
D siso/core/index.js
D siso/core/package.json
D siso/index.js
D siso/package.json
D siso/spec/siso.spec
M tests/modules/changelog.test.js
M tests/modules/expectation-watcher.test.js
M tests/modules/raid-retry-escalation.test.js
M tests/modules/test-alk-lattice-live.js
M tests/modules/test-architect-pulse-migration.js
M tests/modules/test-autopilot-boot-gates.js
M tests/modules/test-autopilot-warp-spine.js
M tests/modules/test-boot-log-fixes.js
M tests/modules/test-boot-phases.js
M tests/modules/test-clear-glass-idle-vs-open.js
M tests/modules/test-clear-glass-single-instance.js
M tests/modules/test-emerge-direct-compile.js
M tests/modules/test-health-authority.js
M tests/modules/test-spawn-guard.js
M tests/modules/test-tablet-container-api.js
M tests/modules/test-tablet-graph-api.js
M tests/modules/test-tablet-ledger-api.js
M tests/modules/test-work-queue.js
M tests/modules/ui-self-diagnosis.test.js
M tests/nexus-full-audit.js
D tools/record-session-2026-08-17.js
M versionium/server.js
M warp/core/StreamLog.js
```

