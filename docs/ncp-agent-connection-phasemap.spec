spec:
  meta:
    name:        ncp-agent-connection
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-14. Mapped, not built. §3.3 — map before build.
    uuid:        nexus-ncp-agent-connection-v0-0000-2026-0814-001
    author:      (mapped this session, after the 0.39.1 change-agent/NCP wiring)
    intent: >
      One thread: the path from "which agent should answer this" to "that agent's
      NCP channel actually receives the job" is broken in more than one place, and
      every break is silent. 0.39.1 closed the first one — the change-agent tool
      now reads real channel state instead of writing a JAA row into the void.
      Tracing the rest of that path end to end for this phasemap found a second,
      more severe break already live in copilot/lifeline.js, plus four smaller
      seams where the system disagrees with itself about which agents exist.
      This maps them in dependency order. Nothing below is a new mechanism;
      every phase reconciles something that already exists with something else
      that already exists.

  today_summary:   # §0.3 — what actually shipped, verified live, before this was written
    - "lib/ncp-availability.js (NEW, v1.0.0) — reads guardian's real GET /providers. Four-valued state(): direct|connected|offline|unknown. predicate() fails OPEN on unknown so an unreachable guardian can't empty a fallback chain. ollama/auto are 'direct', never gated on a browser-tab protocol. Stale-while-revalidate + single-flight, because routeAgent's `available` contract is synchronous and switchAgent() has live sync callers. 11/11 tests against a real socket."
    - "ROOT FINDING: lib/agent-router.js routeAgent() has accepted an `available` (agent)=>bool since CA5 and uses it to build the fallback chain. Grepped every caller in the tree — NOT ONE supplied it. isUp defaulted to () => true, so the availability filter has always filtered nothing and the fallback chain was decorative. copilot/lib/self-model.js switchAgent() now supplies it; an explicitly-passed one still wins."
    - "lib/agent-tools/tools/identity/switch-agent.js — live NCP read on every action, + a `channels` action. Reports, does not refuse: the switch lands and states plainly whether the channel is up and who is up instead. Per direction — a veto was explicitly not wanted."
    - "TWO DEFECTS FOUND IN THE FIRST END-TO-END RUN, NOT IN REVIEW: (1) state() fell through to the retained provider map while degraded, reporting a confident 'offline' the moment guardian died — 'I can't reach the thing that knows' laundered as 'I asked and the tab is closed'. Now 'unknown', pinned by T-010. (2) _note() took no verb, so the read-only `current` action reported 'Switched to chatgpt...' about an agent it had merely looked at."
    - "loom: both files added to session-2026-08-14-map (switch-agent.js was ALREADY an unmapped orphan from 6a64da1). scripts/precommit-check.js now clean on this change set."

  substrate_already_built:   # §8.6 — extend these; do not rebuild
    - "lib/ncp-availability.js — TODAY. The single correct parser of guardian's /providers payload. Every phase below that needs channel state reads it rather than re-parsing; that is the whole point of NC2."
    - "guardian/lib/ncp.js (module 'ncp' v1.1.0) — the protocol itself. isConnected/getProviders/push/pushTab/broadcast are real and in-process authoritative. Nothing here needs a second channel registry."
    - "guardian/server.js:2374 GET /providers — the canonical remote read. Returns { ok, providers: { name: 'connected'|'null' }, channels: { name: {...detail} } }. Note the STRING 'null', not null. This exact shape is what NC1 is about."
    - "clear-glass/src/providers/registry.js — the canonical NCP provider list (claude/chatgpt/gemini/perplexity), explicitly excluding ollama as local/direct-HTTP per guardian.spec. NC3 reconciles the other three rosters against THIS one; it does not invent a fifth list."
    - "guardian/ask.js — already fail-fasts correctly via an injected isProviderConnected (server.js:2975 → ncp.isConnected, in-process). Confirmed correct, not part of NC1. It is the model the other call sites should look like."
    - "guardian/cli.js:368 — already parses the string payload correctly (`status === 'connected'`). Cited as proof the shape is knowable, not exotic; lifeline is the outlier, not the norm."

  governing_axioms:
    - "§10.3 one source of truth — NC2 exists because four call sites independently decide what 'connected' means and one of them is wrong. The fix is one reader, not four correct parsers."
    - "§1.1 declared ≠ real — NC1 was found by executing the guard expression against the real payload, not by reading the comment above it. That comment is careful, well-reasoned, and describes behavior the code does not have."
    - "§1.2 never silent — every failure mode in this phasemap is currently silent. queued_waiting_for_provider is a status nobody is shown. NC5 is that, and only that."
    - "§8.6 reuse before build — no phase below adds a mechanism. NC1/NC2 delete parsing, NC3 deletes roster entries, NC4 adds handlers for calls that already exist, NC5 surfaces a status that already exists."
    - "§3.3 map before build — this file. NC1's severity is the reason it exists as a map rather than being fixed inline with the 0.39.1 commit: it is outside the scope that was given, and a live-dispatch change deserves its own decision."

  phases:

    NC1_lifeline_provider_guard_reads_a_field_that_does_not_exist:
      priority: P0 — CRITICAL, LIVE, BLOCKS EVERYTHING BELOW. Guardian NCP dispatch from copilot is currently dead whenever guardian is reachable.
      depends_on: []
      severity_evidence: >
        copilot/lifeline.js:237 — `if (provCheck?.providers && provCheck.providers[ragProvider]?.connected !== true) return null;`
        and :253 — `if (provCheck?.providers && !Object.values(provCheck.providers).some(p => p?.connected === true)) return null;`
        Guardian's /providers returns providers as a map of STRINGS ('connected' | 'null'),
        built at server.js:2375. The per-provider detail objects live under a
        SEPARATE `channels` key. So `'connected'.connected` is undefined,
        `undefined !== true` is true, and BOTH guards return null unconditionally.
        Verified by execution, not by reading: the real payload shape was
        reconstructed from server.js:2374-2380 and both expressions evaluated
        against it — explicit-provider path BAILS, auto path BAILS, with gemini
        genuinely connected.
      consequence: >
        _tryGuardian() returns null before dispatching on every call where
        /providers answers. Explicit "talk to gemini", the persistent hat set by
        switch_agent, and RAID's own RoutingIR decision all fall through to the
        Ollama cascade. The one condition under which Guardian dispatch works is
        /providers being UNREACHABLE — the fail-open branch. The system works
        only when the check breaks. This inverts the stated intent of the
        §MERGED 2026-07-09 comment directly above it, which is correct about
        what it wants and wrong about what it does.
      does: >
        Replace both hand-rolled parses with lib/ncp-availability. The
        fail-closed-on-evidence / fail-open-on-no-evidence rule the comment
        describes is exactly what state() already encodes: 'offline' is
        evidence, 'unknown' is not, 'direct' is not gated. This is a deletion,
        not an addition.
      gate: >
        With guardian up and exactly one provider tab connected, a dispatch to
        that provider reaches it (job appears in /jobs, not parked). With that
        tab closed, the call falls through to the cascade for the RIGHT reason
        and says so. Regression test asserts the OLD expression against the REAL
        payload and fails, so this can never silently return.
      risk: >
        This turns dispatch back ON. Everything downstream of _tryGuardian has,
        in practice, been exercised only through the fail-open path. Expect
        latent breakage there to surface as a consequence of the fix, not a
        regression from it. Do NC1 alone, on its own commit, and watch it.

    NC2_one_reader_for_channel_state:
      priority: HIGH — the structural reason NC1 was possible at all.
      depends_on: [NC1]
      does: >
        Route every remote consumer of NCP channel state through
        lib/ncp-availability instead of independently parsing /providers.
        Known call sites, grepped: copilot/lifeline.js (NC1, wrong),
        guardian/cli.js:368 (correct today, still a second parser),
        guardian/guardian-api.js:154 (returns raw), ui/contracts.js:107 +
        ui/tv-shell/components/guardian.js:16 (browser-side, needs the
        equivalent shape contract rather than the node module),
        orchestrator.js:1751 (proxies raw, arguably fine).
        In-process consumers (guardian/server.js, guardian/ask.js) keep using
        ncp.isConnected directly — they are the source, not a reader of it.
      gate: >
        Grep for `.providers[` and `providers).some(` across the tree returns
        only lib/ncp-availability.js. A shape change in server.js:2374 breaks
        exactly one file.
      note: >
        The browser-side consumers cannot require() a node module. Decide
        deliberately: either an /api endpoint that returns the already-parsed
        shape, or a shared contract in ui/contracts.js. Do not fork a fifth
        parser to solve it.

    NC3_roster_reconciliation:
      priority: MEDIUM — four lists of "which agents exist" and no two agree.
      depends_on: [NC1]
      does: >
        Reconcile against clear-glass/src/providers/registry.js as canonical
        (claude/chatgpt/gemini/perplexity, ollama excluded by spec as
        local/direct):
          · copilot/lib/self-model.js VALID_AGENTS includes mistral.
          · copilot/lifeline.js KNOWN_AGENTS includes mistral, OMITS perplexity —
            so "talk to perplexity" does not match EXPLICIT_AGENT_RE at all,
            for the one provider that is genuinely connected and has a real
            userscript.
          · lib/agent-router.js AGENT_CONSTRAINTS has no mistral entry, so a
            mistral route silently gets {}.
          · guardian/server.js:2375's /providers map has no mistral key.
          · ui/agents/mistral/ and guardian/ui/agents/mistral/ exist as UI
            surfaces for a provider with no userscript-mistral.js anywhere.
        mistral can never open an NCP channel. Decide once, explicitly: build
        userscript-mistral.js and add the registry entry, or remove it from the
        three rosters that offer it. Do not leave it half-present.
      gate: >
        The set of switchable agents, the set in EXPLICIT_AGENT_RE, the set with
        AGENT_CONSTRAINTS, and the set guardian reports are the same set —
        asserted by a test that derives all four programmatically rather than
        listing them.
      note: >
        As of 0.39.1 a switch to mistral at least reports 'offline' honestly
        instead of going quiet. That is a bandage on a roster disagreement, not
        a fix for it.

    NC4_claim_and_release_have_no_handlers:
      priority: MEDIUM — a UI control wired to nothing.
      depends_on: []
      does: >
        guardian/server.js:3751's own dashboard renders Claim and Release
        buttons that POST to /providers/:name/claim and /providers/:name/release.
        Grepped server.js for both routes: neither handler exists. The buttons
        404 silently (fetch with no .catch, no status check). The underlying
        state IS real — ncp.updateClient() sets `claimed`, the userscripts send
        it on GUARDIAN_REGISTER and heartbeat, NCP_CLAIM is a defined SSE event
        in lib/ncp.js's protocol table. Only the HTTP surface is missing.
      gate: >
        Clicking Claim sets claimed:true on the live client entry, the tab
        receives NCP_CLAIM over SSE, and /providers channels reflects it on the
        next read. Clicking it against a disconnected provider returns a real
        error, not a 404.

    NC5_a_parked_job_is_visible:
      priority: MEDIUM — §1.2, the silence that made all of the above survivable.
      depends_on: [NC1, NC2]
      does: >
        guardian/server.js:3138 sets status 'queued_waiting_for_provider' and
        nothing surfaces it. A job can sit there indefinitely with the person
        seeing nothing at all. Surface it where the person actually is:
        copilot's response path, and the guardian dashboard's job list (which
        already renders a .jst status class it can style). No new store — the
        status already exists on the job record.
      gate: >
        With every tab closed, sending a prompt produces a stated reason within
        one round-trip instead of an indefinite silence. The reason names the
        provider and that its channel is closed.
      note: >
        NC1 must land first. Fixing the visibility of a parked job before
        fixing the reason jobs park would surface a flood of NC1's symptom and
        teach everyone to ignore the new signal.

    NC6_loom_registration_actually_registers:
      priority: LOW — bookkeeping, but the bookkeeping is the system's self-model.
      depends_on: []
      does: >
        Two separate things, deliberately not conflated:
        (a) loom/bootstrap.js reports 6 declare FAILs on axiom loom.unique-id.
            Baselined this session BOTH with and without the 0.39.1 change:
            6 either way. Pre-existing, unrelated, unfixed — and it means the
            session-2026-08-14 map's components are not in loom/data/registry.json
            at all, so "mapped" currently satisfies precommit-check without
            satisfying loom.
        (b) The real edge copilot/lib/self-model.js → lib/ncp-availability.js is
            NOT declared. self-model belongs to copilot-capability-map, and
            declaring a wire out of another map's hook is the duplicate-id risk
            session-2026-08-14-map's own §SCOPE note refused to take. Resolving
            (a) is what makes (b) safe to do.
      gate: >
        loom/bootstrap.js runs with 0 FAILs and
        `nexus.lib.ncp-availability` is present in loom/data/registry.json —
        checked by reading the registry, not by trusting the bootstrap log.

    NC7_stale_test_assertions:
      priority: LOW — but they are currently red, which costs the suite its signal.
      depends_on: []
      does: >
        Two pre-existing failures, baselined before and after 0.39.1, neither
        caused by it:
          · tests/modules/test-agent-routing.js T-002 asserts large_code → claude
            WITH warp+context injected. DEFAULT_ROUTES moved large_code to gemini
            on 2026-08-14 by explicit direction, and the gemini route carries the
            same inject: ['warp','context']. The test encodes the old directive.
          · tests/modules/test-p5p6-self-model.js T-005 fails on 'wrote to cortex'.
        Decide per test whether the assertion or the code is stale. T-002 is
        almost certainly the test; T-005 has not been diagnosed and should not be
        assumed.
      gate: >
        Both suites green, or each remaining failure carries a written reason in
        the test file for why it is expected to fail.

  ordering_note: >
    NC1 alone, first, on its own commit. It is a one-file change that turns live
    dispatch back on, and its blast radius is genuinely unknown because the path
    it restores has been dark. NC4, NC6 and NC7 are independent and can be done
    in any order or in parallel by someone else. NC2 → NC3 → NC5 is the sequence
    that leaves the system with one truth about which agents exist, one reader of
    whether they are reachable, and no silent failure between the two.
