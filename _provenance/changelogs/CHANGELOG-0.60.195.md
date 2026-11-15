# Nexus 0.60.195

**0.60.195 — 2026-10-21 — Why SP5 never landed: the file that worked was called missing**

| | |
|---|---|
| Built | 2026-10-21 10:28:18 → 2026-10-21 10:28:18 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.195 |
| Tag | `v0.60.195` → snap-0772 |
| Full file ledger | [LEDGER-0.60.195.csv](../ledger/LEDGER-0.60.195.csv) |

## Release notes — `CHANGELOG-0.60.195.md`

Copied unchanged from the build.

### 0.60.195 — 2026-10-21 — Why SP5 never landed: the file that worked was called missing

James, 2026-10-21: "okay bvut did it not capture response from chatgtp." · "looking glaass is a test spec. rral spec test caser"

Looking Glass is your real test case for the pipeline, so when SP5 fails, it's the pipeline that's failing. Recorded as yours.

#### Did it capture ChatGPT's response? No
- **The evidence.** Your Code tab's job bar shows `chatgpt job b833e855 … 0ch · progress: no-reply-element`, which means 0 characters
  were captured. Guardian ended that job at "needs you".
- **The cause.** ChatGPT's new `/uc/` chat URLs, fixed in 0.60.194. Its chats were being dropped before anything could record them.
- **What happens now.** A job waiting on "needs you" can still be completed by its chat transcript, and ChatGPT transcripts get recorded
  again. Its reply will be picked up when the chat finishes.

#### The proposal "by chatgpt" was Gemini's
- **The evidence.** It's stamped 9:43:34. The ChatGPT job wasn't created until 9:43:34.976.
- **Why it said ChatGPT.** The Code tab took the agent from the run's last log row, and that row was the "climbing to chatgpt" one.
- **Fixed.** Each change now names the agent whose reply actually brought it.

#### Why nothing fixed SP5 — the real cause
- **What happened.** Your log: `[shadow] phase.build: 1 expected thing(s) absent — lib/title.js`. Gemini did bring back title.js, at
  `looking-glass-bundle-v0_4/lib/title.js`. An imported bundle keeps its files in its own folder, and its map names them from inside that
  folder.
- **Why it was thrown away.** The build checked for exactly `lib/title.js`, called Gemini's file missing, and climbed to ChatGPT, then
  Claude. Every attempt that worked was discarded.
- **Fixed.** A file delivered under the bundle's own folder now counts as the file the map names. A bare file name never matches, so a
  stray `index.js` somewhere else is still not the file.

#### What still has to happen for SP5
- **Gemini's title.js has a real bug.** It never trims, so `' looking glass '` becomes `' Looking Glass '`. The tests are right to fail
  it.
- **Next steps:**
  1. Reject the current proposal with "trim the input first".
  2. Build SP5 again.
- **What you should see.** Gemini's next reply is no longer called incomplete. If it trims, the test passes and Apply goes through.

#### Measured
- `test-pipeline-root-causes` 15/15:
  - **RC-14:** your exact SP5 case, plus the bare-file-name and two-folders-deep cases;
  - **RC-15:** the Code tab credits Gemini, not ChatGPT.
- **The neighbouring tests are unchanged.** Each failing one failed identically before this release, checked line by line for
  `test-work-surface`.

## Ledger

### Build 0.60.195 — snap-0772 — 2026-10-21 10:28:18

- Archive: `nexus-0772_2026-10-21_v0.60.195.zip` (was `nexus-0.60.195.zip`)
- SHA-256: `0e1a7e44c5ee9e303f4fe44bb62d454bc918e1814b1592fe3d0c5503ff090aab`, 25.2 MB, downloaded 2026-10-21 10:36:07
- Kind: full
- Commit: `a182da29dd1d224b99ff9757545aced714fa9146`, tag `snap-0772`
- Files in archive: 6669. Changes against the build before it: **3 added, 13 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 3 | 2 | 1 |
| idearium | 0 | 4 | 0 |
| guardian | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |
| clear-glass | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.60.193.md
A CHANGELOG-0.60.194.md
A CHANGELOG-0.60.195.md
M VERSION
M clear-glass/src/chats/ports.js
M docs/2026-10-19-pipeline-root-causes-phasemap.spec
M guardian/lib/chat-transcripts.js
M guardian/userscript-chatgpt.js
M idearium/api/index.js
M idearium/repo/nexus-self.js
M idearium/repo/work-surface.js
M idearium/spec/idearium.spec
M lib/version.js
M package.json
D powershell.exe
M tests/modules/test-nexus-atlas-and-glass.test.js
M tests/modules/test-pipeline-root-causes.test.js
```

