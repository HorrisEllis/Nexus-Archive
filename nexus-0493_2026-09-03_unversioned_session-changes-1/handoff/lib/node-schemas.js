'use strict';
/**
 * lib/node-schemas.js — the real schema for every node/extension type
 * lib/node-export.js's envelope can carry.
 * UUID: nexus-node-schemas-v1-0000-2026-0903-001
 *
 * §SPLIT 2026-09-03 — James: "separate the schemas." The 17 type schemas
 * that used to live inline here as one 275-line object now each live in
 * their own file under lib/schemas/ (lib/schemas/<type>.js), assembled by
 * lib/schemas/index.js. This file is now purely the thin, stable API
 * surface (get/list/checkPayload) every existing caller and test already
 * uses — SCHEMAS, get(), list(), checkPayload() all keep the exact same
 * signatures and behavior as before the split. No consumer needs to change.
 *
 * §GROUNDING RULE (unchanged) — every schema is either (a) a direct
 * reference to a schema that already exists as real code, or (b) freshly
 * written from the real record-construction code for that type, cited in
 * each entry's own `source`. All 17 named types are status: 'REAL' —
 * macro and failure_mode were the last two, found after James pointed at
 * where to look ("clear-glass: .macro", "data folders: .failure_mode")
 * rather than guessed at: macro -> lib/agent-tools/tools/clear-glass/
 * macro.js's real record; failure_mode -> lib/ico.js's real per-system
 * failures/ ledger (every data/<system>/failures/ dir is this exact shape).
 *
 * Shape every entry follows (see lib/schemas/schema.js for this as data):
 *   {
 *     status: 'REAL' | 'OPEN',        // REAL = grounded in existing code; OPEN = proposed, unbacked
 *     source: 'file.js — what real construction site this came from',
 *     fields: { name: { type, required, description } },
 *   }
 * `type` is a plain JS typeof string, or 'array'/'any' where the real
 * field is looser than that (matching loom's own Gate.schema convention
 * of only checking typeof, not a deep shape).
 */

const { SCHEMAS } = require('./schemas/index.js');

/** get(type) -> the schema entry, or null if the type is unknown. */
function get(type) { return SCHEMAS[type] || null; }

/** list() -> [{type, status, source}] for every known type, real state at a glance. */
function list() {
  return Object.entries(SCHEMAS).map(([type, s]) => ({ type, status: s.status, source: s.source }));
}

/**
 * checkPayload(type, payload) -> {ok, missing, wrongType}. A real, shallow
 * typeof-based check — same depth loom's own Gate.schema uses (checks
 * required keys + top-level typeof only), not a deep structural validator.
 */
function checkPayload(type, payload) {
  const schema = get(type);
  if (!schema) return { ok: false, missing: [], wrongType: [], reason: `unknown type "${type}"` };
  if (!payload || typeof payload !== 'object') return { ok: false, missing: Object.keys(schema.fields), wrongType: [], reason: 'payload is not an object' };

  const missing = [];
  const wrongType = [];
  for (const [field, def] of Object.entries(schema.fields)) {
    if (def.required !== true) continue; // HAT_SCHEMA's {field: 'string'} entries have no .required flag — treated as documentation-only, not enforced here
    if (!(field in payload) || payload[field] === undefined) { missing.push(field); continue; }
    if (def.type && def.type !== 'any') {
      const actual = Array.isArray(payload[field]) ? 'array' : typeof payload[field];
      if (def.type !== actual) wrongType.push({ field, expected: def.type, actual });
    }
  }
  return { ok: missing.length === 0 && wrongType.length === 0, missing, wrongType };
}

module.exports = { SCHEMAS, get, list, checkPayload };
