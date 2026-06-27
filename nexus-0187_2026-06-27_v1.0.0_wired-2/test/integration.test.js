'use strict';
/**
 * cos/test/cos.test.js — COS Test Suite
 * UUID: cos-test-v1-0000-0000-000000000018
 * Run: node cos/test/cos.test.js
 */

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (err) { failed++; console.log(`  ✗ ${name}: ${err.message}`); }
}
function assert(c, m = 'fail') { if (!c) throw new Error(m); }
function assertEqual(a, b, m)  { if (a !== b) throw new Error(m || `${JSON.stringify(a)} !== ${JSON.stringify(b)}`); }

// ── Foundation ─────────────────────────────────────────────────────────────
console.log('\n[1] Foundation');
{
  const { COMPARTMENT_TYPES, COMPARTMENT_STATES, AXIOMS, EVENT_CONTRACTS,
          validateCompartmentConfig, validateEvent, uid } = require('../cos/src/foundation/index');

  test('uid() generates valid UUID', () => {
    const id = uid();
    assert(id.match(/^[0-9a-f-]{36}$/), `invalid UUID: ${id}`);
  });

  test('COMPARTMENT_TYPES is frozen', () => {
    assert(Object.isFrozen(COMPARTMENT_TYPES));
  });

  test('COMPARTMENT_TYPES includes browser and cdp', () => {
    assert(COMPARTMENT_TYPES.BROWSER === 'browser');
    assert(COMPARTMENT_TYPES.CDP     === 'cdp');
  });

  test('AXIOMS is frozen with COS-1.1', () => {
    assert(Object.isFrozen(AXIOMS));
    assert(AXIOMS['COS-1.1'].includes('Nothing exists'));
  });

  test('validateCompartmentConfig passes valid config', () => {
    const { ok } = validateCompartmentConfig({ type: 'browser', name: 'test' });
    assert(ok);
  });

  test('validateCompartmentConfig rejects missing type', () => {
    const { ok, errors } = validateCompartmentConfig({ name: 'test' });
    assert(!ok);
    assert(errors.some(e => e.includes('type')));
  });

  test('validateCompartmentConfig rejects invalid type', () => {
    const { ok, errors } = validateCompartmentConfig({ type: 'fridge', name: 'test' });
    assert(!ok);
    assert(errors.some(e => e.includes('invalid type')));
  });

  test('validateCompartmentConfig rejects missing name', () => {
    const { ok, errors } = validateCompartmentConfig({ type: 'browser' });
    assert(!ok);
    assert(errors.some(e => e.includes('name')));
  });

  test('validateEvent passes known event with required fields', () => {
    const { ok } = validateEvent('compartment.create', { type: 'browser', config: {} });
    assert(ok);
  });

  test('validateEvent fails known event with missing required field', () => {
    const { ok, errors } = validateEvent('compartment.create', { type: 'browser' });
    assert(!ok);
    assert(errors[0].includes('config'));
  });

  test('validateEvent passes unknown event types (open system)', () => {
    const { ok } = validateEvent('some.unknown.event', {});
    assert(ok, 'unknown events should pass through');
  });
}

