# Nexus 0.39.280

**NEXUS 0.39.280: the build surface — plan a spec bottom-up, build it phase by phase, manage single files, see the plan; honest windows, providers and browsing**

| | |
|---|---|
| Built | 2026-09-29 05:40:08 → 2026-09-29 05:40:08 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.280 |
| Tag | `v0.39.280` → snap-0712 |
| Full file ledger | [LEDGER-0.39.280.csv](../ledger/LEDGER-0.39.280.csv) |

## Release notes — `CHANGELOG-0.39.280.md`

Copied unchanged from the build.

### NEXUS 0.39.280: the build surface — plan a spec bottom-up, build it phase by phase, manage single files, see the plan; honest windows, providers and browsing

**Date:** 2026-09-29 · base: 0.39.279 · MINOR: new routes (below)
**Map:** `docs/2026-09-29-build-surface-phasemap.spec` — written before the work, every phase closed with its proof (BS12 is this release).

James (four messages, one session): *"can you have the electron popup windows for the desktop envirement and settings, be in
a borderless windowed … like i want each spec to have the entire build split into phases, chunked, bottom up, and with the
axioms … per repo settings … a check to make sure its downloaded and configured … when importing a repo the system rewind
menu pops up when clicking continue. baseline deviation needs to recaclute each version or major file change … click on a
spec in the spec tab and have it built … manage … the plan … gates as progress"* · *"make sure you follow, the axioms in the
docs folder, 3.1 … greyed out files, for pending files, that are uncommited … a build button … update the atlas' … versionium,
bump versions, provanance is first class data. nothing lost, or wasted."* · *"map first, everything still pending into
phases, into nexus' phasemap, then begin bottom up, then one by one."* · *"why claude? set to chatgpt … chatgpt had a login
prompt … if i delete a code repo, the original needs to know … i told it to visit google.com and it ran the blue command but
nothing happened … the copilot atlas … as a user guide … the theme for idearium sync and ci tab."*

#### Provenance — the commits, in build order

| phase | commit | what |
|---|---|---|
| map, BS0, BS1 | 1c39dfb | the phasemap; compartment windows; the rewind hit-test fix |
| BS2–BS6 | ff92f14 | library layer: file states, deviation, environment, spec → phasemap, build plan |
| BS7 | 1a9f270 | the API |
| BS8–BS11 | 862414a | the UI: Files, Spec build bar, Settings environment, plan panel |
| map BS13–BS19 | 6d4f6f0 | the fourth message, mapped before building |
| BS13–BS15 | 13c0592 | provider sovereignty, honest git, code-repo retirement |
| BS16 | 42ee7b8 | provider login wall |
| BS17 | 77b1c23 | co-pilot browser verbs |
| BS18 | 6d5f67a | Sync & CI theme |
| BS19 | 4b43000 | copilot atlas as a user guide |
| BS12 | this commit | versions, specs, atlases, loom map, registry, tests registered, regression |

#### Bugs found and fixed (root causes, read not guessed)

- **Rewind popped up on "continue".** The tv-shell/home menu overlay, when closed, is invisible (opacity 0, pointer-events
  none) but its REWIND / INSPECT / SETTINGS buttons set pointer-events:auto — which a child keeps. Three invisible buttons sat
  at the bottom centre over every channel, including Idearium's import modal. Closed now means nothing in it is hit.
  `tests/probe/menu-overlay-hit-chromium.js`: 2/4 before, 4/4 after.
- **"Why Claude? set to ChatGPT."** The chunk asked for chatgpt, but the WARP cascade, when that attempt failed, fell
  through to the next providers — ollama, then claude. A chosen provider is now the only one tried; its failure is reported
  as its own. A code spec whose repo was not found builds as its original's choice. The two tests that pinned the old
  fall-through (WCF-004, WCF-006) now pin the new contract, with the reason.
- **"git worktree failed: warning: … LF will be replaced by CRLF".** The reason shown was git's CRLF warnings, cut before the
  real error. Git now runs without line-ending conversion or warnings, with a 10-minute timeout for large trees, and reports
  its own error lines.
