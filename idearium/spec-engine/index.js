/**
 * idearium/spec-engine/index.js — Spec Compiler Engine
 * UUID: idearium-spec-engine-v1-0000-4000-0000-000000000001
 * Version: 1.1.0
 * Phase: 40 — Component Descriptor + Spec Chunk System
 * Seam ID: idearium.spec-engine:v1:p0001
 * Component: idearium.spec-engine
 *
 * §1.1 Nothing exists until proven — every chunk verified on disk before contract closed
 * §1.2 Nothing silently fails — every chunk state transition logged
 * §2.1 Disk before behavior — chunk file written before contract status updated
 * §2.2 Disk is source of truth — specs/<spec-uuid>/<chunk-uuid>.md
 * §3.1 Bottom-up — data (chunk files) before contracts before dispatch before UI
 * §5.1 UUID + seam_id + comp_id + contract_id on every chunk
 *
 * Each spec is split into sections. Each section is a chunk — a first-class
 * addressable unit with its own UUID, seam_id, comp_id, contract_id.
 * Like a torrent: independent pieces, tracked through the system.
 *
 * On disk layout:
 *   specs/<spec-uuid>/manifest.json       — spec metadata, chunk list
 *   specs/<spec-uuid>/<chunk-uuid>.md     — chunk content
 *   specs/<spec-uuid>/<spec-uuid>.spec    — full compiled spec (when complete)
 *   specs/<spec-uuid>.tar.gz              — compressed archive (when idle)
 *
 * Contract states per chunk: pending → building → verifying → complete | failed
 */

import fs   from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { getTemplate, listTemplates, readSeed } from './templates.js';
import { loadTable, syncTable, migrateOnce } from '../lib/db.js';

const _require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODULE_ID   = 'idearium.spec-engine';
const VERSION     = '2.0.0';  // §MERGED 2026-07-11 — rootHash/boundary-engine/ingestFilesAsSpec
                               // (parallel branch) + templateIds[]/buildEngine/ideaUuid (this branch)
                               // reconciled into one mechanism. See CHANGES-2026-07-11-MERGE.md.
const COMP_ID     = 'idearium.spec-engine';
const SEAM_PREFIX = 'idearium.spec-engine:v1:chunk';

// ── Spec storage root ─────────────────────────────────────────────────────────
const SPECS_ROOT = path.join(__dirname, '..', 'data', 'specs');

// ── Cortex mirror tables ──────────────────────────────────────────────────────
// §DB-MIGRATION 2026-07-15 — spec-engine was the one manifest store still on
// ad-hoc flat-file JSON while repo/index.js and idearium/index.js already run
// through cortex's shared jaaDB (see idearium/lib/db.js's own header). Disk
// stays the source of truth (§2.2 above is unchanged) — these tables are a
// queryable mirror, kept in sync on every saveSpec(), not a second store to
// reconcile by hand.
const MANIFEST_TABLE = 'idearium_spec_manifests';
const CHUNK_TABLE     = 'idearium_spec_chunks';

// One-time, non-destructive fold of whatever's already on disk into cortex —
// same convention idearium/lib/db.js's migrateOnce() documents (never
// overwrites rows already in the DB, never touches the source files).
function _migrateManifestsOnce() {
  if (!fs.existsSync(SPECS_ROOT)) return;
  let dirs;
  try { dirs = fs.readdirSync(SPECS_ROOT, { withFileTypes: true }).filter(d => d.isDirectory()); }
  catch (e) { console.error(`[${MODULE_ID}] manifest migration scan failed: ${e.message}`); return; }

  const legacy = [];
  for (const d of dirs) {
    const p = path.join(SPECS_ROOT, d.name, 'manifest.json');
    if (!fs.existsSync(p)) continue;
    try { legacy.push(JSON.parse(fs.readFileSync(p, 'utf8'))); }
    catch (e) { console.warn(`[${MODULE_ID}] skipping unreadable manifest ${d.name}: ${e.message}`); }
  }
  if (!legacy.length) return;

  const migManifests = migrateOnce(MANIFEST_TABLE, legacy, 'uuid');
  if (migManifests.migrated) {
    console.log(`[${MODULE_ID}] migrated ${migManifests.count} manifests -> cortex '${MANIFEST_TABLE}'`);
  }
  const allChunks = legacy.flatMap(m => (m.chunks || []).map(c => ({ ...c, specUuid: m.uuid })));
  const migChunks = migrateOnce(CHUNK_TABLE, allChunks, 'uuid');
  if (migChunks.migrated) {
    console.log(`[${MODULE_ID}] migrated ${migChunks.count} chunks -> cortex '${CHUNK_TABLE}'`);
  }
}
_migrateManifestsOnce(); // runs once at module load, mirrors repo/index.js's constructor-time _load()

// ── Standard spec sections (the seam boundaries) ─────────────────────────────
// Each section = one chunk = one SEAM contract = one file on disk.
// Agent gets one chunk at a time. Mistral first, ChatGPT fallback, Claude fallback.
export const SPEC_SECTIONS = [
  { id: 'meta',          title: 'Meta & Identity',       desc: 'UUID, version, phase, comp_id, seam_id, status, author, dependencies' },
  { id: 'purpose',       title: 'Purpose & Intent',      desc: 'What this component does, why it exists, what problem it solves' },
  { id: 'axioms',        title: 'Axioms Enforced',        desc: 'Which AXIOMS-v1.0 axioms this component satisfies, with evidence' },
  { id: 'schema',        title: 'Data Schema',            desc: 'JAA tables, field shapes, types, constraints, decay tier' },
  { id: 'api',           title: 'API & Routes',           desc: 'HTTP routes, request/response shapes, error codes' },
  { id: 'events',        title: 'Events & Bus',           desc: 'Bus events emitted, bus events consumed, event payload shapes' },
  { id: 'integration',   title: 'Integration Points',     desc: 'What talks to this, what this talks to, seam contracts' },
  { id: 'failure_modes', title: 'Failure Modes',          desc: 'What can fail, how it fails loudly (§1.2), recovery paths' },
  { id: 'build_order',   title: 'Build Order',            desc: 'Bottom-up build sequence (§3.1), what must exist first' },
  { id: 'tests',         title: 'Tests & Verification',   desc: 'How each piece is proven (§1.1), test cases, invariants' },
];

// ── Contract states ────────────────────────────────────────────────────────────
export const CHUNK_STATES = {
  PENDING:    'pending',    // created, not yet sent to agent
  BUILDING:   'building',   // dispatched to agent, waiting for response
  VERIFYING:  'verifying',  // agent responded, verifying content + writing to disk
  COMPLETE:   'complete',   // chunk file written to disk, artifact verified
  FAILED:     'failed',     // agent failed, retry available
  ESCALATED:  'escalated',  // too many failures, human review required
};

