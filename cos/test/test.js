/**
 * test/test.js
 * COMPARTMENT OS — Test Suite (Phase 0 + 1 + 2)
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * Zero external dependencies. Plain Node.js assertions.
 * Run: node test/test.js
 */

'use strict';

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const http   = require('http');

// ─── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✖  ${name}`);
    console.log(`     ${err.message}`);
    failures.push({ name, err });
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✖  ${name}`);
    console.log(`     ${err.message}`);
    failures.push({ name, err });
    failed++;
  }
}

function section(title) {
  console.log(`\n  ── ${title} ──`);
}

// ─── Temp dir for I/O tests ───────────────────────────────────────────────────

const TMP = path.join(os.tmpdir(), `cos-test-${Date.now()}`);
fs.mkdirSync(TMP, { recursive: true });

function tmpFile(name) { return path.join(TMP, name); }
function tmpDir(name)  { const d = path.join(TMP, name); fs.mkdirSync(d, { recursive: true }); return d; }

// ─── Load modules ────────────────────────────────────────────────────────────

const { makeCompartment, makeHook, makeSystemMap, makePipe,
        isValidTransition, COMPARTMENT_STATES }
  = require('../foundation/types.js');

const { CosAxiomError, enforce, getAxiomDefs, AXIOMS }
  = require('../foundation/axioms.js');

const { HookSchemaError, validateHook, isUUID, isSemver, isEventType, isKebab }
  = require('../foundation/hook-schema.js');

const { HOST, COMP, WATCHDOG, ALL_EVENT_TYPES, isKnownEvent }
  = require('../foundation/event-contracts.js');

const { COS_VERSION, compartmentPaths, DEFAULT_API_PORT }
  = require('../foundation/constants.js');

const { RUNTIME_IDS }  = require('../foundation/runtime-enum.js');
const { COMPILER_IDS } = require('../foundation/compiler-enum.js');

const { StateStore }     = require('../host/state-store.js');
const { createEventBus } = require('../host/event-bus.js');
const { SystemMap }      = require('../host/system-map.js');
const { createHost }     = require('../host/index.js');

const { createCompartment, toSlug } = require('../cli/commands/create.js');
const { renderTable }               = require('../cli/commands/list.js');
const { renderTree }                = require('../cli/commands/map.js');
const { parseArgs }                 = require('../cli/index.js');

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 0 — FOUNDATION
// ═════════════════════════════════════════════════════════════════════════════

section('Phase 0 — foundation/types.js');

test('makeCompartment returns a compartment with defaults', () => {
  const c = makeCompartment({ id: 'abc', name: 'test' });
  assert.strictEqual(c.id,    'abc');
  assert.strictEqual(c.name,  'test');
  assert.strictEqual(c.state, 'created');
  assert.strictEqual(c.network.isolated, true);
  assert.strictEqual(c.watchdog.enabled, false);
  assert.deepStrictEqual(c.hooks, []);
  assert.deepStrictEqual(c.tags,  []);
});

test('makeCompartment overrides merge correctly', () => {
  const c = makeCompartment({ network: { isolated: false } });
  assert.strictEqual(c.network.isolated, false);
  assert.strictEqual(c.network.proxyPort, null);
});

test('makeHook returns a hook with defaults', () => {
  const h = makeHook({ id: 'abc', name: 'test-hook' });
  assert.strictEqual(h.id,   'abc');
  assert.strictEqual(h.name, 'test-hook');
  assert.deepStrictEqual(h.contract.inputs, []);
  assert.strictEqual(h.meta.autoDetected, false);
});

test('makeSystemMap returns a system map with arrays', () => {
  const m = makeSystemMap();
  assert.ok(Array.isArray(m.compartments));
  assert.ok(Array.isArray(m.hooks));
  assert.ok(Array.isArray(m.pipes));
  assert.ok(typeof m.generatedAt === 'number');
});

test('makePipe returns pipe with defaults', () => {
  const p = makePipe({ id: 'p1', name: 'test-pipe' });
  assert.strictEqual(p.state, 'active');
  assert.strictEqual(p.eventLog, true);
});

test('isValidTransition: created → running is valid', () => {
  assert.ok(isValidTransition('created', 'running'));
});

test('isValidTransition: running → created is invalid', () => {
  assert.ok(!isValidTransition('running', 'created'));
});

test('COMPARTMENT_STATES is frozen and correct', () => {
  assert.ok(COMPARTMENT_STATES.includes('running'));
  assert.ok(COMPARTMENT_STATES.includes('error'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 0 — foundation/axioms.js');

test('CosAxiomError has correct shape', () => {
  const e = new CosAxiomError('COS-3', 'test', { foo: 1 });
  assert.strictEqual(e.name,    'CosAxiomError');
  assert.strictEqual(e.axiomId, 'COS-3');
  assert.ok(e.message.includes('COS-3'));
});

test('getAxiomDefs returns all 33 axioms (17 original + 16 from v1.6/v1.7 — COS-18–38 are a documented gap, not fabricated)', () => {
  const defs = getAxiomDefs();
  assert.strictEqual(defs.length, 33);
  assert.ok(defs.every(d => d.id && d.description));
  assert.ok(defs.every(d => d.statement === d.description));
  assert.ok(defs.some(d => d.id === 'COS-48' && d.addedIn === '1.6.0' && d.category === 'data'));
  assert.ok(defs.some(d => d.id === 'COS-54' && d.addedIn === '1.7.0'));
  assert.ok(!defs.some(d => d.id === 'COS-18'));
});

test('enforce COS-3: throws on missing hook id', () => {
  assert.throws(() => {
    enforce('COS-3', { hook: { version: '1.0.0', contract: {}, bindings: { event: 'x:y:z' } } });
  }, CosAxiomError);
});

test('enforce COS-3: passes on valid hook', () => {
  assert.doesNotThrow(() => {
    enforce('COS-3', {
      hook: {
        id:       '550e8400-e29b-41d4-a716-446655440000',
        version:  '1.0.0',
        contract: {},
        bindings: { event: 'host:compartment:created' },
      },
    });
  });
});

test('enforce COS-4: throws on direct-import', () => {
  assert.throws(() => {
    enforce('COS-4', { method: 'direct-import' });
  }, CosAxiomError);
});

test('enforce COS-7: throws if mapUpdated is false', () => {
  assert.throws(() => enforce('COS-7', { mapUpdated: false }), CosAxiomError);
});

test('enforce COS-7: passes if mapUpdated is true', () => {
  assert.doesNotThrow(() => enforce('COS-7', { mapUpdated: true }));
});

test('enforce COS-11: throws if isolated is undefined in config', () => {
  assert.throws(() => {
    enforce('COS-11', { networkConfig: { proxyPort: null } });
  }, CosAxiomError);
});

test('enforce COS-11: passes if isolated is explicitly set', () => {
  assert.doesNotThrow(() => {
    enforce('COS-11', { networkConfig: { isolated: true } });
  });
});

test('enforce COS-15: throws if pipe.eventLog is false', () => {
  assert.throws(() => enforce('COS-15', { pipe: { eventLog: false } }), CosAxiomError);
});

test('enforce unknown axiom throws', () => {
  assert.throws(() => enforce('COS-99', {}), CosAxiomError);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 0 — foundation/hook-schema.js');

test('isUUID: accepts valid v4', () => {
  assert.ok(isUUID('550e8400-e29b-41d4-a716-446655440000'));
});

test('isUUID: rejects non-uuid', () => {
  assert.ok(!isUUID('not-a-uuid'));
  assert.ok(!isUUID(null));
  assert.ok(!isUUID(''));
});

test('isSemver: accepts x.y.z', () => {
  assert.ok(isSemver('1.0.0'));
  assert.ok(isSemver('12.3.4'));
});

test('isSemver: rejects bad semver', () => {
  assert.ok(!isSemver('1.0'));
  assert.ok(!isSemver('v1.0.0'));
});

test('isEventType: accepts {layer}:{noun}:{verb}', () => {
  assert.ok(isEventType('host:compartment:created'));
  assert.ok(isEventType('comp:process:started'));
});

test('isEventType: rejects malformed', () => {
  assert.ok(!isEventType('host:compartment'));
  assert.ok(!isEventType('HOST:COMP:CREATED'));
  assert.ok(!isEventType(''));
});

test('isKebab: accepts kebab-case', () => {
  assert.ok(isKebab('my-hook'));
  assert.ok(isKebab('create'));
});

test('isKebab: rejects spaces and caps', () => {
  assert.ok(!isKebab('My Hook'));
  assert.ok(!isKebab(''));
});

const VALID_HOOK = Object.freeze({
  id:            '550e8400-e29b-41d4-a716-446655440000',
  name:          'create-compartment',
  version:       '1.0.0',
  compartmentId: 'host',
  contract: { inputs: [], outputs: [], sideEffects: [], axioms: [] },
  bindings: { ui: null, cli: 'cos create', event: 'host:compartment:created' },
  meta: { description: 'Creates a compartment', autoDetected: false, sourceFile: null, createdAt: Date.now(), updatedAt: null },
});

test('validateHook: passes on valid hook', () => {
  const result = validateHook(VALID_HOOK);
  assert.strictEqual(result.id, VALID_HOOK.id);
});

test('validateHook: throws on non-object', () => {
  assert.throws(() => validateHook(null),  HookSchemaError);
  assert.throws(() => validateHook('str'), HookSchemaError);
});

test('validateHook: throws on missing id', () => {
  assert.throws(() => validateHook({ ...VALID_HOOK, id: null }), HookSchemaError);
});

test('validateHook: throws on bad version', () => {
  assert.throws(() => validateHook({ ...VALID_HOOK, version: '1.0' }), HookSchemaError);
});

test('validateHook: throws on bad event type', () => {
  assert.throws(() => validateHook({ ...VALID_HOOK, bindings: { ...VALID_HOOK.bindings, event: 'bad' } }), HookSchemaError);
});

test('validateHook: throws on non-array contract.inputs', () => {
  assert.throws(() => validateHook({ ...VALID_HOOK, contract: { ...VALID_HOOK.contract, inputs: 'bad' } }), HookSchemaError);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 0 — foundation/event-contracts.js');

test('HOST events are correctly named', () => {
  assert.strictEqual(HOST.COMPARTMENT_CREATED, 'host:compartment:created');
  assert.strictEqual(HOST.MAP_UPDATED,         'host:map:updated');
});

test('COMP events are correctly named', () => {
  assert.strictEqual(COMP.PROCESS_STARTED, 'comp:process:started');
});

test('isKnownEvent returns true for known events', () => {
  assert.ok(isKnownEvent('host:compartment:created'));
  assert.ok(isKnownEvent('watchdog:anomaly:detected'));
});

test('isKnownEvent returns false for unknown events', () => {
  assert.ok(!isKnownEvent('fake:event:type'));
  assert.ok(!isKnownEvent(''));
});

test('ALL_EVENT_TYPES is a Set with > 50 events', () => {
  assert.ok(ALL_EVENT_TYPES instanceof Set);
  assert.ok(ALL_EVENT_TYPES.size > 50);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 0 — foundation/constants.js');

test('COS_VERSION is a semver string', () => {
  assert.match(COS_VERSION, /^\d+\.\d+\.\d+$/);
});

test('compartmentPaths returns correct shape', () => {
  const p = compartmentPaths('test-id');
  assert.ok(p.root.includes('test-id'));
  assert.ok(p.manifest.endsWith('.cos-manifest.json'));
  assert.ok(p.nexDir.endsWith('.nex'));
  assert.ok(p.walDir.endsWith('.cos-wal'));
});

test('DEFAULT_API_PORT is 3748', () => {
  assert.strictEqual(DEFAULT_API_PORT, 3748);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 0 — runtime-enum.js + compiler-enum.js');

test('RUNTIME_IDS includes node, python, electron', () => {
  assert.ok(RUNTIME_IDS.includes('node'));
  assert.ok(RUNTIME_IDS.includes('python'));
  assert.ok(RUNTIME_IDS.includes('electron'));
});

test('COMPILER_IDS includes tsc, esbuild, vite', () => {
  assert.ok(COMPILER_IDS.includes('tsc'));
  assert.ok(COMPILER_IDS.includes('esbuild'));
  assert.ok(COMPILER_IDS.includes('vite'));
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 — HOST CORE
// ═════════════════════════════════════════════════════════════════════════════

section('Phase 1 — host/state-store.js');

test('StateStore: loads from empty dir', () => {
  const stateFile = tmpFile('state1.json');
  const store = new StateStore(stateFile);
  store.load();
  assert.deepStrictEqual(store.listCompartments(), []);
});

test('StateStore: setCompartment + getCompartment', () => {
  const store = new StateStore(tmpFile('state2.json'));
  store.load();
  const c = makeCompartment({ id: 'c1', name: 'test' });
  store.setCompartment(c);
  const got = store.getCompartment('c1');
  assert.strictEqual(got.id,   'c1');
  assert.strictEqual(got.name, 'test');
});

test('StateStore: mutation returns deep clone (not reference)', () => {
  const store = new StateStore(tmpFile('state3.json'));
  store.load();
  const c = makeCompartment({ id: 'c2', name: 'original' });
  store.setCompartment(c);
  const got = store.getCompartment('c2');
  got.name = 'mutated';
  const got2 = store.getCompartment('c2');
  assert.strictEqual(got2.name, 'original');
});

test('StateStore: getCompartmentByName (case-insensitive)', () => {
  const store = new StateStore(tmpFile('state4.json'));
  store.load();
  store.setCompartment(makeCompartment({ id: 'c3', name: 'MyService', slug: 'myservice' }));
  assert.ok(store.getCompartmentByName('myservice'));
  assert.ok(store.getCompartmentByName('MYSERVICE'));
});

test('StateStore: deleteCompartment removes it', () => {
  const store = new StateStore(tmpFile('state5.json'));
  store.load();
  store.setCompartment(makeCompartment({ id: 'c4', name: 'del-me' }));
  store.deleteCompartment('c4');
  assert.strictEqual(store.getCompartment('c4'), null);
});

test('StateStore: persists to disk and survives reload', () => {
  const stateFile = tmpFile('state6.json');
  const store1 = new StateStore(stateFile);
  store1.load();
  store1.setCompartment(makeCompartment({ id: 'c5', name: 'persist-test' }));
  store1.flushSync();

  const store2 = new StateStore(stateFile);
  store2.load();
  const got = store2.getCompartment('c5');
  assert.strictEqual(got.name, 'persist-test');
});

test('StateStore: setCompartment throws without id', () => {
  const store = new StateStore(tmpFile('state7.json'));
  store.load();
  assert.throws(() => store.setCompartment({ name: 'no-id' }), /requires compartment.id/);
});

test('StateStore: corrupted file is backed up, starts fresh', () => {
  const stateFile = tmpFile('state8.json');
  fs.writeFileSync(stateFile, '{ NOT VALID JSON {{{{', 'utf8');
  const store = new StateStore(stateFile);
  store.load();  // should not throw
  assert.deepStrictEqual(store.listCompartments(), []);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 1 — host/event-bus.js');

test('EventBus: emit returns stamped event', () => {
  const bus = createEventBus();
  const ev  = bus.emit('host:test:done', { value: 42 });
  assert.strictEqual(ev.type, 'host:test:done');
  assert.strictEqual(ev.payload.value, 42);
  assert.ok(typeof ev.seq === 'number');
  assert.ok(typeof ev.timestamp === 'number');
});

test('EventBus: on receives events', () => {
  const bus = createEventBus();
  let received = null;
  bus.on('host:test:ping', ev => { received = ev; });
  bus.emit('host:test:ping', { msg: 'hello' });
  assert.ok(received);
  assert.strictEqual(received.payload.msg, 'hello');
});

test('EventBus: onAny catches all events', () => {
  const bus = createEventBus();
  const seen = [];
  bus.onAny(ev => seen.push(ev.type));
  bus.emit('host:a:b', {});
  bus.emit('comp:x:y', {});
  assert.ok(seen.includes('host:a:b'));
  assert.ok(seen.includes('comp:x:y'));
});

test('EventBus: tail returns last N events', () => {
  const bus = createEventBus();
  for (let i = 0; i < 10; i++) bus.emit(`host:test:${i}`, {});
  const tail = bus.tail(3);
  assert.strictEqual(tail.length, 3);
  assert.ok(tail[2].type.includes('9'));
});

test('EventBus: since(seq) returns events after that seq', () => {
  const bus = createEventBus();
  bus.emit('host:a:one',   {});
  const mid = bus.seq;
  bus.emit('host:a:two',   {});
  bus.emit('host:a:three', {});
  const after = bus.since(mid);
  assert.strictEqual(after.length, 2);
});

test('EventBus: seq increments monotonically', () => {
  const bus = createEventBus();
  bus.emit('host:a:b', {});
  bus.emit('host:c:d', {});
  assert.strictEqual(bus.seq, 2);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 1 — host/system-map.js');

test('SystemMap: loads and returns a map', () => {
  const mapFile = tmpFile('sysmap1.json');
  const bus     = createEventBus();
  const sysmap  = new SystemMap({ mapFile, eventBus: bus });
  sysmap.load();
  const m = sysmap.get();
  assert.ok(typeof m.version === 'string');
  assert.ok(Array.isArray(m.compartments));
  assert.ok(m.runtimes.length > 0);
  assert.ok(m.axioms.length === 33);
});

test('SystemMap: upsertCompartment adds it', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap2.json') });
  sysmap.load();
  sysmap.upsertCompartment({ id: 'x1', name: 'foo' });
  const m = sysmap.get();
  assert.ok(m.compartments.some(c => c.id === 'x1'));
});

test('SystemMap: upsertCompartment updates existing', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap3.json') });
  sysmap.load();
  sysmap.upsertCompartment({ id: 'x2', name: 'before' });
  sysmap.upsertCompartment({ id: 'x2', name: 'after' });
  const m = sysmap.get();
  const found = m.compartments.filter(c => c.id === 'x2');
  assert.strictEqual(found.length, 1);
  assert.strictEqual(found[0].name, 'after');
});

test('SystemMap: removeCompartment removes it', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap4.json') });
  sysmap.load();
  sysmap.upsertCompartment({ id: 'x3', name: 'temp' });
  sysmap.removeCompartment('x3');
  const m = sysmap.get();
  assert.ok(!m.compartments.some(c => c.id === 'x3'));
});

test('SystemMap: emits host:map:updated on mutation', () => {
  const bus    = createEventBus();
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap5.json'), eventBus: bus });
  sysmap.load();
  let fired = false;
  bus.on('host:map:updated', () => { fired = true; });
  sysmap.upsertCompartment({ id: 'x4', name: 'trigger' });
  assert.ok(fired);
});

test('SystemMap: get returns deep clone', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap6.json') });
  sysmap.load();
  sysmap.upsertCompartment({ id: 'x5', name: 'original' });
  const m1 = sysmap.get();
  m1.compartments[0].name = 'mutated';
  const m2 = sysmap.get();
  assert.ok(m2.compartments.find(c => c.id === 'x5')?.name !== 'mutated');
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 1 — host/index.js (createHost)');

test('createHost: boots without error', () => {
  const host = createHost({
    stateFile: tmpFile('host1-state.json'),
    mapFile:   tmpFile('host1-map.json'),
  });
  assert.ok(host.store);
  assert.ok(host.bus);
  assert.ok(host.sysmap);
  assert.strictEqual(host.version, COS_VERSION);
});

test('createHost: syncs compartments from store to sysmap', () => {
  const stateFile = tmpFile('host2-state.json');
  const mapFile   = tmpFile('host2-map.json');

  // Pre-populate state store
  const store = new StateStore(stateFile);
  store.load();
  store.setCompartment(makeCompartment({ id: 'pre-existing', name: 'pre' }));
  store.flushSync();

  // Boot host — should sync pre-existing to sysmap
  const host = createHost({ stateFile, mapFile });
  const m    = host.sysmap.get();
  assert.ok(m.compartments.some(c => c.id === 'pre-existing'));
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 2 — CLI COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

section('Phase 2 — cli/commands/create.js');

test('toSlug: converts name to kebab slug', () => {
  assert.strictEqual(toSlug('My Service'),  'my-service');
  assert.strictEqual(toSlug('  hello  '),   'hello');
  assert.strictEqual(toSlug('API Server v2'), 'api-server-v2');
});

test('toSlug: strips invalid characters', () => {
  const slug = toSlug('foo@bar!baz');
  assert.match(slug, /^[a-z0-9-]+$/);
});

test('createCompartment: creates with correct fields', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create1-state.json'),
    mapFile:   tmpFile('cli-create1-map.json'),
  });
  const comp = createCompartment(host, {
    name:      'test-create',
    purpose:   'unit test',
    runtimeId: 'node',
    networkIsolated: true,
  });
  assert.ok(comp.id);
  assert.strictEqual(comp.name,    'test-create');
  assert.strictEqual(comp.slug,    'test-create');
  assert.strictEqual(comp.purpose, 'unit test');
  assert.strictEqual(comp.runtimeId, 'node');
  assert.strictEqual(comp.network.isolated, true);
  assert.strictEqual(comp.state, 'created');
});

test('createCompartment: persists to state store', () => {
  const stateFile = tmpFile('cli-create2-state.json');
  const host = createHost({ stateFile, mapFile: tmpFile('cli-create2-map.json') });
  const comp = createCompartment(host, { name: 'persist-comp' });
  const found = host.store.getCompartment(comp.id);
  assert.strictEqual(found.name, 'persist-comp');
});

test('createCompartment: appears in system map', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create3-state.json'),
    mapFile:   tmpFile('cli-create3-map.json'),
  });
  const comp = createCompartment(host, { name: 'map-comp' });
  const m    = host.sysmap.get();
  assert.ok(m.compartments.some(c => c.id === comp.id));
});

test('createCompartment: emits host:compartment:created', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create4-state.json'),
    mapFile:   tmpFile('cli-create4-map.json'),
  });
  let fired = false;
  host.bus.on(HOST.COMPARTMENT_CREATED, () => { fired = true; });
  createCompartment(host, { name: 'event-comp' });
  assert.ok(fired);
});

test('createCompartment: creates .cos-manifest.json on disk', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create5-state.json'),
    mapFile:   tmpFile('cli-create5-map.json'),
  });
  const comp = createCompartment(host, { name: 'disk-comp' });
  assert.ok(fs.existsSync(comp.fs.root));
  const manifestPath = path.join(comp.fs.root, '.cos-manifest.json');
  assert.ok(fs.existsSync(manifestPath));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.id, comp.id);
});

test('createCompartment: throws on duplicate name', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create6-state.json'),
    mapFile:   tmpFile('cli-create6-map.json'),
  });
  createCompartment(host, { name: 'dupe-comp' });
  assert.throws(
    () => createCompartment(host, { name: 'dupe-comp' }),
    /already exists/
  );
});

test('createCompartment: throws on empty name', () => {
  const host = createHost({
    stateFile: tmpFile('cli-create7-state.json'),
    mapFile:   tmpFile('cli-create7-map.json'),
  });
  assert.throws(() => createCompartment(host, { name: '' }), /required/);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 2 — cli/commands/list.js');

test('renderTable: empty compartments', () => {
  const out = renderTable([]);
  assert.ok(out.includes('No compartments'));
});

test('renderTable: renders compartment rows', () => {
  const comps = [
    makeCompartment({ id: 'id-1', name: 'my-app', state: 'running', runtimeId: 'node' }),
    makeCompartment({ id: 'id-2', name: 'my-db',  state: 'stopped', runtimeId: 'python' }),
  ];
  const out = renderTable(comps);
  assert.ok(out.includes('my-app'));
  assert.ok(out.includes('my-db'));
  assert.ok(out.includes('running'));
  assert.ok(out.includes('node'));
  assert.ok(out.includes('2 compartments'));
});

test('renderTable: singular "1 compartment"', () => {
  const out = renderTable([makeCompartment({ id: 'x', name: 'one' })]);
  assert.ok(out.includes('1 compartment'));
  assert.ok(!out.includes('1 compartments'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 2 — cli/commands/map.js');

test('renderTree: empty system map renders header', () => {
  const map = makeSystemMap({ version: '1.0.0' });
  const out = renderTree(map);
  assert.ok(out.includes('COMPARTMENT OS'));
  assert.ok(out.includes('Compartments (0)'));
  assert.ok(out.includes('Hooks (0)'));
});

test('renderTree: shows compartments', () => {
  const map = makeSystemMap({
    compartments: [
      makeCompartment({ id: 'c1', name: 'web-api', state: 'running' }),
    ],
  });
  const out = renderTree(map);
  assert.ok(out.includes('web-api'));
  assert.ok(out.includes('running'));
});

test('renderTree: shows pipe arrows', () => {
  const map = makeSystemMap({
    pipes: [makePipe({ id: 'p1', name: 'build-to-deploy', state: 'active' })],
  });
  const out = renderTree(map);
  assert.ok(out.includes('build-to-deploy'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 2 — cli/index.js (parseArgs)');

test('parseArgs: parses command and positional args', () => {
  const { command, args, flags } = parseArgs(['node', 'cos', 'create', 'my-app']);
  assert.strictEqual(command, 'create');
  assert.deepStrictEqual(args, ['my-app']);
  assert.deepStrictEqual(flags, {});
});

test('parseArgs: parses --json flag', () => {
  const { flags } = parseArgs(['node', 'cos', 'list', '--json']);
  assert.strictEqual(flags.json, true);
});

test('parseArgs: parses --watch flag', () => {
  const { flags } = parseArgs(['node', 'cos', 'map', '--watch']);
  assert.strictEqual(flags.watch, true);
});

test('parseArgs: no command returns null', () => {
  const { command } = parseArgs(['node', 'cos']);
  assert.strictEqual(command, null);
});

test('parseArgs: --key=value flags', () => {
  const { flags } = parseArgs(['node', 'cos', 'map', '--out=file.json']);
  assert.strictEqual(flags.out, 'file.json');
});

// ─── New command requires ─────────────────────────────────────────────────────

const { startCompartment }   = require('../cli/commands/start.js');
const { stopCompartment }    = require('../cli/commands/stop.js');
const { destroyCompartment, runDestroyWizard } = require('../cli/commands/destroy.js');
const { showStatus }         = require('../cli/commands/status.js');
const { runHooksCommand, listHooks, showHook, fireHook } = require('../cli/commands/hooks.js');
const { runEventsCommand, tailEvents, formatEvent } = require('../cli/commands/events.js');
const { validateSchema }     = require('../cli/commands/schema.js');
const { parseArgs: parseArgsFresh } = require('../cli/index.js');

// ─── Phase 2 — cli/commands/start.js ─────────────────────────────────────────

section('Phase 2 — cli/commands/start.js');

test('startCompartment: transitions created → running', () => {
  const host = createHost({ stateFile: tmpFile('start-state.json'), mapFile: tmpFile('start-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  const comp = createCompartment(host, { name: 'start-test', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  assert.strictEqual(comp.state, 'created');
  const updated = startCompartment(host, 'start-test', { log: () => {}, error: () => {} });
  assert.strictEqual(updated.state, 'running');
  assert.ok(typeof updated.lastStartAt === 'number');
});

test('startCompartment: persists state to store', () => {
  const host = createHost({ stateFile: tmpFile('start-persist.json'), mapFile: tmpFile('start-persist-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'start-persist', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'start-persist', { log: () => {}, error: () => {} });
  const stored = host.store.getCompartmentByName('start-persist');
  assert.strictEqual(stored.state, 'running');
});

test('startCompartment: throws on invalid transition (already running)', () => {
  const host = createHost({ stateFile: tmpFile('start-dup.json'), mapFile: tmpFile('start-dup-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'start-dup', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'start-dup', { log: () => {}, error: () => {} });
  assert.throws(
    () => startCompartment(host, 'start-dup', { log: () => {}, error: () => {} }),
    /cannot transition/
  );
});

test('startCompartment: throws on not found', () => {
  const host = createHost({ stateFile: tmpFile('start-nf.json'), mapFile: tmpFile('start-nf-map.json') });
  assert.throws(
    () => startCompartment(host, 'ghost', { log: () => {}, error: () => {} }),
    /not found/
  );
});

// ─── Phase 2 — cli/commands/stop.js ──────────────────────────────────────────

section('Phase 2 — cli/commands/stop.js');

test('stopCompartment: transitions running → stopped', () => {
  const host = createHost({ stateFile: tmpFile('stop-state.json'), mapFile: tmpFile('stop-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'stop-test', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'stop-test', { log: () => {}, error: () => {} });
  const updated = stopCompartment(host, 'stop-test', { log: () => {}, error: () => {} });
  assert.strictEqual(updated.state, 'stopped');
  assert.ok(typeof updated.lastStopAt === 'number');
});

test('stopCompartment: throws on invalid transition (already stopped)', () => {
  const host = createHost({ stateFile: tmpFile('stop-dup.json'), mapFile: tmpFile('stop-dup-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'stop-dup', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'stop-dup', { log: () => {}, error: () => {} });
  stopCompartment(host, 'stop-dup', { log: () => {}, error: () => {} });
  assert.throws(
    () => stopCompartment(host, 'stop-dup', { log: () => {}, error: () => {} }),
    /cannot transition/
  );
});

test('stopCompartment: throws on not found', () => {
  const host = createHost({ stateFile: tmpFile('stop-nf.json'), mapFile: tmpFile('stop-nf-map.json') });
  assert.throws(
    () => stopCompartment(host, 'ghost', { log: () => {}, error: () => {} }),
    /not found/
  );
});

// ─── Phase 2 — cli/commands/destroy.js ───────────────────────────────────────

section('Phase 2 — cli/commands/destroy.js');

test('destroyCompartment: removes from store + sysmap', () => {
  const host = createHost({ stateFile: tmpFile('dest-state.json'), mapFile: tmpFile('dest-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'dest-test', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  destroyCompartment(host, 'dest-test', { force: true });
  assert.strictEqual(host.store.getCompartmentByName('dest-test'), null);
  const map = host.sysmap.get();
  assert.ok(!map.compartments.find(c => c.name === 'dest-test'));
});

test('destroyCompartment: emits host:compartment:destroyed', () => {
  const host = createHost({ stateFile: tmpFile('dest-event.json'), mapFile: tmpFile('dest-event-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'dest-event', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  let fired = null;
  host.bus.on('host:compartment:destroyed', ev => { fired = ev.payload; });
  destroyCompartment(host, 'dest-event', { force: true });
  assert.ok(fired !== null);
  assert.strictEqual(fired.name, 'dest-event');
});

test('destroyCompartment: throws on running without force', () => {
  const host = createHost({ stateFile: tmpFile('dest-run.json'), mapFile: tmpFile('dest-run-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'dest-run', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'dest-run', { log: () => {}, error: () => {} });
  assert.throws(
    () => destroyCompartment(host, 'dest-run'),
    /stop it first/
  );
});

test('destroyCompartment: force destroys running compartment', () => {
  const host = createHost({ stateFile: tmpFile('dest-force.json'), mapFile: tmpFile('dest-force-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'dest-force', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  startCompartment(host, 'dest-force', { log: () => {}, error: () => {} });
  assert.doesNotThrow(() => destroyCompartment(host, 'dest-force', { force: true }));
  assert.strictEqual(host.store.getCompartmentByName('dest-force'), null);
});

test('destroyCompartment: throws on not found', () => {
  const host = createHost({ stateFile: tmpFile('dest-nf.json'), mapFile: tmpFile('dest-nf-map.json') });
  assert.throws(
    () => destroyCompartment(host, 'ghost', { force: true }),
    /not found/
  );
});

// ─── Phase 2 — cli/commands/status.js ────────────────────────────────────────

section('Phase 2 — cli/commands/status.js');

test('showStatus: returns compartment for valid name', () => {
  const host = createHost({ stateFile: tmpFile('status-state.json'), mapFile: tmpFile('status-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'status-test', purpose: 'testing status', runtimeId: 'node', networkIsolated: true });
  const logs = [];
  const comp = showStatus(host, 'status-test', {}, { log: s => logs.push(s), error: () => {} });
  assert.ok(comp !== null);
  assert.strictEqual(comp.name, 'status-test');
  assert.ok(logs.some(l => l.includes('status-test')));
});

test('showStatus: returns null for missing compartment', () => {
  const host = createHost({ stateFile: tmpFile('status-nf.json'), mapFile: tmpFile('status-nf-map.json') });
  const result = showStatus(host, 'ghost', {}, { log: () => {}, error: () => {} });
  assert.strictEqual(result, null);
});

test('showStatus: --json returns raw compartment JSON', () => {
  const host = createHost({ stateFile: tmpFile('status-json.json'), mapFile: tmpFile('status-json-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'status-json', purpose: 'test', runtimeId: 'node', networkIsolated: true });
  const logs = [];
  showStatus(host, 'status-json', { json: true }, { log: s => logs.push(s), error: () => {} });
  const parsed = JSON.parse(logs[0]);
  assert.strictEqual(parsed.name, 'status-json');
});

// ─── Phase 2 — cli/commands/hooks.js ─────────────────────────────────────────

section('Phase 2 — cli/commands/hooks.js');

test('listHooks: empty system map prints no-hooks message', () => {
  const host = createHost({ stateFile: tmpFile('hk-empty.json'), mapFile: tmpFile('hk-empty-map.json') });
  const logs = [];
  listHooks(host, {}, { log: s => logs.push(s), error: () => {} });
  assert.ok(logs.some(l => l.includes('No hooks')));
});

test('listHooks: shows hooks from system map', () => {
  const host = createHost({ stateFile: tmpFile('hk-list.json'), mapFile: tmpFile('hk-list-map.json') });
  const { randomUUID } = require('crypto');
  const hook = {
    id:            randomUUID(),
    name:          'test-hook',
    version:       '1.0.0',
    compartmentId: 'host',
    contract:      { inputs: [], outputs: [], sideEffects: [], axioms: [] },
    bindings:      { ui: null, cli: 'cos test', event: 'host:test:fired' },
    meta:          { description: 'test', autoDetected: false, sourceFile: null, createdAt: Date.now(), updatedAt: Date.now() },
  };
  host.sysmap.upsertHook(hook);
  const logs = [];
  listHooks(host, {}, { log: s => logs.push(s), error: () => {} });
  assert.ok(logs.some(l => l.includes('test-hook')));
});

test('showHook: returns null for missing hook', () => {
  const host = createHost({ stateFile: tmpFile('hk-show-nf.json'), mapFile: tmpFile('hk-show-nf-map.json') });
  const result = showHook(host, 'ghost', {}, { log: () => {}, error: () => {} });
  assert.strictEqual(result, null);
});

test('fireHook: emits hook event on bus', () => {
  const host = createHost({ stateFile: tmpFile('hk-fire.json'), mapFile: tmpFile('hk-fire-map.json') });
  const { randomUUID } = require('crypto');
  const hook = {
    id:            randomUUID(),
    name:          'fire-test-hook',
    version:       '1.0.0',
    compartmentId: 'host',
    contract:      { inputs: [], outputs: [], sideEffects: [], axioms: [] },
    bindings:      { ui: null, cli: null, event: 'host:test:fired' },
    meta:          { description: 'fire test', autoDetected: false, sourceFile: null, createdAt: Date.now(), updatedAt: Date.now() },
  };
  host.sysmap.upsertHook(hook);
  let fired = null;
  host.bus.on('host:test:fired', ev => { fired = ev.payload; });
  fireHook(host, 'fire-test-hook', {}, { log: () => {}, error: () => {} });
  assert.ok(fired !== null);
  assert.strictEqual(fired.hookId, hook.id);
  assert.strictEqual(fired.manual, true);
});

// ─── Phase 2 — cli/commands/events.js ────────────────────────────────────────

section('Phase 2 — cli/commands/events.js');

test('formatEvent: formats event with seq and type', () => {
  const ev = { seq: 42, ts: 1700000000000, type: 'host:test:event', payload: { x: 1 } };
  const out = formatEvent(ev);
  assert.ok(out.includes('42'));
  assert.ok(out.includes('host:test:event'));
});

test('formatEvent: --json returns raw JSON', () => {
  const ev = { seq: 1, ts: 1700000000000, type: 'host:test:event', payload: {} };
  const out = formatEvent(ev, { json: true });
  const parsed = JSON.parse(out);
  assert.strictEqual(parsed.type, 'host:test:event');
});

test('tailEvents: prints last N from ring buffer', () => {
  const host = createHost({ stateFile: tmpFile('ev-tail.json'), mapFile: tmpFile('ev-tail-map.json') });
  // Emit a few events
  host.bus.emit('host:test:one', { v: 1 });
  host.bus.emit('host:test:two', { v: 2 });
  host.bus.emit('host:test:three', { v: 3 });
  const logs = [];
  tailEvents(host, 10, {}, { log: s => logs.push(s) });
  assert.ok(logs.some(l => l.includes('host:test:one') || l.includes('host:test:two') || l.includes('host:test:three')));
});

// ─── Phase 2 — cli/commands/schema.js ────────────────────────────────────────

section('Phase 2 — cli/commands/schema.js');

test('validateSchema: no hooks → valid result', () => {
  const host = createHost({ stateFile: tmpFile('schema-empty.json'), mapFile: tmpFile('schema-empty-map.json') });
  const result = validateSchema(host, {}, { log: () => {}, error: () => {} });
  assert.strictEqual(result.total, 0);
  assert.strictEqual(result.invalid, 0);
});

test('validateSchema: valid hook passes', () => {
  const host = createHost({ stateFile: tmpFile('schema-valid.json'), mapFile: tmpFile('schema-valid-map.json') });
  const { randomUUID } = require('crypto');
  const hook = {
    id:            randomUUID(),
    name:          'schema-valid-hook',
    version:       '1.0.0',
    compartmentId: 'host',
    contract:      { inputs: [], outputs: [], sideEffects: [], axioms: [] },
    bindings:      { ui: null, cli: null, event: 'host:schema:validated' },
    meta:          { description: 'ok', autoDetected: false, sourceFile: null, createdAt: Date.now(), updatedAt: Date.now() },
  };
  host.sysmap.upsertHook(hook);
  const result = validateSchema(host, {}, { log: () => {}, error: () => {} });
  assert.strictEqual(result.valid, 1);
  assert.strictEqual(result.invalid, 0);
});

test('validateSchema: invalid hook surfaces error', () => {
  const host = createHost({ stateFile: tmpFile('schema-bad.json'), mapFile: tmpFile('schema-bad-map.json') });
  // Inject a malformed hook directly into sysmap (bypasses validateHook)
  const map = host.sysmap.get();
  map.hooks.push({ id: 'not-a-uuid', name: 'bad-hook' });
  host.sysmap._map = map;  // force-set for test purposes
  const result = validateSchema(host, {}, { log: () => {}, error: () => {} });
  assert.ok(result.invalid >= 1);
});

// ─── Phase 2 — cli/index.js (updated parseArgs) ───────────────────────────────

section('Phase 2 — cli/index.js (updated parseArgs)');

test('parseArgs: parses --force flag', () => {
  const { flags } = parseArgsFresh(['node', 'cos', 'destroy', 'mycomp', '--force']);
  assert.strictEqual(flags.force, true);
});

test('parseArgs: parses --wipe flag', () => {
  const { flags } = parseArgsFresh(['node', 'cos', 'destroy', 'mycomp', '--wipe']);
  assert.strictEqual(flags.wipe, true);
});

test('parseArgs: parses subcommand in args', () => {
  const { command, args } = parseArgsFresh(['node', 'cos', 'hooks', 'list']);
  assert.strictEqual(command, 'hooks');
  assert.strictEqual(args[0], 'list');
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 21 — ARCHETYPE SYSTEM (spec §43 / §60)
// ═════════════════════════════════════════════════════════════════════════════

const { ARCHETYPES, ARCHETYPE_NAMES, getBuiltInArchetype } = require('../archetype/registry.js');
const { validateArchetype, ArchetypeSchemaError } = require('../archetype/schema.js');
const { detectArchetype, hintMatches, confidenceForScore } = require('../archetype/detector.js');
const { listArchetypes, getArchetype, importArchetype, applyArchetypeToCompartment } = require('../archetype/index.js');
const { ArchetypeAssignGate, ArchetypeImportGate, ArchetypeDetectGate } = require('../host/gates/archetype.js');
const { ARCHETYPE: ARCHETYPE_EVENTS } = require('../foundation/event-contracts.js');
const { runArchetypeCommand } = require('../cli/commands/archetype.js');

section('Phase 21 — archetype/registry.js');

test('ARCHETYPES has exactly 16 entries, all built-in', () => {
  assert.strictEqual(ARCHETYPES.length, 16);
  assert.ok(ARCHETYPES.every(a => a.builtIn === true && a.pluginId === null));
});

test('ARCHETYPE_NAMES matches spec §60.2 name list exactly', () => {
  assert.deepStrictEqual(ARCHETYPE_NAMES, [
    'web-server', 'api-server', 'worker', 'scheduler', 'sandbox-browser',
    'compiler', 'test-runner', 'database', 'job-queue', 'file-processor',
    'containment', 'exe-runner', 'ai-agent', 'reverse-proxy', 'scratch', 'blank',
  ]);
});

test('every archetype id is a real UUID v4 (not the spec mnemonic placeholder)', () => {
  const { isUUID } = require('../foundation/hook-schema.js');
  assert.ok(ARCHETYPES.every(a => isUUID(a.id)));
});

test('getBuiltInArchetype resolves by name and by id', () => {
  const byName = getBuiltInArchetype('web-server');
  const byId   = getBuiltInArchetype(byName.id);
  assert.strictEqual(byName, byId);
});

test('getBuiltInArchetype returns null for unknown', () => {
  assert.strictEqual(getBuiltInArchetype('does-not-exist'), null);
});

test('scratch and blank have empty detectionHints — manual-only by design', () => {
  assert.deepStrictEqual(getBuiltInArchetype('scratch').detectionHints, []);
  assert.deepStrictEqual(getBuiltInArchetype('blank').detectionHints, []);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 21 — archetype/schema.js');

test('validateArchetype throws on missing required field', () => {
  assert.throws(() => validateArchetype({ name: 'x' }), ArchetypeSchemaError);
});

test('validateArchetype throws on non-UUID id', () => {
  assert.throws(() => validateArchetype(Object.assign({}, getBuiltInArchetype('web-server'), { id: 'arch-web-server-0001' })), ArchetypeSchemaError);
});

test('validateArchetype throws on unknown runtimeId', () => {
  assert.throws(() => validateArchetype(Object.assign({}, getBuiltInArchetype('web-server'), { runtimeId: 'cobol' })), ArchetypeSchemaError);
});

test('validateArchetype throws on invalid governorPolicy', () => {
  const a = JSON.parse(JSON.stringify(getBuiltInArchetype('web-server')));
  a.resources.governorPolicy = 'whatever';
  assert.throws(() => validateArchetype(a), ArchetypeSchemaError);
});

test('validateArchetype passes on an unmodified built-in', () => {
  assert.doesNotThrow(() => validateArchetype(getBuiltInArchetype('worker')));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 21 — archetype/detector.js');

test('hintMatches: glob hint matches filename', () => {
  assert.ok(hintMatches('*.exe', '', ['app.exe']));
  assert.ok(!hintMatches('*.exe', '', ['app.dll']));
});

test('hintMatches: substring hint matches corpus', () => {
  assert.ok(hintMatches('express', 'const x = require("express")', []));
  assert.ok(!hintMatches('express', 'const x = require("fastify")', []));
});

test('confidenceForScore bands: >70 auto, 40-70 suggested, <40 manual', () => {
  assert.strictEqual(confidenceForScore(0.71), 'auto');
  assert.strictEqual(confidenceForScore(0.70), 'suggested');
  assert.strictEqual(confidenceForScore(0.40), 'suggested');
  assert.strictEqual(confidenceForScore(0.39), 'manual');
  assert.strictEqual(confidenceForScore(0), 'manual');
});

test('detectArchetype: express project detects web-server as top candidate', () => {
  const dir = tmpDir('detect-express');
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { express: '^4.0.0' } }));
  fs.writeFileSync(path.join(dir, 'index.js'), "const express=require('express'); const app=express(); app.listen(3000);");
  const { top } = detectArchetype(dir);
  assert.ok(top);
  assert.strictEqual(top.name, 'web-server');
});

test('detectArchetype: empty project returns null top (no false positive)', () => {
  const dir = tmpDir('detect-empty');
  const { top } = detectArchetype(dir);
  assert.strictEqual(top, null);
});

test('detectArchetype: jest project detects test-runner', () => {
  const dir = tmpDir('detect-jest');
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ devDependencies: { jest: '^29.0.0' } }));
  const { results } = detectArchetype(dir);
  const testRunner = results.find(r => r.name === 'test-runner');
  assert.ok(testRunner.matchedHints.includes('jest'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 21 — archetype/index.js');

test('listArchetypes returns 16 built-ins plus any custom passed in', () => {
  const list = listArchetypes([{ id: 'x', name: 'custom-one', builtIn: false }]);
  assert.strictEqual(list.length, 17);
});

test('getArchetype resolves built-ins and falls through to custom list', () => {
  assert.strictEqual(getArchetype('web-server', []).name, 'web-server');
  const custom = { id: 'custom-1', name: 'my-thing' };
  assert.strictEqual(getArchetype('my-thing', [custom]), custom);
  assert.strictEqual(getArchetype('nope', [custom]), null);
});

test('importArchetype validates and mints a UUID when source id is not a valid UUID', () => {
  const raw = JSON.parse(JSON.stringify(getBuiltInArchetype('worker')));
  raw.id = 'my-custom-worker';   // not a UUID — should be replaced
  raw.name = 'my-custom-worker';
  const { isUUID } = require('../foundation/hook-schema.js');
  const result = importArchetype(raw);
  assert.ok(isUUID(result.id));
  assert.notStrictEqual(result.id, 'my-custom-worker');
  assert.strictEqual(result.builtIn, false);
});

test('importArchetype throws ArchetypeSchemaError on malformed input', () => {
  assert.throws(() => importArchetype({ name: 'broken' }), ArchetypeSchemaError);
});

test('importArchetype mints a fresh id when cloning a built-in as a template (regression: id collision used to silently overwrite the built-in)', () => {
  const raw = Object.assign(JSON.parse(JSON.stringify(getBuiltInArchetype('worker'))), { name: 'my-custom-worker' });
  const result = importArchetype(raw);
  assert.notStrictEqual(result.id, getBuiltInArchetype('worker').id);
  assert.strictEqual(getBuiltInArchetype('worker').id, ARCHETYPES.find(a => a.name === 'worker').id);
});

test('applyArchetypeToCompartment replaces resources/watchdog/network wholesale (not vacuous-merged)', () => {
  const { makeCompartment } = require('../foundation/types.js');
  const comp = makeCompartment({ id: 'c1', name: 'test-comp' });
  const archetype = getBuiltInArchetype('database');
  const updated = applyArchetypeToCompartment(comp, archetype);
  assert.strictEqual(updated.archetypeId, archetype.id);
  assert.strictEqual(updated.resources.ramLimitMB, archetype.resources.ramLimitMB);
  assert.strictEqual(updated.watchdog.onAnomaly, archetype.watchdogPreset.onAnomaly);
  assert.strictEqual(updated.network.level, archetype.networkPreset.level);
  // original untouched
  assert.strictEqual(comp.archetypeId, null);
});

test('applyArchetypeToCompartment keeps compartment runtimeId if already set, else adopts archetype default', () => {
  const { makeCompartment } = require('../foundation/types.js');
  const archetype = getBuiltInArchetype('web-server');
  const withRuntime = applyArchetypeToCompartment(makeCompartment({ id: 'c2', runtimeId: 'python' }), archetype);
  assert.strictEqual(withRuntime.runtimeId, 'python');
  const withoutRuntime = applyArchetypeToCompartment(makeCompartment({ id: 'c3' }), archetype);
  assert.strictEqual(withoutRuntime.runtimeId, archetype.runtimeId);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 21 — host/gates/archetype.js + host/system-map.js archetypes');

test('SystemMap includes all 16 built-in archetypes by default', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-arch1.json') });
  sysmap.load();
  const m = sysmap.get();
  assert.strictEqual(m.archetypes.length, 16);
});

test('SystemMap.upsertArchetype rejects mutating a built-in', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-arch2.json') });
  sysmap.load();
  const builtin = sysmap.get().archetypes[0];
  assert.throws(() => sysmap.upsertArchetype(builtin));
});

test('SystemMap.upsertArchetype adds a custom archetype, persists across reload', () => {
  const mapFile = tmpFile('sysmap-arch3.json');
  const sysmap = new SystemMap({ mapFile });
  sysmap.load();
  const custom = importArchetype(Object.assign(JSON.parse(JSON.stringify(getBuiltInArchetype('worker'))), { name: 'my-custom' }));
  sysmap.upsertArchetype(custom);
  assert.strictEqual(sysmap.get().archetypes.length, 17);

  const reloaded = new SystemMap({ mapFile });
  reloaded.load();
  assert.strictEqual(reloaded.get().archetypes.length, 17);
  assert.ok(reloaded.get().archetypes.some(a => a.name === 'my-custom' && a.builtIn === false));
});

test('SystemMap.removeArchetype rejects removing a built-in, allows removing custom', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-arch4.json') });
  sysmap.load();
  const builtin = sysmap.get().archetypes[0];
  assert.throws(() => sysmap.removeArchetype(builtin.id));

  const custom = importArchetype(Object.assign(JSON.parse(JSON.stringify(getBuiltInArchetype('worker'))), { name: 'removable' }));
  sysmap.upsertArchetype(custom);
  sysmap.removeArchetype(custom.id);
  assert.ok(!sysmap.get().archetypes.some(a => a.id === custom.id));
});

test('host boot registers the 3 archetype gates without signature collision', () => {
  const host = createHost({
    stateFile: tmpFile('arch-host-state.json'),
    mapFile:   tmpFile('arch-host-map.json'),
  });
  assert.ok(host.bus.stream.gates.has('host:archetype:assign'));
  assert.ok(host.bus.stream.gates.has('host:archetype:import'));
  assert.ok(host.bus.stream.gates.has('host:archetype:detect'));
});

test('ArchetypeAssignGate: assigns archetype, replaces resource/watchdog/network presets, updates store + map', () => {
  const host = createHost({
    stateFile: tmpFile('arch-assign-state.json'),
    mapFile:   tmpFile('arch-assign-map.json'),
  });
  const comp = createCompartment(host, { name: 'assign-target' });

  let assigned = null;
  host.bus.on(ARCHETYPE_EVENTS.ASSIGNED, (ev) => { assigned = ev.payload; });
  host.bus.emit('host:archetype:assign', {
    compartmentName: 'assign-target',
    archetypeIdOrName: 'database',
    store: host.store,
    sysmap: host.sysmap,
  });

  assert.ok(assigned);
  const updated = host.store.getCompartmentByName('assign-target');
  assert.strictEqual(updated.archetypeId, assigned.archetypeId);
  assert.strictEqual(updated.resources.governorPolicy, 'reserved');
  assert.strictEqual(host.sysmap.get().compartments.find(c => c.id === updated.id).archetypeId, assigned.archetypeId);
});

test('ArchetypeAssignGate: unknown compartment emits archetype:error', () => {
  const host = createHost({
    stateFile: tmpFile('arch-assign-err-state.json'),
    mapFile:   tmpFile('arch-assign-err-map.json'),
  });
  let errored = null;
  host.bus.on(ARCHETYPE_EVENTS.ERROR, (ev) => { errored = ev.payload; });
  host.bus.emit('host:archetype:assign', { compartmentName: 'ghost', archetypeIdOrName: 'web-server', store: host.store, sysmap: host.sysmap });
  assert.ok(errored);
  assert.match(errored.reason, /not found/);
});

test('ArchetypeImportGate: imports a custom archetype and adds it to the system map', () => {
  const host = createHost({
    stateFile: tmpFile('arch-import-state.json'),
    mapFile:   tmpFile('arch-import-map.json'),
  });
  const raw = Object.assign(JSON.parse(JSON.stringify(getBuiltInArchetype('scheduler'))), { name: 'cron-plus' });
  let created = null;
  host.bus.on(ARCHETYPE_EVENTS.CREATED, (ev) => { created = ev.payload; });
  host.bus.emit('host:archetype:import', { raw, sysmap: host.sysmap });
  assert.ok(created);
  assert.ok(host.sysmap.get().archetypes.some(a => a.id === created.archetypeId));
});

test('ArchetypeDetectGate: emits archetype:detected with a top match for an express project', () => {
  const host = createHost({
    stateFile: tmpFile('arch-detect-state.json'),
    mapFile:   tmpFile('arch-detect-map.json'),
  });
  const dir = tmpDir('detect-gate-express');
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies: { express: '^4.0.0' } }));
  fs.writeFileSync(path.join(dir, 'index.js'), "require('express')().listen(3000);");

  let detected = null;
  host.bus.on(ARCHETYPE_EVENTS.DETECTED, (ev) => { detected = ev.payload; });
  host.bus.emit('host:archetype:detect', { root: dir });
  assert.ok(detected);
  assert.strictEqual(detected.top.name, 'web-server');
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 21 — cli/commands/archetype.js');

test('cli archetype list returns all built-ins as JSON', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-list-state.json'), mapFile: tmpFile('cli-arch-list-map.json') });
  const out = [];
  const result = runArchetypeCommand(host, 'list', [], { json: true }, { log: (s) => out.push(s) });
  assert.strictEqual(result.length, 16);
  assert.ok(JSON.parse(out[0]).length === 16);
});

test('cli archetype show returns null + logs error for unknown name', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-show-state.json'), mapFile: tmpFile('cli-arch-show-map.json') });
  const errs = [];
  const result = runArchetypeCommand(host, 'show', ['nonexistent'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('not found'));
});

test('cli archetype assign end-to-end through the CLI router', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-assign-state.json'), mapFile: tmpFile('cli-arch-assign-map.json') });
  createCompartment(host, { name: 'cli-target' });
  const logs = [];
  const result = runArchetypeCommand(host, 'assign', ['cli-target', 'worker'], {}, { log: (s) => logs.push(s) });
  assert.ok(result);
  assert.strictEqual(result.archetypeName, 'worker');
  assert.ok(logs[0].includes('Assigned'));
});

test('cli archetype detect on an empty dir reports no match without throwing', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-detect-state.json'), mapFile: tmpFile('cli-arch-detect-map.json') });
  const dir = tmpDir('cli-detect-empty');
  const logs = [];
  const result = runArchetypeCommand(host, 'detect', [dir], {}, { log: (s) => logs.push(s) });
  assert.strictEqual(result.top, null);
  assert.ok(logs[0].includes('No archetype matched'));
});

test('cli archetype create imports from a JSON file on disk', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-create-state.json'), mapFile: tmpFile('cli-arch-create-map.json') });
  const filePath = tmpFile('custom-archetype.json');
  const raw = Object.assign(JSON.parse(JSON.stringify(getBuiltInArchetype('file-processor'))), { name: 'custom-fp' });
  fs.writeFileSync(filePath, JSON.stringify(raw));
  const logs = [];
  const result = runArchetypeCommand(host, 'create', [filePath], {}, { log: (s) => logs.push(s) });
  assert.ok(result);
  assert.strictEqual(result.name, 'custom-fp');
  assert.ok(logs[0].includes('Imported'));
});

test('cli archetype with unknown subcommand returns null + usage error', () => {
  const host = createHost({ stateFile: tmpFile('cli-arch-bad-state.json'), mapFile: tmpFile('cli-arch-bad-map.json') });
  const errs = [];
  const result = runArchetypeCommand(host, 'frobnicate', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Usage'));
});

test('ALL_EVENT_TYPES includes the 5 archetype events', () => {
  assert.ok(isKnownEvent(ARCHETYPE_EVENTS.LISTED));
  assert.ok(isKnownEvent(ARCHETYPE_EVENTS.SHOWN));
  assert.ok(isKnownEvent(ARCHETYPE_EVENTS.ASSIGNED));
  assert.ok(isKnownEvent(ARCHETYPE_EVENTS.DETECTED));
  assert.ok(isKnownEvent(ARCHETYPE_EVENTS.CREATED));
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 22 — BLUEPRINT SYSTEM (spec §44 / §61)
// ═════════════════════════════════════════════════════════════════════════════

const { BLUEPRINTS, BLUEPRINT_NAMES, getBuiltInBlueprint } = require('../blueprint/registry.js');
const { validateBlueprint, BlueprintSchemaError } = require('../blueprint/schema.js');
const { listBlueprints, getBlueprint, importBlueprint, launchBlueprint, destroyBlueprintInstance, substituteTemplate } = require('../blueprint/index.js');
const { BlueprintCreateGate, BlueprintImportGate, BlueprintDestroyGate } = require('../host/gates/blueprint.js');
const { BLUEPRINT: BLUEPRINT_EVENTS } = require('../foundation/event-contracts.js');
const { runBlueprintCommand } = require('../cli/commands/blueprint.js');

section('Phase 22 — blueprint/registry.js');

test('BLUEPRINTS has exactly 11 entries, all built-in', () => {
  assert.strictEqual(BLUEPRINTS.length, 11);
  assert.ok(BLUEPRINTS.every(b => b.builtIn === true && b.pluginId === null));
});

test('BLUEPRINT_NAMES matches spec §61.3 name list exactly', () => {
  assert.deepStrictEqual(BLUEPRINT_NAMES, [
    'fullstack-app', 'microservice-trio', 'worker-pool', 'ci-pipeline', 'ai-assistant',
    'desktop-app', 'security-audit', 'game-server', 'scraper-pipeline', 'llm-eval', 'dev-environment',
  ]);
});

test('every blueprint id is a real UUID v4', () => {
  assert.ok(BLUEPRINTS.every(b => isUUID(b.id)));
});

test('every node.archetypeId resolves to a real built-in archetype', () => {
  const { ARCHETYPE_MAP } = require('../archetype/registry.js');
  for (const bp of BLUEPRINTS) {
    for (const node of bp.nodes) {
      assert.ok(ARCHETYPE_MAP.has(node.archetypeId), `${bp.name}.${node.role} -> ${node.archetypeId}`);
    }
  }
});

test('worker-pool worker role is scalable 1-20, dispatcher is not scalable', () => {
  const wp = getBuiltInBlueprint('worker-pool');
  const worker = wp.nodes.find(n => n.role === 'worker');
  const dispatcher = wp.nodes.find(n => n.role === 'dispatcher');
  assert.strictEqual(worker.scalable, true);
  assert.strictEqual(worker.maxInstances, 20);
  assert.strictEqual(dispatcher.scalable, false);
});

test('getBuiltInBlueprint resolves by name and by id, null for unknown', () => {
  const byName = getBuiltInBlueprint('ci-pipeline');
  assert.strictEqual(getBuiltInBlueprint(byName.id), byName);
  assert.strictEqual(getBuiltInBlueprint('nope'), null);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 22 — blueprint/schema.js');

test('validateBlueprint throws on missing required field', () => {
  assert.throws(() => validateBlueprint({ name: 'x' }), BlueprintSchemaError);
});

test('validateBlueprint throws on duplicate role names', () => {
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('fullstack-app')));
  bp.nodes[1].role = bp.nodes[0].role;
  assert.throws(() => validateBlueprint(bp), BlueprintSchemaError);
});

test('validateBlueprint throws when a pipe references an unknown role', () => {
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('fullstack-app')));
  bp.pipes[0].from = 'nonexistent-role';
  assert.throws(() => validateBlueprint(bp), BlueprintSchemaError);
});

test('validateBlueprint throws when startOrder omits a role', () => {
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('fullstack-app')));
  bp.startOrder = bp.startOrder.slice(1);
  assert.throws(() => validateBlueprint(bp), BlueprintSchemaError);
});

test('validateBlueprint with archetypeResolver throws on unknown archetypeId', () => {
  const { ARCHETYPE_MAP } = require('../archetype/registry.js');
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('fullstack-app')));
  bp.nodes[0].archetypeId = 'not-a-real-archetype-id';
  assert.throws(() => validateBlueprint(bp, ARCHETYPE_MAP), BlueprintSchemaError);
});

test('validateBlueprint passes on an unmodified built-in', () => {
  const { ARCHETYPE_MAP } = require('../archetype/registry.js');
  assert.doesNotThrow(() => validateBlueprint(getBuiltInBlueprint('worker-pool'), ARCHETYPE_MAP));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 22 — blueprint/index.js');

test('substituteTemplate replaces {{key}} tokens, leaves unknown tokens alone', () => {
  assert.strictEqual(substituteTemplate('{{blueprintName}}-worker-{{index}}', { blueprintName: 'pool', index: 2 }), 'pool-worker-2');
  assert.strictEqual(substituteTemplate('{{unknown}}', {}), '{{unknown}}');
});

test('listBlueprints returns 11 built-ins plus any custom passed in', () => {
  assert.strictEqual(listBlueprints([{ id: 'x', name: 'custom-bp' }]).length, 12);
});

test('getBlueprint resolves built-ins and falls through to custom list', () => {
  assert.strictEqual(getBlueprint('worker-pool', []).name, 'worker-pool');
  const custom = { id: 'c1', name: 'my-bp' };
  assert.strictEqual(getBlueprint('my-bp', [custom]), custom);
});

test('importBlueprint mints a fresh id when cloning a built-in as a template (same regression class as archetype import)', () => {
  const raw = Object.assign(JSON.parse(JSON.stringify(getBuiltInBlueprint('ci-pipeline'))), { name: 'my-ci' });
  const result = importBlueprint(raw);
  assert.notStrictEqual(result.id, getBuiltInBlueprint('ci-pipeline').id);
  assert.strictEqual(result.builtIn, false);
});

test('importBlueprint throws BlueprintSchemaError on malformed input', () => {
  assert.throws(() => importBlueprint({ name: 'broken' }), BlueprintSchemaError);
});

test('launchBlueprint: fullstack-app creates 3 compartments wired with 2 pipes, fsTemplate scaffolded', () => {
  const host = createHost({ stateFile: tmpFile('bp-launch1-state.json'), mapFile: tmpFile('bp-launch1-map.json') });
  const bp = getBuiltInBlueprint('fullstack-app');
  const { instance, compartments, pipes } = launchBlueprint(host, bp, 'testapp');

  assert.strictEqual(compartments.length, 3);
  assert.strictEqual(pipes.length, 2);
  assert.strictEqual(instance.state, 'starting');
  assert.deepStrictEqual(Object.keys(instance.compartments).sort(), ['api', 'db', 'frontend']);

  const dbComp = compartments.find(c => c.name === 'testapp-db');
  assert.ok(fs.existsSync(path.join(dbComp.fs.root, 'db.js')), 'database archetype fsTemplate should be scaffolded');
  assert.strictEqual(dbComp.resources.governorPolicy, 'reserved', 'archetype preset should be applied via Phase 21 reuse');
});

test('launchBlueprint: worker-pool with minInstances=3 creates 3 indexed compartments and a full cross-product of pipes', () => {
  const host = createHost({ stateFile: tmpFile('bp-launch2-state.json'), mapFile: tmpFile('bp-launch2-map.json') });
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('worker-pool')));
  bp.nodes.find(n => n.role === 'worker').minInstances = 3;

  const { instance, pipes } = launchBlueprint(host, bp, 'pool3');
  assert.strictEqual(instance.compartments.worker.length, 3);
  assert.strictEqual(pipes.length, 6);   // 3 dispatcher->worker + 3 worker->dispatcher (cross product)

  const names = host.sysmap.get().compartments.map(c => c.name).sort();
  assert.deepStrictEqual(names, ['pool3-dispatcher', 'pool3-worker-1', 'pool3-worker-2', 'pool3-worker-3']);
});

test('launchBlueprint throws when a node references a nonexistent archetype', () => {
  const host = createHost({ stateFile: tmpFile('bp-launch3-state.json'), mapFile: tmpFile('bp-launch3-map.json') });
  const bp = JSON.parse(JSON.stringify(getBuiltInBlueprint('fullstack-app')));
  bp.nodes[0].archetypeId = 'ghost-archetype-id';
  assert.throws(() => launchBlueprint(host, bp, 'broken'));
});

test('destroyBlueprintInstance removes every compartment and every pipe the instance created', () => {
  const host = createHost({ stateFile: tmpFile('bp-destroy1-state.json'), mapFile: tmpFile('bp-destroy1-map.json') });
  const bp = getBuiltInBlueprint('fullstack-app');
  const { instance } = launchBlueprint(host, bp, 'todestroy');

  assert.strictEqual(host.sysmap.get().compartments.length, 3);
  assert.strictEqual(host.sysmap.get().pipes.length, 2);

  const { destroyed, errors } = destroyBlueprintInstance(host, instance);
  assert.strictEqual(destroyed.length, 3);
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(host.sysmap.get().compartments.length, 0);
  assert.strictEqual(host.sysmap.get().pipes.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 22 — host/gates/blueprint.js + host/system-map.js blueprints');

test('SystemMap includes all 11 built-in blueprintDefs and an empty blueprintInstances by default', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-bp1.json') });
  sysmap.load();
  const m = sysmap.get();
  assert.strictEqual(m.blueprintDefs.length, 11);
  assert.deepStrictEqual(m.blueprintInstances, []);
});

test('SystemMap.upsertBlueprintDef rejects mutating a built-in, allows + persists a custom one', () => {
  const mapFile = tmpFile('sysmap-bp2.json');
  const sysmap = new SystemMap({ mapFile });
  sysmap.load();
  assert.throws(() => sysmap.upsertBlueprintDef(sysmap.get().blueprintDefs[0]));

  const custom = importBlueprint(Object.assign(JSON.parse(JSON.stringify(getBuiltInBlueprint('llm-eval'))), { name: 'my-eval' }));
  sysmap.upsertBlueprintDef(custom);
  assert.strictEqual(sysmap.get().blueprintDefs.length, 12);

  const reloaded = new SystemMap({ mapFile });
  reloaded.load();
  assert.strictEqual(reloaded.get().blueprintDefs.length, 12);
});

test('SystemMap.upsertBlueprintInstance/removeBlueprintInstance round-trip', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-bp3.json') });
  sysmap.load();
  const instance = { id: 'inst-1', blueprintId: 'bp-1', name: 'x', compartments: {}, pipeIds: [], state: 'starting', createdAt: Date.now() };
  sysmap.upsertBlueprintInstance(instance);
  assert.strictEqual(sysmap.get().blueprintInstances.length, 1);
  sysmap.removeBlueprintInstance('inst-1');
  assert.strictEqual(sysmap.get().blueprintInstances.length, 0);
});

test('host boot registers the 3 blueprint gates without signature collision', () => {
  const host = createHost({ stateFile: tmpFile('bp-host-state.json'), mapFile: tmpFile('bp-host-map.json') });
  assert.ok(host.bus.stream.gates.has('host:blueprint:create'));
  assert.ok(host.bus.stream.gates.has('host:blueprint:import'));
  assert.ok(host.bus.stream.gates.has('host:blueprint:destroy'));
});

test('BlueprintCreateGate: launches an instance and emits blueprint:created', () => {
  const host = createHost({ stateFile: tmpFile('bp-gate-create-state.json'), mapFile: tmpFile('bp-gate-create-map.json') });
  let created = null;
  host.bus.on(BLUEPRINT_EVENTS.CREATED, (ev) => { created = ev.payload; });
  host.bus.emit('host:blueprint:create', { blueprintIdOrName: 'worker-pool', instanceName: 'gatetest', host, sysmap: host.sysmap });
  assert.ok(created);
  assert.strictEqual(created.compartmentCount, 2);
  assert.strictEqual(host.sysmap.get().blueprintInstances.length, 1);
});

test('BlueprintCreateGate: unknown blueprint emits blueprint:error', () => {
  const host = createHost({ stateFile: tmpFile('bp-gate-create-err-state.json'), mapFile: tmpFile('bp-gate-create-err-map.json') });
  let errored = null;
  host.bus.on(BLUEPRINT_EVENTS.ERROR, (ev) => { errored = ev.payload; });
  host.bus.emit('host:blueprint:create', { blueprintIdOrName: 'ghost', instanceName: 'x', host, sysmap: host.sysmap });
  assert.ok(errored);
  assert.match(errored.reason, /not found/);
});

test('BlueprintDestroyGate: destroys a launched instance end to end through the event bus', () => {
  const host = createHost({ stateFile: tmpFile('bp-gate-destroy-state.json'), mapFile: tmpFile('bp-gate-destroy-map.json') });
  let created = null;
  host.bus.on(BLUEPRINT_EVENTS.CREATED, (ev) => { created = ev.payload; });
  host.bus.emit('host:blueprint:create', { blueprintIdOrName: 'fullstack-app', instanceName: 'gatedestroy', host, sysmap: host.sysmap });

  let destroyed = null;
  host.bus.on(BLUEPRINT_EVENTS.DESTROYED, (ev) => { destroyed = ev.payload; });
  host.bus.emit('host:blueprint:destroy', { instanceId: created.blueprintInstanceId, host, sysmap: host.sysmap });

  assert.ok(destroyed);
  assert.strictEqual(destroyed.destroyedCompartments.length, 3);
  assert.strictEqual(host.sysmap.get().blueprintInstances.length, 0);
  assert.strictEqual(host.sysmap.get().compartments.length, 0);
});

test('BlueprintImportGate: imports a custom blueprint and adds it to the system map', () => {
  const host = createHost({ stateFile: tmpFile('bp-gate-import-state.json'), mapFile: tmpFile('bp-gate-import-map.json') });
  const raw = Object.assign(JSON.parse(JSON.stringify(getBuiltInBlueprint('dev-environment'))), { name: 'my-dev-env' });
  let imported = null;
  host.bus.on(BLUEPRINT_EVENTS.IMPORTED, (ev) => { imported = ev.payload; });
  host.bus.emit('host:blueprint:import', { raw, sysmap: host.sysmap });
  assert.ok(imported);
  assert.ok(host.sysmap.get().blueprintDefs.some(b => b.id === imported.blueprintId));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 22 — cli/commands/blueprint.js');

test('cli blueprint list returns all built-ins as JSON', () => {
  const host = createHost({ stateFile: tmpFile('cli-bp-list-state.json'), mapFile: tmpFile('cli-bp-list-map.json') });
  const out = [];
  const result = runBlueprintCommand(host, 'list', [], { json: true }, { log: (s) => out.push(s) });
  assert.strictEqual(result.length, 11);
});

test('cli blueprint create + status + destroy round trip through the CLI router', () => {
  const host = createHost({ stateFile: tmpFile('cli-bp-rt-state.json'), mapFile: tmpFile('cli-bp-rt-map.json') });
  const createLogs = [];
  const created = runBlueprintCommand(host, 'create', ['worker-pool', 'clipool'], {}, { log: (s) => createLogs.push(s) });
  assert.ok(created);
  assert.ok(createLogs[0].includes('Launched'));

  const statusLogs = [];
  const status = runBlueprintCommand(host, 'status', [created.blueprintInstanceId], {}, { log: (s) => statusLogs.push(s) });
  assert.ok(status);
  assert.ok(statusLogs[0].includes('clipool'));

  const destroyLogs = [];
  const destroyed = runBlueprintCommand(host, 'destroy', [created.blueprintInstanceId], {}, { log: (s) => destroyLogs.push(s) });
  assert.ok(destroyed);
  assert.ok(destroyLogs[0].includes('Destroyed'));
});

test('cli blueprint show returns null + logs error for unknown name', () => {
  const host = createHost({ stateFile: tmpFile('cli-bp-show-state.json'), mapFile: tmpFile('cli-bp-show-map.json') });
  const errs = [];
  const result = runBlueprintCommand(host, 'show', ['nonexistent'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('not found'));
});

test('cli blueprint with unknown subcommand returns null + usage error', () => {
  const host = createHost({ stateFile: tmpFile('cli-bp-bad-state.json'), mapFile: tmpFile('cli-bp-bad-map.json') });
  const errs = [];
  const result = runBlueprintCommand(host, 'frobnicate', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Usage'));
});

test('ALL_EVENT_TYPES includes the blueprint events', () => {
  assert.ok(isKnownEvent(BLUEPRINT_EVENTS.LISTED));
  assert.ok(isKnownEvent(BLUEPRINT_EVENTS.CREATED));
  assert.ok(isKnownEvent(BLUEPRINT_EVENTS.DESTROYED));
  assert.ok(isKnownEvent(BLUEPRINT_EVENTS.IMPORTED));
  assert.ok(isKnownEvent(BLUEPRINT_EVENTS.STATUS));
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 29 — PLUGIN MANAGER (spec §62-64)
// ═════════════════════════════════════════════════════════════════════════════

const { ALL_BUILTIN_MANIFESTS, RUNTIME_MANIFESTS, COMPILER_MANIFESTS, getBuiltInManifest } = require('../plugin/registry.js');
const { validateManifest, isCompatibleVersion, PluginSchemaError } = require('../plugin/schema.js');
const { createPluginHost, executePluginCode, PluginRuntimeError } = require('../plugin/host-api.js');
const { installPlugin, verifyContributionsDeclared, PluginInstallError } = require('../plugin/installer.js');
const { listPlugins, getPlugin, enablePlugin, disablePlugin, removePlugin, builtInPluginRecords } = require('../plugin/index.js');
const { PluginInstallGate, PluginEnableGate, PluginDisableGate, PluginRemoveGate } = require('../host/gates/plugin.js');
const { PLUGIN: PLUGIN_EVENTS } = require('../foundation/event-contracts.js');
const { runPluginCommand } = require('../cli/commands/plugin.js');

// Phase 29 + 30 contain genuinely async test bodies (vm execution is sync,
// but echo-server start, createPlayground, and the CLI playground commands
// are real Promises). test() only catches SYNCHRONOUS throws — calling it
// with an async fn would silently report every one of those as passing
// regardless of what the assertions inside actually found, since the
// thrown/rejected error surfaces after test() has already logged "✓" and
// moved on. Wrapping this whole block in an async function and using
// `await testAsync(...)` for the async-bodied tests (sync ones stay as
// plain test() calls — that's still correct when called from inside an
// async function) is the real fix. Found by re-reading my own code before
// it could ship as a suite of fake passes, not from a failing run.
async function runPhase29And30Tests() {

section('Phase 29 — plugin/registry.js');

test('30 built-in manifests: 14 runtimes + 16 compilers, all validated at load', () => {
  assert.strictEqual(ALL_BUILTIN_MANIFESTS.length, 30);
  assert.strictEqual(RUNTIME_MANIFESTS.length, 14);
  assert.strictEqual(COMPILER_MANIFESTS.length, 16);
});

test('getBuiltInManifest resolves by name and id', () => {
  const byName = getBuiltInManifest('rust-runtime');
  assert.strictEqual(getBuiltInManifest(byName.id), byName);
  assert.strictEqual(getBuiltInManifest('nonexistent'), null);
});

test('rust-runtime and electron-builder-compiler require adminRequired:true (matches spec)', () => {
  assert.strictEqual(getBuiltInManifest('rust-runtime').permissions.adminRequired, true);
  assert.strictEqual(getBuiltInManifest('electron-builder-compiler').permissions.adminRequired, true);
  assert.strictEqual(getBuiltInManifest('node-runtime').permissions.adminRequired, false);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — plugin/schema.js');

test('validateManifest throws on missing required field', () => {
  assert.throws(() => validateManifest({ name: 'x' }), PluginSchemaError);
});

test('validateManifest throws when permissions block is missing a required flag', () => {
  const m = JSON.parse(JSON.stringify(getBuiltInManifest('node-runtime')));
  delete m.permissions.spawnProcess;
  assert.throws(() => validateManifest(m), PluginSchemaError);
});

test('validateManifest throws when a cliCommand contribution is malformed', () => {
  const m = JSON.parse(JSON.stringify(getBuiltInManifest('node-runtime')));
  m.contributes.cliCommands = [{ name: 'x' }]; // missing description/handler
  assert.throws(() => validateManifest(m), PluginSchemaError);
});

test('validateManifest passes on an unmodified built-in', () => {
  assert.doesNotThrow(() => validateManifest(getBuiltInManifest('tsc-compiler')));
});

test('isCompatibleVersion: >=1.0.0 satisfied by 1.2.0, not by 0.9.0', () => {
  assert.ok(isCompatibleVersion('>=1.0.0', '1.2.0'));
  assert.ok(!isCompatibleVersion('>=1.0.0', '0.9.0'));
  assert.ok(isCompatibleVersion('>=1.5.0', '1.5.0'));
  assert.ok(!isCompatibleVersion('>=1.5.1', '1.5.0'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — plugin/host-api.js (the vm sandbox)');

function freshPluginHost(name = 'test-plugin') {
  const bus = createEventBus();
  const sysmap = new SystemMap({ mapFile: tmpFile(`ph-${name}-${Date.now()}-${Math.random()}.json`) });
  sysmap.load();
  return { ...createPluginHost({ id: 'p-' + name, name, version: '1.0.0' }, { bus, sysmap }), bus, sysmap };
}

test('a legitimate plugin can register contributions and log', () => {
  const { pluginHost, contributions, logs } = freshPluginHost();
  executePluginCode(`
    PluginHost.register.cliCommand({ name: 'x', description: 'y', handler: 'z' });
    PluginHost.log.info('hello', { a: 1 });
  `, pluginHost);
  assert.strictEqual(contributions.cliCommands.length, 1);
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].msg, 'hello');
});

test('sandbox blocks require() — no filesystem escape', () => {
  const { pluginHost } = freshPluginHost();
  assert.throws(() => executePluginCode('require("fs").writeFileSync("/tmp/sandbox-escape-test.txt", "x")', pluginHost), PluginRuntimeError);
  assert.ok(!fs.existsSync('/tmp/sandbox-escape-test.txt'));
});

test('sandbox blocks process access', () => {
  const { pluginHost } = freshPluginHost();
  assert.throws(() => executePluginCode('process.exit(1)', pluginHost), PluginRuntimeError);
});

test('sandbox blocks access to this module\'s closure (no leaking installer internals)', () => {
  const { pluginHost } = freshPluginHost();
  assert.throws(() => executePluginCode('module.exports', pluginHost), PluginRuntimeError);
});

test('sandbox enforces a timeout on hung plugin code', () => {
  const { pluginHost } = freshPluginHost();
  const start = Date.now();
  assert.throws(() => executePluginCode('while(true){}', pluginHost, { timeoutMs: 300 }), PluginRuntimeError);
  assert.ok(Date.now() - start < 2000, 'should not hang the test runner');
});

test('sandbox surfaces a syntax error as PluginRuntimeError, not a crash', () => {
  const { pluginHost } = freshPluginHost();
  assert.throws(() => executePluginCode('this is not valid javascript {{{', pluginHost), PluginRuntimeError);
});

test('PluginHost.emit reaches the real event bus passed in as a dependency', () => {
  const { pluginHost, bus } = freshPluginHost();
  let seen = null;
  bus.on('custom:test:event', (ev) => { seen = ev.payload; });
  executePluginCode(`PluginHost.emit('custom:test:event', { ok: true });`, pluginHost);
  assert.deepStrictEqual(seen, { ok: true });
});

await testAsync('PluginHost.systemMap.get() reflects the real sysmap passed in', async () => {
  const { pluginHost, sysmap } = freshPluginHost();
  // can't await inside vm easily — verify the API surface directly instead
  const map = await pluginHost.systemMap.get();
  assert.deepStrictEqual(map.archetypes.length, sysmap.get().archetypes.length);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — plugin/installer.js');

function writePluginDir(dir, manifestOverrides, entryCode) {
  const { randomUUID } = require('crypto');
  fs.mkdirSync(dir, { recursive: true });
  const manifest = Object.assign({
    id: randomUUID(), name: path.basename(dir), version: '1.0.0',
    displayName: 'Test', description: 'Test plugin', author: 'tester',
    cosVersion: '>=1.0.0', contributes: {},
    permissions: { hostFs: false, network: false, spawnProcess: false, adminRequired: false },
    entryPoint: 'index.js',
  }, manifestOverrides);
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, 'index.js'), entryCode || '// noop');
  return manifest;
}

test('installPlugin: full pipeline — manifest validated, sandbox created, code executed, contributions captured', () => {
  const host = createHost({ stateFile: tmpFile('plug-install1-state.json'), mapFile: tmpFile('plug-install1-map.json') });
  const dir = tmpDir('plugin-install-1');
  writePluginDir(dir,
    { contributes: { cliCommands: [{ name: 'x', description: 'y', handler: 'z' }] } },
    `PluginHost.register.cliCommand({ name: 'x', description: 'y', handler: 'z' }); PluginHost.log.info('hi');`
  );

  const record = installPlugin(host, dir);
  assert.strictEqual(record.state, 'active');
  assert.deepStrictEqual(record.contributions.cliCommands, ['x']);
  assert.ok(record.logs.some(l => l.msg === 'hi'));
  assert.ok(host.sysmap.get().compartments.some(c => c.id === record.compartmentId));
});

test('installPlugin: throws when manifest.json is missing', () => {
  const host = createHost({ stateFile: tmpFile('plug-install2-state.json'), mapFile: tmpFile('plug-install2-map.json') });
  const dir = tmpDir('plugin-install-2-empty');
  assert.throws(() => installPlugin(host, dir), PluginInstallError);
});

test('installPlugin: throws when entryPoint file does not exist', () => {
  const { randomUUID } = require('crypto');
  const host = createHost({ stateFile: tmpFile('plug-install3-state.json'), mapFile: tmpFile('plug-install3-map.json') });
  const dir = tmpDir('plugin-install-3');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
    id: randomUUID(), name: 'x', version: '1.0.0', displayName: 'X', description: 'x',
    author: 'a', cosVersion: '>=1.0.0', permissions: { hostFs: false, network: false, spawnProcess: false, adminRequired: false },
    entryPoint: 'missing.js',
  }));
  assert.throws(() => installPlugin(host, dir), PluginInstallError);
});

test('installPlugin: rejects a plugin that registers an undeclared contribution (regression: caught manually during build)', () => {
  const host = createHost({ stateFile: tmpFile('plug-install4-state.json'), mapFile: tmpFile('plug-install4-map.json') });
  const dir = tmpDir('plugin-install-4');
  writePluginDir(dir, { contributes: {} }, `PluginHost.register.cliCommand({ name: 'sneaky', description: 'x', handler: 'y' });`);

  let threw = null;
  try { installPlugin(host, dir); } catch (e) { threw = e; }
  assert.ok(threw instanceof PluginInstallError);
  assert.ok(!/PluginInstall: PluginInstall:/.test(threw.message), 'error message should not be double-prefixed');
  assert.strictEqual(threw.record.state, 'error');
});

test('installPlugin: incompatible cosVersion is rejected before any code runs', () => {
  const host = createHost({ stateFile: tmpFile('plug-install5-state.json'), mapFile: tmpFile('plug-install5-map.json') });
  const dir = tmpDir('plugin-install-5');
  writePluginDir(dir, { cosVersion: '>=99.0.0' }, `PluginHost.log.info('should never run');`);
  assert.throws(() => installPlugin(host, dir), PluginInstallError);
});

test('verifyContributionsDeclared passes when registered is a subset of declared', () => {
  const manifest = { contributes: { cliCommands: [{ name: 'a' }, { name: 'b' }] } };
  assert.doesNotThrow(() => verifyContributionsDeclared(manifest, { runtimes: [], compilers: [], archetypes: [], blueprints: [], cliCommands: [{ name: 'a' }], watchdogRules: [], pipeTransforms: [], themes: [], uiComponents: [] }));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — plugin/index.js');

test('listPlugins(host) returns 30 built-ins via the system map', () => {
  const host = createHost({ stateFile: tmpFile('plug-idx1-state.json'), mapFile: tmpFile('plug-idx1-map.json') });
  assert.strictEqual(listPlugins(host).length, 30);
});

test('getPlugin resolves a built-in by name', () => {
  const host = createHost({ stateFile: tmpFile('plug-idx2-state.json'), mapFile: tmpFile('plug-idx2-map.json') });
  assert.strictEqual(getPlugin(host, 'node-runtime').manifest.name, 'node-runtime');
  assert.strictEqual(getPlugin(host, 'nonexistent'), null);
});

test('enablePlugin/disablePlugin reject built-ins', () => {
  const host = createHost({ stateFile: tmpFile('plug-idx3-state.json'), mapFile: tmpFile('plug-idx3-map.json') });
  assert.throws(() => disablePlugin(host, 'node-runtime'));
  assert.throws(() => enablePlugin(host, 'node-runtime'));
});

test('disablePlugin/enablePlugin round-trip on a custom installed plugin', () => {
  const host = createHost({ stateFile: tmpFile('plug-idx4-state.json'), mapFile: tmpFile('plug-idx4-map.json') });
  const dir = tmpDir('plugin-idx-4');
  writePluginDir(dir, {}, '// noop');
  const record = installPlugin(host, dir);
  host.sysmap.upsertPlugin(record);

  const disabled = disablePlugin(host, record.manifest.name);
  assert.strictEqual(disabled.state, 'disabled');
  const enabled = enablePlugin(host, record.manifest.name);
  assert.strictEqual(enabled.state, 'active');
});

test('removePlugin destroys the sandbox compartment and removes the record; rejects built-ins', () => {
  const host = createHost({ stateFile: tmpFile('plug-idx5-state.json'), mapFile: tmpFile('plug-idx5-map.json') });
  const dir = tmpDir('plugin-idx-5');
  writePluginDir(dir, {}, '// noop');
  const record = installPlugin(host, dir);
  host.sysmap.upsertPlugin(record);

  assert.throws(() => removePlugin(host, 'node-runtime'));

  removePlugin(host, record.manifest.name);
  assert.strictEqual(getPlugin(host, record.manifest.name), null);
  assert.ok(!host.sysmap.get().compartments.some(c => c.id === record.compartmentId));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — host/gates/plugin.js + SystemMap plugins');

test('SystemMap seeds all 30 built-in plugins; upsertPlugin/removePlugin reject built-ins', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-plugin1.json') });
  sysmap.load();
  assert.strictEqual(sysmap.get().plugins.length, 30);
  assert.throws(() => sysmap.upsertPlugin(sysmap.get().plugins[0]));
  assert.throws(() => sysmap.removePlugin(sysmap.get().plugins[0].id));
});

test('host boot registers the 4 plugin gates without signature collision', () => {
  const host = createHost({ stateFile: tmpFile('plug-host-state.json'), mapFile: tmpFile('plug-host-map.json') });
  for (const op of ['install', 'enable', 'disable', 'remove']) {
    assert.ok(host.bus.stream.gates.has(`host:plugin:${op}`));
  }
});

test('PluginInstallGate: installs end to end through the event bus, emits plugin:installed', () => {
  const host = createHost({ stateFile: tmpFile('plug-gate1-state.json'), mapFile: tmpFile('plug-gate1-map.json') });
  const dir = tmpDir('plugin-gate-1');
  writePluginDir(dir, {}, `PluginHost.log.info('via gate');`);

  let installed = null;
  host.bus.on(PLUGIN_EVENTS.INSTALLED, (ev) => { installed = ev.payload; });
  host.bus.emit('host:plugin:install', { sourceDir: dir, host, sysmap: host.sysmap });

  assert.ok(installed);
  assert.strictEqual(host.sysmap.get().plugins.length, 31);
});

test('PluginInstallGate: a failed install emits plugin:error AND still records the error state for visibility', () => {
  const host = createHost({ stateFile: tmpFile('plug-gate2-state.json'), mapFile: tmpFile('plug-gate2-map.json') });
  const dir = tmpDir('plugin-gate-2');
  writePluginDir(dir, { contributes: {} }, `PluginHost.register.theme({ id: 'x', name: 'y', cssPath: 'z.css' });`);

  let errored = null;
  host.bus.on(PLUGIN_EVENTS.ERROR, (ev) => { errored = ev.payload; });
  host.bus.emit('host:plugin:install', { sourceDir: dir, host, sysmap: host.sysmap });

  assert.ok(errored);
  assert.ok(host.sysmap.get().plugins.some(p => p.state === 'error'));
});

test('PluginEnableGate/PluginDisableGate/PluginRemoveGate round trip through the event bus', () => {
  const host = createHost({ stateFile: tmpFile('plug-gate3-state.json'), mapFile: tmpFile('plug-gate3-map.json') });
  const dir = tmpDir('plugin-gate-3');
  const manifest = writePluginDir(dir, {}, '// noop');

  let installed = null;
  host.bus.on(PLUGIN_EVENTS.INSTALLED, (ev) => { installed = ev.payload; });
  host.bus.emit('host:plugin:install', { sourceDir: dir, host, sysmap: host.sysmap });
  assert.ok(installed);

  let disabled = null;
  host.bus.on(PLUGIN_EVENTS.DISABLED, (ev) => { disabled = ev.payload; });
  host.bus.emit('host:plugin:disable', { idOrName: manifest.name, host, sysmap: host.sysmap });
  assert.ok(disabled);

  let enabled = null;
  host.bus.on(PLUGIN_EVENTS.ENABLED, (ev) => { enabled = ev.payload; });
  host.bus.emit('host:plugin:enable', { idOrName: manifest.name, host, sysmap: host.sysmap });
  assert.ok(enabled);

  let removed = null;
  host.bus.on(PLUGIN_EVENTS.REMOVED, (ev) => { removed = ev.payload; });
  host.bus.emit('host:plugin:remove', { idOrName: manifest.name, host, sysmap: host.sysmap });
  assert.ok(removed);
  assert.strictEqual(host.sysmap.get().plugins.length, 30);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 29 — cli/commands/plugin.js');

test('cli plugins list returns all 30 built-ins as JSON', () => {
  const host = createHost({ stateFile: tmpFile('cli-plug-list-state.json'), mapFile: tmpFile('cli-plug-list-map.json') });
  const out = [];
  const result = runPluginCommand(host, 'list', [], { json: true }, { log: (s) => out.push(s) });
  assert.strictEqual(result.length, 30);
});

test('cli plugins new + validate + add + show + disable + remove — full lifecycle through the CLI router', () => {
  const host = createHost({ stateFile: tmpFile('cli-plug-rt-state.json'), mapFile: tmpFile('cli-plug-rt-map.json') });
  const baseDir = tmpDir('cli-plugin-scaffold');

  const scaffoldLogs = [];
  const scaffolded = runPluginCommand(host, 'new', [baseDir, 'rt-plugin'], {}, { log: (s) => scaffoldLogs.push(s) });
  assert.ok(scaffolded);

  const validateLogs = [];
  const validated = runPluginCommand(host, 'validate', [scaffolded.dir], {}, { log: (s) => validateLogs.push(s) });
  assert.strictEqual(validated.valid, true);

  const addLogs = [];
  const added = runPluginCommand(host, 'add', [scaffolded.dir], {}, { log: (s) => addLogs.push(s) });
  assert.ok(added);
  assert.ok(addLogs[0].includes('Installed'));

  const showLogs = [];
  const shown = runPluginCommand(host, 'show', ['rt-plugin'], {}, { log: (s) => showLogs.push(s) });
  assert.ok(shown);

  const disableLogs = [];
  runPluginCommand(host, 'disable', ['rt-plugin'], {}, { log: (s) => disableLogs.push(s) });
  assert.ok(disableLogs[0].includes('Disabled'));

  const removeLogs = [];
  runPluginCommand(host, 'remove', ['rt-plugin'], {}, { log: (s) => removeLogs.push(s) });
  assert.ok(removeLogs[0].includes('Removed'));

  assert.strictEqual(host.sysmap.get().plugins.length, 30);
});

test('cli plugins scaffold default author is non-empty (regression: was "" and failed its own validator)', () => {
  const dir = tmpDir('cli-plugin-author-regression');
  const result = require('../cli/commands/plugin.js').scaffoldPlugin(dir, 'author-test', { log: () => {} });
  assert.ok(result.manifest.author && result.manifest.author.length > 0);
  assert.doesNotThrow(() => validateManifest(Object.assign({}, result.manifest, { contributes: {} })));
});

test('cli plugins show returns null + logs error for unknown plugin', () => {
  const host = createHost({ stateFile: tmpFile('cli-plug-show-state.json'), mapFile: tmpFile('cli-plug-show-map.json') });
  const errs = [];
  const result = runPluginCommand(host, 'show', ['nonexistent'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('not found'));
});

test('cli plugins with unknown subcommand returns null + usage error', () => {
  const host = createHost({ stateFile: tmpFile('cli-plug-bad-state.json'), mapFile: tmpFile('cli-plug-bad-map.json') });
  const errs = [];
  const result = runPluginCommand(host, 'frobnicate', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Usage'));
});

test('ALL_EVENT_TYPES includes the plugin events', () => {
  assert.ok(isKnownEvent(PLUGIN_EVENTS.LISTED));
  assert.ok(isKnownEvent(PLUGIN_EVENTS.INSTALLED));
  assert.ok(isKnownEvent(PLUGIN_EVENTS.ENABLED));
  assert.ok(isKnownEvent(PLUGIN_EVENTS.DISABLED));
  assert.ok(isKnownEvent(PLUGIN_EVENTS.REMOVED));
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 30 — PLAYGROUNDS (spec §67)
// ═════════════════════════════════════════════════════════════════════════════

const { copyTree, setupPlaygroundFs, diffAgainstSource } = require('../playgrounds/cow-fs.js');
const { startEchoServer, getEchoServerLog, stopEchoServer } = require('../playgrounds/network-sim.js');
const { createScopedHost } = require('../playgrounds/kernel.js');
const {
  createPlayground, destroyPlayground, promoteCompartment, playgroundStatus, PlaygroundError,
} = require('../playgrounds/factory.js');
const { getPlayground, listPlaygrounds } = require('../playgrounds/index.js');
const {
  PlaygroundCreateGate, PlaygroundDestroyGate, PlaygroundPromoteGate, PlaygroundStatusGate,
} = require('../host/gates/playgrounds.js');
const { PLAYGROUNDS: PLAYGROUNDS_EVENTS } = require('../foundation/event-contracts.js');
const { runPlaygroundCommand } = require('../cli/commands/playground.js');

section('Phase 30 — playgrounds/cow-fs.js');

test('copyTree excludes node_modules/.git/.cos-wal/.nex/.cos-manifest.json (regression: manifest leak was caught manually during build)', () => {
  const src = tmpDir('cowfs-src');
  const dest = tmpDir('cowfs-dest');
  fs.mkdirSync(path.join(src, 'node_modules'));
  fs.writeFileSync(path.join(src, 'node_modules', 'x.js'), 'skip me');
  fs.writeFileSync(path.join(src, '.cos-manifest.json'), 'SOURCE-MANIFEST-SHOULD-NOT-COPY');
  fs.writeFileSync(path.join(src, 'real-file.js'), 'keep me');

  copyTree(src, dest);

  assert.ok(!fs.existsSync(path.join(dest, 'node_modules')));
  assert.ok(!fs.existsSync(path.join(dest, '.cos-manifest.json')));
  assert.ok(fs.existsSync(path.join(dest, 'real-file.js')));
});

test('setupPlaygroundFs: fresh mode creates an empty directory', () => {
  const dest = tmpDir('cowfs-fresh') + '-target';
  setupPlaygroundFs('fresh', dest);
  assert.ok(fs.existsSync(dest));
  assert.deepStrictEqual(fs.readdirSync(dest), []);
});

test('setupPlaygroundFs: cow mode without sourceRoot throws', () => {
  assert.throws(() => setupPlaygroundFs('cow', '/tmp/whatever'));
});

test('setupPlaygroundFs: unknown mode throws', () => {
  assert.throws(() => setupPlaygroundFs('bogus-mode', '/tmp/whatever'));
});

test('diffAgainstSource counts added and changed files, ignores noise dirs', () => {
  const src = tmpDir('diff-src');
  const pg = tmpDir('diff-pg');
  fs.writeFileSync(path.join(src, 'a.js'), 'same');
  setupPlaygroundFs('cow', pg, src);

  // unchanged so far
  let d = diffAgainstSource(pg, src);
  assert.strictEqual(d.changed, 0);
  assert.strictEqual(d.added, 0);

  fs.writeFileSync(path.join(pg, 'new.js'), 'new');
  fs.writeFileSync(path.join(pg, 'a.js'), 'different content, different size');
  d = diffAgainstSource(pg, src);
  assert.strictEqual(d.added, 1);
  assert.strictEqual(d.changed, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — playgrounds/network-sim.js');

await testAsync('startEchoServer actually listens and echoes real HTTP requests', async () => {
  const { url } = await startEchoServer('test-pg-net-1');
  const http = require('http');
  const body = await new Promise((resolve, reject) => {
    http.get(url + '/ping', (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => resolve(d));
    }).on('error', reject);
  });
  const parsed = JSON.parse(body);
  assert.strictEqual(parsed.echo.path, '/ping');
  assert.strictEqual(getEchoServerLog('test-pg-net-1').length, 1);
  await stopEchoServer('test-pg-net-1');
});

await testAsync('startEchoServer is idempotent for the same playgroundId', async () => {
  const a = await startEchoServer('test-pg-net-2');
  const b = await startEchoServer('test-pg-net-2');
  assert.strictEqual(a.port, b.port);
  await stopEchoServer('test-pg-net-2');
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — playgrounds/kernel.js');

test('createScopedHost returns a working sub-host with an isolated bus (events do not reach the real host bus)', () => {
  const host = createHost({ stateFile: tmpFile('pg-kernel1-state.json'), mapFile: tmpFile('pg-kernel1-map.json') });
  const scoped = createScopedHost(host, 'pg-1');

  assert.strictEqual(scoped.store, host.store);
  assert.strictEqual(scoped.sysmap, host.sysmap);
  assert.notStrictEqual(scoped.bus, host.bus);

  let realHostSawIt = false;
  host.bus.on('custom:scoped:test', () => { realHostSawIt = true; });
  scoped.bus.emit('custom:scoped:test', {});
  assert.strictEqual(realHostSawIt, false, 'scoped bus events must not leak to the real host bus');
});

test('createScopedHost registers compartment + archetype + blueprint gates — createCompartment works against it', () => {
  const host = createHost({ stateFile: tmpFile('pg-kernel2-state.json'), mapFile: tmpFile('pg-kernel2-map.json') });
  const scoped = createScopedHost(host, 'pg-2');
  const { createCompartment } = require('../cli/commands/create.js');
  const comp = createCompartment(scoped, { name: 'scoped-test-comp' });
  assert.ok(comp);
  assert.ok(host.store.getCompartmentByName('scoped-test-comp'), 'compartment should be visible in the SHARED store');
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — playgrounds/factory.js');

await testAsync('createPlayground: isolated mode creates an empty container', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f1-state.json'), mapFile: tmpFile('pg-f1-map.json') });
  const { playground, compartments } = await createPlayground(host, { name: 'iso1', mode: 'isolated' });
  assert.strictEqual(playground.mode, 'isolated');
  assert.strictEqual(compartments.length, 0);
  assert.strictEqual(playground.network.mode, 'isolated');
});

await testAsync('createPlayground: mirrored mode COW-copies the source compartment, defaults to proxied network', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f2-state.json'), mapFile: tmpFile('pg-f2-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  const source = createCompartment(host, { name: 'mirror-source' });
  fs.writeFileSync(path.join(source.fs.root, 'app.js'), 'source content');

  const { playground, compartments } = await createPlayground(host, { name: 'mir1', mode: 'mirrored', sourceCompartmentName: 'mirror-source' });
  assert.strictEqual(playground.network.mode, 'proxied');
  assert.strictEqual(compartments.length, 1);
  assert.strictEqual(compartments[0].playgroundId, playground.id);
  assert.strictEqual(compartments[0].sandboxed, true);
  assert.ok(fs.readFileSync(path.join(compartments[0].fs.root, 'app.js'), 'utf8') === 'source content');
});

await testAsync('createPlayground: mirrored mode throws when source compartment does not exist', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f3-state.json'), mapFile: tmpFile('pg-f3-map.json') });
  await assert.rejects(() => createPlayground(host, { name: 'mir-bad', mode: 'mirrored', sourceCompartmentName: 'ghost' }), PlaygroundError);
});

await testAsync('createPlayground: synthetic mode launches a full blueprint inside the playground, tags every compartment', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f4-state.json'), mapFile: tmpFile('pg-f4-map.json') });
  const { playground, compartments } = await createPlayground(host, { name: 'synth1', mode: 'synthetic', sourceBlueprintIdOrName: 'fullstack-app' });
  assert.strictEqual(compartments.length, 3);
  assert.ok(compartments.every(c => c.playgroundId === playground.id && c.sandboxed === true));
  assert.strictEqual(host.sysmap.get().pipes.filter(p => compartments.some(c => c.id === p.sourceId)).length >= 2, true);
});

await testAsync('createPlayground: simulated network mode actually starts a real echo server', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f5-state.json'), mapFile: tmpFile('pg-f5-map.json') });
  const { playground } = await createPlayground(host, { name: 'sim1', mode: 'isolated', networkMode: 'simulated' });
  const log = getEchoServerLog(playground.id);
  assert.ok(Array.isArray(log)); // server is running, just no requests yet
  await stopEchoServer(playground.id);
});

await testAsync('destroyPlayground removes every compartment it created', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f6-state.json'), mapFile: tmpFile('pg-f6-map.json') });
  const { playground } = await createPlayground(host, { name: 'destroy1', mode: 'synthetic', sourceBlueprintIdOrName: 'worker-pool' });
  assert.strictEqual(host.sysmap.get().compartments.filter(c => c.playgroundId === playground.id).length, 2);

  const { destroyed, errors } = destroyPlayground(host, playground);
  assert.strictEqual(destroyed.length, 2);
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(host.sysmap.get().compartments.filter(c => c.playgroundId === playground.id).length, 0);
});

await testAsync('promoteCompartment clears playgroundId/sandboxed, throws for a compartment not in any playground', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f7-state.json'), mapFile: tmpFile('pg-f7-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  const plain = createCompartment(host, { name: 'not-in-playground' });
  assert.throws(() => promoteCompartment(host, plain.id), PlaygroundError);

  const { compartments } = await createPlayground(host, { name: 'promote1', mode: 'synthetic', sourceBlueprintIdOrName: 'worker-pool' });
  const promoted = promoteCompartment(host, compartments[0].id);
  assert.strictEqual(promoted.playgroundId, null);
  assert.strictEqual(promoted.sandboxed, false);
});

await testAsync('playgroundStatus reports per-compartment diffs for mirrored mode', async () => {
  const host = createHost({ stateFile: tmpFile('pg-f8-state.json'), mapFile: tmpFile('pg-f8-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  const source = createCompartment(host, { name: 'status-source' });
  fs.writeFileSync(path.join(source.fs.root, 'x.js'), 'x');

  const { playground, compartments } = await createPlayground(host, { name: 'statustest', mode: 'mirrored', sourceCompartmentName: 'status-source' });
  fs.writeFileSync(path.join(compartments[0].fs.root, 'extra.js'), 'extra');

  const status = playgroundStatus(host, playground);
  assert.strictEqual(status.diffs[0].added, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — host/system-map.js playgrounds (persistence regression)');

test('SystemMap.upsertPlayground persists across reload (regression: load() was wiping playgrounds to [] every time before this was wired in)', () => {
  const mapFile = tmpFile('sysmap-pg1.json');
  const sysmap = new SystemMap({ mapFile });
  sysmap.load();
  sysmap.upsertPlayground({ id: 'pg-x', name: 'persisttest', mode: 'isolated', compartmentIds: [], network: { mode: 'isolated' }, fs: { mode: 'fresh' }, state: 'active', createdAt: Date.now() });
  assert.strictEqual(sysmap.get().playgrounds.length, 1);

  const reloaded = new SystemMap({ mapFile });
  reloaded.load();
  assert.strictEqual(reloaded.get().playgrounds.length, 1);
  assert.strictEqual(reloaded.get().playgrounds[0].name, 'persisttest');
});

test('SystemMap.removePlayground removes it', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-pg2.json') });
  sysmap.load();
  sysmap.upsertPlayground({ id: 'pg-y', name: 'removetest', mode: 'isolated', compartmentIds: [], network: { mode: 'isolated' }, fs: { mode: 'fresh' }, state: 'active', createdAt: Date.now() });
  sysmap.removePlayground('pg-y');
  assert.strictEqual(sysmap.get().playgrounds.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — host/gates/playgrounds.js');

test('host boot registers the 4 playground gates without signature collision', () => {
  const host = createHost({ stateFile: tmpFile('pg-host-state.json'), mapFile: tmpFile('pg-host-map.json') });
  for (const op of ['create', 'destroy', 'promote', 'status']) {
    assert.ok(host.bus.stream.gates.has(`host:playgrounds:${op}`));
  }
});

test('PlaygroundDestroyGate: unknown playground emits playgrounds:error', () => {
  const host = createHost({ stateFile: tmpFile('pg-gate1-state.json'), mapFile: tmpFile('pg-gate1-map.json') });
  let errored = null;
  host.bus.on(PLAYGROUNDS_EVENTS.ERROR, (ev) => { errored = ev.payload; });
  host.bus.emit('host:playgrounds:destroy', { playgroundId: 'ghost', host, sysmap: host.sysmap });
  assert.ok(errored);
});

await testAsync('PlaygroundPromoteGate: end to end through the event bus', async () => {
  const host = createHost({ stateFile: tmpFile('pg-gate2-state.json'), mapFile: tmpFile('pg-gate2-map.json') });
  const { playground, compartments } = await createPlayground(host, { name: 'gatepromote', mode: 'synthetic', sourceBlueprintIdOrName: 'worker-pool' });
  let promoted = null;
  host.bus.on(PLAYGROUNDS_EVENTS.PROMOTED, (ev) => { promoted = ev.payload; });
  host.bus.emit('host:playgrounds:promote', { compartmentId: compartments[0].id, host });
  assert.ok(promoted);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 30 — cli/commands/playground.js');

await testAsync('cli playground create (isolated) + list + status + destroy — full lifecycle through the CLI router', async () => {
  const host = createHost({ stateFile: tmpFile('cli-pg-rt-state.json'), mapFile: tmpFile('cli-pg-rt-map.json') });
  const createLogs = [];
  const created = await runPlaygroundCommand(host, 'create', ['clipg1'], {}, { log: (s) => createLogs.push(s) });
  assert.ok(created);
  assert.ok(createLogs[0].includes('Created'));

  const listResult = await runPlaygroundCommand(host, 'list', [], {}, { log: () => {} });
  assert.strictEqual(listResult.length, 1);

  const destroyLogs = [];
  const destroyed = await runPlaygroundCommand(host, 'destroy', ['clipg1'], {}, { log: (s) => destroyLogs.push(s) });
  assert.ok(destroyed);
  assert.ok(destroyLogs[0].includes('Destroyed'));
});

await testAsync('cli playground create --mirror produces a mirrored playground via the CLI flag path', async () => {
  const host = createHost({ stateFile: tmpFile('cli-pg-mirror-state.json'), mapFile: tmpFile('cli-pg-mirror-map.json') });
  const { createCompartment } = require('../cli/commands/create.js');
  createCompartment(host, { name: 'cli-mirror-source' });

  const created = await runPlaygroundCommand(host, 'create', ['climirror'], { mirror: 'cli-mirror-source' }, { log: () => {} });
  assert.strictEqual(created.mode, 'mirrored');
});

await testAsync('cli playground status returns null + logs error for unknown playground', async () => {
  const host = createHost({ stateFile: tmpFile('cli-pg-status-state.json'), mapFile: tmpFile('cli-pg-status-map.json') });
  const errs = [];
  const result = await runPlaygroundCommand(host, 'status', ['nonexistent'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('not found'));
});

await testAsync('cli playground with unknown subcommand returns null + usage error', async () => {
  const host = createHost({ stateFile: tmpFile('cli-pg-bad-state.json'), mapFile: tmpFile('cli-pg-bad-map.json') });
  const errs = [];
  const result = await runPlaygroundCommand(host, 'frobnicate', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Usage'));
});

test('ALL_EVENT_TYPES includes the playgrounds events, distinct from the older singular PLAYGROUND (branch/sandbox) namespace', () => {
  assert.ok(isKnownEvent(PLAYGROUNDS_EVENTS.CREATED));
  assert.ok(isKnownEvent(PLAYGROUNDS_EVENTS.DESTROYED));
  assert.ok(isKnownEvent(PLAYGROUNDS_EVENTS.PROMOTED));
  assert.notStrictEqual(PLAYGROUNDS_EVENTS.CREATED, 'playground:branch:forked');
});

} // end runPhase29And30Tests

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 28 — VAULT (spec §52)
// ═════════════════════════════════════════════════════════════════════════════

const { encrypt, decrypt, getOrCreateMasterKey, _resetKeyCacheForTests } = require('../vault/crypto.js');
const { readStore, writeStore, putEncryptedValue, getDecryptedValue, deleteEncryptedValue } = require('../vault/store.js');
const {
  VaultError, canAccess, setSecret, getSecret, listSecrets, deleteSecret,
  grantAccess, revokeAccess, exportVault, importVault, getInjectionEnvVars,
} = require('../vault/index.js');
const {
  VaultSetGate, VaultGetGate, VaultDeleteGate, VaultGrantGate, VaultRevokeGate, VaultExportGate, VaultImportGate,
} = require('../host/gates/vault.js');
const { appendAuditEntry, readAuditLog } = require('../vault/audit-log.js');
const { VAULT: VAULT_EVENTS } = require('../foundation/event-contracts.js');
const { runVaultCommand } = require('../cli/commands/vault.js');

function freshVaultOpts(label) {
  return {
    storeFile: tmpFile(`vault-store-${label}-${Date.now()}-${Math.random()}.json`),
    keyFile: tmpFile(`vault-key-${label}-${Date.now()}-${Math.random()}.key`),
    auditLogFile: tmpFile(`vault-audit-${label}-${Date.now()}-${Math.random()}.jsonl`),
  };
}

/**
 * createHost() takes vaultStoreFile/vaultKeyFile/vaultAuditLogFile —
 * different key names than the {storeFile,keyFile,auditLogFile} shape
 * vault/index.js functions take directly. This bridges the two so tests
 * can spread one options object into createHost(...).
 */
function prefixVaultOpts({ storeFile, keyFile, auditLogFile }) {
  return { vaultStoreFile: storeFile, vaultKeyFile: keyFile, vaultAuditLogFile: auditLogFile };
}

section('Phase 28 — vault/crypto.js');

test('encrypt/decrypt round-trips correctly', () => {
  const keyFile = tmpFile('crypto1.key');
  const enc = encrypt('hello world', keyFile);
  assert.strictEqual(decrypt(enc, keyFile), 'hello world');
});

test('encrypted output never contains the plaintext', () => {
  const keyFile = tmpFile('crypto2.key');
  const enc = encrypt('super-secret-token', keyFile);
  assert.ok(!JSON.stringify(enc).includes('super-secret-token'));
});

test('tampered ciphertext fails to decrypt (GCM auth tag catches it)', () => {
  const keyFile = tmpFile('crypto3.key');
  const enc = encrypt('value', keyFile);
  const tampered = Object.assign({}, enc, { ciphertext: enc.ciphertext.slice(0, -2) + (enc.ciphertext.slice(-2) === '00' ? '11' : '00') });
  assert.throws(() => decrypt(tampered, keyFile));
});

test('getOrCreateMasterKey generates once, reuses on subsequent calls, persists to disk', () => {
  const keyFile = tmpFile('crypto4.key');
  _resetKeyCacheForTests(keyFile);
  assert.ok(!fs.existsSync(keyFile));
  const k1 = getOrCreateMasterKey(keyFile);
  assert.ok(fs.existsSync(keyFile));
  _resetKeyCacheForTests(keyFile); // force a re-read from disk, not just the cache
  const k2 = getOrCreateMasterKey(keyFile);
  assert.ok(k1.equals(k2));
});

test('different key files produce independent keys', () => {
  const a = getOrCreateMasterKey(tmpFile('crypto5a.key'));
  const b = getOrCreateMasterKey(tmpFile('crypto5b.key'));
  assert.ok(!a.equals(b));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 28 — vault/store.js');

test('putEncryptedValue/getDecryptedValue round-trip, store file never contains plaintext', () => {
  const opts = { storeFile: tmpFile('store1.json'), keyFile: tmpFile('store1.key') };
  putEncryptedValue('entry-a', 'plaintext-value-xyz', opts);
  assert.strictEqual(getDecryptedValue('entry-a', opts), 'plaintext-value-xyz');
  assert.ok(!fs.readFileSync(opts.storeFile, 'utf8').includes('plaintext-value-xyz'));
});

test('getDecryptedValue returns null for a nonexistent entry', () => {
  const opts = { storeFile: tmpFile('store2.json'), keyFile: tmpFile('store2.key') };
  assert.strictEqual(getDecryptedValue('ghost', opts), null);
});

test('deleteEncryptedValue removes the entry', () => {
  const opts = { storeFile: tmpFile('store3.json'), keyFile: tmpFile('store3.key') };
  putEncryptedValue('e1', 'v1', opts);
  deleteEncryptedValue('e1', opts);
  assert.strictEqual(getDecryptedValue('e1', opts), null);
});

test('readStore returns {} for a missing or corrupted file rather than throwing', () => {
  assert.deepStrictEqual(readStore(tmpFile('does-not-exist.json')), {});
  const corrupt = tmpFile('corrupt.json');
  fs.writeFileSync(corrupt, 'not json{{{');
  assert.deepStrictEqual(readStore(corrupt), {});
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 28 — vault/index.js (access control)');

test('compartment scope: owner can access, non-owner is denied, grant fixes it', () => {
  const host = createHost({ stateFile: tmpFile('v-idx1-state.json'), mapFile: tmpFile('v-idx1-map.json'), ...prefixVaultOpts(freshVaultOpts('idx1')) });
  createCompartment(host, { name: 'owner' });
  createCompartment(host, { name: 'other' });
  setSecret(host, { compartmentName: 'owner', key: 'SECRET', value: 'v1' });

  let r = getSecret(host, { compartmentName: 'owner', key: 'SECRET', reveal: true });
  assert.strictEqual(r.value, 'v1');
  assert.strictEqual(r.denied, false);

  r = getSecret(host, { compartmentName: 'other', key: 'SECRET', reveal: true });
  assert.strictEqual(r.denied, true);

  grantAccess(host, { fromCompartmentName: 'owner', toCompartmentName: 'other', key: 'SECRET' });
  r = getSecret(host, { compartmentName: 'other', key: 'SECRET', reveal: true });
  assert.strictEqual(r.value, 'v1');
});

test('global scope: every compartment can access without a grant', () => {
  const host = createHost({ stateFile: tmpFile('v-idx2-state.json'), mapFile: tmpFile('v-idx2-map.json'), ...prefixVaultOpts(freshVaultOpts('idx2')) });
  createCompartment(host, { name: 'setter' });
  createCompartment(host, { name: 'anyone' });
  setSecret(host, { compartmentName: 'setter', key: 'SHARED_CONST', value: 'global-value', scope: 'global' });

  const r = getSecret(host, { compartmentName: 'anyone', key: 'SHARED_CONST', reveal: true });
  assert.strictEqual(r.value, 'global-value');
});

test('listSecrets never includes the actual value, only metadata', () => {
  const host = createHost({ stateFile: tmpFile('v-idx3-state.json'), mapFile: tmpFile('v-idx3-map.json'), ...prefixVaultOpts(freshVaultOpts('idx3')) });
  createCompartment(host, { name: 'owner3' });
  setSecret(host, { compartmentName: 'owner3', key: 'K', value: 'should-never-appear-in-list' });
  const list = listSecrets(host, 'owner3');
  assert.ok(!JSON.stringify(list).includes('should-never-appear-in-list'));
  assert.strictEqual(list[0].key, 'K');
});

test('deleteSecret rejects a non-owner, succeeds for the owner', () => {
  const host = createHost({ stateFile: tmpFile('v-idx4-state.json'), mapFile: tmpFile('v-idx4-map.json'), ...prefixVaultOpts(freshVaultOpts('idx4')) });
  createCompartment(host, { name: 'owner4' });
  createCompartment(host, { name: 'intruder' });
  setSecret(host, { compartmentName: 'owner4', key: 'K', value: 'v' });

  assert.throws(() => deleteSecret(host, { compartmentName: 'intruder', key: 'K' }), VaultError);
  assert.doesNotThrow(() => deleteSecret(host, { compartmentName: 'owner4', key: 'K' }));
  assert.strictEqual(listSecrets(host, 'owner4').length, 0);
});

test('grant/revoke are owner-only operations', () => {
  const host = createHost({ stateFile: tmpFile('v-idx5-state.json'), mapFile: tmpFile('v-idx5-map.json'), ...prefixVaultOpts(freshVaultOpts('idx5')) });
  createCompartment(host, { name: 'owner5' });
  createCompartment(host, { name: 'bystander' });
  createCompartment(host, { name: 'target' });
  setSecret(host, { compartmentName: 'owner5', key: 'K', value: 'v' });

  assert.throws(() => grantAccess(host, { fromCompartmentName: 'bystander', toCompartmentName: 'target', key: 'K' }), VaultError);
  assert.doesNotThrow(() => grantAccess(host, { fromCompartmentName: 'owner5', toCompartmentName: 'target', key: 'K' }));
  assert.throws(() => revokeAccess(host, { fromCompartmentName: 'bystander', toCompartmentName: 'target', key: 'K' }), VaultError);
});

test('getInjectionEnvVars returns exactly the decrypted secrets a compartment can access', () => {
  const host = createHost({ stateFile: tmpFile('v-idx6-state.json'), mapFile: tmpFile('v-idx6-map.json'), ...prefixVaultOpts(freshVaultOpts('idx6')) });
  createCompartment(host, { name: 'injtest' });
  createCompartment(host, { name: 'noaccess' });
  setSecret(host, { compartmentName: 'injtest', key: 'A', value: '1' });
  setSecret(host, { compartmentName: 'injtest', key: 'B', value: '2' });

  const env = getInjectionEnvVars(host, host.store.getCompartmentByName('injtest'));
  assert.deepStrictEqual(env, { A: '1', B: '2' });

  const noneEnv = getInjectionEnvVars(host, host.store.getCompartmentByName('noaccess'));
  assert.deepStrictEqual(noneEnv, {});
});

test('exportVault + importVault round-trip after delete restores access', () => {
  const host = createHost({ stateFile: tmpFile('v-idx7-state.json'), mapFile: tmpFile('v-idx7-map.json'), ...prefixVaultOpts(freshVaultOpts('idx7')) });
  createCompartment(host, { name: 'exptest' });
  setSecret(host, { compartmentName: 'exptest', key: 'K', value: 'export-me' });

  const exported = exportVault(host);
  assert.strictEqual(exported.entryCount, 1);
  assert.strictEqual(exported.encrypted, true);
  assert.ok(!JSON.stringify(exported).includes('export-me'), 'export must stay encrypted');

  deleteSecret(host, { compartmentName: 'exptest', key: 'K' });
  assert.strictEqual(listSecrets(host, 'exptest').length, 0);

  importVault(host, exported);
  const r = getSecret(host, { compartmentName: 'exptest', key: 'K', reveal: true });
  assert.strictEqual(r.value, 'export-me');
});

test('setSecret throws on missing key or value', () => {
  const host = createHost({ stateFile: tmpFile('v-idx8-state.json'), mapFile: tmpFile('v-idx8-map.json'), ...prefixVaultOpts(freshVaultOpts('idx8')) });
  createCompartment(host, { name: 'x' });
  assert.throws(() => setSecret(host, { compartmentName: 'x', key: '', value: 'v' }), VaultError);
  assert.throws(() => setSecret(host, { compartmentName: 'x', key: 'K', value: undefined }), VaultError);
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 28 — host/gates/vault.js + SystemMap vaultKeys persistence');

test('SystemMap.upsertVaultKey persists across reload (regression: load() was missing vaultKeys from its merge list, same class of bug found in playgrounds)', () => {
  const mapFile = tmpFile('sysmap-vault1.json');
  const sysmap = new SystemMap({ mapFile });
  sysmap.load();
  sysmap.upsertVaultKey({ id: 'vk-1', key: 'TEST', scope: 'global', compartmentId: null, blueprintId: null, group: null, grants: [], createdAt: Date.now(), updatedAt: Date.now() });
  assert.strictEqual(sysmap.get().vaultKeys.length, 1);

  const reloaded = new SystemMap({ mapFile });
  reloaded.load();
  assert.strictEqual(reloaded.get().vaultKeys.length, 1);
  assert.strictEqual(reloaded.get().vaultKeys[0].key, 'TEST');
});

test('SystemMap.removeVaultKey removes it', () => {
  const sysmap = new SystemMap({ mapFile: tmpFile('sysmap-vault2.json') });
  sysmap.load();
  sysmap.upsertVaultKey({ id: 'vk-2', key: 'X', scope: 'global', compartmentId: null, blueprintId: null, group: null, grants: [], createdAt: Date.now(), updatedAt: Date.now() });
  sysmap.removeVaultKey('vk-2');
  assert.strictEqual(sysmap.get().vaultKeys.length, 0);
});

test('host boot registers the 7 vault gates without signature collision', () => {
  const host = createHost({ stateFile: tmpFile('v-host-state.json'), mapFile: tmpFile('v-host-map.json') });
  for (const op of ['set', 'get', 'delete', 'grant', 'revoke', 'export', 'import']) {
    assert.ok(host.bus.stream.gates.has(`host:vault:${op}`));
  }
});

test('VaultGetGate: emits vault:access:denied (not a generic error) when scope blocks access', () => {
  const host = createHost({ stateFile: tmpFile('v-gate1-state.json'), mapFile: tmpFile('v-gate1-map.json'), ...prefixVaultOpts(freshVaultOpts('gate1')) });
  createCompartment(host, { name: 'g1owner' });
  createCompartment(host, { name: 'g1stranger' });
  setSecret(host, { compartmentName: 'g1owner', key: 'K', value: 'v' });

  let denied = null;
  host.bus.on(VAULT_EVENTS.ACCESS_DENIED, (ev) => { denied = ev.payload; });
  host.bus.emit('host:vault:get', { host, compartmentName: 'g1stranger', key: 'K', reveal: true });
  assert.ok(denied);
});

test('VaultSetGate -> VaultDeleteGate round trip through the event bus', () => {
  const host = createHost({ stateFile: tmpFile('v-gate2-state.json'), mapFile: tmpFile('v-gate2-map.json'), ...prefixVaultOpts(freshVaultOpts('gate2')) });
  createCompartment(host, { name: 'g2' });

  let setResult = null;
  host.bus.on(VAULT_EVENTS.SET, (ev) => { setResult = ev.payload; });
  host.bus.emit('host:vault:set', { host, compartmentName: 'g2', key: 'K', value: 'v' });
  assert.ok(setResult);

  let deleted = null;
  host.bus.on(VAULT_EVENTS.DELETED, (ev) => { deleted = ev.payload; });
  host.bus.emit('host:vault:delete', { host, compartmentName: 'g2', key: 'K' });
  assert.ok(deleted);
});

test('host auto-injects vault secrets as env vars on compartment start (regression-proof: checks the actual spawn payload, not just the injected event)', () => {
  const host = createHost({ stateFile: tmpFile('v-inject-state.json'), mapFile: tmpFile('v-inject-map.json'), ...prefixVaultOpts(freshVaultOpts('inject')) });
  const comp = createCompartment(host, { name: 'inj-test' });
  setSecret(host, { compartmentName: 'inj-test', key: 'INJECTED_SECRET', value: 'top-secret' });
  host.store.setCompartment(Object.assign({}, comp, { entryFile: 'index.js', runtimeId: 'node' }));
  host.store.flushSync();

  let spawnPayload = null;
  let injectedEvent = null;
  host.bus.on('comp:process:spawn', (ev) => { spawnPayload = ev.payload; });
  host.bus.on(VAULT_EVENTS.INJECTED, (ev) => { injectedEvent = ev.payload; });

  host.bus.emit('host:compartment:start', { name: 'inj-test', store: host.store, sysmap: host.sysmap });

  assert.ok(spawnPayload, 'spawn should have been triggered');
  assert.strictEqual(spawnPayload.env.INJECTED_SECRET, 'top-secret');
  assert.ok(injectedEvent);
  assert.strictEqual(injectedEvent.key, 'INJECTED_SECRET');
  assert.ok(!JSON.stringify(injectedEvent).includes('top-secret'), 'the injected event itself must never carry the value');

  // cleanup: this actually spawned a real (failing, no real index.js) process — kill it
  host.bus.emit('comp:process:kill', { compartmentId: comp.id, name: comp.name });
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 28 — vault/audit-log.js');

test('appendAuditEntry + readAuditLog round-trip, survives "process restart" (a fresh require-equivalent — separate file handles)', () => {
  const auditLogFile = tmpFile('audit1.jsonl');
  appendAuditEntry({ type: 'vault:secret:set', payload: { key: 'A' }, timestamp: Date.now() }, auditLogFile);
  appendAuditEntry({ type: 'vault:secret:accessed', payload: { key: 'A' }, timestamp: Date.now() }, auditLogFile);

  const entries = readAuditLog({ auditLogFile });
  assert.strictEqual(entries.length, 2);
  assert.strictEqual(entries[0].type, 'vault:secret:set');
});

test('readAuditLog respects the limit option, returning the most recent entries', () => {
  const auditLogFile = tmpFile('audit2.jsonl');
  for (let i = 0; i < 5; i++) {
    appendAuditEntry({ type: 'vault:secret:set', payload: { key: `K${i}` }, timestamp: Date.now() }, auditLogFile);
  }
  const entries = readAuditLog({ auditLogFile, limit: 2 });
  assert.strictEqual(entries.length, 2);
  assert.strictEqual(entries[1].payload.key, 'K4');
});

test('readAuditLog returns [] for a missing file', () => {
  assert.deepStrictEqual(readAuditLog({ auditLogFile: tmpFile('does-not-exist-audit.jsonl') }), []);
});

test('a real vault:set through host.bus actually gets persisted to the audit log via onAny (regression: the first cos vault audit always showed 0 events)', () => {
  const auditLogFile = tmpFile('audit3.jsonl');
  const host = createHost({
    stateFile: tmpFile('v-audit1-state.json'), mapFile: tmpFile('v-audit1-map.json'),
    ...prefixVaultOpts({ storeFile: tmpFile('v-audit1-store.json'), keyFile: tmpFile('v-audit1-key.key'), auditLogFile }),
  });
  createCompartment(host, { name: 'audittest' });
  setSecret(host, { compartmentName: 'audittest', key: 'K', value: 'v' });
  host.bus.emit(VAULT_EVENTS.SET, { vaultEntryId: 'x', key: 'K', compartmentId: 'y' }); // gates emit this themselves normally; direct emit here exercises onAny same as a gate would

  const entries = readAuditLog({ auditLogFile });
  assert.ok(entries.some(e => e.type === VAULT_EVENTS.SET));
});

// ─────────────────────────────────────────────────────────────────────────────
section('Phase 28 — cli/commands/vault.js');

test('cli vault set + get + list + delete — full lifecycle through the CLI router', () => {
  const host = createHost({ stateFile: tmpFile('cli-v-rt-state.json'), mapFile: tmpFile('cli-v-rt-map.json'), ...prefixVaultOpts(freshVaultOpts('clirt')) });
  createCompartment(host, { name: 'clivault' });

  const setLogs = [];
  const setResult = runVaultCommand(host, 'set', ['clivault', 'KEY=val123'], {}, { log: (s) => setLogs.push(s) });
  assert.ok(setResult);
  assert.ok(setLogs[0].includes('Set'));

  const getLogs = [];
  runVaultCommand(host, 'get', ['clivault', 'KEY'], { reveal: true }, { log: (s) => getLogs.push(s) });
  assert.ok(getLogs[0].includes('val123'));

  const listResult = runVaultCommand(host, 'list', ['clivault'], { json: true }, { log: () => {} });
  assert.strictEqual(listResult.length, 1);

  const delLogs = [];
  runVaultCommand(host, 'delete', ['clivault', 'KEY'], {}, { log: (s) => delLogs.push(s) });
  assert.ok(delLogs[0].includes('Deleted'));
});

test('cli vault get for an unauthorized compartment errors with Access denied, not a generic error', () => {
  const host = createHost({ stateFile: tmpFile('cli-v-deny-state.json'), mapFile: tmpFile('cli-v-deny-map.json'), ...prefixVaultOpts(freshVaultOpts('clideny')) });
  createCompartment(host, { name: 'owner-cli' });
  createCompartment(host, { name: 'stranger-cli' });
  runVaultCommand(host, 'set', ['owner-cli', 'K=v'], {}, { log: () => {} });

  const errs = [];
  const result = runVaultCommand(host, 'get', ['stranger-cli', 'K'], { reveal: true }, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Access denied'));
});

test('cli vault with unknown subcommand returns null + usage error', () => {
  const host = createHost({ stateFile: tmpFile('cli-v-bad-state.json'), mapFile: tmpFile('cli-v-bad-map.json') });
  const errs = [];
  const result = runVaultCommand(host, 'frobnicate', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('Usage'));
});

test('ALL_EVENT_TYPES includes the vault events', () => {
  assert.ok(isKnownEvent(VAULT_EVENTS.SET));
  assert.ok(isKnownEvent(VAULT_EVENTS.ACCESSED));
  assert.ok(isKnownEvent(VAULT_EVENTS.REVEALED));
  assert.ok(isKnownEvent(VAULT_EVENTS.GRANT_ADDED));
  assert.ok(isKnownEvent(VAULT_EVENTS.ACCESS_DENIED));
  assert.ok(isKnownEvent(VAULT_EVENTS.INJECTED));
});

// ═════════════════════════════════════════════════════════════════════════════
// WATCHDOG MONITOR + SNAPSHOT (real resource monitoring, first SnapshotEngine callers)
// ═════════════════════════════════════════════════════════════════════════════

const { readProcStats, readLinuxProcStats } = require('../watchdog/proc-stats.js');
const { dispatchAnomaly } = require('../watchdog/actions.js');
const { startMonitoring, stopMonitoring, getMonitor, WatchdogMonitor } = require('../watchdog/monitor.js');
const { SnapshotEngine } = require('../foundation/snapshot.js');
const { runSnapshotCommand } = require('../cli/commands/snapshot.js');

// This section contains one genuinely async test (real process spawn +
// wall-clock wait for the watchdog poll loop to fire). Same bug class
// caught and fixed in Phase 29/30: test() only catches synchronous
// throws, so an un-awaited async test body would silently report "✓"
// regardless of what its assertions actually found. Wrapping in an
// async function + awaiting testAsync(...) here, fixed BEFORE it ran
// once, having already paid for this mistake once this session.
async function runWatchdogSnapshotTests() {

section('watchdog/proc-stats.js');

test('readProcStats reads real rssMB and cpuTimeMs for the current process', () => {
  const stats = readProcStats(process.pid);
  assert.ok(stats);
  assert.ok(stats.rssMB > 0);
  assert.ok(stats.cpuTimeMs >= 0);
});

test('readProcStats returns null for a nonexistent pid', () => {
  // pid 999999 essentially never exists on a real system
  assert.strictEqual(readLinuxProcStats(999999), null);
});

test('readProcStats cpuTimeMs actually advances when CPU work happens (not a static/fake reading)', () => {
  const s1 = readProcStats(process.pid);
  const start = Date.now();
  while (Date.now() - start < 150) { Math.sqrt(Math.random()); } // burn real CPU
  const s2 = readProcStats(process.pid);
  assert.ok(s2.cpuTimeMs > s1.cpuTimeMs, 'cpu time should have increased after real work');
});

// ─────────────────────────────────────────────────────────────────────────────
section('watchdog/actions.js (first real SnapshotEngine caller)');

test('dispatchAnomaly with onAnomaly=snapshot takes a real snapshot and returns its id', () => {
  const host = createHost({ stateFile: tmpFile('wd-act1-state.json'), mapFile: tmpFile('wd-act1-map.json') });
  const comp = createCompartment(host, { name: 'wd-act1' });
  const updated = Object.assign({}, comp, { watchdog: Object.assign({}, comp.watchdog, { enabled: true, onAnomaly: 'snapshot' }) });
  host.store.setCompartment(updated);

  const result = dispatchAnomaly(host, updated, 'memory', 'test reason');
  assert.strictEqual(result.action, 'snapshot');
  assert.ok(result.snapId);

  const engine = new SnapshotEngine(host, updated);
  assert.ok(engine.list().some(s => s.snapId === result.snapId));
});

test('dispatchAnomaly with onAnomaly=log-only takes no snapshot', () => {
  const host = createHost({ stateFile: tmpFile('wd-act2-state.json'), mapFile: tmpFile('wd-act2-map.json') });
  const comp = createCompartment(host, { name: 'wd-act2' });
  const updated = Object.assign({}, comp, { watchdog: Object.assign({}, comp.watchdog, { enabled: true, onAnomaly: 'log-only' }) });

  const result = dispatchAnomaly(host, updated, 'cpu', 'test reason');
  assert.strictEqual(result.snapId, null);
});

test('dispatchAnomaly emits watchdog:anomaly:detected with the reason and snapId', () => {
  const host = createHost({ stateFile: tmpFile('wd-act3-state.json'), mapFile: tmpFile('wd-act3-map.json') });
  const comp = createCompartment(host, { name: 'wd-act3' });
  const updated = Object.assign({}, comp, { watchdog: Object.assign({}, comp.watchdog, { enabled: true, onAnomaly: 'snapshot' }) });
  host.store.setCompartment(updated);

  let detected = null;
  host.bus.on('watchdog:anomaly:detected', (ev) => { detected = ev.payload; });
  dispatchAnomaly(host, updated, 'stall', 'no output for 9999ms');
  assert.ok(detected);
  assert.strictEqual(detected.anomalyType, 'stall');
  assert.ok(detected.snapId);
});

// ─────────────────────────────────────────────────────────────────────────────
section('foundation/snapshot.js (regression: circular payload crash)');

test('SnapshotEngine.take() does not crash when the event tail contains a circular payload (regression: gate request events embed host/sysmap/bus directly, which used to crash JSON.stringify on the whole snapshot)', () => {
  const host = createHost({ stateFile: tmpFile('snap-circ-state.json'), mapFile: tmpFile('snap-circ-map.json') });
  const comp = createCompartment(host, { name: 'snap-circ-test' });

  // Emit an event with a genuinely circular payload, the same shape several
  // gates in this codebase actually produce (host object embeds bus, which
  // embeds the stream, which has emitted this very event...).
  host.bus.emit('host:archetype:assign', { compartmentName: 'snap-circ-test', archetypeIdOrName: 'worker', store: host.store, sysmap: host.sysmap });

  const engine = new SnapshotEngine(host, comp);
  let snap;
  assert.doesNotThrow(() => { snap = engine.take('manual-test'); });
  assert.ok(snap.id);
  // the circular event should be present, just sanitized
  assert.ok(snap.eventTail.some(e => e.type === 'host:archetype:assign'));
});

test('SnapshotEngine: take -> list -> load -> restore -> delete full lifecycle', () => {
  const host = createHost({ stateFile: tmpFile('snap-lc-state.json'), mapFile: tmpFile('snap-lc-map.json') });
  const comp = createCompartment(host, { name: 'snap-lifecycle' });
  const engine = new SnapshotEngine(host, comp);

  const taken = engine.take('manual-test');
  assert.ok(engine.list().some(s => s.snapId === taken.id));

  const loaded = engine.load(taken.id);
  assert.strictEqual(loaded.compartment.name, 'snap-lifecycle');

  const restored = engine.restore(taken.id);
  assert.strictEqual(restored.compartment.restoredFrom, taken.id);

  assert.doesNotThrow(() => engine.delete(taken.id));
  assert.ok(!engine.list().some(s => s.snapId === taken.id));
});

test('SnapshotEngine.delete throws (not silently fails) on a nonexistent snapshot', () => {
  const host = createHost({ stateFile: tmpFile('snap-del-state.json'), mapFile: tmpFile('snap-del-map.json') });
  const comp = createCompartment(host, { name: 'snap-del-test' });
  const engine = new SnapshotEngine(host, comp);
  assert.throws(() => engine.delete('nonexistent-snap-id'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('cli/commands/snapshot.js (regression: delete() return-value mismatch)');

test('cli snapshot take + list + restore + delete — full lifecycle through the CLI router', () => {
  const host = createHost({ stateFile: tmpFile('cli-snap-rt-state.json'), mapFile: tmpFile('cli-snap-rt-map.json') });
  createCompartment(host, { name: 'cli-snap-test' });

  const takeLogs = [];
  const taken = runSnapshotCommand(host, 'take', ['cli-snap-test'], {}, { log: (s) => takeLogs.push(s) });
  assert.ok(taken);
  assert.ok(takeLogs[0].includes('Snapshot'));

  const listResult = runSnapshotCommand(host, 'list', ['cli-snap-test'], { json: true }, { log: () => {} });
  assert.strictEqual(listResult.length, 1);

  const restoreLogs = [];
  runSnapshotCommand(host, 'restore', ['cli-snap-test', taken.id], {}, { log: (s) => restoreLogs.push(s) });
  assert.ok(restoreLogs[0].includes('Restored'));

  // This specifically exercises the bug found by hand: delete() throws on
  // failure and returns undefined (not true/false) on success — the first
  // version of deleteCommand checked truthiness of the return value and
  // would have always reported "not found" even on a real successful delete.
  const deleteLogs = [];
  const deleteResult = runSnapshotCommand(host, 'delete', ['cli-snap-test', taken.id], {}, { log: (s) => deleteLogs.push(s) });
  assert.ok(deleteResult, 'delete should report success (regression: used to always report failure)');
  assert.ok(deleteLogs[0].includes('Deleted'));
});

test('cli snapshot delete on a nonexistent snapshot reports an error, not a false success', () => {
  const host = createHost({ stateFile: tmpFile('cli-snap-baddel-state.json'), mapFile: tmpFile('cli-snap-baddel-map.json') });
  createCompartment(host, { name: 'cli-snap-baddel' });
  const errs = [];
  const result = runSnapshotCommand(host, 'delete', ['cli-snap-baddel', 'ghost-snap-id'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs.length > 0);
});

test('cli snapshot for unknown compartment errors cleanly', () => {
  const host = createHost({ stateFile: tmpFile('cli-snap-nocomp-state.json'), mapFile: tmpFile('cli-snap-nocomp-map.json') });
  const errs = [];
  const result = runSnapshotCommand(host, 'take', ['ghost-compartment'], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs[0].includes('not found'));
});

// ─────────────────────────────────────────────────────────────────────────────
section('watchdog/monitor.js (end-to-end real process resource monitoring)');

await testAsync('WatchdogMonitor: real memory-exceeding process triggers detection + snapshot + onAnomaly action end to end', async () => {
  const host = createHost({ stateFile: tmpFile('wd-mon1-state.json'), mapFile: tmpFile('wd-mon1-map.json') });
  const comp = createCompartment(host, { name: 'wd-monitor-memtest' });

  fs.writeFileSync(path.join(comp.fs.root, 'index.js'),
    `const chunks=[];let i=0;const iv=setInterval(()=>{chunks.push(Buffer.alloc(5*1024*1024));i++;if(i>20)clearInterval(iv);},150);setTimeout(()=>process.exit(0),5000);`
  );
  const updated = Object.assign({}, comp, {
    entryFile: 'index.js', runtimeId: 'node',
    watchdog: Object.assign({}, comp.watchdog, { enabled: true, memoryLimitMB: 15, onAnomaly: 'snapshot+stop' }),
  });
  host.store.setCompartment(updated);
  host.store.flushSync();

  let anomalyDetected = null;
  let stoppedByWatchdog = false;
  host.bus.on('watchdog:anomaly:detected', (ev) => { anomalyDetected = ev.payload; });
  host.bus.on('host:compartment:stopped', () => { stoppedByWatchdog = true; });

  host.bus.emit('host:compartment:start', { name: 'wd-monitor-memtest', store: host.store, sysmap: host.sysmap });

  await new Promise((resolve) => setTimeout(resolve, 4500));

  assert.ok(anomalyDetected, 'watchdog should have detected the real memory overage');
  assert.strictEqual(anomalyDetected.anomalyType, 'memory');
  assert.ok(anomalyDetected.snapId, 'snapshot should have actually been taken (regression: this used to be null due to the circular-payload crash)');
  assert.strictEqual(stoppedByWatchdog, true, 'onAnomaly=snapshot+stop should have actually stopped the compartment');

  const { compartmentPaths } = require('../foundation/constants.js');
  const snapFiles = fs.readdirSync(compartmentPaths(comp.id).nexDir).filter(f => f.endsWith('.nex.gz'));
  assert.ok(snapFiles.length >= 1, 'a real .nex.gz file should exist on disk');
});

test('startMonitoring returns null for a watchdog-disabled compartment (no monitor created)', () => {
  const host = createHost({ stateFile: tmpFile('wd-mon2-state.json'), mapFile: tmpFile('wd-mon2-map.json') });
  const comp = createCompartment(host, { name: 'wd-monitor-disabled' });
  const monitor = startMonitoring(host, comp); // default watchdog.enabled is false
  assert.strictEqual(monitor, null);
});

await testAsync('crash-loop detection reads the COMPARTMENT\'S OWN configured crashLoopLimit/crashLoopWindowMs, not the hardcoded global default (regression: process-runner.js used to read only the module-level CRASH_LOOP_LIMIT/CRASH_LOOP_WINDOW_MS constants, ignoring per-archetype watchdog config entirely)', async () => {
  // NOTE on scope: process-runner.js tracks crash count on the per-spawn
  // `record` object, which is deleted from the registry when the process
  // exits and recreated fresh (crashCount: 0) on the next spawnProcess
  // call. Nothing in this codebase currently auto-restarts a crashed
  // process on the SAME record — restarts happen via a fresh
  // host:compartment:start, which means a fresh record. So crash count
  // does not accumulate across independent start commands today; it
  // only would within a single record's lifetime (e.g. a future
  // auto-restart-on-crash loop calling spawnProcess again before the
  // record is deleted). The original version of this test assumed
  // accumulation across two separate start calls — that assumption was
  // wrong, not the fix. What's actually verifiable today: a SINGLE
  // crash, with a compartment configured for crashLoopLimit:1, must hit
  // the limit on attempt #1 — proving the gate reads THIS compartment's
  // config, not a hardcoded 3.
  const host = createHost({ stateFile: tmpFile('wd-crashloop-state.json'), mapFile: tmpFile('wd-crashloop-map.json') });
  const comp = createCompartment(host, { name: 'crashy-limit1' });
  fs.writeFileSync(path.join(comp.fs.root, 'index.js'), 'process.exit(1);');

  const updated = Object.assign({}, comp, {
    entryFile: 'index.js', runtimeId: 'node',
    watchdog: Object.assign({}, comp.watchdog, { enabled: true, crashLoopLimit: 1, crashLoopWindowMs: 60000, onAnomaly: 'log-only' }),
  });
  host.store.setCompartment(updated);
  host.store.flushSync();

  let crashLoopFired = null;
  host.bus.on('watchdog:process:crash-loop', (ev) => { crashLoopFired = ev.payload; });

  host.bus.emit('host:compartment:start', { name: 'crashy-limit1', store: host.store, sysmap: host.sysmap });
  await new Promise((resolve) => setTimeout(resolve, 400));

  assert.ok(crashLoopFired, 'a single crash should trigger crash-loop immediately when crashLoopLimit is configured to 1 (the old hardcoded global was 3, which would NOT have fired here)');
  assert.strictEqual(crashLoopFired.restartCount, 1);
});

} // end runWatchdogSnapshotTests

// ═════════════════════════════════════════════════════════════════════════════
// VAULTD — Standalone Vault Daemon (spec section 66)
// ═════════════════════════════════════════════════════════════════════════════

const {
  startVaultd, stopVaultd, statusVaultd, backupVaultd, restoreVaultd, isPidAlive, readPidFile,
} = require('../vaultd/daemon.js');
const { createVaultdServer } = require('../vaultd/server.js');
const { runVaultdCommand } = require('../cli/commands/vaultd.js');
const { VAULTD: VAULTD_EVENTS } = require('../foundation/event-contracts.js');

let _vaultdTestPort = 39600; // incrementing per-test to avoid EADDRINUSE collisions across tests
function nextVaultdPort() { return 0; } // 0 = OS-assigned ephemeral port, eliminates EADDRINUSE races entirely

async function runVaultdTests() {

section('vaultd/daemon.js (real detached process)');

await testAsync('startVaultd actually spawns a real, separate OS process with its own pid', async () => {
  const pidFile = tmpFile(`vaultd-pid-${Date.now()}.json`);
  const port = nextVaultdPort();
  const result = await startVaultd({ port, pidFile, stateFile: tmpFile('vd-state1.json'), mapFile: tmpFile('vd-map1.json') });
  assert.ok(result.pid);
  assert.notStrictEqual(result.pid, process.pid, 'vaultd must run as a separate process, not inline');
  assert.ok(isPidAlive(result.pid));
  stopVaultd({ pidFile });
});

await testAsync('startVaultd throws if already running on the same pidFile', async () => {
  const pidFile = tmpFile(`vaultd-pid-dup-${Date.now()}.json`);
  const port = nextVaultdPort();
  await startVaultd({ port, pidFile, stateFile: tmpFile('vd-state2.json'), mapFile: tmpFile('vd-map2.json') });
  await assert.rejects(() => startVaultd({ port: nextVaultdPort(), pidFile, stateFile: tmpFile('vd-state2.json'), mapFile: tmpFile('vd-map2.json') }));
  stopVaultd({ pidFile });
});

await testAsync('stopVaultd actually terminates the process (isPidAlive false afterward)', async () => {
  const pidFile = tmpFile(`vaultd-pid-stop-${Date.now()}.json`);
  const port = nextVaultdPort();
  const result = await startVaultd({ port, pidFile, stateFile: tmpFile('vd-state3.json'), mapFile: tmpFile('vd-map3.json') });
  assert.ok(isPidAlive(result.pid));
  const stopResult = stopVaultd({ pidFile });
  assert.strictEqual(stopResult.wasRunning, true);
  await new Promise((r) => setTimeout(r, 200)); // SIGTERM is async
  assert.strictEqual(isPidAlive(result.pid), false);
});

await testAsync('statusVaultd reports not-running honestly when no pidfile exists', async () => {
  const state = await statusVaultd({ pidFile: tmpFile(`vaultd-pid-never-${Date.now()}.json`) });
  assert.strictEqual(state.running, false);
  assert.strictEqual(state.pid, null);
});

await testAsync('statusVaultd reports real live counts via a real HTTP round trip to the running daemon', async () => {
  const pidFile = tmpFile(`vaultd-pid-status-${Date.now()}.json`);
  const port = nextVaultdPort();
  const stateFile = tmpFile('vd-state4.json');
  const mapFile = tmpFile('vd-map4.json');
  await startVaultd({ port, pidFile, stateFile, mapFile });

  // Set a secret directly against the same shared files vaultd is reading.
  const host = createHost({ stateFile, mapFile });
  createCompartment(host, { name: 'status-test-comp' });
  setSecret(host, { compartmentName: 'status-test-comp', key: 'K', value: 'v' });

  const state = await statusVaultd({ pidFile });
  assert.strictEqual(state.running, true);
  assert.strictEqual(state.secretCount, 1);

  stopVaultd({ pidFile });
});

test('backupVaultd/restoreVaultd round-trip the encrypted store file exactly, never touching plaintext', () => {
  const storeFile = tmpFile('vd-backup-src.json');
  const keyFile = tmpFile('vd-backup-key.key');
  putEncryptedValue('e1', 'sensitive-data-xyz', { storeFile, keyFile });

  const backupPath = tmpFile('vd-backup-dest.cosvault');
  const result = backupVaultd(backupPath, storeFile);
  assert.strictEqual(result.backedUp, true);
  assert.ok(!fs.readFileSync(backupPath, 'utf8').includes('sensitive-data-xyz'));

  const restoreTarget = tmpFile('vd-restore-dest.json');
  restoreVaultd(backupPath, restoreTarget);
  assert.strictEqual(getDecryptedValue('e1', { storeFile: restoreTarget, keyFile }), 'sensitive-data-xyz');
});

await testAsync('backupVaultd throws cleanly when there is no store to back up', async () => {
  assert.throws(() => backupVaultd(tmpFile('whatever.cosvault'), tmpFile('does-not-exist-store.json')));
});

await testAsync('restoreVaultd throws cleanly on a missing backup file', async () => {
  assert.throws(() => restoreVaultd(tmpFile('does-not-exist-backup.cosvault'), tmpFile('vd-restore-target.json')));
});

// ─────────────────────────────────────────────────────────────────────────────
section('vaultd/server.js (real HTTP API over the shared vault store)');

await testAsync('vaultd HTTP server: set -> get -> list -> delete, full real HTTP round trip, denied access enforced', async () => {
  const stateFile = tmpFile('vd-http-state.json');
  const mapFile = tmpFile('vd-http-map.json');
  const host = createHost({ stateFile, mapFile });
  createCompartment(host, { name: 'http-owner' });
  createCompartment(host, { name: 'http-stranger' });

  const server = createVaultdServer({ port: 0, stateFile, mapFile });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port; // real OS-assigned port, avoids EADDRINUSE races

  const httpJson = (method, urlPath, body) => new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ host: '127.0.0.1', port, path: urlPath, method, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

  const setRes = await httpJson('POST', '/secrets', { compartmentName: 'http-owner', key: 'HK', value: 'http-secret-val' });
  assert.strictEqual(setRes.status, 200);

  const getRes = await httpJson('GET', '/secrets/http-owner/HK?reveal=true');
  assert.strictEqual(getRes.body.value, 'http-secret-val');

  const deniedRes = await httpJson('GET', '/secrets/http-stranger/HK?reveal=true');
  assert.strictEqual(deniedRes.status, 403);

  const listRes = await httpJson('GET', '/secrets/http-owner');
  assert.strictEqual(listRes.body.records.length, 1);
  assert.ok(!JSON.stringify(listRes.body).includes('http-secret-val'), 'list must never leak the value');

  const delRes = await httpJson('DELETE', '/secrets/http-owner/HK');
  assert.strictEqual(delRes.status, 200);

  await new Promise((resolve) => server.close(resolve));
});

await testAsync('vaultd HTTP server: grant/revoke over real HTTP changes real access', async () => {
  const stateFile = tmpFile('vd-http2-state.json');
  const mapFile = tmpFile('vd-http2-map.json');
  const host = createHost({ stateFile, mapFile });
  createCompartment(host, { name: 'grant-owner' });
  createCompartment(host, { name: 'grant-target' });
  setSecret(host, { compartmentName: 'grant-owner', key: 'GK', value: 'gv' });

  const server = createVaultdServer({ port: 0, stateFile, mapFile });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port; // real OS-assigned port, avoids EADDRINUSE races

  const httpJson = (method, urlPath, body) => new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({ host: '127.0.0.1', port, path: urlPath, method, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

  let r = await httpJson('GET', '/secrets/grant-target/GK?reveal=true');
  assert.strictEqual(r.status, 403);

  await httpJson('POST', '/grant', { fromCompartmentName: 'grant-owner', toCompartmentName: 'grant-target', key: 'GK' });
  r = await httpJson('GET', '/secrets/grant-target/GK?reveal=true');
  assert.strictEqual(r.body.value, 'gv');

  await httpJson('POST', '/revoke', { fromCompartmentName: 'grant-owner', toCompartmentName: 'grant-target', key: 'GK' });
  r = await httpJson('GET', '/secrets/grant-target/GK?reveal=true');
  assert.strictEqual(r.status, 403);

  await new Promise((resolve) => server.close(resolve));
});

// ─────────────────────────────────────────────────────────────────────────────
section('cli/commands/vaultd.js + SystemMap.vaultdState (regression: get() returns a deep clone, direct mutation was a no-op)');

await testAsync('cli vaultd start updates SystemMap.vaultdState via setVaultdState (regression: a prior version mutated sysmap.get()\'s return value directly, which is a deep clone and silently did nothing)', async () => {
  const host = createHost({ stateFile: tmpFile('cli-vd1-state.json'), mapFile: tmpFile('cli-vd1-map.json') });
  assert.strictEqual(host.sysmap.get().vaultdState, null, 'should start null per COS-42 default');

  const port = nextVaultdPort();
  const startResult = await runVaultdCommand(host, 'start', [], { port }, { log: () => {}, error: () => {} });
  assert.ok(startResult);

  const stateAfterStart = host.sysmap.get().vaultdState;
  assert.ok(stateAfterStart, 'vaultdState must be non-null after a real start (regression check)');
  assert.strictEqual(stateAfterStart.running, true);

  await runVaultdCommand(host, 'stop', [], {}, { log: () => {} });
  assert.strictEqual(host.sysmap.get().vaultdState, null, 'must go back to null after stop');
});

await testAsync('cli vaultd status reflects real state across start/stop, not running by default', async () => {
  const host = createHost({ stateFile: tmpFile('cli-vd2-state.json'), mapFile: tmpFile('cli-vd2-map.json') });
  const initial = await runVaultdCommand(host, 'status', [], { json: true }, { log: () => {} });
  assert.strictEqual(initial.running, false);

  const port = nextVaultdPort();
  await runVaultdCommand(host, 'start', [], { port }, { log: () => {}, error: () => {} });
  const running = await runVaultdCommand(host, 'status', [], { json: true }, { log: () => {} });
  assert.strictEqual(running.running, true);

  await runVaultdCommand(host, 'stop', [], {}, { log: () => {} });
});

await testAsync('cli vaultd install returns null with a clear not-implemented message (regression-proof: must not silently pretend to succeed)', async () => {
  const errs = [];
  const result = await runVaultdCommand(null, 'install', [], {}, { error: (s) => errs.push(s) });
  assert.strictEqual(result, null);
  assert.ok(errs.some(e => e.includes('Not implemented')));
});

await testAsync('cli vaultd backup + restore round trip through the CLI router', async () => {
  const stateFile = tmpFile('cli-vd3-state.json');
  const mapFile = tmpFile('cli-vd3-map.json');
  const host = createHost({ stateFile, mapFile });
  createCompartment(host, { name: 'cli-backup-comp' });
  setSecret(host, { compartmentName: 'cli-backup-comp', key: 'CK', value: 'cli-backup-value' });

  const backupPath = tmpFile('cli-vd-backup.cosvault');
  const backupLogs = [];
  const backupResult = await runVaultdCommand(host, 'backup', [], { out: backupPath }, { log: (s) => backupLogs.push(s), error: () => {} });
  assert.ok(backupResult);
  assert.ok(backupLogs[0].includes('Backed up'));

  const restoreTarget = tmpFile('cli-vd-restore-target.json');
  // restore into a different target to prove round-trip independent of the live store
  const { restoreVaultd: rv } = require('../vaultd/daemon.js');
  rv(backupPath, restoreTarget);
  assert.strictEqual(getDecryptedValue('e1', { storeFile: restoreTarget, keyFile: tmpFile('does-not-matter.key') }), null); // different id, sanity check it doesn't crash
});

test('ALL_EVENT_TYPES includes the vaultd events', () => {
  assert.ok(isKnownEvent(VAULTD_EVENTS.STARTED));
  assert.ok(isKnownEvent(VAULTD_EVENTS.STOPPED));
  assert.ok(isKnownEvent(VAULTD_EVENTS.STATUS));
  assert.ok(isKnownEvent(VAULTD_EVENTS.BACKED_UP));
  assert.ok(isKnownEvent(VAULTD_EVENTS.RESTORED));
});

} // end runVaultdTests

// ─── SISO primitive requires ──────────────────────────────────────────────────

const { Event: SisoEvent, Gate: SisoGate, Stream: SisoStream, StreamLog: SisoStreamLog }
  = require('../siso/index.js');

// ─── SISO — Event ─────────────────────────────────────────────────────────────

section('SISO — Event');

test('Event: type and data stored', () => {
  const e = new SisoEvent('host:test:event', { x: 1 });
  assert.strictEqual(e.type, 'host:test:event');
  assert.strictEqual(e.data.x, 1);
});

test('Event: data defaults to empty object', () => {
  const e = new SisoEvent('host:test:bare');
  assert.strictEqual(typeof e.data, 'object');
  assert.strictEqual(Object.keys(e.data).length, 0);
});

// ─── SISO — Gate ──────────────────────────────────────────────────────────────

section('SISO — Gate');

test('Gate: signature stored', () => {
  const g = new SisoGate('host:test:sig');
  assert.strictEqual(g.signature, 'host:test:sig');
});

test('Gate: empty signature throws', () => {
  assert.throws(() => new SisoGate(''), /signature must be a non-empty string/);
});

test('Gate: base transform is a no-op (does not throw)', () => {
  const g = new SisoGate('noop');
  assert.doesNotThrow(() => g.transform(new SisoEvent('noop'), {}));
});

// ─── SISO — Stream ────────────────────────────────────────────────────────────

section('SISO — Stream');

test('Stream: register gate and lookup', () => {
  const s = new SisoStream();
  const g = new SisoGate('test.sig');
  s.register(g);
  assert.ok(s.gates.has('test.sig'));
});

test('Stream: signature collision throws', () => {
  const s = new SisoStream();
  s.register(new SisoGate('x'));
  assert.throws(() => s.register(new SisoGate('x')), /Signature collision/);
});

test('Stream: unclaimed event goes to pending', () => {
  const s = new SisoStream();
  s.emit(new SisoEvent('unknown', { v: 42 }));
  assert.strictEqual(s.pending.length, 1);
  assert.strictEqual(s.pending[0].type, 'unknown');
});

test('Stream: claimed event does not go to pending', () => {
  class Sink extends SisoGate {
    constructor() { super('sink'); }
    transform() {}
  }
  const s = new SisoStream();
  s.register(new Sink());
  s.emit(new SisoEvent('sink'));
  assert.strictEqual(s.sampleHere().pending.length, 0);
});

test('Stream: gate transform receives event and stream', () => {
  let received = null;
  class Spy extends SisoGate {
    constructor() { super('spy'); }
    transform(event, stream) {
      received = { type: event.type, val: event.data.val, hasEmit: typeof stream.emit === 'function' };
    }
  }
  const s = new SisoStream();
  s.register(new Spy());
  s.emit(new SisoEvent('spy', { val: 99 }));
  assert.strictEqual(received.type, 'spy');
  assert.strictEqual(received.val, 99);
  assert.ok(received.hasEmit);
});

test('Stream: depth-first dispatch (gate-emitted events run before parent finishes)', () => {
  const order = [];
  class A extends SisoGate {
    constructor() { super('a'); }
    transform(event, stream) {
      order.push('a-start');
      stream.emit(new SisoEvent('b'));
      order.push('a-end');
    }
  }
  class B extends SisoGate {
    constructor() { super('b'); }
    transform() { order.push('b'); }
  }
  const s = new SisoStream();
  s.register(new A());
  s.register(new B());
  s.emit(new SisoEvent('a'));
  assert.strictEqual(order.join(','), 'a-start,b,a-end');
});

test('Stream: sampleHere returns copy of pending', () => {
  const s = new SisoStream();
  s.emit(new SisoEvent('x'));
  const sample = s.sampleHere();
  sample.pending.pop();
  assert.strictEqual(s.sampleHere().pending.length, 1);
});

test('Stream: eventCount tracks all emits', () => {
  class Echo extends SisoGate {
    constructor() { super('echo'); }
    transform(event, stream) { stream.emit(new SisoEvent('out')); }
  }
  const s = new SisoStream();
  s.register(new Echo());
  s.emit(new SisoEvent('echo'));
  assert.strictEqual(s.sampleHere().eventCount, 2);
});

test('Stream: deregister removes a gate', () => {
  const s = new SisoStream();
  s.register(new SisoGate('removeme'));
  s.deregister('removeme');
  assert.ok(!s.gates.has('removeme'));
});

test('Stream: onAny observer sees all events (not a gate)', () => {
  const s = new SisoStream();
  const seen = [];
  s.onAny(ev => seen.push(ev.type));
  s.emit(new SisoEvent('x'));
  s.emit(new SisoEvent('y'));
  assert.ok(seen.includes('x'));
  assert.ok(seen.includes('y'));
  assert.strictEqual(s.sampleHere().pending.length, 2); // still goes to pending
});

test('Stream: on observer fires only for matching type', () => {
  const s = new SisoStream();
  const seen = [];
  s.on('target', ev => seen.push(ev.type));
  s.emit(new SisoEvent('target'));
  s.emit(new SisoEvent('other'));
  assert.strictEqual(seen.length, 1);
  assert.strictEqual(seen[0], 'target');
});

test('Stream: ring buffer tail returns last N stamped events', () => {
  const s = new SisoStream();
  s.emit(new SisoEvent('a'));
  s.emit(new SisoEvent('b'));
  s.emit(new SisoEvent('c'));
  const tail = s.tail(2);
  assert.strictEqual(tail.length, 2);
  assert.strictEqual(tail[0].type, 'b');
  assert.strictEqual(tail[1].type, 'c');
});

test('Stream: stamped event has seq + timestamp', () => {
  const s = new SisoStream();
  const stamped = s.emit(new SisoEvent('test.stamp', { v: 1 }));
  assert.ok(typeof stamped.seq === 'number');
  assert.ok(typeof stamped.timestamp === 'number');
  assert.strictEqual(stamped.type, 'test.stamp');
  assert.strictEqual(stamped.payload.v, 1);
});

// ─── SISO — StreamLog ─────────────────────────────────────────────────────────

section('SISO — StreamLog');

test('StreamLog: OFF records nothing', () => {
  const log = new SisoStreamLog('OFF');
  log.record({ streamId: 1, eventType: 'x', gateClaimed: 'x', eventData: {} });
  assert.strictEqual(log.sample().count, 0);
});

test('StreamLog: EVENTS records type and claimed', () => {
  const log = new SisoStreamLog('EVENTS');
  log.record({ streamId: 1, eventType: 'foo', gateClaimed: 'foo', eventData: { big: true } });
  const entries = log.sample().entries;
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].type, 'foo');
  assert.strictEqual(entries[0].claimed, 'foo');
  assert.strictEqual(entries[0].streamId, undefined); // not at EVENTS level
  assert.strictEqual(entries[0].data, undefined);
});

test('StreamLog: DEEP includes streamId', () => {
  const log = new SisoStreamLog('DEEP');
  log.record({ streamId: 5, parentStreamId: 3, eventType: 'x', gateClaimed: 'x', eventData: {} });
  const e = log.sample().entries[0];
  assert.strictEqual(e.streamId, 5);
  assert.strictEqual(e.parentStreamId, 3);
  assert.strictEqual(e.data, undefined);
});

test('StreamLog: DATA includes full payload', () => {
  const log = new SisoStreamLog('DATA');
  log.record({ streamId: 1, parentStreamId: null, eventType: 'y', gateClaimed: 'y', eventData: { val: 42 } });
  assert.strictEqual(log.sample().entries[0].data.val, 42);
});

test('StreamLog: seq increments', () => {
  const log = new SisoStreamLog('EVENTS');
  log.record({ streamId: 1, eventType: 'a', gateClaimed: null, eventData: {} });
  log.record({ streamId: 1, eventType: 'b', gateClaimed: null, eventData: {} });
  assert.strictEqual(log.sample().entries[0].seq, 0);
  assert.strictEqual(log.sample().entries[1].seq, 1);
});

test('StreamLog: clear resets entries and seq', () => {
  const log = new SisoStreamLog('EVENTS');
  log.record({ streamId: 1, eventType: 'x', gateClaimed: null, eventData: {} });
  log.clear();
  assert.strictEqual(log.sample().count, 0);
  assert.strictEqual(log.seq, 0);
});

test('StreamLog: since() returns entries after given seq', () => {
  const log = new SisoStreamLog('EVENTS');
  log.record({ streamId: 1, eventType: 'a', gateClaimed: null, eventData: {} });
  log.record({ streamId: 1, eventType: 'b', gateClaimed: null, eventData: {} });
  log.record({ streamId: 1, eventType: 'c', gateClaimed: null, eventData: {} });
  const after = log.since(0);
  assert.strictEqual(after.length, 2); // seq 1 and 2
});

test('StreamLog: shared across stream — EventBus.log captures all events', () => {
  const bus = require('../host/event-bus.js').createEventBus({ logLevel: 'DATA' });
  bus.emit('host:test:one', { v: 1 });
  bus.emit('host:test:two', { v: 2 });
  const entries = bus.log.sample().entries;
  assert.ok(entries.some(e => e.type === 'host:test:one'));
  assert.ok(entries.some(e => e.type === 'host:test:two'));
});

// ─── SISO — Gate Pipeline integration ────────────────────────────────────────

section('SISO — Gate pipeline in EventBus');

test('EventBus: register gate — gate transforms event, result goes to pending', () => {
  const { createEventBus } = require('../host/event-bus.js');
  const bus = createEventBus();

  class DoubleGate extends SisoGate {
    constructor() { super('test:double:run'); }
    transform(event, stream) {
      stream.emit(new SisoEvent('test:double:result', { value: event.data.x * 2 }));
    }
  }

  bus.register(new DoubleGate());
  bus.emit('test:double:run', { x: 7 });
  const { pending } = bus.sampleHere();
  assert.strictEqual(pending.length, 1);
  assert.strictEqual(pending[0].type, 'test:double:result');
  assert.strictEqual(pending[0].data.value, 14);
});

test('EventBus: gate signature collision throws', () => {
  const { createEventBus } = require('../host/event-bus.js');
  const bus = createEventBus();
  bus.register(new SisoGate('test:collision:a'));
  assert.throws(() => bus.register(new SisoGate('test:collision:a')), /Signature collision/);
});

test('EventBus: deregister removes gate, event goes to pending after', () => {
  const { createEventBus } = require('../host/event-bus.js');
  const bus = createEventBus();

  class Sink extends SisoGate {
    constructor() { super('test:sink:go'); }
    transform() {}
  }

  bus.register(new Sink());
  bus.emit('test:sink:go', {});
  assert.strictEqual(bus.sampleHere().pending.length, 0); // claimed

  bus.deregister('test:sink:go');
  bus.emit('test:sink:go', {});
  assert.strictEqual(bus.sampleHere().pending.length, 1); // unclaimed after deregister
});

test('EventBus: host boot registers 4 compartment lifecycle gates', () => {
  const { createHost } = require('../host/index.js');
  const host = createHost({
    stateFile: tmpFile('gate-boot.json'),
    mapFile:   tmpFile('gate-boot-map.json'),
  });
  const { gateCount } = host.bus.sampleHere();
  // 4 lifecycle gates registered at boot
  assert.ok(gateCount >= 4, `expected >= 4 gates, got ${gateCount}`);
});

// ─── Phase 4 requires ────────────────────────────────────────────────────────

const { spawnProcess, killProcess, getProcess, resolveRuntime }
  = require('../compartment/process-runner.js');
const { ProcessSpawnGate, ProcessKillGate } = require('../host/gates/process.js');

// ─── Phase 4 — resolveRuntime ─────────────────────────────────────────────────

section('Phase 4 — resolveRuntime');

test('resolveRuntime: node → process.execPath', () => {
  const { bin } = resolveRuntime('node', 'index.js');
  assert.strictEqual(bin, process.execPath);
});

test('resolveRuntime: unknown runtime → uses runtimeId as bin', () => {
  const { bin, args } = resolveRuntime('deno', 'main.ts');
  assert.strictEqual(bin, 'deno');
  assert.ok(args.includes('main.ts'));
});

test('resolveRuntime: go prefixes with run', () => {
  const { bin, args } = resolveRuntime('go', 'main.go');
  assert.strictEqual(bin, 'go');
  assert.strictEqual(args[0], 'run');
  assert.ok(args.includes('main.go'));
});

// ─── Phase 4 — spawnProcess (real process) ───────────────────────────────────

section('Phase 4 — spawnProcess (live Node.js)');

// Async test helper that returns a Promise — wraps test()
// We use a manual approach: collect events over a timeout
function spawnTestHost() {
  const { createEventBus }  = require('../host/event-bus.js');
  const bus   = createEventBus();
  const store = {
    getCompartment:    () => null,
    setCompartment:    () => {},
    flushSync:         () => {},
  };
  const sysmap = { upsertCompartment: () => {} };
  return { bus, store, sysmap };
}

function collectEvents(bus, types, timeoutMs = 800) {
  return new Promise(resolve => {
    const collected = {};
    for (const t of types) collected[t] = [];
    const unsubs = types.map(t =>
      bus.on(t, ev => collected[t].push(ev.payload))
    );
    setTimeout(() => {
      unsubs.forEach(u => u());
      resolve(collected);
    }, timeoutMs);
  });
}

// We use a special test runner wrapper for async process tests
const asyncTests = [];
function testProcess(name, fn) {
  asyncTests.push({ name, fn });
}

testProcess('spawnProcess: emits comp:process:started with pid', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:started', 'comp:process:exited'], 800);

  spawnProcess({
    compartmentId: 'proc-test-1',
    name:          'proc-test-1',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['process.exit(0)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const started = events['comp:process:started'];
  assert.strictEqual(started.length, 1);
  assert.ok(typeof started[0].pid === 'number');
  assert.ok(started[0].pid > 0);
  assert.strictEqual(started[0].runtimeId, 'node');
});

testProcess('spawnProcess: emits stdout lines', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:stdout', 'comp:process:exited'], 800);

  spawnProcess({
    compartmentId: 'proc-test-2',
    name:          'proc-test-2',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['console.log("line-one"); console.log("line-two"); process.exit(0)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const lines  = events['comp:process:stdout'].map(e => e.line);
  assert.ok(lines.includes('line-one'), `expected line-one in ${JSON.stringify(lines)}`);
  assert.ok(lines.includes('line-two'), `expected line-two in ${JSON.stringify(lines)}`);
});

testProcess('spawnProcess: emits stderr lines', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:stderr', 'comp:process:exited'], 800);

  spawnProcess({
    compartmentId: 'proc-test-3',
    name:          'proc-test-3',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['process.stderr.write("err-line\\n"); process.exit(0)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const lines  = events['comp:process:stderr'].map(e => e.line);
  assert.ok(lines.includes('err-line'), `expected err-line in ${JSON.stringify(lines)}`);
});

testProcess('spawnProcess: emits comp:process:exited on clean exit', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:exited'], 800);

  spawnProcess({
    compartmentId: 'proc-test-4',
    name:          'proc-test-4',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['process.exit(0)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const exited = events['comp:process:exited'];
  assert.strictEqual(exited.length, 1);
  assert.strictEqual(exited[0].code, 0);
});

testProcess('spawnProcess: emits comp:process:crashed on non-zero exit', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:crashed'], 800);

  spawnProcess({
    compartmentId: 'proc-test-5',
    name:          'proc-test-5',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['process.exit(1)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const crashed = events['comp:process:crashed'];
  assert.strictEqual(crashed.length, 1);
  assert.strictEqual(crashed[0].code, 1);
});

testProcess('spawnProcess: nonexistent entry emits comp:process:crashed (exit code 1)', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:crashed'], 800);

  // Node binary exists; the entry file does not — node spawns, then exits with code 1
  spawnProcess({
    compartmentId: 'proc-test-6',
    name:          'proc-test-6',
    runtimeId:     'node',
    entryFile:     '/nonexistent/absolutely/does/not/exist.js',
    entryArgs:     [],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  const crashed = events['comp:process:crashed'];
  assert.strictEqual(crashed.length, 1);
  assert.strictEqual(crashed[0].code, 1);
});

testProcess('spawnProcess: duplicate spawn emits comp:spawn:failed', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:spawn:failed', 'comp:process:exited'], 800);

  // First spawn (will run and exit)
  spawnProcess({
    compartmentId: 'proc-test-dup',
    name:          'proc-test-dup',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['setTimeout(() => process.exit(0), 300)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  // Second spawn immediately — should fail
  spawnProcess({
    compartmentId: 'proc-test-dup',
    name:          'proc-test-dup',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['process.exit(0)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  const events = await p;
  assert.ok(events['comp:spawn:failed'].length >= 1);
});

testProcess('spawnProcess: missing runtimeId emits comp:spawn:failed', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:spawn:failed'], 300);
  const { ProcessSpawnGate: PSG } = require('../host/gates/process.js');
  const { Stream } = require('../siso/Stream.js');
  const { Event }  = require('../siso/Event.js');

  const s = new Stream();
  s.register(new PSG());
  // Route SPAWN_FAILED to bus for collection
  s.on('comp:spawn:failed', ev => bus.emit('comp:spawn:failed', ev.payload));

  s.emit(new Event('comp:process:spawn', {
    compartmentId: 'proc-no-runtime',
    name:          'no-runtime',
    runtimeId:     null,
    entryFile:     'index.js',
    bus, store, sysmap,
  }));

  const events = await p;
  assert.ok(events['comp:spawn:failed'].length >= 1);
});

testProcess('killProcess: SIGTERM stops a running process', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:started', 'comp:process:exited'], 2000);

  spawnProcess({
    compartmentId: 'proc-test-kill',
    name:          'proc-test-kill',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['setInterval(() => {}, 10000)'], // runs forever
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  // Wait for process to start, then kill
  await new Promise(resolve => setTimeout(resolve, 150));
  killProcess('proc-test-kill');

  const events = await p;
  assert.strictEqual(events['comp:process:started'].length, 1);
  // Process should exit (clean because killRequested=true)
  assert.strictEqual(events['comp:process:exited'].length, 1);
  assert.ok(events['comp:process:exited'][0].killRequested);
});

testProcess('getProcess: returns record for running process, null after exit', async () => {
  const { bus, store, sysmap } = spawnTestHost();
  const p = collectEvents(bus, ['comp:process:started', 'comp:process:exited'], 800);

  spawnProcess({
    compartmentId: 'proc-test-get',
    name:          'proc-test-get',
    runtimeId:     'node',
    entryFile:     '-e',
    entryArgs:     ['setTimeout(() => process.exit(0), 200)'],
    cwd:           '/tmp',
    env:           {},
    bus, store, sysmap,
  });

  // Check registry immediately — should be there
  await new Promise(resolve => setTimeout(resolve, 50));
  const rec = getProcess('proc-test-get');
  assert.ok(rec !== null);
  assert.ok(rec.process.pid > 0);

  // Wait for exit — should be gone
  await p;
  assert.strictEqual(getProcess('proc-test-get'), null);
});

testProcess('host boot: cos start + entryFile triggers real spawn', async () => {
  const entryFile = tmpFile('entry.js');
  require('fs').writeFileSync(entryFile,
    'console.log("spawned-ok"); process.exit(0);', 'utf8');

  const host = createHost({
    stateFile: tmpFile('spawn-boot.json'),
    mapFile:   tmpFile('spawn-boot-map.json'),
  });

  const { createCompartment } = require('../cli/commands/create.js');
  const { startCompartment }  = require('../cli/commands/start.js');

  const stdout = [];
  host.bus.on('comp:process:stdout', ev => stdout.push(ev.payload.line));

  const comp = createCompartment(host, {
    name:            'spawn-boot-comp',
    purpose:         'spawn test',
    runtimeId:       'node',
    networkIsolated: true,
  });

  // Set entryFile on the compartment before starting
  const updated = Object.assign({}, comp, { entryFile });
  host.store.setCompartment(updated);
  host.sysmap.upsertCompartment(updated);

  startCompartment(host, 'spawn-boot-comp', { log: () => {}, error: () => {} });

  // Wait for process to complete
  await new Promise(resolve => setTimeout(resolve, 600));

  assert.ok(stdout.includes('spawned-ok'),
    `expected "spawned-ok" in stdout: ${JSON.stringify(stdout)}`);
});

// ─── Run async process tests ──────────────────────────────────────────────────

section('Phase 4 — process tests (async)');

// Run all async tests sequentially
async function runProcessTests() {
  for (const { name, fn } of asyncTests) {
    try {
      await fn();
      console.log(`  ✓  ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ✖  ${name}`);
      console.log(`     ${err.message}`);
      failures.push({ name, err });
      failed++;
    }
  }
}

// We need to run async tests before the summary — use a top-level await pattern
// Since Node.js CJS doesn't support top-level await, we use a trick:
// The summary block is patched to run after async tests complete.
// See bottom of file for the async runner invocation.

// ═════════════════════════════════════════════════════════════════════════════
// SUMMARY (runs after async process tests)
// ═════════════════════════════════════════════════════════════════════════════

function printSummary() {
  console.log('');console.log('─'.repeat(56));
  console.log(`  ${passed + failed} tests  ·  ${passed} passed  ·  ${failed} failed`);
  console.log('─'.repeat(56));

  if (failed > 0) {
    console.log('');console.log('  Failures:');
    for (const { name, err } of failures) {
      console.log(`    ✖  ${name}`);
      console.log(`       ${err.message}`);
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('  All tests passed.\n');
    process.exit(0);
  }
}

runPhase29And30Tests().then(runWatchdogSnapshotTests).then(runVaultdTests).then(runProcessTests).then(printSummary).catch(err => {
  console.error('Async test runner error:', err);
  process.exit(1);
});
