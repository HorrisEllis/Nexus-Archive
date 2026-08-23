spec:
  meta:
    name:    2026-08-23-backlog
    version: 0.1.0-phasemap
    status:  PHASEMAP 2026-08-23. Real, evidence-grounded where evidence
             already exists (Guardian-zip mining report, live tool-registry
             counts, real file locations checked directly) — everything else
             marked OPEN honestly rather than assumed. "done" means tested
             and committed this session; "OPEN" means named, scoped, and
             deliberately not started; sequencing (depends_on) reflects real
             ordering constraints, not just a convenient list order.
    uuid:    nexus-2026-0823-backlog-phasemap-v1-0000-001
    intent: >
      James: "phasemap all the rest." Everything from tonight's session that
      didn't get built live — the Guardian-extension-zip migration into
      clear-glass, the full codebase reorganization (emerge files, docs
      consolidation, per-system phasemap folders, the agent-tools tool-tree
      restructuring, per-server.js configs), and nexus:// URL scheme +
      tools-per-url support — captured as real, sequenced, loom-visible
      phases instead of executed blind in one pass. Two things WERE built
      live this session and are marked done below for completeness: the
      macro system, and its erosmancer/behavior-engine integration.

  phases:

    # ── Already real, done this session (context for what follows) ───────

    BL0_macro_system:
      status: "✓ DONE — commit 9b8671f. lib/agent-tools/tools/automation/
        macro.js — create/list/get/delete/run/bookmark, built on
        browser_action + rewind_replay, not parallel to them. Two real bugs
        found and fixed while testing: a soft-delete row-ordering bug
        (jaaDB's query(pred,1) returned the oldest match, not the current
        one) and a tool-action-name vs driver-sub-action-name mismatch
        (get_url vs getUrl). 11 real tests, all passing."
      depends_on: []
      does: >
        The real foundation everything else in this phasemap that touches
        macros builds on.

    BL1_macro_erosmancer_integration:
      status: "✓ DONE — commit de34150. Macro steps can opt in per-step
        with engine:'erosmancer' to run through ErosmancerOS's real
        behavior-modeled execution pipeline (Box-Muller timing variance,
        Bezier mouse paths, adaptive learning) via clear-glass/wire/
        nexus-wire.js's real proxy at :7704/eros/*. A real correctness bug
        caught while testing: erosmancer's navigate/type/evaluate expect a
        raw payload value (String(payload)), not browser_action's
        {url:...} object shape. 6 more real tests (17 total)."
      depends_on: [BL0_macro_system]
      does: >
        Job-application and therapist-contact macros — the exact real use
        case James named — can now request human-like execution timing
        instead of mechanically-instant, bot-shaped interaction.

    # ── Guardian extension zip → clear-glass migration ─────────────────
    # System: guardian, clear-glass

    BL2_guardian_zip_mining_report:
      status: "✓ DONE — commit 5e4090f. GUARDIAN-ARCHIVE-MINING-2026-08-23.md
        — all four uploaded zips (files-1, Guardian-clean-9/13/17) read
        directly, not skimmed. Confirmed: the same older, separate Manifest
        V2 extension across all four; app.js/identities.json byte-identical
        gc9->gc17; content.js/popup.html evolved meaningfully. Mapped
        against the real request item by item — most items (account/cookie
        UUID fallback, console, downloads, print, macros) are NOT built in
        the archive; social-media listeners (modules/instagram.js,
        modules/threads.js) ARE real, working, and the strongest actual
        prior art found."
      depends_on: []
      does: >
        The real, evidence-based map this whole migration group is
        sequenced from — nothing below assumes more exists in the archive
        than was actually confirmed.

    BL3_port_social_listener_pattern:
      status: "OPEN — real, scoped, highest-value real code to port.
        modules/base-module.js's GuardianModule class (name/domains/urck,
        activate/deactivate, emit() -> browser.runtime.sendMessage) and
        modules/instagram.js's real MutationObserver-based DM/post
        detection are Manifest-V2-extension-context code — cannot be
        required as-is into guardian/userscript-claude.js (a Tampermonkey
        userscript, different runtime, no browser.runtime.sendMessage).
        Real work: reimplement the SAME pattern (MutationObserver + a real
        emit-to-guardian path, reusing this session's own real
        _nexusLogMessage()-style POST to a cortex/guardian endpoint rather
        than a browser extension message) as a genuine userscript module,
        not a literal file copy."
      depends_on: [BL2_guardian_zip_mining_report]
      does: >
        Gives the current, live guardian system a real social-media
        listener capability it does not have today — instagram.com and
        threads.com DM/post detection, emitting real, structured events.

    BL4_port_element_picker_ux:
      status: "OPEN. Real, confirmed-superior UX in the old extension's
        content.js/popup.js: breadcrumb depth indicator, zoom controls
        (parent/child/prev/next), nearby-element suggestion chips (auto-
        detects interactive elements within 120px), per-listener ring-
        buffer event log (500 events, JSON export). The current system's
        dom_pick (browser-action.js) is real and working but has none of
        this polish. Real work: port the UX layer, not the underlying
        pick mechanism (which already works and is already wired through
        gates/index.js's real domPickGate)."
      depends_on: [BL2_guardian_zip_mining_report]
      does: >
        Makes the existing, real dom_pick tool meaningfully more usable —
        this is a UX/ergonomics port, not new capability.

    BL5_port_killswitch_pattern:
      status: "OPEN. Real, well-thought-out real safety UX from the old
        extension: single-tap stops UI listeners only; double-tap within
        1.5s does a FULL stop (listeners + bridge + pulse). Worth having
        somewhere in the current guardian/clear-glass system, which
        currently has no equivalent single control for \"stop everything
        this tab is doing, right now\" — scoped narrowly on purpose, real
        design question of WHERE this belongs (guardian's own UI panel?
        a new browser_action action?) not yet answered."
      depends_on: [BL2_guardian_zip_mining_report]
      does: >
        A real, fast, unambiguous way to halt an automation/listener that's
        misbehaving, without restarting the whole guardian process.

    BL6_captcha_detection:
      status: "OPEN. The alert half of this (native OS toast, via
        GUARDIAN_NATIVE_TOAST) is already real and committed (5e4090f) —
        this phase is the other half: actually detecting a CAPTCHA
        challenge in the DOM (real dom_query against known CAPTCHA
        provider markup — reCAPTCHA/hCaptcha/Cloudflare Turnstile iframe
        signatures) and firing nativeToast when one blocks a macro or
        listener. Not found anywhere in the mined Guardian archive either
        — genuinely new work, not a port."
      depends_on: [BL0_macro_system]
      does: >
        Closes the real loop James named: \"CLI drives automation, pops a
        real notification when a CAPTCHA needs a human\" — detection was
        the missing half of the alert mechanism already built.

    # ── Codebase reorganization ─────────────────────────────────────────
    # System: loom, orchestrator, cortex, diagnostic, emerge, guardian,
    #         copilot, ollama, agent, clear-glass

    BL7_emerge_files_to_emerge_folder:
      status: "OPEN. James: \"these moved to /emerge: emerge.spec,
        emerge-codegen-v2.js, emerge-ide.js, emerge-kernel.js.\" Real,
        scoped file-move — needs every real consumer of each file's
        CURRENT path traced and updated (require() paths, loom map
        entries, any CLI/config references) before moving, not moved
        blind. emerge-ide.js in particular was directly edited this
        session (ollama.DEFAULT_MODEL wiring, commit 4fe7f12) — its real,
        current consumers need checking first."
      depends_on: []
      does: >
        Consolidates the emerge system's real files into its own real
        folder instead of scattered at repo root.

    BL8_docs_consolidation:
      status: "OPEN, and the real prerequisite for BL9 below — \"any
        phasemaps from the docs folder moved to looms phasemap system,
        sorted by system\" only means something once loom/scanners/
        phasemap-map.js (the real, already-built scanner, confirmed by
        reading it directly this session) has something DIFFERENT to do
        than what it already does — it already reads every docs/*phasemap*.
        spec file and tags each phase to a system automatically. Real work
        here: (1) move non-phasemap specs out of docs/ into each system's
        own real spec folder, (2) confirm phasemap-map.js's own real
        SYSTEMS list and PHASE_RE regex still correctly cover every
        existing phasemap file's real content before anything moves."
      depends_on: []
      does: >
        A docs/ folder that holds only what doesn't belong to one specific
        system, with everything else living where it's actually used.

    BL9_per_system_phasemap_folders:
      status: "OPEN. James: \"the loom phases, all split into a phasemap
        for each system, then copied into a phasemap folder in each
        system's folder: /cortex/phasemap, /co-pilot/phasemap, /guardian/
        phasemap, and the rest of the 12 systems.\" Real design question,
        not yet answered: loom/scanners/phasemap-map.js already computes
        per-system phase groupings AT QUERY TIME from the existing docs/
        files — this phase would need a real, new EXPORT step (real files
        written to disk in each system's own folder) rather than only a
        live query, and a decision on whether those exported files are the
        new source of truth (docs/ phasemaps then deleted, per James's own
        \"phases from these moved... then deleted\") or a generated,
        read-only mirror kept in sync."
      depends_on: [BL8_docs_consolidation]
      does: >
        Makes \"what's left for cortex\" answerable by opening
        /cortex/phasemap directly, not only by querying loom.

    BL10_nexus_roadmap_html_files:
      status: "OPEN. nexus-roadmap-combined.html and phase_map_11.html —
        named but not yet located in this checkout; real first step is
        confirming where these actually live (repo root? docs/? a build
        output?) before deciding whether they're a real, generated view of
        the same phasemap data (in which case BL9's real export step
        should regenerate them) or standalone artifacts to move/retire."
      depends_on: [BL9_per_system_phasemap_folders]
      does: >
        Resolves two named files with no confirmed real location yet.

    BL11_orchestrator_folder_consolidation:
      status: "OPEN. James: \"I want orchestrator in the orchestrator
        folder: orchestrator.config.json, orchestrator.js,
        orchestrator-contract.json.\" orchestrator.js is one of this
        codebase's most heavily-depended-on files (confirmed this session
        alone: cli/nexus.js's SYSTEMS table, multiple real tool files) —
        real work here is the same discipline as the cortex/boot.js route
        migration earlier this session: trace every real require/import of
        the root-level path before moving anything, move with the
        consumers updated in the same commit, not after."
      depends_on: []
      does: >
        orchestrator's own real files stop being the one system living at
        repo root while everything else has its own folder.

    BL12_nexus_heal_loop_to_diagnostic:
      status: "OPEN. James: \"moved to the diagnostic system:
        nexus-heal-loop.js.\" Narrower, real, single-file move — same real
        discipline: trace consumers first (this session already knows
        lib/agent-tools' own query tools reference nexus-heal in at least
        one place, confirmed by an earlier session's own comment trail in
        rewind-replay.js referencing \"same discipline as query-movement.js/
        nexus-heal.js\" — meaning a related file already moved once before;
        checking whether that precedent's own consumer-list is still
        accurate is the real first step, not re-deriving it from scratch)."
      depends_on: []
      does: >
        nexus-heal-loop.js lives with the rest of the diagnostic system
        instead of at its current, separate location.

    BL13_cortex_component_registry_move:
      status: "OPEN. James: \"the component registry for cortex moved to
        cortex: registry-components.cortex.js.\" Real, single-file,
        narrow move — real first step is confirming this file's CURRENT
        location (not yet checked this session) before moving it."
      depends_on: []
      does: >
        cortex's own component registry lives inside cortex/ rather than
        wherever it currently sits.

    BL14_seam_to_lib_seam:
      status: "OPEN. James: \"consolidate or move \\seam into: lib\\seam.\"
        Real, scoped move — same real discipline as every move phase
        above: trace every real require('../seam/...')-style path across
        the codebase before relocating, update every one in the same
        change."
      depends_on: []
      does: >
        SEAM's real code lives under lib/ alongside the rest of this
        codebase's shared library code, not as a top-level, separately-
        rooted folder.

    BL15_agent_tools_tree_restructure:
      status: "OPEN, the largest single real item in this phasemap. James
        gave an extremely specific real target structure: contracts/,
        frameworks/{framework-forge,framework-index}/, toolboxes/{gemini,
        chatgpt,claude,perplexity,ollama}-toolbox/ (four explicitly marked
        not-yet-built, plus a real, specific sub-path
        toolboxes/ollama-toolbox/huihui_ai/qwen2.5-coder-abliterate/),
        toolboxes/toolbox-forge/ (not-yet-built, for BUILDING toolboxes),
        hats/{hat-forge,hat-seed}/, autonomous-tools/{loops,feedback-loops,
        conditions,schedule,tasks,workflow-automation}/, clear-glass/
        {element-picker.js, element-mapper.js (not-yet-built — map every
        element into ids and calltos), dev-tools.js (not-yet-built — read
        real devtools console errors), listener-automation.js (not-yet-
        built — a real, involved UI: pick a DOM element from a dropdown,
        checkbox for \"listen for keywords\" vs \"listen for questions\"
        (sentences ending in a question mark — James's own message says
        comma, likely a real typo for question mark, worth confirming
        rather than silently correcting), auto-download+reverse-image-
        search a referenced image using the question as the search query,
        co-pilot asks where to retrieve an answer from and saves that
        choice for future reuse)}, nerve/, tool-forge/{tool-config.js,
        tool-forge.js, tool-index.js}. This session's real, currently-
        existing tools (browser-action.js, macro.js, rewind-replay.js, and
        every other of the 72 real registered tools) all need a real,
        individually-checked new home in this structure, not a blind
        bulk-move — several (macro.js in particular, built THIS session)
        plausibly belong under autonomous-tools/ rather than staying in
        automation/, a real naming/taxonomy decision this phasemap does
        not make unilaterally."
      depends_on: [BL0_macro_system]
      does: >
        The full backend-tool taxonomy James described — real folders for
        what exists today, real placeholders (named, not built) for what's
        coming, including a genuinely new listener-automation feature
        (image-driven reverse-search-triggered Q&A capture) that has no
        real precedent anywhere in this codebase yet, mined archive
        included.

    BL16_per_server_configs:
      status: "OPEN. James: \"each server.js file for each system needs a
        full config, not inline.\" ollama/config.js (this session,
        f113388/4fe7f12) is the real, working template — every other
        server.js (guardian, cortex, cockpit, copilot, idearium, ...) gets
        its own equivalent config.js, same real pattern: env-overridable,
        every scattered inline constant/timeout given a real name, the
        real §HISTORY worth keeping visible kept in the config file
        itself rather than duplicated per-consumer. Real work is one
        config.js per real server.js, checked individually — not a
        mechanical template stamp, since each server's own real constants
        differ."
      depends_on: []
      does: >
        Closes the same real \"N files must independently agree\" risk
        ollama/config.js closed for the model tag, for every other
        subsystem's own scattered constants.

    # ── nexus:// URL scheme + tools-per-url ─────────────────────────────
    # System: clear-glass, guardian, agent

    BL17_nexus_url_scheme:
      status: "OPEN. James: \"tools per url. nexus:// support for another
        project i have.\" Real, unscoped design question, not yet
        answered: identities.json in the mined Guardian archive already
        has a real nexusUrl field per provider (nexus://chatgpt,
        nexus://claude, etc.) but nothing in either the old archive or the
        current codebase resolves or dispatches on that scheme — grepped
        directly, zero real handlers found anywhere. Real first step
        before building: what should nexus://<x> actually DO when
        navigated to or referenced — route to a specific tool, a specific
        provider tab, a specific macro? — since \"another project\" wasn't
        named, this needs a real answer before real code, not a guessed
        one."
      depends_on: []
      does: >
        A real URL scheme NEXUS/co-pilot can resolve — the actual behavior
        depends on an open design question above.

    BL18_tools_per_url:
      status: "OPEN, likely the same real underlying mechanism as
        BL17 — url_listen/url_unlisten (already real, already wired,
        confirmed this session) already lets a real pattern trigger a real
        hook; \"tools per url\" may be exactly that, scoped and renamed, or
        may want something more specific (a real per-URL TOOL MANIFEST —
        which of the 72 registered tools are even relevant on a given
        page). Real design question, same as BL17: needs a concrete
        example of the intended behavior before this phase can move from
        OPEN to a real build."
      depends_on: [BL17_nexus_url_scheme]
      does: >
        Scopes tool availability/relevance to the current real page/URL,
        exact mechanism pending the same open design question as BL17.
