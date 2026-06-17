'use strict';
/**
 * tests/home-ui.test.js
 * UUID: nexus-home-ui-test-v1-0000-2026-0617
 * Tests: home UI phases 1-7
 * Run: node tests/home-ui.test.js
 * 
 * These are structural tests — verifies the HTML contains the right
 * elements and logic. No browser runtime needed.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'ui/home/index.html'), 'utf8');

let pass = 0, fail = 0;
function test(label, fn) {
  try {
    const result = fn();
    if (result) { pass++; console.log(`  ✓  ${label}`); }
    else        { fail++; console.log(`  ✗  ${label}`); }
  } catch(e) { fail++; console.log(`  ✗  ${label} — ${e.message}`); }
}

console.log('\n⬡  HOME UI — Structural Tests\n');

// Phase 1: Overlay boot fix
test('P1: mode-overlay starts hidden (display:none in CSS)', () =>
  HTML.includes('#mode-overlay{') && HTML.includes('display:none'));
test('P1: overlay opens with .open class not display:flex directly', () =>
  HTML.includes('open{display:flex}') || HTML.includes(".open{display:flex}"));
test('P1: openModeSelector uses .open class', () =>
  HTML.includes("classList.add('open')") && !HTML.includes("style.display = 'flex'"));

// Phase 2: Silent mode restore
test('P2: selectMode has goToSuite parameter', () =>
  HTML.includes('goToSuite=true') || HTML.includes('goToSuite = true'));
test('P2: initMode calls selectMode with false', () =>
  HTML.includes('selectMode(stored, false)'));
test('P2: cortex event on mode select', () =>
  HTML.includes('ui.mode.selected'));

// Phase 3: Forge Shell tile
test('P3: tile-forge exists in DOM', () =>
  HTML.includes('id="tile-forge"'));
test('P3: forge tile has heartbeat icon', () =>
  HTML.includes('id="forge-heart"'));
test('P3: forge tile opens forge-shell.html', () =>
  HTML.includes('forge-shell.html'));
test('P3: forge tile has gap metric', () =>
  HTML.includes('tm-forge-gaps'));

// Phase 4: Agent mode tile
test('P4: tile-agent exists in DOM', () =>
  HTML.includes('id="tile-agent"'));
test('P4: agent tile calls openModeSelector', () =>
  HTML.includes('onclick="openModeSelector()"'));
test('P4: agent tile has dynamic name element', () =>
  HTML.includes('tile-agent-name'));

// Phase 5: Heartbeat CSS
test('P5: forge-pulse keyframe defined', () =>
  HTML.includes('@keyframes forge-pulse'));
test('P5: forge-heart animation applied', () =>
  HTML.includes('animation:forge-pulse'));

// Phase 6: Cortex logging
test('P6: openForgeShell logs ui.navigation', () =>
  HTML.includes('ui.navigation'));
test('P6: cortex POST in openForgeShell', () =>
  HTML.includes('openForgeShell'));

// Phase 7: Polling hook
test('P7: updateForgeTile function exists', () =>
  HTML.includes('function updateForgeTile'));
test('P7: updateForgeTile in setInterval', () =>
  HTML.includes('setInterval(updateForgeTile'));
test('P7: immediate first call on boot', () =>
  HTML.includes('updateForgeTile();'));

// Regression: overview stays as active channel in HTML
test('REG: ch-overview is active by default in HTML', () =>
  HTML.includes('id="ch-overview"') &&
  HTML.match(/ch-overview.*class="ch active"|class="ch active".*ch-overview/));

// Regression: grid allows 3 rows (no height:100% constraint)
test('REG: sys-grid no longer height:100% (allows 3 rows)', () =>
  !HTML.includes('grid-template-columns:repeat(3,1fr);gap:16px;height:100%'));

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
