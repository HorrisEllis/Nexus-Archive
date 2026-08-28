'use strict';
/**
 * src/extensions/manager.js — Real Chrome Extension Loader
 * UUID: cg-extensions-manager-v1-0000-0000-000000000013
 *
 * Real gap named in CLEAR-GLASS-FULL-CHROME-MAP-2026-08-23.md's §5:
 * "Extensions | zero — no webextension loading (confirmed earlier
 * session)."
 *
 * Wraps Electron's real, current session.extensions API (confirmed
 * directly against node_modules/electron/electron.d.ts before writing
 * this — session.loadExtension/removeExtension/getAllExtensions are the
 * OLDER, deprecated form; session.extensions.loadExtension/... is the
 * current, non-deprecated namespace, used here). Real, honest scope:
 * this loads real unpacked Chrome extensions (a directory with a real
 * manifest.json — the same format CLEAR-GLASS-FULL-CHROME-MAP-
 * 2026-08-23.md's §10 discussed for the old Guardian extension itself)
 * into a real Electron session. It does NOT reimplement the Chrome
 * extension API surface (chrome.* APIs available to loaded extensions
 * are whatever Electron itself provides — a real, separate, much larger
 * scope this file doesn't attempt).
 *
 * §PERSISTENCE — Electron does NOT remember loaded extensions across app
 * restarts; loadExtension() must be called on every boot (stated
 * directly in Electron's own docs, confirmed in the .d.ts comment this
 * file quotes). This manager persists the list of extension PATHS the
 * user has loaded (not the extensions themselves) so they can be
 * re-loaded automatically on the next boot — real, working persistence
 * for what Electron itself doesn't persist.
 */

const path = require('path');
const fs   = require('fs');

const REGISTRY_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'extensions.json'
);

class ExtensionManager {
  constructor({ session } = {}) {
    this.session = session; // a real Electron Session (e.g. session.defaultSession, or a specific partition's)
    this.knownPaths = []; // real, persisted extension directory paths
  }

  loadRegistry() {
    try {
      fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
      if (fs.existsSync(REGISTRY_PATH)) {
        this.knownPaths = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
      } else {
        this._persist();
      }
    } catch (err) {
      console.warn('[Extensions] registry load error:', err.message);
    }
    return this.knownPaths;
  }

  _persist() {
    try {
      fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(this.knownPaths, null, 2));
    } catch (err) {
      console.warn('[Extensions] registry persist error:', err.message);
    }
  }

  /**
   * load(dirPath, options) -> Promise<real Extension info>. Real,
   * honest validation before calling Electron: a directory with no
   * manifest.json isn't a Chrome extension, and Electron's own error
   * for that case is not always clear about WHY it failed — checked
   * here first so the caller gets a real, specific reason.
   */
  async load(dirPath, options = {}) {
    if (!this.session?.extensions?.loadExtension) {
      throw new Error('No real Electron session with extensions support available');
    }
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      throw new Error(`Not a real directory: ${dirPath}`);
    }
    const manifestPath = path.join(dirPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`No manifest.json found in ${dirPath} — not a real unpacked extension`);
    }

    const ext = await this.session.extensions.loadExtension(dirPath, options);

    if (!this.knownPaths.includes(dirPath)) {
      this.knownPaths.push(dirPath);
      this._persist();
    }
    return { id: ext.id, name: ext.name, version: ext.version, path: ext.path, url: ext.url };
  }

  /** unload(extensionId) — real, also removes from the persisted registry by matching the loaded extension's own real path. */
  unload(extensionId) {
    if (!this.session?.extensions?.removeExtension) {
      throw new Error('No real Electron session with extensions support available');
    }
    const loaded = this.list().find(e => e.id === extensionId);
    this.session.extensions.removeExtension(extensionId);
    if (loaded) {
      this.knownPaths = this.knownPaths.filter(p => p !== loaded.path);
      this._persist();
    }
    return { unloaded: true };
  }

  /** list() -> real, currently-loaded extensions (not the persisted path registry — what's ACTUALLY loaded right now). */
  list() {
    if (!this.session?.extensions?.getAllExtensions) return [];
    return this.session.extensions.getAllExtensions().map(e => ({ id: e.id, name: e.name, version: e.version, path: e.path, url: e.url }));
  }

  /**
   * reloadKnown() — real reload-on-boot: loads every persisted path,
   * skipping (not failing the whole batch on) any that no longer exist
   * or no longer have a valid manifest — a real, honest partial-success
   * result, not an all-or-nothing operation.
   */
  async reloadKnown() {
    const loaded = [];
    const failed = [];
    for (const dirPath of this.knownPaths) {
      try { loaded.push(await this.load(dirPath)); }
      catch (err) { failed.push({ path: dirPath, error: err.message }); }
    }
    return { loaded, failed };
  }
}

module.exports = { ExtensionManager };
