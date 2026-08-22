"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// cortex/liminal-space — RE-EXPORT SHIM. The implementation moved.
//
// §MIGRATION 2026-08-22 — now at intelligence/liminal-space.
// FOUR live consumers, checked before the move (§8.4):
//   cortex/boot.js x2 · orchestrator/lib/request-handler.js · test
// §5.14 the require path IS the contract. §0.4 they migrate on their own
// schedule; nothing is forced today.
//
// DEPRECATED. Target: require("cortex/liminal-space")
//                  →  require("intelligence/liminal-space")
// Delete when the last consumer moves (§16.5); the reason is here so that
// deletion is a decision, not a discovery (§0.3).
// ─────────────────────────────────────────────────────────────────────────────
module.exports = require("../../intelligence/liminal-space");
