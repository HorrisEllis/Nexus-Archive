# Nexus 0.4.0

| | |
|---|---|
| Built | 2026-06-13 16:30:28 → 2026-06-14 22:09:24 |
| Builds on the main line | 28 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.4.0-pre |
| Tag | `v0.4.0` → snap-0085 |
| Full file ledger | [LEDGER-0.4.0.csv](../ledger/LEDGER-0.4.0.csv) |

## Ledger

### Build 0.4.0-r1 — snap-0057 — 2026-06-13 16:30:28

- Archive: `nexus-0057_2026-06-13_v0.4.0-r1_system-1.zip` (was `nexus-system (1).zip`)
- SHA-256: `8de26ed1eeda0bb200680bb065774bea3e0c6ab1a059de2e6adf0370edbf15fa`, 2.4 MB, downloaded 2026-06-13 16:46:33
- Kind: full
- Commit: `3ac3991291eb21977ecc158d507fbea2cfef0def`, tag `snap-0057`
- Identical copy: `nexus-0057_2026-06-13_v0.4.0-r1_system-2_dup1.zip` (was `nexus-system (2).zip`)
- Files in archive: 588. Changes against the build before it: **49 added, 85 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 0 | 34 | 0 |
| data | 28 | 0 | 0 |
| cortex | 0 | 14 | 0 |
| tests | 13 | 0 | 0 |
| (root) | 0 | 8 | 0 |
| bridge | 0 | 7 | 0 |
| lib | 6 | 1 | 0 |
| ui | 0 | 6 | 0 |
| cli | 0 | 3 | 0 |
| guardian | 0 | 3 | 0 |
| hooks | 0 | 3 | 0 |
| spec-compiler | 2 | 1 | 0 |
| architect | 0 | 2 | 0 |
| contracts | 0 | 2 | 0 |
| service | 0 | 1 | 0 |

```
M architect/service.js
M architect/src/ui/alk-lattice.html
M bridge/causal/graph.js
M bridge/causal/ledger.js
M bridge/causal/projections.js
M bridge/causal/schema.js
M bridge/causal/server.js
M bridge/identity.js
M bridge/index.js
M cli/boot-systems.js
M cli/diagnose.js
M cli/nexus-repl.js
M contracts/SYSTEM-CONTRACTS.js
M contracts/nexus-interaction-contract.js
M cortex/agent-tools/index.js
M cortex/boot.js
M cortex/contract/index.js
M cortex/ess-gap-engine.js
M cortex/healer/index.js
M cortex/heartbeat/index.js
M cortex/intelligence/index.js
M cortex/memory/data-poller.js
M cortex/memory/jaa-db.js
M cortex/memory/working-memory.js
M cortex/orion/policy.js
M cortex/replay/index.js
M cortex/self-heal/index.js
M cortex/snapshot/index.js
M cos/cli/commands/create.js
M cos/cli/commands/destroy.js
M cos/cli/commands/events.js
M cos/cli/commands/hooks.js
M cos/cli/commands/list.js
M cos/cli/commands/map.js
M cos/cli/commands/run.js
M cos/cli/commands/schema.js
M cos/cli/commands/start.js
M cos/cli/commands/status.js
M cos/cli/commands/stop.js
M cos/cli/index.js
M cos/compartment/process-runner.js
M cos/foundation/axioms.js
M cos/foundation/cli-detector.js
M cos/foundation/compiler-enum.js
M cos/foundation/constants.js
M cos/foundation/event-contracts.js
M cos/foundation/file-browser.js
M cos/foundation/fs-layer.js
M cos/foundation/hook-schema.js
M cos/foundation/runtime-enum.js
M cos/foundation/snapshot.js
M cos/foundation/types.js
M cos/host/event-bus.js
M cos/host/gates/compartment.js
M cos/host/gates/process.js
M cos/host/index.js
M cos/host/state-store.js
M cos/host/system-map.js
M cos/playground/branch.js
M cos/playground/compare.js
M cos/playground/sandbox.js
M cos/test.js
A data/snapshots/nex-0241aa18.nex
A data/snapshots/nex-053fe029.nex
A data/snapshots/nex-07613c80.nex
A data/snapshots/nex-08a1d88c.nex
A data/snapshots/nex-0cf5fd35.nex
A data/snapshots/nex-0e3cdf89.nex
A data/snapshots/nex-1aea4156.nex
A data/snapshots/nex-1f59249a.nex
A data/snapshots/nex-265d0b8e.nex
A data/snapshots/nex-3537f506.nex
A data/snapshots/nex-46208a20.nex
A data/snapshots/nex-4bfbf66c.nex
A data/snapshots/nex-5afd4cf9.nex
A data/snapshots/nex-5d8c95c3.nex
A data/snapshots/nex-61e77962.nex
A data/snapshots/nex-6ce6336d.nex
A data/snapshots/nex-70dc2fca.nex
A data/snapshots/nex-abbb5116.nex
A data/snapshots/nex-acf19e7d.nex
A data/snapshots/nex-c218756f.nex
A data/snapshots/nex-c30e0710.nex
A data/snapshots/nex-d0a0f17c.nex
A data/snapshots/nex-db2ad7ca.nex
A data/snapshots/nex-e351a2fd.nex
A data/snapshots/nex-e6c20aa3.nex
A data/snapshots/nex-e92b936c.nex
A data/snapshots/nex-ef5176bf.nex
A data/snapshots/nex-fe2e46d4.nex
M guardian/lab/lab.js
M guardian/server.js
M guardian/ui/index.html
M hooks/cortex.hooks.js
M hooks/guardian.hooks.js
M hooks/index.js
A lib/alk/index.js
M lib/causal/compound.js
A lib/dispatch-pool.js
A lib/ledger-writer.js
A lib/uid/component-map.js
A lib/uid/config-schema.js
A lib/uid/index.js
M nexus-bus.js
M nexus-cfr-influence.js
M nexus-connect.js
M nexus-heal-loop.js
M nexus-knowledge.js
M nexus-query.js
M orchestrator.js
M package.json
M service/nexus-diagnostic.js
A spec-compiler/cli.js
A spec-compiler/dispatch.js
M spec-compiler/verify.js
A tests/brutal-results.json
A tests/diagnose-results.json
A tests/integration-results.json
A tests/kernel-test-results.json
A tests/modules/alk.test.js
A tests/modules/baseline.test.js
A tests/modules/healer.test.js
A tests/modules/interaction-contract.test.js
A tests/modules/jaa-db.test.js
A tests/modules/queue.test.js
A tests/modules/run-all.js
A tests/modules/uid.test.js
A tests/pipeline-results.json
M ui/api.js
M ui/boot-systems.js
M ui/contracts.js
M ui/index.html
M ui/ports.js
M ui/store.js
```

