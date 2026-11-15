# Nexus 0.39.151

| | |
|---|---|
| Built | 2026-09-19 04:47:20 → 2026-09-19 04:47:20 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.151 |
| Tag | `v0.39.151` → snap-0607 |
| Full file ledger | [LEDGER-0.39.151.csv](../ledger/LEDGER-0.39.151.csv) |

## Ledger

### Build 0.39.151 — snap-0607 — 2026-09-19 04:47:20

- Archive: `nexus-0607_2026-09-19_v0.39.151.zip` (was `Nexus v0.39.151.zip`)
- SHA-256: `06b551fe4cb392c49cfadd1c7032b0c41195097e5b5e9a3faea7851fb7ba44cc`, 110.4 MB, downloaded 2026-09-19 05:00:37
- Kind: full
- Commit: `7f0201dbf93a5638ac9d4d184cd506a421e0dd8f`, tag `snap-0607`
- Left out: embedded .git (4623 files, HEAD 0e32204ee785ec75937a361d8b6ca969fa2d6db9 (master))
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 3877. Changes against the build before it: **18 added, 57 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 4 | 9 | 0 |
| guardian | 3 | 8 | 0 |
| intelligence | 3 | 6 | 0 |
| tests | 3 | 6 | 0 |
| copilot | 0 | 5 | 0 |
| orchestrator | 0 | 5 | 0 |
| cortex | 0 | 4 | 0 |
| docs | 2 | 2 | 0 |
| hooks | 1 | 3 | 0 |
| data | 2 | 0 | 0 |
| nexus-healer | 0 | 2 | 0 |
| scripts | 0 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |
| contracts | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| versionium | 0 | 1 | 0 |

```
M contracts/nexus-interaction-contract.js
M copilot/analysis.js
M copilot/intuition.js
M copilot/lib/copilot-context.js
M copilot/recursive-diagnose.js
M copilot/server.js
M cortex/boot.js
M cortex/cortex-v2.js
M cortex/interaction-contract.json
M cortex/registry-components.js
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_stats.json
M docs/2026-09-02-versionium-sovereign-and-cleanup-phasemap.spec
A docs/2026-09-19-cortex-to-intelligence-and-versionium-consolidation-phasemap.spec
A docs/HANDOFF-2026-09-19-cortex-intelligence-move.md
M docs/NEXUS-INTELLIGENCE-LAYER-INDEX.md
A guardian/data/nodes/command/get-api-chat-index.command
A guardian/lib/agent-model-nodes.js
A guardian/lib/command-registry.js
M guardian/lib/ncp-handler.js
M guardian/nexus-hey-claude.user.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M hooks/cortex.hooks.js
M hooks/guardian.hooks.js
M hooks/index.js
A hooks/intelligence.hooks.js
M intelligence/cfr/ledger.js
M intelligence/config.js
A intelligence/field-provider.js
M intelligence/index.js
A intelligence/interaction-contract.json
M intelligence/liminal-space/index.js
M intelligence/registry-components.js
A intelligence/routes.js
M intelligence/server.js
A lib/agent-identity.js
A lib/agent-model.js
M lib/agent-tools/tools/diagnostic/nexus-heal.js
M lib/agent-tools/tools/faculty/faculty-tools.js
M lib/agent-tools/tools/query/nexus-status.js
M lib/agent-tools/tools/query/query-intelligence.js
A lib/chat-index.js
M lib/chat-logger.js
M lib/diagnostic-report.js
M lib/nerve/index.js
M lib/node-export.js
A lib/node-schemas/schema.agent_model
M lib/version.js
M loom/maps/copilot-capability-map.js
M nexus-healer/api/index.js
M nexus-healer/interaction-contract.json
M nexus/nexus-cfr-influence.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/hot-loader.js
M orchestrator/lib/mcp-server.js
M orchestrator/orchestrator.config.json
M orchestrator/orchestrator.js
M package.json
M scripts/analyze-methodless-routes.js
M tests/modules/intuition-upgrade.test.js
M tests/modules/mastermind-upgrade.test.js
M tests/modules/orchestrator-cli.test.js
A tests/modules/test-cfr-field-authority.js
M tests/modules/test-intelligence-core-wired.js
A tests/modules/test-intelligence-faculties-move.js
A tests/modules/test-intelligence-organs-move.js
M tests/modules/test-liminal-space.js
M tests/modules/test-vsb1-versionium-split-brain-fix.js
M ui/contracts.js
M versionium/server.js
```

