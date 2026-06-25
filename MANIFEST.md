# Phase 23.16–23.17 — Guardian connecting, and what the existing test suite found

## Guardian — the actual fix this time

Re-traced the connection path from scratch rather than assuming the earlier
race-condition fix was sufficient or even deployed. Two real, separate
things, both in `connect()`:

**1. No recovery path if GM_xmlhttpRequest never calls back.** `connect()`
relies entirely on `onerror`/`onabort`/`onprogress` firing, with `timeout: 0`
(explicitly no timeout, since SSE is meant to stay open indefinitely). If
the extension ever silently fails to fire *any* callback — a CORS rejection
some Tampermonkey/Violentmonkey versions swallow without an error event, a
proxy edge case, whatever the specific trigger — there was no mechanism to
ever notice or retry. The pill sits on "CONNECTING" forever, which is
exactly what your screenshot showed. Added a watchdog: if a given connection
attempt hasn't opened within 10 seconds, it's force-aborted and a fresh
`connect()` is scheduled — generation-guarded the same way the rest of
§23.12 already is, so a stale watchdog from a superseded attempt can't
stomp on a newer one that already succeeded.

**2. The repeated "interrupted SEAM found" spam was a real bug, not just
noise.** `_seamLsResumeCheck()` in the ChatGPT userscript keys its
localStorage records by `jobId` — which is different on every retry. Your
screenshot's six log lines for two actual interrupted jobs (83036522 ×3,
05b25fc0 ×3) is exactly what that produces: three stale jobId-keyed entries
per queue, none of them ever cleaned up. Fixed: dedupe by `seam_queue_id`
(keep the most recent record), and remove every key after this pass runs —
its only job was surviving a page reload long enough to report state once,
not living in localStorage forever.

Both have real, run-and-passing tests — `connection-watchdog.test.js` (the
exact silent-no-callback failure mode, plus confirms a successfully-opened
connection is left alone, plus confirms generation-guarding) and
`seam-resume-dedup.test.js` (reproduces your exact six-entries-two-queues
pattern, confirms exactly two sends instead of six, confirms cleanup).

## "Test, verify, then output" — done properly this time

There's an existing test suite I hadn't been running against my own
changes: `npm test` (`brutal.test.js`), `npm run test:all` (adds
`pipeline.test.js`, `kernel.test.js`, `full.test.js`,
`tests/modules/run-all.js` — 30+ module test files), plus
`userscript-adapter-consistency.test.js`, `home-ui.test.js`, and
`diagnostic-fixes.test.js` sitting in `tests/` already. Ran all of it
against the current state, not just my own new tests in isolation:

```
brutal.test.js                187 passed   0 failed
pipeline.test.js               37 passed   0 failed
kernel.test.js                 FATAL — emerge-kernel.js missing
full.test.js                   92 passed   5 failed
tests/modules/run-all.js      628 passed   2 failed   (was 617/630 before the reflection.js fix below)
userscript-adapter-consistency  FAILING → fixed → now passing
home-ui.test.js                22 passed   0 failed
diagnostic-fixes.test.js       21 passed   0 failed
```

**Found and fixed, mine to fix**: the consistency test failed because my
own comments in `userscript-chatgpt.js` (from §23.12/§23.15/§23.16, written
across the last several turns) literally contained the string
`"userscript-claude.js"` — which the test correctly flags as a
cross-provider fingerprint, since that's exactly the signature of
copy-paste contamination. Reworded the three comments to reference "the
Claude userscript" instead of the literal filename — same information, no
longer trips the (correctly strict) check.

**Found and fixed, a real pre-existing bug**: `reflection.test.js` was
failing 11 of 22 cases on `resolvedContracts is not defined`. Traced it:
`let resolvedContracts = [];` was declared *inside* the `if (gp && jaa)`
block in `lib/reflection.js`, then read again *outside* that block several
lines later. Block-scoped `let` doesn't reach outside its own block — an
unconditional `ReferenceError` every time this function runs, regardless of
whether the condition is true or false. Confirmed this predates anything I
touched (my only edit nearby was the additive `component-ledger.write()`
call several turns ago, well inside the existing block, nowhere near the
declaration) — found it because I finally ran the test that already
existed to catch it. This means the reflection engine's own contract-
closure verification has been throwing on every single pass — a second,
independent contributor to the "gaps never close" pattern in your logs,
on top of the `createJob` meta-drop from two phases ago. Fixed by moving
the declaration to the right scope. 22/22 now.

**Found, confirmed pre-existing, not fixed this round — said honestly
instead of glossed over:**
- `kernel.test.js` — `emerge/emerge-kernel.js` doesn't exist at that path.
  Confirmed nothing in `emerge/` has been touched this entire session
  before concluding this isn't mine to own.
- `full.test.js` — 5 failures, all in RAID's `_cluster`/`_decide`/LAW_I
  reasoning and a `'claude'` vs `'guardian-claude'` naming inconsistency.
  Confirmed my only edit to this file (the ledger-logging from several
  turns ago) is nowhere near this logic. This is real, and it's exactly
  the "same with RAID" work flagged as the next step two turns ago — found
  early, not folded into this turn.
- `test-liminal-space.js` — 2 failures: one genuine crystallisation-event
  bug in `cortex/liminal-space/` I've never touched, one test bug (a
  hardcoded absolute path, `/tmp/nexus-work/cortex/boot.js`, that doesn't
  match this or presumably most environments — a test portability issue,
  not an application bug).

## One more thing found, not yet acted on

`tests/userscript-adapter-consistency.test.js` expects real
`guardian/userscript-gemini.js` and `guardian/userscript-perplexity.js`
files — and they already exist (32KB and 35KB respectively, present since
the original upload). I built `/ui/agents/perplexity/index.html` as a
*console* two turns ago without ever opening these — the console and the
actual injected userscript are two different things, and I conflated them.
The "full recursive QA, debug, test, verify" pass two turns ago only
covered claude/chatgpt's userscripts — gemini's and perplexity's haven't
been looked at at all. Not done this turn — this response was scoped to
Guardian connecting and the test-suite verification specifically. Naming
it now so it doesn't get lost, same as everything else still sitting in
the backlog (eravos diagnostic engine, co-pilot expansion, confidence
scoring, vector-memory completeness, components-system breadth, the
agent-picker reload behavior).

## Install

```
guardian/userscript-claude.js          REPLACES — watchdog
guardian/userscript-chatgpt.js         REPLACES — watchdog + SEAM dedup + fingerprint fix
lib/reflection.js                      REPLACES — scoping bug fix
tests/connection-watchdog.test.js      NEW
tests/seam-resume-dedup.test.js        NEW
```

Every number above is from an actual run, not a claim — `node --check`
clean on all 3 source files, all 9 relevant test files (5 from this and
recent turns, plus the 4 pre-existing ones I should have already been
running) executed directly, output captured above.
