# Nexus 0.60.220

**0.60.220 — the Processes window (SP6)**

| | |
|---|---|
| Built | 2026-10-23 07:04:42 → 2026-10-23 07:04:42 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.220 |
| Tag | `v0.60.220` → snap-0779 |
| Full file ledger | [LEDGER-0.60.220.csv](../ledger/LEDGER-0.60.220.csv) |

## Release notes — `CHANGELOG-0.60.220.md`

Copied unchanged from the build.

### 0.60.220 — the Processes window (SP6)

James, 2026-10-23: "Also need a processes screen for background tabs and activity."

Owned by: clear-glass/spec/site-profile.spec MOD-SP-PROCESSES-UI (dated addendum) · map docs/2026-10-23-site-profile-processes-phasemap.spec SP6.
This finishes the request of 2026-10-23: SP1–SP6, released in 0.60.215 to 0.60.220.

#### What stands on what
- 0.60.219's backend: the process list, closing or ending one (his alone), and the activity.
- Settings' window style.
- The shortcut table and the ☰ menu model, which already exist.

#### Built
- **The Processes window** (`renderer/processes.html`, `.js`, `.css`).
  - **The process table**: every Clear Glass process with its pages.
    - Columns: name, kind (tab, background tab, agent tab, Clear Glass window, GPU, browser), site, memory, CPU and PID.
    - It refreshes every 2 s and is sortable by any column. The sort and the selected row are kept across refreshes.
    - "Pages only" hides the GPU and the browser.
  - **Close and End**: Close on a background tab, End on a site's tab. Each is confirmed, saying what is lost. A refusal is shown on the
    window.
  - **The activity**, beside the table: what just happened, filtered by kind (pages loaded, background tabs, ClearDriver, macros,
    workflows, downloads, errors, what he ended) and by site.
  - If Clear Glass doesn't answer, the window says so.
- **The way in.**
  - **Shift+Esc**, as in Firefox and Chrome. It is a new default in the shortcut table. The guard that stops shortcuts from stealing typing
    now lets Esc with a modifier through; Shift with a letter is still typing.
  - ☰ → Processes, and Tools → Processes.

#### Proof
- `test-processes-ui`: 4/4, driven in Clear Glass. The page's calls reach the real backend over a fake Electron process table.
  - PU-01:
    - rows with memory and kind;
    - a background tab closed from its row and confirmed;
    - the activity shows the close, "by person".
  - PU-02: the sort and the selection survive a refresh; Pages only.
  - PU-03: the banner when Clear Glass doesn't answer.
  - PU-04: Shift+Esc reads and binds as Processes, and Shift with a letter still doesn't; the ☰ and Tools rows; the action opens the
    window.
- `test-browser-shell`: 28/28. BST-17 clicks every ☰ row, Processes included, and checks that it opens the window.
- `test-cg-shortcuts`: 8/8. The window has its own handler for the shortcut too.

## Ledger

### Build 0.60.220 — snap-0779 — 2026-10-23 07:04:42

