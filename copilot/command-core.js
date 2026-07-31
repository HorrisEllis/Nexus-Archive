'use strict';
/**
 * copilot/command-core.js — the ONE co-pilot command path
 * UUID: nexus-copilot-command-core-v1-0000-2026-0730-001
 * Version: 1.0.0
 *
 * §2026-07-30 (James: "make it use cli.js anywhere co-pilot can be accessed").
 * Every co-pilot entry point reinvented dispatch — cli.js POSTed to Guardian
 * /command over http; the tv-shell floating menu went a different way through
 * Bridge :9999 (and broke); ui/agents/* consoles had their own paths. That is
 * N implementations of one command grammar — the exact §10.3 problem. This is
 * the single core both the CLI and the browser UIs call, so there is one place
 * a command is built, one place it is dispatched, one behaviour to fix.
 *
 * Transport is fetch (Node 18+ AND browsers), so the SAME module runs in
 * guardian/cli.js and in a tv-shell <script>. It is PURE: it builds the
 * /command body, POSTs it, and RETURNS the result. No console, no process.exit,
 * no DOM — the CLI wraps it with stdout/watch; a UI wraps it with elements.
 *
 * Command grammar (mirrors guardian/cli.js's verbs, unchanged):
 *   ask(provider, prompt)          → { command:'ask',  provider, prompt }
 *   code(provider, prompt)         → { command:'code', provider, prompt }
 *   sendFile(provider, name, text) → { command:'spec', provider, prompt, content }
 *   sendSpec(provider, text, opts) → { command:'spec', provider, specText, title } (SEAM pipeline)
 *   multi(providers[], prompt)     → one /command per provider, command:'multi'
 *   raw(rawString)                 → { raw } (free-form, server parses the verb)
 */

const DEFAULT_BASE =
  (typeof process !== 'undefined' && process.env && process.env.GUARDIAN_HTTP_PORT)
    ? `http://${process.env.GUARDIAN_HOST || '127.0.0.1'}:${process.env.GUARDIAN_HTTP_PORT}`
    : 'http://127.0.0.1:7820';

function _base(opts) {
  return (opts && opts.base) || DEFAULT_BASE;
}

/**
 * post(endpoint, body, opts) — the one dispatch. Returns the parsed JSON result
 * ({ ok, ... }). Never throws on an application error (returns { ok:false,
 * error }); throws only on a transport failure the caller must see.
 */
async function post(endpoint, body, opts = {}) {
  const url = _base(opts) + endpoint;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...(opts.timeoutMs && typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? { signal: AbortSignal.timeout(opts.timeoutMs) } : {}),
    });
  } catch (e) {
    return { ok: false, error: `transport: ${e.message} (is Guardian ${_base(opts)} running?)` };
  }
  let data;
  try { data = await res.json(); }
  catch (_) { return { ok: false, error: `Guardian returned non-JSON (HTTP ${res.status})` }; }
  if (!res.ok && data.ok === undefined) data.ok = false;
  return data;
}

async function get(endpoint, opts = {}) {
  const url = _base(opts) + endpoint;
  try {
    const res = await fetch(url, { method: 'GET' });
    return await res.json();
  } catch (e) {
    return { ok: false, error: `transport: ${e.message}` };
  }
}

// ── command builders — pure, return the /command result ──────────────────────

function ask(provider, prompt, opts = {}) {
  return post('/command', { command: 'ask', provider, prompt, source: opts.source || 'command-core' }, opts);
}

function code(provider, prompt, opts = {}) {
  return post('/command', { command: 'code', provider, prompt, source: opts.source || 'command-core' }, opts);
}

/** A file as a single content blob (not the SEAM pipeline). */
function sendFile(provider, filename, content, opts = {}) {
  const prompt = opts.prompt || `Here is the file: ${filename}`;
  return post('/command', { command: 'spec', provider, prompt, content, source: opts.source || 'command-core' }, opts);
}

/** A spec through the real SEAM chunking pipeline (specText → parseSpec + SEAMQueue). */
function sendSpec(provider, specText, opts = {}) {
  return post('/command', { command: 'spec', provider, specText, title: opts.title || 'spec', source: opts.source || 'command-core' }, opts);
}

/** Fan a prompt to multiple providers; returns [{ provider, result }]. */
async function multi(providers, prompt, opts = {}) {
  const out = [];
  for (const provider of providers) {
    const result = await post('/command', { command: 'multi', provider, prompt, source: opts.source || 'command-core' }, opts);
    out.push({ provider, result });
  }
  return out;
}

/** Free-form raw command string — the server parses the verb (what cli.js `sendCommand` sends). */
function raw(rawString, opts = {}) {
  const body = opts.content ? { raw: rawString, content: opts.content } : { raw: rawString };
  return post('/command', body, opts);
}

/** Poll a job until done. Transport-only; callers render. Returns the final job record. */
async function pollJob(jobId, opts = {}) {
  const timeoutMs = opts.timeoutMs || 120_000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const job = await get(`/jobs/${jobId}`, opts);
    if (job && (job.status === 'done' || job.status === 'error' || job.status === 'failed')) return job;
    await new Promise(r => setTimeout(r, opts.pollMs || 1000));
  }
  return { ok: false, error: 'poll timeout', jobId };
}

const api = { post, get, ask, code, sendFile, sendSpec, multi, raw, pollJob, DEFAULT_BASE, VERSION: '1.0.0' };

// Dual export: CommonJS for cli.js / Node, global for a browser <script>.
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.GuardianCommand = api;
