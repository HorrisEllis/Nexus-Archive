# Nexus 0.60.180

**0.60.180 — 2026-10-21 — the window designed properly, Guardian's agents in one place, the bridge set up by itself**

| | |
|---|---|
| Built | 2026-10-20 04:55:00 → 2026-10-20 04:55:00 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.180 |
| Tag | `v0.60.180` → snap-0770 |
| Full file ledger | [LEDGER-0.60.180.csv](../ledger/LEDGER-0.60.180.csv) |

## Release notes — `CHANGELOG-0.60.180.md`

Copied unchanged from the build.

### 0.60.180 — 2026-10-21 — the window designed properly, Guardian's agents in one place, the bridge set up by itself

James, 2026-10-21, after the 0.60.179 screenshots: "show me the ui. lets design it" · "need to have it nice and clear. access to all
guardian agent stuff. need to have the bridge setup automatically." · "omg this looks bad. enterprise grade, production quality.
outliar level ui"

His verdict was right, and the calls are his. The coder's part: what was wrong in the shots, the design, the code.

#### What was wrong (the coder's read of the 0.60.179 shots)
- **Emoji for every icon.** Every OS draws them differently, and they read as a prototype.
- **Layout gaps.** A narrow address bar, a black void for a new tab, and an empty bookmarks strip.
- **An unfinished co-pilot pane.** It was still in the older monospace style, with a grey bar where the mic should be.
- **Guardian's agents behind a menu row, and its panel was wrong.** The panel read `p.hosted` while the provider host sends `running`, so
  every agent always showed **Start**, even when it was running. That is the screenshot he sent. The same field was read wrong in the
  Options list.
- **A Snowflake bridge line he had to find and paste himself.**

#### Also found: a bug the redesign itself introduced, fixed before release
Drawn icons put an `<svg>` inside each button. `browser.js` decided "a click outside closes the menu" by comparing `e.target.id` with the
button's id, so a click on the icon opened the ☰ menu and closed it in the same moment. Three such checks (☰, the agent mesh, the
bookmark dialog) now use `closest()`. Positions are measured from the button, not its icon.

#### Built
- **BS8, design system.**
  - `renderer/shell/icons.js`: one drawn icon set (24-unit grid, 1.75 stroke, round caps; the Firefox Proton / Lucide manner). It needs
    no font and no network. Every toolbar button, the window controls, the mic, the identity badge and each plugin uses it.
  - `shell.css`: type, spacing and elevation scales on Settings' palette. Tabs are rounded and lift when active. A 48px toolbar.
  - The address bar now starts at most of the row (his 0.60.7 auto-size and drag are kept). The site identity reads green 🔒, amber ⚠,
    or violet ❄ in a Snowflake window. An empty bookmarks strip is hidden.
