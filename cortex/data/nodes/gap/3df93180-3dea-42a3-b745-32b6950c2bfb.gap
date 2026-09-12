envelope: 1
uuid: nexus-export-gap-3df93180-3dea-42a3-b745-32b6950c2bfb
type: gap
id: 3df93180-3dea-42a3-b745-32b6950c2bfb
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:3df93180-3dea-42a3-b745-32b6950c2bfb
payload:
  uuid: 1cdfcd15-8c83-4839-9778-ffdfc2846885
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.loom-schema-split.test.import' is declared as an INPUT but no wire ever
    targets it — dead code, or a caller that was never wired
  source: nexus.tests.loom-schema-split.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.loom-schema-split.test
  occurrences: 1
  detectedAt: 1789169897162
  lastSeenAt: 1789169897162
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.loom-schema-split.test.import
    hookId: nexus.tests.loom-schema-split.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.loom-schema-split.test
  location: null
  error: null
  resourceState:
    ts: 1789169897162
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766795264
      freeMemPct: 0.3372589329089217
      usedMemPct: 0.6627410670910783
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81375232
      heapUsed: 32789528
      heapTotal: 60952576
      heapUsedPct: 0.5379514723052886
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.loom-schema-split.test
  priority: 0.3925
  id: 3df93180-3dea-42a3-b745-32b6950c2bfb
