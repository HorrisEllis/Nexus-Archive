'use strict';
// CHUNK C (docs/copilot-awareness-routing-phasemap.spec) — CA5 intent routing +
// CA6 editable config. CA5: intent→agent by strength (perplexity=data,
// claude=big-code+WARP, chatgpt=optimal-900tok-chunked, gemini=coding/
// adversarial), auto + user-directed. CA6: the map is editable cortex rows.
const _log = console.log;
console.log = (...a) => { const s = a[0]; if (typeof s === 'string' && s.startsWith('[jaa]')) return; _log(...a); };

const assert = require('assert');
const path = require('path');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); _log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { _log(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const { routeAgent, chunkForAgent, _inferIntent } = require(path.join(ROOT, 'lib/agent-router'));
const cfg = require(path.join(ROOT, 'lib/routing-config'));

// ── CA5 ──
test('T-001', 'CA5: a data/research task routes to perplexity', () => {
  assert.strictEqual(routeAgent({ intent: 'data' }).agent, 'perplexity');
  assert.strictEqual(routeAgent({ intent: 'research' }).agent, 'perplexity');
});

test('T-002', 'CA5: a large-codebase task routes to claude WITH WARP + context injected', () => {
  const r = routeAgent({ intent: 'large_code' });
  assert.strictEqual(r.agent, 'claude');
  assert.ok(r.inject.includes('warp') && r.inject.includes('context'), 'must inject WARP + context');
});

test('T-003', 'CA5: adversarial → gemini; general → chatgpt with a 900-token constraint', () => {
  assert.strictEqual(routeAgent({ intent: 'adversarial' }).agent, 'gemini');
  const g = routeAgent({ intent: 'general' });
  assert.strictEqual(g.agent, 'chatgpt');
  assert.strictEqual(g.constraints.maxTokens, 900);
});

test('T-004', 'CA5: a user-directed agent OVERRIDES auto (user in control)', () => {
  const r = routeAgent({ intent: 'data', directed: 'gemini' });
  assert.strictEqual(r.agent, 'gemini');
  assert.strictEqual(r.directed, true);
});

test('T-005', 'CA5: claude is the LAST resort in the fallback chain', () => {
  const r = routeAgent({ intent: 'data' });
  assert.strictEqual(r.fallbackChain[r.fallbackChain.length - 1], 'claude');
});

test('T-006', 'CA5: intent inference from prompt (data / large_code / adversarial)', () => {
  assert.strictEqual(_inferIntent('what is the latest news on rates'), 'data');
  assert.strictEqual(_inferIntent('refactor the entire codebase'), 'large_code');
  assert.strictEqual(_inferIntent('run an adversarial attack on the parser'), 'adversarial');
});

test('T-007', 'CA5: chatgpt chunks a long input (the 900-token limit chunking is real, §17.11)', () => {
  const long = 'word '.repeat(2000);
  assert.ok(chunkForAgent(long, 'chatgpt').length > 1, 'chatgpt must chunk');
  assert.strictEqual(chunkForAgent(long, 'perplexity').length, 1, 'perplexity does not chunk');
});

// ── CA6 ──
test('T-008', 'CA6: config loads built-in defaults before any edit', () => {
  const d = cfg.getRoutingConfig();
  assert.ok(Array.isArray(d.routes) && d.routes.length >= 5);
});

test('T-009', 'CA6: editing an intent→agent persists a NEW version (cortex row, §0.3)', () => {
  const before = cfg.getRoutingConfig().version;
  const r = cfg.setAgentForIntent('data', 'gemini', 'test');
  assert.ok(r.version > before, 'version must bump on edit');
  assert.strictEqual(cfg.getRoutingConfig().routes.find(x => x.intent === 'data').agent, 'gemini');
});

test('T-010', 'CA6: the router RESPECTS the edited config (fluid — no code change)', () => {
  cfg.setAgentForIntent('data', 'chatgpt', 'test2');
  const routed = routeAgent({ intent: 'data', config: cfg.getRoutingConfig() });
  assert.strictEqual(routed.agent, 'chatgpt', 'the router must use the edited route');
});

test('T-011', 'CA6: token limits are editable', () => {
  cfg.setTokenLimit('chatgpt', 1500, true);
  assert.strictEqual(cfg.getRoutingConfig().constraints.chatgpt.maxTokens, 1500);
});

_log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
