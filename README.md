# Rank 3 code fixes — sigma cap / CFR field / RAID agent reachability

Five files, all real fixes against the actual code (not stubs). Drop each
into the matching path under `nexus-current\` (overwrite).

## What was actually broken, and why

### 1. Sigma capped near 0 forever (Phase 106 / OL-18)
`lib/sigma-writer.js` computed every event's "contextual" sigma axis from
CFR field state — but it was requiring `./cfr/field`, the raw *factory*
module (`{createCFRField, computeRegime, EVENT_NUDGES}`). That module has
no live singleton, no `.getState()`, no `.field`. So `cfr?.getState` and
`cfr?.field` were *always* undefined, and every single sigma computation
silently fell back to the hardcoded neutral default
`{coherence:0.5, entropy:0.5, friction:0.5, resonance:0.5}` — forever.
That's why composite sigma never moved past ~0.05: the contextual axis
(20% of the score) was structurally incapable of ever contributing.

**Fix:** `_getCFR()` now wires to `nexus-cfr-influence.js`'s live polled
field (orchestrator already runs both in-process), with a defensive
fallback if no successful poll has landed yet.

### 2. `/cfr/field` always missing `tension` (Phase 48 / OL-2)
Your boot log: `/cfr/field response missing/non-numeric field(s): tension
— skipping this poll`. `nexus-cfr-influence.js`'s threshold table and
`influence()` function have always expected a 5-dimension field
(`tension, coherence, friction, entropy, resonance`) — but `lib/cfr/field.js`
only ever modeled 4 dimensions. `tension` never existed anywhere, so the
poll's shape check failed every single time and influence() never ran:
no SNR-floor raises, no guardian throttling, no chaos alerts, ever.

**Fix:** added `computeTension()` to `lib/cfr/field.js` — a real derived
value (40% friction + 35% entropy + 20% inverse-coherence + 5% resonance),
not invented raw state. Exposed on both `get()` and `snapshot()`.
`lib/cfr/ledger.js`'s `/cfr/field` route now returns `snapshot()` (which
includes `tension` *and* `regime` — the route was returning `get()` before,
which had neither). `nexus-cfr-influence.js`'s `getState()` now also
surfaces `regime` at the top level — `lib/request-handler.js` and
`cortex/core/raid/index.js` both read `getState()?.regime` for CFR-aware
RAID routing (§P97) and it was silently defaulting to `'stable'` always
because `regime` was never in the object it read from.

### 3. RAID's guardian health read the wrong field name (Phase 49)
`cortex/core/raid/index.js`'s `_pollHealth()` read `gd?.connectedProviders`
from guardian's `/health` response. Guardian's actual `/health` handler
(`guardian/server.js`) returns that data under the key `providers`, not
`connectedProviders`. This meant `gd.connectedProviders` was always
`undefined` and **every** agent — including claude/chatgpt, not just the
two you'd flagged — was marked `online: false` regardless of guardian's
real NCP connections. This was a deeper, pre-existing bug, not just the
missing-gemini/perplexity issue from the phase docs.

**Fix:** read `gd?.providers` (the real field). Also added
`gemini`/`perplexity` to `HEALTH_KEY`, `_health`, the poll loop, and the
dispatch `chain` — they're real, guardian-connected NCP providers (your
boot log shows `gemini=10.1.0 perplexity=10.1.0` registered) that were
never even asked about before.

## Verified against existing tests
- `tests/modules/raid-approve-tool.test.js`: 9/9 pass, unaffected
- `tests/full.test.js`: 97/97 pass (includes §6 RAID determinism)
- `tests/brutal.test.js` §11 (`lib/cfr/field.js`): all pass, including the
  pinned "snapshot has 4 numeric dimensions" and "all dimensions 0..1"
  tests — `tension` is additive, doesn't break either check
- Manually verified `computeTension()` produces real bounded numbers
  (not 0, not a constant) against synthetic field updates

## Not touched, on purpose
Phase 102/S4 (action-intent wiring) turned out to already be fully built
in `copilot/server.js` (lines ~625–681, plus `/api/prompt/confirm-action`)
— classifies via Phase 45's intent-classifier, gates FORGE/IRREVERSIBLE
intents behind an explicit human-confirmed contract before
`module-builder.build()` ever runs. Verified all its dependencies
(`lib/contract-queue.js`, `copilot/module-builder.js`,
`copilot/adaptive-fulfillment.js`) load and the classifier produces
correct real output (tested: "delete the old logs" → verb=delete,
risk=IRREVERSIBLE). This was marked ⬛ pending in the phase-map docs —
that was stale, same pattern as Phases 98/103/112. No code change needed,
just update the doc.

## After copying these 5 files, re-run `npm run start:all` and check:
- Boot log should stop showing `/cfr/field response missing ... tension`
- `sigma_records` composite values should start moving above the ~0.05
  ceiling once real events flow (won't be instant — needs the field to
  actually diverge from neutral first)
- `[component-registry] system:guardian registered N components` should
  now correctly reflect claude/chatgpt/gemini/perplexity online status
  in RAID's `_health` snapshot — check via whatever exposes
  `raid.getState()` or `/api/raid/status` in your admin routes
