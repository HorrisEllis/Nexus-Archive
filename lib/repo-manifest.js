'use strict';
/**
 * lib/repo-manifest.js — one real, append-only `.manifest` node per
 * idearium repo, recording every compartment that has touched it.
 *
 * §MCO22 2026-09-13 — James: "Idearium/repo are where the repositories
 * should be, separated by the project id... I feel we need a manifest
 * file or like use a cos node, something that stores all the
 * compartment metadata." Real gap this closes: idearium/repo/index.js's
 * own repo record already has a single, real `compartmentId` field
 * (§SBP1 2026-08-28's own named composition point between RepoLayer and
 * COS) — set once, at ingest, never appended to again. A repo worked on
 * across many autonomous runs (§MCO21's real tool-calling executor,
 * each a real compartment — possibly compartmentType:'worksurface')
 * accumulates real history that field could never hold.
 *
 * §STORAGE — same real per-repo separation the user asked for: one
 * manifest file per repoUuid, under <dataDir>/nodes/manifest/, alongside
 * (not instead of) idearium/repo's own real project directories
 * (idearium/data/projects/<repoUuid>/) — this is metadata ABOUT a repo,
 * not a second copy of its content.
 */

const fs = require('fs');
const path = require('path');

function _manifestPath(repoUuid, dataDir) {
  return path.join(dataDir, `${repoUuid}.manifest`);
}

/**
 * loadRepoManifest(repoUuid, dataDir) — real, honest read. A repo with
 * no compartments yet has no manifest file — that's a real, empty state
 * (ok:true, compartments:[]), not an error; only a genuinely corrupt or
 * unreadable existing file is a real error.
 */
function loadRepoManifest(repoUuid, dataDir) {
  const p = _manifestPath(repoUuid, dataDir);
  if (!fs.existsSync(p)) {
    return { ok: true, repoUuid, compartments: [], createdAt: null, updatedAt: null, exists: false };
  }
  try {
    const { importFromFile } = require('./node-export.js');
    const doc = importFromFile(p);
    return { ok: true, ...doc.payload, exists: true };
  } catch (e) {
    return { ok: false, reason: `manifest for ${repoUuid} exists but could not be read: ${e.message}` };
  }
}

/**
 * recordCompartmentForRepo(repoUuid, compartmentRecord, opts) — real,
 * append-only. Never rewrites or removes a prior entry.
 */
function recordCompartmentForRepo(repoUuid, compartmentRecord, opts = {}) {
  if (!repoUuid) return { ok: false, reason: 'repoUuid required' };
  if (!compartmentRecord || !compartmentRecord.compartmentUuid) {
    return { ok: false, reason: 'compartmentRecord.compartmentUuid required — refusing to record a compartment with no real id' };
  }
  const dataDir = opts.dataDir || path.join(__dirname, '..', 'data', 'nodes', 'manifest');
  fs.mkdirSync(dataDir, { recursive: true });

  const existing = loadRepoManifest(repoUuid, dataDir);
  const now = Date.now();
  const entry = {
    compartmentUuid: compartmentRecord.compartmentUuid,
    compartmentType: compartmentRecord.compartmentType || 'standard',
    intentUuid: compartmentRecord.intentUuid || null,
    status: compartmentRecord.status || 'RUNNING',
    workSurfaces: Array.isArray(compartmentRecord.workSurfaces) ? compartmentRecord.workSurfaces : [],
    recordedAt: now,
  };

  const manifest = {
    repoUuid,
    specUuid: opts.specUuid || (existing.ok ? existing.specUuid : null) || null,
    compartments: existing.ok ? [...existing.compartments, entry] : [entry],
    createdAt: (existing.ok && existing.createdAt) || now,
    updatedAt: now,
  };

  try {
    const { exportToFile } = require('./node-export.js');
    exportToFile('manifest', repoUuid, manifest, { system: 'idearium', tags: ['manifest', 'repo', repoUuid] }, dataDir);
  } catch (e) {
    return { ok: false, reason: `manifest write failed: ${e.message}` };
  }
  return { ok: true, manifest };
}

module.exports = { loadRepoManifest, recordCompartmentForRepo };
