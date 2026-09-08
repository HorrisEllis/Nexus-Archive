envelope: 1
uuid: nexus-export-tool-ask_james.0b848646-4358-4995-ab21-c2221eb6f72f
type: tool
id: ask_james.0b848646-4358-4995-ab21-c2221eb6f72f
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725061
source: lib/agent-tools
payload:
  name: ask_james
  description: >-
    The final rung on the escalation ladder — use this ONLY after trying to figure something out
    and, where relevant, escalating through lifeline's AI chain, and still being genuinely blocked.
    Never a substitute for trying first. Actions: "ask" (needs needs + why, optional
    whatWouldUnblock + exhaustedLifeline — logs a real durable question), "list" (pending questions,
    optional includeAnswered), "answer" (needs uuid + answer — James responds), "check" (needs uuid
    — has it been answered yet).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - ask
          - list
          - answer
          - check
      needs:
        type: string
        description: for "ask" — what's needed, one sentence
      why:
        type: string
        description: for "ask" — why self-resolution and the AI escalation chain weren't enough
      whatWouldUnblock:
        type: string
        description: for "ask" — optional, what a good answer would look like
      exhaustedLifeline:
        type: boolean
        description: for "ask" — true if lifeline.route() was actually tried first
      includeAnswered:
        type: boolean
        description: for "list"
      uuid:
        type: string
        description: for "answer"/"check"
      answer:
        type: string
        description: for "answer"
    required:
      - action
