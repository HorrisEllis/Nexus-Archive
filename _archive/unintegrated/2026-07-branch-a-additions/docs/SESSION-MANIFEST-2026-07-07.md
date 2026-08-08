# NEXUS Session Manifest — 2026-07-07
Two things happened this session: (1) wired in files from prior sessions that
hadn't made it into this tree yet, (2) built the next item on the pipeline
spec's own gap-map.

## 1. Wired in (loose files + prior-session work reapplied)
- `guardian/server.js` — the uploaded `guardian-server_1_.js` was confirmed
  byte-identical (diffed) to last session's meta/liminal wiring. Applied as-is.
- `bridge/server.js` — this tree's copy was the pre-wiring base (confirmed by
  diff). Reapplied the CFR-scoring + gap-detection centralization at
  `handleRequest`, verified previously via a live HTTP test against a running
  bridge instance.
- `lib/autonomous-loop.js` — was entirely absent from this tree. Added.
  First live caller of compartment-engine.spawn() (intent-classifier ->
  case-library -> spawn -> execute). Verified previously: cold-tier PASS,
  3 repeated failures -> real negative crystal, 4th attempt genuinely blocked.
- `ollama/server.js` — reapplied `POST /api/autonomous/run` against the
  *current* base, which had independently gained a `run_command` tool since
  last session (not touched — verified the two changes don't overlap).

## 2. Built: redundant conversation ledger
copilot-system-programmer.spec build_order item 4 / NEXUS-PIPELINE-SPEC
gap-map item 1 — "spec'd, not built" until now.

`copilot/server.js`'s `_persist()` is copilot's one write chokepoint (9 call
sites all route through it). Every `chat_log` write now also writes a mirrored
`event_log` row (`type: 'copilot.conversation'`), with `causedBy` chained to
that *same session's* previous turn's event id. Conversation history now
survives even if `chat_log` itself is ever cleared or corrupted — the literal
mechanism "all memory stays" needs, per the spec's own wording.

Zero of the 9 existing `_persist('chat_log', ...)` call sites were touched —
this is deliberate: one chokepoint edit, not nine.

Verified with an isolated logic test (real assertions, not just syntax check):
- Turn 1 in a session: event_log row written, no `causedBy` (nothing before it).
- Turn 2, same session: `causedBy` == turn 1's event uuid — chaining is real.
- A write to any other table never produces a mirrored event_log row.
- Session state (`lastLedgerEventId`) correctly advances after each turn.

## Honest scope note
Item 4 was chosen because both the vision spec and the pipeline spec
independently flagged it as the correct next item — small, no new subsystem,
and a hard dependency for item 5 (system-learning / conditioning_log) and the
Rewind feature (item 2), neither of which is built yet. Those are the natural
next steps, in that order.

## 3. Built: Rewind (pipeline-spec gap-map item 2)
`POST /api/rewind` on copilot — `{ sessionId, toEventId }`.

Reads the redundant ledger built in item 2 above, walks the `causedBy` chain
backward from `toEventId` to reconstruct that session's history up to that
point, fetches the matching `chat_log` rows, and re-injects them as the
*next* turn's session context via `_injectSessionHistory` — a real re-
injection, not just a read endpoint returning JSON.

Two bugs caught and fixed before shipping, not after:
- `cortex/boot.js`'s `GET /api/memory` filters on top-level `row.sessionId`;
  the redundant-ledger event_log rows only had `sessionId` nested inside
  `payload`. Would have made every rewind silently return zero events.
  Fixed by writing `sessionId` at both levels.
- `_injectSessionHistory`'s existing `session.exchanges > 1` guard exists to
  limit the *normal* history injection to session start. Left unchanged,
  it would have silently swallowed rewound history on every mid-conversation
  rewind (exchanges is essentially always >1 by the time someone rewinds).
  Fixed: a rewind now bypasses that guard once, injects, then clears itself
  so it doesn't repeat on later turns.

Branch semantics, stated explicitly rather than left ambiguous: rewinding
resets `session.lastLedgerEventId` to the target event, so the next real
turn's `causedBy` chains from *there*. Turns after the rewind point are
never deleted (event_log is append-only) — rewind branches the live
timeline, it doesn't erase anything.

Honest boundary: Cortex's `/api/memory` reads a most-recent-N tail, not a
full table scan — a target event old enough to fall outside that window
returns a clear "not found in recent ledger" error rather than a silent
wrong-place rewind.

Verified with isolated logic tests: chain-walk returns only ancestors up to
the target (not later turns); a cyclic `causedBy` terminates instead of
hanging; rewound history injects exactly once and is correctly cleared
after, including the exchanges>1 bypass case.

Next in dependency order: item 5 / conditioning_log (system-learning) --
copilot writing what it's learned about each system's behavior, not just
what was said in conversation.

## 4. Built: conditioning_log / system-learning (gap-map item 5)
Write side: `copilot/lifeline.js`'s existing `_persist()` chokepoint (already
called on every route() exit) now also writes `conditioning_log`, matching
the spec's exact shape: `{ system, context, action, outcome, tick }`. All
5 exit paths now pass an explicit, meaningful `action` label
(`ollama_direct_high_confidence`, `escalated_ollama_low_confidence`,
`explicit_agent_request`, `guardian_direct_ollama_offline`,
`ollama_low_confidence_escalation_failed`) instead of a generic one.

