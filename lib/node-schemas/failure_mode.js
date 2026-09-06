'use strict';
// lib/node-schemas/failure_mode.js — real schema for the .failure_mode
// node type.
// UUID: nexus-node-schema-failure-mode-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.
// Content unchanged from the pre-split version — a pure move.

module.exports = {
  status: 'REAL',
  source: 'lib/ico.js — logFailure()\'s real failure-mode ledger record. James: "data folders: .failure_mode" pointed here — every system\'s data/<system>/failures/ dir (confirmed real: data/guardian/failures, data/cortex/*, data/idearium/failures, etc., one per ICO kernel instance) is this exact shape, appended as ndjson',
  fields: {
    error:    { type: 'string', required: true,  description: 'real error description — logFailure()\'s only truly required field' },
    solution: { type: 'any',    required: false, description: 'real fix/workaround, null until one is known' },
    friction: { type: 'number', required: false, description: 'real friction score, defaults to 0' },
    source:   { type: 'string', required: false, description: 'real originating system, null if not given' },
    ts:       { type: 'number', required: true,  description: 'real timestamp, defaults to Date.now()' },
  },
};
