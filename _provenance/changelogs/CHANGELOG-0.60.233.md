# Nexus 0.60.233

**0.60.233 — 2026-10-24 — the SL line merged into main, additively**

| | |
|---|---|
| Built | 2026-10-23 21:56:28 → 2026-10-23 21:56:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.233 |
| Tag | `v0.60.233` → snap-0780 |
| Full file ledger | [LEDGER-0.60.233.csv](../ledger/LEDGER-0.60.233.csv) |

## Release notes — `CHANGELOG-0.60.233.md`

Copied unchanged from the build.

### 0.60.233 — 2026-10-24 — the SL line merged into main, additively

James, 2026-10-24: "merge and push" · "anything additive".

The coder's reading, acted on: merge every branch whose work adds to `main` without overwriting or losing anything `main` already
has. If you meant only some of them, say so.

#### What was checked
The checks ran on full git history. The clone was shallow at first, which made three old branches look like rollbacks of `main`.

| branch | commits `main` lacks | verdict |
|---|---|---|
| `claude/sleepy-gates-9lc085` | 7 (NF1, SL7, SL3, SL8, SL9, a PS-01 fix, SL10; 0.60.225–0.60.230 — SL10 was pushed while this merge was being checked, and taken in too) | **additive**: 3662 files added, 202 changed, 113 moved to `_archive/phases-moved/` (archived, not deleted, §0.3), none deleted, no `data/` |
| `claude/charming-lamport-mdzuau` | 0 | already in `main` |
| `claude/new-session-4vpr7p` | 0 | already in `main` |
| `claude/nexus-idearium-overview-yoguem` | 0 | already in `main` |

#### What the merge needed
- **Code:** no conflicts.
- **Release numbers:** the two lines of work were built in parallel, and both used **0.60.225, 0.60.226 and 0.60.230**. `main` used them for
  JA1, JA2 and JA3 (Clear Glass autofill); `sleepy-gates` for NF1, SL7 and SL10. Nothing was renumbered (§0.3, nothing rewritten):
  - `CHANGELOG-0.60.225.md`, `CHANGELOG-0.60.226.md` and `CHANGELOG-0.60.230.md` each hold **both** entries, and say the number
    was used twice;
  - `lib/version.js` keeps both lines' entries under this one: the JA line (0.60.232 → 0.60.225), then the SL line
    (0.60.230 → 0.60.225);
  - this merge is released as **0.60.233** (`VERSION`, `lib/version.js`, `package.json`).
- **Phase files:** SL9 writes a `.phase` and its dependency `.graph` beside the system that owns each phase. Some were missing or
  stale:
  - `main`'s JA1–JA5 phases had none;
  - six maps that `main` changed after the branch generated its files had drifted (site settings, browser providers, RAID,
    interaction contract, the agent suite).

  They were regenerated with SL9's own tool (`emerge/compiler/phase-specs.js`). `--all --check` now reports **1944 phases, 0 with
  drift**. A stale `.graph` for an old hash is replaced by the tool; it is regenerated from the map, so it is redundant, not lost.

#### What the branch broke, found before merging (§0.1), and fixed here
On the branch's own tip, six test files failed that pass on `main`. Merging it as it was would have turned them red on `main`, which
is not additive. Each one was traced to its root cause:
- **`idearium/ui/js/repo-tasks.js` did not parse.** SL7's edit to `rtRetry` wrote its `// §0.60.226 SL7 …` comment in the middle of a
  line. The comment swallowed the rest of the line: the toast, and the `}` that closes the `try`. The file stopped at `catch`
  (`SyntaxError: Unexpected token 'catch'`), so nothing in it loaded, `rtToggleDrawer` included. That broke the Plan and Code-tab
  screens: `test-plan-sidebar`, `test-plan-pieces`, `test-code-tab-merge` and `test-code-dock`. The comment now has its own lines,
  and SL7's behaviour is kept. Every `idearium/ui/js/*.js` file is checked to parse.
- **The atlases named `.graph` files that no longer exist** (`test-nexus-atlas-refs`). A `.graph` file is named by its hash, and
  the hashes moved when the phases' graphs changed. Fix: regenerated with the atlases' own generator (`scripts/generate-atlases.js`);
  the inventory lists no untracked files.
