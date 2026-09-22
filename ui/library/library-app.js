'use strict';
/**
 * ui/library/library-app.js
 * §BUILT 2026-09-21 — James: "the clearglass macros, autofill, keyboard
 * shortcuts... build them, then expand the ui, like it should have
 * been. index.html."
 *
 * This file did not exist. ui/library/index.html (built 2026-09-19) had
 * six real tabs marked up — Bookmarks, History, Downloads, Accounts,
 * Macros, Passwords — each already backed by a real /cli/* route on
 * clear-glass's own IPC-bridge server (:7702), and a <script src=
 * "/ui/library/library-app.js"> that pointed at nothing. Every panel was
 * a permanent "loading…" placeholder. Autofill (built 2026-09-19, an
 * IPC-only surface whose own bridge.js comment says "real IPC surface
 * for the UI") had no UI at all, in this page or anywhere else. Same
 * real gap as macros, closed the same way.
 *
 * Same real pattern as ui/brainos/brainos-app.js: plain fetch(), no
 * framework, one IIFE. Unlike BrainOS this page talks to exactly one
 * system, so one base URL rather than five.
 *
 * §HONEST LIMIT — Macros' run and Autofill's detect/fill each act on a
 * live agent tab's real DOM; this page is its own standalone window with
 * no "current tab" of its own, so both require picking a target from
 * /cli/agents (a fresh GET each time the picker opens — an agent window
 * can open/close while this page sits idle, and a stale list would let
 * someone target a session that's already gone).
 */
