# Copilot-as-NEXUS — Feature Roadmap (2026-07-10)
### From the user's asks, mapped to real state, ordered by leverage

## Your orchestrator question — my honest answer
You asked if the orchestrator needs breaking into components. **I don't
think so, and here's the real data:** orchestrator.js is 2749 lines but
18 concerns are ALREADY extracted into orchestrator/lib/ (contract-poller,
sigma-writer, spec-drift, auth, ui-registry, autonomous-loop, etc.). What
remains is the HTTP router + boot sequence that WIRES those modules — which
is the correct shape for a coordinator, not a god-object. The run_closed_loop
orchestrator is ~120 lines and already delegates every stage to real
endpoints. Decomposing either would add indirection without removing
duplication. Leverage is elsewhere (below).

## ✅ Done this turn (highest-leverage, already existed as dead code)
- **expectation-watcher WIRED** — "diagnose automatically when an event
  doesn't fire from gated buttons/interaction points" was FULLY BUILT and
  never started. Now live: watches trigger→expected-follow-up pairs, emits
  copilot.error.detected when the follow-up never arrives. 3/3 tests. This
  is a big chunk of your UI-diagnosis ask, already real.
- **run_cockpit_command wired** to live ForgeCLI (was inert).
- **8 copilot tools + confidence grounding fix + closed loop** (prior turns).

## 🔲 Remaining asks, mapped to real state + leverage order

### 1. Every on-screen interaction becomes an event (HIGH leverage, medium build)
Your ask: "each click, button, dropdown, checkbox, input, toast = an event
so copilot can look for it." The expectation-watcher (now live) is the
CONSUMER side — it's ready. The PRODUCER side is missing: the tv-shell UI
must emit an event per interaction. Real plan:
- Add a delegated event listener in ui/tv-shell that emits
  `ui.interaction` events (click/change/input) with {element, action,
  expectedEffect} into the bus (POST to cortex /api/event, now that the
  SSE path is live).
- Gated buttons declare their expected follow-up; expectation-watcher
  (already running) auto-detects when a click fires no effect.
- This CLOSES the loop: UI → event → watcher → copilot.error.detected →
  copilot diagnoses. Half is already done (the watcher).

### 2. Copilot sees/understands the on-screen UI via Nerve + Spotlight (HIGH, medium)
Your ask: copilot sees current UI, helps navigate, using nerve + spotlight.
Real state: Nerve (lib/nerve) gives attention snapshots; Spotlight (window.CP)
can highlight; the tutorial engine already drives both. Missing: a
`get_ui_state` tool that reads the current Nerve snapshot + DOM structure so
copilot can reason about what's on screen. Builds on real primitives.

### 3. Recall across all past conversations (HIGH, real infra exists)
Your ask: remember every conversation, log patterns, store context; the
associative lattice for non-linear recall. Real state:
- cortex/push-recall.js is REAL (2 of 5 MQL lanes: lexical + recency).
- meta/spatial/system-lattice.js (associative lattice) is REAL and fed at
  cortex boot (wired this session).
- chat_log table already persists every exchange (306 rows seen in boot log).
- GAP: copilot doesn't QUERY recall before answering. A `recall` step in
  the prompt flow + a recall agent-tool would give it memory. The
  associative lattice is the non-linear layer — query it by association,
  not just recency. This is mostly WIRING real pieces, not building new.

### 4. Copilot has every tool for each system (MEDIUM, incremental)
8 tools today cover the cross-cutting surfaces. Per-system deep tools
(guardian SEAM control, idearium spec ops, architect blueprint queries)
can be added incrementally as run_command subcommands rather than 30 new
tools — the cockpit contract already routes many.

## Leverage ranking (to get NEXUS actually working)
1. **UI interaction events (#1)** — completes the auto-diagnosis loop whose
   consumer half is already live. Highest ratio of impact to build.
2. **Recall wiring (#3)** — real infra, mostly unwired; gives copilot memory.
3. **get_ui_state tool (#2)** — copilot situational awareness on screen.
4. Per-system tools (#4) — incremental, lower urgency.

Each is grounded in real, verified primitives — no new subsystems needed,
mostly wiring what exists. That's the pattern that's held all session.
