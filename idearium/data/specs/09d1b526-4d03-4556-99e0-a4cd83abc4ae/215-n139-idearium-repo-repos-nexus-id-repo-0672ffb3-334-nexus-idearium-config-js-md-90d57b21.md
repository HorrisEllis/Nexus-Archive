---
chunk_uuid: 90d57b21-8bd6-4a93-83ab-0f5fc3ed6655
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-334-nexus-idearium-config-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/334-nexus-idearium-config-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-334-nexus-idearium-config-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-334-nexus-idearium-config-js-md:90d57b21
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:20:24.142Z
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