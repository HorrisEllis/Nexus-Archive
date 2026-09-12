envelope: 1
uuid: nexus-export-gap-72a66fe8-2c3d-4e5c-aada-6851e71faabd
type: gap
id: 72a66fe8-2c3d-4e5c-aada-6851e71faabd
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:72a66fe8-2c3d-4e5c-aada-6851e71faabd
payload:
  uuid: 39b5eb1f-5c92-4023-a0de-6ac5d252502e
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-dispatcher-deepseek-ncp.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-dispatcher-deepseek-ncp
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-dispatcher-deepseek-ncp
  occurrences: 1
  detectedAt: 1789169897178
  lastSeenAt: 1789169897178
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-dispatcher-deepseek-ncp.import
    hookId: nexus.tests.modules.test-dispatcher-deepseek-ncp.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-dispatcher-deepseek-ncp
  location: null
  error: null
  resourceState:
    ts: 1789169897178
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5747585024
      freeMemPct: 0.33613546229019364
      usedMemPct: 0.6638645377098064
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82436096
      heapUsed: 33991136
      heapTotal: 60952576
      heapUsedPct: 0.5576652904710705
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-dispatcher-deepseek-ncp
  priority: 0.3925
  id: 72a66fe8-2c3d-4e5c-aada-6851e71faabd
