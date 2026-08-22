'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// meta/liminal/index — RE-EXPORT SHIM. The implementation moved.
//
// §MIGRATION 2026-08-22 — meta/* now lives at intelligence/meta/*.
//
// WHY A SHIM, NOT A HARD MOVE — 71 require() sites across 13 systems point at
// meta/*, and they name 40 DISTINCT paths, not 15 module roots: consumers reach
// straight into meta/gap/hunter.js and meta/rfr2/kernel/index.js. A flat shim
// per module looked sufficient and was not — guardian/lib/gap-hunter.js and
// bridge/causal/projections.js both broke on the first attempt (§8.4: the
// consumer scan has to enumerate real paths, not module names).
//
// §5.14 — an implementation may move provided the contract holds. Here the
// require path IS the contract, so the path stays and only the code moved.
// §0.4 — consumers migrate on their own schedule; nothing is forced today.
//
// DEPRECATED. Migration target:
//     require('meta/liminal/index')  →  require('intelligence/meta/liminal/index')
// When the last consumer moves, delete meta/ (§16.5). The reason is recorded
// here so that deletion is a decision, not a discovery (§0.3).
// ─────────────────────────────────────────────────────────────────────────────

module.exports = require('../../intelligence/meta/liminal/index');
