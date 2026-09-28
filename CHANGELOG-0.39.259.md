# NEXUS 0.39.259: copilot has all of Clear Glass; a job/freelance pipeline; one door to every memory

**Date:** 2026-09-27 · clear-glass 3.15.0 → 3.16.0 · copilot 3.7.0 → 3.8.0 · idearium 4.8.0 → 4.9.0 · tool guide 1.0.1 → 1.1.0 · repo-prompt-blocks 1.0.0 → 1.1.0

James:

> *"i want copilot completely aware of clearglass, hooked in completely. all of it, copilot can use it. do anything you can to help me automate job applications, fiverr, etc. expand it as much as possible. idearium agents should be able to find the context easily when talking to them, all of the memory systems, graphs, etc"*

## What the map showed before building

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

## Added — Clear Glass, whole, for copilot

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

## Added — the opportunity pipeline (`lib/opportunity/`, `nexus.opportunity.tool`, `cli/opportunity.js`, copilot `/api/opportunity/*`)

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

## Added — the context atlas (`lib/context-atlas.js`, `nexus.context.tool`, idearium + copilot `/api/context/*`)

**What it gives:**
- **`directory`:** every cortex table with its row count, what it is and which tool reads it, plus repo graphs, blueprint, specs, changelogs, and vector memory where it is initialised.
- **`search`:** one query across all of it. Every hit cites its source and id; **`get`** returns the whole record.
- Telemetry tables are opt-in and named in `skipped`. Identifiers are not searched.

**Idearium repo agents:**
- Two new editable blocks in Settings → Agents: **`{memory}`** (the question searched across everything; this repo's own learned facts and graph are boosted) and **`{directory}`** (where memory lives; sent only with tools). Both show in the preview; turn one off and its search does not run.
- `nexus.context.tool` is always in a repo agent's scope, including hats forged before it existed.
- Agent tab: **`/recall <words>`** and **`/atlas`**.
- Routes: `GET /api/context/{directory,search,get}` and `GET /api/repos/:uuid/context`.

## Tests

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

## Not done

- **Not tested live against:**
  - the public job APIs (this environment's egress allowlist blocked them);
  - a running Electron window;
  - CDP upload;
  - a real LinkedIn/Fiverr page.
- Fiverr/Upwork reply-box and submit detection are heuristic. `node cli/opportunity.js recipe <host> replySelector=… submitSelector=…` pins them per site.
- There is no inbox or email watcher for replies. Responses are marked by you or an agent.
- Idearium's Settings UI shows the two new blocks through the existing editor. There is no dedicated opportunity UI yet: the CLI, the copilot routes, the tool and the Clear Glass palette are the surfaces.
