'use strict';
/**
 * tests/modules/clear-glass-library-ui.test.js
 *
 * §BUILT 2026-09-21 — James: "the clearglass macros, autofill, keyboard
 * shortcuts... build them, then expand the ui, like it should have
 * been. index.html."
 *
 * Map, before this pass: keyboard shortcuts were already real (clear-
 * glass/renderer/browser.js). Macros and autofill each had a complete,
 * real IPC surface and ZERO reach from anywhere a person could click —
 * ui/library/index.html (built 2026-09-19, six tabs including Macros)
 * had no library-app.js (the file its own <script src> pointed at did
 * not exist) and no menu entry to even open it; autofill had no UI
 * surface anywhere, in this page or the main browser chrome.
 *
 * §HONEST LIMIT — clear-glass/src/ipc/bridge.js and src/main/index.js
 * both `require('electron')` at the top level; no electron package is
 * installed in this sandbox (checked: `ls node_modules/electron` finds
 * nothing), so neither file can be require()'d in a plain node test —
 * same real limit clear-glass-accounts.test.js already states for
 * agent-mesh.js's driver/ctxMgr. These checks read the real source text
 * instead, same precedent as test-file-tree-plan.js's checks against
 * idearium/api/index.js. library-app.js and index.html have no Electron
 * dependency and are exercised more directly below (structurally, since
 * they're meant to run in a real browser window, not Node).
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

let passed = 0, failed = 0;
function check(desc, cond, detail = '') {
  if (cond) { console.log(`  ✓ ${desc}`); passed++; }
  else { console.log(`  ✗ ${desc}${detail ? ` — ${detail}` : ''}`); failed++; }
}

function main() {
  const BRIDGE = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'ipc', 'bridge.js'), 'utf8');
  const MAIN = fs.readFileSync(path.join(ROOT, 'clear-glass', 'src', 'main', 'index.js'), 'utf8');
  const HTML = fs.readFileSync(path.join(ROOT, 'ui', 'library', 'index.html'), 'utf8');
  const APP = fs.readFileSync(path.join(ROOT, 'ui', 'library', 'library-app.js'), 'utf8');
  const CSS = fs.readFileSync(path.join(ROOT, 'ui', 'library', 'library-app.css'), 'utf8');

  // ── bridge.js: the new REST doors ────────────────────────────────────
  check('GET /cli/agents reuses the real listOpenAgents(), not a second implementation',
    /app\.get\('\/cli\/agents'.*listOpenAgents/.test(BRIDGE));
  check('autofill profile CRUD is a real REST surface: list/get/create/update/delete',
    /app\.get\('\/cli\/autofill\/profiles'/.test(BRIDGE) &&
    /app\.get\('\/cli\/autofill\/profiles\/:id'/.test(BRIDGE) &&
    /app\.post\('\/cli\/autofill\/profiles'/.test(BRIDGE) &&
    /app\.put\('\/cli\/autofill\/profiles\/:id'/.test(BRIDGE) &&
    /app\.delete\('\/cli\/autofill\/profiles\/:id'/.test(BRIDGE));
  check('autofill detect/fill call the SAME real matcher functions the IPC handlers use, not a second implementation',
    (BRIDGE.match(/_autofillDetect\(this\.dom, this\.autofillStore/g) || []).length === 2 &&
    (BRIDGE.match(/_autofillFill\(this\.dom, this\.autofillStore/g) || []).length === 2);
  check('field-types route exposes the real store\'s FIELD_TYPES/DOCUMENT_FIELDS, not a hand-copied duplicate',
    /require\('\.\.\/autofill\/store\.js'\)/.test(BRIDGE) && /FIELD_TYPES, DOCUMENT_FIELDS/.test(BRIDGE));
  check('downloads:clearCompleted (real IPC handler since 2026-09-19) now also has a /cli/* door',
    /app\.post\('\/cli\/downloads\/clear-completed'.*clearCompleted/.test(BRIDGE));

  // ── main/index.js: the missing menu entry ────────────────────────────
  check('a Library menu entry opens ui/library/ via the real openAgentWindow mechanism, same pattern as BrainOS',
    /label: '⬡ Library'.*openAgentWindow\(\{ agentId: 'nexus-library', url: 'http:\/\/127\.0\.0\.1:9000\/ui\/library\/' \}\)/.test(MAIN));

  // ── index.html: the 7th tab ───────────────────────────────────────────
  check('index.html declares an Autofill tab nav entry', /data-tab="autofill">AUTOFILL/.test(HTML));
  check('index.html declares the Autofill panel with a create button', /id="panel-autofill"/.test(HTML) && /id="autofill-new"/.test(HTML));
  check('index.html declares a shared modal host', /id="modal-overlay"/.test(HTML) && /id="modal-body"/.test(HTML));
  check('the script tag it always referenced now points at a file that actually exists',
    /<script src="\/ui\/library\/library-app\.js">/.test(HTML) && fs.existsSync(path.join(ROOT, 'ui', 'library', 'library-app.js')));

  // ── library-app.js: every tab is wired to its real endpoint ──────────
  const TAB_ENDPOINTS = {
    bookmarks: "'/cli/bookmarks'", history: "'/cli/history'", downloads: "'/cli/downloads'",
    accounts: "'/cli/accounts'", macros: "'/cli/macros'", autofill: "'/cli/autofill/profiles'", passwords: "'/cli/passwords'",
  };
  for (const [tab, endpoint] of Object.entries(TAB_ENDPOINTS)) {
    check(`library-app.js's ${tab} tab calls its real endpoint (${endpoint})`, APP.includes(endpoint));
  }
  check('macro run resolves a target agent from /cli/agents — never assumes "the current tab" (this page has none)',
    /agentPickerHtml/.test(APP) && /runMacro/.test(APP));
  check('autofill fill/detect also resolve a target agent the same way — one picker, two callers, not two implementations',
    (APP.match(/agentPickerHtml\(/g) || []).length >= 2);
  check('the base API URL targets clear-glass\'s own :7702 bridge, not orchestrator\'s :9000 (which is only serving this static page)',
    /const API = 'http:\/\/127\.0\.0\.1:7702'/.test(APP));
  check('every fetch goes through the one api() helper — not a second, competing fetch wrapper', (APP.match(/fetch\(API/g) || []).length === 1);
  check('the downloads tab wires the new clear-completed route', /downloads-clear-completed/.test(APP) && APP.includes("'/cli/downloads/clear-completed'"));
  check('the passwords tab stays read-only (delete only, no create) — matches vault.js\'s own list()-never-decrypts design',
    !/autofill-new/.test(APP.split('TABS.passwords')[0].split('TABS.autofill')[1] || '') && /passwords-refresh/.test(APP) && !APP.includes('passwords-new'));

  // ── library-app.css: the modal it now depends on actually has styles ──
  check('library-app.css defines the modal host styles library-app.js relies on', /\.modal-overlay/.test(CSS) && /\.modal-box/.test(CSS));

  // ── 0.39.240: the Library is in Clear Glass's own ☰ menu, not only the tray ──
  // James: "also needs to be clearglass library... added to the 3 lines menu".
  // Driven for real in headless Chromium by tests/probe/clearglass-menu-library.py.
  const BROWSER = fs.readFileSync(path.join(ROOT, 'clear-glass', 'renderer', 'browser.js'), 'utf8');
  check('the ☰ menu has a Library row', /<div class="menu-item" data-action="library">📚 Library<\/div>/.test(BROWSER));
  check('…and it opens through cg.window.open (window:open -> openAgentWindow), not a second mechanism',
    /data-action="library"\]'\)\.addEventListener\('click'[\s\S]{0,200}cg\.window\.open\(\{ agentId: LIBRARY_AGENT_ID, url: LIBRARY_URL \}\)/.test(BROWSER));
  const menuId = (BROWSER.match(/const LIBRARY_AGENT_ID = '([^']+)'/) || [])[1];
  const menuUrl = (BROWSER.match(/const LIBRARY_URL = '([^']+)'/) || [])[1];
  const tray = MAIN.match(/label: '⬡ Library',\s*click: \(\) => openAgentWindow\(\{ agentId: '([^']+)', url: '([^']+)' \}\)/) || [];
  check('…the same window the tray opens (same agentId and URL), so the two cannot drift',
    menuId && menuUrl && menuId === tray[1] && menuUrl === tray[2], `menu ${menuId} ${menuUrl} vs tray ${tray[1]} ${tray[2]}`);
  check('…and a failure to open is shown, not swallowed', /Could not open the Library: \$\{err\.message\}/.test(BROWSER));

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main();
