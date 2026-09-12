envelope: 1
uuid: nexus-export-gap-b22ff59b-4e09-4f61-8dd4-95c532eb7d73
type: gap
id: b22ff59b-4e09-4f61-8dd4-95c532eb7d73
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822169
source: data/cortex/memory/gaps.json:b22ff59b-4e09-4f61-8dd4-95c532eb7d73
payload:
  uuid: 20b06a1e-63a1-4e59-b8fa-3d54f28c4ad7
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.mesh.lib.firewall.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.mesh.lib.firewall
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.mesh.lib.firewall
  occurrences: 1
  detectedAt: 1789169897155
  lastSeenAt: 1789169897155
  meta:
    kernelGapUuid: wire-integrity:nexus.mesh.lib.firewall.export
    hookId: nexus.mesh.lib.firewall.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.mesh.lib.firewall
  location: null
  error: null
  resourceState:
    ts: 1789169897155
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5765971968
      freeMemPct: 0.3372107841681191
      usedMemPct: 0.6627892158318809
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80863232
      heapUsed: 32284256
      heapTotal: 60952576
      heapUsedPct: 0.5296618800819838
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.mesh.lib.firewall
  priority: 0.3925
  id: b22ff59b-4e09-4f61-8dd4-95c532eb7d73
