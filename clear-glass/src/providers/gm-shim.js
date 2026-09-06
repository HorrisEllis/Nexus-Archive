'use strict';
/**
 * src/providers/gm-shim.js — Tampermonkey GM_* API shim
 * UUID: cg-gm-shim-v1-0000-0000-000000000013
 *
 * Guardian's userscripts (userscript-claude.js etc.) are written for
 * Tampermonkey and use three GM_* calls:
 *   - GM_xmlhttpRequest({ method, url, headers, data, timeout, onload, onerror, ontimeout })
 *   - GM_getValue(key, default)
 *   - GM_setValue(key, value)
 *
 * Electron's webview has no Tampermonkey sandbox, so this builds a plain
 * JS shim that's injected ahead of the userscript body via executeJavaScript.
 * It is deliberately NOT a 1:1 reimplementation of Tampermonkey's extension
 * storage — GM_getValue/GM_setValue here are backed by localStorage, which
 * is scoped to the webview's own session partition rather than shared
 * across every tab running the script the way real GM storage is. For a
 * dedicated, one-tab-per-provider host (which is what ProviderHost spawns)
 * that distinction doesn't matter — there's no second tab to race with —
 * but it would matter if you ever pointed two webviews at the same
 * provider under the same partition. Noting it here rather than pretending
 * it's identical.
 *
 * GM_xmlhttpRequest is backed by fetch(), which is sufficient: the NCP doc
 * already establishes that fetch() to 127.0.0.1 works fine from an https://
 * page under Private Network Access, which is exactly what these calls do
 * (Guardian, Cortex, Orchestrator, Ollama — all loopback).
 */

function buildGmShim() {
  return `
(function() {
  if (window.GM_xmlhttpRequest) return; // already shimmed (re-injection guard)

  window.GM_xmlhttpRequest = function(opts) {
    const controller = new AbortController();
    let timedOut = false;
    const t = opts.timeout ? setTimeout(() => { timedOut = true; controller.abort(); }, opts.timeout) : null;

    fetch(opts.url, {
      method:  opts.method || 'GET',
      headers: opts.headers || {},
      body:    opts.data,
      signal:  controller.signal,
    }).then(async (res) => {
      if (t) clearTimeout(t);
      const responseText = await res.text();
      opts.onload && opts.onload({
        status: res.status,
        statusText: res.statusText,
        responseText,
        response: responseText,
        finalUrl: res.url,
      });
    }).catch((err) => {
      if (t) clearTimeout(t);
      if (timedOut) { opts.ontimeout && opts.ontimeout(); return; }
      opts.onerror && opts.onerror(err);
    });

    return { abort: () => controller.abort() };
  };

  window.GM_getValue = function(key, defaultValue) {
    try {
      const raw = localStorage.getItem('__gm_' + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) { return defaultValue; }
  };

  window.GM_setValue = function(key, value) {
    try { localStorage.setItem('__gm_' + key, JSON.stringify(value)); }
    catch (e) {}
  };
})();
`;
}

module.exports = { buildGmShim };
