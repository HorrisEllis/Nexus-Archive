/**
 * renderer/src/picker.js — element picker overlay + picked-elements panel.
 * Extracted from browser.html's inline <script> ("Element picker" section).
 */

import { gateButton } from './gate-runtime.js';
import { state } from './state.js';
import { PICKER_SCRIPT } from './injected-scripts.js';

export function initPicker({ onAddMsg } = {}) {
  const wv = document.getElementById('wv');
  const pickerBtn = document.getElementById('picker-btn');
  const picksPanel = document.getElementById('picks-panel');
  const picksList = document.getElementById('picks-list');

  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  function renderPicks() {
    if (!state.picks.length) {
      picksList.innerHTML = '<span style="color:var(--text-dim);font-size:10px;padding:8px;">No picks yet.</span>';
      return;
    }
    picksList.innerHTML = state.picks
      .map(
        (p) => `
      <div class="pick-item" data-name="${p.name}">
        <span class="pick-tag">&lt;${p.tag}&gt;</span>${p.id_attr ? ' #' + p.id_attr : ''}
        <div class="pick-name">${p.name} · ${p.text?.slice(0, 30) || ''}</div>
      </div>
    `
      )
      .join('');
  }

  gateButton('picker-btn', {
    label: 'Element picker',
    run: async () => {
      state.pickerActive = !state.pickerActive;
      pickerBtn.classList.toggle('active', state.pickerActive);
      if (state.pickerActive) {
        await wv.executeJavaScript(PICKER_SCRIPT);
      } else {
        await wv.executeJavaScript(`if (window.__cgPicker) window.__cgPicker.destroy();`).catch(() => {});
      }
    },
  });

  wv.addEventListener('ipc-message', (e) => {
    if (e.channel === 'dom:pick-result') {
      const pick = { ...e.args[0], pickId: 'pick-' + Date.now(), name: `pick-${state.picks.length + 1}` };
      state.picks.push(pick);
      renderPicks();
      picksPanel.classList.add('visible');
      state.pickerActive = false;
      pickerBtn.classList.remove('active');
      addMsg(
        'assistant',
        `Picked: <code>${pick.tag}${pick.id_attr ? '#' + pick.id_attr : ''}${pick.classes ? '.' + pick.classes.split(' ')[0] : ''}</code> — registered as "${pick.name}"`
      );
    }
  });

  return { renderPicks, activateFromContextMenu: async () => {
    state.pickerActive = true;
    pickerBtn.classList.add('active');
    await wv.executeJavaScript(PICKER_SCRIPT);
  } };
}
