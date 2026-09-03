/**
 * host/export.js
 * COMPARTMENT OS — Compartment Export/Import (.cos, single-unit YAML)
 *
 * §2026-09-03, James: "compartments exportable/importable as a single
 * measurement of unit." Confirmed this session: three real, DIFFERENT
 * compartment-adjacent export mechanisms already exist —
 *   1. vault/index.js's exportVault/importVault    — encrypted SECRETS only
 *   2. foundation/snapshot.js's SnapshotEngine      — full local backup/
 *      restore (.nex.gz), config + file manifest + process state + event
 *      tail, ALREADY REAL, not reimplemented here
 *   3. lib/node-export.js's YAML envelope           — the single-unit
 *      share/port format .hat already uses; .cos was a declared
 *      KNOWN_TYPE with zero real wiring until this file
 * Decision (James, this session): .cos wraps SnapshotEngine's real,
 * already-complete capture (not a lighter config-only shape) — one real
 * mechanism reused through a second real envelope, not three competing
 * export formats pretending to be one.
 *
 * This module does not capture or restore anything itself — it composes
 * SnapshotEngine (real capture/restore logic) with node-export.js (real
 * YAML envelope), exactly the same shape hat-forge.js's exportHat()/
 * importHat() already established for .hat. §10.3 — one real source of
 * truth per concern; this is the third of three real wirings (hat, this),
 * not a fourth thing.
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 */

'use strict';

const path = require('path');
const zlib = require('zlib');
const fs   = require('fs');

const { SnapshotEngine } = require('../foundation/snapshot.js');
const { compartmentPaths } = require('../foundation/constants.js');

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * exportCompartment(host, compartmentId, meta, destDir) -> { ok, filePath }
 * Takes a REAL snapshot via SnapshotEngine.take() (same call `cos snapshot`
 * makes) and wraps it in node-export.js's real YAML envelope. Does not
 * take a second, parallel capture path — the .cos payload IS a NexSnapshot.
 */
function exportCompartment(host, compartmentId, meta = {}, destDir) {
  const compartment = host.store.getCompartment(compartmentId);
  if (!compartment) return { ok: false, reason: `no compartment "${compartmentId}"` };

  const engine = new SnapshotEngine(host, compartment);
  const snap = engine.take(meta.triggerEvent || 'host:compartment:export', {
    includeFileHashes: meta.includeFileHashes !== false,
  });

  const nodeExport = require('../../lib/node-export.js');
  const dir = destDir || path.join(ROOT, 'data', 'exports', 'compartments');
  const filePath = nodeExport.exportToFile('cos', compartmentId, snap, {
    summary: meta.summary || `Compartment "${compartment.name || compartmentId}" — ${snap.fileManifest.length} file(s), snapshot ${snap.id}`,
    system: meta.system || 'nexus.cos.host',
    ...meta,
  }, dir);
  return { ok: true, filePath, snapId: snap.id };
}

/**
 * importCompartment(host, filePath, opts) -> engine.restore()'s real
 * result. Writes the envelope's embedded NexSnapshot to disk using the
 * EXACT SAME on-disk convention SnapshotEngine.take() itself uses
 * (`<createdAt>-<snapId>.nex.gz`, gzip'd JSON, same compartmentPaths()
 * dir) — so SnapshotEngine.restore() can load and apply it through its
 * own real, unmodified code path, not a second restore implementation.
 * opts.compartmentId lets the importer retarget onto a different real,
 * existing compartment than the one it was exported from (same "importing
 * can rename" allowance hat-forge's importHat() makes via opts.name).
 */
function importCompartment(host, filePath, opts = {}) {
  const nodeExport = require('../../lib/node-export.js');
  const envelope = nodeExport.importFromFile(filePath);
  if (envelope.type !== 'cos') {
    return { ok: false, reason: `expected a .cos export, got type "${envelope.type}"` };
  }
  const snap = envelope.payload;
  const targetId = opts.compartmentId || snap.compartmentId;
  const targetCompartment = host.store.getCompartment(targetId);
  if (!targetCompartment) {
    return { ok: false, reason: `import target compartment "${targetId}" does not exist locally — create it first (compartment identity is not fabricated on import, same discipline as hat-forge's importHat())` };
  }

  // §BUGFIX 2026-09-03, caught by actually running an export -> import-into-
  // a-DIFFERENT-compartment round trip, not assumed correct: overriding only
  // the top-level compartmentId left snap.compartment.id/name/slug/fs.root
  // still pointing at the SOURCE compartment's identity — restore() would
  // then try to write/overwrite a record under the source's id, and use the
  // source's fs.root (a path that may not even exist under this target).
  // Real fix, when retargeting onto a DIFFERENT existing compartment: keep
  // the target's own real identity/fs (id, name, slug, fs, createdAt,
  // createdBy — real things already true on disk at the target) and adopt
  // everything else from the import (purpose, network policy besides fs,
  // compiler, watchdog, hooks, tags, runtimeId, archetypeId). Same-
  // compartment import (opts.compartmentId omitted or equal to the
  // snapshot's own compartmentId) needs no such split — full config applies
  // as exported, matching what restore() already does for its own real,
  // same-compartment case.
  const isRetarget = targetId !== snap.compartmentId;
  const compartmentConfig = isRetarget
    ? {
        ...snap.compartment,
        id: targetCompartment.id, name: targetCompartment.name, slug: targetCompartment.slug,
        fs: targetCompartment.fs, createdAt: targetCompartment.createdAt, createdBy: targetCompartment.createdBy,
      }
    : snap.compartment;

  // Write the embedded snapshot into the TARGET compartment's own .nex dir,
  // under its own id, using SnapshotEngine's real filename/gzip convention
  // — so restore() below reads it through its normal, unmodified load path.
  const paths = compartmentPaths(targetId);
  fs.mkdirSync(paths.nexDir, { recursive: true });
  const restoredSnap = { ...snap, compartmentId: targetId, compartment: compartmentConfig };
  const json = JSON.stringify(restoredSnap);
  const gz = zlib.gzipSync(Buffer.from(json, 'utf8'));
  const snapFilename = `${restoredSnap.createdAt}-${restoredSnap.id}.nex.gz`;
  fs.writeFileSync(path.join(paths.nexDir, snapFilename), gz);

  const engine = new SnapshotEngine(host, targetCompartment);
  const result = engine.restore(restoredSnap.id);
  return { ok: true, ...result, snapId: restoredSnap.id, importedFrom: filePath };
}

module.exports = { exportCompartment, importCompartment };
