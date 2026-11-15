# Nexus 0.60.212

**0.60.212 — Loom, Copilot and Intelligence hold their own files (DL3)**

| | |
|---|---|
| Built | 2026-10-22 04:58:58 → 2026-10-22 04:58:58 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.212 |
| Tag | `v0.60.212` → snap-0778 |
| Full file ledger | [LEDGER-0.60.212.csv](../ledger/LEDGER-0.60.212.csv) |

## Release notes — `CHANGELOG-0.60.212.md`

Copied unchanged from the build.

### 0.60.212 — Loom, Copilot and Intelligence hold their own files (DL3)

James, 2026-10-22: "then resume data migratino" · "Architect 1 isn't a system i don't believe and can be deleted."

Map: docs/2026-10-21-data-layout-phasemap.spec DL3_rewire_writers, with a dated addendum.

#### What moved
- **Loom:** its Cortex-sync buffer, uploads and scaffolds.
  - `nexus-status`'s Loom driver no longer reads the root `data/loom`. That was the stray copy a 2026-08-14 fix had already removed from
    `nexus-map`.
- **Copilot:** its diagnose output.
- **Intelligence:** its data folder (`DATA_DIR`) and synthesis files.
- For all three:
  - no code names their root `data/` paths, so each one's files come home at its next boot;
  - Diagnostic's table of systems points each at `<folder>/data`.
- **Progress:** ten systems are rewired. Left: Idearium, Cortex, and the shared `data/ledger/` folder.

#### Architect
Not removed. Checked before acting:
- It is a running system: `architect/service.js` on port 3747, started by Orchestrator.
- It has 14 routes: blueprints, spec wizard, map scan, translate, compile, SNR, gaps.
- Idearium's compiler bridge calls its `/api/map/scan`. Without Architect, that step carries on with less information instead of breaking.

Removing it is James's call, so it's put to him with that cost named. If he says yes, it is archived, not deleted.

#### Proof
- `test-data-rewired` 3/3: no code names a rewired system's old path; Diagnostic's table points home; the shared writers resolve each
  rewired system to its own folder.
- The 27 test files that load these modules were each run on 0.60.211 and on this release. They match, except `test-guardian-own-data`:
  its example of a system not yet rewired was Loom, so it now picks one that isn't rewired yet. 5/5.

## Ledger

### Build 0.60.212 — snap-0778 — 2026-10-22 04:58:58

