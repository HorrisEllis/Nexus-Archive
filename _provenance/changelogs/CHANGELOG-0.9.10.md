# Nexus 0.9.10

| | |
|---|---|
| Built | 2026-07-04 15:52:04 → 2026-07-11 23:59:20 |
| Builds on the main line | 33 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.9.10 |
| Tag | `v0.9.10` → snap-0275 |
| Full file ledger | [LEDGER-0.9.10.csv](../ledger/LEDGER-0.9.10.csv) |

## Ledger

### Build 0.9.10-r1 — snap-0243 — 2026-07-04 15:52:04

- Archive: `nexus-0243_2026-07-04_v0.9.10-r1_consolidated-fixed.zip` (was `nexus-consolidated-fixed.zip`)
- SHA-256: `2a2114287954aa6de38318411bc4debb3f775f0f5a5395ce2b369120b3e2f673`, 5.2 MB, downloaded 2026-07-04 16:21:48
- Kind: full
- Commit: `0c1f226802e851c02a384e87d84fcde44c5c0fd0`, tag `snap-0243`
- Files in archive: 1004. Changes against the build before it: **5 added, 31 modified, 262 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 5 | 262 |
| ui | 4 | 2 | 0 |
| guardian | 0 | 5 | 0 |
| (root) | 0 | 3 | 0 |
| clear-glass | 1 | 2 | 0 |
| copilot | 0 | 3 | 0 |
| architect | 0 | 2 | 0 |
| cos | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M blueprint-index.json
M bridge/index.js
A clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/src/main/index.js
M cli/nexus.js
M copilot/analysis.js
M copilot/lifeline.js
M copilot/server.js
M cos/foundation/runtime-enum.js
M cos/vaultd/server.js
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
M guardian/server.js
M lib/version.js
M loom/server.js
M ollama/server.js
M orchestrator.js
M package.json
A ui/copilot/copilot.js
A ui/copilot/copilot.test.js
A ui/home/home.css
M ui/home/index.html
M ui/tv-shell/index.html
A ui/tv-shell/tv-shell.css
```

272 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.10-r2 — snap-0244 — 2026-07-04 16:31:00

- Archive: `nexus-0244_2026-07-04_v0.9.10-r2_consolidated-9.zip` (was `nexus-consolidated-9.zip`)
- SHA-256: `89488ffeb27216f4cd42b882470000219238f6ba626279342986d67a88d983ec`, 5.2 MB, downloaded 2026-07-04 16:32:28
- Kind: full
- Commit: `e280907865297b700659e0a7ee60bf473064c184`, tag `snap-0244`
- Files in archive: 1004. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |
| data | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M tests/modules/nerve-phase0-phase1.test.js
M tests/modules/nexus-seam.test.js
```

### Build 0.9.10-r3 — snap-0245 — 2026-07-04 16:53:50

- Archive: `nexus-0245_2026-07-04_v0.9.10-r3_consolidated-10.zip` (was `nexus-consolidated-10.zip`)
- SHA-256: `9e68a449bbd4e3a98f4106a1b70faa1beac38142605231ad021539ec9701b9f6`, 5.2 MB, downloaded 2026-07-04 16:54:04
- Kind: full
- Commit: `9676135f9b251818af15324d9b57f0c5f0536e82`, tag `snap-0245`
- Files in archive: 1008. Changes against the build before it: **4 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 4 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| data | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M blueprint-index.json
M bridge/router.js
M data/ledger/reflection/reflection.engine/2026-07-04.jsonl
M guardian/server.js
A ui/tv-shell/components/guardian.js
A ui/tv-shell/components/system-component.js
M ui/tv-shell/index.html
A ui/tv-shell/warp-ui/nexus-shell.js
A ui/tv-shell/warp-ui/warp-browser.js
```

### Build 0.9.10-r4 — snap-0246 — 2026-07-05 12:52:54

- Archive: `nexus-0246_2026-07-05_v0.9.10-r4_full-patched-1.zip` (was `nexus-full-patched-1.zip`)
- SHA-256: `bb1837f169ef9f8566b20928cc5bb10abd0834a791da2fbd31cb57de7d1190c2`, 1.1 MB, downloaded 2026-07-05 12:58:53
- Kind: overlay (a patch laid over the build before it)
- Commit: `96564e8401af98c24a2d1de18772dfaef100bd17`, tag `snap-0246`
- Identical copy: `nexus-0246_2026-07-05_v0.9.10-r4_full-patched_dup1.zip` (was `nexus-full-patched.zip`)
- Files in archive: 75. Changes against the build before it: **3 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 3 | 2 | 0 |
| warp | 0 | 1 | 0 |

```
A guardian/ncp/dispatch-pipeline.js
A guardian/ncp/server.js
M guardian/registry-components.js
M guardian/ui/agents/chatgpt/index.html
A guardian/ui/agents/chatgpt/index.yml
M warp/dispatch/index.js
```

### Build 0.9.10-r5 — snap-0247 — 2026-07-05 13:40:00

- Archive: `nexus-0247_2026-07-05_v0.9.10-r5_restore-1.zip` (was `nexus-restore-1.zip`)
- SHA-256: `9b08a9f7f258c17382f3f292f214e3d1cd1fd5bef7d100e07856fbfe21da4e4c`, 0.2 MB, downloaded 2026-07-05 13:44:03
- Kind: overlay (a patch laid over the build before it)
- Commit: `703a7bae8a1e81c084766b627cec0a1fd77dcb72`, tag `snap-0247`
- Files in archive: 57. Changes against the build before it: **1 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 3 | 0 |
| idearium | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cortex/boot.js
M guardian/registry-components.js
M guardian/server.js
A guardian/server.ncp-rebuild.bak.js
M guardian/userscript-perplexity.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M ui/cortex/index.html
```

### Build 0.9.10-r6 — snap-0248 — 2026-07-05 14:27:06

- Archive: `nexus-0248_2026-07-05_v0.9.10-r6_restore-5.zip` (was `nexus-restore-5.zip`)
- SHA-256: `14e54899fb9e06d095545c9e2b95ab13913e239e1a5cd0f8c520db692f21e24e`, 0.2 MB, downloaded 2026-07-05 14:45:40
- Kind: overlay (a patch laid over the build before it)
- Commit: `fdb7a442e01d7bd5ada46c9e78be956876b982a8`, tag `snap-0248`
- Files in archive: 60. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 1 | 1 | 0 |
| meta | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
M cortex/boot.js
M meta/cfr/ledger.js
M ui/cortex/index.html
A ui/cortex/index.three.bak.html
```

### Build 0.9.10-r7 — snap-0249 — 2026-07-06 18:06:06

- Archive: `nexus-0249_2026-07-06_v0.9.10-r7_changed-files.zip` (was `nexus-changed-files.zip`)
- SHA-256: `c42ffa28175a84a35f553f5006b5504af48d9785a07f402645e1da305e6b1a73`, 0.4 MB, downloaded 2026-07-06 18:36:45
- Kind: overlay (a patch laid over the build before it)
- Commit: `2bb9d79953d87c4ddf2dbe3bac8090b5a46ad0ce`, tag `snap-0249`
- Files in archive: 40. Changes against the build before it: **18 added, 21 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 9 | 1 | 0 |
| guardian | 1 | 4 | 0 |
| cortex | 2 | 2 | 0 |
| ui | 1 | 3 | 0 |
| (root) | 0 | 3 | 0 |
| idearium | 1 | 1 | 0 |
| loom | 1 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| cos | 1 | 0 | 0 |
| docs | 1 | 0 | 0 |
| meta | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |
| service | 0 | 1 | 0 |
| warp | 0 | 1 | 0 |

```
M MANIFEST.md
M bridge/ledger.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/index.js
A cortex/core/raid/routing-ir.js
A cortex/push-recall.js
A cos/playground/llm-lab.js
A docs/NEXUS-STATE-SPEC-2026-07-06.md
A guardian/artifact-upload.js
M guardian/lib/gap-hunter.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M idearium/api/index.js
A idearium/spec-engine/chunk-dispatch.js
A lib/agent-tools/index.js
A lib/seam/adapters/cortex-persist.js
A lib/seam/adapters/warp-cascade.js
A lib/seam/axioms.js
A lib/seam/build-contract.js
A lib/seam/chunk-lifecycle.js
A lib/seam/gates.js
M lib/seam/index.js
A lib/seam/kg-seam-bridge.js
A lib/seam/stream.js
M loom/server.js
A loom/ui/index.html
M meta/cfr/graph.js
M nexus-heal-loop.js
M ollama/server.js
M orchestrator.js
A scripts/verify-wires.js
M service/nexus-diagnostic.js
M ui/agents/mistral/index.html
A ui/architect-minimal/index.html
M ui/tv-shell/index.html
M ui/tv-shell/spotlight/spotlight.js
M warp/core/Stream.js
```

### Build 0.9.10-r8 — snap-0250 — 2026-07-06 22:15:02

- Archive: `nexus-0250_2026-07-06_v0.9.10-r8_changed-files-1.zip` (was `nexus-changed-files (1).zip`)
- SHA-256: `bcc228bc4b3e516f73e12a539aa9cca3d86b89778fcaea0d99aaf3baa454098f`, 0.4 MB, downloaded 2026-07-06 22:27:18
- Kind: overlay (a patch laid over the build before it)
- Commit: `96617d3506a2fe875791b4a17932b0cc04ca71ca`, tag `snap-0250`
- Files in archive: 45. Changes against the build before it: **2 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 2 | 0 |
| docs | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M copilot/lifeline.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M docs/forge.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/read-file.js
A lib/rfr2-bridge.js
M lib/version.js
M ollama/server.js
```

### Build 0.9.10-r9 — snap-0251 — 2026-07-06 23:15:22

- Archive: `nexus-0251_2026-07-06_v0.9.10-r9_session-changes.zip` (was `nexus-session-changes.zip`)
- SHA-256: `0f4497cee37a86c7fe63c9094dfefde2e417fd9bfd6eca767f239a6ef6875166`, 0.1 MB, downloaded 2026-07-06 23:17:19
- Kind: overlay (a patch laid over the build before it)
- Commit: `5b4dfa12a91a98280570e9e97bbab9ebe631eb78`, tag `snap-0251`
- Identical copy: `nexus-0251_2026-07-06_v0.9.10-r9_session-changes-1_dup1.zip` (was `nexus-session-changes-1.zip`)
- Files in archive: 6. Changes against the build before it: **2 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |

