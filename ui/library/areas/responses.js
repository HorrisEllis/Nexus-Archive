'use strict';
/**
 * ui/library/areas/responses.js — the Library's Responses tab  (styles: responses.css)
 * v0.39.239
 *
 * James: "the download manager in clearglass needs a ui so i can actually see
 * this visually" and "the download manager should be routing the response to
 * the agent or compartment id".
 *
 * Every agent reply guardian completes is written to Clear Glass's downloads
 * index (clear-glass/src/downloads/artifact-chat-index.js — a .response file per
 * item in the COS compartment 'clearglass-downloads-index'), and every file a
 * provider tab downloads is recorded there too. Each item carries the agent it
 * belongs to (e.g. repo-<uuid> for an idearium repo agent). This tab reads them
 * through Clear Glass's GET /cli/downloads/responses[/:id] and shows them by
 * agent. Read-only.
 */
(function () {
  const L = window.LIB;
  if (!L) { console.error('[library/responses] window.LIB missing — library-app.js must load first'); return; }
  const { api, esc, fmtAgo, fmtBytes, openModal, closeModal, TABS, row, empty, matches } = L;
  const sel = document.getElementById('responses-agent');
  const list = document.getElementById('responses-list');

  function fillAgents(agents) {
    const keep = sel.value;
    const names = Object.keys(agents || {}).sort();
    sel.innerHTML = `<option value="">all agents (${names.reduce((n, a) => n + agents[a], 0)})</option>` +
      names.map((a) => `<option value="${esc(a === '(no agent)' ? '' : a)}"${a === keep ? ' selected' : ''}>${esc(a)} (${agents[a]})</option>`).join('');
    if (keep && names.includes(keep)) sel.value = keep;
  }

  TABS.responses = {
    async load(q) {
      list.innerHTML = empty('loading…');
      const agent = sel.value;
      const r = await api(`/cli/downloads/responses${agent ? `?agentId=${encodeURIComponent(agent)}` : ''}`);
      if (!r || r.ok === false || r.error) return (list.innerHTML = empty(r && r.error ? r.error : 'Clear Glass did not answer on :7702'));
      fillAgents(r.agents);
      const items = (r.items || []).filter((it) => matches(q, it.agent_id, it.provider, it.job_id, it.chat_id, it.kind));
      list.innerHTML = items.length ? items.map((it) => row(
        `<span class="resp-kind resp-${esc(it.kind || 'x')}">${it.kind === 'artifact' ? '⤓' : '💬'}</span> ` +
          `<span class="resp-agent">${esc(it.agent_id || '(no agent)')}</span> <span class="resp-prov">${esc(it.provider || '')}</span>` +
          (it.status === 'unreadable' ? ' <span class="resp-bad">unreadable</span>' : ''),
        `${it.job_id ? `job ${esc(String(it.job_id).slice(0, 8))} • ` : ''}${esc(fmtAgo(it.captured_at))}${it.chat_id ? ` • ${esc(it.chat_id)}` : ''}`,
        `<span class="hbtn" data-open="${esc(it.id)}">VIEW</span>`,
      )).join('') : empty(agent ? `No responses for ${agent} yet.` : 'No agent responses captured yet.');
      list.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => view(el.dataset.open)));
    },
  };

  async function view(id) {
    const r = await api(`/cli/downloads/responses/${encodeURIComponent(id)}`);
    if (!r || !r.ok) return openModal({ title: 'Response', bodyHtml: empty((r && r.error) || 'not found'), buttons: [{ label: 'CLOSE', onClick: closeModal }] });
    const it = r.item, raw = it.raw || {};
    const meta = [
      ['agent', it.agent_id || '(none)'], ['provider', it.provider || ''], ['job', it.job_id || ''],
      ['chat', it.chat_id || raw.chatUrl || ''], ['captured', it.captured_at ? new Date(it.captured_at).toLocaleString() : ''],
      ['hash', it.content_hash || ''],
    ].filter(([, v]) => v).map(([k, v]) => `<div class="resp-meta"><span>${esc(k)}</span>${esc(v)}</div>`).join('');
    let body = meta;
    if (it.kind === 'artifact') {
      body += `<div class="resp-meta"><span>file</span>${esc(raw.filename || '')}${raw.bytes ? ` · ${esc(fmtBytes(raw.bytes))}` : ''}</div>` +
        `<div class="resp-meta"><span>saved at</span>${esc(raw.savePath || '')}</div>` +
        `<div class="resp-meta"><span>in index</span>${raw.copied ? 'copied' : 'by path only (over 10 MB, or unreadable at capture)'}</div>`;
    } else {
      if (raw.prompt) body += `<details class="resp-prompt"><summary>prompt (${esc(String(raw.prompt.length))} chars)</summary><pre>${esc(raw.prompt)}</pre></details>`;
      body += `<div class="resp-h">response</div><pre class="resp-text">${esc(raw.response || '')}</pre>`;
      const blocks = raw.codeBlocks || [];
      if (blocks.length) body += `<div class="resp-h">code blocks (${blocks.length})</div>` + blocks.map((b) =>
        `<details class="resp-block"><summary>${esc(b.syntax || 'text')}${b.ext ? ` ${esc(String(b.ext).startsWith('.') ? b.ext : '.' + b.ext)}` : ''} · ${esc(fmtBytes(b.bytes))}</summary><pre>${esc(b.code || '')}</pre></details>`).join('');
    }
    openModal({ title: `${it.kind === 'artifact' ? 'Download' : 'Response'} — ${it.agent_id || it.provider || id}`, bodyHtml: `<div class="resp-view">${body}</div>`, buttons: [{ label: 'CLOSE', onClick: closeModal }] });
  }

  sel.addEventListener('change', () => TABS.responses.load(L.query()));
  document.getElementById('responses-refresh').addEventListener('click', () => TABS.responses.load(L.query()));
})();
