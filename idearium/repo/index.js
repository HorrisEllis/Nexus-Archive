/**
 * idearium/repo/index.js — Idearium Repo Layer (forks/zips as tracked ideas)
 * UUID: idearium-repo-v001-000000000001
 * Version: 2.0.0
 *
 * §REDESIGNED 2026-07-11 — "the repo is an archive using the spec, when you
 * access it. the spec is supposed to be the metadata. like a compartment
 * with the spec as the metadata."
 *
 * v1 kept its OWN copy of file metadata — {path, bytes: length, comp_id,
 * seam_id, status} — with no actual content, alongside a SEPARATE spec
 * object made via the legacy os.createSpec (a text blob, not the chunked
 * spec-engine manifest everything else in idearium now runs on). Two
 * disconnected records claiming to describe one thing, and nothing behind
 * either of them to actually serve when a repo was opened.
 *
 * v2: not a wrapper around v1, a replacement of its storage model. A repo
 * no longer has its own content store at all — the spec-engine manifest
 * IS the archive (its chunks are real, disk-verified files — §1.1/§2.2 in
 * spec-engine/index.js), and the repo record is just an index entry:
 *   { uuid, name, specUuid, rootHash, parent, forks, source, phase, ... }
 * "Access" means resolving specUuid through spec-engine and reading its
 * chunks directly — one source of truth, never a stale second copy.
 *
 * rootHash (spec-engine's computeRootHash — SHA-256 of canonical JSON over
 * the manifest's chunk contents, same convention JAA's content-addressable
 * store already uses) gives the repo real identity: same content -> same
 * hash -> same repo, so forking with no changes yet is genuinely free
 * (same specUuid, same rootHash, until something actually diverges) instead
 * of a byte-copy of metadata nobody reads back.
 *
 * Two ingestion paths converge on the exact same mechanism:
 *   - promote (a spec-engine manifest already exists) -> repo just indexes it.
 *   - drop (raw files, no manifest yet) -> spec-engine.ingestFilesAsSpec()
 *     turns each file into a chunk (same completeChunk, same disk
 *     verification a parsed .spec block gets), THEN the repo indexes that.
 * Neither path has its own storage anymore. One gate, one mechanism.
 *
 * §1.2 every error loud. §7.4 nothing discarded — old repos archived, not deleted.
 * §A-flex declarative: a repo is data, the layer is thin — thinner now than v1.
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { loadTable, syncTable, migrateOnce } from '../lib/db.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_ID = 'nexus-id';   // idearium, in the UID registry
const REPOS_FILE_NAME = 'idearium-repos.json';  // legacy flat file — read once as a migration source, then left alone (§7.4)
const REPOS_TABLE = 'idearium_repos';

export class RepoLayer {
  constructor({ ideaOS, specEngine, dataDir } = {}) {
    this.os = ideaOS;                        // IdeaOS instance (public methods) — idea lifecycle only now
    // specEngine may be passed as the module itself, or as a getter function
    // (preferred — spec-engine loads asynchronously at boot; a getter means
    // a RepoLayer constructed before that load finishes still sees it once
    // ready, instead of permanently caching a null snapshot).
    this._seGetter = typeof specEngine === 'function' ? specEngine : () => specEngine;
    this.dataDir = dataDir || path.join(__dirname, '..', 'data');
    this.reposFile = path.join(this.dataDir, REPOS_FILE_NAME);
    this.repos = this._load();
  }

  get se() { return this._seGetter(); }

  // §DB-MIGRATION 2026-07-14 — same move as idearium/index.js: repos.json
  // was rewritten whole on every ingest/fork/archive/file-edit. Now backed
  // by cortex's shared JaaStore (idearium/lib/db.js), one row per repo,
  // one-time non-destructive fold of whatever was already in the flat file.
  _load() {
    let legacy = null;
    try { legacy = JSON.parse(fs.readFileSync(this.reposFile, 'utf8')); }
    catch { /* no legacy file, or unreadable — nothing to migrate */ }
    const mig = migrateOnce(REPOS_TABLE, legacy ? (legacy.repos || []) : [], 'uuid');
    if (mig.migrated) console.log(`[idearium/repo] migrated ${mig.count} legacy repo rows -> cortex table '${REPOS_TABLE}'`);
    return { _version: 2, repos: loadTable(REPOS_TABLE) };
  }
  _save() {
    try { syncTable(REPOS_TABLE, this.repos.repos, 'uuid'); }
    catch (e) { console.error(`[idearium/repo] §1.2 save failed: ${e.message}`); }
  }

  // ── ingest — the single entry point for both convergent paths ──────────────
  // Case A (specUuid given — promote path): the manifest already exists.
  //   No new spec is created. Just index it.
  // Case B (files given, no specUuid — raw drop): spec-engine turns the files
  //   into a real manifest (one chunk per file, real content, disk-verified)
  //   via ingestFilesAsSpec, THEN it's indexed the same way as case A.
  // Either way, the repo record never holds file content or byte counts of
  // its own — only a pointer (specUuid) and a content identity (rootHash).
  // Returns { repo, ideaUuid, specUuid }.
  ingest({ name, specUuid = null, files = [], source = 'drop', parent = null, promotedFromSpec = null } = {}) {
    if (!name) return { error: 'repo name required' };
    if (!this.se) return { error: 'repo layer has no spec-engine — cannot store content' };

    let manifest;
    try {
      if (specUuid) {
        manifest = this.se.loadSpec(specUuid);
      } else if (files.length) {
        manifest = this.se.ingestFilesAsSpec({ name, files, author: source || 'drop' });
      } else {
        return { error: 'ingest requires either specUuid (existing manifest) or files (to create one)' };
      }
    } catch (e) { return { error: `content ingest failed: ${e.message}` }; }

    // §DEDUP — same content already exists under a different repo. Not an
    // error: return the existing repo instead of indexing a byte-identical
    // duplicate. This is the free-fork lever in reverse — content that
    // already exists doesn't need a second index entry either.
    const existing = this.repos.repos.find(r => r.rootHash === manifest.rootHash && r.status !== 'archived');
    if (existing && !parent) {
      console.log(`[idearium/repo] content dedup — "${name}" matches existing repo ${existing.uuid.slice(0,8)} (rootHash ${manifest.rootHash.slice(0,12)}…), reusing`);
      return { repo: existing, ideaUuid: existing.ideaUuid, specUuid: existing.specUuid, deduped: true };
    }

    const repoUuid = `${COMPONENT_ID}-repo-${randomUUID().slice(0, 8)}`;

    // idea lifecycle tracking — unchanged, still owned by IdeaOS, not content
    let ideaUuid = null;
    try {
      if (this.os && typeof this.os.createIdea === 'function') {
        const idea = this.os.createIdea({ text: `Repo: ${name}`, phase: 'building', source: 'repo-ingest' });
        ideaUuid = idea?.uuid || null;
      } else if (this.os && this.os.db && Array.isArray(this.os.db.ideas)) {
        ideaUuid = randomUUID();
        this.os.db.ideas.push({
          uuid: ideaUuid, text: `Repo: ${name}`, phase: 'building',
          tension: 0.5, parent, createdAt: Date.now(), source: 'repo-ingest',
        });
        // §GAP FIXED 2026-07-14 — this push had no matching save anywhere;
        // it only ever reached disk if some unrelated IdeaOS gate happened
        // to fire its (formerly whole-file) saveDB afterward. Persist it
        // directly through the same table IdeaOS itself uses.
        syncTable('idearium_ideas', this.os.db.ideas, 'uuid');
      }
    } catch (e) { console.warn(`[idearium/repo] idea create degraded: ${e.message}`); }

    const repo = {
      uuid:      repoUuid,
      name,
      ideaUuid,
      specUuid:  manifest.uuid,
      rootHash:  manifest.rootHash,          // content identity — the archive's address
      promotedFromSpec: promotedFromSpec || null,
      parent,                                 // fork lineage
      forks:     [],
      source,                                 // 'drop' | 'fork' | 'cli' | 'promote:emerge' | 'promote:manual'
      phase:     'building',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status:    'active',
    };
    this.repos.repos.push(repo);

    if (parent) {
      const p = this.repos.repos.find(r => r.uuid === parent);
      if (p) { p.forks.push(repoUuid); }
    }
    this._save();
    return { repo, ideaUuid, specUuid: manifest.uuid };
  }

  // ── fork — genuinely free when nothing has changed yet: the new repo
  // record points at the SAME specUuid/rootHash as its parent. No content
  // is copied. Divergence (editing the fork) is spec-engine's concern —
  // it would create/complete new chunks under a new spec, which naturally
  // produces a new rootHash the next time this repo is re-ingested.
  fork(repoUuid, newName) {
    const src = this.repos.repos.find(r => r.uuid === repoUuid);
    if (!src) return { error: 'repo not found' };
    return this.ingest({
      name: newName || `${src.name}-fork`,
      specUuid: src.specUuid,
      source: 'fork',
      parent: repoUuid,
    });
  }

  // ── queries for the UI ──────────────────────────────────────────────────────
  list(filter = {}) {
    let rs = this.repos.repos.filter(r => r.status !== 'archived' || filter.includeArchived);
    if (filter.source) rs = rs.filter(r => r.source === filter.source);
    return rs.map(r => this._enrich(r));
  }
  get(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    return r ? this._enrich(r) : null;
  }
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

  // §ACCESS — this is "access the archive": resolve the repo's spec-engine
  // manifest directly and read its chunks. No stored copy to go stale, no
  // second content system to keep in sync. If the manifest is gone (spec
  // archived/compressed to .tar.gz — spec-engine's own idle-archival), that's
  // surfaced honestly rather than silently returning an empty file list.
  _enrich(r) {
    const idea = (this.os && r.ideaUuid && this.os.idea) ? this.os.idea(r.ideaUuid) : null;
    let manifest = null, filesError = null;
    try { manifest = this.se ? this.se.loadSpec(r.specUuid) : null; }
    catch (e) { filesError = `spec ${r.specUuid} unreadable: ${e.message}`; }
    // §BUG FIXED 2026-07-11 — removed chunks (deleteFile → removeChunk)
    // were still showing up in the repo's file listing — the whole point
    // of soft-delete is that a removed file stops being "in" the repo,
    // it just isn't destroyed on disk.
    const files = manifest
      ? manifest.chunks.filter(c => c.status !== 'removed').slice().sort((a,b)=>a.chunkIdx-b.chunkIdx).map(c => ({
          path: c.fileName || `${String(c.chunkIdx).padStart(2,'0')}-${c.sectionId}.md`,
          bytes: c.byteSize || 0,
          comp_id: c.comp_id || null,
          seam_id: c.seam_id || null,
          status: c.status,
        }))
      : [];
    return {
      ...r,
      // §BUG FIXED 2026-07-11 — r.rootHash is a snapshot taken once at
      // ingest time. Editing/adding/removing a file after promotion (the
      // whole point of the file-CRUD endpoints) changes the manifest's
      // real rootHash but never touched this stored copy — every repo
      // view after the first edit showed a rootHash that no longer
      // matched what the repo actually contained. Live values from the
      // manifest are the source of truth; the stored one is a fallback
      // only for the (should-be-rare) case the manifest is unreadable.
      rootHash: manifest ? manifest.rootHash : r.rootHash,
      phase: idea ? idea.phase : r.phase,
      tension: idea ? idea.tension : null,
      hasSpec: !!manifest,
      specName: manifest ? manifest.name : null,
      fileCount: files.length,
      files,
      filesError,
    };
  }

  archive(repoUuid) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) return { error: 'not found' };
    r.status = 'archived'; r.updatedAt = Date.now(); this._save();   // §7.4 not deleted
    return { ok: true, uuid: repoUuid };
  }

  // ── file CRUD — v2 has no content store of its own, so these resolve
  // through the repo's specUuid to spec-engine's chunks (the single
  // source of truth this whole redesign exists to establish) rather than
  // maintaining a second copy. §MERGED 2026-07-11.
  _resolveChunk(repoUuid, relPath) {
    const r = this.repos.repos.find(x => x.uuid === repoUuid);
    if (!r) throw new Error('repo not found');
    if (!this.se) throw new Error('repo layer has no spec-engine — cannot read/write content');
    const manifest = this.se.loadSpec(r.specUuid);
    const clean = (relPath || '').replace(/^\/+/, '');
    const chunk = manifest.chunks.find(c =>
      c.status !== 'removed' && (c.fileName === clean || c.sectionId === clean));
    return { repo: r, manifest, chunk, clean };
  }

  readFile(repoUuid, relPath) {
    try {
      const { chunk, clean } = this._resolveChunk(repoUuid, relPath);
      if (!chunk) return { error: `file not found in repo: ${relPath}` };
      return { path: chunk.fileName || clean, content: chunk.content || '', bytes: chunk.byteSize || 0 };
    } catch (e) { return { error: e.message }; }
  }

  writeFile(repoUuid, relPath, content) {
    if (typeof content !== 'string') return { error: 'content must be a string' };
    try {
      const { manifest, chunk, clean } = this._resolveChunk(repoUuid, relPath);
      if (chunk) {
        // existing file — edit in place via the same completeChunk every
        // other content write goes through (disk-verified, rootHash recomputed)
        this.se.completeChunk(manifest.uuid, chunk.uuid, content);
        return { ok: true, path: chunk.fileName, created: false };
      }
      // new file — no chunk for this path yet. sectionId must be a slug;
      // reuse the path itself (minus extension noise) so fileName stays
      // human-readable in the repo's file list.
      const sectionId = clean.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || `file-${Date.now()}`;
      const fresh = this.se.addChunk(manifest.uuid, { sectionId, title: clean, content });
      const newChunk = fresh.chunks.find(c => c.sectionId === sectionId);
      return { ok: true, path: newChunk?.fileName || clean, created: true };
    } catch (e) { return { error: e.message }; }
  }

  deleteFile(repoUuid, relPath) {
    try {
      const { manifest, chunk } = this._resolveChunk(repoUuid, relPath);
      if (!chunk) return { error: `file not found in repo: ${relPath}` };
      this.se.removeChunk(manifest.uuid, chunk.uuid);
      return { ok: true, path: chunk.fileName };
    } catch (e) { return { error: e.message }; }
  }
}

export { COMPONENT_ID };
