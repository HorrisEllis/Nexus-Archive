envelope: 1
uuid: nexus-export-gap-7573a1d3-359a-4bc6-a7f0-caa937d15782
type: gap
id: 7573a1d3-359a-4bc6-a7f0-caa937d15782
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822173
source: data/cortex/memory/gaps.json:7573a1d3-359a-4bc6-a7f0-caa937d15782
payload:
  uuid: 06745bb2-5603-4dab-bc14-4c62e81d91b9
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.route-graph.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.route-graph.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.route-graph.test
  occurrences: 1
  detectedAt: 1789169897173
  lastSeenAt: 1789169897173
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.route-graph.test.import
    hookId: nexus.tests.modules.route-graph.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.route-graph.test
  location: null
  error: null
  resourceState:
    ts: 1789169897173
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5758021632
      freeMemPct: 0.33674582543230863
      usedMemPct: 0.6632541745676914
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81993728
      heapUsed: 33571640
      heapTotal: 60952576
      heapUsedPct: 0.55078295624454
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.route-graph.test
  priority: 0.3925
  id: 7573a1d3-359a-4bc6-a7f0-caa937d15782
