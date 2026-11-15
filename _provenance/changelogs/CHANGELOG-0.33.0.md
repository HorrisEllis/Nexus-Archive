# Nexus 0.33.0

| | |
|---|---|
| Built | 2026-08-07 22:11:04 → 2026-08-08 02:00:38 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.33.0 |
| Tag | `v0.33.0` → snap-0336 |
| Full file ledger | [LEDGER-0.33.0.csv](../ledger/LEDGER-0.33.0.csv) |

## Ledger

### Build 0.33.0-r1 — snap-0335 — 2026-08-07 22:11:04

- Archive: `nexus-0335_2026-08-07_v0.33.0-r1_10.zip` (was `nexus (10).zip`)
- SHA-256: `9e84b337c8acf38b2e1e3846db4600b2eeb37c19c370abca587e009ff2ba6199`, 36.8 MB, downloaded 2026-08-07 22:44:51
- Kind: full
- Commit: `6cecc42602c18f44b65b73f4505b57a339a80d7d`, tag `snap-0335`
- Left out: embedded .git (6102 files, HEAD d2c5707b3274386612aec5780a9226ba9bc4ecf2 (master))
- Files in archive: 3693. Changes against the build before it: **40 added, 37 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 23 | 28 | 0 |
| lib | 7 | 3 | 0 |
| tests | 6 | 1 | 0 |
| docs | 2 | 3 | 0 |
| copilot | 2 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A copilot/lib/grammar-router.js
A copilot/lib/self-model.js
M copilot/server.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/tool_index.json
M data/ledger/bridge/b.y/2026-08-07.jsonl
A data/ledger/bridge/b.y/2026-08-08.jsonl
M data/ledger/bridge/b/2026-08-07.jsonl
A data/ledger/bridge/b/2026-08-08.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-07.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-08.jsonl
M data/ledger/cortex/cortex.raid/2026-08-07.jsonl
A data/ledger/cortex/cortex.raid/2026-08-08.jsonl
M data/ledger/forge/forge.old/2026-08-07.jsonl
A data/ledger/forge/forge.old/2026-08-08.jsonl
M data/ledger/forge/forge.patch/2026-08-07.jsonl
A data/ledger/forge/forge.patch/2026-08-08.jsonl
M data/ledger/guardian/g.x/2026-08-07.jsonl
A data/ledger/guardian/g.x/2026-08-08.jsonl
M data/ledger/guardian/g/2026-08-07.jsonl
A data/ledger/guardian/g/2026-08-08.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-07.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-07.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-07.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-07.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-07.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-08.jsonl
M data/ledger/reflection/reflection.engine/2026-08-07.jsonl
A data/ledger/reflection/reflection.engine/2026-08-08.jsonl
M data/ledger/test/test.echo.ping/2026-08-07.jsonl
A data/ledger/test/test.echo.ping/2026-08-08.jsonl
M data/ledger/test/test.event.check/2026-08-07.jsonl
A data/ledger/test/test.event.check/2026-08-08.jsonl
M data/ledger/test/test.widget.panel/2026-08-07.jsonl
A data/ledger/test/test.widget.panel/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-07.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-07.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-07.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-07.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-07.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-08.jsonl
M docs/SPEC-REGISTRY.md
A docs/agent-intelligence-loop-phasemap.spec
M docs/copilot.spec
A docs/gemini-multiagent-coding-phasemap.spec
M docs/nexus-live-mind-phasemap.spec
A lib/agent-pull.js
M lib/agent-router.js
A lib/chunk-service.js
A lib/fs-tree.js
A lib/gemini-toolbox/agent-contracts.js
M lib/gemini-toolbox/index.js
A lib/gemini-toolbox/injection.js
A lib/line-edit.js
A lib/tool-index.js
M lib/version.js
M loom/maps/observability-map.js
M tests/modules/run-all.js
A tests/modules/test-agnostic-lib-tools.js
A tests/modules/test-ap1-agent-pull.js
A tests/modules/test-p1-agent-contracts.js
A tests/modules/test-p2-injection.js
A tests/modules/test-p5-grammar-router.js
A tests/modules/test-p5p6-self-model.js
```

### Build 0.33.0-r2 — snap-0336 — 2026-08-08 02:00:38

- Archive: `nexus-0336_2026-08-08_v0.33.0-r2_patched.zip` (was `nexus-0.33.0-patched.zip`)
- SHA-256: `7dfffebb70b058c67fc4a4c0e7a0b2ee018fadbb222bfdcf1ca57bd7aa4a88be`, 17.2 MB, downloaded 2026-08-08 02:09:38
- Kind: full
- Commit: `c357040bd6d5b922bfe1e3d47500acae96d94373`, tag `snap-0336`
- Files in archive: 3714. Changes against the build before it: **21 added, 52 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 5 | 48 | 0 |
| idearium | 12 | 0 | 0 |
| loom | 2 | 2 | 0 |
| tests | 1 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M cortex/data/baseline-events.ndjson
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/bep_patterns.json
M data/cortex/memory/component_ledger.json
A data/cortex/memory/crystals.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/guardian_gaps.json
M data/cortex/memory/guardian_settings.json
M data/cortex/memory/idearium_spec_chunks.json
M data/cortex/memory/idearium_spec_manifests.json
M data/cortex/memory/interstitial_spaces.json
M data/cortex/memory/poll_log.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/remediation.jsonl
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/idearium/baseline-events.ndjson
M data/ledger/bridge/b.y/2026-08-08.jsonl
M data/ledger/bridge/b/2026-08-08.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-08.jsonl
M data/ledger/cortex/cortex.raid/2026-08-08.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-08.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-08.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-08.jsonl
M data/ledger/forge/forge.old/2026-08-08.jsonl
M data/ledger/forge/forge.patch/2026-08-08.jsonl
M data/ledger/guardian/g.x/2026-08-08.jsonl
M data/ledger/guardian/g/2026-08-08.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-08.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-08.jsonl
M data/ledger/reflection/reflection.engine/2026-08-08.jsonl
M data/ledger/test/test.echo.ping/2026-08-08.jsonl
M data/ledger/test/test.event.check/2026-08-08.jsonl
M data/ledger/test/test.widget.panel/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-08.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-08.jsonl
M data/loom/loom_events.buffer.jsonl
M data/orchestrator/baseline-events.ndjson
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/00-meta-1cacd291.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/01-purpose-8485b4e8.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/02-axioms-429e212f.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/03-schema-24cb8aab.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/04-api-882c2136.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/05-events-7365d6a2.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/06-integration-5000448e.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/07-failure_modes-7cd7cb86.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/08-build_order-aa5e82d5.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/09-tests-41d479de.md
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/c2b42683-b5b1-48cb-855d-987a23e71a45.spec
A idearium/data/specs/c2b42683-b5b1-48cb-855d-987a23e71a45/manifest.json
A lib/ledger-tail.js
M loom/bootstrap.js
M loom/data/registry.json
A loom/scanners/dangling-report.js
A loom/scanners/source-map.js
A tests/modules/ledger-tail.test.js
M tests/modules/run-all.js
```

