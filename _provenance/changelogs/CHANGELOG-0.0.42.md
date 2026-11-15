# Nexus 0.0.42

| | |
|---|---|
| Built | 2026-06-08 21:42:28 → 2026-06-08 21:42:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 1.0.0 |
| Tag | `v0.0.42` → snap-0045 |
| Full file ledger | [LEDGER-0.0.42.csv](../ledger/LEDGER-0.0.42.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.42 — snap-0045 — 2026-06-08 21:42:28

- Archive: `nexus-0045_2026-06-08_v0.0.42_complete-3_declared-1.0.0.zip` (was `nexus-complete (3).zip`)
- SHA-256: `36eddfd4e5e2f500225cada67110d964e10afa8c97634e2416a4ead382d99930`, 2.6 MB, downloaded 2026-06-08 21:47:54
- Kind: full
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.0.42 to keep the line in order
- Commit: `f12e793232ae767abb94767a0791b2ee12f42351`, tag `snap-0045`
- Files in archive: 645. Changes against the build before it: **0 added, 0 modified, 429 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-final | 0 | 0 | 429 |

```
D nexus-final/MANIFEST.json
D nexus-final/README.md
D nexus-final/START.md
D nexus-final/bridge/interaction-contract.json
D nexus-final/bridge/nexus-bridge.js
D nexus-final/bridge/ui/index.html
D nexus-final/cli/diagnose.js
D nexus-final/cli/nexus-repl.js
D nexus-final/cli/nexus.js
D nexus-final/cockpit/cli.js
D nexus-final/cockpit/cockpit.spec
D nexus-final/cockpit/core.js
D nexus-final/cockpit/forge.js
D nexus-final/cockpit/pipeline.js
D nexus-final/cortex/agents/claude/index.js
D nexus-final/cortex/agents/index.js
D nexus-final/cortex/agents/ollama/index.js
D nexus-final/cortex/automation/engine.js
D nexus-final/cortex/automation/queue-manager.js
D nexus-final/cortex/boot.js
D nexus-final/cortex/cobalt.manifest.json
D nexus-final/cortex/core/raid/index.js
D nexus-final/cortex/cortex-v2.js
D nexus-final/cortex/cortex.js
D nexus-final/cortex/ess-gap-engine.js
D nexus-final/cortex/foundation/admin-server.js
D nexus-final/cortex/foundation/bus-log.js
D nexus-final/cortex/foundation/cobalt-core.js
D nexus-final/cortex/foundation/poll-registry.js
D nexus-final/cortex/foundation/siso/Event.js
D nexus-final/cortex/foundation/siso/Gate.js
D nexus-final/cortex/foundation/siso/Stream.js
D nexus-final/cortex/foundation/siso/StreamLog.js
D nexus-final/cortex/foundation/siso/index.js
D nexus-final/cortex/foundation/store/FileRefs.js
D nexus-final/cortex/foundation/store/FileStore.js
D nexus-final/cortex/gate/gap-finder.js
D nexus-final/cortex/healer/index.js
D nexus-final/cortex/interaction-contract.json
D nexus-final/cortex/memory/agent-memory.js
D nexus-final/cortex/memory/jaa-db.js
D nexus-final/cortex/nas/router.js
D nexus-final/cortex/orion/policy.js
D nexus-final/cortex/orion/record.js
D nexus-final/cortex/orion/sensor.js
D nexus-final/cortex/orion/verify.js
D nexus-final/cortex/ui/index.html
D nexus-final/cortex/versionium/causality.js
D nexus-final/cortex/versionium/index.js
D nexus-final/cos/kernel.js
D nexus-final/cos/manager.js
D nexus-final/docs/ARCHITECTURE.md
D nexus-final/docs/AXIOMS-v1.0.md
D nexus-final/docs/CLI.md
D nexus-final/docs/HANDOFF.md
D nexus-final/docs/INTERACTION_CONTRACTS.md
D nexus-final/docs/NEXUS-SPEC.md
D nexus-final/docs/NEXUS.md
D nexus-final/docs/SCHEMA.md
D nexus-final/docs/nexus.spec
D nexus-final/docs/specs/CAUSAL-NEXUS.spec.md
D nexus-final/docs/specs/COBALT-CORE.spec.md
D nexus-final/docs/specs/CONTROL-PANEL.spec.md
D nexus-final/docs/specs/CORTEX.spec.md
D nexus-final/docs/specs/GUARDIAN.spec.md
D nexus-final/docs/specs/IDEARIUM.spec.md
D nexus-final/docs/specs/MODULES.spec.md
D nexus-final/docs/specs/NEXUS-SELF.spec.md
D nexus-final/docs/specs/ORCHESTRATOR-COS.spec.md
D nexus-final/docs/specs/SYSTEM-MAP.spec.md
D nexus-final/docs/specs/VERSIONIUM.spec.md
D nexus-final/emerge-ide.js
D nexus-final/emerge-kernel.js
D nexus-final/emerge.spec
D nexus-final/emerge/emerge-ide.js
D nexus-final/emerge/emerge-kernel.js
D nexus-final/emerge/emerge.spec
D nexus-final/emerge/interaction-contract.json
D nexus-final/emerge/io/README.md
D nexus-final/emerge/io/agents/agent-base.eg
D nexus-final/emerge/io/agents/agent-chatgpt.eg
D nexus-final/emerge/io/agents/agent-claude.eg
D nexus-final/emerge/io/agents/agent-gemini.eg
D nexus-final/emerge/io/agents/agent-ollama.eg
D nexus-final/emerge/io/agents/agents-dispatcher.eg
D nexus-final/emerge/io/automation/automation-engine.eg
D nexus-final/emerge/io/automation/automation-queue.eg
D nexus-final/emerge/io/canvas/canvas-renderer.eg
D nexus-final/emerge/io/canvas/cfr-physics.eg
D nexus-final/emerge/io/canvas/cfr-render.eg
D nexus-final/emerge/io/canvas/cfr-rewind.eg
D nexus-final/emerge/io/canvas/image-analyzer.eg
D nexus-final/emerge/io/canvas/nas-router.eg
D nexus-final/emerge/io/canvas/node-inspector.eg
D nexus-final/emerge/io/canvas/rewind-scrubber.eg
D nexus-final/emerge/io/canvas/tauri-ws.eg
D nexus-final/emerge/io/cockpit.eg
D nexus-final/emerge/io/cockpit/cockpit-cli.eg
D nexus-final/emerge/io/cockpit/cockpit-core.eg
D nexus-final/emerge/io/cockpit/cockpit-forge.eg
D nexus-final/emerge/io/cockpit/cockpit-pipeline.eg
D nexus-final/emerge/io/cockpit/cockpit-ui.eg
D nexus-final/emerge/io/core/manifest-generator.eg
D nexus-final/emerge/io/core/raid-core.eg
D nexus-final/emerge/io/core/raid-fallback.eg
D nexus-final/emerge/io/core/raid-learner.eg
D nexus-final/emerge/io/core/raid-weights.eg
D nexus-final/emerge/io/core/translation.eg
D nexus-final/emerge/io/core/usage.eg
D nexus-final/emerge/io/cortex.eg
D nexus-final/emerge/io/crystalball/bep-engine.eg
D nexus-final/emerge/io/crystalball/crystalball.eg
D nexus-final/emerge/io/crystalball/lattice-bridge.eg
D nexus-final/emerge/io/crystalball/mcl.eg
D nexus-final/emerge/io/crystalball/mql.eg
D nexus-final/emerge/io/emerge-cli.js
D nexus-final/emerge/io/emerge-ide.eg
D nexus-final/emerge/io/emerge-kernel.js
D nexus-final/emerge/io/emerge-lsp.eg
D nexus-final/emerge/io/emerge-ollama.eg
D nexus-final/emerge/io/emerge-voice.eg
D nexus-final/emerge/io/emerge.spec
D nexus-final/emerge/io/foundation/admin-server.eg
D nexus-final/emerge/io/foundation/bus-log.eg
D nexus-final/emerge/io/foundation/cobalt-bus.eg
D nexus-final/emerge/io/foundation/cobalt-ledger.eg
D nexus-final/emerge/io/foundation/cobalt-registry.eg
D nexus-final/emerge/io/foundation/cobalt-watchdog.eg
D nexus-final/emerge/io/foundation/file-refs.eg
D nexus-final/emerge/io/foundation/file-store.eg
D nexus-final/emerge/io/foundation/nano-ws.eg
D nexus-final/emerge/io/foundation/poll-registry.eg
D nexus-final/emerge/io/foundation/siso-event.eg
D nexus-final/emerge/io/foundation/siso-gate.eg
D nexus-final/emerge/io/foundation/siso-stream-log.eg
D nexus-final/emerge/io/foundation/siso-stream.eg
D nexus-final/emerge/io/gate/gap-finder.eg
D nexus-final/emerge/io/gate/gate-runner.eg
D nexus-final/emerge/io/gate/healer.eg
D nexus-final/emerge/io/guardian-ext/guardian-app.eg
D nexus-final/emerge/io/guardian-ext/guardian-background.eg
D nexus-final/emerge/io/guardian-ext/guardian-cfr.eg
D nexus-final/emerge/io/guardian-ext/guardian-content.eg
D nexus-final/emerge/io/guardian-ext/guardian-handshake.eg
D nexus-final/emerge/io/guardian-ext/guardian-ir-layer.eg
D nexus-final/emerge/io/guardian-ext/guardian-popup.eg
D nexus-final/emerge/io/guardian-ext/module-base.eg
D nexus-final/emerge/io/guardian-ext/module-chatgpt.eg
D nexus-final/emerge/io/guardian-ext/module-claude.eg
D nexus-final/emerge/io/guardian-ext/module-instagram.eg
```

279 more (mostly data, logs and archived files) are in the ledger file.