One real bug fixed in the process: the "both unavailable" total-outage
branch never called `_persist` at all — a full outage was invisible to
both chat_log and conditioning_log. Fixed; failures are now logged with
their actual error, which matters more than logging successes, per the
spec's own "what breaks it" framing.

Read side: `copilot/server.js`'s `_injectConditioning()`, folded into the
same `_injectSessionHistory` chokepoint all 3 existing callers already use
— one edit, all 3 call sites get it. Every turn now gets a compact
per-system summary (last action, recent failure ratio) injected into
context.

Honest scope note, stated in the code: the spec's full mechanism is
"most relevant conditioning_log entries... via nexus-query-surface keyword
resolution" — `nexus-query-surface` is itself only a spec, no
implementation exists (confirmed by grep). What's built is the honest
subset: recency-based, not topic-matched. Real signal, narrower than the
spec's eventual target.

Verified: write-side test confirms all 5 scenarios (including the failure
path) produce correct conditioning_log rows; read-side test confirms
per-system failure-ratio math is correct against a hand-constructed
multi-system, multi-outcome row set.

## Build order status (copilot-system-programmer.spec)
1. nexus-query-surface — NOT built (confirmed: spec only, no implementation)
2. Monitoring — not checked this session
3. Feedback loops — not checked this session
4. Redundant conversation ledger — BUILT this session
5. System learning / conditioning_log — BUILT this session (honest subset, see above)
6. Multi-system task graphs — not started
7. Task scheduling — not started (also flagged as entirely missing in the Vision Spec)

Next real dependency: item 1, nexus-query-surface, is what upgrades item 5's
read side from recency-based to actually relevant-to-this-conversation --
worth treating as the next target since it retroactively improves what's
already built rather than only adding new surface area.

## 5. Built: nexus-query-surface (build_order item 1)
`GET /api/cortex/query?about=X&window=Y` in `cortex/boot.js` — was
`status: proposed`, zero implementation existed anywhere (confirmed by
grep for the route before this). Joins `gaps`, `event_log`, `sigma_records`,
CFR's live field, and `lib/blueprint.js` against a subject string within a
time window, then synthesizes a narrative combining a factual summary of
what this query found with `mastermind.analyze()`'s existing causal-trace
output.

Honest scope, stated directly in the code and in the response's own
`_scope_note` field rather than left implicit:
- Keyword resolution is exact/substring matching only. The spec's fuzzy
  resolution via `intuition()`'s schema-routing variant (build_order item 2)
  is NOT built.
- `commits` (Versionium) and `labs` (LabSession) are always empty arrays
  with an explicit note — grepped first, confirmed neither has any
  implementation anywhere in the tree (Versionium is spec-only; the two
  "lab" hits that exist, `cos/playground/llm-lab.js` and eravos's
  `edm-lab`, are unrelated systems, not session-tracking).
- `field` is the system-wide CFR snapshot, not scoped per-subject —
  `meta/cfr/field.js` doesn't track per-relationship shape.
- Reads are `jaaDB.tail()` recency-window scans, same tradeoff
  `orchestrator.js`'s `/api/recall` already makes, not full table scans.

Verified with isolated logic tests: window filtering excludes out-of-range
gaps correctly; subject matching finds real hits and produces zero false
positives for an unrelated subject; substring matching correctly reaches
into stringified object fields (event payloads), not just top-level
strings.

**Wired into copilot** (build_order item 4) — `_injectConditioning` (built
last turn as a recency-only honest subset) now calls this real query
surface first, extracting a subject from the current prompt via a system-
name regex, and only falls back to the old recency-based read if the query
surface call fails or returns nothing. This is a real upgrade of already-
shipped code, not just new surface area — exactly what was flagged as the
right next target last turn.

## Build order status, updated (copilot-system-programmer.spec)
1. nexus-query-surface — BUILT this session (items 1, 3, 4 of its own
   build_order; item 2, fuzzy keyword resolution, explicitly not built)
2. Monitoring — not checked this session
3. Feedback loops — not checked this session
4. Redundant conversation ledger — BUILT
5. System learning / conditioning_log — BUILT, now upgraded to use item 1
6. Multi-system task graphs — not started
7. Task scheduling — not started

Remaining real gap in nexus-query-surface itself: item 2 (fuzzy keyword
resolution). Worth doing next specifically because it's the one thing that
would upgrade *this* session's own work (item 1) from substring-match to
real semantic resolution, same "upgrade what's already built" logic that
motivated building item 1 this turn.
