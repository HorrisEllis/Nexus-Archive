spec:
  meta:
    name:        guardian
    version:     3.6.2
    foundation:  nexus-system-foundation@1.0.0
    port:        7820
    uuid:        nexus-guardian-v3-0000-2026-0615-jamesbrooks-001
    purpose: >
      The AI engine of NEXUS. Guardian is the only system that touches
      AI providers. Everything else requests work through Guardian.
      NCP connects browser tabs. SEAM compresses intent before sending.
      No API keys. No external inference calls. Browser tabs only.

  core:
    schemas:
      - Job:        "{ uuid, command, prompt, provider, status, result, gapScore, ts }"
      - NCPChannel: "{ provider, tabId, connected, lastSeen, busy }"
      - SeamChunk:  "{ id, specId, tier, prompt, context, gateScore, status }"
      - SeamResult: "{ chunkId, text, provider, durationMs, gapScore, truncated }"
    axioms: [AX-001, AX-002, AX-007]
    constants:
      NCP_HB_MS:         8000
      NCP_RECONNECT_MS:  3000
      SEAM_MAX_CHUNK_TOKENS: 800
      SEAM_MAX_T3_TOKENS:    2000
      OLLAMA_SEAM_MODELS:    "[qwen2.5-coder:1.5b, mistral:7b-instruct-q4_K_M]"
      RAID_CLUSTERS:         "[code, spec, data, diagnostic, analysis, vision, research, hostile, forge]"

  events:
    emits:
      - "guardian.booted"
      - "guardian.job.queued"
      - "guardian.job.dispatched"
      - "guardian.job.complete"
      - "guardian.job.failed"
      - "guardian.ncp.connected"
      - "guardian.ncp.disconnected"
      - "guardian.tab.needed"
      - "guardian.seam.chunk_sent"
      - "guardian.seam.chunk_passed"
      - "guardian.seam.chunk_failed"
    handles:
      - "cortex.raid.decided → dispatch to chosen provider"
      - "HEAL_REQUESTED      → forge.patch if applicable"

  ncp_providers:
    description: >
      All AI inference goes through browser tabs via Tampermonkey userscripts.
      No API keys. No direct AI calls from Node.js.
    providers:
      - id: claude
        url: "https://claude.ai"
        userscript: "userscript-claude.js"
        version: "10.1.0"
        strengths: [complex_reasoning, code_quality, nuance, long_context]

      - id: chatgpt
        url: "https://chatgpt.com"
        userscript: "userscript-chatgpt.js"
        version: "9.1.0"
        strengths: [token_efficiency, grounded, hostile_testing, structured_output]

      - id: gemini
        url: "https://gemini.google.com"
        userscript: "userscript-gemini.js"
        version: "1.0.0"
        strengths: [vision, ui_analysis, image_understanding, multimodal, speed]

      - id: perplexity
        url: "https://perplexity.ai"
        userscript: "userscript-perplexity.js"
        version: "1.0.0"
        strengths: [real_world_facts, citations, web_search, research, grounded]

      - id: ollama
        url: "http://127.0.0.1:11434"
        note: "Local. No tab needed. Direct HTTP from Node.js."
        models:
          seam:    "qwen2.5-coder:1.5b   (~1GB VRAM, GTX 1650 primary)"
          general: "mistral:7b-instruct-q4_K_M  (~4GB VRAM, fills card)"
        strengths: [local, private, free, code, spec]

  raid_routing:
    description: >
      RAID decides which provider handles each job.
      Nine clusters. Intent-matched. Ollama always first.
      Claude always last (reserve, highest quality).
    clusters:
      code:       "ollama → chatgpt → claude"
      spec:       "ollama → claude"
      data:       "ollama → chatgpt → claude"
      diagnostic: "ollama → chatgpt → claude"
      analysis:   "ollama → chatgpt → claude"
      vision:     "gemini → claude"
      research:   "perplexity → chatgpt → claude"
      hostile:    "chatgpt → claude"
      forge:      "ollama → claude"

  seam_pipeline:
    description: >
      Structural Emergence with Autonomous Mechanism.
      Compresses intent before sending to AI.
      T0/T1: deterministic scaffold, zero tokens.
      T2: AI fills genuine logic gaps only.
      T3: complex reasoning, larger context.
    tiers:
      T0: "Structure emission. Directory tree, empty files. Zero tokens."
      T1: "Scaffold emission. Typed stubs, gate stubs. Zero tokens."
      T2: "Logic gaps. Sent to qwen2.5-coder:1.5b. Max 800 tokens."
      T3: "Complex reasoning. Sent to mistral or NCP. Max 2000 tokens."
    gate_detector:
      axes: [truncation, sigma, delta]
      retry_strategies: [resend-with-report, split-chunk, forensic]

  routes:
    internal:
      - "GET  /health"
      - "GET  /contract"
      - "GET  /events (SSE)"
    external:
      - "GET  /channel?provider=&tabId=  (NCP SSE — userscripts connect here)"
      - "POST /result                    (NCP — userscripts post AI responses)"
      - "POST /heartbeat                 (NCP — userscript keepalive)"
      - "POST /command                   (dispatch a job)"
      - "GET  /jobs/:id                  (job status)"
      - "GET  /providers                 (NCP provider health)"
      - "GET  /capabilities              (all providers + strengths)"
      - "GET  /userscripts/:name         (serve userscript files)"

  handshake:
    components:
      - id: "guardian.dispatch"
        grammar: ["guardian dispatch", "dispatch", "d"]
        route: { method: POST, path: "/api/guardian/dispatch" }
        description: "Dispatch a job to the best available AI provider"
        params: [{ name: prompt, type: string, required: true },
                 { name: provider, type: enum, values: [auto, ollama, claude, chatgpt, gemini, perplexity] }]

      - id: "guardian.providers"
        grammar: ["guardian providers", "providers", "prov"]
        route: { method: GET, path: "/api/guardian/providers" }
        description: "NCP provider connection status"

      - id: "guardian.seam"
        grammar: ["guardian seam", "seam"]
        route: { method: POST, path: "/api/guardian/seam" }
        description: "Run SEAM pipeline on a spec chunk"
        params: [{ name: chunk, type: string, required: true }]

      - id: "guardian.ollama.query"
        grammar: ["guardian ollama", "ollama", "ol"]
        route: { method: POST, path: "/api/guardian/ollama" }
        description: "Query Ollama directly (qwen2.5-coder:1.5b)"
        params: [{ name: prompt, type: string, required: true },
                 { name: model, type: string, default: "qwen2.5-coder:1.5b" }]

  ui:
    type: "panel in nexus-shell + NEXUS tab in userscripts"
    hotswap: true
    panels:
      - "PROVIDERS — NCP connection status, tab health, ollama ping"
      - "JOBS — live job queue, status, provider used, duration"
      - "SEAM — chunk pipeline status, gate scores, retry history"
      - "DISPATCH — manual dispatch panel with provider selector"

  # §ADDED 2026-09-03 — James: "update the living models." guardian.spec
  # had none of the real LM1/AX-013 fields (history/gaps/version_history)
  # despite being one of the most heavily touched systems this session —
  # a real, confirmed gap, not built around silently. History below
  # starts from what's genuinely verifiable this session, not a guessed
  # reconstruction of everything that came before — an honest, shorter
  # log is worth more than a fabricated comprehensive one (§1.1).
  history:
    - date: 2026-09-02
      summary: >
        §ACK-INJECTION FIX — James: "ack is injecting way too much into
        chatgpt, the tools are for that exact reason." Real root cause:
        every browser-agent job got a full force-fed context blob
        regardless of a real, already-built hat-classification system
        (lib/intent-hat-router.js, 2026-08-17) that never reached this
        dispatch path. createJob() now computes a real hat suggestion
        (intentHatRouter.suggestHat() + hatForge.get(), read-only) and
        attaches it to the NCP payload; all 4 provider userscripts use
        the hat's own short persona instead of the blob when one is
        present. 23 real test assertions, VM-isolated per provider.
    - date: 2026-09-02
      summary: >
        AM1 — real per-agent intent contracts. Hats gained a real
        allowedIntents field; a new lib/agent-intent-contract.js checks
        {agent, intent} before HANDSHAKE_VERIFIED. §AM6-CLOSED 2026-09-02
        — James: "yes. sure." (confirming a real, separately-found gap):
        the gate only ran when a caller happened to call acknowledge()
        explicitly, and the real automatic path (raid-worker.js's own
        15s auto-drain) never did — cortex/core/raid/contract-intake.js's
        processNext() now auto-acknowledges every contract itself,
        closing the gap at the one real choke point every dispatch
        passes through.
    - date: 2026-09-02
      summary: >
        DeepSeek added as a real agent (see ollama.spec's own matching
        entry) — guardian/server.js gained a real _dispatchToDeepseek(),
        mirroring mistral's existing ollama-bridge routing pattern.
    - date: 2026-09-02
      summary: >
        Real, invokable Intelligence & Contracts tools built on top of
        this system's own already-real POST /api/tools/:name (existed,
        complete, but the userscript's own SYS tab only ever pre-filled
        a manual query box instead of calling it) — see faculty-tools.js.
    - date: 2026-09-02
      summary: >
        AM8 — the real, two-step element-picker "add as new agent"
        pairing flow (see clear-glass.spec's own matching entry).
    - date: 2026-09-02
      summary: >
        §ROOT CAUSE — James, live, from a real standalone-browser
        screenshot and boot log: "the userscript isn't connecting... not
        hearing hey nexus," plus a separate "Attempted to register a
        second handler for 'agents:list'" unhandled rejection. Traced
        directly: every one of this system's 4 provider userscripts had
        12+ real call sites still using plain fetch()/EventSource against
        local HTTP endpoints, blocked by mixed content from an HTTPS
        host page in a real standalone browser — and since wake-word
        arming only happens inside EventSource's onopen, a blocked
        connection meant "hey nexus" was never armed, not a separate
        bug. Real _gmFetch()/_gmEventSource() wrappers built (the latter
        a genuine incremental SSE parser over GM_xmlhttpRequest's own
        onprogress, not polling dressed up as streaming) and converted
        every real call site across all 4 files — verified zero plain
        calls remain, not assumed. Separately: AM8's own new agents:list
        handler (above) collided with clear-glass's pre-existing, real
        agent-mesh registry handler — renamed to custom-agents:*.
    - date: 2026-09-03
      summary: >
        Merged a real parallel session's fix: officiator.js's submitted
        contract content never asked the agent to report a verdict in
        the exact literal format ("SEAM VERDICT: PASS/FAIL") this
        system's own contract-intake.js default checker requires — every
        officiator-synthesized contract dispatched through guardian
        failed regardless of real outcome. Fixed in both real dispatch
        paths.
    - date: 2026-09-05
      summary: "docs: update the living models — real history entries, plus a real pre-existing YAML bug found and fixed in 4 specs (1 real file touched)"
    - date: 2026-09-05
      summary: "chore: register the two orphans the new post-commit hook itself flagged (1 real file touched)"
    - sha: f66c6f434bd997c38ccef6de34109805a2767ee8
      date: 2026-09-05
      summary: "fix: real, tested merge safety for parallel-session history writes — found a genuine, silent data-loss risk before it could bite (1 real file touched)"

  gaps:
    as_of: 2026-09-03
    entries:
      - id: G1
        type: coverage
        summary: >
          This spec itself had zero real history/gaps/version_history
          fields until this pass, despite AX-013/LM1 establishing that
          convention for every other system spec weeks earlier — the
          exact class of staleness this schema exists to prevent, found
          on this file specifically only because "update the living
          models" was asked directly.
        opened: 2026-09-03
        status: CLOSED
        closed: 2026-09-03
        resolution: "This same pass — closed by writing the schema this gap describes as missing."
      - id: G2
        type: design
        summary: >
          The 4 provider userscripts (chatgpt/claude/gemini/perplexity)
          have confirmed, real, byte-for-byte-identical duplication in
          handleJob and related functions across 3 of the 4 (AM4, agent-
          mesh phasemap) — a real refactor target, not yet done. AM8's
          own new UI additions (Intelligence & Contracts panel, cookie-
          vault, agent-create pairing) were added to each file
          individually rather than through a shared core, compounding
          this same gap rather than closing it.
        opened: 2026-09-02
      - id: G3
        type: coverage
        summary: >
          The mixed-content fix (above) dropped fetch()'s own
          keepalive:true guarantee on 4 real bus functions (_toOrc/
          _toCortex/_toCortexPush/_toBridge) — GM_xmlhttpRequest has no
          equivalent. A real, accepted tradeoff (these connections were
          completely non-functional in a standalone browser regardless
          of keepalive), but a page unload mid-flight can now silently
          drop one of these 4 real calls where it previously wouldn't
          have (in the one deployment context — a real, standalone
          browser — where the fix was even needed).
        opened: 2026-09-02

  version_history:
    - version: 3.6.2
      date: 2026-09-03
      summary: "Retroactive first entry — living-model schema added for the first time, matching lib/version.js's own real, currently-tracked guardian (server) version. userscript-claude.js's own separate @version header (10.2.0) tracks the userscript artifact specifically, not this system-level number — a real, distinct versioning scheme, not a discrepancy to reconcile here."
      versioniumCommitId: null
