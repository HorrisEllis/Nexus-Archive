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
      {
        verb: 'list', noun: 'widgets', intent: 'let a caller enumerate existing widgets',
        params: [{ name: 'limit', type: 'number' }],
      },
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
        { verb: 'list',   noun: 'widgets', intent: 'enumerate widgets' },
        { verb: 'create', noun: 'widget',  intent: 'add a new widget', params: [{ name: 'name', type: 'string' }] },
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

  await test('CD-15', 'missing capability intent fails — required, not optional', () => {
    const d = validDescriptor({ capabilities: [{ verb: 'list', noun: 'widgets' }] });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('capabilities[0].intent')));
  });

  await test('CD-16', 'endpoint with unknown hook_type fails', () => {
    const d = validDescriptor({
      capabilities: [{
        verb: 'list', noun: 'widgets', intent: 'enumerate widgets',
        endpoints: [{ hook_type: 'carrier_pigeon', hook_id: 'ep1', intent: 'notify on change' }],
      }],
    });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('hook_type')));
  });

  await test('CD-17', 'valid endpoint (api hook_type) passes, and is NOT the same field as component-registry\'s lifecycle hooks[]', () => {
    const d = validDescriptor({
      capabilities: [{
        verb: 'list', noun: 'widgets', intent: 'enumerate widgets',
        endpoints: [{ hook_type: 'api', hook_id: 'widgets.list.endpoint', intent: 'HTTP surface for listing widgets' }],
      }],
    });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, true, r.errors.join('; '));
    // Confirm this lives under capability.endpoints, not capability.hooks —
    // the latter would collide with component-registry's lifecycle hooks
    assert.strictEqual(d.capabilities[0].hooks, undefined);
  });

  await test('CD-18', 'wire with missing from/to fails — a connection with no endpoints is not a connection', () => {
    const d = validDescriptor({
      capabilities: [{
        verb: 'sync', noun: 'widgets', intent: 'keep widget state consistent',
        wires: [{ wire_type: 'data_flow', wire_id: 'w1', intent: 'push updates downstream' }],
      }],
    });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, false);
    assert.ok(r.errors.some(e => e.includes('.from')));
    assert.ok(r.errors.some(e => e.includes('.to')));
  });

  await test('CD-19', 'valid wire (interaction_contract) passes', () => {
    const d = validDescriptor({
      capabilities: [{
        verb: 'sync', noun: 'widgets', intent: 'keep widget state consistent',
        wires: [{
          wire_type: 'interaction_contract', wire_id: 'w.widgets-to-cortex',
          intent: 'hand widget state changes to cortex for persistence',
          from: 'test.widget', to: 'cortex.memory',
        }],
      }],
    });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, true, r.errors.join('; '));
  });

  await test('CD-20', 'hook_type/hook_id and wire_type/wire_id survive projection into comp_properties', () => {
    const d = validDescriptor({
      capabilities: [{
        verb: 'list', noun: 'widgets', intent: 'enumerate widgets',
        endpoints: [{ hook_type: 'api', hook_id: 'ep.list', intent: 'HTTP listing surface' }],
        wires:     [{ wire_type: 'pipeline', wire_id: 'w.list-to-cache', intent: 'warm the cache after listing', from: 'test.widget', to: 'cache.layer' }],
      }],
    });
    const r = descriptor.projectToComponentRegistry(d);
    assert.strictEqual(r.ok, true, r.errors.join('; '));
    const props = r.projected[0].comp_properties;
    assert.strictEqual(props.endpoints[0].hook_id, 'ep.list');
    assert.strictEqual(props.wires[0].wire_id, 'w.list-to-cache');
    assert.strictEqual(props.intent, 'enumerate widgets');
    // and the projected entry still passes the REAL registry validator
    // with these extra fields present — extending comp_properties didn't
    // break the contract that already worked
    const real = componentRegistry.validate(r.projected[0]);
    assert.strictEqual(real.ok, true, real.errors.join('; '));
  });

  await test('CD-21', 'toCompartmentIntent() produces a shape compartment-engine.spawn() actually accepts — not just plausible-looking', async () => {
    const compartmentEngine = require('../../lib/compartment-engine');
    const d = validDescriptor({
      capabilities: [{ verb: 'list', noun: 'widgets', intent: 'enumerate widgets' }],
    });
    const intent = descriptor.toCompartmentIntent(d, 0);
    assert.ok(intent.uuid, 'toCompartmentIntent must produce a uuid — spawn() throws without one');
    assert.strictEqual(intent.verb, 'list');
    assert.strictEqual(intent.domain, 'widgets');
    // The real assertion: spawn() itself, not an assumption about its shape.
    // spawn() only throws on missing intent.uuid before touching anything
    // stateful (JAA/snapshot) — that's the exact line being proven here.
    let threw = null;
    try { await compartmentEngine.spawn({ intent }); }
    catch (e) { threw = e; }
    assert.ok(
      threw === null || !threw.message.includes('requires a frozen intent with a uuid'),
      `spawn() rejected the bridged intent shape: ${threw && threw.message}`
    );
  });

  await test('CD-22', 'descriptorFromSections converts idearium\'s real fixed section list into a valid descriptor', () => {
    const SECTION_IDS = ['intent','api_callto','module_hooks','cli_spec','schemas','gap_contract','failure_modes','tests','phase_map'];
    const sections = SECTION_IDS.map(id => ({ id, title: id, complete: false, required: true, content: '', checklist: [] }));
    const d = descriptor.descriptorFromSections(sections, { uuid: 'bp_001.comp.test-idea-spec', componentId: 'idearium.test_idea_spec' });
    const r = descriptor.validateDescriptor(d);
    assert.strictEqual(r.ok, true, r.errors.join('; '));
    assert.strictEqual(d.capabilities.length, 9);
    assert.ok(d.capabilities.every(c => c.intent && c.intent.length > 0), 'every section-derived capability must have a real intent, not blank');
  });

  await test('CD-23', 'descriptorFromSections refuses an empty sections array rather than silently producing nothing', () => {
    let threw = null;
    try { descriptor.descriptorFromSections([], { uuid: 'bp_001.comp.x', componentId: 'x.y' }); }
    catch (e) { threw = e; }
    assert.ok(threw);
  });

  console.log(`\n  component-descriptor: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run();
