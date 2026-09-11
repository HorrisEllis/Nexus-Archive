envelope: 1
uuid: nexus-export-tool-agent_chat.cacad890-320b-4802-a06d-31842f049404
type: tool
id: agent_chat.cacad890-320b-4802-a06d-31842f049404
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725050
source: lib/agent-tools
payload:
  name: agent_chat
  description: >-
    Address ONE other agent (chatgpt/claude/gemini/perplexity/ollama/mistral, or a forged hat name)
    as a real conversational turn and get its answer back — that agent gets the SAME real tool
    access to nexus this loop has, not just a bare completion. "ask" (needs provider, message) sends
    one turn. "converse" (needs agentA, agentB, openingLine, optional maxRounds default 4) runs a
    genuine, multi-round, back-and-forth conversation between two DIFFERENT named agents — each
    side's real reply becomes the other's next real input, until either side signals it's done,
    maxRounds is reached, or a real dispatch failure stops it. "read" (needs provider) shows logged
    history with that agent. A hop cap (default 4, or pass maxHops) refuses a chain that would loop
    back through an agent already in it — pass hops forward if you are relaying on behalf of another
    agent, not starting a fresh chain yourself. Prefer agent_council when you want several
    independent verdicts on the same question instead of one addressed conversation.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - ask
          - read
          - converse
      provider:
        type: string
        description: agent or hat name to address / read history for (ask, read)
      message:
        type: string
        description: what to say (ask only)
      agentA:
        type: string
        description: converse only — the agent that opens the conversation
      agentB:
        type: string
        description: converse only — the agent that responds, must differ from agentA
      openingLine:
        type: string
        description: converse only — what agentA opens with
      maxRounds:
        type: number
        description: converse only — real round-trip bound, default 4, hard-capped at 10
      from:
        type: string
        description: who is asking — defaults to nexus
      hops:
        type: array
        items:
          type: string
        description: existing chain, if relaying — do not set when starting fresh (ask only)
      maxHops:
        type: number
        description: override the default hop cap (4) (ask only)
      limit:
        type: number
        description: read only — how many rows, newest first
    required:
      - action
