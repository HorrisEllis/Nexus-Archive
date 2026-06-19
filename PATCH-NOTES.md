# NEXUS-080 — patch notes (this integration pass)

Full project, patches wired directly into the real tree, repackaged as one zip.
6 files touched total, across two rounds of fixes:

## Round 1 (pattern engine / diagnostic crash)

| File | Fix |
|---|---|
| `cortex/intelligence/index.js` | `_patternIndex` now hydrates from `bep_patterns` on boot (was the root cause of full pattern re-logging on every restart); recurring patterns update in place instead of re-inserting; added `sigHash` (sha1) per pattern and `gapHash` on the drift-gap it opens |
| `cortex/memory/jaa-db.js` | Added public `evict(table, uuid, reason)` — same tombstone mechanism the internal decay tick used, now usable by tools |
| `service/nexus-diagnostic.js` | Defined `_getDiagEngines()` — was called but never defined anywhere, crashed the whole diagnostic process on every `/tension` request |
| `cortex/flush-redundancy.js` | New file — one-off cleanup script to dedupe `bep_patterns`/open `gaps` rows that accumulated on disk before the above fix existed. Run once after deploying, before restart (`node flush-redundancy.js --dry-run` first) |

## Round 2 (CFR — found while auditing per your question)

| File | Fix |
|---|---|
| `lib/cfr/field.js` | `update()` had **zero** error handling. Wrapped in try/catch — logs the failure once with context, returns the last-known-good snapshot instead of throwing. This is the function `nexus-diagnostic.js`'s `cfrFeed()` calls on every single gap event, completely unguarded — same crash class as `_getDiagEngines`, just not yet triggered. |
| `nexus-cfr-influence.js` | `_pollCFR()`'s `influence(field)` call was wrapped in `try { } catch(_) {}` — caught, but **silently swallowed**, zero logging. Also only validated `field.tension` was a number before calling `influence()`, not the other 4 dimensions it reads — so a partial/malformed field response would throw deep inside and vanish with no trace. Now: validates the full shape, logs real failures (rate-limited to once-per-failure-streak so it doesn't spam every 5s poll), and clears the suppression once a poll succeeds again. |

## Round 3 (system-wide empty-catch audit, per your "is everything logging errors" question)

Found every genuinely empty `catch(){}` block across all 332 `.js` files mechanically (not regex-guessing — exact pattern match, zero false positives on detection): **341 across 90 files.** Not all are bugs — this codebase has a real, intentional "optional module / best-effort" convention (see `_getMetaTel()` in `nexus-diagnostic.js`) that legitimately uses empty catches. Went through the 4 highest-traffic files by hand, traced each one, fixed only confirmed real silent failures:

| File | Catches found | Real bugs fixed | What was wrong |
|---|---|---|---|
| `lib/request-handler.js` | 27 | 8 | SNR filter & RAID routing decision (Phase B — actual agent selection) failing with zero trace; decision/request audit-log writes silently lost; UNRESOLVED/HELD gap registration silently lost; **§2.1 pre-forge/delete safety snapshot silently skipped** (an irreversible action could proceed with no rollback point and no warning) |
| `orchestrator.js` | 13 | 0 | Audited all 13 — every one is legitimate (per-line JSONL replay skip, multi-platform terminal/browser-opener fallback chains, self-resolving IIFEs). Confirmed clean, not just assumed. |
| `guardian/server.js` | ~17 | 6 | Two **§LAW II** ledger writes (the law's own comment says "ledger write happens BEFORE execution" — was silently allowed to fail); CFR-detected gap insert + bus broadcast (gaps could vanish after CFR threshold crossing); table provisioning at boot; chat_log record for completed jobs |
| `lib/autonomous-loop.js` | 14 | 4 | **The module's own central `_logEvent()` helper was silently swallowing its own write failures** — every event Phase 13 tries to log could vanish with no trace; run-state persistence drift; initial run record could fail to write at all |

Each fix was syntax-checked AND diffed against the pristine original after editing — two of these edits initially ate adjacent lines during patching (a real mistake on my part) and were caught by the diff check before being included here, not after.

**Not yet audited:** the remaining ~86 files / ~321 empty catches. Biggest remaining surfaces by catch count: `cortex/core/raid/index.js` (10), `lib/compartment-engine.js` (10, Phase 25), `lib/reflection.js` (10, Phase 11), `cortex/gap-loop.js` (8), `cortex/boot.js` (8). Say the word and I'll keep going through these the same way — by hand, one file at a time, diffed and verified, not batch-patched blind.



- All 6 files pass `node --check` (syntax) in their real tree positions.
- `cortex/memory/jaa-db.js` and `cortex/intelligence/index.js` were `require()`'d for real (not just parsed) — both load cleanly with their actual sibling modules.
- `service/nexus-diagnostic.js`'s relative `require()` paths were resolved against the real tree — only the already-known, already-handled gap (`../lib/diag-engines/index.js`, intentionally absent — `_getDiagEngines()` is designed to return `null` for it) is missing. Nothing else is broken.
- `lib/cfr/field.js`'s new error path was exercised directly with malformed/null/object-garbage input — confirmed it no longer throws and still returns a valid regime.

## What I did NOT do

An earlier pass tried a regex heuristic across all 332 `.js` files looking for "called but never defined" functions and surfaced ~80 hits. That heuristic is unreliable — it can't distinguish `this._foo()` method calls, destructured requires, or class fields from genuinely undefined globals, so most of those are false positives. I'm not claiming those are real bugs. The CFR findings above were each individually traced and confirmed by reading the actual call path, not flagged by that heuristic.

If you want the rest of the codebase actually audited for this class of bug (undefined function reference, silently-swallowed catch blocks), that needs a proper per-file read, not a regex sweep — happy to keep going file-by-file if you want specific areas prioritized (e.g. guardian/, bridge/, orchestrator.js).
