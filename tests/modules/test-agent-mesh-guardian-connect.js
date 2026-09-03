'use strict';
const assert = require('assert');
const http = require('http');
const AgentMesh = require('../../clear-glass/src/mesh/agent-mesh.js');

let passed = 0, failed = 0;
async function test(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.log(`  ✗ ${id} ${desc}\n    ${e.stack}`); failed++; }
}

function fakeSse() { const events = []; return { emit: (t, p) => events.push({ t, p }), events }; }

function startFakeGuardian(handler) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => handler(JSON.parse(body || '{}'), res));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

(async () => {
  await test('MESH-001', '_dispatchViaGuardian returns the real response on a genuine 200/ok/text reply', async () => {
    const server = await startFakeGuardian((body, res) => {
      assert.strictEqual(body.provider, 'claude');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, text: 'a real reply', jobId: 'job-123' }));
    });
    process.env.GUARDIAN_PORT = String(server.address().port);
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse: fakeSse() });
    const out = await mesh._dispatchViaGuardian('hello', 'claude');
    assert.strictEqual(out.text, 'a real reply');
    assert.strictEqual(out.jobId, 'job-123');
    server.close();
  });

  await test('MESH-002', '_dispatchViaGuardian resolves null (never throws) on ok:false, matching _raidDecide\'s honest-degrade contract', async () => {
    const server = await startFakeGuardian((body, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'no provider connected' }));
    });
    process.env.GUARDIAN_PORT = String(server.address().port);
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse: fakeSse() });
    const out = await mesh._dispatchViaGuardian('hello', 'claude');
    assert.strictEqual(out, null);
    server.close();
  });

  await test('MESH-003', '_dispatchViaGuardian resolves null on an unreachable Guardian (no server listening)', async () => {
    process.env.GUARDIAN_PORT = '1';
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse: fakeSse() });
    const out = await mesh._dispatchViaGuardian('hello', 'claude');
    assert.strictEqual(out, null);
  });

  await test('MESH-004', 'route() uses the real Guardian path for claude/chatgpt when Guardian answers, emits mesh.guardian.dispatch used:true, and never calls send() / local DOM automation', async () => {
    const server = await startFakeGuardian((body, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, text: 'guardian answered', jobId: 'job-456' }));
    });
    process.env.GUARDIAN_PORT = String(server.address().port);
    const sse = fakeSse();
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse });
    let sendCalled = false;
    mesh.send = async () => { sendCalled = true; return { text: 'should not be reached' }; };
    const result = await mesh.route({ prompt: 'test', preferAgent: 'claude' });
    assert.strictEqual(result.via, 'guardian');
    assert.strictEqual(result.text, 'guardian answered');
    assert.strictEqual(sendCalled, false, 'local DOM automation must not run when Guardian genuinely answered');
    assert.ok(sse.events.some(e => e.t === 'mesh.guardian.dispatch' && e.p.used === true));
    server.close();
  });

  await test('MESH-005', 'route() falls through to real local send() when Guardian is unreachable — never a dead end', async () => {
    process.env.GUARDIAN_PORT = '1';
    const sse = fakeSse();
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse });
    let sendCalled = false;
    mesh.send = async ({ agentKey }) => { sendCalled = true; return { agentKey, text: 'local dom automation answered', via: 'dom' }; };
    mesh._getBestAgent = () => ({ health: 100, status: 'ok', contextId: 'ctx-1' });
    const result = await mesh.route({ prompt: 'test', preferAgent: 'claude' });
    assert.strictEqual(sendCalled, true, 'must fall through to real local automation, not dead-end');
    assert.strictEqual(result.text, 'local dom automation answered');
    assert.ok(sse.events.some(e => e.t === 'mesh.guardian.dispatch' && e.p.used === false));
  });

  await test('MESH-006', 'route() does NOT try Guardian for agents it does not cover (gemini) — goes straight to local automation', async () => {
    process.env.GUARDIAN_PORT = '1';
    const sse = fakeSse();
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse });
    let dispatchViaGuardianCalled = false;
    mesh._dispatchViaGuardian = async () => { dispatchViaGuardianCalled = true; return null; };
    mesh._getBestAgent = () => ({ health: 100, status: 'ok', contextId: 'ctx-1' });
    mesh.send = async ({ agentKey }) => ({ agentKey, text: 'gemini answered', via: 'dom' });
    await mesh.route({ prompt: 'test', preferAgent: 'gemini' });
    assert.strictEqual(dispatchViaGuardianCalled, false, 'gemini is not Guardian-covered — must not attempt the Guardian path at all');
  });

  await test('MESH-007', 'route() with an explicit fallbackOrder skips the Guardian-first bridge entirely (caller-specified order wins)', async () => {
    const sse = fakeSse();
    const mesh = new AgentMesh({ ctxMgr: null, driver: null, sse });
    let dispatchViaGuardianCalled = false;
    mesh._dispatchViaGuardian = async () => { dispatchViaGuardianCalled = true; return null; };
    mesh._getBestAgent = () => ({ health: 100, status: 'ok', contextId: 'ctx-1' });
    mesh.send = async ({ agentKey }) => ({ agentKey, text: 'ok', via: 'dom' });
    await mesh.route({ prompt: 'test', fallbackOrder: ['claude'] });
    assert.strictEqual(dispatchViaGuardianCalled, false);
  });

  delete process.env.GUARDIAN_PORT;
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
