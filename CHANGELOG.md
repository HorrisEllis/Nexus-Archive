# NEXUS Changelog

## 2026-07-11 (2) — idea↔spec-engine phase linkage ("can't change the phase" root cause)

- **idearium** — spec bumped v3.1.0 → v3.2.0. `createSpec` accepts
  `ideaUuid`, stores it on the manifest (was read by `_promoteSpecToRepo`,
  never written anywhere). `speceng.create` links `idea.linkedSpec` and
  auto-advances `idea.phase` (seed/expanding/tensioned → specced).
  `spec.promote` auto-advances the idea to `complete` (full build) or
  `building` (partial) — caught and fixed a mid-implementation bug where
  this nearly used RepoLayer's own synthetic tracking idea instead of the
  real originating one. Root cause of the reported "can't change the
  phase": the manual phase buttons always worked; the automatic
  seed→specced→building→complete transition was simply never wired.
- **idearium/spec-engine** (VERSION) — 1.2.0 → 1.3.0.
- **idearium/repo** (RepoLayer) — addendum noting the ideaUuid vs
  originIdeaUuid distinction for future readers of `_promoteSpecToRepo`.
- **idearium UI** — `createSpecForIdea()` now opens the multi-template
  modal instead of the template-less legacy path; the modal now actually
  sends `ideaUuid` (previously captured on open, dropped before the
  POST). Spec Library's builder view branches on spec-engine vs legacy
  specs — spec-engine specs get a real chunk-status list and a "build
  repository (end-state)" button that loops build calls to completion
  and auto-promotes, instead of silently hitting legacy-only endpoints.
- Verified live end to end: idea → linked spec (phase auto→specced) →
  8/10 chunks built (2 failed, no live LLM agent in test sandbox) →
  emerge-mode promote correctly refused → manual-mode promote succeeded
  → idea phase advanced to `building` (correctly not `complete`).

## 2026-07-11 — idearium multi-template + repo file CRUD, tv-ui channels, Clear Glass UI decomposition

- **idearium** — spec bumped v3.0.0 → v3.1.0. Multi-template spec composition
  (`createSpec` takes `templateIds[]`, seeded sections merge across every
  selected template). `buildEngine` selector (auto|warp|direct) — 'warp'
  fails loud instead of silently falling back when the cache isn't loaded.
  RepoLayer materializes real files to disk on promote instead of tracking
  path+bytes metadata only. Repo file CRUD (`GET/POST/DELETE
  /api/repos/:uuid/file`) — read, edit, add, soft-delete. Verified live
  end to end against a running server.
- **idearium-templates** — v1.0.0 → v1.1.0. Five new templates
  (architecture, schemas, checklists, axioms, compartments) alongside the
  original four kind-templates + genesis, each seeding a different subset
  of spec sections deterministically via `## SECTION: <id>` markers.
- **idearium/repo** (RepoLayer) — v1.1.0. `readFile`/`writeFile`/
  `deleteFile` added; `ingest()` materializes real files under
  `data/repos/<uuid>/` whenever it has content to write.
