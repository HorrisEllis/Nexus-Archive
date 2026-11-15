# Nexus 0.20.4

| | |
|---|---|
| Built | 2026-08-04 21:01:40 → 2026-08-04 21:01:40 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.20.4 |
| Tag | `v0.20.4` → snap-0329 |
| Full file ledger | [LEDGER-0.20.4.csv](../ledger/LEDGER-0.20.4.csv) |

## Ledger

### Build 0.20.4 — snap-0329 — 2026-08-04 21:01:40

- Archive: `nexus-0329_2026-08-04_v0.20.4.zip` (was `nexus-0.20.4.zip`)
- SHA-256: `ec838127d6b3577d23a7f4cddd5e90b01903ecae9a9446330a06576c8349df7e`, 40.4 MB, downloaded 2026-08-04 22:50:24
- Kind: full
- Commit: `9bea9ff88d1ef2cf5bfc8e8bd27166540c1c7724`, tag `snap-0329`
- Identical copy: `nexus-0329_2026-08-04_v0.20.4_1_dup1.zip` (was `nexus-0.20.4-1.zip`)
- Left out: embedded .git (5910 files, HEAD cca9caca1c24531607555fcc9fc69fff798762a7 (master))
- Files in archive: 3639. Changes against the build before it: **55 added, 38 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 34 | 24 | 0 |
| loom | 6 | 2 | 0 |
| unintegrated | 7 | 1 | 0 |
| tests | 5 | 2 | 0 |
| docs | 2 | 4 | 0 |
| cortex | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tablet | 0 | 1 | 0 |

```
M copilot/server.js
M cortex/intelligence/index.js
A cortex/intelligence/relational-field.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/provider_accounts.json
M data/ledger/cortex/cortex.gaps.list/2026-08-03.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-04.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-05.jsonl
M data/ledger/forge/forge.old/2026-08-03.jsonl
A data/ledger/forge/forge.old/2026-08-04.jsonl
A data/ledger/forge/forge.old/2026-08-05.jsonl
M data/ledger/forge/forge.patch/2026-08-03.jsonl
A data/ledger/forge/forge.patch/2026-08-04.jsonl
A data/ledger/forge/forge.patch/2026-08-05.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-03.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-04.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-05.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-03.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-04.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-05.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-03.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-04.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-05.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-03.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-04.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-05.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-03.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-04.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-05.jsonl
M data/ledger/reflection/reflection.engine/2026-08-03.jsonl
A data/ledger/reflection/reflection.engine/2026-08-04.jsonl
A data/ledger/reflection/reflection.engine/2026-08-05.jsonl
M data/ledger/test/test.echo.ping/2026-08-03.jsonl
A data/ledger/test/test.echo.ping/2026-08-04.jsonl
A data/ledger/test/test.echo.ping/2026-08-05.jsonl
M data/ledger/test/test.event.check/2026-08-03.jsonl
A data/ledger/test/test.event.check/2026-08-04.jsonl
A data/ledger/test/test.event.check/2026-08-05.jsonl
M data/ledger/test/test.widget.panel/2026-08-03.jsonl
A data/ledger/test/test.widget.panel/2026-08-04.jsonl
A data/ledger/test/test.widget.panel/2026-08-05.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-03.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-04.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-05.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-03.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-04.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-05.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-03.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-04.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-05.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-03.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-04.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-05.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-03.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-04.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-05.jsonl
M data/loom/loom_events.buffer.jsonl
A docs/RELATIONAL-FIELD-PHASEMAP.spec
M docs/SPEC-REGISTRY.md
M docs/copilot.spec
M docs/nexus-tablet.spec
M docs/rfr2.spec
A docs/snapshot-trigger-phasemap.spec
M lib/version.js
M loom/bootstrap.js
M loom/data/registry.json
A loom/maps/observability-map.js
A loom/maps/relational-field-map.js
A loom/scanners/capability-map.js
A loom/scanners/dangling-report.js
A loom/scanners/source-map.js
A loom/scanners/spec-map.js
M package.json
M tablet/homepage.html
M tests/modules/run-all.js
A tests/modules/test-capability-map.js
A tests/modules/test-observability-map.js
A tests/modules/test-relational-field.js
A tests/modules/test-source-map-scanner.js
A tests/modules/test-spec-map.js
M tests/modules/test-tablet-homepage.js
A unintegrated/2026-08-04-eravos-field-pattern/README.md
A unintegrated/2026-08-04-eravos-field-pattern/alk/alk-boot.js
A unintegrated/2026-08-04-eravos-field-pattern/alk/dimensions.js
A unintegrated/2026-08-04-eravos-field-pattern/alk/signal-vector.js
A unintegrated/2026-08-04-eravos-field-pattern/emergence-field-bridge.excerpt.js
A unintegrated/2026-08-04-eravos-field-pattern/emergence-field.contract.md
A unintegrated/2026-08-04-eravos-field-pattern/eravos-options.reference.json
M unintegrated/README.md
```

