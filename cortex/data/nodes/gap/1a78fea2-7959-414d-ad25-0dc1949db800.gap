envelope: 1
uuid: nexus-export-gap-1a78fea2-7959-414d-ad25-0dc1949db800
type: gap
id: 1a78fea2-7959-414d-ad25-0dc1949db800
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822139
source: data/cortex/memory/gaps.json:1a78fea2-7959-414d-ad25-0dc1949db800
payload:
  uuid: c0da2937-1c3e-406f-be5c-a11a46d2198b
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.cortex.snapshot.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.cortex.snapshot
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.cortex.snapshot
  occurrences: 1
  detectedAt: 1789169836952
  lastSeenAt: 1789169836952
  meta:
    kernelGapUuid: wire-integrity:nexus.cortex.snapshot.import
    hookId: nexus.cortex.snapshot.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.cortex.snapshot
  location: null
  error: null
  resourceState:
    ts: 1789169836952
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324102656
      freeMemPct: 0.42833479136982927
      usedMemPct: 0.5716652086301708
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 100933632
      heapUsed: 51182072
      heapTotal: 71483392
      heapUsedPct: 0.7159994869857323
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.cortex.snapshot
  priority: 0.3925
  id: 1a78fea2-7959-414d-ad25-0dc1949db800
