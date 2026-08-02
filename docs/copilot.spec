spec:
  meta:
    name:        copilot
    version:     2.0.0
    foundation:  nexus-system-foundation@1.0.0
    port:        3750
    uuid:        nexus-copilot-v2-0000-2026-0627-jamesbrooks-001
    status:      active
    purpose: >
      Sovereign co-pilot system. Separated from Guardian.
      Receives intent, assembles context, routes to RAID, returns response.
      Guardian is dispatch. Co-pilot is intelligence. They are separate.
      If Guardian goes down, the co-pilot can still answer from Cortex memory.
      Every exchange is tracked hook-to-hook through CFR.

  core:
    schemas:
      CopilotRequest:
        uuid:        string   # requestId — propagates through all hops
        sessionId:   string   # user session
        prompt:      string
        channel:     string   # which UI channel sent this
        channelName: string
        uiState:     object   # NEXUS_UI_STATE snapshot from browser
        ts:          number

      CopilotResponse:
        requestId:   string
        ok:          boolean
        text:        string
        modelUsed:   string   # 'data-only' | 'ollama' | 'claude' | 'chatgpt' etc
        intent:      string   # classified intent
        fromGrammar: boolean
        componentId: string   # which component handled it
        hookId:      string   # which hook
        tokensUsed:  number
        contextLayers: number # 0-7
        ui:          object   # optional UI instructions (spotlight, navigate)
        ts:          number

      CopilotSession:
        sessionId:   string
        userId:      string
        channel:     string
        startedAt:   number
        exchanges:   number
        lastActive:  number

    axioms:
      - AX-001  validate all inputs
      - AX-002  no silent failures
      - AX-003  write to Cortex before responding
      - AX-005  event bus — results posted, not returned directly
      - AX-007  self-describing

    constants:
      CONTEXT_LAYERS:         7
      TOKEN_FIRST_THRESHOLD:  0.6   # grammar confidence above this = no Ollama
      SESSION_TIMEOUT_MS:     3600000
      MAX_PROMPT_LENGTH:      8000
      DATA_ANSWER_FAST_PATH:  true  # attempt data answer before any model

  events:
    emits:
      - 'copilot.booted'
      - 'copilot.prompt.received'     # before any processing
      - 'copilot.intent.classified'   # after RAID classification
      - 'copilot.answer.data-only'    # answered without a model
      - 'copilot.answer.model'        # answered via model
      - 'copilot.action.dispatched'   # action intent routed to tool
      - 'copilot.navigate'            # UI navigation command
      - 'copilot.spotlight'           # UI spotlight command
      - 'copilot.error'
    handles:
      - 'ollama.job.complete'         # model response arrives back
      - 'cortex.raid.decide.result'   # RAID tells copilot where to route
      - 'orchestrator.shutdown'

  routes:
    - method: POST  path: /api/prompt
      body: "CopilotRequest"
      returns: "CopilotResponse"
      description: "Primary entry. All co-pilot interactions."

    - method: POST  path: /api/channel
      body: "{ sessionId, channel, channelName, uiState }"
      returns: "{ ok }"
      description: "Update current channel context for session"

    - method: GET   path: /api/sessions
      returns: "{ sessions: CopilotSession[] }"

    - method: GET   path: /api/sessions/:sessionId
      returns: "CopilotSession + recent exchanges from Cortex chat_log"

    - method: GET   path: /api/context/:sessionId
      returns: "Assembled 7-layer context snapshot for session"

    - method: GET   path: /health
    - method: GET   path: /contract
    - method: GET   path: /events

  handshake:
    components:
      - id: 'copilot.prompt'
        uuid: 'nexus-copilot-comp-prompt-v2-001'
        grammar: ['ask', 'copilot', 'cp']
        route: { method: POST, path: '/api/prompt' }
        hooks:
          in:
            - id: 'copilot.prompt.receive'
              intent: ['ask', 'build', 'diagnose', 'navigate', 'note', 'tool', 'action']
              contract: 'nexus-interaction-contract-v1::copilot'
              tags: ['copilot', 'user-intent', 'entry-point']
          out:
            - id: 'copilot.prompt.to-raid'
              wires_to: ['cortex.raid.receive']
              tags: ['classification', 'routing']
            - id: 'copilot.prompt.to-ollama'
              wires_to: ['ollama.jobs.dispatch.receive']
              tags: ['synthesis', 'model']
            - id: 'copilot.prompt.to-cortex-memory'
              wires_to: ['cortex.memory.chat_log.write']
              tags: ['persist', 'memory']
            - id: 'copilot.prompt.reply'
              wires_to: ['ui.copilot.receive']
              tags: ['response', 'terminal']

  modules:
    - id: intent-classifier
      path: copilot/intent-classifier.js
      description: >
        Token-first fast path before any model.
        Greeting RE, slash commands, single-word tools, grammar trie.
        Falls through to RAID classify() for everything else.
        Returns: { intent, tool, confidence, fromGrammar, componentId }

    - id: context-assembler
      path: copilot/context-assembler.js
      description: >
        7-layer context. L0 bus events, L1 telemetry, L2 provider health,
        L3 gaps + SEAM, L4 CFR-Ω, L5 memory + artifacts, L6 predictive intent.
        Reads from Cortex (:3748) not Guardian.
        User model hypotheses, recent notes, chat_log session history.
        Returns assembled text block injected into model system prompt.

    - id: data-answerer
      path: copilot/data-answerer.js
      description: >
        Answers from live API reads without any model.
        Greetings, status, gap count, sigma, provider list, pattern summary,
        recent notes, RCA findings, current channel state.
        TOKEN_FIRST_THRESHOLD: if grammar confidence >= 0.6, answer here.
        Never calls Ollama for questions answerable from the field.

    - id: action-router
      path: copilot/action-router.js
      description: >
        Routes action intents to the right component via RAID.
        'build X' → emerge.compiler via ollama
        'diagnose' → cortex.intelligence.rca
        'note: X' → cortex.memory.user_notes + idearium.idea
        'navigate X' → emits copilot.navigate event → UI shell
        'spotlight X' → emits copilot.spotlight event → UI spotlight module
        Every dispatch carries full wire context for CFR.

    - id: session-manager
      path: copilot/session-manager.js
      description: >
        One session per browser tab / terminal connection.
        Reads chat_log from Cortex to rebuild session history.
        SESSION_TIMEOUT_MS: idle sessions expire.
        On new session: reads user_model_hypotheses for personalization.

    - id: memory-writer
      path: copilot/memory-writer.js
      description: >
        All writes go to Cortex via POST :3748/api/memory/insert.
        Tables: chat_log, user_model_hypotheses, user_notes.
        Every write carries: requestId, sessionId, componentId, hookId.
        Fallback: buffer locally if Cortex offline, flush on reconnect.

    - id: server
      path: copilot/server.js
      description: >
        HTTP server on :3750.
        SSE /events stream.
        Registers with orchestrator on boot.

  what_leaves_guardian:
    remove:
      - "guardian/agents/co-pilot/index.js"       # moves to copilot/
      - "guardian/agents/co-pilot/context.js"     # moves to copilot/context-assembler.js
    guardian_keeps:
      - "POST /command → SEAM queue dispatch"
      - "POST /build → T2 gate"
      - "NCP channel management"
      - "Job queue + SSE to browser tabs"
    orchestrator_update:
      - "POST /api/guardian/copilot/prompt → proxies to :3750/api/prompt"
      - "Existing clients still work. No breaking change."

  tests:
    - 'POST /api/prompt "hello" → 200 + text, modelUsed: data-only'
    - 'POST /api/prompt "/gaps" → 200 + gap count, zero model calls'
    - 'POST /api/prompt "build X" → 200 + dispatched to emerge.compiler'
    - 'POST /api/prompt "go to guardian" → 200 + ui.navigate in response'
    - 'POST /api/prompt "note: X" → 200 + written to cortex.memory'
    - 'chat_log written to Cortex on every exchange'
    - 'user_model_hypotheses updated on channel visit'
    - 'session survives Guardian restart'
    - 'context-assembler reads from :3748 not :7820'
    - 'wire context (requestId, componentId, hookId) on every CFR entry'

