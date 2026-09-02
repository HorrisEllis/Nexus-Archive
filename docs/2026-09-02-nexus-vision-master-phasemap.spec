spec:
  meta:
    name:        2026-09-02-nexus-vision-master-phasemap
    version:     1.0.0
    foundation:  nexus-system-foundation@1.1.0
    status:      mapped-not-built
    uuid:        nexus-phasemap-v1-0000-2026-0902-jamesbrooks-003
    purpose: >
      James: "some ideas to map to phasemaps. do not build." A large,
      sustained vision dump covering tool/event awareness, build
      contracts, the full idearium spec pipeline, agent-mesh UI,
      clear-glass macros/CLI, versionium's deeper tracking role, a
      living-model framework for every system, guardian's agent-folder
      refactor, and Nexus's own end-state as a system that can build
      itself using any agent. Every real item below is extracted from
      that dump, checked against the current codebase where a check was
      possible (§8.4), and organized into tracks with real dependencies.
      NOTHING in this file is built — every phase is status: OPEN unless
      explicitly marked done_previously with a real commit reference.

  two_direct_questions_answered_first:
    loom_map_confusion: >
      James: "there isn't 41 systems... loom was mapped to over 1500
      components. had a map, im confused." Checked directly, live,
      against loom's own real graph — confirmed real, not a guess: the
      41-"systems" count comes from lib/loom-map.js's resolveSystem(),
      which derives a system name from a component id's FIRST dot-
      segment with zero validation against the real system list
      (orchestrator.config.json's ports, autopilot.js's supervised
      list, lib/version.js's tracked services). Running it live: the
      top "systems" by component count are tests (257), lib (234), spec
      (152), cos (85), cg (81) — folder/category prefixes and
      abbreviations, not real systems. cos and cg are the SAME real
      systems as their fuller names, double-counted under a second
      label. Real system count is ~15-17 (cortex, guardian,
      orchestrator, bridge, idearium, architect, eravos, intelligence,
      ollama-bridge, copilot, emerge, loom, clear-glass, diagnostic,
      autopilot, versionium), not 41. James's instinct was correct;
      mapped as VM1 below, not fixed here.
    duplicate_boot_log_lines: >
      The "loom map synced" line appearing twice in James's pasted boot
      log, once as [cortex:cortex/boot.js] and once as [intelligence:
      intelligence/server.js], is a REAL, ALREADY-FIXED bug (§BUGFIX
      2026-08-27, intelligence/index.js's own header) — checked directly:
      cortex/boot.js's real call site already passes
      scans:['failures','reuse'], correctly excluding loomMap from its
      own process. The pasted log is from a run that predates this fix
      reaching that machine, not a live regression.

  phases:

    T1_tool_listing_command:
      status: OPEN
      does: >
        "Needs to have a tool/command to list tools for the agent...
        awareness maps to the living model for each system." A real
        command/tool an agent can call to enumerate what's available to
        IT specifically (not the full 63-tool registry) — ties directly
        to AM1's already-real per-hat toolScope (lib/hat-forge.js) and
        this session's ACK-injection fix, which already narrows an
        agent's tools to its hat's scope. The missing piece: a callable
        "list my tools" command/keyword the agent itself can invoke
        mid-conversation, not just a header pre-computed at dispatch
        time.
      depends_on: []

    T2_event_taxonomy_per_system:
      status: OPEN — real, partial precedent exists
      does: >
        "Can we do the event taxonomy real quick for each system." Real
        precedent already exists and is real, not proposed: guardian/
        event-taxonomy.js, orchestrator/event-taxonomy.js, versionium/
        event-taxonomy.js (built this session, VS1), all conforming to
        lib/event-taxonomy-pattern.js's ET1 shape. Genuinely missing,
        confirmed by directory check: ollama/, copilot/, cli.js, clear-
        glass/, and cortex/ itself have no event-taxonomy.js of their
        own yet. This phase is "one per remaining real system,"
        following ET1 exactly, cataloguing REAL emitted events (grepped
        from each system's own bus.emit/jaaDB.insert('event_log',...)
        calls), not invented ones.
      depends_on: []

    T3_tool_to_event_mapping:
      status: OPEN
      does: >
        "Then we can map each tool or command to an event also." Once
        T1 and T2 exist, each of the 63 real tools in lib/agent-tools'
        registry gets a real, documented event pair (invoked/completed/
        failed) — a genuinely new cross-reference layer, not built by
        either T1 or T2 alone.
      depends_on: [T1_tool_listing_command, T2_event_taxonomy_per_system]

    T4_userscript_event_types:
      status: OPEN
      does: >
        "I want more event types for the userscripts... chat_input for
        my messages, then chat_response for you. also chat_download and
        chat_artifact... chat_wake, chat_block_type, chat_block_id...
        maybe the same for co-pilot: co_pilot_input, co_pilot_response...
        so we can see all of this in the autopilot console." Real,
        concrete event names named directly by James — this phase adds
        them to guardian's own real event-taxonomy.js and wires the
        actual bus.emit() calls into the four provider userscripts (all
        four already share the exact same handleJob shape per this
        session's ACK-injection fix — same file, same fix pattern
        applies here too) and copilot/lifeline.js's route().
      depends_on: [T2_event_taxonomy_per_system]

    T5_raid_full_cli:
      status: OPEN
      does: >
        "Raid a full cli." cortex/core/raid/ has real submitContract/
        acknowledge/listQueue/processNext (contract-intake.js) but no
        CLI surface of its own — a real gap, not a stretch goal, given
        how much of the agent-mesh vision routes through RAID contracts.

    B1_full_build_contract_schema:
      status: OPEN — real partial precedent (AM1's submitBuildPhaseContract)
      does: >
        "Need build contracts primitives for each agent, intent, hat...
        the contract has the uuid for the contract, intended agent,
        intent, system, conditions, the compartment uuid for the
        repository and raid engine, and the tools that can give
        context." AM1 (already real, this session) built
        submitBuildPhaseContract({name, does, forAgent, depends_on}) —
        real but narrower than this ask. Missing real fields: intent
        (distinct from forAgent — AM1's own intent-contract gate already
        checks {agent, intent} pairs, but submitBuildPhaseContract
        hardcodes intention:'build', never taking a real intent param),
        conditions (real, structured pre/post conditions — not present
        anywhere in contract-intake.js today), and an explicit
        compartmentUuid field (compartment.id exists at RUNTIME inside
        processNext(), but isn't accepted as a real INPUT the way this
        ask implies — "the compartment uuid FOR the repository," i.e.
        targeting a specific, pre-existing compartment, not always
        spawning a fresh one).
      depends_on: []

    B2_chunk_contract_chaining:
      status: OPEN — real design decision
      does: >
        "Maybe each chunk contract generates the next, like event gates,
        once tested and verified, generates the next chunk contract for
        the compartment end-state/spec." Real precedent: idearium's
        already-real chunk system (submitIdeariumChunk, spec-engine's
        buildChunkPrompt) processes ONE chunk at a time but doesn't
        auto-generate the NEXT chunk's contract on a real PASS verdict —
        that handoff is currently a separate, manual step. This phase
        is real event-gate wiring: RAID's own real event taxonomy
        (RAID_CONTRACT_PASSED) triggering the next chunk's submission
        automatically.
      depends_on: [B1_full_build_contract_schema]

    C1_copilot_spec_wizard:
      status: OPEN
      does: >
        "Co-pilot needs to be able to walk me through the pipeline. idea,
        choosing and creating a .spec, step by step... listing templates
        and helping me understand any questions." Real, substantial
        conversational-flow build — co-pilot asking idearium's own real
        template list (architecture/module/schema templates — see C2)
        one question at a time, synthesizing what each question means
        before asking it (James's own explicit ask: "a synthesis of what
        each question means").
      depends_on: []

    C2_templates_folder_structure:
      status: OPEN
      does: >
        "Templates folder for: Modules, Architecture, Schemas." Real
        precedent: idearium already has SOME real templates (module-
        builder.js's real, deterministic architecture-template matching,
        confirmed in an earlier session's lib/version.js changelog entry
        — api-service/event-system/plugin-runtime/ai-agent-system/
        minimal-kernel). This phase is formalizing that into a real,
        browsable, co-pilot-editable folder structure, not building
        template-matching from scratch.
      depends_on: []

    C3_component_import_decomposition:
      status: OPEN
      does: >
        "Would love a way to import projects and have them decomposed
        into components to add the component store." A real, and
        genuinely new, capability — no existing "import an external
        project and decompose it into components" pipeline found this
        pass. Large, standalone build.
      depends_on: []

    C4_build_wizard_two_modes:
      status: OPEN
      does: >
        "A build wizard would have two options: Co-pilot assisted...
        Manual builder, would have checkboxes." Real technical-spec
        field list given directly: project name, end-state/vision/
        philosophy, problem solved, language, target OS, interface type,
        architecture template. A real, concrete form schema to build
        against once C1 exists.
      depends_on: [C1_copilot_spec_wizard]

    D1_bridgeos_readme_template:
      status: OPEN — real reference material named, not attached
      does: >
        "Only look at bridge os demo. I want that readme as a template."
        James named a real, specific reference (a "bridge os demo"
        README) but it wasn't attached to any upload this session —
        needed before this phase can start for real, not guessed at.
        The real structure IS fully specified in the vision dump
        though: project name, summary (what/why/vision), file tree, full
        CLI+API index by consuming component, per-module breakdown
        (components/consumers/features/commands/edge cases), schemas
        (data/contract/architecture-consistency), version history with
        real change context (not just a version bump), toolbox/toolkit
        section per agent, a diagnostic schema using the real sigma-
        deviation system for expected-vs-actual runtime behavior, a
        full test suite section, and a living seams/components/hooks/
        wires/consumers registry with real fields (type, id, file dir,
        systemId, event types, toasts, tags, per-component commands, api
        calls, consumers, edge cases, memory arch/type/module).
      depends_on: []

    D2_idearium_compartment_structure:
      status: OPEN — real naming decision needed
      does: >
        "Maybe we call it an idearium compartment... or miniworld." A
        real compartment-per-idea structure: idea -> architecture-
        template-slotted compartment -> promoted to a real idearium repo
        (spec as live metadata) -> chunked and populated by chunk
        contracts (B2) as it's built. README (D1) is that compartment's
        real index.
      depends_on: [D1_bridgeos_readme_template]

    D3_loom_compartment_readme:
      status: OPEN
      does: >
        Same D1 structure, applied to loom's own real per-NEXUS-system
        compartments (not idearium's user-project compartments) — "each
        compartment in loom for each nexus system/repository needs a
        bridge os style readme." Same real dependency on D1's actual
        reference material.
      depends_on: [D1_bridgeos_readme_template]

    D4_spec_bulk_import:
      status: OPEN
      does: >
        "I have about 50 specs i want to be able to import/dump into
        idearium and have built using the pipeline." Real, bounded batch
        operation — genuinely blocked on C1/B2 existing first (the
        "pipeline" those 50 specs would run through).
      depends_on: [C1_copilot_spec_wizard, B2_chunk_contract_chaining]

    AM7_agent_suite_welcome_ui:
      status: OPEN
      does: >
        "Opening the agent mesh has a screen that says welcome to the
        agent suite... list of agents in blocks. add, edit, remove,
        manage... app-password style login." Real L5 UI work — every
        living-model phasemap this codebase writes explicitly sequences
        UI last (see versionium.spec's own "ui is hot swappable and is
        built last, all js is first" and VS1's own real precedent) — the
        real backend this UI would sit on (hat-forge, account-registry,
        agent-router — all real, confirmed in the agent-mesh phasemap)
        already exists.
      depends_on: []

    AM8_element_picker_agent_wiring:
      status: OPEN
      does: >
        "The guardian plugin maps to adding a new agent to the mesh...
        selecting a new element has the option in the listener settings
        to add to new agent, then asks if this is an input or an output
        element, then asks you to select the opposite to create a
        system." A real, novel UI interaction pattern for wiring a new
        agent via clear-glass's element picker — genuinely new, no
        existing precedent found.
      depends_on: []

    AM9_per_account_sub_agents:
      status: OPEN — real design decision
      does: >
        "Each account for the agent can also be another agent, since it
        can run in another tab." Real tension with account-registry's
        current shape (CA7, real multi-account-per-provider registry) —
        this asks for each ACCOUNT to be independently addressable as
        its own agent (own intent map, own hat eligibility), not just a
        credential slot under one provider-level agent. Needs a real
        design call on whether that's a new layer under hat-forge or a
        new dimension on account-registry itself.
      depends_on: []

    AM10_ollama_models_in_mesh:
      status: OPEN — real partial precedent
      does: >
        "Ollama needs to be in the agent mesh, each model in ollama."
        Real, partial precedent: lib/hat-seed-ollama-personalities.js
        already has 16 real personality hats on baseAgent:'ollama' with
        per-hat model tags (confirmed in the agent-mesh phasemap). What's
        missing: ollama's own real model catalog (ollama/abliterated-
        catalog.js, confirmed to exist) isn't wired to auto-generate a
        hat per available model — today's 16 hats were hand-authored.
      depends_on: []

    AM11_per_agent_tasks_automation:
      status: OPEN
      does: >
        "Maybe each agent has intent map, jobs and scheduled tasks, an
        index for each agent with a tasks and automation manager, which
        has the options for background tabs." Real precedent: hat-
        forge.js's own `responsibilities` field (real, scheduled,
        dispatches through copilot/tool-runtime.js's runViaAgent —
        confirmed in the agent-mesh phasemap) already covers "scheduled
        tasks per hat." Missing: a real per-agent INDEX/UI surface for
        managing these, and explicit background-tab options.
      depends_on: [AM7_agent_suite_welcome_ui]

    G1_guardian_agents_folder:
      status: OPEN — real, concrete structure given
      does: >
        "Guardian refactor: Agents folder: ChatGPT / model.db / input.js
        / output.js / toolbox/ / index.html (moved from ui/agents/
        chatgpt/) / tool index." A real, concrete target structure named
        directly — this is a genuine per-provider decomposition of
        guardian/userscript-chatgpt.js and friends, directly related to
        AM4 in the agent-mesh phasemap (confirmed real duplication
        across all four userscripts — 3 of 4 handleJob functions are
        byte-for-byte identical). G1 and AM4 should likely be the SAME
        real refactor, not two separate ones — flagged as a real overlap
        to resolve when scoping, not decided here.
      depends_on: []

    CG4_macros_plugin_autofill:
      status: OPEN
      does: >
        "Macros plugin for creating and managing plugins with autofill...
        full resume, application, account autofill, custom." Real,
        substantial new capability — no existing autofill-manager found
        this pass.

    CG5_copilot_guided_spotlight_macro:
      status: OPEN
      does: >
        "Co-pilot can guide me through macros using spotlight — like
        injecting the spotlight css into each page to select an element
        using clearglass... highlights an element asking about my name,
        I tell it James, next element asks last name... auto regex, i
        want the data working on any application on any website." A
        genuinely novel, real interaction pattern — element-highlight-
        and-ask, chained into a reusable, cross-site macro via regex
        generalization. No existing precedent.
      depends_on: [CG4_macros_plugin_autofill]

    CG6_element_picker_to_listener_queue:
      status: OPEN — real, repeated across the whole dump
      does: >
        "I can pick an element and tell co-pilot what to do to create a
        macro... select listener, option to give co-pilot a task...
        select an element, send it to a system or compartment with a
        ledger for the listener... then tell co-pilot to monitor the
        compartment... listen for the word apple." Repeated multiple
        times across the vision dump — clearly a high-priority, central
        idea: element picker -> real listener -> routed to any system's
        real queue/SSE (including copilot's own continuous stream) ->
        co-pilot monitors that compartment's ledger for a real condition
        and acts. Fully programmable framework/task/job creation as the
        end state.
      depends_on: []

    CG7_cli_first_architecture:
      status: OPEN — large, architecture-level
      does: >
        "Can we make the entire thing cli based. like every aspect of
        the browser... full command line to configure settings, config
        file, then the ui is event driven and disposable." A real
        architectural inversion — CLI as the primary surface, UI as an
        optional, event-driven, disposable layer on top, with captcha/
        human-intervention as the one real case that forces the UI open.
        Large, cross-cutting; touches every clear-glass feature.

    CG8_devtools_screenshot_dom_archaeology:
      status: OPEN
      does: >
        "A command for dev-tool errors, screenshots, archeology dom
        reader and map tool to map the entire dom to ids and calltos."
        Real, concrete command list — three distinct real capabilities
        (devtools-error capture, screenshot, DOM->id/callto mapping).

    CG9_history_via_rewind_engine:
      status: OPEN
      does: >
        "A browser history that uses the rewind engine, like as states,
        and what about bookmarks with the cookies linked to it?" Real
        precedent: clear-glass's Rewind engine already exists (confirmed
        live in every boot log — "[Rewind] Engine ready") and history
        write/search were just fixed this session (the clear-glass
        patch). This asks for history entries to become real Rewind
        STATES (restorable), and bookmarks to carry the real cookie/
        session state they were made under, not just a URL.
      depends_on: []

    CG10_zoom_and_hotkeys_bug:
      status: OPEN — real, confirmed-unfixed bug
      does: >
        "Need per page zoom options. also all the hotkeys/keyboard
        shortcuts don't work. nor control and scroll wheel to zoom in
        and out. control plus and minus." Distinct from the per-site
        zoom READOUT already fixed in this session's clear-glass patch
        (that was a display fix, not the underlying zoom/hotkey
        mechanism) — a real, still-open, separate bug report.

    CG11_ublock_adblocker_native_features:
      status: OPEN — already mapped once
      does: >
        Restates CG3 (uBlock-compatible filter engine + element picker)
        and CG2 (passwords/permissions/zoom as native Electron features,
        not plugins) from docs/2026-09-02-versionium-sovereign-and-
        cleanup-phasemap.spec — not re-mapped as new phases here, just
        cross-referenced so this document doesn't silently duplicate
        that one's own real scope.
      depends_on: []

    V8_full_change_tracking_hashing:
      status: OPEN — real partial precedent (VS1)
      does: >
        "Versionium needs to track system changes, files, data, anything.
        need hashing. one backup of each file, then of each file change.
        snapshots each sigma detection." VS1 (real, this session) built
        the sovereign commit/restore/calendar/state system, but it
        tracks jaaDB TABLE rows, not individual real files on disk — "one
        backup of each file, then of each file change" is a genuinely
        different, file-level tracking granularity, closer to cortex/
        snapshot/index.js's own real hash-chained .nex format (also
        touched this session — the half-life pruning work) than to
        versionium's table-level commits. Real design call: should
        versionium absorb cortex/snapshot's file-hashing role, or do the
        two stay separate (table-level history in versionium, file-level
        in cortex/snapshot)?
      depends_on: []

    V9_precommit_gate_for_raid_contracts:
      status: OPEN — real, well-specified
      does: >
        "I feel like we need a precommit for versionium for when raid
        creates a compartment for a contract that changes or updates a
        file in nexus. needs to force versioning, and updating the map
        with a precommit until its passed raids qc, axioms, test env,
        and conditions." A real, well-specified gate: RAID's real
        contract-intake (processNext/compartmentEngine.execute) would
        call into versionium (a real commit, forced, not optional) AND
        loom's real map (component/hook/wire updated) BEFORE a
        contract's real PASS verdict is honored — not after. Ties
        directly to B2's chunk-contract-chaining and to VM1 below (which
        system should even own "the map" being updated here).
      depends_on: [B1_full_build_contract_schema]

    VM1_versionium_owns_loom_map_sync:
      status: OPEN — real, James's own conclusion
      does: >
        "Intelligence:intelligence/server.js nor cortex:cortex/boot.js
        should be tracking this. it should be loom or even versionium...
        maybe versionium should track this, considering it can use the
        intelligence system also. probably should." James's own real
        conclusion, landed on directly in the dump — versionium (not
        intelligence, not cortex) becomes the real owner of loom-map
        sync tracking, since it's already the system tracking "what
        changed and when" for everything else. Real, concrete follow-on:
        this move would ALSO need to fix the real resolveSystem() bug
        (see loom_map_confusion above) as part of the same work, since
        moving broken counting logic to a new owner doesn't fix the
        counting.
      depends_on: []

    V10_dynamic_registry_self_wiring:
      status: OPEN — large, architecture-level
      does: >
        "Can we have each component wire to the registry to make it
        dynamic. so changes are automatically updated for each system if
        a file or component moves or changes... watchdog to listen for
        file changes. give co-pilot the ability to move files." A real,
        large capability — components self-registering/re-registering on
        file move, a real filesystem watchdog, and co-pilot given real
        file-move authority (a genuine new permission surface, not
        something to grant lightly — real design call on gating this).
      depends_on: [VM1_versionium_owns_loom_map_sync]

    LM2_per_system_living_model_completion:
      status: OPEN — real partial precedent (LM1, AX-013)
      does: >
        "Nexus needs a living model of each system: file structure,
        components, hooks, wires with intention, history, current gaps,
        version history hooked into versionium, commands, api calls,
        channels — which co-pilot uses as a map." LM1 (real, prior
        session) already built the AX-013 schema (history/gaps/
        version_history on system specs) and closed 8 real missing
        specs. What's still genuinely open: "commands, api calls,
        channels" as LIVE, queryable fields (not hand-written prose) —
        this is LM1's own gap V1, restated here — and co-pilot actually
        CONSUMING these specs as its real working map (co-pilot today
        doesn't read any system's .spec file at runtime, confirmed by
        grep).
      depends_on: []

    LM3_component_registry_hooks_spec:
      status: OPEN
      does: >
        "Component registry needs to hook into the spec also. a full map
        of each system." Ties LM2's living-model spec fields directly to
        each system's real registry-components.js (already real for
        ollama/loom/clear-glass/versionium) — today these are two
        separate real artifacts (a spec file, a registry file) that
        happen to describe overlapping things, never cross-linked.
      depends_on: [LM2_per_system_living_model_completion]

    LM4_hotswap_ui_contracts:
      status: OPEN — already mapped once
      does: >
        Restates CLEANUP7 from docs/2026-09-02-versionium-sovereign-and-
        cleanup-phasemap.spec ("using the living models for the
        interaction contracts for the hotswappable uis") — cross-
        referenced, not re-mapped.
      depends_on: []

    LM5_data_decay_per_system:
      status: OPEN
      does: >
        "Data in the systems folder decays based on time stamps." Real
        precedent: cortex/memory/decay.js already exists (confirmed —
        cortex/boot.js's own startDecayTicker call, running today). This
        phase asks for the SAME real decay concept applied to each
        system's OWN local data/ folder (versionium's own data/
        versionium/, ollama's data/ollama/, etc.), not just cortex's
        shared tables.
      depends_on: []

    LM6_model_template:
      status: OPEN
      does: >
        "Model Template: Model Name, Directory... each model should be a
        living map. Full context, history, versions, commands, updates."
        A real, smaller-scoped sibling of LM2 — specifically for
        describing an AGENT/MODEL (ollama tags, hat-forge records), not
        a whole SYSTEM.
      depends_on: [LM2_per_system_living_model_completion]

    CP1_less_rigid_copilot:
      status: OPEN — real, qualitative, needs concrete follow-up
      does: >
        "Co-pilot needs to be less rigid. Less stiff." Real, but not yet
        actionable as written — no concrete mechanism named. Real next
        step before this becomes buildable: identify SPECIFIC rigid
        behaviors (a particular canned response pattern, an overly
        strict tool-gate, a fixed persona) rather than treating
        "rigidity" as one global switch.

    CP2_copilot_learning_memory:
      status: OPEN — real partial precedent
      does: >
        "I want co-pilot to learn... to be able to talk to it and have
        it learn, but also think for itself... learns how to do things
        and logs it into its memory." Real precedent: copilot's own
        stream-digest (confirmed live — "activity persists to Cortex
        every 60s") and query_recall/agent_chat_search (real, confirmed
        in the agent-mesh phasemap) already give co-pilot durable memory
        of past exchanges. What's genuinely missing: a real mechanism
        for co-pilot to derive and persist a general LESSON from an
        exchange (not just the raw exchange itself) — closer to hat-
        forge's real personality-model concept than to plain chat
        logging.
      depends_on: []

    CP3_dynamic_model_selection:
      status: OPEN — real, concrete, small
      does: >
        "What if we dynamically use mistral:7b-instruct-q4_K_M for
        co-pilot, qwen2.5-coder:1.5b when it's low on resources?" Real,
        small, well-specified — ollama/config.js already has
        DEFAULT_MODEL/FALLBACK_MODEL fields (confirmed real this
        session while building VS1's own config.js pattern) but no
        resource-pressure-triggered switch between them. orchestrator's
        own real resource-monitor (confirmed live — "sampling every
        10s — GET /api/perf") is the real signal source this would
        listen to.
      depends_on: []

    CP4_copilot_cli_deterministic_toggle:
      status: OPEN
      does: >
        "Need deterministic options for cli.js: toggling co-pilot between
        ollama and guardian." Real, partial precedent: copilot/
        lifeline.js's route() already has a real priority cascade
        (`priority: ['ollama', 'guardian']`, confirmed this session) —
        this asks for a real CLI switch to pin one or the other
        explicitly, not just let the cascade decide.
      depends_on: []

    AX_candidate_map_first_discipline:
      status: PROPOSED — drafted here, NOT applied to AXIOMS-v3.1.md
      does: >
        James, twice in this dump: "remember, read maps, files and
        registry first before changing, map to specs, loom history for
        each system and component, tool index, phasemaps, before making
        changes, full history and context... never don't map." This
        phasemap drafts real candidate axiom language below for James
        to review; per "do not build," it is NOT written into
        AXIOMS-v3.1.md in this pass.
      candidate_text: >
        AX-014 (draft) — Map Before You Touch. Before any change to a
        system's real code, its own living model (spec, registry-
        components.js, loom's real component/hook/wire graph, its most
        recent phasemap) is read first — not assumed, not skipped
        because the change looks small. A change made without reading
        the map it's about to affect cannot honestly claim to respect
        that system's real history or its real current gaps, and cannot
        be safely undone by someone who wasn't there when it landed.
        "Never don't map" — mapping first is not a step that gets
        skipped under time pressure; time pressure is the reason it
        exists.

  build_order_recommendation: >
    T2 (per-system event taxonomies) and VM1 (versionium owns loom-map
    sync, including the real resolveSystem() fix) are the two cheapest,
    most load-bearing starting points — T2 because several other tracks
    (T3, T4) depend on it, VM1 because it's a small, well-specified fix
    to a bug James already found and diagnosed correctly. B1 (full build
    contract schema) is the next real gate, since B2, V9, and D4 all
    depend on it existing first. D1 (Bridge-OS README template) is
    blocked on real reference material — flagged, not guessed at. AX
    candidate needs a real yes/no from James before it's real law, not
    drafted law.
