envelope: 1
uuid: nexus-export-gap-0b86bcca-bbef-4495-a6fb-e4da758c0793
type: gap
id: 0b86bcca-bbef-4495-a6fb-e4da758c0793
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822136
source: data/cortex/memory/gaps.json:0b86bcca-bbef-4495-a6fb-e4da758c0793
payload:
  uuid: d42cf452-e432-498c-b954-bea43181f661
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.idearium.spec-engine.templates.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.idearium.spec-engine.templates
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.idearium.spec-engine.templates
  occurrences: 1
  detectedAt: 1789169836930
  lastSeenAt: 1789169836930
  meta:
    kernelGapUuid: wire-integrity:nexus.idearium.spec-engine.templates.import
    hookId: nexus.idearium.spec-engine.templates.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.idearium.spec-engine.templates
  location: null
  error: null
  resourceState:
    ts: 1789169836930
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7319773184
      freeMemPct: 0.4280815912751607
      usedMemPct: 0.5719184087248392
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 99983360
      heapUsed: 50230976
      heapTotal: 71221248
      heapUsedPct: 0.7052807611571199
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.idearium.spec-engine.templates
  priority: 0.3925
  id: 0b86bcca-bbef-4495-a6fb-e4da758c0793
