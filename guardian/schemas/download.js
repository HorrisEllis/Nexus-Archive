'use strict';
// guardian/schemas/download.js — real schema for the .guardian_download
// node type.
// UUID: nexus-node-schema-guardian-download-v1-0000-2026-0911-001

module.exports = {
  status: 'REAL',
  source: 'guardian/server.js — the guardian.download SISOGate\'s real jaa.insert(\'downloads\', ...) shape',
  fields: {
    id:         { type: 'string', required: true,  description: 'real id — randomUUID()' },
    filename:   { type: 'string', required: true,  description: "real filename, defaults to 'download'" },
    href:       { type: 'string', required: false, description: 'real download URL' },
    chat_url:   { type: 'string', required: false, description: 'real source chat url' },
    chat_id:    { type: 'string', required: false, description: 'real source chat id' },
    account:    { type: 'string', required: false, description: 'real account' },
    job_id:     { type: 'string', required: false, description: 'real originating job id, null if not tied to one' },
    session_id: { type: 'string', required: false, description: 'real session id, null if not tied to one' },
    provider:   { type: 'string', required: false, description: 'real provider, null if unknown' },
    ts:         { type: 'number', required: true,  description: 'real timestamp' },
  },
};