- **The desktop viewer said only "unreachable".** It now shows QEMU's own words and exit code, retries while the VM boots,
  and a VM that dies at once on WHPX/HVF/KVM is retried once in software and says so.
- **"visit google.com … nothing happened."** Clear Glass's co-pilot dropped any driver block that was not strict JSON
  (catch (_) {}) while the pane said "[driver command sent]". Loose blocks are repaired; unreadable ones are reported; "visit
  X" needs no model at all.
- **Deleting a code repo left its original pointing at it** (and the UI offered "open the code" to nothing). The original is
  told; Code builds a new one.

#### New

- **Compartment windows** (Clear Glass): the desktop viewer and settings console open frameless, dark, draggable and
  resizable with their own title bar; the settings console has one dark theme.
- **Build a spec**: the agent splits it into phases — chunked, bottom-up by layer, with the axioms — as a phasemap next to
  the spec (validated by loom's parser; refused if not bottom-up); ▶ Build next / ▶ per phase, each after a Versionium
  snapshot. ▶ on every Phases card.
- **Plan panel**: steps in build order, gates as progress, each step's event ledger, activity; a Start building card on Home.
- **Files**: states against the last version (M/N/D/P/S; proposal-only files greyed); **manage ▾** with ten actions on a
  file or selected lines, with related code from the Code tab's search.
- **Baseline deviation**: from the baseline and since the last version, recalculated on every version and every major file
  change (config `repos.deviation_major_files` / `repos.deviation_major_fraction`).
- **Environment**: downloaded / configured / VM check, the install and test plan from the codebase, every option, Set up
  environment; the settings console embedded in each repo's Settings tab.
- **Provider login wall**: a sign-in nag dismissed; a wall reported; the waiting job says why. No passwords handled.
- **Sync & CI** uses the shared dark controls. **The copilot atlas is a user guide.**

Routes (idearium, under /api/repos/:uuid/): GET files/state · GET|POST deviation · GET|POST environment · POST
environment/setup · GET|POST spec/plan · POST spec/build · GET plan · POST manage. Guardian: POST|GET /api/provider/login.

#### Registry, specs, atlases

- Loom: `loom/maps/build-surface-map.js` — 14 components, 22 hooks, 25 wires (HTTP, preload and deps edges included), wired
  in `loom/bootstrap.js`.
- Spec versions synced to the code (they had drifted — the orchestrator's spec-drift check flagged them): guardian 3.18.0,
  idearium 4.11.0, clear-glass 3.21.0, versionium 3.4.0; dated addenda in guardian.spec, idearium.spec, clear-glass.spec,
  docs/cos.spec. `docs/SPEC-REGISTRY.spec` registers the new phasemap.
- Atlases: idearium, clear-glass, guardian sections; copilot atlas rewritten as a user guide and now held to the strict
  reference rule.

#### Versions

system 0.39.280 · guardian 3.18.0 · idearium 4.11.0 (idearium/package.json synced from a stale 4.7.0) · clear-glass 3.21.0 ·
userscript-chat-stream 1.1.0. Provider userscripts unchanged.

#### Tests

New: test-compartment-window (5), test-build-surface (13), test-build-surface-2 (3), test-cg-copilot-verbs (6); probes
menu-overlay-hit-chromium (4), build-surface-ui-chromium (11), login-wall-chromium (7). Extended: test-cos-workspace
(WS-13, WS-14).

**Regression against 0.39.279** (the full list, 462 files, each run with its own HOME): 84 failing before, 82 after. The run
caught two things this release broke, both fixed before handing back: clear-glass-library-ui (a source check's 200-character
window — the compartment-window hook moved after the shortcut handler) and test-agent-hat-agnostic H-010 (a default
provider in _buildIdentity would have outranked a chunk's own agent — removed; the cascade fix is the real one). Two
previously failing files now pass (test-cg-eros-supervisor, test-guardian-retry-novelty-installs). No new failures.

#### Not done / not proven here

- No real Electron window, WHPX host or VM was run in this environment; no live ChatGPT/Claude login page was checked.
- "spec … not found" when building the ERAVOS code spec (James's screenshot) was NOT reproduced here. What was fixed is
  around it: the failed branch (git's real reason now shown, no CRLF noise) and the provider it fell to. If it recurs,
  the spec folder under idearium's specs root is missing for that uuid — that is the next thing to look at.
- Staging S2 onward (the heal loop on staging) is still open in its own map.

## Ledger

### Build 0.39.280 — snap-0712 — 2026-09-29 05:40:08

- Archive: `nexus-0712_2026-09-29_v0.39.280_main-10.zip` (was `Nexus-main-10.zip`)
- SHA-256: `35f98bb3fd28fea2076d9c9755fe5e54f2500fc496cb0d2819870161a324a340`, 13.3 MB, downloaded 2026-09-29 05:57:34
- Kind: full
- Commit: `eaddc02cfec6fe18fe41d9306d7565b0db828de9`, tag `snap-0712`
- Files in archive: 4905. Changes against the build before it: **562 added, 559 modified, 18 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 95 | 122 | 18 |
| copilot | 96 | 67 | 0 |
| intelligence | 71 | 68 | 0 |
| guardian | 40 | 80 | 0 |
| versionium | 48 | 14 | 0 |
| diagnostic | 61 | 0 | 0 |
| loom | 1 | 52 | 0 |
| data | 28 | 20 | 0 |
| cortex | 47 | 1 | 0 |
| architect | 0 | 35 | 0 |
| orchestrator | 29 | 0 | 0 |
| eravos | 0 | 25 | 0 |
| ollama | 10 | 15 | 0 |
| idearium | 9 | 11 | 0 |
| emerge | 0 | 19 | 0 |
| sentinel | 15 | 0 | 0 |
| tests | 8 | 4 | 0 |
| nexus-healer | 0 | 11 | 0 |
| docs | 2 | 6 | 0 |
| lib | 0 | 3 | 0 |
| (root) | 1 | 2 | 0 |
| ui | 0 | 2 | 0 |
| cos | 1 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
A CHANGELOG-0.39.280.md
M clear-glass/package.json
M clear-glass/renderer/browser.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/verbs.js
A clear-glass/src/main/compartment-window.js
M clear-glass/src/main/index.js
A clear-glass/src/preload/compartment-window.js
A cos/testenv/environment.js
M cos/workspace/index.js
A docs/2026-09-29-build-surface-phasemap.spec
A docs/2026-09-29-provider-economy-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/clear-glass-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/cos.spec
A guardian/input/21be4c17-8aeb-4f45-8348-ebbe70cb9f41.contract
A guardian/input/fdc24fa8-e6bb-4740-9a68-fd1fa1fea613.contract
M guardian/lib/dispatcher.js
A guardian/lib/provider-login.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chat-stream.js
M guardian/userscripts.yaml
A idearium/api/build-surface.js
M idearium/api/index.js
M idearium/lib/config-core.cjs
M idearium/package.json
A idearium/repo/build-plan.js
A idearium/repo/deviation.js
A idearium/repo/file-state.js
M idearium/repo/index.js
A idearium/repo/spec-plan.js
M idearium/spec/idearium.spec
M idearium/ui/desktop.html
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/file-manage.js
M idearium/ui/js/living-spec.js
M idearium/ui/js/phases.js
A idearium/ui/js/plan-panel.js
A idearium/ui/js/repo-environment.js
A idearium/ui/js/window-chrome.js
M idearium/ui/settings.html
M lib/cos-bridge.js
M lib/seam/adapters/warp-cascade.js
M lib/version.js
M loom/bootstrap.js
A loom/maps/build-surface-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-build-surface-2.test.js
A tests/modules/test-build-surface.api.js
A tests/modules/test-build-surface.test.js
A tests/modules/test-cg-copilot-verbs.test.js
A tests/modules/test-compartment-window.test.js
M tests/modules/test-cos-workspace.test.js
M tests/modules/test-nexus-atlas-refs.test.js
M tests/modules/test-warp-cascade-provider-fallback.js
A tests/probe/build-surface-ui-chromium.js
A tests/probe/login-wall-chromium.js
A tests/probe/menu-overlay-hit-chromium.js
M ui/home/areas/shell.css
M ui/tv-shell/tv-shell.css
M versionium/spec/versionium.spec
```

1071 more (mostly data, logs and archived files) are in the ledger file.

