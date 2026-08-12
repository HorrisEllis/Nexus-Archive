'use strict';

/**
 * Context Manager
 * One Chromium session partition per agent.
 * Each context is fingerprinted, cookie-isolated, and independently routable.
 * Contexts are SEAM entities — they register into the bus.
 */

const { session } = require('electron');
const { v4: uuidv4 } = require('uuid');
const { applyCspBypass } = require('./session-headers');

class ContextManager {
  constructor({ fp, vault, sse }) {
    this.fp      = fp;    // FingerprintEngine
    this.vault   = vault; // CookieVault
    this.sse     = sse;
    this.contexts = new Map(); // agentId → Context
    // §PERF 2026-08-12 — see the ses.cookies.on('changed', ...) guard
    // below. session.fromPartition() returns the SAME underlying session
    // object for a given partition name across calls, but destroy() only
    // ever removed the agentId from `this.contexts` — it never removed
    // the listener attached to that session. Every destroy()-then-
    // create() cycle for the same agentId was adding a second 'changed'
    // listener on top of the first (which kept firing with its stale
    // closure), tripling on the next cycle, etc. This set tracks which
    // session objects already have the listener wired, once, ever.
    this._cookieListenerWired = new WeakSet();
  }

  async init() {
    console.log('[ContextMgr] Ready');
  }

