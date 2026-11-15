# Nexus 0.60.313

**0.60.313 — dropdown gates need time, the fill reports its dropdowns, choose gets its fields**

| | |
|---|---|
| Built | 2026-10-30 11:58:08 → 2026-10-30 11:58:08 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.313 |
| Tag | `v0.60.313` → snap-0791 |
| Full file ledger | [LEDGER-0.60.313.csv](../ledger/LEDGER-0.60.313.csv) |

## Release notes — `versionium/changelogs/CHANGELOG-0.60.313.md`

Copied unchanged from the build.

### 0.60.313 — dropdown gates need time, the fill reports its dropdowns, choose gets its fields

James, 2026-10-30:
> "wheich needs more timing for the gates for the drop down menus. also the autofill clip should include the drop downs. also the macro editor needs to have the fields to change all of this. like element text, target text or menu number, in relation to the drop down menu items."

#### Grounded
- **The gate's wait is fixed:** `settle()` waits 2500 ms, with a 400 ms settle and one retry. Fiverr loads the subcategory list late, so that isn't always enough.
- **The fill's report is wrong.** `leftToCopy` is computed before the page's own parts run, so the title is reported as both filled and left. The dropdowns it chooses go into a list Copilot never prints.
- **The macro editor has no form for `choose`.**

#### Specced (`clear-glass/spec/gated-flows.spec`), phases GT1–GT3
- **GT1:** gate timing per part. Choice gates wait longer, the subcategory waits for the category, and retries grow.
- **GT2:** the fill counts each part once, and Copilot names the dropdowns.
- **GT3:** `choose` gets its fields in the macro editor: dropdown text, element, option or menu number, pick method and timing.

"The autofill clip" is read as Copilot's fill run, to confirm. AF6 already puts the chip on dropdowns.

#### Asked: is Emerge ready to code Nexus in?
Not yet, and checked by running it:
- A compiled `.eg` file exports nothing to JavaScript.
- By design, it has no network, timers or async.

**The next step:** a host bridge that lets a component's hooks be called from JavaScript. Then Nexus's pure logic (gates, policies, matching) can be written in Emerge first.

Spec and map only.

## Ledger

### Build 0.60.313 — snap-0791 — 2026-10-30 11:58:08

- Archive: `nexus-0791_2026-10-30_v0.60.313.zip` (was `nexus-0.60.313.zip`)
- SHA-256: `8940486859789d860bc631e66757a9053fad69890f98dfd96dff8acc80d2b15c`, 46.2 MB, downloaded 2026-10-30 12:04:46
- Kind: full
- Commit: `028dd19d81d44d89f59cb95d0e7fc0ab2001bf54`, tag `snap-0791`
- Identical copy: `nexus-0791_2026-10-30_v0.60.313_1_dup1.zip` (was `nexus-0.60.313-1.zip`)
- Files in archive: 12831. Changes against the build before it: **65 added, 12 modified, 5 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 54 | 6 | 3 |
| lib | 10 | 3 | 2 |
| (root) | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| versionium | 1 | 0 | 0 |

