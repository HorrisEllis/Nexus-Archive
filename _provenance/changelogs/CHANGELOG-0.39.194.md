# Nexus 0.39.194

**NEXUS 0.39.194 — the compartment agent is handed the code it needs**

| | |
|---|---|
| Built | 2026-09-21 00:22:46 → 2026-09-21 01:32:26 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.194 |
| Tag | `v0.39.194` → snap-0633 |
| Full file ledger | [LEDGER-0.39.194.csv](../ledger/LEDGER-0.39.194.csv) |

## Release notes — `CHANGELOG-0.39.194.md`

Copied unchanged from the build.

### NEXUS 0.39.194 — the compartment agent is handed the code it needs

James: get the agents working, per compartment, with a repo hat that learns the project over time.
The models are small (0.6B–3B on a 4 GB GPU), and a small model is weakest at planning a lookup.
So the agent no longer has to look.

#### What changed
- **`lib/repo-context.js`** — dispatch-time retrieval from the repo's OWN chunk index. Question words
  (split inside camelCase/snake_case, stopwords dropped) are scored against each chunk's symbols, file
  path and body. Top matches go in the prompt with a **hard budget** (4 chunks, 3000 chars, 1200 per
  chunk; env-overridable), each labelled `file:lines · symbols · runtime proof: passed|failed|none|stale`
  (0.39.193's proof, marked stale when the chunk changed).
- **`lib/repo-agent.js`** — the prompt is now persona, then the retrieved code, then the question.
  The result and the exchange log record `context {chunkIds, files, chars, dropped, reason}`: which chunks
  the agent was given, so a later outcome can be tied to them. `noContext` and `contextOptions` override.
- The idearium route already passed `repoDir`, so `POST /api/repos/:uuid/agent/prompt` gets this now.

#### Guarantees, tested
- **Scope by construction:** an agent is only ever handed its own repo's code (asked for another repo's
  function by name: not in the prompt). A poisoned index pointing outside the repo reads nothing.
- **No match, no block:** a question that names nothing in the code adds nothing and records why. Nothing
  is invented.
- **`/api/agent/switch` still has zero calls** (the 0.39.188 constraint).

#### Verification
`test-repo-context` 16/16: real repos through the real pipeline, a stub copilot that records the prompt,
so the assertions are about what went over the wire. Existing agent suites still pass
(34 / 44 / 11 / 35). Registered in `run-all.js`.

#### Not verified / limits
- **Not run against a real copilot or a real ollama model.** Whether a 0.6B–3B model answers better with
  this block is the open question; nothing here measures it.
- Retrieval is keyword/symbol scoring, not semantic: it finds what a question **names**, and misses one
  that describes behaviour without naming anything. No call/dependency neighbours yet (the graph is
  file-level and not joined to chunks).
- The Agent tab does not show the retrieved context yet.
- **The hat still learns only from recorded corrections** (`RH.learn`). Nothing is learned automatically
  from how the agent is used. Which chunks were given for which question is now logged, which is what
  automatic learning would need.

#### About your screenshots
The `qwen3-abliterated` folder holds one file, `0.6b`, 981 bytes: that is the manifest (a small pointer
file); the weights are in `models\blobs`. So you have the 0.6B qwen3, the qwen2.5-coder family (tag not
shown) and deepseek-coder-v2 (tag not shown). `ollama list` gives the exact tags.

## Ledger

### Build 0.39.194-r1 — snap-0632 — 2026-09-21 00:22:46

- Archive: `nexus-0632_2026-09-21_v0.39.194-r1.zip` (was `Nexus_v0_39_194.zip`)
- SHA-256: `f750983a6af094ecb1e61ea9d6bcfb229c9ee934df55e24e2aaf0f35fd2ff25a`, 127.9 MB, downloaded 2026-09-21 00:41:30
- Kind: full
- Commit: `4c596d7607f7aa7d0d50da3eb437692450895520`, tag `snap-0632`
- Left out: embedded .git (5933 files, HEAD 475a67b572a4a4e6a05bfe353c5cf050fb7a6030 (master))
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4397. Changes against the build before it: **14 added, 23 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 3 | 9 | 0 |
| (root) | 5 | 3 | 0 |
| tests | 3 | 4 | 0 |
| idearium | 1 | 5 | 0 |
| guardian | 1 | 2 | 0 |
| ollama | 1 | 0 | 1 |

```
A CHANGELOG-0.39.190.md
A CHANGELOG-0.39.191.md
A CHANGELOG-0.39.192.md
A CHANGELOG-0.39.193.md
A CHANGELOG-0.39.194.md
M NODE-TAXONOMY.md
M guardian/lib/agent-model-nodes.js
M guardian/schemas/schema.agent
A guardian/schemas/schema.health
M idearium/api/index.js
M idearium/registry-components.js
M idearium/repo/index.js
A idearium/repo/runtime-proof.js
M idearium/repo/verify-lazy.js
M idearium/ui/js/app.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/idearium/repo-chunks.js
M lib/node-export.js
M lib/node-schemas/schema.agent
M lib/node-schemas/schema.agent_model
A lib/node-schemas/schema.health
M lib/node-schemas/schema.repo_agent
M lib/repo-agent-node.js
M lib/repo-agent.js
A lib/repo-context.js
M lib/repo-hat.js
M lib/version.js
D ollama/schemas/schema.agent
A ollama/schemas/schema.health
M package-lock.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-node-schemas.js
M tests/modules/test-repo-agent-node.js
A tests/modules/test-repo-chunks-tool.js
A tests/modules/test-repo-context.js
A tests/modules/test-runtime-proof.js
M tests/node-schemas-split.test.js
```

### Build 0.39.194-r2 — snap-0633 — 2026-09-21 01:32:26

- Archive: `nexus-0633_2026-09-21_v0.39.194-r2_idearium-stability-patch.zip` (was `nexus-idearium-stability-patch.zip`)
- SHA-256: `6dbf78b6fbfef4d63df587259cdacc9eb339e296d0e532aec832f546ec142177`, 0.2 MB, downloaded 2026-09-21 02:06:01
- Kind: overlay (a patch laid over the build before it)
- Commit: `a40a7ab986feb2d1a6885d45d6876ac1df8e8f4e`, tag `snap-0633`
- Files in archive: 8. Changes against the build before it: **2 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 1 | 5 | 0 |
| tests | 1 | 1 | 0 |

```
A idearium/CHANGES-2026-09-21.md
M idearium/api/index.js
M idearium/spec-engine/index.js
M idearium/test/ui-restructure.smoke.cjs
M idearium/ui/index.html
M idearium/ui/js/app.js
A tests/modules/idearium-ingest-stability.test.js
M tests/modules/run-all.js
```

