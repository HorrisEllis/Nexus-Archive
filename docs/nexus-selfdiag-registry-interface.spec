spec:
  meta:
    name:        nexus-selfdiag-registry-interface
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-selfdiag-registry-interface-v1-0000-2026-0710-jamesbrooks-001
    status:      proposed — map only, nothing in this file is built by its existence; each part cites real verified state vs the gap
    spine:       WARP
    governing:   AXIOMS-v3.1

# ══════════════════════════════════════════════════════════════════════════════
# This spec supersedes the freeform docs/NEXUS-SELFDIAG-REGISTRY-INTERFACE-MAP
# -2026-07-10.md — same content, canonical .spec form so drift detection and the
# spec-engine can read it. Map-first per AXIOMS: build happens after this, output
# compared against these clauses, spec updated to "done" only on confirmation.
# ══════════════════════════════════════════════════════════════════════════════

part_1_self_diagnosis_loop:
  intent:      "each on-screen interaction becomes an event so the system self-diagnoses when a gated button/dropdown/input fires no effect"
  consumer_half:
    status:    DONE
    component: copilot/lib/expectation-watcher.js
    behavior:  "watches trigger->expected-follow-up pairs; emits copilot.error.detected when the follow-up never arrives; construction-time validated (§1.2). Live in copilot boot. 3/3 tests."
  producer_half:
    status:    DONE 2026-07-10 — tv-shell delegated listener emits ui.interaction + ui.interaction.gated to cortex /api/event; watcher has ui-gated-interaction-then-effect rule; loop verified 3/3 (broken button diagnosed, working button not flagged). 562 module tests.
    status_prior: TO_BUILD
    size:      small-medium
    plan:
      - "one delegated document-level listener in ui/tv-shell/index.html — capture click|change|input at document level (delegation, not per-element)"
      - "each emits ui.interaction { elementId, kind, action, expectedEffect? } POST to cortex /api/event (SSE re-broadcast path is live)"
      - "gated buttons declare data-expect (e.g. data-expect='build.started'); the listener registers that expectation; the running watcher auto-fires copilot.error.detected if the click produces no effect in time"
      - "toasts/errors surface as events the same way"
  closes:      "click -> ui.interaction -> (gated? register expectation) -> watcher -> if unfired -> copilot.error.detected -> copilot diagnoses. THE SYSTEM SELF-DIAGNOSES A BROKEN BUTTON."

part_1b_diagnose_any_broken_interaction:
  intent:      "diagnose a broken ANYTHING in the UI when interacted — not just gated (data-expect) elements. A click that throws, a dead/undefined inline handler, an unhandled promise rejection from an interaction, a handler that references a missing function — all become copilot.error.detected."
  status:      DONE 2026-07-10
  the_gap_this_closed: "part_1 only diagnosed gated controls. Non-gated elements that break silently (JS error in handler, ReferenceError from a missing function, promise rejection) produced no diagnosis."
  mechanism:
    - "window.addEventListener('error') — any uncaught error during an interaction is captured with the element that was last interacted (tracked by the delegated listener), emitted as ui.interaction.error to cortex /api/event"
    - "window.addEventListener('unhandledrejection') — async handler failures (a fetch that rejects, an await that throws) captured the same way"
    - "dead-handler probe: on click of an element with an onclick attribute, if invoking it is a no-op that throws ReferenceError/TypeError, that surfaces via the error listener with the element context"
    - "_lastInteraction correlation: the error listener attaches the most-recent interacted element (id/label/kind) so the diagnosis names WHAT the user touched, not just the stack"
  consumer:    "expectation-watcher already treats *.error as an explicit-failure; ui.interaction.error flows to copilot.error.detected directly (it IS an error event, not a missing-follow-up). copilot sees which element broke and how."
  verified:    "ui-error-diagnosis test — a throwing handler and a rejecting async handler both produce a diagnosis naming the element; a clean interaction produces none."

part_1c_sigma_deviation_and_toasts:
  intent:      "detect the four silent-failure classes at ANY runtime via sigma deviation from baseline, and show a toast every time something doesn't work as intended"
  failure_classes_covered:
    - "a click handler that never runs — part_1b (thrown/dead handler) + part_1 (gated no-effect)"
    - "an API request never initiated — a gated data-expect on the dispatching control whose expected request event never fires"
    - "a workflow that stalls before its expected event — expectation-watcher timeout rules (build/chunk/pipeline)"
    - "a control that looks responsive but does nothing — part_1 gated no-effect + sigma flatline deviation"
  real_state_found:
    - "sigma ALREADY computes deviation from a per-event-type baseline (meta/cfr/sigma.js computeSigma + event-ledger.getBaseline)"
    - "sigma-writer ALREADY emits sigma.event.warning (>=0.70) and sigma.event.halt_risk on ANY bus event that deviates — this IS the any-runtime detector"
    - "ui/toast/toast.js ALREADY exists and shows for copilot.error.detected + *.error/*.failed — but is NOT loaded in tv-shell"
  wires_closed:
    - "sigma.event.warning/halt_risk -> copilot.error.detected (a runtime deviation becomes a diagnosis + toast, not a silent bus event)"
    - "ui/toast/toast.js loaded in tv-shell + attached to the live SSE so EVERY copilot.error.detected shows a toast"
    - "toast also shows for sigma warnings directly (deviation is 'not working as intended' even without a specific broken control)"
  status:      DONE 2026-07-10

