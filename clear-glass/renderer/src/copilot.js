/**
 * renderer/src/copilot.js — Co-pilot chat pane. Extracted from
 * browser.html's inline <script> ("Co-pilot" section). `addMsg` is
 * exported because most other panels post status lines into this same
 * chat log — it's the app's one shared "tell the user something" channel
 * besides toast().
 */

import { cg } from './cg-bridge.js';
import { agentId, state } from './state.js';
import { gateButton, gateOn } from './gate-runtime.js';

let copilotMsgs = null;

export function addMsg(role, content, html = false) {
  if (!copilotMsgs) copilotMsgs = document.getElementById('copilot-messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (html) div.innerHTML = content;
  else div.textContent = content;
  copilotMsgs.appendChild(div);
  copilotMsgs.scrollTop = copilotMsgs.scrollHeight;
}

function removeThinking() {
  copilotMsgs.querySelectorAll('.thinking').forEach((el) => el.remove());
}

export function initCopilot() {
  const wv = document.getElementById('wv');
  const copilotToggle = document.getElementById('copilot-toggle');
  const copilotPane = document.getElementById('copilot-pane');
  copilotMsgs = document.getElementById('copilot-messages');
  const copilotInput = document.getElementById('copilot-textarea');

  async function sendCopilot() {
    const text = copilotInput.value.trim();
    if (!text) return;

    copilotInput.value = '';
    addMsg('user', text);
    addMsg('thinking', '⋯');

    let domContext = null;
    if (state.ctxDom) {
      try {
        domContext = await wv.executeJavaScript('window.__cgDomMesh?.getTree(3)', true);
      } catch {}
    }

    let systemExtra = '';
    if (state.ctxPicks && state.picks.length) {
      systemExtra += `\n## Picked Elements\n${JSON.stringify(state.picks, null, 2).slice(0, 1000)}`;
    }

    try {
      const res = await cg.copilot.send({ message: text, agentId, domContext, systemExtra });
      removeThinking();

      const formatted = res.text
        .replace(/```driver[\s\S]*?```/g, () => `<span style="color:var(--accent);font-family:var(--mono);font-size:10px;">[driver command sent]</span>`)
        .replace(/`([^`]+)`/g, '<code>$1</code>');

      addMsg('assistant', formatted, true);

      for (const cmd of res.commands || []) {
        try {
          await cg.driver.exec({ ...cmd, agentId });
        } catch (err) {
          addMsg('assistant', `Command error: ${err.message}`);
        }
      }
    } catch (err) {
      removeThinking();
      addMsg('assistant', `Error: ${err.message}`);
    }
  }

  gateButton('copilot-toggle', {
    label: 'Toggle Co-pilot',
    run: () => {
      state.copilotVisible = !state.copilotVisible;
      copilotPane.classList.toggle('hidden', !state.copilotVisible);
      copilotToggle.classList.toggle('active', state.copilotVisible);
    },
  });

  gateButton('copilot-clear', {
    label: 'Clear Co-pilot history',
    run: () => {
      copilotMsgs.innerHTML = '';
      addMsg('assistant', 'History cleared. Ready.');
    },
  });

  gateButton('ctx-dom', {
    label: 'Toggle DOM context',
    run: (e) => {
      state.ctxDom = !state.ctxDom;
      e.target.classList.toggle('active', state.ctxDom);
    },
  });
  gateButton('ctx-picks', {
    label: 'Toggle picks context',
    run: (e) => {
      state.ctxPicks = !state.ctxPicks;
      e.target.classList.toggle('active', state.ctxPicks);
    },
  });
  gateButton('ctx-cookies', {
    label: 'Toggle cookies context',
    run: (e) => {
      state.ctxCookies = !state.ctxCookies;
      e.target.classList.toggle('active', state.ctxCookies);
    },
  });

  gateOn('copilot-textarea', 'keydown', {
    label: 'Send (Enter)',
    when: (e) => e.key === 'Enter' && !e.shiftKey,
    run: (e) => {
      e.preventDefault();
      return sendCopilot();
    },
  });
  gateButton('copilot-send', { label: 'Send', run: sendCopilot });

  // Apply Nexus options that affect initial render.
  cg.options
    .get()
    .then((opts) => {
      if (opts && opts.autoOpenCopilotPane === false) {
        state.copilotVisible = false;
        copilotPane.classList.add('hidden');
        copilotToggle.classList.remove('active');
      }
    })
    .catch(() => {});

  return { addMsg, sendCopilot };
}
