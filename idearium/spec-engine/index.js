/**
 * idearium/spec-engine/index.js — Spec Compiler Engine
 * UUID: idearium-spec-engine-v1-0000-4000-0000-000000000001
 * Version: 1.0.0
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

const _require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODULE_ID   = 'idearium.spec-engine';
const VERSION     = '1.0.0';
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
export function createSpec({ name, type = 'component', description = '', agent = 'ollama', author = 'nexus' }) {
  _ensureRoot();
  if (!name) throw new Error('spec name required');

  const specUuid  = crypto.randomUUID();
  const dedupKey  = _specDedupKey(name, type);
  const specDir   = path.join(SPECS_ROOT, specUuid);
  const now       = Date.now();

  fs.mkdirSync(specDir, { recursive: true });

  // Build chunk contracts — one per section, each a first-class addressable unit
  const chunks = SPEC_SECTIONS.map((section, idx) => {
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
    chunks,
  };

  // §2.1 — write manifest to disk before anything else
  const manifestPath = path.join(specDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`[${MODULE_ID}] spec created: ${specUuid.slice(0,8)} "${name}" · ${chunks.length} chunks · agent:${agent}`);
  return manifest;
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
  createSpec, loadSpec, saveSpec, listSpecs,
  nextPendingChunk, markChunkBuilding, completeChunk, failChunk,
  buildChunkPrompt, archiveSpec, expandSpec,
  SPEC_SECTIONS, CHUNK_STATES,
  MODULE_ID, VERSION, COMP_ID,
};