### Build 0.4.0-r2 — snap-0058 — 2026-06-13 18:52:06

- Archive: `nexus-0058_2026-06-13_v0.4.0-r2_system-2-1.zip` (was `nexus-system (2) - 1.zip`)
- SHA-256: `0e0b711ff97214cbd63c8467111c3ddb3466bb90f56ccbf1f61831370d4149db`, 3.1 MB, downloaded 2026-06-13 18:52:27
- Kind: full
- Commit: `73caa39dbe15194752c0259a65f3c079f92038ae`, tag `snap-0058`
- Files in archive: 650. Changes against the build before it: **62 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 49 | 6 | 0 |
| data | 11 | 3 | 0 |
| guardian | 0 | 6 | 0 |
| architect | 2 | 0 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M cortex/boot.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
A cortex/data/active_traces.jsonl
A cortex/data/agent_calls.jsonl
A cortex/data/agent_messages.jsonl
A cortex/data/agent_signatures.jsonl
A cortex/data/artifacts.jsonl
A cortex/data/backup_records.jsonl
A cortex/data/bep_patterns.jsonl
A cortex/data/boot_records.jsonl
A cortex/data/causality_nodes.jsonl
M cortex/data/cfr_state.json
A cortex/data/cli_history.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/contract_audit.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/decay_log.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/event_log.jsonl
M cortex/data/event_stats.json
A cortex/data/failures.jsonl
A cortex/data/fault_taxonomy.jsonl
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
A cortex/data/reuse_index.jsonl
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
M cortex/foundation/admin-server.js
M data/.poller-cursors.json
A data/NEXUS_STATE.json
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
M data/guardian/ledger/boot/events.ndjson
A data/idearium-tunnel.json
A data/idearium/event_log.jsonl
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
M data/ledger/event_stats.json
A data/ledger/orchestrator.jsonl
A data/snapshots/nex-9969056e.nex
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/settings.json
M guardian/server.js
```

### Build 0.4.0-r3 — snap-0059 — 2026-06-13 23:03:18

- Archive: `nexus-0059_2026-06-13_v0.4.0-r3_system-3.zip` (was `nexus-system (3).zip`)
- SHA-256: `5345b19eab1146a58f82c3c081d2b453a190f9f3f281f505883e3c84dae0918d`, 2.4 MB, downloaded 2026-06-13 23:04:56
- Kind: full
- Commit: `a6f9457f36d881c688f09985271ffaff92634941`, tag `snap-0059`
- Files in archive: 588. Changes against the build before it: **0 added, 27 modified, 62 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 7 | 49 |
| data | 0 | 3 | 11 |
| guardian | 0 | 6 | 0 |
| idearium | 0 | 4 | 0 |
| (root) | 0 | 3 | 0 |
| architect | 0 | 0 | 2 |
| cockpit | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
M cockpit/forge.js
M cortex/boot.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
D cortex/data/active_traces.jsonl
D cortex/data/agent_calls.jsonl
D cortex/data/agent_messages.jsonl
D cortex/data/agent_signatures.jsonl
D cortex/data/artifacts.jsonl
D cortex/data/backup_records.jsonl
D cortex/data/bep_patterns.jsonl
D cortex/data/boot_records.jsonl
D cortex/data/causality_nodes.jsonl
M cortex/data/cfr_state.json
D cortex/data/cli_history.jsonl
D cortex/data/conditioning_log.jsonl
D cortex/data/contract_audit.jsonl
D cortex/data/cortex_memory.jsonl
D cortex/data/crystals.jsonl
D cortex/data/decay_log.jsonl
D cortex/data/delta_records.jsonl
D cortex/data/event_log.jsonl
M cortex/data/event_stats.json
D cortex/data/failures.jsonl
D cortex/data/fault_taxonomy.jsonl
D cortex/data/feedback_scores.jsonl
D cortex/data/fix_map.jsonl
D cortex/data/forge_patches.jsonl
D cortex/data/gaps.jsonl
D cortex/data/healer_log.jsonl
D cortex/data/ime_profiles.jsonl
D cortex/data/intent_nodes.jsonl
D cortex/data/law_violations.jsonl
D cortex/data/memory_index.jsonl
D cortex/data/memory_queries.jsonl
D cortex/data/orion_sessions.jsonl
D cortex/data/poll_log.jsonl
D cortex/data/project_registry.jsonl
D cortex/data/requests.jsonl
D cortex/data/reuse_index.jsonl
D cortex/data/schedules.jsonl
D cortex/data/seam_records.jsonl
D cortex/data/self_model.jsonl
D cortex/data/shape_samples.jsonl
D cortex/data/sigma_records.jsonl
D cortex/data/snr_records.jsonl
D cortex/data/toasts.jsonl
D cortex/data/trust_scores.jsonl
D cortex/data/versionium_branches.jsonl
D cortex/data/versionium_calendar.jsonl
D cortex/data/versionium_commits.jsonl
D cortex/data/versionium_file_index.jsonl
D cortex/data/versionium_objects.jsonl
D cortex/data/workflow_runs.jsonl
D cortex/data/working_memory.jsonl
M cortex/foundation/admin-server.js
M cortex/healer/index.js
M data/.poller-cursors.json
D data/NEXUS_STATE.json
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/cobalt/ledger.idea.jsonl
D data/cobalt/ledger.truth.jsonl
M data/guardian/ledger/boot/events.ndjson
D data/idearium-tunnel.json
D data/idearium/event_log.jsonl
D data/knowledge/facts.jsonl
D data/ledger/event_log.jsonl
M data/ledger/event_stats.json
D data/ledger/orchestrator.jsonl
D data/snapshots/nex-9969056e.nex
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/settings.json
M guardian/server.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/core/index.js
M idearium/index.js
M orchestrator.js
M package-lock.json
M package.json
M service/nexus-diagnostic.js
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r4 — snap-0060 — 2026-06-13 23:06:46

- Archive: `nexus-0060_2026-06-13_v0.4.0-r4_system-4.zip` (was `nexus-system (4).zip`)
- SHA-256: `7ba2522008dce19175187b79f1471a3281c6ec8f3fd02ba498db2a2e18fe0868`, 2.4 MB, downloaded 2026-06-13 23:07:17
- Kind: full
- Commit: `8e6225113036b84fda7f3a3c833c1d23c5a95a08`, tag `snap-0060`
- Files in archive: 588. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r5 — snap-0061 — 2026-06-13 23:13:18

- Archive: `nexus-0061_2026-06-13_v0.4.0-r5_system-5.zip` (was `nexus-system (5).zip`)
- SHA-256: `0dc0da3a058869c55fc979d124ecd8c0203358c0220ceef0958a4be147485183`, 2.4 MB, downloaded 2026-06-13 23:18:40
- Kind: full
- Commit: `e08e0f313563741f0795b082e48200af47deb135`, tag `snap-0061`
- Files in archive: 588. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |
| emerge | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M emerge-ide.js
M emerge/ui/index.html
M orchestrator.js
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r6 — snap-0062 — 2026-06-13 23:28:34

- Archive: `nexus-0062_2026-06-13_v0.4.0-r6_system-6.zip` (was `nexus-system (6).zip`)
- SHA-256: `3734b3dcbb4b708ce313b89b1d9763408a2ad6fc63a344d0b0d230b6473c192c`, 2.4 MB, downloaded 2026-06-13 23:31:45
- Kind: full
- Commit: `a52e864877f47073b0e55dc8d30d719721890bbe`, tag `snap-0062`
- Files in archive: 590. Changes against the build before it: **2 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 2 | 0 |
| (root) | 1 | 0 | 0 |

```
A TUTORIAL.md
M cortex/foundation/admin-server.js
A cortex/lab/index.js
M cortex/snapshot/index.js
```

### Build 0.4.0-r7 — snap-0063 — 2026-06-13 23:50:00

- Archive: `nexus-0063_2026-06-13_v0.4.0-r7_system-integrated.zip` (was `nexus-system-integrated.zip`)
- SHA-256: `0b3495149ec5622aba330be97e8367436541e35a598bc9e02e8131919de20be2`, 2.4 MB, downloaded 2026-06-14 00:01:44
- Kind: full
- Commit: `ffbbb08148d46f5cae8641fc77bde732cc165719`, tag `snap-0063`
- Files in archive: 594. Changes against the build before it: **4 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 2 | 0 |
| tutorial | 2 | 0 | 0 |
| (root) | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |

```
A CHANGELOG-merge.md
M cortex/boot.js
M cortex/foundation/admin-server.js
A cortex/test/harness.js
M guardian/server.js
A tutorial/server.js
A tutorial/wizard.js
```

### Build 0.4.0-r8 — snap-0064 — 2026-06-14 04:03:32

- Archive: `nexus-0064_2026-06-14_v0.4.0-r8_system-3.zip` (was `nexus-system-3.zip`)
- SHA-256: `f05266d527e4135fae57b67651b607e1f8da979296fd532a7c0299b9da8a9e94`, 2.4 MB, downloaded 2026-06-14 04:14:35
- Kind: full
- Commit: `f876e7c8fb0888a6d9f181eebfbafb9f05b459da`, tag `snap-0064`
- Files in archive: 591. Changes against the build before it: **1 added, 7 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 2 | 1 |
| tutorial | 0 | 0 | 2 |
| (root) | 0 | 0 | 1 |
| cli | 0 | 1 | 0 |
| cockpit | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
D CHANGELOG-merge.md
M cli/nexus-repl.js
M cockpit/forge.js
M cortex/boot.js
M cortex/foundation/admin-server.js
D cortex/test/harness.js
M guardian/server.js
A lib/context-builder.js
M tests/brutal-results.json
D tutorial/server.js
D tutorial/wizard.js
M ui/orchestrator/index.html
```