part_2_registry_context_intent:
  intent:      "each system's hook/wire/component/seam registry uses consumers + relations to map context and intent (the non-linear system map)"
  real_state:
    - "loom KINDS = [component, seam, hook, wire] — already ONE registry, the four named kinds"
    - "loom graph() already returns { nodes: hooks, edges: wires(from->to) } — the RELATION graph exists as data"
  the_gap:     "a wire says 'hook A -> hook B' but NOT why (intent) or what-context. That semantic layer is missing — the right instinct."
  design:
    - "components register consumers (who depends on me) + relations (what I produce/consume, and each wire's intent)"
    - "loom schema extends: intent on wires, consumes/produces on components"
    - "graph() becomes a queryable context+intent graph: 'if guardian SEAM breaks, what intents fail downstream?' — real impact analysis, not a manual grep"
    - "pairs with the associative system-lattice (wired this session): loom = declared/structural (what's wired + why); lattice = observed/behavioral (what actually co-activates). Together = full context."
  status:      DONE 2026-07-10 — graph() now carries intent on wires + consumes/produces on components; contextGraph() resolves wires to component relations with intent; impactOf() answers "if X breaks, who fails and what intents break". Endpoints: GET /api/context-graph, GET /api/impact/:id. 5/5 tests.
  verdict:     "medium build, high architectural payoff — turns registries from bookkeeping into a queryable nervous system"

part_3_unify_copilot_cli:
  intent:      "the floating menu CLI is the same co-pilot CLI as everywhere else — via the API if needed"
  status:      DONE 2026-07-10
  honest_finding: "the audit corrected the premise. The 10 CLIs are NOT divergent copilots — they are purpose-built surfaces (auth/client, ncp-client, cli-detector = infrastructure; guardian/cli = bridge command sender; cockpit/cli = ForgeCLI via SISO bus; nexus-cli = registry-driven grammar CLI). Forcing structured-command CLIs through copilot's prompt path would BREAK them. The real unification target is the conversational last-resort."
  what_was_built: "cli/nexus-cli.js dead-ended on 'unknown: <input>' with trie suggestions when its grammar engine AND Qwen reasoning layer both failed. Now its FINAL resolver is copilot (_copilotAsk -> copilot :3750 /api/prompt) — the SAME agent (all 8 tools) the tv-shell floating input reaches. Structured commands still resolve fast locally; anything else flows to the one copilot. Same copilot everywhere, many front doors."
  degrade:     "copilot unreachable or malformed response -> ok:false, CLI falls through to trie suggestions, never hangs (§1.2). 3/3 tests."
  not_done:    "did NOT force the infrastructure CLIs (auth/ncp/detector) or the ForgeCLI command surface through copilot — that would be conversion-for-its-own-sake and would break their real contracts."

part_4_copilot_as_interface:
  intent:      "copilot AS the entire interface — tv-ui, spotlight, nerve, a cursor, changing accent/text/font at will; the orchestrator's full-system UI built for copilot"
  real_primitives_exist:
    - "tv-shell UI (shell) — real"
    - "Spotlight (window.CP.exec, CSS-variable driven) — real, copilot drives it"
    - "Nerve (attention layer) — real"
    - "tutorial cursor + ghost-typing + CFR->CSS variable wire — real (built this session); PROVES copilot can move a cursor and change live UI colors via CSS variables"
    - "8 agent-tools — copilot can already act"
  the_gap:
    - "get_ui_state tool — copilot reads current Nerve snapshot + DOM so it knows what's on screen (can act but can't yet SEE)"
    - "set_ui_theme tool — copilot writes accent/text/font CSS variables (tutorial already writes --cp-tension; generalize to --ac-h/s/l, --font, etc.)"
    - "copilot-driven control surface — orchestrator control panel where copilot renders/adjusts the UI live"
  verdict:     "the product vision, genuinely large — but every primitive exists. Assembly, not invention. Deliberately LAST: build once the substrate (self-diag, recall, registry-context) is stable, else it gets rebuilt each time an underlying shape changes."

leverage_order:
  1: "part_1 producer half — closes the self-diagnosis loop whose consumer half is already live. highest impact/effort."
  2: "part_3 unify CLIs — small, low-risk, makes 'one copilot' true"
  3: "recall-across-conversations (prior roadmap) — real infra (push-recall, system-lattice, chat_log), mostly unwired; gives copilot memory"
  4: "part_2 registry context+intent graph — the backbone for real system understanding"
  5: "part_4 copilot-as-interface — large, last, all primitives exist"

law:
  - "nothing here needs a new subsystem — all wiring + a semantic layer on registries that already have the right shape"
  - "the pieces exist; the connective tissue is the work — the pattern that has held all session"
