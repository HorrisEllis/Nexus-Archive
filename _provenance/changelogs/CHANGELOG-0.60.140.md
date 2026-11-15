# Nexus 0.60.140

**NEXUS 0.60.140 — the projects folder out of Idearium, until Idearium has sync**

| | |
|---|---|
| Built | 2026-10-17 14:10:18 → 2026-10-17 14:10:18 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.140 |
| Tag | `v0.60.140` → snap-0762 |
| Full file ledger | [LEDGER-0.60.140.csv](../ledger/LEDGER-0.60.140.csv) |

## Release notes — `CHANGELOG-0.60.140.md`

Copied unchanged from the build.

### NEXUS 0.60.140 — the projects folder out of Idearium, until Idearium has sync

James, 2026-10-17: "im saying add a sync feature to idearium. remove it from idearium unntil then"

#### Context

0.60.139 put a "Projects folder" section in Idearium's My projects: scan D:\Projects, tick projects, bring each in as a zip.
Asked about it, James first said "no. ill import them" and "no with the idearium. make it a feature if you want to do that". The
coder read that as "it's already a feature" (cos-app phasemap addendum b). That reading was wrong. What he wants is a sync
feature in Idearium, and the folder feature gone until then. The call is his.

#### What changed

- **Archived, not deleted (§0.3).** `idearium/lib/projects-folder.cjs` and `tests/modules/test-projects-folder.test.js` are now
  in `_archive/2026-10-17-projects-folder-until-sync/`, with a README.
- **Removed from Idearium:**
  - the routes GET/POST `/api/my-projects/folder` and POST `/api/my-projects/folder/import`;
  - the commands `projects folder` and `projects import`;
  - the "Projects folder" button and section in My projects;
  - its run-all row and its loom wires.
  All of it is recoverable from commit ed82dea.
- **Mapped, not built:** COSA16 Idearium sync, in `docs/2026-10-15-cos-app-phasemap.spec` addendum (c). It keeps a project in
  Idearium in step with its folder on disk, with the archived scan and zip as its substrate. The coder's reading of "sync" is
  marked to confirm.

#### Proof

- The diff removes exactly what 0.60.139 added in api/index.js, route-commands.js, projects.js, run-all.js and run-state-map.js.
- `node --check idearium/ui/js/projects.js` is clean, and route-commands loads with 116 rows.

## Ledger

### Build 0.60.140 — snap-0762 — 2026-10-17 14:10:18

