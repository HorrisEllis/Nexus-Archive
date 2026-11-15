# Nexus 0.8.2

| | |
|---|---|
| Built | 2026-06-19 06:17:06 → 2026-06-20 01:15:28 |
| Builds on the main line | 14 |
| Other archives filed here | 3 |
| Versions the builds claimed | 0.8.2 |
| Tag | `v0.8.2` → snap-0134 |
| Full file ledger | [LEDGER-0.8.2.csv](../ledger/LEDGER-0.8.2.csv) |

## Ledger

### Build 0.8.2-r1 — snap-0118 — 2026-06-19 06:17:06

- Archive: `nexus-0118_2026-06-19_v0.8.2-r1_phase13-autonomous-loop.zip` (was `nexus-phase13-autonomous-loop.zip`)
- SHA-256: `89d1c22f13dc05a4d9eddc770252c1dafb7031e1e90fe152764bd50229e0c721`, 0.1 MB, downloaded 2026-06-19 06:24:56
- Kind: overlay (a patch laid over the build before it)
- Commit: `b20f12f91da67d82a2e17ec7889b517b3d50804f`, tag `snap-0118`
- Identical copy: `nexus-0118_2026-06-19_v0.8.2-r1_phase13-autonomous-loop-1_dup1.zip` (was `nexus-phase13-autonomous-loop-1.zip`)
- Files in archive: 12. Changes against the build before it: **5 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 3 | 0 |
| tests | 2 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| docs | 1 | 0 | 0 |

```
M cortex/boot.js
M cortex/memory/jaa-db.js
A docs/case-library.spec
A lib/autonomous-loop.js
A lib/case-library.js
M lib/compartment-engine.js
M lib/crystal-lattice.js
M lib/version.js
A tests/modules/autonomous-loop.test.js
A tests/modules/case-library.test.js
M tests/modules/compartment-engine.test.js
M tests/modules/run-all.js
```

### identical — 0119 — 2026-06-19 07:38:10

- Archive: `nexus-0119_2026-06-19_v0.8.2-r1_080-consolidated_same-as-0118.zip` (was `nexus-080-consolidated.zip`)
- SHA-256: `32ad8e54d362f9305bfe5d848757fb7d2ffff91c1819685cecf8497303cc97d3`, 3.6 MB, downloaded 2026-06-19 07:40:38
- Kind: identical (same tree as snap-0118; no commit)

### Build 0.8.2-r2 — snap-0120 — 2026-06-19 07:59:00

- Archive: `nexus-0120_2026-06-19_v0.8.2-r2_patch-bundle.zip` (was `nexus-patch-bundle.zip`)
- SHA-256: `f81083c648d5f5fc542f8a3ad5cb46259574550287e1ecb9b69441ab2d409f4f`, 0 MB, downloaded 2026-06-19 07:59:25
- Kind: overlay (a patch laid over the build before it)
- Commit: `bd333532eb08a5cb6ac00cc63845df2c49fee508`, tag `snap-0120`
- Identical copy: `nexus-0120_2026-06-19_v0.8.2-r2_patch-bundle-1_dup1.zip` (was `nexus-patch-bundle-1.zip`)
- Files in archive: 5. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M README.md
A cortex/flush-redundancy.js
M cortex/intelligence/index.js
M cortex/memory/jaa-db.js
M service/nexus-diagnostic.js
```

### Build 0.8.2-r3 — snap-0121 — 2026-06-19 08:05:14

- Archive: `nexus-0121_2026-06-19_v0.8.2-r3_080-patched.zip` (was `nexus-080-patched.zip`)
- SHA-256: `d17a56bc0607a9e03d7a17d69661a11b6c2a6db97dd7584fa4f386847c1b8a24`, 3.6 MB, downloaded 2026-06-19 08:05:45
- Kind: full
- Commit: `e41cf27243a776eef9c7733e0a928527893a5999`, tag `snap-0121`
- Files in archive: 681. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A PATCH-NOTES.md
M README.md
M lib/cfr/field.js
M nexus-cfr-influence.js
```

### Build 0.8.2-r4 — snap-0122 — 2026-06-19 08:20:16

