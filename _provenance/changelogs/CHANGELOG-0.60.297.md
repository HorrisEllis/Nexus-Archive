# Nexus 0.60.297

**0.60.297 — the accessibility look traced to what turns it on, kept off by the site's settings; a real panel in the popup**

| | |
|---|---|
| Built | 2026-10-30 02:25:16 → 2026-10-30 02:25:16 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.297 |
| Tag | `v0.60.297` → snap-0789 |
| Full file ledger | [LEDGER-0.60.297.csv](../ledger/LEDGER-0.60.297.csv) |

## Release notes — `versionium/changelogs/CHANGELOG-0.60.297.md`

Copied unchanged from the build.

### 0.60.297 — the accessibility look traced to what turns it on, kept off by the site's settings; a real panel in the popup

James, 2026-10-30, with fiverr.com still in yellow-on-black links and the Site settings popup showing the reset's red note:
> "look at the accessability. needs to actually hook into the back end settings. looks lazy also."

#### Grounded first

- **0.60.283's reset looked only at names.** It looked for classes, storage and cookies named accessibility. On his Fiverr page it found
  nothing: 127 storage keys and 50 cookies, none of them named accessibility, with links in rgb(255,255,0) on rgb(0,0,0).
- **The look was never traced to the rule that paints it.** So whatever turns it on under another name stayed on.
- **"Off" was one setting, the Tab switch.** Nothing per site recorded what to keep off.

#### Built (AC2)

- **The look is traced to its cause, whatever it is named** (`keyboard-mode.js` `traceScript`). The trace gives:
  - the link's colours;
  - the stylesheet rules that paint it;
  - for each rule, the class or attribute on the page that switches it on (its trigger);
  - the system's forced colours or contrast setting, if on;
  - the site's own accessibility control (any control named accessibility, or a widget such as UserWay or accessiBe).
- **Kept off by the backend settings.**
  - Each trigger and each rule has a switch.
  - A switch writes the per-site setting `accessibility.keepOff` (validated by the key table).
  - Main applies it at every load of the site (`_siteOnLoad` → `keepOffScript`). It stays off when the site puts it back (a MutationObserver).
  - Undo removes the entry and reloads.
- **The site's own settings, one click away.** A look the site keeps on its server, for his account, is turned off in the site's own
  settings. "Open the site's accessibility settings" clicks the control the trace found. It is opened for him, never toggled.
- **The panel** (`renderer/a11y-panel.js` + `.css`) replaces the red reset row:
  - a sample link in the page's real colours;
  - a switch per cause, each with its state;
  - the site's control;
  - a warning when the system forces colours;
  - the old sweep, kept as "Clear what the site stored".

  The old row is archived in `_archive/2026-10-30-a11y-reset-row/`.
- **Agents have the same.** `glass a11y`, `glass a11y keep <class:…|attr:…|rule:…> [--off]` and `glass a11y open <n>` all go through
  `POST /cli/site-a11y`.

#### Readings (to confirm)

- **"hook into the back end settings"** is read as two things:
  1. what turns the look off is a Clear Glass per-site setting, applied at every load;
  2. a look Fiverr keeps on its server is turned off in Fiverr's own settings, which Clear Glass now opens.
- **"looks lazy"** is read as the popup's bare button and red paragraph.

#### Proof

- `test-a11y-trace` 5/5, in Clear Glass:
  - A2-01: a look switched on by `body[data-hc]` (not named accessibility) is traced to its rule and trigger, and the site's button is found.
  - A2-02: kept off, the setting is written, and the look stays off after a reload and when the site puts it back.
  - A2-03: the control is opened.
  - A2-04: the panel draws and writes through.
  - A2-05: the setting itself.
- Still green: test-site-settings-ui 3/3 (the row count now leaves out the key with its own panel), test-fiverr-overview-and-a11y 6/6,
  test-site-a11y-and-dropdowns 3/3, test-site-keys 5/5, test-substrate-spec 3/3, test-loom-map 19/19.
- Failing the same on the base, so not this release: CL-07 (needs Guardian running), BS7-04.

#### Open

- Whether Fiverr's look comes from a rule on the page, from a sheet on another origin, or from the system's contrast theme is answered
  by "Find what turns it on" on his machine. The panel says which.

## Ledger

### Build 0.60.297 — snap-0789 — 2026-10-30 02:25:16

- Archive: `nexus-0789_2026-10-30_v0.60.297.zip` (was `nexus-0.60.297.zip`)
- SHA-256: `6b89e917c261a3ec8cc6fff04de917476755b6f87d6e383fa568a5e4f4cefcf9`, 33.2 MB, downloaded 2026-10-30 03:40:48
- Kind: full
- Commit: `0a96060293e53ecbbed572d8fab62be5dec99525`, tag `snap-0789`
- Identical copy: `nexus-0789_2026-10-30_v0.60.297_1_dup1.zip` (was `nexus-0.60.297-1.zip`)
- Files in archive: 12668. Changes against the build before it: **9 added, 29 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 3 | 12 | 0 |
| lib | 1 | 5 | 0 |
| tests | 1 | 5 | 0 |
| docs | 0 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| versionium | 2 | 0 | 0 |
| _archive | 1 | 0 | 0 |
| idearium | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |

```
M VERSION
A _archive/2026-10-30-a11y-reset-row/browser.js._a11yResetRow.js
A clear-glass/automation/nodes/fiverr-gig.pipeline
A clear-glass/renderer/a11y-panel.css
A clear-glass/renderer/a11y-panel.js
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/settings/sections/pipelines.js
M clear-glass/renderer/site-profile-groups.js
M clear-glass/spec/gated-flows.spec
M clear-glass/src/autofill/suggest.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/page/keyboard-mode.js
M clear-glass/src/preload/index.js
M clear-glass/src/site-settings/keys.js
M clear-glass/src/site-settings/readers.js
M docs/2026-10-28-gated-flows-phasemap.spec
M docs/2026-10-29-pipelines-phasemap.spec
M docs/automation-pipelines.spec
M idearium/cli/route-commands.js
M lib/automation-nodes.js
M lib/automation/pipeline.js
M lib/automation/routes.js
M lib/node-export.js
A lib/node-schemas/schema.pipeline
M lib/version.js
M loom/maps/build-surface-map.js
M package.json
A scripts/build-fiverr-pipeline.js
M tests/modules/automation-nodes.test.js
M tests/modules/run-all.js
A tests/modules/test-a11y-trace.test.js
M tests/modules/test-about-and-nodes.test.js
M tests/modules/test-pipeline-nodes.test.js
M tests/modules/test-site-settings-ui.test.js
A versionium/changelogs/CHANGELOG-0.60.296.md
A versionium/changelogs/CHANGELOG-0.60.297.md
```

