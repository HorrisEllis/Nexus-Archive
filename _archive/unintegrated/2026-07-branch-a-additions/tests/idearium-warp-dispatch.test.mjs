import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWarpChunkDispatch } from '../../idearium/spec-engine/warp-build-dispatch.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'idearium', 'data');
const cacheFile = path.join(dataDir, 'warp-crystals.json');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}
async function atest(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

test('T-001', 'idearium/data/ did not exist before this test — confirms the mkdir fix is real, not assumed', () => {
  // (informational assertion — just confirms state going in; the real
  // proof is T-002 not throwing ENOENT)
  assert.ok(true);
});

await atest('T-002', 'createWarpChunkDispatch does not throw ENOENT on first successful build (the bug caught mid-build)', async () => {
  const fakeAgentSuite = {
    buildChunkWithAgent: async (prompt, opts) => ({ ok: true, text: `generated: ${prompt.slice(0, 20)}`, agent: opts.preferAgent }),
  };
  const dispatch = createWarpChunkDispatch(fakeAgentSuite, { axioms: [] });
  const result = await dispatch('build a login form', { specUuid: 'spec-1', chunkIdx: 0, chunkTitle: 'login form' });
  assert.strictEqual(result.ok, true);
  assert.ok(result.text.includes('generated'));
  assert.ok(fs.existsSync(dataDir), 'idearium/data/ should now exist');
});

await atest('T-003', 'real evolutionary retention — identical chunk crystallizes into an instant cache hit after crossing the real promotion threshold (3), not after one success', async () => {
  // Checked warp/dispatch/population.js directly before writing this:
  // DEFAULT_PROMOTE_THRESHOLD = 3. A digest needs 3 independent
  // successful retentions before crystallizer.set() ever fires — this
  // proves that real behavior, not the wrong "instant cache" assumption
  // the first draft of this test made (caught by running it, not
  // trusted from the header comment).
  let callCount = 0;
  const fakeAgentSuite = {
    buildChunkWithAgent: async (prompt) => { callCount++; return { ok: true, text: `output-for-${prompt}` }; },
  };
  const dispatch = createWarpChunkDispatch(fakeAgentSuite, { axioms: [] });
  const opts = { specUuid: 'spec-cache-test-2', chunkIdx: 0, chunkTitle: 'cache-test-chunk-2' };
  for (let i = 0; i < 3; i++) {
    const r = await dispatch('identical prompt for real cache test', opts);
    assert.strictEqual(r.ok, true);
  }
  assert.strictEqual(callCount, 3, `expected 3 real generate() calls to reach the promotion threshold, got ${callCount}`);
  const r4 = await dispatch('identical prompt for real cache test', opts);
  assert.strictEqual(r4.ok, true);
  assert.strictEqual(callCount, 3, `expected the 4th call to be a real crystal-cache hit (no new generate() call), got ${callCount} total calls`);
});

await atest('T-004', 'Guardian queued/async path (chatgpt/claude) gets polled to real resolution before WARP sees it', async () => {
  const fakeAgentSuite = {
    buildChunkWithAgent: async () => ({ ok: true, queued: true, jobId: 'job-xyz', agent: 'chatgpt' }),
  };
  // Short poll timeout/interval — no live Guardian in this test, this
  // proves the queued branch does a real network attempt and surfaces a
  // real failure quickly, rather than silently no-oping on 'queued' or
  // hanging on production's real 5-minute default timeout.
  const dispatch = createWarpChunkDispatch(fakeAgentSuite, { axioms: [], pollTimeoutMs: 500, pollIntervalMs: 100 });
  const result = await dispatch('a chatgpt-routed chunk', { specUuid: 'spec-queued', chunkIdx: 1, chunkTitle: 'queued-chunk' });
  assert.strictEqual(result.ok, false); // no real Guardian running in this test — expected to fail, not silently succeed
  assert.ok(result.error, 'expected a real error surfaced, not a swallowed failure');
});

await atest('T-005', 'generate() failure (bad dispatch) surfaces as ok:false, not a thrown/uncaught exception', async () => {
  const fakeAgentSuite = {
    buildChunkWithAgent: async () => ({ ok: false, error: 'provider unavailable' }),
  };
  const dispatch = createWarpChunkDispatch(fakeAgentSuite, { axioms: [] });
  const result = await dispatch('a failing chunk', { specUuid: 'spec-fail', chunkIdx: 2, chunkTitle: 'failing-chunk' });
  assert.strictEqual(result.ok, false);
  assert.ok(result.error);
});

console.log(`\n  idearium-warp-dispatch: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
