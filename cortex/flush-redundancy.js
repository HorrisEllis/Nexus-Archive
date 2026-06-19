'use strict';
// ── flush-redundancy.js ────────────────────────────────────────────────────
// One-off cleanup tool. Run this ONCE after dropping in the patched
// cortex/intelligence/index.js, cortex/memory/jaa-db.js, and
// service/nexus-diagnostic.js.
//
// WHY THIS EXISTS:
// The pattern-engine fix stops *future* boots from creating duplicate
// bep_patterns rows, but bep_patterns is a long-term table (no automatic
// decay — see jaa-db.js's MEMORY_TIERS) and you already have however many
// boots' worth of duplicate rows sitting in it on disk. This script:
//
//   1. Opens the real JaaDB at your data dir (same path cortex/boot.js uses)
//   2. Groups bep_patterns rows by signature (falling back to a freshly
//      computed sigHash for legacy rows that predate the hash fix)
//   3. Keeps ONE row per signature — the earliest by `ts` (the true genesis
//      occurrence) — merges count/lastSeen/confidence from all duplicates
//      into it, and evicts (tombstones, via the new jaaDB.evict()) the rest
//   4. Does the same pass over `gaps` for any duplicate OPEN gaps sharing
//      {type, path} that accumulated before Phase 23.6-style dedup applied
//      to a given producer (this file only touches gaps already present on
//      disk; it doesn't change any producer's runtime behavior)
//   5. Prints a summary. Nothing is deleted from disk — eviction is a
//      tombstone mutation (§2.1 — persistence before everything), so this
//      is reversible by inspecting the table's .jsonl history if needed.
//
// USAGE:
//   node flush-redundancy.js                     # uses cortex/data (default)
//   NEXUS_DATA_DIR=/path/to/data node flush-redundancy.js
//   node flush-redundancy.js --dry-run            # report only, evict nothing
//
// Run this from inside your nexus-080/cortex/ directory (or point
// NEXUS_DATA_DIR at the right data folder) so the relative require below
// resolves to your real jaa-db.js.

const path = require('path');
const { createHash } = require('crypto');

const DRY_RUN = process.argv.includes('--dry-run');
const DATA_DIR = process.env.NEXUS_DATA_DIR || path.join(__dirname, 'data');

function sigHash(sig) {
  return createHash('sha1').update(sig).digest('hex').slice(0, 16);
}

