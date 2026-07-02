/**
 * renderer/src/gate-runtime.js — wraps every wired-up button the same way:
 * run an optional precondition check, run the handler, catch anything
 * that throws, toast on failure, and always dispatch a 'cg:gate' event
 * on `document` so any other part of the app (a debug panel, a future
 * CLI/API bridge, etc.) can listen for what just fired without being
 * coupled to the button module itself.
 *
 * Mirrors the check → run → log → notify shape used throughout this repo
 * (see clear-glass/src/gates/index.js) so the renderer isn't inventing a
 * new pattern — it's applying the same discipline client-side.
 */

import { toast } from './toast.js';

/** In-memory audit trail — never grows unbounded, never fails silently. */
const MAX_LOG = 300;
const _log = [];

function record(entry) {
  _log.push({ ts: Date.now(), ...entry });
  if (_log.length > MAX_LOG) _log.shift();
}

export function gateLog(n = 50) {
  return _log.slice(-n);
}

/** Subscribe to every gate firing. Returns an unsubscribe function. */
export function onGate(fn) {
  document.addEventListener('cg:gate', fn);
  return () => document.removeEventListener('cg:gate', fn);
}

function notify(detail) {
  document.dispatchEvent(new CustomEvent('cg:gate', { detail }));
}

/**
 * runGated(name, fn) — same check → run → log → notify guarantee as
 * gateButton/gateOn, for handlers that aren't tied to a single static
 * element (delegated click handlers like the context menu or spotlight
 * palette, where the "button" is a dynamically rendered row).
 */
export async function runGated(name, fn) {
  const ts = Date.now();
  try {
    await fn();
    record({ name, status: 'ok' });
    notify({ name, status: 'ok', ts });
  } catch (err) {
    const message = err?.message || String(err);
    record({ name, status: 'error', message });
    toast(`${name}: ${message}`, 'error');
    notify({ name, status: 'error', ts, error: message });
  }
}

/**
 * gateButton(id, { check, run, label })
 *  - id:    element id to attach the click listener to
 *  - check: optional () => boolean|Promise<boolean> precondition. A
 *           falsy/rejected result blocks `run` and shows a toast.
 *  - run:   () => any|Promise<any> the actual button behavior.
 *
 * Returns a disposer that removes the listener, or null if the element
 * wasn't found (logged once at wire time, not on every click).
 */
export function gateButton(id, { check, run, label } = {}) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[gate] #${id} not found in DOM — button not wired`);
    return null;
  }
  if (typeof run !== 'function') {
    console.warn(`[gate] #${id} wired with no run() — nothing to do`);
    return null;
  }

  const name = label || id;

  const listener = async (domEvent) => {
    const ts = Date.now();
    try {
      if (check) {
        const ok = await check(domEvent);
        if (!ok) {
          const err = new Error(`"${name}" isn't ready yet`);
          record({ id, name, status: 'blocked', message: err.message });
          toast(err.message, 'warn');
          notify({ id, name, status: 'blocked', ts, error: err.message });
          return;
        }
      }
      await run(domEvent);
      record({ id, name, status: 'ok' });
      notify({ id, name, status: 'ok', ts });
    } catch (err) {
      const message = err?.message || String(err);
      record({ id, name, status: 'error', message });
      toast(`${name}: ${message}`, 'error');
      notify({ id, name, status: 'error', ts, error: message });
    }
  };

  el.addEventListener('click', listener);
  return () => el.removeEventListener('click', listener);
}

/**
 * Same contract as gateButton, but wires an arbitrary element + event type.
 * `when` is a silent relevance filter (e.g. "only on Enter key") — a
 * falsy `when` just means this particular event doesn't apply and is
 * ignored with no toast/log. `check` is a real precondition — a falsy
 * `check` means the action WAS attempted but isn't ready, and toasts.
 */
export function gateOn(id, eventType, { when, check, run, label } = {}) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[gate] #${id} not found in DOM — "${eventType}" not wired`);
    return null;
  }
  const name = label || `${id}:${eventType}`;

  const listener = async (domEvent) => {
    if (when && !when(domEvent)) return;
    const ts = Date.now();
    try {
      if (check) {
        const ok = await check(domEvent);
        if (!ok) {
          const err = new Error(`"${name}" isn't ready yet`);
          record({ id, name, status: 'blocked', message: err.message });
          toast(err.message, 'warn');
          notify({ id, name, status: 'blocked', ts, error: err.message });
          return;
        }
      }
      await run(domEvent);
      record({ id, name, status: 'ok' });
      notify({ id, name, status: 'ok', ts });
    } catch (err) {
      const message = err?.message || String(err);
      record({ id, name, status: 'error', message });
      toast(`${name}: ${message}`, 'error');
      notify({ id, name, status: 'error', ts, error: message });
    }
  };

  el.addEventListener(eventType, listener);
  return () => el.removeEventListener(eventType, listener);
}
