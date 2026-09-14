'use strict';

/**
 * DOM Archaeology
 * Maps the live DOM into a NEXUS-readable addressable tree.
 * Every node is queryable, mutable, watchable from inside NEXUS.
 * MutationObserver pipeline streams all changes to SSE.
 * Picked elements are registered as named hooks.
 */

const { webContents, BrowserWindow, ipcMain } = require('electron');
const { randomUUID: uuidv4 } = require('crypto'); // §BUGFIX 2026-08-23 — the real 'uuid' npm package was never installed (checked node_modules and package.json directly); this crashed every real file that required it, including boot-critical ones. Node's own built-in produces the identical UUID format, zero dependency.

// §MCO10 2026-09-13 — James: "stream the DOM to the compartment ledger per
// contract using the compartment uuid." Same real cross-process HTTP
// pattern already proven by clear-glass/src/mesh/agent-mesh.js's
// _raidDecide() — 127.0.0.1:NEXUS_PORT, short timeout, resolves rather
// than throws on any failure, so an unreachable cortex degrades this to
// exactly "the DOM stream keeps working locally, nothing gets ledgered"
// — never a blocked or crashed DOM stream.
//
// activeCompartmentUuid below is deliberately simple, in-memory, per-
// process state.
//
// §MCO16 2026-09-13 CLOSED — the gap this comment used to name ("ClearGlass
// is not yet a real RAID contract destination") is closed: cortex/core/raid/
// contract-intake.js's processNext() now calls main/index.js's real
// POST /compartment/set-active for any contract with executionSurface ===
// 'browser', BEFORE dispatching it, via setActiveCompartment() below — the
// exact real hook this comment previously described as unwired. A DOM event
// with no active compartment (executionSurface !== 'browser', or the
// set-active call itself never landed) is still reported honestly (see
// _bindIpc below) rather than tagged with a fabricated uuid — that part of
// the original design is unchanged.
let activeCompartmentUuid = null;
let activeQueueId         = null;

