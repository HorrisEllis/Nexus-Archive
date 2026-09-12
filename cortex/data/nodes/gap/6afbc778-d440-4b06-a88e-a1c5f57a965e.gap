envelope: 1
uuid: nexus-export-gap-6afbc778-d440-4b06-a88e-a1c5f57a965e
type: gap
id: 6afbc778-d440-4b06-a88e-a1c5f57a965e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822137
source: data/cortex/memory/gaps.json:6afbc778-d440-4b06-a88e-a1c5f57a965e
payload:
  uuid: 010944fe-ec9c-45aa-baf5-c719346f0abb
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.diagnose-move-data-tools.test.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.diagnose-move-data-tools.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.diagnose-move-data-tools.test
  occurrences: 1
  detectedAt: 1789169836937
  lastSeenAt: 1789169836937
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.diagnose-move-data-tools.test.import
    hookId: nexus.tests.modules.diagnose-move-data-tools.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.diagnose-move-data-tools.test
  location: null
  error: null
  resourceState:
    ts: 1789169836937
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324094464
      freeMemPct: 0.428334312277881
      usedMemPct: 0.571665687722119
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100208640
      heapUsed: 50495552
      heapTotal: 71483392
      heapUsedPct: 0.7063955778707312
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.diagnose-move-data-tools.test
  priority: 0.3925
  id: 6afbc778-d440-4b06-a88e-a1c5f57a965e
