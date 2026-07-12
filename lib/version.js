'use strict';
/**
 * lib/version.js — NEXUS Canonical Version Registry
 * UUID: nexus-version-registry-v1-0000-4000-0000-000000000001
 *
 * Single source of truth for all system and module versions.
 * Every module imports from here — no hardcoded version strings scattered
 * across 265 files. VERSION.system is the platform release.
 * VERSION.modules[name] is the module's own semver.
 *
 * Bump rules:
 *   PATCH (+0.0.1) — bug fixes, no new API surface
 *   MINOR (+0.1.0) — new capability, backward compatible
 *   MAJOR (+1.0.0) — breaking change, API incompatibility
 *
 * System version bump = new zip release.
 * Module version bump = that module's contract changed.
 *
 * ── DRIFT RECONCILIATION (2026-06-18) ────────────────────────────────────────
 * Four files in this repo have historically made independent version claims:
 * this file, package.json, MANIFEST.json, and README.md. They had drifted —
 * package.json was stuck at 0.6.3 while this file had moved to 0.7.8;
 * MANIFEST.json (3.0.0) and README.md (5.1.0) are frozen historical snapshots
 * from an earlier session/architecture (MANIFEST: Day 1-3 session log,
 * pre-Phase-numbering; README: an Emergence/.eg-exclusive design that was
 * never actually built — zero .eg files exist in this codebase).
 *
 * Resolution: package.json was synced to match this file, per the "Matches
 * package.json" comment below — that's a real, stated invariant, not a
 * guess. MANIFEST.json and README.md were NOT rewritten to match; they are
 * marked superseded in-place (a banner/field pointing here) with their
 * original historical content left untouched, since silently rewriting
 * someone else's session log or design doc to make it look synced would
 * hide the discrepancy rather than resolve it. This file remains the one
 * place that's supposed to move every phase.
 */

