# Nexus 0.60.96

**0.60.96 — 2026-10-16**

| | |
|---|---|
| Built | 2026-10-16 03:59:40 → 2026-10-16 03:59:40 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.96 |
| Tag | `v0.60.96` → snap-0756 |
| Full file ledger | [LEDGER-0.60.96.csv](../ledger/LEDGER-0.60.96.csv) |

## Release notes — `CHANGELOG-0.60.96.md`

Copied unchanged from the build.

### 0.60.96 — 2026-10-16

James: "okay the cos windows app?"

#### What was wrong (read in the run's log and in git)

- **The first build failed.** The COS Windows build (`.github/workflows/cos-app.yml`, on `windows-latest`) ran once,
  when PR #94 merged: run 38887590255. It failed in 50 seconds:
  - the version step printed `COS undefined`;
  - then electron-builder stopped with: `Please specify 'version' in the package.json`.
- **Root cause: `cos/app/version.js` was 0 bytes on main.**
  - At 0.60.89 it was written with 398 bytes (`version: '0.1.0'`).
  - At 0.60.90 it was emptied: a pure four-line deletion, a bad write. The same branch had already hit this once on
    `package.json`.
  - No test read the file, so every suite stayed green.
- **No other file is affected.** Scanning every tracked file for "empty now, had content in history" found only this
  one.

#### What changed

- `cos/app/version.js` restored exactly as written: COS **0.1.0**. It was never published (no `cos-v` tag exists).
- `scripts/build-cos-app.js` refuses a missing version and names the file.
- The workflow's first step fails with the same message, instead of failing later inside electron-builder.
- `tests/modules/test-cos-app-build.test.js`:
  - BD-07: the version module exports `x.y.z`, and the staged `package.json` carries it;
  - BD-08: staging refuses an empty version file, by name.

#### Proof

- test-cos-app-build 8/8.
- The other COS suites are green: store 13/13, switch 10/10, runtime 9/9, update 14/14, shell 12/12, UI 21/21,
  release-deliver 13/13, autopilot-idle 7/7.

#### Not proven

- **The exe itself:** the tray, the file dialog and drag-drop. The next run on `windows-latest` is the first that can
  build it. That run starts when this reaches main, because the workflow builds when `cos/app/version.js` changes there.

## Ledger

### Build 0.60.96 — snap-0756 — 2026-10-16 03:59:40