- Archive: `nexus-0122_2026-06-19_v0.8.2-r4_080-patched-1.zip` (was `nexus-080-patched-1.zip`)
- SHA-256: `902bab8b97770fa012879d2cc057f2dc0dccc5364791e252c5b0a53807d32f77`, 3.6 MB, downloaded 2026-06-19 08:23:54
- Kind: full
- Commit: `4c711dd1c82c5953d259bbeac1d9b35ea7670123`, tag `snap-0122`
- Files in archive: 683. Changes against the build before it: **2 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 2 | 1 | 0 |
| lib | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M PATCH-NOTES.md
M data/guardian/ledger/boot/events.ndjson
A guardian/memory_store/event_log.jsonl
A guardian/memory_store/settings.json
M guardian/server.js
M lib/autonomous-loop.js
M lib/request-handler.js
```

### Build 0.8.2-r5 — snap-0123 — 2026-06-19 10:57:22

- Archive: `nexus-0123_2026-06-19_v0.8.2-r5_phase14-fixes.zip` (was `nexus-phase14-fixes.zip`)
- SHA-256: `53e07ec71321d6e2ad2a8578c284d87710d262e07b5b366563de9da95b0a4e17`, 0.1 MB, downloaded 2026-06-19 10:58:33
- Kind: overlay (a patch laid over the build before it)
- Commit: `646c351f9c418e840e51707c6149c60e72e989d8`, tag `snap-0123`
- Files in archive: 13. Changes against the build before it: **5 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 5 | 2 | 0 |
| cortex | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
M cortex/flush-redundancy.js
M cortex/foundation/admin-server.js
M cortex/intelligence/index.js
M lib/baseline.js
M ollama-runtime.js
M orchestrator.js
A tests/modules/admin-server-routes.test.js
M tests/modules/baseline.test.js
A tests/modules/flush-redundancy.test.js
A tests/modules/intelligence.test.js
A tests/modules/ollama-runtime.test.js
A tests/modules/orchestrator-cli.test.js
M tests/modules/run-all.js
```

### empty — 0124 — 2026-06-19 17:07:37

- Archive: `nexus-0124_2026-06-19_v0.8.2_integrated_empty.zip` (was `Nexus-integrated.zip`)
- SHA-256: `fbe874553433cb3d933ad791847360d7d4968f74aa1153d1706b026297da6610`, 0 MB, downloaded 2026-06-19 17:07:37
- Kind: empty (no commit)
- Identical copy: `nexus-0124_2026-06-19_v0.8.2_integrated-1_dup1_empty.zip` (was `Nexus-integrated-1.zip`)
- Identical copy: `nexus-0124_2026-06-19_v0.8.2_integrated-2_dup2_empty.zip` (was `Nexus-integrated-2.zip`)
- Identical copy: `nexus-0124_2026-06-19_v0.8.2_integrated-3_dup3_empty.zip` (was `Nexus-integrated-3.zip`)

### empty — 0125 — 2026-06-19 17:59:24

- Archive: `nexus-0125_2026-06-19_v0.8.2_integrated-4_empty.zip` (was `Nexus-integrated-4.zip`)
- SHA-256: `53904340dbc0cf652bd645a6dca70bf4a9160b3b776c8a02cf920da1bb3fc5de`, 0 MB, downloaded 2026-06-19 17:59:24
- Kind: empty (no commit)

### Build 0.8.2-r6 — snap-0126 — 2026-06-19 18:38:30

