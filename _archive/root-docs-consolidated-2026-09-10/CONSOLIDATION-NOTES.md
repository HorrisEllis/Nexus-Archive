# Consolidation: nexus-v4-complete + nexus-copilot-complete-1 → nexus-consolidated

Base: `nexus-v4-complete`. 796/803 files were byte-identical to copilot's tree;
same `version: 0.9.9`, same `MANIFEST.json`, same `CHANGELOG.md`. The two zips are
the same lineage at different export points, not parallel branches.

## Taken as-is from v4 (base)

- `service/nexus-diagnostic.js` — v4's TDZ-crash fix kept. copilot's version
  reassigned `startService` via `const` before the binding existed at module
  init; would crash on boot. Not merged — v4's fix fully supersedes it.
- `cli/co-pilot.js` — v4's direct-call fix kept (`COPILOT_URL` → `:3750`).
  copilot's version posts through `/api/guardian/copilot/prompt`, which v4's
  own comment states was removed from the orchestrator. Dead path, not merged.
- `clear-glass/src/main/index.js` — v4's `autoBootAll()` wiring kept. copilot
  never calls the host class from main.
- `cortex/boot.js`, `cortex/memory/jaa-db.js`, `cortex/data/*` — these are
  **only in v4**, not copilot. copilot's `cortex/` has neither file; ~45 requires
  across the codebase resolve to `jaa-db.js` alone. copilot's tree cannot boot
  Cortex as exported. No merge needed here — v4 is the only source of truth.
- `powershell.exe` (root + `clear-glass/`) — v4-only, carried through unchanged.

## Merged in from copilot

- `guardian/memory_store/` (12 files, 9.4M) — `jobs.json`, `event_log.json` /
  `.json l`, `chat_log.json`, `ledger.json`, `cfr_state.json`, `gaps.json`,
  `seam_sessions.json`, `artifacts.json`, `queue_compartments.json`,
  `event_stats.json`, `settings.json`. This is live runtime state from a
  session that ran against the copilot export — v4 has none. Carried forward
  rather than discarded; it's accumulated data, not a competing version of code.

## Discarded

- `data/copilot/` (copilot-only) — empty directory, no content to merge.

## NOT merged — open call, your decision

**`clear-glass/src/providers/host.js`** — v4's host.js is a full v1→v2 rewrite
(`cg-provider-host-v1` → `v2`), not a superset. v2 added health/status
tracking, CSP stripping, crash auto-restart, mtime-based re-injection. v1 had
one thing v2 doesn't: an idempotency guard —

```js
if (window.__cgHostedProvider === providerId) return;
window.__cgHostedProvider = providerId;
```

— preventing a second NCP/EventSource connection from being opened into the
same page if `dom-ready` or re-injection fires twice (reload, SPA nav back
into its own domain). v2's injection path (`_inject()`, called from
`did-finish-load` + a 60s mtime-poll timer) has no equivalent guard that I can
see. I did not port it back in — that's a code change to v2's intentional
rewrite, not a file-pick between two existing versions, and it's your call
whether v2 already prevents double-connection some other way (e.g. via the
`_status` map) or whether this is a real regression.

## Still unresolved from prior turn

Why does copilot's tree have `cortex/boot.js` / `jaa-db.js` missing at all —
packaging exclusion, or were they actually absent from whatever source state
produced that export? Doesn't block this consolidation (v4's copies are the
only candidates either way), but it's a process question if `nexus-copilot-complete-1`
is meant to be regenerated from current source going forward.
