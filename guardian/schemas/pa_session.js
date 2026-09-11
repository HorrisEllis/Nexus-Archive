'use strict';
// guardian/schemas/pa_session.js — real schema for the .guardian_pa_session
// node type ("pa" = pause/attention analysis, per field shape below).
// UUID: nexus-node-schema-guardian-pa-session-v1-0000-2026-0911-001

module.exports = {
  status: 'REAL',
  source: 'guardian/server.js — the guardian.pa.session SISOGate\'s real jaa.insert(\'pa_sessions\', ...) shape',
  fields: {
    id:               { type: 'string', required: true,  description: 'real id — randomUUID()' },
    job_id:           { type: 'string', required: false, description: 'real associated job id, null if none' },
    chat_id:          { type: 'string', required: false, description: 'real chat id, null if none' },
    session_id:       { type: 'string', required: false, description: 'real session id, null if none' },
    account:          { type: 'string', required: false, description: 'real account, null if none' },
    provider:         { type: 'string', required: false, description: 'real provider, null if none' },
    total_tokens:     { type: 'number', required: true,  description: 'real token count, defaults to 0' },
    tps_avg:          { type: 'number', required: true,  description: 'real average tokens-per-second, parsed float, defaults to 0' },
    pause_count:      { type: 'number', required: true,  description: 'real pause count, defaults to 0' },
    entropy_avg:      { type: 'number', required: true,  description: 'real average entropy — mean of data.entropy array if provided, else data.entropy directly, else 0' },
    burst_count:      { type: 'number', required: true,  description: 'real burst count — always 0 at write time in the current call site, not yet computed' },
    hypotheses:       { type: 'array',  required: true,  description: 'real hypotheses array, JSON-stringified at write time, defaults to []' },
    structure_events: { type: 'array',  required: true,  description: "real structure events — always '[]' at write time in the current call site, not yet populated" },
    ts:               { type: 'number', required: true,  description: 'real timestamp' },
  },
};
