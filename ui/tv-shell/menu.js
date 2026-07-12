/**
 * ui/tv-shell/menu.js
 * comp_id: nexus.ui.tv-shell.menu
 * uuid: nexus-tv-shell-menu-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/contract-queue.spec
 *
 * Sovereign floating menu button module.
 * Zero coupling to the shell. Zero inline logic.
 * Loads as <script src="/ui/tv-shell/menu.js">.
 *
 * Public API (window.NexusMenu):
 *   NexusMenu.toggle()      — open/close the menu
 *   NexusMenu.open()        — open
 *   NexusMenu.close()       — close
 *   NexusMenu.diagnose()    — trigger system diagnosis via co-pilot
 *   NexusMenu.rewind()      — open rewind overlay
 *   NexusMenu.inspect()     — open inspect overlay
 *
 * The CLI inside the menu routes through co-pilot (:3750/api/prompt).
 * Co-pilot uses RAID, INTUITION, ANALYSIS — the menu doesn't need to know.
 */
'use strict';

(function() {

// ── Config ────────────────────────────────────────────────────────────────────
const COPILOT_URL = 'http://127.0.0.1:3750';
const ORCH_URL    = 'http://127.0.0.1:9000';
const SESSION_ID  = 'tv-shell-menu-' + Date.now();

// ── State ─────────────────────────────────────────────────────────────────────
let _open       = false;
let _diagActive = false;

// ── Fetch helper ──────────────────────────────────────────────────────────────
async function _post(url, body) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Id': SESSION_ID },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    return r.ok ? r.json() : { ok: false, error: `HTTP ${r.status}` };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ── Co-pilot prompt via sovereign co-pilot module ─────────────────────────────
async function _copilotPrompt(prompt, outputEl) {
  if (outputEl) outputEl.textContent = '…';
  const result = await _post(`${COPILOT_URL}/api/prompt`, {
    prompt, sessionId: SESSION_ID, channel: 'menu', channelName: 'Menu'
  });
  if (outputEl) {
    outputEl.textContent = result?.text || result?.error || 'No response';
  }
  return result;
}

// ── Diagnosis via co-pilot ────────────────────────────────────────────────────
async function diagnose() {
  const out = document.getElementById('menu-diag-out');
  if (!out) return;

  _diagActive = true;
  out.style.display = 'block';
  out.textContent = 'Diagnosing…';

  // Ask co-pilot to diagnose — it uses INTUITION + ANALYSIS
  const result = await _copilotPrompt('/diagnose', out);

  // Also pull live system health
  try {
    const h = await fetch(`${ORCH_URL}/health`).then(r => r.json());
    const online = Object.entries(h.systems || {})
      .filter(([,v]) => v.online)
      .map(([k]) => k).join(', ');
    const offline = Object.entries(h.systems || {})
      .filter(([,v]) => !v.online)
      .map(([k]) => k).join(', ');
    out.textContent = (result?.text || '') + `\n\n● online: ${online || 'none'}\n○ offline: ${offline || 'none'}`;
  } catch(_) {}

  _diagActive = false;
}

// ── Menu DOM ──────────────────────────────────────────────────────────────────
function _buildMenu() {
  // Don't rebuild if already exists
  if (document.getElementById('nexus-menu-root')) return;

  const style = document.createElement('style');
  style.textContent = `
    /* comp_id: nexus.ui.tv-shell.menu / ui/tv-shell/menu.js */
    #nexus-menu-root {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }
    #nexus-menu-panel {
      background: rgba(8,8,20,.96);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 16px;
      padding: 16px 20px;
      min-width: 320px;
      max-width: 520px;
      box-shadow: 0 8px 48px rgba(0,0,0,.8);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity .15s, transform .15s;
    }
    #nexus-menu-panel.open {
      opacity: 1;
      transform: translateY(0);
    }
    #nexus-menu-btn {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(8,8,20,.9);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 24px;
      color: rgba(255,255,255,.7);
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      cursor: pointer;
      transition: all .15s;
    }
    #nexus-menu-btn:hover { border-color: rgba(255,255,255,.35); color:#fff; }
    #nexus-menu-btn.open  { border-color: var(--ac, #00e5ff); color: var(--ac, #00e5ff); }
    .menu-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .menu-btn {
      flex: 1;
      padding: 8px 12px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 8px;
      color: rgba(255,255,255,.6);
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      cursor: pointer;
      transition: all .12s;
      text-align: center;
    }
    .menu-btn:hover { background: rgba(255,255,255,.09); color:#fff; border-color: rgba(255,255,255,.2); }
    .menu-btn.accent { border-color: rgba(0,229,255,.3); color: #00e5ff; }
    .menu-btn.accent:hover { background: rgba(0,229,255,.08); }
    .menu-btn.warn { border-color: rgba(204,68,255,.3); color: #cc44ff; }
    .menu-cli-row {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    #menu-cli-input {
      flex: 1;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px;
      padding: 8px 10px;
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      outline: none;
    }
    #menu-cli-input:focus { border-color: var(--ac, #00e5ff); }
    #menu-cli-send {
      padding: 8px 14px;
      background: rgba(0,229,255,.1);
      border: 1px solid rgba(0,229,255,.3);
      border-radius: 8px;
      color: #00e5ff;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      cursor: pointer;
    }
    #menu-cli-out {
      margin-top: 8px;
      padding: 8px 10px;
      background: rgba(0,0,0,.3);
      border-radius: 6px;
      color: rgba(255,255,255,.6);
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      line-height: 1.5;
      white-space: pre-wrap;
      max-height: 120px;
      overflow-y: auto;
      display: none;
    }
    #menu-diag-out {
      margin-top: 8px;
      padding: 8px 10px;
      background: rgba(0,0,0,.3);
      border-radius: 6px;
      color: rgba(0,229,255,.7);
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      line-height: 1.5;
      white-space: pre-wrap;
      max-height: 160px;
      overflow-y: auto;
      display: none;
    }
    .menu-section-label {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      letter-spacing: .1em;
      color: rgba(255,255,255,.3);
      margin-bottom: 6px;
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'nexus-menu-root';
  root.innerHTML = `
    <div id="nexus-menu-panel">
      <div class="menu-section-label">NAVIGATION</div>
      <div class="menu-row" id="menu-nav-row"></div>

      <div class="menu-section-label">SYSTEM</div>
      <div class="menu-row">
        <button class="menu-btn accent" onclick="NexusMenu.diagnose()">⊕ DIAGNOSE</button>
        <button class="menu-btn" onclick="NexusMenu.rewind()">⟲ REWIND</button>
        <button class="menu-btn warn" onclick="NexusMenu.inspect()">◈ INSPECT</button>
      </div>
      <div id="menu-diag-out"></div>

      <div class="menu-section-label">CO-PILOT CLI</div>
      <div class="menu-cli-row">
        <input id="menu-cli-input" placeholder="Ask NEXUS anything… /gaps /status /health" />
        <button id="menu-cli-send" onclick="NexusMenu.sendCLI()">→</button>
      </div>
      <div id="menu-cli-out"></div>
    </div>

    <button id="nexus-menu-btn" onclick="NexusMenu.toggle()">
      <span id="nexus-menu-icon">⬡</span>
      <span id="nexus-menu-label">NEXUS</span>
    </button>
  `;
  document.body.appendChild(root);

  // Wire CLI enter key
  document.getElementById('menu-cli-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); NexusMenu.sendCLI(); }
  });

  // Build nav buttons from CH_META if available
  _buildNavButtons();
}

function _buildNavButtons() {
  const row = document.getElementById('menu-nav-row');
  if (!row) return;
  // Read from shell's CH_META if available
  const channels = window.CH_META || [];
  const show = channels.slice(0, 6); // first 6
  row.innerHTML = show.map(ch =>
    `<button class="menu-btn" onclick="NexusMenu.go('${ch.id}')">${ch.name}</button>`
  ).join('');
}

// ── CLI send ──────────────────────────────────────────────────────────────────
async function sendCLI() {
  const input = document.getElementById('menu-cli-input');
  const out   = document.getElementById('menu-cli-out');
  if (!input || !out) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = '';
  out.style.display = 'block';
  out.textContent = '…';

  await _copilotPrompt(prompt, out);
}

// ── Navigation ────────────────────────────────────────────────────────────────
function go(channelId) {
  if (typeof tuneById === 'function') tuneById(channelId);
  close();
}

// ── Public API ────────────────────────────────────────────────────────────────
function toggle() {
  _open ? close() : open();
}
function open() {
  _open = true;
  const panel = document.getElementById('nexus-menu-panel');
  const btn   = document.getElementById('nexus-menu-btn');
  if (panel) panel.classList.add('open');
  if (btn)   btn.classList.add('open');
  // Rebuild nav buttons in case CH_META loaded after menu init
  _buildNavButtons();
}
function close() {
  _open = false;
  const panel = document.getElementById('nexus-menu-panel');
  const btn   = document.getElementById('nexus-menu-btn');
  if (panel) { panel.classList.remove('open'); }
  if (btn)   { btn.classList.remove('open'); }
  // Clear diag output
  const diag = document.getElementById('menu-diag-out');
  if (diag) diag.style.display = 'none';
}
function rewind() {
  if (typeof openRewind === 'function') openRewind();
  close();
}
function inspect() {
  if (typeof openInspect === 'function') openInspect();
  close();
}

// ── Mount ─────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _buildMenu);
} else {
  _buildMenu();
}

// ── Export ────────────────────────────────────────────────────────────────────
window.NexusMenu = { toggle, open, close, diagnose, rewind, inspect, go, sendCLI };

})();
