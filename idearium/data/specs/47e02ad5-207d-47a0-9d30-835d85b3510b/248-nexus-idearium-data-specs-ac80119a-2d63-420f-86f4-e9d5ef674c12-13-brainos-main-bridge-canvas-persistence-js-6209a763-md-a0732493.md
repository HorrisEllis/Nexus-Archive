---
chunk_uuid: a0732493-0069-4d40-b45e-e3e7837d0e03
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-13-brainos-main-bridge-canvas-persistence-js-6209a763-md
title: nexus/idearium/data/specs/ac80119a-2d63-420f-86f4-e9d5ef674c12/13-brainos-main-bridge-canvas-persistence-js-6209a763.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-13-brainos-main-bridge-canvas-persistence-js-6209a763-md
contract_id: spec-contract:47e02ad5:nexus-idearium-data-specs-ac80119a-2d63-420f-86f4-e9d5ef674c12-13-brainos-main-bridge-canvas-persistence-js-6209a763-md:a0732493
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:06:26.255Z
---

---
chunk_uuid: 6209a763-0971-410a-bbac-70fbccf7a0c1
spec_uuid: ac80119a-2d63-420f-86f4-e9d5ef674c12
section: brainos-main-bridge-canvas-persistence-js
title: BrainOS-main/bridge-canvas-persistence.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac80119a:brainos-main-bridge-canvas-persistence-js
contract_id: spec-contract:ac80119a:brainos-main-bridge-canvas-persistence-js:6209a763
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:28:01.781Z
---

/**
 * BRIDGE CANVAS PERSISTENCE — Phase 1 Foundation
 * UUID: bridge-canvas-persist-0001-phase1-foundation
 *
 * Adds 6 routes to nexus-bridge-server.js:
 *   GET  /canvas/state          — load full canvas state from disk
 *   POST /canvas/state          — save full canvas state to disk (debounced internally)
 *   GET  /canvas/nodes          — node registry only
 *   POST /canvas/node           — upsert a single node (UUID-keyed)
 *   DELETE /canvas/node/:id     — remove node from registry
 *   GET  /canvas/deltas         — delta log (last N, filterable)
 *   POST /canvas/delta          — append a delta entry
 *   GET  /canvas/snr-rules      — load SNR rules
 *   POST /canvas/snr-rules      — save full SNR rules array
 *   GET  /canvas/keys           — load key rotation state
 *   POST /canvas/keys           — save key rotation state
 *   GET  /canvas/health         — canvas persistence layer health
 *
 * Storage layout (all under DATA_DIR):
 *   canvas-state.json     — full canvas snapshot (nodes, tunnels, cam)
 *   canvas-nodes.json     — UUID-keyed node registry
 *   canvas-deltas.jsonl   — append-only delta log
 *   canvas-snr-rules.json — SNR filter rules
 *   canvas-keys.json      — key rotation timestamps + config
 *
 * Axioms enforced:
 *   - Nothing exists until proven (watchdog verifies files on init)
 *   - Persistence is the golden rule (every write is atomic via temp+rename)
 *   - No fake data — if file missing, returns empty not mock
 *   - UUIDs on everything
 *   - Bridge is the persistence layer — canvas is a client
 *   - Pre-emptive bug fixes: atomic writes, parse guards, CORS, error logging
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Schema version — bump when canvas state shape changes ────────────────────
const SCHEMA_VERSION = 1;
const MAX_DELTAS     = 5000; // JSONL cap before rotation

// ── Module state ─────────────────────────────────────────────────────────────
let _dataDir   = null;
let _busEmit   = () => {};
let _saveCfg   = () => {};
let _installed = false;

// File paths (set on install)
const P = {};

// ── Atomic write — temp + rename, never corrupts on crash ────────────────────
function atomicWrite(filePath, content) {
  const tmp = filePath + '.tmp.' + crypto.randomBytes(4).toString('hex');
  try {
    fs.writeFileSync(tmp, content, 'utf8');
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch {}
    throw err;
  }
}

// ── Safe JSON parse — never throws ───────────────────────────────────────────
function safeJSON(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

// ── Read file or return null (no throw) ──────────────────────────────────────
function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch { return null; }
}

// ── Watchdog — verify all storage files exist and are readable ───────────────
function watchdog() {
  const results = {};
  for (const [key, filePath] of Object.entries(P)) {
    const exists = fs.existsSync(filePath);
    const readable = exists ? (() => { try { fs.readFileSync(filePath, 'utf8'); return true; } catch { return false; } })() : false;
    results[key] = { exists, readable, path: filePath };
  }
  const allOk = Object.values(results).every(r => !r.exists || r.readable);
  _busEmit('canvas:watchdog', { results, allOk }, allOk ? 'INFO' : 'ERROR');
  return { ok: allOk, results };
}

// ── Init storage files if absent ─────────────────────────────────────────────
function ensureStorageFiles() {
  // canvas-state.json
  if (!fs.existsSync(P.state)) {
    atomicWrite(P.state, JSON.stringify({
      schema: SCHEMA_VERSION,
      version: '3.2.0',
      created: Date.now(),
      savedAt: null,
      nodes: [],
      tunnels: [],
      cam: { x: 0, y: 0, z: 1 },
      snrConfig: { threshold: 5, fastLane: 7, blockBelow: 2, m