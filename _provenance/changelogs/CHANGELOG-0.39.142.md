# Nexus 0.39.142

| | |
|---|---|
| Built | 2026-09-15 22:48:08 → 2026-09-16 16:04:54 |
| Builds on the main line | 8 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.138, 0.39.141, 0.39.142, 1.0.0 |
| Tag | `v0.39.142` → snap-0598 |
| Full file ledger | [LEDGER-0.39.142.csv](../ledger/LEDGER-0.39.142.csv) |

## Ledger

### Build 0.39.142-r1 — snap-0590 — 2026-09-15 22:48:08

- Archive: `nexus-0590_2026-09-15_v0.39.142-r1_named-0.39.142-1.zip` (was `Nexus_0_39_142-1.zip`)
- SHA-256: `4c69aa3db631b3d92547e279776ce4648e7084f89e559e7aeee1cd27a4c63706`, 113.4 MB, downloaded 2026-09-15 22:50:20
- Kind: full
- Commit: `85aae5727ab39b85a6974ff978e5e6ad9c25ed63`, tag `snap-0590`
- Left out: embedded .git (7747 files, HEAD 45f0a115c34389d2563df5f5d3a43c9c21a7a94d (master))
- Left out: node_modules (278 files)
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6903. Changes against the build before it: **2527 added, 31 modified, 36 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 1662 | 13 | 0 |
| data | 757 | 0 | 0 |
| cortex | 85 | 0 | 0 |
| ui | 2 | 1 | 18 |
| cg | 0 | 0 | 10 |
| docs | 7 | 2 | 0 |
| guardian | 1 | 2 | 5 |
| lib | 3 | 4 | 0 |
| copilot | 7 | 0 | 0 |
| versionium | 2 | 2 | 0 |
| (root) | 0 | 2 | 1 |
| tablet | 0 | 1 | 1 |
| tests | 1 | 1 | 0 |
| architect | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| emerge | 0 | 0 | 1 |

