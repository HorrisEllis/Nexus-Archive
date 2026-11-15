# Nexus 0.6.3

| | |
|---|---|
| Built | 2026-06-16 08:45:08 → 2026-06-16 16:29:50 |
| Builds on the main line | 13 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.6.3 |
| Tag | `v0.6.3` → snap-0102 |
| Full file ledger | [LEDGER-0.6.3.csv](../ledger/LEDGER-0.6.3.csv) |

## Ledger

### Build 0.6.3-r1 — snap-0090 — 2026-06-16 08:45:08

- Archive: `nexus-0090_2026-06-16_v0.6.3-r1_system-25.zip` (was `nexus-system-25.zip`)
- SHA-256: `25f73d7891c1c9164834f48c9becf18beda019a5facb791d3ad3e6de7cd10beb`, 2.9 MB, downloaded 2026-06-16 08:45:52
- Kind: full
- Commit: `e87dbd8c12e7bc02f0f03c1068bde00ef9a97565`, tag `snap-0090`
- Files in archive: 753. Changes against the build before it: **2 added, 10 modified, 5 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 6 | 5 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| tests | 0 | 1 | 0 |

```
M cli/diagnose.js
D cortex/data/escalation_log.jsonl
D cortex/data/failure_modes.jsonl
D cortex/data/fault_taxonomy.jsonl
D cortex/data/fix_map.jsonl
D cortex/data/forge_patches.jsonl
M cortex/foundation/admin-server.js
M cortex/gate/gap-finder.js
M cortex/healer/index.js
M cortex/memory/jaa-db.js
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
A docs/api-dispatch.spec
A lib/replay-engine.js
M lib/version.js
M package.json
M tests/brutal-results.json
```

### Build 0.6.3-r2 — snap-0091 — 2026-06-16 09:01:24

- Archive: `nexus-0091_2026-06-16_v0.6.3-r2_merged.zip` (was `nexus-merged-v0.6.3.zip`)
- SHA-256: `fbe977f73383c485266db6614ce94d64fa148766d074670f73cdd92385d1239c`, 4 MB, downloaded 2026-06-16 09:02:27
- Kind: full
- Commit: `f0edc1c70cf84b1a00680b7a7e7ed4ea5df468d0`, tag `snap-0091`
- Redacted: `auth/keys/nexus-private.pem (1 x private-key)`
- Files in archive: 754. Changes against the build before it: **56 added, 5 modified, 55 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 54 | 2 | 0 |
| spec-compiler | 0 | 0 | 55 |
| auth | 2 | 0 | 0 |
| data | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |

```
A auth/keys/nexus-private.pem
A auth/keys/nexus-public.pem
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
A cortex/data/chat_log.jsonl
A cortex/data/cli_history.jsonl
A cortex/data/components.jsonl
A cortex/data/conditioning_log.jsonl
A cortex/data/contract_audit.jsonl
A cortex/data/cortex_memory.jsonl
A cortex/data/crystals.jsonl
A cortex/data/decay_log.jsonl
A cortex/data/delta_records.jsonl
A cortex/data/escalation_log.jsonl
A cortex/data/event_log.jsonl
M cortex/data/event_stats.json
A cortex/data/failure_modes.jsonl
A cortex/data/failures.jsonl
A cortex/data/fault_taxonomy.jsonl
A cortex/data/feedback_scores.jsonl
A cortex/data/fix_map.jsonl
A cortex/data/forge_patches.jsonl
A cortex/data/gaps.jsonl
A cortex/data/healer_log.jsonl
A cortex/data/ime_profiles.jsonl
A cortex/data/intent_nodes.jsonl
A cortex/data/interstitial_spaces.jsonl
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
M data/.poller-cursors.json
M data/ledger/event_stats.json
M guardian/server.js
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

### Build 0.6.3-r3 — snap-0092 — 2026-06-16 09:07:12

- Archive: `nexus-0092_2026-06-16_v0.6.3-r3_patched.zip` (was `nexus-v0.6.3-patched.zip`)
- SHA-256: `b5597403ddfca22b8f9a35665e1fac1d4e65cbca9ac2245bf5c24efa532c3484`, 4 MB, downloaded 2026-06-16 09:09:05
- Kind: full
- Commit: `ead60553bc8bc20f260cfb1519e3b5713ab83672`, tag `snap-0092`
- Files in archive: 754. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cli | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cli/boot-systems.js
M guardian/server.js
M ui/boot-systems.js
```

