envelope: 1
uuid: nexus-export-gap-1a395cab-b5f6-4a76-9b87-65fa38a6d793
type: gap
id: 1a395cab-b5f6-4a76-9b87-65fa38a6d793
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822168
source: data/cortex/memory/gaps.json:1a395cab-b5f6-4a76-9b87-65fa38a6d793
payload:
  uuid: c3280730-50fd-42cc-8e9d-22a4eb5c83dd
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.definitions.import' is declared as an INPUT but no wire ever targets it
    — dead code, or a caller that was never wired
  source: nexus.loom.schema.definitions
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.definitions
  occurrences: 1
  detectedAt: 1789169897142
  lastSeenAt: 1789169897142
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.definitions.import
    hookId: nexus.loom.schema.definitions.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.definitions
  location: null
  error: null
  resourceState:
    ts: 1789169897142
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5753163776
      freeMemPct: 0.33646172390697565
      usedMemPct: 0.6635382760930244
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80420864
      heapUsed: 31532408
      heapTotal: 60952576
      heapUsedPct: 0.5173269133038775
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.definitions
  priority: 0.3925
  id: 1a395cab-b5f6-4a76-9b87-65fa38a6d793
