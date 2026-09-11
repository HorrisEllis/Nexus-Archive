'use strict';
// guardian/schemas/index.js — guardian's own schema registry.
// UUID: nexus-guardian-schemas-index-v1-0000-2026-0911-001
// §NEW 2026-09-11 — resolves P3's open question (lib/node-schemas.js's
// header: "shared base + per-system extension, or fully separate
// per-system schemas from scratch?"). James's decision: every system
// gets its own schemas/ folder. This is the real template — the
// convention below, not just guardian's answer.
//
// §GROUNDING RULE (same discipline lib/node-schemas.js already applies
// to itself) — a type is either (a) a direct require() of the shared
// central schema, when guardian genuinely uses that same real shape
// unmodified, or (b) a fresh guardian-local file, grounded in guardian's
// own real construction site, when the data is guardian-exclusive.
// Never both — redefining a shared type here would be a second source
// of truth for the same real fields, the exact mistake the central
// index already guards against for itself.
//
// Shared types guardian actually writes, referenced not duplicated:
//   .artifact          — lib/node-schemas/artifact.js (guardian's own
//                         listeners are literally that schema's source)
//   .guardian_listener — lib/node-schemas/guardian_listener.js (already
//                         a guardian-specific type, lives centrally only
//                         because it was built before this folder existed
//                         — real to move here later, not moved yet)
//   .ledger            — lib/node-schemas/ledger.js (component-ledger.js
//                         is system-agnostic; guardian is one caller
//                         among many, not a guardian-exclusive shape)
//   .gap               — lib/node-schemas/gap.js (same reasoning as ledger)
//
// Guardian-exclusive types, defined locally in this folder:
//   .guardian_job, .guardian_download, .guardian_pa_session,
//   .guardian_timeline_event, .guardian_setting, .guardian_session
//   (session is status: 'REAL — DRIFT', see session.js — not settled)
//
// §NOT INCLUDED — gap_questions, chat_sessions, chat_messages,
// chat_completions exist in jaa/schema-full.sql's table list but have
// ZERO real writers anywhere in guardian/*.js (confirmed by grep, not
// assumed) — same dead-schema status as guardian_nodes/guardian_health.
// Not schema'd here; would be inventing a node type for a table nothing
// writes, exactly what §1.1/§1.3 exist to prevent. If real usage shows up
// later, add it then.

const shared = require('../../lib/node-schemas.js');

const LOCAL = {
  guardian_job:            require('./job.js'),
  guardian_download:       require('./download.js'),
  guardian_pa_session:     require('./pa_session.js'),
  guardian_timeline_event: require('./timeline_event.js'),
  guardian_setting:        require('./guardian_setting.js'),
  guardian_session:        require('./session.js'),
};

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
