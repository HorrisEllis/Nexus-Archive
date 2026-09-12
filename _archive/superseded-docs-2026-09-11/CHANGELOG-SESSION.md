# NEXUS — Session Changelog (2026-08-12)
**Date:** 2026-08-12
**Session type:** CA2-CA10, gap-field unification, lifeline contracts, loom-as-hub phasemap
**By:** James Brooks + Claude

---

## Current progress

**Built, tested, committed, verified live (not just claimed):**
- CA1-CA7 full autonomous co-pilot layer (scheduler/triggers/chains/connections/
  system-control/self-building-commands/constant-autonomy), then wired into
  co-pilot's actual conversation (`copilot/lib/autonomy-router.js`) — real
  HTTP round trips proved it, not just unit tests.
- Six independent gap-writers found and unified into `lib/gap-field.js`,
  including the real diagnostic kernel and a sixth (`intent-classifier.js`)
  found while verifying "intention" was wired in.
- `copilot/lib/lifeline-contracts.js` — per-intent response validation;
  three real silent-failure paths in `lifeline.js` fixed (verified with a
  real stand-in HTTP server, not mocked).
- Autonomy-router v2 — flexible matching (7/12 -> 12/12 on real phrasing
  tests), propose-then-confirm for every state-changing action, Bayesian
  confidence in both the user-model and co-pilot's own `intent-learning.js`.
- `lib/chunk-build-orchestrator.js` + `lib/agent-build-learning.js` — tries
  every agent before giving up (per James's own correction of my first,
  wrong proposal), skips infra failures without counting them, seeded from
  `agent-router.js`'s real `DEFAULT_FALLBACK` order.
- `docs/repair-contract-and-loom-hub-phasemap.spec` — 11 phases (R0-R10),
  mapped bottom-up. **R0 and R1 are DONE and verified live**: loom's
  scanner now persists real phasemap history to cortex
  (`phasemap_history`), including a real bug caught and fixed (a phase-id
  field collision that was silently overwriting different phases' rows
  across files that reuse generic ids like P5/P6).
- A real, live audit pulled from the actual registry: 1372 components,
  1712 hooks, 1341 wires, 245 working capabilities (16 declared-dead),
  584 open gaps (471 of them dangling hooks).
- Several real bugs found and fixed along the way, not just built around:
  `gap-finder`'s stale export crash, the architect-registry stale claim,
  a false-green test runner (crashed suites were rendering ✓), `/tension`'s
  broken `cortex/healer` require (confirmed `scoreTension()` was never
  built under either name).

**Total: 27 commits this session** (`e161ac2` through `b8865b5`),
138+ tests added, all passing, full session sweep clean each time.

## What's next — R2 through R10, in dependency order

