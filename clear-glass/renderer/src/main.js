/**
 * renderer/src/main.js — entry point for browser.html.
 *
 * This replaces the ~1430-line inline <script> that used to live at the
 * bottom of browser.html. Every panel/feature now lives in its own file
 * under renderer/src/, each wired the same way the monolith wired it,
 * except every button now goes through gate-runtime.js: a precondition
 * check runs first, the real handler runs inside a try/catch, and either
 * way a toast appears on failure and a `cg:gate` event fires on
 * `document` so anything else in the app can observe what just happened.
 *
 * Import order mirrors the original file's top-to-bottom section order.
 */

import './cg-bridge.js'; // attaches window.onerror / unhandledrejection reporting as a side effect
import { addMsg } from './copilot.js';

import { initWebviewNav, normalizeUrl } from './webview-nav.js';
import { initTabs } from './tabs.js';
import { initWindowControls } from './window-controls.js';
import { initOptionsPanel } from './options-panel.js';
import { initPicker } from './picker.js';
import { initCopilot } from './copilot.js';
import { initDomPanel } from './dom-panel.js';
import { connectSSE } from './sse.js';
import { initMeshDiag } from './mesh-diag.js';
import { initBookmarks } from './bookmarks.js';
import { initRewind } from './rewind.js';
import { initProviders } from './providers.js';
import { initUserscripts } from './userscripts.js';
import { initSpotlight } from './spotlight.js';
import { initMeshQueue } from './mesh-queue.js';
import { initAgentDropdown } from './agent-dropdown.js';
import { initContextMenu } from './context-menu.js';
import { agentId, initialUrl } from './state.js';

function boot() {
  document.getElementById('agent-badge').textContent = agentId;
  document.getElementById('status-agent').textContent = `Agent: ${agentId}`;

  const navApi = initWebviewNav({ onAddMsg: addMsg });
  const tabsApi = initTabs();
  initWindowControls();
  initOptionsPanel({ onAddMsg: addMsg });
  const pickerApi = initPicker({ onAddMsg: addMsg });
  initCopilot();
  initDomPanel();
  connectSSE({ onAddMsg: addMsg });
  initMeshDiag({ onAddMsg: addMsg });
  initBookmarks({ onAddMsg: addMsg });
  initRewind({ onAddMsg: addMsg });
  initProviders({ onAddMsg: addMsg });
  initUserscripts({ onAddMsg: addMsg });
  initSpotlight({ onAddMsg: addMsg });
  initMeshQueue();
  initAgentDropdown();
  initContextMenu({ onAddMsg: addMsg, activatePicker: pickerApi.activateFromContextMenu });

  // Carried-over URL from openAgentWindow/openBackgroundTab (new-agent,
  // bg-tab, or defaultStartUrl) — webview queues loadURL fine pre-ready.
  if (initialUrl) {
    const norm = normalizeUrl(initialUrl);
    if (norm) navApi.wv.loadURL(norm);
  } else {
    // A fresh tab with no initialUrl sits at about:blank forever and
    // never fires did-stop-loading/did-navigate — the only two call
    // sites for updateCookieCount() — so the cookie indicator would
    // otherwise stay stuck at its initial state permanently.
    navApi.updateCookieCount();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
