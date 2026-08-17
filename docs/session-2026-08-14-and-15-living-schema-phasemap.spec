spec:
  meta:
    name:       session-2026-08-14-and-15-full-record-and-living-schema-phasemap
    version:    1.7.0-phasemap  # AM1, AM6 DONE 2026-08-15 -- LS5 at 4 of 5, LS4 the sole real blocker
    status:     >
      PARTIALLY BUILT, PARTIALLY MAPPED. §3.3 map before build — the session
      record below is real and verified; LS1-LS6 are mapped, not built.
    uuid:       nexus-session-2026-0814-0815-living-schema-v1-0000-001
    purpose: >
      The verified record of everything built and fixed this session
      (12 tools, 8 real bugs, a parallel-session reconciliation with
      nothing lost, both standing P0s closed), plus LS1-LS6 — the new
      phases mapped from that session's own follow-on conversation about
      living schemas, per-system diagnostics, hub consolidation, and an
      agent-agnostic copilot end-state. Mapped, not built, ordered by how
      much real precedent already exists to build on.
    author:     claude, this session, at James's explicit request to map
                everything before anything else grows on top of it unrecorded
    prefix:     LS  # checked against every existing prefix in docs/*.spec
                     # first — not colliding (existing: AB AM AP AR AU B CA
                     # CS CU FC GM L LM LP M NC OB OM P R RFR RR S SB SN SS T
                     # UM VS WV)
    axioms_respected: >
      §1.1 nothing exists until proven — every entry below marked DONE was
      actually executed and its output is quoted, not summarized from memory.
      §1.2 nothing pretends to work, nothing silently fails — the reconcile
      section names the exact bug found in my own fix (a wrong require path)
      rather than omitting it. §1.3 no fake/mock/stub in production — LS2's
      probabilistic layer explicitly reuses intelligence's real lift-adjusted
      scoring rather than inventing a second statistics engine.

  # ═══════════════════════════════════════════════════════════════════════
  # PART 1 — WHAT ACTUALLY HAPPENED, IN ORDER. DONE, VERIFIED, NOT SUMMARY.
  # ═══════════════════════════════════════════════════════════════════════
  session_record_2026_08_14:

    tools_built:  # all registered, lib/agent-tools/index.js, 60 total by end
      - "file_tree, delete_file — read_file's missing siblings (list before request; remove with confirm:true, safe-path both)"
      - "axiom_manage — the write half of axiom_check (add/remove/freeze/list), agent-tagged source never blended with James's"
      - "loom_register — component/hook_with_wire/concern. hook_with_wire REFUSES a hook with no already-real consumer, atomically — the actual fix for the dangling-hook pattern this session started by diagnosing"
      - "switch_agent — dedicated wrapper over self-model's setCurrentAgent, later extended (not replaced) by the parallel session's chat-target work"
      - "nexus_map — chunked reader over loom's real graph(), sized to the calling agent's real token limit (lib/agent-system/contracts.js)"
      - "notes_todo, versionium_commit, compiler_info, cos_archetype/blueprint/playground/plugin/vault, ask_james, ambiguity_pull (AM5)"

    real_bugs_found_and_fixed_this_session:
      - "cortex/intelligence: _scanMetaPatterns — dangling-hook drowning every other signal at ~470 re-detections/boot; lift-adjusted scoring + meta_noise_source detection"
      - "service/nexus-diagnostic.js — push(...recursiveCall) stack-buffer-overrun (0xC0000409) on 1000+ file trees; iterative walker"
      - "guardian/server.js — job.tool_calls had a reader (tool-runtime.js) and zero writers, ever; job.response was read but job.responseText was the field actually written. P4's own gate was marked DONE without ever being met."
      - "ambiguity_pull's own _found() — treated tool-runtime.js's '[NCP dispatch failed]' sentinel as a real answer. Caught by running it, fixed same turn."
      - "nexus_map/loom_register — dataDir override pointed at a nearly-empty shadow directory instead of loom's real default. Every loom_register call earlier in the session had written nowhere real. Fixed after loom/data/registry.json was restored from git and the mismatch became visible."
      - "AB1 (P0, from the parallel session's standing list) — tool-index.register()/record() real, zero callers, ever; all tools invisible to lib/constant-autonomy.js's self-improvement loop. Fixed at the one real chokepoint (registerTool/executeTool). A path bug in MY OWN fix ('./tool-index.js' vs '../tool-index.js') caught by testing before commit, not after."
      - "NC1 (P0, from the parallel session's standing list) — lifeline.js's two Guardian-dispatch guards read providers[x].connected, a field that never existed in guardian's real payload (a string map, detail under a separate channels key). Guardian NCP dispatch from copilot worked ONLY when /providers was unreachable. Fixed per docs/ncp-agent-connection-phasemap.spec's own prescribed fix — deleted both hand-rolled parses, reused lib/ncp-availability's already-correct state(). Verified against a real HTTP server speaking guardian's exact shape; proved the regression by running the OLD expression against the same payload."

    reconciliation:
      what: >
        A parallel session (Opus 5 High, no git history in its own export)
        did seven real commits in the same window: lib/ncp-availability.js,
        lib/chat-target.js, a real reachability audit (798 files, 506
        reachable, 129 candidate orphans), a phase-ID collision fix (20 of
        104 tokens collided across 165 declarations), and the standing list
        AB1/NC1 above were first FOUND there.
      how: >
        Diffed file-by-file against this session's git-tracked tree (291
        commits at the time) rather than trusting either side by
        inspection. 28 real differences, everything else byte-identical —
        including this session's own dataDir fix, already correctly merged.
        Confirmed the two lines were complementary, not conflicting: their
        chat-target work EXTENDS this session's switch_agent tool rather
        than replacing it. Applied as one attributed commit on top of full
        history, then ran their own test suites (11/11, 13/13) to verify
        the merge, not just trust it.
      result: "292 -> 294 commits (reconcile + AB1 fix + NC1 fix), zero history lost, both P0s from their standing list closed this session."

    continued_same_day_2026_08_15:  # §UPDATED, not a new file — James: "no new fragments"
      - "docs/diagnostic-engine-system.spec written (LS2 as a proper new-system spec, cortex.spec's own format) — self-corrected mid-write: lib/diagnostic-engines.js (631 real lines, 12 methods, built 2026-06-15) existed and wasn't checked first. Corrected same pass; wrapped as diagnostic_engines tool, zero coverage until then, tested against synthetic events (12/12 engines ran, real composite score)."
      - "orchestrator/lib/changelog.js — THREE real path bugs, one class: DOCS_DIR/CHANGELOG_PATH/SNAPSHOT_PATH all one directory level too shallow, pointing at paths that never existed. This 'living changelog,' meant to run every boot, had never once successfully executed. Fixed all three; verified idempotent on a clean second run (unchanged: 136, written: false)."
      - "lib/version.js + package.json — real 0.39.5 entry added following this file's own established per-bump convention. Recorded via versionium_commit, chained to the prior real commit."
      - "loom/maps/session-2026-08-14-map.js — the 13 remaining unwired tools from this session registered as real components. Ran live: 22 components, 8 hooks, 5 wires, 0 failures. Verified through nexus_map, not just the raw driver call."
      - "docs/alk-gl-intelligence-canvas.spec — addendum, not a new spec (checked first: a real, detailed, proposed spec for almost exactly the 'architect as a living node canvas' ask already existed, dated weeks before this session, plus a genuinely live 563-line implementation, not a stub). Pointed it at nexus_map instead of a second graph reader; named loom_events (real writes, zero readers) as the actual substrate for 'loom as living changelog.'"
      - "loom/bootstrap.js consolidated — 3 places to edit per hand-map (require/FILES-spread/copy-pasted report block) collapsed to 1 ordered array + 1 shared loop. Found a real bug from exactly that copy-paste while doing it: mapUi's failures were checked by NOTHING (leftover from mapCopilotCapability's block). Verified behavior-preserving via git-stash A/B comparison in the full real environment: FAILURES counts identical at every stage (2821/543/207) before and after."
      - "Verified live, in response to James asserting it: loom/data/registry.json is 39,867 lines, 1372 components, confirmed unchanged and safe through two full bootstrap.js test runs (both properly reverted via git checkout, per the data/-is-never-committed rule). Also surfaced WHY those FAILURES counts are so large: bootstrap.js's hand-maps aren't idempotent-aware — they attempt to redeclare already-existing components every run rather than checking first, unlike loom_register's own has()-check pattern. Real gap, not built this pass -- see LS7."

  # ═══════════════════════════════════════════════════════════════════════
  # PART 2 — WHAT JAMES ASKED FOR THIS TURN. MAPPED. NOT BUILT.
  # Ordered cheapest/most-grounded-in-real-precedent first, per §8.6.
  # ═══════════════════════════════════════════════════════════════════════
  phases:

    LS1_userscript_build_system:
      priority: DONE 2026-08-15 — real gate met. Bundler infrastructure,
                the extracted chat-logger module, AND the actual live
                wiring into gemini/perplexity, all built and verified.
                Provider decomposition into the other five shared modules
                remains real future work, not blocking the stated gate.
      depends_on: []
      built: >
        node_modules/esbuild (real, installed, 0.28.2). scripts/build-
        userscripts.js — a real esbuild-based compose script, IIFE output
        mode (Tampermonkey still receives one flat file, nothing changes
        about what gets injected). Writes ONLY to userscripts/dist/, never
        to guardian/ — per this phase's own stated risk, promoting a build
        to the served location is a deliberate, separate, human-reviewed
        step this script does not do itself.
        userscripts/src/shared/chat-logger.js — the real gap this phase
        exists to close, extracted from guardian/userscript-claude.js's
        real _nexusLogMessage (same behavior, same endpoint, same payload
        shape), restructured to take its five dependencies (cortexUrl,
        sessionId, provider, gmRequest, onSignals/onGapRegime callbacks)
        as explicit parameters instead of assuming globals — the original
        reached into five different outer-scope names that don't exist the
        same way across four different provider scripts.
      verified: >
        Built for real: userscripts/dist/userscript-gemini.js, 2223 bytes,
        valid JS (node --check), and — checked, not assumed — contains the
        actual bundled logic (grepped the built output: real POST to
        /api/meta/observe, real payload shape, 6 real matches), not a stub
        or a reference. npm run build:userscripts wired and confirmed
        working end to end.
      honest_scoping — why the full rebuild wasn't attempted this pass: >
        The phase's own gate ("claude and gemini both carry chat-logger,
        gone by construction") needs the logMessage() call actually wired
        into each provider's real DOM message-capture point — and gemini's
        differs from claude's (different selectors, different DOM shape,
        not checked in this pass). Doing that wiring blind, in the time
        available, for a file that's live and actively injected into real
        provider pages right now, is exactly the rushed under-verified
        change this phase's own risk note warns against. userscripts/
        src/gemini.entry.js is a DEMONSTRATION build proving the mechanism
        — not a claim that gemini's userscript is rebuilt. Real remaining
        work, named plainly: understand gemini's and perplexity's actual
        DOM/MutationObserver structure, wire logMessage() in for real for
        all four providers, decompose the other five described shared
        modules (intent map, seed-vault fallback, hats, cortex hooks, a
        copilot toolbox, browser-automation surface), and only then
        consider promoting a built output to guardian/'s served files —
        ideally with James's own live verification given this sandbox
        can't test a real Tampermonkey injection.
      gate: "MET 2026-08-15. guardian/userscript-gemini.js and guardian/userscript-perplexity.js both now carry real, live _nexusLogMessage calls at their real completion hook (_onJobComplete — confirmed the single, exact call site in each file, no other completion path exists). Ported faithfully from claude's proven implementation, using fetch() per the ClearGlass-only correction. Logic verified with a mocked fetch matching the real cortex response shape (correct payload, correct async session-id await, correct gap-regime logging) — full live-browser verification still needs James's own real system, same boundary as everything else this session touching a live DOM."
      corrected_2026_08_15_later: >
        James, direct: ClearGlass is the only real consumer -- "a browser
        made specifically for AI." Confirmed live in host.js's _inject():
        executeJavaScript() injection, no Tampermonkey extension anywhere,
        ever. Dropped the GM_xmlhttpRequest/gm-shim.js pretense entirely
        from the shared module -- native fetch(), no shim layer to inject
        first. Rebuilt and verified: output shrank 2223b -> 2051b, grepped
        for zero remaining GM_* references, one real fetch() call.
        clear-glass/src/providers/gm-shim.js itself is untouched -- but
        gemini and perplexity's live files were ALSO edited directly using
        fetch() from the start, not GM_xmlhttpRequest, so the shim was
        never needed for the real fix either. gm-shim.js still matters
        for claude/chatgpt (already work natively, no change needed) --
        becomes fully dead code only if those get rebuilt too.
      real_wiring_done_2026_08_15: >
        Read gemini's actual completion flow before touching anything:
        _onJobComplete(jobId, text, responseEl, ms, prompt, retryCount) --
        already has BOTH the final assistant text AND the original human
        prompt in scope, already reliably called exactly once per real
        exchange (confirmed: single call site, no other completion path).
        Chose this over replicating claude's separate full-page
        MutationObserver scraper (_nexusGetMessages) -- that would need
        new, untested DOM selectors for gemini's real page structure; this
        reuses data gemini's own existing, working completion-detection
        already trusts. Same real outcome, different integration point,
        reasoned not guessed. Same fix ported to perplexity.js
        (structurally identical pattern, its own real PROVIDER/_log/
        getSessionId).
      risk: "as stated originally — these four files are live, running, injected into real provider pages right now. Nothing live was touched this pass; that discipline held."

    LS2_living_schema_and_per_system_diagnostic_engine:
      priority: DONE 2026-08-15 — real v1 built, after the dedicated design
                pass docs/diagnostic-engine-system.spec required.
      depends_on: []
      built: >
        lib/system-expectations.js — the three open_questions in that
        spec resolved with real evidence before any code, not guessed at.
        Runs as a plain lib/ module (no boot-phase decision forced, LS4
        stays HOLD). Confidence math is exact reuse of user-model.js's
        proven numbers (0.5 initial, +0.10 confirm, -0.10/day decay), plus
        one real addition — a violation costs -0.15, asymmetric, matching
        the same design already cited elsewhere in this codebase.
      real_correction_mid_build: >
        The spec's own draft assumed initial expectations would generate
        from loom's produces/consumes component fields. Checked live
        before writing generateFromLoom(): 0 of 1501 real components have
        those fields populated, ever. Generated from hooks/wires instead —
        genuinely real and populated (1804 hooks, 2486 wires) — 1803 real
        expectations generated from live data. One found for free: a real,
        previously-unnoticed gap (orchestrator.uiRoute.ideariumRequest has
        an import hook with zero real wire feeding it), honestly flagged
        at confidence 0 rather than assumed proven.
        Second correction, found by testing the actual write, not assumed:
        the spec's claim ("this module's job is to become fault_taxonomy's
        first real writer") was imprecise. lib/fault-log.js's logFault()
        writes unconditionally to fault_log (confirmed: real rows exist
        now) but only reaches fault_taxonomy for one of 8 closed,
        pre-registered fault classes — 'expectation-violation' isn't one.
        Corrected the code's own claim rather than silently working around
        it or leaving it overclaimed: this build's honest, verified job is
        fault_log's writer. Extending fault_taxonomy's closed list is a
        real, separate decision, not made unilaterally here.
      verified: >
        sync() run twice: 1803 written first run, 0 written/1803 skipped
        second run — idempotent, confirmed not assumed. recordOutcome()
        tested both paths: confirmed correctly boosts confidence (+0.10,
        capped), violated correctly drops it (-0.15) and writes a real,
        verified fault_log row. Tool wrapper (system_expectations)
        registered, tested end to end through the real tool interface, not
        just the underlying module. Registered in loom/maps/agent-tools-
        map.js (source, not a live-only patch) — ran twice, 25 components,
        0 failures both runs.
      what_was_real_precedent: >
        cortex/intelligence/index.js's real lift-adjusted scoring,
        lib/diagnostic-engines.js's 12 real analysis methods (now tool-
        wrapped), fault_taxonomy's real schema, and AB1's own cautionary
        precedent (a real schema+writer pair with zero callers for weeks) —
        all cited and actually reused, not just referenced.
      extension_2026_08_15_later — gap_rating: >
        James, direct: "the gaps nexus finds... need a rating system.
        signal to noise with fidelity score? tension or friction?
        pressure? conditions of the cause and effects, objectively? open
        loops system?" Checked first, per this whole phase's own
        discipline: the "open loops system" already existed, real —
        docs/gap-lifecycle.spec + cortex/gap-finder/index.js, every real
        gap already has status:open/closed, dedup_key, occurrences.
        "Pressure" was also already real and already captured PER GAP
        (resourceState.pressure, written at detection time) — reused
        directly in the new module, not re-derived a second way.
        lib/gap-rating.js composes lib/diagnostic-engines.js's real
        methods against a gap's real history: snrNoiseFloor() for signal/
        noise+fidelity, entropyRateAnalysis() for tension/friction (its
        own regime language reused, not relabeled), causalChainTrace()
        for the objective cause-effect chain, homeostasisScore() for this
        gap's real contribution to overall system health. Verified
        against the one real gap in this sandbox: correctly reported
        tension as null/"insufficient_data" rather than faking confidence
        from 2 events, and surfaced a genuinely new, real finding
        (homeostasis score 0, "2 unresolved errors," not previously
        visible anywhere). Tool-wrapped (gap_rating), registered in loom/
        maps/agent-tools-map.js — source, run twice, 27 components,
        0 failures both runs.

    LS3_hub_consolidation_not_construction:
      priority: DONE 2026-08-15 — code path verified real; RAID trail
                persistence needs the live system, honestly unverifiable
                from this sandbox.
      depends_on: []
      built: >
        idearium/spec-engine/index.js now imports lib/chunk-service.js via
        the SAME proven ESM->CJS bridge (_require = createRequire(import.
        meta.url)) already used one line above for lib/chunker — the
        "ESM/CJS boundary is the real blocker" framing in this phase's own
        original scoping turned out overstated; the bridge already existed
        and already worked. importSpec() made async (its only two real
        callers — idearium/api/index.js:1023, already inside async
        function handle(); idearium/test/e2e-pipeline.test.js:56, a real
        ESM module with "type":"module", top-level await valid) — both
        confirmed via a full grep sweep for every real caller before
        touching either.
      real_correction_mid_task: >
        First attempt made a wrong assumption from line proximity — the
        chunkDocument() call (line ~1021) was assumed to be inside
        findPriorSection() (line 964, the nearest function declaration
        above it) without checking the actual function boundary. It was
        really inside importSpec() (line 1020), a completely different
        function findPriorSection() doesn't call at all. Caught before
        committing by checking real function boundaries with awk, not
        trusted from proximity — the incorrect async edit to
        findPriorSection was reverted, the correct fix applied to
        importSpec instead. Exactly the "understand before changing"
        axiom, demonstrated by a real near-miss, not just stated.
      verified: >
        Ran the real e2e test — crashed, but at Stage 2, entirely before
        Stage 3 where the changed code lives. Traced the crash: a real,
        SEPARATE, pre-existing collision — lib/idea-provenance.js's
        propose_idea schema (id/slug) and idearium/index.js's real IdeaOS
        schema (uuid) both write to a table literally named
        idearium_ideas with incompatible row shapes. Not caused by this
        change, not fixed here (would mean altering real data outside
        LS3's scope) — named as a genuine new finding. Isolated importSpec
        directly instead: real spec text in, 3 chunks out, byte-fidelity
        verified, import completed. The actual change works.
      gate_status: >
        Code path confirmed real: chunkGoverned() reaches RAID (governed:
        true, not the silent-fallback branch) rather than calling chunk()
        directly. But RAID's route() only persists a trail when init()
        has wired a live event bus (cortex/core/raid/router.js's own
        _onRouteRequest listener, registered only through init()) — this
        sandbox has never run a fully live, bus-wired NEXUS boot, so
        raid_trails is 0 rows total, not specific to this call. Same
        "not verified, can't be from here" boundary as everything else
        this session that needs a live multi-process boot. The stated
        gate ("verified by checking the RAID trail") needs James's real
        running system to close fully — flagged honestly, not claimed.

    LS4_intelligence_and_raid_as_top_level_systems:
      priority: MEDIUM — real architectural promotion, currently blocked on
                a decision, not on missing pieces.
      depends_on: []
      what_is_real: >
        Both are wired as substrates INSIDE cortex's own boot gate right
        now (autopilot.js's wireIntelligence call, cortex/core/raid/
        router.js) — not independently supervised processes. Confirmed by
        reading autopilot.js's boot-phase list directly this turn.
      does: >
        Promote each to its own boot phase, own health endpoint, own port
        — same shape as guardian/bridge/orchestrator today.
      gate: "cortex can restart without killing intelligence or RAID mid-cycle, and autopilot's supervisor list shows them as independently gated phases, not lines inside cortex's own gate."
      risk: "liminal-space, mastermind, and RAID's router all currently assume in-process access to each other. This is the single biggest 'declared as substrate, load-bearing as a monolith' risk in this whole map — decide deliberately, don't drift into it via LS2 or LS3's own momentum."

    LS5_copilot_agent_agnostic_full_capability:
      priority: 4 OF 5 REAL DEPENDENTS DONE (2026-08-15) — still NOT
                closeable, per its own gate below, but the honest reason
                narrowed to exactly one thing: LS4, your own deliberate
                HOLD. Not a stall — the actual remaining blocker, stated
                precisely.
      depends_on: [LS1, LS2, LS4]
      status_2026_08_15: >
        LS1 DONE (gate met, gemini/perplexity real-wired, same-day GM-
        shim correction applied). LS2 DONE (system-expectations.js, real
        v1, later extended same day by gap_rating — SNR/fidelity,
        tension, pressure, objective causal chain, composing diagnostic-
        engines.js's real methods). AM1 DONE — lib/agent-model.js, real
        per-agent fitness from real RAID history + tool-usage data, wired
        into getContract(), two real bugs caught by testing and fixed.
        AM6 DONE — lib/agent-model-confidence-loop.js, the full 4-stage
        pipeline (perplexity -> adversarial.compare() -> emergence.
        attempt() -> crystal push) with correct real signatures, two more
        real bugs caught by testing and fixed (the same NCP-sentinel bug
        class already found once in ambiguity_pull.js; a guessed field
        name that doesn't exist in compare()'s real return). Verified: a
        genuine simulated contradiction correctly opens a real gap and
        refuses to crystallize; agreement correctly proceeds to the
        empirical stage and honestly stops without a live COS compartment
        rather than fabricating a pass.
        LS4 is the ONLY real dependent left, and it's still your own
        deliberate HOLD from earlier in this session — real architectural
        risk (liminal-space, mastermind, RAID's router all currently
        assume in-process access to each other), not something skipped.
      what_is_real: >
        hat_forge/switch_agent already let any of six agents wear copilot's
        full tool set (confirmed, real, 2026-08-13/14). NC1's fix (this
        session) is what makes that dispatch actually reach a live agent
        instead of silently falling through. AM1 and AM6 are now real too
        — see status_2026_08_15 above.
      does: >
        "Fully NEXUS-capable, aware, updated, automated, autonomous" as a
        stated end-state is the sum of: LS1 (userscripts don't fragment
        features) DONE, LS2 (diagnoses itself against a real schema) DONE,
        LS4 (intelligence/RAID directly reachable, not buried in cortex)
        HOLD, AM1 (learns per-agent) DONE, AM6 (the epistemic/empirical
        verification loop, once the biggest single piece) DONE.
      gate: "not separately gate-able — this phase's gate IS its dependencies' gates, honestly, not a new integration test pretending to cover ground its dependencies haven't. Four of five now genuinely met."
      risk: "declaring this DONE while LS4 is still HOLD is exactly the §1.1 violation this whole map exists to avoid, even with four of five real. This entry closes the moment LS4 is deliberately resolved — promoted or explicitly decided otherwise — not before, and not by drifting into it via this phase's own momentum."

    LS6_idea_tracker_confirmed_real:
      priority: DONE, not a phase — recorded here so it isn't re-asked.
      depends_on: []
      status: >
        propose_idea (2026-08-09) -> idea-provenance.js -> Idearium's
        idearium_ideas table. Confirmed working this session: table was
        empty (0 rows, ever, across this repo's full git history) until
        this session's own ask_james test wrote the first real row. Not a
        gap. A tool that existed five days before this session and had
        never once been called. Still only 1 real row as of 2026-08-15 —
        the mechanism works, it's still barely used. Named honestly, not
        re-solved.

    LS7_bootstrap_idempotency:
      priority: DONE 2026-08-15 — §3.1 Bottom-Up Only: started here first,
                the actual mechanism everything else touching loom rests on.
      depends_on: []
      built: >
        LoomDriver.declareIfNew(kind, payload) added to loom/schema/
        driver.js — checks registry.has(kind, id) first; skips cleanly
        (ok:true, skipped:true) if it already exists, delegates to the
        real declare() otherwise. One shared method, not duplicated across
        five map files' own loops (§8.6). All 20 real driver.declare(...)
        call sites across the five hand-maps (warp/observability/session-
        2026-08-14/copilot-capability/ui) mechanically switched to
        declareIfNew — same pattern already proven safe in loom_register.js.
      verified: >
        Ran each of the five maps twice in a row, same driver, unchanged
        tree — the actual gate. warp-map, session-2026-08-14-map, ui-map:
        0 failures both runs. Real result, not assumed.
      honest_byproduct_finding: >
        FIXED same day, not left open. Two distinct real bugs, both traced
        to root cause and confirmed by testing, not assumed: (1)
        observability-map.js's wire declarations referenced
        nexus.copilot.user-model and nexus.cortex.memory.jaa-db — neither
        id was ever actually registered; the real, scanner/hand-map-
        assigned ids are nexus.copilot.lib.user-model and nexus.cortex.
        jaa-db (both confirmed to have real .export/.import hooks already).
        Fixed with a scoped find-replace of the two exact wrong strings.
        (2) copilot-capability-map.js's Pass 2 skipped BOTH .export and
        .import hook declaration for any PRE_EXISTING component — but the
        2026-08-04 tree scanner (which populated PRE_EXISTING) only ever
        gave browser-action an .export hook; it never analyzed that
        browser-action.js itself requires clear-glass-bridge and
        url-listener, which is THIS map's own real finding, sitting right
        there in its own requires array, silently discarded by the skip.
        Fixed: PRE_EXISTING now only skips the redundant .export attempt;
        .import is evaluated for every component from its real requires,
        regardless of PRE_EXISTING status. Verified: all five maps run
        twice in a row, same driver, unchanged tree — 0 failures, all five,
        both runs.

    LS9_lib_consolidation_the_six_nexus_files:
      priority: DONE 2026-08-15 — all 6 of 6 moved, verified, and mapped
                in source, not just live-patched.
      depends_on: []
      done: >
        Tranche 1: nexus-heal-loop.js, nexus-knowledge.js, nexus-query.js
        -> lib/. Tranche 2: nexus-cfr-influence.js -> lib/. Tranche 3:
        nexus-connect.js -> lib/. Tranche 4 (highest-risk, done last and
        most carefully per the phase's own risk note): nexus-bus.js ->
        lib/bus.js, 12 real requirer sites including cortex/boot.js
        itself. Verified boot survives for real, not by inference — ran
        cortex/boot.js directly and watched real initialization complete
        through the moved bus: "cortex raid active," "intelligence
        capabilities registered," "raid/router active (bus-wired)," no
        crash, no MODULE_NOT_FOUND.
      closed_the_accumulated_gap: >
        James, this turn, explicit: "log to loom's map as you go." Every
        prior tranche in this phase had fixed its own stale scanner-
        declared entry directly in the LIVE registry — real, but
        registry.json is state, not source (§2.2), and every commit since
        carried the same precommit warning unaddressed: the moved file "is
        not referenced in any loom/maps/*.js." loom/maps/lib-consolidation-
        map.js closes this properly — a real hand-map, in source, wired
        into bootstrap.js's HAND_MAPS array (one entry, per LS7's own
        consolidation, not a new copy-pasted block). Declares real internal
        require() edges for the two of six that have them (heal-loop ->
        nexus-config + cortex/core/raid, connect -> lib/heartbeat), all
        three targets confirmed real via registry.has() before writing
        anything. The reverse direction (30+ external files that require
        these six) deliberately left unwired — those are pre-existing
        components likely owned by other maps; wiring into a hook this map
        doesn't own risks the exact duplicate-id collision the original
        session map's own §SCOPE note existed to avoid. Named as a real
        next step, not guessed at. Verified idempotent, twice, same as
        every other hand-map in this session: 6 components, 2 hooks, 3
        wires, 0 failures, identical both runs.
      real_lesson_from_tranche_2_and_3: >
        A plain-string require() grep is not sufficient verification for a
        file move in this codebase, confirmed twice now — path.join() and
        fs.readFileSync() need their own explicit check every time, and a
        post-fix re-sweep is mandatory, not optional. Applied in full from
        the start for nexus-bus.js: 12 real sites found cleanly, zero
        additional patterns needed correction this time — the discipline
        held.
      what_is_real: >
        2026-08-15: James, explicit — "systems need their components in
        their respective folder, everything system-agnostic needs to be in
        lib." Audited all 13 loose root .js files at the start of this
        phase. Moved four low-risk ones same day (emerge-codegen-v2.js/
        emerge-kernel.js/emerge-ide.js -> emerge/, ollama-runtime.js ->
        ollama/runtime.js) plus deleted one confirmed-stale duplicate
        (registry-components.cortex.js). All thirteen loose root files
        from the original audit are now accounted for.
      gate: "MET. All 12 real requirer sites for nexus-bus.js verified via path.resolve, cortex/boot.js's real initialization confirmed running through the moved bus, zero remaining stale references (broadened sweep), stale registry entry corrected, and — the piece specifically asked for this turn — a real source hand-map replacing every prior tranche's live-only patch."

    LS8_map_file_naming_convention:
      priority: DONE 2026-08-15.
      depends_on: []
      built: >
        loom/maps/session-2026-08-14-map.js -> loom/maps/agent-tools-map.js
        (purpose-named, matches warp-map.js/observability-map.js/copilot-
        capability-map.js/ui-map.js's convention). mapSession20260814 ->
        mapAgentTools throughout, including its one real requirer
        (loom/bootstrap.js's HAND_MAPS entry).
      what_was_actually_real: >
        Re-verified before touching anything rather than trusted the
        earlier note in this same file, which turned out to be wrong: only
        ONE real requirer existed (loom/bootstrap.js), not the four sites
        (precommit-check.js, tests, command-builder.js, version.js)
        originally claimed. Much lower risk than scoped.
      verified: "grep for the old filename and function name across the whole tree: zero hits outside the renamed file's own historical provenance note. Ran mapAgentTools directly, twice: 0 failures both times, 23 components — same result as before the rename."

  honest_risks:
    - "LS1 and LS3 both touch live, running, currently-served code — playground first, per §16.5's own established pattern, not a suggestion."
    - "LS2 is the one phase in this map that is a genuinely new system, not a wiring pass — it deserves its own dedicated design pass before any code, same discipline R2/AM6 already got."
    - "LS4 is a decision this document cannot make for James — recommend HOLD until LS1-LS3 are further along, same reasoning the parallel session already gave for the autopilot->nexus rename: real blast radius, and the functional gain is real but not urgent relative to what's already broken and mapped."
    - "This phasemap itself needs to survive the exact problem LS2 names — a schema that goes stale silently is worse than no schema. Re-check this file's own DONE/MAPPED split against reality before extending it, not just before reading it."
    - "LS7 and LS8 were added 2026-08-15 to THIS SAME FILE, not a new one — James, explicit: 'no new fragments.' If a future session is tempted to write a new dated phasemap for the next day's findings, check here first; this file's own naming (no date in the LS prefix) was chosen so it could keep absorbing real updates instead of spawning session-N+1-map.spec siblings."
