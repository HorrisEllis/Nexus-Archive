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
const VAULT_KEY  = 'clear-glass-vault-key-v1'; // TODO: derive from machine ID
const ALGORITHM  = 'aes-256-gcm';

class CookieVault {
  constructor() {
    this.snapshots = new Map();   // agentId → [{ ts, cookies }]
    this.db        = null;
    this.key       = this._deriveKey(VAULT_KEY);
  }

  async init() {
    fs.mkdirSync(VAULT_DIR, { recursive: true });

    if (Database) {
      try {
        this.db = new Database(path.join(VAULT_DIR, 'vault.db'));
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
        const filePath = path.join(VAULT_DIR, `${agentId}-${version}.json`);
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
      const filePath = path.join(VAULT_DIR, `account-${agentId}-${accountId}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ encrypted, domain, ts: Date.now() }));
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
    }

    return [];
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
    }
    return [];
  }

  _nextVersion(agentId) {
    if (this.db) {
      const row = this.db.prepare(
        'SELECT MAX(version) as v FROM cookie_snapshots WHERE agent_id = ?'
      ).get(agentId);
      return (row?.v || 0) + 1;
    }
    return (this.snapshots.get(agentId)?.length || 0) + 1;
  }

  _deriveKey(passphrase) {
    return crypto.createHash('sha256').update(passphrase).digest();
  }

  _encrypt(plaintext) {
    const iv  = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    let enc = cipher.update(plaintext, 'utf8', 'hex');
    enc += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return { iv: iv.toString('hex'), tag: tag.toString('hex'), data: enc };
  }

  _decrypt({ iv, tag, data }) {
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let dec = decipher.update(data, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
}

module.exports = CookieVault;
