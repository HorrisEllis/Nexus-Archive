'use strict';
// guardian/schemas/job.js — real schema for the .guardian_job node type.
// UUID: nexus-node-schema-guardian-job-v1-0000-2026-0911-001
// §NEW 2026-09-11 — first entry in guardian's own schemas folder.
//
// Two real, reconciled construction sites (not drift — a real lifecycle):
//   1. dispatch time (guardian/server.js ~1183, lab path) — light shape,
//      created before a response exists.
//   2. guardian.job.complete gate (~1397) — the canonical, full shape,
//      written either as a fresh insert (if no matching job existed) or
//      as a jaa.update() onto the dispatch-time row. This schema
//      documents the full/complete shape; fields marked optional-at-
//      dispatch are the ones only guaranteed present after completion.

module.exports = {
  status: 'REAL',
  source: 'guardian/server.js — the guardian.job.complete SISOGate\'s real insert/update shape (~line 1397)',
  fields: {
    id:           { type: 'string', required: true,  description: 'real job id — randomUUID() if not supplied by the caller' },
    provider:     { type: 'string', required: true,  description: "real target AI provider, defaults to 'claude'" },
    command:      { type: 'string', required: false, description: 'real command type, e.g. code/spec/ask — empty string if not supplied' },
    prompt:       { type: 'string', required: false, description: 'real prompt text, truncated to 500 chars at write time' },
    response:     { type: 'string', required: false, description: 'real response text, truncated to 5000 chars — absent until completion' },
    status:       { type: 'string', required: true,  description: "real lifecycle status — 'queued' at dispatch, 'complete' once the job.complete gate fires" },
    chat_url:     { type: 'string', required: false, description: 'real source chat url' },
    chat_id:      { type: 'string', required: false, description: 'real source chat id' },
    account:      { type: 'string', required: false, description: 'real account' },
    session_id:   { type: 'string', required: false, description: 'real session id, null if not resolved' },
    chars:        { type: 'number', required: false, description: 'real response character count' },
    source:       { type: 'string', required: false, description: "real dispatch origin, e.g. 'guardian-ws' or 'lab' — not unified across call sites, present-if-known" },
    started_ts:   { type: 'number', required: true,  description: 'real dispatch timestamp' },
    completed_ts: { type: 'number', required: false, description: 'real completion timestamp — absent until the job completes' },
  },
};
