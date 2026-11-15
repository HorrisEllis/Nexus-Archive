# Nexus 0.0.3

| | |
|---|---|
| Built | 2026-06-01 13:53:02 → 2026-06-01 14:48:26 |
| Builds on the main line | 1 |
| Other archives filed here | 1 |
| Versions the builds claimed | 5.1.0 |
| Tag | `v0.0.3` → snap-0004 |
| Full file ledger | [LEDGER-0.0.3.csv](../ledger/LEDGER-0.0.3.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.3 — snap-0004 — 2026-06-01 13:53:02

- Archive: `nexus-0004_2026-06-01_v0.0.3_emerge-v510_declared-5.1.0.zip` (was `nexus-emerge-v510.zip`)
- SHA-256: `90338fe884a7e1a30d4935181f4b1172cabecc900729621cd63af456606723ef`, 0.1 MB, downloaded 2026-06-01 13:55:11
- Kind: full
- Claimed version: 5.1.0 (registry 5.1.0, file name none); filed under 0.0.3 to keep the line in order
- Commit: `15b789dbe135e42531074a4057e8faefadd6cc8a`, tag `snap-0004`
- Files in archive: 120. Changes against the build before it: **120 added, 0 modified, 156 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| patched | 0 | 0 | 134 |
| patched-guardian | 0 | 0 | 22 |
| userscript | 16 | 0 | 0 |
| foundation | 14 | 0 | 0 |
| guardian-ext | 12 | 0 | 0 |
| guardian-server | 9 | 0 | 0 |
| canvas | 9 | 0 | 0 |
| core | 7 | 0 | 0 |
| agents | 6 | 0 | 0 |
| memory | 6 | 0 | 0 |
| idearium | 5 | 0 | 0 |
| (root) | 5 | 0 | 0 |
| crystalball | 5 | 0 | 0 |
| cockpit | 5 | 0 | 0 |
| orion | 4 | 0 | 0 |
| system | 4 | 0 | 0 |
| seam | 3 | 0 | 0 |
| siphon | 3 | 0 | 0 |
| gate | 3 | 0 | 0 |
| automation | 2 | 0 | 0 |
| versionium | 2 | 0 | 0 |

```
A README.md
A agents/agent-base.eg
A agents/agent-chatgpt.eg
A agents/agent-claude.eg
A agents/agent-gemini.eg
A agents/agent-ollama.eg
A agents/agents-dispatcher.eg
A automation/automation-engine.eg
A automation/automation-queue.eg
A canvas/canvas-renderer.eg
A canvas/cfr-physics.eg
A canvas/cfr-render.eg
A canvas/cfr-rewind.eg
A canvas/image-analyzer.eg
A canvas/nas-router.eg
A canvas/node-inspector.eg
A canvas/rewind-scrubber.eg
A canvas/tauri-ws.eg
A cockpit/cockpit-cli.eg
A cockpit/cockpit-core.eg
A cockpit/cockpit-forge.eg
A cockpit/cockpit-pipeline.eg
A cockpit/cockpit-ui.eg
A core/manifest-generator.eg
A core/raid-core.eg
A core/raid-fallback.eg
A core/raid-learner.eg
A core/raid-weights.eg
A core/translation.eg
A core/usage.eg
A crystalball/bep-engine.eg
A crystalball/crystalball.eg
A crystalball/lattice-bridge.eg
A crystalball/mcl.eg
A crystalball/mql.eg
A emerge-cli.js
A emerge-kernel.js
A emerge.spec
A foundation/admin-server.eg
A foundation/bus-log.eg
A foundation/cobalt-bus.eg
A foundation/cobalt-ledger.eg
A foundation/cobalt-registry.eg
A foundation/cobalt-watchdog.eg
A foundation/file-refs.eg
A foundation/file-store.eg
A foundation/nano-ws.eg
A foundation/poll-registry.eg
A foundation/siso-event.eg
A foundation/siso-gate.eg
A foundation/siso-stream-log.eg
A foundation/siso-stream.eg
A gate/gap-finder.eg
A gate/gate-runner.eg
A gate/healer.eg
A guardian-ext/guardian-app.eg
A guardian-ext/guardian-background.eg
A guardian-ext/guardian-cfr.eg
A guardian-ext/guardian-content.eg
A guardian-ext/guardian-handshake.eg
A guardian-ext/guardian-ir-layer.eg
A guardian-ext/guardian-popup.eg
A guardian-ext/module-base.eg
A guardian-ext/module-chatgpt.eg
A guardian-ext/module-claude.eg
A guardian-ext/module-instagram.eg
A guardian-ext/module-threads.eg
A guardian-server/cobalt-bridge.eg
A guardian-server/guardian-agents.eg
A guardian-server/guardian-api-7820.eg
A guardian-server/guardian-cli.eg
A guardian-server/guardian-dropzone-7822.eg
A guardian-server/guardian-jaa.eg
A guardian-server/guardian-memory-7823.eg
A guardian-server/guardian-server.eg
A guardian-server/guardian-wss-7821.eg
A idearium/idearium-api.eg
A idearium/idearium-cli.eg
A idearium/idearium-core.eg
A idearium/idearium-event.eg
A idearium/idearium-gate.eg
A memory/agent-memory.eg
A memory/continuous-stream.eg
A memory/feedback-weighter.eg
A memory/fix-map.eg
A memory/jaa-db.eg
A memory/lattice-index.eg
A orion/orion-policy.eg
A orion/orion-record.eg
A orion/orion-sensor.eg
A orion/orion-verify.eg
A package.json
D patched-guardian/README.md
D patched-guardian/SPEC.md
D patched-guardian/agents/index.js
D patched-guardian/dropzone.js
D patched-guardian/gaurdian.md
D patched-guardian/guardian-api.js
D patched-guardian/guardian-cli.js
D patched-guardian/guardian-memory.js
D patched-guardian/guardian.config.json
D patched-guardian/jaa-store.js
D patched-guardian/memory_store/artifacts.json
D patched-guardian/memory_store/downloads.json
D patched-guardian/memory_store/jobs.json
D patched-guardian/memory_store/ledger_entries.json
D patched-guardian/memory_store/settings.json
D patched-guardian/package-lock.json
D patched-guardian/package.json
D patched-guardian/schema.sql
D patched-guardian/server-v9.js
D patched-guardian/server.js
D patched-guardian/userscript_chatgpt_v8.js
D patched-guardian/userscript_claude_v8.js
D patched/Nexus-Core/NEXUS-SPEC-v4.0-unified.md
D patched/Nexus-Core/NEXUS-SPEC-v4_1.md
D patched/Nexus-Core/admin/alignment.html
D patched/Nexus-Core/admin/diagnostics.js
D patched/Nexus-Core/admin/index.html
D patched/Nexus-Core/admin/pages/automation.html
D patched/Nexus-Core/admin/pages/guardian.html
D patched/Nexus-Core/admin/pages/memory.html
D patched/Nexus-Core/agents/base.js
D patched/Nexus-Core/agents/chatgpt/limits(3).js
D patched/Nexus-Core/agents/chatgpt/limits.js
D patched/Nexus-Core/agents/gemini/selectors.js
D patched/Nexus-Core/agents/gemini/urck.js
D patched/Nexus-Core/agents/index.js
D patched/Nexus-Core/agents/ollama/index.js
D patched/Nexus-Core/agents/selectors.js
D patched/Nexus-Core/automation/condition-evaluator.js
D patched/Nexus-Core/automation/engine.js
D patched/Nexus-Core/automation/step-executor.js
D patched/Nexus-Core/automation/variable-resolver.js
D patched/Nexus-Core/background.js
D patched/Nexus-Core/boot.js
D patched/Nexus-Core/canvas/spec-a/cfr-physics.js
D patched/Nexus-Core/canvas/spec-a/cfr-render.js
D patched/Nexus-Core/canvas/spec-a/cfr-rewind.js
D patched/Nexus-Core/canvas/spec-a/image-analyzer.js
D patched/Nexus-Core/canvas/spec-a/node-inspector.js
D patched/Nexus-Core/canvas/spec-a/renderer.js
D patched/Nexus-Core/canvas/spec-a/rewind-scrubber.js
D patched/Nexus-Core/canvas/spec-b/bridge/bus-to-cfr.js
D patched/Nexus-Core/cli.js
D patched/Nexus-Core/core/index.js
D patched/Nexus-Core/core/index/query.js
D patched/Nexus-Core/core/manifest/index.js
D patched/Nexus-Core/core/raid/fallback.js
D patched/Nexus-Core/core/raid/index.js
```

126 more (mostly data, logs and archived files) are in the ledger file.

### artifact — 0005 — 2026-06-01 14:48:26

- Archive: `nexus-0005_2026-06-01_v0.0.3-side_emerge-suite.zip` (was `nexus-emerge-suite.zip`)
- SHA-256: `1543815113d436019ff1fe167609d8f09f7f5c1c530e8048d6057e04429bde77`, 0.1 MB, downloaded 2026-06-01 15:16:13
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `e129ad1371d164073097892a0a7d4bf266251e77`, tag `snap-0005`
- Files in archive: 26. Changes against the build before it: **26 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0005_2026-06-01_unversioned_emerge-suite | 26 | 0 | 0 |

```
A nexus-0005_2026-06-01_unversioned_emerge-suite/emerge-ide.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/emerge-kernel.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/emerge.spec
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/alk-devtools.html
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/alk-gl.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/alk-kernel.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/cfr-mesh-bridge.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/index.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/physics.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/render.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/gcanvas/rewind.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/cockpit.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/emerge-ide.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/emerge-lsp.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/emerge-ollama.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/emerge-voice.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/guardian-cli.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/guardian-memory.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/guardian-server.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/guardian-userscript.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/idearium.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/nexus-core.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/io/versionium.eg
A nexus-0005_2026-06-01_unversioned_emerge-suite/src/ollama-runtime.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/src/siso.js
A nexus-0005_2026-06-01_unversioned_emerge-suite/ui/index.html
```

