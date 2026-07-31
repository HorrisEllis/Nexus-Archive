'use strict';
// copilot/cli.js + copilot/command-core.js (2026-07-30) — co-pilot owns the
// command surface. The core moved from guardian/ to copilot/; this pins that
// the CLI works, the core loads in both Node and browser contexts, and every
// consumer points at copilot/ (no dangling guardian/command-core reference).
const assert = require('assert');
const fs = require('fs');
const path = require('path');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

async function testAsync(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');

test('T-001', 'copilot/command-core.js exists and exports the command builders', () => {
  const core = require(path.join(ROOT, 'copilot/command-core.js'));
  for (const m of ['ask', 'code', 'multi', 'sendFile', 'sendSpec', 'raw', 'post', 'get']) {
    assert.strictEqual(typeof core[m], 'function', `core must export ${m}`);
  }
});

test('T-002', 'copilot/cli.js exists and is a runnable module', () => {
  const cli = require(path.join(ROOT, 'copilot/cli.js'));
  assert.strictEqual(typeof cli.main, 'function', 'cli must export main()');
});

test('T-003', 'the core loads in a browser context (exposes window.GuardianCommand)', () => {
  const prevWindow = global.window;
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'copilot/command-core.js'))];
  require(path.join(ROOT, 'copilot/command-core.js'));
  const ok = !!global.window.GuardianCommand;
  global.window = prevWindow;
  delete require.cache[require.resolve(path.join(ROOT, 'copilot/command-core.js'))];
  assert.ok(ok, 'browser <script> load must expose window.GuardianCommand');
});

test('T-005', 'guardian/cli.js delegates to the copilot core (not its own http)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'guardian/cli.js'), 'utf8');
  assert.ok(/require\('\.\.\/copilot\/command-core'\)/.test(src), 'guardian/cli.js must import copilot/command-core');
});

test('T-006', 'no consumer references the OLD guardian/command-core path (no dangling ref)', () => {
  const consumers = ['guardian/cli.js', 'ui/tv-shell/index.html', 'ui/agents/chatgpt/index.html', 'orchestrator.js'];
  for (const c of consumers) {
    const src = fs.readFileSync(path.join(ROOT, c), 'utf8');
    assert.ok(!/guardian\/command-core/.test(src), `${c} must not reference guardian/command-core (moved to copilot/)`);
    assert.ok(/copilot\/command-core/.test(src), `${c} must reference copilot/command-core`);
  }
});

test('T-007', 'orchestrator serves the core from the copilot path', () => {
  const src = fs.readFileSync(path.join(ROOT, 'orchestrator.js'), 'utf8');
  assert.ok(/u\.pathname===['"]\/copilot\/command-core\.js['"]/.test(src), 'orchestrator must serve /copilot/command-core.js');
});

(async () => {
  await testAsync('T-004', 'the builders produce the correct /command body (ask)', async () => {
    const core = require(path.join(ROOT, 'copilot/command-core.js'));
    const prevFetch = global.fetch;
    let captured = null;
    global.fetch = async (url, opts) => { captured = JSON.parse(opts.body); return { ok: true, status: 200, json: async () => ({ ok: true }) }; };
    await core.ask('claude', 'what is entropy', { base: 'http://x', source: 'test' });
    global.fetch = prevFetch;
    assert.strictEqual(captured.command, 'ask');
    assert.strictEqual(captured.provider, 'claude');
    assert.strictEqual(captured.prompt, 'what is entropy');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