---
## ADDENDUM 2026-07-30 — CA1 status report + awareness/routing arc (docs/copilot-awareness-routing-phasemap.spec)
Co-pilot gained a real status path (copilot/system-status.js): a status query ("how are you", "system status", "how is nexus doing") is intercepted BEFORE the LLM dispatch and answered by POLLING live health across 7 systems + open gaps + loom's wired-component count (§16.2 legible). This replaces the canned "I don't have enough context" reply. §8.6 — composes existing /health + gaps + loom (:3752), no new monitoring. Non-fatal (unreachable source → 'unknown', never throws).
Mapped next (docs/copilot-awareness-routing-phasemap.spec, NOT yet built): CA2 tool self-awareness (per-tool edge-case + how-to-use notes injected into context), CA3 tool-first (look for a tool BEFORE the lifeline offer), CA4 capability-extend ("no is not an answer" → unmet request becomes a module_builder/forge gap), CA5 intent routing (see raid.spec addendum), CA6 editable routing/token/constraint config (cortex rows), CA7 ClearGlass multi-account gear.

---
## ADDENDUM 2026-07-30 — CHUNK A complete: co-pilot is self-aware (CA1+CA2+CA3)
CA2 (lib/agent-tools/tool-guide.js): every one of the 17 tools now carries an operational usage note — how/when to use it, its edge cases, and when to prefer it over another — injected into the co-pilot system prompt (tool-runtime.js). Descriptions say WHAT a tool does; the guide says HOW and WHEN. The guide is versioned (GUIDE_VERSION) so a tool's behavior drifting from its note is detectable (§12.5). CA3: the system prompt now instructs TOOL-FIRST — co-pilot looks for a tool that fulfills the request before answering from memory or escalating (this runs conceptually ahead of the lifeline offer). Together with CA1 (status), CHUNK A ships "co-pilot is self-aware": it knows the system's state, its own tools, and reaches for them first.