```
D Cortex.zip
M NODE-TAXONOMY.md
M blueprint-index.json
M clear-glass/src/ipc/bridge.js
A cortex/boot.js
A cortex/config.js
A cortex/contract/index.js
A cortex/core/raid/context-gate.js
A cortex/core/raid/context-synthesis.js
A cortex/core/raid/contract-boundary.js
A cortex/core/raid/contract-intake.js
A cortex/core/raid/envelope.js
A cortex/core/raid/event-taxonomy.js
A cortex/core/raid/index.js
A cortex/core/raid/officiator.js
A cortex/core/raid/router.js
A cortex/core/raid/routing-ir.js
A cortex/core/raid/snr-filter.js
A cortex/core/raid/tunables.js
A cortex/core/raid/worker.js
A cortex/cortex-v2.js
A cortex/gap-finder/index.js
A cortex/input/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A cortex/interaction-contract.json
A cortex/memory/bep-lookup.js
A cortex/memory/causal-lookup.js
A cortex/memory/decay.js
A cortex/memory/fix-map.js
A cortex/memory/jaa-db.js
A cortex/memory/relevance.js
A cortex/memory/table-compactor.js
A cortex/memory/table-deduplicator.js
A cortex/memory/tiers.js
A cortex/orion/index.js
A cortex/output/.gitkeep
A cortex/output/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A cortex/personas.js
A cortex/push-recall.js
A cortex/registry-components.js
A cortex/schemas/index.js
A cortex/schemas/schema.account_identity_index_entry
A cortex/schemas/schema.bep_pattern
A cortex/schemas/schema.capability
A cortex/schemas/schema.chat_log
A cortex/schemas/schema.component
A cortex/schemas/schema.component_projection
A cortex/schemas/schema.constitution_decision
A cortex/schemas/schema.contract
A cortex/schemas/schema.debug_macro
A cortex/schemas/schema.event
A cortex/schemas/schema.failure_mode
A cortex/schemas/schema.fault
A cortex/schemas/schema.gap
A cortex/schemas/schema.hook
A cortex/schemas/schema.hook_contract
A cortex/schemas/schema.idea
A cortex/schemas/schema.interstitial_space
A cortex/schemas/schema.ledger
A cortex/schemas/schema.node
A cortex/schemas/schema.raid_contract
A cortex/schemas/schema.resonance_crystal
A cortex/schemas/schema.sigma_record
A cortex/schemas/schema.synthesis
A cortex/schemas/schema.system
A cortex/schemas/schema.tool_index_entry
A cortex/schemas/schema.wire
A cortex/self-heal/escalation.js
A cortex/self-heal/failure-mode-forensics.js
A cortex/self-heal/fault-taxonomy.js
A cortex/self-heal/index.js
A cortex/snapshot/index.js
A cortex/spec/cortex.node-taxonomy.md
A cortex/spec/cortex.spec
A cortex/tools/materialize-cli.js
A cortex/tools/table-materializer.js
A cortex/versionium/causality.js
A cortex/versionium/index.js
A docs/2026-09-15-session-handoff.md
A docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md
A docs/2026-09-15-versionium-migration-and-mco-a-handoff.md
M docs/CHANGELOG.md
M docs/SPEC-REGISTRY.spec
A docs/idearium-creative-repo-overhaul-phasemap.md
A docs/idearium-creative-repo-overhaul-phasemap.spec
A docs/idearium-creative-repo.spec
A docs/nexus-repository-system-build-phasemap.spec
D emerge/ui/index.html
M guardian/lib/node-registry.js
A guardian/lib/response-sink.js
M guardian/server.js
D guardian/ui/agents/chatgpt/index.html
D guardian/ui/agents/claude/index.html
D guardian/ui/agents/gemini/index.html
D guardian/ui/agents/mistral/index.html
D guardian/ui/agents/perplexity/index.html
M idearium/api/index.js
M idearium/config.js
A idearium/idearium.config.json
A idearium/lib/chunk-nodes.js
A idearium/lib/config-core.cjs
M idearium/lib/config.js
M idearium/repo/index.js
A idearium/repo/repos/nexus-id-repo-3eed3fb0/00-n139-warp-spec-warp-spec.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/01-n139-warp-test-v1-4-additions-test-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/02-n139-warp-test-dispatch-test-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/03-n139-warp-test-digest-regression-test-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/04-n139-warp-test-core-test-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/05-n139-warp-test-v1-1-0-additions-test-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/06-n139-warp-dispatch-digest-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/07-n139-warp-dispatch-deltacache-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/08-n139-warp-dispatch-cascade-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/09-n139-warp-dispatch-canonicalize-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/10-n139-warp-dispatch-index-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/100-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-457-nexus-loom-scanners-wiring-gaps-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/101-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-432-nexus-orchestrator-lib-ui-registry-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/102-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-208-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-02-axioms-e02ae0fc-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/103-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-75-nexus-idearium-ui-js-app-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/104-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-15-nexus-warp-core-stream-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/105-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-55-nexus-cortex-core-raid-officiator-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/106-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-483-nexus-loom-data-node-index-nodes-capability-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/107-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-422-nexus-orchestrator-lib-sigma-compaction-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/108-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-269-nexus-idearium-data-specs-b91469e2-e515-4e69-9d0c-7913d883ae3b-02-axioms-0be767eb-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/109-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-129-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-spec-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/11-n139-warp-dispatch-benchmark-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/110-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-409-nexus-skills-nexus-session-changelog-skill-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/111-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-343-nexus-guardian-memory-store-chat-log-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/112-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-365-nexus-guardian-event-taxonomy-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/113-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-306-nexus-idearium-data-specs-62e3aea3-dfe5-44d5-b1d8-3b685ec0f162-manifest-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/114-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-316-nexus-idearium-data-specs-686d8642-3f00-4754-b1c1-3fa8442980be-03-schema-fe61bea3-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/115-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-119-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-02-axioms-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/116-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-424-nexus-orchestrator-lib-mcp-tools-tokensave-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/117-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-102-nexus-idearium-test-e2e-pipeline-test-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/118-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-336-nexus-guardian-jaa-store-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/119-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-361-nexus-guardian-userscript-memory-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/12-n139-warp-dispatch-pregen-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/120-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-482-nexus-loom-data-node-index-settings-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/121-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-375-nexus-guardian-data-node-index-nodes-intent-ledger-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/122-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-297-nexus-idearium-data-specs-51e26753-c339-404f-9e69-399a09faef36-manifest-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/123-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-25-nexus-tablet-homepage-html-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/124-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-484-nexus-loom-data-node-index-nodes-command-json-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/125-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-493-nexus-loom-maps-observability-map-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/126-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-425-nexus-orchestrator-lib-contract-handshake-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/127-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-176-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-spec-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/128-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-70-nexus-cortex-memory-table-deduplicator-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/129-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-54-nexus-cortex-core-raid-snr-filter-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/13-n139-warp-dispatch-population-js.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/130-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-355-nexus-guardian-spec-guardian-node-taxonomy-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/131-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-160-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-02-brainos-main-changelog-md-5c4b7c3c-md-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/132-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-335-nexus-guardian-api-dispatch-js-md.md
A idearium/repo/repos/nexus-id-repo-3eed3fb0/133-n139-idearium-repo-repos-nexus-id-repo-0672ffb3-112-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-01-purpose-md-md.md
```

