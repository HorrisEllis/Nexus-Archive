# Nexus 0.60.142

**0.60.142 — 2026-10-17**

| | |
|---|---|
| Built | 2026-10-17 14:58:50 → 2026-10-17 14:58:50 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.142 |
| Tag | `v0.60.142` → snap-0763 |
| Full file ledger | [LEDGER-0.60.142.csv](../ledger/LEDGER-0.60.142.csv) |

## Release notes — `CHANGELOG-0.60.142.md`

Copied unchanged from the build.

### 0.60.142 — 2026-10-17

James: "modified a file but no where to be found. i want to see it live in the code tab. plan panel  isn't bonud to the tab
like the other. fix it please. like i want the agents work to stream live to the changes tab or when viewing the file in
the files tab, like i want to see all agent responses in realtime,"

He sent three screenshots of the Code tab while Gemini built IM1:
- Gemini at "WRITING · 7287 mutations · no reply text read yet" for more than four minutes.
- Code › changes showing "no changes yet".
- The Plan floating over the tab, while every other panel sat in the dock's column.

Mapped in `docs/2026-10-16-code-tab-rebuild-phasemap.spec` addendum (h).

#### Why nothing showed

Gemini thinks first. Its thinking goes in `<model-thoughts>`, and its reply element stays empty until the thinking ends.
The job's live stream sent only the reply text, and Guardian dropped any chunk that had no text. So minutes of the agent's
work never reached Idearium, and there was nothing to show anywhere.

The live views did exist, but only in Code › plans and the Plan panel. They were not in Code › changes or on the open file.

#### LV1 — the thinking streams

- The transcript streamers in all five provider userscripts now send the assistant turn's thinking with its text. Each
  script got a new version: Gemini 10.10.3, Claude and ChatGPT 10.12.3, DeepSeek 10.10.3, Perplexity 10.9.3.
- Guardian passes a chunk that carries only thinking.
- The live views show the thinking, marked as thinking, until the reply starts. Then the thinking folds away under "its
  thinking".

#### LV2 — live in Code › changes and on the open file

- Code › changes opens with the agent at work: the provider, the job, its thinking and its reply as it is written. A card
  appears for each file it is writing, then the changes that landed.
- The open file in Code › files shows the agent's version of that file as it is being written, the whole of it so far.
  This stays until the file lands as a proposal, whose card then shows the diff as before.

#### LV3 — the Plan is bound to the tab

- The Plan is now the first panel in the dock's column, like the others. It is bound to the Code tab and to the rail.
- ⧉ pops it out to a window you can move, and docks it back. The choice is remembered in this browser.

#### LV4 — picks that keep working

A selector picked with ◎ was stored exactly as picked. On Angular pages that pick includes three kinds of volatile parts:
- per-build classes (`ng-tns-c3086213896-11`);
- state classes that exist only while the model is typing (`processing-state-visible`);
- the reply's position in that one chat (`:nth-of-type(2)`).

A selector like that stops matching. Picks are now stored without the volatile parts, and read without them too. That
repairs a pick already saved on his PC without picking again. The pick as it was made stays on its evidence.

#### Proof

| Test | Result | What it covers |
|---|---|---|
| `test-live-everywhere` | 3/3 (new) | Guardian passes thinking. Gemini's real streamer, run in a sandbox, sends the thinking first and then the reply. His Gemini pick is cleaned, repaired on read, and stored stable. |
| `test-agent-live` | 5/5 | LS-05 (new, in Clear Glass): the thinking shows before the reply; Code › changes streams each file it is writing; the open file streams as it is written. LS-04 passes again. It had failed since the live slot moved out of the default view in 0.60.107. |
| `test-plan-pieces` | 4/4 | PP-03: the Plan docked as the first panel, popped out beside the column, and docked again. |

Neighbouring suites:

| Suite | Result |
|---|---|
| test-code-dock | 10/10 |
| test-code-tab | 16/16 |
| test-plan-sidebar | 4/4 |
| test-chat-transcripts | 31/31 |
| test-back-and-forth | 18/18 |
| test-live-stream-and-gates | 13/13 |
| test-chat-ledger-stream | 16/16 |
| test-cg-selector-assign | 9/9 (1 skipped) |
| test-ncp-half-open | 3/3 |
| test-phases-tab | 5/5 |
| test-hardening-pass | 9/9 |
| test-plan-code-run-attention | 40/40 |
| test-step-gate | 18/18 |

`test-guardian-job-correlation` fails 2 checks, and fails the same 2 on main.

#### Open

- **Gemini's reply could still go unread after the thinking ends.** If that happens, it now shows: the thinking streams
  while the reply stays empty, and the gate still says "no reply was read".
- **What this does not prove.** The streamers ran in a sandbox here. A real Gemini page on his PC is the first real check.

## Ledger

### Build 0.60.142 — snap-0763 — 2026-10-17 14:58:50

- Archive: `nexus-0763_2026-10-17_v0.60.142.zip` (was `nexus-0.60.142.zip`)
- SHA-256: `8c01ef7d03afd513e6239e9472d62dbe04f8c1841508ce338870b8575b5d72fa`, 24 MB, downloaded 2026-10-17 15:22:46
- Kind: full
- Commit: `8be52cfe7c354a16e9a49d4ed9b7ca9d7f6e06c2`, tag `snap-0763`
- Files in archive: 6130. Changes against the build before it: **5 added, 33 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 12 | 0 |
| tests | 2 | 6 | 0 |
| guardian | 0 | 7 | 0 |
| (root) | 2 | 2 | 0 |
| docs | 0 | 3 | 0 |
| lib | 1 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
A CHANGELOG-0.60.141.md
A CHANGELOG-0.60.142.md
M VERSION
M docs/2026-10-16-code-tab-rebuild-phasemap.spec
M docs/2026-10-17-pieces-not-order-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M guardian/lib/ncp-handler.js
M guardian/lib/selector-map.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/ui/css/code-surface.css
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/code-dock.js
M idearium/ui/js/code-surface.js
M idearium/ui/js/plan-panel.js
M idearium/ui/js/work-surface.js
M idearium/ui/settings.html
M lib/pipeline-routing.js
A lib/test-first.js
M lib/version.js
M loom/maps/build-surface-map.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-agent-live.test.js
M tests/modules/test-contract-phase-build.test.js
A tests/modules/test-live-everywhere.test.js
M tests/modules/test-phase-deps-gate.test.js
M tests/modules/test-plan-pieces.test.js
M tests/modules/test-qa2-real-run.test.js
A tests/modules/test-test-first.test.js
```

