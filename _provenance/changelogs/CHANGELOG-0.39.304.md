# Nexus 0.39.304

**0.39.304 — 2026-10-02**

| | |
|---|---|
| Built | 2026-10-02 08:29:34 → 2026-10-02 13:13:42 |
| Builds on the main line | 3 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.304 |
| Tag | `v0.39.304` → snap-0726 |
| Full file ledger | [LEDGER-0.39.304.csv](../ledger/LEDGER-0.39.304.csv) |

## Release notes — `CHANGELOG-0.39.304.md`

Copied unchanged from the build.

### 0.39.304 — 2026-10-02

James: "get ollama solid. i need this done."
James: "can we just have the files grey until they are actual js files?"

#### Every phase that names files can now be proven
**Before:** no phase in the maps declared `conditions:`, so every phase run read "no-proof" and Ollama never got feedback.

**Now:** a phase that declares no conditions is checked against what it *does* declare, its `files:`:
- **each file must exist;**
- **each JavaScript file must be real, working JS:** it has to pass `node --check`.

Broken JS counts as unmet, and its error goes back to Ollama as the next attempt's feedback. A file counts only once it's actual, valid JavaScript.

**Proof:** `tests/modules/test-phase-proof.test.js` passes **7/7**. The new case, PP-07, has a stand-in agent write broken JS: the run reads unproven, with the syntax check named as the unmet promise. When the agent writes valid JS, the run reads proven.

## Ledger

### Build 0.39.304-r1 — snap-0724 — 2026-10-02 08:29:34

- Archive: `nexus-0724_2026-10-02_v0.39.304-r1_main-19.zip` (was `Nexus-main-19.zip`)
- SHA-256: `5c450f5d133ff5d69727fd9577e617d4901c0a3465aeafcc50473fc4420fda0c`, 13.9 MB, downloaded 2026-10-02 08:29:57
- Kind: full
- Commit: `ab218cb034dc8bbe135e3a383bebfe7cc287c11d`, tag `snap-0724`
- Files in archive: 5069. Changes against the build before it: **25 added, 132 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 11 | 115 | 0 |
| idearium | 2 | 5 | 0 |
| tests | 4 | 2 | 0 |
| (root) | 4 | 1 | 0 |
| docs | 1 | 4 | 0 |
| loom | 1 | 3 | 0 |
| lib | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| contracts | 1 | 0 | 0 |

```
A CHANGELOG-0.39.301.md
A CHANGELOG-0.39.302.md
A CHANGELOG-0.39.303.md
A CHANGELOG-0.39.304.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/settings/sections/autofill.css
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/spec/clear-glass.spec
A clear-glass/src/autofill/gig.js
M clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
M cli/nexus.js
A contracts/event-contract-baseline.json
A docs/2026-10-02-emerge-field-memory-build-phasemap.spec
M docs/2026-10-02-workshop-codex-rewind-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/clear-glass-atlas.md
M docs/atlases/idearium-atlas.md
M idearium/api/index.js
M idearium/cli/index.js
A idearium/event-taxonomy.cjs
M idearium/index.js
M idearium/package.json
A idearium/repo/proof-run.js
M idearium/spec/idearium.spec
A lib/event-contract-check.js
M lib/version.js
M loom/maps/copilot-capability-map.js
M loom/maps/one-idearium-map.js
M package.json
A tests/modules/clear-glass-gig.test.js
M tests/modules/run-all.js
A tests/modules/test-event-contracts.test.js
A tests/modules/test-phase-proof.test.js
A tests/modules/test-proof-run.test.js
M tests/modules/test-spec-library.test.js
```

117 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.304-r2 — snap-0725 — 2026-10-02 11:28:56

- Archive: `nexus-0725_2026-10-02_v0.39.304-r2_main-20.zip` (was `Nexus-main-20.zip`)
- SHA-256: `6b1b55e20edeed260f7118ca84ff944f48dbe115b55d8c5de744f045103f4537`, 14 MB, downloaded 2026-10-02 11:36:05
- Kind: full
- Commit: `0e9a5cec31b2f7ddb4d0c34bf9da7066e66e3f15`, tag `snap-0725`
- Files in archive: 5076. Changes against the build before it: **7 added, 19 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1 | 5 | 0 |
| tests | 1 | 3 | 0 |
| cos | 1 | 2 | 0 |
| idearium | 0 | 3 | 0 |
| docs | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| contracts | 0 | 1 | 0 |
| copilot | 1 | 0 | 0 |
| cortex | 1 | 0 | 0 |
| emerge | 1 | 0 | 0 |
| intelligence | 1 | 0 | 0 |
| versionium | 0 | 1 | 0 |

