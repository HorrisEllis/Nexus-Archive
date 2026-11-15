# Nexus 0.39.0

| | |
|---|---|
| Built | 2026-08-08 12:04:28 → 2026-08-27 20:27:04 |
| Builds on the main line | 105 |
| Other archives filed here | 4 |
| Versions the builds claimed | 0.1.0, 0.39.0, 0.39.5 |
| Tag | `v0.39.0` → snap-0447 |
| Full file ledger | [LEDGER-0.39.0.csv](../ledger/LEDGER-0.39.0.csv) |

## Ledger

### Build 0.39.0-r1 — snap-0339 — 2026-08-08 12:04:28

- Archive: `nexus-0339_2026-08-08_v0.39.0-r1_13.zip` (was `nexus (13).zip`)
- SHA-256: `ec0608af8391e311d507d69dacd5cf1931abd419194d2605ce089d60f0655419`, 38.6 MB, downloaded 2026-08-08 13:28:47
- Kind: full
- Commit: `10a667fdf461d59dffdb70c4332ad78d33739fc0`, tag `snap-0339`
- Identical copy: `nexus-0339_2026-08-08_v0.39.0-r1_14_dup1.zip` (was `nexus (14).zip`)
- Left out: embedded .git (6367 files, HEAD 0356999fa7776e3770e39b817c2a9cdab27a2eec (master))
- Files in archive: 3710. Changes against the build before it: **13 added, 36 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 28 | 0 |
| docs | 1 | 2 | 4 |
| tests | 3 | 2 | 0 |
| _archive | 4 | 0 | 0 |
| lib | 3 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
A _archive/duplicate-docs/NEXUS-PIPELINE-SPEC-2026-07-07 (1).md
A _archive/duplicate-docs/NEXUS-PIPELINE-SPEC-2026-07-07 (2).md
A _archive/duplicate-docs/NEXUS-PIPELINE-SPEC-2026-07-07(1).md
A _archive/duplicate-docs/guardian-server(1).js
M autopilot.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/bep_patterns.json
M data/cortex/memory/component_ledger.json
M data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/scheduled_tasks.json
M data/ledger/bridge/b.y/2026-08-08.jsonl
M data/ledger/bridge/b/2026-08-08.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-08.jsonl
M data/ledger/cortex/cortex.raid/2026-08-08.jsonl
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
D docs/NEXUS-PIPELINE-SPEC-2026-07-07 (1).md
D docs/NEXUS-PIPELINE-SPEC-2026-07-07 (2).md
D docs/NEXUS-PIPELINE-SPEC-2026-07-07(1).md
M docs/SPEC-REGISTRY.md
A docs/copilot-autonomous-phasemap.spec
D docs/guardian-server(1).js
M docs/nexus-live-mind-phasemap.spec
A lib/autopilot-intelligence.js
A lib/nexus-cli-interface.js
A lib/scheduler.js
M lib/version.js
M loom/maps/observability-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-autopilot-intelligence.js
A tests/modules/test-cli-interface.js
M tests/modules/test-guardian-cfr-consolidation.js
A tests/modules/test-scheduler.js
```

### Build 0.39.0-r2 — snap-0340 — 2026-08-08 16:56:12

- Archive: `nexus-0340_2026-08-08_v0.39.0-r2_full.zip` (was `nexus-full-2026-08-08.zip`)
- SHA-256: `2edaf610c49ff2e93145060dd82f18f1d87f72138b9a6600b81d246c9c617346`, 38.6 MB, downloaded 2026-08-08 17:06:56
- Kind: full
- Commit: `fa33a6cde68ab4b0edefbd5bd3c8d7f534c324c9`, tag `snap-0340`
- Left out: embedded .git (6367 files, HEAD 0356999fa7776e3770e39b817c2a9cdab27a2eec (master))
- Files in archive: 3719. Changes against the build before it: **9 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom | 1 | 4 | 0 |
| lib | 4 | 0 | 0 |
| tests | 4 | 0 | 0 |
| docs | 0 | 3 | 0 |

```
M docs/SPEC-REGISTRY.md
M docs/copilot-autonomous-phasemap.spec
M docs/loom-phasemap-section-phasemap.spec
A lib/chains.js
A lib/connections.js
A lib/system-control.js
A lib/triggers.js
M loom/maps/observability-map.js
M loom/registry-components.js
M loom/server.js
A loom/test/phasemap-map.test.js
M loom/ui/index.html
A tests/modules/test-chains.js
A tests/modules/test-connections.js
A tests/modules/test-system-control.js
A tests/modules/test-triggers.js
```

### Build 0.39.0-r3 — snap-0341 — 2026-08-08 17:24:46

- Archive: `nexus-0341_2026-08-08_v0.39.0-r3_full-1.zip` (was `nexus-full-2026-08-08-1.zip`)
- SHA-256: `81c07c3eb2467bfd4947e7ff620ce3803450083497a185eb7e5cf88782a649c8`, 38.8 MB, downloaded 2026-08-08 17:26:26
- Kind: full
- Commit: `cbf1da8dc24316464b82c5e60575395c428fcdab`, tag `snap-0341`
- Left out: embedded .git (6407 files, HEAD 185725ce3e576fe6197514a04c32a07ea142ee67 (master))
- Files in archive: 3724. Changes against the build before it: **5 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 1 | 0 |
| data | 1 | 1 | 0 |
| docs | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| tests | 2 | 0 | 0 |
| scripts | 0 | 1 | 0 |

```
M data/cortex/memory/event_log.json
A data/cortex/memory/lattice_edges.json
M docs/SPEC-REGISTRY.md
M docs/copilot-autonomous-phasemap.spec
A lib/command-builder.js
A lib/constant-autonomy.js
M lib/version.js
M loom/maps/observability-map.js
M loom/scanners/phasemap-map.js
M scripts/precommit-check.js
A tests/modules/test-command-builder.js
A tests/modules/test-constant-autonomy.js
```

### Build 0.39.0-r4 — snap-0342 — 2026-08-08 18:06:22

- Archive: `nexus-0342_2026-08-08_v0.39.0-r4_full-2026-08-09.zip` (was `nexus-full-2026-08-09.zip`)
- SHA-256: `f6d361a1befc626fb0ccd8120d5112533c241ca8f21a81bb42a9ebeaf5c565d6`, 38.9 MB, downloaded 2026-08-08 18:25:33
- Kind: full
- Commit: `7843fa5dd53f1987b749d10994ca6b8ef149103e`, tag `snap-0342`
- Left out: embedded .git (6438 files, HEAD 5b3dd004e5bb407f24cfd21abdf371ff4e25014b (master))
- Files in archive: 3725. Changes against the build before it: **12 added, 11 modified, 11 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 2 | 11 |
| _archive | 12 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
A _archive/superseded-docs-2026-08-09/AXIOMS-v3.1-superseded-2026-07-19.md
A _archive/superseded-docs-2026-08-09/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md
A _archive/superseded-docs-2026-08-09/NEXUS-COPILOT-ROADMAP-2026-07-10.md
A _archive/superseded-docs-2026-08-09/NEXUS-EXPANSION-MAP-2026-07-06.md
A _archive/superseded-docs-2026-08-09/NEXUS-PIPELINE-SPEC-2026-07-07.md
A _archive/superseded-docs-2026-08-09/NEXUS-REMAINING-WORK-2026-07-09.md
A _archive/superseded-docs-2026-08-09/NEXUS-STATE-SPEC-2026-07-06.md
A _archive/superseded-docs-2026-08-09/NEXUS-VISION-SPEC-2026-07-06.md
A _archive/superseded-docs-2026-08-09/README.md
A _archive/superseded-docs-2026-08-09/SESSION-2026-06-24.md
A _archive/superseded-docs-2026-08-09/SOVEREIGN-SPEC-AUDIT-2026-06-28.md
A _archive/superseded-docs-2026-08-09/nexus-tablet-v0.1.0-superseded.spec
M bridge/registry-components.js
M cortex/registry-components.js
D docs/AXIOMS-v3.1-superseded-2026-07-19.md
D docs/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md
D docs/NEXUS-COPILOT-ROADMAP-2026-07-10.md
D docs/NEXUS-EXPANSION-MAP-2026-07-06.md
M docs/NEXUS-PHASE-MAP.md
D docs/NEXUS-PIPELINE-SPEC-2026-07-07.md
D docs/NEXUS-REMAINING-WORK-2026-07-09.md
D docs/NEXUS-STATE-SPEC-2026-07-06.md
D docs/NEXUS-VISION-SPEC-2026-07-06.md
D docs/SESSION-2026-06-24.md
D docs/SOVEREIGN-SPEC-AUDIT-2026-06-28.md
M docs/SPEC-REGISTRY.md
D docs/nexus-tablet-v0.1.0-superseded.spec
M emerge/registry-components.js
M guardian/registry-components.js
M idearium/index.js
M lib/agent-tools/tools/run-closed-loop.js
M orchestrator.js
M scripts/precommit-check.js
M ui/tv-shell/tutorial/tutorial.js
```

### Build 0.39.0-r5 — snap-0343 — 2026-08-11 15:15:48

- Archive: `nexus-0343_2026-08-11_v0.39.0-r5_full.zip` (was `nexus-full-2026-08-11.zip`)
- SHA-256: `9c3200f3f453fa28f4d42d7b50908766b150e010d0f212a557b184c65c2dad92`, 40.3 MB, downloaded 2026-08-11 15:17:24
- Kind: full
- Commit: `47029f7d29a23ca8abf553738f640cc033d7da22`, tag `snap-0343`
- Left out: embedded .git (6582 files, HEAD e161ac21fa6851d92e32bb033cfbf4256e61fd44 (master))
- Files in archive: 3787. Changes against the build before it: **63 added, 48 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 27 | 21 | 1 |
| lib | 14 | 7 | 0 |
| tests | 13 | 3 | 0 |
| loom | 3 | 6 | 0 |
| copilot | 2 | 3 | 0 |
| cortex | 2 | 3 | 0 |
| docs | 1 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| cli | 1 | 0 | 0 |
| service | 0 | 1 | 0 |

```
M .gitignore
A cli/nexus-movement.js
A copilot/lib/autonomy-router.js
A copilot/lib/intent-learning.js
M copilot/lib/self-model.js
M copilot/lib/user-model.js
M copilot/server.js
M cortex/boot.js
M cortex/gap-finder/index.js
M cortex/memory/decay.js
A cortex/memory/relevance.js
A cortex/ui/ideas.html
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/hooks.json
M data/cortex/memory/scheduled_tasks.json
A data/cortex/memory/self_built_commands.json
M data/cortex/memory/settings.json
M data/cortex/memory/tool_index.json
M data/cortex/memory/user_model_hypotheses.json
M data/diagnostic/baseline-events.ndjson
D data/diagnostic/diagnostic.pid
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/diagnostic/remediation.jsonl
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
A data/ledger/bridge/b.y/2026-08-11.jsonl
A data/ledger/bridge/b/2026-08-11.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-11.jsonl
A data/ledger/cortex/cortex.raid/2026-08-11.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-11.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-11.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-11.jsonl
A data/ledger/forge/forge.old/2026-08-11.jsonl
A data/ledger/forge/forge.patch/2026-08-11.jsonl
A data/ledger/guardian/g.x/2026-08-11.jsonl
A data/ledger/guardian/g/2026-08-11.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-11.jsonl
A data/ledger/reflection/reflection.engine/2026-08-11.jsonl
A data/ledger/test/test.echo.ping/2026-08-11.jsonl
A data/ledger/test/test.event.check/2026-08-11.jsonl
A data/ledger/test/test.widget.panel/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-11.jsonl
M data/orchestrator/baseline-events.ndjson
M docs/cortex.spec
A docs/movement.spec
M docs/nexus-live-mind-phasemap.spec
A lib/agent-build-learning.js
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/capability-tools.js
A lib/agent-tools/tools/forge-tool.js
A lib/agent-tools/tools/propose-idea.js
A lib/agent-tools/tools/query-lenses.js
A lib/agent-tools/tools/query-movement.js
A lib/chunk-build-orchestrator.js
M lib/constant-autonomy.js
M lib/diagnostic-causal.js
M lib/edge-cases.js
A lib/gap-field.js
A lib/idea-provenance.js
M lib/intent-classifier.js
A lib/ledger-tail.js
A lib/lenses.js
A lib/manifest.js
A lib/movement.js
A lib/tool-forge.js
M lib/version.js
M loom/bootstrap.js
M loom/data/registry.json
M loom/maps/observability-map.js
M loom/registry-components.js
A loom/scanners/dangling-report.js
A loom/scanners/source-map.js
M loom/server.js
A loom/test/friction-proxy.test.js
M loom/ui/index.html
M package.json
M service/nexus-diagnostic.js
A tests/modules/idea-provenance.test.js
A tests/modules/ledger-tail.test.js
A tests/modules/lenses.test.js
A tests/modules/manifest.test.js
A tests/modules/movement.test.js
A tests/modules/read-time-expiry.test.js
A tests/modules/relevance.test.js
M tests/modules/run-all.js
A tests/modules/test-agent-build-learning.js
A tests/modules/test-autonomy-router.js
A tests/modules/test-chunk-build-orchestrator.js
M tests/modules/test-constant-autonomy.js
A tests/modules/test-gap-field.js
A tests/modules/test-intent-learning.js
M tests/modules/test-tool-guide.js
A tests/modules/tool-forge.test.js
```

### artifact — 0344 — 2026-08-11 22:15:48

- Archive: `nexus-0344_2026-08-11_v0.39.0-side_4.14-ui-fixed-split-2_declared-0.1.0.zip` (was `nexus-4.14-ui-fixed-split (2).zip`)
- SHA-256: `346be74a7be5d85bfd6e1abb6572bfce987df2401bf3294a356cea856dde99d2`, 0.5 MB, downloaded 2026-08-11 22:15:58
- Kind: artifact (side bundle, on the artifacts branch)
- Claimed version: 0.1.0 (registry 0.1.0, file name none); filed under 0.39.0 to keep the line in order
- Commit: `9bcfb3e40280829c1a7c634cf3bc410b8e5f7781`, tag `snap-0344`
- Redacted: `conf/peer/identity.json (1 x private-key)`
- Redacted: `conf/relay/relay.crt (1 x private-key)`
- Redacted: `conf/smtp/dkim/private.key (1 x private-key)`
- Redacted: `conf/tls/acme/account.key (1 x private-key)`
- Redacted: `conf/tls/certs/anonymousservers.info.key (1 x private-key)`
- Redacted: `conf/tls/certs/anonymoussservers.info.crt (1 x private-key)`
- Redacted: `conf/tls/certs/phase5test.local.key (1 x private-key)`
- Redacted: `conf/tls/certs/realcustomer.com.key (1 x private-key)`
- Redacted: `conf/tls/certs/tlstest.local.key (1 x private-key)`
- Redacted: `conf/tls/certs/wildcard.anonymousservers.info.key (1 x private-key)`
- Redacted: `conf/tls/certs/wildcard.anonymoussservers.info.crt (1 x private-key)`
- Redacted: `conf/tls/certs/wildcard.realcustomer.com.key (1 x private-key)`
- Files in archive: 127. Changes against the build before it: **127 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2 | 127 | 0 | 0 |

```
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/README.md
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/apply.ps1
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/auth.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/billing.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/cache.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/catalog.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/ddns.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/dns.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/firewall.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/glue.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/peer/identity.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/proxy.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/queue.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/relay.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/relay/psk
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/relay/relay.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/relay/relay.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/setup.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/signal.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/smtp.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/smtp/dkim/private.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/storage.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls.conf
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/acme/account.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/anonymousservers.info.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/anonymousservers.info.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/anonymoussservers.info.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/anonymoussservers.info.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/phase5test.local.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/phase5test.local.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/realcustomer.com.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/realcustomer.com.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/tlstest.local.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/tlstest.local.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.anonymousservers.info.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.anonymousservers.info.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.anonymoussservers.info.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.anonymoussservers.info.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.realcustomer.com.crt
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/certs/wildcard.realcustomer.com.key
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/5bfPBHahPhgGLjGVs9aHl14MStHl5j28HCPsv5tZm6E
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/Ddta_CNs5HWfkEn7PppvMR7Pi3fGZGUB-zg3wScO3U0
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/ETdeDevYsSu_1sSRqrJK5UO25UPHQtJpfpcEsy4dBJ4
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/JOv88hYeTZGLPaR5SfekGJcMm86HP4-hMqQLZZkoVcg
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/KUATHlWk9h-qtXAalWNg8r1o3i661x47f_qb4TUOawc
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/tls/challenges/UgYoBa44heGAHrvQMIOWAwlpJa_i1UcrMOfA1gph0dE
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/conf/vhosts/localhost.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/_engine.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/auth.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/autodns.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/billing.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/cache.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/catalog.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/components/sysfw.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/components/upnp.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/ddns.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/deploy.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/dns.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/firewall.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/glue.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/deploy-store.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/dns-zones.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/safe-zip.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/setup-orchestrator.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/test/test-deploy-store.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/test/test-dns-zones.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/test/test-safe-zip.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/test/test-setup-orchestrator.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/lib/test/zip-writer.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/monitor.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/optimizer.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/peer.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/provisioner.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/proxy.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/queue.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/registrar.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/relay.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/setup.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/signal.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/smtp.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/storage.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/tls.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/tunnel.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/ui-assets/app.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/ui-assets/style.css
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/ui.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/engines/webserver.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/install.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/__test_dns_client.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/auth.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/autodns.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/billing.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/cache.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/catalog.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/ddns.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/deploy.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/dns.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/firewall.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/glue.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/kernel.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/monitor.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/optimizer.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/peer.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/provisioner.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/proxy.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/queue.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/registrar.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/relay.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/setup.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/signal.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/smtp.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/storage.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/tls.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/tunnel.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/ui.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/logs/webserver.log
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/nexus.js
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/package-lock.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/package.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/powershell.exe
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/sites/root/index.html
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/sites/root/public/index.html
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/start.bat
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/state/jaa/access_log.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/state/jaa/dns_log.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/state/jaa/domains.json
A nexus-0344_2026-08-11_v0.1.0_4.14-ui-fixed-split-2/state/jaa/monitor_state.json
```

### Build 0.39.0-r6 — snap-0345 — 2026-08-11 22:18:08

- Archive: `nexus-0345_2026-08-11_v0.39.0-r6_full-2026-08-12.zip` (was `nexus-full-2026-08-12.zip`)
- SHA-256: `a7c40acde44242f6aacc5eabcf90cad25ba44c4efd33ade695d1ab1a3459e358`, 40.8 MB, downloaded 2026-08-11 22:19:37
- Kind: full
- Commit: `b45a2da9975e46aeb5e0661fe5bd4026779466a7`, tag `snap-0345`
- Left out: embedded .git (6666 files, HEAD 091a552123f0965d8b942398466e9a462e12e282 (master))
- Files in archive: 3815. Changes against the build before it: **28 added, 39 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 24 | 27 | 0 |
| loom | 0 | 4 | 0 |
| tests | 2 | 2 | 0 |
| copilot | 1 | 1 | 0 |
| docs | 1 | 1 | 0 |
| lib | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |

```
A copilot/lib/lifeline-contracts.js
M copilot/lifeline.js
M cortex/gap-finder/index.js
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/phasemap_history.json
M data/ledger/bridge/b.y/2026-08-11.jsonl
A data/ledger/bridge/b.y/2026-08-12.jsonl
M data/ledger/bridge/b/2026-08-11.jsonl
A data/ledger/bridge/b/2026-08-12.jsonl
A data/ledger/claude/session-2026-08-12/session-session-2026-08-12.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-11.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-12.jsonl
M data/ledger/cortex/cortex.raid/2026-08-11.jsonl
A data/ledger/cortex/cortex.raid/2026-08-12.jsonl
M data/ledger/forge/forge.old/2026-08-11.jsonl
A data/ledger/forge/forge.old/2026-08-12.jsonl
M data/ledger/forge/forge.patch/2026-08-11.jsonl
A data/ledger/forge/forge.patch/2026-08-12.jsonl
M data/ledger/guardian/g.x/2026-08-11.jsonl
A data/ledger/guardian/g.x/2026-08-12.jsonl
M data/ledger/guardian/g/2026-08-11.jsonl
A data/ledger/guardian/g/2026-08-12.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-11.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-11.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-12.jsonl
M data/ledger/reflection/reflection.engine/2026-08-11.jsonl
A data/ledger/reflection/reflection.engine/2026-08-12.jsonl
M data/ledger/test/test.echo.ping/2026-08-11.jsonl
A data/ledger/test/test.echo.ping/2026-08-12.jsonl
M data/ledger/test/test.event.check/2026-08-11.jsonl
A data/ledger/test/test.event.check/2026-08-12.jsonl
M data/ledger/test/test.widget.panel/2026-08-11.jsonl
A data/ledger/test/test.widget.panel/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-11.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-12.jsonl
M docs/SPEC-REGISTRY.md
A docs/repair-contract-and-loom-hub-phasemap.spec
M hooks/architect.hooks.js
M lib/gap-field.js
M lib/version.js
M loom/maps/observability-map.js
M loom/scanners/phasemap-map.js
M loom/server.js
M loom/test/phasemap-map.test.js
M tests/modules/run-all.js
M tests/modules/test-gap-field.js
A tests/modules/test-lifeline-contracts.js
A tests/modules/test-lifeline-fault-logging.js
```

### Build 0.39.0-r7 — snap-0346 — 2026-08-12 08:41:36

- Archive: `nexus-0346_2026-08-12_v0.39.0-r7_full-final.zip` (was `nexus-full-2026-08-12-final.zip`)
- SHA-256: `3f24a5b7ae06e3e6ec14e7b903cc211c5584531d006b801dbd06240a6d9fa485`, 43.2 MB, downloaded 2026-08-12 08:42:30
- Kind: full
- Commit: `ce61ab9b7f1e45fd18ed8f1a58d0e095da46a2df`, tag `snap-0346`
- Left out: embedded .git (6826 files, HEAD cc37f21d449a473c46df128d61faec98d07fee3d (master))
- Files in archive: 3841. Changes against the build before it: **26 added, 56 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 11 | 41 | 0 |
| cortex | 5 | 2 | 0 |
| loom | 4 | 3 | 0 |
| tests | 3 | 4 | 0 |
| lib | 3 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M CHANGELOG-SESSION.md
M clear-glass/src/diagnostic/error-capture.js
M copilot/lib/autonomy-router.js
M cortex/core/raid/index.js
A cortex/data/snapshots/0caff9c5-97f2-480e-9991-a69d13ddb8d3.nex
A cortex/data/snapshots/44461f5e-4da2-4371-b4f8-8e42362c11eb.nex
A cortex/data/snapshots/8b90bea3-0692-4eb6-ab2f-3eab9511f770.nex
A cortex/data/snapshots/914df696-bee3-4fc1-bd93-fa697a3a7f9f.nex
M cortex/self-heal/fault-taxonomy.js
A cortex/snapshot/index.js
M data/architect/baseline-events.ndjson
M data/autopilot/autopilot.log
M data/bridge/baseline-events.ndjson
M data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/agent_build_confidence.json
A data/cortex/memory/backup_records.json
M data/cortex/memory/component_ledger.json
M data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/intent_pattern_confidence.json
A data/cortex/memory/r2-rollback-verify-scratch.json
M data/cortex/memory/raid_decisions.json
M data/cortex/memory/schema_drift.json
M data/cortex/memory/snapshots.json
A data/cortex/memory/triggers.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/ledger/boot/events.ndjson
M data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/idearium/baseline-events.ndjson
M data/ledger/bridge/b.y/2026-08-12.jsonl
M data/ledger/bridge/b/2026-08-12.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-12.jsonl
M data/ledger/cortex/cortex.raid/2026-08-12.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-12.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-12.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-12.jsonl
M data/ledger/forge/forge.old/2026-08-12.jsonl
M data/ledger/forge/forge.patch/2026-08-12.jsonl
M data/ledger/guardian/g.x/2026-08-12.jsonl
M data/ledger/guardian/g/2026-08-12.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-12.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-12.jsonl
A data/ledger/r4-loom-history-test-1786537160611/r4-loom-history-test-1786537160611.probe/2026-08-12.jsonl
A data/ledger/r4-loom-history-test-1786537654202/r4-loom-history-test-1786537654202.probe/2026-08-12.jsonl
A data/ledger/r4-loom-history-test-1786538352683/r4-loom-history-test-1786538352683.probe/2026-08-12.jsonl
M data/ledger/reflection/reflection.engine/2026-08-12.jsonl
M data/ledger/test/test.echo.ping/2026-08-12.jsonl
M data/ledger/test/test.event.check/2026-08-12.jsonl
M data/ledger/test/test.widget.panel/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-12.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-12.jsonl
M data/orchestrator/baseline-events.ndjson
M docs/repair-contract-and-loom-hub-phasemap.spec
A lib/autonomous-repair.js
M lib/chunk-build-orchestrator.js
A lib/nerve-gap-bridge.js
A lib/stub-scanner.js
A loom/doc-generator.js
M loom/maps/observability-map.js
M loom/server.js
A loom/test/component-detail.test.js
A loom/test/doc-generator.test.js
A loom/test/history-routes.test.js
M loom/ui/index.html
M service/nexus-diagnostic.js
M tests/modules/error-capture.test.js
M tests/modules/run-all.js
A tests/modules/test-autonomous-repair.js
M tests/modules/test-autonomy-router.js
M tests/modules/test-fault-taxonomy.js
A tests/modules/test-nerve-gap-bridge.js
A tests/modules/test-stub-scanner.js
```

### Build 0.39.0-r8 — snap-0347 — 2026-08-12 08:53:46

- Archive: `nexus-0347_2026-08-12_v0.39.0-r8_complete.zip` (was `nexus-complete-2026-08-12.zip`)
- SHA-256: `1410f9c63e40e297a24906783937f0edce731acfb00051969a4d246d16a56c7b`, 43.3 MB, downloaded 2026-08-12 08:57:19
- Kind: full
- Commit: `770be75a44e0ac9ac22132d0c3a64ac96b2d78c9`, tag `snap-0347`
- Left out: embedded .git (6849 files, HEAD 6a0dfcb46fc705ec5bb908ffa116d3eb52a38f63 (master))
- Files in archive: 3843. Changes against the build before it: **3 added, 3 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| data | 0 | 0 | 1 |
| lib | 1 | 0 | 0 |
| loom | 0 | 1 | 0 |

```
D data/cortex/memory/r2-rollback-verify-scratch.json
A docs/UI-DESIGN-PHILOSOPHY.md
M docs/repair-contract-and-loom-hub-phasemap.spec
A lib/relational-context.js
M loom/maps/observability-map.js
M tests/modules/run-all.js
A tests/modules/test-relational-context.js
```

### Build 0.39.0-r9 — snap-0348 — 2026-08-12 15:15:16

- Archive: `nexus-0348_2026-08-12_v0.39.0-r9_complete-1.zip` (was `nexus-complete-2026-08-12-1.zip`)
- SHA-256: `4366b37898b90ae79a63e14231acd0f17e40f7c603b47a699af0f72f5630e58c`, 43.3 MB, downloaded 2026-08-12 15:18:14
- Kind: full
- Commit: `c5ab548702a9bcd945d81a30184d991ca9129959`, tag `snap-0348`
- Identical copy: `nexus-0348_2026-08-12_v0.39.0-r9_complete-2_dup1.zip` (was `nexus-complete-2026-08-12-2.zip`)
- Left out: embedded .git (6849 files, HEAD 6a0dfcb46fc705ec5bb908ffa116d3eb52a38f63 (master))
- Files in archive: 3844. Changes against the build before it: **1 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 1 | 6 | 0 |

```
M clear-glass/siso/index.js
M clear-glass/src/contexts/manager.js
A clear-glass/src/core/bounded-queue.js
M clear-glass/src/dom/archaeology.js
M clear-glass/src/gates/index.js
M clear-glass/src/main/index.js
M clear-glass/src/rewind/engine.js
```

### Build 0.39.0-r10 — snap-0349 — 2026-08-12 17:35:44

- Archive: `nexus-0349_2026-08-12_v0.39.0-r10_complete-updated.zip` (was `nexus-complete-2026-08-12-updated.zip`)
- SHA-256: `56340b5ec26f2c3fb85b3b4a53c9a8489d201042a06de9176a39063d203e155d`, 37.8 MB, downloaded 2026-08-12 17:39:28
- Kind: full
- Commit: `b4a05d6d44f777a1ff3baac0e4ca113decd98afc`, tag `snap-0349`
- Left out: embedded .git (6959 files, HEAD ece7cfed8f8b629f601e2eaf3762ce696e54c494 (master))
- Files in archive: 3051. Changes against the build before it: **12 added, 14 modified, 805 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 804 |
| lib | 10 | 3 | 0 |
| clear-glass | 0 | 6 | 1 |
| loom | 1 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| docs | 1 | 1 | 0 |

```
M clear-glass/siso/index.js
M clear-glass/src/contexts/manager.js
D clear-glass/src/core/bounded-queue.js
M clear-glass/src/dom/archaeology.js
M clear-glass/src/gates/index.js
M clear-glass/src/main/index.js
M clear-glass/src/rewind/engine.js
M copilot/lib/self-model.js
M copilot/server.js
M docs/SPEC-REGISTRY.md
A docs/copilot-full-capability-phasemap.spec
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/agent-chat-search.js
M lib/agent-tools/tools/browser-action.js
A lib/agent-tools/tools/copilot-identity.js
A lib/agent-tools/tools/loom-scan.js
A lib/agent-tools/tools/nexus-heal.js
A lib/agent-tools/tools/nexus-help.js
A lib/agent-tools/tools/raid-snr.js
A lib/agent-tools/tools/register-trigger.js
A lib/agent-tools/tools/resource-monitor.js
A lib/agent-tools/tools/rewind-replay.js
A lib/agent-tools/tools/schedule-task.js
M loom/bootstrap.js
A loom/maps/copilot-capability-map.js
```

805 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r11 — snap-0350 — 2026-08-12 17:55:04

- Archive: `nexus-0350_2026-08-12_v0.39.0-r11_complete-final.zip` (was `nexus-complete-2026-08-12-final.zip`)
- SHA-256: `920f63e6155baad5674353aeb0be0681c9fe2a7ce966ba957b007b105bfc748b`, 38.1 MB, downloaded 2026-08-12 17:56:14
- Kind: full
- Commit: `24525f93f5a71d4a81c87b7653fcf61cda756740`, tag `snap-0350`
- Left out: embedded .git (7004 files, HEAD ea81e3ee084ab65b16f715107c6682021aaab1cb (master))
- Files in archive: 3055. Changes against the build before it: **4 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 4 | 3 | 0 |
| docs | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
M copilot/server.js
M docs/SPEC-REGISTRY.md
M docs/copilot-full-capability-phasemap.spec
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/cos-compartment.js
A lib/agent-tools/tools/cos-simulate.js
A lib/agent-tools/tools/meta-query.js
A lib/nerve-ollama-bridge.js
M lib/nerve/index.js
M loom/data/registry.json
M loom/maps/copilot-capability-map.js
M ollama/server.js
```

