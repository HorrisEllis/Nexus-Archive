'use strict';
/**
 * ui/toast/toast.js — sovereign module. §LAW VI: toast on every failure.
 *
 * This is the missing piece of that law — every system already logs
 * failures server-side, nothing rendered them in the UI. Subscribes to
 * the orchestrator's existing SSE stream (same connection shell.js
 * already opens for everything else — see API note below) and renders
 * a toast for:
 *   - any event type ending in '.error' or '.failed'
 *   - 'copilot.error.detected' (copilot/lib/expectation-watcher.js —
 *     gated interaction listeners flagging a missing expected follow-up)
 *
 * API exposed on window.Toast:
 *   Toast.mount(rootEl)         — call once, creates the toast rail
 *   Toast.attachToSSE(sseSource)— pass the shell's existing EventSource
 *                                 (or call Toast.connect() to open its own)
 *   Toast.show(message, level)  — manual toast, any module can call this
 */
(function () {
  let root = null;
  const AUTO_DISMISS_MS = 8000;

  function mount(target) {
    root = target || document.body;
    if (!document.getElementById('toast-rail')) {
      const rail = document.createElement('div');
      rail.id = 'toast-rail';
      rail.className = 'toast-rail';
      root.appendChild(rail);
    }
  }

  function show(message, level = 'error', meta = {}) {
    const rail = document.getElementById('toast-rail');
    if (!rail) { console.warn('[toast] mount() not called yet —', message); return; }

    const el = document.createElement('div');
    el.className = `toast toast--${level}`;
    el.innerHTML = `
      <span class="toast__dot"></span>
      <span class="toast__msg"></span>
      <button class="toast__close" aria-label="dismiss">&times;</button>
    `;
    el.querySelector('.toast__msg').textContent = message; // textContent, not innerHTML — never trust event payload as markup
    el.querySelector('.toast__close').addEventListener('click', () => _dismiss(el));
    rail.appendChild(el);

    requestAnimationFrame(() => el.classList.add('toast--in'));
    const timer = setTimeout(() => _dismiss(el), AUTO_DISMISS_MS);
    el.dataset.timer = timer;
    return el;
  }

  function _dismiss(el) {
    clearTimeout(el.dataset.timer);
    el.classList.remove('toast--in');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }

  function _handleFrame(raw) {
    let event;
    try { event = JSON.parse(raw); } catch (_) { return; }
    if (!event || !event.type) return;

    if (event.type === 'copilot.error.detected') {
      show(event.message || 'An expected event never arrived.', 'error', event);
      return;
    }
    if (event.type.endsWith('.error') || event.type.endsWith('.failed')) {
      show(event.error || event.reason || `${event.type} — see build/log channel for detail`, 'error', event);
    }
  }

  /** attachToSSE(source) — reuse shell.js's existing EventSource so we
   *  don't open a second SSE connection to the same endpoint. */
  function attachToSSE(source) {
    source.addEventListener('message', (e) => _handleFrame(e.data));
  }

  /** connect() — standalone fallback if a page loads toast.js without a
   *  shell (e.g. opening a channel directly per DECOMP's "any channel
   *  independently in a browser tab" design goal). */
  function connect(url = '/sse') {
    const es = new EventSource(url);
    attachToSSE(es);
    return es;
  }

  window.Toast = { mount, show, attachToSSE, connect };
})();
