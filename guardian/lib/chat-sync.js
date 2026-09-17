'use strict';
/**
 * guardian/lib/chat-sync.js — DOM-based chat synchronization.
 * comp_id: nexus.guardian.chat-sync
 *
 * §BUILT 2026-09-17 — James: "why indexdb? why can't we manipulate the
 * entire dom, what if we had a cli for each agent, then we use that as
 * a way to synchronize the chats. yes do it."
 *
 * requestSync(provider) pushes GUARDIAN_SYNC_REQUEST to that provider's
 * connected tab, which reads its own live DOM (see userscript-<provider>.js's
 * _nexusGetFullChat() — real selectors, already used elsewhere in that
 * file for _nexusGetMessages(), just without the 2000-char truncation)
 * and reports the full transcript back via GUARDIAN_SYNC_RESULT. Same
 * exact round-trip shape as this module's own proven precedent,
 * dispatcher.js's _pingProvider() / GUARDIAN_PING_ACK — copied
 * deliberately, not reinvented, because that shape is already correct:
 * push, wait on a bus event scoped to a random id, timeout, and a
 * zero-clients short-circuit so a provider with no connected tab fails
 * immediately instead of waiting out the full timeout for nothing.
 *
 * §HONEST SCOPE — read-only. This never touches the composer and never
 * submits anything; a sync must not risk sending a message. And per
 * each userscript's own header note, claude/chatgpt return a real,
 * verified full transcript; gemini/deepseek/perplexity return
 * `chat.partial: true` (assistant's last response only) until those
 * three get a verified human-turn selector the same way findResponseEl()
 * already has one — not invented blind here.
 */

function createChatSync({ bus, ncp }) {
  /**
   * requestSync(provider, timeoutMs) -> Promise<{ok, chat?, reason?}>
   * chat (when ok) is whatever the userscript's _nexusGetFullChat()
   * returned: { provider, chatId, url, extractedAt, messages, partial? }.
   */
  function requestSync(provider, timeoutMs = 15000) {
    return new Promise((resolve) => {
      const syncId = require('crypto').randomUUID();
      let settled = false;

      const onResult = (ev) => {
        if (ev?.data?.provider !== provider || ev?.data?.syncId !== syncId) return;
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        bus.off('guardian.ncp.sync_result', onResult);
        if (ev.data.error) resolve({ ok: false, reason: ev.data.error });
        else resolve({ ok: true, chat: ev.data.chat });
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        bus.off('guardian.ncp.sync_result', onResult);
        resolve({ ok: false, reason: 'sync timeout' });
      }, timeoutMs);

      bus.on('guardian.ncp.sync_result', onResult);
      const sent = ncp.push(provider, { type: 'GUARDIAN_SYNC_REQUEST', syncId });
      if (sent === 0) {
        // Same real-evidence short-circuit as _pingProvider — no client
        // received the write, no reason to wait out the timeout.
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        bus.off('guardian.ncp.sync_result', onResult);
        resolve({ ok: false, reason: 'sync write reached 0 clients — provider not connected' });
      }
    });
  }

  return { requestSync };
}

module.exports = { createChatSync };
