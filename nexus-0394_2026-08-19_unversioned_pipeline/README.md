# NEXUS — 2026-08-19 — idearium agent pipeline

Two things in this drop: the **map + spec** for the pipeline you described, and
the **two modules missing from the merged tree** that its first phase depends on.

## 1 — The pipeline (spec only, Specified)

`docs/MAP-2026-08-19-idearium-agent-pipeline.md` — the §3.3 map
`docs/idearium-agent-pipeline.spec` — P0…P5, invariants, 12 tests, rejections

**Every component you described already exists.** The map names the file for
each: spec compiler, chunker, repo compartment, ChatGPT dispatch, wake word,
autonomy router, propose-idea, 24+ agent tools. This is a wiring job across six
systems, not a build — so the spec builds none of them (§1.1, §16.5, §10.3).

`idearium/repo/index.js:6-8` already carries your own 2026-07-11 sentence —
"the repo is an archive using the spec… like a compartment with the spec as the
metadata" — and the redesign that followed it. It needs calling, not building.

**Five gaps, in the order they must be closed:**

1. **The improvement loop has no gate.** An agent with `safe-apply`,
   `delete-file`, `run-command` and `nexus-heal` told to "improve anything it
   finds" is unsupervised self-modification. §7.2, §7.3, §17.10 all refuse it.
   The shape is not *whether* it improves things but *where its improvements
   land*: it proposes without limit, a gate decides. Build the gate first —
   otherwise the first thing the orchestrator orchestrates is ungoverned
   self-modification.
2. **No budgets.** §15.1 requires an iteration budget that is loud when
   exhausted. Chunks and wake calls are unbounded across the arc.
3. **Nothing sequences the arc.** Every hop exists; you are the orchestrator
   between them, which by §17.8 means it belongs in the system.
4. **ChatGPT is the fallback, not the default** —
   `agent-suite/index.js:193` defaults `preferAgent = 'ollama'`, ChatGPT at :209.
   One default away, but it reroutes every build through the tab you're using.
5. **`resetHint()` unwired** — flagged in your own MERGE-NOTES.

## 2 — The two modules the merged tree is missing (code, Verified)

`lib/hat-forge.js` in the merged tree has `seedKey` — the identity patch landed.
These two did not (the merge started from `freeze-thaw`, which predates them):

- `lib/intake.js` + `tests/modules/test-intake.js` — **18 tests.** P0 of the
  pipeline spec depends on this: it is the gate. `stage → recordVerdict(by:
  <real gate>) → promote(by:'user') → rollback`. `chatgpt`, `claude`, `copilot`
  and `agent` all bounce off both `recordVerdict` and `promote`.
- `lib/pressure-window.js` + `tests/modules/test-pressure-window.js` — **16
  tests.** Plus `cli/pressure.js` and `ui/pressure/index.html`.
- `guardian/server.js` (the `/api/intake` routes) and
  `clear-glass/src/providers/download-capture.js` are included so intake is
  reachable end to end. **`guardian/server.js` here is patched over the
  2026-08-18 tree** — diff it against your merged copy before overwriting, since
  the merge may have touched it too (§8.4).

## 3 — Three questions that block the work

- **Q1.** Flip `preferAgent` to ChatGPT globally, or per-job with ollama as the
  cheap default? A global flip competes with you for the tab.
- **Q2.** When the agent proposes an improvement to NEXUS itself — Idea Ledger
  entry only, or a staged intake drop with a real diff? The second is far more
  useful and far more dangerous.
- **Q3.** Budget per build — chunks, wake calls, dispatches — and at exhaustion:
  stop, or ask you?
