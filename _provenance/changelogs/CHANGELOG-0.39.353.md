# Nexus 0.39.353

**0.39.353 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 14:56:46 → 2026-10-05 14:56:46 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.353 |
| Tag | `v0.39.353` → snap-0736 |
| Full file ledger | [LEDGER-0.39.353.csv](../ledger/LEDGER-0.39.353.csv) |

## Release notes — `CHANGELOG-0.39.353.md`

Copied unchanged from the build.

### 0.39.353 — 2026-10-05

James: "need a little pull tab on the very right for when i close the plan."

CT9 done (mapped first in `docs/2026-10-05-code-tab-and-one-router-phasemap.spec` 1.3.0).

- **The pull tab.** While a repo is open and the Plan panel is closed, a tab sits on the very right edge of the window, at mid-height. It has PLAN written down it, the done count (15/32), and a blinking dot while a step is building.
  - A click opens the panel, and opening hides the tab.
  - It follows the repo view (`planTabSync`, called on open, close, `setView` and `setRepoSubtab`), so there is no tab on the repos grid or other pages.
- **Found on the way.** The Plan's current gate was meant to pulse (BS11), but its `animation: pulse` named keyframes that were never defined, so it sat still. They are defined now.
- **Tests.** `test-code-tab` 16/16. CT-40, driven in Clear Glass: the tab is flush with the right edge at mid-height, shows its count and dot, opens the panel on a click, hides while the panel is open, and is absent off the repo view. The probes are unchanged: W4 and BS10 fail the same way they did before.

## Ledger

### Build 0.39.353 — snap-0736 — 2026-10-05 14:56:46

- Archive: `nexus-0736_2026-10-05_v0.39.353_main-33.zip` (was `Nexus-main-33.zip`)
- SHA-256: `ba74f4d5117f8fe4389ec31f2d541d38d24997bcf3010641b79dddf302416dcc`, 14.7 MB, downloaded 2026-10-05 15:24:53
- Kind: full
- Commit: `5eec74db044d409bdcd668840d20069682bbd1b6`, tag `snap-0736`
- Files in archive: 5313. Changes against the build before it: **1 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 3 | 0 |
| idearium | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
A CHANGELOG-0.39.353.md
M docs/2026-09-29-build-surface-phasemap.spec
M docs/2026-10-05-code-tab-and-one-router-phasemap.spec
M docs/SPEC-REGISTRY.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/plan-panel.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M package.json
M tests/modules/test-code-tab.test.js
```

