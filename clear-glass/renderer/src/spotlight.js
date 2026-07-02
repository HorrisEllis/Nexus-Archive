/**
 * renderer/src/spotlight.js — Spotlight command palette. Extracted from
 * browser.html's inline <script> ("Spotlight command palette" section).
 * Consolidates the feature-toggle buttons that used to live permanently
 * on the chrome bar. Default pin set lives in NexusOptions
 * (pinnedToolbarButtons) — anything not pinned shows here only.
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton, gateOn, runGated } from './gate-runtime.js';
import { openQueuePanel } from './mesh-queue.js';

const SPOTLIGHT_COMMANDS = [
  { id: 'btn-dom', icon: '⛏', label: 'DOM Archaeology', group: 'Tools', pinnable: true },
  { id: 'picker-btn', icon: '◎', label: 'Element Picker', group: 'Tools', pinnable: true },
  { id: 'btn-mesh', icon: '⬡', label: 'Agent Mesh', group: 'Tools', pinnable: true },
  { id: 'btn-diag', icon: '⚕', label: 'Diagnostics', group: 'Tools', pinnable: true },
  { id: 'copilot-toggle', icon: '✦', label: 'Toggle Co-pilot', group: 'Session', pinnable: true },
  { id: 'btn-bookmark', icon: '★', label: 'Bookmark this page', group: 'Session', pinnable: true },
  { id: 'btn-rewind', icon: '⏮', label: 'Rewind session', group: 'Session', pinnable: true },
  { id: 'btn-providers', icon: '⟳', label: 'NCP Providers', group: 'Session', pinnable: true },
  { id: 'btn-userscripts', icon: '✎', label: 'Userscripts', group: 'Session', pinnable: true },
  { id: 'btn-options', icon: '☰', label: 'Nexus Options', group: 'Session', pinnable: true },
  { action: 'new-agent', icon: '⊞', label: 'New Agent Window', group: 'Window' },
  { action: 'bg-tab', icon: '▣', label: 'Move to Background Tab', group: 'Window' },
  { action: 'maximize', icon: '⛶', label: 'Maximize / Restore', group: 'Window' },
  { action: 'queue', icon: '☰', label: 'Mesh Queue', group: 'Window' },
  { action: 'settings', icon: '⚙', label: 'API Settings…', group: 'Window' },
];

export function initSpotlight({ onAddMsg } = {}) {
  const wv = document.getElementById('wv');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  let currentPinned = [];
  let spotlightIndex = 0;

  function applyToolbarPins(pinned) {
    currentPinned = pinned || [];
    const pinnedSet = new Set(currentPinned);
    SPOTLIGHT_COMMANDS.forEach((cmd) => {
      if (!cmd.pinnable) return;
      const el = document.getElementById(cmd.id);
      if (el) el.style.display = pinnedSet.has(cmd.id) ? '' : 'none';
    });
  }

  function activateSpotlightCommand(cmd) {
    closeSpotlight();
    if (cmd.id) {
      document.getElementById(cmd.id)?.click();
      return;
    }
    const ACTIONS = {
      'new-agent': () => cg.window.open({ agentId: undefined, url: wv.getURL() }),
      'bg-tab': async () => {
        const url = wv.getURL();
        await cg.bgTabs.open({ agentId: agentId + '-bg', url });
        addMsg('assistant', `Moved to background tab: ${url}`);
      },
      maximize: () => cg.window.maximize(agentId),
      queue: () => openQueuePanel(),
      settings: () => cg.window.openSettings(),
    };
    const handler = ACTIONS[cmd.action];
    if (handler) runGated(`spotlight:${cmd.action}`, handler);
  }

  function renderSpotlightResults(query) {
    const q = (query || '').toLowerCase();
    const items = SPOTLIGHT_COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    const resultsEl = document.getElementById('spotlight-results');

    if (!items.length) {
      resultsEl.innerHTML = '<div class="spotlight-empty">No matching actions</div>';
      return;
    }

    resultsEl.innerHTML = items
      .map((c, i) => {
        const pinned = c.pinnable && currentPinned.includes(c.id);
        return `<div class="spotlight-item${i === spotlightIndex ? ' selected' : ''}" data-index="${i}">
        <span class="sl-icon">${c.icon}</span>
        <span class="sl-label">${c.label}</span>
        <span class="sl-group">${c.group}</span>
        ${c.pinnable ? `<button class="sl-pin${pinned ? ' pinned' : ''}" data-pin="${c.id}" title="${pinned ? 'Unpin from toolbar' : 'Pin to toolbar'}">${pinned ? '📌' : '📍'}</button>` : ''}
      </div>`;
      })
      .join('');

    resultsEl.querySelectorAll('.spotlight-item').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.sl-pin')) return;
        activateSpotlightCommand(items[+row.dataset.index]);
      });
    });
    resultsEl.querySelectorAll('.sl-pin').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        runGated('spotlight:pin', async () => {
          const id = btn.dataset.pin;
          const next = currentPinned.includes(id) ? currentPinned.filter((x) => x !== id) : [...currentPinned, id];
          await cg.options.set({ pinnedToolbarButtons: next });
          applyToolbarPins(next);
          renderSpotlightResults(document.getElementById('spotlight-input').value);
        });
      });
    });
  }

  function openSpotlight() {
    document.getElementById('spotlight-overlay').classList.add('visible');
    const input = document.getElementById('spotlight-input');
    input.value = '';
    spotlightIndex = 0;
    renderSpotlightResults('');
    setTimeout(() => input.focus(), 0);
  }

  function closeSpotlight() {
    document.getElementById('spotlight-overlay').classList.remove('visible');
  }

  gateButton('fab-btn', {
    label: 'Spotlight',
    run: () => {
      const isOpen = document.getElementById('spotlight-overlay').classList.contains('visible');
      isOpen ? closeSpotlight() : openSpotlight();
    },
  });

  document.getElementById('spotlight-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'spotlight-overlay') closeSpotlight();
  });
  document.getElementById('spotlight-input').addEventListener('input', (e) => {
    spotlightIndex = 0;
    renderSpotlightResults(e.target.value);
  });
  document.getElementById('spotlight-input').addEventListener('keydown', (e) => {
    const rows = document.getElementById('spotlight-results').querySelectorAll('.spotlight-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      spotlightIndex = Math.min(spotlightIndex + 1, rows.length - 1);
      rows.forEach((r, i) => r.classList.toggle('selected', i === spotlightIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      spotlightIndex = Math.max(spotlightIndex - 1, 0);
      rows.forEach((r, i) => r.classList.toggle('selected', i === spotlightIndex));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      rows[spotlightIndex]?.click();
    } else if (e.key === 'Escape') {
      closeSpotlight();
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSpotlight();
    }
  });

  cg.options.get().then((opts) => applyToolbarPins(opts.pinnedToolbarButtons)).catch(() => {});
}