- Archive: `nexus-0126_2026-06-19_v0.8.2-r6_integrated-5.zip` (was `Nexus-integrated-5.zip`)
- SHA-256: `5da87602191e1153fa1459b7d2b24ef7558009f4e9f2254674e6aa81cf7c05ff`, 11.4 MB, downloaded 2026-06-19 18:40:04
- Kind: full
- Commit: `7a7005fd93e9aee6bebf7693ff86d19711ab101c`, tag `snap-0126`
- Files in archive: 775. Changes against the build before it: **88 added, 34 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 58 | 1 | 0 |
| cortex | 11 | 22 | 0 |
| guardian | 7 | 3 | 0 |
| lib | 6 | 2 | 0 |
| architect | 3 | 1 | 0 |
| idearium | 2 | 2 | 0 |
| ui | 1 | 1 | 1 |
| (root) | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M architect/service.js
A architect/src/hooks/sync-from-component-registry.js
M cortex/boot.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/active_traces.jsonl
M cortex/data/agent_calls.jsonl
M cortex/data/agent_messages.jsonl
M cortex/data/artifacts.jsonl
A cortex/data/autonomous_runs.jsonl
M cortex/data/backup_records.jsonl
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
M cortex/data/bep_patterns.jsonl
A cortex/data/case_index.jsonl
M cortex/data/cfr_state.json
A cortex/data/compartments.jsonl
A cortex/data/constitution_decisions.jsonl
M cortex/data/cortex_memory.jsonl
M cortex/data/decay_log.jsonl
A cortex/data/decision_log.jsonl
M cortex/data/event_log.jsonl
M cortex/data/event_stats.json
M cortex/data/fix_map.jsonl
M cortex/data/forge_patches.jsonl
M cortex/data/gaps.jsonl
A cortex/data/invariant/baseline.json
A cortex/data/lattice_edges.jsonl
M cortex/data/memory_index.jsonl
M cortex/data/orion_sessions.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
A cortex/data/snapshots.jsonl
A cortex/data/user_model_hypotheses.jsonl
M cortex/gap-loop.js
A data/alk/decisions.jsonl
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/chat-logs/2026-06-19T16-37-19-b679a362.jsonl
A data/chat-logs/2026-06-19T17-15-46-be5febac.jsonl
A data/chat-logs/2026-06-19T17-59-33-8f62c7f5.jsonl
A data/chat-logs/2026-06-19T18-09-51-beca8e71.jsonl
A data/cobalt/ledger.idea.jsonl
A data/cobalt/ledger.truth.jsonl
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/diagnostic/remediation.jsonl
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/conversations/1996cbf2-1514-4c6f-a182-94208c6239d5/conversation.jsonl
A data/guardian/conversations/1ae3072e-fa38-47c4-a9bc-ddbde78209a2/conversation.jsonl
A data/guardian/conversations/57174a1a-66d9-4e84-b502-9b8feb1e1b66/conversation.jsonl
A data/guardian/conversations/689984ce-4362-4647-82e2-f88ed6a0ab50/conversation.jsonl
A data/guardian/conversations/7c2d4f0e-db2c-4914-8bf5-981e7423fbaf/conversation.jsonl
A data/guardian/conversations/7d55f82c-39ba-45d9-ad6f-b37589e99d17/conversation.jsonl
A data/guardian/conversations/8b9f6c85-4322-4586-943b-32bfa2912d65/conversation.jsonl
A data/guardian/conversations/ae5cbbd0-0a67-4bec-b354-20fb7b0ef451/conversation.jsonl
A data/guardian/conversations/cdac2f54-cafe-4660-9124-549b519b69ad/conversation.jsonl
A data/guardian/conversations/d3b4b796-ec4f-4610-825b-d923be4ce524/conversation.jsonl
A data/guardian/invariant/baseline.json
A data/guardian/ledger/baseline-events.ndjson
M data/guardian/ledger/boot/events.ndjson
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/invariant/baseline.json
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
A data/ledger/event_stats.json
A data/ledger/orchestrator.jsonl
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
A data/output/2026-06-19/689984ce/ollama-1781892004641-1.emerge
A data/output/2026-06-19/689984ce/ollama-1781892004646-1.emerge
A data/output/2026-06-19/d3b4b796/ollama-1781889346113-1.emerge
A data/output/2026-06-19/d3b4b796/ollama-1781889346130-1.emerge
A data/snapshots/nex-271ec369.nex
A data/snapshots/nex-5cb56c5f.nex
A data/snapshots/nex-b57600c2.nex
A data/snapshots/nex-c6578103.nex
A data/snapshots/nex-d41cb246.nex
A guardian/memory_store/artifacts.json
A guardian/memory_store/cfr_state.json
A guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.jsonl
A guardian/memory_store/event_stats.json
A guardian/memory_store/gaps.json
A guardian/memory_store/jobs.json
A guardian/memory_store/ledger.json
M guardian/memory_store/settings.json
M guardian/server.js
M idearium/api/index.js
A idearium/compiler-bridge.js
M idearium/index.js
A idearium/registry-components.js
M lib/cfr/sigma.js
A lib/contract-registry-writer.js
A lib/diag-engines/index.js
A lib/gap-ledger.js
A lib/nexus-expansion-boot.js
M lib/open-loop-taxonomy.js
A lib/open-loop-taxonomy.patch.js
A lib/sigma-writer.js
M orchestrator.js
M service/nexus-diagnostic.js
D ui/cortex.html
M ui/home/index.html
A ui/orchestrator/index.html
```

### Build 0.8.2-r7 — snap-0127 — 2026-06-19 19:07:28

- Archive: `nexus-0127_2026-06-19_v0.8.2-r7_integrated-6.zip` (was `nexus-integrated-6.zip`)
- SHA-256: `16f9fcaae430d1dd338c069e318a31364d084ef48f86bead942776307087265b`, 11.4 MB, downloaded 2026-06-19 19:13:04
- Kind: full
- Commit: `86f60450adf5c5af7715448224ffa2320c7d070d`, tag `snap-0127`
- Identical copy: `nexus-0127_2026-06-19_v0.8.2-r7_integrated-6-1_dup1.zip` (was `nexus-integrated-6-1.zip`)
- Files in archive: 775. Changes against the build before it: **0 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| architect | 0 | 2 | 0 |
| service | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M architect/service.js
M architect/src/hooks/sync-from-component-registry.js
M service/nexus-diagnostic.js
M ui/home/index.html
```

