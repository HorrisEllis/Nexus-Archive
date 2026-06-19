# NEXUS patch bundle — pattern dedup, diagnostic crash, redundancy flush

## What's in here

| File | Goes where | What it fixes |
|---|---|---|
| `cortex/intelligence/index.js` | `nexus-080/cortex/intelligence/index.js` | Hydrates `_patternIndex` from `bep_patterns` on boot (root cause of the boot-log spam); updates patterns in place on recurrence instead of re-inserting/re-logging; adds a real `sigHash` (sha1) field per pattern, and a `gapHash` field on the drift-gap it opens |
| `cortex/memory/jaa-db.js` | `nexus-080/cortex/memory/jaa-db.js` | Adds a public `evict(table, uuid, reason)` method (same tombstone mechanism the internal decay tick already used, just exposed) — needed by the flush script below |
| `service/nexus-diagnostic.js` | `nexus-080/service/nexus-diagnostic.js` | Defines `_getDiagEngines()`, which was called but never defined and was crashing the whole diagnostic process |
| `flush-redundancy.js` | `nexus-080/cortex/flush-redundancy.js` | One-off cleanup script — dedupes the duplicate `bep_patterns` rows and duplicate open `gaps` rows that already accumulated on disk *before* these fixes existed |

## Install order

1. Copy `cortex/intelligence/index.js`, `cortex/memory/jaa-db.js`, and `service/nexus-diagnostic.js` over your existing files (back up first if you want).
2. **Before restarting the orchestrator**, run the flush script once to clean up existing duplicate rows — the code fix only stops *new* duplicates, it doesn't retroactively merge what's already on disk:

   ```bash
   cd nexus-080/cortex
   node flush-redundancy.js --dry-run     # see what it WOULD do first
   node flush-redundancy.js               # actually evict the duplicates
   ```

   If your data directory isn't the default `nexus-080/cortex/data`, set it explicitly:
   ```bash
   NEXUS_DATA_DIR=/path/to/your/data node flush-redundancy.js --dry-run
   ```

3. Start the orchestrator as normal (`node orchestrator.js`).

## On the "hashes" question

`bep_patterns` rows now carry a `sigHash` field (`sha1(signature).slice(0,16)`) alongside the existing `signature` string — the signature string was already a perfectly good dedup key, but the hash gives you a fixed-width, fast-to-index field consistent with the hash-chain conventions used elsewhere (Phase 26's `cortex_state_hash`/`prev_snapshot_hash`).

The one gap-opening call inside `cortex/intelligence/index.js` (the `baseline_drift` gap) now carries a matching `gapHash`. **Note:** the heartbeat-side gap dedup described in Phase 23.6 (`{type, path, status:'open'}` before insert) lives in `cortex/heartbeat/index.js`, which wasn't included in the zip I was given — so it doesn't have a `gapHash` field yet. If you want that wired in too, send over `cortex/heartbeat/index.js` and I'll patch it the same way.

## Verifying it worked

After a restart, your boot log should show at most one line per pattern crystallization event ever (not every boot), and:

```
[cortex/intelligence] seeded _patternIndex: N patterns from JAA
```

should appear once, early in boot, instead of 60+ "pattern crystallised" lines.
