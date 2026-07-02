/**
 * renderer/src/mesh-diag.js — Agent Mesh + Diagnostics toolbar buttons.
 * Extracted from browser.html's inline <script> ("Mesh button" +
 * "Diag button" sections).
 */

import { cg } from './cg-bridge.js';
import { agentId } from './state.js';
import { gateButton } from './gate-runtime.js';

export function initMeshDiag({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  gateButton('btn-mesh', {
    label: 'Agent Mesh',
    run: async () => {
      await cg.driver.exec({ action: 'eval', agentId, code: 'null' }).catch(() => ({ result: null }));
      addMsg(
        'assistant',
        `Agent Mesh — use Co-pilot to spawn agents:\n"spawn claude agent"\n"route this prompt to perplexity"\n"enqueue task to all agents"`
      );
    },
  });

  gateButton('btn-diag', {
    label: 'Diagnostics',
    run: async () => {
      addMsg('assistant', `Running NEXUS UI audit...`);
      await cg.copilot.send({
        message: 'Run the NEXUS UI audit diagnostic now.',
        agentId,
        systemExtra: 'Execute: driver.exec({ action: "diag.nexus", agentId })',
      });
    },
  });
}