// FIX (James, 2026-06-19 — "command to purge redundant gaps and patterns"):
// this was a manual one-off script only — not reachable from any CLI or API.
// runFlush() is the same dedup logic, refactored to take an ALREADY-OPEN
// jaaDB (so a caller like orchestrator.js's CLI can reuse its own existing
// connection instead of opening a second one) and to return a structured
// summary instead of only printing to console. main() below is now a thin
// CLI wrapper around it — `node flush-redundancy.js [--dry-run]` still
// works exactly as documented above, opening + closing its own connection.
async function runFlush({ jaaDB, dryRun = false, log = console.log } = {}) {
  if (!jaaDB) throw new Error('runFlush requires an already-open jaaDB instance');

  // ── 1. bep_patterns dedup ──────────────────────────────────────────────────
  const patterns = jaaDB.query('bep_patterns', () => true, 100_000);
  const groups = new Map(); // key -> rows[]

  for (const p of patterns) {
    const key = p.signature || (p.sigHash ? `hash::${p.sigHash}` : `hash::${sigHash(JSON.stringify(p))}`);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }

  let patternDupesFound = 0;
  let patternRowsEvicted = 0;
  const patternDetail = [];

  for (const [key, rows] of groups) {
    if (rows.length <= 1) continue;
    patternDupesFound++;

    // Keep the earliest row as canonical (true genesis occurrence)
    rows.sort((a, b) => (a.ts || a._ts || 0) - (b.ts || b._ts || 0));
    const canonical = rows[0];
    const dupes = rows.slice(1);

    const mergedCount = rows.reduce((sum, r) => sum + (r.count || 1), 0);
    const mergedLastSeen = Math.max(...rows.map(r => r.lastSeen || r.ts || r._ts || 0));
    const mergedConfidence = Math.max(...rows.map(r => r.confidence || 0));
    const hash = canonical.sigHash || sigHash(canonical.signature || key);

    log(`[flush] "${key}" — ${rows.length} rows → keeping ${canonical.uuid} ` +
      `(merged count: ${mergedCount}, evicting ${dupes.length})`);
    patternDetail.push({ key, rowCount: rows.length, canonical: canonical.uuid, evicted: dupes.length, mergedCount });

    if (!dryRun) {
      jaaDB.update('bep_patterns', canonical.uuid, {
        count: mergedCount,
        lastSeen: mergedLastSeen,
        confidence: Math.min(1, mergedConfidence),
        sigHash: hash,
      });
      for (const d of dupes) {
        jaaDB.evict('bep_patterns', d.uuid, 'flush-redundancy: duplicate of ' + canonical.uuid);
        patternRowsEvicted++;
      }
    } else {
      patternRowsEvicted += dupes.length;
    }
  }

  // ── 2. gaps dedup (open gaps sharing {type, path}, mirrors Phase 23.6) ─────
  const openGaps = jaaDB.query('gaps', g => g.status === 'open', 100_000);
  const gapGroups = new Map();

  for (const g of openGaps) {
    const key = g.gapHash || `${g.type}::${g.path || g.source || ''}`;
    if (!gapGroups.has(key)) gapGroups.set(key, []);
    gapGroups.get(key).push(g);
  }

  let gapDupesFound = 0;
  let gapRowsEvicted = 0;
  const gapDetail = [];

  for (const [key, rows] of gapGroups) {
    if (rows.length <= 1) continue;
    gapDupesFound++;

    rows.sort((a, b) => (a.ts || a.createdAt || 0) - (b.ts || b.createdAt || 0));
    const canonical = rows[0];
    const dupes = rows.slice(1);
    const mergedAttempts = rows.reduce((sum, r) => sum + (r.attempts || 1), 0);

    log(`[flush] open gap "${key}" — ${rows.length} duplicate open rows → ` +
      `keeping ${canonical.uuid} (merged attempts: ${mergedAttempts}, evicting ${dupes.length})`);
    gapDetail.push({ key, rowCount: rows.length, canonical: canonical.uuid, evicted: dupes.length, mergedAttempts });

    if (!dryRun) {
      jaaDB.update('gaps', canonical.uuid, { attempts: mergedAttempts });
      for (const d of dupes) {
        jaaDB.evict('gaps', d.uuid, 'flush-redundancy: duplicate open gap of ' + canonical.uuid);
        gapRowsEvicted++;
      }
    } else {
      gapRowsEvicted += dupes.length;
    }
  }

  const summary = {
    dryRun,
    patterns: { scanned: patterns.length, signaturesWithDupes: patternDupesFound, rowsEvicted: patternRowsEvicted, detail: patternDetail },
    gaps:     { scanned: openGaps.length, keysWithDupes: gapDupesFound, rowsEvicted: gapRowsEvicted, detail: gapDetail },
  };

  log('');
  log('── flush summary ──────────────────────────────────────────');
  log(`bep_patterns : ${summary.patterns.scanned} rows scanned, ${summary.patterns.signaturesWithDupes} signatures had dupes, ` +
    `${summary.patterns.rowsEvicted} rows ${dryRun ? 'would be evicted' : 'evicted'}`);
  log(`gaps (open)  : ${summary.gaps.scanned} rows scanned, ${summary.gaps.keysWithDupes} keys had dupes, ` +
    `${summary.gaps.rowsEvicted} rows ${dryRun ? 'would be evicted' : 'evicted'}`);
  if (dryRun) log('\nRe-run without --dry-run to actually evict.');

  return summary;
}

// ── Standalone CLI entrypoint ─────────────────────────────────────────────────
// Only runs when this file is executed directly (`node flush-redundancy.js`),
// not when runFlush is required and called in-process by another module.
async function main() {
  let jaaDB;
  try {
    ({ jaaDB } = require('./memory/jaa-db'));
  } catch (e) {
    console.error('Could not require ./memory/jaa-db — run this script from inside nexus-080/cortex/, ' +
      'or copy it next to your real memory/jaa-db.js.');
    console.error(e.message);
    process.exit(1);
  }

  await jaaDB.open(DATA_DIR);
  console.log(`[flush] opened JaaDB at ${DATA_DIR}${DRY_RUN ? '  (DRY RUN — nothing will be evicted)' : ''}`);

  await runFlush({ jaaDB, dryRun: DRY_RUN, log: console.log });

  await jaaDB.close();
}

if (require.main === module) {
  main().catch(e => { console.error('[flush] fatal:', e); process.exit(1); });
}

module.exports = { runFlush, sigHash };