- Archive: `nexus-0756_2026-10-16_v0.60.96_claude-brave-cori-eczug1-1.zip` (was `Nexus-claude-brave-cori-eczug1-1.zip`)
- SHA-256: `c24ab98a4a2d1e59f3891ba50fcc7d0f6e5640f2b6923d4be32228922b32acbc`, 17.1 MB, downloaded 2026-10-16 04:00:34
- Kind: full
- Commit: `dc3b77768783b644f7c450f616b443ee636624d2`, tag `snap-0756`
- Files in archive: 5705. Changes against the build before it: **183 added, 119 modified, 212 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| eravos | 0 | 0 | 140 |
| data | 105 | 0 | 0 |
| ui | 0 | 13 | 67 |
| tests | 20 | 18 | 1 |
| (root) | 24 | 3 | 0 |
| docs | 6 | 16 | 3 |
| idearium | 4 | 18 | 0 |
| lib | 2 | 18 | 0 |
| cos | 14 | 1 | 0 |
| clear-glass | 5 | 4 | 0 |
| loom | 0 | 8 | 0 |
| cortex | 1 | 5 | 0 |
| orchestrator | 0 | 5 | 0 |
| hooks | 0 | 2 | 1 |
| scripts | 1 | 1 | 0 |
| guardian | 0 | 2 | 0 |
| .github | 1 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| skills | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
A .github/workflows/cos-app.yml
M .github/workflows/release.yml
M .gitignore
A CHANGELOG-0.60.73.md
A CHANGELOG-0.60.74.md
A CHANGELOG-0.60.75.md
A CHANGELOG-0.60.76.md
A CHANGELOG-0.60.77.md
A CHANGELOG-0.60.78.md
A CHANGELOG-0.60.79.md
A CHANGELOG-0.60.80.md
A CHANGELOG-0.60.81.md
A CHANGELOG-0.60.82.md
A CHANGELOG-0.60.83.md
A CHANGELOG-0.60.84.md
A CHANGELOG-0.60.85.md
A CHANGELOG-0.60.86.md
A CHANGELOG-0.60.87.md
A CHANGELOG-0.60.88.md
A CHANGELOG-0.60.89.md
A CHANGELOG-0.60.90.md
A CHANGELOG-0.60.91.md
A CHANGELOG-0.60.92.md
A CHANGELOG-0.60.93.md
A CHANGELOG-0.60.94.md
A CHANGELOG-0.60.95.md
A CHANGELOG-0.60.96.md
M clear-glass/renderer/guardian-picker.js
M clear-glass/renderer/library/sections/downloads.js
M clear-glass/src/automation/templates.js
A clear-glass/src/chats/crawler.js
A clear-glass/src/chats/ports.js
A clear-glass/src/chats/service.js
M clear-glass/src/ipc/bridge.js
A clear-glass/src/releases/deliver.js
A clear-glass/src/releases/service.js
M copilot/module-builder.js
M cortex/boot.js
M cortex/core/raid/contract-adapters.js
M cortex/core/raid/contract-intake.js
A cortex/core/raid/contract-trace.js
M cortex/core/raid/officiator.js
M cortex/spec/cortex.spec
A cos/app/cli.js
A cos/app/controller.js
A cos/app/desktop/icon.png
A cos/app/desktop/main.js
A cos/app/desktop/preload.js
A cos/app/desktop/ui/app.js
A cos/app/desktop/ui/index.html
A cos/app/desktop/ui/style.css
A cos/app/runtime.js
A cos/app/settings.js
A cos/app/shell.js
A cos/app/store.js
A cos/app/switch.js
A cos/app/version.js
M cos/spec/check-catalogue.spec
M diagnostic/nexus-diagnostic.js
M docs/2026-10-13-projects-raid-and-gates-phasemap.spec
M docs/2026-10-15-code-tab-run-state-phasemap.spec
M docs/2026-10-15-cos-app-phasemap.spec
M docs/2026-10-15-gate-held-work-phasemap.spec
M docs/2026-10-15-personal-chat-import-phasemap.spec
M docs/2026-10-15-pipeline-focus-phasemap.spec
M docs/2026-10-15-warp-builds-and-spec-framework-phasemap.spec
A docs/2026-10-16-agent-work-funnel-phasemap.spec
A docs/2026-10-16-cos-console-phasemap.spec
A docs/2026-10-16-durable-work-timeline-phasemap.spec
A docs/2026-10-16-eravos-removal-phasemap.spec
A docs/2026-10-16-intent-hat-agent-chain-phasemap.spec
A docs/2026-10-16-nexus-git-sync-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/atlases/architect-atlas.md
M docs/atlases/core-atlas.md
D docs/atlases/eravos-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/nexus-atlas.md
D docs/eravos-agnostic-canvas.spec
D docs/eravos.spec
M docs/mcp-claude-desktop-config.json
M docs/roadmap/2026-08-22-copilot-end-state-vision.md
M docs/warp.spec
D eravos/config.js
D eravos/output/.gitkeep
D eravos/registry-components.js
D eravos/schemas/index.js
D eravos/schemas/schema.capability
D eravos/schemas/schema.command
D eravos/schemas/schema.component
D eravos/schemas/schema.hook
D eravos/schemas/schema.node
D eravos/schemas/schema.system
D eravos/schemas/schema.wire
D eravos/server.js
D eravos/spec/eravos.node-taxonomy.md
D eravos/spec/eravos.spec
D eravos/ui/bridge/nexus-bridge.js
D eravos/ui/catalog/catalog-ui.js
D eravos/ui/catalog/catalog.css
D eravos/ui/catalog/catalog.js
D eravos/ui/index.html
D eravos/ui/kernel/intake.js
D eravos/ui/kernel/kernel.js
D eravos/ui/manifest.json
D eravos/ui/mods/acid-synth/acid-synth.engine.js
D eravos/ui/mods/acid-synth/schema/schema.json
D eravos/ui/mods/bass-drop-builder/bass-drop-builder.engine.js
D eravos/ui/mods/bass-drop-builder/schema/schema.json
D eravos/ui/mods/channel/channel.engine.js
D eravos/ui/mods/channel/schema/schema.json
D eravos/ui/mods/contrast-analyser/contrast-analyser.engine.js
D eravos/ui/mods/contrast-analyser/schema/schema.json
D eravos/ui/mods/edm-lab/edm-lab.engine.js
D eravos/ui/mods/edm-lab/schema/schema.json
D eravos/ui/mods/lfo/lfo.engine.js
D eravos/ui/mods/lfo/schema/schema.json
D eravos/ui/mods/macro-automation/macro-automation.engine.js
D eravos/ui/mods/macro-automation/schema/schema.json
D eravos/ui/mods/master-fx/master-fx.engine.js
D eravos/ui/mods/master-fx/schema/schema.json
D eravos/ui/mods/nexus-architect/nexus-architect.engine.js
D eravos/ui/mods/nexus-architect/schema/schema.json
D eravos/ui/mods/nexus-bridge/nexus-bridge.engine.js
D eravos/ui/mods/nexus-bridge/schema/schema.json
D eravos/ui/mods/nexus-cortex/nexus-cortex.engine.js
D eravos/ui/mods/nexus-cortex/schema/schema.json
D eravos/ui/mods/nexus-diagnostic/nexus-diagnostic.engine.js
D eravos/ui/mods/nexus-diagnostic/schema/schema.json
D eravos/ui/mods/nexus-guardian/nexus-guardian.engine.js
D eravos/ui/mods/nexus-guardian/schema/schema.json
D eravos/ui/mods/nexus-idearium/nexus-idearium.engine.js
D eravos/ui/mods/nexus-idearium/schema/schema.json
D eravos/ui/mods/nexus-orchestrator/nexus-orchestrator.engine.js
D eravos/ui/mods/nexus-orchestrator/schema/schema.json
D eravos/ui/mods/nexus-shared/nexus-node-core.js
D eravos/ui/mods/pads/pads.engine.js
D eravos/ui/mods/pads/schema/schema.json
D eravos/ui/mods/photo-editor/photo-editor.engine.js
D eravos/ui/mods/photo-editor/schema/schema.json
D eravos/ui/mods/reese-bass/reese-bass.engine.js
D eravos/ui/mods/reese-bass/schema/schema.json
D eravos/ui/mods/sample-player/sample-player.engine.js
D eravos/ui/mods/sample-player/schema/schema.json
D eravos/ui/mods/sequencer/schema/schema.json
D eravos/ui/mods/sequencer/sequencer.engine.js
D eravos/ui/mods/serial-bridge/schema/schema.json
D eravos/ui/mods/serial-bridge/serial-bridge.engine.js
D eravos/ui/mods/sidechain-compressor/schema/schema.json
```

364 more (mostly data, logs and archived files) are in the ledger file.

