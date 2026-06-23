# gap-lifecycle — Phase 23.7

## Deploy order (§3.1 bottom-up)
1. cortex/memory/jaa-db.js         — new tables first
2. lib/gap-predicate.js            — new file, no conflicts
3. lib/open-loop-taxonomy.js       — createLoop enrichment
4. service/nexus-diagnostic.js     — dedup at gap creation
5. cortex/gap-loop.js              — closure verifier on job.complete
6. guardian/server.js              — job meta + contract polling
7. cortex/core/raid/index.js       — Qwen classifier (independent)

## What this fixes
The 300-job flood: gaps marked 'investigating' on dispatch.
Diagnostic sweep skips investigating gaps entirely.
Closure only via predicate + artifact verification, not job completion.

## New logs
[gap-predicate] gap <uuid> deduplicated · seam_orphan_resume (recurrence: N)
[gap-predicate] ✓ gap <uuid> RESOLVED · artifact found
[gap-predicate] ↺ gap <uuid> still open · <reason>
[gap-predicate] ⌛ gap <uuid> expired
[gap-predicate] ⛔ gap <uuid> BLOCKED · 10 attempts exhausted
[guardian] 📋 reflection contract dispatched · <uuid> · CAPABILITY
