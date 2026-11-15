# Nexus 0.9.13

| | |
|---|---|
| Built | 2026-07-14 13:42:14 → 2026-08-01 00:00:42 |
| Builds on the main line | 44 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.9.13 |
| Tag | `v0.9.13` → snap-0320 |
| Full file ledger | [LEDGER-0.9.13.csv](../ledger/LEDGER-0.9.13.csv) |

## Ledger

### Build 0.9.13-r1 — snap-0276 — 2026-07-14 13:42:14

- Archive: `nexus-0276_2026-07-14_v0.9.13-r1_merged.zip` (was `nexus-merged-0.9.13.zip`)
- SHA-256: `80fef0f899fc410f3a310b768c4e40bb8530e5f70eb02bf547d8e8c16b1f9e83`, 10.7 MB, downloaded 2026-07-14 15:36:06
- Kind: full
- Commit: `78e51471e449dd95685040d71192b80a75b795e8`, tag `snap-0276`
- Left out: embedded .git (1235 files, HEAD fb8a00dff536db06759f613b6e33e42bc887af6a (master))
- Files in archive: 1458. Changes against the build before it: **94 added, 49 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| meta | 40 | 1 | 0 |
| data | 27 | 4 | 0 |
| cortex | 5 | 7 | 0 |
| (root) | 5 | 6 | 0 |
| loom | 3 | 7 | 0 |
| lib | 3 | 4 | 0 |
| cos | 0 | 6 | 0 |
| nexus-healer | 5 | 0 | 0 |
| docs | 0 | 3 | 0 |
| tests | 1 | 1 | 0 |
| warp | 0 | 2 | 0 |
| hooks | 1 | 1 | 0 |
| guardian | 1 | 1 | 0 |
| copilot | 0 | 2 | 0 |
| unintegrated | 0 | 2 | 0 |
| emerge | 1 | 0 | 0 |
| scripts | 1 | 0 | 0 |
| service | 0 | 1 | 0 |
| ui | 1 | 0 | 0 |
| idearium | 0 | 1 | 0 |

```
A .gitignore
M CHANGELOG.md
A HANDOFF-2026-07-11.md
A SESSION-PROTOCOL.md
A VERIFICATION-LOG.md
M autopilot.js
M copilot/lib/expectation-watcher.js
M copilot/server.js
M cortex/boot.js
M cortex/contract/index.js
M cortex/data/baseline-events.ndjson
M cortex/intelligence/mastermind.js
M cortex/interaction-contract.json
A cortex/memory/bep-lookup.js
A cortex/memory/causal-lookup.js
A cortex/memory/decay.js
A cortex/memory/fix-map.js
M cortex/memory/jaa-db.js
A cortex/memory/tiers.js
M cortex/push-recall.js
M cos/kernel.js
M cos/manager.js
M cos/siso/Event.js
M cos/siso/Stream.js
M cos/siso/StreamLog.js
M cos/siso/index.js
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/event_log.json
M data/cortex/memory/memory_unified.json
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/diagnostic.pid
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
M data/idearium/cfr_state.json
M data/idearium/event_stats.json
A data/idearium/invariant/baseline.json
A data/ledger/test/test.widget.panel/2026-07-13.jsonl
A data/loom/registry.json
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
M docs/SPEC-REGISTRY.md
M docs/copilot-expansion.spec
M docs/nexus-copilot-recall.spec
A emerge/consumer.js
A guardian/clear-glass-bridge.js
M guardian/server.js
M hooks/index.js
A hooks/side-effect-parser.js
M idearium/ui/js/app.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/browser-action.js
A lib/agent-tools/tools/nexus-status.js
M lib/agent-tools/tools/query-intelligence.js
M lib/agent-tools/tools/query-recall.js
A lib/seam/cross-system-status.js
M lib/version.js
A loom/data/registry.json
A loom/scanners/closed-door.js
M loom/schema/definitions.js
M loom/schema/driver.js
M loom/schema/gates.js
M loom/schema/registry.js
A loom/seed/2026-07-11-session-wires.js
M loom/templates/system-scaffold.js
M loom/test/schema.test.js
M loom/test/system-scaffold.test.js
M meta/alk/index.js
A meta/causal-nexus/modules/adapter-sandbox/index.js
A meta/causal-nexus/modules/adapter/index.js
A meta/causal-nexus/modules/causality/index.js
A meta/causal-nexus/modules/clip/index.js
A meta/causal-nexus/modules/compress/index.js
A meta/causal-nexus/modules/context/index.js
A meta/causal-nexus/modules/delta/index.js
A meta/causal-nexus/modules/enforcement/index.js
A meta/causal-nexus/modules/forge/index.js
A meta/causal-nexus/modules/identity/index.js
A meta/causal-nexus/modules/index.js
A meta/causal-nexus/modules/kernel/index.js
A meta/causal-nexus/modules/lazy/index.js
A meta/causal-nexus/modules/ledger/index.js
A meta/causal-nexus/modules/loader/index.js
A meta/causal-nexus/modules/observer/index.js
A meta/causal-nexus/modules/persist/index.js
A meta/causal-nexus/modules/projection/index.js
A meta/causal-nexus/modules/query/index.js
A meta/causal-nexus/modules/sigma/index.js
A meta/causal-nexus/modules/time/index.js
A meta/causal-nexus/modules/version-gate/index.js
A meta/causal-nexus/mutate.cjs
A meta/causal-nexus/package.json
A meta/causal-nexus/recompute-trigger.cjs
A meta/causal-nexus/test/cross-domain/invariants.test.js
A meta/causal-nexus/test/run-all.js
A meta/causal-nexus/test/runner.js
A meta/causal-nexus/test/unit/adapter-sandbox.test.js
A meta/causal-nexus/test/unit/causality.test.js
A meta/causal-nexus/test/unit/clip.test.js
A meta/causal-nexus/test/unit/compress.test.js
A meta/causal-nexus/test/unit/context.test.js
A meta/causal-nexus/test/unit/kernel.test.js
A meta/causal-nexus/test/unit/ledger.test.js
A meta/causal-nexus/test/unit/loader-context.test.js
A meta/causal-nexus/test/unit/modules.test.js
A meta/causal-nexus/test/unit/observer-enforcement.test.js
A meta/causal-nexus/test/unit/sigma.test.js
A meta/causal-nexus/test/unit/version-gate.test.js
M nexus-cfr-influence.js
A nexus-healer/api/index.js
A nexus-healer/cli/index.js
A nexus-healer/docs/nexus-healer.spec.md
A nexus-healer/interaction-contract.json
A nexus-healer/registry-components.js
M orchestrator.js
M package.json
A scripts/run-verification-manifest.cjs
M service/nexus-diagnostic.js
A tests/hooks-side-effect-parser.test.js
M tests/modules/test-mutation-contract.js
A ui/ledger-viewer/index.html
M unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/causality.js
M unintegrated/README.md
A verification-manifest.json
M warp/core/Stream.js
M warp/core/StreamLog.js
M writeback-failures.jsonl
```

### identical — 0277 — 2026-07-14 13:42:14

- Archive: `nexus-0277_2026-07-14_v0.9.13-r1_merged-1_same-as-0276.zip` (was `nexus-merged-0.9.13 (1).zip`)
- SHA-256: `1e0b6be8831092c2f631d35c1aca992fb1e4f5934a9be31d1502b57cc9f41a80`, 12.2 MB, downloaded 2026-07-14 15:36:51
- Kind: identical (same tree as snap-0276; no commit)
- Left out: embedded .git (1637 files, HEAD fb8a00dff536db06759f613b6e33e42bc887af6a (master))

### Build 0.9.13-r2 — snap-0278 — 2026-07-14 15:40:50

- Archive: `nexus-0278_2026-07-14_v0.9.13-r2_merged-2.zip` (was `nexus-merged-0.9.13 (2).zip`)
- SHA-256: `37a00f909fe038acf75931c1e5dc169d977971c5e8a19b8bb8ae63622d3e9d7b`, 12.3 MB, downloaded 2026-07-14 15:41:43
- Kind: full
- Commit: `a7e411d06b05f306850bb4319dcc0085684d365b`, tag `snap-0278`
- Left out: embedded .git (1640 files, HEAD 0cfd7f7ad887c50f0558d083a8f1fe35d87caa3d (master))
- Files in archive: 1458. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |

```
M autopilot.js
```

### Build 0.9.13-r3 — snap-0279 — 2026-07-14 18:46:46

- Archive: `nexus-0279_2026-07-14_v0.9.13-r3_merged-3.zip` (was `nexus-merged-0.9.13 (3).zip`)
- SHA-256: `2a8ce7ec65fe4429f3141bb9dca803455319672075472b40c7cfdaf820a5b744`, 12.3 MB, downloaded 2026-07-14 19:40:38
- Kind: full
- Commit: `68b1377473d58ca8802a3646643047ee7ee1ffe1`, tag `snap-0279`
- Left out: embedded .git (1654 files, HEAD a158a25c9eb15c585dda2c3af6a8646b6b995d29 (master))
- Files in archive: 1458. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M cos/kernel.js
M cos/manager.js
M guardian/clear-glass-bridge.js
M lib/resource-monitor.js
```

### Build 0.9.13-r4 — snap-0280 — 2026-07-14 23:55:58

- Archive: `nexus-0280_2026-07-14_v0.9.13-r4_idearium-e2e-verified.zip` (was `nexus-idearium-e2e-verified.zip`)
- SHA-256: `c84a4b5bac86d101db502b48020582e0bb32375466520294ff5a7ba59298fea3`, 8 MB, downloaded 2026-07-15 00:13:36
- Kind: full
- Commit: `c6191d4fc7e5bcbdface05405960bb4bc35ba13f`, tag `snap-0280`
- Identical copy: `nexus-0280_2026-07-14_v0.9.13-r4_idearium-e2e-verified-1_dup1.zip` (was `nexus-idearium-e2e-verified-1.zip`)
- Files in archive: 2075. Changes against the build before it: **617 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 612 | 5 | 0 |
| data | 4 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M idearium/api/index.js
M idearium/index.js
A idearium/lib/db.js
M idearium/repo/index.js
M idearium/spec-engine/index.js
A idearium/test/e2e-pipeline.test.js
A lib/chunker/index.js
```

616 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r5 — snap-0281 — 2026-07-15 00:37:24

- Archive: `nexus-0281_2026-07-15_v0.9.13-r5_idearium-crashfix.zip` (was `nexus-idearium-crashfix.zip`)
- SHA-256: `73dcbe6eca36207d859cf293a306ab47858c821e177258ef83645ac99371eb63`, 8.2 MB, downloaded 2026-07-15 00:53:45
- Kind: full
- Commit: `25093f8cbba500d875f75cb51be6eddf8fd5ea4a`, tag `snap-0281`
- Files in archive: 2136. Changes against the build before it: **61 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 61 | 4 | 0 |
| data | 0 | 3 | 0 |
| guardian | 0 | 1 | 0 |