function _reportCompartmentDomEvent(data) {
  if (!activeCompartmentUuid) return; // §1.2 — nothing to ledger, not fabricated
  const http = require('http');
  const body = JSON.stringify({
    type: 'compartment.dom.event',
    payload: {
      compartmentUuid: activeCompartmentUuid,
      queueId:         activeQueueId,
      type:            data.type || 'dom.event',
      agentId:         data.agentId || null,
      dom:             data,
      ts:              data.ts || Date.now(),
    },
  });
  const req = http.request({
    hostname: '127.0.0.1', port: parseInt(process.env.NEXUS_PORT || '3748', 10),
    path: '/api/event', method: 'POST', timeout: 1200,
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, (res) => { res.on('data', () => {}); });
  req.on('error',   () => {}); // honest-degrade, matching _raidDecide's own contract
  req.on('timeout', () => req.destroy());
  req.write(body);
  req.end();
}


// Injected into every page — the DOM mesh observer
const DOM_OBSERVER_SCRIPT = `
(function() {
  if (window.__cgDomMesh) return; // already injected

  const mesh  = new Map();   // nodeId → metadata
  let   nodeCounter = 0;

  function nodeId(el) {
    if (!el.__cgId) {
      el.__cgId = 'cg-' + (++nodeCounter);
      mesh.set(el.__cgId, buildMeta(el));
    }
    return el.__cgId;
  }

  function buildMeta(el) {
    const r = el.getBoundingClientRect ? el.getBoundingClientRect() : {};
    return {
      id:       el.__cgId || null,
      tag:      el.tagName?.toLowerCase() || '#text',
      nodeType: el.nodeType,
      id_attr:  el.id || null,
      classes:  el.className && typeof el.className === 'string' ? el.className.trim().split(/\\s+/).filter(Boolean) : [],
      text:     el.innerText?.slice(0, 200) || el.textContent?.slice(0, 200) || null,
      attrs:    buildAttrs(el),
      rect:     { top: r.top, left: r.left, width: r.width, height: r.height },
      visible:  r.width > 0 && r.height > 0,
      children: el.childElementCount || 0,
      href:     el.href || null,
      value:    el.value !== undefined ? el.value : null,
      name:     el.name || null,
      type:     el.type || null,
    };
  }

  function buildAttrs(el) {
    if (!el.attributes) return {};
    const a = {};
    for (const attr of el.attributes) a[attr.name] = attr.value;
    return a;
  }

  function serialize(el, depth = 0, maxDepth = 4) {
    if (!el || el.nodeType !== 1) return null;
    const meta = buildMeta(el);
    meta.id = nodeId(el);
    if (depth < maxDepth) {
      meta.children = [];
      for (const child of el.children) {
        const s = serialize(child, depth + 1, maxDepth);
        if (s) meta.children.push(s);
      }
    } else {
      meta.children = el.childElementCount;
    }
    return meta;
  }

  // ── MutationObserver ────────────────────────────────────────────────
  const observer = new MutationObserver((mutations) => {
    const changes = [];
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) changes.push({ type: 'added', node: serialize(n, 0, 2) });
        });
        m.removedNodes.forEach(n => {
          if (n.nodeType === 1) changes.push({ type: 'removed', nodeId: n.__cgId, tag: n.tagName?.toLowerCase() });
        });
      } else if (m.type === 'attributes') {
        changes.push({
          type: 'attribute',
          nodeId: nodeId(m.target),
          attr: m.attributeName,
          value: m.target.getAttribute(m.attributeName),
        });
      } else if (m.type === 'characterData') {
        changes.push({ type: 'text', nodeId: nodeId(m.target.parentElement), text: m.target.textContent?.slice(0, 200) });
      }
    }
    if (changes.length && window.__cgEmitDom) {
      window.__cgEmitDom({ type: 'dom.mutations', changes, ts: Date.now() });
    }
  });

  observer.observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, characterData: true,
  });

  // ── Public API ──────────────────────────────────────────────────────
  window.__cgDomMesh = {
    query(selector) {
      const els = document.querySelectorAll(selector);
      return [...els].map(el => ({ ...buildMeta(el), id: nodeId(el) }));
    },

    queryOne(selector) {
      const el = document.querySelector(selector);
      return el ? { ...buildMeta(el), id: nodeId(el) } : null;
    },

    getTree(maxDepth = 4) {
      return serialize(document.documentElement, 0, maxDepth);
    },

    getById(cgId) {
      const el = document.querySelector('[__cgId="' + cgId + '"]') ||
                 [...document.querySelectorAll('*')].find(e => e.__cgId === cgId);
      return el ? { ...buildMeta(el), id: nodeId(el) } : null;
    },

    mutate(cgId, mutation) {
      const el = [...document.querySelectorAll('*')].find(e => e.__cgId === cgId);
      if (!el) return { error: 'Element not found' };

      if (mutation.text    !== undefined) el.innerText    = mutation.text;
      if (mutation.html    !== undefined) el.innerHTML    = mutation.html;
      if (mutation.value   !== undefined) el.value        = mutation.value;
      if (mutation.style   !== undefined) Object.assign(el.style, mutation.style);
      if (mutation.attrs) {
        for (const [k, v] of Object.entries(mutation.attrs)) {
          if (v === null) el.removeAttribute(k);
          else el.setAttribute(k, v);
        }
      }
      if (mutation.remove) el.remove();
      return { ok: true, nodeId: cgId };
    },

    highlight(selector, color = '#00f5ff') {
      document.querySelectorAll('[data-cg-highlight]').forEach(e => {
        e.style.outline = '';
        delete e.dataset.cgHighlight;
      });
      document.querySelectorAll(selector).forEach(e => {
        e.style.outline = '2px solid ' + color;
        e.dataset.cgHighlight = '1';
      });
    },

    destroy() {
      observer.disconnect();
      window.__cgDomMesh = null;
    },
  };

  // Emit full tree on load
  if (document.readyState === 'complete') {
    if (window.__cgEmitDom) window.__cgEmitDom({ type: 'dom.ready', ts: Date.now() });
  } else {
    window.addEventListener('load', () => {
      if (window.__cgEmitDom) window.__cgEmitDom({ type: 'dom.ready', ts: Date.now() });
    });
  }
})();
`;

class DomArchaeology {
  constructor({ sse }) {
    this.sse   = sse;
    this.picks = new Map(); // name → pick metadata
    this._bindIpc();
  }

  // ── Inject observer into webcontents ─────────────────────────────────
  async inject(wc, agentId) {
    try {
      // Inject DOM mesh observer
      await wc.executeJavaScript(DOM_OBSERVER_SCRIPT, true);

      // Bridge DOM events to SSE via ipc
      await wc.executeJavaScript(`
        window.__cgEmitDom = (data) => {
          if (window.__cgIpc) window.__cgIpc.send('dom:event', data);
        };
        window.__cgSendPick = (data) => {
          if (window.__cgIpc) window.__cgIpc.send('dom:pick-result', data);
        };
      `, true);

      this.sse.emit('dom.injected', { agentId, url: wc.getURL(), ts: Date.now() });
    } catch (err) {
      console.warn('[DOM] Injection error:', err.message);
    }
  }

  // ── IPC handlers from renderer ────────────────────────────────────────
  _bindIpc() {
    ipcMain.on('dom:event', (event, data) => {
      this.sse.emit(data.type || 'dom.event', { ...data, ts: data.ts || Date.now() });
      _reportCompartmentDomEvent(data); // §MCO10 — additive, never blocks the existing SSE path above
    });

    // §MCO16 2026-09-13 — real caller now exists: main/index.js's wire-server
    // route POST /compartment/set-active (RAID → ClearGlass, cross-process
    // HTTP, RAID has no ipcRenderer to invoke this handler with). Both real
    // entry points — this renderer-side IPC handle AND that HTTP route —
    // now go through the ONE real setActiveCompartment() method below
    // (§10.3 one write authority for this state, not two competing setters).
    ipcMain.handle('compartment:set-active', (event, { compartmentUuid, queueId } = {}) =>
      this.setActiveCompartment(compartmentUuid, queueId));

    ipcMain.on('dom:pick-result', (event, data) => {
      const pick = {
        ...data,
        pickId: uuidv4(),
        registeredAt: Date.now(),
      };
      this.sse.emit('dom.picked', pick);
    });
  }

  // §MCO16 2026-09-13 — the one real setter for activeCompartmentUuid/
  // activeQueueId, extracted out of the ipcMain.handle above so a SECOND
  // real caller (main/index.js's new HTTP route, called from RAID —
  // outside Electron, no ipcRenderer available to it) can reach the exact
  // same state instead of a parallel one. Same honest contract as before:
  // no validation of compartmentUuid's shape here (RAID owns that; a bad
  // value just tags subsequent DOM events with a bad key, visible in the
  // ledger, not silently rejected — §1.2, loud not silent).
  setActiveCompartment(compartmentUuid, queueId) {
    activeCompartmentUuid = compartmentUuid || null;
    activeQueueId         = queueId || null;
    this.sse.emit('compartment.active.changed', { compartmentUuid: activeCompartmentUuid, queueId: activeQueueId, ts: Date.now() });
    return { ok: true, compartmentUuid: activeCompartmentUuid, queueId: activeQueueId };
  }

  // ── Query ─────────────────────────────────────────────────────────────
  async handleQuery({ agentId = 'default', selector, cgId, tree = false }) {
    const wc = this._getWebContents(agentId);
    if (!wc) return { error: 'No webcontents' };

    if (tree) {
      return wc.executeJavaScript('window.__cgDomMesh?.getTree(5)', true);
    }
    if (cgId) {
      return wc.executeJavaScript(`window.__cgDomMesh?.getById(${JSON.stringify(cgId)})`, true);
    }
    if (selector) {
      return wc.executeJavaScript(`window.__cgDomMesh?.query(${JSON.stringify(selector)})`, true);
    }
    return { error: 'selector, cgId, or tree required' };
  }

  // ── Mutate ────────────────────────────────────────────────────────────
  async handleMutate({ agentId = 'default', cgId, selector, mutation }) {
    const wc = this._getWebContents(agentId);
    if (!wc) return { error: 'No webcontents' };

    if (!cgId && selector) {
      // Resolve selector → cgId
      const el = await wc.executeJavaScript(`window.__cgDomMesh?.queryOne(${JSON.stringify(selector)})`, true);
      if (!el) return { error: `Element not found: ${selector}` };
      cgId = el.id;
    }

    const result = await wc.executeJavaScript(
      `window.__cgDomMesh?.mutate(${JSON.stringify(cgId)}, ${JSON.stringify(mutation)})`, true
    );

    this.sse.emit('dom.mutated', { agentId, cgId, mutation, result, ts: Date.now() });
    return result;
  }

  // ── Element pick registration ─────────────────────────────────────────
  async handlePick({ agentId, nodeId, meta, name }) {
    const pick = {
      pickId:    uuidv4(),
      agentId,
      nodeId,
      name:      name || `pick-${Object.keys(this.picks).length + 1}`,
      meta,
      pickedAt:  Date.now(),
    };
    this.picks.set(pick.name, pick);
    this.sse.emit('dom.pick.registered', pick);
    return pick;
  }

  // ── Highlight ─────────────────────────────────────────────────────────
  async highlight(agentId, selector, color) {
    const wc = this._getWebContents(agentId);
    if (!wc) return;
    await wc.executeJavaScript(
      `window.__cgDomMesh?.highlight(${JSON.stringify(selector)}, ${JSON.stringify(color)})`, true
    ).catch(() => {});
  }

  // ── Token Archaeology ─────────────────────────────────────────────────
  async scanTokens(agentId) {
    const wc = this._getWebContents(agentId);
    if (!wc) return { error: 'No webcontents' };

    const result = await wc.executeJavaScript(`
      (function() {
        const patterns = {
          apiCalls:     [],
          prompts:      [],
          responses:    [],
          tokenCounts:  [],
          modelRefs:    [],
        };

        // Scan script tags for API patterns
        document.querySelectorAll('script').forEach(s => {
          const t = s.textContent;
          if (t.includes('max_tokens') || t.includes('temperature') || t.includes('messages')) {
            patterns.apiCalls.push({ src: 'script', snippet: t.slice(0, 200) });
          }
        });

        // Scan text content for token count patterns
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          const t = node.textContent;
          if (/\\d+\\s*(tokens?|tok)/i.test(t)) {
            patterns.tokenCounts.push({ text: t.trim().slice(0, 100) });
          }
          if (/gpt-[34]|claude-[23]|gemini|llama|mistral/i.test(t)) {
            patterns.modelRefs.push({ text: t.trim().slice(0, 100) });
          }
        }

        // Scan network requests (captured via performance API)
        const entries = performance.getEntriesByType('resource');
        entries.forEach(e => {
          if (e.name.includes('completions') || e.name.includes('messages') ||
              e.name.includes('generate') || e.name.includes('v1/chat')) {
            patterns.apiCalls.push({ url: e.name, duration: Math.round(e.duration) });
          }
        });

        return patterns;
      })()
    `, true);

    this.sse.emit('dom.tokens.scanned', { agentId, result, ts: Date.now() });
    return result;
  }

  _getWebContents(agentId) {
    const all = webContents.getAllWebContents();
    for (const wc of all) {
      try {
        const win = BrowserWindow.fromWebContents(wc);
        if (win && win.getTitle().includes(agentId)) return wc;
      } catch {}
    }
    return webContents.getFocusedWebContents() || all[0] || null;
  }

  listPicks() { return [...this.picks.values()]; }
}

module.exports = DomArchaeology;
