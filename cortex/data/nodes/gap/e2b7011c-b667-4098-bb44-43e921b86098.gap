envelope: 1
uuid: nexus-export-gap-e2b7011c-b667-4098-bb44-43e921b86098
type: gap
id: e2b7011c-b667-4098-bb44-43e921b86098
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822164
source: data/cortex/memory/gaps.json:e2b7011c-b667-4098-bb44-43e921b86098
payload:
  uuid: bda3a4d5-82eb-44ca-9876-2d7b0636e339
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.guardian.clear-glass-bridge.export' is declared as an OUTPUT but no wire connects it
    to anything — an emit/call with no possible listener
  source: nexus.guardian.clear-glass-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.guardian.clear-glass-bridge
  occurrences: 1
  detectedAt: 1789169897132
  lastSeenAt: 1789169897132
  meta:
    kernelGapUuid: wire-integrity:nexus.guardian.clear-glass-bridge.export
    hookId: nexus.guardian.clear-glass-bridge.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.guardian.clear-glass-bridge
  location: null
  error: null
  resourceState:
    ts: 1789169897133
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5755228160
      freeMemPct: 0.3365824550779435
      usedMemPct: 0.6634175449220565
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80404480
      heapUsed: 30817600
      heapTotal: 60952576
      heapUsedPct: 0.5055996320811773
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.guardian.clear-glass-bridge
  priority: 0.3925
  id: e2b7011c-b667-4098-bb44-43e921b86098
