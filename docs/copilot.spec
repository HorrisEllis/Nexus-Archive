spec:
  meta:
    name:        copilot
    version:     1.1.0
    uuid:        nexus-copilot-v1-0000-0000-0000-000000000001
    phase:       23.8
    status:      active
    comp_id:     guardian.copilot
    hook_id:     guardian.copilot:v1:p0001
    seam_id:     guardian.copilot:v1:p0001
    route:       POST /api/guardian/copilot/prompt
    entry_point: guardian/agents/co-pilot/index.js

  purpose: >
    The primary entry point to NEXUS. Every user interaction — from the
    floating menu in ui/home/index.html — goes through here. This is not
    a chat wrapper. It is a system operator: it reads live state, classifies
    intent, executes tools, and generates contextual replies.

  design_principles:
    - Read system state before every response (gaps, jobs, health, providers)
    - Classify intent via Qwen (fast, local, ~0.5b — never blocks the response)
    - Tool calls: RAID-gated via /cli/exec (write-through to JAA ledger)
    - Answers: Mistral generates reply with real system state as context
    - Honest fallback: if Ollama offline, show raw system state from JAA
    - Slash prefix convention: /toolname maps directly to /cli/exec commands

  axioms:
    §1.1: every tool execution verified — result shown, never assumed
    §1.2: every decision logged to event_log before and after
    §2.1: JAA write before any tool execution (via /cli/exec §LAW II)
    §5.1: UUID + hookId on every decision and reply
    §5.7: no sibling imports — everything through execFn or HTTP seam

  intent_classification:
    engine:  Qwen (qwen2.5-coder:1.5b preferred — fast, local)
    classes:
      tool:     user wants to see system data → /cli/exec command
      action:   user wants to repair/run something → RAID-gated /cli/exec
      question: user wants explanation → Mistral reply with system context
    fallback:   heuristic keyword matching when Qwen offline

  tools:
    all_available_via: /cli/exec in guardian/server.js
    list:
      /gaps [--status open] [--type <type>]   — list gaps from JAA
      /jobs [--status delivered] [--limit N]  — list jobs
      /health                                 — guardian uptime + job count
      /stats                                  — JAA table row counts
      /providers                              — connected NCP tabs
      /ledger [--limit N]                     — recent ledger entries
      /bus [--limit N]                        — recent bus events
      /seam queues                            — active SEAM queues
      /send <provider> <prompt>              — dispatch job to provider
      /status                                — all services online/offline
      /ideas                                 — Idearium open ideas

    raid_gate:
      read_only_commands:  no gate (gaps, jobs, health, stats, providers, ledger, bus, seam, sessions, ideas)
      write_commands:      require _raid._approveTool(SOURCE, cmd) approval
      fail_closed:         if RAID unavailable, write commands are denied

  model_priority:
    - mistral:7b-instruct-q4_K_M   # best reasoning, system-aware replies
    - qwen2.5-coder:1.5b           # fast triage and classification
    - qwen2.5:1.5b                 # fallback
    - qwen2.5:0.5b                 # last resort

  system_state_snapshot:
    reads_before_every_response:
      - gaps (status=open, limit=8)
      - jobs (status=delivered, limit=5)
      - health
      - providers
    purpose: >
      Mistral receives real system state as context. The co-pilot is
      "aware" because it reads actual JAA state, not cached data.
      This is what makes answers about "what is wrong" actually accurate.

  ui_entry_point:
    file:    ui/home/index.html
    element: #assistant-in (floating menu, bottom of screen)
    sends:   POST /api/guardian/copilot/prompt { prompt, contextOpts }
    displays: cp.text (model reply or tool result formatted for reading)
    slash_convention: >
      Input starting with / is treated as explicit tool command.
      Plain text is classified by Qwen then routed to tool or Mistral.

  response_shape:
    ok:           boolean
    requestId:    uuid
    text:         string — always present, always displayable
    modelUsed:    string | null — which Ollama model generated the reply
    toolResult:   object | null — raw tool output if a tool was executed
    classification: { intent, tool, confidence } — Qwen's classification
    systemState:  { gapCount, jobCount } — live counts at response time

  offline_behavior: >
    If Ollama is completely offline:
    - Tool commands: still work (execFn calls /cli/exec, no model needed)
    - Questions: show raw system state from JAA instead of generated reply
    - Never pretend Ollama is online. Never return the placeholder string.

  previous_version:
    version:   1.0.0
    problem:   handlePrompt built context and returned stats blob.
               _ollamaAgent imported but never called. No model invocation.
               UI displayed: "full narrated response not yet built, see docs/copilot.spec"
    fixed_in:  1.1.0

  roadmap:
    done:
      - real Ollama generation (Mistral + Qwen fallback)
      - live system state read before every response
      - slash command → tool execution
      - Qwen intent classification
      - RAID gate on write commands
      - honest Ollama-offline fallback
      - component registry registration
    next:
      - streaming token output to UI (token-by-token as Mistral generates)
      - Qwen narrates tool results in plain language before showing raw data
      - co-pilot writes repair proposals to Idearium when gaps detected
      - memory: Mistral's replies stored to cortex_memory for continuity
      - proactive: co-pilot surfaces critical gaps unprompted on UI load
