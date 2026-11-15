# Nexus 0.39.258

**NEXUS 0.39.258: the second job completes; the agent is sent only what you can edit**

| | |
|---|---|
| Built | 2026-09-25 21:19:28 → 2026-09-26 04:16:01 |
| Builds on the main line | 9 |
| Other archives filed here | 4 |
| Versions the builds claimed | 0.39.258, 0.39.260, 0.39.263, 0.39.265 |
| Tag | `v0.39.258` → snap-0689 |
| Full file ledger | [LEDGER-0.39.258.csv](../ledger/LEDGER-0.39.258.csv) |

## Release notes — `CHANGELOG-0.39.258.md`

Copied unchanged from the build.

### NEXUS 0.39.258: the second job completes; the agent is sent only what you can edit

**Date:** 2026-09-26 · guardian 3.14.0 → 3.15.0 · copilot 3.6.0 → 3.7.0 · idearium 4.7.0 → 4.8.0 · userscripts chatgpt/claude 10.9.0, gemini/perplexity/deepseek 10.8.0

James, live on 0.39.257:

> *"progress. didn't work a second time. the paste, shouldn't be injecting. only injecting the persona and the .inject nodes set in the agent tab and settings"*
>
> *"not to inject anything into it that i cant edit in the agent settings"*

#### Fixed — the second job waited forever

The first reply was read from the chat transcript, but the job never finished completing:

```
completing job 429f67be… from the transcript failed: ENOENT … mkdir '…\conversations\https:\chatgpt.com\c\6ab74053-800c-83e8'
```

- **Cause:**
  - A transcript completion carries `chatUrl`, not `chatId`.
  - `ncp-handler.js` used the URL itself as the conversation-log folder name, and on Windows the colon makes `mkdir` throw.
  - The throw came after `job.status = 'complete'` was set but before `guardian.job.complete` was emitted.
  - So the one-job-per-tab pool never released the tab. `ping` sat at the "tab takes the job" gate.
- **Fix:**
  - The session id is now the URL's last segment, which is the chat id.
  - `lib/queue.js` and `lib/ico.js` turn any id into one safe folder name, so a colon, a separator or `..` can no longer reach `mkdir`.
  - A conversation-log failure is warned about and never stops a completion.
- **Why the tests missed it:** they stubbed `logConversation` as a no-op, and on Linux a colon is a legal filename character. CP-002 now writes through the real queue with the exact failing id.

#### Changed — the prompt is only what Settings → Agents shows

**What the paste contained, and where each part came from**

1. **`[NEXUS CONTEXT]`** — added by the userscript.
   - A repo job's hat has an empty persona on purpose, because the persona is already in the prompt (0.39.255).
   - The userscript read the empty hat header as "no hat" and prepended its generic context blob.
2. **Copilot's tool-loop system prompt** — the identity line, "ALWAYS look for a tool", the tool guide and `USER:` labels.
   - Every tool round also re-pasted the whole history into the same tab.
   - The `tool-guide` inject_rule node existed, but nothing ever read it.
3. **The persona and protocols** — the only intended part.
4. **`[NEXUS] … "hey nexus,"` footer** — added by `NEXUS.decorate`.
   - This is why ChatGPT's whole reply was "hey nexus, 👋".

**What replaces them**

`lib/repo-prompt-blocks.js` holds the repo agent's whole prompt as ordered blocks:

- persona
- @learn protocol
- .inject protocol
- how to call a tool (browser agents)
- tool guide
- code matched from this repo
- project map
- the question
- tool-result frame (follow-up rounds)

Each block can be switched off and has fully editable text. The defaults are the exact text each layer sent before this release.

**Placeholders**

Placeholders are the only text not typed by James. Each one is data, shown in the editor. Deleting a placeholder means that data is not sent.

- `{persona}` — the generated hat persona. It can't be edited in place because a refresh rewrites it, so keep it, write around it, or replace it.
- `{message}` — the question.
- `{code}` and `{map}` — `lib/repo-context.js` retrieval in bare mode, data lines only.
- `{tools}` and `{tool_guide}` — filled by copilot from the agent's scope.
- `{name}` and `{result}` — in the tool-result frame.

**Nothing downstream adds text to a composed job**

- **copilot** (`body.tools.composed`):
  - no system prompt, identity or turn labels;
  - round 1 is the prompt as composed;
  - later rounds carry only the new tool results, in the `tool-result` frame;
  - Ollama gets the raw prompt, with no `SYSTEM CONTEXT / USER / NEXUS CO-PILOT` frame.
- **guardian userscripts** (hat `personaInPrompt`): no context blob, no tools header, no wake hint.
- **guardian mesh** (`wake-hint.js`): no hint.
- **inject-resolve side question:** it now goes to the repo's own tab with its hat, so it is treated as composed too.

**UI**

- Settings → Agents → **what the agent is sent** is a new area with its own JS and CSS files (`idearium/ui/js/agent-blocks.js`, `idearium/ui/css/agent-blocks.css`).
  - Each block has a toggle, its full text and a reset.
  - **preview what is sent** shows the exact first message for a question, built by the same `compose()` the dispatch uses.
- The new routes are `GET/POST /api/repos/:uuid/agent/blocks` and `POST /api/repos/:uuid/agent/blocks/preview`.

#### Changed — the two gaps left in the first cut, closed

**The "copilot" switch position.** Before, it sent the prompt through copilot's plain `/api/prompt` path. That path adds user model, session history, recall, mastermind and intent routing, and none of it is editable in the agent settings.
- Now idearium asks copilot which backend its default resolves to, via the new `GET /api/prompt/resolve`.
- The composed prompt is then sent straight to that backend: `auto` goes to ollama, `guardian` lets guardian's RAID pick, and a named agent goes to that agent.
- So copilot still decides **who** answers. Only the repo's blocks decide **what** is sent.
- If copilot can't answer the resolve call, nothing is sent and the Agent tab says why. There is no fallback to the injecting path.
- The Agent tab reply line shows `copilot → <backend>`.
- **Trade-off:** lifeline's low-confidence escalation (from ollama to guardian) does not apply to a composed prompt.

**"Where does this code go?"** This is the side question asked when the agent writes a code block without a path.
- It is now the repo's editable `inject-resolve` block, with placeholders `{question} {symbols} {candidates} {syntax} {code}`.
- A line whose placeholders all come out empty is dropped, so the template needs no conditionals.
- It is sent on its own, not wrapped in the persona and all the other blocks again.
- If you switch it off, the agent is never asked and the code waits unresolved for you to place.
- `repo-inject.js resolvePrompt` now renders this block, so there is one definition.

#### Tests

- **test-composed-prompt:** 20/20.
  - **CP-0xx — the second-job bug:** a real `mkdir` using the failing id, and completion surviving a log throw.
  - **CP-1xx — blocks and compose:** every output line is block text or placeholder data; disabled blocks are not sent; edits are sent as typed; edits persist and reset.
  - **CP-2xx — copilot composed mode:** round 1 is the prompt as-is and round 2 is only the templated result; the non-composed path is unchanged.
  - **CP-3xx — guardian adds nothing:** mesh hint and all five userscripts.
  - **CP-4xx — copilot position and side question:** resolves to a named backend and sends composed; sends nothing when copilot can't say; the side question is the editable block, sent alone.
