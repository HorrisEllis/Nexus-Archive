spec:
  meta:
    name:        autonomous-build-capability
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-14. Mapped, not built. §3.3 — map before build.
    uuid:        nexus-autonomous-build-capability-v0-0000-2026-0814-001
    author:      (mapped this session, per James: "co-pilot phases, loom phases,
                 making the system capable of building, anything that helps full
                 autonomy, a toolbox for each system, and versionium")
    intent: >
      Five asks, checked against the real tree before any of them were mapped.
      Two of the five turned out to be already closed, one turned out to be
      broken in a way nobody could see, and only two are genuinely new work.
      That result is the map.

      This file covers ONLY what is genuinely new: the tool index nothing has
      ever written to, per-system toolboxes built out of it, and versionium's
      three missing verbs. Everything else the asks touch is already mapped in
      an existing phasemap and is referenced below rather than re-mapped (§10.3
      — a second copy of SB3 is not a plan, it is a competing truth layer).

  the_five_asks_answered:   # §1.1 — what is actually true, checked not recalled
    - "CO-PILOT PHASES — CLOSED, all four maps. copilot-full-capability FC1-FC11 all DONE 2026-08-12. copilot-omniscience OM1-OM7 all DONE 2026-07-30. copilot-awareness-routing CA1-CA6 DONE 2026-07-30, CA7 backend-only. copilot-autonomous AU1-AU7 all DONE 2026-08-08 (spec closed). There is no open co-pilot phase to build. ONE CAVEAT, and it is the spec's own: copilot-omniscience carries a `corrections_2026_08_14` block admitting OM4's gate was never actually met — guardian/tool-runtime.js's resolveJob reads job.tool_calls and nothing in guardian/ ever wrote it. That correction is recorded and unresolved."
    - "LOOM PHASES — CLOSED. loom-phasemap-section LP1-LP3 DONE 2026-08-08/08-11. The loom half of repair-contract-and-loom-hub (R4 ledger awareness, R5 visual map, R6 living documentation) DONE 2026-08-12. No open loom phase."
    - "CAPABLE OF BUILDING — OPEN, and already mapped: nexus-self-build-pipeline SB1 DONE, SB2-SB9 open. That is the body of work for this ask. Not re-mapped here."
    - "FULLY AUTONOMOUS — the phases exist (AU1-AU7 DONE) and the loop runs, but AB1 below is a live break in it: lib/constant-autonomy.js's proposal engine polls lib/tool-index.js for tools with recorded edge cases, and tool-index has never had a single row written to it. Also open toward this goal: AP2-AP5 (agent-intelligence-loop), AM1-AM3/AM6-AM10 (agent-model), RR1-RR7 (raid-routing-fidelity, zero phases started), NC1-NC7 (ncp-agent-connection, NC1 is P0 and live)."
    - "TOOLBOX PER SYSTEM — GENUINELY NEW, and AB1-AB3 below. The 56 tools in lib/agent-tools/tools/ are organised by CATEGORY (identity/query/governance/sandbox/browser/diagnostic/coordination/faculty/execution), not by owning system. No per-system toolbox exists anywhere."
    - "VERSIONIUM — GENUINELY NEW, and AB4-AB5 below. cortex/versionium/index.js exports exactly four functions: init, stop, setDeps, commit. That is the entire real surface. rewind, branch-switching and snapshot do not exist, which lib/agent-tools/tools/governance/versionium-commit.js's own header already states plainly rather than papering over."

  substrate_already_built:   # §8.6 — extend these; do not rebuild
    - "lib/tool-index.js — register()/record()/list()/summary() are REAL and complete. {id, file, dir, provides, intents, consumers, edgeCases[], calls}, edgeCases auto-appended whenever a call reports ok===false or an explicit edgeCase, bounded at 50. AB1 does not build this. AB1 calls it."
    - "lib/agent-tools/index.js registerTool()/executeTool() — the two chokepoints every one of the 56 tools already passes through. AB1 is two call sites, not a new pipeline."
    - "lib/hat-forge.js toolScope — a real, validated, enforced tool-subset mechanism (validate() refuses a toolScope naming an unregistered tool; runViaAgent already applies it). AB3 expresses a system toolbox AS a toolScope rather than inventing a second scoping concept."
    - "lib/capability-registry + lib/nexus-client — how lib/agent-tools/tools/execution/call-system.js already resolves and reaches any registered system without a hardcoded list. AB2 derives tool→system from what these already know."
    - "cortex/snapshot/index.js — create/load/verifySnapshotIntegrity/checkChainIntegrity/rollback, all genuinely functional as of R2 (2026-08-12, proven against the LIVE store after a first pass that passed 34 tests against a mock while silently capturing {} in production). AB4 composes THIS. It does not write a second rollback."
    - "cortex/versionium/causality.js + the versionium_commits/versionium_branches tables — real, with a real commit chain (parentId/headCommitId). The data model for branch and rewind is already there; only the verbs are missing."
    - "cortex/cortex-v2.js — already ships `versionium status`, `versionium log [n]`, `versionium chain <uuid>` as real CLI commands reading the real tables. AB5's surface is not new UX, it is the missing half of a UX that already exists."

  governing_axioms:
    - "§8.6 reuse before build — every phase here is a wiring or a composition. AB1 is two call sites. AB3 reuses toolScope. AB4 composes cortex/snapshot. Nothing below is a new engine."
    - "§10.3 one source of truth — AB3 must NOT create a second tool registry; the per-system toolbox is a VIEW over tool-index + capability-registry. AB4 must NOT create a second rollback; cortex/snapshot's is real and proven."
    - "§1.1 declared ≠ real — AB1 exists because a phase was marked DONE while the thing it feeds stayed empty. AB6 generalises that check rather than trusting the next DONE marker."
    - "§1.2 never silent — an autonomy loop reading an empty signal source does not fail; it proposes nothing, forever, and looks healthy. That is the exact failure shape this map is aimed at."

  phases:

    AB1_tool_index_is_actually_written_to:
      priority: P0 — a live break in the autonomy loop. Everything else here depends on it having data.
      depends_on: []
      severity_evidence: >
        lib/constant-autonomy.js:80-85 calls _toolIndex().list({withEdgeCases:true})
        and proposes "investigate edge case in tool X" from the worst result.
        lib/tool-index.js's register() and record() are real and correct.
        NOTHING CALLS EITHER ONE. Grepped the whole tree: the only non-test
        references are loom map declarations and the tests themselves.
        lib/agent-tools/index.js's registerTool() (line 36) sets TOOLS and
        returns; executeTool() never records an observation. Confirmed on the
        data side too — data/cortex/memory/tool_index.json does not exist, so
        the table has never received a single row in the life of this repo.
      consequence: >
        AU7's constant-autonomy loop has one of its signal sources permanently
        empty. It does not error, it does not warn, it just never proposes
        anything from tool usage — and the SB6 phase that declared this
        directory "ALREADY REAL, verified directly" verified the CODE, which is
        real, without checking that anything feeds it. All 56 tools are
        invisible to the system's own self-improvement loop.
      does: >
        Two call sites. registerTool() also calls toolIndex.register({id, file,
        dir, provides}) — file/dir are derivable from the require path already
        used at registration. executeTool() also calls toolIndex.record({tool,
        ok, edgeCase, consumer}) around the existing try/catch, where ok===false
        is already known because the catch already fires. Neither call may throw
        into the tool path: index failure degrades the index, never a tool.
      gate: >
        After one real session, data/cortex/memory/tool_index.json exists with
        56 rows, calls>0 on every tool that ran, and a deliberately-failed tool
        call produces a real edgeCases entry. constant-autonomy's defaultPropose
        then returns an investigate-edge-case proposal sourced from real data —
        verified by reading the row, not by the proposal merely being non-empty.
      risk: >
        Low. Both call sites are additive and wrapped. The real risk is the
        opposite of breakage: the autonomy loop starts proposing for the first
        time, on 56 tools' worth of backlog it has never seen.

    AB2_every_tool_declares_its_owning_system:
      priority: HIGH — AB3 cannot exist without it.
      depends_on: [AB1]
      does: >
        Tools are filed by category, not by system, so "cortex's toolbox" is not
        currently a question the tree can answer. Add a `system` field to each
        registered tool, DERIVED not hand-typed: a tool's real require() targets
        already say what it touches (versionium-commit requires cortex/versionium,
        loom-register requires loom/, switch-agent requires copilot/lib/self-model
        + lib/ncp-availability). Resolve through lib/loom-map.js's real
        resolveComponent()/resolveSystem() — which exists precisely to answer
        "what component is this" and is honest about unmapped ids rather than
        guessing. A tool touching several systems gets several; a tool touching
        none gets 'general', explicitly, not silently.
      gate: >
        Every one of the 56 tools resolves to at least one system or is
        explicitly 'general', and the mapping is reproducible from the files
        themselves — regenerate it twice, get the same answer, with no hand-
        maintained list to drift.
      note: >
        This is the same derive-don't-declare discipline loom/maps/*.js already
        uses for wires ("edges below are real require() calls, read directly
        from each file, not recalled"). Do not hand-write a tool→system table.

    AB3_per_system_toolbox:
      priority: HIGH — the ask, and the payoff for AB1+AB2.
      depends_on: [AB1, AB2]
      does: >
        toolboxFor(system) — a VIEW, not a registry (§10.3). Composes AB2's
        derived tool→system mapping with AB1's live usage/edge-case data and
        lib/capability-registry's already-real per-system route list, and
        expresses the result as a toolScope array, which lib/hat-forge.js
        already validates and lib/copilot/tool-runtime.js already enforces. So
        "guardian's toolbox" becomes a real, wearable scope, not documentation.
        Surface it where the existing per-system surfaces already are: loom's
        /api/component/:system (R5) and the tablet's per-system panel (OB5),
        rather than a new page.
      gate: >
        toolboxFor('cortex') returns a non-empty scope whose every entry is a
        registered tool name that hat-forge.validate() accepts; wearing that
        scope demonstrably narrows the tool set an agent is offered, verified by
        the offered-schema count changing, not by the scope object existing.
      open_question: >
        Whether a system toolbox should be advisory (a default the person can
        exceed) or enforcing (a hard ceiling). Not decided here — that is a
        governance call, and RAID already owns governance. Flagged, not assumed.

    AB4_versionium_rewind_branch_snapshot:
      priority: HIGH — the second explicit ask, and the honest gap the tooling already admits to.
      depends_on: []
      does: >
        cortex/versionium/index.js exports init/stop/setDeps/commit and nothing
        else. The commit chain is already real (commitId/parentId, branches with
        headCommitId), so the data model for the missing verbs exists. Add:
        rewind(commitId) — resolve the commit, then delegate to cortex/snapshot's
        REAL rollback rather than writing a second restore path; branch(name,
        fromCommitId) and checkout(branch) over the existing versionium_branches
        table; snapshotAt(commitId) — bind a versionium commit to a
        cortex/snapshot id so a commit is rewindable at all, which today it is
        not.
      gate: >
        A real commit, a real mutation, a real rewind, and the store's CONTENT
        matches the pre-mutation content — compared by data, exactly as R2's own
        rollback gate was proven ("2 real rows, mutated, rolled back, restored to
        EXACTLY the original content, verified by data not just a success flag").
        A success flag is not the gate.
      risk: >
        Highest-blast-radius phase in this map. rollback() deletes and re-inserts
        whole tables. It must run against an isolated scratch table first, the
        same way R2 proved itself, and never be wired to anything automatic in
        the same pass that builds it.
      note: >
        versionium_commits currently holds ONE row and versionium_branches ONE.
        There is essentially no history to rewind through yet — build the verbs,
        but do not claim a working time machine on a one-row chain.

    AB5_versionium_as_a_first_class_tool_and_command:
      priority: MEDIUM — the surface for AB4. Worthless before it.
      depends_on: [AB4]
      does: >
        lib/agent-tools/tools/governance/versionium-commit.js deliberately wraps
        only commit(), and its header says why: "wrapping rewind/branch here
        would be exposing a tool that calls nothing." Once AB4 lands, that
        constraint is gone — widen it to the real surface and rename it for what
        it then is. cortex-v2.js already ships `versionium status|log|chain`
        against the real tables; add the write-side commands beside them.
      gate: >
        The tool's own description no longer needs the sentence explaining what
        does not exist. That sentence disappearing IS the gate — it was written
        as a truth marker, so removing it while anything is still missing would
        be a regression, not a completion.

    AB6_the_declared_vs_fed_audit:
      priority: MEDIUM — AB1 generalised, so the next empty signal source is found before it costs a phase.
      depends_on: [AB1]
      does: >
        AB1 is one instance of a shape: a real module with a real API, marked
        DONE, wired to a real consumer, and fed by nothing. Sweep for the rest —
        for every jaaDB table a module declares it WRITES (the §M2 headers
        already state this per module), check whether any row has ever been
        written. Zero rows plus a live reader is the signature. Known instances
        already found by hand this session, both currently true: tool_index
        (AB1) and phasemap_history (loom's scanner persists it; the file does not
        exist). fault_taxonomy was found the same way on 2026-08-12 — R7's note
        records "fault_taxonomy currently 0 rows — the escalation organ was never
        built, checked not assumed."
      gate: >
        A real report listing every declared-write table with its actual row
        count, and every zero-row table that has a live reader named. Findings
        filed as real gaps via lib/gap-field.js, not printed and lost.
      note: >
        This is cheap and it pays for itself once. It is the mechanical version
        of what found AB1, which was found by accident while grounding a
        different ask.

  not_mapped_here_on_purpose:   # §10.3 — these are already someone else's phases
    - "BUILD CAPABILITY → docs/nexus-self-build-pipeline-phasemap.spec SB2-SB9. SB1 done. SB2 (universal file parse) and SB3 (guided build loop) are the two that actually unlock 'the system builds'."
    - "AGENT AUTONOMY → docs/agent-intelligence-loop-phasemap.spec AP2-AP5 (AP1 done). AP5 is literally 'autonomous build loop'."
    - "ROUTING FIDELITY → docs/raid-routing-fidelity-phasemap.spec RR1-RR7. Zero phases started since it was mapped 2026-08-08."
    - "AGENT/USER CONTINUITY → docs/agent-model-and-user-continuity-phasemap.spec, AM4+AM5 done, the other eight open."
    - "DISPATCH → docs/ncp-agent-connection-phasemap.spec NC1 is P0 and LIVE: copilot's Guardian dispatch guard reads .connected off a string, so it bails on every call where guardian answers. Nothing in THIS map matters if a co-pilot cannot reach an agent."
    - "OM4's unmet gate → recorded in copilot-omniscience-phasemap.spec's own corrections_2026_08_14 block. Left there; it belongs to that map."

  ordering_note: >
    AB1 first and alone — it is two call sites, it is the cheapest phase in the
    map, and it turns on a signal the autonomy loop has been reading blind since
    it was built. AB4 is independent of AB1-AB3 and can run in parallel by
    someone else, but it is the one phase here that can destroy data, so it gets
    its own commit and R2's own proof discipline. AB2 → AB3 only after AB1 has
    real rows, because a toolbox built on an empty index is a category listing
    with no usage in it. AB6 last, once AB1 has proven the shape it looks for.
