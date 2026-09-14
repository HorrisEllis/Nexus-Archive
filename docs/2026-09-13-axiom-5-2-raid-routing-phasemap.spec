spec:
  meta:
    name:        axiom-5-2-raid-routing
    version:     0.1.0-phasemap
    status:      "PHASEMAP 2026-09-13. Executes
      TRACKS_EXPLICITLY_NOT_STARTED_YET.track_d_axiom_5_2_compliance from
      docs/2026-09-13-massive-codebase-orchestration-phasemap.spec, now
      unblocked (MCO6 gate MET). Its own text required a map-before-build
      pass rather than a rider on that file — this is that pass."
    uuid:        nexus-axiom-5-2-raid-routing-v0-0000-2026-0913-001
    author:      James Brooks
    intent: >
      Make "§5.2 everything routes through RAID" true for orchestrator.js's
      real proxy traffic to cortex/guardian/architect/idearium — but only
      where that's honest. MCO7 found the real traffic is not one uniform
      thing; MCO8 wires the narrow real subset that's honestly wireable
      today, reusing idearium's own already-proven observability pattern
      rather than inventing a new one.

  MCO7_map_real_proxy_traffic:
    depends_on: []
    status: "DONE 2026-09-13."
    does: >
      Audit orchestrator/orchestrator.js's sysReq() proxy layer (raw HTTP,
      zero RAID contact) directly, not assumed.
    findings:
      - "131 real proxy calls across cortex/guardian/architect/idearium: 91
        GET, 38 POST, 2 DELETE. RAID's own §RAID-WORKER already runs
        inside this same file, draining the real contract queue — wholly
        disconnected from these 131 calls."
      - "Excluded — reads, not work: all 91 GETs. RAID governs contract
        lifecycle, not queries."
      - "Excluded — already caller-decided, existing precedent: POST
        guardian '/command' (dispatch). Identical shape to MCO2's real
        finding (docs/2026-09-13-massive-codebase-orchestration-
        phasemap.spec): 'provider explicitly chosen by the caller, not
        RAID-picked.' Re-litigating it here would contradict a decision
        already made this session."
      - "Excluded — system's own internal bookkeeping, not inter-system
        work: cortex's ~13 POSTs (/event, /memory/*, /tags, /snapshots/*,
        /versionium/commit, /ess/analyse, /replay/inspect, /files/upload,
        /purge). Cortex acting on itself, not being handed a contract."
      - "ARCHITECTURAL FINDING, the actual reason this needed its own map:
        RAID's real queue drains on raid-worker.js's ~15s cadence —
        genuinely asynchronous end-to-end. Every remaining write route
        (idearium's legacy spec.build, architect's blueprint.scan/diff,
        map.scan, snr.check, translate.utl, gaps; guardian's
        blueprint.compile, bus/emit, artifacts, ledger, memory/ingest,
        queue/cancel, seam/retry) is a SYNCHRONOUS handler that awaits its
        real work inline and returns 200 in the same HTTP response
        (verified directly: idearium/api/index.js's spec.build case
        awaits compileIdeariumSpec() and returns ok() from the same
        request; architect/service.js's blueprint/scan the same shape).
        'Route it through RAID' cannot honestly mean 'submit to the async
        queue and wait' without either breaking that synchronous
        contract or adding real 15s+ latency neither caller expects.
        Would have been a fabricated claim of compliance, not real
        wiring, if built that way."
      - "The honest mechanism already exists and is already proven safe:
        idearium's own spec-engine chunk-dispatch path (§RAID-SOURCE
        2026-08-29) already does submitContract() for observability
        alongside its own real, unmodified dispatcher, then
        reportExternalOutcome(queueId, {status}) once its own real
        result is known — additive, never blocking, never re-executing
        the work. This is the pattern MCO8 reuses, not a new one."
      - "Zero of architect's or guardian's real write routes use
        submitContract/reportExternalOutcome anywhere (grep-confirmed,
        zero hits). idearium's OWN legacy spec.build route (distinct
        from the spec-engine chunk path above, in the same file) also has
        zero RAID wiring despite being real, heavy write work."
    gate: "MET — real proxy traffic classified into excluded (129 of 131)
      and honestly-wireable-via-the-observability-pattern (the routes
      named above), written before any route was touched."

  MCO8_wire_the_honest_subset:
    depends_on: [MCO7]
    status: "PARTIAL 2026-09-13 — 2 of the identified candidate routes
      wired this session as real, verified proof of the pattern; the
      remainder (architect's blueprint.diff/map.scan/snr.check/
      translate.utl/gaps; guardian's blueprint.compile and the rest)
      are named, not touched — same discipline as MCO0's clear-glass
      classification (real, un-started work is named as such, not
      silently claimed done)."
    does: >
      Reuse idearium's own submitContract()+reportExternalOutcome()
      pattern verbatim: submit for observability before the real work,
      report PASS/FAIL after it (from the caller's own already-known
      result), catch-and-log any RAID-side failure so it never blocks the
      real handler.
    built:
      - "cortex/core/raid/contract-boundary.js: new REGISTRY row
        'architect:blueprint.scan' (source:intention key, matching this
        module's own resolveBoundary(source, intention) shape — not
        source:system, per its own header's grep evidence)."
      - "architect/service.js's real POST /api/blueprint/scan handler:
        submits before blueprint.fromScan(), reports PASS on success /
        FAIL with the real error message on the existing catch branch.
        fromScan() itself untouched — same execution path, same response
        shape, same status codes as before."
      - "idearium/api/index.js's real, legacy 'spec.build' case (the
        route distinct from the spec-engine chunk path that already had
        this): submits before compileIdeariumSpec(), reports PASS/FAIL
        from compileResult.ok on the two real branches that already
        existed. Reuses the already-registered 'idearium:build' boundary
        row rather than adding a near-duplicate for the same real
        system doing the same kind of work."
    verified: >
      node -c passed on all three edited files. Both new call sites
      wrapped in their own try/catch, matching idearium's own
      §HONEST LIMIT precedent, so a RAID-side failure (submitContract
      throwing, reportExternalOutcome throwing) cannot block or alter
      the real scan/build result the caller already gets today.
    gate: "MET for exactly these two routes: a real blueprint scan and a
      real legacy spec build each produce a real RAID queue row and a
      real terminal raid.contract.pass/fail event, with zero change to
      either route's existing response shape, status codes, or timing.
      NOT met, and not claimed: the remaining ~13 identified routes —
      named in MCO7, not yet wired. NOT attempted, and should not be:
      making these routes' execution genuinely queue-and-wait through
      RAID's async drain — that would be a different, much larger
      change (breaks the sync response contract) than what §5.2's real
      traffic actually calls for here."

  MCO12_architect_remaining_routes:
    depends_on: [MCO8]
    status: "DONE 2026-09-13. All 5 architect candidates MCO7 named checked
      individually — 2 correctly excluded (blueprint.diff, snr.check are
      pure read/compute, zero jaa.insert in either handler, same
      reads-excluded principle MCO7 already applied to GETs, just on a
      POST verb this time), 3 real write-work routes wired
      (map.scan/translate.utl/gaps.open) and verified LIVE against a
      real booted architect instance — real raid_contract_queue rows
      confirmed with status:pass after properly waiting out jaaDB's
      debounced flush (a first check without the wait showed 0 rows,
      false-negative, same timing class this codebase's own changelog
      already documents for cross-process JAA writes)."
    gate: "MET. architect/service.js's real write routes all have RAID
      observability now; its real read/compute routes correctly don't."

  MCO12_guardian_list_was_unreliable:
    depends_on: []
    status: "FINDING, not yet actioned. MCO7's guardian route list (bus/emit,
      artifacts, ledger, memory/ingest, queue/cancel, seam/retry,
      blueprint/compile) was checked individually this pass, per the
      honest_risks note this file already carried. 4 of 7 don't exist as
      real routes anywhere in guardian/server.js at all (ledger,
      memory/ingest, queue/cancel, blueprint.compile) — the original list
      was named, not verified, for guardian specifically, unlike the
      routes that actually got built. Of the 2 that exist: bus/emit is a
      generic broadcast relay (caller supplies both type and data, no
      single well-defined intention to tag it with — same exclusion class
      as /command); seam/retry is a control action on an already-running
      SEAM chunk, not new work being created — a different category from
      map.scan/translate.utl/gaps.open, which each produce new persisted
      content. artifacts is a GET (read), also mis-listed."
    gate: "NOT MET, and possibly moot — a fresh, real audit of guardian's
      actual write-work routes (same direct-grep discipline already
      applied to architect and to guardian's own interaction-contract.json
      reconciliation) is needed before wiring anything else here, not a
      continuation of the original named list."

  MCO12_guardian_audit_complete:
    depends_on: [MCO12_guardian_list_was_unreliable]
    status: "DONE 2026-09-13. All 20 real POST routes in guardian/server.js
      (guardian/interaction-contract.json's own reconciled list) checked
      individually, direct code read, not assumed. CONCLUSION: zero real
      gaps. Guardian was never missing RAID integration — it already has
      it, through purpose-built mechanisms rather than the generic
      submit/execute/report pattern architect's routes needed:
      /build (raid._approveTool() — a real approval gate), /api/intake
      (already correlates to the EXISTING RAID contract behind a
      dispatched job — raid.listQueue().find(dispatchedJobId===jobId) —
      strictly better than a redundant new observability contract would
      be), /api/copilot/prompt (already calls real POST /api/raid/decide).
      /api/intake/verdict|promote|rollback are governance actions on that
      same already-correlated record. seam/retry, wake-job-ack,
      organism-queue/:id/ack, providers/:name/spawn are control/ack
      actions on already-existing work, not new content. bus/emit,
      api/guardian/cfr/event (a pure proxy to cortex's own generic
      /api/event), command, command/tools, cli/exec, chatgpt-mode/query
      are generic relays or caller-decided dispatches, same exclusion
      class /command already established. result/heartbeat/stream/:jobId
      are NCP protocol internals already covered by guardian's own real
      job-durability system (P22-P24)."
    gate: "MET — by finding, not by wiring. Applying the observability
      pattern anywhere in this list would either duplicate an
      already-real, more-correct mechanism or misfit a control/relay
      action that was never 'work' in the RAID contract sense. Track D
      is now honestly complete for both systems it named: architect
      needed and got 3 real routes wired; guardian needed nothing."

  MCO16_clearglass_raid_destination:
    depends_on: [MCO10_compartment_dom_ledger, MCO2_decide_for_contract]
    status: "DONE 2026-09-13. James's own explicit gates, all four applied
      as given, none inferred: routing signal = explicit
      contract.executionSurface:'browser' (not an intention/forAgent
      guess); DOM step language deliberately NOT built this pass
      (prompt-only, reusing ClearGlass's already-real /agent-mesh/route);
      ClearGlass boundary = new POST /compartment/set-active on
      clear-glass/src/main/index.js's wire server (:7704), calling straight
      into archaeology.js's DomArchaeology.setActiveCompartment() — a real,
      single write authority now reached two real ways (ipcMain.handle AND
      this HTTP route), not two competing setters; RAID persistence =
      compartmentUuid recorded onto raid_contract_queue rows (same field
      name compartment_dom_ledger already uses, joinable directly);
      browser-unavailable = a real thrown error (lib/clearglass-dispatch.js's
      pure request-shape helpers + contract-intake.js's _clearGlassRequest,
      which rejects rather than honest-degrading to null) that reaches
      compartment-engine's own execute() catch, becomes a real FAIL, and
      lets the contract's own existing onFail (retry/fallbackAgent/halt)
      decide what happens next — never a silent fall-back to
      _realAgentExecutor."
    does: >
      Closes MCO10's real gap directly: nothing anywhere in the repo ever
      called setActiveCompartment() (confirmed by grep before building,
      confirmed again after — the only two real callers now are
      archaeology.js's own ipcMain.handle and the new HTTP route).
      processNext()'s default-executor choice now branches on
      queued.executionSurface: BROWSER -> _clearGlassExecutor (real
      set-active, then real /agent-mesh/route dispatch); INTERNAL (the
      default — every contract that existed before this landed) ->
      _realAgentExecutor, byte-for-byte unchanged.
    real_files:
      - "lib/clearglass-dispatch.js (new) — pure EXECUTION_SURFACE,
        validateExecutionSurface(), buildSetActiveBody(), buildRouteBody(),
        extractRouteText(). Same division of labor MCO11's
        lib/contract-repo-provision.js already established: pure decision
        in lib/, real cross-process HTTP call in contract-intake.js."
      - "cortex/core/raid/contract-intake.js — EXECUTION_SURFACE import,
        submitContract() validates + persists executionSurface (default
        INTERNAL, refuses a bad value rather than silently defaulting),
        processNext() persists compartmentUuid alongside the existing
        compartmentId, branches its default executor, new
        _clearGlassRequest()/_clearGlassExecutor()."
      - "clear-glass/src/dom/archaeology.js — activeCompartmentUuid setter
        extracted into a real setActiveCompartment() instance method;
        ipcMain.handle('compartment:set-active', ...) now calls it instead
        of duplicating the assignment inline."
      - "clear-glass/src/main/index.js — domArchaeology promoted to
        module scope (same pattern driver/ctxMgr already use) so
        _startWire()'s route handler, which runs before bootstrap()
        creates the real instance, can still reach it; new
        POST /compartment/set-active route."
      - "tests/modules/mco16-clearglass-dispatch.test.js (new) — 19 real
        tests against the pure lib. Verified against a real, temporary
        HTTP server standing in for ClearGlass's wire server: real
        set-active-then-route call order and bodies, and the real
        'unreachable ClearGlass -> throw, not silent internal fallback'
        contract, both confirmed by direct execution, not asserted."
    verified: >
      All 19 new unit tests pass. A live integration run against a real
      (test) HTTP server confirmed: (1) _clearGlassExecutor calls
      /compartment/set-active BEFORE /agent-mesh/route, with the exact
      real bodies buildSetActiveBody/buildRouteBody produce; (2) killing
      that server mid-run makes _clearGlassExecutor throw
      ClearGlass-unreachable, not silently fall back. Pre-existing suites
      (mco10-compartment-dom-ledger, contract-intake-dependency-graph,
      mco6-reconcile-on-boot, raid-retry-escalation, test-am1-intent-
      contract, test-b1-synthesize-contract, test-raid-processnext-am1-
      gate) re-run before and after this change via `git stash` — zero new
      failures; the pre-existing js-yaml/environment gaps in this sandbox
      (mco4-stage-transitions, contract-intake-tangible-file crash;
      mco6's IC9-004 and am1-gate's GATE-001 fail) are identical on both
      sides, not introduced by this work.
    gate: "MET for prompt-only browser dispatch + real compartment tagging.
      NOT built, named honestly as real future scope: a DOM step-list
      language (contract.domSteps: query/mutate sequences) for a contract
      whose real end-state is page interaction rather than a chat
      response — /dom/query exists on the wire server, /dom/mutate does
      not yet, and no contract schema names either. Nothing here should be
      read as having built that."

  MCO16b_real_submitter_surface:
    depends_on: [MCO16_clearglass_raid_destination]
    status: "DONE 2026-09-13. Real, honest gap found immediately after
      MCO16 landed: every existing real submitContract() caller
      (officiator.js, idearium/api/index.js, self-heal, architect/service.js)
      is an in-process require() with hardcoded opts — grepped directly,
      confirmed zero external HTTP path to submit ANY contract, browser-
      destined or not. §3.4 (raw execution before interfaces) named the
      next real layer: contract-intake.js (raw) already worked; nothing
      outside this process could reach it."
    does: >
      New POST /api/raid/submit on cortex/boot.js, right beside the
      existing GET /api/raid/queue (the read side already had a route,
      the write side never did). Calls the exact same real submitContract()
      — no second submission mechanism. Accepts executionSurface in the
      body, so a real external caller (CLI, human, future automation) can
      now actually opt a contract into MCO16's browser path, closing the
      "who calls this" gap flagged at the end of MCO16 itself. Also
      threaded executionSurface through synthesizeContract()'s B1 schema
      (BUILD_CONTRACT_SCHEMA updated to document it) — that richer,
      already-real caller surface silently dropped the field before this.
    real_files:
      - "cortex/boot.js — new POST /api/raid/submit route."
      - "cortex/core/raid/contract-intake.js — synthesizeContract() now
        passes executionSurface through; BUILD_CONTRACT_SCHEMA documents it."
      - "tests/modules/mco16-raid-submit-route.test.js (new) — 4 real,
        LIVE tests against boot.js's actual exported .server on an
        ephemeral port (same technique cortex-sse-broadcast.test.js
        already established), isolated JAA/RAID data dirs. Not mocked:
        real HTTP POSTs against the real running route."
    verified: >
      All 4 live route tests pass (browser-surface submit succeeds with a
      real queueId; no-executionSurface submit still succeeds defaulting
      internal; an invalid executionSurface is refused with a real 400;
      empty content is refused with a real 400). test-b1-synthesize-
      contract.js (13 tests) re-run clean after the synthesizeContract
      edit — zero regressions.
    gate: "MET. Still real, still-open, still honestly named: nothing yet
      calls this new route or sets executionSurface:'browser' from a real
      workflow (a human hitting it directly is the only real caller today)
      — a real decision about WHICH real contracts should declare browser
      is a product/workflow choice for loom/idearium/co-pilot to make, not
      a wiring gap this track can close by itself."

  MCO16c_dom_step_language:
    depends_on: [MCO16_clearglass_raid_destination, MCO16b_real_submitter_surface]
    status: "DONE 2026-09-13. James: 'finish the rest of it' — MCO16's own
      named, deliberately-deferred gap (contract.domSteps query/mutate
      sequences) now built, not left as a permanent honest gap once asked
      for directly."
    does: >
      contract.domSteps: real, ordered array of {action:'query'|'mutate',
      providerId?, selector?, query?, cgId?, mutation?}. _clearGlassExecutor
      branches: real, non-empty domSteps present -> runs each step in
      sequence (never parallel — a later step may depend on an earlier
      mutation) against ClearGlass's real /dom/query (already existed) and
      a NEW /dom/mutate route; no domSteps -> unchanged single
      /agent-mesh/route prompt dispatch, exactly the first MCO16 pass.
      /dom/mutate closes a real, separate small gap found while building
      this: the page-side window.__cgDomMesh.mutate() (archaeology.js's
      own DOM_OBSERVER_SCRIPT) was real and already loaded on every
      provider page, but ProviderHost (clear-glass/src/providers/host.js)
      only ever reached .query()/.getTree() — mutateDom() is the real,
      missing counterpart to the already-real queryDom(), same selector-
      resolution behavior archaeology.js's own handleMutate() already
      established (selector -> queryOne() -> cgId, when no cgId is given
      directly).
      First real step-level failure (domStepResultFailed — a genuine page
      result like 'no live window' or 'Element not found', distinct from
      an HTTP-level failure, which _clearGlassRequest already throws on
      separately) stops the sequence immediately and throws with the
      failing step's index — never continues mutating on top of a step
      that didn't really happen, and never silently falls back to a
      prompt dispatch.
    real_files:
      - "lib/clearglass-dispatch.js — validateDomStep(), buildDomStepRequest(),
        domStepResultFailed(), all pure, all unit-tested."
      - "clear-glass/src/providers/host.js — new mutateDom(providerId,
        {cgId, selector, mutation})."
      - "clear-glass/src/main/index.js — new POST /dom/mutate route,
        symmetric with the existing /dom/query."
      - "cortex/core/raid/contract-intake.js — _clearGlassExecutor's real
        domSteps branch; BUILD_CONTRACT_SCHEMA documents the field."
      - "tests/modules/mco16-clearglass-dispatch.test.js — 16 new unit
        tests (MCO16-020 through MCO16-035) covering step validation,
        request building, provider-id fallback/override, and
        success/failure detection on both real result shapes
        ({ok:false,reason} and {error:...})."
    verified: >
      35/35 unit tests pass (19 original + 16 new). Two live integration
      runs against a real temporary HTTP server, not mocked: (1) a real
      2-step domSteps contract dispatches set-active, THEN /dom/query,
      THEN /dom/mutate, strictly in that order, with the exact real
      bodies, and dispatches no prompt; (2) a real page-level mutate
      failure on step 0 of a 2-step sequence throws immediately, naming
      the step and reason, and step 1 is confirmed to have never been
      called. Full pre-existing suite (mco10, b1-synthesize, contract-
      intake-dependency-graph, raid-retry-escalation) re-run clean — zero
      regressions. host.js/boot.js/contract-intake.js/clearglass-dispatch.js
      all syntax-checked.
    gate: "MET. The DOM step-list language MCO16 named as real, deliberate
      future scope is now real. Still real, still open, still not this
      track's decision to make: nothing yet composes domSteps from a
      higher-level intent (a human/agent still has to write the literal
      step array) — that's a usability layer on top of a now-real
      mechanism, not a missing mechanism."

  honest_risks:
    - "The observability pattern this reuses never gates or authorizes —
      per contract-boundary.js's own resolveBoundary() docstring, an
      unresolved or unreported contract is informational, not blocking.
      §5.2 compliance under this phasemap means 'RAID sees real traffic
      as it happens,' not 'RAID controls it' — a narrower, and more
      honest, reading than the axiom's name alone suggests."
    - "guardian's routes (bus/emit, artifacts, ledger, memory/ingest,
      queue/cancel, seam/retry, blueprint/compile) were named in MCO7 but
      not individually re-read for the same caller-decided-precedent
      check MCO2 already applied to '/command' — do that read before
      wiring any of them, not after."
    - "Wiring the remaining ~13 routes is mechanically identical to the
      2 built here (same three-line submit / try-execute / report
      shape) — the risk is volume and per-route boundary-row bookkeeping,
      not a new pattern to design."
