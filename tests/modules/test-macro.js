'use strict';
/**
 * test-macro.js — real tests for lib/agent-tools/tools/automation/macro.js
 * against the actual module, not a reimplementation. browser_action and
 * rewind_replay are mocked at their real require paths (no live Electron
 * ClearGlass instance in this environment) so the macro tool's own real
 * logic — storage, soft-delete correctness, template substitution, URL
 * matching, and step-failure handling — gets exercised for real.
 */
process.env.JAA_DATA_DIR = require('path').join(require('os').tmpdir(), `macro-test-${Date.now()}`);

const assert = require('assert');
const path = require('path');

const mockCalls = [];
const mockBrowserAction = {
  name: 'browser_action',
  parameters: { properties: { action: { enum: ['navigate', 'dom_query', 'dom_mutate', 'get_url', 'get_title', 'screenshot', 'toast'] } } },
  execute: async ({ action, data }) => {
    mockCalls.push({ action, data });
    if (action === 'get_url') return { ok: true, result: { url: 'https://www.psychologytoday.com/us/therapists/12345' } };
    if (action === 'dom_mutate' && data.selector === '#fail-me') return { error: 'element not found: #fail-me' };
    return { ok: true, result: {} };
  },
};
const mockRewind = { execute: async ({ action }) => (action === 'snapshot' ? { ok: true, result: { snapshotId: 'snap-real-123' } } : { ok: true }) };

// Real require paths macro.js itself resolves to, from its own real
// location — registering mocks directly in the module cache under these
// exact paths, rather than fighting Node's module resolution.
const baPath = path.resolve(__dirname, '../../lib/agent-tools/tools/browser/browser-action.js');
const rewindPath = path.resolve(__dirname, '../../lib/agent-tools/tools/sandbox/rewind-replay.js');
require.cache[baPath] = { id: baPath, filename: baPath, loaded: true, exports: mockBrowserAction };
require.cache[rewindPath] = { id: rewindPath, filename: rewindPath, loaded: true, exports: mockRewind };

const macro = require('../../lib/agent-tools/tools/automation/macro.js');

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}: ${e.message}`); }
}

async function main() {
  await test('create rejects a step with an unknown browser_action', async () => {
    const r = await macro.execute({ action: 'create', name: 'bad', steps: [{ action: 'not_real', data: {} }] });
    assert.ok(r.error && r.error.includes('not a real browser_action'));
  });

  await test('create + list — real macro appears with the right shape', async () => {
    await macro.execute({
      action: 'create', name: 'contact_therapist', urlPattern: 'https://*.psychologytoday.com/*',
      params: ['therapistName'],
      steps: [{ action: 'dom_mutate', data: { selector: '#msg', value: 'Hi {{therapistName}}' } }],
    });
    const l = await macro.execute({ action: 'list' });
    assert.strictEqual(l.macros.length, 1);
    assert.strictEqual(l.macros[0].name, 'contact_therapist');
  });

  await test('duplicate create is rejected', async () => {
    const r = await macro.execute({ action: 'create', name: 'contact_therapist', steps: [{ action: 'navigate', data: { url: 'x' } }] });
    assert.ok(r.error && r.error.includes('already exists'));
  });

  await test('BUGFIX: get correctly reports gone after delete (soft-delete row ordering)', async () => {
    await macro.execute({ action: 'create', name: 'to_delete', steps: [{ action: 'navigate', data: { url: 'x' } }] });
    await macro.execute({ action: 'delete', name: 'to_delete' });
    const g = await macro.execute({ action: 'get', name: 'to_delete' });
    assert.ok(g.error && g.error.includes('no macro named'), `expected a real "gone" error, got ${JSON.stringify(g)}`);
  });

  await test('BUGFIX: list correctly excludes a deleted macro', async () => {
    const l = await macro.execute({ action: 'list' });
    assert.ok(!l.macros.find(m => m.name === 'to_delete'), 'deleted macro must not appear in list()');
  });

  await test('a name can be reused after real deletion', async () => {
    const r = await macro.execute({ action: 'create', name: 'to_delete', steps: [{ action: 'navigate', data: { url: 'y' } }] });
    assert.strictEqual(r.ok, true);
  });

  await test('run — real param substitution reaches browser_action, URL pattern matches', async () => {
    mockCalls.length = 0;
    const r = await macro.execute({ action: 'run', name: 'contact_therapist', agentId: 'tab-1', params: { therapistName: 'Dr. Smith' } });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.snapshotId, 'snap-real-123');
    const mutateCall = mockCalls.find(c => c.action === 'dom_mutate');
    assert.strictEqual(mutateCall.data.value, 'Hi Dr. Smith', 'the real {{therapistName}} placeholder must be substituted');
  });

  await test('run — a missing required param is rejected before anything dispatches', async () => {
    mockCalls.length = 0;
    const r = await macro.execute({ action: 'run', name: 'contact_therapist', agentId: 'tab-1', params: {} });
    assert.ok(r.error && r.error.includes('therapistName'));
    assert.strictEqual(mockCalls.length, 0, 'nothing should have been dispatched to browser_action');
  });

  await test('run — a mid-macro step failure stops the run, reports the exact step, keeps the snapshot for rollback', async () => {
    await macro.execute({ action: 'create', name: 'fails_midway', steps: [
      { action: 'navigate', data: { url: 'https://x' } },
      { action: 'dom_mutate', data: { selector: '#fail-me', value: 'x' } },
      { action: 'navigate', data: { url: 'https://never-reached' } },
    ] });
    const r = await macro.execute({ action: 'run', name: 'fails_midway', agentId: 'tab-1', params: {} });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.failedAtStep, 1);
    assert.strictEqual(r.stepsCompleted, 1);
    assert.strictEqual(r.snapshotId, 'snap-real-123', 'the rollback point must still be reported even on failure');
  });

  await test('run — a URL pattern mismatch is rejected before any step runs', async () => {
    await macro.execute({ action: 'create', name: 'wrong_site', urlPattern: 'https://only-this-site.example.com/*', steps: [{ action: 'navigate', data: { url: 'x' } }] });
    mockCalls.length = 0;
    const r = await macro.execute({ action: 'run', name: 'wrong_site', agentId: 'tab-1', params: {} });
    assert.ok(r.error && r.error.includes('requires a URL matching'));
  });

  await test('bookmark — a real, labeled rewind snapshot', async () => {
    const r = await macro.execute({ action: 'bookmark', agentId: 'tab-1', label: 'before-applying' });
    assert.strictEqual(r.result.snapshotId, 'snap-real-123');
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

main();
