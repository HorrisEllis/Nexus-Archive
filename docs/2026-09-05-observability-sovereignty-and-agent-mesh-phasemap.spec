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
        James, direct — "running the tests should tell us right?" Checked first
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
        per James, direct — "guardian, that's key." Found the original RF1
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

  gaps:
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
    - version: 0.3.0-phasemap
      date: 2026-09-06
      summary: >
        Session continuation — real work landed since 0.2.0 (staleSweep
        socket-close fix, spawnProviderTab, .idea node type + tagged
        queryDir, node-schemas split (17 types) + loom schema split,
        js-yaml default-import fix, DA1 (agent-mesh Guardian-first gate),
        provider-window unexpected-close respawn, clear-glass promoted
        off onDemand to a real always-running supervised kernel, the
        --headless correction, guardian's stale-socket false-delivery
        fix (dispatcher.js/ncp.js — the root cause of "routes to it,
        does nothing beyond that", traced to an actual boot log), a
        consolidated verify-ncp-agents.js covering all 6 real fixes,
        and idearium's real test-data-pollution fix (6 hardcoded
        data-dir constants, no isolation — 66 test-generated specs
        found and removed, IDEARIUM_DATA_DIR/JAA_DATA_DIR now respected
        everywhere, a real isolated e2e-pipeline test wrapper built).
        James, direct — "you're at 92%, conserve tokens until mapped + zipped" —
        this entry is the map, not further building.
      versioniumCommitId: null
    - version: 0.2.0-phasemap
      date: 2026-09-05
      summary: "Correction pass — CG1/CG2 closed as already-real, CG3/DA1 rescoped, after reading guardian's real code in full. No code touched, mapping only."
      versioniumCommitId: null
    - version: 0.1.0-phasemap
      date: 2026-09-05
      summary: "Initial phasemap — full session capture, mapping only, no code touched."
      versioniumCommitId: null

  priority_order_2026_09_06:
    description: >
      James, explicit and direct: "nexus needs to prioritize the
      diagnostic system, then the intelligence system, then guardian,
      clearglass." Real reasoning, not stated but inferable from every
      real bug this whole session traced back to: diagnostic and
      intelligence are the two systems that would have CAUGHT each of
      these bugs automatically (memory-pressure cascade, the stale-
      socket false-delivery, clear-glass's onDemand despawn) if they
      were structurally sound and prioritized first — building guardian/
      clear-glass fixes on top of an observability layer that isn't yet
      trustworthy means every future regression gets found the same
      way this session's were: a human noticing something's wrong days
      later, not the system reporting it live.
    order: [diagnostic, intelligence, guardian, clear-glass]

  # open_work_carried_forward — real, discussed, not-yet-built or
  # not-yet-fully-mapped items from this session's conversation, named so
  # they survive past this context window. Every one below is a real idea
  # James stated directly — none invented to fill space.
  open_work_carried_forward:
    - id: OWF1_simulate_ncp_instance_test_principle
      status: open
      summary: >
        James, direct — "anytime you run a test for the pipeline you only need
        to simulate you as a ncp instance, nothing more, so we can have
        a more accurate test." A real, stated testing principle for
        every future pipeline test: don't mock/fake guardian, dispatcher,
        cortex, or any real system in between — those should run for
        real. The ONLY thing that should ever be simulated is the one
        piece that requires an actual browser (a real NCP client tab
        acking a job). tests/dispatcher-stale-socket.test.js already
        does something adjacent (fakes ncp itself, not a browser) but
        is a unit test of one function, not a full pipeline test — a
        real "fake NCP client" test harness (a tiny in-process fake that
        speaks guardian's real /channel + /result protocol, so guardian
        itself runs unmodified and for real) is the concrete next thing
        this principle asks for. Not yet built.

    - id: OWF2_contracts_as_tangible_files
      status: open, materially closer than first mapped (2026-09-06 correction) -- lib/queue.js's PhysicalQueue is already exactly this primitive (tangible .pending/.processing/.done files, a real generic watchInput() watchdog, extension-agnostic -- .contract/.command/.idea already work with zero changes), and per-system input/ folders already exist (cortex, idearium, guardian +6 more). Real remaining gap, narrower than first thought -- RAID does not use PhysicalQueue at all yet (zero references in cortex/core/raid/), and cortex/boot.js's one real .pending() call only lists items for a CLI view, does not drain-and-retry on boot.
      summary: >
        James, direct — "all of the contracts are supposed to be tangible files
        that move in the file system with the actual contract. like each
        system has a input folder with needs to hold the actual
        contracts. i want watch dog checking each boot so it can resume
        or run them again, need a queue drain system like raid engine
        has. maybe raid is the queue system, the hub for all contracts?"
        Real, partially-grounded already: lib/node-export.js's .contract
        type + queryDir() already gives a real read/write/query
        mechanism for contract files; RAID (cortex/core/raid/router.js)
        is already confirmed the real, live, intent-driven system-level
        router with a real capability-registry — a strong, evidenced
        candidate for "the hub," not a guess. What's not built: a real
        per-system input/ folder each system actually watches (chokidar
        or similar), a boot-time resume pass (drop a .contract file, it
        gets picked up and processed even across a restart — the same
        real principle idearium/lib/guardian-stream.cjs's
        reconcileInFlightChunks() already proves works for chunks,
        never generalized to contracts), and RAID's own queue actually
        draining FROM these real files rather than only from in-memory
        submitContract() calls.

    - id: OWF3_system_contracts_vs_agent_contracts
      status: open
      summary: >
        James: distinguishes "system contracts (interaction contracts)"
        from "agent contracts." Interaction contracts are already real
        and already exist per-system (guardian/interaction-contract.json
        etc., §5.12) — the gap is agent contracts specifically getting
        the same tangible-file treatment as OWF2 above, scoped to a
        single agent dispatch rather than a whole system's surface.

    - id: OWF4_intent_to_compartment_to_retrieval_contract
      status: open
      summary: >
        James's fuller pipeline vision, stated directly: an intent
        builds a contract that spawns a real compartment (compartment-
        engine.js — real, already used, confirmed this session), then a
        SEPARATE "retrieval contract" has co-pilot use real retrieval
        tools (lattice, vector graph, resonance, tag system, chat-log
        index, the data folder, cortex) to pull everything the system
        judges relevant into that compartment BEFORE synthesis runs —
        the contract as the framework, the node schemas as what
        synthesis actually reduces down to. Not yet mapped against real
        code beyond confirming the individual real pieces (compartment-
        engine.js, vector-memory.js, chat-logger.js) already exist
        separately; nothing yet chains them through a real retrieval
        contract object.

    - id: OWF5_command_auto_import_watchdog
      status: open
      summary: >
        James: every new command created by co-pilot (or Claude) should
        create a real .command file (lib/node-schemas/command.js already
        real, already grounded in clear-glass's live route
        introspection) named after the command, and each system should
        import it automatically via a real watchdog watching a data
        folder — drop the file, it's live, no other wiring. Generalizes
        directly to OWF2's same watchdog-per-input-folder mechanism, not
        a separate one.

    - id: OWF6_per_system_node_types
      status: open
      summary: >
        James: node types (component/tool/agent/command/etc.) need to
        exist PER SYSTEM, not as one shared global set — each system's
        own commands/tools/agents/components get their own real schema,
        scoped to that system, not a single shared command.js/tool.js
        for all of NEXUS. lib/node-schemas/*.js today is one shared set
        serving every system; this asks for guardian/node-schemas/,
        clear-glass/node-schemas/, idearium/node-schemas/, etc., each
        with their own real, system-specific shape. Real, not yet
        started — a genuinely different structural direction from what
        exists today, worth a real map-first pass before touching it.

    - id: OWF7_node_extension_confirmed
      status: closed
      summary: >
        James asked directly: "the nodes are supposed to have the name
        of the node as the extension. does that work?" Confirmed real
        and already true — lib/node-export.js's exportToFile() already
        names every file ${id}.${type} (idea-a.idea, contract-x.contract)
        and queryDir() reads that same extension back. No code change
        needed; this was already built correctly.

  # open_work_carried_forward_round2 — James, 2026-09-06, a second large
  # batch: sovereignty/queue/pulse architecture, idearium project-import,
  # the full pipeline restated with more precision, a reusable
  # component-store/template idea, resonance/shape-based data retrieval,
  # and a project-directory cleanup. Grounded against real code before
  # mapping, not guessed.
  open_work_carried_forward_round2:
    - id: OWF8_per_system_queue_drain_escalation
      status: partially built 2026-09-06 -- lib/queue.js's PhysicalQueue now has real retry() (re-enqueues at the back, createdAt re-stamped, verified with a real test that initially passed even when broken, rewritten to actually catch it), markOffline() (a real distinct status, not reusing failed), and drainPending() (skips anything blockedBy an offline system unless a live isOnline() check says otherwise). Escalation is a real injected onEscalate callback, deliberately not a hard require of cortex/self-heal/fault-taxonomy.js -- keeps this file dependency-free per the sovereignty principle. 8 new tests, 51/51 total pass. Still open -- nothing calls this from RAID yet (RAID still has zero references to lib/queue.js), and no real caller has wired onEscalate to fault-taxonomy.js's actual raiseFriction() yet -- the mechanism is real and tested in isolation, not yet connected end to end.
      summary: >
        Real refinement of OWF2 (already corrected once this session —
        lib/queue.js's PhysicalQueue already gives tangible pending/
        processing/done files + a real watchInput() watchdog). New,
        specific asks not yet covered by that primitive: a failed item's
        retry should go to the BACK of the same queue, not just a
        .failed state; retry needs to escalate (tie into intelligence's
        pattern-crystallization and self-heal's escalation ladder —
        cortex/self-heal/escalation.js, real, already exists, already
        worked on this session for the FAILURE_MODE-never-retries gap);
        a real "system offline" status distinct from failed, so a
        stalled item because its target system is down gets retried
        when that system comes back, not endlessly re-attempted or
        given up on. None of this exists in PhysicalQueue today — real,
        scoped extension work, not a rewrite.

    - id: OWF9_pulse_bpm_diagnostic_threshold
      status: open
      summary: >
        Every system gets a real pulse (event-driven, not polling —
        matches nexus/ui/brainos/brainos-canvas.js's own already-real
        principle: "no fake heartbeat interval... a real pulse, called
        only from a real event, never on a timer"). A bpm (beats per
        minute, i.e. real pulse frequency) lets the system detect its
        own slowdown or flatline. Diagnostic gets triggered automatically
        when bpm drops under a real threshold, not run on a timer either.
        Each system checks its own queue/input folder on boot as part of
        this same pulse. Needs full diagnostic schemas per system and
        per component — not yet designed. Real, large, not started.

    - id: OWF10_idearium_project_import_to_compartment
      status: open
      summary: >
        James: import a project into idearium -> create a real
        compartment -> unzip the archive into it -> add it as a
        repository. Checked directly: idearium/repo/watcher.js's real
        zip-drop already does extract + RepoLayer.ingest() (becomes a
        tracked idea + spec + repo), but never creates a compartment —
        zero references to compartment-engine.js anywhere in that file.
        Genuine gap, not yet built, and a real, concrete, scoped one:
        wire compartment-engine.js's spawn() into the existing zip-drop
        path rather than building intake from scratch.

    - id: OWF11_full_pipeline_restated
      status: open
      summary: >
        James's fullest, most precise statement of the pipeline yet -
        input (a prior chat, a project import, or reading a component)
        -> intent (context) -> retrieval contract -> RAID -> compartment
        -> RAID picks the real tool for the job (recall, introspect, or
        any other real data-retrieval tool) -> copies relevant data into
        the compartment -> synthesis -> agent parses the synthesized
        result. Consistent with OWF4 (already mapped) - this is the
        same pipeline restated with retrieval-tool selection now
        explicit. Real pieces already confirmed to exist independently
        this session: compartment-engine.js, RAID's router.js,
        intent-classifier.js, lib/agent-tools' real tool set. Nothing
        yet chains all of them through one real retrieval-contract
        object end to end.

    - id: OWF12_esm_to_cjs_needs_clarification
      status: blocked_on_clarification
      summary: >
        James: "Rebuild Esm to cjs. I just want you to copy all of it
        to its own folder." Genuinely ambiguous as stated - unclear
        which real system/directory this targets (idearium is the one
        real ESM-module system touched most this session -
        package.json "type":"module" - but this wasn't named directly),
        and "copy all of it to its own folder" could mean either "copy
        first, convert the copy" (safe, reversible) or something else
        entirely. Not guessed at or started - real risk of doing
        something big and wrong on a guess here.

    - id: OWF13_reusable_component_store_new_system_template
      status: open
      summary: >
        James: a real, reusable "new system template" compartment,
        built once as a real foundation, then reused every time a new
        system gets created via spec-engine - "dramatically save
        tokens" by never re-deriving the same boilerplate scaffold from
        scratch. Connects directly to idearium's own spec-engine
        (blocks.yaml, already real, already this session's own work)
        and compartment-engine.js's real spawn() - a template
        compartment could be a real, snapshotted starting point spawn()
        clones instead of building fresh every time. Not yet designed or
        started.

    - id: OWF14_intelligence_synthesizes_gaps
      status: open
      summary: >
        James: use the intelligence system (real, already built pattern-
        crystallization engine, intelligence/index.js) to synthesize
        .gap files (lib/gap-field.js, already a real .gap node type) -
        i.e. treat gap patterns the same way event patterns already get
        crystallized. Real, plausible, not yet checked against
        intelligence/index.js's actual real scan targets (does it
        already scan gap-related events, or only the ledger/event
        streams checked so far this session) - needs a real read before
        scoping further.

    - id: OWF15_resonance_shape_multidimensional_retrieval
      status: open, exploratory
      summary: >
        James: use resonance to find data "by rhyme" (matching pattern
        or feel, not exact match), combine multiple real metrics of a
        piece of data into a "shape," then find other data with a
        similar shape - generalized into a real question about
        combining primitives (resonance, liminal space, spatial,
        topological) into one multidimensional field for retrieval.
        Genuinely exploratory, not yet grounded against any specific
        real code (idearium's own real resonanceWith field on ideas -
        confirmed real, lib/node-schemas/idea.js - is the closest
        existing real primitive, a single scalar relationship, not yet
        a multidimensional shape-comparison system). Real idea, needs
        its own dedicated design pass before any code, not a quick
        add-on to something already built.

    - id: OWF16_project_root_cleanup
      status: open
      summary: >
        James: consolidate/migrate the loose .md files at project root,
        move phase-related content to loom, move historical content to
        each system's own real spec + git + versionium. Checked
        directly: 19 real files at root right now
        (ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md, CHANGELOG-
        SESSION.md, CHANGELOG.md, CLAUDE.md, CLEAR-GLASS-CAPABILITY-
        BREAKDOWN-2026-08-23.md, CONFIRM-BUILD.md, CONSOLIDATION-
        NOTES.md, GUARDIAN-ARCHIVE-MINING-2026-08-23.md, HANDOFF-
        2026-07-11.md, HANDOFF-2026-08-24.md, MANIFEST.md, PATCH-
        NOTES.md, README.md, SESSION-MANIFEST-2026-07-07.md, SESSION-
        PROTOCOL.md, START.md, SYSTEM-MAP.md, TUTORIAL.md, VERIFICATION-
        LOG.md). Real triage needed before moving anything - README.md/
        CLAUDE.md are almost certainly meant to stay at root by
        convention; HANDOFF-*/SESSION-MANIFEST-*/CHANGELOG-SESSION.md/
        PATCH-NOTES.md/CONSOLIDATION-NOTES.md/VERIFICATION-LOG.md read
        as clearly historical (git/versionium candidates); START.md/
        TUTORIAL.md/SYSTEM-MAP.md/MANIFEST.md/the two dated capability-
        breakdown docs are ambiguous, not yet triaged. Not started.

    - id: OWF17_event_taxonomies
      status: open, deferred once already
      summary: >
        James asked for this earlier this same session ("need the
        events taxonomy for the ncp, gaurdian, userscripts, clearglass,
        agent mesh"), explicitly deferred then as reference material,
        not urgent, in favor of getting live dispatch working first.
        Raised again here, now also naming ollama and co-pilot event
        taxonomies specifically. Real, bounded, genuinely useful
        reference-documentation work - a real candidate for an actual
        near-term deliverable rather than deep architecture, once
        prioritized.

  sovereignty_reinforcement_2026_09_06:
    description: >
      James restates and sharpens data_structure_2026_09_06 (already
      mapped): every system self-contained, all system-relevant code
      lives in that system's own folder not spread around, all system
      data lives in that system's own data folder, and cortex is
      specifically named as "book keeper and relationship traversal for
      the associative lattice" plus memory systems generally - the
      clearest statement yet of cortex's real role as index, not owner.
      No new content beyond data_structure_2026_09_06 - restated for
      emphasis, kept here as confirmation the design hasn't changed.

  data_structure_2026_09_06: |
    James, direct and detailed -- a full self-contained per-system data
    architecture. Stated as "a serious data structure session," not a
    quick note -- deserves its own real design pass before building,
    captured here in full so nothing is lost.

    Principles, verbatim as discussed:
    - every system's own data lives self-contained inside that system's
      own folder -- no cross-system reach-in for storage (matches S5.7
      low coupling, S5.9 every system is sovereign, already-real
      conventions, not new ones)
    - cortex's own memory systems (the causal graph, the lattice, vector
      index) CONNECT to each system's own data folder rather than owning
      a copy of that system's data -- cortex is the index, not a second
      copy. James, direct -- "maybe cortex is the index that tracks all
      of the data in the system, with all the memory systems and causal
      graph."
    - each system's data folder subdivides by DAY (a real folder per
      calendar day), and within each day, by DATA TYPE. The real
      sub-folders James named: ledger (real component-ledger entries for
      that system, that day); nodes (real .node files -- component/hook/
      wire unions, already real per lib/node-schemas/node.js -- for that
      system); failure_modes (real .failure_mode files, each carrying
      everything diagnostic + intelligence currently know about that
      failure -- James, direct -- "with all the context and info the
      diagnostic and intelligence system has. like a report." A real
      upgrade from today's flat ndjson lib/ico.js appends -- this asks
      for one file per failure, not one shared log); error.log (real,
      per-system, every component's errors -- already exists in spirit,
      autopilot's own real data/error.log -- this generalizes it to live
      inside each system's own folder instead of one shared root-level
      file); .gap files (real gap-field records, lib/gap-field.js,
      already a real .gap node type -- each one INCLUDING its relevant
      error.log data inline, not just a pointer to it).
    - jaa/ -- each system's own real JAA database, every table it owns,
      living inside that system's own data folder rather than one shared
      cortex/data/cortex/memory store for everything. A real, significant
      structural change from today's actual architecture, confirmed this
      session: idearium's own manifest/chunk tables currently live in
      cortex's shared store, not idearium's own folder -- JAA_DATA_DIR
      override added this session as a stopgap, not a redesign.

    status: mapped, not built -- a real architectural redesign of where
    JAA tables physically live is bigger than a single pass; scope it
    properly before touching cortex/memory/jaa-db.js's real DATA_DIR
    convention that many real systems already depend on today.