---
## ADDENDUM 2026-07-30 — CHUNK B complete: co-pilot extends itself (CA4)
CA4 (copilot/capability-extend.js): "no is not an answer." When no tool AND no agent can fulfill a request (shouldExtend detects the both-failed point), co-pilot files a capability_extension gap through cortex's existing gap engine (POST /api/gaps → gaps table + cortex.gap.found bus, which gap-finder/forge already consume) and answers "I can't do that with what I have YET — but I've logged it as a capability to build." The unmet request becomes tracked work routed toward module_builder, never a bare refusal (§1.2 loud, not a dead end). §8.6 builds on the existing gap engine + module_builder; §0.4 turns "I can't" into "not yet".

---
## ADDENDUM 2026-07-30 — CHUNK D: CA7 ClearGlass multi-account (backend)
CA7 (lib/account-registry.js): providers (claude/chatgpt/gemini/perplexity) can now have MULTIPLE account slots (James: "login to multiple accounts in ClearGlass like an app password"), stored as editable cortex rows (provider_accounts table). addAccount/listAccounts/getAccountForRoute/setAccountStatus/removeAccount. CA5 routing now carries route.account (default or named) so ClearGlass logs into the right account for the chosen provider. SECURITY: credentials are stored as a REFERENCE (key name / app-password id, e.g. "kc:claude-work"), NOT a raw secret — the real secret lives in the OS/Electron credential store the ClearGlass shell resolves at login. A failed account is observable (§1.2), removal archives (§0.3). HONEST SCOPE: the tv-ui GEAR and the LIVE multi-account login are Electron-side and prove out on James's machine; this backend is the read/write surface they use. Full awareness/routing arc CA1-CA7 built, suite 1223/0.