### Build 0.39.0-r12 — snap-0351 — 2026-08-12 18:31:56

- Archive: `nexus-0351_2026-08-12_v0.39.0-r12_complete-conversations.zip` (was `nexus-complete-2026-08-12-conversations.zip`)
- SHA-256: `bb82a2ce284f68bdeb26061b4dd223e2c4c29f3aa75346d5a64497b5e906546f`, 38.2 MB, downloaded 2026-08-12 18:36:01
- Kind: full
- Commit: `8c76af880e67cfa5aabfe073d1aca37cf56c30ec`, tag `snap-0351`
- Identical copy: `nexus-0351_2026-08-12_v0.39.0-r12_complete-conversations-1_dup1.zip` (was `nexus-complete-2026-08-12-conversations (1).zip`)
- Left out: embedded .git (7025 files, HEAD 2d24d089aad9108ae890f1181f33044e7b232823 (master))
- Files in archive: 3056. Changes against the build before it: **1 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 3 | 0 |
| lib | 1 | 2 | 0 |
| loom | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M copilot/lib/self-model.js
M docs/SPEC-REGISTRY.md
M docs/copilot-omniscience-phasemap.spec
M docs/nexus-live-mind-phasemap.spec
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/run-chain.js
M loom/data/registry.json
M loom/maps/copilot-capability-map.js
M ui/channels/conversations/conversations.html
```

### Build 0.39.0-r13 — snap-0352 — 2026-08-12 18:47:58

- Archive: `nexus-0352_2026-08-12_v0.39.0-r13_complete-console-fix.zip` (was `nexus-complete-2026-08-12-console-fix.zip`)
- SHA-256: `d0139b1a43f6888fa80e394706c3a8baaf7584cd14f0d6235cedc7ec90d6929f`, 38.3 MB, downloaded 2026-08-12 18:50:30
- Kind: full
- Commit: `1c915c303304fe7a1f752dac70a2452cfdc8ce6e`, tag `snap-0352`
- Left out: embedded .git (7062 files, HEAD fd79cdf5234119072f77ac79cd894ab1a5fea147 (master))
- Files in archive: 3056. Changes against the build before it: **0 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 5 | 0 |
| ui | 0 | 5 | 0 |
| cortex | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M cortex/contract/index.js
M guardian/ui/agents/chatgpt/index.html
M guardian/ui/agents/claude/index.html
M guardian/ui/agents/gemini/index.html
M guardian/ui/agents/mistral/index.html
M guardian/ui/agents/perplexity/index.html
M lib/agent-tools/tools/agent-chat-search.js
M loom/maps/copilot-capability-map.js
M ui/agents/chatgpt/index.html
M ui/agents/claude/index.html
M ui/agents/gemini/index.html
M ui/agents/mistral/index.html
M ui/agents/perplexity/index.html
```

### Build 0.39.0-r14 — snap-0353 — 2026-08-12 19:01:16

- Archive: `nexus-0353_2026-08-12_v0.39.0-r14_complete-2026-08-13-danglinghook-fix.zip` (was `nexus-complete-2026-08-13-danglinghook-fix.zip`)
- SHA-256: `70ca7500c88a605e4552b9a475e1c3368caa12b56f69e0ad5197891d1ac86656`, 38.3 MB, downloaded 2026-08-12 19:04:02
- Kind: full
- Commit: `21a6ae403bb67f7ded4d8dd207a60feb245ad326`, tag `snap-0353`
- Left out: embedded .git (7067 files, HEAD ac916c1550613792d15d55db61cbb2e68d032475 (master))
- Files in archive: 3056. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom | 0 | 1 | 0 |

```
M loom/scanners/source-map.js
```

### Build 0.39.0-r15 — snap-0354 — 2026-08-12 21:40:12

- Archive: `nexus-0354_2026-08-12_v0.39.0-r15_complete-2026-08-13-p4-loom-tab.zip` (was `nexus-complete-2026-08-13-p4-loom-tab.zip`)
- SHA-256: `19efe78dde93dc347209d23d725f848558154d8031953df3b34197dab75ac813`, 38.9 MB, downloaded 2026-08-12 21:44:15
- Kind: full
- Commit: `762920f7a60f82cc400ccd5ba05a67407410989a`, tag `snap-0354`
- Left out: embedded .git (7203 files, HEAD 9b9d3edf4d798cde404abfd6efc0fc841f8f8d61 (master))
- Files in archive: 3073. Changes against the build before it: **17 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 16 | 3 | 0 |
| copilot | 0 | 4 | 0 |
| loom | 0 | 3 | 0 |
| docs | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M autopilot.js
M copilot/lib/self-model.js
M copilot/lifeline.js
M copilot/server.js
M copilot/tool-runtime.js
M docs/SPEC-REGISTRY.md
A docs/nexus-architecture-rebuild-phasemap.spec
A lib/agent-capability-profile.js
A lib/agent-council.js
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/agent-capability.js
A lib/agent-tools/tools/agent-council.js
M lib/agent-tools/tools/copilot-identity.js
A lib/agent-tools/tools/emergence.js
A lib/agent-tools/tools/fault-log.js
A lib/agent-tools/tools/hat-forge.js
A lib/agent-tools/tools/parallel-dispatch.js
A lib/agent-tools/tools/roundtable.js
A lib/agent-tools/tools/safe-apply.js
A lib/emergence.js
A lib/fault-log.js
A lib/hat-forge.js
A lib/parallel-dispatch.js
A lib/roundtable.js
A lib/safe-apply.js
M loom/data/registry.json
M loom/maps/copilot-capability-map.js
M loom/server.js
M ui/forge-shell/index.html
```

### Build 0.39.0-r16 — snap-0355 — 2026-08-12 21:47:46

- Archive: `nexus-0355_2026-08-12_v0.39.0-r16_complete-2026-08-13-p4-complete.zip` (was `nexus-complete-2026-08-13-p4-complete.zip`)
- SHA-256: `6c39531ec1680225445d8f723552477cd698b9012950ddd6a43a2bb1b0b5ca3d`, 38.9 MB, downloaded 2026-08-12 21:51:35
- Kind: full
- Commit: `6b431590afbd483b2a10aad2dc8408d57845844e`, tag `snap-0355`
- Left out: embedded .git (7212 files, HEAD 1b58e980a2b2bd7d05671d1a53df6e92094e58dd (master))
- Files in archive: 3074. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom | 1 | 2 | 0 |
| ui | 0 | 1 | 0 |

```
M loom/bootstrap.js
M loom/data/registry.json
A loom/maps/ui-map.js
M ui/forge-shell/index.html
```

### Build 0.39.0-r17 — snap-0356 — 2026-08-12 22:31:02

- Archive: `nexus-0356_2026-08-12_v0.39.0-r17_complete-2026-08-13-loom-deferral.zip` (was `nexus-complete-2026-08-13-loom-deferral.zip`)
- SHA-256: `8ee986f5b4f15c300528242509fc0afe694fea3f4f82cfc9a774c9453712e1d3`, 39 MB, downloaded 2026-08-13 00:17:06
- Kind: full
- Commit: `90be9c3e2dd5e5621b1b2157b8dae56bce149990`, tag `snap-0356`
- Left out: embedded .git (7222 files, HEAD dc0c132808f6dcb6a15c8f0fa67c9773c44f37fe (master))
- Files in archive: 3076. Changes against the build before it: **2 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 0 | 0 |
| loom | 0 | 2 | 0 |

```
A data/ledger/r4-loom-history-test-1786598721411/r4-loom-history-test-1786598721411.probe/2026-08-13.jsonl
A data/loom/loom_events.buffer.jsonl
M loom/bootstrap.js
M loom/data/registry.json
```

### Build 0.39.0-r18 — snap-0357 — 2026-08-13 00:49:40

- Archive: `nexus-0357_2026-08-13_v0.39.0-r18_p4-done.zip` (was `nexus-p4-done-2026-08-13.zip`)
- SHA-256: `6c967cb656d18e4bc196df681463c5017867360534aa2a5009ddc9d889019c03`, 13.6 MB, downloaded 2026-08-13 00:56:47
- Kind: full
- Commit: `323154b429f7519c6b44ec0338556b736cadaf1c`, tag `snap-0357`
- Files in archive: 3080. Changes against the build before it: **5 added, 4 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 0 | 0 |
| docs | 1 | 1 | 0 |
| lib | 1 | 1 | 0 |
| ui | 0 | 1 | 1 |
| loom | 0 | 1 | 0 |

```
A data/cortex/memory/hooks.json
A data/cortex/memory/phasemap_history.json
A data/cortex/memory/settings.json
A docs/copilot-user-guide.md
M docs/nexus-architecture-rebuild-phasemap.spec
M lib/agent-tools/tool-guide.js
A lib/agent-tools/user-guide-generator.js
M loom/server.js
M ui/forge-shell/index.html
D ui/tv-shell/forge-shell/index.html
```

### Build 0.39.0-r19 — snap-0358 — 2026-08-13 02:17:46

- Archive: `nexus-0358_2026-08-13_v0.39.0-r19_copilot-routes.zip` (was `nexus-copilot-routes-2026-08-13.zip`)
- SHA-256: `1e8d9b6cf291342a61452198c0f71506488ef886b5180f078e5ecf360a5e27da`, 39.3 MB, downloaded 2026-08-13 03:08:15
- Kind: full
- Commit: `87c62dc857c5b37dd514ac5fc31170ec489455ed`, tag `snap-0358`
- Left out: embedded .git (7267 files, HEAD 0f0647e49aaf5ca95e6632c21d3ad6f8aa5ec830 (master))
- Files in archive: 3087. Changes against the build before it: **8 added, 7 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 6 | 2 | 1 |
| copilot | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| ui | 1 | 0 | 0 |

```
M copilot/server.js
M copilot/spec/copilot.spec
A data/cortex/memory/constitution_decisions.json
A data/cortex/memory/copilot_identity.json
A data/cortex/memory/event_log.json
A data/cortex/memory/forged_hats.json
A data/cortex/memory/gaps.json
M data/cortex/memory/hooks.json
D data/cortex/memory/phasemap_history.json
A data/cortex/memory/scheduled_tasks.json
M data/cortex/memory/settings.json
M docs/nexus-architecture-rebuild-phasemap.spec
A lib/hat-seed.js
M loom/maps/copilot-capability-map.js
M loom/scanners/phasemap-map.js
A ui/tv-shell/forge-shell/index.html
```

### Build 0.39.0-r20 — snap-0359 — 2026-08-14 02:28:18

- Archive: `nexus-0359_2026-08-14_v0.39.0-r20.zip` (was `nexus-2026-08-14.zip`)
- SHA-256: `2ec5eb7bc0bd9c0e94ad19513a2cc8243afc01c7eeed4c44c6768d9b04d9748d`, 39.7 MB, downloaded 2026-08-14 02:33:16
- Kind: full
- Commit: `9e4095773e9c4fe20282529e0e2b0af5f16c08d7`, tag `snap-0359`
- Left out: embedded .git (7314 files, HEAD b19e040c6a5c1c4126168321136e6cd0da3840ad (master))
- Files in archive: 3084. Changes against the build before it: **8 added, 14 modified, 11 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 10 |
| lib | 3 | 3 | 0 |
| loom | 1 | 4 | 0 |
| docs | 2 | 2 | 0 |
| cortex | 0 | 3 | 0 |
| _archive | 1 | 0 | 0 |
| (root) | 0 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
D AXIOMS-v3.1.md
A _archive/superseded-docs-2026-08-13/AXIOMS-v3.1-stale-2026-07-24.md
M copilot/server.js
M cortex/intelligence/index.js
M cortex/liminal-space/index.js
M cortex/push-recall.js
D data/cortex/memory/constitution_decisions.json
D data/cortex/memory/copilot_identity.json
D data/cortex/memory/event_log.json
D data/cortex/memory/forged_hats.json
D data/cortex/memory/gaps.json
D data/cortex/memory/hooks.json
D data/cortex/memory/scheduled_tasks.json
D data/cortex/memory/settings.json
D data/ledger/r4-loom-history-test-1786598721411/r4-loom-history-test-1786598721411.probe/2026-08-13.jsonl
D data/loom/loom_events.buffer.jsonl
M docs/AXIOMS-v3.1.md
M docs/SPEC-REGISTRY.md
A docs/agent-model-and-user-continuity-phasemap.spec
A docs/nexus-self-build-pipeline-phasemap.spec
A lib/agent-system/contracts.js
A lib/agent-system/submit.js
M lib/autonomous-repair.js
M lib/component-ledger.js
M lib/gap-field.js
A lib/loom-map.js
M loom/bootstrap.js
A loom/maps/session-2026-08-14-map.js
M loom/scanners/source-map.js
M loom/schema/gates.js
M loom/test/schema.test.js
M service/nexus-diagnostic.js
A tests/modules/test-user-continuity.js
```

### Build 0.39.0-r21 — snap-0360 — 2026-08-14 06:57:06

- Archive: `nexus-0360_2026-08-14_v0.39.0-r21_1.zip` (was `nexus-2026-08-14-1.zip`)
- SHA-256: `1dfb1e7cb5de6200e7dd4e9dc07a7dc33fdbb1f037a885ec563d5b56a852c538`, 33.3 MB, downloaded 2026-08-14 10:43:58
- Kind: full
- Commit: `f2dacc48b5c750b652c0fceeb707671223b7b526`, tag `snap-0360`
- Left out: embedded .git (7421 files, HEAD 51cc66e60f2e22e6fbe4a295823f35b841b0e28f (master))
- Files in archive: 1532. Changes against the build before it: **41 added, 21 modified, 1593 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 0 | 1543 |
| lib | 40 | 6 | 40 |
| cortex | 0 | 1 | 7 |
| tests | 1 | 5 | 0 |
| loom | 0 | 4 | 1 |
| architect | 0 | 0 | 2 |
| (root) | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |
| meta | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M cortex/boot.js
M eravos/server.js
M hooks/ollama.hooks.js
M lib/agent-tools/index.js
D lib/agent-tools/tools/agent-capability.js
D lib/agent-tools/tools/agent-chat-search.js
D lib/agent-tools/tools/agent-council.js
D lib/agent-tools/tools/browser-action.js
A lib/agent-tools/tools/browser/browser-action.js
D lib/agent-tools/tools/call-system.js
D lib/agent-tools/tools/capability-tools.js
A lib/agent-tools/tools/coordination/agent-capability.js
A lib/agent-tools/tools/coordination/agent-council.js
A lib/agent-tools/tools/coordination/capability-tools.js
A lib/agent-tools/tools/coordination/parallel-dispatch.js
A lib/agent-tools/tools/coordination/roundtable.js
D lib/agent-tools/tools/copilot-identity.js
D lib/agent-tools/tools/cos-compartment.js
D lib/agent-tools/tools/cos-simulate.js
D lib/agent-tools/tools/diagnose.js
A lib/agent-tools/tools/diagnostic/diagnose.js
A lib/agent-tools/tools/diagnostic/loom-scan.js
A lib/agent-tools/tools/diagnostic/nexus-heal.js
A lib/agent-tools/tools/diagnostic/resource-monitor.js
D lib/agent-tools/tools/emergence.js
A lib/agent-tools/tools/execution/call-system.js
A lib/agent-tools/tools/execution/emergence.js
A lib/agent-tools/tools/execution/forge-tool.js
A lib/agent-tools/tools/execution/move-data.js
A lib/agent-tools/tools/execution/run-chain.js
A lib/agent-tools/tools/execution/run-closed-loop.js
A lib/agent-tools/tools/execution/run-command.js
A lib/agent-tools/tools/execution/run-pipeline.js
A lib/agent-tools/tools/execution/safe-apply.js
D lib/agent-tools/tools/faculty-tools.js
A lib/agent-tools/tools/faculty/faculty-tools.js
A lib/agent-tools/tools/faculty/ui-tools.js
D lib/agent-tools/tools/fault-log.js
D lib/agent-tools/tools/forge-tool.js
A lib/agent-tools/tools/governance/propose-idea.js
A lib/agent-tools/tools/governance/raid-snr.js
A lib/agent-tools/tools/governance/register-trigger.js
A lib/agent-tools/tools/governance/schedule-task.js
D lib/agent-tools/tools/hat-forge.js
A lib/agent-tools/tools/identity/copilot-identity.js
A lib/agent-tools/tools/identity/hat-forge.js
D lib/agent-tools/tools/loom-scan.js
D lib/agent-tools/tools/meta-query.js
D lib/agent-tools/tools/move-data.js
D lib/agent-tools/tools/nexus-heal.js
D lib/agent-tools/tools/nexus-help.js
D lib/agent-tools/tools/nexus-status.js
D lib/agent-tools/tools/parallel-dispatch.js
D lib/agent-tools/tools/propose-idea.js
D lib/agent-tools/tools/query-intelligence.js
D lib/agent-tools/tools/query-lenses.js
D lib/agent-tools/tools/query-movement.js
D lib/agent-tools/tools/query-recall.js
A lib/agent-tools/tools/query/agent-chat-search.js
A lib/agent-tools/tools/query/fault-log.js
A lib/agent-tools/tools/query/meta-query.js
A lib/agent-tools/tools/query/nexus-help.js
A lib/agent-tools/tools/query/nexus-status.js
A lib/agent-tools/tools/query/query-intelligence.js
A lib/agent-tools/tools/query/query-lenses.js
A lib/agent-tools/tools/query/query-movement.js
A lib/agent-tools/tools/query/query-recall.js
A lib/agent-tools/tools/query/read-file.js
D lib/agent-tools/tools/raid-snr.js
D lib/agent-tools/tools/read-file.js
D lib/agent-tools/tools/register-trigger.js
D lib/agent-tools/tools/resource-monitor.js
D lib/agent-tools/tools/rewind-replay.js
D lib/agent-tools/tools/roundtable.js
D lib/agent-tools/tools/run-chain.js
D lib/agent-tools/tools/run-closed-loop.js
D lib/agent-tools/tools/run-command.js
D lib/agent-tools/tools/run-pipeline.js
D lib/agent-tools/tools/safe-apply.js
A lib/agent-tools/tools/sandbox/cos-compartment.js
A lib/agent-tools/tools/sandbox/cos-simulate.js
A lib/agent-tools/tools/sandbox/rewind-replay.js
D lib/agent-tools/tools/schedule-task.js
D lib/agent-tools/tools/ui-tools.js
M lib/chains.js
M lib/loom-map.js
M lib/scheduler.js
M lib/tool-forge.js
M lib/triggers.js
M loom/maps/copilot-capability-map.js
M loom/schema/gates.js
M loom/schema/registry.js
M loom/test/schema.test.js
M meta/rfr2/forge/index.js
M package.json
M scripts/_register-session-hooks.js
M tests/modules/diagnose-move-data-tools.test.js
M tests/modules/lenses.test.js
M tests/modules/test-call-system.js
M tests/modules/test-faculty-tools.js
A tests/modules/test-loom-map.js
M tests/modules/tool-forge.test.js
```

1553 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r22 — snap-0361 — 2026-08-14 10:47:30

- Archive: `nexus-0361_2026-08-14_v0.39.0-r22_2.zip` (was `nexus-2026-08-14-2.zip`)
- SHA-256: `50374b5c340ba079738fdafdd4c50cff513b578b80dac84daf5c8e2e592a651e`, 33.5 MB, downloaded 2026-08-14 10:49:41
- Kind: full
- Commit: `d64ee5f2d613c6ff388ac273fd017d7ccab11793`, tag `snap-0361`
- Identical copy: `nexus-0361_2026-08-14_v0.39.0-r22_1_dup1.zip` (was `nexus-2026-08-14 (1).zip`)
- Left out: embedded .git (7429 files, HEAD fd73b88b7cf32d386d8891a1c350e9b8a4108126 (master))
- Files in archive: 1533. Changes against the build before it: **1 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M copilot/module-builder.js
A tests/modules/test-module-builder-resolve.js
```

### Build 0.39.0-r23 — snap-0362 — 2026-08-14 15:13:30

- Archive: `nexus-0362_2026-08-14_v0.39.0-r23_wired-final.zip` (was `nexus-2026-08-14-wired-final.zip`)
- SHA-256: `0bfde31cd80c510ce0e3edee9f86a4c2aefac5ab3adc9ab0c3a4974a9553cdc5`, 8.5 MB, downloaded 2026-08-14 15:15:36
- Kind: full
- Commit: `11a03b3340c285df15aebe176d4922cf099b7270`, tag `snap-0362`
- Files in archive: 1911. Changes against the build before it: **378 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 345 | 0 | 0 |
| lib | 16 | 3 | 0 |
| data | 17 | 0 | 0 |
| guardian | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
M docs/copilot-omniscience-phasemap.spec
M guardian/server.js
M guardian/tool-runtime.js
M lib/agent-router.js
M lib/agent-system/contracts.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/execution/delete-file.js
A lib/agent-tools/tools/governance/ask-james.js
A lib/agent-tools/tools/governance/axiom-manage.js
A lib/agent-tools/tools/governance/loom-register.js
A lib/agent-tools/tools/governance/versionium-commit.js
A lib/agent-tools/tools/identity/switch-agent.js
A lib/agent-tools/tools/query/ambiguity-pull.js
A lib/agent-tools/tools/query/compiler-info.js
A lib/agent-tools/tools/query/file-tree.js
A lib/agent-tools/tools/query/nexus-map.js
A lib/agent-tools/tools/query/notes-todo.js
A lib/agent-tools/tools/sandbox/cos-archetype.js
A lib/agent-tools/tools/sandbox/cos-blueprint.js
A lib/agent-tools/tools/sandbox/cos-playground.js
A lib/agent-tools/tools/sandbox/cos-plugin.js
A lib/agent-tools/tools/sandbox/cos-vault.js
```

362 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r24 — snap-0363 — 2026-08-14 15:17:54

- Archive: `nexus-0363_2026-08-14_v0.39.0-r24_wired-full.zip` (was `nexus-2026-08-14-wired-full.zip`)
- SHA-256: `21508d60be4393fb821cc96b28a7650454da8d84c06840f18aed959682c0a0cc`, 19.3 MB, downloaded 2026-08-14 15:18:43
- Kind: full
- Commit: `f687b02ff9ea2d6b8b6e29985c395e32d8e15995`, tag `snap-0363`
- Left out: embedded .git (48 files, HEAD 8aedd64be4078d61cf5e6870b19c6f97b7c5ee97 (master))
- Files in archive: 1921. Changes against the build before it: **10 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 4 | 0 | 0 |
| cortex | 3 | 0 | 0 |
| architect | 2 | 0 | 0 |
| lib | 0 | 2 | 0 |
| loom | 1 | 0 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
M lib/agent-tools/tools/governance/loom-register.js
M lib/agent-tools/tools/query/nexus-map.js
A loom/data/registry.json
```

### Build 0.39.0-r25 — snap-0364 — 2026-08-16 23:08:36

- Archive: `nexus-0364_2026-08-16_v0.39.0-r25_am1-am6-done_declared-0.39.5.zip` (was `nexus-0.39.5-AM1-AM6-done.zip`)
- SHA-256: `41ca12d461463dfd1453071323e77725226c62d031a12753344a0a3e90567180`, 22.3 MB, downloaded 2026-08-16 23:08:57
- Kind: full
- Claimed version: 0.39.5 (registry 0.39.5, file name 0.39.5); filed under 0.39.0 to keep the line in order
- Commit: `bc1f67a7a7bc1c4e99b0e9678d143c64793e0dd9`, tag `snap-0364`
- Left out: embedded .git (389 files, HEAD 539b429b23aaebc9f3c711ef3a0e2bd6b4f09dce (master))
- Left out: node_modules (53 files)
- Files in archive: 1961. Changes against the build before it: **52 added, 70 modified, 12 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 17 | 10 | 0 |
| docs | 7 | 14 | 0 |
| (root) | 0 | 4 | 11 |
| data | 8 | 7 | 0 |
| loom | 2 | 8 | 1 |
| idearium | 5 | 4 | 0 |
| tests | 2 | 3 | 0 |
| orchestrator | 0 | 4 | 0 |
| userscripts | 4 | 0 | 0 |
| emerge | 3 | 0 | 0 |
| cortex | 0 | 3 | 0 |
| copilot | 0 | 3 | 0 |
| scripts | 3 | 0 | 0 |
| guardian | 0 | 3 | 0 |
| cli | 0 | 2 | 0 |
| meta | 0 | 2 | 0 |
| ollama | 1 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |

```
M CHANGELOG.md
M bridge/index.js
M cli/boot-systems.js
M cli/diagnose.js
M copilot/lib/self-model.js
M copilot/lifeline.js
M copilot/server.js
M cortex/boot.js
M cortex/intelligence/index.js
M cortex/spec/cortex.spec
A data/changelog-snapshot.json
M data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/agent_model.json
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
M data/cortex/memory/gaps.json
A data/cortex/memory/idearium_spec_chunks.json
A data/cortex/memory/idearium_spec_manifests.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/system_expectations.json
A data/cortex/memory/tool_index.json
M data/cortex/memory/versionium_branches.json
M data/cortex/memory/versionium_commits.json
M data/loom/loom_events.buffer.jsonl
A docs/PHASE-ID-MIGRATION.md
M docs/SPEC-REGISTRY.md
A docs/TREE-AUDIT-2026-08-14.md
M docs/agent-model-and-user-continuity-phasemap.spec
M docs/alk-gl-intelligence-canvas.spec
A docs/autonomous-build-capability-phasemap.spec
M docs/copilot-autonomous-phasemap.spec
A docs/copilot-command-and-chat-target-phasemap.spec
M docs/copilot-full-capability-phasemap.spec
M docs/copilot-omniscience-phasemap.spec
M docs/cortex-schema-registry-phasemap.spec
A docs/diagnostic-engine-system.spec
M docs/gemini-multiagent-coding-phasemap.spec
A docs/ncp-agent-connection-phasemap.spec
M docs/nexus-architecture-rebuild-phasemap.spec
M docs/nexus-live-mind-phasemap.spec
M docs/raid-verification-spine-phasemap.spec
M docs/raid-warp-verification-phasemap.spec
M docs/repair-contract-and-loom-hub-phasemap.spec
A docs/session-2026-08-14-and-15-living-schema-phasemap.spec
M docs/snapshot-trigger-phasemap.spec
D emerge-codegen-v2.js
D emerge-ide.js
D emerge-kernel.js
A emerge/codegen-v2.js
A emerge/ide.js
A emerge/kernel.js
M guardian/server.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M hooks/orchestrator.hooks.js
M idearium/agent-suite/index.js
M idearium/api/index.js
A idearium/data/specs/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5/00-document-meta-fa2352c7.md
A idearium/data/specs/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5/01-document-core-07c77984.md
A idearium/data/specs/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5/02-document-honest-risks-1342c7c1.md
A idearium/data/specs/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5.spec
A idearium/data/specs/0cfd7481-9b5e-44b6-82bf-3496a0ec97a5/manifest.json
M idearium/spec-engine/index.js
M idearium/test/e2e-pipeline.test.js
A lib/agent-model-confidence-loop.js
A lib/agent-model.js
M lib/agent-system/contracts.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/diagnostic/agent-model-confidence-loop.js
A lib/agent-tools/tools/diagnostic/agent-model.js
A lib/agent-tools/tools/diagnostic/diagnostic-engines.js
A lib/agent-tools/tools/diagnostic/gap-rating.js
A lib/agent-tools/tools/diagnostic/system-expectations.js
M lib/agent-tools/tools/identity/switch-agent.js
A lib/bus.js
A lib/cfr-influence.js
A lib/chat-target.js
M lib/compartment-engine.js
M lib/component-ledger.js
A lib/connect.js
M lib/constitutional-ai.js
M lib/contract-registry-writer.js
M lib/fault-log.js
A lib/gap-rating.js
A lib/heal-loop.js
A lib/knowledge.js
A lib/ncp-availability.js
A lib/query.js
M lib/reflection.js
A lib/system-expectations.js
M lib/version.js
M loom/bootstrap.js
M loom/data/registry.json
A loom/maps/agent-tools-map.js
M loom/maps/copilot-capability-map.js
A loom/maps/lib-consolidation-map.js
M loom/maps/observability-map.js
D loom/maps/session-2026-08-14-map.js
M loom/maps/ui-map.js
M loom/maps/warp-map.js
M loom/schema/driver.js
M loom/server.js
M meta/alk/index.js
M meta/gap/predicate.js
D nexus-bus.js
D nexus-cfr-influence.js
D nexus-connect.js
D nexus-heal-loop.js
D nexus-knowledge.js
D nexus-query.js
D ollama-runtime.js
A ollama/runtime.js
M ollama/server.js
M orchestrator.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/changelog.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M package-lock.json
M package.json
D registry-components.cortex.js
A scripts/build-userscripts.js
A scripts/migrate-phase-ids.py
A scripts/reachability-audit.js
M tests/brutal.test.js
M tests/modules/ollama-runtime.test.js
M tests/modules/test-boot-log-fixes.js
A tests/modules/test-chat-target.js
A tests/modules/test-ncp-availability.js
A userscripts/dist/README.md
A userscripts/dist/userscript-gemini.js
A userscripts/src/gemini.entry.js
A userscripts/src/shared/chat-logger.js
```

