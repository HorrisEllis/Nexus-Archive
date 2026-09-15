---
chunk_uuid: 92a9f964-5da4-4bb7-9a12-1cc894a6f091
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-idearium-config-js
title: nexus/idearium/config.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-idearium-config-js
contract_id: spec-contract:47e02ad5:nexus-idearium-config-js:92a9f964
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:08.137Z
---

/**
 * idearium/config.js — real, distinct config, not inline constants
 * scattered across idearium/api/index.js (imported from ../config.js
 * relative to that file). Matches the pattern established by
 * guardian/config.js, copilot/config.js, cortex/config.js, etc. — but
 * genuinely ESM (export default), not CommonJS, since idearium/
 * package.json declares "type": "module".
 *
 * §SCOPE — PORT, BINDING, CHUNK_EVENTS_LIMIT, CORS are the real,
 * tunable config values. IDEARIUM_DATA_DIR/PROJECTS_DIR left in
 * index.js — structural paths derived from import.meta.url, matching
 * the precedent of leaving ROOT/UI_DIR in place elsewhere. CAPS and
 * ROUTE_CAP deliberately NOT here — real authorization schema (which
 * capability a route requires), not tunable config in the same sense.
 */

export default {
  PORT: parseInt(process.env.IDEARIUM_PORT || '4800', 10),
  BINDING: process.env.IDEARIUM_BIND || '127.0.0.1',

  // Most-recent-first cap — a 58-chunk spec with retries can generate
  // hundreds of rows; the UI needs a trail, not the full audit log on
  // every request (real reasoning preserved from the source).
  CHUNK_EVENTS_LIMIT: parseInt(process.env.IDEARIUM_CHUNK_EVENTS_LIMIT || '200', 10),

  CORS: {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
};