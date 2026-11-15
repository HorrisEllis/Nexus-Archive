# Nexus 0.0.4

| | |
|---|---|
| Built | 2026-06-01 15:30:28 → 2026-06-01 15:30:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.4` → snap-0006 |
| Full file ledger | [LEDGER-0.0.4.csv](../ledger/LEDGER-0.0.4.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.4 — snap-0006 — 2026-06-01 15:30:28

- Archive: `nexus-0006_2026-06-01_v0.0.4_v1_declared-1.0.0.zip` (was `nexus-v1.zip`)
- SHA-256: `5ad8ec67ed2ce2b8055a4f88ddc0900c7bcdcd286b64f0e413481ed83ce99b28`, 0.4 MB, downloaded 2026-06-01 15:31:23
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.4 to keep the line in order
- Commit: `cb276848ebe5629abd3274bfd286a6c1c906ab5a`, tag `snap-0006`
- Files in archive: 87. Changes against the build before it: **85 added, 2 modified, 118 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 31 | 0 | 0 |
| emerge | 16 | 0 | 0 |
| userscript | 0 | 0 | 16 |
| foundation | 0 | 0 | 14 |
| idearium | 8 | 0 | 5 |
| guardian-ext | 0 | 0 | 12 |
| cockpit | 5 | 0 | 5 |
| canvas | 0 | 0 | 9 |
| guardian-server | 0 | 0 | 9 |
| guardian | 8 | 0 | 0 |
| gcanvas | 8 | 0 | 0 |
| core | 0 | 0 | 7 |
| agents | 0 | 0 | 6 |
| memory | 0 | 0 | 6 |
| siso | 5 | 0 | 0 |
| (root) | 0 | 2 | 3 |
| crystalball | 0 | 0 | 5 |
| orion | 0 | 0 | 4 |
| system | 0 | 0 | 4 |
| seam | 0 | 0 | 3 |
| siphon | 0 | 0 | 3 |
| gate | 0 | 0 | 3 |
| jaa | 2 | 0 | 0 |
| automation | 0 | 0 | 2 |
| ui | 2 | 0 | 0 |
| versionium | 0 | 0 | 2 |

```
M README.md
D agents/agent-base.eg
D agents/agent-chatgpt.eg
D agents/agent-claude.eg
D agents/agent-gemini.eg
D agents/agent-ollama.eg
D agents/agents-dispatcher.eg
D automation/automation-engine.eg
D automation/automation-queue.eg
D canvas/canvas-renderer.eg
D canvas/cfr-physics.eg
D canvas/cfr-render.eg
D canvas/cfr-rewind.eg
D canvas/image-analyzer.eg
D canvas/nas-router.eg
D canvas/node-inspector.eg
D canvas/rewind-scrubber.eg
D canvas/tauri-ws.eg
A cockpit/cli.js
D cockpit/cockpit-cli.eg
D cockpit/cockpit-core.eg
D cockpit/cockpit-forge.eg
D cockpit/cockpit-pipeline.eg
D cockpit/cockpit-ui.eg
A cockpit/cockpit.spec
A cockpit/core.js
A cockpit/forge.js
A cockpit/pipeline.js
D core/manifest-generator.eg
D core/raid-core.eg
D core/raid-fallback.eg
D core/raid-learner.eg
D core/raid-weights.eg
D core/translation.eg
D core/usage.eg
A cortex/agents/claude/index.js
A cortex/agents/index.js
A cortex/agents/ollama/index.js
A cortex/automation/engine.js
A cortex/automation/queue-manager.js
A cortex/boot.js
A cortex/cobalt.manifest.json
A cortex/core/raid/index.js
A cortex/cortex.js
A cortex/foundation/admin-server.js
A cortex/foundation/bus-log.js
A cortex/foundation/cobalt-core.js
A cortex/foundation/poll-registry.js
A cortex/foundation/siso/Event.js
A cortex/foundation/siso/Gate.js
A cortex/foundation/siso/Stream.js
A cortex/foundation/siso/StreamLog.js
A cortex/foundation/siso/index.js
A cortex/foundation/store/FileRefs.js
A cortex/foundation/store/FileStore.js
A cortex/gate/gap-finder.js
A cortex/healer/index.js
A cortex/memory/agent-memory.js
A cortex/memory/jaa-db.js
A cortex/nas/router.js
A cortex/orion/policy.js
A cortex/orion/record.js
A cortex/orion/sensor.js
A cortex/orion/verify.js
A cortex/versionium/causality.js
A cortex/versionium/index.js
D crystalball/bep-engine.eg
D crystalball/crystalball.eg
D crystalball/lattice-bridge.eg
D crystalball/mcl.eg
D crystalball/mql.eg
D emerge-cli.js
D emerge-kernel.js
D emerge.spec
A emerge/emerge-ide.js
A emerge/emerge-kernel.js
A emerge/emerge.spec
A emerge/io/cockpit.eg
A emerge/io/cortex.eg
A emerge/io/emerge-ide.eg
A emerge/io/emerge-lsp.eg
A emerge/io/emerge-ollama.eg
A emerge/io/emerge-voice.eg
A emerge/io/gcanvas.eg
A emerge/io/guardian-server.eg
A emerge/io/guardian-userscript.eg
A emerge/io/idearium.eg
A emerge/io/versionium.eg
A emerge/ollama-runtime.js
A emerge/siso.js
D foundation/admin-server.eg
D foundation/bus-log.eg
D foundation/cobalt-bus.eg
D foundation/cobalt-ledger.eg
D foundation/cobalt-registry.eg
D foundation/cobalt-watchdog.eg
D foundation/file-refs.eg
D foundation/file-store.eg
D foundation/nano-ws.eg
D foundation/poll-registry.eg
D foundation/siso-event.eg
D foundation/siso-gate.eg
D foundation/siso-stream-log.eg
D foundation/siso-stream.eg
D gate/gap-finder.eg
D gate/gate-runner.eg
D gate/healer.eg
A gcanvas/alk-devtools.html
A gcanvas/alk-gl.js
A gcanvas/alk-kernel.js
A gcanvas/cfr-index.js
A gcanvas/cfr-mesh-bridge.js
A gcanvas/cfr-physics.js
A gcanvas/cfr-render.js
A gcanvas/cfr-rewind.js
D guardian-ext/guardian-app.eg
D guardian-ext/guardian-background.eg
D guardian-ext/guardian-cfr.eg
D guardian-ext/guardian-content.eg
D guardian-ext/guardian-handshake.eg
D guardian-ext/guardian-ir-layer.eg
D guardian-ext/guardian-popup.eg
D guardian-ext/module-base.eg
D guardian-ext/module-chatgpt.eg
D guardian-ext/module-claude.eg
D guardian-ext/module-instagram.eg
D guardian-ext/module-threads.eg
D guardian-server/cobalt-bridge.eg
D guardian-server/guardian-agents.eg
D guardian-server/guardian-api-7820.eg
D guardian-server/guardian-cli.eg
D guardian-server/guardian-dropzone-7822.eg
D guardian-server/guardian-jaa.eg
D guardian-server/guardian-memory-7823.eg
D guardian-server/guardian-server.eg
D guardian-server/guardian-wss-7821.eg
A guardian/agents/index.js
A guardian/cli.js
A guardian/dropzone.js
A guardian/jaa-store.js
A guardian/memory.js
A guardian/server.js
A guardian/userscript-chatgpt.js
A guardian/userscript-claude.js
A idearium/Event.js
A idearium/Gate.js
A idearium/Gate2.js
A idearium/api/index (2).js
A idearium/cli/index.js
A idearium/core/index.js
```

55 more (mostly data, logs and archived files) are in the ledger file.

