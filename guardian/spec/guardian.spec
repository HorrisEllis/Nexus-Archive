spec:
  meta:
    name:        guardian
    version:     3.11.1   # 0.39.252 PATCH — agent "hey nexus" answered ONCE, by lib/wake-loop.js, from the COMPLETED reply of any job (was mesh only), as a wake-reply job sent into the same tab; the page and Clear Glass's relay no longer answer it. Previous 3.11.0: 0.39.249 MINOR — selector map: GET/POST /api/agents/:id/selectors, GUARDIAN_SELECTORS pushed on every NCP connect and change (lib/selector-map.js). Previous 3.10.0: 0.39.247 MINOR — one tab, one job at a time (userscript busy guard), every reply back (see CHANGELOG-0.39.247.md); this line was left at 3.9.5 while lib/version.js and registry-components.js moved, synced in 0.39.248. Previous 3.9.5: 0.39.244 PATCH — agentId jobs pass the shared-tab fail-fast; /events job frames carry payload+agentId; userscripts report the node anchor. Previous 3.9.4: 0.39.242 PATCH — jaa-store.js opts.settings:false. Previous 3.9.3: 0.39.241 PATCH — code-artifact.js: ARTIFACT_DIR honours the test sandbox / NEXUS_DATA_ROOT; no "not indexed" warning per reply when better-sqlite3 is simply absent
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
      - "guardian.artifact.captured"
      - "guardian.artifact.refused"
      - "guardian.job.progress"
      - "guardian.job.agent_tab_fallback"   # 0.39.237 — a repo job fell back to the shared tab, with the reason
      - "guardian.response.captured"
      - "guardian.blocks.captured"
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

  command_index:
    status: DONE   # verified 2026-09-03 — GET /commands live, real source-extraction from guardian/server.js's own literal dispatch code (guardian/lib/command-index-extract.js). 50 real top-level commands + 14 named sub-router prefixes (19 real nested checks honestly disclosed as unresolved, not silently folded into the count). tests/modules/guardian-command-index.test.js, 9/9 passing, self-verifying against a fresh re-extraction every run.
    spec: "docs/command-index-per-system.spec"
    served_at: "GET /commands"
    file: "guardian/lib/command-index-extract.js"
    note: >
      This block's own routes:/handshake: lists below are still
      hand-maintained and confirmed stale (4 routes declared in this
      block's own format vs 50 real matched + 19 unresolved-nested in
      the live-extracted index, measured 2026-09-03 by tests/modules/
      guardian-command-index.test.js's own real diff). GET /commands is
      now the real, non-drifting source; replacing this block's own
      routes:/handshake: lists to point at it (rather than duplicating
      them by hand) is real, separate follow-up, not done in this pass.

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

  built_2026_09_19_agent_tool_expansion:
    what: >-
      No guardian-owned code changed — real work landed in lib/agent-tools/tools/mesh/agent-mesh-route.js
      (built from a confirmed dangling-hook gap to 17/17 real AgentMesh actions) and browser-action.js
      (ClearDriver coverage 5 -> 30 real actions). Noted here because both dispatch exclusively through
      guardian's real POST /command + GET /jobs poll (this file's own real job surface, unchanged) — that
      surface is now exercised by 47 real distinct actions across the two tools, not the original 9.
    audit_finding: >-
      cockpit/cli.js's real INTERACTION_CONTRACT (29 commands, extracted live) has zero mesh/driver/brainos
      coverage. The real gaps were closed through copilot's agent-tool loop, not new cockpit commands.
      Whether cockpit should ALSO gain its own "forge mesh ..."/"forge driver ..." commands — a second real
      path to the same capability — is a real, still-open decision, not made here (§16.5: one truth, a
      second path needs a real reason beyond parity). See docs/2026-09-19-agents-clearglass-guardian-
      idearium-copilot-phasemap.spec's phase_5.

  built_2026_09_23_account_authority_and_job_evidence:
    why_this_block_exists: >-
      §3 of the 2026-09-23 handoff — "every change updates .git, .spec, atlas,
      component registry" — names guardian's .spec as the one 0.39.223 skipped.
      This records three real changes to guardian that had landed in code with
      no spec entry. MINOR, 3.6.2 -> 3.7.0: new capability, nothing removed,
      every existing route and event unchanged.
    accounts_moved_to_clear_glass:
      shipped: "0.39.223 (code only — unrecorded here until now)"
      what: >-
        lib/agent-registry.js remains the source of truth for AGENTS (selectors,
        repairs, health). ACCOUNTS are no longer guardian's to decide: the
        registry is constructed with an accountAuthority
        (lib/cg-account-authority.js -> GET :7702/accounts/resolve) and
        lib/dispatch-ladder.js awaits resolveAccountAsync before choosing a tab.
      failure_modes_are_distinct_on_purpose: >-
        An explicit account guardian cannot resolve fails the job
        (unknown_account) — dispatching to the wrong signed-in session is worse
        than not dispatching. Clear Glass being unreachable is NOT that: it
        falls back to NCP with reason account_authority_unreachable, because an
        authority that is merely down must not take the whole engine with it.
    job_stage_evidence:
      shipped: "0.39.224"
      what: >-
        A job that goes quiet now says where it stopped. The five userscripts'
        submit() returns { ok, how: button|enter-key } or { ok:false, error };
        a prompt typed but never sent fails immediately with that reason and the
        response watch is never started for it. The watch emits GUARDIAN_PROGRESS
        stage reply-started with a character count the first time it sees text
        that is not the stale baseline, BEFORE the baseline guard, so "the guard
        is skipping it" and "the page produced nothing" are distinguishable.
        lib/ncp-handler.js routes GUARDIAN_PROGRESS -> guardian.job.progress
        (added to events.emits above); server.js logs one line per stage with
        the chat url.
      evidence: >-
        James's 0.39.218 run: created -> dispatched -> ACKED -> silence, while
        the provider tab visibly held a real answer. The prompt had been sent
        and the RESULT never returned, and nothing in the pipeline could say
        which step failed. Four previously identical silences are now separable:
        never sent, sent but nothing rendered, rendered but never settled,
        returned.
    job_file_is_the_source_of_truth:
      shipped: "0.39.225"
      what: >-
        lib/jobs.js _persistJob(job, { required }) — the .job envelope write is
        REQUIRED at creation (a job whose file cannot be written is refused
        loudly, naming the directory and the reason, §1.2) and stays non-fatal
        on later status updates (the job already exists and may be mid-flight;
        killing live work over a status write loses more than it protects).
        JOBS_DIR is nameable via GUARDIAN_JOBS_DIR and exported; default path
        unchanged.
      already_existed_do_not_rebuild: >-
        loadPersistedJobs() already hydrates the in-memory Map from disk at
        createJobStore, and server.js _redispatchRecoveredJobs (2026-09-11)
        already requeues 'dispatched' -> 'pending' (the tab that held it is
        provably gone in a fresh process) and dispatches each pending job once,
        leaving complete/error as history. The handoff's stated gate — kill
        mid-job, restart, requeued once, never duplicated — was already built;
        0.39.225 proves it (tests/modules/test-guardian-job-persistence.js,
        15/15, with a real second store over the same directory) rather than
        rebuilding it.
    clear_glass_job_intake:
      shipped: "0.39.227"
      decided_by: James — "Do it. 1 then 2."
      decision: >-
        PUSH-WITH-CLAIM, not a watch. The ladder (lib/dispatch-ladder.js) calls claim(job) before any mesh
        send; server.js wires it to updateJob(id, {transport:'mesh', claimedBy:'clear-glass', claimedAt,
        status:'dispatched'}, {required:true}) — the claim is a REQUIRED .job write (updateJob's opt-in
        {required}; its default stays non-fatal, 0.39.225's rule). A failed claim sends nothing: NCP fallback,
        reason mesh_claim_failed. lib/dispatcher.js's NCP fallback clears claimedBy, so the .job never names
        two owners. Clear Glass (clear-glass/src/jobs/intake.js) takes a job in ONLY after reading it back
        through GET /jobs?id= and finding that claim; everything else is refused (stage intake_refused, sent:false).
      why_not_a_watch: >-
        Only guardian creates and reads its .job files (node-ownership rule, handoff item 4); and every job
        lands in that folder, including NCP-owned ones, so a watcher would deliver those twice.
      restart: >-
        guardian restart: unchanged — _redispatchRecoveredJobs requeues, the ladder re-claims, Clear Glass's
        intake answers from its existing <jobId>.intake (idempotent, no second send). Clear Glass restart:
        intake records not finished are marked interrupted and reported as clear_glass_restarted with
        sent:null, which the ladder already treats as never-resend (sent_no_response -> ask the user).
      tests: tests/modules/test-cg-job-intake.test.js (12/12, real store + ladder + mesh-client + HTTP both sides)
  built_2026_09_25_one_tab_per_repo_job:
    shipped: "0.39.237"
    asked_by: James, against his 2026-09-25 boot log — "it shouldn't be opening two instances. this needs to work end to end."
    found: >-
      lib/dispatcher.js sent a job carrying an agentId (idearium's repo agent) to the SHARED provider tab
      whenever that repo's own tab had not registered yet, and in the same call asked Clear Glass to open
      the repo tab for next time (the 2026-09-23 trigger). The job ran in the shared window and the new
      one sat idle: two ChatGPT instances from one job, and both stayed. From a cold start (no tab for the
      provider at all) the queued branch asked Clear Glass for the shared window, which then missed the
      repo tab and did the same.
    rule: >-
      A job with an agentId is delivered ONLY to the tab registered under tabId=agentId. If that tab is not
      connected, the job is queued (status queued, queueReason "waiting for <agentId>'s own <provider> tab",
      in pendingQueue once) and Clear Glass is asked to open that tab (spawnProviderTab, show:false). The
      existing flushQueuedJobs() on every NCP connect delivers it. The shared tab is used for a repo job only
      on evidence the repo tab is not coming: Clear Glass answers ok:false or cannot be reached, or the tab
      has not connected within GUARDIAN_AGENT_TAB_WAIT_MS (default 60000). That fallback writes
      transportFallbackReason + agentTabFallback:true to the .job, logs a warning and emits
      guardian.job.agent_tab_fallback. A delivered job cancels its deadline.
    rejected: >-
      Keep sending the first job to the shared tab and only stop opening the repo tab: loses tab-per-repo,
      the reason repo tabs exist (two repos' jobs contending in one chat, the 2026-09-23 timeout).
    replay_retired: >-
      ncp-handler's GUARDIAN_REPLAY case no longer marks a job complete (it set status complete and emitted
      guardian.job.complete with no response text). It only ever arrived with jobId undefined, because the
      userscripts sent their IndexedDB record keyed uuid; the userscripts no longer send it at all. Guardian
      logs and ignores one from an older installed userscript.
    open_not_done: >-
      The ping gate (_pingProvider) pings the provider's active client, not the repo tab the job is aimed
      at — the source of "ping gate did not clear ... dispatching anyway" in the 2026-09-25 log. The wait
      holds a dispatch-pool slot, as every other queued path already does.
    tests: >-
      tests/dispatcher-agent-tab-trigger.test.js 10/10 (was 5: AT-002/AT-005 pinned the shared-tab delivery
      and were reversed; mutation-checked, each reverted fix fails its own test);
      tests/modules/test-guardian-replay-retired.test.js 3/3 (the pre-0.39.237 handler fails RR-01).
  built_2026_09_25_watch_never_silent:
    shipped: "0.39.238"
    asked_by: James, with the 2026-09-25 log (job 44d68e3d — waiting for its own tab, delivered, acked, "submitted (button)", then nothing) and the reply visible in ChatGPT — "this should be working."
    found: >-
      The 0.39.224 stage evidence answered it: no reply-started after submit means the watch never saw
      reply text. In every userscript's checkStable(), a findResponseEl() that returns nothing rescheduled
      itself every 600 ms FOREVER — the NO_REPLY_MS deadline sat below that branch and never ran. No
      progress, no error, no completion. ChatGPT's findResponseEl() made that likely: one querySelector
      over '[data-is-streaming="true"], [data-message-author-role="assistant"]:last-child, .text-streaming'
      returns the FIRST match in document order, and :last-child only matches a message that is the last
      child of its own wrapper.
    fix: >-
      All six watchers (chatgpt, claude, gemini, deepseek, perplexity, nexus-hey-claude): with no reply
      element, one GUARDIAN_PROGRESS stage 'no-reply-element' after 15 s, and GUARDIAN_ERROR at the
      no-reply deadline naming selector drift. ChatGPT's findResponseEl(): the streaming element while it
      exists, otherwise the LAST [data-message-author-role="assistant"] — the way that file's own chat
      reader already finds messages. Userscript versions bumped, header and VERSION constant aligned
      (they disagreed before: e.g. chatgpt @version 10.2.0 vs VERSION 10.1.0).
    what_the_next_log_says: >-
      reply-started + job complete: fixed. no-reply-element: ChatGPT's page no longer has any element the
      selector recognises — the DOM must be mapped from the live page (archaeology), not guessed here.
    tests: >-
      tests/modules/test-guardian-job-correlation.js 102 -> 120 (15 no-element cases across five providers on a
      20x clock, 3 on ChatGPT's real findResponseEl); against the 0.39.237 userscripts all 16 new checks fail
      and the run hangs until killed.
  built_2026_09_25_downloads_index_one_root:
    shipped: "0.39.239"
    change: >-
      lib/code-artifact.js recordAgentResponse (writes every completed reply to Clear Glass's downloads index) and
      lib/response-sink.js (recovers a job's reply from that index when the live signal was lost) now take the index
      root from clear-glass/src/downloads/artifact-chat-index.js defaultRoot() instead of each resolving the COS
      compartment themselves; Clear Glass's readers use the same call. The reply record is unchanged: raw.agentId and
      raw.jobId, now also lifted into first-class agent_id/job_id by the index. No route or event change.
  built_2026_09_25_selector_map:
    shipped: "0.39.249"
    versionium: { "0.39.248": "vtm-eebbc621", "0.39.249": "vtm-a91834dc" }
    asked_by: James — "i want to have the element picker, aware of the cleardriver and userscripts, usermesh … could copilot potentially be tasked to fixing it with the element picker?" / "lets do it."
    found: >-
      lib/agent-registry.js already held one selector map per provider (input/send/resp, history with
      source and evidence) and the mesh's archaeology repair wrote to it; the mesh path is off by default and
      the userscripts hard-coded their own selectors, so no repair reached the path jobs take.
    rule: >-
      lib/selector-map.js. A key is VERIFIED only if its last change came from a source that checked it on a
      live page (picker, archaeology); a claimed live check without evidence { url, matched>=1 } is refused;
      copilot may propose but is never verified. GUARDIAN_SELECTORS is pushed to a tab on every NCP connect
      (before queued jobs flush) and to every open tab of the provider on every change.
      GET/POST /api/agents/:id/selectors. Userscript precedence: verified map > built-in > seed.
    also_0_39_248: >-
      lib/dispatcher.js _armCompletionWatch's per-job watchdog timer is unref'd — it kept
      tests/dispatcher-stale-socket.test.js alive, which the boot vitals check reported as a regression.
    open: >-
      registry-components / interaction-contract entries for the two routes; the other userscripts
      (claude, gemini, perplexity, deepseek) do not read the map yet.
    tests: tests/modules/test-selector-map.test.js 15/15 (mutation-checked).
  built_2026_09_25_wake_is_a_job:
    shipped: "0.39.252"
    versionium: "vtm-7a5e6093"
    asked_by: >-
      James — "is supposed to be injected into the chat like a job. it is for the agents to talk to nexus. not me." / "its not voice assistance. its for the agents to talk to nexus through clearglass"
    found: >-
      Three answerers for one agent wake, none complete. (1) userscript-nexus-wake.js checkMessage(), called by the
      reply observer on every mutation of a STREAMING reply, matched the first fragment ("hey nexus, w"), asked
      co-pilot "w", drew an overlay for the person and typed the answer into the composer WITHOUT sending it (the
      text left in James's composer). (2) cortex /api/meta/observe, posted when the reply first APPEARS, matched
      the same fragment and Clear Glass's wake-relay answered it again as a /wake-reply job — which queued behind
      the unfinished reply (the tab stays busy until the reply is detected; ChatGPT's is not, the open break) and
      was never typed. (3) lib/wake-loop.js — the right design (completed reply, fences/quotes skipped, depth cap,
      once per job, copilot /api/prompt/tools, a real job back) — ran for MESH jobs only, "the userscript answers
      its own wakes".
    rule: >-
      lib/wake-loop.js is the ONE answerer of an agent wake, for every job transport. The answer goes back as a
      wake-reply job: pinned to the userscript tab (transport 'ncp') when the asking job was not mesh-delivered,
      through the mesh when it was; typed AND sent like any job, so the agent receives it. The prompt says what it
      answers: [NEXUS] answer to your "hey nexus, <ask>" — then copilot's answer. checkMessage() now only reports
      whether a message addresses NEXUS (nexus-wake 1.1.0); wake-relay.js returns on role 'assistant'. Cortex still
      records every wake (nexus_wake_events, the REPL) — only the answering moved.
    depends_on: >-
      a wake is answered when its job COMPLETES. On ChatGPT that needs the reply to be detected — the open break
      (0.39.251's element picker is how it gets fixed). A wake in a chat that was not a guardian job (a person
      chatting with the agent directly) has no completion and is not answered by this loop.
    tests: >-
      tests/modules/test-guardian-wake.js 16/16 (WK-012 ncp jobs answered + pinned, WK-017 full request + framing,
      WK-018 the real relay stays silent for an assistant wake); test-nexus-wake.js NW-027/NW-030 (checkMessage has
      no side effects). Each fix mutation-checked.
