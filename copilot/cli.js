#!/usr/bin/env node
'use strict';
/**
 * copilot/cli.js — the co-pilot command-line interface
 * UUID: nexus-copilot-cli-v1-0000-2026-0730-001
 * Version: 1.0.0
 *
 * §2026-07-30 (James: "need a co-pilot cli.js"). Co-pilot OWNS the command
 * surface, so its CLI lives here, in the copilot module — not borrowed from
 * guardian. This is the terminal entry point: it wraps copilot/command-core.js
 * (the ONE command path every co-pilot surface shares — this CLI, the tv-shell
 * floating menu, ui/agents/*, and guardian/cli.js all import that same core)
 * with stdin/stdout/argv. The core builds and dispatches; the CLI renders.
 *
 * Usage:
 *   copilot ask <provider> <prompt...>        one-shot ask
 *   copilot code <provider> <prompt...>       code-oriented ask
 *   copilot multi <p1,p2,...> <prompt...>     fan out to several providers
 *   copilot file <provider> <path> [prompt]   send a file as content
 *   copilot spec <provider> <path> [title]    send a spec through the SEAM pipeline
 *   copilot raw <string...>                    free-form; server parses the verb
 *   echo "prompt" | copilot ask <provider>     stdin piping
 *
 * Env: GUARDIAN_HOST, GUARDIAN_HTTP_PORT (default 127.0.0.1:7820).
 */

const fs   = require('fs');
const core = require('./command-core');

const HOST = process.env.GUARDIAN_HOST || '127.0.0.1';
const PORT = process.env.GUARDIAN_HTTP_PORT || 7820;
const BASE = `http://${HOST}:${PORT}`;
const OPTS = { base: BASE, source: 'copilot-cli' };

function out(x) { process.stdout.write(typeof x === 'string' ? x : JSON.stringify(x, null, 2)); process.stdout.write('\n'); }
function die(msg, code = 1) { process.stderr.write(`copilot: ${msg}\n`); process.exit(code); }

function renderResult(r) {
  if (!r) return die('no response');
  if (r.ok === false) return die(r.error || 'command failed');
  const text = r.text || r.response || r.result?.response || r.result || r;
  out(typeof text === 'string' ? text : text);
  if (r.jobId) process.stderr.write(`  job: ${r.jobId}\n`);
  if (r.modelUsed) process.stderr.write(`  via: ${r.modelUsed}\n`);
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}

async function main() {
  const [verb, ...rest] = process.argv.slice(2);
  if (!verb || verb === '--help' || verb === '-h') {
    out(`copilot — the co-pilot CLI (one command path, shared with the UIs)

  copilot ask   <provider> <prompt...>
  copilot code  <provider> <prompt...>
  copilot multi <p1,p2,...> <prompt...>
  copilot file  <provider> <path> [prompt]
  copilot spec  <provider> <path> [title]
  copilot raw   <string...>

  Guardian: ${BASE}   (GUARDIAN_HOST / GUARDIAN_HTTP_PORT)`);
    return;
  }

  const piped = await readStdin();

  switch (verb) {
    case 'ask': case 'code': {
      const provider = rest.shift();
      if (!provider) return die(`${verb} needs a provider`);
      const prompt = (rest.join(' ') || piped).trim();
      if (!prompt) return die(`${verb} needs a prompt (arg or stdin)`);
      return renderResult(await core[verb](provider, prompt, OPTS));
    }
    case 'multi': {
      const providers = (rest.shift() || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!providers.length) return die('multi needs a comma-separated provider list');
      const prompt = (rest.join(' ') || piped).trim();
      if (!prompt) return die('multi needs a prompt');
      const results = await core.multi(providers, prompt, OPTS);
      for (const { provider, result } of results) {
        process.stdout.write(`\n─── ${provider} ───\n`);
        renderResult(result);
      }
      return;
    }
    case 'file': {
      const provider = rest.shift(), path = rest.shift();
      if (!provider || !path) return die('file needs <provider> <path>');
      if (!fs.existsSync(path)) return die(`no such file: ${path}`);
      const content = fs.readFileSync(path, 'utf8');
      return renderResult(await core.sendFile(provider, path, content, { ...OPTS, prompt: rest.join(' ') || undefined }));
    }
    case 'spec': {
      const provider = rest.shift(), path = rest.shift();
      if (!provider || !path) return die('spec needs <provider> <path>');
      if (!fs.existsSync(path)) return die(`no such file: ${path}`);
      const specText = fs.readFileSync(path, 'utf8');
      return renderResult(await core.sendSpec(provider, specText, { ...OPTS, title: rest.join(' ') || 'spec' }));
    }
    case 'raw': {
      const raw = (rest.join(' ') || piped).trim();
      if (!raw) return die('raw needs a command string');
      return renderResult(await core.raw(raw, OPTS));
    }
    default:
      return die(`unknown command: ${verb} (try --help)`);
  }
}

if (require.main === module) {
  main().catch(e => die(e.message));
}

module.exports = { main };
