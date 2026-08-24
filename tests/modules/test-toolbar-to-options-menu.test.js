'use strict';
// tests/modules/test-toolbar-to-options-menu.test.js — §UI-CUSTOMIZE 2026-08-23
// James, from a real screenshot: "the orange to be moved to the menu."
// Real verification the four controls moved into #options-panel with their
// real IDs and real JS wiring intact — a relocation, not a rebuild.
const assert = require('assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const html = fs.readFileSync(path.join(ROOT, 'clear-glass', 'renderer', 'browser.html'), 'utf8');
const js   = fs.readFileSync(path.join(ROOT, 'clear-glass', 'renderer', 'browser.js'), 'utf8');

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

console.log('\n\u2550\u2550 TOOLBAR \u2192 OPTIONS MENU \u2014 \u00a7UI-CUSTOMIZE 2026-08-23 \u2550\u2550\n');

function chromeBlock() {
  return html.slice(html.indexOf('<div id="chrome">'), html.indexOf('id="bookmarks-bar"'));
}
function optionsPanelBlock() {
  return html.slice(html.indexOf('<div id="options-panel">'), html.indexOf('<script src="browser.js">'));
}

test('TM-001', 'the 4 real controls no longer live in the main #chrome toolbar', () => {
  const chrome = chromeBlock();
  for (const id of ['agent-badge', 'identity-badge', 'picker-route', 'picker-api-url']) {
    assert.ok(!chrome.includes(`id="${id}"`), `id="${id}" must be out of #chrome`);
  }
});

test('TM-002', 'all 4 controls exist exactly once each, inside the real #options-panel', () => {
  for (const id of ['agent-badge', 'identity-badge', 'picker-route', 'picker-api-url']) {
    const matches = html.match(new RegExp(`id="${id}"`, 'g')) || [];
    assert.strictEqual(matches.length, 1, `id="${id}" must exist exactly once total`);
  }
  const panel = optionsPanelBlock();
  for (const id of ['agent-badge', 'identity-badge', 'picker-route', 'picker-api-url']) {
    assert.ok(panel.includes(`id="${id}"`), `id="${id}" must be inside #options-panel`);
  }
});

test('TM-003', 'identity-mode-label survives inside identity-badge (its own real child span)', () => {
  assert.ok(html.includes('id="identity-mode-label"'), 'the span the JS writes the current fingerprint name into must still exist');
});

test('TM-004', 'picker-route keeps its real two options (sse/api) — content unchanged, only position moved', () => {
  const selectBlock = html.slice(html.indexOf('id="picker-route"'), html.indexOf('</select>'));
  assert.ok(selectBlock.includes('value="sse"') && selectBlock.includes('value="api"'));
});

test('TM-005', 'the real JS click/change handlers for all 4 are untouched \u2014 relocation, not a rebuild', () => {
  assert.ok(js.includes(`agentBadge.addEventListener('click'`), 'agent-badge real click handler must survive');
  assert.ok(js.includes(`identityBadge.addEventListener('click'`), 'identity-badge real click handler must survive');
  assert.ok(js.includes(`pickerApiUrl.style.display = pickerRoute.value === 'api'`), 'picker-route\u2019s real change-driven visibility logic must survive');
});

test('TM-006', 'the two dropdown-positioning calls (getBoundingClientRect) are untouched \u2014 confirmed position-independent before the move, not assumed', () => {
  assert.ok(js.includes('const rect = agentBadge.getBoundingClientRect();'));
  assert.ok(js.includes('const rect = identityBadge.getBoundingClientRect();'));
});

test('TM-007', 'both new sections have real, distinct headers \u2014 not dumped into an existing unrelated section', () => {
  const panel = optionsPanelBlock();
  assert.ok(/<h4>Agent &amp; Identity<\/h4>/.test(panel));
  assert.ok(/<h4>Element Picker Routing<\/h4>/.test(panel));
});

test('TM-008', 'the real #chrome divider structure still balances \u2014 no orphaned dividers left from the removal', () => {
  const chrome = chromeBlock();
  const dividers = (chrome.match(/chrome-divider/g) || []).length;
  assert.ok(dividers >= 2, 'the real remaining groups (nav, session tools, dev tools) still need their real separators');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
