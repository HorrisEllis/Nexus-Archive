'use strict';
// GAP_1 closure test (2026-07-25). autopilot.spec and loom.spec were written to
// DESCRIBE running code. A spec that lies is worse than no spec, so this asserts
// every concrete route/version/behavior claim against the real source. If the
// code changes and a spec claim goes stale, this fails — the spec stays honest.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const autopilotSrc = fs.readFileSync(path.join(ROOT, 'autopilot.js'), 'utf8');
const loomSrc      = fs.readFileSync(path.join(ROOT, 'loom/server.js'), 'utf8');
const autopilotSpec = fs.readFileSync(path.join(ROOT, 'autopilot/spec/autopilot.spec'), 'utf8');
const loomSpec      = fs.readFileSync(path.join(ROOT, 'loom/spec/loom.spec'), 'utf8');

// ── the specs exist at the standard <system>/spec/<system>.spec path ──
test('T-001', 'both specs exist at the standard system-local path', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'autopilot/spec/autopilot.spec')));
  assert.ok(fs.existsSync(path.join(ROOT, 'loom/spec/loom.spec')));
});

// ── autopilot.spec claims vs source ──
test('T-002', 'autopilot.spec: /status route claim is true', () => {
  assert.ok(/status/.test(autopilotSpec), 'spec must claim it');
  assert.ok(/req\.url === '\/status'/.test(autopilotSrc), 'source must have /status');
});

test('T-003', 'autopilot.spec: /spawn/:kernel and /touch/:kernel claims are true', () => {
  assert.ok(/\/spawn\/:kernel/.test(autopilotSpec) && /\/touch\/:kernel/.test(autopilotSpec));
  assert.ok(/\^\\\/spawn\\\/\(\[a-zA-Z0-9-\]\+\)\$/.test(autopilotSrc), 'source has /spawn matcher');
  assert.ok(/\^\\\/touch\\\/\(\[a-zA-Z0-9-\]\+\)\$/.test(autopilotSrc), 'source has /touch matcher');
});

test('T-004', 'autopilot.spec: circuit-open writes a kernel_circuit_open gap — claim is true', () => {
  assert.ok(/kernel_circuit_open/.test(autopilotSpec), 'spec claims it');
  assert.ok(/kernel_circuit_open/.test(autopilotSrc), 'source writes it');
});

test('T-005', 'autopilot.spec: dormant≠crash distinction — claim is true', () => {
  assert.ok(/idle despawn.*never.*crash|dormant.*not.*crash|INTENTIONAL stops/.test(autopilotSpec.replace(/\s+/g,' ')));
  assert.ok(/dormant/.test(autopilotSrc));
});

test('T-006', 'autopilot.spec: default status port 7799 — claim matches source', () => {
  assert.ok(/:7799/.test(autopilotSpec));
  assert.ok(/DEFAULT_STATUS_PORT = 7799/.test(autopilotSrc));
});

// ── loom.spec claims vs source ──
test('T-007', 'loom.spec: version matches lib/version.js', () => {
  const real = require(path.join(ROOT, 'lib/version')).services.loom;
  const specV = loomSpec.match(/version:\s*([0-9.]+)/)[1];
  assert.strictEqual(specV, real, `spec ${specV} must equal registry ${real}`);
});

test('T-008', 'loom.spec: port 3752 — claim matches source', () => {
  assert.ok(/port:\s*3752/.test(loomSpec));
  assert.ok(/LOOM_PORT \|\| '3752'/.test(loomSrc));
});

test('T-009', 'loom.spec: /api/hooks/wire (the consumer-edge write path) — claim is true', () => {
  assert.ok(/\/api\/hooks\/wire/.test(loomSpec));
  assert.ok(/id === 'wire'/.test(loomSrc), 'source has the wire route');
});

test('T-010', 'loom.spec: hooks-project-from-components — claim is true', () => {
  assert.ok(/PROJECTION of the canonical component/.test(loomSpec));
  assert.ok(/syncFromComponentRegistry/.test(loomSrc), 'source runs the projection');
});

test('T-011', 'loom.spec: /api/impact blast-radius route — claim is true', () => {
  assert.ok(/\/api\/impact/.test(loomSpec));
  assert.ok(/\/api\/impact\//.test(loomSrc));
});

test('T-012', 'both specs declare the write-authority / broker role the tablet depends on', () => {
  assert.ok(/connection broker|one endpoint|broker/i.test(autopilotSpec), 'autopilot must declare broker role');
  assert.ok(/WRITE AUTHORITY/.test(loomSpec), 'loom must declare write authority');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
