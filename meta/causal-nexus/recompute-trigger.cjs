'use strict';
/**
 * meta/causal-nexus/recompute-trigger.js — Sigma recompute trigger
 * UUID: nexus-causal-nexus-recompute-v1-0000-2026-0712-jamesbrooks-001
 * Version: 1.0.0
 *
 * §BUILT 2026-07-12 — direct answer to: "It needs to be recomputed. When
 * there's been a file change or sigma within the code of the system."
 *
 * Two real triggers, not a poll-everything loop:
 *   1. A source file changed — fs.watch on the live tree, same pattern
 *      orchestrator.js already uses for its UI hotswap watcher (checked
 *      that file first, reused its exact convention rather than a second
 *      file-watching implementation).
 *   2. A new high-sigma entry landed in the EXISTING permanent record
 *      (cortex's jaaDB `sigma_records` table) — a divergence already
 *      detected by the write-time scorer is exactly the moment a fresh,
 *      independent read matters most.
 *
 * §DESIGN DECISION 2026-07-12 — the two sigma philosophies conflict on
 * purpose, not by accident: the existing `meta/cfr/sigma.js` stores once,
 * permanently, at write time (real consumers depend on that: RAID, cortex
 * health checks — not touched here). The new engine
 * (meta/causal-nexus/modules/sigma) is a pure observer that recomputes
 * fresh from a live kinematic window and is *never* stored by design.
 * Per direction: the recompute engine wins for anything asking "what is
 * the regime right now" — but it writes its output to a NEW table
 * (`sigma_live`), not over the permanent one. Old consumers of
 * `sigma_records` are unaffected; anything that wants a live, recomputed
 * read uses this instead. Two tables, two honest meanings, no silent
 * overwrite of a system three other subsystems already trust.
 *
 * This module owns exactly one live kernel instance — not because the
 * rest of the causal-nexus package couldn't run more, but because a
 * second independent event stream would mean two different "current
 * state"s to reconcile, which is the same kind of two-sources-of-truth
 * problem this whole session has been finding and fixing elsewhere.
 */

const fs = require('fs');
const path = require('path');
const { jaaDB } = require('../../cortex/memory/jaa-db.js');

// §NODE VERSION NOTE — the causal-nexus package (modules/kernel etc.) is
// ESM ("type": "module" in its own package.json). This file requires it
// directly via CJS require(), relying on Node's native require(esm)
// support (stable as of the Node 22 line this environment runs — verified
// directly, not assumed). On an older Node version this require() would
// throw ERR_REQUIRE_ESM; the guard in _getModules() below catches that
// the same way it catches any other load failure, but the root cause
// would be the Node version, worth checking first if this ever surfaces.

let _kernel = null;
let _causalStore = null;
let _sigmaEngine = null;
let _fileWatcher = null;
let _sigmaPollTimer = null;
let _lastSeenSigmaTs = 0;
let _bridgedEventIds = new Set(); // avoid re-ingesting the same jaaDB row twice across polls

const WATCH_DIRS = ['cortex', 'idearium', 'guardian', 'cos', 'warp']; // the live, actively-edited systems — not the whole tree, to keep fs.watch bounded
const SIGMA_POLL_MS = 5000;
const RECOMPUTE_DEBOUNCE_MS = 2000; // a burst of file saves or sigma writes triggers one recompute, not N

function _getModules() {
  // Lazy, guarded — same reasoning as fix-map/bep-lookup/causal-lookup's
  // guarded requires this session: this trigger module shouldn't be able
  // to crash whatever process requires it if the causal-nexus package
  // isn't fully present, or require(esm) isn't supported on this Node
  // version, for some reason.
  if (!_kernel) {
    try {
      const { createKernel } = require('./modules/kernel/index.js');
      const { createSigmaEngine } = require('./modules/sigma/index.js');
      const { computeDeltaStream } = require('./modules/delta/index.js');
      _kernel = createKernel({ ringCap: 50000 });
      _sigmaEngine = createSigmaEngine();
      _computeDeltaStream = computeDeltaStream;
    } catch (e) {
      throw new Error(`[causal-nexus/recompute-trigger] could not load causal-nexus modules (Node version ${process.version} — require(esm) needs Node 22+): ${e.message}`);
    }
  }
  return _kernel;
}
let _computeDeltaStream = null;

