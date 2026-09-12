envelope: 1
uuid: nexus-export-gap-b58ae7ab-b44d-4f89-88a1-d4f8c369f2f6
type: gap
id: b58ae7ab-b44d-4f89-88a1-d4f8c369f2f6
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:b58ae7ab-b44d-4f89-88a1-d4f8c369f2f6
payload:
  uuid: e9f5dfcf-59a6-40e9-96a5-3e370cf5c816
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.dispatcher-stale-socket.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.dispatcher-stale-socket.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.dispatcher-stale-socket.test
  occurrences: 1
  detectedAt: 1789169897159
  lastSeenAt: 1789169897159
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.dispatcher-stale-socket.test.import
    hookId: nexus.tests.dispatcher-stale-socket.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.dispatcher-stale-socket.test
  location: null
  error: null
  resourceState:
    ts: 1789169897159
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766991872
      freeMemPct: 0.33727043111568056
      usedMemPct: 0.6627295688843194
      cpuPct: 0.5531914893617021
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81121280
      heapUsed: 32539016
      heapTotal: 60952576
      heapUsedPct: 0.5338415229571265
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.dispatcher-stale-socket.test
  priority: 0.3925
  id: b58ae7ab-b44d-4f89-88a1-d4f8c369f2f6