- **CT0 was stale** (`test-contract-ct0-self`). SL7 changed the contract evaluator (`cortex/core/raid/contract-gates.js`), and by
  design that invalidates CT0's recorded proof until its gates pass again *through the evaluator*. Its four gates (evaluator,
  commands, verify, self-host) were re-run with `contract check` (the same load → check → save path) and all passed. CT0 is
  complete by the evaluator again, not by declaration.

#### Proof
See the PR: the branch's own tests, JA1–JA5, the release check, and the full suite compared against the last run.

## Ledger

### Build 0.60.233 — snap-0780 — 2026-10-23 21:56:28

- Archive: `nexus-0780_2026-10-23_v0.60.233.zip` (was `nexus-0.60.233.zip`)
- SHA-256: `3f32267330f09afa7064faa54917754201e5aaa95b3e148aeed05cbd09fd0c1c`, 29.4 MB, downloaded 2026-10-23 22:25:13
- Kind: full
- Commit: `a4edc0a2fcce74e68711c900c70f2d96a2ca1aca`, tag `snap-0780`
- Files in archive: 10534. Changes against the build before it: **3836 added, 231 modified, 102 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1505 | 79 | 53 |
| idearium | 751 | 30 | 14 |
| clear-glass | 521 | 59 | 30 |
| cortex | 209 | 5 | 1 |
| guardian | 188 | 1 | 1 |
| loom | 160 | 6 | 0 |
| cos | 145 | 11 | 0 |
| copilot | 125 | 0 | 2 |
| intelligence | 61 | 0 | 0 |
| orchestrator | 37 | 2 | 1 |
| _archive | 39 | 0 | 0 |
| docs | 3 | 25 | 0 |
| diagnostic | 25 | 0 | 0 |
| tests | 13 | 7 | 0 |
| (root) | 13 | 4 | 0 |
| ollama | 17 | 0 | 0 |
| versionium | 15 | 0 | 0 |
| architect | 9 | 0 | 0 |
| scripts | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |

