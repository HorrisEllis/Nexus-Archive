# Nexus 0.60.250

**0.60.250 — SV1, the census half: who writes which table of the shared store**

| | |
|---|---|
| Built | 2026-10-24 15:31:26 → 2026-10-26 11:58:56 |
| Builds on the main line | 1 |
| Other archives filed here | 1 |
| Versions the builds claimed | 0.60.250, 0.60.263 |
| Tag | `v0.60.250` → snap-0781 |
| Full file ledger | [LEDGER-0.60.250.csv](../ledger/LEDGER-0.60.250.csv) |

## Release notes — `CHANGELOG-0.60.250.md`

Copied unchanged from the build.

### 0.60.250 — SV1, the census half: who writes which table of the shared store

James, 2026-10-24: "i want to get each system soveriegn and inside a cos compartment" · "continue"

Every "data" blocker in the sovereignty census is the same file: the one shared store, `cortex/memory/jaa-db.js`. Before any table can
be given an owner, the census has to say who uses which table, from the code. That is all this release does: it decides nothing.

#### What it reads, and how (§0.1)
`lib/system-boundary.js` `tables()`:
- A **store user** is a file whose require resolves to the store.
- Its **table calls** are `<anything>.<op>('<table>'`, read in its code with comments blanked. A table named by the file's own string
  constant (`const TABLE = 'loom_changelog'`) is read too.
- Writes are insert, upsert, update and delete. The rest are reads.
- **Said:** 21 of 106 store users name no table this can read (a table chosen at run time). They are counted, not hidden.

#### What it found (Nexus, 2026-10-24)
127 tables:
- **43** have one writer system. That is the owner the evidence names.
- **3** are written by one system, and by core too.
- **31** are written only by core. They go home with core's files (SV2).
- **3** are contested, written by several systems: `event_log`, `failures`, `gaps`.
- **47** are only read.

#### Where to see it
`GET /api/system/tables[?system=]`, the command `system tables [<system>]`, and the tables a system touches in Settings › its repo ›
System › Sovereignty.

#### His call (SV1_D1 in docs/2026-10-24-sovereign-systems-phasemap.spec)
On brave-cori, his answer to this same proposal (a table → owner map) was: "Look at emerge. Deeply Custom". That line's coder read it as:
declare each system's tables in his Emergence language, and compile the owner map from those declarations. To confirm. So how a system
declares what it owns is his to choose:
- (a) Emergence: `<system>.eg`, compiled to its store module. No `.eg` program exists yet.
- (b) The table lists in `lib/system-store.js` `openStore`, which guardian and loom already use.

Either way, the three contested tables are his to assign.

#### Proof
SV-10 (on a fixture: a constant is read, a comment is not, a two-writer table is contested with no owner guessed, and the route and
command work). SV 10/10, SB 10/10, route contracts 4/4, registration shape 8/8.

## Ledger

### Build 0.60.250 — snap-0781 — 2026-10-24 15:31:26

- Archive: `nexus-0781_2026-10-24_v0.60.250.zip` (was `nexus-0.60.250.zip`)
- SHA-256: `fcf141ae8f985f9a362f2b70a25841e3ebffc7a28dac536bb1515676d0be3acb`, 32 MB, downloaded 2026-10-24 16:10:04
- Kind: full
- Commit: `96a94c3fa256c4179ea0613e693b260bfcd15870`, tag `snap-0781`
- Files in archive: 12236. Changes against the build before it: **3075 added, 1104 modified, 1373 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1565 | 428 | 404 |
| idearium | 460 | 206 | 196 |
| cos | 281 | 46 | 21 |
| cortex | 181 | 54 | 56 |
| guardian | 97 | 32 | 36 |
| loom | 87 | 49 | 24 |
| clear-glass | 81 | 24 | 36 |
| ui | 0 | 0 | 114 |
| tests | 5 | 108 | 0 |
| docs | 45 | 63 | 0 |
| intelligence | 46 | 29 | 18 |
| emerge | 0 | 0 | 90 |
| emergence | 0 | 0 | 84 |
| _archive | 84 | 0 | 0 |
| copilot | 36 | 18 | 12 |
| orchestrator | 40 | 17 | 9 |
| remote-desktop | 0 | 0 | 56 |
| warp | 0 | 0 | 37 |
| ollama | 15 | 8 | 5 |
| erosmancer | 0 | 0 | 28 |
| cli | 0 | 0 | 27 |
| diagnostic | 22 | 4 | 1 |
| architect | 14 | 4 | 2 |
| contracts | 0 | 0 | 18 |
| (root) | 12 | 5 | 0 |
| sentinel | 0 | 0 | 16 |
| mesh | 0 | 0 | 14 |
| architecture-spec | 0 | 0 | 14 |
| versionium | 4 | 5 | 2 |
| hooks | 0 | 0 | 11 |
| siso | 0 | 0 | 10 |
| nexus | 0 | 0 | 8 |
| auth | 0 | 0 | 5 |
| cockpit | 0 | 0 | 5 |
| scripts | 0 | 4 | 0 |
| meta | 0 | 0 | 4 |
| service | 0 | 0 | 3 |
| jaa | 0 | 0 | 2 |
| tablet | 0 | 0 | 2 |
| security | 0 | 0 | 2 |
| seams | 0 | 0 | 1 |

