/**
 * idearium/repo/index.js — Idearium Repo Layer (forks/zips as tracked ideas)
 * UUID: idearium-repo-v001-000000000001
 * Version: 1.1.0
 *
 * §ADDENDUM 2026-07-11 (v1.1.0) — ingest() now materializes real files to
 * disk under dataDir/repos/<repoUuid>/ whenever it has file content to
 * write (repo.localPath/materializedCount record this), and three new
 * methods (readFile/writeFile/deleteFile) give the API real CRUD against
 * those materialized files. Previously this layer tracked path+bytes
 * metadata only — a "repo" was a JSON manifest with no actual files
 * anywhere. deleteFile moves bytes to a repo-local .trash/ rather than
 * unlinking (§7.4 — nothing discarded silently).
 *
 * Related fix, api/index.js side, noted here since it's easy to miss:
 * ingest() ALWAYS creates its own synthetic "Repo: <name>" idea to track
 * the repo (see below) — that idea's uuid is NOT the idea that
 * originated the promoted spec. _promoteSpecToRepo() now returns both
 * under separate names (ideaUuid = the synthetic one, originIdeaUuid =
 * the real one) after a caller advancing idea phase on promotion nearly
 * advanced the wrong idea.
 *
 * THE MERGE (per the spec): a fork or a dropped zip is not "a file" — it is an
 * IDEA with a spec and a tree. Idearium already tracks ideas through phases
 * (seed -> ... -> building -> complete) with causal ancestry. A repo is just an
 * idea whose content is a project tree + a .spec, with fork lineage.
 *
 * Organized by repo/.spec (per the chosen UI grouping): every repo has exactly
 * one canonical .spec that defines it; the file tree hangs off that spec.
 *
 * Flow:
 *   drop zip / fork  ->  ingest()  ->  new idea (phase: building)
 *                                   +  new spec (the repo's .spec)
 *                                   +  repo record { files[], specUuid, parent }
 *   fork(repoUuid)   ->  new repo idea, parent = source, lineage tracked
 *
 * Built on IdeaOS PUBLIC methods only (getIdeaOS, idea, spec, ideas) so it
 * respects the existing grain and never reaches into private DB internals
 * beyond the one repos[] array it owns.
 *
 * §1.2 every error loud. §7.4 nothing discarded — old repos archived, not deleted.
 * §A-flex declarative: a repo is data, the layer is thin.
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_ID = 'nexus-id';   // idearium, in the UID registry
const REPOS_FILE_NAME = 'idearium-repos.json';

// extensions that map to a repo's canonical spec (the .spec the UI groups by)
const SPEC_EXTS = ['.spec', '.spec.md'];

export class RepoLayer {
  constructor({ ideaOS, dataDir } = {}) {
    this.os = ideaOS;                        // IdeaOS instance (public methods)
    this.dataDir = dataDir || path.join(__dirname, '..', 'data');
    this.reposFile = path.join(this.dataDir, REPOS_FILE_NAME);
    this.repos = this._load();
  }

  _load() {
    try { return JSON.parse(fs.readFileSync(this.reposFile, 'utf8')); }
    catch { return { _version: 1, repos: [] }; }
  }
  _save() {
    try { fs.mkdirSync(this.dataDir, { recursive: true }); fs.writeFileSync(this.reposFile, JSON.stringify(this.repos, null, 2)); }
    catch (e) { console.error(`[idearium/repo] §1.2 save failed: ${e.message}`); }
  }

  // ── ingest — a tree of files (already extracted) becomes a tracked repo ─────
  // files: [{ path, bytes, content? }]  — content optional (manifest may omit big blobs)
  // Returns { repo, ideaUuid, specUuid }.
  ingest({ name, files = [], source = 'drop', parent = null, specText = null, promotedFromSpec = null } = {}) {
    if (!name) return { error: 'repo name required' };

    // find the canonical .spec in the tree (the thing the UI groups by)
    const specFile = files.find(f => SPEC_EXTS.some(e => f.path.toLowerCase().endsWith(e)));
    const repoUuid = `${COMPONENT_ID}-repo-${randomUUID().slice(0, 8)}`;

    // 1. create the IDEA (via the existing IdeaOS path if available)
    let ideaUuid = null;
    try {
      if (this.os && typeof this.os.createIdea === 'function') {
        const idea = this.os.createIdea({ text: `Repo: ${name}`, phase: 'building', source: 'repo-ingest' });
        ideaUuid = idea?.uuid || null;
      } else if (this.os && this.os.db && Array.isArray(this.os.db.ideas)) {
        // fallback: push a minimal idea node respecting the shape
        ideaUuid = randomUUID();
        this.os.db.ideas.push({
          uuid: ideaUuid, text: `Repo: ${name}`, phase: 'building',
          tension: 0.5, parent, createdAt: Date.now(), source: 'repo-ingest',
        });
      }
    } catch (e) { console.warn(`[idearium/repo] idea create degraded: ${e.message}`); }

    // 2. create the SPEC (the repo's canonical .spec)
    let specUuid = null;
    const spec = specText || (specFile && specFile.content) || `# ${name}\n(spec not provided — derived from repo intake)\n`;
    try {
      if (this.os && typeof this.os.createSpec === 'function') {
        const s = this.os.createSpec({ ideaUuid, text: spec, name });
        specUuid = s?.uuid || null;
      } else if (this.os && this.os.db && Array.isArray(this.os.db.specs)) {
        specUuid = randomUUID();
        this.os.db.specs.push({ uuid: specUuid, ideaUuid, name, text: spec, createdAt: Date.now() });
      }
    } catch (e) { console.warn(`[idearium/repo] spec create degraded: ${e.message}`); }

    // §MATERIALIZED 2026-07-11 — this used to store path+bytes only; content
    // (when the caller has it, e.g. spec.promote's assembled chunk files)
    // was thrown away, so a promoted repo was browsable in the UI's file
    // list but had no real files anywhere on disk — a "repo" that was
    // actually just a JSON manifest. Every file WITH content now gets
    // written for real under dataDir/repos/<repoUuid>/<path>. Files without
    // content (e.g. a dropped-zip ingest that only recorded path+bytes)
    // still degrade to metadata-only, loudly — not silently claimed as
    // materialized.
    const repoRoot = path.join(this.dataDir, 'repos', repoUuid);
    let materialized = 0;
    for (const f of files) {
      if (typeof f.content !== 'string') continue;
      try {
        const dest = path.join(repoRoot, f.path);
        if (!dest.startsWith(repoRoot)) continue; // §1.2 — refuse a path escaping the repo root
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content, 'utf8');
        materialized++;
      } catch (e) {
        console.warn(`[idearium/repo] materialize failed for '${f.path}': ${e.message}`);
      }
    }

    // 3. the REPO record — the thing the UI lists, keyed by its spec
    const repo = {
      uuid:      repoUuid,
      name,
      ideaUuid,
      specUuid,
      // §2026-07-10 — the ORIGINATING spec uuid (the one the user clicked in the
      // Spec Library). ingest creates its own internal spec above, so specUuid
      // never matches the clicked spec — clicking a spec found no repo and
      // opened a blank panel. openRepoFor() now matches on this.
      promotedFromSpec: promotedFromSpec || null,
      specPath:  specFile ? specFile.path : null,
      // §MATERIALIZED 2026-07-11 — where the real files actually live on
      // disk, when any were written. null means metadata-only (honest,
      // not hidden) — e.g. an ingest whose files carried no content.
      localPath: materialized > 0 ? repoRoot : null,
      materializedCount: materialized,
      parent,                                  // fork lineage
      forks:     [],
      source,                                  // 'drop' | 'fork' | 'cli'
      fileCount: files.length,
      // Preserve comp_id/seam_id so the repo panel can show each file as a
      // component tied to its seam, not just a path+bytes row.
      files:     files.map(f => ({ path: f.path, bytes: f.bytes || (f.content ? f.content.length : 0), comp_id: f.comp_id || null, seam_id: f.seam_id || null, status: f.status || null })),
      phase:     'building',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status:    'active',
    };
    this.repos.repos.push(repo);

    // wire fork lineage
    if (parent) {
      const p = this.repos.repos.find(r => r.uuid === parent);
      if (p) { p.forks.push(repoUuid); this._save(); }
    }
    this._save();
    return { repo, ideaUuid, specUuid };
  }

  // ── fork — branch an existing repo into a new tracked idea ──────────────────
  fork(repoUuid, newName) {
    const src = this.repos.repos.find(r => r.uuid === repoUuid);
    if (!src) return { error: 'repo not found' };
    return this.ingest({
      name: newName || `${src.name}-fork`,
      files: src.files.map(f => ({ path: f.path, bytes: f.bytes })),
      source: 'fork',
      parent: repoUuid,
      specText: null,
    });
  }

  // ── queries for the UI (organized by repo / .spec) ──────────────────────────
  list(filter = {}) {
    let rs = this.repos.repos.filter(r => r.status !== 'archived' || filter.includeArchived);
    if (filter.source) rs = rs.filter(r => r.source === filter.source);
    return rs.map(r => this._enrich(r));
  }
  get(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    return r ? this._enrich(r) : null;
  }
  // lineage: a repo and all its forks, recursively (the fork tree)
  lineage(repoUuid) {
    const out = [];
    const walk = (uuid, depth = 0) => {
      const r = this.repos.repos.find(x => x.uuid === uuid);
      if (!r) return;
      out.push({ uuid, name: r.name, depth, source: r.source });
      for (const f of r.forks) walk(f, depth + 1);
    };
    walk(repoUuid);
    return out;
  }
  _enrich(r) {
    // attach the live idea phase + spec, so the UI shows current state
    const idea = (this.os && r.ideaUuid && this.os.idea) ? this.os.idea(r.ideaUuid) : null;
    const spec = (this.os && r.specUuid && this.os.spec) ? this.os.spec(r.specUuid) : null;
    return {
      ...r,
      phase: idea ? idea.phase : r.phase,
      tension: idea ? idea.tension : null,
      hasSpec: !!spec,
      specName: spec ? (spec.name || r.name) : null,
    };
  }

  archive(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'not found' };
    r.status = 'archived'; r.updatedAt = Date.now(); this._save();   // §7.4 not deleted
    return { ok: true, uuid: repoUuid };
  }

  // ── file CRUD — real read/write against the materialized directory ─────────
  // §FILE EDIT 2026-07-11 — a repo that could list files but never open or
  // save one was a browser, not an editor. These three methods are the
  // whole gap: resolve a repo-relative path safely (never outside
  // localPath — §1.2, a path escape is a loud error, not a silent clamp),
  // read/write/delete the real file, and keep repo.files[] (what the UI
  // list renders) in sync with what's actually on disk so the two never
  // drift apart.
  _resolvePath(repo, relPath) {
    if (!repo.localPath) throw new Error('repo has no materialized files — nothing to read/write (metadata-only repo)');
    if (!relPath || typeof relPath !== 'string') throw new Error('path required');
    const clean = relPath.replace(/^\/+/, '');
    const abs = path.join(repo.localPath, clean);
    const root = path.resolve(repo.localPath) + path.sep;
    if (!path.resolve(abs).startsWith(root)) throw new Error(`path escapes repo root: ${relPath}`);
    return { abs, clean };
  }

  readFile(repoUuid, relPath) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'repo not found' };
    try {
      const { abs, clean } = this._resolvePath(r, relPath);
      const content = fs.readFileSync(abs, 'utf8');
      return { path: clean, content, bytes: Buffer.byteLength(content, 'utf8') };
    } catch (e) { return { error: e.message }; }
  }

  // Creates a new file OR overwrites an existing one — same operation,
  // distinguished only by whether repo.files[] already has that path.
  // §1.2 — the manifest entry (bytes, updatedAt) is rewritten every save so
  // the file list the UI renders never lies about size/recency.
  writeFile(repoUuid, relPath, content) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'repo not found' };
    if (typeof content !== 'string') return { error: 'content must be a string' };
    try {
      if (!r.localPath) {
        // First write to a metadata-only repo (e.g. one ingested by a
        // dropped-zip with no content) — materialize it now instead of
        // refusing, since a repo record already exists to attach files to.
        r.localPath = path.join(this.dataDir, 'repos', repoUuid);
        fs.mkdirSync(r.localPath, { recursive: true });
      }
      const { abs, clean } = this._resolvePath(r, relPath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content, 'utf8');

      const bytes = Buffer.byteLength(content, 'utf8');
      const existing = r.files.find(f => f.path === clean);
      if (existing) { existing.bytes = bytes; existing.status = 'edited'; }
      else { r.files.push({ path: clean, bytes, comp_id: null, seam_id: null, status: 'added' }); r.fileCount = r.files.length; }
      r.materializedCount = (r.materializedCount || 0) + (existing ? 0 : 1);
      r.updatedAt = Date.now();
      this._save();
      return { ok: true, path: clean, bytes, created: !existing };
    } catch (e) { return { error: e.message }; }
  }

  deleteFile(repoUuid, relPath) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'repo not found' };
    try {
      const { abs, clean } = this._resolvePath(r, relPath);
      // §7.4 — nothing discarded silently: the manifest entry is removed
      // (so the UI stops listing it) but the bytes are moved to a
      // sibling .trash/ folder inside the repo, not unlinked outright.
      const trashDir = path.join(r.localPath, '.trash');
      fs.mkdirSync(trashDir, { recursive: true });
      const trashDest = path.join(trashDir, `${Date.now()}-${path.basename(clean)}`);
      if (fs.existsSync(abs)) fs.renameSync(abs, trashDest);
      r.files = r.files.filter(f => f.path !== clean);
      r.fileCount = r.files.length;
      r.updatedAt = Date.now();
      this._save();
      return { ok: true, path: clean, trashedTo: trashDest };
    } catch (e) { return { error: e.message }; }
  }
}

export { COMPONENT_ID, SPEC_EXTS };
