'use strict';
// lib/node-schemas/hat.js — real schema for the .hat node type.
// UUID: nexus-node-schema-hat-v1-0000-2026-0903-001
//
// §SPLIT 2026-09-03 — James: "each schema is it's own file." Was one
// entry inside lib/node-schemas.js (single monolith, 17 types); split so
// each type is independently readable/editable/reviewable without
// touching the other 16. Content unchanged from the pre-split version —
// this is a pure move, not a rewrite (§10.3, §0.3 information not lost).

module.exports = {
  status: 'REAL',
  source: 'lib/hat-forge.js — HAT_SCHEMA (own real schema, this session added exportHat()/importHat())',
  fields: require('../hat-forge.js').HAT_SCHEMA, // {field: 'description'} shape — hat-forge's own convention, kept as-is
};
