/**
 * renderer/src/tabs.js — lightweight multi-tab using the single webview.
 * Tabs track their own url/title/loading state; switching loads the
 * stored URL into the webview. Not a multi-webview system (that needs
 * BrowserView/WebContentsView per tab, a main-process change) — this is
 * the renderer-only version. Extracted from browser.html's inline
 * <script> ("Tab system" section).
 */

import { gateButton } from './gate-runtime.js';
import { normalizeUrl } from './webview-nav.js';
import { initialUrl } from './state.js';

export function initTabs() {
  const wv = document.getElementById('wv');
  const urlBar = document.getElementById('url-bar');
  const list = document.getElementById('tab-list');

  let tabs = [{ id: 1, url: initialUrl || 'about:blank', title: 'New tab', loading: false }];
  let activeId = 1;
  let nextId = 2;

  function render() {
    list.innerHTML = tabs
      .map(
        (t) => `
        <div class="tab-item${t.id === activeId ? ' active' : ''}" data-tid="${t.id}" style="
          display:flex;align-items:center;gap:5px;padding:0 10px 0 12px;height:28px;
          border-radius:6px 6px 0 0;font-size:11px;cursor:pointer;white-space:nowrap;
          background:${t.id === activeId ? '#14141f' : 'transparent'};
          color:${t.id === activeId ? '#d8dae4' : '#6a6d82'};
          border:${t.id === activeId ? '1px solid rgba(255,255,255,.08)' : '1px solid transparent'};
          border-bottom:${t.id === activeId ? '1px solid #14141f' : 'none'};
          min-width:80px;max-width:180px;
        ">
          ${t.loading ? '<span style="width:8px;height:8px;border-radius:50%;border:1.5px solid #00f5ff;border-top-color:transparent;animation:spin .6s linear infinite;flex-shrink:0"></span>' : ''}
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${t.title}</span>
          <span class="tab-close" data-tid="${t.id}" style="opacity:.4;font-size:13px;padding:0 2px;flex-shrink:0" title="Close tab">✕</span>
        </div>`
      )
      .join('');

    list.querySelectorAll('.tab-item').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) return;
        switchTo(parseInt(el.dataset.tid, 10));
      });
    });
    list.querySelectorAll('.tab-close').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(parseInt(el.dataset.tid, 10));
      });
    });
  }

  function switchTo(id) {
    const t = tabs.find((x) => x.id === id);
    if (!t) return;
    activeId = id;
    wv.loadURL(t.url || 'about:blank');
    urlBar.value = t.url || '';
    render();
  }

  function newTab(url) {
    const id = nextId++;
    tabs.push({ id, url: url || 'about:blank', title: 'New tab', loading: false });
    switchTo(id);
  }

  function closeTab(id) {
    if (tabs.length === 1) {
      tabs[0].url = 'about:blank';
      wv.loadURL('about:blank');
      urlBar.value = '';
      render();
      return;
    }
    const idx = tabs.findIndex((t) => t.id === id);
    tabs = tabs.filter((t) => t.id !== id);
    if (activeId === id) switchTo(tabs[Math.max(0, idx - 1)].id);
    else render();
  }

  function setUrl(id, url) {
    const t = tabs.find((x) => x.id === id);
    if (t) {
      t.url = url;
      render();
    }
  }

  function setTitle(id, title) {
    const t = tabs.find((x) => x.id === id);
    if (t) {
      t.title = title || 'New tab';
      render();
    }
  }

  function setLoading(id, loading) {
    const t = tabs.find((x) => x.id === id);
    if (t) {
      t.loading = loading;
      render();
    }
  }

  render();

  const api = {
    tabs,
    get activeId() {
      return activeId;
    },
    newTab,
    closeTab,
    setUrl,
    setTitle,
    setLoading,
    render,
  };

  // Exposed for the couple of other modules (webview-nav's Enter-to-navigate)
  // that need to update the active tab's URL without a circular import.
  window.__cgTabs = api;

  gateButton('btn-new-tab', { label: 'New tab', run: () => newTab() });

  wv.addEventListener('page-title-updated', (e) => {
    setTitle(activeId, e.title);
    document.title = e.title + ' — Clear Glass';
  });

  wv.addEventListener('did-start-loading', () => setLoading(activeId, true));
  wv.addEventListener('did-stop-loading', () => {
    setLoading(activeId, false);
    const url = wv.getURL();
    setUrl(activeId, url);
    urlBar.value = url;
  });

  return api;
}
