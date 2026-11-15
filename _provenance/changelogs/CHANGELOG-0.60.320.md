# Nexus 0.60.320

**0.60.320 — the Gig metadata bullets, tab by tab (GT6); a tag no longer typed twice**

| | |
|---|---|
| Built | 2026-10-30 19:23:56 → 2026-10-30 19:23:56 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.320 |
| Tag | `v0.60.320` → snap-0792 |
| Full file ledger | [LEDGER-0.60.320.csv](../ledger/LEDGER-0.60.320.csv) |

## Release notes — `versionium/changelogs/CHANGELOG-0.60.320.md`

Copied unchanged from the build.

### 0.60.320 — the Gig metadata bullets, tab by tab (GT6); a tag no longer typed twice

James, 2026-10-30:
> "almost. more timing in between drop down menus. then we need the services, then the bullets for each tab for each catagory."

0.60.318 was the timing and 0.60.319 the services. This is the bullets.

#### Built (MOD-GT6)

- **The gig file has `metadata`**, tab by tab as the page names them:
  `{ "PROGRAMMING LANGUAGE": ["JavaScript"], "FRONTEND FRAMEWORK": ["React", "Vue.js", "Svelte"] }`.
  - A lone value, or a `*` in a tab's name, is read the same way.
  - It shows in the gig's parts and the template.
  - The chip menu has one row for it (`TAB: a, b; TAB: c`), and an edit there reads back as written.
- **The fill does it after the category and the service type**, because the tabs belong to the subcategory chosen. For each tab in the gig:
  - the tab is opened with the pointer, and its choices are read until they hold still (GATE-GT6-001);
  - each value is ticked or picked on its label, as checkboxes or radio buttons, found under the words "Gig metadata", never by a class name;
  - the tab's limit is kept: the page's counter (`3 / 5`), "up to N", or 1 for radio buttons (GATE-GT6-002);
  - each choice is read back under a gate (GATE-GT6-003), and the counter is put on the result.
- **Said, never guessed:**
  - a value the tab does not offer, with the tab's own list;
  - a tab the page does not have, with the page's tabs;
  - a value past the limit (the first N are kept);
  - a required tab (`*`) the gig names nothing for, with its list.

  Nothing he did not name is unticked.
- **Found by the test:** clicking a tab re-renders the tab list, so the marks on the tabs went stale (the GT4 lesson again). The tabs are
  marked again before every click now.

#### Fixed: a tag typed twice

FO-02, open since 0.60.319, was caught this time: `'ai agent'` was a chip twice. After Enter, the tags loop read the chip once, at once. A
page that draws the chip a moment later read "not shown", and the tag was typed again. Now the chip is waited for, using the gate's settle,
and read again just before any retype. A tag already shown is never typed a second time.

#### Proof

- `tests/modules/test-gig-metadata-glass.test.js`: **6/6**, on a live fixture page in Clear Glass's engine. The panel re-renders on each
  tab click, and the page refuses a sixth box.
  - It includes his acceptance: JavaScript in PROGRAMMING LANGUAGE, three frontend frameworks ticked and read back, the counter `3 / 5`.
  - It also checks the limit, a value not offered, a tab missing, a required tab left empty, and the whole fill through `_gigFill`.
- The tag fix: `test-fiverr-overview-and-a11y` 0 failures in 20 repeated runs, against 2 in about 30 before.
- 16 neighbouring suites are green.

#### Open

- **The fill's report and Copilot do not show `r.metadata` yet.** That is GT2's truthful report, next.
- **GT3:** the choose fields in the macro editor. **SD0–SD5:** site data.
- **Not yet confirmed on Fiverr itself.** The fixture is modelled on his screenshot of Gig metadata.
- **Not recorded in Versionium from this sandbox.** The boot sync records it on his machine (§17.12).

## Ledger

### Build 0.60.320 — snap-0792 — 2026-10-30 19:23:56

