# NEXUS v0.9.8 — Session Patch Notes
Date: 2026-06-23
Author: James Brooks (Erosmancer) + Claude

---

## Phase 23.7 — Gap Lifecycle: Causal Closure with Artifact Verification

### The problem this solves
The system had a closure illusion. Gaps opened, jobs dispatched, jobs
completed — but nothing actually verified whether the underlying problem
was fixed. The same 30 gap UUIDs were spawning hundreds of jobs per
diagnostic sweep. The system was optimising for event completion signals
instead of state change in the world model.

### What changed

**lib/gap-predicate.js** (NEW)
- Predicate library: every known gap type has a checkable JAA query
- Dedup key: stable hash of predicate identity — same problem = same gap
- Truth floor: synchronous Qwen classification at gap creation, always succeeds
- Closure verifier: predicate AND artifact must both pass — neither alone is closure
- TTL sweep: expired gaps transition to EXPIRED, never silently dropped
- Component registration: self-describing, visible in grammar engine + topology

**cortex/memory/jaa-db.js**
- Added: reflection_contracts table (long tier)
- Added: closure_attempts table (long tier)
- Added: gap_predicates table (long tier)

**lib/open-loop-taxonomy.js**
- createLoop() now enriches every gap with predicate, artifact_requirement,
  dedup_key, truth_floor, ttl_ms before returning
- Dedup check runs at creation — existing open gap with same predicate
  gets evidence appended, not a new gap created

**service/nexus-diagnostic.js**
- Gap creation uses enrichGap() + dedup check before insert
- Gaps marked 'investigating' immediately on dispatch
- Diagnostic sweep skips investigating/resolved/expired/blocked gaps
- Predicate check before re-dispatch — if predicate is false, run
  closure verifier instead of creating a new job
- Human-readable log lines (▶, ⚠, ✓)

**cortex/gap-loop.js**
- Listens for guardian.job.complete events carrying meta.gapUuid
- Runs verifyClosure() after every job completion
- TTL sweep interval: every 5 minutes
- gap-predicate registers its component on init

**guardian/server.js** (multiple changes)
- createJob() now takes meta: { gapUuid, gapType, raidAgent, raidReason, source }
- createJob() writes to JAA before dispatch (§2.1)
- createJob() emits guardian.job.created on bus + ledger
- updateJob() persists every state transition to JAA
- updateJob() emits guardian.job.status on bus + ledger
- job.complete bus event includes meta.gapUuid for closure verifier
- /command route passes full RAID decision into job meta
- Reflection contracts polling phase: polls JAA every 30s, dispatches
  queued contracts to Mistral via Ollama native path
- Human-readable log lines (⚡, ▶, ✓, ✗, ⏳, 🔗, 📋)

**cortex/core/raid/index.js**
- _cluster() replaced with learned+regex hybrid system
- CLUSTERS_BASELINE: original regex, always present as fallback
- _learnedPatterns: Qwen-generated patterns, persisted to raid-clusters.json
- _qwenClassify(): async Qwen call after every cluster decision, never blocks
- _clusterReviewTick(): Mistral reviews correction samples, proposes new patterns
- _clusterSamples: correction buffer, feeds review tick
- Public decide() wrapper exported (was missing — caused silent fallback to chatgpt)
- getState() exposes learnedPatterns count, correctionRate

---

## UI / Agents

