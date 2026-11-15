# Nexus 0.39.48

| | |
|---|---|
| Built | 2026-09-05 17:07:44 → 2026-09-05 17:07:44 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.48 |
| Tag | `v0.39.48` → snap-0498 |
| Full file ledger | [LEDGER-0.39.48.csv](../ledger/LEDGER-0.39.48.csv) |

## Ledger

### Build 0.39.48 — snap-0498 — 2026-09-05 17:07:44

- Archive: `nexus-0498_2026-09-05_v0.39.48_vnamed-0.39.48.zip` (was `nexus-v0.39.48.zip`)
- SHA-256: `31833fc1832f46dd1321ad77d54bdb30a68962f8b070bc4c48b85e39391b21e9`, 66.9 MB, downloaded 2026-09-05 17:10:23
- Kind: full
- Commit: `8ab95ac8e790cb886632af80a9dbb59452ff421b`, tag `snap-0498`
- Left out: embedded .git (4043 files, HEAD 906b6c56ebeed992a7b131d53eab0d2af8fad8c3 (master))
- Left out: node_modules (55 files)
- Files in archive: 4259. Changes against the build before it: **2020 added, 59 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1128 | 2 | 0 |
| data | 504 | 0 | 0 |
| idearium | 281 | 10 | 0 |
| lib | 23 | 6 | 0 |
| tests | 23 | 2 | 2 |
| clear-glass | 18 | 6 | 0 |
| guardian | 11 | 9 | 0 |
| mesh | 14 | 0 | 0 |
| ollama | 1 | 10 | 0 |
| loom | 5 | 4 | 0 |
| docs | 4 | 1 | 0 |
| nexus | 4 | 0 | 0 |
| (root) | 0 | 4 | 0 |
| bridge | 1 | 2 | 0 |
| ui | 3 | 0 | 0 |
| versionium | 0 | 1 | 1 |
| copilot | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| scripts | 0 | 0 | 1 |

```
M CHANGELOG.md
A bridge/lib/command-index-extract.js
M bridge/server.js
M bridge/spec/bridge.spec
M clear-glass/package.json
M clear-glass/spec/clear-glass.spec
M clear-glass/src/core/bus.js
A clear-glass/src/downloads/intake-bridge.js
M clear-glass/src/main/index.js
A clear-glass/src/network/canvas-persistence.js
A clear-glass/src/network/config.js
A clear-glass/src/network/crypto-engine.js
A clear-glass/src/network/daemons.js
A clear-glass/src/network/ddns.js
A clear-glass/src/network/dns-server.js
A clear-glass/src/network/firewall.js
A clear-glass/src/network/host-rotation.js
A clear-glass/src/network/install.js
A clear-glass/src/network/key-manager.js
A clear-glass/src/network/network-snr-filter.js
A clear-glass/src/network/port-registry.js
A clear-glass/src/network/reverse-proxy.js
A clear-glass/src/network/routes.js
M clear-glass/src/providers/host.js
M clear-glass/src/userscripts/manager.js
A clear-glass/test/downloads-intake-bridge.test.js
A clear-glass/test/network-install.test.js
A clear-glass/test/userscripts-manifest.test.js
M copilot/spec/copilot.spec
M cortex/core/raid/contract-intake.js
M cortex/spec/cortex.spec
M docs/2026-09-02-nexus-vision-master-phasemap.spec
A docs/brainos-live-control-panel.spec
A docs/command-index-per-system.spec
A docs/nexus-nerve-design-philosophy.spec
A docs/universal-block-primitive.spec
M guardian/agents/index.js
M guardian/clear-glass-bridge.js
A guardian/lib/artifact-namer.js
A guardian/lib/command-index-extract.js
A guardian/lib/dispatch-pool-bridge.js
A guardian/lib/dispatcher.js
A guardian/lib/index.js
A guardian/lib/jobs.js
A guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
A guardian/lib/provider-routing.js
A guardian/routes/autonomous-loop.js
A guardian/routes/mesh.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
A guardian/userscripts.yaml
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/index.js
A idearium/lib/guardian-stream.cjs
M idearium/package.json
M idearium/repo/index.js
A idearium/spec-engine/blocks.yaml
M idearium/spec-engine/chunk-dispatch.js
M idearium/spec-engine/index.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M lib/agent-tools/tools/execution/run-closed-loop.js
M lib/autonomous-loop.js
A lib/dynamic-project-parser.js
M lib/hat-forge.js
M lib/intake.js
M lib/intent-classifier.js
M lib/loom-map.js
A lib/node-export.js
A lib/node-schemas.js
A lib/node-schemas/agent.js
A lib/node-schemas/command.js
A lib/node-schemas/component.js
A lib/node-schemas/contract.js
A lib/node-schemas/cos.js
A lib/node-schemas/crystal.js
A lib/node-schemas/failure_mode.js
A lib/node-schemas/gap.js
A lib/node-schemas/hat.js
A lib/node-schemas/idea.js
A lib/node-schemas/ledger.js
A lib/node-schemas/macro.js
A lib/node-schemas/model.js
A lib/node-schemas/node.js
A lib/node-schemas/pat.js
A lib/node-schemas/schema.js
A lib/node-schemas/tool.js
A lib/project-compartment.js
A lib/self-build-loop.js
A lib/spec-from-markdown.js
M loom/maps/session-2026-08-14-map.js
A loom/schema/component.js
A loom/schema/concern.js
M loom/schema/definitions.js
A loom/schema/hook.js
A loom/schema/seam.js
A loom/schema/wire.js
M loom/spec/loom.spec
A mesh/README.md
A mesh/config.js
A mesh/daemons.js
A mesh/install.js
A mesh/lib/canvas-persistence.js
A mesh/lib/crypto-engine.js
A mesh/lib/ddns.js
A mesh/lib/dns-server.js
A mesh/lib/firewall.js
A mesh/lib/host-rotation.js
A mesh/lib/key-manager.js
A mesh/lib/mesh-snr-filter.js
A mesh/lib/port-registry.js
A mesh/lib/reverse-proxy.js
A nexus/ui/brainos/brainos-canvas.js
A nexus/ui/brainos/brainos-interaction-contract.json
A nexus/ui/brainos/brainos.css
A nexus/ui/brainos/brainos.js
M ollama/abliterated-catalog.js
M ollama/config.js
A ollama/lib/command-index.js
M ollama/routes/jobs.js
M ollama/routes/models.js
M ollama/routes/queue.js
M ollama/routes/stream.js
M ollama/routes/system.js
M ollama/routes/uploads.js
M ollama/server.js
M ollama/spec/ollama.spec
M orchestrator/spec/orchestrator.spec
M package-lock.json
M package.json
D scripts/post-commit-history-writer.js
A tests/loom-schema-split.test.js
A tests/modules/brainos-canvas.test.js
A tests/modules/brainos-panel-canvas-integration.test.js
A tests/modules/brainos-panel.test.js
A tests/modules/bridge-command-index.test.js
M tests/modules/contract-intake-dependency-graph.test.js
A tests/modules/guardian-command-index.test.js
A tests/modules/idearium-agent-routing.test.mjs
A tests/modules/idearium-phase-compartment-integration.test.js
A tests/modules/idearium-phase-compartment.test.mjs
A tests/modules/idearium-phase-sync.test.mjs
A tests/modules/ollama-command-index.test.js
```

1933 more (mostly data, logs and archived files) are in the ledger file.

