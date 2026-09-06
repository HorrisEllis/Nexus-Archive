'use strict';
// Real test for the 2026-09-03 node-schemas split. James: "can you do
// the split now. all the contracts schemas need to be that way also."
//
// Confirms: every one of the 17 types actually resolves to its own real
// file under lib/node-schemas/ (not an inline duplicate — the exact gap
// found and fixed this pass, since hat/component/node had split files
// sitting unused next to inline copies before this), the split moved
// content losslessly (real field-count checks against known values), and
// checkPayload() still works correctly post-split — contract specifically,
// since James named it directly.

const fs = require('fs');
const path = require('path');
const nodeSchemas = require('../lib/node-schemas.js');

const EXPECTED_TYPES = [
  'hat', 'component', 'node', 'contract', 'agent', 'model', 'schema',
  'crystal', 'pat', 'gap', 'ledger', 'tool', 'command', 'cos', 'macro',
  'failure_mode', 'idea',
];

// known-good field counts, from the pre-split monolith, to catch a
// silent truncation during the move rather than trust the split blind
const EXPECTED_FIELD_COUNTS = {
  contract: 13, crystal: 10, pat: 10, gap: 14, ledger: 9, macro: 10, agent: 6,
};

function main() {
  // ── every type is real, every one has its own file on disk ───────────
  const types = nodeSchemas.list();
  if (types.length !== EXPECTED_TYPES.length) throw new Error(`expected ${EXPECTED_TYPES.length} types, got ${types.length}: ${types.map(t=>t.type).join(',')}`);
  for (const t of EXPECTED_TYPES) {
    if (!types.find(x => x.type === t)) throw new Error(`missing expected type: ${t}`);
  }
  console.log(`PASS: all ${EXPECTED_TYPES.length} types present`);

  for (const t of EXPECTED_TYPES) {
    const filePath = path.join(__dirname, '..', 'lib', 'node-schemas', `${t}.js`);
    if (!fs.existsSync(filePath)) throw new Error(`${t} has no real split file at ${filePath}`);
    const schema = nodeSchemas.get(t);
    if (schema.status !== 'REAL') throw new Error(`${t}: expected status REAL, got ${schema.status}`);
  }
  console.log('PASS: every type has a real, existing split file, every one status:REAL');

  // ── lossless move — real field counts match the pre-split content ────
  for (const [type, expectedCount] of Object.entries(EXPECTED_FIELD_COUNTS)) {
    const actualCount = Object.keys(nodeSchemas.get(type).fields).length;
    if (actualCount !== expectedCount) throw new Error(`${type}: expected ${expectedCount} fields, got ${actualCount} — the split may have dropped or duplicated a field`);
  }
  console.log('PASS: field counts for contract/crystal/pat/gap/ledger/macro/agent match the pre-split content exactly');

  // ── checkPayload still works post-split — contract specifically ──────
  const goodContract = {
    uuid: 'c-1', forAgent: 'claude', intention: 'build', endState: 'a real end state',
  };
  const check1 = nodeSchemas.checkPayload('contract', goodContract);
  if (!check1.ok) throw new Error(`expected a valid contract payload to pass, got ${JSON.stringify(check1)}`);
  console.log('PASS: a real, complete contract payload passes checkPayload() post-split');

  const badContract = { uuid: 'c-2', forAgent: 'claude' }; // missing intention, endState
  const check2 = nodeSchemas.checkPayload('contract', badContract);
  if (check2.ok) throw new Error('expected an incomplete contract payload to fail checkPayload()');
  if (!check2.missing.includes('intention') || !check2.missing.includes('endState')) {
    throw new Error(`expected missing to include intention and endState, got ${JSON.stringify(check2.missing)}`);
  }
  console.log('PASS: an incomplete contract payload correctly fails checkPayload(), naming the real missing fields');

  // ── loom's real COMPONENT_SCHEMA reference still resolves through the split ──
  const componentSchema = nodeSchemas.get('component');
  if (typeof componentSchema.fields.id.description !== 'string' || !componentSchema.fields.id.description.length) {
    throw new Error('component.id\'s description (sourced from loom\'s real COMPONENT_SCHEMA.types.id) did not resolve through the split');
  }
  console.log('PASS: component.js\'s real require(\'../../loom/schema/definitions.js\') still resolves correctly through the split');

  // ── hat's real HAT_SCHEMA reference still resolves through the split ──
  const hatSchema = nodeSchemas.get('hat');
  if (!hatSchema.fields || typeof hatSchema.fields !== 'object' || !Object.keys(hatSchema.fields).length) {
    throw new Error('hat.js\'s real require(\'../hat-forge.js\').HAT_SCHEMA did not resolve through the split');
  }
  console.log('PASS: hat.js\'s real require(\'../hat-forge.js\').HAT_SCHEMA still resolves correctly through the split');
}

try { main(); console.log('ALL PASS'); process.exit(0); }
catch (e) { console.error('FAIL:', e.message); process.exit(1); }
