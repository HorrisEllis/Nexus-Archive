# NEXUS v0.9.9 — Complete Project Package

This is the **entire project**, not another incremental patch. Every fix
from every round this conversation, already merged, already verified
together as one tree — not files you need to figure out how to combine
with what you already have. Replace your whole directory with this.

## Install

1. **Back up your `data/` folder first** — it's excluded from this
   package on purpose (it's your actual runtime state: JAA tables,
   snapshots, ledgers — shipping that back to you mixed with code risked
   overwriting your real data with whatever was sitting in my sandbox).
2. Replace everything else with this package's contents.
3. Put your real `data/` folder back.
4. **Update the Tampermonkey scripts in your browser directly** — open
   each of the 4 scripts in Tampermonkey's editor and paste in the content
   from `guardian/userscript-claude.js`, `userscript-chatgpt.js`,
   `userscript-gemini.js`, `userscript-perplexity.js`. This package having
   the right files on disk doesn't update what's running in the browser —
   that's still a separate, manual step, and it's the most likely fix for
   "0 providers connected" specifically.
5. `npm run start:all`

## Two things found while assembling this, not fixed — your call

- **`powershell.exe`** (454KB) was sitting in your project root in the
  original upload. I didn't add it and it's not part of this package.
  Worth checking why it's there.
- Two large stray zips (`nexus-v0_9_8.zip`, `nexus.zip`, ~57MB combined)
  were also in the original root — old backups, excluded from this
  package. If you want them, they're still wherever you originally had
  this project; I just didn't ship them back to you again.

## Full changelog, this conversation, consolidated

**Guardian connection / userscripts**
- Fixed a raw-newline-inside-a-string-literal syntax error (3 separate
  occurrences across claude/chatgpt scripts)
- Fixed the `onloadstart` vs `onprogress` race that made every connection
  attempt fail before a real response could ever arrive
- Added the connection-generation guard (`_connGen`) — a superseded
  connection's late callbacks can no longer overwrite a newer connection's
  state
- Added the watchdog — a connection stuck silently with no response for
  10s now forces a reconnect instead of hanging forever
- Fixed the identical race on the server side (`lib/ncp.js`) — a stale
  connection's delayed `close` event could delete a newer, live
  registration
- Migrated `userscript-gemini.js` and `userscript-perplexity.js` to
  `GM_xmlhttpRequest` for every network call (they never received this fix
  when claude/chatgpt did — confirmed directly, 0 GM_xmlhttpRequest calls,
  raw `EventSource` and `fetch()` throughout, which is blocked cross-origin
  from `https://gemini.google.com`/`https://perplexity.ai` to
  `http://127.0.0.1`)
- Finished `userscript-chatgpt.js`'s conversion (3 calls were left
  mid-fix from an interrupted session)
- Fixed the `renderNexus()` duplicate-function-declaration bug in both
  claude and chatgpt scripts — a second declaration silently shadowed the
  first via hoisting; the CLI runner, gap diagnostic, component search,
  and repair dispatch in the first one had been completely unreachable
  dead code

**Data layer**
- `cortex/memory/jaa-db.js`: `update()`/`evict()`/`get()` were doing an
  O(n) linear scan over the entire table on every single call, including
  during boot replay. Converted to an indexed `Map` lookup — O(1)
  regardless of table size. Measured: 500 updates against an 80,000-row
  table went from 495ms to 2ms.

**Diagnostic / escalation**
- `createJob()` in `guardian/server.js` didn't accept a `meta` parameter
  at all — every `gapUuid`/`contractUuid` tag got silently dropped, which
  meant the closure verifier was never actually invoked for these
  dispatches. This affected the reflection-contracts engine too, for the
  same underlying reason.
- Added `lib/diagnostic-contract.js` — `queued → dispatched → diagnosed →
  closed | no_action_taken`, the tracked contract lifecycle for
  diagnose_and_repair
- Made the `require('../lib/diagnostic-contract')` defensive — a missing
  optional module degrades a feature now instead of crash-looping the
  whole service
