# Nexus 0.0.2

| | |
|---|---|
| Built | 2026-05-30 05:11:46 → 2026-06-01 13:06:06 |
| Builds on the main line | 1 |
| Other archives filed here | 1 |
| Versions the builds claimed | 5.1.0, 8.0.0 |
| Tag | `v0.0.2` → snap-0002 |
| Full file ledger | [LEDGER-0.0.2.csv](../ledger/LEDGER-0.0.2.csv) |

This build predates the 0.x numbering. `0.0.N` is its place in the order; the number it carried at the time is in the row above.

## Ledger

### Build 0.0.2 — snap-0002 — 2026-05-30 05:11:46

- Archive: `nexus-0002_2026-05-30_v0.0.2_core-patched_declared-8.0.0.zip` (was `Nexus-Core-patched.zip`)
- SHA-256: `4c2c27808288e514d6fe4a9f22421e8534363d5c3329a6fb6495488bdc0ca444`, 1.2 MB, downloaded 2026-05-30 05:13:49
- Kind: full
- Claimed version: 8.0.0 (registry 8.0.0, file name none); filed under 0.0.2 to keep the line in order
- Commit: `24bba20bcd71f7773df9a79223558341d7a67db6`, tag `snap-0002`
- Files in archive: 156. Changes against the build before it: **156 added, 0 modified, 12 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| patched | 134 | 0 | 0 |
| patched-guardian | 22 | 0 | 0 |
| __patches | 0 | 0 | 4 |
| guardian | 0 | 0 | 3 |
| (root) | 0 | 0 | 2 |
| schemas | 0 | 0 | 2 |
| agents | 0 | 0 | 1 |