```
M MANIFEST.md
M bridge/server.js
A docs/NEXUS-VISION-SPEC-2026-07-06.md
M guardian/server.js
A lib/autonomous-loop.js
M ollama/server.js
```

### Build 0.9.10-r10 — snap-0252 — 2026-07-07 15:32:38

- Archive: `nexus-0252_2026-07-07_v0.9.10-r10_changed-files-1.zip` (was `nexus-changed-files-1.zip`)
- SHA-256: `1458b66ca1d0b208ade8bb89ff0cb910babc3cf38f60a3774d66343f496ff332`, 0.4 MB, downloaded 2026-07-07 16:26:52
- Kind: overlay (a patch laid over the build before it)
- Commit: `116babbb3860d6071c623adfd54fb77b14a6a0f4`, tag `snap-0252`
- Files in archive: 48. Changes against the build before it: **3 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 1 | 1 | 0 |
| docs | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cortex | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M MANIFEST.md
M copilot/server.js
A copilot/stream-digest.js
A cortex/personas.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M docs/forge.spec
M guardian/server.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/run-cockpit-command.js
M ollama/server.js
```

### Build 0.9.10-r11 — snap-0253 — 2026-07-09 10:28:54

- Archive: `nexus-0253_2026-07-09_v0.9.10-r11_changed-files-2.zip` (was `nexus-changed-files-2.zip`)
- SHA-256: `6b28be68ce3eef0f5911d5988f26c388e01e7025d2119c8d45ea27dd8aebf300`, 0.4 MB, downloaded 2026-07-09 10:29:14
- Kind: overlay (a patch laid over the build before it)
- Commit: `b5753563e80c7ae26ab369fdfd4a9ee5ea69694b`, tag `snap-0253`
- Files in archive: 49. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
A copilot/intents.js
M copilot/server.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
```

### Build 0.9.10-r12 — snap-0254 — 2026-07-09 10:36:18

- Archive: `nexus-0254_2026-07-09_v0.9.10-r12_changed-files-3.zip` (was `nexus-changed-files-3.zip`)
- SHA-256: `9461f5bd3f4030cbad4e086f19f1794f88454344e82dfe6f860081ffbe0d49fc`, 0.4 MB, downloaded 2026-07-09 10:41:01
- Kind: overlay (a patch laid over the build before it)
- Commit: `cedb8187d12bc69aea3820ae05b5c7975cf5fa3f`, tag `snap-0254`
- Files in archive: 50. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M docs/NEXUS-STATE-SPEC-2026-07-06.md
A guardian/ask.js
M guardian/server.js
```

### Build 0.9.10-r13 — snap-0255 — 2026-07-09 10:51:22

- Archive: `nexus-0255_2026-07-09_v0.9.10-r13_changed-files-4.zip` (was `nexus-changed-files-4.zip`)
- SHA-256: `7dc92fd75e43466a98d9af6bd69d788c02917867436e55c1784c4f2abffb42d7`, 0.4 MB, downloaded 2026-07-09 11:09:00
- Kind: overlay (a patch laid over the build before it)
- Commit: `e2d4c779c098c34dfacb6f58d15790f36b797a44`, tag `snap-0255`
- Files in archive: 56. Changes against the build before it: **2 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| hooks | 0 | 4 | 0 |
| scripts | 2 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M hooks/cortex.hooks.js
M hooks/guardian.hooks.js
M hooks/ollama.hooks.js
M hooks/orchestrator.hooks.js
A scripts/_register-session-hooks.js
A scripts/verify-boot.js
M scripts/verify-wires.js
```

### Build 0.9.10-r14 — snap-0256 — 2026-07-09 17:07:02

