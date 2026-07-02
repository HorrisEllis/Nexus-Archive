/**
 * renderer/src/window-controls.js — minimize/maximize/close-to-tray.
 * Extracted from browser.html's inline <script> ("Window controls" section).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';
import { isClearGlassAttached } from './cg-bridge.js';

export function initWindowControls() {
  gateButton('btn-minimize', {
    label: 'Minimize',
    check: () => isClearGlassAttached,
    run: () => cg.window.minimize(agentId),
  });
  gateButton('btn-maximize', {
    label: 'Maximize',
    check: () => isClearGlassAttached,
    run: () => cg.window.maximize(agentId),
  });
  gateButton('btn-close-tray', {
    label: 'Close to tray',
    check: () => isClearGlassAttached,
    run: () => cg.window.hide(agentId),
  });
}