```
M data/cortex/memory/idearium_ideas.json
M data/cortex/memory/idearium_specs.json
M data/idearium/event_log.jsonl
M guardian/jaa-store.js
M idearium/api/index.js
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/00-preamble-7a8176b3.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/01-meta-6cdc7082.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/02-intent-stakeholders-44a4f8c9.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/03-intent-non-goals-0d69ca51.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/04-intent-invariants-6a7a1cd3.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/05-intent-tradeoffs-85ffa049.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/06-intent-success-conditions-bb4867b6.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/07-intent-failure-conditions-ea45dca6.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/08-intent-risk-assumptions-34dbb3f2.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/09-architecture-communication-4bf1f5a7.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/10-architecture-structure-a20a6e53.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/11-architecture-data-flow-ce86b22e.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/12-architecture-control-flow-91f04435.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/13-modules-identity-59655dc8.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/14-modules-time-5e46849e.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/15-modules-causality-8b8b468b.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/16-modules-kernel-865881b9.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/17-modules-adapter-afed8079.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/17172635-ce02-4f6a-ba71-e564c3552d2d.spec
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/18-modules-enforcement-95c78ae6.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/19-modules-ledger-e66ef00a.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/20-modules-persist-f2e86273.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/21-modules-forge-5c3fd402.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/22-modules-version-gate-e923afe2.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/23-modules-projection-5efadc0f.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/24-modules-lazy-d258413a.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/25-modules-adapter-sandbox-bc793a3c.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/26-modules-observer-62455f34.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/27-modules-delta-89b8954f.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/28-modules-query-4d0e39a4.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/29-modules-compress-09ba77cf.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/30-modules-context-67a42951.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/31-modules-clip-ec18e678.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/32-modules-sigma-95944f93.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/33-modules-loader-fb1f4d6a.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/34-causal-map-kernel-ingest-3df9ae51.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/35-causal-map-adapter-bridge-6009c065.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/36-causal-map-ring-eviction-875f3692.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/37-causal-map-ledger-promoteidea-e57c2363.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/38-causal-map-version-gate-validate-f046e181.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/39-event-model-stream-df1f2435.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/40-event-model-ring-buffer-3849b92f.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/41-event-model-event-types-ce0926e7.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/42-event-model-delivery-9496aff8.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/43-event-model-temporal-model-92b274c3.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/44-runtime-model-concurrency-c5a5e348.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/45-runtime-model-process-model-2f03121c.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/46-runtime-model-scheduling-741968b3.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/47-runtime-model-lifecycle-0efbc336.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/48-runtime-model-storage-ca71d460.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/49-runtime-model-resource-limits-38c7ec9f.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/50-interfaces-external-43963a25.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/51-interfaces-internal-f4b8c75a.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/52-interfaces-observability-68ebefa3.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/53-validation-gates-a77f9ce2.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/54-validation-drift-detection-5d5ff2f1.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/55-validation-static-analysis-dc9b05ea.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/56-validation-coverage-1ce5b0d6.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/57-snapshots-35761f23.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/58-evolution-log-fe783e9a.md
A idearium/data/specs/17172635-ce02-4f6a-ba71-e564c3552d2d/manifest.json
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/00-preamble-63859960.md
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/29941935-404b-4fe4-a3c4-a066df7f001f.spec
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/manifest.json
```

### Build 0.9.13-r6 — snap-0282 — 2026-07-15 00:58:22

- Archive: `nexus-0282_2026-07-15_v0.9.13-r6_idearium-trailing-slash-fix.zip` (was `nexus-idearium-trailing-slash-fix.zip`)
- SHA-256: `e2f79d0e17352fe16e2708741f184e0a99d898584b70f6b55e870c0967c342a7`, 8.2 MB, downloaded 2026-07-15 00:59:18
- Kind: full
- Commit: `5089762544b46b1f3e8e6f34d8ff614010f7d522`, tag `snap-0282`
- Files in archive: 2136. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |

```
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
M orchestrator.js
```

### Build 0.9.13-r7 — snap-0283 — 2026-07-15 01:03:00

- Archive: `nexus-0283_2026-07-15_v0.9.13-r7_clearglass-fix.zip` (was `nexus-clearglass-fix.zip`)
- SHA-256: `e19c8b980f93a5da0fccdc3c93e309896185f2d5ac5da9ea84062b59764d3680`, 8.2 MB, downloaded 2026-07-15 01:04:41
- Kind: full
- Commit: `f4f02e028c8d0d06a85384caae37bcd544ee6886`, tag `snap-0283`
- Files in archive: 2136. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |

```
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
M orchestrator.js
```

### Build 0.9.13-r8 — snap-0284 — 2026-07-15 01:06:58

- Archive: `nexus-0284_2026-07-15_v0.9.13-r8_file-read-timeout-fix.zip` (was `nexus-file-read-timeout-fix.zip`)
- SHA-256: `cde6868caf1ec1457cc2bf9a95fb35d0163317ea01b4603d4d642004cad9c190`, 8.3 MB, downloaded 2026-07-15 01:07:59
- Kind: full
- Commit: `f689f8486ee90a75a84ecdbb2585fec10f0268bc`, tag `snap-0284`
- Files in archive: 2197. Changes against the build before it: **61 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 61 | 4 | 0 |
| data | 0 | 3 | 0 |

```
M data/cortex/memory/idearium_ideas.json
M data/cortex/memory/idearium_specs.json
M data/idearium/event_log.jsonl
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/00-preamble-63859960.md
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/29941935-404b-4fe4-a3c4-a066df7f001f.spec
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/manifest.json
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/00-preamble-5a83bbb5.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/01-meta-08c09216.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/02-intent-stakeholders-12784a94.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/03-intent-non-goals-499ac733.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/04-intent-invariants-d5bff973.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/05-intent-tradeoffs-c61899d4.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/06-intent-success-conditions-e18a570b.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/07-intent-failure-conditions-0567ecff.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/08-intent-risk-assumptions-0b536d8e.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/09-architecture-communication-01fb4b44.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/10-architecture-structure-b428e731.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/11-architecture-data-flow-618a172b.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/12-architecture-control-flow-79e90ee5.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/13-modules-identity-c1f94f80.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/14-modules-time-4b44d722.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/15-modules-causality-3d67926b.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/16-modules-kernel-8e5c1d0a.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/17-modules-adapter-65260ff0.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/18-modules-enforcement-a383993d.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/19-modules-ledger-c0502a34.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/20-modules-persist-5eea9ddc.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/21-modules-forge-29c6ecae.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/22-modules-version-gate-9a38bdeb.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/23-modules-projection-5e7ec3ac.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/24-modules-lazy-f7cf0250.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/25-modules-adapter-sandbox-97cb5ea3.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/26-modules-observer-0196e9e4.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/27-modules-delta-2d1e4d13.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/28-modules-query-4a3332d0.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/29-modules-compress-8394596b.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/30-modules-context-30f8454c.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/31-modules-clip-8c9be0fd.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/32-modules-sigma-8d2814ae.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/33-modules-loader-a2090019.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/34-causal-map-kernel-ingest-046a1741.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/35-causal-map-adapter-bridge-fc4a5591.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/36-causal-map-ring-eviction-fa2b9902.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/37-causal-map-ledger-promoteidea-251f4d99.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/38-causal-map-version-gate-validate-499274d8.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/39-event-model-stream-60457625.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/40-event-model-ring-buffer-1c93976f.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/41-event-model-event-types-24a37ee3.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/42-event-model-delivery-50010eab.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/43-event-model-temporal-model-3e68aa25.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/44-runtime-model-concurrency-428a0c68.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/45-runtime-model-process-model-e70a19a8.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/46-runtime-model-scheduling-5e236526.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/47-runtime-model-lifecycle-16e37284.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/48-runtime-model-storage-1fd9b1db.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/49-runtime-model-resource-limits-e886c3cc.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/50-interfaces-external-733a63a1.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/51-interfaces-internal-70636e4e.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/52-interfaces-observability-ec15d77a.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/53-validation-gates-631e011a.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/54-validation-drift-detection-22bcf004.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/55-validation-static-analysis-e4b2799f.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/56-validation-coverage-c2659283.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/57-snapshots-80ebd8d6.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/58-evolution-log-084ed381.md
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e.spec
A idearium/data/specs/d9ee9fa1-eb73-47a2-a867-38ddffc2a46e/manifest.json
M idearium/ui/js/app.js
```

### Build 0.9.13-r9 — snap-0285 — 2026-07-15 22:14:58

- Archive: `nexus-0285_2026-07-15_v0.9.13-r9_file-read-timeout-fix-2.zip` (was `nexus-file-read-timeout-fix (2).zip`)
- SHA-256: `1130edfb0ebf2762966886e222d9ba44d25b142bb12e991457e4891422229208`, 24.1 MB, downloaded 2026-07-18 04:11:51
- Kind: full
- Commit: `c450904456d4ed62124122975b93e6e03f192487`, tag `snap-0285`
- Files in archive: 2642. Changes against the build before it: **601 added, 41 modified, 156 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 439 | 22 | 1 |
| idearium | 152 | 5 | 152 |
| docs | 8 | 1 | 0 |
| (root) | 1 | 4 | 0 |
| clear-glass | 0 | 2 | 2 |
| guardian | 0 | 4 | 0 |
| architect | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| emerge | 0 | 0 | 1 |
| warp | 1 | 0 | 0 |

```
M autopilot.js
M blueprint-index.json
D clear-glass/package-lock.json
D clear-glass/powershell.exe
M clear-glass/renderer/browser.html
M clear-glass/src/main/index.js
A docs/NEXUS-ENCYCLOPEDIA.md
A docs/NEXUS-PIPELINE-SPEC-2026-07-07 (1).md
A docs/NEXUS-PIPELINE-SPEC-2026-07-07 (2).md
A docs/NEXUS-PIPELINE-SPEC-2026-07-07(1).md
A docs/NEXUS-PLAIN-ENGLISH.md
M docs/NEXUS-STATE-SPEC-2026-07-06.md
A docs/Wiring the intelligence system - Claude.htm
A docs/guardian-server(1).js
A docs/nexus_complete_phase_map_v5.html
D emerge/package-lock.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
D idearium/Event.js
D idearium/Gate.js
D idearium/Gate2.js
M idearium/api/index.js
M idearium/index.js
A idearium/lib/cortex-listeners.js
M idearium/lib/db.js
A idearium/spec-engine/guardian-extract.js
M idearium/spec-engine/index.js
M idearium/ui/js/app.js
A nexus.zip
M package-lock.json
M package.json
A warp/plugins.zip
```

765 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r10 — snap-0286 — 2026-07-18 13:13:50

- Archive: `nexus-0286_2026-07-18_v0.9.13-r10_idearium-solid.zip` (was `nexus-idearium-solid.zip`)
- SHA-256: `b97964ed3a05fbef3241d98ec6c9e4b149abf95fab2f18a49012a6d0dd3fa199`, 15.2 MB, downloaded 2026-07-18 13:56:06
- Kind: full
- Commit: `d46d7f97f22c8673f997011ee33d9da2f3a9418f`, tag `snap-0286`
- Files in archive: 3388. Changes against the build before it: **747 added, 20 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 732 | 9 | 0 |
| data | 11 | 6 | 0 |
| guardian | 0 | 3 | 0 |
| lib | 1 | 1 | 0 |
| tests | 2 | 0 | 0 |
| (root) | 0 | 0 | 1 |
| cortex | 0 | 1 | 0 |
| meta | 1 | 0 | 0 |

```
M cortex/memory/jaa-db.js
M guardian/jaa-store.js
M guardian/server.js
M idearium/api/index.js
M idearium/index.js
M idearium/lib/db.js
M idearium/spec-engine/index.js
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/cortex-write.js
A lib/zip-writer.js
A meta/lattice/associative-lattice.js
D nexus.zip
A tests/modules/associative-lattice.test.js
A tests/modules/jaa-store-multiprocess.test.js
```

