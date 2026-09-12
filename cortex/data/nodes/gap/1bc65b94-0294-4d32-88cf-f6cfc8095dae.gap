envelope: 1
uuid: nexus-export-gap-1bc65b94-0294-4d32-88cf-f6cfc8095dae
type: gap
id: 1bc65b94-0294-4d32-88cf-f6cfc8095dae
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822136
source: data/cortex/memory/gaps.json:1bc65b94-0294-4d32-88cf-f6cfc8095dae
payload:
  uuid: 35ed4a1f-3704-4fca-b9b4-5e31e082dc80
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.service.bridge-service.import' is declared as an INPUT but no wire ever targets it —
    dead code, or a caller that was never wired
  source: nexus.service.bridge-service
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.service.bridge-service
  occurrences: 1
  detectedAt: 1789169836933
  lastSeenAt: 1789169836933
  meta:
    kernelGapUuid: wire-integrity:nexus.service.bridge-service.import
    hookId: nexus.service.bridge-service.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.service.bridge-service
  location: null
  error: null
  resourceState:
    ts: 1789169836933
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7320342528
      freeMemPct: 0.42811488816556653
      usedMemPct: 0.5718851118344335
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100077568
      heapUsed: 50338400
      heapTotal: 71483392
      heapUsedPct: 0.7041971371476049
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.service.bridge-service
  priority: 0.3925
  id: 1bc65b94-0294-4d32-88cf-f6cfc8095dae
