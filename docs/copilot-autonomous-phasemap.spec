spec:
  meta:
    name:        copilot-autonomous
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-08. The programmable, autonomous co-pilot (P6 full).
    uuid:        nexus-copilot-autonomous-v0-0000-2026-0808-001
    author:      James Brooks
    intent: >
      Co-pilot becomes programmable + autonomous: schedule tasks/jobs/alarms, route
      commands, deliver payloads to agents at a time, triggers + conditions,
      stepwise chains + pipeline automation, http/api/sse connections for
      automation, change system settings, connect to remote services, full
      clear-glass access incl. DOM storage, self-building commands ("hey nexus,
      make me a command for <component> to <ability>") stored in the cortex tool
      management system, and running things CONSTANTLY — what-ifs forming
      connections with intelligence, cortex data, components, polling, diagnosing.
      Full tool/command access in co-pilot's model. Everything RAID-governed.

  MAJOR_8.6_FINDING:
    - "lib/autonomous-loop.run() — the autonomous spine EXISTS (crystal-gated executor loop)."
    - "copilot/lib/self-model governAction() + switchAgent() — the P6 RAID gate + agent routing, BUILT this session."
    - "lib/tool-index — the cortex tool management system for self-built commands, BUILT this session."
    - "lib/agent-pull — co-pilot/agents pull tools on demand, BUILT this session."
    - "pipeline substrate: lib/execution-pipeline, lib/build-pipeline, cockpit/pipeline, emerge/compiler/pipeline — EXIST."
    - "clear-glass — full browser/DOM automation surface EXISTS (guardian/clear-glass-bridge)."
    - "GAP: NO scheduler/cron/alarm — nothing schedules a task/payload for a time. THE missing atom."
    So P6 is ~65% composing existing autonomy substrate + the session's governAction/tool-index/agent-pull; the real new builds are the scheduler, the trigger/condition engine, and self-building commands.

  governing_axioms:
    - "§3.3 map first. §8.6 compose the autonomous-loop + governAction + tool-index + pipelines."
    - "§RAID governs EVERY autonomous action + setting change + remote connection (non-negotiable — this is co-pilot acting on the live system)."
    - "§1.2 nothing silently fails. §user_wellbeing — autonomy halts on ambiguity, never runs unbounded."

  phases:
    CA1_scheduler:   # ← DONE 2026-08-08. lib/scheduler.js — timed/interval tasks, RAID-gated, cortex-persisted. 7 tests.
      priority: FOUNDATION — the missing atom. Everything time-based needs it.
      does: "lib/scheduler.js — schedule a task/job/alarm/payload for a time or interval; deliver to an agent/system/command at that time. Persisted in cortex (survives reboot). Every fire is RAID-gated + logged to the fan-in."
      gate: "co-pilot schedules 'deliver payload X to agent Y at time T'; it fires once at T, governed + logged; survives a reboot."
    CA2_triggers_conditions:
      depends_on: CA1
      does: "a trigger/condition engine — fire an action WHEN a condition holds (a sigma, a metric, an event on the fan-in). Composes the fan-in + relational-field. 'when X, do Y'."
      gate: "a condition on the live stream fires its action once when met; RAID-gated."
      status: >
        DONE 2026-08-08. lib/triggers.js — subscribes to lib/ledger-fanin
        with a filter built from condition.type ('event': exact or prefix
        match on row.type, e.g. 'sigma.' catches every sigma.event.* cortex/
        orion already emits — no separate relational-field integration
        needed, RFR2/CFR output already reaches the fan-in as sigma.*
        events; 'metric': a predicate over the row). once (default) or armed
        (maxFires). RAID-gated + logged, same shape as CA1. 10 tests — one
        caught a real concurrency bug: lib/ledger-fanin.emit() calls
        subscribers SYNCHRONOUSLY in a loop, so a burst of same-tick events
        could all pass the fire-count guard before the first fire's async
        delivery had incremented it. Fixed by reserving the fire slot
        synchronously before any await.
    CA3_pipeline_chains:
      depends_on: [CA1, CA2]
      does: "stepwise chains + pipeline automation — a sequence of steps (each a command/agent/http/sse call), with routing between steps. Composes lib/execution-pipeline + agent-router."
      gate: "a multi-step pipeline runs end to end, routing payloads step→step, halting on failure."
      status: >
        DONE 2026-08-08. lib/chains.js. §CORRECTION: "Composes
        lib/execution-pipeline" was checked against the actual file, not
        assumed — execution-pipeline.js is a CODE pipeline (spec→build→
        fork→verify→compare-to-golden→promote, cos/playground/*), unrelated
        to running agent/command/http steps. Built lib/chains.js fresh
        instead; execution-pipeline is untouched. Steps: agent (via
        agent-pull, same call CA1/CA2 use), command, system, http (minimal
        built-in, explicitly superseded by CA4's connections.js once a chain
        needs scoping), fn. Each step RAID-gated individually; a denied or
        throwing step HALTS the chain (does not skip-and-continue, unlike
        CA1/CA2's single-action isolation — a later step may depend on an
        earlier one's real output). 8 tests, including a real local-server
        HTTP round trip and a real connection-refused halt.
    CA4_connections:
      depends_on: CA1
      does: "http/api/sse/remote connection tools for automation — co-pilot opens + uses connections (incl. remote services) as automation steps. Scoped + RAID-gated."
      gate: "co-pilot makes an http/sse call as a pipeline step; a remote connection is governed + logged."
      status: >
        DONE 2026-08-08. lib/connections.js — call() (one-shot http/https)
        + openSSE() (persistent stream, real EventSource-style parsing).
        Default-deny domain allowlist via registerScope(scopeId,
        {allowedDomains, allowedMethods?}) — nothing in the repo had this
        mechanism for this call class (checked: lib/contract-queue.js's
        "allowlist" hit is an unrelated field name). RAID-gated on top of
        the scope check. 8 tests, including a real SSE stream against a
        local test server (data delivered, close() verified to stop
        delivery) and closeAll() for leak safety.
    CA5_system_control_and_clearglass:
      depends_on: [CA1, CA4]
      does: "co-pilot changes system settings (the SS2 per-system configs) + full clear-glass access incl. DOM storage. RAID-gated; every change logged + revertible (integrity-revert)."
      gate: "co-pilot changes a setting (governed, logged, revertible) + drives clear-glass incl. DOM storage."
      status: >
        DONE 2026-08-08. lib/system-control.js, two halves.
        SETTINGS: getSetting/setSetting/revertSetting/listSettings against
        cortex's live 'settings' table (14 rows already on boot — a real
        table, not invented). §CORRECTION: "revertible (integrity-revert)"
        was checked against lib/integrity-revert.js's actual body before
        wiring to it — that module operates at FILE-hash-and-snapshot grain
        (file-integrity→sigma→replay-engine), gated behind a
        functionality-broken probe; a single settings row has neither a
        file hash nor a test-suite signal, so using it here would revert
        the wrong thing at the wrong grain. Built a right-grained
        append-line log instead: each write keeps its own prior value +
        hadPrior flag, revertSetting() restores it. integrity-revert.js is
        untouched, still correct for the file-level case it covers.
        CLEAR-GLASS: governedBrowserCommand() wraps the ALREADY-REAL
        guardian/clear-glass-bridge.dispatchBrowserCommand — DOM storage
        access (storage.get/storage.set via driver.exec) already existed
        and worked in clear-glass/src/driver/index.js; the actual gap was a
        RAID-gated, fan-in-logged entry point for co-pilot's autonomous
        use, not DOM access itself. 10 tests — one caught a real bug in the
        settings-revert logic (prior===null was indistinguishable from
        prior===undefined, so a first-ever setting could be "reverted" to a
        fake null instead of correctly refusing) before it shipped.
    CA6_self_building_commands:
      depends_on: [CA1, CA3]
      does: "'hey nexus, make me a command for <component> to <ability>' — co-pilot BUILDS a command (dynamic, from the grammar + capability registry), stores it in the cortex tool management system (tool-index), hooks it into loom. Self-extension."
      gate: "a natural-language 'make me a command' produces a real, stored, loom-registered command co-pilot can then run."
    CA7_constant_autonomy:
      depends_on: [CA1, CA2, CA6]
      does: "co-pilot runs CONSTANTLY — what-ifs forming connections with intelligence/cortex/components, polling, diagnosing — on lib/autonomous-loop, governed. The agent-intelligence-loop AP4/AP5 + this = the always-on mind."
      gate: "co-pilot autonomously polls + proposes connections/fixes on a loop, every action RAID-gated, halting on ambiguity."

  clutter_note: >
    James flagged cockpit/cli/orchestrator + duplicate docs. Confirmed duplicates:
    docs/NEXUS-PIPELINE-SPEC-2026-07-07 (1).md / (2).md / (1).md, guardian-server(1).js.
    These are safe archive candidates (§0.3). cockpit (4 js) + cli (12 js) need a
    per-file audit before touching — some are live entrypoints. Clutter cleanup is
    a SEPARATE low-risk pass, not mixed into the autonomy build.

  first_build: "CA1 — the scheduler (the missing atom). Then triggers, pipelines, connections, control, self-building, constant autonomy."

---
## CA2-CA5 COMPLETE 2026-08-08 — the reactive+chained+connected+governed half of autonomy
CA1 (proactive, "at time T") now has its full complement: CA2 reacts to the
live stream, CA3 chains steps together, CA4 reaches outward (scoped), CA5
changes NEXUS itself (settings + clear-glass) with a real undo path. 43 tests
across the five modules (7+10+8+8+10), all passing. Three one-line spec
assumptions were checked against the actual code before being built on and
corrected where wrong (execution-pipeline for CA3, integrity-revert for CA5,
plus CA2's relational-field turning out to already be reachable via the
fan-in's existing sigma.* events) — same discipline kernel-surface.js's own
header insists on. All five modules registered in
loom/maps/observability-map.js. REMAINING: CA6 self-building commands, CA7
constant autonomy — neither started.
