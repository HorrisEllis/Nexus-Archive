'use strict';
// Real test for dispatcher.js's deepseek branch. James: "deepseek as a ncp
// provider." Before this fix, job.provider === 'deepseek' unconditionally
// routed to ollama-bridge, even with a real, connected chat.deepseek.com
// NCP tab — the generic NCP dispatch path below it could never be reached.

const assert = require('assert');
const { createDispatcher } = require('../../guardian/lib/dispatcher.js');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function makeDeps({ deepseekConnected }) {
  const updates = [];
  let deepseekCalled = false, ncpPushed = false;
  return {
    deps: {
      updateJob: (id, patch) => updates.push({ id, patch }),
      bus: { emit: () => {} },
      ncp: {
        isConnected: (p) => p === 'deepseek' ? deepseekConnected : false,
        push: () => { ncpPushed = true; return 1; },
      },
      pendingQueue: new Map(),
      cockpitBroadcast: () => {},
      dispatchToMistral: () => Promise.resolve(),
      dispatchToDeepseek: () => { deepseekCalled = true; return Promise.resolve(); },
    },
    updates,
    calls: () => ({ deepseekCalled, ncpPushed }),
  };
}

test('DSK-001', 'no connected deepseek NCP tab falls back to the real, still-legitimate ollama-bridge path', () => {
  const { deps, calls } = makeDeps({ deepseekConnected: false });
  const dispatcher = createDispatcher(deps);
  dispatcher._doDispatch({ id: 'job-1', provider: 'deepseek', command: 'ping' });
  assert.strictEqual(calls().deepseekCalled, true, 'ollama-bridge dispatch must still run when no NCP tab is connected');
  assert.strictEqual(calls().ncpPushed, false, 'ncp.push must not fire when there is no real tab to push to');
});

test('DSK-002', 'a real, connected deepseek NCP tab is used directly, no longer shadowed by the unconditional ollama-bridge branch', () => {
  const { deps, calls } = makeDeps({ deepseekConnected: true });
  const dispatcher = createDispatcher(deps);
  dispatcher._doDispatch({ id: 'job-2', provider: 'deepseek', command: 'ping' });
  assert.strictEqual(calls().deepseekCalled, false, 'ollama-bridge must NOT be called when a real NCP tab is connected');
  assert.strictEqual(calls().ncpPushed, true, 'the real NCP push path must be reached instead');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