### Build 0.39.0-r26 — snap-0365 — 2026-08-17 03:41:16

- Archive: `nexus-0365_2026-08-17_v0.39.0-r26_2026-08-14-3.zip` (was `nexus-2026-08-14-3.zip`)
- SHA-256: `0cdcd5c880e30fac010df666dbdd648aeae3fd9f9a8a6ecfb2547b47e08c652d`, 19.4 MB, downloaded 2026-08-17 03:46:37
- Kind: full
- Commit: `e1f03660a32edcc450d4cc361076081b73f176da`, tag `snap-0365`
- Left out: embedded .git (104 files, HEAD 780d4d7bce10f53326a2b39fe6db654dba348c3b (master))
- Files in archive: 1896. Changes against the build before it: **14 added, 66 modified, 79 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 11 | 17 |
| data | 0 | 0 | 25 |
| docs | 0 | 14 | 7 |
| (root) | 11 | 4 | 0 |
| idearium | 0 | 4 | 9 |
| loom | 1 | 7 | 3 |
| tests | 0 | 4 | 2 |
| cortex | 0 | 3 | 3 |
| orchestrator | 0 | 4 | 0 |
| userscripts | 0 | 0 | 4 |
| copilot | 0 | 3 | 0 |
| guardian | 0 | 3 | 0 |
| scripts | 0 | 0 | 3 |
| emerge | 0 | 0 | 3 |
| cli | 0 | 2 | 0 |
| clear-glass | 0 | 2 | 0 |
| meta | 0 | 2 | 0 |
| ollama | 0 | 1 | 1 |
| architect | 0 | 0 | 2 |
| cos | 2 | 0 | 0 |
| hooks | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |

```
M CHANGELOG.md
M bridge/index.js
M clear-glass/src/gates/index.js
M clear-glass/src/providers/host.js
M cli/boot-systems.js
M cli/diagnose.js
M copilot/lib/self-model.js
M copilot/lifeline.js
M copilot/server.js
M cortex/boot.js
M cortex/intelligence/index.js
M cortex/spec/cortex.spec
A cos/spec/cos-design-v1.7.0.md
A cos/spec/cos.spec
D docs/PHASE-ID-MIGRATION.md
M docs/SPEC-REGISTRY.md
D docs/TREE-AUDIT-2026-08-14.md
M docs/agent-model-and-user-continuity-phasemap.spec
M docs/alk-gl-intelligence-canvas.spec
D docs/autonomous-build-capability-phasemap.spec
M docs/copilot-autonomous-phasemap.spec
D docs/copilot-command-and-chat-target-phasemap.spec
M docs/copilot-full-capability-phasemap.spec
M docs/copilot-omniscience-phasemap.spec
M docs/cortex-schema-registry-phasemap.spec
D docs/diagnostic-engine-system.spec
M docs/gemini-multiagent-coding-phasemap.spec
D docs/ncp-agent-connection-phasemap.spec
M docs/nexus-architecture-rebuild-phasemap.spec
M docs/nexus-live-mind-phasemap.spec
M docs/raid-verification-spine-phasemap.spec
M docs/raid-warp-verification-phasemap.spec
M docs/repair-contract-and-loom-hub-phasemap.spec
D docs/session-2026-08-14-and-15-living-schema-phasemap.spec
M docs/snapshot-trigger-phasemap.spec
A emerge-codegen-v2.js
A emerge-ide.js
A emerge-kernel.js
D emerge/codegen-v2.js
D emerge/ide.js
D emerge/kernel.js
M guardian/server.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M hooks/orchestrator.hooks.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/spec-engine/index.js
M idearium/test/e2e-pipeline.test.js
D lib/agent-model-confidence-loop.js
D lib/agent-model.js
M lib/agent-system/contracts.js
M lib/agent-tools/index.js
M lib/agent-tools/tools/browser/browser-action.js
D lib/agent-tools/tools/diagnostic/agent-model-confidence-loop.js
D lib/agent-tools/tools/diagnostic/agent-model.js
D lib/agent-tools/tools/diagnostic/diagnostic-engines.js
D lib/agent-tools/tools/diagnostic/gap-rating.js
D lib/agent-tools/tools/diagnostic/system-expectations.js
M lib/agent-tools/tools/identity/switch-agent.js
D lib/bus.js
D lib/cfr-influence.js
D lib/chat-target.js
M lib/compartment-engine.js
M lib/component-ledger.js
D lib/connect.js
M lib/constitutional-ai.js
M lib/contract-registry-writer.js
M lib/fault-log.js
D lib/gap-rating.js
D lib/heal-loop.js
D lib/knowledge.js
D lib/ncp-availability.js
D lib/query.js
M lib/reflection.js
D lib/system-expectations.js
M lib/version.js
M loom/bootstrap.js
D loom/maps/agent-tools-map.js
M loom/maps/copilot-capability-map.js
D loom/maps/lib-consolidation-map.js
M loom/maps/observability-map.js
A loom/maps/session-2026-08-14-map.js
M loom/maps/ui-map.js
M loom/maps/warp-map.js
M loom/schema/driver.js
M loom/server.js
M meta/alk/index.js
M meta/gap/predicate.js
A nexus-bus.js
A nexus-cfr-influence.js
A nexus-connect.js
A nexus-heal-loop.js
A nexus-knowledge.js
A nexus-query.js
A ollama-runtime.js
D ollama/runtime.js
M ollama/server.js
M orchestrator.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/changelog.js
M orchestrator/lib/request-handler.js
M orchestrator/lib/sigma-writer.js
M package-lock.json
M package.json
A registry-components.cortex.js
D scripts/build-userscripts.js
D scripts/migrate-phase-ids.py
D scripts/reachability-audit.js
M tests/brutal.test.js
M tests/modules/ollama-runtime.test.js
M tests/modules/test-agent-routing.js
M tests/modules/test-boot-log-fixes.js
D tests/modules/test-chat-target.js
D tests/modules/test-ncp-availability.js
D userscripts/dist/README.md
D userscripts/dist/userscript-gemini.js
D userscripts/src/gemini.entry.js
D userscripts/src/shared/chat-logger.js
```

40 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r27 — snap-0366 — 2026-08-17 04:58:58

- Archive: `nexus-0366_2026-08-17_v0.39.0-r27_checklist-enforced.zip` (was `nexus-2026-08-17-checklist-enforced.zip`)
- SHA-256: `221fe5507c4ade1b8bc736696041ae40183765ce2edef8cc4328ad8f5cbf0e33`, 20.1 MB, downloaded 2026-08-17 05:08:22
- Kind: full
- Commit: `cc467e217b3b71ec88e5b7172fb155650a6a4190`, tag `snap-0366`
- Left out: embedded .git (167 files, HEAD 49e0a13407df6700c25595733ea220846cb26d23 (master))
- Files in archive: 1979. Changes against the build before it: **83 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 67 | 0 | 0 |
| lib | 6 | 3 | 0 |
| idearium | 4 | 0 | 0 |
| cortex | 3 | 0 | 0 |
| architect | 2 | 0 | 0 |
| cos | 0 | 1 | 0 |
| loom | 1 | 0 | 0 |
| scripts | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
M cos/spec/cos.spec
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/autopilot/autopilot.log
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/constitution_decisions.json
A data/cortex/memory/copilot_identity.json
A data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
A data/cortex/memory/forged_hats.json
A data/cortex/memory/gaps.json
A data/cortex/memory/idearium_spec_chunk_events.json
A data/cortex/memory/idearium_spec_chunks.json
A data/cortex/memory/idearium_spec_manifests.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/event_log.jsonl
A data/idearium/invariant/baseline.json
A data/ledger/bridge/b.y/2026-08-17.jsonl
A data/ledger/bridge/b/2026-08-17.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-17.jsonl
A data/ledger/cortex/cortex.raid/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-17.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-08-17.jsonl
A data/ledger/forge/forge.patch/2026-08-17.jsonl
A data/ledger/guardian/g.x/2026-08-17.jsonl
A data/ledger/guardian/g/2026-08-17.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-17.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-08-17.jsonl
A data/ledger/test/test.echo.ping/2026-08-17.jsonl
A data/ledger/test/test.event.check/2026-08-17.jsonl
A data/ledger/test/test.widget.panel/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-17.jsonl
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
M lib/agent-tools/index.js
A lib/agent-tools/tools/diagnostic/system-priority.js
A lib/agent-tools/tools/governance/spec-wizard.js
A lib/agent-tools/tools/identity/intent-hat.js
M lib/gap-field.js
A lib/gap-priority.js
A lib/intent-hat-router.js
M lib/nexus-client.js
A lib/system-check.js
A loom/data/registry.json
M scripts/precommit-check.js
M service/nexus-diagnostic.js
```

### Build 0.39.0-r28 — snap-0367 — 2026-08-17 05:15:16

- Archive: `nexus-0367_2026-08-17_v0.39.0-r28_final.zip` (was `nexus-2026-08-17-final.zip`)
- SHA-256: `6aa379de7cb18ef7d0d2959fb4d3d8bef016d50a7f0765b93ebebb5bd42ed371`, 20.3 MB, downloaded 2026-08-17 08:21:54
- Kind: full
- Commit: `0727cf389dec1e15d466bfa06d3d0932c544f687`, tag `snap-0367`
- Left out: embedded .git (178 files, HEAD 445f4648c1a0c30826c39318660d3ff7f37b590a (master))
- Files in archive: 1980. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |
| data | 1 | 0 | 0 |

```
A data/loom/loom_events.buffer.jsonl
M docs/repair-contract-and-loom-hub-phasemap.spec
M loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r29 — snap-0368 — 2026-08-17 05:21:38

- Archive: `nexus-0368_2026-08-17_v0.39.0-r29_current.zip` (was `nexus - current.zip`)
- SHA-256: `525b286a638647788f8707eb95ef1d24f061d77cf9794fec0b8450b919f55b2d`, 19.6 MB, downloaded 2026-08-17 05:28:20
- Kind: full
- Commit: `9c939176fb944bc5c204525b7b5d9934140b6498`, tag `snap-0368`
- Left out: embedded .git (177 files, HEAD d1b53702ab3091b922bac3396a8a0e7cdcf246c2 (master))
- Files in archive: 1902. Changes against the build before it: **0 added, 4 modified, 78 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 68 |
| idearium | 0 | 0 | 4 |
| cortex | 0 | 0 | 3 |
| architect | 0 | 0 | 2 |
| loom | 0 | 1 | 1 |
| docs | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/invariant/baseline.json
D data/architect/baseline-events.ndjson
D data/architect/baseline.json
D data/architect/invariant/baseline.json
D data/autopilot/autopilot.log
D data/bridge/baseline-events.ndjson
D data/bridge/baseline.json
D data/bridge/invariant/baseline.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/constitution_decisions.json
D data/cortex/memory/copilot_identity.json
D data/cortex/memory/event_log.json
D data/cortex/memory/fault_log.json
D data/cortex/memory/forged_hats.json
D data/cortex/memory/gaps.json
D data/cortex/memory/idearium_spec_chunk_events.json
D data/cortex/memory/idearium_spec_chunks.json
D data/cortex/memory/idearium_spec_manifests.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/diagnostic/baseline-events.ndjson
D data/diagnostic/baseline.json
D data/diagnostic/invariant/baseline.json
D data/diagnostic/ledger/boot/events.ndjson
D data/diagnostic/ledger/gaps/events.ndjson
D data/diagnostic/ledger/poll/events.ndjson
D data/emerge/baseline-events.ndjson
D data/emerge/baseline.json
D data/emerge/invariant/baseline.json
D data/guardian/baseline-events.ndjson
D data/guardian/baseline.json
D data/guardian/invariant/baseline.json
D data/idearium/baseline-events.ndjson
D data/idearium/baseline.json
D data/idearium/event_log.jsonl
D data/idearium/invariant/baseline.json
D data/ledger/bridge/b.y/2026-08-17.jsonl
D data/ledger/bridge/b/2026-08-17.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-08-17.jsonl
D data/ledger/cortex/cortex.raid/2026-08-17.jsonl
D data/ledger/diagnostic/diagnostic.service.boot/2026-08-17.jsonl
D data/ledger/diagnostic/diagnostic.service.gaps/2026-08-17.jsonl
D data/ledger/diagnostic/diagnostic.service.poll/2026-08-17.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-08-17.jsonl
D data/ledger/forge/forge.patch/2026-08-17.jsonl
D data/ledger/guardian/g.x/2026-08-17.jsonl
D data/ledger/guardian/g/2026-08-17.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-08-17.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-08-17.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-08-17.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-08-17.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-08-17.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-08-17.jsonl
D data/ledger/test/test.echo.ping/2026-08-17.jsonl
D data/ledger/test/test.event.check/2026-08-17.jsonl
D data/ledger/test/test.widget.panel/2026-08-17.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-08-17.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-08-17.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-08-17.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-08-17.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-08-17.jsonl
D data/loom/loom_events.buffer.jsonl
D data/orchestrator/baseline-events.ndjson
D data/orchestrator/baseline.json
D data/orchestrator/invariant/baseline.json
M docs/repair-contract-and-loom-hub-phasemap.spec
D idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
D idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
D idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
D idearium/data/warp-crystals.json
D loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
M orchestrator/lib/autonomous-loop.js
M tests/modules/autonomous-loop.test.js
```

### Build 0.39.0-r30 — snap-0369 — 2026-08-17 08:48:46

- Archive: `nexus-0369_2026-08-17_v0.39.0-r30_guardian-fix.zip` (was `nexus-2026-08-17-guardian-fix.zip`)
- SHA-256: `47d4e786c23d05e619bf9292b3f60052a56fe7daf1b2f36f3e2134c0c54ad9bc`, 19.6 MB, downloaded 2026-08-17 08:51:14
- Kind: full
- Commit: `ccccd23dcf31f82091f865d45c4b7cbb0211f9c4`, tag `snap-0369`
- Left out: embedded .git (183 files, HEAD e2e85e315f1706bd7b593454ca3ac0272bb2f5d7 (master))
- Files in archive: 1905. Changes against the build before it: **3 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 3 | 0 | 0 |
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/src/userscripts/manager.js
A data/cortex/memory/guardian_settings.json
A data/guardian/ledger/boot/events.ndjson
A data/guardian/ledger/cfr/event_log.jsonl
```

### Build 0.39.0-r31 — snap-0370 — 2026-08-17 09:19:16

- Archive: `nexus-0370_2026-08-17_v0.39.0-r31_diagnostic-report.zip` (was `nexus-2026-08-17-diagnostic-report.zip`)
- SHA-256: `0cd6846b4ace4a428a81c0696e31e11f4cf18836b79bcc0801781cfd6b9f7e16`, 19.7 MB, downloaded 2026-08-17 09:21:20
- Kind: full
- Commit: `dd2fbdb4700914a4f8ad4c2607bdec55065faea0`, tag `snap-0370`
- Left out: embedded .git (186 files, HEAD 52af4cf72dfea6f4e64f10ebe7aa4c513cbb0850 (master))
- Files in archive: 1909. Changes against the build before it: **7 added, 2 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 6 | 0 | 3 |
| clear-glass | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |

```
M clear-glass/src/userscripts/manager.js
A data/cortex/memory/bep_patterns.json
A data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
D data/cortex/memory/guardian_settings.json
A data/cortex/memory/interstitial_spaces.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/settings.json
D data/guardian/ledger/boot/events.ndjson
D data/guardian/ledger/cfr/event_log.jsonl
M guardian/lib/ncp.js
A lib/diagnostic-report.js
```

### Build 0.39.0-r32 — snap-0371 — 2026-08-17 09:29:12

- Archive: `nexus-0371_2026-08-17_v0.39.0-r32_sse-announcements.zip` (was `nexus-2026-08-17-sse-announcements.zip`)
- SHA-256: `0cefb22bcf922fd09ec21d2c5a3631052a5e2cf2228bf7bac41b72b0d2de5fa0`, 19.9 MB, downloaded 2026-08-17 09:36:32
- Kind: full
- Commit: `ac24c36e445c0984401d92b50cfdca5f2f75e325`, tag `snap-0371`
- Left out: embedded .git (204 files, HEAD 6f398b38699f6f742e4b257cfe546e315231c7f1 (master))
- Files in archive: 1920. Changes against the build before it: **11 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 4 | 0 | 0 |
| idearium | 4 | 0 | 0 |
| architect | 2 | 0 | 0 |
| loom | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cos | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M cos/host/index.js
A data/knowledge/facts.jsonl
A data/ledger/event_log.jsonl
A data/ledger/orchestrator.jsonl
A data/loom/loom_events.buffer.jsonl
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
A loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
M orchestrator.js
```

### Build 0.39.0-r33 — snap-0372 — 2026-08-17 09:58:32

- Archive: `nexus-0372_2026-08-17_v0.39.0-r33_final-1.zip` (was `nexus-2026-08-17-final-1.zip`)
- SHA-256: `eccdcc30bd5ffe135ad21df170d30d0a7d760e863facedcf912ec7a7ef23b80c`, 19.9 MB, downloaded 2026-08-17 10:02:17
- Kind: full
- Commit: `235cdeaf88ddd4b4495ab688538e84cef52b4152`, tag `snap-0372`
- Left out: embedded .git (229 files, HEAD 81729710dd0d473af6112688e49a3d06eb039705 (master))
- Files in archive: 1905. Changes against the build before it: **2 added, 4 modified, 17 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 10 |
| docs | 2 | 3 | 0 |
| idearium | 0 | 0 | 4 |
| architect | 0 | 0 | 2 |
| loom | 0 | 1 | 1 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
D data/cortex/memory/bep_patterns.json
D data/cortex/memory/event_log.json
D data/cortex/memory/gaps.json
D data/cortex/memory/interstitial_spaces.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/settings.json
D data/knowledge/facts.jsonl
D data/ledger/event_log.jsonl
D data/ledger/orchestrator.jsonl
D data/loom/loom_events.buffer.jsonl
M docs/SPEC-REGISTRY.md
A docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
A docs/copilot-guardian-cos-expansion-phasemap.spec
M docs/loom-phasemap-section-phasemap.spec
M docs/nexus-self-build-pipeline-phasemap.spec
D idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
D idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
D idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
D idearium/data/warp-crystals.json
D loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r34 — snap-0373 — 2026-08-17 10:01:50

- Archive: `nexus-0373_2026-08-17_v0.39.0-r34_phase-history.zip` (was `nexus-2026-08-17-phase-history.zip`)
- SHA-256: `3f8b174dc514587bf6daad122db1faf45eadea1c50d086f0338c41857f84be29`, 20 MB, downloaded 2026-08-17 10:09:48
- Kind: full
- Commit: `de45d42d5a04068ed6039ea974e33361bddb9430`, tag `snap-0373`
- Left out: embedded .git (229 files, HEAD 81729710dd0d473af6112688e49a3d06eb039705 (master))
- Files in archive: 1912. Changes against the build before it: **7 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 7 | 0 | 0 |

```
A data/cortex/memory/bep_patterns.json
A data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
A data/cortex/memory/interstitial_spaces.json
A data/cortex/memory/phasemap_history.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/settings.json
```

### Build 0.39.0-r35 — snap-0374 — 2026-08-17 11:27:34

- Archive: `nexus-0374_2026-08-17_v0.39.0-r35_ledger-wire-person-model.zip` (was `nexus-2026-08-17-ledger-wire-person-model.zip`)
- SHA-256: `e2026c3520e2d5752ecdaaade52ba8eb5d5c3dfe2674090a4f825f7002cec71d`, 21.7 MB, downloaded 2026-08-17 14:51:05
- Kind: full
- Commit: `8e14ec09b3df0c027985742327ab339111581150`, tag `snap-0374`
- Left out: embedded .git (201 files, HEAD e6dae51ecc3f7f49c8bd45fc352341f9cf4ded54 (master))
- Files in archive: 2019. Changes against the build before it: **113 added, 20 modified, 6 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 86 | 4 | 3 |
| cortex | 11 | 0 | 0 |
| copilot | 3 | 2 | 0 |
| docs | 0 | 3 | 2 |
| idearium | 4 | 0 | 0 |
| tests | 2 | 2 | 0 |
| (root) | 0 | 3 | 0 |
| lib | 2 | 0 | 1 |
| loom | 2 | 1 | 0 |
| architect | 2 | 0 | 0 |
| cos | 0 | 2 | 0 |
| guardian | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tools | 1 | 0 | 0 |

```
M CHANGELOG-SESSION.md
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M autopilot.js
A copilot/lib/person-model/index.js
A copilot/lib/person-model/lattice.js
M copilot/registry-components.js
M copilot/server.js
A copilot/ui/person-model.html
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A cortex/data/snapshots/01ce6a57-0c83-4ef3-acc9-952e5c5a0624.nex
A cortex/data/snapshots/02d77ba9-8eb7-482d-8e87-b304b13a4b7d.nex
A cortex/data/snapshots/5030078e-2a15-4b42-b55e-0a920d0ee17e.nex
A cortex/data/snapshots/7e504b80-927b-4294-8e1a-730a6dc20903.nex
A cortex/data/snapshots/813e4090-609d-4731-a106-17942e327fd9.nex
A cortex/data/snapshots/b8f9b2aa-fcec-4c57-a150-40e9e233be8f.nex
A cortex/data/snapshots/e04c8ae0-22ba-4d06-ae3d-31e6e4b669ce.nex
A cortex/data/snapshots/e43f1c03-301b-4039-8355-bc6e691ba6f8.nex
M cos/host/index.js
M cos/kernel.js
A data/architect/baseline-events.ndjson
A data/architect/baseline.json
A data/architect/invariant/baseline.json
A data/autopilot/autopilot.log
A data/bridge/baseline-events.ndjson
A data/bridge/baseline.json
A data/bridge/invariant/baseline.json
A data/copilot/chat_log.buffer.jsonl
D data/cortex/memory/bep_patterns.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/constitution_decisions.json
A data/cortex/memory/copilot_identity.json
M data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
A data/cortex/memory/forged_hats.json
M data/cortex/memory/gaps.json
A data/cortex/memory/idearium_spec_chunk_events.json
A data/cortex/memory/idearium_spec_chunks.json
A data/cortex/memory/idearium_spec_manifests.json
D data/cortex/memory/interstitial_spaces.json
D data/cortex/memory/phasemap_history.json
M data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
M data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/diagnostic/baseline-events.ndjson
A data/diagnostic/baseline.json
A data/diagnostic/invariant/baseline.json
A data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
A data/diagnostic/ledger/poll/events.ndjson
A data/emerge/baseline-events.ndjson
A data/emerge/baseline.json
A data/emerge/invariant/baseline.json
A data/guardian/baseline-events.ndjson
A data/guardian/baseline.json
A data/guardian/invariant/baseline.json
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_stats.json
A data/idearium/baseline-events.ndjson
A data/idearium/baseline.json
A data/idearium/event_log.jsonl
A data/idearium/invariant/baseline.json
A data/ledger/bridge/b.y/2026-08-17.jsonl
A data/ledger/bridge/b/2026-08-17.jsonl
A data/ledger/copilot/copilot.lifeline/2026-08-17.jsonl
A data/ledger/copilot/copilot.person-model/2026-08-17.jsonl
A data/ledger/copilot/copilot.person-model/session-first.jsonl
A data/ledger/copilot/copilot.person-model/session-h1.jsonl
A data/ledger/copilot/copilot.person-model/session-h2.jsonl
A data/ledger/copilot/copilot.person-model/session-own.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
A data/ledger/copilot/copilot.person-model/session-x1.jsonl
A data/ledger/copilot/copilot.prompt/2026-08-17.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-17.jsonl
A data/ledger/cortex/cortex.raid/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-17.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-17.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-08-17.jsonl
A data/ledger/forge/forge.patch/2026-08-17.jsonl
A data/ledger/guardian/g.x/2026-08-17.jsonl
A data/ledger/guardian/g/2026-08-17.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-17.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-17.jsonl
A data/ledger/nexus/autopilot.supervisor/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/copilot.grammar-fallback/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/copilot.person-model/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/copilot.registry-components/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/copilot.self-model/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/copilot.server/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/cortex.foundation.admin-server/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/cos.kernel/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/lib.error-log/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/nexus/lib.ledger-sse/session-build-2026-08-17-ledger-wire-person-model.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-08-17.jsonl
A data/ledger/test/test.echo.ping/2026-08-17.jsonl
A data/ledger/test/test.event.check/2026-08-17.jsonl
A data/ledger/test/test.widget.panel/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-17.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-17.jsonl
A data/orchestrator/baseline-events.ndjson
A data/orchestrator/baseline.json
A data/orchestrator/invariant/baseline.json
M docs/SPEC-REGISTRY.md
D docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
D docs/copilot-guardian-cos-expansion-phasemap.spec
M docs/loom-phasemap-section-phasemap.spec
M docs/nexus-self-build-pipeline-phasemap.spec
M guardian/lib/ncp.js
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
D lib/diagnostic-report.js
A lib/error-log.js
A lib/ledger-sse.js
A loom/data/registry.json
A loom/maps/ledger-wire-person-model-map.js
M loom/maps/session-2026-08-14-map.js
M orchestrator.js
M orchestrator/lib/autonomous-loop.js
M service/nexus-diagnostic.js
M tests/modules/autonomous-loop.test.js
M tests/modules/run-all.js
A tests/modules/test-ledger-sse.js
A tests/modules/test-person-model.js
A tools/record-session-2026-08-17.js
```

### Build 0.39.0-r36 — snap-0375 — 2026-08-17 15:01:18

- Archive: `nexus-0375_2026-08-17_v0.39.0-r36_merged-current.zip` (was `nexus-2026-08-17-merged-current.zip`)
- SHA-256: `f9498fc87b7613d578bfea74dd1ac27e37f7c52478cdf8c0c75fc706181ea7ec`, 21.5 MB, downloaded 2026-08-17 15:03:38
- Kind: full
- Commit: `5d65738d65c8becba05e18701fdb2210f0cf8814`, tag `snap-0375`
- Left out: embedded .git (277 files, HEAD a46807653f97f0740554fbe7b94b7d2cb116001a (master))
- Left out: node_modules (55 files)
- Files in archive: 2288. Changes against the build before it: **317 added, 65 modified, 48 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 314 | 51 | 39 |
| cortex | 0 | 3 | 8 |
| docs | 2 | 3 | 0 |
| architect | 0 | 1 | 1 |
| loom | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cos | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 1 | 0 | 0 |
| orchestrator | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M cos/host/index.js
M docs/SPEC-REGISTRY.md
A docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
A docs/copilot-guardian-cos-expansion-phasemap.spec
M docs/loom-phasemap-section-phasemap.spec
M docs/nexus-self-build-pipeline-phasemap.spec
M guardian/lib/ncp.js
A lib/diagnostic-report.js
M loom/maps/session-2026-08-14-map.js
M orchestrator.js
M orchestrator/lib/autonomous-loop.js
M tests/modules/autonomous-loop.test.js
```

418 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r37 — snap-0376 — 2026-08-17 15:22:36

- Archive: `nexus-0376_2026-08-17_v0.39.0-r37_ga3-ga9.zip` (was `nexus-2026-08-17-ga3-ga9.zip`)
- SHA-256: `1b9ea6f209995b9148990db7b53e75b3aee4a1ab8594a17fca407dac9ea8a060`, 21.7 MB, downloaded 2026-08-17 15:43:16
- Kind: full
- Commit: `864022e287f401ec8e219276390289f5f5a806c6`, tag `snap-0376`
- Left out: embedded .git (292 files, HEAD 0392abc7c89a6dadf0f64b10274d2400103395d8 (master))
- Left out: node_modules (55 files)
- Files in archive: 2289. Changes against the build before it: **1 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 5 | 0 |
| loom | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M copilot/server.js
M data/cortex/memory/guardian_settings.json
A data/cortex/memory/raid_decisions.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/loom/loom_events.buffer.jsonl
M guardian/server.js
M loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r38 — snap-0377 — 2026-08-17 16:58:32

