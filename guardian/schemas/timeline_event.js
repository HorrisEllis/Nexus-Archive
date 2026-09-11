'use strict';
// guardian/schemas/timeline_event.js — real schema for the
// .guardian_timeline_event node type.
// UUID: nexus-node-schema-guardian-timeline-event-v1-0000-2026-0911-001

module.exports = {
  status: 'REAL',
  source: 'guardian/server.js — the guardian.timeline SISOGate\'s real jaa.insert(\'timeline_events\', ...) shape (~line 1463)',
  fields: {
    id:         { type: 'string', required: true,  description: 'real id — randomUUID()' },
    channel:    { type: 'string', required: true,  description: "real channel name, defaults to 'unknown'" },
    person_id:  { type: 'string', required: false, description: 'real person id, null if none' },
    pair_id:    { type: 'string', required: false, description: 'real pair id — always null at this write site, field reserved not yet populated' },
    chat_id:    { type: 'string', required: false, description: 'real chat id, null if none' },
    session_id: { type: 'string', required: false, description: 'real session id, null if none' },
    payload:    { type: 'object', required: true,  description: 'real event payload, JSON-stringified at write time, defaults to {}' },
    ts:         { type: 'number', required: true,  description: 'real timestamp, defaults to Date.now()' },
  },
};
