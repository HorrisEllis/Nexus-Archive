'use strict';

/**
 * DOM Archaeology
 * Maps the live DOM into a NEXUS-readable addressable tree.
 * Every node is queryable, mutable, watchable from inside NEXUS.
 * MutationObserver pipeline streams all changes to SSE.
 * Picked elements are registered as named hooks.
 */

const { webContents, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');

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
          if (n.nodeType === 1) {
            changes.push({ type: 'removed', nodeId: n.__cgId, tag: n.tagName?.toLowerCase() });
            // PERF 2026-08-12 - was leaked: removal was reported but the
            // node's entry in mesh was never deleted. On a virtualized
            // streaming chat UI (constant node churn) this grew without
            // bound for the life of the page, since these tabs are kept
            // alive indefinitely rather than navigated away from.
            if (n.__cgId) mesh.delete(n.__cgId);
            // Descendants of a removed subtree also never fire their own
            // removed mutation record (they are gone with their parent),
            // so sweep any of their ids out of mesh too. __cgId is a JS
            // property, not an HTML attribute, so this has to walk
            // elements and check the property directly.
            if (n.querySelectorAll) {
              n.querySelectorAll('*').forEach(child => {
                if (child.__cgId) mesh.delete(child.__cgId);
              });
            }
          }
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
    });

    ipcMain.on('dom:pick-result', (event, data) => {
      const pick = {
        ...data,
        pickId: uuidv4(),
        registeredAt: Date.now(),
      };
      this.sse.emit('dom.picked', pick);
    });
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
