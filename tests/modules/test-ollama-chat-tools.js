'use strict';
// ollama/chat-tools.js — the single-round-trip tool-capable model primitive.
// §PHASEMAP P1 (closes p1_open_drift, docs/copilot-omniscience-phasemap.spec).
//
// WHAT IS REAL HERE AND WHAT IS NOT — stated up front, because the 1.0.0 test
// this replaces passed against a broken wire by fabricating the wire itself.
// REAL: a live HTTP server, real sockets, real JSON encode/decode, the real
// request body we send to Ollama, the real parsing of what comes back.
// STOOD IN FOR: Ollama itself. The model is a genuinely external service and
// is absent from the sandbox — the phasemap's honest_risks has always said so.
// What is NOT stood in for is any of our own code.
const assert = require('assert');
const http = require('http');
const path = require('path');
let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const ct = require(path.join(ROOT, 'ollama/chat-tools.js'));

// A stand-in Ollama /api/chat. `handler` decides what this "model" replies.
function startFakeOllama(handler) {
  return new Promise(resolve => {
    const captured = [];
    const srv = http.createServer((req, res) => {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        const parsed = JSON.parse(b || '{}');
        captured.push({ url: req.url, body: parsed });
        const out = handler(parsed, captured.length);
        res.writeHead(out.status || 200, { 'Content-Type': 'application/json' });
        res.end(typeof out.body === 'string' ? out.body : JSON.stringify(out.body));
      });
    });
    srv.listen(0, '127.0.0.1', () => {
      resolve({ srv, captured, host: `http://127.0.0.1:${srv.address().port}` });
    });
  });
}

(async () => {
  await test('T-101', 'tools are actually PUT ON THE WIRE to /api/chat (the P1 defect)', async () => {
    const f = await startFakeOllama(() => ({ body: { message: { content: 'ok' } } }));
    try {
      const schemas = [{ type: 'function', function: { name: 'read_file', description: 'd', parameters: {} } }];
      await ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'hi' }], schemas);
      assert.strictEqual(f.captured[0].url, '/api/chat', 'must hit /api/chat, not /api/generate');
      assert.ok(Array.isArray(f.captured[0].body.tools), 'tools must be present in the request body');
      assert.strictEqual(f.captured[0].body.tools[0].function.name, 'read_file');
      assert.strictEqual(f.captured[0].body.stream, false);
    } finally { f.srv.close(); }
  });

  await test('T-102', 'tool_calls come back normalized (Ollama object-args shape)', async () => {
    const f = await startFakeOllama(() => ({ body: { message: { content: '',
      tool_calls: [{ id: 'a1', function: { name: 'read_file', arguments: { path: 'lib/version.js' } } }] } } }));
    try {
      const r = await ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []);
      assert.strictEqual(r.toolCalls.length, 1);
      assert.strictEqual(r.toolCalls[0].name, 'read_file');
      assert.deepStrictEqual(r.toolCalls[0].arguments, { path: 'lib/version.js' });
    } finally { f.srv.close(); }
  });

  await test('T-103', 'string-encoded arguments parse (OpenAI-compatible shape — the pinned bug)', async () => {
    const f = await startFakeOllama(() => ({ body: { message: { content: '',
      tool_calls: [{ function: { name: 'diagnose', arguments: '{"target":"cortex"}' } }] } } }));
    try {
      const r = await ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []);
      assert.deepStrictEqual(r.toolCalls[0].arguments, { target: 'cortex' });
      assert.strictEqual(r.toolCalls[0].id, 'call_0', 'a missing id gets a positional one');
    } finally { f.srv.close(); }
  });

  await test('T-104', 'no tool_calls returns an EMPTY ARRAY, never null (same shape both branches)', async () => {
    const f = await startFakeOllama(() => ({ body: { message: { content: 'final answer' } } }));
    try {
      const r = await ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []);
      assert.deepStrictEqual(r.toolCalls, []);
      assert.strictEqual(r.text, 'final answer');
    } finally { f.srv.close(); }
  });

  await test('T-105', 'a nameless tool_call is dropped, not passed through as undefined', async () => {
    const f = await startFakeOllama(() => ({ body: { message: { content: '',
      tool_calls: [{ id: 'x', function: { arguments: {} } }, { function: { name: 'diagnose', arguments: {} } }] } } }));
    try {
      const r = await ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []);
      assert.strictEqual(r.toolCalls.length, 1, 'the malformed one is dropped');
      assert.strictEqual(r.toolCalls[0].name, 'diagnose');
    } finally { f.srv.close(); }
  });

  await test('T-106', 'a model-host error REJECTS loudly — never an empty answer (§1.3)', async () => {
    const f = await startFakeOllama(() => ({ status: 500, body: { error: 'model not found' } }));
    try {
      await assert.rejects(
        () => ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []),
        /model not found/
      );
    } finally { f.srv.close(); }
  });

  await test('T-107', 'a non-JSON body rejects with the status and payload, not a silent empty', async () => {
    const f = await startFakeOllama(() => ({ status: 502, body: '<html>bad gateway</html>' }));
    try {
      await assert.rejects(
        () => ct.callChatWithTools(f.host, 'm', [{ role: 'user', content: 'x' }], []),
        /non-JSON response/
      );
    } finally { f.srv.close(); }
  });

  await test('T-108', 'missing required args fail loudly before any socket is opened', async () => {
    await assert.rejects(() => ct.callChatWithTools('', 'm', [{ role: 'user', content: 'x' }], []), /host is required/);
    await assert.rejects(() => ct.callChatWithTools('http://x', '', [{ role: 'user', content: 'x' }], []), /model is required/);
    await assert.rejects(() => ct.callChatWithTools('http://x', 'm', [], []), /non-empty array/);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
