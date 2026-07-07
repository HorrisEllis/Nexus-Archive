# NEXUS — Full Orchestration End State
### Vision spec — draft for review, not a build log
Read alongside: `docs/NEXUS-STATE-SPEC-2026-07-06.md` (what's real today), `MANIFEST.md` (this session's diffs).

---

## 0. The end state, restated

One programmable substrate where:
- Every system (guardian, cortex, copilot, ollama, bridge, idearium, loom, warp, seam...) exposes commands the same way, callable from CLI, UI, or a model.
- Ollama routes free-text intent to the right system/command without a human picking it.
- Copilot is a first-class client of every system, not a bystander with its own shadow logic.
- A continuous listener/poller layer turns every system's raw events into plain text and streams it into a live context Ollama/Copilot always has open.
- One ledger — nothing lost, ever, across every conversation and every system event.
- Recall is real: Cortex push/recall + RAID + CFR + RFR2 actually inform how the model understands *this* user, not just what was said last.
- Guardian and Ollama can call *any* API, run *any* userscript, parse *any* file — as tools, not bespoke integrations per source.
- Workflows, scheduled tasks, and contracts are things you *declare*, not things buried in one system's code.
- One meta-UI sits over all of it: build/edit commands, wire systems together, configure personalities, watch the ledger, control copilot and ollama directly.

This document maps that vision onto what already exists (so nothing gets rebuilt) and what's actually missing (so effort goes where it's needed).

---

## 1. What already exists — the real substrate to build on

Checked against the current tree, not assumed:

| Piece | Where | Status |
|---|---|---|
| Registry-driven CLI, live grammar rebuild on component registration | `cli/nexus-cli.js`, `lib/grammar-engine.js` | Real, working, "no hardcoded commands" by design |
| Command descriptors → registry pattern | `cli/nexus-repl-descriptors.js` | Real, but only `forge` migrated — ~25 nexus-repl commands still not on the registry |
| Sovereign tool-calling core (model-agnostic) | `lib/agent-tools/index.js` | Real, one tool live (`read_file`), designed for many |
| Ollama tool-loop endpoint | `ollama/server.js` (`runToolLoop`) | Real, wired to agent-tools |
| Cortex push/recall Unified API | `cortex/push-recall.js` | Real, 2 of 5 MQL lanes (lexical + recency) |
| CFR truth substrate (coherence/friction/resonance/entropy) + `_byComponent` graph edge | `meta/cfr/` | Real; `componentProximity()` now queryable |
| RAID routing + `topologicalProximity` | `cortex/core/raid/` | Real, opt-in path now exists (was hardcoded `1.0`) |
| RFR2 causal/interaction toolkit | `lib/rfr2-bridge.js`, `meta/rfr2/` | Bridge exists this session; module itself pre-existing |
| Bridge → Cortex mirror | `bridge/ledger.js` | Real as of this session — was the only system writing zero events to Cortex |
| WARP dispatch (cache/cascade primitives) | `warp/dispatch/`, wired into `ollama/server.js` | Real production caller now exists |
| Contract infrastructure (verifiers, handshakes, pollers) | `meta/cfr/contract-verifier.js`, `orchestrator/lib/contract-*.js`, `lib/seam/build-contract.js`, `SYSTEM-CONTRACTS.js` | Real, scattered across systems — no single declarative contract format yet |
| Gap/intelligence detectors (12 liminal + 8 gap-hunter types) | `meta/liminal/`, `meta/gap/` | Real, gap-hunter wired into guardian's live path; liminal not yet consumed anywhere outside orchestrator status checks |

**Conclusion:** almost every primitive this vision needs already exists somewhere. The gap is *connective tissue and coverage*, not missing invention. That changes the shape of the plan — this is mostly wiring, registry population, and one new UI, not 10 new subsystems.

---

## 2. Gap-to-target map

### A. Command & Control Layer
**Target:** any system, any command, same interface, from CLI/UI/model.
- Finish migrating the ~24 remaining `nexus-repl` commands onto the component registry (same pattern `forge` already proved out) — this alone gets CLI parity for free via `nexus-cli.js`'s live grammar.
- Extend `agent-tools`' tool registry with a `run_command(system, command, args)` tool that dispatches through the *same* registry the CLI reads — one execution path, three entry points (CLI, UI, model), never three implementations.
- **Ollama keyword→system router:** a lightweight classifier stage in front of `ollama/server.js`'s dispatch that maps free-text intent to `{system, command}` using the registry's own descriptors as its vocabulary (so the router never drifts out of sync with what commands actually exist — no separate keyword table to maintain).

### B. Universal Interaction Layer
**Target:** call any API, run any userscript, parse any file, as tools.
- `agent-tools` needs three new tool classes alongside `read_file`:
  - `call_api(url, method, headers, body)` — generic HTTP tool, schema-validated, logged to the ledger (below) on every call.
  - `run_userscript(name, args)` — dispatches into guardian's existing userscript surface (`guardian/userscript-claude.js`, `guardian/userscript-chatgpt.js` are real precedent for this pattern) rather than inventing a new execution model.
  - `parse_file(path, hint?)` — router tool that picks the right parser (there's no universal parser today; this should dispatch to format-specific existing code where it exists, e.g., loom's ingest logic, and fall back to plain-text extraction otherwise).
- All three go through agent-tools' existing dependency-injection pattern (`callModel` injected by caller) so guardian, ollama, and copilot share one implementation each, not three.

