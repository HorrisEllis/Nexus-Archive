'use strict';
/**
 * cortex/intelligence/dedup.js
 * comp_id: nexus.cortex.intelligence.dedup
 * uuid: nexus-cortex-dedup-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/cortex-dual-cognition.spec
 *
 * Deduplication engine. Repeated patterns, gaps, errors, faults —
 * logged as a reference to the original. Original is fully detailed.
 * Duplicates carry: original_uuid, similarity_score, ts, context_delta.
 *
 * This compresses the ledger and makes patterns visible as patterns, not noise.
 */
'use strict';

const { jaaDB, uid } = require('../memory/jaa-db');
const crypto = require('crypto');

const MODULE_ID = 'cortex/intelligence/dedup';
const VERSION   = '1.0.0';
const SIMILARITY_THRESHOLD = 0.85;

// ── Fingerprint ───────────────────────────────────────────────────────────────
// A fast content-based fingerprint for dedup comparison
function _fingerprint(record) {
  const key = JSON.stringify({
    type:        record.type || record.gap_type || null,
    source:      record.source || null,
    faultClass:  record.faultClass || null,
    // Normalize the body to remove timestamps and UUIDs
    body: (record.body || record.description || record.reason || '')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
      .replace(/\d{13}/g, 'TS')
      .slice(0, 200),
  });
  return crypto.createHash('sha1').update(key).digest('hex');
}

// ── Similarity score ──────────────────────────────────────────────────────────
function _similarity(a, b) {
  if (!a || !b) return 0;
  const fpA = _fingerprint(a);
  const fpB = _fingerprint(b);
  if (fpA === fpB) return 1.0;

  // Check type + source match
  let score = 0;
  if (a.type === b.type)     score += 0.4;
  if (a.source === b.source) score += 0.2;
  if (a.faultClass === b.faultClass) score += 0.2;

  // Body similarity — basic word overlap
  const bodyA = (a.body || a.description || '').toLowerCase().split(/\s+/).filter(Boolean);
  const bodyB = (b.body || b.description || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (bodyA.length && bodyB.length) {
    const setA = new Set(bodyA);
    const setB = new Set(bodyB);
    const intersection = [...setA].filter(w => setB.has(w)).length;
    const union = new Set([...setA, ...setB]).size;
    score += 0.2 * (intersection / Math.max(union, 1));
  }

  return Math.min(1.0, score);
}

/**
 * Check if a record is a duplicate of an existing one.
 * Returns { isDuplicate, originalUuid, similarity } or null.
 *
 * @param {object} record — the new record being evaluated
 * @param {string} table  — which JAA table to check ('gaps', 'event_log', etc)
 * @param {number} windowMs — how far back to look (default 24h)
 */
function checkDuplicate(record, table, windowMs = 86400000) {
  try {
    const cutoff = Date.now() - windowMs;
    const existing = jaaDB.query(table, r => {
      // Skip if it IS this record
      if (r.uuid === record.uuid) return false;
      // Skip if it's already a reference (not the original)
      if (r._is_reference) return false;
      // Filter by time window
      if ((r.ts || r.createdAt || 0) < cutoff) return false;
      return true;
    }, 100);

    for (const e of existing) {
      const sim = _similarity(record, e);
      if (sim >= SIMILARITY_THRESHOLD) {
        return { isDuplicate: true, originalUuid: e.uuid, similarity: sim, original: e };
      }
    }
    return { isDuplicate: false };
  } catch(_) { return { isDuplicate: false }; }
}

/**
 * Record an original event with full causal detail.
 * Called by gap-loop, intelligence, self-heal when a truly new event occurs.
 */
function recordOriginal(table, record, { cause, effect, reason, causalChain, conditions } = {}) {
  const original = {
    ...record,
    uuid:         record.uuid || uid(),
    _is_original: true,
    _cause:       cause       || null,
    _effect:      effect      || null,
    _reason:      reason      || null,
    _causal_chain: causalChain || null,
    _conditions:   conditions  || null,
    _fingerprint:  _fingerprint(record),
    ts:           record.ts   || Date.now(),
  };
  try { jaaDB.insert(table, original); } catch(_) {}
  return original;
}

/**
 * Record a duplicate — just a reference, not the full record.
 * This keeps the ledger lean while preserving the signal.
 */
function recordReference(table, record, { originalUuid, similarity, contextDelta } = {}) {
  const ref = {
    uuid:             uid(),
    _is_reference:    true,
    _original_uuid:   originalUuid,
    _similarity:      similarity,
    _context_delta:   contextDelta || {},
    type:             record.type || null,
    source:           record.source || null,
    ts:               record.ts || Date.now(),
  };
  try { jaaDB.insert(table + '_refs', ref); } catch(_) {}
  return ref;
}

/**
 * Process a new record — check for duplicate, route accordingly.
 * Returns { action: 'original'|'reference', record, similarity }
 */
function process(table, record, causalContext = {}) {
  const check = checkDuplicate(record, table);
  if (check.isDuplicate) {
    const ref = recordReference(table, record, {
      originalUuid: check.originalUuid,
      similarity:   check.similarity,
      contextDelta: { current_sigma: causalContext.sigma, current_gaps: causalContext.openGaps },
    });
    return { action: 'reference', record: ref, similarity: check.similarity, originalUuid: check.originalUuid };
  } else {
    const orig = recordOriginal(table, record, causalContext);
    return { action: 'original', record: orig, similarity: 0 };
  }
}

/**
 * Get all references to an original.
 */
function getReferences(table, originalUuid) {
  try {
    return jaaDB.query(table + '_refs', r => r._original_uuid === originalUuid, 100)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch(_) { return []; }
}

function status() {
  return { version: VERSION, threshold: SIMILARITY_THRESHOLD };
}

module.exports = { checkDuplicate, recordOriginal, recordReference, process, getReferences, status, MODULE_ID, VERSION };
