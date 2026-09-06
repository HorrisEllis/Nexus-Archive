'use strict';
/**
 * tests/dispatcher-stale-socket.test.js — real test for the 2026-09-06
 * silent-false-delivery bug.
 *
 * James, live, from an actual boot log: "when switching agents to
 * chatgpt, it doesnt even connect to the ncp anymore. it routes to it.
 * but doesnt do anything beyond that." Traced directly: guardian created
 * and dispatched a real /ping job to chatgpt, logged "dispatched ...
 * via NCP", and that job never completed anywhere in the log — no ack,
 * no error, nothing, ever.
 *
 * Root cause: ncp.isConnected(provider) can say true while the actual
 * write to that client's socket fails (a stale connection right after a
 * disconnect/reconnect cycle — confirmed happening in the same real
 * log, seconds before this exact job). guardian/lib/ncp.js's _write()
 * silently swallowed any write failure (correct intent — never crash on
 * a broken pipe — but with zero way to tell success from failure), so
 * push() always reported success regardless, and dispatcher.js never
 * checked push()'s return value at all. The job got marked 'delivered'
 * and logged as dispatched even though zero real bytes reached anyone.
 *
 * This test uses createDispatcher's own real, documented fake-dependency
 * shape (see the file's own header) — a fake ncp whose isConnected()
 * returns true but push() returns 0, exactly the real scenario found
 * live, not a hypothetical.
 */
const assert = require('assert');
const { createDispatcher } = require('../guardian/lib/dispatcher.js');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function makeDeps(pushReturns) {
  const updates = [];
  const emitted = [];
  const pendingQueue = new Map();
  return {
    deps: {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus: { emit: (name, payload) => emitted.push({ name, payload }) },
      ncp: {
        isConnected: () => true,          // guardian believes chatgpt is connected — real, matches the actual log
        push: () => pushReturns,          // the real write outcome under test
      },
      pendingQueue,
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => Promise.resolve(),
    },
    updates, emitted, pendingQueue,
  };
}

test('DSS-001', 'a real write that reaches zero clients (stale socket) is requeued, never falsely marked delivered', () => {
  const { deps, updates, emitted, pendingQueue } = makeDeps(0);
  const dispatcher = createDispatcher(deps);
  const job = { id: 'job-1', provider: 'chatgpt', command: 'ping' };

  dispatcher._doDispatch(job);

  const deliveredUpdate = updates.find(u => u.patch.status === 'delivered');
  assert.strictEqual(deliveredUpdate, undefined, 'job must NOT be marked delivered when the real write reached zero clients');

  const queuedUpdate = updates.find(u => u.patch.status === 'queued');
  assert.ok(queuedUpdate, 'job must be marked queued instead');
  assert.ok(queuedUpdate.patch.queueReason.includes('stale'), `queueReason should explain the stale-socket cause, got: ${queuedUpdate.patch.queueReason}`);

  assert.ok(pendingQueue.get('chatgpt')?.includes(job), 'job must actually be requeued for real retry, not just logged and dropped');

  const queuedEvent = emitted.find(e => e.name === 'guardian.job.queued' && e.payload.reason === 'stale_socket');
  assert.ok(queuedEvent, 'a real guardian.job.queued event with reason:stale_socket must fire, so anything watching the bus can see this happened');
});

test('DSS-002', 'a real write that reaches at least one client is still marked delivered — the fix does not break the working case', () => {
  const { deps, updates } = makeDeps(1);
  const dispatcher = createDispatcher(deps);
  const job = { id: 'job-2', provider: 'chatgpt', command: 'ping' };

  dispatcher._doDispatch(job);

  const deliveredUpdate = updates.find(u => u.patch.status === 'delivered');
  assert.ok(deliveredUpdate, 'a real successful push must still mark the job delivered');
  const queuedUpdate = updates.find(u => u.patch.status === 'queued');
  assert.strictEqual(queuedUpdate, undefined, 'a real successful push must not also requeue the job');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