- Archive: `nexus-0377_2026-08-17_v0.39.0-r38_mapped-v2.zip` (was `nexus-2026-08-17-mapped-v2.zip`)
- SHA-256: `181745951ad70e6c3b135e3738e02a20893c981938cafc765ec22ada1516be9b`, 19.9 MB, downloaded 2026-08-27 10:33:14
- Kind: full
- Commit: `76f98860e1f96126c14b7ef45cfbb1402e012f21`, tag `snap-0377`
- Left out: embedded .git (229 files, HEAD 81729710dd0d473af6112688e49a3d06eb039705 (master))
- Files in archive: 1905. Changes against the build before it: **0 added, 9 modified, 384 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 366 |
| copilot | 0 | 2 | 3 |
| idearium | 0 | 0 | 4 |
| cortex | 0 | 0 | 3 |
| loom | 0 | 1 | 2 |
| tests | 0 | 1 | 2 |
| (root) | 0 | 2 | 0 |
| lib | 0 | 0 | 2 |
| architect | 0 | 0 | 1 |
| cos | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tools | 0 | 0 | 1 |

```
M CHANGELOG-SESSION.md
M autopilot.js
D copilot/lib/person-model/index.js
D copilot/lib/person-model/lattice.js
M copilot/registry-components.js
M copilot/server.js
D copilot/ui/person-model.html
M cos/kernel.js
M guardian/server.js
D lib/error-log.js
D lib/ledger-sse.js
D loom/maps/ledger-wire-person-model-map.js
M loom/maps/session-2026-08-14-map.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
D tests/modules/test-ledger-sse.js
D tests/modules/test-person-model.js
D tools/record-session-2026-08-17.js
```

375 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r39 — snap-0378 — 2026-08-17 20:21:58

- Archive: `nexus-0378_2026-08-17_v0.39.0-r39_ram-fixes.zip` (was `nexus-2026-08-17-ram-fixes.zip`)
- SHA-256: `c4925f3cfc722b1b1440c83beac686a6de2ffafe1382668fa14ac3975d366412`, 21.9 MB, downloaded 2026-08-17 20:31:53
- Kind: full
- Commit: `65809e57956107c3a95ba66087d985d564300695`, tag `snap-0378`
- Left out: embedded .git (326 files, HEAD 3b6ab6a8bf7fe5babaae0e68c68ce5432bd36e33 (master))
- Left out: node_modules (55 files)
- Files in archive: 2292. Changes against the build before it: **387 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 368 | 0 | 0 |
| idearium | 5 | 2 | 0 |
| copilot | 3 | 2 | 0 |
| cortex | 3 | 1 | 0 |
| loom | 2 | 1 | 0 |
| tests | 2 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| lib | 2 | 0 | 0 |
| architect | 1 | 0 | 0 |
| clear-glass | 0 | 1 | 0 |
| cos | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| tools | 1 | 0 | 0 |

```
M CHANGELOG-SESSION.md
M autopilot.js
M clear-glass/src/diagnostic/error-capture.js
A copilot/lib/person-model/index.js
A copilot/lib/person-model/lattice.js
M copilot/registry-components.js
M copilot/server.js
A copilot/ui/person-model.html
M cortex/intelligence/index.js
M cos/kernel.js
M guardian/server.js
M idearium/api/index.js
M idearium/spec-engine/templates.js
A lib/error-log.js
A lib/ledger-sse.js
A loom/maps/ledger-wire-person-model-map.js
M loom/maps/session-2026-08-14-map.js
M service/nexus-diagnostic.js
M tests/modules/run-all.js
A tests/modules/test-ledger-sse.js
A tests/modules/test-person-model.js
A tools/record-session-2026-08-17.js
```

378 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r40 — snap-0379 — 2026-08-17 20:35:14

- Archive: `nexus-0379_2026-08-17_v0.39.0-r40_bottom-up-qa.zip` (was `nexus-2026-08-17-bottom-up-qa.zip`)
- SHA-256: `8e49f6664ad370989e3319f55c9c58e4affd10e3160b160de9abcea74ecf3b1c`, 22 MB, downloaded 2026-08-17 20:41:33
- Kind: full
- Commit: `9bbf8be7b178251621f5322764fc4de25c582094`, tag `snap-0379`
- Left out: embedded .git (330 files, HEAD 2b12e942a659d78515062f49487683ad841576b4 (master))
- Left out: node_modules (55 files)
- Files in archive: 2292. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 1 | 0 |

```
M guardian/server.js
```

### Build 0.39.0-r41 — snap-0380 — 2026-08-17 20:43:36

- Archive: `nexus-0380_2026-08-17_v0.39.0-r41_full-sweep.zip` (was `nexus-2026-08-17-full-sweep.zip`)
- SHA-256: `7cc6667d0bf734b2685d4a2e90dbf4b717436746d400b81260066b7bfc799a41`, 22 MB, downloaded 2026-08-17 20:46:38
- Kind: full
- Commit: `c8995d91388e01e5c076aa39edd578458e0712e3`, tag `snap-0380`
- Left out: embedded .git (335 files, HEAD 54b3fa16418a308c0bc3c3dc140da1ff34d2f70e (master))
- Left out: node_modules (55 files)
- Files in archive: 2292. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 1 | 0 |

```
M cortex/intelligence/index.js
```

### Build 0.39.0-r42 — snap-0381 — 2026-08-17 20:48:30

- Archive: `nexus-0381_2026-08-17_v0.39.0-r42_2026-08-18-foundation.zip` (was `nexus-2026-08-18-foundation.zip`)
- SHA-256: `088d0ad770e791f6507ff3ef7bd77ed2549e830d0ea9c8c2ca088b6cc633176f`, 22.1 MB, downloaded 2026-08-17 20:55:16
- Kind: full
- Commit: `28ddea51481340f1d44834c5db49e12ab82fb406`, tag `snap-0381`
- Left out: embedded .git (340 files, HEAD 72e894324c204500582726a38cc83c540a4acef2 (master))
- Left out: node_modules (55 files)
- Files in archive: 2293. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 1 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M data/cortex/memory/gaps.json
M docs/SPEC-REGISTRY.md
A docs/ncp.spec
```

### Build 0.39.0-r43 — snap-0382 — 2026-08-17 21:08:56

- Archive: `nexus-0382_2026-08-17_v0.39.0-r43_2026-08-18-intelligence-v2.zip` (was `nexus-2026-08-18-intelligence-v2.zip`)
- SHA-256: `26ae8ba8b53551f8c98adae2058d860c4cd695787e916f070ad09a07a0428eb9`, 22.2 MB, downloaded 2026-08-17 21:12:39
- Kind: full
- Commit: `aca0910c480957421110152025d1430b20d1462a`, tag `snap-0382`
- Left out: embedded .git (363 files, HEAD b8ab046e23ba4d63fe93aa515061cbd8f4d894af (master))
- Left out: node_modules (55 files)
- Files in archive: 2293. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M autopilot.js
M copilot/lib/self-model.js
M cortex/boot.js
M cortex/intelligence/index.js
M lib/autopilot-intelligence.js
```

### Build 0.39.0-r44 — snap-0383 — 2026-08-17 21:13:22

- Archive: `nexus-0383_2026-08-17_v0.39.0-r44_2026-08-18-cross-system.zip` (was `nexus-2026-08-18-cross-system.zip`)
- SHA-256: `837a5991ef2ce3ce8b609a0b14c051f80c84bd5b26bdd0a6db9d3dc912bd02eb`, 22.3 MB, downloaded 2026-08-17 21:15:23
- Kind: full
- Commit: `fbf36362f3baa83e8771cf8db2ce46f46dedee92`, tag `snap-0383`
- Left out: embedded .git (368 files, HEAD d580f9e1ceab3d296848def039eb086c3260e2ce (master))
- Left out: node_modules (55 files)
- Files in archive: 2293. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 1 | 0 |

```
M cortex/intelligence/index.js
```

### Build 0.39.0-r45 — snap-0384 — 2026-08-17 21:16:22

- Archive: `nexus-0384_2026-08-17_v0.39.0-r45_2026-08-18-adaptive-threshold.zip` (was `nexus-2026-08-18-adaptive-threshold.zip`)
- SHA-256: `bfd03ffe0a290b30f32b1a9328d4268d7ddc0e5eb2d5203b03bf581e6386360b`, 22.3 MB, downloaded 2026-08-17 21:21:36
- Kind: full
- Commit: `ee769f339e2a13a56168009dc6cabf1f3d0a195e`, tag `snap-0384`
- Left out: embedded .git (373 files, HEAD c56c726195f845dae8c343608175066b346c4c4a (master))
- Left out: node_modules (55 files)
- Files in archive: 2293. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 0 | 1 | 0 |

```
M cortex/intelligence/index.js
```

### Build 0.39.0-r46 — snap-0385 — 2026-08-17 21:30:22

- Archive: `nexus-0385_2026-08-17_v0.39.0-r46_2026-08-18-escalation-tools.zip` (was `nexus-2026-08-18-escalation-tools.zip`)
- SHA-256: `210a50413c51c440520b2b3ca4d34edd4572b4e343a9bbd5b710184c13948e63`, 22.4 MB, downloaded 2026-08-17 21:32:11
- Kind: full
- Commit: `33beacd7db3174aea249e8168901ec25282c4d98`, tag `snap-0385`
- Left out: embedded .git (385 files, HEAD 69f1330d9e469a872675e3392a357358912f8245 (master))
- Left out: node_modules (55 files)
- Files in archive: 2293. Changes against the build before it: **0 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M copilot/lifeline.js
M data/cortex/memory/raid_decisions.json
M data/cortex/memory/tool_index.json
M guardian/ask.js
M guardian/server.js
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r47 — snap-0386 — 2026-08-17 21:35:06

- Archive: `nexus-0386_2026-08-17_v0.39.0-r47_2026-08-18-self-repair.zip` (was `nexus-2026-08-18-self-repair.zip`)
- SHA-256: `761fc795e44dbbae6ad29ac5798631d560846ba13329ebf638e76af58130ed67`, 22.4 MB, downloaded 2026-08-17 21:36:25
- Kind: full
- Commit: `374a5603800a05419b07430ee6fb53bdd322b22b`, tag `snap-0386`
- Left out: embedded .git (400 files, HEAD ac8cc525d28e0b6c2ea7b33994c4ae6149ea5681 (master))
- Left out: node_modules (55 files)
- Files in archive: 2294. Changes against the build before it: **1 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
M lib/agent-tools/index.js
A lib/agent-tools/tools/query/search-files.js
M lib/agent-tools/tools/sandbox/cos-compartment.js
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r48 — snap-0387 — 2026-08-17 21:40:10

- Archive: `nexus-0387_2026-08-17_v0.39.0-r48_2026-08-18-self-repair-pipeline.zip` (was `nexus-2026-08-18-self-repair-pipeline.zip`)
- SHA-256: `052fabbec140bea79dada990395ae148d8a02b5683ff1a37a501f36d06394abb`, 22.5 MB, downloaded 2026-08-17 22:11:45
- Kind: full
- Commit: `390930422aceb47189eb7aaad3169fc356cccd6f`, tag `snap-0387`
- Left out: embedded .git (413 files, HEAD 97c7c848a90b40ce35de26b6b82ac16d99270fae (master))
- Left out: node_modules (55 files)
- Files in archive: 2295. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M lib/agent-tools/index.js
A lib/agent-tools/tools/sandbox/self-repair.js
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r49 — snap-0388 — 2026-08-17 22:15:56

- Archive: `nexus-0388_2026-08-17_v0.39.0-r49_2026-08-18-copilot-tools-default.zip` (was `nexus-2026-08-18-copilot-tools-default.zip`)
- SHA-256: `04739b59bce119b41e875f79307a80fbc10d1b2e8242145f2f815fb8fcc2729d`, 22.5 MB, downloaded 2026-08-17 22:20:46
- Kind: full
- Commit: `6fc494b2c35c407d91f613938a2009dee576a141`, tag `snap-0388`
- Left out: embedded .git (417 files, HEAD 9013b3693af21f3237eb147ac26afc90ec4f7b22 (master))
- Left out: node_modules (55 files)
- Files in archive: 2295. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |

```
M copilot/server.js
M data/cortex/memory/raid_decisions.json
M data/cortex/memory/tool_index.json
```

### Build 0.39.0-r50 — snap-0389 — 2026-08-18 08:52:34

- Archive: `nexus-0389_2026-08-18_v0.39.0-r50_agent-ids.zip` (was `nexus-2026-08-18-agent-ids.zip`)
- SHA-256: `8d2f78bebabb1172a6a08951a33425309698b5b325f960bc0a6cf6f66f80f94b`, 22.9 MB, downloaded 2026-08-18 09:03:19
- Kind: full
- Commit: `68ffaaa9c71d0ef1befe6a76a3fcdbab5f15ecba`, tag `snap-0389`
- Left out: embedded .git (477 files, HEAD 6e9051cd543e2c70006aa5d0384cd56c23c081cc (master))
- Left out: node_modules (55 files)
- Files in archive: 2299. Changes against the build before it: **4 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 5 | 0 |
| copilot | 0 | 3 | 0 |
| docs | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| tests | 1 | 0 | 0 |

```
M copilot/lib/grammar-router.js
M copilot/lib/self-model.js
M copilot/server.js
M cortex/core/raid/index.js
M data/cortex/memory/constitution_decisions.json
A data/cortex/memory/copilot_identity.json
M data/cortex/memory/event_log.json
M data/cortex/memory/forged_hats.json
M data/cortex/memory/gaps.json
A data/cortex/memory/raid_tunables.json
M data/loom/loom_events.buffer.jsonl
M docs/SPEC-REGISTRY.md
A docs/session-2026-08-18-axioms-governed-phasemap.spec
M guardian/ask.js
M lib/hat-forge.js
M loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
M ollama/server.js
A tests/modules/grammar-router-closed-loop.test.js
```

### Build 0.39.0-r51 — snap-0390 — 2026-08-18 13:53:14

- Archive: `nexus-0390_2026-08-18_v0.39.0-r51_session.zip` (was `nexus-2026-08-18-session.zip`)
- SHA-256: `a6a3fed837b58bca188189b55b834dbb5e2ee2b837a1a713ddfe0357316d3be3`, 0.2 MB, downloaded 2026-08-18 13:55:49
- Kind: overlay (a patch laid over the build before it)
- Commit: `3e3826610408beccfbe56e4827167077a9435df0`, tag `snap-0390`
- Files in archive: 23. Changes against the build before it: **11 added, 12 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 5 | 0 |
| docs | 3 | 1 | 0 |
| tests | 3 | 1 | 0 |
| clear-glass | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| ui | 1 | 0 | 0 |

```
M README.md
A clear-glass/src/providers/download-capture.js
M clear-glass/src/providers/host.js
A cli/pressure.js
M copilot/lib/self-model.js
M cortex/memory/jaa-db.js
A docs/MAP-2026-08-18-pressure-and-toolkit.md
M docs/SPEC-REGISTRY.md
A docs/clear-glass-toolkit.spec
A docs/pressure-causality.spec
M guardian/server.js
M lib/agent-tools/tools/identity/hat-forge.js
M lib/hat-forge.js
M lib/hat-seed.js
A lib/intake.js
M lib/intent-hat-router.js
A lib/pressure-window.js
M lib/scheduler.js
M tests/modules/run-all.js
A tests/modules/test-hat-forge.js
A tests/modules/test-intake.js
A tests/modules/test-pressure-window.js
A ui/pressure/index.html
```

### Build 0.39.0-r52 — snap-0391 — 2026-08-18 17:21:44

- Archive: `nexus-0391_2026-08-18_v0.39.0-r52_freeze-thaw.zip` (was `nexus-2026-08-18-freeze-thaw.zip`)
- SHA-256: `352a64e361df2d4fe60f1c17343cd890878cb078794bf407a36668c0f23eb517`, 23 MB, downloaded 2026-08-18 17:25:56
- Kind: full
- Commit: `2eba4b076814eba66793aaca0b201b144739acfb`, tag `snap-0391`
- Left out: embedded .git (493 files, HEAD 0ea4fc83136dd1c006ac77a864c203bbf6e7b2ba (master))
- Left out: node_modules (55 files)
- Files in archive: 2301. Changes against the build before it: **1 added, 12 modified, 10 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 4 | 2 |
| docs | 0 | 1 | 3 |
| clear-glass | 0 | 2 | 1 |
| tests | 0 | 1 | 2 |
| data | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 0 | 1 |
| copilot | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| ui | 0 | 0 | 1 |

```
M README.md
M clear-glass/src/main/index.js
D clear-glass/src/providers/download-capture.js
M clear-glass/src/providers/host.js
D cli/pressure.js
M copilot/lib/self-model.js
M data/cortex/memory/forged_hats.json
A data/cortex/memory/hat_forge_isolation_probe.json
D docs/MAP-2026-08-18-pressure-and-toolkit.md
M docs/SPEC-REGISTRY.md
D docs/clear-glass-toolkit.spec
D docs/pressure-causality.spec
M guardian/server.js
M lib/agent-tools/tools/identity/hat-forge.js
M lib/hat-seed.js
D lib/intake.js
M lib/intent-hat-router.js
D lib/pressure-window.js
M lib/scheduler.js
M tests/modules/run-all.js
D tests/modules/test-intake.js
D tests/modules/test-pressure-window.js
D ui/pressure/index.html
```

### Build 0.39.0-r53 — snap-0392 — 2026-08-18 19:50:34

- Archive: `nexus-0392_2026-08-18_v0.39.0-r53_2026-08-19-hey-nexus-merged.zip` (was `nexus-2026-08-19-hey-nexus-merged.zip`)
- SHA-256: `4bdba7496e0823ded6bf7f5c7ac4d019f51b27cb85c3c51cce754b6ed0fb5c6f`, 9.8 MB, downloaded 2026-08-18 19:53:06
- Kind: full
- Commit: `034671d02116058b284f14456f8e7ffa2fd9f410`, tag `snap-0392`
- Identical copy: `nexus-0392_2026-08-18_v0.39.0-r53_2026-08-19-hey-nexus-merged-1_dup1.zip` (was `nexus-2026-08-19-hey-nexus-merged-1.zip`)
- Files in archive: 2316. Changes against the build before it: **15 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 6 | 2 | 0 |
| guardian | 2 | 4 | 0 |
| tests | 5 | 1 | 0 |
| copilot | 0 | 2 | 0 |
| data | 1 | 1 | 0 |
| (root) | 1 | 0 | 0 |
| clear-glass | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |

```
A MERGE-NOTES-2026-08-19.md
M clear-glass/src/providers/host.js
M copilot/registry-components.js
M copilot/server.js
M cortex/memory/jaa-db.js
M data/cortex/memory/tool_index.json
A data/ledger/copilot/copilot.introspect/2026-08-19.jsonl
A guardian/HOOKUP.md
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
A guardian/userscript-nexus-wake.js
M guardian/userscript-perplexity.js
A lib/agent-capability.js
A lib/agent-chat.js
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
A lib/agent-tools/tools/coordination/agent-chat.js
A lib/end-state.js
A lib/introspect.js
A lib/work-queue.js
M ollama/server.js
M tests/modules/run-all.js
A tests/modules/test-agent-capability.js
A tests/modules/test-end-state.js
A tests/modules/test-introspect.js
A tests/modules/test-nexus-wake.js
A tests/modules/test-work-queue.js
```

### Build 0.39.0-r54 — snap-0393 — 2026-08-18 20:01:06

- Archive: `nexus-0393_2026-08-18_v0.39.0-r54_2026-08-19-hey-nexus-wired.zip` (was `nexus-2026-08-19-hey-nexus-wired.zip`)
- SHA-256: `64049266ebe98fa9f6f7ce0ac4fde052c3491b078fa543926feb7d6de04e49fa`, 9.6 MB, downloaded 2026-08-18 20:08:47
- Kind: full
- Commit: `11a88c5fe2be32524dbcc4fb91d2e27f4025bc19`, tag `snap-0393`
- Files in archive: 2261. Changes against the build before it: **0 added, 1 modified, 55 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 0 | 23 |
| bridge | 0 | 0 | 16 |
| tests | 0 | 0 | 5 |
| lib | 0 | 0 | 4 |
| (root) | 0 | 0 | 3 |
| data | 0 | 0 | 2 |
| guardian | 0 | 0 | 2 |
| copilot | 0 | 1 | 0 |

```
D .gitignore
D .mcp.json
D MERGE-NOTES-2026-08-19.md
D bridge/causal/expectation.js
D bridge/causal/graph.js
D bridge/causal/ledger.js
D bridge/causal/projections.js
D bridge/causal/schema.js
D bridge/causal/server.js
D bridge/identity.js
D bridge/index.js
D bridge/interaction-contract.json
D bridge/ledger.js
D bridge/registry-components.js
D bridge/registry.js
D bridge/router.js
D bridge/server.js
D bridge/spec/bridge.spec
D bridge/types.js
D clear-glass/README.md
D clear-glass/fix-orchestrator.js
D clear-glass/package.json
D clear-glass/registry-components.js
D clear-glass/renderer/browser.css
D clear-glass/renderer/browser.html
D clear-glass/renderer/browser.js
D clear-glass/renderer/settings.html
D clear-glass/siso/index.js
D clear-glass/siso/package.json
D clear-glass/src/api/settings.js
D clear-glass/src/dom/archaeology.js
D clear-glass/src/driver/index.js
D clear-glass/src/driver/url-listener.js
D clear-glass/src/fingerprint/engine.js
D clear-glass/src/mesh/agent-mesh.js
D clear-glass/src/options/store.js
D clear-glass/src/providers/gm-shim.js
D clear-glass/src/providers/host.js
D clear-glass/src/providers/registry.js
D clear-glass/src/seam/index.js
D clear-glass/src/sse/server.js
D clear-glass/src/userscripts/manager.js
M copilot/server.js
D data/diagnostic/diagnostic.pid
D data/ledger/copilot/copilot.introspect/2026-08-19.jsonl
D guardian/HOOKUP.md
D guardian/userscript-nexus-wake.js
D lib/agent-tools/tools/coordination/agent-chat.js
D lib/end-state.js
D lib/introspect.js
D lib/work-queue.js
D tests/modules/test-agent-capability.js
D tests/modules/test-end-state.js
D tests/modules/test-introspect.js
D tests/modules/test-nexus-wake.js
D tests/modules/test-work-queue.js
```

### artifact — 0394 — 2026-08-19 01:15:12

- Archive: `nexus-0394_2026-08-19_v0.39.0-side_pipeline.zip` (was `nexus-2026-08-19-pipeline.zip`)
- SHA-256: `6e8b4a6865271d1698c810b740ab320e06f7d033d511255cc3c62c56edbdc385`, 0.1 MB, downloaded 2026-08-19 01:15:52
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `73b4afff4fc38133f09067ac7a51763eb8493022`, tag `snap-0394`
- Files in archive: 15. Changes against the build before it: **15 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0394_2026-08-19_unversioned_pipeline | 15 | 0 | 0 |

```
A nexus-0394_2026-08-19_unversioned_pipeline/README.md
A nexus-0394_2026-08-19_unversioned_pipeline/clear-glass/src/providers/download-capture.js
A nexus-0394_2026-08-19_unversioned_pipeline/cli/pressure.js
A nexus-0394_2026-08-19_unversioned_pipeline/docs/MAP-2026-08-18-pressure-and-toolkit.md
A nexus-0394_2026-08-19_unversioned_pipeline/docs/MAP-2026-08-19-idearium-agent-pipeline.md
A nexus-0394_2026-08-19_unversioned_pipeline/docs/SPEC-REGISTRY.md
A nexus-0394_2026-08-19_unversioned_pipeline/docs/clear-glass-toolkit.spec
A nexus-0394_2026-08-19_unversioned_pipeline/docs/idearium-agent-pipeline.spec
A nexus-0394_2026-08-19_unversioned_pipeline/docs/pressure-causality.spec
A nexus-0394_2026-08-19_unversioned_pipeline/guardian/server.js
A nexus-0394_2026-08-19_unversioned_pipeline/lib/intake.js
A nexus-0394_2026-08-19_unversioned_pipeline/lib/pressure-window.js
A nexus-0394_2026-08-19_unversioned_pipeline/tests/modules/test-intake.js
A nexus-0394_2026-08-19_unversioned_pipeline/tests/modules/test-pressure-window.js
A nexus-0394_2026-08-19_unversioned_pipeline/ui/pressure/index.html
```

### artifact — 0395 — 2026-08-19 01:41:24

- Archive: `nexus-0395_2026-08-19_v0.39.0-side_tool-config.zip` (was `nexus-tool-config.zip`)
- SHA-256: `c32ae0e7d8318c65b1d05fcdb97bcb0cc6e584c7e8d8e466a07f882ffb2f88ae`, 0 MB, downloaded 2026-08-19 02:03:22
- Kind: artifact (side bundle, on the artifacts branch)
- Commit: `fdff9e4a13903ff38da52bd49cf61514603e6ee9`, tag `snap-0395`
- Files in archive: 12. Changes against the build before it: **12 added, 0 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| nexus-0395_2026-08-19_unversioned_tool-config | 12 | 0 | 0 |

```
A nexus-0395_2026-08-19_unversioned_tool-config/README.md
A nexus-0395_2026-08-19_unversioned_tool-config/docs/copilot-tool-system.spec
A nexus-0395_2026-08-19_unversioned_tool-config/lib/agent-reach.js
A nexus-0395_2026-08-19_unversioned_tool-config/lib/agent-tools/index.js
A nexus-0395_2026-08-19_unversioned_tool-config/lib/agent-tools/tools/governance/tool-config.js
A nexus-0395_2026-08-19_unversioned_tool-config/lib/agent-tools/tools/identity/switch-agent.js
A nexus-0395_2026-08-19_unversioned_tool-config/lib/tool-config.js
A nexus-0395_2026-08-19_unversioned_tool-config/tests/modules/run-all.js
A nexus-0395_2026-08-19_unversioned_tool-config/tests/modules/test-agent-reach.js
A nexus-0395_2026-08-19_unversioned_tool-config/tests/modules/test-copilot-probe.js
A nexus-0395_2026-08-19_unversioned_tool-config/tests/modules/test-tool-config.js
A nexus-0395_2026-08-19_unversioned_tool-config/tests/probe/copilot-probe.js
```

### Build 0.39.0-r55 — snap-0396 — 2026-08-19 06:07:46

- Archive: `nexus-0396_2026-08-19_v0.39.0-r55_agents-converse.zip` (was `nexus-2026-08-19-agents-converse.zip`)
- SHA-256: `80cad074a6ed0694c8a5e1a4be26e92f393fbec1e33b9dfe4d6c92584841ffd0`, 23.4 MB, downloaded 2026-08-19 06:09:17
- Kind: full
- Commit: `f7cf925d29d268a768b39b8526d8239350bb2316`, tag `snap-0396`
- Left out: embedded .git (567 files, HEAD cdde8efa4932f2fe2ea522dbc25b949237c26e76 (master))
- Left out: node_modules (55 files)
- Files in archive: 2315. Changes against the build before it: **54 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 23 | 0 | 0 |
| bridge | 16 | 0 | 0 |
| lib | 4 | 3 | 0 |
| tests | 5 | 1 | 0 |
| data | 3 | 1 | 0 |
| (root) | 2 | 0 | 0 |
| copilot | 0 | 2 | 0 |
| guardian | 1 | 0 | 0 |
| loom | 0 | 1 | 0 |

```
A .gitignore
A .mcp.json
A bridge/causal/expectation.js
A bridge/causal/graph.js
A bridge/causal/ledger.js
A bridge/causal/projections.js
A bridge/causal/schema.js
A bridge/causal/server.js
A bridge/identity.js
A bridge/index.js
A bridge/interaction-contract.json
A bridge/ledger.js
A bridge/registry-components.js
A bridge/registry.js
A bridge/router.js
A bridge/server.js
A bridge/spec/bridge.spec
A bridge/types.js
A clear-glass/README.md
A clear-glass/fix-orchestrator.js
A clear-glass/package.json
A clear-glass/registry-components.js
A clear-glass/renderer/browser.css
A clear-glass/renderer/browser.html
A clear-glass/renderer/browser.js
A clear-glass/renderer/settings.html
A clear-glass/siso/index.js
A clear-glass/siso/package.json
A clear-glass/src/api/settings.js
A clear-glass/src/dom/archaeology.js
A clear-glass/src/driver/index.js
A clear-glass/src/driver/url-listener.js
A clear-glass/src/fingerprint/engine.js
A clear-glass/src/mesh/agent-mesh.js
A clear-glass/src/options/store.js
A clear-glass/src/providers/gm-shim.js
A clear-glass/src/providers/host.js
A clear-glass/src/providers/registry.js
A clear-glass/src/seam/index.js
A clear-glass/src/sse/server.js
A clear-glass/src/userscripts/manager.js
M copilot/lib/self-model.js
M copilot/server.js
A data/cortex/memory/guardian_chat_log.json
M data/cortex/memory/tool_index.json
A data/diagnostic/diagnostic.pid
A data/ledger/copilot/copilot.introspect/2026-08-19.jsonl
A guardian/userscript-nexus-wake.js
M lib/agent-chat.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/coordination/agent-chat.js
M lib/agent-tools/tools/identity/hat-forge.js
A lib/end-state.js
A lib/introspect.js
A lib/work-queue.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
A tests/modules/test-agent-capability.js
A tests/modules/test-end-state.js
A tests/modules/test-introspect.js
A tests/modules/test-nexus-wake.js
A tests/modules/test-work-queue.js
```

