'use strict';
// guardian/schemas/guardian_setting.js — real schema for the
// .guardian_setting node type.
// UUID: nexus-node-schema-guardian-setting-v1-0000-2026-0911-001
//
// §NAMESPACE COLLISION, CONFIRMED — guardian/jaa-store.js's own comment
// (around its prefix-handling code) states directly: "'settings' exists
// in both cortex's and guardian's table lists" and that without a prefix,
// two unrelated 'settings' tables would silently merge. guardian/jaa-store.js
// already defends against this with a real prefix mechanism (bare table
// name 'settings' internally, prefixed physically) — this schema documents
// GUARDIAN's settings row only. Do not assume this shape applies to
// cortex's own settings table — not checked here, likely different.

module.exports = {
  status: 'REAL',
  source: 'guardian/jaa-store.js — get()/set() real key-value row shape (~lines 216-226)',
  fields: {
    id:         { type: 'string', required: true, description: 'real id — generated via the store\'s _uuid() helper' },
    key:        { type: 'string', required: true, description: 'real setting key' },
    value:      { type: 'string', required: true, description: 'real setting value — always stored as String(value), even for non-string inputs' },
    updated_ts: { type: 'number', required: true, description: 'real last-write timestamp' },
  },
};