```
D MANIFEST.md
D __patches/boot.js
D __patches/foundation--poll-registry.js
D __patches/guardian-v8--server.js
D __patches/memory--jaa-db.js
D agents/callto/index.js
D cockpit.html
D guardian/pulse.js
D guardian/siphon.js
D guardian/watchman.js
A patched-guardian/README.md
A patched-guardian/SPEC.md
A patched-guardian/agents/index.js
A patched-guardian/dropzone.js
A patched-guardian/gaurdian.md
A patched-guardian/guardian-api.js
A patched-guardian/guardian-cli.js
A patched-guardian/guardian-memory.js
A patched-guardian/guardian.config.json
A patched-guardian/jaa-store.js
A patched-guardian/memory_store/artifacts.json
A patched-guardian/memory_store/downloads.json
A patched-guardian/memory_store/jobs.json
A patched-guardian/memory_store/ledger_entries.json
A patched-guardian/memory_store/settings.json
A patched-guardian/package-lock.json
A patched-guardian/package.json
A patched-guardian/schema.sql
A patched-guardian/server-v9.js
A patched-guardian/server.js
A patched-guardian/userscript_chatgpt_v8.js
A patched-guardian/userscript_claude_v8.js
A patched/Nexus-Core/NEXUS-SPEC-v4.0-unified.md
A patched/Nexus-Core/NEXUS-SPEC-v4_1.md
A patched/Nexus-Core/admin/alignment.html
A patched/Nexus-Core/admin/diagnostics.js
A patched/Nexus-Core/admin/index.html
A patched/Nexus-Core/admin/pages/automation.html
A patched/Nexus-Core/admin/pages/guardian.html
A patched/Nexus-Core/admin/pages/memory.html
A patched/Nexus-Core/agents/base.js
A patched/Nexus-Core/agents/chatgpt/limits(3).js
A patched/Nexus-Core/agents/chatgpt/limits.js
A patched/Nexus-Core/agents/gemini/selectors.js
A patched/Nexus-Core/agents/gemini/urck.js
A patched/Nexus-Core/agents/index.js
A patched/Nexus-Core/agents/ollama/index.js
A patched/Nexus-Core/agents/selectors.js
A patched/Nexus-Core/automation/condition-evaluator.js
A patched/Nexus-Core/automation/engine.js
A patched/Nexus-Core/automation/step-executor.js
A patched/Nexus-Core/automation/variable-resolver.js
A patched/Nexus-Core/background.js
A patched/Nexus-Core/boot.js
A patched/Nexus-Core/canvas/spec-a/cfr-physics.js
A patched/Nexus-Core/canvas/spec-a/cfr-render.js
A patched/Nexus-Core/canvas/spec-a/cfr-rewind.js
A patched/Nexus-Core/canvas/spec-a/image-analyzer.js
A patched/Nexus-Core/canvas/spec-a/node-inspector.js
A patched/Nexus-Core/canvas/spec-a/renderer.js
A patched/Nexus-Core/canvas/spec-a/rewind-scrubber.js
A patched/Nexus-Core/canvas/spec-b/bridge/bus-to-cfr.js
A patched/Nexus-Core/cli.js
A patched/Nexus-Core/core/index.js
A patched/Nexus-Core/core/index/query.js
A patched/Nexus-Core/core/manifest/index.js
A patched/Nexus-Core/core/raid/fallback.js
A patched/Nexus-Core/core/raid/index.js
A patched/Nexus-Core/core/raid/learner.js
A patched/Nexus-Core/core/raid/weights.js
A patched/Nexus-Core/core/translation/alignment.js
A patched/Nexus-Core/core/translation/index.js
A patched/Nexus-Core/core/translation/learner.js
A patched/Nexus-Core/core/usage/index.js
A patched/Nexus-Core/crystalball/bep-engine.js
A patched/Nexus-Core/crystalball/index.js
A patched/Nexus-Core/crystalball/lattice-bridge.js
A patched/Nexus-Core/crystalball/mcl.js
A patched/Nexus-Core/crystalball/mql.js
A patched/Nexus-Core/crystalball/schema.json
A patched/Nexus-Core/crystalball/tests/crystalball.test.js
A patched/Nexus-Core/extension/background.js
A patched/Nexus-Core/extension/content-scripts/injector.js
A patched/Nexus-Core/extension/content-scripts/observer.js
A patched/Nexus-Core/extension/manifest.json
A patched/Nexus-Core/foundation/admin-server.js
A patched/Nexus-Core/foundation/kernel.js
A patched/Nexus-Core/foundation/nano-ws.js
A patched/Nexus-Core/foundation/siso.js
A patched/Nexus-Core/foundation/store/FileRefs.js
A patched/Nexus-Core/foundation/store/FileStore.js
A patched/Nexus-Core/foundation/validator.js
A patched/Nexus-Core/gate/gap-finder.js
A patched/Nexus-Core/gate/runner.js
A patched/Nexus-Core/guardian-api.js
A patched/Nexus-Core/guardian/ARCHIVED-v5.md
A patched/Nexus-Core/guardian/Guardian-v3.zip
A patched/Nexus-Core/guardian/Guardian-v4.zip
A patched/Nexus-Core/guardian/Guardian-v5-clean-2.zip
A patched/Nexus-Core/guardian/Guardian-v5-pulse-6.zip
A patched/Nexus-Core/guardian/Guardian-v5.zip
A patched/Nexus-Core/healer/index.js
A patched/Nexus-Core/memory/agent-memory.js
A patched/Nexus-Core/memory/continuous-stream.js
A patched/Nexus-Core/memory/feedback-weighter.js
A patched/Nexus-Core/memory/fix-map.js
A patched/Nexus-Core/memory/jaa-db.js
A patched/Nexus-Core/memory/lattice-index.js
A patched/Nexus-Core/package-lock.json
A patched/Nexus-Core/package.json
A patched/Nexus-Core/plugins/_example/index.js
A patched/Nexus-Core/plugins/_example/schema.json
A patched/Nexus-Core/schemas/behavior.gate-healer.json
A patched/Nexus-Core/schemas/behavior.schema.json
A patched/Nexus-Core/schemas/bep-pattern.schema.json
A patched/Nexus-Core/schemas/callto.schema.json
A patched/Nexus-Core/schemas/crystal.schema.json
A patched/Nexus-Core/schemas/event.schema.json
A patched/Nexus-Core/schemas/gap.schema.json
A patched/Nexus-Core/schemas/intent.schema.json
A patched/Nexus-Core/schemas/manifest.schema.json
A patched/Nexus-Core/schemas/module.gate.json
A patched/Nexus-Core/schemas/module.schema.json
A patched/Nexus-Core/schemas/plugin.schema.json
A patched/Nexus-Core/schemas/rewind.schema.json
A patched/Nexus-Core/schemas/schedule.schema.json
A patched/Nexus-Core/tauri/ws-server.js
A patched/Nexus-cortex/cortex-v2.js
A patched/nexus-idearium/QUICKSTART.md
A patched/nexus-idearium/cockpit.html
A patched/nexus-idearium/compartment/kernel.js
A patched/nexus-idearium/compartment/manager.js
A patched/nexus-idearium/guardian-api.js
A patched/nexus-idearium/idearium/api/index.js
A patched/nexus-idearium/idearium/cli/index.js
A patched/nexus-idearium/idearium/core/index.js
A patched/nexus-idearium/idearium/ide.html
A patched/nexus-idearium/idearium/package.json
A patched/nexus-idearium/index.js
A patched/nexus-idearium/nex/index.js
A patched/nexus-idearium/nexus.js
A patched/nexus-idearium/package-lock.json
A patched/nexus-idearium/package.json
A patched/nexus-idearium/schemas/guardian/artifact.schema.json
A patched/nexus-idearium/schemas/guardian/download.schema.json
A patched/nexus-idearium/schemas/guardian/gap.schema.json
A patched/nexus-idearium/schemas/guardian/job.schema.json
A patched/nexus-idearium/schemas/guardian/ledger-entry.schema.json
A patched/nexus-idearium/schemas/guardian/pa-session.schema.json
A patched/nexus-idearium/schemas/guardian/session.schema.json
```