### Build 0.4.0-r9 — snap-0065 — 2026-06-14 05:08:50

- Archive: `nexus-0065_2026-06-14_v0.4.0-r9_system-integrated-1.zip` (was `nexus-system-integrated (1).zip`)
- SHA-256: `756200c33bb21ec8e2430a2f850d99bc4728945fe3146b20d32dd6ce48cfdec3`, 2.5 MB, downloaded 2026-06-14 05:10:20
- Kind: full
- Commit: `cb2c804799fdb87b3a88485f9772efe53b43166c`, tag `snap-0065`
- Files in archive: 597. Changes against the build before it: **7 added, 7 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 2 | 0 |
| lib | 2 | 0 | 1 |
| tutorial | 2 | 0 | 0 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| cockpit | 0 | 1 | 0 |
| data | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
A CHANGELOG-merge.md
M cli/nexus-repl.js
M cockpit/forge.js
M cortex/boot.js
M cortex/foundation/admin-server.js
A cortex/test/harness.js
A data/uid-aliases.jsonl
M guardian/server.js
D lib/context-builder.js
A lib/uid/migrate.js
A lib/uid/normalize.js
M tests/brutal-results.json
A tutorial/server.js
A tutorial/wizard.js
M ui/orchestrator/index.html
```

### Build 0.4.0-r10 — snap-0066 — 2026-06-14 05:42:24

- Archive: `nexus-0066_2026-06-14_v0.4.0-r10_system-4.zip` (was `nexus-system-4.zip`)
- SHA-256: `1bee24356f3bfe337d81aedb2a5702325bd432bab99e820380455ec6b3a40a44`, 2.5 MB, downloaded 2026-06-14 05:43:02
- Kind: full
- Commit: `d9aa2b48762ff7902050de218f81f4c2f9b67862`, tag `snap-0066`
- Files in archive: 598. Changes against the build before it: **8 added, 8 modified, 7 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 3 | 0 | 2 |
| auth | 3 | 0 | 0 |
| cortex | 0 | 2 | 1 |
| ui | 2 | 1 | 0 |
| (root) | 0 | 1 | 1 |
| tutorial | 0 | 0 | 2 |
| cli | 0 | 1 | 0 |
| cockpit | 0 | 1 | 0 |
| data | 0 | 0 | 1 |
| guardian | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
D CHANGELOG-merge.md
A auth/client.js
A auth/index.js
A auth/policy.json
M cli/nexus-repl.js
M cockpit/forge.js
M cortex/boot.js
M cortex/foundation/admin-server.js
D cortex/test/harness.js
D data/uid-aliases.jsonl
M guardian/server.js
A lib/context-builder.js
A lib/contract-handshake.js
A lib/peer-relay.js
D lib/uid/migrate.js
D lib/uid/normalize.js
M orchestrator.js
M tests/brutal-results.json
D tutorial/server.js
D tutorial/wizard.js
A ui/contract-explorer.html
A ui/contract-renderer.js
M ui/orchestrator/index.html
```