- **BS9, the Guardian hub** (`renderer/shell/agents.js`). A toolbar button with a running-count badge opens:
  - every NCP agent, in its brand colour, with its real state (running, crashed, health): Open and Stop when running, Start when not, and
    Start every agent;
  - the Guardian tools: agent mesh and queue, pick an element (assign a provider's selectors), Guardian scripts, the mesh HUD, accounts and
    profiles, chat capture.
- **BS10, a start page** (`renderer/shell/newtab.js`). Drawn by the browser over a blank tab, never inside a site:
  - a greeting and a search box;
  - the agents as cards, one press to start or open;
  - bookmarks as tiles;
  - Snowflake's state with Start, and the floating CLI.

  It hides the moment the tab goes somewhere.
- **BS11, the co-pilot pane** (`renderer/shell/copilot.css`, CSS only):
  - the route as one segmented control;
  - readable messages, his on the right;
  - one composer with the context chips, the mic inside, and Send.
- **SF7, the bridge set up automatically.** `NetService.ensureBridge` runs before every start (the Start button, `net start`, Open with
  Snowflake):
  - a line he set himself is never replaced;
  - with no line set, it takes the first one on the machine (Tor Browser, the installed bundle, the snowflake-client package);
  - with none there, it asks the Tor Project's builtin list. This supersedes the coder's 0.60.178 rule that this was his button only; the
    old rule is kept in the spec, marked superseded. The page says the request goes to bridges.torproject.org directly;
  - the source is recorded and shown. If nothing answers, Start says what was tried, in order.
- **Settings → Network leads with one status card:** Connected / Connecting / Off, where the bridge came from, the exit address, and Start
  or Stop and Check the circuit. Start installs the programs first if they're missing. The programs and the bridge line sit under
  Advanced, which opens by itself only when something needs him.

#### Measured
- `test-browser-shell` 12/12, with three new checks in Clear Glass's own engine:
  - BST-09: every toolbar button draws an icon, no emoji is left, the address bar takes the row, and the empty strip is hidden;
  - BST-10: the hub shows real state per agent and the right actions, the badge counts running agents, Start calls the real API, and the
    old panel reads `running`;
  - BST-11: the start page appears on a blank tab, its search navigates, and it hides after navigating.
- `test-snowflake` 9/9:
  - SFW-09: a set line is kept, otherwise a local one is used, otherwise the Tor Project is asked; refusals are said; every start path
    sets the bridge up first;
  - SFW-08: now checks the status card first, then Advanced.
- Unchanged: `test-compartment-downloads` 6/6, `test-net-routes` 24/24, `test-cg-network-ui` 4/4, `test-substrate-spec` 3/3,
  `test-loom-map` 19/19. `clear-glass-library-ui` fails only Ctrl+J, as on the base.

#### Not done, and said
- His running app is on `main` (0.60.176). 0.60.177–0.60.180 are on the branch, so none of this is in the window he is using until it is
  merged.
- Electron's main process and live providers are not in this sandbox. The hub is tested against the documented provider API, not a
  live Guardian.

## Ledger

### Build 0.60.180-r1 — snap-0769 — 2026-10-20 04:55:00

- Archive: `nexus-0769_2026-10-20_v0.60.180-r1.zip` (was `nexus-0.60.180.zip`)
- SHA-256: `ab8575e53fb7f933dcb8d628c6559f655c9897b3129262c2f9a88fc9a644496c`, 24.8 MB, downloaded 2026-10-20 05:01:50
- Kind: full
- Commit: `6564429c6e584ecbd777a3f5d486d7d340cffa6c`, tag `snap-0769`
- Files in archive: 6464. Changes against the build before it: **228 added, 73 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 85 | 27 | 0 |
| lib | 79 | 14 | 0 |
| docs | 16 | 8 | 0 |
| idearium | 12 | 5 | 0 |
| tests | 13 | 4 | 0 |
| (root) | 11 | 3 | 0 |
| cortex | 6 | 1 | 0 |
| orchestrator | 4 | 1 | 0 |
| emerge | 1 | 3 | 0 |
| loom | 0 | 2 | 0 |
| _archive | 1 | 0 | 0 |
| architecture-spec | 0 | 1 | 0 |
| auth | 0 | 1 | 0 |
| cos | 0 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A CHANGELOG-0.60.170.md
A CHANGELOG-0.60.171.md
A CHANGELOG-0.60.172.md
A CHANGELOG-0.60.173.md
A CHANGELOG-0.60.174.md
A CHANGELOG-0.60.175.md
A CHANGELOG-0.60.176.md
A CHANGELOG-0.60.177.md
A CHANGELOG-0.60.178.md
A CHANGELOG-0.60.179.md
A CHANGELOG-0.60.180.md
M NODE-TAXONOMY.md
M VERSION
M architecture-spec/registry/watcher.js
M auth/index.js
A clear-glass/phases/2026-10-21-browser-shell/BS10_new_tab.phase
A clear-glass/phases/2026-10-21-browser-shell/BS11_copilot_pane.phase
A clear-glass/phases/2026-10-21-browser-shell/BS1_firefox_import.phase
A clear-glass/phases/2026-10-21-browser-shell/BS2_shell_rebuild.phase
A clear-glass/phases/2026-10-21-browser-shell/BS3_menus.phase
A clear-glass/phases/2026-10-21-browser-shell/BS4_extensions.phase
A clear-glass/phases/2026-10-21-browser-shell/BS5_downloads_panel.phase
A clear-glass/phases/2026-10-21-browser-shell/BS6_float_cli.phase
A clear-glass/phases/2026-10-21-browser-shell/BS7_surface.phase
A clear-glass/phases/2026-10-21-browser-shell/BS8_design_system.phase
A clear-glass/phases/2026-10-21-browser-shell/BS9_agents_hub.phase
A clear-glass/phases/2026-10-21-compartment-downloads/CD1_magnet_parse.phase
A clear-glass/phases/2026-10-21-compartment-downloads/CD2_quarantine_downloads.phase
A clear-glass/phases/2026-10-21-compartment-downloads/CD3_verified_handoff.phase
A clear-glass/phases/2026-10-21-compartment-downloads/CD4_kill_on_disconnect.phase
A clear-glass/phases/2026-10-21-compartment-downloads/CD5_surface.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF1_honest_detection.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF2_bridge_sources.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF3_page_in_the_compartment.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF4_https_only.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF5_circuit_check.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF6_surface.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF7_bridge_automatic.phase
M clear-glass/plugins/adblocker/manifest.json
M clear-glass/plugins/captcha-pause/manifest.json
M clear-glass/plugins/guardian-listeners/manifest.json
M clear-glass/plugins/passwords/manifest.json
M clear-glass/plugins/permissions/manifest.json
A clear-glass/plugins/snowflake/index.js
A clear-glass/plugins/snowflake/manifest.json
M clear-glass/plugins/zoom/manifest.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/float-cli.css
A clear-glass/renderer/float-cli.html
A clear-glass/renderer/float-cli.js
A clear-glass/renderer/page-map-panel.js
M clear-glass/renderer/settings.html
A clear-glass/renderer/settings/sections/import.css
A clear-glass/renderer/settings/sections/import.js
M clear-glass/renderer/settings/sections/network.css
M clear-glass/renderer/settings/sections/network.js
A clear-glass/renderer/shell/agents.js
A clear-glass/renderer/shell/copilot.css
A clear-glass/renderer/shell/downloads.js
A clear-glass/renderer/shell/extensions.js
A clear-glass/renderer/shell/icons.js
A clear-glass/renderer/shell/menus.js
A clear-glass/renderer/shell/newtab.js
A clear-glass/renderer/shell/shell.css
A clear-glass/renderer/shell/shell.js
A clear-glass/spec/browser-shell.spec
M clear-glass/spec/clear-glass.spec
A clear-glass/spec/compartment-downloads.spec
A clear-glass/spec/snowflake.spec
M clear-glass/src/contexts/manager.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
A clear-glass/src/driver/cg-stub.js
M clear-glass/src/driver/index.js
A clear-glass/src/import/firefox.js
M clear-glass/src/ipc/bridge.js
A clear-glass/src/main/float-cli.js
M clear-glass/src/main/index.js
A clear-glass/src/net/bridge-sources.js
A clear-glass/src/net/compartment.js
A clear-glass/src/net/https-only.js
A clear-glass/src/net/installer.js
A clear-glass/src/net/kill-switch.js
A clear-glass/src/net/magnet.js
A clear-glass/src/net/qbittorrent.js
A clear-glass/src/net/quarantine.js
M clear-glass/src/net/service.js
M clear-glass/src/net/transport-host.js
M clear-glass/src/page/attention.js
A clear-glass/src/page/blocks.js
A clear-glass/src/page/page-map.js
A clear-glass/src/page/page-memory.js
A clear-glass/src/page/page-session.js
M clear-glass/src/page/semantic-tree.js
A clear-glass/src/plugins/context-items.js
M clear-glass/src/plugins/host.js
M clear-glass/src/plugins/schema.js
M clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
A cortex/phases/2026-10-20-belief-loop/CY1_lifecycle_and_injection.phase
A cortex/phases/2026-10-20-substrate-graph-traversal-chunking-gating/DK1_dynamic_chunking.phase
A cortex/phases/2026-10-21-data-layout/DL6_cortex_server.phase
M cortex/spec/cortex.spec
M cos/foundation/file-browser.js
M diagnostic/nexus-diagnostic.js
M docs/2026-10-05-verified-primitives-phasemap.spec
M docs/2026-10-15-clear-glass-network-posture-phasemap.spec
M docs/2026-10-17-decisions-by-the-axioms.spec
A docs/2026-10-19-idearium-control-phasemap.spec
A docs/2026-10-19-infrastructure-spine-phasemap.spec
A docs/2026-10-19-pipeline-root-causes-phasemap.spec
M docs/2026-10-19-solid-build-foundation-phasemap.spec
A docs/2026-10-19-upload-intent-and-page-map-phasemap.spec
A docs/2026-10-20-belief-loop-phasemap.spec
A docs/2026-10-20-substrate-graph-traversal-chunking-gating-phasemap.spec
A docs/2026-10-21-browser-shell-phasemap.spec
A docs/2026-10-21-compartment-downloads-phasemap.spec
A docs/2026-10-21-data-layout-phasemap.spec
A docs/2026-10-21-snowflake-compartment-phasemap.spec
M docs/CLAUDE.md
A docs/HANDOFF-2026-10-19-verify-first-and-dag.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
A docs/atlases/data-census.md
A docs/belief-loop.spec
A docs/data-layout.spec
M docs/nexus-nerve.spec
A docs/pipeline.spec
A docs/substrate.spec
M emerge/SPEC_COMPILER.spec
M emerge/compiler/kg-builder.js
A emerge/compiler/phase-specs.js
M emerge/emerge-kernel.js
M guardian/lib/node-registry.js
M idearium/api/index.js
M idearium/cli/route-commands.js
A idearium/phases/2026-10-20-belief-loop/CY3_belief_panel.phase
A idearium/phases/2026-10-20-substrate-graph-traversal-chunking-gating/CH3_chunk_inspector.phase
A idearium/phases/2026-10-20-substrate-graph-traversal-chunking-gating/GR3_graph_query_surface.phase
A idearium/phases/2026-10-20-substrate-graph-traversal-chunking-gating/GW3_gate_panel.phase
A idearium/phases/2026-10-21-data-layout/DL4_one_repo_folder.phase
M idearium/repo/watcher.js
A idearium/ui/css/upload-intent.css
M idearium/ui/index.html
M idearium/ui/js/code-tab-panels.js
A idearium/ui/js/upload-intent.js
A lib/agent-self-model.js
M lib/agent-tools/index.js
```

151 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.60.180-r2 — snap-0770 — 2026-10-20 04:55:00

- Archive: `nexus-0770_2026-10-20_v0.60.180-r2_1.zip` (was `nexus-0.60.180-1.zip`)
- SHA-256: `0fa88a2774601dd7e0433b0aa7c601c4b595acf35f5bce9b0123bc9cc41a43bc`, 24.9 MB, downloaded 2026-10-20 05:06:36
- Kind: full
- Commit: `cda869aec76575987d6ca3b6b8592975875d1e17`, tag `snap-0770`
- Files in archive: 6465. Changes against the build before it: **1 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 0 | 0 |

```
A powershell.exe
```