- **R2** (real snapshot/rollback) — the one genuine gap in the whole map,
  not just a disconnection. `cortex/snapshot/index.js` doesn't exist;
  a real UI panel (`ui/tv-shell/index.html`'s SYSTEM REWIND) has been
  waiting for it, honestly showing `?` instead of faking data. Idearium's
  branch bug is CONFIRMED (`idearium/index.js:713`, parentId always
  picks the most recent snapshot regardless of branch) — fix that before
  building real branching on top of it. `versionium.spec` has the real
  build order already worked out.
- **R3** (autonomous repair trigger) — wire the already-correct,
  already-built `copilot/repair-on-prompt.js` (zero production callers
  right now) to fire from a detected gap. Blocked on R2.
- **R4** (loom reads the real 15,472-row `component-ledger`) — loom has
  never once queried it.
- **R5** (the zoomable node map) — loom already has the data
  (`driver.registry.graph()`); this is a rendering pass, not a new
  source of truth. "Look at architect" is the correctness test.
- **R6** (generated documentation) — over R4+R5, not hand-written prose
  that can drift.
- **R7** (fault taxonomy reconnection) — `cortex/self-heal/fault-taxonomy.js`
  is real; `/tension`'s reference to it is broken. Small, well-diagnosed.
- **R8** (nerve + spotlight + error-capture wired together) — all three
  real, none connected to each other or to gap-field yet.
- **R9** (UI design philosophy) — genuinely absent, write it from the
  real conventions already observed.
- **R10** (relational context selection + architecture reuse) — the
  actual token-reduction mechanism: RFR2's real causal-field scoring
  and the chunker's real boundary logic, applied to what context a
  build actually needs to send. Mapped, not built, this session.

**The standing instruction, now real, not aspirational:** before building
anything next, run it through `chunk-build-orchestrator` so a cheaper
agent gets the first attempt — the system built tonight is meant to save
money starting with whatever session picks this up next.

---


**Date:** 2026-07-11
**Session type:** Idearium multi-template pipeline, repo file CRUD, tv-ui channel decomposition, Clear Glass UI decomposition
**By:** James Brooks (Erosmancer) + Claude

---

## Scope

Four threads, in the order worked:

1. **Idearium multi-template composition + WARP build-logic selector** —
   `spec-engine.createSpec` generalized from one `templateId` to
   `templateIds[]`; seeded sections compose across every selected
   template. `buildEngine: 'auto'|'warp'|'direct'` added and threaded
   through the build dispatch path. Five new templates (architecture,
   schemas, checklists, axioms, compartments) added to the registry.
2. **Idearium repo file CRUD** — `RepoLayer` went from metadata-only
   (path+bytes) to actually materializing files on disk on promote, plus
   real read/write/delete against those files, wired into the UI's repo
   panel as an editor instead of a read-only listing.
3. **tv-ui channel decomposition** — `ui/home/index.html`'s monolith had
   9 named channels (per its own `DECOMP.md`) that were never actually
   split out, and a `shell.js` that could mount channels but had exactly
   one registered and no HTML page that ever loaded it. Both fixed; see
   `ui/home/DECOMP.md`'s 2026-07-11 addendum for the full list of what
   was extracted and the four latent bugs found auditing the tv-shell
   modules (`menu.js`/`spotlight.js`/`nerve.js`) that shell.js loads.
4. **Clear Glass UI decomposition** — `renderer/browser.html`'s ~1600-line
   inline script extracted to `browser.js`; CSP tightened now that no
   inline JS remains to justify `'unsafe-inline'` on `script-src`.

## Verification

- Idearium: live-tested against a running server — idea capture, 5-template
  spec creation, 100%-deterministic build (8/10 sections seeded, 2/10
  filled by cross-spec reuse, zero agent tokens), promote, materialized
  repo, and file read/edit/add/delete all confirmed on disk.
- tv-ui channels: every extracted channel and the new shell/nerve/menu/
  spotlight wiring passes `node --check`; all resolve over a static
  HTTP server with correct absolute-path assets. Not live-tested against
  a running multi-service NEXUS stack (orchestrator/guardian/cortex/
  bridge) — that stack wasn't available in-session.
- Clear Glass: existing test suite (`npm test` — bus.test.js +
  watchdog.test.js, 46 tests total) re-run after the extraction, still
  46/46.

## Versions touched

| Component | Before | After |
|---|---|---|
| idearium.spec | 3.0.0 | 3.1.0 |
| idearium/spec-engine (VERSION const) | 1.1.0 | 1.2.0 |
| idearium-templates.spec | 1.0.0 | 1.1.0 |
| idearium/repo (RepoLayer) | unversioned | 1.1.0 |
| idearium/package.json | (no version field) | 3.1.0 |
| clear-glass/package.json | 3.1.0 | 3.2.0 |
| nexus/package.json | 0.9.10 | 0.9.11 |

---

## Test Results (End of Session)
```
630 / 630  module tests    (was 582/630 — 48 failures)
187 / 187  brutal tests    (unchanged — all passing)
138 / 138  static audit    (new — zero failures)
 30 /  34  visual audit    (4 infrastructure-dependent, not code bugs)
```

---

## Patches Delivered (in order)

### Patch 24.1 — Self-Heal Stability
**Files:** `cortex/self-heal/index.js`, `nexus-connect.js`

- `postEvent()` made fire-and-forget at 1200ms — was blocking 5s causing cortex cascade offline
- Divergence snapshots skip `_captureJAA()` (was reading 21k+ rows, blocking event loop)
- Self-heal forge decoupled from guardian — inline forge adapter calls ollama-runtime directly
- `_applyPatch(gap)` — `gap` made explicit parameter (was free variable, caused `gap is not defined` on every call)
- Forge adapter now returns `{ provider, durationMs }` correctly (was `{ model, error }` — mismatch with log line)
- All agent consoles fixed: health check now reads `r?.status === 'ok' || r?.ok === true`

---

### Patch 24.2 — Co-Pilot v2.1
**Files:** `guardian/agents/co-pilot/index.js`, `lib/copilot-context.js`, `lib/user-model.js`

**Co-pilot v2.1 — 7-layer context assembly:**
- L0 bus events, L1 telemetry, L2 provider health, L3 structural integrity (gaps/SEAM)
- L4 CFR-Ω, L5 memory/artifacts, L6 predictive intent

**New capabilities:**
- Navigation: "go to guardian" → `tuneById()` in UI + channel spotlight
- Page diagnosis: reads live state of current TV channel via channel probes
- Note-taking: "note: X" → Idearium + JAA `user_notes` table
- Grammar engine wired: resolves input through component registry trie before Qwen
- Conversation logging: every exchange written to `chat_log` JAA table
- Channel context: `POST /copilot/channel` when user switches channels
- Interaction observation: confusion detection (3 clicks same element in 10s) → user model

**UI additions (`ui/home/index.html`):**
- Spotlight system: `.copilot-spotlight` class, pulsing accent outline, auto-clears after TTL
- Tension field: `--cp-tension` on each tile driven by health state + CFR sigma
- Guided steps: numbered sequence with badges, click target to advance
- `window.NEXUS_UI_STATE`: exposes live canvas state to co-pilot
- `ch-causal`, `ch-conversations`, `ch-canvas`, `ch-emerge` channels added
- Rail buttons: ◈ Causal, ⌂ Log, ⬡ Canvas, ⚡ IDE added

---

### Patch 24.3 — Semantic Gap Fix + RCA Effector
**Files:** `cortex/self-heal/index.js`, `cortex/intelligence/index.js`

**Root cause of cortex offline loop identified and fixed:**

Semantic gap types (`obligation`, `assumption`, `logical`, `contradiction`, `evidential`, `temporal`) are detected in LLM output quality — they have no module path. Self-heal was receiving these, calling `forgePatch()` with no valid source file, failing every time, emitting `self-heal.forge_failed`, which the healer saw as cortex instability, which triggered more escalation, which opened more gaps. Closed loop. ~400 forge failures.

Fix: `SEMANTIC_GAP_TYPES` exclusion set in `_tick()`. Semantic gaps never reach forge.

**RCA Effector added to intelligence engine:**

The pattern engine was a sensor with no effector. It crystallized 364× observations of API probe failure as a precursor to forge failures — then did nothing. Added `_scanRCA()` running every 2 minutes that reads the crystallized pattern index, matches against a known causal chain library, writes structured RCA findings to `cortex_memory`, opens `rca_finding` gaps, and logs plain-English diagnosis + fix.

New route: `GET :3748/api/intelligence/rca`  
Three causal chains pre-loaded: semantic-gap-forge-loop, snapshot-IO-block, cortex-timeout-cascade.

---

### Patch 24.4 — RGB Accent Animation
**Files:** `ui/home/index.html`

- All hardcoded `#00e5ff`, `#00ff88`, `#ff3355` replaced with CSS custom properties
- `--ac` derives from animated `--ac-h` hue variable (192=cyan cycling to 240=blue-violet)
- `@property --ac-h` declared for smooth Chromium hue interpolation
- `@keyframes accent-cycle` — 8s loop, cyan ↔ blue-violet, never jarring
- `--ok:#00ff88` and `--err:#ff3355` are stable (green/red never animate)
- Spotlight animation derives from `--ac-h` — stays in sync with UI accent
- 60+ hardcoded color instances replaced, 0 raw hex values remain in stylesheet
- **Bug fix (24.4b):** Patch 24.4 created circular self-references (`--ok:var(--ok)`) — fixed to literal values, restoring green status indicators

---

### Patch 24.5 — New Channels + Grammar → Co-Pilot + ERAVOS Canvas
**Files:** `ui/home/index.html`, `guardian/agents/co-pilot/index.js`, `guardian/server.js`, `ui/eravos/` (entire copy)

**Four new TV channels:**
- `ch-causal` — force-directed CFR graph, pan/zoom/drag, node tooltips, sigma coloring
- `ch-conversations` — chat_log viewer, provider filter, expandable responses, grammar-routed badges
- `ch-canvas` — ERAVOS spatial canvas iframe
- `ch-emerge` — Emerge IDE iframe

**Grammar engine → co-pilot:**
- `_ensureGrammar()` lazy-loads and refreshes grammar tree every 5 minutes
- Grammar resolution runs before Qwen classification
- Component-matched inputs at ≥60% confidence route directly to component API path
- `fromGrammar: true` flag in conversation log when grammar routing fires

**Co-pilot reads the UI:**
- Every prompt includes `NEXUS_UI_STATE` snapshot: online/offline systems, causal graph top nodes, canvas organisms
- `uiState` passed through guardian server route → co-pilot system prompt

**Conversation logging:**
- Every co-pilot exchange written to `chat_log`: provider, intent, tool, channel, modelUsed, fromGrammar, componentId, contextLayers

**Channel probes added for new channels:** `ch-causal`, `ch-conversations`, `ch-canvas`

---

### Patch 24.6 — Co-Pilot Greeting Fix + Token-First Architecture
**Files:** `guardian/agents/co-pilot/index.js`

**Bug fix:** "hello" was triggering `[Diagnosing Overview]`.  
Cause: Qwen classify prompt listed `diagnose` as valid intent without negative examples for greetings. Qwen misfired on short inputs.

**Three-tier fix:**

1. **Tier 0 fast-path** (before Qwen): `GREETING_RE`, `CONVERSATIONAL_RE`, single-word tool names — zero Qwen tokens
2. **Tighter classify prompt**: explicit negative examples (`greetings → never diagnose`), `diagnose` only triggers on the literal word "diagnose"
3. **Token-first `_tryDataAnswer()`**: tries to answer from live APIs before calling Mistral

`_tryDataAnswer()` handles without Ollama:
- Greetings → randomized response, zero tokens
- "what are you" / "what can you do"
- Gap count queries
- System status
- CFR field state
- Pattern summaries
- Provider/NCP tab list
- Current channel state
- Recent notes
- RCA findings

Only falls through to Mistral for synthesis, novel questions, and open-ended reasoning.

---

### Patch 67 — MCP Tool Bridge (Phase 67)
**Files:** `lib/mcp-server.js` (new), `lib/mcp-stdio.js` (new), `guardian/server.js`, `orchestrator.js`, `docs/mcp.spec`, `docs/mcp-claude-desktop-config.json`, `.mcp.json`

HTTP MCP server on `:7821`. Starts automatically in Guardian's co-pilot boot phase.

**13 tools:**
| Tool | Description |
|------|-------------|
| `nexus_copilot` | Primary — ask co-pilot anything (7-layer context, zero grep) |
| `nexus_status` | Health of all services |
| `nexus_gaps` | Open gaps by severity |
| `nexus_jobs` | Recent Guardian jobs |
| `nexus_patterns` | Crystallized intelligence patterns |
| `nexus_rca` | Root cause analysis findings |
| `nexus_cfr` | CFR-Ω field state |
| `nexus_conversations` | Recent co-pilot conversation history |
| `nexus_artifacts` | Saved code artifacts |
| `nexus_ideas` | Search Idearium |
| `nexus_save_idea` | Save insight to Idearium |
| `nexus_build_organism` | Describe organism → FORGE build plan |
| `nexus_read_spec` | Read spec by name |

**`lib/mcp-stdio.js`** — stdio transport for Claude Code (no Claude Desktop required).  
**`.mcp.json`** — drop in project root, Claude Code connects via `node lib/mcp-stdio.js`.

---

### Patch 24.7 — Bug Fixes + Phase 47 + Phase 15
**Files:** `cortex/self-heal/index.js`, `cortex/intelligence/index.js`, `lib/grammar-engine.js`, `lib/cfr/sigma.js`, `lib/mcp-stdio.js`, `.mcp.json`

**Bug fixes:**
- Self-heal `provider=undefined (undefinedms)`: forge adapter now returns `{ provider: 'ollama/${model}', durationMs }` — `t0 = Date.now()` added before model loop
- `gap is not defined` in pre-apply snapshot: `_applyPatch` now takes `gap` as explicit parameter, updated call site
- CFR sigma stack walk: now skips all CFR internal frames (`cfr/sigma.js`, `cfr/ledger.js`, `cfr/field.js`, `cfr/delta.js`) to expose real upstream caller

**Phase 47 (Pattern Engine Self-Wired):**
- Crystallized precursor patterns (≥80% confidence, seen in last 5 minutes) now automatically open `pattern_precursor` gaps
- Closes the loop: pattern engine was observing failures but never acting on them

**Phase 15 (Grammar Engine Live Rebuild):**
- `watchComponents(orchestratorUrl)` — subscribes to orchestrator SSE
- On `component.registered` or `component.updated` → grammar trie rebuilds 500ms later
- `_ready` getter exposed in module exports
- Falls back to 30-second polling in Node.js environments without EventSource

---

### Phase Chain — 62 → 40 → 71 → 14 → 28 → 42 → 13
**Files:** `lib/component-registry.js`, `bridge/causal/expectation.js`, `lib/causal/anomaly.js`, `lib/hot-loader.js`, `lib/blueprint.js`, `lib/autonomous-loop.js`, `lib/descriptor-projector.js`, `lib/user-model.js` (v2), `lib/cli-map.js`, `guardian/server.js`, `lib/mcp-server.js`, `emerge/compiler/pipeline.js`, `cortex/self-heal/escalation.js`

**Phase 62 — One Registry (Decision):**
- Decision recorded in `lib/component-registry.js`: component-registry is canonical
- Seam registry = runtime session store only (not identity, not grammar)
- Grammar trie = compiled projection only (reads from registry, never writes identity)
- Unblocks phases 40, 41, 42, 43, 44, 63, 64

**Phase 40 — Component Descriptor:**
- `DESCRIPTOR_FIELDS` shape added: `blueprint_ns`, `capabilities[]`, `tier`, `resolution`, `lifecycle`, `earned_roles`
- Every `register()` call now seeds descriptor defaults
- `lib/descriptor-projector.js` (new): one descriptor → six projections (`.comp`, `.cli`, `.grammar`, `.ui`, `.config`, `.seam`, `.doc`), zero LLM
- Projections stored in JAA `component_projections` table
- Auto-projects on every registration

**Phase 71 — Causal Audit:**
- Audited existing `bridge/causal/` (schema, graph, ledger all confirmed present and correct)
- **71.1** `bridge/causal/expectation.js`: pure `reduce(state, event) => newState` SEAM state reducer — replaces scattered seam_1/seam_2 flag logic
- **71.2** `ExpectationEngine` class: `define(sessionId, expectedPath)`, `observe(sessionId, event)` — validates event sequences, fires anomaly on mismatch. Direct fix for chunk-1 stall.
- **71.3** `lib/causal/anomaly.js`: classifies mismatch signals into 6 named anomaly types with severity grading. Writes to JAA `anomaly_log`, emits on bus, opens gap for high-severity.
- **71.4** `cortex/self-heal/escalation.js`: `wireAnomalyTrigger(bus, jaaDB)` subscribes to `anomaly.detected`, routes through standard escalation ladder. §6.2 four action shapes confirmed (inject/transition/rollback/reset). Loop: 71.2 → 71.3 → 71.4 closed.

**Phase 14 — Hot Module Loader:**
- `lib/hot-loader.js`: QUARANTINE → PROVE → INTEGRATE → MONITOR lifecycle
- Syntax-validates before writing, runs invariant functions in quarantine
- §2.1 snapshot before integrate
- Monitors sigma 60s post-load, auto-rollbacks if σ > 0.70
- Route: `POST :7820/hot-load`, `GET :7820/hot-load/status`
- `nexus_hot_load` MCP tool added

**Phase 28 — Build From Inside (hook):**
- Emerge IDE: `⚡ hot-load` button (Ctrl+Shift+S) — sends editor content to `/hot-load`
- Emerge IDE: `⬡ spec-load` button (Ctrl+Shift+F) — routes through co-pilot/FORGE for AI patch first
- Emerge IDE accessible as `⚡ IDE` rail button in home TV shell

**Phase 42 — Blueprint:**
- `lib/blueprint.js`: `compile()` reads live registry, runs T1.5 projections, reads grammar + axioms + runtime config + spec drift, computes sigma, writes `blueprint.nex.json` + `blueprint.md`
- Authority chain declared: Blueprint → Manifest → Registry → projections
- Sigma > 0.65 → opens `blueprint_integrity` gap
- Routes: `POST :7820/blueprint/compile`, `GET :7820/blueprint`
- `nexus_blueprint` MCP tool added

**Phase 13 — Autonomous Loop:**
- `lib/autonomous-loop.js`: dual API — `run()` (simple direct-LLM) and `startRun()` (full spec-compliant gap-based architecture)
- Four required fields enforced: goal, budget (maxSteps/timeMs/costCeiling), boundary (description), exit_condition (type: steps/stable/manual)
- σ > 0.70 → snapshot rollback, HALTED_SIGMA status
- Case library queried per step; blocked signatures → BLOCKED immediately
- Compartment-engine, intent-classifier, open-loop-taxonomy wired
- `gap.status = 'pending'` (not createLoop default 'open') — §D scoped gap status fix
- Every action tagged `{ autonomous:true, runId, step, causedBy }`
- Routes: `POST :7820/autonomous/run`, `GET :7820/autonomous/status`
- `nexus_autonomous_run` MCP tool added

**Phase 12 — User Model v2:**
- Complete rewrite: hypotheses with confidence scores + decay (not hard facts)
- `CATEGORY` enum: PREFERENCE, PACE, STYLE, COMMUNICATION_STYLE, CHANNEL, INTENT, ERROR, TOPIC
- `observe({ category, claim, confidenceDelta })` spec-compliant API + v2 positional form
- `effectiveConfidence(h)` — pure function, reads `last_seen` or `lastSeen`, MIN_CONFIDENCE floor (0.05)
- `deriveFromChatLog(limit)` — derives hypotheses from chat patterns: provider preference (≥3 uses), pace (gap timing), style (contentLength), bdaSignals.certainty
- `checkContradictions()` — detects mutual exclusion pairs, opens `CONFLICT` gap when both ≥0.65 confidence
- `validateWiring()` — reports JAA + taxonomy reachability
- Lazy JAA load via `_getJaa()` — works in test environments without `init()`
- 0.1/day decay, 0.2 threshold → archive (not delete)

**Phase 40.5 — CLI Map:**
- `lib/cli-map.js`: reads registry, runs T1.5 projections, writes `cli-map.json`
- REPL dispatch table + grammar aliases generated from descriptors
- `getDispatchTable()`, `getHelpText(command)` for nexus-repl
- Wired into blueprint compile — every blueprint compile regenerates cli-map.json
- Grammar engine live-rebuilt from new aliases

---

### T2 Gate — Build Loop Closes (Phase T2)
**Files:** `emerge/compiler/t2-gate.js` (new), `guardian/server.js`, `lib/mcp-server.js`, `guardian/agents/co-pilot/index.js`

**The loop was never closed. Now it is.**

The compiler ran T0 (scaffold) → T1 (wiring) → produced `executionPlan.t2` (list of nodes ready for Ollama implementation) → then did nothing. `executionPlan.t2` was pushed to Idearium as a note. The stubs sat on disk forever with `throw new Error('not implemented')`.

`emerge/compiler/t2-gate.js` closes the loop:
- Reads `executionPlan.t2` from compile output
- Reads T1 stub files from disk
- Builds SEAM prompt per node: spec fragment + exports to implement + behavioral contracts + axioms + current stub
- Dispatches to `POST :7820/command { provider, content: seamText }`
- Guardian routes to `_buildSeamQueue()` → SEAMQueue → Ollama
- Waits for SEAM completion, receives implementation
- Writes result over stub file on disk
- Registers with Cortex

**`run(specPath, outputDir, opts)`** — single entry point: compile + T2 dispatch.

**Routes:** `POST :7820/build { specPath|specText, outputDir, provider, dryRun }`

**Co-pilot build intent:** "build X" → checks Idearium for spec → dispatches to `/build`

**`nexus_build` MCP tool** — Claude can call `nexus_build` with a spec path or inline spec text and NEXUS builds it.

**`POST :7820/api/guardian/organism-queue`** — organism delivery queue for ERAVOS. NEXUS writes built organism zips here; ERAVOS polls and installs.

---

### ERAVOS Catalog System (v16 + new modules)
**Files:** `ui/eravos/index.html`, `ui/eravos/catalog/catalog.js`, `ui/eravos/catalog/catalog-ui.js`, `ui/eravos/catalog/catalog.css`, `ui/eravos/pack/pack-loader.js`, `ui/eravos/bridge/nexus-bridge.js`, `ui/eravos/runtime/organism-factory.js`, all organism engines updated

**v16 catalog popup:**
- `+ ADD ORGANISM` button → `ORGANISM CATALOG` popup over dimmed backdrop
- Cards organized by category with icon, label, summary, `+ ADD` button
- 10 categories, 20+ organisms
- Needs-config prompt for organisms requiring configuration (NEXUS diagnostic organisms with configurable ports)
- `+ NEW` button → scaffold generator: downloads starter `engine.js` + `schema.json`
- F2 keyboard shortcut to toggle
- ESC closes

**Four new modules (code-first, no inline logic):**

`catalog/catalog.js` — **CatalogRegistry** (pure data)
- `register(def)`, `list()`, `get(id)`, `search(query)`, `categories()`, `on(event, fn)`
- No DOM, no rendering, no side effects
- Publishes `catalog:registered`, `catalog:updated`, `catalog:removed` on KERNEL.bus

`catalog/catalog-ui.js` — **CatalogUI** (pure rendering)
- `open()`, `close()`, `toggle()`, `refresh()`, `isOpen()`
- Builds its own DOM on `init()` — zero HTML in index.html
- Seeds CatalogRegistry from OrganismFactory on first open (catches boot-time registrations)
- Live-refreshes when CatalogRegistry fires change events

`pack/pack-loader.js` — **PackLoader** (install pipeline)
- `install(arrayBuffer, opts)` — full zip install: unzip → validate manifest → check kernel_target → request permissions → check requires → evaluate engine.js → register CatalogRegistry + OrganismFactory → write ledger → auto-spawn
- `installFromUrl(url, opts)` — fetch + install

`bridge/nexus-bridge.js` — **NexusBridge** (autonomous delivery)
- Polls `:9000/api/guardian/organism-queue` every 5 seconds
- When NEXUS finishes building an organism, fetches zip, passes to PackLoader, acknowledges
- `deliver(id, arrayBuffer)` — direct push without polling
- Non-fatal — silent retry when NEXUS offline

**OrganismFactory changes:**
- `register(id, def)` — dynamic registration at runtime (new)
- `reg()` now seeds CatalogRegistry on every call

**Organism fields added:** `category`, `summary`, `needs[]` — powering catalog cards and needs-config prompts.

**Drop zone** now routes through `PackLoader` instead of `KERNEL.zipImporter` directly.

**index.html** reduced from ~980 lines of inline logic to 763 lines. Catalog section is 12 lines of thin init.

---

### System Audit
**Files:** `tests/nexus-full-audit.js` (new), `tests/audit-results.json`, visual screenshots

**Static audit (`tests/nexus-full-audit.js`):**
- 138 checks across 9 sections: critical files, syntax, integration wiring, ERAVOS system, home UI, MCP config, blueprint, autonomous loop, causal chain
- Runs without a server, completes in under 10 seconds
- `node tests/nexus-full-audit.js` — 138/138 pass

**Playwright visual audit:**
- Home UI: all tiles render, channels switch, accent animation fires, rail navigation works
- ERAVOS catalog: popup opens, 10 categories, 20+ cards, organism spawns on click, Escape closes
- Emerge IDE: all buttons visible, hot-load and spec-load buttons present
- 8 screenshots saved per run

---

## Bug Fixes (enumerated)

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `cortex/self-heal/index.js` | `gap is not defined` in pre-apply snapshot | Made `gap` explicit parameter in `_applyPatch(gap)` |
| 2 | `cortex/self-heal/index.js` | `provider=undefined (undefinedms)` in log | Forge adapter returns `{ provider, durationMs }` |
| 3 | `cortex/self-heal/index.js` | Semantic gaps reaching forge (obligation/assumption) | `SEMANTIC_GAP_TYPES` exclusion set in `_tick()` |
| 4 | `lib/cfr/sigma.js` | Stack walk named sigma itself not real caller | Skip all CFR internal frames in stack walk |
| 5 | `ui/home/index.html` | `--ok:var(--ok)` circular reference | Fixed to `--ok:#00ff88` literal value |
| 6 | `ui/home/index.html` | `--err:var(--err)` circular reference | Fixed to `--err:#ff3355` literal value |
| 7 | `guardian/agents/co-pilot/index.js` | "hello" → `[Diagnosing Overview]` | Greeting fast-path before Qwen, tighter classify prompt |
| 8 | `guardian/agents/co-pilot/index.js` | `modelUsed` missing from 4 return paths | Added to all return objects |
| 9 | `cortex/memory/jaa-db.js` | Provisional table insert fails: `_byId[table].set` of undefined | `_byId[table] = new Map()` provisioned alongside `_tables[table]` |
| 10 | `lib/meta/confidence.js` | `weakestLink()` discounting items with `count` (treating as unevidenced) | `hasEvidence()` now treats `count > 0` as structural evidence |
| 11 | `ui/emerge-ide.html` | Nested backtick inside template literal (FORGE prompt) | Replaced with string concatenation |
| 12 | `lib/user-model.js` | `observe()` function declaration collision causing infinite recursion | Renamed original to `_observeCore()`, new wrapper is separate function |
| 13 | `lib/user-model.js` | `getHypotheses()` early `if (!_jaa) return []` fires before `_getJaa()` | Removed early bail, `_getJaa()` handles null case |
| 14 | `lib/user-model.js` | Table name `user_hypotheses` vs spec's `user_model_hypotheses` | Corrected to `user_model_hypotheses` throughout |
| 15 | `nexus-connect.js` | `postEvent()` blocking 5s on every guardian event | Made fire-and-forget at 1200ms |
| 16 | `cortex/snapshot/index.js` | Divergence snapshots triggering full 21k-row JAA dump | Skip `_captureJAA()` for divergence type |

---

## New Files Created

| File | Phase | Description |
|------|-------|-------------|
| `emerge/compiler/t2-gate.js` | T2 | Closes the build loop — spec → running code |
| `lib/mcp-server.js` | 67 | MCP HTTP server :7821, 15 tools |
| `lib/mcp-stdio.js` | 67 | MCP stdio transport for Claude Code |
| `lib/blueprint.js` | 42 | System reads itself — blueprint.nex.json |
| `lib/autonomous-loop.js` | 13 | Ollama as brain, gap-based multi-step tasks |
| `lib/hot-loader.js` | 14 | QUARANTINE → PROVE → INTEGRATE → MONITOR |
| `lib/descriptor-projector.js` | 40 | One descriptor → six projections, zero LLM |
| `lib/cli-map.js` | 40.5 | Generated REPL dispatch table from descriptors |
| `lib/user-model.js` | 12 | Hypotheses with confidence decay (full rewrite) |
| `lib/copilot-context.js` | 24.2 | 7-layer context assembler |
| `lib/causal/anomaly.js` | 71.3 | Anomaly classification engine |
| `bridge/causal/expectation.js` | 71.1/71.2 | State reducer + Expectation Engine |
| `ui/eravos/catalog/catalog.js` | ERAVOS | CatalogRegistry — pure data layer |
| `ui/eravos/catalog/catalog-ui.js` | ERAVOS | CatalogUI — pure rendering layer |
| `ui/eravos/catalog/catalog.css` | ERAVOS | Scoped catalog styles |
| `ui/eravos/pack/pack-loader.js` | ERAVOS | PackLoader — zip install pipeline |
| `ui/eravos/bridge/nexus-bridge.js` | ERAVOS | NexusBridge — autonomous organism delivery |
| `tests/nexus-full-audit.js` | Audit | 138-check static audit, runs without server |
| `docs/mcp.spec` | 67 | MCP Tool Bridge spec |
| `docs/mcp-claude-desktop-config.json` | 67 | Claude Desktop MCP config |
| `.mcp.json` | 67 | Claude Code MCP config (project root) |

---

## Phases Completed This Session

| Phase | Name | Status |
|-------|------|--------|
| 12 | User Model: Hypotheses Not Profile | ✓ Complete |
| 13 | Autonomous Loop | ✓ Complete |
| 14 | Hot Module Loader | ✓ Complete |
| 15 | Grammar Engine: Live Rebuild | ✓ Complete |
| 28 | Build From Inside (hook) | ✓ Complete |
| 40 | Component Descriptor | ✓ Complete |
| 40.5 | Descriptor-Driven CLI Map | ✓ Complete |
| 42 | Blueprint | ✓ Complete |
| 47 | Pattern Engine: Self-Wired | ✓ Complete |
| 62 | One Registry (Decision) | ✓ Complete |
| 67 | MCP Tool Bridge | ✓ Complete |
| 71 | Causal Event Graph Audit | ✓ Complete |
| 71.1 | State Reducer | ✓ Complete |
| 71.2 | Expectation Engine | ✓ Complete |
| 71.3 | Anomaly Engine | ✓ Complete |
| 71.4 | Self-Healing Controller Audit | ✓ Complete |
| T2 | Build Loop Closed | ✓ Complete |

**Roadmap: 32 complete → 32 complete (confirmed) + ERAVOS catalog system + T2 gate**

---

## Next Phases

| Phase | Name | Ready |
|-------|------|-------|
| 41 | Compiler Knowledge Layer | Unblocked (40 done) |
| 43 | Architect as UI Builder | Unblocked (40, 42 done) |
| 29 | Topology View: Live System Graph | Unblocked |
| 48 | CFR ↔ Decision Pipeline | Unblocked |
| 71.4 | Full self-heal controller rebuild | Architecture defined |
| ERAVOS | Nexus component → canvas hook bridge | NexusBridge ready |


---

## Session Continuation — 2026-06-27 (afternoon)

### Three Sovereign Systems Added

**ERAVOS** (`eravos/` — port 3751)
- Moved from `ui/eravos/` to `eravos/ui/` — now a peer system not a UI folder
- `eravos/server.js` — HTTP :3751, organism spawn/remove/list, wire connect/disconnect,
  catalog, pack install, organism-queue poll, transport play/stop, SSE events
- `eravos/registry-components.js` — 9 components declared on boot
- Wired into autopilot kernel set, orchestrator health map
- Home UI canvas channel now points to `http://127.0.0.1:3751/`

**Ollama Bridge** (`ollama/` — port 3749)
- Sovereign system, isolated from Guardian
- Guardian down → Ollama keeps running
- MAX_CONCURRENT=3, job queue with backpressure
- Every job carries `contractId, componentId, hookId, requestId, sessionId` for CFR
- Health monitor polls :11434 every 10s, broadcasts on stream
- Every completed job writes to Cortex `chat_log` via `/api/memory/insert`
- `ollama/server.js`, `ollama/registry-components.js`

**Co-pilot** (`copilot/` — port 3750)
- Separated from Guardian — no longer lives in `guardian/agents/co-pilot/`
- **Continuous stream architecture**: on boot subscribes to Cortex SSE + Guardian SSE
  Every event from every system ingested into rolling 500-event buffer
- **Dual cognition (S7)**:
  - INTUITION: `_intuit()` — reads live stream, answers instantly, no model
  - ANALYSIS: `_assemble7Layer()` + Ollama dispatch — 7-layer context + model
- Sessions tracked, all exchanges persisted to Cortex `chat_log`
- `POST /api/stream/ingest` — any system can push events into co-pilot stream
- `copilot/server.js`, `copilot/registry-components.js`

### Files Relocated (architecture alignment)
- `ui/agents/*` → `guardian/ui/agents/` — agent consoles belong with Guardian
- `ui/emerge-ide.html` → `emerge/ui/index.html` — IDE belongs with Emerge
- Guardian now serves `guardian/ui/` at `/guardian-ui/` route
- Home UI canvas iframe → `http://127.0.0.1:3751/` (ERAVOS sovereign)

### Noise Reduction Fixes
- `guardian/server.js` — bullet density gap threshold 0.5 → 0.75 (assumption floods)
- `lib/cfr/delta.js` — dom_map tension dampened (-0.6), was causing false 0.82 readings
- `service/nexus-diagnostic.js` — emerge + forge-shell marked `optional: true`,
  escalation logs suppressed for optional systems

### Test Status
- 630/630 module tests
- 187/187 brutal tests
- All new system files syntax-verified

---

## 2026-08-17 — ledger wire + person model

**Tests: 1667/18 → 1714/14.** Five suites still CRASH on missing modules (unchanged).

### Added
- `lib/ledger-sse.js` — cross-process ledger transport. `mount()` serves a process's
  fan-in as SSE in canonical component-ledger schema; `subscribe()` replays a remote
  stream into the local fan-in. 17 tests, incl. a real child-process gate.
- `lib/error-log.js` — append-only `data/error.log`, one ledger row per line,
  dependency-free so it outlives the systems it reports on.
- `copilot/lib/person-model/` — the co-pilot's model of the USER. Flat typed lattice,
  lens projections, hash-chained sessions, provenance. 26 tests.
- `copilot/ui/person-model.html` — read/edit surface.
- `tools/record-session-2026-08-17.js` — writes this session into cortex as ledger history.

### Root cause: co-pilot invisible in autopilot
`lib/ledger-fanin` holds subscribers in module-level state — per-PROCESS. copilot,
cortex and diagnostic are separately spawned, so autopilot's `(deferred: intelligence,
copilot)` could never resolve: co-pilot subscribed to a different array in a different
process. Nothing was broken; the wire did not exist.

Second half: **copilot was not among the 22 files calling `component-ledger.write()`.**
20+ event types died at the edge of its SSE `Set` — none reached the ledger tree,
`event_log`, `error_log` or the pattern engine.

### Changed
- `copilot/server.js` — `broadcast()` also writes a ledger row; mounts `/ledger/stream`;
  12 `/api/person-model/*` routes. Existing `/sse` byte-identical (§5.14).
- `autopilot.js` — consumes 5 remote ledger streams; error.log sink; `/status` carries
  `ledger` with `blind[]`.
- `service/nexus-diagnostic.js` — mounts `/ledger/stream` alongside `/events`.
- `cos/kernel.js` — ledgers all 3 compartment transitions. **No SSE**: `cos/spec/cos.spec`
  declares core CLI-driven, so a server there would break its own contract.
- `copilot/registry-components.js` — 12 new components with grammar terms.

### Defects found by running, not reading
- `LSSE-001` — `component-ledger:275` emits `type=${system}.${action}` with the real
  `component` at top level and `status` nested in `payload`. Re-deriving from `type`
  produced `component:'copilot'` not `'copilot.lifeline'`, and turned ERROR rows into
  info. An error arriving as info is worse than not arriving. Pinned by `LS-002b`.
- `ELOG-001` — circular `detail` made `JSON.stringify(entry)` throw; the catch prevented
  a crash but dropped the row. Now degrades to a stated marker. `EL-004`.
- `BL-001` regression, self-inflicted and fixed — `test-boot-log-fixes` locates the
  diagnostic kernel by string-slicing `autopilot.js`. A second matching key 120 lines
  above the kernel table hijacked it. Writing the literal into an explanatory comment
  reproduced the identical break: string-scanning tests do not distinguish code from prose.

### Order-dependent tests
`SM-017`/`SM-018` passed standalone and failed under the real runner — they were testing
the fixture (an empty store), not the invariant. Rewritten. Worth noting that
`test-ui-tools`, `test-tablet-graph-api` and 2/3 of `test-tablet-container-api` flipped to
PASSING this session purely because writes landed in the JAA store and `data/ledger/`.
Those bugs are not fixed; those tests have the same defect.

### Recorded, NOT fixed
- `MISSING-001` — `cortex/foundation/admin-server.js` absent, so `/api/compartments` 404s.
  The prompt then falls through to ollama, which invents an answer. Also missing:
  `cortex/healer/index.js`, `cortex/flush-redundancy.js`, `lib/request-handler.js`,
  `cortex/core/raid/intelligence-bridge.js` — the 5 CRASHED suites.
- `UNWIRED-001` — `grammar-fallback` (6 passing tests) is required by nothing in `copilot/`.
  The prompt chain has no floor; a chain ending at an LLM ends at the thing that never refuses.

### Design note — person model
One flat lattice; a meaning-making web is a **lens**, not a nested graph. Nesting forces
two propagation rules that disagree at the boundary, with no principled stopping point.
Lens contract identical to `lenses.test.js` (LN-1/LN-3/LN-7).

`trigger`, `sensitive`, `boundary` are **stated-only** — `infer()` and `observe()` into
them throw. The system can still notice: `noteObservation()` queues what it saw with
checkable evidence, and only `accept({by:'user'})` promotes it. §IP-5 applied to
self-knowledge. `purge()` is a real hard delete, deliberately breaking §0.3 — "nothing is
lost" is right for system state and wrong for a model of a person.
