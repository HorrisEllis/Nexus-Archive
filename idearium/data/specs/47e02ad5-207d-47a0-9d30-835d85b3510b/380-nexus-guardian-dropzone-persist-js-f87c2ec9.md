---
chunk_uuid: f87c2ec9-d15b-42d1-b745-2ac928eb312a
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-dropzone-persist-js
title: nexus/guardian/dropzone-persist.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-dropzone-persist-js
contract_id: spec-contract:47e02ad5:nexus-guardian-dropzone-persist-js:f87c2ec9
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:31.810Z
---

'use strict';
/**
 * guardian/dropzone-persist.js — Persistent dropzone registry
 * UUID: guardian-dropzone-persist-v1-0000-0000-0000-000000000001
 * Version: 1.0.0
 * Persistent dropzone registry with JAA backing.
 * Tracks files dropped into the NEXUS Builder across sessions.
 */

class DropzoneRegistry {
  constructor(jaa) {
    this._jaa = jaa;
    this._entries = [];
  }

  load() {
    try {
      if (this._jaa) {
        this._entries = this._jaa.query('artifacts',
          r => r.source === 'dropzone', 100);
      }
    } catch(e) {
      console.warn('[dropzone-persist] load failed:', e.message);
    }
    return this._entries;
  }

  add(entry) {
    const record = {
      uuid: require('crypto').randomUUID(),
      source: 'dropzone',
      ...entry,
      ts: Date.now(),
    };
    try {
      if (this._jaa) this._jaa.insert('artifacts', record);
    } catch(e) {
      console.warn('[dropzone-persist] persist failed:', e.message);
    }
    this._entries.push(record);
    return record;
  }

  list() { return this._entries; }
}

module.exports = { DropzoneRegistry };