```
A CHANGELOG-0.60.234.md
A CHANGELOG-0.60.235.md
A CHANGELOG-0.60.236.md
A CHANGELOG-0.60.237.md
A CHANGELOG-0.60.241.md
A CHANGELOG-0.60.244.md
A CHANGELOG-0.60.245.md
A CHANGELOG-0.60.246.md
A CHANGELOG-0.60.247.md
A CHANGELOG-0.60.248.md
A CHANGELOG-0.60.249.md
A CHANGELOG-0.60.250.md
M MANIFEST.json
M README.md
M VERSION
M architect/phases/2026-09-13-axiom-5-2-raid-routing/MCO12_architect_remaining_routes.phase
M architect/phases/2026-10-19-infrastructure-spine/IN5_architect_mirrors_the_registry.phase
A architect/phases/2026-10-23-cos-spine/SV3_components_and_architect.phase
A architect/phases/2026-10-24-loom-into-cos/LM3_readers_through_its_routes.phase
A architect/phases/2026-10-24-sovereign-systems/SV3_components_and_architect.phase
M architect/phases/INDEX.md
M architect/service.js
D architecture-spec/registry/api.js
D architecture-spec/registry/bundle.js
D architecture-spec/registry/component.js
D architecture-spec/registry/config.js
D architecture-spec/registry/create-atlas.js
D architecture-spec/registry/decompose.js
D architecture-spec/registry/edit-atlas.js
D architecture-spec/registry/friction.js
D architecture-spec/registry/hook.js
D architecture-spec/registry/lattice.js
D architecture-spec/registry/nexus-atlas-aggregate.js
D architecture-spec/registry/phases.js
D architecture-spec/registry/watcher.js
D architecture-spec/registry/wire.js
D auth/client.js
D auth/index.js
D auth/keys/nexus-private.pem
D auth/keys/nexus-public.pem
D auth/policy.json
A clear-glass/erosmancer/erosmancer-os/CHANGELOG.md
A clear-glass/erosmancer/erosmancer-os/MANIFEST.json
A clear-glass/erosmancer/erosmancer-os/README.md
A clear-glass/erosmancer/erosmancer-os/ROADMAP.md
A clear-glass/erosmancer/erosmancer-os/package.json
A clear-glass/erosmancer/erosmancer-os/src/adaptive/index.ts
A clear-glass/erosmancer/erosmancer-os/src/api/server.ts
A clear-glass/erosmancer/erosmancer-os/src/behavior/index.ts
A clear-glass/erosmancer/erosmancer-os/src/bridge/index.ts
A clear-glass/erosmancer/erosmancer-os/src/dispatcher/index.ts
A clear-glass/erosmancer/erosmancer-os/src/hostile/index.ts
A clear-glass/erosmancer/erosmancer-os/src/index.ts
A clear-glass/erosmancer/erosmancer-os/src/observer/index.ts
A clear-glass/erosmancer/erosmancer-os/src/registry/index.ts
A clear-glass/erosmancer/erosmancer-os/src/replay/index.ts
A clear-glass/erosmancer/erosmancer-os/src/routing/index.ts
A clear-glass/erosmancer/erosmancer-os/src/selector/index.ts
A clear-glass/erosmancer/erosmancer-os/src/telemetry/index.ts
A clear-glass/erosmancer/erosmancer-os/src/types/index.ts
A clear-glass/erosmancer/erosmancer-os/tests/adaptive.test.ts
A clear-glass/erosmancer/erosmancer-os/tests/google-signin.test.ts
A clear-glass/erosmancer/erosmancer-os/tests/hostile.test.ts
A clear-glass/erosmancer/erosmancer-os/tests/integration.test.ts
A clear-glass/erosmancer/erosmancer-os/tests/replay.test.ts
A clear-glass/erosmancer/erosmancer-os/tests/suite.ts
A clear-glass/erosmancer/erosmancer-os/tsconfig.json
A clear-glass/erosmancer/spec/erosmancer.spec
M clear-glass/fix-orchestrator.js
M clear-glass/phases/2026-08-22-session-full/SF14_wake_pipeline_real_architecture.phase
M clear-glass/phases/2026-08-23-backlog/BL14_seam_to_lib_seam.phase
M clear-glass/phases/2026-08-23-backlog/BL1_macro_erosmancer_integration.phase
M clear-glass/phases/2026-08-23-backlog/BL23_ncp_providers_start_verification.phase
M clear-glass/phases/2026-08-30-interaction-contract-context/IC11_agent_truth_fragmentation.phase
D clear-glass/phases/2026-08-30-interaction-contract-context/IC3_intention_taxonomy_per_system.phase
D clear-glass/phases/2026-08-30-interaction-contract-context/IC4_idearium_system_template_update.phase
D clear-glass/phases/2026-08-30-interaction-contract-context/IC8_callto_event_driven_cli_injection.phase
D clear-glass/phases/2026-08-30-interaction-contract-context/IC9_diagnostic_stall_detection_and_autofix.phase
M clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CG2_route_ncp_onto_guardian_sse.phase
D clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP1_tool_index_hooked_to_living_model.phase
D clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP2_copilot_versionium_awareness.phase
D clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/CP3_git_vs_versionium_decision.phase
D clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/ID1_resolve_versionium_cortex_dependency.phase
D clear-glass/phases/2026-09-05-observability-sovereignty-and-agent-mesh/IDU1_idearium_homepage_and_repo_browser.phase
M clear-glass/phases/2026-09-11-sovereign-node-architecture/P23_guardian_job_durability.phase
A clear-glass/phases/2026-09-26-guardian-retry-novelty-and-installs/E1.phase
M clear-glass/phases/2026-10-10-shape-of-nexus/FN2_nerve_sees_the_field.phase
M clear-glass/phases/2026-10-15-personal-chat-import/PI3b_the_measured_patterns.phase
M clear-glass/phases/2026-10-15-personal-chat-import/PI7_the_links.phase
A clear-glass/phases/2026-10-16-google-signin/GS7_no_debugger_on_signin.phase
M clear-glass/phases/2026-10-21-brainos-into-idearium/BX10_float.phase
M clear-glass/phases/2026-10-21-browser-shell/BS7_surface.phase
A clear-glass/phases/2026-10-23-cos-spine/CS16_erosmancer_os.phase
A clear-glass/phases/2026-10-24-copilot-any-agent/CL3_any_agent_as_the_copilot.phase
A clear-glass/phases/2026-10-24-copilot-any-agent/CL4_each_reply_under_its_question_labelled_true.phase
A clear-glass/phases/2026-10-24-fifteen-systems-migration/RF3_erosmancer_os.phase
A clear-glass/phases/2026-10-24-sovereign-systems/CS16_erosmancer_os.phase
A clear-glass/phases/2026-10-24-system-consolidation/CN8_erosmancer_to_clear_glass.phase
M clear-glass/phases/INDEX.md
A clear-glass/phases/clearglass-agent-suite-and-cfr-loom/TX9_build_contract_file_dir.phase
A clear-glass/phases/nexus-architecture-rebuild/P20_intelligence_reads_present_not_oldest.phase
M clear-glass/phases/raid-verification-spine/P2_constitution_on_the_approve_path.phase
M clear-glass/phases/raid-warp-verification/P2_constitution_gate.phase
D clear-glass/phases/rich-atlas/AT1_full_enumeration_and_clickable_links.phase
D clear-glass/phases/rich-atlas/AT3_agent_queryable_atlas.phase
A clear-glass/spec/copilot-any-agent.spec
M clear-glass/src/copilot/bridge.js
M clear-glass/src/eros/supervisor.js
M clear-glass/src/main/index.js
M clear-glass/wire/nexus-wire.js
D cli/axiom.js
D cli/boot-systems.js
D cli/cfr-debug.js
D cli/clear-idearium.js
D cli/compact.js
D cli/compartments.js
D cli/copilot-window.js
D cli/data-audit.js
D cli/decompose.js
D cli/dedup.js
D cli/diagnose.js
D cli/find-orphans.js
D cli/import-history.js
D cli/nexus-cli.js
D cli/nexus-movement.js
D cli/nexus-repl-descriptors.js
D cli/nexus-repl.js
D cli/nexus.js
D cli/nodes.js
D cli/opportunity.js
D cli/pressure.js
D cli/purge-pollution.js
D cli/run-supervised.js
D cli/semantic-dedup.js
D cli/sentinel.js
D cli/session.js
D cli/spec/cli.spec
D cockpit/cli.js
D cockpit/cockpit.spec
D cockpit/core.js
D cockpit/live.js
D cockpit/pipeline.js
D contracts/SYSTEM-CONTRACTS.js
D contracts/drawbridge-baseline.json
D contracts/event-contract-baseline.json
D contracts/nexus-interaction-contract.js
M copilot/cli.js
M copilot/intents.js
M copilot/lifeline.js
M copilot/module-builder.js
```