// ── Ensure spec storage exists ────────────────────────────────────────────────
function _ensureRoot() {
  fs.mkdirSync(SPECS_ROOT, { recursive: true });
}

// ── Dedup key for a spec (name + type hash) ───────────────────────────────────
function _specDedupKey(name, type = 'component') {
  return crypto.createHash('sha1')
    .update(`${name}::${type}`)
    .digest('hex').slice(0, 16);
}

// ── Create a new spec with all chunks initialized ─────────────────────────────
/**
 * _seedSectionsFromTemplate — deterministic, per-template seeding. Returns
 * a { sectionId: content } map (possibly empty). Three honest paths, not
 * blurred into one:
 *
 * (a) genesis (DSL, no other structural mapping) — the ONLY thing exactly
 *     and verifiably extractable is the header block: version, UUID, spine
 *     declaration, spine binding rule. That is a real `meta` section.
 *     §HONEST SCOPE 2026-07-09, unchanged: idearium's SPEC_SECTIONS are
 *     prose sections (meta/purpose/axioms/schema/api/events/integration/
 *     tests) while genesis.spec is a GRAMMAR (`spine WARP`, `bind
 *     kernel.boot -> Stream`). There is no structural mapping from the DSL
 *     to the other seven sections, and inventing one would fabricate
 *     content while claiming determinism. This path is untouched from the
 *     2026-07-09 version — same regexes, same output, same one-chunk scope.
 *
 * (b) the 2026-07-11 named-architecture templates (minimal-kernel,
 *     api-service, event-system, plugin-runtime, ai-agent-system) — each
 *     seedFile IS already-authored content for exactly the role its
 *     `seedSection` names (event-system.spec is a real event_model block,
 *     seeded into 'events'; api-service.spec is a real interfaces block,
 *     seeded into 'api'; etc — see templates.js's provenance comments).
 *     No field-extraction, no reinterpretation: the seed's raw text is the
 *     section's content, verbatim, same principle importSpec uses for a
 *     whole document. Honest because the content was chosen to already BE
 *     that section, not asked to become it.
 *
 * Returns null when nothing can be extracted/applies. A null seed means
 * "dispatch every chunk normally" — never a half-filled chunk presented as
 * complete.
 */
// §MERGED 2026-07-11 — a seed file can carry multiple `## SECTION: <id>`
// blocks, each seeding a different SPEC_SECTIONS id — see
// _seedSectionsFromTemplate below for the full three-convention story.
const SECTION_MARKER_RE = /^##\s*SECTION:\s*([a-z_]+)\s*$/gm;

function _seedSectionsFromTemplate(templateId, specName) {
  const seed = readSeed(templateId);
  const out = {};
  if (!seed) return out;
  const template = getTemplate(templateId);

  if (templateId === 'genesis') {
    const content = _seedMetaFromGenesis(seed, specName, templateId);
    if (content) out.meta = content;
    return out;
  }

  const validIds = new Set(SPEC_SECTIONS.map(s => s.id));
  const markers = [...seed.matchAll(SECTION_MARKER_RE)];
  if (markers.length) {
    for (let i = 0; i < markers.length; i++) {
      const id = markers[i][1];
      if (!validIds.has(id)) continue; // §1.2 — unknown marker ignored, not silently misfiled
      const start = markers[i].index + markers[i][0].length;
      const end   = i + 1 < markers.length ? markers[i + 1].index : seed.length;
      const body  = seed.slice(start, end).trim();
      if (!body) continue;
      out[id] = `Seeded deterministically from template \`${templateId}\` — no agent dispatched.\n\n${body}\n\n` +
                `> Source: idearium/spec-engine/templates/${templateId}.spec § ${id}`;
    }
    return out;
  }

  // Fallback: seedSection convention — whole file, one section, verbatim.
  const seedSection = template?.seedSection;
  if (seedSection && validIds.has(seedSection)) {
    const lines = [
      `Seeded deterministically from template \`${templateId}\` — no agent dispatched.`,
      ``,
      `> Source: idearium/spec-engine/templates/${template.seedFile}`,
      ``,
      `---`,
      ``,
      seed.trim(),
    ];
    out[seedSection] = lines.join('\n');
  }
  return out;
}

function _seedMetaFromGenesis(seed, specName, templateId) {
  const version = seed.match(/^version\s+(\S+)/m)?.[1];
  const uuid    = seed.match(/UUID:\s*(\S+)/)?.[1];
  const spine   = seed.match(/^spine\s+(\S+)/m)?.[1];
  const rule    = seed.match(/^spine\.rule\s*=\s*(\S+)/m)?.[1];
  const prims   = seed.match(/^spine\.primitives\s*=\s*(.+)$/m)?.[1]?.trim();

  // §1.1 — if the template's shape changed and nothing matched, say so by
  // returning null rather than emitting an empty section that looks built.
  if (!version && !uuid && !spine) return null;

  const lines = [
    `# Meta`,
    ``,
    `Seeded deterministically from template \`${templateId}\` — no agent dispatched.`,
    ``,
    `- **Name**: ${specName}`,
    version ? `- **Template version**: ${version}` : null,
    uuid    ? `- **Template UUID**: ${uuid}` : null,
    spine   ? `- **Spine**: ${spine}` : null,
    prims   ? `- **Spine primitives**: ${prims}` : null,
    rule    ? `- **Spine rule**: ${rule}` : null,
    ``,
    `> Source: idearium/spec-engine/templates/${templateId}.spec`,
  ].filter(Boolean);

  return lines.join('\n');
}

