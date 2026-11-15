# Nexus 0.39.138

| | |
|---|---|
| Built | 2026-09-15 05:28:18 → 2026-09-15 10:40:44 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.138 |
| Tag | `v0.39.138` → snap-0582 |
| Full file ledger | [LEDGER-0.39.138.csv](../ledger/LEDGER-0.39.138.csv) |

## Ledger

### Build 0.39.138-r1 — snap-0581 — 2026-09-15 05:28:18

- Archive: `nexus-0581_2026-09-15_v0.39.138-r1_idearium-wired-1-1.zip` (was `nexus-v0_39_138-idearium-wired-1-1.zip`)
- SHA-256: `c62c0ce1bd7c3409fffe164af54e6b887f240b9a39a05856d2d0bea303c961a1`, 60 MB, downloaded 2026-09-15 05:28:43
- Kind: full
- Commit: `e36cf2650b06b0959009aa0505887ffd13d59ba6`, tag `snap-0581`
- Identical copy: `nexus-0581_2026-09-15_v0.39.138-r1_idearium-wired-1-2_dup1.zip` (was `nexus-v0_39_138-idearium-wired-1-2.zip`)
- Left out: embedded .git (6512 files, HEAD c0910326aca66c61c42fc443d0f9376d80009aa1 (master))
- Files in archive: 3595. Changes against the build before it: **22 added, 113 modified, 650 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 0 | 0 | 512 |
| guardian | 3 | 65 | 15 |
| cortex | 12 | 3 | 31 |
| copilot | 1 | 3 | 30 |
| data | 1 | 11 | 15 |
| tests | 1 | 2 | 18 |
| idearium | 0 | 4 | 12 |
| lib | 0 | 5 | 10 |
| docs | 2 | 5 | 1 |
| clear-glass | 1 | 5 | 2 |
| loom | 0 | 2 | 4 |
| (root) | 0 | 2 | 0 |
| contracts | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| orchestrator | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
M NODE-TAXONOMY.md
M architect/interaction-contract.json
A clear-glass/input/.gitkeep
D clear-glass/lib/dom-nodes.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/dom/archaeology.js
M clear-glass/src/gates/index.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
M contracts/nexus-interaction-contract.js
D copilot/commands/get-api-axioms.command
D copilot/commands/get-api-diagnose-list.command
D copilot/commands/get-api-lifeline-health.command
D copilot/commands/get-api-sessions.command
D copilot/commands/get-api-stream.command
D copilot/commands/get-api-tools.command
D copilot/commands/post-api-axioms-add.command
D copilot/commands/post-api-axioms-remove.command
D copilot/commands/post-api-build.command
D copilot/commands/post-api-channel.command
D copilot/commands/post-api-diagnose.command
D copilot/commands/post-api-event.command
D copilot/commands/post-api-observe.command
D copilot/commands/post-api-prompt-fulfill.command
D copilot/commands/post-api-prompt-stream.command
D copilot/commands/post-api-prompt-tools.command
D copilot/commands/post-api-prompt.command
D copilot/commands/post-api-stream-ingest.command
D copilot/commands/post-bridge-deliver.command
A copilot/interaction-contract.json
D copilot/lib/command-index-extract.js
M copilot/registry-components.js
M copilot/server.js
M copilot/tool-runtime.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
M cortex/interaction-contract.json
M docs/2026-09-13-axiom-5-2-raid-routing-phasemap.spec
A docs/2026-09-13-track-b-sovereignty-phasemap.spec
D docs/2026-09-14-idearium-enterprise-repo-phasemap.spec
A docs/IDEARIUM-PHASE-MAP-v2.md
M docs/SPEC-REGISTRY.spec
M docs/specs/CORTEX.spec.md
M docs/specs/GUARDIAN.spec.md
M docs/specs/IDEARIUM.spec.md
M guardian/commands/get-alk-last.command
M guardian/commands/get-api-guardian-cfr-state.command
M guardian/commands/get-api-guardian-hooks-summary.command
M guardian/commands/get-api-guardian-nerve-snapshot.command
M guardian/commands/get-api-guardian-organism-queue.command
M guardian/commands/get-api-intake.command
D guardian/commands/get-api-responses.command
M guardian/commands/get-api-tools.command
M guardian/commands/get-artifacts.command
M guardian/commands/get-baseline.command
M guardian/commands/get-bus.command
M guardian/commands/get-channel.command
D guardian/commands/get-cockpit-.command
M guardian/commands/get-cockpit.command
M guardian/commands/get-commands.command
M guardian/commands/get-contract.command
M guardian/commands/get-events.command
M guardian/commands/get-gaps-summary.command
M guardian/commands/get-gaps.command
M guardian/commands/get-health.command
D guardian/commands/get-jobs-.command
M guardian/commands/get-jobs.command
D guardian/commands/get-ncp-clients.command
M guardian/commands/get-providers.command
M guardian/commands/get-queue-compartments.command
M guardian/commands/get-queue.command
M guardian/commands/get-root.command
M guardian/commands/get-seam-queues.command
M guardian/commands/get-seam-sessions.command
M guardian/commands/get-seam-status-cross-system.command
M guardian/commands/get-seam-watchdog-status.command
M guardian/commands/get-sessions.command
M guardian/commands/get-version.command
M guardian/commands/post-api-account-identity.command
M guardian/commands/post-api-copilot-prompt.command
M guardian/commands/post-api-guardian-cfr-event.command
M guardian/commands/post-api-intake-promote.command
M guardian/commands/post-api-intake-rollback.command
M guardian/commands/post-api-intake-verdict.command
M guardian/commands/post-api-intake.command
M guardian/commands/post-build.command
M guardian/commands/post-bus-emit.command
M guardian/commands/post-chatgpt-mode-query.command
M guardian/commands/post-cli-exec.command
M guardian/commands/post-command-tools.command
M guardian/commands/post-command.command
D guardian/commands/post-dom-event.command
M guardian/commands/post-heartbeat.command
M guardian/commands/post-queue-compartments.command
M guardian/commands/post-queue-enqueue.command
M guardian/commands/post-result.command
M guardian/commands/post-seam-retry.command
M guardian/commands/post-seam-sessions.command
M guardian/commands/post-wake-job-ack.command
M guardian/event-taxonomy.js
A guardian/input/43e3c367-7f24-4814-8267-6eca61180111.contract
A guardian/input/757a7719-723f-4916-b54b-95c912e2b747.contract
A guardian/input/cd1262af-279a-4e29-bad9-e079e602a103.contract
M guardian/jaa-store.js
M guardian/lib/dispatcher.js
M guardian/lib/jobs.js
D guardian/lib/ncp-dispatch-target.js
M guardian/lib/ncp-handler.js
M guardian/lib/ncp.js
M guardian/lib/node-registry.js
D guardian/lib/response-nodes.js
D guardian/lib/response-watchdog.js
M guardian/routes/autonomous-loop.js
D guardian/schemas/schema.response
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/index.js
M idearium/interaction-contract.json
M idearium/repo/index.js
M idearium/spec/idearium.spec
M lib/autonomous-loop.js
D lib/clearglass-dispatch.js
M lib/compartment-engine.js
D lib/generate-command-nodes.js
M lib/node-export.js
D lib/node-schemas/schema.compartment
D lib/node-schemas/schema.database
D lib/node-schemas/schema.dom
D lib/node-schemas/schema.handoff
D lib/node-schemas/schema.manifest
D lib/node-schemas/schema.response
D lib/node-schemas/schema.worksurface
M lib/project-compartment.js
D lib/repo-manifest.js
M lib/version.js
M loom/contracts/index.js
M loom/test/contracts.test.js
M nexus/autopilot.js
M ollama/registry-components.js
A orchestrator/interaction-contract.json
M package.json
D tests/dispatcher-ncp-fanout.test.js
M tests/modules/compartment-engine.test.js
D tests/modules/mco16-clearglass-dispatch.test.js
D tests/modules/mco16-raid-submit-route.test.js
D tests/modules/mco16d-copilot-tool-parity.test.js
```

635 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.138-r2 — snap-0582 — 2026-09-15 10:40:44

- Archive: `nexus-0582_2026-09-15_v0.39.138-r2_idearium-wired-fixed.zip` (was `nexus-v0_39_138-idearium-wired-fixed.zip`)
- SHA-256: `5e435e8961ba5d7185c5bf47cbc8cd064fa2dea05e01a33ac268bb183d99a4d0`, 9.8 MB, downloaded 2026-09-15 10:43:25
- Kind: full
- Commit: `8dbcfa75cc8c9adf247c252689bf34794a0ebf62`, tag `snap-0582`
- Files in archive: 3480. Changes against the build before it: **6 added, 8 modified, 121 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 1 | 113 |
| lib | 0 | 1 | 8 |
| cortex | 4 | 1 | 0 |
| tests | 1 | 3 | 0 |
| guardian | 0 | 2 | 0 |

```
M cortex/core/raid/contract-intake.js
A cortex/data/snapshots/3493f758-e78b-4809-905d-2a85c5d7fd49.nex
A cortex/data/snapshots/41164acf-8000-4989-9292-448be468ffdd.nex
A cortex/data/snapshots/5457b54b-9c6d-4f3b-9a72-5c90e12656f4.nex
A cortex/data/snapshots/d7e29295-8ad5-468b-9479-8db95302e970.nex
A data/alk/decisions.jsonl
D data/cortex/memory/tool_index.json
D data/nodes/agent_capability.84652651-e68d-457b-9bb9-0d185a8c3cd0.tool
D data/nodes/agent_chat.0a0d44ae-eb0a-4ceb-b631-3b71b27ee522.tool
D data/nodes/agent_chat_search.23bc3c67-2c52-42e0-99ab-e073f5485de3.tool
D data/nodes/agent_council.3a0e3259-4615-4c39-abbc-5c0685d5cf7f.tool
D data/nodes/agent_mesh_route.f56d19ad-24b1-40ab-82ea-e35ad4fbf0cd.tool
D data/nodes/agent_notes.12a5f1d1-9193-450f-be5e-164d0d747a63.tool
D data/nodes/ambiguity_pull.98d121f7-135f-4dbd-8f59-abbaf3579424.tool
D data/nodes/analyze.3334c8bc-eef4-481a-8eb4-d9dfbaa1e2da.tool
D data/nodes/ask_james.68512a5f-40d2-4f36-bf4f-081275325677.tool
D data/nodes/axiom_check.55dab21b-2e64-4573-ae9c-45a9c7c48317.tool
D data/nodes/axiom_manage.88774d03-67eb-4a2d-ba59-43c8d7937ff6.tool
D data/nodes/browser_action.d77412a6-e54b-4bcd-a297-353910aa8032.tool
D data/nodes/call_system.39b6d653-b592-4a6b-8518-0dc1abe6dc88.tool
D data/nodes/chatgpt.5f129512-4d48-44da-8aa9-0f326d7d956a.toolbox
D data/nodes/claude.a4e769e4-c476-404c-a0bf-cb13b2f54fc7.toolbox
D data/nodes/clear_glass_command_index.4cbfce4d-e3fd-40e5-9187-5c6836a3fd15.tool
D data/nodes/clear_glass_dom_archaeology.37c00d52-496d-4c7f-a193-11628b1af0ba.tool
D data/nodes/clear_glass_dom_mutate.791ac8b0-957e-4ce7-b577-9a156437439b.tool
D data/nodes/clear_glass_provider_deploy.6e643d9a-eb8b-4a7d-b1b0-3841bdf32be1.tool
D data/nodes/clear_glass_tab_visibility.2bcd125c-af0e-469c-87f5-0da3b7d7b2d7.tool
D data/nodes/clear_glass_userscripts.cde91a25-5c41-42c0-8400-71e0cf5025f7.tool
D data/nodes/compiler_info.584137ff-990d-443f-b0d4-1c3eaa081e37.tool
D data/nodes/copilot_identity.13d8e2a9-4fe6-4676-83bd-c245bb04598b.tool
D data/nodes/cortex.node_tag.tool.e15c5d9a-4b6f-4fad-9e96-9da1e8209614.tool
D data/nodes/cortex.restep.tool.98d9a8c1-d0f5-45b4-b3e8-7453c8bcac2e.tool
D data/nodes/cos_archetype.a128b9ce-d5b3-4323-9669-ef2e55626fee.tool
D data/nodes/cos_blueprint.31c35669-0da8-42f4-8381-9f299e80b424.tool
D data/nodes/cos_compartment.36ba9ebc-046a-447b-af00-f32b03afdd3b.tool
D data/nodes/cos_playground.d4b0156c-b113-4da3-bef2-fe858a10b503.tool
D data/nodes/cos_plugin.b7430c2c-e9c6-4b96-97bc-a277a11ef005.tool
D data/nodes/cos_simulate.2d863f04-904a-49cb-b1b0-27582348f22a.tool
D data/nodes/cos_vault.264743c0-31ba-4743-bee6-54a29ca73c1e.tool
D data/nodes/delete_file.54cd4d26-5955-495c-8ce2-eb6bca484fa8.tool
D data/nodes/diagnose.92ed5e18-4e1c-4217-a22a-5ba9362881f4.tool
D data/nodes/emergence.a0a703f8-4cb3-4a1b-af78-55e90dffc5d5.tool
D data/nodes/fault_log.c721ab61-8bdc-4780-8ce8-a69745da2621.tool
D data/nodes/file_tree.c790f99a-06bf-4b13-9461-e69e628aef31.tool
D data/nodes/forge_tool.eac35b25-1dac-42e5-94be-4981fbf03b40.tool
D data/nodes/framework_builder.d1acf29a-7e33-4ac7-88ed-eac204f85440.tool
D data/nodes/gemini.49fe52eb-09f3-476e-97aa-4cfb8ef62f91.toolbox
D data/nodes/guardian.build.tool.95bc4981-8433-4f2d-8d69-f05be24ee0c1.tool
D data/nodes/guardian_dispatch.30a37a74-2ff0-480d-82cc-84056db9b7fd.tool
D data/nodes/hat_forge.110af428-b2c1-467e-85f0-680e56e10fc7.tool
D data/nodes/intelligence_query.730a50d3-856f-4964-9c9d-c5fb52c1b1ef.tool
D data/nodes/intent_hat.405bb10c-c5d3-4c97-8953-12ca88c18031.tool
D data/nodes/intuition.af55f2d2-b838-4d2b-b4ec-700ec3a16ba0.tool
D data/nodes/loom_register.6b945425-1cd3-4c41-8b4e-39ba40970c9d.tool
D data/nodes/loom_scan.d471f569-16dc-4d9e-94a5-18c63b12b8d1.tool
D data/nodes/macro.3f6c2ac4-51b8-4935-971a-8f5b89a98501.tool
D data/nodes/mastermind.70bda4d3-1745-41f5-9132-2196bba60e44.tool
D data/nodes/meta_query.880ebb78-717c-4244-9dfc-1d996613b044.tool
D data/nodes/mock_data_finder.4a863a7f-81bc-4e7c-a6f6-3e043db3e2b7.tool
D data/nodes/module_builder.1474919e-695d-47ce-a86c-740e89267e19.tool
D data/nodes/move_data.7f541e33-89ed-4a16-bfb0-6bbb578874ff.tool
D data/nodes/ncp_clients.26ee3807-6905-4bf4-b35c-a6076c899740.tool
D data/nodes/ncp_status.d1721b44-5eae-4fbd-8c24-0fd3ded44764.tool
D data/nodes/nexus.syntax_debug.tool.662da192-31f5-4ba4-8b38-fa3311e835ad.tool
D data/nodes/nexus_capability.bd97dd84-8af2-4e5f-a765-37990d402356.tool
D data/nodes/nexus_heal.7f467d09-8cc1-4463-accd-fc269b7acbb4.tool
D data/nodes/nexus_help.f44bf9b3-5100-49e7-a24d-d9b6f619f53c.tool
D data/nodes/nexus_intelligence.ad21c543-c646-4dc0-a57f-7a84dcd9b739.tool
D data/nodes/nexus_map.ecbd4060-e4f7-480d-882d-1f4e98790fbb.tool
D data/nodes/nexus_status.b3fb61db-5495-4bda-9f13-398e89cefabb.tool
D data/nodes/nexus_wake_events.197d1c2c-04c4-499e-a227-90ec1aabe9bf.tool
D data/nodes/notes_todo.832deac7-8ed1-450b-b3e8-72e399235071.tool
D data/nodes/ollama_generate.df37aa92-5367-4ee3-9c44-f7d0cbc3c78b.tool
D data/nodes/parallel_dispatch.17def6aa-10c8-4997-9f19-f4aa756d9315.tool
D data/nodes/parse_lenses.06106204-8778-44c7-9490-ecdd0e458675.tool
D data/nodes/perplexity.529b6ece-5042-42fa-a076-f197bab43450.toolbox
D data/nodes/propose_idea.846c15a8-8eeb-4a93-82a1-0536ef98773d.tool
D data/nodes/query_movement.dca5f3bf-a092-41cb-a051-a642e8f4483f.tool
D data/nodes/query_recall.9a57f59b-e45a-48e7-82d1-ea29d6cca594.tool
D data/nodes/raid_snr.eab16190-e722-4e0c-a971-3f2cb9514dfd.tool
D data/nodes/raid_submit_contract.0286ceb4-17ea-42db-88c7-c1b792a92951.tool
D data/nodes/read_file.99086a8c-9911-49d6-9c41-846c45ef9340.tool
D data/nodes/register_trigger.485509ec-9f37-45f1-a1dd-04d1debb7818.tool
D data/nodes/resource_monitor.6f612742-aad6-4ee1-9395-0c128f5a2924.tool
D data/nodes/rewind_replay.8c3e0b2c-632d-4202-b436-ae91e2fe8567.tool
D data/nodes/roundtable.10fc2f80-09d7-4c22-b7e6-6d7a44aa17ec.tool
D data/nodes/run_adversarial.886d5079-cc1d-41db-8c68-074208956687.tool
D data/nodes/run_chain.0d22e739-d7f6-4e68-9b90-85fed03723c0.tool
D data/nodes/run_closed_loop.0370909d-1462-4c79-b299-026009c3d254.tool
D data/nodes/run_command.aae5b126-f7cc-49aa-b721-b70b3c517113.tool
D data/nodes/run_pipeline.625f73ad-cf56-410e-8210-e69d4554afbc.tool
D data/nodes/safe_apply.02a39f5d-64f9-4590-a7e4-a047659f0955.tool
D data/nodes/schedule_task.965d0dc2-3c23-4c07-904f-462ad11de4bd.tool
D data/nodes/search_files.f3f3b1d3-40ec-4b6c-88ec-284e94512016.tool
D data/nodes/self_repair.59fec00f-a71b-4e7f-9516-f5dc8a999825.tool
D data/nodes/spec_wizard.896bf1f3-f947-4363-8538-1652bec0b98c.tool
D data/nodes/stub_finder.c6858722-10c5-4a4d-a48a-938e7692ff95.tool
D data/nodes/switch_agent.0ad5ef2c-b4b7-45c0-a47d-cceaa2c45a88.tool
D data/nodes/synthesize.bf4dfd62-dd87-46cc-951f-fbf354269ff8.tool
D data/nodes/system_priority.a4c883ec-13b4-4bce-b2c0-9cea16953cec.tool
D data/nodes/tool_config.b3791aec-b3ca-46f2-a9f9-3956fb624181.tool
D data/nodes/ui_nerve.5d20219e-caa7-44bb-bee5-a195b1bd0e0f.tool
D data/nodes/ui_spotlight.a3ac548f-4da1-4694-90af-67d522d0e609.tool
D data/nodes/versionium.history.tool.e6d5a238-5f7c-4eab-841e-37c7619e2841.tool
D data/nodes/versionium.snapshot.tool.bfd94a58-31fa-4374-a3f3-2889a0723c6d.tool
D data/nodes/versionium_commit.735d8dc2-8066-4277-906d-b5c795d74144.tool
D data/nodes/versionium_history.e3bb5b59-075e-4431-9b20-7d230694a485.tool
D data/nodes/versionium_restore.1f7ade2c-685a-4289-b678-17093e692f2d.tool
D data/nodes/worksurface/0eee9900-a0bc-4174-b0e3-4efa2e9f9985.worksurface
D data/nodes/worksurface/27eb532c-05fd-4806-904a-5058ea05ec5f.worksurface
D data/nodes/worksurface/28adbcb3-5142-4a57-ae21-2c7cffb03770.worksurface
D data/nodes/worksurface/3af837a1-b199-498f-a5a7-26a9d0f29b20.worksurface
D data/nodes/worksurface/3f40c83c-843c-4039-8b40-98f39757a870.worksurface
D data/nodes/worksurface/498766ba-2d96-4e49-9c4f-ea499f081959.worksurface
D data/nodes/worksurface/85208270-6c2c-465f-8439-2b91bd6e8f43.worksurface
D data/nodes/worksurface/85b97b66-caa0-45ec-b221-d9338d1a08a4.worksurface
D data/nodes/worksurface/9edf95a8-3bfd-4505-ad13-ab2d5fef1a34.worksurface
D data/nodes/worksurface/ad6df6ee-1c9f-4b2c-bc25-b8a19f57beff.worksurface
D data/nodes/worksurface/e693a40b-1df1-4b5d-8f99-eb181cb25339.worksurface
M data/raid/ledger/cfr/event_log.jsonl
M guardian/lib/dispatcher.js
M guardian/lib/ncp.js
M lib/agent-tools/index.js
D lib/agent-tools/tools/clear-glass/dom-mutate.js
D lib/agent-tools/tools/ncp/clients.js
D lib/agent-tools/tools/query/query-nodes.js
D lib/agent-tools/tools/raid/submit-contract.js
D lib/agent-tools/tools/work-surface/create.js
D lib/agent-tools/tools/work-surface/get-chunk.js
D lib/system-db.js
D lib/work-surface.js
M tests/dispatcher-ping-gate.test.js
M tests/dispatcher-stale-socket.test.js
M tests/modules/test-dispatcher-deepseek-ncp.js
A tests/ncp-dual-live-flap.test.js
```

