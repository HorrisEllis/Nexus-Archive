'use strict';
// tests/modules/test-status-strip-removal.test.js — §UI-CUSTOMIZE 2026-08-23
// James, from real screenshots: "remove the nexus, health, ja4, health, and
// cookies... remove the whole area" + "red circle to be where the bookmarks
// icon is." Real verification that the removal was safe (no live crash risk
// left behind) and the bookmark button genuinely relocated with its real
// behavior intact.
const assert = require('assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const htmlPath = path.join(ROOT, 'clear-glass', 'renderer', 'browser.html');
const cssPath  = path.join(ROOT, 'clear-glass', 'renderer', 'browser.css');
const jsPath   = path.join(ROOT, 'clear-glass', 'renderer', 'browser.js');
const html = fs.readFileSync(htmlPath, 'utf8');
const css  = fs.readFileSync(cssPath, 'utf8');
const js   = fs.readFileSync(jsPath, 'utf8');

let passed = 0, failed = 0;
function test(id, name, fn) {
  try { fn(); passed++; console.log(`  \u2713 ${id} ${name}`); }
  catch (e) { failed++; console.log(`  \u2717 ${id} ${name}\n    ${e.message}`); }
}

console.log('\n\u2550\u2550 STATUS STRIP REMOVAL \u2014 \u00a7UI-CUSTOMIZE 2026-08-23 \u2550\u2550\n');

test('SS-001', '#status-strip container no longer exists in the real HTML', () => {
  assert.ok(!/<div id="status-strip">/.test(html), 'the container element is gone');
});

test('SS-002', 'the 6 named status elements (nexus/sse/tls/agent/url/health/cookies) are gone', () => {
  for (const id of ['dot-nexus', 'dot-sse', 'dot-tls', 'status-agent', 'status-url', 'status-health', 'status-cookies']) {
    assert.ok(!html.includes(`id="${id}"`), `id="${id}" must not exist in browser.html anymore`);
  }
});

test('SS-003', 'btn-bookmark still exists exactly once, now inside #bookmarks-bar', () => {
  const matches = html.match(/id="btn-bookmark"/g) || [];
  assert.strictEqual(matches.length, 1, 'must exist exactly once — not duplicated, not lost');
  const bookmarksBarBlock = html.slice(html.indexOf('id="bookmarks-bar"'), html.indexOf('id="bookmark-mgr-panel"'));
  assert.ok(bookmarksBarBlock.includes('id="btn-bookmark"'), 'btn-bookmark must be inside the real #bookmarks-bar block');
});

test('SS-004', 'btn-bookmark keeps its real class and click behavior — only position moved', () => {
  assert.ok(html.includes('class="status-bookmark-btn"'), 'the real CSS class must survive the move');
  assert.ok(js.includes(`document.getElementById('btn-bookmark').addEventListener('click'`),
    'the real click handler must still be wired — this is a relocation, not a rebuild');
});

test('SS-005', 'the real #status-strip CSS rule is gone, not just unreachable', () => {
  assert.ok(!/#status-strip\s*\{/.test(css), 'a live rule targeting a removed id is real, growing dead weight');
});

test('SS-006', '.status-bookmark-btn CSS survives (still actively used at its new location)', () => {
  assert.ok(/\.status-bookmark-btn\s*\{/.test(css));
});

test('SS-007', 'BUGFIX/hardening: every real status-dot reference now goes through the safe helper, not a raw getElementById', () => {
  for (const id of ['dot-nexus', 'dot-tls', 'dot-sse']) {
    assert.ok(!js.includes(`document.getElementById('${id}')`),
      `a raw, unguarded getElementById('${id}') would throw the moment its real SSE event fires, now that the element is gone`);
    assert.ok(js.includes(`_safeEl('${id}')`), `${id} must be reached through the real safety helper`);
  }
});

test('SS-008', 'the 4 cached status-strip variables are built from the safe helper, not raw getElementById', () => {
  for (const v of ['statusUrl', 'statusHealth', 'statusCookies', 'statusAgent']) {
    const re = new RegExp(`const ${v}\\s*=\\s*_safeEl\\(`);
    assert.ok(re.test(js), `${v} must be cached via _safeEl(), matching the same real crash-prevention as the dots`);
  }
});

test('SS-009', 'the safe helper is a real, explicit stand-in \u2014 not a Proxy (this file has documented history of a real Proxy failure)', () => {
  const fnBody = js.slice(js.indexOf('function _safeEl'), js.indexOf('function _safeEl') + 500);
  assert.ok(!fnBody.includes('new Proxy'), 'must not reintroduce the Proxy pattern this same file already documented a real crash from');
  assert.ok(fnBody.includes('textContent') && fnBody.includes('style') && fnBody.includes('parentElement'),
    'the stand-in must cover the real, known properties actually used by real call sites');
});

test('SS-010', 'a real, live simulation of both branches never throws', () => {
  // Extract and run the real function against a controlled document mock,
  // same discipline as this session's own established pattern for
  // renderer-side logic that can't run in a full Electron environment here.
  const start = js.indexOf('function _safeEl');
  const end = js.indexOf('\n  }', start) + 4;
  const fnSrc = js.slice(start, end);
  const stableEl = { textContent: '', style: {}, title: '', className: '', parentElement: {} };
  const mockDoc = { getElementById: (id) => (id === 'exists' ? stableEl : null) };
  const fn = new Function('document', `${fnSrc}\nreturn _safeEl;`)(mockDoc);

  assert.strictEqual(fn('exists'), stableEl, 'a real element must be returned as-is, not wrapped');
  const stand = fn('gone');
  assert.doesNotThrow(() => {
    stand.textContent = 'x'; stand.style.color = 'red'; stand.title = 'y';
    stand.className = 'z'; stand.parentElement.title = 'w'; stand.addEventListener('click', () => {});
  }, 'every real write pattern used by the real call sites must be absorbed safely');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
