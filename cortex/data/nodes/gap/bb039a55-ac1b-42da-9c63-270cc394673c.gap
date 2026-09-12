envelope: 1
uuid: nexus-export-gap-bb039a55-ac1b-42da-9c63-270cc394673c
type: gap
id: bb039a55-ac1b-42da-9c63-270cc394673c
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822168
source: data/cortex/memory/gaps.json:bb039a55-ac1b-42da-9c63-270cc394673c
payload:
  uuid: 6b80a0ae-b274-410e-b19f-49d06fff875a
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.config.export' is declared as an OUTPUT but no wire connects it to anything —
    an emit/call with no possible listener
  source: nexus.mesh.config
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.config
  occurrences: 1
  detectedAt: 1789169897147
  lastSeenAt: 1789169897147
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.config.export
    hookId: nexus.mesh.config.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.config
  location: null
  error: null
  resourceState:
    ts: 1789169897147
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749727232
      freeMemPct: 0.33626074483467017
      usedMemPct: 0.6637392551653298
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81154048
      heapUsed: 31862280
      heapTotal: 60952576
      heapUsedPct: 0.5227388584856528
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.config
  priority: 0.3925
  id: bb039a55-ac1b-42da-9c63-270cc394673c