const VERSION = {

  // ── System ──────────────────────────────────────────────────────────────────
  // The full NEXUS platform version. Matches package.json.
  system: '0.9.10',

  // ── Services ────────────────────────────────────────────────────────────────
  // Each service running on a port.
  services: {
    orchestrator: '2.2.0',   // :9000 — root coordinator, contract verification [0.9.10: tv-shell promoted to homepage, loom contract path registered, /api/capabilities proxies real HTTP instead of in-process require] [0.9.11: /ui/idearium 404'd with "UI not found: idearium" since whenever the tv-shell's full-idearium-tab iframe was built to point at it — idearium's real UI lives at nexus/idearium/ui/, a sibling of UI_ROOT (nexus/ui/), never nested under it like every other system's full-tab UI is. tests/integration.test.js already asserted this route should return 200; it was a documented, tested requirement failing silently. Special-cased the route to serve from idearium's actual directory. Verified live: 200, real 1539-line HTML, existing test now passes.]
    bridge:       '3.2.0',   // :9999 — trust relay, circuit breaker [0.9.10: copilot.*/guardian.*/ollama.generate added to the request-type whitelist — every Clear Glass bridge dispatch for those targets was being rejected as "unknown type" before this] [0.9.11: router.js's ResultGate destructured the route.result event WITHOUT `data` (DispatchGate's captured downstream response body) and resolved with only {ok,uuid,status} — discarding the actual answer on EVERY successful dispatch, silently, for as long as this file has existed. This is the real root cause of "co-pilot showing json strings" — traced across four separate UI surfaces and three prior fix attempts (idearium's spec-engine dispatch, Clear Glass's copilot/bridge.js, tv-shell's menu.js CLI) before finding it here, one layer downstream of all of them. A 2026-07-05 fix on copilot/server.js's side was correct and never held, because nothing downstream of this gate ever received what it sent. Verified live: POST /bridge/request for a copilot.prompt now returns result.response.text as a real field instead of the response being entirely absent.]
    cortex:       '3.2.0',   // :3748 — memory, organs, intelligence, RAID, reflection, user-model, compartment-engine, crystal-lattice
    guardian:     '3.6.2',   // :7820 — AI engine, NCP, SEAM, provider routing [0.9.10: grammar-fallback.js require paths fixed — was crash-looping on boot]
    idearium:     '3.0.0',   // :4800 — idea manager, project repo, lattice
    architect:    '1.0.0',   // :3747 — spec builder, hook registry
    emerge:       '1.0.0',   // :4242 — DSL runtime, .eg compiler
    diagnostic:   '1.0.0',   // :7825 — 12-engine diagnostic suite
    // §BUGFIX 2026-07-04: these five are real, running sovereign systems —
    // eravos has been online since the meta/spatial work, ollama-bridge/
    // copilot/clear-glass since the sovereignty split, loom since phase
    // 121-157 — and none of them were ever added here. This file's own
    // header calls itself "single source of truth for all system and
    // module versions" — it wasn't, for a fifth of the running services.
    eravos:       '3.0.0',   // :3751 — sovereign canvas system, ALK-GL particle field
    'ollama-bridge': '1.0.0', // :3749 — sovereign HTTP wrapper around local Ollama, job queue
    copilot:      '3.2.0',   // :3750 — sovereign co-pilot, dual-cognition [0.9.10: /bridge/deliver added — Bridge routes here, was 400ing on every request with no handler] [0.9.11: dispatchFn's `x || y || JSON.stringify(z)` fallback chain could pick a raw object as `output` whenever the truthy-but-wrong field won the chain — two near-identical occurrences a few lines apart, extracted into one exported extractDispatchText() so this can't drift between them again; the test that should have caught this (copilot-handshake-dispatch.test.js) was asserting its OWN duplicated copy of the buggy logic instead of the real function, which is the actual mechanism behind "fixed over and over but keeps getting changed back" — now imports the real function, plus server.listen() gated behind require.main so importing this file for its exports no longer has the side effect of binding :3750, which is almost certainly why the test duplicated the logic in the first place. Also: lifeline's confidence/escalated/escalationReason were computed on every /bridge/deliver response and then discarded before reaching storage or the UI — "over-relying on lifeline" was unverifiable either way; now persisted to chat_log and shown per-exchange in ui/channels/conversations.]
    'clear-glass':'3.1.0',   // :7701 (SSE) — sovereign Electron browser shell
    loom:         '1.0.0',   // :3752 — component/hook/wire/seam registry + contracts [0.9.10: given a real server.js, port, and orchestrator handshake — was a library with no process before this]
  },

  // ── Core modules ─────────────────────────────────────────────────────────────
  modules: {
    // Memory
    'jaa-db':           '6.0.0',
    'vector-memory':    '1.0.0',   // SNR-gated semantic search
    'chat-logger':      '1.0.0',   // conversation logging + context reinjection
    'context-builder':  '1.0.0',
    'component-registry':'1.0.0',   // Phase 1 complete
    'ui-registry':      '1.0.0',   // Phase 2 complete — UI handshake

    // Intelligence
    'raid':             '6.2.0',   // provider routing, constraint-then-fitness dispatch + _approveTool gate
    'intelligence':     '1.0.0',   // pattern crystallisation
    'heartbeat':        '2.0.0',   // 3-tier: health + API pulse + telemetry

    // Self-heal
    'self-heal':        '1.0.0',
    'escalation':       '1.1.0',   // named+typed stale_module gaps, gapLabel in all logs
    'gap-finder':       '1.1.0',   // stale_module: named module, port, staleSec, typed severity
    'snapshot':         '1.2.0',   // NEX-SNAP/1.2: cortex_state_hash + prev_snapshot_hash tamper-evident chain
    'divergence-watcher':'1.0.0',  // sigma threshold watcher, 90s cooldown, blackbox pre+post
    'macro-compiler':   '1.0.0',   // causal macro from pattern engine: chain, precursors, trajectory

    // Forge
    'forge':            '2.0.0-spec',   // §CORRECTED 2026-07-07 — was '1.0.0' claiming forgePatch/forgeGate/forgeScaffold/seamDispatch shipped; confirmed by direct grep, none exist anywhere. Real pipeline exists under different names (see docs/forge.spec v2.0.0) — this string now reflects the honest spec status, not a fictional implementation.
    'ncp':               '1.1.0',   // v0.9.8: updateClient() — claimed/chatId propagated on REGISTER
    'seam':             '1.0.0',

    // Auth
    'auth':             '1.0.0',   // RSA-2048 + AES-256-GCM + SNR gate

    // Diagnostic
    'diagnostic-engines': '1.0.0', // 12 cross-domain methods

    // Spec / Build
    'spec-compiler':    '1.1.0',
    'blueprint':        '1.1.0',

    // UI
    'builder':          '1.0.0',
    'spec-drift':       '1.1.1',   // spec version drift detector, now with metadata caching design [0.9.10: require path to version.js fixed, docs-dir path fixed — was pointed at orchestrator/docs, a folder that never existed]
    'behavioral-boundary':'1.0.0', // behavioral boundary organ — INV-A/B/C
    'grammar-engine':   '1.2.0',   // Phase 5 — trie, resolve, complete, parseParams, Phase 31 misfire tracking
    'grammar-fallback': '1.0.1', // Phase 15 close — shared CLI resolution, guardian + nexus-repl [0.9.10: require paths to grammar-engine/component-registry fixed — pointed at a sibling that moved into shared lib/, crash-looped guardian on boot]
    'mutation-contract':'1.0.1', // seam-component-registry-spec.md §9.5 — comp_properties mutation governance [0.9.10: require path to component-registry fixed, same class of bug as grammar-fallback]
    'cli-reasoning':    '1.0.0',   // Qwen 0.5b — rephrase, gap, correction, agent check
    'liminal-space':    '1.0.0',   // Phase 7 — 5 interstitial spaces, crystallisation, forward inference
    'raid-snr-filter':  '1.1.0',   // Phase 8 — invariants first, patterns second, AI last, tier-4 context fix
    'intelligence-bridge':'1.0.0', // Phase 8.5 — intelligence fully wired into RAID
    'replay-engine':    '1.1.0',   // Phase 8.6 — 16/16 tests, orchestrator boot wiring
    'open-loop-taxonomy':'1.0.0',  // Phase 8.6 — 10-type loop taxonomy, legacy type map
    'loop-topology':    '1.0.0',   // Phase 8.6 — focal point detection, leverage scoring
    'gap-loop':         '1.0.0',   // Phase 8.6 — continuous resolution loop, RAID-routed
    'request-handler':  '1.0.0',   // Phase 9 — constitutional choke point, ABCD pipeline
  },

  // ── Roadmap — Phases 10–30 ──────────────────────────────────────────────────
  // §3.1 BOTTOM-UP ONLY. Each phase depends only on what is already built.
  // Every phase lists its hard dependencies explicitly.
  // status: complete | active | next | pending
  roadmap: {

    // ── TIER 0: Already complete ──────────────────────────────────────────────
    // These sessions produced working code. Recorded here for continuity.

    'Phase 22': {
      name: 'Divergence Watcher + Blackbox Recorder',
      status: 'complete',
      deps: ['snapshot', 'intelligence', 'gap-loop'],
      summary: 'cortex/snapshot/divergence-watcher.js — polls sigma_records every 5s. Fires at sigma >= 0.65 or spike +0.20 in one window. 90s cooldown. On divergence: captures system_state synchronously, blackbox_pre (last 10min deflate-compressed), schedules blackbox_post (30s after). cortex/intelligence/macro-compiler.js walks 30 days of history → cause chain, precursors, sigma trajectory, recurrence, plain-English summary. .nex upgraded to v1.1: system_state, divergence_context, blackbox_pre, blackbox_post, macro, resume. New Cortex API: GET /api/snapshots/divergence-watcher, /blackbox, /macro.',
    },

    'Phase 23': {
      name: 'Stale Module Gap — Named, Typed, Severity-Graded',
      status: 'complete',
      deps: ['gap-finder', 'escalation', 'emerge/siso'],
      summary: 'gap-finder encodes full identity: "[idearium:4800] stale 47s — last seen: 2026-06-17T..." with moduleName, modulePort, staleSec, typed severity. Severity by criticality: cortex/orchestrator/guardian → high immediately; bridge/idearium/emerge → medium 2min then high; others → low 5min, medium 10min, high after. Escalation logs read "escalating stale_module:idearium:4800". bus.onAny fixed in emerge/siso (intercept-patch stream.emit). idearium/core/index.js restored as re-export stub.',
    },

    'Phase 24': {
      name: 'TV Shell — Floating Menu Root Cause + Hardening',
      status: 'complete',
      deps: ['ui/home/index.html'],
      summary: 'Root cause: literal newline inside single-quoted JS string in asSend() killed the entire script block — toggleMenu undefined everywhere. Also: all 6 Overview tile tune() indices off by one, tile-dg called tune(7) out of bounds (CH_META has 7 entries, 0-6). Duplicate transform: in #menu-overlay CSS. z-index stacking during ch-in animation — menu-btn z-index → 9999, isolation:isolate + will-change:transform added. Cortex event logging wired: ui.boot, ui.menu.open, ui.menu.close, ui.channel.switch.',
    },

    // ── TIER 1: No pending-phase dependencies — build these first ─────────────

    'Phase 10': {
      name: 'Constitutional AI — lib/constitutional-ai.js',
      status: 'complete',
      deps: ['request-handler', 'gap-loop', 'jaa'],
      // §3.1: request-handler already exists. This formalises what it enforces implicitly.
      // §1.1: typed axiom objects — nothing silent, every violation has a UUID
      // §4.3: enterprise-grade — blast_radius typed, cost estimated before action
      summary: 'Formalise the four axioms implicit in request-handler into typed objects: USER_AUTONOMY, REVERSIBILITY, TRUTH_OVER_COHERENCE, EXPLAINABILITY. Each axiom: check(req, ctx) -> { pass, reason, axiom, cost, alternatives }, severity (block/warn/flag), blast_radius (none/local/system/irreversible). Goal graph maps intent to cluster, checks alignment with system objectives — misaligned → HELD not DENIED (user may be right). Identity kernel: typed self-model of what NEXUS is/is not/will not do — read-only from request-handler, writable only by reflection engine after N confirmed evidence items. Wired into request-handler Phase A as constitution.check() before all outcome decisions.',
      built: 'lib/constitutional-ai.js — check(req,ctx) runs goal-graph (misalignment → HELD, CONSTITUTIONAL gap opened via open-loop-taxonomy) then all 4 axioms in order, short-circuits on first BLOCK severity, logs every result (pass or fail) to new JAA table constitution_decisions. Identity kernel frozen at module load, Object.freeze on every nested array — no write path exists yet, by design, pending Phase 11. request-handler.js Phase A3+A4 collapsed into one call to constitutionalAI.check(); old inline _goalGraphCheck/_constitutionCheck kept as fallback path if the module is unreachable (§1.2 — never skip the check silently). 23/23 new tests (tests/modules/constitutional-ai.test.js), 301/301 across full module suite, no regressions.',
    },

    'Phase 14': {
      name: 'Hot Module Loader — Immune System Model',
      status: 'pending',
      deps: ['bus', 'jaa', 'snapshot'],
      // §3.1: data/schema before behavior — module spec proved before integration
      // §1.3: no stubs in production — module must pass its own invariant tests first
      // §5.1: UUID + hook + bus on everything loaded
      summary: 'Drop a file into the watched directory → prove → integrate live. No restart. Stages: (1) QUARANTINE — module loaded in isolated vm.Script context, given a mock JAA and bus; (2) PROVE — module must export validateInvariants() that returns { pass, violations }; (3) INTEGRATE — if pass, register with real bus + JAA, add to component-registry; (4) MONITOR — heartbeat watcher checks it for 60s, auto-eject if invariants fail. Rollback: snapshot taken before integration, auto-restore on eject. Every loaded module gets UUID + hook + bus registration at wire time.',
    },

    'Phase 17': {
      name: 'Userscript Heartbeat Pulse — ♥ on NCP Emit',
      status: 'pending',
      deps: ['userscript-claude', 'userscript-chatgpt', 'guardian/server'],
      summary: 'Userscript pill gets ♥ that pulses (snap red, fade back) on every NCP SSE message received. Each system tile in TV shell Overview flashes its icon on events from that system — wired via SSE, no polling. SRC_DOT map: source string → dot element ID. SRC_TILE_ICON map: source string → tile icon element. flashDot() removes/re-adds flash class (void offsetWidth forces reflow to restart animation). tile-icon.flash animation: drop-shadow pulse 0.5s ease-out.',
    },

    'Phase 15': {
      name: 'Grammar Engine — CLI + Component System',
      status: 'complete',
      deps: ['grammar-engine', 'component-registry', 'request-handler', 'nexus-repl'],
      // §3.1: grammar-engine already built (Phase 5). This wires it into consumers.
      // §5.2: everything implements the bridge — grammar becomes the interface layer
      summary: 'grammar-engine.js hooked into: (1) CLI tab completion in nexus-repl.js — on Tab, resolve() the partial input, complete() the token, display candidates; (2) component-registry — every registered component exposes a grammar signature (verb + noun + params); (3) guardian dispatch — command string parsed by grammar.resolve() before NCP dispatch, structured intent extracted; (4) request-handler Phase B — grammar resolve runs before SNR filter. Grammar tree expands from component-registry on every boot. Custom component commands: any system can register new grammar nodes by adding to component-registry.',
      built: "Of the 4 wiring points: (1) and (4) were already real on inspection — request-handler.js Phase B already calls grammar-engine on the unknown-intent fallback path, nexus-cli.js already resolves via ge.resolve(). (2) was already real — component-registry.js requires a non-empty grammar array on every component, served at /api/components/grammar. The 2 genuinely missing: nexus-repl.js called loadGrammar() and referenced _grammar in describe/caps/boot — neither was ever defined, so those commands threw ReferenceError, silently swallowed by a .catch(()=>{}). Fixed by requiring lib/grammar-engine.js and defining loadGrammar() using the same fetch-once-cache pattern nexus-cli.js already proved; also fixed two references to a status().commandCount field that does not exist on the engine (only componentCount does — confirmed against grammar-engine's own passing T-015). Guardian's /cli/exec default case had zero grammar involvement — any command outside its hardcoded switch returned a flat \"Unknown command\", no path for anything registered after the switch was last edited. New lib/grammar-fallback.js (single shared resolver, not duplicated inline per §5.7) wires ge.resolve() + component-registry.get() into that default case; it reports the resolved component and its declared route but does NOT invoke it — nothing else in this codebase dereferences component.route into a real call yet, that's Phase 40 territory, and building invocation here would have been undisclosed scope creep. 6/6 new tests (tests/modules/test-grammar-fallback.js), 608/609 across full module suite (1 pre-existing unrelated failure in test-liminal-space.js, confirmed present on the untouched base zip before this pass touched anything).",
    },

    // ── TIER 2: Depends on Phase 10 (Constitutional AI) ──────────────────────

    'Phase 11': {
      name: 'Reflection Engine — lib/reflection.js',
      status: 'complete',
      deps: ['Phase 10', 'request-handler', 'raid', 'gap-loop', 'jaa'],
      // §3.1: needs Phase 10 identity kernel before it can propose updates to it
      // §2.1: every decision persisted before reflection runs on it
      summary: 'UNRESOLVED as first-class state — not failure, legitimate outcome. Every decision: reason + outcome + satisfaction score (0-1). If outcome.satisfaction < 0.5 for N consecutive decisions of same class → lower RAID agent score + open KNOWLEDGE or CAPABILITY loop in gap system. Self-model update loop: reflection.js proposes updates to constitutional-ai.js identity kernel — only after N confirmed evidence items, only via gap system (never directly). Satisfaction scores accumulate into BDA as behavioral signal. Decision log queryable: GET /api/reflection/decisions?class=forge&outcome=UNRESOLVED.',
      built: 'lib/reflection.js — runReflectionPass() scores unscored decision_log rows deterministically (scoreDecision: RESOLVED/executed→0.9, UNRESOLVED→0.3 honest-uncertainty not failure, HELD→0.55, DEFERRED→0.5, DENIED→0.4, CLARIFICATION_REQUIRED→0.5), updates each row in place via the decisionLogUuid request-handler now exposes (no requestId/timestamp guessing), forwards every score to BDA via new kernel.observeSignal() as role:"reflection". 3-consecutive-low-satisfaction-per-class streak → opens KNOWLEDGE or CAPABILITY gap (heuristic on class name, corrigible via evidence in the gap itself); streak tracker guards against double-counting a re-scored row via a bounded counted-uuid set. RAID feedback: aggregates existing event_log user.satisfied events by cluster:agent into a read-only summary — never calls into RAID internals (_updateW stays unexported, by design). Identity-evidence accumulator (trackIdentityEvidence) gates at N items then opens a CONSTITUTIONAL gap proposing a kernel change — never writes to constitutional-ai.js directly; human/later-phase review required. Companion changes: request-handler.js _phaseC now captures and exposes decisionLogUuid; bda/kernel.js gained observeSignal() + reflection as a third tracked role (kept out of composite, replay-safe across restarts). 19/19 new tests (tests/modules/reflection.test.js), 320/320 across full module suite, no regressions.',
    },

    // ── TIER 3: Depends on Phase 10 + 11 ─────────────────────────────────────

    'Phase 12': {
      name: 'User Model — Hypotheses, Not Profile',
      status: 'complete',
      deps: ['Phase 10', 'Phase 11', 'bda', 'jaa'],
      // §1.1: every observation has a UUID — nothing stored as fact without evidence
      // §4.3: confidence + evidence count on every belief, never inferred silently
      summary: 'Hypothesis store, not a profile. Every observation: { uuid, claim, confidence, evidence_count, last_seen, source }. confidence + evidence on every item — never stored as fact. BDA baseline integration: behavioral drift signals update hypothesis confidence. Tracks: preferences (provider choice, prompt style), pace (how fast responses are consumed), communication style (technical depth, verbosity). User model queryable from request-handler Phase B for context injection. Never shared externally. Decays: confidence reduces 0.1/day without reinforcement.',
      built: 'lib/user-model.js — observe()/reinforce a claim (never resets to fact, evidence_count increments, confidence capped at 1); deriveFromChatLog() reads chat_log rows already populated by chat-logger.js (provider, ts, contentLength, bdaSignals from lib/meta/bda stateless extract — NOT the separate Phase-11 kernel singleton, a real and pre-existing split in this codebase) and turns observable patterns into preference/pace/communication_style hypotheses. Decay is a view-time transform (effectiveConfidence()) — stored confidence is never mutated by time, only by new evidence; floor at 0.05 so history is never fully forgotten. getHypotheses()/buildContextSummary() filter by decayed effective confidence, never raw stored value. checkContradictions() flags same-category contradictory hypotheses above threshold and opens a CONFLICT gap — never auto-resolves. Wired into request-handler.js Phase B3.5: ctx.userModelContext available to the execution callback for soft context, never blocking, never required. No outbound network calls anywhere in this file — "never shared externally" is structural, not policy. New JAA table: user_model_hypotheses (long tier). 24/24 new tests (tests/modules/user-model.test.js), 344/344 across full module suite. Boot: added to the constitutional.reflection.wiring SOFT phase in cortex/boot.js (no background loop of its own, same as constitutional-ai — diagnostic-only, not an organ). Unlocks Phase 13 (Autonomous Loop).',
    },

    // ── TIER 4: Depends on Phases 10 + 11 + 12 ───────────────────────────────

    'Phase 25': {
      name: 'RAID Compartment Engine',
      // NOTE: the phase-map markdown (nexus-phase-map.md) marked this phase
      // `complete` since before this entry existed, with zero implementation
      // behind it. Phase 26 (Adversarial Integrity Layer) and Phase 46
      // (Case Library) were in the same state — also marked complete, also
      // nothing built. This entry reflects actual, current, verified status.
      // The phase-map markdown has not been corrected (out of scope to
      // silently rewrite someone else's spec doc).
      status: 'complete',  // all 5 sub-steps built: hashing, compartment lifecycle,
                            // constraint frame (folded into lifecycle), adversary
                            // suite + QA/QC, crystal/lattice.
      deps: ['Phase 10', 'Phase 45', 'snapshot', 'jaa'],
      // §2.1: snapshot before every choice — compartments cannot mutate Cortex directly
      // §5.3: constraint frame cannot be modified after spawn — enforced by Object.freeze
      summary: 'Isolated working-memory sandbox per action. Compartments cannot mutate Cortex directly — all mutations delta-based after PASS. Constraint frame assembled at spawn from constitutional axioms (Phase 10), intent risk_level (Phase 45), architectural laws, capability ceiling (Phase 44 — does not exist), active negative crystals (Phase 26). Adversary suite (6 attack classes) + QA/QC layer. PASS -> commit delta, lattice update, crystallize. FAIL -> rewind to snapshot (recoverable) or DELETE (unrecoverable: frame breach, integrity compromise — no rewind, nothing trustworthy to rewind a compromised compartment to).',
      built: 'Sub-step 1 — cortex/snapshot/index.js: cortex_state_hash + prev_snapshot_hash tamper-evident chain, verifySnapshotIntegrity()/checkChainIntegrity(). Format -> NEX-SNAP/1.2. Fixed a stale pipeline test stuck on the old hardcoded format string. Sub-step 2 — lib/compartment-engine.js: full COMPARTMENT lifecycle (spawn/execute/resolve -> PASS / FAIL-REWOUND / DELETE), constraint frame frozen at spawn, honest nulls for fields with no real source (Phase 44 max_resolution_level). Extension points (_registerExtensions) for sub-steps 4/5, auto-registered lazily on first spawn() so no caller has to remember to wire them. spawn() also denormalizes intent.domain/verb onto the compartment (_declaredDomain/_declaredVerb) as a read-only convenience for downstream consumers that need it without re-fetching the intent record. Sub-step 4 — lib/adversary-suite.js: all 6 attack classes (syntax/logic/edge-case/state/cross-domain/stress) as real mechanical checks against compartment.result/constraint_frame/trace_log, not stubs — stress class genuinely re-invokes the executor N times (intensity scaled by risk_level, READ=1x up to IRREVERSIBLE=5x) to catch non-determinism and budget overruns. QA/QC layer (syntax/schema/type/invariant/deterministic-replay). state class is the literal frame_violation source that routes to DELETE. compartment-engine.js execute()/resolve() updated to thread the executor reference through so stress can use it. Sub-step 5 — lib/crystal-lattice.js: pattern-frequency crystallization (CREATE_CRYSTAL / CREATE_NEGATIVE_CRYSTAL) into the EXISTING crystals table (coexists with cortex/liminal-space/index.js -- different focalPoint-based schema as a superset, never reinterpreted) — counter resets after firing to avoid refiring on every subsequent match. Lattice: one edge per (domain,verb) aggregating ALL resolutions (not split by outcome — an earlier version split by outcome and made success_rate trivially 1.0/0.0 by construction, caught by its own test suite and fixed before this was marked complete), weight increases on success/decreases on failure/strengthens 1.5x on repeated-same-outcome transitions, scheduled decay (separate interval from per-execution updates) prunes to a floor. New JAA tables: compartments, lattice_edges (both long tier). Boot: compartment-engine added to the wiring-check SOFT phase; crystal-lattice added to the organs array (real decay-tick polling loop, same pattern as reflection). 101 new tests across 4 files (snapshot-integrity 11, compartment-engine 23, adversary-suite 30, crystal-lattice 20 — 17 more than the original 22+11 estimate once sub-steps 4/5 needed their own coverage). Full regression: 428/428 module tests, 37/37 pipeline. Unlocks Phase 13 (still also needs Phase 46, not built this pass) and Phase 26 (negative-crystal promotion mechanism now real; hash-chain integrity also real — Phase 26 remaining piece is the system-level adversary audit replay, not built this pass).',
    },

    'Phase 46': {
      name: 'Queryable Case Library',
      // NOTE: same false-complete state as Phase 25/26 (see that entry's
      // note) — phase-map.md marks this `complete`, nothing was built.
      // This entry reflects actual, current, verified status.
      status: 'complete',
      deps: ['Phase 25', 'crystal-lattice', 'jaa'],
      // §1.1: every index write/query carries a real signature, nothing silent
      // §2.1: index entries persisted to JAA before any query can see them
      // §5.3: read-only with respect to crystals/lattice_edges/compartments
      summary: 'Every PASS compartment trace indexed by intent signature (domain:verb). Before spawning a compartment, RAID queries the case library — matching past execution seeds the new compartment\'s working memory. High match (>=0.85) -> full trace seed. Medium (>=0.60) -> skeleton seed. Low (<0.60) -> cold spawn. Negative crystal hit -> path blocked, checked before confidence.',
      built: 'lib/case-library.js — indexCompartment(compartment, outcome) registered as a fourth named slot (caseLibraryIndex) in compartment-engine.js\'s _registerExtensions, same pattern as adversarySuite/qaqcLayer/crystalLatticeUpdate, auto-registered the same lazy-require way. Fires from _pass() only — FAIL/DELETE traces are never indexed (negative crystals already cover the "don\'t repeat this" side). Reads compartment._declaredDomain/_declaredVerb off the in-memory object, not the JAA row (the row only carries intent_uuid). Bounded per signature at 20 traces (CASE_LIBRARY_MAX_PER_SIGNATURE), oldest soft-evicted via jaa.update(_evicted:true) — JaaDB has no delete(), same pattern crystal-lattice\'s decay tick already uses for lattice_edges pruning. query(intent) is L1 (exact domain+verb match, zero LLM, zero embedding) — confidence is read directly from crystal-lattice\'s lattice_edges.success_rate via its newly-exported _edgeKey() (added specifically so this module never reconstructs that string format independently and risks silent drift). Negative-crystal check runs first and overrides tiering entirely. High confidence with no surviving trace (evicted, or crystallized before this module existed) honestly downgrades to skeleton rather than fabricating a seed. No lattice edge yet -> cold with confidence:null, distinct from a real low success_rate -- "never seen" and "always fails" never collapse into the same number. New JAA table: case_index (long tier). Boot: added to the existing Phase 10/11/12/25 wiring-check SOFT phase in cortex/boot.js. 14/14 new tests (tests/modules/case-library.test.js), 1 existing compartment-engine.test.js assertion updated for the new CASE_LIBRARY_INDEX trace step it now produces on every PASS. Open item: compartment-engine.spawn() still has no live caller anywhere in the codebase — query()-before-spawn is real and tested in isolation, but the actual RAID loop this spec describes is Phase 13\'s to build, not this phase\'s. Unlocks Phase 13 (Autonomous Loop) -- this was its last unmet dependency; 10/11/12/25/gap-loop/ollama/snapshot were already satisfied.',
    },

    'Phase 13': {
      name: 'Autonomous Loop — Ollama as Brain',
      status: 'complete',
      deps: ['Phase 10', 'Phase 11', 'Phase 12', 'Phase 25', 'Phase 46', 'gap-loop', 'ollama', 'snapshot'],
      // §3.1: Goal + Budget + Boundary + Exit MUST be declared before loop starts
      // §1.1: every autonomous action has UUID + causedBy chain
      // §2.1: snapshot before every irreversible autonomous action
      // §4.3: Budget is hard ceiling — loop auto-halts at cost ceiling
      summary: 'Ollama is the brain. Autonomous run requires: Goal, Budget (>=1 of timeMs/maxSteps/costCeiling — no implicit/open-ended), Boundary (written, not inferred), Exit (steps/stable/manual — see built note on scope). ARCHITECTURE DECISION (asked, answered 2026-06-19, not assumed): every step is a gap, full reuse of gap-loop\'s existing level0-4 ladder as the execution mechanism, not a parallel one. Rewind on sigma >= 0.70 (real check, against a table nothing writes to yet — see built note). Every action carries UUID + causedBy chain to the run.',
      built: 'lib/autonomous-loop.js — startRun({goal,budget,boundary,exit_condition}) is the real, tested entry point (no CLI/API trigger built this pass — nexus-cli.js\'s registration pattern was not explored, scoped out rather than guessed at). Each step: intent-classifier.classify({text,runId,step,causedBy}) (already special-cased this module by runId alone — built anticipating this file) -> case-library.query() (blocked signature halts the RUN as BLOCKED before any gap exists, never silently retried) -> compartment-engine.spawn(workingMemorySeed) -> compartment\'s executor inserts a gap and awaits its terminal state, polling the gaps table directly (gap-loop\'s own _tick() interval is independent and unmodified). REAL BUG FOUND BUILDING THIS, FIXED IN SCOPE ONLY: open-loop-taxonomy.createLoop() defaults every gap to status:\'open\'; gap-loop._tick() only ever polls for status:\'pending\' (confirmed: \'pending\' isn\'t even in LOOP_STATES). Checked all 4 existing createLoop() callers (constitutional-ai/reflection x2/compartment-engine) — none override status; every CONSTITUTIONAL gap those phases have ever created has been silently un-pickupable since they were built, because nothing depended on automatic pickup before this phase did. Fixed at this module\'s own insert site only (status:\'pending\' explicit) — the shared createLoop() default and the other 4 callers were deliberately left untouched, since changing a shared default retroactively alters four already-shipped phases\' behavior without being asked to; this is a system-wide-fix decision for a human or a later phase, not assumed here. Step outcomes: gap resolved -> compartment PASS, run continues; gap escalates to human_required -> run.status HUMAN_REQUIRED, stops (no auto-retry-with-new-approach layer exists or is fabricated — "inject context" is only as much as the next case-library query honestly provides); step exceeds budget.stepTimeoutMs -> treated as BUDGET_EXHAUSTED, a hard limit per the loop_contract, not a soft retry trigger. Sigma check is real and queries sigma_records for an actual numeric reading >= 0.70 -> halts + rewinds via snapshot.rollback(preRunSnapshotId) -- but confirmed zero insert(\'sigma_records\'...) call sites exist anywhere in this codebase; divergence-watcher polls a table nothing populates. A null reading logs a degraded-monitoring warning once per run and does not halt by itself (treating "no signal" as "unsafe" would make every run unusable given a pre-existing gap this phase doesn\'t own). exit_condition: \'steps\' (fixed count) and \'stable\' (N consecutive PASS, via the run.steps summary objects\' real `status` field — caught and fixed a field-name bug here during testing, see test suite) are real; the spec\'s own "health score stable" example has no canonical metric source anywhere in this codebase to evaluate against and is not faked. Per-step cost reuses request-handler\'s real COST_TIERS (LLM_LOCAL=0.5 etc.) and DEFAULT_COST_CEILING is actually 0.85, not the 0.50 an earlier draft note in this file guessed before Phase 46/13 existed. New JAA table: autonomous_runs (long tier). Boot: added to the Phase 10/11/12/25/46 wiring-check SOFT phase (diagnostic-only, no background loop of its own — invoked per-run via startRun()). 21/21 new tests (tests/modules/autonomous-loop.test.js).',
    },

    // ── TIER 5: Depends on Phase 14 (Hot Loader) + Phase 15 (Grammar) ────────


    'Phase 31': {
      name: 'Grammar ↔ Intent: Structured Pre-Classification',
      status: 'complete',
      deps: ['Phase 45', 'grammar-engine', 'raid', 'snr-filter', 'request-handler'],
      summary: 'Lets the plain-command understanding engine pre-filter before the intent system guesses — clear commands handled faster, unclear ones flagged instead of silently misrouted.',
      built: "Three real gaps closed, not just wiring confirmed: (1) grammar-engine.resolve() had no confidence field at all \u2014 added _resolveConfidence(): full match/alias = 0.95, partial match scaled by completion ratio, floored 0.3. (2) request-handler.js Phase B1 previously let ANY grammar match \u2014 including a low-confidence partial one with leftover remainder tokens \u2014 bypass the classifier and RAID entirely and execute directly with zero confidence gating. Now gated at >0.8 (spec's literal threshold); below it falls through to the classifier/RAID pipeline like any other request instead of silently executing against a possibly-wrong component. (3) misfire tracking required a decision_log row to identify which component a grammar-routed decision targeted \u2014 it never did; decision.chosen only ever held the outcome enum (RESOLVED/DENIED/etc), and even after adding grammarComponentId to the decision object in _phaseC, replay-engine.js's logDecision() destructured only a fixed field set and would have silently dropped it before it ever reached decision_log \u2014 found and fixed at that actual point of loss, not papered over downstream. reflection.js's existing 3-streak mechanism (built for Phase 11) now classes by grammarComponentId when present instead of the generic chosen:actor bucket, opening a CAPABILITY gap tagged reviewTarget:'idearium' on 3 consecutive misfires. Honestly scoped: no live bridge moves this gap into Idearium's own separate db.gaps \u2014 that's Phase 16, marked superseded in this same roadmap \u2014 so this tags for review, it does not guarantee pickup. Deferred, not built: the spec's case-library-hit/miss-rate feedback loop into grammar confidence weights \u2014 would require grammar-engine to query case-library's per-signature success_rate, a new coupling not designed yet, not guessed at here. Known test gap: request-handler.js has no dedicated test file in this codebase at all (confirmed pre-existing) and exports only handle()/prompt(), not its internal phases \u2014 the 5.5/0.8 confidence gate inside _phaseB is covered indirectly (grammar-engine's confidence scoring and reflection.js's per-component classification are both directly tested) but not exercised by a request-handler integration test itself. 9 new/changed tests across grammar-engine (4) and reflection.js (3), 626/627 full module suite (1 pre-existing unrelated failure).",
    },
        'Phase 16': {
      name: 'Idearium ↔ Repo ↔ Spec Builder ↔ Architect',
      status: 'pending',
      deps: ['Phase 14', 'Phase 15', 'idearium', 'architect', 'versionium'],
      // §3.1: data (idea) before schema (spec) before behavior (hook) before UI (component)
      summary: 'Full pipeline: idea → tension → spec → hook → component → commit. Steps: (1) Idearium: POST /api/ideas/:uuid/promote → creates spec in architect input queue; (2) Architect: spec → hook registration in hook-registry; (3) Hot Module Loader (Phase 14): hook → component-registry entry; (4) Grammar Engine (Phase 15): component exposes grammar node; (5) Versionium: commit tagged with idea UUID, spec hash. Bidirectional: git commit message containing spec UUID back-links to idea. Ideas visible in TV shell Idearium channel with spec/hook/commit status badges. Tension score drives promotion priority.',
    },

    // ── TIER 6: Depends on Phase 27 (VM) ─────────────────────────────────────

    'Phase 27': {
      name: 'System State VM — Full Suspend/Resume (NEX-VM/1.0)',
      status: 'pending',
      deps: ['snapshot', 'divergence-watcher', 'replay-engine', 'jaa'],
      // §3.1: persistence (JAA tables, snapshot) before behavior (suspend/resume logic)
      // §2.1: disk before behavior — runtime_state written atomically before any action
      // §1.2: resume must verify all invariants before marking as restored
      summary: 'Every .nex becomes a full suspend image. Fields added: runtime_state (heap snapshot, open file descriptors, socket states, active timers, env vars), bus_queue (in-flight events at suspend moment — ordered by seam_ts), module_states (each organ last known state from heartbeat), resume_plan (dependency-ordered restart sequence). Auto-suspend: sigma >= 0.80 sustained 30s, or SIGTERM, or critical module enters failure mode. Different half-life: VM images kept 7 days vs 24h for regular snapshots. Resume: orchestrator reads resume_plan, restarts in dependency order, replays bus_queue events, verifies sigma < 0.50 within 60s or triggers divergence-watcher.',
    },

    // ── TIER 7: Depends on Phase 14 + 27 ─────────────────────────────────────

    'Phase 28': {
      name: 'Build From Inside — Live System Editor',
      status: 'pending',
      deps: ['Phase 14', 'Phase 27', 'emerge-ide', 'architect', 'gap-loop'],
      // §3.1: hot loader (14) and VM rollback (27) must exist before editing live
      // §2.1: snapshot (VM image) always taken before any live edit
      // §1.3: no stubs — every edit must pass invariant proof before integration
      summary: 'Three modes of building NEXUS from within: (1) IN-PROCESS HOT PATCH via Emerge IDE channel — source tree editable inline, SISO bus live stream visible, compile + gap list, one-click patch-and-reload with auto-rollback on failure; (2) SPEC-FIRST via Idearium→Architect pipeline (Phase 16) — idea → spec → hook → hot-load → verify; (3) META LAYER COMMAND SURFACE — natural language → grammar (15) → request-handler (9) → spec → architect → forge → hot-load. When escalation hits level 3.5, opens failing module source in editor with VM snapshot as rollback. TV shell gets Emerge IDE channel showing live source of whichever module gap-loop is currently targeting.',
    },

    // ── TIER 8: Depends on Phase 15 + 16 + 28 ────────────────────────────────

    'Phase 29': {
      name: 'Topology View — Live System Graph',
      status: 'pending',
      deps: ['Phase 15', 'Phase 16', 'Phase 28', 'orchestrator/sse', 'gap-loop'],
      // §3.1: grammar + component pipeline must exist before topology can represent them
      summary: 'The entire NEXUS system as a live directed graph. Nodes = modules (color encodes sigma: green→amber→red; size = event volume). Edges = bus event flows (thickness = frequency; animation = direction + rate). Snapshot dots on timeline below graph. Clicking a node: opens that system\'s TV shell channel. Clicking an edge: shows last 20 events with seam_ts. Gap-loop focal points: pulsing highlighted nodes. Updates from orchestrator SSE — no polling. The topology view is a separate meta-view above the TV shell, not a channel within it.',
    },

    // ── TIER 9: Depends on Phase 27 + 29 (VM + Topology) ────────────────────

    'Phase 30': {
      name: 'Time-Travel Debugging — Checkpoint Ring + Fork',
      status: 'pending',
      deps: ['Phase 27', 'Phase 29', 'replay-engine', 'divergence-watcher'],
      // §3.1: VM (27) and topology (29) must exist — time travel needs both
      // §1.1: every fork gets a UUID + causedBy the checkpoint it branched from
      summary: 'Checkpoint ring: lightweight VM checkpoint every 10min. On divergence: full-fidelity checkpoint forced (+ blackbox + macro). Rewind timeline distinguishes checkpoint types by color. Fork a timeline: select checkpoint → "Fork from here" → second runtime spins up on alternate ports (9001, 3749, 7821...) — original keeps running. Diff two runtimes live in topology view (Phase 29). Time-travel debugging: jump to 5min before divergence, replay forward deterministically (replay-engine + VM state = exact reconstruction), inject synthetic events to test counterfactuals. SEAM as time machine: seam_ts annotated on checkpoints → "show me system when this SEAM job dispatched" → jump.',
    },

  },

  meta: {
    layer:           '1.2.0',   // meta/index.js
    'topo-kernel':   '1.0.0',   // 8-gate SNR pipeline
    'telemetry-codec':'1.0.0',  // SlopeEngine + DriftEngine + Runtime
    'liminal':       '1.0.0',   // 12 gap detectors
    'alk-perception':'1.0.0',   // composite behavioral state classifier
    'spatial':       '1.0.0',   // sigma + lattice
    'bda':           '1.0.0',   // Behavioral Drift Analyzer
  },

  // ── Userscripts (Tampermonkey) ───────────────────────────────────────────────
  // These are deployed artifacts — version tracked separately from the platform.
  // Bump when the userscript's interface or behaviour changes.
  userscripts: {
    claude:     '10.1.0',  // added: NEXUS tab (memory + RAID + self-heal hooks)
    chatgpt:    '9.1.0',   // added: compact NEXUS tab
    gemini:     '1.0.0',   // initial — NCP + NEXUS widget
    perplexity: '1.0.0',   // initial — NCP + citation extraction + NEXUS widget
    ollama:     '1.0.0',   // NCP fallback via GM_xmlhttpRequest
  },

  // ── Changelog (last 5 entries) ───────────────────────────────────────────────
  changelog: [
    { version:'0.9.10', date:'2026-07-04', summary:"Version registry itself was out of date — five real, running sovereign systems (eravos, ollama-bridge, copilot, clear-glass, loom) were never added to services despite this file's own header calling itself the single source of truth. Added all five, with real version numbers matching each system's own internal VERSION constant (checked, not guessed). Same session also closed the actual bugs this registry update reflects: Bridge's request-type whitelist was missing copilot.prompt/build/diagnose/health, guardian.command/fetch, and ollama.generate — every Clear Glass -> Bridge dispatch for those targets had been silently rejected as \"unknown type\" since whenever CoPilotBridge was built (bridge 3.0.0 -> 3.1.0). copilot had no /bridge/deliver handler at all, so Bridge's forwarded requests 400'd with no route match (copilot 3.0.0 -> 3.1.0). loom (phases 121-157) was a library with no server.js, no port, no orchestrator handshake — given all three, plus a real GET /contract route; the orchestrator's separate CONTRACT_PATHS lookup table didn't know about it either and 404'd every poll until fixed alongside (loom -> first registry appearance at 1.0.0). guardian's grammar-fallback.js and orchestrator's mutation-contract.js/spec-drift.js/contract-poller.js all had relative require() paths left stale from an earlier restructuring pass that moved their targets into shared lib/ without updating the paths that pointed at them — guardian was crash-looping on every boot from this until fixed (guardian 3.6.1 -> 3.6.2, grammar-fallback 1.0.0 -> 1.0.1, mutation-contract 1.0.0 -> 1.0.1, spec-drift 1.1.0 -> 1.1.1). orchestrator's root route now serves ui/tv-shell as the actual homepage instead of the plain orchestrator status page, per an explicit repeated request (orchestrator 2.0.0 -> 2.1.0). Two separate copies of the same 'always mint a new window agentId, never check for one already open' bug were found and fixed in Clear Glass — one in the HTTP /open handler, a second, independent one in the orchestrator-SSE clear-glass.open listener that the first fix never touched, which was the actual source of repeated ERR_ABORTED navigation errors well after boot. System version was itself drifted (0.9.8 here, 0.9.9 in package.json, changelog last entry 0.9.2) — package.json updated to match this file, six versions of undocumented movement between them not reconstructed after the fact since guessing at what changed would be worse than leaving the gap visible." },
    { version:'0.9.2', date:'2026-06-20', summary:"Phase 31 COMPLETE \u2014 Grammar \u2194 Intent pre-classification. See roadmap['Phase 31'].built for full detail; short version: grammar-engine.resolve() gained a real confidence score (was always binary match/no-match before), request-handler.js's Phase B1 no longer lets a low-confidence partial grammar match bypass the classifier/RAID and execute directly (gated at >0.8), and reflection.js's existing Phase-11 streak mechanism now tracks misfires per grammarComponentId \u2014 which required fixing a real silent field-drop in replay-engine.js's logDecision() along the way, found while wiring the new field through. Also touched, same session: seam-component-registry-spec.md \u00a79.5 Mutation Contract (lib/mutation-contract.js) \u2014 implemented only the unblocked piece; comp_type revalidation/drift and the seam/compartment layer remain unbuilt since 5 of the spec's own 7 unresolved decisions block them. 626/627 full module suite (1 pre-existing unrelated failure, same one since before this session started)." },
    { version:'0.9.1', date:'2026-06-20', summary:"Mutation Contract layer shipped \u2014 seam-component-registry-spec.md \u00a79.5, implemented (only) because it's the one part of that spec explicitly unblocked by open decisions; \u00a72/\u00a76's comp_type revalidation + drift engine and \u00a74's seam/compartment layer remain unbuilt \u2014 5 of the spec's own 7 unresolved decisions (\u00a79) block them, and guessing at thresholds/reaction-mode/multi-role semantics would risk the exact state-rot the spec warns about. Wire vocabulary (comp_id, comp_properties, event_type, issued_via) matches the spec's YAML/JSON literally; mapped explicitly (not silently) onto the live registry's actual field names (id, comp_types) since those don't match the spec's flat comp_id/comp_type/comp_lineage model and renaming live fields would break every existing caller. New lib/mutation-contract.js: forbidden identity fields (id/uuid/namespace/comp_types/registeredAt) hard-rejected before any write; comp_properties.* is the only mutable door, defaulted to {} on every component via component-registry.js's coercion step. Audit-first ordering: the \u00a79.5 ledger event is written before the property change commits, not after \u2014 an earlier draft of this module committed the property first and only discovered a missing init() afterward, which would have needed a second write to actually roll back; caught and fixed before shipping, not after. \u00a79 item 6 (requires_audit/emits_event hardcoded vs configurable) defaulted to hardcoded true, matching the spec's own YAML example literally \u2014 flagged as a default, not assumed silently. New PATCH /api/components/:id/properties route on orchestrator, separate from the existing PUT (different contract, different failure semantics \u2014 conflating them would blur the boundary \u00a79.5 exists to draw). 11/11 new tests (test-mutation-contract.js, including one that caught the audit-ledger-row-count bug above and one that proves the uninitialized-module guard fires by actually clearing the require cache, not by reading the source). 619/620 full module suite (1 pre-existing unrelated failure)." },
    { version:'0.9.0', date:'2026-06-20', summary:"Phase 15 COMPLETE — Grammar Engine wiring, correcting a roadmap that said \"pending\" while 2 of 4 wiring points were already real (request-handler Phase B fallback, nexus-cli.js resolve()) and a 3rd (component-registry grammar signatures) was enforced but uncredited. The 2 actually missing: nexus-repl.js called loadGrammar()/_grammar in three places with neither ever defined — ReferenceError on describe/caps, silently swallowed; fixed using the same fetch-once pattern nexus-cli.js already proved, plus two latent references to a non-existent status().commandCount field (engine only returns componentCount, confirmed against grammar-engine's own test suite before changing it). Guardian /cli/exec's default case had zero grammar involvement; new lib/grammar-fallback.js is the single shared resolver (not duplicated inline, §5.7) wiring ge.resolve()+component-registry.get() into it — reports the resolved component and declared route, explicitly does NOT invoke it (no caller anywhere in this codebase dereferences component.route into a real call yet; that's Phase 40). 6/6 new tests (test-grammar-fallback.js, including one that genuinely failed on first run — compReg.register() needs init(jaaDB) first, caught by the test rather than assumed). 608/609 full module suite (1 pre-existing unrelated failure, confirmed present on the untouched base before this pass). Also corrected: an uploaded roadmap snapshot (separate from this file) had Phase 11 (Reflection Engine) marked pending despite lib/reflection.js being real, tested 19/19, and shipped in changelog 0.7.6 — not rebuilt; the stale doc was the bug, not the code (§6.1)." },
    { version:'0.8.2', date:'2026-06-19', summary:'Phase 13 COMPLETE — Autonomous Loop, real implementation. Architecture decision asked and answered before writing code: every step is a gap, full reuse of gap-loop\'s existing level0-4 ladder (confirmed real — CAPABILITY gaps already route through RAID->Ollama->self-heal->forge before this pass touched anything). lib/autonomous-loop.js: startRun() chains intent-classifier.classify() (already special-cased this module by runId alone) -> case-library.query() -> compartment-engine.spawn() -> an executor that inserts a gap and polls for its terminal state. Found and fixed, in scope only, a real pre-existing bug: createLoop() defaults to status:\'open\', gap-loop._tick() only polls status:\'pending\' — every CONSTITUTIONAL gap from 4 already-shipped phases has been silently un-pickupable since they were built; fixed at this module\'s insert site only, the shared default and other 4 callers deliberately left alone (a system-wide fix is a separate decision, not assumed here). Sigma halt/rewind is real but checks a table (sigma_records) with zero writers anywhere in this codebase — confirmed by grep, not assumed; logs a degraded-monitoring warning once per run rather than treating no-signal as unsafe. exit_condition supports steps/stable/manual for real; the spec\'s own "health score stable" example has no metric source anywhere in this codebase and is not faked. Caught and fixed a real field-name bug during testing: _exitConditionMet\'s stable-check referenced a field (compartmentStatus) that doesn\'t exist on the summary objects run.steps actually stores (status) — silently always false before the test suite caught it. No CLI/API trigger built — scoped out, not guessed at. New JAA table: autonomous_runs (long). 21 new tests. This was the deepest dependency chain built this project: Phase 10/11/12/25/46 all real and load-bearing here for the first time as one live loop.' },
    { version:'0.8.1', date:'2026-06-19', summary:'Phase 46 COMPLETE — Queryable Case Library, real implementation, correcting the same false-complete phase-map status Phase 25/26 were caught in. lib/case-library.js: indexCompartment() registered as a 4th compartment-engine extension slot (caseLibraryIndex), fires on PASS only. query(intent) is L1 deterministic (domain+verb exact match), confidence read from crystal-lattice lattice_edges.success_rate via newly-exported _edgeKey() (no duplicated string format), negative-crystal check first (overrides tiering), honest skeleton-downgrade when a high-confidence signature has no surviving trace, cold tier distinguishes confidence:null ("never seen") from a real low success_rate ("seen and fails"). Bounded index (20/signature default), soft-evicted via jaa.update(_evicted:true) -- no delete() on JaaDB, same pattern as lattice-edge pruning. New JAA table: case_index (long). 14 new tests, 1 existing compartment-engine.test.js assertion updated for the new CASE_LIBRARY_INDEX trace step. Boot: added to the Phase 10/11/12/25 wiring-check SOFT phase. This was the last unmet hard dependency for Phase 13 (Autonomous Loop) -- 10/11/12/25/46/gap-loop/ollama/snapshot are now all real and complete. Phase 13 itself remains pending: nothing in this codebase calls compartment-engine.spawn() outside its own test file, and Phase 13 is the loop that has to become that first live caller (intent-classifier -> case-library.query() -> spawn(workingMemorySeed)). docs/case-library.spec did not exist before this pass; created.' },
    { version:'0.8.0', date:'2026-06-18', summary:'Phase 25 COMPLETE (all 5 sub-steps) — RAID Compartment Engine actually built for the first time, correcting a phase-map status that had been wrong since before this codebase was inspected (Phase 25/26/46 all marked complete with nothing behind any of them). Sub-step 4: lib/adversary-suite.js — 6 real attack classes (syntax/logic/edge-case/state/cross-domain/stress, intensity-scaled by risk_level) + QA/QC layer, none of them theater; state class is the literal frame_violation source routing to DELETE. compartment-engine.js execute()/resolve() now threads the executor through so stress can actually re-invoke it. Sub-step 5: lib/crystal-lattice.js — pattern-frequency crystallization (CREATE_CRYSTAL/CREATE_NEGATIVE_CRYSTAL) into the existing crystals table (coexists with liminal-space -- a different schema), lattice edges (one per domain/verb, aggregate not outcome-split — a real bug caught by its own tests and fixed before completion), scheduled decay with floor pruning. Both auto-register into compartment-engine on first spawn(). Two real bugs found and fixed by the test suites themselves during this build: a pattern-counter test-isolation gap (same class of bug already fixed once in reflection.js, missed here until caught) and a lattice edge-identity design flaw that made success_rate trivially 1.0/0.0 by construction. 101 new tests across 4 files, 428/428 full module suite, 37/37 pipeline. Boot: compartment-engine added to wiring-check, crystal-lattice added to organs (real decay-tick loop).' },
    { version:'0.7.9', date:'2026-06-18', summary:'Phase 25 (sub-steps 1-2 of 5): RAID Compartment Engine — actually building this phase for the first time. It was marked complete in nexus-phase-map.md with zero implementation anywhere in the codebase (confirmed: no constraint_frame, no adversary suite, no crystal/lattice, no compartment object model — same for Phase 26 and Phase 46, also marked complete with nothing behind them). Sub-step 1: cortex/snapshot/index.js gained cortex_state_hash + prev_snapshot_hash on every snapshot (tamper-evident chain), verifySnapshotIntegrity() + checkChainIntegrity(). Side effect: fixed a stale pipeline test asserting the old hardcoded format string — pipeline suite is 37/37 for the first time this entire build (was a standing 36/37 since before any of these phases started). Sub-step 2: lib/compartment-engine.js — full COMPARTMENT lifecycle (spawn/execute/resolve, PASS/FAIL-REWOUND/DELETE), constraint frame frozen at spawn, honestly null for fields with no real source yet (max_resolution_level: Phase 44 does not exist) rather than fabricated. Adversary/QA/crystal-lattice wired as named extension points with honest ran:false defaults, ready for sub-steps 4-5. New JAA table: compartments. 33 new tests, 377/377 full module suite. Phase 13 deps corrected to include Phase 25 + 46 (previously silently omitted from this file despite the phase-map stating them).' },
    { version:'0.7.8', date:'2026-06-17', summary:'Phase 12: user-model.js built — hypothesis store, never a profile. observe()/reinforce a claim, evidence_count + confidence (capped 1, floored 0.05), never reset to fact. deriveFromChatLog() reads existing chat_log evidence (provider, ts gaps, contentLength, bdaSignals) into preference/pace/communication_style hypotheses. Decay is view-time only (effectiveConfidence()) — stored value never mutated by time. checkContradictions() flags same-category conflicts above threshold, opens CONFLICT gap, never auto-resolves. Wired into request-handler.js Phase B3.5 as ctx.userModelContext for the execution callback. New JAA table: user_model_hypotheses (long). No outbound calls anywhere in the file. Boot: added to the Phase 10/11 wiring-check SOFT phase in cortex/boot.js (no loop of its own). Unlocks Phase 13 (Autonomous Loop) — all of its deps (10, 11, 12) now satisfied; still needs Phase 25 + Phase 46.' },
    { version:'0.7.7', date:'2026-06-17', summary:'Integration: Phase 10 + 11 wired into cortex/boot.js. reflection.js added to the organs array (has its own polling loop via init({jaaDB,pollMs}), starts alongside gap-finder/healer/gap-loop/raid/heartbeat). constitutional-ai.js has no background loop by design — it is a synchronous library request-handler.js already requires lazily on first use — so it is not an organ; instead, a new SOFT boot phase (constitutional.reflection.wiring) calls validateWiring() on both modules once at boot and logs cortex.constitutional_ai.wiring / cortex.reflection.wiring to event_log, surfacing a broken require at boot time instead of silently degrading the first real request. No lib/ source changes this pass — boot.js only.' },
    { version:'0.7.6', date:'2026-06-17', summary:'Phase 11: reflection.js built — scores every decision_log row (satisfaction 0-1, deterministic, UNRESOLVED honest-uncertainty not failure) via the decisionLogUuid request-handler now exposes from _phaseC. 3-streak of low-satisfaction decisions in the same class → KNOWLEDGE or CAPABILITY gap. RAID feedback: read-only aggregation of existing user.satisfied events by cluster:agent — no RAID-internal change. Identity-evidence accumulator gates at N items then opens a CONSTITUTIONAL gap proposing a kernel change; never writes constitutional-ai.js directly. BDA: new kernel.observeSignal() entrypoint + "reflection" as a third tracked role, ledger-replay-safe, excluded from composite. Unlocks Phase 12 (User Model), 13 (Autonomous Loop).' },
    { version:'0.7.5', date:'2026-06-17', summary:'Phase 10: constitutional-ai.js built — formalises USER_AUTONOMY, REVERSIBILITY, TRUTH_OVER_COHERENCE, EXPLAINABILITY as typed axioms with check(req,ctx)→{pass,reason,axiom,severity,blast_radius,cost,alternatives}. Goal graph: misaligned intent → HELD (not DENIED), opens a CONSTITUTIONAL loop via open-loop-taxonomy.createLoop(). Identity kernel: frozen self-model, no write path yet — reserved for Phase 11 only, after N confirmed evidence items, via gap system. request-handler.js Phase A3+A4 collapsed into one call to constitutionalAI.check(); inline fallback preserved if module unreachable (§1.2). New JAA table: constitution_decisions (long tier) — every axiom check, pass or fail, logged. Unlocks Phase 11 (Reflection Engine), 12 (User Model), 13 (Autonomous Loop).' },
    { version:'0.7.1', date:'2026-06-17', summary:'Bug fixes: emerge Bus.onAny added (emerge-ide SSE push now works), idearium/core/index.js re-export stub restored (idearium boots again). Named stale_module gaps: gap-finder now encodes module name+port+staleSec+typed-severity into every gap; escalation logs show [moduleName:port] not just fault class. NEX-SNAP format → v1.1 with system_state/blackbox_pre/blackbox_post/macro/resume fields. Divergence watcher: sigma>=0.65 or spike+0.20 triggers auto-snapshot with 90s cooldown, 10min blackbox capture + 30s post-capture, async macro compilation via intelligence pattern engine. Phases 18-21 added to roadmap: VM suspend/resume, build from inside, meta command surface, time-travel debugging.' },
    { version:'0.7.0', date:'2026-06-16', summary:'Phase 9: request-handler (constitutional choke point) — Phase A (intent→goal→constitution→cost→ALLOW/DEFER/DENY/CLARIFY/HELD/UNRESOLVED), Phase B (grammar→SNR→memory→RAID), Phase C (reflect: decision+reason+outcome), Phase D (learn: memory update→gap registration→RAID weight feedback). POST /api/request wired. USER_AUTONOMY, REVERSIBILITY, TRUTH_OVER_COHERENCE, EXPLAINABILITY axioms enforced.' },
    { version:'0.6.4', date:'2026-06-16', summary:'Phase 8.6 complete: replay engine 16/16 tests, universal boot snapshot wired into orchestrator, self-heal logs decisions to replay engine, diagnose checks snapshot+replay health. New: open-loop-taxonomy (10 types), loop-topology (focal point detection, leverage scoring), gap-loop (continuous RAID-routed resolution). Guardian fixes: SISOStream hoisted, gap dedup terminal states, escalation log table, level0 query, level1 restart+probe, level3.5 agent consult. TV shell UI with bottom menu, rewind timeline (sigma-colored, delta-positioned). 23,705 dead lines removed.' },
    { version:'0.5.0', date:'2026-06-15', summary:'Meta layer (6 modules: topo-kernel/telemetry-codec/liminal/alk/spatial/bda), vector memory (SNR-gated semantic search), chat logger + context reinjection, diagnostic engines (12 methods), escalation ladder (5 levels, friction ledger), RAID expansion (9 clusters, 5 providers via NCP), 4 userscripts with NEXUS tab (memory/RAID/self-heal hooks), seamDispatch (qwen2.5-coder primary), chat-log + failure-modes + friction JAA tables' },
    { version:'0.4.0-pre', date:'2026-06-14', summary:'Builder UI (4 modes: drop/spec/canvas/repo), spec-compiler integration, contract handshake retry, intelligence human-readable patterns, allOpenGaps fix, ledgerDir fix, heartbeat API pulse tier, BDA + ErosmancerOS staged' },
    { version:'0.3.0', date:'2026-06-13', summary:'SEAM pipeline, GapHunter, self-heal organs, heartbeat v2, auth RSA layer, peer relay, remote client, snapshot system, bridge circuit breaker' },
    { version:'0.2.0', date:'2026-06-12', summary:'Cortex memory tiers, intelligence core, replay engine, CFR field, boot sequence, contract system' },
    { version:'0.1.0', date:'2026-06-11', summary:'Initial: orchestrator, bridge, cortex, guardian, idearium, architect, emerge services online' },
  ],
};

// Convenience: get a module version by name (searches all categories)
VERSION.get = function(name) {
  return VERSION.modules[name]
    || VERSION.services[name]
    || VERSION.meta[name]
    || VERSION.userscripts[name]
    || null;
};

// Convenience: full version string for logging
VERSION.toString = function() {
  return `NEXUS v${VERSION.system} — ${Object.keys(VERSION.services).length} services · ${Object.keys(VERSION.modules).length} modules · ${Object.keys(VERSION.meta).length} meta`;
};

module.exports = VERSION;