### Build 0.39.0-r56 — snap-0397 — 2026-08-19 13:42:40

- Archive: `nexus-0397_2026-08-19_v0.39.0-r56_intake-toolconfig.zip` (was `nexus-2026-08-19-intake-toolconfig.zip`)
- SHA-256: `31de07aaf9b2ad705b1d4ecd4efa8cd01a563264ebcc1172598d7fc8665b69f8`, 23.8 MB, downloaded 2026-08-21 20:20:16
- Kind: full
- Commit: `bdeddc8f6ebd78eb3080d434deca2acf31b15429`, tag `snap-0397`
- Left out: embedded .git (610 files, HEAD 4feafaea6fe70af62935bef36798613a5b5e4ecd (master))
- Left out: node_modules (55 files)
- Files in archive: 2367. Changes against the build before it: **52 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 23 | 11 | 0 |
| cortex | 10 | 0 | 0 |
| tests | 6 | 2 | 0 |
| docs | 6 | 1 | 0 |
| lib | 5 | 1 | 0 |
| clear-glass | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 1 | 0 | 0 |
| guardian | 0 | 1 | 0 |

```
A clear-glass/src/providers/download-capture.js
M clear-glass/src/providers/host.js
A cli/pressure.js
A cortex/data/snapshots/02605166-96cd-4624-b1c4-1693a40e13c7.nex
A cortex/data/snapshots/2750ef80-16d8-4b96-b0a5-1bfc73c5bc9f.nex
A cortex/data/snapshots/36e6e853-987e-49cb-b354-954a3f4e48ea.nex
A cortex/data/snapshots/7a6c18a3-71b5-4405-880f-cad2713e68ae.nex
A cortex/data/snapshots/845e37f2-612f-442c-ab1c-4a63cd6b7496.nex
A cortex/data/snapshots/86ea3b12-fb4f-480b-a82b-cac006762b98.nex
A cortex/data/snapshots/b756062b-6a1f-4401-86d1-a5a59912b25d.nex
A cortex/data/snapshots/c289c470-62ce-42af-a1eb-b73fea0aa794.nex
A cortex/data/snapshots/de614356-14ba-431e-9c46-b84cd747e324.nex
A cortex/data/snapshots/e18d8f51-a153-4d15-b5ae-afbfe1976f05.nex
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
M data/cortex/memory/tool_index.json
A data/ledger/bridge/b.y/2026-08-19.jsonl
A data/ledger/bridge/b/2026-08-19.jsonl
M data/ledger/copilot/copilot.introspect/2026-08-19.jsonl
A data/ledger/copilot/copilot.person-model/2026-08-19.jsonl
M data/ledger/copilot/copilot.person-model/session-h1.jsonl
M data/ledger/copilot/copilot.person-model/session-h2.jsonl
M data/ledger/copilot/copilot.person-model/session-own.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
M data/ledger/copilot/copilot.person-model/session-x1.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-19.jsonl
A data/ledger/cortex/cortex.raid/2026-08-19.jsonl
A data/ledger/forge/forge.old/2026-08-19.jsonl
A data/ledger/forge/forge.patch/2026-08-19.jsonl
A data/ledger/guardian/g.x/2026-08-19.jsonl
A data/ledger/guardian/g/2026-08-19.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-19.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-19.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-19.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-19.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-19.jsonl
A data/ledger/reflection/reflection.engine/2026-08-19.jsonl
A data/ledger/test/test.echo.ping/2026-08-19.jsonl
A data/ledger/test/test.event.check/2026-08-19.jsonl
A data/ledger/test/test.widget.panel/2026-08-19.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-19.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-19.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-19.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-19.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-19.jsonl
M data/loom/loom_events.buffer.jsonl
A docs/MAP-2026-08-18-pressure-and-toolkit.md
A docs/MAP-2026-08-19-idearium-agent-pipeline.md
M docs/SPEC-REGISTRY.md
A docs/clear-glass-toolkit.spec
A docs/copilot-tool-system.spec
A docs/idearium-agent-pipeline.spec
A docs/pressure-causality.spec
M guardian/server.js
A lib/agent-reach.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/governance/tool-config.js
A lib/intake.js
A lib/pressure-window.js
A lib/tool-config.js
M loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
A tests/modules/test-agent-reach.js
A tests/modules/test-copilot-probe.js
M tests/modules/test-hat-forge.js
A tests/modules/test-intake.js
A tests/modules/test-pressure-window.js
A tests/modules/test-tool-config.js
A tests/probe/copilot-probe.js
M writeback-failures.jsonl
```

### Build 0.39.0-r57 — snap-0398 — 2026-08-21 20:29:36

- Archive: `nexus-0398_2026-08-21_v0.39.0-r57_2026-08-22-sse-leak-fix.zip` (was `nexus-2026-08-22-sse-leak-fix.zip`)
- SHA-256: `f55f336c373beda4721a44ca9e968bf3b18da2f323341ffd674027fdadf3dfac`, 23.9 MB, downloaded 2026-08-21 20:33:36
- Kind: full
- Commit: `1f40a8fcad6996f4d38bb416f4720e486406d88b`, tag `snap-0398`
- Left out: embedded .git (615 files, HEAD af5c690838b9aa484278f273cda401a90556052a (master))
- Left out: node_modules (55 files)
- Files in archive: 2367. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/tv-shell/index.html
```

### Build 0.39.0-r58 — snap-0399 — 2026-08-21 20:33:34

- Archive: `nexus-0399_2026-08-21_v0.39.0-r58_2026-08-22-shutdown-fix.zip` (was `nexus-2026-08-22-shutdown-fix.zip`)
- SHA-256: `0e0e249c21f7a23d8301ecf6d0f3ed70e1935c31ed2749b0d4ef6be4f5a83dae`, 23.9 MB, downloaded 2026-08-21 20:34:51
- Kind: full
- Commit: `12980b43dcfa61c17fd51ac60ec08f2fe1f125ff`, tag `snap-0399`
- Left out: embedded .git (621 files, HEAD a071e5996af98f0bf94f063c6434c653d5844af8 (master))
- Left out: node_modules (55 files)
- Files in archive: 2367. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/src/providers/host.js
```

### Build 0.39.0-r59 — snap-0400 — 2026-08-21 21:14:14

- Archive: `nexus-0400_2026-08-21_v0.39.0-r59_2026-08-22-chat-history-fix.zip` (was `nexus-2026-08-22-chat-history-fix.zip`)
- SHA-256: `d6c0a67ccac41337273f3d142a7afa34399e3764406ce958321f41b54a9e32cf`, 23.9 MB, downloaded 2026-08-21 21:32:20
- Kind: full
- Commit: `201273c156541413b20005b2d980c755b25c3fea`, tag `snap-0400`
- Left out: embedded .git (626 files, HEAD dee6b9ce0c9bf2d948851bb91226405431027f02 (master))
- Left out: node_modules (55 files)
- Files in archive: 2367. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| ui | 0 | 1 | 0 |

```
M ui/tv-shell/index.html
```

### Build 0.39.0-r60 — snap-0401 — 2026-08-21 21:40:52

- Archive: `nexus-0401_2026-08-21_v0.39.0-r60_2026-08-22-copilot-tools-fix.zip` (was `nexus-2026-08-22-copilot-tools-fix.zip`)
- SHA-256: `5febbf27e5ff11ee2119457c51e76e9f7c18d6aa20c6f4efa97b48323caf9c7c`, 24 MB, downloaded 2026-08-21 21:54:09
- Kind: full
- Commit: `ed8e6cb03920e39db26f062e85c65cda0aa186a0`, tag `snap-0401`
- Left out: embedded .git (630 files, HEAD 6d6c1f1f6e853ffe77ffc94c899142b1eded0b0a (master))
- Left out: node_modules (55 files)
- Files in archive: 2367. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| data | 0 | 1 | 0 |

```
M copilot/server.js
M data/cortex/memory/tool_index.json
```

### Build 0.39.0-r61 — snap-0402 — 2026-08-21 22:21:12

- Archive: `nexus-0402_2026-08-21_v0.39.0-r61_2026-08-22-merged.zip` (was `nexus-2026-08-22-merged.zip`)
- SHA-256: `dfe4d6d5e65f9330e764b68f6a7f884f565ccb6546d5afa04bca9db64c41ff68`, 23.1 MB, downloaded 2026-08-21 23:10:17
- Kind: full
- Commit: `27a26dde10d4339bc475892c89f4e7f246ad47c7`, tag `snap-0402`
- Left out: embedded .git (633 files, HEAD 4a879b24ad46f15f59c041325d65fc138efd5362 (master))
- Left out: node_modules (55 files)
- Files in archive: 1953. Changes against the build before it: **2 added, 15 modified, 416 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 396 |
| cortex | 0 | 1 | 13 |
| lib | 1 | 5 | 0 |
| idearium | 0 | 0 | 5 |
| tests | 1 | 4 | 0 |
| loom | 0 | 1 | 1 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 0 | 1 |
| clear-glass | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M clear-glass/src/providers/host.js
M copilot/lib/self-model.js
M cortex/memory/jaa-db.js
M docs/SPEC-REGISTRY.md
A lib/agent-build-loop.js
M lib/agent-chat.js
M lib/agent-tools/tools/identity/hat-forge.js
M lib/hat-seed.js
M lib/intent-hat-router.js
M lib/scheduler.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/intelligence.test.js
M tests/modules/run-all.js
A tests/modules/test-agent-chat.js
M tests/modules/test-agent-routing.js
M tests/modules/test-p5p6-self-model.js
```

417 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r62 — snap-0403 — 2026-08-21 23:15:42

- Archive: `nexus-0403_2026-08-21_v0.39.0-r62_2026-08-22-merged-1.zip` (was `nexus-2026-08-22-merged-1.zip`)
- SHA-256: `dc3edf3793a3236511f6128ac6789a918b8f197e2540d36e1b9f698d47d75090`, 23.1 MB, downloaded 2026-08-22 00:18:03
- Kind: full
- Commit: `2cc8f14bdbd15e3650f23a414a102f473c3e6d9f`, tag `snap-0403`
- Left out: embedded .git (637 files, HEAD 1518a5e6ea719ad22b39e32bfa7837de937b5f71 (master))
- Left out: node_modules (55 files)
- Files in archive: 1953. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |

```
M copilot/server.js
```

### Build 0.39.0-r63 — snap-0404 — 2026-08-22 07:53:34

- Archive: `nexus-0404_2026-08-22_v0.39.0-r63_current-1.zip` (was `nexus-2026-08-22-current (1).zip`)
- SHA-256: `545e8f1d5e968464946311978538be2e6088ebb8e81bb0a6ece4a1d82500349d`, 24.5 MB, downloaded 2026-08-22 07:59:11
- Kind: full
- Commit: `f36d5618fe9642b7694987bd7cb7c90ddc1d24d7`, tag `snap-0404`
- Left out: embedded .git (827 files, HEAD 2d3d8073f549de81cf2a896da762586b83570cde (master))
- Left out: node_modules (55 files)
- Files in archive: 2023. Changes against the build before it: **77 added, 33 modified, 7 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 53 | 0 | 0 |
| lib | 5 | 8 | 1 |
| cortex | 6 | 1 | 5 |
| intelligence | 6 | 0 | 0 |
| loom | 1 | 4 | 0 |
| docs | 3 | 1 | 0 |
| guardian | 1 | 3 | 0 |
| tests | 0 | 4 | 0 |
| clear-glass | 1 | 2 | 0 |
| copilot | 0 | 3 | 0 |
| cos | 1 | 1 | 1 |
| orchestrator | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| cli | 0 | 1 | 0 |
| meta | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
A clear-glass/src/copilot/wake-relay.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
M cli/nexus-repl.js
M copilot/adversarial.js
M copilot/optimizer.js
M copilot/server.js
M cortex/boot.js
A cortex/data/snapshots/2e0b0a75-86fa-4988-b23c-0c412895aad5.nex
A cortex/data/snapshots/725e09ca-47fe-4738-a75e-f15d6188c683.nex
A cortex/data/snapshots/cfeff444-acfa-4c9d-b81b-899e43798595.nex
A cortex/data/snapshots/dfdc8e95-eb4a-4287-bf3f-849808f31e1a.nex
A cortex/data/snapshots/f220be9b-2d9c-40c7-80ff-14f3e9680375.nex
A cortex/data/snapshots/fededa22-6ac8-46fc-ac00-1a21464b3c64.nex
D cortex/intelligence/adversarial.js
D cortex/intelligence/index.js
D cortex/intelligence/intuition.js
D cortex/intelligence/mastermind.js
D cortex/intelligence/relational-field.js
M cos/foundation/snapshot.js
D cos/test.js
A cos/test/test.js
A data/autopilot/autopilot.log
A data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/account_identity_index.json
A data/cortex/memory/agent_notes.json
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
A data/cortex/memory/guardian_settings.json
A data/cortex/memory/intake_drops.json
A data/cortex/memory/nexus_wake_events.json
A data/cortex/memory/phasemap_history.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/cortex/memory/versionium_branches.json
A data/cortex/memory/versionium_commits.json
A data/guardian/ledger/boot/events.ndjson
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_log.jsonl
A data/guardian/ledger/cfr/event_stats.json
A data/ledger/bridge/b.y/2026-08-22.jsonl
A data/ledger/bridge/b/2026-08-22.jsonl
A data/ledger/copilot/copilot.introspect/2026-08-22.jsonl
A data/ledger/copilot/copilot.person-model/2026-08-22.jsonl
A data/ledger/copilot/copilot.person-model/session-h1.jsonl
A data/ledger/copilot/copilot.person-model/session-h2.jsonl
A data/ledger/copilot/copilot.person-model/session-own.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
A data/ledger/copilot/copilot.person-model/session-x1.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-22.jsonl
A data/ledger/cortex/cortex.raid/2026-08-22.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-08-22.jsonl
A data/ledger/forge/forge.patch/2026-08-22.jsonl
A data/ledger/guardian/g.x/2026-08-22.jsonl
A data/ledger/guardian/g/2026-08-22.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-22.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-22.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-22.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-22.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-22.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-08-22.jsonl
A data/ledger/test/test.echo.ping/2026-08-22.jsonl
A data/ledger/test/test.event.check/2026-08-22.jsonl
A data/ledger/test/test.widget.panel/2026-08-22.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-22.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-22.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-22.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-22.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-22.jsonl
A docs/2026-08-22-session-full-phasemap.spec
M docs/AXIOMS-v3.1.md
A docs/roadmap/2026-08-22-copilot-end-state-vision.md
A docs/roadmap/2026-08-22-full-phase-map.md
A guardian/nexus-hey-claude.user.js
M guardian/server.js
M guardian/userscript-claude.js
M guardian/userscript-nexus-wake.js
A intelligence/adversarial.js
A intelligence/index.js
A intelligence/intuition.js
A intelligence/mastermind.js
A intelligence/relational-field.js
A intelligence/spec/intelligence.spec
A lib/account-identity-index.js
A lib/agent-notes.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/coordination/agent-notes.js
A lib/agent-tools/tools/coordination/nexus-wake-events.js
M lib/autopilot-intelligence.js
M lib/component-ledger.js
M lib/diagnostic-causal.js
M lib/diagnostic-report.js
M lib/ledger-fanin/boot.js
D lib/meta/index.js
A lib/nexus-wake-events.js
M lib/snapshot-trigger.js
M lib/uid/component-map.js
M loom/maps/copilot-capability-map.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M loom/scanners/source-map.js
A loom/scanners/wiring-gaps.js
M meta/alk/index.js
M orchestrator/lib/autonomous-loop.js
M orchestrator/lib/request-handler.js
M scripts/precommit-check.js
M tests/modules/nexus-seam.test.js
M tests/modules/test-intelligence-core-wired.js
M tests/modules/test-observability-map.js
M tests/modules/test-relational-field.js
M writeback-failures.jsonl
```

### Build 0.39.0-r64 — snap-0405 — 2026-08-22 09:50:06

- Archive: `nexus-0405_2026-08-22_v0.39.0-r64_wake-relay.zip` (was `nexus-2026-08-22-wake-relay.zip`)
- SHA-256: `10c1dfdb76052bfee97c92bf5c13c0114fe1e7e4cff6a04ae50fe8f0c3d718d6`, 24.5 MB, downloaded 2026-08-22 09:50:46
- Kind: full
- Commit: `7f2b25db9c3d2353bb2ad55ba2bce7f0e889d812`, tag `snap-0405`
- Left out: embedded .git (850 files, HEAD 682b5f0005a19477badd4444b1e05e8112be390f (master))
- Left out: node_modules (55 files)
- Files in archive: 1965. Changes against the build before it: **1 added, 4 modified, 59 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 53 |
| cortex | 0 | 1 | 6 |
| guardian | 1 | 2 | 0 |
| loom | 0 | 1 | 0 |

```
M cortex/boot.js
D cortex/data/snapshots/2e0b0a75-86fa-4988-b23c-0c412895aad5.nex
D cortex/data/snapshots/725e09ca-47fe-4738-a75e-f15d6188c683.nex
D cortex/data/snapshots/cfeff444-acfa-4c9d-b81b-899e43798595.nex
D cortex/data/snapshots/dfdc8e95-eb4a-4287-bf3f-849808f31e1a.nex
D cortex/data/snapshots/f220be9b-2d9c-40c7-80ff-14f3e9680375.nex
D cortex/data/snapshots/fededa22-6ac8-46fc-ac00-1a21464b3c64.nex
D data/autopilot/autopilot.log
D data/copilot/chat_log.buffer.jsonl
D data/cortex/memory/account_identity_index.json
D data/cortex/memory/agent_notes.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/event_log.json
D data/cortex/memory/gaps.json
D data/cortex/memory/guardian_settings.json
D data/cortex/memory/intake_drops.json
D data/cortex/memory/nexus_wake_events.json
D data/cortex/memory/phasemap_history.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/cortex/memory/versionium_branches.json
D data/cortex/memory/versionium_commits.json
D data/guardian/ledger/boot/events.ndjson
D data/guardian/ledger/cfr/cfr_state.json
D data/guardian/ledger/cfr/event_log.jsonl
D data/guardian/ledger/cfr/event_stats.json
D data/ledger/bridge/b.y/2026-08-22.jsonl
D data/ledger/bridge/b/2026-08-22.jsonl
D data/ledger/copilot/copilot.introspect/2026-08-22.jsonl
D data/ledger/copilot/copilot.person-model/2026-08-22.jsonl
D data/ledger/copilot/copilot.person-model/session-h1.jsonl
D data/ledger/copilot/copilot.person-model/session-h2.jsonl
D data/ledger/copilot/copilot.person-model/session-own.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
D data/ledger/copilot/copilot.person-model/session-x1.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-08-22.jsonl
D data/ledger/cortex/cortex.raid/2026-08-22.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-08-22.jsonl
D data/ledger/forge/forge.patch/2026-08-22.jsonl
D data/ledger/guardian/g.x/2026-08-22.jsonl
D data/ledger/guardian/g/2026-08-22.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-08-22.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-08-22.jsonl
D data/ledger/test/test.echo.ping/2026-08-22.jsonl
D data/ledger/test/test.event.check/2026-08-22.jsonl
D data/ledger/test/test.widget.panel/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-08-22.jsonl
A guardian/lib/wake-relay.js
M guardian/server.js
M guardian/userscript-claude.js
M loom/maps/session-2026-08-14-map.js
```

### Build 0.39.0-r65 — snap-0406 — 2026-08-22 13:16:40

- Archive: `nexus-0406_2026-08-22_v0.39.0-r65_current-2.zip` (was `nexus-2026-08-22-current (2).zip`)
- SHA-256: `88320c889877675e5d8a2adf3363529ab758928c2fb18496219e6efa450277c6`, 25.8 MB, downloaded 2026-08-22 13:18:08
- Kind: full
- Commit: `8447b4f4bad646e12f05d699ec768ec44f4718ad`, tag `snap-0406`
- Left out: embedded .git (1043 files, HEAD 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master))
- Left out: node_modules (55 files)
- Files in archive: 2077. Changes against the build before it: **122 added, 56 modified, 10 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 95 | 0 | 0 |
| intelligence | 15 | 2 | 0 |
| lib | 3 | 9 | 2 |
| cortex | 9 | 4 | 0 |
| tests | 0 | 11 | 0 |
| meta | 0 | 4 | 7 |
| loom | 0 | 4 | 0 |
| service | 0 | 4 | 0 |
| guardian | 0 | 3 | 1 |
| copilot | 0 | 4 | 0 |
| cli | 0 | 3 | 0 |
| bridge | 0 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| idearium | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |

```
M architect/service.js
M autopilot.js
M bridge/causal/graph.js
M bridge/index.js
M cli/cfr-debug.js
M cli/nexus-repl.js
M cli/sentinel.js
M copilot/diagnostics.js
M copilot/lifeline.js
M copilot/movement-map.js
M copilot/server.js
M cortex/boot.js
M cortex/core/raid/index.js
M cortex/memory/causal-lookup.js
M cortex/versionium/causality.js
M emerge/consumer.js
D guardian/lib/wake-relay.js
M guardian/nexus-hey-claude.user.js
M guardian/server.js
M guardian/userscript-claude.js
M idearium/index.js
A intelligence/baseline.js
A intelligence/cfr/contract-verifier.js
A intelligence/cfr/delta.js
A intelligence/cfr/field.js
A intelligence/cfr/graph.js
A intelligence/cfr/index.js
A intelligence/cfr/ledger.js
A intelligence/cfr/sigma.js
A intelligence/config.js
A intelligence/consumer.js
A intelligence/framework-builder.js
M intelligence/index.js
A intelligence/registry-components.js
A intelligence/schemas.js
A intelligence/server.js
A intelligence/snapshot-trigger.js
M intelligence/spec/intelligence.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/coordination/framework-builder.js
A lib/agent-tools/tools/coordination/intelligence-query.js
M lib/agent-tools/tools/query/meta-query.js
M lib/autopilot-intelligence.js
D lib/baseline.js
M lib/chunk-service.js
M lib/diagnostic-causal.js
A lib/event-types.js
M lib/ledger-fanin/boot.js
M lib/lenses.js
M lib/seam/spec-parser.js
D lib/snapshot-trigger.js
M lib/uid/component-map.js
M loom/maps/copilot-capability-map.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M loom/scanners/source-map.js
M meta/alk/index.js
M meta/causal/compound.js
D meta/cfr/contract-verifier.js
D meta/cfr/delta.js
D meta/cfr/field.js
D meta/cfr/graph.js
D meta/cfr/index.js
D meta/cfr/ledger.js
D meta/cfr/sigma.js
M meta/index.js
M meta/lattice/associative-lattice.js
M orchestrator.js
M orchestrator/lib/sigma-writer.js
M service/cortex-service.js
M service/guardian-service.js
M service/idearium-service.js
M service/nexus-diagnostic.js
M tests/brutal.test.js
M tests/modules/adversarial.test.js
M tests/modules/cfr-graph-component-distance.test.js
M tests/modules/intelligence.test.js
M tests/modules/mastermind-fractals.test.js
M tests/modules/raid-fitness-real-terms.test.js
M tests/modules/system-lattice.test.js
M tests/modules/test-adversarial-sim.js
M tests/modules/test-config-governance.js
M tests/modules/test-guardian-cfr-consolidation.js
M tests/modules/test-intelligence-causal.js
```

104 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r66 — snap-0407 — 2026-08-22 14:17:56

- Archive: `nexus-0407_2026-08-22_v0.39.0-r66_versionium-spec-v2.zip` (was `nexus-2026-08-22-versionium-spec-v2.zip`)
- SHA-256: `a266d455d95d7160369493137ee503a58046832af9f2f534b7c7dec9eddd209f`, 25.7 MB, downloaded 2026-08-22 14:19:08
- Kind: full
- Commit: `e48ec310b3770f171102ca0e61fd0084d60a5763`, tag `snap-0407`
- Left out: embedded .git (1043 files, HEAD 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master))
- Files in archive: 2132. Changes against the build before it: **83 added, 60 modified, 28 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| meta | 10 | 28 | 28 |
| intelligence | 60 | 1 | 0 |
| data | 9 | 20 | 0 |
| cortex | 0 | 4 | 0 |
| _archive | 3 | 0 | 0 |
| tests | 1 | 2 | 0 |
| docs | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |

```
M blueprint-index.json
M cortex/gap-finder/index.js
M cortex/liminal-space/index.js
M cortex/orion/index.js
M docs/SPEC-REGISTRY.md
M docs/versionium.spec
A intelligence/gap-finder/index.js
A intelligence/gap-tension.js
A intelligence/liminal-space/index.js
A intelligence/meta/adversary-suite.js
A intelligence/meta/alk-perception/index.js
A intelligence/meta/alk/index.js
A intelligence/meta/bda/gaps.js
A intelligence/meta/bda/index.js
A intelligence/meta/bda/kernel.js
A intelligence/meta/bda/ledger.js
A intelligence/meta/bda/pendulum.js
A intelligence/meta/bda/signals.js
A intelligence/meta/causal/anomaly.js
A intelligence/meta/causal/compound.js
A intelligence/meta/causal/index.js
A intelligence/meta/confidence.js
A intelligence/meta/crystal-lattice.js
A intelligence/meta/gap/hunter.js
A intelligence/meta/gap/index.js
A intelligence/meta/gap/ledger.js
A intelligence/meta/gap/predicate.js
A intelligence/meta/index.js
A intelligence/meta/lattice/associative-lattice.js
A intelligence/meta/liminal/index.js
A intelligence/meta/rfr2/adapter-sandbox/index.js
A intelligence/meta/rfr2/adapter/index.js
A intelligence/meta/rfr2/causality/index.js
A intelligence/meta/rfr2/clip/index.js
A intelligence/meta/rfr2/compress/index.js
A intelligence/meta/rfr2/context/index.js
A intelligence/meta/rfr2/delta/index.js
A intelligence/meta/rfr2/enforcement/index.js
A intelligence/meta/rfr2/forge/index.js
A intelligence/meta/rfr2/identity/index.js
A intelligence/meta/rfr2/index.js
A intelligence/meta/rfr2/kernel/index.js
A intelligence/meta/rfr2/lazy/index.js
A intelligence/meta/rfr2/observer/index.js
A intelligence/meta/rfr2/query/index.js
A intelligence/meta/rfr2/sigma/index.js
A intelligence/meta/rfr2/time/index.js
A intelligence/meta/rfr2/version-gate/index.js
A intelligence/meta/spatial/index.js
A intelligence/meta/spatial/lattice.js
A intelligence/meta/spatial/sigma.js
A intelligence/meta/spatial/system-lattice.js
A intelligence/meta/telemetry-codec/adapter.js
A intelligence/meta/telemetry-codec/bus.js
A intelligence/meta/telemetry-codec/drift-engine.js
A intelligence/meta/telemetry-codec/engines.js
A intelligence/meta/telemetry-codec/index.js
A intelligence/meta/telemetry-codec/latent-model.js
A intelligence/meta/telemetry-codec/runtime.js
A intelligence/meta/telemetry-codec/topology.js
A intelligence/meta/topo-kernel/bus.js
A intelligence/meta/topo-kernel/field.schema.json
A intelligence/meta/topo-kernel/index.js
A intelligence/meta/topo-kernel/signal.schema.json
A intelligence/meta/topo-kernel/snr.js
A intelligence/orion/index.js
M intelligence/registry-components.js
M lib/blueprint-index.js
M meta/adversary-suite.js
A meta/alk-perception.js
M meta/alk-perception/index.js
A meta/alk.js
M meta/alk/index.js
A meta/bda.js
D meta/bda/gaps.js
M meta/bda/index.js
M meta/bda/kernel.js
D meta/bda/ledger.js
D meta/bda/pendulum.js
D meta/bda/signals.js
A meta/causal.js
M meta/causal/anomaly.js
M meta/causal/compound.js
D meta/causal/index.js
M meta/confidence.js
M meta/crystal-lattice.js
A meta/gap.js
M meta/gap/hunter.js
D meta/gap/index.js
M meta/gap/ledger.js
M meta/gap/predicate.js
M meta/index.js
M meta/lattice/associative-lattice.js
A meta/liminal.js
M meta/liminal/index.js
A meta/rfr2.js
D meta/rfr2/adapter-sandbox/index.js
M meta/rfr2/adapter/index.js
M meta/rfr2/causality/index.js
M meta/rfr2/clip/index.js
M meta/rfr2/compress/index.js
M meta/rfr2/context/index.js
M meta/rfr2/delta/index.js
D meta/rfr2/enforcement/index.js
M meta/rfr2/forge/index.js
D meta/rfr2/identity/index.js
M meta/rfr2/index.js
M meta/rfr2/kernel/index.js
D meta/rfr2/lazy/index.js
D meta/rfr2/observer/index.js
D meta/rfr2/query/index.js
M meta/rfr2/sigma/index.js
D meta/rfr2/time/index.js
D meta/rfr2/version-gate/index.js
A meta/spatial.js
D meta/spatial/index.js
M meta/spatial/lattice.js
D meta/spatial/sigma.js
M meta/spatial/system-lattice.js
A meta/telemetry-codec.js
D meta/telemetry-codec/adapter.js
D meta/telemetry-codec/bus.js
D meta/telemetry-codec/drift-engine.js
D meta/telemetry-codec/engines.js
M meta/telemetry-codec/index.js
D meta/telemetry-codec/latent-model.js
D meta/telemetry-codec/runtime.js
D meta/telemetry-codec/topology.js
A meta/topo-kernel.js
D meta/topo-kernel/bus.js
D meta/topo-kernel/field.schema.json
D meta/topo-kernel/index.js
D meta/topo-kernel/signal.schema.json
D meta/topo-kernel/snr.js
M nexus-healer/registry-components.js
M tests/modules/run-all.js
A tests/modules/test-gap-tension.js
M tests/modules/test-liminal-space.js
```