- **Real Chromium:** `tests/probe/agent-blocks-chromium.js`, 13/13.
  - It loads the real `agent-blocks.js` and CSS, backed by the real `repo-prompt-blocks` and `compose()`.
  - It checks: every block listed, open/edit/untick, save stores, "edited" mark, the preview shows exactly the blocks, reset, no page errors.
  - It is the area on its own, not the whole idearium page.
- **Mutations:** 15 applied, each caught.
- **Regression:** 21 related suites are identical to the 0.39.257 baseline.
  - Updated for the intended change:
    - `test-agent-tools-and-graph` AT-08, AT-09 and AT-13: no identity line; composed dispatch; auto resolves through copilot and is enforced.
    - `test-repo-agent-provider`: auto asks copilot; new switch wording.
- **Failing before this change and still failing identically:**
  - copilot-provider-toggle T-012, which is the boot vitals failure;
  - nexus-wake NW-020/033/034;
  - repo-context "names a function".

#### Not done

- **Not proven live end to end:** the new area has been proven in Chromium, but not a real ChatGPT turn through the whole stack.
- **The learning work planned for this release moves to 0.39.259.**

## Release notes — `CHANGELOG-0.39.260.md`

Copied unchanged from the build.

### NEXUS 0.39.260: dangling hooks cut from 545 to real ones, large imports no longer stall idearium, "online" means idearium

**Date:** 2026-09-26 · loom registry, source-map scanner, diagnostic wire-integrity, gap-field, idearium RepoLayer, idearium UI, orchestrator proxy

James, live on 0.39.259:

> *"can we fix some of these dangling hooks"* · *"imported my mastermind project and now idearium isn't running properly"* · *"should not show online at 9000, thats not useful"*

#### Fixed: idearium stalled after the 1364-file MASTERMIND import

What the log showed:

| Time | Event |
|---|---|
| 04:55:43.9 | `ingested 1364/1364 file(s) … in 1980ms` |
| 04:55:53 | `[watchdog] idearium → OFFLINE`, then missed pulses without end. The process was alive but its event loop was blocked. |
| 05:00:25 (next boot) | `[cos-bridge] created compartment "idearium-repo-aaf6740f"`, then `phase 3 gate STALLED after 30s` and `BOOT HALTED at phase 3` |

- **Cause:** `RepoLayer.materialize()` wrote each file through `readFile()`. Each `readFile()` resolved its chunk through `se.loadSpec()`, which JSON-parses the whole manifest, including every chunk's content.
  - N files meant N full parses of an N-file manifest, so the cost was quadratic.
  - Measured on the old code: 200 files took 1.9 s and 500 files took 11.5 s. 1364 real files is far past the 30 s gate.
  - The same call runs twice: at the end of the upload, and in the next boot's spec→repo reconcile. The upload never finished, so the repo record was never materialized. The reconcile adopted the spec and hit the same wall inside the phase-3 boot step.
- **Fix:**
  - `materialize()` parses the manifest once and indexes the chunks by path. The lookup rule is unchanged: `realPath`, then `fileName`, then `sectionId`.
  - Measured after the fix: 500 files take 136 ms, and a 1364-file adoption (a 30 MB manifest) takes 276 ms.
  - A full import (ingest, materialize, pipeline) takes about 9 s. Most of that is disk writes and the L2–L5 graph pass, which were not touched.

#### Fixed: 545 dangling-hook GAP lines per boot

- **Most were not wiring gaps.** About 530 of the 545 were `<file>.import` or `<file>.export` hooks.
  - loom derives these from the static `require()` graph, one pair per file.
  - An unwired end means one of three things:
    - a root file (tests, scripts, servers) that nothing requires;
    - a file whose requires are all dynamic or external;
    - leftovers from building the registry.
  - None of these is "an emit with no listener", which is what the gap claims.
  - `diagnostic/wire-integrity.js` (new, pure) now counts these as one line, not one gap each:
    `[diag] wire-integrity: N require-graph hook(s) without a wire … counted, not raised as gaps`.
- **Named contract hooks keep the old rules:**
  - They are event, IPC and HTTP hooks such as `copilot.prompt.reply`, `guardian.job.dispatch.complete` and `loom.hook.declare`.
  - The 11 in the log are still raised, once each.
- **Imported repos are no longer mapped as Nexus source.**
  - Upload Project writes into `idearium/repo/repos/`, which is inside the tree. The registry refresh had mapped MASTERMIND's own tests as Nexus components: `nexus.idearium.repo.repos.nexus-id-repo-….mm9.tests.…`.
  - `loom/scanners/source-map.js` now skips `idearium/repo/repos` and `idearium/data`, plus their env overrides.
- **The registry can now forget.** `registry.json` used to be add-only.
  - `loom/bootstrap.js` prunes records the scanner owns (uuid `nexus-loom-scan-`) whose file is gone or excluded. It also removes wires whose endpoint hook is gone.
  - Hand-mapped and seeded records are never touched.
  - In a copy of this tree the prune removed 87 components, 22 hooks and 112 wires.
- **Gaps can now close.**
  - A dangling-hook gap used to be opened and never closed, so every one ever raised came back at each boot.
  - `gap-field.resolve(uuid, resolution)` is new.
  - Each scan closes gaps whose hook was wired, removed from the registry, or is a require-graph hook. The row is kept with status `resolved`.
- **Bootstrap is about 3× faster.**
  - `LoomRegistry.has()`, `get()` and `all()` re-read `registry.json` (7 MB) before every read. That was most of the ~4 min bootstrap.
  - The re-read now skips the parse when the file's mtime and size are unchanged, so writes from another process are still seen.
  - Measured: 1 min 27 s.

**Live check:** the real `diagnostic/nexus-diagnostic.js`, run against the pruned registry with three planted stale gaps:

- the 2 stale gaps closed;
- the real one stayed open and was not re-announced;
- 10 real contract gaps were raised;
- 34 require-graph hooks were counted on one line.

#### Fixed: the Idearium UI said "connected" when idearium was down

- **Cause:**
  - The UI probed `:4800/health`, then `:9000/api/idearium/health`, and accepted any HTTP 2xx.
  - With idearium down, the orchestrator's proxy answered `200 {ok:false, error:'Idearium timeout'}`. The page showed a green `nexus · :9000/api/idearium` and `connected`.
  - The page also checked only once, at load.
- **Fix, UI (`idearium/ui/js/app.js`):**
  - "Online" now requires idearium's own health body: `ok === true` plus a `version`.
  - Health is re-checked every 10 s. The indicator drops to `idearium offline — click to retry` when idearium dies, and recovers on its own when it comes back.
  - The label names what was checked: `idearium · online`, or `idearium · online via :9000`.
- **Fix, orchestrator:** `GET /api/idearium/health` now returns 503 when idearium is not ok.

#### Tests

- **New:** `tests/modules/test-dangling-hooks-and-idearium-load.test.js`, 19 tests, all passing.
  - IM-001 and IM-003 fail on 0.39.259's `materialize`.
  - Registered in `run-all.js` together with 0.39.259's `test-back-and-forth.test.js`, which was missing from the list.
- **Still passing:**
  - idearium: `idearium-auto-repo-creation`, `idearium-ingest-stability`, `idearium-materialize-physical`, `idearium-repo-watcher`, `test-clear-idearium`
  - diagnostic, gap-field and loom: `test-diagnostic-sweep`, `test-diagnostics`, `test-gap-field`, `test-loom-map`, `test-loom-phasemap(-status)`, `loom/test/{contracts,ingest,component-detail}`
  - snapshots and versioning: `test-mco3-versionium-tab`, `test-mcob-*`
  - other: `test-p3-diagnostic-causal`, `loom-context-intent`, `test-back-and-forth`
