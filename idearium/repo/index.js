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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMPONENT_ID = 'nexus-id';   // idearium, in the UID registry
const REPOS_FILE_NAME = 'idearium-repos.json';

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

  _load() {
    try { return JSON.parse(fs.readFileSync(this.reposFile, 'utf8')); }
    catch { return { _version: 2, repos: [] }; }
  }
  _save() {
    try { fs.mkdirSync(this.dataDir, { recursive: true }); fs.writeFileSync(this.reposFile, JSON.stringify(this.repos, null, 2)); }
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
    const files = manifest
      ? manifest.chunks.slice().sort((a,b)=>a.chunkIdx-b.chunkIdx).map(c => ({
          path: c.fileName || `${String(c.chunkIdx).padStart(2,'0')}-${c.sectionId}.md`,
          bytes: c.byteSize || 0,
          comp_id: c.comp_id || null,
          seam_id: c.seam_id || null,
          status: c.status,
        }))
      : [];
    return {
      ...r,
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
}

export { COMPONENT_ID };