- Archive: `nexus-0779_2026-10-23_v0.60.220.zip` (was `nexus-0.60.220.zip`)
- SHA-256: `05f2a89cadfbc4065bca47a762ed0bb392cb3534a7cc340d0f0bd51d3d734a78`, 25.5 MB, downloaded 2026-10-23 07:09:42
- Kind: full
- Commit: `ed7937ff3a0091f1e57f005e831583e82f1048b8`, tag `snap-0779`
- Files in archive: 6801. Changes against the build before it: **75 added, 36 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 34 | 23 | 0 |
| cos | 23 | 0 | 0 |
| (root) | 8 | 2 | 0 |
| tests | 6 | 4 | 0 |
| docs | 2 | 4 | 0 |
| lib | 2 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A CHANGELOG-0.60.213.md
A CHANGELOG-0.60.214.md
A CHANGELOG-0.60.215.md
A CHANGELOG-0.60.216.md
A CHANGELOG-0.60.217.md
A CHANGELOG-0.60.218.md
A CHANGELOG-0.60.219.md
A CHANGELOG-0.60.220.md
M VERSION
A clear-glass/phases/2026-10-23-site-profile-processes/SP1_one_resolver_for_every_feature.phase
A clear-glass/phases/2026-10-23-site-profile-processes/SP2_each_feature_reads_its_site_value.phase
A clear-glass/phases/2026-10-23-site-profile-processes/SP3_the_site_settings_screen.phase
A clear-glass/phases/2026-10-23-site-profile-processes/SP4_cleardriver_mesh_guardian_settings.phase
A clear-glass/phases/2026-10-23-site-profile-processes/SP5_processes_and_activity.phase
A clear-glass/phases/2026-10-23-site-profile-processes/SP6_the_processes_screen.phase
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP1_one_resolver_for_every_feature-603b7985ce8f9b73.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP1_one_resolver_for_every_feature-7eae9a633ce4b434.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP2_each_feature_reads_its_site_value-249259a90e6883d4.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP2_each_feature_reads_its_site_value-817ef2353afca489.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP3_the_site_settings_screen-1d671034540d6a5c.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP3_the_site_settings_screen-344ad9a833e51ca5.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP4_cleardriver_mesh_guardian_settings-4ef5b98a501e3da4.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP4_cleardriver_mesh_guardian_settings-daaaec093ead2831.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP4_cleardriver_mesh_guardian_settings-fb57cef4503dcfda.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP5_processes_and_activity-ca2e1a930897994f.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP5_processes_and_activity-d43cecd51dde3c80.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP6_the_processes_screen-ba0b54480cfed70e.graph
A clear-glass/phases/2026-10-23-site-profile-processes/graph/SP6_the_processes_screen-d170b15d089baaf0.graph
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/processes.css
A clear-glass/renderer/processes.html
A clear-glass/renderer/processes.js
M clear-glass/renderer/settings.html
A clear-glass/renderer/settings/sections/driver.css
A clear-glass/renderer/settings/sections/driver.js
A clear-glass/renderer/settings/sections/guardian.css
A clear-glass/renderer/settings/sections/guardian.js
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/sites.js
M clear-glass/renderer/shell/icons.js
M clear-glass/renderer/shell/menus.js
M clear-glass/renderer/shell/shell.css
A clear-glass/renderer/site-profile-groups.css
A clear-glass/renderer/site-profile-groups.js
M clear-glass/spec/browser-shell.spec
A clear-glass/spec/site-profile.spec
M clear-glass/src/autofill/matcher.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/downloads/chat-ledger.js
M clear-glass/src/driver/index.js
M clear-glass/src/ipc/agent-routes.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/ipc/handler-registry.js
M clear-glass/src/main/index.js
M clear-glass/src/main/passwords-wiring.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/options/store.js
M clear-glass/src/passwords/service.js
M clear-glass/src/preload/index.js
A clear-glass/src/processes/index.js
A clear-glass/src/rewind/resume.js
M clear-glass/src/shortcuts/registry.js
A clear-glass/src/site-settings/keys.js
A clear-glass/src/site-settings/profile.js
A clear-glass/src/site-settings/readers.js
A cos/phases/2026-10-23-cos-spine/CS11_raid_in_the_exe.phase
A cos/phases/2026-10-23-cos-spine/CS1_a_version_is_a_system_state.phase
A cos/phases/2026-10-23-cos-spine/CS2_test_every_version.phase
A cos/phases/2026-10-23-cos-spine/CS3_the_registry_is_the_bridge.phase
A cos/phases/2026-10-23-cos-spine/CS4_every_system_a_compartment.phase
A cos/phases/2026-10-23-cos-spine/CS4a_cos_boots_alone.phase
A cos/phases/2026-10-23-cos-spine/CS5_caps_per_compartment.phase
A cos/phases/2026-10-23-cos-spine/CS6_rebuild_from_the_spec.phase
A cos/phases/2026-10-23-cos-spine/CS7_spawn_despawn_and_balance.phase
A cos/phases/2026-10-23-cos-spine/CS8_the_cos_screen.phase
A cos/phases/2026-10-23-cos-spine/CS9_every_project_a_compartment.phase
A cos/phases/2026-10-23-cos-spine/graph/CS11_raid_in_the_exe-3899474125085d16.graph
A cos/phases/2026-10-23-cos-spine/graph/CS1_a_version_is_a_system_state-523fbc38e04e24be.graph
A cos/phases/2026-10-23-cos-spine/graph/CS2_test_every_version-b2df3232bd29e9b2.graph
A cos/phases/2026-10-23-cos-spine/graph/CS3_the_registry_is_the_bridge-269cc4b7c5c5f55b.graph
A cos/phases/2026-10-23-cos-spine/graph/CS4_every_system_a_compartment-8dfe260df6e33a3d.graph
A cos/phases/2026-10-23-cos-spine/graph/CS4a_cos_boots_alone-5a7d46b9d98781db.graph
A cos/phases/2026-10-23-cos-spine/graph/CS5_caps_per_compartment-60ce4faf0b415181.graph
A cos/phases/2026-10-23-cos-spine/graph/CS6_rebuild_from_the_spec-2027a2ea6546f0e2.graph
A cos/phases/2026-10-23-cos-spine/graph/CS7_spawn_despawn_and_balance-145fe81d23c58732.graph
A cos/phases/2026-10-23-cos-spine/graph/CS8_the_cos_screen-75756ab60cc23333.graph
A cos/phases/2026-10-23-cos-spine/graph/CS9_every_project_a_compartment-4ceb779c4ef8413d.graph
A cos/spec/cos-spine.spec
M docs/2026-10-19-infrastructure-spine-phasemap.spec
M docs/2026-10-21-data-layout-phasemap.spec
A docs/2026-10-23-cos-spine-phasemap.spec
A docs/2026-10-23-site-profile-processes-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M idearium/cli/route-commands.js
A lib/phases/2026-10-23-cos-spine/CS10_hats_bound_to_the_compartment.phase
A lib/phases/2026-10-23-cos-spine/graph/CS10_hats_bound_to_the_compartment-9593a2c519f5f235.graph
M lib/version.js
M loom/maps/run-state-map.js
M package.json
M tests/modules/clear-glass-agent-surface.test.js
M tests/modules/run-all.js
M tests/modules/test-browser-shell.test.js
A tests/modules/test-global-settings.test.js
A tests/modules/test-processes-ui.test.js
A tests/modules/test-processes.test.js
A tests/modules/test-site-profile.test.js
A tests/modules/test-site-readers.test.js
A tests/modules/test-site-settings-ui.test.js
M tests/modules/test-substrate-spec.test.js
```