```
M contracts/event-contract-baseline.json
A copilot/event-taxonomy.js
A cortex/event-taxonomy.js
A cos/event-taxonomy.js
M cos/foundation/event-contracts.js
M cos/playground/llm-lab.js
M docs/2026-10-02-emerge-field-memory-build-phasemap.spec
M docs/SPEC-REGISTRY.spec
A emerge/event-taxonomy.js
M idearium/api/index.js
M idearium/event-taxonomy.cjs
M idearium/ui/js/app.js
A intelligence/event-taxonomy.js
M lib/agent-providers.js
A lib/claude-code-backend.js
M lib/economy/ledger.js
M lib/economy/store.js
M lib/event-contract-check.js
M lib/repo-agent.js
M loom/data/events.json
M loom/data/registry.json
M tests/modules/run-all.js
A tests/modules/test-claude-code-backend.test.js
M tests/modules/test-event-contracts.test.js
M tests/modules/test-repo-agent-provider.js
M versionium/event-taxonomy.js
```

### Build 0.39.304-r3 — snap-0726 — 2026-10-02 13:13:42

- Archive: `nexus-0726_2026-10-02_v0.39.304-r3_main-21.zip` (was `Nexus-main-21.zip`)
- SHA-256: `e6c0b0176cbbf46c0af8564ac4153abe36b4028db20dea80e2ca8824ce5e8a0b`, 14 MB, downloaded 2026-10-04 12:58:31
- Kind: full
- Commit: `6706f925cc0842e62febd8de35b7bc41c34b7ef0`, tag `snap-0726`
- Files in archive: 5088. Changes against the build before it: **12 added, 23 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 6 | 2 | 0 |
| tests | 3 | 4 | 0 |
| lib | 2 | 2 | 0 |
| clear-glass | 0 | 3 | 0 |
| docs | 0 | 3 | 0 |
| loom | 0 | 3 | 0 |
| orchestrator | 0 | 3 | 0 |
| intelligence | 0 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |

```
A .mcp.json
M clear-glass/src/event-taxonomy.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/registry.js
M cli/nexus.js
M docs/2026-10-02-emerge-field-memory-build-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/guardian.spec
A guardian/data/nodes/provider/chatgpt.provider
A guardian/data/nodes/provider/claude.provider
A guardian/data/nodes/provider/deepseek.provider
A guardian/data/nodes/provider/gemini.provider
A guardian/data/nodes/provider/perplexity.provider
A guardian/lib/agent-facts.js
M guardian/lib/node-registry.js
M guardian/server.js
M intelligence/synthesis/engine.js
M intelligence/synthesis/sources.js
A lib/agent-facts-hash.js
M lib/claude-code-backend.js
M lib/node-export.js
A lib/node-schemas/schema.provider
M loom/data/events.json
M loom/data/registry.json
M loom/scanners/phasemap-map.js
M orchestrator/lib/mcp-server.js
M orchestrator/lib/mcp-stdio.js
M orchestrator/lib/mcp-tools-tokensave.js
M tests/modules/run-all.js
A tests/modules/test-agent-facts.test.js
M tests/modules/test-agent-mesh-guardian-coverage.js
M tests/modules/test-loom-phasemap.js
M tests/modules/test-moce-roadmap.js
A tests/modules/test-nexus-mcp.test.js
A tests/modules/test-synthesis-declared-value.test.js
```

### identical — 0727 — 2026-10-02 13:13:42

- Archive: `nexus-0727_2026-10-02_v0.39.304-r3_claude-vibrant-edison-n2f9es_same-as-0726.zip` (was `Nexus-claude-vibrant-edison-n2f9es.zip`)
- SHA-256: `3ad5351f71efb70d92e9d74ca21f8bef71e81d1bc9f49468a7cba427c98aaff5`, 14.3 MB, downloaded 2026-10-05 14:57:26
- Kind: identical (same tree as snap-0726; no commit)