```
M VERSION
A clear-glass/phases/2026-10-28-gated-flows/AC2_the_look_traced_and_kept_off_by_the_backend.phase
A clear-glass/phases/2026-10-28-gated-flows/AF6_the_chip_on_dropdowns.phase
M clear-glass/phases/2026-10-28-gated-flows/FG1_keyboard_mode_switch.phase
M clear-glass/phases/2026-10-28-gated-flows/FG2_dropdown_choose.phase
M clear-glass/phases/2026-10-28-gated-flows/FG5_fiverr_gig_flow.phase
M clear-glass/phases/2026-10-28-gated-flows/FG6_blocks_ui.phase
A clear-glass/phases/2026-10-28-gated-flows/GF1_every_field_found_by_its_section.phase
A clear-glass/phases/2026-10-28-gated-flows/GF2_every_editor_page_known.phase
A clear-glass/phases/2026-10-28-gated-flows/GF3_text_and_lists_filled_and_read_back.phase
A clear-glass/phases/2026-10-28-gated-flows/GF4_friction_goes_to_his_site_keys.phase
A clear-glass/phases/2026-10-28-gated-flows/GF5_category_and_subcategory_finished.phase
A clear-glass/phases/2026-10-28-gated-flows/GG1_every_part_gated.phase
A clear-glass/phases/2026-10-28-gated-flows/GM1_the_fill_menu_model.phase
A clear-glass/phases/2026-10-28-gated-flows/GM2_fill_only_what_is_ticked.phase
A clear-glass/phases/2026-10-28-gated-flows/GM3_the_menu_in_the_gig_panel.phase
A clear-glass/phases/2026-10-28-gated-flows/GT1_gate_timing_for_dropdowns.phase
A clear-glass/phases/2026-10-28-gated-flows/GT2_the_fill_includes_and_reports_dropdowns.phase
A clear-glass/phases/2026-10-28-gated-flows/GT3_choose_fields_in_the_macro_editor.phase
A clear-glass/phases/2026-10-28-gated-flows/KB1_choose_waits_and_keys.phase
A clear-glass/phases/2026-10-28-gated-flows/KB2_site_keys.phase
A clear-glass/phases/2026-10-28-gated-flows/KB3_site_keys_ui.phase
A clear-glass/phases/2026-10-28-gated-flows/KB6_bundled_nodes_upgrade.phase
A clear-glass/phases/2026-10-28-gated-flows/KB7_pin_the_floating_cli.phase
A clear-glass/phases/2026-10-28-gated-flows/UG1_one_gate_for_every_element.phase
A clear-glass/phases/2026-10-28-gated-flows/UG2_every_driver_write_gated.phase
A clear-glass/phases/2026-10-28-gated-flows/UG3_every_dom_write_gated.phase
A clear-glass/phases/2026-10-28-gated-flows/UG4_his_gates_per_site.phase
A clear-glass/phases/2026-10-28-gated-flows/UG5_gates_made_with_the_picker.phase
A clear-glass/phases/2026-10-28-gated-flows/graph/AC2_the_look_traced_and_kept_off_by_the_backend-c2571bb8e6088b3f.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/AF6_the_chip_on_dropdowns-15cfca64abf4a4d3.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/FG1_keyboard_mode_switch-0dad41529b853fe9.graph
D clear-glass/phases/2026-10-28-gated-flows/graph/FG1_keyboard_mode_switch-9a9dc6581e12d0ea.graph
D clear-glass/phases/2026-10-28-gated-flows/graph/FG2_dropdown_choose-08c4739a2ba8d8b7.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/FG2_dropdown_choose-ea9138208f910de6.graph
D clear-glass/phases/2026-10-28-gated-flows/graph/FG5_fiverr_gig_flow-216aea9c663a7a59.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/FG5_fiverr_gig_flow-d1435f31c439c9a5.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/FG6_blocks_ui-a43be0af6c52f6cb.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GF1_every_field_found_by_its_section-db4a65a01804bad9.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GF2_every_editor_page_known-fe26a8f96552b2be.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GF3_text_and_lists_filled_and_read_back-774e26a8703d38e8.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GF4_friction_goes_to_his_site_keys-b5c6c77517752cd1.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GF5_category_and_subcategory_finished-312042fa331b4574.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GG1_every_part_gated-89f557418c1d7e83.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GM1_the_fill_menu_model-bcb884ca2f3645e0.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GM2_fill_only_what_is_ticked-5ce27f2d56b8573d.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GM3_the_menu_in_the_gig_panel-913c1da3799e3bb7.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT1_gate_timing_for_dropdowns-64d0f320581793eb.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT2_the_fill_includes_and_reports_dropdowns-ab11319c3a8ba324.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT3_choose_fields_in_the_macro_editor-afd63e9391733aa1.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/KB1_choose_waits_and_keys-5c4366d7ed36cfb4.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/KB2_site_keys-a2456fa5feed64eb.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/KB3_site_keys_ui-4cb9972c3bf9fcab.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/KB6_bundled_nodes_upgrade-7b7a18393ae12710.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/KB7_pin_the_floating_cli-d675ad2d86a480a6.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG1_one_gate_for_every_element-87eaaf42d5e86559.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG2_every_driver_write_gated-724b30041f1accb0.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG3_every_dom_write_gated-fe52db277cfeab98.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG4_his_gates_per_site-8debd86850579fea.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG5_gates_made_with_the_picker-d53798a520d884c9.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/FG1_keyboard_mode_switch-9a9dc6581e12d0ea.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/FG2_dropdown_choose-08c4739a2ba8d8b7.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/FG5_fiverr_gig_flow-216aea9c663a7a59.graph
M clear-glass/spec/gated-flows.spec
M docs/2026-10-28-gated-flows-phasemap.spec
A lib/phases/2026-10-28-gated-flows/EI1_every_key_and_click_paced_through_eros.phase
M lib/phases/2026-10-28-gated-flows/FG3_gate_per_step.phase
M lib/phases/2026-10-28-gated-flows/FG4_pointer_and_choose_steps.phase
A lib/phases/2026-10-28-gated-flows/KB4_gates_on_macro_steps.phase
A lib/phases/2026-10-28-gated-flows/KB5_keys_in_macros_and_automation.phase
A lib/phases/2026-10-28-gated-flows/graph/EI1_every_key_and_click_paced_through_eros-17aa88cf93851de0.graph
A lib/phases/2026-10-28-gated-flows/graph/FG3_gate_per_step-a56cc1d01c4a4027.graph
D lib/phases/2026-10-28-gated-flows/graph/FG3_gate_per_step-f27d7a0f3a2314d7.graph
A lib/phases/2026-10-28-gated-flows/graph/FG4_pointer_and_choose_steps-052d76f61b97db36.graph
D lib/phases/2026-10-28-gated-flows/graph/FG4_pointer_and_choose_steps-60773f0036bb8229.graph
A lib/phases/2026-10-28-gated-flows/graph/KB4_gates_on_macro_steps-9d0c03bbba992231.graph
A lib/phases/2026-10-28-gated-flows/graph/KB5_keys_in_macros_and_automation-5d59d7e8e79bfa25.graph
A lib/phases/2026-10-28-gated-flows/graph/_superseded/FG3_gate_per_step-f27d7a0f3a2314d7.graph
A lib/phases/2026-10-28-gated-flows/graph/_superseded/FG4_pointer_and_choose_steps-60773f0036bb8229.graph
M lib/version.js
M package.json
A versionium/changelogs/CHANGELOG-0.60.313.md
```

