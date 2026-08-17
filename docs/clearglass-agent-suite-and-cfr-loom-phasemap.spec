spec:
  meta:
    name:    clearglass-agent-suite-and-cfr-loom
    version: 0.1.0-phasemap
    status:  PHASEMAP 2026-08-17. Mapped, not all built. Compiled from a
             parallel live session's real transcript (working directly
             against the running system, tool errors and all — honestly
             reported where that session couldn't finish a check) plus two
             new asks from this message. Every phase checked against real
             code in this checkout before being marked done/partial/open,
             same discipline as copilot-guardian-cos-expansion-phasemap.
    uuid:    nexus-cga-cfr-phasemap-v1-0000-2026-0817-001
    intent: >
      Two real, distinct threads: (1) making clear-glass's provider tabs a
      genuine multi-agent surface — named accounts, hats, intent routing,
      and eventually a full tool loop so a person can work FROM inside a
      claude.ai/chatgpt.com tab instead of switching context to a separate
      chat; (2) giving loom real diagnostic depth and a real visual face,
      both built on CFR (Constraint Field Runtime) — reusing an existing,
      working precedent (eravos's canvas-cfr.js) rather than starting from
      nothing, matching the reference images' own framing (raw graph state
      -> fields -> SNR gates -> constraints -> solver -> render).

  major_finding: >
    The parallel session's own transcript is unusually rigorous about NOT
    fabricating status when its tools failed ("My sandbox tools are erroring
    out right now — not going to fake a read on snapshot.js") — that
    discipline is preserved here rather than silently filled in. Where that
    session couldn't check something live, this phasemap either checks it
    now (this session's tools were responsive) or states plainly that it's
    still unchecked. Two real precedents found in THIS pass that change the
    shape of what's actually needed: clear-glass/renderer/browser.js already
    has a real switchTo(id) tab-switch function (the launcher isn't new
    mechanism), and eravos/ui/runtime/canvas-cfr.js is a real, working
    192-line WebGL canvas already rendering CFR state visually (the loom-3D
    ask is an adaptation, not a from-scratch build).

  phases:

    TX1_clearglass_agent_suite_composition:
      priority: "HIGH — real, load-bearing gap: three real modules, zero wiring between them and clear-glass."
      status: "OPEN, precisely scoped by the parallel session's own real
        work, re-confirmed here. Three real, independently-working modules
        (lib/account-registry.js — provider account slots, PROVIDERS =
        [claude,chatgpt,gemini,perplexity]; lib/agent-router.js — the real
        intent-to-agent map; lib/hat-forge.js — named tool/persona bundles,
        VALID_BASE_AGENTS includes ollama and mistral too) — none wired into
        clear-glass/ today, confirmed by that session's own grep across
        clear-glass/src, seam, wire. Real precedent for HOW to wire them
        found in the same pass: clear-glass/src/copilot/bridge.js already
        does a direct cross-directory require('../../../lib/blueprint-
        index') — no IPC, no bridge process. Same pattern applies here."
      depends_on: []
      does: >
        Compose account-registry + agent-router + hat-forge into a real
        clear-glass-side agent-suite surface, reusing the bridge.js
        cross-directory-require precedent rather than inventing a new
        wiring mechanism.
      open_items:
        - REAL SCHEMA MISMATCH, found by the parallel session, not yet
          resolved — hat-forge's VALID_BASE_AGENTS allows ollama and mistral
          as base agents; account-registry has no account slot for either.
          A hat could name a base agent with no possible account to log
          into. Needs a decision, not an assumption — extend
          account-registry's PROVIDERS to include both, or have hat-forge
          silently narrow to the four that have real accounts.
        - Entry point undecided — does "add an agent" trigger from a
          clear-glass renderer/settings action, or from a Guardian/NEXUS-
          side CLI call that clear-glass only reflects? Decides whether
          this lives in clear-glass/src/main or nexus/lib.

    TX2_sequential_event_queue:
      priority: MEDIUM
      status: "OPEN, confirmed absent by the parallel session's own grep
        (SSE/error-log/friction/interaction-contract sequential processing
        across clear-glass — zero hits) and not re-contradicted here."
      depends_on: []
      does: >
        A real queue so every SSE event, error-log entry, friction signal,
        and interaction-contract crossing gets processed one at a time,
        in order, rather than concurrently — the person's own explicit
        worry was "i dont want to break it."
      open_items:
        - Queue implementation itself — genuinely new, no existing
          primitive to extend.

    TX3_talk_to_agent_launcher:
      priority: MEDIUM — smaller than it looked, real precedent found.
      status: "PARTIAL, real precedent confirmed this pass (the parallel
        session flagged this unconfirmed due to tool errors — resolved
        here). clear-glass/renderer/browser.js has a real switchTo(id)
        function — host.js already pre-warms all four provider tabs at
        boot, each with its real userscript loaded. \"I want to talk to
        claude/chatgpt/gemini/perplexity\" is very likely a thin chat-side
        trigger calling this EXISTING switch mechanism, not a new
        open-conversation mechanism."
      depends_on: []
      does: >
        A real chat trigger (same class as the recent switch-agent/
        create-compartment triggers) that calls the existing switchTo(id)
        via its IPC path, scoped to the four real provider tabs.
      open_items:
        - The actual IPC call path from a chat trigger into
          renderer-side switchTo() — not yet traced end to end.

    TX4_provider_tab_tool_loop:
      priority: HIGH — this is the real substance behind "give you a tool to check loom/cortex/file tree/system."
      status: "OPEN, and correctly identified by the parallel session as
        the one part of this request with real architecture underneath it,
        not just wiring. A claude.ai/chatgpt.com tab driven by a userscript
        is a DOM session, not an API connection — there is no native
        tool-calling available to an agent typing into that tab. The only
        real path: userscript injects the prompt, DOM-reads the reply, a
        server-side loop parses the reply for a tool-call intent, executes
        it against the real system, injects the result back in. That loop
        already exists in some real form (copilot's NCP tool loop) — the
        real work is extending ITS tool set with loom/cortex/file-tree/
        system-map reads and pointing it at whichever provider tab is
        active, not building a second loop."
      depends_on: [TX3]
      does: >
        Extends the real, existing NCP tool loop (not a new one) with
        real read-only tools: loom query, cortex query, file-tree walk,
        system-map read — the same shape as the real, already-built
        file-tree/parseAny tools confirmed working elsewhere in this
        session's own test suite (T1-T009 data/** refusal, T1-T010 path
        escape refusal — those exact protections should extend here, not
        be rebuilt).
      open_items:
        - The NCP tool loop's CURRENT real tool set — not yet enumerated
          in this pass, needed before knowing exactly what to add.

    TX5_backup_snapshot_for_talk_to_agent:
      priority: LOW — already substantially answered by prior work this session.
      status: "✓ DONE — CONFIRMED REAL, no new work needed for the core ask. The
        parallel session flagged cos/foundation/snapshot.js as unopened/
        unconfirmed due to tool errors — already fully investigated
        earlier THIS session (see cos.spec, snapshot-engine module):
        SnapshotEngine.take() is real, captures compartment config + a
        file manifest (hash/path/size) + process state + event tail,
        gzipped to .nex.gz. Honest limit already documented there too:
        restore() only rewrites the compartment CONFIG, never file bytes
        — the same real limit applies here if \"backup\" is meant to
        include actual file contents, not just a state fingerprint."
      depends_on: []
      does: >
        Nothing new — the real backup mechanism the person is asking
        about already exists and was already mapped (cos.spec's
        snapshot-engine module, and the rewind-timeline / .cos-archive
        gaps already recorded there for the parts that genuinely aren't
        built yet).
      open_items: []

    TX6_stop_using_this_chat_migration:
      priority: MEDIUM — a real design decision, not a build item, correctly flagged by the parallel session as unresolvable by reading code alone.
      status: "OPEN — a real, unanswered design question, not a gap in
        the code. Does \"talk in this chat\" for Claude specifically mean:
        (a) this claude.ai conversation's context gets carried over into
        the clear-glass Claude tab as a one-time migration, or (b) the
        clear-glass Claude tab becomes a fresh, tool-equipped conversation
        going forward and this chat just stops? These are different
        builds — (a) needs a real context-transfer step, (b) doesn't."
      depends_on: [TX4]
      does: >
        Nothing to build until this is answered — recorded here so the
        question doesn't get lost, matching the parallel session's own
        instinct not to guess at it.
      open_items:
        - The person's own answer to (a) vs (b) above.

    TX7_cfr_diagnostic_for_loom:
      priority: HIGH — new ask, this message.
      status: "OPEN, genuinely new. \"Loom needs to use cfr for a
        diagnostic system.\" Checked: loom's real diagnostic capability
        today (loom/scanners/*, component-registry, phasemap-map.js) does
        NOT read from CFR at all — confirmed by grep, zero cross-reference.
        CFR itself is real and substantial (meta/cfr/, cli/cfr-debug.js,
        guardian/memory_store/cfr_state.json) — this is a real, missing
        cross-wire between two real, separately-working systems, the same
        shape as several other gaps found this session (declared-but-
        unwired, not phantom)."
      depends_on: []
      does: >
        Would have loom's diagnostic layer read CFR's real regime/
        coherence/friction/entropy state (the same real fields cos.spec's
        rewind-timeline phase and the earlier diagnostic-report.js work
        already compose from) and surface it per-component, not just
        system-wide — giving loom's own component graph a CFR-informed
        health signal it doesn't have today.
      open_items:
        - Real design work — per-component CFR scoring doesn't obviously
          exist yet even outside loom — needs checking whether CFR is
          computed at a system granularity only, or can be meaningfully
          attributed to individual components.

    TX8_3d_cfr_visual_for_loom:
      priority: MEDIUM — new ask, this message, real precedent found.
      status: "OPEN, but substantially de-risked. \"We need that 3d visual
        map for loom using cfr.\" Checked and confirmed real: eravos/ui/
        runtime/canvas-cfr.js is a genuine, working 192-line WebGL canvas
        (confirmed: real WebGL2 context creation, graceful fallback to a
        dot-grid if WebGL2 is unavailable) already rendering CFR state
        visually — for eravos, not loom. The reference images describe a
        6-layer rendering pipeline (raw graph state -> force-vector fields
        -> SNR gates -> geometric constraints -> Verlet-integration solver
        -> final render) — whether canvas-cfr.js already implements this
        full pipeline or a simpler subset was NOT checked in this pass."
      depends_on: [TX7]
      does: >
        Would adapt canvas-cfr.js's real, working WebGL approach to
        render loom's own component/wire graph instead of eravos's,
        with node state driven by CFR (via TX7's per-component signal,
        if that's how far TX7 goes) — an adaptation of real, existing
        code, not a new rendering engine.
      open_items:
        - canvas-cfr.js's real internal pipeline — not yet read past
          its WebGL setup; whether it already matches the reference
          images' 6-layer model or would need real extension is unknown.
        - Depends on TX7 for what data actually drives the visualization.

    TX9_build_contract_file_dir:
      priority: MEDIUM — new ask, this message, precisely scoped.
      status: "OPEN, confirmed absent, precisely scoped. \"Contracts for
        building needs the file dir so it can be replaced when verified.\"
        Checked copilot/module-builder.js's real contract shape directly:
        { name, purpose, targetSystem, usesCapabilities, gaps, ready,
        scope, grammarAliases, contractType } — targetSystem names a
        SYSTEM (e.g. \"cortex\"), there is no field carrying an actual
        file path. _resolveExistingTarget() (built earlier this session)
        DOES resolve a real file path at generation time for edit/expand/
        repair scope — but whether that resolved path gets PERSISTED
        into the contract object itself, so a later verify-then-replace
        step doesn't need to re-resolve it, was not checked in this pass."
      depends_on: []
      does: >
        Add a real targetPath field to the contract schema, populated
        from _resolveExistingTarget()'s already-real resolution (not a
        second lookup mechanism) so that once RAID verifies a build's
        output, the apply/replace step has an exact, unambiguous file
        location to write to.
      open_items:
        - Whether _resolveExistingTarget()'s output currently gets
          discarded after generation or is already threaded through to
          where a replace step could use it — needs a direct read of
          the generation-to-verify handoff path.

    TX10_component_registry_discipline:
      priority: FOUNDATION — standing instruction, not a one-time build.
      status: "OPEN, real and current. The person's own explicit standing
        instruction: \"make sure you always update the components
        registry, with all the capabilities.\" Checked honestly against
        recent real work in THIS session's own history: verifyAgentReachable,
        navigateAgentToUrl, spec_wizard, and the cos.spec module content
        itself are NOT registered as loom components (grepped loom/maps/*.js
        and loom/bootstrap.js directly — zero hits for any of these names).
        This is a real, current gap in this session's own discipline, named
        honestly rather than left implicit."
      depends_on: []
      does: >
        Register the real, already-built recent work into loom's real
        component registry, matching the established pattern (loom/maps/
        session-2026-08-14-map.js from earlier this session is the exact
        precedent to reuse, not a new registration mechanism) — and treat
        this as an ongoing per-session step going forward, not a one-time
        catch-up.
      open_items:
        - The actual registration commit for this session's real work —
          not yet done as of this phasemap being written; a real, small,
          immediately-actionable follow-up.

  # §NEXT — deliberately left open, not filled with invented detail:
  #   - TX1's account-registry/hat-forge mismatch needs the person's own
  #     decision before any wiring code gets written.
  #   - TX4's NCP tool loop's current real tool set needs enumerating
  #     before knowing exactly what loom/cortex/file-tree/system tools
  #     to add.
  #   - TX6 needs the person's own answer on context-transfer vs
  #     fresh-start before any migration code gets written.
  #   - TX8 needs canvas-cfr.js read in full to know how much of the
  #     reference images' 6-layer pipeline already exists.
