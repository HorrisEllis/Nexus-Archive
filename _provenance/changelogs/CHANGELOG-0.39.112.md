# Nexus 0.39.112

| | |
|---|---|
| Built | 2026-09-12 05:44:52 → 2026-09-12 12:05:42 |
| Builds on the main line | 3 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.39.112 |
| Tag | `v0.39.112` → snap-0558 |
| Full file ledger | [LEDGER-0.39.112.csv](../ledger/LEDGER-0.39.112.csv) |

## Ledger

### Build 0.39.112-r1 — snap-0555 — 2026-09-12 05:44:52

- Archive: `nexus-0555_2026-09-12_v0.39.112-r1_updated.zip` (was `nexus-v0_39_112-updated.zip`)
- SHA-256: `8cebf0df90553394d14597d33b9e5b86f60f08c41a5fc7cafc788083419b1259`, 90.4 MB, downloaded 2026-09-12 06:08:40
- Kind: full
- Commit: `f3a526d4ee4390a5de7c84127ba75d3e64eaae69`, tag `snap-0555`
- Left out: embedded .git (5752 files, HEAD cb91b415574cb7953d1b239bbc5afc0295689429 (master))
- Left out: node_modules (16 files)
- Files in archive: 4962. Changes against the build before it: **69 added, 18 modified, 48 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 36 | 3 | 29 |
| guardian | 9 | 2 | 9 |
| _archive | 0 | 0 | 10 |
| siso | 10 | 0 | 0 |
| tests | 4 | 4 | 0 |
| cli | 5 | 0 | 0 |
| cortex | 2 | 3 | 0 |
| (root) | 1 | 2 | 0 |
| orchestrator | 1 | 2 | 0 |
| data | 1 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |

