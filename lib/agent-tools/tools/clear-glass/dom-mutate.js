'use strict';
/**
 * lib/agent-tools/tools/clear-glass/dom-mutate.js — the real write
 * counterpart to dom-archaeology.js's read-only query.
 *
 * §MCO16c 2026-09-13 — same real bridge: ClearGlass's wire server
 * (:7704) POST /dom/mutate -> ProviderHost.mutateDom() -> the real,
 * already-loaded window.__cgDomMesh.mutate() (clear-glass/src/dom/
 * archaeology.js's own DOM_OBSERVER_SCRIPT). Not a new mechanism —
 * this gives copilot's own tool loop the same real write path RAID's
 * contract.domSteps ('mutate' steps) already uses.
 */
const http = require('http');

const WIRE_PORT = process.env.WIRE_PORT || 7704;

function _post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: '127.0.0.1', port: WIRE_PORT, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, timeout: 5000 },
      (res) => {
        let out = ''; res.on('data', c => out += c);
        res.on('end', () => { try { resolve(JSON.parse(out)); } catch (e) { reject(e); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('ClearGlass wire server unreachable — is ClearGlass running?')); });
    req.write(data);
    req.end();
  });
}

module.exports = {
  name: 'clear_glass_dom_mutate',
  description:
    'Real DOM mutation on a live ClearGlass browser tab — sets text/html/value/style/attrs on one element, or ' +
    'removes it, via the same window.__cgDomMesh.mutate() the DOM Archaeology panel itself uses. Needs providerId ' +
    'and either cgId (from a prior clear_glass_dom_archaeology result) or a CSS selector, plus a mutation object ' +
    '({text, html, value, style, attrs, remove}). Honestly fails — with a specific reason (no live window, ' +
    'element not found) — rather than fabricating success.',
  parameters: {
    type: 'object',
    properties: {
      providerId: { type: 'string', description: 'which real agent tab — e.g. claude, chatgpt, gemini' },
      cgId:       { type: 'string', description: 'the target element\'s cgId, if already known from a query' },
      selector:   { type: 'string', description: 'a CSS selector to resolve to an element, if cgId is not known' },
      mutation:   {
        type: 'object',
        description: 'what to change: {text, html, value, style, attrs, remove} — any subset',
      },
    },
    required: ['providerId', 'mutation'],
  },
  execute: async (a) => {
    if (!a.providerId) return { error: 'providerId required' };
    if (!a.mutation || typeof a.mutation !== 'object') return { error: 'a real mutation object is required' };
    if (!a.cgId && !a.selector) return { error: 'cgId or selector required — refusing to guess a target element' };
    try {
      return await _post('/dom/mutate', { providerId: a.providerId, cgId: a.cgId, selector: a.selector, mutation: a.mutation });
    } catch (e) {
      return { error: `clear_glass_dom_mutate failed: ${e.message}` };
    }
  },
};
