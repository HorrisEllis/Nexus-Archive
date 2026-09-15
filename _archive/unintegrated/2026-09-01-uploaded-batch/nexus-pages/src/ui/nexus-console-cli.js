/* NEXUS — nexus-console-cli.js
 * Console CLI command system · ErosmancerOS deep integration · P2P chat panel
 * Wires into existing console-input / consoleSubmit infrastructure.
 *
 * Features:
 *   / prefix          → bridge CLI execution  (POST /cli/exec)
 *   /npm              → npm via bridge         (POST /cli/npm)
 *   /git              → git via bridge         (POST /cli/git)
 *   /docker           → docker via bridge      (POST /cli/docker)
 *   /python           → python via bridge      (POST /cli/python)
 *   /ssh              → SSH via bridge         (POST /cli/ssh)
 *   !eros <cmd>       → ErosmancerOS execute   (POST /eros/execute)
 *   !tabs             → list CDP tabs          (GET  /eros/tabs)
 *   !navigate <url>   → navigate tab           (POST /eros/navigate)
 *   !eval <js>        → evaluate JS in tab     (POST /eros/evaluate)
 *   !hostile          → threat state           (GET  /eros/hostile/state)
 *   !probe            → probe active tab       (POST /eros/hostile/probe)
 *   !nodes            → node registry dump     (GET  /eros/nodes)
 *   !replay           → list replay frames     (GET  /eros/replay/frames)
 *   /copilot <msg>    → route to copilot AI    (POST /ai/chat provider:copilot)
 *   /chat             → toggle P2P chat panel
 *   /help or ?        → show command reference
 *   /enable-cli       → enable bridge CLI exec
 *
 * Plugin detection badge:
 *   Updates dchk-plugin and bc-heartbeat every heartbeat tick.
 *
 * Chat panel:
 *   Full nexus-chat P2P module embedded as a slide-in panel
 *   beside the console output.
 */

