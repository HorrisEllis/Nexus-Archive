'use strict';
/**
 * src/rewind/engine.js — Clear Glass Rewind Engine
 * UUID: cg-rewind-v1-0000-0000-000000000020
 *
 * Rewind is the session time-machine. Every N seconds (or on significant
 * events), it snapshots:
 *   - The current URL and page title
 *   - A DOM state hash (shallow fingerprint, not full tree)
 *   - The cookie vault snapshot (real session, via ContextMgr — previously
 *     this was a dead stub that always returned null, so cookie
 *     snapshot/restore silently never ran despite looking wired)
 *   - Full localStorage/sessionStorage contents, plus scroll position
 *     (changed from the original "sizes only, no PII" design — exact-state
 *     restore needs real values; this does mean auth tokens/app state in
 *     storage are now persisted to disk in the snapshot file)
 *   - The agentId and contextId
 *
 * On rewind({ agentId, steps }):
 *   - Walks back N snapshots
 *   - Navigates to the snapshot URL
 *   - Restores cookies from vault if a snapshot key exists
 *   - Re-applies storage contents + scroll position post-navigation
 *   - Emits rewind.restored on SSE
 *
 * Gates: rewind.snapshot (manual), rewind.list, rewind.restore, rewind.clear
 * Auto-snapshot: triggered by nav.loaded events on the bus
 *
 * Storage: JSON file per agent, bounded to MAX_SNAPSHOTS entries.
 * Restores URL + cookies + storage + scroll — not a full JS-heap/app-state
 * snapshot (no browser exposes that). For a true SPA, "exact" means same
 * data, not same in-memory React/Vue state.
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const REWIND_DIR     = path.join(process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'rewind');
const MAX_SNAPSHOTS  = 50; // per agent
const AUTO_INTERVAL  = 30000; // 30s auto-snapshot when page is idle

class RewindEngine {
  constructor({ vault, driver, sse, busOn, ctxMgr }) {
    this.vault  = vault;   // CookieVault
    this.driver = driver;  // ClearDriver
    this.sse    = sse;
    this.busOn  = busOn;   // bus.on subscription fn
    this.ctxMgr = ctxMgr;  // ContextMgr — needed to resolve the real session for cookie snapshot/restore
    this._sessions = new Map(); // agentId → RewindSession[]
    this._autoTimers = new Map();
    // §PERF 2026-08-12 — see _persist()/_flushDirty() below.
    this._dirty = new Set();
    this._flushTimer = null;
  }

  async init() {
    fs.mkdirSync(REWIND_DIR, { recursive: true });

    // Auto-snapshot on nav.loaded
    if (this.busOn) {
      this.busOn('nav.loaded', (event) => {
        const { agentId, url, title } = event.data;
        if (agentId && url && !url.startsWith('about:')) {
          this._scheduleAutoSnapshot(agentId, url, title);
        }
      });

      // Also snapshot when url.match fires (significant page event)
      this.busOn('url.match', (event) => {
        const { agentId } = event.data;
        if (agentId) this._scheduleAutoSnapshot(agentId, null, null);
      });
    }

    console.log('[Rewind] Engine ready');
  }

  // ── Snapshot ──────────────────────────────────────────────────────────────
  async snapshot(agentId, { url, title, label } = {}) {
    if (!agentId) throw new Error('agentId required');

    // Get current page state from driver
    let pageUrl = url, pageTitle = title;
    try {
      if (!pageUrl) {
        const urlResult = await this.driver.exec({ action: 'getUrl', agentId });
        pageUrl = urlResult.url;
      }
      if (!pageTitle) {
        const titleResult = await this.driver.exec({ action: 'getTitle', agentId });
        pageTitle = titleResult.title;
      }
    } catch (_) {}

    if (!pageUrl || pageUrl === 'about:blank') return null;

    // Snapshot cookies into vault
    let cookieKey = null;
    try {
      const ctx = this._getSession(agentId)?.session;
      if (ctx && this.vault) {
        const snap = await this.vault.snapshot(agentId, ctx);
        cookieKey = snap?.version ? `${agentId}-${snap.version}` : null;
      }
    } catch (_) {}

    // DOM hash (lightweight — just node count + body text hash)
    let domHash = null;
    try {
      const result = await this.driver.exec({
        action:  'eval',
        agentId,
        code:    `(document.querySelectorAll('*').length + ':' + document.body?.innerText?.slice(0,200)).length`,
      });
      domHash = String(result?.result || '');
    } catch (_) {}

    // Exact-state capture: scroll position + full storage contents.
    // NOTE: this stores real localStorage/sessionStorage values (auth
    // tokens, app state, etc.) to disk — a deliberate change from the
    // original "sizes only, no PII" design. Flagged, not silent.
    let stateBlob = null;
    try {
      const result = await this.driver.exec({
        action: 'eval',
        agentId,
        code: `JSON.stringify({
          scrollX: window.scrollX, scrollY: window.scrollY,
          localStorage: (function(){ try { return Object.assign({}, localStorage); } catch(_) { return {}; } })(),
          sessionStorage: (function(){ try { return Object.assign({}, sessionStorage); } catch(_) { return {}; } })(),
        })`,
      });
      stateBlob = result?.result || null;
    } catch (_) {}

    const entry = {
      id:         randomUUID(),
      agentId,
      url:        pageUrl,
      title:      pageTitle || pageUrl,
      label:      label || null,
      cookieKey,
      domHash,
      stateBlob,
      ts:         Date.now(),
    };

    this._pushSnapshot(agentId, entry);
    this._persist(agentId);

    this.sse?.emit('rewind.snapshot', { agentId, entry });
    return entry;
  }

  // ── List ──────────────────────────────────────────────────────────────────
  list(agentId, limit = 20) {
    this._loadIfNeeded(agentId);
    const snaps = this._sessions.get(agentId) || [];
    return snaps.slice(-limit).reverse(); // most recent first
  }

  // ── Restore ───────────────────────────────────────────────────────────────
  async restore({ agentId, snapshotId, steps = 1 }) {
    this._loadIfNeeded(agentId);
    const snaps = this._sessions.get(agentId) || [];
    if (!snaps.length) throw new Error('No rewind snapshots for agent');

    let target;
    if (snapshotId) {
      target = snaps.find(s => s.id === snapshotId);
      if (!target) throw new Error(`Snapshot not found: ${snapshotId}`);
    } else {
      // steps back from most recent
      const idx = snaps.length - 1 - steps;
      target = snaps[Math.max(0, idx)];
    }

    if (!target) throw new Error('No snapshot to restore to');

    this.sse?.emit('rewind.restoring', { agentId, target });

    // Restore cookies first
    if (target.cookieKey && this.vault) {
      const [, version] = target.cookieKey.split('-').slice(-1);
      await this.vault.restore({ agentId, version: parseInt(version) || undefined }).catch(() => {});
    }

    // Navigate to the snapshot URL
    await this.driver.exec({ action: 'navigate', agentId, url: target.url });

    // Re-apply storage + scroll position now that the page has loaded
    if (target.stateBlob) {
      try {
        const state = JSON.parse(target.stateBlob);
        await this.driver.exec({
          action: 'eval',
          agentId,
          code: `(function(s){
            try { for (const k in s.localStorage)   localStorage.setItem(k, s.localStorage[k]); } catch(_) {}
            try { for (const k in s.sessionStorage) sessionStorage.setItem(k, s.sessionStorage[k]); } catch(_) {}
            window.scrollTo(s.scrollX || 0, s.scrollY || 0);
          })(${target.stateBlob})`,
        });
      } catch (_) {}
    }

    this.sse?.emit('rewind.restored', { agentId, target, ts: Date.now() });
    return { restored: target };
  }

  // ── Clear ─────────────────────────────────────────────────────────────────
  clear(agentId) {
    this._sessions.delete(agentId);
    try {
      const fp = path.join(REWIND_DIR, `${agentId}.json`);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch (_) {}
    return { cleared: true };
  }

  // ── Internals ─────────────────────────────────────────────────────────────
  _pushSnapshot(agentId, entry) {
    if (!this._sessions.has(agentId)) this._sessions.set(agentId, []);
    const snaps = this._sessions.get(agentId);
    // Don't snapshot the same URL twice in a row
    if (snaps.length && snaps[snaps.length - 1].url === entry.url) return;
    snaps.push(entry);
    if (snaps.length > MAX_SNAPSHOTS) snaps.splice(0, snaps.length - MAX_SNAPSHOTS);
  }

  _scheduleAutoSnapshot(agentId, url, title) {
    // Debounce — reset timer on every nav event
    if (this._autoTimers.has(agentId)) clearTimeout(this._autoTimers.get(agentId));
    const timer = setTimeout(() => {
      this.snapshot(agentId, { url, title, label: 'auto' }).catch(() => {});
      this._autoTimers.delete(agentId);
    }, 2000); // 2s after last nav event
    this._autoTimers.set(agentId, timer);
  }

  // §PERF 2026-08-12 — was fs.writeFileSync() called synchronously on
  // every single snapshot (every ~30s of idle per tab, or 2s after a nav
  // event), blocking Electron's single main thread for the whole app —
  // not just this tab — while it serialized and wrote potentially-large
  // stateBlobs (full localStorage/sessionStorage contents). Now: mark
  // dirty and let a short debounce timer do one async write per agent,
  // collapsing bursts (e.g. several quick navs) into a single write.
  _persist(agentId) {
    this._dirty.add(agentId);
    if (this._flushTimer) return;
    this._flushTimer = setTimeout(() => this._flushDirty(), 1000);
    if (this._flushTimer.unref) this._flushTimer.unref();
  }

  _flushDirty() {
    this._flushTimer = null;
    const agentIds = [...this._dirty];
    this._dirty.clear();
    for (const agentId of agentIds) {
      const fp   = path.join(REWIND_DIR, `${agentId.replace(/[^a-z0-9-]/gi, '_')}.json`);
      const data = this._sessions.get(agentId) || [];
      fs.writeFile(fp, JSON.stringify(data, null, 2), 'utf8', () => {}); // best-effort, non-blocking
    }
  }

  // Called from shutdown() so a pending debounce doesn't lose the very
  // latest snapshot if the app quits inside the 1s window.
  flushSync() {
    if (this._flushTimer) { clearTimeout(this._flushTimer); this._flushTimer = null; }
    for (const agentId of this._dirty) {
      try {
        const fp   = path.join(REWIND_DIR, `${agentId.replace(/[^a-z0-9-]/gi, '_')}.json`);
        const data = this._sessions.get(agentId) || [];
        fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
    }
    this._dirty.clear();
  }

  _loadIfNeeded(agentId) {
    if (this._sessions.has(agentId)) return;
    try {
      const fp = path.join(REWIND_DIR, `${agentId.replace(/[^a-z0-9-]/gi, '_')}.json`);
      if (fs.existsSync(fp)) {
        this._sessions.set(agentId, JSON.parse(fs.readFileSync(fp, 'utf8')));
      }
    } catch (_) {}
  }

  _getSession(agentId) {
    if (!this.ctxMgr) return null;
    const ses = this.ctxMgr.getSession(agentId);
    return ses ? { session: ses } : null;
  }
}

module.exports = RewindEngine;
