'use strict';
// guardian/schemas/session.js — real schema for the .guardian_session
// node type.
// UUID: nexus-node-schema-guardian-session-v1-0000-2026-0911-001
//
// §RECONCILED 2026-09-11 — was status: 'REAL — DRIFT' (3 unreconciled
// construction sites, different field casing, different primary-key
// names). Fixed in guardian/server.js, not just re-described here:
//
//   site 2 (POST /sessions/:chatId/name) had its OWN direct
//   jaa.insert/update AND ALSO emitted guardian.session.named right
//   after — every call wrote the session TWICE, once malformed
//   (uuid/chatId/updatedAt/createdAt). Removed the redundant direct
//   write; the route now only emits the gate, same as every other
//   caller. This was a real duplicate-write bug, not only a naming
//   drift.
//
//   site 3 (POST /api/account-identity) kept its own real logic
//   (account_uuid, tab_id — fields the naming gate doesn't touch,
//   genuinely different concern) but its two drifted fields — `uuid` and
//   `tabId` — were renamed to `id` and `tab_id` to match every other
//   real guardian table and the canonical write site below.
//
// One canonical write path now: guardian.session.named (the SISOGate
// below, in guardian/server.js) for name/provider/account/chat_url/
// token_total, plus /api/account-identity for account_uuid/tab_id on
// the same row, both keyed by chat_id, both using `id` as primary key.

module.exports = {
  status: 'REAL',
  source: 'guardian/server.js — guardian.session.named SISOGate (canonical write path) + POST /api/account-identity (account_uuid/tab_id only), reconciled 2026-09-11',
  fields: {
    id:           { type: 'string', required: true,  description: 'real primary key — randomUUID(), used at both real write sites now' },
    chat_id:      { type: 'string', required: true,  description: 'real chat id — the key both write sites look up existing rows by' },
    chat_url:     { type: 'string', required: false, description: 'real chat url' },
    provider:     { type: 'string', required: false, description: "real provider, defaults to 'claude' at insert time" },
    account:      { type: 'string', required: false, description: 'real account' },
    account_uuid: { type: 'string', required: false, description: 'real resolved account-identity uuid — only set via /api/account-identity, from lib/account-identity-index.js' },
    tab_id:       { type: 'string', required: false, description: 'real originating tab id — only set via /api/account-identity' },
    name:         { type: 'string', required: false, description: 'real human-assigned session name — only set via guardian.session.named' },
    token_total:  { type: 'number', required: false, description: 'real running token count, defaults to 0 at insert — only set via guardian.session.named' },
    started_ts:   { type: 'number', required: false, description: 'real creation timestamp — set by guardian.session.named at insert' },
    created_ts:   { type: 'number', required: false, description: 'real creation timestamp — set by /api/account-identity at insert; same real concept as started_ts, still two names because the two insert paths create different rows for different first-touch events, not reconciled into one insert path (real, left as-is — see §NOT RECONCILED below)' },
    updated_ts:   { type: 'number', required: true,  description: 'real last-write timestamp, set by both write sites on update' },
  },
};

// §NOT RECONCILED — started_ts and created_ts are still two separate real
// fields, not merged into one. A session can be first created by either
// write path (whichever event happens first for a given chat_id), and each
// path only sets its own timestamp field at insert time. Merging them
// would mean one path checking the other's field before insert, a real
// behavior change beyond fixing the naming/duplicate-write drift — left
// as an open item, not silently folded in here.