753 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r11 — snap-0287 — 2026-07-18 14:02:26

- Archive: `nexus-0287_2026-07-18_v0.9.13-r11_cortex-working-memory.zip` (was `nexus-cortex-working-memory.zip`)
- SHA-256: `bd480d4baaca09571bf6f4e85d793ff4a7e02bb3863030aa99c7a42c3b7ec911`, 15.4 MB, downloaded 2026-07-18 14:16:05
- Kind: full
- Commit: `0a7ca24e354e1d7ff4eeead30eb8c574d85908bd`, tag `snap-0287`
- Files in archive: 3449. Changes against the build before it: **62 added, 10 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 61 | 3 | 0 |
| data | 1 | 5 | 1 |
| cortex | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M cortex/boot.js
M data/cortex/memory/idearium_ideas.json
M data/cortex/memory/idearium_spec_chunks.json
M data/cortex/memory/idearium_spec_manifests.json
M data/cortex/memory/idearium_specs.json
M data/idearium/event_log.jsonl
A data/loom/loom_events.buffer.jsonl
D data/loom/registry.json
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/00-preamble-b80d8ac9.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/01-meta-6a019188.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/02-intent-stakeholders-dbfab34b.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/03-intent-non-goals-bb78ce22.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/04-intent-invariants-270fed59.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/05-intent-tradeoffs-6dfd510d.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/06-intent-success-conditions-87d71839.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/07-intent-failure-conditions-fb2de2a9.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/08-intent-risk-assumptions-36e89739.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/09-architecture-communication-35e20f44.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/10-architecture-structure-6d55861b.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/11-architecture-data-flow-66054b31.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/12-architecture-control-flow-8a5c6476.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/13-modules-identity-da7b6347.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/14-modules-time-5930fb01.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/15-modules-causality-c1d0c9c0.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/16-modules-kernel-9945f98c.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/17-modules-adapter-5831764c.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/18-modules-enforcement-f10f32bd.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/19-modules-ledger-2902128d.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/1dceaca3-622e-4f87-a9da-c46c298d5c81.spec
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/20-modules-persist-370ebb13.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/21-modules-forge-05aebcfa.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/22-modules-version-gate-3371a5f7.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/23-modules-projection-b1678359.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/24-modules-lazy-ecbdae00.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/25-modules-adapter-sandbox-12f354a3.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/26-modules-observer-13681e55.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/27-modules-delta-ed106401.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/28-modules-query-8ee7ee39.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/29-modules-compress-b87f31b1.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/30-modules-context-8fcb4236.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/31-modules-clip-65d4577b.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/32-modules-sigma-1d2d5595.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/33-modules-loader-9e7e570b.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/34-causal-map-kernel-ingest-aa7f5121.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/35-causal-map-adapter-bridge-a2fa688a.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/36-causal-map-ring-eviction-47499874.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/37-causal-map-ledger-promoteidea-fc50d097.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/38-causal-map-version-gate-validate-ecbdc106.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/39-event-model-stream-458bf2fe.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/40-event-model-ring-buffer-c5055da9.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/41-event-model-event-types-549f4eae.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/42-event-model-delivery-1f3d73b5.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/43-event-model-temporal-model-ab891d5c.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/44-runtime-model-concurrency-5ec5488e.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/45-runtime-model-process-model-e49ed7c4.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/46-runtime-model-scheduling-3ecc1a10.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/47-runtime-model-lifecycle-0cb45331.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/48-runtime-model-storage-f3e84524.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/49-runtime-model-resource-limits-2821a715.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/50-interfaces-external-03ce5b60.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/51-interfaces-internal-db6d1029.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/52-interfaces-observability-9d544f29.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/53-validation-gates-057a7568.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/54-validation-drift-detection-9e75283d.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/55-validation-static-analysis-112e1f7c.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/56-validation-coverage-69c03095.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/57-snapshots-6a84c062.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/58-evolution-log-c3177ca5.md
A idearium/data/specs/1dceaca3-622e-4f87-a9da-c46c298d5c81/manifest.json
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/00-preamble-63859960.md
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/29941935-404b-4fe4-a3c4-a066df7f001f.spec
M idearium/data/specs/29941935-404b-4fe4-a3c4-a066df7f001f/manifest.json
M loom/schema/registry.js
```

### Build 0.9.13-r12 — snap-0288 — 2026-07-19 05:13:40

- Archive: `nexus-0288_2026-07-19_v0.9.13-r12_working-memory-v2.zip` (was `nexus-working-memory-v2.zip`)
- SHA-256: `686a083012a3e44f78c990d74be4d5f9fb294a24394d200387d917142de712b3`, 15.4 MB, downloaded 2026-07-19 05:18:37
- Kind: full
- Commit: `91f90422177b7310e35459950babfd7bc197880a`, tag `snap-0288`
- Files in archive: 3454. Changes against the build before it: **5 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 5 | 0 | 0 |
| idearium | 0 | 3 | 0 |
| data | 0 | 1 | 0 |
| unintegrated | 0 | 1 | 0 |

```
A cortex/cortex-v2.js
A cortex/intelligence/index.js
A cortex/liminal-space/index.js
A cortex/versionium/causality.js
A cortex/versionium/index.js
M data/idearium/event_log.jsonl
M idearium/api/index.js
M idearium/ui/index.html
M idearium/ui/js/app.js
M unintegrated/2026-07-branch-b-cortex-v2/lib/meta/telemetry-codec/latent-model.js
```

### Build 0.9.13-r13 — snap-0289 — 2026-07-20 00:50:48

- Archive: `nexus-0289_2026-07-20_v0.9.13-r13_working-memory-v5.zip` (was `nexus-working-memory-v5.zip`)
- SHA-256: `517c233f57889e0b5fd6e178d69ec8632666490fdd54af3977f5b0c21a3aa157`, 15.4 MB, downloaded 2026-07-20 04:01:47
- Kind: full
- Commit: `000f9cc1c31a3ed5509828b428b145973c003cff`, tag `snap-0289`
- Files in archive: 3455. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |

```
M cortex/boot.js
M cortex/intelligence/index.js
M data/cortex/memory/guardian_settings.json
A data/cortex/memory/poll_log.json
M data/guardian/ledger/boot/events.ndjson
M guardian/memory_store/event_log.jsonl
```

### Build 0.9.13-r14 — snap-0290 — 2026-07-20 09:06:40

- Archive: `nexus-0290_2026-07-20_v0.9.13-r14_working-memory-v7.zip` (was `nexus-working-memory-v7.zip`)
- SHA-256: `7f7708a6edaf38317913ec45cb28bbfc3db5154fe4910c68057dbcbcf5466c51`, 15.1 MB, downloaded 2026-07-20 10:35:55
- Kind: full
- Commit: `6a5e7ffa75759a512e7ca4708edc2565f8def7c6`, tag `snap-0290`
- Files in archive: 3317. Changes against the build before it: **27 added, 11 modified, 165 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 0 | 150 |
| data | 15 | 4 | 0 |
| tests | 7 | 2 | 6 |
| cortex | 5 | 4 | 0 |
| ui | 0 | 0 | 5 |
| guardian | 0 | 1 | 3 |
| (root) | 0 | 0 | 1 |

```
M cortex/boot.js
M cortex/core/raid/index.js
A cortex/gap-finder/index.js
M cortex/liminal-space/index.js
M cortex/memory/jaa-db.js
A cortex/orion/index.js
A cortex/self-heal/escalation.js
A cortex/self-heal/fault-taxonomy.js
A cortex/self-heal/index.js
M guardian/jaa-store.js
D guardian/ui/agents/chatgpt/index.html.bak
D guardian/ui/agents/claude/index.html.bak
D guardian/ui/agents/gemini/index.html.bak
D nexus-connect.js.bak
D tests/audit-results.json
D tests/brutal-results.json
D tests/diagnose-results.json
D tests/integration-results.json
D tests/kernel-test-results.json
A tests/modules/_test-bus-helper.js
M tests/modules/run-all.js
A tests/modules/test-escalation.js
A tests/modules/test-fault-taxonomy.js
A tests/modules/test-gap-finder.js
M tests/modules/test-liminal-space.js
A tests/modules/test-orion.js
A tests/modules/test-raid-orion-wiring.js
A tests/modules/test-self-heal.js
D tests/pipeline-results.json
D ui/agents/chatgpt/index.html.bak
D ui/agents/claude/index.html.bak
D ui/agents/gemini/index.html.bak
D ui/blueprint-builder/index.html.bak
D ui/home/index.html.bak
```

169 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r15 — snap-0291 — 2026-07-20 10:53:44

- Archive: `nexus-0291_2026-07-20_v0.9.13-r15_working-memory-v8.zip` (was `nexus-working-memory-v8.zip`)
- SHA-256: `9c12a0e9d8957c654b026b7c86e288e4f13d248ab8dce4a1032035a4c84013a7`, 15.1 MB, downloaded 2026-07-20 10:55:01
- Kind: full
- Commit: `1cfce3c4d3f49d4bddd3a7d9c5d8bf5d33734781`, tag `snap-0291`
- Identical copy: `nexus-0291_2026-07-20_v0.9.13-r15_working-memory-v8-1_dup1.zip` (was `nexus-working-memory-v8 (1).zip`)
- Files in archive: 3319. Changes against the build before it: **2 added, 24 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 16 | 0 |
| cortex | 0 | 4 | 0 |
| tests | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M copilot/lib/user-model.js
M cortex/boot.js
M cortex/intelligence/index.js
M cortex/memory/jaa-db.js
M cortex/memory/tiers.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/cortex/memory/user_lattice.json
M data/cortex/memory/user_model_hypotheses.json
M data/ledger/cortex/cortex.gaps.list/2026-07-20.jsonl
M data/ledger/forge/forge.old/2026-07-20.jsonl
M data/ledger/forge/forge.patch/2026-07-20.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-20.jsonl
M data/ledger/reflection/reflection.engine/2026-07-20.jsonl
M data/ledger/test/test.echo.ping/2026-07-20.jsonl
M data/ledger/test/test.event.check/2026-07-20.jsonl
M data/ledger/test/test.widget.panel/2026-07-20.jsonl
M guardian/jaa-store.js
M orchestrator.js
M tests/modules/run-all.js
A tests/modules/test-user-model-radiate.js
```

### Build 0.9.13-r16 — snap-0292 — 2026-07-20 11:11:10

- Archive: `nexus-0292_2026-07-20_v0.9.13-r16_working-memory-v9.zip` (was `nexus-working-memory-v9.zip`)
- SHA-256: `ad15d11d1cf17748c5e3af7176119c909132c9322491b9b6a107dce7c627581c`, 15.1 MB, downloaded 2026-07-20 11:15:34
- Kind: full
- Commit: `6cfbb6d78747e6fe835e4873eb36a7ee0b33bb8b`, tag `snap-0292`
- Files in archive: 3320. Changes against the build before it: **1 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| tests | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |

```
M autopilot.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-20.jsonl
M data/ledger/forge/forge.old/2026-07-20.jsonl
M data/ledger/forge/forge.patch/2026-07-20.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-20.jsonl
M data/ledger/reflection/reflection.engine/2026-07-20.jsonl
M data/ledger/test/test.echo.ping/2026-07-20.jsonl
M data/ledger/test/test.event.check/2026-07-20.jsonl
M data/ledger/test/test.widget.panel/2026-07-20.jsonl
M tests/modules/run-all.js
A tests/modules/test-boot-phases.js
```

