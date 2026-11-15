# Nexus 0.60.23

| | |
|---|---|
| Built | 2026-10-13 05:47:24 → 2026-10-13 05:47:24 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.23 |
| Tag | `v0.60.23` → snap-0752 |
| Full file ledger | [LEDGER-0.60.23.csv](../ledger/LEDGER-0.60.23.csv) |

## Ledger

### Build 0.60.23 — snap-0752 — 2026-10-13 05:47:24

- Archive: `nexus-0752_2026-10-13_v0.60.23_claude-quirky-thompson-kz9xvs-1.zip` (was `Nexus-claude-quirky-thompson-kz9xvs-1.zip`)
- SHA-256: `51d7799fbe855f5b23f6a662c0a7a2af3ccb4f677d07af347ee115e7081df91e`, 16.4 MB, downloaded 2026-10-13 05:50:01
- Kind: full
- Commit: `d1f228bdff7cad57184ec6450e9d98811ae0f247`, tag `snap-0752`
- Files in archive: 5673. Changes against the build before it: **87 added, 36 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| architect | 57 | 0 | 0 |
| tests | 7 | 6 | 0 |
| idearium | 1 | 9 | 1 |
| (root) | 8 | 2 | 0 |
| lib | 2 | 7 | 0 |
| docs | 3 | 5 | 0 |
| _archive | 4 | 0 | 0 |
| cos | 0 | 3 | 0 |
| .claude | 2 | 0 | 0 |
| clear-glass | 0 | 2 | 0 |
| cortex | 2 | 0 | 0 |
| data | 1 | 0 | 1 |
| loom | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
A .claude/settings.local.json
A .claude/skills/james-brooks
M CHANGELOG-0.60.12.md
A CHANGELOG-0.60.14.md
A CHANGELOG-0.60.15.md
A CHANGELOG-0.60.16.md
A CHANGELOG-0.60.17.md
A CHANGELOG-0.60.18.md
A CHANGELOG-0.60.19.md
A CHANGELOG-0.60.20.md
A CHANGELOG-0.60.21.md
A _archive/2026-10-09-declutter/scripts/_register-session-hooks.js
A _archive/2026-10-09-declutter/ui/pipeline-tutorial.js
A _archive/2026-10-09-declutter/ui/ui-pulse.js
A _archive/README-v5.1.0-superseded-2026-10-11.md
A architect/compile-route.js
A architect/config.js
A architect/data/event_log.jsonl
A architect/data/gaps.jsonl
A architect/data/node-index/nodes_capability.json
A architect/data/node-index/nodes_capability_ledger.json
A architect/data/node-index/nodes_command.json
A architect/data/node-index/nodes_command_ledger.json
A architect/data/node-index/nodes_system.json
A architect/data/node-index/nodes_system_ledger.json
A architect/data/node-index/settings.json
A architect/data/nodes/capability/architect.blueprint.diff.capability
A architect/data/nodes/capability/architect.blueprint.history.capability
A architect/data/nodes/capability/architect.blueprint.list.capability
A architect/data/nodes/capability/architect.blueprint.route.capability
A architect/data/nodes/capability/architect.blueprint.scan.capability
A architect/data/nodes/capability/architect.contract.capability
A architect/data/nodes/capability/architect.health.capability
A architect/data/nodes/capability/architect.hook.deprecate.capability
A architect/data/nodes/capability/architect.hook.get.capability
A architect/data/nodes/capability/architect.hook.register.capability
A architect/data/nodes/capability/architect.hook.update.capability
A architect/data/nodes/capability/architect.hook.wire.capability
A architect/data/nodes/capability/architect.hooks.check.capability
A architect/data/nodes/capability/architect.hooks.graph.capability
A architect/data/nodes/capability/architect.hooks.list.capability
A architect/data/nodes/capability/architect.hooks.validate.capability
A architect/data/nodes/capability/architect.map.capability
A architect/data/nodes/component/architect.blueprint.list.component
A architect/data/nodes/component/architect.blueprint.scan.component
A architect/data/nodes/component/architect.health.component
A architect/data/nodes/component/architect.hook.get.component
A architect/data/nodes/component/architect.hook.update.component
A architect/data/nodes/component/architect.hooks.validate.component
A architect/data/nodes/component/architect.map.component
A architect/data/topology_maps.jsonl
A architect/interaction-contract.json
A architect/output/.gitkeep
A architect/package.json
A architect/registry-components.js
A architect/schemas/index.js
A architect/schemas/schema.capability
A architect/schemas/schema.command
A architect/schemas/schema.component
A architect/schemas/schema.hook
A architect/schemas/schema.node
A architect/schemas/schema.system
A architect/schemas/schema.wire
A architect/service.js
A architect/spec/architect.node-taxonomy.md
A architect/spec/architect.spec
A architect/src/spec/Blueprint.js
A architect/src/ui/alk-lattice.html
A architect/src/ui/arch-builder.html
A architect/src/ui/architect_universe.svg
A architect/src/ui/layered-snr-gates-axioms.svg
A architect/src/ui/spec-builder.html
M clear-glass/renderer/settings/sections/providers.js
M clear-glass/src/ipc/bridge.js
A cortex/core/raid/contract-adapters.js
A cortex/core/raid/contract-gates.js
M cos/compartment/qemu-runtime.js
M cos/spec/check-catalogue.spec
M cos/testenv/provision.js
D data/guardian/memory/settings.4393.jsonl
A data/vector-index/index.json
M docs/2026-10-12-request-spine-phasemap.spec
A docs/2026-10-13-gates-that-learn-and-priorities-phasemap.spec
A docs/2026-10-13-nexus-memory-gates-and-contract-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/atlases/idearium-atlas.md
A docs/contracts/ct0-executable-contracts.contract
M docs/nexstore-writers.yaml
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/lib/config-core.cjs
A idearium/ui/_archive/architect-0.60.18.html
D idearium/ui/architect.html
M idearium/ui/index.html
M idearium/ui/js/app.js
M idearium/ui/js/plan-panel.js
M idearium/ui/js/repo-tasks.js
M idearium/ui/js/workshop.js
M idearium/ui/settings.html
A lib/lean-mode.js
M lib/micro-http.js
M lib/phase-plan.js
M lib/pipeline-routing.js
M lib/reasoning-route.js
M lib/repo-activity.js
M lib/repo-agent.js
A lib/run-watch.js
M lib/version.js
M loom/maps/raid-events-and-tools-map.js
M nexus/autopilot.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-architect.test.js
A tests/modules/test-cg-command-index.test.js
M tests/modules/test-compartment-window.test.js
A tests/modules/test-contract-adapters.test.js
A tests/modules/test-contract-ct0-self.test.js
A tests/modules/test-contract-gates.test.js
A tests/modules/test-contract-phase-build.test.js
A tests/modules/test-lean-mode.test.js
M tests/modules/test-nexus-atlas-and-glass.test.js
M tests/modules/test-reasoning-route.test.js
A tests/modules/test-run-watch.test.js
M tests/modules/test-synthesis-zoom-versionium.test.js
```

