envelope: 1
uuid: nexus-export-gap-17e8f760-53e8-4582-8593-101c474bf833
type: gap
id: 17e8f760-53e8-4582-8593-101c474bf833
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822141
source: data/cortex/memory/gaps.json:17e8f760-53e8-4582-8593-101c474bf833
payload:
  uuid: 954888dd-691f-4356-b337-ca7b0482874b
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.hat-forge.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.lib.hat-forge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.hat-forge
  occurrences: 1
  detectedAt: 1789169836967
  lastSeenAt: 1789169836967
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.hat-forge.import
    hookId: nexus.lib.hat-forge.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.hat-forge
  location: null
  error: null
  resourceState:
    ts: 1789169836967
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7318900736
      freeMemPct: 0.42803056798266836
      usedMemPct: 0.5719694320173316
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101634048
      heapUsed: 51861104
      heapTotal: 71483392
      heapUsedPct: 0.7254986444963328
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.hat-forge
  priority: 0.3925
  id: 17e8f760-53e8-4582-8593-101c474bf833
