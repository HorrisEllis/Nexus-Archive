# Nexus 0.39.271

**NEXUS 0.39.259: copilot has all of Clear Glass; a job/freelance pipeline; one door to every memory**

| | |
|---|---|
| Built | 2026-09-27 14:12:36 → 2026-09-27 19:15:14 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.259, 0.39.271 |
| Tag | `v0.39.271` → snap-0701 |
| Full file ledger | [LEDGER-0.39.271.csv](../ledger/LEDGER-0.39.271.csv) |

## Release notes — `CHANGELOG-0.39.259.md`

Copied unchanged from the build.

### NEXUS 0.39.259: copilot has all of Clear Glass; a job/freelance pipeline; one door to every memory

**Date:** 2026-09-27 · clear-glass 3.15.0 → 3.16.0 · copilot 3.7.0 → 3.8.0 · idearium 4.8.0 → 4.9.0 · tool guide 1.0.1 → 1.1.0 · repo-prompt-blocks 1.0.0 → 1.1.0

James:

> *"i want copilot completely aware of clearglass, hooked in completely. all of it, copilot can use it. do anything you can to help me automate job applications, fiverr, etc. expand it as much as possible. idearium agents should be able to find the context easily when talking to them, all of the memory systems, graphs, etc"*

#### What the map showed before building

- **Copilot could act in Clear Glass but rarely see what happened.**
  - Browser actions reached Clear Glass only as bus events. `POST :7702/cmd` answers `{emitted}`, and the result goes out on SSE.
  - `browser_action` got results by going through a guardian job and polling `/jobs` for up to 20s (five hops). With guardian down, nothing worked, even with Clear Glass up.
  - Clear Glass's own in-browser co-pilot dropped every tool result. Bus-routed calls returned `{dispatched}` and nothing was ever sent back. It could click, but it could never read the result and continue.
- **`clear_glass_command_index` never worked.** It pointed every call at `:7704`, the wire server, which has no `/cli/*` routes.
  - `discover` always fell back to the on-disk index and said Clear Glass was unreachable.
  - Every `call('/cli/…')` returned 404.
  - No test ever called it against a server.
- **Copilot had never been told how to use 54 of its tools.** `test-tool-guide` T-001 failed: 54 tools had no note in the tool guide the model reads, and every Clear Glass tool was among them. That is most of why copilot did not "know" Clear Glass.
- **There was no single answer to "what is on this page" or "what is Clear Glass doing".** One took an agent-written eval script. The other took nine separate GETs.
- **Form work had typing and clicking only.** There was no select, no checkbox state, no bulk value, and no file upload (`autofill_manage` said so in its own description).
- **Memory is spread over about 70 JAA tables written by about 40 modules**, plus repo graphs, the blueprint, specs and changelogs. An Idearium agent was shown none of it and could reach it only by knowing which of about 15 tools reads which table.

#### Added — Clear Glass, whole, for copilot

- **`POST :7702/cli/driver`** (`clear-glass/src/ipc/agent-routes.js`). Awaits the real ClearDriver and returns its result, or a 502 carrying the real error. A hang becomes a timeout.
- **`POST /cli/page/read`** (`clear-glass/src/page/reader.js`) returns:
  - url, title and the text (budgeted, with the cut reported);
  - headings, links and buttons;
  - every field with its label and a selector the driver accepts;
  - radios with their group question (the fieldset legend);
  - `unfilledRequired`.
  - It runs as one function serialised into the page. The same function runs in jsdom in the tests.
- **`GET /cli/state`** returns:
  - every tab with its url and title;
  - providers, contexts and mesh;
  - accounts, autofill profiles, macros and userscripts;
  - recent downloads.
  - A source that fails is named in `blind` and never shown as empty.
- **New driver actions:**
  - `readPage`;
  - `setValue` — native setter plus input/change events, so React/Vue inputs register it; for long answers;
  - `select` — by value or visible text;
  - `check` — sets a definite state;
  - `pressKey`;
  - `upload` — CDP `DOM.setFileInputFiles` through `webContents.debugger`, for résumés.