### Build 0.4.0-r11 — snap-0067 — 2026-06-14 05:45:20

- Archive: `nexus-0067_2026-06-14_v0.4.0-r11_system-5.zip` (was `nexus-system-5.zip`)
- SHA-256: `ae795940bb5e8992e448bbe42fa30d211e17d2d6740a3c58a2d67759ae22c4ec`, 2.5 MB, downloaded 2026-06-14 05:46:59
- Kind: full
- Commit: `8595f553a0719baa7715734f4ba35a66b149fe54`, tag `snap-0067`
- Files in archive: 598. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M lib/contract-handshake.js
M tests/brutal-results.json
```

### Build 0.4.0-r12 — snap-0068 — 2026-06-14 05:51:16

- Archive: `nexus-0068_2026-06-14_v0.4.0-r12_system-6.zip` (was `nexus-system-6.zip`)
- SHA-256: `d36e616bf1e32a898c0346b540f169313da902502f9ed867c0c9babeefb8b5f1`, 2.5 MB, downloaded 2026-06-14 05:53:29
- Kind: full
- Commit: `3b99ec7426812a0f40aa84f895697074c222b93e`, tag `snap-0068`
- Files in archive: 599. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| auth | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M auth/client.js
M cli/nexus-repl.js
A lib/file-push.js
M orchestrator.js
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r13 — snap-0069 — 2026-06-14 06:02:54

- Archive: `nexus-0069_2026-06-14_v0.4.0-r13_system-7.zip` (was `nexus-system-7.zip`)
- SHA-256: `c63e8ac882a7dc22da2e78c8ed9a4855d1f362ac1754632c9e59c9e4402a709e`, 2.5 MB, downloaded 2026-06-14 06:05:05
- Kind: full
- Commit: `7ce04d829d81d05bfbb64d3ab507be50b981b7a6`, tag `snap-0069`
- Files in archive: 599. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| auth | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M auth/client.js
M orchestrator.js
M tests/brutal-results.json
```

### Build 0.4.0-r14 — snap-0070 — 2026-06-14 06:35:20

- Archive: `nexus-0070_2026-06-14_v0.4.0-r14_master.zip` (was `nexus-master.zip`)
- SHA-256: `443b3bb6ff036a7ca792741ea5fce04de78479f7f190e4220d2590a6bf5bb7e5`, 2.5 MB, downloaded 2026-06-14 06:38:40
- Kind: full
- Commit: `e45f8103e39c79710ee4b1fe7f53d7d5ba2c26cd`, tag `snap-0070`
- Identical copy: `nexus-0070_2026-06-14_v0.4.0-r14_master-1_dup1.zip` (was `nexus-master (1).zip`)
- Identical copy: `nexus-0070_2026-06-14_v0.4.0-r14_master-1_dup2.zip` (was `nexus-master-1.zip`)
- Files in archive: 610. Changes against the build before it: **11 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 2 | 0 |
| lib | 3 | 0 | 0 |
| (root) | 1 | 1 | 0 |
| idearium | 2 | 0 | 0 |
| tutorial | 2 | 0 | 0 |
| data | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| ui | 1 | 0 | 0 |

```
A MASTER-MANIFEST.md
M cortex/boot.js
M cortex/foundation/admin-server.js
A cortex/test/harness.js
A data/uid-aliases.jsonl
M guardian/server.js
A idearium/repo/index.js
A idearium/repo/watcher.js
A lib/intent-map.js
A lib/uid/migrate.js
A lib/uid/normalize.js
M orchestrator.js
A tutorial/server.js
A tutorial/wizard.js
A ui/home/intent.html
```

### Build 0.4.0-r15 — snap-0071 — 2026-06-14 06:52:38

- Archive: `nexus-0071_2026-06-14_v0.4.0-r15_system-8.zip` (was `nexus-system-8.zip`)
- SHA-256: `ded97370293516738970c2fdc9bcb2b5e03d4fcaf9dc550d4d69eeb672c5ff13`, 2.5 MB, downloaded 2026-06-14 06:53:30
- Kind: full
- Commit: `9013b0af2a077af415660ea41bfa3eabc6266908`, tag `snap-0071`
- Files in archive: 608. Changes against the build before it: **0 added, 2 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 0 | 1 |
| data | 0 | 0 | 1 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
D MASTER-MANIFEST.md
D data/uid-aliases.jsonl
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r16 — snap-0072 — 2026-06-14 08:06:18

