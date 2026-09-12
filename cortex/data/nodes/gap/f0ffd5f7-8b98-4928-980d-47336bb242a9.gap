envelope: 1
uuid: nexus-export-gap-f0ffd5f7-8b98-4928-980d-47336bb242a9
type: gap
id: f0ffd5f7-8b98-4928-980d-47336bb242a9
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:f0ffd5f7-8b98-4928-980d-47336bb242a9
payload:
  uuid: c4027e54-a50e-4829-ae40-b31d075de4c4
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.lib.reverse-proxy.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.mesh.lib.reverse-proxy
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.lib.reverse-proxy
  occurrences: 1
  detectedAt: 1789169897156
  lastSeenAt: 1789169897156
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.lib.reverse-proxy.export
    hookId: nexus.mesh.lib.reverse-proxy.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.lib.reverse-proxy
  location: null
  error: null
  resourceState:
    ts: 1789169897156
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5767122944
      freeMemPct: 0.33727809658685315
      usedMemPct: 0.6627219034131469
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80990208
      heapUsed: 32370928
      heapTotal: 60952576
      heapUsedPct: 0.5310838380317183
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.lib.reverse-proxy
  priority: 0.3925
  id: f0ffd5f7-8b98-4928-980d-47336bb242a9
