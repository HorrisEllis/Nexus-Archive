# Nexus 0.60.295

**0.60.295 — the per-site Pipelines and Gates settings shown in the Site settings popup**

| | |
|---|---|
| Built | 2026-10-29 23:22:16 → 2026-10-29 23:22:16 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.295 |
| Tag | `v0.60.295` → snap-0788 |
| Full file ledger | [LEDGER-0.60.295.csv](../ledger/LEDGER-0.60.295.csv) |

## Release notes — `versionium/changelogs/CHANGELOG-0.60.295.md`

Copied unchanged from the build.

### 0.60.295 — the per-site Pipelines and Gates settings shown in the Site settings popup

James, 2026-10-30:
> "merge and push so i can download"

0.60.293–0.60.294 were merged, at his request, before the 102-suite regression comparison against 0.60.292 had finished. When it finished,
it found one real gap:
- **The Site settings popup** (toolbar › this site) drew only its own fixed list of groups. The per-site **Pipelines** switch (PL10) and
  the **Gates** timing never appeared.
  - Both groups are drawn now.
  - Any group the key table has that the popup's list lacks is added at the end, so a new setting can no longer be hidden this way.
  - `test-site-settings-ui` is 3/3.
- **GM-02's stand-in page** had no `insertText`, which every real Electron page has. Since 0.60.294 the driver types key by key, so the
  stand-in needed it. `test-gig-fill-menu` is 3/3.

The rest of the comparison:
- **Green again:** `test-about-and-nodes` (AN-03) and `test-template-picker`.
- **browser-shell:** failed once during the side-by-side run and passed 28/28 alone; it was load timing.
- **Failing the same way on 0.60.292 (not caused by these releases):**
  - window-frame;
  - clear-glass-accounts;
  - accounts-portal-settings;
  - node-schemas;
  - readme-generate;
  - repo-carve;
  - repo-settings-ui;
  - workshop-full.

## Ledger

### Build 0.60.295 — snap-0788 — 2026-10-29 23:22:16

- Archive: `nexus-0788_2026-10-29_v0.60.295.zip` (was `nexus-0.60.295.zip`)
- SHA-256: `f8c639ce4be06738cba1fa3feaefc4673f2bdba0bfcd0f3fb6263b47a3ca3679`, 33.1 MB, downloaded 2026-10-30 01:02:28
- Kind: full
- Commit: `b5a35db3af26c9cc4b0f56de17fc61351e511389`, tag `snap-0788`
- Files in archive: 12659. Changes against the build before it: **813 added, 139 modified, 718 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 6 | 561 |
| versionium | 499 | 3 | 0 |
| data | 122 | 0 | 0 |
| clear-glass | 62 | 47 | 9 |
| lib | 25 | 30 | 3 |
| tests | 27 | 11 | 7 |
| docs | 21 | 19 | 1 |
| _archive | 23 | 0 | 7 |
| erosmancer | 28 | 0 | 0 |
| guardian | 0 | 3 | 16 |
| src | 0 | 0 | 14 |
| idearium | 3 | 10 | 0 |
| 2026-10-28-gated-flows | 0 | 0 | 12 |
| 2026-10-28-first-principles | 0 | 0 | 10 |
| 2026-10-28-tab-compartments | 0 | 0 | 10 |
| settings | 0 | 0 | 10 |
| gigs | 0 | 0 | 10 |
| answers | 0 | 0 | 6 |
| page | 0 | 0 | 5 |
| cos | 1 | 4 | 0 |
| nodes | 0 | 0 | 5 |
| tools | 0 | 0 | 4 |
| scripts | 2 | 2 | 0 |
| autofill | 0 | 0 | 4 |
| site-settings | 0 | 0 | 3 |
| loom | 0 | 3 | 0 |
| main | 0 | 0 | 3 |
| site-keys | 0 | 0 | 2 |
| preload | 0 | 0 | 2 |
| macros | 0 | 0 | 2 |
| js | 0 | 0 | 2 |
| net | 0 | 0 | 1 |
| archive | 0 | 0 | 1 |
| shell | 0 | 0 | 1 |
| shortcuts | 0 | 0 | 1 |
| driver | 0 | 0 | 1 |
| dom | 0 | 0 | 1 |
| about | 0 | 0 | 1 |
| tabs | 0 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| options | 0 | 0 | 1 |
| ipc | 0 | 0 | 1 |

