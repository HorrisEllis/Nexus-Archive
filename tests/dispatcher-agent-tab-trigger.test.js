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
 * §ONE-TAB 0.39.237 — James, against his 2026-09-25 log: "it shouldn't be
 * opening two instances." The contract AT-002/AT-005 used to pin (a repo job
 * ALSO goes to the shared tab while its own tab opens) is exactly what put two
 * ChatGPT windows on screen. Reversed here: a repo job goes to its own tab or
 * waits for it; the shared tab is a recorded, loud fallback only when Clear
 * Glass cannot open the repo tab or it does not connect in time.
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

function makeDeps(pushTabReturns, pushActiveReturns = 1, { connected = true } = {}) {
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
  const pushActiveCalls = [];
  return {
    deps: {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus,
      ncp: {
        isConnected: () => (typeof connected === 'function' ? connected() : connected),
        push: () => pushActiveReturns,
        pushActive: (provider, data) => { pushActiveCalls.push({ provider, data }); return pushActiveReturns; },
        pushTab: (provider, tabId, data) => { pushTabCalls.push({ provider, tabId, data }); return typeof pushTabReturns === 'function' ? pushTabReturns(provider, tabId) : pushTabReturns; },
      },
      pendingQueue,
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => Promise.resolve(),
      pingTimeoutMs: 20,
    },
    updates, emitted, pendingQueue, pushTabCalls, pushActiveCalls,
  };
}