(function () {
'use strict';

// ── Constants ──────────────────────────────────────────────────────────────────
const MODULE_VERSION = '1.0.0';
const MODULE_UUID    = 'ncli-0001-0000-000000000001';

// ── Bridge URL helper (reads live BRIDGE object or falls back) ─────────────────
function bridgeUrl() {
  if (typeof BRIDGE !== 'undefined' && BRIDGE.url) return BRIDGE.url;
  try { return localStorage.getItem('nchat_bridge') || 'http://127.0.0.1:3747'; } catch { return 'http://127.0.0.1:3747'; }
}

function bridgeHdrs() {
  const h = { 'Content-Type': 'application/json' };
  if (typeof val === 'function') { const k = val('bridge-api-key'); if (k) h['Authorization'] = 'Bearer ' + k; }
  return h;
}

async function bridgePost(path, body) {
  const r = await fetch(bridgeUrl() + path, { method: 'POST', headers: bridgeHdrs(), body: JSON.stringify(body) });
  return r.json();
}

async function bridgeGet(path) {
  const r = await fetch(bridgeUrl() + path, { headers: bridgeHdrs() });
  return r.json();
}

// ── Console output helpers ─────────────────────────────────────────────────────
function cOut(text, role, color) {
  const out = document.getElementById('console-output');
  if (!out) return;
  const div = document.createElement('div');
  div.className = 'msg';
  div.dataset.role = role || 'cli';
  const c = color || (role === 'error' ? 'var(--r)' : role === 'cli' ? 'var(--g)' : role === 'eros' ? 'var(--m)' : 'var(--c)');
  div.innerHTML = `<div class="msg-role" style="color:${c}">${esc(role ? role.toUpperCase() : 'CLI')}</div><div class="msg-ts">${ts()}</div><div class="msg-body" style="white-space:pre-wrap;font-family:var(--mono);font-size:10px">${esc(String(text))}</div>`;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function cJson(obj, role, color) {
  cOut(JSON.stringify(obj, null, 2), role || 'result', color);
}

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function ts() { return new Date().toTimeString().slice(0, 8); }

// ── CLI command definitions ────────────────────────────────────────────────────
const CLI_COMMANDS = [
  // Bridge CLI
  { prefix: '/exec ',      label: 'EXEC',      color: 'var(--g)', desc: 'Run shell command via bridge',         example: '/exec ls -la' },
  { prefix: '/npm ',       label: 'NPM',       color: 'var(--g)', desc: 'npm command via bridge',               example: '/npm install' },
  { prefix: '/git ',       label: 'GIT',       color: 'var(--g)', desc: 'git operation via bridge',             example: '/git status' },
  { prefix: '/git',        label: 'GIT',       color: 'var(--g)', desc: 'git status (no args)',                 example: '/git' },
  { prefix: '/docker ',    label: 'DOCKER',    color: 'var(--c)', desc: 'docker command via bridge',            example: '/docker ps' },
  { prefix: '/python ',    label: 'PYTHON',    color: 'var(--c)', desc: 'Run python script via bridge',         example: '/python script.py' },
  { prefix: '/ssh ',       label: 'SSH',       color: 'var(--c)', desc: 'SSH command via bridge',               example: '/ssh user@host cmd' },
  { prefix: '/apt ',       label: 'APT',       color: 'var(--y)', desc: 'apt package management (Linux)',       example: '/apt install curl' },
  { prefix: '/php ',       label: 'PHP',       color: 'var(--m)', desc: 'Run PHP script via bridge',            example: '/php script.php' },
  { prefix: '/enable-cli', label: 'ENABLE-CLI',color: 'var(--y)', desc: 'Enable CLI execution in bridge',       example: '/enable-cli' },
  // ErosmancerOS
  { prefix: '!eros ',      label: 'EROS',      color: 'var(--m)', desc: 'ErosmancerOS intent execute',          example: '!eros click #submit' },
  { prefix: '!tabs',       label: 'TABS',      color: 'var(--m)', desc: 'List open CDP tabs',                   example: '!tabs' },
  { prefix: '!navigate ',  label: 'NAV',       color: 'var(--m)', desc: 'Navigate active tab to URL',           example: '!navigate https://example.com' },
  { prefix: '!eval ',      label: 'EVAL',      color: 'var(--m)', desc: 'Evaluate JS in active CDP tab',        example: '!eval document.title' },
  { prefix: '!hostile',    label: 'HOSTILE',   color: 'var(--r)', desc: 'ErosmancerOS hostile threat state',    example: '!hostile' },
  { prefix: '!probe',      label: 'PROBE',     color: 'var(--r)', desc: 'Probe active tab for threats',         example: '!probe' },
  { prefix: '!nodes',      label: 'NODES',     color: 'var(--m)', desc: 'Node registry dump',                   example: '!nodes' },
  { prefix: '!replay',     label: 'REPLAY',    color: 'var(--m)', desc: 'List Eros replay frames',              example: '!replay' },
  { prefix: '!replay ',    label: 'REPLAY-ID', color: 'var(--m)', desc: 'Replay a frame by ID',                 example: '!replay frame-uuid' },
  // AI routing
  { prefix: '/copilot ',   label: 'COPILOT',   color: 'var(--c)', desc: 'Send to Microsoft Copilot via bridge', example: '/copilot Explain async/await' },
  { prefix: '/ai ',        label: 'AI',        color: 'var(--g)', desc: 'Send to AI with provider override',    example: '/ai provider:ollama What is 2+2' },
  // Bridge extension
  { prefix: '/bridge ',    label: 'BRIDGE',    color: 'var(--c)', desc: 'Raw bridge endpoint call',             example: '/bridge GET /health' },
  { prefix: '/config ',    label: 'CONFIG',    color: 'var(--y)', desc: 'Set bridge config key=value',          example: '/config cliEnabled=true' },
  { prefix: '/hook ',      label: 'HOOK',      color: 'var(--c)', desc: 'Test a hook by ID',                    example: '/hook bridge.health' },
  { prefix: '/sessions',   label: 'SESSIONS',  color: 'var(--c)', desc: 'Show extension sessions + plugin UUIDs',example: '/sessions' },
  { prefix: '/status',     label: 'STATUS',    color: 'var(--g)', desc: 'Full bridge + eros + plugin status',   example: '/status' },
  // P2P Chat
  { prefix: '/chat',       label: 'CHAT',      color: 'var(--c)', desc: 'Toggle P2P chat panel',                example: '/chat' },
  // Help
  { prefix: '?',           label: 'HELP',      color: 'var(--text2)', desc: 'Show this command reference',      example: '?' },
  { prefix: '/help',       label: 'HELP',      color: 'var(--text2)', desc: 'Show this command reference',      example: '/help' },
];

// ── Command autocomplete / hint system ────────────────────────────────────────
function installInputHints() {
  const input = document.getElementById('console-input');
  if (!input || input.dataset.cliHooked) return;
  input.dataset.cliHooked = '1';

  let _histIdx = -1;
  const _hist = [];

  input.addEventListener('keydown', async e => {
    const v = input.value;

    // History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (_hist.length && _histIdx < _hist.length - 1) { _histIdx++; input.value = _hist[_hist.length - 1 - _histIdx]; }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (_histIdx > 0) { _histIdx--; input.value = _hist[_hist.length - 1 - _histIdx]; }
      else { _histIdx = -1; input.value = ''; }
      return;
    }

    // Tab autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      const matches = CLI_COMMANDS.filter(c => v && c.prefix.startsWith(v) && c.prefix !== v);
      if (matches.length === 1) input.value = matches[0].prefix;
      else if (matches.length > 1) cOut(matches.map(c => c.prefix.trim() + ' — ' + c.desc).join('\n'), 'hint', 'var(--text3)');
      return;
    }

    if (e.key !== 'Enter') { updateInputHint(v); return; }

    // Enter — check if it's a CLI command
    const text = v.trim();
    if (!text) return;

    // Only intercept our prefixes; let normal AI flow handle everything else
    const isCliCmd = text === '?' || text === '/help' || text === '/chat' ||
                     text === '/status' || text === '/sessions' ||
                     text.startsWith('/exec ') || text.startsWith('/npm ') ||
                     text.startsWith('/git') || text.startsWith('/docker ') ||
                     text.startsWith('/python ') || text.startsWith('/ssh ') ||
                     text.startsWith('/apt ') || text.startsWith('/php ') ||
                     text.startsWith('/copilot ') || text.startsWith('/ai ') ||
                     text.startsWith('/bridge ') || text.startsWith('/config ') ||
                     text.startsWith('/hook ') || text === '/enable-cli' ||
                     text.startsWith('!');

    if (!isCliCmd) { updateInputHint(''); return; } // let normal submit handle it

    e.preventDefault();
    e.stopImmediatePropagation();
    input.value = '';
    updateInputHint('');
    _hist.push(text);
    _histIdx = -1;
    await dispatchCliCommand(text);
  });

  input.addEventListener('input', () => updateInputHint(input.value));
}

function updateInputHint(v) {
  const hint = document.getElementById('input-hint');
  if (!hint) return;
  if (!v) { hint.textContent = 'Command or question · / for CLI · ! for Eros · ? for help · ↑↓ history · Tab autocomplete'; return; }
  const match = CLI_COMMANDS.find(c => v.startsWith(c.prefix.trimEnd()) || c.prefix.startsWith(v));
  if (match) hint.textContent = match.label + ' — ' + match.desc + '   e.g. ' + match.example;
  else hint.textContent = 'Enter to send to AI · / for CLI commands · ! for ErosmancerOS';
}

// ── Command dispatcher ─────────────────────────────────────────────────────────
async function dispatchCliCommand(text) {
  try {
    // Help
    if (text === '?' || text === '/help') { showHelp(); return; }

    // Status
    if (text === '/status') { await showStatus(); return; }

    // Sessions / plugin UUID list
    if (text === '/sessions') { await showSessions(); return; }

    // Chat panel toggle
    if (text === '/chat') { toggleChatPanel(); return; }

    // Enable CLI
    if (text === '/enable-cli') {
      const r = await bridgePost('/config', { cliEnabled: true });
      cOut(r.ok ? '✓ CLI execution enabled' : ('Error: ' + (r.error||'failed')), r.ok ? 'cli' : 'error');
      return;
    }

    // /exec — shell command
    if (text.startsWith('/exec ')) {
      const cmd = text.slice(6).trim();
      cOut('$ ' + cmd, 'cli', 'var(--g)');
      const r = await bridgePost('/cli/exec', { command: cmd });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      if (!r.ok)    cOut('Exit code: ' + r.code, 'error', 'var(--r)');
      return;
    }

    // /npm
    if (text.startsWith('/npm ')) {
      const args  = text.slice(5).trim().split(/\s+/);
      const cmd   = args[0];
      const flags = args.slice(1);
      cOut('npm ' + args.join(' '), 'cli', 'var(--g)');
      const r = await bridgePost('/cli/npm', { command: cmd, flags });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      if (!r.ok)    cOut('npm failed — exit ' + r.code, 'error', 'var(--r)');
      return;
    }

    // /git
    if (text.startsWith('/git')) {
      const rest  = text.slice(4).trim();
      const parts = rest.split(/\s+/);
      const cmd   = parts[0] || 'status';
      const gArgs = parts.slice(1);
      cOut('git ' + cmd + (gArgs.length ? ' ' + gArgs.join(' ') : ''), 'cli', 'var(--g)');
      const r = await bridgePost('/cli/git', { command: cmd, args: gArgs });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /docker
    if (text.startsWith('/docker ')) {
      const parts = text.slice(8).trim().split(/\s+/);
      const cmd   = parts[0];
      const dArgs = parts.slice(1);
      cOut('docker ' + parts.join(' '), 'cli', 'var(--g)');
      const r = await bridgePost('/cli/docker', { command: cmd, args: dArgs });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /python
    if (text.startsWith('/python ')) {
      const parts  = text.slice(8).trim().split(/\s+/);
      const script = parts[0];
      const pArgs  = parts.slice(1);
      cOut('python3 ' + parts.join(' '), 'cli', 'var(--g)');
      const r = await bridgePost('/cli/python', { script, args: pArgs });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /ssh
    if (text.startsWith('/ssh ')) {
      // syntax: /ssh user@host command
      const rest   = text.slice(5).trim();
      const spaceI = rest.indexOf(' ');
      const target = spaceI === -1 ? rest : rest.slice(0, spaceI);
      const cmd    = spaceI === -1 ? 'echo connected' : rest.slice(spaceI + 1);
      const [user, host] = target.includes('@') ? target.split('@') : ['root', target];
      cOut('ssh ' + target + ' ' + cmd, 'cli', 'var(--g)');
      const r = await bridgePost('/cli/ssh', { host, user, command: cmd });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /apt
    if (text.startsWith('/apt ')) {
      const parts  = text.slice(5).trim().split(/\s+/);
      const action = parts[0] || 'install';
      const pkg    = parts.slice(1).join(' ');
      cOut('apt ' + action + ' ' + pkg, 'cli', 'var(--g)');
      const r = await bridgePost('/cli/apt', { action, package: pkg });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /php
    if (text.startsWith('/php ')) {
      const parts  = text.slice(5).trim().split(/\s+/);
      const script = parts[0];
      const pArgs  = parts.slice(1);
      cOut('php ' + parts.join(' '), 'cli', 'var(--g)');
      const r = await bridgePost('/cli/php', { script, args: pArgs });
      if (r.stdout) cOut(r.stdout, 'stdout', 'var(--text2)');
      if (r.stderr) cOut(r.stderr, 'stderr', 'var(--y)');
      return;
    }

    // /copilot — route message to Microsoft Copilot via bridge
    if (text.startsWith('/copilot ')) {
      const msg = text.slice(9).trim();
      cOut('→ Routing to Copilot…', 'copilot', 'var(--c)');
      const r = await bridgePost('/ai/chat', {
        messages: [{ role: 'user', content: msg }],
        provider: 'copilot',
        intent: 'default',
      });
      const reply = r.content?.[0]?.text || r.error || '(no response)';
      cOut(reply, 'copilot', 'var(--c)');
      return;
    }

    // /ai — AI with inline provider override
    if (text.startsWith('/ai ')) {
      const rest     = text.slice(4).trim();
      const provMatch = rest.match(/^provider:(\S+)\s+/);
      const provider  = provMatch ? provMatch[1] : undefined;
      const msg       = provMatch ? rest.slice(provMatch[0].length) : rest;
      cOut('→ AI' + (provider ? ' [' + provider + ']' : '') + '…', 'ai', 'var(--g)');
      const r = await bridgePost('/ai/chat', {
        messages: [{ role: 'user', content: msg }],
        provider,
        intent: 'default',
      });
      const reply = r.content?.[0]?.text || r.error || '(no response)';
      cOut(reply, 'ai', 'var(--g)');
      return;
    }

    // /bridge — raw bridge endpoint
    if (text.startsWith('/bridge ')) {
      const rest   = text.slice(8).trim();
      const parts  = rest.split(/\s+/);
      const method = parts[0].toUpperCase();
      const path   = parts[1] || '/health';
      const body   = parts.slice(2).join(' ');
      cOut(method + ' ' + path, 'bridge', 'var(--c)');
      let r;
      if (method === 'GET') r = await bridgeGet(path);
      else r = await bridgePost(path, body ? JSON.parse(body) : {});
      cJson(r, 'result');
      return;
    }

    // /config
    if (text.startsWith('/config ')) {
      const rest = text.slice(8).trim();
      const pairs = Object.fromEntries(
        rest.split(/\s+/).map(kv => {
          const [k, ...vp] = kv.split('=');
          const v = vp.join('=');
          // Coerce type
          if (v === 'true')  return [k, true];
          if (v === 'false') return [k, false];
          if (!isNaN(v) && v !== '') return [k, Number(v)];
          return [k, v];
        })
      );
      const r = await bridgePost('/config', pairs);
      cOut(r.ok ? '✓ Config updated: ' + JSON.stringify(pairs) : 'Error: ' + (r.error || 'failed'), r.ok ? 'cli' : 'error');
      return;
    }

    // /hook
    if (text.startsWith('/hook ')) {
      const hookId = text.slice(6).trim();
      const r = await bridgePost('/hook/test', { hookId });
      cOut((r.ok ? '✓' : '✗') + ' ' + hookId + ' — ' + (r.detail || ''), r.ok ? 'cli' : 'error', r.ok ? 'var(--g)' : 'var(--r)');
      return;
    }

    // ── ErosmancerOS commands ──────────────────────────────────────────────────

    // !tabs
    if (text === '!tabs') {
      const r = await bridgeGet('/eros/tabs');
      if (r.ok === false) { cOut('ErosmancerOS offline: ' + (r.error || r.hint || 'unreachable'), 'error', 'var(--r)'); return; }
      const tabs = r.tabs || r;
      if (!tabs?.length) { cOut('No open CDP tabs', 'eros', 'var(--m)'); return; }
      cOut(tabs.map((t, i) => `[${i}] ${t.id || t.tabId || '?'} — ${t.url || t.title || '?'}`).join('\n'), 'eros', 'var(--m)');
      return;
    }

    // !navigate <url>
    if (text.startsWith('!navigate ')) {
      const url = text.slice(10).trim();
      cOut('→ Navigate: ' + url, 'eros', 'var(--m)');
      const r = await bridgePost('/eros/navigate', { url });
      cOut(r.ok ? '✓ Navigated' : 'Error: ' + (r.error || 'failed'), r.ok ? 'eros' : 'error', r.ok ? 'var(--m)' : 'var(--r)');
      return;
    }

    // !eval <expression>
    if (text.startsWith('!eval ')) {
      const expression = text.slice(6).trim();
      cOut('> ' + expression, 'eros', 'var(--m)');
      const r = await bridgePost('/eros/evaluate', { expression });
      cOut(r.result !== undefined ? String(r.result) : (r.error || 'no result'), 'result', 'var(--c)');
      return;
    }

    // !hostile
    if (text === '!hostile') {
      const r = await bridgeGet('/eros/hostile/state');
      cJson(r, 'hostile', 'var(--r)');
      return;
    }

    // !probe
    if (text === '!probe') {
      const r = await bridgePost('/eros/hostile/probe', {});
      cJson(r, 'probe', 'var(--r)');
      return;
    }

    // !nodes
    if (text === '!nodes') {
      const r = await bridgeGet('/eros/nodes');
      const nodes = r.nodes || r;
      if (Array.isArray(nodes)) {
        cOut(nodes.map(n => (n.uuid || n.id || '?') + ' · ' + (n.type || '?') + ' · ' + (n.url || '')).join('\n') || '(no nodes)', 'eros', 'var(--m)');
      } else { cJson(r, 'eros', 'var(--m)'); }
      return;
    }

    // !replay [frameId]
    if (text.startsWith('!replay')) {
      const frameId = text.slice(7).trim();
      if (frameId) {
        cOut('→ Replaying frame: ' + frameId, 'eros', 'var(--m)');
        const r = await bridgePost('/eros/replay/' + frameId, {});
        cOut(r.ok ? '✓ Replayed' : 'Error: ' + (r.error || 'failed'), r.ok ? 'eros' : 'error');
      } else {
        const r = await bridgeGet('/eros/replay/frames');
        const frames = r.frames || r;
        if (Array.isArray(frames) && frames.length) {
          cOut(frames.map(f => (f.id || '?') + ' · ' + (f.action || '?') + ' · ' + (f.ts ? new Date(f.ts).toLocaleTimeString() : '')).join('\n'), 'eros', 'var(--m)');
        } else { cOut('No replay frames', 'eros', 'var(--m)'); }
      }
      return;
    }

    // !eros <intent/action>
    if (text.startsWith('!eros ')) {
      const action = text.slice(6).trim();
      cOut('→ Eros: ' + action, 'eros', 'var(--m)');
      const r = await bridgePost('/eros/execute', { action });
      cJson(r, 'eros', 'var(--m)');
      return;
    }

    // Fallthrough — not a CLI command, shouldn't reach here
    cOut('Unknown CLI command: ' + text + '\nType ? for help', 'error', 'var(--r)');

  } catch (e) {
    cOut('Error: ' + e.message, 'error', 'var(--r)');
  }
}

// ── /status ────────────────────────────────────────────────────────────────────
async function showStatus() {
  cOut('⟳ Fetching status…', 'status', 'var(--text3)');
  const results = await Promise.allSettled([
    bridgeGet('/health'),
    bridgeGet('/eros/health'),
    bridgeGet('/extension/sessions'),
    bridgeGet('/guardian/status'),
  ]);

  const [bridgeR, erosR, sessionsR, pwR] = results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });

  const lines = [
    '─── BRIDGE ─────────────────────────────',
    bridgeR.error ? '✗ OFFLINE — ' + bridgeR.error : `✓ ONLINE  v${bridgeR.version || '?'}  uptime:${bridgeR.uptime ? Math.floor(bridgeR.uptime) + 's' : '?'}`,
    '',
    '─── EROSMANCEROS ───────────────────────',
    erosR.error ? '✗ OFFLINE — ' + erosR.error : `✓ ONLINE  state:${erosR.eros?.bridge?.state || '?'}`,
    '',
    '─── PLUGIN SESSIONS ────────────────────',
  ];

  const sessions = sessionsR.sessions || [];
  if (sessions.length) {
    sessions.forEach(s => {
      lines.push(
        `  ${s.connected ? '✓' : '✗'} session:${(s.sessionId||'').slice(0,8)}` +
        (s.pluginUUID ? `  uuid:${s.pluginUUID.slice(0,8)}…` : '') +
        (s.cdpPort    ? `  cdp:${s.cdpPort}` : '') +
        `  mode:${s.mode || '?'}`
      );
    });
  } else {
    lines.push('  (no plugin sessions — install extension + connect to bridge)');
  }

  lines.push('', '─── GUARDIAN ───────────────────────────');
  lines.push(pwR.error ? '✗ ' + pwR.error : `  mode:${pwR.mode || 'none'}  page:${pwR.pageActive ? 'active' : 'none'}`);

  cOut(lines.join('\n'), 'status', 'var(--c)');
}

// ── /sessions ─────────────────────────────────────────────────────────────────
async function showSessions() {
  const r = await bridgeGet('/extension/sessions');
  const sessions = r.sessions || [];
  if (!sessions.length) { cOut('No extension sessions connected.\nInstall the NEXUS Bridge plugin in Firefox → it will auto-register.', 'sessions', 'var(--text3)'); return; }
  const lines = ['─── EXTENSION SESSIONS ─────────────────'];
  sessions.forEach((s, i) => {
    lines.push(`[${i}] ${s.connected ? '✓ CONNECTED' : '✗ DISCONNECTED'}`);
    if (s.pluginUUID)    lines.push(`    pluginUUID : ${s.pluginUUID}`);
    if (s.hookId)        lines.push(`    hookId     : ${s.hookId}`);
    if (s.sessionId)     lines.push(`    sessionId  : ${s.sessionId}`);
    if (s.cdpPort)       lines.push(`    cdpPort    : ${s.cdpPort}`);
    if (s.mode)          lines.push(`    mode       : ${s.mode}`);
    if (s.extensionVersion) lines.push(`    ext ver    : ${s.extensionVersion}`);
    if (s.connectedAt)   lines.push(`    connected  : ${new Date(s.connectedAt).toLocaleTimeString()}`);
  });
  cOut(lines.join('\n'), 'sessions', 'var(--c)');
}

// ── /help ─────────────────────────────────────────────────────────────────────
function showHelp() {
  const groups = [
    { label: '── BRIDGE CLI ──────────────────────────────────────────────────', cmds: CLI_COMMANDS.filter(c => c.prefix.startsWith('/') && !c.prefix.startsWith('/ai') && !c.prefix.startsWith('/copilot') && !c.prefix.startsWith('/chat') && !c.prefix.startsWith('/help') && !c.prefix.startsWith('/bridge') && !c.prefix.startsWith('/config') && !c.prefix.startsWith('/hook') && !c.prefix.startsWith('/status') && !c.prefix.startsWith('/sessions')) },
    { label: '── AI ROUTING ──────────────────────────────────────────────────', cmds: CLI_COMMANDS.filter(c => c.prefix.startsWith('/ai') || c.prefix.startsWith('/copilot')) },
    { label: '── BRIDGE TOOLS ────────────────────────────────────────────────', cmds: CLI_COMMANDS.filter(c => c.prefix.startsWith('/bridge') || c.prefix.startsWith('/config') || c.prefix.startsWith('/hook') || c.prefix.startsWith('/status') || c.prefix.startsWith('/sessions') || c.prefix.startsWith('/chat')) },
    { label: '── EROSMANCEROS  (!prefix) ─────────────────────────────────────', cmds: CLI_COMMANDS.filter(c => c.prefix.startsWith('!')) },
  ];

  const lines = ['NEXUS CONSOLE CLI — Command Reference', ''];
  groups.forEach(g => {
    lines.push(g.label);
    const seen = new Set();
    g.cmds.forEach(c => {
      if (seen.has(c.label)) return; seen.add(c.label);
      lines.push(`  ${(c.prefix.trim() + '           ').slice(0, 14)}  ${c.desc}`);
      lines.push(`  ${'             '}  e.g. ${c.example}`);
    });
    lines.push('');
  });
  lines.push('↑↓  history   Tab  autocomplete   /chat  toggle P2P panel');
  cOut(lines.join('\n'), 'help', 'var(--text3)');
}

// ── Command palette panel ─────────────────────────────────────────────────────
function buildCommandPalette() {
  // Inject CLI command strip buttons below existing qcmd strip
  const strip = document.getElementById('cmd-strip');
  if (!strip || document.getElementById('cli-cmd-strip')) return;

  const cliStrip = document.createElement('div');
  cliStrip.id = 'cli-cmd-strip';
  cliStrip.style.cssText = 'display:flex;align-items:center;gap:4px;padding:4px 10px 4px;flex-wrap:wrap;border-top:1px solid var(--border);background:var(--bg1);flex-shrink:0;';

  const cliCmds = [
    { label: '/ STATUS',     cmd: '/status' },
    { label: '/ SESSIONS',   cmd: '/sessions' },
    { label: '/ ENABLE CLI', cmd: '/enable-cli' },
    { label: '! TABS',       cmd: '!tabs' },
    { label: '! HOSTILE',    cmd: '!hostile' },
    { label: '! NODES',      cmd: '!nodes' },
    { label: '/ COPILOT',    cmd: '/copilot ' },
    { label: '/ CHAT',       cmd: '/chat' },
    { label: '?  HELP',      cmd: '?' },
  ];

  const lbl = document.createElement('span');
  lbl.style.cssText = 'font-size:9px;letter-spacing:.1em;color:var(--text3);white-space:nowrap;padding-right:4px;flex-shrink:0;';
  lbl.textContent = 'CLI:';
  cliStrip.appendChild(lbl);

  cliCmds.forEach(({ label, cmd }) => {
    const btn = document.createElement('button');
    btn.className = 'qcmd';
    btn.style.cssText = 'border-color:rgba(0,255,136,.2);color:var(--g);';
    btn.textContent = label;
    btn.onclick = () => {
      const input = document.getElementById('console-input');
      if (!input) return;
      input.value = cmd;
      input.focus();
      if (!cmd.endsWith(' ')) {
        // fire immediately for complete commands
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }
    };
    cliStrip.appendChild(btn);
  });

  strip.after(cliStrip);
}

// ── P2P Chat panel ────────────────────────────────────────────────────────────
let _chatPanelBuilt = false;
let _chatPanelOpen  = false;

function toggleChatPanel() {
  if (!_chatPanelBuilt) { buildChatPanel(); _chatPanelBuilt = true; }
  _chatPanelOpen = !_chatPanelOpen;
  const panel = document.getElementById('ncli-chat-panel');
  if (panel) {
    panel.style.width    = _chatPanelOpen ? '340px' : '0';
    panel.style.opacity  = _chatPanelOpen ? '1' : '0';
    panel.style.overflow = _chatPanelOpen ? 'visible' : 'hidden';
  }
  cOut(_chatPanelOpen ? '⬡ Chat panel opened — WebRTC P2P · DTLS/SRTP encrypted' : '⬡ Chat panel closed', 'cli', 'var(--c)');
}

function buildChatPanel() {
  const consoleBody = document.getElementById('console-body');
  if (!consoleBody || document.getElementById('ncli-chat-panel')) return;

  // Make console-body flex row
  consoleBody.style.display    = 'flex';
  consoleBody.style.flexDirection = 'row';
  consoleBody.style.overflow   = 'hidden';

  // Wrap existing console-main
  const consoleMain = document.getElementById('console-main');
  if (consoleMain) consoleMain.style.flex = '1';

  const panel = document.createElement('div');
  panel.id = 'ncli-chat-panel';
  panel.style.cssText = [
    'width:0;opacity:0;overflow:hidden',
    'transition:width .25s ease,opacity .2s ease',
    'border-left:1px solid var(--border)',
    'background:var(--bg1)',
    'display:flex;flex-direction:column',
    'flex-shrink:0',
    'min-height:0',
  ].join(';');

  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
      <span style="font-family:var(--display);font-size:13px;letter-spacing:.2em;color:var(--c)">NEXUS <span style="color:var(--m)">CHAT</span></span>
      <div id="nchat-peer-dot" style="width:6px;height:6px;border-radius:50%;background:var(--text3);transition:background .3s;flex-shrink:0"></div>
      <span id="nchat-peer-lbl" style="font-size:7px;letter-spacing:.1em;color:var(--text3)">disconnected</span>
      <div style="margin-left:auto;display:flex;gap:4px">
        <button onclick="nchatShowConnect()" style="padding:2px 7px;font-family:var(--mono);font-size:7px;letter-spacing:.08em;background:transparent;border:1px solid var(--c);color:var(--c);border-radius:3px;cursor:pointer">⬡ CONNECT</button>
        <button onclick="nchatToggleAI()" id="nchat-ai-btn" style="padding:2px 7px;font-family:var(--mono);font-size:7px;letter-spacing:.08em;background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:3px;cursor:pointer">✦ AI</button>
      </div>
    </div>
    <div id="nchat-messages" style="flex:1;overflow-y:auto;padding:8px 0;display:flex;flex-direction:column;font-family:var(--mono);font-size:10px;"></div>
    <div id="nchat-connect-overlay" style="display:none;position:absolute;inset:0;background:rgba(5,8,15,.95);z-index:10;padding:16px;flex-direction:column;gap:10px;">
      <div style="font-family:var(--display);font-size:14px;letter-spacing:.2em;color:var(--c)">⬡ CONNECT</div>
      <div>
        <div style="font-size:7px;letter-spacing:.1em;color:var(--text3);margin-bottom:4px">YOUR PEER ID</div>
        <div id="nchat-my-id" onclick="nchatCopyId()" style="font-family:var(--mono);font-size:8px;color:var(--g);padding:5px 8px;background:var(--bg2);border:1px solid rgba(0,255,136,.2);border-radius:3px;cursor:pointer;word-break:break-all">Generating…</div>
      </div>
      <div>
        <div style="font-size:7px;letter-spacing:.1em;color:var(--text3);margin-bottom:4px">CONNECT TO PEER ID</div>
        <input id="nchat-peer-input" placeholder="Peer ID or room password" style="width:100%;padding:6px 8px;font-family:var(--mono);font-size:9px;background:var(--bg2);border:1px solid var(--border2);color:var(--text);border-radius:3px;outline:none"/>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="nchatHideConnect()" style="flex:1;padding:7px;font-family:var(--mono);font-size:8px;background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:3px;cursor:pointer">Cancel</button>
        <button onclick="nchatDoConnect()" style="flex:1;padding:7px;font-family:var(--mono);font-size:8px;background:rgba(0,212,255,.06);border:1px solid var(--c);color:var(--c);border-radius:3px;cursor:pointer">⬡ CONNECT</button>
      </div>
    </div>
    <div style="padding:6px 8px;border-top:1px solid var(--border);background:var(--bg1);flex-shrink:0">
      <div style="display:flex;gap:5px">
        <textarea id="nchat-input" placeholder="Message… @ai for AI mode" rows="1"
          style="flex:1;min-height:28px;max-height:80px;resize:none;padding:5px 8px;font-family:var(--body);font-size:11px;color:var(--text);background:var(--bg2);border:1px solid var(--border2);border-radius:3px;outline:none;overflow-y:auto;"
          onkeydown="nchatInputKey(event)" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px'"></textarea>
        <button onclick="nchatSend()" style="padding:0 10px;font-family:var(--mono);font-size:7px;letter-spacing:.08em;background:rgba(0,212,255,.08);border:1px solid var(--c);color:var(--c);border-radius:3px;cursor:pointer">SEND</button>
      </div>
      <div style="font-size:7px;color:var(--text3);margin-top:3px">Enter · @ai for AI · Shift+Enter newline</div>
    </div>
  `;

  consoleBody.appendChild(panel);
  initChatEngine(panel);
}

// ── Minimal P2P chat engine ───────────────────────────────────────────────────
function initChatEngine(panel) {
  // Dynamically load PeerJS if not present
  if (typeof Peer === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    s.onload = () => _initPeer();
    document.head.appendChild(s);
  } else {
    _initPeer();
  }
}

let _ncPeer = null, _ncPeers = new Map(), _ncAiMode = false, _ncConvHist = [];
const _ncMe = { name: localStorage.getItem('nchat_name') || 'Me', peerId: null };

function _initPeer() {
  _ncPeer = new Peer(undefined, {
    host: '0.peerjs.com', port: 443, secure: true, path: '/',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    ],
  });
  _ncPeer.on('open', id => {
    _ncMe.peerId = id;
    const myIdEl = document.getElementById('nchat-my-id');
    if (myIdEl) myIdEl.textContent = id;
    _ncSetStatus('online', 'ready · ' + id.slice(-8));
    _ncMsg('sys', 'NEXUS CHAT ready · ' + id);
  });
  _ncPeer.on('connection', conn => _ncHandleConn(conn));
  _ncPeer.on('error', e => _ncSetStatus('warn', 'error'));
  _ncPeer.on('disconnected', () => { _ncSetStatus('', 'disconnected'); setTimeout(() => _ncPeer?.reconnect(), 3000); });
}

function _ncHandleConn(conn) {
  conn.on('open', () => {
    const name = conn.metadata?.name || conn.peer.slice(-8);
    _ncPeers.set(conn.peer, { conn, name });
    _ncMsg('sys', name + ' joined');
    conn.send({ type: 'meta', name: _ncMe.name });
    _ncSetStatus('online', _ncPeers.size + ' peer(s) connected');
  });
  conn.on('data', d => {
    if (!d || typeof d !== 'object') return;
    const p = _ncPeers.get(conn.peer);
    if (d.type === 'meta') { if (p) p.name = d.name; return; }
    if (d.type === 'message') {
      const sender = p?.name || conn.peer.slice(-8);
      _ncMsg('peer', d.content, sender);
      if (_ncAiMode && d.content) _ncRouteAI(d.content, sender);
    }
  });
  conn.on('close', () => {
    const p = _ncPeers.get(conn.peer);
    _ncMsg('sys', (p?.name || conn.peer.slice(-8)) + ' left');
    _ncPeers.delete(conn.peer);
    _ncSetStatus('online', _ncPeers.size + ' peer(s)');
  });
}

window.nchatShowConnect = function () {
  const ov = document.getElementById('nchat-connect-overlay');
  if (ov) { ov.style.display = 'flex'; ov.parentElement.style.position = 'relative'; }
};
window.nchatHideConnect = function () {
  const ov = document.getElementById('nchat-connect-overlay'); if (ov) ov.style.display = 'none';
};
window.nchatDoConnect = function () {
  const input = document.getElementById('nchat-peer-input');
  if (!input || !input.value.trim() || !_ncPeer) return;
  let targetId = input.value.trim();
  if (!targetId.startsWith('NEXUS-') && !targetId.includes('-')) {
    let h = 0x811c9dc5;
    for (let i = 0; i < targetId.length; i++) { h ^= targetId.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    const hex = h.toString(16).padStart(8, '0');
    targetId = `NEXUS-EP-${hex.slice(0,6).toUpperCase()}-${hex.slice(6,8).toUpperCase()}`;
  }
  const conn = _ncPeer.connect(targetId, { metadata: { name: _ncMe.name }, reliable: true });
  _ncHandleConn(conn);
  nchatHideConnect();
  _ncMsg('sys', 'Connecting to ' + targetId.slice(-12) + '…');
};
window.nchatCopyId = function () {
  if (_ncMe.peerId) navigator.clipboard.writeText(_ncMe.peerId).then(() => {
    if (typeof toast === 'function') toast('Peer ID copied', 'ok');
  }).catch(() => {});
};
window.nchatToggleAI = function () {
  _ncAiMode = !_ncAiMode;
  const btn = document.getElementById('nchat-ai-btn');
  if (btn) { btn.style.color = _ncAiMode ? 'var(--g)' : 'var(--text3)'; btn.style.borderColor = _ncAiMode ? 'var(--g)' : 'var(--border2)'; }
  _ncMsg('sys', 'AI mode ' + (_ncAiMode ? 'ON — responding to @ai messages' : 'OFF'));
};
window.nchatInputKey = function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nchatSend(); }
};
window.nchatSend = function () {
  const inp = document.getElementById('nchat-input');
  const text = inp?.value?.trim();
  if (!text) return;
  inp.value = ''; inp.style.height = '';
  _ncMsg('self', text);
  _ncPeers.forEach(({ conn }) => { if (conn.open) try { conn.send({ type: 'message', content: text }); } catch {} });
  if (typeof BRIDGE !== 'undefined' && BRIDGE.connected && typeof bridgePost === 'function' && text.startsWith('@ai')) {
    _ncRouteAI(text.replace(/^@ai\s*/i, ''), _ncMe.name);
  } else if (_ncAiMode && _ncPeers.size === 0) {
    _ncRouteAI(text, _ncMe.name);
  }
};

async function _ncRouteAI(text, from) {
  _ncConvHist.push({ role: 'user', content: from + ': ' + text });
  const msgs = [
    { role: 'system', content: 'You are NEXUS, an AI assistant in a P2P chat. Be concise.' },
    ..._ncConvHist.slice(-12),
  ];
  _ncMsg('ai', '…', 'NEXUS');
  try {
    const r = await bridgePost('/ai/chat', { messages: msgs, intent: 'default' });
    const reply = r.content?.[0]?.text || '(no response)';
    // Replace typing indicator
    const feed = document.getElementById('nchat-messages');
    const last = feed?.querySelector('.nchat-ai-typing');
    if (last) last.remove();
    _ncMsg('ai', reply, 'NEXUS');
    _ncConvHist.push({ role: 'assistant', content: reply });
    _ncPeers.forEach(({ conn }) => { if (conn.open) try { conn.send({ type: 'message', content: '[NEXUS] ' + reply }); } catch {} });
  } catch (e) {
    const feed = document.getElementById('nchat-messages');
    const last = feed?.querySelector('.nchat-ai-typing');
    if (last) last.remove();
    _ncMsg('sys', 'AI error: ' + e.message);
  }
}

function _ncMsg(role, text, sender) {
  const feed = document.getElementById('nchat-messages');
  if (!feed) return;
  const roleColors = { self: 'var(--c)', peer: 'var(--m)', ai: 'var(--g)', sys: 'var(--text3)' };
  const div = document.createElement('div');
  div.style.cssText = 'padding:4px 10px;display:flex;flex-direction:column;gap:2px;';
  if (role === 'sys') {
    div.innerHTML = `<span style="font-size:7px;color:var(--text3);text-align:center;padding:2px 0">${esc(text)}</span>`;
  } else {
    div.innerHTML = `
      <div style="display:flex;gap:6px;align-items:baseline">
        <span style="font-size:8px;font-weight:600;color:${roleColors[role]||'var(--text2)'}">${esc(sender || role.toUpperCase())}</span>
        <span style="font-size:7px;color:var(--text3)">${new Date().toLocaleTimeString('en-GB',{hour12:false})}</span>
      </div>
      <div style="font-family:var(--body);font-size:11px;line-height:1.5;color:var(--text);white-space:pre-wrap;word-break:break-word">${esc(text)}</div>
    `;
    if (role === 'ai' && text === '…') div.classList.add('nchat-ai-typing');
  }
  feed.appendChild(div);
  div.scrollIntoView({ block: 'end' });
}

function _ncSetStatus(cls, text) {
  const dot = document.getElementById('nchat-peer-dot');
  const lbl = document.getElementById('nchat-peer-lbl');
  if (dot) { dot.style.background = cls === 'online' ? 'var(--g)' : cls === 'warn' ? 'var(--y)' : 'var(--text3)'; dot.style.boxShadow = cls === 'online' ? '0 0 5px var(--g)' : 'none'; }
  if (lbl) lbl.textContent = text;
}

// ── Plugin detection poll ─────────────────────────────────────────────────────
// Polls /extension/sessions every 8s to keep dchk-plugin accurate
// even when SSE / BroadcastChannel aren't available.
let _pluginPollTimer = null;

function startPluginPoll() {
  if (_pluginPollTimer) return;
  _pluginPollTimer = setInterval(async () => {
    try {
      const r = await bridgeGet('/extension/sessions');
      const sessions = r.sessions || [];
      const connected = sessions.filter(s => s.connected);
      const anyConn   = connected.length > 0;
      const firstUUID = connected[0]?.pluginUUID || null;

      // Update dchk-plugin
      const diagEl = document.getElementById('dchk-plugin');
      if (diagEl) {
        diagEl.textContent = anyConn
          ? '✓ ' + connected.length + ' session(s)' + (firstUUID ? ' · ' + firstUUID.slice(0,8) + '…' : '')
          : '✗ NOT CONNECTED';
        diagEl.style.color = anyConn ? 'var(--g)' : 'var(--r)';
      }

      // Update bc-heartbeat badge with UUID
      const hbEl = document.getElementById('bc-heartbeat');
      if (hbEl && firstUUID && connected[0]?.lastHeartbeat) {
        const ago = Math.round((Date.now() - connected[0].lastHeartbeat) / 1000);
        hbEl.textContent = ago + 's ago · ' + firstUUID.slice(0, 8) + '…';
        hbEl.style.color = ago < 15 ? 'var(--g)' : ago < 35 ? 'var(--y)' : 'var(--r)';
      }

      // Propagate into NexusBridgeSync STATE if available
      if (window.NexusBridgeSync?.state && anyConn) {
        window.NexusBridgeSync.state.pluginConnected = true;
        window.NexusBridgeSync.state.pluginUUID      = firstUUID;
        window.NexusBridgeSync.state.pluginMode      = connected[0]?.mode || null;
        window.NexusBridgeSync.state.cdpPort         = connected[0]?.cdpPort || null;
      }

    } catch { /* bridge offline, ignore */ }
  }, 8000);
}

// ── Boot ───────────────────────────────────────────────────────────────────────
function boot() {
  installInputHints();
  buildCommandPalette();
  startPluginPoll();

  // Kick an immediate session poll on load
  setTimeout(async () => {
    try {
      const r = await bridgeGet('/extension/sessions');
      const sessions = (r.sessions || []).filter(s => s.connected);
      if (sessions.length) {
        cOut(
          '⬡ Plugin detected — ' + sessions.length + ' session(s) connected\n' +
          sessions.map(s =>
            '  uuid:' + (s.pluginUUID || '(none)') +
            '  hookId:' + (s.hookId || '?') +
            (s.cdpPort ? '  cdp:' + s.cdpPort : '')
          ).join('\n'),
          'cli', 'var(--g)'
        );
      }
    } catch { /* bridge not up yet */ }
  }, 2000);

  console.log('[NEXUS CLI] v' + MODULE_VERSION + ' · uuid:' + MODULE_UUID + ' · booted');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  setTimeout(boot, 100);
}

})();