### Build 0.9.13-r17 — snap-0293 — 2026-07-20 11:29:24

- Archive: `nexus-0293_2026-07-20_v0.9.13-r17_working-memory-v10.zip` (was `nexus-working-memory-v10.zip`)
- SHA-256: `916a6c519ef5e4dfe5b4b5cd55368d7c3adb5ad0c6c17cbfd2493ca103fb895d`, 22.2 MB, downloaded 2026-07-20 12:58:39
- Kind: full
- Commit: `f1e9802747114cdcf457aee6ceacd4bbd8705e43`, tag `snap-0293`
- Identical copy: `nexus-0293_2026-07-20_v0.9.13-r17_working-memory-v10-1_dup1.zip` (was `nexus-working-memory-v10 (1).zip`)
- Left out: embedded .git (2238 files, HEAD 7ef832ab5d6455d9f2928928ac7b46f2ae4a2795 (master))
- Files in archive: 3322. Changes against the build before it: **2 added, 24 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| docs | 2 | 2 | 0 |
| (root) | 0 | 3 | 0 |
| cortex | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M CHANGELOG.md
M cortex/self-heal/escalation.js
M cortex/spec/cortex.spec
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-20.jsonl
M data/ledger/forge/forge.old/2026-07-20.jsonl
M data/ledger/forge/forge.patch/2026-07-20.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-20.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-20.jsonl
M data/ledger/reflection/reflection.engine/2026-07-20.jsonl
M data/ledger/test/test.echo.ping/2026-07-20.jsonl
M data/ledger/test/test.event.check/2026-07-20.jsonl
M data/ledger/test/test.widget.panel/2026-07-20.jsonl
A docs/cortex-phase-map.md
M docs/escalation.spec
A docs/handshake-ledger.spec
M docs/self-heal.spec
M lib/version.js
M orchestrator.js
M package.json
M tests/modules/test-escalation.js
```

### Build 0.9.13-r18 — snap-0294 — 2026-07-20 17:29:44

- Archive: `nexus-0294_2026-07-20_v0.9.13-r18_working-memory-v13.zip` (was `nexus-working-memory-v13.zip`)
- SHA-256: `8538e97b0cfe5a7d2b42f35fbba6f4d9146eb89abd84a01003591f06e245c15d`, 21.9 MB, downloaded 2026-07-20 17:42:38
- Kind: full
- Commit: `647b73a38a5b6add29baf2d5120ebfcb79dd64df`, tag `snap-0294`
- Left out: embedded .git (2433 files, HEAD 33f28a25be24e4bed57c7f11dbad89dbbdecab27 (master))
- Files in archive: 3343. Changes against the build before it: **23 added, 25 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 13 | 16 | 0 |
| tests | 4 | 1 | 0 |
| lib | 3 | 1 | 0 |
| (root) | 0 | 3 | 0 |
| architect | 0 | 1 | 2 |
| docs | 2 | 0 | 0 |
| clear-glass | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| orchestrator | 1 | 0 | 0 |

```
M CHANGELOG.md
M architect/service.js
D architect/src/hooks/Registry.js
D architect/src/hooks/sync-from-component-registry.js
M autopilot.js
M clear-glass/src/copilot/bridge.js
M cortex/memory/tiers.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/sigma_records.json
A data/cortex/memory/sigma_rollups.json
M data/ledger/cortex/cortex.gaps.list/2026-07-20.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-21.jsonl
M data/ledger/forge/forge.old/2026-07-20.jsonl
A data/ledger/forge/forge.old/2026-07-21.jsonl
M data/ledger/forge/forge.patch/2026-07-20.jsonl
A data/ledger/forge/forge.patch/2026-07-21.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-20.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-21.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-20.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-21.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-20.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-21.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-20.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-21.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-20.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-21.jsonl
M data/ledger/reflection/reflection.engine/2026-07-20.jsonl
A data/ledger/reflection/reflection.engine/2026-07-21.jsonl
M data/ledger/test/test.echo.ping/2026-07-20.jsonl
A data/ledger/test/test.echo.ping/2026-07-21.jsonl
M data/ledger/test/test.event.check/2026-07-20.jsonl
A data/ledger/test/test.event.check/2026-07-21.jsonl
M data/ledger/test/test.widget.panel/2026-07-20.jsonl
A data/ledger/test/test.widget.panel/2026-07-21.jsonl
A docs/hooks-migration.spec
A docs/nexus-worklog-and-phasemap.md
A lib/capability-registry.js
A lib/hook-registry.js
A lib/hook-sync-from-component-registry.js
M lib/version.js
M loom/server.js
M orchestrator.js
A orchestrator/lib/sigma-compaction.js
M tests/modules/run-all.js
A tests/modules/test-capability-registry.js
A tests/modules/test-hook-ownership.js
A tests/modules/test-sigma-compaction.js
A tests/modules/test-spawn-guard.js
```

### Build 0.9.13-r19 — snap-0295 — 2026-07-20 17:29:44

- Archive: `nexus-0295_2026-07-20_v0.9.13-r19_working-memory-v13-1.zip` (was `nexus-working-memory-v13 (1).zip`)
- SHA-256: `3a919d57cd2a09fe6037817231ecfb136d643ae27175f3fd20d27f6dd20a4b1b`, 22.3 MB, downloaded 2026-07-20 21:10:14
- Kind: full
- Commit: `a2e9867f200ddc4803f841052e0d9462d77deed9`, tag `snap-0295`
- Left out: embedded .git (2433 files, HEAD 33f28a25be24e4bed57c7f11dbad89dbbdecab27 (master))
- Files in archive: 3344. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |

```
A MASTERMIND-v4_6_0-clearglass.zip
```

### Build 0.9.13-r20 — snap-0296 — 2026-07-23 18:18:52

- Archive: `nexus-0296_2026-07-23_v0.9.13-r20_working-memory-v15.zip` (was `nexus-working-memory-v15.zip`)
- SHA-256: `f0220f9d8b8072d7495ca3471a656633b3e3d71bc6789f3892566a0b2b492a4d`, 22.3 MB, downloaded 2026-07-23 20:25:14
- Kind: full
- Commit: `cf882a2348bd5b31f0f32dd3a083d10c009b6832`, tag `snap-0296`
- Left out: embedded .git (2593 files, HEAD 8364397baba2c480e92c3cafb600d693017ca3a6 (master))
- Files in archive: 3364. Changes against the build before it: **21 added, 24 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 12 | 15 | 0 |
| docs | 6 | 4 | 0 |
| cortex | 2 | 1 | 0 |
| (root) | 0 | 1 | 1 |
| tests | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M CHANGELOG.md
D MASTERMIND-v4_6_0-clearglass.zip
M cortex/boot.js
A cortex/core/raid/envelope.js
A cortex/core/raid/router.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-21.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-21.jsonl
A data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-21.jsonl
A data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-21.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-21.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-21.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-21.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-21.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-21.jsonl
A data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-21.jsonl
A data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-21.jsonl
A data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-21.jsonl
A data/ledger/test/test.widget.panel/2026-07-24.jsonl
A docs/AXIOMS-v3.1-superseded-2026-07-19.md
M docs/AXIOMS-v3.1.md
M docs/SPEC-REGISTRY.md
A docs/nexus-convergence-phasemap.md
A docs/nexus-full-audit.md
A docs/nexus-mind-map.md
A docs/nexus-orphan-inventory.md
M docs/nexus-worklog-and-phasemap.md
M docs/raid.spec
A docs/registry-consolidation.spec
M lib/version.js
M orchestrator/lib/spec-drift.js
M tests/modules/run-all.js
A tests/modules/test-raid-router.js
```

### Build 0.9.13-r21 — snap-0297 — 2026-07-23 18:41:34

- Archive: `nexus-0297_2026-07-23_v0.9.13-r21_working-memory-v16.zip` (was `nexus-working-memory-v16.zip`)
- SHA-256: `9212f71a73f8d1b88691945f559665ccd516568cde038b50ddf6d1d7971ad58d`, 22.5 MB, downloaded 2026-07-23 18:45:49
- Kind: full
- Commit: `d8a4ec074aa8fe4d6d7db185a5c145568aa9c210`, tag `snap-0297`
- Left out: embedded .git (2646 files, HEAD 054d8241a74bf76821a80b5f641a26b0189109bd (master))
- Files in archive: 3364. Changes against the build before it: **0 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| ui | 0 | 3 | 0 |
| architect | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M architect/service.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/registry-consolidation.spec
M loom/server.js
M tests/modules/test-hook-ownership.js
M ui/channels/overview/overview.html
M ui/home/index.html
M ui/tv-shell/index.html
```

### Build 0.9.13-r22 — snap-0298 — 2026-07-24 04:57:26

- Archive: `nexus-0298_2026-07-24_v0.9.13-r22_working-memory-v20.zip` (was `nexus-working-memory-v20.zip`)
- SHA-256: `c75596a91d18cc54cfb79d7b119aa25020cc3258d65ea83a8b09cbe7b227ccc0`, 22.9 MB, downloaded 2026-07-24 05:03:30
- Kind: full
- Commit: `84616db0718d68bb0aabb91426ba54c61b033a37`, tag `snap-0298`
- Left out: embedded .git (2809 files, HEAD 94cf23800492830033915517a4a864f6037eae69 (master))
- Files in archive: 3369. Changes against the build before it: **5 added, 26 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| docs | 2 | 2 | 0 |
| tests | 2 | 2 | 0 |
| ui | 0 | 3 | 0 |
| cortex | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M autopilot.js
M cortex/boot.js
M cortex/memory/jaa-db.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
A docs/nexus-tablet-v0.1.0-superseded.spec
A docs/nexus-tablet.spec
M docs/registry-consolidation.spec
M guardian/jaa-store.js
A lib/consumer-registry.js
M tests/modules/run-all.js
A tests/modules/test-consumer-registry.js
A tests/modules/test-jaa-selective-load.js
M tests/modules/test-spawn-guard.js
M ui/channels/overview/overview.html
M ui/home/index.html
M ui/tv-shell/index.html
```

### Build 0.9.13-r23 — snap-0299 — 2026-07-24 05:27:34

