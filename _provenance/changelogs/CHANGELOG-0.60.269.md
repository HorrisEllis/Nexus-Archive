# Nexus 0.60.269

**0.60.269 — The wizard's FAQ, buyer questions and pricing dropdowns**

| | |
|---|---|
| Built | 2026-10-26 13:01:18 → 2026-10-28 13:13:58 |
| Builds on the main line | 1 |
| Other archives filed here | 2 |
| Versions the builds claimed | 0.60.224, 0.60.269, 0.60.273 |
| Tag | `v0.60.269` → snap-0784 |
| Full file ledger | [LEDGER-0.60.269.csv](../ledger/LEDGER-0.60.269.csv) |

## Release notes — `CHANGELOG-0.60.224.md`

Copied unchanged from the build.

### 0.60.224 — 2026-10-23

James: "next"

#### Why

The self-building loop's map orders SL2 after SL1: close the out-of-date backlog by evidence, not by guessing. "pending" is often out
of date (GA1 shipped in 0.60.161 and still said pending), and every phase left open wrongly holds back everything that depends on it
(DG1).

#### Built (SL2)

- **`lib/phase-close.js` 1.1.0.**
  - `evidenceTests(phases, { root })` finds the tests that may judge each open phase.
  - `byEvidence({ phases, root, dryRun = true, setStatus })` runs those tests, each test once, two or three at a time. A phase closes as
    `DONE <date>. by evidence — <tests>` only if every file exists and every one of its tests passes.
  - A failing test keeps the phase open and names the test, and a timeout counts as failed. A missing file keeps it open and names the
    file. No test keeps it open, said: "no test can check it".
- **What may judge a phase**, decided by the axioms (TRUTH_OVER_COHERENCE, §0.1):
  - **its own:** a test file the phase names in `files:`;
  - **linked:** a test tied to one of its files by require or path (lib/test-map.js) that is specific to that file. Specific means the
    test is named for the file, or is one of at most 3 tests that reach it, on a file at most 3 open phases share.
  - Why it is narrower than "tests linked to its files": that wording gave 158 checkable phases, many judged by tests that only require a
    store every test uses.
- **Each test runs in its own sandbox and process group** (`lib/test-sandbox.js` `childEnv`, as `tests/modules/run-all.js` does), and is
  killed with anything it started.
- **Doors:**
  - the route `POST /api/repos/:uuid/phases/evidence` (`{ apply, limit, map }`; a dry run unless `apply: true`);
  - the command `repo evidence <repo> [--apply] [--limit n] [--map …]`;
  - the Phases tab's "⚖ done by evidence?": a dry run that lists what would close and what a failing test keeps open. "close N" asks
    before writing.
- Each close is kept in `idearium_phase_closes` (kind `evidence`) and recorded on the activity log.

#### The first dry run over Nexus (nothing written)

`docs/2026-10-23-evidence-dry-run.md` lists every phase with its tests.

- 137 open phases could be judged. 202 distinct tests ran in 13 minutes: 180 passed, 1 timed out.
- **107 would close.** Only **2** of them close on their own test: G0 and PS1_phase_specs. The other 105 close on a test that is specific
  to one of their files. That shows the file works, not that the phase's whole intent was built.
- 30 stay open because a test failed.

Nothing was applied to Nexus's maps. Closing 107 phases at once is a cost he would want to see first. To confirm with him: apply the 2
"own" ones, all 107, or a subset he picks from the list.

#### Found

