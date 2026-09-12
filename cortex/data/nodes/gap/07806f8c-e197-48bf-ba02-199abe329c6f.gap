envelope: 1
uuid: nexus-export-gap-07806f8c-e197-48bf-ba02-199abe329c6f
type: gap
id: 07806f8c-e197-48bf-ba02-199abe329c6f
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822141
source: data/cortex/memory/gaps.json:07806f8c-e197-48bf-ba02-199abe329c6f
payload:
  uuid: d155ff35-fdfc-4a7b-a0ee-93b3f30ee768
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.nerve-ollama-bridge.import' is declared as an INPUT but no wire ever targets it
    — dead code, or a caller that was never wired
  source: nexus.lib.nerve-ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.nerve-ollama-bridge
  occurrences: 1
  detectedAt: 1789169836965
  lastSeenAt: 1789169836965
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.nerve-ollama-bridge.import
    hookId: nexus.lib.nerve-ollama-bridge.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.nerve-ollama-bridge
  location: null
  error: null
  resourceState:
    ts: 1789169836965
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7322476544
      freeMemPct: 0.4282396916180947
      usedMemPct: 0.5717603083819053
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101523456
      heapUsed: 51788168
      heapTotal: 71483392
      heapUsedPct: 0.7244783235803919
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.nerve-ollama-bridge
  priority: 0.3925
  id: 07806f8c-e197-48bf-ba02-199abe329c6f