2444 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.142-r2 — snap-0591 — 2026-09-16 00:30:56

- Archive: `nexus-0591_2026-09-16_v0.39.142-r2_named-0.39.142-fixed.zip` (was `Nexus_0_39_142-fixed.zip`)
- SHA-256: `cb03fe32bc271357ba5e933505e6a97c08b02f1d007c9e9682d51d7bc8860b32`, 113.5 MB, downloaded 2026-09-16 01:03:10
- Kind: full
- Commit: `3cead3e39f4276f36b64460a65b77105f8dcead2`, tag `snap-0591`
- Left out: embedded .git (7757 files, HEAD 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master))
- Left out: node_modules (278 files)
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6903. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 2 | 0 |

```
M idearium/lib/chunk-nodes.js
M idearium/spec-engine/index.js
```

### artifact — 0592 — 2026-09-16 02:44:10

- Archive: `nexus-0592_2026-09-16_v0.39.142-side_bridge-substrate-bundle_declared-1.0.0.zip` (was `nexus-bridge-substrate-bundle.zip`)
- SHA-256: `d11fac2d2b373d2b6b3f0904ec881a6db5de79849a0cdffae4e1e3957d9d121f`, 0.4 MB, downloaded 2026-09-16 02:53:20
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 1.0.0 (registry 1.0.0, file name none); filed under 0.39.142 to keep the line in order
- Commit: `efd58e3c54747634f220eeba8511e3fa1752a941`, tag `snap-0592`
- Files in archive: 124. Changes against the build before it: **124 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle | 124 | 0 | 0 |

