# Nexus 0.48.0

**0.48.0 — agent settings in Settings → Agents; the agent in the Code tab**

| | |
|---|---|
| Built | 2026-10-07 13:07:40 → 2026-10-07 14:34:12 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.48.0 |
| Tag | `v0.48.0` → snap-0740 |
| Full file ledger | [LEDGER-0.48.0.csv](../ledger/LEDGER-0.48.0.csv) |

## Release notes — `CHANGELOG-0.48.0.md`

Copied unchanged from the build.

### 0.48.0 — agent settings in Settings → Agents; the agent in the Code tab

James: "no. all agent settings and options in the options tab under agents. the agents tab should maybe merge with the code tab."

The idea and the direction are James's; the code is the coder's.

#### Settings → Agents
Every agent setting now lives under Settings → Agents, drawn natively with no iframe:
- **Behaviour:** who answers, its Ollama model, which tools it may use, and what happens to the code it writes.
- **Prompt:** every block the agent is sent.
- **Hat & tools:** the persona, the tools it carries and what it has learned, with teach, export, import and forge.
- **Models:** whether Ollama is wired in.

#### No Agent tab
- The Code tab's docked agent is now the repo's agent, with one conversation that is kept when you leave the tab.
- Its slash commands (`/help`, `/tools`, `/debug` …) work there.
- One line at the top says who it is, how much is indexed and what it has learned, with **options ↗** to Settings → Agents.
- Its proposals are the Code tab's diffs. Anything that opened the Agent tab now opens Code.

This reverses 0.47.0's option sections in the Agent tab.

#### Proof
`tests/probe/idearium-one-surface-glass.js` 18/18, on the real page.

## Ledger

### Build 0.48.0-r1 — snap-0739 — 2026-10-07 13:07:40