**ui/agents/mistral/index.html** (NEW)
- Native Mistral/Ollama console — no tab bridging, no NCP
- Engine panel: pings :11434 directly, shows installed models, stream progress
- Model selector tied to OLLAMA_COMMAND_MODELS from guardian/server.js
- Dynamic context chips from component registry (/api/components/grammar)
- SEAM queue ladder: same chunk tracking as ChatGPT console
- Ember accent (#ff7c38) — visually distinct from ChatGPT (green) / Claude (purple)

**orchestrator.js**
- Added ui/agents to SYSTEM_LOCAL_UI_DIRS hotswap watcher (§HOTSWAP-04)
- ui/agents/chatgpt and ui/agents/mistral now get hotswap events on file change

**guardian/userscript-chatgpt.js**
- findResponseEl(): 7 selector variants instead of 1 — ChatGPT DOM changes broke the original
- startWatch(): 3-minute hard timeout — prevents permanent gate lock on DOM miss
- _watchTimeoutId: module-level, cleared by stopWatch()
- Root cause of the 300-job flood: DOM selector miss → startWatch never completed
  → GUARDIAN_COMPLETE never sent → same gaps re-dispatched every sweep

---

## Summary of architectural changes

The system now has:
1. True gap closure (predicate false + artifact exists)
2. Deduplication (same problem = one open gap, not hundreds)
3. Honest job contracts (every state transition persisted to JAA)
4. RAID routing that actually works (public decide() was never exported)
5. Self-improving cluster classification (Qwen + Mistral, persists to disk)
6. Reflection contracts queued and dispatched to Mistral
7. Mistral console UI for local inference
8. Hotswap working for all agent UIs

---

## Reflection Engine — Phase 11 (this session, completing the wire)

**lib/reflection.js** — two additions, nothing removed

### 1. Reflection contracts queued on streak threshold

Previously: `_updateStreak()` opened a gap when N consecutive
low-satisfaction decisions hit and stopped. The gap existed but nothing
was dispatched to reason about it. Mistral never saw it.

Now: after inserting the gap, `_updateStreak()` immediately inserts a
`reflection_contract` row into JAA with:
- `gapUuid` linking it to the gap
- `decisionClass` and `loopType` for context
- `evidence[]` — the actual low-satisfaction reasons
- `status: 'queued'` — guardian's polling loop picks this up within 30s
- `priority` derived from loopType (critical/high/normal)
- `agent: 'mistral'` — Mistral does the reflection reasoning

Guardian's reflection_contracts polling phase (added to server.js) sees
the queued contract, dispatches a Mistral job via Ollama native, marks
the contract `dispatched`.

### 2. Contract resolution checked on every pass

Previously: `runReflectionPass()` scored decisions and opened gaps.
No feedback loop — contracts dispatched to Mistral were never checked.

Now: every pass also:
1. Queries `reflection_contracts` for dispatched contracts
2. For each: loads the gap, runs `verifyClosure(gap)`
3. `verifyClosure` checks predicate (is the problem still real?) AND
   artifact (does something concrete exist proving it's fixed?)
4. If both pass: contract → resolved, gap → resolved, event logged
5. If not: logged, stays dispatched, retried next pass

### 3. getState() now exposes contract stats

`reflection.getState()` returns `contracts: { queued, dispatched, resolved, failed }`
Observable from cortex health endpoint and the dashboard.

---

## Complete wire map (what talks to what now)

```
User input
  → co-pilot (decision_log entry written)
  → RAID.decide() [now actually exported and called]
      → Qwen classifies cluster (async, non-blocking)
      → weights + health → agent selected
  → Ollama/Mistral/ChatGPT executes
  → guardian.job.complete emitted (with meta.gapUuid)
  → gap-loop receives event
      → verifyClosure(gap) — predicate + artifact check
      → gap.status → resolved | open (retry)

Diagnostic sweep
  → gap detected → enrichGap() → dedup check
  → new gap: predicate + artifact_requirement + truth_floor stamped
  → existing gap: evidence appended, recurrence++, NO new gap
  → gap dispatched → status: investigating
  → diagnostic sweep skips investigating gaps (flood fixed)

Reflection pass (every 15s)
  → unscored decision_log rows → scoreDecision()
  → score written back to row
  → _updateStreak() — N consecutive low scores → gap + contract queued
  → dispatched contracts checked → verifyClosure() → resolved or retry
  → RAID feedback aggregated from event_log (read-only, never writes RAID)

Guardian boot
  → reflection_contracts polling phase (every 30s)
  → queued contracts → Mistral job dispatched
  → job meta carries contractUuid + gapUuid

Qwen (background, every RAID call)
  → classifies cluster, stores in _clusterSamples
  → 40%+ correction rate → _clusterReviewTick()
  → Mistral proposes new regex patterns
  → patterns written to raid-clusters.json
  → next boot: learned patterns loaded, system routes better
```
