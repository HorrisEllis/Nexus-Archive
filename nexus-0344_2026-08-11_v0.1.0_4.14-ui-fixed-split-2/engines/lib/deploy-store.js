'use strict';
/**
 * engines/lib/deploy-store.js — staging, atomic promote, rollback
 * ─────────────────────────────────────────────────────────────────────────────
 * §3.1 bottom-up: this layer knows about directories on disk and one concept
 * — "releases" of a site — but nothing about HTTP, sites-as-vhost-objects, or
 * zip parsing. It consumes decompressed entries (from safe-zip.js) and a
 * hostname string. That's the whole surface.
 *
 * Layout:
 *   sites/{hostname}/releases/{deployId}/   ← real extracted content, one dir per deploy
 *   sites/{hostname}/public                 ← SYMLINK to the current release (or, before
 *                                              the first deploy through this module, a real
 *                                              directory — see migrateLegacyPublic)
 *
 * Promotion is a symlink swap: build the full new release directory off to the
 * side, then atomically repoint `public`. `rename()` replacing an existing
 * symlink is atomic on POSIX — there is no window where `public` points at a
 * half-built directory, and no window where it points at nothing. §17.10
 * (verify before you promote) and §0.3 (nothing simply disappears) both fall
 * out of this for free: old releases are never deleted by a deploy, only by
 * an explicit, separate prune call.
 *
 * "merge" and "subfolder" modes are not special-cased at the promote layer —
 * they're resolved when the *new release directory* is built: copy the
 * current release's files in first (merge) or into a namespaced path
 * (subfolder), then overlay the new entries. The swap itself is always a
 * plain replace of one complete, self-contained directory for another.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

function sitesDir(root) { return path.join(root, 'sites'); }
function siteDir(root, hostname) { return path.join(sitesDir(root), hostname); }
function releasesDir(root, hostname) { return path.join(siteDir(root, hostname), 'releases'); }
function publicLink(root, hostname) { return path.join(siteDir(root, hostname), 'public'); }
function releasePath(root, hostname, deployId) { return path.join(releasesDir(root, hostname), deployId); }

function newDeployId() {
  return Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
}

function ensureDirs(root, hostname) {
  fs.mkdirSync(releasesDir(root, hostname), { recursive: true });
}

/**
 * If `public` already exists as a REAL directory (pre-dates this module,
 * e.g. the placeholder index.html webserver.js writes on vhost creation),
 * fold it into releases/ as a legacy release and repoint public at it via
 * symlink. Idempotent — a no-op if public is already a symlink or absent.
 * Never deletes the original content (§0.3).
 */
function migrateLegacyPublic(root, hostname) {
  ensureDirs(root, hostname);
  const link = publicLink(root, hostname);
  let lst;
  try { lst = fs.lstatSync(link); } catch { return null; } // doesn't exist yet — fine, first deploy creates it
  if (lst.isSymbolicLink()) return currentReleaseId(root, hostname);

  const legacyId = 'legacy-' + newDeployId();
  const dest = releasePath(root, hostname, legacyId);
  fs.renameSync(link, dest); // same filesystem (both under sites/{hostname}) — this rename is itself atomic
  fs.symlinkSync(dest, link, 'dir');
  return legacyId;
}

function currentReleaseId(root, hostname) {
  const link = publicLink(root, hostname);
  try {
    const lst = fs.lstatSync(link);
    if (!lst.isSymbolicLink()) return null; // legacy real dir, not yet migrated
    const target = fs.readlinkSync(link);
    return path.basename(target);
  } catch { return null; }
}

function copyDirInto(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.cpSync(srcDir, destDir, { recursive: true, errorOnExist: false, force: true });
}

/**
 * Write already-decompressed entries (from safe-zip.js) into a directory.
 * Entries are already path-validated by safe-zip — this is a dumb writer,
 * not a second safety layer, on purpose (single source of truth for the
 * safety decision, §10.3).
 */
function writeEntries(entries, destDir, subfolder) {
  let filesWritten = 0, bytesWritten = 0;
  for (const e of entries) {
    const rel = subfolder ? path.join(subfolder, e.name) : e.name;
    const full = path.join(destDir, rel);
    if (e.isDir) {
      fs.mkdirSync(full, { recursive: true });
      continue;
    }
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, e.data);
    filesWritten++;
    bytesWritten += e.data.length;
  }
  return { filesWritten, bytesWritten };
}

/**
 * Build a new release directory for a deploy. Returns { deployId, dir, filesWritten, bytesWritten }.
 * Does NOT touch `public` — caller must call promote() after this succeeds
 * and passes whatever additional gates it wants to apply (e.g. execution-mode
 * check in Phase 4) to actually go live.
 */
function stageRelease(root, hostname, entries, mode, subfolder) {
  ensureDirs(root, hostname);
  migrateLegacyPublic(root, hostname);

  const deployId = newDeployId();
  const dir = releasePath(root, hostname, deployId);
  fs.mkdirSync(dir, { recursive: true });

  try {
    if (mode === 'merge' || mode === 'subfolder') {
      const curId = currentReleaseId(root, hostname);
      if (curId) copyDirInto(releasePath(root, hostname, curId), dir);
    }
    const sub = mode === 'subfolder' ? (subfolder || 'uploaded') : null;
    const { filesWritten, bytesWritten } = writeEntries(entries, dir, sub);
    return { deployId, dir, filesWritten, bytesWritten };
  } catch (e) {
    // Never leave a half-written release directory lying around on failure —
    // it was never promoted, so nothing else references it; safe to remove.
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    throw e;
  }
}

/**
 * Atomically repoint `public` at the given already-staged release.
 * This is the ONLY function that touches the live serving path.
 */
function promote(root, hostname, deployId) {
  const dir = releasePath(root, hostname, deployId);
  if (!fs.existsSync(dir)) throw new Error(`release ${deployId} does not exist — cannot promote`);

  const link = publicLink(root, hostname);
  const tmp  = link + '.tmp-' + crypto.randomBytes(4).toString('hex');

  fs.symlinkSync(dir, tmp, 'dir');
  fs.renameSync(tmp, link); // atomic on POSIX: replaces old symlink in one step, no window with nothing there
  return { promoted: deployId, previous: null };
}

/** Roll back = promote an already-existing older release. Nothing new is built. */
function rollback(root, hostname, deployId) {
  const dir = releasePath(root, hostname, deployId);
  if (!fs.existsSync(dir)) throw new Error(`cannot roll back — release ${deployId} not found in history`);
  return promote(root, hostname, deployId);
}

function listReleases(root, hostname) {
  const dir = releasesDir(root, hostname);
  if (!fs.existsSync(dir)) return [];
  const curId = currentReleaseId(root, hostname);
  return fs.readdirSync(dir)
    .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
    .map(f => {
      const st = fs.statSync(path.join(dir, f));
      return { deployId: f, createdAt: st.birthtimeMs || st.ctimeMs, current: f === curId };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Explicit, separate prune — never called implicitly by deploy/rollback (§0.3). */
function pruneReleases(root, hostname, keep) {
  const releases = listReleases(root, hostname).filter(r => !r.current);
  const toDelete = releases.slice(keep);
  for (const r of toDelete) {
    fs.rmSync(releasePath(root, hostname, r.deployId), { recursive: true, force: true });
  }
  return toDelete.map(r => r.deployId);
}

module.exports = {
  ensureDirs, migrateLegacyPublic, currentReleaseId,
  stageRelease, promote, rollback, listReleases, pruneReleases,
  releasesDir, publicLink, releasePath, siteDir,
};
