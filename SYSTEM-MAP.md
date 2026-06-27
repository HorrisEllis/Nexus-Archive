# NEXUS System Map
# Author: James Brooks
# Date: 2026-06-27
# Status: Living document — append-only, never delete

---

## The Principle

Intent arrives. RAID routes it to the best tool. The tool runs inside a compartment.
The outcome feeds back to RAID's weights. CFR tracks the causal chain.
If it fails, the rewind engine rolls back. Cortex remembers everything.
The UI is disposable — it is a projection of system state, not the system.

---

## What Exists (confirmed in code)

### Core Infrastructure

ORCHESTRATOR :9000
  role:       Root. All systems register here. All UIs read here.
  learns:     Contract trust scores per system (verified/unverified/unreachable)
  ledger:     Every system registration, heartbeat, contract verification
  registers:  itself on boot — calls onSystemRegister('orchestrator', components[])
  components: declared in contracts/nexus-interaction-contract.js
  missing:    component-registry.js fed at boot — 0 components registered

CORTEX :3748
  role:       Sovereign memory + intelligence + RAID
  learns:     Cluster weights (raid-weights.json), pattern corrections (raid-clusters.json)
  ledger:     All events via JAA (28 tables), CFR causal graph, sigma field
  subsystems:
    RAID v6          — intent clustering + agent routing + weight learning
    CFR-Ω            — causal field, sigma per chain, regime detection
    Gap loop         — open loop taxonomy, escalation ladder
    Self-heal        — forge patches, snapshot-before, rollback-on-failure
    Intelligence     — pattern crystallization, RCA, anomaly detection
    Snapshot engine  — .nex files, rollback, diff
    Liminal space    — boundary items between known/unknown
    Hook registry    — 22 hook types, schema validation, friction scoring
  components: NOT registered (no registry-components.js)
  missing:    component registry feed, CFR→RAID wire, hook-registry→routing wire

GUARDIAN :7820
  role:       Agent dispatch. NCP routing. Job queue. SEAM queue.
  learns:     Nothing explicitly (RAID in cortex learns, not guardian)
  ledger:     Jobs, providers, SEAM sessions, artifacts
  subsystems:
    Co-pilot         — 7-layer context, token-first, writes to cortex chat_log
    SEAM queue       — chunked SEAM dispatch to providers
    Hot-loader       — QUARANTINE→PROVE→INTEGRATE→MONITOR
    MCP server       — 17 tools on :7821
    Autonomous loop  — goal/budget/boundary/exit, Ollama as brain
    Blueprint        — system reads itself, generates cli-map.json
  components: NOT registered (no registry-components.js)
  missing:    component declarations, hooks declared per capability

IDEARIUM :4800
  role:       Idea store. Tension scoring. Spec promotion.
  learns:     SNR scores per idea over time
  ledger:     Ideas, specs, gaps, tension history, links
  components: FULLY DECLARED in idearium/registry-components.js ← THE MODEL
  registers:  sends components[] on system register POST
  hooks:      3 declared (idea.create, idea.update, gap.open) — 42 routes total, rest missing
  missing:    full hook declarations for all 42 routes

ARCHITECT :3747
  role:       Design surface. Hook registry. Blueprint engine.
  learns:     Hook friction scores (successful/failed wires)
  ledger:     Hooks, bindings, blueprints, spec templates
  subsystems:
    Hook registry    — 22 hook types, schema validation, JAA persisted
    Spec builder     — 11-dimension wizard
    Architecture canvas — drag/drop, chip types, export to spec
  components: NOT registered
  missing:    component declarations, hook-registry not fed at boot

EMERGE IDE :4242
  role:       Compiler. SEAM pipeline. Spec-to-code.
  learns:     Nothing (T2 gate feeds outcomes back — not yet wired to RAID)
  ledger:     Compile results, SEAM chunks, execution plans
  subsystems:
    T0/T1/T2 compiler pipeline
    Grammar engine   — live rebuild on component.registered
    Descriptor projector — one descriptor → 6 projections
    CLI map          — generated from descriptors
  components: NOT registered
  missing:    component declarations

BRIDGE :9999
  role:       P2P trust relay. Circuit breaker. Identity verification.
  learns:     Nothing
  ledger:     Relay requests, trust scores, circuit states
  components: NOT registered

---

## What Exists But Is Disconnected

### Component Registry (lib/component-registry.js)
  Status:     BUILT. 0 components registered.
  Reason:     orchestrator.js calls onSystemRegister() — but only idearium
              sends components[]. Every other system sends nothing.
  Fix:        Each system needs registry-components.js → sent on boot POST.

### Hook Registry (architect/src/hooks/Registry.js)
  Status:     BUILT. 0 hooks registered at runtime.
  Reason:     Nothing calls Registry.register() on any system boot.
  Fix:        Each system's registry-components.js declares its hooks.
              Architect boot phase calls Registry.init() and loads from JAA.

### CFR Causal Graph (lib/cfr/graph.js)
  Status:     BUILT. Ingests ledger entries. Not consulted by RAID.
  Reason:     RAID's _decide() reads _weights and _health. Not CFR sigma.
  Fix:        _decide() adds: if CFR sigma for this (cluster × agent) > 0.7,
              penalize that agent in the routing decision.

