spec:
  meta:
    name:        copilot-command-and-chat-target
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-14. CU0 BUILT this session; CU1-CU6 mapped, not built. §3.3.
    uuid:        nexus-copilot-command-chat-target-v0-0000-2026-0814-001
    author:      (mapped this session, per James: "every system has a dynamic CLI,
                 look at blueprint for mapping commands to components, co-pilot can
                 create/execute/edit commands, and: tell co-pilot to switch to
                 Claude and add a chat url to use")
    intent: >
      The immediate ask — "switch to Claude and add a chat URL to use" — turned
      out to be two halves with completely different states, and the split is
      the whole point of this map.

      UPWARD IS ALREADY REAL. Every userscript reports chatId() on every
      heartbeat and chatUrl on every result. guardian/lib/ncp.js's
      updateClient() stores chatId on the live client, /providers exposes it
      under `channels`, and guardian's `sessions` table already persists
      {chat_id, chat_url, name, provider, account} with a real GET
      /session/:chatId. Guardian has always known which conversation each tab
      is in. Nothing was asking it.

      DOWNWARD DOES NOT EXIST. Grepped all four userscripts' _handleServerMessage:
      the complete accepted set is NCP_READY, GUARDIAN_READY, GUARDIAN_CLAIM,
      GUARDIAN_RELEASE, GUARDIAN_JOB, NEXUS_CONTEXT_RESPONSE,
      GUARDIAN_SESSION_NAMED, GUARDIAN_ARTIFACT_SAVED. No navigate, no
      open-chat, no set-conversation. A job lands in whichever conversation the
      tab happens to be sitting in.

      So CU0 (built) does the readable half completely and honestly, and CU1
      maps the half that needs browser-side code this session could not verify
      by running it. The rest of the map covers the CLI/blueprint/command asks,
      where the same pattern repeats: the mechanism is real, the coverage is not.

  built_this_session:
    - "CU0 — lib/chat-target.js (v1.0.0) + the switch_agent/self-model wiring. parse() understands all four providers' real conversation URLs using the EXACT regexes copied from each userscript's own chatId() (so a URL parsed here yields the id the tab will report on its own heartbeat). Provider resolved from clear-glass/src/providers/registry.js's real host list, not a second hostname table. validate() refuses a chatgpt URL bound to claude AT BIND TIME rather than persisting a contradiction. compare() is four-valued — match/elsewhere/new/unknown — because an offline tab is not the same fact as a tab in a different chat. The binding rides on the existing copilot_identity hat row: same governance, same reader, no second store. 13/13 tests against a real socket."
    - "REAL DEFECT FOUND END TO END, NOT IN REVIEW: lib/ncp-availability.js's parser dropped chatId on the floor. Guardian's getProviders() has always returned it, populated from every heartbeat, and the parser simply did not copy it across. Invisible until something asked which conversation a tab was in — compare() then answered a confident 'unknown' about a tab whose chat id was in the same HTTP response. Fixed; pinned by T-010."

  substrate_already_built:   # §8.6
    - "lib/blueprint-index.js — REAL and already does exactly what the ask describes. It projects every registered component into a cliMap entry {command, aliases, usage, method, path, description, componentId, systemId, tags} AND a copilotMap entry {componentId, label, description, intents, contract, hookId}. Component -> command -> intent, generated, not hand-written. Served from orchestrator's /api/blueprint routes and auto-built after registry ready (§BP-01)."
    - "lib/command-builder.js (AU6, DONE 2026-08-08) — parseRequest/resolveCapability/getCommand/listCommands. Co-pilot creating a command from plain language against a real resolved capability is already real, and already reports into lib/tool-index.js."
    - "guardian `sessions` table + GET /session/:chatId — real per-conversation persistence with chat_id, chat_url, name, provider, account. CU2's naming/recall does not need a new store."
    - "lib/agent-tools/tools/browser/browser-action.js — real navigate via ClearGlass's driver.exec. This is the OTHER possible mechanism for CU1 and is why CU1 is a choice between two real paths, not a build-from-nothing."
    - "clear-glass/src/providers/host.js — owns the provider BrowserWindows, injects guardian's own userscripts. Whichever way CU1 goes, this is where a navigate would actually land."

  governing_axioms:
    - "§1.2 never silent — CU0's whole value is that a mismatch is now stated. A job quietly landing in the wrong conversation is the failure this map exists to end."
    - "§10.3 one source of truth — the chat binding lives on the existing hat row; provider hosts come from clear-glass's registry; commands come from blueprint-index. No second table anywhere in this map."
    - "§8.6 reuse before build — CU1 is a message type and four case handlers, not a new transport. CU3 is coverage for a generator that already works."
    - "§1.1 declared ≠ real — CU3 exists because blueprint-index runs correctly and produces zero commands for five systems, which looks identical to 'nothing to do'."

  phases:

    CU1_ncp_can_tell_a_tab_which_chat_to_open:
      priority: P0 for this ask — without it, binding a chat records an intent the system cannot act on.
      depends_on: []
      evidence: >
        All four userscripts' _handleServerMessage accept exactly eight message
        types, none of which is a navigate. guardian/lib/ncp.js already has
        push(provider, data) and pushTab(provider, tabId, data) — the transport
        to send one is real and in use for GUARDIAN_JOB today. The gap is a
        message type and its handlers, not a channel.
      does: >
        Add NCP_OPEN_CHAT { url, chatId } pushed via the existing pushTab, and
        a case in each of the four userscripts that sets location.href when the
        current chatId() differs from the requested one. Re-entrancy matters:
        the tab already tracks _lastPath and logs "Nav →" on change, so the
        handler must no-op when already in the right conversation or it will
        reload on every heartbeat cycle.
      alternative: >
        ClearGlass's browser_action navigate could do this from outside the tab
        instead, with zero userscript changes. It is real and already wired.
        DECIDE, do not build both: in-tab is available to anyone running the
        userscripts under Tampermonkey without ClearGlass; ClearGlass-driven
        works without touching four files that are hard to test. This map does
        not pick — that is a real architectural call and it belongs to James.
      gate: >
        With a claude tab open in chat A, binding chat B and dispatching lands
        the job in chat B — verified by reading the chat_url on the returned
        result, not by the tab appearing to move. And binding the chat it is
        ALREADY in causes no navigation at all.
      risk: >
        Navigating a provider tab mid-job would abandon an in-flight answer. The
        handler must refuse while currentJobId is set, or queue behind it.

    CU2_the_bound_chat_survives_and_is_recallable:
      priority: HIGH
      depends_on: [CU1]
      does: >
        Today the binding lives on the copilot_identity hat row — one binding,
        the current one. Guardian's `sessions` table already stores chat_id +
        chat_url + name + provider per conversation, and GUARDIAN_SESSION_NAMED
        already exists as a real message. Join the two so "switch to claude, the
        NEXUS refactor chat" resolves a NAME to a URL, instead of requiring the
        person to paste a URL every time.
      gate: >
        A named session set once is switchable to by name in a later process,
        resolved from guardian's real sessions table, with an honest failure
        when the name is unknown rather than a silent fallback to whatever tab
        is open.

    CU3_every_system_actually_has_a_dynamic_cli:
      priority: HIGH — the "every system has a dynamic CLI" ask, and it is currently false.
      depends_on: []
      evidence: >
        blueprint-index.json, built live: 11 systems, 135 components. Five of
        the eleven have componentCount 0, cliMap 0, copilotMap 0 — orchestrator,
        cortex, idearium, and the generator is working correctly for the other
        six (guardian 33, clear-glass 31, architect 17, copilot 15, eravos 12,
        bridge 11, emerge 9, ollama 7). The projection is real; the registration
        upstream of it is missing for those systems. cortex having zero CLI
        commands is the loudest one — it is the brain.
      does: >
        Find why those systems register no components. blueprint-index projects
        from the capability registry, so this is a registration gap in those
        systems, not a blueprint bug — confirm that before changing anything in
        lib/blueprint-index.js, which by all evidence works.
      gate: >
        blueprint-index.json shows a non-zero componentCount and cliMap for all
        11 systems, and each new command actually dispatches against its real
        route. A generated command that 404s is worse than an absent one.

    CU4_copilot_edits_and_deletes_commands_not_just_creates:
      priority: MEDIUM
      depends_on: [CU3]
      does: >
        lib/command-builder.js gives parseRequest/resolveCapability/getCommand/
        listCommands — create, read, execute. The ask is create, EXECUTE and
        EDIT. Editing and revoking a built command has no path; check directly
        before building, because the same "already real" surprise has landed
        twice in this session.
      gate: >
        A command created by co-pilot can be renamed, re-pointed at a different
        capability, and revoked, with every change through the same governance
        the create path already passes, and with the tool-index row updated
        rather than orphaned.

    CU5_commands_carry_their_owning_system:
      priority: MEDIUM — converges with AB2/AB3 of autonomous-build-capability.
      depends_on: [CU3]
      does: >
        blueprint's cliMap entries already carry systemId. AB2/AB3 derive
        tool -> system for the 56 agent-tools. These are the same question asked
        twice about two different registries. Resolve them into one per-system
        view — commands AND tools — rather than a system toolbox that knows
        about tools and a CLI that knows about commands and neither knowing the
        other exists.
      gate: >
        toolboxFor('cortex') returns cortex's tools AND cortex's commands from
        one call, sourced from the two existing registries, with no third table.

    CU6_a_job_records_which_conversation_it_landed_in:
      priority: MEDIUM — §1.2, and it is most of what makes CU1 verifiable.
      depends_on: [CU1]
      does: >
        Guardian already writes chat_url and chat_id onto results, sessions and
        artifacts (server.js:1964, 2003, 1991). Close the loop: a job's record
        should carry the conversation it was REQUESTED for alongside the one it
        actually landed in, so a divergence is visible in history rather than
        only in the moment.
      gate: >
        A job dispatched with a bound chat that did not navigate shows both ids
        on its record, and they differ — the divergence is queryable after the
        fact, not just warned about live.

  ordering_note: >
    CU1 is the one that matters for the immediate ask, and it is blocked on a
    decision, not on effort: in-tab NCP message versus ClearGlass-driven
    navigate. Both mechanisms are real and already wired. Pick one, then it is
    a small change. CU3 is independent and is the largest honest gap in this
    map — five of eleven systems have no dynamic CLI at all, and "every system
    has a dynamic CLI" is currently true of six. CU5 should be built together
    with AB2/AB3, not after them, or there will be two per-system views to
    reconcile later.