- Archive: `nexus-0256_2026-07-09_v0.9.10-r14_changed-files-5.zip` (was `nexus-changed-files-5.zip`)
- SHA-256: `aa3a8cab7e0d954af9b408bd59954704f97fee187749b39878065383b7adda80`, 0.6 MB, downloaded 2026-07-09 17:24:31
- Kind: overlay (a patch laid over the build before it)
- Commit: `7b9a647e1cf23f1eb11c70464c099a94c6654410`, tag `snap-0256`
- Identical copy: `nexus-0256_2026-07-09_v0.9.10-r14_changed-files-6_dup1.zip` (was `nexus-changed-files-6.zip`)
- Files in archive: 82. Changes against the build before it: **16 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 8 | 1 | 0 |
| (root) | 2 | 3 | 0 |
| clear-glass | 1 | 4 | 0 |
| copilot | 1 | 3 | 0 |
| docs | 2 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| hooks | 0 | 2 | 0 |
| tests | 2 | 0 | 0 |
| cortex | 0 | 1 | 0 |
| meta | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A ask.js
M autopilot.js
M clear-glass/renderer/browser.html
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
A clear-glass/src/preload/webview-bridge.js
M copilot/adversarial.js
A copilot/lib/expectation-watcher.js
M copilot/lifeline.js
M copilot/server.js
M cortex/boot.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
A docs/RFR2-KERNEL-CONTRACT.md
A docs/nexus-system-foundation-addendum-v1.2.0.spec
M docs/nexus-system-foundation.spec
M guardian/ask.js
M guardian/server.js
M hooks/cortex.hooks.js
M hooks/orchestrator.hooks.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/diagnose.js
A lib/agent-tools/tools/move-data.js
A lib/build-pipeline.js
A lib/consent.js
A lib/execution-pipeline.js
A lib/gap-relay.js
A lib/nexus-client.js
A lib/warp-bus.js
M meta/cfr/sigma.js
A nexus-client.js
M orchestrator.config.json
M orchestrator.js
M orchestrator/lib/sigma-writer.js
A tests/helpers/clear-glass-ncp-provider.js
A tests/modules/lifeline-fluid-routing.test.js
```

### Build 0.9.10-r15 — snap-0257 — 2026-07-10 10:01:56

- Archive: `nexus-0257_2026-07-10_v0.9.10-r15_v9-cli-unified.zip` (was `nexus-v9-cli-unified.zip`)
- SHA-256: `044b076167eaa5854139c149ef1655a564f30ffec1ac67145b790cfaa3c1c765`, 5.8 MB, downloaded 2026-07-10 10:08:50
- Kind: full
- Commit: `0575738aaa798a7c2b62047ce3a637338ad981bd`, tag `snap-0257`
- Files in archive: 1181. Changes against the build before it: **134 added, 34 modified, 11 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 47 | 2 | 2 |
| tests | 24 | 1 | 0 |
| docs | 17 | 1 | 0 |
| ui | 13 | 2 | 1 |
| guardian | 1 | 7 | 6 |
| cortex | 6 | 2 | 0 |
| lib | 4 | 3 | 0 |
| idearium | 4 | 1 | 0 |
| copilot | 1 | 3 | 0 |
| emerge | 2 | 1 | 1 |
| meta | 1 | 2 | 0 |
| loom | 0 | 2 | 1 |
| (root) | 2 | 1 | 0 |
| bridge | 1 | 2 | 0 |
| cockpit | 1 | 1 | 0 |
| cli | 1 | 1 | 0 |
| architect | 1 | 1 | 0 |
| orchestrator | 1 | 1 | 0 |
| scripts | 2 | 0 | 0 |
| clear-glass | 1 | 0 | 0 |
| ollama | 1 | 0 | 0 |
| siso | 1 | 0 | 0 |
| erosmancer | 1 | 0 | 0 |
| eravos | 1 | 0 | 0 |

```
M MANIFEST.md
A SESSION-MANIFEST-2026-07-07.md
A architect/spec/architect.spec
M bridge/router.js
M bridge/server.js
A bridge/spec/bridge.spec
A clear-glass/ncp-client.js
M cli/nexus-cli.js
A cli/spec/cli.spec
M cockpit/cli.js
A cockpit/live.js
M copilot/lib/expectation-watcher.js
M copilot/lifeline.js
M copilot/server.js
A copilot/spec/copilot.spec
M cortex/boot.js
M cortex/core/raid/index.js
A cortex/core/raid/snr-filter.js
A cortex/core/raid/tunables.js
A cortex/intelligence/adversarial.js
A cortex/intelligence/intuition.js
A cortex/intelligence/mastermind.js
A cortex/spec/cortex.spec
A docs/AXIOMS-v3.1.md
A docs/CHANGELOG-SESSION-2026-07-08.md
A docs/IDEARIUM-PHASE-MAP.md
A docs/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md
A docs/NEXUS-COPILOT-ROADMAP-2026-07-10.md
A docs/NEXUS-ENCYCLOPEDIA.md
A docs/NEXUS-EXPANSION-MAP-2026-07-06.md
M docs/NEXUS-PHASE-MAP.md
A docs/NEXUS-PIPELINE-SPEC-2026-07-07.md
A docs/NEXUS-PLAIN-ENGLISH.md
A docs/NEXUS-REMAINING-WORK-2026-07-09.md
A docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
A docs/SESSION-MANIFEST-2026-07-07.md
A docs/genesis.spec
A docs/idearium-templates.spec
A docs/nexus-selfdiag-registry-interface.spec
A docs/nexus_complete_phase_map_v5.html
A docs/warp-devkit-addendum-v1.4.1.spec
M emerge/compiler/t2-gate.js
D emerge/runtime.spec
A emerge/spec/emerge.spec
A eravos/spec/eravos.spec
A erosmancer/spec/erosmancer.spec
D guardian/lab/lab.js
D guardian/memory.js
M guardian/memory_store/artifacts.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
D guardian/ncp/dispatch-pipeline.js
D guardian/ncp/server.js
D guardian/server.ncp-rebuild.bak.js
A guardian/spec/guardian.spec
M guardian/ui/agents/chatgpt/index.html
D guardian/ui/agents/chatgpt/index.yml
M guardian/userscript-perplexity.js
M idearium/agent-suite/index.js
A idearium/spec-engine/templates.js
A idearium/spec-engine/templates/genesis.spec
A idearium/spec-engine/warp-build-dispatch.js
A idearium/spec/idearium.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/query-intelligence.js
A lib/agent-tools/tools/run-closed-loop.js
A lib/agent-tools/tools/run-command.js
A lib/agent-tools/tools/run-pipeline.js
M lib/execution-pipeline.js
M lib/version.js
M loom/schema/registry.js
M loom/server.js
M meta/cfr/graph.js
M meta/cfr/ledger.js
A meta/spatial/system-lattice.js
A ollama/spec/ollama.spec
M orchestrator/lib/spec-drift.js
A orchestrator/spec/orchestrator.spec
A scripts/analyze-methodless-routes.js
A scripts/generate-hooks.js
A siso/spec/siso.spec
A tests/modules/adversarial.test.js
A tests/modules/bridge-response-survival.test.js
A tests/modules/cfr-graph-component-distance.test.js
A tests/modules/cli-copilot-fallback.test.js
A tests/modules/closed-loop-tool.test.js
A tests/modules/copilot-adversarial-consolidation.test.js
A tests/modules/copilot-adversarial-wire.test.js
A tests/modules/copilot-confidence.test.js
A tests/modules/cortex-sse-broadcast.test.js
A tests/modules/diagnose-move-data-tools.test.js
A tests/modules/expectation-watcher.test.js
A tests/modules/idearium-warp-dispatch.test.mjs
A tests/modules/intuition-upgrade.test.js
A tests/modules/loom-context-intent.test.js
A tests/modules/mastermind-fractals.test.js
A tests/modules/mastermind-upgrade.test.js
A tests/modules/raid-fitness-real-terms.test.js
A tests/modules/raid-tunables.test.js
M tests/modules/run-all.js
A tests/modules/run-command-tool.test.js
A tests/modules/run-pipeline-tool.test.js
A tests/modules/system-lattice.test.js
A tests/modules/tutorial-engine.test.js
A tests/modules/ui-self-diagnosis.test.js
A tests/modules/warp-compounding.test.js
A ui/channels/build/build.css
A ui/channels/build/build.html
A ui/channels/build/build.js
A ui/consent/consent-gate.css
A ui/consent/consent-gate.html
A ui/consent/consent-gate.js
M ui/cortex/index.html
D ui/cortex/index.three.bak.html
A ui/home/nexus-home.html
A ui/home/shell.css
A ui/home/shell.js
A ui/toast/toast.css
A ui/toast/toast.js
M ui/tv-shell/index.html
A ui/tv-shell/tutorial/tutorial.css
A ui/tv-shell/tutorial/tutorial.js
```

56 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.9.10-r16 — snap-0258 — 2026-07-10 10:11:16

- Archive: `nexus-0258_2026-07-10_v0.9.10-r16_merged-1.zip` (was `nexus-merged (1).zip`)
- SHA-256: `ef14777d43274736d58e546b02270842840678100a9c87878f18cb020e0996c5`, 5.8 MB, downloaded 2026-07-10 12:33:46
- Kind: full
- Commit: `ee7381a36367e1e335e167ecfd4370355f4fc619`, tag `snap-0258`
- Files in archive: 1194. Changes against the build before it: **22 added, 26 modified, 9 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 20 | 4 | 0 |
| hooks | 0 | 8 | 0 |
| cortex | 0 | 1 | 6 |
| guardian | 0 | 5 | 0 |
| (root) | 0 | 1 | 3 |
| docs | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| tests | 2 | 0 | 0 |
| architect | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| warp | 0 | 1 | 0 |

```
D CONSOLIDATION-NOTES.md
M architect/data/event_log.jsonl
D cortex/boot.js
M cortex/data/baseline-events.ndjson
D cortex/interaction-contract.json
D cortex/personas.js
D cortex/push-recall.js
D cortex/registry-components.js
D cortex/spec/cortex.spec
M docs/IDEARIUM-PHASE-MAP.md
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M guardian/memory_store/artifacts.json
M guardian/memory_store/chat_log.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/jobs.json
M guardian/memory_store/settings.json
M hooks/architect.hooks.js
M hooks/bridge.hooks.js
M hooks/copilot.hooks.js
M hooks/cortex.hooks.js
M hooks/emerge.hooks.js
M hooks/guardian.hooks.js
M hooks/ollama.hooks.js
M hooks/orchestrator.hooks.js
M idearium/api/index.js
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e/00-meta-8ec12ac3.md
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e/manifest.json
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2/00-meta-b8a9e4be.md
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2/manifest.json
A idearium/data/specs/4c2446c8-7af5-45d0-a6ff-7f99f539841b/manifest.json
A idearium/data/specs/6188a8b9-0dc8-4620-b925-f254b8459a12/manifest.json
A idearium/data/specs/75e93340-44b8-409b-b50c-828d9b837da2/00-meta-21c3da4f.md
A idearium/data/specs/75e93340-44b8-409b-b50c-828d9b837da2/manifest.json
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987/00-meta-f66c14ad.md
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987/manifest.json
A idearium/data/specs/c122fb46-fbd5-471b-91ca-02037817e492/00-meta-9e95ac88.md
A idearium/data/specs/c122fb46-fbd5-471b-91ca-02037817e492/manifest.json
A idearium/data/specs/e5a2c962-4df0-4d49-a648-be6ce71f4e34/00-meta-c0e192ed.md
A idearium/data/specs/e5a2c962-4df0-4d49-a648-be6ce71f4e34/manifest.json
A idearium/data/specs/f1022570-2d6c-4cc0-bc3c-683dce661ab3/00-meta-9914c302.md
A idearium/data/specs/f1022570-2d6c-4cc0-bc3c-683dce661ab3/manifest.json
A idearium/data/warp-crystals.json
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec-engine/warp-build-dispatch.js
M lib/seam/adapters/warp-cascade.js
M lib/system-manifest.js
M orchestrator.js
D phase_map_11.html
D registry-components.cortex.js
M scripts/verify-wires.js
A tests/modules/idearium-loop.test.js
A tests/modules/idearium-warp-cache.test.mjs
M warp/dispatch/index.js
```

### Build 0.9.10-r17 — snap-0259 — 2026-07-10 12:50:18

- Archive: `nexus-0259_2026-07-10_v0.9.10-r17_full.zip` (was `nexus-full.zip`)
- SHA-256: `fa74df4fe93fa1e1bc01f2aa457d1c8e6f27b56943e1b5cb29546a337233bfe9`, 5.6 MB, downloaded 2026-07-10 12:55:53
- Kind: full
- Commit: `ca0aaf243a5f98744f1052ac5e4667d168b167d2`, tag `snap-0259`
- Identical copy: `nexus-0259_2026-07-10_v0.9.10-r17_full-1_dup1.zip` (was `nexus-full-1.zip`)
- Files in archive: 1145. Changes against the build before it: **26 added, 28 modified, 75 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 53 |
| idearium | 13 | 2 | 0 |
| docs | 1 | 2 | 8 |
| ui | 0 | 2 | 9 |
| (root) | 3 | 2 | 2 |
| cortex | 6 | 0 | 0 |
| lib | 2 | 3 | 1 |
| tests | 1 | 4 | 1 |
| copilot | 0 | 4 | 0 |
| emerge | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| orchestrator | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| clear-glass | 0 | 0 | 1 |
| hooks | 0 | 1 | 0 |
| meta | 0 | 1 | 0 |

```
A CONSOLIDATION-NOTES.md
D ask.js
M autopilot.js
M bridge/router.js
D clear-glass/ncp-client.js
M copilot/intents.js
M copilot/lib/expectation-watcher.js
M copilot/lifeline.js
M copilot/server.js
A cortex/boot.js
A cortex/interaction-contract.json
A cortex/personas.js
A cortex/push-recall.js
A cortex/registry-components.js
A cortex/spec/cortex.spec
D data/architect/event_log.jsonl
D data/copilot/chat_log.buffer.jsonl
D data/copilot/conditioning_log.buffer.jsonl
D data/cortex/failures.jsonl
D data/cortex/memory/component_ledger.json
D data/cortex/memory/crystals.json
D data/cortex/memory/event_log.json
D data/cortex/memory/settings.json
D data/guardian/ledger/boot/events.ndjson
D data/knowledge/facts.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-07-06.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-07-07.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-07-10.jsonl
D data/ledger/cortex/lib.cfr-sigma/2026-07-06.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-07-06.jsonl
D data/ledger/forge/forge.old/2026-07-07.jsonl
D data/ledger/forge/forge.old/2026-07-10.jsonl
D data/ledger/forge/forge.patch/2026-07-06.jsonl
D data/ledger/forge/forge.patch/2026-07-07.jsonl
D data/ledger/forge/forge.patch/2026-07-10.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-07-06.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-07-07.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-07-10.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-07-06.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-07-07.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-07-10.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-07-06.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-07-07.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-07-10.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-07-06.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-07-07.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-07-10.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-07-06.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-07-07.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-07-10.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-07-01.jsonl
D data/ledger/reflection/reflection.engine/2026-07-02.jsonl
D data/ledger/reflection/reflection.engine/2026-07-04.jsonl
D data/ledger/reflection/reflection.engine/2026-07-06.jsonl
D data/ledger/reflection/reflection.engine/2026-07-07.jsonl
D data/ledger/reflection/reflection.engine/2026-07-10.jsonl
D data/ledger/test/test.echo.ping/2026-07-06.jsonl
D data/ledger/test/test.echo.ping/2026-07-07.jsonl
D data/ledger/test/test.echo.ping/2026-07-10.jsonl
D data/ledger/test/test.event.check/2026-07-06.jsonl
D data/ledger/test/test.event.check/2026-07-07.jsonl
D data/ledger/test/test.event.check/2026-07-10.jsonl
D data/ledger/test/test.widget.panel/2026-07-06.jsonl
D data/ledger/test/test.widget.panel/2026-07-07.jsonl
D data/ledger/test/test.widget.panel/2026-07-10.jsonl
D data/loom/loom_events.buffer.jsonl
D docs/CHANGELOG-SESSION-2026-07-08.md
D docs/NEXUS-ENCYCLOPEDIA.md
M docs/NEXUS-EXPANSION-MAP-2026-07-06.md
D docs/NEXUS-PLAIN-ENGLISH.md
M docs/NEXUS-STATE-SPEC-2026-07-06.md
D docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
D docs/SESSION-MANIFEST-2026-07-07.md
D docs/genesis.spec
A docs/nexus-copilot-recall.spec
D docs/nexus-selfdiag-registry-interface.spec
D docs/nexus_complete_phase_map_v5.html
M emerge/compiler/t2-gate.js
M emerge/spec/emerge.spec
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/settings.json
M hooks/orchestrator.hooks.js
M idearium/api/index.js
A idearium/data/idearium-repos.json
A idearium/data/specs/42bfd342-5966-49ee-8f4c-04c941563b4c/00-meta-2d349c01.md
A idearium/data/specs/42bfd342-5966-49ee-8f4c-04c941563b4c/manifest.json
A idearium/data/specs/627d7298-943a-48a0-b448-ac58ad7ba374/00-meta-1e62094d.md
A idearium/data/specs/627d7298-943a-48a0-b448-ac58ad7ba374/manifest.json
A idearium/data/specs/88e6e2d0-e2c7-4502-89b3-23d6f7daa7f3/00-meta-2eb3e285.md
A idearium/data/specs/88e6e2d0-e2c7-4502-89b3-23d6f7daa7f3/manifest.json
A idearium/data/specs/a47a93ea-c352-4dca-a792-7173c246e31c/00-meta-ec7f5bc6.md
A idearium/data/specs/a47a93ea-c352-4dca-a792-7173c246e31c/manifest.json
A idearium/data/specs/cd73e577-7cde-485a-a0ec-c69867ce2ff4/00-meta-59fe09da.md
A idearium/data/specs/cd73e577-7cde-485a-a0ec-c69867ce2ff4/manifest.json
A idearium/data/specs/f8063de1-4e8c-46c0-8503-27e41882a1c3/00-meta-39008a23.md
A idearium/data/specs/f8063de1-4e8c-46c0-8503-27e41882a1c3/manifest.json
M idearium/spec/idearium.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/query-recall.js
D lib/agent-tools/tools/run-cockpit-command.js
M lib/execution-pipeline.js
A lib/resource-monitor.js
M lib/version.js
M meta/cfr/graph.js
D nexus-client.js
M orchestrator.js
M orchestrator/lib/spec-drift.js
M orchestrator/spec/orchestrator.spec
A phase_map_11.html
A registry-components.cortex.js
D tests/modules/idearium-warp-dispatch.test.mjs
M tests/modules/run-all.js
M tests/modules/run-pipeline-tool.test.js
A tests/modules/spec-promote.test.mjs
M tests/modules/ui-self-diagnosis.test.js
M tests/modules/warp-compounding.test.js
D ui/channels/build/build.css
D ui/channels/build/build.html
D ui/consent/consent-gate.css
D ui/consent/consent-gate.html
D ui/home/nexus-home.html
D ui/home/shell.css
D ui/idearium/index.html
D ui/toast/toast.css
M ui/tv-shell/index.html
D ui/tv-shell/tutorial/tutorial.css
M ui/tv-shell/tutorial/tutorial.js
```

### Build 0.9.10-r18 — snap-0260 — 2026-07-10 13:22:44

- Archive: `nexus-0260_2026-07-10_v0.9.10-r18_full-2.zip` (was `nexus-full-2.zip`)
- SHA-256: `e60db5cff516f649d2d9a451427a7a21c1b4e25345a74ada5cd825ba00cd34d1`, 5.6 MB, downloaded 2026-07-10 13:33:08
- Kind: full
- Commit: `7aca7081c7bbea8599618f357261ebfd16dd7fc2`, tag `snap-0260`
- Files in archive: 1152. Changes against the build before it: **7 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 6 | 4 | 0 |
| docs | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M idearium/api/index.js
M idearium/data/idearium-repos.json
A idearium/data/specs/151c0bf6-cbdc-42da-a72d-27ac95150c61/00-meta-9612ddd0.md
A idearium/data/specs/151c0bf6-cbdc-42da-a72d-27ac95150c61/manifest.json
A idearium/data/specs/3c5927e2-dc0f-4493-8944-9fdb63e6df37/00-meta-88612ace.md
A idearium/data/specs/3c5927e2-dc0f-4493-8944-9fdb63e6df37/manifest.json
A idearium/data/specs/7d418fea-0806-49d6-9932-e0726b90372a/00-meta-59aa718f.md
A idearium/data/specs/7d418fea-0806-49d6-9932-e0726b90372a/manifest.json
M idearium/data/warp-crystals.json
M idearium/spec-engine/index.js
A tests/modules/spec-list-merge.test.mjs
```

