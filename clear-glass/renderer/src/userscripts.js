/**
 * renderer/src/userscripts.js — Userscript manager panel. Extracted from
 * browser.html's inline <script> ("Userscript manager" section).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';

let usVisible = false;

export async function loadUserscripts({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }
  const list = document.getElementById('us-list');
  const scripts = (await cg.userscripts.list({ agentId })) || [];
  if (!scripts.length) {
    list.innerHTML =
      '<div style="padding:12px;font-size:10px;color:var(--text-dim);">No userscripts. Guardian scripts load automatically when GUARDIAN_DIR is set.</div>';
    return scripts;
  }
  list.innerHTML = '';
  scripts.forEach((s) => {
    const div = document.createElement('div');
    div.className = 'us-item';
    div.innerHTML = `
      <span class="us-type">${s.type === 'guardian' ? '⟳' : '⚙'}</span>
      <span class="us-name" title="${s.matches?.join(', ')}">${s.name}</span>
      <button class="us-inject-btn" data-id="${s.id}">Inject</button>
      <button class="us-toggle ${s.enabled ? 'on' : ''}" data-id="${s.id}" title="${s.enabled ? 'Disable' : 'Enable'}"></button>`;
    div.querySelector('.us-inject-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await cg.userscripts.inject(agentId, s.id);
      } catch (err) {
        addMsg('assistant', `Script inject error: ${err.message}`);
      }
    });
    div.querySelector('.us-toggle').addEventListener('click', async (e) => {
      e.stopPropagation();
      await cg.userscripts.toggle(s.id, !s.enabled);
      loadUserscripts({ onAddMsg });
    });
    list.appendChild(div);
  });
  return scripts;
}

export function initUserscripts({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  gateButton('btn-userscripts', {
    label: 'Userscripts',
    run: async () => {
      usVisible = !usVisible;
      document.getElementById('userscript-panel').classList.toggle('visible', usVisible);
      if (usVisible) await loadUserscripts({ onAddMsg });
    },
  });

  gateButton('us-close', {
    label: 'Close userscripts',
    run: () => {
      usVisible = false;
      document.getElementById('userscript-panel').classList.remove('visible');
    },
  });

  gateButton('us-new-btn', {
    label: 'New userscript',
    run: () => {
      addMsg(
        'assistant',
        `To create a userscript, tell Co-pilot:\n"Create a userscript that [description]"\n\nIt will write and install it for you.`
      );
      usVisible = false;
      document.getElementById('userscript-panel').classList.remove('visible');
    },
  });
}
