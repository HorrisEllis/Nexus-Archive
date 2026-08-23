'use strict';
// tests/modules/test-provider-visibility.js — §BL28 agent surface
// Load-bearing: PV-005 (a "not found" from a reached route is a FAILURE, not
// a cheerful ok) and PV-007 (the registry survives a missing tool module).
const assert = require('assert');
const fs = require('fs'), path = require('path');
const http = require('http');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'));

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
  console.log('\n\u2550\u2550 PROVIDER VISIBILITY \u2014 \u00a7BL28 agent surface \u2550\u2550\n');

  await test('PV-001', 'it matches the agent-tools contract shape', () => {
    assert.strictEqual(T.name, 'clear_glass_provider_visibility');
    assert.strictEqual(typeof T.execute, 'function');
    assert.deepStrictEqual(T.parameters.required.sort(), ['providerId', 'where']);
  });

  await test('PV-002', '\u00a71.1 no providerId \u2192 refused, not guessed', async () => {
    const r = await T.execute({ where: 'background' });
    assert.ok(/providerId required/.test(r.error));
    assert.ok(/claude, chatgpt/.test(r.error), 'the refusal must name the real options');
  });

  await test('PV-003', 'an invalid direction is REFUSED, never defaulted', async () => {
    const r = await T.execute({ providerId: 'claude', where: 'sideways' });
    assert.ok(/must be "background" or "foreground"/.test(r.error));
    assert.ok(/not a recoverable mistake/.test(r.note),
      'hiding a window the user wanted forward cannot be undone by the tool');
  });

  await test('PV-004', 'it hits the REAL route paths the backend exposes', async () => {
    const seen = [];
    const s = await wire((url, body) => { seen.push([url, body.providerId]); return { ok: true, providerId: body.providerId }; });
    process.env.WIRE_PORT = String(s.address().port);
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'));
    try {
      await T2.execute({ providerId: 'claude', where: 'background' });
      await T2.execute({ providerId: 'gemini', where: 'foreground' });
      assert.deepStrictEqual(seen, [
        ['/provider/move-to-background', 'claude'],
        ['/provider/bring-to-foreground', 'gemini'],
      ], 'must call the routes clear-glass/src/main/index.js:541 actually exposes');
    } finally { s.close(); delete process.env.WIRE_PORT; }
  });

  await test('PV-005', 'ok:false is a FAILURE \u2014 never reported as a successful hide', async () => {
    const s = await wire(() => ({ ok: false, providerId: 'ghost' }));
    process.env.WIRE_PORT = String(s.address().port);
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'));
    try {
      const r = await T2.execute({ providerId: 'ghost', where: 'background' });
      assert.ok(r.error, 'ProviderHost.hide() returning false means the window was not there \u2014 that is not a success');
      assert.ok(!r.ok);
      assert.ok(/real "not found", not a connectivity failure/.test(r.note),
        'the caller must be able to tell "no such window" from "cannot reach ClearGlass"');
    } finally { s.close(); delete process.env.WIRE_PORT; }
  });

  await test('PV-006', 'ClearGlass down \u2192 a specific reason, never a fabricated ok', async () => {
    process.env.WIRE_PORT = '1';
    delete require.cache[require.resolve(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'))];
    const T2 = require(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility'));
    try {
      const r = await T2.execute({ providerId: 'claude', where: 'background' });
      assert.ok(r.error && !r.ok);
      assert.strictEqual(r.providerId, 'claude', 'the failure must still say which provider it was about');
    } finally { delete process.env.WIRE_PORT; }
  });

  await test('PV-007', 'THE REGISTRY SURVIVES a registration whose module is missing', () => {
    const idx = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'index.js'), 'utf8');
    assert.ok(/HANDOFF GAP/.test(idx), 'the guard must state why it exists');
    assert.ok(/userscripts\.js/.test(idx), 'and name the file that is missing');
    const tools = require(path.join(ROOT, 'lib', 'agent-tools')).TOOLS;
    assert.ok(tools.size > 70, `an unguarded require took the WHOLE registry down \u2014 only ${tools.size} tools loaded`);
    assert.ok(tools.has('clear_glass_provider_visibility'));
  });

  await test('PV-008', 'the backend routes it calls genuinely exist', () => {
    const main = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'main', 'index.js'), 'utf8');
    for (const r of ['/provider/move-to-background', '/provider/bring-to-foreground']) {
      assert.ok(main.includes(r), `route ${r} is gone \u2014 this tool would call nothing`);
    }
    assert.ok(/providerHost\.hide\(providerId\)/.test(main));
    assert.ok(/providerHost\.show\(providerId\)/.test(main));
  });

  await test('PV-009', 'it REUSES the wire transport, not a second one', () => {
    const mine = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'provider-visibility.js'), 'utf8');
    const peer = fs.readFileSync(path.join(ROOT, 'lib', 'agent-tools', 'tools', 'clear-glass', 'dom-archaeology.js'), 'utf8');
    for (const s of ['WIRE_PORT', '127.0.0.1', 'timeout: 5000']) {
      assert.ok(mine.includes(s) && peer.includes(s), `${s} differs \u2014 two transports drift on timeout and error shape (\u00a710.3)`);
    }
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})();