- **Failing on 0.39.259 too, unchanged:**
  - `test-diagnostic-heal-path` (2)
  - `test-mco3-repo-snapshot` (1, PRESERVE set)
  - `loom/test/schema.test.js` (1)
  - `loom/test/phasemap-map.test.js` (1)

#### Not changed

- **The committed `loom/data/registry.json` was not regenerated.**
  - Autopilot's background `node loom/bootstrap.js` refresh prunes it on the next boot.
  - Until that refresh finishes, the diagnostic already treats the leftover MASTERMIND hooks as require-graph hooks. It closes their persisted gaps on the first scan.
- **A new line to expect on the first boot:** `[diag] wire-integrity: closed N dangling-hook gap(s) that no longer qualify`, with N in the hundreds. After that the log should show only the ~11 contract hooks, and those only once.

## Release notes — `CHANGELOG-0.39.263.md`

Copied unchanged from the build.

### NEXUS 0.39.263: Nexus is one repo, its Home is the Nexus atlas, and Clear Glass replaces Playwright

**Date:** 2026-09-26 · clear-glass 3.16.0 → 3.17.0 · versionium 3.2.0 → 3.3.0

James:

> *"playright? no what is that for? litterally have clearglas... also nexus is the repo, not 15, just nexus, then clicking inside of it, shows the rest of them in maybe architecture or no, the nexus atlas, wire that completely in as the homepage of the nexus repo, and everything referenced can be opened in idearium, including each system."*

#### Nexus is one repo

**The library**
- The library shows one card, `nexus`, instead of 15.
- The 14 system repos are opened from inside it.
- While you are in a system, the compact list shows it under nexus.
- A filter that names a system still finds it.
- Back from a system goes to nexus; back from nexus goes to the library.

**The Home tab is the Nexus atlas**
- Nexus's Home renders `docs/atlases/nexus-atlas.md`, read from the immutable snapshot (`idearium/ui/js/nexus-atlas.js`, loaded after app.js).
- Every system is a block at the top, showing its files, versions, loom phases done/total, symbols, resolution and port. Clicking a block opens that system.
- Each `### <system>` module heading in the document gets a live line with the same numbers.
- The operational panels from 0.39.261 are in a collapsible section below: snapshot and sync, understanding, system graph, compartments, applied changes.

**Everything referenced opens in idearium**
- The page collects its references: code spans, file-tree lines, `:port`s and `*-atlas.md` names.
- They are resolved in one request, `POST /api/nexus-self/resolve` (`resolveRefs` in `idearium/repo/nexus-self.js`).
- What each kind opens:

| Reference | Opens |
|---|---|
| system name, `nexus.<system>`, `:port`, a system's directory | that system's repo |
| file | its system repo, Files tab, with the file open in the editor |
| `*.md` doc | rendered in place with a breadcrumb; its own references are live too |
| directory | its system repo's Files tab |
| `NEXUS/` | the nexus Home |

- Indented file-tree lines resolve as full paths: `guardian/` → `lib/` → `node-registry.js` is `guardian/lib/node-registry.js`.
- A bare name like `loom.spec` prefers the copy inside the system it is named after (`loom/spec/loom.spec` over `docs/loom.spec`). The other copies are listed in the link's tooltip.
- A path the snapshot does not have is marked struck-through with the tooltip "not in the snapshot". It is never guessed.
- A plain term such as `sigma` or `AX-013` is left as text.

**Each system's Home starts with its own atlas**
- It shows `docs/atlases/<system>-atlas.md`, found by the system's name or by the directory it owns (`ollama-atlas.md` for ollama-bridge), with its references live.
- A breadcrumb `nexus › <system>` sits at the top.

**New routes**
- `GET /api/nexus-self/atlas`: the document, per-system numbers, and architecture-spec's `nexus-atlas-aggregate` roll-up of every synced system's `atlas.json`.
- `POST /api/nexus-self/resolve`
- `GET /api/nexus-self/file?path=`: any text file of the immutable base, read-only.

**Also fixed:** the UI connected to the hardcoded `:4800` even when a different idearium served it. The idearium that served the page is now tried first.

#### Playwright is gone: Clear Glass drives the pages

Playwright was a root devDependency for three probe scripts. Four more probes needed Python playwright, which was never installed, so TX-20, GS-20, SA-09 and SA-10 always reported SKIPPED.

Clear Glass is already a Chromium, so it now drives the pages itself.