// §GENERALIZED 2026-07-10 — chunk/manifest construction pulled out of
// createSpec() so importSpec() can hand it a section list SHAPED BY THE
// SOURCE DOCUMENT instead of being forced through the fixed 10-entry
// SPEC_SECTIONS template. createSpec() below is now a thin wrapper that
// passes SPEC_SECTIONS as its default — behavior for existing callers is
// unchanged, byte for byte.
function _buildManifest({ name, type = 'component', description = '', agent = 'ollama', author = 'nexus', templateId = null, templateIds = null, sections = SPEC_SECTIONS, buildEngine = 'auto', ideaUuid = null }) {
  _ensureRoot();
  if (!name) throw new Error('spec name required');

  // §MERGED 2026-07-11 — two independent sessions extended createSpec
  // differently: this branch (single templateId, seedSection-based
  // single-section seeding) and a parallel one (templateIds[] array,
  // marker-based multi-section seeding, buildEngine selector, ideaUuid
  // linkage). Reconciled here rather than picking one — see
  // _seedSectionsFromTemplate below for how single-section and
  // marker-based templates now both work through one mechanism.
  const idList = (Array.isArray(templateIds) && templateIds.length) ? templateIds
               : (templateId ? [templateId] : []);
  const templates = idList.map(id => {
    const t = getTemplate(id);
    if (!t) throw new Error(`unknown templateId '${id}'. Known: ${listTemplates().map(x => x.id).join(', ')}`);
    return t;
  });
  const template = templates[0] || null; // primary — back-compat for type/single-template readers

  const VALID_ENGINES = ['auto', 'warp', 'direct'];
  if (!VALID_ENGINES.includes(buildEngine)) {
    throw new Error(`unknown buildEngine '${buildEngine}'. Known: ${VALID_ENGINES.join(', ')}`);
  }

  // §1.2 — an unknown templateId is an error, not a silent fallback to none.
  // A spec that claims a template it never used is a lie in its own manifest.
  if (template) type = template.kind;

  const specUuid  = crypto.randomUUID();
  const dedupKey  = _specDedupKey(name, type);

  // §PHASE 6 2026-07-10 — the dedupKey has been computed and stored on every
  // spec since day one and never read. Check it now: if a spec with the same
  // name+type already exists, surface it. Non-blocking — the user may want a
  // deliberate rebuild — but the caller now KNOWS, and can offer to reuse
  // instead of paying full tokens to rebuild something already built.
  const existing = findByDedupKey(name, type);

  const specDir   = path.join(SPECS_ROOT, specUuid);
  const now       = Date.now();

  fs.mkdirSync(specDir, { recursive: true });

  // Build chunk contracts — one per section, each a first-class addressable unit
  const chunks = sections.map((section, idx) => {
    const chunkUuid = crypto.randomUUID();
    return {
      uuid:        chunkUuid,
      specUuid,
      chunkIdx:    idx,
      sectionId:   section.id,
      sectionTitle:section.title,
      sectionDesc: section.desc,
      // §5.1 — every chunk has all four IDs
      comp_id:     COMP_ID,
      seam_id:     `${SEAM_PREFIX}:${specUuid.slice(0,8)}:${section.id}`,
      contract_id: `spec-contract:${specUuid.slice(0,8)}:${section.id}:${chunkUuid.slice(0,8)}`,
      // File on disk — §2.2 disk is source of truth
      filePath:    path.join(specDir, `${chunkUuid}.md`),
      fileName:    `${String(idx).padStart(2,'0')}-${section.id}.md`,
      // Contract state
      status:      CHUNK_STATES.PENDING,
      agent:       agent,        // which agent built this chunk
      agentModel:  null,         // which model was used
      attempts:    0,
      failureMode: null,
      content:     null,         // filled when COMPLETE
      byteSize:    0,
      createdAt:   now,
      updatedAt:   now,
      completedAt: null,
      tags:        [section.id, type, name.toLowerCase().replace(/\s+/g,'-')],
    };
  });

  const manifest = {
    uuid:        specUuid,
    dedupKey,
    name,
    type,
    description,
    author,
    version:     '0.1.0',
    phase:       '40',
    status:      'building',    // pending | building | complete | archived
    agent,                      // primary agent (Mistral first)
    agentPriority: ['ollama', 'chatgpt', 'claude'],  // LAW_I: local first
    buildEngine,                 // auto | warp | direct — §MERGED
    // §MERGED 2026-07-11 — ideaUuid closes the gap where the promote path
    // reads manifest.ideaUuid but nothing used to write it.
    ideaUuid,
    totalChunks: chunks.length,
    doneChunks:  0,
    failedChunks:0,
    progress:    0,
    createdAt:   now,
    updatedAt:   now,
    completedAt: null,
    archivePath: null,          // set when compressed
    // §PROVENANCE 2026-07-09 — which template seeded this spec, and exactly
    // which sections were filled without an agent. A manifest that cannot say
    // where its content came from cannot be audited, and "deterministic" then
    // becomes a claim rather than a record.
    templateId:     template ? template.id : null,   // primary (back-compat single-field readers)
    templateIds:    templates.map(t => t.id),          // §MERGED — full composed set
    templateSeeded: [],
    // §PHASE 6 — non-null when a spec with the same name+type already existed.
    // The caller can offer reuse; this spec is still created (deliberate rebuild
    // is valid), but the redundancy is now visible instead of silent.
    duplicateOf:    existing ? existing.uuid : null,
    rootHash:       null,  // computed below, after chunks[] exists
    chunks,
  };
  manifest.rootHash = computeRootHash(manifest);

  // §2.1 — write manifest to disk before anything else
  const manifestPath = path.join(specDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // §SEEDED 2026-07-09, §MERGED 2026-07-11 — the template's deterministic
  // contribution, applied AFTER the manifest is on disk because
  // completeChunk() reloads the spec to recompute progress. Composes
  // across every selected template — first-listed template wins if two
  // templates both seed the same section. _seedSectionsFromTemplate
  // (below) handles BOTH template conventions that existed independently:
  // a single `seedSection` (whole seed file → one section, this branch's
  // original mechanism) and `## SECTION: <id>` markers (multi-section per
  // template, the parallel branch's mechanism) — whichever the template's
  // seed file actually uses.
  if (templates.length) {
    const seededMap = {}; // sectionId -> { content, fromTemplateId }
    for (const t of templates) {
      const perTemplate = _seedSectionsFromTemplate(t.id, name);
      for (const [sectionId, content] of Object.entries(perTemplate)) {
        if (seededMap[sectionId]) continue; // first pick wins
        seededMap[sectionId] = { content, fromTemplateId: t.id };
      }
    }
    const seededIds = Object.keys(seededMap);
    if (seededIds.length) {
      const actuallySeeded = [];
      for (const sectionId of seededIds) {
        const chunk = manifest.chunks.find(c => c.sectionId === sectionId);
        if (!chunk) continue;
        try {
          completeChunk(specUuid, chunk.uuid, seededMap[sectionId].content);
          actuallySeeded.push(sectionId);
        } catch (e) {
          // §1.2 — a failed seed degrades that one chunk to normal dispatch, loudly.
          console.warn(`[${MODULE_ID}] template seed failed for '${sectionId}', chunk stays PENDING: ${e.message}`);
        }
      }
      if (actuallySeeded.length) {
        // §BUG FIXED 2026-07-09 — provenance must be persisted on the fresh
        // on-disk manifest, not the stale in-memory object, or a seeded
        // chunk reports `agent: 'ollama'` for content no LLM ever touched.
        const fresh = loadSpec(specUuid);
        for (const sectionId of actuallySeeded) {
          const fm = fresh.chunks.find(c => c.sectionId === sectionId);
          if (fm) { fm.agent = 'template'; fm.agentModel = `template:${seededMap[sectionId].fromTemplateId}`; }
        }
        fresh.templateSeeded = actuallySeeded;
        saveSpec(fresh);
        console.log(`[${MODULE_ID}] seeded [${actuallySeeded.join(', ')}] from templates [${templates.map(t=>t.id).join(', ')}] — ` +
          `${actuallySeeded.length} of ${chunks.length} chunks need no agent`);
        return fresh;
      }
      return loadSpec(specUuid);
    }
    console.warn(`[${MODULE_ID}] templates [${templates.map(t=>t.id).join(', ')}] produced no deterministic seed — all ${chunks.length} chunks will dispatch`);
  }

  console.log(`[${MODULE_ID}] spec created: ${specUuid.slice(0,8)} "${name}" · ${chunks.length} chunks · agent:${agent}`);
  return manifest;
}

export function createSpec({ name, type = 'component', description = '', agent = 'ollama', author = 'nexus', templateId = null, templateIds = null, buildEngine = 'auto', ideaUuid = null }) {
  return _buildManifest({ name, type, description, agent, author, templateId, templateIds, sections: SPEC_SECTIONS, buildEngine, ideaUuid });
}

// ── Load spec manifest from disk ──────────────────────────────────────────────
export function loadSpec(specUuid) {
  const manifestPath = path.join(SPECS_ROOT, specUuid, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`spec ${specUuid} not found`);
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

// §EXPORT 2026-07-18 — real reconstruction of the original .spec text, for
// export. For an IMPORTED spec this is byte-exact: strips the
// `<!-- imported: ... -->\n\n` tag importSpec() prepends to every chunk
// (see spec-engine's own byte-fidelity work) and concatenates in chunkIdx
// order — the same reconstruction importSpec() already verifies against
// the source at import time, run in reverse. For an agent-BUILT spec
// there's no "original" to recover — this still returns something real
// and useful (chunk content concatenated with section headers), just not
// a claim of exactness, since none was ever made for that path.
const _IMPORT_TAG_RE = /^<!-- imported[^>]*-->\n\n/;
export function reconstructSpecText(specUuid) {
  const manifest = loadSpec(specUuid);
  const chunks = manifest.chunks.slice().sort((a, b) => a.chunkIdx - b.chunkIdx);
  const wasImported = chunks.some(c => c.agent === 'import');
  if (wasImported) {
    return chunks.map(c => (c.content || '').replace(_IMPORT_TAG_RE, '')).join('');
  }
  return chunks.map(c => `# ${c.sectionTitle || c.sectionId}\n\n${c.content || ''}`).join('\n\n---\n\n');
}

// ── Save spec manifest to disk ────────────────────────────────────────────────
export function saveSpec(manifest) {
  const specDir = path.join(SPECS_ROOT, manifest.uuid);
  fs.mkdirSync(specDir, { recursive: true });
  manifest.updatedAt = Date.now();
  // §2.1 disk before behavior — the write cortex mirrors below can lag or
  // fail without losing anything; this line is the one that must not.
  fs.writeFileSync(path.join(specDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Cortex mirror — queryable index over the same manifest, not a second
  // source of truth (§2.2 unchanged: disk is still what loadSpec() reads).
  try {
    const manifestRows = loadTable(MANIFEST_TABLE).filter(m => m.uuid !== manifest.uuid);
    manifestRows.push(manifest);
    syncTable(MANIFEST_TABLE, manifestRows, 'uuid');

    const chunkRows = loadTable(CHUNK_TABLE).filter(c => c.specUuid !== manifest.uuid);
    for (const c of manifest.chunks) chunkRows.push({ ...c, specUuid: manifest.uuid });
    syncTable(CHUNK_TABLE, chunkRows, 'uuid');
  } catch (e) {
    // §1.2 loud, non-fatal — disk write above already succeeded.
    console.error(`[${MODULE_ID}] cortex mirror sync failed for ${manifest.uuid}: ${e.message}`);
  }
}

// ── List all specs ────────────────────────────────────────────────────────────
export function listSpecs({ includeDeleted = false } = {}) {
  _ensureRoot();
  const specs = [];
  for (const entry of fs.readdirSync(SPECS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const manifest = loadSpec(entry.name);
      // §NEW 2026-07-16 — see deleteSpec() below. Soft-deleted specs stay on
      // disk (§7.4 nothing discarded) but drop out of the library by default.
      if (manifest.deleted && !includeDeleted) continue;
      specs.push({
        uuid:        manifest.uuid,
        name:        manifest.name,
        type:        manifest.type,
        status:      manifest.status,
        progress:    manifest.progress,
        totalChunks: manifest.totalChunks,
        doneChunks:  manifest.doneChunks,
        agent:       manifest.agent,
        createdAt:   manifest.createdAt,
        updatedAt:   manifest.updatedAt,
        version:     manifest.version,
        deleted:     !!manifest.deleted,
        deletedAt:   manifest.deletedAt || null,
        // §2026-07-10 — lightweight per-section status for the UI's Spec Library
        // chips. Id/title/done only, NOT content: the list must stay small even
        // with many specs. The detail view loads full chunk content on demand.
        chunks: (manifest.chunks || []).map(c => ({
          sectionId: c.sectionId, sectionTitle: c.sectionTitle,
          chunkIdx: c.chunkIdx, status: c.status, byteSize: c.byteSize || 0,
        })),
        totalBytes: (manifest.chunks || []).reduce((sum, c) => sum + (c.byteSize || 0), 0),
      });
    } catch (_) {}
  }
  return specs.sort((a, b) => b.updatedAt - a.updatedAt);
}

// ── Get next pending chunk for an agent ──────────────────────────────────────
export function nextPendingChunk(specUuid) {
  const manifest = loadSpec(specUuid);
  return manifest.chunks.find(c => c.status === CHUNK_STATES.PENDING) || null;
}

// ── Mark chunk as building (dispatched to agent) ──────────────────────────────
export function markChunkBuilding(specUuid, chunkUuid, { agent, model } = {}) {
  const manifest = loadSpec(specUuid);
  const chunk = manifest.chunks.find(c => c.uuid === chunkUuid);
  if (!chunk) throw new Error(`chunk ${chunkUuid} not found in spec ${specUuid}`);

  chunk.status    = CHUNK_STATES.BUILDING;
  chunk.agent     = agent || chunk.agent;
  chunk.agentModel= model || null;
  chunk.attempts  = (chunk.attempts || 0) + 1;
  chunk.updatedAt = Date.now();

  saveSpec(manifest);
  return chunk;
}

// ── Complete a chunk — write content to disk, verify, update contract ─────────
// §1.1 — artifact must exist on disk before chunk is marked complete
// §2.1 — file written before manifest updated
export function completeChunk(specUuid, chunkUuid, content, { preserveWhitespace = false } = {}) {
  if (!content || !content.trim()) {
    return failChunk(specUuid, chunkUuid, 'agent returned empty content');
  }

  const manifest = loadSpec(specUuid);
  const chunk    = manifest.chunks.find(c => c.uuid === chunkUuid);
  if (!chunk) throw new Error(`chunk ${chunkUuid} not found`);

  const specDir  = path.join(SPECS_ROOT, specUuid);
  const filePath = path.join(specDir, `${String(chunk.chunkIdx).padStart(2,'0')}-${chunk.sectionId}-${chunkUuid.slice(0,8)}.md`);

  // §BYTE-FIDELITY FIX 2026-07-14 — this used to unconditionally .trim()
  // content here, downstream of every other caller's own choices about
  // whitespace. Right call for agent-generated text (strips real LLM
  // whitespace noise); wrong call for importSpec, which had already gone
  // to the trouble of preserving exact source bytes up to this point, only
  // to lose them at the actual write. preserveWhitespace: true skips it —
  // default stays trim-on, so every other existing caller (agent builds,
  // API completions, CLI) is unaffected.
  const finalContent = preserveWhitespace ? content : content.trim();

  // §2.1 — write to disk first
  const fileContent = [
    `---`,
    `chunk_uuid: ${chunkUuid}`,
    `spec_uuid: ${specUuid}`,
    `section: ${chunk.sectionId}`,
    `title: ${chunk.sectionTitle}`,
    `comp_id: ${chunk.comp_id}`,
    `seam_id: ${chunk.seam_id}`,
    `contract_id: ${chunk.contract_id}`,
    `agent: ${chunk.agent}`,
    `model: ${chunk.agentModel || 'unknown'}`,
    `status: complete`,
    `completed_at: ${new Date().toISOString()}`,
    `---`,
    ``,
    finalContent,
  ].join('\n');

  fs.writeFileSync(filePath, fileContent, 'utf8');

  // §1.1 — verify artifact exists on disk before marking complete
  if (!fs.existsSync(filePath)) {
    return failChunk(specUuid, chunkUuid, 'file write verification failed — artifact not found after write');
  }

  chunk.status      = CHUNK_STATES.COMPLETE;
  chunk.filePath    = filePath;
  chunk.content     = finalContent;
  chunk.byteSize    = Buffer.byteLength(fileContent);
  chunk.updatedAt   = Date.now();
  chunk.completedAt = Date.now();
  chunk.failureMode = null;

  // Update spec progress
  manifest.doneChunks  = manifest.chunks.filter(c => c.status === CHUNK_STATES.COMPLETE).length;
  manifest.failedChunks= manifest.chunks.filter(c => c.status === CHUNK_STATES.FAILED || c.status === CHUNK_STATES.ESCALATED).length;
  manifest.progress    = Math.round((manifest.doneChunks / manifest.totalChunks) * 100);
  manifest.updatedAt   = Date.now();
  manifest.rootHash     = computeRootHash(manifest);

  if (manifest.doneChunks === manifest.totalChunks) {
    manifest.status      = 'complete';
    manifest.completedAt = Date.now();
    _assembleFullSpec(manifest);
    console.log(`[${MODULE_ID}] ✓ spec complete: ${specUuid.slice(0,8)} "${manifest.name}" · ${manifest.totalChunks} chunks`);
  }

  saveSpec(manifest);
  console.log(`[${MODULE_ID}] ✓ chunk ${chunk.sectionId} complete · ${chunk.byteSize}b · ${manifest.progress}% done`);
  return chunk;
}

// ── Fail a chunk ──────────────────────────────────────────────────────────────
export function failChunk(specUuid, chunkUuid, reason) {
  const manifest = loadSpec(specUuid);
  const chunk    = manifest.chunks.find(c => c.uuid === chunkUuid);
  if (!chunk) throw new Error(`chunk ${chunkUuid} not found`);

  const maxAttempts = 3;
  chunk.status      = chunk.attempts >= maxAttempts ? CHUNK_STATES.ESCALATED : CHUNK_STATES.FAILED;
  chunk.failureMode = reason;
  chunk.updatedAt   = Date.now();

  manifest.failedChunks = manifest.chunks.filter(c =>
    c.status === CHUNK_STATES.FAILED || c.status === CHUNK_STATES.ESCALATED).length;
  manifest.updatedAt = Date.now();

  saveSpec(manifest);
  console.warn(`[${MODULE_ID}] §1.2 chunk ${chunk.sectionId} ${chunk.status}: ${reason}`);
  return chunk;
}

// ── Assemble complete spec from all chunks ────────────────────────────────────
function _assembleFullSpec(manifest) {
  const specDir  = path.join(SPECS_ROOT, manifest.uuid);
  const sections = manifest.chunks
    .filter(c => c.status === CHUNK_STATES.COMPLETE)
    .sort((a, b) => a.chunkIdx - b.chunkIdx)
    .map(c => {
      const content = c.content || '';
      return `# ${c.sectionTitle}\n\n${content}`;
    });

  const fullSpec = [
    `spec:`,
    `  name: ${manifest.name}`,
    `  uuid: ${manifest.uuid}`,
    `  version: ${manifest.version}`,
    `  type: ${manifest.type}`,
    `  phase: ${manifest.phase}`,
    `  status: complete`,
    `  agent: ${manifest.agent}`,
    `  completed_at: ${new Date().toISOString()}`,
    ``,
    sections.join('\n\n---\n\n'),
  ].join('\n');

  const specPath = path.join(specDir, `${manifest.uuid}.spec`);
  fs.writeFileSync(specPath, fullSpec, 'utf8');
  manifest.specPath = specPath;
}

// ── Soft-delete / restore a spec ──────────────────────────────────────────────
// §NEW 2026-07-16 — archiveSpec() above compresses a *complete* spec to a
// .tar.gz for storage; it does NOT remove it from listSpecs()'s output. There
// was no way to actually get a spec out of the Spec Library UI short of
// deleting its directory by hand on disk — which is exactly what produced a
// 71-spec pile of test/probe fixtures from earlier dev sessions. Consistent
// with §7.4 elsewhere in this codebase ("nothing discarded — archived, not
// deleted") and with how repo.file.delete already works (a status flag
// filtered out of listings, not a real fs delete — see repo/index.js
// deleteFile → removeChunk): this sets a flag, listSpecs() filters it out by
// default, nothing on disk is touched or destroyed. restoreSpec reverses it.
export function deleteSpec(specUuid) {
  const manifest = loadSpec(specUuid);
  manifest.deleted = true;
  manifest.deletedAt = Date.now();
  saveSpec(manifest);
  return manifest;
}

export function restoreSpec(specUuid) {
  const manifest = loadSpec(specUuid);
  manifest.deleted = false;
  manifest.deletedAt = null;
  saveSpec(manifest);
  return manifest;
}

// ── Compress spec directory to archive ────────────────────────────────────────
// Called when user navigates away or explicitly archives.
// §2.2 — archive path stored in manifest so it's always findable.
export async function archiveSpec(specUuid) {
  const manifest  = loadSpec(specUuid);
  const specDir   = path.join(SPECS_ROOT, specUuid);
  const archivePath = `${specDir}.tar.gz`;

  // Use zlib + tar via Node streams — no external dependencies
  const { spawn } = await import('child_process');
  await new Promise((resolve, reject) => {
    const proc = spawn('tar', ['-czf', archivePath, '-C', SPECS_ROOT, specUuid]);
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`tar exited ${code}`)));
    proc.on('error', reject);
  });

  manifest.archivePath = archivePath;
  manifest.status = manifest.status === 'complete' ? 'archived' : manifest.status;
  saveSpec(manifest);
  console.log(`[${MODULE_ID}] archived: ${archivePath}`);
  return archivePath;
}

// ── Expand archive ────────────────────────────────────────────────────────────
export async function expandSpec(specUuid) {
  const archivePath = path.join(SPECS_ROOT, `${specUuid}.tar.gz`);
  if (!fs.existsSync(archivePath)) throw new Error(`archive not found: ${archivePath}`);

  const { spawn } = await import('child_process');
  await new Promise((resolve, reject) => {
    const proc = spawn('tar', ['-xzf', archivePath, '-C', SPECS_ROOT]);
    proc.on('close', code => code === 0 ? resolve() : reject(new Error(`tar exited ${code}`)));
    proc.on('error', reject);
  });

  return loadSpec(specUuid);
}

// ── Build prompt for a chunk — gives agent full context ───────────────────────
// Agents get: system context, spec metadata, previous chunks, their section task
export function buildChunkPrompt(manifest, chunk, systemContext = '') {
  const completedChunks = manifest.chunks
    .filter(c => c.status === CHUNK_STATES.COMPLETE && c.chunkIdx < chunk.chunkIdx)
    .map(c => `### ${c.sectionTitle}\n${c.content || ''}`)
    .join('\n\n');

  return [
    `You are building the "${chunk.sectionTitle}" section of a NEXUS component spec.`,
    ``,
    `SPEC CONTEXT:`,
    `  Name: ${manifest.name}`,
    `  Type: ${manifest.type}`,
    `  Description: ${manifest.description || '(none provided)'}`,
    `  UUID: ${manifest.uuid}`,
    `  Chunk: ${chunk.chunkIdx + 1}/${manifest.totalChunks}`,
    `  Section: ${chunk.sectionId}`,
    `  comp_id: ${chunk.comp_id}`,
    `  seam_id: ${chunk.seam_id}`,
    `  contract_id: ${chunk.contract_id}`,
    ``,
    systemContext ? `SYSTEM STATE:\n${systemContext}\n` : '',
    completedChunks ? `PREVIOUSLY COMPLETED SECTIONS:\n${completedChunks}\n` : '',
    `YOUR TASK:`,
    `Write the "${chunk.sectionTitle}" section for this spec.`,
    `${chunk.sectionDesc}`,
    ``,
    `Requirements:`,
    `- Be specific to "${manifest.name}" — not generic`,
    `- Reference AXIOMS-v1.0 where relevant`,
    `- Every UUID/seam_id/comp_id should follow the NEXUS naming convention`,
    `- §1.2: declare all failure modes explicitly`,
    `- §2.1: declare all JAA writes that must happen before behavior`,
    `- Output ONLY the section content — no preamble, no "here is the section:"`,
  ].filter(Boolean).join('\n');
}

export default {
  // §ADDED 2026-07-09 — idearium/api does `m.default || m`, so the DEFAULT
  // export is the real API surface. Named exports alone are invisible to it:
  // `se.listTemplates is not a function` at runtime. Caught by calling the
  // live endpoint, not by reading the file.
  listTemplates, getTemplate, readSeed,
  findByDedupKey, findPriorSection, importSpec,
  createSpec, loadSpec, saveSpec, listSpecs,
  nextPendingChunk, markChunkBuilding, completeChunk, failChunk,
  buildChunkPrompt, archiveSpec, expandSpec, deleteSpec, restoreSpec,
  computeRootHash, findByRootHash, ingestFilesAsSpec, addChunk, removeChunk,
  reconstructSpecText,
  SPEC_SECTIONS, CHUNK_STATES,
  MODULE_ID, VERSION, COMP_ID,
};

// §RE-EXPORT 2026-07-09 — idearium/api/index.js loads only spec-engine/index.js
// (`import('../spec-engine/index.js')`). Without this, `se.listTemplates()`
// in the `speceng.templates` action would be undefined at runtime: a declared
// wire to nothing, caught before shipping rather than after.
// §PHASE 6 2026-07-10 — intelligence in the loop: "query previous builds to
// reduce tokens and redundancy." Two levers, both previously absent.
//
// findByDedupKey — the spec-level lever. dedupKey (sha1 of name::type) was
// computed and STORED on every spec since day one, and never READ. Creating
// "auth-system"/system twice made two specs and rebuilt every chunk of the
// second at full token cost. This is the missing lookup.
export function findByDedupKey(name, type = 'component') {
  _ensureRoot();
  const key = _specDedupKey(name, type);
  for (const entry of fs.readdirSync(SPECS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const m = loadSpec(entry.name);
      if (m.dedupKey === key) return { uuid: m.uuid, name: m.name, type: m.type, status: m.status, progress: m.progress };
    } catch (_) {}
  }
  return null;
}

// §ROOT HASH 2026-07-11 — "the repo is an archive using the spec, the spec
// is the metadata, like a compartment with the spec as the metadata." The
// repo layer used to keep its OWN copy of file metadata (path+byte-length,
// no actual content) alongside a SEPARATE legacy spec object — two
// disconnected records claiming to describe one thing. Fixed not by adding
// a new archive format on top, but by recognizing the spec's own chunks
// already ARE the archive: real content, already verified on disk (§1.1),
// already tagged with comp_id/seam_id/contract_id. The only missing piece
// was identity — something that says "this exact content" the way JAA's
// store already does (content-addressable, SHA-256 of canonical JSON, same
// content -> same hash — see the james-brooks skill's JAA section). Reusing
// that exact convention here rather than inventing a second one: a spec's
// rootHash is the hash of its ordered (sectionId, chunk-hash) pairs. Two
// specs with identical chunk content produce the identical rootHash — free
// dedup, and a repo becomes addressable by content instead of by an
// arbitrarily-assigned uuid pointing at a copy nobody kept in sync.
function _canonicalJSON(v) {
  if (Array.isArray(v)) return '[' + v.map(_canonicalJSON).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + _canonicalJSON(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
function _sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function _hashChunk(c) { return _sha256(_canonicalJSON({ sectionId: c.sectionId, content: c.content || '' })); }

export function computeRootHash(manifest) {
  // §BUG FIXED 2026-07-11 — a removed chunk (removeChunk, soft-delete)
  // still had its content hashed in here, so rootHash never changed on
  // removal — two repos differing only by "one has a deleted file" would
  // report identical content identity, which is wrong: dedup/fork logic
  // reads rootHash as "what this repo actually contains."
  const ordered = manifest.chunks
    .filter(c => c.status !== 'removed')
    .sort((a, b) => a.chunkIdx - b.chunkIdx)
    .map(c => ({ sectionId: c.sectionId, hash: _hashChunk(c) }));
  return _sha256(_canonicalJSON(ordered));
}

// Content-addressable lookup — the repo layer's dedup lever. Same rootHash
// means same content already exists on disk; a caller can reuse it instead
// of writing a byte-identical second copy.
export function findByRootHash(rootHash) {
  _ensureRoot();
  for (const entry of fs.readdirSync(SPECS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const m = loadSpec(entry.name);
      if (m.rootHash === rootHash) return m;
    } catch (_) {}
  }
  return null;
}

// §UNIFIED INGEST 2026-07-11 — "least amount of friction, highest leverage,
// not a wrapper." Dropped repo files used to go through a completely
// separate code path from an imported .spec: RepoLayer built its own
// throwaway spec object and stored file metadata (no content) in its own
// JSON file. That's two storage systems for one concept. This collapses
// them: a dropped file becomes a chunk exactly the way an imported .spec's
// block becomes a chunk (dynamic sections, real content, completeChunk's
// existing §1.1 disk-verification) — same mechanism, same one gate,
// regardless of whether the content arrived as a parsed .spec block or a
// raw file. The repo layer (repo/index.js) no longer needs its own content
// store at all; it becomes a thin index over this.
// §NEW 2026-07-11 — every existing chunk-creation path (createSpec,
// ingestFilesAsSpec) builds a FIXED chunk list at spec-creation time.
// Nothing could add one more chunk to an ALREADY-existing spec — needed
// for the repo file editor's "add a file" action, since v2's repo has no
// content store of its own to add a file TO except through spec-engine.
// Same disk-write/rootHash-recompute path as every other chunk — this is
// not a second mechanism, just a chunk list that can grow after creation.
export function addChunk(specUuid, { sectionId, title = null, content = '' } = {}) {
  if (!sectionId) throw new Error('addChunk: sectionId required');
  const manifest = loadSpec(specUuid);
  if (manifest.chunks.some(c => c.sectionId === sectionId)) {
    throw new Error(`addChunk: section '${sectionId}' already exists on this spec — use completeChunk to edit it`);
  }
  const chunkUuid = crypto.randomUUID();
  const chunkIdx  = manifest.chunks.length;
  const specDir   = path.join(SPECS_ROOT, specUuid);
  const now       = Date.now();
  const chunk = {
    uuid: chunkUuid, specUuid, chunkIdx,
    sectionId, sectionTitle: title || sectionId, sectionDesc: `added file: ${sectionId}`,
    comp_id: COMP_ID, seam_id: `${SEAM_PREFIX}:${specUuid.slice(0,8)}:${sectionId}`,
    contract_id: `spec-contract:${specUuid.slice(0,8)}:${sectionId}:${chunkUuid.slice(0,8)}`,
    filePath: path.join(specDir, `${chunkUuid}.md`),
    fileName: `${String(chunkIdx).padStart(2,'0')}-${sectionId}.md`,
    status: CHUNK_STATES.PENDING, agent: 'user', agentModel: null,
    attempts: 0, failureMode: null, content: null, byteSize: 0,
    createdAt: now, updatedAt: now, completedAt: null,
    tags: [sectionId, manifest.type, manifest.name.toLowerCase().replace(/\s+/g,'-')],
  };
  manifest.chunks.push(chunk);
  manifest.totalChunks = manifest.chunks.length;
  saveSpec(manifest);
  // §BUG FIXED 2026-07-11 — completeChunk() returns the single chunk it
  // just completed, not the manifest. Returning that directly here left
  // callers (repo/index.js's writeFile) doing `fresh.chunks.find(...)` on
  // an object with no .chunks property at all — reliable crash on every
  // "add a new file with content" call. Always return the fresh manifest.
  if (content && content.trim()) completeChunk(specUuid, chunkUuid, content);
  return loadSpec(specUuid);
}

// Soft-delete — §7.4 nothing discarded. The chunk stays on disk (its .md
// file untouched) but is excluded from the repo's file listing and no
// longer counts toward totalChunks/progress. Recomputes rootHash so a
// repo's content identity reflects the removal.
export function removeChunk(specUuid, chunkUuid) {
  const manifest = loadSpec(specUuid);
  const chunk = manifest.chunks.find(c => c.uuid === chunkUuid);
  if (!chunk) throw new Error(`chunk ${chunkUuid} not found`);
  chunk.status = 'removed';
  chunk.updatedAt = Date.now();
  manifest.totalChunks = manifest.chunks.filter(c => c.status !== 'removed').length;
  manifest.doneChunks  = manifest.chunks.filter(c => c.status === CHUNK_STATES.COMPLETE).length;
  manifest.progress    = manifest.totalChunks ? Math.round((manifest.doneChunks / manifest.totalChunks) * 100) : 0;
  manifest.rootHash     = computeRootHash(manifest);
  manifest.updatedAt   = Date.now();
  saveSpec(manifest);
  return loadSpec(specUuid);
}

export function ingestFilesAsSpec({ name, files = [], author = 'ingest' }) {
  if (!files.length) throw new Error('ingestFilesAsSpec: at least one file required');
  const seenIds = new Map();
  const sections = files.map((f, idx) => {
    let id = _slug((f.path || `file-${idx}`).replace(/\//g, '-'));
    const n = (seenIds.get(id) || 0) + 1;
    seenIds.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    return { id, title: f.path || `file-${idx}`, desc: `ingested file: ${f.path || idx}` };
  });
  const manifest = _buildManifest({ name, type: 'codebase', description: 'ingested from dropped files', author, sections });
  files.forEach((f, i) => {
    const chunk = manifest.chunks[i];
    const content = (f.content && f.content.trim()) ? f.content : `<!-- ${f.path}: no text content captured -->`;
    markChunkBuilding(manifest.uuid, chunk.uuid, { agent: 'ingest', model: 'ingest:drop' });
    completeChunk(manifest.uuid, chunk.uuid, content);
    const fresh = loadSpec(manifest.uuid);
    const fc = fresh.chunks.find(c => c.uuid === chunk.uuid);
    if (fc) { fc.agent = 'ingest'; fc.agentModel = 'ingest:drop'; }
    saveSpec(fresh);
  });
  return loadSpec(manifest.uuid);
}

// findPriorSection — the chunk-level lever. The WARP exact cache reuses a chunk
// only when the whole PROMPT matches, and a prompt includes the spec name — so
// the same "purpose" section in two differently-named specs never hits. This
// answers "has this exact section (sectionId + sectionDesc) already been built
// somewhere?" so the caller can reuse the content instead of dispatching. It
// returns the newest complete match, or null. Content-addressed on the section
// contract, not the spec identity.
export function findPriorSection(sectionId, sectionDesc = '', excludeSpecUuid = null) {
  _ensureRoot();
  let best = null;
  for (const entry of fs.readdirSync(SPECS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const m = loadSpec(entry.name);
      if (m.uuid === excludeSpecUuid) continue;
      const chunk = (m.chunks || []).find(c =>
        c.sectionId === sectionId &&
        c.status === 'complete' &&
        (!sectionDesc || c.sectionDesc === sectionDesc) &&
        c.content && c.agent !== 'template');   // template seeds are spec-specific, not reusable content
      if (chunk && (!best || (chunk.completedAt || 0) > (best.completedAt || 0))) {
        best = { specUuid: m.uuid, specName: m.name, sectionId,
          content: chunk.content, completedAt: chunk.completedAt, agent: chunk.agent };
      }
    } catch (_) {}
  }
  return best;
}

// §CONSOLIDATED 2026-07-14 — boundary detection, byte-fidelity checking, and
// SPLIT_THRESHOLD_CHARS moved to lib/chunker/index.js so idearium isn't the
// only system with this logic — loom (or anything else that needs to split
// a document) gets the same real implementation, not a second one grown
// independently later. See that file's header for the full history (the
// three-dialect detector, the byte-fidelity trim bugs and their fixes).
const { chunkDocument, structuralProfile, slug: _slug, SPLIT_THRESHOLD_CHARS } = _require('../../lib/chunker/index.js');
// §WIRED 2026-08-15 (LS3) — James: route idearium's chunking through
// chunk-service.js "instead of around it." Same proven ESM->CJS bridge
// already used one line above for lib/chunker — this boundary was never
// as blocked as first scoped; chunkGoverned() being async is the real,
// smaller change (propagated below, both real call sites already inside
// async contexts, checked directly before touching anything).
const { chunkGoverned } = _require('../../lib/chunk-service.js');

// §IMPORT 2026-07-10 — "need a way to import zip or .spec to build a repo."
// §REWRITTEN 2026-07-10 — the original version mapped every block through a
// fixed 10-slot alias table (meta/purpose/schema/api/events/integration/
// tests). That table is many-to-one: 'causal map', 'runtime model',
// 'snapshots' and 'evolution log' all aliased to the SAME 'integration'
// chunk, and a chunk that's already complete is skipped rather than
// appended to — so on a real 11-block spec like causal-nexus.spec, only the
// FIRST block to claim a slot survived; the rest were silently discarded.
// That's a direct contradiction of this file's own "§Information Must Never
// Be Lost" comment. Fixed by not pre-declaring slots at all: the chunk list
// is now built FROM the document's own structure (via _detectSubBoundaries
// above), one chunk per block or per natural sub-boundary inside a dense
// block, so there is no shared bucket left to collide over.
//
// Every block is queued and processed through the real chunk state machine
// (pending -> building -> complete) via markChunkBuilding/completeChunk —
// zero-token, since the content is already authored, but not a shortcut
// around the contract: every chunk is still written to disk and verified
// like any agent-built one, just instantly instead of after a dispatch.
export async function importSpec({ name, specText, author = 'import' }) {
  if (!specText || !specText.trim()) throw new Error('importSpec: specText required');
  const specName = name || (specText.match(/name:\s*(\S+)/)?.[1]) || `imported-${Date.now()}`;

  // §CONSOLIDATED 2026-07-14 — block splitting, sub-boundary detection, and
  // the byte-fidelity self-check all now live in lib/chunker/index.js
  // (chunkDocument). This is the same logic that used to be inline here —
  // moved, not reimplemented, so idearium isn't the only caller of it.
  const { queue, byteFidelity, blocksFound } = (await chunkGoverned(specText)).chunks;
  const roundtrip = byteFidelity.verified;
  if (!roundtrip) {
    console.warn(`[idearium.spec-engine] importSpec: byte-fidelity check FAILED for "${specName}" — ` +
      `reconstructed ${byteFidelity.reconstructedBytes}b vs source ${byteFidelity.sourceBytes}b, ` +
      `first divergence at byte ${byteFidelity.firstDivergence}`);
  }

  const sections = queue.map(q => ({ id: q.id, title: q.title, desc: q.desc }));
  const manifest = _buildManifest({ name: specName, type: 'system', description: 'imported from .spec', author, sections });

  const filled = [];
  for (const q of queue) {
    const chunk = manifest.chunks.find(c => c.sectionId === q.id);
    if (!chunk) continue; // sections[] and queue[] are built 1:1 — should never miss
    markChunkBuilding(manifest.uuid, chunk.uuid, { agent: 'import', model: 'import:.spec' });
    const tag = q.sourceKey ? `imported: ${q.sourceBlock} → ${q.sourceKey}` : `imported block: ${q.sourceBlock}`;
    completeChunk(manifest.uuid, chunk.uuid, `<!-- ${tag} -->\n\n${q.content}`, { preserveWhitespace: true });
    const fresh = loadSpec(manifest.uuid);
    const fc = fresh.chunks.find(c => c.uuid === chunk.uuid);
    if (fc) {
      fc.agent = 'import';
      fc.agentModel = 'import:.spec';
      // §COGNITIVE SEAM 2026-07-14 — "complexity is a shape, not a scalar."
      // Real counts (deps/hookEvents/failureModes/invariantRefs) from the
      // chunk's own content, kept as a vector, not collapsed to one score —
      // enforcement (small, high invariant fan-out) vs kernel (large, spread
      // across categories) need different handling, not the same number.
      fc.structuralProfile = structuralProfile(q.content);
    }
    saveSpec(fresh);
    filled.push(q.id);
  }

  const out = loadSpec(manifest.uuid);
  out.importedBlocks = queue.map(q => q.sourceBlock).filter((v, i, a) => a.indexOf(v) === i);
  out.importedUnmatched = [];   // every block now produces at least one chunk — nothing to lose
  out.byteFidelity = byteFidelity;
  saveSpec(out);
  return { manifest: out, blocksFound, sectionsFilled: filled, unmatched: [], byteFidelity: out.byteFidelity };
}

export { listTemplates, getTemplate, readSeed };
