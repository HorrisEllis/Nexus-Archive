# Nexus 0.60.124

**0.60.124 — 2026-10-17**

| | |
|---|---|
| Built | 2026-10-17 07:29:58 → 2026-10-17 07:29:58 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.124 |
| Tag | `v0.60.124` → snap-0760 |
| Full file ledger | [LEDGER-0.60.124.csv](../ledger/LEDGER-0.60.124.csv) |

## Release notes — `CHANGELOG-0.60.124.md`

Copied unchanged from the build.

### 0.60.124 — 2026-10-17

James sent three screenshots and the full log of `npm run start:all` from a fresh 0.60.122 download, with no words. In the
third screenshot every dock panel sits at "reading…" and Home at "loading the Nexus atlas…". The coder's reading, to
confirm: fix what the log shows is broken, root causes first, as with his earlier logs ("next. fix anything you can.").
Recorded in `docs/2026-10-16-code-tab-rebuild-phasemap.spec`, addendum (g).

#### SW1 — Idearium stays responsive while it syncs the Nexus repo

- **In his log:**
  - "'idearium' missed its heartbeat — silent 17s", then "[watchdog] idearium → OFFLINE" for 34 s, and 25 s more ten
    minutes later.
  - Each silence is the self-sync's import pipeline. It is synchronous from start to finish, and core has 2,556 files:
    it took 24 s at boot, and 5.9 s after a one-file change.
- **What that caused:** while it ran, Idearium answered nothing.
  - The dock's panels stayed at "reading…".
  - RAID's intake logged "idearium unreachable or refused".
  - Versionium's calls timed out.
- **Fixed:**
  - `runImportPipelineOffThread` runs the same pipeline in a worker thread (`idearium/repo/import-pipeline-worker.js`).
  - The self-sync uses it for every system and for the parent index.
  - If the thread cannot start, the pipeline runs inline as before, and the result says so.
- **Measured on 447 files of `lib/`:** inline, the event loop was held for 4,183 ms; in the thread, 15 ms. The result
  is the same.

#### SW2 — Guardian no longer loops on a signed-out tab

- **In his log:** "claude needs a sign-in … its jobs wait", then "flushing 1 queued jobs → claude" every 3 s for five
  minutes, with the connection flapping.
- **Why:** each flush dispatched the job. The tab opened the job's chat, the site sent it back to sign-in, and the tab
  reconnected. The next connect flushed again.
- **Fixed:** a fresh sign-in wall holds the queue, and Guardian says so once. When the tab reports it is signed in, the
  queue flushes. A wall older than five minutes no longer holds jobs, so a lost "signed in" report cannot strand them
  (`guardian/lib/provider-login.js` `holdsJobs`).

#### SW3 — COS's system map on Windows

- **In his log:** about thirty "persist failed: EPERM … rename" lines in 5 s, from Idearium and the orchestrator writing
  the same file.
- **Fixed:** the rename is retried. If it is still refused, the file is written in place, and that is said once a
  minute.

#### Proof

`tests/modules/test-sync-off-thread.test.js` passes 4/4:
- SW-01: same result off the thread as inline.
- SW-02: the event loop stays under 250 ms on a real tree.
- SW-03: the sign-in hold.
- SW-04: EPERM handled.

Neighbouring suites, all passing:

| Suite | Result |
|---|---|
| test-nexus-self-incremental | 5/5 |
| test-versionium-repo-history | 7/7 |
| test-nexus-inject-approval | 9/9 |
| test-agent-index-ready | 4/4 |
| test-idearium-source-files-async | 4/4 |
| test-import-pipeline-syntax | 12/12 |
| test-mco2-verify-deepening | 18/18 |
| test-repo-graph | 53/53 |

Two failures that were already there before this release:
- test-nexus-atlas-refs: the `products` directory is not in the atlas.
- COS's "stamped event has seq".

#### Seen in the log, not changed here

- **His copy was 0.60.122.** The 0.60.123 memory work was not in it, so Eros started and memory went critical at 13:25
  and 13:46. Updating to this release brings both.
- **The self-sync's versions step** (18 s in his second sync) still builds its payload on the main thread. It is next.
- **The PC1 build** reached attempt 12 across five agents and ended contract-incomplete with thin files. That belongs
  to the scale phasemap.

## Ledger

### Build 0.60.124 — snap-0760 — 2026-10-17 07:29:58