```
D 2026-10-28-first-principles/FP1_where_a_request_opens.phase
D 2026-10-28-first-principles/FP2_which_option_is_meant.phase
D 2026-10-28-first-principles/FP3_is_the_gate_open.phase
D 2026-10-28-first-principles/FP4_what_a_key_changed.phase
D 2026-10-28-first-principles/FP5_the_pricing_page_blocks.phase
D 2026-10-28-gated-flows/FG1_keyboard_mode_switch.phase
D 2026-10-28-gated-flows/FG2_dropdown_choose.phase
D 2026-10-28-gated-flows/FG3_gate_per_step.phase
D 2026-10-28-gated-flows/FG4_pointer_and_choose_steps.phase
D 2026-10-28-gated-flows/FG5_fiverr_gig_flow.phase
D 2026-10-28-gated-flows/FG6_blocks_ui.phase
D 2026-10-28-tab-compartments/TC1_a_compartment_per_tab.phase
D 2026-10-28-tab-compartments/TC2_one_webview_per_tab.phase
D 2026-10-28-tab-compartments/TC3_links_open_tabs.phase
D 2026-10-28-tab-compartments/TC4_pop_out_and_dock.phase
D 2026-10-28-tab-compartments/TC5_new_tab_chooser.phase
D CHANGELOG-0.39.144-part2.md
D CHANGELOG-0.39.144.md
D CHANGELOG-0.39.165.md
D CHANGELOG-0.39.166.md
D CHANGELOG-0.39.167.md
D CHANGELOG-0.39.168.md
D CHANGELOG-0.39.169.md
D CHANGELOG-0.39.170.md
D CHANGELOG-0.39.172.md
D CHANGELOG-0.39.173.md
D CHANGELOG-0.39.174.md
D CHANGELOG-0.39.175.md
D CHANGELOG-0.39.176.md
D CHANGELOG-0.39.177.md
D CHANGELOG-0.39.178.md
D CHANGELOG-0.39.179.md
D CHANGELOG-0.39.181.md
D CHANGELOG-0.39.182.md
D CHANGELOG-0.39.188.md
D CHANGELOG-0.39.190.md
D CHANGELOG-0.39.191.md
D CHANGELOG-0.39.192.md
D CHANGELOG-0.39.193.md
D CHANGELOG-0.39.194.md
D CHANGELOG-0.39.223.md
D CHANGELOG-0.39.227.md
D CHANGELOG-0.39.228.md
D CHANGELOG-0.39.236.md
D CHANGELOG-0.39.237.md
D CHANGELOG-0.39.238.md
D CHANGELOG-0.39.239.md
D CHANGELOG-0.39.240.md
D CHANGELOG-0.39.241.md
D CHANGELOG-0.39.242.md
D CHANGELOG-0.39.243.md
D CHANGELOG-0.39.244.md
D CHANGELOG-0.39.245.md
D CHANGELOG-0.39.246.md
D CHANGELOG-0.39.247.md
D CHANGELOG-0.39.248.md
D CHANGELOG-0.39.249.md
D CHANGELOG-0.39.250.md
D CHANGELOG-0.39.251.md
D CHANGELOG-0.39.252.md
D CHANGELOG-0.39.253.md
D CHANGELOG-0.39.254.md
D CHANGELOG-0.39.255.md
D CHANGELOG-0.39.256.md
D CHANGELOG-0.39.257.md
D CHANGELOG-0.39.258.md
D CHANGELOG-0.39.259.md
D CHANGELOG-0.39.260.md
D CHANGELOG-0.39.261.md
D CHANGELOG-0.39.262.md
D CHANGELOG-0.39.263.md
D CHANGELOG-0.39.264.md
D CHANGELOG-0.39.266.md
D CHANGELOG-0.39.267.md
D CHANGELOG-0.39.268.md
D CHANGELOG-0.39.269.md
D CHANGELOG-0.39.270.md
D CHANGELOG-0.39.271.md
D CHANGELOG-0.39.272.md
D CHANGELOG-0.39.273.md
D CHANGELOG-0.39.274.md
D CHANGELOG-0.39.275.md
D CHANGELOG-0.39.276.md
D CHANGELOG-0.39.277.md
D CHANGELOG-0.39.278.md
D CHANGELOG-0.39.279.md
D CHANGELOG-0.39.280.md
D CHANGELOG-0.39.281.md
D CHANGELOG-0.39.282.md
D CHANGELOG-0.39.283.md
D CHANGELOG-0.39.284.md
D CHANGELOG-0.39.285.md
D CHANGELOG-0.39.286.md
D CHANGELOG-0.39.287.md
D CHANGELOG-0.39.288.md
D CHANGELOG-0.39.289.md
D CHANGELOG-0.39.290.md
D CHANGELOG-0.39.291.md
D CHANGELOG-0.39.292.md
D CHANGELOG-0.39.293.md
D CHANGELOG-0.39.294.md
D CHANGELOG-0.39.295.md
D CHANGELOG-0.39.296.md
D CHANGELOG-0.39.297.md
D CHANGELOG-0.39.298.md
D CHANGELOG-0.39.299.md
D CHANGELOG-0.39.300.md
D CHANGELOG-0.39.301.md
D CHANGELOG-0.39.302.md
D CHANGELOG-0.39.303.md
D CHANGELOG-0.39.304.md
D CHANGELOG-0.39.305.md
D CHANGELOG-0.39.306.md
D CHANGELOG-0.39.307.md
D CHANGELOG-0.39.308.md
D CHANGELOG-0.39.309.md
D CHANGELOG-0.39.310.md
D CHANGELOG-0.39.311.md
D CHANGELOG-0.39.312.md
D CHANGELOG-0.39.313.md
D CHANGELOG-0.39.314.md
D CHANGELOG-0.39.315.md
D CHANGELOG-0.39.316.md
D CHANGELOG-0.39.317.md
D CHANGELOG-0.39.318.md
D CHANGELOG-0.39.319.md
D CHANGELOG-0.39.320.md
D CHANGELOG-0.39.321.md
D CHANGELOG-0.39.322.md
D CHANGELOG-0.39.323.md
D CHANGELOG-0.39.324.md
D CHANGELOG-0.39.325.md
D CHANGELOG-0.39.326.md
D CHANGELOG-0.39.327.md
D CHANGELOG-0.39.328.md
D CHANGELOG-0.39.329.md
D CHANGELOG-0.39.330.md
D CHANGELOG-0.39.331.md
D CHANGELOG-0.39.332.md
D CHANGELOG-0.39.333.md
D CHANGELOG-0.39.334.md
D CHANGELOG-0.39.335.md
D CHANGELOG-0.39.336.md
D CHANGELOG-0.39.337.md
D CHANGELOG-0.39.338.md
D CHANGELOG-0.39.339.md
D CHANGELOG-0.39.340.md
D CHANGELOG-0.39.341.md
D CHANGELOG-0.39.342.md
D CHANGELOG-0.39.343.md
```

1520 more (mostly data, logs and archived files) are in the ledger file.

