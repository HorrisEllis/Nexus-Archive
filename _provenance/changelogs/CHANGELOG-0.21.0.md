# Nexus 0.21.0

| | |
|---|---|
| Built | 2026-08-06 20:47:46 → 2026-08-06 20:47:46 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.21.0 |
| Tag | `v0.21.0` → snap-0330 |
| Full file ledger | [LEDGER-0.21.0.csv](../ledger/LEDGER-0.21.0.csv) |

## Ledger

### Build 0.21.0 — snap-0330 — 2026-08-06 20:47:46

- Archive: `nexus-0330_2026-08-06_v0.21.0_3.zip` (was `nexus (3).zip`)
- SHA-256: `d47e027f5defb08c798cb012fac8b799edbdf2c3b7b160db0064e70b70b573a8`, 35.1 MB, downloaded 2026-08-06 20:51:54
- Kind: full
- Commit: `11c5d35212dec06f9f0c669a6ec6b2fdd067f718`, tag `snap-0330`
- Left out: embedded .git (5706 files, HEAD 80deb87be15479b8482587fdac17ec1264520ee4 (master))
- Files in archive: 3629. Changes against the build before it: **21 added, 32 modified, 31 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 17 | 23 | 17 |
| unintegrated | 0 | 1 | 7 |
| loom | 0 | 3 | 3 |
| tests | 1 | 2 | 3 |
| lib | 2 | 1 | 0 |
| docs | 0 | 1 | 1 |
| (root) | 0 | 1 | 0 |
| ui | 1 | 0 | 0 |

```
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/ledger/cortex/cortex.gaps.list/2026-08-04.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-08-05.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-07.jsonl
M data/ledger/forge/forge.old/2026-08-04.jsonl
D data/ledger/forge/forge.old/2026-08-05.jsonl
A data/ledger/forge/forge.old/2026-08-07.jsonl
M data/ledger/forge/forge.patch/2026-08-04.jsonl
D data/ledger/forge/forge.patch/2026-08-05.jsonl
A data/ledger/forge/forge.patch/2026-08-07.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-04.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-08-05.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-07.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-04.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-08-05.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-07.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-04.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-08-05.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-07.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-04.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-08-05.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-07.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-04.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-08-05.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-07.jsonl
M data/ledger/reflection/reflection.engine/2026-08-04.jsonl
D data/ledger/reflection/reflection.engine/2026-08-05.jsonl
A data/ledger/reflection/reflection.engine/2026-08-07.jsonl
M data/ledger/test/test.echo.ping/2026-08-04.jsonl
D data/ledger/test/test.echo.ping/2026-08-05.jsonl
A data/ledger/test/test.echo.ping/2026-08-07.jsonl
M data/ledger/test/test.event.check/2026-08-04.jsonl
D data/ledger/test/test.event.check/2026-08-05.jsonl
A data/ledger/test/test.event.check/2026-08-07.jsonl
M data/ledger/test/test.widget.panel/2026-08-04.jsonl
D data/ledger/test/test.widget.panel/2026-08-05.jsonl
A data/ledger/test/test.widget.panel/2026-08-07.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-04.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-08-05.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-07.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-04.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-08-05.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-07.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-04.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-08-05.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-07.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-04.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-08-05.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-07.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-04.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-08-05.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-07.jsonl
M data/loom/loom_events.buffer.jsonl
D docs/RELATIONAL-FIELD-PHASEMAP.spec
M docs/SPEC-REGISTRY.md
A lib/gemini-toolbox/index.js
A lib/gemini-toolbox/routes.js
M lib/version.js
M loom/bootstrap.js
M loom/data/registry.json
M loom/maps/observability-map.js
D loom/maps/relational-field-map.js
D loom/scanners/dangling-report.js
D loom/scanners/source-map.js
M package.json
M tests/modules/run-all.js
D tests/modules/test-capability-map.js
A tests/modules/test-gemini-toolbox.js
M tests/modules/test-relational-field.js
D tests/modules/test-source-map-scanner.js
D tests/modules/test-spec-map.js
A ui/agents/gemini/code-suite.html
D unintegrated/2026-08-04-eravos-field-pattern/README.md
D unintegrated/2026-08-04-eravos-field-pattern/alk/alk-boot.js
D unintegrated/2026-08-04-eravos-field-pattern/alk/dimensions.js
D unintegrated/2026-08-04-eravos-field-pattern/alk/signal-vector.js
D unintegrated/2026-08-04-eravos-field-pattern/emergence-field-bridge.excerpt.js
D unintegrated/2026-08-04-eravos-field-pattern/emergence-field.contract.md
D unintegrated/2026-08-04-eravos-field-pattern/eravos-options.reference.json
M unintegrated/README.md
```

