# Waypoint

<!-- promoted from spec 6d7f7dd2-daea-4f54-bf68-76cf7f4f9e12 · mode:emerge · 10/10 chunks built -->

## File structure

- `00-meta.md` — component: idearium.spec-engine (complete)
- `01-purpose.md` — component: idearium.spec-engine (complete)
- `02-axioms.md` — component: idearium.spec-engine (complete)
- `03-schema.md` — component: idearium.spec-engine (complete)
- `04-api.md` — component: idearium.spec-engine (complete)
- `05-events.md` — component: idearium.spec-engine (complete)
- `06-integration.md` — component: idearium.spec-engine (complete)
- `07-failure_modes.md` — component: idearium.spec-engine (complete)
- `08-build_order.md` — component: idearium.spec-engine (complete)
- `09-tests.md` — component: idearium.spec-engine (complete)

---

### 00-meta.md

Seeded deterministically from template `compartments` — no agent dispatched.

# Meta — Compartment Map

Seeded from the compartments template. This spec's purpose is to be
promoted to a repository first, deep-build second — see integration
section for the mapping rule.

> Source: idearium/spec-engine/templates/compartments.spec § meta

### 01-purpose.md

Seeded deterministically from template `compartments` — no agent dispatched.

## Purpose & Intent

A compartment is the smallest sovereign boundary in the system: one
folder, one seam, one gate. This spec exists to declare that boundary
set BEFORE any component inside a compartment is written, so the repo's
folder structure — and the rule for how compartments may talk to each
other — is fixed and promotable on day one, not discovered by an agent
mid-build.

For each compartment this idea needs, declare:

```
compartment "<name>"
  intent      = <one sentence: what this compartment owns and nothing else>
  seam        = compartments/<name>/seam.json   // isolation boundary declaration only
  gate        = gate-cross-compartment.js        // sole authorized cross-compartment path
  mounts      = <what this compartment registers on boot>
  depends_on  = <other compartment names, or none>
```

A compartment with no stated `intent` is not yet a compartment — it's an
unscoped folder, and GATE_BEFORE_CROSS has nothing to enforce a boundary
around.

> Source: idearium/spec-engine/templates/compartments.spec § purpose

### 02-axioms.md

Seeded deterministically from template `axioms` — no agent dispatched.

## Axioms Enforced

For each axiom: state it, then state the evidence in THIS spec that
satisfies it. An axiom listed with no evidence line is not enforced,
it's quoted.

- **§1.1 NOTHING_EXISTS_UNTIL_PROVEN** — nothing is marked done on claim
  alone; evidence tier (PARSES/BOOTS/SERVING/HEALTHY/CONTRACT) required.
  _Evidence:_
- **§1.2 NOTHING_SILENTLY_FAILS** — every error path is loud and
  specific, traceable to its source.
  _Evidence:_
- **§1.3 NO_STUBS_IN_PRODUCTION** — no placeholder, mock, or TODO ships
  in a path marked production.
  _Evidence:_
- **§2.1 PERSISTENCE_IS_GOLDEN** — state that matters survives a
  restart; nothing load-bearing lives only in memory.
  _Evidence:_
- **§3.1 BOTTOM_UP_ONLY** — dependencies are built and proven before
  what depends on them.
  _Evidence:_
- **§4.3 ENTERPRISE_MILITARY_GRADE** — the component holds up under
  real load and real hostile input, not just the happy path.
  _Evidence:_
- **§5.1 UUID_HOOK_BUS_ON_EVERYTHING** — every unit has its own UUID,
  registers its hooks, and speaks on the bus — not a hidden direct call.
  _Evidence:_
- **§5.2 EVERYTHING_IMPLEMENTS_THE_BRIDGE** — this component is
  reachable through the standard bridge contract, not a private side
  channel.
  _Evidence:_
- **§5.3 NO_MONKEY_PATCHES** — nothing here mutates another module's
  behavior from outside its own file.
  _Evidence:_