```
M .gitignore
A CHANGELOG-0.60.221.md
A CHANGELOG-0.60.222.md
A CHANGELOG-0.60.223.md
A CHANGELOG-0.60.224.md
A CHANGELOG-0.60.225.md
A CHANGELOG-0.60.226.md
A CHANGELOG-0.60.227.md
A CHANGELOG-0.60.228.md
A CHANGELOG-0.60.229.md
A CHANGELOG-0.60.230.md
A CHANGELOG-0.60.231.md
A CHANGELOG-0.60.232.md
A CHANGELOG-0.60.233.md
M README.md
M VERSION
A architect/phases/2026-09-13-axiom-5-2-raid-routing/MCO12_architect_remaining_routes.phase
A architect/phases/2026-09-30-idearium-coding-flow/W7_next_mapped_2026_09_30.phase
A architect/phases/2026-10-02-workshop-codex-rewind/BP1_destroy_and_rebuild_blueprint.phase
A architect/phases/2026-10-19-infrastructure-spine/IN5_architect_mirrors_the_registry.phase
A architect/phases/INDEX.md
A clear-glass/phases/2026-08-22-session-full/SF14_wake_pipeline_real_architecture.phase
A clear-glass/phases/2026-08-23-backlog/BL0_macro_system.phase
A clear-glass/phases/2026-08-23-backlog/BL10_nexus_roadmap_html_files.phase
A clear-glass/phases/2026-08-23-backlog/BL14_seam_to_lib_seam.phase
A clear-glass/phases/2026-08-23-backlog/BL17_nexus_url_scheme.phase
A clear-glass/phases/2026-08-23-backlog/BL18_tools_per_url.phase
A clear-glass/phases/2026-08-23-backlog/BL19_roadmap_readability.phase
A clear-glass/phases/2026-08-23-backlog/BL1_macro_erosmancer_integration.phase
A clear-glass/phases/2026-08-23-backlog/BL22_rewind_timeline_ui.phase
A clear-glass/phases/2026-08-23-backlog/BL23_ncp_providers_start_verification.phase
A clear-glass/phases/2026-08-23-backlog/BL26_account_agent_window_uuid_linking.phase
A clear-glass/phases/2026-08-23-backlog/BL28_background_tabs_setting.phase
A clear-glass/phases/2026-08-23-backlog/BL29_tab_context_menu_move_to_background.phase
A clear-glass/phases/2026-08-23-backlog/BL2_guardian_zip_mining_report.phase
A clear-glass/phases/2026-08-23-backlog/BL30_registry_components_drift_audit.phase
A clear-glass/phases/2026-08-23-backlog/BL31_architect_block_canvas_component_swap.phase
A clear-glass/phases/2026-08-23-backlog/BL5_port_killswitch_pattern.phase
A clear-glass/phases/2026-08-23-backlog/BL6_captcha_detection.phase
A clear-glass/phases/2026-08-27-event-taxonomy-and-brainstorm/BR1_callto_component_hotswap_catalog.phase
A clear-glass/phases/2026-08-27-event-taxonomy-and-brainstorm/BR4_erosmancer_as_clearglass_plugin.phase
A clear-glass/phases/2026-08-27-event-taxonomy-and-brainstorm/BR8_clearglass_full_agent_tool_parity.phase
A clear-glass/phases/2026-08-27-event-taxonomy-and-brainstorm/BR9_theme_consolidation_to_nexus_dark.phase
A clear-glass/phases/2026-08-28-self-building-pipeline/SBP7_agent_suite_lives_in_clearglass.phase
A clear-glass/phases/2026-08-30-interaction-contract-context/IC11_agent_truth_fragmentation.phase
A clear-glass/phases/2026-08-30-interaction-contract-context/IC3_intention_taxonomy_per_system.phase
A clear-glass/phases/2026-08-30-interaction-contract-context/IC4_idearium_system_template_update.phase
A clear-glass/phases/2026-08-30-interaction-contract-context/IC8_callto_event_driven_cli_injection.phase
A clear-glass/phases/2026-08-30-interaction-contract-context/IC9_diagnostic_stall_detection_and_autofix.phase
A clear-glass/phases/2026-09-01-living-model-and-autonomous-pipeline/LM17_downloads_manager_for_artifacts.phase
A clear-glass/phases/2026-09-01-living-model-and-autonomous-pipeline/LM24_atlas_prose_layer.phase
A clear-glass/phases/2026-09-01-living-model-and-autonomous-pipeline/LM8_full_pipeline_wiring.phase
A clear-glass/phases/2026-09-02-nexus-vision-master/T4_userscript_event_types.phase
A clear-glass/phases/2026-09-02-versionium-sovereign-and-cleanup/CG1_process_manager_in_settings.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CG1_ncp_events_real.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CG2_route_ncp_onto_guardian_sse.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP1_tool_index_hooked_to_living_model.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP2_copilot_versionium_awareness.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP3_git_vs_versionium_decision.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/DA2_dispatch_outcome_events.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/ID1_resolve_versionium_cortex_dependency.phase
A clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/IDU1_idearium_homepage_and_repo_browser.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P10_intelligence_reads_sse_and_data_folders.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P13_interaction_contract_plus_handshake_for_every_cross_system_call.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P14_per_system_living_gap_index.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P23_guardian_job_durability.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P24_response_queue_and_delivery_ack.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P27_guardian_picker_userscript_manager.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P28_dom_tool_and_command_flow.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P29_clearglass_brainos_canvas.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P2_per_system_interaction_contracts.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P32_clearglass_enterprise_ui_scope.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P34_nodes_in_the_lattice.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P35_copilot_reads_edits_creates_nodes.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P37_the_ui_floats_on_the_registry.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P5_data_folder_completion.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P6_per_system_contract_schemas.phase
A clear-glass/phases/2026-09-11-sovereign-node-architecture/P8_per_system_component_registry.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/P1_driver.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/P2_mesh_transport.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/P3_endpoint.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/P4_identity.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/P6_verify.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/T2_duplicate_prompt.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/T3_wrong_page.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/T4_two_actuators.phase
A clear-glass/phases/2026-09-19-guardian-mesh-first-dispatch/T5_untestable_here.phase
A clear-glass/phases/2026-09-29-build-surface/BS0_compartment_windows.phase
A clear-glass/phases/2026-09-29-build-surface/BS17_copilot_browser_verbs.phase
A clear-glass/phases/2026-09-29-provider-economy/EC9_input_path_in_editors.phase
A clear-glass/phases/2026-10-01-idearium-agent-ready-master/CG1_clear_glass_accounts_and_private.phase
A clear-glass/phases/2026-10-01-idearium-agent-ready-master/CG2_clear_glass_drag_wrapper_and_fluid_url_bar.phase
A clear-glass/phases/2026-10-01-idearium-agent-ready-master/PF10_clear_glass_err_aborted_9000.phase
A clear-glass/phases/2026-10-01-work-visibility-job-reuse/J5.phase
A clear-glass/phases/2026-10-02-emerge-field-memory-build/PR2_screenshots_through_clear_glass.phase
A clear-glass/phases/2026-10-05-fiverr-guide/FR1_the_guide.phase
A clear-glass/phases/2026-10-05-fiverr-guide/FR2_show_me_on_the_page.phase
A clear-glass/phases/2026-10-05-idea-to-spec-workshop/WK0_pop_out_windows_borderless.phase
A clear-glass/phases/2026-10-07-compartment-control-and-activity/DC1_a_click_that_did_nothing.phase
A clear-glass/phases/2026-10-10-design-surface/DS1_tokens_edited_live.phase
A clear-glass/phases/2026-10-10-design-surface/DS2_pick_and_edit_any_page.phase
A clear-glass/phases/2026-10-10-design-surface/DS4_interface_types_by_adapter.phase
A clear-glass/phases/2026-10-10-idearium-access/IA4_clear_glass_signs_in_for_you.phase
A clear-glass/phases/2026-10-10-idearium-solid/SD8_an_agent_can_see_and_fix_a_tab.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/CG1_the_field_injects_once.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/CG2_one_source_of_truth_for_the_browser.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/CG3_the_fiverr_tutorial_in_the_browser.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/FN2_nerve_sees_the_field.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/SH2_explain_this_anywhere.phase
A clear-glass/phases/2026-10-10-shape-of-nexus/TU1_the_nexus_tutorial.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/AS1_provider_tab_runs_as_the_default_account.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB0_gig_files.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB1_the_agent_writes_the_gig_file.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB2_the_copilot_hat_agent_and_account.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB3_autofill_fields_mapped_by_pick.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB4_resume_import.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB6_the_application_ledger.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/JB7_the_follow_up.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/RN0_the_renderer_as_a_cos_window.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB0_the_webview_session_proved.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB1_a_tab_is_its_own_webview.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB2_a_tab_runs_as_an_account.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB3_tabs_are_compartments.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB4_bookmark_checklists.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB5_site_and_account_nodes.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB6_element_endpoints.phase
A clear-glass/phases/2026-10-12-browser-providers-and-work/TB7_human_tabs_never_spoofed.phase
A clear-glass/phases/2026-10-13-gates-that-learn-and-priorities/PF1_profiles_hats_tabs.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/CU0_chat_url_reload_before_escalating.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/HM1_chatgpt_connection_kept.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/ID0_signed_in_where_he_signs_in.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/ID1_identities.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/ID2_every_cookie_a_row.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/ID3_bookmarks_carry_the_identity.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/ID4_incognito.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/MC0_recorder_records_the_tab.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/MC1_steps_as_events_and_snapshots.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/MC2_hotkeys_for_macros.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/NV0_scripts_injected_once.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/NV1_words_to_elements.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/NV2_tell_clear_glass_what_to_do.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/TB1_tab_is_a_view.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/TB2_new_tab_menu.phase
A clear-glass/phases/2026-10-13-identities-tabs-and-automation/TB3_browser_rebuilt.phase
A clear-glass/phases/2026-10-13-projects-raid-and-gates/WF0_workflows.phase
A clear-glass/phases/2026-10-15-capability-specs-and-semantic-page-tree/CS3_feature_starts_as_a_spec.phase
A clear-glass/phases/2026-10-15-capability-specs-and-semantic-page-tree/SP1_semantic_page_tree.phase
A clear-glass/phases/2026-10-15-capability-specs-and-semantic-page-tree/SP2_semantic_addresses_for_the_field_map.phase
A clear-glass/phases/2026-10-15-clear-glass-network-posture/NP10_browser_surface.phase
A clear-glass/phases/2026-10-15-clear-glass-network-posture/NP11_context_menu.phase
```

4019 more (mostly data, logs and archived files) are in the ledger file.