- Archive: `nexus-0739_2026-10-07_v0.48.0-r1_claude-nexus-idearium-overview-yoguem.zip` (was `Nexus-claude-nexus-idearium-overview-yoguem.zip`)
- SHA-256: `abae7d1e516819a60cc85606e54791a92f6d1a99be5dae5742cee8adb710f752`, 15.7 MB, downloaded 2026-10-07 14:25:17
- Kind: full
- Commit: `dbf66b304b3697dbf18e7e07c0a46ca5573751bd`, tag `snap-0739`
- Identical copy: `nexus-0739_2026-10-07_v0.48.0-r1_claude-nexus-idearium-overview-yoguem-1_dup1.zip` (was `Nexus-claude-nexus-idearium-overview-yoguem-1.zip`)
- Identical copy: `nexus-0739_2026-10-07_v0.48.0-r1_claude-nexus-idearium-overview-yoguem-2_dup2.zip` (was `Nexus-claude-nexus-idearium-overview-yoguem-2.zip`)
- Files in archive: 5467. Changes against the build before it: **83 added, 142 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 20 | 21 | 0 |
| intelligence | 0 | 30 | 0 |
| (root) | 26 | 1 | 0 |
| idearium | 7 | 20 | 0 |
| lib | 6 | 16 | 0 |
| cos | 5 | 11 | 0 |
| docs | 7 | 9 | 0 |
| ollama | 5 | 10 | 0 |
| loom | 2 | 4 | 0 |
| guardian | 1 | 5 | 0 |
| data | 4 | 2 | 0 |
| cortex | 0 | 5 | 0 |
| clear-glass | 0 | 2 | 0 |
| ui | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A CHANGELOG-0.39.361.md
A CHANGELOG-0.39.362.md
A CHANGELOG-0.39.363.md
A CHANGELOG-0.39.364.md
A CHANGELOG-0.39.365.md
A CHANGELOG-0.39.366.md
A CHANGELOG-0.39.367.md
A CHANGELOG-0.39.368.md
A CHANGELOG-0.39.369.md
A CHANGELOG-0.39.370.md
A CHANGELOG-0.39.371.md
A CHANGELOG-0.39.372.md
A CHANGELOG-0.39.373.md
A CHANGELOG-0.39.374.md
A CHANGELOG-0.39.375.md
A CHANGELOG-0.39.376.md
A CHANGELOG-0.40.0.md
A CHANGELOG-0.40.1.md
A CHANGELOG-0.41.0.md
A CHANGELOG-0.42.0.md
A CHANGELOG-0.43.0.md
A CHANGELOG-0.44.0.md
A CHANGELOG-0.45.0.md
A CHANGELOG-0.46.0.md
A CHANGELOG-0.47.0.md
A CHANGELOG-0.48.0.md
M clear-glass/src/event-taxonomy.js
M clear-glass/src/providers/host.js
M cli/nexus.js
M copilot/adversarial.js
M cortex/boot.js
M cortex/interaction-contract.json
M cortex/memory/table-compactor.js
M cortex/registry-components.js
M cortex/spec/cortex.spec
M cos/cli/commands/create.js
A cos/cli/commands/intent.js
M cos/cli/commands/map.js
M cos/cli/commands/status.js
M cos/event-taxonomy.js
M cos/foundation/event-contracts.js
A cos/foundation/intent.js
M cos/foundation/types.js
M cos/host/gates/compartment.js
M cos/host/index.js
M cos/test/test.js
M cos/testenv/setup-job.js
A cos/workspace/vm-control.js
M docs/2026-10-02-emerge-field-memory-build-phasemap.spec
M docs/2026-10-05-build-from-the-spec-phasemap.spec
M docs/2026-10-05-cos-machines-phasemap.spec
A docs/2026-10-07-compartment-control-and-activity-phasemap.spec
A docs/2026-10-07-heal-nodes-phasemap.spec
A docs/2026-10-07-idearium-one-surface-phasemap.spec
A docs/2026-10-07-ollama-recorder-phasemap.spec
A docs/2026-10-07-runtime-load-phasemap.spec
A docs/2026-10-07-system-expectations-phasemap.spec
A docs/2026-10-07-versionium-releases-phasemap.spec
M docs/CLAUDE.md
M docs/HANDOFF-2026-10-06.md
M docs/SPEC-REGISTRY.spec
M docs/brainos-live-control-panel.spec
M docs/nexstore-writers.yaml
M docs/nexus-repo-compartment-and-rich-dispatch-phasemap.spec
M guardian/jaa-store.js
M guardian/lib/dispatcher.js
M guardian/registry-components.js
M guardian/spec/guardian.spec
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/cli/index.js
A idearium/cli/route-commands.js
A idearium/cli/store-chatter.js
M idearium/event-taxonomy.cjs
M idearium/lib/config-core.cjs
M idearium/repo/build-plan.js
M idearium/repo/index.js
M idearium/repo/snapshot.js
M idearium/repo/spec-plan.js
M idearium/spec/idearium.repo-snapshot.spec
A idearium/ui/css/agent-options.css
M idearium/ui/css/code-surface.css
A idearium/ui/css/repo-tasks.css
M idearium/ui/css/work-surface.css
M idearium/ui/index.html
A idearium/ui/js/agent-options.js
M idearium/ui/js/app.js
M idearium/ui/js/code-surface.js
M idearium/ui/js/living-spec.js
M idearium/ui/js/plan-panel.js
A idearium/ui/js/repo-drawer-views.js
M idearium/ui/js/repo-settings.js
A idearium/ui/js/repo-tasks.js
M idearium/ui/js/work-surface.js
M idearium/ui/settings.html
M intelligence/liminal-space/index.js
A lib/activity-log/compartment.js
M lib/agent-tools/index.js
M lib/agent-tools/tool-catalog.js
M lib/agent-tools/tool-guide.js
M lib/agent-tools/tools/idearium/code.js
A lib/agent-tools/tools/nexus/command.js
A lib/charter.js
M lib/claude-code-backend.js
M lib/context-atlas.js
M lib/cos-bridge.js
M lib/cos-run.js
M lib/fault-log.js
M lib/phase-faults.js
M lib/pipeline-routing.js
A lib/proof-overlay.js
A lib/repo-activity.js
M lib/repo-agent.js
M lib/repo-hat.js
M lib/repo-inject.js
A lib/repo-versions.js
M lib/resource-monitor.js
M lib/version.js
M loom/agent-suite/index.js
M loom/bootstrap.js
A loom/maps/compartment-activity-map.js
M loom/maps/copilot-capability-map.js
A loom/maps/declare-map.js
M loom/maps/one-idearium-map.js
M nexus/autopilot.js
A ollama/commands/get-api-tape-run.command
A ollama/commands/get-api-tape.command
M ollama/config.js
M ollama/interaction-contract.json
M ollama/lib/command-index.js
M ollama/lib/dispatch.js
A ollama/lib/model-inventory.js
M ollama/lib/ollama-client.js
A ollama/lib/tape.js
M ollama/ollama-runtime.js
M ollama/registry-components.js
M ollama/routes/models.js
A ollama/routes/tape.js
M ollama/server.js
M ollama/spec/ollama.spec
M orchestrator/lib/mcp-server.js
M package.json
M tests/modules/_purge-test-rows.js
M tests/modules/jaa-store-multiprocess.test.js
M tests/modules/ollama-command-index.test.js
M tests/modules/run-all.js
M tests/modules/test-agent-feed.test.js
M tests/modules/test-agent-record.test.js
M tests/modules/test-brainos-v2-rebuild.js
M tests/modules/test-c0-cfr-collapse-anchor.test.js
```

75 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.48.0-r2 — snap-0740 — 2026-10-07 14:34:12

- Archive: `nexus-0740_2026-10-07_v0.48.0-r2_main-38.zip` (was `Nexus-main-38.zip`)
- SHA-256: `c83d6ad61b42cffe3bbb90afe2a7501edf4ca6721740bca955871c099934ebcf`, 15.3 MB, downloaded 2026-10-07 14:34:46
- Kind: full
- Commit: `155bd5f131bb10b042a011cc4027e8b0e93559bf`, tag `snap-0740`
- Identical copy: `nexus-0740_2026-10-07_v0.48.0-r2_main-39_dup1.zip` (was `Nexus-main-39.zip`)
- Files in archive: 5467. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 2 | 0 |

```
M docs/2026-10-05-spec-workshop-rebuild-phasemap.spec
M docs/SPEC-REGISTRY.spec
```

