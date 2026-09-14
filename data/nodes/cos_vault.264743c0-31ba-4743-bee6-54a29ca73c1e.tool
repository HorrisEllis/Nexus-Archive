envelope: 1
uuid: nexus-export-tool-cos_vault.264743c0-31ba-4743-bee6-54a29ca73c1e
type: tool
id: cos_vault.264743c0-31ba-4743-bee6-54a29ca73c1e
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862109
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862109
lastSeenAt: 1789332862109
fingerprint: null
payload:
  name: cos_vault
  description: >-
    Manage which secrets exist in a COS compartment vault and who can reach them — never returns a
    secret's actual value (get/export are intentionally not exposed here; use the real CLI for
    that). Actions: "set" (needs compartmentName, key, value — writes a secret, does not echo it
    back), "list" (needs compartmentName — key NAMES only), "delete" (needs compartmentName, key),
    "grant"/"revoke" (need fromCompartmentName, toCompartmentName, key — cross-compartment access),
    "audit" (full access log).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - set
          - list
          - delete
          - grant
          - revoke
          - audit
      compartmentName:
        type: string
        description: for "set"/"list"/"delete"
      key:
        type: string
        description: secret key name
      value:
        type: string
        description: for "set" — the secret value to store (write-only, never returned)
      fromCompartmentName:
        type: string
        description: for "grant"/"revoke"
      toCompartmentName:
        type: string
        description: for "grant"/"revoke"
    required:
      - action
