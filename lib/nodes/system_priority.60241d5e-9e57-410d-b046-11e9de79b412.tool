envelope: 1
uuid: nexus-export-tool-system_priority.60241d5e-9e57-410d-b046-11e9de79b412
type: tool
id: system_priority.60241d5e-9e57-410d-b046-11e9de79b412
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724977
source: lib/agent-tools
payload:
  name: system_priority
  description: >-
    Bottom-up, architecture-first priority for gaps and system health. Actions: "score" (needs
    system, optional filePath/componentId/severity — returns a real composite priority,
    cortex-and-core weighted highest), "boot_check" (runs the real core/cli/api/events/ui presence
    check across all real systems, ordered by vitality — dryRun defaults true, set dryRun:false to
    actually write findings as real gaps), "log_fix" (needs system + description — records a real
    fix into the same diagnostic system gaps live in, with a real priority score; use this whenever
    you find or fix something real, not just at the end of a task), "order" (the real system check
    order, cortex first).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - score
          - boot_check
          - log_fix
          - order
      system:
        type: string
      filePath:
        type: string
      componentId:
        type: string
      severity:
        type: string
        enum:
          - low
          - medium
          - high
          - critical
      dryRun:
        type: boolean
        description: for "boot_check" — false to actually write real gaps
      description:
        type: string
        description: for "log_fix" — what was found/fixed, real detail
      location:
        type: string
        description: for "log_fix"
      component:
        type: string
        description: for "log_fix"
    required:
      - action