- Archive: `nexus-0299_2026-07-24_v0.9.13-r23_working-memory-v21.zip` (was `nexus-working-memory-v21.zip`)
- SHA-256: `47515f73e326a50d6faf79cdca3c775a66d2e28e144f95dc576130fc5a0034d1`, 23 MB, downloaded 2026-07-24 06:21:15
- Kind: full
- Commit: `b9ea746b0f90dbc526ca7d76128be3e4b16c7ffa`, tag `snap-0299`
- Identical copy: `nexus-0299_2026-07-24_v0.9.13-r23_working-memory-v21-1_dup1.zip` (was `nexus-working-memory-v21-1.zip`)
- Left out: embedded .git (2850 files, HEAD 0ba006d2ec707e30b33e3f101e6d2f5a0a7be69f (master))
- Files in archive: 3369. Changes against the build before it: **0 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| guardian | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M guardian/jaa-store.js
M tests/modules/test-jaa-selective-load.js
```

### Build 0.9.13-r24 — snap-0300 — 2026-07-24 06:41:16

- Archive: `nexus-0300_2026-07-24_v0.9.13-r24_working-memory-v24.zip` (was `nexus-working-memory-v24.zip`)
- SHA-256: `cd50fb91f07468af2d289c1636ee5f153c991e215237413a537aaad09539c26a`, 23.2 MB, downloaded 2026-07-24 06:45:22
- Kind: full
- Commit: `9d6e902664769c079568d7ee69e8014f6b2a16a3`, tag `snap-0300`
- Left out: embedded .git (2989 files, HEAD 37957e880a11d47cd0bbe59e8b4b93b5333e1da1 (master))
- Files in archive: 3370. Changes against the build before it: **1 added, 26 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| meta | 0 | 9 | 0 |
| tests | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
M meta/rfr2/adapter-sandbox/index.js
M meta/rfr2/delta/index.js
M meta/rfr2/enforcement/index.js
M meta/rfr2/identity/index.js
M meta/rfr2/lazy/index.js
M meta/rfr2/observer/index.js
M meta/rfr2/query/index.js
M meta/rfr2/time/index.js
M meta/rfr2/version-gate/index.js
M tests/modules/run-all.js
A tests/modules/test-rfr2-cjs.js
```

### Build 0.9.13-r25 — snap-0301 — 2026-07-24 07:43:10

- Archive: `nexus-0301_2026-07-24_v0.9.13-r25_working-memory-v28.zip` (was `nexus-working-memory-v28.zip`)
- SHA-256: `6a259b2985a1c9866af1dac36e568a3e20871f1dc1b1328aeb3728f5e399346b`, 23.6 MB, downloaded 2026-07-24 07:49:18
- Kind: full
- Commit: `34b86e83e3eebfd28bc874dba727da936b9d85ef`, tag `snap-0301`
- Left out: embedded .git (3247 files, HEAD 841c3134f59920ceda3cb880a1848b531dcf8ac6 (master))
- Files in archive: 3375. Changes against the build before it: **8 added, 23 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| idearium | 2 | 1 | 2 |
| tests | 3 | 2 | 0 |
| docs | 2 | 1 | 0 |
| warp | 1 | 1 | 1 |
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M autopilot.js
M clear-glass/src/main/index.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
A docs/jaa-store.spec
A docs/rfr2.spec
A idearium/lib/event-ledger.cjs
D idearium/lib/event-ledger.js
A idearium/lib/spec-container.cjs
D idearium/lib/spec-container.js
M idearium/repo/watcher.js
M orchestrator/lib/sigma-writer.js
M tests/modules/run-all.js
M tests/modules/spec-container.test.js
A tests/modules/test-clear-glass-idle-vs-open.js
A tests/modules/test-clear-glass-single-instance.js
A tests/modules/test-idearium-cjs-under-esm.js
M warp/MANIFEST.json
A warp/spec/warp.spec
D warp/warp.spec
```

### Build 0.9.13-r26 — snap-0302 — 2026-07-24 08:37:52

- Archive: `nexus-0302_2026-07-24_v0.9.13-r26_working-memory-v30.zip` (was `nexus-working-memory-v30.zip`)
- SHA-256: `4f0f1f3e1d478820e3f3fd95f2cf81606b338fe27f607d4dd966aeea62b3300c`, 23.9 MB, downloaded 2026-07-24 08:55:42
- Kind: full
- Commit: `37e6c98741893f6b1a7ccabf89deef092e40276f`, tag `snap-0302`
- Left out: embedded .git (3358 files, HEAD 0e13d93c9a5afac7263ad9c618e28956f5b2e5f7 (master))
- Files in archive: 3380. Changes against the build before it: **5 added, 23 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| meta | 5 | 4 | 0 |
| docs | 0 | 2 | 0 |
| nexus-healer | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
M docs/rfr2.spec
A meta/rfr2/adapter/index.js
A meta/rfr2/causality/index.js
M meta/rfr2/clip/index.js
M meta/rfr2/compress/index.js
M meta/rfr2/context/index.js
A meta/rfr2/forge/index.js
M meta/rfr2/index.js
A meta/rfr2/kernel/index.js
A meta/rfr2/sigma/index.js
M nexus-healer/api/index.js
M tests/modules/test-rfr2-cjs.js
```

### Build 0.9.13-r27 — snap-0303 — 2026-07-24 09:06:18

- Archive: `nexus-0303_2026-07-24_v0.9.13-r27_working-memory-v31.zip` (was `nexus-working-memory-v31.zip`)
- SHA-256: `b8aab3f7dc3d6614a738838256d22476d420be871e61fa1882a92485b13599a5`, 24 MB, downloaded 2026-07-24 09:12:57
- Kind: full
- Commit: `eab21c490805ae84b96fc82aaef1625a8a586d97`, tag `snap-0303`
- Left out: embedded .git (3402 files, HEAD b85ddfeb9a15dd47007de73b08ad84d064814b56 (master))
- Files in archive: 3381. Changes against the build before it: **1 added, 18 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 15 | 0 |
| tests | 1 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M cortex/boot.js
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
M tests/modules/run-all.js
A tests/modules/test-cortex-heartbeat.js
```

### Build 0.9.13-r28 — snap-0304 — 2026-07-24 11:19:24

- Archive: `nexus-0304_2026-07-24_v0.9.13-r28_working-memory-v34.zip` (was `nexus-working-memory-v34.zip`)
- SHA-256: `4897529d10f4ca069c2fd5fc463d0b3458105a11f456b6a8a804305be0b9aaf7`, 24.3 MB, downloaded 2026-07-24 11:34:11
- Kind: full
- Commit: `6f77d77f74eac5a8dfed8e491c9df8c4f44bb9cf`, tag `snap-0304`
- Left out: embedded .git (3533 files, HEAD 7ec60e983d9051a7f0942dab90ee3acf172e86b4 (master))
- Files in archive: 3385. Changes against the build before it: **4 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 16 | 0 |
| tests | 3 | 1 | 0 |
| docs | 0 | 3 | 0 |
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| tablet | 1 | 0 | 0 |

```
M autopilot.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
M docs/jaa-store.spec
M docs/nexus-tablet.spec
M guardian/jaa-store.js
A tablet/index.html
M tests/modules/run-all.js
A tests/modules/test-autopilot-warp-spine.js
A tests/modules/test-jaa-flush-lock.js
A tests/modules/test-tablet-ledger-api.js
```

### Build 0.9.13-r29 — snap-0305 — 2026-07-24 11:46:30

- Archive: `nexus-0305_2026-07-24_v0.9.13-r29_working-memory-v36.zip` (was `nexus-working-memory-v36.zip`)
- SHA-256: `fb5c39f7040779202e357e5f461eee1cc132cac0e08193867c4f417adfb94b7d`, 26.1 MB, downloaded 2026-07-24 11:47:16
- Kind: full
- Commit: `c9dcd9407878dc296a7b7ef8e26fc420783c53bd`, tag `snap-0305`
- Identical copy: `nexus-0305_2026-07-24_v0.9.13-r29_working-memory-v36-1_dup1.zip` (was `nexus-working-memory-v36-1.zip`)
- Left out: embedded .git (3628 files, HEAD 763a11b16041b43850c385b590474d29bcb5c7fd (master))
- Files in archive: 3390. Changes against the build before it: **5 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 16 | 0 |
| tests | 2 | 1 | 0 |
| cli | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M cli/cfr-debug.js
M cli/diagnose.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_log.jsonl
A data/guardian/ledger/cfr/event_stats.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
M docs/SPEC-REGISTRY.md
M guardian/server.js
M lib/ico.js
M tests/modules/run-all.js
A tests/modules/test-guardian-cfr-consolidation.js
A tests/modules/test-ico-ledger-writethrough.js
```

### Build 0.9.13-r30 — snap-0306 — 2026-07-24 21:08:40

- Archive: `nexus-0306_2026-07-24_v0.9.13-r30_working-memory-v42.zip` (was `nexus-working-memory-v42.zip`)
- SHA-256: `720d7bc8bd495e0f79dcf98b313b038796445de814b3a0f3f8f73f162366ccfd`, 26.7 MB, downloaded 2026-07-24 21:32:40
- Kind: full
- Commit: `084ec5c28d902689c3cbf372eca6946276a68d15`, tag `snap-0306`
- Left out: embedded .git (3914 files, HEAD 7a553ed14ed27a823a399c526609c28b2fb56ac7 (master))
- Files in archive: 3408. Changes against the build before it: **18 added, 26 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 12 | 16 | 0 |
| tests | 4 | 2 | 0 |
| lib | 2 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| docs | 0 | 2 | 0 |
| tablet | 0 | 1 | 0 |

```
M autopilot.js
M cortex/boot.js
M cortex/core/raid/router.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-24.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-25.jsonl
M data/ledger/forge/forge.old/2026-07-24.jsonl
A data/ledger/forge/forge.old/2026-07-25.jsonl
M data/ledger/forge/forge.patch/2026-07-24.jsonl
A data/ledger/forge/forge.patch/2026-07-25.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-24.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-24.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-24.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-24.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-24.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-25.jsonl
M data/ledger/reflection/reflection.engine/2026-07-24.jsonl
A data/ledger/reflection/reflection.engine/2026-07-25.jsonl
M data/ledger/test/test.echo.ping/2026-07-24.jsonl
A data/ledger/test/test.echo.ping/2026-07-25.jsonl
M data/ledger/test/test.event.check/2026-07-24.jsonl
A data/ledger/test/test.event.check/2026-07-25.jsonl
M data/ledger/test/test.widget.panel/2026-07-24.jsonl
A data/ledger/test/test.widget.panel/2026-07-25.jsonl
M docs/SPEC-REGISTRY.md
M docs/nexus-tablet.spec
A lib/bus-subscriptions.js
A lib/config-governance.js
M lib/consumer-registry.js
M orchestrator.js
M tablet/index.html
M tests/modules/run-all.js
A tests/modules/test-bus-subscriptions.js
A tests/modules/test-config-governance.js
A tests/modules/test-tablet-container-api.js
A tests/modules/test-tablet-graph-api.js
M tests/modules/test-tablet-ledger-api.js
```

### Build 0.9.13-r31 — snap-0307 — 2026-07-24 22:17:40

- Archive: `nexus-0307_2026-07-24_v0.9.13-r31_working-memory-v43.zip` (was `nexus-working-memory-v43.zip`)
- SHA-256: `6e4b5f4185a26defa989dbc430d0408e733b31f874364ebb8f88069a2797db05`, 26.9 MB, downloaded 2026-07-24 22:22:18
- Kind: full
- Commit: `7ba6e851cc472aea9d7774c561d79c259a45a6ea`, tag `snap-0307`
- Identical copy: `nexus-0307_2026-07-24_v0.9.13-r31_working-memory-v43-1_dup1.zip` (was `nexus-working-memory-v43-1.zip`)
- Left out: embedded .git (3958 files, HEAD b394d7b9cb976db9b9199e2bde5df8aae7f04d3f (master))
- Files in archive: 3409. Changes against the build before it: **1 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 16 | 0 |
| tests | 1 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |

```
M autopilot.js
M cli/diagnose.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/ledger/cortex/cortex.gaps.list/2026-07-25.jsonl
M data/ledger/forge/forge.old/2026-07-25.jsonl
M data/ledger/forge/forge.patch/2026-07-25.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-25.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-25.jsonl
M data/ledger/reflection/reflection.engine/2026-07-25.jsonl
M data/ledger/test/test.echo.ping/2026-07-25.jsonl
M data/ledger/test/test.event.check/2026-07-25.jsonl
M data/ledger/test/test.widget.panel/2026-07-25.jsonl
M tests/modules/run-all.js
A tests/modules/test-autopilot-boot-gates.js
M tests/modules/test-boot-phases.js
```

