'use strict';
/**
 * src/userscripts/manager.js — Clear Glass Userscript Manager
 * UUID: cg-userscript-mgr-v1-0000-0000-000000000023
 *
 * Manages userscripts per agent. Scripts can be:
 *   - Guardian's NCP userscripts (auto-loaded from guardianDir)
 *   - User-created scripts stored in .clear-glass/userscripts/
 *   - Co-pilot injected scripts (ephemeral, stored in session)
 *
 * Each script has: { id, name, source, enabled, agentId|'*', matches[], persistent }
 * 'persistent' means re-inject on every navigation to matching URL.
 * '*' agentId means inject in all agents.
 *
 * Gates: userscript.list, userscript.inject, userscript.toggle,
 *        userscript.create, userscript.delete, userscript.edit
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const SCRIPTS_DIR = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'userscripts'
);

class UserscriptManager {
  constructor({ guardianDir, driver, sse } = {}) {
    this.guardianDir = guardianDir;
    this.driver      = driver;
    this.sse         = sse || { emit: () => {} };
    this._scripts    = new Map(); // id → ScriptDef
    this._injected   = new Map(); // `${agentId}:${scriptId}` → boolean
  }

  async init() {
    fs.mkdirSync(SCRIPTS_DIR, { recursive: true });
    await this._loadUserScripts();
    await this._loadGuardianScripts();
    console.log(`[Userscripts] ${this._scripts.size} scripts loaded`);
  }

  // ── Load user scripts from disk ───────────────────────────────────────
  async _loadUserScripts() {
    try {
      const files = fs.readdirSync(SCRIPTS_DIR).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const id   = file.replace('.js', '');
        const src  = fs.readFileSync(path.join(SCRIPTS_DIR, file), 'utf8');
        const meta = this._parseMeta(src);
        this._scripts.set(id, {
          id,
          name:       meta.name || file,
          source:     src,
          enabled:    meta.enabled !== false,
          agentId:    meta.agentId || '*',
          matches:    meta.match ? [meta.match] : meta.matches || ['*'],
          persistent: meta.persistent !== false,
          type:       'user',
          path:       path.join(SCRIPTS_DIR, file),
        });
      }
    } catch (_) {}
  }

  // ── Load Guardian NCP userscripts (read-only entries) ─────────────────
  async _loadGuardianScripts() {
    if (!this.guardianDir) return;
    const guardianScripts = [
      { file: 'userscript-claude.js',      id: 'guardian-claude',      name: 'Guardian — Claude',      matches: ['https://claude.ai/*'] },
      { file: 'userscript-chatgpt.js',     id: 'guardian-chatgpt',     name: 'Guardian — ChatGPT',     matches: ['https://chatgpt.com/*', 'https://chat.openai.com/*'] },
      { file: 'userscript-gemini.js',      id: 'guardian-gemini',      name: 'Guardian — Gemini',      matches: ['https://gemini.google.com/*'] },
      { file: 'userscript-perplexity.js',  id: 'guardian-perplexity',  name: 'Guardian — Perplexity',  matches: ['https://www.perplexity.ai/*'] },
      { file: 'userscript-ollama.js',      id: 'guardian-ollama',      name: 'Guardian — Ollama',      matches: ['http://localhost:11434/*'] },
    ];

    for (const s of guardianScripts) {
      const fp = path.join(this.guardianDir, s.file);
      if (!fs.existsSync(fp)) continue;
      try {
        const source = fs.readFileSync(fp, 'utf8');
        this._scripts.set(s.id, {
          id:         s.id,
          name:       s.name,
          source,
          enabled:    true,
          agentId:    '*',
          matches:    s.matches,
          persistent: true,
          type:       'guardian',
          path:       fp,
          readOnly:   true,
        });
      } catch (_) {}
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────
  list({ agentId, type } = {}) {
    let scripts = [...this._scripts.values()];
    if (agentId) scripts = scripts.filter(s => s.agentId === agentId || s.agentId === '*');
    if (type)    scripts = scripts.filter(s => s.type === type);
    return scripts.map(s => ({
      id: s.id, name: s.name, enabled: s.enabled,
      agentId: s.agentId, matches: s.matches, type: s.type,
      persistent: s.persistent, readOnly: s.readOnly || false,
      injected: this._isInjected(agentId || '*', s.id),
    }));
  }

  create({ name, source, agentId = '*', matches = ['*'], persistent = false }) {
    if (!name) throw new Error('name required');
    if (!source) throw new Error('source required');
    const id = randomUUID();
    const script = {
      id, name, source, enabled: true, agentId, matches, persistent, type: 'user',
      path: path.join(SCRIPTS_DIR, `${id}.js`),
    };
    this._scripts.set(id, script);
    this._saveToDisk(script);
    this.sse.emit('userscript.created', { id, name, agentId });
    return script;
  }

  edit(id, updates) {
    const script = this._scripts.get(id);
    if (!script) throw new Error(`Script not found: ${id}`);
    if (script.readOnly) throw new Error(`Script is read-only (Guardian script): ${id}`);
    Object.assign(script, updates);
    this._saveToDisk(script);
    this.sse.emit('userscript.edited', { id, name: script.name });
    return script;
  }

  toggle(id, enabled) {
    const script = this._scripts.get(id);
    if (!script) throw new Error(`Script not found: ${id}`);
    script.enabled = enabled;
    if (!script.readOnly) this._saveToDisk(script);
    this.sse.emit('userscript.toggled', { id, enabled });
    return { id, enabled };
  }

  delete(id) {
    const script = this._scripts.get(id);
    if (!script) throw new Error(`Script not found: ${id}`);
    if (script.readOnly) throw new Error('Cannot delete Guardian script');
    this._scripts.delete(id);
    try { if (script.path) fs.unlinkSync(script.path); } catch (_) {}
    this.sse.emit('userscript.deleted', { id });
    return { deleted: id };
  }

  getSource(id) {
    const script = this._scripts.get(id);
    if (!script) throw new Error(`Script not found: ${id}`);
    return script.source;
  }

  // ── Injection ───────────────────────────────────────────────────────────
  async inject(agentId, scriptId) {
    const script = this._scripts.get(scriptId);
    if (!script) throw new Error(`Script not found: ${scriptId}`);
    if (!script.enabled) throw new Error(`Script disabled: ${scriptId}`);

    const injectable = this._buildInjectable(script);
    try {
      await this.driver.exec({ action: 'eval', agentId, code: injectable });
      this._injected.set(`${agentId}:${scriptId}`, true);
      this.sse.emit('userscript.injected', { agentId, scriptId, name: script.name });
      return { ok: true, scriptId, agentId };
    } catch (err) {
      this.sse.emit('userscript.inject.error', { agentId, scriptId, error: err.message });
      throw err;
    }
  }

  // Auto-inject matching scripts when URL loads
  async autoInject(agentId, url) {
    const matching = [...this._scripts.values()].filter(s =>
      s.enabled && this._matchesUrl(s.matches, url)
    );
    for (const script of matching) {
      await this.inject(agentId, script.id).catch(() => {});
    }
    return matching.length;
  }

  // ── Internals ───────────────────────────────────────────────────────────
  // §FIXED 2026-08-17 — James, direct, urgent: "guardian isn't working...
  // the ncp tabs aren't connected." Root cause, confirmed against the real
  // screenshot showing "Uncaught ReferenceError: GM_setValue is not
  // defined" for a script injected through THIS manager: _buildInjectable
  // never included the GM shim that clear-glass/src/providers/host.js's
  // own _inject() already correctly prepends for its own injection path.
  // Every real Guardian userscript uses GM_getValue/GM_setValue/GM_
  // xmlhttpRequest — without the shim, the injected script throws on its
  // very first line, before any of its real logic (including NCP
  // registration/heartbeat) ever executes. That's the whole story: a
  // script that crashes immediately never gets the chance to connect.
  // Reused the real, existing shim (same one host.js uses correctly),
  // not a second implementation.
  _buildInjectable(script) {
    let gmShim = '';
    try { gmShim = require('../providers/gm-shim').buildGmShim(); }
    catch (_) { /* shim module unreachable — script still injects, GM_* calls will throw as before, not silently worse */ }
    // Idempotency guard — never run twice in same page session
    return `(function(){
  if (window.__cgScript_${script.id.replace(/-/g,'_')}) return;
  window.__cgScript_${script.id.replace(/-/g,'_')} = Date.now();
  ${gmShim}
  ${script.source}
})();`;
  }

  _matchesUrl(patterns, url) {
    if (!url) return false;
    return patterns.some(p => {
      if (p === '*') return true;
      const re = new RegExp('^' + p.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      return re.test(url);
    });
  }

  _isInjected(agentId, scriptId) {
    return this._injected.get(`${agentId}:${scriptId}`) || false;
  }

  _parseMeta(source) {
    const meta = {};
    const block = source.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
    if (!block) return meta;
    const lines = block[1].split('\n');
    for (const line of lines) {
      const m = line.match(/\/\/\s+@(\w+)\s+(.+)/);
      if (m) meta[m[1]] = m[2].trim();
    }
    return meta;
  }

  _saveToDisk(script) {
    try {
      if (script.path) fs.writeFileSync(script.path, script.source, 'utf8');
    } catch (_) {}
  }
}

module.exports = UserscriptManager;