### Build 0.9.10-r19 — snap-0261 — 2026-07-10 18:20:36

- Archive: `nexus-0261_2026-07-10_v0.9.10-r19_full-4.zip` (was `nexus-full-4.zip`)
- SHA-256: `a63d64e479e3e36e0dac27694740f704ea6a6766da1153583d4c6526fe9fc36d`, 5.8 MB, downloaded 2026-07-10 18:21:29
- Kind: full
- Commit: `0cdbe1a1dce0a35662a4e19c5a489e89c02e0d18`, tag `snap-0261`
- Identical copy: `nexus-0261_2026-07-10_v0.9.10-r19_full-5_dup1.zip` (was `nexus-full-5.zip`)
- Files in archive: 1234. Changes against the build before it: **82 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 78 | 6 | 0 |
| tests | 2 | 0 | 0 |
| (root) | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |

```
A CONFIRM-BUILD.md
M copilot/lifeline.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M idearium/api/index.js
M idearium/data/idearium-repos.json
A idearium/data/specs/07375701-606c-4068-bbf3-c15ae7c85517/01-purpose-d8863b55.md
A idearium/data/specs/07375701-606c-4068-bbf3-c15ae7c85517/manifest.json
A idearium/data/specs/0c8d4ec8-cee8-4f17-b395-82f4afee9dec/01-purpose-05af73a9.md
A idearium/data/specs/0c8d4ec8-cee8-4f17-b395-82f4afee9dec/manifest.json
A idearium/data/specs/0cfc8eb6-998a-4e3e-8414-fe00916f8c6c/manifest.json
A idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/00-meta-bd845f20.md
A idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/manifest.json
A idearium/data/specs/10d106a2-04a8-4f13-b921-a1bc6bf43261/00-meta-9bb0f348.md
A idearium/data/specs/10d106a2-04a8-4f13-b921-a1bc6bf43261/manifest.json
A idearium/data/specs/1abb0086-6749-4f39-99dd-e0affac4013b/00-meta-9f67596d.md
A idearium/data/specs/1abb0086-6749-4f39-99dd-e0affac4013b/manifest.json
A idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/00-meta-09ce84b2.md
A idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/manifest.json
A idearium/data/specs/2bc28359-b215-4aa6-b48a-6d4820aa7e27/00-meta-6c237526.md
A idearium/data/specs/2bc28359-b215-4aa6-b48a-6d4820aa7e27/manifest.json
A idearium/data/specs/32e29b24-c700-4ff1-9a53-6f25c52a9e06/00-meta-67f44be5.md
A idearium/data/specs/32e29b24-c700-4ff1-9a53-6f25c52a9e06/manifest.json
A idearium/data/specs/354d4f1f-371b-4df6-93be-93fe85f95789/manifest.json
A idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/00-meta-fad4ad58.md
A idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/manifest.json
A idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/00-meta-ee3d180f.md
A idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/manifest.json
A idearium/data/specs/3b4d575d-2ed4-420e-b9a8-1de5abf4f6a6/manifest.json
A idearium/data/specs/3fce65f8-1f14-4a91-b1d0-b09480ac297f/manifest.json
A idearium/data/specs/49da0341-ce7f-47c7-b824-5205bffd8cec/00-meta-0d306f0b.md
A idearium/data/specs/49da0341-ce7f-47c7-b824-5205bffd8cec/manifest.json
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/00-meta-5559b817.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/01-purpose-1befa449.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/04-api-6d88466c.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/09-tests-fba83fb3.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/manifest.json
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/00-meta-e4d772ed.md
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/01-purpose-09eb973f.md
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/manifest.json
A idearium/data/specs/6562f9d9-298d-4abe-9f9d-9e8b856843d7/00-meta-f0e41d92.md
A idearium/data/specs/6562f9d9-298d-4abe-9f9d-9e8b856843d7/manifest.json
A idearium/data/specs/683d2b38-618a-4b93-ba43-5ccc2580cb8a/manifest.json
A idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/00-meta-75e452eb.md
A idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/manifest.json
A idearium/data/specs/754a6e7a-3260-4c80-ada6-31c95d5b3d4e/manifest.json
A idearium/data/specs/8bb55aa8-2a01-4259-820a-28c89799cb27/manifest.json
A idearium/data/specs/9c0ea60c-3598-4dbf-9f1f-d7ee98117c89/00-meta-86e3ea35.md
A idearium/data/specs/9c0ea60c-3598-4dbf-9f1f-d7ee98117c89/manifest.json
A idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/00-meta-658c9324.md
A idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/manifest.json
A idearium/data/specs/b77514e8-cfe3-4c01-895d-fb97c7630a0d/00-meta-33f7beed.md
A idearium/data/specs/b77514e8-cfe3-4c01-895d-fb97c7630a0d/manifest.json
A idearium/data/specs/b9aeada9-9480-4fdd-b9a4-76ee8f4fbe13/00-meta-3243d45b.md
A idearium/data/specs/b9aeada9-9480-4fdd-b9a4-76ee8f4fbe13/manifest.json
A idearium/data/specs/bb6a194c-04c0-426c-8b75-65b5ca05f65f/manifest.json
A idearium/data/specs/c0a4c901-0795-49af-a98f-d000b398256d/00-meta-64fc6017.md
A idearium/data/specs/c0a4c901-0795-49af-a98f-d000b398256d/manifest.json
A idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/01-purpose-4b42f68e.md
A idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/manifest.json
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/00-meta-08a89a88.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/01-purpose-e3d0223c.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/04-api-bc4ec168.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/09-tests-597ba210.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/manifest.json
A idearium/data/specs/d547a5ee-1ef3-430b-b72b-9a538bce0057/manifest.json
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/00-meta-12f28cd3.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/01-purpose-f82321c7.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/03-schema-fd776ee8.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/04-api-6b43b3c4.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/05-events-932e145e.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/06-integration-b3fd3c58.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/09-tests-15a731df.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/manifest.json
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/00-meta-24ed1eff.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/01-purpose-3908a591.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/03-schema-ce10cfc7.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/04-api-38839a70.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/05-events-5d073f32.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/06-integration-7b1da156.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/09-tests-6966fc82.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/manifest.json
A idearium/data/specs/fabb0773-c2d0-4285-9eac-84d263928c4d/manifest.json
M idearium/data/warp-crystals.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/ui/index.html
A idearium/ui/js/app.js
A scripts/confirm-build.mjs
A tests/modules/idearium-reuse.test.mjs
A tests/modules/spec-import.test.mjs
```