```
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/README.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/spec/clear-glass.node-taxonomy.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/spec/clear-glass.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/src/driver/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/src/driver/url-listener.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/src/gates/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/src/ipc/bridge.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/clear-glass/src/main/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/archetype/detector.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/archetype/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/archetype/registry.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/archetype/schema.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/blueprint/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/blueprint/registry.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/blueprint/schema.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/axioms.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/cli-detector.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/command-schema.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/compiler-enum.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/constants.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/enums.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/event-contracts.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/file-browser.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/fs-layer.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/hook-schema.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/runtime-enum.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/snapshot.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/foundation/types.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/manager.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/plugin/host-api.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/plugin/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/plugin/installer.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/plugin/registry.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/plugin/schema.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/spec/cos-design-v1.7.0.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/cos/spec/cos.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/docs/2026-08-23-backlog-phasemap.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/idearium.node-taxonomy.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/idearium.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/interaction-contract.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/nexus-repository-system.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/package.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/blocks.yaml
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/chunk-dispatch.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/guardian-extract.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/ai-agent-system.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/api-service.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/architecture.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/axioms.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/checklists.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/compartments.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/event-system.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/genesis.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/minimal-kernel.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/plugin-runtime.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/templates/schemas.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/idearium/spec-engine/warp-build-dispatch.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/README.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-electron/assets/icon.png
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-electron/assets/tray-icon.png
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-electron/main.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-electron/package.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-electron/preload.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/README.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-IME/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-IME/tests/test-ime-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-IME/tests/test-ime.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-contracts/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-contracts/tests/test-contracts-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-contracts/tests/test-contracts.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/bus.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/crypto-engine.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/registry/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/siso/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/tests/test-core-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-core/tests/test-core.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-data/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-data/tests/test-data-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-data/tests/test-data.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-heartbeat/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-heartbeat/tests/test-heartbeat-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-heartbeat/tests/test-heartbeat.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-identity/identity.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-identity/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-identity/keystore/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-identity/tests/test-identity-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-identity/tests/test-identity.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-node/boot.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-sngate/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-sngate/tests/test-sngate-deep.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/bridge-sngate/tests/test-sngate.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/index.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/bridge-os-core/package.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/contracts.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/host.html
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/input-auth.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/input-injector.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/package-lock.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/package.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/remote-desktop.spec
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/scripts/start-signal-background.bat
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/scripts/stop-signal-background.bat
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/session-token.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/signal.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/tests/test-input-auth.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/tests/test-input-injector.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/tests/test-input-pipeline.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/tests/test-session-token.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/tests/test-signal-integration.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/remote-desktop/viewer.html
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/README.md
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/client/drop-zone-listener.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/client/update-client.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/contract/contract-transport.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/contract/event-contract.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/contract/handshake-registry.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/package.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/schema/update-protocol.schema.json
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/server/update-service.js
A nexus-0592_2026-09-16_v1.0.0_bridge-substrate-bundle/update-system/transport/webrtc-transport.js
```

### Build 0.39.142-r3 — snap-0593 — 2026-09-16 07:39:02

- Archive: `nexus-0593_2026-09-16_v0.39.142-r3_named-0.39.142-specs-in-docs.zip` (was `Nexus_0_39_142-specs-in-docs.zip`)
- SHA-256: `1ff531b02e655c69eb43d125d6bb205615a4ae4481ae9e0d61dfd48b9b4476d8`, 113.5 MB, downloaded 2026-09-16 07:50:49
- Kind: full
- Commit: `783fa66025a25a5eab0c2a23b07d37e7a7ae09a3`, tag `snap-0593`
- Left out: embedded .git (7757 files, HEAD 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master))
- Left out: node_modules (278 files)
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6908. Changes against the build before it: **5 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 5 | 9 | 0 |

```
A docs/clear-glass.spec
M docs/copilot.spec
M docs/cortex.spec
M docs/cos.spec
M docs/emerge.spec
M docs/guardian.spec
M docs/idearium.spec
M docs/intelligence.spec
A docs/loom.spec
A docs/nexus-repository-system.spec
M docs/ollama.spec
M docs/orchestrator.spec
A docs/versionium.spec
A docs/warp.spec
```

### Build 0.39.142-r4 — snap-0594 — 2026-09-16 11:49:00