```
M .mcp.json
D _archive/root-siso-orphaned-2026-09-11/siso/Event.js
D _archive/root-siso-orphaned-2026-09-11/siso/Gate.js
D _archive/root-siso-orphaned-2026-09-11/siso/MANIFEST.json
D _archive/root-siso-orphaned-2026-09-11/siso/Stream.js
D _archive/root-siso-orphaned-2026-09-11/siso/StreamLog.js
D _archive/root-siso-orphaned-2026-09-11/siso/core/index.js
D _archive/root-siso-orphaned-2026-09-11/siso/core/package.json
D _archive/root-siso-orphaned-2026-09-11/siso/index.js
D _archive/root-siso-orphaned-2026-09-11/siso/package.json
D _archive/root-siso-orphaned-2026-09-11/siso/spec/siso.spec
M clear-glass/src/main/index.js
A cli/compact.js
A cli/data-audit.js
A cli/decompose.js
A cli/dedup.js
A cli/find-orphans.js
M cortex/boot.js
A cortex/memory/table-compactor.js
A cortex/memory/table-deduplicator.js
M cortex/memory/tiers.js
M cortex/self-heal/escalation.js
A data/cortex/memory/compaction_log.json
M data/cortex/memory/sigma_records.json
M guardian/lib/dispatcher.js
D guardian/schemas/guardian_chat_log.schema
D guardian/schemas/guardian_download.schema
D guardian/schemas/guardian_job.schema
D guardian/schemas/guardian_pa_session.schema
D guardian/schemas/guardian_queue_compartment.schema
D guardian/schemas/guardian_seam_session.schema
D guardian/schemas/guardian_session.schema
D guardian/schemas/guardian_setting.schema
D guardian/schemas/guardian_timeline_event.schema
M guardian/schemas/index.js
A guardian/schemas/schema.guardian_chat_log
A guardian/schemas/schema.guardian_download
A guardian/schemas/schema.guardian_job
A guardian/schemas/schema.guardian_pa_session
A guardian/schemas/schema.guardian_queue_compartment
A guardian/schemas/schema.guardian_seam_session
A guardian/schemas/schema.guardian_session
A guardian/schemas/schema.guardian_setting
A guardian/schemas/schema.guardian_timeline_event
M lib/agent-tools/index.js
A lib/agent-tools/naming.js
A lib/agent-tools/tools/cortex/node-tag.js
A lib/agent-tools/tools/guardian/build.js
A lib/agent-tools/tools/system-tools/cortex-restep.js
A lib/agent-tools/tools/system-tools/syntax-debug.js
A lib/agent-tools/tools/versionium/history.js
A lib/agent-tools/tools/versionium/snapshot.js
M lib/node-schemas.js
D lib/node-schemas/agent.schema
D lib/node-schemas/artifact.schema
D lib/node-schemas/capability.schema
D lib/node-schemas/command.schema
D lib/node-schemas/component.schema
D lib/node-schemas/contract.schema
D lib/node-schemas/cos.schema
D lib/node-schemas/crystal.schema
D lib/node-schemas/event.schema
D lib/node-schemas/failure_mode.schema
D lib/node-schemas/fault.schema
D lib/node-schemas/framework.schema
D lib/node-schemas/gap.schema
D lib/node-schemas/guardian_listener.schema
D lib/node-schemas/hat.schema
D lib/node-schemas/hook_contract.schema
D lib/node-schemas/idea.schema
D lib/node-schemas/interstitial_space.schema
D lib/node-schemas/lattice_edge.schema
D lib/node-schemas/ledger.schema
D lib/node-schemas/macro.schema
D lib/node-schemas/model.schema
D lib/node-schemas/node.schema
D lib/node-schemas/pat.schema
D lib/node-schemas/relationship_edge.schema
D lib/node-schemas/resonance_crystal.schema
A lib/node-schemas/schema.agent
A lib/node-schemas/schema.artifact
A lib/node-schemas/schema.capability
A lib/node-schemas/schema.command
A lib/node-schemas/schema.component
A lib/node-schemas/schema.contract
A lib/node-schemas/schema.cos
A lib/node-schemas/schema.crystal
A lib/node-schemas/schema.event
A lib/node-schemas/schema.failure_mode
A lib/node-schemas/schema.fault
A lib/node-schemas/schema.framework
A lib/node-schemas/schema.gap
A lib/node-schemas/schema.guardian_listener
A lib/node-schemas/schema.hat
A lib/node-schemas/schema.hook_contract
A lib/node-schemas/schema.idea
A lib/node-schemas/schema.interstitial_space
A lib/node-schemas/schema.lattice_edge
A lib/node-schemas/schema.ledger
A lib/node-schemas/schema.macro
A lib/node-schemas/schema.model
A lib/node-schemas/schema.node
A lib/node-schemas/schema.pat
A lib/node-schemas/schema.relationship_edge
A lib/node-schemas/schema.resonance_crystal
A lib/node-schemas/schema.tool
A lib/node-schemas/schema.toolbox
A lib/node-schemas/schema.vector
D lib/node-schemas/tool.schema
D lib/node-schemas/toolbox.schema
D lib/node-schemas/vector.schema
M lib/version.js
M orchestrator/lib/mcp-server.js
A orchestrator/lib/mcp-tools-tokensave.js
M orchestrator/orchestrator.js
M package.json
A run-all.js
A siso/Event.js
A siso/Gate.js
A siso/MANIFEST.json
A siso/Stream.js
A siso/StreamLog.js
A siso/core/index.js
A siso/core/package.json
A siso/index.js
A siso/package.json
A siso/spec/siso.spec
M tests/modules/run-all.js
M tests/modules/test-escalation.js
A tests/modules/test-gap-tools.js
M tests/modules/test-nexus-wake.js
A tests/modules/test-table-compactor.js
A tests/modules/test-table-deduplicator.js
A tests/modules/test-tool-naming-convention.js
M tests/node-schemas-split.test.js
```

### Build 0.39.112-r2 — snap-0556 — 2026-09-12 07:19:40

