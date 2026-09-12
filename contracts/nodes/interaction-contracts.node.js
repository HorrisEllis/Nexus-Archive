'use strict';
/**
 * contracts/nodes/interaction-contracts.node.js — extracted from contracts/SYSTEM-CONTRACTS.js
 * Real node id: contracts.interaction-contracts.node
 * §EXTRACTED 2026-09-12 — cli/decompose.js --mode=registry, block INTERACTION_CONTRACTS.
 * Verbatim body — this extraction moves the const, it does not re-derive it,
 * so nothing about the taxonomy itself changed, only where it lives.
 */
module.exports = Object.freeze({

  // Bridge interaction contract
  // §RETIRED 2026-09-06 — bridge interaction contract removed.
  // Seam contracts (from seams/seam-contracts.js)
  SEAM: {
    CORTEX:   { name: 'CORTEX_CONTRACT',      between: ['forge', 'cortex-3748'] },
    GUARDIAN: { name: 'GUARDIAN_WSS_CONTRACT', between: ['userscript', 'guardian-7821'] },
    FORGE:    { name: 'FORGE_CONTRACT',        between: ['guardian', 'forge-4800'] },
    SPEC:     { name: 'SPEC_SEAM_CONTRACT',    between: ['spec-parser', 'seam-delivery'] },
    CLI_UI:   { name: 'CLI_UI_CONTRACT',       between: ['cli', 'cockpit-ui'], hotswap: true },
  },

  // Universal rules every contract must satisfy
  UNIVERSAL_RULES: [
    'Respond to GET /health within 3000ms',
    'Emit UDP pulse on :7777 every 10s',
    'Register with orchestrator on boot via POST :9000/api/register',
    'Write boot record to event_log on successful start',
    'Never call another system directly — always via Bridge or nexus-connect',
    'Every request carries X-Bridge-UUID if it crossed Bridge',
    'Every request carries X-Bridge-Source identifying the originating system',
    'Requests must be idempotent — retrying must not cause duplicate state',
    'All errors are loud and specific — §1.2',
    'No stubs in production — §1.3',
  ],
});
