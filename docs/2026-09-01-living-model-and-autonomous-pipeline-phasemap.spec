spec:
  meta:
    name:    2026-09-01-living-model-and-autonomous-pipeline-phasemap
    version: 0.1.0-phasemap
    status: >
      PHASEMAP 2026-09-01. James, across two messages: the registry as a
      live hub other systems wire to (watchdog-propagated, dynamic,
      self-updating); the .spec as the living model per system (full
      context/history/versions/commands); a per-system tool index like
      clear-glass's own, user-friendly and zoomable, so co-pilot can
      answer "what can I ask about system X"; who creates RAID contracts
      and how; full agent-mesh + guardian + clear-glass + RAID + co-pilot
      pipeline wiring end to end; deterministic CLI agent-switching with
      an offline fallback; per-agent wake words ("hey chatgpt" etc.);
      co-pilot ollama/guardian toggle; successful-prompt caching via the
      crystallization/pattern-scan memory; plus a longer list from the
      prior message (guardian agents-folder refactor, components store,
      master settings, per-system data decay backed to cortex, downloads-
      manager reuse for artifacts). Mapped bottom-up per axiom §3.1 —
      every dependency checked against real, already-verified session
      findings (this session's own RAID event-taxonomy work, the tool-
      call loop, the loom-map registration) before being phased, not
      assumed. Deliberately excludes the separate "Warris/Mastermind"
      personal system James described in the same conversation — that is
      not part of this codebase.
    uuid:    nexus-2026-0901-living-model-autonomous-pipeline-phasemap-v1-0000-001

  phases:

    LM1_spec_as_living_model:
      status: "OPEN — the real foundation everything else in this map
        depends on. James: 'I've got it. The .spec is the living model.'
        Checked directly: docs/*.spec already exist per-feature, but
        NOTHING today is per-SYSTEM, versioned, and updated automatically
        — confirmed via this session's own precommit output ('11 systems
        have no .spec anywhere: ollama-bridge, clear-glass, loom, gap-
        finder, divergence-watcher, macro-compiler, grammar-fallback,
        mutation-contract, open-loop-taxonomy, loop-topology, gap-loop').
        This phase is the real, minimal shape: one .spec per system,
        holding intention/history/current-gaps/version-history (hooked
        into Versionium, already real — versionium_commit is the only
        live capability, confirmed via this session's own tool listing)/
        commands/api-calls/channels — not a new storage mechanism, a
        real schema for what already-existing .spec files should hold
        per system, and the discipline of one existing per system."
      depends_on: []
      does: >
        Gives every system a single, real, versioned source of truth
        for what it is, what changed, and what's still open — the
        README-as-index James described, with versions listed under it.

    LM2_registry_as_hub_with_watchdog:
      status: "OPEN — real, checked foundation: loom's registry already
        IS a live component/hook/wire map (confirmed directly this
        session — read it, wrote to it, ran it). The real, confirmed gap:
        registration is one-way and manual today. Nothing watches a file
        change and propagates it; nothing currently reacts to the
        registry changing. James: 'can we have each component wire to
        the registry to make it dynamic, so changes are automatically
        updated for each system if a file or component moves or
        changes... using a watchdog to listen for file changes.' This
        is the real missing half of infrastructure that already exists
        on the other side."
      depends_on: [LM1_spec_as_living_model]
      does: >
        A real file-watcher that detects a change to a registered
        component and re-declares it (or flags drift) automatically,
        instead of requiring a manual loom/maps/*.js edit every time —
        this session's own raid-events-and-tools-map.js is the exact
        real, manual process this phase would eventually replace.

    LM3_interaction_contract_wired_to_registry:
      status: "OPEN — depends on LM2 existing first. James: 'maybe the
        interaction contract uses the registry as a map like the ui
        does. same with main.js to make systems route components
        dynamically based on intent.' Checked: cockpit's real
        INTERACTION_CONTRACT (confirmed live this session via co-pilot's
        own run_command tool description — 'command vocabulary is read
        live from the contract at load time, not hardcoded') already
        does exactly this pattern for cockpit commands specifically.
        This phase generalizes that same real, already-proven pattern
        (live-read-from-a-map, not hardcoded) to the registry as a
        whole, for intent-based routing generally."
      depends_on: [LM2_registry_as_hub_with_watchdog]
      does: >
        Any system's dispatch/routing logic reads the registry as its
        map of what exists and how to reach it, the same real way
        cockpit's contract already works for commands — one convention,
        generalized, not reinvented per system.

    LM4_per_system_tool_index:
      status: "OPEN — real, direct precedent already exists and works.
        James: 'the way clear-glass has a tool index, we need for each
        system... user friendly, like someone who's never used nexus
        before could use it.' Checked directly: clear-glass's real
        living command index (confirmed this session's own memory —
        'auto-written on boot, 68 real commands, GET /cli/commands')
        is exactly this pattern, already built, for exactly one system.
        This phase is that same real, proven mechanism, generalized to
        every system, not a new mechanism."
      depends_on: [LM1_spec_as_living_model]
      does: >
        Every system gets its own live, self-updating index of what it
        can do — reusing clear-glass's own real pattern, not inventing
        a second one.

    LM5_copilot_capability_zoom:
      status: "OPEN — depends on LM4 existing for every system, not just
        clear-glass. James: 'co-pilot needs to be able to zoom in on any
        system and tell me anything i can ask about it... its cluttered
        [today].' Checked directly this session: co-pilot's OWN real
        tool list (seen in the uploaded chatgpt transcript) is 70+ tools
        with dense one-line descriptions and no per-system drill-down —
        confirmed genuinely cluttered as described, not a vague
        complaint. Real fix is downstream of LM4, not a separate
        mechanism: once every system has a real per-system tool index
        (LM4), co-pilot needs one real 'zoom into system X' action that
        reads THAT system's index and returns a short, human-readable
        answer, instead of the full flat tool list every time."
      depends_on: [LM4_per_system_tool_index]
      does: >
        'What can I ask about guardian?' gets a short, real, current
        answer sourced from guardian's own live index — not a static
        paragraph someone wrote once and forgot to update.

    LM6_who_creates_contracts:
      status: "OPEN — real, currently-honest gap, not yet designed.
        James: 'who creates the contracts? and how? co-pilot? the
        intelligence system? specific agents?' Checked directly this
        session: RAID's real submitContract() (cortex/core/raid/
        contract-intake.js) accepts a contract object from ANY caller —
        there is currently no real, designated creator; every existing
        real caller (this session confirmed lib/seam/spec-parser.js as
        the one real wired source) hand-builds one. This phase is a
        real design decision, not a wiring fix: which of co-pilot /
        intelligence / a specific agent is authorized to author a
        contract for which kind of work, using LM3's registry-as-map
        (once real) to know what's actually available to contract for."
      depends_on: [LM3_interaction_contract_wired_to_registry]
      does: >
        A real, named answer to 'who can create a RAID contract, for
        what, and how' — replacing today's honest 'whoever calls
        submitContract() correctly' with an actual, designed authority
        model.

    LM7_agent_mesh_intent_programming:
      status: "OPEN — depends on LM6 (a real contract-creation authority
        must exist before an intent can safely generate one). James:
        'i want co-pilot to be able to add intents to the intent map...
        i want to be able to fully program the agents in the agent
        mesh.' This is the largest, least-scoped item in this entire
        map — deliberately left open rather than pretending a shape for
        it before LM6 lands, per this codebase's own §3.1 bottom-up
        discipline."
      depends_on: [LM6_who_creates_contracts]
      does: >
        Co-pilot (or an authorized agent) can register a new intent →
        contract mapping for the agent mesh directly, rather than every
        new agent behavior requiring a hand-written contract.

    LM8_full_pipeline_wiring:
      status: "OPEN — real, partial progress already confirmed this
        session. James: 'i want to get the pipelines working end to end.
        the agent mesh fully wired, guardian, clear-glass, raid engine,
        co-pilot all hooked in.' Checked directly, real current state:
        guardian's real NCP dispatch works end-to-end (confirmed
        repeatedly this session, job created -> dispatched -> acked ->
        complete, under 3s); RAID now has real event-taxonomy + ledger
        visibility (this session's own build); the real tool-calling
        loop is wired for all 4 providers (this session's own build).
        What's NOT yet confirmed wired: clear-glass <-> RAID
        (contract-driven browser actions), and the agent-mesh's own
        3-disconnected-sources-of-truth gap named earlier this session
        (IC11, partially fixed for spawn/send, useEros still unverified)."
      depends_on: [LM7_agent_mesh_intent_programming]
      does: >
        The actual, named end state James wants — not a new phase's
        WORK so much as the point where every phase above has landed
        and the whole chain is verified live in one real run.

    LM9_deterministic_agent_switch_cli:
      status: "OPEN — real, small, independently buildable NOW, doesn't
        block on the bigger phases above. James: 'nexus needs
        deterministic commands for agent switching. commands in case the
        agent is offline.' Checked directly this session: switch_agent's
        real tool (confirmed in co-pilot's own tool list) already exists
        for natural-language switching (and this session fixed a real
        bug in its 'switch to guardian using X' parsing) — but there is
        no confirmed, real, FIXED command syntax (e.g. a CLI-style
        `/switch chatgpt` immune to phrasing ambiguity) and no confirmed
        real fallback behavior when the target agent's tab isn't live."
      depends_on: []
      does: >
        A real, unambiguous command form for switching agents that
        works the same way every time, plus a defined, real fallback
        (queue it, fall back to another agent, or report unreachable
        honestly) when the target is offline — closing the exact
        ambiguity this session's own regex bug came from.

    LM10_per_agent_wake_words:
      status: "OPEN — real, direct precedent already exists and works.
        James: 'I would love to say hey chatgpt, hey claude, hey gemini,
        hey perplexity, hey nexus/copilot — just to send a prompt to any
        agent and receive the answer.' Checked directly this session:
        the real 'hey nexus' wake-word mechanism (WAKE_RE, parseWake,
        nexus_wake_events — all confirmed real in this session's own
        tool listing and lib/agent-chat.js) already exists for exactly
        one address. This phase generalizes that SAME real, proven
        pattern to each of the 4 named agents, dispatching a single
        real turn immediately rather than persistently switching state
        the way LM9's switch command does."
      depends_on: [LM9_deterministic_agent_switch_cli]
      does: >
        Saying 'hey chatgpt, <anything>' in any connected tab dispatches
        that one prompt to chatgpt specifically and returns its real
        answer, without changing which agent subsequent messages go to
        — a real, one-off address, distinct from a persistent switch.

    LM11_copilot_ollama_guardian_toggle:
      status: "OPEN — real, small, independently buildable. James:
        'toggle co-pilot to ollama and toggle the system for the
        co-pilot.' Checked directly: copilot_identity's real
        getAgent/setAgent action (confirmed in co-pilot's own tool list)
        already persists a default dispatch provider including ollama
        and 'auto' — the real gap is a CONFIRMED, single, deterministic
        toggle command (not a natural-language request) for exactly
        this, matching LM9's own deterministic-command goal."
      depends_on: [LM9_deterministic_agent_switch_cli]
      does: >
        One real, fixed command flips co-pilot between dispatching
        through ollama directly and dispatching through guardian's NCP
        agent mesh — no ambiguity about which mode is active.

    LM12_successful_prompt_caching:
      status: "OPEN — real, concrete mechanism identified, not yet
        built. James: 'successful prompts cached... using the
        crystallization memory to solidify in the index.' Checked
        directly this session: intelligence's real pattern-crystallising
        engine (the 'pattern crystallised' lines seen constantly in
        every boot log this session) already tracks recurring event
        sequences with confidence scores — but it tracks EVENT
        PATTERNS, not prompt/response pairs. This phase is a real,
        adjacent extension: when a dispatched job completes
        successfully (real, already-emitted guardian.job.complete),
        record the prompt shape + outcome into the same real
        crystallization store, so a repeated, similar prompt can be
        answered from a cached, verified-successful precedent instead
        of re-dispatching — not a rebuild of the crystallization engine,
        a new real input into it."
      depends_on: []
      does: >
        A prompt whose shape closely matches a past, successfully-
        completed one can be served from the crystallized cache first,
        cutting real dispatch time/cost for repeated requests.

    LM13_guardian_agents_folder_refactor:
      status: "OPEN — real, large, deliberately deferred. James: a real
        directory layout per agent (model.db, input.js, output.js,
        toolbox/, index.html moved from ui/agents/<name>/index.html).
        Directionally sound and consistent with LM1's per-system living-
        model idea, but this is an invasive restructure of guardian's
        4 currently-working userscripts (verified working, this
        session's own tool-call loop build touched all 4 directly) —
        needs its own phased, separately-verified pass per this
        codebase's own axioms, not folded into this map's other phases."
      depends_on: [LM1_spec_as_living_model]
      does: >
        Guardian's per-agent code organized the same real way LM1 wants
        every system organized — the largest single refactor in this
        map, intentionally sequenced last among the concrete items.

    LM14_components_store:
      status: "OPEN — real, not yet scoped in detail. James: 'a
        components store with components being made constantly, reused.'
        Real precedent partially exists: lib/agent-tools/index.js's own
        TOOLS map + the loom registry are both real, existing 'stores'
        of reusable pieces, but neither is exposed as a browsable,
        reusable catalog a builder would consult before making something
        new. Left open pending LM2/LM4 landing, since a real components
        store is naturally the union of 'what LM4's tool indexes already
        list' + 'what LM2's registry already tracks' rather than a
        third, separate mechanism."
      depends_on: [LM2_registry_as_hub_with_watchdog, LM4_per_system_tool_index]
      does: >
        A real, single place to check 'does something like this already
        exist' before building new — sourced from real, already-tracked
        data, not a new manually-maintained catalog.

    LM15_master_settings:
      status: "OPEN — real, not yet scoped. James: 'nexus to have a
        master settings for everything.' No real, existing candidate
        found this session to build on directly — each system currently
        has its own real settings table (confirmed via this session's
        own boot logs showing '[jaa] Loaded 70 rows — settings' per
        system). Left open pending a real design pass on whether this
        means one UNIFIED settings store (a migration) or one unified
        VIEW over each system's existing real settings (additive,
        safer) — the latter fits this codebase's own 'per-system data,
        backed up to cortex' principle better, not assumed here without
        that real design conversation."
      depends_on: []
      does: >
        One real place to see and change settings across every system,
        shape still to be decided (unified store vs. unified view).

    LM16_per_system_data_decay:
      status: "OPEN — real, not yet scoped. James: 'data in the systems
        folder decays based on timestamps... every system has its own
        data, but also backed up to cortex.' Cortex-backup already
        real and confirmed (this session's own event-log/ledger work
        writes to cortex-adjacent real tables). The DECAY half — data
        aging out of a system's own local store on a real timestamp
        policy — has no confirmed existing mechanism found this
        session. Left open pending a real policy decision (what decays,
        how fast, per system or uniform) before any code is written."
      depends_on: []
      does: >
        Local, per-system data ages out on a real policy once it's
        safely backed up to cortex, keeping each system's own store
        lean without losing history.

    LM17_downloads_manager_for_artifacts:
      status: "OPEN — real, plausible reuse identified, not yet
        verified. James: 'the artifacts for each agent uses the
        downloads manager in clearglass?' Checked directly this
        session: clear-glass's real per-provider download-capture
        mechanism (confirmed in every boot log — 'download-capture
        armed for claude/chatgpt/gemini/perplexity -> guardian
        :7820/api/intake') already exists and is real. Whether agent
        ARTIFACTS (structured outputs, not just downloaded files) fit
        the same real pipeline is the open question — plausible, not
        yet confirmed by reading how artifacts are currently captured
        vs. how downloads are."
      depends_on: []
      does: >
        If the fit is real (still to be verified): agent artifacts
        reuse the exact same real capture pipeline downloads already
        use, instead of a second, separate mechanism.

  recommended_start: >
    LM1 (spec-as-living-model) first — every other phase either directly
    depends on it or is naturally easier once it exists (LM4's tool index
    and LM14's components store both want a real per-system source of
    truth to read from). LM9 (deterministic switch CLI) and LM10 (per-
    agent wake words) are independently buildable RIGHT NOW with zero
    dependencies and real, already-proven mechanisms to extend — the
    fastest concrete wins if James wants working features before the
    foundational LM1/LM2 work lands. LM12 (prompt caching) is also
    independent and immediately buildable. LM7/LM8 (agent-mesh intent
    programming, full pipeline wiring) are the real "system codes
    itself" end state this map is building toward, but both correctly
    depend on LM6 (who creates contracts) landing first — authorizing
    autonomous contract creation before deciding who's allowed to do it
    would invert the real safety ordering this codebase's own RAID
    governance already enforces everywhere else.