- Guardian/Cortex gaps now get dispatched ahead of the epistemic gap flood
  (obligation/assumption/etc — symptoms produced by Guardian while it's
  struggling, not the cause) — the system's own topology analysis has said
  "stabilize guardian first" every single time and nothing ever acted on
  it before this
- Fixed the actual spam mechanism: gaps routed through the
  escalation-ladder fallback never had their status updated, so they were
  re-fetched and re-escalated every sweep, forever — proved fixed both
  directions (38→0 after one sweep vs. flat 38 forever pre-fix)

**RAID**
- Fixed `_cluster()`'s "system" keyword collision — "analyze the system"
  was classified as `spec` intent purely because `spec`'s pattern listed
  "system" and is checked before `analysis` in iteration order
- Fixed `_decide()`'s reason string — it said the same generic
  `cluster_chain:X` regardless of which agent won, with no way to tell
  "ollama won because LAW_I" from "ollama was offline so the next agent
  got it by default." Now prefixed with `LAW_I:` when ollama is the
  selected agent.
- Corrected two tests that expected `'guardian-claude'` as a dispatch
  target — traced the real dispatch path end to end and confirmed the
  bare name (`'claude'`) is what Guardian's userscripts actually register
  as; the `guardian-`-prefixed form is correctly a health-snapshot lookup
  key, not a valid thing to dispatch to

**Vector memory**
- `lib/vector-memory.js` hard-required `vectra`, which was never
  installed — semantic search was completely down. Built
  `lib/local-vector-index.js`, a dependency-free replacement (same 6
  methods, brute-force cosine similarity), prefers real `vectra` if it's
  ever actually installed

**lib/meta/telemetry-codec** (confirmed dead code — not on Guardian's load
path, `lib/meta/index.js` only ever loads the separate, already-working
`index.js`) — restored anyway: 6 files had requires missing closing
parens and class declarations accidentally left commented out.
`topology.js` was genuinely missing (not a typo) — recovered the real
reference implementation from the relational-field-reader zip rather than
fabricate one; converted its ESM exports to CJS. Proved the whole module
works end to end with a real simulated incident, not just `node --check`.

**Identity grounding** — co-pilot's system prompt said only "a sovereign
AI orchestration system" with zero actual facts about what NEXUS is. A
small local model asked "what is this" filled the vacuum with a fabricated
claim about US government use. Fixed in both `co-pilot/index.js` and the
more broadly-shared `lib/context-builder.js`.

**This round, while assembling the full package**
- `tests/full.test.js` was 92/97. Investigated all 5: 1 was the `_cluster`
  bug above, the other 4 were the RAID reason-string/agent-naming issues
  above. Now 97/97.
- `tests/kernel.test.js` was completely blocked (FATAL error, 0 tests run)
  — it expected `emerge/emerge-kernel.js` and `emerge/io`, but those files
  actually live at the project root (`emerge/` is a separate, unrelated
  subsystem with its own `package.json`). Fixed both paths. Now 101/102 —
  the one remaining failure is genuine: zero `.eg` fixture files exist
  anywhere in this project as uploaded across this entire conversation.
  Not a path bug, not something I can fabricate — flagging it honestly
  rather than hiding it.

## Full test report — run just now, against this exact package

```
brutal.test.js                         125/125 invariants passing
connection-generation-guard.test.js    PASS
connection-watchdog.test.js            PASS
create-job-meta.test.js                PASS
diagnostic-fixes.test.js               21/21
escalation-spam.test.js                PASS
full.test.js                           97/97
home-ui.test.js                        22/22
infra-gap-priority.test.js             PASS
kernel.test.js                         101/102 (1 missing-fixture gap, see above)
local-vector-index.test.js             PASS
ncp-race.test.js                       PASS
pipeline.test.js                       37/37
seam-resume-dedup.test.js              PASS
userscript-adapter-consistency.test.js PASS
integration.test.js                    not exercised — requires your live
                                        servers actually running; correctly
                                        detected nothing live in this
                                        sandbox and reported 77 skipped
                                        rather than faking a result
```

Every `.js` file in the entire tree (390 files) passes `node --check` —
not just the ones touched this conversation.
