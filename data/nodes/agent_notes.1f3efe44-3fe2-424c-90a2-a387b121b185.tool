envelope: 1
uuid: nexus-export-tool-agent_notes.1f3efe44-3fe2-424c-90a2-a387b121b185
type: tool
id: agent_notes.1f3efe44-3fe2-424c-90a2-a387b121b185
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725020
source: lib/agent-tools
payload:
  name: agent_notes
  description: >-
    A real, editable log of learned constraints and workarounds, per agent — distinct from
    agent_capability (which only ever measures passively from other tables). Use this to write down
    something you actually discovered mid-task that would otherwise evaporate at session end: a real
    gotcha in how a function behaves, a token-limit workaround that worked, a persistence quirk.
    "note" (needs agent, body; optional kind:
    "token-limit"/"workaround"/"constraint"/"persistence"/"other", source, relatesTo, supersedes — a
    prior note's uuid this corrects) writes one. "list" (needs agent, optional kind) reads every
    real note for that agent, newest first, with superseded notes flagged rather than hidden.
    "agents" lists every agent with at least one real note. Write specific, real lessons — not vague
    summaries; a note only earns its keep if a future reader can act on it directly.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - note
          - list
          - agents
      agent:
        type: string
        description: which agent this note is about
      body:
        type: string
        description: for "note" — the real, specific lesson
      kind:
        type: string
        enum:
          - token-limit
          - workaround
          - constraint
          - persistence
          - other
      source:
        type: string
        description: who/what discovered this
      relatesTo:
        type: string
        description: a real file/component/tool this concerns
      supersedes:
        type: string
        description: uuid of an older note this one corrects
    required:
      - action
