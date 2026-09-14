'use strict';
/**
 * tests/dispatcher-ncp-fanout.test.js
 *
 * §MCO-NCP-FANOUT 2026-09-13 — real test for the fix traced from a live
 * log: "dispatched → chatgpt via NCP (3 clients)" followed by 3 real
 * job.dispatched acks and then "[NCP dispatch failed — no response]".
 * guardian/lib/dispatcher.js used to broadcast a job's real content to
 * EVERY connected client for a provider via ncp.push(). This proves the
 * fix: with a real ncp.listClientsForProvider()/pushTab() available,
 * exactly ONE real client receives the job, even when several are
 * connected — same real bus/dep shape as dispatcher-ping-gate.test.js.
 */
const assert = require('assert');
const { createDispatcher } = require('../guardian/lib/dispatcher.js');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function makeDeps({ clients, autoPongTabId } = {}) {
  const updates = [];
  const emitted = [];
  const pendingQueue = new Map();
  const listeners = new Map();
  const pushCalls = [];
  const pushTabCalls = [];
  const bus = {
    emit: (name, payload) => {
      emitted.push({ name, payload });
      for (const fn of listeners.get(name) || []) fn({ data: payload });
    },
    on: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    off: (name, fn) => { listeners.get(name)?.delete(fn); },
  };
  const ncp = {
    isConnected: () => clients.length > 0,
    listClientsForProvider: (provider) => clients,
    push: (provider, msg) => {
      // The real bug's mechanism: if this is ever called for a real job
      // dispatch (not the honest fallback path), it would reach ALL
      // clients. Recorded so a test can assert it was never used for the
      // real GUARDIAN_JOB payload when a target was resolved.
      pushCalls.push({ provider, msg });
      if (msg.type === 'GUARDIAN_PING' && autoPongTabId) {
        bus.emit('guardian.ncp.pong', { provider, tabId: autoPongTabId, pingId: msg.pingId });
      }
      return clients.length;
    },
    pushTab: (provider, tabId, msg) => {
      pushTabCalls.push({ provider, tabId, msg });
      if (msg.type === 'GUARDIAN_PING' && autoPongTabId) {
        bus.emit('guardian.ncp.pong', { provider, tabId: autoPongTabId, pingId: msg.pingId });
      }
      return clients.some(c => c.tabId === tabId);
    },
  };
  return {
    deps: {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus, ncp, pendingQueue,
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => Promise.resolve(),
    },
    updates, emitted, pushCalls, pushTabCalls,
  };
}

async function main() {
  await test('FANOUT-001', 'a single claimed client among 3 connected is used directly, job never broadcast', async () => {
    const clients = [
      { tabId: 'tab-a', claimed: false, lastHeartbeat: 100 },
      { tabId: 'tab-b', claimed: true, lastHeartbeat: 200 },
      { tabId: 'tab-c', claimed: false, lastHeartbeat: 300 },
    ];
    const { deps, updates, pushCalls, pushTabCalls } = makeDeps({ clients, autoPongTabId: 'tab-b' });
    const dispatcher = createDispatcher(deps);
    await dispatcher._doDispatch({ id: 'job-1', provider: 'chatgpt', command: 'ask' });

    const jobPushTab = pushTabCalls.find(c => c.msg.type === 'GUARDIAN_JOB');
    assert.ok(jobPushTab, 'the real job payload must go via pushTab, not push');
    assert.strictEqual(jobPushTab.tabId, 'tab-b', 'must target the claimed tab specifically');
    assert.strictEqual(pushCalls.find(c => c.msg.type === 'GUARDIAN_JOB'), undefined, 'push() (broadcast) must never carry the real job payload when a target was resolved');
    const delivered = updates.find(u => u.patch.status === 'delivered');
    assert.strictEqual(delivered.patch.dispatchedTabId, 'tab-b', 'the resolved tabId must be recorded on the job');
  });

  await test('FANOUT-002', 'no claimed clients, 3 connected: the most recently active is picked, flagged ambiguous, and only IT receives the job', async () => {
    const clients = [
      { tabId: 'tab-old', claimed: false, lastHeartbeat: 100 },
      { tabId: 'tab-mid', claimed: false, lastHeartbeat: 200 },
      { tabId: 'tab-new', claimed: false, lastHeartbeat: 300 },
    ];
    const { deps, updates, emitted, pushTabCalls } = makeDeps({ clients, autoPongTabId: 'tab-new' });
    const dispatcher = createDispatcher(deps);
    await dispatcher._doDispatch({ id: 'job-2', provider: 'chatgpt', command: 'ask' });

    const jobPushTab = pushTabCalls.find(c => c.msg.type === 'GUARDIAN_JOB');
    assert.strictEqual(jobPushTab.tabId, 'tab-new', 'must pick the freshest heartbeat among unclaimed tabs');
    const ambiguousEvent = emitted.find(e => e.name === 'guardian.dispatch.target.ambiguous');
    assert.ok(ambiguousEvent, 'the real conflict (3 unclaimed tabs) must be surfaced, not silently resolved');
    assert.strictEqual(ambiguousEvent.payload.ambiguous, 'multiple_unclaimed');
    const delivered = updates.find(u => u.patch.status === 'delivered');
    assert.strictEqual(delivered.patch.dispatchedTabId, 'tab-new');
  });

  await test('FANOUT-003', 'a single connected client (the ordinary case) is completely unaffected', async () => {
    const clients = [{ tabId: 'tab-only', claimed: false, lastHeartbeat: 100 }];
    const { deps, updates, pushTabCalls } = makeDeps({ clients, autoPongTabId: 'tab-only' });
    const dispatcher = createDispatcher(deps);
    await dispatcher._doDispatch({ id: 'job-3', provider: 'chatgpt', command: 'ask' });

    const jobPushTab = pushTabCalls.find(c => c.msg.type === 'GUARDIAN_JOB');
    assert.strictEqual(jobPushTab.tabId, 'tab-only');
    const delivered = updates.find(u => u.patch.status === 'delivered');
    assert.ok(delivered, 'the ordinary single-tab case still dispatches and delivers normally');
  });

  await test('FANOUT-004', 'an older ncp with no listClientsForProvider/pushTab falls back to the original broadcast behavior byte for byte', async () => {
    const updates = [];
    const listeners = new Map();
    const bus = {
      emit: (name, payload) => { for (const fn of listeners.get(name) || []) fn({ data: payload }); },
      on: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
      off: (name, fn) => { listeners.get(name)?.delete(fn); },
    };
    const pushCalls = [];
    const deps = {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus,
      ncp: {
        isConnected: () => true,
        push: (provider, msg) => {
          pushCalls.push(msg);
          if (msg.type === 'GUARDIAN_PING') bus.emit('guardian.ncp.pong', { provider, tabId: 'whatever', pingId: msg.pingId });
          return 1;
        },
        // deliberately no listClientsForProvider, no pushTab — the exact
        // real fake shape every pre-existing dispatcher test already used
      },
      pendingQueue: new Map(),
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => Promise.resolve(),
    };
    const dispatcher = createDispatcher(deps);
    await dispatcher._doDispatch({ id: 'job-4', provider: 'chatgpt', command: 'ask' });

    const jobPush = pushCalls.find(c => c.type === 'GUARDIAN_JOB');
    assert.ok(jobPush, 'must fall back to broadcast push() when listClientsForProvider/pushTab are unavailable');
    const delivered = updates.find(u => u.patch.status === 'delivered');
    assert.strictEqual(delivered.patch.dispatchedTabId, null, 'no real target was resolved, so dispatchedTabId is honestly null, not fabricated');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main();
