# Nexus 0.39.228

**NEXUS 0.39.228 — the home UI in one JS + one CSS file per area; stored-mode boot crash fixed**

| | |
|---|---|
| Built | 2026-09-25 07:15:50 → 2026-09-25 07:15:50 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.228 |
| Tag | `v0.39.228` → snap-0655 |
| Full file ledger | [LEDGER-0.39.228.csv](../ledger/LEDGER-0.39.228.csv) |

## Release notes — `CHANGELOG-0.39.228.md`

Copied unchanged from the build.

### NEXUS 0.39.228 — the home UI in one JS + one CSS file per area; stored-mode boot crash fixed

**Date:** 2026-09-25 · **Author:** James Brooks · home-ui.spec 1.3.0 → 1.4.0

James: *"The ui is the index.html file."* — the 0.39.223 handoff aimed the UI-file rule at Clear Glass's `renderer/browser.js`; the UI meant is `ui/home/index.html`. Then: *"Can you start on that?"* · *"Continue"*.

#### Mapped first
- CSS was already external (`home.css`, 941 lines, shared). The monolith was the JS: 1,950 + 188 inline lines.
- `ui/home/nexus-home.html` (July's decomposed shell) registers 11 channel documents; **only 4 exist** (causal, conversations, idearium, log). The other 7 are not in git history (which starts 2026-09-17). `index.html` is the only working home — Clear Glass's menu opens it — so it was split **in place**, not cut over. Recorded in `DECOMP.md`.

#### The split
- `index.html` 2,943 → 835 lines, markup only.
- `ui/home/areas/` — 20 areas, each `<area>.js` + `<area>.css`: void, rail, shell, inspect, console, overview, log, guardian, cortex, idearium, bridge, diagnose, assistant, causal, conversations, rewind, mode-selector, agent-suite, forge-tile, spec-wizard.
- `ui/home/core/` — 6 non-UI modules: logging, config, keys, sse, ui-state, boot.
- `home.css` keeps tokens, reset, layer containers, shared keyframes, and components several channels use (`.gd-box`/`.box-*`, `.btn`, form elements, `.gap-row`, `.box-input`).
- JS cut as **contiguous ranges of the original script, in original order** — nothing rewritten — so the split is provable.
- 43 lines of `home.css` deleted: identical to `ui/tv-shell/spotlight/spotlight.css`, which loads earlier, and nothing between them targets those selectors. The duplicate `.sys-tile{transition:…}` was **kept** (moved to `overview.css`): it overrides the earlier `.sys-tile` rule, so it is not dead.

#### Bug found and fixed
With a mode in localStorage, `initMode` → `selectMode` → `_logToData` touched `_uiLog` in its temporal dead zone and threw. That halted the rest of the inline script: `pollHealth`, `connectSSE` and every interval never started, and every later `_logToData` threw. Anyone who had ever picked a mode got a home UI with no health and no live events. home-ui.spec had phase 2 "Silent mode restore" as complete. `core/logging.js` now loads first.

#### Proof
`tests/probe/home-split-equivalence.py` — real headless Chromium, both pages served identically, non-local requests aborted, CSS animation time frozen. Reference: the pre-split monolith from git with **only** the logging fix applied. With and without a stored mode, every channel (`tune(0..n)`) and overlay state (menu, inspect, rewind, mode, wizard, console, rail-add); typeof of 126 top-level names; 45 computed properties per element → **EQUIVALENT**.

#### Records
- `docs/home-ui.spec` 1.4.0: phase 8 (the split), phase 2 annotated `broken_until` with what was found, `version_history` added (1.3.0's content stated as unknown, not guessed). `SPEC-REGISTRY.spec` entry updated.
- `loom/maps/ui-map.js`: the home page had no loom entry. Its edges are `<script>`/`<link>` loads the source scanner cannot see; registered from `index.html`'s own tags so the map cannot drift — 49 components, 48 wires, 0 failures against a real `LoomDriver`.
- `lib/version.js` + `package.json` → 0.39.228.
- **Not changed, checked:** no registry-components / interaction-contract (the home UI serves no HTTP surface of its own); no atlas covers `ui/home`.

#### Tests
- NEW `test-home-ui-files` 14/14 — markup-only index, JS/CSS pairs, every file linked once, logging first, ownership (home.css names no channel; no area styles another's channel); 7 mutation checks, each caught.
- `home-ui` 22/22 (was 19: its CSS checks read `index.html` after the CSS had moved to `home.css`). It and `nexus-full-audit` (87 → 90) now read the assembled page via `tests/helpers/home-page-source.js`.
- Regression: version-sync 30, record-discipline 9, loom-map 19, cg-settings-ui-files 5.

#### Not done / open
- Ownership refinements that are not pure cuts (`tuneById` sits in `agent-suite.js`).
- DECOMP Phase 3 (iframe cut-over) — blocked on the 7 missing channel documents.
- Live check on James's machine with services running.
- Pre-existing, unrelated: `nexus-full-audit` "co-pilot sends uiState" fails (the string is in `ui/copilot/copilot.js`); `test-tablet-homepage` reads a missing `tablet/homepage.html`; 0.39.227's changelog says `test-cg-settings-ui-files` 6/6, the file has 5 tests.

## Ledger

### Build 0.39.228 — snap-0655 — 2026-09-25 07:15:50

- Archive: `nexus-0655_2026-09-25_v0.39.228.zip` (was `Nexus_v0_39_228.zip`)
- SHA-256: `d245b4ea84b3d326b42291ead8e7f9a1bea852b12e784fb1b523dc5983db7296`, 29.5 MB, downloaded 2026-09-25 07:25:36
- Kind: full
- Commit: `a777796c9e5c66d7e57ed212ae7869e90e9144e8`, tag `snap-0655`
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5264. Changes against the build before it: **777 added, 51 modified, 64 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 650 | 0 | 62 |
| data | 48 | 5 | 0 |
| ui | 46 | 3 | 0 |
| clear-glass | 24 | 13 | 2 |
| tests | 7 | 6 | 0 |
| guardian | 0 | 12 | 0 |
| docs | 0 | 6 | 0 |
| (root) | 2 | 3 | 0 |
| loom | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.227.md
A CHANGELOG-0.39.228.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/core.js
A clear-glass/renderer/settings/sections/accounts.css
M clear-glass/renderer/settings/sections/accounts.js
A clear-glass/renderer/settings/sections/autofill.css
A clear-glass/renderer/settings/sections/autofill.js
A clear-glass/renderer/settings/sections/automation.css
A clear-glass/renderer/settings/sections/automation.js
D clear-glass/renderer/settings/sections/browser.js
A clear-glass/renderer/settings/sections/connections.css
A clear-glass/renderer/settings/sections/connections.js
A clear-glass/renderer/settings/sections/copilot.css
A clear-glass/renderer/settings/sections/copilot.js
A clear-glass/renderer/settings/sections/diagnostics.css
A clear-glass/renderer/settings/sections/diagnostics.js
A clear-glass/renderer/settings/sections/eros.css
A clear-glass/renderer/settings/sections/eros.js
A clear-glass/renderer/settings/sections/fingerprint.css
A clear-glass/renderer/settings/sections/fingerprint.js
A clear-glass/renderer/settings/sections/general.css
A clear-glass/renderer/settings/sections/general.js
A clear-glass/renderer/settings/sections/macros.css
M clear-glass/renderer/settings/sections/macros.js
A clear-glass/renderer/settings/sections/mesh.css
M clear-glass/renderer/settings/sections/mesh.js
A clear-glass/renderer/settings/sections/privacy.css
A clear-glass/renderer/settings/sections/privacy.js
A clear-glass/renderer/settings/sections/providers.css
M clear-glass/renderer/settings/sections/providers.js
A clear-glass/renderer/settings/sections/suite.css
M clear-glass/renderer/settings/sections/suite.js
D clear-glass/renderer/settings/sections/system.js
M clear-glass/renderer/settings/settings.css
M clear-glass/spec/clear-glass.spec
A clear-glass/src/jobs/intake.js
M clear-glass/src/main/index.js
M docs/2026-09-22-clear-glass-tab-per-repo-and-ui-expansion-phasemap.spec
M docs/2026-09-23-handoff.md
M docs/SPEC-REGISTRY.spec
M docs/atlases/clear-glass-atlas.md
M docs/atlases/guardian-atlas.md
M docs/home-ui.spec
M guardian/lib/dispatch-ladder.js
M guardian/lib/dispatcher.js
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
M lib/version.js
M loom/maps/accounts-authority-map.js
M loom/maps/ui-map.js
M package-lock.json
M package.json
M run-all.js
A tests/helpers/home-page-source.js
M tests/home-ui.test.js
M tests/modules/clear-glass-screen-qa-ui.test.js
M tests/modules/run-all.js
A tests/modules/test-cg-job-intake.test.js
A tests/modules/test-cg-settings-ui-files.test.js
M tests/modules/test-guardian-job-correlation.js
A tests/modules/test-guardian-job-persistence.js
A tests/modules/test-home-ui-files.test.js
A tests/modules/test-system-record-discipline.js
M tests/modules/version-sync-and-registry.test.js
M tests/nexus-full-audit.js
A tests/probe/home-split-equivalence.py
M ui/home/DECOMP.md
A ui/home/areas/agent-suite.css
A ui/home/areas/agent-suite.js
A ui/home/areas/assistant.css
A ui/home/areas/assistant.js
A ui/home/areas/bridge.css
A ui/home/areas/bridge.js
A ui/home/areas/causal.css
A ui/home/areas/causal.js
A ui/home/areas/console.css
A ui/home/areas/console.js
A ui/home/areas/conversations.css
A ui/home/areas/conversations.js
A ui/home/areas/cortex.css
A ui/home/areas/cortex.js
A ui/home/areas/diagnose.css
A ui/home/areas/diagnose.js
A ui/home/areas/forge-tile.css
A ui/home/areas/forge-tile.js
A ui/home/areas/guardian.css
A ui/home/areas/guardian.js
A ui/home/areas/idearium.css
A ui/home/areas/idearium.js
A ui/home/areas/inspect.css
A ui/home/areas/inspect.js
A ui/home/areas/log.css
A ui/home/areas/log.js
A ui/home/areas/mode-selector.css
A ui/home/areas/mode-selector.js
A ui/home/areas/overview.css
A ui/home/areas/overview.js
A ui/home/areas/rail.css
A ui/home/areas/rail.js
A ui/home/areas/rewind.css
A ui/home/areas/rewind.js
A ui/home/areas/shell.css
A ui/home/areas/shell.js
A ui/home/areas/spec-wizard.css
A ui/home/areas/spec-wizard.js
A ui/home/areas/void.css
A ui/home/areas/void.js
A ui/home/core/boot.js
A ui/home/core/config.js
A ui/home/core/keys.js
A ui/home/core/logging.js
A ui/home/core/sse.js
A ui/home/core/ui-state.js
M ui/home/home.css
M ui/home/index.html
```

765 more (mostly data, logs and archived files) are in the ledger file.

