'use strict';
/**
 * lib/agent-tools/tools/raid/submit-contract.js
 *
 * §MCO16b/§MCO16c 2026-09-13 — real, direct copilot access to RAID's new
 * POST /api/raid/submit (cortex/boot.js), the write counterpart the read-
 * only GET /api/raid/queue never had. Calls the exact same real
 * submitContract() every other real submitter (officiator.js, idearium,
 * self-heal, architect) already uses — no second submission mechanism.
 *
 * Full parity with what this session built: executionSurface:'browser'
 * routes the contract through ClearGlass (_clearGlassExecutor) instead of
 * the default internal compartment; domSteps (when executionSurface is
 * 'browser') runs a real, ordered query/mutate sequence against a live
 * ClearGlass tab instead of dispatching a chat prompt.
 */
const http = require('http');

const CORTEX_PORT = parseInt(process.env.NEXUS_PORT || '3748', 10);

function _post(path, body, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: '127.0.0.1', port: CORTEX_PORT, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: timeoutMs },
      (res) => {
        let out = ''; res.on('data', c => out += c);
        res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(out) }); } catch (e) { reject(new Error(`bad response from cortex: ${e.message}`)); } });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('cortex unreachable — is it running?')); });
    req.write(data);
    req.end();
  });
}

module.exports = {
  name: 'raid_submit_contract',
  description:
    'Submit a real contract into RAID\'s queue (cortex\'s POST /api/raid/submit) — the same real pipeline every ' +
    'contract in this system goes through (queued -> handshake -> processing -> output). Set executionSurface to ' +
    '"browser" to run this contract against a live ClearGlass browser tab instead of the default internal ' +
    'compartment; when doing that, domSteps (an ordered array of {action:"query"|"mutate", providerId, selector, ' +
    'cgId, mutation}) runs real page interaction instead of dispatching a chat prompt. Returns the real queueId to ' +
    'track it with (GET /api/raid/queue). Honestly refuses — with the real reason — bad input (no content, an ' +
    'invalid executionSurface) rather than fabricating a queued contract.',
  parameters: {
    type: 'object',
    properties: {
      content:          { type: 'string', description: 'the real contract text/prompt' },
      source:           { type: 'string', description: 'optional — who/what this contract is from; defaults to "api"' },
      forAgent:         { type: 'string', description: 'optional — target agent, e.g. claude, chatgpt, gemini' },
      intention:        { type: 'string', description: 'optional — a real verb: build, write, analyze, query, dispatch, etc.' },
      dir:              { type: 'string', description: 'optional — real working directory this contract touches' },
      system:           { type: 'string', description: 'optional — which system this contract concerns' },
      dependsOn:        { type: 'array',  description: 'optional — queueIds this contract requires to PASS first' },
      executionSurface: { type: 'string', description: '"internal" (default) or "browser" — see description' },
      domSteps: {
        type: 'array',
        description: 'optional, only meaningful with executionSurface:"browser" — ordered [{action, providerId, selector, cgId, mutation}]',
      },
    },
    required: ['content'],
  },
  execute: async (a) => {
    if (!a.content || typeof a.content !== 'string' || !a.content.trim()) {
      return { error: 'content required — a real, non-empty contract' };
    }
    try {
      const { status, body } = await _post('/api/raid/submit', {
        content: a.content,
        source: a.source,
        forAgent: a.forAgent,
        intention: a.intention,
        dir: a.dir,
        system: a.system,
        dependsOn: a.dependsOn,
        executionSurface: a.executionSurface,
        domSteps: a.domSteps,
      });
      if (status >= 400 || body.ok === false) {
        return { error: `raid_submit_contract refused: ${body.error || `HTTP ${status}`}` };
      }
      return body;
    } catch (e) {
      return { error: `raid_submit_contract failed: ${e.message}` };
    }
  },
};
