# Nexus 0.39.276

**NEXUS 0.39.276: the Code button's repo wears the original repo's hat**

| | |
|---|---|
| Built | 2026-09-28 18:01:52 → 2026-09-28 20:57:20 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.276 |
| Tag | `v0.39.276` → snap-0708 |
| Full file ledger | [LEDGER-0.39.276.csv](../ledger/LEDGER-0.39.276.csv) |

## Release notes — `CHANGELOG-0.39.276.md`

Copied unchanged from the build.

### NEXUS 0.39.276: the Code button's repo wears the original repo's hat

**Date:** 2026-09-28 · base: 0.39.275 · idearium 4.9.1 → 4.9.2 · PATCH: no new route

James: *"the code tab needs to use the same hat from the original repo. when you click code in the original spec, it creates a new repo, i need that repo to use the same hat. or maybe have another hat for the coder, linked to the original hat and repo, then have full agent settings in the original repo."*

#### What was wrong

Clicking Code on a spec (`speceng.codegen`, `idearium/api/index.js`) creates a code spec and a second repo for it. That repo had nothing to do with the repo the spec came from:

- Its files were built by `the_builder`, not by the original repo's hat (`_buildIdentity` looked for a hat under the code repo's own uuid and found none).
- Its Agent tab would forge a second, unrelated hat, describing only the code repo.
- Its backend, Ollama model, tool scope and prompt blocks were separate rows that defaulted, so the original repo's agent settings did not reach it.

#### What changed

The first of James's two options: one hat, and the settings in the original. The code repo is linked to the original repo.

**`lib/repo-hat.js`** — a link table `repo_agent_links` (`linkCoder`, `unlinkCoder`, `originOf`, `agentKeyFor`).
- `getRepoHat` and `ensureRepoHat` resolve through the link, so the code repo finds (or forges, on the original's behalf) the original's hat and never a hat of its own.
- `wearable(hat, repo)` adds one line to the persona when it is worn in the code repo: which repo it is in and the uuid to pass to the `idearium.code_*` tools. The stored hat is not touched.
- `refreshRepoHatPersona` and `revokeRepoHat` are refused from the code repo, and name the repo to do it from. A refresh from there would have rewritten the shared persona with the code repo's identity.
- `learn` from the code repo stores the observation on the original.

**`lib/repo-agent.js`, `lib/repo-prompt-blocks.js`** — the settings row is looked up under the original's uuid, for reads and writes: provider, Ollama model, tool scope, prompt blocks. `settingsView` returns `settingsFrom` and `status` returns `sharedFrom` when the repo shares. Exchanges, agent id and compartment stay the code repo's own. Inject mode stays per repo.

**`idearium/api/index.js`** — `_linkCodeRepo`: the link is made when `speceng.codegen` creates the repo, again if the code spec already exists, and on `repo.list` and `_buildIdentity` for code repos made before this version. `_buildIdentity` reports `hatSource: 'repo (original)'`. A spec with no repo of its own has nothing to link to and is built by `the_builder`, as before.

**`idearium/ui/js/app.js`** — Settings → Agents and the Agent tab show a line on a code repo saying it wears the original's hat and where to change the settings, with a link to it.

**`cli/clear-idearium.js`** — `repo_agent_links` is cleared with the other repo-scoped tables.

#### Tests

- `tests/modules/test-repo-hat-coder-link.js` (25): link rules, one hat, the persona line, refresh/revoke refused, learning, settings and blocks written through, unlink.
- `tests/modules/test-code-repo-wears-original-hat.test.js` (15): real repo layer and `_buildIdentity` — the code spec is built by the original's hat and backend, follows a change to the original's backend, and a plain repo or a spec with no original repo is unchanged.
- The existing repo-agent, provider, hat-memory, learn, node, inject, late-reply, hat-agnostic and code-tools tests still pass. `test-composed-prompt` CP-101 still fails, as before this version.

#### Not done

- The second option (a separate coder hat linked to the original) is not built. A coder hat with its own persona grounded in the code repo's index would need its own refresh and would drift from the original's; say if you want it.
- The original's persona is grounded in the original repo's index. If the code repo's agent forges the original's hat (the original had none), that persona says "not indexed" until the original repo refreshes it.

## Ledger

### Build 0.39.276-r1 — snap-0707 — 2026-09-28 18:01:52

- Archive: `nexus-0707_2026-09-28_v0.39.276-r1.zip` (was `nexus_v0_39_276.zip`)
- SHA-256: `d0c8edbe57eac7ff568f6fa6add62f54731927cf1d4ccebef55be491bd23bec2`, 11.2 MB, downloaded 2026-09-28 18:02:18
- Kind: full
- Commit: `74960f974f61a157e363ada1b75ec1e61b93c2d2`, tag `snap-0707`
- Identical copy: `nexus-0707_2026-09-28_v0.39.276-r1_1_dup1.zip` (was `nexus_v0_39_276-1.zip`)
- Left out: node_modules (203 files)
- Files in archive: 2993. Changes against the build before it: **3 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 4 | 0 |
| (root) | 1 | 1 | 0 |
| idearium | 0 | 2 | 0 |
| tests | 2 | 0 | 0 |
| cli | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
A CHANGELOG-0.39.276.md
M cli/clear-idearium.js
M docs/atlases/idearium-atlas.md
M idearium/api/index.js
M idearium/ui/js/app.js
M lib/repo-agent.js
M lib/repo-hat.js
M lib/repo-prompt-blocks.js
M lib/version.js
M package.json
A tests/modules/test-code-repo-wears-original-hat.test.js
A tests/modules/test-repo-hat-coder-link.js
```

### Build 0.39.276-r2 — snap-0708 — 2026-09-28 20:57:20

- Archive: `nexus-0708_2026-09-28_v0.39.276-r2_c1-compound-failure-mode.zip` (was `nexus_C1_compound-failure-mode.zip`)
- SHA-256: `f03f3baec0b08a9947e041bc7125da89d93891b3bd95c97f96de294173649115`, 0.1 MB, downloaded 2026-09-28 21:02:13
- Kind: overlay (a patch laid over the build before it)
- Commit: `75297db3fd8cedf909f64fd22befa5564065d485`, tag `snap-0708`
- Files in archive: 11. Changes against the build before it: **2 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 4 | 0 |
| tests | 2 | 1 | 0 |
| lib | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M cortex/schemas/schema.debug_macro
M cortex/schemas/schema.failure_mode
M cortex/self-heal/failure-mode-forensics.js
M cortex/self-heal/index.js
M docs/2026-09-28-staging-self-heal-phasemap.spec
M lib/node-schemas/schema.debug_macro
M lib/node-schemas/schema.failure_mode
M orchestrator/orchestrator.js
M tests/modules/run-all.js
A tests/modules/test-c0-cfr-collapse-anchor.test.js
A tests/modules/test-c1-compound-failure-mode.test.js
```