### Build 0.8.2-r8 — snap-0128 — 2026-06-19 20:03:46

- Archive: `nexus-0128_2026-06-19_v0.8.2-r8_integrated-7.zip` (was `nexus-integrated-7.zip`)
- SHA-256: `aa757486cccb78ec6e58310aa7a5e29a1f0a80b3290386c0f6ae365de7d7ec96`, 11.4 MB, downloaded 2026-06-19 20:13:21
- Kind: full
- Commit: `e9e51af224e5e040f70974eab23574c0c241319f`, tag `snap-0128`
- Files in archive: 777. Changes against the build before it: **2 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 2 | 1 | 0 |
| guardian | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A cortex/agents/chatgpt/index.js
A cortex/agents/gemini/index.js
M cortex/boot.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M lib/ncp.js
```

### Build 0.8.2-r9 — snap-0129 — 2026-06-19 20:53:22

- Archive: `nexus-0129_2026-06-19_v0.8.2-r9_integrated-8.zip` (was `nexus-integrated-8.zip`)
- SHA-256: `69914fe3e9831fabb0aa648414b32e8eac34c94e613cb7ceb3171e24f9695f76`, 11.4 MB, downloaded 2026-06-19 20:55:56
- Kind: full
- Commit: `1cb20282a16516365c635cd92025029c75b8752a`, tag `snap-0129`
- Files in archive: 778. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 4 | 0 |
| tests | 1 | 0 | 0 |

```
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
A tests/userscript-adapter-consistency.test.js
```

### Build 0.8.2-r10 — snap-0130 — 2026-06-19 21:08:56

- Archive: `nexus-0130_2026-06-19_v0.8.2-r10_integrated-9.zip` (was `nexus-integrated-9.zip`)
- SHA-256: `eb31fd9a93ee526091093b1ad20badaf036963756431d7eb8215aed7265c5a99`, 12.1 MB, downloaded 2026-06-19 21:30:33
- Kind: full
- Commit: `5e80e602e42b681da91d82f6e09212dd1fa4e234`, tag `snap-0130`
- Identical copy: `nexus-0130_2026-06-19_v0.8.2-r10_integrated-9-1_dup1.zip` (was `nexus-integrated-9-1.zip`)
- Files in archive: 780. Changes against the build before it: **3 added, 15 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 10 | 0 |
| data | 2 | 2 | 0 |
| (root) | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| guardian | 0 | 0 | 1 |
| ui | 0 | 1 | 0 |

```
M architect/data/event_log.jsonl
A autopilot.js
M cortex/data/.cortex.boot
M cortex/data/.cortex.pid
M cortex/data/active_traces.jsonl
M cortex/data/backup_records.jsonl
M cortex/data/event_log.jsonl
M cortex/data/memory_index.jsonl
M cortex/data/orion_sessions.jsonl
M cortex/data/poll_log.jsonl
M cortex/data/project_registry.jsonl
M cortex/data/sigma_records.jsonl
M data/.poller-cursors.json
A data/architect/event_log.jsonl
M data/cobalt/ledger.truth.jsonl
A data/snapshots/nex-aac338aa.nex
D guardian/guardian-cli.js
M package.json
M ui/home/index.html
```

### Build 0.8.2-r11 — snap-0131 — 2026-06-19 21:35:26

- Archive: `nexus-0131_2026-06-19_v0.8.2-r11_integrated-10.zip` (was `nexus-integrated-10.zip`)
- SHA-256: `18c62b71afc246c089b962ee09cbddc54c1e868dd98d61afccb252aba3d63492`, 12.1 MB, downloaded 2026-06-19 21:36:06
- Kind: full
- Commit: `84e4b94e16bb4eabb6f6cb5d463fadbc4203f984`, tag `snap-0131`
- Files in archive: 780. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.8.2-r12 — snap-0132 — 2026-06-20 00:48:18

- Archive: `nexus-0132_2026-06-20_v0.8.2-r12_integrated-11.zip` (was `nexus-integrated-11.zip`)
- SHA-256: `b3b1d13baf4616a17b7c1113f6846186095ab393445aea0bad6c299c4911e1f6`, 12 MB, downloaded 2026-06-20 00:49:46
- Kind: full
- Commit: `aca074513d50f25c1a487bec15cf10194c3489f9`, tag `snap-0132`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (67 MB)`
- Files in archive: 667. Changes against the build before it: **12 added, 75 modified, 126 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 10 | 35 | 125 |
| cortex | 0 | 21 | 1 |
| guardian | 1 | 12 | 0 |
| (root) | 0 | 4 | 0 |
| architect | 0 | 2 | 0 |
| cli | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
M autopilot.js
A cli/run-supervised.js
M cortex/agents/index.js
M cortex/boot.js
A guardian/agents/ollama.js
M guardian/cli.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/cfr_state.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/gaps.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M orchestrator.js
M package-lock.json
M package.json
M ui/home/index.html
```

193 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.8.2-r13 — snap-0133 — 2026-06-20 00:52:04

- Archive: `nexus-0133_2026-06-20_v0.8.2-r13_integrated-12.zip` (was `nexus-integrated-12.zip`)
- SHA-256: `cd5ed637d2b62a0723978e4546e5d72ff8e02831c1ae7b5a52f26fa3780fae48`, 12 MB, downloaded 2026-06-20 00:53:39
- Kind: full
- Commit: `e840f4d9933223d23584b5d54f5aea70c77ce148`, tag `snap-0133`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (67 MB)`
- Files in archive: 667. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/home/index.html
```

### Build 0.8.2-r14 — snap-0134 — 2026-06-20 01:15:28

- Archive: `nexus-0134_2026-06-20_v0.8.2-r14_integrated-13.zip` (was `nexus-integrated-13.zip`)
- SHA-256: `517ae3f72a21e49e64d48405922216798b247d7f58cdf5121f229262135cf4c5`, 12 MB, downloaded 2026-06-20 01:18:12
- Kind: full
- Commit: `f1e89fa538987d0ce9a2e9551fb0a1fdd0aba4be`, tag `snap-0134`
- Left out (50 MB or more): `cortex/data/baseline-events.ndjson (67 MB)`
- Files in archive: 671. Changes against the build before it: **4 added, 14 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 5 | 0 |
| data | 2 | 2 | 0 |
| (root) | 0 | 3 | 0 |
| cortex | 0 | 2 | 0 |
| ui | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M cortex/data/active_traces.jsonl
M cortex/data/working_memory.jsonl
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
M data/ledger/event_log.jsonl
M data/ledger/orchestrator.jsonl
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/ncp.js
M orchestrator.js
M package-lock.json
M package.json
A tests/manual-chatgpt-console.playwright.js
A ui/agents/chatgpt/index.html
M ui/home/index.html
```