33 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r67 — snap-0408 — 2026-08-22 14:23:38

- Archive: `nexus-0408_2026-08-22_v0.39.0-r67_step0-logical-clock.zip` (was `nexus-2026-08-22-step0-logical-clock.zip`)
- SHA-256: `e2331894dd5bc09a0cdea341e332582b0e1657d3fa50253dae8c844f3bcadc23`, 25.7 MB, downloaded 2026-08-22 14:25:26
- Kind: full
- Commit: `ee04c81302141c0494638cc36647037cd8d59e49`, tag `snap-0408`
- Left out: embedded .git (1043 files, HEAD 8d7f636bf58ac25678001f8cab83eeabe3819b68 (master))
- Files in archive: 2136. Changes against the build before it: **4 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 2 | 0 |
| lib | 1 | 2 | 0 |
| tests | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
A data/ledger/lctest/lc.c/2026-08-22.jsonl
A data/ledger/testsys/test.c/2026-08-22.jsonl
M docs/versionium.spec
M lib/component-ledger.js
A lib/logical-clock.js
M lib/pressure-window.js
M tests/modules/run-all.js
A tests/modules/test-logical-clock.js
```

### Build 0.39.0-r68 — snap-0409 — 2026-08-22 14:50:38

- Archive: `nexus-0409_2026-08-22_v0.39.0-r68_migrated.zip` (was `nexus-migrated.zip`)
- SHA-256: `618a623d391a0dcdb5566a69de278a161b3e773975b078d619b1ba614cb16acf`, 11 MB, downloaded 2026-08-22 14:53:14
- Kind: full
- Commit: `65f5f8ef105728e0100615157b75921695a1e081`, tag `snap-0409`
- Left out: node_modules (55 files)
- Files in archive: 2460. Changes against the build before it: **362 added, 107 modified, 38 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 357 | 68 | 0 |
| meta | 0 | 0 | 38 |
| lib | 0 | 8 | 0 |
| tests | 0 | 8 | 0 |
| cortex | 2 | 3 | 0 |
| intelligence | 1 | 4 | 0 |
| (root) | 0 | 4 | 0 |
| guardian | 0 | 4 | 0 |
| architect | 1 | 1 | 0 |
| bridge | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| versionium | 1 | 0 | 0 |

```
M architect/service.js
M blueprint-index.json
M bridge/causal/expectation.js
M bridge/causal/projections.js
M copilot/diagnostic-sweep.js
M cortex/boot.js
M cortex/core/raid/index.js
M guardian/api-dispatch.js
M guardian/lib/gap-hunter.js
M guardian/lib/ncp.js
M guardian/server.js
M idearium/api/index.js
M idearium/index.js
M intelligence/cfr/ledger.js
M intelligence/index.js
M intelligence/meta/index.js
M intelligence/server.js
M lib/agent-tools/tools/query/meta-query.js
M lib/case-library.js
M lib/chat-logger.js
M lib/compartment-engine.js
M lib/diagnostic-report.js
M lib/nexus-expansion-boot.js
M lib/open-loop-taxonomy.js
M lib/reflection.js
D meta/adversary-suite.js
D meta/alk-perception.js
D meta/alk-perception/index.js
D meta/alk.js
D meta/alk/index.js
D meta/bda.js
D meta/bda/index.js
D meta/bda/kernel.js
D meta/causal.js
D meta/causal/anomaly.js
D meta/causal/compound.js
D meta/confidence.js
D meta/crystal-lattice.js
D meta/gap.js
D meta/gap/hunter.js
D meta/gap/ledger.js
D meta/gap/predicate.js
D meta/index.js
D meta/lattice/associative-lattice.js
D meta/liminal.js
D meta/liminal/index.js
D meta/rfr2.js
D meta/rfr2/adapter/index.js
D meta/rfr2/causality/index.js
D meta/rfr2/clip/index.js
D meta/rfr2/compress/index.js
D meta/rfr2/context/index.js
D meta/rfr2/delta/index.js
D meta/rfr2/forge/index.js
D meta/rfr2/index.js
D meta/rfr2/kernel/index.js
D meta/rfr2/sigma/index.js
D meta/spatial.js
D meta/spatial/lattice.js
D meta/spatial/system-lattice.js
D meta/telemetry-codec.js
D meta/telemetry-codec/index.js
D meta/topo-kernel.js
M nexus-healer/api/index.js
M orchestrator.js
M package-lock.json
M service/nexus-diagnostic.js
M tests/modules/adversary-suite.test.js
M tests/modules/associative-lattice.test.js
M tests/modules/crystal-lattice.test.js
M tests/modules/intuition-upgrade.test.js
M tests/modules/system-lattice.test.js
M tests/modules/test-intelligence-core-wired.js
M tests/modules/test-rfr2-cjs.js
M tests/nexus-full-audit.js
A versionium/versionium.spec
```

431 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r69 — snap-0410 — 2026-08-22 14:58:36

- Archive: `nexus-0410_2026-08-22_v0.39.0-r69_migrated-1.zip` (was `nexus-migrated-1.zip`)
- SHA-256: `2e1bf85ae47dfeb86d96498bbbd6781124b3130b33ced559eaa5892decb3b7ce`, 11 MB, downloaded 2026-08-22 14:59:15
- Kind: full
- Commit: `95964be3d81d0d7177dffec03742a3d8e094351a`, tag `snap-0410`
- Left out: node_modules (55 files)
- Files in archive: 2460. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |

```
M autopilot.js
```

### Build 0.39.0-r70 — snap-0411 — 2026-08-22 15:17:12

- Archive: `nexus-0411_2026-08-22_v0.39.0-r70_migrated.zip` (was `nexus-migrated-2026-08-22.zip`)
- SHA-256: `455c5775dd325b4c05736ecd84bb452cb7eb17b1017b717e0e35f29cc9547a30`, 10.8 MB, downloaded 2026-08-22 15:26:05
- Kind: full
- Commit: `65240dd5753c427c21d5bec39b66d12bbcaa8990`, tag `snap-0411`
- Files in archive: 2460. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 0 |
| intelligence | 0 | 2 | 0 |
| cortex | 0 | 1 | 0 |

```
M cortex/boot.js
M data/cortex/memory/event_log.json
M data/cortex/memory/poll_log.json
M intelligence/index.js
M intelligence/server.js
```

### Build 0.39.0-r71 — snap-0412 — 2026-08-22 16:04:28

- Archive: `nexus-0412_2026-08-22_v0.39.0-r71_migrated-in-progress.zip` (was `nexus-migrated-2026-08-22-in-progress.zip`)
- SHA-256: `09e7620f78ba1743833c9de5f2d4be08f9ad3e5250285c1854de9557def3cd26`, 25.3 MB, downloaded 2026-08-22 16:10:04
- Kind: full
- Commit: `0a9f505a168e5c2ca2f6e2fe62444d9de8b754be`, tag `snap-0412`
- Left out: embedded .git (1047 files, HEAD 9403b8113e6718331433270ca886238a9f8e8fa4 (master))
- Files in archive: 1985. Changes against the build before it: **1 added, 1 modified, 476 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 463 |
| cortex | 0 | 1 | 11 |
| (root) | 1 | 0 | 0 |
| architect | 0 | 0 | 1 |
| intelligence | 0 | 0 | 1 |

```
A CORTEX-BOOT-ROUTE-BREAKDOWN-2026-08-22.md
M cortex/boot.js
```

476 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r72 — snap-0413 — 2026-08-22 17:31:36

- Archive: `nexus-0413_2026-08-22_v0.39.0-r72_current.zip` (was `nexus-2026-08-22-current.zip`)
- SHA-256: `3237658d3b1b43ec02b00a0ba62b8c25cd9bc5c57123519d17334d39aad955e9`, 26.3 MB, downloaded 2026-08-22 17:44:53
- Kind: full
- Commit: `814fbc7aeb969b0ac1026edc508c66d58214c059`, tag `snap-0413`
- Left out: embedded .git (1107 files, HEAD fdf586e33188b7eed43d3aa0caea39ed3c90b313 (master))
- Left out: node_modules (55 files)
- Files in archive: 2078. Changes against the build before it: **161 added, 55 modified, 68 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 95 | 0 | 0 |
| intelligence | 16 | 5 | 60 |
| meta | 40 | 0 | 0 |
| cortex | 9 | 5 | 0 |
| lib | 0 | 12 | 1 |
| tests | 0 | 11 | 2 |
| (root) | 0 | 5 | 1 |
| guardian | 0 | 4 | 0 |
| docs | 0 | 4 | 0 |
| _archive | 0 | 0 | 3 |
| bridge | 0 | 2 | 0 |
| nexus-healer | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| loom | 1 | 0 | 0 |
| architect | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| versionium | 0 | 0 | 1 |

```
D CORTEX-BOOT-ROUTE-BREAKDOWN-2026-08-22.md
M architect/service.js
M autopilot.js
M blueprint-index.json
M bridge/causal/expectation.js
M bridge/causal/projections.js
M copilot/diagnostic-sweep.js
M cortex/boot.js
M cortex/core/raid/index.js
M cortex/gap-finder/index.js
M cortex/liminal-space/index.js
M cortex/orion/index.js
M docs/2026-08-22-session-full-phasemap.spec
M docs/SPEC-REGISTRY.md
M docs/roadmap/2026-08-22-copilot-end-state-vision.md
M docs/versionium.spec
M guardian/api-dispatch.js
M guardian/lib/gap-hunter.js
M guardian/lib/ncp.js
M guardian/server.js
M idearium/api/index.js
M idearium/index.js
A intelligence/alk-perception/index.js
A intelligence/alk/index.js
M intelligence/cfr/ledger.js
D intelligence/gap-finder/index.js
D intelligence/gap-tension.js
M intelligence/index.js
A intelligence/lattice/associative-lattice.js
D intelligence/liminal-space/index.js
D intelligence/meta/adversary-suite.js
D intelligence/meta/alk-perception/index.js
D intelligence/meta/alk/index.js
D intelligence/meta/bda/gaps.js
D intelligence/meta/bda/index.js
D intelligence/meta/bda/kernel.js
D intelligence/meta/bda/ledger.js
D intelligence/meta/bda/pendulum.js
D intelligence/meta/bda/signals.js
D intelligence/meta/causal/anomaly.js
D intelligence/meta/causal/compound.js
D intelligence/meta/causal/index.js
D intelligence/meta/confidence.js
D intelligence/meta/crystal-lattice.js
D intelligence/meta/gap/hunter.js
D intelligence/meta/gap/index.js
D intelligence/meta/gap/ledger.js
D intelligence/meta/gap/predicate.js
D intelligence/meta/index.js
D intelligence/meta/lattice/associative-lattice.js
D intelligence/meta/liminal/index.js
D intelligence/meta/rfr2/adapter-sandbox/index.js
D intelligence/meta/rfr2/adapter/index.js
D intelligence/meta/rfr2/causality/index.js
D intelligence/meta/rfr2/clip/index.js
D intelligence/meta/rfr2/compress/index.js
D intelligence/meta/rfr2/context/index.js
D intelligence/meta/rfr2/delta/index.js
D intelligence/meta/rfr2/enforcement/index.js
D intelligence/meta/rfr2/forge/index.js
D intelligence/meta/rfr2/identity/index.js
D intelligence/meta/rfr2/index.js
D intelligence/meta/rfr2/kernel/index.js
D intelligence/meta/rfr2/lazy/index.js
D intelligence/meta/rfr2/observer/index.js
D intelligence/meta/rfr2/query/index.js
D intelligence/meta/rfr2/sigma/index.js
D intelligence/meta/rfr2/time/index.js
D intelligence/meta/rfr2/version-gate/index.js
D intelligence/meta/spatial/index.js
D intelligence/meta/spatial/lattice.js
D intelligence/meta/spatial/sigma.js
D intelligence/meta/spatial/system-lattice.js
D intelligence/meta/telemetry-codec/adapter.js
D intelligence/meta/telemetry-codec/bus.js
D intelligence/meta/telemetry-codec/drift-engine.js
D intelligence/meta/telemetry-codec/engines.js
D intelligence/meta/telemetry-codec/index.js
D intelligence/meta/telemetry-codec/latent-model.js
D intelligence/meta/telemetry-codec/runtime.js
D intelligence/meta/telemetry-codec/topology.js
D intelligence/meta/topo-kernel/bus.js
D intelligence/meta/topo-kernel/field.schema.json
D intelligence/meta/topo-kernel/index.js
D intelligence/meta/topo-kernel/signal.schema.json
D intelligence/meta/topo-kernel/snr.js
D intelligence/orion/index.js
M intelligence/registry-components.js
M intelligence/server.js
M intelligence/spec/intelligence.spec
A intelligence/telemetry-codec/adapter.js
A intelligence/telemetry-codec/bus.js
A intelligence/telemetry-codec/drift-engine.js
A intelligence/telemetry-codec/engines.js
A intelligence/telemetry-codec/index.js
A intelligence/telemetry-codec/latent-model.js
A intelligence/telemetry-codec/runtime.js
A intelligence/telemetry-codec/topology.js
A intelligence/topo-kernel/bus.js
A intelligence/topo-kernel/field.schema.json
A intelligence/topo-kernel/index.js
A intelligence/topo-kernel/signal.schema.json
A intelligence/topo-kernel/snr.js
M lib/agent-tools/tools/query/meta-query.js
M lib/blueprint-index.js
M lib/case-library.js
M lib/chat-logger.js
M lib/compartment-engine.js
M lib/component-ledger.js
M lib/diagnostic-report.js
D lib/logical-clock.js
M lib/nexus-expansion-boot.js
M lib/open-loop-taxonomy.js
M lib/pressure-window.js
M lib/reflection.js
M lib/uid/component-map.js
A meta/adversary-suite.js
A meta/bda/gaps.js
A meta/bda/index.js
A meta/bda/kernel.js
A meta/bda/ledger.js
A meta/bda/pendulum.js
A meta/bda/signals.js
A meta/causal/anomaly.js
A meta/causal/compound.js
A meta/causal/index.js
A meta/confidence.js
A meta/crystal-lattice.js
A meta/gap/hunter.js
A meta/gap/index.js
A meta/gap/ledger.js
A meta/gap/predicate.js
A meta/index.js
A meta/liminal/index.js
A meta/rfr2/adapter-sandbox/index.js
A meta/rfr2/adapter/index.js
A meta/rfr2/causality/index.js
A meta/rfr2/clip/index.js
A meta/rfr2/compress/index.js
A meta/rfr2/context/index.js
A meta/rfr2/delta/index.js
A meta/rfr2/enforcement/index.js
A meta/rfr2/forge/index.js
A meta/rfr2/identity/index.js
A meta/rfr2/index.js
A meta/rfr2/kernel/index.js
A meta/rfr2/lazy/index.js
A meta/rfr2/observer/index.js
A meta/rfr2/query/index.js
A meta/rfr2/sigma/index.js
```

134 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.0-r73 — snap-0414 — 2026-08-22 18:08:48

- Archive: `nexus-0414_2026-08-22_v0.39.0-r73_current-1.zip` (was `nexus-2026-08-22-current-1.zip`)
- SHA-256: `1549ea2ad18990c4b8487314bc1516d26c33ebdf7e37730875e3eb2268f5e4f9`, 27.1 MB, downloaded 2026-08-22 18:09:21
- Kind: full
- Commit: `84570482f5c337fd664190bedff6391baa4186b9`, tag `snap-0414`
- Left out: embedded .git (1270 files, HEAD e2836f5e87340af14ab600715cc8fd9b98c03d05 (master))
- Left out: node_modules (55 files)
- Files in archive: 2083. Changes against the build before it: **42 added, 53 modified, 37 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| intelligence | 37 | 2 | 0 |
| meta | 0 | 1 | 36 |
| data | 5 | 16 | 0 |
| lib | 0 | 8 | 0 |
| tests | 0 | 8 | 0 |
| cortex | 0 | 3 | 1 |
| guardian | 0 | 4 | 0 |
| loom | 0 | 3 | 0 |
| bridge | 0 | 2 | 0 |
| idearium | 0 | 2 | 0 |
| copilot | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M bridge/causal/expectation.js
M bridge/causal/projections.js
M copilot/diagnostic-sweep.js
M cortex/boot.js
M cortex/core/raid/index.js
M cortex/data/baseline-events.ndjson
D cortex/liminal-space/index.js
M data/architect/baseline-events.ndjson
M data/bridge/baseline-events.ndjson
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/gaps.json
M data/cortex/memory/guardian_settings.json
M data/cortex/memory/poll_log.json
M data/diagnostic/baseline-events.ndjson
M data/diagnostic/ledger/boot/events.ndjson
A data/diagnostic/ledger/gaps/events.ndjson
M data/diagnostic/ledger/poll/events.ndjson
M data/emerge/baseline-events.ndjson
M data/guardian/baseline-events.ndjson
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/idearium/baseline-events.ndjson
A data/ledger/diagnostic/diagnostic.service.boot/2026-08-23.jsonl
A data/ledger/diagnostic/diagnostic.service.gaps/2026-08-23.jsonl
A data/ledger/diagnostic/diagnostic.service.poll/2026-08-23.jsonl
A data/ledger/reflection/reflection.engine/2026-08-23.jsonl
M data/orchestrator/baseline-events.ndjson
M guardian/api-dispatch.js
M guardian/lib/gap-hunter.js
M guardian/lib/ncp.js
M guardian/server.js
M idearium/api/index.js
M idearium/index.js
A intelligence/bda/gaps.js
A intelligence/bda/index.js
A intelligence/bda/kernel.js
A intelligence/bda/ledger.js
A intelligence/bda/pendulum.js
A intelligence/bda/signals.js
A intelligence/causal/anomaly.js
A intelligence/causal/compound.js
A intelligence/causal/index.js
M intelligence/cfr/ledger.js
A intelligence/gap/hunter.js
A intelligence/gap/index.js
A intelligence/gap/ledger.js
A intelligence/gap/predicate.js
M intelligence/index.js
A intelligence/liminal-space/index.js
A intelligence/liminal/index.js
A intelligence/rfr2/adapter-sandbox/index.js
A intelligence/rfr2/adapter/index.js
A intelligence/rfr2/causality/index.js
A intelligence/rfr2/clip/index.js
A intelligence/rfr2/compress/index.js
A intelligence/rfr2/context/index.js
A intelligence/rfr2/delta/index.js
A intelligence/rfr2/enforcement/index.js
A intelligence/rfr2/forge/index.js
A intelligence/rfr2/identity/index.js
A intelligence/rfr2/index.js
A intelligence/rfr2/kernel/index.js
A intelligence/rfr2/lazy/index.js
A intelligence/rfr2/observer/index.js
A intelligence/rfr2/query/index.js
A intelligence/rfr2/sigma/index.js
A intelligence/rfr2/time/index.js
A intelligence/rfr2/version-gate/index.js
A intelligence/spatial/index.js
A intelligence/spatial/lattice.js
A intelligence/spatial/sigma.js
A intelligence/spatial/system-lattice.js
M lib/agent-tools/tools/query/meta-query.js
M lib/chat-logger.js
M lib/diagnostic-report.js
M lib/nexus-expansion-boot.js
M lib/open-loop-taxonomy.js
M lib/reflection.js
M lib/rfr2-bridge.js
M lib/uid/component-map.js
M loom/maps/copilot-capability-map.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
D meta/bda/gaps.js
D meta/bda/index.js
D meta/bda/kernel.js
D meta/bda/ledger.js
D meta/bda/pendulum.js
D meta/bda/signals.js
D meta/causal/anomaly.js
D meta/causal/compound.js
D meta/causal/index.js
D meta/gap/hunter.js
D meta/gap/index.js
D meta/gap/ledger.js
D meta/gap/predicate.js
M meta/index.js
D meta/liminal/index.js
D meta/rfr2/adapter-sandbox/index.js
D meta/rfr2/adapter/index.js
D meta/rfr2/causality/index.js
D meta/rfr2/clip/index.js
D meta/rfr2/compress/index.js
D meta/rfr2/context/index.js
D meta/rfr2/delta/index.js
D meta/rfr2/enforcement/index.js
D meta/rfr2/forge/index.js
D meta/rfr2/identity/index.js
D meta/rfr2/index.js
D meta/rfr2/kernel/index.js
D meta/rfr2/lazy/index.js
D meta/rfr2/observer/index.js
D meta/rfr2/query/index.js
D meta/rfr2/sigma/index.js
D meta/rfr2/time/index.js
D meta/rfr2/version-gate/index.js
D meta/spatial/index.js
D meta/spatial/lattice.js
D meta/spatial/sigma.js
D meta/spatial/system-lattice.js
M nexus-healer/api/index.js
M orchestrator/lib/request-handler.js
M service/nexus-diagnostic.js
M tests/brutal.test.js
M tests/modules/intuition-upgrade.test.js
M tests/modules/reflection.test.js
M tests/modules/system-lattice.test.js
M tests/modules/test-diagnostic-heal-path.js
M tests/modules/test-liminal-space.js
M tests/modules/test-rfr2-cjs.js
M tests/nexus-full-audit.js
```

### Build 0.39.0-r74 — snap-0415 — 2026-08-22 21:19:12

- Archive: `nexus-0415_2026-08-22_v0.39.0-r74_current-1-migrated.zip` (was `nexus-2026-08-22-current-1-migrated.zip`)
- SHA-256: `7ad0227bf4d8a83ef7da5a336026aa1b1e4751a5f3407b0410115013cf2b8494`, 26.8 MB, downloaded 2026-08-22 21:26:34
- Kind: full
- Commit: `3e877a9ad7419a98868fbf0dd2016193f075c24b`, tag `snap-0415`
- Left out: embedded .git (1299 files, HEAD 4fe7f12944b915581dcbdd0e3c03f588c6374a31 (master))
- Left out: node_modules (55 files)
- Files in archive: 1974. Changes against the build before it: **1 added, 8 modified, 110 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 100 |
| cortex | 0 | 1 | 9 |
| (root) | 0 | 2 | 0 |
| ollama | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| loom | 0 | 0 | 1 |
| orchestrator | 0 | 1 | 0 |

```
M cli/nexus-repl.js
M cortex/boot.js
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/invariant/baseline.json
D cortex/data/snapshots/2e0b0a75-86fa-4988-b23c-0c412895aad5.nex
D cortex/data/snapshots/725e09ca-47fe-4738-a75e-f15d6188c683.nex
D cortex/data/snapshots/cfeff444-acfa-4c9d-b81b-899e43798595.nex
D cortex/data/snapshots/dfdc8e95-eb4a-4287-bf3f-849808f31e1a.nex
D cortex/data/snapshots/f220be9b-2d9c-40c7-80ff-14f3e9680375.nex
D cortex/data/snapshots/fededa22-6ac8-46fc-ac00-1a21464b3c64.nex
D data/architect/baseline-events.ndjson
D data/architect/baseline.json
D data/architect/invariant/baseline.json
D data/autopilot/autopilot.log
D data/bridge/baseline-events.ndjson
D data/bridge/baseline.json
D data/bridge/bridge_requests.buffer.jsonl
D data/bridge/invariant/baseline.json
D data/bridge/ledger/cfr/event_log.jsonl
D data/bridge/ledger/requests.jsonl
D data/copilot/chat_log.buffer.jsonl
D data/cortex/ledger/boot/events.ndjson
D data/cortex/memory/account_identity_index.json
D data/cortex/memory/agent_notes.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/event_log.json
D data/cortex/memory/fault_log.json
D data/cortex/memory/gaps.json
D data/cortex/memory/guardian_settings.json
D data/cortex/memory/intake_drops.json
D data/cortex/memory/meta_observations.json
D data/cortex/memory/nexus_wake_events.json
D data/cortex/memory/phasemap_history.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/cortex/memory/versionium_branches.json
D data/cortex/memory/versionium_commits.json
D data/diagnostic/baseline-events.ndjson
D data/diagnostic/baseline.json
D data/diagnostic/invariant/baseline.json
D data/diagnostic/ledger/boot/events.ndjson
D data/diagnostic/ledger/gaps/events.ndjson
D data/diagnostic/ledger/poll/events.ndjson
D data/emerge/baseline-events.ndjson
D data/emerge/baseline.json
D data/emerge/invariant/baseline.json
D data/guardian/baseline-events.ndjson
D data/guardian/baseline.json
D data/guardian/guardian.pid
D data/guardian/invariant/baseline.json
D data/guardian/ledger/boot/events.ndjson
D data/guardian/ledger/cfr/cfr_state.json
D data/guardian/ledger/cfr/event_log.jsonl
D data/guardian/ledger/cfr/event_stats.json
D data/idearium/baseline-events.ndjson
D data/idearium/baseline.json
D data/idearium/event_log.jsonl
D data/idearium/invariant/baseline.json
D data/idearium/ledger/boot/events.ndjson
D data/intelligence/event_log.jsonl
D data/knowledge/facts.jsonl
D data/ledger/bridge/b.y/2026-08-22.jsonl
D data/ledger/bridge/b/2026-08-22.jsonl
D data/ledger/copilot/copilot.introspect/2026-08-22.jsonl
D data/ledger/copilot/copilot.person-model/2026-08-22.jsonl
D data/ledger/copilot/copilot.person-model/session-h1.jsonl
D data/ledger/copilot/copilot.person-model/session-h2.jsonl
D data/ledger/copilot/copilot.person-model/session-own.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
D data/ledger/copilot/copilot.person-model/session-x1.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-08-22.jsonl
D data/ledger/cortex/cortex.raid/2026-08-22.jsonl
D data/ledger/cortex/cortex.service.boot/2026-08-22.jsonl
D data/ledger/diagnostic/diagnostic.service.boot/2026-08-22.jsonl
D data/ledger/diagnostic/diagnostic.service.boot/2026-08-23.jsonl
D data/ledger/diagnostic/diagnostic.service.gaps/2026-08-23.jsonl
D data/ledger/diagnostic/diagnostic.service.poll/2026-08-22.jsonl
D data/ledger/diagnostic/diagnostic.service.poll/2026-08-23.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-08-22.jsonl
D data/ledger/forge/forge.patch/2026-08-22.jsonl
D data/ledger/guardian/g.x/2026-08-22.jsonl
D data/ledger/guardian/g/2026-08-22.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-08-22.jsonl
D data/ledger/guardian/guardian.service.boot/2026-08-22.jsonl
D data/ledger/idearium/idearium.service.boot/2026-08-22.jsonl
D data/ledger/intelligence/intelligence.queue/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-08-22.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-08-22.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-08-22.jsonl
D data/ledger/reflection/reflection.engine/2026-08-23.jsonl
D data/ledger/test/test.echo.ping/2026-08-22.jsonl
D data/ledger/test/test.event.check/2026-08-22.jsonl
D data/ledger/test/test.queue/2026-08-22.jsonl
D data/ledger/test/test.widget.panel/2026-08-22.jsonl
D data/ledger/testcfg/testcfg.queue/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-08-22.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-08-22.jsonl
D data/orchestrator/baseline-events.ndjson
D data/orchestrator/baseline.json
D data/orchestrator/invariant/baseline.json
M emerge-ide.js
M guardian/userscript-claude.js
M idearium/agent-suite/index.js
D loom/data/registry.json
M ollama-runtime.js
A ollama/config.js
M ollama/server.js
M orchestrator/lib/autonomous-loop.js
```

### Build 0.39.0-r75 — snap-0416 — 2026-08-23 02:12:28

- Archive: `nexus-0416_2026-08-23_v0.39.0-r75_2026-08-22-current-1-migrated-1.zip` (was `nexus-2026-08-22-current-1-migrated-1.zip`)
- SHA-256: `0da32f5f979a9f4d98272583ddada914a8e90cbae8020c02e3e3e91603eacb21`, 27 MB, downloaded 2026-08-23 02:15:07
- Kind: full
- Commit: `c30ebd84b4dd688bc87036dff02c6df750039165`, tag `snap-0416`
- Left out: embedded .git (1336 files, HEAD 2f54b7d0ebb3d8be15b8d019dcb7253dd1c448c3 (master))
- Left out: node_modules (55 files)
- Files in archive: 1978. Changes against the build before it: **4 added, 8 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1 | 2 | 0 |
| loom | 0 | 2 | 0 |
| ollama | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |

```
A CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md
M cli/nexus.js
M copilot/lib/self-model.js
M lib/agent-tools/tools/browser/browser-action.js
M lib/hat-forge.js
A lib/hat-seed-ollama-personalities.js
M loom/maps/copilot-capability-map.js
M loom/maps/session-2026-08-14-map.js
A ollama/abliterated-catalog.js
M ollama/server.js
M tests/modules/run-all.js
A tests/modules/test-browser-action-screenshot.js
```

### Build 0.39.0-r76 — snap-0417 — 2026-08-23 02:20:26

