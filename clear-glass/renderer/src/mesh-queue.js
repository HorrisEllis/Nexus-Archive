/**
 * renderer/src/mesh-queue.js — Mesh queue panel. Extracted from
 * browser.html's inline <script> ("Mesh queue panel" section).
 */

import { cg } from './cg-bridge.js';

let queueVisible = false;

export async function renderQueuePanel() {
  const list = document.getElementById('queue-list');
  try {
    const { agents, queueDepth } = await cg.mesh.list();
    document.getElementById('queue-depth-label').textContent = queueDepth ? `${queueDepth} queued` : '';
    if (!agents.length) {
      list.innerHTML =
        '<div class="queue-empty">No mesh agents spawned yet. Co-pilot spawns one when you route a task to Claude, ChatGPT, etc.</div>';
      return;
    }
    list.innerHTML = agents
      .map(
        (a) => `
        <div class="queue-item">
          <span class="q-status ${a.status === 'working' ? 'working' : a.status === 'error' ? 'error' : 'idle'}">${a.status}</span>
          <span style="flex:1;">${a.key}</span>
          <span style="color:var(--text-dim);">${a.taskCount} task${a.taskCount === 1 ? '' : 's'}</span>
        </div>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = `<div class="queue-empty">Failed to load: ${err.message}</div>`;
  }
}

export function openQueuePanel() {
  queueVisible = true;
  document.getElementById('queue-panel').classList.add('visible');
  renderQueuePanel();
}

export function initMeshQueue() {
  const queuePanel = document.getElementById('queue-panel');

  document.addEventListener('click', (e) => {
    if (queueVisible && !queuePanel.contains(e.target) && e.target.id !== 'queue-trigger') {
      queueVisible = false;
      queuePanel.classList.remove('visible');
    }
  });

  ['cg:sse:mesh.queue.add', 'cg:sse:mesh.queue.processing', 'cg:sse:mesh.task.complete', 'cg:sse:mesh.task.error', 'cg:sse:mesh.agent.spawned'].forEach(
    (evt) => document.addEventListener(evt, () => { if (queueVisible) renderQueuePanel(); })
  );

  return { openQueuePanel };
}