- Archive: `nexus-0792_2026-10-30_v0.60.320.zip` (was `nexus-0.60.320.zip`)
- SHA-256: `701457dd2c45d4f6c7aea49ccf2f8863bbfcc36a1d8119763a557809145be47b`, 46.5 MB, downloaded 2026-10-30 19:43:25
- Kind: full
- Commit: `79c915c3430f5e0f7851384935244c3470e33fa0`, tag `snap-0792`
- Files in archive: 12895. Changes against the build before it: **65 added, 47 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 26 | 32 | 1 |
| _archive | 21 | 0 | 0 |
| tests | 6 | 5 | 0 |
| docs | 4 | 3 | 0 |
| versionium | 7 | 0 | 0 |
| lib | 1 | 4 | 0 |
| (root) | 0 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
M VERSION
A _archive/imports/2026-10-30-local-clear-glass/README.md
A _archive/imports/2026-10-30-local-clear-glass/package.json
A _archive/imports/2026-10-30-local-clear-glass/renderer/browser.html
A _archive/imports/2026-10-30-local-clear-glass/renderer/browser.js
A _archive/imports/2026-10-30-local-clear-glass/renderer/macro-elements/log-bar.css
A _archive/imports/2026-10-30-local-clear-glass/renderer/macro-elements/log-bar.js
A _archive/imports/2026-10-30-local-clear-glass/renderer/settings/sections/macros.css
A _archive/imports/2026-10-30-local-clear-glass/renderer/settings/sections/macros.js
A _archive/imports/2026-10-30-local-clear-glass/renderer/site-profile-groups.js
A _archive/imports/2026-10-30-local-clear-glass/spec/macro-elements.spec
A _archive/imports/2026-10-30-local-clear-glass/src/autofill/portfolio.js
A _archive/imports/2026-10-30-local-clear-glass/src/dom/archaeology.js
A _archive/imports/2026-10-30-local-clear-glass/src/dom/select-match.js
A _archive/imports/2026-10-30-local-clear-glass/src/ipc/bridge.js
A _archive/imports/2026-10-30-local-clear-glass/src/macros/recorder-script.js
A _archive/imports/2026-10-30-local-clear-glass/src/macros/recording.js
A _archive/imports/2026-10-30-local-clear-glass/src/options/store.js
A _archive/imports/2026-10-30-local-clear-glass/src/preload/index.js
A _archive/imports/2026-10-30-local-clear-glass/src/site-settings/keys.js
A _archive/imports/2026-10-30-local-clear-glass/src/site-settings/readers.js
A _archive/imports/2026-10-30-local-clear-glass/test/macro-elements.test.js
M clear-glass/phases/2026-10-28-gated-flows/GT1_gate_timing_for_dropdowns.phase
A clear-glass/phases/2026-10-28-gated-flows/GT4_pace_between_dropdowns_and_find_again.phase
A clear-glass/phases/2026-10-28-gated-flows/GT5_service_type.phase
A clear-glass/phases/2026-10-28-gated-flows/GT6_gig_metadata_bullets_per_tab.phase
M clear-glass/phases/2026-10-28-gated-flows/UG3_every_dom_write_gated.phase
M clear-glass/phases/2026-10-28-gated-flows/graph/AF6_the_chip_on_dropdowns-15cfca64abf4a4d3.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/FG1_keyboard_mode_switch-0dad41529b853fe9.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/FG2_dropdown_choose-ea9138208f910de6.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/FG5_fiverr_gig_flow-d1435f31c439c9a5.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GF1_every_field_found_by_its_section-db4a65a01804bad9.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GF2_every_editor_page_known-fe26a8f96552b2be.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GF3_text_and_lists_filled_and_read_back-774e26a8703d38e8.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GF4_friction_goes_to_his_site_keys-b5c6c77517752cd1.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GF5_category_and_subcategory_finished-312042fa331b4574.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GG1_every_part_gated-89f557418c1d7e83.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GM1_the_fill_menu_model-bcb884ca2f3645e0.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GM2_fill_only_what_is_ticked-5ce27f2d56b8573d.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GT1_gate_timing_for_dropdowns-64d0f320581793eb.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GT2_the_fill_includes_and_reports_dropdowns-ab11319c3a8ba324.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/GT3_choose_fields_in_the_macro_editor-afd63e9391733aa1.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT4_pace_between_dropdowns_and_find_again-cdd1748d81c66e56.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT5_service_type-334c1f208c1e4766.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/GT6_gig_metadata_bullets_per_tab-0d1eff7b0fcef569.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/KB1_choose_waits_and_keys-5c4366d7ed36cfb4.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/KB2_site_keys-a2456fa5feed64eb.graph
M clear-glass/phases/2026-10-28-gated-flows/graph/KB3_site_keys_ui-4cb9972c3bf9fcab.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/UG3_every_dom_write_gated-f1e421a28cd6b76a.graph
D clear-glass/phases/2026-10-28-gated-flows/graph/UG3_every_dom_write_gated-fe52db277cfeab98.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/GT4_pace_between_dropdowns_and_find_again-bd059b851e5193e5.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/GT5_service_type-510c1db9cc8ea4a1.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/GT6_gig_metadata_bullets_per_tab-83a8b5aa38eda139.graph
A clear-glass/phases/2026-10-28-gated-flows/graph/_superseded/UG3_every_dom_write_gated-fe52db277cfeab98.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD0_his_machine_work_onto_main.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD1_the_accessibility_widget_kept_off.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD2_reset_a_site.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD3_cookies_and_logins.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD4_history_as_a_full_page.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/SD5_the_dom_map_before_the_fill.phase
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD0_his_machine_work_onto_main-28d6d7f41c26e4c8.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD1_the_accessibility_widget_kept_off-01c8da4f1550988b.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD2_reset_a_site-dad127e53f547abc.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD3_cookies_and_logins-bcfcf7f7e188b659.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD4_history_as_a_full_page-25d362c8ab254ae3.graph
A clear-glass/phases/2026-10-30-site-data-and-fiverr-dom/graph/SD5_the_dom_map_before_the_fill-dfd87260b176b3f5.graph
M clear-glass/renderer/site-profile-groups.js
M clear-glass/spec/gated-flows.spec
A clear-glass/spec/site-data.spec
M clear-glass/src/autofill/gig-fields.js
M clear-glass/src/autofill/gig-menu.js
M clear-glass/src/autofill/gig-pages.js
M clear-glass/src/autofill/gig.js
A clear-glass/src/autofill/portfolio.js
M clear-glass/src/dom/archaeology.js
A clear-glass/src/dom/select-match.js
M clear-glass/src/driver/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/page/element-gate.js
M clear-glass/src/site-settings/keys.js
M clear-glass/src/site-settings/readers.js
M docs/2026-10-26-inline-autofill-ui-phasemap.spec
M docs/2026-10-28-gated-flows-phasemap.spec
A docs/2026-10-30-compartment-metrics-and-learning-loop-phasemap.spec
A docs/2026-10-30-pipeline-consolidation-and-job-ledger-phasemap.spec
A docs/2026-10-30-portfolio-node-per-site-ui-macros-phasemap.spec
A docs/2026-10-30-site-data-and-fiverr-dom-phasemap.spec
M docs/SPEC-REGISTRY.spec
A lib/node-schemas/schema.portfolio
M lib/phases/2026-10-28-gated-flows/graph/EI1_every_key_and_click_paced_through_eros-17aa88cf93851de0.graph
M lib/phases/2026-10-28-gated-flows/graph/FG4_pointer_and_choose_steps-052d76f61b97db36.graph
M lib/phases/2026-10-28-gated-flows/graph/KB4_gates_on_macro_steps-9d0c03bbba992231.graph
M lib/version.js
M loom/maps/economy-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-choose-refind-glass.test.js
A tests/modules/test-dropdown-fill-glass.test.js
M tests/modules/test-fiverr-overview-and-a11y.test.js
M tests/modules/test-gig-all-fields.test.js
A tests/modules/test-gig-metadata-glass.test.js
A tests/modules/test-portfolio-node.test.js
A tests/modules/test-select-match.test.js
A tests/modules/test-service-type-glass.test.js
M tests/modules/test-site-settings-ui.test.js
M tests/modules/test-substrate-spec.test.js
A versionium/changelogs/CHANGELOG-0.60.314.md
A versionium/changelogs/CHANGELOG-0.60.315.md
A versionium/changelogs/CHANGELOG-0.60.316.md
A versionium/changelogs/CHANGELOG-0.60.317.md
A versionium/changelogs/CHANGELOG-0.60.318.md
A versionium/changelogs/CHANGELOG-0.60.319.md
A versionium/changelogs/CHANGELOG-0.60.320.md
```

