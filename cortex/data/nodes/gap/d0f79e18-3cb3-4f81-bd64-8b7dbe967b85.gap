envelope: 1
uuid: nexus-export-gap-d0f79e18-3cb3-4f81-bd64-8b7dbe967b85
type: gap
id: d0f79e18-3cb3-4f81-bd64-8b7dbe967b85
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822138
source: data/cortex/memory/gaps.json:d0f79e18-3cb3-4f81-bd64-8b7dbe967b85
payload:
  uuid: 613b2aab-b2a1-42b3-80e7-04efa19e8453
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.copilot.intent-learning.import' is declared as an INPUT but no wire ever targets it
    — dead code, or a caller that was never wired
  source: nexus.copilot.intent-learning
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.copilot.intent-learning
  occurrences: 1
  detectedAt: 1789169836944
  lastSeenAt: 1789169836944
  meta:
    kernelGapUuid: wire-integrity:nexus.copilot.intent-learning.import
    hookId: nexus.copilot.intent-learning.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.copilot.intent-learning
  location: null
  error: null
  resourceState:
    ts: 1789169836944
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7321116672
      freeMemPct: 0.4281601623546794
      usedMemPct: 0.5718398376453206
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100610048
      heapUsed: 50874312
      heapTotal: 71483392
      heapUsedPct: 0.711694151279223
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.copilot.intent-learning
  priority: 0.3925
  id: d0f79e18-3cb3-4f81-bd64-8b7dbe967b85
