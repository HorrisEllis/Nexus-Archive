# Nexus 0.39.144

| | |
|---|---|
| Built | 2026-09-16 19:01:36 → 2026-09-16 19:01:36 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.144 |
| Tag | `v0.39.144` → snap-0600 |
| Full file ledger | [LEDGER-0.39.144.csv](../ledger/LEDGER-0.39.144.csv) |

## Release notes — `CHANGELOG-0.39.144.md`

Copied unchanged from the build.

### 0.39.144 — merge of 0.39.143 / 0.39.142-fixed / nexus-wired-1

Three uploaded snapshots reconciled into one tree. Said plainly, in order,
rather than left implicit in a diff:

#### Base
`Nexus_0_39_143.zip` (identical to `Nexus_0_39_143-1.zip`, confirmed by
MD5) was used as the base — it was already the most complete of the
three: it alone had `remote-desktop/`, `docs/nexus-uri-clearglass-mesh-integration.spec`,
`lib/nexus-uri.js`, `idearium/repo/repo-node.js`, and
`lib/node-schemas/schema.repository`.

#### Folded back in from `nexus-wired-1.zip`
The base was missing 1,519 files that only existed in `nexus-wired-1`:
- `idearium/repo/repos/nexus-id-repo-{0672ffb3,3eed3fb0,c2dd91c5}/` — three
  imported projects' materialized chunk data. Copied forward whole.
- `data/cortex/memory/event_log.json.lock` — **not** carried forward,
  deliberately. A stale process lock has no business in a merged
  distributable; including it risks a target machine believing a lock is
  already held.

#### Real regressions found and fixed, not just re-added
Two things this session had already fixed once, found silently reverted
in this snapshot — both in `repo.import-archive` (the older, synchronous
"Import Project" screen), neither touched by whoever did the forward
merge that produced 0.39.143:

1. **Compartment wiring** — had gone back to always passing
   `compartmentId: null` to `RepoLayer.ingest()`. Re-fixed using the
   *newer* real mechanism this snapshot's own `project-import.finalize`
   already established (`lib/project-container.js`'s `startContainer` /
   `ingestFilesIntoContainer` / `finalizeContainer`), not the older
   `classify()`+`spawn()` patch from before — so both import screens now
   share one real compartment lifecycle instead of two different ones.
2. **The L2-L5 pipeline never ran on this route at all.** `runImportPipeline()`
   (parse → atlas → chunk → verify → index) was only ever called from
   `project-import.finalize`; the older screen's imports got a repo with
   no atlas, no chunks, no indexes. Now calls it the same way, same
   non-blocking fault handling (a pipeline FAULT is logged and surfaced,
   never blocks the import response).

#### What this session's own recent work added that wasn't in ANY of the
#### four uploaded zips
None of the last two sessions' deliverables had been folded into a
working copy before these zips were made:
- `security/signaling-envelope.js`, `security/e2e-channel.js` — added.
  Zero overlap with anything in the existing tree; purely additive.
- The standalone `chunk-index.js` prototype (AST-based JS chunking, JAA-
  table storage, component classification, search index, patch/remove
  work-surface ops) was **not** re-added as-is. `idearium/repo/import-pipeline.js`
  already exists in this snapshot and is a more mature, already-integrated
  L2-L5 pipeline (incremental re-chunk on every write, real `.repository`
  node, disk-based atlas/chunks/indexes) that supersedes it. Rather than
  create two competing "chunk" concepts, only the two things
  `chunk-index.js` had that `import-pipeline.js` didn't were ported over:
  - Component-kind classification (kernel/engine/runtime/CLI/API/
    controller/adapter/configuration/registry/storage/dispatcher/parser/
    compiler/provider/service/event-bus/interface/component), added to
    `buildAtlas()`'s per-file entries plus a `byKind` summary and a flat
    `components` list.
  - A read-only query surface (`readAtlas()`, `queryByKind()`,
    `searchRepo()`) over `import-pipeline.js`'s own existing on-disk
    output — no new storage, deterministic token-overlap search, wired to
    two new routes: `GET /api/repos/:uuid/index` and
    `GET /api/repos/:uuid/search?q=`.
  The patch/remove work-surface operations `chunk-index.js` had are
  **not** carried over — `import-pipeline.js` has no equivalent mutation
  routes yet. Real gap, not silently dropped: flagged here as the next
  piece if per-chunk patch/remove is still wanted.

#### Version
`package.json` bumped `0.39.126` → `0.39.144` to catch it up to the
zip-naming convention already in use; it had been stale since before this
whole merge.

## Ledger

### Build 0.39.144 — snap-0600 — 2026-09-16 19:01:36

