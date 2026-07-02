/**
 * renderer/src/providers.js — Provider panel (NCP hosted tabs). Extracted
 * from browser.html's inline <script> ("Provider panel" section).
 */

import { cg } from './cg-bridge.js';
import { gateButton } from './gate-runtime.js';

let providerVisible = false;

export async function loadProviders({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }
  const list = document.getElementById('provider-list');
  const providers = (await cg.providers.list()) || [];
  list.innerHTML = '';
  providers.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'prov-item';
    item.innerHTML = `
      <div class="prov-dot ${p.hosted ? 'active' : ''}"></div>
      <span class="prov-name">${p.name}</span>
      <button class="prov-btn ${p.hosted ? 'active' : ''}" data-id="${p.id}">
        ${p.hosted ? 'Show' : 'Start'}
      </button>`;
    item.querySelector('button').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (p.hosted) {
        await cg.providers.show(p.id);
      } else {
        addMsg('assistant', `Starting ${p.name} provider...`);
        try {
          await cg.providers.start(p.id, { show: true });
          addMsg('assistant', `✓ ${p.name} NCP provider active.`);
        } catch (err) {
          addMsg('assistant', `Failed to start ${p.name}: ${err.message}`);
        }
      }
      await loadProviders({ onAddMsg });
    });
    list.appendChild(item);
  });
  return providers;
}

export function initProviders({ onAddMsg } = {}) {
  gateButton('btn-providers', {
    label: 'Providers',
    run: async () => {
      providerVisible = !providerVisible;
      document.getElementById('provider-panel').classList.toggle('visible', providerVisible);
      if (providerVisible) await loadProviders({ onAddMsg });
    },
  });

  document.addEventListener('cg:sse:provider.host.started', () => {
    if (providerVisible) loadProviders({ onAddMsg });
  });
  document.addEventListener('cg:sse:provider.host.stopped', () => {
    if (providerVisible) loadProviders({ onAddMsg });
  });
}
