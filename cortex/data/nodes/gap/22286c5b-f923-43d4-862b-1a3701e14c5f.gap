envelope: 1
uuid: nexus-export-gap-22286c5b-f923-43d4-862b-1a3701e14c5f
type: gap
id: 22286c5b-f923-43d4-862b-1a3701e14c5f
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822139
source: data/cortex/memory/gaps.json:22286c5b-f923-43d4-862b-1a3701e14c5f
payload:
  uuid: cd8c8bc0-4a2b-46f8-9fb5-0224ba925442
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.cortex.self-heal.fault-taxonomy.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.cortex.self-heal.fault-taxonomy
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.cortex.self-heal.fault-taxonomy
  occurrences: 1
  detectedAt: 1789169836947
  lastSeenAt: 1789169836947
  meta:
    kernelGapUuid: wire-integrity:nexus.cortex.self-heal.fault-taxonomy.import
    hookId: nexus.cortex.self-heal.fault-taxonomy.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.cortex.self-heal.fault-taxonomy
  location: null
  error: null
  resourceState:
    ts: 1789169836947
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7325130752
      freeMemPct: 0.42839491740933905
      usedMemPct: 0.5716050825906609
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100782080
      heapUsed: 51034240
      heapTotal: 71483392
      heapUsedPct: 0.7139314261975704
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.cortex.self-heal.fault-taxonomy
  priority: 0.3925
  id: 22286c5b-f923-43d4-862b-1a3701e14c5f
