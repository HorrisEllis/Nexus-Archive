---
chunk_uuid: 1d2c7522-3657-4283-b683-5883d6aef5a8
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-24-nexus-tablet-index-html-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/24-nexus-tablet-index-html.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-24-nexus-tablet-index-html-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-24-nexus-tablet-index-html-md:1d2c7522
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:26:00.266Z
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NEXUS Tablet — T1 Ledger Explorer</title>
<!--
  §TABLET T1 — docs/nexus-tablet.spec phase T1 (v0.4.0-spec).
  Gate: "browse system → hook → day → events from the live tree with ZERO
  writes to NEXUS."

  Laws honored here, deliberately:
  - CONNECTION: one endpoint. Everything below talks to autopilot's status
    server (/ledger*) and nothing else. No per-system port map exists in
    this file. (spec: "the tablet talks to ONE endpoint")
  - DECOUPLING (§5.12): this page owns NO authoritative state — no
    localStorage, no writes, nothing another system reads. Kill it: zero
    effect on a running NEXUS.
  - OBSERVATION: autopilot serves these routes from DISK. If cortex is
    wedged, its ledger still browses.
  - §1.2: corrupt jsonl lines are surfaced ("N corrupt") — never hidden.
-->
<style>
  :root {
    --bg: #0b0f14; --panel: #111823; --line: #1d2837; --txt: #c8d4e3;
    --dim: #5d7290; --acc: #2dd4bf; --warn: #f59e0b; --err: #ef4444;
  }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--txt); font: 13px/1.5 'SF Mono', 'Cascadia Code', Consolas, monospace; height: 100vh; display: flex; flex-direction: column; }
  header { padding: 10px 16px; border-bottom: 1px solid var(--line); display: flex; gap: 14px; align-items: baseline; flex-shrink: 0; }
  header h1 { font-size: 14px; color: var(--acc); font-weight: 600; }
  header .sub { color: var(--dim); font-size: 11px; }
  #conn { margin-left: auto; font-size: 11px; }
  #conn.ok  { color: var(--acc); }
  #conn.bad { color: var(--err); }
  main { flex: 1; display: grid; grid-template-columns: 190px 260px 170px 1fr; min-height: 0; }
  .col { border-right: 1px solid var(--line); overflow-y: auto; padding: 8px 0; }
  .col h2 { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--dim); padding: 2px 12px 6px; position: sticky; top: -8px; background: var(--bg); }
  .item { padding: 4px 12px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item:hover { background: var(--panel); }
  .item.sel { background: var(--panel); color: var(--acc); border-left: 2px solid var(--acc); padding-left: 10px; }
  .item .meta { color: var(--dim); font-size: 11px; }
  #events { overflow-y: auto; padding: 8px 12px; }
  #evmeta { color: var(--dim); font-size: 11px; padding: 2px 0 8px; border-bottom: 1px solid var(--line); margin-bottom: 8px; }
  #evmeta .corrupt { color: var(--warn); }
  .ev { border: 1px solid var(--line); border-radius: 4px; margin-bottom: 6px; background: var(--panel); }
  .ev summary { padding: 5px 10px; cursor: pointer; list-style: none; display: flex; gap: 10px; align-items: baseline; }
  .ev summary::-webkit-details-marker { display: none; }
  .ev .ts { color: var(--dim); font-size: 11px; flex-shrink: 0; }
  .ev .action { color: var(--acc); }
  .ev .status-ok { color: var(--acc); } .ev .status-other { color: var(--warn); }
  .ev pre { padding: 8px 10px; border-top: 1px solid var(--line); font-size: 11px; color: var(--txt); overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
  .empty { color: var(--dim); padding: 12px; font-style: italic; }

  #views { display: flex; gap: 6px; margin-left: 18px; }
  .vbtn { background: var(--panel); color: var(--dim); border: 1px solid var(--line); border-radius: 4px; padding: 3px 12px; font: inherit; cursor: pointer; }
  .vbtn.sel { color: var(--acc); border-color: var(--acc); }
  #cmain { flex: 1; display: none; grid-template-columns: 170px 1fr; min-height: 0; }
  #cmain.on { display: grid; } main.off { display: none; }
  #cpanels { overflow-y: auto; padding: 12px; }
  .cpanel { border: 1px solid var(--line); border-radius: 6px; margin-bottom: 12px; background: var(--panel); }
  .cpanel h3 { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--acc); padding: 8px 12px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; }
  .cpanel .body { padding: 8px 12px; font-size: 12px; max-height: 300px; overflow-y: auto; }
  .cpanel table { width: 100%; border-collapse: collapse; }
  .cpanel td, .cpanel th { text-align: left; padding: 2px 8px 2px 0; color: var(--txt); font-size: 11px; }
  .cpanel th { color: var(--dim); }
  .runbtn { background: var(--bg); color: var(--acc); border: 1px solid var(--acc); border-radius: 4px; padding: 2px 10px; font: inherit; font-size: 11px; cursor: pointer; }
  .runbtn:disabled { color: var(--dim); border-color: var(--dim); }
  pre.testout { font-size: 10px; color: var(--dim); white-space: pre-wrap; }

  #bmain { flex: 1; display: none; grid-template-columns: 1fr 300px; min-height: 0; }
  #bmain.on { display: grid; }
  #bcanvas { position: relative; overflow: hidden; background: radial-gradient(circle at 50% 45%, #0d1520 0%, var(--bg) 70%); }
  #bside { border-left: 1px solid var(--line); overflow-y: auto; padding: 12px; font-size: 11px; }
  #bside h4 { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--acc); margin: 10px 0 4px; }
  #bside .kv { display: flex; justify-content: space-between; color: var(--dim); padding: 1px 0; }
  #bside .kv b { color: var(--txt); font-weight: 500; }
  .bnote { color: var(--warn); font-size: 10px; line-height: 1.45; border-left: 2px solid var(--warn); padding-left: 6px; margin: 6px 0; }
  .bnode { position: absolute; transform: translate(-50%,-50%); text-align: center; cursor: pointer; }
  .bnode .dot { width: 12px; height: 12px; border-radius: 50%; margin: 0 auto 3px; background: var(--acc); box-shadow: 0 0 10px var(--acc); }
  .bnode.stale .dot { background: var(--warn); box-shadow: 0 0 8px var(--warn); }
  .bnode.silent .dot { background: var(--dim); box-shadow: none; }
  .bnode span { font-size: 10px; color: var(--dim); white-space: nowrap; }
  .bnode.sel span { color: var(--acc); }
</style>
</head>
<body>
<header>
  <h1>NEXUS TABLET · T1 LEDGER</h1>
  <span class="sub">disk-backed · read-only · one endpoint (autopilot)</span>
  <nav id="views"><button class="vbtn sel" data-v="ledger">Ledger</button><button class="vbtn" data-v="containers">Containers</button><button class="vbtn" data-v="brain">Brain</button></nav>
  <span id="conn">connecting…</span>
</header>
<main>
  <div class="col" id="systems"><h2>Systems</h2><div class="empty">…</div></div>
  <div class="col" id="hooks"><h2>Hooks</h2><div class="empty">select a system</div></div>
  <div class="col" id="days"><h2>Days</h2><div class="empty">select a hook</div></div>
  <div class="col" id="events"><h2>Events</h2><div class="empty">select a day</div></div>
</main>
<div id="bmain">
  <div id="bcanvas"><svg id="bsvg" width="100%" height="100%"></svg></div>
  <div id="bside"><div class="empty">loading…</div></div>
</div>
<div id="cmain">
  <div class="col" id="csystems"><h2>Systems</h2><div class="empty">…</div></div>
  <div id="cpanels"><div class="empty">select a system</div></div>
</div>
<script>
'use strict';
// ONE endpoint. Autopilot's status port — default 7799, ?port= to override
// (the port itself is the single configuration knob, per the connection law;
// nothing else about NEXUS topology appears anywhere in this file).
const PORT = new URLSearchParams(location.search).get('port') || 7799;
const BASE = `http://127.0.0.1:${PORT}`;
const $ = (id) => document.getElementById(id);
const conn = $('conn');

async function api(p) {
  const r = await fetch(`${BASE}${p}`);
  const j = await r.json();
  if (!r.ok || j.ok === false) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

function fill(colId, entries, onPick) {
  const col = $(colId);
  col.querySelectorAll('.item, .empty').forEach(n => n.remove());
  if (!entries.length) { col.insertAdjacentHTML('beforeend', '<div class="empty">nothing here</div>'); return; }
  for (const e of entries) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = e.html;
    div.onclick = () => {
      col.querySelectorAll('.item.sel').forEach(n => n.classList.remove('sel'));
      div.classList.add('sel');
      onPick(e);
    };
    col.appendChild(div);
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kb = (n) => n > 1048576 ? (n/1048576).toFixed(1)+'M' : n > 1024 ? (n/1024).toFixed(1)+'K' : n+'B';

let cur = { system: null, hook: null };

async function loadSystems() {
  const r = await api('/ledger');
  conn.textContent = `● :${PORT}`; conn.className = 'ok';
  const entries = [
    ...r.dirs.map(d => ({ name: d, isDir: true,  html: esc(d) })),
    ...r.files.map(f => ({ name: f.name, isDir: false, html: `${esc(f.name)} <span class="meta">${kb(f.bytes)}</span>` })),
  ];
  fill('systems', entries, e => e.isDir ? loadHooks(e.name) : loadEvents(`/ledger/${e.name}`, e.name));
}

async function loadHooks(system) {
  cur.system = system;
  ['hooks','days','events'].forEach(reset);
  const r = await api(`/ledger/${system}`);
  const entries = [
    ...r.dirs.map(d => ({ name: d, isDir: true, html: esc(d.startsWith(system + '.') ? d.slice(system.length + 1) : d) })),
    ...r.files.map(f => ({ name: f.name, isDir: false, html: `${esc(f.name)} <span class="meta">${kb(f.bytes)}</span>` })),
  ];
  fill('hooks', entries, e => e.isDir ? loadDays(e.name) : loadEvents(`/ledger/${system}/${e.name}`, e.name));
}

async function loadDays(hook) {
  cur.hook = hook;
  ['days','events'].forEach(reset);
  const r = await api(`/ledger/${cur.system}/${hook}`);
  const entries = r.files.map(f => ({ name: f.name, html: `${esc(f.name.replace('.jsonl',''))} <span class="meta">${kb(f.bytes)}</span>` }));
  fill('days', entries, e => loadEvents(`/ledger/${cur.system}/${hook}/${e.name}`, e.name));
}

async function loadEvents(apiPath, label) {
  reset('events');
  const r = await api(apiPath);
  const col = $('events');
  col.querySelectorAll('.empty').forEach(n => n.remove());
  const corrupt = r.corruptLines ? ` · <span class="corrupt">${r.corruptLines} corrupt line(s)</span>` : '';
  col.insertAdjacentHTML('beforeend',
    `<div id="evmeta">${esc(label)} — ${r.returned} of ${r.total} event(s)${corrupt}</div>`);
  for (const ev of [...r.events].reverse()) { // newest first for reading
    const ts = ev.ts ? new Date(ev.ts).toISOString().replace('T',' ').slice(0,19) : '—';
    const status = ev.status === 'ok' ? 'status-ok' : 'status-other';
    const d = document.createElement('details');
    d.className = 'ev';
    d.innerHTML = `<summary><span class="ts">${esc(ts)}</span>` +
      `<span class="action">${esc(ev.action || ev.type || ev.event || '·')}</span>` +
      `<span class="${status}">${esc(ev.status || '')}</span>` +
      `<span class="meta">${esc((ev.detail || '').slice(0, 80))}</span></summary>` +
      `<pre>${esc(JSON.stringify(ev, null, 2))}</pre>`;
    col.appendChild(d);
  }
  if (!r.events.length) col.insertAdjacentHTML('beforeend', '<div class="empty">empty day</div>');
}

function reset(id) {
  const col = $(id);
  col.querySelectorAll('.item, .empty, .ev, #evmeta').forEach(n => n.remove());
  col.insertAdjacentHTML('beforeend', '<div class="empty">…</div>');
}


// ── T2 container shell — one container per system, everything read-only ──
document.querySelectorAll('.vbtn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.vbtn').forEach(x => x.classList.remove('sel'));
  b.classList.add('sel');
  const containers = b.dataset.v === 'containers';
  document.querySelector('main').classList.toggle('off', containers);
  document.getElementById('cmain').classList.toggle('on', containers);
  const brain = b.dataset.v === 'brain';
  document.querySelector('main').classList.toggle('off', containers || brain);
  document.getElementById('cmain').classList.toggle('on', containers);
  document.getElementById('bmain').classList.toggle('on', brain);
  if (containers) loadCSystems();
  if (brain) loadBrain();
});

let cLoaded = false;
async function loadCSystems() {
  if (cLoaded) return; cLoaded = true;
  const st = await api('/status');
  const names = Object.keys(st.kernels || {}).sort();
  const col = $('csystems');
  col.querySelectorAll('.item, .empty').forEach(n => n.remove());
  if (!names.length) {
    // Autopilot is up (we just got a 200) but is supervising nothing yet.
    // Say that plainly rather than rendering an empty column that reads
    // like a broken page — §1.2 applies to UI states too.
    col.insertAdjacentHTML('beforeend', '<div class="empty">autopilot up, no kernels spawned yet</div>');
    cLoaded = false; // let a later click retry once kernels exist
    return;
  }
  for (const name of names) {
    const div = document.createElement('div');
    div.className = 'item'; div.textContent = name;
    div.onclick = () => { col.querySelectorAll('.item.sel').forEach(n => n.classList.remove('sel')); div.classList.add('sel'); loadContainer(name); };
    col.appendChild(div);
  }
}

async function loadContainer(sys) {
  const p = $('cpanels');
  p.innerHTML = '<div class="empty">loading ' + esc(sys) + '…</div>';
  const panels = [];

  // Contract / API map — via autopilot proxy; a down system is a shown fact, not a blank
  let contractHtml;
  try {
    const c = await api('/contract-map/' + sys);
    const routes = c.routes || c.contract?.routes || c.endpoints || [];
    contractHtml = routes.length
      ? '<table><tr><th>method</th><th>path</th><th>desc</th></tr>' + routes.slice(0, 60).map(r => '<tr><td>' + esc(r.method || '') + '</td><td>' + esc(r.path || '') + '</td><td>' + esc((r.description || r.desc || '').slice(0, 60)) + '</td></tr>').join('') + '</table>'
      : '<pre class="testout">' + esc(JSON.stringify(c, null, 2).slice(0, 2000)) + '</pre>';
  } catch (e) { contractHtml = '<span style="color:var(--warn)">' + esc(e.message) + ' — system down; disk-backed panels below still work</span>'; }
  panels.push(['API map (live /contract)', contractHtml]);

  // JAA tables — this system's prefix + shared, disk-backed
  try {
    const t = await api('/tables');
    const mine = t.tables.filter(x => x.name.startsWith(sys + '_'));
    const rows = (mine.length ? mine : t.tables).slice(0, 40);
    panels.push(['JAA tables' + (mine.length ? ' (' + sys + '_*)' : ' (shared store)'),
      '<table><tr><th>table</th><th>rows</th><th>bytes</th></tr>' + rows.map(x => '<tr><td>' + esc(x.name) + '</td><td>' + (x.rows === -1 ? '<span style="color:var(--warn)">corrupt</span>' : x.rows) + '</td><td>' + x.bytes + '</td></tr>').join('') + '</table>']);
  } catch (e) { panels.push(['JAA tables', esc(e.message)]); }

  // File tree — data/<sys>
  try {
    const f = await api('/files/' + sys);
    panels.push(['Files (data/' + esc(sys) + ')',
      f.dirs.map(d => '📁 ' + esc(d)).join('<br>') + (f.dirs.length && f.files.length ? '<br>' : '') + f.files.map(x => esc(x.name) + ' <span style="color:var(--dim)">' + kb(x.bytes) + '</span>').join('<br>') || '<span class="empty">empty</span>']);
  } catch (e) { panels.push(['Files', esc(e.message)]); }

  // Tests — invoke THE REAL runner
  panels.push(['Tests', '<button class="runbtn" id="runtests">run tests matching: ' + esc(sys) + '</button><pre class="testout" id="testout"></pre>']);

  p.innerHTML = panels.map(([t, b]) => '<div class="cpanel"><h3>' + t + '</h3><div class="body">' + b + '</div></div>').join('');

  document.getElementById('runtests').onclick = async (ev) => {
    ev.target.disabled = true; ev.target.textContent = 'running…';
    const out = document.getElementById('testout');
    try {
      const r = await fetch(BASE + '/run-tests/' + sys, { method: 'POST' }).then(x => x.json());
      out.textContent = (r.passed !== null ? r.passed + ' passed, ' + r.failed + ' failed' + String.fromCharCode(10,10) : '') + r.tail;
      ev.target.textContent = r.ok ? '✓ ' + r.passed + ' passed' : '✗ ' + (r.failed ?? '?') + ' failed';
    } catch (e) { out.textContent = e.message; ev.target.textContent = 'error'; }
    ev.target.disabled = false;
  };
}

// ── T4 brain view — real nodes, real cross-process edges, real CFR ──────
// Draws ONLY what the /graph endpoint actually observed. Where a fact is
// unknown (e.g. no system has published subscriptions yet) it is labelled
// unknown, never rendered as zero — an authoritative-looking wrong picture is
// the specific failure this view is warned against.
async function loadBrain() {
  const side = $('bside'), svg = $('bsvg');
  side.innerHTML = '<div class="empty">loading…</div>';
  let g;
  try { g = await api('/graph'); }
  catch (e) { side.innerHTML = '<div class="bnote">graph unavailable: ' + esc(e.message) + '</div>'; return; }

  const canvas = $('bcanvas');
  const W = canvas.clientWidth || 700, H = canvas.clientHeight || 500;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;

  canvas.querySelectorAll('.bnode').forEach(n => n.remove());
  svg.innerHTML = '';

  const pos = {};
  g.nodes.forEach((n, i) => {
    const a = (i / g.nodes.length) * Math.PI * 2 - Math.PI / 2;
    pos[n.id] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  // Edges first (under nodes). Only producer->consumer pairs that were BOTH
  // observed get a line; a producer with unknown consumers is not drawn as
  // connected to anything.
  const NS = 'http://www.w3.org/2000/svg';
  let drawn = 0;
  for (const e of g.edges) {
    const from = pos[e.source];
    if (!from || !e.consumers || !e.consumers.length) continue;
    for (const c of e.consumers) {
      const to = pos[c];
      if (!to || c === e.source) continue;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', from.x); l.setAttribute('y1', from.y);
      l.setAttribute('x2', to.x);   l.setAttribute('y2', to.y);
      l.setAttribute('stroke', 'var(--acc)');
      l.setAttribute('stroke-width', Math.min(1 + Math.log2(e.weight + 1) / 2, 4));
      l.setAttribute('opacity', '0.28');
      svg.appendChild(l); drawn++;
    }
  }

  for (const n of g.nodes) {
    const p = pos[n.id];
    const d = document.createElement('div');
    d.className = 'bnode' + (n.stale ? ' stale' : (n.emitted === 0 && !n.listeners ? ' silent' : ''));
    d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    d.innerHTML = '<div class="dot"></div><span>' + esc(n.id) + '</span>';
    d.onclick = () => {
      canvas.querySelectorAll('.bnode.sel').forEach(x => x.classList.remove('sel'));
      d.classList.add('sel');
      showNode(n, g);
    };
    canvas.appendChild(d);
  }

  const cfr = g.cfr || {};
  const unknownConsumers = g.edges.some(e => e.unconsumed === null);
  side.innerHTML =
    '<h4>CFR field</h4>' +
    ['coherence','friction','resonance','entropy'].map(k =>
      '<div class="kv"><span>' + k + '</span><b>' + (cfr[k] !== undefined ? Number(cfr[k]).toFixed(4) : '—') + '</b></div>').join('') +
    '<div class="kv"><span>regime</span><b>' + esc(cfr.regime || '—') + '</b></div>' +
    '<h4>Graph</h4>' +
    '<div class="kv"><span>nodes</span><b>' + g.nodes.length + '</b></div>' +
    '<div class="kv"><span>producer edges</span><b>' + g.edges.length + '</b></div>' +
    '<div class="kv"><span>edges drawn</span><b>' + drawn + '</b></div>' +
    '<div class="kv"><span>events sampled</span><b>' + g.eventsSampled + '</b></div>' +
    '<h4>RAID trails</h4>' +
    '<div class="kv"><span>persisted trails</span><b>' + (g.trailsObserved ? g.trails.length : '—') + '</b></div>' +
    (g.trails && g.trails.length
      ? g.trails.slice(0, 8).map(t =>
          '<div class="kv"><span>' + esc((t.intent || '?').slice(0, 22)) + '</span><b>' +
          esc(t.status) + ' · ' + t.hops + 'h · ' + t.elapsedMs + 'ms</b></div>').join('')
      : '<div class="bnote">' + esc(g.notes.raidTrails) + '</div>') +
    (unknownConsumers
      ? '<div class="bnote">Consumer counts UNKNOWN — no process has published its bus subscriptions yet, so no producer→consumer edge can be drawn. This is "not observed", not "nothing consumes these". cortex and orchestrator publish on boot.</div>'
      : '');

  // Animate REAL persisted trails along the node ring. Each pulse walks the
  // actual hop sequence with the actual recorded systems — if a hop's system
  // is not a node on this graph it is SKIPPED rather than invented, so a pulse
  // never travels an edge that was not observed.
  animateTrails(g, pos, svg);
}

function animateTrails(g, pos, svg) {
  if (!g.trails || !g.trails.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  // Colour by real CFR regime — not a decorative palette.
  const regime = (g.cfr && g.cfr.regime) || '';
  const colour = regime === 'collapsing' ? 'var(--err)'
               : regime === 'stressed'  ? 'var(--warn)'
               : 'var(--acc)';
  let i = 0;
  const fire = () => {
    const t = g.trails[i % g.trails.length];
    i++;
    const hops = (t.path || []).map(h => pos[h.system]).filter(Boolean);
    if (hops.length >= 2) {
      for (let k = 0; k < hops.length - 1; k++) {
        const a = hops[k], b = hops[k + 1];
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', t.status === 'failed' || t.status === 'no_route' ? 'var(--err)' : colour);
        svg.appendChild(dot);
        const t0 = performance.now(), dur = 700, delay = k * 700;
        const step = (now) => {
          const p = Math.max(0, Math.min(1, (now - t0 - delay) / dur));
          dot.setAttribute('cx', a.x + (b.x - a.x) * p);
          dot.setAttribute('cy', a.y + (b.y - a.y) * p);
          dot.setAttribute('opacity', String(1 - p * 0.7));
          if (p < 1) requestAnimationFrame(step); else dot.remove();
        };
        requestAnimationFrame(step);
      }
    }
    if (i < 400) setTimeout(fire, 900);
  };
  fire();
}

function showNode(n, g) {
  const out = g.edges.filter(e => e.source === n.id).slice(0, 12);
  const side = $('bside');
  side.insertAdjacentHTML('afterbegin',
    '<h4>' + esc(n.id) + '</h4>' +
    '<div class="kv"><span>publishes subs</span><b>' + (n.publishes ? 'yes' + (n.stale ? ' (stale)' : '') : 'no') + '</b></div>' +
    '<div class="kv"><span>subscription types</span><b>' + n.subscriptionTypes + '</b></div>' +
    '<div class="kv"><span>listeners</span><b>' + n.listeners + '</b></div>' +
    '<div class="kv"><span>events emitted</span><b>' + n.emitted + '</b></div>' +
    (out.length ? '<h4>emits</h4>' + out.map(e =>
      '<div class="kv"><span>' + esc(e.type.slice(0, 26)) + '</span><b>' + e.weight +
      (e.unconsumed === null ? ' <span style="color:var(--dim)">?</span>' : e.unconsumed ? ' <span style="color:var(--warn)">void</span>' : '') +
      '</b></div>').join('') : ''));
}

loadSystems().catch(e => { conn.textContent = `✗ autopilot :${PORT} unreachable — ${e.message}`; conn.className = 'bad'; });
</script>
</body>
</html>