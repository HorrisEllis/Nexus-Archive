envelope: 1
uuid: nexus-export-gap-ddbaddc3-2bf4-406f-817e-63f01a637d4e
type: gap
id: ddbaddc3-2bf4-406f-817e-63f01a637d4e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822175
source: data/cortex/memory/gaps.json:ddbaddc3-2bf4-406f-817e-63f01a637d4e
payload:
  uuid: e71f45d0-5d1f-4540-a291-616b9bc9b4ca
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-warp-cascade-provider-fallback.import' is declared as an INPUT
    but no wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-warp-cascade-provider-fallback
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-warp-cascade-provider-fallback
  occurrences: 1
  detectedAt: 1789169897183
  lastSeenAt: 1789169897183
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-warp-cascade-provider-fallback.import
    hookId: nexus.tests.modules.test-warp-cascade-provider-fallback.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-warp-cascade-provider-fallback
  location: null
  error: null
  resourceState:
    ts: 1789169897183
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749952512
      freeMemPct: 0.336273919863248
      usedMemPct: 0.6637260801367519
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82788352
      heapUsed: 34409648
      heapTotal: 60952576
      heapUsedPct: 0.5645314809992608
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-warp-cascade-provider-fallback
  priority: 0.3925
  id: ddbaddc3-2bf4-406f-817e-63f01a637d4e