- **Fixed:** the first dry run spawned tests without a sandbox, and they wrote ledgers into `data/` and `cortex/data/`. Three of those
  files went into a commit (untracked again in c5c787c5's parent); the rest were moved out of the tree and kept.
- **Not traced yet:** even sandboxed, some test writes `failure_mode` nodes into `cortex/data/nodes/failure_mode`, which is not one of the
  sandbox's stores. Reported; the files were moved out of the tree and kept.

#### Proof

- `tests/modules/test-evidence-close.test.js` 5/5:
  - **EC-01** which tests may judge a phase;
  - **EC-02** the dry run with real tests in a fixture tree: one closes on a passing test, one stays on a failing test, one stays with no
    test, one stays on a missing file, and a hot shared file's test does not count;
  - **EC-03** apply through the real writer, and a refusing writer keeps the phase open, said;
  - **EC-04** the real API on a repo: dry run, apply, the map says `DONE … by evidence`, the record is kept, and nothing is left to check;
  - **EC-05** the Phases tab in Clear Glass: the dry run is sent with `apply: false`, the list shows, and close asks first.

## Release notes — `CHANGELOG-0.60.269.md`

Copied unchanged from the build.

### 0.60.269 — The wizard's FAQ, buyer questions and pricing dropdowns

James, 2026-10-26: "continue." This picked up what 0.60.268 said the wizard still left: the FAQ behind "Add FAQ", and the pricing
dropdowns.

#### What changed (FW2)
On each page, the gig fill now also does what that page asks:

| Page | What the fill does |
|---|---|
| Description & FAQ | For each FAQ: press "+ Add FAQ", type the question and the answer into the boxes that appear, press Add |
| Requirements | For each buyer question: press "Add New Question", type it, press Add |
| Pricing | For each package column, choose the Delivery Time and Revisions dropdowns by the number (`-1` means Unlimited) |

Both native dropdowns and Fiverr's own work.

- An FAQ or question already on the page is not added twice.
- A row with no control in it is reported. The first try skipped one silently, which this test caught.

#### Proof
`clear-glass/test/gig-wizard.test.js` runs in real Electron, on the local wizard. Overview, Pricing, Description and Requirements are each
filled in turn, then it stops at Gallery.

| What the page held when it moved on | Value |
|---|---|
| Delivery Time, per package | 3, 5 and 7 days |
| Revisions, per package | 1, 2, Unlimited |
| FAQs | both added |
| Buyer questions | both added |

None of them are left to copy. These are unchanged: gig-dropdown, field-query, autofill-inline, gig-file, clear-glass-autofill 16/16,
agent-doors 7/7.

#### Not checked
Fiverr's real pages. Their button words ("+ Add FAQ", "Add New Question", "Add") are matched as shown on Fiverr. If one differs, the fill
says which part it could not do.

## Ledger

### Build 0.60.269 — snap-0784 — 2026-10-26 13:01:18

- Archive: `nexus-0784_2026-10-26_v0.60.269_update.zip` (was `nexus-0.60.269-update.zip`)
- SHA-256: `938461671e7d3acfab7ae20d0f7a73ada4e900766be56d2d75c4cb02cd1d90d9`, 0.4 MB, downloaded 2026-10-26 13:01:31
- Kind: overlay (a patch laid over the build before it)
- Commit: `1760ce254e08fbde1b563b23b5221da79f149305`, tag `snap-0784`
- Files in archive: 24. Changes against the build before it: **8 added, 16 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 4 | 13 | 0 |
| (root) | 4 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.60.266.md
A CHANGELOG-0.60.267.md
A CHANGELOG-0.60.268.md
A CHANGELOG-0.60.269.md
M VERSION
M clear-glass/docs/gigs/ai-agent-workflow-automation.gig
M clear-glass/docs/gigs/ai-coding-assistant-setup.gig
M clear-glass/docs/gigs/browser-automation-autofill.gig
M clear-glass/docs/gigs/bug-fix-root-cause.gig
M clear-glass/docs/gigs/electron-desktop-app.gig
M clear-glass/docs/gigs/local-ai-ollama-setup.gig
M clear-glass/docs/gigs/nodejs-automation-scraping.gig
M clear-glass/docs/gigs/software-spec-architecture.gig
M clear-glass/docs/gigs/test-suite-qa.gig
M clear-glass/package.json
M clear-glass/src/autofill/gig.js
M clear-glass/src/copilot/verbs.js
M clear-glass/src/ipc/bridge.js
A clear-glass/test/gig-dropdown.electron.js
A clear-glass/test/gig-dropdown.test.js
A clear-glass/test/gig-wizard.electron.js
A clear-glass/test/gig-wizard.test.js
M lib/version.js
M package.json
```

### artifact — 0785 — 2026-10-28 05:45:58

- Archive: `nexus-0785_2026-10-28_v0.60.269-side_15_declared-0.60.224.zip` (was `nexus-15.zip`)
- SHA-256: `a4020584c31a63b47519ca04339800d3ea797edd902e5918a326ec19df81cdbb`, 0.9 MB, downloaded 2026-10-28 05:47:27
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 0.60.224 (registry 0.60.224, file name none); filed under 0.60.269 to keep the line in order
- Commit: `7cedaaeb8aa0ebec338b247b2d2c2b559c2a63ec`, tag `snap-0785`
- Files in archive: 78. Changes against the build before it: **78 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0785_2026-10-28_v0.60.224_15 | 78 | 0 | 0 |

```
A nexus-0785_2026-10-28_v0.60.224_15/CHANGELOG-0.60.221.md
A nexus-0785_2026-10-28_v0.60.224_15/CHANGELOG-0.60.222.md
A nexus-0785_2026-10-28_v0.60.224_15/CHANGELOG-0.60.223.md
A nexus-0785_2026-10-28_v0.60.224_15/CHANGELOG-0.60.224.md
A nexus-0785_2026-10-28_v0.60.224_15/VERSION
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/FP1_where_a_request_opens.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/FP2_which_option_is_meant.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/FP4_what_a_key_changed.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/FP5_the_pricing_page_blocks.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/graph/FP1_where_a_request_opens-5a34e2c1af78339b.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/graph/FP2_which_option_is_meant-658e5ff2172b9e5a.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/graph/FP4_what_a_key_changed-22e789abdd34d323.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-first-principles/graph/FP5_the_pricing_page_blocks-e7a16c180aa01659.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/FG1_keyboard_mode_switch.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/FG2_dropdown_choose.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/FG5_fiverr_gig_flow.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/FG6_blocks_ui.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/graph/FG1_keyboard_mode_switch-9a9dc6581e12d0ea.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/graph/FG2_dropdown_choose-08c4739a2ba8d8b7.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/graph/FG5_fiverr_gig_flow-216aea9c663a7a59.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-gated-flows/graph/FG6_blocks_ui-a43be0af6c52f6cb.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/TC1_a_compartment_per_tab.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/TC2_one_webview_per_tab.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/TC3_links_open_tabs.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/TC4_pop_out_and_dock.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/TC5_new_tab_chooser.phase
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/graph/TC1_a_compartment_per_tab-fd7600396fa1b517.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/graph/TC2_one_webview_per_tab-28c3c752658ba747.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/graph/TC3_links_open_tabs-305d1614c57d93a7.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/graph/TC4_pop_out_and_dock-0443ed76584f9e29.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/phases/2026-10-28-tab-compartments/graph/TC5_new_tab_chooser-46eb739d167a39d2.graph
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/renderer/browser.css
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/renderer/browser.html
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/renderer/browser.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/renderer/gig-panel.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/spec/flow-cores.spec
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/spec/gated-flows.spec
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/spec/tab-compartments.spec
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/autofill/gig-pages.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/autofill/gig-pricing.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/autofill/gig.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/driver/index.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/ipc/bridge.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/macros/recorder-script.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/macros/recording.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/main/compartment-window.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/main/index.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/page/option-match.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/page/page-memory.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/page/state-diff.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/preload/index.js
A nexus-0785_2026-10-28_v0.60.224_15/clear-glass/src/tabs/open-decision.js
A nexus-0785_2026-10-28_v0.60.224_15/docs/2026-10-28-first-principles-phasemap.spec
A nexus-0785_2026-10-28_v0.60.224_15/docs/2026-10-28-gated-flows-phasemap.spec
A nexus-0785_2026-10-28_v0.60.224_15/docs/2026-10-28-tab-compartments-phasemap.spec
A nexus-0785_2026-10-28_v0.60.224_15/docs/SPEC-REGISTRY.spec
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P1/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P2/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P3/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P4/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P5/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/docs/framework-trial/answers/P6/claudecode-B-1.md
A nexus-0785_2026-10-28_v0.60.224_15/fiverr-0.60.221-224.patch
A nexus-0785_2026-10-28_v0.60.224_15/lib/agent-tools/tools/browser/browser-action.js
A nexus-0785_2026-10-28_v0.60.224_15/lib/agent-tools/tools/clear-glass/gate-eval.js
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-first-principles/FP3_is_the_gate_open.phase
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-first-principles/graph/FP3_is_the_gate_open-b97321d3c42d3424.graph
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-gated-flows/FG3_gate_per_step.phase
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-gated-flows/FG4_pointer_and_choose_steps.phase
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-gated-flows/graph/FG3_gate_per_step-f27d7a0f3a2314d7.graph
A nexus-0785_2026-10-28_v0.60.224_15/lib/phases/2026-10-28-gated-flows/graph/FG4_pointer_and_choose_steps-60773f0036bb8229.graph
A nexus-0785_2026-10-28_v0.60.224_15/lib/version.js
A nexus-0785_2026-10-28_v0.60.224_15/loom/maps/build-surface-map.js
A nexus-0785_2026-10-28_v0.60.224_15/package.json
A nexus-0785_2026-10-28_v0.60.224_15/tests/modules/run-all.js
A nexus-0785_2026-10-28_v0.60.224_15/tests/modules/test-compartment-window.test.js
A nexus-0785_2026-10-28_v0.60.224_15/tests/modules/test-fiverr-works.test.js
A nexus-0785_2026-10-28_v0.60.224_15/tests/modules/test-substrate-spec.test.js
```

### artifact — 0786 — 2026-10-28 13:13:58

- Archive: `nexus-0786_2026-10-28_v0.60.269-side_18_declared-0.60.273.zip` (was `nexus-18.zip`)
- SHA-256: `6a8bd4398967385f9fdef046dbb21ae996a7b0ec4fe42688038f5472a5d27509`, 1.4 MB, downloaded 2026-10-28 13:30:39
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 0.60.273 (registry 0.60.273, file name none); filed under 0.60.269 to keep the line in order
- Commit: `b6919cefae6e87f381188edb3ff834b1fa303760`, tag `snap-0786`
- Files in archive: 156. Changes against the build before it: **156 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0786_2026-10-28_v0.60.273_18 | 156 | 0 | 0 |

```
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.261.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.262.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.263.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.264.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.265.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.266.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.267.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.268.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.269.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.270.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.271.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.272.md
A nexus-0786_2026-10-28_v0.60.273_18/CHANGELOG-0.60.273.md
A nexus-0786_2026-10-28_v0.60.273_18/VERSION
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-first-principles/FP1_where_a_request_opens.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-first-principles/FP2_which_option_is_meant.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-first-principles/FP4_what_a_key_changed.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-first-principles/FP5_the_pricing_page_blocks.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-gated-flows/FG1_keyboard_mode_switch.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-gated-flows/FG2_dropdown_choose.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-gated-flows/FG5_fiverr_gig_flow.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-gated-flows/FG6_blocks_ui.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-tab-compartments/TC1_a_compartment_per_tab.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-tab-compartments/TC2_one_webview_per_tab.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-tab-compartments/TC3_links_open_tabs.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-tab-compartments/TC4_pop_out_and_dock.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/phases/2026-10-28-tab-compartments/TC5_new_tab_chooser.phase
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/autofill-inline.css
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/autofill-inline.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/browser.css
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/browser.html
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/browser.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/gig-panel.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/settings.html
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/settings/sections/about.css
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/settings/sections/about.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/renderer/site-profile-groups.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/spec/browser-shell.spec
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/spec/flow-cores.spec
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/spec/gated-flows.spec
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/spec/tab-compartments.spec
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/about/index.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/autofill/gig-pages.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/autofill/gig-pricing.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/autofill/gig.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/autofill/suggest.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/dom/archaeology.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/driver/index.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/ipc/bridge.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/macros/recorder-script.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/macros/recording.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/main/compartment-window.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/main/index.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/page/attention.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/page/keyboard-mode.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/page/option-match.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/page/page-memory.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/page/state-diff.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/preload/index.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/preload/webview-bridge.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/site-settings/keys.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/site-settings/readers.js
A nexus-0786_2026-10-28_v0.60.273_18/clear-glass/src/tabs/open-decision.js
A nexus-0786_2026-10-28_v0.60.273_18/cos/spec/cos-spine.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/2026-10-26-inline-autofill-ui-phasemap.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/2026-10-28-first-principles-phasemap.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/2026-10-28-gated-flows-phasemap.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/2026-10-28-run-log-and-direction.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/2026-10-28-tab-compartments-phasemap.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/SPEC-REGISTRY.spec
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P1/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P2/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P3/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P4/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P5/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/framework-trial/answers/P6/claudecode-B-1.md
A nexus-0786_2026-10-28_v0.60.273_18/docs/nexus-nerve.spec
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/CHANGELOG.md
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/MANIFEST.json
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/PATCH-NOTES.md
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/README.md
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/ROADMAP.md
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/archive/hostile-index.pre-patch.ts.txt
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/package.json
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/adaptive/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/api/server.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/behavior/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/bridge/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/dispatcher/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/hostile/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/observer/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/registry/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/replay/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/routing/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/selector/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/telemetry/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/src/types/index.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/adaptive.test.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/hostile.test.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/integration.test.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/replay.test.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/run.js
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tests/suite.ts
A nexus-0786_2026-10-28_v0.60.273_18/erosmancer/erosmancer-os/tsconfig.json
A nexus-0786_2026-10-28_v0.60.273_18/guardian/lib/provider-routing.js
A nexus-0786_2026-10-28_v0.60.273_18/idearium/api/index.js
A nexus-0786_2026-10-28_v0.60.273_18/idearium/cli/route-commands.js
A nexus-0786_2026-10-28_v0.60.273_18/idearium/ui/js/repo-versions.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/agent-tools/tools/browser/browser-action.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/agent-tools/tools/clear-glass/gate-eval.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/automation-nodes.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/automation/routes.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/jaa-store.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/nerve-ollama-bridge.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/nexus-self/change-pack.js
A nexus-0786_2026-10-28_v0.60.273_18/lib/phases/2026-10-28-first-principles/FP3_is_the_gate_open.phase
A nexus-0786_2026-10-28_v0.60.273_18/lib/phases/2026-10-28-gated-flows/FG3_gate_per_step.phase
A nexus-0786_2026-10-28_v0.60.273_18/lib/phases/2026-10-28-gated-flows/FG4_pointer_and_choose_steps.phase
A nexus-0786_2026-10-28_v0.60.273_18/lib/version.js
A nexus-0786_2026-10-28_v0.60.273_18/loom/maps/build-surface-map.js
A nexus-0786_2026-10-28_v0.60.273_18/package.json
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/clear-glass-library-ui.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/run-all.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-about-and-nodes.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-autofill-chips.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-cg-gig-autofill.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-change-pack.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-compartment-window.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-fiverr-pace.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-fiverr-works.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-nerve-pointer-stream.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-run-log-fixes.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-site-a11y-and-dropdowns.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-site-settings-ui.test.js
A nexus-0786_2026-10-28_v0.60.273_18/tests/modules/test-substrate-spec.test.js
```

20 more (mostly data, logs and archived files) are in the ledger file.