- Archive: `nexus-0594_2026-09-16_v0.39.142-r4_named-0.39.141-changes-3.zip` (was `nexus-0.39.141-changes-3.zip`)
- SHA-256: `81e27bf5e9218334c8f4d12ecf182e0d94dadfc5c817d4f7cc139c141c6eb38e`, 0.3 MB, downloaded 2026-09-16 11:52:48
- Kind: overlay (a patch laid over the build before it)
- Claimed version: 0.39.141 (registry 0.39.126, file name 0.39.141); filed under 0.39.142 to keep the line in order
- Commit: `d33193aee8786edc822df6a2efd2ab33ee597fbb`, tag `snap-0594`
- Files in archive: 14. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M idearium/api/index.js
M lib/project-container.js
```

### Build 0.39.142-r5 — snap-0595 — 2026-09-16 11:59:10

- Archive: `nexus-0595_2026-09-16_v0.39.142-r5_changes-batch2_declared-0.39.141.zip` (was `nexus-0.39.141-changes-batch2.zip`)
- SHA-256: `7cf9b455d39a5671317537db5d394abb48091f03f907bc76d3d4b60112217096`, 0.1 MB, downloaded 2026-09-16 13:05:11
- Kind: overlay (a patch laid over the build before it)
- Claimed version: 0.39.141 (registry none, file name 0.39.141); filed under 0.39.142 to keep the line in order
- Commit: `58fcb9186d24819553a3814691ac7f135fcca84e`, tag `snap-0595`
- Files in archive: 3. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M clear-glass/src/dom/archaeology.js
M clear-glass/src/providers/download-capture.js
M orchestrator/orchestrator.js
```

### Build 0.39.142-r6 — snap-0596 — 2026-09-16 14:50:22

