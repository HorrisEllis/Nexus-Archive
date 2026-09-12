envelope: 1
uuid: nexus-export-gap-2fd6bbd9-e635-4c60-8d0c-4830f99a1805
type: gap
id: 2fd6bbd9-e635-4c60-8d0c-4830f99a1805
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822138
source: data/cortex/memory/gaps.json:2fd6bbd9-e635-4c60-8d0c-4830f99a1805
payload:
  uuid: 1faaf79f-ab5d-4e78-bbd0-aa2d25e41d14
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-macro.import' is declared as an INPUT but no wire ever targets it
    — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-macro
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-macro
  occurrences: 1
  detectedAt: 1789169836942
  lastSeenAt: 1789169836942
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-macro.import
    hookId: nexus.tests.modules.test-macro.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-macro
  location: null
  error: null
  resourceState:
    ts: 1789169836942
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7320961024
      freeMemPct: 0.42815105960766203
      usedMemPct: 0.5718489403923379
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100515840
      heapUsed: 50764184
      heapTotal: 71483392
      heapUsedPct: 0.7101535416786041
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-macro
  priority: 0.3925
  id: 2fd6bbd9-e635-4c60-8d0c-4830f99a1805