18 more (mostly data, logs and archived files) are in the ledger file.

### artifact — 0003 — 2026-06-01 13:06:06

- Archive: `nexus-0003_2026-06-01_v0.0.2-side_system-v510_declared-5.1.0.zip` (was `nexus-system-v510.zip`)
- SHA-256: `a656b5ca38081b0b213554188d5fabb7ba45dd8045ad49fd634a70447983a5ea`, 0.1 MB, downloaded 2026-06-01 13:09:39
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 5.1.0 (registry 5.1.0, file name none); filed under 0.0.2 to keep the line in order
- Commit: `6d4c0b39d557bfe8b8a8a29a73ca65ee1ad16025`, tag `snap-0003`
- Files in archive: 22. Changes against the build before it: **22 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0003_2026-06-01_v5.1.0_system-v510 | 22 | 0 | 0 |

```
A nexus-0003_2026-06-01_v5.1.0_system-v510/README.md
A nexus-0003_2026-06-01_v5.1.0_system-v510/cli/nexus-cli.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/emerge-cli.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/emerge-kernel.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/emerge.spec
A nexus-0003_2026-06-01_v5.1.0_system-v510/guardian-v83-nexus-patch.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/cockpit-core.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/cockpit-forge.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/cockpit-pipeline.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/cortex.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/forge.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/guardian-bridge.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/guardian-extension.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/guardian-server-full.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/guardian-siphon.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/io/nexus-system.eg
A nexus-0003_2026-06-01_v5.1.0_system-v510/package.json
A nexus-0003_2026-06-01_v5.1.0_system-v510/schemas/schema.sql
A nexus-0003_2026-06-01_v5.1.0_system-v510/seams/seam-contracts.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/src/cortex-boot.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/src/guardian-server.js
A nexus-0003_2026-06-01_v5.1.0_system-v510/src/siso.js
```

