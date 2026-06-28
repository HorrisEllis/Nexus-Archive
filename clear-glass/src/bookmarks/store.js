'use strict';
/**
 * src/bookmarks/store.js — Clear Glass Bookmark Store
 * UUID: cg-bookmarks-v1-0000-0000-000000000019
 *
 * Per-agent bookmarks. Named, tagged, bus-controllable.
 * Gates: bookmarks.add, bookmarks.remove, bookmarks.list, bookmarks.open
 * Cortex/copilot can add, tag, and open bookmarks through the bus.
 * Renderer syncs on every change via SSE.
 *
 * Schema per entry:
 *   { id, url, title, agentId, tags[], faviconUrl, createdAt, visitCount, lastVisited }
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const BOOKMARKS_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'bookmarks.json'
);

class BookmarkStore {
  constructor() {
    this.data = []; // flat array — filter by agentId on query
  }

  async load() {
    try {
      fs.mkdirSync(path.dirname(BOOKMARKS_PATH), { recursive: true });
      if (fs.existsSync(BOOKMARKS_PATH)) {
        this.data = JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf8'));
      }
    } catch (err) {
      console.warn('[Bookmarks] Load error:', err.message);
      this.data = [];
    }
    return this.data;
  }

  _save() {
    try {
      fs.mkdirSync(path.dirname(BOOKMARKS_PATH), { recursive: true });
      fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      // Non-fatal in test environments without home dir
    }
  }

  add({ url, title, agentId = 'default', tags = [], faviconUrl }) {
    if (!url) throw new Error('url required');

    // Deduplicate by url + agentId
    const existing = this.data.find(b => b.url === url && b.agentId === agentId);
    if (existing) {
      // Update title/tags if provided
      if (title)        existing.title      = title;
      if (tags.length)  existing.tags       = [...new Set([...existing.tags, ...tags])];
      if (faviconUrl)   existing.faviconUrl = faviconUrl;
      existing.updatedAt = Date.now();
      this._save();
      return { bookmark: existing, added: false };
    }

    const bookmark = {
      id:          randomUUID(),
      url,
      title:       title || url,
      agentId,
      tags:        [...new Set(tags)],
      faviconUrl:  faviconUrl || null,
      createdAt:   Date.now(),
      updatedAt:   Date.now(),
      visitCount:  0,
      lastVisited: null,
    };

    this.data.push(bookmark);
    this._save();
    return { bookmark, added: true };
  }

  remove({ id, url, agentId }) {
    const before = this.data.length;
    if (id) {
      this.data = this.data.filter(b => b.id !== id);
    } else if (url && agentId) {
      this.data = this.data.filter(b => !(b.url === url && b.agentId === agentId));
    } else {
      throw new Error('id or (url + agentId) required');
    }
    this._save();
    return { removed: before - this.data.length };
  }

  list({ agentId, tag, query } = {}) {
    let results = this.data;
    if (agentId) results = results.filter(b => b.agentId === agentId || b.agentId === '*');
    if (tag)     results = results.filter(b => b.tags.includes(tag));
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(b =>
        b.url.toLowerCase().includes(q) || b.title.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  recordVisit({ id, url, agentId }) {
    const bk = id
      ? this.data.find(b => b.id === id)
      : this.data.find(b => b.url === url && b.agentId === agentId);
    if (!bk) return;
    bk.visitCount++;
    bk.lastVisited = Date.now();
    this._save();
  }

  isBookmarked({ url, agentId = 'default' }) {
    return this.data.some(b => b.url === url && b.agentId === agentId);
  }

  tag({ id, tags }) {
    const bk = this.data.find(b => b.id === id);
    if (!bk) throw new Error('Bookmark not found');
    bk.tags = [...new Set([...bk.tags, ...tags])];
    bk.updatedAt = Date.now();
    this._save();
    return bk;
  }
}

module.exports = BookmarkStore;
