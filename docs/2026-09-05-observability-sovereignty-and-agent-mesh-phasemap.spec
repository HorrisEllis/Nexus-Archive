spec:
  meta:
    name:    2026-09-05-observability-sovereignty-and-agent-mesh-phasemap
    version: 0.1.0-phasemap
    status: >
      PHASEMAP 2026-09-05. Single long session, mapping only (§3.3 — map
      before build), triggered by James's real, live boot log showing a
      genuine OOM crash cascade (copilot exit 0xC0000409 at 04:18:11,
      orchestrator crashing 5s later, stale-flush-lock breaks and EPERM
      renames on event_log.json) plus a running system he described as
      "running horribly." Every phase below traces to something read
      directly in the actual codebase this session (guardian/lib/ncp.js,
      cortex/boot.js, cortex/core/raid/*, versionium/lib/engine.js,
      lib/agent-tools/index.js, cli/*.js, docs/nexus.spec, AXIOMS-v3.1.md)
      or directly in the live boot log James pasted — nothing here is
      guessed or assumed connected because it "should" be (§8.4/§8.6).
      James's own stated build order, given explicitly this session:
      guardian + related systems (NCP, agent mesh, clear-glass) working
      first, then the idearium pipeline working end-to-end and persisting
      across restarts, UI last (§8.5/§3.4). Phases are ordered below to
      match that, not by discovery order.
    uuid:    nexus-2026-0905-observability-sovereignty-agent-mesh-phasemap-v1-0000-001

  # ── Root findings this whole map hangs off ─────────────────────────────
  # Not phases — these are the confirmed, evidence-backed facts every
  # phase below cites back to. Recorded once here so no phase has to
  # re-derive them.
  root_findings:

    RF1_ncp_liveness_is_console_only:
      status: "CORRECTED 2026-09-05 — this finding was WRONG as
        originally stated, caught by reading guardian/lib/ncp.js,
        guardian/server.js's wiring block, and SISOStream.emit() in
        full, per §0.1 (evidence over prior conclusion). guardian/
        lib/ncp.js's handleChannel/close-handler/stale-sweep already
        call busEmit('ncp.client.connected'/'disconnected'/'stale', ...).
        guardian/server.js:580 wires busEmit to a REAL bus.emit (not a
        no-op), plus its own onConnect/onDisconnect additionally emit
        guardian.provider.connected/disconnected. SISOStream.emit()
        (guardian's actual bus) calls cockpitBroadcast() UNCONDITIONALLY
        on every event, no type filter — so NCP connect/disconnect
        already reaches guardian's own /events SSE today. Left here,
        corrected rather than deleted, so the wrong version isn't lost
        without a trace (§0.3)."
      original_evidence_that_was_incomplete: >
        guardian/server.js:589/596's console.log calls were real, but I
        stopped reading there instead of checking the module underneath
        them — the console.log sits ALONGSIDE real bus.emit calls in the
        same callback, not instead of them.
      superseded_by: RF1B

    RF1B_real_remaining_gap_is_cross_process_only:
      evidence: >
        Guardian's own liveness is already real and already reaches
        guardian's own /events. What does NOT exist: (1) a relay from
        guardian's bus into cortex's system-wide /sse, which still has
        exactly one hardcoded caller (nexus.wake.detected) in cortex/
        boot.js — confirmed by grep for every _cortexSSEBroadcast( call
        site in that file, this finding stands unchanged; (2) any caller
        of guardian's own already-complete GET /providers (backed by
        ncp.getProviders(), real heartbeat+staleness+usage tracking) —
        confirmed by grepping clear-glass/src/mesh/agent-mesh.js for any
        reference to :7820/providers: zero matches.
      violates: [§13.2 (the edge from guardian to cortex's SSE and from
        agent-mesh to guardian's /providers are both real, un-named,
        unbuilt edges — not missing primitives on either end)]

    RF2_shared_data_directory_is_the_root_of_the_crash:
      evidence: >
        guardian/config.js:28 — guardian's own JaaStore literally points
        at `CORTEX_STORE_DIR` (cortex's directory, `guardian_` table
        prefix). cortex/memory/jaa-db.js resolves to root-level
        `data/cortex/memory`, not `cortex/data/`. Confirmed 11 separate
        node processes (cortex, orchestrator, bridge, guardian,
        diagnostic, idearium, architect, copilot, loom, intelligence,
        versionium-partially) each load a FULL independent in-memory copy
        of the same tables at every boot AND every restart. Quantified
        from the live log: event_log 4,642 -> 60,568 rows, component_
        ledger 4,338 -> 34,089, cfr_tension_history 283 -> 14,136,
        sigma_records 1,363 -> 14,841 rows over 3.5 hours — an 11x
        duplicated, 10-13x-growing dataset. Direct crash evidence: stale
        flush-lock breaks on component_ledger and event_log, EPERM rename
        failures on event_log.json, immediately surrounding copilot's and
        orchestrator's 0xC0000409 exits at 04:18.
      violates: [§5.9, §2.2, §10.3]

    RF3_selfheal_permanently_stuck:
      evidence: >
        01:39:49 — 'memory_pressure' entered FAILURE_MODE. Every single
        subsequent critical-memory event for the rest of the 3.5-hour log
        (dozens of occurrences) is met with "refused HEAL_REQUESTED —
        already in FAILURE_MODE." Stated reason every time: "global.gc()
        is not exposed (start this process with --expose-gc)." The
        npm run start:all command does not pass that flag. Self-heal
        correctly detected the problem and then had no working recovery
        path for the entire remainder of the session.
      violates: [§1.2, §4.2]

    RF4_versionium_split_brain:
      evidence: >
        versionium/lib/engine.js's real commit() writes to
        `versionium_commits` AND emits a real `versionium.committed`
        event — but only inside versionium's OWN process, which opens a
        second, sovereign store at `data/versionium` (confirmed in boot
        log: a second "[jaa] Store ready" line specific to versionium,
        distinct from every other process's shared "data/cortex/memory"
        line). Every OTHER consumer (cortex-v2.js, ui/contracts.js,
        hooks/cortex.hooks.js, diagnostic, orchestrator) still reads
        `versionium_commits` from the old shared store, which stays at
        exactly 0 rows for the entire session — including after the
        04:18 crash-restart, while every other shared table grew 10x+.
        Meanwhile intelligence's pattern-scanner correctly shows
        "versionium: committed" firing in the thousands (it reads
        event_log, which IS shared and DOES receive the event). A live,
        running instance of §10.3 ("competing truth layers are a system
        failure") — not hypothetical.
      violates: [§10.3, §5.9]

    RF5_agent_registry_is_hardcoded:
      evidence: >
        clear-glass/src/mesh/agent-mesh.js:54 — `AGENT_REGISTRY` is a
        literal hardcoded object (claude/chatgpt/gemini/perplexity/
        mistral/grok). CORRECTED SCOPE 2026-09-05: this is not a missing
        primitive. guardian/server.js's real GET /providers (backed by
        ncp.getProviders() — tabId, connectedAt, lastHeartbeat, usage,
        chatId, claimed, recentDisconnects, all real and live) already
        exists and is already complete. agent-mesh.js simply never calls
        it (confirmed: zero references to :7820/providers anywhere in
        that file). DA1 below is now scoped as an integration — one
        HTTP call added to an existing dispatcher — not a build.
      violates: [§0.5, §16.4]

    RF6_tools_have_no_contracts:
      evidence: >
        lib/agent-tools/index.js's `TOOLS` map — zero input schema,
        output schema, or failure-mode fields on any registered tool.
        Guardian's own interaction-contract.json (system-level) is the
        real template to generalize one level down, to individual tools.
      violates: [§5.10, §12.6]

    RF7_three_disconnected_debug_surfaces:
      evidence: >
        cli/cfr-debug.js reads intelligence/cfr/* directly. cli/
        diagnose.js does its own independent live HTTP probing and
        writes its own separate ledger file (not event_log, not
        tool_index). cli/sentinel.js is a third, separate surface. No
        shared index between any of them.
      violates: [§16.5, §17.7]

    RF8_nexus_spec_is_stale:
      evidence: >
        docs/nexus.spec v2.0.0 lists bridge's entry as
        bridge/nexus-bridge.js; the real, running entry (confirmed in
        every boot log this session) is bridge/index.js. 5 of the 15 real
        running systems (versionium, intelligence, ollama-bridge, eravos,
        architect) are entirely absent from its systems: block.
      violates: [§6.1]

  # ── Phases, ordered per James's own stated build order ─────────────
  # (guardian+related first, idearium end-to-end+persistent second,
  # UI last) rather than by discovery order.
  phases:

    CG1_ncp_events_real:
      status: "ALREADY REAL — closed by RF1B, not a phase to build.
        Confirmed 2026-09-05 by reading guardian/lib/ncp.js, guardian/
        server.js's wiring block, and SISOStream.emit() in full: NCP
        connect/disconnect/stale already emit real bus events, already
        reach guardian's own /events SSE unconditionally. No work here."
      depends_on: []
      does: >
        (nothing to do — already true)

    CG2_route_ncp_onto_guardian_sse:
      status: "ALREADY REAL — same evidence as CG1. SISOStream.emit()'s
        unconditional cockpitBroadcast() call means every bus event,
        not just NCP's, already reaches guardian's own /events. No work
        here."
      depends_on: []
      does: >
        (nothing to do — already true)

    DF1_guardian_own_data_folder:
      status: "OPEN — closes half of RF2. Guardian's JaaStore stops
        pointing at CORTEX_STORE_DIR; gets its own <system>/data/
        directory, no shared table with cortex. Independent of CG3/DA1
        — it's the live performance/crash fix, not an observability fix,
        and should run in parallel with them."
      depends_on: []
      does: >
        Removes guardian as a tenant inside cortex's on-disk store;
        directly reduces the 11x in-memory duplication quantified in RF2.

    CG3_relay_into_cortex_sse:
      status: "OPEN — the one real gap left in this area, per RF1B.
        cortex's /sse broadcaster (cortex/boot.js) has exactly ONE real
        caller in the whole file (nexus.wake.detected). Needs a real
        subscriber that takes guardian's (and every other system's) real
        bus events and relays them in — guardian's own /events is a
        per-process stream, not cross-system, and was never meant to be."
      depends_on: []
      does: >
        Any system's real events, not just guardian's, become visible on
        cortex's system-wide SSE stream — closing the actual cross-
        system observability gap, now that the per-system half (CG1/CG2)
        is confirmed already done.

    DA1_fix_stale_guardian_coverage_gate:
      status: "CLOSED 2026-09-05. Fixed in clear-glass/src/mesh/
        agent-mesh.js: added _guardianProviders() (mirrors _raidDecide's
        exact HTTP/timeout/honest-null convention), replaced route()'s
        stale 2-name guardianKey gate with a live check against
        guardian's real GET /providers. Verified against a real mock of
        guardian's /providers response before shipping: connected agent
        picked, disconnected agent falls through, unreachable guardian
        degrades to null — 3/3 real assertions pass, plus node --check
        clean. THEN checked against James's explicit instruction to
        verify against the .spec, not just grep: docs/guardian.spec
        (lines 40-70) and guardian/userscripts.yaml both independently
        confirm gemini/perplexity were always documented as full,
        first-class providers with real RAID cluster routes (vision,
        research) — the fix agrees with the project's own spec, not
        just with file-existence grepping. Small, separate, unrelated
        drift noted while checking: guardian.spec's own provider version
        numbers are stale against userscripts.yaml's real current ones
        — named, not fixed, out of DA1's scope."
      depends_on: []
      does: >
        Guardian-first dispatch now works for every provider guardian
        actually has live NCP coverage for, derived live, not from a
        list that silently went stale.
      test_verification: >
        James: "running the tests should tell us right?" Checked first
        whether the changelog's claimed "8 real test cases" for this
        exact file existed anywhere in the tree — they did not (grepped
        the whole repo, zero hits outside the changelog text itself and
        the source file). Built tests/modules/test-agent-mesh-guardian-
        coverage.js instead, matching this project's own test-<name>.js
        convention (test() helper, real assertions, real source-file
        reads for structural checks). 7 real assertions: the shipped
        code matches what this test verifies (AMC-000, itself caught and
        fixed once for a too-blunt comment-vs-code check), a connected
        non-claude/chatgpt provider is now correctly picked up (AMC-001,
        the exact case the old gate missed), a disconnected provider
        correctly falls through (AMC-002), unreachable/malformed
        guardian responses degrade honestly to null, never throw
        (AMC-003/004), agents with zero real Guardian coverage
        (mistral/grok) fail safe (AMC-005), and docs/guardian.spec +
        guardian/userscripts.yaml both independently confirm the factual
        basis for the whole fix (AMC-006). Registered in tests/modules/
        run-all.js per §5.1. Ran the FULL suite after registering:
        2265 passed, 39 failed, 11 crashed — confirmed via git stash
        that the one pre-existing test exercising real agent-mesh.js
        dispatch (clear-glass-accounts.test.js) has an IDENTICAL
        failure before and after this change (no live guardian in this
        sandbox to dispatch a real prompt through — unrelated to the
        coverage-gate logic touched here), not a regression. scripts/
        precommit-check.js clean, same 3 pre-existing unrelated
        spec-drift warnings as every check this session.

    DA2_dispatch_outcome_events:
      status: "OPEN — real, small. Agent-mesh's Guardian-first routing
        (built last session) should emit a named, bus-visible outcome for
        each branch it takes (Guardian success / DOM-automation fallback
        / total failure), not just return a value."
      depends_on: [DA1]
      does: >
        Every dispatch decision is traceable after the fact (§15.2), not
        just observable in the moment it happens.

    BR1_brainos_cross_system_relay:
      status: "OPEN — real, and already half-built correctly. Read
        nexus/ui/brainos/brainos-canvas.js in full this session: its own
        header already names the exact gap ('the other 13 real NEXUS
        systems have NO confirmed live event source reaching this stream
        today... real, separate, not-yet-scoped future work'). Once CG3
        exists, BrainOS subscribes to cortex's now-multi-system SSE
        instead of guardian's narrower one — no canvas code changes."
      depends_on: [CG3]
      does: >
        Every system's node on the canvas goes from an honest, unwired
        ghost state to a real live pulse, without touching the canvas's
        own already-correct anti-fabrication discipline (§NO_DECORATIVE_
        MOTION, §NO_CAP_ON_VISIBILITY).

    BR2_brainos_controls_agents:
      status: "OPEN — depends on DA1 (a real dispatcher to call) and TC1
        (tools have real contracts, so a canvas-issued command isn't a
        second, ungoverned write path — §9.1's Bridge-only-write-
        authority principle, same category applied to agent commands)."
      depends_on: [DA1, TC1]
      does: >
        BrainOS becomes a real control surface, not just a visualization
        — but only through the same governed contract path everything
        else uses, never a bypass.

    SYSTEM_REGISTRY_CORRECTION_2026-09-06:
      status: >
        CLOSED — real bug, caught by James directly ("there is not 50
        systems..."), not by anything this file's own tests checked.
        lib/system-registry.js's _loadVersions() read VERSION.modules
        from lib/version.js — but that key is explicitly, per lib/
        version.js's own header comment, a MODULE-level registry
        ("VERSION.modules[name] is the module's own semver"): ~50
        internal library components (jaa-db, vector-memory, raid,
        self-heal, seam, auth, grammar-engine, spec-compiler, and so
        on) that live INSIDE real systems, not sovereign systems
        themselves. The real per-system version block is a completely
        different key, VERSION.services — confirmed directly, and it's
        the exact block the 0.39.52 changelog itself already referenced
        ("removed bridge's own entry from this registry's services{}
        block entirely"). Reading the wrong key inflated systemCount
        from a real ~15 to 52, silently treating every internal library
        component as if it were its own running system — a real,
        embarrassing category error that none of the 9 SR-* tests
        caught, because none of them asserted an upper bound or checked
        that a known module name (e.g. 'jaa-db') was ABSENT from the
        systems list, only that known systems were present.
        FIXED: _loadVersions() now reads VERSION.services. Real count
        after the fix: 15 — the 13 real sovereign systems with real
        ports (bridge and emerge both now retired) plus 2 real,
        legitimate non-sovereign entries surfaced honestly rather than
        hidden: intelligence-consumer (a real, separate process —
        already documented earlier in this phasemap as an
        architectural mismatch, no port, distinct from intelligence
        itself) and forge-shell (not a process at all — a static UI
        page, ui/forge-shell.html, served by orchestrator and tracked
        under orchestrator's own port purely for availability checking,
        confirmed directly in diagnostic's own SYSTEMS map).
        ALSO FIXED WHILE HERE: emerge's own lib/version.js services{}
        entry was doubly stale — its own prior comment already said
        "compiler library, NOT an HTTP service" before today, and its
        changelog text still described the now-archived consumer.js.
        Removed, same treatment bridge's entry already got in this
        exact block.
        All 4 tests (system-registry, architect/eravos pulse migration,
        emerge-direct-compile) re-run after the fix — 9/6/6/9, all
        still pass, confirming this was an isolated bug in one
        function, not a symptom of something broader.
      depends_on: []
      does: >
        The system registry now reports the real, honest count instead
        of a category error — and the two non-obvious-but-legitimate
        entries (intelligence-consumer, forge-shell) are named precisely
        rather than either inflating the count further or being quietly
        dropped to make the number look cleaner.

    TC1_tools_get_real_contracts:
      status: "OPEN — closes RF6. Generalize guardian's own interaction-
        contract.json shape ({inputs, outputs, invariants, failure_
        modes, version}) one level down, to individual tools in
        lib/agent-tools/index.js's TOOLS map."
      depends_on: []
      does: >
        A tool call has a declared expected shape; "it failed" becomes a
        checkable claim instead of a guess.

    DBG1_consolidate_debug_surfaces:
      status: "OPEN — closes RF7. cli/cfr-debug.js, cli/diagnose.js, and
        cli/sentinel.js each independently probe and each write their own
        separate ledger. Consolidate onto one shared index so three
        independent probes agreeing is real corroboration (per James:
        'reinforce confidence'), which requires them to read comparable
        data first."
      depends_on: []
      does: >
        One shared diagnostic index instead of three disconnected ones;
        real cross-confirmation becomes possible.

    ID1_resolve_versionium_cortex_dependency:
      status: "OPEN — versionium's OWN spec already names this as
        unresolved: routing idearium's commit/restore through versionium
        made idearium require cortex to be up, which it didn't before.
        A real §0.4 regression (fewer working states than before), noted
        at the time but never closed."
      depends_on: []
      does: >
        Idearium's persistence-across-restart story stops silently
        depending on a second system being alive.

    VSB1_fix_versionium_split_brain:
      status: "OPEN — closes RF4, a NEW finding this session (sharper
        than the earlier 'zero commits ever happen' read, which was
        wrong — commits DO happen, just in versionium's own sovereign
        store while every consumer still reads the old shared, dead
        copy). Repoint cortex-v2.js, ui/contracts.js, hooks/
        cortex.hooks.js, diagnostic, and orchestrator's versionium_
        commits reads at versionium's real store, or give versionium a
        real cross-store read API — not both stores kept alive silently."
      depends_on: []
      does: >
        Every consumer of "has this committed" sees the same real
        answer. Directly unblocks trusting ID2 below.

    ID2_verify_idearium_reconciliation_reads_right_store:
      status: "OPEN — idearium's own boot log claims '[idearium/
        guardian-stream] reconcile: no in-flight chunks found' on every
        restart. Given RF4/VSB1, this claim needs verifying against the
        CORRECT store before it's trusted — same split-brain risk, not
        yet confirmed clean."
      depends_on: [VSB1]
      does: >
        'Idearium persists across restarts' becomes a proven claim
        instead of an unverified log line.

    DF2_cortex_and_versionium_off_root_data:
      status: "OPEN — cortex/memory/jaa-db.js and (partially) versionium
        both resolve to a root-level data/ folder rather than
        <system>/data/. Versionium is the existence proof this pattern
        works (it already writes sovereign) — DF2 is finishing that
        migration and doing the same for cortex, closing the other half
        of RF2 that DF1 doesn't cover."
      depends_on: [VSB1]
      does: >
        No system's persistence depends on a shared directory outside
        its own folder; removes the remaining half of the 11x duplication
        in RF2.

    LEDGER1_per_day_event_ledger:
      status: "OPEN — real, net-new primitive, not a wiring fix. James,
        this session: 'we need event ledgers split into days' — directly
        motivated by RF2/RF4: a flat, ever-growing, fully-in-memory-
        loaded table (event_log, cfr_tension_history, sigma_records) is
        exactly the shape that produced the quantified 10-13x growth and
        11x duplication above. Checked directly: warp/core/StreamLog.js
        (append-only, observes-never-consumes) is the closest existing
        primitive but has no day-rotation concept built in — nothing in
        the tree currently day-partitions any ledger."
      depends_on: []
      does: >
        Each system's own ledger rotates by day instead of growing
        unbounded in one file/table, loaded fully into every process's
        memory forever. Directly addresses the mechanism behind RF2 and
        RF3, not just the symptom.

    EVT1_commands_and_tools_emit_events:
      status: "OPEN — confirmed, clean gap. lib/agent-tools/index.js
        (co-pilot's shared tool dispatcher): zero bus.emit calls anywhere.
        cli/*.js: zero command-execution emits (only read-only reporting
        references 'emits'). Prerequisite for TC1 actually being
        diagnosable and for CP1 below having something real to index."
      depends_on: []
      does: >
        A tool firing or a command running becomes a real, traceable
        event instead of a silent side effect.

    REG1_component_registry_remap:
      status: "OPEN — hooks/index.js's 10 hooks/<s>.hooks.js files
        declare 78 hooks across the 10 originally-sovereign systems, but
        the live boot log this session shows 15 systems and 1,796
        components running right now. The declared registry is already
        behind the live system; needs a real re-walk and an honestly
        reported diff, not an assumed-current read."
      depends_on: []
      does: >
        The component registry describes what's actually running, not
        what was running when it was last hand-updated.

    SPEC1_rewrite_nexus_spec:
      status: "OPEN — closes RF8. Full rewrite from the real, live boot
        sequence and lib/version.js's own registry, not an edit of the
        existing stale YAML in place (§6.1 — generated from proof)."
      depends_on: [REG1]
      does: >
        docs/nexus.spec becomes an accurate, full account of what NEXUS
        is, matching every real running system, port, and entry point.

    CP1_tool_index_hooked_to_living_model:
      status: "OPEN — depends on EVT1 (tools need to emit something
        real to index) and TC1 (tools need a declared contract shape to
        hook to a living model in the first place)."
      depends_on: [EVT1, TC1]
      does: >
        Co-pilot's command/tool index becomes a live reflection of each
        system's real, current capabilities.

    CP2_copilot_versionium_awareness:
      status: "OPEN — must not report a commit history that doesn't
        exist from co-pilot's point of view; depends on VSB1 being fixed
        first so there's one real answer to report."
      depends_on: [VSB1]
      does: >
        Co-pilot can honestly answer questions about project history
        through versionium.

    CP3_git_vs_versionium_decision:
      status: "OPEN — real, unresolved tension named but not decided
        this session. Axioms point toward git (§17.4 reproducibility);
        versionium exists specifically as a non-git causal version
        system. Needs an explicit decision (§17.3 — alternatives
        recorded) on whether they're two parallel truths (a §10.3 risk,
        per RF4) or versionium is the non-file-state complement to git,
        never the same for the same thing."
      depends_on: []
      does: >
        One clear, recorded answer for what tracks what, preventing a
        second RF4-shaped split-brain from being built on purpose.

    HIST1_boundary_constraint_history_schema:
      status: "OPEN — James, this session, pointing at CFR: a history
        entry should carry a boundary/constraint field. Checked directly:
        cortex/core/raid/context-gate.js's real boundary shape is
        {primitive, invariants[], principles[]}, resolved by
        resolveBoundary(), gated via gateCandidate(). Real, honest
        caveat found while confirming this: invariants[] is currently
        ALWAYS EMPTY on every real boundary row in the whole codebase —
        the shape is proven at the code level, the data to populate a
        history entry's boundary field doesn't exist yet anywhere."
      depends_on: []
      does: >
        History entries record the constraint context a decision was
        made under, not just what happened — once real invariant data
        exists to populate it.

    REPO_PAGE1_per_system_living_page:
      status: "OPEN — real idea, direct precedent to build from rather
        than invent: BR1's same 'read live state, render honestly, never
        fabricate' discipline, applied to a system's own .spec + live
        component count + real taxonomy + real contract."
      depends_on: [SPEC1, REG1]
      does: >
        Each system gets a living repo page that updates as its own
        model does, instead of a static doc that drifts.

    IDU1_idearium_homepage_and_repo_browser:
      status: "OPEN — UI work, correctly last per James's own stated
        order. Sits on top of ID2 (repo/compartment data must be real
        and restart-proven first) and REPO_PAGE1 (the metadata being
        browsed must exist)."
      depends_on: [ID2, REPO_PAGE1]
      does: >
        New-project idea/brainstorm popup, repository browser over real
        compartments, feature list, recent-repos-with-real-history —
        all UI on top of already-real data, not ahead of it.

    UX1_design_philosophy_consolidation:
      status: "OPEN — real precedent already exists, this is
        consolidation not invention (§16.5): docs/nexus-nerve-design-
        philosophy.spec, docs/UI-DESIGN-PHILOSOPHY.md, and ui/tv-shell/
        DECOMP.md all already exist and overlap. UI-adjacent, correctly
        last."
      depends_on: []
      does: >
        One coherent design philosophy doc instead of three overlapping
        ones, covering layered UI, spotlight, nexus nerve, and tv-ui.

    RP1_repository_per_system:
      status: "OPEN — large, correctly deferred. Blocked on DF1/DF2
        (shared filesystem paths are cross-boundary dependencies, same
        category as a cross-require) AND on de-monolithing intelligence/
        — confirmed this session via grep: 8 of 14 systems (orchestrator,
        bridge, cortex, guardian, idearium, architect, versionium,
        copilot) directly require() intelligence/ in-process despite it
        also running its own sovereign server.js/port — a live AX-010
        violation ('no cross-process require()') at the largest scale
        found in the whole tree. Every other cross-system require edge
        found this session (orchestrator into 9 other folders, cortex
        into 6, guardian into 5, copilot into 4, emerge into 4) is a
        smaller instance of the same category."
      depends_on: [DF1, DF2]
      does: >
        Each system becomes a real, independent repository — but only
        once nothing inside it reaches across a folder boundary via
        require() or a shared directory.

    BRIDGE_REMOVAL_2026-09-06:
      status: >
        IN PROGRESS — session ended at 95% context, handed off before
        completion per James's explicit instruction. James: 'yes do it. and
        remove the folder completely.' Also raised a real open design
        question, unanswered: 'can't copilot just be the bridge between
        ollama and guardian?' — relevant directly to the §5.2/§9.1 finding
        below, not yet resolved.
        CONSTITUTIONAL FINDING (not yet acted on): docs/AXIOMS-v3.1.md §5.2
        ('Everything Implements the Bridge') and §9.1 ('Bridge Is the Only
        Write Authority for Requests') name Bridge specifically, by name.
        contracts/SYSTEM-CONTRACTS.js enforces the same claim. Removing
        Bridge as a running system requires EITHER amending both axioms to
        retire Bridge as a named requirement, OR naming what formally
        inherits 'sole write authority for cross-system requests' so the
        axiom text can name that instead. James said 'yes do it' but this
        specific edit (the axioms/contracts file) was NOT YET MADE before
        handoff — highest-priority remaining item, do this FIRST next
        session, before any further code changes, since it's the
        constitutional basis the rest of the removal depends on.
        DONE, VERIFIED — ui/tv-shell/index.html (the tv-shell CLI, James:
        'is how i use co-pilot'):
          - New _copilotDispatch() added, calls copilot:3750/bridge/deliver
            directly (copilot's own real, pre-existing handler — unchanged).
            Replaces the old _bridgeDispatch()+_getBridgeToken() handshake/
            circuit-breaker/retry chain through bridge:9999.
          - Fixed a real field-name bug caught before shipping: copilot's
            real /bridge/deliver ALWAYS returns model_used (snake_case),
            never modelUsed — the model-tag display would have silently
            never rendered.
          - Fixed the two literal strings visible in James's own screenshots:
            the ask-box placeholder ('via Bridge :9999' -> removed) and the
            response model-tag ('(bridge)' -> removed).
          - Removed: Bridge channel div (CH5), Bridge full-panel iframe
            channel, Bridge sys-tile, Bridge rail-nav button, Bridge entries
            in CH_META/CH_INSPECT/AUTOPILOT_KEY_MAP/SRC_DOT/SRC_TILE_ICON,
            the dead brLoad() function and its two call sites (would have
            thrown ReferenceError at runtime — caught before handoff, not
            after).
          - VERIFIED, not assumed: extracted the actual, literal
            _copilotDispatch function from the real shipped file (not a
            reimplementation) and ran it against a real mock server
            implementing copilot's exact /bridge/deliver contract
            (verified field-for-field against copilot/server.js's real
            handler first). 4/4 real assertions: a real prompt round-trips
            with correct text+model_used; a real copilot error (502)
            throws and is caught correctly; a missing-prompt (400) throws
            correctly; copilot being completely unreachable (connection
            refused — the exact live scenario in James's own screenshot)
            throws a clean, catchable error rather than hanging or
            crashing. Div-tag balance re-checked after every removal batch
            against the pre-existing baseline (confirmed via the original
            unmodified file) — consistently off by exactly the same
            pre-existing 1, never worse.
        STILL OPEN in ui/tv-shell/index.html (found, not yet fixed):
          - CONTRACT_KEY_MAP still has bridge:'br'
          - ~3 stale comments still name Bridge (CONTRACT_KEY_MAP area,
            ~line 1976 'Bridge-dispatch path', ~line 2283 'like Bridge/
            Diagnostic')
          - one stray <option value=\"bridge\">bridge</option> around line
            2629 — NOT YET CHECKED which dropdown this belongs to; verify
            it's a system reference and not user-facing data before
            removing.
        NOT STARTED:
          - autopilot.js:211 — bridge still critical:true, phase:2 in the
            supervised boot list. Left as-is, autopilot will hang waiting
            on a health check nothing will ever answer.
          - docs/AXIOMS-v3.1.md §5.2/§9.1 amendment (see constitutional
            finding above — do this first)
          - contracts/SYSTEM-CONTRACTS.js — bridge system entry + the
            '§5.2: Everything implements the bridge' line
          - hooks/bridge.hooks.js — archive (§0.3: never delete, archive),
            don't delete outright
          - lib/system-check.js, cli/diagnose.js, cli/nexus-repl.js — still
            reference bridge/:9999
          - ui/bridge/, ui/channels/bridge/ — bridge's own dashboard pages
          - the bridge/ folder itself — NOT YET DELETED
          - final repo-wide grep to confirm zero references remain, once
            all of the above is done
        FALSE POSITIVES ALREADY CLEARED (do not touch these — confirmed
        unrelated 'bridge' naming, not the nexus bridge/ system):
          clear-glass/src/copilot/bridge.js (Clear Glass's own co-pilot
          integration, calls copilot/guardian/cortex directly, bypasses
          nexus bridge entirely), clear-glass/src/ipc/bridge.js (Electron
          IPC glue).
        EVIDENCE SUPPORTING REMOVAL (already found, still valid):
          orchestrator/orchestrator.js's own REQUIRED_SYSTEMS =
          ['cortex','guardian','idearium'] excludes bridge; its own SSE
          relay to bridge already fails silently on error. cli/diagnose.js
          contradicts this ('boot order: bridge FIRST') — an existing,
          pre-session disagreement between the docs and the running code,
          not something this session introduced.
        REAL FUNCTIONALITY LOST BY REMOVAL (named, not hidden): bridge/
        router.js's circuit breaker (opens after 3 failures, 30s reset),
        MAX_ATTEMPTS retry, and durable held-request ledger (replays
        automatically when a target comes back online) have no
        replacement anywhere in this removal. tv-shell's direct-to-copilot
        path is a plain fetch — one failure is just a failure now, not
        held-and-retried. James accepted this tradeoff explicitly
        ('yes do it') but it is not being silently reintroduced elsewhere
        without a decision to do so.
      depends_on: []
      does: >
        Retires Bridge as a running system and as a named constitutional
        requirement, once the axiom amendment is made — the amendment,
        not the code deletion, is the part that makes this a real,
        complete removal rather than a system quietly still required by
        the document that governs everything else.

    BRIDGE_DIAGNOSTIC_2026-09-06:
      status: >
        CLOSED. service/nexus-diagnostic.js had 15 bridge hits; 4 were
        real (SYSTEMS registry entry, 3 EDGES topology pairs for
        §TENSION-05 sigma divergence, and the _REGISTRY_PATHS component
        map pointing at bridge/registry-components.js — a file that no
        longer exists since the folder was deleted). Removed all 4.
        11 were false positives, correctly left alone: 'ollama-bridge'
        (a real, different, unrelated system) and one historical comment
        about a past boot-halt incident that happens to mention
        ollama-bridge by name. node --check clean.
      depends_on: []
      does: >
        Diagnostic no longer polls, edges against, or looks for a
        component registry from a system that doesn't exist.

    KNOWN_ERROR_2026-09-06_bridge_false_positive:
      status: >
        RECORDED, not hidden (§0.3/§17.3 — mistakes are corrected
        visibly, not quietly). Earlier this session, clear-glass/src/
        copilot/bridge.js was called a false positive during the bridge
        mapping — its header read too optimistically as "calls copilot
        directly, bypasses bridge." It didn't: per nexus-v0_39_52's own
        real changelog, _bridgeHandshake() retried forever against the
        now-gone bridge:9999, and _bridgeDispatch() was "the real, live
        mechanism behind every copilot prompt, guardian command,
        guardian fetch, and ollama generation from Clear Glass" —
        silently broken, not just noisy, until James caught it live
        ("thought you took care of bridge man..."). Already fixed in the
        v0.39.52 upload (rewired to settings.js's real, already-existing
        *DirectUrl() methods) — nothing to do here except not repeat the
        mistake: a file's own header comment describing what it does is
        a claim to verify against real call sites, not evidence on its
        own, exactly the standard this whole phasemap otherwise holds
        everything else to.
      depends_on: []
      does: >
        Nothing to build — a recorded correction so the same mistake
        pattern is recognizable if it happens again.

    PULSE_ALL_2026-09-06:
      status: >
        IN PROGRESS — CORRECTED COVERAGE COUNT, found while starting
        real work (§0.1 — checked before building, not after). The
        original "3 of 14 systems" estimate was wrong: it only grepped
        for direct require('orchestrator/lib/pulse.js') in each
        system's own file, missing that nexus-connect.js's own
        startHeartbeat() already wraps createPulse() internally
        (confirmed directly at nexus-connect.js:299-314) — any system
        calling nc2.startHeartbeat() is already a real pulse consumer,
        one layer removed. Real count, grepped fresh: cortex, guardian,
        loom, ollama-bridge, clear-glass, versionium, copilot, and
        idearium — 8 of 14 systems already real. Only 5 genuinely lack
        it: architect, emerge, diagnostic, eravos, intelligence
        (orchestrator itself is the hub, not a client of its own pulse).
        ARCHITECT — CLOSED: architect/service.js's registerWithOrchestrator()
        was a fully separate, hand-rolled raw http.request() call, not
        even using nexus-connect.js at all (worse than guardian's own
        pre-0.39.38 gap, which at least used nc2.registerWithOrchestrator
        but forgot startHeartbeat). Replaced with the real nc2 client —
        same proven pattern guardian already uses. Found and removed
        ORCH_PORT as genuinely dead code once nothing referenced it
        anymore. 6/6 real structural tests (tests/modules/test-architect-
        pulse-migration.js) — confirms the old duplicate call is gone,
        the real nc2 calls are present, ORCH_PORT is truly gone, and
        (most importantly) that nc2.startHeartbeat genuinely uses
        createPulse() internally rather than assuming that claim.
        Registered in run-all.js.
        ERAVOS — CLOSED: same real gap class as architect — a hand-
        rolled http.request() to /api/register that only retried on
        the INITIAL attempt failing (setTimeout(register, 5000) on
        error), never an ongoing heartbeat after a successful register.
        Same real fix, same real client. Found and removed ORCH_URL as
        genuinely dead code afterward. 6/6 real structural tests
        (tests/modules/test-eravos-pulse-migration.js), registered.
        EMERGE — RESOLVED, DIFFERENTLY THAN SCOPED. James, after seeing
        the redundancy evidence: "just use a port one number higher the
        the system. build them. its just got a lot of noise. like its a
        compiler thats it, the rest is trash." Built the deeper fix
        instead of the port workaround: copilot/module-builder.js
        (build()) now calls emerge/compiler/pipeline.js's real compile()
        DIRECTLY — synchronously, in the same request, no file-drop
        queue, no separate process. Real side effects preserved (spec
        file, architecture.json/replace-target.json sidecars, one
        event_log write), just made once instead of twice with no 5s
        poll latency in between. emerge/consumer.js (the standalone
        poller, spawned by autopilot.js) is retired — archived to
        _archive/2026-09-06-emerge-consumer-retired/ per §0.3, removed
        from autopilot.js's ALL_KERNELS and from diagnostic's SYSTEMS
        (nothing serves :4242/status anymore; leaving that entry would
        recreate the exact stale-registry-entry problem bridge's own
        dead entry caused). emerge/compiler/ itself (pipeline.js,
        t2-gate.js) is completely untouched — still real, still load-
        bearing, now called directly by BOTH copilot and idearium
        instead of copilot going through a queue+poller first.
        RESULT: the port question is now moot. emerge is no longer a
        standalone running process at all, so there is nothing left
        needing a heartbeat — confirmed via lib/system-registry.js:
        systemCount dropped 52→51, emerge no longer appears in the
        merged registry from any of the 3 sources. 9/9 real tests
        (tests/modules/test-emerge-direct-compile.js) — 8 structural
        (queue code genuinely gone from real executable code, not just
        absent from comments — caught and fixed the exact same comment-
        vs-code blindness bug as AMC-000 earlier this session, in this
        test itself, before it shipped; consumer.js gone from its live
        path but archived; compiler/ untouched; autopilot/diagnostic
        both cleaned) plus 1 functional (the real write+compile logic
        produces correct buildDir/spec/architecture.json). Also caught:
        lib/build-pipeline.js — a more capable, already-built, never-
        wired front door found during this investigation — was
        considered and NOT used here; compile() directly matches
        James's own "just a compiler" framing more closely than
        build-pipeline.js's fuller T0→T1→T2-dispatch-to-Guardian scope
        would have. build-pipeline.js remains real, complete, and
        still unwired — a separate, smaller open item worth naming but
        not pulled into this fix.
        REMAINING, NOT YET STARTED: diagnostic, intelligence.
      depends_on: []
      does: >
        Every system reports real latency, real miss-detection, and real
        online/offline transitions through one shared, already-tested
        client — not N different hand-rolled polling loops. 3 of 5 real
        remaining gaps closed (architect, eravos, and emerge named as a
        genuine architectural limit rather than force-fit); diagnostic
        and intelligence still open.

    EVENT_TAX_ALL_2026-09-06:
      status: >
        OPEN, real progress already made. 6 systems now have a real
        event-taxonomy.js (guardian, orchestrator, cortex's RAID
        subfolder — not cortex itself, clear-glass, versionium) plus
        loom's real read-only aggregator (event-taxonomy-map.js, mirrors
        phasemap-map.js's proven pattern) and lib/event-taxonomy-
        pattern.js (ET1's shape/validator). Missing, confirmed by direct
        find: idearium, architect, emerge, diagnostic, eravos, ollama-
        bridge, copilot, intelligence, and cortex itself at the top
        level (only its RAID subsystem has one). 8-9 systems still need
        one, each scoped to that system's REAL emit() call sites only —
        per this session's own established discipline (ET3/ET4's own
        history: "corrected the phasemap's own claim before trusting
        it" — grep the real bus.emit() calls, never invent an event a
        system doesn't actually fire).
      depends_on: []
      does: >
        Every system's real event vocabulary is documented from its own
        real emit() call sites, validated at boot via the same fail-open
        check already proven in clear-glass and guardian.

    LEDGER_PERDAY_PERSYSTEM_2026-09-06:
      status: >
        OPEN — this is LEDGER1 from earlier in this phasemap, now with
        the exact shape James specified: "each ledger split into each
        systems data folder, sorted by folders named by the data then
        date. all relevant data goes in the data folder." Concretely:
        <system>/data/<table-name>/<YYYY-MM-DD>.jsonl (or the system's
        real existing row format) instead of one flat, ever-growing
        table loaded whole into memory — directly addresses RF2's
        quantified 10-13x table growth and RF2's 11x cross-process
        duplication, both still real per this phasemap's earlier
        findings. Still true: no day-rotation primitive exists anywhere
        in this tree (checked warp/core/StreamLog.js again — append-
        only, no rotation concept). Genuinely net-new, not a wiring fix.
        Depends on DF1/DF2 (sovereign per-system data folders) being
        real first — a per-day ledger inside a shared directory just
        reproduces RF2's duplication with extra steps.
      depends_on: [DF1_guardian_own_data_folder, DF2_cortex_and_versionium_off_root_data]
      does: >
        Solves the actual quantified memory/crash mechanism from RF2,
        not just the sovereignty-purity half of it.

    CORTEX_BOOKKEEPER_2026-09-06:
      status: >
        OPEN — James: "cortex the book keeper." A specific, nameable
        architectural role, not a slogan: cortex already holds the
        real, shared JaaStore memory layer every other system reads
        from (cortex/memory/jaa-db.js) and is already the real target
        of RAID's contract lifecycle. "Bookkeeper" should mean cortex is
        the one system that reads across every other system's own real
        per-day ledgers (once LEDGER_PERDAY exists) and maintains the
        aggregate, cross-system view — not that other systems write
        their own data INTO cortex's directory (that's RF2's shared-
        store violation, the opposite of sovereignty). Needs an explicit
        decision, same category as the CP3 git-vs-versionium tension
        above: "bookkeeper" as a read-side aggregator preserves §5.9
        (every system sovereign); "bookkeeper" as a write-side shared
        store re-creates RF2. Flagging the distinction rather than
        assuming which one James means.
      depends_on: [LEDGER_PERDAY_PERSYSTEM_2026-09-06]
      does: >
        Gives "cortex is the bookkeeper" a real, checkable technical
        meaning instead of leaving it as a description that could
        silently justify either the sovereign pattern or RF2's
        violation.

    SYSTEM_REGISTRY_2026-09-06:
      status: >
        CLOSED. Built lib/system-registry.js — a real, read-only
        aggregator over the 3 confirmed real sources (autopilot.js's
        ALL_KERNELS, service/nexus-diagnostic.js's SYSTEMS, lib/
        version.js's VERSION.modules), matching loom's proven aggregator
        pattern (event-taxonomy-map.js, phasemap-map.js) — zero write
        authority over any of the three, build()/get()/list() as its
        real API. CAUGHT BEFORE SHIPPING: the first draft used require()
        directly on autopilot.js and nexus-diagnostic.js — this HUNG the
        process (autopilot.js, likely via lib/resource-monitor.js) and
        would have started a second real HTTP server as a side effect
        (nexus-diagnostic.js calls server.listen() completely
        unconditionally, confirmed directly, no require.main guard
        anywhere in that file). Fixed with safe source-text extraction —
        bracket-depth-scanned the real ALL_KERNELS/SYSTEMS literals out
        of each file's source and evaluated ONLY those in an isolated
        Function scope, never executing either file's own top-level code.
        REAL BUG FOUND AND FIXED as a direct result of building this
        (exactly the value this module exists to provide): autopilot.js's
        own clear-glass kernel entry had healthUrl pointing at :7701 —
        confirmed that's clear-glass's real SSE event-stream port (GET
        /events only), not its HTTP server. Clear-glass's real HTTP
        server with an actual /health route is WIRE_PORT :7704
        (clear-glass/src/main/index.js:450's own header comment, cross-
        checked against README.md's own port table and clear-glass.spec
        — all three agree). service/nexus-diagnostic.js already had the
        correct port; autopilot.js did not. Fixed autopilot.js's
        healthUrl to :7704. Verified: driftWarnings went from 1 real
        entry to 0 after the fix. 9/9 real tests (tests/modules/test-
        system-registry.js) against the actual real files, no mocks —
        covers the hang/side-effect risk directly (timed, must complete
        under 3s), confirms bridge is genuinely gone from all 3 sources
        (not just ignored by this aggregator), confirms ollama-bridge
        isn't confused with it, confirms the clear-glass fix, and
        confirms get()/partialCoverage's correctness. Registered in
        tests/modules/run-all.js per §5.1.
      depends_on: []
      does: >
        One real, live, aggregated answer to "what systems exist, on
        what ports, with what data dirs and health checks" — derived
        from the three real sources, not a fourth list to maintain by
        hand. Already found and fixed one real, live bug (a wrong
        health-check port) purely by existing.

    FULL_COMPONENT_MAP_2026-09-06:
      status: >
        OPEN — the largest single ask in this message. James: "all the
        core files mapped and grouped into foundational components,
        with all the relevant hooks, wires, and intent... all the ids
        and types. other systems that connect, edge cases, and
        context. then each module, with the same thing." This is REG1
        from earlier in this phasemap, scoped precisely: REG1 already
        found hooks/index.js declares 78 hooks across 10 systems while
        the live boot log shows 15 systems and 1,796 components
        running — REG1's own re-walk is the necessary first step this
        larger ask depends on, not separate work. The "hooks, wires,
        intent... ids and types... connecting systems, edge cases,
        context" fields James is asking for per-component map directly
        onto what a real interaction-contract.json + a real event-
        taxonomy.js + a real per-tool contract (TC1, closed earlier this
        session for lib/agent-tools) already capture separately, per
        system — this phase is the aggregation of all three into one
        real, per-component record, not a fourth schema invented from
        scratch. Depends on REG1's re-walk, EVENT_TAX_ALL's coverage,
        and TC1-style contracts existing more broadly than just lib/
        agent-tools before it can be populated with real data instead
        of gaps.
      depends_on: [REG1_component_registry_remap, EVENT_TAX_ALL_2026-09-06, SYSTEM_REGISTRY_2026-09-06]
      does: >
        One real, queryable map of every core file's real identity,
        real connections, and real intent — built by aggregating what
        interaction-contracts/event-taxonomies/tool-contracts already
        state separately, per §8.6 (reuse before build), not a parallel
        fifth source of truth to drift from the other four.

    IDEARIUM_REPO_PER_SYSTEM_2026-09-06:
      status: >
        OPEN — James: "each system is an idearium repo compartment,
        using the spec file for the repo." Real precedent already
        exists and already works: architect's own real Forge→Idearium
        export (this session, verified end-to-end against idearium's
        actual reader) already proves a spec-container can become a
        real idearium compartment. This phase is that same real
        mechanism, run once per system, using each system's own real
        docs/<system>.spec as the container's buildSpec — not a new
        export path. Depends on SYSTEM_REGISTRY existing (to enumerate
        "each system" from one real source rather than a hand-typed
        list) and ideally FULL_COMPONENT_MAP (so each compartment's spec
        is the living, current one, not the stale snapshot this same
        phasemap already caught docs/nexus.spec and docs/guardian.spec
        being).
      depends_on: [SYSTEM_REGISTRY_2026-09-06]
      does: >
        Every system becomes a real, browsable idearium compartment
        whose content IS its own real spec file — reusing this
        session's own already-verified architect export path.

  recommended_start_2026-09-06: >
    Given the new work's real dependency shape: SYSTEM_REGISTRY_2026-09-06
    has zero dependencies and unblocks both FULL_COMPONENT_MAP and
    IDEARIUM_REPO_PER_SYSTEM — highest-leverage next step among the new
    asks. PULSE_ALL and EVENT_TAX_ALL are both independent, already-
    proven rollouts (real client, real pattern) that can run in parallel
    with SYSTEM_REGISTRY and with each other. LEDGER_PERDAY_PERSYSTEM
    still correctly waits on DF1/DF2 per the existing finding above — an
    unresolved, load-bearing dependency this new work does not change.
    CORTEX_BOOKKEEPER needs one explicit decision (read-aggregator vs
    write-target) before any code, the same category of decision as CP3
    and the still-open §5.2/§9.1 axiom question from the bridge removal
    — none of these three should be guessed at.

  recommended_start: >
    CORRECTED 2026-09-05 after reading guardian's real code in full:
    CG1 and CG2 turned out to already be real — nothing to build there.
    That leaves, per James's own explicit ordering (guardian + related
    working, then idearium end-to-end + persistent, UI last) and §16.1
    (closest gap decides the next task): DF1 and DA1 run first, in
    parallel — DA1 is now a small, precisely-scoped integration (one
    HTTP call, confirmed missing by grep) with an immediate, visible
    payoff; DF1 is the live crash/performance fix, independent of DA1.
    CG3 (the real remaining cross-system relay gap) can start alongside
    them — independent of DF1/DA1, and is what BR1 actually waits on.
    EVT1 and TC1 can also run alongside all of the above — independent
    of the guardian work, and both are prerequisites for CP1 and BR2
    later. VSB1 should be treated as urgent despite being newly found,
    not previously scoped: it is actively producing a wrong answer
    ("versionium has no commits") that was almost accepted as true
    earlier this session before being checked — the exact failure mode
    §0.1 exists to prevent, the same discipline that just caught CG1/CG2
    being wrongly scoped as open. Everything under "idearium end-to-end
    + persistent" (ID1, ID2, DF2) correctly waits on VSB1. All UI-tagged
    phases (IDU1, UX1, REPO_PAGE1's visible half) correctly run last,
    per §8.5 and per James's own instruction.

  history:
    - date: 2026-09-05
      summary: >
        Correction pass (§0.1 — evidence over prior conclusion), same
        day: read guardian/lib/ncp.js, guardian/server.js's NCP wiring
        block, and SISOStream.emit() in full before touching any code,
        per James: "guardian, that's key." Found the original RF1
        ("NCP liveness is console-only") and RF5's severity were both
        wrong — guardian already emits real bus events for NCP connect/
        disconnect/stale, and they already reach guardian's own /events
        SSE unconditionally via SISOStream.emit()'s cockpitBroadcast()
        call. Also found guardian's GET /providers (ncp.getProviders())
        is already a complete, live, heartbeat-verified connection map
        that clear-glass/src/mesh/agent-mesh.js simply never calls
        (confirmed: zero references to :7820/providers in that file).
        CG1 and CG2 closed as "already real, nothing to build." CG3
        narrowed to the one real remaining piece (cross-process relay
        into cortex's system-wide /sse). DA1 re-scoped from "build a
        live dispatcher" to "add one HTTP call to an existing one."
        Corrections made IN this file, not just stated in chat, per
        James's own repeated instruction not to lose things to the
        session.
    - date: 2026-09-05
      summary: >
        Full session: read AXIOMS-v3.1.md in full (89 laws, Groups 0-17)
        and warp.spec's five primitives + unified_dispatch pipeline
        before any mapping began. Mapped event-taxonomy coverage (5/14
        systems real, RAID's own taxonomy found documented but unwired),
        cortex's SSE broadcaster (1 hardcoded caller in the whole file),
        data-folder sovereignty (guardian sharing cortex's store,
        confirmed by direct config read), interaction-contract coverage
        (6/14 systems), and the cross-system require() graph (8/14
        systems requiring intelligence/ in-process). Read a real crash
        log James pasted (3.5 hours, ending in two process crashes at
        04:18) and traced the crash to the same shared-store finding
        already mapped, with quantified before/after row counts as
        proof. Found and corrected RF4 (versionium split-brain) after
        initially mis-reading the same evidence as "zero commits ever
        happen" — corrected via §0.1 once the actual write path
        (versionium's own sovereign store) was traced directly.

  session_close_2026-09-06_ctx93pct: >
    Context nearly exhausted — final summary before handoff, per James's
    own repeated instruction to never lose work to the session boundary.
    THIS SESSION'S REAL, VERIFIED WORK (33/33 assertions across 5 test
    files, all re-verified together in one consolidated tree just before
    this note): DA1 (agent-mesh guardian-coverage gate) — closed, shipped,
    confirmed live in James's own v0.39.50. Bridge — removed from tv-shell,
    diagnostic, autopilot; axiom §5.2/§9.1 amendment still NOT done, still
    the single highest-priority open item since it's constitutional, not
    code. Architect's Forge→Idearium export — built, verified end-to-end
    against idearium's real reader. SYSTEM_REGISTRY — built, then
    corrected (James caught "there is not 50 systems" — real bug, wrong
    VERSION key, fixed, now 15 real entries). PULSE_ALL — architect,
    eravos migrated and tested; emerge resolved by retiring its poller
    entirely (compile() called directly by copilot now) rather than
    working around pulse's port requirement; diagnostic and intelligence
    still open. The NCP/gm-shim fix (this session's last major finding) —
    GM_xmlhttpRequest now genuinely streams via a real ReadableStream
    reader, verified against both the broken and fixed versions with a
    real chunked HTTP server, not mocked.
    STILL FULLY OPEN, NOT STARTED: idea→spec→projects/chunks physical
    file layout (James wants /projects/<uuid>/chunks/*.md; real code
    currently writes /specs/<uuid>/*.md flat — confirmed 0 specs ever
    created in the live session data, so this path has never actually
    run); "cortex the bookkeeper" (needs the read-vs-write-target
    decision named earlier, never made); CP3 git-vs-versionium; BrainOS
    controlling agents via commands; clear-glass plugins/* (confirmed,
    still zero real events); guardian (not yet investigated this
    session beyond what NCP's fix touched); full component map;
    idearium-repo-per-system; event taxonomy expansion beyond the 3/36
    clear-glass files already covered; autopilot's own SSE endpoint
    (confirmed: does not exist at all — the literal prerequisite for
    "fed into the SSE into autopilot," never built).
    HANDED OFF AS: nexus-session-2026-09-06-patch.zip (16 files, real
    paths, drop-in) for the incremental work, and now a FULL project
    zip with git history intact per James's explicit "full zip, full
    git" request — the complete tree, not a patch, so nothing depends
    on a prior zip already being applied correctly.
    as_of: 2026-09-05
    entries:
      - id: SESSION1
        type: coverage
        summary: >
          This phasemap itself has not yet been checked against any
          .spec drift mechanism (orchestrator/lib/spec-drift.js) or
          registered in docs/SPEC-REGISTRY.md (§6.3 requires every
          spec be entered on creation). Both are real, small, and
          should happen the same session this file is dropped into
          the real repo.
        opened: 2026-09-05
      - id: SESSION2
        type: verification
        summary: >
          No file has yet been read to confirm exactly which code path
          emits versionium.committed at the observed high frequency —
          engine.js's real commit() is the confirmed candidate but
          orchestrator/lib/versionium-auto-commit.js (also live in the
          boot log, "listening for sigma.composite.warning/halt_risk")
          has not yet been read directly and could be a second, separate
          emitter worth checking before VSB1 is scoped further.
        opened: 2026-09-05

  version_history:
    - version: 0.2.0-phasemap
      date: 2026-09-05
      summary: "Correction pass — CG1/CG2 closed as already-real, CG3/DA1 rescoped, after reading guardian's real code in full. No code touched, mapping only."
      versioniumCommitId: null
    - version: 0.1.0-phasemap
      date: 2026-09-05
      summary: "Initial phasemap — full session capture, mapping only, no code touched."
      versioniumCommitId: null