### Build 0.6.3-r4 — snap-0093 — 2026-06-16 09:10:40

- Archive: `nexus-0093_2026-06-16_v0.6.3-r4_patched-1.zip` (was `nexus-v0.6.3-patched-1.zip`)
- SHA-256: `3ee40bc810bf61195bfbd224b5cc032875b0b957a28124bce6eb4db4394aca0f`, 4 MB, downloaded 2026-06-16 09:11:15
- Kind: full
- Commit: `88f11c61a27c58879c5a462c02c80088832bbe06`, tag `snap-0093`
- Files in archive: 754. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 1 | 0 |

```
M guardian/server.js
```

### Build 0.6.3-r5 — snap-0094 — 2026-06-16 09:27:48

- Archive: `nexus-0094_2026-06-16_v0.6.3-r5_patched-2.zip` (was `nexus-v0.6.3-patched-2.zip`)
- SHA-256: `868b95eb4794deaacd94ef81fbbaf11e1ef53875d29ff2fd56ebbe003790accd`, 4 MB, downloaded 2026-06-16 09:29:27
- Kind: full
- Commit: `48793ef8726a4613c8c368f975afe975344ae247`, tag `snap-0094`
- Files in archive: 757. Changes against the build before it: **3 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 1 | 0 |
| lib | 2 | 0 | 0 |

```
M cortex/boot.js
A cortex/gap-loop.js
A lib/loop-topology.js
A lib/open-loop-taxonomy.js
```

### Build 0.6.3-r6 — snap-0095 — 2026-06-16 09:34:50

