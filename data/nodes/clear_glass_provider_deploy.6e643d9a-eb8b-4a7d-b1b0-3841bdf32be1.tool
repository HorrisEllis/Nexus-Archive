envelope: 1
uuid: nexus-export-tool-clear_glass_provider_deploy.6e643d9a-eb8b-4a7d-b1b0-3841bdf32be1
type: tool
id: clear_glass_provider_deploy.6e643d9a-eb8b-4a7d-b1b0-3841bdf32be1
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862096
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862096
lastSeenAt: 1789332862096
fingerprint: null
payload:
  name: clear_glass_provider_deploy
  description: >-
    Hot-push the current userscript file from disk into an already-running ClearGlass provider tab,
    right now — without waiting for the real 60-second reload timer or restarting the tab. Needs
    providerId (e.g. "claude", "chatgpt", "gemini", "perplexity"). Calls the real
    ProviderHost.deploy(), the exact same injection path the existing background reload timer uses.
    Honestly fails with a specific reason if ClearGlass is not running, the named provider has no
    live window, or the injection itself throws — it never reports a successful deploy that did not
    actually happen.
  parameters:
    type: object
    properties:
      providerId:
        type: string
        description: 'Which real provider window: claude, chatgpt, gemini, perplexity.'
    required:
      - providerId
