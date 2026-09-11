'use strict';
// lib/node-schemas/artifact.js — real schema for the .artifact node type.
// UUID: nexus-node-schema-artifact-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass.
// Real, ungrounded until now: `artifacts` is a real table (jaa/schema.sql
// AND jaa/schema-full.sql, both used by guardian/jaa-store.js) with no
// node-schema entry among the 19 real types.
//
// §NOTE — this is also the ONE place in the whole tree where content-
// addressing (the ChatGPT walk-doc's N3, node_uuid + content_hash as
// distinct fields) already exists for real: `hash` is UNIQUE, separate
// from `id`. Confirmed by direct read of jaa/schema-full.sql's CREATE
// TABLE statement, not the row-construction code (guardian/jaa-store.js
// reads/writes this table but doesn't itself construct every field —
// the SQL schema is the more authoritative source here, same reasoning
// component-ledger.js's write() was authoritative for .ledger).

module.exports = {
  status: 'REAL',
  source: 'jaa/schema-full.sql — CREATE TABLE artifacts, the real column set (also jaa/schema.sql, identical shape)',
  fields: {
    id:          { type: 'string', required: true,  description: 'real primary key' },
    hash:        { type: 'string', required: true,  description: 'real content hash, UNIQUE — the one real precedent for node_uuid/content_hash duality in this tree' },
    name:        { type: 'string', required: true,  description: "real display name, defaults to 'artifact'" },
    type:        { type: 'string', required: true,  description: "real artifact kind, defaults to 'code_block'" },
    lang:        { type: 'string', required: false, description: 'real language tag, if applicable' },
    content:     { type: 'string', required: true,  description: 'real artifact body — refused if missing (NOT NULL, no default)' },
    context:     { type: 'string', required: false, description: 'real surrounding context, if captured' },
    chat_url:    { type: 'string', required: true,  description: 'real source chat url — refused if missing' },
    chat_id:     { type: 'string', required: true,  description: 'real source chat id — refused if missing' },
    account:     { type: 'string', required: false, description: 'real account this artifact belongs to' },
    job_id:      { type: 'string', required: false, description: 'real guardian job id, if produced by one' },
    session_id:  { type: 'string', required: false, description: 'real session id' },
    direction:   { type: 'string', required: false, description: "real flow direction, defaults to 'output'" },
    provider:    { type: 'string', required: false, description: "real AI provider that produced it, defaults to 'claude'" },
    seen_count:  { type: 'number', required: false, description: 'real dedup counter, defaults to 1' },
    ts:          { type: 'number', required: true,  description: 'real creation timestamp — refused if missing' },
    last_seen:   { type: 'number', required: true,  description: 'real last-seen timestamp — refused if missing' },
    tags:        { type: 'array',  required: false, description: 'real tags, defaults to []' },
    meta:        { type: 'object', required: false, description: 'real free-form metadata, defaults to {}' },
  },
};