- Archive: `nexus-0417_2026-08-23_v0.39.0-r76_2026-08-22-current-1-migrated-2.zip` (was `nexus-2026-08-22-current-1-migrated-2.zip`)
- SHA-256: `32260e35b98d416a7655b15a18e70c72a81a670c417f53627fd4a0583c3474fd`, 27.1 MB, downloaded 2026-08-23 02:22:46
- Kind: full
- Commit: `9febb4c426e52c3249c2d5b787019b09795550ba`, tag `snap-0417`
- Left out: embedded .git (1353 files, HEAD 6c267630f2bdf9d1e7b5d834d1428f26716fa5ae (master))
- Left out: node_modules (55 files)
- Files in archive: 1978. Changes against the build before it: **0 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md
M clear-glass/renderer/browser.js
M clear-glass/src/driver/index.js
M lib/agent-tools/tools/browser/browser-action.js
M tests/modules/test-browser-action-screenshot.js
```

### Build 0.39.0-r77 — snap-0418 — 2026-08-23 02:38:42

- Archive: `nexus-0418_2026-08-23_v0.39.0-r77_2026-08-22-current-1-migrated-3.zip` (was `nexus-2026-08-22-current-1-migrated-3.zip`)
- SHA-256: `a7c439a042c244262953f665bc117e6339fadce7ad718a874d3e9b46700d87f5`, 27.2 MB, downloaded 2026-08-23 02:42:22
- Kind: full
- Commit: `a8d6de5b068c4cb33f5371d9da7c6274b4b5669d`, tag `snap-0418`
- Left out: embedded .git (1382 files, HEAD 9b8671f8b042b153d6c0075c89c0040bfc86a67a (master))
- Left out: node_modules (55 files)
- Files in archive: 1982. Changes against the build before it: **4 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 2 | 2 | 0 |
| lib | 1 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
A GUARDIAN-ARCHIVE-MINING-2026-08-23.md
M cli/nexus.js
M guardian/userscript-claude.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/automation/macro.js
M lib/agent-tools/tools/browser/browser-action.js
M loom/maps/copilot-capability-map.js
M tests/modules/run-all.js
M tests/modules/test-browser-action-screenshot.js
A tests/modules/test-macro.js
A tests/modules/test-native-toast.js
```

### Build 0.39.0-r78 — snap-0419 — 2026-08-23 04:50:14

- Archive: `nexus-0419_2026-08-23_v0.39.0-r78_merged.zip` (was `nexus-2026-08-23-merged.zip`)
- SHA-256: `3f687dcc6c0e2f6396f131f7d95cb9871cacbe4771f5f40ff17d0904d68938b8`, 27.6 MB, downloaded 2026-08-23 05:21:56
- Kind: full
- Commit: `67a646d9bade049b0beed9dac591c68e2a816d0d`, tag `snap-0419`
- Left out: embedded .git (1440 files, HEAD 5a0eaef92e7e6d51f24f66219c00f23a1fea2a42 (master))
- Files in archive: 2004. Changes against the build before it: **22 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 3 | 5 | 0 |
| tests | 4 | 2 | 0 |
| cortex | 3 | 1 | 0 |
| idearium | 4 | 0 | 0 |
| loom | 2 | 2 | 0 |
| intelligence | 2 | 1 | 0 |
| architect | 2 | 0 | 0 |
| docs | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| data | 1 | 0 | 0 |
| meta | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
M blueprint-index.json
M cortex/boot.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A data/ledger/lctest/lc.c/2026-08-23.jsonl
A docs/2026-08-23-backlog-phasemap.spec
M docs/SPEC-REGISTRY.md
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
A intelligence/confidence.js
M intelligence/gap/hunter.js
A intelligence/patterns.js
A lib/agent-primer.js
M lib/agent-router.js
M lib/agent-tools/tools/automation/macro.js
A lib/agent-tools/tools/query/build-manual.js
M lib/blueprint-index.js
M lib/component-ledger.js
A lib/logical-clock.js
M lib/pressure-window.js
A loom/data/registry.json
A loom/maps/agent-primer-map.js
M loom/maps/copilot-capability-map.js
M loom/maps/session-2026-08-14-map.js
M meta/confidence.js
M nexus-healer/registry-components.js
M tests/modules/run-all.js
A tests/modules/test-agent-primer.js
A tests/modules/test-build-manual.js
A tests/modules/test-intelligence-patterns.js
A tests/modules/test-logical-clock.js
M tests/modules/test-macro.js
```

### Build 0.39.0-r79 — snap-0420 — 2026-08-23 06:52:02

- Archive: `nexus-0420_2026-08-23_v0.39.0-r79_2026-08-22-current-1-migrated-4.zip` (was `nexus-2026-08-22-current-1-migrated-4.zip`)
- SHA-256: `64af52312a52c0150354e21c07ee1416d472cdc16d3f0695310eb9f3f5c3b073`, 27.5 MB, downloaded 2026-08-23 07:02:01
- Kind: full
- Commit: `df9f6472deadd48d769fd90289fcaf6c17c5bee0`, tag `snap-0420`
- Identical copy: `nexus-0420_2026-08-23_v0.39.0-r79_2026-08-22-current-1-migrated-5_dup1.zip` (was `nexus-2026-08-22-current-1-migrated-5.zip`)
- Left out: embedded .git (1426 files, HEAD 8fd9a096db268dbe8573ece9b4f112dd8a6d2720 (master))
- Left out: node_modules (55 files)
- Files in archive: 1982. Changes against the build before it: **1 added, 16 modified, 23 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 5 | 3 |
| tests | 0 | 1 | 4 |
| (root) | 0 | 2 | 2 |
| cortex | 0 | 1 | 3 |
| idearium | 0 | 0 | 4 |
| intelligence | 0 | 1 | 2 |
| loom | 0 | 1 | 2 |
| architect | 0 | 0 | 2 |
| data | 0 | 0 | 1 |
| docs | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |
| hooks | 0 | 1 | 0 |
| meta | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| service | 1 | 0 | 0 |

```
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
M blueprint-index.json
M cortex/boot.js
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/invariant/baseline.json
D data/ledger/lctest/lc.c/2026-08-23.jsonl
M docs/2026-08-23-backlog-phasemap.spec
M guardian/userscript-claude.js
M hooks/orchestrator.hooks.js
D idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
D idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
D idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
D idearium/data/warp-crystals.json
D intelligence/confidence.js
M intelligence/gap/hunter.js
D intelligence/patterns.js
D lib/agent-primer.js
M lib/agent-router.js
D lib/agent-tools/tools/query/build-manual.js
M lib/blueprint-index.js
M lib/component-ledger.js
M lib/gap-relay.js
D lib/logical-clock.js
M lib/pressure-window.js
D loom/data/registry.json
D loom/maps/agent-primer-map.js
M loom/maps/copilot-capability-map.js
M meta/confidence.js
D nexus-heal-loop.js
M nexus-healer/registry-components.js
M orchestrator.js
D registry-components.cortex.js
A service/nexus-heal-loop.js
M tests/modules/run-all.js
D tests/modules/test-agent-primer.js
D tests/modules/test-build-manual.js
D tests/modules/test-intelligence-patterns.js
D tests/modules/test-logical-clock.js
```

### Build 0.39.0-r80 — snap-0421 — 2026-08-23 07:50:22

- Archive: `nexus-0421_2026-08-23_v0.39.0-r80_2026-08-22-current-1-migrated-6.zip` (was `nexus-2026-08-22-current-1-migrated-6.zip`)
- SHA-256: `62aa82faee1d949c5e3bdc2401628c0aa35603136f20a248be63c68ec7b68438`, 28 MB, downloaded 2026-08-23 07:52:36
- Kind: full
- Commit: `1620f97f1b1379e31d8fd6eb7e84bd22d6f28fb2`, tag `snap-0421`
- Left out: embedded .git (1524 files, HEAD 16320216dfae4b7ad4407d7784dac082a696fc05 (master))
- Left out: node_modules (55 files)
- Files in archive: 1982. Changes against the build before it: **7 added, 27 modified, 7 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 7 |
| tests | 0 | 6 | 0 |
| lib | 0 | 5 | 0 |
| emerge | 4 | 0 | 0 |
| loom | 0 | 4 | 0 |
| orchestrator | 3 | 0 | 0 |
| cli | 0 | 2 | 0 |
| scripts | 0 | 2 | 0 |
| architect | 0 | 1 | 0 |
| bridge | 0 | 1 | 0 |
| contracts | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| service | 0 | 1 | 0 |

```
M architect/service.js
M autopilot.js
M bridge/server.js
M cli/boot-systems.js
M cli/diagnose.js
M contracts/SYSTEM-CONTRACTS.js
M cortex/boot.js
M docs/2026-08-23-backlog-phasemap.spec
D emerge-codegen-v2.js
D emerge-ide.js
D emerge-kernel.js
D emerge.spec
A emerge/emerge-codegen-v2.js
A emerge/emerge-ide.js
A emerge/emerge-kernel.js
A emerge/emerge.spec
M intelligence/cfr/contract-verifier.js
M lib/agent-tools/tools/automation/macro.js
M lib/file-integrity.js
M lib/nexus-config.js
M lib/system-check.js
M lib/uid/component-map.js
M loom/maps/copilot-capability-map.js
M loom/maps/session-2026-08-14-map.js
M loom/scanners/phasemap-map.js
M loom/server.js
D orchestrator-contract.json
D orchestrator.config.json
D orchestrator.js
A orchestrator/orchestrator-contract.json
A orchestrator/orchestrator.config.json
A orchestrator/orchestrator.js
M scripts/verify-boot.js
M scripts/verify-wires.js
M service/nexus-diagnostic.js
M tests/diagnostic-fixes.test.js
M tests/kernel.test.js
M tests/modules/healer.test.js
M tests/modules/test-health-authority.js
M tests/modules/test-macro.js
M tests/nexus-full-audit.js
```

### Build 0.39.0-r81 — snap-0422 — 2026-08-23 08:13:56

- Archive: `nexus-0422_2026-08-23_v0.39.0-r81_2026-08-22-current-1-migrated-7.zip` (was `nexus-2026-08-22-current-1-migrated-7.zip`)
- SHA-256: `6d9b6ea480e9fc9bcc706beb1822b48318267321643dba570aa13e6e33200eb4`, 28.1 MB, downloaded 2026-08-23 08:18:53
- Kind: full
- Commit: `7d5963254122f519fc326f3c9f0af1d1aa4e6a85`, tag `snap-0422`
- Left out: embedded .git (1548 files, HEAD 82feaa4ecce12cb5af53295f744f88543d24058d (master))
- Left out: node_modules (55 files)
- Files in archive: 1984. Changes against the build before it: **2 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 1 | 1 | 0 |
| intelligence | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A guardian/config.js
M guardian/server.js
M intelligence/cfr/ledger.js
M intelligence/gap/predicate.js
M lib/gap-priority.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M tests/modules/run-all.js
A tests/modules/test-dynamic-tension.js
```

### Build 0.39.0-r82 — snap-0423 — 2026-08-23 10:31:00

- Archive: `nexus-0423_2026-08-23_v0.39.0-r82_current.zip` (was `nexus-2026-08-23-current.zip`)
- SHA-256: `612a0b52fa66e2ea2a9ba2f54b49fe276fb69eb57031d9c18cf191b1ceeed4c1`, 29 MB, downloaded 2026-08-23 10:35:39
- Kind: full
- Commit: `c4eb530779c3379877ef77eead094fabaad4ef22`, tag `snap-0423`
- Left out: embedded .git (1696 files, HEAD b4e842ca12c64573a0b181cd91e98e5b9279770a (master))
- Left out: node_modules (55 files)
- Files in archive: 2003. Changes against the build before it: **19 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 9 | 0 | 0 |
| loom | 2 | 5 | 0 |
| clear-glass | 0 | 5 | 0 |
| lib | 1 | 2 | 0 |
| architect | 1 | 1 | 0 |
| bridge | 1 | 1 | 0 |
| copilot | 1 | 1 | 0 |
| cortex | 1 | 1 | 0 |
| emerge | 1 | 1 | 0 |
| eravos | 1 | 1 | 0 |
| idearium | 1 | 1 | 0 |
| intelligence | 0 | 2 | 0 |
| docs | 0 | 1 | 0 |

```
A architect/config.js
M architect/service.js
A bridge/config.js
M bridge/server.js
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
A copilot/config.js
M copilot/server.js
M cortex/boot.js
A cortex/config.js
A data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
A data/cortex/memory/hooks.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/idearium/event_log.jsonl
A data/intelligence/event_log.jsonl
M docs/2026-08-23-backlog-phasemap.spec
A emerge/config.js
M emerge/emerge-ide.js
A eravos/config.js
M eravos/server.js
M idearium/api/index.js
A idearium/config.js
M intelligence/config.js
M intelligence/index.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/dom-archaeology.js
M lib/uid/component-map.js
A loom/config.js
A loom/data/registry.json
M loom/maps/copilot-capability-map.js
M loom/maps/observability-map.js
M loom/maps/session-2026-08-14-map.js
M loom/server.js
M loom/ui/index.html
```

### Build 0.39.0-r83 — snap-0424 — 2026-08-23 12:06:04

- Archive: `nexus-0424_2026-08-23_v0.39.0-r83_current-updated.zip` (was `nexus-2026-08-23-current-updated.zip`)
- SHA-256: `a98553cf30c59438495956623006a32328fa1d78882d507b992afae94f8f7c00`, 28.9 MB, downloaded 2026-08-23 12:51:36
- Kind: full
- Commit: `e1490b697d94f96c447e9b40d08c9e8a9dfb7b0d`, tag `snap-0424`
- Left out: embedded .git (1708 files, HEAD 34148ec47f617fae9673aae8156ed011595024d4 (master))
- Left out: node_modules (55 files)
- Files in archive: 1994. Changes against the build before it: **1 added, 3 modified, 10 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 9 |
| clear-glass | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| loom | 0 | 0 | 1 |

```
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
D data/cortex/memory/event_log.json
D data/cortex/memory/fault_log.json
D data/cortex/memory/hooks.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/idearium/event_log.jsonl
D data/intelligence/event_log.jsonl
D loom/data/registry.json
A tests/modules/nexus-options-autoboot.test.js
M tests/modules/run-all.js
```

### Build 0.39.0-r84 — snap-0425 — 2026-08-23 13:59:16

- Archive: `nexus-0425_2026-08-23_v0.39.0-r84_phase3-complete.zip` (was `nexus-2026-08-23-phase3-complete.zip`)
- SHA-256: `176f4729cd422581751dd9285aab89066b5693230220813fc712b2d587370fba`, 38 MB, downloaded 2026-08-23 14:13:40
- Kind: full
- Commit: `100126e2b1efdef72e76ed9198ee2cdb8c056606`, tag `snap-0425`
- Identical copy: `nexus-0425_2026-08-23_v0.39.0-r84_phase3-complete-1_dup1.zip` (was `nexus-2026-08-23-phase3-complete-1.zip`)
- Left out: node_modules (8175 files)
- Files in archive: 1995. Changes against the build before it: **2 added, 10 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 6 | 0 |
| lib | 1 | 1 | 1 |
| tests | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
M cli/nexus.js
M lib/agent-tools/index.js
D lib/agent-tools/tools/automation/macro.js
A lib/agent-tools/tools/clear-glass/macro.js
M loom/maps/copilot-capability-map.js
A tests/modules/clear-glass-accounts.test.js
M tests/modules/test-macro.js
```

### Build 0.39.0-r85 — snap-0426 — 2026-08-23 15:32:04

- Archive: `nexus-0426_2026-08-23_v0.39.0-r85_current-1.zip` (was `nexus-2026-08-23-current (1).zip`)
- SHA-256: `b64184f2d2162f64ed3cb2fd7637b6ff4c95013841c3745aa892ebfb45df7f45`, 29.7 MB, downloaded 2026-08-23 15:34:50
- Kind: full
- Commit: `372b9034033bcca93dc07205387041e6777c1c8d`, tag `snap-0426`
- Left out: embedded .git (1788 files, HEAD 924196a9001b69a8bbbab2fdb23b6fe3e5a0967b (master))
- Left out: node_modules (55 files)
- Files in archive: 2010. Changes against the build before it: **15 added, 16 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 12 | 0 | 0 |
| clear-glass | 0 | 7 | 0 |
| lib | 2 | 1 | 0 |
| (root) | 0 | 2 | 0 |
| loom | 1 | 1 | 0 |
| tests | 0 | 2 | 0 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/host.js
M cli/nexus.js
M copilot/server.js
A data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
A data/cortex/memory/forged_hats.json
A data/cortex/memory/hooks.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/scheduled_tasks.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/cortex/memory/triggers.json
A data/idearium/event_log.jsonl
A data/intelligence/event_log.jsonl
M docs/2026-08-23-backlog-phasemap.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/tab-visibility.js
A lib/agent-tools/tools/clear-glass/userscripts.js
A loom/data/registry.json
M loom/maps/copilot-capability-map.js
M package-lock.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-macro.js
```

### Build 0.39.0-r86 — snap-0427 — 2026-08-23 15:41:36

- Archive: `nexus-0427_2026-08-23_v0.39.0-r86_bl28.zip` (was `nexus-2026-08-23-bl28.zip`)
- SHA-256: `33094d568ed1920ae827c947bbfe99d19a6705e7f8d20755c67590d21c376f58`, 9.1 MB, downloaded 2026-08-23 15:53:09
- Kind: full
- Commit: `e43de1dc6f72f222ac0a157bcfd732c41507b3ad`, tag `snap-0427`
- Files in archive: 1999. Changes against the build before it: **2 added, 15 modified, 13 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 2 | 10 |
| clear-glass | 0 | 4 | 0 |
| lib | 1 | 1 | 2 |
| tests | 1 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| loom | 0 | 1 | 1 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/preload/index.js
M cli/nexus.js
M copilot/server.js
D data/cortex/memory/event_log.json
D data/cortex/memory/fault_log.json
D data/cortex/memory/forged_hats.json
D data/cortex/memory/hooks.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/scheduled_tasks.json
M data/cortex/memory/settings.json
M data/cortex/memory/tool_index.json
D data/cortex/memory/triggers.json
D data/idearium/event_log.jsonl
D data/intelligence/event_log.jsonl
M docs/2026-08-23-backlog-phasemap.spec
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/provider-visibility.js
D lib/agent-tools/tools/clear-glass/tab-visibility.js
D lib/agent-tools/tools/clear-glass/userscripts.js
D loom/data/registry.json
M loom/maps/copilot-capability-map.js
M package-lock.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-macro.js
A tests/modules/test-provider-visibility.js
```

### Build 0.39.0-r87 — snap-0428 — 2026-08-23 17:09:50

- Archive: `nexus-0428_2026-08-23_v0.39.0-r87_bl28-updated.zip` (was `nexus-2026-08-23-bl28-updated.zip`)
- SHA-256: `70d24f7c1616460d701d2ab2c0dfd62d33e771bc3c768a9220d7171cf65580c1`, 9.1 MB, downloaded 2026-08-23 17:29:33
- Kind: full
- Commit: `8f63dcd34d166d4e4f9ca9cfc28d5c20bc0af007`, tag `snap-0428`
- Files in archive: 2000. Changes against the build before it: **3 added, 8 modified, 2 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 5 | 0 |
| tests | 2 | 1 | 0 |
| data | 0 | 0 | 2 |
| lib | 1 | 1 | 0 |
| loom | 0 | 1 | 0 |

```
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/host.js
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
M lib/agent-tools/index.js
A lib/agent-tools/tools/clear-glass/provider-deploy.js
M loom/maps/copilot-capability-map.js
M tests/modules/run-all.js
A tests/modules/test-provider-deploy.js
A tests/modules/test-status-strip-removal.test.js
```

### Build 0.39.0-r88 — snap-0429 — 2026-08-23 18:12:46

- Archive: `nexus-0429_2026-08-23_v0.39.0-r88_bl28-updated-1.zip` (was `nexus-2026-08-23-bl28-updated-1.zip`)
- SHA-256: `4cf5d82bfd27c4c3624dee3930a87b535cefe53a05949f24bc11c0b448883ae2`, 9.1 MB, downloaded 2026-08-23 18:27:23
- Kind: full
- Commit: `e4dce81465085234956dc9ab5f88b034d600f570`, tag `snap-0429`
- Files in archive: 2004. Changes against the build before it: **4 added, 13 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 11 | 0 |
| tests | 3 | 1 | 0 |
| (root) | 1 | 0 | 0 |
| lib | 0 | 1 | 0 |

```
A CLEAR-GLASS-FULL-CHROME-MAP-2026-08-23.md
M clear-glass/renderer/browser.html
M clear-glass/seam/watchdog-gates.js
M clear-glass/src/contexts/manager.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/diagnostic/engine.js
M clear-glass/src/dom/archaeology.js
M clear-glass/src/driver/index.js
M clear-glass/src/driver/url-listener.js
M clear-glass/src/fingerprint/engine.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/mesh/agent-mesh.js
M lib/system-check.js
M tests/modules/run-all.js
A tests/modules/test-clear-glass-missing-deps.test.js
A tests/modules/test-system-check-api-layer.test.js
A tests/modules/test-toolbar-to-options-menu.test.js
```

### Build 0.39.0-r89 — snap-0430 — 2026-08-23 21:49:48

- Archive: `nexus-0430_2026-08-23_v0.39.0-r89_current-2.zip` (was `nexus-2026-08-23-current (2).zip`)
- SHA-256: `a0ce8e78500b96bcf8b800e5c9870396bd187b58fbb48bdb0d9347bb1039cbdf`, 30.2 MB, downloaded 2026-08-23 21:52:34
- Kind: full
- Commit: `5322a1cb5124a79cc603e81455303f0bbd594574`, tag `snap-0430`
- Identical copy: `nexus-0430_2026-08-23_v0.39.0-r89_current-3_dup1.zip` (was `nexus-2026-08-23-current (3).zip`)
- Left out: embedded .git (1891 files, HEAD 7c284eccc02bc94f70fba939b06dc57940dbf053 (master))
- Left out: node_modules (55 files)
- Files in archive: 2014. Changes against the build before it: **18 added, 15 modified, 8 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 13 | 0 | 0 |
| tests | 0 | 2 | 6 |
| clear-glass | 1 | 5 | 0 |
| lib | 2 | 1 | 1 |
| (root) | 0 | 2 | 1 |
| docs | 1 | 2 | 0 |
| loom | 1 | 1 | 0 |
| cli | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |

```
D CLEAR-GLASS-FULL-CHROME-MAP-2026-08-23.md
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/guardian-picker.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M cli/nexus.js
M copilot/server.js
A data/cortex/memory/event_log.json
A data/cortex/memory/fault_log.json
A data/cortex/memory/forged_hats.json
A data/cortex/memory/gaps.json
A data/cortex/memory/hooks.json
A data/cortex/memory/poll_log.json
A data/cortex/memory/raid_decisions.json
A data/cortex/memory/scheduled_tasks.json
A data/cortex/memory/settings.json
A data/cortex/memory/tool_index.json
A data/cortex/memory/triggers.json
A data/idearium/event_log.jsonl
A data/intelligence/event_log.jsonl
M docs/2026-08-23-backlog-phasemap.spec
A docs/CLEAR-GLASS-PLUGIN-SYSTEM-DESIGN-2026-08-23.md
M docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
M lib/agent-tools/index.js
D lib/agent-tools/tools/clear-glass/provider-visibility.js
A lib/agent-tools/tools/clear-glass/tab-visibility.js
A lib/agent-tools/tools/clear-glass/userscripts.js
A loom/data/registry.json
M loom/maps/copilot-capability-map.js
M package-lock.json
M package.json
M tests/modules/run-all.js
D tests/modules/test-clear-glass-missing-deps.test.js
M tests/modules/test-macro.js
D tests/modules/test-provider-deploy.js
D tests/modules/test-provider-visibility.js
D tests/modules/test-status-strip-removal.test.js
D tests/modules/test-system-check-api-layer.test.js
D tests/modules/test-toolbar-to-options-menu.test.js
```

### identical — 0431 — 2026-08-23 21:58:02

- Archive: `nexus-0431_2026-08-23_v0.39.0-r89_current-5_same-as-0430.zip` (was `nexus-2026-08-23-current (5).zip`)
- SHA-256: `6eeacdfe9a84201bf8dc9907fbbf9725642548671390ef81249a2a5dd971890f`, 30.2 MB, downloaded 2026-08-24 02:44:21
- Kind: identical (same tree as snap-0430; no commit)
- Left out: embedded .git (1891 files, HEAD 7c284eccc02bc94f70fba939b06dc57940dbf053 (master))
- Left out: node_modules (55 files)

### Build 0.39.0-r90 — snap-0432 — 2026-08-24 03:34:40

- Archive: `nexus-0432_2026-08-24_v0.39.0-r90_handoff.zip` (was `nexus-2026-08-24-handoff.zip`)
- SHA-256: `e0de8ba38ed814f4c96c807f36914b71ea9aaae84558733653c93c97826d8c60`, 30.3 MB, downloaded 2026-08-24 04:05:50
- Kind: full
- Commit: `052dddf84c52ba9835e827475ce9374ae22c9ca2`, tag `snap-0432`
- Left out: embedded .git (1905 files, HEAD 16c0fba3d2b32c85f87e0494666575ff54b1efbf (master))
- Left out: node_modules (55 files)
- Files in archive: 2015. Changes against the build before it: **1 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| loom | 0 | 2 | 0 |
| (root) | 1 | 0 | 0 |
| docs | 0 | 1 | 0 |
| emerge | 0 | 1 | 0 |

```
A HANDOFF-2026-08-24.md
M docs/clearglass-agent-suite-and-cfr-loom-phasemap.spec
M emerge/consumer.js
M loom/data/registry.json
M loom/maps/copilot-capability-map.js
```

### Build 0.39.0-r91 — snap-0433 — 2026-08-24 04:47:00

- Archive: `nexus-0433_2026-08-24_v0.39.0-r91_handoff-1.zip` (was `nexus-2026-08-24-handoff (1).zip`)
- SHA-256: `25a967b850fd296e535ee1efc4af24f53844f95947093e5032002470bd6ed24b`, 30.3 MB, downloaded 2026-08-24 04:55:50
- Kind: full
- Commit: `ceb740d5956b38275f95dbf9c9a0413f811e74f6`, tag `snap-0433`
- Left out: embedded .git (1956 files, HEAD cbb799a0dad4f7c5ccb9319345d2177ad9ca69a4 (master))
- Files in archive: 2033. Changes against the build before it: **18 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 9 | 4 | 0 |
| idearium | 4 | 0 | 0 |
| cortex | 3 | 0 | 0 |
| architect | 2 | 0 | 0 |
| (root) | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M .gitignore
A architect/data/event_log.jsonl
A architect/data/hooks.jsonl
A clear-glass/plugins/adblocker/index.js
A clear-glass/plugins/adblocker/manifest.json
A clear-glass/plugins/captcha-pause/index.js
A clear-glass/plugins/captcha-pause/manifest.json
M clear-glass/renderer/browser.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/options/store.js
A clear-glass/src/plugins/contribution-types.js
A clear-glass/src/plugins/host.js
A clear-glass/src/plugins/schema.js
A clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
A clear-glass/src/toolbar/commands.js
A cortex/data/baseline-events.ndjson
A cortex/data/baseline.json
A cortex/data/invariant/baseline.json
A idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
A idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
A idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
A idearium/data/warp-crystals.json
M scripts/precommit-check.js
```

### Build 0.39.0-r92 — snap-0434 — 2026-08-24 14:01:02

- Archive: `nexus-0434_2026-08-24_v0.39.0-r92_handoff-2.zip` (was `nexus-2026-08-24-handoff (2).zip`)
- SHA-256: `c94263db7f4c98be7ee637a7cda3fb7062a66b8342f0593047efe74a8031b8ec`, 30.9 MB, downloaded 2026-08-24 14:24:55
- Kind: full
- Commit: `7ff6d5d9d624cf222072b80df0879328cd6efb70`, tag `snap-0434`
- Left out: embedded .git (2095 files, HEAD 7e418e1891c2d554f0bd6ebd2b573dc56c52cd39 (master))
- Files in archive: 2046. Changes against the build before it: **13 added, 12 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 13 | 12 | 0 |

```
A clear-glass/plugins/guardian-listeners/index.js
A clear-glass/plugins/guardian-listeners/manifest.json
A clear-glass/plugins/passwords/index.js
A clear-glass/plugins/passwords/manifest.json
A clear-glass/plugins/permissions/index.js
A clear-glass/plugins/permissions/manifest.json
A clear-glass/plugins/zoom/index.js
A clear-glass/plugins/zoom/manifest.json
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/src/downloads/adapter.js
A clear-glass/src/downloads/store.js
M clear-glass/src/driver/index.js
M clear-glass/src/gates/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
A clear-glass/src/passwords/vault.js
M clear-glass/src/plugins/contribution-types.js
M clear-glass/src/plugins/host.js
A clear-glass/src/plugins/permission-adapter.js
M clear-glass/src/plugins/schema.js
M clear-glass/src/preload/index.js
A clear-glass/src/site-settings/store.js
M clear-glass/src/userscripts/manager.js
```

### Build 0.39.0-r93 — snap-0435 — 2026-08-24 17:25:04

