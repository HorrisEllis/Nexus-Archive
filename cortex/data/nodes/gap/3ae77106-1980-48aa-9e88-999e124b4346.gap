envelope: 1
uuid: nexus-export-gap-3ae77106-1980-48aa-9e88-999e124b4346
type: gap
id: 3ae77106-1980-48aa-9e88-999e124b4346
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822176
source: data/cortex/memory/gaps.json:3ae77106-1980-48aa-9e88-999e124b4346
payload:
  uuid: a6e94482-288f-4b97-be2a-9af520d50ed1
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.stale-sweep-socket-close.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.stale-sweep-socket-close.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.stale-sweep-socket-close.test
  occurrences: 1
  detectedAt: 1789169897188
  lastSeenAt: 1789169897188
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.stale-sweep-socket-close.test.import
    hookId: nexus.tests.stale-sweep-socket-close.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.stale-sweep-socket-close.test
  location: null
  error: null
  resourceState:
    ts: 1789169897188
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749448704
      freeMemPct: 0.3362444557084285
      usedMemPct: 0.6637555442915715
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 83263488
      heapUsed: 34832208
      heapTotal: 60952576
      heapUsedPct: 0.5714640838149317
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.stale-sweep-socket-close.test
  priority: 0.3925
  id: 3ae77106-1980-48aa-9e88-999e124b4346