- Archive: `nexus-0600_2026-09-16_v0.39.144_named-0.39.144.zip` (was `Nexus_0_39_144.zip`)
- SHA-256: `23f6aca158d1c7ac4e663c796fbc142335f49b559dad3d611373a5c82bc0e572`, 55.8 MB, downloaded 2026-09-16 19:13:13
- Kind: full
- Commit: `fdf5ee9956d46df9d88936c9f5c430c2c9e9f022`, tag `snap-0600`
- Left out (50 MB or more): `cortex/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `cortex/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 6980. Changes against the build before it: **1524 added, 3 modified, 3 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 1519 | 2 | 0 |
| (root) | 1 | 1 | 3 |
| docs | 2 | 0 | 0 |
| security | 2 | 0 | 0 |

```
D .gitignore
D .mcp.json
A CHANGELOG-0.39.144.md
A docs/clearglass-snowflake-relay.spec
A docs/nexus-uri-clearglass-mesh-integration.spec
M idearium/api/index.js
M idearium/repo/import-pipeline.js
A idearium/repo/repos/nexus-id-repo-0672ffb3/00-nexus-warp-spec-warp-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/01-nexus-warp-test-v1-4-additions-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/02-nexus-warp-test-dispatch-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/03-nexus-warp-test-digest-regression-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/04-nexus-warp-test-core-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/05-nexus-warp-test-v1-1-0-additions-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/06-nexus-warp-dispatch-digest-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/07-nexus-warp-dispatch-deltacache-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/08-nexus-warp-dispatch-cascade-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/09-nexus-warp-dispatch-canonicalize-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/10-nexus-warp-dispatch-index-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/100-nexus-idearium-registry-components-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/101-nexus-idearium-api-index-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/102-nexus-idearium-test-e2e-pipeline-test-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/103-nexus-idearium-repo-watcher-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/104-nexus-idearium-repo-index-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/105-nexus-idearium-cli-index-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/106-nexus-idearium-changes-2026-07-11-merge-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/107-nexus-idearium-data-projects-nexus-id-repo-956b011e-00-contract-md-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/108-nexus-idearium-data-projects-nexus-id-repo-956b011e-01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/109-nexus-idearium-data-projects-nexus-id-repo-146efe03-00-contract-md-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/11-nexus-warp-dispatch-benchmark-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/110-nexus-idearium-data-projects-nexus-id-repo-2a77b548-00-contract-md-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/111-nexus-idearium-data-projects-nexus-id-repo-63322320-00-contract-md-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/112-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-01-purpose-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/113-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-05-events-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/114-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-03-schema-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/115-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-07-failure-modes-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/116-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-00-meta-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/117-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-06-integration-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/118-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-04-api-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/119-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-02-axioms-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/12-nexus-warp-dispatch-pregen-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/120-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-09-tests-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/121-nexus-idearium-data-projects-nexus-id-repo-1886b8cb-08-build-order-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/122-nexus-idearium-data-node-index-nodes-command-ledger-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/123-nexus-idearium-data-node-index-settings-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/124-nexus-idearium-data-node-index-nodes-capability-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/125-nexus-idearium-data-node-index-nodes-command-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/126-nexus-idearium-data-node-index-nodes-system-ledger-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/127-nexus-idearium-data-node-index-nodes-system-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/128-nexus-idearium-data-node-index-nodes-capability-ledger-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/129-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/13-nexus-warp-dispatch-population-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/130-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-02-axioms-6992c392-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/131-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-05-events-01053d80-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/132-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/133-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-00-meta-789e0ded-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/134-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-04-api-e8304485-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/135-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-07-failure-modes-e2864708-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/136-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-03-schema-46f8c53c-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/137-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-06-integration-68905240-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/138-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-08-build-order-eec9838f-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/139-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-09-tests-146eaa89-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/14-nexus-warp-core-streamlog-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/140-nexus-idearium-data-specs-a4ec50b2-d420-4a54-9cb0-e3d1c8c6ff92-01-purpose-19fcdf72-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/141-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-aec7f0f8-5025-404b-bea2-c28f93eebb90-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/142-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/143-nexus-idearium-data-specs-aec7f0f8-5025-404b-bea2-c28f93eebb90-00-other-txt-e073800e-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/144-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-03-brainos-main-manifest-json-3fec9a1a-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/145-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-11-brainos-main-agent-registry-js-3771b6dc-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/147-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-07-brainos-main-roadmap-md-2bf98ac3-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/148-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-13-brainos-main-bridge-canvas-persistence-js-7e5f2775-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/149-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-15-brainos-main-crypto-engine-js-b3da16b1-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/15-nexus-warp-core-stream-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/150-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-05-brainos-main-readme-technical-md-8b4faf38-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/151-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-08-brainos-main-account-manager-js-ddf0f871-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/152-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-04-brainos-main-readme-investor-md-0747e06d-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/153-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-09-brainos-main-adapters-js-7d3dbb84-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/154-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-06-brainos-main-readme-md-4c3b13fc-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/155-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-a434ae13-9e53-4e45-be1b-7d31929df2d4-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/156-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/157-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-00-brainos-main-brainos-v2-html-5056f7bd-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/158-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-01-brainos-main-brainos-html-d894c1fa-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/159-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-16-brainos-main-ddns-js-8c408b75-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/16-nexus-warp-core-axiom-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/160-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-02-brainos-main-changelog-md-5c4b7c3c-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/161-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-12-brainos-main-bootloader-js-ab776b67-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/162-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-10-brainos-main-agent-factory-js-22506523-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/163-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/164-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-00-hello-txt-79087d2f-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/165-nexus-idearium-data-specs-f79e4725-ace3-4d64-a93f-5526a4fa2a97-f79e4725-ace3-4d64-a93f-5526a4fa2a97-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/166-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/167-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-01-output-dddd6da0-5027-4de5-9c03-7f71e063d5b9-023443e0-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/168-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-c9276ac2-e37a-4419-a187-c4ecfa2b884a-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/169-nexus-idearium-data-specs-c9276ac2-e37a-4419-a187-c4ecfa2b884a-00-contract-md-8c143488-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/17-nexus-warp-core-event-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/170-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-00-contract-md-74b75bd5-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/171-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/172-nexus-idearium-data-specs-7cdb7374-6f0b-44db-a075-4634f21d4196-7cdb7374-6f0b-44db-a075-4634f21d4196-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/173-nexus-idearium-data-specs-07c37e3e-76e8-41eb-aba3-fa02a9e92476-00-meta-be147340-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/174-nexus-idearium-data-specs-07c37e3e-76e8-41eb-aba3-fa02a9e92476-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/175-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-00-contract-md-3cb0e7c1-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/176-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/177-nexus-idearium-data-specs-9e4af1ce-b54e-4a7c-855f-f6e9f15b4444-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/178-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-10-brainos-main-agent-factory-js-8bdf0e8f-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/179-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-12-brainos-main-bootloader-js-c2dc5c67-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/18-nexus-warp-core-index-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/180-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-13-brainos-main-bridge-canvas-persistence-js-da91353f-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/181-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-11-brainos-main-agent-registry-js-40c4a2a8-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/182-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-05-brainos-main-readme-technical-md-615913ad-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/183-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-06-brainos-main-readme-md-c3ce9722-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/184-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-04-brainos-main-readme-investor-md-d058d005-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/185-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-01-brainos-main-brainos-html-e503bf18-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/186-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-02-brainos-main-changelog-md-13c4d754-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/188-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/189-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-78a72e70-56a9-4c94-987f-c7285f1b1de2-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/19-nexus-warp-core-gatefusion-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/190-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-14-brainos-main-bus-js-1f2c731e-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/191-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-15-brainos-main-crypto-engine-js-a5113494-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/192-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-07-brainos-main-roadmap-md-038ab3ce-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/193-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-16-brainos-main-ddns-js-0955d322-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/194-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-03-brainos-main-manifest-json-d5776de5-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/195-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-08-brainos-main-account-manager-js-21979425-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/196-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-00-brainos-main-brainos-v2-html-7cf7d3fa-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/197-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-03-schema-2858115d-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/198-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-04-api-3ddd2ed9-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/199-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-00-meta-1a2f9f10-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/20-nexus-warp-core-gate-js.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/200-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/201-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-05-events-78595326-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/202-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-02-axioms-75c4938c-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/203-nexus-idearium-data-specs-24478305-8a62-438b-ba47-f3b04c7d07f3-01-purpose-d7a99797-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/204-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-00-meta-250f2a16-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/205-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-08-build-order-00de3cbf-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/206-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-07-failure-modes-8b185a2c-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/207-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-05-events-a246d921-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/208-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-02-axioms-e02ae0fc-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/209-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-03-schema-03e2e2fa-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/21-nexus-warp-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/210-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/211-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-01-purpose-a2671f0a-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/212-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-06-integration-267c01ea-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/213-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-04-api-31939032-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/214-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-09-tests-e1f3a522-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/215-nexus-idearium-data-specs-f2792648-ed83-48c7-a47e-f94683c1b12a-f2792648-ed83-48c7-a47e-f94683c1b12a-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/216-nexus-idearium-data-specs-22c28fe5-6df0-4898-93db-1fee3fb79f3f-00-meta-7297b4b7-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/217-nexus-idearium-data-specs-22c28fe5-6df0-4898-93db-1fee3fb79f3f-manifest-json.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/218-nexus-idearium-data-specs-0202f237-e051-4102-adf0-6fd8511d082d-0202f237-e051-4102-adf0-6fd8511d082d-spec.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/219-nexus-idearium-data-specs-0202f237-e051-4102-adf0-6fd8511d082d-01-purpose-321b9279-md.md
A idearium/repo/repos/nexus-id-repo-0672ffb3/22-nexus-warp-plugins-scorer-default-js.md
```

1380 more (mostly data, logs and archived files) are in the ledger file.