### Build 0.9.13-r32 — snap-0308 — 2026-07-26 23:03:48

- Archive: `nexus-0308_2026-07-26_v0.9.13-r32_working-memory-v52.zip` (was `nexus-working-memory-v52.zip`)
- SHA-256: `e7df406350bb44d9949dddeb5b791572a08b57e64a3ddce9ac2978a7350ebcbe`, 28.9 MB, downloaded 2026-07-26 23:42:21
- Kind: full
- Commit: `564732a7d178a818931c24521a59cae1e1a9be88`, tag `snap-0308`
- Left out: embedded .git (4476 files, HEAD a0b6b8227c4ee46e43d74282d21f2a5275d971f1 (master))
- Files in archive: 3405. Changes against the build before it: **36 added, 25 modified, 40 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 27 | 13 | 0 |
| meta | 0 | 0 | 40 |
| tests | 7 | 3 | 0 |
| docs | 2 | 1 | 0 |
| lib | 0 | 3 | 0 |
| cortex | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M architect/src/ui/alk-lattice.html
M autopilot.js
M cortex/boot.js
M cortex/data/baseline-events.ndjson
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/diagnostic/baseline-events.ndjson
A data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
A data/ledger/cortex/cortex.gaps.list/2026-07-26.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-27.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-07-26.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-07-26.jsonl
A data/ledger/forge/forge.old/2026-07-26.jsonl
A data/ledger/forge/forge.old/2026-07-27.jsonl
A data/ledger/forge/forge.patch/2026-07-26.jsonl
A data/ledger/forge/forge.patch/2026-07-27.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-26.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-26.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-26.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-26.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-26.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-27.jsonl
A data/ledger/reflection/reflection.engine/2026-07-26.jsonl
A data/ledger/reflection/reflection.engine/2026-07-27.jsonl
A data/ledger/test/test.echo.ping/2026-07-26.jsonl
A data/ledger/test/test.echo.ping/2026-07-27.jsonl
A data/ledger/test/test.event.check/2026-07-26.jsonl
A data/ledger/test/test.event.check/2026-07-27.jsonl
A data/ledger/test/test.widget.panel/2026-07-26.jsonl
A data/ledger/test/test.widget.panel/2026-07-27.jsonl
M data/orchestrator/baseline-events.ndjson
A docs/PHASE-MAP-TEMP.md
M docs/SPEC-REGISTRY.md
A docs/nexus-sentinel.spec
M lib/component-ledger.js
M lib/config-governance.js
M lib/contract-queue.js
D meta/causal-nexus/modules/adapter-sandbox/index.js
D meta/causal-nexus/modules/adapter/index.js
D meta/causal-nexus/modules/causality/index.js
D meta/causal-nexus/modules/clip/index.js
D meta/causal-nexus/modules/compress/index.js
D meta/causal-nexus/modules/context/index.js
D meta/causal-nexus/modules/delta/index.js
D meta/causal-nexus/modules/enforcement/index.js
D meta/causal-nexus/modules/forge/index.js
D meta/causal-nexus/modules/identity/index.js
D meta/causal-nexus/modules/index.js
D meta/causal-nexus/modules/kernel/index.js
D meta/causal-nexus/modules/lazy/index.js
D meta/causal-nexus/modules/ledger/index.js
D meta/causal-nexus/modules/loader/index.js
D meta/causal-nexus/modules/observer/index.js
D meta/causal-nexus/modules/persist/index.js
D meta/causal-nexus/modules/projection/index.js
D meta/causal-nexus/modules/query/index.js
D meta/causal-nexus/modules/sigma/index.js
D meta/causal-nexus/modules/time/index.js
D meta/causal-nexus/modules/version-gate/index.js
D meta/causal-nexus/mutate.cjs
D meta/causal-nexus/package.json
D meta/causal-nexus/recompute-trigger.cjs
D meta/causal-nexus/test/cross-domain/invariants.test.js
D meta/causal-nexus/test/run-all.js
D meta/causal-nexus/test/runner.js
D meta/causal-nexus/test/unit/adapter-sandbox.test.js
D meta/causal-nexus/test/unit/causality.test.js
D meta/causal-nexus/test/unit/clip.test.js
D meta/causal-nexus/test/unit/compress.test.js
D meta/causal-nexus/test/unit/context.test.js
D meta/causal-nexus/test/unit/kernel.test.js
D meta/causal-nexus/test/unit/ledger.test.js
D meta/causal-nexus/test/unit/loader-context.test.js
D meta/causal-nexus/test/unit/modules.test.js
D meta/causal-nexus/test/unit/observer-enforcement.test.js
D meta/causal-nexus/test/unit/sigma.test.js
D meta/causal-nexus/test/unit/version-gate.test.js
M service/nexus-diagnostic.js
A tests/modules/_purge-test-rows.js
M tests/modules/run-all.js
A tests/modules/test-alk-lattice-live.js
M tests/modules/test-config-governance.js
A tests/modules/test-contract-queue-hardening.js
A tests/modules/test-diagnostic-heal-path.js
A tests/modules/test-health-authority.js
M tests/modules/test-ico-ledger-writethrough.js
A tests/modules/test-intelligence-core-wired.js
A tests/modules/test-ledger-schema.js
```

### Build 0.9.13-r33 — snap-0309 — 2026-07-30 06:13:00

- Archive: `nexus-0309_2026-07-30_v0.9.13-r33_working-memory-v56.zip` (was `nexus-working-memory-v56.zip`)
- SHA-256: `f8f9eb30604265dcab99e7e066a26f893a16cf4382266311205a6da5df2d225a`, 29.2 MB, downloaded 2026-07-30 06:14:13
- Kind: full
- Commit: `73d921528740cfb79b666a07317a796eac72ef0e`, tag `snap-0309`
- Identical copy: `nexus-0309_2026-07-30_v0.9.13-r33_working-memory-v56-1_dup1.zip` (was `nexus-working-memory-v56-1.zip`)
- Left out: embedded .git (4664 files, HEAD dd705ecd255fb332a5431672bcb94f5820ac29c0 (master))
- Files in archive: 3424. Changes against the build before it: **19 added, 26 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 14 | 16 | 0 |
| lib | 0 | 4 | 0 |
| tests | 3 | 1 | 0 |
| docs | 0 | 2 | 0 |
| cli | 1 | 0 | 0 |
| cortex | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| sentinel | 1 | 0 | 0 |

```
A cli/sentinel.js
M cortex/intelligence/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/ledger/.._.._etc/.._.._etc.queue/2026-07-30.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-07-27.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-30.jsonl
M data/ledger/forge/forge.old/2026-07-27.jsonl
A data/ledger/forge/forge.old/2026-07-30.jsonl
M data/ledger/forge/forge.patch/2026-07-27.jsonl
A data/ledger/forge/forge.patch/2026-07-30.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-27.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-27.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-30.jsonl
M data/ledger/reflection/reflection.engine/2026-07-27.jsonl
A data/ledger/reflection/reflection.engine/2026-07-30.jsonl
A data/ledger/sentinel/sentinel.faults/2026-07-30.jsonl
M data/ledger/test/test.echo.ping/2026-07-27.jsonl
A data/ledger/test/test.echo.ping/2026-07-30.jsonl
M data/ledger/test/test.event.check/2026-07-27.jsonl
A data/ledger/test/test.event.check/2026-07-30.jsonl
M data/ledger/test/test.widget.panel/2026-07-27.jsonl
A data/ledger/test/test.widget.panel/2026-07-30.jsonl
M docs/PHASE-MAP-TEMP.md
M docs/nexus-sentinel.spec
M idearium/interaction-contract.json
M lib/bus-subscriptions.js
M lib/component-ledger.js
M lib/config-governance.js
M lib/contract-queue.js
M nexus-healer/interaction-contract.json
A sentinel/interaction-contract.json
M tests/modules/run-all.js
A tests/modules/test-adversarial-sim.js
A tests/modules/test-intelligence-causal.js
A tests/modules/test-sentinel-cli.js
```

### Build 0.9.13-r34 — snap-0310 — 2026-07-30 13:07:14

- Archive: `nexus-0310_2026-07-30_v0.9.13-r34_working-memory-v44.zip` (was `nexus-working-memory-v44.zip`)
- SHA-256: `50df9bcf7b319117ab3bc51420bcf07b1d90acc6fdd8c9a3e31bbb5a85e595f2`, 27.5 MB, downloaded 2026-07-30 13:16:35
- Kind: full
- Commit: `1f3403223716a10556f8abc8e847860c0162552f`, tag `snap-0310`
- Left out: embedded .git (4084 files, HEAD 48a1c1115183df83a0572af7029b521a2487442d (master))
- Files in archive: 3470. Changes against the build before it: **77 added, 80 modified, 31 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 27 | 51 | 17 |
| meta | 40 | 0 | 0 |
| tests | 6 | 6 | 10 |
| lib | 1 | 5 | 0 |
| docs | 0 | 3 | 2 |
| cortex | 0 | 5 | 0 |
| loom | 2 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| service | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| cli | 0 | 0 | 1 |
| autopilot | 1 | 0 | 0 |
| architect | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| sentinel | 0 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |

```
M architect/src/ui/alk-lattice.html
M autopilot.js
A autopilot/spec/autopilot.spec
D cli/sentinel.js
M copilot/adversarial.js
M cortex/boot.js
M cortex/gap-finder/index.js
M cortex/intelligence/index.js
M cortex/self-heal/index.js
D docs/PHASE-MAP-TEMP.md
M docs/SPEC-REGISTRY.md
M docs/gap-lifecycle.spec
D docs/nexus-sentinel.spec
M docs/nexus-tablet.spec
M eravos/server.js
M idearium/interaction-contract.json
M lib/bus-subscriptions.js
M lib/component-ledger.js
M lib/component-registry.js
M lib/config-governance.js
M lib/contract-queue.js
A lib/self-register.js
A loom/registry-components.js
M loom/server.js
A loom/spec/loom.spec
A meta/causal-nexus/modules/adapter-sandbox/index.js
A meta/causal-nexus/modules/adapter/index.js
A meta/causal-nexus/modules/causality/index.js
A meta/causal-nexus/modules/clip/index.js
A meta/causal-nexus/modules/compress/index.js
A meta/causal-nexus/modules/context/index.js
A meta/causal-nexus/modules/delta/index.js
A meta/causal-nexus/modules/enforcement/index.js
A meta/causal-nexus/modules/forge/index.js
A meta/causal-nexus/modules/identity/index.js
A meta/causal-nexus/modules/index.js
A meta/causal-nexus/modules/kernel/index.js
A meta/causal-nexus/modules/lazy/index.js
A meta/causal-nexus/modules/ledger/index.js
A meta/causal-nexus/modules/loader/index.js
A meta/causal-nexus/modules/observer/index.js
A meta/causal-nexus/modules/persist/index.js
A meta/causal-nexus/modules/projection/index.js
A meta/causal-nexus/modules/query/index.js
A meta/causal-nexus/modules/sigma/index.js
A meta/causal-nexus/modules/time/index.js
A meta/causal-nexus/modules/version-gate/index.js
A meta/causal-nexus/mutate.cjs
A meta/causal-nexus/package.json
A meta/causal-nexus/recompute-trigger.cjs
A meta/causal-nexus/test/cross-domain/invariants.test.js
A meta/causal-nexus/test/run-all.js
A meta/causal-nexus/test/runner.js
A meta/causal-nexus/test/unit/adapter-sandbox.test.js
A meta/causal-nexus/test/unit/causality.test.js
A meta/causal-nexus/test/unit/clip.test.js
A meta/causal-nexus/test/unit/compress.test.js
A meta/causal-nexus/test/unit/context.test.js
A meta/causal-nexus/test/unit/kernel.test.js
A meta/causal-nexus/test/unit/ledger.test.js
A meta/causal-nexus/test/unit/loader-context.test.js
A meta/causal-nexus/test/unit/modules.test.js
A meta/causal-nexus/test/unit/observer-enforcement.test.js
A meta/causal-nexus/test/unit/sigma.test.js
A meta/causal-nexus/test/unit/version-gate.test.js
M nexus-healer/interaction-contract.json
M ollama/server.js
M orchestrator.js
D sentinel/interaction-contract.json
M service/nexus-diagnostic.js
D tests/modules/_purge-test-rows.js
M tests/modules/run-all.js
A tests/modules/test-adversarial-causal-wire.js
D tests/modules/test-adversarial-sim.js
D tests/modules/test-alk-lattice-live.js
M tests/modules/test-autopilot-boot-gates.js
A tests/modules/test-causal-hygiene.js
M tests/modules/test-config-governance.js
D tests/modules/test-contract-queue-hardening.js
D tests/modules/test-diagnostic-heal-path.js
M tests/modules/test-gap-finder.js
A tests/modules/test-gap1-specs.js
D tests/modules/test-health-authority.js
M tests/modules/test-ico-ledger-writethrough.js
D tests/modules/test-intelligence-causal.js
D tests/modules/test-intelligence-core-wired.js
D tests/modules/test-ledger-schema.js
A tests/modules/test-registration-shape.js
A tests/modules/test-replay-snapshot-wire.js
M tests/modules/test-self-heal.js
A tests/modules/test-self-register.js
D tests/modules/test-sentinel-cli.js
```

96 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r35 — snap-0311 — 2026-07-30 13:23:48

- Archive: `nexus-0311_2026-07-30_v0.9.13-r35_working-memory-v57-1.zip` (was `nexus-working-memory-v57 (1).zip`)
- SHA-256: `06381c087ec34b2428d53c2d7f57655299316f9d07357e133959584e36a4e38e`, 29.4 MB, downloaded 2026-07-30 13:25:34
- Kind: full
- Commit: `ead051cf28b2410c51f9d84d3fa5e1dd0a5ad937`, tag `snap-0311`
- Left out: embedded .git (4690 files, HEAD 9c125f342baf7e2bc4faff554accd1dbe627e472 (master))
- Files in archive: 3436. Changes against the build before it: **31 added, 86 modified, 65 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 17 | 57 | 21 |
| meta | 0 | 0 | 40 |
| tests | 10 | 6 | 2 |
| lib | 0 | 5 | 0 |
| docs | 2 | 3 | 0 |
| cortex | 0 | 5 | 0 |
| loom | 0 | 1 | 1 |
| (root) | 0 | 2 | 0 |
| service | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| cli | 1 | 0 | 0 |
| autopilot | 0 | 0 | 1 |
| architect | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| sentinel | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |

```
M architect/src/ui/alk-lattice.html
M autopilot.js
D autopilot/spec/autopilot.spec
A cli/sentinel.js
M copilot/adversarial.js
M cortex/boot.js
M cortex/gap-finder/index.js
M cortex/intelligence/index.js
M cortex/self-heal/index.js
A docs/PHASE-MAP-TEMP.md
M docs/SPEC-REGISTRY.md
M docs/gap-lifecycle.spec
A docs/nexus-sentinel.spec
M docs/nexus-tablet.spec
M eravos/server.js
M idearium/interaction-contract.json
M lib/bus-subscriptions.js
M lib/component-ledger.js
M lib/component-registry.js
M lib/config-governance.js
M lib/contract-queue.js
M loom/server.js
D loom/spec/loom.spec
D meta/causal-nexus/modules/adapter-sandbox/index.js
D meta/causal-nexus/modules/adapter/index.js
D meta/causal-nexus/modules/causality/index.js
D meta/causal-nexus/modules/clip/index.js
D meta/causal-nexus/modules/compress/index.js
D meta/causal-nexus/modules/context/index.js
D meta/causal-nexus/modules/delta/index.js
D meta/causal-nexus/modules/enforcement/index.js
D meta/causal-nexus/modules/forge/index.js
D meta/causal-nexus/modules/identity/index.js
D meta/causal-nexus/modules/index.js
D meta/causal-nexus/modules/kernel/index.js
D meta/causal-nexus/modules/lazy/index.js
D meta/causal-nexus/modules/ledger/index.js
D meta/causal-nexus/modules/loader/index.js
D meta/causal-nexus/modules/observer/index.js
D meta/causal-nexus/modules/persist/index.js
D meta/causal-nexus/modules/projection/index.js
D meta/causal-nexus/modules/query/index.js
D meta/causal-nexus/modules/sigma/index.js
D meta/causal-nexus/modules/time/index.js
D meta/causal-nexus/modules/version-gate/index.js
D meta/causal-nexus/mutate.cjs
D meta/causal-nexus/package.json
D meta/causal-nexus/recompute-trigger.cjs
D meta/causal-nexus/test/cross-domain/invariants.test.js
D meta/causal-nexus/test/run-all.js
D meta/causal-nexus/test/runner.js
D meta/causal-nexus/test/unit/adapter-sandbox.test.js
D meta/causal-nexus/test/unit/causality.test.js
D meta/causal-nexus/test/unit/clip.test.js
D meta/causal-nexus/test/unit/compress.test.js
D meta/causal-nexus/test/unit/context.test.js
D meta/causal-nexus/test/unit/kernel.test.js
D meta/causal-nexus/test/unit/ledger.test.js
D meta/causal-nexus/test/unit/loader-context.test.js
D meta/causal-nexus/test/unit/modules.test.js
D meta/causal-nexus/test/unit/observer-enforcement.test.js
D meta/causal-nexus/test/unit/sigma.test.js
D meta/causal-nexus/test/unit/version-gate.test.js
M nexus-healer/interaction-contract.json
M ollama/server.js
M orchestrator.js
A sentinel/interaction-contract.json
M service/nexus-diagnostic.js
A tests/modules/_purge-test-rows.js
M tests/modules/run-all.js
A tests/modules/test-adversarial-sim.js
A tests/modules/test-alk-lattice-live.js
M tests/modules/test-autopilot-boot-gates.js
M tests/modules/test-config-governance.js
A tests/modules/test-contract-queue-hardening.js
A tests/modules/test-diagnostic-heal-path.js
M tests/modules/test-gap-finder.js
D tests/modules/test-gap1-specs.js
A tests/modules/test-health-authority.js
M tests/modules/test-ico-ledger-writethrough.js
A tests/modules/test-intelligence-causal.js
A tests/modules/test-intelligence-core-wired.js
A tests/modules/test-ledger-schema.js
D tests/modules/test-replay-snapshot-wire.js
M tests/modules/test-self-heal.js
A tests/modules/test-sentinel-cli.js
```

96 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.13-r36 — snap-0312 — 2026-07-30 20:02:16

- Archive: `nexus-0312_2026-07-30_v0.9.13-r36_working-memory-v57.zip` (was `nexus-working-memory-v57.zip`)
- SHA-256: `ce926c478ff56dc3942da48e72edd45797f39746d0af89c2bc419d800e13a56e`, 30.6 MB, downloaded 2026-07-30 20:22:34
- Kind: full
- Commit: `2e945b7220a2b7aabea5d4525e73f28960212b3c`, tag `snap-0312`
- Left out: embedded .git (4739 files, HEAD 0d25259d8f005e2fe47213a99ec72e5790cca7d0 (master))
- Files in archive: 3439. Changes against the build before it: **15 added, 43 modified, 12 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 14 | 29 | 6 |
| tests | 1 | 1 | 4 |
| cortex | 0 | 5 | 0 |
| lib | 0 | 2 | 1 |
| (root) | 0 | 2 | 0 |
| loom | 0 | 1 | 1 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M cli/diagnose.js
M copilot/adversarial.js
M cortex/boot.js
M cortex/data/baseline-events.ndjson
M cortex/gap-finder/index.js
M cortex/intelligence/index.js
M cortex/self-heal/index.js
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/component_projections.json
M data/cortex/memory/components.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
M data/ledger/cortex/cortex.gaps.list/2026-07-30.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-07-30.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-07-30.jsonl
M data/ledger/forge/forge.old/2026-07-30.jsonl
A data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-30.jsonl
A data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-30.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
D data/ledger/intelligence/intelligence.mastermind/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-30.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-30.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-30.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-30.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-30.jsonl
A data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-30.jsonl
A data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-30.jsonl
A data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-30.jsonl
A data/ledger/test/test.widget.panel/2026-07-31.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-07-30.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-07-30.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-07-30.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-07-30.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-07-30.jsonl
M data/orchestrator/baseline-events.ndjson
M lib/component-ledger.js
M lib/component-registry.js
D lib/self-register.js
D loom/registry-components.js
M loom/server.js
M nexus-connect.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
D tests/modules/test-adversarial-causal-wire.js
A tests/modules/test-boot-log-fixes.js
D tests/modules/test-causal-hygiene.js
D tests/modules/test-registration-shape.js
D tests/modules/test-self-register.js
```

