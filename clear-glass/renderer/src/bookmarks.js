/**
 * renderer/src/bookmarks.js — bookmarks bar + star button. Extracted from
 * browser.html's inline <script> ("Bookmarks" section). `toggleBookmark`
 * and `loadBookmarks` are exported so a future CLI/API surface can drive
 * the exact same bookmark logic the button uses, instead of duplicating it.
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';

export async function loadBookmarks() {
  const wv = document.getElementById('wv');
  const bks = (await cg.bookmarks.list({ agentId })) || [];
  const list = document.getElementById('bookmarks-list');
  list.innerHTML = '';
  bks.slice(0, 20).forEach((bk) => {
    const btn = document.createElement('button');
    btn.className = 'bk-btn';
    btn.title = bk.url;
    btn.textContent = bk.title || bk.url;
    btn.addEventListener('click', () => {
      wv.loadURL(bk.url);
      cg.bookmarks.visit({ id: bk.id });
    });
    list.appendChild(btn);
  });
  return bks;
}

/** Bookmark/unbookmark the page currently open in the given webview. */
export async function toggleBookmark(url, title) {
  if (!url || url === 'about:blank') return { changed: false };
  const isMarked = await cg.bookmarks.check({ url, agentId }).catch(() => false);
  if (isMarked) {
    const bks = await cg.bookmarks.list({ agentId });
    const found = bks.find((b) => b.url === url);
    if (found) await cg.bookmarks.remove({ id: found.id });
    return { changed: true, marked: false };
  }
  await cg.bookmarks.add({ url, title, agentId });
  return { changed: true, marked: true };
}

export function initBookmarks({ onAddMsg } = {}) {
  const wv = document.getElementById('wv');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  gateButton('btn-bookmark', {
    label: 'Bookmark page',
    run: async () => {
      const url = wv.getURL();
      const title = wv.getTitle();
      const result = await toggleBookmark(url, title);
      if (result.changed) {
        document.getElementById('btn-bookmark').style.color = result.marked ? '#f5c842' : '';
      }
      loadBookmarks();
    },
  });

  gateButton('bookmark-mgr-btn', {
    label: 'Manage bookmarks',
    run: () => {
      addMsg(
        'assistant',
        'Bookmarks can be managed via Co-pilot: "list my bookmarks", "delete bookmark [title]", "open bookmark [title]"'
      );
    },
  });

  wv.addEventListener('did-stop-loading', async () => {
    const url = wv.getURL();
    if (url && url !== 'about:blank') {
      try {
        const isMarked = await cg.bookmarks.check({ url, agentId });
        document.getElementById('btn-bookmark').style.color = isMarked ? '#f5c842' : '';
      } catch {}
    }
  });

  document.addEventListener('cg:sse:bookmarks.added', () => loadBookmarks());
  document.addEventListener('cg:sse:bookmarks.removed', () => loadBookmarks());

  loadBookmarks();
}
