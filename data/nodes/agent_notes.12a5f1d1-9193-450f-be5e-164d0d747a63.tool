envelope: 1
uuid: nexus-export-tool-agent_notes.12a5f1d1-9193-450f-be5e-164d0d747a63
type: tool
id: agent_notes.12a5f1d1-9193-450f-be5e-164d0d747a63
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862090
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862090
lastSeenAt: 1789332862090
fingerprint: null
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
