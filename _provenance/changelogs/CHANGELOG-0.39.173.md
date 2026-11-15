# Nexus 0.39.173

**NEXUS 0.39.170 — version bump + commit message for 165–169**

| | |
|---|---|
| Built | 2026-09-20 05:32:00 → 2026-09-20 05:32:00 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.173 |
| Tag | `v0.39.173` → snap-0621 |
| Full file ledger | [LEDGER-0.39.173.csv](../ledger/LEDGER-0.39.173.csv) |

## Release notes — `CHANGELOG-0.39.173.md`

Copied unchanged from the build.

### v0.39.173

#### Intelligence — "2 rows loading" root-caused correctly this time

- Previous session's guess (crash-restart loop) was wrong — caught against
  a real pasted log, not assumed. `[jaa] Loaded 3 rows — crystals` repeating
  every few seconds is `intelligence/routes.js`'s `freshReader()` (a
  deliberate, needed cross-process freshness mechanism, throttled to at
  most once/sec per table) reloading because something polls
  `/api/intelligence/crystals` that often. Working as designed — just
  logging every reload instead of only the real cold load.
- **Fixed**: `guardian/jaa-store.js`'s `_loadTable(name, { silent })`.
  `reloadTable()` now passes `silent: true`; cold-load callers (`_loadAll()`,
  `_table()`'s on-demand branch) are unchanged and still log once, which is
  real, useful boot information.

#### Guardian — job stuck for up to 15 minutes after its target tab died, fixed

- Traced from a real pasted log: a job dispatched to chatgpt despite a
  failed ping gate (line 362's "dispatching anyway — uncertain evidence")
  got an ack, then the tab genuinely died 31s later
  (`guardian.provider.disconnected`). Nothing was listening for that event
  on the dispatch side — the only recovery path was
  `_COMPLETION_TIMEOUT_MS`, defaulting to 900000ms (15 minutes), while
  ClearGlass had a fresh tab reconnected within 5 seconds.
- **Fixed**: `guardian/lib/dispatcher.js`'s idle-timeout requeue logic
  extracted into a shared `_requeueOrFail(job, reason, waitedMs)` (was
  inlined only in the 15-minute setTimeout — §no repetition). A new
  `bus.on('guardian.provider.disconnected', ...)` immediately requeues
  every in-flight job for that provider through the same bounded-retry
  path (`_MAX_TIMEOUT_RETRIES = 2`, unchanged) instead of waiting out the
  idle window. Dispatch is provider-scoped, not tab-scoped (no tabId
  recorded on the job — "active client" is whichever tab NCP currently has
  for that provider), so a provider disconnect correctly means every job
  still watching that provider lost its target.

#### Orchestrator — pulse absence is now a real, negative-space event

- James: "make pulse emission an event, use negative space for when an
  event is missed a number of times." `orchestrator.pulse` was already a
  real event (bus + ledger + SSE) — nothing existed to notice its absence.
- **Built**: `_armPulseWatch(systemId, intervalMs)` in
  `orchestrator/orchestrator.js`, same shape as
  `guardian/lib/dispatcher.js`'s `_armCompletionWatch` — a timer re-armed
  on every real heartbeat (which already carries the system's own declared
  `intervalMs`, confirmed from `lib/pulse.js`'s beat payload, not guessed).
  Grace window is 1.5x the system's own interval, floored at 5s, so a
  single late beat (GC pause, event-loop backlog) is not a miss. Only
  after `PULSE_MISS_THRESHOLD = 3` consecutive misses — the system never
  came back to clear the count — does it fire: emits `pulse.missed` on the
  bus, records it to the missing system's OWN ledger via
  `_getEventLedger(systemId)` (same routing rule as every other event
  since the per-system ledger split), broadcasts it over SSE, and stamps
  `pulseMissed` on the registry entry (so it's visible over
  `GET /api/registry` too). A real heartbeat clears it — recovery is
  proven by a real beat arriving, never assumed by a timer.
- `diagnostic/nexus-diagnostic.js`'s existing `system_offline` gap (probe +
  registry-staleness based, unchanged) now checks the registry's
  `pulseMissed` field when it fires and appends it to the gap body as
  corroborating evidence — a separate, slower, higher-confidence signal
  layered onto the existing detection, not a replacement for it.

#### TV UI — confirmed canonical homepage (not yet wired)

- Confirmed: `ui/tv-shell` (with the floating menu button) is the intended
  Nexus homepage, not `ui/home/nexus-home.html` — these appear to be two
  live, overlapping shells today (`ui/tv-shell/DECOMP.md` is oddly titled
  "ui/home — Decomposition Map"); not reconciled yet.
- `nexus://home` (→ tv-shell) and a single validated `system/{systemId}`
  route (systemId checked against `ui/ports.js`'s real `NEXUS_PORTS` keys,
  not a free string) were scoped against `lib/nexus-uri.js`'s existing
  closed-allowlist design but **not implemented yet** — queued.
- Explicitly scoped OUT: routing general commands through `nexus://`.
  `lib/nexus-uri.js`'s own header is deliberate about this — it's a
  closed-allowlist deep-link resolver built against URI-scheme argument
  injection ("no fallback branch anywhere in this file, deliberately"; any
  webpage can construct a `nexus://` link). Commands stay on the existing
  HTTP route / grammar-handshake layer.

## Ledger

### Build 0.39.173 — snap-0621 — 2026-09-20 05:32:00

- Archive: `nexus-0621_2026-09-20_v0.39.173_vnamed-0.39.173.zip` (was `nexus_v0.39.173.zip`)
- SHA-256: `942b49034e7d22c7f7837add34fe82ab151ab2f069e5bba26089df9a8a19deb7`, 123.6 MB, downloaded 2026-09-20 06:03:01
- Kind: full
- Commit: `d606b8b39cc521465f61b0231b724e673c3ce26c`, tag `snap-0621`
- Left out: embedded .git (5481 files, HEAD 5774cf483ebcd4585f80d3d86a7b9875d257ab86 (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4654. Changes against the build before it: **1 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 1 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| diagnostic | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A CHANGELOG-0.39.173.md
M diagnostic/nexus-diagnostic.js
M guardian/jaa-store.js
M guardian/lib/dispatcher.js
M orchestrator/orchestrator.js
M package-lock.json
M package.json
```

