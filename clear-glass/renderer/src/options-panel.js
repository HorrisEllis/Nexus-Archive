/**
 * renderer/src/options-panel.js — Nexus Options panel. Extracted from
 * browser.html's inline <script> ("Options panel" section).
 */

import { cg, cgCall } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton, gateOn } from './gate-runtime.js';
import { loadBookmarks } from './bookmarks.js';

export function initOptionsPanel({ onAddMsg } = {}) {
  const optionsPanel = document.getElementById('options-panel');
  const optToggleHideTray = document.getElementById('opt-hide-tray');
  const optToggleCopilot = document.getElementById('opt-copilot-auto');
  const optDefaultUrl = document.getElementById('opt-default-url');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  async function openOptionsPanel() {
    optionsPanel.classList.add('visible');

    try {
      const providers = (await cg.providers.list()) || [];
      const optProvList = document.getElementById('opt-providers-list');
      if (optProvList) {
        optProvList.innerHTML = providers
          .map(
            (p) => `
          <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.hosted ? 'var(--green)' : 'var(--text-dim)'};flex-shrink:0;"></span>
            <span style="flex:1;font-size:11px;">${p.name}</span>
            <button class="opt-link-btn prov-opt-btn" data-id="${p.id}" data-hosted="${p.hosted}">
              ${p.hosted ? 'Active ✓' : 'Start'}
            </button>
          </div>`
          )
          .join('');
        optProvList.querySelectorAll('.prov-opt-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const hosted = btn.dataset.hosted === 'true';
            if (hosted) {
              await cg.providers.show(id);
            } else {
              btn.textContent = 'Starting…';
              try {
                await cg.providers.start(id, { show: true });
              } catch (err) {
                addMsg('assistant', `Provider error: ${err.message}`);
              }
            }
            openOptionsPanel();
          });
        });
      }
    } catch {}

    try {
      const bks = (await cg.bookmarks.list({ agentId })) || [];
      const el = document.getElementById('opt-bookmarks-count');
      if (el) el.textContent = `${bks.length} bookmark${bks.length !== 1 ? 's' : ''} for this agent`;
    } catch {}

    try {
      const snaps = (await cg.rewind.list(agentId, 50)) || [];
      const el = document.getElementById('opt-rewind-count');
      if (el) el.textContent = `${snaps.length} snapshot${snaps.length !== 1 ? 's' : ''} recorded`;
    } catch {}

    const opts = await cg.options.get();
    optToggleHideTray.classList.toggle('on', !!opts.hideToTrayOnClose);
    optToggleCopilot.classList.toggle('on', !!opts.autoOpenCopilotPane);
    optDefaultUrl.value = opts.defaultStartUrl || 'about:blank';
  }

  function bindToggle(el) {
    el.addEventListener('click', async () => {
      const next = !el.classList.contains('on');
      el.classList.toggle('on', next);
      try {
        await cg.options.set({ [el.dataset.key]: next });
      } catch (err) {
        el.classList.toggle('on', !next);
        addMsg('assistant', `Failed to save option: ${err.message}`);
      }
    });
  }

  gateButton('btn-options', { label: 'Nexus Options', run: openOptionsPanel });
  gateButton('options-panel-close', {
    label: 'Close options',
    run: () => optionsPanel.classList.remove('visible'),
  });

  gateOn('opt-default-url', 'keydown', {
    label: 'Confirm default URL',
    when: (e) => e.key === 'Enter',
    run: () => optDefaultUrl.blur(),
  });

  bindToggle(optToggleHideTray);
  bindToggle(optToggleCopilot);

  gateOn('opt-default-url', 'change', {
    label: 'Save default URL',
    run: () => cg.options.set({ defaultStartUrl: optDefaultUrl.value.trim() || 'about:blank' }),
  });

  gateButton('opt-link-api-settings', {
    label: 'API Settings',
    run: () => cgCall('window', 'openSettings'),
  });

  gateButton('opt-link-nexus-audit', {
    label: 'NEXUS UI Audit',
    run: () => {
      cg.diag.nexus({ agentId });
      addMsg('assistant', 'NEXUS UI Audit dispatched — results will land on the bus.');
    },
  });

  gateButton('opt-clear-bookmarks', {
    label: 'Clear bookmarks',
    run: async () => {
      const bks = (await cg.bookmarks.list({ agentId })) || [];
      for (const bk of bks) await cg.bookmarks.remove({ id: bk.id }).catch(() => {});
      loadBookmarks();
      addMsg('assistant', `Cleared ${bks.length} bookmark(s).`);
      await openOptionsPanel();
    },
  });

  gateButton('opt-clear-rewind', {
    label: 'Clear rewind history',
    run: async () => {
      await cg.rewind.clear(agentId);
      addMsg('assistant', 'Rewind history cleared.');
      await openOptionsPanel();
    },
  });

  gateButton('opt-ff-import-btn', {
    label: 'Import Firefox profile',
    check: () => !!document.getElementById('opt-ff-profile-path')?.value?.trim(),
    run: async () => {
      const profilePath = document.getElementById('opt-ff-profile-path').value.trim();
      await cg.copilot
        .send({
          message: `Import Firefox profile from path: ${profilePath} for agent ${agentId}`,
          agentId,
          systemExtra: `Execute: context.fp.switch({ agentId: "${agentId}", mode: "firefox", profilePath: "${profilePath}" })`,
        })
        .catch(() => {});
      addMsg('assistant', `Firefox profile import requested for ${agentId}.`);
    },
  });

  return { openOptionsPanel };
}
