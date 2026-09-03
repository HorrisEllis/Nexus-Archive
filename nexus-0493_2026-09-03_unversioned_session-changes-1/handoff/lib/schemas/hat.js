'use strict';
/**
 * lib/schemas/hat.js — split out of lib/node-schemas.js (2026-09-03) per
 * James: "separate the schemas" — one file per named type, node-schemas.js
 * kept as the thin get()/list()/checkPayload() aggregator over these.
 * Content unchanged from the original SCHEMAS.hat entry.
 */
const HAT_SCHEMA = require('../hat-forge.js').HAT_SCHEMA;

module.exports = {
  status: 'REAL',
  source: 'lib/hat-forge.js — HAT_SCHEMA (own real schema, this session added exportHat()/importHat())',
  fields: HAT_SCHEMA, // {field: 'description'} shape — hat-forge's own convention, kept as-is
};
