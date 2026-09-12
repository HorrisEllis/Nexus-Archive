envelope: 1
uuid: nexus-export-gap-373e11b8-7b79-45c8-ac3f-7198c52ce734
type: gap
id: 373e11b8-7b79-45c8-ac3f-7198c52ce734
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822168
source: data/cortex/memory/gaps.json:373e11b8-7b79-45c8-ac3f-7198c52ce734
payload:
  uuid: 30de1523-1832-441a-8ea5-1272752ffe91
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.hook.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.loom.schema.hook
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.hook
  occurrences: 1
  detectedAt: 1789169897143
  lastSeenAt: 1789169897143
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.hook.export
    hookId: nexus.loom.schema.hook.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.hook
  location: null
  error: null
  resourceState:
    ts: 1789169897143
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5753057280
      freeMemPct: 0.33645549571164796
      usedMemPct: 0.6635445042883521
      cpuPct: 0.2949308755760369
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80474112
      heapUsed: 31615880
      heapTotal: 60952576
      heapUsedPct: 0.5186963714216114
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.hook
  priority: 0.3925
  id: 373e11b8-7b79-45c8-ac3f-7198c52ce734
