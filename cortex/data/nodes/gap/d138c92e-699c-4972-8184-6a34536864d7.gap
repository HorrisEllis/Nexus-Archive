envelope: 1
uuid: nexus-export-gap-d138c92e-699c-4972-8184-6a34536864d7
type: gap
id: d138c92e-699c-4972-8184-6a34536864d7
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822138
source: data/cortex/memory/gaps.json:d138c92e-699c-4972-8184-6a34536864d7
payload:
  uuid: 479f8710-1214-46ed-be4d-019f2a137ec0
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.error-capture.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.error-capture.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.error-capture.test
  occurrences: 1
  detectedAt: 1789169836938
  lastSeenAt: 1789169836938
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.error-capture.test.import
    hookId: nexus.tests.modules.error-capture.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.error-capture.test
  location: null
  error: null
  resourceState:
    ts: 1789169836939
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324684288
      freeMemPct: 0.4283688068981575
      usedMemPct: 0.5716311931018425
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100274176
      heapUsed: 50569360
      heapTotal: 71483392
      heapUsedPct: 0.707428097424364
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.error-capture.test
  priority: 0.3925
  id: d138c92e-699c-4972-8184-6a34536864d7
