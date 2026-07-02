/**
 * renderer/src/rewind.js — Rewind panel (session snapshots). Extracted
 * from browser.html's inline <script> ("Rewind" section).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';

let rewindVisible = false;

export async function loadRewindList() {
  const list = document.getElementById('rewind-list');
  const snaps = (await cg.rewind.list(agentId, 20)) || [];
  if (!snaps.length) {
    list.innerHTML =
      '<span style="color:var(--text-dim);font-size:10px;padding:8px;">No snapshots yet. Browse a page to start recording.</span>';
    return snaps;
  }
  list.innerHTML = '';
  snaps.forEach((s) => {
    const div = document.createElement('div');
    div.className = 'rewind-item';
    const ago = Math.round((Date.now() - s.ts) / 60000);
    div.innerHTML = `<div class="ri-title">${s.title || s.url}</div>
      <div class="ri-url">${s.url}</div>
      <div class="ri-ts">${ago < 1 ? 'just now' : ago + 'm ago'}${s.label === 'auto' ? '' : ' • ' + s.label}</div>`;
    div.addEventListener('click', async () => {
      document.getElementById('rewind-panel').classList.remove('visible');
      rewindVisible = false;
      await cg.rewind.restore({ agentId, snapshotId: s.id });
    });
    list.appendChild(div);
  });
  return snaps;
}

export function initRewind({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  gateButton('btn-rewind', {
    label: 'Rewind',
    run: async () => {
      rewindVisible = !rewindVisible;
      document.getElementById('rewind-panel').classList.toggle('visible', rewindVisible);
      if (rewindVisible) await loadRewindList();
    },
  });

  gateButton('rewind-close', {
    label: 'Close Rewind',
    run: () => {
      rewindVisible = false;
      document.getElementById('rewind-panel').classList.remove('visible');
    },
  });

  gateButton('rewind-snap-btn', {
    label: 'Take snapshot',
    run: async () => {
      await cg.rewind.snapshot(agentId, { label: 'manual' });
      await loadRewindList();
      addMsg('assistant', '📍 Snapshot saved.');
    },
  });

  document.addEventListener('cg:sse:rewind.snapshotted', () => {
    if (rewindVisible) loadRewindList();
  });
}
