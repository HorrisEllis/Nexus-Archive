envelope: 1
uuid: nexus-export-gap-9ce5a025-e85c-4af9-b980-09c572600374
type: gap
id: 9ce5a025-e85c-4af9-b980-09c572600374
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822141
source: data/cortex/memory/gaps.json:9ce5a025-e85c-4af9-b980-09c572600374
payload:
  uuid: eb5653db-cacd-44f8-8f3f-3dda4e5afa8a
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.copilot.config.export' is declared as an OUTPUT but no wire connects it to anything
    — an emit/call with no possible listener
  source: nexus.copilot.config
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.copilot.config
  occurrences: 1
  detectedAt: 1789169836964
  lastSeenAt: 1789169836964
  meta:
    kernelGapUuid: wire-integrity:nexus.copilot.config.export
    hookId: nexus.copilot.config.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.copilot.config
  location: null
  error: null
  resourceState:
    ts: 1789169836964
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7316410368
      freeMemPct: 0.42788492403038975
      usedMemPct: 0.5721150759696103
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101511168
      heapUsed: 51712680
      heapTotal: 71483392
      heapUsedPct: 0.7234223020642333
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.copilot.config
  priority: 0.4387
  id: 9ce5a025-e85c-4af9-b980-09c572600374
