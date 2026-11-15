# Nexus 0.39.162

| | |
|---|---|
| Built | 2026-09-19 20:01:50 → 2026-09-19 20:01:50 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.162 |
| Tag | `v0.39.162` → snap-0615 |
| Full file ledger | [LEDGER-0.39.162.csv](../ledger/LEDGER-0.39.162.csv) |

## Ledger

### Build 0.39.162 — snap-0615 — 2026-09-19 20:01:50

- Archive: `nexus-0615_2026-09-19_v0.39.162.zip` (was `nexus-v0_39_162.zip`)
- SHA-256: `3fc7e606a989d14b5320d59d758dacd61387a524929d0fdae96b3ee16d1d4eed`, 118.4 MB, downloaded 2026-09-19 20:08:02
- Kind: full
- Commit: `a53bb400df1645e5ceff69246bf9c88e22acad8f`, tag `snap-0615`
- Left out: embedded .git (4990 files, HEAD 62f31c9ce8543a986fde9c47eb9caa4405564193 (master))
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4586. Changes against the build before it: **320 added, 56 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 97 | 13 | 1 |
| versionium | 90 | 0 | 0 |
| idearium | 58 | 6 | 0 |
| intelligence | 29 | 2 | 0 |
| lib | 11 | 7 | 0 |
| copilot | 11 | 3 | 0 |
| guardian | 5 | 7 | 0 |
| clear-glass | 3 | 8 | 0 |
| tests | 6 | 1 | 0 |
| docs | 2 | 3 | 0 |
| loom | 1 | 2 | 0 |
| cortex | 1 | 1 | 0 |
| ui | 2 | 0 | 0 |
| nexus | 2 | 0 | 0 |
| cli | 1 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| ollama | 1 | 0 | 0 |

```
A clear-glass/compartment.json
M clear-glass/spec/clear-glass.spec
A clear-glass/src/autofill/matcher.js
A clear-glass/src/autofill/store.js
M clear-glass/src/dom/archaeology.js
M clear-glass/src/downloads/artifact-chat-index.js
M clear-glass/src/gates/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
A cli/compartments.js
M cli/nexus-repl.js
A copilot/compartment.json
A copilot/lib/inject-config.js
A copilot/schemas/schema.inject_rule
M copilot/server.js
M copilot/spec/copilot.node-taxonomy.md
M copilot/spec/copilot.spec
A cortex/compartment.json
A docs/2026-09-19-agents-clearglass-guardian-idearium-copilot-phasemap.spec
A docs/HANDOFF-2026-09-19-merge-0.39.157.md
M docs/SPEC-REGISTRY.spec
M docs/nexus-repository-system-build-phasemap.spec
M docs/nexus-repository-system.spec
A guardian/compartment.json
M guardian/event-taxonomy.js
A guardian/input/7f8129c9-ec89-4768-95ef-c0a3448b5638.contract
A guardian/input/d3235712-2362-4a51-bb11-88ea255c3270.contract
A guardian/lib/code-artifact.js
M guardian/lib/jobs.js
M guardian/lib/ncp-handler.js
M guardian/lib/provider-routing.js
M guardian/server.js
A guardian/spec/guardian.code-artifact.spec
M guardian/spec/guardian.spec
M idearium/api/index.js
A idearium/compartment.json
A idearium/repo/graph.js
M idearium/repo/import-pipeline.js
M idearium/repo/index.js
A idearium/spec-engine/compiler-t0.js
M idearium/spec-engine/index.js
M idearium/spec-engine/warp-build-dispatch.js
A idearium/spec/idearium.repo-graph.spec
M idearium/spec/idearium.spec
A intelligence/compartment.json
M intelligence/registry-components.js
M intelligence/routes.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/accounts/account-manage.js
A lib/agent-tools/tools/autofill/autofill-manage.js
A lib/agent-tools/tools/bookmarks/bookmarks-manage.js
M lib/agent-tools/tools/browser/browser-action.js
A lib/agent-tools/tools/clear-glass/stream-bridge.js
A lib/agent-tools/tools/history/history-manage.js
M lib/agent-tools/tools/identity/hat-forge.js
A lib/agent-tools/tools/mesh/agent-mesh-route.js
A lib/agent-tools/tools/site-settings/site-settings-manage.js
A lib/clear-glass-stream-bridge.js
A lib/extract-code.js
M lib/hat-forge.js
M lib/hat-seed.js
A lib/languages.js
M lib/node-export.js
A lib/node-schemas/schema.inject_rule
M lib/version.js
A loom/compartment.json
M loom/maps/copilot-capability-map.js
M loom/scanners/phasemap-map.js
A ollama/compartment.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-code-artifact.js
A tests/modules/test-extract-code.js
A tests/modules/test-import-pipeline-syntax.js
A tests/modules/test-languages.js
A tests/modules/test-loom-phasemap-status.js
A tests/modules/test-repo-graph.js
A ui/library/index.html
A ui/library/library-app.css
A versionium/compartment.json
```

295 more (mostly data, logs and archived files) are in the ledger file.

