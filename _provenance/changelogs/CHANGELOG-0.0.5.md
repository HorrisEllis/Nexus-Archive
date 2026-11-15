# Nexus 0.0.5

| | |
|---|---|
| Built | 2026-06-01 15:35:16 → 2026-06-01 15:35:16 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.5` → snap-0007 |
| Full file ledger | [LEDGER-0.0.5.csv](../ledger/LEDGER-0.0.5.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.5 — snap-0007 — 2026-06-01 15:35:16

- Archive: `nexus-0007_2026-06-01_v0.0.5_v2_declared-1.0.0.zip` (was `nexus-v2.zip`)
- SHA-256: `b249ab0b6839f35545e1dd7bf6a7d13d2e425878e4da78e4b53ac69631149980`, 0.5 MB, downloaded 2026-06-01 15:35:56
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.5 to keep the line in order
- Commit: `053f476ca485be21302ad1c0c390a8e18a150858`, tag `snap-0007`
- Files in archive: 209. Changes against the build before it: **124 added, 2 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| emerge | 120 | 1 | 1 |
| idearium | 1 | 0 | 1 |
| (root) | 0 | 1 | 0 |
| guardian | 1 | 0 | 0 |
| jaa | 1 | 0 | 0 |
| seams | 1 | 0 | 0 |

```
M README.md
M emerge/emerge.spec
A emerge/io/README.md
A emerge/io/agents/agent-base.eg
A emerge/io/agents/agent-chatgpt.eg
A emerge/io/agents/agent-claude.eg
A emerge/io/agents/agent-gemini.eg
A emerge/io/agents/agent-ollama.eg
A emerge/io/agents/agents-dispatcher.eg
A emerge/io/automation/automation-engine.eg
A emerge/io/automation/automation-queue.eg
A emerge/io/canvas/canvas-renderer.eg
A emerge/io/canvas/cfr-physics.eg
A emerge/io/canvas/cfr-render.eg
A emerge/io/canvas/cfr-rewind.eg
A emerge/io/canvas/image-analyzer.eg
A emerge/io/canvas/nas-router.eg
A emerge/io/canvas/node-inspector.eg
A emerge/io/canvas/rewind-scrubber.eg
A emerge/io/canvas/tauri-ws.eg
A emerge/io/cockpit/cockpit-cli.eg
A emerge/io/cockpit/cockpit-core.eg
A emerge/io/cockpit/cockpit-forge.eg
A emerge/io/cockpit/cockpit-pipeline.eg
A emerge/io/cockpit/cockpit-ui.eg
A emerge/io/core/manifest-generator.eg
A emerge/io/core/raid-core.eg
A emerge/io/core/raid-fallback.eg
A emerge/io/core/raid-learner.eg
A emerge/io/core/raid-weights.eg
A emerge/io/core/translation.eg
A emerge/io/core/usage.eg
A emerge/io/crystalball/bep-engine.eg
A emerge/io/crystalball/crystalball.eg
A emerge/io/crystalball/lattice-bridge.eg
A emerge/io/crystalball/mcl.eg
A emerge/io/crystalball/mql.eg
A emerge/io/emerge-cli.js
A emerge/io/emerge-kernel.js
A emerge/io/emerge.spec
A emerge/io/foundation/admin-server.eg
A emerge/io/foundation/bus-log.eg
A emerge/io/foundation/cobalt-bus.eg
A emerge/io/foundation/cobalt-ledger.eg
A emerge/io/foundation/cobalt-registry.eg
A emerge/io/foundation/cobalt-watchdog.eg
A emerge/io/foundation/file-refs.eg
A emerge/io/foundation/file-store.eg
A emerge/io/foundation/nano-ws.eg
A emerge/io/foundation/poll-registry.eg
A emerge/io/foundation/siso-event.eg
A emerge/io/foundation/siso-gate.eg
A emerge/io/foundation/siso-stream-log.eg
A emerge/io/foundation/siso-stream.eg
A emerge/io/gate/gap-finder.eg
A emerge/io/gate/gate-runner.eg
A emerge/io/gate/healer.eg
A emerge/io/guardian-ext/guardian-app.eg
A emerge/io/guardian-ext/guardian-background.eg
A emerge/io/guardian-ext/guardian-cfr.eg
A emerge/io/guardian-ext/guardian-content.eg
A emerge/io/guardian-ext/guardian-handshake.eg
A emerge/io/guardian-ext/guardian-ir-layer.eg
A emerge/io/guardian-ext/guardian-popup.eg
A emerge/io/guardian-ext/module-base.eg
A emerge/io/guardian-ext/module-chatgpt.eg
A emerge/io/guardian-ext/module-claude.eg
A emerge/io/guardian-ext/module-instagram.eg
A emerge/io/guardian-ext/module-threads.eg
A emerge/io/guardian-server/cobalt-bridge.eg
A emerge/io/guardian-server/guardian-agents.eg
A emerge/io/guardian-server/guardian-api-7820.eg
A emerge/io/guardian-server/guardian-cli.eg
A emerge/io/guardian-server/guardian-dropzone-7822.eg
A emerge/io/guardian-server/guardian-jaa.eg
A emerge/io/guardian-server/guardian-memory-7823.eg
A emerge/io/guardian-server/guardian-server.eg
A emerge/io/guardian-server/guardian-wss-7821.eg
A emerge/io/idearium/idearium-api.eg
A emerge/io/idearium/idearium-cli.eg
A emerge/io/idearium/idearium-core.eg
A emerge/io/idearium/idearium-event.eg
A emerge/io/idearium/idearium-gate.eg
A emerge/io/memory/agent-memory.eg
A emerge/io/memory/continuous-stream.eg
A emerge/io/memory/feedback-weighter.eg
A emerge/io/memory/fix-map.eg
A emerge/io/memory/jaa-db.eg
A emerge/io/memory/lattice-index.eg
A emerge/io/orion/orion-policy.eg
A emerge/io/orion/orion-record.eg
A emerge/io/orion/orion-sensor.eg
A emerge/io/orion/orion-verify.eg
A emerge/io/package.json
A emerge/io/seam/seam-delivery.eg
A emerge/io/seam/seam-verdict-detector.eg
A emerge/io/seam/spec-parser.eg
A emerge/io/siphon/guardian-pulse.eg
A emerge/io/siphon/guardian-siphon.eg
A emerge/io/siphon/guardian-watchman.eg
A emerge/io/system/nexus-boot.eg
A emerge/io/system/nexus-data-flows.eg
A emerge/io/system/nexus-seam-contracts.eg
A emerge/io/system/nexus-system-topology.eg
A emerge/io/userscript/userscript-artifact-store.eg
A emerge/io/userscript/userscript-dom-scanner.eg
A emerge/io/userscript/userscript-download-intercept.eg
A emerge/io/userscript/userscript-gap-hunter.eg
A emerge/io/userscript/userscript-gates.eg
A emerge/io/userscript/userscript-greeting.eg
A emerge/io/userscript/userscript-gtci-inject.eg
A emerge/io/userscript/userscript-pa.eg
A emerge/io/userscript/userscript-queue.eg
A emerge/io/userscript/userscript-realtime-sync.eg
A emerge/io/userscript/userscript-seam-tab.eg
A emerge/io/userscript/userscript-siso-bus.eg
A emerge/io/userscript/userscript-snr-detector.eg
A emerge/io/userscript/userscript-tab-claim.eg
A emerge/io/userscript/userscript-tab-discovery.eg
A emerge/io/userscript/userscript-toast.eg
D emerge/io/versionium.eg
A emerge/io/versionium/versionium-causality.eg
A emerge/io/versionium/versionium.eg
A guardian/userscript-patch.js
D idearium/api/index (2).js
A idearium/api/index.js
A jaa/schema-full.sql
A seams/seam-contracts.js
```

