envelope: 1
uuid: nexus-export-gap-7344ed48-5bd6-462f-b107-9a03fe16a808
type: gap
id: 7344ed48-5bd6-462f-b107-9a03fe16a808
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822149
source: data/cortex/memory/gaps.json:7344ed48-5bd6-462f-b107-9a03fe16a808
payload:
  uuid: f3366d58-c138-4723-8b10-4787e733c3bf
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.src.network.install.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.clear-glass.src.network.install
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.src.network.install
  occurrences: 2
  detectedAt: 1789169837002
  lastSeenAt: 1789169837004
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.src.network.install.export
    hookId: nexus.clear-glass.src.network.install.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.src.network.install
  location: null
  error: null
  resourceState:
    ts: 1789169837002
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7316652032
      freeMemPct: 0.42789905724286414
      usedMemPct: 0.5721009427571359
      cpuPct: 1
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 103120896
      heapUsed: 53334080
      heapTotal: 71483392
      heapUsedPct: 0.7461044937542975
      external: 1947901
      uptimeSec: 0
    pressure:
      level: pressure
      reasons:
        - cpu 100%
      spawnSafe: true
  why: null
  component: nexus.clear-glass.src.network.install
  priority: 0.3925
  id: 7344ed48-5bd6-462f-b107-9a03fe16a808
