# cortex/boot.js's 17 remaining intelligence routes — real breakdown

Continues MIGRATION-2026-08-22.md and MIGRATION-CHUNKS-1-3.md's own "Not done" /
"Held back" sections directly. Both independently identified the same 17 routes and
both stopped at the same real limit: a route cutover needs a live system to verify —
"something must answer on the new port, cortex must stop answering, and every caller
must follow" — which a static checkout can't exercise. This is the real analysis that
makes the cutover executable rather than a second "not done."

Every claim below is from direct inspection of this checkout — grep for real call
sites (not the abstracted registry count), and reading each route's actual backing
function — not the route's name or its comment.

```
17 routes total, cortex/boot.js
 4 already proxied via _proxyToIntelligence (2026-08-22, prior session)
 4 target already exists in intelligence/ — safe to proxy now, zero new code
 5 target does NOT exist yet in intelligence/ — needs a real handler built first
 2 dead code — unreachable, shadowed by an earlier unconditional route
 2 should stay in cortex — genuine write-authority / cortex-owned state
```

---

## Group A — already proxied (done, prior session)

| route | method | real target |
|---|---|---|
| `/api/liminal-space/status` | GET | `intelligence/server.js` (own handler) |
| `/api/liminal-space/list` | GET | `intelligence/server.js` (own handler) |
| `/api/intelligence/reuse` | GET | `intelligence/index.js` `handleRequest` |
| `/api/intelligence/failures` | GET | `intelligence/index.js` `handleRequest` |

**Real external consumers found** (grep for actual call sites, not the route's mere
mention in a spec/registry/data-snapshot):
- `/api/liminal-space/*` — none found anywhere outside `intelligence/server.js`
  itself. Unconfirmed rather than asserted: a browser-side caller wouldn't show up in
  a `.js`/`.html` grep if it's constructed from a template string built at runtime.
  Verify with the live system before ever deleting the cortex-side route entirely —
  a 503 on a route nothing calls is invisible; a 404 on a route something calls
  silently isn't.
