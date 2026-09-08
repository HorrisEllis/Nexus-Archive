envelope: 1
uuid: nexus-export-tool-nexus_wake_events.6aaa468b-a5f7-4d3b-a1c8-ff2c09cd898e
type: tool
id: nexus_wake_events.6aaa468b-a5f7-4d3b-a1c8-ff2c09cd898e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725021
source: lib/agent-tools
payload:
  name: nexus_wake_events
  description: >-
    Real, persistent record of "hey nexus, ..." moments said in any connected agent tab — captured
    server-side the instant they happen, whether or not anything was live-listening at that second.
    "pending" (optional limit, default 20) lists every real, not-yet-consumed event, oldest first,
    each with the real request text and the agent/chatUrl/account it came from. "consume" (needs id;
    optional answer — the real response given) marks one handled. Use this to actually answer
    someone who said "hey nexus" in a browser tab, instead of relying on a human happening to be
    watching a terminal at that exact moment.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - pending
          - consume
      limit:
        type: number
        description: for "pending" — max events to return
      id:
        type: string
        description: for "consume" — the real wake event id
      answer:
        type: string
        description: for "consume" — the real answer given
    required:
      - action