- Archive: `nexus-0072_2026-06-14_v0.4.0-r16_system-8-1.zip` (was `nexus-system-8 - 1.zip`)
- SHA-256: `6b636385c11fde45d66ee40e178f4a5abd1df506ff8b7171ede391a347617512`, 6.6 MB, downloaded 2026-06-14 08:06:37
- Kind: full
- Commit: `a523b5c04f1e19c7b50e6e2b7400a4e180847862`, tag `snap-0072`
- Left out: node_modules (2563 files)
- Redacted: `auth/keys/nexus-private.pem (1 x private-key)`
- Files in archive: 655. Changes against the build before it: **48 added, 14 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 41 | 3 | 0 |
| cortex | 3 | 4 | 0 |
| guardian | 0 | 3 | 1 |
| (root) | 0 | 3 | 0 |
| architect | 2 | 0 | 0 |
| auth | 2 | 0 | 0 |
| service | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
A auth/keys/nexus-private.pem
A auth/keys/nexus-public.pem
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
M cortex/data/cfr_state.json
M cortex/data/event_stats.json
A cortex/data/invariant/baseline.json
M data/.poller-cursors.json
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/architect/metrics.jsonl
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/bridge/ledger/requests.jsonl
A data/bridge/metrics.jsonl
A data/cortex/metrics.jsonl
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/diagnostic.pid
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/diagnostic/metrics.jsonl
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/emerge/metrics.jsonl
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
M data/guardian/ledger/boot/events.ndjson
A data/guardian/metrics.jsonl
A data/idearium-tunnel.json
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/idearium/metrics.jsonl
A data/knowledge/facts.jsonl
M data/ledger/event_stats.json
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
A data/orchestrator/metrics.jsonl
A data/snapshots/nex-4f82439c.nex
A data/snapshots/nex-67b96e7e.nex
A data/snapshots/nex-688ee81e.nex
A data/snapshots/nex-84b3c3fd.nex
A data/snapshots/nex-973eaea5.nex
M guardian/memory_store/cfr_state.json
D guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M orchestrator.js
M package-lock.json
M package.json
M service/nexus-diagnostic.js
```

### Build 0.4.0-r17 — snap-0073 — 2026-06-14 08:06:22

- Archive: `nexus-0073_2026-06-14_v0.4.0-r17_system-8-2.zip` (was `nexus-system-8 - 2.zip`)
- SHA-256: `d5e3f9dceb3345445487609c72930d9188a61d7036a5a561773eb2129e641113`, 6.9 MB, downloaded 2026-06-14 08:07:18
- Kind: full
- Commit: `62f9149a6d34196c6cfe23d6f77322303883aa29`, tag `snap-0073`
- Left out: node_modules (2563 files)
- Files in archive: 711. Changes against the build before it: **56 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 49 | 1 | 0 |
| data | 6 | 16 | 0 |
| guardian | 1 | 0 | 0 |

```
A cortex/data/active_traces.jsonl
A cortex/data/agent_calls.jsonl
A cortex/data/agent_messages.jsonl
A cortex/data/agent_signatures.jsonl
A cortex/data/artifacts.jsonl
A cortex/data/backup_records.jsonl
M cortex/data/baseline-events.ndjson
A cortex/data/bep_patterns.jsonl
A cortex/data/boot_records.jsonl
A cortex/data/causality_nodes.jsonl
A cortex/data/cli_history.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/contract_audit.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/decay_log.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/event_log.jsonl
A cortex/data/failures.jsonl
A cortex/data/fault_taxonomy.jsonl
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
A cortex/data/reuse_index.jsonl
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
M data/architect/baseline-events.ndjson
M data/architect/metrics.jsonl
M data/bridge/baseline-events.ndjson
A data/bridge/ledger/cfr/event_log.jsonl
M data/bridge/metrics.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
M data/cortex/metrics.jsonl
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/metrics.jsonl
M data/emerge/baseline-events.ndjson
M data/emerge/metrics.jsonl
M data/guardian/baseline-events.ndjson
M data/guardian/metrics.jsonl
M data/idearium/baseline-events.ndjson
A data/idearium/event_log.jsonl
M data/idearium/metrics.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
M data/orchestrator/baseline-events.ndjson
M data/orchestrator/metrics.jsonl
A guardian/memory_store/event_log.jsonl
```

### identical — 0074 — 2026-06-14 08:06:22

- Archive: `nexus-0074_2026-06-14_v0.4.0-r17_system-8-3_same-as-0073.zip` (was `nexus-system-8 - 3.zip`)
- SHA-256: `7676699fb4528df39b1d620452245c6da961ec8bab319005b22048cde7ef603f`, 6.9 MB, downloaded 2026-06-14 08:07:42
- Kind: identical (same tree as snap-0073; no commit)
- Left out: node_modules (2563 files)

### Build 0.4.0-r18 — snap-0075 — 2026-06-14 09:06:20

- Archive: `nexus-0075_2026-06-14_v0.4.0-r18_system-9.zip` (was `nexus-system-9.zip`)
- SHA-256: `052fed7fc7d9d3c80c7e02f28e87ed5c5902bcfff9d9f32ff75acf6b9fe3faaf`, 2.5 MB, downloaded 2026-06-14 09:15:04
- Kind: full
- Commit: `809fd44069ba25a2560a61f76fa5567022c216c6`, tag `snap-0075`
- Files in archive: 609. Changes against the build before it: **1 added, 17 modified, 103 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 4 | 52 |
| data | 0 | 3 | 47 |
| guardian | 0 | 4 | 0 |
| (root) | 0 | 3 | 0 |
| architect | 0 | 0 | 2 |
| auth | 0 | 0 | 2 |
| ui | 1 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
D auth/keys/nexus-private.pem
D auth/keys/nexus-public.pem
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
D cortex/data/active_traces.jsonl
D cortex/data/agent_calls.jsonl
D cortex/data/agent_messages.jsonl
D cortex/data/agent_signatures.jsonl
D cortex/data/artifacts.jsonl
D cortex/data/backup_records.jsonl
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/bep_patterns.jsonl
D cortex/data/boot_records.jsonl
D cortex/data/causality_nodes.jsonl
M cortex/data/cfr_state.json
D cortex/data/cli_history.jsonl
D cortex/data/conditioning_log.jsonl
D cortex/data/contract_audit.jsonl
D cortex/data/cortex_memory.jsonl
D cortex/data/crystals.jsonl
D cortex/data/decay_log.jsonl
D cortex/data/delta_records.jsonl
D cortex/data/event_log.jsonl
M cortex/data/event_stats.json
D cortex/data/failures.jsonl
D cortex/data/fault_taxonomy.jsonl
D cortex/data/feedback_scores.jsonl
D cortex/data/fix_map.jsonl
D cortex/data/forge_patches.jsonl
D cortex/data/gaps.jsonl
D cortex/data/healer_log.jsonl
D cortex/data/ime_profiles.jsonl
D cortex/data/intent_nodes.jsonl
D cortex/data/invariant/baseline.json
D cortex/data/law_violations.jsonl
D cortex/data/memory_index.jsonl
D cortex/data/memory_queries.jsonl
D cortex/data/orion_sessions.jsonl
D cortex/data/poll_log.jsonl
D cortex/data/project_registry.jsonl
D cortex/data/requests.jsonl
D cortex/data/reuse_index.jsonl
D cortex/data/schedules.jsonl
D cortex/data/seam_records.jsonl
D cortex/data/self_model.jsonl
D cortex/data/shape_samples.jsonl
D cortex/data/sigma_records.jsonl
D cortex/data/snr_records.jsonl
D cortex/data/toasts.jsonl
D cortex/data/trust_scores.jsonl
D cortex/data/versionium_branches.jsonl
D cortex/data/versionium_calendar.jsonl
D cortex/data/versionium_commits.jsonl
D cortex/data/versionium_file_index.jsonl
D cortex/data/versionium_objects.jsonl
D cortex/data/workflow_runs.jsonl
D cortex/data/working_memory.jsonl
M data/.poller-cursors.json
D data/architect/baseline-events.ndjson
D data/architect/baseline.json
D data/architect/invariant/baseline.json
D data/architect/metrics.jsonl
D data/bridge/baseline-events.ndjson
D data/bridge/baseline.json
D data/bridge/invariant/baseline.json
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/bridge/metrics.jsonl
D data/cobalt/ledger.idea.jsonl
D data/cobalt/ledger.truth.jsonl
D data/cortex/metrics.jsonl
D data/diagnostic/baseline-events.ndjson
D data/diagnostic/baseline.json
D data/diagnostic/diagnostic.pid
D data/diagnostic/invariant/baseline.json
D data/diagnostic/ledger/boot/events.ndjson
D data/diagnostic/ledger/gaps/events.ndjson
D data/diagnostic/ledger/poll/events.ndjson
D data/diagnostic/metrics.jsonl
D data/emerge/baseline-events.ndjson
D data/emerge/baseline.json
D data/emerge/invariant/baseline.json
D data/emerge/metrics.jsonl
D data/guardian/baseline-events.ndjson
D data/guardian/baseline.json
D data/guardian/invariant/baseline.json
M data/guardian/ledger/boot/events.ndjson
D data/guardian/metrics.jsonl
D data/idearium-tunnel.json
D data/idearium/baseline-events.ndjson
D data/idearium/baseline.json
D data/idearium/event_log.jsonl
D data/idearium/invariant/baseline.json
D data/idearium/metrics.jsonl
D data/knowledge/facts.jsonl
D data/ledger/event_log.jsonl
M data/ledger/event_stats.json
D data/ledger/orchestrator.jsonl
D data/orchestrator/baseline-events.ndjson
D data/orchestrator/baseline.json
D data/orchestrator/invariant/baseline.json
D data/orchestrator/metrics.jsonl
D data/snapshots/nex-4f82439c.nex
D data/snapshots/nex-67b96e7e.nex
D data/snapshots/nex-688ee81e.nex
D data/snapshots/nex-84b3c3fd.nex
D data/snapshots/nex-973eaea5.nex
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M orchestrator.js
M package-lock.json
M package.json
M service/nexus-diagnostic.js
M tests/brutal-results.json
M ui/index.html
A ui/pipeline-tutorial.js
```

