# Nexus 0.39.344

**0.39.344 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 09:56:22 → 2026-10-05 09:56:22 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.344 |
| Tag | `v0.39.344` → snap-0733 |
| Full file ledger | [LEDGER-0.39.344.csv](../ledger/LEDGER-0.39.344.csv) |

## Release notes — `CHANGELOG-0.39.344.md`

Copied unchanged from the build.

### 0.39.344 — 2026-10-05

James: "okay its stuck."

His screenshots: the desktop setup at "ready: C:\Users\…\cos-testenv\base.qcow2" and still "setting up · 38:24", with Ready never ticked and "Close — it keeps running"; the Environment page reading "setup job: running — [object Object]".

- **What happened.** The setup finished: it built the image, verified it, put it in place and wrote its result. But its process did not exit, because something on his machine kept it alive. `cos/testenv/setup-job.js` marked a job done only when the process exited, so the job read "running" forever. The image itself is ready; the Environment page already showed the VM ✓.
- **Fixed in three places.**
  - `cos/testenv/setup-job.js` settles the job on the result line, which is the answer. A process still alive 20 s after its result is stopped, and the log says so.
  - `cos/testenv/provision.js` exits once its result is written and stdout has flushed.
  - `idearium/ui/js/repo-environment.js` reads a log entry's `msg`. It read `.text`, which log entries do not have, so it printed the object itself.
- **Tests.** `test-setup-job-settles` 5/5 (registered): a fake setup that writes its result and never exits settles as done, is stopped after the linger window, and that is said. test-cos-testenv 29/29, test-cos-testenv-any-repo 63/63, test-desktop-setup-popup 9/9.
- **Not found from here.** What kept the process alive on his machine. Possibly a QEMU child or a guest-agent socket on Windows; the fix holds whatever it was.

## Ledger

### Build 0.39.344 — snap-0733 — 2026-10-05 09:56:22

- Archive: `nexus-0733_2026-10-05_v0.39.344_main-30.zip` (was `Nexus-main-30.zip`)
- SHA-256: `7c01bd2c315a5d9e08ca71b5d9db7c1c2ac98dbfa5a839308119775e076619f4`, 14.7 MB, downloaded 2026-10-05 09:58:47
- Kind: full
- Commit: `c4465562ddd9fa76a99303cd8dc848aa04e1cfe0`, tag `snap-0733`
- Files in archive: 5290. Changes against the build before it: **7 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 2 | 3 | 0 |
| (root) | 3 | 1 | 0 |
| docs | 1 | 3 | 0 |
| idearium | 0 | 4 | 0 |
| cos | 0 | 2 | 0 |
| lib | 1 | 1 | 0 |
| loom | 0 | 2 | 0 |
| diagnostic | 0 | 1 | 0 |

```
A CHANGELOG-0.39.342.md
A CHANGELOG-0.39.343.md
A CHANGELOG-0.39.344.md
M cos/testenv/provision.js
M cos/testenv/setup-job.js
M diagnostic/nexus-diagnostic.js
A docs/2026-10-05-announce-pulse-repair-phasemap.spec
M docs/2026-10-05-cos-machines-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/diagnostic.spec
M idearium/lib/config-core.cjs
M idearium/lib/config.js
M idearium/ui/js/desktop-setup.js
M idearium/ui/js/repo-environment.js
A lib/pulse-watch.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M package.json
M tests/modules/run-all.js
M tests/modules/test-desktop-setup-popup.test.js
M tests/modules/test-health-authority.js
A tests/modules/test-pulse-watch.test.js
A tests/modules/test-setup-job-settles.test.js
```