- Archive: `nexus-0556_2026-09-12_v0.39.112-r2_decomposed.zip` (was `nexus-v0_39_112-decomposed.zip`)
- SHA-256: `101fba65032fe7d5195f96801f8c12f26f4c79f96e31ae3c5e7314ce34780900`, 45 MB, downloaded 2026-09-12 07:20:14
- Kind: full
- Commit: `c61486f5cfecac1ab7bd486445520b11140644dc`, tag `snap-0556`
- Files in archive: 4978. Changes against the build before it: **16 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| contracts | 14 | 1 | 0 |
| cli | 0 | 1 | 0 |
| data | 1 | 0 | 0 |
| intelligence | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
M cli/decompose.js
M contracts/SYSTEM-CONTRACTS.js
A contracts/nodes/axioms.node.js
A contracts/nodes/bottlenecks.node.js
A contracts/nodes/causal-physics.node.js
A contracts/nodes/deltas.node.js
A contracts/nodes/divergent.node.js
A contracts/nodes/edges.node.js
A contracts/nodes/events.node.js
A contracts/nodes/faults.node.js
A contracts/nodes/gaps.node.js
A contracts/nodes/interaction-contracts.node.js
A contracts/nodes/ledgers.node.js
A contracts/nodes/self-awareness.node.js
A contracts/nodes/systems.node.js
A contracts/nodes/verification-contracts.node.js
A data/lattice/relationship_lattice.buffer.jsonl
A intelligence/lattice/fanin-listener.js
M lib/ledger-fanin/boot.js
M nexus/nexus-connect.js
```

### artifact — 0557 — 2026-09-12 10:55:46

- Archive: `nexus-0557_2026-09-12_v0.39.112-side_node-taxonomy-session.zip` (was `nexus-node-taxonomy-session.zip`)
- SHA-256: `d9e615f3addf6a13dcafedde9b8f4656460db87119340c51e101026dfdffcf5f`, 0.2 MB, downloaded 2026-09-12 11:36:52
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `15c9a184eb8c3c02eb4a24b25314042b761529e2`, tag `snap-0557`
- Files in archive: 176. Changes against the build before it: **176 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0557_2026-09-12_unversioned_node-taxonomy-session | 176 | 0 | 0 |

```
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/NODE-TAXONOMY.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/README.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/architect/spec/architect.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.clearglass_search_engine
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.macro
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/clear-glass/spec/clear-glass.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.input
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.intent
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.output
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.tool
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/copilot/spec/copilot.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.contract
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.failure_mode
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.gap
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.idea
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.ledger
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.synthesis
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/cortex/spec/cortex.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/emerge/spec/emerge.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/eravos/spec/eravos.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/lib/node-registry.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.agent
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.artifact
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.fault
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.gap
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_chat_log
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_download
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_job
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_listener
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_pa_session
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_queue_compartment
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_seam_session
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_session
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_setting
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.guardian_timeline_event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.hat
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.hook_contract
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.input
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.intent
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.ledger
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.output
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.tool
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/guardian/spec/guardian.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/interaction-contract.json
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.idea
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/idearium/spec/idearium.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.account_identity_index_entry
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.bep_pattern
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.fault
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.fault_taxonomy
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.gap
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.interstitial_space
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.nexus_wake_event
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.pat
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.relationship_edge
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.resonance_crystal
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.reuse_index_entry
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.sigma_record
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/schemas/schema.vector
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/intelligence/spec/intelligence.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/agent-tools/tools/clear-glass/search-engine.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/agent-tools/tools/execution/dedup-table.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-export.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.component
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.failure_mode
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.input
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.intent
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.note
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.output
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.synthesis
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.tool
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/lib/node-schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.component
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.hook
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.node
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.system
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/schemas/schema.wire
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/loom/spec/loom.node-taxonomy.md
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/nexus-healer/schemas/index.js
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/nexus-healer/schemas/schema.capability
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/nexus-healer/schemas/schema.command
A nexus-0557_2026-09-12_unversioned_node-taxonomy-session/nexus-healer/schemas/schema.healer_proposal
```

26 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.112-r3 — snap-0558 — 2026-09-12 12:05:42

- Archive: `nexus-0558_2026-09-12_v0.39.112-r3_handoff.zip` (was `nexus-handoff.zip`)
- SHA-256: `bdb608e216d1b9f0a28801d177dc2b3e4bfe32981eb41ffe881433d0e39290b1`, 91.4 MB, downloaded 2026-09-12 12:11:44
- Kind: full
- Commit: `ce1e873c608a3b64e4b06dc3d530b385168dff82`, tag `snap-0558`
- Left out: embedded .git (5752 files, HEAD cb91b415574cb7953d1b239bbc5afc0295689429 (master))
- Files in archive: 5225. Changes against the build before it: **247 added, 10 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 71 | 1 | 0 |
| intelligence | 34 | 3 | 0 |
| ollama | 29 | 0 | 0 |
| lib | 12 | 5 | 0 |
| cortex | 14 | 0 | 0 |
| clear-glass | 12 | 0 | 0 |
| copilot | 12 | 0 | 0 |
| idearium | 9 | 0 | 0 |
| loom | 9 | 0 | 0 |
| nexus-healer | 9 | 0 | 0 |
| architect | 8 | 0 | 0 |
| emerge | 8 | 0 | 0 |
| eravos | 8 | 0 | 0 |
| versionium | 7 | 0 | 0 |
| (root) | 3 | 1 | 0 |
| data | 2 | 0 | 0 |

```
A NODE-TAXONOMY.md
M README.md
A architect/schemas/index.js
A architect/schemas/schema.capability
A architect/schemas/schema.command
A architect/schemas/schema.hook
A architect/schemas/schema.node
A architect/schemas/schema.system
A architect/schemas/schema.wire
A architect/spec/architect.node-taxonomy.md
A clear-glass/schemas/index.js
A clear-glass/schemas/schema.capability
A clear-glass/schemas/schema.clearglass_search_engine
A clear-glass/schemas/schema.command
A clear-glass/schemas/schema.component
A clear-glass/schemas/schema.event
A clear-glass/schemas/schema.hook
A clear-glass/schemas/schema.macro
A clear-glass/schemas/schema.node
A clear-glass/schemas/schema.system
A clear-glass/schemas/schema.wire
A clear-glass/spec/clear-glass.node-taxonomy.md
A copilot/schemas/index.js
A copilot/schemas/schema.capability
A copilot/schemas/schema.command
A copilot/schemas/schema.hook
A copilot/schemas/schema.input
A copilot/schemas/schema.intent
A copilot/schemas/schema.node
A copilot/schemas/schema.output
A copilot/schemas/schema.system
A copilot/schemas/schema.tool
A copilot/schemas/schema.wire
A copilot/spec/copilot.node-taxonomy.md
A cortex/schemas/index.js
A cortex/schemas/schema.capability
A cortex/schemas/schema.contract
A cortex/schemas/schema.event
A cortex/schemas/schema.failure_mode
A cortex/schemas/schema.gap
A cortex/schemas/schema.hook
A cortex/schemas/schema.idea
A cortex/schemas/schema.ledger
A cortex/schemas/schema.node
A cortex/schemas/schema.synthesis
A cortex/schemas/schema.system
A cortex/schemas/schema.wire
A cortex/spec/cortex.node-taxonomy.md
A emerge/schemas/index.js
A emerge/schemas/schema.capability
A emerge/schemas/schema.command
A emerge/schemas/schema.hook
A emerge/schemas/schema.node
A emerge/schemas/schema.system
A emerge/schemas/schema.wire
A emerge/spec/emerge.node-taxonomy.md
A eravos/schemas/index.js
A eravos/schemas/schema.capability
A eravos/schemas/schema.command
A eravos/schemas/schema.hook
A eravos/schemas/schema.node
A eravos/schemas/schema.system
A eravos/schemas/schema.wire
A eravos/spec/eravos.node-taxonomy.md
A guardian/commands/get-alk-last.command
A guardian/commands/get-api-guardian-cfr-state.command
A guardian/commands/get-api-guardian-hooks-summary.command
A guardian/commands/get-api-guardian-nerve-snapshot.command
A guardian/commands/get-api-guardian-organism-queue.command
A guardian/commands/get-api-intake.command
A guardian/commands/get-api-tools.command
A guardian/commands/get-artifacts.command
A guardian/commands/get-baseline.command
A guardian/commands/get-bus.command
A guardian/commands/get-channel.command
A guardian/commands/get-cockpit.command
A guardian/commands/get-commands.command
A guardian/commands/get-contract.command
A guardian/commands/get-events.command
A guardian/commands/get-gaps-summary.command
A guardian/commands/get-gaps.command
A guardian/commands/get-health.command
A guardian/commands/get-jobs.command
A guardian/commands/get-providers.command
A guardian/commands/get-queue-compartments.command
A guardian/commands/get-queue.command
A guardian/commands/get-root.command
A guardian/commands/get-seam-queues.command
A guardian/commands/get-seam-sessions.command
A guardian/commands/get-seam-status-cross-system.command
A guardian/commands/get-seam-watchdog-status.command
A guardian/commands/get-sessions.command
A guardian/commands/get-version.command
A guardian/commands/post-api-account-identity.command
A guardian/commands/post-api-copilot-prompt.command
A guardian/commands/post-api-guardian-cfr-event.command
A guardian/commands/post-api-intake-promote.command
A guardian/commands/post-api-intake-rollback.command
A guardian/commands/post-api-intake-verdict.command
A guardian/commands/post-api-intake.command
A guardian/commands/post-build.command
A guardian/commands/post-bus-emit.command
A guardian/commands/post-chatgpt-mode-query.command
A guardian/commands/post-cli-exec.command
A guardian/commands/post-command-tools.command
A guardian/commands/post-command.command
A guardian/commands/post-heartbeat.command
A guardian/commands/post-queue-compartments.command
A guardian/commands/post-queue-enqueue.command
A guardian/commands/post-result.command
A guardian/commands/post-seam-retry.command
A guardian/commands/post-seam-sessions.command
A guardian/commands/post-wake-job-ack.command
A guardian/lib/node-registry.js
M guardian/schemas/index.js
A guardian/schemas/schema.agent
A guardian/schemas/schema.artifact
A guardian/schemas/schema.capability
A guardian/schemas/schema.command
A guardian/schemas/schema.component
A guardian/schemas/schema.event
A guardian/schemas/schema.fault
A guardian/schemas/schema.gap
A guardian/schemas/schema.guardian_listener
A guardian/schemas/schema.hat
A guardian/schemas/schema.hook
A guardian/schemas/schema.hook_contract
A guardian/schemas/schema.input
A guardian/schemas/schema.intent
A guardian/schemas/schema.ledger
A guardian/schemas/schema.model
A guardian/schemas/schema.node
A guardian/schemas/schema.output
A guardian/schemas/schema.tool
A guardian/schemas/schema.wire
A guardian/spec/guardian.node-taxonomy.md
A idearium/schemas/index.js
A idearium/schemas/schema.capability
A idearium/schemas/schema.command
A idearium/schemas/schema.hook
A idearium/schemas/schema.idea
A idearium/schemas/schema.node
A idearium/schemas/schema.system
A idearium/schemas/schema.wire
A idearium/spec/idearium.node-taxonomy.md
A intelligence/commands/get-api-commands-history.command
A intelligence/commands/get-api-commands.command
A intelligence/commands/get-api-intelligence-context.command
A intelligence/commands/get-api-intelligence-failures.command
A intelligence/commands/get-api-intelligence-map.command
```

107 more (mostly data, logs and archived files) are in the ledger file.

