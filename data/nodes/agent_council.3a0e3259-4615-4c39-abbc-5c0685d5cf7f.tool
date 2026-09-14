envelope: 1
uuid: nexus-export-tool-agent_council.3a0e3259-4615-4c39-abbc-5c0685d5cf7f
type: tool
id: agent_council.3a0e3259-4615-4c39-abbc-5c0685d5cf7f
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862102
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862102
lastSeenAt: 1789332862102
fingerprint: null
payload:
  name: agent_council
  description: >-
    Convene multiple real agents on the same decision, independently — no member sees another's
    answer before giving their own. Needs question and members (agent names like
    claude/perplexity/gemini, or forged hat names — resolved to their base agent). Returns every
    real verdict, including real failures (an agent that could not answer is recorded, not silently
    dropped). This tool only COLLECTS verdicts — it does not decide anything. Weighing the verdicts
    into an actual decision still goes through the same RAID/constitutional governance every other
    consequential action here does.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - convene
      question:
        type: string
        description: the exact question every member is asked, identically
      members:
        type: array
        items:
          type: string
        description: agent names or forged hat names
    required:
      - action
