---
chunk_uuid: 6b459fdc-1b31-4aa2-8926-85f787046923
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-380-nexus-guardian-dropzone-persist-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/380-nexus-guardian-dropzone-persist-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-380-nexus-guardian-dropzone-persist-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-380-nexus-guardian-dropzone-persist-js-md:6b459fdc
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:32.151Z
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