- Archive: `nexus-0435_2026-08-24_v0.39.0-r93_handoff-3.zip` (was `nexus-2026-08-24-handoff (3).zip`)
- SHA-256: `2f5eb222f0c63993a506ff7d21cfa9c156f6a42bc7b7e9a910fd18b00777dbdc`, 31 MB, downloaded 2026-08-24 17:32:29
- Kind: full
- Commit: `2e19dd381ef36f8c739e39f32d383ae3bc8fee6f`, tag `snap-0435`
- Left out: embedded .git (2122 files, HEAD 6a9b87007576189d54ac4e1c94c79be15daeedcb (master))
- Files in archive: 2048. Changes against the build before it: **2 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 2 | 6 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/gates/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
A clear-glass/src/speech/engine.js
A clear-glass/src/speech/transcribe.py
```

### Build 0.39.0-r94 — snap-0436 — 2026-08-24 17:35:10

- Archive: `nexus-0436_2026-08-24_v0.39.0-r94_handoff-4.zip` (was `nexus-2026-08-24-handoff (4).zip`)
- SHA-256: `f07fd8f5946232681ba78fda831015d55ae1e7fcbd78ef042f9e99091ff5d759`, 31 MB, downloaded 2026-08-24 17:39:24
- Kind: full
- Commit: `162e5bdbafb6456a1304ab70359fe72d54b5ed73`, tag `snap-0436`
- Left out: embedded .git (2128 files, HEAD d8e9507d368d2c33a02ec9e0be8bf94579e80f58 (master))
- Files in archive: 2048. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 1 | 0 |

```
M clear-glass/src/rewind/engine.js
```

### Build 0.39.0-r95 — snap-0437 — 2026-08-24 17:55:20

- Archive: `nexus-0437_2026-08-24_v0.39.0-r95_handoff-5.zip` (was `nexus-2026-08-24-handoff (5).zip`)
- SHA-256: `165b5773558dd6c85f9a873022b0de80eadcfe7395cf24922541758db1a2c462`, 31.1 MB, downloaded 2026-08-24 17:58:08
- Kind: full
- Commit: `37dffb8674534e3d26bbb4927666acc00ba6f6ce`, tag `snap-0437`
- Left out: embedded .git (2145 files, HEAD 7e925f855812bf991687af096a34f905184378ae (master))
- Files in archive: 2048. Changes against the build before it: **0 added, 7 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 7 | 0 |

```
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
M clear-glass/src/driver/index.js
M clear-glass/src/gates/index.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/preload/index.js
M clear-glass/src/site-settings/store.js
```

### Build 0.39.0-r96 — snap-0438 — 2026-08-27 13:02:10

- Archive: `nexus-0438_2026-08-27_v0.39.0-r96_2026-08-24-handoff-updated.zip` (was `nexus-2026-08-24-handoff-updated.zip`)
- SHA-256: `ad4f6a50716eb13a1acc054dd9c6325d64209cf8ea9a4794775adcdcd33990f2`, 30.9 MB, downloaded 2026-08-27 13:03:10
- Kind: full
- Commit: `c869e57dd99207357045fa32699e29afb5828b55`, tag `snap-0438`
- Left out: embedded .git (2182 files, HEAD baf48be9be81848a7520eebc8c05acf880a80346 (master))
- Files in archive: 2027. Changes against the build before it: **2 added, 11 modified, 23 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 13 |
| tests | 1 | 7 | 0 |
| cortex | 0 | 1 | 3 |
| idearium | 0 | 0 | 4 |
| architect | 0 | 0 | 2 |
| loom | 0 | 1 | 1 |
| (root) | 1 | 0 | 0 |
| cli | 0 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
A ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md
D architect/data/event_log.jsonl
D architect/data/hooks.jsonl
M cli/nexus.js
D cortex/data/baseline-events.ndjson
D cortex/data/baseline.json
D cortex/data/invariant/baseline.json
M cortex/snapshot/index.js
D data/cortex/memory/event_log.json
D data/cortex/memory/fault_log.json
D data/cortex/memory/forged_hats.json
D data/cortex/memory/gaps.json
D data/cortex/memory/hooks.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/raid_decisions.json
D data/cortex/memory/scheduled_tasks.json
D data/cortex/memory/settings.json
D data/cortex/memory/tool_index.json
D data/cortex/memory/triggers.json
D data/idearium/event_log.jsonl
D data/intelligence/event_log.jsonl
M guardian/jaa-store.js
D idearium/data/specs/2e07322f-0260-45ee-993f-c24fe9a5e69e.tar.gz
D idearium/data/specs/356483a8-913b-4bd3-9a9a-a88d2ea9b8b2.tar.gz
D idearium/data/specs/9cbf2d02-04d8-4a9e-b1a4-9d0447215987.tar.gz
D idearium/data/warp-crystals.json
D loom/data/registry.json
M loom/maps/session-2026-08-14-map.js
M tests/modules/baseline.test.js
M tests/modules/orchestrator-cli.test.js
M tests/modules/run-all.js
M tests/modules/test-intelligence-causal.js
M tests/modules/test-jaa-flush-lock.js
M tests/modules/test-macro.js
A tests/modules/test-nex-system-state.test.js
M tests/modules/test-p2-snapshot-sigma.js
```

### Build 0.39.0-r97 — snap-0439 — 2026-08-27 13:08:06

- Archive: `nexus-0439_2026-08-27_v0.39.0-r97_2026-08-24-handoff-updated-1.zip` (was `nexus-2026-08-24-handoff-updated-1.zip`)
- SHA-256: `e798b771f509db74dce08ab7e440fe2d778aeb6406c5da2addc82f5c07207802`, 31 MB, downloaded 2026-08-27 13:09:28
- Kind: full
- Commit: `50e6c806024a7a8ebaa17bde3241649ea2a75707`, tag `snap-0439`
- Left out: embedded .git (2190 files, HEAD 01b1c1af89df1ee765e48b2c08df565ceac45ab4 (master))
- Files in archive: 2028. Changes against the build before it: **1 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 1 | 0 |
| guardian | 0 | 1 | 0 |

```
M guardian/server.js
M tests/modules/run-all.js
A tests/modules/test-guardian-state-provider.test.js
```

### Build 0.39.0-r98 — snap-0440 — 2026-08-27 13:37:36

- Archive: `nexus-0440_2026-08-27_v0.39.0-r98_handoff.zip` (was `nexus-2026-08-27-handoff.zip`)
- SHA-256: `e8403da60c565198475b5cbccbb8cf46b4acbd1437ffc9c6dfa98f682e1f7ed2`, 31.2 MB, downloaded 2026-08-27 13:38:37
- Kind: full
- Commit: `7196917e5ce5bc40c131e53eb81962395bb344ab`, tag `snap-0440`
- Left out: embedded .git (2205 files, HEAD 7d6493596241b8f8a8f19035571bce4bf94c27f3 (master))
- Files in archive: 2095. Changes against the build before it: **67 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 42 | 0 | 0 |
| cortex | 24 | 0 | 0 |
| docs | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
A cortex/data/snapshots/06811c70-5cf6-4bbc-8976-8f6969cd3115.nex
A cortex/data/snapshots/0f466ead-17f6-4cf9-9b56-22ee546ab578.nex
A cortex/data/snapshots/2749067c-b28c-4927-952a-01002d6176a1.nex
A cortex/data/snapshots/298078f4-622b-4400-a739-70fcd98eb911.nex
A cortex/data/snapshots/44deca06-9f68-456b-b3c6-543a9e91517a.nex
A cortex/data/snapshots/4712c694-b4b7-410f-a066-4cf3b9eda01d.nex
A cortex/data/snapshots/53e709e6-b0b3-4b1d-8932-9430edc3c975.nex
A cortex/data/snapshots/6c0df705-8052-4440-95a8-f43b89010802.nex
A cortex/data/snapshots/7afeda2f-5d10-43c0-8166-e419fb6ec214.nex
A cortex/data/snapshots/7c9a2c32-ca77-4cd5-bd6e-8a10651fe865.nex
A cortex/data/snapshots/7f9bb9ed-d265-41be-9209-13afe10eb64a.nex
A cortex/data/snapshots/ad58abc7-176d-4430-930b-c0f970542669.nex
A cortex/data/snapshots/b4320fb1-c2cc-462b-bfa8-bdfe4eb1a166.nex
A cortex/data/snapshots/bd5b6e63-5ea5-44a5-9999-8018d806974c.nex
A cortex/data/snapshots/c4e3d1cc-fd21-4cd9-b62e-8b28450aa265.nex
A cortex/data/snapshots/c4f18da9-b8c9-4c5f-a0cd-93ecc555711a.nex
A cortex/data/snapshots/ce4c8466-8eb5-4227-b525-965258cadd61.nex
A cortex/data/snapshots/ce656c31-8721-4369-8b69-6b39dc0efa47.nex
A cortex/data/snapshots/d58351ca-2448-4e8e-b703-81713fc5c3a4.nex
A cortex/data/snapshots/da1fc288-19c7-4ee8-9c37-0cff83c50d4e.nex
A cortex/data/snapshots/e54d3f8f-4ecc-40de-9a64-d60bf7ffff96.nex
A cortex/data/snapshots/ebe9ae1f-45c6-450f-98e7-2faa97037545.nex
A cortex/data/snapshots/f1adad25-6fca-4133-a023-61a8dbc8c292.nex
A cortex/data/snapshots/ff8dda01-93e2-42a9-84a7-d2e376272cf0.nex
A data/autopilot/autopilot.log
A data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/component_ledger.json
A data/cortex/memory/event_log.json
A data/cortex/memory/intake_drops.json
A data/cortex/memory/settings.json
A data/cortex/memory/versionium_branches.json
A data/cortex/memory/versionium_commits.json
A data/guardian/ledger/cfr/cfr_state.json
A data/guardian/ledger/cfr/event_stats.json
A data/ledger/bridge/b.y/2026-08-27.jsonl
A data/ledger/bridge/b/2026-08-27.jsonl
A data/ledger/copilot/copilot.introspect/2026-08-27.jsonl
A data/ledger/copilot/copilot.person-model/2026-08-27.jsonl
A data/ledger/copilot/copilot.person-model/session-h1.jsonl
A data/ledger/copilot/copilot.person-model/session-h2.jsonl
A data/ledger/copilot/copilot.person-model/session-own.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
A data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
A data/ledger/copilot/copilot.person-model/session-x1.jsonl
A data/ledger/cortex/cortex.gaps.list/2026-08-27.jsonl
A data/ledger/cortex/cortex.raid/2026-08-27.jsonl
A data/ledger/event_log.jsonl
A data/ledger/forge/forge.old/2026-08-27.jsonl
A data/ledger/forge/forge.patch/2026-08-27.jsonl
A data/ledger/guardian/g.x/2026-08-27.jsonl
A data/ledger/guardian/g/2026-08-27.jsonl
A data/ledger/guardian/guardian.ncp.status/2026-08-27.jsonl
A data/ledger/liminal/liminal.spaces.hold/2026-08-27.jsonl
A data/ledger/liminal/liminal.spaces.list/2026-08-27.jsonl
A data/ledger/liminal/liminal.spaces.resolve/2026-08-27.jsonl
A data/ledger/liminal/liminal.spaces.show/2026-08-27.jsonl
A data/ledger/orchestrator.jsonl
A data/ledger/reflection/reflection.engine/2026-08-27.jsonl
A data/ledger/test/test.echo.ping/2026-08-27.jsonl
A data/ledger/test/test.event.check/2026-08-27.jsonl
A data/ledger/test/test.widget.panel/2026-08-27.jsonl
A data/ledger/testfaculty/testfaculty.analyze/2026-08-27.jsonl
A data/ledger/testfaculty/testfaculty.mastermind/2026-08-27.jsonl
A data/ledger/testfaculty/testfaculty.predict/2026-08-27.jsonl
A data/ledger/testfaculty/testfaculty.reflect/2026-08-27.jsonl
A data/ledger/testfaculty/testfaculty.route/2026-08-27.jsonl
A docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
M docs/SPEC-REGISTRY.md
M lib/agent-chat.js
M tests/modules/test-agent-chat.js
```

### Build 0.39.0-r99 — snap-0441 — 2026-08-27 13:56:34

- Archive: `nexus-0441_2026-08-27_v0.39.0-r99_handoff-1.zip` (was `nexus-2026-08-27-handoff-1.zip`)
- SHA-256: `1ddd02864cca9741853426d24d48d35a6c41058c89d16a9d03241d04d18dcad3`, 31.6 MB, downloaded 2026-08-27 13:57:24
- Kind: full
- Commit: `1a6c6a36cbc5be7c84fa7db77bd67646f0cbd34e`, tag `snap-0441`
- Left out: embedded .git (2250 files, HEAD 1a06d8e78c5ddae516bea1de421791774d634215 (master))
- Files in archive: 2109. Changes against the build before it: **14 added, 54 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 37 | 0 |
| cortex | 12 | 2 | 0 |
| guardian | 0 | 6 | 0 |
| docs | 0 | 3 | 0 |
| emerge | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
M cortex/boot.js
A cortex/data/snapshots/036d0d6f-f917-40a5-b8a9-1746df19f64f.nex
A cortex/data/snapshots/232c5cbf-8d33-4193-b349-d7ff59a72f9c.nex
A cortex/data/snapshots/2e3acbbc-523a-4c2a-9f86-9c8b90d28a5f.nex
A cortex/data/snapshots/5025df5e-6b38-47d9-9b3c-7bea8ffbf6a1.nex
A cortex/data/snapshots/56779534-a73e-4380-b1e5-6fcb88d86b26.nex
A cortex/data/snapshots/58704772-d15f-4189-9898-587da927365a.nex
A cortex/data/snapshots/66442df0-dfd0-43d6-aa8d-40765795dd84.nex
A cortex/data/snapshots/792053a9-7a2c-428c-9283-745286856110.nex
A cortex/data/snapshots/85cb00ea-c077-4c2b-acc2-7843928d4c2e.nex
A cortex/data/snapshots/90b18dbe-d864-4e98-aa33-7d2eb59863b4.nex
A cortex/data/snapshots/a6ad687d-a0e2-437b-929b-ad7e2f6557d6.nex
A cortex/data/snapshots/d338c330-d231-47a5-ab90-8b4b58f85b8d.nex
M cortex/spec/cortex.spec
M data/autopilot/autopilot.log
M data/copilot/chat_log.buffer.jsonl
A data/cortex/memory/bep_patterns.json
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/intake_drops.json
A data/cortex/memory/poll_log.json
M data/cortex/memory/versionium_branches.json
M data/cortex/memory/versionium_commits.json
M data/ledger/bridge/b.y/2026-08-27.jsonl
M data/ledger/bridge/b/2026-08-27.jsonl
M data/ledger/copilot/copilot.introspect/2026-08-27.jsonl
M data/ledger/copilot/copilot.person-model/2026-08-27.jsonl
M data/ledger/copilot/copilot.person-model/session-h1.jsonl
M data/ledger/copilot/copilot.person-model/session-h2.jsonl
M data/ledger/copilot/copilot.person-model/session-own.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
M data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
M data/ledger/copilot/copilot.person-model/session-x1.jsonl
M data/ledger/cortex/cortex.gaps.list/2026-08-27.jsonl
M data/ledger/cortex/cortex.raid/2026-08-27.jsonl
M data/ledger/forge/forge.old/2026-08-27.jsonl
M data/ledger/forge/forge.patch/2026-08-27.jsonl
M data/ledger/guardian/g.x/2026-08-27.jsonl
M data/ledger/guardian/g/2026-08-27.jsonl
M data/ledger/guardian/guardian.ncp.status/2026-08-27.jsonl
M data/ledger/liminal/liminal.spaces.hold/2026-08-27.jsonl
M data/ledger/liminal/liminal.spaces.list/2026-08-27.jsonl
M data/ledger/liminal/liminal.spaces.resolve/2026-08-27.jsonl
M data/ledger/liminal/liminal.spaces.show/2026-08-27.jsonl
M data/ledger/reflection/reflection.engine/2026-08-27.jsonl
M data/ledger/test/test.echo.ping/2026-08-27.jsonl
M data/ledger/test/test.event.check/2026-08-27.jsonl
M data/ledger/test/test.widget.panel/2026-08-27.jsonl
M data/ledger/testfaculty/testfaculty.analyze/2026-08-27.jsonl
M data/ledger/testfaculty/testfaculty.mastermind/2026-08-27.jsonl
M data/ledger/testfaculty/testfaculty.predict/2026-08-27.jsonl
M data/ledger/testfaculty/testfaculty.reflect/2026-08-27.jsonl
M data/ledger/testfaculty/testfaculty.route/2026-08-27.jsonl
M docs/diagnostic.spec
M docs/forge.spec
M docs/spec-drift.spec
M emerge/spec/emerge.spec
M guardian/nexus-hey-claude.user.js
M guardian/spec/guardian.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/spec/idearium.spec
M intelligence/index.js
M orchestrator/spec/orchestrator.spec
M scripts/precommit-check.js
M tests/modules/test-nexus-wake.js
```

### Build 0.39.0-r100 — snap-0442 — 2026-08-27 14:09:52

- Archive: `nexus-0442_2026-08-27_v0.39.0-r100_handoff-2.zip` (was `nexus-2026-08-27-handoff-2.zip`)
- SHA-256: `f06f572e6f7b7c2a6add100e7d28192e233061b678a0c68dda76f31badbe659d`, 31.7 MB, downloaded 2026-08-27 14:11:22
- Kind: full
- Commit: `ed040220e2b2c0893a0508001f24d49300b7c20b`, tag `snap-0442`
- Identical copy: `nexus-0442_2026-08-27_v0.39.0-r100_handoff-3_dup1.zip` (was `nexus-2026-08-27-handoff-3.zip`)
- Identical copy: `nexus-0442_2026-08-27_v0.39.0-r100_handoff-4_dup2.zip` (was `nexus-2026-08-27-handoff-4.zip`)
- Left out: embedded .git (2261 files, HEAD 8c60ad93fc67095753a40ff54fc7d15ccef72cd1 (master))
- Files in archive: 2111. Changes against the build before it: **2 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 2 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
M copilot/server.js
A data/cortex/memory/constitution_decisions.json
M data/cortex/memory/event_log.json
A data/cortex/memory/gaps.json
M lib/nexus-cli-interface.js
```

### Build 0.39.0-r101 — snap-0443 — 2026-08-27 14:27:26

- Archive: `nexus-0443_2026-08-27_v0.39.0-r101_handoff-5.zip` (was `nexus-2026-08-27-handoff-5.zip`)
- SHA-256: `0fe6e006932d063aee493aeaaf8ac19b874b5c3023a712c2dcb7fd06e3f05df5`, 31.7 MB, downloaded 2026-08-27 14:28:50
- Kind: full
- Commit: `d87513c564cc11d0f20de8c452b11d98c9a0489f`, tag `snap-0443`
- Left out: embedded .git (2265 files, HEAD 8e916fe316836d3b7d34cfa1429dc71fe40ebe18 (master))
- Files in archive: 2111. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 1 | 0 |

```
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
```

### Build 0.39.0-r102 — snap-0444 — 2026-08-27 14:35:12

- Archive: `nexus-0444_2026-08-27_v0.39.0-r102_handoff-6.zip` (was `nexus-2026-08-27-handoff-6.zip`)
- SHA-256: `3d1ad9317ccd21215842fffe618d5bd7a83b5e60e9dd05ea455855217c6077a8`, 31.7 MB, downloaded 2026-08-27 14:37:18
- Kind: full
- Commit: `a5895a5d5c13f3a22ef3c49c8557c1bacea09126`, tag `snap-0444`
- Left out: embedded .git (2269 files, HEAD f34282ca536ed5b3f7d8ca3f0cd40dabf02cf039 (master))
- Files in archive: 2111. Changes against the build before it: **0 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 0 | 1 | 0 |

```
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
```

### Build 0.39.0-r103 — snap-0445 — 2026-08-27 19:33:44

- Archive: `nexus-0445_2026-08-27_v0.39.0-r103_2026-08-28-handoff.zip` (was `nexus-2026-08-28-handoff.zip`)
- SHA-256: `357ba77b72c33c37ac420fae3c5b09125b0b458e67306a3757210c1a2871b0cb`, 32 MB, downloaded 2026-08-27 19:50:50
- Kind: full
- Commit: `e67b9cbcaef9a1eaab303fabf2e3da0bb2fb1b76`, tag `snap-0445`
- Left out: embedded .git (2339 files, HEAD b9a120cfdbd8baa8fa2789a9a2a5ce15d3bb4579 (master))
- Files in archive: 2035. Changes against the build before it: **6 added, 12 modified, 82 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 0 | 46 |
| cortex | 1 | 1 | 36 |
| clear-glass | 1 | 5 | 0 |
| lib | 1 | 2 | 0 |
| idearium | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 1 | 0 | 0 |
| docs | 0 | 1 | 0 |
| loom | 1 | 0 | 0 |
| ui | 0 | 1 | 0 |

```
A architect/data/event_log.jsonl
M blueprint-index.json
M clear-glass/renderer/settings.html
A clear-glass/src/bookmarks/browser.js
M clear-glass/src/bookmarks/store.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/options/store.js
M clear-glass/src/preload/index.js
A cortex/core/raid/contract-intake.js
D cortex/data/snapshots/036d0d6f-f917-40a5-b8a9-1746df19f64f.nex
D cortex/data/snapshots/06811c70-5cf6-4bbc-8976-8f6969cd3115.nex
D cortex/data/snapshots/0f466ead-17f6-4cf9-9b56-22ee546ab578.nex
D cortex/data/snapshots/232c5cbf-8d33-4193-b349-d7ff59a72f9c.nex
D cortex/data/snapshots/2749067c-b28c-4927-952a-01002d6176a1.nex
D cortex/data/snapshots/298078f4-622b-4400-a739-70fcd98eb911.nex
D cortex/data/snapshots/2e3acbbc-523a-4c2a-9f86-9c8b90d28a5f.nex
D cortex/data/snapshots/44deca06-9f68-456b-b3c6-543a9e91517a.nex
D cortex/data/snapshots/4712c694-b4b7-410f-a066-4cf3b9eda01d.nex
D cortex/data/snapshots/5025df5e-6b38-47d9-9b3c-7bea8ffbf6a1.nex
D cortex/data/snapshots/53e709e6-b0b3-4b1d-8932-9430edc3c975.nex
D cortex/data/snapshots/56779534-a73e-4380-b1e5-6fcb88d86b26.nex
D cortex/data/snapshots/58704772-d15f-4189-9898-587da927365a.nex
D cortex/data/snapshots/66442df0-dfd0-43d6-aa8d-40765795dd84.nex
D cortex/data/snapshots/6c0df705-8052-4440-95a8-f43b89010802.nex
D cortex/data/snapshots/792053a9-7a2c-428c-9283-745286856110.nex
D cortex/data/snapshots/7afeda2f-5d10-43c0-8166-e419fb6ec214.nex
D cortex/data/snapshots/7c9a2c32-ca77-4cd5-bd6e-8a10651fe865.nex
D cortex/data/snapshots/7f9bb9ed-d265-41be-9209-13afe10eb64a.nex
D cortex/data/snapshots/85cb00ea-c077-4c2b-acc2-7843928d4c2e.nex
D cortex/data/snapshots/90b18dbe-d864-4e98-aa33-7d2eb59863b4.nex
D cortex/data/snapshots/a6ad687d-a0e2-437b-929b-ad7e2f6557d6.nex
D cortex/data/snapshots/ad58abc7-176d-4430-930b-c0f970542669.nex
D cortex/data/snapshots/b4320fb1-c2cc-462b-bfa8-bdfe4eb1a166.nex
D cortex/data/snapshots/bd5b6e63-5ea5-44a5-9999-8018d806974c.nex
D cortex/data/snapshots/c4e3d1cc-fd21-4cd9-b62e-8b28450aa265.nex
D cortex/data/snapshots/c4f18da9-b8c9-4c5f-a0cd-93ecc555711a.nex
D cortex/data/snapshots/ce4c8466-8eb5-4227-b525-965258cadd61.nex
D cortex/data/snapshots/ce656c31-8721-4369-8b69-6b39dc0efa47.nex
D cortex/data/snapshots/d338c330-d231-47a5-ab90-8b4b58f85b8d.nex
D cortex/data/snapshots/d58351ca-2448-4e8e-b703-81713fc5c3a4.nex
D cortex/data/snapshots/da1fc288-19c7-4ee8-9c37-0cff83c50d4e.nex
D cortex/data/snapshots/e54d3f8f-4ecc-40de-9a64-d60bf7ffff96.nex
D cortex/data/snapshots/ebe9ae1f-45c6-450f-98e7-2faa97037545.nex
D cortex/data/snapshots/f1adad25-6fca-4133-a023-61a8dbc8c292.nex
D cortex/data/snapshots/ff8dda01-93e2-42a9-84a7-d2e376272cf0.nex
M cortex/self-heal/escalation.js
D data/autopilot/autopilot.log
D data/copilot/chat_log.buffer.jsonl
D data/cortex/memory/bep_patterns.json
D data/cortex/memory/component_ledger.json
D data/cortex/memory/constitution_decisions.json
D data/cortex/memory/event_log.json
D data/cortex/memory/gaps.json
D data/cortex/memory/intake_drops.json
D data/cortex/memory/poll_log.json
D data/cortex/memory/settings.json
D data/cortex/memory/versionium_branches.json
D data/cortex/memory/versionium_commits.json
D data/guardian/ledger/cfr/cfr_state.json
D data/guardian/ledger/cfr/event_stats.json
D data/ledger/bridge/b.y/2026-08-27.jsonl
D data/ledger/bridge/b/2026-08-27.jsonl
D data/ledger/copilot/copilot.introspect/2026-08-27.jsonl
D data/ledger/copilot/copilot.person-model/2026-08-27.jsonl
D data/ledger/copilot/copilot.person-model/session-h1.jsonl
D data/ledger/copilot/copilot.person-model/session-h2.jsonl
D data/ledger/copilot/copilot.person-model/session-own.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-1.jsonl
D data/ledger/copilot/copilot.person-model/session-sess-18.jsonl
D data/ledger/copilot/copilot.person-model/session-x1.jsonl
D data/ledger/cortex/cortex.gaps.list/2026-08-27.jsonl
D data/ledger/cortex/cortex.raid/2026-08-27.jsonl
D data/ledger/event_log.jsonl
D data/ledger/forge/forge.old/2026-08-27.jsonl
D data/ledger/forge/forge.patch/2026-08-27.jsonl
D data/ledger/guardian/g.x/2026-08-27.jsonl
D data/ledger/guardian/g/2026-08-27.jsonl
D data/ledger/guardian/guardian.ncp.status/2026-08-27.jsonl
D data/ledger/liminal/liminal.spaces.hold/2026-08-27.jsonl
D data/ledger/liminal/liminal.spaces.list/2026-08-27.jsonl
D data/ledger/liminal/liminal.spaces.resolve/2026-08-27.jsonl
D data/ledger/liminal/liminal.spaces.show/2026-08-27.jsonl
D data/ledger/orchestrator.jsonl
D data/ledger/reflection/reflection.engine/2026-08-27.jsonl
D data/ledger/test/test.echo.ping/2026-08-27.jsonl
D data/ledger/test/test.event.check/2026-08-27.jsonl
D data/ledger/test/test.widget.panel/2026-08-27.jsonl
D data/ledger/testfaculty/testfaculty.analyze/2026-08-27.jsonl
D data/ledger/testfaculty/testfaculty.mastermind/2026-08-27.jsonl
D data/ledger/testfaculty/testfaculty.predict/2026-08-27.jsonl
D data/ledger/testfaculty/testfaculty.reflect/2026-08-27.jsonl
D data/ledger/testfaculty/testfaculty.route/2026-08-27.jsonl
M docs/2026-08-27-event-taxonomy-and-brainstorm-phasemap.spec
M idearium/api/index.js
A idearium/data/specs/25dcb23c-2ecf-4bc4-9fac-6dcf077dce85/manifest.json
M lib/case-library.js
A lib/event-taxonomy-pattern.js
M lib/seam/spec-parser.js
A loom/data/registry.json
M ui/tv-shell/index.html
```

### Build 0.39.0-r104 — snap-0446 — 2026-08-27 20:06:00

- Archive: `nexus-0446_2026-08-27_v0.39.0-r104.zip` (was `nexus-v0.39.0.zip`)
- SHA-256: `e5887109500b48db55cefdebe125bdc98ee872b7cdfc6dab4398c6b7203ba1b6`, 32 MB, downloaded 2026-08-27 20:15:24
- Kind: full
- Commit: `b5dc22fd8b1596305425ab47ad1b6f514aa07717`, tag `snap-0446`
- Left out: embedded .git (2344 files, HEAD 5d50b38b9e8084f3a21eeb76ee49720cab37cd50 (master))
- Files in archive: 2035. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 1 | 0 |
| scripts | 0 | 1 | 0 |

```
M scripts/precommit-check.js
M writeback-failures.jsonl
```

### Build 0.39.0-r105 — snap-0447 — 2026-08-27 20:27:04

- Archive: `nexus-0447_2026-08-27_v0.39.0-r105_1.zip` (was `nexus-v0.39.0-1.zip`)
- SHA-256: `a79751bf6ebc2c1ce3776206be5c74d6f1fc6bfb9b0342b0f042afcd61bacf4f`, 32.1 MB, downloaded 2026-08-27 20:30:44
- Kind: full
- Commit: `e4cd74aea1563621c8413727f576b00c979c2137`, tag `snap-0447`
- Left out: embedded .git (2352 files, HEAD 28fc66cf42bbf454cb90d58801390f5000f2644e (master))
- Files in archive: 2035. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |

```
M clear-glass/src/ipc/bridge.js
M clear-glass/src/options/store.js
```

