envelope: 1
uuid: nexus-export-gap-64001139-500e-477c-95c4-6d4c89005b4a
type: gap
id: 64001139-500e-477c-95c4-6d4c89005b4a
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822169
source: data/cortex/memory/gaps.json:64001139-500e-477c-95c4-6d4c89005b4a
payload:
  uuid: 9663f6c5-10c9-416a-ad15-89632767f0f5
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.daemons.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.mesh.daemons
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.daemons
  occurrences: 1
  detectedAt: 1789169897149
  lastSeenAt: 1789169897149
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.daemons.import
    hookId: nexus.mesh.daemons.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.daemons
  location: null
  error: null
  resourceState:
    ts: 1789169897149
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5748649984
      freeMemPct: 0.3361977442434707
      usedMemPct: 0.6638022557565293
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80875520
      heapUsed: 31951776
      heapTotal: 60952576
      heapUsedPct: 0.5242071475371278
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.daemons
  priority: 0.3925
  id: 64001139-500e-477c-95c4-6d4c89005b4a
