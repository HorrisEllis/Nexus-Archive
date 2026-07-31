spec:
  meta:
    name:        copilot-omniscience
    version:     0.2.0-phasemap
    status:      PHASEMAP — dependency-ordered, bottom-up. Each phase is a
                 shippable chunk gated on real data. Written 2026-07-30 per §8.5
                 (map before build) and §3.1 (build order: substrate before
                 logic before surface). Axioms are law throughout.
                 AMENDED 2026-07-31 (0.2.0): adds the R band (R1-R6, context
                 economy) between P1 and P2, and rewrites P2/P3 to consume it.
                 Reason: P2/P3 as originally written INJECT blobs (whole
                 user-model digest + whole stream digest, every turn, regardless
                 of the question). That raises tokens and raises ambiguity —
                 the inverse of the system's purpose. Retrieval under a named
                 budget replaces injection. The R band is chunked small on
                 purpose: each chunk is one session's work with its own gate, so
                 a context boundary mid-band loses at most one chunk, not the
                 band (§3.1, drift discipline).
                 P1-P7 keep their numbers — copilot/tool-runtime.js's shipped
                 comments already reference "P2" and "P3" by name, and
                 renumbering shipped code references is exactly the drift §5.4
                 forbids. The new band gets its own letter instead.
    uuid:        nexus-copilot-omniscience-v0-0000-2026-0730-001

  goal: >
    Co-pilot becomes omniscient (every event/stream/ledger flows in as
    continuous context) and omnipotent (every tool and every system reachable
    through one agentic loop), while REMEMBERING across sessions (user-model +
    cortex data). Sovereign, non-linear (B): the tool-loop is a shared
    capability each system injects its own model into — copilot AND guardian AND
    idearium — not a service copilot owns.

  substrate_verified_2026_07_30:
    tool_loop:    "lib/agent-tools/index.js — runToolLoop(callModel, sys, user, opts) → {text, iterations, toolCallLog}. Sovereign, DI'd callModel. 10 tools auto-registered."
    tools_present: "read-file, run-command, diagnose, move-data, nexus-status, browser-action, query-recall, query-intelligence, run-pipeline, run-closed-loop"
    persistence:  "copilot/lib/user-model.js — persists user_model_hypotheses to cortex JAA store (data/cortex/memory). init(jaaDB), lazy-loads cortex/memory/jaa-db."
    stream:       "copilot/stream-digest.js — ALREADY consumes Cortex + Guardian SSE, normalizes to plain text, ledgers (nothing lost). normalizeStream/StreamDigest."
    copilot_model: "copilot/server.js ~461-546 — the ollama dispatch is the callModel to inject."
    faculties:    "copilot/{adversarial,analysis,axiom-manager,module-builder,intuition}.js — NOT tools (different shapes). Wrap as tools, do not move (§16.5 — keep sovereign)."

  # ── Second scan, run before writing the R band. §8.4 (scan file + deps +
  #    consumers before editing) and §0.1 (evidence over confidence). Two
  #    entries here CORRECT the 07-30 scan above rather than extend it —
  #    recorded as corrections, not quietly overwritten.
  substrate_verified_2026_07_31:
    preflight_EXISTS: >
      cortex/intelligence/index.js:816 getContext({intent, command, provider}).
      Its own header (§5, line 809-813): "PRE-REQUEST CONTEXT INJECTION /
      Called by guardian before every dispatch / This is the token efficiency
      mechanism — agents don't start cold." Already bounded: 3 reuse artifacts,
      5 failure modes, 5 patterns, and gap COUNTS not gap bodies. The R band
      does not build an assembler. It reconnects this one (§16.5).
    preflight_ORPHANED: >
      getContext has exactly ONE caller in the live tree —
      intelligence/index.js:896, its own internal HTTP handler. The header's
      "called by guardian before every dispatch" is FALSE: guardian never calls
      it. Verified by grep across the tree (only other hit is
      unintegrated/2026-07-branch-b-cortex-v2, a dead branch copy).
    route_drift: >
      cortex/registry-components.js declares intelligence.context → GET
      /api/intelligence/context, described "Pre-request context for intent".
      cortex/boot.js:504 serves _contextSnapshot(intent) (boot.js:264) instead —
      field + open-gap COUNT + last 10 event type names + _buildRCA(3). The
      declared route does not expose the declared capability. This is the single
      highest-leverage fix in the band and it is a rewire, not a build.
    fault_read_EXISTS_correction: >
      CORRECTS an earlier reading that fault_taxonomy had no read surface. It
      does: intelligence/index.js:1017 getFailures() → GET
      /api/intelligence/failures (boot.js:693), and the failure index is built
      from the persisted fault_taxonomy table (intelligence/index.js:152,
      jaaDB.query('fault_taxonomy', ..., 500)). No new read authority is needed.
      fault-taxonomy.js stays sole WRITE authority per §10.1, untouched.
    injector_EXISTS_but_p1_bypasses_it: >
      copilot/server.js:422 _injectRecallContext(prompt, contextText) — built
      2026-07-13 as chunk_2 of docs/nexus-copilot-recall.spec. Already
      score-thresholded (RECALL_CONTEXT_SCORE_THRESHOLD 0.3), already top-K
      capped (RECALL_CONTEXT_TOP_K 3), already truncates each result to 200
      chars, already honest-empty (nothing above threshold injects nothing, not
      a fabricated match), and already requires a real topical signal so recency
      alone cannot manufacture relevance. Live on three routes: server.js:791,
      :967, :1187.
      It is NOT on POST /api/prompt/tools. The P1 route (server.js:1033-1075)
      is the only prompt path in copilot with no recall injection at all — the
      newest path is the least grounded one. R5 does not build an injector; it
      extends this one and puts it on the path that lacks it (§16.5).
      Two named limits in it that R4/R5 exist to fix: it hardcodes
      `intent: 'general'`, so the debug_failure / causal_trace / pattern_lookup
      lanes are never selected no matter what is asked; and it carries recall
      only — no failure modes, no patterns, no prior fixes.
    budget_exists_but_defeats_itself: >
      cortex/push-recall.js:90 TOKEN_BUDGET_CHARS = 48_000 — roughly 12k tokens
      per recall. The budget MECHANISM is real; the NUMBER is set at a level
      that cancels the purpose. R3 fixes the number and names it, and does not
      reinvent the mechanism.
    retrieval_surfaces_all_live:
      recall:       "GET/POST /api/recall — cortex/push-recall.js:80 INTENT_LANES, 7 named intents over 5 real lanes (lexical, recency, failure, bep, causal)."
      fixes:        "cortex/memory/fix-map.js:78 lookupFix(errorText, limit) — token-overlap ranked, weighted by recorded successCount vs failureCount. Honest empty: no recorded fixes returns [], never a fabricated suggestion."
      gaps:         "GET /api/gaps (cortex/boot.js:433) — open gaps by severity. Deviation."
      tension:      "GET /api/liminal-space/status and /list (cortex/boot.js:660,664) — held spaces, velocity. Tension."
      friction:     "cortex/self-heal/fault-taxonomy.js — bands NOMINAL/ELEVATED/HIGH/FAILURE_MODE, raiseFriction(class, level), recordSuccess(class) with decay (a class that failed 9× and succeeded once is improving, not healthy)."
    p1_open_drift_CLOSED_2026_07_31: >
      CLOSED. Recorded in full rather than deleted, because the failure mode is
      the lesson: the defect shipped WITH a passing 6/6 test suite, and the
      suite passed because it fabricated the model's side of the wire.

      The defect: copilot's tool path could not fire a tool. tool-runtime.js
      passed `tools` into dispatch; server.js _dispatchToOllama never forwarded
      opts.tools; /api/jobs resolves to Ollama /api/generate, which has no tools
      param (ollama/server.js says so in its own comment); _dispatch never set
      job.tool_calls, so extraction always returned null and the loop always
      exited at iteration 1 with a guess.

      The fix, as one wired change rather than a patch:
        - ollama/chat-tools.js — NEW. The single-round-trip tool-capable model
          primitive. EXTRACTED from server.js's inline _callOllamaChatWithTools
          (which existed since 2026-07-07 and was untestable, because
          server.listen runs at module scope and requiring the file binds
          :3749). Moved, not copied — the inline copy is gone.
        - ollama/server.js — POST /api/chat/tools. One model turn, tools
          declared, tool_calls back. /api/jobs/tools keeps working and now sits
          on the SAME primitive, so there are two entry points over one loop
          implementation, not two loops (§10.3).
        - copilot/tool-runtime.js 2.0.0 — run() takes a `chat` fn.
          makeOllamaCallModel DELETED, not deprecated (§16.5): a path that
          cannot work is not a fallback, it is a trap.
        - copilot/server.js — _pollOllamaJobHeadless DELETED (20 lines polling
          for a field the job record can never have). _chatWithToolsOnce added
          and EXPORTED so the wire is testable rather than re-implemented in a
          test. _dispatchToOllama now honours opts.componentId/opts.hookId
          instead of hardcoding them — every caller's identity was being
          discarded, which is why R1 could not separate tool-loop dispatch from
          a plain prompt in the ledger.
        - both registry-components.js updated; lib/version.js bumped
          (ollama-bridge 1.1.0, copilot 3.6.0).

      GATE NOW MET, and met differently than it was claimed before: a real HTTP
      round trip, real sockets, real JSON, real tool execution against a real
      file, through copilot's own shipped wire. The only thing stood in for is
      the model's cognition, which is genuinely external and absent from the
      sandbox — as honest_risks has always said. Mutation-checked: removing
      `tools` from the request body makes T-101 fail. The 1.0.0 suite could not
      do that, which is the whole difference between a test and a proof (§12.1).

      Test debt paid at the same time: the 1.0.0 gate assertion was
      assert.ok(result), which passes on {"error":"file not found"} — a tool
      that failed and a tool that worked were indistinguishable to it. Now
      asserts real content, from the real file, with no .error, and T-005
      separately proves a failed tool surfaces AS failed.

  # ══════════════════════════════════════════════════════════════════════════
  #  R BAND — CONTEXT ECONOMY.  Runs between P1 and P2.
  #
  #  Purpose, stated plainly so no chunk drifts from it: raise capability by
  #  LOWERING ambiguity, and lower tokens as the direct consequence. A sharp
  #  small context beats a large vague one — one model turn instead of three.
  #  Every chunk below either RECONNECTS something already built or NAMES a
  #  number that was already there but wrong. Only R6 is new construction.
  #
  #  Chunked deliberately small (§3.1): one gate each, one session each, each
  #  independently shippable. A context boundary mid-band costs one chunk.
  # ══════════════════════════════════════════════════════════════════════════
  r_band:

    R1_baseline_before_claim:
      why_first: >
        §17.11 — a performance claim must name its benchmark. There is currently
        no measured number for what a copilot request costs. Without R1, every
        later "this reduced tokens" is an assertion. This is the floor of the
        band for that reason alone.
      does: >
        Instrument the EXISTING /api/prompt path (untouched behaviour, added
        measurement only): per request, ledger promptChars, contextChars,
        modelRoundTrips, and wall ms. Run it over real traffic — the existing
        data/copilot/chat_log is the corpus, not synthetic prompts.
      axioms: "§17.11 (name the benchmark), §0.1 (evidence over confidence), §1.2 (measure loudly, never silently)"
      gate: "a real median contextChars and modelRoundTrips for the current path exists in the ledger, from real requests. No reduction is claimed anywhere in this band until this number is on disk."
      drift_note: "If the band is interrupted after R1, R1 still stands alone as a permanent instrument. Nothing to unwind."

    R2_reconnect_the_assembler:
      why: >
        The pre-flight already exists and is orphaned (see
        substrate_verified_2026_07_31.preflight_ORPHANED). The declared route
        serves a thinner function than the registry claims. Highest leverage in
        the band, and it is a rewire, not a build (§16.5 — use it, don't
        duplicate it).
      does: >
        1. GET /api/intelligence/context serves intelligence.getContext({intent,
           command, provider}) — the real assembler — instead of
           _contextSnapshot(). 2. Scan _contextSnapshot's consumers FIRST (§8.4);
           if anything still needs the thin shape it keeps its own honestly
           named route, it does NOT keep the name of the thing it isn't.
        3. Correct getContext's header: it says guardian calls it before every
           dispatch and that is false today. Either the comment changes or P4
           makes it true — the comment does not get to stay false while we build
           on top of it (§1.1).
        4. cortex/registry-components.js updated if the served shape or params
           differ from what is declared.
      axioms: "§16.5 (use, don't duplicate), §10.1 (intelligence owns context assembly), §5.4 (declared and served are one thing), §1.1 (a false comment is not documentation)"
      gate: "GET /api/intelligence/context returns reuse + failureModes + patterns + systemState from the real indexes; a fault class pushed to HIGH via raiseFriction() appears in failureModes on the next call, read from the persisted table."

    R3_budget_named_and_real:
      why: >
        The budget mechanism exists; the number defeats it. 48_000 chars is
        ~12k tokens per recall, which is not economy. Also getContext's caps
        (3 / 5 / 5) are magic slices at call sites rather than a named budget
        (§13.3 — every constant is named before it is used).
      does: >
        push-recall's TOKEN_BUDGET_CHARS becomes configurable with a low real
        default; getContext's slice caps come from the same named budget object.
        Over-budget retrieval drops by RANK, not by array order, and every
        dropped uuid is ledgered — trimmed is not lost (§0.3).
      axioms: "§13.3 (named constants, no magic numbers at call sites), §0.3 (nothing lost — what was dropped is recorded), §17.11"
      gate: "an over-budget recall returns the top-ranked slice strictly under budget AND writes a ledger line naming every uuid it dropped. Byte-count asserted, not eyeballed."

    R4_intent_resolution_no_model:
      why: >
        Choosing WHICH lanes to pull must not itself cost a model call — that
        would spend the tokens the band exists to save. push-recall already
        defines 7 intents over 5 real lanes; this resolves into that existing
        map rather than inventing a taxonomy.
      does: >
        Deterministic lexical resolution: prompt → one of push-recall's existing
        INTENT_LANES keys (debug_failure, gap_fill, session_resume, causal_trace,
        pattern_lookup, crystal_query, general). Zero model round-trips. An
        unresolvable prompt returns `general` — it never invents an intent, and
        it records that it fell through.
      axioms: "§1.3 (loud specific fallback — 'general' is recorded as a fallthrough, not disguised as a match), §16.5 (resolve into the existing lane map)"
      gate: "a fixed corpus drawn from the real data/copilot/chat_log resolves to correct intents with zero model round-trips; fallthrough rate is a reported number, not hidden."

    R5_copilot_consumes_preflight:
      why: >
        The point of the band. Co-pilot stops starting cold and stops starting
        bloated: it starts with a small ranked block assembled before the first
        model call.
      does: >
        EXTENDS server.js:422 _injectRecallContext — it does not build a second
        injector alongside it (§16.5). Three changes to the existing function,
        then one wiring:
          1. intent comes from R4 instead of the hardcoded 'general', so the
             failure/causal/bep lanes actually get selected.
          2. it gains two more ranked sources beside recall — R2's getContext
             (failure modes, patterns, reuse, systemState) and
             fix-map.lookupFix() when the prompt is failure-shaped.
          3. its 0.3 threshold / top-K 3 / 200-char truncation come from R3's
             named budget object instead of three separate module constants,
             and all sources compete for that one budget by rank (§13.3).
        Then: wire it onto POST /api/prompt/tools, which today has none, and
        pass the block into tool-runtime.run(). It REPLACES — does not stack on
        top of — the blob injection at tool-runtime.js:103-107. Empty sources
        render empty; a section with nothing real behind it is omitted, never
        padded (the existing function already behaves this way — keep it).
      axioms: "§1.2 (empty is empty — no fabricated context), §17.10 (verify before promote), §17.11 (measured against R1)"
      gate: "a real copilot request carries the block, strictly under budget, and beats R1's recorded baseline on BOTH contextChars and modelRoundTrips. Losing on either is a failed gate, not a tradeoff to argue."
      depends_on: >
        substrate_verified_2026_07_31.p1_open_drift must be closed first. With
        the tool path inert, the pre-flight is the ONLY context path — which
        makes R5 more urgent, but also makes R6's miss signal impossible to fire,
        because the model can never call a tool to reveal the miss.

    R6_miss_becomes_a_fault:
      why: >
        Self-diagnosis, and the only genuinely new construction in the band. If
        the model still reaches for query_recall or query_intelligence, the
        pre-flight MISSED — and a miss the system doesn't record is a miss it
        repeats. This is the friction ladder pointed inward at copilot's own
        retrieval.
      does: >
        A tool call the pre-flight should have pre-answered raises friction on a
        named `context_miss` fault class (fault-taxonomy.raiseFriction, the sole
        write authority — no second writer) and records the prompt signature →
        missed lane via fix-map.recordFix. A later successful pre-flight for that
        shape calls recordSuccess, so friction decays rather than resets.
      axioms: "§10.1 (fault-taxonomy stays sole write authority — this calls it, it does not write the table), §13.3 (context_miss is a named class before it occurs), §12.1 (the test forces a real miss, it does not assert on a stub)"
      gate: "a forced miss raises friction on the real persisted fault_taxonomy row; a repeat of the same prompt shape then carries the lane that was previously missed. Both halves proven, or the gate is not met."

  # ── PHASES (continued) — P2 and P3 REWRITTEN at 0.2.0 to consume the R band ──

    P2_persistence_threaded:
      why: "'Remember me — vital.' Memory must survive restart and reach the loop — but as RETRIEVED signal, not as a dumped digest."
      amended_2026_07_31: >
        Original P2 injected the whole user-model digest into the systemPrompt
        every turn. That is the blob pattern the R band exists to remove. P2 now
        supplies memory THROUGH the pre-flight: user-model hypotheses are a
        ranked source competing for the same R3 budget as everything else, so a
        question about a bug does not spend budget on unrelated preferences.
      does: >
        user-model.init(jaaDB) at copilot boot (unchanged — it lazy-loads
        cortex/jaa-db, so no double-init). buildUserContext() output becomes a
        RANKED, BUDGETED source inside R5's pre-flight rather than a whole string
        concatenated into the prompt. observe/recordIntent still write back after
        each turn.
      axioms: "§0.3 (nothing lost — memory persists), §10.1 (cortex owns the store, copilot reads/writes through it), §13.3 (ranked under the named R3 budget)"
      gate: "restart copilot; a fact learned last session is present in the next session's context, read from cortex — AND the context block is still under R3 budget with it included. Persistence alone is half the gate; persistence that blows the budget fails P2 at 0.2.0."

    P3_continuous_stream_to_copilot:
      why: "Omniscience, half 1 — co-pilot sees the live event stream."
      amended_2026_07_31: >
        Original P3 fed the whole StreamDigest into every turn. Full-digest-every-
        turn is the single largest token cost in the design and the largest
        source of ambiguity: the model must find the relevant event inside noise.
        P3 now feeds a BOUNDED SLICE selected against the resolved intent (R4),
        under the R3 budget.
      does: >
        StreamDigest becomes a pre-flight source: the slice relevant to the
        resolved intent enters the context block, ranked against the other
        sources. The full digest stays ledgered and remains reachable on demand
        via the existing tools — bounded in the prompt is not discarded (§0.3).
      axioms: "§1.2 (the stream is observable, never silent), §2.3 (state always visible), §0.3 (full digest ledgered even when the slice is small)"
      gate: "co-pilot answers a 'what just happened?' question from the live stream with no explicit fetch, with the stream contributing a bounded slice — and R1's baseline is still beaten with the stream on."

    P4_guardian_tool_loop:
      why: "B / non-linear proof. agent-tools' own header names Guardian. Wire the SAME loop into guardian with guardian's provider dispatch as callModel."
      does: >
        guardian/server.js injects its /command provider dispatch as callModel
        into runToolLoop. Guardian gets the 10 tools, talking to claude/chatgpt/
        gemini instead of ollama. No copilot dependency — proves the mesh.
      axioms: "§5.14 (same contract, different backend), §10.3 (one loop, no competing tool systems)"
      gate: "a guardian /command that needs a tool uses it — via guardian's providers, with zero call into copilot."

    P5_faculties_as_tools:
      why: "Omnipotence. The copilot faculties become callable tools so the loop can invoke them."
      does: >
        Thin adapters in lib/agent-tools/tools/: module_builder (→ module-builder.build),
        run_adversarial (→ adversarial.run), axiom_check (→ axiom-manager),
        analyze (→ analysis.answer). Faculties stay where they are (§16.5).
      axioms: "§16.5 (wrap, don't move), §10.1 (each faculty still owns its logic)"
      gate: "the tool-loop builds a module by calling the module_builder tool, end to end."

    P6_every_system_reachable:
      why: "Omnipotence, completed. A call_system tool over the registry (self-register work) makes every registered system callable by name."
      does: >
        A call_system tool resolves a target via the capability registry
        (already populated by self-register) and dispatches. Every system that
        registered is now a co-pilot tool target.
      axioms: "§10.3 (route through the registry, one source of truth), §8.4 (uses the real registry, not a hardcoded list)"
      gate: "co-pilot invokes a named system's capability it has never been explicitly coded to reach, resolved live from the registry."

    P7_stream_to_all_systems:
      why: "Omniscience, expanded. The continuous stream is not copilot-only — every consumer (guardian's loop, the tablet, idearium) can subscribe to the same normalized digest."
      does: >
        Promote StreamDigest to a shared subscribable (lib/), so any system's
        tool-loop or UI gets the same continuous normalized stream copilot has.
      axioms: "§10.3 (one stream, many readers — not N copies), §0.3 (ledgered, nothing lost)"
      gate: "guardian's tool-loop AND the tablet both read the same live digest copilot does, from one source."

  ordering_rationale: >
    P1 → R1..R6 → P2 → P3 → P4 → P5 → P6 → P7.

    P1 is the spine (the loop runs). The R band goes next, BEFORE P2/P3, because
    P2 and P3 are both context suppliers — and until there is a budget, a ranked
    assembler and a benchmark, every supplier wired in makes the prompt bigger
    and vaguer. Wiring suppliers first and economising later means unpicking
    them later; the order was wrong at 0.1.0 and this corrects it.

    Inside the band the order is strictly bottom-up: measure (R1) before any
    claim; reconnect the assembler that already exists (R2) before adding to it;
    name the budget (R3) before anything competes for it; resolve intent without
    a model (R4) before selecting lanes; then consume (R5); then close the loop
    on its own misses (R6). Nothing in the band depends on anything after it.

    P4 then proves non-linearity on a spine that is not just working but
    economical — and P4 is where getContext's "called by guardian" header
    becomes true instead of aspirational. P5→P6 complete omnipotence. P7
    expands the stream to all, so omniscience is system-wide, not copilot-only.

  honest_risks:
    - "P1: runToolLoop with a real model can loop — maxIterations caps it, but a bad callModel could burn iterations. Gate proves a real termination."
    - "P4: guardian's provider dispatch is async/job-based (poll), not a direct return like ollama — the callModel adapter must resolve the job before returning to the loop."
    - "P6: call_system must not become a second dispatch path competing with RAID (§10.3). It routes THROUGH the registry, same as RAID resolves."
    - "R2: _contextSnapshot may have live consumers depending on its thin shape. Scan consumers before repointing the route (§8.4). Repointing a route that something else silently depends on trades one drift for another."
    - "R3: lowering the budget can starve retrieval — a too-small budget makes the model ask more, raising round-trips. R1's baseline is the arbiter: if round-trips go UP, the budget is wrong, and the ledger of dropped uuids says exactly what was starved."
    - "R4: lexical intent resolution WILL misfire on prompts that don't look like their intent. That is why fallthrough rate is reported and why R6 exists — the resolver is expected to be wrong sometimes and to learn from it, not to be right by assumption."
    - "R6: 'the model called a tool' is not always a miss — sometimes the tool is genuinely the right move mid-turn. Raising friction on legitimate tool use would train the pre-flight to over-stuff, which inverts the whole band. The miss condition must be narrow: the tool asked for something the pre-flight already had a source for and dropped or skipped. Defining that narrowly is the actual work of R6."
    - "R5/P1: RESOLVED 2026-07-31 — the tool path was inert, which would have made R6's gate unfireable (the model cannot reveal a miss by calling a tool that can never be called). Closed before the band starts. R1 additionally needed the componentId fix to tell the two dispatch paths apart in the ledger; that shipped with it."
    - "sandbox cannot run the live loop (no model, no SSE) — every gate is James-verified on the real boot, per this whole engagement."
