'use strict';
// guardian/schemas/index.js — guardian's own schema registry.
// UUID: nexus-guardian-schemas-index-v1-0000-2026-0911-001
// §NEW 2026-09-11 — resolves P3's open question (lib/node-schemas.js's
// header: "shared base + per-system extension, or fully separate
// per-system schemas from scratch?"). James's decision: every system
// gets its own schemas/ folder. This is the real template — the
// convention below, not just guardian's answer.
//
// §CONVERTED 2026-09-11 (same pass) — James: "the node type is the file
// extension, not js — a yaml file with the node type as the extension."
// Every local entry below used to be a require()'d .js module; now every
// one is a real .schema YAML node file (node-export.js's own envelope),
// filename/id matching the full public type name (guardian_job.schema,
// not job.schema — kept consistent with lib/node-schemas/'s own
// filename===id convention).
//
// §GROUNDING RULE (same discipline lib/node-schemas.js already applies
// to itself) — a type is either (a) a direct reference to the shared
// central schema, when guardian genuinely uses that same real shape
// unmodified, or (b) a fresh guardian-local .schema file, grounded in
// guardian's own real construction site, when the data is
// guardian-exclusive. Never both — redefining a shared type here would
// be a second source of truth for the same real fields.
//
// Shared types guardian actually writes, referenced not duplicated:
//   .artifact          — lib/node-schemas/artifact.schema (guardian's own
//                         listeners are literally that schema's source)
//   .guardian_listener — lib/node-schemas/guardian_listener.schema (already
//                         a guardian-specific type, lives centrally only
//                         because it was built before this folder existed
//                         — real to move here later, not moved yet)
//   .ledger            — lib/node-schemas/ledger.schema (component-ledger.js
//                         is system-agnostic; guardian is one caller
//                         among many, not a guardian-exclusive shape)
//   .gap               — lib/node-schemas/gap.schema (same reasoning as ledger)
//
// Guardian-exclusive types, defined locally in this folder:
//   guardian_job, guardian_download, guardian_pa_session,
//   guardian_timeline_event, guardian_setting, guardian_session
//   (session was status: 'REAL — DRIFT' until the 2026-09-11 session-fix
//   pass reconciled it — see guardian_session.schema, now status: REAL)
//
// §NOT INCLUDED — gap_questions, chat_sessions, chat_messages,
// chat_completions exist in jaa/schema-full.sql's table list but have
// ZERO real writers anywhere in guardian/*.js (confirmed by grep, not
// assumed) — same dead-schema status as guardian_nodes/guardian_health.
// Not schema'd here; would be inventing a node type for a table nothing
// writes, exactly what §1.1/§1.3 exist to prevent. If real usage shows up
// later, add it then.

const fs = require('fs');
const path = require('path');
const nodeExport = require('../../lib/node-export.js');
const shared = require('../../lib/node-schemas.js');

const SCHEMAS_DIR = __dirname;

function loadLocal() {
  const out = {};
  const files = fs.readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema'));
  for (const f of files) {
    const doc = nodeExport.importFromFile(path.join(SCHEMAS_DIR, f));
    if (doc.type !== 'schema') {
      throw new Error(`guardian/schemas/index.js: ${f} has type "${doc.type}", expected "schema"`);
    }
    out[doc.id] = doc.payload;
  }
  return out;
}

const LOCAL = loadLocal();

const SHARED_TYPES = ['artifact', 'guardian_listener', 'ledger', 'gap'];

function get(type) {
  if (LOCAL[type]) return LOCAL[type];
  if (SHARED_TYPES.includes(type)) return shared.get(type);
  return null;
}

/** list() -> every type guardian real-uses, tagged by where it's defined. */
function list() {
  const local = Object.entries(LOCAL).map(([type, s]) => ({ type, status: s.status, source: s.source, definedIn: 'guardian/schemas' }));
  const ref = SHARED_TYPES.map(type => {
    const s = shared.get(type);
    return { type, status: s ? s.status : 'MISSING', source: s ? s.source : null, definedIn: 'lib/node-schemas (shared)' };
  });
  return [...local, ...ref];
}

module.exports = { get, list, LOCAL, SHARED_TYPES, MODULE_ID: 'guardian-schemas', VERSION: '1.0.0' };
