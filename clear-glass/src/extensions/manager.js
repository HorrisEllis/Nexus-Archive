'use strict';
/**
 * src/extensions/manager.js — WebExtension support
 * UUID: cg-extensions-manager-v1-0000-0000-000000000001
 *
 * Electron supports loading unpacked Chrome/WebExtension-format extensions
 * (manifest.json + the usual extension APIs Electron implements — see
 * https://www.electronjs.org/docs/latest/api/extensions) via
 * session.loadExtension(path). This was entirely unbuilt in Clear Glass —
 * no manifest validation, no persistence across restarts, no UI. This
 * module is the real thing: validates manifest.json exists before handing
 * a path to Electron (which throws an opaque error otherwise), persists
 * the loaded set via the options store so extensions survive a restart,
 * and exposes list/load/unload for the IPC layer + UI to call.
 *
 * Scope: loads into session.defaultSession. Per-agent partitions
 * (persist:ncp-<agentId>) each have their own isolated session and would
 * need extensions loaded per-partition too — not done here. Most
 * extensions (ad blockers, password managers, dev tools) are meant to
 * apply browser-wide, so defaultSession covers the common case first.
 */

const fs   = require('fs');
const path = require('path');

class ExtensionManager {
  constructor({ session, options }) {
    this.session = session; // session.defaultSession, passed in so this stays testable
    this.options = options; // nexusOptions store — persists { installedExtensions: [{path}] }
    this._loaded = new Map(); // extensionId -> { id, name, version, path }
  }

  // ── Validate + load one unpacked extension directory ─────────────────────
  async load(dirPath) {
    const manifestPath = path.join(dirPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return { ok: false, error: `No manifest.json in ${dirPath} — not a valid extension folder` };
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      return { ok: false, error: `manifest.json is not valid JSON: ${e.message}` };
    }

    if (!manifest.manifest_version) {
      return { ok: false, error: 'manifest.json missing manifest_version — not a valid extension' };
    }

    try {
      const ext = await this.session.loadExtension(dirPath, { allowFileAccess: true });
      const info = { id: ext.id, name: manifest.name || ext.id, version: manifest.version || '0.0.0', path: dirPath };
      this._loaded.set(ext.id, info);
      await this._persist();
      return { ok: true, extension: info };
    } catch (e) {
      // §1.2 — Electron's own error is usually specific enough (bad permissions
      // block, unsupported manifest key) to surface directly rather than wrap.
      return { ok: false, error: e.message };
    }
  }

  unload(extensionId) {
    if (!this._loaded.has(extensionId)) return { ok: false, error: 'not loaded' };
    try {
      this.session.removeExtension(extensionId);
      this._loaded.delete(extensionId);
      this._persist().catch(() => {});
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  list() {
    return [...this._loaded.values()];
  }

  // ── Reload everything the user had installed last session ────────────────
  async loadPersisted() {
    const saved = this.options?.get?.().installedExtensions || [];
    const results = [];
    for (const { path: dirPath } of saved) {
      if (!fs.existsSync(dirPath)) {
        console.warn(`[extensions] skipping missing path (was it moved/deleted?): ${dirPath}`);
        continue;
      }
      results.push(await this.load(dirPath));
    }
    return results;
  }

  async _persist() {
    if (!this.options?.set) return;
    const installedExtensions = this.list().map(e => ({ path: e.path }));
    await this.options.set({ installedExtensions });
  }
}

module.exports = ExtensionManager;
