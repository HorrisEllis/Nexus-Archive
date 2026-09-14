envelope: 1
uuid: nexus-export-tool-nexus_wake_events.197d1c2c-04c4-499e-a227-90ec1aabe9bf
type: tool
id: nexus_wake_events.197d1c2c-04c4-499e-a227-90ec1aabe9bf
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862091
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862091
lastSeenAt: 1789332862091
fingerprint: null
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