### Build 0.9.10-r20 — snap-0262 — 2026-07-10 20:45:32

- Archive: `nexus-0262_2026-07-10_v0.9.10-r20_full-3.zip` (was `nexus-full-3.zip`)
- SHA-256: `d52ba87bcc8a8172b7dc5b9740bd90ea6286c2dfa2c6f6376041b3d8d6617f12`, 11.5 MB, downloaded 2026-07-11 00:37:43
- Kind: full
- Commit: `6929034f642947f31ca25ab1733cf9e3a87009fc`, tag `snap-0262`
- Files in archive: 1185. Changes against the build before it: **1 added, 7 modified, 50 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 5 | 47 |
| (root) | 1 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| scripts | 0 | 0 | 1 |
| tests | 0 | 0 | 1 |

```
D CONFIRM-BUILD.md
M copilot/lifeline.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
M idearium/api/index.js
M idearium/data/idearium-repos.json
D idearium/data/specs/0cfc8eb6-998a-4e3e-8414-fe00916f8c6c/manifest.json
D idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/00-meta-bd845f20.md
D idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/manifest.json
D idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/00-meta-09ce84b2.md
D idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/manifest.json
D idearium/data/specs/354d4f1f-371b-4df6-93be-93fe85f95789/manifest.json
D idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/00-meta-fad4ad58.md
D idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/manifest.json
D idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/00-meta-ee3d180f.md
D idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/manifest.json
D idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/00-meta-5559b817.md
D idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/01-purpose-1befa449.md
D idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/04-api-6d88466c.md
D idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/09-tests-fba83fb3.md
D idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/manifest.json
D idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/00-meta-e4d772ed.md
D idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/01-purpose-09eb973f.md
D idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/manifest.json
D idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/00-meta-75e452eb.md
D idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/manifest.json
D idearium/data/specs/8bb55aa8-2a01-4259-820a-28c89799cb27/manifest.json
D idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/00-meta-658c9324.md
D idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/manifest.json
D idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/01-purpose-4b42f68e.md
D idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/manifest.json
D idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/00-meta-08a89a88.md
D idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/01-purpose-e3d0223c.md
D idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/04-api-bc4ec168.md
D idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/09-tests-597ba210.md
D idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/manifest.json
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/00-meta-12f28cd3.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/01-purpose-f82321c7.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/03-schema-fd776ee8.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/04-api-6b43b3c4.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/05-events-932e145e.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/06-integration-b3fd3c58.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/09-tests-15a731df.md
D idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/manifest.json
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/00-meta-24ed1eff.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/01-purpose-3908a591.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/03-schema-ce10cfc7.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/04-api-38839a70.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/05-events-5d073f32.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/06-integration-7b1da156.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/09-tests-6966fc82.md
D idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/manifest.json
M idearium/data/warp-crystals.json
M idearium/spec-engine/index.js
M idearium/ui/index.html
D idearium/ui/js/app.js
A nexus-full-5.zip
D scripts/confirm-build.mjs
D tests/modules/spec-import.test.mjs
```

### Build 0.9.10-r21 — snap-0263 — 2026-07-11 00:41:08

- Archive: `nexus-0263_2026-07-11_v0.9.10-r21_full-wired.zip` (was `nexus-full-wired.zip`)
- SHA-256: `3dc88236da39ae663b34e43a75e36d5fd07ebca7a02262c2784ba2c9adbc5643`, 6 MB, downloaded 2026-07-11 00:51:16
- Kind: full
- Commit: `2abc5163dedc0fd0096ad651d45e195c6d993961`, tag `snap-0263`
- Identical copy: `nexus-0263_2026-07-11_v0.9.10-r21_full-wired-1_dup1.zip` (was `nexus-full-wired (1).zip`)
- Files in archive: 1277. Changes against the build before it: **93 added, 11 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 54 | 8 | 0 |
| unintegrated | 36 | 1 | 0 |
| (root) | 1 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |
| tests | 1 | 0 | 0 |

```
A CONFIRM-BUILD.md
M copilot/lifeline.js
M docs/NEXUS-STATE-SPEC-2026-07-06.md
A idearium/CHANGES-2026-07-11.md
M idearium/api/index.js
A idearium/copilot-adapter/index.js
M idearium/data/idearium-repos.json
A idearium/data/specs/0cfc8eb6-998a-4e3e-8414-fe00916f8c6c/manifest.json
A idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/00-meta-bd845f20.md
A idearium/data/specs/0dfe6202-c683-4a2d-81dd-bbe72a5b0424/manifest.json
A idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/00-meta-09ce84b2.md
A idearium/data/specs/205db79b-32de-40e1-92b2-55e27dc06be5/manifest.json
A idearium/data/specs/354d4f1f-371b-4df6-93be-93fe85f95789/manifest.json
A idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/00-meta-fad4ad58.md
A idearium/data/specs/36270f42-b73a-46e2-a1fc-df8bbe291ad4/manifest.json
A idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/00-meta-ee3d180f.md
A idearium/data/specs/3704af32-e27c-4d78-8ac8-b2d851e02e33/manifest.json
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/00-meta-5559b817.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/01-purpose-1befa449.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/04-api-6d88466c.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/09-tests-fba83fb3.md
A idearium/data/specs/4e4007a0-b5e6-441f-af77-54278bac46c8/manifest.json
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/00-meta-e4d772ed.md
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/01-purpose-09eb973f.md
A idearium/data/specs/6386e95b-ff4f-4eda-aab8-e4bdd5a836ec/manifest.json
A idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/00-meta-75e452eb.md
A idearium/data/specs/6d47397c-489b-447e-b87e-29850539d14d/manifest.json
A idearium/data/specs/8bb55aa8-2a01-4259-820a-28c89799cb27/manifest.json
A idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/00-meta-658c9324.md
A idearium/data/specs/b31300c4-8843-44ea-ab30-b65059c16081/manifest.json
A idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/01-purpose-4b42f68e.md
A idearium/data/specs/c20b8b42-5cef-4d45-959a-9eba0df2eb36/manifest.json
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/00-meta-08a89a88.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/01-purpose-e3d0223c.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/04-api-bc4ec168.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/09-tests-597ba210.md
A idearium/data/specs/d35214f0-980d-44e4-9a30-ec6930a1227b/manifest.json
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/00-meta-12f28cd3.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/01-purpose-f82321c7.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/03-schema-fd776ee8.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/04-api-6b43b3c4.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/05-events-932e145e.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/06-integration-b3fd3c58.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/09-tests-15a731df.md
A idearium/data/specs/d6b942ea-e2d5-4bc0-b1d4-fef1e60245c0/manifest.json
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/00-meta-24ed1eff.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/01-purpose-3908a591.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/03-schema-ce10cfc7.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/04-api-38839a70.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/05-events-5d073f32.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/06-integration-7b1da156.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/09-tests-6966fc82.md
A idearium/data/specs/f95d0507-3d6d-4d79-8437-8d393514e78b/manifest.json
M idearium/data/warp-crystals.json
M idearium/interaction-contract.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
A idearium/spec-engine/templates/ai-agent-system.spec
A idearium/spec-engine/templates/api-service.spec
A idearium/spec-engine/templates/event-system.spec
A idearium/spec-engine/templates/minimal-kernel.spec
A idearium/spec-engine/templates/plugin-runtime.md
M idearium/ui/index.html
A idearium/ui/js/app.js
D nexus-full-5.zip
A scripts/confirm-build.mjs
A tests/modules/spec-import.test.mjs
A unintegrated/2026-07-branch-a-additions/agent-tools/run-cockpit-command.js
A unintegrated/2026-07-branch-a-additions/clear-glass/ncp-client.js
A unintegrated/2026-07-branch-a-additions/docs/CHANGELOG-SESSION-2026-07-08.md
A unintegrated/2026-07-branch-a-additions/docs/NEXUS-ENCYCLOPEDIA.md
A unintegrated/2026-07-branch-a-additions/docs/NEXUS-PLAIN-ENGLISH.md
A unintegrated/2026-07-branch-a-additions/docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
A unintegrated/2026-07-branch-a-additions/docs/SESSION-MANIFEST-2026-07-07.md
A unintegrated/2026-07-branch-a-additions/docs/docs-level-genesis.spec
A unintegrated/2026-07-branch-a-additions/docs/nexus-selfdiag-registry-interface.spec
A unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
A unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
A unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
A unintegrated/2026-07-branch-a-additions/tests/compartment-engine.test.js
A unintegrated/2026-07-branch-a-additions/tests/idearium-warp-dispatch.test.mjs
A unintegrated/2026-07-branch-a-additions/ui/build-channel/build.css
A unintegrated/2026-07-branch-a-additions/ui/build-channel/build.html
A unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.css
A unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.html
A unintegrated/2026-07-branch-a-additions/ui/home/nexus-home.html
A unintegrated/2026-07-branch-a-additions/ui/home/shell.css
A unintegrated/2026-07-branch-a-additions/ui/toast/toast.css
A unintegrated/2026-07-branch-a-additions/ui/tutorial/tutorial.css
A unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-intelligence-index.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-v2.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/liminal-space/index.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/causality.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/lattice.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/sigma.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/telemetry-codec/latent-model.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/bus.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/field.schema.json
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/signal.schema.json
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/snr.js
M unintegrated/README.md
```

### Build 0.9.10-r22 — snap-0264 — 2026-07-11 00:53:32

- Archive: `nexus-0264_2026-07-11_v0.9.10-r22_idearium-integrated.zip` (was `nexus-idearium-integrated.zip`)
- SHA-256: `138ed323c79c03aa47ad9151dde9f9c9a7cbbb6881351c2588e9a2dbb1634a65`, 5.9 MB, downloaded 2026-07-11 00:54:55
- Kind: full
- Commit: `780011b8c917c98f3154bc4f6bb2d3509a1eae69`, tag `snap-0264`
- Files in archive: 1253. Changes against the build before it: **19 added, 9 modified, 43 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| unintegrated | 0 | 1 | 36 |
| idearium | 17 | 8 | 7 |
| data | 2 | 0 | 0 |

