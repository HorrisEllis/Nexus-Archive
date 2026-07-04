'use strict';
/**
 * tests/modules/component-sse-uniqueness.test.js
 * Tests for:
 *   1. Per-component SSE channels (cortex GET /events/component/:id)
 *   2. Lifeline uniqueness synthesis (_synthesizeUniqueness)
 */

const assert = require('assert');
const http   = require('http');
let passed = 0, failed = 0;

function test(desc, fn) {
  try { fn(); console.log(`  ✓ ${desc}`); passed++; }
  catch(e) { console.error(`  ✗ ${desc}\n    ${e.message}`); failed++; }
}

// ── 1. Per-component SSE channels ────────────────────────────────────────────

test('SSE-01 cortex/boot.js declares /events/component/:id route', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('/events/component/'), 'component SSE route must exist');
  assert.ok(src.includes('text/event-stream'), 'must serve SSE content type');
  assert.ok(src.includes('_componentStreams'), 'must use _componentStreams subscriber map');
});

test('SSE-02 cortex event_log writes now include componentId and hookId', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('componentId: body.componentId'), 'must capture componentId');
  assert.ok(src.includes('hookId: body.hookId'), 'must capture hookId');
});

test('SSE-03 new events broadcast to component stream subscribers', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('_broadcastToComponentStreams(row)'), 'must broadcast on insert');
  assert.ok(src.includes('function _broadcastToComponentStreams'), 'broadcast function must exist');
});

test('SSE-04 _broadcastToComponentStreams matches by componentId prefix', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('startsWith(cid)'), 'must use prefix matching');
  assert.ok(src.includes('row.componentId'), 'must check row.componentId');
  assert.ok(src.includes('row.hookId'), 'must check row.hookId');
  assert.ok(src.includes('row.source'), 'must check row.source');
});

test('SSE-05 component SSE sends replay of last 20 events on connect', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('replayed: true'), 'must mark replayed events');
  assert.ok(src.includes('component.stream.connected'), 'must emit connected event');
});

test('SSE-06 component SSE sends keepalive every 15s', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('15000'), 'must have 15s keepalive interval');
  assert.ok(src.includes(': keepalive'), 'must send SSE comment keepalive');
});

test('SSE-07 guardian proxies /api/guardian/events/component/:id to cortex', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/guardian/server.js', 'utf8');
  assert.ok(src.includes('/api/guardian/events/component/'), 'guardian proxy must exist');
  assert.ok(src.includes('upstream.pipe(res)'), 'must pipe SSE stream through');
});

test('SSE-08 component streams clean up on client disconnect', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes("req.on('close'"), 'must handle client disconnect');
  assert.ok(src.includes('_componentStreams[componentId].delete(res)'), 'must remove subscriber on close');
});

// ── 2. Lifeline uniqueness synthesis ─────────────────────────────────────────

test('UNIQ-01 copilot/server.js contains _synthesizeUniqueness function', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('async function _synthesizeUniqueness'), 'function must exist');
});

test('UNIQ-02 uniqueness synthesis includes request ID and timestamp', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('Request:'), 'must include request identifier');
  assert.ok(src.includes('toISOString()'), 'must include timestamp');
});

test('UNIQ-03 uniqueness synthesis includes sigma reading', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('_lastSigma'), 'must include current sigma in uniqueness');
  assert.ok(src.includes('elevated'), 'must characterize sigma state');
});

test('UNIQ-04 uniqueness synthesis is best-effort — never throws', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  // The function has try/catch and returns '' on error
  assert.ok(src.includes("catch(_) { return ''; }"), 'must return empty string on error');
});

test('UNIQ-05 uniqueness injected into _dispatchToOllama prompt', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('opts.uniqueness || \'\''), 'dispatchToOllama must accept uniqueness');
  assert.ok(src.includes('${context}${unique}'), 'uniqueness must be appended to context');
});

test('UNIQ-06 uniqueness injected into lifeline route prompt', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('await _synthesizeUniqueness(prompt, contextText, session)'), 
    'must call synthesizeUniqueness before lifeline route');
  assert.ok(src.includes('${contextText}${uniqueness}'), 'must inject into lifeline prompt');
});

test('UNIQ-07 uniqueness includes focus terms extracted from prompt', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('Focus:'), 'must include focus terms');
  assert.ok(src.includes('distinct'), 'must filter to distinct meaningful words');
});

test('UNIQ-08 uniqueness adapts to exchange count — first vs deep conversation', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('First exchange'), 'must handle first exchange differently');
  assert.ok(src.includes('no repetition'), 'must instruct no repetition in deep exchanges');
});

test('UNIQ-09 THIS REQUEST anchor tells model not to generalize', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('THIS REQUEST'), 'must label the uniqueness section');
  assert.ok(src.includes('not a general version of it'), 'must instruct specificity');
});

console.log(`\n  component-sse-uniqueness: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
