envelope: 1
uuid: nexus-export-gap-f08eecb8-00b7-4335-91b9-e7343a5a4598
type: gap
id: f08eecb8-00b7-4335-91b9-e7343a5a4598
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822177
source: data/cortex/memory/gaps.json:f08eecb8-00b7-4335-91b9-e7343a5a4598
payload:
  uuid: 157558ad-b001-46e4-9ad2-93e86e1fa001
  type: lifeline.provider-error
  domain: system
  body: 'guardian call threw: timeout'
  source: guardian
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::lifeline.provider-error::guardian
  occurrences: 4
  detectedAt: 1789179692125
  lastSeenAt: 1789179827228
  meta:
    error: timeout
  requested: null
  received: null
  systemsInvolved:
    - guardian
  location: null
  error: null
  resourceState:
    ts: 1789179692126
    pid: 20816
    system:
      totalMem: 17099014144
      freeMem: 4046548992
      freeMemPct: 0.23665393559662756
      usedMemPct: 0.7633460644033725
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 331825152
      heapUsed: 125303488
      heapTotal: 145633280
      heapUsedPct: 0.860404215300239
      external: 3059233
      uptimeSec: 258
    pressure:
      level: pressure
      reasons:
        - heap 86.0% of allocated
      spawnSafe: true
  why: null
  component: null
  priority: 0.4515
  id: f08eecb8-00b7-4335-91b9-e7343a5a4598