- Archive: `nexus-0760_2026-10-17_v0.60.124.zip` (was `nexus-0.60.124.zip`)
- SHA-256: `f66ba95888769d98d3b1a9af1729fa71ef70ee9cf45840fc8a9134871e725930`, 23.8 MB, downloaded 2026-10-17 07:31:28
- Kind: full
- Commit: `790622f24112bfc646b8e15479e4c1c495982758`, tag `snap-0760`
- Files in archive: 6072. Changes against the build before it: **54 added, 64 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 9 | 16 | 0 |
| tests | 12 | 8 | 0 |
| lib | 6 | 12 | 0 |
| (root) | 15 | 1 | 0 |
| docs | 5 | 9 | 0 |
| products | 5 | 0 | 0 |
| cos | 0 | 3 | 0 |
| guardian | 0 | 3 | 0 |
| .github | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| ollama | 1 | 1 | 0 |
| scripts | 0 | 2 | 0 |
| versionium | 1 | 1 | 0 |
| clear-glass | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
M .github/workflows/cos-app.yml
M .github/workflows/release.yml
A CHANGELOG-0.60.111.md
A CHANGELOG-0.60.112.md
A CHANGELOG-0.60.113.md
A CHANGELOG-0.60.114.md
A CHANGELOG-0.60.115.md
A CHANGELOG-0.60.116.md
A CHANGELOG-0.60.117.md
A CHANGELOG-0.60.118.md
A CHANGELOG-0.60.119.md
A CHANGELOG-0.60.120.md
A CHANGELOG-0.60.121.md
A CHANGELOG-0.60.122.md
A CHANGELOG-0.60.123.md
A CHANGELOG-0.60.124.md
A VERSION
M clear-glass/src/main/index.js
M cortex/core/raid/officiator.js
M cortex/self-heal/escalation.js
M cos/app/store.js
M cos/app/version.js
M cos/host/system-map.js
M docs/2026-10-10-design-surface-phasemap.spec
M docs/2026-10-13-gates-that-learn-and-priorities-phasemap.spec
M docs/2026-10-13-projects-raid-and-gates-phasemap.spec
M docs/2026-10-15-cos-app-phasemap.spec
M docs/2026-10-16-code-tab-rebuild-phasemap.spec
M docs/2026-10-16-proposal-evidence-phasemap.spec
A docs/2026-10-16-repo-carve-phasemap.spec
A docs/2026-10-17-pieces-not-order-phasemap.spec
M docs/CLAUDE.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
A docs/looking-glass/PHASEMAP.md
A docs/looking-glass/README.md
A docs/looking-glass/SPEC.md
M guardian/jaa-store.js
M guardian/lib/provider-login.js
M guardian/server.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/registry-components.js
M idearium/repo/build-plan.js
M idearium/repo/code-api.js
A idearium/repo/import-pipeline-worker.js
M idearium/repo/import-pipeline.js
M idearium/repo/nexus-self.js
M idearium/ui/css/code-surface.css
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/code-dock.js
M idearium/ui/js/code-surface.js
M idearium/ui/js/code-tab-panels.js
M idearium/ui/js/plan-panel.js
M idearium/ui/js/projects.js
A idearium/ui/js/ui-editor-doc.js
A idearium/ui/js/ui-editor.js
M idearium/ui/settings.html
A idearium/ui/ui-editor.html
A idearium/ui/vendor/grapesjs/LICENSE
A idearium/ui/vendor/grapesjs/VERSION
A idearium/ui/vendor/grapesjs/grapes.min.css
A idearium/ui/vendor/grapesjs/grapes.min.js
M lib/agent-record.js
A lib/change-record.js
M lib/code-edit.js
A lib/expectation-tests.js
M lib/nexus-releases.js
M lib/node-export.js
A lib/node-schemas/schema.procedure
A lib/prevention.js
M lib/proposal-evidence.js
M lib/repo-agent.js
A lib/repo-carve.js
M lib/repo-inject.js
A lib/repo-procedures.js
M lib/resource-monitor.js
M lib/run-state.js
M lib/test-map.js
M lib/test-sandbox.js
M lib/version.js
M loom/maps/build-surface-map.js
M loom/maps/run-state-map.js
M nexus/autopilot.js
A ollama/lib/idle-unload.js
M ollama/server.js
M package.json
A products/flight-recorder/README.md
A products/flight-recorder/bin/flight-recorder.js
A products/flight-recorder/lib/project.js
A products/flight-recorder/lib/versions.js
A products/flight-recorder/product.json
M scripts/build-cos-app.js
M scripts/release-zip.js
M tests/modules/run-all.js
M tests/modules/test-agent-record.test.js
A tests/modules/test-change-record.test.js
A tests/modules/test-code-dock.test.js
M tests/modules/test-contract-phase-build.test.js
M tests/modules/test-cos-app-build.test.js
M tests/modules/test-cos-app-store.test.js
A tests/modules/test-expectation-tests.test.js
A tests/modules/test-flight-recorder-standalone.test.js
A tests/modules/test-plan-pieces.test.js
M tests/modules/test-plan-sidebar.test.js
A tests/modules/test-prevention.test.js
M tests/modules/test-release-version.test.js
M tests/modules/test-releases.test.js
A tests/modules/test-repo-carve.test.js
A tests/modules/test-repo-procedures.test.js
A tests/modules/test-sync-off-thread.test.js
A tests/modules/test-tested-before-lands.test.js
A tests/modules/test-ui-editor.test.js
A tests/modules/test-undo-any-change.test.js
A versionium/lib/merge3.js
M versionium/spec/versionium.file-versioning.spec
```

