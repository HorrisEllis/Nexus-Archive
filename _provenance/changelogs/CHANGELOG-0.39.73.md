# Nexus 0.39.73

| | |
|---|---|
| Built | 2026-09-08 03:56:08 → 2026-09-10 17:34:40 |
| Builds on the main line | 2 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.73 |
| Tag | `v0.39.73` → snap-0529 |
| Full file ledger | [LEDGER-0.39.73.csv](../ledger/LEDGER-0.39.73.csv) |

## Ledger

### Build 0.39.73-r1 — snap-0528 — 2026-09-08 03:56:08

- Archive: `nexus-0528_2026-09-08_v0.39.73-r1.zip` (was `nexus-v0.39.73.zip`)
- SHA-256: `1bccd0c6fcf631c8f27242d7d130858241d7287644ad5eddb5290996a23e0ce0`, 74.9 MB, downloaded 2026-09-08 04:07:15
- Kind: full
- Commit: `29ae59c3b186d622f103c540675559b57d08bdbf`, tag `snap-0528`
- Left out: embedded .git (4940 files, HEAD cb644b7f97270bd2e529c618e0f92a1ca7107005 (master))
- Files in archive: 4227. Changes against the build before it: **114 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 95 | 4 | 0 |
| idearium | 14 | 2 | 0 |
| data | 1 | 10 | 0 |
| tests | 4 | 1 | 0 |
| guardian | 0 | 3 | 0 |
| clear-glass | 0 | 2 | 0 |
| ui | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |

