'use strict';
/**
 * lib/node-schemas.js — the real schema for every node/extension type
 * lib/node-export.js's envelope can carry.
 * UUID: nexus-node-schemas-v1-0000-2026-0903-001
 *
 * §SPLIT 2026-09-03 — James: "can you do the split now. all the contracts
 * schemas need to be that way also." This file used to be a monolith —
 * all 17 entries defined inline, plus three (hat/component/node) that
 * ALSO had their own real split file sitting unused in ./node-schemas/
 * next to a duplicate copy here, never actually wired in (found while
 * building .idea, flagged then, fixed now). Every entry below is now a
 * real require() of its own file — one schema, one file, one place to
 * edit it, matching James's own standing instruction ("each schema is
 * it's own file") for real this time, not 4/18.
 *
 * §GROUNDING RULE (unchanged) — every schema is either (a) a direct
 * reference to a schema that already exists as real code (never
 * redefined here — duplicating an existing schema is a second source of
 * truth for the same real fields), or (b) freshly written from the real
 * record-construction code for that type, cited in each entry's `source`.
 * Nothing was invented from the extension name alone.
 *
 * Shape every entry follows:
 *   {
 *     status: 'REAL' | 'OPEN',        // REAL = grounded in existing code; OPEN = proposed, unbacked
 *     source: 'file.js — what real construction site this came from',
 *     fields: { name: { type, required, description } },
 *   }
 * `type` is a plain JS typeof string, or 'array'/'any' where the real
 * field is looser than that (matching loom's own Gate.schema convention
 * of only checking typeof, not a deep shape).
 */

const SCHEMAS = {
  hat:          require('./node-schemas/hat.js'),
  component:    require('./node-schemas/component.js'),
  node:         require('./node-schemas/node.js'),
  contract:     require('./node-schemas/contract.js'),
  agent:        require('./node-schemas/agent.js'),
  model:        require('./node-schemas/model.js'),
  schema:       require('./node-schemas/schema.js'),
  crystal:      require('./node-schemas/crystal.js'),
  pat:          require('./node-schemas/pat.js'),
  gap:          require('./node-schemas/gap.js'),
  ledger:       require('./node-schemas/ledger.js'),
  tool:         require('./node-schemas/tool.js'),
  command:      require('./node-schemas/command.js'),
  cos:          require('./node-schemas/cos.js'),
  macro:        require('./node-schemas/macro.js'),
  failure_mode: require('./node-schemas/failure_mode.js'),
  idea:         require('./node-schemas/idea.js'),
};

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
