envelope: 1
uuid: nexus-export-tool-clear_glass_tab_visibility.2bcd125c-af0e-469c-87f5-0da3b7d7b2d7
type: tool
id: clear_glass_tab_visibility.2bcd125c-af0e-469c-87f5-0da3b7d7b2d7
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862095
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862095
lastSeenAt: 1789332862095
fingerprint: null
payload:
  name: clear_glass_tab_visibility
  description: >-
    Move a real, live provider tab to the background (hide) or bring it back to the foreground
    (show). Needs providerId (e.g. claude, chatgpt) and action (background or foreground). Honestly
    fails — with ok:false — if ClearGlass is not running or the provider has no live window right
    now, rather than a fabricated success.
  parameters:
    type: object
    properties:
      providerId:
        type: string
        description: which real provider tab — e.g. claude, chatgpt, gemini
      action:
        type: string
        enum:
          - background
          - foreground
    required:
      - providerId
      - action
