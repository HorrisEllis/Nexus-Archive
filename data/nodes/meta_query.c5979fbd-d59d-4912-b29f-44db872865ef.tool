envelope: 1
uuid: nexus-export-tool-meta_query.c5979fbd-d59d-4912-b29f-44db872865ef
type: tool
id: meta_query.c5979fbd-d59d-4912-b29f-44db872865ef
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725016
source: lib/agent-tools
payload:
  name: meta_query
  description: >-
    Real analytical/perception subsystems: alk_query/alk_stats (causal ledger —
    record/resolve/rewind history), alk_perception_classify (telemetry -> state classification),
    bda_compute (pendulum regime from observations)/bda_detect (gap detection in text),
    cfr_sigma/cfr_regime/cfr_delta (causal field math — sigma, regime from
    coherence/friction/resonance/entropy, delta between two states), gap_analyze (the real
    gap-hunter — logical/evidential/temporal/etc gap taxonomy on a text), lattice_get_edge
    (associative lattice — real edge weight between two nodes), liminal_analyze
    (code/text/field/music/relational gap detection — the broadest analyzer). RFR2 is deliberately
    not here — reach it via nexus_intelligence's "mastermind" action, its one real bridge; a second
    path to it here would compete with that. spatial/telemetry-codec/topo-kernel are stateful engine
    classes, not one-shot functions — not yet wrapped, needs instance lifecycle management like
    cos_simulate has.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - alk_query
          - alk_stats
          - alk_perception_classify
          - bda_compute
          - bda_detect
          - cfr_sigma
          - cfr_regime
          - cfr_delta
          - gap_analyze
          - lattice_get_edge
          - liminal_analyze
      actor:
        type: string
        description: for alk_query
      intent:
        type: string
        description: for alk_query
      since:
        type: number
        description: for alk_query
      until:
        type: number
        description: for alk_query
      limit:
        type: number
        description: for alk_query
      telemetry:
        type: object
        description: for alk_perception_classify
      observations:
        type: array
        description: for bda_compute
      text:
        type: string
        description: for bda_detect, gap_analyze
      signals:
        type: object
        description: for bda_detect
      role:
        type: string
        description: for bda_detect
      event:
        type: object
        description: for cfr_sigma
      baseline:
        type: object
        description: for cfr_sigma
      cfrState:
        type: object
        description: for cfr_sigma
      intervalMs:
        type: number
        description: for cfr_sigma
      field:
        type: object
        description: for cfr_regime — { coherence, friction, resonance, entropy }
      prev:
        type: object
        description: for cfr_delta
      curr:
        type: object
        description: for cfr_delta
      opts:
        type: object
        description: for gap_analyze, liminal_analyze
      from:
        type: string
        description: for lattice_get_edge
      to:
        type: string
        description: for lattice_get_edge
      input:
        type: string
        description: for liminal_analyze
    required:
      - action
