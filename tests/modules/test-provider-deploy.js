'use strict';
// tests/modules/test-provider-deploy.js — §PHASE-2 agent surface
// Load-bearing: PD-005 (a real deploy failure surfaces as an error, never
// a fabricated success) and PD-008 (the real backend route it calls
// genuinely exists and calls the real ProviderHost.deploy()).
const assert = require('assert');
const fs = require('fs'), path = require('path');
const http = require('http');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'));

let passed = 0, failed = 0;
async function test(id, name, fn) {
  try { await fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

// A stand-in wire server so the real routes' CONTRACT is exercised, not mocked away.
function wire(handler) {
  return new Promise(res => {
    const s = http.createServer((req, r) => {
      let b = ''; req.on('data', c => b += c);
      req.on('end', () => {
        r.writeHead(200, { 'Content-Type': 'application/json' });
        r.end(JSON.stringify(handler(req.url, JSON.parse(b || '{}'))));
      });
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

(async () => {
  console.log('\n\u2550\u2550 PROVIDER DEPLOY \u2014 \u00a7PHASE-2 agent surface \u2550\u2550\n');

  await test('PD-001', 'it matches the agent-tools contract shape', () => {
    assert.strictEqual(T.name, 'clear_glass_provider_deploy');
    assert.strictEqual(typeof T.execute, 'function');
    assert.deepStrictEqual(T.parameters.required, ['providerId']);
  });

  await test('PD-002', '\u00a71.1 no providerId \u2192 refused, not guessed', async () => {
    const r = await T.execute({});
    assert.ok(/providerId required/.test(r.error));
    assert.ok(/claude, chatgpt/.test(r.error), 'the refusal must name the real options');
  });

  await test('PD-003', 'it hits the REAL route path the backend exposes', async () => {
    const seen = [];
    const s = await wire((url, body) => { seen.push([url, body.providerId]); return { ok: true, providerId: body.providerId, injectedAt: 12345 }; });
    process.env.WIRE_PORT = String(s.address().port);
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'));
    try {
      const r = await T2.execute({ providerId: 'claude' });
      assert.deepStrictEqual(seen, [['/provider/deploy', 'claude']],
        'must call the real route clear-glass/src/main/index.js actually exposes');
      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.injectedAt, 12345, 'the real timestamp from the backend must pass through, not be invented here');
    } finally { s.close(); delete process.env.WIRE_PORT; }
  });

  await test('PD-004', 'a real success reports which provider and preserves the real injectedAt', async () => {
    const s = await wire(() => ({ ok: true, providerId: 'gemini', injectedAt: 999 }));
    process.env.WIRE_PORT = String(s.address().port);
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'));
    try {
      const r = await T2.execute({ providerId: 'gemini' });
      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.providerId, 'gemini');
      assert.strictEqual(r.injectedAt, 999);
    } finally { s.close(); delete process.env.WIRE_PORT; }
  });

  await test('PD-005', 'ok:false from a reached route is a FAILURE \u2014 never reported as a successful deploy', async () => {
    const s = await wire(() => ({ ok: false, error: 'no live window for provider "ghost"' }));
    process.env.WIRE_PORT = String(s.address().port);
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'));
    try {
      const r = await T2.execute({ providerId: 'ghost' });
      assert.ok(r.error, 'ProviderHost.deploy() returning ok:false means the deploy did not happen \u2014 that is not a success');
      assert.ok(!r.ok);
      assert.ok(/real failure, not a connectivity problem/.test(r.note),
        'the caller must be able to tell "deploy failed" from "cannot reach ClearGlass"');
    } finally { s.close(); delete process.env.WIRE_PORT; }
  });

  await test('PD-006', 'ClearGlass down \u2192 a specific reason, never a fabricated ok', async () => {
    process.env.WIRE_PORT = '1';
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy'));
    try {
      const r = await T2.execute({ providerId: 'claude' });
      assert.ok(r.error && !r.ok);
      assert.strictEqual(r.providerId, 'claude', 'the failure must still say which provider it was about');
    } finally { delete process.env.WIRE_PORT; }
  });

  await test('PD-007', 'THE REGISTRY includes this tool alongside the rest', () => {
    const tools = require(path.join(ROOT, 'lib', 'agent-tools')).TOOLS;
    assert.ok(tools.size > 70, `an unguarded require took the WHOLE registry down \u2014 only ${tools.size} tools loaded`);
    assert.ok(tools.has('clear_glass_provider_deploy'));
  });

  await test('PD-008', 'the real backend route + real ProviderHost method both genuinely exist', () => {
    const main = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'main', 'index.js'), 'utf8');
    assert.ok(main.includes('/provider/deploy'), 'route is gone \u2014 this tool would call nothing');
    assert.ok(/providerHost\.deploy\(providerId\)/.test(main));
    const host = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'providers', 'host.js'), 'utf8');
    assert.ok(/async deploy\(providerId\)/.test(host), 'ProviderHost.deploy() itself is gone');
  });

  await test('PD-009', 'deploy() reuses the REAL _inject() the existing 60s reload timer calls \u2014 not a second injection path', () => {
    const host = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'providers', 'host.js'), 'utf8');
    const deployBlock = host.slice(host.indexOf('async deploy(providerId)'), host.indexOf('async deploy(providerId)') + 400);
    assert.ok(/this\._inject\(providerId, win\)/.test(deployBlock),
      'deploy() must call the same real _inject() the timer uses, not reimplement injection');
  });

  await test('PD-010', 'it REUSES the wire transport, not a second one', () => {
    const mine = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-deploy.js'), 'utf8');
    const peer = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility.js'), 'utf8');
    for (const s of ['WIRE_PORT', '127.0.0.1', 'timeout: 5000']) {
      assert.ok(mine.includes(s) && peer.includes(s), `${s} differs \u2014 two transports drift on timeout and error shape (\u00a710.3)`);
    }
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})();
