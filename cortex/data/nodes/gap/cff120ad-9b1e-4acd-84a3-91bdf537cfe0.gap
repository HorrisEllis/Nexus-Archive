envelope: 1
uuid: nexus-export-gap-cff120ad-9b1e-4acd-84a3-91bdf537cfe0
type: gap
id: cff120ad-9b1e-4acd-84a3-91bdf537cfe0
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822172
source: data/cortex/memory/gaps.json:cff120ad-9b1e-4acd-84a3-91bdf537cfe0
payload:
  uuid: 56751c06-1386-4663-b326-02d516bdd27e
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.tests.modules.contract-intake-tangible-file.test.import' is declared as an INPUT but
    no wire ever targets it — dead code, or a caller that was never wired
  source: nexus.tests.modules.contract-intake-tangible-file.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.tests.modules.contract-intake-tangible-file.test
  occurrences: 1
  detectedAt: 1789169897167
  lastSeenAt: 1789169897167
  meta:
    kernelGapUuid: wire-integrity:nexus.tests.modules.contract-intake-tangible-file.test.import
    hookId: nexus.tests.modules.contract-intake-tangible-file.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.tests.modules.contract-intake-tangible-file.test
  location: null
  error: null
  resourceState:
    ts: 1789169897167
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5766955008
      freeMemPct: 0.3372682752019133
      usedMemPct: 0.6627317247980866
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 81461248
      heapUsed: 33142712
      heapTotal: 60952576
      heapUsedPct: 0.5437458787631879
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.tests.modules.contract-intake-tangible-file.test
  priority: 0.3925
  id: cff120ad-9b1e-4acd-84a3-91bdf537cfe0
