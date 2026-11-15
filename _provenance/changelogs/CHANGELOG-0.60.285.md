# Nexus 0.60.285

**0.60.285 — Idearium's history as nodes, one per unit; Versionium's release backfill off its own process**

| | |
|---|---|
| Built | 2026-10-28 22:52:52 → 2026-10-28 22:52:52 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.285 |
| Tag | `v0.60.285` → snap-0787 |
| Full file ledger | [LEDGER-0.60.285.csv](../ledger/LEDGER-0.60.285.csv) |

## Release notes — `CHANGELOG-0.60.285.md`

Copied unchanged from the build.

### 0.60.285 — Idearium's history as nodes, one per unit; Versionium's release backfill off its own process

James, 2026-10-29, after pasting a full run log: "i want all the history in idearium saved as nodes per unit. like a .reponse, .input, all
of the taxonomy and expand if needed." · "what about .node types for each language/code block for each agent?"

Specced first: `docs/idearium-history-nodes.spec`. It compiles in emerge's kg-builder at full depth.
Mapped: `docs/2026-10-29-history-nodes-phasemap.spec`, with its DAG checked.

#### What was lost before
Every exchange with a repo's agent was one row in `repo_agent_log`:
- the message cut at 4000 characters and the reply at 8000;
- the tool calls the agent made dropped;
- code blocks not kept apart from the text.

The row stays (the screens read it). The nodes are now the record.

#### One exchange, as nodes
Written to `idearium/data/nodes/<type>/<id>.<type>`, where Idearium's own node registry indexes and validates them:

| node | holds |
|---|---|
| `.exchange` | the unit: repo, hat, provider, model, ok/error, time, and the ids of its parts |
| `.input` | the whole message |
| `.response` | the whole reply, never cut |
| `.tool_call` | one per tool the agent called: name, arguments, result, ok (a refused call is kept as failed) |
| `.code_block` | one per fenced block: language as written and normalized, code, lines, sha256, and the agent (provider, model, hat) |

A unit over 2 MB is capped and says so, with its size and hash.

#### Decided by his axioms — his to overturn
- **HN_D1.** `.input` and `.response` are reused (his words name them). `.response`'s `jobId` is widened by a dated addendum: an
  Idearium exchange with no job uses its exchange id, and says so with `source: idearium.repo-agent`. New types only where none existed.
- **HN_D2.** On "what about .node types for each language/code block for each agent?": **one `.code_block` type**, with the language and the
  agent as fields, not a type per language or per agent. A type per language would be the same schema dozens of times (NC0: a language
  is data; §5.13: syntax is not architecture). "Every Python block Claude wrote" is a query:
  `repo history-nodes <repo> --lang python --provider claude`.

#### Wired
- `lib/repo-agent.js` `_log` writes the nodes for every new exchange, with the whole reply and the tool calls. A write error is logged,
  never thrown into the dispatch.
- **Backfill:** `repo history-nodes <repo> --backfill` (POST `/api/repos/:uuid/history-nodes/backfill`) turns the old log rows into nodes.
  Replies the log had cut are marked `truncated: true`, not passed off as whole. A second backfill writes nothing new.
- **Read:** `repo history-nodes <repo> [--lang l] [--provider p] [--limit n]` (GET `/api/repos/:uuid/history-nodes`).
- Loom: `lib/repo-history-nodes.js` with its wires (repo-agent, the Idearium API, node-export).

#### Open
- HN4: the rest of Idearium's history (runs, activity, notes) as nodes.
- HN5: a screen for them.

#### Also fixed — the coder's regression from 0.60.278
His run log showed Versionium unresponsive for 1113 s at boot. 0.60.278 made the release sync backfill every release's commits
(`git log -p` over the whole history) inside Versionium's own process. Now:
- the boot sync records the recent releases and answers at once;
- the whole-history backfill runs in a child process (`versionium/lib/release-backfill-worker.js`, `syncInWorker`), one at a time,
  posted in batches;
- `{ all: true }` still waits for it, when asked.

#### Proof
- test-history-nodes 5/5 (every node valid against its schema; the whole reply past 8000; the registry indexes them, none invalid;
  backfill honest and idempotent; read by language and agent; route and command).
