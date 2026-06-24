spec:
  meta:
    name:        raid
    version:     6.2.0
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