- Archive: `nexus-0778_2026-10-22_v0.60.212.zip` (was `nexus-0.60.212.zip`)
- SHA-256: `4d121203341d0c74de757aa9bbcbc4ec33fbc66c8c387e0d3e49afc752fbc629`, 25.3 MB, downloaded 2026-10-22 05:14:58
- Kind: full
- Commit: `0ed56a395d21e2fd3d2a4172385255ac36100a71`, tag `snap-0778`
- Files in archive: 6726. Changes against the build before it: **40 added, 139 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 15 | 48 | 0 |
| idearium | 8 | 14 | 0 |
| tests | 5 | 12 | 0 |
| clear-glass | 1 | 14 | 0 |
| guardian | 1 | 11 | 0 |
| (root) | 8 | 2 | 1 |
| docs | 2 | 7 | 0 |
| loom | 0 | 6 | 0 |
| copilot | 0 | 5 | 0 |
| cli | 0 | 3 | 0 |
| intelligence | 0 | 3 | 0 |
| ollama | 0 | 3 | 0 |
| contracts | 0 | 2 | 0 |
| orchestrator | 0 | 2 | 0 |
| versionium | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A CHANGELOG-0.60.205.md
A CHANGELOG-0.60.206.md
A CHANGELOG-0.60.207.md
A CHANGELOG-0.60.208.md
A CHANGELOG-0.60.209.md
A CHANGELOG-0.60.210.md
A CHANGELOG-0.60.211.md
A CHANGELOG-0.60.212.md
M VERSION
M architect/service.js
M clear-glass/phases/2026-10-19-pipeline-root-causes/PR1_page_reader.phase
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/renderer/shell/copilot.css
M clear-glass/renderer/shell/icons.js
M clear-glass/renderer/shell/newtab.js
A clear-glass/renderer/shell/toolbar.css
M clear-glass/spec/browser-shell.spec
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/plugins/host.js
M clear-glass/src/providers/registry.js
M clear-glass/src/toolbar/commands.js
M cli/clear-idearium.js
M cli/diagnose.js
M cli/session.js
M copilot/adversarial.js
M copilot/phases/2026-10-19-pipeline-root-causes/SS2_every_system_home.phase
M copilot/recursive-diagnose.js
M copilot/server.js
M cortex/boot.js
M diagnostic/nexus-diagnostic.js
M docs/2026-09-11-sovereign-node-architecture-phasemap.spec
M docs/2026-10-10-idearium-solid-phasemap.spec
M docs/2026-10-19-pipeline-root-causes-phasemap.spec
M docs/2026-10-21-data-layout-phasemap.spec
A docs/2026-10-22-system-node-db-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/data-layout.spec
A docs/system-node-db.spec
M guardian/agents/index.js
M guardian/artifact-upload.js
M guardian/ask.js
M guardian/config.js
M guardian/lib/account-routing.js
M guardian/lib/agent-registry.js
M guardian/lib/jobs.js
M guardian/lib/ncp.js
M guardian/lib/provider-login.js
M guardian/phases/2026-10-19-pipeline-root-causes/RC5_find_where_the_label_enters.phase
M guardian/server.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/phases/2026-10-19-pipeline-root-causes/DG3_the_whole_dag.phase
M idearium/phases/2026-10-19-pipeline-root-causes/RC7_every_run_names_its_starter.phase
M idearium/phases/2026-10-19-pipeline-root-causes/UI2_version_in_code.phase
A idearium/phases/2026-10-22-system-node-db/ND5_every_agent_reaches_every_system.phase
A idearium/phases/2026-10-22-system-node-db/ND6_the_nodes_screen.phase
M idearium/repo/index.js
A idearium/repo/lift-root.js
M idearium/repo/nexus-self.js
M idearium/repo/proof-run.js
M idearium/ui/css/code-surface.css
M idearium/ui/js/code-surface.js
M idearium/ui/js/phases.js
M idearium/ui/js/repo-environment.js
M idearium/ui/settings.html
M intelligence/config.js
M intelligence/server.js
M intelligence/synthesis/index.js
M lib/agent-tools/tools/clear-glass/command-index.js
M lib/agent-tools/tools/query/nexus-map.js
M lib/agent-tools/tools/query/nexus-status.js
M lib/cortex-write.js
M lib/data-clearup.js
A lib/data-home.js
M lib/ledger-writer.js
M lib/phases/2026-10-19-pipeline-root-causes/CB1_coder_brief.phase
M lib/phases/2026-10-19-pipeline-root-causes/CB2_gemini_first.phase
M lib/phases/2026-10-19-pipeline-root-causes/DG4_nexus_maps_meet_the_standard.phase
M lib/phases/2026-10-19-pipeline-root-causes/DG5_dag_in_the_brief_and_the_ui.phase
M lib/phases/2026-10-19-pipeline-root-causes/ID1_ideas_wired_through.phase
M lib/phases/2026-10-19-pipeline-root-causes/MEM1_cortex_keeps_the_books.phase
M lib/phases/2026-10-19-pipeline-root-causes/PR2_autofill_and_copilot_read_first.phase
M lib/phases/2026-10-19-pipeline-root-causes/RC1_watchers_never_kill_a_kernel.phase
M lib/phases/2026-10-19-pipeline-root-causes/RC2_linear_node_scan.phase
M lib/phases/2026-10-19-pipeline-root-causes/RC3_windows_safe_node_names.phase
M lib/phases/2026-10-19-pipeline-root-causes/RC4_agent_file_names_guarded.phase
M lib/phases/2026-10-19-pipeline-root-causes/RC6_unowned_ollama_load.phase
M lib/phases/2026-10-19-pipeline-root-causes/SM1_agent_self_model.phase
M lib/phases/2026-10-19-pipeline-root-causes/SS1_system_store_adoption.phase
M lib/phases/2026-10-19-pipeline-root-causes/SS3_nodes_are_the_data.phase
M lib/phases/2026-10-19-pipeline-root-causes/UI1_toolbox_and_store_explorer.phase
M lib/phases/2026-10-19-pipeline-root-causes/UI3_ideas_and_notes_as_one.phase
M lib/phases/2026-10-19-pipeline-root-causes/VF1_verify_first.phase
M lib/phases/2026-10-19-pipeline-root-causes/VF2_one_response_bundle.phase
M lib/phases/2026-10-19-pipeline-root-causes/VF3_mutation_check.phase
M lib/phases/2026-10-19-pipeline-root-causes/VF4_second_opinion_on_need.phase
M lib/phases/2026-10-19-pipeline-root-causes/VF5_verdict_cache.phase
A lib/phases/2026-10-22-system-node-db/ND1_every_system_has_its_database.phase
A lib/phases/2026-10-22-system-node-db/ND2_one_node_route_for_every_system.phase
A lib/phases/2026-10-22-system-node-db/ND3_each_server_serves_its_nodes.phase
A lib/phases/2026-10-22-system-node-db/ND4_commands_and_capabilities_from_the_schemas.phase
M lib/repo-inject.js
M lib/seam/queue.js
M lib/shadow.js
M lib/version.js
M loom/maps/build-surface-map.js
M loom/maps/run-state-map.js
M loom/phases/2026-10-19-pipeline-root-causes/SS4_seal_into_compartments.phase
M loom/schema/cortex-sync.js
M loom/server.js
M ollama/config.js
M ollama/lib/tape.js
M ollama/server.js
M orchestrator/lib/changelog.js
M orchestrator/orchestrator.js
M package.json
D powershell.exe
M scripts/run-verification-manifest.cjs
M service/guardian-service.js
M tests/known-gaps.yaml
M tests/modules/guardian-job-persistence.test.js
M tests/modules/ollama-command-index.test.js
M tests/modules/run-all.js
M tests/modules/test-agent-facts.test.js
M tests/modules/test-browser-shell.test.js
M tests/modules/test-code-tab.test.js
A tests/modules/test-data-home.test.js
A tests/modules/test-data-rewired.test.js
M tests/modules/test-guardian-cfr-consolidation.js
M tests/modules/test-guardian-data-sovereignty.js
A tests/modules/test-guardian-own-data.test.js
M tests/modules/test-guardian-state-provider.test.js
A tests/modules/test-lift-root.test.js
A tests/modules/test-log-fixes.test.js
M tests/modules/test-proof-run.test.js
M tests/modules/test-substrate-spec.test.js
M versionium/config.js
M versionium/server.js
```

37 more (mostly data, logs and archived files) are in the ledger file.