```
A data/idearium.json
A data/idearium/event_log.jsonl
D idearium/CHANGES-2026-07-11.md
M idearium/api/index.js
D idearium/copilot-adapter/index.js
M idearium/data/idearium-repos.json
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/00-meta-014c7999.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/01-purpose-2815cb01.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/02-axioms-cd19efc9.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/03-schema-48ec69cf.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/04-api-60864e50.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/05-events-15714642.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/06-integration-7916fc41.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/07-failure_modes-ba099d7b.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/08-build_order-1df66243.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/09-tests-aecac8d3.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/2bb72761-023b-40fa-97c7-f33d0869c8c4.spec
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/manifest.json
M idearium/interaction-contract.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
D idearium/spec-engine/templates/ai-agent-system.spec
D idearium/spec-engine/templates/api-service.spec
A idearium/spec-engine/templates/architecture.spec
A idearium/spec-engine/templates/axioms.spec
A idearium/spec-engine/templates/checklists.spec
A idearium/spec-engine/templates/compartments.spec
D idearium/spec-engine/templates/event-system.spec
D idearium/spec-engine/templates/minimal-kernel.spec
D idearium/spec-engine/templates/plugin-runtime.md
A idearium/spec-engine/templates/schemas.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
D unintegrated/2026-07-branch-a-additions/agent-tools/run-cockpit-command.js
D unintegrated/2026-07-branch-a-additions/clear-glass/ncp-client.js
D unintegrated/2026-07-branch-a-additions/docs/CHANGELOG-SESSION-2026-07-08.md
D unintegrated/2026-07-branch-a-additions/docs/NEXUS-ENCYCLOPEDIA.md
D unintegrated/2026-07-branch-a-additions/docs/NEXUS-PLAIN-ENGLISH.md
D unintegrated/2026-07-branch-a-additions/docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
D unintegrated/2026-07-branch-a-additions/docs/SESSION-MANIFEST-2026-07-07.md
D unintegrated/2026-07-branch-a-additions/docs/docs-level-genesis.spec
D unintegrated/2026-07-branch-a-additions/docs/nexus-selfdiag-registry-interface.spec
D unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
D unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
D unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
D unintegrated/2026-07-branch-a-additions/tests/compartment-engine.test.js
D unintegrated/2026-07-branch-a-additions/tests/idearium-warp-dispatch.test.mjs
D unintegrated/2026-07-branch-a-additions/ui/build-channel/build.css
D unintegrated/2026-07-branch-a-additions/ui/build-channel/build.html
D unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.css
D unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.html
D unintegrated/2026-07-branch-a-additions/ui/home/nexus-home.html
D unintegrated/2026-07-branch-a-additions/ui/home/shell.css
D unintegrated/2026-07-branch-a-additions/ui/toast/toast.css
D unintegrated/2026-07-branch-a-additions/ui/tutorial/tutorial.css
D unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-intelligence-index.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-v2.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/liminal-space/index.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/causality.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/lattice.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/sigma.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/telemetry-codec/latent-model.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/bus.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/field.schema.json
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/signal.schema.json
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/snr.js
M unintegrated/README.md
```

### Build 0.9.10-r23 — snap-0265 — 2026-07-11 01:29:50

- Archive: `nexus-0265_2026-07-11_v0.9.10-r23_idearium-integrated-1.zip` (was `nexus-idearium-integrated-1.zip`)
- SHA-256: `92df5a9ffdbb6b479845cecc9ffa2f69313910188beca3a2cf5a07992a054a1b`, 6 MB, downloaded 2026-07-11 01:34:16
- Kind: full
- Commit: `3fe4d1c2125916beab3f9d7588fc1fbc47c79904`, tag `snap-0265`
- Files in archive: 1303. Changes against the build before it: **50 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 35 | 9 | 0 |
| ui | 12 | 6 | 0 |
| clear-glass | 1 | 3 | 0 |
| (root) | 0 | 3 | 0 |
| data | 2 | 1 | 0 |

```
M CHANGELOG-SESSION.md
M CHANGELOG.md
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/renderer/browser.html
A clear-glass/renderer/browser.js
A data/idearium/cfr_state.json
M data/idearium/event_log.jsonl
A data/idearium/event_stats.json
M idearium/api/index.js
M idearium/data/idearium-repos.json
A idearium/data/repos/nexus-id-repo-40853aae/.trash/1783757240689-NOTES.md
A idearium/data/repos/nexus-id-repo-40853aae/00-meta.md
A idearium/data/repos/nexus-id-repo-40853aae/01-purpose.md
A idearium/data/repos/nexus-id-repo-40853aae/02-axioms.md
A idearium/data/repos/nexus-id-repo-40853aae/03-schema.md
A idearium/data/repos/nexus-id-repo-40853aae/04-api.md
A idearium/data/repos/nexus-id-repo-40853aae/05-events.md
A idearium/data/repos/nexus-id-repo-40853aae/06-integration.md
A idearium/data/repos/nexus-id-repo-40853aae/07-failure_modes.md
A idearium/data/repos/nexus-id-repo-40853aae/08-build_order.md
A idearium/data/repos/nexus-id-repo-40853aae/09-tests.md
A idearium/data/repos/nexus-id-repo-40853aae/Pulse.spec
A idearium/data/repos/nexus-id-repo-4efbbc6c/00-meta.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/01-purpose.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/02-axioms.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/03-schema.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/04-api.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/05-events.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/06-integration.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/07-failure_modes.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/08-build_order.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/09-tests.md
A idearium/data/repos/nexus-id-repo-4efbbc6c/Waypoint.spec
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/00-meta-9d4d8666.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/01-purpose-918ab0e1.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/02-axioms-3e75eb38.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/03-schema-4b2f5b87.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/04-api-42cd5619.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/05-events-d41bd150.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/06-integration-3ff595c0.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/07-failure_modes-eba1bb9c.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/08-build_order-cd8ee97f.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/09-tests-5b9613dc.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12.spec
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/manifest.json
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
M idearium/spec/idearium.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M package.json
A ui/channels/blueprint/blueprint.html
A ui/channels/bridge/bridge.html
A ui/channels/build/build.html
A ui/channels/causal/causal.html
A ui/channels/conversations/conversations.html
A ui/channels/cortex/cortex.html
A ui/channels/diagnose/diagnose.html
A ui/channels/guardian/guardian.html
A ui/channels/idearium/idearium.html
A ui/channels/log/log.html
A ui/channels/overview/overview.html
M ui/home/DECOMP.md
M ui/home/STRUCTURE.md
A ui/home/nexus-home.html
M ui/home/shell.js
M ui/tv-shell/DECOMP.md
M ui/tv-shell/nerve/nerve.js
M ui/tv-shell/spotlight/spotlight.js
```

### Build 0.9.10-r24 — snap-0266 — 2026-07-11 01:44:48

- Archive: `nexus-0266_2026-07-11_v0.9.10-r24_idearium-integrated-2.zip` (was `nexus-idearium-integrated-2.zip`)
- SHA-256: `aea9471a80bc5dfc76858a7be16e414181942ad10ed3b70d80d6f93686e9a541`, 6.1 MB, downloaded 2026-07-11 01:52:35
- Kind: full
- Commit: `9e943297851dc391503734f890fa5e6578fd9bb8`, tag `snap-0266`
- Files in archive: 1323. Changes against the build before it: **20 added, 14 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 20 | 8 | 0 |
| data | 0 | 4 | 0 |
| (root) | 0 | 2 | 0 |

```
M CHANGELOG-SESSION.md
M CHANGELOG.md
M data/idearium.json
M data/idearium/cfr_state.json
M data/idearium/event_log.jsonl
M data/idearium/event_stats.json
M idearium/api/index.js
M idearium/data/idearium-repos.json
A idearium/data/repos/nexus-id-repo-bc6c06a5/00-meta.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/01-purpose.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/02-axioms.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/03-schema.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/04-api.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/05-events.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/06-integration.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/07-failure_modes.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/08-build_order.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/09-tests.md
A idearium/data/repos/nexus-id-repo-bc6c06a5/Waylight.spec
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/00-meta-8092aeb7.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/01-purpose-f476295c.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/02-axioms-68f56aa3.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/03-schema-f81aab42.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/04-api-08126a42.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/05-events-1ba3dd98.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/06-integration-ace6c012.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/09-tests-9e45870a.md
A idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/manifest.json
M idearium/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
```

### Build 0.9.10-r25 — snap-0267 — 2026-07-11 03:05:50

- Archive: `nexus-0267_2026-07-11_v0.9.10-r25_merged-final.zip` (was `nexus-merged-final.zip`)
- SHA-256: `aa522681e91e9d475b7802f5b69157efb474d8158495a62a9bb2a784980f765a`, 6.2 MB, downloaded 2026-07-11 03:07:40
- Kind: full
- Commit: `b79e77fd17928fc8e303a3d018fe4b7712cecf68`, tag `snap-0267`
- Files in archive: 1341. Changes against the build before it: **61 added, 15 modified, 43 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 25 | 8 | 43 |
| unintegrated | 36 | 1 | 0 |
| data | 0 | 4 | 0 |
| (root) | 0 | 2 | 0 |