(function () {
  const API = 'http://127.0.0.1:7702';

  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (_) { /* real empty/non-JSON body — data stays null */ }
    if (!res.ok && !(data && data.error)) data = { error: `HTTP ${res.status}` };
    return data || {};
  }

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fmtBytes(n) {
    if (!n) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB']; let i = 0; let v = n;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function fmtAgo(ts) {
    if (!ts) return '';
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  }

  // ── Modal — one shared host, every tab's form/confirm goes through it ──
  function openModal({ title, bodyHtml, buttons }) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    const foot = document.getElementById('modal-foot');
    foot.innerHTML = '';
    (buttons || []).forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'hbtn' + (b.cls ? ' ' + b.cls : '');
      btn.textContent = b.label;
      btn.addEventListener('click', () => b.onClick && b.onClick());
      foot.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('act');
  }
  function closeModal() { document.getElementById('modal-overlay').classList.remove('act'); }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => { if (e.target.id === 'modal-overlay') closeModal(); });

  // A live-agent picker — built fresh each time from /cli/agents, per the
  // honest limit above. Returns the <select> HTML; caller reads its value
  // by id at submit time.
  async function agentPickerHtml(selectId) {
    const r = await api('/cli/agents');
    const ids = [...(r.windows || []), ...(r.bgTabs || [])];
    if (!ids.length) return `<div class="empty-state">No agent windows open — open one first.</div>`;
    return `<select id="${selectId}">${ids.map((a) => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}</select>`;
  }

  // ── Tabs ─────────────────────────────────────────────────────────────
  const TABS = {}; // name -> { load(query) }
  let currentTab = 'bookmarks';
  let currentQuery = '';

  function setTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tnav').forEach((t) => t.classList.toggle('act', t.dataset.tab === tab));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('act', p.id === 'panel-' + tab));
    document.getElementById('search').value = '';
    currentQuery = '';
    TABS[tab] && TABS[tab].load('');
  }
  document.querySelectorAll('.tnav').forEach((t) => t.addEventListener('click', () => setTab(t.dataset.tab)));
  document.getElementById('search').addEventListener('input', (e) => {
    currentQuery = e.target.value.toLowerCase();
    TABS[currentTab] && TABS[currentTab].load(currentQuery);
  });

  function matches(q, ...fields) { return !q || fields.some((f) => String(f || '').toLowerCase().includes(q)); }
  function row(mainHtml, subHtml, actionsHtml) {
    return `<div class="row"><div class="main-field">${mainHtml}${subHtml ? `<div class="sub-field">${subHtml}</div>` : ''}</div><div class="actions">${actionsHtml || ''}</div></div>`;
  }
  function empty(msg) { return `<div class="empty-state">${esc(msg)}</div>`; }

  // ── Bookmarks ────────────────────────────────────────────────────────
  TABS.bookmarks = {
    async load(q) {
      const list = document.getElementById('bookmarks-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/bookmarks');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.bookmarks || []).filter((b) => matches(q, b.title, b.url, ...(b.tags || [])));
      list.innerHTML = items.length ? items.map((b) => row(
        `<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.title || b.url)}</a>`,
        `${esc(b.url)}${b.tags && b.tags.length ? ' • ' + b.tags.map(esc).join(', ') : ''} • ${esc(b.agentId || '')}`,
        `<span class="hbtn danger" data-del="${esc(b.id)}">DELETE</span>`,
      )).join('') : empty('No bookmarks.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/bookmarks/${el.dataset.del}`, { method: 'DELETE' }); TABS.bookmarks.load(currentQuery);
      }));
    },
  };
  document.getElementById('bookmarks-refresh').addEventListener('click', () => TABS.bookmarks.load(currentQuery));

  // ── History ──────────────────────────────────────────────────────────
  TABS.history = {
    async load(q) {
      const list = document.getElementById('history-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/history');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.entries || []).filter((h) => matches(q, h.title, h.url)).sort((a, b) => b.ts - a.ts);
      list.innerHTML = items.length ? items.map((h) => row(
        esc(h.title || h.url), `${esc(h.url)} • ${fmtAgo(h.ts)} • ${esc(h.agentId || '')}`,
        `<span class="hbtn danger" data-del="${esc(h.id)}">DELETE</span>`,
      )).join('') : empty('No history.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/history/${el.dataset.del}`, { method: 'DELETE' }); TABS.history.load(currentQuery);
      }));
    },
  };
  document.getElementById('history-refresh').addEventListener('click', () => TABS.history.load(currentQuery));
  document.getElementById('history-clear').addEventListener('click', () => {
    openModal({
      title: 'Clear all history?', bodyHtml: `<div>This removes every real entry, for every agent. Not undoable.</div>`,
      buttons: [
        { label: 'CANCEL', onClick: closeModal },
        { label: 'CLEAR ALL', cls: 'danger', onClick: async () => { await api('/cli/history', { method: 'DELETE' }); closeModal(); TABS.history.load(currentQuery); } },
      ],
    });
  });

  // ── Downloads ────────────────────────────────────────────────────────
  const STATE_LABEL = { in_progress: '⏳', completed: '✓', cancelled: '✕', interrupted: '⚠', paused: '⏸' };
  TABS.downloads = {
    async load(q) {
      const list = document.getElementById('downloads-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/downloads');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.downloads || []).filter((d) => matches(q, d.filename, d.savePath));
      list.innerHTML = items.length ? items.map((d) => row(
        `${STATE_LABEL[d.state] || d.state} ${esc(d.filename)}`, `${fmtBytes(d.bytes)} • ${esc(d.savePath || '')}`,
        `<span class="hbtn danger" data-del="${esc(d.id)}">REMOVE</span>`,
      )).join('') : empty('No downloads yet.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/downloads/${el.dataset.del}`, { method: 'DELETE' }); TABS.downloads.load(currentQuery);
      }));
    },
  };
  document.getElementById('downloads-refresh').addEventListener('click', () => TABS.downloads.load(currentQuery));
  document.getElementById('downloads-clear-completed').addEventListener('click', async () => {
    await api('/cli/downloads/clear-completed', { method: 'POST' }); TABS.downloads.load(currentQuery);
  });

  // ── Accounts ─────────────────────────────────────────────────────────
  TABS.accounts = {
    async load(q) {
      const list = document.getElementById('accounts-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/accounts');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.accounts || []).filter((a) => matches(q, a.label, ...(a.agentKeys || [])));
      list.innerHTML = items.length ? items.map((a) => row(
        esc(a.label), `${(a.agentKeys || []).map(esc).join(', ') || 'unlinked'}${a.providerAccounts ? ' • ' + Object.keys(a.providerAccounts).map(esc).join(', ') : ''}`,
        `<span class="hbtn danger" data-del="${esc(a.id)}">DELETE</span>`,
      )).join('') : empty('No accounts.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/accounts/${el.dataset.del}`, { method: 'DELETE' }); TABS.accounts.load(currentQuery);
      }));
    },
  };
  document.getElementById('accounts-refresh').addEventListener('click', () => TABS.accounts.load(currentQuery));
  document.getElementById('accounts-new').addEventListener('click', () => {
    openModal({
      title: 'New account',
      bodyHtml: `
        <div class="field-row"><label>Label</label><input type="text" id="acc-label" placeholder="e.g. Work"></div>
        <div class="field-row"><label>Agent keys (comma-separated)</label><input type="text" id="acc-keys" placeholder="claude, chatgpt"></div>`,
      buttons: [
        { label: 'CANCEL', onClick: closeModal },
        {
          label: 'CREATE', cls: 'g', onClick: async () => {
            const label = document.getElementById('acc-label').value.trim();
            const agentKeys = document.getElementById('acc-keys').value.split(',').map((s) => s.trim()).filter(Boolean);
            const r = await api('/cli/accounts', { method: 'POST', body: { label, agentKeys } });
            if (r.error) return alert(r.error);
            closeModal(); TABS.accounts.load(currentQuery);
          },
        },
      ],
    });
  });

  // ── Macros — list + run only (creation stays agent-tool-defined, per
  //    macro.js's own stated v1 scope: "a real, composed list of steps,"
  //    not a live recorder — building one here would be a second,
  //    competing definition of what "record" means) ──────────────────────
  TABS.macros = {
    async load(q) {
      const list = document.getElementById('macros-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/macros');
      if (r.error || r.ok === false) return (list.innerHTML = empty(r.error || 'macro tool unavailable'));
      const items = (r.macros || []).filter((m) => matches(q, m.name, m.urlPattern));
      list.innerHTML = items.length ? items.map((m) => row(
        esc(m.name), `${m.urlPattern ? esc(m.urlPattern) + ' • ' : ''}${m.steps} step${m.steps === 1 ? '' : 's'} • ${m.runCount} run${m.runCount === 1 ? '' : 's'}${m.lastRunAt ? ' • last ' + fmtAgo(m.lastRunAt) : ''}`,
        `<span class="hbtn g" data-run="${esc(m.name)}">RUN</span>`,
      )).join('') : empty('No macros. Defined via an agent tool call (lib/agent-tools/tools/clear-glass/macro.js), not from here.');
      list.querySelectorAll('[data-run]').forEach((el) => el.addEventListener('click', () => runMacro(el.dataset.run, items.find((m) => m.name === el.dataset.run))));
    },
  };
  document.getElementById('macros-refresh').addEventListener('click', () => TABS.macros.load(currentQuery));

  async function runMacro(name, meta) {
    const picker = await agentPickerHtml('macro-agent');
    const paramInputs = (meta && meta.params || []).map((p) => `<div class="field-row"><label>${esc(p)}</label><input type="text" id="macro-param-${esc(p)}"></div>`).join('');
    openModal({
      title: `Run "${name}"`,
      bodyHtml: `<div class="field-row"><label>Run against</label>${picker}</div>${paramInputs}<div id="macro-run-result"></div>`,
      buttons: [
        { label: 'CANCEL', onClick: closeModal },
        {
          label: 'RUN', cls: 'g', onClick: async () => {
            const sel = document.getElementById('macro-agent');
            if (!sel) return;
            const agentId = sel.value;
            const params = {};
            (meta && meta.params || []).forEach((p) => { params[p] = document.getElementById(`macro-param-${p}`).value; });
            const out = document.getElementById('macro-run-result');
            out.innerHTML = `<div class="result-line">running…</div>`;
            const r = await api(`/cli/macros/${encodeURIComponent(name)}/run`, { method: 'POST', body: { agentId, params } });
            out.innerHTML = r.ok
              ? `<div class="result-line ok">✓ completed — ${r.results ? r.results.length : 0} step(s)</div>`
              : `<div class="result-line err">✗ ${esc(r.error || 'failed')}${r.failedAtStep !== undefined ? ` (step ${r.failedAtStep})` : ''}</div>`;
            TABS.macros.load(currentQuery);
          },
        },
      ],
    });
  }

  // ── Autofill ─────────────────────────────────────────────────────────
  let _fieldTypesCache = null;
  async function fieldTypes() {
    if (_fieldTypesCache) return _fieldTypesCache;
    const r = await api('/cli/autofill/field-types');
    return (_fieldTypesCache = r.error ? { fieldTypes: {}, documentFields: {} } : r);
  }

  TABS.autofill = {
    async load(q) {
      const list = document.getElementById('autofill-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/autofill/profiles');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.profiles || []).filter((p) => matches(q, p.label));
      list.innerHTML = items.length ? items.map((p) => row(
        esc(p.label), `${Object.keys(p.fields || {}).length} field(s)${Object.keys(p.documents || {}).length ? ' • ' + Object.keys(p.documents).length + ' document(s)' : ''}`,
        `<span class="hbtn" data-fill="${esc(p.id)}">FILL</span>` +
        `<span class="hbtn" data-edit="${esc(p.id)}">EDIT</span>` +
        `<span class="hbtn danger" data-del="${esc(p.id)}">DELETE</span>`,
      )).join('') : empty('No autofill profiles.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/autofill/profiles/${el.dataset.del}`, { method: 'DELETE' }); TABS.autofill.load(currentQuery);
      }));
      list.querySelectorAll('[data-edit]').forEach((el) => el.addEventListener('click', () => editAutofillProfile(items.find((p) => p.id === el.dataset.edit))));
      list.querySelectorAll('[data-fill]').forEach((el) => el.addEventListener('click', () => fillAutofillProfile(el.dataset.fill)));
    },
  };
  document.getElementById('autofill-refresh').addEventListener('click', () => TABS.autofill.load(currentQuery));
  document.getElementById('autofill-new').addEventListener('click', () => editAutofillProfile(null));

  async function editAutofillProfile(existing) {
    const { fieldTypes: FT } = await fieldTypes();
    const known = Object.values(FT);
    const fieldRows = known.map((f) => `<div class="field-row"><label>${esc(f)}</label><input type="text" data-af-field="${esc(f)}" value="${esc(existing && existing.fields && existing.fields[f] || '')}"></div>`).join('');
    openModal({
      title: existing ? `Edit "${existing.label}"` : 'New autofill profile',
      bodyHtml: `<div class="field-row"><label>Label</label><input type="text" id="af-label" value="${esc(existing ? existing.label : '')}"></div>${fieldRows}`,
      buttons: [
        { label: 'CANCEL', onClick: closeModal },
        {
          label: existing ? 'SAVE' : 'CREATE', cls: 'g', onClick: async () => {
            const label = document.getElementById('af-label').value.trim();
            const fields = {};
            document.querySelectorAll('[data-af-field]').forEach((el) => { if (el.value.trim()) fields[el.dataset.afField] = el.value.trim(); });
            const r = existing
              ? await api(`/cli/autofill/profiles/${existing.id}`, { method: 'PUT', body: { label, fields } })
              : await api('/cli/autofill/profiles', { method: 'POST', body: { label, fields } });
            if (r.error) return alert(r.error);
            closeModal(); TABS.autofill.load(currentQuery);
          },
        },
      ],
    });
  }

  async function fillAutofillProfile(profileId) {
    const picker = await agentPickerHtml('af-agent');
    openModal({
      title: 'Fill form',
      bodyHtml: `
        <div class="field-row"><label>Target tab</label>${picker}</div>
        <div class="field-row"><label>Minimum confidence</label>
          <select id="af-confidence"><option value="high">high only</option><option value="medium" selected>medium and up</option><option value="low">low and up</option></select>
        </div>
        <div id="af-fill-result"></div>`,
      buttons: [
        { label: 'CANCEL', onClick: closeModal },
        {
          label: 'DETECT', onClick: async () => {
            const sel = document.getElementById('af-agent'); if (!sel) return;
            const out = document.getElementById('af-fill-result');
            out.innerHTML = `<div class="result-line">detecting…</div>`;
            const r = await api('/cli/autofill/detect', { method: 'POST', body: { agentId: sel.value, profileId } });
            out.innerHTML = r.error ? `<div class="result-line err">✗ ${esc(r.error)}</div>`
              : ((r.matches || []).map((m) => `<div class="result-line">${esc(m.fieldType)} <span class="confidence-badge ${esc(m.confidence)}">${esc(m.confidence)}</span> — ${esc(m.source)}</div>`).join('')
                 || `<div class="result-line">No matching fields found (${r.totalFields} field${r.totalFields === 1 ? '' : 's'} on the page).</div>`);
          },
        },
        {
          label: 'FILL', cls: 'g', onClick: async () => {
            const sel = document.getElementById('af-agent'); if (!sel) return;
            const minConfidence = document.getElementById('af-confidence').value;
            const out = document.getElementById('af-fill-result');
            out.innerHTML = `<div class="result-line">filling…</div>`;
            const r = await api('/cli/autofill/fill', { method: 'POST', body: { agentId: sel.value, profileId, minConfidence } });
            if (r.error) { out.innerHTML = `<div class="result-line err">✗ ${esc(r.error)}</div>`; return; }
            const lines = [`<div class="result-line ok">✓ filled ${r.filled.length} field(s)</div>`];
            if (r.skipped && r.skipped.length) lines.push(`<div class="result-line">skipped ${r.skipped.length} below "${esc(minConfidence)}" confidence</div>`);
            if (r.failed && r.failed.length) r.failed.forEach((f) => lines.push(`<div class="result-line err">✗ ${esc(f.fieldType)}: ${esc(f.error)}</div>`));
            out.innerHTML = lines.join('');
          },
        },
      ],
    });
  }

  // ── Passwords — read-only list, matches vault.js's own "never decrypt
  //    on list()" design; created via the vault's own save-prompt flow ──
  TABS.passwords = {
    async load(q) {
      const list = document.getElementById('passwords-list');
      list.innerHTML = empty('loading…');
      const r = await api('/cli/passwords');
      if (r.error) return (list.innerHTML = empty(r.error));
      const items = (r.passwords || []).filter((p) => matches(q, p.origin, p.username));
      list.innerHTML = items.length ? items.map((p) => row(
        esc(p.origin), esc(p.username),
        `<span class="hbtn danger" data-del="${esc(p.id)}">DELETE</span>`,
      )).join('') : empty('No saved passwords.');
      list.querySelectorAll('[data-del]').forEach((el) => el.addEventListener('click', async () => {
        await api(`/cli/passwords/${el.dataset.del}`, { method: 'DELETE' }); TABS.passwords.load(currentQuery);
      }));
    },
  };
  document.getElementById('passwords-refresh').addEventListener('click', () => TABS.passwords.load(currentQuery));

  // ── Boot — the shell's own default active tab is bookmarks ──────────────
  TABS.bookmarks.load('');
})();
