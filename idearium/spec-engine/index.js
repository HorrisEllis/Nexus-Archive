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

const _require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODULE_ID   = 'idearium.spec-engine';
const VERSION     = '1.1.0';  // +templates, +templateId provenance (idearium-templates.spec v1.0.0)
const COMP_ID     = 'idearium.spec-engine';
const SEAM_PREFIX = 'idearium.spec-engine:v1:chunk';

// ── Spec storage root ─────────────────────────────────────────────────────────
const SPECS_ROOT = path.join(__dirname, '..', 'data', 'specs');

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
 * _seedFromTemplate — deterministic, per-template seeding. Returns
 * { sectionId, content } or null. Two honest paths, not one blurred into
 * the other:
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
function _seedFromTemplate(templateId, specName) {
  const seed = readSeed(templateId);
  if (!seed) return null;
  const template = getTemplate(templateId);
  const seedSection = template?.seedSection || 'meta';

  if (templateId === 'genesis') {
    const content = _seedMetaFromGenesis(seed, specName, templateId);
    return content ? { sectionId: seedSection, content } : null;
  }

  // Path (b): verbatim section content, tagged with provenance — the same
  // "already real, just needs a home" logic importSpec uses per-block.
  const lines = [
    `Seeded deterministically from template \`${templateId}\` — no agent dispatched.`,
    ``,
    `> Source: idearium/spec-engine/templates/${template.seedFile}`,
    ``,
    `---`,
    ``,
    seed.trim(),
  ];
  return { sectionId: seedSection, content: lines.join('\n') };
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
function _buildManifest({ name, type = 'component', description = '', agent = 'ollama', author = 'nexus', templateId = null, sections = SPEC_SECTIONS }) {
  _ensureRoot();
  if (!name) throw new Error('spec name required');

  // §1.2 — an unknown templateId is an error, not a silent fallback to none.
  // A spec that claims a template it never used is a lie in its own manifest.
  const template = templateId ? getTemplate(templateId) : null;
  if (templateId && !template) {
    throw new Error(`unknown templateId '${templateId}'. Known: ${listTemplates().map(t => t.id).join(', ')}`);
  }
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
    templateId:     templateId,
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

  // §SEEDED 2026-07-09 — the template's deterministic contribution, applied
  // AFTER the manifest is on disk because completeChunk() reloads the spec to
  // recompute progress. Reuses completeChunk rather than writing chunk files
  // here: one code path owns "a chunk became complete", so progress, byteSize
  // and the ledger stay correct by construction.
  if (template) {
    const seeded = _seedFromTemplate(templateId, name);
    if (seeded) {
      const targetChunk = manifest.chunks.find(c => c.sectionId === seeded.sectionId);
      if (targetChunk) {
        try {
          completeChunk(specUuid, targetChunk.uuid, seeded.content);

          // §BUG FIXED 2026-07-09 — this previously set the chunk's `agent` on
          // the stale in-memory object and then returned the freshly-loaded
          // on-disk manifest, so the seeded chunk reported `agent: 'ollama'`.
          // It claimed an LLM produced content no LLM ever touched. Provenance
          // that lies is worse than provenance that is absent. Persist it.
          const fresh = loadSpec(specUuid);
          const fm = fresh.chunks.find(c => c.uuid === targetChunk.uuid);
          if (fm) { fm.agent = 'template'; fm.agentModel = `template:${templateId}`; }
          fresh.templateSeeded = [seeded.sectionId];
          saveSpec(fresh);

          console.log(`[${MODULE_ID}] seeded '${seeded.sectionId}' from template '${templateId}' — 1 of ${chunks.length} chunks needs no agent`);
          return fresh;
        } catch (e) {
          // §1.2 — a failed seed degrades to normal dispatch, loudly.
          console.warn(`[${MODULE_ID}] template seed failed, chunk stays PENDING: ${e.message}`);
        }
      } else {
        console.warn(`[${MODULE_ID}] template '${templateId}' targets section '${seeded.sectionId}' which isn't in this spec's section list — seed skipped, all chunks dispatch`);
      }
      return loadSpec(specUuid);
    }
    console.warn(`[${MODULE_ID}] template '${templateId}' produced no deterministic seed — all ${chunks.length} chunks will dispatch`);
  }

  console.log(`[${MODULE_ID}] spec created: ${specUuid.slice(0,8)} "${name}" · ${chunks.length} chunks · agent:${agent}`);
  return manifest;
}

export function createSpec({ name, type = 'component', description = '', agent = 'ollama', author = 'nexus', templateId = null }) {
  return _buildManifest({ name, type, description, agent, author, templateId, sections: SPEC_SECTIONS });
}

// ── Load spec manifest from disk ──────────────────────────────────────────────
export function loadSpec(specUuid) {
  const manifestPath = path.join(SPECS_ROOT, specUuid, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`spec ${specUuid} not found`);
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

// ── Save spec manifest to disk ────────────────────────────────────────────────
export function saveSpec(manifest) {
  const specDir = path.join(SPECS_ROOT, manifest.uuid);
  fs.mkdirSync(specDir, { recursive: true });
  manifest.updatedAt = Date.now();
  fs.writeFileSync(path.join(specDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

// ── List all specs ────────────────────────────────────────────────────────────
export function listSpecs() {
  _ensureRoot();
  const specs = [];
  for (const entry of fs.readdirSync(SPECS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const manifest = loadSpec(entry.name);
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
        // §2026-07-10 — lightweight per-section status for the UI's Spec Library
        // chips. Id/title/done only, NOT content: the list must stay small even
        // with many specs. The detail view loads full chunk content on demand.
        chunks: (manifest.chunks || []).map(c => ({
          sectionId: c.sectionId, sectionTitle: c.sectionTitle,
          chunkIdx: c.chunkIdx, status: c.status,
        })),
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
export function completeChunk(specUuid, chunkUuid, content) {
  if (!content || !content.trim()) {
    return failChunk(specUuid, chunkUuid, 'agent returned empty content');
  }

  const manifest = loadSpec(specUuid);
  const chunk    = manifest.chunks.find(c => c.uuid === chunkUuid);
  if (!chunk) throw new Error(`chunk ${chunkUuid} not found`);

  const specDir  = path.join(SPECS_ROOT, specUuid);
  const filePath = path.join(specDir, `${String(chunk.chunkIdx).padStart(2,'0')}-${chunk.sectionId}-${chunkUuid.slice(0,8)}.md`);

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
    content.trim(),
  ].join('\n');

  fs.writeFileSync(filePath, fileContent, 'utf8');

  // §1.1 — verify artifact exists on disk before marking complete
  if (!fs.existsSync(filePath)) {
    return failChunk(specUuid, chunkUuid, 'file write verification failed — artifact not found after write');
  }

  chunk.status      = CHUNK_STATES.COMPLETE;
  chunk.filePath    = filePath;
  chunk.content     = content.trim();
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
  buildChunkPrompt, archiveSpec, expandSpec,
  computeRootHash, findByRootHash, ingestFilesAsSpec,
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
  const ordered = [...manifest.chunks]
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

// §BOUNDARY ENGINE 2026-07-10 — "the system detects natural cognitive
// boundaries and creates warp gates automatically" instead of a human (or a
// hardcoded alias table) declaring them. Applied here at the cheapest honest
// level: structural repetition. Within a block's body, find every line that
// opens a new sibling unit. Group candidates by their grouping key (indent
// depth for YAML, header depth for markdown, keyword for line-oriented
// DSLs). The grouping with 3+ repeats IS the block's natural sibling
// boundary. Returns null when no such repetition exists, so a small/flat
// block is left whole.
//
// §GENERALIZED 2026-07-11 — real uploaded specs proved this needs to be
// format-agnostic, not YAML-only. Same James-authored corpus, three
// structurally different dialects:
//   - YAML block style   (causal-nexus.spec, RHEON_VOID*, forge-ide.spec) —
//     "  key:" sibling lines at a shared indent.
//   - Flat YAML, no banners (NEXUS-GUARDIAN.spec, NEXUS-SPEC-v9, spec-parser.spec) —
//     same shape, just no "# BLOCK N —" banners above it. Already handled:
//     these fall to a single unbannered block, which is >SPLIT_THRESHOLD, so
//     the YAML detector runs on the whole document and finds the top-level
//     keys directly. No change needed for this dialect.
//   - Markdown docs      (SYSTEM_SPEC_v1_0_0.md, spec-nexus-browser-automation.md) —
//     no YAML keys at all, only "## N. TITLE" headers. YAML detector finds
//     nothing → collapsed into one undivided chunk. Confirmed by direct test.
//   - Line-statement DSL (genesis.spec) — no YAML, no markdown, only
//     `domain "name"` declarations at column 0 with `// ── banner ──`
//     comments for the preamble. Same failure as markdown.
// The last two silently defeated the boundary engine — not a crash, just a
// giant unsplit chunk, which is the same "information not lost but not
// usefully bounded" failure the engine exists to prevent. Fixed by trying
// three detectors in order and using the first that finds real repetition,
// instead of only ever trying the YAML one.
function _detectSubBoundaries(body) {
  return _detectYamlBoundaries(body) || _detectMarkdownBoundaries(body) || _detectDeclarationBoundaries(body);
}

// Dialect 1 — YAML sibling keys: "  key:" lines grouped by indent depth.
// The shallowest indent with >=3 repeats is the true outer partition (e.g.
// the 21 module names in BLOCK 4). Deeper indents recur more often (every
// module repeats "inputs:", "outputs:", ...) but that's structure INSIDE
// each unit, not between units — picking the deepest one would slice spans
// across module boundaries and produce colliding, wrongly-scoped chunks.
function _detectYamlBoundaries(body) {
  const lines = body.split('\n');
  const keyLineRe = /^(\s+)([a-zA-Z][\w.-]*):\s*$/;
  const byIndent = new Map();
  lines.forEach((line, i) => {
    const m = line.match(keyLineRe);
    if (!m) return;
    const indent = m[1].length;
    if (!byIndent.has(indent)) byIndent.set(indent, []);
    byIndent.get(indent).push({ key: m[2], lineIdx: i });
  });
  let best = null;
  for (const [indent, matches] of [...byIndent.entries()].sort((a, b) => a[0] - b[0])) {
    if (matches.length >= 3) { best = matches; break; }
  }
  return best ? _spansFromMatches(lines, best) : null;
}

// Dialect 2 — Markdown headers: "## Title" lines grouped by "#" depth.
// Same rule as YAML: shallowest depth with >=3 repeats wins, since that's
// the outer partition (chapter-level), not the incidental deeper structure
// inside one chapter (which may itself repeat "### Fields" etc.).
function _detectMarkdownBoundaries(body) {
  const lines = body.split('\n');
  const headerRe = /^(#{1,6})\s+(.+?)\s*$/;
  const byDepth = new Map();
  let inFence = false;
  lines.forEach((line, i) => {
    // Fenced code blocks (```...```) commonly contain shell/comment lines
    // like "# do the thing" — a single '#' at column 0 that would otherwise
    // be misread as a depth-1 document header and outrank the real headers
    // (depth sorts shallowest-first). Skip anything inside a fence.
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    const m = line.match(headerRe);
    if (!m) return;
    const depth = m[1].length;
    if (!byDepth.has(depth)) byDepth.set(depth, []);
    byDepth.get(depth).push({ key: m[2], lineIdx: i });
  });
  // Depth 1 ("# Title") is conventionally the single document title, not a
  // repeating sibling boundary — a stray "# comment" inside prose (or an
  // unfenced shell snippet) would otherwise register as 3 "matches" and,
  // being shallower, wrongly outrank the real "## chapter" partition.
  // Prefer depth>=2; only fall back to depth 1 if nothing deeper qualifies.
  let best = null;
  for (const [depth, matches] of [...byDepth.entries()].filter(([d]) => d >= 2).sort((a, b) => a[0] - b[0])) {
    if (matches.length >= 3) { best = matches; break; }
  }
  if (!best) {
    const depth1 = byDepth.get(1);
    if (depth1 && depth1.length >= 3) best = depth1;
  }
  return best ? _spansFromMatches(lines, best) : null;
}

// Dialect 3 — line-statement DSLs (e.g. genesis.spec's `domain "name"`):
// a bare keyword at column 0 (or a shared indent), followed by a quoted or
// bare identifier, repeated 3+ times. Grouped by keyword so unrelated
// declaration types (domain vs axiom vs bind) never merge into one span set.
function _detectDeclarationBoundaries(body) {
  const lines = body.split('\n');
  const declRe = /^(\s*)([a-zA-Z][\w-]*)\s+"?([\w][\w.\/-]*)"?\s*(\{|\bversion\b|$)/;
  const byKeyword = new Map();
  lines.forEach((line, i) => {
    const m = line.match(declRe);
    if (!m) return;
    // Reject lines that are actually YAML "key: value" or comment lines —
    // this detector is for bare `keyword identifier` statements only.
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) return;
    if (/:/.test(line.slice(0, line.indexOf(m[3])))) return;
    const groupKey = `${m[1].length}:${m[2]}`;
    if (!byKeyword.has(groupKey)) byKeyword.set(groupKey, []);
    byKeyword.get(groupKey).push({ key: m[3], lineIdx: i });
  });
  let best = null;
  for (const matches of byKeyword.values()) {
    if (matches.length >= 3 && (!best || matches.length > best.length)) best = matches;
  }
  return best ? _spansFromMatches(lines, best) : null;
}

function _spansFromMatches(lines, matches) {
  const spans = matches.map((m, idx) => {
    const startLine = m.lineIdx;
    const endLine = idx + 1 < matches.length ? matches[idx + 1].lineIdx : lines.length;
    return { key: m.key, text: lines.slice(startLine, endLine).join('\n').trim() };
  });
  const preamble = lines.slice(0, matches[0].lineIdx).join('\n').trim();
  return { spans, preamble };
}

function _slug(s) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
}

// A block shorter than this is cheap enough to read as one chunk — splitting
// it would just create noise, not clarity. Above it, density is exactly the
// symptom the boundary engine is looking for.
const SPLIT_THRESHOLD_CHARS = 1200;

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
export function importSpec({ name, specText, author = 'import' }) {
  if (!specText || !specText.trim()) throw new Error('importSpec: specText required');
  const specName = name || (specText.match(/name:\s*(\S+)/)?.[1]) || `imported-${Date.now()}`;

  // Split into blocks. Primary: "# BLOCK N — TITLE". Fallback: the whole
  // document is one block, so an unfamiliar format still imports instead of
  // failing outright.
  const blocks = {};
  const bannerRe = /#\s*BLOCK\s*\d+\s*[—-]\s*([A-Z][A-Z _]+)/g;
  const banners = [...specText.matchAll(bannerRe)];
  if (banners.length) {
    for (let i = 0; i < banners.length; i++) {
      const title = banners[i][1].trim().toLowerCase();
      const start = banners[i].index;
      const end = i + 1 < banners.length ? banners[i + 1].index : specText.length;
      blocks[title] = specText.slice(start, end).trim();
    }
  } else {
    blocks['spec'] = specText.trim();
  }

  // Build the import queue: walk every block, split the dense ones on their
  // own natural sub-boundaries, leave the rest whole.
  const queue = [];
  for (const [title, body] of Object.entries(blocks)) {
    const slug = _slug(title);
    const boundaries = body.length > SPLIT_THRESHOLD_CHARS ? _detectSubBoundaries(body) : null;

    if (boundaries) {
      let first = true;
      for (const span of boundaries.spans) {
        const content = (first && boundaries.preamble) ? `${boundaries.preamble}\n\n${span.text}` : span.text;
        first = false;
        queue.push({
          id: `${slug}-${_slug(span.key)}`,
          title: `${title} — ${span.key}`,
          desc: `auto-split from "${title}" (natural boundary: ${span.key})`,
          content, sourceBlock: title, sourceKey: span.key,
        });
      }
    } else {
      queue.push({ id: slug, title, desc: `imported block: ${title}`, content: body, sourceBlock: title, sourceKey: null });
    }
  }

  // §QUEUED — chunk slots are built to match the queue 1:1, then drained in
  // order. No fixed template, no shared buckets, nothing to overwrite.
  // Defensive dedup: two different blocks producing the same slug (e.g. two
  // sections both named "events") would otherwise collide on one chunk slot
  // the same way the old alias table did. Disambiguate instead.
  const seenIds = new Map();
  for (const q of queue) {
    const n = (seenIds.get(q.id) || 0) + 1;
    seenIds.set(q.id, n);
    if (n > 1) q.id = `${q.id}-${n}`;
  }
  const sections = queue.map(q => ({ id: q.id, title: q.title, desc: q.desc }));
  const manifest = _buildManifest({ name: specName, type: 'system', description: 'imported from .spec', author, sections });

  const filled = [];
  for (const q of queue) {
    const chunk = manifest.chunks.find(c => c.sectionId === q.id);
    if (!chunk) continue; // sections[] and queue[] are built 1:1 — should never miss
    markChunkBuilding(manifest.uuid, chunk.uuid, { agent: 'import', model: 'import:.spec' });
    const tag = q.sourceKey ? `imported: ${q.sourceBlock} → ${q.sourceKey}` : `imported block: ${q.sourceBlock}`;
    completeChunk(manifest.uuid, chunk.uuid, `<!-- ${tag} -->\n\n${q.content}`);
    const fresh = loadSpec(manifest.uuid);
    const fc = fresh.chunks.find(c => c.uuid === chunk.uuid);
    if (fc) { fc.agent = 'import'; fc.agentModel = 'import:.spec'; }
    saveSpec(fresh);
    filled.push(q.id);
  }

  const out = loadSpec(manifest.uuid);
  out.importedBlocks = Object.keys(blocks);
  out.importedUnmatched = [];   // every block now produces at least one chunk — nothing to lose
  saveSpec(out);
  return { manifest: out, blocksFound: Object.keys(blocks).length, sectionsFilled: filled, unmatched: [] };
}

export { listTemplates, getTemplate, readSeed };
