spec:
  meta:
    name:        copilot
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-copilot-v1-0000-0000-0000-000000000001
    status:      built
    purpose: >
      Full-context assistant: continuous bus listener + RAID-gated CLI tool
      execution + cortex-persisted memory. Deliberately does NOT reinvent
      context-building (lib/context-builder.js), tool permissions
      (cortex/contract/index.js via RAID's _approveTool), or memory storage
      (writes through to cortex's JAA event_log) — the new piece is the
      glue connecting them, plus the continuous listener.

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
    from the live JAA store (15 real entries, not mocked).

  tests:
    raid_gate: "9/9 PASSING — tests/modules/raid-approve-tool.test.js"
    module:    "7/7 PASSING — tests/modules/copilot.test.js"

  not_built:
    - "Live narrator mode (translate system → human language, continuous) — the fork flagged and left open earlier in this session, still unresolved"
    - "File indexing (treat any file on disk as paste/upload) — not started"
    - "Floating menu button (home-ui) wired to this as its backend — Phase 65's job, not done here"
    - "config.json dynamically editable by RAID — explicitly NOT built, on purpose: RAID's job is routing, not governing tool permissions. That boundary is load-bearing, not an oversight."