- `/api/intelligence/reuse` — `orchestrator.js`, plus `intelligence/index.js` and
  `intelligence/server.js` themselves (expected, they're the target).
- `/api/intelligence/failures` — `orchestrator.js`.

No action needed here. Listed for completeness of the 17.

---

## Group B — target already exists, zero new code needed

Real handlers for these already live in `intelligence/index.js`'s `handleRequest`,
confirmed by reading the function directly — not inferred from the route existing on
the intelligence side in principle. Converting cortex/boot.js's version to
`_proxyToIntelligence` is the exact same one-line change already proven safe for
Group A, four times.

| route | method | cortex's current local fn | intelligence's real handler |
|---|---|---|---|
| `/api/intelligence/context` | GET | `_contextSnapshot()` — see §Group D, this one's more subtle | `handleRequest`, `getContext({intent,command,provider})` |
| ~~`/api/intelligence/patterns`~~ | ~~GET~~ | ~~`_buildPatterns()`~~ | **RECLASSIFIED to Group C — see correction below, not safe** |
| `/api/intelligence/status` | GET | (inline) | `handleRequest` (confirmed present) — **migrated, verified live, 2026-08-22** |
| `/api/intelligence/event` | POST | (inline `jaaDB.insert('event_log', ...)`) | `handleRequest` — **migrated, verified live, 2026-08-22** |

**Real external consumers:**
- `/api/intelligence/context` — **the widest-used route of all 17.** Real, live
  callers: `guardian/userscript-claude.js`, `userscript-chatgpt.js`,
  `userscript-gemini.js`, `userscript-perplexity.js` (all four real provider
  userscripts — this is `pullIntelligenceContext()`, the pre-prompt injection every
  real job goes through), `hooks/guardian.hooks.js`, `hooks/cortex.hooks.js`,
  `contracts/nexus-interaction-contract.js`. This is the single highest-traffic route
  being moved in this whole breakdown — sequence it **last** among this group, once
  the pattern is re-confirmed working end to end on lower-traffic routes first.
- `/api/intelligence/patterns` — `cli/nexus-repl.js`, `copilot/intuition.js`,
  `ui/diagnostics/index.html`.
- `/api/intelligence/status` — `cli/nexus-repl.js`, all four real provider
  userscripts again, plus the confirmed-stale `nexus-hey-claude.user.js` duplicate
  and `userscript-orchestrator.js.deprecated` (both already known-dead, ignore).
- `/api/intelligence/event` — no real external caller found outside cortex/intelligence
  themselves. Likely an internal/ops route.

**⚠ `/api/intelligence/context`'s real complication:** cortex's `_contextSnapshot()`
does NOT do the same thing as intelligence's `getContext()` — it blends in
`_field` (cortex's own live physics state: coherence/friction/resonance/entropy/
tension) and a fresh `_buildRCA(3)` call. A naive proxy would **silently drop the
field snapshot every caller currently gets** — checked directly, not assumed, by
reading both functions side by side (this file, lines 280–291 vs.
`intelligence/index.js`'s `getContext`). Real options, not a default pick:
1. Extend `intelligence/index.js`'s `getContext()` to accept a `field` parameter,
   with cortex passing its own `_field` in in the proxy request body/query — keeps
   the same sovereign-consumer HTTP-only direction already used correctly elsewhere
   in this file (§5.7, the `/nerve/snapshot` comment above `_field`'s own
   definition).
2. Leave `_contextSnapshot()` where it is, permanently, as cortex-owned composition
   — it already blends cortex state with an intelligence RCA call, which is exactly
   what a composition root does. Not every route with "intelligence" in its path is
   intelligence's own logic.
This is a real design decision, not a mechanical move — flagging it rather than
picking silently, per the same standard the prior session held itself to for
`cortex/versionium`.

---

## ⚠ Correction — `/api/intelligence/patterns` was misclassified above

Found during live migration, 2026-08-22, not caught by the original breakdown pass:
this route is **not** a safe proxy. It moved from Group B to Group C.

Cortex's `_buildPatterns()` reads the `crystals` table (written by
`intelligence/meta/crystal-lattice.js`) and returns rows shaped
`{precursor, outcome, count, confidence, kind, ts}`. Confirmed by reading the real
consumer, `copilot/intuition.js`: it reads exactly those four fields
(`p.precursor`, `p.outcome`, `p.count`, `p.confidence`) to render its "Crystallised
patterns" text.

`intelligence/index.js`'s own `/api/intelligence/patterns` handler does **not**
read `crystals` at all — it returns `_patternIndex`, built from a **different real
table**, `bep_patterns` (intelligence's own BEP scanner — 1019 real rows per that
file's own comment, genuinely active, not a stub). Checked directly for a matching
shape: no `precursor`/`outcome`/`count`/`confidence` fields are constructed
anywhere in that file — real rows carry `patternType`, `precursorType`, and other
fields entirely.

Proxying this route as originally planned would have silently broken
`copilot/intuition.js`'s real, working feature — not a shape a caller could degrade
gracefully from, a genuine content swap dressed as a successful `200`. Caught before
committing, by checking the real consumer's exact field reads before proxying, the
same discipline the `/status` route's correction (below) demanded, in the opposite
direction — there, checking consumer usage revealed a safe move; here, it revealed
an unsafe one. The check has to run every time, not just when a mismatch is
suspected.

**Real open question, not resolved here:** are `crystals` and `bep_patterns`
genuinely two different, both-legitimate pattern systems (crystal-lattice's
threshold-crossing crystallisation vs. intelligence's own BEP scan), or has one
superseded the other and the route should point at whichever is now the real
source of truth? That's a real design call about which system is authoritative —
not something to resolve by picking the mechanically easier proxy.

---

## Group C — target does not exist yet, needs a real handler built first

Confirmed by grep against `intelligence/index.js`'s full `handleRequest` — zero
matches for these paths anywhere in that file. Proxying now would be a route to
nowhere; `_proxyToIntelligence` degrades to a real, honest `503` (`intelligence:3753
unreachable`) rather than a silent wrong answer, so this fails loud if attempted —
but it should be built, not attempted blind.

| route | method | cortex's current local fn | real backing logic already in `intelligence/` |
|---|---|---|---|
| `/api/intelligence/intuition` | GET/POST | `_intuitionAnswer()` | **already a thin wrapper** — `_intuition.answer()`, where `_intuition = createIntuition(...)` from `intelligence/intuition.js` |
| `/api/intelligence/mastermind` | GET/POST | `_mastermindAnalysis()` | **already a thin wrapper** — `_mastermind.analyze()`, from `intelligence/mastermind.js` |
| `/api/intelligence/mastermind/patterns` | GET/POST | (inline, calls `_mastermind.detectRecurringPatterns()`) | same `_mastermind` instance, already real |
| `/api/intelligence/adversarial` | POST | `_adversarialCompare()` | **already composed from real intelligence faculties** — `_intuition.answer()` + `_mastermind.analyze()` + `require('../intelligence/adversarial').compareCortexFaculties()` |
| `/api/intelligence/rca` | GET | `_buildRCA()` | genuine cortex-local logic today (`jaaDB.query('gaps', ...)` directly) — no equivalent exists in intelligence/ yet, would need to be written, not just relocated |

**The real reason these four (intuition/mastermind×2/adversarial) aren't trivial
proxies despite already delegating to real `intelligence/` code:** `_intuition` and
`_mastermind` are **instantiated in cortex/boot.js**, not in `intelligence/`, because
their factories need `getField: () => _field` — cortex's own live state — injected
in. `intelligence/server.js` has no access to `_field` today except by asking
cortex's own `/cfr/field` over HTTP (confirmed: it already does this, for its own
`/cfr` passthrough — same §5.7 sovereign-consumer pattern noted above). Moving the
HTTP surface without first giving `intelligence/server.js` a real way to construct
its own `_intuition`/`_mastermind` instances (via that same HTTP field-read, not a
direct import) would either duplicate the composition or leave the new instances
running with a permanently stale/absent field reading. This is the one piece of real
new code Group C actually needs — not a move, a small real build.

**Real external consumers:**
- `/api/intelligence/intuition` — `copilot/server.js`.
- `/api/intelligence/mastermind` — `copilot/server.js`.
- `/api/intelligence/mastermind/patterns` —
  `lib/agent-tools/tools/query/query-intelligence.js` (a real agent tool, meaning a
  live LLM session can call this today).
- `/api/intelligence/adversarial` — none found outside cortex/copilot's own contract
  declarations. Lowest-risk of this group to move.
- `/api/intelligence/rca` — `orchestrator/lib/mcp-server.js`,
  `lib/agent-tools/tools/query/query-intelligence.js`.

**Real, confirmed dead code, found while doing this breakdown, not part of any
planned migration:** `/api/intelligence/intuition && method === 'GET'` (line 855)
and `/api/intelligence/mastermind && method === 'POST'` (line 861) are **unreachable
today**. Both paths are matched unconditionally by the earlier, method-agnostic
routes at lines 561 and 568 — Node's own `if (p === X) {...; return;}` chain is
first-match-wins, so the later, more specific, `&&`-method-gated versions can never
execute. Ironically, the dead versions are the ones whose own comment says "§GAP
CLOSED 2026-08-22 — James asked for these as real, reachable routes" — they were
written to close a real gap and never actually ran. Confirmed by reading the file
top to bottom, not by tooling — grep alone would have shown two matches and called
it done. **Delete the dead pair** when Group C is built; keep the live pair (561,
568) until the real intelligence-side instances exist to proxy to.

---

## Group D — should stay in cortex

| route | method | why |
|---|---|---|
| `/cfr/field`, `/cfr/health` | GET | cortex's **own** physics/state organ — `_field` is written here, not merely read. `intelligence/server.js` already reaches this over HTTP as a real, working sovereign consumer (confirmed: its own `/cfr` passthrough calls out to cortex). This is the correct direction already; moving `_field` itself would relocate a write authority to satisfy a tidiness urge — the same reasoning the prior session gave for keeping `cortex/versionium` in cortex (§10.1). |
| `/api/gaps` | GET/POST | Writes to cortex's own bus (`bus.emit('cortex.gap.found', ...)`) — a real, cortex-owned write authority. `gap-finder`/`gap-tension` (already in `intelligence/`) **consume** this data; they don't own writing it. Same one-write-authority principle as `_field`. |

**Real external consumers, for completeness:**
- `/cfr/field` — `cli/nexus-repl.js`, `guardian/server.js`, `intelligence/server.js`
  itself, `lib/diagnostic-report.js`, `ui/blueprint-builder/index.html`.
- `/api/gaps` — `copilot/diagnostic-sweep.js`, `copilot/intuition.js`,
  `lib/context-builder.js`, `nexus-query.js`, `orchestrator.js`,
  `service/nexus-diagnostic.js`, plus two real UI shells.

---

## Recommended real sequence, if you want to run this live

Not a route move for every one of the 17 in one pass — Group B and Group C are
different kinds of work with different real risk, and the prior session's own
caution about not exercising a live cutover blind still applies to me the same way.

1. **Group B, lowest-traffic first:** `/api/intelligence/status` and
   `/api/intelligence/event` — real targets exist, low/no real external traffic
   found, cheapest to verify and roll back if something's actually calling a shape
   the proxy doesn't preserve.
2. **`/api/intelligence/patterns`** — real target exists, moderate traffic
   (3 real callers). Same proxy pattern, next-lowest risk.
3. **Decide `/api/intelligence/context`'s real question** (proxy-with-field-param
   vs. leave as cortex composition) — this is a real design call, not mine to make
   silently, before touching the highest-traffic route in the whole set.
4. **Build Group C's one real piece of new code** — give `intelligence/server.js` a
   way to read cortex's `_field` over HTTP and construct its own
   `_intuition`/`_mastermind` instances — before moving any of intuition/
   mastermind/mastermind-patterns/adversarial/rca. Delete the two confirmed-dead
   routes in the same pass.
5. **Group D stays.** Not a future chunk — a real, evidenced "no."

Each step gets its own commit, its own live-system verification, and its own
rollback point — exactly the handshake-order cutover spec both prior documents
already asked for, broken into pieces small enough to actually run and check rather
than one 17-route flag day.
