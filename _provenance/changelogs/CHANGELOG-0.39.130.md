# Nexus 0.39.130

| | |
|---|---|
| Built | 2026-09-13 05:55:24 → 2026-09-13 09:42:00 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.130 |
| Tag | `v0.39.130` → snap-0568 |
| Full file ledger | [LEDGER-0.39.130.csv](../ledger/LEDGER-0.39.130.csv) |

## Ledger

### Build 0.39.130-r1 — snap-0566 — 2026-09-13 05:55:24

- Archive: `nexus-0566_2026-09-13_v0.39.130-r1_vnamed-0.39.130-mco0-6.zip` (was `nexus-v0.39.130-mco0-6.zip`)
- SHA-256: `e1058ef5f5a5a28ebc663a13b7d25d57f12a90f022b85c0fcd066900845d40e9`, 61.9 MB, downloaded 2026-09-13 06:12:06
- Kind: full
- Commit: `d06a3b11ce39f68974d2310fedf7483aaa4c2642`, tag `snap-0566`
- Left out: embedded .git (6479 files, HEAD 84bd3990f7ada4b85c8e529715423a2305ae4f12 (master))
- Left out: node_modules (53 files)
- Files in archive: 3811. Changes against the build before it: **105 added, 25 modified, 7395 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 1 | 3 | 6610 |
| data | 0 | 0 | 783 |
| idearium | 56 | 1 | 0 |
| copilot | 33 | 0 | 0 |
| tests | 2 | 7 | 0 |
| guardian | 4 | 1 | 0 |
| lib | 0 | 4 | 0 |
| cli | 0 | 2 | 0 |
| diagnostic | 2 | 0 | 0 |
| service | 0 | 0 | 2 |
| scripts | 2 | 0 | 0 |
| contracts | 0 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| emerge | 1 | 0 | 0 |
| eravos | 1 | 0 | 0 |
| hooks | 0 | 1 | 0 |
| architect | 1 | 0 | 0 |
| intelligence | 1 | 0 | 0 |
| nexus | 0 | 1 | 0 |
| ollama | 1 | 0 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M .gitignore
A architect/output/.gitkeep
M cli/boot-systems.js
M cli/diagnose.js
A copilot/output/.gitkeep
M cortex/core/raid/contract-boundary.js
M cortex/core/raid/contract-intake.js
M cortex/core/raid/index.js
A cortex/output/.gitkeep
A diagnostic/nexus-diagnostic.js
A diagnostic/nexus-heal-loop.js
A emerge/output/.gitkeep
A eravos/output/.gitkeep
A guardian/input/6729653e-15d1-4c7f-a3bf-b685f534799d.contract
A guardian/input/77b66689-ed28-47ec-ac40-155cf4791bcf.contract
A guardian/input/79efbcdb-7531-4c98-a7d6-524553d13bc9.contract
M guardian/interaction-contract.json
A guardian/output/.gitkeep
M hooks/orchestrator.hooks.js
A idearium/output/.gitkeep
M idearium/spec-engine/chunk-dispatch.js
A intelligence/output/.gitkeep
M lib/file-integrity.js
M lib/system-check.js
M lib/system-registry.js
M lib/uid/component-map.js
M nexus/autopilot.js
A ollama/output/.gitkeep
M orchestrator/orchestrator.js
A scripts/mco5-one-real-job.js
A scripts/mco6-ic9-kill-and-restart.js
D service/nexus-diagnostic.js
D service/nexus-heal-loop.js
M tests/diagnostic-fixes.test.js
M tests/modules/healer.test.js
A tests/modules/mco4-stage-transitions.test.js
A tests/modules/mco6-reconcile-on-boot.test.js
M tests/modules/test-boot-log-fixes.js
M tests/modules/test-diagnostic-heal-path.js
M tests/modules/test-emerge-direct-compile.js
M tests/modules/test-health-authority.js
M tests/modules/test-raid-processnext-am1-gate.js
```

7483 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.130-r2 — snap-0567 — 2026-09-13 07:59:38

- Archive: `nexus-0567_2026-09-13_v0.39.130-r2_vnamed-0.39.130-mco0-8.zip` (was `nexus-v0_39_130-mco0-8.zip`)
- SHA-256: `5f90cb1c191735d8762f49de3a46c012ddd0088b8662865c917a51a40a40b1b5`, 62.7 MB, downloaded 2026-09-13 08:16:32
- Kind: full
- Commit: `95abe2461823ab6ca48cc70188a8f3c6fe0fc664`, tag `snap-0567`
- Left out: embedded .git (6497 files, HEAD 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master))
- Left out: node_modules (53 files)
- Files in archive: 3825. Changes against the build before it: **14 added, 4 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cortex | 12 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| architect | 0 | 1 | 0 |
| data | 1 | 0 | 0 |
| docs | 1 | 0 | 0 |
| idearium | 0 | 1 | 0 |

```
M architect/service.js
M cortex/core/raid/contract-boundary.js
A cortex/data/snapshots/07049892-c51c-4465-8b2b-54194b990167.nex
A cortex/data/snapshots/32753c17-43bd-46f2-9533-42a8af6b6682.nex
A cortex/data/snapshots/5e710653-4c4e-4635-a7f9-537ae61993d0.nex
A cortex/data/snapshots/697fcd7a-0bd0-4344-92ed-49a3e1120d55.nex
A cortex/data/snapshots/90de528d-1e61-4f73-80f4-8894e3b46a78.nex
A cortex/data/snapshots/9ee6c841-acc3-42fc-864c-d6a30fd06316.nex
A cortex/data/snapshots/aafda6b4-82e9-4ca2-941d-867f7481a048.nex
A cortex/data/snapshots/b079cc96-045e-465f-917b-92787e72a916.nex
A cortex/data/snapshots/b2452e1d-5535-40f0-a9cb-151a95303c1d.nex
A cortex/data/snapshots/d5b7c7d6-1d3c-4451-b5cc-1a106b4ef102.nex
A cortex/data/snapshots/d7a7d9b3-84ba-4f48-9aca-8f00917fe5d1.nex
A cortex/data/snapshots/ff37e76e-d287-48f2-b03e-dd0f2486cecb.nex
A data/raid/ledger/cfr/event_log.jsonl
A docs/2026-09-13-axiom-5-2-raid-routing-phasemap.spec
M idearium/api/index.js
M writeback-failures.jsonl
```

### Build 0.39.130-r3 — snap-0568 — 2026-09-13 09:42:00

- Archive: `nexus-0568_2026-09-13_v0.39.130-r3_phase6.zip` (was `nexus-v0_39_130-phase6.zip`)
- SHA-256: `7a1008ef5744e993aa5d4ecea8b4328a694ff2562fe44f8aa71ee0d09e09784a`, 59.9 MB, downloaded 2026-09-13 09:53:11
- Kind: full
- Commit: `2eeb3650454163fce6ccb5baae2fe13ec0c60986`, tag `snap-0568`
- Left out: embedded .git (6497 files, HEAD 810790fab8f4d9dd9bb18b2bd7813a5bc73d36f7 (master))
- Files in archive: 3379. Changes against the build before it: **75 added, 14 modified, 521 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 0 | 0 | 521 |
| idearium | 36 | 7 | 0 |
| cortex | 19 | 2 | 0 |
| data | 11 | 1 | 0 |
| guardian | 4 | 0 | 0 |
| lib | 2 | 1 | 0 |
| tests | 2 | 1 | 0 |
| clear-glass | 0 | 2 | 0 |
| diagnostic | 1 | 0 | 0 |

```
M clear-glass/src/dom/archaeology.js
M clear-glass/src/preload/index.js
M cortex/boot.js
M cortex/core/raid/contract-intake.js
A cortex/input/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A cortex/output/1b508067-bc0c-4a83-953c-7603c87fdec3.contract
A diagnostic/interaction-contract.json
A guardian/input/89803f6c-cfb5-4cd1-b44e-5149d3961306.contract
A guardian/input/9f0fb136-ae15-403f-9650-7330b8e767a2.contract
A guardian/input/c9137aae-71a0-4c27-b4ca-6b4bd611fac7.contract
A guardian/input/ca885e67-edf2-48ac-acb7-547f6ac3ae70.contract
M idearium/api/index.js
A lib/compartment-dom-ledger.js
A lib/contract-repo-provision.js
M lib/version.js
A tests/modules/mco10-compartment-dom-ledger.test.js
A tests/modules/mco11-contract-repo-provision.test.js
M tests/modules/run-all.js
```

592 more (mostly data, logs and archived files) are in the ledger file.

