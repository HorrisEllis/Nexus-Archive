# Nexus 0.60.11

**0.60.11 — 2026-10-13**

| | |
|---|---|
| Built | 2026-10-13 01:02:22 → 2026-10-13 01:02:22 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.11 |
| Tag | `v0.60.11` → snap-0749 |
| Full file ledger | [LEDGER-0.60.11.csv](../ledger/LEDGER-0.60.11.csv) |

## Release notes — `CHANGELOG-0.60.11.md`

Copied unchanged from the build.

### 0.60.11 — 2026-10-13

James: "so why is compartment browser in clearglass ui. should be gone" · "it should have it no where. im scared of regression."

His merged fix (0.60.10) took the label off the browser. The same "compartment · …" label was still drawn in five more places, and all are now removed:
- Settings (`clear-glass/renderer/settings.html`)
- Library (`clear-glass/renderer/library.html`)
- the agent sign-in popup: its title bar, its window title and its element-picker hint (`clear-glass/src/providers/attention.js`)
- Idearium's window bars (`idearium/ui/js/window-chrome.js`)

Regression guard: `tests/modules/test-no-compartment-label.test.js` scans Clear Glass's renderer and source and Idearium's UI, and fails if the label comes back anywhere. The guard found the last two copies itself. `test-accounts-picker-cos` AT-01 now requires the label's absence (40/40).

## Ledger

### Build 0.60.11 — snap-0749 — 2026-10-13 01:02:22

- Archive: `nexus-0749_2026-10-13_v0.60.11_claude-quirky-thompson-kz9xvs.zip` (was `Nexus-claude-quirky-thompson-kz9xvs.zip`)
- SHA-256: `0e91bd397d526a946afee68396a159ab093567b321d5da5825d799de94914550`, 16.3 MB, downloaded 2026-10-13 01:08:56
- Kind: full
- Commit: `eb720b7c73d6b029eecf2a81da85058960cf5280`, tag `snap-0749`
- Files in archive: 5646. Changes against the build before it: **8 added, 28 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 9 | 0 |
| tests | 3 | 3 | 0 |
| (root) | 4 | 1 | 0 |
| idearium | 0 | 5 | 0 |
| lib | 1 | 3 | 0 |
| guardian | 0 | 3 | 0 |
| ollama | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A CHANGELOG-0.60.10.md
A CHANGELOG-0.60.11.md
A CHANGELOG-0.60.8.md
A CHANGELOG-0.60.9.md
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/cos-theme.css
M clear-glass/renderer/library.html
M clear-glass/renderer/settings.html
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/mesh/dom-transport.js
M clear-glass/src/mesh/page/agent-page.js
M clear-glass/src/providers/attention.js
M docs/2026-10-13-identities-tabs-and-automation-phasemap.spec
M guardian/lib/dispatch-ladder.js
M guardian/lib/provider-attention.js
M guardian/options.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/ui/js/app.js
M idearium/ui/js/code-surface.js
M idearium/ui/js/window-chrome.js
M lib/model-door.js
A lib/reasoning-route.js
M lib/repo-agent.js
M lib/version.js
M loom/maps/component-intake-map.js
M ollama/config.js
M ollama/lib/ollama-client.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-accounts-picker-cos.test.js
A tests/modules/test-mesh-chat-reload.test.js
A tests/modules/test-no-compartment-label.test.js
M tests/modules/test-project-decompose.test.js
A tests/modules/test-reasoning-route.test.js
```

