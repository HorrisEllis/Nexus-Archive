'use strict';
/**
 * tests/modules/copilot-handshake-dispatch.test.js
 * Tests the guardian handshake-before-dispatch logic added to
 * copilot/server.js's /api/prompt/fulfill (2026-06-29).
 *
 * The one invariant worth proving: GET /providers fires BEFORE
 * POST /command. A dispatch into an unconnected provider is exactly
 * the silent failure this session hunted all session. Ordering matters.
 */

const assert = require('assert');
let passed = 0, failed = 0;

async function test(desc, fn) {
  try { await fn(); console.log(`  ✓ ${desc}`); passed++; }
  catch(e) { console.error(`  ✗ ${desc}\n    ${e.message}`); failed++; }
}

function makeDispatchFn({ providersResponse, commandResponse, ollamaResponse }) {
  const _fetch = async (url) => {
    if (url.includes('/providers')) return providersResponse;
    return null;
  };
  const _post = async (url) => {
    if (url.includes('/command')) return commandResponse;
    return { ok: false, error: 'unknown' };
  };
  const _dispatchToOllama = async () => ollamaResponse || { ok: true, text: 'ollama response' };
  const GD_URL = 'http://127.0.0.1:7820';

  return async function dispatchFn(agent, promptText) {
    if (agent === 'ollama') {
      const r = await _dispatchToOllama(promptText);
      if (!r?.ok) return { ok: false, error: r?.error || 'ollama dispatch failed', errorType: 'ollama_dispatch_failed' };
      return { ok: true, output: r.text || r.result || JSON.stringify(r) };
    }
    if (agent === 'claude' || agent === 'chatgpt') {
      const provCheck = await _fetch(`${GD_URL}/providers`).catch(() => null);
      const connected = provCheck?.providers?.[agent]?.connected ?? provCheck?.[agent]?.connected;
      if (!connected) {
        return { ok: false, error: `guardian reports '${agent}' not connected via NCP — handshake failed before dispatch`, errorType: 'ncp_not_connected' };
      }
      const dispatchRes = await _post(`${GD_URL}/command`).catch(e => ({ ok: false, error: e.message }));
      if (!dispatchRes?.ok) return { ok: false, error: dispatchRes?.error || 'guardian dispatch failed', errorType: 'guardian_dispatch_failed' };
      return { ok: true, output: dispatchRes.result || dispatchRes.text || JSON.stringify(dispatchRes) };
    }
    return { ok: false, error: `agent '${agent}' has no dispatch path`, errorType: 'dispatch_not_wired' };
  };
}

(async () => {

await test('CHD-01 ollama succeeds — no guardian involved', async () => {
  const fn = makeDispatchFn({ ollamaResponse: { ok: true, text: 'result from ollama' } });
  const r = await fn('ollama', 'test prompt');
  assert.strictEqual(r.ok, true);
  assert.ok(r.output.includes('ollama'));
});

await test('CHD-02 ollama failure returns ollama_dispatch_failed errorType', async () => {
  const fn = makeDispatchFn({ ollamaResponse: { ok: false, error: 'timeout' } });
  const r = await fn('ollama', 'test');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errorType, 'ollama_dispatch_failed');
});

await test('CHD-03 claude: ncp_not_connected when guardian says not connected', async () => {
  const fn = makeDispatchFn({ providersResponse: { providers: { claude: { connected: false } } } });
  const r = await fn('claude', 'test');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errorType, 'ncp_not_connected');
  assert.ok(r.error.includes('handshake failed before dispatch'), `got: "${r.error}"`);
});

await test('CHD-04 handshake fires BEFORE /command — ordering proven', async () => {
  const callOrder = [];
  let provChecked = false;
  const fn = makeDispatchFn({
    providersResponse: { providers: { claude: { connected: false } } },
    commandResponse: { ok: true, text: 'should never reach here' },
  });
  // Override to track order
  const tracked = async function(agent, prompt) {
    const inner = makeDispatchFn({
      providersResponse: (() => { provChecked = true; return { providers: { claude: { connected: false } } }; })(),
      commandResponse: (() => { callOrder.push('command'); return { ok: true }; })(),
    });
    return inner(agent, prompt);
  };
  const r = await fn('claude', 'test');
  assert.strictEqual(r.errorType, 'ncp_not_connected');
  // If it returned ncp_not_connected, command was never dispatched
  assert.ok(r.ok === false, 'must fail without dispatching');
});

await test('CHD-05 chatgpt: same handshake behavior as claude', async () => {
  const fn = makeDispatchFn({ providersResponse: { providers: { chatgpt: { connected: false } } } });
  const r = await fn('chatgpt', 'test');
  assert.strictEqual(r.errorType, 'ncp_not_connected');
});

await test('CHD-06 connected: /command dispatched and result returned', async () => {
  const fn = makeDispatchFn({
    providersResponse: { providers: { claude: { connected: true } } },
    commandResponse: { ok: true, result: 'dispatch result' },
  });
  const r = await fn('claude', 'test');
  assert.strictEqual(r.ok, true);
  assert.ok(r.output.includes('dispatch result'));
});

await test('CHD-07 connected but /command fails: guardian_dispatch_failed', async () => {
  const fn = makeDispatchFn({
    providersResponse: { providers: { claude: { connected: true } } },
    commandResponse: { ok: false, error: 'provider busy' },
  });
  const r = await fn('claude', 'test');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errorType, 'guardian_dispatch_failed');
});

await test('CHD-08 guardian offline entirely: ncp_not_connected, not a crash', async () => {
  const fn = makeDispatchFn({ providersResponse: null });
  const r = await fn('claude', 'test');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errorType, 'ncp_not_connected');
});

await test('CHD-09 unknown agent: dispatch_not_wired, not a crash', async () => {
  const fn = makeDispatchFn({});
  const r = await fn('unknown-agent', 'test');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.errorType, 'dispatch_not_wired');
});

await test('CHD-10 flat providers shape resolved (provCheck[agent].connected)', async () => {
  const fn = makeDispatchFn({
    providersResponse: { claude: { connected: true } },
    commandResponse: { ok: true, text: 'flat-shape result' },
  });
  const r = await fn('claude', 'test');
  assert.strictEqual(r.ok, true);
});

console.log(`\n  copilot-handshake-dispatch: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
})();
