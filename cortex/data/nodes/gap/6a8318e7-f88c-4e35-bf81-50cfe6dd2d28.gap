envelope: 1
uuid: nexus-export-gap-6a8318e7-f88c-4e35-bf81-50cfe6dd2d28
type: gap
id: 6a8318e7-f88c-4e35-bf81-50cfe6dd2d28
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822164
source: data/cortex/memory/gaps.json:6a8318e7-f88c-4e35-bf81-50cfe6dd2d28
payload:
  uuid: f2891f4c-9c58-4d67-ade5-3ab6a8955e6c
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.generate-tool-nodes.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.lib.agent-tools.generate-tool-nodes
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.generate-tool-nodes
  occurrences: 1
  detectedAt: 1789169897134
  lastSeenAt: 1789169897134
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.generate-tool-nodes.import
    hookId: nexus.lib.agent-tools.generate-tool-nodes.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.generate-tool-nodes
  location: null
  error: null
  resourceState:
    ts: 1789169897134
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756387328
      freeMemPct: 0.3366502465886258
      usedMemPct: 0.6633497534113741
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80404480
      heapUsed: 30900160
      heapTotal: 60952576
      heapUsedPct: 0.5069541277467912
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.generate-tool-nodes
  priority: 0.3925
  id: 6a8318e7-f88c-4e35-bf81-50cfe6dd2d28