### Build 0.4.0-r19 — snap-0076 — 2026-06-14 10:05:52

- Archive: `nexus-0076_2026-06-14_v0.4.0-r19_system-10.zip` (was `nexus-system-10.zip`)
- SHA-256: `b020a2d761f5165ac8e31afc3aa4fd5d258a778a022d7017f370f887e9575b1d`, 2.5 MB, downloaded 2026-06-14 10:10:58
- Kind: full
- Commit: `99ed77e40a78e53dd85addd68e603ece016178b2`, tag `snap-0076`
- Files in archive: 609. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M lib/contract-handshake.js
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r20 — snap-0077 — 2026-06-14 10:52:42

- Archive: `nexus-0077_2026-06-14_v0.4.0-r20_system-11.zip` (was `nexus-system-11.zip`)
- SHA-256: `908cdf34358328431d859ecc9f676d643fb3ff9ff5759fc88e4f39776cfa2584`, 2.8 MB, downloaded 2026-06-14 10:54:05
- Kind: full
- Commit: `a85b1010b2b866b8e02d4c7d2f5bc5551af54421`, tag `snap-0077`
- Files in archive: 661. Changes against the build before it: **52 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| erosmancer | 27 | 0 | 0 |
| lib | 24 | 0 | 0 |
| ui | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M cortex/heartbeat/index.js
A erosmancer/erosmancer-os/CHANGELOG.md
A erosmancer/erosmancer-os/MANIFEST.json
A erosmancer/erosmancer-os/README.md
A erosmancer/erosmancer-os/ROADMAP.md
A erosmancer/erosmancer-os/erosmancer-os.zip
A erosmancer/erosmancer-os/package.json
A erosmancer/erosmancer-os/src/adaptive/index.ts
A erosmancer/erosmancer-os/src/api/server.ts
A erosmancer/erosmancer-os/src/behavior/index.ts
A erosmancer/erosmancer-os/src/bridge/index.ts
A erosmancer/erosmancer-os/src/dispatcher/index.ts
A erosmancer/erosmancer-os/src/hostile/index.ts
A erosmancer/erosmancer-os/src/index.ts
A erosmancer/erosmancer-os/src/observer/index.ts
A erosmancer/erosmancer-os/src/registry/index.ts
A erosmancer/erosmancer-os/src/replay/index.ts
A erosmancer/erosmancer-os/src/routing/index.ts
A erosmancer/erosmancer-os/src/selector/index.ts
A erosmancer/erosmancer-os/src/telemetry/index.ts
A erosmancer/erosmancer-os/src/types/index.ts
A erosmancer/erosmancer-os/tests/adaptive.test.ts
A erosmancer/erosmancer-os/tests/hostile.test.ts
A erosmancer/erosmancer-os/tests/integration.test.ts
A erosmancer/erosmancer-os/tests/replay.test.ts
A erosmancer/erosmancer-os/tests/run.js
A erosmancer/erosmancer-os/tests/suite.ts
A erosmancer/erosmancer-os/tsconfig.json
M guardian/lib/gap-hunter.js
M idearium/api/index.js
A lib/meta/alk-perception/index.js
A lib/meta/bda/gaps.js
A lib/meta/bda/index.js
A lib/meta/bda/kernel.js
A lib/meta/bda/ledger.js
A lib/meta/bda/pendulum.js
A lib/meta/bda/signals.js
A lib/meta/index.js
A lib/meta/liminal/index.js
A lib/meta/spatial/index.js
A lib/meta/spatial/lattice.js
A lib/meta/spatial/sigma.js
A lib/meta/telemetry-codec/adapter.js
A lib/meta/telemetry-codec/bus.js
A lib/meta/telemetry-codec/drift-engine.js
A lib/meta/telemetry-codec/engines.js
A lib/meta/telemetry-codec/index.js
A lib/meta/telemetry-codec/latent-model.js
A lib/meta/telemetry-codec/runtime.js
A lib/meta/topo-kernel/bus.js
A lib/meta/topo-kernel/field.schema.json
A lib/meta/topo-kernel/index.js
A lib/meta/topo-kernel/signal.schema.json
A lib/meta/topo-kernel/snr.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
A ui/builder.html
M ui/index.html
```

### Build 0.4.0-r21 — snap-0078 — 2026-06-14 10:55:50

- Archive: `nexus-0078_2026-06-14_v0.4.0-r21_system-12.zip` (was `nexus-system-12.zip`)
- SHA-256: `6076fa87573ae8237b3675a538a33bb90588ef6d9370e40920152d13e82ea95b`, 2.8 MB, downloaded 2026-06-14 10:56:54
- Kind: full
- Commit: `9d635330e39b02830cb1067c9df10cbd6dacd604`, tag `snap-0078`
- Files in archive: 661. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M service/nexus-diagnostic.js
M tests/brutal-results.json
```

