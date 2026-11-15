# Nexus 0.60.312

**0.60.312 — Diagnostic takes care of what a system needs**

| | |
|---|---|
| Built | 2026-10-30 11:10:26 → 2026-10-30 11:10:26 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.312 |
| Tag | `v0.60.312` → snap-0790 |
| Full file ledger | [LEDGER-0.60.312.csv](../ledger/LEDGER-0.60.312.csv) |

## Release notes — `versionium/changelogs/CHANGELOG-0.60.312.md`

Copied unchanged from the build.

### 0.60.312 — Diagnostic takes care of what a system needs

James, 2026-10-30, after the coder told him to run `ollama pull nomic-embed-text` himself:
> "diagnostic system should be taking care of things like this."

He's right, and the coder's advice was the wrong pattern: handing a machine's job to a person.

#### Census
Three places knew the embedding model was missing, and none owned the fix:
- `lib/vector-memory.js` logs the missing model.
- An opt-in automation (`ollama-models`) only sends a notification.
- The Ollama bridge refuses to use an unpulled model, but has no route to pull one.

Diagnostic's remediation loop knows only one kind of problem: "a system is offline".

#### Spec and map
`diagnostic/spec/requirements.spec` and `docs/2026-10-30-diagnostic-requirements-phasemap.spec`.

**Decisions:**
- **DR_D0, his:** Diagnostic takes care of it.
- **DR_D1, by the axioms:** Diagnostic detects, and the owner fixes it through RAID (§5.15, §5.2, §12.6).
- **DR_D2, by the axioms:** each system declares its needs in its own `compartment.json` (§5.15 rule 2, §0.1). Reading those declarations is observation, which is unrestricted; every fix goes through the owner.
- **DR_D3, by the axioms:** downloads and installs ask first, under an off/ask/auto policy per kind that he can change (USER_AUTONOMY, §4.3, §5.6).

**Phases:**
- **DR1:** systems declare `requires[]`.
- **DR2:** Diagnostic checks them, at boot and on a cadence.
- **DR3:** the Ollama bridge can pull a model by route.
- **DR4:** fixes run under the policy, and are rechecked before the gap closes. Semantic memory leaves its fallback without a restart.
- **DR5:** rows for agents, and a Fix button in the cockpit.

#### Proof
- `test-substrate-spec` 3/3.
- The DAG has no dangling references and no cycles.
- No new crossings: all of them already exist and are known.

Spec and map only. Nothing is built.

## Ledger

### Build 0.60.312 — snap-0790 — 2026-10-30 11:10:26

