spec:
  meta:
    name:        architect
    version:     2.0.0
    foundation:  nexus-system-foundation@1.0.0
    port:        3747
    uuid:        nexus-architect-v2-0000-2026-0625-jamesbrooks-001
    purpose: >
      Spec builder, architecture viewer, and template library.
      The design surface for the entire NEXUS ecosystem.

      v2 expands from spec wizard + canvas to:
        - Template Library: organism/behavior/genome/ecosystem templates
        - Architecture Viewer: live map of all registered components + wires
        - Spec Language: read/write/validate the NEXUS spec format
        - CLI-first: every feature available as a CLI command before UI exists
        - API contract: every route declared before implementation
        - Interaction contract: published and hash-verified by orchestrator

  build_order:
    §3.1 bottom-up only:
      1: schemas (all data shapes declared as JSON Schema)
      2: template library (static — data only, no logic)
      3: spec parser/validator (pure function — in, out, errors)
      4: blueprint engine (derive topology from spec)
      5: hook registry (named typed contracts)
      6: CLI commands (all features accessible without UI)
      7: HTTP API (routes declared before implementation)
      8: interaction contract (published at /contract)
      9: architecture viewer (read from component registry + bus)
      10: template browser UI (last — uses all layers below)
      11: canvas UI (visual diagram builder — last of all)


  # ── Core ─────────────────────────────────────────────────────────────────
  schemas:
    Spec:
      uuid, name, version, spec_type, meta, axioms[], constraints[],
      modules[], hooks[], events[], schemas[], gaps[], tiers[]

    Hook:
      uuid, name, direction, event_type, wire_type, schema,
      contract_version, failure_mode, registeredBy, ts

    Template:
      uuid, id, label, spec_type, description, icon, tags[],
      body (full spec text), variables[], example_output

    ArchitectureNode:
      id, comp_id, comp_type, namespace, label, port,
      provides[], requires[], hooks{ in[], out[] }, position

    ArchitectureEdge:
      id, from_node, from_hook, to_node, to_hook, wire_type

    Blueprint:
      id, name, version, source, snrScore, hooks[], surfaces[],
      constraints[], gaps[], tensions[], baseline


  spec_dimensions:
    1:  meta      (name, version, purpose, uuid)
    2:  intent    (what it does, one sentence)
    3:  axioms    (which NEXUS axioms apply)
    4:  constraints (must/must-never rules)
    5:  modules   (components and what each exports)
    6:  edges     (connections between modules, event flows)
    7:  gaps      (known unknowns, explicitly unresolved)
    8:  tiers     (T0=schema, T1=structure, T2=logic, T3=synthesis)
    9:  events    (emits and handles)
    10: schemas   (data shapes as JSON Schema)
    11: tests     (required before shipping)


  # ── Template Library ─────────────────────────────────────────────────────
  template_library:
    description: >
      A curated library of spec templates covering every organism class in
      nexus-organisms.spec. A template is a complete, parameterized spec
      that can be filled in and built immediately.

      Idea → pick template → fill variables → FORGE builds it.
      This is the "as easy as possible" goal: the foundation is already built,
      the architecture is declared, the build is deterministic.
      Ideas flow freely on top.

    template_types:
      organism:
        description: Autonomous service unit with bus interface and hooks
        variables: [id, label, description, provides[], triggers[], effects[]]
        output: full organism spec ready for FORGE build

      behavior:
        description: Cross-cutting modifier — event interceptor, no UI
        variables: [id, label, trigger_event, effect_operation, config[]]
        output: behavior spec

      automation:
        description: Watches bus, triggers actions — no user interaction
        variables: [id, label, trigger_condition, action, dispatch_to]
        output: automation organism spec

      orchestration:
        description: Multi-provider sequential pipeline
        variables: [id, label, steps[{provider, prompt_template}], output_merge]
        output: pipeline organism spec

      cognitive:
        description: Ollama-powered reasoning organism
        variables: [id, label, model_preference, system_prompt, input_shape, output_shape]
        output: cognitive organism spec

      genome:
        description: Species definition for a class of work
        variables: [id, label, archetypes[], behaviors[], layout_rules[]]
        output: genome spec

      ecosystem:
        description: Complete installable configuration
        variables: [id, label, genome, behaviors[], recipes[], description]
        output: ecosystem spec

      service:
        description: NEXUS HTTP service (new system service)
        variables: [id, label, port, routes[], events{emits[], handles[]}]
        output: full service spec with interaction contract

      cli_command:
        description: New CLI command wired to grammar engine
        variables: [command_name, grammar[], description, handler_fn, returns]
        output: CLI command spec

    template_catalogue:
      # Starter set — expand each session
      - id: tmpl.automation.gap-healer
        label: Gap Healer
        desc: Watches for high-severity gaps, auto-dispatches repair job to Ollama

      - id: tmpl.automation.seam-watchdog
        desc: Detects stalled SEAM queues, re-dispatches after timeout

      - id: tmpl.orchestration.pipeline
        label: Multi-Provider Pipeline
        desc: Sequential prompt chain across N providers

      - id: tmpl.orchestration.consensus
        label: Provider Consensus
        desc: Same prompt to N providers, vote/merge result

      - id: tmpl.orchestration.critique-loop
        label: Critique Loop
        desc: Generate → critique → revise (N rounds, configurable)

      - id: tmpl.cognitive.spec-generator
        label: Spec Generator
        desc: Free text description → complete FORGE-format spec

      - id: tmpl.cognitive.gap-analyst
        label: Gap Analyst
        desc: Open gaps → pattern analysis → repair proposals to Idearium

      - id: tmpl.service.nexus-service
        label: New NEXUS Service
        desc: Full service template: port, routes, health, contract, boot sequence

      - id: tmpl.behavior.rate-limiter
        label: Rate Limiter
        desc: Throttle any organism output hook

      - id: tmpl.genome.forge-session
        label: Forge Session Genome
        desc: Complete organism set for a build session

    api_routes:
      - GET  /api/templates               — list all templates
      - GET  /api/templates/:id           — get template by id
      - POST /api/templates/:id/apply     — apply variables, return filled spec
      - POST /api/templates              — register a new template
      - GET  /api/templates/search?q=    — search templates by tag or text


  # ── Architecture Viewer ───────────────────────────────────────────────────
  architecture_viewer:
    description: >
      Live map of the entire NEXUS ecosystem — every registered component,
      every declared hook, every active wire. Read from component registry
      and cortex patterns. Never invented — derived from actual running state.

      Code first: the component registry already has the data.
      CLI first: /arch map shows it as text before any UI.
      API: /api/arch/map returns the full graph as JSON.
      UI: canvas renders it visually (last).

    data_sources:
      - lib/component-registry.js (all registered components)
      - architect/src/hooks/Registry.js (all hooks)
      - guardian server.js (all NCP providers and job flows)
      - cortex intelligence patterns (crystallized event flows)
      - JAA event_log (actual event sequences = real edges)

    node_types:
      service:      Hexagon — NEXUS services (Guardian, Cortex, etc.)
      organism:     Circle — new organism classes
      behavior:     Diamond — cross-cutting behaviors
      ui:           Rectangle — UI surfaces

    edge_types:
      bus_event:    Solid arrow — bus publish/subscribe
      ncp:          Dashed arrow — NCP tab dispatch
      http:         Dotted arrow — HTTP seam call
      wire:         Double arrow — declared hook wire

    views:
      topology:     Full system map — all nodes and edges
      service:      Single service — all its hooks and connections
      flow:         Event flow — trace a specific event type through the system
      gaps:         Gap map — where structural holes exist

    cli_commands:
      arch map              — print full topology as text tree
      arch map --service X  — show one service and its connections
      arch flow <event>     — trace event through system
      arch gaps             — show structural gaps (unconnected hooks, etc.)
      arch export           — export topology to JSON

    api_routes:
      - GET  /api/arch/map                — full component graph
      - GET  /api/arch/map/:service       — single service subgraph
      - GET  /api/arch/flow/:event_type   — event trace
      - GET  /api/arch/gaps               — structural gaps
      - POST /api/arch/export             — export to JSON/SVG


  # ── Existing modules (unchanged from v1) ─────────────────────────────────
  existing_modules:

    wizard:
      description: >
        11-dimension spec builder. One dimension at a time.
        Progress dots. Summary after each step.
        BUILD NOW dispatches to spec-compiler.
        SAVE TO PROJECTS saves to Idearium.

    canvas:
      description: >
        Visual architecture builder. Drag-and-drop nodes.
        Five chip types: module, event, schema, constraint, test.
        Edges = dependencies and event flows.
        Export to .spec. Import from .spec.
        v2: also renders architecture_viewer output.

    hook_registry:
      description: >
        Registers named hooks with typed contracts.
        Every hook: name, signature, behavioral contract.
        Hooks are seams — places where behavior can be injected
        without modifying the core.

    interaction_contract:
      description: >
        Publishes the system's interaction contract at /contract.
        Orchestrator fetches and hash-verifies on registration.
        Trust state set. Routes declared before implementation.


  # ── Routes ────────────────────────────────────────────────────────────────
  routes:
    health:          GET  /health
    contract:        GET  /contract
    spec_build:      POST /api/spec/build
    spec_get:        GET  /api/spec/:id
    canvas_export:   POST /api/canvas/export
    canvas_import:   POST /api/canvas/import
    hooks_register:  POST /api/hooks/register
    hooks_list:      GET  /api/hooks
    # v2 — template library
    templates_list:  GET  /api/templates
    templates_get:   GET  /api/templates/:id
    templates_apply: POST /api/templates/:id/apply
    templates_new:   POST /api/templates
    templates_search:GET  /api/templates/search
    # v2 — architecture viewer
    arch_map:        GET  /api/arch/map
    arch_service:    GET  /api/arch/map/:service
    arch_flow:       GET  /api/arch/flow/:event_type
    arch_gaps:       GET  /api/arch/gaps
    arch_export:     POST /api/arch/export


  # ── v2 handshake components ───────────────────────────────────────────────
  handshake:
    components:
      - id: architect.spec.build
        grammar: [architect build, build spec, spec build, sb]
        route: { method: POST, path: /api/architect/spec/build }

      - id: architect.template.list
        grammar: [templates, list templates, show templates]
        route: { method: GET, path: /api/architect/templates }

      - id: architect.template.apply
        grammar: [apply template, use template, from template]
        route: { method: POST, path: /api/architect/templates/:id/apply }

      - id: architect.arch.map
        grammar: [arch map, architecture map, show architecture, system map]
        route: { method: GET, path: /api/architect/arch/map }

      - id: architect.arch.gaps
        grammar: [arch gaps, structural gaps, what is missing]
        route: { method: GET, path: /api/architect/arch/gaps }

      - id: architect.hooks.list
        grammar: [architect hooks, hooks]
        route: { method: GET, path: /api/architect/hooks }

      - id: architect.canvas.export
        grammar: [architect canvas export, canvas export]
        route: { method: POST, path: /api/architect/canvas/export }


  ui:
    type: panel in nexus-shell
    hotswap: true
    panels:
      - WIZARD — 11-dimension spec builder, step by step
      - TEMPLATES — template library browser + variable filler
      - ARCHITECTURE — live system map, service view, event flow trace
      - CANVAS — visual architecture drag-and-drop + wire viewer
      - HOOKS — registered hook registry with contracts
