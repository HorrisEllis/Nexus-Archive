envelope: 1
uuid: nexus-export-gap-07b2ed93-f925-4f2b-9dc8-fe5ac4649100
type: gap
id: 07b2ed93-f925-4f2b-9dc8-fe5ac4649100
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822136
source: data/cortex/memory/gaps.json:07b2ed93-f925-4f2b-9dc8-fe5ac4649100
payload:
  uuid: fb906c24-9a2e-4038-9fe2-82546d7d5b65
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.guardian.tool-runtime.import' is declared as an INPUT but no wire ever targets it —
    dead code, or a caller that was never wired
  source: nexus.guardian.tool-runtime
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.guardian.tool-runtime
  occurrences: 1
  detectedAt: 1789169836927
  lastSeenAt: 1789169836927
  meta:
    kernelGapUuid: wire-integrity:nexus.guardian.tool-runtime.import
    hookId: nexus.guardian.tool-runtime.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.guardian.tool-runtime
  location: null
  error: null
  resourceState:
    ts: 1789169836927
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7322947584
      freeMemPct: 0.4282672394051211
      usedMemPct: 0.5717327605948789
      cpuPct: 0.4056224899598394
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 99835904
      heapUsed: 50133528
      heapTotal: 71221248
      heapUsedPct: 0.703912517792443
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.guardian.tool-runtime
  priority: 0.3925
  id: 07b2ed93-f925-4f2b-9dc8-fe5ac4649100
