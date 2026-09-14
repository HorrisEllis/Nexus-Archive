envelope: 1
uuid: nexus-export-tool-roundtable.10fc2f80-09d7-4c22-b7e6-6d7a44aa17ec
type: tool
id: roundtable.10fc2f80-09d7-4c22-b7e6-6d7a44aa17ec
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862103
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862103
lastSeenAt: 1789332862103
fingerprint: null
payload:
  name: roundtable
  description: >-
    A real, shared, persisted multi-party conversation — the opposite of agent_council's independent
    verdicts. Every member (and the user) sees the SAME growing thread. "open" (needs topic, members
    — the user is added automatically), "post" (add a message — speaker defaults to "user"), "speak"
    (invite ONE member to respond, given the FULL shared thread as context — their real answer is
    posted back into it), "thread" (the full real conversation, in order), "close". Nothing
    auto-chains agents replying to each other — each turn is explicit, the caller decides who speaks
    next.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - open
          - post
          - speak
          - thread
          - close
      topic:
        type: string
        description: for "open"
      members:
        type: array
        items:
          type: string
        description: for "open" — agent or hat names
      roundtableId:
        type: string
        description: for post/speak/thread/close
      speaker:
        type: string
        description: for "post" — defaults to "user"
      message:
        type: string
        description: for "post"
      member:
        type: string
        description: for "speak" — who responds next
    required:
      - action
