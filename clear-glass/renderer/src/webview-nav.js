/**
 * renderer/src/webview-nav.js — <webview> lifecycle events, URL bar
 * handling, and the cookie-count indicator. Extracted from browser.html's
 * inline <script> ("Webview events" + "Navigation" sections).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateOn } from './gate-runtime.js';

export function normalizeUrl(input) {
  let url = input.trim();
  if (!url) return '';
  if (!url.includes('://') && !url.startsWith('about:')) {
    url = url.includes('.') ? 'https://' + url : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
  }
  return url;
}

export function initWebviewNav({ onAddMsg } = {}) {
  const wv = document.getElementById('wv');
  const urlBar = document.getElementById('url-bar');
  const loadBar = document.getElementById('load-bar');
  const statusUrl = document.getElementById('status-url');
  const statusCookies = document.getElementById('status-cookies');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  function updateUrl() {
    const url = wv.getURL();
    urlBar.value = url;
    statusUrl.textContent = url;
  }

  async function updateCookieCount() {
    try {
      const url = wv.getURL();
      const result = await cg.cookies.count({ url, agentId });
      statusCookies.textContent = result?.ok ? `Cookies: ${result.count}` : 'Cookies: —';
    } catch {
      statusCookies.textContent = 'Cookies: —';
    }
  }

  wv.addEventListener('did-start-loading', () => {
    loadBar.style.width = '40%';
    loadBar.classList.add('loading');
  });

  wv.addEventListener('did-stop-loading', () => {
    loadBar.style.width = '100%';
    setTimeout(() => {
      loadBar.classList.remove('loading');
      loadBar.style.width = '0';
    }, 300);
    updateUrl();
    updateCookieCount();
  });

  wv.addEventListener('did-navigate', updateUrl);
  wv.addEventListener('did-navigate-in-page', updateUrl);

  wv.addEventListener('did-fail-load', (e) => {
    if (e.errorCode === -3) return; // Aborted — normal
    addMsg('assistant', `Navigation failed: ${e.errorDescription}`);
  });

  wv.addEventListener('console-message', (e) => {
    const msg = e.message || '';
    const isCsp = /content security policy|refused to (connect|load|frame|execute)/i.test(msg);
    const isCors = /cors policy|cross-origin request blocked|access-control-allow-origin/i.test(msg);
    if (!isCsp && !isCors) return;
    addMsg('assistant', `⚠ ${isCsp ? 'CSP' : 'CORS'} block on ${wv.getURL()}: ${msg.slice(0, 220)}`);
  });

  gateOn('url-bar', 'keydown', {
    label: 'Navigate',
    when: (e) => e.key === 'Enter',
    check: () => !!normalizeUrl(urlBar.value),
    run: () => {
      const url = normalizeUrl(urlBar.value);
      window.__cgTabs?.setUrl(window.__cgTabs.activeId, url);
      wv.loadURL(url);
    },
  });

  gateOn('btn-back', 'click', { label: 'Back', check: () => wv.canGoBack(), run: () => wv.goBack() });
  gateOn('btn-forward', 'click', { label: 'Forward', check: () => wv.canGoForward(), run: () => wv.goForward() });
  gateOn('btn-reload', 'click', { label: 'Reload', run: () => wv.reload() });

  return { wv, urlBar, updateUrl, updateCookieCount };
}
