'use strict';
/**
 * renderer/settings/sections/mesh.js — Agent mesh + Automation
 * §BUILT 2026-09-23. Mesh: IPC mesh:list (registry, live agents with their
 * accountId/health/constraints, queue depth) plus the wire's real
 * /agent-mesh/spawn, /agent-mesh/route and /agent-mesh/routes. Automation:
 * the wire's /automation/workflows CRUD + per-step editor over
 * src/mesh/automation-engine.js's five real step types (trigger, agent,
 * delay, condition, command) — the same backend BrainOS's Automation tab
 * uses, not a second engine (§10.3).
 */
(function () {
  const { cg, h, call, wire, toast, busy, modal, confirmDo, field, pane, row, btn, chip, empty, ago, select, section } = window.CGS;

  // Each wire-backed pane fails on its own, loudly, instead of taking the page down.
  async function wirePane(title, build) {
    try { return await build(); }
    catch (e) { return pane({ title, body: h('div', { class: 'err-box' }, h('span', { text: e.message })) }); }
  }

  section({
    id: 'mesh', group: 'Agents', icon: '\u2B21', label: 'Agent mesh',
    keywords: 'mesh spawn route pipeline feedback queue health constraints raid',
    blurb: 'The agents Clear Glass can drive in their own background tabs, what\u2019s running now, and the routes that pass one agent\u2019s answer to another.',
    async render({ rerender }) {
      const m = await call(() => cg.mesh.list(), 'mesh');
      const [accounts, defaults] = await Promise.all([cg.accounts.list().catch(() => []), cg.accounts.defaults().catch(() => ({}))]);
      const label = (id) => { const a = accounts.find(x => x.id === id); return a ? a.label : (id ? id.slice(0, 8) + '…' : 'default'); };

      const registry = pane({ title: 'Agents', sub: `${m.registry.length} available \u00B7 ${m.queueDepth} queued`, flush: true, body: m.registry.map(a => {
        const r = row(a.name, a.url, chip(defaults[a.id] ? `default: ${label(defaults[a.id])}` : 'no default account', defaults[a.id] ? 'ok' : 'plain'),
          btn('Open tab', (e) => busy(e.currentTarget, async () => { const r = await wire('/agent-mesh/spawn', { method: 'POST', body: { agentKey: a.id } }); toast(`${a.name} tab ready (${r.contextId})`); rerender(); }), 'sm'));
        r.style.setProperty('--prov', a.color || 'var(--cyan)'); r.prepend(h('span', { class: 'dot' })); return r;
      }) });

      const live = pane({ title: 'Running now', flush: true, body: m.agents.length ? m.agents.map(s => row(
        `${s.key} \u00B7 ${label(s.accountId)}`, `${s.contextId} \u00B7 ${s.taskCount} tasks \u00B7 last used ${ago(s.lastUsed)}${s.constraints ? ` \u00B7 ${JSON.stringify(s.constraints)}` : ''}`,
        chip(s.status, s.status === 'error' ? 'bad' : s.status === 'working' ? 'warn' : 'ok'), chip(`health ${s.health}`, s.health > 60 ? 'ok' : 'warn'))) : empty('No mesh agents running. Open a tab above or dispatch through Guardian.') });

      const promptIn = h('textarea', { rows: 3, placeholder: 'Ask the mesh something \u2014 it routes to the healthiest agent' });
      const prefer = select([{ value: '', label: 'Any agent' }, ...m.registry.map(a => ({ value: a.id, label: a.name }))], '');
      const outBox = h('pre', { class: 'out', hidden: true });
      const tryIt = pane({ title: 'Try a dispatch', body: [
        field('Prompt', promptIn), h('div', { class: 'grid', style: { marginTop: '10px' } }, field('Prefer', prefer)),
        h('div', { style: { marginTop: '10px' } }, btn('Send through the mesh', (e) => busy(e.currentTarget, async () => {
          if (!promptIn.value.trim()) throw new Error('Write a prompt first.');
          const r = await wire('/agent-mesh/route', { method: 'POST', body: { prompt: promptIn.value, preferAgent: prefer.value || undefined } });
          outBox.hidden = false; outBox.textContent = JSON.stringify(r, null, 2);
        }), 'primary')), outBox] });

      const routes = await wirePane('Routes', async () => {
        const r = await wire('/agent-mesh/routes');
        const names = Object.fromEntries(m.registry.map(a => [a.id, a.name]));
        const add = btn('Add route', async () => {
          const opts = m.registry.map(a => ({ value: a.id, label: a.name }));
          const from = select(opts), to = select(opts), sys = h('textarea', { rows: 2, placeholder: 'Optional: instructions for the receiving agent' });
          const ok = await modal({ title: 'New route', body: [h('div', { class: 'grid' }, field('When this agent answers', from), field('Send the answer to', to)), field('System prompt', sys)],
            actions: [{ label: 'Add route', primary: true, run: () => wire('/agent-mesh/routes', { method: 'POST', body: { from: from.value, to: to.value, systemPrompt: sys.value.trim() || undefined } }) }] });
          if (ok) { toast('Route added'); rerender(); }
        }, 'sm');
        return pane({ title: 'Routes', sub: 'Same agent on both ends makes a feedback loop.', tools: add, flush: true,
          body: r.routes.length ? r.routes.map(rt => row(`${names[rt.from] || rt.from} \u2192 ${names[rt.to] || rt.to}`, rt.systemPrompt || 'passes the answer through unchanged', chip(rt.kind, 'plain'),
            btn('Delete', async () => { if (await confirmDo('Delete route?', `${rt.from} will stop passing answers to ${rt.to}.`, 'Delete')) { await busy(null, () => wire(`/agent-mesh/routes/${rt.id}`, { method: 'DELETE' })); rerender(); } }, 'sm danger')))
            : empty('No routes. Add one to chain agents into a pipeline.') });
      });
      return [registry, live, tryIt, routes];
    },
  });

  // ── Automation ─────────────────────────────────────────────────────────
  const STEP_TYPES = ['trigger', 'agent', 'delay', 'condition', 'command'];
  const SYSTEMS = ['guardian', 'ollama', 'copilot', 'clear-glass'];
  function stepSummary(s) {
    const c = s.config || {};
    switch (s.type) {
      case 'trigger':   return c.intervalMs ? `every ${Math.round(c.intervalMs / 1000)}s` : 'manual';
      case 'agent':     return `${c.agentKey || '?'}: ${(c.prompt || '').slice(0, 60)}`;
      case 'delay':     return `${c.ms || 1000} ms`;
      case 'condition': return `if ${c.var} ${c.op} ${c.value} \u2192 ${c.onTrue || 'next'} / ${c.onFalse || 'next'}`;
      case 'command':   return `${(c.method || 'GET').toUpperCase()} ${c.system}${c.endpoint || '/health'}`;
      default:          return JSON.stringify(c);
    }
  }
  async function stepEditor(registry, step) {
    const c = (step && step.config) || {};
    const type = select(STEP_TYPES, step ? step.type : 'agent');
    const box = h('div', { class: 'grid' });
    const inputs = {};
    const I = (k, el) => (inputs[k] = el);
    const draw = () => {
      box.replaceChildren();
      const t = type.value;
      if (t === 'trigger') box.append(field('Run every (seconds, blank = manual only)', I('interval', h('input', { type: 'number', min: 0, value: c.intervalMs ? c.intervalMs / 1000 : '' }))));
      if (t === 'agent') box.append(field('Agent', I('agentKey', select(registry.map(a => ({ value: a.id, label: a.name })), c.agentKey))), field('Prompt', I('prompt', h('textarea', { rows: 3, value: c.prompt || '' }))));
      if (t === 'delay') box.append(field('Wait (ms, max 300000)', I('ms', h('input', { type: 'number', min: 0, max: 300000, value: c.ms || 1000 }))));
      if (t === 'condition') box.append(field('Mesh value', I('var', h('input', { type: 'text', value: c.var || '', placeholder: 'e.g. queueDepth' }))),
        field('Is', I('op', select(['==', '!=', '>', '<', '>=', '<='], c.op || '=='))), field('Value', I('value', h('input', { type: 'text', value: c.value ?? '' }))),
        field('If true, go to step id', I('onTrue', h('input', { type: 'text', value: c.onTrue || '', placeholder: 'next' }))), field('If false, go to step id', I('onFalse', h('input', { type: 'text', value: c.onFalse || '', placeholder: 'next' }))));
      if (t === 'command') box.append(field('System', I('system', select(SYSTEMS, c.system || 'guardian'))), field('Method', I('method', select(['GET', 'POST'], (c.method || 'GET').toUpperCase()))),
        field('Endpoint', I('endpoint', h('input', { type: 'text', value: c.endpoint || '/health' }))), field('Body (JSON, POST only)', I('body', h('textarea', { rows: 2, value: c.body || '' }))));
    };
    type.addEventListener('change', draw); draw();
    return modal({ title: step ? 'Edit step' : 'Add step', body: [field('Step type', type), box], actions: [{ label: step ? 'Save step' : 'Add step', primary: true, run: () => {
      const v = (k) => inputs[k] && inputs[k].value;
      const t = type.value, cfg = {};
      if (t === 'trigger' && v('interval')) cfg.intervalMs = Math.round(parseFloat(v('interval')) * 1000);
      if (t === 'agent') { cfg.agentKey = v('agentKey'); cfg.prompt = v('prompt'); if (!cfg.prompt.trim()) throw new Error('An agent step needs a prompt.'); }
      if (t === 'delay') cfg.ms = parseInt(v('ms'), 10) || 1000;
      if (t === 'condition') { Object.assign(cfg, { var: v('var'), op: v('op'), value: v('value'), onTrue: v('onTrue') || undefined, onFalse: v('onFalse') || undefined }); if (!cfg.var) throw new Error('Pick the mesh value to compare.'); }
      if (t === 'command') { Object.assign(cfg, { system: v('system'), method: v('method'), endpoint: v('endpoint') || '/health' }); if (v('body').trim()) { JSON.parse(v('body')); cfg.body = v('body'); } }
      return { type: t, config: cfg };
    } }] });
  }

  section({
    id: 'automation', group: 'Agents', icon: '\u21BB', label: 'Automation',
    keywords: 'workflow trigger schedule step condition delay command tasker',
    blurb: 'Workflows that run agent prompts, waits, checks and NEXUS calls on a schedule or on demand.',
    async render({ tools, rerender }) {
      const [wf, m] = await Promise.all([wire('/automation/workflows'), call(() => cg.mesh.list(), 'mesh')]);
      tools.append(btn('New workflow', async () => {
        const name = h('input', { type: 'text', placeholder: 'Morning digest' });
        const r = await modal({ title: 'New workflow', body: [field('Name', name)], actions: [{ label: 'Create workflow', primary: true, run: () => {
          if (!name.value.trim()) throw new Error('Name it first.');
          return wire('/automation/workflows', { method: 'POST', body: { name: name.value.trim(), status: 'paused', steps: [] } });
        } }] });
        // Steps get their ids from the engine's own addStep(), never minted here.
        if (r && r.workflow) await wire(`/automation/workflows/${r.workflow.id}/steps`, { method: 'POST', body: { type: 'trigger', config: {} } }).catch(e => toast(`Workflow created, trigger step not added: ${e.message}`, 'warn'));
        if (r) { toast('Workflow created — add steps, then set it active'); rerender(); }
      }, 'primary'));

      const panes = wf.workflows.map(w => {
        const steps = (w.steps || []).map((s, i) => h('div', { class: 'step' },
          h('span', { class: 'n', text: String(i + 1) }), chip(s.type, 'plain'),
          h('span', { style: { gridColumn: 'span 2' }, class: 'blurb', text: stepSummary(s) }),
          h('div', { class: 'acts', style: { display: 'flex', gap: '4px' } },
            btn('\u2191', () => busy(null, async () => { await wire(`/automation/workflows/${w.id}/steps/${s.id}/move`, { method: 'POST', body: { dir: 'up' } }); rerender(); }), 'sm ghost'),
            btn('\u2193', () => busy(null, async () => { await wire(`/automation/workflows/${w.id}/steps/${s.id}/move`, { method: 'POST', body: { dir: 'down' } }); rerender(); }), 'sm ghost'),
            btn('Edit', async () => { const st = await stepEditor(m.registry, s); if (st) { await busy(null, () => wire(`/automation/workflows/${w.id}/steps/${s.id}`, { method: 'PATCH', body: st })); rerender(); } }, 'sm'),
            btn('\u2715', () => busy(null, async () => { await wire(`/automation/workflows/${w.id}/steps/${s.id}`, { method: 'DELETE' }); rerender(); }), 'sm ghost'))));
        const active = w.status === 'active';
        return pane({ title: w.name, sub: `${(w.steps || []).length} steps \u00B7 ${w.runCount || 0} runs \u00B7 last ${ago(w.lastRun)}`,
          tools: h('div', { style: { display: 'flex', gap: '6px' } },
            chip(w.status || 'paused', active ? 'ok' : 'plain'),
            btn(active ? 'Pause' : 'Set active', () => busy(null, async () => { await wire(`/automation/workflows/${w.id}`, { method: 'PATCH', body: { status: active ? 'paused' : 'active' } }); rerender(); }), 'sm'),
            btn('Run now', (e) => busy(e.currentTarget, async () => { await wire(`/automation/workflows/${w.id}/run`, { method: 'POST' }); toast(`Ran “${w.name}”`); rerender(); }), 'sm primary'),
            btn('Delete', async () => { if (await confirmDo(`Delete “${w.name}”?`, 'The workflow and its steps are removed.', 'Delete')) { await busy(null, () => wire(`/automation/workflows/${w.id}`, { method: 'DELETE' })); rerender(); } }, 'sm danger')),
          body: [h('div', { class: 'steps' }, steps), h('div', { style: { marginTop: '10px' } }, btn('Add step', async () => {
            const st = await stepEditor(m.registry, null);
            if (st) { await busy(null, () => wire(`/automation/workflows/${w.id}/steps`, { method: 'POST', body: st })); rerender(); }
          }, 'sm'))] });
      });

      const log = await wire('/automation/log').catch(e => ({ log: [], error: e.message }));
      const entries = (log.log || []).slice(0, 40); // engine keeps newest first
      return [
        ...(panes.length ? panes : [pane({ title: 'No workflows yet', body: h('p', { class: 'blurb', text: 'Create one to schedule agent prompts, waits, checks and NEXUS calls.' }) })]),
        pane({ title: 'Recent runs', body: log.error ? h('div', { class: 'err-box', text: log.error }) : entries.length ? h('pre', { class: 'out', text: entries.map(e => `${new Date(e.ts).toLocaleString()}  ${e.status || ''}  ${e.workflowName || e.workflowId}: ${e.msg}`).join('\n') }) : h('p', { class: 'blurb', text: 'Nothing has run yet.' }) }),
      ];
    },
  });
})();
