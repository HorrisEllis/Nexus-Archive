# Nexus 0.39.178

**NEXUS 0.39.178 — overhaul phasemap audit**

| | |
|---|---|
| Built | 2026-09-20 09:19:06 → 2026-09-20 09:19:06 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.178 |
| Tag | `v0.39.178` → snap-0622 |
| Full file ledger | [LEDGER-0.39.178.csv](../ledger/LEDGER-0.39.178.csv) |

## Release notes — `CHANGELOG-0.39.178.md`

Copied unchanged from the build.

### NEXUS 0.39.178 — overhaul phasemap audit

Every status in `docs/idearium-repository-overhaul-phasemap.spec`, checked
against the code and corrected with the evidence. No code changed; one test
added.

| Phase | Was | Now | Evidence |
|---|---|---|---|
| MCO0, MCO-A | DONE | DONE | (MCO-A note: file_delta is REAL since 176) |
| MCO-B | DONE, "MCO-C not wired" | DONE | clause fixed; MCO-C landed in 177 |
| MCO-C | DONE | DONE | 177 |
| MCO1 graph | NOT STARTED | **DONE** | repo/graph.js, 3 routes, test-repo-graph 53/53 |
| MCO2 verification | NOT STARTED | **DONE** | verify-lazy.js, test-mco2 18/18 |
| MCO3 snapshot | NOT STARTED | **DONE** | snapshot.js, test-mco3 38/38 (174) |
| MCO-F config | NOT STARTED | **DONE** | new test-mcof-config-gate 14/14 |
| MCO6 compartments | DONE | DONE | unchanged |
| MCO-E roadmap UI | NOT STARTED | NOT STARTED (verified) | no roadmap route or UI exists |
| MCO4 hooks/wires/flows/tools | NOT STARTED | NOT STARTED (verified) | no repository:hook/wire/.flow nodes |
| MCO-D zoom | NOT STARTED | NOT STARTED (verified) | `zoom_levels` declared, no reader |
| MCO-G git push/pull | NOT STARTED | NOT STARTED (verified) | no push/pull code; groundwork listed |

MCO1–MCO3 were built and recorded DONE in
`nexus-repository-system-build-phasemap.spec`; this merged file was never
updated. MCO-F was built but nothing had proven its gate.

#### MCO-F's gate, now proven
`tests/modules/test-mcof-config-gate.js` (14/14), against the real
`idearium/lib/config.js` and the real spec-engine, isolated dirs:
- `chunk_cap` changes the REAL ingest cap live: 2 refuses 3 files naming the
  cap, 50 admits the same ingest, no restart.
- A copilot write and a human write produce events identical except `actor`
  (and timestamp), and the same resulting state.
- A copilot cannot write a key that is not `copilot_writable` (ssh key path,
  port, chunk node dir) or reset one; a human can.
- Out-of-range, wrong-type and unknown values throw; nothing is clamped.
- Layers default < file < runtime, edits need no restart, a bad config file is
  ignored and reported.
Mutation check: removing the `copilot_writable` enforcement fails the test.

Differences from the schema printed in the phasemap: `chunk_cap` defaults to
20000, not 500 (raised on purpose); `snapshots.import_baseline` exists (177);
`pipeline.snapshot_mode` is read since 177; `pipeline.zoom_levels` has no
reader yet (MCO-D).

#### Observed, not fixed
`POST /api/config` takes `actor` from the request body. `copilot_writable:false`
therefore protects `cicd.ssh_key_path` only from a caller that reports its actor
honestly; a caller that sends `actor:"user"` is treated as a human. Section 31
(agents must not touch key material) needs the actor to come from an
authenticated identity. Not touched here: it is an auth-model decision, and MCO-G
(the only consumer of that key) is not started.

#### Still open elsewhere
`docs/idearium-creative-repo-overhaul-phasemap.spec` is marked superseded but
still carries the old statuses. Left as history. The ingest-fidelity question
from 176 (an imported file's bytes on disk did not equal the string sent to
`POST /api/repos`) is not investigated.

#### Verification
Run: test-mcof-config-gate 14/14, test-loom-phasemap-status, plus the MCO
suites (mco2, mco3, mcob, mcoc, repo-graph), precommit-check. Not run: the full
`run-all.js`.

## Ledger

### Build 0.39.178 — snap-0622 — 2026-09-20 09:19:06

- Archive: `nexus-0622_2026-09-20_v0.39.178.zip` (was `Nexus_v0_39_178.zip`)
- SHA-256: `7bd8dbf5ddb8d2e30774a6b627b6f34bf77d488161177e5e322c0f3ee58ad784`, 125.5 MB, downloaded 2026-09-20 09:22:45
- Kind: full
- Commit: `62c98e4cb8c0f53b7673b781b1307a15e4729a36`, tag `snap-0622`
- Left out: embedded .git (5632 files, HEAD 070535f9c77f695b3f387de3907f37382f11be45 (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4675. Changes against the build before it: **21 added, 20 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 5 | 9 | 0 |
| versionium | 5 | 4 | 0 |
| tests | 6 | 2 | 0 |
| (root) | 5 | 2 | 0 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.174.md
A CHANGELOG-0.39.175.md
A CHANGELOG-0.39.176.md
A CHANGELOG-0.39.177.md
A CHANGELOG-0.39.178.md
M docs/idearium-repository-overhaul-phasemap.spec
M docs/nexus-repository-system-build-phasemap.spec
M idearium/api/index.js
M idearium/index.js
M idearium/lib/config-core.cjs
M idearium/registry-components.js
A idearium/repo/import-baseline.js
M idearium/repo/index.js
A idearium/repo/snapshot-files.js
A idearium/repo/snapshot-restore.js
A idearium/repo/snapshot.js
M idearium/repo/source-files.js
M idearium/spec-engine/index.js
A idearium/spec/idearium.repo-snapshot.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/version.js
M package-lock.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-mco-a-file-delta-schema.js
A tests/modules/test-mco3-repo-snapshot.js
A tests/modules/test-mco3-versionium-tab.js
A tests/modules/test-mcob-file-versioning.js
A tests/modules/test-mcob-snapshot-restore.js
A tests/modules/test-mcoc-import-baseline.js
A tests/modules/test-mcof-config-gate.js
M versionium/config.js
A versionium/lib/files.js
A versionium/lib/text-diff.js
M versionium/registry-components.js
A versionium/routes/files.js
M versionium/schemas/schema.file_delta
A versionium/schemas/schema.file_snapshot
M versionium/server.js
A versionium/spec/versionium.file-versioning.spec
```

