# Nexus 0.60.192

**0.60.192 — 2026-10-21 — Your download manager already kept the stream; now the fallback reads it**

| | |
|---|---|
| Built | 2026-10-21 09:29:52 → 2026-10-21 09:29:52 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.192 |
| Tag | `v0.60.192` → snap-0771 |
| Full file ledger | [LEDGER-0.60.192.csv](../ledger/LEDGER-0.60.192.csv) |

## Release notes — `CHANGELOG-0.60.192.md`

Copied unchanged from the build.

### 0.60.192 — 2026-10-21 — Your download manager already kept the stream; now the fallback reads it

James, 2026-10-21: "look in clearglass download manager"

You were right. Your 0.39.278 idea already kept exactly what 0.60.191 rebuilt. Your words then: "use the download manager in clearglass for
the chat ledgers … live streams the dom mutation live to the download manager, that way we don't lose progress." The page's own DOM
mutator writes every chat, turn by turn, into an append-only ledger in Clear Glass's download manager, with "still generating" marked on
every line.

#### What I got wrong in 0.60.191
I wrote a second copy of the stream into Guardian's `.response` nodes instead of reading your ledger. That's the drift your
reuse-before-build rule exists to stop. The copy is removed. It was a true duplicate, so removing it is allowed, and the removal is said
here. Both files I had changed are now byte-for-byte what they were before 0.60.191.

#### What's built in its place
- **Guardian reads your ledger.** When a reply wasn't captured, Guardian replays the job's chat from your download manager, finds the
  job's prompt and takes the reply after it. It only takes it once the page has stopped generating, so a reply still being typed is never
  counted as an answer.
- **It reads through Clear Glass's own route** (`GET /cli/downloads/ledgers/:chatKey`), not by reaching into its code. One small client,
  `lib/chat-ledger-client.js`.
- **The dispatcher asks it in two places**, after the job's own answer, the `.response` node and the settled transcript have come up
  empty:
  - before re-sending a job, so a reply that's already in your ledger is used instead of typing your prompt again;
  - before failing a job whose tab died mid-reply, so it completes from what the page streamed instead of "pick the reply with ◎".

#### Found on the way
- **The contract ledger couldn't read your chat ledger.** `lib/work-journal.js` (0.60.146) read it at port 7701, which is Clear Glass's
  live-events port. The ledger routes are on 7702.
- **Every read outside the tests failed.** Contract ledgers have been showing "chat-ledger (not read)" instead of the reply text.
- **Why the tests missed it.** They set the address themselves.
- **Fixed.** Both readers now use the one client, on the right port.

#### Measured
- `test-stream-fallback` 4/4. It runs against Clear Glass's real `chat-ledger.js`, served on the same route paths the bridge uses:
  - the client and the port;
  - finding the job's reply in the ledger, and not taking a reply still being generated;
  - a dead tab's job completing from the ledger, and a re-send finding its answer, never typed twice;
  - the 0.60.191 copy being gone.
- **The neighbouring Guardian and work-journal tests are unchanged.** The four files that fail did so before this release:
  - `test-accounts-picker-cos` (4);
  - `test-guardian-job-correlation` (2);
  - `test-options` (1);
  - `test-system-record-discipline` (1).
- **The boundary check finds no new crossing between systems.**

#### Not done, said
- **Not run on your machine.** To check there: reload a Claude tab while it is answering. The job should complete from `chat-ledger`, and
  your contract ledgers should now show the reply text where they said "chat-ledger (not read)".

## Ledger

### Build 0.60.192 — snap-0771 — 2026-10-21 09:29:52