### Build 0.4.0-r22 — snap-0079 — 2026-06-14 11:00:40

- Archive: `nexus-0079_2026-06-14_v0.4.0-r22_system-13.zip` (was `nexus-system-13.zip`)
- SHA-256: `ffcdfbeaa3ca07041c1d297ce432b9223a153d99074f15b01c78465df994f489`, 2.8 MB, downloaded 2026-06-14 11:01:08
- Kind: full
- Commit: `e8a94ba66737c002ffeda24f65d1510d9f4618ac`, tag `snap-0079`
- Files in archive: 661. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M cortex/heartbeat/index.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
```

### Build 0.4.0-r23 — snap-0080 — 2026-06-14 18:41:36

- Archive: `nexus-0080_2026-06-14_v0.4.0-r23_system-14.zip` (was `nexus-system-14.zip`)
- SHA-256: `6347cbaf5613d20ccf2ecf0870f42f5879dc7807e8fd084be8c836e80d7415da`, 2.8 MB, downloaded 2026-06-14 18:42:44
- Kind: full
- Commit: `d107bffa951cb3a1004dd2e9bf0b29305dce75e5`, tag `snap-0080`
- Files in archive: 663. Changes against the build before it: **2 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 5 | 0 |
| lib | 2 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| auth | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M auth/client.js
M cortex/boot.js
M cortex/foundation/admin-server.js
M cortex/healer/index.js
M cortex/intelligence/index.js
M cortex/memory/jaa-db.js
M lib/context-builder.js
A lib/diagnostic-engines.js
A lib/vector-memory.js
M orchestrator.js
M service/nexus-diagnostic.js
M tests/brutal-results.json
M ui/index.html
```

### Build 0.4.0-r24 — snap-0081 — 2026-06-14 18:51:36

- Archive: `nexus-0081_2026-06-14_v0.4.0-r24_system-15.zip` (was `nexus-system-15.zip`)
- SHA-256: `4a5ead4d6c49ce27db40ffe334f51cfa0aae72215d00b3c9a06be0703e3575ef`, 2.8 MB, downloaded 2026-06-14 18:53:06
- Kind: full
- Commit: `283f643b095d57dbfd05a7a7538e2106a58f8145`, tag `snap-0081`
- Files in archive: 665. Changes against the build before it: **2 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 4 | 0 |
| cockpit | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |

```
M cockpit/forge.js
M cortex/boot.js
M cortex/foundation/admin-server.js
M cortex/memory/jaa-db.js
A cortex/self-heal/escalation.js
M cortex/self-heal/index.js
M guardian/server.js
A lib/chat-logger.js
M tests/brutal-results.json
```

### Build 0.4.0-r25 — snap-0082 — 2026-06-14 19:00:36