### Build 0.9.13-r37 — snap-0313 — 2026-07-30 20:59:44

- Archive: `nexus-0313_2026-07-30_v0.9.13-r37_working-memory-v57-merged.zip` (was `nexus-working-memory-v57-merged.zip`)
- SHA-256: `d618f187739aa6d8bd40ed50c7136076de4519b419f2725d34ec037fd482f04f`, 30.9 MB, downloaded 2026-07-30 21:00:23
- Kind: full
- Commit: `f80eaad8c7f3f506f9b1b1f6b626df27c9401003`, tag `snap-0313`
- Left out: embedded .git (4851 files, HEAD 4f3dd8734d48f4bab29f2f6e3dd85e0966fa6bcb (master))
- Files in archive: 3456. Changes against the build before it: **17 added, 40 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 11 | 31 | 0 |
| tests | 4 | 1 | 0 |
| cortex | 0 | 4 | 0 |
| lib | 1 | 1 | 0 |
| loom | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |

```
M copilot/adversarial.js
M cortex/boot.js
M cortex/gap-finder/index.js
M cortex/intelligence/index.js
M cortex/self-heal/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/component_projections.json
M data/cortex/memory/components.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-07-30.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
M data/ledger/forge/forge.old/2026-07-30.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-30.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-30.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
A data/ledger/intelligence/intelligence.mastermind/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-30.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-30.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-30.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-30.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-30.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-07-30.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-07-30.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-07-30.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-07-30.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-07-30.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M lib/component-registry.js
A lib/self-register.js
A loom/registry-components.js
M loom/server.js
M orchestrator.js
M tests/modules/run-all.js
A tests/modules/test-adversarial-causal-wire.js
A tests/modules/test-causal-hygiene.js
A tests/modules/test-registration-shape.js
A tests/modules/test-self-register.js
```