**`clear-glass/src/driver/glass.js` plus `glass-host/main.js`**
- Node starts Clear Glass's Electron on the host script.
- Each page is a BrowserWindow, driven through its own `webContents.debugger`: the DevTools protocol spoken in-process, with no remote-debugging port.
- With no display on Linux it runs `--ozone-platform=headless` with offscreen windows. A shown window under the headless platform segfaults Electron 42.
- A machine without the Electron binary can point it at any Chromium (`GLASS_CHROMIUM`), driven over the DevTools websocket.
- The API is the subset of Playwright's that the probes used, under the same names, so a probe changes one line:
  - `launch`, `newPage`, `goto`, `evaluate`
  - `click` (on an inline element's first line box, so a wrapped link is hit)
  - `fill`, `selectOption`, `keyboard.press`, `locator`, `$`/`$$`/`$eval`/`$$eval`
  - `waitForSelector`/`Function`/`LoadState`
  - `route` (the Fetch domain), `exposeFunction` (Runtime bindings), `addInitScript`, `cdp`, `screenshot`
  - selectors: CSS, `text=`, `:has-text()` and `a >> b`

**Every real-page probe now runs on it**

| Probe | Result |
|---|---|
| `transcript-push-chromium.js` (TX-20) | 10/10 |
| `live-stream-chromium.js` (GS-20) | 8/8 |
| `selector-check-chromium.js` (SA-09) | 10/10 |
| `selector-assign-ui-chromium.js` (SA-10) | 9/9 |
| `agent-blocks-chromium.js` | 13/13 |
| `clearglass-library-window.js` | 29/29 |
| `clearglass-menu-library.js` | 4/4 |
| `nexus-atlas-home.js` (new: a real idearium, in a sandbox) | 8/8 |

- `home-split-equivalence.js` is ported, but its reference commit `30a0c24` predates this checkout's history, so it reports SKIPPED here, as the Python version would have.
- The six `.py` probes are deleted. The shared probe helper is `tests/probe/_glass-probe.js`.
- `tests/manual-chatgpt-console.playwright.js` became `tests/manual-chatgpt-console.glass.js`.
- Root devDependencies are now electron, electron-builder and jsdom. The lockfile went from 468 to 462 packages.

#### Versionium holds every repo's history; loom no longer reads .git

James: *"loom depends on the .git i want versionium to hold the history for each repo."*

Before this, two runtime paths read git:
- loom's phasemap history stamped each phase transition with `git log -1 -- <spec>`;
- idearium's repo snapshots recorded `gitCommit`, the HEAD of a `.git` inside the repo directory.

Neither does any more.

**Every repo's history is its versionium chain**
- A repo's history is its snapshots on branch `repo-<uuid>` in versionium, with the files attached. Versionium already had this layer; nothing new stores history elsewhere.
- **Nexus repos:** each sync commits every new or changed `nexus/<system>` repo, and the `nexus` index, to versionium with its files (`sync({ commitVersion })`, wired in the API).
  - An unchanged sync commits nothing.
  - A failed commit is recorded on the repo as `versionError` and retried by the next sync.
  - The `nexus` index now goes through the import pipeline too, so it can be versioned.
- **Snapshot record:** §33's commit field is now `versionCommit`: `{ source: 'versionium', branch, parent, parentKnown }`, where the parent is the previous version from the file layer's plan.
  - `snapshot.js` no longer imports `child_process`.
  - Records from before this release still show their `gitCommit`.
  - The Versionium tab shows a "version" row.

**Versionium 3.3.0: two new routes**
- `POST /api/versionium/files/stage` puts content into the blob store ahead of `record()`.
  - It works in batches under `FILE_MAX_RECORD_BYTES`, and the sha256 is computed by versionium, not taken from the caller.
  - `record()` takes staged content for any file whose bytes are already stored.
  - So a repo's first version can be any size: core's first version was 98 MB against a 32 MB request cap. It was refused before; now it is staged and recorded (15 s in the sandbox run).
- `GET /api/versionium/files/versions?path=` lists every commit that wrote a path, newest first, with the file's sha256 as of each commit, including deletions.

**Loom**
- `persistHistory()` now stamps each transition with the versionium commit whose copy of the spec has exactly the bytes on disk: `versionCommit`, `versionRepository` and `versionAt`.
- When versionium has no such version, it records `versionCommit: null` with `versionReason`.
- It asks through `lib/nexus-client` (the API), once per spec file per run. Once versionium is unreachable it stops asking, rather than waiting on a timeout for every file.
- `persistHistory()` is now async and single-flight, so two overlapping calls cannot write the same transition twice.

**Also fixed:** `materialize()` deleted the `spec-graph.json` the pipeline writes (since 0.39.246). It is now in the PRESERVE set.

**Sandbox run, with a real versionium on :3754 and a real idearium**
- guardian: three chained versions (183 → 184 → 183 files) as a probe file was added, then removed; `files/versions` shows the add and the delete.
- core's first version (98 MB) was staged and recorded.
- loom's lookup returned `vtm-23fce093` for `docs/2026-08-22-session-full-phasemap.spec`.

**Still using git, deliberately:** `scripts/precommit-check.js` and `scripts/run-verification-manifest.cjs`, which are developer tools for the git checkout itself.

#### No Compartment tab: repos are compartments

James, on main's 0.39.262 Compartment tab: *"what is this? repos are compartments. get rid of that and move it where it belongs. should not be a compartments tab, repos are compartments. the only repo i should be seeing is nexus, the rest are nested in the nexus repo, in the atlas."*

**Removed**
- The Compartment tab, its entry in the Create menu, and the Compartment view.
- Anything that still asks for that view lands on Repos.

**The lanes live where the idea lives**

James: *"ideas promoted to specs get a repo."* A first cut of this release gave every promoted brainstorm a repo. That was wrong, and it has been reverted. Nothing here creates a repo for an idea: only a spec gets one.

- **Before an idea is a spec:** the four lanes (brainstorm, problem solving, expand, improve) render in its detail in Create › Ideas. Promoting a brainstorm opens it there.
- **Once it is a spec:** it has a repo, and the lanes are that repo's **Idea tab**, under the idea's text. That tab's iteration list (roadmap, send to agent) folds away below the lanes.
- `openCompartmentIdea()` and "open the idea" go to whichever of the two applies.

**Only nexus at the top**
- The navigator ("Expand all") lists repos only.
- `nexus` holds its 14 systems under a "systems" separator, not as top-level entries.
- The Repos badge counts what the library shows: nexus, not its systems.

**Tests**
- `idearium/test/compartment-ui.smoke.cjs` is rewritten for this layout, and passes. It checks:
  - there is no Compartment tab, view or menu;
  - an idea that is not a spec is worked in Ideas, with the four lanes;
  - no repo is created;
  - a spec's idea opens in its repo's Idea tab, with the lanes nested and linked;
  - the navigator nests the systems in nexus;
  - the badge counts correctly.
- `tests/probe/nexus-atlas-home.js`: 10/10 in a real idearium. Two new cases:
  - there is no Compartment tab, and the badge reads 1;
  - a promoted brainstorm opens in Create › Ideas with the lanes, and the repo count does not change.

#### A spec's idea lives in its repo; the counts are yours

James: *"it says 15 ideas and 15 repos can you fix that? also ideas, once promoted to spec should move to the idea tab in the actual repo of the idea/spec?"*

**What was wrong**
- Each of Nexus's system repos carries a "Repo: nexus/…" idea and a spec per synced version.
- Those filled the Ideas list and the ideas and specs counts in the header.
- An idea that became a spec also stayed in the Ideas list.

**What changed**
- **Ideas list and ideas count:** only ideas that have no repo yet. An idea with a repo is a spec, and it lives in that repo's Idea tab.
- **Pointer to the specs:** a line under the list says how many ideas are specs, and takes you to Repos.
- **Specs count:** leaves out Nexus's own system specs (every version of every system repo).
- **Making a spec from an idea:** lands on the new repo's Idea tab, with the idea's lanes, instead of its Home tab.
- **Inside a repo:** the lanes no longer offer "open in Ideas", since the idea is not there any more.

**Tested:** `tests/probe/nexus-atlas-home.js`, 12/12 in a real idearium.
- After the Nexus sync, only the one real idea counts: ideas 1, specs 0, and no "Repo: nexus/…" in the list.
- After making it a spec, the page is on the new repo's Idea tab with the four lanes, the idea has left the list, and the header reads ideas 0 and specs 1.

#### UI URLs: `/ui/<system>/`, not `/<system>/ui`

James: *`{"ok":false,"error":"route not found: GET /idearium/ui"}` … should be /ui/idearium.*

Two pages built their iframe URLs from the file layout (`idearium/ui/`, `eravos/ui/`) instead of the route the orchestrator serves (`/ui/<system>/`).

| Page | Was | Now |
|---|---|---|
| `ui/tv-shell/index.html`, full Idearium channel | `../../idearium/ui` → `GET /idearium/ui`, a 404 | `../idearium/` → `/ui/idearium/` |
| `idearium/ui/index.html`, Build › Eravos canvas | `../../eravos/ui/index.html`, a 404 under the orchestrator and on :4800 | `../eravos/` → `/ui/eravos/` |

- When idearium runs standalone (not under `/ui/`), the Eravos canvas loads the orchestrator's `/ui/eravos/`.
- Verified against a real orchestrator: the old paths return 404 (`route not found`), and the new ones return 200 (IDEARIUM, ERAVOS v3).
- The `<system>/ui/…` strings in JSON such as `loom/data/registry.json` are file paths, not URLs. The code really lives there, so they stay as they are.
- New test: `test-nexus-atlas-and-glass` UI-003 fails on any page whose `src`/`href`/`location` climbs to `<system>/ui`.

#### Tests

`tests/modules/test-nexus-atlas-and-glass.test.js`: 8/8, registered in run-all.

| Group | What it covers |
|---|---|
| AT-001 | every kind of atlas reference resolves to what it names; an unknown one resolves to null |
| AT-002 | the Home is the atlas from the base, every system listed with its own atlas doc |
| AT-003 | a live edit does not show until the next snapshot |
| AT-004 | routes are registered before `:system` |
| UI-001 | markdown and file-tree references |
| UI-002 | one nexus card; back from a system goes to nexus |
| CG-001 | no Playwright, no Python probe, every probe drives Clear Glass |
| CG-002 | a real page: wrapped-element click, fill, `:has-text`, `text=`, events, screenshot size |

`tests/modules/test-versionium-repo-history.test.js`: 7/7, registered in run-all.

| Case | What it covers |
|---|---|
| VH-001 | staged content is recorded and verified by hash |
| VH-002 | `versions()` lists commits newest first, including a deletion |
| VH-101 | a version over the request cap is staged in batches, and still refused when staging isn't possible |
| VH-201 | the first sync versions every repo and the index |
| VH-202 | an unchanged sync commits nothing; a changed one commits only that system and the index |
| VH-203 | a failed commit is recorded and retried |
| VH-301 | nothing in the history path runs git |

Other suites for this part:

| Suite | Result |
|---|---|
| test-mco3-repo-snapshot | 39/0 (was 37/1: the `spec-graph.json` fix) |
| test-mco3-versionium-tab | 32/0 |
| loom phasemap-map | 12/1; its new versionium test passes, and the one failure is also failing without this change |
| mcob-file-versioning | 33/0 |
| mcob-snapshot-restore | 30/0 |
| mcoc-import-baseline | 25/0 |
| versionium-sovereign | 11/0 |
| vsb1 | 5/0 |

Suites that changed, all passing:

| Suite | Result |
|---|---|
| test-chat-transcripts | 31/0 (TX-20 now runs) |
| test-live-stream-and-gates | 13/0 (GS-20 now runs) |
| test-cg-selector-assign | 9/0 (SA-09 and SA-10 now run; SA-06 is still SKIPPED, because its 0.39.250 base commit is not in this history) |
| version-sync-and-registry | 28/2, the same two failures as before this release (lib/version.js lists idearium 4.8.0 while idearium reports 4.7.0) |

## Ledger

### Build 0.39.258-r1 — snap-0680 — 2026-09-25 21:19:28

- Archive: `nexus-0680_2026-09-25_v0.39.258-r1_repo.zip` (was `Nexus_v0_39_258_repo.zip`)
- SHA-256: `f9eb4f8fb4f8a04455ab728ae7fa54dd93be756d97c78f8ff6f1da5da4d1a632`, 26.8 MB, downloaded 2026-09-25 21:23:12
- Kind: full
- Commit: `75e20a62ee62713127f619ac61ffede8ce1d9517`, tag `snap-0680`
- Identical copy: `nexus-0680_2026-09-25_v0.39.258-r1_repo-1_dup1.zip` (was `Nexus_v0_39_258_repo-1.zip`)
- Left out: embedded .git (165 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (260 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4670. Changes against the build before it: **6 added, 24 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 8 | 0 |
| lib | 1 | 6 | 0 |
| tests | 2 | 4 | 0 |
| idearium | 2 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| copilot | 0 | 2 | 0 |

```
A CHANGELOG-0.39.258.md
M copilot/server.js
M copilot/tool-runtime.js
M guardian/lib/dispatch-ladder.js
M guardian/lib/ncp-handler.js
M guardian/lib/wake-hint.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
A idearium/ui/css/agent-blocks.css
M idearium/ui/index.html
A idearium/ui/js/agent-blocks.js
M idearium/ui/js/app.js
M lib/ico.js
M lib/queue.js
M lib/repo-agent.js
M lib/repo-context.js
M lib/repo-inject.js
A lib/repo-prompt-blocks.js
M lib/version.js
M package.json
M tests/modules/test-agent-tools-and-graph.test.js
M tests/modules/test-chat-transcripts.test.js
A tests/modules/test-composed-prompt.test.js
M tests/modules/test-live-stream-and-gates.test.js
M tests/modules/test-repo-agent-provider.js
A tests/probe/agent-blocks-chromium.js
```

### Build 0.39.258-r2 — snap-0681 — 2026-09-25 22:31:14

- Archive: `nexus-0681_2026-09-25_v0.39.258-r2_vnamed-0.39.260.zip` (was `Nexus_v0_39_260.zip`)
- SHA-256: `948808d31e97cf1ad71eb3835cbf4881bfc3e79d9bc930b92985240e121d669f`, 11.3 MB, downloaded 2026-09-25 22:32:18
- Kind: full
- Claimed version: 0.39.260 (registry 0.39.258, file name 0.39.260); filed under 0.39.258 to keep the line in order
- Commit: `411cb48796bb7a176e7e5b92dafa36872bffaefb`, tag `snap-0681`
- Identical copy: `nexus-0681_2026-09-25_v0.39.258-r2_vnamed-0.39.260-1_dup1.zip` (was `Nexus_v0_39_260-1.zip`)
- Files in archive: 3884. Changes against the build before it: **5 added, 24 modified, 789 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 2 | 678 |
| versionium | 0 | 0 | 109 |
| guardian | 0 | 12 | 1 |
| tests | 2 | 3 | 0 |
| (root) | 2 | 1 | 1 |
| loom | 0 | 3 | 0 |
| diagnostic | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A CHANGELOG-0.39.259.md
A CHANGELOG-0.39.260.md
M diagnostic/nexus-diagnostic.js
A diagnostic/wire-integrity.js
M guardian/lib/chat-transcripts.js
M guardian/lib/dispatch-pool-bridge.js
M guardian/lib/dispatch-pool.js
M guardian/lib/dispatcher.js
M guardian/lib/index.js
M guardian/lib/ncp-handler.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/repo/index.js
D idearium/repo/repos/nexus-id-repo-af2180cf/.idearium-sources.json
D idearium/repo/repos/nexus-id-repo-af2180cf/atlas.json
D idearium/repo/repos/nexus-id-repo-af2180cf/graph.json
D idearium/repo/repos/nexus-id-repo-af2180cf/index.html
D idearium/repo/repos/nexus-id-repo-af2180cf/indexes/chunks.json
D idearium/repo/repos/nexus-id-repo-af2180cf/indexes/files.json
D idearium/repo/repos/nexus-id-repo-af2180cf/indexes/symbols.json
D idearium/repo/repos/nexus-id-repo-af2180cf/kernel/intake.js
D idearium/repo/repos/nexus-id-repo-af2180cf/kernel/kernel.js
D idearium/repo/repos/nexus-id-repo-af2180cf/manifest.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/acid-synth/acid-synth.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/acid-synth/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/bass-drop-builder/bass-drop-builder.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/bass-drop-builder/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/channel/channel.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/channel/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/contrast-analyser/contrast-analyser.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/contrast-analyser/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/edm-lab/edm-lab.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/edm-lab/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/lfo/lfo.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/lfo/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/macro-automation/macro-automation.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/macro-automation/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/master-fx/master-fx.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/master-fx/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-architect/nexus-architect.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-architect/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-bridge/nexus-bridge.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-bridge/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-cortex/nexus-cortex.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-cortex/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-diagnostic/nexus-diagnostic.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-diagnostic/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-guardian/nexus-guardian.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-guardian/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-idearium/nexus-idearium.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-idearium/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-orchestrator/nexus-orchestrator.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-orchestrator/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-shared/nexus-node-core.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/pads/pads.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/pads/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/photo-editor/photo-editor.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/photo-editor/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/reese-bass/reese-bass.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/reese-bass/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sample-player/sample-player.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sample-player/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sequencer/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sequencer/sequencer.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/serial-bridge/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/serial-bridge/serial-bridge.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sidechain-compressor/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sidechain-compressor/sidechain-compressor.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/supersaw/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/supersaw/supersaw.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/timeline/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/timeline/timeline.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/video-editor/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/video-editor/video-editor.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/webhook-automation/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/webhook-automation/webhook-automation.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/wobble-bass/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/wobble-bass/wobble-bass.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/xy-pad/schema/schema.json
D idearium/repo/repos/nexus-id-repo-af2180cf/organisms/xy-pad/xy-pad.engine.js
D idearium/repo/repos/nexus-id-repo-af2180cf/project.json
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/alk-gl.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/canvas-cfr.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/canvas-wm.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/master-transport.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/organism-factory.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/precision-clock.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/precision-clock.worklet.js
D idearium/repo/repos/nexus-id-repo-af2180cf/runtime/wire-system.js
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/ERAVOS.kernel.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.genomes-ecosystems-behaviors.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.nexus.build-contract.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.pads.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.sample-player.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.sequencer.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.timeline.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.pack.format.spec
D idearium/repo/repos/nexus-id-repo-af2180cf/verification.json
D idearium/repo/repos/nexus-id-repo-af2180cf/verification.lazy.json
M idearium/ui/js/app.js
M lib/gap-field.js
M loom/bootstrap.js
M loom/scanners/source-map.js
M loom/schema/registry.js
M orchestrator/orchestrator.js
M package.json
D powershell.exe
M tests/modules/run-all.js
A tests/modules/test-back-and-forth.test.js
M tests/modules/test-chat-transcripts.test.js
A tests/modules/test-dangling-hooks-and-idearium-load.test.js
M tests/modules/test-live-stream-and-gates.test.js
```

702 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.258-r3 — snap-0682 — 2026-09-26 00:36:34

- Archive: `nexus-0682_2026-09-26_v0.39.258-r3_claude-adoring-tesla-cb5705.zip` (was `Nexus-claude-adoring-tesla-cb5705.zip`)
- SHA-256: `90e1c60c42b8d47a62bfeda682ff89dcbac652f7ef7fa2bd154b595400d62fe6`, 11.6 MB, downloaded 2026-09-26 00:40:28
- Kind: full
- Commit: `82954fa5b29b31bd58c64cc1062b26fa43e3b427`, tag `snap-0682`
- Files in archive: 3901. Changes against the build before it: **17 added, 47 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 8 | 5 | 0 |
| idearium | 1 | 11 | 0 |
| cos | 5 | 4 | 0 |
| tests | 1 | 6 | 0 |
| guardian | 0 | 6 | 0 |
| (root) | 2 | 3 | 0 |
| clear-glass | 0 | 4 | 0 |
| remote-desktop | 0 | 4 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M .gitignore
A CHANGELOG-0.39.261.md
M clear-glass/package.json
M clear-glass/src/ipc/bridge.js
M clear-glass/src/sse/server.js
M clear-glass/wire/nexus-wire.js
M copilot/tool-runtime.js
M cos/cli/commands/create.js
M cos/foundation/file-browser.js
M cos/foundation/types.js
M cos/host/gates/compartment.js
A cos/runtime/preload.cjs
A cos/runtime/register.mjs
A cos/runtime/resolve-hook.mjs
A cos/runtime/run.js
A cos/runtime/syntax-check.cjs
M docs/nexus-repository-system.spec
M emerge/package.json
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/repo/graph.js
M idearium/repo/import-pipeline.js
M idearium/repo/index.js
A idearium/repo/nexus-self.js
M idearium/repo/pipeline-events.js
M idearium/repo/roadmap.js
M idearium/repo/verify-lazy.js
M idearium/repo/watcher.js
M idearium/spec/nexus-repository-system.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
A lib/chunk-glyph.js
M lib/cos-bridge.js
A lib/cos-run.js
M lib/dynamic-project-parser.js
A lib/micro-http.js
M lib/nano-ws.js
A lib/nexus-self/apply.js
A lib/nexus-self/branch.js
A lib/nexus-self/store.js
A lib/nexus-self/systems.js
M lib/repo-context.js
M lib/zip-ingest.js
A lib/zip.js
M loom/scanners/phasemap-map.js
M package-lock.json
M package.json
A powershell.exe
M remote-desktop/bridge-electron/package.json
M remote-desktop/package.json
M remote-desktop/signal.js
M remote-desktop/tests/test-signal-integration.js
M tests/modules/idearium-repo-watcher.test.mjs
M tests/modules/run-all.js
M tests/modules/test-chat-transcripts.test.js
M tests/modules/test-live-stream-and-gates.test.js
A tests/modules/test-nexus-self-and-cos-run.test.js
M tests/modules/test-repo-run.js
M tests/modules/test-sr11-import-pipeline.js
```

### Build 0.39.258-r4 — snap-0683 — 2026-09-26 01:13:46

- Archive: `nexus-0683_2026-09-26_v0.39.258-r4_main.zip` (was `Nexus-main.zip`)
- SHA-256: `c239e88e14e84643ee60cd3a9d6c0a94fa22c62d532fb1325019669fa0d9a3f9`, 11.4 MB, downloaded 2026-09-26 01:16:41
- Kind: full
- Commit: `5be96dbe688ea617a96b60885317e35dcec2af21`, tag `snap-0683`
- Files in archive: 3918. Changes against the build before it: **18 added, 51 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 11 | 32 | 0 |
| idearium | 4 | 4 | 0 |
| tests | 1 | 5 | 0 |
| guardian | 0 | 5 | 0 |
| ui | 1 | 4 | 0 |
| (root) | 1 | 1 | 1 |

```
A CHANGELOG-0.39.262.md
M clear-glass/package.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/copilot-cli.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/sections/autofill.css
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/renderer/settings/sections/copilot.css
M clear-glass/renderer/settings/sections/copilot.js
M clear-glass/renderer/settings/sections/macros.css
M clear-glass/renderer/settings/sections/macros.js
M clear-glass/renderer/settings/sections/mesh.css
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/plugins.css
M clear-glass/renderer/settings/sections/plugins.js
M clear-glass/renderer/settings/sections/privacy.js
A clear-glass/renderer/settings/sections/sites.css
A clear-glass/renderer/settings/sections/sites.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/api/settings.js
M clear-glass/src/autofill/store.js
M clear-glass/src/bookmarks/store.js
M clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/hat.js
M clear-glass/src/downloads/store.js
M clear-glass/src/driver/index.js
M clear-glass/src/fingerprint/engine.js
M clear-glass/src/history/store.js
M clear-glass/src/ipc/bridge.js
A clear-glass/src/macros/recording.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/passwords/vault.js
A clear-glass/src/plugins/webextensions.js
M clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
M clear-glass/src/site-settings/store.js
A clear-glass/src/storage/jaa.js
A clear-glass/test/content-filter-exempt.test.js
A clear-glass/test/copilot-cli.test.js
A clear-glass/test/storage-jaa.test.js
A clear-glass/test/webextensions.test.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
A idearium/lib/idea-workbench.js
M idearium/spec/idearium.spec
A idearium/test/compartment-ui.smoke.cjs
A idearium/test/idea-workbench.test.js
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/compartment.js
M package.json
D powershell.exe
A tests/modules/brainos-float-cg.test.js
M tests/modules/run-all.js
M tests/modules/test-cg-accounts-portal-settings.test.js
M tests/modules/test-live-stream-and-gates.test.js
M tests/modules/test-moce-roadmap-ui.js
M tests/modules/test-nexus-self-and-cos-run.test.js
A ui/brainos-float/brainos-float-cg.js
M ui/brainos-float/brainos-float-contract.json
M ui/brainos-float/brainos-float.css
M ui/brainos-float/brainos-float.js
M ui/brainos-float/index.html
```

### Build 0.39.258-r5 — snap-0684 — 2026-09-26 01:13:46

- Archive: `nexus-0684_2026-09-26_v0.39.258-r5_main-1.zip` (was `Nexus-main-1.zip`)
- SHA-256: `83cc2e1e1155944cf3af19e00c49274ff88f028f0f433c5d7116c58f579e27aa`, 11.1 MB, downloaded 2026-09-26 01:24:19
- Kind: full
- Commit: `a4386334e877db426f04e0b6ffe7b66c0163cd4f`, tag `snap-0684`
- Files in archive: 3734. Changes against the build before it: **0 added, 0 modified, 184 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| architect | 0 | 0 | 84 |
| clear-glass | 0 | 0 | 81 |
| architecture-spec | 0 | 0 | 14 |
| auth | 0 | 0 | 5 |

```
D architect/compile-route.js
D architect/config.js
D architect/docs/ARCHITECT-SPEC-v1.1.0.md
D architect/interaction-contract.json
D architect/output/.gitkeep
D architect/package.json
D architect/registry-components.js
D architect/schemas/index.js
D architect/schemas/schema.capability
D architect/schemas/schema.command
D architect/schemas/schema.component
D architect/schemas/schema.hook
D architect/schemas/schema.node
D architect/schemas/schema.system
D architect/schemas/schema.wire
D architect/service.js
D architect/spec/architect.node-taxonomy.md
D architect/spec/architect.spec
D architect/src/spec/Blueprint.js
D architect/src/ui/alk-lattice.html
D architect/src/ui/arch-builder.html
D architect/src/ui/architect_universe.svg
D architect/src/ui/layered-snr-gates-axioms.svg
D architect/src/ui/spec-builder.html
D architecture-spec/registry/api.js
D architecture-spec/registry/bundle.js
D architecture-spec/registry/component.js
D architecture-spec/registry/config.js
D architecture-spec/registry/create-atlas.js
D architecture-spec/registry/decompose.js
D architecture-spec/registry/edit-atlas.js
D architecture-spec/registry/friction.js
D architecture-spec/registry/hook.js
D architecture-spec/registry/lattice.js
D architecture-spec/registry/nexus-atlas-aggregate.js
D architecture-spec/registry/phases.js
D architecture-spec/registry/watcher.js
D architecture-spec/registry/wire.js
D auth/client.js
D auth/index.js
D auth/keys/nexus-private.pem
D auth/keys/nexus-public.pem
D auth/policy.json
D clear-glass/README.md
D clear-glass/compartment.json
D clear-glass/fix-orchestrator.js
D clear-glass/interaction-contract.json
```

137 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.258-r6 — snap-0685 — 2026-09-26 01:51:10

- Archive: `nexus-0685_2026-09-26_v0.39.258-r6_main-2.zip` (was `Nexus-main-2.zip`)
- SHA-256: `365db0d55beddd9b0889951d27b1466d9f22b04c226309ee360c75965811e34a`, 11.6 MB, downloaded 2026-09-26 01:51:35
- Kind: full
- Commit: `3fb0ba4a4da692b421a185a7efffe46e106f98ed`, tag `snap-0685`
- Files in archive: 4090. Changes against the build before it: **363 added, 74 modified, 7 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 84 | 4 | 0 |
| architect | 84 | 0 | 0 |
| versionium | 64 | 6 | 0 |
| intelligence | 28 | 31 | 0 |
| data | 57 | 0 | 0 |
| tests | 11 | 10 | 7 |
| architecture-spec | 14 | 0 | 0 |
| guardian | 10 | 1 | 0 |
| idearium | 1 | 9 | 0 |
| (root) | 1 | 4 | 0 |
| auth | 5 | 0 | 0 |
| loom | 0 | 4 | 0 |
| copilot | 2 | 0 | 0 |
| remote-desktop | 2 | 0 | 0 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |

```
M .gitignore
A CHANGELOG-0.39.263.md
A architect/compile-route.js
A architect/config.js
A architect/docs/ARCHITECT-SPEC-v1.1.0.md
A architect/interaction-contract.json
A architect/output/.gitkeep
A architect/package.json
A architect/registry-components.js
A architect/schemas/index.js
A architect/schemas/schema.capability
A architect/schemas/schema.command
A architect/schemas/schema.component
A architect/schemas/schema.hook
A architect/schemas/schema.node
A architect/schemas/schema.system
A architect/schemas/schema.wire
A architect/service.js
A architect/spec/architect.node-taxonomy.md
A architect/spec/architect.spec
A architect/src/spec/Blueprint.js
A architect/src/ui/alk-lattice.html
A architect/src/ui/arch-builder.html
A architect/src/ui/architect_universe.svg
A architect/src/ui/layered-snr-gates-axioms.svg
A architect/src/ui/spec-builder.html
A architecture-spec/registry/api.js
A architecture-spec/registry/bundle.js
A architecture-spec/registry/component.js
A architecture-spec/registry/config.js
A architecture-spec/registry/create-atlas.js
A architecture-spec/registry/decompose.js
A architecture-spec/registry/edit-atlas.js
A architecture-spec/registry/friction.js
A architecture-spec/registry/hook.js
A architecture-spec/registry/lattice.js
A architecture-spec/registry/nexus-atlas-aggregate.js
A architecture-spec/registry/phases.js
A architecture-spec/registry/watcher.js
A architecture-spec/registry/wire.js
A auth/client.js
A auth/index.js
A auth/keys/nexus-private.pem
A auth/keys/nexus-public.pem
A auth/policy.json
A clear-glass/README.md
A clear-glass/compartment.json
A clear-glass/fix-orchestrator.js
A clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/spec/clear-glass.spec
A clear-glass/src/driver/glass-host/main.js
A clear-glass/src/driver/glass-host/package.json
A clear-glass/src/driver/glass.js
M clear-glass/src/main/index.js
M docs/atlases/nexus-atlas.md
M docs/repair-contract-and-loom-hub-phasemap.spec
A guardian/input/76637fea-b9ad-4cfc-8dc6-e4ccf293faf6.contract
A guardian/input/955c4d3b-c480-4274-8bdb-63aa7be4ad9a.contract
A guardian/input/b48310e4-8bd2-45d1-b64c-ae1a87f91227.contract
M idearium/api/index.js
M idearium/repo/index.js
M idearium/repo/nexus-self.js
M idearium/repo/snapshot.js
M idearium/spec/idearium.repo-snapshot.spec
M idearium/test/compartment-ui.smoke.cjs
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/compartment.js
A idearium/ui/js/nexus-atlas.js
M lib/version.js
M loom/scanners/phasemap-map.js
M loom/server.js
M loom/test/phasemap-map.test.js
M package-lock.json
M package.json
A remote-desktop/tests/.test-data-integration/identity.json
A remote-desktop/tests/.test-data-integration/identity.key
A tests/manual-chatgpt-console.glass.js
D tests/manual-chatgpt-console.playwright.js
M tests/modules/run-all.js
M tests/modules/test-cg-selector-assign.test.js
M tests/modules/test-chat-transcripts.test.js
M tests/modules/test-live-stream-and-gates.test.js
M tests/modules/test-mco3-repo-snapshot.js
M tests/modules/test-mco3-versionium-tab.js
A tests/modules/test-nexus-atlas-and-glass.test.js
M tests/modules/test-repo-toolbar-mode.js
A tests/modules/test-versionium-repo-history.test.js
M tests/modules/version-sync-and-registry.test.js
A tests/probe/_glass-probe.js
M tests/probe/agent-blocks-chromium.js
M tests/probe/clearglass-library-window.js
A tests/probe/clearglass-menu-library.js
D tests/probe/clearglass-menu-library.py
A tests/probe/home-split-equivalence.js
D tests/probe/home-split-equivalence.py
A tests/probe/live-stream-chromium.js
D tests/probe/live-stream-chromium.py
A tests/probe/nexus-atlas-home.js
A tests/probe/selector-assign-ui-chromium.js
D tests/probe/selector-assign-ui-chromium.py
A tests/probe/selector-check-chromium.js
D tests/probe/selector-check-chromium.py
A tests/probe/transcript-push-chromium.js
D tests/probe/transcript-push-chromium.py
M versionium/config.js
M versionium/interaction-contract.json
M versionium/lib/files.js
M versionium/registry-components.js
M versionium/routes/files.js
M versionium/spec/versionium.spec
```

331 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.258-r7 — snap-0686 — 2026-09-26 01:56:46

- Archive: `nexus-0686_2026-09-26_v0.39.258-r7_named-0.39.263.zip` (was `Nexus-0.39.263.zip`)
- SHA-256: `1b3ff5fd1ea7f729487408258786fc22b58891bd8a2d835e6561082fd5e302cb`, 11.6 MB, downloaded 2026-09-26 02:02:34
- Kind: full
- Claimed version: 0.39.263 (registry 0.39.258, file name 0.39.263); filed under 0.39.258 to keep the line in order
- Commit: `5c5e6d7f8f01fe8765d6372c5290a526cea45670`, tag `snap-0686`
- Files in archive: 4091. Changes against the build before it: **1 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M CHANGELOG-0.39.263.md
A data/knowledge/facts.jsonl
M data/ledger/orchestrator.jsonl
M data/orchestrator/ledger/cfr/event_log.jsonl
M idearium/ui/index.html
M idearium/ui/js/app.js
M tests/modules/test-nexus-atlas-and-glass.test.js
M ui/tv-shell/index.html
```

### Build 0.39.258-r8 — snap-0687 — 2026-09-26 02:21:52

- Archive: `nexus-0687_2026-09-26_v0.39.258-r8_claude-adoring-tesla-cb5705-1.zip` (was `Nexus-claude-adoring-tesla-cb5705-1.zip`)
- SHA-256: `539eafc36fd340554ea1fdcf720dc558cd228b6c64be24712e21f468312d9759`, 11.8 MB, downloaded 2026-09-26 02:41:50
- Kind: full
- Commit: `982c9ac0dfb9c52968c55548f1c5a311ba161373`, tag `snap-0687`
- Files in archive: 4094. Changes against the build before it: **3 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 2 | 0 |
| idearium | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M CHANGELOG-0.39.263.md
M blueprint-index.json
A data/changelog-snapshot.json
M data/ledger/orchestrator.jsonl
A data/orchestrator/ledger/cfr/cfr_state.json
M data/orchestrator/ledger/cfr/event_log.jsonl
A data/orchestrator/ledger/cfr/event_stats.json
M docs/CHANGELOG.md
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/compartment.js
M orchestrator/orchestrator.js
M tests/modules/test-nexus-atlas-and-glass.test.js
M tests/probe/nexus-atlas-home.js
```

### identical — 0688 — 2026-09-26 02:52:46

- Archive: `nexus-0688_2026-09-26_v0.39.258-r8_main-3_same-as-0687.zip` (was `Nexus-main-3.zip`)
- SHA-256: `aa8d11e2cb2cab99c241f63e26dbb514105abcca95e8527c205d0c66ed2b5119`, 11.6 MB, downloaded 2026-09-26 02:53:00
- Kind: identical (same tree as snap-0687; no commit)

### Build 0.39.258-r9 — snap-0689 — 2026-09-26 04:10:54

- Archive: `nexus-0689_2026-09-26_v0.39.258-r9_changes-1_declared-0.39.265.zip` (was `Nexus_v0_39_265_changes-1.zip`)
- SHA-256: `e6b2533f1214c2ba02071ad3db1f071d235e37dcca58d2b82f378eebf8d7838b`, 0.5 MB, downloaded 2026-09-26 04:24:40
- Kind: overlay (a patch laid over the build before it)
- Claimed version: 0.39.265 (registry none, file name 0.39.265); filed under 0.39.258 to keep the line in order
- Commit: `71d6b6c2262650db7347dc6fe8bef21999966e49`, tag `snap-0689`
- Files in archive: 31. Changes against the build before it: **9 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 2 | 7 | 0 |
| lib | 1 | 3 | 0 |
| copilot | 1 | 2 | 0 |
| erosmancer | 0 | 3 | 0 |
| idearium | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| clear-glass | 1 | 1 | 0 |
| cos | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| docs | 1 | 0 | 0 |

```
A clear-glass/src/eros/supervisor.js
M clear-glass/src/main/index.js
A copilot/lib/reword.js
M copilot/lifeline.js
M copilot/server.js
M cos/runtime/run.js
A cos/testenv/installer.js
A docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/bridge/index.ts
M erosmancer/erosmancer-os/src/types/index.ts
M guardian/ask.js
M guardian/lib/chat-transcripts.js
M guardian/lib/dispatcher.js
A guardian/lib/eros-typist.js
M guardian/lib/index.js
A guardian/lib/job-retry.js
M guardian/lib/jobs.js
M guardian/lib/ncp-handler.js
M guardian/server.js
M idearium/api/index.js
M idearium/registry-components.js
M idearium/ui/js/app.js
M lib/cos-run.js
M lib/repo-agent.js
M lib/repo-prompt-blocks.js
A lib/semantic-variant.js
A nexus-0.39.265.bundle
M run-all.js
M tests/modules/run-all.js
A tests/modules/test-guardian-retry-novelty-installs.js
```

### git-only — 0690 — 2026-09-26 04:13:00

- Archive: `nexus-0690_2026-09-26_v0.39.258_git-part1_git-only.zip` (was `nexus-git-part1.zip`)
- SHA-256: `00535b9bec1551c6ca7587a457d45647e2b3255ea49099636c2f5073d7dc8886`, 20.8 MB, downloaded 2026-09-26 04:14:35
- Kind: git-only (no commit)
- Left out: embedded .git (36 files, HEAD ce93817ff82b9f3c0aeb9a6ec1b97c6f8dfb9952)

### git-only — 0691 — 2026-09-26 04:13:00

- Archive: `nexus-0691_2026-09-26_v0.39.258_git-part2_git-only.zip` (was `nexus-git-part2.zip`)
- SHA-256: `223a858bf63fb43a88ee9b7c37d325edf7cc9f75e750eda3dc34b5a30f549327`, 18.2 MB, downloaded 2026-09-26 04:14:37
- Kind: git-only (no commit)
- Left out: embedded .git (3 files, HEAD )

### empty — 0692 — 2026-09-26 04:16:01

- Archive: `nexus-0692_2026-09-26_v0.39.258_changes_declared-0.39.265_empty.zip` (was `Nexus_v0_39_265_changes.zip`)
- SHA-256: `9e0516bf4ee8eca17f052805b48deba5c151c048c20dd1bfda129df4f17128e7`, 0 MB, downloaded 2026-09-26 04:16:01
- Kind: empty (no commit)
- Claimed version: 0.39.265 (registry none, file name 0.39.265); filed under 0.39.258 to keep the line in order

