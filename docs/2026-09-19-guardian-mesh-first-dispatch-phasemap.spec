spec:
  meta:
    name: guardian-mesh-first-dispatch
    version: 0.1.0-phasemap
    status: "GUARDIAN SIDE BUILT 2026-09-19 (registry, ladder, mesh client, dispatcher hook, RAID feedback); default GUARDIAN_TRANSPORT=ncp-only so behaviour is unchanged. CLEAR GLASS SIDE (P1-P4) NOT BUILT: /agent-mesh/send and /agent-mesh/diagnose do not exist yet (the client treats 404 as mesh_unreachable => userscript)."
    ask: "James: guardian should send jobs to the agent MESH (ClearDriver: DOM inject + mutation observer) and use the
      userscripts (NCP) as the FALLBACK. Today guardian -> NCP -> userscript. agentId + account manager + cookie vault for
      multiple accounts."
  today:
    guardian_to_userscript: "guardian/lib/dispatcher.js _doDispatch(): provider gate, ping gate, then
      ncp.pushActive(provider,{type:'GUARDIAN_JOB',jobId,prompt,content,tools,hat}); job -> 'delivered'; _armCompletionWatch.
      Completion returns as NCP GUARDIAN_COMPLETE handled by guardian/lib/ncp-handler.js (chat_log, response sink, bus)."
    clearglass_hooks_that_exist: "guardian already calls Clear Glass on :7702 (clear-glass-bridge.js dispatchBrowserCommand;
      POST /providers/<p>/start). Clear Glass exposes /agent-mesh/{route,spawn,view,routes}, /bridge/driver, /dom/query."
    mesh_reality: "AgentMesh.send() does NOT use ClearDriver: it calls copilot/lifeline dispatchToNcpAgent -> guardian NCP. this.driver
      and this.ctxMgr are assigned and never used. Reason (its own comments): ClearDriver._getWebContents matches the TOP-LEVEL window by
      title only and cannot reach the <webview> that spawned agent tabs (openBackgroundTab -> browser.html shell) put the page in."
    identity_today: "spawn(): contextId = guardianOwned ? 'ncp-<agent>' : 'mesh-<agent>-<random8>'; partition persist:ncp-<agent> or
      persist:mesh-<agent>-<accountId|default>; vault.restore({agentId,accountId,ses}); accountId via nexusOptions account manager.
      Guardian jobs carry NO account/agentId fields (guardian/lib/jobs.js)."
  traps:
    T1_loop: "mesh.route() -> _dispatchViaGuardian -> POST guardian /api/copilot/prompt -> job -> dispatcher. If the dispatcher
      sends to the mesh first, mesh->guardian->mesh loops forever. Break it: jobs created by the mesh are pinned to NCP
      (job.transport='ncp'), and the new mesh endpoint drives the DOM directly and never calls guardian."
    T2_duplicate_prompt: "If the mesh injected the prompt and then lost the response, auto-falling-back to NCP would send the SAME
      prompt to the AI twice. Fallback is allowed only when the mesh reports sent:false (pre-flight failure: no window, no webview,
      not logged in, selector missing). sent:true + no response => job fails explicitly; retry policy is guardian's existing one."
    T3_wrong_page: "ClearDriver falls back to getFocusedWebContents()||all[0] when no window title matches. An unmatched agentId
      would type into whatever page is focused. Must fail loudly instead."
    T4_two_actuators: "A tab running a userscript AND driven by the mesh could be actuated twice. Userscripts are passive unless they
      receive GUARDIAN_JOB, so the mesh owns a tab during a job and fallback targets an NCP-connected tab (or starts one on demand)."
    T5_untestable_here: "No Electron in the build sandbox. Driver/webview code can be unit-tested only against fake webContents; the
      live behaviour needs a smoke test on James's machine."
  phases:
    P1_driver: "ClearDriver resolves an agent's <webview> guest webContents (host window by agentId, guest = getType()==='webview');
      remove the focused/all[0] fallback (throw). Tests with fake webContents."
    P2_mesh_transport: "AgentMesh.sendViaDriver(): inject prompt (real input events), click send, MutationObserver injected via
      driver eval settles when streaming stops, returns {ok,text,chatUrl,account,agentId,sent}. Reuse AGENT_REGISTRY selectors first;
      lift proven per-provider logic from guardian/userscript-*.js only where the generic path proves insufficient."
    P3_endpoint: "Clear Glass POST /agent-mesh/send {provider,prompt,agentId?,accountId?,jobId,timeoutMs} -> sendViaDriver. No guardian call."
    P4_identity: "Deterministic agentId/contextId per (provider,accountId) = mesh-<provider>-<accountId>; partition persist:mesh-<provider>-<accountId>;
      vault.restore by {agentId,accountId}; job gains accountId/agentId; account = explicit job.accountId else the account manager's
      default for that provider; unknown account => fail loud, never a silent default."
    P5_guardian_transport: "guardian/lib/mesh-transport.js + dispatcher hook BEFORE the NCP branch. Policy GUARDIAN_TRANSPORT=
      mesh-first|ncp-first|ncp-only. Circuit breaker (N failures => skip mesh for T s). Records job.transport and
      job.transportFallbackReason. On mesh success, complete the job through the SAME completion path NCP uses (no second implementation)."
    P6_verify: "Real-process test with a fake Clear Glass server for guardian side; live smoke checklist for Electron side."
  decisions_needed:
    D1_default: "Default policy. Recommend shipping as ncp-first until the live smoke passes, then flip to mesh-first; env switch, no redeploy."
    D2_tabs: "Mesh tab and userscript tab for the same provider+account: separate (recommended, avoids T4) or shared."
    D3_account_choice: "How a job names an account: explicit accountId on the job (recommended) plus a per-provider default in the account manager."
  escalation_ladder_decided:
    james: "guardian is the source of truth for agents. job dispatch -> agent mesh, job queue, spawn a tab and inject into the agent's chat
      input -> archaeology + automatic DOM mapping diagnose and fix -> userscript -> user intervention via the guardian picker."
    built: "guardian/lib/agent-registry.js (source of truth: selectors, accounts, repair history, health), dispatch-ladder.js (decision logic),
      mesh-client.js (HTTP to :7702), hook in dispatcher.js before the NCP branch, picker request via bus 'guardian.picker.needed' + cockpit broadcast.
      Tests: test-guardian-dispatch-ladder 18/18."
    still_to_build_clearglass: "POST /agent-mesh/send (queue, spawn tab, driver inject, mutation-observer capture, returns {ok,text,sent,stage});
      POST /agent-mesh/diagnose (archaeology + DOM mapping -> repaired selectors); ClearDriver webview resolution and removal of its
      focused-window fallback; archaeology has its OWN copy of that broken page lookup; picker UI must listen for GUARDIAN_PICKER_NEEDED."
  raid_question:
    asked: "should every job from guardian be sent to RAID?"
    answer: "Three different things. RECORD (outcome feedback): yes, every job, fire-and-forget and fail-open; it was already sent for every job but never
      arrived (shape mismatch), now fixed and enriched with transport/tier/account/stage. ROUTE (rec. decide): yes, but only when the job does not pin a
      provider/account. GATE (_approveTool, a constitutional policy check): NO for plain chat prompts, YES for actions with blast radius (browser commands,
      builds, tool calls: already gated). Gating every prompt would make cortex/constitution a hard dependency of all dispatch (fail-closed today for browser)."
    bugs_found: "guardian's feedback body never matched cortex's handler (read {agent,outcome}, got {provider,ok}); the handler only nudged a cortex-local health
      number, not RAID's fitness weights; port 3748 was hardcoded. needs_user must not count as an agent failure."
