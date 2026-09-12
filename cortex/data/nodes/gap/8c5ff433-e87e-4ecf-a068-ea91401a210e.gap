envelope: 1
uuid: nexus-export-gap-8c5ff433-e87e-4ecf-a068-ea91401a210e
type: gap
id: 8c5ff433-e87e-4ecf-a068-ea91401a210e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822176
source: data/cortex/memory/gaps.json:8c5ff433-e87e-4ecf-a068-ea91401a210e
payload:
  uuid: d8412dd8-5d9e-4295-938d-f2268efa94bd
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.cortex.core.raid.context-gate.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.cortex.core.raid.context-gate
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.cortex.core.raid.context-gate
  occurrences: 1
  detectedAt: 1789170197133
  lastSeenAt: 1789170197133
  meta:
    kernelGapUuid: wire-integrity:nexus.cortex.core.raid.context-gate.import
    hookId: nexus.cortex.core.raid.context-gate.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.cortex.core.raid.context-gate
  location: null
  error: null
  resourceState:
    ts: 1789170197133
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6178263040
      freeMemPct: 0.3613227632873756
      usedMemPct: 0.6386772367126243
      cpuPct: 0.16177323418914036
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101617664
      heapUsed: 35935880
      heapTotal: 58961920
      heapUsedPct: 0.6094760821899965
      external: 2282684
      uptimeSec: 360
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.cortex.core.raid.context-gate
  priority: 0.3925
  id: 8c5ff433-e87e-4ecf-a068-ea91401a210e