- **`clearglass.browser.tool`** calls `:7702` directly: `state`, `read`, `act`, `sequence` (up to 40 steps in one call, stopping at the first failure), `open_tab`/`close_tab`/`tabs`, `autofill_*`, `questions`/`inject_answer`, `history`, `bookmarks`, `accounts`, `downloads`.
- **Fixed `clear_glass_command_index`.** The path picks the surface: `/cli/*` and the IPC routes go to `:7702`; agent-mesh, automation, provider and userscripts go to `:7704`. A `surface` argument overrides it.
- **The in-browser co-pilot** (`clear-glass/src/copilot/bridge.js`):
  - Each round's results are sent back as the next message, up to `settings.copilotToolRounds` (default 3). `0` keeps the old behaviour.
  - Driver actions run on the driver and return a result.
  - Any NEXUS agent tool runs from a ` ```tool {"name","arguments"}` block, through copilot's `/api/tools/run`, as agent `clear-glass-copilot`.
  - `opportunity.*` and `context.*` are in its catalog.
- **Copilot's awareness:**
  - `copilot-context` has two new layers: **L7 Clear Glass** (tabs, providers, accounts, autofill, macros, or "not reachable") and **L8 Opportunities**.
  - `nexus-awareness` answers "what's open in Clear Glass", "what needs me" and "what memory do you have".
- **Tool guide 1.1.0:** 57 notes. **T-001 passes for the first time.**
- **Clear Glass palette:** *Capture job / gig / lead to NEXUS* sends this tab to the pipeline.
- **`the_clearglass_operator` hat** gains `clearglass.browser.tool`, `nexus.context.tool` and `nexus.opportunity.tool`.
  - `seedHats()` only forges a missing hat, so on an existing install the hat never got new tools. `SEED_ADDITIONS` applies each addition once, using a settings marker.
  - If you later remove one of these tools from the hat, it is not put back.

#### Added — the opportunity pipeline (`lib/opportunity/`, `nexus.opportunity.tool`, `cli/opportunity.js`, copilot `/api/opportunity/*`)

**Stages.** DISCOVERED → SCORED → SHORTLISTED → DRAFTED → **APPROVED (James)** → PREPARING → READY → SUBMITTED → RESPONDED / INTERVIEW / OFFER. Side stages: DISMISSED, NEEDS_LOGIN, NEEDS_INPUT, FAILED (retry, escalated after 3), FOLLOW_UP_DUE. Every move is in `opportunity_ledger`.

**Profile.**
- Contact, links, résumé (`profile import` reads .pdf through pdftotext, or .docx/.txt/.md, and suggests skills).
- What you want: skills, roles, must-haves, words to avoid, companies to exclude, remote, salary floor, maximum age.
- Sources, and a policy per platform.

**Sources.**
- **Public APIs:** Remotive, RemoteOK, Arbeitnow, Greenhouse (per board), Lever (per company), Ashby (per org), HN "Who is hiring", any RSS feed.
- **Any page in Clear Glass** via `capture`: LinkedIn, Indeed, Upwork, a Fiverr inbox, a careers page.

**Scoring and drafting.**
- **Scoring** gives a reason for every point. An excluded company or avoided title word is a hard reject. Duplicates across sources are merged.
- **Drafting** uses editable templates: cover letter, proposal, Fiverr reply (keeps everything on Fiverr), screening answer, follow-up, gig description. Copilot picks the backend; only the template is sent.
- **Answer bank:** a question answered once is reused. Profile rules cover the questions every form asks. Answers are mapped onto the form's own yes/no and select options. Answers a model drafted stay candidates until you submit the application that used them.

**prepare.** Clear Glass opens a `persist:opportunity` tab (log in once and it stays logged in).
- It fills the form in one sequence: autofill, then profile and bank answers, the cover letter, drafted answers to open questions, and the résumé upload.
- It stops at READY, or at NEEDS_INPUT naming the empty fields, or at NEEDS_LOGIN naming the tab.
- Consent boxes are left for you unless `autoConsent`.

**submit.**
- You can always submit.
- The agent submits only when you approved it AND the policy is `auto` AND, on LinkedIn/Indeed/Upwork/Fiverr/Freelancer, `acknowledgeTos:true`. Their terms forbid automated applying or messaging, and a banned account costs more than one application.
- After submitting it looks for confirmation text; validation errors on the same page mean FAILED.

**Other.**
- **Fiverr/Upwork threads:** capture → draft reply → approve → reply typed into the box → READY. Nothing is sent.
- **Automation:** `cycle` (fetch, score, shortlist, draft the top N, find follow-ups due). `autoApproveAbove` per platform is your own auto-approval, recorded as policy. `profile.schedule.everyMinutes` runs the cycle inside copilot; `cli watch` runs it in a terminal.

#### Added — the context atlas (`lib/context-atlas.js`, `nexus.context.tool`, idearium + copilot `/api/context/*`)

**What it gives:**
- **`directory`:** every cortex table with its row count, what it is and which tool reads it, plus repo graphs, blueprint, specs, changelogs, and vector memory where it is initialised.
- **`search`:** one query across all of it. Every hit cites its source and id; **`get`** returns the whole record.
- Telemetry tables are opt-in and named in `skipped`. Identifiers are not searched.

**Idearium repo agents:**
- Two new editable blocks in Settings → Agents: **`{memory}`** (the question searched across everything; this repo's own learned facts and graph are boosted) and **`{directory}`** (where memory lives; sent only with tools). Both show in the preview; turn one off and its search does not run.
- `nexus.context.tool` is always in a repo agent's scope, including hats forged before it existed.
- Agent tab: **`/recall <words>`** and **`/atlas`**.
- Routes: `GET /api/context/{directory,search,get}` and `GET /api/repos/:uuid/context`.

#### Tests

| Suite | Result | What it covers |
|---|---|---|
| `clear-glass-agent-surface` (new) | 16/16 | The real page reader in jsdom on a real application form; the routes on a real express port; the tool; the command-index fix; the co-pilot loop against a stub copilot |
| `test-opportunity` (new) | 27/27 | Normalizers against each API's published shape; the full pipeline with a scripted browser; the HTTP route table; CLI persistence across processes |
| `test-context-atlas` (new) | 10/10 | Search, repo scoping, blocks and `memoryFor`, L7/L8, seed additions |
| `test-tool-guide` | 7/7 | Was 6/7 |
| `test-composed-prompt` | 20/20 | Unchanged — the pre-0.39.259 render is identical when there is no memory |
| `test-agent-tools-and-graph` | 13/13 | Two new catalog groups |

**Failures found by writing the tests (fixed):**
- The CLI printed ✓ and dropped the write: JAA flushes on a 1.5s debounce and `process.exit` beat it.
- A `<select>` showing "Select…" read as filled.
- Entity-escaped feed HTML came through with its tags.
- Arbeitnow's explicit `remote:false` became `null`.
- Answers drafted during prepare could never be adopted, because approval comes before prepare. They are now adopted when you submit.

#### Not done

- **Not tested live against:**
  - the public job APIs (this environment's egress allowlist blocked them);
  - a running Electron window;
  - CDP upload;
  - a real LinkedIn/Fiverr page.
- Fiverr/Upwork reply-box and submit detection are heuristic. `node cli/opportunity.js recipe <host> replySelector=… submitSelector=…` pins them per site.
- There is no inbox or email watcher for replies. Responses are marked by you or an agent.
- Idearium's Settings UI shows the two new blocks through the existing editor. There is no dedicated opportunity UI yet: the CLI, the copilot routes, the tool and the Clear Glass palette are the surfaces.

## Ledger

### Build 0.39.271-r1 — snap-0700 — 2026-09-27 14:12:36

- Archive: `nexus-0700_2026-09-27_v0.39.271-r1_5.zip` (was `nexus-5.zip`)
- SHA-256: `8929bf1dcd40756aea7561b3be7bd118f526d1c5c25bdd7a6131958dc9caa623`, 12.4 MB, downloaded 2026-09-27 14:13:44
- Kind: full
- Commit: `9a7955bf7437ca59bceda4e540ade4690aa13c25`, tag `snap-0700`
- Files in archive: 4220. Changes against the build before it: **18 added, 38 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 7 | 5 | 0 |
| idearium | 4 | 7 | 0 |
| lib | 2 | 4 | 0 |
| copilot | 0 | 4 | 0 |
| loom | 1 | 3 | 0 |
| tests | 1 | 3 | 0 |
| (root) | 2 | 1 | 0 |
| guardian | 0 | 3 | 0 |
| cortex | 0 | 2 | 0 |
| cos | 0 | 2 | 0 |
| orchestrator | 0 | 2 | 0 |
| versionium | 0 | 2 | 0 |
| cli | 1 | 0 | 0 |

```
A CHANGELOG-0.39.270.md
A CHANGELOG-0.39.271.md
A cli/nodes.js
M copilot/interaction-contract.json
M copilot/registry-components.js
M copilot/server.js
M copilot/spec/copilot.spec
M cortex/cortex-v2.js
M cortex/registry-components.js
M cos/runtime/run.js
M cos/spec/cos.spec
A docs/2026-09-27-idearium-atlas-phasemap.spec
A docs/2026-09-27-one-idearium-phases-living-spec-nodes-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
A docs/atlases/_archive/idearium-atlas.pre-0.39.270.md
M docs/atlases/idearium-atlas.md
M docs/atlases/nexus-atlas.md
M docs/command-index-per-system.spec
A docs/cos-debug-report.spec
A docs/living-spec.spec
A docs/phases-manager.spec
A docs/system-nodes.spec
M guardian/lib/node-registry.js
M guardian/server.js
M guardian/spec/guardian.spec
M idearium/api/index.js
M idearium/index.js
A idearium/repo/living-spec.js
A idearium/repo/phases.js
M idearium/repo/roadmap.js
M idearium/schemas/schema.phase_node
M idearium/spec/idearium.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/living-spec.js
A idearium/ui/js/phases.js
M lib/agent-tools/tools/governance/versionium-commit.js
M lib/agent-tools/tools/versionium/history.js
A lib/cos-debug-report.js
M lib/cos-run.js
A lib/system-nodes.js
M lib/version.js
M loom/bootstrap.js
A loom/maps/one-idearium-map.js
M loom/scanners/phasemap-map.js
M loom/spec/loom.spec
M orchestrator/orchestrator.js
M orchestrator/spec/orchestrator.spec
M package.json
M tests/modules/run-all.js
M tests/modules/test-moce-roadmap-ui.js
M tests/modules/test-nexus-atlas-refs.test.js
A tests/modules/test-one-idearium-phases-nodes.test.js
M versionium/routes/versionium.js
M versionium/spec/versionium.spec
```

### Build 0.39.271-r2 — snap-0701 — 2026-09-27 19:15:14

- Archive: `nexus-0701_2026-09-27_v0.39.271-r2_repo_declared-0.39.259.zip` (was `Nexus_v0_39_259_repo.zip`)
- SHA-256: `aa04a7d793a7a700923e772c72c03420d177d4a640ead9c2889206ed787b36e6`, 26.9 MB, downloaded 2026-09-27 19:17:37
- Kind: full
- Claimed version: 0.39.259 (registry 0.39.259, file name 0.39.259); filed under 0.39.271 to keep the line in order
- Commit: `409846759ce010cc5415916eb97e08cdaaed6495`, tag `snap-0701`
- Left out: embedded .git (165 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (260 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4692. Changes against the build before it: **817 added, 273 modified, 347 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 678 | 22 | 10 |
| versionium | 109 | 7 | 134 |
| clear-glass | 2 | 57 | 27 |
| tests | 10 | 25 | 44 |
| lib | 12 | 31 | 25 |
| intelligence | 0 | 32 | 30 |
| guardian | 1 | 18 | 16 |
| docs | 2 | 8 | 22 |
| cos | 0 | 8 | 13 |
| (root) | 1 | 7 | 11 |
| copilot | 1 | 13 | 4 |
| loom | 0 | 10 | 3 |
| ui | 0 | 7 | 1 |
| ollama | 0 | 7 | 0 |
| remote-desktop | 0 | 4 | 2 |
| erosmancer | 0 | 5 | 0 |
| cortex | 0 | 5 | 0 |
| orchestrator | 0 | 3 | 0 |
| diagnostic | 0 | 1 | 1 |
| cli | 1 | 0 | 1 |
| emerge | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| components | 0 | 0 | 1 |
| scripts | 0 | 0 | 1 |
| eravos | 0 | 1 | 0 |
| .claude | 0 | 0 | 1 |

```
D .claude/settings.local.json
M .gitignore
M CHANGELOG-0.39.259.md
D CHANGELOG-0.39.260.md
D CHANGELOG-0.39.261.md
D CHANGELOG-0.39.262.md
D CHANGELOG-0.39.263.md
D CHANGELOG-0.39.264.md
D CHANGELOG-0.39.266.md
D CHANGELOG-0.39.267.md
D CHANGELOG-0.39.268.md
D CHANGELOG-0.39.269.md
D CHANGELOG-0.39.270.md
D CHANGELOG-0.39.271.md
M blueprint-index.json
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/plugins/adblocker/manifest.json
M clear-glass/plugins/guardian-listeners/manifest.json
M clear-glass/plugins/passwords/manifest.json
M clear-glass/registry-components.js
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
D clear-glass/renderer/copilot-cli.js
M clear-glass/renderer/library/sections/bookmarks.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/core.js
M clear-glass/renderer/settings/sections/accounts.js
M clear-glass/renderer/settings/sections/autofill.css
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/renderer/settings/sections/automation.css
M clear-glass/renderer/settings/sections/automation.js
M clear-glass/renderer/settings/sections/copilot.css
M clear-glass/renderer/settings/sections/copilot.js
M clear-glass/renderer/settings/sections/eros.js
M clear-glass/renderer/settings/sections/fingerprint.js
M clear-glass/renderer/settings/sections/macros.css
M clear-glass/renderer/settings/sections/macros.js
M clear-glass/renderer/settings/sections/mesh.css
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/plugins.css
M clear-glass/renderer/settings/sections/plugins.js
M clear-glass/renderer/settings/sections/privacy.js
M clear-glass/renderer/settings/sections/providers.js
D clear-glass/renderer/settings/sections/shortcuts.css
D clear-glass/renderer/settings/sections/shortcuts.js
D clear-glass/renderer/settings/sections/sites.css
D clear-glass/renderer/settings/sections/sites.js
M clear-glass/renderer/settings/sections/suite.css
M clear-glass/renderer/settings/sections/suite.js
M clear-glass/renderer/settings/settings.css
M clear-glass/spec/clear-glass.spec
M clear-glass/src/api/settings.js
M clear-glass/src/autofill/matcher.js
D clear-glass/src/autofill/proposal.js
M clear-glass/src/autofill/store.js
D clear-glass/src/automation/cron.js
D clear-glass/src/automation/dom.js
D clear-glass/src/automation/from-macro.js
D clear-glass/src/automation/nodes.js
D clear-glass/src/automation/routes.js
D clear-glass/src/automation/steps.js
D clear-glass/src/automation/template.js
D clear-glass/src/automation/templates.js
M clear-glass/src/bookmarks/browser.js
M clear-glass/src/bookmarks/store.js
M clear-glass/src/copilot/bridge.js
D clear-glass/src/copilot/hat.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/downloads/store.js
D clear-glass/src/driver/glass-host/main.js
D clear-glass/src/driver/glass-host/package.json
D clear-glass/src/driver/glass.js
M clear-glass/src/driver/index.js
D clear-glass/src/eros/supervisor.js
M clear-glass/src/fingerprint/engine.js
M clear-glass/src/history/store.js
A clear-glass/src/ipc/agent-routes.js
M clear-glass/src/ipc/bridge.js
D clear-glass/src/macros/recording.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/mesh/automation-engine.js
M clear-glass/src/options/store.js
A clear-glass/src/page/reader.js
M clear-glass/src/passwords/vault.js
D clear-glass/src/plugins/webextensions.js
M clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/registry.js
D clear-glass/src/shortcuts/registry.js
M clear-glass/src/site-settings/store.js
M clear-glass/src/sse/server.js
D clear-glass/src/storage/jaa.js
M clear-glass/src/toolbar/commands.js
D clear-glass/test/content-filter-exempt.test.js
D clear-glass/test/copilot-cli.test.js
D clear-glass/test/storage-jaa.test.js
D clear-glass/test/webextensions.test.js
M clear-glass/wire/nexus-wire.js
D cli/nodes.js
A cli/opportunity.js
D components/index.json
M copilot/adversarial.js
M copilot/analysis.js
M copilot/cli.js
M copilot/interaction-contract.json
M copilot/intuition.js
D copilot/lib/activity-recall.js
M copilot/lib/copilot-context.js
M copilot/lib/nexus-awareness.js
D copilot/lib/reword.js
M copilot/lib/self-model.js
M copilot/lifeline.js
M copilot/registry-components.js
A copilot/routes/opportunity.js
M copilot/server.js
M copilot/spec/copilot.spec
M copilot/tool-runtime.js
M cortex/core/raid/contract-intake.js
M cortex/cortex-v2.js
M cortex/registry-components.js
M cortex/spec/cortex.spec
M cos/ci/keys.js
M cos/cli/commands/create.js
M cos/compartment/qemu-runtime.js
M cos/foundation/file-browser.js
M cos/foundation/types.js
M cos/host/gates/compartment.js
D cos/runtime/preload.cjs
D cos/runtime/register.mjs
D cos/runtime/resolve-hook.mjs
D cos/runtime/run.js
D cos/runtime/syntax-check.cjs
M cos/spec/cos.spec
D cos/testenv/detect.js
D cos/testenv/host.js
M cos/testenv/index.js
D cos/testenv/installer.js
D cos/testenv/provision.js
D cos/testenv/setup-job.js
D cos/testenv/setup-vm.bat
D cos/testenv/setup-vm.sh
D cos/testenv/tar.js
M diagnostic/nexus-diagnostic.js
D diagnostic/wire-integrity.js
D docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec
D docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
D docs/2026-09-26c-handoff.md
```

1287 more (mostly data, logs and archived files) are in the ledger file.

