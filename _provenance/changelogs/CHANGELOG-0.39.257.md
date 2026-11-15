# Nexus 0.39.257

**NEXUS 0.39.257: the repo agent gets every tool; plain-language CLI; the graph in context**

| | |
|---|---|
| Built | 2026-09-25 20:09:08 → 2026-09-25 20:40:32 |
| Builds on the main line | 3 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.257 |
| Tag | `v0.39.257` → snap-0678 |
| Full file ledger | [LEDGER-0.39.257.csv](../ledger/LEDGER-0.39.257.csv) |

## Release notes — `CHANGELOG-0.39.257.md`

Copied unchanged from the build.

### NEXUS 0.39.257: the repo agent gets every tool; plain-language CLI; the graph in context

**Date:** 2026-09-26 · copilot 3.5.2 → 3.6.0 · idearium 4.6.1 → 4.7.0 · Versionium `vtm-fc71e0ef` (parent `vtm-d2b95239`, 0.39.256)

James: *"the toolscope for the agents tab. need the full capabilities, with the /help and tool awareness … debugging, using the intelligence system … context on by default and wire in the graph"*. Asked which tools: *"i want everything, at least for now."*

#### Changed
- **Tools.** Before this, the repo agent sent copilot a plain prompt, so it had no tools at all.
  - Ollama and browser-agent dispatches now run copilot's real tool loop (`/api/prompt` with `body.tools`).
  - Every tool (102) is allowed by default; `/scope project` narrows to the hat's own set. Either way it is enforced.
  - The hat is the agent's identity.
  - File tools work in the repo's own files (`lib/agent-tools/tool-root.js`), or in NEXUS with `where:"nexus"`.
  - Each tool call is shown under the answer.
- **CLI.** `/help` is regrouped in plain language, with aliases and a "did you mean" for typos. New: `/tools`, `/scope`, `/debug`, `/debug <question>`, `/graph`, `/run`, `/test`, `/diagnose`.
- **`/debug`** reports without a model: syntax, unresolved imports, recent failures, and the intelligence system (`intelligence_query`, `fault_log`, `diagnose`).
- **Graph.** A question that names no code gets the project map from `graph.json`. Matched code comes with how its files connect.
- **Copilot:**
  - `GET /api/tools/list` and `POST /api/tools/run` are new.
  - A failed tool-loop round is now a failure carrying its `jobId`, not the answer text.
  - lifeline no longer re-sends the prompt when a round fails.
  - `.injection` nodes are covered by the test sandbox.
- **Loom:** the new modules are seen with their consumers as wires by the source-map scanner; they enter the stored registry on its next bootstrap re-scan.

#### Tests
- **test-agent-tools-and-graph:** 13/13; 13 mutations, each caught.
- **Regression:** 32 suites run. test-repo-agent, test-repo-agent-provider and test-repo-context were updated for the intended changes.
- **Pre-existing, identical at HEAD:** copilot-provider-toggle T-012, test-node-schemas NS-003/012, repo-context "names a function", tool-guide T-001, user-model-everywhere T-005, work-queue WQ-016, lifeline T-004/005.
- **Tree:** restored and diffed to zero; the only data writes are the Versionium records.

#### Not done
- **Not proven live.**
- **0.39.258 is still to build:** learning from outcomes and corrections; COS/RAID for Run.

## Ledger

### Build 0.39.257-r1 — snap-0676 — 2026-09-25 20:09:08

- Archive: `nexus-0676_2026-09-25_v0.39.257-r1_final.zip` (was `Nexus_v0_39_257_final.zip`)
- SHA-256: `aca05808619eee65a99fd88d61c4904e2d864a76d1d8090ef71d9106a46b02a1`, 0 MB, downloaded 2026-09-25 20:23:03
- Kind: overlay (a patch laid over the build before it)
- Commit: `cf3862f37479385cf10c827cd90341adcfab466e`, tag `snap-0676`
- Files in archive: 1. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 1 | 0 |

```
M idearium/index.js
```

### Build 0.39.257-r2 — snap-0677 — 2026-09-25 20:11:00

