envelope: 1
uuid: nexus-export-gap-353a9dff-6aee-47db-8c0e-9af71f0f0876
type: gap
id: 353a9dff-6aee-47db-8c0e-9af71f0f0876
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822136
source: data/cortex/memory/gaps.json:353a9dff-6aee-47db-8c0e-9af71f0f0876
payload:
  uuid: 98ed9a67-3bf7-4566-b8f9-402b86c30029
  type: dangling-hook
  domain: system
  body: >-
    hook 'loom.hook.declare' is declared as an INPUT but no wire ever targets it — dead code, or a
    caller that was never wired
  source: nexus.loom
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom
  occurrences: 1
  detectedAt: 1789169836893
  lastSeenAt: 1789169836893
  meta:
    kernelGapUuid: wire-integrity:loom.hook.declare
    hookId: loom.hook.declare
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom
  location: null
  error: null
  resourceState:
    ts: 1789169836894
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7343513600
      freeMemPct: 0.42946999974129035
      usedMemPct: 0.5705300002587097
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 90345472
      heapUsed: 40586112
      heapTotal: 65355776
      heapUsedPct: 0.6210026792429181
      external: 1947837
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom
  priority: 0.3925
  id: 353a9dff-6aee-47db-8c0e-9af71f0f0876