/**
 * _bridgeRecentEvents() — pulls whatever's new in jaaDB's event_log since
 * the last bridge and ingests it into the live kernel. This is what makes
 * the kernel's ring buffer a real reflection of current system activity,
 * not a cold, empty instance the moment it's created.
 */
function _bridgeRecentEvents(limit = 500) {
  const kernel = _getModules();
  const rows = jaaDB.tail('event_log', limit);
  let bridged = 0;
  for (const row of rows) {
    const id = row.uuid || row.id;
    if (!id || _bridgedEventIds.has(id)) continue;
    kernel.ingest(row.type || 'unknown', row, {
      causedBy:  row.causedBy || undefined,
      sessionId: row.sessionId || undefined,
    });
    _bridgedEventIds.add(id);
    bridged++;
  }
  // Bound the dedup set the same way the kernel bounds its own seenMap —
  // unbounded growth here would be the same class of bug this session
  // already fixed once (§H-6 in the kernel's own header).
  if (_bridgedEventIds.size > 20000) {
    _bridgedEventIds = new Set([..._bridgedEventIds].slice(-10000));
  }
  return bridged;
}

/**
 * recompute(reason) — the real operation. Bridges fresh events, builds a
 * real kinematic window from the live kernel, classifies via the pure-
 * observer engine, and writes ONE row to sigma_live. Honest empty: if
 * there's too little data for a real window, sigma's own classify()
 * already returns an UNKNOWN-regime result with a reason — that gets
 * logged too, not suppressed, so a gap in sigma_live is distinguishable
 * from "this trigger stopped firing" versus "nothing to classify yet."
 */
function recompute(reason = 'manual') {
  const kernel = _getModules();
  _bridgeRecentEvents();

  const all = kernel.getAll();
  if (!all.length) {
    jaaDB.insert('sigma_live', {
      ts: Date.now(), trigger: reason, regime: 'no-data',
      confidence: 0, note: 'kernel has no bridged events yet',
    });
    return null;
  }

  const window = _computeDeltaStream(all, kernel.findById, kernel.edgeMeta, kernel.getChildren);
  const result = _sigmaEngine.classify(window);

  jaaDB.insert('sigma_live', {
    ts: Date.now(),
    trigger: reason,
    regime: result.regime,
    dominantCause: result.dominantCause,
    confidence: result.confidence,
    windowSize: window.length,
  });

  return result;
}

let _debounceTimer = null;
function _debouncedRecompute(reason) {
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => recompute(reason), RECOMPUTE_DEBOUNCE_MS);
}

/**
 * start(rootDir) — wires both real triggers. Idempotent — calling twice
 * doesn't double-watch or double-poll.
 */
function start(rootDir) {
  if (_fileWatcher || _sigmaPollTimer) return; // already running

  // Trigger 1 — file change, same fs.watch convention orchestrator.js
  // already uses (checked its implementation before writing this).
  const watchers = [];
  for (const dir of WATCH_DIRS) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) continue;
    try {
      const w = fs.watch(fullPath, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        _debouncedRecompute(`file-change:${dir}/${filename}`);
      });
      watchers.push(w);
    } catch (e) {
      console.warn(`[causal-nexus/recompute-trigger] could not watch ${fullPath}: ${e.message}`);
    }
  }
  _fileWatcher = watchers;

  // Trigger 2 — a new high-sigma entry in the existing permanent record.
  _lastSeenSigmaTs = Date.now();
  _sigmaPollTimer = setInterval(() => {
    let rows;
    try { rows = jaaDB.query('sigma_records', {}); }
    catch (e) { return; } // table doesn't exist yet — nothing to react to
    const fresh = rows.filter(r => (r.ts || 0) > _lastSeenSigmaTs && (r.sigma || 0) >= 0.5);
    if (fresh.length) {
      _lastSeenSigmaTs = Math.max(...fresh.map(r => r.ts));
      _debouncedRecompute(`sigma-divergence:${fresh.length} new entr${fresh.length === 1 ? 'y' : 'ies'}`);
    }
  }, SIGMA_POLL_MS);
  _sigmaPollTimer.unref();

  console.log('[causal-nexus/recompute-trigger] started — watching file changes + sigma divergence');
}

function stop() {
  if (_fileWatcher) { _fileWatcher.forEach(w => w.close()); _fileWatcher = null; }
  if (_sigmaPollTimer) { clearInterval(_sigmaPollTimer); _sigmaPollTimer = null; }
}

module.exports = { start, stop, recompute };
