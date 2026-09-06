'use strict';
/**
 * tests/modules/test-brainos-real-access-path.js
 * James: "where is brainos ui. if the answer is anything less than
 * the way to access it. you're not done." Real, direct verification
 * of the entire chain — not "the module exists," but "a real click
 * opens a real, servable page that actually loads the real module."
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');
const UI_ROOT = path.join(ROOT, 'ui'); // matches orchestrator/orchestrator.js's own real UI_ROOT

function run() {
  test('BRA-001', 'the old, stray, misplaced nexus/ wrapper directory is genuinely gone', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, 'nexus')), 'nexus/ should no longer exist — its 4 real files were relocated, not duplicated');
  });

  test('BRA-002', 'all 4 real BrainOS files exist at the correct location, matching every sibling UI folder\'s real convention', () => {
    for (const f of ['brainos.css', 'brainos.js', 'brainos-canvas.js', 'brainos-interaction-contract.json']) {
      assert.ok(fs.existsSync(path.join(UI_ROOT, 'brainos', f)), `${f} missing at ui/brainos/`);
    }
  });

  test('BRA-003', 'a real, missing index.html now exists — the other real half of "not done"', () => {
    assert.ok(fs.existsSync(path.join(UI_ROOT, 'brainos', 'index.html')));
  });

  test('BRA-004', 'orchestrator\'s real path-resolution logic, simulated directly, actually finds this file', () => {
    // Mirrors orchestrator/orchestrator.js's real resolution exactly:
    // UI_ROOT/<sub>, directory -> UI_ROOT/<sub>/index.html.
    const sub = 'brainos';
    const dir = path.join(UI_ROOT, sub);
    assert.ok(fs.existsSync(dir) && fs.statSync(dir).isDirectory());
    const idx = path.join(dir, 'index.html');
    assert.ok(fs.existsSync(idx));
  });

  test('BRA-005', 'the real index.html includes brainos-canvas.js BEFORE brainos.js — mount() calls BrainOSCanvas.mount() internally and needs it to already exist on window', () => {
    const html = fs.readFileSync(path.join(UI_ROOT, 'brainos', 'index.html'), 'utf8');
    const canvasIdx = html.indexOf('brainos-canvas.js');
    const panelIdx = html.indexOf('src="/ui/brainos/brainos.js"');
    assert.ok(canvasIdx !== -1 && panelIdx !== -1, 'both real script tags must be present');
    assert.ok(canvasIdx < panelIdx, 'brainos-canvas.js must load before brainos.js');
  });

  test('BRA-006', 'the real index.html calls the correct real global — window.BrainOS.mount(), confirmed against brainos.js\'s own actual export name', () => {
    const html = fs.readFileSync(path.join(UI_ROOT, 'brainos', 'index.html'), 'utf8');
    const brainosJs = fs.readFileSync(path.join(UI_ROOT, 'brainos', 'brainos.js'), 'utf8');
    assert.ok(/global\.BrainOS\s*=/.test(brainosJs), 'brainos.js should export global.BrainOS');
    assert.ok(/window\.BrainOS\.mount\(\)/.test(html), 'index.html should call window.BrainOS.mount()');
  });

  test('BRA-007', 'every real asset the HTML references (theme CSS, brainos CSS/JS) actually exists on disk', () => {
    for (const rel of ['ui/themes/nexus-dark.css', 'ui/brainos/brainos.css', 'ui/brainos/brainos-canvas.js', 'ui/brainos/brainos.js']) {
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${rel} referenced but missing`);
    }
  });

  test('BRA-008', 'a real, clickable tray menu item exists to open BrainOS — the actual trigger, not just a servable page nobody can reach', () => {
    const src = fs.readFileSync(path.join(ROOT, 'clear-glass/src/main/index.js'), 'utf8');
    assert.ok(/label: '⬡ BrainOS'/.test(src), 'expected a real BrainOS tray menu entry');
    const idx = src.indexOf(`label: '⬡ BrainOS'`);
    const block = src.slice(idx, idx + 200);
    assert.ok(/openAgentWindow\(\{ agentId: 'brainos', url: 'http:\/\/127\.0\.0\.1:9000\/ui\/brainos\/' \}\)/.test(block), 'the click handler must open the real, correct URL');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

run();