- **§8.1 SESSION_CONTEXT_BEFORE_BUILD** — this spec states its own
  purpose and dependencies before any implementation section.
  _Evidence:_
- **§8.2 HOSTILE_REVIEW_BEFORE_SPEC** — this spec's claims have been
  checked against what actually exists, not assumed.
  _Evidence:_

Sovereign-system axioms (apply when this spec's `type` scaffolds a
system, per genesis.spec — otherwise mark not-applicable, don't delete):

- **SOVEREIGN** — answers to no external authority
- **AGNOSTIC** — core does not care what data or system touches it
- **NOTHING_INLINE** — no cross-system call is hand-wired; wire or gate only
- **GATE_BEFORE_CROSS** — no compartment reaches another without passing its gate
- **HOT_SWAPPABLE** — any isolate module may be replaced at runtime without reboot
- **CONFIG_OUTSIDE_CODE** — anything adjustable lives in config, never hardcoded
- **LEDGER_IS_TRUTH** — every runtime writes its event stream to an append-only ledger

> Source: idearium/spec-engine/templates/axioms.spec § axioms

### 03-schema.md

Seeded deterministically from template `schemas` — no agent dispatched.

## Data Schema

Every table/record in this spec declares, at minimum:

- **table/entity name** — kebab-case, singular
- **uuid** — every row's own identity (§5.1 UUID on everything)
- **fields** — `name: type` pairs; type is one of the JAA primitives
  (`string`, `number`, `boolean`, `timestamp`, `uuid`, `json`)
- **constraints** — required / unique / foreign-key, stated explicitly,
  never implied
- **decay tier** — how long this data is retained and what happens when
  it expires (hot / warm / cold / permanent) — a schema with no decay
  tier is assumed permanent, which must be a deliberate choice, not a
  default nobody made
- **baseline** — the shape this schema is graded against at boot,
  registered as a hard Axiom check (severity:hard) so drift between
  declared shape and actual shape is caught at the gate, not in
  production

Template for one entity:

```
entity "<name>"
  uuid          uuid      required unique
  <field>       <type>    <constraint>
  createdAt     timestamp required
  updatedAt     timestamp required
  decay         permanent | hot | warm | cold
```

A schema chunk that only lists field names without types, constraints,
and a decay tier is incomplete — §1.1, nothing exists until proven, and
an untyped field is an unproven shape.

> Source: idearium/spec-engine/templates/schemas.spec § schema

### 04-api.md

<!-- imported block: interfaces -->

# BLOCK 8 — INTERFACES
  interfaces:
    api: GET /x

### 05-events.md

<!-- imported block: event model -->

# BLOCK 6 — EVENT MODEL
  # ════════════════════════════════════════════════════════════════
  event_model:
    stream:
      type: ring_buffer
      capacity: 5000000
      ordered: true
      durable: false
      replay_enabled: true
      overflow_policy: drop_oldest
      index_type: logical_tick

    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true

    event_types:
      - id: EVT-001
        name: command:running
        category: request
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Used as calltoMap key.
            - name: action
              type: string
              required: true
              description: Action being performed (e.g. click, submit).
          example:
            id: cmd-1
            action: click
        producers: [adapter]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-002
        name: command:success
        category: response
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id. Matches running entry.
            - name: status
              type: string
              required: true
              description: '"ok"'
          example:
            id: cmd-1
            status: ok
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-003
        name: command:failed
        category: error
        schema:
          fields:
            - name: id
              type: string
              required: true
              description: Callto element id.
            - name: error
              type: string
              required: true
              description: Error message or code.
          example:
            id: cmd-1
            error: "timeout"
        producers: [adapter]
        consumers: [kernel, delta, enforcement]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-004
        name: session:boundary
        category: state_change
        schema:
          fields:
            - name: ref
              type: string
              required: true
              description: ID of the page:navigated event that triggered this gate output.
          example:
            ref: evt-uuid-page-nav
        producers: [kernel]
        consumers: [kernel, enforcement]
        retention_ms: 86400000
        replay_safe: true
        idempotency: conditional
        idempotency_key: ref
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt

      - id: EVT-005
        name: system:ring:evicted
        category: system
        schema:
          fields:
            - name: cap
              type: number
              required: true
              description: Ring buffer capacity at eviction time.
            - name: evictedSeq
              type: number
              required: true
              description: Logical sequence of evicted event. Object NOT in payload.
          example:
            cap: 5000000
            evictedSeq: 4999999
        producers: [kernel]
        consumers: [persist, enforcement]
        retention_ms: 0
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: strict
          on_failure: discard

      - id: EVT-006
        name: invariant:violation
        category: error
        schema:
          fields:
            - name: invariantId
              type: string
              required: true
              description: "e.g. I-1, C-4, H-1."
            - name: message
              type: string
              required: true
              description: Human-readable violation description.
            - name: context
              type: object
              required: false
              description: Additional context for debugging.
          example:
            invariantId: I-1
            message: "event.id is not UUID v4: abc-123"
            context:
              eventType: command:running
        producers: [enforcement]
        consumers: [enforcement]
        retention_ms: 604800000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: exactly_once
          ordering: strict
          on_failure: halt


      - id: EVT-007
        name: macro:detected
        category: signal
        schema:
          fields:
            - name: pattern
              type: string
              required: true
              description: Pattern key that crossed threshold.
            - name: count
              type: number
              required: true
              description: Current pattern occurrence count.
          example:
            pattern: "command:success:sequential"
            count: 5
        producers: [projection]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-008
        name: system:diamond:rejected
        category: system
        schema:
          fields:
            - name: fromId
              type: string
              required: true
              description: Event ID that attempted a diamond parent edge.
            - name: toId
              type: string
              required: true
              description: Existing ancestor that would create the diamond.
          example:
            fromId: evt-abc-123
            toId: evt-root-001
        producers: [causality, kernel]
        consumers: [enforcement]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_most_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-009
        name: idea:recorded
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: IdeaEntry that was recorded.
          example:
            idea:
              id: idea-001
              type: hypothesis
              description: "Try reducing walFlushEvery to 50"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 86400000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: idea.id
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard

      - id: EVT-010
        name: idea:promoted
        category: audit
        schema:
          fields:
            - name: idea
              type: object
              required: true
              description: The IdeaEntry being promoted.
            - name: upgrade
              type: object
              required: true
              description: The resulting UpgradeEntry.
          example:
            idea:
              id: idea-001
            upgrade:
              id: upgrade-001
              type: passing_test
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-011
        name: upgrade:committed
        category: audit
        schema:
          fields:
            - name: upgrade
              type: object
              required: true
              description: The committed UpgradeEntry.
          example:
            upgrade:
              id: upgrade-001
              type: passing_test
              description: "195 tests passing after walFlushEvery reduction"
        producers: [ledger]
        consumers: [observer]
        retention_ms: 604800000
        replay_safe: true
        idempotency: idempotent
        idempotency_key: upgrade.id
        delivery:
          guarantee: at_least_once
          ordering: strict
          on_failure: dead_letter

      - id: EVT-012
        name: bottleneck
        category: signal
        schema:
          fields:
            - name: metrics
              type: object
              required: true
              description: "{ pendingIdeas: number, threshold: number, oldestIdea: IdeaEntry }."
          example:
            metrics:
              pendingIdeas: 6
              threshold: 5
              oldestIdea:
                id: idea-001
        producers: [ledger]
        consumers: [observer]
        retention_ms: 3600000
        replay_safe: false
        idempotency: non_idempotent
        delivery:
          guarantee: at_least_once
          ordering: best_effort
          on_failure: discard

    delivery:
      default_guarantee: at_least_once
      default_ordering: strict
      max_retries: 3
      retry_backoff_ms: 100
      dead_letter_table: dead_letter_events
      failure_handling:
        on_subscriber_crash: continue
        on_timeout_ms: 5000

    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════

### 06-integration.md

Seeded deterministically from template `compartments` — no agent dispatched.

## Integration Points

**The map-first rule**: this spec is designed to be promoted
(`spec.promote`, `mode:'manual'`) the moment its meta/purpose/axioms/
integration chunks are seeded — before schema, api, events, or any
component code exists. That promotion creates the repository's real
folder skeleton (one folder per declared compartment, each holding a
`seam.json` stub and referencing the shared `gate-cross-compartment.js`)
with every other section marked TODO. Subsequent specs — one per
compartment, or one per component — promote INTO that same repository
(`parent: <this idea's uuid>`), filling in what the map only outlined.

Rules enforced at the gate, not just documented here:

- **GATE_BEFORE_CROSS** — no compartment reaches another except through
  `gate-cross-compartment.js`; a direct import across compartment
  folders is a violation to flag, not a shortcut to take.
- **NOTHING_INLINE** — no cross-compartment call is ever hand-wired.
- **SEAM_IS_DUMB** — a seam declares a boundary only: no ports, no
  direction, no methods of its own.
- Every cross-compartment call, pass or reject, emits an event — the
  gate is observable, not a silent pass-through.

> Source: idearium/spec-engine/templates/compartments.spec § integration

### 07-failure_modes.md

Seeded deterministically from template `checklists` — no agent dispatched.

## Failure Modes

What can fail, stated before it happens, not discovered after:

- [ ] **Input validation** — what happens on malformed/missing input?
      Rejected loudly, not silently coerced.
- [ ] **Dependency unavailable** — what happens if something this
      component calls is down? Named fallback or a loud, specific error
      — never a silent no-op.
- [ ] **Partial failure** — if this writes to more than one place, what
      happens if the second write fails after the first succeeded?
      State the recovery path, not just the happy path.
- [ ] **Recovery** — is there a retry, and does it have a ceiling? An
      unbounded retry loop is itself a failure mode.
- [ ] **Observability** — does the failure show up in a log/ledger a
      human or another system can actually find, or does it fail into
      silence?

A failure mode with no listed recovery path is not "acceptable risk" —
it's an unfinished section (§1.1).

> Source: idearium/spec-engine/templates/checklists.spec § failure_modes

### 08-build_order.md

Seeded deterministically from template `architecture` — no agent dispatched.

## Build Order

Bottom-up, §3.1 — each step must be PARSES-tier before the next starts:

1. `data/` schemas and fixtures — the shapes everything else is graded against
2. `lib/` shared utilities — zero dependency on anything above this line
3. `core/` kernel/runtime — boots on its own, no subsystem wired yet
4. Each subsystem module, one at a time, smallest unit first (§5.1)
5. `api/` routes — wires subsystems to HTTP, no UI dependency
6. `ui/` — talks only to `api/`, never reaches into `core/` or a subsystem directly
7. `docs/` — CHANGELOG and MANIFEST updated to match what was actually built,
   not what was planned

> Source: idearium/spec-engine/templates/architecture.spec § build_order

### 09-tests.md

Seeded deterministically from template `checklists` — no agent dispatched.

## Tests & Verification

Evidence tiers, in order — a component is only as done as its highest
PROVEN tier, not its highest claimed one:

- [ ] **PARSES** — the file loads without a syntax/import error
- [ ] **BOOTS** — the module initializes without throwing
- [ ] **SERVING** — it responds to at least one real call end-to-end
- [ ] **HEALTHY** — it responds correctly under its stated normal load
- [ ] **CONTRACT** — every claim in this spec's other sections (schema,
      API, events) has a passing test asserting it, not just a
      manual check

Per-component checklist:

- [ ] Every function/route has at least one test exercising it
- [ ] Every declared failure mode (see below) has a test that
      deliberately triggers it and asserts the failure is loud (§1.2)
- [ ] No stub, mock, or placeholder ships in the path marked production
      (§1.3)
- [ ] Test suite actually runs — a suite that fails to execute is not
      evidence of anything, tier PARSES included

> Source: idearium/spec-engine/templates/checklists.spec § tests