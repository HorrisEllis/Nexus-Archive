envelope: 1
uuid: nexus-export-gap-39dbceb7-176f-4e91-8194-e8a0c29bdf39
type: gap
id: 39dbceb7-176f-4e91-8194-e8a0c29bdf39
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822174
source: data/cortex/memory/gaps.json:39dbceb7-176f-4e91-8194-e8a0c29bdf39
payload:
  uuid: b89da767-83db-48d3-bcf6-6d66b1d86384
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.test-system-registry.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.test-system-registry
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.test-system-registry
  occurrences: 1
  detectedAt: 1789169897181
  lastSeenAt: 1789169897181
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.test-system-registry.import
    hookId: nexus.tests.modules.test-system-registry.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.test-system-registry
  location: null
  error: null
  resourceState:
    ts: 1789169897181
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5750083584
      freeMemPct: 0.33628158533442054
      usedMemPct: 0.6637184146655795
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 82624512
      heapUsed: 34241704
      heapTotal: 60952576
      heapUsedPct: 0.5617761585662926
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.test-system-registry
  priority: 0.3925
  id: 39dbceb7-176f-4e91-8194-e8a0c29bdf39
