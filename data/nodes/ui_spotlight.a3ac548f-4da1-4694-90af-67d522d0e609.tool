envelope: 1
uuid: nexus-export-tool-ui_spotlight.a3ac548f-4da1-4694-90af-67d522d0e609
type: tool
id: ui_spotlight.a3ac548f-4da1-4694-90af-67d522d0e609
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862036
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862036
lastSeenAt: 1789332862036
fingerprint: null
payload:
  name: ui_spotlight
  description: >-
    Guide the user's attention in the NEXUS UI. action "on" highlights a system (target:
    guardian/cortex/idearium/...); "off" clears it; "step" walks the user through a sequence of
    steps. Use to show the user WHERE something is happening while you assist.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - 'on'
          - 'off'
          - step
        description: on = highlight a target, off = clear, step = guided sequence
      target:
        type: string
        description: 'For "on": which system to highlight (guardian, cortex, idearium, ...).'
      ttl:
        type: number
        description: 'For "on": how long the highlight lasts, ms (default 8000).'
      steps:
        type: array
        description: 'For "step": ordered step objects to walk the user through.'
        items:
          type: object
    required:
      - action