- Archive: `nexus-0095_2026-06-16_v0.6.3-r6_patched-3.zip` (was `nexus-v0.6.3-patched-3.zip`)
- SHA-256: `2d2ef76a68e0cb25e4eb55739832dbb8f095f8c28ef90377044990f5a9485bca`, 4.1 MB, downloaded 2026-06-16 09:36:26
- Kind: full
- Commit: `1d6f10c03ec1fec63f672c429b6c9f55247f9847`, tag `snap-0095`
- Files in archive: 789. Changes against the build before it: **32 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cockpit | 32 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A cockpit/spec-compiler/SPEC_COMPILER.spec
A cockpit/spec-compiler/chunk/index.js
A cockpit/spec-compiler/compiler/baseline-tracker.js
A cockpit/spec-compiler/compiler/emit.js
A cockpit/spec-compiler/compiler/gap-field-engine.js
A cockpit/spec-compiler/compiler/index.js
A cockpit/spec-compiler/compiler/invariants-engine.js
A cockpit/spec-compiler/compiler/kg-builder.js
A cockpit/spec-compiler/compiler/pipeline.js
A cockpit/spec-compiler/compiler/reply-engine.js
A cockpit/spec-compiler/compiler/ring-buffer.js
A cockpit/spec-compiler/compiler/tier-contract.js
A cockpit/spec-compiler/cortex-query/index.js
A cockpit/spec-compiler/cortex-query/writeback.js
A cockpit/spec-compiler/idearium/client.js
A cockpit/spec-compiler/package-lock.json
A cockpit/spec-compiler/package.json
A cockpit/spec-compiler/runtime.spec
A cockpit/spec-compiler/seams/CORTEX_QUERY_SEAM.js
A cockpit/spec-compiler/siso/Event.js
A cockpit/spec-compiler/siso/Gate.js
A cockpit/spec-compiler/siso/Stream.js
A cockpit/spec-compiler/siso/StreamLog.js
A cockpit/spec-compiler/siso/index.js
A cockpit/spec-compiler/test/gap-field.test.js
A cockpit/spec-compiler/test/invariants.test.js
A cockpit/spec-compiler/test/kg.test.js
A cockpit/spec-compiler/test/propagation.test.js
A cockpit/spec-compiler/test/reply-engine.test.js
A cockpit/spec-compiler/test/tier-contract.test.js
A cockpit/spec-compiler/verify.js
A cockpit/spec-compiler/version.js
M guardian/lib/spec-bridge/index.js
M orchestrator.js
```

### Build 0.6.3-r7 — snap-0096 — 2026-06-16 09:42:08

- Archive: `nexus-0096_2026-06-16_v0.6.3-r7_patched-4.zip` (was `nexus-v0.6.3-patched-4.zip`)
- SHA-256: `ecf59c1f5d7967ea2b3eb6f9cf97e8fec09ff7c0d7636fb6cd9f0d159591670b`, 4.4 MB, downloaded 2026-06-16 10:06:28
- Kind: full
- Commit: `ffefc0162a1bc1e603e69965222626701700a5ad`, tag `snap-0096`
- Files in archive: 853. Changes against the build before it: **64 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| emerge | 64 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M cli/diagnose.js
A emerge/SPEC_COMPILER.spec
A emerge/chunk/index.js
A emerge/compiler/baseline-tracker.js
A emerge/compiler/emit.js
A emerge/compiler/gap-field-engine.js
A emerge/compiler/index.js
A emerge/compiler/invariants-engine.js
A emerge/compiler/kg-builder.js
A emerge/compiler/pipeline.js
A emerge/compiler/reply-engine.js
A emerge/compiler/ring-buffer.js
A emerge/compiler/tier-contract.js
A emerge/cortex-query/index.js
A emerge/cortex-query/writeback.js
A emerge/idearium/client.js
A emerge/package-lock.json
A emerge/package.json
A emerge/runtime.spec
A emerge/seams/CORTEX_QUERY_SEAM.js
A emerge/siso/Event.js
A emerge/siso/Gate.js
A emerge/siso/Stream.js
A emerge/siso/StreamLog.js
A emerge/siso/index.js
A emerge/spec-compiler/SPEC_COMPILER.spec
A emerge/spec-compiler/chunk/index.js
A emerge/spec-compiler/compiler/baseline-tracker.js
A emerge/spec-compiler/compiler/emit.js
A emerge/spec-compiler/compiler/gap-field-engine.js
A emerge/spec-compiler/compiler/index.js
A emerge/spec-compiler/compiler/invariants-engine.js
A emerge/spec-compiler/compiler/kg-builder.js
A emerge/spec-compiler/compiler/pipeline.js
A emerge/spec-compiler/compiler/reply-engine.js
A emerge/spec-compiler/compiler/ring-buffer.js
A emerge/spec-compiler/compiler/tier-contract.js
A emerge/spec-compiler/cortex-query/index.js
A emerge/spec-compiler/cortex-query/writeback.js
A emerge/spec-compiler/idearium/client.js
A emerge/spec-compiler/package-lock.json
A emerge/spec-compiler/package.json
A emerge/spec-compiler/runtime.spec
A emerge/spec-compiler/seams/CORTEX_QUERY_SEAM.js
A emerge/spec-compiler/siso/Event.js
A emerge/spec-compiler/siso/Gate.js
A emerge/spec-compiler/siso/Stream.js
A emerge/spec-compiler/siso/StreamLog.js
A emerge/spec-compiler/siso/index.js
A emerge/spec-compiler/test/gap-field.test.js
A emerge/spec-compiler/test/invariants.test.js
A emerge/spec-compiler/test/kg.test.js
A emerge/spec-compiler/test/propagation.test.js
A emerge/spec-compiler/test/reply-engine.test.js
A emerge/spec-compiler/test/tier-contract.test.js
A emerge/spec-compiler/verify.js
A emerge/spec-compiler/version.js
A emerge/test/gap-field.test.js
A emerge/test/invariants.test.js
A emerge/test/kg.test.js
A emerge/test/propagation.test.js
A emerge/test/reply-engine.test.js
A emerge/test/tier-contract.test.js
A emerge/verify.js
A emerge/version.js
M guardian/lib/spec-bridge/index.js
M orchestrator.js
```

