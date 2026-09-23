'use strict';

/**
 * Cookie Vault
 * Encrypted per-agent cookie storage with versioned snapshots.
 * Supports save, restore, snapshot, and diff for RAID fallback routing.
 * Backed by SQLite for durability. Cortex events on every state change.
 */

const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

// Use better-sqlite3 if available, fallback to JSON file store
let Database;
try { Database = require('better-sqlite3'); } catch {}

const VAULT_DIR  = path.join(process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'vault');
// §CLOSED 2026-09-23 — the old 'TODO: derive from machine ID'. This string is
// now only the LEGACY key (kept so records written before the fix stay
// readable); new writes use a random key sealed by Electron safeStorage —
// see src/security/vault-key.js.
const VAULT_KEY  = 'clear-glass-vault-key-v1';
const { loadVaultKey, encryptWith, decryptWithFallback } = require('../security/vault-key');

class CookieVault {
  constructor({ dir = VAULT_DIR, safeStorage, noSqlite = false } = {}) {
    this.snapshots = new Map();   // agentId → [{ ts, cookies }]
    this.db        = null;
    this.dir       = dir;
    this._noSqlite = noSqlite;
    this._safeStorage = safeStorage;
    // Usable before init() (legacy key) so nothing that constructs-then-uses
    // without awaiting init() breaks; init() upgrades it to the sealed key.
    this._k = { key: this._deriveKey(VAULT_KEY), legacyKey: this._deriveKey(VAULT_KEY), source: 'legacy', reason: 'init() not yet run' };
    this.key = this._k.key;
  }

  keyStatus() { return { source: this._k.source, reason: this._k.reason || null }; }

