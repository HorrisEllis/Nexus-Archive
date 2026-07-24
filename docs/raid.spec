spec:
  meta:
    name:        raid
    version:     6.3.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-raid-v1-0000-2026-0615-jamesbrooks-001
    purpose: >
      Provider routing. Ollama always first. Claude always last. Weight table learns from outcomes. _decide() is a pure function — same inputs always produce same decision.

  dispatch_model:
    note: >
      v6.1: CLUSTER_CHAINS (hardcoded per-cluster preference array) retired.
      Replaced by computed constraint-then-fitness, per
      seam-component-registry.spec §10. Same allow-list problem as that
      spec's role_definitions correction, applied to dispatch — a
      hand-authored preference order can't respond to observed drift; a
      computed candidate set does.
    layer_1_constraints: >
      Deny-only exclusion. Partially already built: _agentAvailable()
      (offline check), consecutiveFails>=3 (ollama LAW_I failure
      tracking), callCount>=5 && successRate<0.2 (poor track record).
      Extended this version to also exclude role status=violated and any
      candidate whose dispatch would emit an event forbidden by every
      currently-confirmed role (registry §2 multi_role). Survivors are
      NOT ranked here — just legal.
    layer_2_fitness: |
      fitness = SNR_tier_gate(task)
              → role_confidence(component, role)     [fidelity, registry §6]
              × health(component)                    [existing RAID _health snapshot]
              × topological_proximity(component)      [CFR _byComponent edge, docs/cfr.spec]
      Highest-fitness survivor gets the dispatch. Agent preference is
      emergent from role_confidence/health, not array position — re-ranks
      automatically as roles drift; new components become eligible the
      moment they register a role, no array to hand-edit.
    blocked_on: "docs/cfr.spec _byComponent edge — topological term is a hard dependency, not yet built."

  invariants:
    LAW_I:   "Ollama always first for non-specialist clusters"
    LAW_III: "Claude always last — reserve, never primary"

  tool_approval_gate:
    function: "_approveTool(source, command, opts)"
    purpose: >
      Choke point for real command execution (not just LLM dispatch).
      Reuses cortex/contract/index.js's CONTRACTS — one source of truth
      for agent permissions, not a second tools.json. Fail-closed:
      unregistered sources fall back to the _default contract, which
      denies 'tool' explicitly.
    consumer: guardian/agents/co-pilot — see docs/copilot.spec
    tests: "9/9 PASSING — tests/modules/raid-approve-tool.test.js"

  # ── ADDENDUM 2026-07-21 (v6.3.0) — RAID as universal entry point ──
  universal_router:
    principle: >
      James, 2026-07-21: "the request comes from co-pilot or one of the UIs,
      but goes to RAID — that way the start point doesn't matter, as long as
      it goes to RAID." RAID is the switchboard for the WHOLE system, not just
      provider selection. Any surface (Co-pilot, any UI, CLI, SSE flow) funnels
      every request to RAID; RAID routes; no surface knows about any fulfilling
      system; every fulfilling system is hot-swappable.
    two_decisions: >
      RAID now decides TWO things, on two independent paths that don't touch
      each other: (1) which AI AGENT — the existing _decide() (ollama first,
      claude last, pure); (2) which SYSTEM fulfills a request — the NEW router
      (cortex/core/raid/router.js).
    mechanism:
      - "cortex/core/raid/envelope.js — the universal request shape. Every surface wraps its request in make(intent, {from, payload, capability?}). The envelope accumulates a `trail` (every system + status + ts it passed through) — the 'input → tagged → output, every hop logged' ledger."
      - "Any surface emits raid.route.request { envelope }."
      - "Router resolves the target via the LIVE capability-registry (Phase B) — hot-swappable: swap the provider, the registry re-announces, RAID routes to the new one, no surface changes. Capability namespace = owning system (idearium.gap.find → idearium), no separate mapping table (§10.1)."
      - "Router stamps ROUTED, emits raid.route.decided { envelope, capability }. Target system subscribes and checks envelope.target === its id — RAID names the target, never calls it (fully decoupled)."
      - "Target calls fulfill() → raid.route.fulfilled/failed. Surface hears the answer over SSE."
      - "No match → raid.route.no_route, honest, never silently dropped (§1.2)."
    verified: >
      Live against the real 217-capability registry: 'gap' from copilot → idearium,
      'guardian' from cli → guardian, both resolved with no surface knowing the
      target; nonsense intent → no_route. 10 unit tests (test-raid-router.js) incl.
      start-point-agnostic (R-001) and hot-swap (R-002). §14.4: router never
      consumes its own emissions.
    not_yet: >
      Surfaces still call systems the old (hard-pointer) way in most paths. This
      landed the SPINE + proved it with the router live in cortex boot. Converting
      each surface to route-through-RAID is the incremental follow-on — one surface
      at a time, each verified, system booting throughout (the bottom-up plan).
