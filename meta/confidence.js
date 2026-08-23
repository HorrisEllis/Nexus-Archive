'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// meta/confidence.js — RE-EXPORT SHIM. The implementation moved.
//
// §MIGRATION 2026-08-23 — now at intelligence/confidence.js.
// Its only consumer was intelligence/gap/hunter.js: a module INSIDE
// intelligence reaching OUT to meta, which inverts the direction every other
// faculty runs in. That inversion settled where it belongs.
//
// §5.14 the require path IS the contract. DEPRECATED:
//     require('meta/confidence') → require('intelligence/confidence')
// ─────────────────────────────────────────────────────────────────────────────
module.exports = require('../intelligence/confidence.js');
