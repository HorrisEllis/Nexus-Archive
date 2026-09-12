envelope: 1
uuid: nexus-export-gap-8426f65c-523d-43cf-be1a-32e0644ae631
type: gap
id: 8426f65c-523d-43cf-be1a-32e0644ae631
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822169
source: data/cortex/memory/gaps.json:8426f65c-523d-43cf-be1a-32e0644ae631
payload:
  uuid: f7d8de39-8aaa-4895-b0d8-68e50e9c5ebd
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.lib.ddns.export' is declared as an OUTPUT but no wire connects it to anything —
    an emit/call with no possible listener
  source: nexus.mesh.lib.ddns
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.lib.ddns
  occurrences: 1
  detectedAt: 1789169897152
  lastSeenAt: 1789169897152
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.lib.ddns.export
    hookId: nexus.mesh.lib.ddns.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.lib.ddns
  location: null
  error: null
  resourceState:
    ts: 1789169897152
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5757521920
      freeMemPct: 0.3367166008234632
      usedMemPct: 0.6632833991765368
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80650240
      heapUsed: 32121016
      heapTotal: 60952576
      heapUsedPct: 0.5269837324020563
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.lib.ddns
  priority: 0.3925
  id: 8426f65c-523d-43cf-be1a-32e0644ae631
