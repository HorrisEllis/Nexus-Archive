spec:
  meta:
    name:        copilot
    version:     2.0.0
    uuid:        nexus-copilot-v2-0000-0000-0000-000000000001
    phase:       24.0
    status:      active
    comp_id:     guardian.copilot
    hook_id:     guardian.copilot:v2:p0001
    seam_id:     guardian.copilot:v2:p0001
    route:       POST /api/guardian/copilot/prompt
    entry_point: guardian/agents/co-pilot/index.js
    context_lib: lib/copilot-context.js

  purpose: >
    The primary entry point to NEXUS. Every user interaction goes through here.
    v2: complete system awareness via 7 sensing layers assembled concurrently
    before every response. Mistral receives the full live snapshot — every
    answer is grounded in reality, not assumption.

  design_principles:
    - 7 sensing layers assembled concurrently before every response
    - Each layer has its own timeout — one stalled layer never blocks the rest
    - Mistral receives full snapshot — complete context for every answer
    - Token-by-token streaming emitted to bus (copilot.token)
    - Repair proposals: high-severity gaps written to Idearium automatically
    - Honest fallback: if Ollama offline, show raw snapshot from live state
    - Cortex health fix: checks status === 'ok' (not r?.ok which was always false)

  seven_layers:
    L0_live_event_bus:
      sources: [GET /bus?n=30]
      provides: recent event types, gate states, sequence numbers
      budget_tokens: 200

    L1_process_telemetry:
      sources: [GET /health (guardian)]
      provides: uptime, job count, heap usage, version
      budget_tokens: 120

    L2_provider_health:
      sources: [GET /providers, GET :3748/health, GET :9000/health, GET :11434/api/tags]
      provides: NCP tab status + heartbeat, cortex/orch health, Ollama models
      budget_tokens: 180
      bug_fix: >
        cortex returns { status: 'ok' } not { ok: true }.
        All consoles now check r?.status === 'ok' || r?.ok === true.

    L3_structural_integrity:
      sources: [GET /gaps?status=open, GET /seam/queues, GET :3748/api/jaa/reflection_contracts]
      provides: open gaps by severity, SEAM queue depth, reflection contract counts
      budget_tokens: 300

    L4_cfr_field:
      sources: [GET :3748/cfr/health, GET :3748/cfr/deltas]
      provides: regime, sigma score, coherence, friction, entropy, recent deltas
      budget_tokens: 200

    L5_memory_artifacts:
      sources: [GET :3748/api/jaa/chat_log, GET :3748/api/jaa/decision_log,
                GET /artifacts, GET :4800/api/ideas]
      provides: recent exchanges, decisions, artifact names, open ideas
      budget_tokens: 280

    L6_predictive_intent:
      sources: [GET :3748/api/intelligence/patterns, event buffer, GET /jobs]
      provides: crystallized patterns, session velocity (jobs/10min), intent hint
      budget_tokens: 180

  tools:
    added_in_v2: [patterns, cfr, artifacts]
    all_via: /cli/exec in guardian/server.js
    list:
      /gaps [--status open] [--severity high]
      /jobs [--status delivered] [--limit N]
      /health
      /stats
      /providers
      /ledger [--limit N]
      /bus [--limit N]
      /seam queues
      /send <provider> <prompt>
      /status
      /ideas
      /patterns
      /cfr
      /artifacts [--limit N]

  agent_console_routing:
    v1_problem: >
      Claude/ChatGPT/Gemini consoles all routed through copilot/prompt
      (Ollama/Mistral) regardless of whether a NCP tab was connected.
      Sending to Claude console → Mistral responds, not Claude.
    v2_fix: >
      Each console now checks providers first.
      If tab connected: dispatch via POST /command + poll /jobs until complete.
      If no tab: fall back to co-pilot/prompt (Mistral) with honest message.

  response_shape:
    ok:             boolean
    requestId:      uuid
    text:           string — always present, always displayable
    modelUsed:      string | null
    classification: { intent, tool, confidence }
    contextLayers:  number — how many layers successfully assembled
    tokensUsed:     number — approximate tokens in snapshot

  streaming:
    bus_event:      copilot.token { token: string, model: string }
    purpose:        token-by-token for streaming UI (future UI wires to this)

  repair_proposals:
    trigger:        high-severity gaps in snapshot
    target:         POST :4800/api/ideas
    compartment:    copilot-repairs
    async:          true — never blocks response

  bugs_fixed:
    - cortex health offline: r?.ok always false → now checks r?.status === 'ok'
    - claude/chatgpt consoles routed to Mistral instead of NCP tab
    - event buffer: 200 → 500, poll interval 1000ms → 800ms

  roadmap:
    done_v2:
      - 7-layer context snapshot
      - concurrent layer assembly with per-layer timeouts
      - token streaming to bus
      - repair proposals to Idearium
      - cortex health fix
      - NCP routing fix in all agent consoles
    next:
      - streaming token output to agent console UI (wire copilot.token → SSE)
      - layer caching: L5/L6 cached 30s (expensive reads)
      - user model injection (phase 12 context)
      - Qwen narrates tool results in plain language
      - proactive surfacing: co-pilot pushes critical alerts on load without prompt
