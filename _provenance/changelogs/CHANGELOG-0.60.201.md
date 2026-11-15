# Nexus 0.60.201

**0.60.201 — for any project: a busy Idearium is said plainly, and any project's tests can run**

| | |
|---|---|
| Built | 2026-10-21 16:01:10 → 2026-10-21 16:01:10 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.201 |
| Tag | `v0.60.201` → snap-0775 |
| Full file ledger | [LEDGER-0.60.201.csv](../ledger/LEDGER-0.60.201.csv) |

## Release notes — `CHANGELOG-0.60.201.md`

Copied unchanged from the build.

### 0.60.201 — for any project: a busy Idearium is said plainly, and any project's tests can run

James, 2026-10-21, with a screenshot of the upload dialog ("could not start: signal is aborted without reason") and his boot log: "okay,
remember this is for any project. not just mmine"

#### What his log showed
- The upload dialog's first step creates the import compartment, and the browser waited 6 s for it.
- At that moment Idearium was syncing all of Nexus, as it does at boot. The sync took 118 s and Idearium went OFFLINE once, with free
  memory between 10 and 17 %. The wait ran out, and the browser's own words, "signal is aborted without reason", were all he saw.

#### What changed, for every project
- The upload's start waits 60 s.
- Every Idearium call in the UI that runs out of time now says which call, how long it waited, and that Idearium may be busy (a sync,
  an import, or low memory). The error keeps its name, so the finalize fallback of 0.60.196 still finds a late import.
- "Do the tests pass" (proof) reads how a project's tests run from what the project holds, first match wins:
  1. an npm test script;
  2. its own runner (tests/run-all.js and similar);
  3. a Gradle wrapper or build;
  4. Maven;
  5. pytest;
  6. Cargo;
  7. Go;
  8. a Makefile test target.

  When the tool for that way is not installed, it is said ("tool_missing"), never counted as failing tests. 0.60.200's fallback knew
  only Node runners.

#### Proof
- tests/modules/test-any-project-tests.test.js 3/3: detection for every way, real Go and make projects passing and failing through
  proof, and a missing tool said.
- test-pipeline-root-causes RC-19: the real api() against a fetch that never answers.
- Unchanged: test-mastermind-ready 4/4 (MR-03's wording updated), proof-run 7/7, phase-proof 7/7, gates-solid 7/7.

#### Not yet for any project
The build's other gates still assume JavaScript: test-first, verify-first and the coder brief. Those are the language profiles (AD1–AD2
on docs/2026-10-19-infrastructure-spine-phasemap.spec).

#### On his machine
He is on 0.60.198. The fixes of 0.60.199–0.60.201 (roadmap import, the MASTERMIND fixes, this release) need the updated branch.

## Ledger

### Build 0.60.201 — snap-0775 — 2026-10-21 16:01:10

- Archive: `nexus-0775_2026-10-21_v0.60.201.zip` (was `nexus-0.60.201.zip`)
- SHA-256: `c6539aa17be746c98f2bc99cd6a529d10d3baa61559a6aa5a21c1e45010b6ba3`, 25.2 MB, downloaded 2026-10-21 16:02:15
- Kind: full
- Commit: `bb54fcb2c7be8f30a9c5769a45bd88743b13db7f`, tag `snap-0775`
- Files in archive: 6681. Changes against the build before it: **2 added, 10 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 1 | 3 | 0 |
| (root) | 1 | 2 | 0 |
| idearium | 0 | 3 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.60.201.md
M VERSION
M docs/2026-10-10-idearium-solid-phasemap.spec
M idearium/repo/proof-run.js
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-any-project-tests.test.js
M tests/modules/test-mastermind-ready.test.js
M tests/modules/test-pipeline-root-causes.test.js
```

