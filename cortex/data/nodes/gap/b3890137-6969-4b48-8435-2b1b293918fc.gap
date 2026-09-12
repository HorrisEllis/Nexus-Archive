envelope: 1
uuid: nexus-export-gap-b3890137-6969-4b48-8435-2b1b293918fc
type: gap
id: b3890137-6969-4b48-8435-2b1b293918fc
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822149
source: data/cortex/memory/gaps.json:b3890137-6969-4b48-8435-2b1b293918fc
payload:
  uuid: c476b723-9f88-4bc5-9428-8998cb4cb69c
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.src.mesh.route-graph.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.clear-glass.src.mesh.route-graph
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.src.mesh.route-graph
  occurrences: 1
  detectedAt: 1789169837000
  lastSeenAt: 1789169837000
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.src.mesh.route-graph.export
    hookId: nexus.clear-glass.src.mesh.route-graph.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.src.mesh.route-graph
  location: null
  error: null
  resourceState:
    ts: 1789169837000
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7319322624
      freeMemPct: 0.42805524121800503
      usedMemPct: 0.571944758781995
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 103055360
      heapUsed: 53260152
      heapTotal: 71483392
      heapUsedPct: 0.7450702954890557
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.src.mesh.route-graph
  priority: 0.3925
  id: b3890137-6969-4b48-8435-2b1b293918fc
