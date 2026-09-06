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
    version:      0.2.0
    uuid:         nexus-brainos-panel-v1-0000-2026-0903-001
    author:       james-brooks
    status:       specced
    description: >
      BrainOS rebuilt as the live visual + control layer for copilot,
      guardian, ollama, agent-mesh (AM1), userscripts, RAID, and clear-
      glass. Every visual state change traces to a real system event. No
      decorative or idle animation. The canvas is a real-time reflection
      of the system, not an illustration of it.
      §UPDATED 2026-09-06 — bridge removed from this spec entirely (the
      system itself was fully retired this session, docs/AXIOMS-v3.1.md
      §5.2/§9.1 pending amendment); agent-mesh/AM1 added as a real,
      first-class data source (was missing entirely from the original
      version despite being the exact routing layer "a focal point for
      using the agents and copilot visually" describes); copilot's own
      data source corrected to reflect its real, current dispatch path.

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

    # §ADDED 2026-09-06 — was missing entirely from the original spec
    # despite being real, live, and exactly the routing layer James's
    # "a focal point for using the agents and copilot visually" idea
    # describes. Real, this session: DA1 (guardian-coverage gate fixed,
    # tested, shipped, live in v0.39.50) and the new direct test/control
    # entry point, POST clear-glass:7704/agent-mesh/route.
    - requirement: "agent-mesh (AM1) — real LLM-agent routing + live node liveness"
      source: "clear-glass/src/mesh/agent-mesh.js — real dispatch (route(), Guardian-first via a live GET :7820/providers check, DOM-automation fallback) and real node liveness (listNodes()/listMeshView(), reading network/pulse-registry.js in-process, built this session per its own comment: \"James: convert brainos into the agent mesh\")"
      real_events: "mesh.node.status_changed, mesh.nodes.snapshot — real SSE events, already emitted every 5s by _startNodePulse(). mesh.raid.decision / mesh.raid.unavailable — real events from the RAID-preference path in route(). Confirmed directly, not assumed — these are live emit() call sites, not proposed."
      transport: "POST /agent-mesh/route (clear-glass's own WIRE_PORT :7704, added this session — direct dispatch entry point, bypasses the TV UI/copilot path entirely) plus the mesh.* SSE events above via clear-glass's own bus"
      panel_role: >
        This is the real "focal point for using the agents and copilot
        visually" surface — listMeshView()'s unified view (real chat-
        agent contexts + real external node liveness, exactly the two
        halves BrainOS's original canvas drew as one mesh) renders
        directly, no new aggregation needed. A click on an agent node
        can dispatch through the same real POST /agent-mesh/route this
        session already built and tested, not a separate mechanism.

    - requirement: "co-pilot"
      source: "copilot/server.js, copilot/adaptive-fulfillment.js (real automation path, confirmed prior session), copilot/intuition.js (confirmed live faculty, prior session)"
      real_events: >
        §CORRECTED 2026-09-06 — this entry previously assumed copilot
        "dispatches THROUGH guardian's job system," surfacing as guardian
        job.* events. No longer true: tv-shell's ask-box now calls
        copilot directly (_copilotDispatch -> POST copilot:3750/bridge/
        deliver, this session's bridge-removal work) — guardian is no
        longer in that path at all for the primary UI. Whether copilot
        emits its own distinct SSE/bus events for THIS path specifically
        is still not confirmed — NEW WORK, same honest gap as before,
        just correctly scoped to the real current architecture now.

    - requirement: "ollama"
      source: "ollama/routes/{system,uploads,stream,jobs,queue,models}.js"
      real_events: "not confirmed this pass — ollama/server.js's own event emission (if any) not read. NEW WORK."
      transport: "each routes/*.js file presumably serves its own GET/POST surface — becomes visible via command-index-per-system.spec phase 2, not before"

    # §REMOVED 2026-09-06 — bridge was here as a data source
    # ("bridge/server.js, bridge/ledger.js, bridge/router.js"). The
    # entire system is retired this session (docs/AXIOMS-v3.1.md
    # §5.2/§9.1 amendment still pending) — nothing left to show.

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