- Archive: `nexus-0762_2026-10-17_v0.60.140.zip` (was `nexus-0.60.140.zip`)
- SHA-256: `7394ee5156900884c0607a2f1bf050a364ad3794b54d2b515cdc5a803bc4b293`, 24 MB, downloaded 2026-10-17 14:19:55
- Kind: full
- Commit: `038421243fe597d771088f911a3c6a98e52a4455`, tag `snap-0762`
- Files in archive: 6125. Changes against the build before it: **61 added, 49 modified, 39 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| diagnostic | 29 | 2 | 2 |
| nexus-healer | 0 | 0 | 33 |
| _archive | 23 | 0 | 0 |
| tests | 2 | 11 | 1 |
| cos | 1 | 9 | 0 |
| docs | 0 | 8 | 1 |
| lib | 1 | 6 | 2 |
| (root) | 5 | 2 | 0 |
| loom | 0 | 3 | 0 |
| idearium | 0 | 2 | 0 |
| clear-glass | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| contracts | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
A CHANGELOG-0.60.136.md
A CHANGELOG-0.60.137.md
A CHANGELOG-0.60.138.md
A CHANGELOG-0.60.139.md
A CHANGELOG-0.60.140.md
M VERSION
A _archive/2026-10-17-nexus-healer-into-diagnostic/README.md
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_capability.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_capability_ledger.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_command.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_command_ledger.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_system.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/nodes_system_ledger.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/node-index/settings.json
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/capability/nexus-healer.archive.capability
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/capability/nexus-healer.evaluate.capability
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/capability/nexus-healer.list.capability
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/capability/nexus-healer.merge.capability
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/capability/nexus-healer.propose.capability
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/command/nexus-healer.archive.command
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/command/nexus-healer.evaluate.command
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/command/nexus-healer.list.command
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/command/nexus-healer.merge.command
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/command/nexus-healer.propose.command
A _archive/2026-10-17-nexus-healer-into-diagnostic/data/nodes/system/nexus-healer.system
A _archive/2026-10-17-nexus-healer-into-diagnostic/nexus-healer.interaction-contract.json
A _archive/2026-10-17-projects-folder-until-sync/README.md
A _archive/2026-10-17-projects-folder-until-sync/projects-folder.cjs
A _archive/2026-10-17-projects-folder-until-sync/test-projects-folder.test.js
M clear-glass/src/releases/deliver.js
M cli/nexus.js
M contracts/drawbridge-baseline.json
A cos/app/app-update.js
M cos/app/controller.js
M cos/app/desktop/main.js
M cos/app/desktop/preload.js
M cos/app/desktop/ui/app.js
M cos/app/version.js
M cos/event-taxonomy.js
M cos/foundation/event-contracts.js
M cos/host/gates/compartment.js
M cos/host/index.js
A diagnostic/cli.js
A diagnostic/compartment.json
A diagnostic/config.js
A diagnostic/contracts/handshake.js
A diagnostic/diagnostic.config.json
A diagnostic/event-taxonomy.js
A diagnostic/healer/api/index.js
A diagnostic/healer/cli/index.js
M diagnostic/interaction-contract.json
A diagnostic/lib/diagnostic-contract.js
A diagnostic/lib/heal-loop.js
A diagnostic/lib/pulse-watch.js
A diagnostic/lib/wire-integrity.js
M diagnostic/nexus-diagnostic.js
D diagnostic/nexus-heal-loop.js
A diagnostic/registry-components.js
A diagnostic/schemas/index.js
A diagnostic/schemas/schema.capability
A diagnostic/schemas/schema.command
A diagnostic/schemas/schema.component
A diagnostic/schemas/schema.healer_proposal
A diagnostic/schemas/schema.hook
A diagnostic/schemas/schema.node
A diagnostic/schemas/schema.system
A diagnostic/schemas/schema.wire
A diagnostic/server.js
A diagnostic/spec/diagnostic.node-taxonomy.md
A diagnostic/spec/diagnostic.spec
A diagnostic/spec/healer.node-taxonomy.md
A diagnostic/spec/healer.spec.md
A diagnostic/tests/shape.test.js
A diagnostic/tests/test-pulse-watch.test.js
D diagnostic/wire-integrity.js
M docs/2026-10-15-cos-app-phasemap.spec
M docs/2026-10-17-decisions-by-the-axioms.spec
M docs/2026-10-17-infrastructure-migration-phasemap.spec
M docs/2026-10-17-pieces-not-order-phasemap.spec
M docs/2026-10-17-system-drawbridge-phasemap.spec
M docs/CLAUDE.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
D docs/diagnostic.spec
M hooks/orchestrator.hooks.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M lib/agent-tools/tools/diagnostic/nexus-heal.js
M lib/agent-tools/tools/query/nexus-status.js
M lib/cos-bridge.js
D lib/diagnostic-contract.js
D lib/pulse-watch.js
A lib/system-shape.js
M lib/system-store.js
M lib/vector-memory.js
M lib/version.js
M loom/maps/run-state-map.js
M loom/scanners/capability-map.js
M loom/scanners/closed-door.js
D nexus-healer/api/index.js
D nexus-healer/cli/index.js
D nexus-healer/data/node-index/nodes_capability.json
D nexus-healer/data/node-index/nodes_capability_ledger.json
D nexus-healer/data/node-index/nodes_command.json
D nexus-healer/data/node-index/nodes_command_ledger.json
D nexus-healer/data/node-index/nodes_system.json
D nexus-healer/data/node-index/nodes_system_ledger.json
D nexus-healer/data/node-index/settings.json
D nexus-healer/data/nodes/capability/nexus-healer.archive.capability
D nexus-healer/data/nodes/capability/nexus-healer.evaluate.capability
D nexus-healer/data/nodes/capability/nexus-healer.list.capability
D nexus-healer/data/nodes/capability/nexus-healer.merge.capability
D nexus-healer/data/nodes/capability/nexus-healer.propose.capability
D nexus-healer/data/nodes/command/nexus-healer.archive.command
D nexus-healer/data/nodes/command/nexus-healer.evaluate.command
D nexus-healer/data/nodes/command/nexus-healer.list.command
D nexus-healer/data/nodes/command/nexus-healer.merge.command
D nexus-healer/data/nodes/command/nexus-healer.propose.command
D nexus-healer/data/nodes/system/nexus-healer.system
D nexus-healer/docs/nexus-healer.spec.md
D nexus-healer/interaction-contract.json
D nexus-healer/registry-components.js
D nexus-healer/schemas/index.js
D nexus-healer/schemas/schema.capability
D nexus-healer/schemas/schema.command
D nexus-healer/schemas/schema.component
D nexus-healer/schemas/schema.healer_proposal
D nexus-healer/schemas/schema.hook
D nexus-healer/schemas/schema.node
D nexus-healer/schemas/schema.system
D nexus-healer/schemas/schema.wire
D nexus-healer/spec/nexus-healer.node-taxonomy.md
M orchestrator/orchestrator.js
M package.json
M scripts/build-cos-app.js
M tests/modules/run-all.js
M tests/modules/test-adversarial-sim.js
A tests/modules/test-cos-app-self-update.test.js
M tests/modules/test-cos-compartment-template.test.js
M tests/modules/test-dangling-hooks-and-idearium-load.test.js
M tests/modules/test-drawbridge-registry.test.js
M tests/modules/test-health-authority.js
M tests/modules/test-intelligence-organs-move.js
D tests/modules/test-pulse-watch.test.js
M tests/modules/test-release-deliver.test.js
M tests/modules/test-rfr2-cjs.js
M tests/modules/test-sovereign-systems.test.js
A tests/modules/test-system-shape.test.js
M tests/modules/test-system-tunnel.test.js
```

