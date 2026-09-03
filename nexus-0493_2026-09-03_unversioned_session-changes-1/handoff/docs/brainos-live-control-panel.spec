spec:

  # ════════════════════════════════════════════════════════════════
  # BRAINOS — Live Control Panel Specification
  # ════════════════════════════════════════════════════════════════
  #
  # §3.1 BOTTOM_UP_ONLY — this depends on docs/command-index-per-system.spec's
  # phases 1-5. "Shows all routes and connections" cannot be true until
  # those command-index files exist. This spec is written now (mapping
  # requirements to real, already-confirmed data sources) so the build
  # order is explicit, not because the panel can be built before its
  # dependencies.
  # ════════════════════════════════════════════════════════════════

  meta:
    name:         brainos-live-control-panel
    version:      0.1.0
    uuid:         nexus-brainos-panel-v1-0000-2026-0903-001
    author:       james-brooks
    status:       specced
    description: >
      BrainOS rebuilt as the live visual + control layer for copilot,
      guardian, ollama, bridge, userscripts, RAID, and clear-glass.
      Every visual state change traces to a real system event. No
      decorative or idle animation. The canvas is a real-time reflection
      of the system, not an illustration of it.

  # ────────────────────────────────────────────────────────────────
  axioms:
  # ────────────────────────────────────────────────────────────────
    §NO_DECORATIVE_MOTION: >
      "Nothing moves or changes unless the system does" — every pixel
      delta on the canvas must be caused by a real event arriving over
      a real connection (SSE, polling a real endpoint) — never a
      setInterval-driven idle animation, particle drift, or easing loop
      that runs with no new data behind it. If no events arrive, the
      canvas is static. Verified per-mechanism below, not asserted once.
      Evidence: canvas_mechanics.motion_sources — every listed motion
      source names the real event type that causes it; nothing is
      listed as "ambient" or "idle."

    §NO_CAP_ON_VISIBILITY: >
      All real routes and connections are shown — not a curated subset,
      not the top N by some ranking. If the command-index for a system
      has 73 entries, 73 render, even if most are visually small/dim.
      Evidence: route_graph.completeness below.

    §3.1_BOTTOM_UP_ONLY: >
      Evidence: dependencies section names exactly which prior phases
      (docs/command-index-per-system.spec, phases 1-5) must be DONE
      before route_graph can show real data instead of a "not yet
      indexed" placeholder per system.

    §8.2_HOSTILE_REVIEW_BEFORE_SPEC: >
      Evidence: every data source named below was confirmed to exist
      and carry real payload shapes by reading the actual source this
      session (guardian/event-taxonomy.js, cortex/core/raid/*, clear-
      glass's command-index, ui/eravos/runtime/canvas-intelligence.js,
      ui/eravos/runtime/alk-gl.js) — none invented for this spec.

  # ────────────────────────────────────────────────────────────────
  dependencies:
  # ────────────────────────────────────────────────────────────────
    - spec: "docs/command-index-per-system.spec"
      required_for: "route_graph — cannot show real routes for guardian/ollama/bridge/idearium until their phases (1-4) are built. clear-glass (phase 5, already DONE) can render today."
      status: "phases 1-4 SPECCED, not built. phase 5 DONE."

  # ────────────────────────────────────────────────────────────────
  data_sources:
  # ────────────────────────────────────────────────────────────────
    # One row per named requirement. Each maps to a REAL, confirmed
    # source — not a proposed new one, except where marked NEW.

    - requirement: "agents (claude/chatgpt/gemini/perplexity) activity"
      source: "guardian/event-taxonomy.js's real event vocabulary"
      real_events: ["provider.connected","provider.disconnected","provider.heartbeat.stale","provider.token.stream","job.dispatched","job.ack"]
      transport: "GET /events (SSE), guardian/server.js:2839, already live"
      payload_shapes: "declared per-event in event-taxonomy.js — provider, tabId, jobId, token, seq, ts. Real fields, not summarized."

    - requirement: "userscripts"
      source: "guardian/userscript-{claude,chatgpt,gemini,perplexity,memory,nexus-wake}.js — 6 real files, each named in guardian.spec's handshake block"
      real_events: "same provider.* events above — a userscript IS the NCP connection those events describe. No separate userscript-specific channel exists; a userscript's liveness on the panel is provider.connected/disconnected for its provider."
      transport: "same /events SSE"

    - requirement: "RAID"
      source: "cortex/core/raid/ — router.js, envelope.js, officiator.js, worker.js, snr-filter.js, contract-intake.js, event-taxonomy.js (its own, separate from guardian's)"
      real_events: "cortex/core/raid/event-taxonomy.js's own vocabulary — NOT read in this pass, flagged: must be opened before route_graph/activity panels claim to show RAID events, not assumed to match guardian's shape."
      transport: "unconfirmed this pass — RAID's own HTTP surface (if any) not checked. NEW WORK: confirm before building RAID's panel."
      status: "PARTIAL — module list confirmed real, event/transport shape not yet confirmed"

    - requirement: "clear-glass — full control and macros"
      source: "clear-glass/src/ipc/bridge.js's real /cli/* surface, already live: /cli/commands (the command index itself), /cli/macros/:name (get), /cli/macros/:name/run (execute)"
      real_events: "clear-glass's own event stream — not confirmed this pass whether it emits SSE the panel can subscribe to, or is request/response only. NEW WORK: confirm."
      transport: "GET /cli/commands (already returns the live index — this system's route_graph data is available TODAY, phase 5 already DONE)"
      macro_control: "lib/agent-tools/tools/clear-glass/macro.js — already the real execution path copilot uses; the panel's macro control surface should call the SAME tool, not a second implementation"

    - requirement: "co-pilot"
      source: "copilot/server.js, copilot/adaptive-fulfillment.js (real automation path, confirmed prior session), copilot/intuition.js (confirmed live faculty, prior session)"
      real_events: "not confirmed this pass whether copilot emits its own SSE/bus events distinct from guardian's — copilot dispatches THROUGH guardian's job system per prior findings (run-closed-loop.js talks to idearium :4800 directly; adaptive-fulfillment talks through RAID-routable agents) — likely surfaces AS guardian job.* events, not a separate stream. NEW WORK: confirm before assuming a dedicated copilot channel exists."

    - requirement: "ollama"
      source: "ollama/routes/{system,uploads,stream,jobs,queue,models}.js"
      real_events: "not confirmed this pass — ollama/server.js's own event emission (if any) not read. NEW WORK."
      transport: "each routes/*.js file presumably serves its own GET/POST surface — becomes visible via command-index-per-system.spec phase 2, not before"

    - requirement: "bridge"
      source: "bridge/server.js, bridge/ledger.js, bridge/router.js"
      real_events: "not confirmed this pass. NEW WORK."
      transport: "becomes visible via command-index-per-system.spec phase 4, not before"

    # §ADDED 2026-09-03 — James: "agent mesh including pipeline workflow
    # automation, scheduled tasks, macros, tools and command index,
    # management tool forge, hat forge, frameworks, contracts... all
    # programmable, customizable, editable, dynamic, fallback routing,
    # persistent jaa... exportable and importable single measurement of
    # unit... compartmentalized automation, all the cos types, recursive
    # ... agent specific management and orchestration ... using hats for
    # models." Each entry below confirmed against its real source this
    # pass — none invented from the requirement name alone, per
    # §8.2_HOSTILE_REVIEW_BEFORE_SPEC.

    - requirement: "execution pipeline (build/verify/promote/hot-integrate) as a live BrainOS surface"
      source: "lib/execution-pipeline.js — the real 5-stage chain (build -> sandbox-verify -> compare-to-golden -> governed-promote -> hot-integrate), already dual-emitting pipeline.* to both SSE and nexus-bus"
      real_events: "pipeline.started, pipeline.build-complete, pipeline.compared, pipeline.rolled-back, pipeline.complete, pipeline.failed, pipeline.hot-integrated, pipeline.hot-integrate-failed — confirmed live, copilot/lib/expectation-watcher.js already has real triggers for the first two"
      transport: "same dual-emit pattern as build-pipeline.js — SSE + nexus-bus, confirmed in execution-pipeline.js's own header comment"
      panel_role: "the panel's pipeline view subscribes to these events directly — it is not a second pipeline UI, it renders the same events expectation-watcher already consumes"

    - requirement: "scheduled tasks"
      source: "lib/scheduler.js — schedule tasks/jobs/alarms/timed payloads (agnostic; §CA1)"
      real_events: "NOT read this pass whether scheduler.js emits its own bus/SSE events on fire, or is purely a timer registry queried on demand. NEW WORK: confirm before building a live schedule view."
      status: "module confirmed real; event/transport shape unconfirmed"

    - requirement: "macros (as their own BrainOS surface, not only inside the clear-glass panel)"
      source: "lib/agent-tools/tools/clear-glass/macro.js — same real macro record already named under the clear-glass requirement above (create/list/get/delete/run/bookmark/openBookmark)"
      panel_role: "one real macro store, two panel surfaces (clear-glass-scoped view + a general macro management view) — never a second macro implementation"
      real_events: "no dedicated macro.* event stream confirmed — macro state changes are visible via jaaDB row inserts (macros table), not a bus event. NEW WORK: confirm whether a macro.run/macro.created event should be added at the source, or whether the panel polls."

    - requirement: "tools and command index (management surface, not just clear-glass's)"
      source: "lib/tool-index.js — the living tool index in cortex (agnostic; §AP1); lib/tool-config.js — per-tool configuration, as data"
      status: "modules confirmed real; not yet confirmed whether tool-index.js emits change events or is read fresh per panel load"

    - requirement: "tool forge (agents making their own tools)"
      source: "lib/tool-forge.js — a real SCHEMA for agent tools, so copilot can make its own"
      status: "confirmed real; event/transport shape unconfirmed. NEW WORK."

    - requirement: "hat forge (agent identities/models)"
      source: "lib/hat-forge.js — HAT_SCHEMA, forge()/get()/list()/revoke()/rename(), exportHat()/importHat() (single-file export/import, already real)"
      status: "confirmed real, including the export/import path. Event/transport shape (does forge() emit anything live) unconfirmed. NEW WORK."

    - requirement: "frameworks"
      source: "cos/blueprint/index.js, cos/archetype/index.js — real, separate modules"
      status: "confirmed real as modules; not yet confirmed as a coherent single 'frameworks' panel concept — blueprint and archetype are two distinct real things today, not one named surface. NEW WORK before panel design: decide if they render as one section or two."

    - requirement: "contracts"
      source: "docs/contracts/synthesis-contract.spec (the one envelope any building agent gets) + cortex/core/raid/contract-intake.js's real submitContract()/synthesizeContract()"
      status: "confirmed real and tested (lib/schemas/contract.js, NS-010). §HONEST — synthesis-contract.spec itself flags two fields (conditions, chunk_id) as named-but-not-yet-coded in contract-intake.js's row — the panel should not render fields the backing contract doesn't actually carry yet."

    - requirement: "compartments exportable/importable as a single unit"
      source: "TWO real, DIFFERENT mechanisms found, not one: (1) lib/hat-forge.js's exportHat()/importHat() — a real, working single-file round trip, confirmed. (2) cos/vault/index.js — real, but its export/import shape was NOT read this pass and is not confirmed to match hat's single-file convention."
      status: "GAP — 'single measurement of unit' across both hats AND compartments is not confirmed to be one shared format today. NEW WORK: read cos/vault/index.js's real shape before assuming it round-trips the same way exportHat()/importHat() does; either unify or document as two intentionally-separate export formats."

    - requirement: "compartmentalized automation, all the cos types, recursive"
      source: "cos/foundation/enums.js — every COS-48 type enum (GovernorPolicy, IsolationLevel, CpuPriority, IoThrottle, FsPolicy, etc.) is real and frozen, confirmed."
      status: "GAP — 'recursive' (a compartment containing/spawning compartments) was searched for directly in cos/kernel.js and cos/manager.js this pass and NOT found. Either it doesn't exist yet, or it lives somewhere not checked this pass (cos/compartment/process-runner.js, cos/playground/*). NEW WORK: confirm before the panel implies nested-compartment visualization is possible today."

    - requirement: "agent-specific management/orchestration/pipeline/workflow automation, using hats for models"
      source: "lib/hat-forge.js (hat = base agent + optional scope) + cortex/core/raid/index.js's _agentAvailable() (real per-agent health/routing state, already schema'd — lib/schemas/agent.js)"
      status: "GAP — hats and RAID's routing unit are NOT confirmed to be the same thing today. RAID routes by dispatchName; hats are a separate identity/scope construct (lib/hat-forge.js). 'using hats for models' as the routing primitive is a real, not-yet-built wire between these two real, currently-separate systems — not something to assume already connected."

    - requirement: "all routes and connections / no cap"
      source: "the five command-index.json files from docs/command-index-per-system.spec, once phases 1-5 are built"
      status: "only clear-glass's (phase 5) exists today. The other four render as 'not yet indexed' until their phases complete — the panel does not fabricate placeholder routes to fill the gap."

    - requirement: "agents building code — BrainOS should help"
      source: "lib/agent-tools/tools/execution/run-closed-loop.js — the ALREADY-REGISTERED, ALREADY-LIVE tool (confirmed prior session: registered in lib/agent-tools/index.js, the only automation candidate actually in the tool index). Chains spec create -> populate -> repo -> verify-handoff, calling real idearium endpoints including POST /api/repos (the same endpoint ui/import-project/ already uses)."
      panel_role: >
        BrainOS surfaces run_closed_loop's real progress (which stage
        it's on, real stage-transition events if any exist — NOT
        confirmed this pass whether run-closed-loop.js emits its own
        progress events or is purely request/response per stage; NEW
        WORK to confirm before building a live progress view) and
        offers the Import Project screen (already built) as the entry
        point feeding it a projectSeed.

  # ────────────────────────────────────────────────────────────────
  canvas_mechanics:
  # ────────────────────────────────────────────────────────────────
    engine: "ui/eravos/runtime/alk-gl.js — WebGL2 particle field, confirmed real (ping-pong RGBA32F textures, 29 MediaPipe blendshapes -> GLSL uniforms). Reused, not rebuilt — prior turn's finding stands: BrainOS replaces ERAVOS's ROLE in cockpit, but the rendering primitive itself (alk-gl.js) is the correct engine to point BrainOS's canvas at, not a reason to write a second WebGL engine."

    field_mapping: >
      Reused from ui/eravos/runtime/canvas-intelligence.js's already-
      written, already-correct mapping (confirmed real prior session):
        field.entropy   <- cfr.entropy
        field.structure <- cfr.coherence
        field.curl      <- cfr.friction
        field.damping   <- 1 - cfr.resonance
      Source: GET /cfr/stream (intelligence/cfr/ledger.js, confirmed
      live SSE prior session) — this is "cfr brain."

    face_mapping: >
      alk-gl.js's own blendshape deformer (29 MediaPipe channels) is
      "face" — reused per canvas-intelligence.js's existing BLENDSHAPE
      MAPPING section (jawOpen<-generation pulse, blinkL/R<-thought
      boundary, browIU<-concern/open-gaps, squintL/R<-deep analysis).
      Confirmed real, not proposed new for this spec.

    motion_sources:
      # Every entry names the real event that causes it. No entry may
      # be "idle" or "ambient" per §NO_DECORATIVE_MOTION.
      - visual: "particle attractor mass per system"
        caused_by: "provider.connected / provider.disconnected (guardian SSE) — mass changes ONLY on real connect/disconnect, confirmed event shape above"
      - visual: "field curl/turbulence"
        caused_by: "cfr.friction via /cfr/stream — real ledger entries only"
      - visual: "face jawOpen"
        caused_by: "token generation pulse — provider.token.stream events, real tokens/sec, not a smoothed fake rate"
      - visual: "route graph edge glow"
        caused_by: "a real dispatched request on that route — NEW WORK: requires each system's command-index mechanism to also emit a per-call event, not just a static list. Not specced by command-index-per-system.spec today — that spec produces a static index, not a live call-trace. FLAGGED GAP."

  # ────────────────────────────────────────────────────────────────
  style:
  # ────────────────────────────────────────────────────────────────
    theme: "ui/themes/nexus-dark.css — real tokens only (--void/--plate/--ac/--sys-gd/--sys-cx/--sys-br/--sys-orch etc.), same convention already used in ui/import-project/import-project.css. No new color system."

  # ────────────────────────────────────────────────────────────────
  open_gaps_this_spec_surfaced:
  # ────────────────────────────────────────────────────────────────
    # §1.1 — named explicitly rather than silently assumed solved.
    - "RAID's real event/transport shape — module list confirmed, event vocabulary and HTTP surface not read this pass"
    - "clear-glass's own event stream (vs request/response only) — not confirmed"
    - "copilot's own event channel vs riding guardian's job.* events — not confirmed"
    - "ollama and bridge's event emission — not read this pass, blocked on command-index phases 2 and 4 anyway"
    - "route graph edge-glow-on-call requires a live call-trace per system, which command-index-per-system.spec does not produce (it's a static index) — a second mechanism, not yet specced"
    # §ADDED 2026-09-03, alongside the data_sources additions above:
    - "scheduler.js, macro.js, tool-index.js, tool-forge.js, hat-forge.js event/transport shapes — modules confirmed real, live-event emission not confirmed for any of them"
    - "'exportable/importable single unit' is TWO real, unconfirmed-to-match mechanisms today (hat-forge's exportHat/importHat vs. cos/vault) — not one format"
    - "'recursive' compartments (nested/compartment-spawning-compartment) — searched for in cos/kernel.js and cos/manager.js, NOT found this pass"
    - "hats are not confirmed to be RAID's actual routing unit — RAID routes by dispatchName today; 'using hats for models' as the orchestration primitive is real future work, not an existing wire"
