# Nexus 0.7.0

| | |
|---|---|
| Built | 2026-06-16 17:17:26 → 2026-06-16 17:32:52 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.7.0 |
| Tag | `v0.7.0` → snap-0104 |
| Full file ledger | [LEDGER-0.7.0.csv](../ledger/LEDGER-0.7.0.csv) |

## Ledger

### Build 0.7.0-r1 — snap-0103 — 2026-06-16 17:17:26

- Archive: `nexus-0103_2026-06-16_v0.7.0-r1.zip` (was `nexus-v0.7.0.zip`)
- SHA-256: `6ce1dd869021f64033b39cfca5355f54421e27ce07a89991677628175510f55c`, 3.5 MB, downloaded 2026-06-16 17:18:48
- Kind: full
- Commit: `c30f500f768b0ff02751eb4cdb1577f27a42862a`, tag `snap-0103`
- Files in archive: 633. Changes against the build before it: **2 added, 8 modified, 222 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| emerge | 0 | 0 | 168 |
| cockpit | 0 | 0 | 32 |
| cortex | 1 | 5 | 5 |
| ui | 0 | 0 | 9 |
| (root) | 0 | 1 | 2 |
| guardian | 0 | 0 | 3 |
| lib | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| data | 0 | 0 | 1 |
| idearium | 0 | 0 | 1 |
| tests | 0 | 0 | 1 |