```
M clear-glass/src/copilot/bridge.js
M clear-glass/src/main/index.js
M data/cortex/memory/cfr_tension_history.json
M data/cortex/memory/idearium_ideas.json
M data/cortex/memory/idearium_repos.json
M data/cortex/memory/idearium_spec_chunks.json
M data/cortex/memory/idearium_spec_manifests.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
A data/guardian/memory/jobs.json
M data/guardian/memory/settings.json
M data/idearium/event_log.jsonl
M guardian/lib/ncp-handler.js
M guardian/server.js
M guardian/userscript-nexus-wake.js
A idearium/data/projects/nexus-id-repo-1886b8cb/00-meta.md
A idearium/data/projects/nexus-id-repo-1886b8cb/01-purpose.md
A idearium/data/projects/nexus-id-repo-1886b8cb/02-axioms.md
A idearium/data/projects/nexus-id-repo-1886b8cb/03-schema.md
A idearium/data/projects/nexus-id-repo-1886b8cb/04-api.md
A idearium/data/projects/nexus-id-repo-1886b8cb/05-events.md
A idearium/data/projects/nexus-id-repo-1886b8cb/06-integration.md
A idearium/data/projects/nexus-id-repo-1886b8cb/07-failure_modes.md
A idearium/data/projects/nexus-id-repo-1886b8cb/08-build_order.md
A idearium/data/projects/nexus-id-repo-1886b8cb/09-tests.md
A idearium/data/specs/07c37e3e-76e8-41eb-aba3-fa02a9e92476/00-meta-be147340.md
A idearium/data/specs/07c37e3e-76e8-41eb-aba3-fa02a9e92476/manifest.json
A idearium/data/specs/22c28fe5-6df0-4898-93db-1fee3fb79f3f/00-meta-7297b4b7.md
A idearium/data/specs/22c28fe5-6df0-4898-93db-1fee3fb79f3f/manifest.json
M idearium/repo/index.js
M idearium/spec-engine/index.js
A lib/agent-tools/generate-tool-nodes.js
M lib/agent-tools/index.js
A lib/agent-tools/tool-call-listener.js
A lib/agent-tools/tools/ollama/generate.js
M lib/node-export.js
M lib/node-schemas.js
A lib/node-schemas/framework.js
A lib/node-schemas/toolbox.js
A lib/nodes/agent_capability.9b376c73-3960-445f-8328-9e9f0083816d.tool
A lib/nodes/agent_chat.cacad890-320b-4802-a06d-31842f049404.tool
A lib/nodes/agent_chat_search.cdee006e-c226-46f3-a6bf-4d770a665fab.tool
A lib/nodes/agent_council.c9a255ca-b90b-429d-8157-4704b08cf429.tool
A lib/nodes/agent_mesh_route.b42ed0f3-e6a6-4a7a-af6e-73e3d8204ef1.tool
A lib/nodes/agent_notes.1f3efe44-3fe2-424c-90a2-a387b121b185.tool
A lib/nodes/ambiguity_pull.fddeab2d-c7b3-4af8-ba34-9f7c4b1937dc.tool
A lib/nodes/analyze.855fb443-bf05-4689-bfd5-b0729af3b4f3.tool
A lib/nodes/ask_james.0b848646-4358-4995-ab21-c2221eb6f72f.tool
A lib/nodes/axiom_check.58d4ae52-fa4c-48c4-8891-8465b9e02ced.tool
A lib/nodes/axiom_manage.e9786012-3ac3-487b-a133-1f5008a42ee6.tool
A lib/nodes/browser_action.c7889c8e-93b8-4059-aff7-9ce37f346268.tool
A lib/nodes/call_system.b248c699-4111-4053-b770-ba67f2bec63b.tool
A lib/nodes/chatgpt.befd1413-c400-4e94-9a26-dcb8bc1a8711.toolbox
A lib/nodes/claude.7be6770c-9b93-4ac7-b805-9d9c64e99afc.toolbox
A lib/nodes/clear_glass_command_index.38b26c20-6acf-4d42-95c5-a83d5b0905a1.tool
A lib/nodes/clear_glass_dom_archaeology.4254c806-066a-473c-8ad4-e12f8c806f6d.tool
A lib/nodes/clear_glass_provider_deploy.b20c464c-ab43-4693-a1d2-caa4f1593d98.tool
A lib/nodes/clear_glass_tab_visibility.c4bab5ad-efe5-4291-a995-99293046029d.tool
A lib/nodes/clear_glass_userscripts.d308bf2b-abe4-44fb-86ca-726c42276801.tool
A lib/nodes/compiler_info.9d2ce889-68a7-4f52-9b78-9b96e5ad7cc1.tool
A lib/nodes/copilot_identity.f0112112-85a1-4137-ae78-797500e0c373.tool
A lib/nodes/cos_archetype.21e25490-683f-4d81-a99b-08f9ec48acca.tool
A lib/nodes/cos_blueprint.4ab18144-99d4-4846-bbc1-1b0dafafe03b.tool
A lib/nodes/cos_compartment.be725c4b-6b7a-4afc-9b6a-900771a82a14.tool
A lib/nodes/cos_playground.31242923-a812-4d91-9275-f036c428cc26.tool
A lib/nodes/cos_plugin.861bc201-4875-491a-be00-7677080bf359.tool
A lib/nodes/cos_simulate.4bfa6ca3-3fbf-4a85-95cc-85076c3a7d95.tool
A lib/nodes/cos_vault.cf10a1e6-63ef-477e-8d7c-ba12edc9f519.tool
A lib/nodes/delete_file.1d441d33-e323-42f3-b36b-31c37a5ee993.tool
A lib/nodes/diagnose.85771263-5864-4fa5-81ba-838b44160e03.tool
A lib/nodes/emergence.5bce4687-07e4-4c2b-83f1-e805235d7e6c.tool
A lib/nodes/fault_log.757b53ac-18bf-4eb6-905c-721652df49ec.tool
A lib/nodes/file_tree.49c055af-869a-41be-bf20-4d67e54e3f32.tool
A lib/nodes/forge_tool.aa716156-a3d5-48e6-97f6-2b5b7a34208c.tool
A lib/nodes/framework_builder.684f4785-b0a0-4cd7-bfb4-22c1904c3f37.tool
A lib/nodes/gemini.49ecd716-b75d-40b9-b186-e086fafdbd78.toolbox
A lib/nodes/guardian_dispatch.428db0f0-e7f1-47f4-9421-327cdb68dd86.tool
A lib/nodes/hat_forge.ac5a2bd6-a24c-488d-81ec-0a958d01d771.tool
A lib/nodes/intelligence_query.8524f388-81ae-44b4-a600-73fadc5ff45a.tool
A lib/nodes/intent_hat.6688e61c-bb2b-417e-9620-86f42f14796e.tool
A lib/nodes/intuition.cb48d964-2fe8-47c6-b65c-1d48ec068c26.tool
A lib/nodes/loom_register.cc5328ed-4485-47ad-9e55-8efece334ce9.tool
A lib/nodes/loom_scan.dbad43f1-88b6-4abf-a63b-1a4ba5e7ddbf.tool
A lib/nodes/macro.5b6b742b-7415-4dc6-949a-16b8ceace422.tool
A lib/nodes/mastermind.e90c98ed-5e50-4dfe-a4ac-72d909907c91.tool
A lib/nodes/meta_query.c5979fbd-d59d-4912-b29f-44db872865ef.tool
A lib/nodes/module_builder.49f65891-0cc3-4059-a652-8f5df8facc21.tool
A lib/nodes/move_data.c8fbc95c-9d2c-4954-a013-7ef9e4a8d3d7.tool
A lib/nodes/ncp_status.fc2072b5-7db8-4456-8518-a3e5a1c58163.tool
A lib/nodes/nexus_capability.0cc06975-331d-443c-b3a8-ecc30c87a9e8.tool
A lib/nodes/nexus_heal.c89bf97b-0ac7-42e3-b801-0afeba610860.tool
A lib/nodes/nexus_help.847ab664-afb5-4bdd-8b0f-7bd7834b4cce.tool
A lib/nodes/nexus_intelligence.937503f8-1b52-48d8-b3a3-3947d8170a97.tool
A lib/nodes/nexus_map.9062aa68-4445-46e8-8607-8a5762b1a1c6.tool
A lib/nodes/nexus_status.f9cd7e47-95e2-4b7d-8662-fe7b4ed67a86.tool
A lib/nodes/nexus_wake_events.6aaa468b-a5f7-4d3b-a1c8-ff2c09cd898e.tool
A lib/nodes/notes_todo.9a7a5e7f-224e-4d5d-bf1b-3142d7529b0d.tool
A lib/nodes/ollama_generate.e3a676fe-2e6c-4822-b10d-910dbc91fa53.tool
A lib/nodes/parallel_dispatch.79dacc43-cb68-440d-96a2-2431537ca249.tool
A lib/nodes/parse_lenses.6d693d9f-2753-49e1-88e7-9f8984a3ead2.tool
A lib/nodes/perplexity.1ed36776-1c1d-469e-bb63-a2b39152675d.toolbox
A lib/nodes/propose_idea.d9e7a1fe-1b67-44f4-a4d7-1f4fc76a49ff.tool
A lib/nodes/query_movement.a69e44a3-188c-4e20-88d0-97d28722e1f8.tool
A lib/nodes/query_recall.d4a325c2-f997-4efb-a109-4a10286e16ec.tool
A lib/nodes/raid_snr.c734f143-93ad-456a-82bd-ab91e32ec3d9.tool
A lib/nodes/read_file.57874fd4-6fad-4f18-b147-49fe8495a794.tool
A lib/nodes/register_trigger.f2e67d01-9b66-4941-9c92-e49618cd93cd.tool
A lib/nodes/resource_monitor.dcd5cc01-6e34-43d4-8928-9585892372ae.tool
A lib/nodes/rewind_replay.e6500af5-30b3-4647-9e6a-063cac97378b.tool
A lib/nodes/roundtable.0ffa5de8-60b9-4cb3-a162-7f864424b6e3.tool
A lib/nodes/run_adversarial.fbb79a0c-e775-42b0-85fa-76e85c1de525.tool
A lib/nodes/run_chain.5587cea7-49da-42de-bb0c-e75493b74793.tool
A lib/nodes/run_closed_loop.cd08d3f6-f730-4a11-83f0-7063c7acd960.tool
A lib/nodes/run_command.f40975b2-266a-4b68-94e0-28e10c10517e.tool
A lib/nodes/run_pipeline.c880bbe4-040e-4e3b-98f1-9dc9dd93c51b.tool
A lib/nodes/safe_apply.009ce9d6-f337-4611-85a2-dac0bd5dc5cd.tool
A lib/nodes/schedule_task.4ad551e9-92cb-4d2f-a1e8-acf5589d1d17.tool
A lib/nodes/search_files.a995d9b4-ae20-4e47-8639-3793db8f239b.tool
A lib/nodes/self_repair.6557b00d-f7b4-459e-8668-2dbfabfbf7de.tool
A lib/nodes/spec_wizard.a50028c1-f073-4624-94da-79bdc902310c.tool
A lib/nodes/switch_agent.b55d5e82-b046-43d1-ad1b-db66e7c0137c.tool
A lib/nodes/synthesize.b71130b9-547a-456b-b005-80aaa6e2e86f.tool
A lib/nodes/system_priority.60241d5e-9e57-410d-b046-11e9de79b412.tool
A lib/nodes/tool_config.3097c22f-2921-454d-857b-83d0adc11705.tool
A lib/nodes/ui_nerve.11a82ff4-ec6f-4d9e-9ea1-805a91a6c080.tool
A lib/nodes/ui_spotlight.d43a27ed-0a17-4f48-a5bf-4b63f88c416b.tool
A lib/nodes/versionium_commit.98a00231-9c04-4d7f-b63a-d62dc52e8725.tool
A lib/nodes/versionium_history.bea686c8-3d84-4bb2-9741-f1810945a9a9.tool
A lib/nodes/versionium_restore.d5ea540d-95ab-4a1a-b35c-1417d538483e.tool
M lib/version.js
M package.json
A tests/modules/brainos-panel-wiring.test.js
A tests/modules/clear-glass-plugin-routes.test.js
A tests/modules/idearium-chunk-dependencies.test.js
M tests/modules/run-all.js
A tests/modules/tool-call-listener.test.js
M ui/brainos/brainos-app.js
M ui/brainos/index.html
```

### Build 0.39.73-r2 — snap-0529 — 2026-09-08 14:13:16

- Archive: `nexus-0529_2026-09-08_v0.39.73-r2_menu-backend-fix-1.zip` (was `nexus-menu-backend-fix-1.zip`)
- SHA-256: `07681e64b72c53553807ca74a3cc9b639458615952d88dc23e4098e8321f1b76`, 0.1 MB, downloaded 2026-09-10 23:52:04
- Kind: overlay (a patch laid over the build before it)
- Commit: `ade4ebdcc2752a3389006c4b4a37a20fb7c76054`, tag `snap-0529`
- Files in archive: 2. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M copilot/server.js
M ui/tv-shell/menu.js
```

### empty — 0530 — 2026-09-10 17:34:40

- Archive: `nexus-0530_2026-09-10_v0.39.73_menu-backend-fix_empty.zip` (was `nexus-menu-backend-fix.zip`)
- SHA-256: `2eecb75f72e082db8430b6b1e8751492ec3130a38f19c6747d4d9fa4c7de3903`, 0 MB, downloaded 2026-09-10 17:34:40
- Kind: empty (no commit)

