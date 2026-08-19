# 2026-08-19 — merging files-4/5/6/7 into the freeze-thaw tree, "hey nexus" live

Started from `nexus-2026-08-18-freeze-thaw.zip`, installed all four session bundles
per their own READMEs, built the one piece none of them actually shipped, and wired
the wake word into all four provider tabs (not just the module — HOOKUP.md's steps
2 and 3 hadn't been applied to the real userscript files yet).

## Installed as instructed

| From | File | To |
|---|---|---|
| files-4 | `work-queue.js` | `lib/work-queue.js` |
| files-4 | `copilot-server.patched.js` (superset — includes f5's introspect wiring + the queue) | `copilot/server.js` |
| files-4 | `ollama-server.patched.js` | `ollama/server.js` |
| files-4 | `registry-components.patched.js` | `copilot/registry-components.js` |
| files-5 | `introspect.js`, `agent-capability.js` | `lib/` |
| files-6 | `userscript-nexus-wake.js` | `guardian/` |
| files-7 | `end-state.js` | `lib/` |
| files-7 | `jaa-db.patched.js` | `cortex/memory/jaa-db.js` |
| all | matching `test-*.js` files | `tests/modules/`, and registered in `run-all.js` |

**135 passing** across the five newly-installed suites (18 nexus-wake, 16 introspect,
20 agent-capability, 20 end-state, 16 work-queue, checked individually — I didn't run
the full pre-existing suite, which is large and untouched by this merge).

## What was actually missing — and had to be built, not just copied

**`lib/agent-chat.js` did not exist in any of the four zips.** `test-nexus-wake.js`
requires it (NW-002 checks the browser and backend matchers agree), and the f4 README
talks about it as if it shipped from an earlier session — it didn't arrive here. Built
it: `WAKE_RE`/`parseWake` copied byte-for-byte from the userscript so NW-002 can't
silently diverge, plus `ask(provider, message, opts)` (routes through guardian's real
`POST /api/copilot/prompt` dispatch, adds the hop cap the README mentions but nothing
in the tree implemented — refuses if a provider reappears in its own chain or the
chain hits `maxHops`) and `readChat(provider)` (reads `guardian_chat_log`, which has
no other writer anywhere in the tree — `ask()` is now that writer). No test file for
it existed to copy either, so it's unit-tested only indirectly via NW-002 right now —
worth a real `test-agent-chat.js` next.

**The wake word wasn't wired into the provider tabs.** `userscript-nexus-wake.js`
existed as a standalone module with 18 passing tests, but `HOOKUP.md`'s steps 2 and 3
(arm `install()`, wrap `injectText`) hadn't been applied to
`userscript-chatgpt.js` / `-claude.js` / `-gemini.js` / `-perplexity.js` — the module
was correct and inert. Also, step 1 (`@require`) doesn't actually work here:
`clear-glass/src/providers/host.js` injects the *exact unmodified* single userscript
file via `executeJavaScript`, there's no real `@require` resolution. Fixed at the
loader instead of by editing four already-large files to inline it:
`ProviderHost._inject()` now loads `guardian/userscript-nexus-wake.js` as a shared
prelude, the same way it already loads the GM shim, so `window.NexusWake` exists
before any provider script runs. Then each provider script got the two small edits
HOOKUP.md actually asks for — arm at the `GUARDIAN_REGISTER` boot line, decorate in
`injectText()`. All four `node --check` clean.

Not wired: `NEXUS.resetHint()` on new-conversation detection. None of the four
provider scripts has an existing "new chat" hook to attach it to, and guessing one
felt riskier than leaving it — right now `once` means once per tab session rather
than once per conversation. Functionally harmless (worst case: the model hint doesn't
repeat on a fresh chat in a long-lived tab), just not exactly what HOOKUP.md describes.

## Confirmed still open (flagged in files-4's README, still true after this merge)

- **`GET /api/tab/dom?provider=X` on guardian does not exist.** `readChat()` above
  serves `guardian_chat_log` (logged history) and says `liveDom: false` rather than
  pretending to cover this. A live DOM read is a bigger piece — guardian would need a
  round-trip to the actual NCP-connected tab, not just its own store — and touches
  the NCP job protocol rather than something addressable in this merge.
- **`tools/repair-patterns.js`** is referenced by both READMEs (`bep_patterns` growing
  1019 → 1801 rows) but wasn't in any of the four zips either. Unrelated to the wake
  word; flagging so it doesn't look silently done.
- **The EPERM flush-lock data-loss path and the 4 pre-warmed Electron tabs** (files-4's
  README, "What I'd watch next") — untouched, out of scope for this merge.

## §UPDATE — wired to the full tool loop + chatgpt/gemini as real agents

Follow-up pass, same session. Checked what "co-pilot has all it needs to work on
nexus, and chatgpt/gemini as agents" actually required, rather than assuming the
prior pass covered it:

- **`COPILOT_PROMPT` moved from `/api/prompt` to `/api/prompt/tools`.** The old
  target is real and intent-routed but doesn't run the agentic tool loop — no
  `read_file`, `diagnose`, `nexus-map`, nothing touching real state mid-answer.
  `/api/prompt/tools` is `copilot/tool-runtime.js`'s `run()`, the exact loop
  co-pilot runs everywhere else, with the full 66-tool `lib/agent-tools`
  registry. Same `{ok, text, ...}` response shape, so `askNexus()` needed no
  other change. `guardian/HOOKUP.md` is now shipped in the tree, updated with
  this and the rest of this section.
- **`lib/agent-chat.js`'s `ask()` no longer reimplements dispatch.** v1.0.0
  (previous pass) hit guardian's `/api/copilot/prompt` directly with raw HTTP —
  a second, divergent copy of dispatch logic that already existed three times
  over in `agent-council.js`/`roundtable.js`/`parallel-dispatch.js`, all of
  which call `copilot/lifeline.js`'s `dispatchToNcpAgent`. Fixed: `ask()` now
  takes `opts.dispatch` as an injected function (same DI pattern as
  `lib/seam/queue.js`'s `QueueCompartment`) — a plain HTTP fallback stays in the
  file only for callers with no lifeline available (tests). The real caller
  supplies something better.
- **New tool: `agent_chat`** (`lib/agent-tools/tools/coordination/agent-chat.js`,
  registered in `index.js` + `tool-guide.js`). Addresses ONE agent — as opposed
  to `agent_council`'s fan-out to several — with the hop cap, and its injected
  dispatch is `copilot/tool-runtime.js`'s `runViaAgent`: the SAME full tool loop
  co-pilot itself runs, not the narrower 4-tool escalation set lifeline uses for
  its own fallback cascade. Asking chatgpt or gemini something through this tool
  gives them real tool access to nexus while they answer. `agent_council`,
  `roundtable`, and `parallel_dispatch` already existed and already gave
  dispatched agents this same real access via `runViaAgent` — this tool didn't
  need to build that part, only the one-addressee-plus-hop-cap-plus-logging part
  that was actually missing.
- **`guardian_chat_log` has a real writer now**, confirmed by running `ask()`
  against a stub dispatch and checking the table file appeared on disk with a
  real row — removed before packaging so the shipped `data/` isn't polluted
  with a test artifact. `agent_chat_search`'s "agents" scope, which reads this
  table, was returning nothing before because nothing had ever written to it.

Re-ran all five bundled suites after these changes — still 90/90 passing — and
confirmed `lib/agent-tools/index.js` loads clean with 66 tools registered,
`agent_chat` and `agent_council` both present.

## What "hey nexus" does right now, end to end

Type `hey nexus, <anything>` and hit Enter in the chatgpt/claude/gemini/perplexity tab:
capture-phase listener fires before the host app's own handler, the turn is cleared
from the composer and never reaches the host model,
`POST 127.0.0.1:3750/api/prompt/tools` goes to the real co-pilot's full agentic tool
loop (not a provider round-trip — NW-005 pins the co-pilot target; the tool-loop
endpoint is new this pass), and the answer — backed by real tool calls, not a bare
completion — renders in the bottom-right panel. A miss (co-pilot down, empty 200) is
stated in the panel rather than left as silence. Ask it to loop in another agent
("hey nexus, ask gemini whether...") and it has `agent_chat` available to do that for
real, with the hop cap stopping a relayed chain from looping back on itself.
