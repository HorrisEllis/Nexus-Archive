'use strict';
/**
 * tests/dispatcher-agent-tab-trigger.test.js
 *
 * §FIX 2026-09-23 — James, direct, against his own real boot log: "i
 * tried to use this cli as agent. it didn't open the tab."
 *
 * Traced: guardian/lib/dispatcher.js's pushTab(provider, job.agentId)
 * missed (no tab had ever registered under that agentId — confirmed
 * against the real log: the job fell back to the shared active chatgpt
 * tab, which was already busy with a 77-chunk build, and timed out
 * after 900000ms). TR2 (0.39.218) built providerHost.ensureAgentTab()
 * but nothing ever called it — "capability without a trigger," named
 * plainly in that commit's own note. This is the trigger: on a pushTab
 * miss, dispatcher.js now fires spawnProviderTab(provider, {agentId})
 * (guardian/clear-glass-bridge.js — already real, already tested, whose
 * opts already reach providerHost.start() the same way ensureAgentTab()
 * itself does internally — checked before reusing it, not assumed).
 *
 * Uses require.cache substitution to spy on clear-glass-bridge.js's real
 * export — the same technique already proven this session for cross-
 * process JAA tests — rather than a real HTTP call to a Clear Glass
 * instance this sandbox does not have running.
 */
const assert = require('assert');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BRIDGE_PATH = require.resolve(path.join(ROOT, 'guardian', 'clear-glass-bridge.js'));
const DISPATCHER_PATH = require.resolve(path.join(ROOT, 'guardian', 'lib', 'dispatcher.js'));

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function freshDispatcherWithFakeBridge(spawnProviderTabImpl) {
  delete require.cache[DISPATCHER_PATH];
  require.cache[BRIDGE_PATH] = {
    id: BRIDGE_PATH, filename: BRIDGE_PATH, loaded: true, exports: {
      dispatchBrowserCommand: async () => ({ ok: false, error: 'not used in this test' }),
      spawnProviderTab: spawnProviderTabImpl,
      _responseTypeFor: () => null,
    },
  };
  const { createDispatcher } = require(DISPATCHER_PATH);
  return createDispatcher;
}

function makeDeps(pushTabReturns, pushActiveReturns = 1) {
  const updates = [];
  const emitted = [];
  const pendingQueue = new Map();
  const listeners = new Map();
  const bus = {
    emit: (name, payload) => { emitted.push({ name, payload }); for (const fn of listeners.get(name) || []) fn({ data: payload }); },
    on: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    off: (name, fn) => { listeners.get(name)?.delete(fn); },
  };
  const pushTabCalls = [];
  return {
    deps: {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus,
      ncp: {
        isConnected: () => true,
        push: () => pushActiveReturns,
        pushActive: () => pushActiveReturns,
        pushTab: (provider, tabId, data) => { pushTabCalls.push({ provider, tabId, data }); return pushTabReturns; },
      },
      pendingQueue,
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => Promise.resolve(),
      pingTimeoutMs: 20,
    },
    updates, emitted, pendingQueue, pushTabCalls,
  };
}

async function main() {
  await test('AT-001', 'a pushTab miss with a real agentId fires spawnProviderTab(provider, {agentId}) — the actual missing trigger', async () => {
    const spawnCalls = [];
    let resolveSpawn;
    const spawnDone = new Promise(r => { resolveSpawn = r; });
    const createDispatcher = freshDispatcherWithFakeBridge(async (provider, opts) => {
      spawnCalls.push({ provider, opts });
      resolveSpawn();
      return { ok: true, provider: { id: provider } };
    });
    const { deps } = makeDeps(false, 1); // pushTab misses, pushActive succeeds
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-1', provider: 'chatgpt', command: 'ask', agentId: 'repo-abc123' };

    await dispatcher._doDispatch(job);
    await spawnDone; // the trigger is fire-and-forget — wait for its own microtask

    assert.strictEqual(spawnCalls.length, 1, 'spawnProviderTab must be called exactly once on a real pushTab miss');
    assert.strictEqual(spawnCalls[0].provider, 'chatgpt');
    assert.strictEqual(spawnCalls[0].opts.agentId, 'repo-abc123', 'the real repo agentId must be the one passed through, not lost');
    assert.strictEqual(spawnCalls[0].opts.show, false, 'the opened tab must be hidden by default, matching TR2\'s own design (not a surprise visible window)');
  });

  await test('AT-002', 'this job STILL dispatches via the documented pushActive fallback — no regression to the job actually in flight', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: true }));
    const { deps, updates } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-2', provider: 'chatgpt', command: 'ask', agentId: 'repo-def456' };

    await dispatcher._doDispatch(job);

    const deliveredUpdate = updates.find(u => u.patch.status === 'delivered');
    assert.ok(deliveredUpdate, 'the in-flight job must still be marked delivered via the existing pushActive fallback — this fix must not change today\'s behaviour for the current job');
  });

  await test('AT-003', 'a pushTab HIT never calls spawnProviderTab — the trigger only fires on a genuine miss, not on every dispatch', async () => {
    const spawnCalls = [];
    const createDispatcher = freshDispatcherWithFakeBridge(async (provider, opts) => { spawnCalls.push({ provider, opts }); return { ok: true }; });
    const { deps } = makeDeps(true); // pushTab HITS
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-3', provider: 'chatgpt', command: 'ask', agentId: 'repo-already-open' };

    await dispatcher._doDispatch(job);
    await new Promise(r => setTimeout(r, 20));

    assert.strictEqual(spawnCalls.length, 0, 'a repo that already has a live, connected tab must not trigger another spawn attempt');
  });

  await test('AT-004', 'no agentId at all (a non-repo job) never calls spawnProviderTab — there is no repo tab to open', async () => {
    const spawnCalls = [];
    const createDispatcher = freshDispatcherWithFakeBridge(async (provider, opts) => { spawnCalls.push({ provider, opts }); return { ok: true }; });
    const { deps } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-4', provider: 'chatgpt', command: 'ping' }; // no agentId

    await dispatcher._doDispatch(job);
    await new Promise(r => setTimeout(r, 20));

    assert.strictEqual(spawnCalls.length, 0, 'a job with no agentId has no repo tab to open, and must not attempt one');
  });

  await test('AT-005', 'spawnProviderTab failing (e.g. Clear Glass unreachable) is non-fatal — the job\'s own dispatch is unaffected', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => { throw new Error('Clear Glass unreachable (simulated)'); });
    const { deps, updates } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-5', provider: 'chatgpt', command: 'ask', agentId: 'repo-ghi789' };

    await dispatcher._doDispatch(job); // must not throw
    await new Promise(r => setTimeout(r, 20));

    const deliveredUpdate = updates.find(u => u.patch.status === 'delivered');
    assert.ok(deliveredUpdate, 'the job must still deliver via the fallback even when the tab-open attempt itself throws');
  });

  // cleanup — leave the module cache as this file found it
  delete require.cache[DISPATCHER_PATH];
  delete require.cache[BRIDGE_PATH];

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
  // §NOTE — createDispatcher's internal pool leaves an open handle across
  // 5 fresh instances in this file (require.cache churn); forced exit
  // rather than chasing it, matching established precedent elsewhere in
  // this suite (tests/brutal.test.js, tests/full.test.js) for the same
  // class of harmless leftover timer.
  process.exit(process.exitCode);
}

main();