  async init() {
    fs.mkdirSync(this.dir, { recursive: true });
    this._k = loadVaultKey({ name: 'cookie-vault', legacyPassphrase: VAULT_KEY, dir: this.dir, safeStorage: this._safeStorage });
    this.key = this._k.key;

    if (Database && !this._noSqlite) {
      try {
        this.db = new Database(path.join(this.dir, 'vault.db'));
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS cookie_snapshots (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id    TEXT NOT NULL,
            version     INTEGER NOT NULL,
            ts          INTEGER NOT NULL,
            label       TEXT,
            data        TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_agent ON cookie_snapshots(agent_id, ts);

          CREATE TABLE IF NOT EXISTS account_cookies (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id    TEXT NOT NULL,
            account_id  TEXT NOT NULL,
            domain      TEXT NOT NULL,
            data        TEXT NOT NULL,
            updated_at  INTEGER NOT NULL
          );
          CREATE UNIQUE INDEX IF NOT EXISTS idx_account ON account_cookies(agent_id, account_id, domain);
        `);
        console.log('[CookieVault] SQLite initialized');
      } catch (err) {
        console.warn('[CookieVault] SQLite failed, using file store:', err.message);
        this.db = null;
      }
    }
  }

  // ── Snapshot current session cookies ────────────────────────────────
  async snapshot(agentId, ses, label = null) {
    try {
      const cookies = await ses.cookies.get({});
      const version = this._nextVersion(agentId);
      const entry   = {
        agentId,
        version,
        ts:      Date.now(),
        label:   label || `snapshot-${version}`,
        cookies,
      };

      const encrypted = this._encrypt(JSON.stringify(cookies));

      if (this.db) {
        this.db.prepare(`
          INSERT INTO cookie_snapshots (agent_id, version, ts, label, data)
          VALUES (?, ?, ?, ?, ?)
        `).run(agentId, version, entry.ts, entry.label, JSON.stringify(encrypted));
      } else {
        const filePath = path.join(this.dir, `${agentId}-${version}.json`);
        fs.writeFileSync(filePath, JSON.stringify({ ...encrypted, ts: entry.ts, label: entry.label }));
      }

      // Keep in-memory cache of last 3 snapshots per agent
      if (!this.snapshots.has(agentId)) this.snapshots.set(agentId, []);
      const snaps = this.snapshots.get(agentId);
      snaps.push(entry);
      if (snaps.length > 3) snaps.shift();

      return { version, ts: entry.ts, count: cookies.length };
    } catch (err) {
      console.error('[CookieVault] Snapshot error:', err.message);
      return null;
    }
  }

  // ── Save named account cookies ────────────────────────────────────────
  async save({ agentId, accountId, domain, cookies }) {
    if (!agentId || !accountId) throw new Error('agentId and accountId required');

    const encrypted = this._encrypt(JSON.stringify(cookies || []));

    if (this.db) {
      this.db.prepare(`
        INSERT INTO account_cookies (agent_id, account_id, domain, data, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(agent_id, account_id, domain) DO UPDATE SET
          data = excluded.data,
          updated_at = excluded.updated_at
      `).run(agentId, accountId, domain || '*', JSON.stringify(encrypted), Date.now());
    } else {
      fs.mkdirSync(this.dir, { recursive: true });
      fs.writeFileSync(this._accountFile(agentId, accountId), JSON.stringify({ encrypted, domain, ts: Date.now(), count: (cookies || []).length }));
    }

    return { ok: true, agentId, accountId };
  }

  // ── Restore cookies into session ──────────────────────────────────────
  async restore({ agentId, accountId, version, ses }) {
    let cookies = [];

    if (accountId) {
      // Restore named account cookies
      cookies = await this._loadAccountCookies(agentId, accountId);
    } else {
      // Restore snapshot version
      cookies = await this._loadSnapshot(agentId, version);
    }

    if (!ses) return { cookies, restored: false, reason: 'no session provided' };

    // Clear existing cookies for these domains
    const domains = [...new Set(cookies.map(c => c.domain).filter(Boolean))];
    for (const domain of domains) {
      await ses.cookies.remove(`https://${domain.replace(/^\./, '')}`, '').catch(() => {});
    }

    // Set restored cookies
    let restored = 0;
    for (const cookie of cookies) {
      try {
        await ses.cookies.set({
          url:      `https://${cookie.domain?.replace(/^\./, '') || 'localhost'}`,
          name:     cookie.name,
          value:    cookie.value,
          domain:   cookie.domain,
          path:     cookie.path || '/',
          secure:   cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate,
        });
        restored++;
      } catch {}
    }

    return { restored, total: cookies.length };
  }

  // ── List snapshots ────────────────────────────────────────────────────
  listSnapshots(agentId) {
    if (this.db) {
      return this.db.prepare(`
        SELECT id, agent_id, version, ts, label FROM cookie_snapshots
        WHERE agent_id = ? ORDER BY ts DESC LIMIT 20
      `).all(agentId);
    }
    return this.snapshots.get(agentId)?.map(s => ({
      version: s.version, ts: s.ts, label: s.label, count: s.cookies?.length,
    })) || [];
  }

  // ── Health check — token validity heuristic ───────────────────────────
  async checkTokenHealth(agentId, ses) {
    if (!ses) return { healthy: false };
    try {
      const cookies = await ses.cookies.get({});
      const sessionCookies = cookies.filter(c =>
        c.name.match(/sess|token|auth|jwt|sid/i) && !c.expirationDate
      );
      const expiredCookies = cookies.filter(c =>
        c.expirationDate && c.expirationDate * 1000 < Date.now()
      );
      return {
        healthy:        expiredCookies.length === 0,
        total:          cookies.length,
        sessionTokens:  sessionCookies.length,
        expired:        expiredCookies.length,
      };
    } catch (err) {
      return { healthy: false, error: err.message };
    }
  }

  // ── Internals ──────────────────────────────────────────────────────────
  async _loadSnapshot(agentId, version) {
    // Try memory cache first
    const cached = this.snapshots.get(agentId);
    if (cached) {
      const snap = version
        ? cached.find(s => s.version === version)
        : cached[cached.length - 1];
      if (snap) return snap.cookies || [];
    }

    if (this.db) {
      const row = version
        ? this.db.prepare('SELECT data FROM cookie_snapshots WHERE agent_id = ? AND version = ?').get(agentId, version)
        : this.db.prepare('SELECT data FROM cookie_snapshots WHERE agent_id = ? ORDER BY ts DESC LIMIT 1').get(agentId);

      if (row) {
        const enc = JSON.parse(row.data);
        return JSON.parse(this._decrypt(enc));
      }
      return [];
    }

    // §BUGFIX 2026-09-23 — same file-store gap as _loadAccountCookies: snapshot()
    // writes <agentId>-<version>.json when SQLite is absent (every real install),
    // but only memory and SQLite were ever read — a snapshot older than the
    // 3-entry memory cache, or any snapshot after a restart, came back [].
    const files = this._snapshotFiles(agentId);
    const pick = version ? files.find(f => f.version === Number(version)) : files[files.length - 1];
    if (!pick) return [];
    const rec = JSON.parse(fs.readFileSync(pick.file, 'utf8'));
    return JSON.parse(this._decrypt({ iv: rec.iv, tag: rec.tag, data: rec.data }));
  }

  _snapshotFiles(agentId) {
    if (!fs.existsSync(this.dir)) return [];
    const esc = String(agentId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^${esc}-(\\d+)\\.json$`);
    return fs.readdirSync(this.dir).map(n => { const m = n.match(re); return m ? { version: Number(m[1]), file: path.join(this.dir, n) } : null; })
      .filter(Boolean).sort((a, b) => a.version - b.version);
  }

  async _loadAccountCookies(agentId, accountId) {
    if (this.db) {
      const row = this.db.prepare(
        'SELECT data FROM account_cookies WHERE agent_id = ? AND account_id = ?'
      ).get(agentId, accountId);
      if (row) {
        const enc = JSON.parse(row.data);
        return JSON.parse(this._decrypt(enc));
      }
      return [];
    }
    // §BUGFIX 2026-09-23 — found mapping the login-portal wire: better-sqlite3
    // is NOT in clear-glass/package.json, so every real install runs this
    // file-store branch — and save() wrote account-<agent>-<account>.json
    // while this method only ever read SQLite. Every agent-mesh
    // vault.restore() for a named account returned [] on a real machine.
    const f = this._accountFile(agentId, accountId);
    if (!fs.existsSync(f)) return [];
    const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
    return JSON.parse(this._decrypt(rec.encrypted));
  }

  _accountFile(agentId, accountId) {
    const safe = (v) => String(v).replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.dir, `account-${safe(agentId)}-${safe(accountId)}.json`);
  }

  /** accountMeta(agentId, accountId) — never decrypts: {stored, updatedAt, count|null}. */
  accountMeta(agentId, accountId) {
    if (this.db) {
      const row = this.db.prepare('SELECT MAX(updated_at) AS u, COUNT(*) AS n FROM account_cookies WHERE agent_id = ? AND account_id = ?').get(agentId, accountId);
      return { stored: !!(row && row.n), updatedAt: row?.u || null, count: null };
    }
    const f = this._accountFile(agentId, accountId);
    if (!fs.existsSync(f)) return { stored: false, updatedAt: null, count: null };
    try { const rec = JSON.parse(fs.readFileSync(f, 'utf8')); return { stored: true, updatedAt: rec.ts || null, count: rec.count ?? null }; }
    catch (_) { return { stored: true, updatedAt: null, count: null }; }
  }

  /** deleteAccountCookies(agentId, accountId) — real removal of one account's saved session. */
  deleteAccountCookies(agentId, accountId) {
    if (!agentId || !accountId) throw new Error('agentId and accountId required');
    let removed = 0;
    if (this.db) removed = this.db.prepare('DELETE FROM account_cookies WHERE agent_id = ? AND account_id = ?').run(agentId, accountId).changes;
    const f = this._accountFile(agentId, accountId);
    if (fs.existsSync(f)) { fs.unlinkSync(f); removed++; }
    return { ok: true, agentId, accountId, removed };
  }

  _nextVersion(agentId) {
    if (this.db) {
      const row = this.db.prepare(
        'SELECT MAX(version) as v FROM cookie_snapshots WHERE agent_id = ?'
      ).get(agentId);
      return (row?.v || 0) + 1;
    }
    // §BUGFIX 2026-09-23 — was memory-cache length + 1: after a restart (empty
    // cache) every new snapshot reused version 1 and overwrote <agentId>-1.json.
    const files = this._snapshotFiles(agentId);
    const mem = this.snapshots.get(agentId) || [];
    return Math.max(files.length ? files[files.length - 1].version : 0, mem.length ? mem[mem.length - 1].version : 0) + 1;
  }

  _deriveKey(passphrase) {
    return crypto.createHash('sha256').update(passphrase).digest();
  }

  _encrypt(plaintext) { return encryptWith(this._k.key, plaintext); }

  _decrypt(blob) { return decryptWithFallback(this._k, blob); }
}

module.exports = CookieVault;
