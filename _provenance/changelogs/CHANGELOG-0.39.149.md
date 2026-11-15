# Nexus 0.39.149

| | |
|---|---|
| Built | 2026-09-17 01:06:04 → 2026-09-19 00:15:10 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.147, 0.39.149 |
| Tag | `v0.39.149` → snap-0604 |
| Full file ledger | [LEDGER-0.39.149.csv](../ledger/LEDGER-0.39.149.csv) |

## Ledger

### Build 0.39.149-r1 — snap-0602 — 2026-09-17 01:06:04

- Archive: `nexus-0602_2026-09-17_v0.39.149-r1_vnamed-0.39.149.zip` (was `nexus-v0_39_149.zip`)
- SHA-256: `9fafd1d940ef0988f05bd6f05dbe038235b2dd066cda0080d470a228034f4981`, 102.7 MB, downloaded 2026-09-17 01:08:44
- Kind: full
- Commit: `9c9c7b3e6354747760ce9b224aafa533d6b7b24b`, tag `snap-0602`
- Left out: embedded .git (61 files, HEAD 5678c11e06ff088daf367a3c21acf02344126693 (master))
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6984. Changes against the build before it: **1 added, 9 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| (root) | 0 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
M clear-glass/src/main/index.js
M copilot/server.js
M cortex/boot.js
M guardian/jaa-store.js
M guardian/server.js
A lib/self-register-remote.js
M lib/self-register.js
M nexus/autopilot.js
M orchestrator/orchestrator.js
M package.json
```

### Build 0.39.149-r2 — snap-0603 — 2026-09-17 08:16:10

- Archive: `nexus-0603_2026-09-17_v0.39.149-r2_vnamed-0.39.149.zip` (was `Nexus v0.39.149.zip`)
- SHA-256: `83bcf9a8e7c4dd7f3299382dc4c169150de33cdf19c380558b0ddb6c8ad204c5`, 102.7 MB, downloaded 2026-09-19 00:31:01
- Kind: full
- Commit: `1fdfe21473d049a38631dc6071a474941c26fef5`, tag `snap-0603`
- Left out: embedded .git (61 files, HEAD 5678c11e06ff088daf367a3c21acf02344126693 (master))
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6984. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 2 | 0 |

```
M idearium/ui/index.html
M idearium/ui/js/app.js
```

### Build 0.39.149-r3 — snap-0604 — 2026-09-19 00:15:10

- Archive: `nexus-0604_2026-09-19_v0.39.149-r3_declared-0.39.147.zip` (was `Nexus v0.39.147.zip`)
- SHA-256: `57a1f0a9c247c95b8c4732bbb6bb17a1acca6ef92763f829d25e98d769b8e7b7`, 57 MB, downloaded 2026-09-19 00:20:49
- Kind: full
- Claimed version: 0.39.147 (registry 0.39.147, file name 0.39.147); filed under 0.39.149 to keep the line in order
- Commit: `5855408e4ec67f87d7c0751f24ce6556ab10bfd1`, tag `snap-0604`
- Left out: embedded .git (4386 files, HEAD debf424e7712ed2695604c729d0c53b40f64c3c0 (master))
- Left out: node_modules (276 files)
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 3858. Changes against the build before it: **138 added, 23 modified, 3264 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 2 | 2934 |
| data | 67 | 3 | 329 |
| copilot | 47 | 1 | 0 |
| cortex | 15 | 1 | 0 |
| cos | 1 | 4 | 0 |
| lib | 0 | 4 | 1 |
| tests | 5 | 0 | 0 |
| guardian | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| loom | 1 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| nexus | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A .gitignore
M clear-glass/src/main/index.js
M copilot/server.js
M cortex/boot.js
A cos/cli/commands/advance-work-phase.js
M cos/foundation/event-contracts.js
M cos/foundation/types.js
M cos/host/gates/compartment.js
M cos/host/index.js
A docs/HANDOFF-2026-09-18-next-steps.md
M guardian/jaa-store.js
M guardian/routes/autonomous-loop.js
M guardian/server.js
D idearium/repo/repos/nexus-id-repo-0672ffb3/00-nexus-warp-spec-warp-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/01-nexus-warp-test-v1-4-additions-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/02-nexus-warp-test-dispatch-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/03-nexus-warp-test-digest-regression-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/04-nexus-warp-test-core-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/05-nexus-warp-test-v1-1-0-additions-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/06-nexus-warp-dispatch-digest-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/07-nexus-warp-dispatch-deltacache-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/08-nexus-warp-dispatch-cascade-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/09-nexus-warp-dispatch-canonicalize-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/10-nexus-warp-dispatch-index-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/100-nexus-idearium-registry-components-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/101-nexus-idearium-api-index-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/102-nexus-idearium-test-e2e-pipeline-test-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/103-nexus-idearium-repo-watcher-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/104-nexus-idearium-repo-index-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/105-nexus-idearium-cli-index-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/106-nexus-idearium-changes-2026-07-11-merge-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/107-nexus-idearium-data-projects-nexus-id-repo-956b011e-00-contract-md-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/108-nexus-idearium-data-projects-nexus-id-repo-956b011e-01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/109-nexus-idearium-data-projects-nexus-id-repo-146efe03-00-contract-md-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/11-nexus-warp-dispatch-benchmark-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/110-nexus-idearium-data-projects-nexus-id-repo-2a77b548-00-contract-md-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/111-nexus-idearium-data-projects-nexus-id-repo-63322320-00-contract-md-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/112-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-01-purpose-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/113-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-05-events-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/114-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-03-schema-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/115-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-07-failure-modes-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/116-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-00-meta-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/117-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-06-integration-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/118-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-04-api-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/119-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-02-axioms-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/12-nexus-warp-dispatch-pregen-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/120-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-09-tests-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/121-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-08-build-order-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/122-nexus-idearium-data-node-index-nodes-command-ledger-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/123-nexus-idearium-data-node-index-settings-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/124-nexus-idearium-data-node-index-nodes-capability-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/125-nexus-idearium-data-node-index-nodes-command-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/126-nexus-idearium-data-node-index-nodes-system-ledger-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/127-nexus-idearium-data-node-index-nodes-system-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/128-nexus-idearium-data-node-index-nodes-capability-ledger-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/129-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/13-nexus-warp-dispatch-population-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/130-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-02-axioms-6992c392-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/131-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-05-events-01053d80-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/132-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/133-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-00-meta-789e0ded-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/134-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-04-api-e8304485-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/135-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-07-failure-modes-e2864708-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/136-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-03-schema-46f8c53c-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/137-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-06-integration-68905240-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/138-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-08-build-order-eec9838f-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/139-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-09-tests-146eaa89-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/14-nexus-warp-core-streamlog-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/140-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-01-purpose-19fcdf72-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/141-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-aec7f0f8-5025-404b-bea2-c28f93eebb90-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/142-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/143-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-00-other-txt-e073800e-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/144-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-03-brainos-main-manifest-json-3fec9a1a-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/147-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-07-brainos-main-roadmap-md-2bf98ac3-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/148-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-13-brainos-main-bridge-canvas-persistence-js-7e5f2775-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/149-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-15-brainos-main-crypto-engine-js-b3da16b1-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/15-nexus-warp-core-stream-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/150-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-05-brainos-main-readme-technical-md-8b4faf38-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/151-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-08-brainos-main-account-manager-js-ddf0f871-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/153-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-09-brainos-main-adapters-js-7d3dbb84-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/154-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-06-brainos-main-readme-md-4c3b13fc-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/155-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-a434ae13-9e53-4e45-be1b-7d31929df2d4-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/156-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/157-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-00-brainos-main-brainos-v2-html-5056f7bd-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/158-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-01-brainos-main-brainos-html-d894c1fa-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/159-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-16-brainos-main-ddns-js-8c408b75-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/16-nexus-warp-core-axiom-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/160-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-02-brainos-main-changelog-md-5c4b7c3c-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/161-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-12-brainos-main-bootloader-js-ab776b67-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/162-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-10-brainos-main-agent-factory-js-22506523-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/163-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/164-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-00-hello-txt-79087d2f-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/165-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-f79e4725-ace3-4d64-a93f-5526a4fa2a97-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/166-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/167-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9-023443e0-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/168-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-c9276ac2-e37a-4419-a187-c4ecfa2b884a-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/169-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-00-contract-md-8c143488-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/17-nexus-warp-core-event-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/170-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-00-contract-md-74b75bd5-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/171-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/172-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-7cdb7374-6f0b-44db-a075-4634f21d4196-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/173-nexus-idearium-data-specs-07c37e3e-76e8-41eb-aba3-fa02a9e92476-00-meta-be147340-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/174-nexus-idearium-data-specs-07c37e3e-76e8-41eb-aba3-fa02a9e92476-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/175-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-00-contract-md-3cb0e7c1-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/176-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/177-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/178-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-10-brainos-main-agent-factory-js-8bdf0e8f-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/179-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-12-brainos-main-bootloader-js-c2dc5c67-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/18-nexus-warp-core-index-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/180-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-13-brainos-main-bridge-canvas-persistence-js-da91353f-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/181-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-11-brainos-main-agent-registry-js-40c4a2a8-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/182-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-05-brainos-main-readme-technical-md-615913ad-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/183-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-06-brainos-main-readme-md-c3ce9722-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/184-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-04-brainos-main-readme-investor-md-d058d005-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/186-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-02-brainos-main-changelog-md-13c4d754-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/188-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/189-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-78a72e70-56a9-4c94-987f-c7285f1b1de2-spec.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/19-nexus-warp-core-gatefusion-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/190-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-14-brainos-main-bus-js-1f2c731e-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/191-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-15-brainos-main-crypto-engine-js-a5113494-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/193-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-16-brainos-main-ddns-js-0955d322-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/195-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-08-brainos-main-account-manager-js-21979425-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/196-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-00-brainos-main-brainos-v2-html-7cf7d3fa-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/197-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-03-schema-2858115d-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/198-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-04-api-3ddd2ed9-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/199-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-00-meta-1a2f9f10-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/20-nexus-warp-core-gate-js.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/200-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/201-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-05-events-78595326-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/202-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-02-axioms-75c4938c-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/203-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-01-purpose-d7a99797-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/204-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-00-meta-250f2a16-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/205-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-08-build-order-00de3cbf-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/206-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-07-failure-modes-8b185a2c-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/207-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-05-events-a246d921-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/208-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-02-axioms-e02ae0fc-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/209-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-03-schema-03e2e2fa-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/21-nexus-warp-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/210-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-manifest-json.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/211-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-01-purpose-a2671f0a-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/212-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-06-integration-267c01ea-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/213-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-04-api-31939032-md.md
D idearium/repo/repos/nexus-id-repo-0672ffb3/214-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-09-tests-e1f3a522-md.md
```

3275 more (mostly data, logs and archived files) are in the ledger file.

