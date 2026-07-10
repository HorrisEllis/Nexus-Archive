spec:
  meta:
    name:        copilot
    version:     3.2.0
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


# ── ADDENDUM 2026-07-09 (v3.2.0) — what changed this session ──
# Verified against real source, tested, 97/97 baseline held. Each item
# is a real wire or fix, not a claim:
#   - 4 declared intents wired (navigate/note/tool/action) — were declared, none implemented
#   - tool intent routes action-shaped prompts through ollama's real agent-tools loop (read_file/run_command/diagnose/move_data/run_pipeline)
#   - adversarial faculty wired with a narrow trigger; AX-008 bridge+diagnostic SSE streams into copilot's live buffer
#   - fluid agent routing (extractExplicitAgent) + lifeline /command transport fix (was posting to a removed route, every escalation silently 404ing)