5402 more (mostly data, logs and archived files) are in the ledger file.

### artifact — 0782 — 2026-10-26 11:58:56

- Archive: `nexus-0782_2026-10-26_v0.60.250-side_changes-2_declared-0.60.263.zip` (was `nexus-changes-2.zip`)
- SHA-256: `00c8a13c1dbbb15f18eee682734a363dfa6dc6ed87a34e35c954e869d7158b66`, 0.8 MB, downloaded 2026-10-26 12:01:16
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 0.60.263 (registry 0.60.263, file name none); filed under 0.60.250 to keep the line in order
- Commit: `951ebf4c4bbbdb82823ccd24d5e60d962dd13a87`, tag `snap-0782`
- Files in archive: 42. Changes against the build before it: **42 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0782_2026-10-26_v0.60.263_changes-2 | 42 | 0 | 0 |

```
A nexus-0782_2026-10-26_v0.60.263_changes-2/CHANGELOG-0.60.261.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/CHANGELOG-0.60.262.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/CHANGELOG-0.60.263.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/COMMITS.txt
A nexus-0782_2026-10-26_v0.60.263_changes-2/FILES.txt
A nexus-0782_2026-10-26_v0.60.263_changes-2/VERSION
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.254.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.255.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.256.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.257.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.258.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/CHANGELOG-0.60.259.md
A nexus-0782_2026-10-26_v0.60.263_changes-2/_archive/2026-10-26-main-parallel-0.60.254-259/version-lines.txt
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/package.json
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/renderer/autofill-inline.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/autofill/gig.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/autofill/inline.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/autofill/matcher.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/dom/archaeology.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/ipc/bridge.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/src/main/index.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/test/autofill-inline.electron.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/test/autofill-inline.test.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/test/field-query.electron.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/clear-glass/test/field-query.test.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/docs/2026-10-26-gate-chain-memory-phasemap.spec
A nexus-0782_2026-10-26_v0.60.263_changes-2/docs/2026-10-26-inline-autofill-ui-phasemap.spec
A nexus-0782_2026-10-26_v0.60.263_changes-2/docs/2026-10-26-recall-tool-phasemap.spec
A nexus-0782_2026-10-26_v0.60.263_changes-2/docs/SPEC-REGISTRY.spec
A nexus-0782_2026-10-26_v0.60.263_changes-2/guardian/lib/response-sink.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/guardian/server.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/idearium/cli/route-commands.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/agent-tools/index.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/agent-tools/tool-catalog.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/agent-tools/tool-guide.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/agent-tools/tools/nexus/recall.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/hat-seed.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/lib/version.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/loom/maps/economy-map.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/package.json
A nexus-0782_2026-10-26_v0.60.263_changes-2/tests/modules/run-all.js
A nexus-0782_2026-10-26_v0.60.263_changes-2/tests/modules/test-recall-tool.test.js
```