- Archive: `nexus-0771_2026-10-21_v0.60.192.zip` (was `nexus-0.60.192.zip`)
- SHA-256: `1329c1ebd6b812e9c35465559867dc562e9f9f7bf6869c2d7b90852cb4697032`, 25.3 MB, downloaded 2026-10-21 09:32:08
- Kind: full
- Commit: `0168bd836ed4655869e99d24ec162253485d63e5`, tag `snap-0771`
- Files in archive: 6667. Changes against the build before it: **204 added, 141 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 70 | 65 | 2 |
| lib | 78 | 11 | 0 |
| idearium | 24 | 13 | 0 |
| docs | 7 | 26 | 0 |
| tests | 5 | 10 | 0 |
| (root) | 12 | 2 | 0 |
| guardian | 2 | 6 | 0 |
| loom | 4 | 4 | 0 |
| copilot | 2 | 0 | 0 |
| ollama | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |

```
A CHANGELOG-0.60.181.md
A CHANGELOG-0.60.182.md
A CHANGELOG-0.60.183.md
A CHANGELOG-0.60.184.md
A CHANGELOG-0.60.185.md
A CHANGELOG-0.60.186.md
A CHANGELOG-0.60.187.md
A CHANGELOG-0.60.188.md
A CHANGELOG-0.60.189.md
A CHANGELOG-0.60.190.md
A CHANGELOG-0.60.191.md
A CHANGELOG-0.60.192.md
M VERSION
A clear-glass/phases/2026-10-19-pipeline-root-causes/PR1_page_reader.phase
A clear-glass/phases/2026-10-21-adblock/AB1_engine.phase
A clear-glass/phases/2026-10-21-adblock/AB2_lists.phase
A clear-glass/phases/2026-10-21-adblock/AB3_wiring.phase
A clear-glass/phases/2026-10-21-adblock/AB4_surface.phase
A clear-glass/phases/2026-10-21-adblock/AB5_import.phase
A clear-glass/phases/2026-10-21-brainos-into-idearium/BX10_float.phase
M clear-glass/phases/2026-10-21-browser-shell/BS10_new_tab.phase
M clear-glass/phases/2026-10-21-browser-shell/BS11_copilot_pane.phase
A clear-glass/phases/2026-10-21-browser-shell/BS12_context_automatic.phase
A clear-glass/phases/2026-10-21-browser-shell/BS13_plugin_settings.phase
A clear-glass/phases/2026-10-21-browser-shell/BS14_zoom_core.phase
A clear-glass/phases/2026-10-21-browser-shell/BS15_context_menu.phase
A clear-glass/phases/2026-10-21-browser-shell/BS16_import_fields.phase
A clear-glass/phases/2026-10-21-browser-shell/BS17_menu_consolidated.phase
A clear-glass/phases/2026-10-21-browser-shell/BS18_chrome_context_menus.phase
A clear-glass/phases/2026-10-21-browser-shell/BS19_ctx_point_from_page.phase
M clear-glass/phases/2026-10-21-browser-shell/BS1_firefox_import.phase
A clear-glass/phases/2026-10-21-browser-shell/BS20_bookmark_site_accounts.phase
M clear-glass/phases/2026-10-21-browser-shell/BS2_shell_rebuild.phase
M clear-glass/phases/2026-10-21-browser-shell/BS3_menus.phase
M clear-glass/phases/2026-10-21-browser-shell/BS4_extensions.phase
M clear-glass/phases/2026-10-21-browser-shell/BS5_downloads_panel.phase
M clear-glass/phases/2026-10-21-browser-shell/BS6_float_cli.phase
M clear-glass/phases/2026-10-21-browser-shell/BS7_surface.phase
M clear-glass/phases/2026-10-21-browser-shell/BS8_design_system.phase
M clear-glass/phases/2026-10-21-browser-shell/BS9_agents_hub.phase
A clear-glass/phases/2026-10-21-passwords/PW1_service.phase
A clear-glass/phases/2026-10-21-passwords/PW2_page.phase
A clear-glass/phases/2026-10-21-passwords/PW3_wiring.phase
A clear-glass/phases/2026-10-21-passwords/PW4_surface.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF1_honest_detection.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF2_bridge_sources.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF3_page_in_the_compartment.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF4_https_only.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF5_circuit_check.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF6_surface.phase
M clear-glass/phases/2026-10-21-snowflake-compartment/SF7_bridge_automatic.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF8_host_import.phase
A clear-glass/phases/2026-10-21-snowflake-compartment/SF9_install_in_use.phase
M clear-glass/plugins/adblocker/index.js
M clear-glass/plugins/adblocker/manifest.json
M clear-glass/plugins/passwords/index.js
M clear-glass/plugins/passwords/manifest.json
M clear-glass/plugins/snowflake/index.js
M clear-glass/plugins/snowflake/manifest.json
D clear-glass/plugins/zoom/index.js
D clear-glass/plugins/zoom/manifest.json
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/copilot-cli.js
M clear-glass/renderer/settings/sections/network.js
M clear-glass/renderer/shell/copilot.css
A clear-glass/renderer/shell/ctxmenu.js
M clear-glass/renderer/shell/extensions.js
M clear-glass/renderer/shell/icons.js
M clear-glass/renderer/shell/menus.js
A clear-glass/renderer/shell/passwords.js
M clear-glass/renderer/shell/shell.css
A clear-glass/spec/adblock.spec
M clear-glass/spec/browser-shell.spec
M clear-glass/spec/clear-glass.spec
A clear-glass/spec/passwords.spec
M clear-glass/spec/snowflake.spec
A clear-glass/src/accounts/for-site.js
A clear-glass/src/adblock/engine.js
A clear-glass/src/adblock/import.js
A clear-glass/src/adblock/lists.js
M clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/context-need.js
A clear-glass/src/core/zoom.js
M clear-glass/src/driver/glass.js
M clear-glass/src/driver/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
A clear-glass/src/main/passwords-wiring.js
A clear-glass/src/net/host-import.js
M clear-glass/src/net/installer.js
M clear-glass/src/net/service.js
A clear-glass/src/passwords/service.js
M clear-glass/src/passwords/vault.js
M clear-glass/src/plugins/contribution-types.js
M clear-glass/src/plugins/host.js
M clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
A clear-glass/src/preload/passwords.js
M clear-glass/src/preload/webview-bridge.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
A copilot/phases/2026-10-19-pipeline-root-causes/SS2_every_system_home.phase
M cortex/boot.js
M diagnostic/nexus-diagnostic.js
M docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
M docs/2026-10-10-idearium-solid-phasemap.spec
M docs/2026-10-19-infrastructure-spine-phasemap.spec
M docs/2026-10-19-pipeline-root-causes-phasemap.spec
A docs/2026-10-21-adblock-phasemap.spec
A docs/2026-10-21-approval-chain-phasemap.spec
A docs/2026-10-21-brainos-into-idearium-phasemap.spec
M docs/2026-10-21-browser-shell-phasemap.spec
A docs/2026-10-21-passwords-phasemap.spec
M docs/2026-10-21-snowflake-compartment-phasemap.spec
M docs/CLAUDE.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
A docs/approval-chain.spec
M docs/atlases/architect-atlas.md
M docs/atlases/clear-glass-atlas.md
M docs/atlases/components-atlas.md
M docs/atlases/copilot-atlas.md
M docs/atlases/core-atlas.md
M docs/atlases/cortex-atlas.md
M docs/atlases/cos-atlas.md
M docs/atlases/diagnostic-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/intelligence-atlas.md
M docs/atlases/loom-atlas.md
M docs/atlases/nexus-atlas.md
M docs/atlases/ollama-atlas.md
M docs/atlases/orchestrator-atlas.md
M docs/atlases/versionium-atlas.md
A docs/brainos-in-idearium.spec
A docs/idearium-phase-census.md
M docs/pipeline.spec
M guardian/lib/chat-transcripts.js
M guardian/lib/dispatcher.js
M guardian/lib/index.js
M guardian/lib/job-retry.js
A guardian/phases/2026-10-19-pipeline-root-causes/RC5_find_where_the_label_enters.phase
M guardian/server.js
M guardian/userscript-gemini.js
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/cli/index.js
M idearium/cli/route-commands.js
A idearium/phases/2026-10-19-pipeline-root-causes/DG3_the_whole_dag.phase
```

197 more (mostly data, logs and archived files) are in the ledger file.

