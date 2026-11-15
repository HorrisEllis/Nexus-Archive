# Nexus 0.39.240

**NEXUS 0.39.240 — the Library is in Clear Glass's ☰ menu**

| | |
|---|---|
| Built | 2026-09-25 11:55:12 → 2026-09-25 11:55:12 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.240 |
| Tag | `v0.39.240` → snap-0664 |
| Full file ledger | [LEDGER-0.39.240.csv](../ledger/LEDGER-0.39.240.csv) |

## Release notes — `CHANGELOG-0.39.240.md`

Copied unchanged from the build.

### NEXUS 0.39.240 — the Library is in Clear Glass's ☰ menu

**Date:** 2026-09-25 · clear-glass 3.12.0 → 3.12.1

James: *"also needs to be clearglass library. like added to the 3 lines menu"*, then, correcting my first reading (the page menus in `ui/home` and `ui/tv-shell`): *"no. clearglass/renderer/index.html"*.

Clear Glass's window is `clear-glass/renderer/browser.html` + `browser.js` (there is no `renderer/index.html`).
- **Before:** its ☰ menu (`#bookmark-mgr-btn`) had Downloads, Site Settings, History and Background Tabs. The Library window (bookmarks, history, downloads, agent responses, accounts, macros, autofill, passwords) opened only from the tray.
- **Now:** a fixed **📚 Library** row after History.
  - It opens the same window the tray does (agentId `nexus-library`, `http://127.0.0.1:9000/ui/library/`) through `cg.window.open` → `window:open` → `openAgentWindow`.
  - A failure is shown as a toast.
  - No new route.

#### Proof
- **Clicked in headless Chromium** on the real `browser.html` and `browser.js`, with `window.ClearGlass` stood in by an object built from the real preload's namespaces:
  - ☰ shows 📚 Library between History and Background Tabs.
  - Clicking it produced exactly one `cg.window.open({ agentId: 'nexus-library', url: 'http://127.0.0.1:9000/ui/library/' })`.
  - The menu closed, and there were no page errors.
  - Probe: `tests/probe/clearglass-menu-library.py`. It derives the stand-in and the command registry from the source at run time.
- **`clear-glass-library-ui`** 24 → 28. It pins the row and checks that its agentId and URL equal the tray entry's, so the two can't drift.
- **`version-sync`** 30/30.

## Ledger

### Build 0.39.240 — snap-0664 — 2026-09-25 11:55:12

- Archive: `nexus-0664_2026-09-25_v0.39.240.zip` (was `Nexus_v0_39_240.zip`)
- SHA-256: `5e077c4a1583e78812e229ce60a233a5c63aa78e31a8488499c8b6bad106550f`, 99.3 MB, downloaded 2026-09-25 11:56:19
- Kind: full
- Commit: `5ae16562fb584e9147fd085a4455e089d46df03c`, tag `snap-0664`
- Left out: embedded .git (1129 files, HEAD 53b8e385bc820954d39c1eb9bc4d870fcca385d2)
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 3779. Changes against the build before it: **2 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 6 | 0 |
| (root) | 1 | 2 | 0 |
| tests | 1 | 2 | 0 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.240.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/browser.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/main/index.js
M docs/2026-09-23-handoff.md
M docs/atlases/clear-glass-atlas.md
M lib/version.js
M package-lock.json
M package.json
M tests/modules/clear-glass-library-ui.test.js
M tests/modules/version-sync-and-registry.test.js
A tests/probe/clearglass-menu-library.py
```