- Archive: `nexus-0596_2026-09-16_v0.39.142-r6_wired_declared-0.39.138.zip` (was `nexus-wired.zip`)
- SHA-256: `0fc7c13841522e0f9bb3714580566d0b8e6e742a26975dd54a6b64690a74fbeb`, 100.1 MB, downloaded 2026-09-16 15:03:12
- Kind: full
- Claimed version: 0.39.138 (registry 0.39.138, file name none); filed under 0.39.142 to keep the line in order
- Commit: `406228bd3c0dd526769460dd0cc452bab0e788d0`, tag `snap-0596`
- Left out: embedded .git (7757 files, HEAD 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master))
- Files in archive: 6784. Changes against the build before it: **0 added, 2 modified, 122 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 0 | 83 |
| warp | 0 | 0 | 26 |
| (root) | 0 | 0 | 11 |
| tablet | 0 | 0 | 2 |
| clear-glass | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
D .gitignore
D .mcp.json
D NEXUS-NODE-TAXONOMY-SESSION-README-2026-09-12.md
D NODE-TAXONOMY.md
D README-PATCH.md
D blueprint-index.json
M clear-glass/src/ipc/bridge.js
D cortex/boot.js
D cortex/config.js
D cortex/contract/index.js
D cortex/core/raid/context-gate.js
D cortex/core/raid/context-synthesis.js
D cortex/core/raid/contract-boundary.js
D cortex/core/raid/contract-intake.js
D cortex/core/raid/envelope.js
D cortex/core/raid/event-taxonomy.js
D cortex/core/raid/index.js
D cortex/core/raid/officiator.js
D cortex/core/raid/router.js
D cortex/core/raid/routing-ir.js
D cortex/core/raid/snr-filter.js
D cortex/core/raid/tunables.js
D cortex/core/raid/worker.js
D cortex/cortex-v2.js
D cortex/data/baseline-events.ndjson
D cortex/data/invariant/baseline.json
D cortex/data/nodes/failure_mode/299b5d98-a9a7-4476-8828-bf016fa46361.failure_mode
D cortex/data/nodes/failure_mode/43fe903e-7646-4ae8-b4b9-5e9836d3023c.failure_mode
D cortex/data/nodes/failure_mode/49cf824e-f193-4a5b-9a1b-d39d22220eb2.failure_mode
D cortex/data/nodes/failure_mode/54de076a-a90c-416b-b26a-b6837a4dec92.failure_mode
D cortex/data/nodes/failure_mode/62a849ea-ea6c-43f8-8464-7afee2bb73aa.failure_mode
D cortex/data/nodes/failure_mode/7cbc5a39-a62c-45c4-a9e8-5348df3069be.failure_mode
D cortex/data/nodes/failure_mode/b452ebf9-0b4c-43c3-ab64-785298bc83aa.failure_mode
D cortex/data/nodes/failure_mode/e33f9700-6424-41ad-9c78-24796959a0bd.failure_mode
D cortex/data/nodes/failure_mode/ebc5c772-8553-407d-992b-68e542532d75.failure_mode
D cortex/gap-finder/index.js
D cortex/input/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
D cortex/interaction-contract.json
D cortex/memory/bep-lookup.js
D cortex/memory/decay.js
D cortex/memory/fix-map.js
D cortex/memory/jaa-db.js
D cortex/memory/relevance.js
D cortex/memory/table-compactor.js
D cortex/memory/table-deduplicator.js
D cortex/memory/tiers.js
D cortex/orion/index.js
D cortex/output/.gitkeep
D cortex/output/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
D cortex/personas.js
D cortex/push-recall.js
D cortex/registry-components.js
D cortex/schemas/index.js
D cortex/schemas/schema.account_identity_index_entry
D cortex/schemas/schema.bep_pattern
D cortex/schemas/schema.capability
D cortex/schemas/schema.chat_log
D cortex/schemas/schema.component
D cortex/schemas/schema.component_projection
D cortex/schemas/schema.constitution_decision
D cortex/schemas/schema.contract
D cortex/schemas/schema.debug_macro
D cortex/schemas/schema.event
D cortex/schemas/schema.failure_mode
D cortex/schemas/schema.fault
D cortex/schemas/schema.gap
D cortex/schemas/schema.hook
D cortex/schemas/schema.hook_contract
D cortex/schemas/schema.idea
D cortex/schemas/schema.interstitial_space
D cortex/schemas/schema.ledger
D cortex/schemas/schema.node
D cortex/schemas/schema.raid_contract
D cortex/schemas/schema.resonance_crystal
D cortex/schemas/schema.sigma_record
D cortex/schemas/schema.synthesis
D cortex/schemas/schema.system
D cortex/schemas/schema.tool_index_entry
D cortex/schemas/schema.wire
D cortex/self-heal/escalation.js
D cortex/self-heal/failure-mode-forensics.js
D cortex/self-heal/fault-taxonomy.js
D cortex/self-heal/index.js
D cortex/snapshot/index.js
D cortex/spec/cortex.node-taxonomy.md
D cortex/spec/cortex.spec
D cortex/tools/materialize-cli.js
D cortex/tools/table-materializer.js
D cortex/versionium/causality.js
D cortex/versionium/index.js
M guardian/lib/dispatcher.js
D package-lock.json
D powershell.exe
D tablet/index.html
D tablet/map3d.html
D test-new-plugins.js
D test-node-index.js
D verification-manifest.json
D warp/LICENSE
D warp/MANIFEST.json
D warp/core/Axiom.js
D warp/core/Event.js
D warp/core/Gate.js
D warp/core/GateFusion.js
D warp/core/Stream.js
D warp/core/StreamLog.js
D warp/core/index.js
D warp/dispatch/benchmark.js
D warp/dispatch/canonicalize.js
D warp/dispatch/cascade.js
D warp/dispatch/deltaCache.js
D warp/dispatch/digest.js
D warp/dispatch/index.js
D warp/dispatch/population.js
D warp/dispatch/pregen.js
D warp/plugins.zip
D warp/plugins/crystallizer-flatfile.js
D warp/plugins/scorer-default.js
D warp/spec/warp.spec
D warp/test/core.test.js
D warp/test/digest-regression.test.js
D warp/test/dispatch.test.js
D warp/test/v1.1.0-additions.test.js
D warp/test/v1.4-additions.test.js
```

### Build 0.39.142-r7 — snap-0597 — 2026-09-16 14:50:22

- Archive: `nexus-0597_2026-09-16_v0.39.142-r7_wired-1_declared-0.39.138.zip` (was `nexus-wired-1.zip`)
- SHA-256: `317d0d9ffc3534510f75573a93bafab8a4027ce0a769d884257c64689a9f2e70`, 112.5 MB, downloaded 2026-09-16 15:05:30
- Kind: full
- Claimed version: 0.39.138 (registry 0.39.138, file name none); filed under 0.39.142 to keep the line in order
- Commit: `c1f045ef5981319978945f69c40537cd46e6657e`, tag `snap-0597`
- Left out: embedded .git (7757 files, HEAD 7f6b021c6d3189c88091dfe24a5f6a7a6788056e (master))
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6908. Changes against the build before it: **122 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 83 | 0 | 0 |
| warp | 26 | 0 | 0 |
| (root) | 11 | 0 | 0 |
| tablet | 2 | 0 | 0 |

```
A .gitignore
A .mcp.json
A NEXUS-NODE-TAXONOMY-SESSION-README-2026-09-12.md
A NODE-TAXONOMY.md
A README-PATCH.md
A blueprint-index.json
A cortex/boot.js
A cortex/config.js
A cortex/contract/index.js
A cortex/core/raid/context-gate.js
A cortex/core/raid/context-synthesis.js
A cortex/core/raid/contract-boundary.js
A cortex/core/raid/contract-intake.js
A cortex/core/raid/envelope.js
A cortex/core/raid/event-taxonomy.js
A cortex/core/raid/index.js
A cortex/core/raid/officiator.js
A cortex/core/raid/router.js
A cortex/core/raid/routing-ir.js
A cortex/core/raid/snr-filter.js
A cortex/core/raid/tunables.js
A cortex/core/raid/worker.js
A cortex/cortex-v2.js
A cortex/data/baseline-events.ndjson
A cortex/data/invariant/baseline.json
A cortex/data/nodes/failure_mode/299b5d98-a9a7-4476-8828-bf016fa46361.failure_mode
A cortex/data/nodes/failure_mode/43fe903e-7646-4ae8-b4b9-5e9836d3023c.failure_mode
A cortex/data/nodes/failure_mode/49cf824e-f193-4a5b-9a1b-d39d22220eb2.failure_mode
A cortex/data/nodes/failure_mode/54de076a-a90c-416b-b26a-b6837a4dec92.failure_mode
A cortex/data/nodes/failure_mode/62a849ea-ea6c-43f8-8464-7afee2bb73aa.failure_mode
A cortex/data/nodes/failure_mode/7cbc5a39-a62c-45c4-a9e8-5348df3069be.failure_mode
A cortex/data/nodes/failure_mode/b452ebf9-0b4c-43c3-ab64-785298bc83aa.failure_mode
A cortex/data/nodes/failure_mode/e33f9700-6424-41ad-9c78-24796959a0bd.failure_mode
A cortex/data/nodes/failure_mode/ebc5c772-8553-407d-992b-68e542532d75.failure_mode
A cortex/gap-finder/index.js
A cortex/input/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A cortex/interaction-contract.json
A cortex/memory/bep-lookup.js
A cortex/memory/decay.js
A cortex/memory/fix-map.js
A cortex/memory/jaa-db.js
A cortex/memory/relevance.js
A cortex/memory/table-compactor.js
A cortex/memory/table-deduplicator.js
A cortex/memory/tiers.js
A cortex/orion/index.js
A cortex/output/.gitkeep
A cortex/output/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A cortex/personas.js
A cortex/push-recall.js
A cortex/registry-components.js
A cortex/schemas/index.js
A cortex/schemas/schema.account_identity_index_entry
A cortex/schemas/schema.bep_pattern
A cortex/schemas/schema.capability
A cortex/schemas/schema.chat_log
A cortex/schemas/schema.component
A cortex/schemas/schema.component_projection
A cortex/schemas/schema.constitution_decision
A cortex/schemas/schema.contract
A cortex/schemas/schema.debug_macro
A cortex/schemas/schema.event
A cortex/schemas/schema.failure_mode
A cortex/schemas/schema.fault
A cortex/schemas/schema.gap
A cortex/schemas/schema.hook
A cortex/schemas/schema.hook_contract
A cortex/schemas/schema.idea
A cortex/schemas/schema.interstitial_space
A cortex/schemas/schema.ledger
A cortex/schemas/schema.node
A cortex/schemas/schema.raid_contract
A cortex/schemas/schema.resonance_crystal
A cortex/schemas/schema.sigma_record
A cortex/schemas/schema.synthesis
A cortex/schemas/schema.system
A cortex/schemas/schema.tool_index_entry
A cortex/schemas/schema.wire
A cortex/self-heal/escalation.js
A cortex/self-heal/failure-mode-forensics.js
A cortex/self-heal/fault-taxonomy.js
A cortex/self-heal/index.js
A cortex/snapshot/index.js
A cortex/spec/cortex.node-taxonomy.md
A cortex/spec/cortex.spec
A cortex/tools/materialize-cli.js
A cortex/tools/table-materializer.js
A cortex/versionium/causality.js
A cortex/versionium/index.js
A package-lock.json
A powershell.exe
A tablet/index.html
A tablet/map3d.html
A test-new-plugins.js
A test-node-index.js
A verification-manifest.json
A warp/LICENSE
A warp/MANIFEST.json
A warp/core/Axiom.js
A warp/core/Event.js
A warp/core/Gate.js
A warp/core/GateFusion.js
A warp/core/Stream.js
A warp/core/StreamLog.js
A warp/core/index.js
A warp/dispatch/benchmark.js
A warp/dispatch/canonicalize.js
A warp/dispatch/cascade.js
A warp/dispatch/deltaCache.js
A warp/dispatch/digest.js
A warp/dispatch/index.js
A warp/dispatch/population.js
A warp/dispatch/pregen.js
A warp/plugins.zip
A warp/plugins/crystallizer-flatfile.js
A warp/plugins/scorer-default.js
A warp/spec/warp.spec
A warp/test/core.test.js
A warp/test/digest-regression.test.js
A warp/test/dispatch.test.js
A warp/test/v1.1.0-additions.test.js
A warp/test/v1.4-additions.test.js
```

### Build 0.39.142-r8 — snap-0598 — 2026-09-16 16:04:54

- Archive: `nexus-0598_2026-09-16_v0.39.142-r8_named-0.39.142.zip` (was `Nexus_0_39_142.zip`)
- SHA-256: `3eff89736d3bb7424bc3736ba32e2f630826e62c8100518571f1453c2ffeb493`, 113.6 MB, downloaded 2026-09-16 16:09:45
- Kind: full
- Commit: `5308f1daed3d5ac59df835c6d341e6ac806d1c15`, tag `snap-0598`
- Left out: embedded .git (7776 files, HEAD 145791cf033c9ee1126c0080db4b36d5f89344c3 (master))
- Left out: node_modules (278 files)
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6907. Changes against the build before it: **4 added, 24 modified, 5 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 9 | 5 |
| idearium | 3 | 5 | 0 |
| clear-glass | 0 | 3 | 0 |
| lib | 1 | 2 | 0 |
| data | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M clear-glass/src/dom/archaeology.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/providers/download-capture.js
M cortex/core/raid/contract-intake.js
M data/cortex/memory/idearium_spec_chunks.json
M data/cortex/memory/idearium_spec_manifests.json
D docs/clear-glass.spec
M docs/copilot.spec
M docs/cortex.spec
M docs/cos.spec
M docs/emerge.spec
M docs/guardian.spec
M docs/idearium.spec
M docs/intelligence.spec
D docs/loom.spec
D docs/nexus-repository-system.spec
M docs/ollama.spec
M docs/orchestrator.spec
D docs/versionium.spec
D docs/warp.spec
M guardian/lib/dispatcher.js
M idearium/api/index.js
A idearium/data/nodes/chunk/test-repo-uuid-thread.77569faf-e0cd-48b8-8f22-58c72c1d5507.e80d9fb6-869d-474d-8c1a-679a45e71633.chunk
A idearium/data/nodes/repository/nexus-id-repo-3eed3fb0.repository
M idearium/lib/chunk-nodes.js
M idearium/repo/import-pipeline.js
M idearium/repo/index.js
A idearium/repo/repo-node.js
M idearium/spec-engine/index.js
M lib/node-export.js
A lib/node-schemas/schema.repository
M lib/project-container.js
M orchestrator/orchestrator.js
```

