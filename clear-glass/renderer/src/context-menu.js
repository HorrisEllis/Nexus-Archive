/**
 * renderer/src/context-menu.js — right-click context menu. Extracted
 * from browser.html's inline <script> ("Right-click context menu"
 * section). Each action routes through runGated() so a failure toasts
 * and a 'cg:gate' event fires just like the toolbar buttons — this menu
 * is just buttons that happen to render inside a delegated container
 * instead of static <button> elements.
 */

import { cg } from './cg-bridge.js';
import { agentId, state } from './state.js';
import { runGated } from './gate-runtime.js';
import { toggleBookmark, loadBookmarks } from './bookmarks.js';
import { PICKER_SCRIPT } from './injected-scripts.js';

export function initContextMenu({ onAddMsg, activatePicker } = {}) {
  const wv = document.getElementById('wv');
  const ctxMenu = document.getElementById('ctx-menu');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  function showCtxMenu(x, y) {
    ctxMenu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    ctxMenu.style.top = Math.min(y, window.innerHeight - 220) + 'px';
    ctxMenu.classList.add('visible');
  }
  function hideCtxMenu() {
    ctxMenu.classList.remove('visible');
  }

  document.addEventListener('click', hideCtxMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideCtxMenu();
  });

  document.getElementById('chrome').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showCtxMenu(e.clientX, e.clientY);
  });

  wv.addEventListener('context-menu', (e) => {
    e.preventDefault();
    showCtxMenu(e.x, e.y);
  });

  const ACTIONS = {
    bookmark: async () => {
      const url = wv.getURL();
      const title = wv.getTitle();
      if (!url || url === 'about:blank') return;
      const result = await toggleBookmark(url, title);
      addMsg('assistant', result.marked ? `★ Bookmarked: ${title}` : `Bookmark removed: ${title}`);
      loadBookmarks();
    },
    snapshot: async () => {
      await cg.rewind.snapshot(agentId, { label: 'manual' });
      addMsg('assistant', '📍 Snapshot saved.');
    },
    pick: async () => {
      if (activatePicker) {
        await activatePicker();
      } else {
        state.pickerActive = true;
        await wv.executeJavaScript(PICKER_SCRIPT);
      }
    },
    'copilot-page': async () => {
      const url = wv.getURL();
      const title = wv.getTitle();
      const copilotInput = document.getElementById('copilot-textarea');
      const copilotPane = document.getElementById('copilot-pane');
      const copilotToggle = document.getElementById('copilot-toggle');
      copilotInput.value = `Tell me about this page: ${title} (${url})`;
      state.copilotVisible = true;
      copilotPane.classList.remove('hidden');
      copilotToggle.classList.add('active');
      copilotInput.focus();
    },
    tokens: async () => {
      addMsg('assistant', 'Scanning page for LLM/API patterns...');
      await cg.driver.exec({ action: 'dom.tokens', agentId });
    },
    'bg-tab': async () => {
      const url = wv.getURL();
      await cg.bgTabs.open({ agentId: agentId + '-bg', url });
      addMsg('assistant', `Moved to background tab: ${url}`);
    },
    'new-agent': async () => {
      const url = wv.getURL();
      await cg.window.open({ agentId: undefined, url });
    },
  };

  ctxMenu.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    hideCtxMenu();
    const handler = ACTIONS[action];
    if (!handler) return;
    runGated(`ctx-menu:${action}`, handler);
  });
}
