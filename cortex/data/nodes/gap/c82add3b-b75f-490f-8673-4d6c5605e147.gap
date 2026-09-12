envelope: 1
uuid: nexus-export-gap-c82add3b-b75f-490f-8673-4d6c5605e147
type: gap
id: c82add3b-b75f-490f-8673-4d6c5605e147
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822170
source: data/cortex/memory/gaps.json:c82add3b-b75f-490f-8673-4d6c5605e147
payload:
  uuid: 6f40fbf4-eeb0-4a5a-b6dd-87909b26660c
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.lib.cos-seam-artifact-staging.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.lib.cos-seam-artifact-staging.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.lib.cos-seam-artifact-staging.test
  occurrences: 1
  detectedAt: 1789169897160
  lastSeenAt: 1789169897160
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.lib.cos-seam-artifact-staging.test.import
    hookId: nexus.tests.lib.cos-seam-artifact-staging.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.lib.cos-seam-artifact-staging.test
  location: null
  error: null
  resourceState:
    ts: 1789169897160
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766926336
      freeMemPct: 0.3372665983800943
      usedMemPct: 0.6627334016199057
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81244160
      heapUsed: 32623904
      heapTotal: 60952576
      heapUsedPct: 0.5352342122505208
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.lib.cos-seam-artifact-staging.test
  priority: 0.3925
  id: c82add3b-b75f-490f-8673-4d6c5605e147