### RAID Weight Learning (cortex/core/raid/index.js)
  Status:     BUILT and WORKING.
              - Qwen classifies every intent async
              - Mistral generates new regex patterns when correction rate > 40%
              - Weights persisted to raid-weights.json
              - Learned patterns persisted to raid-clusters.json
  Gap:        Weights cover (cluster × agent) but not (cluster × component).
              RAID picks providers (ollama, claude, chatgpt).
              It should pick components (guardian.copilot, idearium.idea.create).
              The component registry enables this — when populated.

### Compartment System
  Status:     REFERENCED in JaaDB (compartments table), autonomous-loop,
              open-loop-taxonomy. No compartment-engine.js found.
  The spec describes: compartments isolate each job — memory, context, toolset.
              Failure in a compartment stays in that compartment.
              Rewind operates per-compartment.
  Gap:        Not implemented as a sovereign module.

### Rewind Engine (cortex/snapshot/index.js)
  Status:     BUILT. Creates .nex snapshots. Rollback restores JAA tables.
  Gap:        Not triggered automatically on compartment failure.
              RAID does not consult it before dispatching to a low-success agent.
              The UI rewind overlay exists but reads snapshots, doesn't trigger.

### Agent Tools (cortex/agent-tools/index.js)
  Status:     BUILT. nexus.status, nexus.gaps, and more.
  Gap:        Not wired to RAID. RAID picks agents (ollama/claude).
              It should pick tools (nexus.status, nexus.gaps, idearium.idea.create).
              Tool registry + component registry together = RAID picks the right tool.

---

## What Doesn't Exist Yet

### registry-components.js per system
  guardian/registry-components.js     — all co-pilot, SEAM, hot-load, blueprint routes
  cortex/registry-components.js       — RAID, CFR, gaps, self-heal, intelligence
  architect/registry-components.js    — hook registry, spec builder, canvas
  emerge/registry-components.js       — compiler, grammar, descriptor, cli-map
  bridge/registry-components.js       — relay, trust, circuit breaker

### Wire: CFR sigma → RAID _decide()
  RAID penalizes agents/components with high causal sigma on recent chains.
  High sigma = this component has been causing downstream failures.
  Don't route to it until sigma drops.

### Wire: RAID outcome → component registry weight
  When a tool succeeds/fails, update (cluster × componentId) weight.
  Not just (cluster × agent). Components, not providers.

### Wire: compartment failure → snapshot rollback
  Every job runs in a named compartment.
  compartment.fail → snapshot.rollback(compartment.snapshotId)
  Clean state restored. Gap opened. Pattern recorded.

### Wire: component.registered → CFR graph node
  When a component registers, it becomes a node in the causal graph.
  Its hooks become edges. When it emits an event, CFR ingests it.
  The relational field is the graph of all registered components and their wires.

### UI as system projection
  Every UI channel reads from an API. Nothing is hardcoded.
  The overview grid reads from GET /api/components → renders tiles.
  The causal graph reads from GET /api/cfr/graph → renders nodes + edges.
  The component registry changes → overview rerenders.
  Add a new system → it appears. No HTML changes.

---

## Build Order (bottom-up, §3.1)

Phase 1 — Populate the registry
  Each system ships registry-components.js
  On boot: POST /api/register { components: [...] }
  Component registry goes from 0 → ~150 components
  Hook registry goes from 0 → ~50 hooks
  Grammar trie goes from 0 → ~300 aliases
  Blueprint compiles the full system map

Phase 2 — Wire CFR → RAID
  _decide() reads CFR sigma per (cluster × componentId)
  High sigma → skip or penalize
  Sigma drops → restore routing weight

Phase 3 — Compartment engine
  Every job/request gets a compartment: { id, snapshotId, tools[], memory }
  Failure stays in compartment
  On failure: rollback to snapshotId
  Gap opened, pattern recorded, RAID weight updated

Phase 4 — UI as projection
  Overview reads GET /api/components (not hardcoded tiles)
  Channels load as iframes (sovereign HTML)
  New component registered → appears in UI automatically

Phase 5 — RAID routes to components, not just providers
  Decision: { agent: 'ollama', component: 'idearium.idea.create', hook: 'idea.create' }
  Not just: { agent: 'ollama' }
  Full relational routing through the field

---

## The Relational Field

Every entity in NEXUS is a node:
  - Systems (orchestrator, guardian, cortex, idearium, emerge, architect, bridge)
  - Components (guardian.copilot, idearium.idea.create, cortex.raid, ...)
  - Hooks (the declared connection points on each component)
  - Wires (the live bindings between hooks)
  - Jobs (each request, each compartment run)
  - Gaps (open loops in the field)

Every event is an edge:
  - causedBy → explicit parent
  - sessionId → temporal cluster
  - jobId → execution chain
  - hookId → wire traversal

CFR watches all edges and computes sigma per subgraph.
RAID reads sigma before routing.
The field learns. The field self-heals.
The UI is a read-only projection of the field.