- Archive: `nexus-0677_2026-09-25_v0.39.257-r2_changes.zip` (was `Nexus_v0_39_257_changes.zip`)
- SHA-256: `0be73f3bfdc348912eb537c516396988c5b57a7a280cde3e3cd80f3ff607588c`, 1.1 MB, downloaded 2026-09-25 20:12:42
- Kind: overlay (a patch laid over the build before it)
- Commit: `8ceeadab573bbc2d1218f35534b0bc9ed093ee8e`, tag `snap-0677`
- Files in archive: 76. Changes against the build before it: **14 added, 61 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 2 | 13 | 0 |
| tests | 5 | 8 | 0 |
| lib | 2 | 9 | 0 |
| clear-glass | 0 | 9 | 0 |
| (root) | 5 | 2 | 0 |
| copilot | 0 | 6 | 0 |
| idearium | 0 | 6 | 0 |
| docs | 0 | 5 | 0 |
| data | 0 | 3 | 0 |

```
A CHANGELOG-0.39.254.md
A CHANGELOG-0.39.255.md
A CHANGELOG-0.39.256.md
A CHANGELOG-0.39.257.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/library/sections/responses.css
M clear-glass/renderer/library/sections/responses.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/downloads/artifact-chat-index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M copilot/interaction-contract.json
M copilot/lifeline.js
M copilot/registry-components.js
M copilot/server.js
M copilot/spec/copilot.spec
M copilot/tool-runtime.js
M data/versionium/versionium_branches.json
M data/versionium/versionium_calendar.json
M data/versionium/versionium_commits.json
M docs/atlases/clear-glass-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/nexus-atlas.md
M guardian/ask.js
M guardian/interaction-contract.json
A guardian/lib/chat-transcripts.js
A guardian/lib/gate-trail.js
M guardian/lib/jobs.js
M guardian/lib/ncp-handler.js
M guardian/registry-components.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M guardian/userscripts.yaml
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/package.json
M idearium/registry-components.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M lib/agent-tools/index.js
A lib/agent-tools/tool-catalog.js
A lib/agent-tools/tool-root.js
M lib/agent-tools/tools/query/file-tree.js
M lib/agent-tools/tools/query/read-file.js
M lib/agent-tools/tools/query/search-files.js
M lib/chat-logger.js
M lib/repo-agent.js
M lib/repo-context.js
M lib/test-sandbox.js
M lib/version.js
A nexus-0.39.257.bundle
M package-lock.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-agent-feed.test.js
A tests/modules/test-agent-tools-and-graph.test.js
M tests/modules/test-cg-selector-assign.test.js
A tests/modules/test-chat-transcripts.test.js
A tests/modules/test-live-stream-and-gates.test.js
M tests/modules/test-repo-agent-provider.js
M tests/modules/test-repo-agent.js
M tests/modules/test-repo-context.js
M tests/modules/version-sync-and-registry.test.js
M tests/probe/clearglass-library-window.js
A tests/probe/live-stream-chromium.py
A tests/probe/transcript-push-chromium.py
```

### Build 0.39.257-r3 — snap-0678 — 2026-09-25 20:22:20

- Archive: `nexus-0678_2026-09-25_v0.39.257-r3_code.zip` (was `Nexus_v0_39_257_code.zip`)
- SHA-256: `a5a4cb9b801e1744e92c65d05386a70332ca610c50cd314f6793ecb1a1144a1d`, 26.7 MB, downloaded 2026-09-25 20:25:59
- Kind: full
- Commit: `8fe1e0222f05a598e8a7e3e8f43e722b1971f5c5`, tag `snap-0678`
- Left out: embedded .git (165 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (244 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4664. Changes against the build before it: **1 added, 0 modified, 727 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 726 |
| (root) | 0 | 0 | 1 |
| docs | 1 | 0 | 0 |

```
A docs/2026-09-26b-handoff.md
D nexus-0.39.257.bundle
```

726 more (mostly data, logs and archived files) are in the ledger file.

### identical — 0679 — 2026-09-25 20:40:32

- Archive: `nexus-0679_2026-09-25_v0.39.257-r3_repo_same-as-0678.zip` (was `Nexus_v0_39_257_repo.zip`)
- SHA-256: `2325cc24e70bebe2caa18832e5e17c847625bd53f56b43b57ad7f3e8e69f9945`, 80.7 MB, downloaded 2026-09-25 20:43:31
- Kind: identical (same tree as snap-0678; no commit)
- Left out: embedded .git (205 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (244 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`