### Build 0.9.13-r38 — snap-0314 — 2026-07-30 21:14:00

- Archive: `nexus-0314_2026-07-30_v0.9.13-r38_working-memory-v57-merged-1.zip` (was `nexus-working-memory-v57-merged-1.zip`)
- SHA-256: `5655373fc9f28c653262892673f716fe45e8aee61bd454819dcc5e06da7ae546`, 30.9 MB, downloaded 2026-07-30 21:15:41
- Kind: full
- Commit: `442a375deccb2d711660a13fea3f20e747933aed`, tag `snap-0314`
- Left out: embedded .git (4902 files, HEAD 6fc273a00788df700632fe8abde35b428cb063ca (master))
- Files in archive: 3456. Changes against the build before it: **1 added, 23 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 22 | 0 |
| cli | 0 | 1 | 1 |
| copilot | 1 | 0 | 0 |

```
D cli/co-pilot.js
M cli/nexus.js
A copilot/cli.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
```

### Build 0.9.13-r39 — snap-0315 — 2026-07-30 21:40:14

- Archive: `nexus-0315_2026-07-30_v0.9.13-r39_working-memory-v57-merged-2.zip` (was `nexus-working-memory-v57-merged-2.zip`)
- SHA-256: `e1b25a15e40e3c08bf78bf595e95fba28aa5cfe58d6d89d9c9f8edd4312b856e`, 31 MB, downloaded 2026-07-30 22:01:16
- Kind: full
- Commit: `e50de76093429ee5e8a77f5ad48a19190ee5fca8`, tag `snap-0315`
- Identical copy: `nexus-0315_2026-07-30_v0.9.13-r39_working-memory-v57-merged-3_dup1.zip` (was `nexus-working-memory-v57-merged-3.zip`)
- Left out: embedded .git (4952 files, HEAD 7d0bcad8361e29dbb47c914122e975b8dfd42b0b (master))
- Files in archive: 3456. Changes against the build before it: **0 added, 24 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 22 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M lib/resource-monitor.js
```

### Build 0.9.13-r40 — snap-0316 — 2026-07-31 00:09:16

- Archive: `nexus-0316_2026-07-31_v0.9.13-r40_working-memory-v59.zip` (was `nexus-working-memory-v59.zip`)
- SHA-256: `9ce61491fb44b4f3200fae20ab2847b3c06014216eff4918621c94e345cdfc33`, 29.7 MB, downloaded 2026-07-31 00:11:48
- Kind: full
- Commit: `c5b3342b6ace578d5768199dc51ba8765d486de1`, tag `snap-0316`
- Left out: embedded .git (4726 files, HEAD bed5728193683ba906d668d6899636f08b0c452a (master))
- Files in archive: 3456. Changes against the build before it: **3 added, 49 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 32 | 2 |
| tests | 1 | 4 | 1 |
| (root) | 0 | 3 | 0 |
| cli | 1 | 2 | 0 |
| copilot | 1 | 1 | 0 |
| lib | 0 | 2 | 0 |
| ui | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M autopilot.js
A cli/co-pilot.js
M cli/diagnose.js
M cli/nexus.js
M copilot/cli.js
A copilot/command-core.js
M cortex/data/baseline-events.ndjson
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
D data/ledger/diagnostic/diagnostic.service.boot/2026-07-30.jsonl
D data/ledger/diagnostic/diagnostic.service.poll/2026-07-30.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M data/orchestrator/baseline-events.ndjson
M guardian/cli.js
M lib/component-ledger.js
M lib/resource-monitor.js
M nexus-connect.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
D tests/modules/test-boot-log-fixes.js
M tests/modules/test-boot-phases.js
M tests/modules/test-clear-glass-idle-vs-open.js
A tests/modules/test-copilot-cli.js
M tests/modules/test-spawn-guard.js
M ui/agents/chatgpt/index.html
M ui/tv-shell/index.html
```

### Build 0.9.13-r41 — snap-0317 — 2026-07-31 00:32:52

- Archive: `nexus-0317_2026-07-31_v0.9.13-r41_copilot-omniscience-p1.zip` (was `nexus-copilot-omniscience-p1.zip`)
- SHA-256: `5c865c54681f405814154c204d2fefd5832c2c6773532995c4d311b4bedc74e0`, 31.1 MB, downloaded 2026-07-31 00:34:34
- Kind: full
- Commit: `5fe70b93a1d20ba3bb3a5552b199e28ec8da1abf`, tag `snap-0317`
- Left out: embedded .git (4963 files, HEAD 2b17979f13130d824f355b36db0f878155582142 (master))
- Files in archive: 3459. Changes against the build before it: **6 added, 50 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 32 | 0 |
| tests | 2 | 4 | 1 |
| copilot | 1 | 2 | 1 |
| (root) | 0 | 3 | 0 |
| cli | 0 | 2 | 1 |
| lib | 0 | 2 | 0 |
| ui | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M autopilot.js
D cli/co-pilot.js
M cli/diagnose.js
M cli/nexus.js
M copilot/cli.js
D copilot/command-core.js
M copilot/server.js
A copilot/tool-runtime.js
M cortex/data/baseline-events.ndjson
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-07-30.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-07-30.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M data/orchestrator/baseline-events.ndjson
A docs/copilot-omniscience-phasemap.spec
M guardian/cli.js
M lib/component-ledger.js
M lib/resource-monitor.js
M nexus-connect.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
A tests/modules/test-boot-log-fixes.js
M tests/modules/test-boot-phases.js
M tests/modules/test-clear-glass-idle-vs-open.js
D tests/modules/test-copilot-cli.js
A tests/modules/test-copilot-tool-runtime.js
M tests/modules/test-spawn-guard.js
M ui/agents/chatgpt/index.html
M ui/tv-shell/index.html
```

### Build 0.9.13-r42 — snap-0318 — 2026-07-31 01:47:54

- Archive: `nexus-0318_2026-07-31_v0.9.13-r42_copilot-omniscience-p2-ready.zip` (was `nexus-copilot-omniscience-p2-ready.zip`)
- SHA-256: `0c57b03e9f4110cd190873509e0d4ddc287c552de833e20ea9d00f59210e4928`, 31.4 MB, downloaded 2026-07-31 04:17:04
- Kind: full
- Commit: `a2c71e2d1e97f452072ac42ca82afb78bf659d71`, tag `snap-0318`
- Left out: embedded .git (5028 files, HEAD b97874fc61f01c032f0b126067bb7ad8ad5fe240 (master))
- Files in archive: 3461. Changes against the build before it: **2 added, 32 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 22 | 0 |
| copilot | 0 | 3 | 0 |
| ollama | 1 | 2 | 0 |
| tests | 1 | 2 | 0 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
M copilot/registry-components.js
M copilot/server.js
M copilot/tool-runtime.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M docs/SPEC-REGISTRY.md
M docs/copilot-omniscience-phasemap.spec
M lib/version.js
A ollama/chat-tools.js
M ollama/registry-components.js
M ollama/server.js
M tests/modules/run-all.js
M tests/modules/test-copilot-tool-runtime.js
A tests/modules/test-ollama-chat-tools.js
```

### Build 0.9.13-r43 — snap-0319 — 2026-07-31 05:35:44

- Archive: `nexus-0319_2026-07-31_v0.9.13-r43_copilot-omniscience-p1-p3.zip` (was `nexus-copilot-omniscience-p1-p3.zip`)
- SHA-256: `cfcab23fe440ee396248889e776a92c70134d5d957eb8d09d8332a7586cb7ac2`, 31.2 MB, downloaded 2026-07-31 07:31:02
- Kind: full
- Commit: `b946485391760acf3708233b2411431d2f40c0ef`, tag `snap-0319`
- Left out: embedded .git (4981 files, HEAD 6f355327d085637e3028e398b409089e48ea1f60 (master))
- Files in archive: 3459. Changes against the build before it: **0 added, 34 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 24 | 0 |
| copilot | 0 | 3 | 0 |
| ollama | 0 | 2 | 1 |
| tests | 0 | 2 | 1 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
M copilot/registry-components.js
M copilot/server.js
M copilot/tool-runtime.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/user_lattice.json
M data/cortex/memory/user_model_hypotheses.json
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
M docs/SPEC-REGISTRY.md
M docs/copilot-omniscience-phasemap.spec
M lib/version.js
D ollama/chat-tools.js
M ollama/registry-components.js
M ollama/server.js
M tests/modules/run-all.js
M tests/modules/test-copilot-tool-runtime.js
D tests/modules/test-ollama-chat-tools.js
```

### Build 0.9.13-r44 — snap-0320 — 2026-08-01 00:00:42

- Archive: `nexus-0320_2026-08-01_v0.9.13-r44_raid-verification-p1-p2.zip` (was `nexus-raid-verification-p1-p2.zip`)
- SHA-256: `1868f4d163a09e7e8702f6d241b63fba8827363a2fe92b719db8f7aa4088d3ce`, 31.8 MB, downloaded 2026-08-01 00:02:45
- Kind: full
- Commit: `a9dd95807056183ddd32b38527d151989cb9da0a`, tag `snap-0320`
- Left out: embedded .git (5074 files, HEAD 27eeab0e944dfd2fe5f028d458bb1a158608ca09 (master))
- Files in archive: 3491. Changes against the build before it: **32 added, 29 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 19 | 22 | 0 |
| tests | 6 | 1 | 0 |
| docs | 2 | 2 | 0 |
| lib | 3 | 1 | 0 |
| guardian | 1 | 1 | 0 |
| (root) | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
A AXIOMS-v3.1.md
M copilot/stream-digest.js
M cortex/core/raid/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
A data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/raid_decisions.json
M data/ledger/cortex/cortex.gaps.list/2026-07-31.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-01.jsonl
M data/ledger/forge/forge.old/2026-07-31.jsonl
A data/ledger/forge/forge.old/2026-08-01.jsonl
M data/ledger/forge/forge.patch/2026-07-31.jsonl
A data/ledger/forge/forge.patch/2026-08-01.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-07-31.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-07-31.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-07-31.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-07-31.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-01.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-07-31.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-01.jsonl
M data/ledger/reflection/reflection.engine/2026-07-31.jsonl
A data/ledger/reflection/reflection.engine/2026-08-01.jsonl
M data/ledger/test/test.echo.ping/2026-07-31.jsonl
A data/ledger/test/test.echo.ping/2026-08-01.jsonl
M data/ledger/test/test.event.check/2026-07-31.jsonl
A data/ledger/test/test.event.check/2026-08-01.jsonl
M data/ledger/test/test.widget.panel/2026-07-31.jsonl
A data/ledger/test/test.widget.panel/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-01.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-07-31.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-01.jsonl
M docs/SPEC-REGISTRY.md
M docs/copilot-omniscience-phasemap.spec
A docs/raid-verification-spine-phasemap.spec
A docs/raid-warp-verification-phasemap.spec
M guardian/server.js
A guardian/tool-runtime.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/call-system.js
A lib/agent-tools/tools/faculty-tools.js
A lib/stream-digest.js
M tests/modules/run-all.js
A tests/modules/test-call-system.js
A tests/modules/test-faculty-tools.js
A tests/modules/test-guardian-tool-runtime.js
A tests/modules/test-raid-constitution-gate.js
A tests/modules/test-raid-decision-record.js
A tests/modules/test-shared-stream.js
```