```
M cli/diagnose.js
D cockpit/spec-compiler/SPEC_COMPILER.spec
D cockpit/spec-compiler/chunk/index.js
D cockpit/spec-compiler/compiler/baseline-tracker.js
D cockpit/spec-compiler/compiler/emit.js
D cockpit/spec-compiler/compiler/gap-field-engine.js
D cockpit/spec-compiler/compiler/index.js
D cockpit/spec-compiler/compiler/invariants-engine.js
D cockpit/spec-compiler/compiler/kg-builder.js
D cockpit/spec-compiler/compiler/pipeline.js
D cockpit/spec-compiler/compiler/reply-engine.js
D cockpit/spec-compiler/compiler/ring-buffer.js
D cockpit/spec-compiler/compiler/tier-contract.js
D cockpit/spec-compiler/cortex-query/index.js
D cockpit/spec-compiler/cortex-query/writeback.js
D cockpit/spec-compiler/idearium/client.js
D cockpit/spec-compiler/package-lock.json
D cockpit/spec-compiler/package.json
D cockpit/spec-compiler/runtime.spec
D cockpit/spec-compiler/seams/CORTEX_QUERY_SEAM.js
D cockpit/spec-compiler/siso/Event.js
D cockpit/spec-compiler/siso/Gate.js
D cockpit/spec-compiler/siso/Stream.js
D cockpit/spec-compiler/siso/StreamLog.js
D cockpit/spec-compiler/siso/index.js
D cockpit/spec-compiler/test/gap-field.test.js
D cockpit/spec-compiler/test/invariants.test.js
D cockpit/spec-compiler/test/kg.test.js
D cockpit/spec-compiler/test/propagation.test.js
D cockpit/spec-compiler/test/reply-engine.test.js
D cockpit/spec-compiler/test/tier-contract.test.js
D cockpit/spec-compiler/verify.js
D cockpit/spec-compiler/version.js
D cortex/foundation/siso/Event.js
D cortex/foundation/siso/Gate.js
D cortex/foundation/siso/Stream.js
D cortex/foundation/siso/StreamLog.js
D cortex/foundation/siso/index.js
M cortex/gap-loop.js
M cortex/gate/gap-finder.js
M cortex/replay/index.js
M cortex/self-heal/escalation.js
M cortex/self-heal/index.js
A cortex/test/replay.test.js
D emerge/emerge-ide.js
D emerge/emerge-kernel.js
D emerge/emerge.spec
D emerge/interaction-contract.json
D emerge/io/README.md
D emerge/io/agents/agent-base.eg
D emerge/io/agents/agent-chatgpt.eg
D emerge/io/agents/agent-claude.eg
D emerge/io/agents/agent-gemini.eg
D emerge/io/agents/agent-ollama.eg
D emerge/io/agents/agents-dispatcher.eg
D emerge/io/automation/automation-engine.eg
D emerge/io/automation/automation-queue.eg
D emerge/io/canvas/canvas-renderer.eg
D emerge/io/canvas/cfr-physics.eg
D emerge/io/canvas/cfr-render.eg
D emerge/io/canvas/cfr-rewind.eg
D emerge/io/canvas/image-analyzer.eg
D emerge/io/canvas/nas-router.eg
D emerge/io/canvas/node-inspector.eg
D emerge/io/canvas/rewind-scrubber.eg
D emerge/io/canvas/tauri-ws.eg
D emerge/io/cockpit.eg
D emerge/io/cockpit/cockpit-cli.eg
D emerge/io/cockpit/cockpit-core.eg
D emerge/io/cockpit/cockpit-forge.eg
D emerge/io/cockpit/cockpit-pipeline.eg
D emerge/io/cockpit/cockpit-ui.eg
D emerge/io/core/manifest-generator.eg
D emerge/io/core/raid-core.eg
D emerge/io/core/raid-fallback.eg
D emerge/io/core/raid-learner.eg
D emerge/io/core/raid-weights.eg
D emerge/io/core/translation.eg
D emerge/io/core/usage.eg
D emerge/io/cortex.eg
D emerge/io/crystalball/bep-engine.eg
D emerge/io/crystalball/crystalball.eg
D emerge/io/crystalball/lattice-bridge.eg
D emerge/io/crystalball/mcl.eg
D emerge/io/crystalball/mql.eg
D emerge/io/emerge-cli.js
D emerge/io/emerge-ide.eg
D emerge/io/emerge-kernel.js
D emerge/io/emerge-lsp.eg
D emerge/io/emerge-ollama.eg
D emerge/io/emerge-voice.eg
D emerge/io/emerge.spec
D emerge/io/foundation/admin-server.eg
D emerge/io/foundation/bus-log.eg
D emerge/io/foundation/cobalt-bus.eg
D emerge/io/foundation/cobalt-ledger.eg
D emerge/io/foundation/cobalt-registry.eg
D emerge/io/foundation/cobalt-watchdog.eg
D emerge/io/foundation/file-refs.eg
D emerge/io/foundation/file-store.eg
D emerge/io/foundation/nano-ws.eg
D emerge/io/foundation/poll-registry.eg
D emerge/io/foundation/siso-event.eg
D emerge/io/foundation/siso-gate.eg
D emerge/io/foundation/siso-stream-log.eg
D emerge/io/foundation/siso-stream.eg
D emerge/io/gate/gap-finder.eg
D emerge/io/gate/gate-runner.eg
D emerge/io/gate/healer.eg
D emerge/io/guardian-ext/guardian-app.eg
D emerge/io/guardian-ext/guardian-background.eg
D emerge/io/guardian-ext/guardian-cfr.eg
D emerge/io/guardian-ext/guardian-content.eg
D emerge/io/guardian-ext/guardian-handshake.eg
D emerge/io/guardian-ext/guardian-ir-layer.eg
D emerge/io/guardian-ext/guardian-popup.eg
D emerge/io/guardian-ext/module-base.eg
D emerge/io/guardian-ext/module-chatgpt.eg
D emerge/io/guardian-ext/module-claude.eg
D emerge/io/guardian-ext/module-instagram.eg
D emerge/io/guardian-ext/module-threads.eg
D emerge/io/guardian-server.eg
D emerge/io/guardian-server/cobalt-bridge.eg
D emerge/io/guardian-server/guardian-agents.eg
D emerge/io/guardian-server/guardian-api-7820.eg
D emerge/io/guardian-server/guardian-cli.eg
D emerge/io/guardian-server/guardian-dropzone-7822.eg
D emerge/io/guardian-server/guardian-jaa.eg
D emerge/io/guardian-server/guardian-memory-7823.eg
D emerge/io/guardian-server/guardian-server.eg
D emerge/io/guardian-server/guardian-wss-7821.eg
D emerge/io/guardian-userscript.eg
D emerge/io/idearium.eg
D emerge/io/idearium/idearium-api.eg
D emerge/io/idearium/idearium-cli.eg
D emerge/io/idearium/idearium-core.eg
D emerge/io/idearium/idearium-event.eg
D emerge/io/idearium/idearium-gate.eg
D emerge/io/memory/agent-memory.eg
D emerge/io/memory/continuous-stream.eg
D emerge/io/memory/feedback-weighter.eg
D emerge/io/memory/fix-map.eg
D emerge/io/memory/jaa-db.eg
D emerge/io/memory/lattice-index.eg
D emerge/io/orion/orion-policy.eg
D emerge/io/orion/orion-record.eg
D emerge/io/orion/orion-sensor.eg
D emerge/io/orion/orion-verify.eg
D emerge/io/package.json
D emerge/io/seam/seam-delivery.eg
```

82 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.7.0-r2 — snap-0104 — 2026-06-16 17:32:52

- Archive: `nexus-0104_2026-06-16_v0.7.0-r2_1.zip` (was `nexus-v0.7.0-1.zip`)
- SHA-256: `a143492006c4c899b369f074b25dcbc42cca974a092a29ee8c68ccd24167d3e6`, 3.5 MB, downloaded 2026-06-16 17:36:41
- Kind: full
- Commit: `eeb99dbc739e6a3e84261288c119de8bcac67a17`, tag `snap-0104`
- Files in archive: 633. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cli | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M cli/boot-systems.js
M cli/nexus-repl.js
M emerge-ide.js
M emerge/siso/index.js
M guardian/userscript-claude.js
M lib/version.js
M ui/home/index.html
```