- **ui/home/shell.js + nexus-home.html** — new. `shell.js` existed with
  exactly one channel registered and no HTML page ever loaded it. Now
  registers all 11 channels (see ui/home/DECOMP.md's addendum for the
  full list and what was fixed to make them actually load without
  throwing — CH_META/curCh/B exposure, nerve.js's canvas requirement,
  spotlight.js's never-called `CP.init()`).
- **ui/channels/*** — new. 10 sovereign channel documents extracted for
  real out of `ui/home/index.html`'s 2788-line monolith, plus the missing
  HTML host for the pre-existing `build/build.js`.
- **clear-glass** — v3.1.0 → v3.2.0. `renderer/browser.html`'s ~1600-line
  inline `<script>` extracted to `browser.js` (1879 → 275 lines). CSP's
  `script-src` no longer needs `'unsafe-inline'` with no inline JS left.
  Full test suite (46 tests, bus + watchdog) re-verified passing after.

## 2026-06-27 — auto-generated from spec version bumps

- **nexus-improvement-roadmap** — new spec, v1.0.0. All 30 improvements from the combined what-if loop (two rounds,

## 2026-06-27 — auto-generated from spec version bumps

- **cfr-contract-wire** — new spec, v1.0.0. CFR tracks contracts through wires, hook to hook.
- **contract-queue** — new spec, v1.0.0. Every request between systems is a contract.
- **copilot-expansion** — new spec, v1.0.0. Everything NEXUS can do, co-pilot can access.
- **cortex-dual-cognition** — new spec, v1.0.0. Cortex is the brain. Intelligence is the nervous system.
- **ollama** — new spec, v1.0.0. Sovereign Ollama bridge. Local model dispatch, isolated from Guardian.
- **ui-location** — new spec, v1.0.0. Defines where each system's UI lives, who serves it, and

## 2026-06-27 — auto-generated from spec version bumps

- **alk-perception** — new spec, v1.0.0. Composite behavioral state classifier. Maps NEXUS telemetry to: COGNITIVE_LOAD, GENUINE_FLOW, CONCEALMENT, STRESS_ACUTE, SOCIAL_MASK, GENUINE_ENGAGEMENT. path: lib/meta/alk-perception/index.js
- **api-dispatch** — new spec, v1.0.0. Direct REST API dispatch for guardian. Complements NCP browser tabs.
- **architect** — new spec, v2.0.0. Spec builder, architecture viewer, and template library.
- **auth** — new spec, v1.0.0. First-principles authentication layer.
- **autonomous-loop** — new spec, v1.0.0. Ollama as the orchestrator brain. Not a tool called by orchestrator —
- **bda** — new spec, v1.0.0. Behavioral Drift Analyzer. 5-signal extraction per text: valence, certainty, openness, tension, selfref. Pendulum engine. Gap detector (12 named patterns). Hash-linked append-only observation ledger. path: lib/meta/bda/index.js
- **behavioral-boundary** — new spec, v1.0.0. Behavioral Boundary Organ. Enforces the line between the
- **blueprint** — new spec, v1.1.0. Declarative compartment/module definitions. Blueprint loader reads
- **bridge** — new spec, v3.0.0. The trust relay. Every request between systems passes through Bridge.
- **builder** — new spec, v1.0.0. NEXUS Builder UI. Four modes: Drop (auto-route by file extension), Spec (editor with compile→dispatch), Canvas (drag-drop node canvas, five chip types), Repo (Idearium project grid). BUILD NOW → spec-compiler → queue → Idearium.
- **case-library** — new spec, v1.0.0. Queryable index of every PASS compartment trace, keyed by intent
- **cfr** — new spec, v1.0.0. Causal field/graph. Derives relationship edges passively from
- **chat-logger** — new spec, v1.0.0. Every AI exchange logged to disk (JSONL), JAA (chat_log), and vector index. Context reinjection: buildInjectionContext() returns semantically relevant past exchanges. BDA signal extraction and Liminal gap scoring on every message.
- **cli-reasoning** — new spec, v1.0.0. Qwen 0.5b as the CLI reasoning layer.
- **cli** — new spec, v1.4.0. Command-line tools for NEXUS operation, diagnosis, and boot.
- **component-registry** — new spec, v1.0.0. The Component Registry makes NEXUS self-describing.
- **constitutional-ai** — new spec, v1.0.0. Phase A of the request handler. Should we act?
- **context-builder** — new spec, v1.0.0. Builds system prompt context for Ollama/forge calls. Standard: last N JAA events. Semantic: buildSemanticContext() uses vector-memory for meaning-based retrieval. Signal over recency.
- **contracts** — new spec, v1.0.0. Interaction contracts for every NEXUS system.
- **copilot** — new spec, v2.0.0. The primary entry point to NEXUS. Every user interaction goes through here.
- **cortex** — new spec, v3.0.0. The memory and brain of NEXUS. Everything that needs to be
- **compartment-os** — new spec, v1.5.0. Compartment OS (COS). An earlier sovereign OS prototype.
- **diagnostic-engines** — new spec, v1.0.0. 12 cross-domain diagnostic methods. Causal chain tracer, invariant scanner, circuit breaker inspector, temporal gap analyzer, cascade failure predictor, entropy rate monitor, SNR noise floor detector, memory pressure estimator, behavioral fingerprinter, fault tree evaluator, homeostasis scorer, cross-system correlation matrix.
- **diagnostic-fixes** — new spec, v1.0.0. Documents all boot-time and diagnostic bugs fixed in this session.
- **diagnostic-phase-map** — new spec, v1.0.0. The active remediation engine for NEXUS. Detects problems, attempts fixes,
- **diagnostic** — new spec, v1.0.0. Standalone diagnostic service. Watches all system ledgers via fs.watch. Computes friction, sigma, slope, tension per system. Exposes the 12-engine suite on demand.
- **emerge** — new spec, v1.0.0. DSL runtime. Reads .eg / .emerge files — a purpose-built declarative language. Tokenizer, parser, SNR gate, emitter. 569 keywords, 7 axioms. Ollama for codegen. IDE serves at :4242.
- **erosmancer-os** — new spec, v1.0.0. ErosmancerOS — TypeScript CDP browser automation platform.
- **escalation** — new spec, v1.0.0. The friction ledger and escalation logic. Every failed attempt adds friction to the fault class (0.10/0.20/0.35/0.50 per level). Friction persists in fault_taxonomy across sessions. At 1.0 → failure mode, no more auto-attempts.
- **forge** — new spec, v1.0.0. AI-assisted patch pipeline. forgePatch(), forgeGate(), forgeScaffold(), seamDispatch(). Model cascade: SEAM uses qwen2.5-coder:1.5b → mistral:7b-instruct-q4_K_M. Context injection from chat-logger before dispatch. Three-axis gate detector on output.
- **gap-lifecycle** — new spec, v1.0.0. A gap is an open loop. It stays open until the system produces a tangible
- **grammar-engine** — new spec, v1.3.0. Reads component registry grammar tree. Builds trie for O(k)
- **guardian-user-understanding** — new spec, v1.0.0. Guardian understanding the user better over time.
- **guardian** — new spec, v3.6.0. The AI engine of NEXUS. Guardian is the only system that touches
- **healer** — new spec, v1.0.0. Prescribes fixes for open gaps. Engine-informed: reads circuit breaker state, fault tree, homeostasis score, cascade risk before choosing strategy. Routes to safe fix or escalation based on engine evidence.
- **heartbeat** — new spec, v2.0.0. Three-tier health monitoring. Tier 1: health probe every 10s. Tier 2: API pulse every 30s. Tier 3: telemetry frame every 60s fed through meta layer (ALK, BDA, sigma, telemetry-codec). ServiceDriftEngine on tier 3.
- **home-ui** — new spec, v1.3.0. The NEXUS home screen. Sovereign OS overview surface.
- **hooks** — new spec, v1.0.0. The NEXUS hook system. Seams where behavior can be injected
- **hot-module-loader** — new spec, v1.0.0. Drop a module in. It integrates automatically. No restart.
- **idearium** — new spec, v3.0.0. The idea manager and project repository. Every build starts here
- **intelligence-bridge** — new spec, v1.0.0. Connects the intelligence layer to RAID routing decisions.
- **intelligence** — new spec, v1.0.0. Pattern crystallisation engine. Watches Cortex event stream. Detects co_occurrence (events that always fire together), failure_precursor (events before failures), bottleneck (gaps that keep recurring). Prints human-readable on crystallise.
- **jaa-db** — new spec, v6.0.0. Persistent storage for NEXUS. Flat-file JSONL backed in-memory Map. 53 tables across three tiers: working (30min), short (6hr), long (permanent). §2.1: disk write before in-memory update. Auto-hooks vector-memory on insert.
- **lib** — new spec, v1.0.0. Shared library modules used by all NEXUS systems.
- **liminal-space** — new spec, v1.0.0. The five interstitial spaces. The boundary between memory levels.
- **liminal** — new spec, v1.0.0. 12 gap detectors: code, assumption, contrastive, structural, shadow, negative_space, relational (8 gaslighting patterns), oscillatory (pendulum math), existential, field, music, reversal. path: lib/meta/liminal/index.js
- **mcp** — new spec, v1.0.0. Phase 67 — MCP Tool Bridge.
- **meta-layer** — new spec, v1.2.0. Six intelligence modules. All lazy-loaded. No ports.
- **nexus-cli** — new spec, v1.0.0. Dynamic CLI runtime. No hardcoded commands.
- **nexus-organisms** — new spec, v1.0.0. NEXUS Organism Layer — the natural extension of the ERAVOS organism model
- **nexus-shell-ui** — new spec, v1.0.0. The layered NEXUS UI. TV channel model.
- **nexus-system-foundation** — new spec, v1.0.0. Defines the shape every NEXUS system must implement.
- **nexus** — new spec, v2.0.0. (no purpose line found — undocumented change, check the spec directly)
- **orchestrator** — new spec, v2.0.0. The root coordinator. Single focal point for every UI, CLI,
- **phase-map** — new spec, v1.0.0. Complete build phase map. Bottom up. File system first. UI last.
- **raid-snr-filter** — new spec, v1.1.0. SNR filter on RAID dispatch. Invariants first. Patterns second. AI last.
- **raid** — new spec, v6.2.0. Provider routing. Ollama always first. Claude always last. Weight table learns from outcomes. _decide() is a pure function — same inputs always produce same decision.
- **reflection-engine** — new spec, v1.0.0. Phase C of the request handler. After execution.
- **replay-engine** — new spec, v1.0.0. Full observability and replay for every system decision.
- **request-handler** — new spec, v1.0.0. The constitutional choke point. Single entry for every request.
- **seam-component-registry** — new spec, v1.1.0. Every component (kernel, engine, runtime, or file) has a stable
- **seam-queue** — new spec, v1.0.0. SEAM queue — chunked spec dispatch to a browser-tab provider.
- **seam** — new spec, v1.0.0. SEAM pipeline runner. Splits specs into chunks. T0/T1 deterministic. T2 dispatched to Ollama. Three-axis gate detector (truncation/sigma/delta). Three retry strategies on failure. Artifacts stored in JAA on success.
- **self-heal** — new spec, v1.0.0. 5-level escalation ladder wired to the healer organ and escalation engine. Subscribes to HEAL_REQUESTED. Runs level 0 (known fix) → level 1 (safe fix) → level 2 (snapshot+forge) → level 3 (deep scan) → level 4 (failure mode). Friction tracked per fault class.
- **service** — new spec, v1.0.0. Windows service integration and process management for NEXUS.
- **siso** — new spec, v1.0.0. SISO — Single Input Single Output architecture.
- **snapshot** — new spec, v1.0.0. Cortex state snapshot system. Half-life decay with priority tiers. Permanent pinning available. Snapshots taken before any T2 forge patch. Replay engine reconstructs past state from event log and detects divergence.
- **spatial** — new spec, v1.0.0. Sigma engine (entropy/slope/regime: STABLE, ACTIVATING, UNGROUNDED, DYSREGULATED, OSCILLATORY, COLLAPSING, OFFLINE) + Lattice engine (resonance-weighted associative graph). path: lib/meta/spatial/index.js
- **spec-compiler** — new spec, v1.1.0. Deterministic code emitter from .spec files.
- **spec-drift** — new spec, v1.1.0. Spec drift detector. Compares version declared in each system's
- **telemetry-codec** — new spec, v1.0.0. Four compression engines: SlopeEngine (OLS regression), StabilityEngine (CV, entropy), OscillationEngine (zero-crossings), ConfidencePropagator (cross-channel). ServiceDriftEngine (7 sub-threshold precursor signals). path: lib/meta/telemetry-codec/index.js
- **tests** — new spec, v1.0.0. The test suite. Three layers:
- **topo-kernel** — new spec, v1.0.0. 8-gate SNR pipeline. Entropy → Variance → Consistency → Fidelity → Causality → Pattern → IME → Bayesian. The primitive everything else mounts on. path: lib/meta/topo-kernel/index.js
- **ui-registry** — new spec, v1.0.0. UI session tracking. Any UI registers via POST /api/ui/register, gets sessionId. Heartbeat checked 30s, timeout 70s. Disconnect emits SSE event to all clients. Multiple UIs simultaneously.
- **ui** — new spec, v1.0.0. Browser interfaces for NEXUS. Currently 33,814 lines across 31 files —
- **user-model** — new spec, v1.0.0. Persistent model of how the user works, thinks, and communicates.
- **vector-memory** — new spec, v1.0.0. SNR-gated semantic search. nomic-embed-text via Ollama, 768-dim, vectra LocalIndex. Similarity score IS the SNR. Threshold 0.72 default. TF-IDF fallback when Ollama offline. Auto-embeds on JAA insert.

## 2026-06-25 — auto-generated from spec version bumps

- **alk-perception** — new spec, v1.0.0. Composite behavioral state classifier. Maps NEXUS telemetry to: COGNITIVE_LOAD, GENUINE_FLOW, CONCEALMENT, STRESS_ACUTE, SOCIAL_MASK, GENUINE_ENGAGEMENT. path: lib/meta/alk-perception/index.js
- **api-dispatch** — new spec, v1.0.0. Direct REST API dispatch for guardian. Complements NCP browser tabs.
- **architect** — new spec, v1.0.0. Spec builder and hook registry.
- **auth** — new spec, v1.0.0. First-principles authentication layer.
- **autonomous-loop** — new spec, v1.0.0. Ollama as the orchestrator brain. Not a tool called by orchestrator —
- **bda** — new spec, v1.0.0. Behavioral Drift Analyzer. 5-signal extraction per text: valence, certainty, openness, tension, selfref. Pendulum engine. Gap detector (12 named patterns). Hash-linked append-only observation ledger. path: lib/meta/bda/index.js
- **behavioral-boundary** — new spec, v1.0.0. Behavioral Boundary Organ. Enforces the line between the
- **blueprint** — new spec, v1.1.0. Declarative compartment/module definitions. Blueprint loader reads
- **bridge** — new spec, v3.0.0. The trust relay. Every request between systems passes through Bridge.
- **builder** — new spec, v1.0.0. NEXUS Builder UI. Four modes: Drop (auto-route by file extension), Spec (editor with compile→dispatch), Canvas (drag-drop node canvas, five chip types), Repo (Idearium project grid). BUILD NOW → spec-compiler → queue → Idearium.
- **case-library** — new spec, v1.0.0. Queryable index of every PASS compartment trace, keyed by intent
- **cfr** — new spec, v1.0.0. Causal field/graph. Derives relationship edges passively from
- **chat-logger** — new spec, v1.0.0. Every AI exchange logged to disk (JSONL), JAA (chat_log), and vector index. Context reinjection: buildInjectionContext() returns semantically relevant past exchanges. BDA signal extraction and Liminal gap scoring on every message.
- **cli-reasoning** — new spec, v1.0.0. Qwen 0.5b as the CLI reasoning layer.
- **cli** — new spec, v1.4.0. Command-line tools for NEXUS operation, diagnosis, and boot.
- **component-registry** — new spec, v1.0.0. The Component Registry makes NEXUS self-describing.
- **constitutional-ai** — new spec, v1.0.0. Phase A of the request handler. Should we act?
- **context-builder** — new spec, v1.0.0. Builds system prompt context for Ollama/forge calls. Standard: last N JAA events. Semantic: buildSemanticContext() uses vector-memory for meaning-based retrieval. Signal over recency.
- **contracts** — new spec, v1.0.0. Interaction contracts for every NEXUS system.
- **copilot** — new spec, v1.1.0. The primary entry point to NEXUS. Every user interaction — from the
- **cortex** — new spec, v3.0.0. The memory and brain of NEXUS. Everything that needs to be
- **compartment-os** — new spec, v1.5.0. Compartment OS (COS). An earlier sovereign OS prototype.
- **diagnostic-engines** — new spec, v1.0.0. 12 cross-domain diagnostic methods. Causal chain tracer, invariant scanner, circuit breaker inspector, temporal gap analyzer, cascade failure predictor, entropy rate monitor, SNR noise floor detector, memory pressure estimator, behavioral fingerprinter, fault tree evaluator, homeostasis scorer, cross-system correlation matrix.
- **diagnostic-fixes** — new spec, v1.0.0. Documents all boot-time and diagnostic bugs fixed in this session.
- **diagnostic-phase-map** — new spec, v1.0.0. The active remediation engine for NEXUS. Detects problems, attempts fixes,
- **diagnostic** — new spec, v1.0.0. Standalone diagnostic service. Watches all system ledgers via fs.watch. Computes friction, sigma, slope, tension per system. Exposes the 12-engine suite on demand.
- **emerge** — new spec, v1.0.0. DSL runtime. Reads .eg / .emerge files — a purpose-built declarative language. Tokenizer, parser, SNR gate, emitter. 569 keywords, 7 axioms. Ollama for codegen. IDE serves at :4242.
- **erosmancer-os** — new spec, v1.0.0. ErosmancerOS — TypeScript CDP browser automation platform.
- **escalation** — new spec, v1.0.0. The friction ledger and escalation logic. Every failed attempt adds friction to the fault class (0.10/0.20/0.35/0.50 per level). Friction persists in fault_taxonomy across sessions. At 1.0 → failure mode, no more auto-attempts.
- **forge** — new spec, v1.0.0. AI-assisted patch pipeline. forgePatch(), forgeGate(), forgeScaffold(), seamDispatch(). Model cascade: SEAM uses qwen2.5-coder:1.5b → mistral:7b-instruct-q4_K_M. Context injection from chat-logger before dispatch. Three-axis gate detector on output.
- **gap-lifecycle** — new spec, v1.0.0. A gap is an open loop. It stays open until the system produces a tangible
- **grammar-engine** — new spec, v1.3.0. Reads component registry grammar tree. Builds trie for O(k)
- **guardian-user-understanding** — new spec, v1.0.0. Guardian understanding the user better over time.
- **guardian** — new spec, v3.6.0. The AI engine of NEXUS. Guardian is the only system that touches
- **healer** — new spec, v1.0.0. Prescribes fixes for open gaps. Engine-informed: reads circuit breaker state, fault tree, homeostasis score, cascade risk before choosing strategy. Routes to safe fix or escalation based on engine evidence.
- **heartbeat** — new spec, v2.0.0. Three-tier health monitoring. Tier 1: health probe every 10s. Tier 2: API pulse every 30s. Tier 3: telemetry frame every 60s fed through meta layer (ALK, BDA, sigma, telemetry-codec). ServiceDriftEngine on tier 3.
- **home-ui** — new spec, v1.3.0. The NEXUS home screen. Sovereign OS overview surface.
- **hooks** — new spec, v1.0.0. The NEXUS hook system. Seams where behavior can be injected
- **hot-module-loader** — new spec, v1.0.0. Drop a module in. It integrates automatically. No restart.
- **idearium** — new spec, v3.0.0. The idea manager and project repository. Every build starts here
- **intelligence-bridge** — new spec, v1.0.0. Connects the intelligence layer to RAID routing decisions.
- **intelligence** — new spec, v1.0.0. Pattern crystallisation engine. Watches Cortex event stream. Detects co_occurrence (events that always fire together), failure_precursor (events before failures), bottleneck (gaps that keep recurring). Prints human-readable on crystallise.
- **jaa-db** — new spec, v6.0.0. Persistent storage for NEXUS. Flat-file JSONL backed in-memory Map. 53 tables across three tiers: working (30min), short (6hr), long (permanent). §2.1: disk write before in-memory update. Auto-hooks vector-memory on insert.
- **lib** — new spec, v1.0.0. Shared library modules used by all NEXUS systems.
- **liminal-space** — new spec, v1.0.0. The five interstitial spaces. The boundary between memory levels.
- **liminal** — new spec, v1.0.0. 12 gap detectors: code, assumption, contrastive, structural, shadow, negative_space, relational (8 gaslighting patterns), oscillatory (pendulum math), existential, field, music, reversal. path: lib/meta/liminal/index.js
- **meta-layer** — new spec, v1.2.0. Six intelligence modules. All lazy-loaded. No ports.
- **nexus-cli** — new spec, v1.0.0. Dynamic CLI runtime. No hardcoded commands.
- **nexus-shell-ui** — new spec, v1.0.0. The layered NEXUS UI. TV channel model.
- **nexus-system-foundation** — new spec, v1.0.0. Defines the shape every NEXUS system must implement.
- **nexus** — new spec, v2.0.0. (no purpose line found — undocumented change, check the spec directly)
- **orchestrator** — new spec, v2.0.0. The root coordinator. Single focal point for every UI, CLI,
- **phase-map** — new spec, v1.0.0. Complete build phase map. Bottom up. File system first. UI last.
- **raid-snr-filter** — new spec, v1.1.0. SNR filter on RAID dispatch. Invariants first. Patterns second. AI last.
- **raid** — new spec, v6.2.0. Provider routing. Ollama always first. Claude always last. Weight table learns from outcomes. _decide() is a pure function — same inputs always produce same decision.
- **reflection-engine** — new spec, v1.0.0. Phase C of the request handler. After execution.
- **replay-engine** — new spec, v1.0.0. Full observability and replay for every system decision.
- **request-handler** — new spec, v1.0.0. The constitutional choke point. Single entry for every request.
- **seam-component-registry** — new spec, v1.1.0. Every component (kernel, engine, runtime, or file) has a stable
- **seam-queue** — new spec, v1.0.0. SEAM queue — chunked spec dispatch to a browser-tab provider.
- **seam** — new spec, v1.0.0. SEAM pipeline runner. Splits specs into chunks. T0/T1 deterministic. T2 dispatched to Ollama. Three-axis gate detector (truncation/sigma/delta). Three retry strategies on failure. Artifacts stored in JAA on success.
- **self-heal** — new spec, v1.0.0. 5-level escalation ladder wired to the healer organ and escalation engine. Subscribes to HEAL_REQUESTED. Runs level 0 (known fix) → level 1 (safe fix) → level 2 (snapshot+forge) → level 3 (deep scan) → level 4 (failure mode). Friction tracked per fault class.
- **service** — new spec, v1.0.0. Windows service integration and process management for NEXUS.
- **siso** — new spec, v1.0.0. SISO — Single Input Single Output architecture.
- **snapshot** — new spec, v1.0.0. Cortex state snapshot system. Half-life decay with priority tiers. Permanent pinning available. Snapshots taken before any T2 forge patch. Replay engine reconstructs past state from event log and detects divergence.
- **spatial** — new spec, v1.0.0. Sigma engine (entropy/slope/regime: STABLE, ACTIVATING, UNGROUNDED, DYSREGULATED, OSCILLATORY, COLLAPSING, OFFLINE) + Lattice engine (resonance-weighted associative graph). path: lib/meta/spatial/index.js
- **spec-compiler** — new spec, v1.1.0. Deterministic code emitter from .spec files.
- **spec-drift** — new spec, v1.1.0. Spec drift detector. Compares version declared in each system's
- **telemetry-codec** — new spec, v1.0.0. Four compression engines: SlopeEngine (OLS regression), StabilityEngine (CV, entropy), OscillationEngine (zero-crossings), ConfidencePropagator (cross-channel). ServiceDriftEngine (7 sub-threshold precursor signals). path: lib/meta/telemetry-codec/index.js
- **tests** — new spec, v1.0.0. The test suite. Three layers:
- **topo-kernel** — new spec, v1.0.0. 8-gate SNR pipeline. Entropy → Variance → Consistency → Fidelity → Causality → Pattern → IME → Bayesian. The primitive everything else mounts on. path: lib/meta/topo-kernel/index.js
- **ui-registry** — new spec, v1.0.0. UI session tracking. Any UI registers via POST /api/ui/register, gets sessionId. Heartbeat checked 30s, timeout 70s. Disconnect emits SSE event to all clients. Multiple UIs simultaneously.
- **ui** — new spec, v1.0.0. Browser interfaces for NEXUS. Currently 33,814 lines across 31 files —
- **user-model** — new spec, v1.0.0. Persistent model of how the user works, thinks, and communicates.
- **vector-memory** — new spec, v1.0.0. SNR-gated semantic search. nomic-embed-text via Ollama, 768-dim, vectra LocalIndex. Similarity score IS the SNR. Threshold 0.72 default. TF-IDF fallback when Ollama offline. Auto-embeds on JAA insert.

## 2026-06-21 — auto-generated from spec version bumps

- **seam-queue** — new spec, v1.0.0. SEAM queue — chunked spec dispatch to a browser-tab provider.

## 2026-06-21 — auto-generated from spec version bumps

- **cli**: v1.3.0 → v1.4.0. Command-line tools for NEXUS operation, diagnosis, and boot.

## 2026-06-21 — auto-generated from spec version bumps

- **copilot** — new spec, v1.0.0. Full-context assistant: continuous bus listener + RAID-gated CLI tool
- **raid**: v6.1.0 → v6.2.0. Provider routing. Ollama always first. Claude always last. Weight table learns from outcomes. _decide() is a pure function — same inputs always produce same decision.

## v0.9.8 (session) — 2026-06-21

### New: living changelog mechanism
- `lib/changelog.js` — diffs `docs/*.spec` versions against a snapshot,
  prepends a dated section to this file when something real changed.
  Wired as a SOFT boot phase in `orchestrator.js`, same pattern as
  `spec-drift.js`. 5/5 tests passing. Snapshot seeded at this session's
  end state — future boots only report genuinely new changes, not a
  retroactive dump of all 72 existing specs.

### New: `.spec` container format, verified round-trip
- `nexus-system.spec` — full repo (695 files) as one self-contained file:
  YAML header (fast-parseable, same regex `spec-drift.js` already uses)
  + file-block manifest + embedded base64 archive. Verified: decoded
  archive's SHA-256 matches the source zip exactly; `unzip -t` passes.
- `scripts/import-spec.js` — real, tested CLI to extract one back into a
  directory tree. Verifies `archive_sha256` before writing anything
  (refuses partial/corrupt extraction). Round-tripped successfully
  against the actual repo.

### Fixed
- **home-ui's `asSend()` discarded RAID's real routing decision.** A
  conversational prompt with no grammar match correctly got routed by
  RAID to an agent (`{source:'raid', agent, ...}`), but the UI only
  checked for `result.componentId` (grammar match) or non-RESOLVED
  outcomes — a RAID decision satisfied neither, was silently thrown
  away, and the function re-dispatched with `provider` hardcoded to
  `'ollama'` regardless of what RAID picked. Now uses `hr.result.agent`.
- **`nexus-repl.js`'s `snapshot` command 404'd silently, every time.**
  POSTed to `cortex/api/snapshot` (singular) — cortex only serves
  `/api/snapshots/create` (plural). Fixed the URL.
- **ChatGPT console's chunk ladder showed `RETRYING`/`ESCALATED` states
  with no way to act on them.** Wired a real `FORCE RETRY` button to
  guardian's existing `/seam/retry` — only on rungs that are actually
  the queue's current active chunk (checked the endpoint's real
  constraint first; `ESCALATED` rungs get an honest note instead of a
  button that would silently 404).
- **ChatGPT console's `PASSIVE` badge didn't reflect queue state.** Now
  shows `N QUEUED` when there's real pending work for the provider,
  distinct from idle. (Note: a deeper, earlier fix for `claimed` timing
  — `ncp.updateClient()` — already exists above this entry; this is
  complementary, not a duplicate.)

### Added: real proxy routes, real registrations
- `orchestrator.js` — new `/api/diagnostic/*` proxy block. Diagnostic
  (`:7825`) had zero generic proxy before this; verified
  `POST /gaps/:uuid/fix` is real against `service/nexus-diagnostic.js`.
- `cli/nexus-repl-descriptors.js` — `forge`, `heal`, `snapshot` now
  registered into `component-registry` (was just `forge`). `heal`'s
  route has a documented limitation: path-parameter substitution doesn't
  exist anywhere in the generic dispatcher yet, so it's discoverable but
  not yet remotely dispatchable that way — `nexus-repl`'s own direct
  call still works.
- `ui/agents/chatgpt/index.html` — **IMPORT FROM IDEARIUM** button,
  real round-trip against `GET /api/idearium/specs` (list) and
  `GET /api/idearium/specs/:uuid/export` (compiled markdown — checked
  this was the right endpoint, not `.show`, before using it).

### Phase 31 — closed, not "pending" (roadmap was wrong)
- Confidence scoring, the `>0.8` threshold, and demotion-event logging
  were already built before this session touched anything — checking
  the live code first caught that before redundant work happened. The
  one real gap (case-library misfires → 3-strike Idearium escalation)
  is now `lib/grammar-misfire-tracker.js`. 6/6 tests passing.

### Phase 35 — backend built, frontend still pending
- `lib/quick-notes.js` — create/list/delete, broadcasts over the
  existing `/events` SSE (not a new channel), tag-to-idea via the
  verified `/api/idearium/ideas` proxy. 7/7 tests passing. No UI panel
  renders this yet.

### Roadmap
- Phase 65 (`cli.js: Unified User-Interaction Console`) and Phase 66
  (`.spec Container Import: Idearium Spec Library + Push/Pull CI/CD`)
  added — both requested this session, both real and scoped, neither
  built yet.

---

## v0.9.8 — 2026-06-20

### Bug Fixes

#### [CRITICAL] ChatGPT Console: badge stuck PASSIVE, SEAM chunks stall in GENERATING
**Root cause:** `client.claimed` in the NCP `_clients` map is only written via POST
`/heartbeat` (fired every 8 s). The `GUARDIAN_REGISTER` message posted immediately on
SSE connect carries `claimed: true` (after `autoClaimIfFree()` runs) but the handler
only emitted a bus event — it never wrote into the client map. So `GET /providers`
returned `claimed: false` for the first 8 s, the UI badge stayed `CONNECTED · PASSIVE`,
and any `GUARDIAN_JOB` arriving in that window was silently dropped by `handleJob()`
(`isClaimed` guard) — causing SEAM chunks to stall in GENERATING and trip watchdog retries.

**Fix:**
- `lib/ncp.js`: Added and exported `updateClient(provider, tabId, fields)` — merges
  `claimed`, `chatId`, `usage` into the live `_clients` entry without a heartbeat.
- `guardian/server.js` `GUARDIAN_REGISTER` case: Calls `ncp.updateClient()` immediately,
  so `GET /providers` reflects real claim state within the first 4 s polling cycle.

#### [HIGH] Bridge exits code 0 immediately on `npm run start:all`
**Root cause:** `package.json` `start:all` called `node bridge/server.js`, but
`bridge/server.js` is a pure factory module (`createBridgeServer()` — no self-start).
The correct entry point is `bridge/index.js`, which runs the full 7-phase boot sequence
wiring identity → registry → ledger → router → HTTP server.

**Fix:** `package.json` `start:all` and `start:core` changed from
`node bridge/server.js` → `node bridge/index.js`.

### Version Bumps
- `package.json`: `0.9.2` → `0.9.8`
- `lib/version.js system`: `0.9.2` → `0.9.8`
- `lib/version.js services.guardian`: `3.6.0` → `3.6.1`
- `lib/version.js modules['ncp']`: added at `1.1.0`
- Guardian internal version strings: `3.5.0` → `3.6.1`

---

## v0.9.9 — Phase 23.7 — Gap Lifecycle: Causal Closure
**Date:** 2026-06-24
**Operator:** James Brooks (Erosmancer)

### Core changes

**lib/gap-predicate.js** (NEW)
Predicate library, dedup key, truth floor, closure verifier, TTL sweep.
Every gap carries a checkable predicate. Closure requires predicate false AND artifact exists.
Gap dedup prevents same problem spawning multiple UUIDs.

**cortex/memory/jaa-db.js**
Added: reflection_contracts, closure_attempts, gap_predicates tables (long tier).

**lib/open-loop-taxonomy.js**
createLoop() enriches every gap with predicate, artifact_requirement, dedup_key, truth_floor, ttl_ms.

**service/nexus-diagnostic.js**
Dedup check before gap insert. Gaps marked 'investigating' on dispatch.
Sweep skips investigating/resolved/expired/blocked gaps. Kills the 300-job flood.
Predicate check before re-dispatch — if predicate is false, run closure verifier.

**cortex/gap-loop.js**
Listens for guardian.job.complete (with meta.gapUuid). Runs verifyClosure after every job.
TTL sweep every 5 minutes. Registers gap-predicate in component registry.

**guardian/server.js**
createJob() writes to JAA before dispatch (§2.1). Every state transition persisted + emitted.
job.complete carries meta.gapUuid for closure verifier. Reflection contracts polling phase (every 30s).
Human-readable log lines. RAID decision captured in job meta.

**cortex/core/raid/index.js**
Public decide() exported (was missing — caused silent chatgpt fallback on every call).
Qwen async cluster classification. Learned patterns persisted to raid-clusters.json.
_clusterReviewTick: Mistral proposes new patterns when correction rate > 40%.
getState() exposes learnedPatterns count, correctionRate.

**lib/reflection.js**
Reflection contracts queued to JAA on streak threshold. verifyClosure runs each pass.
Stale queued contracts retried. getState() exposes contract stats.

**guardian/agents/co-pilot/index.js** (v1.1)
Real system operator. Reads live state (gaps, jobs, health, providers) before every response.
Qwen classifies intent. Slash prefix → RAID-gated tool execution.
Mistral generates reply with system state as context. Honest Ollama-offline fallback.
Model priority: mistral:7b-instruct-q4_K_M → qwen2.5-coder:1.5b → fallback.

**guardian/userscript-chatgpt.js**
7-selector findResponseEl. 3-minute hard timeout. Root cause of 300-job flood fixed.

**orchestrator.js**
ui/agents/ added to hotswap watcher (was missing).

**ui/agents/mistral/index.html** (NEW)
Mistral/Ollama native console. No tab bridging. Ember accent.

**ui/home/index.html**
asSend() is now a thin shell. Everything routes through co-pilot. RAID decision shown explicitly.

### Docs added
- docs/AXIOMS-PHASE-MAP.md — every axiom mapped to every phase, compliance state
- docs/SYSTEM-MAP.md — service registry, intelligence stack, open loops table
- docs/WIRES.md — every bus event, HTTP route, JAA write, dispatch chain
- docs/SESSION-2026-06-24.md — session changelog
- docs/gap-lifecycle.spec — causal closure specification
- docs/copilot.spec — co-pilot v1.1 specification
