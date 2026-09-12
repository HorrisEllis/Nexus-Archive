envelope: 1
uuid: nexus-export-gap-9ba01260-5986-42a7-a6db-05604eaf64ef
type: gap
id: 9ba01260-5986-42a7-a6db-05604eaf64ef
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822165
source: data/cortex/memory/gaps.json:9ba01260-5986-42a7-a6db-05604eaf64ef
payload:
  uuid: 7c492e8d-3168-4a47-825f-dc9915c44931
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.node-index-watcher.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.lib.node-index-watcher
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.node-index-watcher
  occurrences: 1
  detectedAt: 1789169897136
  lastSeenAt: 1789169897136
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.node-index-watcher.export
    hookId: nexus.lib.node-index-watcher.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.node-index-watcher
  location: null
  error: null
  resourceState:
    ts: 1789169897136
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756317696
      freeMemPct: 0.33664617430706534
      usedMemPct: 0.6633538256929347
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80416768
      heapUsed: 31064728
      heapTotal: 60952576
      heapUsedPct: 0.5096540628569989
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.node-index-watcher
  priority: 0.3925
  id: 9ba01260-5986-42a7-a6db-05604eaf64ef
