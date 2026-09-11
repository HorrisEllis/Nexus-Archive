envelope: 1
uuid: nexus-export-tool-ui_nerve.11a82ff4-ec6f-4d9e-9ea1-805a91a6c080
type: tool
id: ui_nerve.11a82ff4-ec6f-4d9e-9ea1-805a91a6c080
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724954
source: lib/agent-tools
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
