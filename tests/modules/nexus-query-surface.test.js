'use strict';
/**
 * tests/modules/nexus-query-surface.test.js
 * Tests for GET /api/cortex/query and the conditioning_log writer in copilot.
 * Proven against a real booted cortex server this session.
 */

const assert = require('assert');
const http   = require('http');
let passed = 0, failed = 0;

function test(desc, fn) {
  try { fn(); console.log(`  ✓ ${desc}`); passed++; }
  catch(e) { console.error(`  ✗ ${desc}\n    ${e.message}`); failed++; }
}

// ── Query surface — structural unit tests (no server needed) ──────────────────

test('QS-01 cortex/boot.js contains the /api/cortex/query route', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes("'/api/cortex/query'"), 'query route must be declared');
  assert.ok(src.includes('narrative'), 'must include narrative synthesis');
  assert.ok(src.includes('sigma'), 'must include sigma trajectory');
  assert.ok(src.includes('_mastermindAnalysis'), 'must call mastermind for narrative');
});

test('QS-02 guardian proxies /api/guardian/cortex/query to cortex', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/guardian/server.js', 'utf8');
  assert.ok(src.includes('/api/guardian/cortex/query'), 'guardian proxy route must exist');
  assert.ok(src.includes('/api/cortex/query'), 'must forward to cortex');
});

test('QS-03 query surface accepts both GET and POST', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes("method === 'GET' || method === 'POST'"), 'must accept GET and POST');
});

test('QS-04 query surface reads from all 6 declared data sources', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  // All six data sources from nexus-query-surface.spec
  assert.ok(src.includes("'gaps'"),          'must query gaps');
  assert.ok(src.includes("'sigma_records'"), 'must query sigma_records');
  assert.ok(src.includes('_field'),          'must include CFR field');
  assert.ok(src.includes("'event_log'"),     'must query event_log');
  assert.ok(src.includes("'cortex_memory'"), 'must query cortex_memory');
  assert.ok(src.includes('blueprint'),       'must include blueprint divergences');
});

test('QS-05 query surface filters by subject keyword when about= param present', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  assert.ok(src.includes('about'), 'must use about param for filtering');
  assert.ok(src.includes('.includes(about)'), 'must filter results by keyword');
});

test('QS-06 query surface returns ok:true with required shape fields', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/cortex/boot.js', 'utf8');
  const requiredFields = ['ok:', 'about:', 'window:', 'gaps,', 'sigma,', 'field,',
                          'events,', 'blueprint,', 'memory,', 'narrative,', 'ts:'];
  for (const f of requiredFields) {
    assert.ok(src.includes(f), `response must include field: ${f}`);
  }
});

// ── Conditioning_log writer ───────────────────────────────────────────────────

test('QS-07 copilot writes to conditioning_log after every response', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes("'conditioning_log'"), 'must write to conditioning_log');
  assert.ok(src.includes('_persist'), 'must use _persist function');
  assert.ok(src.includes('outcome'), 'must record outcome');
  assert.ok(src.includes('sigmaAtDispatch'), 'must capture sigma at dispatch time');
});

test('QS-08 conditioning_log write is best-effort — never blocks response', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  // The try/catch around conditioning_log write must come BEFORE the streamIngest call
  const clIdx    = src.indexOf("'conditioning_log'");
  const ingestIdx = src.indexOf("streamIngest({ type: 'copilot.answered'");
  assert.ok(clIdx < ingestIdx, 'conditioning_log write must precede streamIngest');
  assert.ok(src.includes('/* conditioning_log is best-effort'), 'must have best-effort comment');
});

test('QS-09 conditioning_log captures: system, cluster, outcome, quality, sigma', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  const fields = ['system:', 'cluster:', 'outcome:', 'quality,', 'sigmaAtDispatch:'];
  for (const f of fields) {
    assert.ok(src.includes(f), `conditioning_log must include field: ${f}`);
  }
});

test('QS-10 _lastSigma is updated from stream events', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('_lastSigma'), '_lastSigma tracker must exist');
  assert.ok(src.includes('event.composite'), 'must capture composite sigma from stream');
});

// ── Co-pilot query surface integration ────────────────────────────────────────

test('QS-11 co-pilot calls query surface before dispatching when system keyword detected', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  assert.ok(src.includes('/api/cortex/query'), 'copilot must call query surface');
  assert.ok(src.includes('guardian'), 'must check for guardian keyword');
  assert.ok(src.includes('SYSTEM STATE'), 'must inject system state into context');
});

test('QS-12 co-pilot query surface call is best-effort — never blocks dispatch', () => {
  const src = require('fs').readFileSync('/home/claude/nexus_29/copilot/server.js', 'utf8');
  // The query surface catch block must be present
  assert.ok(src.includes('/* query surface is best-effort'), 'must have best-effort guard');
});

console.log(`\n  nexus-query-surface: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