### C. Continuous Ingestion Pipeline
**Target:** listen/poll everything → plain text → live stream → Ollama context → Copilot update.
- A new thin layer (`lib/ingest-stream.js`, proposed) that:
  1. Subscribes to the bus (`bus.emit` interception already exists per-system — CFR's ledger hook in guardian is the proven pattern to replicate).
  2. Normalizes each event to plain text via a per-system formatter (small, one per system — most already have human-readable log lines to reuse, not invent).
  3. Pushes normalized text onto a single SSE/stream endpoint Ollama's context-loader subscribes to, and Copilot's spotlight logic (already fixed this session in `spotlight.js`) reads from.
- This is the one genuinely new piece of infrastructure in this spec — everything else is registry coverage or tool additions. Scope it as its own phase.

### D. Ledger & Memory
**Target:** nothing lost, ever; real recall grounded in CFR/RAID/RFR2.
- Conversation logging already exists per-system (`_physQueue.logConversation` in guardian, chat-log persistence). The gap is these are *per-system* ledgers, not one unified one.
- Proposed: Cortex becomes the single ledger of record — every system's conversation/event writes go through `cortex/push-recall.js`'s `push()`, the same way `bridge/ledger.js`'s new Cortex mirror does it this session. That pattern is proven; it needs to be replicated for guardian, copilot, ollama, idearium (bridge is the only one done).
- Finish the 3 remaining MQL lanes on push/recall (2 of 5 done: lexical, recency) — semantic and the other two lanes are what let "recall" answer *meaning*-based queries, not just recent/keyword ones.
- Wire CFR sigma/delta + RAID topologicalProximity + RFR2 causal traces into recall's ranking function itself, so "understanding the user" is a query-time signal, not a separate report you have to go read.

### E. Copilot Deep Integration
**Target:** hooked into every system, not a bystander.
- Give copilot the same `run_command` / `call_api` / `run_userscript` / `parse_file` tools as ollama (via agent-tools — same registry, same code, per the sovereign design already in place).
- `copilot/lifeline.js` currently hardcodes its own provider list instead of querying RAID (flagged in the state-spec doc as a real open duplicate) — fixing this is the concrete first step toward copilot sharing infrastructure instead of shadowing it.
- **Personalities:** a config layer (system prompt + tool-permission subset + default model) selectable per-conversation, stored in Cortex so a personality choice is itself remembered, not reset every session.

### F. Guardian Power-Up
**Target:** as powerful/integrated as possible.
- Guardian already has the deepest CFR/RAID wiring in the system (sigma-floor routing, ledger, gap-hunter) — the remaining gap is tool parity: agent-tools' new tools (B, above) should be guardian-callable the same way ollama calls them, and liminal's 12 detectors (currently unconsumed outside status checks) should run in guardian's real completion path alongside gap-hunter, which is already there.

### G. Workflow / Task / Contract Engine
**Target:** declare workflows, schedule tasks, define contracts.
- Contract infrastructure already exists but is scattered (`SYSTEM-CONTRACTS.js`, per-system `interaction-contract.json`, `contract-verifier.js`, `contract-poller.js`, `contract-handshake.js`). Proposed: one declarative contract format (`.contract` files, same spirit as `.spec`) that the existing verifiers/pollers/handshakes read, instead of each system inventing its own shape.
- No scheduler exists today (checked — no hits). This is a real new piece: a small cron-like service that reads workflow definitions (sequences of `run_command` calls, the same primitive from B) and fires them on schedule or on bus events. Small, well-scoped, and it rides entirely on top of B's single dispatch path — it doesn't need to know about any system directly.

### H. Orchestrator Meta UI
**Target:** full control panel — program Nexus, customize, work with copilot/ollama.
- This is the one clearly-missing user-facing piece. Proposed panels, each backed by something above rather than invented fresh:
  1. **Command builder** — browse/create registry entries (reads the same registry `nexus-cli.js` already reads).
  2. **Wiring map** — live view of which systems talk to which (bus subscriptions), so "is X actually connected to Y" stops being a manual grep every session.
  3. **Ledger viewer** — browse the unified Cortex ledger from D.
  4. **Copilot/Ollama control panel** — personality picker, tool-permission toggles per system, live conversation stream from the ingestion pipeline (C).
  5. **Workflow/contract editor** — author the declarative files from G.

---

## 3. Proposed build order

Dependency-driven, not priority-driven — each phase only needs what's above it:

1. **Finish B (universal tools) + registry coverage in A.** Everything else calls through these; building them first means later phases wire into one stable interface instead of guessing at it.
2. **D's unified ledger** (replicate bridge's Cortex-mirror pattern to guardian/copilot/ollama/idearium) + finish push/recall's remaining 3 lanes. This is what makes "nothing lost" literally true, and what E/F need to actually integrate with each other.
3. **C, the ingestion/streaming layer.** Needs A+B to have something worth streaming, and D to have somewhere durable to land.
4. **E + F integration passes** (copilot tool parity, lifeline→RAID fix, liminal into guardian's completion path) — now share the same substrate instead of each building their own.
5. **G, scheduler + declarative contracts.** Rides entirely on A's dispatch primitive.
6. **H, the meta UI.** Deliberately last — it's a viewer/editor over everything above, and building it before the substrate is stable means rebuilding the UI every time an underlying shape changes.

---

## 4. Open questions worth deciding before building

- **Personality scope:** per-conversation only, or can a personality also restrict which tools/systems it's allowed to touch? (Affects E's design now vs. later.)
- **Ledger retention:** "nothing lost" — forever, or with a decay/archive tier like `crystal-lattice`'s existing pattern? Unbounded growth has a real storage cost across every system's events.
- **Scheduler failure semantics:** if a scheduled workflow's first `run_command` fails, does the workflow abort, retry, or continue partially? Needs a decision before G is built, not after.
- **Meta UI access model:** single-user control panel, or does it need its own auth/permission layer given it can reconfigure live systems?

---

*This is a planning document. No code in this spec has been written or verified — the "what already exists" table in §1 is the only part checked directly against the codebase.*
