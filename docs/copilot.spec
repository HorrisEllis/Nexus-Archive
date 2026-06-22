spec:
  meta:
    name:        copilot
    version:     1.2.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-copilot-v1-0000-0000-0000-000000000001
    status:      built
    purpose: >
      Full-context assistant: continuous bus listener + RAID-gated CLI tool
      execution + cortex-persisted memory + narrated response. Deliberately
      does NOT reinvent context-building (lib/context-builder.js), tool
      permissions (cortex/contract/index.js via RAID's _approveTool), memory
      storage (writes through to cortex's JAA event_log), or the OpenAI/
      ollama clients (reuses guardian/api-dispatch.js and
      guardian/agents/ollama.js respectively) — the new piece is the glue
      connecting them, plus the continuous listener.

  path_note: >
    Requested at guardian/agents/ollama/co-pilot/. That collides with the
    existing guardian/agents/ollama.js (a flat file, not a directory).
    Built at guardian/agents/co-pilot/ instead — sibling, not nested.

  architecture:
    location: guardian/agents/co-pilot/index.js
    listener: >
      Polls bus.sample(n) every 1s, deduped by sequence number. NOT a
      wildcard .on('*', fn) subscription — checked SISOStream's actual
      class directly: on(type, fn) is per-exact-type only, no wildcard
      support exists. A wildcard subscription would have silently
      registered a listener for a literal type '*' that never fires,
      since nothing ever emits that literal string.
    memory: cortex's JAA event_log — every observed bus event and every
      decision (executed/denied/reason) is written there, not to a
      co-pilot-private store.
    tool_execution: >
      Routes through guardian's existing /cli/exec via HTTP self-call —
      reuses the already-tested §LAW II ledger-before-execute path
      rather than a second execution mechanism.

  raid_gate:
    location: cortex/core/raid/index.js — _approveTool(source, command, opts)
    fail_closed: >
      Unregistered sources fall back to cortex/contract/index.js's
      _default contract, which explicitly denies 'tool' — checked
      getContract()'s real fallback behavior directly (it never returns
      falsy, so a naive "if (!contract)" check would have been dead
      code; fixed before shipping).
    rate_limiting: per-source, per-action, sliding window — reuses
      contract.rate_limits, doesn't invent a second limit system.
    tests: "9/9 PASSING (tests/modules/raid-approve-tool.test.js)"

  narration:
    location: guardian/agents/co-pilot/index.js — _narrate(prompt, context, toolResult, provider)
    law_i: >
      Default (no provider specified): ollama is tried first if
      ollamaAgent.isRunning() is true. Only falls through to chatgpt if
      ollama isn't running or its generate() call throws — never silent,
      every outcome names which provider answered or why neither did.
      An explicit provider request ('ollama' or 'chatgpt') is honored as
      given — failure there reports the error, it does not silently
      reroute to the other provider. UI dropdown: #cp-provider in
      ui/home/index.html's #assistant-row, three options (Auto/Ollama/
      ChatGPT), wired into the POST body's `provider` field.
    ollama_path: >
      guardian/agents/ollama.js's generate(system, prompt) — added this
      session as a thin export of the _generate() primitive that
      dispatch()/_tick() already used internally for the job-queue path.
      Same underlying call, now reachable directly for a synchronous
      request/response instead of going through agent_calls.
    chatgpt_path: >
      §FIX 2026-06-22 (James): this used to call
      guardian/api-dispatch.js's dispatch('chatgpt', prompt, { system })
      directly — a paid OpenAI API call requiring OPENAI_API_KEY. Wrong
      mechanism for an everyday narrator with no key configured, and not
      what this system is built around. Corrected: now calls
      guardian/server.js's dispatchJobAndWait('chatgpt', combinedPrompt,
      opts) — a Promise wrapper around the REAL createJob()/dispatchJob()
      path, same one /cli/exec's `send <provider> <prompt>` already uses.
      Goes through the actual logged-in browser tab via
      guardian/userscript-chatgpt.js + lib/ncp.js — no API key, no per-
      token cost, the mechanism every other "chatgpt" surface in this
      system already uses by default. Still NOT guardian/agents/
      chatgpt-mode.js — that does its own Nexus-records retrieval as its
      whole purpose (and DOES call api-dispatch.js by design, for that
      separate feature); co-pilot already built its own context via
      lib/context-builder.js, routing through chatgpt-mode here would
      retrieve twice for the same prompt. The NCP job shape has no
      separate system-role field (handleJob() in userscript-chatgpt.js
      just concatenates prompt+content into one message) — _narrate()
      builds one combined string itself rather than relying on that
      concatenation's field order.
    chatgpt_path_caveat: >
      This path needs an actual chatgpt.com browser tab open with the
      userscript installed and connected via NCP. If none is connected,
      dispatchJobAndWait queues the job (guardian/server.js's existing
      pendingQueue) and the 90s timeout (see orchestrator.js's proxy
      timeout) will likely fire before a human opens one — reports a
      clear timeout error either way, never hangs silently.
    sections_bug_fix: >
      context-builder.js returns `sections: sections.length` — already a
      number. handlePrompt() was computing
      `context.sections?.length || 0` — calling .length on a number,
      which is undefined, so this always read 0 regardless of how much
      context actually got built (confirmed: at minimum 4 sections fire
      unconditionally on every real call). Fixed to `context.sections || 0`.
      The two existing test mocks (tests/modules/copilot.test.js CP-04,
      CP-06) encoded the same bug as an array shape (`sections: []`) —
      updated to the real shape (a count) so the suite models the actual
      contract, not the bug.

  contract:
    location: cortex/contract/index.js — CONTRACTS['copilot']
    allowed_actions: [chat, diagnose, tool]
    denied_actions: [forge]   # co-pilot assists and executes vetted commands; does not author/dispatch forge jobs itself
    rate_limits:
      tool: "20/60s — much tighter than ollama's raw 'tool' allowance"

  verified_live: >
    Real boot test, not just unit tests: guardian booted 13/13 phases
    clean, co-pilot phase confirmed "RAID gate available". Live HTTP
    round-trip: a chat prompt built real context (408 tokens) with zero
    tool execution; a tool-call prompt ("jobs") was approved by RAID,
    executed through the real /cli/exec, and returned actual job records
    from the live JAA store (15 real entries, not mocked). Narration path
    NOT yet boot-tested live this session — unit-tested only (CP-08
    through CP-12), all four narration branches (ollama success, LAW I
    fallback, explicit-provider failure not rerouting, neither provider
    available) mocked and passing. Flagging the gap rather than claiming
    more than what's actually been run.

  tests:
    raid_gate: "9/9 PASSING — tests/modules/raid-approve-tool.test.js"
    module:    "12/12 PASSING — tests/modules/copilot.test.js (was 7/7; CP-08 through CP-12 added for the sections fix + narration)"

  not_built:
    - "File indexing (treat any file on disk as paste/upload) — not started"
    - "Floating menu button (home-ui) wired to this as its backend — Phase 65's job, not done here"
    - "config.json dynamically editable by RAID — explicitly NOT built, on purpose: RAID's job is routing, not governing tool permissions. That boundary is load-bearing, not an oversight."

  changelog:
    - version: 1.2.0
      date: 2026-06-22
      notes: >
        §FIX (James, immediate priority): chatgpt narration was calling
        guardian/api-dispatch.js directly — needs OPENAI_API_KEY, a paid
        API mechanism that has no business being the default for an
        everyday narrator. Removed entirely (no require() of
        api-dispatch.js remains in this file — enforced by a real test,
        CP-13). Replaced with guardian/server.js's new
        dispatchJobAndWait(), a Promise wrapper around the actual
        createJob()/dispatchJob() path — the same NCP/userscript browser-
        tab mechanism /cli/exec's `send` command already uses, no API key
        needed. Tests: 12/12 → 13/13.
    - version: 1.1.0
      date: 2026-06-22
      notes: >
        Narrator mode built — was the one item in not_built last version.
        LAW I ollama-first/chatgpt-fallback narration, explicit-provider
        override, sections-count display bug fixed (was always reading 0),
        UI provider dropdown added (#cp-provider, ui/home/index.html).
        guardian/agents/ollama.js gained generate() as a direct export of
        its existing _generate() primitive. Tests: 7/7 → 12/12.
    - version: 1.0.0
      date: 2026-06-21
      notes: "Initial build — see architecture/raid_gate/contract above."
