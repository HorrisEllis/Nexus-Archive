envelope: 1
uuid: nexus-export-gap-e0120221-2471-47f4-adc8-f9ba16b9d8ad
type: gap
id: e0120221-2471-47f4-adc8-f9ba16b9d8ad
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822169
source: data/cortex/memory/gaps.json:e0120221-2471-47f4-adc8-f9ba16b9d8ad
payload:
  uuid: 8043e8af-e352-476a-b036-fe108cccba7c
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.lib.dns-server.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.mesh.lib.dns-server
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.lib.dns-server
  occurrences: 1
  detectedAt: 1789169897153
  lastSeenAt: 1789169897153
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.lib.dns-server.export
    hookId: nexus.mesh.lib.dns-server.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.lib.dns-server
  location: null
  error: null
  resourceState:
    ts: 1789169897153
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5765107712
      freeMemPct: 0.33716023996757505
      usedMemPct: 0.662839760032425
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80756736
      heapUsed: 32202696
      heapTotal: 60952576
      heapUsedPct: 0.52832379061387
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.lib.dns-server
  priority: 0.3925
  id: e0120221-2471-47f4-adc8-f9ba16b9d8ad
