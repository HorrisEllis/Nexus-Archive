'use strict';
/**
 * tests/modules/component-descriptor.test.js
 * UUID: test-component-descriptor-v1-0000-4000-0000-000000000001
 *
 * Covers: descriptor schema validation (required fields, blueprint UUID
 * namespace format, componentId format, capability shape), and — the part
 * that actually matters for Phase 40.5 — that projectToComponentRegistry()
 * produces output the REAL, live component-registry.validate() accepts,
 * not a hand-rolled assertion that assumes the shapes match.
 */
const assert = require('assert');
const descriptor = require('../../lib/component-descriptor');
const componentRegistry = require('../../lib/component-registry');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

function validDescriptor(overrides = {}) {
  return {
    uuid:        'bp_001.comp.test-widget',
    componentId: 'test.widget',
    type:        'tool',
    tier:        'registry',
    capabilities: [
      { verb: 'list', noun: 'widgets', params: [{ name: 'limit', type: 'number' }] },
    ],
    ...overrides,
  };
}

async function run() {
  await test('CD-01', 'valid descriptor passes', () => {
    const r = descriptor.validateDescriptor(validDescriptor());
    assert.strictEqual(r.ok, true, r.errors.join('; '));
  });

  await test('CD-02', 'missing required field fails with a specific message', () => {
    const d = validDescriptor(); delete d.tier;
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('tier')));
  });

  await test('CD-03', 'non-blueprint-namespaced uuid fails', () => {
    const r = descriptor.validateDescriptor(validDescriptor({ uuid: 'not-a-blueprint-uuid' }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('blueprint-namespaced')));
  });

  await test('CD-04', 'bad componentId format fails', () => {
    const r = descriptor.validateDescriptor(validDescriptor({ componentId: 'NotLowercase' }));
    assert.strictEqual(r.ok, false);
  });

  await test('CD-05', 'unknown type fails', () => {
    const r = descriptor.validateDescriptor(validDescriptor({ type: 'not-a-real-type' }));
    assert.strictEqual(r.ok, false);
  });

  await test('CD-06', 'empty capabilities array fails, does not silently pass', () => {
    const r = descriptor.validateDescriptor(validDescriptor({ capabilities: [] }));
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('capabilities')));
  });

  await test('CD-07', 'capability missing verb fails with index in the message', () => {
    const d = validDescriptor({ capabilities: [{ noun: 'widgets' }] });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('capabilities[0].verb')));
  });

  await test('CD-08', 'invalid resolution.max_level fails', () => {
    const r = descriptor.validateDescriptor(validDescriptor({ resolution: { max_level: 'L9' } }));
    assert.strictEqual(r.ok, false);
  });

  await test('CD-09', 'projectToComponentRegistry refuses an invalid descriptor, returns no projected entries', () => {
    const r = descriptor.projectToComponentRegistry(validDescriptor({ type: 'bogus' }));
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.projected.length, 0);
  });

  await test('CD-10', 'projectToComponentRegistry output is ACTUALLY accepted by the real component-registry.validate() — not assumed', () => {
    const r = descriptor.projectToComponentRegistry(validDescriptor());
    assert.strictEqual(r.ok, true, r.errors.join('; '));
    assert.strictEqual(r.projected.length, 1);
    const real = componentRegistry.validate(r.projected[0]);
    assert.strictEqual(real.ok, true, `real registry rejected projected output: ${real.errors.join('; ')}`);
  });

  await test('CD-11', 'multi-capability descriptor projects to N entries, each individually registry-valid', () => {
    const d = validDescriptor({
      capabilities: [
        { verb: 'list',   noun: 'widgets' },
        { verb: 'create', noun: 'widget', params: [{ name: 'name', type: 'string' }] },
      ],
    });
    const r = descriptor.projectToComponentRegistry(d);
    assert.strictEqual(r.ok, true, r.errors.join('; '));
    assert.strictEqual(r.projected.length, 2);
    for (const entry of r.projected) {
      const real = componentRegistry.validate(entry);
      assert.strictEqual(real.ok, true, `entry "${entry.id}" rejected: ${real.errors.join('; ')}`);
    }
    // Distinct ids per capability when there's more than one — not collapsed
    assert.notStrictEqual(r.projected[0].id, r.projected[1].id);
  });

  await test('CD-12', 'projected entries carry the blueprint uuid for tracing back to the descriptor', () => {
    const r = descriptor.projectToComponentRegistry(validDescriptor());
    assert.strictEqual(r.projected[0].comp_properties.blueprintUuid, 'bp_001.comp.test-widget');
    assert.strictEqual(r.projected[0].registeredBy, 'bp_001.comp.test-widget');
  });

  await test('CD-13', 'aliases flow into the grammar array alongside the verb+noun phrase', () => {
    const r = descriptor.projectToComponentRegistry(validDescriptor({ aliases: ['ls widgets', 'show widgets'] }));
    assert.ok(r.projected[0].grammar.includes('list widgets'));
    assert.ok(r.projected[0].grammar.includes('ls widgets'));
    assert.ok(r.projected[0].grammar.includes('show widgets'));
  });

  await test('CD-14', 'getSchema returns real values, not placeholders', () => {
    const s = descriptor.getSchema();
    assert.ok(s.requiredFields.includes('capabilities'));
    assert.ok(s.validTypes.includes('tool'));
  });

  console.log(`\n  component-descriptor: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run();
