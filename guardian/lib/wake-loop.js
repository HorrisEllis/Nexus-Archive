'use strict';
/**
 * guardian/lib/wake-loop.js — agent-initiated "hey nexus," for jobs delivered by the mesh. 2026-09-19.
 *
 * The agent hint (wake-hint.js) tells the model it can emit a line starting "hey nexus," to ask NEXUS for real system
 * state. The userscript watches the model's output for that line and answers it back into the chat. A mesh-delivered job
 * has no userscript, so nothing would ever answer. This does it, for MESH completions only:
 *
 *   job completes (transport 'mesh') -> find a wake line in the answer -> ask copilot (:3750/api/prompt/tools, the SAME
 *   target the userscript uses: the sovereign co-pilot with the full tool loop, NOT lifeline and NOT another provider)
 *   -> create a 'wake-reply' guardian job for the same agent/account -> it goes through the normal ladder into the same
 *   deterministic tab -> whose answer may itself contain a wake (depth + 1).
 *
 * WHY MESH ONLY. On the userscript path the userscript already answers wakes; handling them here too would answer twice.
 *
 * SAFETY (each has a test):
 *  - depth cap (GUARDIAN_WAKE_MAX_DEPTH, default 3): an agent asking NEXUS which makes the agent ask again is a loop; it is
 *    refused with an event, never silently continued (compare lib/agent-chat's hop cap).
 *  - the grammar is lib/agent-chat.parseWake, byte-identical to the userscript's (one grammar, two runtimes).
 *  - the wake must START a line. Prose that merely mentions nexus, lines inside ``` fences, and > quotes are ignored:
 *    a model explaining the hint or quoting docs must not trigger a request.
 *  - one wake per completion, idempotent per jobId.
 *  - copilot failing never causes the ORIGINAL prompt to be resent; it only means the wake goes unanswered (event emitted).
 */
const http = require('http');
const { parseWake } = require('../../lib/agent-chat');

const START_RE = /^\s*(?:hey|hi|ok|okay)[,\s]+nexus[,:\s]+\S/i;

function extractWake(text) {
  if (typeof text !== 'string' || !text) return null;
  const lines = text.split('\n');
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*(```|~~~)/.test(l)) { fence = !fence; continue; }
    if (fence || /^\s*>/.test(l)) continue;
    if (!START_RE.test(l)) continue;
    const para = [l];
    for (let j = i + 1; j < lines.length && lines[j].trim() !== '' && !/^\s*(```|~~~)/.test(lines[j]); j++) para.push(lines[j]);
    const p = parseWake(para.join('\n'));
    return p.addressed ? p.ask : null;
  }
  return null;
}

function createCopilotAsk({ url = process.env.COPILOT_URL || 'http://127.0.0.1:3750', timeoutMs = parseInt(process.env.GUARDIAN_WAKE_COPILOT_TIMEOUT_MS || '600000', 10) } = {}) {
  return (request, { sessionId } = {}) => new Promise((resolve) => {
    const u = new URL('/api/prompt/tools', url);
    const body = JSON.stringify({ prompt: request, channel: 'wake', sessionId });
    const req = http.request({ hostname: u.hostname, port: u.port || 80, path: u.pathname, method: 'POST', timeout: timeoutMs,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      res.setEncoding('utf8'); let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { const j = JSON.parse(d); resolve({ ok: !!(j && (j.text || j.response)), text: j.text || j.response || '', raw: j }); } catch (e) { resolve({ ok: false, error: `bad copilot response: ${e.message}` }); } });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.code || e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'copilot timeout' }); });
    req.write(body); req.end();
  });
}

function createWakeLoop({ askCopilot, createJob, dispatchJob, getJob, bus = { emit() {} }, maxDepth = parseInt(process.env.GUARDIAN_WAKE_MAX_DEPTH || '3', 10), log = () => {} } = {}) {
  const handled = new Set();
  async function handleComplete({ jobId }) {
    if (!jobId || handled.has(jobId)) return { skipped: 'already_handled' };
    const job = getJob(jobId);
    if (!job || job.transport !== 'mesh') return { skipped: 'not_mesh' };            // the userscript path answers its own wakes
    if (job.command === 'wake') return { skipped: 'wake_job' };
    const ask = extractWake(job.responseText || job.response || '');
    if (!ask) return { skipped: 'no_wake' };
    handled.add(jobId);
    const depth = job.wakeDepth || 0;
    if (depth >= maxDepth) {
      log(`wake refused for ${jobId}: depth ${depth} >= ${maxDepth}`);
      bus.emit('guardian.wake.refused', { jobId, provider: job.provider, depth, reason: 'max_depth' });
      return { refused: 'max_depth', depth };
    }
    bus.emit('guardian.wake.detected', { jobId, provider: job.provider, agentId: job.agentId || null, depth, ask: ask.slice(0, 200) });
    const ans = await askCopilot(ask, { sessionId: `wake-${job.agentId || job.provider}`, provider: job.provider });
    if (!ans || !ans.ok || !ans.text) {
      bus.emit('guardian.wake.failed', { jobId, provider: job.provider, error: (ans && ans.error) || 'empty answer' });
      return { failed: (ans && ans.error) || 'empty answer' };
    }
    const reply = createJob({ command: 'wake-reply', provider: job.provider, prompt: ans.text, source: 'copilot',
      accountId: job.accountId || null, agentId: job.agentId || null, wakeDepth: depth + 1 });
    dispatchJob(reply);
    bus.emit('guardian.wake.replied', { jobId, replyJobId: reply.id, provider: job.provider, depth: depth + 1 });
    return { replied: reply.id, depth: depth + 1 };
  }
  return { handleComplete, extractWake, _handled: handled };
}
module.exports = { createWakeLoop, createCopilotAsk, extractWake };
