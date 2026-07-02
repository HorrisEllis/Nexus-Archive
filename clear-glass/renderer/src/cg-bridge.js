/**
 * renderer/ui/cg-bridge.js — wraps window.ClearGlass (exposed by the
 * preload script) so every cg.<namespace>.<method>() call that rejects
 * or is missing entirely shows a toast instead of failing silently.
 * Extracted from browser.html's inline <script>.
 *
 * §fix 2026-06-29, take 2 (carried over) — contextBridge.exposeInMainWorld
 * freezes/locks property descriptors on window.ClearGlass for security
 * (non-configurable, non-writable), so a Proxy can't wrap the original
 * object directly — JS throws "proxy did not return its actual value" the
 * instant anything reads a locked property through a differing Proxy
 * value. Fix: copy function references into a plain object WE own, then
 * proxy that (normal, unfrozen, no invariant violation possible).
 *
 * Module-load ordering note: in the original monolith, toast() was
 * defined ~140 lines below this wrapper in the same IIFE, so a
 * toastQueue existed purely to survive that ordering problem. As an ES
 * module we import toast() directly — the queue is no longer needed.
 */

import { toast } from './toast.js';

function wrapNamespace(nsName, nsObj) {
  const wrapped = {};
  if (nsObj) {
    for (const method of Object.keys(nsObj)) {
      const real = nsObj[method];
      if (typeof real !== 'function') continue;
      wrapped[method] = (...args) =>
        Promise.resolve()
          .then(() => real.apply(nsObj, args))
          .catch((err) => {
            const msg = `cg.${nsName}.${method} failed: ${err?.message || err}`;
            console.error('[ClearGlass]', msg, err);
            toast(msg, 'error', 6000);
            throw err;
          });
    }
  }
  // A method that exists on neither the real namespace NOR our wrapped
  // copy (e.g. cg.bookmarks.list when bookmarks exists but list doesn't)
  // also rejects cleanly instead of throwing "X is not a function".
  return new Proxy(wrapped, {
    get(target, method) {
      if (method in target) return target[method];
      return (...args) => {
        const msg = `cg.${nsName}.${method} not available`;
        console.error('[ClearGlass]', msg);
        toast(msg, 'error');
        return Promise.reject(new Error(msg));
      };
    },
  });
}

const rawCg = window.ClearGlass;
const ownedCg = {};
if (rawCg) {
  for (const ns of Object.keys(rawCg)) {
    ownedCg[ns] = wrapNamespace(ns, rawCg[ns]);
  }
}

// Any namespace the call site references that ClearGlass never exposed at
// all (not even an empty one) gets the same graceful fallback. This
// Proxy wraps `ownedCg` — a plain object we created above with normal
// configurable/writable properties — never the original frozen object.
export const cg = new Proxy(ownedCg, {
  get(target, ns) {
    if (ns in target) return target[ns];
    return new Proxy(
      {},
      {
        get: () => (...args) => {
          const msg = `cg.${String(ns)} not available — namespace missing from window.ClearGlass entirely`;
          console.error('[ClearGlass]', msg);
          toast(msg, 'error');
          return Promise.reject(new Error(msg));
        },
      }
    );
  },
});

export const isClearGlassAttached = !!rawCg;

const _debug = new URLSearchParams(location.search).get('debug') === '1';

/** Same interface as before — kept for any call site still using it. */
export function cgCall(namespace, method, ...args) {
  if (_debug) console.log(`[cg.${namespace}.${method}]`, args);
  return cg[namespace][method](...args);
}

if (!rawCg) {
  console.error(
    '[ClearGlass] window.ClearGlass is undefined — preload bridge did not attach. ' +
      'This page must be loaded inside the Clear Glass Electron shell, not a plain browser tab.'
  );
  toast(
    'ClearGlass bridge missing — preload did not attach. Every button will show an error toast until this is fixed.',
    'error',
    10000
  );
}

// §fix 2026-06-30 — "the whole point of the diagnostic UI was to find the
// errors, where are they." window.onerror and unhandledrejection both
// report to the errors:report IPC route (src/diagnostic/error-capture.js),
// which logs to disk, keeps a buffer, and broadcasts over SSE — AND shows
// a visible error toast immediately, so a renderer-side crash is never
// silent again.
window.addEventListener('error', (e) => {
  const payload = { type: 'window.onerror', message: e.message, stack: e.error?.stack, url: location.href, agentId: agentIdFromUrl() };
  cgCall('errors', 'report', payload).catch(() => {});
  toast(`Error: ${e.message}`, 'error', 8000);
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
  const payload = { type: 'unhandledrejection', message: reason.message, stack: reason.stack, url: location.href, agentId: agentIdFromUrl() };
  cgCall('errors', 'report', payload).catch(() => {});
  toast(`Unhandled rejection: ${reason.message}`, 'error', 8000);
});

function agentIdFromUrl() {
  return new URLSearchParams(window.location.search).get('agentId') || 'default';
}
