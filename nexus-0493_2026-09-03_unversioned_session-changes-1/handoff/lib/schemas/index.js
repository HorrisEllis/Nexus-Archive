'use strict';
/**
 * lib/schemas/index.js — assembles every per-type schema file in this
 * directory into the one real SCHEMAS map. Split out of lib/node-schemas.js
 * (2026-09-03) per James: "separate the schemas" — each type is now its
 * own compartment (isolated file, explicit require, no shared object
 * literal to collide inside), this file is purely composition.
 *
 * §GROUNDING RULE (unchanged from the original node-schemas.js) — every
 * schema in this directory is either (a) a direct reference to a schema
 * that already exists as real code (hat.js, component.js, node.js —
 * never redefined, since duplicating an existing schema is a second
 * source of truth for the same real fields), or (b) freshly written from
 * the real record-construction code for that type, cited in each file's
 * own `source`. All 17 named types (16 here + 'nex', intentionally not
 * in this map — see lib/node-export.js) are status: 'REAL'.
 */
const SCHEMAS = {
  // ── Already real, formal schemas elsewhere — referenced, not duplicated ──
  hat:       require('./hat.js'),
  component: require('./component.js'),
  node:      require('./node.js'),

  // ── Grounded from real construction sites ────────────────────────────────
  contract:     require('./contract.js'),
  agent:        require('./agent.js'),
  model:        require('./model.js'),
  schema:       require('./schema.js'),
  crystal:      require('./crystal.js'),
  pat:          require('./pat.js'),
  gap:          require('./gap.js'),
  ledger:       require('./ledger.js'),
  tool:         require('./tool.js'),
  command:      require('./command.js'),
  cos:          require('./cos.js'),
  macro:        require('./macro.js'),
  failure_mode: require('./failure_mode.js'),
};

module.exports = { SCHEMAS };
