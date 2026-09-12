envelope: 1
uuid: nexus-export-gap-a5d3de72-3ce5-4832-8b83-34b59cef9563
type: gap
id: a5d3de72-3ce5-4832-8b83-34b59cef9563
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822173
source: data/cortex/memory/gaps.json:a5d3de72-3ce5-4832-8b83-34b59cef9563
payload:
  uuid: 930d1c29-793a-438e-8b40-d5306b204e62
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.node-index-watcher.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.node-index-watcher.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.node-index-watcher.test
  occurrences: 1
  detectedAt: 1789169897170
  lastSeenAt: 1789169897170
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.node-index-watcher.test.import
    hookId: nexus.tests.modules.node-index-watcher.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.node-index-watcher.test
  location: null
  error: null
  resourceState:
    ts: 1789169897170
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5761634304
      freeMemPct: 0.3369571049815023
      usedMemPct: 0.6630428950184977
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81797120
      heapUsed: 33406136
      heapTotal: 60952576
      heapUsedPct: 0.5480676649334723
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.node-index-watcher.test
  priority: 0.3925
  id: a5d3de72-3ce5-4832-8b83-34b59cef9563
