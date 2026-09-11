envelope: 1
uuid: nexus-export-tool-nexus_status.f9cd7e47-95e2-4b7d-8662-fe7b4ed67a86
type: tool
id: nexus_status.f9cd7e47-95e2-4b7d-8662-fe7b4ed67a86
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724960
source: lib/agent-tools
payload:
  name: nexus_status
  description: >-
    Read NEXUS's own real, current state — not a static description, live queries. Actions:
    "concerns" (real, detected roadmap items from LOOM — optional severity filter: low|medium|high),
    "componentImpact" (LOOM: what depends on this component, via declared wire intent — requires
    componentId), "hookImpact" (hooks: who writes a table / who emits an event / what's affected by
    changing a specific hook — requires one of hookId, table, or event), "healerStatus" (real
    self-improvement proposals and their status — proposed/generated/merged/archived),
    "crossSystemStatus" (real stuck-state report across idearium and SEAMQueue).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - concerns
          - componentImpact
          - hookImpact
          - healerStatus
          - crossSystemStatus
        description: Which real query to run
      severity:
        type: string
        description: 'For "concerns": filter by low|medium|high'
      limit:
        type: number
        description: 'For "concerns": max rows to return'
      componentId:
        type: string
        description: 'For "componentImpact": the LOOM component id'
      maxDepth:
        type: number
        description: 'For "componentImpact": how many hops to traverse'
      hookId:
        type: string
        description: 'For "hookImpact": a specific hook id to trace'
      table:
        type: string
        description: 'For "hookImpact": a jaa table name (bare, no jaa: prefix)'
      event:
        type: string
        description: 'For "hookImpact": an event type name'
      staleMs:
        type: number
        description: 'For "crossSystemStatus": age threshold for "stuck", in ms'
    required:
      - action