- Archive: `nexus-0082_2026-06-14_v0.4.0-r25_system-16.zip` (was `nexus-system-16.zip`)
- SHA-256: `5dc46f48483397053f4528859506ed1dbce24de51aecaf6ed52b1a83501ebe32`, 2.8 MB, downloaded 2026-06-14 19:02:13
- Kind: full
- Commit: `ff417ac3b53895d9abdd29f1607c73ecc12ebea4`, tag `snap-0082`
- Files in archive: 666. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| auth | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M auth/client.js
M cortex/core/raid/index.js
A guardian/api-dispatch.js
M guardian/server.js
M orchestrator.js
M tests/brutal-results.json
```

### Build 0.4.0-r26 — snap-0083 — 2026-06-14 19:17:28

- Archive: `nexus-0083_2026-06-14_v0.4.0-r26_system-17.zip` (was `nexus-system-17.zip`)
- SHA-256: `428744750883e7c720c13d454133c277d0bf9b29c725795047d1ea4f3cc10f2c`, 2.8 MB, downloaded 2026-06-14 19:17:47
- Kind: full
- Commit: `cb852b3fb6f1759f49c4343f2c024d25242e7f2b`, tag `snap-0083`
- Identical copy: `nexus-0083_2026-06-14_v0.4.0-r26_system-18_dup1.zip` (was `nexus-system-18.zip`)
- Files in archive: 668. Changes against the build before it: **2 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 2 | 1 | 0 |
| cockpit | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M cockpit/forge.js
M cortex/core/raid/index.js
M guardian/server.js
A guardian/userscript-gemini.js
A guardian/userscript-perplexity.js
M tests/brutal-results.json
```

### Build 0.4.0-r27 — snap-0084 — 2026-06-14 19:33:48

- Archive: `nexus-0084_2026-06-14_v0.4.0-r27_system-19.zip` (was `nexus-system-19.zip`)
- SHA-256: `cfbce677094d182c4c8012ba190487e28db9b9ef970b78dacf8d4717b7a0308a`, 2.8 MB, downloaded 2026-06-14 19:34:35
- Kind: full
- Commit: `64246c4cf230819b5ef97f1fcbd652a56a5aa744`, tag `snap-0084`
- Files in archive: 669. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 3 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
A guardian/userscript-ollama.js
M lib/ncp.js
M tests/brutal-results.json
```

### Build 0.4.0-r28 — snap-0085 — 2026-06-14 22:09:24

- Archive: `nexus-0085_2026-06-14_v0.4.0-r28_system-20.zip` (was `nexus-system-20.zip`)
- SHA-256: `fc32a1154b01424ca034eceade51a5335a75d5b83dce73d47d272bc063277a65`, 2.3 MB, downloaded 2026-06-14 22:10:00
- Kind: full
- Commit: `13be619313a342884f45a981d6aa7505d57c5473`, tag `snap-0085`
- Files in archive: 528. Changes against the build before it: **3 added, 6 modified, 144 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 83 |
| spec-compiler | 0 | 0 | 55 |
| guardian | 2 | 4 | 6 |
| (root) | 1 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
A CHANGELOG.md
M MANIFEST.json
M cortex/core/raid/index.js
M guardian/api-dispatch.js
A guardian/lib/cli-registry.js
A guardian/lib/dom-picker-inject.js
D guardian/memory_store/cfr_state.json
D guardian/memory_store/event_stats.json
D guardian/memory_store/gaps.json
D guardian/memory_store/ledger.json
D guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-claude.js
M guardian/userscript-ollama.js
D spec-compiler/SPEC_COMPILER.spec
D spec-compiler/chunk/index.js
D spec-compiler/cli.js
D spec-compiler/compiler/baseline-tracker.js
D spec-compiler/compiler/emit.js
D spec-compiler/compiler/gap-field-engine.js
D spec-compiler/compiler/index.js
D spec-compiler/compiler/invariants-engine.js
D spec-compiler/compiler/kg-builder.js
D spec-compiler/compiler/pipeline.js
D spec-compiler/compiler/reply-engine.js
D spec-compiler/compiler/ring-buffer.js
D spec-compiler/compiler/tier-contract.js
D spec-compiler/cortex-query/index.js
D spec-compiler/cortex-query/writeback.js
D spec-compiler/dispatch.js
D spec-compiler/output/verify-run/package.json
D spec-compiler/output/verify-run/src/index.ts
D spec-compiler/output/verify-run/src/modules/chunk/chunk.interface.ts
D spec-compiler/output/verify-run/src/modules/chunk/chunk.test.ts
D spec-compiler/output/verify-run/src/modules/chunk/chunk.ts
D spec-compiler/output/verify-run/src/modules/chunk/index.ts
D spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.interface.ts
D spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.test.ts
D spec-compiler/output/verify-run/src/modules/compiler-t0/compiler-t0.ts
D spec-compiler/output/verify-run/src/modules/compiler-t0/index.ts
D spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.interface.ts
D spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.test.ts
D spec-compiler/output/verify-run/src/modules/compiler-t1/compiler-t1.ts
D spec-compiler/output/verify-run/src/modules/compiler-t1/index.ts
D spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.interface.ts
D spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.test.ts
D spec-compiler/output/verify-run/src/modules/cortex-query/cortex-query.ts
D spec-compiler/output/verify-run/src/modules/cortex-query/index.ts
D spec-compiler/output/verify-run/src/types/events.ts
D spec-compiler/output/verify-run/src/types/index.ts
D spec-compiler/output/verify-run/src/types/schemas.ts
D spec-compiler/output/verify-run/tsconfig.json
D spec-compiler/package-lock.json
D spec-compiler/package.json
D spec-compiler/runtime.spec
D spec-compiler/seams/CORTEX_QUERY_SEAM.js
D spec-compiler/siso/Event.js
D spec-compiler/siso/Gate.js
D spec-compiler/siso/Stream.js
D spec-compiler/siso/StreamLog.js
D spec-compiler/siso/index.js
D spec-compiler/test/gap-field.test.js
D spec-compiler/test/invariants.test.js
D spec-compiler/test/kg.test.js
D spec-compiler/test/propagation.test.js
D spec-compiler/test/reply-engine.test.js
D spec-compiler/test/tier-contract.test.js
D spec-compiler/verify.js
D spec-compiler/version.js
```

84 more (mostly data, logs and archived files) are in the ledger file.