- Archive: `nexus-0790_2026-10-30_v0.60.312.zip` (was `nexus-0.60.312.zip`)
- SHA-256: `69afd344a13d3f48b992b6de8550ff25742fa25c4642ef110427d809279ded1b`, 46.1 MB, downloaded 2026-10-30 11:48:09
- Kind: full
- Commit: `60e23c5627c7472ed932dc3d03d5fdf51bb8cdb5`, tag `snap-0790`
- Files in archive: 12771. Changes against the build before it: **106 added, 27 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 49 | 14 | 3 |
| lib | 22 | 1 | 0 |
| versionium | 15 | 0 | 0 |
| docs | 2 | 7 | 0 |
| _archive | 7 | 0 | 0 |
| diagnostic | 5 | 0 | 0 |
| idearium | 4 | 0 | 0 |
| (root) | 0 | 2 | 0 |
| ollama | 2 | 0 | 0 |
| tests | 0 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
M VERSION
A _archive/imports/2026-10-30-uploads/Associative_Lattice.zip
A _archive/imports/2026-10-30-uploads/ESS-spec-v0.1.0.docx
A _archive/imports/2026-10-30-uploads/ESS-spec-v0.1.0.txt
A _archive/imports/2026-10-30-uploads/MANIFEST.md
A _archive/imports/2026-10-30-uploads/Signal_to_Noise1.zip
A _archive/imports/2026-10-30-uploads/emergence-6.zip
A _archive/imports/2026-10-30-uploads/update-system.zip
M cos/phases/2026-10-24-cos-manager/MG0b_the_full_spec.phase
A cos/phases/2026-10-24-cos-manager/MG10_categories.phase
A cos/phases/2026-10-24-cos-manager/MG11_category_manager_ui.phase
A cos/phases/2026-10-24-cos-manager/MG12_the_exe_is_the_compartment_manager.phase
A cos/phases/2026-10-24-cos-manager/MG13_cli_in_the_exe.phase
A cos/phases/2026-10-24-cos-manager/MG14_live_thumbnails.phase
A cos/phases/2026-10-24-cos-manager/MG16_the_autopilot_door.phase
A cos/phases/2026-10-24-cos-manager/MG18_the_supervisor_screen.phase
A cos/phases/2026-10-24-cos-manager/MG20_add_deploy_connect.phase
A cos/phases/2026-10-24-cos-manager/MG21_the_add_screen.phase
A cos/phases/2026-10-24-cos-manager/MG22_template_and_archetype_builder.phase
A cos/phases/2026-10-24-cos-manager/MG23_allocation_and_balance.phase
A cos/phases/2026-10-24-cos-manager/MG24_network_manager.phase
A cos/phases/2026-10-24-cos-manager/MG25_storage_manager.phase
A cos/phases/2026-10-24-cos-manager/MG26_branch_benchmark_merge.phase
A cos/phases/2026-10-24-cos-manager/MG27_state_and_resource_screens.phase
A cos/phases/2026-10-24-cos-manager/MG28_cos_dependencies.phase
A cos/phases/2026-10-24-cos-manager/MG29_the_cockpit.phase
M cos/phases/2026-10-24-cos-manager/MG2_genesis_compartments_through_the_registry.phase
A cos/phases/2026-10-24-cos-manager/MG30_pages_on_the_registry_bus.phase
M cos/phases/2026-10-24-cos-manager/MG3_the_state_manager.phase
M cos/phases/2026-10-24-cos-manager/MG4_resources_per_compartment.phase
M cos/phases/2026-10-24-cos-manager/MG5_browsers_and_editors.phase
M cos/phases/2026-10-24-cos-manager/MG6_settings_by_template_and_type.phase
M cos/phases/2026-10-24-cos-manager/MG7_automation_macros_and_hats.phase
M cos/phases/2026-10-24-cos-manager/MG8_the_factory.phase
M cos/phases/2026-10-24-cos-manager/MG9_the_console_ui.phase
A cos/phases/2026-10-24-cos-manager/_superseded/MG15_the_supervisor_in_cos.phase
D cos/phases/2026-10-24-cos-manager/graph/MG0b_the_full_spec-034f46861c02f038.graph
A cos/phases/2026-10-24-cos-manager/graph/MG0b_the_full_spec-37a084061d582ac2.graph
A cos/phases/2026-10-24-cos-manager/graph/MG10_categories-26220cd45f2bc4b4.graph
A cos/phases/2026-10-24-cos-manager/graph/MG11_category_manager_ui-307710eb282e1bc3.graph
A cos/phases/2026-10-24-cos-manager/graph/MG12_the_exe_is_the_compartment_manager-7350f98407b97c68.graph
A cos/phases/2026-10-24-cos-manager/graph/MG13_cli_in_the_exe-c61b1b6bd0890fc2.graph
A cos/phases/2026-10-24-cos-manager/graph/MG14_live_thumbnails-ec031bf12160634e.graph
A cos/phases/2026-10-24-cos-manager/graph/MG16_the_autopilot_door-f23dc76a372f2324.graph
A cos/phases/2026-10-24-cos-manager/graph/MG18_the_supervisor_screen-a103e9b1c6bc53dd.graph
A cos/phases/2026-10-24-cos-manager/graph/MG20_add_deploy_connect-5acb3d96414f1f83.graph
A cos/phases/2026-10-24-cos-manager/graph/MG21_the_add_screen-835dadbeb442a0b4.graph
A cos/phases/2026-10-24-cos-manager/graph/MG22_template_and_archetype_builder-f2afa5f74266d97a.graph
A cos/phases/2026-10-24-cos-manager/graph/MG23_allocation_and_balance-bb5091a74ffd1e91.graph
A cos/phases/2026-10-24-cos-manager/graph/MG24_network_manager-7fdc060960f3248c.graph
A cos/phases/2026-10-24-cos-manager/graph/MG25_storage_manager-b642c222dc90f060.graph
A cos/phases/2026-10-24-cos-manager/graph/MG26_branch_benchmark_merge-75bfd274b617943f.graph
A cos/phases/2026-10-24-cos-manager/graph/MG27_state_and_resource_screens-9011cdbc9e55938f.graph
A cos/phases/2026-10-24-cos-manager/graph/MG28_cos_dependencies-fbc97cbd5f671aa8.graph
A cos/phases/2026-10-24-cos-manager/graph/MG29_the_cockpit-5b12f47d1e8a5aef.graph
A cos/phases/2026-10-24-cos-manager/graph/MG30_pages_on_the_registry_bus-8bde337ee5052eca.graph
A cos/phases/2026-10-24-cos-manager/graph/MG3_the_state_manager-aaebad36af856d16.graph
D cos/phases/2026-10-24-cos-manager/graph/MG3_the_state_manager-dc78414883320b4a.graph
M cos/phases/2026-10-24-cos-manager/graph/MG4_resources_per_compartment-45437b4444ec3e8d.graph
M cos/phases/2026-10-24-cos-manager/graph/MG5_browsers_and_editors-760b89a277f7798c.graph
M cos/phases/2026-10-24-cos-manager/graph/MG6_settings_by_template_and_type-f0cc6fb8f4a34069.graph
M cos/phases/2026-10-24-cos-manager/graph/MG7_automation_macros_and_hats-a30d0a389948e0ff.graph
M cos/phases/2026-10-24-cos-manager/graph/MG8_the_factory-bb32f86a72592754.graph
D cos/phases/2026-10-24-cos-manager/graph/MG9_the_console_ui-66862ef658e800ac.graph
A cos/phases/2026-10-24-cos-manager/graph/MG9_the_console_ui-7e29ba0757fc4361.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG0b_the_full_spec-034f46861c02f038.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG15_the_supervisor_in_cos-3c09c7d2a96b76f1.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG18_the_supervisor_screen-7b0be1d382c7dd67.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG18_the_supervisor_screen-e21475ce366cd433.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG3_the_state_manager-dc78414883320b4a.graph
A cos/phases/2026-10-24-cos-manager/graph/_superseded/MG9_the_console_ui-66862ef658e800ac.graph
A cos/phases/2026-10-30-foundation-up/F4_raid_routes_the_doors.phase
A cos/phases/2026-10-30-foundation-up/graph/F4_raid_routes_the_doors-06ea6e31f8bc89c8.graph
A cos/spec/cos-manager.spec
A diagnostic/phases/2026-10-30-diagnostic-requirements/DR2_diagnostic_checks_them.phase
A diagnostic/phases/2026-10-30-diagnostic-requirements/DR4_fixed_under_policy.phase
A diagnostic/phases/2026-10-30-diagnostic-requirements/graph/DR2_diagnostic_checks_them-766bb3f0af8035c6.graph
A diagnostic/phases/2026-10-30-diagnostic-requirements/graph/DR4_fixed_under_policy-f110b2d660f6ef57.graph
A diagnostic/spec/requirements.spec
M docs/2026-10-15-cos-app-phasemap.spec
M docs/2026-10-17-system-drawbridge-phasemap.spec
M docs/2026-10-24-cos-manager-phasemap.spec
M docs/2026-10-24-emerge-warp-system-phasemap.spec
M docs/2026-10-24-sovereign-systems-phasemap.spec
A docs/2026-10-30-diagnostic-requirements-phasemap.spec
A docs/2026-10-30-foundation-up-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
A idearium/phases/2026-10-24-cos-manager/MG19_the_spec_bundle.phase
A idearium/phases/2026-10-24-cos-manager/graph/MG19_the_spec_bundle-a86ef0aa328b41e4.graph
A idearium/phases/2026-10-30-diagnostic-requirements/DR5_seen_and_fixed_from_the_screens.phase
A idearium/phases/2026-10-30-diagnostic-requirements/graph/DR5_seen_and_fixed_from_the_screens-d661be24641abef2.graph
A lib/phases/2026-10-24-cos-manager/MG15_the_supervisor_in_cos.phase
A lib/phases/2026-10-24-cos-manager/MG17_autopilot_hands_over.phase
A lib/phases/2026-10-24-cos-manager/graph/MG15_the_supervisor_in_cos-0c43ddb05e7ec414.graph
A lib/phases/2026-10-24-cos-manager/graph/MG17_autopilot_hands_over-ca8cc4ce5d744555.graph
A lib/phases/2026-10-30-diagnostic-requirements/DR1_systems_declare_what_they_need.phase
A lib/phases/2026-10-30-diagnostic-requirements/graph/DR1_systems_declare_what_they_need-0e1b7a7f93af4c5a.graph
A lib/phases/2026-10-30-foundation-up/F0_the_kernel_spec.phase
A lib/phases/2026-10-30-foundation-up/F1_one_vocabulary.phase
A lib/phases/2026-10-30-foundation-up/F2_the_locked_snapshot.phase
A lib/phases/2026-10-30-foundation-up/F3_the_door.phase
A lib/phases/2026-10-30-foundation-up/F5_memory_and_learning.phase
A lib/phases/2026-10-30-foundation-up/F6_the_compound_build.phase
A lib/phases/2026-10-30-foundation-up/F7_the_assistant.phase
A lib/phases/2026-10-30-foundation-up/F8_the_tutor.phase
A lib/phases/2026-10-30-foundation-up/graph/F0_the_kernel_spec-b5ffbb2dfe1dbac2.graph
A lib/phases/2026-10-30-foundation-up/graph/F1_one_vocabulary-acec7aacfc186e20.graph
A lib/phases/2026-10-30-foundation-up/graph/F2_the_locked_snapshot-b8861ec3342fda6e.graph
A lib/phases/2026-10-30-foundation-up/graph/F3_the_door-b2415e92525104ae.graph
A lib/phases/2026-10-30-foundation-up/graph/F5_memory_and_learning-099fc4242eb20f8a.graph
A lib/phases/2026-10-30-foundation-up/graph/F6_the_compound_build-ed3011d31d4a71cb.graph
A lib/phases/2026-10-30-foundation-up/graph/F7_the_assistant-4ebc18dab8418c79.graph
A lib/phases/2026-10-30-foundation-up/graph/F8_the_tutor-584152ca3ff74bde.graph
M lib/version.js
M loom/phases/2026-10-24-cos-manager/MG1_loom_on_its_registry_spine.phase
A ollama/phases/2026-10-30-diagnostic-requirements/DR3_the_owner_can_fix_it.phase
A ollama/phases/2026-10-30-diagnostic-requirements/graph/DR3_the_owner_can_fix_it-8bbb91adb76a4421.graph
M package.json
M tests/modules/test-genesis-and-architecture-spec.test.js
M tests/modules/test-substrate-spec.test.js
A versionium/changelogs/CHANGELOG-0.60.298.md
A versionium/changelogs/CHANGELOG-0.60.299.md
A versionium/changelogs/CHANGELOG-0.60.300.md
A versionium/changelogs/CHANGELOG-0.60.301.md
A versionium/changelogs/CHANGELOG-0.60.302.md
A versionium/changelogs/CHANGELOG-0.60.303.md
A versionium/changelogs/CHANGELOG-0.60.304.md
A versionium/changelogs/CHANGELOG-0.60.305.md
A versionium/changelogs/CHANGELOG-0.60.306.md
A versionium/changelogs/CHANGELOG-0.60.307.md
A versionium/changelogs/CHANGELOG-0.60.308.md
A versionium/changelogs/CHANGELOG-0.60.309.md
A versionium/changelogs/CHANGELOG-0.60.310.md
A versionium/changelogs/CHANGELOG-0.60.311.md
A versionium/changelogs/CHANGELOG-0.60.312.md
```