```
M CHANGELOG-SESSION.md
M CHANGELOG.md
M data/idearium.json
M data/idearium/cfr_state.json
M data/idearium/event_log.jsonl
M data/idearium/event_stats.json
A idearium/CHANGES-2026-07-11-MERGE.md
A idearium/CHANGES-2026-07-11.md
M idearium/api/index.js
A idearium/copilot-adapter/index.js
M idearium/data/idearium-repos.json
D idearium/data/repos/nexus-id-repo-40853aae/.trash/1783757240689-NOTES.md
D idearium/data/repos/nexus-id-repo-40853aae/00-meta.md
D idearium/data/repos/nexus-id-repo-40853aae/01-purpose.md
D idearium/data/repos/nexus-id-repo-40853aae/02-axioms.md
D idearium/data/repos/nexus-id-repo-40853aae/03-schema.md
D idearium/data/repos/nexus-id-repo-40853aae/04-api.md
D idearium/data/repos/nexus-id-repo-40853aae/05-events.md
D idearium/data/repos/nexus-id-repo-40853aae/06-integration.md
D idearium/data/repos/nexus-id-repo-40853aae/07-failure_modes.md
D idearium/data/repos/nexus-id-repo-40853aae/08-build_order.md
D idearium/data/repos/nexus-id-repo-40853aae/09-tests.md
D idearium/data/repos/nexus-id-repo-40853aae/Pulse.spec
D idearium/data/repos/nexus-id-repo-4efbbc6c/00-meta.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/01-purpose.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/02-axioms.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/03-schema.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/04-api.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/05-events.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/06-integration.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/07-failure_modes.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/08-build_order.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/09-tests.md
D idearium/data/repos/nexus-id-repo-4efbbc6c/Waypoint.spec
D idearium/data/repos/nexus-id-repo-bc6c06a5/00-meta.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/01-purpose.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/02-axioms.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/03-schema.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/04-api.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/05-events.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/06-integration.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/07-failure_modes.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/08-build_order.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/09-tests.md
D idearium/data/repos/nexus-id-repo-bc6c06a5/Waylight.spec
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/00-meta-682a40d4.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/01-purpose-d17bafed.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/02-axioms-1afab740.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/04-api-66fa91ce.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/06-integration-3d25f28b.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/manifest.json
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/00-meta-8092aeb7.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/01-purpose-f476295c.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/02-axioms-68f56aa3.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/03-schema-f81aab42.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/04-api-08126a42.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/05-events-1ba3dd98.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/06-integration-ace6c012.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/09-tests-9e45870a.md
D idearium/data/specs/43a8b111-795d-4b01-b1ad-b4dde860f392/manifest.json
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/00-meta-0f7ec0b9.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/01-purpose-e66d0cd7.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/02-axioms-55e7d407.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/03-schema-65c32975.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/04-api-e3c2836f.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/05-events-8730ed6d.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/06-integration-479c2e69.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/09-tests-18ec7a14.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/10-notes-f7efd279.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/11-changes-f523f398.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/manifest.json
M idearium/interaction-contract.json
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
A idearium/spec-engine/templates/ai-agent-system.spec
A idearium/spec-engine/templates/api-service.spec
A idearium/spec-engine/templates/event-system.spec
A idearium/spec-engine/templates/minimal-kernel.spec
A idearium/spec-engine/templates/plugin-runtime.md
M idearium/spec/idearium.spec
A unintegrated/2026-07-branch-a-additions/agent-tools/run-cockpit-command.js
A unintegrated/2026-07-branch-a-additions/clear-glass/ncp-client.js
A unintegrated/2026-07-branch-a-additions/docs/CHANGELOG-SESSION-2026-07-08.md
A unintegrated/2026-07-branch-a-additions/docs/NEXUS-ENCYCLOPEDIA.md
A unintegrated/2026-07-branch-a-additions/docs/NEXUS-PLAIN-ENGLISH.md
A unintegrated/2026-07-branch-a-additions/docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
A unintegrated/2026-07-branch-a-additions/docs/SESSION-MANIFEST-2026-07-07.md
A unintegrated/2026-07-branch-a-additions/docs/docs-level-genesis.spec
A unintegrated/2026-07-branch-a-additions/docs/nexus-selfdiag-registry-interface.spec
A unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
A unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
A unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
A unintegrated/2026-07-branch-a-additions/tests/compartment-engine.test.js
A unintegrated/2026-07-branch-a-additions/tests/idearium-warp-dispatch.test.mjs
A unintegrated/2026-07-branch-a-additions/ui/build-channel/build.css
A unintegrated/2026-07-branch-a-additions/ui/build-channel/build.html
A unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.css
A unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.html
A unintegrated/2026-07-branch-a-additions/ui/home/nexus-home.html
A unintegrated/2026-07-branch-a-additions/ui/home/shell.css
A unintegrated/2026-07-branch-a-additions/ui/toast/toast.css
A unintegrated/2026-07-branch-a-additions/ui/tutorial/tutorial.css
A unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-intelligence-index.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-v2.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/liminal-space/index.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/causality.js
A unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/lattice.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/sigma.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/telemetry-codec/latent-model.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/bus.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/field.schema.json
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/index.js
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/signal.schema.json
A unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/snr.js
M unintegrated/README.md
```

### Build 0.9.10-r26 — snap-0268 — 2026-07-11 04:20:16

- Archive: `nexus-0268_2026-07-11_v0.9.10-r26_merged-final-1.zip` (was `nexus-merged-final-1.zip`)
- SHA-256: `dab76f3e01e6eecbfc22f837991e6267ee4cdeeba4087a8e45ac0e6bbfebe4d0`, 6.2 MB, downloaded 2026-07-11 04:24:58
- Kind: full
- Commit: `b813064c51746cd612161c6b96675813439bf385`, tag `snap-0268`
- Files in archive: 1341. Changes against the build before it: **0 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 4 | 0 |

```
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
```

### Build 0.9.10-r27 — snap-0269 — 2026-07-11 05:11:26

- Archive: `nexus-0269_2026-07-11_v0.9.10-r27_merged-final-2.zip` (was `nexus-merged-final-2.zip`)
- SHA-256: `9da4630be7425de2103007c663149ca5597e3f5c962c1d44c0567f90260fbd01`, 6.2 MB, downloaded 2026-07-11 05:13:35
- Kind: full
- Commit: `bdd5edf06c1cdbe38068ad243dc070003d25754d`, tag `snap-0269`
- Files in archive: 1341. Changes against the build before it: **0 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 4 | 0 |

```
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
```

### Build 0.9.10-r28 — snap-0270 — 2026-07-11 07:04:12

- Archive: `nexus-0270_2026-07-11_v0.9.10-r28_merged-final-3.zip` (was `nexus-merged-final-3.zip`)
- SHA-256: `a5125ad533fd6344af3e52aab3a77c3fb971b9b59a0b7a9040ca3f88933e344f`, 6.2 MB, downloaded 2026-07-11 07:28:25
- Kind: full
- Commit: `e8bc5dc1e28c00d302659b1fd30957cd5734f873`, tag `snap-0270`
- Identical copy: `nexus-0270_2026-07-11_v0.9.10-r28_merged-final-4_dup1.zip` (was `nexus-merged-final-4.zip`)
- Files in archive: 1343. Changes against the build before it: **2 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 2 | 3 | 0 |

```
M clear-glass/README.md
M clear-glass/package.json
A clear-glass/src/diagnostic/process-metrics.js
M clear-glass/src/main/index.js
A clear-glass/tools/process-monitor.html
```

### Build 0.9.10-r29 — snap-0271 — 2026-07-11 10:32:42

- Archive: `nexus-0271_2026-07-11_v0.9.10-r29_merged-final-5.zip` (was `nexus-merged-final-5.zip`)
- SHA-256: `8fe9f72a6f3d85c8ffac2e598a220ae7c9348f4006005808ceefbaa602124c80`, 6.2 MB, downloaded 2026-07-11 10:53:58
- Kind: full
- Commit: `c175f40809d0c4c60199a6f246e1511272d51f16`, tag `snap-0271`
- Files in archive: 1343. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M copilot/server.js
M lib/version.js
M tests/modules/copilot-handshake-dispatch.test.js
M ui/channels/conversations/conversations.html
M ui/tv-shell/menu.js
```

### Build 0.9.10-r30 — snap-0272 — 2026-07-11 11:44:32

- Archive: `nexus-0272_2026-07-11_v0.9.10-r30_merged-final-6.zip` (was `nexus-merged-final-6.zip`)
- SHA-256: `733410e9a85621c166b159442458ed8e4a43877629c989f9c95f01af716762ea`, 6.2 MB, downloaded 2026-07-11 11:55:16
- Kind: full
- Commit: `dcf820429f73bd127e99760d7ff3948944ad1a56`, tag `snap-0272`
- Identical copy: `nexus-0272_2026-07-11_v0.9.10-r30_merged-final-7_dup1.zip` (was `nexus-merged-final-7.zip`)
- Identical copy: `nexus-0272_2026-07-11_v0.9.10-r30_merged-final-8_dup2.zip` (was `nexus-merged-final-8.zip`)
- Files in archive: 1348. Changes against the build before it: **5 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 5 | 0 | 0 |
| clear-glass | 0 | 3 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/src/main/index.js
A data/cortex/memory/settings.json
A data/cortex/memory/sigma_records.json
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
M lib/version.js
M orchestrator.js
M tests/integration-results.json
```

### Build 0.9.10-r31 — snap-0273 — 2026-07-11 23:09:16

