envelope: 1
uuid: nexus-export-gap-0f4c1a20-c4a3-4f3e-b9da-643634eea888
type: gap
id: 0f4c1a20-c4a3-4f3e-b9da-643634eea888
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822169
source: data/cortex/memory/gaps.json:0f4c1a20-c4a3-4f3e-b9da-643634eea888
payload:
  uuid: 56a9fead-82fe-457a-81dc-e8145f376055
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.install.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.mesh.install
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.install
  occurrences: 1
  detectedAt: 1789169897151
  lastSeenAt: 1789169897151
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.install.import
    hookId: nexus.mesh.install.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.install
  location: null
  error: null
  resourceState:
    ts: 1789169897151
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5760712704
      freeMemPct: 0.3369032071373202
      usedMemPct: 0.6630967928626799
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80613376
      heapUsed: 32039864
      heapTotal: 60952576
      heapUsedPct: 0.5256523366625226
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.install
  priority: 0.3925
  id: 0f4c1a20-c4a3-4f3e-b9da-643634eea888
