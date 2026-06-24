/**
 * idearium/repo/watcher.js — Drop-directory listener for repo intake
 * UUID: idearium-repo-watch-v001-000000000001
 *
 * Watches data/drop/ for .zip files AND nexus-system.spec-format containers.
 *   .zip drop:
 *     1. extract to a temp tree
 *     2. read the file list (+ the canonical .spec if present)
 *     3. RepoLayer.ingest() -> becomes a tracked idea + spec + repo record
 *     4. emit repo.ingested so the UI / cortex sees it
 *   .spec drop (§FIX 2026-06-21 — was completely unrecognized before this):
 *     1. lib/spec-container.js verifies the SHA-256 BEFORE anything is
 *        trusted (§1.2 — corrupt input fails loud, not partially)
 *     2. the decoded archive is read in-memory via adm-zip (no temp file —
 *        cleaner than scripts/import-spec.js's shell-out-to-disk approach,
 *        since this path never needs the files to exist on disk at all)
 *     3. the container's own buildSpec text becomes the repo's canonical
 *        spec (specText), not whatever .spec file happens to be first in
 *        the archive's file list — a project container already carries its
 *        own real spec, searching the tree for one would find a random
 *        docs/*.spec instead
 *     4. RepoLayer.ingest() -> same downstream as a .zip drop
 *
 * This is the "drag and drop new zips" half. Pairs with lib/file-push.js
 * (single files) — this handles whole-project zips/specs as forkable repos.
 *
 * Flexible, deliberately not a hard dependency: tries adm-zip if it
 * happens to be installed (it has never actually been in package.json —
 * the §FIX 2026-06-21 comment that used to claim otherwise was checked
 * 2026-06-24 and found false, corrected here rather than left standing),
 * falls back to the system `unzip` binary, falls back to recording the zip
 * as an opaque repo if neither is available. Never throws on a bad drop
 * (§1.2) — EXCEPT a .spec with a failed hash check, which must fail loud
 * and ingest nothing, since trusting a corrupt archive is worse than not
 * importing it at all.
 *
 * §M1 init(cfg) + stop(). Debounced so editor/copy multi-writes fire once.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const WATCHED_EXTS = ['.zip', '.spec'];

export class RepoWatcher {
  constructor({ repoLayer, dropDir, onEvent } = {}) {
    this.repoLayer = repoLayer;
    this.dropDir   = dropDir || path.join(__dirname, '..', 'data', 'drop');
    this.onEvent   = onEvent || (() => {});
    this._watcher  = null;
    this._debounce = new Map();
  }

  init() {
    fs.mkdirSync(this.dropDir, { recursive: true });
    this._watcher = fs.watch(this.dropDir, (evt, filename) => {
      if (!filename) return;
      const lower = filename.toLowerCase();
      if (!WATCHED_EXTS.some(ext => lower.endsWith(ext))) return;
      const full = path.join(this.dropDir, filename);
      clearTimeout(this._debounce.get(full));
      this._debounce.set(full, setTimeout(() => {
        this._debounce.delete(full);
        if (!fs.existsSync(full)) return;
        if (lower.endsWith('.spec')) this._handleSpec(full);
        else this._handleZip(full);
      }, 600));   // debounce: wait for the copy to finish
    });
    console.log(`[idearium/repo] watching ${this.dropDir} for dropped zips and .spec containers`);
    return this;
  }

  _handleZip(zipPath) {
    const name = path.basename(zipPath, '.zip');
    try {
      const files = this._extractFileList(zipPath);
      const result = this.repoLayer.ingest({ name, files, source: 'drop' });
      if (result.error) throw new Error(result.error);
      this.onEvent({ type: 'repo.ingested', name, repoUuid: result.repo.uuid,
        fileCount: files.length, specUuid: result.specUuid });
      console.log(`[idearium/repo] ingested '${name}' → ${result.repo.uuid} (${files.length} files)`);
    } catch (e) {
      // §1.2 — loud, never silent, never throws up the stack
      this.onEvent({ type: 'repo.ingest.failed', name, error: e.message });
      console.error(`[idearium/repo] §1.2 ingest failed for '${name}': ${e.message}`);
    }
  }

  // ── .spec container drop ────────────────────────────────────────────────────
  // Verify (hash, before trusting anything) -> decode in-memory -> list via
  // adm-zip directly on the Buffer (no disk round-trip) -> ingest with the
  // container's own buildSpec as the canonical spec text.
  _handleSpec(specPath) {
    const fallbackName = path.basename(specPath, '.spec');
    let verified;
    try {
      const { verifyAndDecode } = require('../../lib/spec-container.js');
      verified = verifyAndDecode(specPath);
    } catch (e) {
      // Hash mismatch, corrupt archive, missing archive block, or this is a
      // module-level .spec with no payload at all — never ingest on a
      // failed verify. This is the one case in this file that must NOT
      // degrade gracefully into "ingest something anyway".
      this.onEvent({ type: 'repo.ingest.failed', name: fallbackName, error: e.message });
      console.error(`[idearium/repo] §1.2 .spec verify failed for '${fallbackName}': ${e.message}`);
      return;
    }

    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(verified.archiveBuffer);
      const files = zip.getEntries().filter(e => !e.isDirectory).map(e => ({
        path: e.entryName, bytes: e.header.size,
      }));
      const result = this.repoLayer.ingest({
        name: verified.name, files, source: 'spec-import',
        specText: verified.buildSpec || `# ${verified.name}\n(container had no buildSpec field)\n`,
      });
      if (result.error) throw new Error(result.error);
      this.onEvent({ type: 'repo.ingested', name: verified.name, repoUuid: result.repo.uuid,
        fileCount: files.length, specUuid: result.specUuid, source: 'spec-import' });
      console.log(`[idearium/repo] ingested '${verified.name}@${verified.version}' from .spec container → ${result.repo.uuid} (${files.length} files, hash ${verified.hash.slice(0,12)})`);
    } catch (e) {
      // Verify succeeded but listing/ingest failed (e.g. adm-zip choked on
      // the decoded buffer) — degrade gracefully here, same as .zip drops,
      // since the archive itself is already proven intact at this point.
      this.onEvent({ type: 'repo.ingest.failed', name: verified.name, error: e.message });
      console.error(`[idearium/repo] §1.2 ingest failed for '${verified.name}' (verified archive, but): ${e.message}`);
    }
  }

  // returns [{ path, bytes, content? }] — content only for the .spec (kept small)
  _extractFileList(zipPath) {
    // try adm-zip
    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipPath);
      return zip.getEntries().filter(e => !e.isDirectory).map(e => {
        const isSpec = /\.spec(\.md)?$/i.test(e.entryName);
        return { path: e.entryName, bytes: e.header.size,
                 content: isSpec ? zip.readAsText(e) : undefined };
      });
    } catch (_) { /* fall through */ }
    // fallback: system unzip -l for the list (no content)
    try {
      const out = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
      return out.split('\n').filter(Boolean).filter(p => !p.endsWith('/'))
        .map(p => ({ path: p, bytes: 0 }));
    } catch (_) { /* fall through */ }
    // last resort: opaque single-entry repo (never lose the drop, §7.4)
    return [{ path: path.basename(zipPath), bytes: fs.statSync(zipPath).size }];
  }

  stop() {
    if (this._watcher) { this._watcher.close(); this._watcher = null; }
    for (const t of this._debounce.values()) clearTimeout(t);
    this._debounce.clear();
  }
}


