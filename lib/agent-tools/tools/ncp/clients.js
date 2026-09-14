'use strict';
/**
 * lib/agent-tools/tools/ncp/clients.js
 *
 * §MCO-NCP-FANOUT 2026-09-13 — real diagnostic sibling to status.js.
 * status.js answers "is this provider connected at all" (guardian's own
 * /providers, which collapses multiple real clients for one provider down
 * to a single entry). This answers the question that mattered for the
 * real bug this session found and fixed: exactly how many real tabs are
 * connected for a provider right now, and which ONE of them
 * dispatcher.js's real selectDispatchTarget() would actually pick —
 * guardian's new GET /ncp/clients, built alongside the dispatcher fix.
 */
const http = require('http');

const GUARDIAN_PORT = parseInt(process.env.GUARDIAN_PORT || '7820', 10);

function _get(path, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: GUARDIAN_PORT, path, method: 'GET', timeout: timeoutMs },
      (res) => {
        let out = ''; res.on('data', c => out += c);
        res.on('end', () => { try { resolve(JSON.parse(out)); } catch (e) { reject(new Error(`bad response from guardian: ${e.message}`)); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('guardian unreachable — is it running?')); });
    req.end();
  });
}

module.exports = {
  name: 'ncp_clients',
  description:
    'Real, non-lossy list of every connected NCP client for one provider (tabId, claimed, lastHeartbeat, chatId) ' +
    'plus which single tab dispatcher.js\'s real selection logic would actually dispatch the next job to. Use ' +
    'this to diagnose a provider that seems connected but jobs keep timing out — it surfaces the real multi-tab ' +
    'conflict (several tabs open for the same provider, none claimed) that a plain "connected: true" from ' +
    'ncp_status cannot show.',
  parameters: {
    type: 'object',
    properties: {
      provider: { type: 'string', description: 'the provider to inspect — e.g. claude, chatgpt, gemini' },
    },
    required: ['provider'],
  },
  execute: async (a) => {
    if (!a.provider) return { error: 'provider required' };
    try {
      return await _get(`/ncp/clients?provider=${encodeURIComponent(a.provider)}`);
    } catch (e) {
      return { error: `ncp_clients failed: ${e.message}` };
    }
  },
};
