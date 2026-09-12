envelope: 1
uuid: nexus-export-gap-4e63ab61-9b19-436c-8c31-1c579b815871
type: gap
id: 4e63ab61-9b19-436c-8c31-1c579b815871
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822149
source: data/cortex/memory/gaps.json:4e63ab61-9b19-436c-8c31-1c579b815871
payload:
  uuid: 91103ca2-099c-4297-8b7f-0fab05a31d90
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.src.mesh.automation-engine.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.clear-glass.src.mesh.automation-engine
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.src.mesh.automation-engine
  occurrences: 1
  detectedAt: 1789169836999
  lastSeenAt: 1789169836999
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.src.mesh.automation-engine.export
    hookId: nexus.clear-glass.src.mesh.automation-engine.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.src.mesh.automation-engine
  location: null
  error: null
  resourceState:
    ts: 1789169836999
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7318372352
      freeMemPct: 0.427999666552004
      usedMemPct: 0.572000333447996
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102989824
      heapUsed: 53186208
      heapTotal: 71483392
      heapUsedPct: 0.7440358733955994
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.src.mesh.automation-engine
  priority: 0.3925
  id: 4e63ab61-9b19-436c-8c31-1c579b815871
