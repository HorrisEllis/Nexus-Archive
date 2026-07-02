/**
 * renderer/src/agent-dropdown.js — agent window switcher dropdown.
 * Extracted from browser.html's inline <script>
 * ("Agent window switcher dropdown" section).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';

export function initAgentDropdown() {
  const wv = document.getElementById('wv');
  const agentBadge = document.getElementById('agent-badge');
  const agentDropdown = document.getElementById('agent-dropdown');
  let agentDdVisible = false;

  async function openAgentDropdown() {
    let lists = { windows: [agentId], bgTabs: [] };
    try {
      lists = await cg.window.list();
    } catch {}

    const rows = [];
    rows.push(`<div class="agent-dd-section-label">Open Windows</div>`);
    for (const id of lists.windows) {
      rows.push(`<div class="agent-dd-item${id === agentId ? ' current' : ''}" data-focus="${id}">
        <span class="dd-dot"></span><span>${id}</span>
      </div>`);
    }
    if (lists.bgTabs.length) {
      rows.push(`<div class="agent-dd-section-label">Background Tabs</div>`);
      for (const id of lists.bgTabs) {
        rows.push(`<div class="agent-dd-item" data-focus="${id}"><span class="dd-dot" style="background:var(--text-dim);"></span><span>${id}</span></div>`);
      }
    }
    rows.push(`<div class="agent-dd-sep"></div>`);
    rows.push(`<div class="agent-dd-item" data-action="new-agent"><span>⊞</span><span>New Agent Window</span></div>`);

    agentDropdown.innerHTML = rows.join('');
    agentDropdown.querySelectorAll('[data-focus]').forEach((el) => {
      el.addEventListener('click', () => {
        cg.window.focus(el.dataset.focus);
        closeAgentDropdown();
      });
    });
    agentDropdown.querySelector('[data-action="new-agent"]')?.addEventListener('click', () => {
      cg.window.open({ agentId: undefined, url: wv.getURL() });
      closeAgentDropdown();
    });

    const rect = agentBadge.getBoundingClientRect();
    agentDropdown.style.left = rect.left + 'px';
    agentDropdown.style.top = rect.bottom + 6 + 'px';
    agentDropdown.classList.add('visible');
    agentDdVisible = true;
  }

  function closeAgentDropdown() {
    agentDdVisible = false;
    agentDropdown.classList.remove('visible');
  }

  gateButton('agent-badge', {
    label: 'Agent window switcher',
    run: (e) => {
      e.stopPropagation();
      return agentDdVisible ? closeAgentDropdown() : openAgentDropdown();
    },
  });

  document.addEventListener('click', (e) => {
    if (agentDdVisible && !agentDropdown.contains(e.target) && e.target !== agentBadge) closeAgentDropdown();
  });
}
