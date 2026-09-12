envelope: 1
uuid: nexus-export-gap-d26fdf6d-5774-4ff3-8ab3-5ab410f2ac50
type: gap
id: d26fdf6d-5774-4ff3-8ab3-5ab410f2ac50
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822147
source: data/cortex/memory/gaps.json:d26fdf6d-5774-4ff3-8ab3-5ab410f2ac50
payload:
  uuid: 7dc53faa-f013-45c5-baa5-7c107d21ade4
  type: dangling-hook
  domain: system
  body: >-
    hook 'copilot.person_model.reply' is declared as an OUTPUT but no wire connects it to anything —
    an emit/call with no possible listener
  source: copilot.person_model.portrait
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::copilot.person_model.portrait
  occurrences: 1
  detectedAt: 1789169836981
  lastSeenAt: 1789169836981
  meta:
    kernelGapUuid: wire-integrity:copilot.person_model.reply
    hookId: copilot.person_model.reply
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - copilot.person_model.portrait
  location: null
  error: null
  resourceState:
    ts: 1789169836981
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7324622848
      freeMemPct: 0.42836521370854536
      usedMemPct: 0.5716347862914546
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102354944
      heapUsed: 52572112
      heapTotal: 71483392
      heapUsedPct: 0.7354451226936741
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: copilot.person_model.portrait
  priority: 0.3925
  id: d26fdf6d-5774-4ff3-8ab3-5ab410f2ac50
