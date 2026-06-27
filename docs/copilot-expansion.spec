spec:
  meta:
    name:     copilot-expansion
    version:  1.0.0
    uuid:     nexus-copilot-expansion-v1-0000-2026-0627-jamesbrooks-001
    status:   active
    purpose: >
      Everything NEXUS can do, co-pilot can access.
      Co-pilot learns and expands itself — user describes a capability,
      co-pilot maps it, specs it, builds the module bottom-up, runs QC,
      gets it merged. Ollama is the primary model, Guardian is the fallback.
      Axioms are manageable via CLI and co-pilot. Everything is contractual.

  axioms_enforced:
    - §AX-1   Map first, always
    - §AX-3   Gaps asked, never assumed
    - §AX-7   Spec first, build second
    - §AX-8   Build in phases, bottom-up
    - §AX-10  Changelog every session
    - §LAW-II Disk before behavior

  audit:
    EXISTS_AND_WORKS:
      - constitutional-ai.js          # axiom checking — has check(), but no add/remove
      - lib/constitutional-ai.js      # IDENTITY_KERNEL with typed axioms
      - lib/contract-queue.js         # contract schema + disk write ✓
      - lib/contract-poller.js        # stuck contract detection ✓
      - cortex/intelligence/intuition.js   # fast faculty ✓
      - cortex/intelligence/mastermind.js  # strategic faculty ✓
      - cortex/intelligence/adversarial.js # probe + ping-pong ✓
      - ollama/server.js              # sovereign ollama bridge :3749 ✓
      - copilot/server.js             # sovereign co-pilot :3750 ✓
      - cortex/core/raid/snr-filter.js     # quality gate (invariant/pattern/AI)

    EXISTS_BUT_WRONG_PLACE:
      - guardian/agents/co-pilot/index.js  # 996 lines — move to copilot/
      - guardian/agents/ollama.js          # move to ollama/agent.js
      - guardian/agents/index.js           # orchestration logic — move to copilot/

    NEEDS_BUILDING:
      - copilot/axiom-manager.js           # add/remove/list axioms via CLI + co-pilot
      - copilot/lifeline.js                # Ollama primary, Guardian fallback
      - copilot/module-builder.js          # co-pilot builds its own modules
      - copilot/qc-pipeline.js             # RAID/SNR/Adversarial quality gate
      - lib/capability-registry.js         # every NEXUS capability registered
      - cli/axiom.js                       # CLI: axiom add/remove/list/freeze

  systems_map:

    CO-PILOT :3750:
      role:     "Mind — user intent, context assembly, tool routing"
      owns:
        - Continuous stream (500 events, live from Cortex + Guardian SSE)
        - INTUITION faculty (reads Cortex patterns, crystals, sigma)
        - ANALYSIS faculty (7-layer context + Ollama via LIFELINE)
        - ADVERSARIAL faculty (probes + ping-pong every 60s)
        - Module builder (spec → build → QC → merge)
        - Axiom manager (add/remove/list via CLI and conversation)
        - Capability registry reader (knows everything NEXUS can do)
      does_NOT_own:
        - Model inference (that's LIFELINE → Ollama → Guardian)
        - Memory (that's Cortex)
        - Job dispatch (that's Guardian)
        - File execution (that's Emerge + autonomous-loop)

    LIFELINE (copilot/lifeline.js):
      role:     "Model router — Ollama primary, Guardian fallback"
      priority:
        1: Ollama Bridge :3749  — local, zero cost, sovereign
        2: Guardian :7820       — NCP providers (claude, chatgpt, mistral, gemini)
        3: Error with context   — never silent
      lifeline_protocol:
        - Send to Ollama
        - If confidence_score < threshold (0.75): escalate to Guardian NCP
        - Guardian NCP uses best available provider (RAID decides)
        - Result tagged with: provider_used, confidence, escalated:bool
        - All results written to Cortex chat_log via cortex-write
      note: >
        Ollama can ask Guardian if it needs help — that's the lifeline.
        When Ollama's own confidence is low, it doesn't fail silently.
        It escalates to the NCP layer where a better model can answer.

    AXIOM MANAGER (copilot/axiom-manager.js):
      role:     "Add, remove, list, freeze axioms via CLI + co-pilot"
      storage:
        primary:   JAA table 'law_violations' (existing) + new 'axioms' table
        file:      docs/AXIOMS-runtime.json  (append-only, never edit AXIOMS-v1.0.md)
      tiers:
        IMMUTABLE: §1.x, §2.x, §3.x, §4.x, §5.x  (from AXIOMS-v1.0.md, frozen)
        RUNTIME:   User-added axioms, can be removed via CLI with confirmation
        PATTERN:   Auto-promoted from crystallised patterns above 0.9 confidence
      CLI:
        nexus axiom list             → all axioms with tier + status
        nexus axiom add "§X.Y text"  → add runtime axiom, write to JAA + file
        nexus axiom remove §X.Y      → remove runtime axiom (immutable: reject)
        nexus axiom freeze §X.Y      → promote runtime → immutable
        nexus axiom check "prompt"   → run constitutional check on arbitrary text
      co-pilot:
        "add axiom: X"          → calls axiom-manager.add()
        "list axioms"           → calls axiom-manager.list()
        "remove axiom §X.Y"     → calls axiom-manager.remove() with confirmation
        "is X allowed?"         → calls constitutional-ai.check()

    MODULE BUILDER (copilot/module-builder.js):
      role:     "Co-pilot builds its own modules from user description"
      flow:
        1. User: "I want co-pilot to be able to do X"
        2. Module-builder: map the capability → check capability-registry (already exists?)
        3. If missing: generate spec using nexus-system-foundation template
        4. Spec → RAID/SNR quality gate (does it follow axioms + architecture?)
        5. If fail → back to co-pilot with specific failure reason
        6. If pass → write contract to relevant system's input/ folder
        7. Contract-poller picks it up → dispatches to Emerge for build
        8. Emerge builds bottom-up (L0 → L1 → L2 → L3 → L4 → L5)
        9. Output written to system output/ folder
        10. QC pipeline runs adversarial review
        11. Pass → tagged READY_FOR_BUILD, merged to codebase
        12. Fail → back to co-pilot with failure detail + diff
      contract_shape:  # extends contract-queue.js CONTRACT shape
        type:          'module_build'
        spec:          string    # the generated spec
        capability:    string    # what it enables
        targetSystem:  string    # which system it extends
        qcStatus:      enum      # pending|in_review|passed|failed
        qcFailReason:  string
        iterations:    number    # how many QC cycles

    QC PIPELINE (copilot/qc-pipeline.js):
      role:     "RAID/SNR + Adversarial quality gate for module contracts"
      stages:
        1. SNR filter:     does the spec follow invariants? (zero tokens)
        2. Axiom check:    does it violate any law? (constitutional-ai)
        3. Architecture:   does it follow nexus-system-foundation layers?
        4. RAID approval:  _approveTool() on the proposed build action
        5. Adversarial:    send to adversarial.pingBoth() with the spec as prompt
        6. Contradiction:  if INTUITION and MASTERMIND disagree on quality → fail
      result:
        { passed, stage_failed, reason, suggestions, confidence }
      on_fail:
        - Tag contract with qcStatus: 'failed' + qcFailReason
        - Write to contract's output/ folder
        - Co-pilot reads failure, synthesises fix with user if needed
        - Re-submit → new iteration

    CONTRACT QUEUE + FOLDER SYSTEM:
      # Already built. Enhancement: add progress tracking + fulfillment check
      progress_states:
        RECEIVED:     written to input/ folder
        ACCEPTED:     system acknowledged
        IN_PROGRESS:  system is working on it
        QC_REVIEW:    in quality check
        PASSED:       QC passed, ready to build
        BUILT:        Emerge built it
        VERIFIED:     tests pass
        COMPLETE:     merged, moved to Cortex archive
        FAILED:       failed QC, back to co-pilot
        STUCK:        >45s with no progress, re-queued
      fulfillment_check:
        - On recovery: read contract + check JAA for evidence of completion
        - If component exists in component-registry: mark COMPLETE
        - If still building: restore to IN_PROGRESS
        - If no trace: re-run from last known state
      last_interaction_map:
        fromSystem:     who last touched it
        fromComponent:  which component
        toSystem:       where it's going
        toComponent:    which component
        why:            human-readable reason
        ts:             timestamp
        progress:       current state enum

  migration_plan:
    from_guardian_to_copilot:
      - guardian/agents/co-pilot/index.js → deprecated (copilot/server.js is canonical)
      - guardian still proxies /api/guardian/copilot/prompt → copilot:3750
      - No breaking change. Proxy stays forever.

    from_guardian_to_ollama:
      - guardian/agents/ollama.js → ollama/agent.js (wrap existing logic)
      - guardian still boots ollama via SOFT phase (unchanged)
      - ollama/server.js is the new primary surface
      - guardian uses ollama/server.js via HTTP, not internal import

    capability_registry:
      - Read from: component-registry (all registered components)
      - Augment with: what each component DOES (description, examples, when to use)
      - Co-pilot reads this to know what tools it has
      - User asks "can you X?" → co-pilot checks registry → routes or says what's missing

  phases:
    - id: 1
      name: copilot/axiom-manager.js + cli/axiom.js
      status: next
      builds: [add/remove/list axioms, CLI surface, co-pilot verbs]

    - id: 2
      name: copilot/lifeline.js
      status: pending
      builds: [Ollama primary, Guardian fallback, confidence-gated escalation]
      deps: [ollama/server.js ✓, guardian :7820 ✓]

    - id: 3
      name: lib/capability-registry.js
      status: pending
      builds: [every NEXUS capability indexed, co-pilot reads it]
      deps: [component-registry.js ✓]

    - id: 4
      name: copilot/module-builder.js
      status: pending
      builds: [spec generation, contract creation, bottom-up build flow]
      deps: [phases 1-3, contract-queue ✓, emerge :4242]

    - id: 5
      name: copilot/qc-pipeline.js
      status: pending
      builds: [RAID/SNR/Adversarial quality gate, iteration loop]
      deps: [phase 4, constitutional-ai ✓, adversarial ✓]

    - id: 6
      name: contract progress tracking
      status: pending
      builds: [fulfillment check, last-interaction map, folder watch + re-queue]
      deps: [contract-queue.js ✓, contract-poller.js ✓]
