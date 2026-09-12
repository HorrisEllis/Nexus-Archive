envelope: 1
uuid: nexus-export-gap-1fc23691-d686-41bf-8d28-4e88b6cbeafc
type: gap
id: 1fc23691-d686-41bf-8d28-4e88b6cbeafc
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822149
source: data/cortex/memory/gaps.json:1fc23691-d686-41bf-8d28-4e88b6cbeafc
payload:
  uuid: b49f3993-dd18-4e3b-a80b-a654cf1bdbde
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.src.network.routes.export' is declared as an OUTPUT but no wire connects
    it to anything — an emit/call with no possible listener
  source: nexus.clear-glass.src.network.routes
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.src.network.routes
  occurrences: 1
  detectedAt: 1789169837009
  lastSeenAt: 1789169837009
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.src.network.routes.export
    hookId: nexus.clear-glass.src.network.routes.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.src.network.routes
  location: null
  error: null
  resourceState:
    ts: 1789169837009
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7331172352
      freeMemPct: 0.4287482477211991
      usedMemPct: 0.5712517522788009
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 93855744
      heapUsed: 28969808
      heapTotal: 62373888
      heapUsedPct: 0.4644540997668768
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.src.network.routes
  priority: 0.3925
  id: 1fc23691-d686-41bf-8d28-4e88b6cbeafc
