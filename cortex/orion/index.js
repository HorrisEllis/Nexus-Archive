"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// cortex/orion — RE-EXPORT SHIM. The implementation moved.
//
// §MIGRATION 2026-08-22 — this faculty now lives at intelligence/orion.
// §5.14 the require path IS the contract, so the path stays and only the code
// moved. §0.4 consumers migrate on their own schedule.
//
// DEPRECATED. Target: require("cortex/orion") → require("intelligence/orion")
// Delete when the last consumer moves (§16.5); the reason is recorded here so
// that deletion is a decision, not a discovery (§0.3).
// ─────────────────────────────────────────────────────────────────────────────
module.exports = require("../../intelligence/orion");
