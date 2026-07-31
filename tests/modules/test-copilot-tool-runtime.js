'use strict';
// P1 — copilot tool-runtime (docs/copilot-omniscience-phasemap.spec). Proves the
// sovereign agent-tools loop runs with copilot's injected callModel: the model
// can request a tool mid-turn, it executes for real, and the loop feeds the
// result back. Also pins that memory (P2) and stream (P3) context inject without
// breaking the P1 contract.
const assert = require('assert');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const rt = require(path.join(ROOT, 'copilot/tool-runtime.js'));

(async () => {
  await test('T-001', 'copilot has the full tool set loaded (all 10)', () => {
    assert.ok(rt.toolCount() >= 10, `expected >=10 tools, got ${rt.toolCount()}`);
  });

  await test('T-002', 'GATE: a request needing a file reads it via the read_file tool mid-turn', async () => {
    let turn = 0;
    const dispatch = async () => ({});
    const pollJob = async () => {
      turn++;
      if (turn === 1) return { text: 'reading', toolCalls: [{ id: 'c1', name: 'read_file', arguments: JSON.stringify({ path: 'lib/version.js' }) }] };
      return { text: 'done', toolCalls: null };
    };
    const r = await rt.run({ userPrompt: 'what version?', dispatch, pollJob });
    assert.strictEqual(r.toolCallLog[0].name, 'read_file');
    assert.ok(r.toolCallLog[0].result, 'read_file must produce a real result, not a stub');
    assert.strictEqual(r.iterations, 2, 'one tool turn + one answer turn');
  });

  await test('T-003', 'a no-tool response returns immediately as the final answer', async () => {
    const dispatch = async () => ({});
    const pollJob = async () => ({ text: 'direct answer', toolCalls: null });
    const r = await rt.run({ userPrompt: 'hi', dispatch, pollJob });
    assert.strictEqual(r.text, 'direct answer');
    assert.strictEqual(r.iterations, 1);
  });

  await test('T-004', 'tool_calls are extracted from ollama/OpenAI shapes (string args parsed)', () => {
    const calls = rt._extractToolCalls({ tool_calls: [{ function: { name: 'diagnose', arguments: '{"target":"cortex"}' } }] });
    assert.strictEqual(calls[0].name, 'diagnose');
    assert.deepStrictEqual(calls[0].arguments, { target: 'cortex' });
  });

  await test('T-005', 'P2 memory + P3 stream inject into the system prompt without breaking P1', async () => {
    let capturedSystem = null;
    const dispatch = async (convo, sys) => { capturedSystem = sys; return {}; };
    const pollJob = async () => ({ text: 'ok', toolCalls: null });
    await rt.run({ userPrompt: 'x', dispatch, pollJob, memory: 'USER prefers terse answers', streamDigest: 'guardian finished a job' });
    assert.ok(/prefers terse answers/.test(capturedSystem), 'memory must be in the system prompt');
    assert.ok(/guardian finished a job/.test(capturedSystem), 'live stream must be in the system prompt');
  });

  await test('T-006', 'run() requires dispatch and pollJob (fails loud, §1.2)', async () => {
    await assert.rejects(async () => rt.run({ userPrompt: 'x' }), /dispatch and pollJob are required/);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
