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
    CA3_pipeline_chains:
      depends_on: [CA1, CA2]
      does: "stepwise chains + pipeline automation — a sequence of steps (each a command/agent/http/sse call), with routing between steps. Composes lib/execution-pipeline + agent-router."
      gate: "a multi-step pipeline runs end to end, routing payloads step→step, halting on failure."
    CA4_connections:
      depends_on: CA1
      does: "http/api/sse/remote connection tools for automation — co-pilot opens + uses connections (incl. remote services) as automation steps. Scoped + RAID-gated."
      gate: "co-pilot makes an http/sse call as a pipeline step; a remote connection is governed + logged."
    CA5_system_control_and_clearglass:
      depends_on: [CA1, CA4]
      does: "co-pilot changes system settings (the SS2 per-system configs) + full clear-glass access incl. DOM storage. RAID-gated; every change logged + revertible (integrity-revert)."
      gate: "co-pilot changes a setting (governed, logged, revertible) + drives clear-glass incl. DOM storage."
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