- Archive: `nexus-0273_2026-07-11_v0.9.10-r31_merged-final-9.zip` (was `nexus-merged-final-9.zip`)
- SHA-256: `53dd051b723d4e680b47fae3338df4df7c47218884983c739c10dfeb4e9e756b`, 6.2 MB, downloaded 2026-07-11 23:10:58
- Kind: full
- Commit: `51e325cf2362af9d815c79be16f2deb2e5aa6a82`, tag `snap-0273`
- Files in archive: 1351. Changes against the build before it: **3 added, 10 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 6 | 0 |
| data | 3 | 0 | 0 |
| bridge | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M bridge/router.js
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/ipc/bridge.js
M copilot/server.js
A data/bridge/bridge_requests.buffer.jsonl
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
M lib/version.js
M ui/tv-shell/index.html
```

### Build 0.9.10-r32 — snap-0274 — 2026-07-11 23:31:36

- Archive: `nexus-0274_2026-07-11_v0.9.10-r32_full-wired-2.zip` (was `nexus-full-wired (2).zip`)
- SHA-256: `bd3f7a3e17e80bde2af575e99b6e9ccb078c9b452541b4ad2451ac0ddcee51a7`, 6 MB, downloaded 2026-07-12 00:53:59
- Kind: full
- Commit: `f4ff6215fc221b0521bd7c7e8b8cf445668e71f6`, tag `snap-0274`
- Identical copy: `nexus-0274_2026-07-11_v0.9.10-r32_full-wired-3_dup1.zip` (was `nexus-full-wired (3).zip`)
- Identical copy: `nexus-0274_2026-07-11_v0.9.10-r32_full-wired-4_dup2.zip` (was `nexus-full-wired (4).zip`)
- Files in archive: 1280. Changes against the build before it: **6 added, 48 modified, 77 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 9 | 47 |
| ui | 1 | 8 | 12 |
| data | 0 | 0 | 12 |
| clear-glass | 0 | 8 | 3 |
| cortex | 5 | 5 | 0 |
| cos | 0 | 6 | 0 |
| (root) | 0 | 4 | 0 |
| unintegrated | 0 | 1 | 3 |
| tests | 0 | 2 | 0 |
| warp | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M CHANGELOG-SESSION.md
M CHANGELOG.md
M bridge/router.js
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
D clear-glass/renderer/browser.js
M clear-glass/src/copilot/bridge.js
D clear-glass/src/diagnostic/process-metrics.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
D clear-glass/tools/process-monitor.html
M copilot/server.js
M cortex/boot.js
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
D data/bridge/bridge_requests.buffer.jsonl
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/cortex/memory/settings.json
D data/cortex/memory/sigma_records.json
D data/idearium.json
D data/idearium/cfr_state.json
D data/idearium/event_log.jsonl
D data/idearium/event_stats.json
D data/knowledge/facts.jsonl
D data/ledger/event_log.jsonl
D data/ledger/orchestrator.jsonl
D idearium/CHANGES-2026-07-11-MERGE.md
M idearium/api/index.js
M idearium/data/idearium-repos.json
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/00-meta-014c7999.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/01-purpose-2815cb01.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/02-axioms-cd19efc9.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/03-schema-48ec69cf.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/04-api-60864e50.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/05-events-15714642.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/06-integration-7916fc41.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/07-failure_modes-ba099d7b.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/08-build_order-1df66243.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/09-tests-aecac8d3.md
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/2bb72761-023b-40fa-97c7-f33d0869c8c4.spec
D idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/manifest.json
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/00-meta-682a40d4.md
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/01-purpose-d17bafed.md
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/02-axioms-1afab740.md
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/04-api-66fa91ce.md
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/06-integration-3d25f28b.md
D idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/manifest.json
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/00-meta-9d4d8666.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/01-purpose-918ab0e1.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/02-axioms-3e75eb38.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/03-schema-4b2f5b87.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/04-api-42cd5619.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/05-events-d41bd150.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/06-integration-3ff595c0.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/07-failure_modes-eba1bb9c.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/08-build_order-cd8ee97f.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/09-tests-5b9613dc.md
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12.spec
D idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/manifest.json
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/00-meta-0f7ec0b9.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/01-purpose-e66d0cd7.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/02-axioms-55e7d407.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/03-schema-65c32975.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/04-api-e3c2836f.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/05-events-8730ed6d.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/06-integration-479c2e69.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/09-tests-18ec7a14.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/10-notes-f7efd279.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/11-changes-f523f398.md
D idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/manifest.json
M idearium/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
D idearium/spec-engine/templates/architecture.spec
D idearium/spec-engine/templates/axioms.spec
D idearium/spec-engine/templates/checklists.spec
D idearium/spec-engine/templates/compartments.spec
D idearium/spec-engine/templates/schemas.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/version.js
M orchestrator.js
M package.json
M tests/integration-results.json
M tests/modules/copilot-handshake-dispatch.test.js
D ui/channels/blueprint/blueprint.html
D ui/channels/bridge/bridge.html
D ui/channels/build/build.html
D ui/channels/causal/causal.html
D ui/channels/conversations/conversations.html
D ui/channels/cortex/cortex.html
D ui/channels/diagnose/diagnose.html
D ui/channels/guardian/guardian.html
D ui/channels/idearium/idearium.html
D ui/channels/log/log.html
D ui/channels/overview/overview.html
M ui/home/DECOMP.md
M ui/home/STRUCTURE.md
D ui/home/nexus-home.html
M ui/home/shell.js
A ui/ledger-viewer/index.html
M ui/tv-shell/DECOMP.md
M ui/tv-shell/index.html
M ui/tv-shell/menu.js
M ui/tv-shell/nerve/nerve.js
M ui/tv-shell/spotlight/spotlight.js
D unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
D unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
D unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
M unintegrated/README.md
M warp/core/Stream.js
M warp/core/StreamLog.js
```

### Build 0.9.10-r33 — snap-0275 — 2026-07-11 23:59:20

- Archive: `nexus-0275_2026-07-11_v0.9.10-r33_merged-final-10.zip` (was `nexus-merged-final-10.zip`)
- SHA-256: `5594b51d2d1ff0f49b0a08df13b7aa7f9dc498e0d782e9d8a62d6f3bf5dc7091`, 6.2 MB, downloaded 2026-07-12 00:37:20
- Kind: full
- Commit: `94b1844e3dca86d956ac0660f01bb02b2d28c2bb`, tag `snap-0275`
- Files in archive: 1364. Changes against the build before it: **90 added, 54 modified, 6 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 57 | 9 | 0 |
| ui | 12 | 8 | 1 |
| data | 15 | 0 | 0 |
| clear-glass | 3 | 9 | 0 |
| cortex | 0 | 5 | 5 |
| cos | 0 | 6 | 0 |
| (root) | 0 | 4 | 0 |
| guardian | 0 | 4 | 0 |
| unintegrated | 3 | 1 | 0 |
| copilot | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |
| warp | 0 | 2 | 0 |
| bridge | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M CHANGELOG-SESSION.md
M CHANGELOG.md
M bridge/router.js
M clear-glass/README.md
M clear-glass/package.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
A clear-glass/renderer/browser.js
M clear-glass/src/copilot/bridge.js
A clear-glass/src/diagnostic/process-metrics.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
A clear-glass/tools/process-monitor.html
M copilot/module-builder.js
M copilot/server.js
M cortex/boot.js
M cortex/intelligence/mastermind.js
M cortex/interaction-contract.json
D cortex/memory/bep-lookup.js
D cortex/memory/causal-lookup.js
D cortex/memory/decay.js
D cortex/memory/fix-map.js
M cortex/memory/jaa-db.js
D cortex/memory/tiers.js
M cortex/push-recall.js
M cos/kernel.js
M cos/manager.js
M cos/siso/Event.js
M cos/siso/Stream.js
M cos/siso/StreamLog.js
M cos/siso/index.js
A data/bridge/bridge_requests.buffer.jsonl
A data/bridge/ledger/cfr/event_log.jsonl
A data/bridge/ledger/requests.jsonl
A data/cortex/memory/event_log.json
A data/cortex/memory/memory_unified.json
A data/cortex/memory/settings.json
A data/cortex/memory/sigma_records.json
A data/guardian/ledger/boot/events.ndjson
A data/idearium.json
A data/idearium/cfr_state.json
A data/idearium/event_log.jsonl
A data/idearium/event_stats.json
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
M guardian/memory_store/cfr_state.json
M guardian/memory_store/event_log.jsonl
M guardian/memory_store/event_stats.json
M guardian/memory_store/settings.json
A idearium/CHANGES-2026-07-11-MERGE.md
M idearium/api/index.js
M idearium/data/idearium-repos.json
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/00-meta-014c7999.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/01-purpose-2815cb01.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/02-axioms-cd19efc9.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/03-schema-48ec69cf.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/04-api-60864e50.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/05-events-15714642.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/06-integration-7916fc41.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/07-failure_modes-ba099d7b.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/08-build_order-1df66243.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/09-tests-aecac8d3.md
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/2bb72761-023b-40fa-97c7-f33d0869c8c4.spec
A idearium/data/specs/2bb72761-023b-40fa-97c7-f33d0869c8c4/manifest.json
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/00-meta-682a40d4.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/01-purpose-d17bafed.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/02-axioms-1afab740.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/04-api-66fa91ce.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/06-integration-3d25f28b.md
A idearium/data/specs/3bbafe9b-0323-4ea8-adb2-df82e2b21024/manifest.json
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/00-meta-9d4d8666.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/01-purpose-918ab0e1.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/02-axioms-3e75eb38.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/03-schema-4b2f5b87.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/04-api-42cd5619.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/05-events-d41bd150.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/06-integration-3ff595c0.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/07-failure_modes-eba1bb9c.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/08-build_order-cd8ee97f.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/09-tests-5b9613dc.md
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12.spec
A idearium/data/specs/6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12/manifest.json
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/00-meta-3a1f2b3b.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/01-purpose-4173fa49.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/02-axioms-6ae72abc.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/03-schema-68aac38c.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/04-api-f5e21fa4.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/06-integration-89c9730d.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/07-failure_modes-5ef1f0f2.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/08-build_order-be5d8a41.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/09-tests-2be82da6.md
A idearium/data/specs/92a8bf9c-8dca-4a7f-92a9-6bf83a4cf651/manifest.json
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/00-meta-0f7ec0b9.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/01-purpose-e66d0cd7.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/02-axioms-55e7d407.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/03-schema-65c32975.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/04-api-e3c2836f.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/05-events-8730ed6d.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/06-integration-479c2e69.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/09-tests-18ec7a14.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/10-notes-f7efd279.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/11-changes-f523f398.md
A idearium/data/specs/fa21d828-0e60-4516-9ca4-51c6056b1ff1/manifest.json
M idearium/index.js
M idearium/package.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
M idearium/spec-engine/templates.js
A idearium/spec-engine/templates/architecture.spec
A idearium/spec-engine/templates/axioms.spec
A idearium/spec-engine/templates/checklists.spec
A idearium/spec-engine/templates/compartments.spec
A idearium/spec-engine/templates/schemas.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/version.js
M orchestrator.js
M package.json
M tests/integration-results.json
M tests/modules/copilot-handshake-dispatch.test.js
A ui/channels/blueprint/blueprint.html
A ui/channels/bridge/bridge.html
A ui/channels/build/build.html
A ui/channels/causal/causal.html
A ui/channels/conversations/conversations.html
A ui/channels/cortex/cortex.html
A ui/channels/diagnose/diagnose.html
A ui/channels/guardian/guardian.html
A ui/channels/idearium/idearium.html
A ui/channels/log/log.html
A ui/channels/overview/overview.html
M ui/home/DECOMP.md
M ui/home/STRUCTURE.md
A ui/home/nexus-home.html
M ui/home/shell.js
D ui/ledger-viewer/index.html
M ui/tv-shell/DECOMP.md
M ui/tv-shell/index.html
M ui/tv-shell/menu.js
M ui/tv-shell/nerve/nerve.js
M ui/tv-shell/spotlight/spotlight.js
A unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
A unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
A unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
M unintegrated/README.md
M warp/core/Stream.js
M warp/core/StreamLog.js
```