const POOL = () => require(path.join(ROOT, 'guardian', 'lib', 'dispatch-pool')).pool;
function releasePool(provider, jobId) { POOL().complete(provider, jobId); } // server wires this via dispatch-pool-bridge; the test has no bridge
async function waitFor(fn, ms = 1500) {
  const until = Date.now() + ms;
  while (!fn()) { if (Date.now() > until) throw new Error('timed out waiting for the expected dispatch'); await new Promise(r => setTimeout(r, 10)); }
}
function withWait(ms, make) {
  const prev = process.env.GUARDIAN_AGENT_TAB_WAIT_MS;
  process.env.GUARDIAN_AGENT_TAB_WAIT_MS = String(ms);
  try { return make(); } finally { if (prev === undefined) delete process.env.GUARDIAN_AGENT_TAB_WAIT_MS; else process.env.GUARDIAN_AGENT_TAB_WAIT_MS = prev; }
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

  await test('AT-002', 'a pushTab miss does NOT send the job to the shared tab — it waits, queued with the reason, for its own tab', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: true }));
    const { deps, updates, pushActiveCalls, pendingQueue } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-2', provider: 'chatgpt', command: 'ask', agentId: 'repo-def456' };

    const r = await dispatcher._doDispatch(job);

    assert.strictEqual(r, false, '_doDispatch must report not-delivered while the job waits');
    assert.strictEqual(pushActiveCalls.length, 0, 'the shared tab must not receive a repo job while its own tab is being opened — that was the second instance');
    assert.ok(!updates.some(u => u.patch.status === 'delivered'), 'the job must not be marked delivered');
    const q = updates.find(u => u.patch.status === 'queued');
    assert.ok(q && /repo-def456's own chatgpt tab/.test(q.patch.queueReason), `queueReason must name whose tab it waits for, got: ${q && q.patch.queueReason}`);
    assert.deepStrictEqual((pendingQueue.get('chatgpt') || []).map(j => j.id), ['job-2'], 'the job must be in the provider queue that flushQueuedJobs drains on connect');
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

  await test('AT-005', 'spawnProviderTab throwing falls back to the shared tab — loudly, with the reason on the .job and an event', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => { throw new Error('Clear Glass unreachable (simulated)'); });
    const { deps, updates, emitted, pushActiveCalls } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-5', provider: 'chatgpt', command: 'ask', agentId: 'repo-ghi789' };

    await dispatcher._doDispatch(job); // must not throw
    await waitFor(() => pushActiveCalls.length > 0);
    releasePool('chatgpt', 'job-5');

    assert.strictEqual(pushActiveCalls.length, 1, 'with evidence the repo tab cannot come, the job goes to the shared tab exactly once');
    const fb = updates.find(u => u.patch.agentTabFallback);
    assert.ok(fb && /spawnProviderTab threw: Clear Glass unreachable/.test(fb.patch.transportFallbackReason), `the .job must carry the reason, got: ${fb && fb.patch.transportFallbackReason}`);
    assert.ok(emitted.some(e => e.name === 'guardian.job.agent_tab_fallback' && e.payload.jobId === 'job-5'), 'the fallback must be emitted, not silent');
    assert.ok(updates.some(u => u.patch.status === 'delivered'), 'the job is delivered via the fallback');
  });

  await test('AT-006', 'Clear Glass answering ok:false is also evidence — fallback with its error as the reason', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: false, error: 'provider window blocked (simulated)' }));
    const { deps, updates, pushActiveCalls } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-6', provider: 'chatgpt', command: 'ask', agentId: 'repo-jkl012' };

    await dispatcher._doDispatch(job);
    await waitFor(() => pushActiveCalls.length > 0);
    releasePool('chatgpt', 'job-6');

    const fb = updates.find(u => u.patch.agentTabFallback);
    assert.ok(fb && /provider window blocked/.test(fb.patch.transportFallbackReason), 'the Clear Glass error must be the recorded reason');
  });

  await test('AT-007', 'the repo tab never connecting → after GUARDIAN_AGENT_TAB_WAIT_MS the job falls back, reason says so', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: true })); // opened, but never connects
    const { deps, updates, pushActiveCalls } = makeDeps(false, 1);
    const dispatcher = withWait(1000, () => createDispatcher(deps));
    const job = { id: 'job-7', provider: 'chatgpt', command: 'ask', agentId: 'repo-slow' };

    await dispatcher._doDispatch(job);
    await new Promise(r => setTimeout(r, 300));
    assert.strictEqual(pushActiveCalls.length, 0, 'before the deadline the job still waits');
    await waitFor(() => pushActiveCalls.length > 0, 2500);
    releasePool('chatgpt', 'job-7');

    const fb = updates.find(u => u.patch.agentTabFallback);
    assert.ok(fb && /not connected within 1000ms/.test(fb.patch.transportFallbackReason), `got: ${fb && fb.patch.transportFallbackReason}`);
  });

  await test('AT-008', 'the repo tab connecting in time → delivered to THAT tab, the shared tab never touched, the deadline never fires', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: true }));
    let tabUp = false;
    const { deps, updates, emitted, pushActiveCalls, pushTabCalls } = makeDeps((prov, tabId) => tabUp && tabId === 'repo-fast', 1);
    const dispatcher = withWait(1000, () => createDispatcher(deps));
    const job = { id: 'job-8', provider: 'chatgpt', command: 'ask', agentId: 'repo-fast' };

    await dispatcher._doDispatch(job);            // miss → waits
    tabUp = true;                                 // the repo tab registers under tabId=agentId
    await dispatcher._doDispatch(job);            // what flushQueuedJobs does on that connect
    await new Promise(r => setTimeout(r, 1400));  // past the deadline

    assert.ok(updates.some(u => u.patch.status === 'delivered'), 'delivered once its tab connected');
    assert.strictEqual(pushTabCalls.filter(c => c.tabId === 'repo-fast').length, 2, 'both attempts aimed at the repo tab');
    assert.strictEqual(pushActiveCalls.length, 0, 'the shared tab must never see this job');
    assert.ok(!emitted.some(e => e.name === 'guardian.job.agent_tab_fallback'), 'a delivered job must not fall back when its old deadline passes');
  });

  await test('AT-009', 'cold start (no tab for the provider at all) opens the REPO tab, never the shared window', async () => {
    const spawnCalls = [];
    const createDispatcher = freshDispatcherWithFakeBridge(async (provider, opts) => { spawnCalls.push({ provider, opts }); return { ok: true }; });
    const { deps } = makeDeps(false, 1, { connected: false });
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-9', provider: 'chatgpt', command: 'ask', agentId: 'repo-cold' };

    const http = require('http'); const realRequest = http.request; const sharedStarts = [];
    http.request = (opts, cb) => { sharedStarts.push(opts.path); return realRequest.call(http, opts, cb); };
    try { await dispatcher._doDispatch(job); await new Promise(r => setTimeout(r, 30)); }
    finally { http.request = realRequest; }

    assert.deepStrictEqual(sharedStarts.filter(p => /\/providers\/chatgpt\/start$/.test(p || '')), [], 'the shared-window start request must not be sent for a repo job');
    assert.strictEqual(spawnCalls.length, 1);
    assert.strictEqual(spawnCalls[0].opts.agentId, 'repo-cold', 'the repo tab is what gets opened');
  });

  await test('AT-010', 'a job that misses repeatedly is queued once, not once per miss', async () => {
    const createDispatcher = freshDispatcherWithFakeBridge(async () => ({ ok: true }));
    const { deps, pendingQueue } = makeDeps(false, 1);
    const dispatcher = createDispatcher(deps);
    const job = { id: 'job-10', provider: 'chatgpt', command: 'ask', agentId: 'repo-twice' };

    await dispatcher._doDispatch(job);
    await dispatcher._doDispatch(job);
    await dispatcher._doDispatch(job);

    assert.deepStrictEqual((pendingQueue.get('chatgpt') || []).map(j => j.id), ['job-10']);
  });

  // cleanup — leave the module cache as this file found it
  delete require.cache[DISPATCHER_PATH];
  delete require.cache[BRIDGE_PATH];

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
  // §NOTE — createDispatcher's internal pool leaves an open handle across
  // 10 fresh instances in this file (require.cache churn); forced exit
  // rather than chasing it, matching established precedent elsewhere in
  // this suite (tests/brutal.test.js, tests/full.test.js) for the same
  // class of harmless leftover timer.
  process.exit(process.exitCode);
}

main();
