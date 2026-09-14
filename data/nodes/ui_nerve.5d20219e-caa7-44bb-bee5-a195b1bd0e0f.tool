envelope: 1
uuid: nexus-export-tool-ui_nerve.5d20219e-caa7-44bb-bee5-a195b1bd0e0f
type: tool
id: ui_nerve.5d20219e-caa7-44bb-bee5-a195b1bd0e0f
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862037
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862037
lastSeenAt: 1789332862037
fingerprint: null
payload:
  name: ui_nerve
  description: >-
    Surface the live NEXUS "nervous system" field (the CFR sigma field) in the UI. action "on" shows
    it, "off" hides it, "sigma" pushes a specific field value. Use to make the system's live state
    visible to the user.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - 'on'
          - 'off'
          - sigma
        description: on = show the field, off = hide, sigma = push a field value
      sigma:
        type: number
        description: 'For "sigma": the field value to surface (0..1).'
    required:
      - action
