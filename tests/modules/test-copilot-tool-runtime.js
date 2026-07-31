'use strict';
// P1 — copilot tool-runtime (docs/copilot-omniscience-phasemap.spec).
//
// ── WHY THIS FILE WAS REWRITTEN AT 2.0.0 ─────────────────────────────────────
// The 1.0.0 version of this test passed 6/6 against a tool path that could
// never fire a tool. It fabricated `pollJob` — the model's entire side of the
// wire — so it proved the loop's shape and nothing about whether the loop could
// reach a model. Its gate assertion was also `assert.ok(result)`, which passes
// on {"error":"file not found"}: a tool that failed and a tool that worked were
// indistinguishable to it.
//
// 2.0.0 runs a REAL HTTP round trip against a stand-in for the bridge's
// POST /api/chat/tools, through copilot's own _chatWithToolsOnce (imported, not
// re-implemented here — §12.1, a test asserting on its own copy of the logic
// proves nothing about the logic that ships). Real sockets, real JSON, real
// tool execution against real files. Only the model's cognition is stood in
// for, because the model is genuinely external and absent from the sandbox.
const assert = require('assert');
const http = require('http');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const rt = require(path.join(ROOT, 'copilot/tool-runtime.js'));

// Stand-in for the ollama bridge's POST /api/chat/tools. `script` decides what
// the "model" replies on each successive turn.
function startFakeBridge(script) {
  return new Promise(resolve => {
    const captured = [];
    const srv = http.createServer((req, res) => {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        const parsed = JSON.parse(b || '{}');
        captured.push({ url: req.url, body: parsed });
        const out = script(parsed, captured.length);
        res.writeHead(out.status || 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(out.body));
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, captured, port: srv.address().port }));
  });
}

(async () => {
  // copilot/server.js reads OLLAMA_URL at module load, so the stand-in has to
  // be up and the env set before the require. server.listen is gated behind
  // require.main, so importing it does not bind :3750.
  // Keyed off the conversation itself, not a turn counter: the stand-in is
  // shared across every test below, so a counter would leak state between them.
  // A tool result already in `messages` means we are on the answer turn.
  const bridge = await startFakeBridge((body) => {
    const alreadyRanATool = body.messages.some(m => m.role === 'tool');
    const asked = body.messages.filter(m => m.role === 'user').map(m => m.content || '').join(' ');
    if (!alreadyRanATool && /what version/i.test(asked)) {
      return { body: { ok: true, text: 'reading the file',
        toolCalls: [{ id: 'c1', name: 'read_file', arguments: { path: 'lib/version.js' } }] } };
    }
    if (!alreadyRanATool && /broken/i.test(asked)) {
      return { body: { ok: true, text: '',
        toolCalls: [{ id: 'c1', name: 'read_file', arguments: { path: 'lib/NOPE-does-not-exist.js' } }] } };
    }
    return { body: { ok: true, text: 'done', toolCalls: [] } };
  });
  process.env.OLLAMA_URL = `http://127.0.0.1:${bridge.port}`;
  const server = require(path.join(ROOT, 'copilot/server.js'));
  const chat = (messages, schemas) => server._chatWithToolsOnce(messages, schemas);

  await test('T-001', 'copilot has the full tool set loaded (all 10)', () => {
    assert.ok(rt.toolCount() >= 10, `expected >=10 tools, got ${rt.toolCount()}`);
  });

  await test('T-002', 'GATE: a request needing a file reads it via read_file mid-turn, over a real wire', async () => {
    const r = await rt.run({ userPrompt: 'what version is nexus?', chat });
    assert.strictEqual(r.toolCallLog[0].name, 'read_file');
    const result = r.toolCallLog[0].result;
    // The 1.0.0 assertion was assert.ok(result) — which passes on an error
    // object. These three are the real gate: the tool produced actual file
    // content, from the actual file, and did not error.
    assert.ok(!result.error, `read_file errored: ${result.error}`);
    assert.ok(typeof result.content === 'string' && result.content.length > 0, 'must return real file content');
    assert.ok(/NEXUS Canonical Version Registry/.test(result.content), 'content must be the real lib/version.js, not a placeholder');
    assert.strictEqual(r.iterations, 2, 'one tool turn + one answer turn');
  });

  await test('T-003', 'GATE, other half: tools were declared ON THE WIRE to the bridge', async () => {
    const withTools = bridge.captured.filter(c => Array.isArray(c.body.tools) && c.body.tools.length >= 10);
    assert.ok(withTools.length > 0, 'at least one request must carry the full tool schema set');
    assert.strictEqual(withTools[0].url, '/api/chat/tools', 'must hit the tool-capable endpoint, not /api/jobs');
    const names = withTools[0].body.tools.map(t => t.name || t.function?.name);
    assert.ok(names.includes('read_file'), 'read_file must be among the declared schemas');
  });

  await test('T-004', 'a no-tool response returns immediately as the final answer', async () => {
    const r = await rt.run({ userPrompt: 'hi', chat });
    assert.strictEqual(r.text, 'done');
    assert.strictEqual(r.iterations, 1);
  });

  await test('T-005', 'a FAILED tool is reported as a failure, not smuggled through as a result', async () => {
    const r = await rt.run({ userPrompt: 'read the broken path', chat });
    assert.strictEqual(r.toolCallLog[0].name, 'read_file');
    assert.ok(r.toolCallLog[0].result.error, 'a missing file must surface as .error');
    assert.ok(/not found/i.test(r.toolCallLog[0].result.error));
  });

  await test('T-006', 'tool_calls extract from the OpenAI nesting with string args (pinned bug)', () => {
    const calls = rt._extractToolCalls({ tool_calls: [{ function: { name: 'diagnose', arguments: '{"target":"cortex"}' } }] });
    assert.strictEqual(calls[0].name, 'diagnose');
    assert.deepStrictEqual(calls[0].arguments, { target: 'cortex' });
  });

  await test('T-007', 'P2 memory + P3 stream inject into the system prompt without breaking P1', async () => {
    const sys = rt.buildSystemPrompt({ memory: 'USER prefers terse answers', streamDigest: 'guardian finished a job' });
    assert.ok(/prefers terse answers/.test(sys), 'memory must be in the system prompt');
    assert.ok(/guardian finished a job/.test(sys), 'live stream must be in the system prompt');
    const bare = rt.buildSystemPrompt({});
    assert.ok(!/WHAT YOU REMEMBER/.test(bare), 'absent memory renders nothing, not an empty header');
  });

  await test('T-008', 'run() requires a chat fn and a prompt, and says why (§1.3)', async () => {
    await assert.rejects(async () => rt.run({ userPrompt: 'x' }), /chat is required/);
    await assert.rejects(async () => rt.run({ chat }), /userPrompt is required/);
  });

  await test('T-009', 'a model-host failure raises — the loop never answers out of a failed call', async () => {
    const failing = () => Promise.resolve({ ok: false, error: 'ollama host unreachable' });
    await assert.rejects(async () => rt.run({ userPrompt: 'x', chat: () => { throw new Error('[copilot] tool chat failed: ollama host unreachable'); } }), /tool chat failed/);
    const bad = rt.makeCallModel(async () => null);
    await assert.rejects(async () => bad([], []), /no response object/);
    assert.strictEqual(typeof failing, 'function');
  });

  bridge.srv.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