- test-release-backfill-off-process 2/2 (the parent keeps ticking while the backfill runs).
- test-versionium-everywhere 7/7, test-substrate-spec 3/3, repo-agent suites (35, 44, 67, 33, 17) and node-registry 11/11 unchanged.
- Failing before and after this release, unchanged: test-node-schemas NS-003/NS-012 (failure_mode against ico.js), test-build-surface BS7-04.

#### Seen in his log, not yet acted on
- Free memory about 9–14% while qwen2.5-coder:7b (5.2 GB) loads.
- Idearium misses heartbeats while the nexus-self sync walks 4801 files.
- A qwen2.5-coder reply that wrote its tool call as a ```tool text block was shown as the answer (`lib/agent-tools` runToolLoop takes a
  reply with no native tool calls as final).

## Ledger

### Build 0.60.285 — snap-0787 — 2026-10-28 22:52:52

- Archive: `nexus-0787_2026-10-28_v0.60.285_22.zip` (was `nexus-22.zip`)
- SHA-256: `5ca121eae26597ea17a6fe4944e1d5e0b06fdeb2ba90a666ddff401fad42977a`, 2.8 MB, downloaded 2026-10-28 22:55:02
- Kind: overlay (a patch laid over the build before it)
- Commit: `4ad57b1faa35014ce8055a83512b6333360eb36d`, tag `snap-0787`
- Files in archive: 740. Changes against the build before it: **213 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 93 | 13 | 0 |
| src | 14 | 0 | 0 |
| 2026-10-28-gated-flows | 12 | 0 | 0 |
| 2026-10-28-first-principles | 10 | 0 | 0 |
| 2026-10-28-tab-compartments | 10 | 0 | 0 |
| settings | 10 | 0 | 0 |
| gigs | 10 | 0 | 0 |
| answers | 6 | 0 | 0 |
| tests | 6 | 0 | 0 |
| page | 5 | 0 | 0 |
| nodes | 5 | 0 | 0 |
| tools | 4 | 0 | 0 |
| autofill | 4 | 0 | 0 |
| main | 3 | 0 | 0 |
| site-settings | 3 | 0 | 0 |
| site-keys | 2 | 0 | 0 |
| preload | 2 | 0 | 0 |
| js | 2 | 0 | 0 |
| macros | 2 | 0 | 0 |
| dom | 1 | 0 | 0 |
| net | 1 | 0 | 0 |
| ipc | 1 | 0 | 0 |
| shell | 1 | 0 | 0 |
| shortcuts | 1 | 0 | 0 |
| driver | 1 | 0 | 0 |
| about | 1 | 0 | 0 |
| tabs | 1 | 0 | 0 |
| options | 1 | 0 | 0 |
| archive | 1 | 0 | 0 |

```
A 2026-10-28-first-principles/FP1_where_a_request_opens.phase
A 2026-10-28-first-principles/FP2_which_option_is_meant.phase
A 2026-10-28-first-principles/FP3_is_the_gate_open.phase
A 2026-10-28-first-principles/FP4_what_a_key_changed.phase
A 2026-10-28-first-principles/FP5_the_pricing_page_blocks.phase
A 2026-10-28-gated-flows/FG1_keyboard_mode_switch.phase
A 2026-10-28-gated-flows/FG2_dropdown_choose.phase
A 2026-10-28-gated-flows/FG3_gate_per_step.phase
A 2026-10-28-gated-flows/FG4_pointer_and_choose_steps.phase
A 2026-10-28-gated-flows/FG5_fiverr_gig_flow.phase
A 2026-10-28-gated-flows/FG6_blocks_ui.phase
A 2026-10-28-tab-compartments/TC1_a_compartment_per_tab.phase
A 2026-10-28-tab-compartments/TC2_one_webview_per_tab.phase
A 2026-10-28-tab-compartments/TC3_links_open_tabs.phase
A 2026-10-28-tab-compartments/TC4_pop_out_and_dock.phase
A 2026-10-28-tab-compartments/TC5_new_tab_chooser.phase
M CHANGELOG-0.60.261.md
M CHANGELOG-0.60.262.md
M CHANGELOG-0.60.263.md
M CHANGELOG-0.60.264.md
M CHANGELOG-0.60.265.md
M CHANGELOG-0.60.266.md
M CHANGELOG-0.60.267.md
M CHANGELOG-0.60.268.md
M CHANGELOG-0.60.269.md
A CHANGELOG-0.60.270.md
A CHANGELOG-0.60.271.md
A CHANGELOG-0.60.272.md
A CHANGELOG-0.60.273.md
A CHANGELOG-0.60.274.md
A CHANGELOG-0.60.275.md
A CHANGELOG-0.60.276.md
A CHANGELOG-0.60.277.md
A CHANGELOG-0.60.278.md
A CHANGELOG-0.60.279.md
A CHANGELOG-0.60.280.md
A CHANGELOG-0.60.281.md
A CHANGELOG-0.60.282.md
A CHANGELOG-0.60.283.md
A CHANGELOG-0.60.284.md
A CHANGELOG-0.60.285.md
A CHANGELOG.md
M MANIFEST.json
A PATCH-NOTES.md
M README.md
A ROADMAP.md
A about/index.js
A answers/P1/claudecode-B-1.md
A answers/P2/claudecode-B-1.md
A answers/P3/claudecode-B-1.md
A answers/P4/claudecode-B-1.md
A answers/P5/claudecode-B-1.md
A answers/P6/claudecode-B-1.md
A apply.js
A archive/hostile-index.pre-patch.ts.txt
A autofill-inline.css
A autofill-inline.js
A autofill/gig-pages.js
A autofill/gig-pricing.js
A autofill/gig.js
A autofill/suggest.js
A browser-shell.spec
A browser.css
A browser.html
A browser.js
A build-surface-map.js
A change-pack.js
A changelogs.js
A clear-glass-library-ui.test.js
A contacts.js
A controller.js
A cos-spine.spec
A dom/archaeology.js
A driver/index.js
A economy-map.js
A engine.js
A float-cli.css
A float-cli.html
A float-cli.js
A flow-cores.spec
A gated-flows.spec
A gig-panel.js
A gigs/ai-agent-workflow-automation.gig
A gigs/ai-coding-assistant-setup.gig
A gigs/browser-automation-autofill.gig
A gigs/bug-fix-root-cause.gig
A gigs/electron-desktop-app.gig
A gigs/gig-template.gig
A gigs/local-ai-ollama-setup.gig
A gigs/nodejs-automation-scraping.gig
A gigs/software-spec-architecture.gig
A gigs/test-suite-qa.gig
A idearium.repo-snapshot.spec
A index.js
A ipc/bridge.js
A js/repo-releases.js
A js/repo-versions.js
A macros/recorder-script.js
A macros/recording.js
A main/compartment-window.js
A main/float-cli.js
A main/index.js
A net/step.js
A nexus-releases.js
A opportunity.js
A options/store.js
M package.json
A page/attention.js
A page/keyboard-mode.js
A page/option-match.js
A page/page-memory.js
A page/state-diff.js
A pipeline.js
A preload/index.js
A preload/webview-bridge.js
A provider-routing.js
A release-backfill-worker.js
A release-notes.js
A releases-map.js
A route-commands.js
A routes.js
M run-all.js
A schema.code_block
A schema.exchange
A schema.response
A schema.tool_call
A settings.html
A settings/core.js
A settings/sections/about.css
A settings/sections/about.js
A settings/sections/applications.css
A settings/sections/applications.js
A settings/sections/general.js
A settings/sections/pipelines.css
A settings/sections/pipelines.js
A settings/sections/shortcuts.css
A settings/sections/shortcuts.js
A shell/shell.js
A shortcuts/site-keys.js
A site-keys/bind-bar.css
A site-keys/bind-bar.js
A site-profile-groups.js
A site-settings/keys.js
A site-settings/readers.js
A site-settings/store.js
A src/adaptive/index.ts
A src/api/server.ts
A src/behavior/index.ts
A src/bridge/index.ts
A src/dispatcher/index.ts
```

76 more (mostly data, logs and archived files) are in the ledger file.