### Build 0.6.3-r8 — snap-0097 — 2026-06-16 15:37:40

- Archive: `nexus-0097_2026-06-16_v0.6.3-r8_patched-5.zip` (was `nexus-v0.6.3-patched-5.zip`)
- SHA-256: `3c37313184898b661886a699a58ff3fa145828b663db69831f159ac4cb931a76`, 4.3 MB, downloaded 2026-06-16 15:38:18
- Kind: full
- Commit: `b6e448eeafe46c4ef245399b5d2f29bf89b63ca9`, tag `snap-0097`
- Files in archive: 853. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 4 | 0 |
| cortex | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |

```
M cortex/gate/gap-finder.js
M cortex/self-heal/escalation.js
M guardian/server.js
M ui/cortex/index.html
M ui/guardian/index.html
M ui/home/index.html
M ui/idearium/index.html
```

### Build 0.6.3-r9 — snap-0098 — 2026-06-16 15:42:00

- Archive: `nexus-0098_2026-06-16_v0.6.3-r9_patched-6.zip` (was `nexus-v0.6.3-patched-6.zip`)
- SHA-256: `48469ebdf19938a2a77c9646bff042a9000898020464be71617ad701fce80128`, 4.3 MB, downloaded 2026-06-16 15:42:52
- Kind: full
- Commit: `8f3636c618dc381785573df073c1cebe0f7a9a0a`, tag `snap-0098`
- Files in archive: 853. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.6.3-r10 — snap-0099 — 2026-06-16 15:45:58

- Archive: `nexus-0099_2026-06-16_v0.6.3-r10_patched-7.zip` (was `nexus-v0.6.3-patched-7.zip`)
- SHA-256: `910a84584d2b792b90b8758f6a04de9225b6eef68dbed43c20366aba986f7621`, 4.3 MB, downloaded 2026-06-16 15:46:19
- Kind: full
- Commit: `eed1e734de4bc286fc2ccfe084e21d183954ba83`, tag `snap-0099`
- Identical copy: `nexus-0099_2026-06-16_v0.6.3-r10_patched-8_dup1.zip` (was `nexus-v0.6.3-patched-8.zip`)
- Files in archive: 853. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.6.3-r11 — snap-0100 — 2026-06-16 15:48:12

- Archive: `nexus-0100_2026-06-16_v0.6.3-r11_patched-9.zip` (was `nexus-v0.6.3-patched-9.zip`)
- SHA-256: `50b31d500f3987cd6f6628632d8fe0bbd9b696ac5b613da10ad5f98fc1ef0068`, 4.3 MB, downloaded 2026-06-16 15:48:48
- Kind: full
- Commit: `181eea27e8f691c8c3020a8de4042976c21db316`, tag `snap-0100`
- Files in archive: 853. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.6.3-r12 — snap-0101 — 2026-06-16 15:52:42

- Archive: `nexus-0101_2026-06-16_v0.6.3-r12_patched-10.zip` (was `nexus-v0.6.3-patched-10.zip`)
- SHA-256: `449bf56f14ca2c8601eb5cf3ca83b75f75cbc6cac44f8dc2343d9cbd82c8758c`, 4.3 MB, downloaded 2026-06-16 15:59:11
- Kind: full
- Commit: `c9f324cd28ea578354f638d6c9d95230731d8f33`, tag `snap-0101`
- Files in archive: 853. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.6.3-r13 — snap-0102 — 2026-06-16 16:29:50

- Archive: `nexus-0102_2026-06-16_v0.6.3-r13_patched-11.zip` (was `nexus-v0.6.3-patched-11.zip`)
- SHA-256: `fd069e35411f12560f8a61b5b465ad7b89bbd9dd69e9dd99ab87ea66646b9ee7`, 4.3 MB, downloaded 2026-06-16 16:35:32
- Kind: full
- Commit: `1fb3a1e0b0a23cb4fac2af4857134f28c1857976`, tag `snap-0102`
- Files in archive: 853. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