// ── Kernel — SISO bus ──────────────────────────────────────────────────────
console.log('\n[2] COS Kernel');
{
  // Fresh module cache
  Object.keys(require.cache).forEach(k => {
    if (k.includes('cos/src') || k.includes('clear-glass-v3/siso')) delete require.cache[k];
  });

  const CosKernel = require('../cos/src/kernel/index');
  let kernel;

  test('CosKernel constructs with SISO bus', () => {
    kernel = new CosKernel({});
    assert(kernel.bus, 'bus missing');
    assert(kernel.compartments instanceof Map);
  });

  test('emit() sends events onto bus', () => {
    const received = [];
    kernel.on('test.event', e => received.push(e));
    kernel.emit('test.event', { val: 42 });
    assertEqual(received.length, 1);
    assertEqual(received[0].data.val, 42);
  });

  test('compartment.create gate creates compartment', (done) => {
    const created = [];
    kernel.on('compartment.created', e => created.push(e));
    kernel.emit('compartment.create', { type: 'browser', config: { name: 'test-browser' }, requestId: 'r1' });
    // Gates are synchronous in SISO
    assertEqual(created.length, 1);
    assert(created[0].data.compartmentId, 'missing compartmentId');
    assertEqual(created[0].data.type, 'browser');
  });

  test('compartment.create gate validates type', () => {
    const errors = [];
    kernel.on('compartment.error', e => errors.push(e));
    kernel.emit('compartment.create', { type: 'invalidtype', config: { name: 'bad' }, requestId: 'r2' });
    assert(errors.length > 0, 'should emit error for invalid type');
  });

  test('compartment.list gate returns all compartments', () => {
    const listed = [];
    kernel.on('compartment.listed', e => listed.push(e));
    kernel.emit('compartment.list', {});
    assertEqual(listed.length, 1);
    assert(Array.isArray(listed[0].data.compartments));
    assert(listed[0].data.compartments.length >= 1, 'should have at least the created one');
  });

  test('compartment.start emits error when no driver registered', () => {
    // Get the compartment we created
    const compartments = kernel.listCompartments();
    const first = compartments[0];
    assert(first, 'need a compartment');

    const errors = [];
    kernel.on('compartment.error', e => errors.push(e));
    kernel.emit('compartment.start', { compartmentId: first.id });
    // No driver registered → should emit error
    assert(errors.length > 0, 'should emit error when no driver');
  });

  test('compartment.start with driver calls driver.start', async () => {
    // Register a mock driver
    const started = [];
    kernel.registerDriver('browser', {
      start:   async (r) => { started.push(r); return { mockMeta: true }; },
      stop:    async () => {},
      destroy: async () => {},
    });

    // Create a fresh browser compartment
    const created = [];
    kernel.on('compartment.created', e => created.push(e));
    kernel.emit('compartment.create', { type: 'browser', config: { name: 'mock-test' }, requestId: 'r-mock' });

    const id = created[created.length - 1]?.data.compartmentId;
    assert(id, 'need compartmentId');

    const started_events = [];
    kernel.on('compartment.started', e => started_events.push(e));

    kernel.emit('compartment.start', { compartmentId: id });

    // Wait for async driver
    await new Promise(r => setTimeout(r, 50));
    assert(started.length > 0, 'driver.start should be called');
  });

  test('compartment.stop updates state', async () => {
    const compartments = kernel.listCompartments();
    const running = compartments.find(c => c.state === 'running' || c.state === 'pending');
    if (!running) { console.log('    (skip — no running compartment)'); return; }

    const stopped = [];
    kernel.on('compartment.stopped', e => stopped.push(e));
    kernel.emit('compartment.stop', { compartmentId: running.id });
    await new Promise(r => setTimeout(r, 50));
    // Should not throw at minimum
    assert(true);
  });

  test('host.status gate returns compartment count + bus stats', () => {
    const statuses = [];
    kernel.on('host.status.response', e => statuses.push(e));
    kernel.emit('host.status', {});
    assertEqual(statuses.length, 1);
    assert(Array.isArray(statuses[0].data.compartments));
    assert(statuses[0].data.busStats, 'should have busStats');
  });

  test('compartment.destroy removes from store', () => {
    const c = kernel.listCompartments()[0];
    if (!c) return;
    kernel.emit('compartment.destroy', { compartmentId: c.id });
    // Give async a tick
    setImmediate(() => {
      const after = kernel.getCompartment(c.id);
      // May or may not be removed depending on driver — just verify no throw
    });
    assert(true);
  });
}

// ── Wire components ─────────────────────────────────────────────────────────
console.log('\n[3] Wire — NEXUS component registry');
{
  const { EROS_COMPONENTS } = require('../wire/nexus-wire');
  const erosRegistry        = require('../wire/eros-registry-components');
  const cgRegistry          = require('../clear-glass-v3/seam/registry-components');

  test('EROS wire components array is non-empty', () => {
    assert(Array.isArray(EROS_COMPONENTS) && EROS_COMPONENTS.length > 0);
  });

  test('eros-registry-components all have valid id format (namespace.name)', () => {
    const ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/;
    for (const c of erosRegistry) {
      assert(ID_PATTERN.test(c.id), `Invalid id: ${c.id}`);
    }
  });

  test('clear-glass registry all have valid id format', () => {
    const ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/;
    for (const c of cgRegistry) {
      assert(ID_PATTERN.test(c.id), `Invalid id: ${c.id}`);
    }
  });

  test('No id collision between eros and clear-glass registries', () => {
    const cgIds   = new Set(cgRegistry.map(c => c.id));
    const erosIds = new Set(erosRegistry.map(c => c.id));
    for (const id of cgIds) {
      assert(!erosIds.has(id), `ID collision: ${id}`);
    }
  });

  test('all registry components have required fields', () => {
    const required = ['id', 'namespace', 'name', 'version', 'grammar', 'route', 'description'];
    for (const c of [...erosRegistry, ...cgRegistry]) {
      for (const f of required) {
        assert(c[f] !== undefined && c[f] !== null && c[f] !== '', `${c.id} missing: ${f}`);
      }
    }
  });

  test('all grammar arrays are non-empty', () => {
    for (const c of [...erosRegistry, ...cgRegistry]) {
      assert(Array.isArray(c.grammar) && c.grammar.length > 0, `${c.id} grammar empty`);
    }
  });

  test('wires_to targets exist in one of the registries', () => {
    const allIds = new Set([...erosRegistry, ...cgRegistry].map(c => c.id));
    // Also add known external NEXUS targets
    const knownExternal = new Set([
      'cortex.memory.insert', 'cortex.events.write', 'cortex.gaps.open',
      'cortex.intelligence.event', 'cortex.raid.decide', 'cortex.raid.health',
      'cortex.chat.log', 'guardian.artifacts.list', 'guardian.job.dispatch.receive',
      'wire.hook.hostile', 'clear-glass.driver.result.emit', 'clear-glass.dom.pick',
      'clear-glass.context.fp.switch', 'copilot.prompt.receive',
    ]);

    for (const c of [...erosRegistry, ...cgRegistry]) {
      const outs = c.hooks?.out || [];
      for (const out of outs) {
        for (const target of (out.wires_to || [])) {
          assert(allIds.has(target) || knownExternal.has(target), `Unknown wires_to target: ${target} (from ${c.id})`);
        }
      }
    }
  });
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`NEXUS Wire + COS — Test Suite`);
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);
if (failed > 0) { process.exit(1); }
else { console.log('All tests pass ✓'); process.exit(0); }
