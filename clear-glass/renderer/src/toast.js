/**
 * renderer/ui/toast.js — lightweight toast notifications.
 * Extracted from browser.html's inline <script> ("Toast system" section).
 * Call toast(msg, type) from anywhere. type: 'info' | 'error' | 'success' | 'warn'
 */

let _container = null;

function container() {
  if (_container) return _container;
  const el = document.createElement('div');
  el.id = 'cg-toast-container';
  el.style.cssText =
    'position:fixed;bottom:18px;right:18px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
  document.body.appendChild(el);
  _container = el;
  return _container;
}

const COLORS = { info: '#00f5ff', error: '#ff4466', success: '#00ff9d', warn: '#ffb454' };

export function toast(msg, type = 'info', durationMs = 3500) {
  const color = COLORS[type] || COLORS.info;
  const el = document.createElement('div');
  el.style.cssText =
    `background:#0e0e18;border:1px solid ${color};color:${color};padding:8px 14px;` +
    'border-radius:8px;font-size:11px;font-family:ui-monospace,monospace;max-width:320px;' +
    'word-break:break-all;opacity:0;transition:opacity .15s;pointer-events:auto;cursor:pointer;';
  el.textContent = msg;
  el.onclick = () => el.remove();
  container().appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, durationMs);
  return el;
}