  // ── Context lifecycle ─────────────────────────────────────────────────
  async create({ agentId, profileOptions = {}, url } = {}) {
    const id = agentId || uuidv4();
    if (this.contexts.has(id)) return this.contexts.get(id);

    // Firefox fingerprint profile
    const profile = this.fp.getOrGenerate(id);

    // Isolated Chromium session partition
    const ses = session.fromPartition(`persist:agent-${id}`, { cache: true });
    applyCspBypass(ses);

    // Apply user agent
    ses.setUserAgent(profile.ua);

    // Apply Accept-Language
    ses.setSpellCheckerLanguages([profile.language]);

    // Request header injection — Firefox header order and values
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      const headers = { ...details.requestHeaders };
      const accept = profile.accept;
      const isNav  = details.resourceType === 'mainFrame' || details.resourceType === 'subFrame';
      const set    = isNav ? accept.navigation : accept.fetch;

      // Apply Firefox headers, preserve existing values where appropriate
      for (const [k, v] of Object.entries(set)) {
        if (!headers[k]) headers[k] = v;
      }

      // Override User-Agent always
      headers['User-Agent'] = profile.ua;

      callback({ requestHeaders: headers });
    });

    // Network error tracking for RAID health scoring
    ses.webRequest.onErrorOccurred((details) => {
      this.sse.emit('context.network.error', {
        agentId:    id,
        url:        details.url,
        error:      details.error,
        statusCode: details.statusCode,
        ts:         Date.now(),
      });
      this._updateHealth(id, 'error');
    });

    ses.webRequest.onCompleted((details) => {
      if (details.statusCode >= 400) {
        this._updateHealth(id, 'http-error', details.statusCode);
      } else {
        this._updateHealth(id, 'ok');
      }
    });

    // Cookie change events → SSE + vault. Wired once per underlying
    // session object (see constructor note) — a destroy()+create() cycle
    // for the same agentId reuses the same session and must NOT attach a
    // second listener.
    if (!this._cookieListenerWired.has(ses)) {
      this._cookieListenerWired.add(ses);
      ses.cookies.on('changed', (event, cookie, cause, removed) => {
        // Context may have been destroy()'d since this listener was
        // wired (same underlying session, no longer a live context) —
        // drop instead of emitting/snapshotting for a dead agentId.
        if (!this.contexts.has(id)) return;

        this.sse.emit('cookie.event', {
          agentId: id,
          cookie:  { name: cookie.name, domain: cookie.domain, path: cookie.path },
          cause,
          removed,
          ts:      Date.now(),
        });

        // Auto-snapshot on significant cookie changes
        if (cause === 'explicit' && !removed) {
          this.vault.snapshot(id, ses).catch(() => {});
        }
      });
    }

    const ctx = {
      id,
      uuid:     uuidv4(),
      profile,
      session:  ses,
      health:   { score: 100, errors: 0, requests: 0, lastCheck: Date.now() },
      createdAt: Date.now(),
      url:      url || 'about:blank',
    };

    this.contexts.set(id, ctx);

    this.sse.emit('context.created', {
      agentId:  id,
      uuid:     ctx.uuid,
      ua:       profile.ua,
      timezone: profile.timezone,
      ts:       Date.now(),
    });

    console.log(`[ContextMgr] Created context: ${id}`);
    return ctx;
  }

  async ensureContext(agentId) {
    return this.contexts.get(agentId) || await this.create({ agentId });
  }

  async switchTo({ agentId }) {
    const ctx = await this.ensureContext(agentId);
    this.sse.emit('context.switched', { agentId, ts: Date.now() });
    return { agentId, profile: ctx.profile };
  }

  async destroy(agentId) {
    const ctx = this.contexts.get(agentId);
    if (!ctx) return;

    // Final cookie snapshot before destruction
    await this.vault.snapshot(agentId, ctx.session).catch(() => {});

    this.contexts.delete(agentId);
    this.sse.emit('context.destroyed', { agentId, ts: Date.now() });
  }

  // ── Health scoring for RAID ───────────────────────────────────────────
  _updateHealth(agentId, event, statusCode) {
    const ctx = this.contexts.get(agentId);
    if (!ctx) return;

    ctx.health.requests++;

    if (event === 'error' || event === 'http-error') {
      ctx.health.errors++;

      // Rate limit detection
      if (statusCode === 429) {
        ctx.health.score = Math.max(0, ctx.health.score - 30);
        ctx.health.rateLimited = true;
        ctx.health.rateLimitedAt = Date.now();
        this.sse.emit('context.rate-limited', { agentId, ts: Date.now() });
      } else {
        ctx.health.score = Math.max(0, ctx.health.score - 5);
      }
    } else {
      // Recovery — slow score restoration
      ctx.health.score = Math.min(100, ctx.health.score + 0.5);
      ctx.health.rateLimited = false;
    }

    ctx.health.lastCheck = Date.now();
  }

  getHealth(agentId) {
    return this.contexts.get(agentId)?.health || null;
  }

  // ── Enumeration ───────────────────────────────────────────────────────
  list() {
    return [...this.contexts.entries()].map(([id, ctx]) => ({
      id,
      uuid:      ctx.uuid,
      ua:        ctx.profile.ua,
      health:    ctx.health,
      createdAt: ctx.createdAt,
    }));
  }

  listIds() {
    return [...this.contexts.keys()];
  }

  getSession(agentId) {
    return this.contexts.get(agentId)?.session || null;
  }

  // ── Fingerprint mode switching ─────────────────────────────────────────
  // Called via 'context.fp.switch' gate
  // modes: 'firefox' | 'chrome' | 'safari' | 'edge'
  async switchFingerprint({ agentId, mode = 'firefox', options = {} }) {
    const ctx = await this.ensureContext(agentId);

    let profile;
    if (mode === 'firefox') {
      profile = this.fp.generate(agentId + '-ff-' + Date.now(), { ...options, mode: 'firefox' });
    } else if (mode === 'chrome') {
      profile = this.fp.generateChrome
        ? this.fp.generateChrome(agentId + '-ch-' + Date.now(), options)
        : this.fp.generate(agentId + '-ch-' + Date.now(), { ...options, mode: 'chrome' });
    } else {
      profile = this.fp.generate(agentId + '-' + mode + '-' + Date.now(), options);
    }

    ctx.session.setUserAgent(profile.ua);
    ctx.profile = profile;
    ctx.fpMode  = mode;

    this.sse.emit('context.fp.switched', { agentId, mode, ua: profile.ua, ts: Date.now() });
    return { agentId, mode, ua: profile.ua };
  }
}

module.exports = ContextManager;
