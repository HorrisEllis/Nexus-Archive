'use strict';

/**
 * tests/modules/mco18-tv-shell-cli.test.js
 *
 * §MCO18 2026-09-13 — James: "floating menu button cli." Real test for
 * the CLI_COMMANDS table + asRunCliCommand() added to ui/tv-shell/
 * index.html's asSend(). Extracts the real source (not a rewritten
 * copy) between its own real markers and runs it in a real jsdom
 * sandbox — same technique ui/copilot/copilot.test.js already
 * established for this exact class of embedded-HTML JS.
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SRC_PATH = path.join(__dirname, '..', '..', 'ui', 'tv-shell', 'index.html');

function extractCliBlock() {
  const html = fs.readFileSync(SRC_PATH, 'utf8');
  const start = html.indexOf('const CLI_COMMANDS');
  const end = html.indexOf('async function asSend()');
  if (start === -1 || end === -1) throw new Error('CLI block markers not found — tv-shell/index.html may have changed shape');
  return html.slice(start, end);
}

function freshSandbox({ fetchImpl, guardianPort, cortexPort, copilotPort } = {}) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'dangerously' });
  const { window } = dom;
  window.B = { gd: `http://127.0.0.1:${guardianPort || 7820}`, cx: `http://127.0.0.1:${cortexPort || 3748}` };
  window.NEXUS_PORTS = { copilot: copilotPort || 3750 };
  window._logToData = () => {};
  window.fetch = fetchImpl || (() => Promise.reject(new Error('no fetch configured for this test')));
  const src = extractCliBlock();
  const scriptEl = window.document.createElement('script');
  scriptEl.textContent = src;
  window.document.body.appendChild(scriptEl);
  return window;
}

let pass = 0, fail = 0;
async function test(name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.stack}`); }
}

async function main() {
  await test('CLI-001: the real command table loads with the expected real commands', () => {
    const w = freshSandbox();
    const names = w.eval('Object.keys(CLI_COMMANDS)');
    assert.ok(names.includes('help'));
    assert.ok(names.includes('tools'));
    assert.ok(names.includes('raid'));
    assert.ok(names.includes('ncp'));
    assert.ok(names.includes('responses'));
  });

  await test('CLI-002: an unknown command produces a real, specific error naming what IS available, not a silent no-op', async () => {
    const w = freshSandbox();
    const out = w.document.createElement('div');
    await w.asRunCliCommand('bogus', out);
    assert.ok(out.textContent.includes('Unknown command: /bogus'));
    assert.ok(out.textContent.includes('/help'));
  });

  await test('CLI-003: /tools calls the real copilot /api/tools endpoint and renders the real result', async () => {
    let calledUrl = null;
    const w = freshSandbox({
      copilotPort: 3750,
      fetchImpl: (url) => { calledUrl = url; return Promise.resolve({ json: () => Promise.resolve({ ok: true, count: 2, tools: [{ name: 'x', description: 'does x thing really well beyond ninety characters to test the real slice behavior here' }, { name: 'y', description: 'y' }] }) }); },
    });
    const out = w.document.createElement('div');
    await w.asRunCliCommand('tools', out);
    assert.strictEqual(calledUrl, 'http://127.0.0.1:3750/api/tools');
    assert.ok(out.textContent.includes('2 real tools'));
    assert.ok(out.textContent.includes('x —'));
  });

  await test('CLI-004: /raid submit builds the real POST body, including --surface and --agent flags', async () => {
    let calledUrl = null, calledBody = null;
    const w = freshSandbox({
      cortexPort: 3748,
      fetchImpl: (url, opts) => {
        calledUrl = url; calledBody = JSON.parse(opts.body);
        return Promise.resolve({ json: () => Promise.resolve({ ok: true, queueId: 'q-real-1' }) });
      },
    });
    const out = w.document.createElement('div');
    await w.asRunCliCommand('raid submit automate the real page --surface browser --agent claude', out);
    assert.strictEqual(calledUrl, 'http://127.0.0.1:3748/api/raid/submit');
    assert.strictEqual(calledBody.content, 'automate the real page');
    assert.strictEqual(calledBody.executionSurface, 'browser');
    assert.strictEqual(calledBody.forAgent, 'claude');
    assert.ok(out.textContent.includes('q-real-1'));
  });

  await test('CLI-005: /raid submit with no real content is refused with a real, specific usage error', async () => {
    const w = freshSandbox();
    const out = w.document.createElement('div');
    await w.asRunCliCommand('raid submit', out);
    assert.ok(out.textContent.includes('non-empty contract body'));
  });

  await test('CLI-006: /ncp <provider> calls the real GET /ncp/clients?provider=... and surfaces the real dispatch target', async () => {
    let calledUrl = null;
    const w = freshSandbox({
      guardianPort: 7820,
      fetchImpl: (url) => {
        calledUrl = url;
        return Promise.resolve({ json: () => Promise.resolve({ ok: true, clients: [{ tabId: 't1', claimed: true, lastHeartbeat: Date.now() }], wouldDispatchTo: { tabId: 't1' } }) });
      },
    });
    const out = w.document.createElement('div');
    await w.asRunCliCommand('ncp chatgpt', out);
    assert.strictEqual(calledUrl, 'http://127.0.0.1:7820/ncp/clients?provider=chatgpt');
    assert.ok(out.textContent.includes('would dispatch to: t1'));
  });

  await test('CLI-007: /responses queries the real GET /api/responses and renders real entries', async () => {
    const w = freshSandbox({
      guardianPort: 7820,
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ ok: true, responses: [{ ts: Date.now(), domEventType: 'dom.mutation', compartmentUuid: 'c-1' }] }) }),
    });
    const out = w.document.createElement('div');
    await w.asRunCliCommand('responses', out);
    assert.ok(out.textContent.includes('dom.mutation'));
    assert.ok(out.textContent.includes('c-1'));
  });

  await test('CLI-008: a real backend failure surfaces the real error, never fabricates success', async () => {
    const w = freshSandbox({
      guardianPort: 7820,
      fetchImpl: () => Promise.resolve({ json: () => Promise.resolve({ ok: false, error: 'guardian unreachable — is it running?' }) }),
    });
    const out = w.document.createElement('div');
    await w.asRunCliCommand('ncp chatgpt', out);
    assert.ok(out.textContent.includes('guardian unreachable'));
  });

  console.log(`\n  mco18-tv-shell-cli: ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main();
