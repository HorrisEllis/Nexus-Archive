envelope: 1
uuid: nexus-export-gap-f04db479-713d-4c87-92a6-b06cbb96d14c
type: gap
id: f04db479-713d-4c87-92a6-b06cbb96d14c
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822164
source: data/cortex/memory/gaps.json:f04db479-713d-4c87-92a6-b06cbb96d14c
payload:
  uuid: 54e957fe-c2d3-4b28-b586-10dc7974d74b
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.guardian.agents.export' is declared as an OUTPUT but no wire connects it to anything
    — an emit/call with no possible listener
  source: nexus.guardian.agents
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.guardian.agents
  occurrences: 1
  detectedAt: 1789169897131
  lastSeenAt: 1789169897131
  meta:
    kernelGapUuid: wire-integrity:nexus.guardian.agents.export
    hookId: nexus.guardian.agents.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.guardian.agents
  location: null
  error: null
  resourceState:
    ts: 1789169897131
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5758488576
      freeMemPct: 0.33677313367336087
      usedMemPct: 0.6632268663266392
      cpuPct: 0.2786546072516167
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80379904
      heapUsed: 30731160
      heapTotal: 60952576
      heapUsedPct: 0.5041814803692628
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.guardian.agents
  priority: 0.4569
  id: f04db479-713d-4c87-92a6-b06cbb96d14c
