envelope: 1
uuid: nexus-export-tool-synthesize.b71130b9-547a-456b-b005-80aaa6e2e86f
type: tool
id: synthesize.b71130b9-547a-456b-b005-80aaa6e2e86f
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724952
source: lib/agent-tools
payload:
  name: synthesize
  description: >-
    Synthesize a real, structured build contract (fileName, primitives, compartmentUuid, synthesized
    context, endState, conditions, axioms, tools) from plain-text context — the same the_officiator
    hat and B1 schema officiate() uses for staged artifacts, but callable directly by any agent for
    its OWN reasoning. Does NOT queue a contract by default — pass submit:true to also submit one
    via the real RAID contract-intake path.
  parameters:
    type: object
    properties:
      contextText:
        type: string
        description: >-
          The context to synthesize a contract from — a task description, spec excerpt, or any real
          context the agent has.
      submit:
        type: boolean
        description: >-
          If true, also queues the synthesized result as a real RAID build contract. Defaults to
          false (synthesis only, for the agent's own context).
      forAgent:
        type: string
        description: Which agent wears the_officiator hat for this synthesis call. Defaults to claude.
      dispatchTo:
        type: string
        description: >-
          Optional — if submit:true, which agent the resulting contract should be dispatched to.
          Defaults to forAgent.
    required:
      - contextText
